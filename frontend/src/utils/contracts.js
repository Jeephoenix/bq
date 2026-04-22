import { ethers } from "ethers";

export const ADDRESSES = {
  core:      import.meta.env.VITE_CORE_CONTRACT      || "",
  bossraid:  import.meta.env.VITE_BOSSRAID_CONTRACT  || "",
  bridge:    import.meta.env.VITE_BRIDGE_CONTRACT    || "",
  basedswap: import.meta.env.VITE_BASEDSWAP_CONTRACT || "",
};

export const BASE_CHAIN_ID = 8453;
export const BASE_RPC_URL  = import.meta.env.VITE_CDP_RPC_URL || "https://mainnet.base.org";

export const CORE_ABI = [
  "function completeGMTask(string message) external payable",
  "function completeDeployTask(string greeting) external payable returns (address)",
  "function lastGM(address) external view returns (string)",
  "function lastGMAt(address) external view returns (uint256)",
  "function lastDeployedContract(address) external view returns (address)",
  "function deployCount(address) external view returns (uint256)",
  "event GMPosted(address indexed user, string message, uint256 timestamp)",
  "event ContractDeployed(address indexed user, address indexed deployed, string greeting, uint256 timestamp)",
  "function completeDeployRemix() external payable",
  "function completeSwapTask() external payable",
  "function completeBridgeTask() external payable",
  "function completeGameTask() external payable",
  "function completeProfileTask(string calldata username) external payable",
  "function completeSwapAerodrome() external payable",
  "function completeSwapUniswap() external payable",
  "function completeSwapJumper() external payable",
  "function completeSwapRelay() external payable",
  "function completeBridgeJumper() external payable",
  "function completeBridgeRelay() external payable",
  "function getUserXP(address user) external view returns (uint256)",
  "function getUserLevel(address user) external view returns (uint256)",
  "function getUserProfile(address user) external view returns (uint256 totalXP, string username, bool usernameSet, uint256 tasksCompleted, uint256 joinedAt, uint256 streakCount)",
  "function getDailyTasks(address user) external view returns (bool gmDone, bool deployDone, bool swapDone, bool bridgeDone, bool gameDone, bool profileDone)",
  "function getSubTasks(address user) external view returns (bool swapAerodromeDone, bool swapUniswapDone, bool swapJumperDone, bool swapRelayDone, bool bridgeJumperDone, bool bridgeRelayDone, bool deployRemixDone)",
  "function getTopUsers(uint256 count) external view returns (address[] topAddresses, uint256[] topXPs)",
  "function getTotalUsers() external view returns (uint256)",
  "function getUserStreak(address user) external view returns (uint256)",
  "function profileTaskDone(address) external view returns (bool)",
  "function contractOwner() external view returns (address)",
  "function isRegistered(address) external view returns (bool)",
  "function getRewardPool() external view returns (uint256)",
  "function awardXPFromPartner(address user, uint256 xp) external",
  "function setPartnerContract(address partner, bool status) external",
  "function isPartnerContract(address) external view returns (bool)",
  "function allUsers(uint256 index) external view returns (address)",
  "event TaskCompleted(address indexed user, string taskType, uint256 xpEarned, uint256 timestamp)",
  "event StreakBonusAwarded(address indexed user, uint256 streak, uint256 xpEarned)",
];

export const BASEDSWAP_ABI = [
  "function swapETHForToken(address tokenOut, uint256 amountOutMinimum, uint24 poolFee) external payable returns (uint256 amountOut)",
  "function swapTokenForETH(address tokenIn, uint256 amountIn, uint256 amountOutMinimum, uint24 poolFee) external returns (uint256 amountOut)",
  "function swapTokenForToken(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMinimum, uint24 poolFee) external returns (uint256 amountOut)",
  "function getMultiplier(address user) external view returns (uint256)",
  "function getXPForSwap(address user) external view returns (uint256)",
  "function getUserStats(address user) external view returns (uint256 swapCount, uint256 totalXPEarned, uint256 totalVolumeETH, uint256 currentMultiplier, uint256 nextSwapXP)",
  "function getRewardPool() external view returns (uint256)",
  "function getTotalSwaps() external view returns (uint256)",
  "function withdrawRewardPool() external",
  "function withdrawTokenFees(address token) external",
  "function PLATFORM_FEE_BP() external view returns (uint256)",
  "function BASE_XP() external view returns (uint256)",
  "function userSwapCount(address) external view returns (uint256)",
  "function totalSwaps() external view returns (uint256)",
  "event SwapExecuted(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 platformFee, uint256 xpEarned, uint256 multiplier)",
];

