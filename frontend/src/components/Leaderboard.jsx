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
  2: "#b4b4b4",
  3: "#cd7f32",
};

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
            <h2 style={{ color: theme.text, fontSize: "20px", fontWeight: "700", margin: 0, letterSpacing: "-0.3px" }}>
              Leaderboard
            </h2>
          </div>
          <p style={{ color: theme.textMuted, fontSize: "14px", margin: 0 }}>
            Top {entries.length} of {totalUsers} users
            {lastUpdated && (
              <span style={{ marginLeft: "8px" }}>· Updated {lastUpdated.toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            background:   isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            border:       `1px solid ${theme.border}`,
            borderRadius: "10px",
            padding:      "8px 16px",
            color:        loading ? theme.textMuted : theme.text,
            fontWeight:   "500",
            fontSize:     "13px",
            cursor:       loading ? "not-allowed" : "pointer",
            display:      "flex",
            alignItems:   "center",
            gap:          "6px",
            fontFamily:   "inherit",
          }}
        >
          <RefreshIcon size={13} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Your rank */}
      {myRank && (
        <div style={{
          background:   "rgba(0,82,255,0.08)",
          border:       "1px solid rgba(0,82,255,0.3)",
          borderRadius: "16px",
          padding:      "16px 20px",
          marginBottom: "16px",
          display:      "flex",
          alignItems:   "center",
          gap:          "16px",
        }}>
          <span style={{ color: "#00d4ff", fontWeight: "900", fontSize: "28px" }}>#{myRank}</span>
          <div>
            <div style={{ color: theme.text, fontWeight: "700", fontSize: "14px" }}>Your Rank</div>
            <div style={{ color: theme.textMuted, fontSize: "12px" }}>Keep farming to climb!</div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background:   theme.bgCard,
          border:       `1px solid ${theme.border}`,
          borderRadius: "16px",
          padding:      "24px",
          textAlign:    "center",
          color:        theme.textMuted,
          fontSize:     "14px",
          marginBottom: "16px",
        }}>
          Unable to load leaderboard, please tap Refresh to try again.
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              height:       "68px",
              background:   theme.bgCard,
              borderRadius: "16px",
              border:       `1px solid ${theme.border}`,
            }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && entries.length === 0 && (
        <div style={{
          background:   theme.bgCard,
          border:       `1px solid ${theme.border}`,
          borderRadius: "20px",
          padding:      "48px 24px",
          textAlign:    "center",
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
            const podiumBorder =
              e.rank === 1 ? "rgba(240,180,41,0.3)"  :
              e.rank === 2 ? "rgba(180,180,180,0.3)"  :
              e.rank === 3 ? "rgba(205,127,50,0.3)"   :
              e.isCurrentUser ? "rgba(0,82,255,0.3)"  :
              theme.border;
            const podiumBg =
              e.rank === 1 ? "rgba(240,180,41,0.06)"  :
              e.rank === 2 ? "rgba(180,180,180,0.04)" :
              e.rank === 3 ? "rgba(205,127,50,0.04)"  :
              e.isCurrentUser ? "rgba(0,82,255,0.05)" :
              theme.bgCard;

            return (
              <div key={e.address} style={{
                background:   podiumBg,
                border:       `1px solid ${podiumBorder}`,
                borderRadius: "16px",
                padding:      "14px 18px",
                display:      "flex",
                alignItems:   "center",
                gap:          "14px",
              }}>

                {/* Rank */}
                <div style={{ width: "36px", textAlign: "center", flexShrink: 0 }}>
                  {rankColor
                    ? <MedalIcon size={22} style={{ color: rankColor }} />
                    : <span style={{ color: theme.textMuted, fontWeight: "700", fontSize: "14px" }}>#{e.rank}</span>
                  }
                </div>

                {/* Level icon */}
                <span style={{ display: "flex", flexShrink: 0 }}>
                  {(() => { const LvlIcon = LEVEL_ICONS[e.level.level] || ZapIcon; return <LvlIcon size={22} style={{ color: e.level.color }} />; })()}
                </span>

                {/* Name + stats */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: theme.text, fontWeight: "700", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.display}
                    </span>
                    {e.isCurrentUser && (
                      <span style={{
                        background:   "rgba(0,82,255,0.2)",
                        border:       "1px solid rgba(0,82,255,0.4)",
                        borderRadius: "20px",
                        padding:      "1px 7px",
                        color:        "#00d4ff",
                        fontSize:     "10px",
                        fontWeight:   "700",
                        flexShrink:   0,
                      }}>you</span>
                    )}
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: "12px", marginTop: "2px" }}>
                    {e.level.name} · {e.tasksCompleted} tasks
                    {e.streakCount > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}> · <FireIcon size={11} style={{ color: "#f0b429" }} />{e.streakCount}d</span>}
                  </div>
                </div>

                {/* XP */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ color: "#00d4ff", fontWeight: "800", fontSize: "16px" }}>
                    {formatNumber(e.xp)}
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: "11px" }}>XP</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
                                    }
