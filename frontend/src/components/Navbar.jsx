import { useState } from "react";
import { shortAddr, getLevelInfo } from "../utils/contracts";
import {
  SunIcon, MoonIcon, WalletIcon, ZapIcon,
  LinkIcon, LogOutIcon, AlertIcon, SearchIcon,
} from "./Icons";

const WALLET_OPTIONS = [
  {
    label: "MetaMask",
    sub:   "Browser extension",
    logo:  "https://avatars.githubusercontent.com/u/11744586?v=4",
    color: "#f6851b",
  },
  {
    label: "Coinbase Wallet",
    sub:   "Mobile & extension",
    logo:  "https://avatars.githubusercontent.com/u/1885080?v=4",
    color: "#0052ff",
  },
  {
    label: "Rabby / Other",
    sub:   "Any Web3 wallet",
    logo:  "https://avatars.githubusercontent.com/u/97009954?v=4",
    color: "#8a63d2",
  },
];

function WalletLogo({ logo, color, size = 32 }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "8px",
        background: `${color}22`,
        border: `1.5px solid ${color}55`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <WalletIcon size={size * 0.5} style={{ color }} />
      </div>
    );
  }
  return (
    <img
      src={logo}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ borderRadius: "8px", flexShrink: 0, objectFit: "cover", display: "block" }}
    />
  );
}

export default function Navbar({ wallet, isDark, setIsDark, theme }) {
  const {
    address, isConnected, connecting,
    connectWallet, disconnectWallet,
    switchNetwork, userProfile, chainId,
  } = wallet;

  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showUserMenu,   setShowUserMenu]   = useState(false);

  const levelInfo        = userProfile ? getLevelInfo(userProfile.totalXP) : null;
  const isCorrectNetwork = chainId === 8453;

  const menuBg     = isDark ? "#12141a" : "#ffffff";
  const menuItemHover = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      borderBottom: `1px solid ${theme.border}`,
      background: theme.bgNav,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      height: "64px",
      display: "flex", alignItems: "center",
      transition: "background 0.3s",
    }}>
      <div style={{
        maxWidth: "1100px", margin: "0 auto", padding: "0 16px",
        width: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "12px",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <div style={{
            width: "34px", height: "34px",
            borderRadius: "10px",
            background: "rgba(0,82,255,0.12)",
            border: "1px solid rgba(0,82,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <img
              src="/logo.png" alt="BQ"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<span style="color:#0052ff;font-weight:700;font-size:12px;font-family:Inter,sans-serif">BQ</span>'; }}
            />
          </div>
          <span style={{ color: theme.text, fontWeight: "700", fontSize: "17px", letterSpacing: "-0.4px" }}>
            Base<span style={{ color: "#0052ff" }}>Quest</span>
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

          {/* XP badge — hide on very small screens */}
          {isConnected && levelInfo && (
            <div
              className="xp-badge"
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "6px 12px",
                background: theme.bgCard,
                border: `1px solid ${theme.border}`,
                borderRadius: "10px",
              }}
            >
              <ZapIcon size={14} style={{ color: "#0052ff" }} />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ color: "#0052ff", fontWeight: "700", fontSize: "12px" }}>
                  {userProfile.totalXP.toLocaleString()} XP
                </div>
                <div style={{ color: theme.textMuted, fontSize: "10px", fontWeight: "400" }}>
                  Lv {levelInfo.current.level} · {levelInfo.current.name}
                </div>
              </div>
            </div>
          )}

          {/* Wrong network */}
          {isConnected && !isCorrectNetwork && (
            <button
              onClick={switchNetwork}
              className="navbar-wrong-network"
              style={{
                background: "rgba(255,59,59,0.1)",
                border: "1px solid rgba(255,59,59,0.3)",
                borderRadius: "8px", padding: "6px 12px",
                color: "#ff6b6b", fontWeight: "600", fontSize: "12px",
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <AlertIcon size={13} />
              <span className="network-label">Wrong Network</span>
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(v => !v)}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              width: "36px", height: "36px",
              borderRadius: "10px",
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
              color: theme.textMuted,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,82,255,0.4)"; e.currentTarget.style.color = theme.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.textMuted; }}
          >
            {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>

          {/* Connect / wallet menu */}
          {!isConnected ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowWalletMenu(v => !v)}
                disabled={connecting}
                style={{
                  background: connecting ? "rgba(0,82,255,0.4)" : "linear-gradient(135deg, #0052ff, #0041cc)",
                  border: "none", borderRadius: "10px", padding: "9px 16px",
                  color: "white", fontWeight: "600", fontSize: "13px",
                  cursor: connecting ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 12px rgba(0,82,255,0.3)",
                  fontFamily: "inherit", letterSpacing: "-0.1px",
                  display: "flex", alignItems: "center", gap: "7px",
                }}
              >
                <WalletIcon size={14} />
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>

              {showWalletMenu && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  width: "210px", background: menuBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "14px", padding: "6px",
                  zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                }}>
                  {WALLET_OPTIONS.map(w => (
                    <button
                      key={w.label}
                      onClick={() => { connectWallet(); setShowWalletMenu(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 12px", background: "none", border: "none",
                        borderRadius: "10px", color: theme.text,
                        fontSize: "13px", fontWeight: "500",
                        cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = menuItemHover}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <WalletLogo logo={w.logo} color={w.color} size={32} />
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: theme.text }}>{w.label}</div>
                        <div style={{ fontSize: "11px", color: theme.textMuted }}>{w.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          ) : (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowUserMenu(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 14px",
                  background: theme.bgCard,
                  border: "1px solid rgba(0,82,255,0.25)",
                  borderRadius: "10px", color: theme.text,
                  fontWeight: "500", fontSize: "13px",
                  cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.1px",
                }}
              >
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#00c853", flexShrink: 0 }} />
                {userProfile?.usernameSet ? userProfile.username : shortAddr(address)}
              </button>

              {showUserMenu && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  width: "210px", background: menuBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: "14px", padding: "6px",
                  zIndex: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                }}>
                  <div style={{
                    padding: "8px 12px 10px",
                    borderBottom: `1px solid ${theme.border}`,
                    marginBottom: "4px",
                  }}>
                    <div style={{ color: theme.textMuted, fontSize: "11px", marginBottom: "2px" }}>Connected</div>
                    <div style={{ color: theme.text, fontSize: "13px", fontWeight: "600" }}>{shortAddr(address)}</div>
                  </div>
                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank" rel="noreferrer"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: "9px",
                      padding: "9px 12px", borderRadius: "10px",
                      color: theme.textMuted, fontSize: "13px",
                      textDecoration: "none", cursor: "pointer", fontWeight: "400",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = menuItemHover}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <LinkIcon size={14} />
                    View on Basescan
                  </a>
                  <button
                    onClick={() => { disconnectWallet(); setShowUserMenu(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "9px",
                      padding: "9px 12px", background: "none", border: "none",
                      borderRadius: "10px", color: "#ff6b6b",
                      fontSize: "13px", fontWeight: "500",
                      cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,59,59,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <LogOutIcon size={14} />
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {(showWalletMenu || showUserMenu) && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => { setShowWalletMenu(false); setShowUserMenu(false); }}
        />
      )}

      <style>{`
        @media (max-width: 480px) { .xp-badge { display: none !important; } }
      `}</style>
    </nav>
  );
}
