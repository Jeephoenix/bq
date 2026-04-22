import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import {
  getBasedSwapContract, getERC20Contract,
  ADDRESSES, getReadProvider,
} from "../utils/contracts";

const WETH        = "0x4200000000000000000000000000000000000006";
const NATIVE      = "native";
const NATIVE_ADDR = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const USDT        = "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2";
const TW          = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/assets";

const STABLES = [
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
  "0x50c5725949a6f0c72e6c4a641f24049a917db0cb",
];

const ETH_TOKEN = {
  symbol:   "ETH",
  name:     "Ethereum",
  address:  NATIVE,
  decimals: 18,
  logoURI:  "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
};

const FALLBACK_TOKENS = [
  ETH_TOKEN,
  { symbol: "USDC", name: "USD Coin",      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6,  logoURI: `${TW}/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913/logo.png` },
  { symbol: "USDT", name: "Tether USD",     address: USDT,                                         decimals: 6,  logoURI: `${TW}/0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2/logo.png` },
  { symbol: "DAI",  name: "Dai Stablecoin", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18, logoURI: `${TW}/0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb/logo.png` },
  { symbol: "WETH", name: "Wrapped Ether",  address: WETH,                                         decimals: 18, logoURI: `${TW}/0x4200000000000000000000000000000000000006/logo.png` },
  { symbol: "AERO", name: "Aerodrome",      address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631", decimals: 18, logoURI: `${TW}/0x940181a94A35A4569E4529A3CDfB74e38FD98631/logo.png` },
  { symbol: "cbETH","name": "Coinbase ETH", address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", decimals: 18, logoURI: `${TW}/0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22/logo.png` },
  { symbol: "OFC",  name: "OFC",            address: "0x752C5a95d202972E124390F30a50154409d3c858", decimals: 18, logoURI: `${TW}/0x752C5a95d202972E124390F30a50154409d3c858/logo.png` },
];

const PCT_BUTTONS = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.50 },
  { label: "75%", value: 0.75 },
  { label: "MAX", value: 1.00 },
];

