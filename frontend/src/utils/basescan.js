const BLOCKSCOUT_URL = "https://base.blockscout.com/api";

// ── Known DEX contracts on Base ───────────────────────────────────────
const DEX_CONTRACTS = new Set([
  // Uniswap V3 — from official docs.uniswap.org/base-deployments
  "0x2626664c2603336e57b271c5c0b26f421741e481", // SwapRouter02
  "0x6ff5693b99212da76ad316178a184ab56d299b43", // UniversalRouter
  "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad", // UniversalRouter (old)
  "0x198ef79f1f515f02dfe9e3115ed9fc07183f02fc", // SwapRouter
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", // Uniswap V2 Router

  // Aerodrome — largest DEX on Base
  "0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43", // Aerodrome Router
  "0x420dd381b31aef6683db6b902084cb0ffece40da", // Aerodrome V2 Router
  "0x1111111254eeb25477b68fb85ed929f73a960582", // 1inch V5 Router
  "0x111111125421ca6dc452d289314280a0f8842a65", // 1inch V6 Router

  // BaseSwap
  "0x327df1e6de05895d2ab08513aadd9313fe505d86", // BaseSwap Router
  "0x4cf76043b3f97ba06917cbd90f9e3a2aac1cd79b", // BaseSwap Router V2

  // SwapBased
  "0xaaa3b1f1bd7bcc97fd1917c18ade665c5d31361d", // SwapBased Router

  // Sushiswap
  "0x6afcff9189e8ed3fcc1cffa184feb1276f6a82a5", // Sushi RouteProcessor3
  "0x0be808376ecb75a5cf9bb6d237d16cd37893d904", // Sushi RouteProcessor4

  // 0x Protocol / Matcha
  "0xdef1c0ded9bec7f1a1670819833240f027b25eff", // 0x Exchange Proxy
  "0x55873e4b1dd63ab3fea3ca47c10277655ac2dce0", // 0x Settler

  // Balancer
  "0xba12222222228d8ba445958a75a0704d566bf2c8", // Balancer Vault

  // Curve Finance
  "0x4d9f9d15101eec665f77210cb999639f760f831e", // Curve Router

  // PancakeSwap
  "0x678aa4bf4e210cf2166753e054d5b7c31cc7fa86", // PancakeSwap Router
  "0x13f4ea83d0bd40e75c8222255bc855a974568dd4", // PancakeSwap Router V3

  // OpenOcean
  "0x6352a56caadc4f1e25cd6c75970fa768a3304e64", // OpenOcean Exchange

  // Odos
  "0x19ceead7105607cd444f5ad10dd51356b95839be", // Odos Router V2

  // Paraswap
  "0xdef171fe48cf0115b1d80b88dc8eab59176fee57", // Paraswap Augustus

  // Kyber Network
  "0x6131b5fae19ea4f9d964eac0408e4408b66337b5", // KyberSwap Router
  "0xf375e7a8dd0a659c2b68e1793a0c449d13ce05f5", // KyberSwap Meta Router

  // BaseQuest DEX (your own contract — add your address here)
  "0x942Fa39Bc20E165CbA26DcAF2e130C520BEd767B",
]);


