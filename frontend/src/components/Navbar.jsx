import { useState } from "react";
import { shortAddr, getLevelInfo } from "../utils/contracts";
import {
  WalletIcon, LinkIcon, LogOutIcon, AlertIcon, ChevronDownIcon,
} from "./Icons";

const WALLET_OPTIONS = [
  {
    label: "MetaMask",
    sub:   "Browser extension",
    color: "#f6851b",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="#f6851b" opacity="0.15"/>
        <path d="M22 7L15.5 12l1.2-3.5L22 7z" fill="#e17726" stroke="#e17726" strokeWidth="0.25"/>
        <path d="M6 7l6.4 5.1L11.3 8.5 6 7z" fill="#e27625" stroke="#e27625" strokeWidth="0.25"/>
        <path d="M19.7 18.4l-1.7 2.6 3.7 1 1-3.5-3-.1z" fill="#e27625"/>
        <path d="M5.3 18.5l1 3.5 3.7-1-1.7-2.6-3 .1z" fill="#e27625"/>
        <path d="M10.8 13.4l-1 1.5 3.6.2-.1-3.9-2.5 2.2z" fill="#e27625"/>
        <path d="M17.2 13.4l-2.6-2.3-.1 3.9 3.6-.2-1-1.4z" fill="#e27625"/>
        <path d="M10 20l2.2-1-1.9-1.5-.3 2.5z" fill="#e27625"/>
        <path d="M15.8 20l.3-2.5-1.9 1.5 1.6 1z" fill="#e27625"/>
      </svg>
    ),
  },
  {
    label: "Coinbase Wallet",
    sub:   "Mobile & browser extension",
    color: "#0052ff",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="#0052ff"/>
        <circle cx="14" cy="14" r="7" fill="white"/>
        <rect x="11" y="11" width="6" height="6" rx="1.5" fill="#0052ff"/>
      </svg>
    ),
  },
  {
    label: "Rabby / Other",
    sub:   "Any Web3 wallet",
    color: "#8a63d2",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="8" fill="#8a63d2" opacity="0.15"/>
        <circle cx="14" cy="13" r="5" stroke="#8a63d2" strokeWidth="2"/>
        <path d="M9 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#8a63d2" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function Navbar({ wallet, theme }) {
  const {
    address, isConnected, connecting,
    connectWallet, disconnectWallet,
    switchNetwork, userProfile, chainId,
  } = wallet;

  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showUserMenu,   setShowUserMenu]   = useState(false);

  const levelInfo        = userProfile ? getLevelInfo(userProfile.totalXP) : null;
  const isCorrectNetwork = chainId === 8453;

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      background: "rgba(10,11,15,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      height: "60px",
      display: "flex", alignItems: "center",
    }}>
      <div style={{
        maxWidth: "1100px", margin: "0 auto", padding: "0 20px",
        width: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "12px",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "9px", flexShrink: 0 }}>
          <div style={{
            width: "32px", height: "32px",
            borderRadius: "9px",
            background: "#0052ff",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}>
            <img
              src="/logo.png" alt="BQ"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = '<span style="color:white;font-weight:700;font-size:13px;font-family:Inter,sans-serif;letter-spacing:-0.02em">BQ</span>';
              }}
            />
          </div>
          <span style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "16px", letterSpacing: "-0.03em" }}>
            Base<span style={{ color: "#0052ff" }}>Quest</span>
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

          {/* Wrong network */}
          {isConnected && !isCorrectNetwork && (
            <button
              onClick={switchNetwork}
              className="navbar-wrong-network"
              style={{
                background: "rgba(255,59,59,0.08)",
                border: "1px solid rgba(255,59,59,0.2)",
                borderRadius: "8px", padding: "6px 12px",
                color: "#ff6b6b", fontWeight: "500", fontSize: "12px",
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,59,59,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,59,59,0.08)"}
            >
              <AlertIcon size={13} />
              <span className="network-label">Switch to Base</span>
            </button>
          )}

          {/* Connect / wallet button */}
          {!isConnected ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowWalletMenu(v => !v)}
                disabled={connecting}
                style={{
                  background: connecting ? "rgba(0,82,255,0.5)" : "#0052ff",
                  border: "none", borderRadius: "9px", padding: "8px 16px",
                  color: "white", fontWeight: "600", fontSize: "13px",
                  cursor: connecting ? "not-allowed" : "pointer",
                  fontFamily: "inherit", letterSpacing: "-0.01em",
                  display: "flex", alignItems: "center", gap: "7px",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!connecting) e.currentTarget.style.background = "#1a64ff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = connecting ? "rgba(0,82,255,0.5)" : "#0052ff"; }}
              >
                <WalletIcon size={14} />
                {connecting ? "Connecting..." : "Connect Wallet"}
              </button>

              {showWalletMenu && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  width: "220px",
                  background: "#12141a",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "14px", padding: "6px",
                  zIndex: 200,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                }}>
                  <div style={{
                    padding: "8px 12px 10px",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    marginBottom: "4px",
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "500",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}>
                    Select Wallet
                  </div>
                  {WALLET_OPTIONS.map(w => (
                    <button
                      key={w.label}
                      onClick={() => { connectWallet(); setShowWalletMenu(false); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: "10px",
                        padding: "9px 10px", background: "none", border: "none",
                        borderRadius: "9px", color: "#f1f5f9",
                        fontSize: "13px", fontWeight: "500",
                        cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      {w.icon}
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#f1f5f9" }}>{w.label}</div>
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "1px" }}>{w.sub}</div>
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
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "7px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "9px", color: "#f1f5f9",
                  fontWeight: "500", fontSize: "13px",
                  cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              >
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "rgba(0,82,255,0.2)",
                  border: "1.5px solid rgba(0,82,255,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0052ff" }} />
                </div>
                <span>{userProfile?.usernameSet ? userProfile.username : shortAddr(address)}</span>
                {levelInfo && (
                  <span style={{ color: "#64748b", fontSize: "12px", fontWeight: "400" }}>
                    · Lv {levelInfo.current.level}
                  </span>
                )}
                <ChevronDownIcon size={12} />
              </button>

              {showUserMenu && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  width: "220px",
                  background: "#12141a",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "14px", padding: "6px",
                  zIndex: 200,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                }}>
                  {/* Profile header */}
                  <div style={{
                    padding: "10px 12px 12px",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    marginBottom: "4px",
                  }}>
                    <div style={{ color: "#64748b", fontSize: "11px", marginBottom: "4px", fontWeight: "500" }}>
                      Connected on Base
                    </div>
                    <div style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>
                      {shortAddr(address)}
                    </div>
                    {levelInfo && (
                      <div style={{ color: "#0052ff", fontSize: "12px", fontWeight: "500", marginTop: "4px" }}>
                        {userProfile.totalXP.toLocaleString()} XP · Level {levelInfo.current.level}
                      </div>
                    )}
                  </div>

                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank" rel="noreferrer"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: "9px",
                      padding: "9px 12px", borderRadius: "9px",
                      color: "#8892a4", fontSize: "13px",
                      textDecoration: "none", cursor: "pointer", fontWeight: "400",
                      transition: "all 0.12s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#f1f5f9"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#8892a4"; }}
                  >
                    <LinkIcon size={14} />
                    View on Basescan
                  </a>

                  <button
                    onClick={() => { disconnectWallet(); setShowUserMenu(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "9px",
                      padding: "9px 12px", background: "none", border: "none",
                      borderRadius: "9px", color: "#ff6b6b",
                      fontSize: "13px", fontWeight: "500",
                      cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,59,59,0.07)"}
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
    </nav>
  );
}
