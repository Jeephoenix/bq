import { useState } from "react";
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

export default function QuestBoard({ quests, wallet, theme, isDark }) {
  if (!theme) theme = { text: "#f1f5f9", textMuted: "#64748b", textDim: "#334155", bgCard: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)" };
  const { isConnected } = wallet;
  const {
    completeTask, getTaskStatus, getSubTaskStatus,
    txPending, lastTx, error, userProfile,
    completedCount, totalDaily,
  } = quests;

  const [fieldValues,   setFieldValues]   = useState({});
  const [expandedTask,  setExpandedTask]  = useState(null);
  const [expandedSubs,  setExpandedSubs]  = useState({});
  const [showGuide,     setShowGuide]     = useState(false);
  const [showDEX,       setShowDEX]       = useState(false);

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
          style={{ color: "#0052ff", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "10px" }}
        >
          {isOpen ? <ChevronUpIcon size={12} style={{ verticalAlign: "middle" }} /> : <ChevronDownIcon size={12} style={{ verticalAlign: "middle" }} />}{" "}Platform sub-tasks (+50 XP each)
        </div>
        {isOpen && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
            {platforms.map(p => {
              const subDone = getSubTaskStatus(p.id).done;
              return (
                <div key={p.id}>
                  <div style={{
                    display:      "flex",
                    alignItems:   "center",
                    gap:          "10px",
                    background:   subDone ? "rgba(0,200,83,0.08)" : theme.bgCard,
                    border:       `1px solid ${subDone ? "rgba(0,200,83,0.2)" : theme.border}`,
                    borderRadius: "10px",
                    padding:      "10px 14px",
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
                      style={{ color: p.color, fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>
                      Go ↗
                    </a>
                    <button
                      onClick={() => completeTask(p.id)}
                      disabled={subDone || txPending}
                      style={{
                        background:   subDone ? "rgba(0,200,83,0.2)" : `${p.color}22`,
                        border:       `1px solid ${subDone ? "rgba(0,200,83,0.4)" : p.color + "44"}`,
                        borderRadius: "8px",
                        padding:      "5px 12px",
                        color:        subDone ? "#00c853" : p.color,
                        fontSize:     "12px",
                        fontWeight:   "700",
                        cursor:       subDone || txPending ? "not-allowed" : "pointer",
                      }}
                    >
                      {subDone ? "Done" : "+50 XP"}
                    </button>
                  </div>
                  {p.id === "deployRemix" && (
                    <div style={{ marginTop: "8px" }}>
                      <div
                        onClick={() => setShowGuide(!showGuide)}
                        style={{
                          color:        "#f0b429",
                          fontSize:     "12px",
                          fontWeight:   "600",
                          cursor:       "pointer",
                          padding:      "8px 14px",
                          background:   "rgba(240,180,41,0.06)",
                          border:       "1px solid rgba(240,180,41,0.15)",
                          borderRadius: "8px",
                          display:      "flex",
                          alignItems:   "center",
                          gap:          "6px",
                        }}
                      >
                        📖 {showGuide ? "▲ Hide" : "▼ Show"} step-by-step guide — How to deploy on Remix IDE
                      </div>
                      {showGuide && (
                        <div style={{
                          background:    theme.bgCard,
                          border:        `1px solid ${theme.border}`,
                          borderRadius:  "10px",
                          padding:       "16px",
                          marginTop:     "8px",
                          display:       "flex",
                          flexDirection: "column",
                          gap:           "14px",
                        }}>
                          <div style={{ color: theme.text, fontSize: "13px", fontWeight: "800", marginBottom: "4px" }}>
                            🚀 How to deploy a contract on Base using Remix IDE
                          </div>
                          {REMIX_GUIDE.map(g => (
                            <div key={g.step} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                              <div style={{
                                minWidth:       "26px",
                                height:         "26px",
                                background:     "rgba(0,82,255,0.2)",
                                border:         "1px solid rgba(0,82,255,0.4)",
                                borderRadius:   "50%",
                                display:        "flex",
                                alignItems:     "center",
                                justifyContent: "center",
                                color:          "#0052ff",
                                fontSize:       "12px",
                                fontWeight:     "800",
                                flexShrink:     0,
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
                            background:   "rgba(0,200,83,0.08)",
                            border:       "1px solid rgba(0,200,83,0.2)",
                            borderRadius: "8px",
                            padding:      "10px 14px",
                            color:        "#00c853",
                            fontSize:     "12px",
                            fontWeight:   "600",
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

  if (!isConnected) return (
    <div style={{ padding: "64px 20px", textAlign: "center" }}>
      <MapIcon size={48} style={{ color: "#0052ff", margin: "0 auto 16px" }} />
      <div style={{ color: theme.text, fontSize: "18px", fontWeight: "700", marginBottom: "8px", letterSpacing: "-0.3px" }}>Quest Board</div>
      <div style={{ color: theme.textMuted, fontSize: "14px" }}>Connect your wallet to start earning XP!</div>
    </div>
  );

  return (
    <div style={{ padding: "24px 0" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <MapIcon size={18} style={{ color: "#0052ff" }} />
          <h2 style={{ color: theme.text, fontSize: "20px", fontWeight: "700", margin: 0, letterSpacing: "-0.3px" }}>
            Quest Board
          </h2>
        </div>
        <p style={{ color: theme.textMuted, fontSize: "13px", margin: 0 }}>
          Complete quests to earn XP and level up on Base.{" "}
          <strong style={{ color: theme.text, fontWeight: "600" }}>{completedCount}/{totalDaily}</strong> daily quests done.
        </p>
      </div>

      {/* ── BaseQuest DEX Exclusive Banner ── */}
      <div style={{
        background:   "linear-gradient(135deg, #0a0f2e 0%, #0d1a4a 40%, #1a0a3e 100%)",
        border:       "1px solid rgba(0,82,255,0.4)",
        borderRadius: "20px",
        padding:      "24px 20px",
        marginBottom: "20px",
        position:     "relative",
        overflow:     "hidden",
      }}>

        {/* Background glow effects */}
        <div style={{
          position:     "absolute",
          top:          "-40px",
          right:        "-40px",
          width:        "180px",
          height:       "180px",
          background:   "radial-gradient(circle, rgba(0,82,255,0.3) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents:"none",
        }} />
        <div style={{
          position:     "absolute",
          bottom:       "-40px",
          left:         "-40px",
          width:        "150px",
          height:       "150px",
          background:   "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents:"none",
        }} />

        {/* Top row */}
        <div className="dex-banner-top-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width:          "52px",
              height:         "52px",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              background:     "linear-gradient(135deg, rgba(0,82,255,0.4), rgba(168,85,247,0.4))",
              borderRadius:   "14px",
              border:         "1px solid rgba(0,82,255,0.5)",
            }}><DiamondIcon size={24} style={{ color: "white" }} /></div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ color: "white", fontSize: "18px", fontWeight: "900" }}>BaseQuest DEX</span>
                <span style={{
                  background:   "linear-gradient(135deg, #0052ff, #a855f7)",
                  borderRadius: "20px",
                  padding:      "2px 10px",
                  color:        "white",
                  fontSize:     "10px",
                  fontWeight:   "800",
                }}>EXCLUSIVE</span>
              </div>
              <div style={{ color: "#8892a4", fontSize: "12px", marginTop: "2px" }}>
                Swap any token on Base and earn XP every time
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              color:      "#f0b429",
              fontSize:   "22px",
              fontWeight: "900",
              textShadow: "0 0 20px rgba(240,180,41,0.5)",
            }}>
              +{xpForSwap} XP
            </div>
            <div style={{ color: "#8892a4", fontSize: "10px" }}>per swap</div>
          </div>
        </div>

        {/* XP Multiplier badges */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
          {[
            { label: "1x",   xp: "Default",  color: "#8892a4", bg: "rgba(136,146,164,0.15)" },
            { label: "1.5x", xp: "10K XP",   color: "#00c853", bg: "rgba(0,200,83,0.15)"    },
            { label: "2x",   xp: "20K XP",   color: "#0052ff", bg: "rgba(0,82,255,0.15)"    },
            { label: "3x",   xp: "50K XP",   color: "#f0b429", bg: "rgba(240,180,41,0.15)"  },
          ].map(tier => (
            <div key={tier.label} style={{
              background:   tier.bg,
              border:       `1px solid ${tier.color}44`,
              borderRadius: "20px",
              padding:      "4px 10px",
              display:      "flex",
              alignItems:   "center",
              gap:          "4px",
            }}>
              <span style={{ color: tier.color, fontSize: "12px", fontWeight: "800" }}>{tier.label}</span>
              <span style={{ color: "#8892a4", fontSize: "10px" }}>at {tier.xp}</span>
            </div>
          ))}
          {multiplier > 1 && (
            <div style={{
              background:   "linear-gradient(135deg, rgba(240,180,41,0.2), rgba(168,85,247,0.2))",
              border:       "1px solid rgba(240,180,41,0.4)",
              borderRadius: "20px",
              padding:      "4px 10px",
            }}>
              <span style={{ color: "#f0b429", fontSize: "11px", fontWeight: "800" }}>
                ⚡ {multiplier}x Active!
              </span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{
          display:      "flex",
          gap:          "8px",
          marginBottom: "16px",
          flexWrap:     "wrap",
        }}>
          {[
            { Icon: SwapIcon,    label: "Any token pair on Base" },
            { Icon: ZapIcon,    label: "Instant XP per swap"    },
            { Icon: DiamondIcon,label: "Powered by 0x Protocol" },
          ].map(item => (
            <div key={item.label} style={{
              display:    "flex",
              alignItems: "center",
              gap:        "6px",
              background: theme.bgCard,
              borderRadius: "8px",
              padding:    "6px 10px",
              flex:       "1",
              minWidth:   "120px",
            }}>
              <item.Icon size={13} style={{ color: theme.textMuted, flexShrink: 0 }} />
              <span style={{ color: theme.textMuted, fontSize: "11px", fontWeight: "500" }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Swap Now button */}
        <button
          onClick={() => setShowDEX(!showDEX)}
          style={{
            width:        "100%",
            background:   showDEX ? "rgba(0,82,255,0.15)" : "linear-gradient(135deg, #0052ff, #7c3aed)",
            border:       showDEX ? "1px solid rgba(0,82,255,0.4)" : "none",
            borderRadius: "12px",
            padding:      "14px",
            color:        "white",
            fontWeight:   "600",
            fontSize:     "14px",
            cursor:       "pointer",
            boxShadow:    showDEX ? "none" : "0 4px 24px rgba(0,82,255,0.4)",
            transition:   "all 0.2s",
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            gap:          "8px",
            fontFamily:   "inherit",
          }}
        >
          {showDEX ? <ChevronUpIcon size={15} /> : <DiamondIcon size={15} />}
          {showDEX ? "Close DEX" : "Open BaseQuest DEX — Swap & Earn XP"}
        </button>

        {/* DEX component */}
        {showDEX && (
          <div style={{
            marginTop:  "16px",
            borderTop:  `1px solid ${theme.border}`,
            paddingTop: "16px",
          }}>
            <BasedSwapDEX wallet={wallet} userProfile={userProfile} />
          </div>
        )}
      </div>

      {/* Status messages */}
      {lastTx?.status === "success" && (
        <div style={{
          background:   "rgba(0,200,83,0.08)",
          border:       "1px solid rgba(0,200,83,0.25)",
          borderRadius: "12px",
          padding:      "12px 16px",
          marginBottom: "16px",
          color:        "#00c853",
          fontWeight:   "500",
          fontSize:     "13px",
          display:      "flex",
          alignItems:   "center",
          gap:          "8px",
        }}>
          <CheckCircleIcon size={15} style={{ flexShrink: 0 }} />
          {lastTx.msg}{" "}
          <a href={`https://basescan.org/tx/${lastTx.hash}`} target="_blank" rel="noreferrer"
            style={{ color: "#00c853", fontSize: "12px", display: "flex", alignItems: "center", gap: "3px" }}>
            View tx <LinkIcon size={11} />
          </a>
        </div>
      )}
      {error && (
        <div style={{
          background:   "rgba(255,59,59,0.08)",
          border:       "1px solid rgba(255,59,59,0.25)",
          borderRadius: "12px",
          padding:      "12px 16px",
          marginBottom: "16px",
          color:        "#ff6b6b",
          fontWeight:   "500",
          fontSize:     "13px",
          display:      "flex",
          alignItems:   "center",
          gap:          "8px",
        }}>
          <AlertIcon size={15} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Daily Quest list — excluding basedswap */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {TASKS.filter(task => !task.isDEX).map(task => {
          const status   = getTaskStatus(task.id);
          const isDone   = status.done;
          const isAuto   = task.auto;
          const expanded = expandedTask === task.id;

          return (
            <div key={task.id} style={{
              background:   isDone ? "rgba(0,200,83,0.05)" : theme.bgCard,
              border:       `1px solid ${isDone ? "rgba(0,200,83,0.2)" : theme.border}`,
              borderRadius: "16px",
              overflow:     "hidden",
              transition:   "all 0.2s",
            }}>

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
                <div className="quest-task-icon" style={{
                  width:          "44px",
                  height:         "44px",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  background:     isDone ? "rgba(0,200,83,0.15)" : theme.bgCard,
                  borderRadius:   "12px",
                  flexShrink:     0,
                }}>
                  {(() => { const TaskIcon = TASK_ICONS[task.id] || ZapIcon; return <TaskIcon size={22} style={{ color: isDone ? "#00c853" : "#8892a4" }} />; })()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ color: theme.text, fontWeight: "700", fontSize: "15px" }}>{task.name}</span>
                    {isDone      && <span style={{ background: "rgba(0,200,83,0.2)",   color: "#00c853", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>DONE</span>}
                    {isAuto      && <span style={{ background: "rgba(240,180,41,0.2)", color: "#f0b429", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>AUTO</span>}
                    {task.oneTime && !isDone && <span style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>ONE-TIME</span>}
                    {task.hasSubs && !isDone && <span style={{ background: "rgba(0,82,255,0.2)",   color: "#00d4ff", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>+BONUS XP</span>}
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: "13px", marginTop: "2px" }}>{task.description}</div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ color: "#f0b429", fontWeight: "800", fontSize: "16px" }}>+{task.xp} XP</div>
                  {task.ethCost !== "0" && (
                    <div style={{ color: "#8892a4", fontSize: "11px" }}>{task.ethCost} ETH</div>
                  )}
                </div>

                {!isAuto && !isDone && (
                  <div style={{ color: theme.textMuted, flexShrink: 0 }}>
                    {expanded ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                  </div>
                )}
              </div>

              {expanded && !isDone && !isAuto && (
                <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${theme.border}` }}>

                  {task.field && (
                    <div style={{ marginTop: "14px", marginBottom: "4px" }}>
                      <label style={{ color: theme.textMuted, fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                        {task.fieldLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={task.fieldPlaceholder}
                        value={fieldValues[task.id]?.[task.field] || ""}
                        onChange={e => handleField(task.id, task.field, e.target.value)}
                        style={{
                          width:        "100%",
                          background:   isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                          border:       `1px solid ${theme.border}`,
                          borderRadius: "10px",
                          padding:      "10px 14px",
                          color:        theme.text,
                          fontSize:     "14px",
                          outline:      "none",
                        }}
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
                      width:        "100%",
                      marginTop:    "14px",
                      background:   txPending ? "rgba(0,82,255,0.3)" : "linear-gradient(135deg, #0052ff, #0041cc)",
                      border:       "none",
                      borderRadius: "12px",
                      padding:      "13px",
                      color:        "white",
                      fontWeight:   "600",
                      fontSize:     "14px",
                      cursor:       txPending ? "not-allowed" : "pointer",
                      fontFamily:   "inherit",
                      display:      "flex",
                      alignItems:   "center",
                      justifyContent: "center",
                      gap:          "8px",
                      boxShadow:    txPending ? "none" : "0 4px 20px rgba(0,82,255,0.3)",
                    }}
                  >
                    {txPending ? "Confirming..." : `Complete — ${task.ethCost} ETH`}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
      }