// ── Known Bridge contracts on Base ────────────────────────────────────
const BRIDGE_CONTRACTS = new Set([
  // Base Official Bridge
  "0x4200000000000000000000000000000000000010", // L2StandardBridge
  "0x4200000000000000000000000000000000000007", // L2CrossDomainMessenger
  "0x3154cf16ccdb4c6d922629664174b904d80f2c35", // OptimismMintableERC20Factory

  // Across Protocol
  "0x09aea4b2242abc8bb4bb78d537a67a245a7bec64", // Across SpokePool
  "0x4d73adb72bc3dd368966edd0f0b2148401a178e2", // Across SpokePool V2

  // Stargate V1
  "0x45f1a95a4d3f3836523f5c83673c797f4d4d263b", // Stargate Router
  "0xbe1a001fe942f96eea22ba08783140b9dcc09d28", // Stargate ETH Router

  // Stargate V2
  "0xdc181bd607440361680d7d1c6e9be0d541ab0dd2", // StargatePool USDC
  "0xe8cdf27acd73a434d661c84887215f7598e7d0d3", // StargatePool ETH

  // Hop Protocol
  "0x8741ba6225a6bf91f9d73531a98a89807857a2b3", // Hop Bridge
  "0x6f03052743cd99ce1b29265e377e320cd24d2a2e", // Hop ETH Bridge
  "0xdb1a8c97e9a87d0d1e37de74aef4ac5f04a3cead", // Hop USDC Bridge

  // Synapse Protocol
  "0x6571d6be3d8460cf5f7d6711cd9961860029d85f", // Synapse Bridge
  "0x418f893d7b7c9c85b70df50b4a9e7745ccbe9b7a", // Synapse Router

  // Orbiter Finance
  "0x80c67432656d59144ceff962e8faf8926599bcf8", // Orbiter Router

  // Relay Bridge
  "0xf70da97812cb96acdf810712aa562db8dfa3dbef", // Relay Bridge

  // Celer cBridge
  "0x9d39fc627a6d9d9f8c831c16995b209548cc3401", // cBridge

  // LI.FI / Jumper
  "0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae", // LI.FI Diamond
  "0x24ca98fb729571e4a2c224a8b7f07c0b27d1cb8a", // Jumper Bridge

  // Socket / Bungee
  "0x3a23f943181408eac424116af7b7790c94cb97a5", // Socket Gateway

  // deBridge
  "0x43de2d77bf8027e25dbd179b491e8d64f38398aa", // deBridge Gate

  // Wormhole
  "0xbebdb6c8ddfc2206a9d5f1d1e9a18f9faffc6206", // Wormhole Bridge
  "0x24850c6f61c438823f01b7a3bf2b89b72174fa9d", // Wormhole Token Bridge

  // LayerZero
  "0xb6319cc6c8c27a8f5daf0dd3df91ea35c4720dd7", // LayerZero Endpoint
  "0x1a44076050125825900e736c501f859c50fe728c", // LayerZero Endpoint V2

  // Axelar
  "0xe432150cce91c13a887f7d836923d5597add8e31", // Axelar Gateway

  // Chainlink CCIP
  "0x881e3a65b4d4a04dd529061dd0071cf975f58bcd", // CCIP Router

  // Owlto Finance
  "0x3dc4874fc53fcbaacdf9f0f4b4498fde6ab5e79e", // Owlto Bridge

  // Rhino.fi
  "0xe3e8cc42da487d1116d26687856e9fb684817c52", // Rhino Bridge
]);

async function blockscoutFetch(address) {
  const url = `${BLOCKSCOUT_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&limit=10000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Blockscout error: " + res.status);
  const data = await res.json();
  if (data.status === "0" && data.message !== "No transactions found") return [];
  return Array.isArray(data.result) ? data.result : [];
}

async function blockscoutFetchLatest(address) {
  try {
    const url = `https://base.blockscout.com/api/v2/addresses/${address}/transactions`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const items = data?.items;
    if (!Array.isArray(items) || items.length === 0) return null;
    const tx = items[0];
    const valueInWei = tx.value
      ? (tx.value.includes(".") ? String(Math.round(parseFloat(tx.value) * 1e18)) : tx.value)
      : "0";
    return {
      hash:      tx.hash,
      timeStamp: String(Math.floor(new Date(tx.timestamp).getTime() / 1000)),
      value:     valueInWei,
    };
  } catch (err) {
    console.warn("blockscoutFetchLatest v2 failed:", err.message);
    return null;
  }
}

// Fetch all ERC-20 token transfers
async function fetchTokenTransfers(address) {
  try {
    const url = `${BLOCKSCOUT_URL}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc&limit=10000`;
    const res  = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status === "0") return [];
    return Array.isArray(data.result) ? data.result : [];
  } catch { return []; }
}

// Fetch ETH price
async function fetchEthPrice() {
  try {
    const res  = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
    const data = await res.json();
    return data?.ethereum?.usd || 0;
  } catch { return 0; }
}

