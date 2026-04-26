import { useState } from "react";
import { ScanIcon, AlertIcon, AlertTriIcon, ShieldCheckIcon, SearchIcon, RefreshIcon, CheckCircleIcon, LinkIcon } from "./Icons";

const BLOCKSCOUT = "https://base.blockscout.com/api/v2";

async function fetchContractInfo(address) {
  const [addrRes, contractRes] = await Promise.allSettled([
    fetch(`${BLOCKSCOUT}/addresses/${address}`).then(r => r.ok ? r.json() : null),
    fetch(`${BLOCKSCOUT}/smart-contracts/${address}`).then(r => r.ok ? r.json() : null),
  ]);

  const addrData     = addrRes.status     === "fulfilled" ? addrRes.value     : null;
  const contractData = contractRes.status === "fulfilled" ? contractRes.value : null;

  return { addrData, contractData };
}

function getRiskFlags(addrData, contractData) {
  const flags = [];
  if (!contractData) {
    flags.push({ level: "warn", text: "Contract source code is not verified on Blockscout" });
  }
  if (contractData?.is_proxy) {
    flags.push({ level: "info", text: "This is a proxy contract — logic may be upgraded by the owner" });
  }
  if (contractData?.name?.toLowerCase().includes("test")) {
    flags.push({ level: "warn", text: "Contract name contains 'test' — could be experimental" });
  }
  if (addrData?.transaction_count < 10 && addrData?.transaction_count != null) {
    flags.push({ level: "warn", text: "Very few transactions — may be a newly deployed or unused contract" });
  }
  if (contractData && !contractData.is_proxy) {
    flags.push({ level: "ok", text: "Non-proxy contract — code cannot be silently upgraded" });
  }
  if (contractData) {
    flags.push({ level: "ok", text: "Source code verified on Blockscout" });
  }
  return flags;
}

