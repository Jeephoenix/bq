import { useState } from "react";
import { LayersIcon, AlertIcon, SearchIcon, RefreshIcon, ArrowRightIcon, LinkIcon } from "./Icons";
import { fetchTransactions } from "../utils/basescan";
import ProtocolLogo from "./ProtocolLogo";

const BRIDGE_MAP = {
  "0x4200000000000000000000000000000000000010": { name: "Base Official Bridge", color: "#0052ff", logo: "base"      },
  "0x4200000000000000000000000000000000000007": { name: "Base Messenger",       color: "#0052ff", logo: "base"      },
  "0x09aea4b2242abc8bb4bb78d537a67a245a7bec64": { name: "Across Protocol",      color: "#00c853", logo: "across"    },
  "0x4d73adb72bc3dd368966edd0f0b2148401a178e2": { name: "Across Protocol V2",   color: "#00c853", logo: "across"    },
  "0x45f1a95a4d3f3836523f5c83673c797f4d4d263b": { name: "Stargate",             color: "#f59e0b", logo: "stargate"  },
  "0xbe1a001fe942f96eea22ba08783140b9dcc09d28": { name: "Stargate ETH",         color: "#f59e0b", logo: "stargate"  },
  "0xdc181bd607440361680d7d1c6e9be0d541ab0dd2": { name: "Stargate V2 USDC",     color: "#f59e0b", logo: "stargate"  },
  "0xe8cdf27acd73a434d661c84887215f7598e7d0d3": { name: "Stargate V2 ETH",      color: "#f59e0b", logo: "stargate"  },
  "0x8741ba6225a6bf91f9d73531a98a89807857a2b3": { name: "Hop Protocol",         color: "#e040fb", logo: "hop"       },
  "0x6f03052743cd99ce1b29265e377e320cd24d2a2e": { name: "Hop ETH Bridge",       color: "#e040fb", logo: "hop"       },
  "0xdb1a8c97e9a87d0d1e37de74aef4ac5f04a3cead": { name: "Hop USDC Bridge",      color: "#e040fb", logo: "hop"       },
  "0x6571d6be3d8460cf5f7d6711cd9961860029d85f": { name: "Synapse Protocol",     color: "#a855f7", logo: "synapse"   },
  "0x80c67432656d59144ceff962e8faf8926599bcf8": { name: "Orbiter Finance",      color: "#00d4ff", logo: "orbiter"   },
  "0xf70da97812cb96acdf810712aa562db8dfa3dbef": { name: "Relay Bridge",         color: "#64748b", logo: "relay"     },
  "0x9d39fc627a6d9d9f8c831c16995b209548cc3401": { name: "Celer cBridge",        color: "#f59e0b", logo: "celer"     },
  "0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae": { name: "LI.FI / Jumper",       color: "#0052ff", logo: "lifi"      },
  "0x3a23f943181408eac424116af7b7790c94cb97a5": { name: "Socket / Bungee",      color: "#00d4ff", logo: "socket"    },
  "0x43de2d77bf8027e25dbd179b491e8d64f38398aa": { name: "deBridge",             color: "#a855f7", logo: "debridge"  },
  "0xbebdb6c8ddfc2206a9d5f1d1e9a18f9faffc6206": { name: "Wormhole",             color: "#00d4ff", logo: "wormhole"  },
  "0x24850c6f61c438823f01b7a3bf2b89b72174fa9d": { name: "Wormhole Token Bridge", color: "#00d4ff", logo: "wormhole"  },
  "0xb6319cc6c8c27a8f5daf0dd3df91ea35c4720dd7": { name: "LayerZero",            color: "#a855f7", logo: "layerzero" },
  "0x1a44076050125825900e736c501f859c50fe728c": { name: "LayerZero V2",         color: "#a855f7", logo: "layerzero" },
  "0xe432150cce91c13a887f7d836923d5597add8e31": { name: "Axelar Gateway",       color: "#00c853", logo: "axelar"    },
  "0x881e3a65b4d4a04dd529061dd0071cf975f58bcd": { name: "Chainlink CCIP",       color: "#375bd2", logo: "chainlink" },
  "0x3dc4874fc53fcbaacdf9f0f4b4498fde6ab5e79e": { name: "Owlto Finance",        color: "#f59e0b", logo: "owlto"     },
  "0xe3e8cc42da487d1116d26687856e9fb684817c52": { name: "Rhino.fi",             color: "#a855f7", logo: "rhino"     },
};

const ALL_BRIDGE_ADDRS = new Set(Object.keys(BRIDGE_MAP));

