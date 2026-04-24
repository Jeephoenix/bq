import { useState } from "react";
import { GiftIcon, CheckCircleIcon, AlertIcon, SearchIcon, RefreshIcon } from "./Icons";
import { fetchTransactions } from "../utils/basescan";
import ProtocolLogo from "./ProtocolLogo";

const BRIDGE_CONTRACTS = new Set([
  "0x4200000000000000000000000000000000000010",
  "0x4200000000000000000000000000000000000007",
  "0x09aea4b2242abc8bb4bb78d537a67a245a7bec64",
  "0x4d73adb72bc3dd368966edd0f0b2148401a178e2",
  "0x45f1a95a4d3f3836523f5c83673c797f4d4d263b",
  "0xbe1a001fe942f96eea22ba08783140b9dcc09d28",
  "0xdc181bd607440361680d7d1c6e9be0d541ab0dd2",
  "0xe8cdf27acd73a434d661c84887215f7598e7d0d3",
  "0x8741ba6225a6bf91f9d73531a98a89807857a2b3",
  "0x6f03052743cd99ce1b29265e377e320cd24d2a2e",
  "0x6571d6be3d8460cf5f7d6711cd9961860029d85f",
  "0x80c67432656d59144ceff962e8faf8926599bcf8",
  "0xf70da97812cb96acdf810712aa562db8dfa3dbef",
  "0x9d39fc627a6d9d9f8c831c16995b209548cc3401",
  "0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae",
  "0x3a23f943181408eac424116af7b7790c94cb97a5",
  "0x43de2d77bf8027e25dbd179b491e8d64f38398aa",
  "0xbebdb6c8ddfc2206a9d5f1d1e9a18f9faffc6206",
  "0xb6319cc6c8c27a8f5daf0dd3df91ea35c4720dd7",
  "0x1a44076050125825900e736c501f859c50fe728c",
  "0xe432150cce91c13a887f7d836923d5597add8e31",
  "0x881e3a65b4d4a04dd529061dd0071cf975f58bcd",
  "0x3dc4874fc53fcbaacdf9f0f4b4498fde6ab5e79e",
]);

const DEX_CONTRACTS = {
  aerodrome: new Set([
    "0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43",
    "0x420dd381b31aef6683db6b902084cb0ffece40da",
  ]),
  uniswap: new Set([
    "0x2626664c2603336e57b271c5c0b26f421741e481",
    "0x6ff5693b99212da76ad316178a184ab56d299b43",
    "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
    "0x198ef79f1f515f02dfe9e3115ed9fc07183f02fc",
  ]),
  layerzero: new Set([
    "0xb6319cc6c8c27a8f5daf0dd3df91ea35c4720dd7",
    "0x1a44076050125825900e736c501f859c50fe728c",
  ]),
  wormhole: new Set([
    "0xbebdb6c8ddfc2206a9d5f1d1e9a18f9faffc6206",
    "0x24850c6f61c438823f01b7a3bf2b89b72174fa9d",
  ]),
  stargate: new Set([
    "0x45f1a95a4d3f3836523f5c83673c797f4d4d263b",
    "0xdc181bd607440361680d7d1c6e9be0d541ab0dd2",
    "0xe8cdf27acd73a434d661c84887215f7598e7d0d3",
  ]),
  across: new Set([
    "0x09aea4b2242abc8bb4bb78d537a67a245a7bec64",
    "0x4d73adb72bc3dd368966edd0f0b2148401a178e2",
  ]),
  hop: new Set([
    "0x8741ba6225a6bf91f9d73531a98a89807857a2b3",
    "0x6f03052743cd99ce1b29265e377e320cd24d2a2e",
  ]),
};

