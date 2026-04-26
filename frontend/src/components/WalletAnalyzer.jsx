import { useState } from "react";
import { getWalletAnalysis } from "../utils/basescan";
import {
  SearchIcon, ZapIcon, AlertIcon, LinkIcon,
  SwapIcon, BridgeIcon, BarChartIcon, CoinIcon,
  ListIcon, ClockIcon, TrophyIcon, SeedlingIcon,
  EthereumIcon,
} from "./Icons";

const SCORE_LEVELS = [
  { min: 0,  max: 20,  label: "Ghost",       color: "#4a5568" },
  { min: 21, max: 40,  label: "Newcomer",    color: "#8892a4" },
  { min: 41, max: 60,  label: "Active User", color: "#00c853" },
  { min: 61, max: 80,  label: "OG Farmer",   color: "#0052ff" },
  { min: 81, max: 100, label: "Base Chad",   color: "#f0b429" },
];

function getScoreLevel(score) {
  return SCORE_LEVELS.find(l => score >= l.min && score <= l.max) || SCORE_LEVELS[0];
}

function shortHash(hash) {
  if (!hash) return "—";
  return hash.slice(0, 8) + "..." + hash.slice(-6);
}

function formatAmount(amount) {
  if (amount >= 1e9)  return (amount / 1e9).toFixed(2)  + "B";
  if (amount >= 1e6)  return (amount / 1e6).toFixed(2)  + "M";
  if (amount >= 1e3)  return (amount / 1e3).toFixed(2)  + "K";
  if (amount >= 1)    return amount.toFixed(2);
  if (amount >= 0.01) return amount.toFixed(4);
  return "< 0.01";
}

function formatUSD(amount) {
  if (!amount && amount !== 0) return null;
  const n = parseFloat(amount);
  if (n === 0) return "$0";
  if (n >= 1e9)  return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6)  return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3)  return "$" + (n / 1e3).toFixed(2) + "K";
  if (n >= 1)    return "$" + n.toFixed(2);
  return "< $0.01";
}