export const BOSSRAID_ABI = [
  "function attack() external payable",
  "function getBossStatus() external view returns (uint256 raidNumber, uint256 maxHP, uint256 currentHP, uint256 hpPercent, bool defeated, address winner, uint256 prizePool, uint256 startedAt, uint256 attackCount, uint256 playerCount)",
  "function getRecentAttacks(uint256 count) external view returns (address[] attackers, uint256[] damages, uint256[] hpAfters, bool[] killingBlows, uint256[] timestamps)",
  "function getPlayerStats(address player) external view returns (uint256 damageThisRaid, uint256 totalDamage, uint256 raidsJoined, uint256 raidsWon, bool hasAttackedThisRaid)",
  "function getRaidPlayers(uint256 raidNum) external view returns (address[])",
  "function getRaidAttackCount(uint256 raidNum) external view returns (uint256)",
  "function getTotalRaids() external view returns (uint256)",
  "function ATTACK_FEE() external view returns (uint256)",
  "function currentBoss() external view returns (uint256 raidNumber, uint256 maxHP, uint256 currentHP, bool defeated, address winner, uint256 prizePool, uint256 startedAt, uint256 endedAt, uint256 attackCount)",
  "event BossSpawned(uint256 indexed raidNumber, uint256 maxHP, uint256 timestamp)",
  "event AttackLanded(address indexed attacker, uint256 damage, uint256 hpRemaining, bool killingBlow, uint256 raidNumber)",
  "event BossDefeated(address indexed winner, uint256 prize, uint256 raidNumber, uint256 totalAttackers)",
];

export const BRIDGE_ABI = [
  "function recordBridge(string calldata bridgeProtocol, string calldata note) external",
  "function getUserRecordIndexes(address user) external view returns (uint256[])",
  "function userBridgeCount(address) external view returns (uint256)",
];

export const ERC20_ABI = [
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
];

let _readProvider = null;
export function getReadProvider() {
  if (!_readProvider) _readProvider = new ethers.JsonRpcProvider(BASE_RPC_URL);
  return _readProvider;
}

export function getCoreContract(s)      { if (!ADDRESSES.core)      throw new Error("VITE_CORE_CONTRACT not set");      return new ethers.Contract(ADDRESSES.core,      CORE_ABI,      s); }
export function getBossRaidContract(s)  { if (!ADDRESSES.bossraid)  throw new Error("VITE_BOSSRAID_CONTRACT not set");  return new ethers.Contract(ADDRESSES.bossraid,  BOSSRAID_ABI,  s); }
export function getBridgeContract(s)    { if (!ADDRESSES.bridge)    throw new Error("VITE_BRIDGE_CONTRACT not set");    return new ethers.Contract(ADDRESSES.bridge,    BRIDGE_ABI,    s); }
export function getBasedSwapContract(s) { if (!ADDRESSES.basedswap) throw new Error("VITE_BASEDSWAP_CONTRACT not set"); return new ethers.Contract(ADDRESSES.basedswap, BASEDSWAP_ABI, s); }
export function getERC20Contract(address, s) { return new ethers.Contract(address, ERC20_ABI, s); }

export const LEVELS = [
  { level: 1, name: "Newbie",  minXP: 0,     maxXP: 499,      color: "#8892a4", emoji: "🌱" },
  { level: 2, name: "Farmer",  minXP: 500,   maxXP: 1499,     color: "#00c853", emoji: "🌾" },
  { level: 3, name: "Builder", minXP: 1500,  maxXP: 3499,     color: "#0052ff", emoji: "🔨" },
  { level: 4, name: "Degen",   minXP: 3500,  maxXP: 7499,     color: "#a855f7", emoji: "⚡" },
  { level: 5, name: "OG Base", minXP: 7500,  maxXP: 14999,    color: "#00d4ff", emoji: "🔥" },
  { level: 6, name: "Phoenix", minXP: 15000, maxXP: Infinity,  color: "#f0b429", emoji: "🦅" },
];

export function getLevelInfo(xp) {
  const num = Number(xp || 0);
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (num >= LEVELS[i].minXP) {
      const current  = LEVELS[i];
      const next     = LEVELS[i + 1] || null;
      const progress = next ? ((num - current.minXP) / (next.minXP - current.minXP)) * 100 : 100;
      return { current, next, xp: num, progress: Math.min(progress, 100) };
    }
  }
  return { current: LEVELS[0], next: LEVELS[1], xp: num, progress: 0 };
}

export function shortAddr(addr) { if (!addr || addr.length < 10) return addr; return addr.slice(0, 6) + "..." + addr.slice(-4); }
export function formatEth(wei, decimals = 4) { if (!wei) return "0"; return parseFloat(ethers.formatEther(wei)).toFixed(decimals); }
export function formatNumber(n) { return Number(n || 0).toLocaleString("en-US"); }
export function timeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (seconds < 60)    return seconds + "s ago";
  if (seconds < 3600)  return Math.floor(seconds / 60) + "m ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
  return Math.floor(seconds / 86400) + "d ago";
}
export function mmss(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds)));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
}

