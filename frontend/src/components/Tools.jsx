import { useState } from "react";
import DeFiYield       from "./DeFiYield";
import AirdropChecker  from "./AirdropChecker";
import ContractScanner from "./ContractScanner";
import BridgeTracker   from "./BridgeTracker";
import WalletAnalyzer  from "./WalletAnalyzer";
import { TrendingUpIcon, GiftIcon, ScanIcon, LayersIcon, SearchIcon } from "./Icons";

const TOOLS = [
  { id: "defi",     label: "DeFi Yield",      Icon: TrendingUpIcon, color: "#0052ff",  desc: "Top Base pools" },
  { id: "airdrop",  label: "Airdrop Checker",  Icon: GiftIcon,       color: "#a855f7",  desc: "Eligibility scan" },
  { id: "scanner",  label: "Contract Scanner", Icon: ScanIcon,       color: "#00d4ff",  desc: "Risk summary" },
  { id: "bridges",  label: "Bridge Tracker",   Icon: LayersIcon,     color: "#00c853",  desc: "Bridge history" },
  { id: "analyzer", label: "Wallet Analyzer",  Icon: SearchIcon,     color: "#f59e0b",  desc: "Base score" },
];

export default function Tools({ wallet, theme, isDark }) {
  const [active, setActive] = useState("defi");

  const cardStyle = {
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: "14px",
    padding: "16px",
  };

  return (
    <div style={{ paddingTop: "24px" }}>
      {/* Tool selector */}
      <div className="tools-grid">
        {TOOLS.map(t => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                background: isActive ? `${t.color}14` : theme.bgCard,
                border: `1px solid ${isActive ? t.color + "50" : theme.border}`,
                borderRadius: "14px",
                padding: "14px 10px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{
                width: "38px", height: "38px",
                background: isActive ? `${t.color}20` : "rgba(255,255,255,0.04)",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <t.Icon size={18} style={{ color: isActive ? t.color : theme.textMuted }} />
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: isActive ? "700" : "500", color: isActive ? t.color : theme.text, textAlign: "center" }}>{t.label}</div>
                <div style={{ fontSize: "10px", color: theme.textMuted, textAlign: "center", marginTop: "2px" }}>{t.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active tool */}
      {active === "defi"     && <DeFiYield       theme={theme} wallet={wallet} />}
      {active === "airdrop"  && <AirdropChecker  theme={theme} wallet={wallet} />}
      {active === "scanner"  && <ContractScanner theme={theme} wallet={wallet} />}
      {active === "bridges"  && <BridgeTracker   theme={theme} wallet={wallet} />}
      {active === "analyzer" && <WalletAnalyzer  theme={theme} wallet={wallet} isDark={isDark} />}
    </div>
  );
}
