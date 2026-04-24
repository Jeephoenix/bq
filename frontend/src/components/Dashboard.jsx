import { getLevelInfo, shortAddr } from "../utils/contracts";
import {
  ZapIcon, FireIcon, CalendarIcon, CheckCircleIcon,
  MapIcon, SwordIcon, TrophyIcon, ArrowRightIcon,
} from "./Icons";

function SkeletonRow({ height = 56, radius = 12, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ height, borderRadius: radius, width: "100%", ...style }}
    />
  );
}

export default function Dashboard({ quests, wallet, setActiveTab, theme }) {
  if (!theme) theme = { text: "#f1f5f9", textMuted: "#64748b", textDim: "#334155", bgCard: "#12141a", border: "rgba(255,255,255,0.07)" };
  const { address, isConnected } = wallet;
  const { userProfile, dailyTasks, completedCount, totalDaily, loading } = quests;

  const levelInfo = userProfile ? getLevelInfo(userProfile.totalXP) : null;

  /* ── Not connected ─────────────────────────────────────────────────── */
  if (!isConnected) return (
    <div style={{ padding: "72px 0 40px", maxWidth: "480px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{
          width: "56px", height: "56px",
          background: "#0052ff",
          borderRadius: "16px",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <ZapIcon size={26} style={{ color: "white" }} />
        </div>
        <h1 style={{
          color: "#f1f5f9",
          fontSize: "clamp(24px, 5vw, 32px)",
          fontWeight: "700",
          margin: "0 0 14px",
          letterSpacing: "-0.03em",
          lineHeight: "1.15",
        }}>
          Farm Base.<br />
          Earn XP. Dominate<br />
          <span style={{ color: "#0052ff" }}>the Chain.</span>
        </h1>
        <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "340px", margin: "0 auto", lineHeight: "1.65" }}>
          Complete on-chain quests, defeat raid bosses, and climb the leaderboard on Base Mainnet.
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "32px",
        marginBottom: "48px",
        padding: "20px",
        background: "#12141a",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
      }}>
        {[
          { label: "Active Users",  value: "12K+" },
          { label: "XP Distributed", value: "4.2M" },
          { label: "Quests Done",   value: "89K+" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "20px", letterSpacing: "-0.03em" }}>{s.value}</div>
            <div style={{ color: "#64748b", fontSize: "12px", marginTop: "3px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "10px" }}>
          Connect your wallet above to get started — no gas required
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00c853" }} />
          <span style={{ color: "#64748b", fontSize: "12px" }}>Live on Base Mainnet</span>
        </div>
      </div>
    </div>
  );

  /* ── Loading skeleton ──────────────────────────────────────────────── */
  if (loading && !userProfile) return (
    <div style={{ padding: "28px 0" }}>
      <SkeletonRow height={28} radius={8} style={{ maxWidth: "220px", marginBottom: "6px" }} />
      <SkeletonRow height={16} radius={6} style={{ maxWidth: "140px", marginBottom: "28px" }} />
      <SkeletonRow height={120} radius={14} style={{ marginBottom: "12px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
        <SkeletonRow height={80} radius={12} />
        <SkeletonRow height={80} radius={12} />
        <SkeletonRow height={80} radius={12} />
        <SkeletonRow height={80} radius={12} />
      </div>
      <SkeletonRow height={80} radius={14} style={{ marginBottom: "10px" }} />
      <SkeletonRow height={64} radius={14} />
    </div>
  );

  /* ── Connected dashboard ───────────────────────────────────────────── */
  const dailyProgress = totalDaily > 0 ? (completedCount / totalDaily) * 100 : 0;

  return (
    <div style={{ padding: "28px 0" }}>

      {/* Welcome */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{
          color: "#f1f5f9", fontSize: "20px", fontWeight: "700",
          margin: "0 0 4px", letterSpacing: "-0.03em",
        }}>
          Welcome back, {userProfile?.usernameSet ? userProfile.username : shortAddr(address)}
        </h2>
        <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
          Here's your BaseQuest overview.
        </p>
      </div>

      {/* XP + Level card */}
      {levelInfo && (
        <div style={{
          background: "#12141a",
          border: "1px solid rgba(0,82,255,0.2)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "12px",
        }}>
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "16px", flexWrap: "wrap", gap: "12px",
          }}>
            <div>
              <div style={{
                color: "#64748b", fontSize: "11px", fontWeight: "600",
                letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px",
              }}>
                Current Level
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "9px",
                  background: "rgba(0,82,255,0.12)",
                  border: "1px solid rgba(0,82,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ZapIcon size={16} style={{ color: "#0052ff" }} />
                </div>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "17px", letterSpacing: "-0.02em" }}>
                    Level {levelInfo.current.level} — {levelInfo.current.name}
                  </div>
                  {levelInfo.next && (
                    <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>
                      Next: {levelInfo.next.name} at {levelInfo.next.minXP.toLocaleString()} XP
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                color: "#f1f5f9", fontWeight: "700", fontSize: "26px",
                letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums",
              }}>
                {levelInfo.xp.toLocaleString()}
              </div>
              <div style={{ color: "#64748b", fontSize: "12px" }}>Total XP</div>
            </div>
          </div>

          {levelInfo.next && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#64748b", fontSize: "11px" }}>{levelInfo.xp.toLocaleString()} XP</span>
                <span style={{ color: "#64748b", fontSize: "11px" }}>{levelInfo.next.minXP.toLocaleString()} XP</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${levelInfo.progress}%`,
                  background: "#0052ff",
                  borderRadius: "4px",
                  transition: "width 0.7s ease",
                }} />
              </div>
              <div style={{ color: "#64748b", fontSize: "11px", marginTop: "6px", textAlign: "right" }}>
                {levelInfo.progress.toFixed(1)}% to {levelInfo.next.name}
              </div>
            </>
          )}
          {!levelInfo.next && (
            <div style={{
              display: "flex", alignItems: "center", gap: "7px",
              color: "#e8a920", fontWeight: "600", fontSize: "13px", marginTop: "8px",
            }}>
              <TrophyIcon size={14} /> Max Level Reached
            </div>
          )}
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "8px",
        marginBottom: "12px",
      }}>
        {[
          { label: "Tasks Done",     value: userProfile?.tasksCompleted?.toLocaleString() || "0",   Icon: CheckCircleIcon, color: "#00c853" },
          { label: "Day Streak",     value: `${userProfile?.streakCount || 0}d`,                    Icon: FireIcon,        color: "#e8a920" },
          { label: "Daily Progress", value: `${completedCount}/${totalDaily}`,                      Icon: MapIcon,         color: "#0052ff" },
          { label: "Member Since",   value: userProfile?.joinedAt
              ? new Date(userProfile.joinedAt * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "—",                                                                                 Icon: CalendarIcon,    color: "#8892a4" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "#12141a",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "14px 12px",
            textAlign: "center",
          }}>
            <div style={{
              color: stat.color, fontWeight: "700", fontSize: "17px",
              letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums",
            }}>
              {stat.value}
            </div>
            <div style={{ color: "#64748b", fontSize: "11px", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Daily quests progress */}
      <div style={{
        background: "#12141a",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px", padding: "16px 18px",
        marginBottom: "10px",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MapIcon size={15} style={{ color: "#0052ff" }} />
            <span style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: "600" }}>Daily Quests</span>
          </div>
          <span style={{ color: "#64748b", fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>
            {completedCount} / {totalDaily} done
          </span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "4px", height: "5px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${dailyProgress}%`,
            background: "#0052ff",
            borderRadius: "4px", transition: "width 0.6s ease",
          }} />
        </div>
        <button
          onClick={() => setActiveTab("quests")}
          style={{
            width: "100%", marginTop: "12px",
            background: "none", border: "none",
            color: "#0052ff", fontSize: "13px", fontWeight: "600",
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#1a64ff"}
          onMouseLeave={e => e.currentTarget.style.color = "#0052ff"}
        >
          Go to Quest Board <ArrowRightIcon size={13} />
        </button>
      </div>

      {/* Boss raid CTA */}
      <div
        onClick={() => setActiveTab("bossraid")}
        style={{
          background: "#12141a",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "14px", padding: "16px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,59,59,0.25)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "34px", height: "34px",
            background: "rgba(255,59,59,0.1)",
            border: "1px solid rgba(255,59,59,0.2)",
            borderRadius: "9px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <SwordIcon size={16} style={{ color: "#ff6b6b" }} />
          </div>
          <div>
            <div style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>
              Boss Raid is Live
            </div>
            <div style={{ color: "#64748b", fontSize: "12px" }}>Attack and win from the prize pool</div>
          </div>
        </div>
        <div style={{
          background: "rgba(255,59,59,0.1)",
          border: "1px solid rgba(255,59,59,0.2)",
          borderRadius: "5px", padding: "3px 8px",
          color: "#ff6b6b", fontSize: "10px", fontWeight: "700",
          letterSpacing: "0.06em",
          flexShrink: 0,
        }}>
          LIVE
        </div>
      </div>

    </div>
  );
}