let _ethPrice = null, _ethPriceAt = 0;
export async function getEthPrice() {
  const now = Date.now();
  if (_ethPrice && now - _ethPriceAt < 120000) return _ethPrice;
  try {
    const res   = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
    const data  = await res.json();
    _ethPrice   = data.ethereum?.usd || 2500;
    _ethPriceAt = now;
    return _ethPrice;
  } catch { return _ethPrice || 2500; }
}
export function ethToUsd(ethAmount, ethPrice) { return (parseFloat(ethAmount || 0) * (ethPrice || 2500)).toFixed(2); }

// ── Token List (Base Mainnet) ──────────────────────────────────────────────
export const BASE_TOKENS = [
  { symbol: "ETH",  name: "Ethereum",       address: "native",                                     decimals: 18, logoURI: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png" },
  { symbol: "USDC", name: "USD Coin",        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6,  logoURI: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png" },
  { symbol: "USDT", name: "Tether USD",      address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", decimals: 6,  logoURI: "https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png" },
  { symbol: "DAI",  name: "Dai Stablecoin",  address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18, logoURI: "https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png" },
  { symbol: "WETH", name: "Wrapped Ether",   address: "0x4200000000000000000000000000000000000006", decimals: 18, logoURI: "https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png" },
  { symbol: "cbETH","name": "Coinbase ETH",  address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", decimals: 18, logoURI: "https://tokens.1inch.io/0xbe9895146f7af43049ca1c1ae358b0541ea49704.png" },
  { symbol: "AERO", name: "Aerodrome",       address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631", decimals: 18, logoURI: "https://tokens.1inch.io/0x940181a94a35a4569e4529a3cdfb74e38fd98631.png" },
  { symbol: "OFC",  name: "OFC",             address: "0x752C5a95d202972E124390F30a50154409d3c858", decimals: 18, logoURI: "" },
];

export const DEPLOY_PLATFORMS = [
  { id: "deployRemix", name: "Deploy on Remix IDE", icon: "🔧", url: "https://remix.ethereum.org", xp: 50, color: "#00d4ff" },
];

export const SWAP_PLATFORMS = [
  { id: "swapAerodrome", name: "Swap on Aerodrome", icon: "✈️", url: "https://aerodrome.finance/swap",                          xp: 50, color: "#ff6b6b" },
  { id: "swapUniswap",   name: "Swap on Uniswap",   icon: "🦄", url: "https://app.uniswap.org/#/swap?chain=base",               xp: 50, color: "#ff007a" },
  { id: "swapJumper",    name: "Swap on Jumper",    icon: "🦗", url: "https://jumper.exchange/?fromChain=8453&toChain=8453",     xp: 50, color: "#a855f7" },
  { id: "swapRelay",     name: "Swap on Relay",     icon: "⚡", url: "https://relay.link/swap?fromChainId=8453&toChainId=8453", xp: 50, color: "#00d4ff" },
];

export const BRIDGE_PLATFORMS = [
  { id: "bridgeJumper", name: "Bridge via Jumper", icon: "🦗", url: "https://jumper.exchange/?fromChain=1&toChain=8453", xp: 50, color: "#a855f7" },
  { id: "bridgeRelay",  name: "Bridge via Relay",  icon: "⚡", url: "https://relay.link/bridge/base",                   xp: 50, color: "#00d4ff" },
];

export const TASKS = [
  { id: "gm",       name: "GM Base",           description: "Post an on-chain GM message to Base",  xp: 50,  ethCost: "0.00005", icon: "☀️", daily: true,  field: "gmMessage", fieldLabel: "Your GM message (optional)", fieldPlaceholder: "GM Base!" },
  { id: "deploy",   name: "Deploy Contract",    description: "Deploy a real contract to Base — done from inside the app", xp: 100, ethCost: "0.00005", icon: "🚀", daily: true,  field: "greeting", fieldLabel: "Greeting baked into your contract (optional)", fieldPlaceholder: "GM Base!", hasSubs: true },
  { id: "swap",     name: "Swap on Base",       description: "Swap on any Base DEX",                 xp: 75,  ethCost: "0.00005", icon: "🔄", daily: true,  field: null, hasSubs: true },
  { id: "basedswap",name: "BaseQuest DEX",      description: "Swap directly & earn XP multipliers",  xp: 100, ethCost: "0%",      icon: "💎", daily: false, field: null, hasSubs: false, isDEX: true },
  { id: "bridge",   name: "Bridge to Base",     description: "Bridge assets to Base",                xp: 100, ethCost: "0.00005", icon: "🌉", daily: true,  field: null, hasSubs: true },
  { id: "game",     name: "Boss Raid",          description: "Attack the boss & win the prize pool", xp: 75,  ethCost: "0.00005", icon: "🐉", daily: true,  field: null },
  { id: "profile",  name: "Set Profile",        description: "Set your on-chain username",           xp: 50,  ethCost: "0.00005", icon: "🪪", daily: false, oneTime: true, field: "username", fieldLabel: "Username (max 32 chars)", fieldPlaceholder: "based_degen" },
  { id: "streak",   name: "Streak Bonus",       description: "Auto-awarded every 7 days",            xp: 200, ethCost: "0",       icon: "🔥", daily: false, auto: true },
];