export default function BasedSwapDEX({ wallet, userProfile }) {
  const { signer, address, isConnected } = wallet;

  const [tokens,        setTokens]        = useState(FALLBACK_TOKENS);
  const [tokenIn,       setTokenIn]       = useState(NATIVE);
  const [tokenOut,      setTokenOut]      = useState("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
  const [amountIn,      setAmountIn]      = useState("");
  const [quote,         setQuote]         = useState(null);
  const [quoting,       setQuoting]       = useState(false);
  const [swapping,      setSwapping]      = useState(false);
  const [txHash,        setTxHash]        = useState(null);
  const [error,         setError]         = useState(null);
  const [slippage,      setSlippage]      = useState("1.0");
  const [userStats,     setUserStats]     = useState(null);
  const [ethBalance,    setEthBalance]    = useState("0");
  const [rawEthBal,     setRawEthBal]     = useState(0n);
  const [searchIn,      setSearchIn]      = useState("");
  const [searchOut,     setSearchOut]     = useState("");
  const [showDropIn,    setShowDropIn]    = useState(false);
  const [showDropOut,   setShowDropOut]   = useState(false);
  const [approving,     setApproving]     = useState(false);
  const [approveStep,   setApproveStep]   = useState(0);
  const [activePct,     setActivePct]     = useState(null);
  const [ethPrice,      setEthPrice]      = useState(0);
  const [tokenPrices,   setTokenPrices]   = useState({});
  const [tokenBalances, setTokenBalances] = useState({});
  const [loadingBals,   setLoadingBals]   = useState(false);

  const tokenListFetched = useRef(false);

  const totalXP    = userProfile?.totalXP || 0;
  const multiplier = totalXP >= 50000 ? 3 : totalXP >= 20000 ? 2 : totalXP >= 10000 ? 1.5 : 1;
  const xpForSwap  = Math.floor(100 * multiplier);
  const isUSDT     = tokenIn.toLowerCase() === USDT.toLowerCase();
  const maxSteps   = isUSDT ? 3 : 2;

  const getTokenInfo = useCallback((addr) =>
    tokens.find(t => t.address?.toLowerCase() === addr?.toLowerCase()) || null,
  [tokens]);

  const tokenInInfo  = getTokenInfo(tokenIn);
  const tokenOutInfo = getTokenInfo(tokenOut);

  const currentBalance = tokenIn === NATIVE
    ? ethBalance
    : tokenBalances[tokenIn] !== undefined
    ? tokenBalances[tokenIn]
    : "0";

  const getPrice = useCallback((tokenAddress) => {
    if (!tokenAddress) return 0;
    if (tokenAddress === NATIVE)                            return ethPrice;
    if (tokenAddress.toLowerCase() === WETH.toLowerCase()) return ethPrice;
    if (STABLES.includes(tokenAddress.toLowerCase()))      return 1;
    return tokenPrices[tokenAddress.toLowerCase()] || 0;
  }, [ethPrice, tokenPrices]);

  const toUSD = useCallback((amount, tokenAddress) => {
    const price = getPrice(tokenAddress);
    if (!price || !amount || parseFloat(amount) === 0) return null;
    const usd = parseFloat(amount) * price;
    if (usd < 0.01) return "< $0.01";
    return "$" + usd.toFixed(2);
  }, [getPrice]);

  const balanceUSD = toUSD(currentBalance, tokenIn);

  const buttonLabel = () => {
    if (approving && approveStep === 1) return `⏳ Step 1/${maxSteps} — Resetting USDT approval...`;
    if (approving && approveStep === 2) return `⏳ Step ${isUSDT ? 2 : 1}/${maxSteps} — Approving token...`;
    if (swapping)                       return `⏳ Step ${maxSteps}/${maxSteps} — Swapping...`;
    if (quoting)                        return "Getting best quote...";
    if (!amountIn)                      return "Enter amount";
    if (!quote)                         return "No route found";
    return `💎 Swap & Earn +${xpForSwap} XP`;
  };

  // Load all token balances in batches
  const loadAllBalances = useCallback(async (tokenList = FALLBACK_TOKENS) => {
    if (!address || loadingBals) return;
    setLoadingBals(true);
    try {
      const provider      = getReadProvider();
      const ethBal        = await provider.getBalance(address);
      setRawEthBal(ethBal);
      setEthBalance(parseFloat(ethers.formatEther(ethBal)).toFixed(4));
      const bals          = { [NATIVE]: parseFloat(ethers.formatEther(ethBal)).toFixed(4) };
      const tokensToCheck = tokenList.filter(t => t.address !== NATIVE);
      const batchSize     = 50;
      for (let i = 0; i < tokensToCheck.length; i += batchSize) {
        const batch = tokensToCheck.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(async t => {
            try {
              const contract  = getERC20Contract(t.address, provider);
              const bal       = await contract.balanceOf(address);
              const formatted = parseFloat(ethers.formatUnits(bal, t.decimals)).toFixed(4);
              if (parseFloat(formatted) > 0) bals[t.address] = formatted;
            } catch {}
          })
        );
        setTokenBalances(prev => ({ ...prev, ...bals }));
      }
    } catch {}
    finally { setLoadingBals(false); }
  }, [address, loadingBals]);

  // Fetch full Base token list — only once, then load all prices
  const fetchTokenList = useCallback(async () => {
    if (tokenListFetched.current) return;
    tokenListFetched.current = true;
    try {
      const res  = await fetch("/api/swap-quote?type=tokens");
      const data = await res.json();
      const list = data?.tokens || data?.records || [];
      if (list.length === 0) return;
      const baseTokens = list.map(t => ({
        symbol:   t.symbol   || "",
        name:     t.name     || t.symbol || "",
        address:  t.address  || "",
        decimals: t.decimals || 18,
        logoURI:  t.logoURI  || "",
      })).filter(t => t.address && t.symbol);
      const fallbackAddresses = new Set(FALLBACK_TOKENS.map(t => t.address.toLowerCase()));
      const extras   = baseTokens.filter(t => !fallbackAddresses.has(t.address.toLowerCase()));
      extras.sort((a, b) => a.symbol.localeCompare(b.symbol));
      const fullList = [...FALLBACK_TOKENS, ...extras];
      setTokens(fullList);
      loadAllBalances(fullList);

      // Fetch prices for ALL tokens in batches of 100
      const allAddresses = fullList
        .filter(t =>
          t.address !== NATIVE &&
          !STABLES.includes(t.address.toLowerCase())
        )
        .map(t => t.address.toLowerCase());

      const priceBatchSize = 100;
      for (let i = 0; i < allAddresses.length; i += priceBatchSize) {
        const batch = allAddresses.slice(i, i + priceBatchSize).join(",");
        try {
          const priceRes  = await fetch(
            `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${batch}&vs_currencies=usd`
          );
          const priceData = await priceRes.json();
          const newPrices = {};
          for (const [addr, val] of Object.entries(priceData || {})) {
            if (val?.usd) newPrices[addr.toLowerCase()] = val.usd;
          }
          setTokenPrices(prev => ({ ...prev, ...newPrices }));
        } catch {}
        if (i + priceBatchSize < allAddresses.length) {
          await new Promise(r => setTimeout(r, 600));
        }
      }
    } catch {}
  }, [loadAllBalances]);

  // Load user stats
  const loadUserStats = useCallback(async () => {
    if (!address || !ADDRESSES.basedswap) return;
    try {
      const contract = getBasedSwapContract(getReadProvider());
      const stats    = await contract.getUserStats(address);
      setUserStats({
        swapCount:      Number(stats[0]),
        totalXPEarned:  Number(stats[1]),
        totalVolumeETH: parseFloat(ethers.formatEther(stats[2])).toFixed(4),
      });
    } catch (err) { console.warn("Stats load failed:", err.message); }
  }, [address]);

  // Fetch prices for fallback tokens + any extras
  const fetchPrices = useCallback(async (extraAddresses = []) => {
    try {
      const baseAddresses = FALLBACK_TOKENS
        .filter(t => t.address !== NATIVE && !STABLES.includes(t.address.toLowerCase()))
        .map(t => t.address.toLowerCase());
      const allAddresses = [
        ...new Set([...baseAddresses, ...extraAddresses.map(a => a.toLowerCase())])
      ].join(",");
      const [ethRes, tokenRes] = await Promise.all([
        fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"),
        fetch(`https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${allAddresses}&vs_currencies=usd`),
      ]);
      const ethData   = await ethRes.json();
      const tokenData = await tokenRes.json();
      const ethUSD    = ethData?.ethereum?.usd || 0;
      if (ethUSD > 0) setEthPrice(ethUSD);
      const priceMap  = {};
      for (const [addr, val] of Object.entries(tokenData || {})) {
        if (val?.usd) priceMap[addr.toLowerCase()] = val.usd;
      }
      if (ethUSD > 0) {
        priceMap[NATIVE]             = ethUSD;
        priceMap[WETH.toLowerCase()] = ethUSD;
      }
      setTokenPrices(prev => ({ ...prev, ...priceMap }));
    } catch {}
  }, []);

  useEffect(() => {
    if (!address) return;
    loadAllBalances();
    loadUserStats();
    fetchPrices();
    fetchTokenList();
  }, [address]); // eslint-disable-line

  // Fetch price on demand when tokenIn changes
  useEffect(() => {
    if (
      tokenIn !== NATIVE &&
      tokenIn.toLowerCase() !== WETH.toLowerCase() &&
      !STABLES.includes(tokenIn.toLowerCase()) &&
      !tokenPrices[tokenIn.toLowerCase()]
    ) {
      fetchPrices([tokenIn]);
    }
  }, [tokenIn, tokenPrices, fetchPrices]);

  // Handle percentage buttons
  const handlePct = (pct) => {
    setActivePct(pct);
    const inInfo = getTokenInfo(tokenIn);
    const dec    = inInfo?.decimals || 18;
    let rawBal   = rawEthBal;
    if (tokenIn !== NATIVE) {
      const balStr = tokenBalances[tokenIn] || "0";
      try { rawBal = ethers.parseUnits(balStr, dec); } catch { rawBal = 0n; }
    }
    if (tokenIn === NATIVE && pct === 1.0) {
      const gasBuf = ethers.parseEther("0.0005");
      rawBal = rawBal > gasBuf ? rawBal - gasBuf : 0n;
    }
    const pctBig    = BigInt(Math.round(pct * 10000));
    const amount    = (rawBal * pctBig) / 10000n;
    const formatted = parseFloat(ethers.formatUnits(amount, dec)).toFixed(6);
    setAmountIn(formatted);
  };

  // Get quote
  const getQuote = useCallback(async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) { setQuote(null); return; }
    setQuoting(true);
    setError(null);
    try {
      const inInfo    = getTokenInfo(tokenIn);
      const decimals  = inInfo?.decimals || 18;
      const amountWei = ethers.parseUnits(amountIn, decimals);
      const platformFee    = (amountWei * 50n) / 10000n;
      const swapAmount     = amountWei - platformFee;
      const platformFeeAmt = parseFloat(ethers.formatUnits(platformFee, decimals)).toFixed(6);
      const tIn  = tokenIn  === NATIVE ? NATIVE_ADDR : tokenIn;
      const tOut = tokenOut === NATIVE ? NATIVE_ADDR : tokenOut;
      const params = new URLSearchParams({
        sellToken:   tIn,
        buyToken:    tOut,
        sellAmount:  swapAmount.toString(),
        slippageBps: Math.round(parseFloat(slippage) * 100).toString(),
        taker:       address || "",
      });
      const res = await fetch(`/api/swap-quote?${params}`);
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.validationErrors?.[0]?.reason || e?.reason || e?.error || e?.message || "Quote failed");
      }
      const data    = await res.json();
      const outInfo = getTokenInfo(tokenOut);
      const outDec  = outInfo?.decimals || 18;
      if (!data?.buyAmount) throw new Error(data?.reason || data?.error || "No quote available");
      const amountOut       = parseFloat(ethers.formatUnits(data.buyAmount, outDec));
      const slippagePct     = parseFloat(slippage) / 100;
      const minOut          = amountOut * (1 - slippagePct);
      const minOutSafe      = Math.floor(minOut * Math.pow(10, outDec));
      const minOutFormatted = ethers.formatUnits(BigInt(minOutSafe), outDec);
      setQuote({
        amountOut:       amountOut.toFixed(6),
        minAmountOut:    parseFloat(minOutFormatted).toFixed(6),
        minAmountOutWei: BigInt(minOutSafe),
        platformFee:     platformFeeAmt,
        slippage:        slippage + "%",
        priceImpact:     data.estimatedPriceImpact ? parseFloat(data.estimatedPriceImpact).toFixed(2) + "%" : "< 0.1%",
        gasEstimate: (() => {
          const gas = data.gas || data.estimatedGas || data.gasEstimate || null;
          if (!gas) return "~";
          const gwei = (parseInt(gas) / 1e9).toFixed(4);
          return `~${parseInt(gas).toLocaleString()} units`;
        })(),
        poolFee:         3000,
      });
    } catch (err) {
      setError(err.message || "Failed to get quote");
      setQuote(null);
    } finally { setQuoting(false); }
  }, [amountIn, tokenIn, tokenOut, slippage, address, getTokenInfo]);

  useEffect(() => {
    const timer = setTimeout(() => { if (amountIn) getQuote(); }, 800);
    return () => clearTimeout(timer);
  }, [amountIn, tokenIn, tokenOut, slippage, getQuote]);

  // Smart approval
  const safeApprove = async (erc20, spender, amount) => {
    const allowance  = await erc20.allowance(address, spender);
    if (allowance >= amount) return;
    setApproving(true);
    setError(null);
    const needsReset = isUSDT && allowance > 0n;
    if (needsReset) {
      setApproveStep(1);
      const resetTx = await erc20.approve(spender, 0);
      await resetTx.wait();
    }
    setApproveStep(2);
    const approveTx = await erc20.approve(spender, amount);
    await approveTx.wait();
    setApproveStep(0);
    setApproving(false);
  };

  // Execute swap
  const executeSwap = async () => {
    if (!signer || !quote) return;
    setSwapping(false);
    setApproving(false);
    setError(null);
    setTxHash(null);
    try {
      const contract  = getBasedSwapContract(signer);
      const inInfo    = getTokenInfo(tokenIn);
      const decimals  = inInfo?.decimals || 18;
      const amountWei = ethers.parseUnits(amountIn, decimals);
      let tx;
      if (tokenIn === NATIVE) {
        setSwapping(true);
        tx = await contract.swapETHForToken(tokenOut, quote.minAmountOutWei, quote.poolFee, { value: amountWei });
      } else if (tokenOut === NATIVE) {
        const erc20 = getERC20Contract(tokenIn, signer);
        await safeApprove(erc20, ADDRESSES.basedswap, amountWei);
        setSwapping(true);
        tx = await contract.swapTokenForETH(tokenIn, amountWei, quote.minAmountOutWei, quote.poolFee);
      } else {
        const erc20 = getERC20Contract(tokenIn, signer);
        await safeApprove(erc20, ADDRESSES.basedswap, amountWei);
        setSwapping(true);
        tx = await contract.swapTokenForToken(tokenIn, tokenOut, amountWei, quote.minAmountOutWei, quote.poolFee);
      }
      setTxHash(tx.hash);
      await tx.wait();
      setAmountIn("");
      setQuote(null);
      setActivePct(null);
      await loadAllBalances(tokens);
      await loadUserStats();
    } catch (err) {
      const msg = err?.reason || err?.message || "Swap failed";
      if (!msg.includes("user rejected") && !msg.includes("User denied") && !msg.includes("rejected")) {
        setError(msg.slice(0, 150));
      }
    } finally {
      setSwapping(false);
      setApproving(false);
      setApproveStep(0);
    }
  };

  const switchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
    setQuote(null);
    setActivePct(null);
  };

  // Token dropdown
  const TokenDropdown = ({ show, search, onSearch, filteredList, onSelect, onClose }) => {
    if (!show) return null;

    const displayList = search
      ? filteredList.slice(0, 200)
      : filteredList.filter(t => {
          const bal = tokenBalances[t.address];
          return bal !== undefined && parseFloat(bal) > 0;
        });

    return (
      <div className="token-dropdown-menu">
        <div style={{ padding: "10px", flexShrink: 0 }}>
          <input autoFocus type="text"
            placeholder="Search by name, symbol or address..."
            value={search} onChange={e => onSearch(e.target.value)}
            style={{
              width:        "100%",
              background:   "rgba(255,255,255,0.05)",
              border:       "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding:      "8px 12px",
              color:        "white",
              fontSize:     "13px",
              outline:      "none",
            }}
          />
        </div>
        <div style={{
          padding:        "4px 14px 6px",
          color:          "#8892a4",
          fontSize:       "11px",
          borderBottom:   "1px solid rgba(255,255,255,0.04)",
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          flexShrink:     0,
        }}>
          <span>
            {search
              ? `Found ${filteredList.length} result${filteredList.length !== 1 ? "s" : ""}`
              : `Your tokens (${displayList.length})`}
          </span>
          {loadingBals && (
            <span style={{ color: "#0052ff", fontSize: "10px" }}>⏳ Loading...</span>
          )}
        </div>
        <div style={{ overflowY: "auto", flex: 1, maxHeight: "380px" }}>
          {displayList.length === 0 ? (
            <div style={{ padding: "24px 20px", textAlign: "center" }}>
              {search ? (
                <div style={{ color: "#8892a4", fontSize: "13px" }}>No tokens found</div>
              ) : (
                <>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>💳</div>
                  <div style={{ color: "white", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>
                    No token balances found
                  </div>
                  <div style={{ color: "#8892a4", fontSize: "12px" }}>
                    Search above to find any token on Base
                  </div>
                </>
              )}
            </div>
          ) : (
            displayList.map(t => {
              const bal    = tokenBalances[t.address];
              const hasbal = bal !== undefined && parseFloat(bal) > 0;
              const usd    = hasbal ? toUSD(bal, t.address) : null;
              return (
                <div key={t.address}
                  onClick={() => { onSelect(t.address); onClose(); onSearch(""); }}
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "12px",
                    padding:      "10px 14px",
                    cursor:       "pointer",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background:   hasbal ? "rgba(0,82,255,0.03)" : "transparent",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = hasbal ? "rgba(0,82,255,0.03)" : "transparent"}
                >
                  {t.logoURI ? (
                    <img src={t.logoURI} alt={t.symbol}
                      style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div style={{
                      width:          "36px",
                      height:         "36px",
                      borderRadius:   "50%",
                      background:     "rgba(0,82,255,0.3)",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      color:          "white",
                      fontSize:       "12px",
                      fontWeight:     "800",
                      flexShrink:     0,
                    }}>
                      {t.symbol?.slice(0, 2) || "?"}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontSize: "14px", fontWeight: "700" }}>
                      {t.symbol}
                    </div>
                    <div style={{
                      color:        "#8892a4",
                      fontSize:     "12px",
                      marginTop:    "1px",
                      overflow:     "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace:   "nowrap",
                    }}>
                      {t.name}
                    </div>
                    {hasbal && (
                      <div style={{ color: "#8892a4", fontSize: "11px", marginTop: "2px" }}>
                        {parseFloat(bal) < 0.0001
                          ? "< 0.0001 " + t.symbol
                          : parseFloat(bal).toFixed(4) + " " + t.symbol}
                        {usd && <span style={{ marginLeft: "4px" }}>· {usd}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const filteredInTokens = tokens.filter(t =>
    t.address !== tokenOut && (
      t.symbol?.toLowerCase().includes(searchIn.toLowerCase()) ||
      t.name?.toLowerCase().includes(searchIn.toLowerCase()) ||
      t.address?.toLowerCase().includes(searchIn.toLowerCase())
    )
  );
  const filteredOutTokens = tokens.filter(t =>
    t.address !== tokenIn && (
      t.symbol?.toLowerCase().includes(searchOut.toLowerCase()) ||
      t.name?.toLowerCase().includes(searchOut.toLowerCase()) ||
      t.address?.toLowerCase().includes(searchOut.toLowerCase())
    )
  );

  const isBusy = swapping || approving || quoting;

  if (!isConnected) return (
    <div style={{ padding: "20px", textAlign: "center", color: "#8892a4", fontSize: "14px" }}>
      Connect your wallet to use BaseQuest DEX
    </div>
  );

  return (
    <div>
      <div style={{
        background:   "rgba(255,255,255,0.03)",
        border:       "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding:      "16px",
        marginBottom: "12px",
      }}>

        {/* Step indicator */}
        {(approving || swapping) && (
          <div style={{
            background:   "rgba(0,82,255,0.1)",
            border:       "1px solid rgba(0,82,255,0.3)",
            borderRadius: "10px",
            padding:      "10px 14px",
            marginBottom: "14px",
            display:      "flex",
            alignItems:   "center",
            gap:          "10px",
          }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {Array.from({ length: maxSteps }, (_, i) => i + 1).map(step => {
                const currentStep = approveStep === 1 ? 1
                  : approveStep === 2 ? (isUSDT ? 2 : 1)
                  : swapping ? maxSteps : 0;
                return (
                  <div key={step} style={{
                    width:          "28px",
                    height:         "28px",
                    borderRadius:   "50%",
                    background:     currentStep >= step ? "rgba(0,82,255,0.8)" : "rgba(255,255,255,0.1)",
                    border:         `1px solid ${currentStep >= step ? "#0052ff" : "rgba(255,255,255,0.2)"}`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    color:          "white",
                    fontSize:       "11px",
                    fontWeight:     "800",
                    transition:     "all 0.3s",
                  }}>
                    {currentStep > step ? "✓" : step}
                  </div>
                );
              })}
            </div>
            <div style={{ color: "white", fontSize: "12px", fontWeight: "600" }}>
              {approveStep === 1 && isUSDT && "Resetting USDT approval in your wallet"}
              {approveStep === 2 && "Approve token spend in your wallet"}
              {swapping          && "Confirm swap in your wallet"}
            </div>
          </div>
        )}

        {/* Token In */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <label style={{ color: "#8892a4", fontSize: "12px", fontWeight: "600" }}>You Pay</label>
            <span onClick={() => handlePct(1.0)}
              style={{ color: "#0052ff", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
              Balance: {currentBalance} {tokenInInfo?.symbol}
              {balanceUSD && <span style={{ color: "#8892a4", marginLeft: "4px" }}>({balanceUSD})</span>}
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input type="number" placeholder="0.0" value={amountIn}
                onChange={e => { setAmountIn(e.target.value); setActivePct(null); }}
                style={{
                  width:        "100%",
                  background:   "rgba(255,255,255,0.05)",
                  border:       "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding:      amountIn && toUSD(amountIn, tokenIn) ? "12px 14px 24px" : "12px 14px",
                  color:        "white",
                  fontSize:     "18px",
                  fontWeight:   "700",
                  outline:      "none",
                }}
              />
              {amountIn && toUSD(amountIn, tokenIn) && (
                <div style={{
                  position:      "absolute",
                  bottom:        "7px",
                  left:          "14px",
                  color:         "#8892a4",
                  fontSize:      "11px",
                  fontWeight:    "600",
                  pointerEvents: "none",
                }}>
                  ≈ {toUSD(amountIn, tokenIn)}
                </div>
              )}
            </div>
            <div className="token-selector-btn" style={{ width: "170px", position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => { setShowDropIn(!showDropIn); setShowDropOut(false); }}
                style={{
                  width:        "100%",
                  height:       "100%",
                  background:   "rgba(255,255,255,0.08)",
                  border:       "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  padding:      "12px",
                  color:        "white",
                  fontSize:     "13px",
                  fontWeight:   "700",
                  cursor:       "pointer",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "6px",
                }}>
                {tokenInInfo?.logoURI ? (
                  <img src={tokenInInfo.logoURI} alt=""
                    style={{ width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0 }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div style={{
                    width:          "20px",
                    height:         "20px",
                    borderRadius:   "50%",
                    flexShrink:     0,
                    background:     "rgba(0,82,255,0.3)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    color:          "white",
                    fontSize:       "9px",
                    fontWeight:     "800",
                  }}>
                    {tokenInInfo?.symbol?.slice(0, 2) || "?"}
                  </div>
                )}
                <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tokenInInfo?.symbol || "Select"}
                  </div>
                  {getPrice(tokenIn) > 0 && (
                    <div style={{ color: "#8892a4", fontSize: "10px" }}>
                      ${getPrice(tokenIn).toLocaleString("en-US", { maximumFractionDigits: 4 })}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: "10px" }}>▼</span>
              </button>
              <TokenDropdown show={showDropIn} search={searchIn} onSearch={setSearchIn}
                filteredList={filteredInTokens}
                onSelect={v => { setTokenIn(v); setQuote(null); setActivePct(null); }}
                onClose={() => setShowDropIn(false)}
              />
            </div>
          </div>

          {/* Percentage buttons */}
          <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
            {PCT_BUTTONS.map(btn => (
              <button key={btn.label} onClick={() => handlePct(btn.value)} style={{
                flex:         1,
                background:   activePct === btn.value
                  ? "linear-gradient(135deg, rgba(0,82,255,0.4), rgba(168,85,247,0.4))"
                  : "rgba(255,255,255,0.05)",
                border:       `1px solid ${activePct === btn.value ? "rgba(0,82,255,0.6)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "8px",
                padding:      "5px 0",
                color:        activePct === btn.value ? "white" : "#8892a4",
                fontSize:     "11px",
                fontWeight:   "700",
                cursor:       "pointer",
                transition:   "all 0.15s",
              }}>{btn.label}</button>
            ))}
          </div>
        </div>

        {/* Switch button */}
        <div style={{ textAlign: "center", margin: "10px 0" }}>
          <button onClick={switchTokens} style={{
            background:     "linear-gradient(135deg, rgba(0,82,255,0.2), rgba(168,85,247,0.2))",
            border:         "1px solid rgba(0,82,255,0.3)",
            borderRadius:   "50%",
            width:          "38px",
            height:         "38px",
            color:          "white",
            fontSize:       "18px",
            cursor:         "pointer",
            display:        "inline-flex",
            alignItems:     "center",
            justifyContent: "center",
            boxShadow:      "0 2px 10px rgba(0,82,255,0.2)",
          }}>⇅</button>
        </div>

        {/* Token Out */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ color: "#8892a4", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
            You Receive
          </label>
          <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
            <div style={{
              flex:         1,
              background:   "rgba(0,82,255,0.05)",
              border:       "1px solid rgba(0,82,255,0.15)",
              borderRadius: "10px",
              padding:      "12px 14px",
            }}>
              <div style={{ color: quote ? "white" : "#4a5568", fontSize: "18px", fontWeight: "700" }}>
                {quoting ? "Getting quote..." : quote ? `≈ ${quote.amountOut}` : "0.0"}
              </div>
              {quote && toUSD(quote.amountOut, tokenOut) && (
                <div style={{ color: "#8892a4", fontSize: "11px", fontWeight: "600", marginTop: "2px" }}>
                  ≈ {toUSD(quote.amountOut, tokenOut)}
                </div>
              )}
            </div>
            <div className="token-selector-btn" style={{ width: "170px", position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => { setShowDropOut(!showDropOut); setShowDropIn(false); }}
                style={{
                  width:        "100%",
                  height:       "100%",
                  background:   "rgba(255,255,255,0.08)",
                  border:       "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  padding:      "12px",
                  color:        "white",
                  fontSize:     "13px",
                  fontWeight:   "700",
                  cursor:       "pointer",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "6px",
                }}>
                {tokenOutInfo?.logoURI ? (
                  <img src={tokenOutInfo.logoURI} alt=""
                    style={{ width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0 }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div style={{
                    width:          "20px",
                    height:         "20px",
                    borderRadius:   "50%",
                    flexShrink:     0,
                    background:     "rgba(0,82,255,0.3)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    color:          "white",
                    fontSize:       "9px",
                    fontWeight:     "800",
                  }}>
                    {tokenOutInfo?.symbol?.slice(0, 2) || "?"}
                  </div>
                )}
                <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tokenOutInfo?.symbol || "Select"}
                  </div>
                  {getPrice(tokenOut) > 0 && (
                    <div style={{ color: "#8892a4", fontSize: "10px" }}>
                      ${getPrice(tokenOut).toLocaleString("en-US", { maximumFractionDigits: 4 })}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: "10px" }}>▼</span>
              </button>
              <TokenDropdown show={showDropOut} search={searchOut} onSearch={setSearchOut}
                filteredList={filteredOutTokens}
                onSelect={v => { setTokenOut(v); setQuote(null); }}
                onClose={() => setShowDropOut(false)}
              />
            </div>
          </div>
        </div>

        {/* Slippage */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ color: "#8892a4", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
            Slippage Tolerance
          </label>
          <div style={{ display: "flex", gap: "6px" }}>
            {["0.5", "1.0", "2.0"].map(s => (
              <button key={s} onClick={() => setSlippage(s)} style={{
                background:   slippage === s ? "rgba(0,82,255,0.3)" : "rgba(255,255,255,0.05)",
                border:       `1px solid ${slippage === s ? "rgba(0,82,255,0.6)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "8px",
                padding:      "6px 12px",
                color:        slippage === s ? "white" : "#8892a4",
                fontSize:     "12px",
                fontWeight:   "700",
                cursor:       "pointer",
              }}>{s}%</button>
            ))}
            <input type="number" placeholder="Custom"
              value={!["0.5","1.0","2.0"].includes(slippage) ? slippage : ""}
              onChange={e => setSlippage(e.target.value)}
              style={{
                flex:         1,
                background:   "rgba(255,255,255,0.05)",
                border:       "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding:      "6px 10px",
                color:        "white",
                fontSize:     "12px",
                outline:      "none",
              }}
            />
          </div>
        </div>

        {/* Quote breakdown */}
        {quote && (
          <div style={{
            background:    "rgba(0,82,255,0.05)",
            border:        "1px solid rgba(0,82,255,0.15)",
            borderRadius:  "12px",
            padding:       "12px",
            marginBottom:  "14px",
            display:       "flex",
            flexDirection: "column",
            gap:           "8px",
          }}>
            {[
              { label: "Expected Output", value: `${quote.amountOut} ${tokenOutInfo?.symbol}${toUSD(quote.amountOut, tokenOut) ? ` (≈ ${toUSD(quote.amountOut, tokenOut)})` : ""}`, color: "white"   },
              { label: "Minimum Output",  value: `${quote.minAmountOut} ${tokenOutInfo?.symbol}${toUSD(quote.minAmountOut, tokenOut) ? ` (≈ ${toUSD(quote.minAmountOut, tokenOut)})` : ""}`,          color: "white"   },
              { label: "Price Impact",    value: quote.priceImpact,                                                                                                                                       color: "#f0b429" },
              { label: "Slippage",        value: quote.slippage,                                                                                                                                          color: "#f0b429" },
              { label: "Gas Estimate",    value: quote.gasEstimate,                                                                                                                                       color: "#8892a4" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#8892a4", fontSize: "12px" }}>{row.label}</span>
                <span style={{ color: row.color, fontSize: "12px", fontWeight: "700" }}>{row.value}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#ff6b6b", fontSize: "12px", fontWeight: "600" }}>🔵 Platform Fee (0.5%)</span>
              <span style={{ color: "#ff6b6b", fontSize: "12px", fontWeight: "700" }}>
                {quote.platformFee} {tokenInInfo?.symbol}
                {toUSD(quote.platformFee, tokenIn) && (
                  <span style={{ color: "#8892a4", marginLeft: "4px" }}>(≈ {toUSD(quote.platformFee, tokenIn)})</span>
                )}
              </span>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#00c853", fontSize: "12px", fontWeight: "600" }}>⚡ XP Earned</span>
              <span style={{ color: "#00c853", fontSize: "12px", fontWeight: "700" }}>
                +{xpForSwap} XP {multiplier > 1 ? `(${multiplier}x)` : ""}
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background:   "rgba(255,59,59,0.1)",
            border:       "1px solid rgba(255,59,59,0.3)",
            borderRadius: "10px",
            padding:      "10px 14px",
            color:        "#ff6b6b",
            fontSize:     "12px",
            fontWeight:   "600",
            marginBottom: "14px",
          }}>⚠️ {error}</div>
        )}

        {/* Success */}
        {txHash && (
          <div style={{
            background:   "rgba(0,200,83,0.1)",
            border:       "1px solid rgba(0,200,83,0.3)",
            borderRadius: "10px",
            padding:      "10px 14px",
            color:        "#00c853",
            fontSize:     "12px",
            fontWeight:   "600",
            marginBottom: "14px",
          }}>
            ✅ Swap successful! +{xpForSwap} XP earned!{" "}
            <a href={`https://basescan.org/tx/${txHash}`} target="_blank" rel="noreferrer"
              style={{ color: "#00c853" }}>View tx ↗</a>
          </div>
        )}

        {/* Swap button */}
        <button onClick={executeSwap}
          disabled={!quote || isBusy}
          style={{
            width:        "100%",
            background:   !quote || isBusy
              ? "rgba(0,82,255,0.3)"
              : "linear-gradient(135deg, #0052ff, #7c3aed)",
            border:       "none",
            borderRadius: "12px",
            padding:      "14px",
            color:        "white",
            fontWeight:   "800",
            fontSize:     "15px",
            cursor:       !quote || isBusy ? "not-allowed" : "pointer",
            boxShadow:    !quote || isBusy ? "none" : "0 4px 24px rgba(0,82,255,0.4)",
            transition:   "all 0.2s",
          }}>
          {buttonLabel()}
        </button>
      </div>

      {/* User DEX stats */}
      {userStats && userStats.swapCount > 0 && (
        <div style={{
          background:   "linear-gradient(135deg, rgba(0,82,255,0.08), rgba(168,85,247,0.08))",
          border:       "1px solid rgba(0,82,255,0.2)",
          borderRadius: "14px",
          padding:      "16px",
        }}>
          <div style={{ color: "white", fontSize: "13px", fontWeight: "800", marginBottom: "12px" }}>
            📊 Your DEX Stats
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "white", fontSize: "20px", fontWeight: "900" }}>{userStats.swapCount}</div>
              <div style={{ color: "#8892a4", fontSize: "11px", marginTop: "2px" }}>Total Swaps</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#f0b429", fontSize: "20px", fontWeight: "900" }}>{userStats.totalXPEarned}</div>
              <div style={{ color: "#8892a4", fontSize: "11px", marginTop: "2px" }}>XP Earned</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#00d4ff", fontSize: "20px", fontWeight: "900" }}>{userStats.totalVolumeETH}</div>
              <div style={{ color: "#8892a4", fontSize: "11px", marginTop: "2px" }}>ETH Volume</div>
              {toUSD(userStats.totalVolumeETH, NATIVE) && (
                <div style={{ color: "#8892a4", fontSize: "10px" }}>
                  ≈ {toUSD(userStats.totalVolumeETH, NATIVE)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
                                            }
