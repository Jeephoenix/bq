import { useState, useEffect } from "react";
import { TrendingUpIcon, RefreshIcon, AlertIcon } from "./Icons";

const PROTOCOLS = ["All", "aerodrome-v2", "aerodrome-cl", "uniswap-v3", "compound-v3", "aave-v3", "morpho", "moonwell", "extra-finance"];
const PROTOCOL_LABELS = {
  "aerodrome-v2":  "Aerodrome V2",
  "aerodrome-cl":  "Aerodrome CL",
  "uniswap-v3":    "Uniswap V3",
  "compound-v3":   "Compound V3",
  "aave-v3":       "Aave V3",
  "morpho":        "Morpho",
  "moonwell":      "Moonwell",
  "extra-finance": "Extra Finance",
};
const PROTOCOL_COLORS = {
  "aerodrome-v2":  "#0052ff",
  "aerodrome-cl":  "#0066ff",
  "uniswap-v3":    "#ff007a",
  "compound-v3":   "#00d395",
  "aave-v3":       "#b6509e",
  "morpho":        "#0052ff",
  "moonwell":      "#53cbc9",
  "extra-finance": "#f59e0b",
};

function formatTVL(n) {
  if (!n) return "$0";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatAPY(n) {
  if (!n && n !== 0) return "—";
  return `${n.toFixed(2)}%`;
}

function getAPYColor(apy) {
  if (apy >= 20) return "#00c853";
  if (apy >= 10) return "#7dd87d";
  if (apy >= 5)  return "#f59e0b";
  return "#64748b";
}

export default function DeFiYield({ theme }) {
  const [pools, setPools]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [filter, setFilter]       = useState("All");
  const [sortBy, setSortBy]       = useState("apy");
  const [minTVL, setMinTVL]       = useState(100000);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadPools() {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("https://yields.llama.fi/pools");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const base = (data.data || []).filter(p =>
        p.chain === "Base" &&
        PROTOCOLS.slice(1).includes(p.project) &&
        p.tvlUsd >= 10000 &&
        p.apy > 0
      );
      setPools(base);
      setLastUpdated(new Date());
    } catch (e) {
      setError("Could not load yield data. DeFiLlama API may be temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPools(); }, []);

  const filtered = pools
    .filter(p => (filter === "All" || p.project === filter) && p.tvlUsd >= minTVL)
    .sort((a, b) => {
      if (sortBy === "apy")  return (b.apy || 0) - (a.apy || 0);
      if (sortBy === "tvl")  return (b.tvlUsd || 0) - (a.tvlUsd || 0);
      if (sortBy === "base") return (b.apyBase || 0) - (a.apyBase || 0);
      return 0;
    });

  const cardStyle = {
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: "14px",
    padding: "16px",
  };

  return (
    <div style={{ paddingTop: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <TrendingUpIcon size={20} style={{ color: "#0052ff" }} />
            <span style={{ fontSize: "20px", fontWeight: "700", color: theme.text, letterSpacing: "-0.3px" }}>DeFi Yield Dashboard</span>
          </div>
          <div style={{ fontSize: "13px", color: theme.textMuted }}>
            Top liquidity pools on Base — live APY & TVL data
            {lastUpdated && <span style={{ marginLeft: "8px", color: theme.textDim }}>· Updated {lastUpdated.toLocaleTimeString()}</span>}
          </div>
        </div>
        <button
          onClick={loadPools}
          disabled={loading}
          style={{
            background: "rgba(0,82,255,0.1)", border: "1px solid rgba(0,82,255,0.3)",
            borderRadius: "10px", padding: "8px 14px", color: "#0052ff",
            fontSize: "13px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: "6px", fontFamily: "inherit",
          }}
        >
          <RefreshIcon size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          {PROTOCOLS.map(p => {
            const active = filter === p;
            return (
              <button
                key={p}
                onClick={() => setFilter(p)}
                style={{
                  background: active ? "rgba(0,82,255,0.15)" : "transparent",
                  border: `1px solid ${active ? "rgba(0,82,255,0.4)" : theme.border}`,
                  borderRadius: "20px", padding: "5px 12px",
                  color: active ? "#0052ff" : theme.textMuted,
                  fontSize: "12px", fontWeight: active ? "600" : "400",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}
              >
                {p === "All" ? "All Protocols" : PROTOCOL_LABELS[p] || p}
              </button>
            );
          })}
        </div>
        <div className="defi-filter-bar">
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: theme.textMuted }}>Sort by:</span>
            {[["apy","APY"],["tvl","TVL"],["base","Base APY"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setSortBy(val)}
                style={{
                  background: sortBy === val ? "rgba(0,82,255,0.1)" : "transparent",
                  border: `1px solid ${sortBy === val ? "rgba(0,82,255,0.3)" : theme.border}`,
                  borderRadius: "8px", padding: "4px 10px",
                  color: sortBy === val ? "#0052ff" : theme.textMuted,
                  fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: theme.textMuted }}>Min TVL:</span>
            {[[100000,"$100K"],[500000,"$500K"],[1000000,"$1M"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setMinTVL(val)}
                style={{
                  background: minTVL === val ? "rgba(0,82,255,0.1)" : "transparent",
                  border: `1px solid ${minTVL === val ? "rgba(0,82,255,0.3)" : theme.border}`,
                  borderRadius: "8px", padding: "4px 10px",
                  color: minTVL === val ? "#0052ff" : theme.textMuted,
                  fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ ...cardStyle, background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.2)", display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "16px" }}>
          <AlertIcon size={16} style={{ color: "#ff6b6b", flexShrink: 0, marginTop: "1px" }} />
          <span style={{ fontSize: "13px", color: "#ff6b6b" }}>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: theme.textMuted }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid rgba(0,82,255,0.2)", borderTopColor: "#0052ff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: "14px" }}>Fetching live yield data from DeFiLlama...</div>
        </div>
      )}

      {/* Summary stats */}
      {!loading && !error && filtered.length > 0 && (
        <div className="defi-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
          {[
            { label: "Pools Found", value: filtered.length },
            { label: "Highest APY", value: formatAPY(Math.max(...filtered.map(p => p.apy || 0))), color: "#00c853" },
            { label: "Total TVL", value: formatTVL(filtered.reduce((s, p) => s + (p.tvlUsd || 0), 0)) },
          ].map((s, i) => (
            <div key={i} style={{ ...cardStyle, textAlign: "center" }}>
              <div className="defi-summary-value" style={{ fontSize: "18px", fontWeight: "700", color: s.color || theme.text, marginBottom: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pool table header — desktop only */}
      {!loading && filtered.length > 0 && (
        <div className="defi-pool-header" style={{ ...cardStyle, marginBottom: "4px", padding: "10px 16px" }}>
          <div className="defi-pool-grid">
            {["Pool", "Protocol", "TVL", "Base APY", "Total APY", ""].map((h, i) => (
              <div key={i} style={{ fontSize: "11px", fontWeight: "600", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", textAlign: i > 1 ? "right" : "left" }}>
                {h}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pool rows */}
      {!loading && filtered.map((pool, i) => {
        const color  = PROTOCOL_COLORS[pool.project] || "#0052ff";
        const label  = PROTOCOL_LABELS[pool.project] || pool.project;
        const apyCol = getAPYColor(pool.apy || 0);
        const linkHref = `https://defillama.com/yields/pool/${pool.pool}`;
        return (
          <div
            key={pool.pool || i}
            style={{ ...cardStyle, marginBottom: "6px", transition: "border-color 0.15s", cursor: "default" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,82,255,0.25)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
          >
            {/* ── Desktop layout ── */}
            <div className="defi-pool-grid">
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pool.symbol}</div>
                {pool.il7d != null && (
                  <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "2px" }}>IL: {pool.il7d.toFixed(2)}%</div>
                )}
              </div>
              <div>
                <span style={{ background: `${color}18`, border: `1px solid ${color}40`, borderRadius: "20px", padding: "3px 8px", color, fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </div>
              <div style={{ textAlign: "right", fontSize: "13px", color: theme.text, fontWeight: "500" }}>{formatTVL(pool.tvlUsd)}</div>
              <div style={{ textAlign: "right", fontSize: "13px", color: theme.textMuted }}>{formatAPY(pool.apyBase)}</div>
              <div style={{ textAlign: "right", fontSize: "14px", fontWeight: "700", color: apyCol }}>{formatAPY(pool.apy)}</div>
              <div style={{ textAlign: "right" }}>
                <a href={linkHref} target="_blank" rel="noreferrer" style={{ color: theme.textMuted, display: "flex", alignItems: "center", justifyContent: "flex-end" }} title="View on DeFiLlama">
                  <LinkIcon size={13} />
                </a>
              </div>
            </div>

            {/* ── Mobile layout ── */}
            <div className="defi-pool-mobile">
              {/* Row 1: name + badge + link */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px", gap: "8px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: theme.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {pool.symbol}
                  </div>
                  {pool.il7d != null && (
                    <div style={{ fontSize: "11px", color: "#f59e0b", marginTop: "2px" }}>IL risk: {pool.il7d.toFixed(2)}%</div>
                  )}
                </div>
                <span style={{ background: `${color}18`, border: `1px solid ${color}40`, borderRadius: "20px", padding: "3px 10px", color, fontSize: "11px", fontWeight: "600", flexShrink: 0 }}>
                  {label}
                </span>
                <a href={linkHref} target="_blank" rel="noreferrer" style={{ color: theme.textMuted, flexShrink: 0, display: "flex", alignItems: "center", paddingTop: "2px" }} title="View on DeFiLlama">
                  <LinkIcon size={14} />
                </a>
              </div>
              {/* Row 2: stats */}
              <div style={{ display: "flex", gap: "0", borderTop: `1px solid ${theme.border}`, paddingTop: "10px" }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: theme.text }}>{formatTVL(pool.tvlUsd)}</div>
                  <div style={{ fontSize: "10px", color: theme.textMuted, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>TVL</div>
                </div>
                <div style={{ width: "1px", background: theme.border }} />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: theme.textMuted }}>{formatAPY(pool.apyBase)}</div>
                  <div style={{ fontSize: "10px", color: theme.textMuted, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Base APY</div>
                </div>
                <div style={{ width: "1px", background: theme.border }} />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "15px", fontWeight: "800", color: apyCol }}>{formatAPY(pool.apy)}</div>
                  <div style={{ fontSize: "10px", color: theme.textMuted, marginTop: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total APY</div>
                </div>
              </div>
              {/* Reward breakdown (if applicable) */}
              {pool.apyReward > 0 && (
                <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: "14px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", color: theme.textMuted }}>Base: <strong style={{ color: theme.text }}>{formatAPY(pool.apyBase)}</strong></span>
                  <span style={{ fontSize: "11px", color: theme.textMuted }}>Rewards: <strong style={{ color: "#00c853" }}>+{formatAPY(pool.apyReward)}</strong></span>
                  {pool.apyMean30d != null && (
                    <span style={{ fontSize: "11px", color: theme.textMuted }}>30d avg: <strong style={{ color: theme.text }}>{formatAPY(pool.apyMean30d)}</strong></span>
                  )}
                </div>
              )}
            </div>

            {/* Desktop reward row */}
            {pool.apyReward > 0 && (
              <div className="defi-pool-grid" style={{ marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: "16px" }}>
                <span style={{ fontSize: "11px", color: theme.textMuted }}>Base: <strong style={{ color: theme.text }}>{formatAPY(pool.apyBase)}</strong></span>
                <span style={{ fontSize: "11px", color: theme.textMuted }}>Rewards: <strong style={{ color: "#00c853" }}>+{formatAPY(pool.apyReward)}</strong></span>
                {pool.apyMean30d != null && (
                  <span style={{ fontSize: "11px", color: theme.textMuted }}>30d avg: <strong style={{ color: theme.text }}>{formatAPY(pool.apyMean30d)}</strong></span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: theme.textMuted }}>
          <TrendingUpIcon size={32} style={{ marginBottom: "12px", opacity: 0.3 }} />
          <div style={{ fontSize: "14px" }}>No pools match current filters.</div>
        </div>
      )}

      <div style={{ fontSize: "11px", color: theme.textDim, textAlign: "center", marginTop: "20px" }}>
        Data sourced from DeFiLlama · Rates are indicative and change continuously · Not financial advice
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function LinkIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}