const AIRDROP_CRITERIA = [
  {
    id: "base_og",
    protocol: "Base OG",
    logo: "base",
    color: "#0052ff",
    description: "Wallets that bridged to Base before December 2023",
    status: "historical",
    check: (txs, addr) => {
      const cutoff = new Date("2024-01-01").getTime() / 1000;
      const addr_l = addr.toLowerCase();
      return txs.some(tx =>
        Number(tx.timeStamp) < cutoff &&
        BRIDGE_CONTRACTS.has(tx.to?.toLowerCase()) &&
        tx.from.toLowerCase() === addr_l
      );
    },
    criteria: ["Bridged to Base before Jan 2024", "Any bridge protocol counts"],
  },
  {
    id: "aerodrome",
    protocol: "Aerodrome (AERO)",
    logo: "aerodrome",
    color: "#0052ff",
    description: "Interacted with Aerodrome DEX on Base",
    status: "live",
    check: (txs, addr) => {
      const addr_l = addr.toLowerCase();
      return txs.some(tx =>
        DEX_CONTRACTS.aerodrome.has(tx.to?.toLowerCase()) &&
        tx.from.toLowerCase() === addr_l
      );
    },
    criteria: ["Used Aerodrome swap or liquidity"],
  },
  {
    id: "uniswap_v4",
    protocol: "Uniswap V4 (UNI)",
    logo: "uniswap",
    color: "#ff007a",
    description: "Active Uniswap V3 users on Base are likely eligible for V4 incentives",
    status: "upcoming",
    check: (txs, addr) => {
      const addr_l = addr.toLowerCase();
      const count = txs.filter(tx =>
        DEX_CONTRACTS.uniswap.has(tx.to?.toLowerCase()) &&
        tx.from.toLowerCase() === addr_l
      ).length;
      return count >= 3;
    },
    criteria: ["3+ swaps on Uniswap V3 on Base"],
  },
  {
    id: "layerzero",
    protocol: "LayerZero (ZRO)",
    logo: "layerzero",
    color: "#a855f7",
    description: "LayerZero bridge users on Base may qualify for ZRO distributions",
    status: "live",
    check: (txs, addr) => {
      const addr_l = addr.toLowerCase();
      return txs.some(tx =>
        DEX_CONTRACTS.layerzero.has(tx.to?.toLowerCase()) &&
        tx.from.toLowerCase() === addr_l
      );
    },
    criteria: ["Used LayerZero bridge at least once"],
  },
  {
    id: "wormhole",
    protocol: "Wormhole (W)",
    logo: "wormhole",
    color: "#00d4ff",
    description: "Wormhole bridge users on Base network",
    status: "live",
    check: (txs, addr) => {
      const addr_l = addr.toLowerCase();
      return txs.some(tx =>
        DEX_CONTRACTS.wormhole.has(tx.to?.toLowerCase()) &&
        tx.from.toLowerCase() === addr_l
      );
    },
    criteria: ["Bridged via Wormhole to/from Base"],
  },
  {
    id: "stargate",
    protocol: "Stargate (STG)",
    logo: "stargate",
    color: "#f59e0b",
    description: "Users who bridged through Stargate V1 or V2 on Base",
    status: "historical",
    check: (txs, addr) => {
      const addr_l = addr.toLowerCase();
      return txs.some(tx =>
        DEX_CONTRACTS.stargate.has(tx.to?.toLowerCase()) &&
        tx.from.toLowerCase() === addr_l
      );
    },
    criteria: ["Bridged using Stargate protocol"],
  },
  {
    id: "across",
    protocol: "Across Protocol (ACX)",
    logo: "across",
    color: "#00c853",
    description: "Used Across Protocol bridge with a Base spoke pool",
    status: "live",
    check: (txs, addr) => {
      const addr_l = addr.toLowerCase();
      return txs.some(tx =>
        DEX_CONTRACTS.across.has(tx.to?.toLowerCase()) &&
        tx.from.toLowerCase() === addr_l
      );
    },
    criteria: ["Used Across SpokePool on Base"],
  },
  {
    id: "active_base",
    protocol: "Base Activity",
    logo: "base",
    color: "#00d4ff",
    description: "Highly active Base wallet — qualifies for many future drops",
    status: "upcoming",
    check: (txs, addr) => {
      const addr_l = addr.toLowerCase();
      const sent = txs.filter(tx => tx.from.toLowerCase() === addr_l && tx.isError === "0");
      const age  = txs.length > 0
        ? (Date.now() / 1000 - Math.min(...txs.map(tx => Number(tx.timeStamp)))) / 86400
        : 0;
      return sent.length >= 50 && age >= 90;
    },
    criteria: ["50+ outgoing transactions", "Wallet age 90+ days on Base"],
  },
];

const STATUS_STYLES = {
  live:       { bg: "rgba(0,200,83,0.12)",  border: "rgba(0,200,83,0.3)",  color: "#00c853",  label: "LIVE" },
  upcoming:   { bg: "rgba(0,82,255,0.1)",   border: "rgba(0,82,255,0.3)",  color: "#0052ff",  label: "UPCOMING" },
  historical: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.3)", color: "#64748b", label: "SNAPSHOT" },
};

