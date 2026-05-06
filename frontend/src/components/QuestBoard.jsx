import { useState, useMemo } from "react";
  import { TASKS, SWAP_PLATFORMS, BRIDGE_PLATFORMS, DEPLOY_PLATFORMS } from "../utils/contracts";
  import BasedSwapDEX from "./BasedSwapDEX";
  import ProtocolLogo from "./ProtocolLogo";
  import {
    MapIcon, CheckIcon, CheckCircleIcon, ZapIcon, DiamondIcon,
    SwapIcon, BridgeIcon, CodeIcon, SwordIcon, SunriseIcon,
    IdCardIcon, FireIcon, AlertIcon, ChevronDownIcon, ChevronUpIcon,
    ArrowRightIcon, LinkIcon,
  } from "./Icons";

  const TASK_ICONS = {
    gm:      SunriseIcon,
    deploy:  CodeIcon,
    swap:    SwapIcon,
    bridge:  BridgeIcon,
    game:    SwordIcon,
    profile: IdCardIcon,
    streak:  FireIcon,
  };

  const PLATFORM_ICON_MAP = {
    deployRemix:   CodeIcon,
    swapAerodrome: SwapIcon,
    swapUniswap:   SwapIcon,
    swapJumper:    SwapIcon,
    swapRelay:     SwapIcon,
    bridgeJumper:  BridgeIcon,
    bridgeRelay:   BridgeIcon,
  };

  const PLATFORM_LOGO_IDS = {
    swapAerodrome: "aerodrome",
    swapUniswap:   "uniswap",
    swapJumper:    "lifi",
    swapRelay:     "relay",
    bridgeJumper:  "lifi",
    bridgeRelay:   "relay",
  };

  // ── Filter definitions ──────────────────────────────────────────────────────
  const FILTERS = [
    { id: "all",    label: "All Quests", match: () => true },
    { id: "daily",  label: "Daily",      match: (t) => t.daily === true },
    { id: "defi",   label: "DeFi",       match: (t) => t.id === "swap" || t.id === "bridge" },
    { id: "deploy", label: "Deploy",     match: (t) => t.id === "deploy" },
    { id: "bonus",  label: "Bonus",      match: (t) => !t.daily || t.auto || t.oneTime },
  ];

  // ── XP pill ─────────────────────────────────────────────────────────────────
  const XPPill = ({ xp, done }) => (
    <div style={{
      display:      "inline-flex",
      alignItems:   "center",
      gap:          "4px",
      padding:      "4px 10px",
      borderRadius: "20px",
      background:   done ? "rgba(0,200,83,0.12)" : "rgba(240,180,41,0.12)",
      border:       `1px solid ${done ? "rgba(0,200,83,0.25)" : "rgba(240,180,41,0.3)"}`,
      flexShrink:   0,
    }}>
      <ZapIcon size={10} style={{ color: done ? "#00c853" : "#f0b429", flexShrink: 0 }} />
      <span style={{
        color:      done ? "#00c853" : "#f0b429",
        fontWeight: "800",
        fontSize:   "13px",
        letterSpacing: "-0.02em",
        fontVariantNumeric: "tabular-nums",
      }}>
        +{xp}
      </span>
    </div>
  );

  // ── Category badge ───────────────────────────────────────────────────────────
  const CategoryBadge = ({ task }) => {
    const styles = {
      daily:   { bg: "rgba(0,82,255,0.1)",   border: "rgba(0,82,255,0.2)",   color: "#6b9fff",  label: "DAILY"    },
      onetime: { bg: "rgba(138,99,210,0.1)", border: "rgba(138,99,210,0.2)", color: "#a78bfa",  label: "ONE-TIME" },
      auto:    { bg: "rgba(240,180,41,0.1)", border: "rgba(240,180,41,0.2)", color: "#f0b429",  label: "AUTO"     },
      bonus:   { bg: "rgba(0,200,83,0.1)",   border: "rgba(0,200,83,0.2)",   color: "#00c853",  label: "BONUS XP" },
    };
    const key = task.auto ? "auto" : task.oneTime ? "onetime" : task.daily ? "daily" : "bonus";
    const s = styles[key];
    return (
      <span style={{
        background: s.bg, border: `1px solid ${s.border}`,
        borderRadius: "4px", padding: "2px 6px",
        color: s.color, fontSize: "9px", fontWeight: "700",
        letterSpacing: "0.07em", flexShrink: 0,
      }}>
        {s.label}
      </span>
    );
  };

  // ── Sub-task XP bonus indicator ──────────────────────────────────────────────
  const SubsIndicator = ({ done }) => (
    !done ? (
      <span style={{
        background: "rgba(0,82,255,0.1)", border: "1px solid rgba(0,82,255,0.2)",
        borderRadius: "4px", padding: "2px 6px",
        color: "#6b9fff", fontSize: "9px", fontWeight: "700",
        letterSpacing: "0.04em", flexShrink: 0,
      }}>
        +BONUS XP
      </span>
    ) : null
  );

  export default function QuestBoard({ quests, wallet, theme, isDark }) {
    if (!theme) theme = { text: "#f1f5f9", textMuted: "#64748b", textDim: "#334155", bgCard: "#12141a", border: "rgba(255,255,255,0.07)" };
    const { isConnected } = wallet;
    const {
      completeTask, getTaskStatus, getSubTaskStatus,
      txPending, lastTx, error, userProfile,
      completedCount, totalDaily, loading,
    } = quests;

    const [fieldValues,  setFieldValues]  = useState({});
    const [expandedTask, setExpandedTask] = useState(null);
    const [expandedSubs, setExpandedSubs] = useState({});
    const [showGuide,    setShowGuide]    = useState(false);
    const [showDEX,      setShowDEX]      = useState(false);
    const [activeFilter, setActiveFilter] = useState("all");

    const handleField = (taskId, field, value) => {
      setFieldValues(prev => ({ ...prev, [taskId]: { ...prev[taskId], [field]: value } }));
    };

    const handleComplete = async (taskId) => {
      await completeTask(taskId, fieldValues[taskId] || {});
    };

    const toggleSubs = (taskId) => {
      setExpandedSubs(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    };

    const totalXP    = userProfile?.totalXP || 0;
    const multiplier = totalXP >= 50000 ? 3 : totalXP >= 20000 ? 2 : totalXP >= 10000 ? 1.5 : 1;
    const xpForSwap  = Math.floor(100 * multiplier);

    // ── Filtered tasks ──────────────────────────────────────────────────────
    const nonDEX_tasks = useMemo(() => TASKS.filter(t => !t.isDEX), []);

    const filterCounts = useMemo(() => {
      const result = {};
      FILTERS.forEach(f => {
        const matching = nonDEX_tasks.filter(t => f.match(t));
        const done     = matching.filter(t => getTaskStatus(t.id).done).length;
        result[f.id]   = { total: matching.length, done };
      });
      return result;
    }, [nonDEX_tasks, getTaskStatus]);

    const visibleTasks = useMemo(() => {
      const filter = FILTERS.find(f => f.id === activeFilter);
      return nonDEX_tasks.filter(t => filter.match(t));
    }, [nonDEX_tasks, activeFilter]);

    const REMIX_GUIDE = [
      { step: "1",  title: "Open Remix IDE",            desc: "Go to remix.ethereum.org in your browser." },
      { step: "2",  title: "Create a new file",          desc: 'Click the 📄 icon in the File Explorer on the left. Name it anything, e.g. "MyContract.sol".' },
      { step: "3",  title: "Paste a simple contract",    desc: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\ncontract MyContract {\n    string public message = "GM Base!";\n}' },
      { step: "4",  title: "Compile the contract",       desc: 'Click the "Solidity Compiler" tab (2nd icon on left). Click "Compile MyContract.sol". You should see a green checkmark.' },
      { step: "5",  title: "Switch to Deploy tab",       desc: 'Click the "Deploy & Run Transactions" tab (3rd icon on left).' },
      { step: "6",  title: "Select Injected Provider",   desc: 'In the ENVIRONMENT dropdown, select "Injected Provider - MetaMask". Your wallet will pop up — approve the connection.' },
      { step: "7",  title: "Switch to Base Mainnet",     desc: "Make sure your wallet is on Base Mainnet (Chain ID: 8453). If not, switch networks in MetaMask or Coinbase Wallet." },
      { step: "8",  title: "Deploy the contract",        desc: 'Click the orange "Deploy" button. Your wallet will ask you to confirm the transaction. Approve it.' },
      { step: "9",  title: "Copy your contract address", desc: 'After deployment, look at the bottom left under "Deployed Contracts". You will see your contract address. Click the 📋 copy icon next to it.' },
      { step: "10", title: "Paste into BaseQuest",       desc: 'Come back here, paste the address into the "Deployed Contract Address" field above, then click Complete!' },
    ];

    const renderSubTasks = (platforms, groupId) => {
      const isOpen = expandedSubs[groupId];
      return (
        <div style={{ marginTop: "14px" }}>
          <div
            onClick={() => toggleSubs(groupId)}
            style={{
              color: "#6b9fff", fontSize: "13px", fontWeight: "600", cursor: "pointer",
              marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            {isOpen ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
            Platform sub-tasks
            <span style={{
              background: "rgba(0,82,255,0.1)", border: "1px solid rgba(0,82,255,0.2)",
              borderRadius: "4px", padding: "1px 6px",
              color: "#6b9fff", fontSize: "10px", fontWeight: "700",
            }}>+50 XP each</span>
          </div>
          {isOpen && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
              {platforms.map(p => {
                const subDone = getSubTaskStatus(p.id).done;
                return (
                  <div key={p.id}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      background: subDone ? "rgba(0,200,83,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${subDone ? "rgba(0,200,83,0.18)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: "10px", padding: "10px 14px",
                      transition: "border-color 0.15s",
                    }}>
                      <span style={{ display: "flex", alignItems: "center" }}>
                        {PLATFORM_LOGO_IDS[p.id]
                          ? <ProtocolLogo id={PLATFORM_LOGO_IDS[p.id]} size={30} />
                          : (() => { const PI = PLATFORM_ICON_MAP[p.id] || ZapIcon; return <PI size={18} style={{ color: p.color }} />; })()
                        }
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: theme.text, fontSize: "13px", fontWeight: "600" }}>{p.name}</div>
                      </div>
                      <a href={p.url} target="_blank" rel="noreferrer"
                        style={{ color: "#6b9fff", fontSize: "12px", fontWeight: "600", textDecoration: "none", flexShrink: 0 }}>
                        Go ↗
                      </a>
                      <button
                        onClick={() => completeTask(p.id)}
                        disabled={subDone || txPending}
                        style={{
                          background:   subDone ? "rgba(0,200,83,0.15)" : "rgba(0,82,255,0.1)",
                          border:       `1px solid ${subDone ? "rgba(0,200,83,0.3)" : "rgba(0,82,255,0.25)"}`,
                          borderRadius: "8px", padding: "5px 12px",
                          color:        subDone ? "#00c853" : "#6b9fff",
                          fontSize:     "12px", fontWeight: "700",
                          cursor:       subDone || txPending ? "not-allowed" : "pointer",
                          fontFamily:   "inherit", flexShrink: 0,
                        }}
                      >
                        {subDone ? "✓ Done" : "+50 XP"}
                      </button>
                    </div>
                    {p.id === "deployRemix" && (
                      <div style={{ marginTop: "8px" }}>
                        <div
                          onClick={() => setShowGuide(!showGuide)}
                          style={{
                            color: "#f0b429", fontSize: "12px", fontWeight: "600",
                            cursor: "pointer", padding: "8px 14px",
                            background: "rgba(240,180,41,0.06)",
                            border: "1px solid rgba(240,180,41,0.15)",
                            borderRadius: "8px",
                            display: "flex", alignItems: "center", gap: "6px",
                          }}
                        >
                          📖 {showGuide ? "▲ Hide" : "▼ Show"} step-by-step guide — How to deploy on Remix IDE
                        </div>
                        {showGuide && (
                          <div style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: "10px", padding: "16px", marginTop: "8px",
                            display: "flex", flexDirection: "column", gap: "14px",
                          }}>
                            <div style={{ color: theme.text, fontSize: "13px", fontWeight: "800", marginBottom: "4px" }}>
                              🚀 How to deploy a contract on Base using Remix IDE
                            </div>
                            {REMIX_GUIDE.map(g => (
                              <div key={g.step} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <div style={{
                                  minWidth: "26px", height: "26px",
                                  background: "rgba(0,82,255,0.15)",
                                  border: "1px solid rgba(0,82,255,0.3)",
                                  borderRadius: "50%",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: "#6b9fff", fontSize: "12px", fontWeight: "800", flexShrink: 0,
                                }}>
                                  {g.step}
                                </div>
                                <div>
                                  <div style={{ color: theme.text, fontSize: "13px", fontWeight: "700", marginBottom: "3px" }}>{g.title}</div>
                                  <div style={{ color: theme.textMuted, fontSize: "12px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{g.desc}</div>
                                </div>
                              </div>
                            ))}
                            <div style={{
                              background: "rgba(0,200,83,0.07)", border: "1px solid rgba(0,200,83,0.2)",
                              borderRadius: "8px", padding: "10px 14px",
                              color: "#00c853", fontSize: "12px", fontWeight: "600",
                            }}>
                              ✅ Once deployed, paste your contract address in the field above and click Complete to earn +100 XP!
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };

    // ── Not connected ────────────────────────────────────────────────────────
    if (!isConnected) return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "20px",
          background: "rgba(0,82,255,0.1)", border: "1px solid rgba(0,82,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 0 32px rgba(0,82,255,0.15)",
        }}>
          <MapIcon size={32} style={{ color: "#0052ff" }} />
        </div>
        <div style={{ color: theme.text, fontSize: "20px", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.03em" }}>Quest Board</div>
        <div style={{ color: theme.textMuted, fontSize: "14px" }}>Connect your wallet to start earning XP!</div>
      </div>
    );

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
      <div style={{ padding: "24px 0" }}>
        <div style={{ marginBottom: "20px" }}>
          <div className="skeleton" style={{ width: 140, height: 22, borderRadius: "6px", marginBottom: "8px" }} />
          <div className="skeleton" style={{ width: 220, height: 13, borderRadius: "4px" }} />
        </div>
        {/* Filter bar skeleton */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {[80, 64, 52, 68, 64].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: w, height: 30, borderRadius: "20px" }} />
          ))}
        </div>
        {/* DEX banner */}
        <div className="skeleton" style={{ height: 200, borderRadius: "20px", marginBottom: "20px" }} />
        {/* Quest cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "14px", padding: "16px 18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "12px" }} />
                  <div>
                    <div className="skeleton" style={{ width: 130, height: 16, borderRadius: "5px", marginBottom: "6px" }} />
                    <div className="skeleton" style={{ width: 180, height: 12, borderRadius: "4px" }} />
                  </div>
                </div>
                <div className="skeleton" style={{ width: 60, height: 28, borderRadius: "20px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    // ── Main render ──────────────────────────────────────────────────────────
    const allDone  = filterCounts["all"]?.done  || 0;
    const allTotal = filterCounts["all"]?.total || 0;

    return (
      <div style={{ padding: "24px 0" }}>

        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <MapIcon size={18} style={{ color: "#0052ff" }} />
            <h2 style={{ color: theme.text, fontSize: "22px", fontWeight: "800", margin: 0, letterSpacing: "-0.04em" }}>
              Quest Board
            </h2>
          </div>
          <p style={{ color: theme.textMuted, fontSize: "13px", margin: 0 }}>
            Complete quests to earn XP and level up on Base.{" "}
            <strong style={{
              color: allDone === allTotal ? "#00c853" : theme.text, fontWeight: "700",
              fontVariantNumeric: "tabular-nums",
            }}>
              {completedCount}/{totalDaily}
            </strong> daily done.
          </p>
        </div>

        {/* ── Filter tabs ──────────────────────────────────────────────────── */}
        <div style={{
          display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px",
          overflowX: "auto", paddingBottom: "2px",
        }}>
          {FILTERS.map(f => {
            const counts   = filterCounts[f.id] || { total: 0, done: 0 };
            const isActive = activeFilter === f.id;
            const allDone  = counts.done === counts.total && counts.total > 0;
            return (
              <button
                key={f.id}
                onClick={() => { setActiveFilter(f.id); setExpandedTask(null); }}
                style={{
                  display:      "inline-flex",
                  alignItems:   "center",
                  gap:          "6px",
                  padding:      "6px 14px",
                  borderRadius: "20px",
                  fontFamily:   "inherit",
                  fontSize:     "12px",
                  fontWeight:   isActive ? "700" : "500",
                  cursor:       "pointer",
                  border:       `1px solid ${isActive ? "rgba(0,82,255,0.5)" : "rgba(255,255,255,0.09)"}`,
                  background:   isActive ? "rgba(0,82,255,0.14)" : "rgba(255,255,255,0.03)",
                  color:        isActive ? "#6b9fff" : "#64748b",
                  boxShadow:    isActive ? "0 0 14px rgba(0,82,255,0.18)" : "none",
                  transition:   "all 0.15s",
                  whiteSpace:   "nowrap",
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#c1c9d6"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}}
              >
                {f.label}
                <span style={{
                  display:      "inline-flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  minWidth:     "18px",
                  height:       "18px",
                  borderRadius: "10px",
                  padding:      "0 5px",
                  background:   allDone
                    ? "rgba(0,200,83,0.2)"
                    : isActive
                      ? "rgba(0,82,255,0.2)"
                      : "rgba(255,255,255,0.08)",
                  color:  allDone ? "#00c853" : isActive ? "#6b9fff" : "#64748b",
                  fontSize: "10px",
                  fontWeight: "800",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {allDone ? "✓" : `${counts.done}/${counts.total}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── BaseQuest DEX Exclusive Banner (only on All or DeFi) ─────────── */}
        {(activeFilter === "all" || activeFilter === "defi") && (
          <div style={{
            background:   "linear-gradient(135deg, #0a0f2e 0%, #0d1a4a 40%, #1a0a3e 100%)",
            border:       "1px solid rgba(0,82,255,0.4)",
            borderRadius: "20px",
            padding:      "24px 20px",
            marginBottom: "20px",
            position:     "relative",
            overflow:     "hidden",
            boxShadow:    "0 0 0 1px rgba(0,82,255,0.06), 0 8px 32px rgba(0,82,255,0.1)",
          }}>
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", background: "radial-gradient(circle, rgba(0,82,255,0.3) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(0,82,255,0.15) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

            <div className="dex-banner-top-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "52px", height: "52px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(0,82,255,0.12)", borderRadius: "12px", border: "1px solid rgba(0,82,255,0.2)",
                }}>
                  <DiamondIcon size={24} style={{ color: "white" }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ color: "white", fontSize: "18px", fontWeight: "900" }}>BaseQuest DEX</span>
                    <span style={{
                      background: "rgba(0,82,255,0.15)", border: "1px solid rgba(0,82,255,0.25)",
                      borderRadius: "5px", padding: "2px 8px",
                      color: "#6b9fff", fontSize: "10px", fontWeight: "700", letterSpacing: "0.04em",
                    }}>EXCLUSIVE</span>
                  </div>
                  <div style={{ color: "#8892a4", fontSize: "12px", marginTop: "2px" }}>
                    Swap any token on Base and earn XP every time
                  </div>
                </div>
              </div>
              <div className="dex-banner-xp" style={{ textAlign: "right" }}>
                <div style={{ color: "#f0b429", fontSize: "22px", fontWeight: "900", textShadow: "0 0 20px rgba(240,180,41,0.5)" }}>
                  +{xpForSwap} XP
                </div>
                <div style={{ color: "#8892a4", fontSize: "10px" }}>per swap</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
              {[
                { label: "1x",   xp: "Default", color: "#8892a4", bg: "rgba(136,146,164,0.12)" },
                { label: "1.5x", xp: "10K XP",  color: "#00c853", bg: "rgba(0,200,83,0.12)"   },
                { label: "2x",   xp: "20K XP",  color: "#6b9fff", bg: "rgba(0,82,255,0.12)"   },
                { label: "3x",   xp: "50K XP",  color: "#f0b429", bg: "rgba(240,180,41,0.12)" },
              ].map(tier => (
                <div key={tier.label} style={{
                  background: tier.bg, border: `1px solid ${tier.color}44`,
                  borderRadius: "20px", padding: "4px 10px",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <span style={{ color: tier.color, fontSize: "12px", fontWeight: "800" }}>{tier.label}</span>
                  <span style={{ color: "#8892a4", fontSize: "10px" }}>at {tier.xp}</span>
                </div>
              ))}
              {multiplier > 1 && (
                <div style={{
                  background: "rgba(240,180,41,0.1)", border: "1px solid rgba(240,180,41,0.4)",
                  borderRadius: "20px", padding: "4px 10px",
                }}>
                  <span style={{ color: "#f0b429", fontSize: "11px", fontWeight: "800" }}>⚡ {multiplier}x Active!</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[
                { Icon: SwapIcon,    label: "Any token pair on Base" },
                { Icon: ZapIcon,     label: "Instant XP per swap"    },
                { Icon: DiamondIcon, label: "Powered by 0x Protocol" },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "6px 10px",
                  flex: "1", minWidth: "120px",
                }}>
                  <item.Icon size={12} style={{ color: "#64748b", flexShrink: 0 }} />
                  <span style={{ color: "#64748b", fontSize: "11px" }}>{item.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowDEX(!showDEX)}
              style={{
                width: "100%",
                background: showDEX ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #0052ff, #1a6aff)",
                border: showDEX ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px", padding: "14px",
                color: "white", fontWeight: "700", fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                fontFamily: "inherit", position: "relative",
                boxShadow: showDEX ? "none" : "0 0 24px rgba(0,82,255,0.35)",
              }}
            >
              {showDEX ? <ChevronUpIcon size={15} /> : <DiamondIcon size={15} />}
              {showDEX ? "Close DEX" : "Open BaseQuest DEX — Swap & Earn XP"}
            </button>

            {showDEX && (
              <div style={{ marginTop: "16px", borderTop: `1px solid rgba(255,255,255,0.08)`, paddingTop: "16px" }}>
                <BasedSwapDEX wallet={wallet} userProfile={userProfile} />
              </div>
            )}
          </div>
        )}

        {/* ── Status messages ───────────────────────────────────────────────── */}
        {lastTx?.status === "success" && (
          <div style={{
            background: "rgba(0,200,83,0.07)", border: "1px solid rgba(0,200,83,0.2)",
            borderRadius: "12px", padding: "12px 16px", marginBottom: "16px",
            color: "#00c853", fontWeight: "600", fontSize: "13px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <CheckCircleIcon size={15} style={{ flexShrink: 0 }} />
            {lastTx.msg}{" "}
            <a href={`https://basescan.org/tx/${lastTx.hash}`} target="_blank" rel="noreferrer"
              style={{ color: "#00c853", fontSize: "12px", display: "flex", alignItems: "center", gap: "3px", marginLeft: "auto" }}>
              View tx <LinkIcon size={11} />
            </a>
          </div>
        )}
        {error && (
          <div style={{
            background: "rgba(255,59,59,0.07)", border: "1px solid rgba(255,59,59,0.22)",
            borderRadius: "12px", padding: "12px 16px", marginBottom: "16px",
            color: "#ff6b6b", fontWeight: "500", fontSize: "13px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <AlertIcon size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* ── Quest cards ───────────────────────────────────────────────────── */}
        {visibleTasks.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
          }}>
            <MapIcon size={36} style={{ color: "#334155", marginBottom: "12px" }} />
            <div style={{ color: "#64748b", fontSize: "14px" }}>No quests in this category</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {visibleTasks.map(task => {
              const status   = getTaskStatus(task.id);
              const isDone   = status.done;
              const isAuto   = task.auto;
              const expanded = expandedTask === task.id;

              return (
                <div
                  key={task.id}
                  style={{
                    background:   isDone
                      ? "linear-gradient(135deg, rgba(0,200,83,0.06), rgba(0,200,83,0.02))"
                      : "#12141a",
                    border:       `1px solid ${isDone ? "rgba(0,200,83,0.2)" : expanded ? "rgba(0,82,255,0.3)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: "16px",
                    overflow:     "hidden",
                    transition:   "border-color 0.2s, box-shadow 0.2s",
                    boxShadow:    expanded ? "0 0 0 1px rgba(0,82,255,0.08), 0 4px 24px rgba(0,82,255,0.08)" : isDone ? "0 0 0 1px rgba(0,200,83,0.04)" : "none",
                  }}
                  onMouseEnter={e => { if (!expanded && !isDone) e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                  onMouseLeave={e => { if (!expanded && !isDone) e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                >
                  {/* Card header row */}
                  <div
                    onClick={() => !isAuto && !isDone && setExpandedTask(expanded ? null : task.id)}
                    className="quest-task-row"
                    style={{
                      padding:    "16px 20px",
                      display:    "flex",
                      alignItems: "center",
                      gap:        "14px",
                      cursor:     isAuto || isDone ? "default" : "pointer",
                    }}
                  >
                    {/* Icon */}
                    <div className="quest-task-icon" style={{
                      width: "44px", height: "44px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isDone
                        ? "rgba(0,200,83,0.12)"
                        : expanded
                          ? "rgba(0,82,255,0.1)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isDone ? "rgba(0,200,83,0.2)" : expanded ? "rgba(0,82,255,0.2)" : "rgba(255,255,255,0.07)"}`,
                      borderRadius: "12px",
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}>
                      {(() => {
                        const TaskIcon = TASK_ICONS[task.id] || ZapIcon;
                        return <TaskIcon size={20} style={{ color: isDone ? "#00c853" : expanded ? "#6b9fff" : "#64748b" }} />;
                      })()}
                    </div>

                    {/* Text block */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span style={{
                          color: isDone ? "#c1c9d6" : theme.text,
                          fontWeight: "700", fontSize: "14px",
                          textDecoration: isDone ? "none" : "none",
                        }}>
                          {task.name}
                        </span>
                        <CategoryBadge task={task} />
                        {task.hasSubs && !isDone && <SubsIndicator done={isDone} />}
                        {isDone && (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "3px",
                            background: "rgba(0,200,83,0.15)", border: "1px solid rgba(0,200,83,0.3)",
                            borderRadius: "4px", padding: "2px 7px",
                            color: "#00c853", fontSize: "10px", fontWeight: "700",
                          }}>
                            <CheckIcon size={9} /> DONE
                          </span>
                        )}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "12px", lineHeight: "1.4" }}>{task.description}</div>
                    </div>

                    {/* XP pill + chevron */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                      <XPPill xp={task.xp} done={isDone} />
                      {task.ethCost !== "0" && (
                        <div style={{ color: "#4a5568", fontSize: "10px", fontWeight: "500", fontVariantNumeric: "tabular-nums" }}>
                          {task.ethCost} ETH
                        </div>
                      )}
                    </div>

                    {!isAuto && !isDone && (
                      <div style={{ color: "#4a5568", flexShrink: 0 }}>
                        {expanded ? <ChevronUpIcon size={15} /> : <ChevronDownIcon size={15} />}
                      </div>
                    )}
                  </div>

                  {/* Expanded form */}
                  {expanded && !isDone && !isAuto && (
                    <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>

                      {task.field && (
                        <div style={{ marginTop: "14px" }}>
                          <label style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                            {task.fieldLabel}
                          </label>
                          <input
                            type="text"
                            placeholder={task.fieldPlaceholder}
                            value={fieldValues[task.id]?.[task.field] || ""}
                            onChange={e => handleField(task.id, task.field, e.target.value)}
                            style={{
                              width: "100%",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.09)",
                              borderRadius: "10px", padding: "10px 14px",
                              color: theme.text, fontSize: "14px", outline: "none",
                              fontFamily: "inherit",
                              transition: "border-color 0.15s",
                            }}
                            onFocus={e => e.target.style.borderColor = "rgba(0,82,255,0.5)"}
                            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
                          />
                        </div>
                      )}

                      {task.id === "deploy" && renderSubTasks(DEPLOY_PLATFORMS, "deploy")}
                      {task.id === "swap"   && renderSubTasks(SWAP_PLATFORMS,   "swap"  )}
                      {task.id === "bridge" && renderSubTasks(BRIDGE_PLATFORMS, "bridge")}

                      <button
                        onClick={() => handleComplete(task.id)}
                        disabled={txPending}
                        style={{
                          width: "100%", marginTop: "14px",
                          background: txPending ? "rgba(0,82,255,0.3)" : "linear-gradient(135deg, #0052ff, #1a6aff)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "12px", padding: "13px",
                          color: "white", fontWeight: "700", fontSize: "14px",
                          cursor: txPending ? "not-allowed" : "pointer",
                          fontFamily: "inherit",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                          boxShadow: txPending ? "none" : "0 0 20px rgba(0,82,255,0.35)",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { if (!txPending) { e.currentTarget.style.boxShadow = "0 0 28px rgba(0,82,255,0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = txPending ? "none" : "0 0 20px rgba(0,82,255,0.35)"; e.currentTarget.style.transform = "none"; }}
                      >
                        {txPending
                          ? <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Confirming...</>
                          : <>Complete — {task.ethCost} ETH • <ZapIcon size={13} /> +{task.xp} XP</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  