function formatDate(ts) {
  return new Date(Number(ts) * 1000).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatETH(wei) {
  const eth = Number(BigInt(wei || "0")) / 1e18;
  if (eth === 0) return "—";
  if (eth < 0.0001) return "<0.0001 ETH";
  return `${eth.toFixed(4)} ETH`;
}

function shortAddr(addr) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function BridgeTracker({ wallet, theme }) {
  const [address, setAddress]   = useState(wallet?.address || "");
  const [data, setData]         = useState(null);
  const [loading, setLoad]      = useState(false);
  const [error, setError]       = useState(null);
  const [filterBridge, setFB]   = useState("All");

  async function track() {
    const addr = address.trim();
    if (!addr || !/^0x[0-9a-fA-F]{40}$/.test(addr)) {
      setError("Enter a valid 0x wallet address.");
      return;
    }
    setLoad(true);
    setError(null);
    setData(null);
    try {
      const txs = await fetchTransactions(addr);
      const addr_l = addr.toLowerCase();
      const bridgeTxs = txs
        .filter(tx => ALL_BRIDGE_ADDRS.has(tx.to?.toLowerCase()))
        .map(tx => ({
          ...tx,
          bridge: BRIDGE_MAP[tx.to.toLowerCase()],
          direction: tx.from.toLowerCase() === addr_l ? "out" : "in",
        }))
        .sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp));

      const bridges = [...new Set(bridgeTxs.map(t => t.bridge?.name).filter(Boolean))];
      const totalEth = bridgeTxs.reduce((s, tx) => s + Number(BigInt(tx.value || "0")), 0) / 1e18;

      setData({ txs: bridgeTxs, bridges, totalEth, address: addr });
    } catch {
      setError("Failed to fetch transactions. Try again.");
    } finally {
      setLoad(false);
    }
  }

  const cardStyle = {
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "12px",
  };

  const filtered = data
    ? (filterBridge === "All" ? data.txs : data.txs.filter(t => t.bridge?.name === filterBridge))
    : [];

  return (
    <div style={{ paddingTop: "24px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <LayersIcon size={20} style={{ color: "#00c853" }} />
          <span style={{ fontSize: "20px", fontWeight: "700", color: theme.text, letterSpacing: "-0.3px" }}>Bridge Tracker</span>
        </div>
        <div style={{ fontSize: "13px", color: theme.textMuted }}>
          See all assets bridged in and out of Base for any wallet
        </div>
      </div>

      {/* Input */}
      <div style={{ ...cardStyle }}>
        <div style={{ fontSize: "12px", color: theme.textMuted, fontWeight: "600", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
          Wallet Address
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && track()}
            placeholder="0x..."
            style={{
              flex: 1, background: "rgba(0,0,0,0.2)", border: `1px solid ${theme.border}`,
              borderRadius: "10px", padding: "10px 14px", color: theme.text,
              fontSize: "13px", fontFamily: "monospace", outline: "none",
            }}
          />
          <button
            onClick={track}
            disabled={loading}
            style={{
              background: loading ? "rgba(0,200,83,0.2)" : "linear-gradient(135deg, #00c853, #00d4ff)",
              border: "none", borderRadius: "10px", padding: "10px 20px",
              color: "white", fontWeight: "600", fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "7px", fontFamily: "inherit",
              boxShadow: loading ? "none" : "0 4px 16px rgba(0,200,83,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            {loading
              ? <><RefreshIcon size={14} style={{ animation: "spin 1s linear infinite" }} /> Tracking...</>
              : <><SearchIcon size={14} /> Track Bridges</>
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
      {data && (
        <>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "12px" }}>
            {[
              { label: "Bridge Txs",    value: data.txs.length },
              { label: "Bridges Used",  value: data.bridges.length },
              { label: "Total ETH Bridged", value: data.totalEth > 0 ? `${data.totalEth.toFixed(4)} ETH` : "0 ETH" },
            ].map((s, i) => (
              <div key={i} style={{ ...cardStyle, marginBottom: 0, textAlign: "center" }}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: theme.text, marginBottom: "4px" }}>{s.value}</div>
                <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          {data.bridges.length > 1 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
              {["All", ...data.bridges].map(b => {
                const active = filterBridge === b;
                return (
                  <button
                    key={b}
                    onClick={() => setFB(b)}
                    style={{
                      background: active ? "rgba(0,200,83,0.15)" : "transparent",
                      border: `1px solid ${active ? "rgba(0,200,83,0.4)" : theme.border}`,
                      borderRadius: "20px", padding: "5px 12px",
                      color: active ? "#00c853" : theme.textMuted,
                      fontSize: "12px", fontWeight: active ? "600" : "400",
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          )}

          {/* No bridges */}
          {data.txs.length === 0 && (
            <div style={{ ...cardStyle, textAlign: "center", padding: "40px" }}>
              <LayersIcon size={32} style={{ color: theme.textDim, marginBottom: "12px" }} />
              <div style={{ fontSize: "14px", color: theme.textMuted }}>No bridge transactions found for this wallet on Base.</div>
            </div>
          )}

          {/* Bridge tx list */}
          {filtered.map((tx, i) => {
            const bridge = tx.bridge;
            const isOut  = tx.direction === "out";
            return (
              <div
                key={tx.hash}
                style={{
                  ...cardStyle,
                  marginBottom: "8px",
                  borderLeft: `3px solid ${bridge?.color || "#64748b"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <ProtocolLogo id={bridge?.logo || "across"} size={30} />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: theme.text, marginBottom: "2px" }}>{bridge?.name || "Unknown Bridge"}</div>
                      <div style={{ fontSize: "12px", color: theme.textMuted }}>{formatDate(tx.timeStamp)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      background: isOut ? "rgba(255,107,107,0.1)" : "rgba(0,200,83,0.1)",
                      border: `1px solid ${isOut ? "rgba(255,107,107,0.3)" : "rgba(0,200,83,0.3)"}`,
                      borderRadius: "20px", padding: "3px 10px",
                      color: isOut ? "#ff6b6b" : "#00c853",
                      fontSize: "11px", fontWeight: "700",
                    }}>
                      {isOut ? "↑ OUT" : "↓ IN"}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: theme.text }}>
                      {formatETH(tx.value)}
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", color: theme.textMuted, fontFamily: "monospace" }}>
                    {shortAddr(tx.from)} <ArrowRightIcon size={10} style={{ display: "inline", verticalAlign: "middle" }} /> {shortAddr(tx.to)}
                  </span>
                  <a
                    href={`https://basescan.org/tx/${tx.hash}`}
                    target="_blank" rel="noreferrer"
                    style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", color: "#0052ff", fontSize: "11px", fontWeight: "600", textDecoration: "none" }}
                  >
                    <LinkIcon size={11} /> View Tx
                  </a>
                </div>
              </div>
            );
          })}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