export default function AirdropChecker({ wallet, theme }) {
  const [address, setAddress]   = useState(wallet?.address || "");
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  async function check() {
    const addr = address.trim();
    if (!addr || !/^0x[0-9a-fA-F]{40}$/.test(addr)) {
      setError("Enter a valid 0x wallet address.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const txs = await fetchTransactions(addr);
      const out = AIRDROP_CRITERIA.map(c => ({
        ...c,
        eligible: c.check(txs, addr),
      }));
      setResults({ checks: out, txCount: txs.length, address: addr });
    } catch {
      setError("Failed to fetch transaction data. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const cardStyle = {
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: "14px",
    padding: "16px",
  };

  const eligible = results?.checks.filter(c => c.eligible).length || 0;

  return (
    <div style={{ paddingTop: "24px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <GiftIcon size={20} style={{ color: "#a855f7" }} />
          <span style={{ fontSize: "20px", fontWeight: "700", color: theme.text, letterSpacing: "-0.3px" }}>Airdrop Eligibility Checker</span>
        </div>
        <div style={{ fontSize: "13px", color: theme.textMuted }}>
          Scan any wallet against known Base ecosystem airdrop criteria
        </div>
      </div>

      {/* Input */}
      <div style={{ ...cardStyle, marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", color: theme.textMuted, fontWeight: "600", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
          Wallet Address
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && check()}
            placeholder="0x..."
            style={{
              flex: 1, background: "rgba(0,0,0,0.2)", border: `1px solid ${theme.border}`,
              borderRadius: "10px", padding: "10px 14px", color: theme.text,
              fontSize: "13px", fontFamily: "monospace", outline: "none",
            }}
          />
          <button
            onClick={check}
            disabled={loading}
            style={{
              background: loading ? "rgba(0,82,255,0.3)" : "#0052ff",
              border: "none", borderRadius: "10px", padding: "10px 20px",
              color: "white", fontWeight: "600", fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "7px", fontFamily: "inherit",
              boxShadow: loading ? "none" : "0 4px 16px rgba(168,85,247,0.3)",
              whiteSpace: "nowrap",
            }}
          >
            {loading
              ? <><RefreshIcon size={14} style={{ animation: "spin 1s linear infinite" }} /> Scanning...</>
              : <><SearchIcon size={14} /> Check Eligibility</>
            }
          </button>
        </div>
        {wallet?.address && address !== wallet.address && (
          <button
            onClick={() => setAddress(wallet.address)}
            style={{ background: "none", border: "none", color: "#0052ff", fontSize: "12px", cursor: "pointer", marginTop: "8px", padding: 0, fontFamily: "inherit" }}
          >
            ← Use connected wallet
          </button>
        )}
        {error && (
          <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center", color: "#ff6b6b", fontSize: "13px" }}>
            <AlertIcon size={14} /> {error}
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
            {[
              { label: "Eligible Drops", value: eligible, color: eligible > 0 ? "#00c853" : theme.textMuted },
              { label: "Total Criteria", value: results.checks.length },
              { label: "Txs Analyzed", value: results.txCount.toLocaleString() },
            ].map((s, i) => (
              <div key={i} style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "700", color: s.color || theme.text, marginBottom: "4px" }}>{s.value}</div>
                <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Eligible first */}
          {[true, false].map(show => {
            const group = results.checks.filter(c => c.eligible === show);
            if (!group.length) return null;
            return (
              <div key={String(show)}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: show ? "#00c853" : theme.textMuted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "10px", paddingLeft: "4px" }}>
                  {show ? `✓ Eligible (${group.length})` : `✗ Not Eligible (${group.length})`}
                </div>
                {group.map(c => {
                  const ss = STATUS_STYLES[c.status] || STATUS_STYLES.upcoming;
                  return (
                    <div
                      key={c.id}
                      style={{
                        ...cardStyle,
                        marginBottom: "8px",
                        borderColor: show ? "rgba(0,200,83,0.25)" : theme.border,
                        background: show ? "rgba(0,200,83,0.04)" : theme.bgCard,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <ProtocolLogo id={c.logo} size={34} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "14px", fontWeight: "700", color: theme.text }}>{c.protocol}</span>
                            <span style={{
                              background: ss.bg, border: `1px solid ${ss.border}`,
                              borderRadius: "20px", padding: "1px 7px",
                              color: ss.color, fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px",
                            }}>{ss.label}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: theme.textMuted, marginBottom: "8px" }}>{c.description}</div>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {c.criteria.map((cr, i) => (
                              <span
                                key={i}
                                style={{
                                  background: show ? "rgba(0,200,83,0.1)" : "rgba(100,116,139,0.1)",
                                  border: `1px solid ${show ? "rgba(0,200,83,0.2)" : "rgba(100,116,139,0.2)"}`,
                                  borderRadius: "20px", padding: "3px 10px",
                                  color: show ? "#00c853" : theme.textMuted,
                                  fontSize: "11px",
                                }}
                              >
                                {show ? "✓ " : "✗ "}{cr}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {show
                            ? <CheckCircleIcon size={20} style={{ color: "#00c853" }} />
                            : <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${theme.border}` }} />
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div style={{ fontSize: "11px", color: theme.textDim, textAlign: "center", marginTop: "16px" }}>
            Eligibility is estimated based on on-chain activity. Always verify with official airdrop announcements.
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
