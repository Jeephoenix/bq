// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BaseQuestGreeter
/// @notice Tiny on-chain greeter deployed by users via the GM Base / Deploy Contract quests.
contract BaseQuestGreeter {
    address public deployer;
    string  public greeting;
    uint256 public deployedAt;

    event Greeted(address indexed deployer, string greeting);

    constructor(address _deployer, string memory _greeting) {
        deployer   = _deployer;
        greeting   = _greeting;
        deployedAt = block.timestamp;
        emit Greeted(_deployer, _greeting);
    }
}

/// @title BaseQuestCore (v2)
/// @notice Quest engine — XP, daily tasks, leaderboard, partner XP, migration & on-chain GM/Deploy quests.
contract BaseQuestCore {
    address public contractOwner;
    uint256 public rewardPool;
    uint256[6] public levelThresholds = [0, 500, 1500, 3500, 7500, 15000];

    uint256 public constant QUEST_FEE = 0.00005 ether;

    uint256 constant BIT_GM           = 1 << 0;
    uint256 constant BIT_DEPLOY       = 1 << 1;
    uint256 constant BIT_SWAP         = 1 << 2;
    uint256 constant BIT_BRIDGE       = 1 << 3;
    uint256 constant BIT_GAME         = 1 << 4;
    uint256 constant BIT_SWAP_AERO    = 1 << 5;
    uint256 constant BIT_SWAP_UNI     = 1 << 6;
    uint256 constant BIT_SWAP_JUMP    = 1 << 7;
    uint256 constant BIT_SWAP_RELAY   = 1 << 8;
    uint256 constant BIT_BRIDGE_JUMP  = 1 << 9;
    uint256 constant BIT_BRIDGE_RELAY = 1 << 10;
    uint256 constant BIT_DEPLOY_REMIX = 1 << 11;

    struct UserProfile {
        uint256 totalXP;
        string  username;
        bool    usernameSet;
        uint256 tasksCompleted;
        uint256 joinedAt;
        uint256 lastActivityDay;
        uint256 streakCount;
    }

    struct DailyTask {
        uint256 bits;
        uint256 day;
    }

    mapping(address => UserProfile) public profiles;
    mapping(address => DailyTask)   public dailyTasks;
    mapping(address => bool)        public profileTaskDone;
    mapping(address => bool)        public isRegistered;
    mapping(address => bool)        public isPartnerContract;
    address[] public allUsers;

    // ── On-chain GM + Deploy artefacts ────────────────────────────────────
    mapping(address => string)   public lastGM;
    mapping(address => uint256)  public lastGMAt;
    mapping(address => address)  public lastDeployedContract;
    mapping(address => uint256)  public deployCount;

    event TaskCompleted(address indexed user, string taskType, uint256 xpEarned, uint256 timestamp);
    event UsernameSet(address indexed user, string username);
    event StreakBonusAwarded(address indexed user, uint256 streak, uint256 xpEarned);
    event XPAwarded(address indexed user, uint256 amount, uint256 newTotal);
    event GMPosted(address indexed user, string message, uint256 timestamp);
    event ContractDeployed(address indexed user, address indexed deployed, string greeting, uint256 timestamp);
    event UserMigrated(address indexed user, uint256 totalXP, uint256 tasksCompleted, uint256 streakCount);

    modifier onlyOwner()  { require(msg.sender == contractOwner, "BaseQuestCore: not owner"); _; }
    modifier registered() { if (!isRegistered[msg.sender]) _registerUser(msg.sender); _; }

    constructor() { contractOwner = msg.sender; }

    function _today() internal view returns (uint256) { return block.timestamp / 86400; }

    function _registerUser(address user) internal {
        if (isRegistered[user]) return;
        isRegistered[user] = true;
        allUsers.push(user);
        if (profiles[user].joinedAt == 0) profiles[user].joinedAt = block.timestamp;
    }

    function _resetDailyIfNeeded(address user) internal {
        if (dailyTasks[user].day != _today()) {
            dailyTasks[user].bits = 0;
            dailyTasks[user].day  = _today();
        }
    }

    function _isDone(address user, uint256 bit) internal view returns (bool) {
        return (dailyTasks[user].bits & bit) != 0;
    }

    function _setDone(address user, uint256 bit) internal {
        dailyTasks[user].bits |= bit;
    }

    /// @dev Default fee split: 20 % to owner, 80 % into rewardPool (boss-raid economics).
    function _awardXPAndDistribute(address user, uint256 xp, string memory taskType) internal {
        uint256 ownerCut = msg.value / 5;
        rewardPool += msg.value - ownerCut;
        if (ownerCut > 0) {
            (bool sent, ) = payable(contractOwner).call{value: ownerCut}("");
            require(sent, "BaseQuestCore: owner transfer failed");
        }
        _awardXPOnly(user, xp, taskType);
    }

    /// @dev Deploy-quest fee path: 100 % of msg.value forwarded to the contract owner.
    function _awardXPOwnerOnly(address user, uint256 xp, string memory taskType) internal {
        if (msg.value > 0) {
            (bool sent, ) = payable(contractOwner).call{value: msg.value}("");
            require(sent, "BaseQuestCore: owner transfer failed");
        }
        _awardXPOnly(user, xp, taskType);
    }

    function _awardXPOnly(address user, uint256 xp, string memory taskType) internal {
        uint256 today = _today();
        UserProfile storage p = profiles[user];
        if (p.lastActivityDay == 0)              { p.streakCount = 1; }
        else if (today == p.lastActivityDay + 1) { p.streakCount += 1; }
        else if (today > p.lastActivityDay + 1)  { p.streakCount = 1; }
        p.lastActivityDay = today;

        if (p.streakCount > 0 && p.streakCount % 7 == 0) {
            p.totalXP += 200;
            emit StreakBonusAwarded(user, p.streakCount, 200);
        }
        p.totalXP        += xp;
        p.tasksCompleted += 1;
        emit XPAwarded(user, xp, p.totalXP);
        emit TaskCompleted(user, taskType, xp, block.timestamp);
    }

    // ── Main tasks ────────────────────────────────────────────────────────

    /// @notice Post an on-chain "GM Base" message and earn XP.
    /// @param  message Optional message body (defaults to "GM Base!" if empty). Max 140 chars.
    function completeGMTask(string calldata message) external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        require(bytes(message).length <= 140, "BaseQuestCore: message too long");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_GM), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_GM);

        string memory body = bytes(message).length == 0 ? "GM Base!" : message;
        lastGM[msg.sender]   = body;
        lastGMAt[msg.sender] = block.timestamp;
        emit GMPosted(msg.sender, body, block.timestamp);

        _awardXPAndDistribute(msg.sender, 50, "GM_BASE");
    }

    /// @notice Deploy a real on-chain BaseQuestGreeter contract and earn XP.
    /// @param  greeting Greeting baked into the deployed contract. Defaults to "GM Base!" if empty. Max 140 chars.
    /// @return deployed Address of the freshly deployed contract.
    function completeDeployTask(string calldata greeting) external payable registered returns (address deployed) {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        require(bytes(greeting).length <= 140, "BaseQuestCore: greeting too long");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_DEPLOY), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_DEPLOY);

        string memory body = bytes(greeting).length == 0 ? "GM Base!" : greeting;
        BaseQuestGreeter g = new BaseQuestGreeter(msg.sender, body);
        deployed = address(g);
        lastDeployedContract[msg.sender] = deployed;
        deployCount[msg.sender] += 1;
        emit ContractDeployed(msg.sender, deployed, body, block.timestamp);

        _awardXPOwnerOnly(msg.sender, 100, "DEPLOY_CONTRACT");
    }

    function completeSwapTask() external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_SWAP), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_SWAP);
        _awardXPAndDistribute(msg.sender, 75, "SWAP_BASE");
    }

    function completeBridgeTask() external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_BRIDGE), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_BRIDGE);
        _awardXPAndDistribute(msg.sender, 100, "BRIDGE_BASE");
    }

    function completeGameTask() external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_GAME), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_GAME);
        _awardXPAndDistribute(msg.sender, 75, "MINI_GAME");
    }

    function completeProfileTask(string calldata username) external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        require(!profileTaskDone[msg.sender], "BaseQuestCore: profile already set");
        require(bytes(username).length > 0, "BaseQuestCore: empty username");
        require(bytes(username).length <= 32, "BaseQuestCore: username too long");
        profileTaskDone[msg.sender] = true;
        profiles[msg.sender].username    = username;
        profiles[msg.sender].usernameSet = true;
        _awardXPAndDistribute(msg.sender, 50, "SET_PROFILE");
        emit UsernameSet(msg.sender, username);
    }

    // ── Swap sub-tasks ────────────────────────────────────────────────────

    function completeSwapAerodrome() external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_SWAP_AERO), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_SWAP_AERO);
        _awardXPAndDistribute(msg.sender, 50, "SWAP_AERODROME");
    }

    function completeSwapUniswap() external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_SWAP_UNI), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_SWAP_UNI);
        _awardXPAndDistribute(msg.sender, 50, "SWAP_UNISWAP");
    }

    function completeSwapJumper() external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_SWAP_JUMP), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_SWAP_JUMP);
        _awardXPAndDistribute(msg.sender, 50, "SWAP_JUMPER");
    }

    function completeSwapRelay() external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_SWAP_RELAY), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_SWAP_RELAY);
        _awardXPAndDistribute(msg.sender, 50, "SWAP_RELAY");
    }

    // ── Bridge sub-tasks ──────────────────────────────────────────────────

    function completeBridgeJumper() external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_BRIDGE_JUMP), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_BRIDGE_JUMP);
        _awardXPAndDistribute(msg.sender, 50, "BRIDGE_JUMPER");
    }

    function completeBridgeRelay() external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_BRIDGE_RELAY), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_BRIDGE_RELAY);
        _awardXPAndDistribute(msg.sender, 50, "BRIDGE_RELAY");
    }

    // ── Deploy sub-tasks ──────────────────────────────────────────────────

    function completeDeployRemix() external payable registered {
        require(msg.value == QUEST_FEE, "BaseQuestCore: incorrect payment");
        _resetDailyIfNeeded(msg.sender);
        require(!_isDone(msg.sender, BIT_DEPLOY_REMIX), "BaseQuestCore: already done today");
        _setDone(msg.sender, BIT_DEPLOY_REMIX);
        _awardXPAndDistribute(msg.sender, 50, "DEPLOY_REMIX");
    }

    // ── Partner XP ────────────────────────────────────────────────────────

    function setPartnerContract(address partner, bool status) external onlyOwner {
        isPartnerContract[partner] = status;
    }

    function awardXPFromPartner(address user, uint256 xp) external {
        require(isPartnerContract[msg.sender], "BaseQuestCore: not a partner");
        if (!isRegistered[user]) _registerUser(user);
        profiles[user].totalXP        += xp;
        profiles[user].tasksCompleted += 1;
        emit XPAwarded(user, xp, profiles[user].totalXP);
    }

    // ── Migration ─────────────────────────────────────────────────────────

    /// @notice Restore XP only (kept for backwards compatibility).
    function batchRestoreXP(
        address[] calldata users,
        uint256[] calldata xpAmounts
    ) external onlyOwner {
        require(users.length == xpAmounts.length, "BaseQuestCore: length mismatch");
        for (uint256 i = 0; i < users.length; i++) {
            _registerUser(users[i]);
            profiles[users[i]].totalXP = xpAmounts[i];
        }
    }

    /// @notice Full snapshot import from the previous BaseQuestCore.
    /// @dev    Idempotent — safe to re-run with the same data.
    function batchMigrateUsers(
        address[]  calldata users,
        uint256[]  calldata xps,
        uint256[]  calldata tasksCompletedArr,
        uint256[]  calldata streakArr,
        uint256[]  calldata lastActivityDayArr,
        uint256[]  calldata joinedAtArr,
        string[]   calldata usernames,
        bool[]     calldata profileDoneArr
    ) external onlyOwner {
        uint256 n = users.length;
        require(
            xps.length == n && tasksCompletedArr.length == n && streakArr.length == n &&
            lastActivityDayArr.length == n && joinedAtArr.length == n &&
            usernames.length == n && profileDoneArr.length == n,
            "BaseQuestCore: length mismatch"
        );
        for (uint256 i = 0; i < n; i++) {
            address u = users[i];
            _registerUser(u);
            UserProfile storage p = profiles[u];
            p.totalXP         = xps[i];
            p.tasksCompleted  = tasksCompletedArr[i];
            p.streakCount     = streakArr[i];
            p.lastActivityDay = lastActivityDayArr[i];
            p.joinedAt        = joinedAtArr[i] == 0 ? block.timestamp : joinedAtArr[i];
            if (bytes(usernames[i]).length > 0) {
                p.username    = usernames[i];
                p.usernameSet = true;
                emit UsernameSet(u, usernames[i]);
            }
            if (profileDoneArr[i]) profileTaskDone[u] = true;
            emit UserMigrated(u, xps[i], tasksCompletedArr[i], streakArr[i]);
        }
    }

    // ── View functions ────────────────────────────────────────────────────

    function getUserXP(address user) external view returns (uint256) { return profiles[user].totalXP; }

    function getUserLevel(address user) external view returns (uint256) {
        uint256 xp = profiles[user].totalXP;
        for (uint256 i = 5; i > 0; i--) { if (xp >= levelThresholds[i]) return i + 1; }
        return 1;
    }

    function getUserProfile(address user) external view returns (
        uint256 totalXP, string memory username, bool usernameSet,
        uint256 tasksCompleted, uint256 joinedAt, uint256 streakCount
    ) {
        UserProfile storage p = profiles[user];
        return (p.totalXP, p.username, p.usernameSet,
                p.tasksCompleted, p.joinedAt, p.streakCount);
    }

    function getDailyTasks(address user) external view returns (
        bool gmDone, bool deployDone, bool swapDone,
        bool bridgeDone, bool gameDone, bool profileDone
    ) {
        uint256 bits  = dailyTasks[user].bits;
        bool    today = (dailyTasks[user].day == _today());
        return (
            today && (bits & BIT_GM)     != 0,
            today && (bits & BIT_DEPLOY) != 0,
            today && (bits & BIT_SWAP)   != 0,
            today && (bits & BIT_BRIDGE) != 0,
            today && (bits & BIT_GAME)   != 0,
            profileTaskDone[user]
        );
    }

    function getSubTasks(address user) external view returns (
        bool swapAerodromeDone, bool swapUniswapDone,
        bool swapJumperDone,    bool swapRelayDone,
        bool bridgeJumperDone,  bool bridgeRelayDone,
        bool deployRemixDone
    ) {
        uint256 bits  = dailyTasks[user].bits;
        bool    today = (dailyTasks[user].day == _today());
        return (
            today && (bits & BIT_SWAP_AERO)    != 0,
            today && (bits & BIT_SWAP_UNI)     != 0,
            today && (bits & BIT_SWAP_JUMP)    != 0,
            today && (bits & BIT_SWAP_RELAY)   != 0,
            today && (bits & BIT_BRIDGE_JUMP)  != 0,
            today && (bits & BIT_BRIDGE_RELAY) != 0,
            today && (bits & BIT_DEPLOY_REMIX) != 0
        );
    }

    function getTotalUsers()             external view returns (uint256) { return allUsers.length; }
    function getUserStreak(address user) external view returns (uint256) { return profiles[user].streakCount; }
    function getLastGM(address user)     external view returns (string memory message, uint256 at) {
        return (lastGM[user], lastGMAt[user]);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "BaseQuestCore: zero address");
        contractOwner = newOwner;
    }

    /// @notice Withdraw any residual balance. Normally zero because fees go straight to owner.
    function withdrawRewardPool() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "BaseQuestCore: nothing to withdraw");
        rewardPool = 0;
        (bool sent, ) = payable(contractOwner).call{value: amount}("");
        require(sent, "BaseQuestCore: withdraw failed");
    }

    function getRewardPool() external view returns (uint256) { return rewardPool; }

    receive() external payable { revert("BaseQuestCore: direct ETH not accepted"); }
}
