import { useState } from "react";
import DeFiYield       from "./DeFiYield";
import AirdropChecker  from "./AirdropChecker";
import ContractScanner from "./ContractScanner";
import BridgeTracker   from "./BridgeTracker";
import WalletAnalyzer  from "./WalletAnalyzer";
import { TrendingUpIcon, GiftIcon, ScanIcon, LayersIcon, SearchIcon } from "./Icons";

const TOOLS = [
  {
    id: "defi",     label: "DeFi Yield",      Icon: TrendingUpIcon,
    color: "#0052ff",  desc: "Top Base pools",
    bg: "rgba(0,82,255,0.08)", borderActive: "rgba(0,82,255,0.45)",
  },
  {
    id: "airdrop",  label: "Airdrop Checker",  Icon: GiftIcon,
    color: "#8a63d2",  desc: "Eligibility scan",
    bg: "rgba(138,99,210,0.08)", borderActive: "rgba(138,99,210,0.45)",
  },
  {
    id: "scanner",  label: "Contract Scanner", Icon: ScanIcon,
    color: "#00c853",  desc: "Risk summary",
    bg: "rgba(0,200,83,0.08)", borderActive: "rgba(0,200,83,0.45)",
  },
  {
    id: "bridges",  label: "Bridge Tracker",   Icon: LayersIcon,
    color: "#f0b429",  desc: "Bridge history",
    bg: "rgba(240,180,41,0.08)", borderActive: "rgba(240,180,41,0.45)",
  },
  {
    id: "analyzer", label: "Wallet Analyzer",  Icon: SearchIcon,
    color: "#ff6b6b",  desc: "Base score",
    bg: "rgba(255,107,107,0.08)", borderActive: "rgba(255,107,107,0.45)",
  },
];

export default function Tools({ wallet, theme, isDark }) {
  const [active, setActive] = useState("defi");
  const activeTool = TOOLS.find(t => t.id === active);

  return (
    <div style={{ paddingTop: "24px" }}>

      {/* Section header */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ color: "#f1f5f9", fontSize: "22px", fontWeight: "800", margin: "0 0 4px", letterSpacing: "-0.04em" }}>
          DeFi Tools
        </h2>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
          Research, analyze, and optimize your Base activity
        </p>
      </div>

      {/* Tool selector */}
      <div className="tools-grid" style={{ marginBottom: "20px" }}>
        {TOOLS.map(t => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                background:   isActive ? t.bg : "rgba(255,255,255,0.03)",
                border:       `1px solid ${isActive ? t.borderActive : "rgba(255,255,255,0.07)"}`,
                borderRadius: "16px",
                padding:      "16px 10px",
                cursor:       "pointer",
                fontFamily:   "inherit",
                transition:   "all 0.15s",
                display:      "flex",
                flexDirection: "column",
                alignItems:   "center",
                gap:          "10px",
                boxShadow:    isActive ? `0 0 20px ${t.color}18` : "none",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}}
            >
              <div style={{
                width:          "44px",
                height:         "44px",
                background:     isActive ? `${t.color}20` : "rgba(255,255,255,0.05)",
                border:         `1px solid ${isActive ? t.color + "44" : "rgba(255,255,255,0.08)"}`,
                borderRadius:   "12px",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                boxShadow:      isActive ? `0 0 14px ${t.color}33` : "none",
                transition:     "all 0.15s",
              }}>
                <t.Icon size={20} style={{ color: isActive ? t.color : "#64748b" }} />
              </div>
              <div>
                <div style={{
                  fontSize:    "12px",
                  fontWeight:  isActive ? "700" : "500",
                  color:       isActive ? t.color : "#8892a4",
                  textAlign:   "center",
                  lineHeight:  "1.3",
                }}>
                  {t.label}
                </div>
                <div style={{ fontSize: "10px", color: "#4a5568", textAlign: "center", marginTop: "2px" }}>{t.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active tool label */}
      {activeTool && (
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "8px",
          marginBottom: "12px",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{
            width: "24px", height: "24px", borderRadius: "6px",
            background: `${activeTool.color}18`,
            border: `1px solid ${activeTool.color}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <activeTool.Icon size={13} style={{ color: activeTool.color }} />
          </div>
          <span style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "14px", letterSpacing: "-0.02em" }}>
            {activeTool.label}
          </span>
          <span style={{ color: "#64748b", fontSize: "13px" }}>— {activeTool.desc}</span>
        </div>
      )}

      {/* Active tool content */}
      {active === "defi"     && <DeFiYield       theme={theme} wallet={wallet} />}
      {active === "airdrop"  && <AirdropChecker  theme={theme} wallet={wallet} />}
      {active === "scanner"  && <ContractScanner theme={theme} wallet={wallet} />}
      {active === "bridges"  && <BridgeTracker   theme={theme} wallet={wallet} />}
      {active === "analyzer" && <WalletAnalyzer  theme={theme} wallet={wallet} isDark={isDark} />}
    </div>
  );
}
