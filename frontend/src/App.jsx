import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence }  from "framer-motion";
import { useWallet }        from "./hooks/useWallet";
import { useQuests }        from "./hooks/useQuests";
import Navbar               from "./components/Navbar";
import Dashboard            from "./components/Dashboard";
import QuestBoard           from "./components/QuestBoard";
import BossRaid             from "./components/BossRaid";
import Leaderboard          from "./components/Leaderboard";
import Tools                from "./components/Tools";
import SupportBot           from "./components/SupportBot";
import PrivacyPolicy        from "./components/PrivacyPolicy";
import OnboardingIntro      from "./components/OnboardingIntro";
import ToastContainer       from "./components/ToastContainer";
import WhatsNewToast        from "./components/WhatsNewToast";
import {
  HomeIcon, MapIcon, SwordIcon, TrophyIcon, WrenchIcon,
  LockIcon, CheckIcon, AlertIcon, ZapIcon,
} from "./components/Icons";

const TABS = [
  { id: "dashboard",   label: "Dashboard",   Icon: HomeIcon   },
  { id: "quests",      label: "Quests",       Icon: MapIcon    },
  { id: "bossraid",    label: "Boss Raid",    Icon: SwordIcon  },
  { id: "leaderboard", label: "Leaderboard",  Icon: TrophyIcon },
  { id: "tools",       label: "Tools",        Icon: WrenchIcon },
];

const theme = {
  bg:          "#0a0b0f",
  bgCard:      "#12141a",
  bgNav:       "rgba(10,11,15,0.94)",
  bgTab:       "rgba(10,11,15,0.92)",
  border:      "rgba(255,255,255,0.07)",
  text:        "#f1f5f9",
  textMuted:   "#64748b",
  textDim:     "#334155",
  tabActive:   "#f1f5f9",
  tabInactive: "#64748b",
  footerBg:    "rgba(10,11,15,0.97)",
};