// Fetch prices for a list of token contract addresses in batches
async function fetchTokenPrices(contractAddresses) {
  if (!contractAddresses || contractAddresses.length === 0) return {};
  const priceMap = {};
  const batchSize = 100;
  for (let i = 0; i < contractAddresses.length; i += batchSize) {
    const batch = contractAddresses.slice(i, i + batchSize).join(",");
    try {
      const res  = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${batch}&vs_currencies=usd`
      );
      const data = await res.json();
      for (const [addr, val] of Object.entries(data || {})) {
        if (val?.usd) priceMap[addr.toLowerCase()] = val.usd;
      }
    } catch {}
    if (i + batchSize < contractAddresses.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return priceMap;
}

export async function fetchTransactions(address) {
  try { return await blockscoutFetch(address); }
  catch (err) { console.warn("Blockscout fetch failed:", err.message); return []; }
}

// Analyze token volume with USD pricing
function analyzeTokenVolume(address, tokenTxs, tokenPriceMap, ethPrice) {
  if (!tokenTxs || tokenTxs.length === 0) return { tokenVolumes: [], totalTokenTxs: 0, totalTokenUSD: 0 };
  const addr     = address.toLowerCase();
  const tokenMap = {};

  // Stablecoin addresses on Base → always $1
  const stables = new Set([
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC
    "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2", // USDT
    "0x50c5725949a6f0c72e6c4a641f24049a917db0cb", // DAI
    "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", // USDbC
  ]);

  const weth = "0x4200000000000000000000000000000000000006";

  tokenTxs.forEach(tx => {
    const symbol   = tx.tokenSymbol   || "UNKNOWN";
    const name     = tx.tokenName     || symbol;
    const decimals = parseInt(tx.tokenDecimal || "18");
    const contract = tx.contractAddress?.toLowerCase() || "";
    const isSent   = tx.from.toLowerCase() === addr;
    const isRecv   = tx.to?.toLowerCase()  === addr;
    const amount   = parseFloat(tx.value || "0") / Math.pow(10, decimals);

    // Get token price
    let price = 0;
    if (stables.has(contract))          price = 1;
    else if (contract === weth)         price = ethPrice;
    else if (tokenPriceMap[contract])   price = tokenPriceMap[contract];

    if (!tokenMap[symbol]) {
      tokenMap[symbol] = {
        symbol,
        name,
        decimals,
        contractAddress: contract,
        price,
        sentAmount:  0,
        recvAmount:  0,
        totalAmount: 0,
        sentUSD:     0,
        recvUSD:     0,
        totalUSD:    0,
        txCount:     0,
        hasPrice:    price > 0,
      };
    }

    if (isSent) {
      tokenMap[symbol].sentAmount += amount;
      tokenMap[symbol].sentUSD    += amount * price;
    }
    if (isRecv) {
      tokenMap[symbol].recvAmount += amount;
      tokenMap[symbol].recvUSD    += amount * price;
    }
    tokenMap[symbol].totalAmount = tokenMap[symbol].sentAmount + tokenMap[symbol].recvAmount;
    tokenMap[symbol].totalUSD    = tokenMap[symbol].sentUSD    + tokenMap[symbol].recvUSD;
    tokenMap[symbol].txCount++;
  });

  const tokenVolumes = Object.values(tokenMap)
    .filter(t => t.totalAmount > 0)
    .sort((a, b) => b.totalUSD - a.totalUSD || b.txCount - a.txCount);

  const totalTokenUSD = tokenVolumes.reduce((sum, t) => sum + t.totalUSD, 0);

  return { tokenVolumes, totalTokenTxs: tokenTxs.length, totalTokenUSD };
}

export function analyzeTransactions(address, txs, ethPrice = 0, tokenTxs = [], tokenPriceMap = {}) {
  if (!txs || txs.length === 0) return emptyAnalytics(address);
  const addr   = address.toLowerCase();
  const now    = Math.floor(Date.now() / 1000);
  const sorted = [...txs].sort((a, b) => Number(a.timeStamp) - Number(b.timeStamp));
  const first  = sorted[0];
  const last   = sorted[sorted.length - 1];
  const walletAgeDays = Math.floor((now - Number(first.timeStamp)) / 86400);

  const sentTxs      = txs.filter(tx => tx.from.toLowerCase() === addr && tx.isError === "0");
  const receivedTxs  = txs.filter(tx => tx.to?.toLowerCase() === addr  && tx.isError === "0");
  const totalSentWei = sentTxs.reduce((acc, tx) => acc + BigInt(tx.value || "0"), 0n);
  const totalRecvWei = receivedTxs.reduce((acc, tx) => acc + BigInt(tx.value || "0"), 0n);
  const totalVolWei  = totalSentWei + totalRecvWei;
  const successTxs   = txs.filter(tx => tx.isError === "0");
  const totalGasUsed = successTxs.reduce((acc, tx) => acc + Number(tx.gasUsed || 0), 0);
  const avgGasUsed   = successTxs.length ? Math.round(totalGasUsed / successTxs.length) : 0;
  const failedCount  = txs.filter(tx => tx.isError === "1").length;

  // ETH amounts
  const totalSentEth = Number(totalSentWei) / 1e18;
  const totalRecvEth = Number(totalRecvWei) / 1e18;
  const totalVolEth  = Number(totalVolWei)  / 1e18;

  // ETH USD equivalents
  const totalSentUSD = ethPrice > 0 ? (totalSentEth * ethPrice).toFixed(2) : null;
  const totalRecvUSD = ethPrice > 0 ? (totalRecvEth * ethPrice).toFixed(2) : null;
  const totalVolUSD  = ethPrice > 0 ? (totalVolEth  * ethPrice).toFixed(2) : null;
  const ethVolUSD    = ethPrice > 0 ? totalVolEth * ethPrice : 0;

  // Count swaps and bridges by known contract addresses
  const outgoingTxs   = txs.filter(tx => tx.from.toLowerCase() === addr && tx.isError === "0");
  const totalSwaps    = outgoingTxs.filter(tx => DEX_CONTRACTS.has(tx.to?.toLowerCase())).length;
  const totalBridges  = outgoingTxs.filter(tx => BRIDGE_CONTRACTS.has(tx.to?.toLowerCase())).length;

  // Token volume analysis with prices
  const { tokenVolumes, totalTokenTxs, totalTokenUSD } = analyzeTokenVolume(
    address, tokenTxs, tokenPriceMap, ethPrice
  );

  // Total USD volume = ETH volume + token volume
  const grandTotalUSD = ethVolUSD + totalTokenUSD;

  // Contract interactions
  const contractCounts = {};
  txs.forEach(tx => {
    if (tx.to && tx.to !== "" && tx.to.toLowerCase() !== addr) {
      const to = tx.to.toLowerCase();
      contractCounts[to] = (contractCounts[to] || 0) + 1;
    }
  });
  const uniqueContracts = Object.keys(contractCounts).length;
  const topContracts    = Object.entries(contractCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([contract, count]) => ({ contract, count }));

  const firstTxOnBase = first ? {
    hash:      first.hash,
    date:      new Date(Number(first.timeStamp) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    valueEth:  (Number(BigInt(first.value || "0")) / 1e18).toFixed(6),
    timestamp: Number(first.timeStamp),
  } : null;

  const latestTxOnBase = last ? {
    hash:      last.hash,
    date:      new Date(Number(last.timeStamp) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    valueEth:  (Number(BigInt(last.value || "0")) / 1e18).toFixed(6),
    timestamp: Number(last.timeStamp),
  } : null;

  const largestTx = txs.reduce((max, tx) => {
    const val = BigInt(tx.value || "0");
    return val > BigInt(max?.value || "0") ? tx : max;
  }, txs[0]);

  const largestTxOnBase = largestTx ? {
    hash:     largestTx.hash,
    date:     new Date(Number(largestTx.timeStamp) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    valueEth: (Number(BigInt(largestTx.value || "0")) / 1e18).toFixed(6),
  } : null;

  const nonZeroTxs = txs.filter(tx => BigInt(tx.value || "0") > 0n);
  const smallestTx = nonZeroTxs.length > 0
    ? nonZeroTxs.reduce((min, tx) => {
        const val = BigInt(tx.value || "0");
        return val < BigInt(min?.value || "0") ? tx : min;
      }, nonZeroTxs[0])
    : null;

  const smallestTxOnBase = smallestTx ? {
    hash:     smallestTx.hash,
    date:     new Date(Number(smallestTx.timeStamp) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    valueEth: (Number(BigInt(smallestTx.value || "0")) / 1e18).toFixed(6),
  } : null;

  const heatmap   = buildHeatmap(txs, 90);
  const baseScore = computeBaseScore({
    totalTxs: txs.length, walletAgeDays, uniqueContracts,
    totalSentEth, totalRecvEth, failedCount,
    streakDays: heatmap.longestStreak,
  });

  return {
    address,
    walletAgeDays,
    totalTxs:         txs.length,
    successTxs:       successTxs.length,
    failedCount,
    firstTx:          first ? formatTx(first) : null,
    lastTx:           last  ? formatTx(last)  : null,
    totalSentEth:     totalSentEth.toFixed(6),
    totalRecvEth:     totalRecvEth.toFixed(6),
    totalVolEth:      totalVolEth.toFixed(6),
    totalSentUSD,
    totalRecvUSD,
    totalVolUSD,
    ethVolUSD,
    grandTotalUSD,
    totalTokenUSD,
    tokenVolumes,
    totalTokenTxs,
    totalSwaps,
    totalBridges,
    ethPrice,
    avgGasUsed,
    uniqueContracts,
    topContracts,
    heatmap,
    baseScore,
    firstTxOnBase,
    latestTxOnBase,
    largestTxOnBase,
    smallestTxOnBase,
  };
}

function formatTx(tx) {
  return {
    hash:      tx.hash,
    timestamp: Number(tx.timeStamp),
    date:      new Date(Number(tx.timeStamp) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    valueEth:  (Number(BigInt(tx.value || "0")) / 1e18).toFixed(6),
    from:      tx.from,
    to:        tx.to,
    gasUsed:   tx.gasUsed,
    isError:   tx.isError === "1",
  };
}

function buildHeatmap(txs, days) {
  const now      = Math.floor(Date.now() / 1000);
  const startDay = now - days * 86400;
  const cells    = new Array(days).fill(0);
  txs.forEach(tx => {
    const ts = Number(tx.timeStamp);
    if (ts >= startDay) {
      const dayIdx = Math.floor((ts - startDay) / 86400);
      if (dayIdx >= 0 && dayIdx < days) cells[dayIdx]++;
    }
  });
  let longestStreak = 0, currentStreak = 0;
  for (const count of cells) {
    if (count > 0) { currentStreak++; longestStreak = Math.max(longestStreak, currentStreak); }
    else currentStreak = 0;
  }
  return { cells, maxCount: Math.max(...cells, 1), longestStreak, days };
}

function computeBaseScore({ totalTxs, walletAgeDays, uniqueContracts, totalSentEth, totalRecvEth, failedCount, streakDays }) {
  let score = 0;
  score += Math.min(350, totalTxs * 0.8);
  score += Math.min(200, walletAgeDays * 1.5);
  score += Math.min(250, uniqueContracts * 1.2);
  score += Math.min(150, (totalSentEth + totalRecvEth) * 10);
  score += Math.min(200, streakDays * 15);
  score -= Math.min(80,  failedCount * 0.5);
  return Math.max(0, Math.min(100, Math.round(score / 11)));
}

function emptyAnalytics(address) {
  return {
    address,
    walletAgeDays:    0,
    totalTxs:         0,
    successTxs:       0,
    failedCount:      0,
    firstTx:          null,
    lastTx:           null,
    totalSentEth:     "0.000000",
    totalRecvEth:     "0.000000",
    totalVolEth:      "0.000000",
    totalSentUSD:     null,
    totalRecvUSD:     null,
    totalVolUSD:      null,
    ethVolUSD:        0,
    grandTotalUSD:    0,
    totalTokenUSD:    0,
    tokenVolumes:     [],
    totalTokenTxs:    0,
    totalSwaps:       0,
    totalBridges:     0,
    ethPrice:         0,
    avgGasUsed:       0,
    uniqueContracts:  0,
    topContracts:     [],
    heatmap:          { cells: new Array(90).fill(0), maxCount: 1, longestStreak: 0, days: 90 },
    baseScore:        0,
    firstTxOnBase:    null,
    latestTxOnBase:   null,
    largestTxOnBase:  null,
    smallestTxOnBase: null,
  };
}

export async function getWalletAnalysis(address) {
  // Fetch everything in parallel
  const [txs, latestTx, ethPrice, tokenTxs] = await Promise.all([
    fetchTransactions(address),
    blockscoutFetchLatest(address),
    fetchEthPrice(),
    fetchTokenTransfers(address),
  ]);

  // Get unique token contract addresses to price
  const tokenContracts = [
    ...new Set(tokenTxs.map(t => t.contractAddress?.toLowerCase()).filter(Boolean))
  ];

  // Fetch token prices
  const tokenPriceMap = await fetchTokenPrices(tokenContracts);

  const result = analyzeTransactions(address, txs, ethPrice, tokenTxs, tokenPriceMap);

  if (latestTx) {
    result.latestTxOnBase = {
      hash:      latestTx.hash,
      date:      new Date(Number(latestTx.timeStamp) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      valueEth:  (Number(BigInt(latestTx.value || "0")) / 1e18).toFixed(6),
      timestamp: Number(latestTx.timeStamp),
    };
  }
  return result;
          }