function timeAgo(dateStr) {
  if (!dateStr) return "Unknown";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days  = Math.floor(diff / 86400000);
  if (days < 1)   return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30)  return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function shortAddr(addr) {
  if (!addr) return "Unknown";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ContractScanner({ theme }) {
  const [input, setInput]   = useState("");
  const [data, setData]     = useState(null);
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState(null);

  async function scan() {
    const addr = input.trim().toLowerCase();
    if (!/^0x[0-9a-f]{40}$/.test(addr)) {
      setError("Enter a valid 0x contract address.");
      return;
    }
    setLoad(true);
    setError(null);
    setData(null);
    try {
      const { addrData, contractData } = await fetchContractInfo(addr);
      if (!addrData && !contractData) throw new Error("Address not found on Base.");
      if (addrData && !addrData.is_contract) {
        setError("This address is an EOA (regular wallet), not a contract.");
        setLoad(false);
        return;
      }
      const flags = getRiskFlags(addrData, contractData);
      setData({ addrData, contractData, flags, address: addr });
    } catch (e) {
      setError(e.message || "Failed to fetch contract info.");
    } finally {
      setLoad(false);
    }
  }

  const cardStyle = {
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "12px",
  };

  const okCount   = data?.flags.filter(f => f.level === "ok").length   || 0;
  const warnCount = data?.flags.filter(f => f.level === "warn").length  || 0;

  const riskLabel =
    warnCount === 0  ? { text: "Low Risk",    color: "#00c853", bg: "rgba(0,200,83,0.1)", border: "rgba(0,200,83,0.3)" } :
    warnCount <= 1   ? { text: "Medium Risk", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" } :
                       { text: "High Risk",   color: "#ff6b6b", bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.3)" };

  return (
    <div style={{ paddingTop: "24px" }}>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <ScanIcon size={20} style={{ color: "#0052ff" }} />
          <span style={{ fontSize: "20px", fontWeight: "700", color: theme.text, letterSpacing: "-0.3px" }}>Contract Scanner</span>
        </div>
        <div style={{ fontSize: "13px", color: theme.textMuted }}>
          Paste any Base contract address for a quick risk and info summary
        </div>
      </div>

      {/* Input */}
      <div style={{ ...cardStyle }}>
        <div style={{ fontSize: "12px", color: theme.textMuted, fontWeight: "600", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
          Contract Address
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && scan()}
            placeholder="0x..."
            style={{
              flex: "1 1 180px", minWidth: 0,
              background: "rgba(0,0,0,0.2)", border: `1px solid ${theme.border}`,
              borderRadius: "10px", padding: "10px 14px", color: theme.text,
              fontSize: "13px", fontFamily: "monospace", outline: "none",
            }}
          />
          <button
            onClick={scan}
            disabled={loading}
            style={{
              background: loading ? "rgba(0,82,255,0.3)" : "#0052ff",
              border: "none", borderRadius: "10px", padding: "10px 20px",
              color: "white", fontWeight: "600", fontSize: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "7px", fontFamily: "inherit",
              boxShadow: "none",
              whiteSpace: "nowrap",
            }}
          >
            {loading
              ? <><RefreshIcon size={14} style={{ animation: "spin 1s linear infinite" }} /> Scanning...</>
              : <><ScanIcon size={14} /> Scan Contract</>
            }
          </button>
        </div>
        {error && (
          <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center", color: "#ff6b6b", fontSize: "13px" }}>
            <AlertIcon size={14} /> {error}
          </div>
        )}
      </div>

      {/* Results */}
      {data && (() => {
        const { addrData, contractData, flags, address } = data;
        const token = addrData?.token;
        return (
          <>
            {/* Risk badge */}
            <div style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "13px", color: theme.textMuted, marginBottom: "4px" }}>Contract</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: theme.text, fontFamily: "monospace" }}>
                  {contractData?.name || shortAddr(address)}
                </div>
                {contractData?.name && (
                  <div style={{ fontSize: "12px", color: theme.textMuted, fontFamily: "monospace", marginTop: "2px" }}>
                    {shortAddr(address)}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{
                  background: riskLabel.bg, border: `1px solid ${riskLabel.border}`,
                  borderRadius: "20px", padding: "6px 14px",
                  color: riskLabel.color, fontSize: "13px", fontWeight: "700",
                }}>
                  {riskLabel.text}
                </span>
                <a
                  href={`https://basescan.org/address/${address}`}
                  target="_blank" rel="noreferrer"
                  style={{
                    background: "rgba(0,82,255,0.1)", border: "1px solid rgba(0,82,255,0.2)",
                    borderRadius: "8px", padding: "6px 12px",
                    color: "#0052ff", fontSize: "12px", fontWeight: "600",
                    textDecoration: "none", display: "flex", alignItems: "center", gap: "5px",
                  }}
                >
                  <LinkIcon size={12} /> BaseScan
                </a>
              </div>
            </div>

            {/* Token info */}
            {token && (
              <div style={{ ...cardStyle }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" }}>Token</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                  {[
                    { label: "Name",    value: token.name },
                    { label: "Symbol",  value: token.symbol },
                    { label: "Type",    value: token.type },
                    { label: "Holders", value: token.holders != null ? Number(token.holders).toLocaleString() : "—" },
                    { label: "Total Supply", value: token.total_supply ? (Number(token.total_supply) / Math.pow(10, token.decimals || 18)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—" },
                    { label: "Decimals", value: token.decimals },
                  ].map((row, i) => (
                    <div key={i}>
                      <div style={{ fontSize: "11px", color: theme.textMuted, marginBottom: "2px" }}>{row.label}</div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: theme.text }}>{row.value || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contract details */}
            <div style={{ ...cardStyle }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" }}>Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                {[
                  { label: "Verified",     value: contractData ? "Yes" : "No", color: contractData ? "#00c853" : "#ff6b6b" },
                  { label: "Proxy",        value: contractData?.is_proxy ? "Yes" : "No", color: contractData?.is_proxy ? "#f59e0b" : theme.text },
                  { label: "Language",     value: contractData?.language || "—" },
                  { label: "Compiler",     value: contractData?.compiler_version?.split("+")[0] || "—" },
                  { label: "Transactions", value: addrData?.transaction_count != null ? Number(addrData.transaction_count).toLocaleString() : "—" },
                  { label: "Deployed",     value: addrData?.creation_tx_hash ? "View →" : "—", link: addrData?.creation_tx_hash ? `https://basescan.org/tx/${addrData.creation_tx_hash}` : null },
                  { label: "Creator",      value: addrData?.creator_address_hash ? shortAddr(addrData.creator_address_hash) : "—", mono: true, link: addrData?.creator_address_hash ? `https://basescan.org/address/${addrData.creator_address_hash}` : null },
                ].map((row, i) => (
                  <div key={i}>
                    <div style={{ fontSize: "11px", color: theme.textMuted, marginBottom: "2px" }}>{row.label}</div>
                    {row.link
                      ? <a href={row.link} target="_blank" rel="noreferrer" style={{ fontSize: "13px", fontWeight: "600", color: "#0052ff", fontFamily: row.mono ? "monospace" : "inherit", textDecoration: "none" }}>{row.value}</a>
                      : <div style={{ fontSize: "13px", fontWeight: "600", color: row.color || theme.text, fontFamily: row.mono ? "monospace" : "inherit" }}>{row.value}</div>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Risk flags */}
            <div style={{ ...cardStyle }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "12px" }}>
                Risk Analysis · {okCount} passed · {warnCount} {warnCount === 1 ? "warning" : "warnings"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {flags.map((f, i) => {
                  const color = f.level === "ok" ? "#00c853" : f.level === "warn" ? "#f59e0b" : "#64748b";
                  const Icon  = f.level === "ok" ? CheckCircleIcon : f.level === "warn" ? AlertTriIcon : AlertIcon;
                  return (
                    <div key={i} style={{
                      display: "flex", gap: "10px", alignItems: "flex-start",
                      background: `${color}0d`, border: `1px solid ${color}30`,
                      borderRadius: "10px", padding: "10px 12px",
                    }}>
                      <Icon size={15} style={{ color, flexShrink: 0, marginTop: "1px" }} />
                      <span style={{ fontSize: "13px", color: theme.text }}>{f.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      })()}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