export default function App() {
  const [activeTab,      setActiveTab]      = useState("dashboard");
  const [toolsVisited,   setToolsVisited]   = useState(
    () => typeof window !== "undefined" && Boolean(localStorage.getItem("bq_tools_seen"))
  );
  const [bannerDismissed, setBannerDismissed] = useState(
    () => typeof window !== "undefined" && Boolean(localStorage.getItem("bq_banner_v2"))
  );

  const handleSetActiveTab = useCallback((tabId) => {
    setActiveTab(tabId);
    if (tabId === "tools" && !toolsVisited) {
      localStorage.setItem("bq_tools_seen", "1");
      setToolsVisited(true);
    }
  }, [toolsVisited]);

  const dismissBanner = () => {
    localStorage.setItem("bq_banner_v2", "1");
    setBannerDismissed(true);
  };

  const [showPrivacy,    setShowPrivacy]    = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("bq_onboarded"));
  const [toasts,         setToasts]         = useState([]);
  const wallet = useWallet();
  const quests = useQuests(wallet);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-3), { ...toast, id }]);
  }, []);

  const prevLastTx = useRef(null);
  const prevError  = useRef(null);

  useEffect(() => {
    const tx = quests.lastTx;
    if (!tx || tx === prevLastTx.current) return;
    prevLastTx.current = tx;

    if (tx.status === "success" && tx.msg) {
      const xpMatch = tx.msg.match(/\+(\d+) XP/);
      const xp      = xpMatch ? `+${xpMatch[1]} XP` : null;
      const cleanMsg = tx.msg.replace(/^[^\w]+/, "").replace(/\+\d+ XP.*$/, "").trim().replace(/[!]+$/, "");
      addToast({
        type:  xp ? "xp" : "success",
        title: cleanMsg || "Transaction confirmed",
        body:  tx.hash
          ? `Tx: ${tx.hash.slice(0, 8)}…${tx.hash.slice(-6)}`
          : undefined,
        xp,
      });
    }
  }, [quests.lastTx, addToast]);

  useEffect(() => {
    const err = quests.error;
    if (!err || err === prevError.current) return;
    prevError.current = err;
    addToast({ type: "error", title: "Transaction failed", body: err });
  }, [quests.error, addToast]);

  const walletWithProfile = { ...wallet, userProfile: quests.userProfile };

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":   return <Dashboard     quests={quests} wallet={wallet} setActiveTab={setActiveTab} theme={theme} isDark={true} />;
      case "quests":      return <QuestBoard    quests={quests} wallet={wallet} theme={theme} isDark={true} />;
      case "bossraid":    return <BossRaid      wallet={wallet} theme={theme} isDark={true} />;
      case "leaderboard": return <Leaderboard   wallet={wallet} theme={theme} isDark={true} />;
      case "tools":       return <Tools          wallet={wallet} theme={theme} isDark={true} />;
      default:            return <Dashboard     quests={quests} wallet={wallet} setActiveTab={setActiveTab} theme={theme} isDark={true} />;
    }
  };

  /* ── Sign Screen ──────────────────────────────────────────────────── */
  const SignScreen = () => (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(10,11,15,0.97)",
      backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "380px", position: "relative" }}>

        {/* Background glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -60%)",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(0,82,255,0.08) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          <div style={{
            width: "56px", height: "56px",
            background: "linear-gradient(135deg, #0052ff, #1a6aff)",
            borderRadius: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "24px",
            boxShadow: "0 0 32px rgba(0,82,255,0.4)",
          }}>
            <LockIcon size={24} style={{ color: "white" }} />
          </div>

          <div style={{ fontSize: "22px", fontWeight: "800", color: "#f1f5f9", marginBottom: "8px", letterSpacing: "-0.04em" }}>
            Verify Wallet Ownership
          </div>
          <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "28px", lineHeight: "1.65" }}>
            Sign a free message to access BaseQuest. No gas, no transaction.
          </div>

          <div style={{
            background: "#12141a",
            border: "1px solid rgba(0,82,255,0.2)",
            borderRadius: "16px", padding: "18px", marginBottom: "20px",
            boxShadow: "0 0 20px rgba(0,82,255,0.06)",
          }}>
            <div style={{
              fontSize: "10px", color: "#64748b", fontWeight: "700",
              marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              Signature Preview
            </div>
            {[
              "Welcome to BaseQuest!",
              "You are the owner of this wallet",
              "You agree to build genuine on-chain history",
            ].map((text, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "10px",
                marginBottom: i < 2 ? "10px" : "0",
              }}>
                <span style={{ color: "#0052ff", flexShrink: 0, marginTop: "2px" }}>
                  <CheckIcon size={13} />
                </span>
                <span style={{ fontSize: "13px", color: "#c1c9d6", lineHeight: "1.5" }}>{text}</span>
              </div>
            ))}
            <div style={{
              marginTop: "14px", paddingTop: "14px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              fontSize: "12px", color: "#64748b",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <ZapIcon size={11} style={{ color: "#0052ff" }} />
              BaseQuest — Build your on-chain legacy
            </div>
          </div>

          {wallet.signError && (
            <div style={{
              background: "rgba(255,59,59,0.07)",
              border: "1px solid rgba(255,59,59,0.2)",
              borderRadius: "12px", padding: "12px 14px",
              color: "#ff6b6b", fontSize: "13px",
              marginBottom: "16px",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <AlertIcon size={14} style={{ flexShrink: 0 }} />
              {wallet.signError}
            </div>
          )}

          <button
            onClick={wallet.signWelcome}
            disabled={wallet.signing}
            style={{
              width: "100%",
              background: wallet.signing ? "rgba(0,82,255,0.4)" : "linear-gradient(135deg, #0052ff, #1a6aff)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: "14px", padding: "15px",
              color: "white", fontWeight: "700", fontSize: "15px",
              cursor: wallet.signing ? "not-allowed" : "pointer",
              marginBottom: "12px", fontFamily: "inherit", letterSpacing: "-0.02em",
              transition: "all 0.15s",
              boxShadow: wallet.signing ? "none" : "0 0 24px rgba(0,82,255,0.4)",
            }}
            onMouseEnter={e => { if (!wallet.signing) { e.currentTarget.style.boxShadow = "0 0 36px rgba(0,82,255,0.6)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = wallet.signing ? "none" : "0 0 24px rgba(0,82,255,0.4)"; e.currentTarget.style.transform = "none"; }}
          >
            {wallet.signing ? "Waiting for signature..." : "Sign & Enter BaseQuest"}
          </button>

          <button
            onClick={wallet.disconnectWallet}
            style={{
              background: "none", border: "none",
              color: "#64748b", fontSize: "13px",
              cursor: "pointer", padding: "8px", fontFamily: "inherit",
              width: "100%", textAlign: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#c1c9d6"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
          >
            ← Use a different wallet
          </button>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "12px", color: "#334155", fontVariantNumeric: "tabular-nums" }}>
              {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
            </div>
            <span
              onClick={() => setShowPrivacy(true)}
              style={{ color: "#334155", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}
            >
              Privacy Policy
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0b0f", color: "#f1f5f9", fontFamily: "'Inter', sans-serif" }}>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingIntro onDone={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      {wallet.isConnected && !wallet.isSigned && <SignScreen />}

      {showPrivacy && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 600,
          background: "#0a0b0f", overflowY: "auto", padding: "0 16px",
        }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 0 80px" }}>
            <PrivacyPolicy onBack={() => setShowPrivacy(false)} theme={theme} />
          </div>
        </div>
      )}

      {/* Announcement banner */}
      {!bannerDismissed && (
        <div style={{
          background: "linear-gradient(90deg, rgba(0,82,255,0.12), rgba(0,82,255,0.06), rgba(0,82,255,0.12))",
          borderBottom: "1px solid rgba(0,82,255,0.18)",
          padding: "8px 20px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          position: "relative",
        }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00c853", boxShadow: "0 0 6px rgba(0,200,83,0.6)", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "#6b9fff", fontWeight: "500" }}>
            Boss Raid is live — attack the boss and win from the ETH prize pool
          </span>
          <button
            onClick={() => { handleSetActiveTab("bossraid"); dismissBanner(); }}
            style={{
              background: "rgba(0,82,255,0.15)", border: "1px solid rgba(0,82,255,0.3)",
              borderRadius: "6px", padding: "2px 10px",
              color: "#6b9fff", fontSize: "11px", fontWeight: "700",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Join →
          </button>
          <button
            onClick={dismissBanner}
            style={{
              position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "#64748b", fontSize: "16px", lineHeight: "1",
              fontFamily: "inherit", padding: "4px",
            }}
          >
            ×
          </button>
        </div>
      )}

      <Navbar wallet={walletWithProfile} theme={theme} />

      {/* Desktop Tab bar */}
      <div
        className="desktop-nav"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(10,11,15,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "sticky",
          top: "60px",
          zIndex: 90,
        }}
      >
        <div style={{ display: "flex", maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const showPulse = tab.id === "tools" && !toolsVisited && !active;
            return (
              <button
                key={tab.id}
                onClick={() => handleSetActiveTab(tab.id)}
                style={{
                  background: "none", border: "none",
                  borderBottom: active ? "2px solid #0052ff" : "2px solid transparent",
                  padding: "13px 18px",
                  color: active ? "#f1f5f9" : showPulse ? "#0052ff" : "#64748b",
                  fontWeight: active ? "700" : "400",
                  fontSize: "13px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.12s",
                  display: "flex", alignItems: "center", gap: "7px",
                  fontFamily: "inherit",
                  letterSpacing: "-0.02em",
                  position: "relative",
                  boxShadow: active ? "0 2px 0 0 rgba(0,82,255,0.4)" : "none",
                }}
                onMouseEnter={e => { if (!active && !showPulse) { e.currentTarget.style.color = "#c1c9d6"; e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.15)"; }}}
                onMouseLeave={e => { if (!active && !showPulse) { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderBottomColor = "transparent"; }}}
              >
                <tab.Icon size={14} style={{ color: active ? "#0052ff" : "inherit" }} />
                {tab.label}
                {tab.id === "bossraid" && (
                  <span style={{
                    background: "rgba(255,59,59,0.1)",
                    border: "1px solid rgba(255,59,59,0.22)",
                    borderRadius: "4px", padding: "1px 5px",
                    color: "#ff6b6b", fontSize: "9px", fontWeight: "700",
                    letterSpacing: "0.07em",
                  }}>LIVE</span>
                )}
                {showPulse && (
                  <span style={{
                    position: "absolute", top: "9px", right: "8px",
                    width: "6px", height: "6px",
                    background: "#0052ff", borderRadius: "50%",
                    animation: "tab-pulse 1.8s ease-in-out infinite",
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page content */}
      <div className="page-content" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px 100px" }}>
        {renderTab()}
      </div>

      {/* Footer */}
      <footer className="app-footer" style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "40px 20px 80px",
        marginTop: "24px",
        background: "rgba(10,11,15,0.8)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            flexWrap: "wrap", gap: "32px", marginBottom: "32px",
          }}>
            {/* Brand */}
            <div>
              <div style={{
                fontWeight: "800", fontSize: "18px",
                letterSpacing: "-0.04em", marginBottom: "8px",
              }}>
                Base<span style={{
                  background: "linear-gradient(135deg, #0052ff, #6b9fff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>Quest</span>
              </div>
              <div style={{ color: "#64748b", fontSize: "13px", maxWidth: "200px", lineHeight: "1.65" }}>
                Farm Base. Earn XP.<br />Dominate the Chain.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00c853", boxShadow: "0 0 6px rgba(0,200,83,0.6)" }} />
                <span style={{ color: "#64748b", fontSize: "11px" }}>All systems operational</span>
              </div>
            </div>

            {/* Links */}
            <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
              <div>
                <div style={{
                  color: "#334155", fontSize: "10px", fontWeight: "700",
                  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px",
                }}>Product</div>
                {[
                  { label: "Quests",      action: () => setActiveTab("quests") },
                  { label: "Boss Raids",  action: () => setActiveTab("bossraid") },
                  { label: "Leaderboard", action: () => setActiveTab("leaderboard") },
                  { label: "Tools",       action: () => setActiveTab("tools") },
                ].map(l => (
                  <div key={l.label} style={{ marginBottom: "8px" }}>
                    <button
                      onClick={l.action}
                      style={{
                        background: "none", border: "none", padding: 0,
                        color: "#64748b", fontSize: "13px", cursor: "pointer",
                        fontFamily: "inherit", transition: "color 0.12s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"}
                      onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
                    >
                      {l.label}
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <div style={{
                  color: "#334155", fontSize: "10px", fontWeight: "700",
                  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px",
                }}>Resources</div>
                {[
                  { label: "Privacy Policy", action: () => setShowPrivacy(true) },
                  { label: "Contact", href: "https://twitter.com/Jee_phoenix" },
                  { label: "Base Mainnet", href: "https://base.org" },
                  { label: "Basescan", href: "https://basescan.org" },
                ].map(l => (
                  <div key={l.label} style={{ marginBottom: "8px" }}>
                    {l.href ? (
                      <a
                        href={l.href} target="_blank" rel="noreferrer"
                        style={{
                          color: "#64748b", fontSize: "13px", textDecoration: "none",
                          transition: "color 0.12s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"}
                        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
                      >
                        {l.label}
                      </a>
                    ) : (
                      <button
                        onClick={l.action}
                        style={{
                          background: "none", border: "none", padding: 0,
                          color: "#64748b", fontSize: "13px", cursor: "pointer",
                          fontFamily: "inherit", transition: "color 0.12s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"}
                        onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
                      >
                        {l.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: "8px",
          }}>
            <div style={{ color: "#334155", fontSize: "12px" }}>
              © 2026 BaseQuest™ — Built on Base
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "rgba(0,82,255,0.08)", border: "1px solid rgba(0,82,255,0.15)",
              borderRadius: "6px", padding: "4px 10px",
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="4" fill="#0052ff" opacity="0.3"/>
                <circle cx="5" cy="5" r="2" fill="#0052ff"/>
              </svg>
              <span style={{ color: "#6b9fff", fontSize: "11px", fontWeight: "600" }}>Base Mainnet</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav
        className="mobile-nav"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(10,11,15,0.97)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          zIndex: 100,
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
        }}
      >
        <div style={{ display: "flex", padding: "4px 0" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const showPulse = tab.id === "tools" && !toolsVisited && !active;
            return (
              <button
                key={tab.id}
                onClick={() => handleSetActiveTab(tab.id)}
                style={{
                  flex: 1, background: "none", border: "none",
                  color: active ? "#0052ff" : showPulse ? "#0052ff" : "#64748b",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                  padding: "10px 4px",
                  transition: "color 0.12s",
                  fontFamily: "inherit",
                  position: "relative",
                  minHeight: "56px",
                }}
              >
                {active && (
                  <span style={{
                    position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                    width: "24px", height: "2px",
                    background: "linear-gradient(90deg, #0052ff, #6b9fff)",
                    borderRadius: "0 0 2px 2px",
                    boxShadow: "0 0 8px rgba(0,82,255,0.6)",
                  }} />
                )}
                <div style={{
                  padding: "4px 8px",
                  borderRadius: "8px",
                  background: active ? "rgba(0,82,255,0.1)" : "transparent",
                  transition: "background 0.15s",
                }}>
                  <tab.Icon size={19} />
                </div>
                <span style={{ fontSize: "10px", fontWeight: active ? "700" : "400", letterSpacing: "-0.01em" }}>
                  {tab.label.split(" ")[0]}
                </span>
                {tab.id === "bossraid" && (
                  <span style={{
                    position: "absolute", top: "8px", right: "calc(50% - 18px)",
                    width: "5px", height: "5px",
                    background: "#ff3b3b", borderRadius: "50%",
                    boxShadow: "0 0 4px rgba(255,59,59,0.8)",
                  }} />
                )}
                {showPulse && (
                  <span style={{
                    position: "absolute", top: "8px", right: "calc(50% - 20px)",
                    width: "7px", height: "7px",
                    background: "#0052ff", borderRadius: "50%",
                    animation: "tab-pulse 1.8s ease-in-out infinite",
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <SupportBot />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <WhatsNewToast theme={theme} />

      <style>{`
        @keyframes tab-pulse {
          0%, 100% { transform: scale(1);   box-shadow: 0 0 0 0   rgba(0,82,255,0.5); }
          50%      { transform: scale(1.3); box-shadow: 0 0 0 6px rgba(0,82,255,0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes live-pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0b0f; font-family: 'Inter', sans-serif; }
        input, button, textarea { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        input::placeholder { color: #4a5568; }
        a { color: inherit; }
        @media (min-width: 768px) {
          .mobile-nav { display: none !important; }
          .desktop-nav { display: block !important; }
        }
        @media (max-width: 767px) {
          .mobile-nav { display: block !important; }
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}
