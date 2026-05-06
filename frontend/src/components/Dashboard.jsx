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
    <div style={{ padding: "64px 0 40px", maxWidth: "520px", margin: "0 auto" }}>

      {/* Hero section */}
      <div style={{ textAlign: "center", marginBottom: "48px", position: "relative" }}>
        <div className="hero-mesh" style={{ position: "absolute", inset: "-40px", pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: "400px", height: "400px",
            background: "radial-gradient(circle, rgba(0,82,255,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
        </div>

        <div style={{ position: "relative" }}>
          <div style={{
            width: "64px", height: "64px",
            background: "linear-gradient(135deg, #0052ff, #1a6aff)",
            borderRadius: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            boxShadow: "0 0 32px rgba(0,82,255,0.5), 0 0 64px rgba(0,82,255,0.2)",
            animation: "float 3s ease-in-out infinite",
          }}>
            <ZapIcon size={28} style={{ color: "white" }} />
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 6vw, 40px)",
            fontWeight: "900",
            margin: "0 0 16px",
            letterSpacing: "-0.04em",
            lineHeight: "1.1",
            color: "#f1f5f9",
          }}>
            Farm Base.{" "}Earn XP.<br />
            <span style={{
              background: "linear-gradient(135deg, #0052ff 0%, #6b9fff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Dominate the Chain.
            </span>
          </h1>

          <p style={{
            color: "#64748b", fontSize: "15px", maxWidth: "360px",
            margin: "0 auto", lineHeight: "1.7",
          }}>
            Complete on-chain quests, defeat raid bosses, and climb the leaderboard on Base Mainnet.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "12px",
        marginBottom: "32px",
      }}>
        {[
          { label: "Active Users",    value: "12K+",   color: "#0052ff" },
          { label: "XP Distributed",  value: "4.2M",   color: "#f0b429" },
          { label: "Quests Done",     value: "89K+",   color: "#00c853" },
        ].map(s => (
          <div key={s.label} style={{
            textAlign: "center",
            background: "#12141a",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "14px",
            padding: "18px 12px",
          }}>
            <div style={{
              fontWeight: "800", fontSize: "22px", letterSpacing: "-0.04em",
              background: `linear-gradient(135deg, ${s.color}, ${s.color}aa)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>{s.value}</div>
            <div style={{ color: "#64748b", fontSize: "11px", marginTop: "4px", fontWeight: "500" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00c853", boxShadow: "0 0 6px rgba(0,200,83,0.6)" }} />
          <span style={{ color: "#64748b", fontSize: "12px", fontWeight: "500" }}>Live on Base Mainnet</span>
        </div>
        <p style={{ color: "#334155", fontSize: "12px" }}>
          Connect your wallet above — no gas required to sign in
        </p>
      </div>
    </div>
  );

  /* ── Loading skeleton ──────────────────────────────────────────────── */
  if (loading && !userProfile) return (
    <div style={{ padding: "28px 0" }}>
      <SkeletonRow height={160} radius={20} style={{ marginBottom: "12px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
        <SkeletonRow height={88} radius={14} />
        <SkeletonRow height={88} radius={14} />
        <SkeletonRow height={88} radius={14} />
        <SkeletonRow height={88} radius={14} />
      </div>
      <SkeletonRow height={80} radius={14} style={{ marginBottom: "10px" }} />
      <SkeletonRow height={72} radius={14} />
    </div>
  );

  /* ── Connected dashboard ───────────────────────────────────────────── */
  const dailyProgress = totalDaily > 0 ? (completedCount / totalDaily) * 100 : 0;
  const streak = userProfile?.streakCount || 0;

  return (
    <div style={{ padding: "28px 0" }}>

      {/* ── Hero XP / Level Card ── */}
      {levelInfo && (
        <div style={{
          position: "relative",
          background: "linear-gradient(135deg, #0d1020 0%, #101420 50%, #0d1020 100%)",
          border: "1px solid rgba(0,82,255,0.3)",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "12px",
          overflow: "hidden",
          boxShadow: "0 0 0 1px rgba(0,82,255,0.06), 0 8px 32px rgba(0,82,255,0.08)",
        }}>
          {/* Background glow */}
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "250px", height: "250px",
            background: "radial-gradient(circle, rgba(0,82,255,0.15) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "-40px", left: "20%",
            width: "180px", height: "180px",
            background: "radial-gradient(circle, rgba(0,82,255,0.07) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />

          <div style={{ position: "relative" }}>
            {/* Top row: greeting + XP */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ color: "#64748b", fontSize: "11px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Welcome back
                </div>
                <div style={{ color: "#f1f5f9", fontWeight: "800", fontSize: "20px", letterSpacing: "-0.03em" }}>
                  {userProfile?.usernameSet ? userProfile.username : shortAddr(address)}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                  <div style={{
                    background: "rgba(0,82,255,0.15)", border: "1px solid rgba(0,82,255,0.3)",
                    borderRadius: "6px", padding: "3px 10px",
                    color: "#6b9fff", fontSize: "12px", fontWeight: "700",
                  }}>
                    Level {levelInfo.current.level} — {levelInfo.current.name}
                  </div>
                  {streak > 0 && (
                    <div style={{
                      background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.25)",
                      borderRadius: "6px", padding: "3px 10px",
                      color: "#f0b429", fontSize: "12px", fontWeight: "700",
                      display: "flex", alignItems: "center", gap: "4px",
                    }}>
                      <FireIcon size={11} /> {streak}d Streak
                    </div>
                  )}
                </div>
              </div>

              {/* XP hero number */}
              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontWeight: "900", fontSize: "36px",
                  letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums",
                  background: "linear-gradient(135deg, #ffffff 0%, #6b9fff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: "1",
                }}>
                  {levelInfo.xp.toLocaleString()}
                </div>
                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "4px", fontWeight: "600", letterSpacing: "0.04em", textTransform: "uppercase" }}>Total XP</div>
              </div>
            </div>

            {/* XP Progress bar */}
            {levelInfo.next && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "#64748b", fontSize: "11px" }}>
                    {levelInfo.progress.toFixed(1)}% to <strong style={{ color: "#c1c9d6" }}>{levelInfo.next.name}</strong>
                  </span>
                  <span style={{ color: "#64748b", fontSize: "11px" }}>
                    {(levelInfo.next.minXP - levelInfo.xp).toLocaleString()} XP to go
                  </span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "6px", height: "8px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${levelInfo.progress}%`,
                    background: "linear-gradient(90deg, #0052ff, #6b9fff)",
                    borderRadius: "6px",
                    transition: "width 0.8s ease",
                    boxShadow: "0 0 12px rgba(0,82,255,0.6)",
                  }} />
                </div>
              </>
            )}
            {!levelInfo.next && (
              <div style={{
                display: "flex", alignItems: "center", gap: "7px",
                color: "#f0b429", fontWeight: "700", fontSize: "13px", marginTop: "8px",
              }}>
                <TrophyIcon size={14} /> Max Level Reached — Legend status
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Stats row ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "8px",
        marginBottom: "12px",
      }}>
        {[
          {
            label: "Tasks Done",
            value: userProfile?.tasksCompleted?.toLocaleString() || "0",
            Icon: CheckCircleIcon, color: "#00c853",
            bg: "rgba(0,200,83,0.07)", border: "rgba(0,200,83,0.15)",
          },
          {
            label: "Day Streak",
            value: `${userProfile?.streakCount || 0}d`,
            Icon: FireIcon, color: "#f0b429",
            bg: "rgba(240,180,41,0.07)", border: "rgba(240,180,41,0.15)",
          },
          {
            label: "Daily Progress",
            value: `${completedCount}/${totalDaily}`,
            Icon: MapIcon, color: "#0052ff",
            bg: "rgba(0,82,255,0.07)", border: "rgba(0,82,255,0.15)",
          },
          {
            label: "Member Since",
            value: userProfile?.joinedAt
              ? new Date(userProfile.joinedAt * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "—",
            Icon: CalendarIcon, color: "#8892a4",
            bg: "rgba(136,146,164,0.06)", border: "rgba(136,146,164,0.12)",
          },
        ].map(stat => (
          <div key={stat.label} style={{
            background: stat.bg,
            border: `1px solid ${stat.border}`,
            borderRadius: "14px",
            padding: "14px 12px",
            textAlign: "center",
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "6px" }}>
              <stat.Icon size={14} style={{ color: stat.color }} />
            </div>
            <div style={{
              color: stat.color, fontWeight: "800", fontSize: "18px",
              letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums",
            }}>
              {stat.value}
            </div>
            <div style={{ color: "#64748b", fontSize: "10px", marginTop: "3px", fontWeight: "500" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Daily quests progress ── */}
      <div style={{
        background: "#12141a",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px", padding: "18px 20px",
        marginBottom: "10px",
        transition: "border-color 0.15s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
        onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "rgba(0,82,255,0.12)", border: "1px solid rgba(0,82,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <MapIcon size={13} style={{ color: "#6b9fff" }} />
            </div>
            <span style={{ color: "#f1f5f9", fontSize: "14px", fontWeight: "700" }}>Daily Quests</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              background: dailyProgress === 100 ? "rgba(0,200,83,0.12)" : "rgba(0,82,255,0.1)",
              border: `1px solid ${dailyProgress === 100 ? "rgba(0,200,83,0.25)" : "rgba(0,82,255,0.2)"}`,
              borderRadius: "6px", padding: "2px 8px",
              color: dailyProgress === 100 ? "#00c853" : "#6b9fff",
              fontSize: "12px", fontWeight: "700", fontVariantNumeric: "tabular-nums",
            }}>
              {completedCount} / {totalDaily}
            </span>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "6px", height: "6px", overflow: "hidden", marginBottom: "14px" }}>
          <div style={{
            height: "100%", width: `${dailyProgress}%`,
            background: dailyProgress === 100
              ? "linear-gradient(90deg, #00c853, #00ff6a)"
              : "linear-gradient(90deg, #0052ff, #6b9fff)",
            borderRadius: "6px", transition: "width 0.7s ease",
            boxShadow: dailyProgress === 100 ? "0 0 10px rgba(0,200,83,0.5)" : "0 0 10px rgba(0,82,255,0.5)",
          }} />
        </div>
        <button
          onClick={() => setActiveTab("quests")}
          style={{
            width: "100%", background: "rgba(0,82,255,0.06)",
            border: "1px solid rgba(0,82,255,0.15)",
            borderRadius: "10px", padding: "10px",
            color: "#6b9fff", fontSize: "13px", fontWeight: "600",
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,82,255,0.12)"; e.currentTarget.style.borderColor = "rgba(0,82,255,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,82,255,0.06)"; e.currentTarget.style.borderColor = "rgba(0,82,255,0.15)"; }}
        >
          View Quest Board <ArrowRightIcon size={13} />
        </button>
      </div>

      {/* ── Boss Raid CTA ── */}
      <div
        onClick={() => setActiveTab("bossraid")}
        style={{
          position: "relative",
          background: "linear-gradient(135deg, rgba(255,59,59,0.08), rgba(180,0,0,0.04))",
          border: "1px solid rgba(255,59,59,0.2)",
          borderRadius: "16px", padding: "18px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          cursor: "pointer",
          overflow: "hidden",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,59,59,0.4)"; e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,59,59,0.12), rgba(180,0,0,0.06))"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,59,59,0.2)"; e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,59,59,0.08), rgba(180,0,0,0.04))"; }}
      >
        <div style={{
          position: "absolute", top: "-30px", right: "-30px",
          width: "120px", height: "120px",
          background: "radial-gradient(circle, rgba(255,59,59,0.12) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: "14px", position: "relative" }}>
          <div style={{
            width: "40px", height: "40px",
            background: "rgba(255,59,59,0.12)",
            border: "1px solid rgba(255,59,59,0.25)",
            borderRadius: "11px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(255,59,59,0.2)",
          }}>
            <SwordIcon size={18} style={{ color: "#ff6b6b" }} />
          </div>
          <div>
            <div style={{ color: "#f1f5f9", fontSize: "14px", fontWeight: "700", marginBottom: "2px" }}>
              Boss Raid is Live
            </div>
            <div style={{ color: "#64748b", fontSize: "12px" }}>Attack and win from the prize pool</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
          <div style={{
            background: "rgba(255,59,59,0.12)",
            border: "1px solid rgba(255,59,59,0.3)",
            borderRadius: "6px", padding: "3px 10px",
            color: "#ff6b6b", fontSize: "10px", fontWeight: "800",
            letterSpacing: "0.08em",
            animation: "live-pulse 2s ease-in-out infinite",
          }}>
            LIVE
          </div>
          <ArrowRightIcon size={14} style={{ color: "#ff6b6b" }} />
        </div>
      </div>

    </div>
  );
}