export default function WalletAnalyzer({ wallet, theme, isDark }) {
  if (!theme) theme = { text: "#f1f5f9", textMuted: "#64748b", textDim: "#334155", bgCard: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)" };

  const [inputAddress,  setInputAddress]  = useState("");
  const [analysis,      setAnalysis]      = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [showAllTokens, setShowAllTokens] = useState(false);

  const handleAnalyze = async () => {
    const addr = inputAddress.trim();
    if (!addr || addr.length < 10) return setError("Enter a valid wallet address");
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setShowAllTokens(false);
    try {
      const result = await getWalletAnalysis(addr);
      setAnalysis(result);
    } catch (err) {
      setError("Failed to analyze wallet: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const useConnected = () => {
    if (wallet?.address) setInputAddress(wallet.address);
  };

  const scoreLevel = analysis ? getScoreLevel(analysis.baseScore) : null;

  const tokenColors = [
    "#0052ff", "#00c853", "#f0b429", "#00d4ff",
    "#ff6b6b", "#7c3aed", "#ff9500", "#00b4d8",
  ];

  return (
    <div style={{ padding: "24px 0" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <SearchIcon size={18} style={{ color: "#a855f7" }} />
          <h2 style={{ color: theme.text, fontSize: "20px", fontWeight: "700", margin: 0, letterSpacing: "-0.3px" }}>
            Wallet Analyzer
          </h2>
        </div>
        <p style={{ color: theme.textMuted, fontSize: "13px", margin: 0 }}>
          Analyze any Base wallet's on-chain activity and get a Base Score.
        </p>
      </div>

      {/* Input */}
      <div style={{
        background:   theme.bgCard,
        border:       `1px solid ${theme.border}`,
        borderRadius: "16px",
        padding:      "20px",
        marginBottom: "20px",
      }}>
        <label style={{ color: theme.textMuted, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
          Wallet Address
        </label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="0x..."
            value={inputAddress}
            onChange={e => setInputAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAnalyze()}
            style={{
              flex:         "1 1 180px",
              minWidth:     0,
              background:   isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              border:       `1px solid ${theme.border}`,
              borderRadius: "10px",
              padding:      "11px 14px",
              color:        theme.text,
              fontSize:     "14px",
              outline:      "none",
            }}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              background:   loading ? "rgba(0,82,255,0.3)" : "linear-gradient(135deg, #0052ff, #0041cc)",
              border:       "none",
              borderRadius: "10px",
              padding:      "11px 20px",
              color:        "white",
              fontWeight:   "600",
              fontSize:     "13px",
              cursor:       loading ? "not-allowed" : "pointer",
              whiteSpace:   "nowrap",
              fontFamily:   "inherit",
              display:      "flex",
              alignItems:   "center",
              gap:          "7px",
            }}
          >
            <SearchIcon size={14} />
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        {wallet?.address && (
          <div
            onClick={useConnected}
            style={{ color: "#0052ff", fontSize: "13px", fontWeight: "600", marginTop: "10px", cursor: "pointer" }}
          >
            Use connected wallet →
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background:   "rgba(255,59,59,0.1)",
          border:       "1px solid rgba(255,59,59,0.3)",
          borderRadius: "12px",
          padding:      "12px 16px",
          marginBottom: "16px",
          color:        "#ff6b6b",
          fontWeight:   "600",
          fontSize:     "14px",
          display:      "flex",
          alignItems:   "center",
          gap:          "8px",
        }}><AlertIcon size={14} />{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: theme.textMuted }}>
          <style>{`
            @keyframes scanLine {
              0%   { top: 8%; opacity: 0; }
              10%  { opacity: 1; }
              90%  { opacity: 1; }
              100% { top: 82%; opacity: 0; }
            }
            @keyframes scanPulse {
              0%, 100% { opacity: 0.5; transform: scale(1); }
              50%       { opacity: 1;   transform: scale(1.08); }
            }
            @keyframes scanCorner { 0%,100%{opacity:0.3} 50%{opacity:1} }
          `}</style>

          {/* Scanner box */}
          <div style={{
            position:     "relative",
            width:        "88px",
            height:       "88px",
            margin:       "0 auto 20px",
            background:   "rgba(168,85,247,0.04)",
            borderRadius: "16px",
            overflow:     "hidden",
          }}>
            {/* Corner brackets */}
            {[
              { top: 6,  left: 6,  borderTop: "2px solid #a855f7", borderLeft:  "2px solid #a855f7" },
              { top: 6,  right: 6, borderTop: "2px solid #a855f7", borderRight: "2px solid #a855f7" },
              { bottom: 6, left: 6,  borderBottom: "2px solid #a855f7", borderLeft:  "2px solid #a855f7" },
              { bottom: 6, right: 6, borderBottom: "2px solid #a855f7", borderRight: "2px solid #a855f7" },
            ].map((s, i) => (
              <div key={i} style={{
                position: "absolute", width: "14px", height: "14px",
                animation: `scanCorner 1.8s ease-in-out ${i * 0.15}s infinite`,
                ...s,
              }} />
            ))}

            {/* Moving scan line */}
            <div style={{
              position:   "absolute",
              left:       0,
              right:      0,
              height:     "2px",
              background: "linear-gradient(90deg, transparent, #a855f7 30%, #0052ff 70%, transparent)",
              boxShadow:  "0 0 10px 2px rgba(168,85,247,0.5)",
              animation:  "scanLine 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
            }} />

            {/* Center icon */}
            <div style={{
              position:  "absolute",
              top:       "50%",
              left:      "50%",
              transform: "translate(-50%, -50%)",
              animation: "scanPulse 1.8s ease-in-out infinite",
            }}>
              <SearchIcon size={30} style={{ color: "#a855f7" }} />
            </div>
          </div>

          <div style={{ fontSize: "14px", marginBottom: "6px", color: theme.text, fontWeight: "600" }}>
            Fetching on-chain data...
          </div>
          <div style={{ fontSize: "12px", color: theme.textMuted }}>
            Fetching transactions, token transfers and prices
          </div>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Base Score */}
          <div style={{
            background:   theme.bgCard,
            border:       `1px solid ${scoreLevel.color}33`,
            borderRadius: "16px",
            padding:      "28px 20px",
            textAlign:    "center",
          }}>
            <div style={{ color: theme.textMuted, fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
              Base Score
            </div>
            <div style={{ color: scoreLevel.color, fontSize: "64px", fontWeight: "900", lineHeight: 1 }}>
              {analysis.baseScore}
            </div>
            <div style={{ color: theme.text, fontSize: "18px", fontWeight: "800", marginTop: "8px" }}>
              {scoreLevel.label}
            </div>
            <div style={{ color: theme.textMuted, fontSize: "13px", marginTop: "4px" }}>out of 100</div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { label: "Total Txs",  value: analysis.totalTxs.toLocaleString(), color: theme.text },
              { label: "Wallet Age", value: analysis.walletAgeDays + "d",        color: theme.text },
              { label: "Contracts",  value: analysis.uniqueContracts,            color: theme.text },
              { label: "Failed Txs", value: analysis.failedCount,                color: analysis.failedCount > 0 ? "#ff6b6b" : theme.text },
            ].map(stat => (
              <div key={stat.label} style={{
                background:   theme.bgCard,
                border:       `1px solid ${theme.border}`,
                borderRadius: "12px",
                padding:      "16px",
                textAlign:    "center",
              }}>
                <div style={{ color: stat.color, fontSize: "22px", fontWeight: "800" }}>{stat.value}</div>
                <div style={{ color: theme.textMuted, fontSize: "12px", marginTop: "4px" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── Total Volume Card ── */}
          <div style={{
            background:   "linear-gradient(135deg, rgba(0,82,255,0.07), rgba(124,58,237,0.07))",
            border:       "1px solid rgba(0,82,255,0.25)",
            borderRadius: "16px",
            padding:      "20px",
          }}>

            {/* Grand total USD */}
            <div style={{
              textAlign:    "center",
              marginBottom: "20px",
              paddingBottom:"16px",
              borderBottom: `1px solid ${theme.border}`,
            }}>
              <div style={{ color: theme.textMuted, fontSize: "12px", fontWeight: "600", marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <BarChartIcon size={13} /> TOTAL ON-CHAIN VOLUME
              </div>
              <div style={{ color: theme.text, fontSize: "38px", fontWeight: "900", lineHeight: 1 }}>
                {analysis.grandTotalUSD > 0
                  ? formatUSD(analysis.grandTotalUSD)
                  : formatAmount(parseFloat(analysis.totalVolEth)) + " ETH"}
              </div>
              {analysis.grandTotalUSD > 0 && (
                <div style={{ color: theme.textMuted, fontSize: "12px", marginTop: "6px" }}>
                  ETH volume + all token transfers on Base Mainnet
                </div>
              )}
            </div>

            {/* Swaps + Bridges row */}
            <div style={{
              display:      "grid",
              gridTemplateColumns: "1fr 1fr",
              gap:          "10px",
              marginBottom: "16px",
            }}>
              <div style={{
                background:   "rgba(0,82,255,0.08)",
                border:       "1px solid rgba(0,82,255,0.2)",
                borderRadius: "12px",
                padding:      "14px",
                textAlign:    "center",
              }}>
                <div style={{ marginBottom: "4px", display: "flex", justifyContent: "center" }}>
                  <SwapIcon size={24} style={{ color: "#0052ff" }} />
                </div>
                <div style={{ color: theme.text, fontSize: "24px", fontWeight: "900" }}>
                  {analysis.totalSwaps.toLocaleString()}
                </div>
                <div style={{ color: theme.textMuted, fontSize: "12px", marginTop: "4px" }}>
                  Total Swaps on Base
                </div>
              </div>
              <div style={{
                background:   "rgba(124,58,237,0.08)",
                border:       "1px solid rgba(124,58,237,0.2)",
                borderRadius: "12px",
                padding:      "14px",
                textAlign:    "center",
              }}>
                <div style={{ marginBottom: "4px", display: "flex", justifyContent: "center" }}>
                  <BridgeIcon size={24} style={{ color: "#7c3aed" }} />
                </div>
                <div style={{ color: theme.text, fontSize: "24px", fontWeight: "900" }}>
                  {analysis.totalBridges.toLocaleString()}
                </div>
                <div style={{ color: theme.textMuted, fontSize: "12px", marginTop: "4px" }}>
                  Total Bridges to Base
                </div>
              </div>
            </div>

            {/* ETH volume breakdown */}
            <div style={{
              background:   theme.bgCard,
              border:       `1px solid ${theme.border}`,
              borderRadius: "12px",
              padding:      "14px",
              marginBottom: "12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{
                  width:          "32px",
                  height:         "32px",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  flexShrink:     0,
                }}>
                  <EthereumIcon size={32} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: theme.text, fontSize: "13px", fontWeight: "800" }}>Ethereum (ETH)</div>
                  <div style={{ color: theme.textMuted, fontSize: "11px" }}>Native currency</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: theme.text, fontSize: "14px", fontWeight: "900" }}>
                    {formatAmount(parseFloat(analysis.totalVolEth))} ETH
                  </div>
                  {analysis.ethVolUSD > 0 && (
                    <div style={{ color: "#00c853", fontSize: "12px", fontWeight: "700" }}>
                      ≈ {formatUSD(analysis.ethVolUSD)}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{
                  flex:         1,
                  background:   "rgba(255,107,107,0.08)",
                  border:       "1px solid rgba(255,107,107,0.2)",
                  borderRadius: "8px",
                  padding:      "8px",
                  textAlign:    "center",
                }}>
                  <div style={{ color: "#ff6b6b", fontSize: "10px", fontWeight: "700", marginBottom: "3px" }}>↑ SENT</div>
                  <div style={{ color: theme.text, fontSize: "12px", fontWeight: "800" }}>
                    {formatAmount(parseFloat(analysis.totalSentEth))} ETH
                  </div>
                  {analysis.totalSentUSD && (
                    <div style={{ color: theme.textMuted, fontSize: "10px" }}>≈ {formatUSD(analysis.totalSentUSD)}</div>
                  )}
                </div>
                <div style={{
                  flex:         1,
                  background:   "rgba(0,200,83,0.08)",
                  border:       "1px solid rgba(0,200,83,0.2)",
                  borderRadius: "8px",
                  padding:      "8px",
                  textAlign:    "center",
                }}>
                  <div style={{ color: "#00c853", fontSize: "10px", fontWeight: "700", marginBottom: "3px" }}>↓ RECEIVED</div>
                  <div style={{ color: theme.text, fontSize: "12px", fontWeight: "800" }}>
                    {formatAmount(parseFloat(analysis.totalRecvEth))} ETH
                  </div>
                  {analysis.totalRecvUSD && (
                    <div style={{ color: theme.textMuted, fontSize: "10px" }}>≈ {formatUSD(analysis.totalRecvUSD)}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Token volumes */}
            {analysis.tokenVolumes.length > 0 ? (
              <>
                <div style={{
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "center",
                  marginBottom:   "8px",
                }}>
                  <div style={{ color: theme.textMuted, fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}>
                    <CoinIcon size={13} /> Token Transfers · {analysis.tokenVolumes.length} assets · {analysis.totalTokenTxs} txs
                  </div>
                  {analysis.totalTokenUSD > 0 && (
                    <div style={{ color: "#f0b429", fontSize: "12px", fontWeight: "800" }}>
                      {formatUSD(analysis.totalTokenUSD)}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(showAllTokens ? analysis.tokenVolumes : analysis.tokenVolumes.slice(0, 5)).map((t, i) => (
                    <div key={t.symbol} style={{
                      background:   theme.bgCard,
                      border:       `1px solid ${theme.border}`,
                      borderRadius: "10px",
                      padding:      "12px 14px",
                      display:      "flex",
                      alignItems:   "center",
                      gap:          "12px",
                    }}>
                      <div style={{
                        width:          "36px",
                        height:         "36px",
                        borderRadius:   "50%",
                        background:     tokenColors[i % tokenColors.length] + "22",
                        border:         `1px solid ${tokenColors[i % tokenColors.length]}55`,
                        display:        "flex",
                        alignItems:     "center",
                        justifyContent: "center",
                        color:          tokenColors[i % tokenColors.length],
                        fontSize:       "10px",
                        fontWeight:     "900",
                        flexShrink:     0,
                      }}>
                        {t.symbol.slice(0, 3)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ color: theme.text, fontSize: "13px", fontWeight: "800" }}>{t.symbol}</div>
                            <div style={{
                              color:        theme.textMuted,
                              fontSize:     "11px",
                              overflow:     "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace:   "nowrap",
                              maxWidth:     "130px",
                            }}>
                              {t.name}
                            </div>
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ color: theme.text, fontSize: "13px", fontWeight: "800" }}>
                              {formatAmount(t.totalAmount)} {t.symbol}
                            </div>
                            {t.hasPrice && t.totalUSD > 0 ? (
                              <div style={{ color: "#00c853", fontSize: "11px", fontWeight: "700" }}>
                                ≈ {formatUSD(t.totalUSD)}
                              </div>
                            ) : (
                              <div style={{ color: theme.textMuted, fontSize: "11px" }}>
                                {t.txCount} tx{t.txCount !== 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                        {(t.sentAmount > 0 || t.recvAmount > 0) && (
                          <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                            {t.sentAmount > 0 && (
                              <div style={{
                                background:   "rgba(255,107,107,0.1)",
                                border:       "1px solid rgba(255,107,107,0.2)",
                                borderRadius: "4px",
                                padding:      "2px 6px",
                                fontSize:     "10px",
                                color:        "#ff6b6b",
                                fontWeight:   "700",
                              }}>
                                ↑ {formatAmount(t.sentAmount)}
                                {t.hasPrice && t.sentUSD > 0 && ` (${formatUSD(t.sentUSD)})`}
                              </div>
                            )}
                            {t.recvAmount > 0 && (
                              <div style={{
                                background:   "rgba(0,200,83,0.1)",
                                border:       "1px solid rgba(0,200,83,0.2)",
                                borderRadius: "4px",
                                padding:      "2px 6px",
                                fontSize:     "10px",
                                color:        "#00c853",
                                fontWeight:   "700",
                              }}>
                                ↓ {formatAmount(t.recvAmount)}
                                {t.hasPrice && t.recvUSD > 0 && ` (${formatUSD(t.recvUSD)})`}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {analysis.tokenVolumes.length > 5 && (
                  <button
                    onClick={() => setShowAllTokens(v => !v)}
                    style={{
                      width:        "100%",
                      marginTop:    "10px",
                      background:   "rgba(0,82,255,0.08)",
                      border:       "1px solid rgba(0,82,255,0.2)",
                      borderRadius: "8px",
                      padding:      "9px",
                      color:        "#0052ff",
                      fontSize:     "13px",
                      fontWeight:   "700",
                      cursor:       "pointer",
                    }}
                  >
                    {showAllTokens
                      ? "Show less ↑"
                      : `Show all ${analysis.tokenVolumes.length} tokens ↓`}
                  </button>
                )}
              </>
            ) : (
              <div style={{
                textAlign:    "center",
                padding:      "16px",
                color:        theme.textMuted,
                fontSize:     "13px",
                background:   theme.bgCard,
                borderRadius: "10px",
              }}>
                No ERC-20 token transfers found
              </div>
            )}
          </div>

          {/* Transaction Milestones */}
          <div style={{
            background:   theme.bgCard,
            border:       `1px solid ${theme.border}`,
            borderRadius: "16px",
            padding:      "20px",
          }}>
            <div style={{ color: theme.text, fontSize: "15px", fontWeight: "800", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <ListIcon size={15} style={{ color: theme.textMuted }} /> Transaction Milestones
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { Icon: SeedlingIcon, label: "First Transaction on Base",   tx: analysis.firstTxOnBase,    color: "#f0b429", iconColor: "#00c853" },
                { Icon: ClockIcon,    label: "Latest Transaction on Base",   tx: analysis.latestTxOnBase,   color: "#f0b429", iconColor: "#0052ff" },
                { Icon: TrophyIcon,   label: "Largest Transaction on Base",  tx: analysis.largestTxOnBase,  color: "#00c853", iconColor: "#f0b429" },
                { Icon: SearchIcon,   label: "Smallest Transaction on Base", tx: analysis.smallestTxOnBase, color: "#ff6b6b", iconColor: "#ff6b6b" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  display:       "flex",
                  justifyContent:"space-between",
                  alignItems:    "center",
                  borderBottom:  i < 3 ? `1px solid ${theme.border}` : "none",
                  paddingBottom: i < 3 ? "12px" : "0",
                }}>
                  <div>
                    <div style={{ color: theme.textMuted, fontSize: "12px", fontWeight: "600", marginBottom: "3px", display: "flex", alignItems: "center", gap: "5px" }}>
                      <item.Icon size={12} style={{ color: item.iconColor }} /> {item.label}
                    </div>
                    <div style={{ color: theme.text, fontSize: "13px", fontWeight: "700" }}>
                      {item.tx?.date || "—"}
                    </div>
                    <a
                      href={`https://basescan.org/tx/${item.tx?.hash}`}
                      target="_blank" rel="noreferrer"
                      style={{ color: "#0052ff", fontSize: "11px", textDecoration: "none" }}
                    >
                      {shortHash(item.tx?.hash)}
                    </a>
                  </div>
                  <div style={{ color: item.color, fontSize: "13px", fontWeight: "800" }}>
                    {item.tx?.valueEth} ETH
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div style={{
            background:   theme.bgCard,
            border:       `1px solid ${theme.border}`,
            borderRadius: "16px",
            padding:      "20px",
          }}>
            <div style={{ color: theme.text, fontSize: "15px", fontWeight: "800", marginBottom: "16px" }}>
              Activity Heatmap (90 days)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginBottom: "10px" }}>
              {analysis.heatmap.cells.map((count, i) => {
                const intensity = count === 0 ? 0 : Math.min(1, count / analysis.heatmap.maxCount);
                const bg = count === 0
                  ? (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)")
                  : `rgba(0,82,255,${0.2 + intensity * 0.8})`;
                return (
                  <div key={i} title={`${count} tx`} style={{
                    width: "10px", height: "10px", borderRadius: "2px", background: bg,
                  }} />
                );
              })}
            </div>
            <div style={{ color: theme.textMuted, fontSize: "12px" }}>
              Longest streak: {analysis.heatmap.longestStreak} days
            </div>
          </div>

          {/* Top Contracts */}
          {analysis.topContracts.length > 0 && (
            <div style={{
              background:   theme.bgCard,
              border:       `1px solid ${theme.border}`,
              borderRadius: "16px",
              padding:      "20px",
            }}>
              <div style={{ color: theme.text, fontSize: "15px", fontWeight: "800", marginBottom: "16px" }}>
                Top Contracts
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {analysis.topContracts.map(({ contract, count }) => (
                  <div key={contract} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <a
                      href={`https://basescan.org/address/${contract}`}
                      target="_blank" rel="noreferrer"
                      style={{ color: "#0052ff", fontSize: "13px", textDecoration: "none", fontWeight: "600" }}
                    >
                      {contract.slice(0, 8) + "..." + contract.slice(-4)}
                    </a>
                    <span style={{
                      background:   "rgba(0,82,255,0.15)",
                      border:       "1px solid rgba(0,82,255,0.3)",
                      borderRadius: "20px",
                      padding:      "2px 10px",
                      color:        "#0052ff",
                      fontSize:     "12px",
                      fontWeight:   "700",
                    }}>
                      {count} txs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
                      }
