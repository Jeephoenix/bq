import { useLeaderboard } from "../hooks/useLeaderboard";
import { formatNumber } from "../utils/contracts";
import { TrophyIcon, RefreshIcon, ZapIcon, FireIcon, StarIcon, SeedlingIcon, HammerIcon, MedalIcon } from "./Icons";

const LEVEL_ICONS = {
  1: SeedlingIcon,
  2: SeedlingIcon,
  3: HammerIcon,
  4: ZapIcon,
  5: FireIcon,
  6: StarIcon,
};

const RANK_COLORS = {
  1: "#f0b429",
  2: "#c0c0c0",
  3: "#cd7f32",
};

const RANK_GLOW = {
  1: "rgba(240,180,41,0.25)",
  2: "rgba(192,192,192,0.15)",
  3: "rgba(205,127,50,0.15)",
};

const CROWN_SVG = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M2 14h14M3 10l2-5 4 3 4-3 2 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="3" cy="10" r="1.2" fill={color}/>
    <circle cx="9" cy="8" r="1.2" fill={color}/>
    <circle cx="15" cy="10" r="1.2" fill={color}/>
  </svg>
);

export default function Leaderboard({ wallet, theme, isDark }) {
  if (!theme) theme = { text: "#f1f5f9", textMuted: "#64748b", textDim: "#334155", bgCard: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)" };
  const { address } = wallet;
  const { entries, loading, error, totalUsers, myRank, lastUpdated, refresh } = useLeaderboard(address);

  return (
    <div style={{ padding: "24px 0", maxWidth: "700px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <TrophyIcon size={18} style={{ color: "#f0b429" }} />
            <h2 style={{ color: theme.text, fontSize: "22px", fontWeight: "800", margin: 0, letterSpacing: "-0.04em" }}>
              Leaderboard
            </h2>
          </div>
          <p style={{ color: theme.textMuted, fontSize: "13px", margin: 0 }}>
            {totalUsers ? `${totalUsers.toLocaleString()} farmers competing` : `Top ${entries.length} farmers`}
            {lastUpdated && (
              <span style={{ marginLeft: "8px", fontSize: "12px" }}>· Updated {lastUpdated.toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${theme.border}`,
            borderRadius: "10px",
            padding: "8px 16px",
            color: loading ? theme.textMuted : theme.text,
            fontWeight: "600",
            fontSize: "12px",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
        >
          <RefreshIcon size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Your rank */}
      {myRank && (
        <div style={{
          background: "linear-gradient(135deg, rgba(0,82,255,0.1), rgba(0,82,255,0.04))",
          border: "1px solid rgba(0,82,255,0.3)",
          borderRadius: "16px",
          padding: "16px 20px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          boxShadow: "0 0 20px rgba(0,82,255,0.08)",
        }}>
          <div style={{
            fontWeight: "900", fontSize: "32px", letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums",
            background: "linear-gradient(135deg, #ffffff 0%, #6b9fff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: "1",
          }}>
            #{myRank}
          </div>
          <div>
            <div style={{ color: theme.text, fontWeight: "700", fontSize: "14px" }}>Your Global Rank</div>
            <div style={{ color: theme.textMuted, fontSize: "12px", marginTop: "2px" }}>Keep farming to climb the board!</div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: "16px",
          padding: "24px",
          textAlign: "center",
          color: theme.textMuted,
          fontSize: "14px",
          marginBottom: "16px",
        }}>
          Unable to load leaderboard — tap Refresh to try again.
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{
              height: i < 3 ? "88px" : "68px",
              borderRadius: "16px",
            }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && entries.length === 0 && (
        <div style={{
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: "20px",
          padding: "48px 24px",
          textAlign: "center",
        }}>
          <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
            <SeedlingIcon size={48} style={{ color: "#00c853" }} />
          </div>
          <div style={{ color: theme.text, fontWeight: "800", fontSize: "18px", marginBottom: "6px" }}>Be the First!</div>
          <div style={{ color: theme.textMuted, fontSize: "14px" }}>No farmers yet. Complete quests to claim rank #1.</div>
        </div>
      )}

      {/* Entries */}
      {!loading && entries.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {entries.map(e => {
            const rankColor = RANK_COLORS[e.rank] || null;
            const rankGlow  = RANK_GLOW[e.rank]  || null;
            const isTop3    = e.rank <= 3;

            const podiumBorder =
              e.rank === 1 ? "rgba(240,180,41,0.4)"  :
              e.rank === 2 ? "rgba(192,192,192,0.3)"  :
              e.rank === 3 ? "rgba(205,127,50,0.3)"   :
              e.isCurrentUser ? "rgba(0,82,255,0.35)" :
              theme.border;

            const podiumBg =
              e.rank === 1 ? "linear-gradient(135deg, rgba(240,180,41,0.1), rgba(240,180,41,0.04))"  :
              e.rank === 2 ? "linear-gradient(135deg, rgba(192,192,192,0.07), rgba(192,192,192,0.02))" :
              e.rank === 3 ? "linear-gradient(135deg, rgba(205,127,50,0.07), rgba(205,127,50,0.02))"  :
              e.isCurrentUser ? "rgba(0,82,255,0.06)" :
              theme.bgCard;

            return (
              <div key={e.address} style={{
                background:   podiumBg,
                border:       `1px solid ${podiumBorder}`,
                borderRadius: isTop3 ? "18px" : "14px",
                padding:      isTop3 ? "16px 20px" : "12px 18px",
                display:      "flex",
                alignItems:   "center",
                gap:          "14px",
                boxShadow:    rankGlow ? `0 0 20px ${rankGlow}` : "none",
                transition:   "transform 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e2 => { e2.currentTarget.style.transform = "translateY(-1px)"; e2.currentTarget.style.boxShadow = rankGlow ? `0 4px 24px ${rankGlow}` : "0 4px 16px rgba(0,0,0,0.3)"; }}
                onMouseLeave={e2 => { e2.currentTarget.style.transform = "none"; e2.currentTarget.style.boxShadow = rankGlow ? `0 0 20px ${rankGlow}` : "none"; }}
              >
                {/* Rank */}
                <div style={{ width: "40px", textAlign: "center", flexShrink: 0 }}>
                  {rankColor ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                      <CROWN_SVG color={rankColor} />
                      <span style={{ color: rankColor, fontWeight: "800", fontSize: "14px", letterSpacing: "-0.02em" }}>#{e.rank}</span>
                    </div>
                  ) : (
                    <span style={{ color: theme.textMuted, fontWeight: "700", fontSize: "14px" }}>#{e.rank}</span>
                  )}
                </div>

                {/* Level icon */}
                <span style={{ display: "flex", flexShrink: 0 }}>
                  {(() => { const LvlIcon = LEVEL_ICONS[e.level.level] || ZapIcon; return <LvlIcon size={isTop3 ? 24 : 20} style={{ color: e.level.color }} />; })()}
                </span>

                {/* Name + stats */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{
                      color: isTop3 ? "#f1f5f9" : theme.text,
                      fontWeight: isTop3 ? "800" : "700",
                      fontSize: isTop3 ? "15px" : "14px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {e.display}
                    </span>
                    {e.isCurrentUser && (
                      <span style={{
                        background: "rgba(0,82,255,0.2)",
                        border: "1px solid rgba(0,82,255,0.4)",
                        borderRadius: "20px",
                        padding: "1px 7px",
                        color: "#6b9fff",
                        fontSize: "10px",
                        fontWeight: "700",
                        flexShrink: 0,
                      }}>you</span>
                    )}
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: "12px", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ color: e.level.color, fontWeight: "600" }}>{e.level.name}</span>
                    <span>·</span>
                    <span>{e.tasksCompleted} tasks</span>
                    {e.streakCount > 0 && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: "#f0b429", fontWeight: "600" }}>
                        <FireIcon size={11} style={{ color: "#f0b429" }} />{e.streakCount}d
                      </span>
                    )}
                  </div>
                </div>

                {/* XP */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{
                    fontWeight: "800", fontSize: isTop3 ? "18px" : "15px",
                    fontVariantNumeric: "tabular-nums",
                    background: isTop3 && e.rank === 1
                      ? "linear-gradient(135deg, #f0b429, #ffd97a)"
                      : "linear-gradient(135deg, #ffffff, #c1c9d6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}>
                    {formatNumber(e.xp)}
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: "11px", fontWeight: "600", letterSpacing: "0.04em" }}>XP</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
