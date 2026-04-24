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
import {
  HomeIcon, MapIcon, SwordIcon, TrophyIcon, WrenchIcon,
  LockIcon, CheckIcon, AlertIcon,
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
  bgNav:       "rgba(10,11,15,0.92)",
  bgTab:       "rgba(10,11,15,0.88)",
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
      background: "#0a0b0f",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "360px", position: "relative" }}>

        <div style={{
          width: "52px", height: "52px",
          background: "#0052ff",
          borderRadius: "14px",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "20px",
        }}>
          <LockIcon size={24} style={{ color: "white" }} />
        </div>

        <div style={{ fontSize: "20px", fontWeight: "700", color: "#f1f5f9", marginBottom: "8px", letterSpacing: "-0.03em" }}>
          Verify Wallet Ownership
        </div>
        <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "28px", lineHeight: "1.6" }}>
          Sign a free message to access BaseQuest. No gas, no transaction.
        </div>

        <div style={{
          background: "#12141a",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "14px", padding: "16px", marginBottom: "20px",
        }}>
          <div style={{
            fontSize: "11px", color: "#64748b", fontWeight: "600",
            marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Signature Preview
          </div>
          {[
            "Welcome to BaseQuest!",
            "You are the owner of this wallet",
            "You agree to build genuine on-chain history",
          ].map((text, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: "9px",
              marginBottom: i < 2 ? "8px" : "0",
            }}>
              <span style={{ color: "#0052ff", flexShrink: 0, marginTop: "1px" }}>
                <CheckIcon size={13} />
              </span>
              <span style={{ fontSize: "13px", color: "#c1c9d6", lineHeight: "1.5" }}>{text}</span>
            </div>
          ))}
          <div style={{
            marginTop: "12px", paddingTop: "12px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            fontSize: "12px", color: "#64748b",
          }}>
            BaseQuest — Build your on-chain legacy
          </div>
        </div>

        {wallet.signError && (
          <div style={{
            background: "rgba(255,59,59,0.07)",
            border: "1px solid rgba(255,59,59,0.2)",
            borderRadius: "10px", padding: "10px 14px",
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
            background: wallet.signing ? "rgba(0,82,255,0.4)" : "#0052ff",
            border: "none", borderRadius: "12px", padding: "14px",
            color: "white", fontWeight: "600", fontSize: "15px",
            cursor: wallet.signing ? "not-allowed" : "pointer",
            marginBottom: "12px", fontFamily: "inherit", letterSpacing: "-0.01em",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (!wallet.signing) e.currentTarget.style.background = "#1a64ff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = wallet.signing ? "rgba(0,82,255,0.4)" : "#0052ff"; }}
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
          onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"}
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

      <Navbar wallet={walletWithProfile} theme={theme} />

      {/* Desktop Tab bar */}
      <div
        className="desktop-nav"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(10,11,15,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          position: "sticky",
          top: "60px",
          zIndex: 90,
        }}
      >
        <div style={{ display: "flex", maxWidth: "1100px", margin: "0 auto", padding: "0 20px" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "none", border: "none",
                  borderBottom: active ? "2px solid #0052ff" : "2px solid transparent",
                  padding: "13px 16px",
                  color: active ? "#f1f5f9" : "#64748b",
                  fontWeight: active ? "600" : "400",
                  fontSize: "13px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.12s",
                  display: "flex", alignItems: "center", gap: "7px",
                  fontFamily: "inherit",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#c1c9d6"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#64748b"; }}
              >
                <tab.Icon size={14} />
                {tab.label}
                {tab.id === "bossraid" && (
                  <span style={{
                    background: "rgba(255,59,59,0.12)",
                    border: "1px solid rgba(255,59,59,0.22)",
                    borderRadius: "4px", padding: "1px 5px",
                    color: "#ff6b6b", fontSize: "9px", fontWeight: "700",
                    letterSpacing: "0.06em",
                  }}>LIVE</span>
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
        padding: "32px 20px 80px",
        marginTop: "24px",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            flexWrap: "wrap", gap: "24px", marginBottom: "28px",
          }}>
            {/* Brand */}
            <div>
              <div style={{
                color: "#f1f5f9", fontWeight: "700", fontSize: "15px",
                letterSpacing: "-0.03em", marginBottom: "6px",
              }}>
                Base<span style={{ color: "#0052ff" }}>Quest</span>
              </div>
              <div style={{ color: "#64748b", fontSize: "12px", maxWidth: "200px", lineHeight: "1.6" }}>
                Farm Base. Earn XP.<br />Dominate the Chain.
              </div>
            </div>

            {/* Links */}
            <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
              <div>
                <div style={{
                  color: "#334155", fontSize: "11px", fontWeight: "600",
                  letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px",
                }}>Product</div>
                {[
                  { label: "Quests",      action: () => setActiveTab("quests") },
                  { label: "Boss Raids",  action: () => setActiveTab("bossraid") },
                  { label: "Leaderboard", action: () => setActiveTab("leaderboard") },
                  { label: "Tools",       action: () => setActiveTab("tools") },
                ].map(l => (
                  <div key={l.label} style={{ marginBottom: "7px" }}>
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
                  color: "#334155", fontSize: "11px", fontWeight: "600",
                  letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "10px",
                }}>Resources</div>
                {[
                  { label: "Privacy Policy", action: () => setShowPrivacy(true) },
                  { label: "Contact", href: "https://twitter.com/Jee_phoenix" },
                  { label: "Base Mainnet", href: "https://base.org" },
                  { label: "Basescan", href: "https://basescan.org" },
                ].map(l => (
                  <div key={l.label} style={{ marginBottom: "7px" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00c853" }} />
              <span style={{ color: "#64748b", fontSize: "12px" }}>All systems operational</span>
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
          borderTop: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 100,
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
        }}
      >
        <div style={{ display: "flex", padding: "4px 0" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, background: "none", border: "none",
                  color: active ? "#0052ff" : "#64748b",
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
                    width: "20px", height: "2px",
                    background: "#0052ff", borderRadius: "0 0 2px 2px",
                  }} />
                )}
                <tab.Icon size={19} />
                <span style={{ fontSize: "10px", fontWeight: active ? "600" : "400", letterSpacing: "-0.01em" }}>
                  {tab.label.split(" ")[0]}
                </span>
                {tab.id === "bossraid" && (
                  <span style={{
                    position: "absolute", top: "8px", right: "calc(50% - 16px)",
                    width: "5px", height: "5px",
                    background: "#ff3b3b", borderRadius: "50%",
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <SupportBot />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <style>{`
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
