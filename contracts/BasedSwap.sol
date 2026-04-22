// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBaseQuestCore {
    function isRegistered(address user) external view returns (bool);
    function getUserXP(address user) external view returns (uint256);
    function awardXPFromPartner(address user, uint256 xp) external;
}

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function decimals() external view returns (uint8);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

library SafeERC20 {
    function safeTransferFrom(IERC20 token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.transferFrom.selector, from, to, amount)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "SafeERC20: transferFrom failed"
        );
    }

    function safeTransfer(IERC20 token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.transfer.selector, to, amount)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "SafeERC20: transfer failed"
        );
    }
}

interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24  fee;
        address recipient;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

contract BasedSwap {

    using SafeERC20 for IERC20;

    // ── Constants ──────────────────────────────────────────────────────────
    address public constant UNISWAP_ROUTER  = 0x2626664c2603336E57B271c5C0b26F421741e481;
    address public constant WETH            = 0x4200000000000000000000000000000000000006;
    uint256 public constant PLATFORM_FEE_BP = 50;  // 0.5%
    uint256 public constant BASE_XP         = 100;

    // ── State ──────────────────────────────────────────────────────────────
    address public contractOwner;
    address public coreContract;
    uint256 public rewardPool;
    uint256 public totalSwaps;

    mapping(address => uint256) public userSwapCount;
    mapping(address => uint256) public userTotalXPEarned;
    mapping(address => uint256) public userTotalVolumeWei;

    // ── Events ─────────────────────────────────────────────────────────────
    event SwapExecuted(
        address indexed user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 platformFee,
        uint256 xpEarned,
        uint256 multiplier
    );
    event RewardPoolWithdrawn(address indexed owner, uint256 amount);

    // ── Modifiers ──────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == contractOwner, "BasedSwap: not owner");
        _;
    }

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address _coreContract) {
        contractOwner = msg.sender;
        coreContract  = _coreContract;
    }

    // ── XP Multiplier ──────────────────────────────────────────────────────
    function getMultiplier(address user) public view returns (uint256) {
        uint256 xp = IBaseQuestCore(coreContract).getUserXP(user);
        if (xp >= 50000) return 300; // 3x
        if (xp >= 20000) return 200; // 2x
        if (xp >= 10000) return 150; // 1.5x
        return 100;                  // 1x
    }

    function getXPForSwap(address user) public view returns (uint256) {
        return (BASE_XP * getMultiplier(user)) / 100;
    }

    // ── ETH → Token ────────────────────────────────────────────────────────
    function swapETHForToken(
        address tokenOut,
        uint256 amountOutMinimum,
        uint24  poolFee
    ) external payable returns (uint256 amountOut) {
        require(msg.value > 0, "BasedSwap: no ETH sent");

        uint256 platformFee = (msg.value * PLATFORM_FEE_BP) / 10000;
        uint256 swapAmount  = msg.value - platformFee;

        _distributeFeeETH(platformFee);

        amountOut = ISwapRouter(UNISWAP_ROUTER).exactInputSingle{value: swapAmount}(
            ISwapRouter.ExactInputSingleParams({
                tokenIn:           WETH,
                tokenOut:          tokenOut,
                fee:               poolFee,
                recipient:         msg.sender,
                amountIn:          swapAmount,
                amountOutMinimum:  amountOutMinimum,
                sqrtPriceLimitX96: 0
            })
        );

        uint256 xpEarned   = getXPForSwap(msg.sender);
        uint256 multiplier = getMultiplier(msg.sender);
        _awardXP(msg.sender, xpEarned);
        _updateStats(msg.sender, xpEarned, msg.value);

        emit SwapExecuted(msg.sender, WETH, tokenOut, msg.value, amountOut, platformFee, xpEarned, multiplier);
    }

    // ── Token → ETH ────────────────────────────────────────────────────────
    function swapTokenForETH(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint24  poolFee
    ) external returns (uint256 amountOut) {
        require(amountIn > 0, "BasedSwap: zero amount");

        // Pull tokens — frontend already approved
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Approve router to spend tokens
        IERC20(tokenIn).approve(UNISWAP_ROUTER, amountIn);

        // Swap Token → WETH — contract receives WETH
        amountOut = ISwapRouter(UNISWAP_ROUTER).exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn:           tokenIn,
                tokenOut:          WETH,
                fee:               poolFee,
                recipient:         address(this),
                amountIn:          amountIn,
                amountOutMinimum:  amountOutMinimum,
                sqrtPriceLimitX96: 0
            })
        );

        // ✅ Unwrap WETH → ETH
        IWETH(WETH).withdraw(amountOut);

        // Deduct platform fee from ETH
        uint256 platformFee = (amountOut * PLATFORM_FEE_BP) / 10000;
        uint256 userAmount  = amountOut - platformFee;

        // Distribute fee
        _distributeFeeETH(platformFee);

        // Send ETH to user
        (bool sent, ) = payable(msg.sender).call{value: userAmount}("");
        require(sent, "BasedSwap: ETH send failed");

        uint256 xpEarned   = getXPForSwap(msg.sender);
        uint256 multiplier = getMultiplier(msg.sender);
        _awardXP(msg.sender, xpEarned);
        _updateStats(msg.sender, xpEarned, userAmount);

        emit SwapExecuted(msg.sender, tokenIn, WETH, amountIn, amountOut, platformFee, xpEarned, multiplier);
    }

    // ── Token → Token ──────────────────────────────────────────────────────
    function swapTokenForToken(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint24  poolFee
    ) external returns (uint256 amountOut) {
        require(amountIn > 0, "BasedSwap: zero amount");

        // Pull tokens — frontend already approved
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Deduct platform fee in tokenIn — kept in contract
        uint256 platformFeeTokens = (amountIn * PLATFORM_FEE_BP) / 10000;
        uint256 swapAmount        = amountIn - platformFeeTokens;

        // Approve router for swap amount only
        IERC20(tokenIn).approve(UNISWAP_ROUTER, swapAmount);

        // Swap Token → Token
        amountOut = ISwapRouter(UNISWAP_ROUTER).exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn:           tokenIn,
                tokenOut:          tokenOut,
                fee:               poolFee,
                recipient:         msg.sender,
                amountIn:          swapAmount,
                amountOutMinimum:  amountOutMinimum,
                sqrtPriceLimitX96: 0
            })
        );

        uint256 xpEarned   = getXPForSwap(msg.sender);
        uint256 multiplier = getMultiplier(msg.sender);
        _awardXP(msg.sender, xpEarned);
        _updateStats(msg.sender, xpEarned, 0);

        emit SwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut, platformFeeTokens, xpEarned, multiplier);
    }

    // ── Internal ───────────────────────────────────────────────────────────
    function _distributeFeeETH(uint256 fee) internal {
        if (fee == 0) return;
        uint256 ownerCut = fee / 5;
        uint256 poolCut  = fee - ownerCut;
        rewardPool += poolCut;
        if (ownerCut > 0) {
            (bool sent, ) = payable(contractOwner).call{value: ownerCut}("");
            require(sent, "BasedSwap: owner fee failed");
        }
    }

    function _awardXP(address user, uint256 xp) internal {
        try IBaseQuestCore(coreContract).awardXPFromPartner(user, xp) {
        } catch {
            // Silently fail — swap still succeeds
        }
    }

    function _updateStats(address user, uint256 xp, uint256 volumeWei) internal {
        userSwapCount[user]      += 1;
        userTotalXPEarned[user]  += xp;
        userTotalVolumeWei[user] += volumeWei;
        totalSwaps               += 1;
    }

    // ── View Functions ─────────────────────────────────────────────────────
    function getUserStats(address user) external view returns (
        uint256 swapCount,
        uint256 totalXPEarned,
        uint256 totalVolumeETH,
        uint256 currentMultiplier,
        uint256 nextSwapXP
    ) {
        return (
            userSwapCount[user],
            userTotalXPEarned[user],
            userTotalVolumeWei[user],
            getMultiplier(user),
            getXPForSwap(user)
        );
    }

    function getRewardPool() external view returns (uint256) { return rewardPool; }
    function getTotalSwaps() external view returns (uint256) { return totalSwaps; }

    // ── Owner Functions ────────────────────────────────────────────────────
    function withdrawRewardPool() external onlyOwner {
        uint256 amount = rewardPool;
        require(amount > 0, "BasedSwap: nothing to withdraw");
        rewardPool = 0;
        (bool sent, ) = payable(contractOwner).call{value: amount}("");
        require(sent, "BasedSwap: withdraw failed");
        emit RewardPoolWithdrawn(contractOwner, amount);
    }

    function withdrawTokenFees(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "BasedSwap: no token balance");
        IERC20(token).safeTransfer(contractOwner, balance);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "BasedSwap: zero address");
        contractOwner = newOwner;
    }

    function updateCoreContract(address newCore) external onlyOwner {
        require(newCore != address(0), "BasedSwap: zero address");
        coreContract = newCore;
    }

    receive() external payable {}
}
