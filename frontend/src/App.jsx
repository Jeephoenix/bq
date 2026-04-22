import { useState } from "react";
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

export default function App() {
  const [activeTab,      setActiveTab]      = useState("dashboard");
  const [isDark,         setIsDark]         = useState(true);
  const [showPrivacy,    setShowPrivacy]    = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("bq_onboarded"));
  const wallet = useWallet();
  const quests = useQuests(wallet);

  const walletWithProfile = { ...wallet, userProfile: quests.userProfile };

  const theme = {
    bg:          isDark ? "#0a0b0f"                    : "#f0f2f5",
    bgCard:      isDark ? "rgba(255,255,255,0.03)"     : "rgba(0,0,0,0.03)",
    bgNav:       isDark ? "rgba(10,11,15,0.95)"        : "rgba(240,242,245,0.95)",
    bgTab:       isDark ? "rgba(10,11,15,0.9)"         : "rgba(240,242,245,0.9)",
    border:      isDark ? "rgba(255,255,255,0.06)"     : "rgba(0,0,0,0.08)",
    text:        isDark ? "#f1f5f9"                    : "#0a0b0f",
    textMuted:   isDark ? "#64748b"                    : "#6b7280",
    textDim:     isDark ? "#334155"                    : "#9ca3af",
    tabActive:   isDark ? "#f1f5f9"                    : "#0a0b0f",
    tabInactive: isDark ? "#64748b"                    : "#6b7280",
    footerBg:    isDark ? "rgba(10,11,15,0.97)"        : "rgba(240,242,245,0.97)",
  };

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":   return <Dashboard     quests={quests} wallet={wallet} setActiveTab={setActiveTab} theme={theme} isDark={isDark} />;
      case "quests":      return <QuestBoard    quests={quests} wallet={wallet} theme={theme} isDark={isDark} />;
      case "bossraid":    return <BossRaid      wallet={wallet} theme={theme} isDark={isDark} />;
      case "leaderboard": return <Leaderboard   wallet={wallet} theme={theme} isDark={isDark} />;
      case "tools":       return <Tools          wallet={wallet} theme={theme} isDark={isDark} />;
      default:            return <Dashboard     quests={quests} wallet={wallet} setActiveTab={setActiveTab} theme={theme} isDark={isDark} />;
    }
  };

  // ── Sign Screen ───────────────────────────────────────────────────────
  const SignScreen = () => (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: theme.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(0,82,255,0.12) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "380px", textAlign: "center", position: "relative" }}>

        <div style={{
          width: "64px", height: "64px",
          background: "linear-gradient(135deg, #0052ff, #7c3aed)",
          borderRadius: "18px",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 0 32px rgba(0,82,255,0.35)",
        }}>
          <LockIcon size={28} style={{ color: "white" }} />
        </div>

        <div style={{ fontSize: "22px", fontWeight: "700", color: theme.text, marginBottom: "8px", letterSpacing: "-0.3px" }}>
          Welcome to BaseQuest
        </div>
        <div style={{ fontSize: "14px", color: theme.textMuted, marginBottom: "28px", lineHeight: "1.65" }}>
          Sign a message to verify wallet ownership<br />and access the app. No gas fees required.
        </div>

        <div style={{
          background: theme.bgCard, border: `1px solid ${theme.border}`,
          borderRadius: "14px", padding: "16px", marginBottom: "20px", textAlign: "left",
        }}>
          <div style={{
            fontSize: "10px", color: theme.textMuted, fontWeight: "600",
            marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.8px",
          }}>
            Message Preview
          </div>
          {[
            { icon: <CheckIcon size={14} />, text: "Welcome to BaseQuest!" },
            { icon: <CheckIcon size={14} />, text: "You are the owner of this wallet" },
            { icon: <CheckIcon size={14} />, text: "You agree to build genuine on-chain history" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: "10px",
              marginBottom: i < 2 ? "8px" : "0",
            }}>
              <span style={{ color: "#0052ff", flexShrink: 0, marginTop: "2px" }}>{item.icon}</span>
              <span style={{ fontSize: "13px", color: theme.text, lineHeight: "1.5" }}>{item.text}</span>
            </div>
          ))}
          <div style={{
            marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${theme.border}`,
            fontSize: "12px", color: theme.textMuted, fontStyle: "italic",
          }}>
            BaseQuest — live onchain, Build Legacy!
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "6px", marginBottom: "20px",
        }}>
          <LockIcon size={13} style={{ color: theme.textMuted }} />
          <span style={{ fontSize: "12px", color: theme.textMuted }}>
            Free signature — <strong style={{ color: theme.text, fontWeight: "600" }}>no gas, no transaction</strong>
          </span>
        </div>

        {wallet.signError && (
          <div style={{
            background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.25)",
            borderRadius: "10px", padding: "10px 14px",
            color: "#ff6b6b", fontSize: "13px", fontWeight: "500",
            marginBottom: "16px", textAlign: "left",
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
            background: wallet.signing ? "rgba(0,82,255,0.3)" : "linear-gradient(135deg, #0052ff, #7c3aed)",
            border: "none", borderRadius: "12px", padding: "15px",
            color: "white", fontWeight: "600", fontSize: "15px",
            cursor: wallet.signing ? "not-allowed" : "pointer",
            boxShadow: wallet.signing ? "none" : "0 4px 20px rgba(0,82,255,0.35)",
            marginBottom: "12px", fontFamily: "inherit", letterSpacing: "-0.1px",
          }}
        >
          {wallet.signing ? "Waiting for signature..." : "Sign & Enter BaseQuest"}
        </button>

        <button
          onClick={wallet.disconnectWallet}
          style={{
            background: "none", border: "none",
            color: theme.textMuted, fontSize: "13px",
            cursor: "pointer", padding: "8px", fontFamily: "inherit",
          }}
        >
          ← Use a different wallet
        </button>

        <div style={{ marginTop: "14px", fontSize: "11px", color: theme.textDim, letterSpacing: "0.3px" }}>
          {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
        </div>

        <div style={{ marginTop: "14px" }}>
          <span
            onClick={() => setShowPrivacy(true)}
            style={{ color: theme.textDim, fontSize: "11px", cursor: "pointer", textDecoration: "underline" }}
          >
            Privacy Policy
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" }}>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingIntro onDone={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      {wallet.isConnected && !wallet.isSigned && <SignScreen />}

      {showPrivacy && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 600,
          background: theme.bg, overflowY: "auto", padding: "0 16px",
        }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 0 80px" }}>
            <PrivacyPolicy onBack={() => setShowPrivacy(false)} theme={theme} />
          </div>
        </div>
      )}

      <Navbar wallet={walletWithProfile} isDark={isDark} setIsDark={setIsDark} theme={theme} />

      {/* Desktop Tab bar */}
      <div
        className="desktop-nav"
        style={{
          borderBottom: `1px solid ${theme.border}`,
          background: theme.bgTab,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          position: "sticky",
          top: "64px",
          zIndex: 90,
        }}
      >
        <div style={{ display: "flex", maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "none", border: "none",
                  borderBottom: active ? "2px solid #0052ff" : "2px solid transparent",
                  padding: "14px 16px",
                  color: active ? theme.tabActive : theme.tabInactive,
                  fontWeight: active ? "600" : "400",
                  fontSize: "13px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: "7px",
                  fontFamily: "inherit",
                  letterSpacing: "-0.1px",
                }}
              >
                <tab.Icon size={15} />
                {tab.label}
                {tab.id === "bossraid" && (
                  <span style={{
                    background: "rgba(255,59,59,0.15)",
                    border: "1px solid rgba(255,59,59,0.35)",
                    borderRadius: "20px", padding: "1px 6px",
                    color: "#ff6b6b", fontSize: "9px", fontWeight: "700",
                    letterSpacing: "0.5px",
                  }}>LIVE</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page content */}
      <div className="page-content" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px 100px" }}>
        {renderTab()}
      </div>

      {/* Footer */}
      <div className="app-footer" style={{
        borderTop: `1px solid ${theme.border}`,
        padding: "24px 16px 120px",
        textAlign: "center",
        marginTop: "40px",
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "12px" }}>
          <a
            href="https://twitter.com/Jee_phoenix"
            target="_blank" rel="noreferrer"
            style={{ color: theme.textMuted, fontSize: "13px", fontWeight: "500", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = theme.text}
            onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
          >
            Contact Us
          </a>
          <span
            onClick={() => setShowPrivacy(true)}
            style={{ color: theme.textMuted, fontSize: "13px", fontWeight: "500", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.color = theme.text}
            onMouseLeave={e => e.currentTarget.style.color = theme.textMuted}
          >
            Privacy Policy
          </span>
        </div>
        <div style={{ color: theme.textDim, fontSize: "12px" }}>
          © 2026 BaseQuest™ — Built on Base
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="mobile-nav"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: theme.footerBg,
          borderTop: `1px solid ${theme.border}`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 100,
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
        }}
      >
        <div style={{ display: "flex", padding: "6px 0" }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, background: "none", border: "none",
                  color: active ? "#0052ff" : theme.tabInactive,
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                  padding: "8px 4px",
                  transition: "color 0.15s",
                  fontFamily: "inherit",
                  position: "relative",
                }}
              >
                {active && (
                  <span style={{
                    position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                    width: "24px", height: "2px",
                    background: "#0052ff", borderRadius: "0 0 2px 2px",
                  }} />
                )}
                <tab.Icon size={20} />
                <span style={{ fontSize: "10px", fontWeight: active ? "600" : "400", letterSpacing: "-0.1px" }}>
                  {tab.label.split(" ")[0]}
                </span>
                {tab.id === "bossraid" && (
                  <span style={{
                    position: "absolute", top: "6px", right: "calc(50% - 18px)",
                    width: "6px", height: "6px",
                    background: "#ff3b3b", borderRadius: "50%",
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <SupportBot />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${theme.bg}; transition: background 0.3s; font-family: 'Inter', sans-serif; }
        input, button, textarea { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,82,255,0.25); border-radius: 2px; }
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
