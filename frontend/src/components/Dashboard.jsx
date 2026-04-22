import { getLevelInfo, shortAddr } from "../utils/contracts";
import {
  ZapIcon, FireIcon, CalendarIcon, CheckCircleIcon,
  MapIcon, SwordIcon, TrophyIcon, SearchIcon,
  ArrowRightIcon, WalletIcon,
} from "./Icons";

export default function Dashboard({ quests, wallet, setActiveTab, theme, isDark }) {
  if (!theme) theme = { text: "#f1f5f9", textMuted: "#64748b", textDim: "#334155", bgCard: "rgba(255,255,255,0.025)", border: "rgba(255,255,255,0.06)" };
  const { address, isConnected } = wallet;
  const { userProfile, dailyTasks, completedCount, totalDaily, loading } = quests;

  const levelInfo = userProfile ? getLevelInfo(userProfile.totalXP) : null;

  // ── Not connected landing ─────────────────────────────────────────────
  if (!isConnected) return (
    <div style={{ padding: "64px 0 40px", maxWidth: "520px", margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{
          width: "72px", height: "72px",
          background: "linear-gradient(135deg, rgba(0,82,255,0.2), rgba(124,58,237,0.2))",
          border: "1px solid rgba(0,82,255,0.3)",
          borderRadius: "20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <ZapIcon size={32} style={{ color: "#0052ff" }} />
        </div>
        <h1 style={{
          color: theme.text, fontSize: "28px", fontWeight: "700",
          margin: "0 0 12px", letterSpacing: "-0.5px", lineHeight: "1.2",
        }}>
          Farm Base. Earn XP.<br />Dominate the Chain.
        </h1>
        <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "360px", margin: "0 auto", lineHeight: "1.6" }}>
          Complete on-chain quests, defeat raid bosses, and climb the leaderboard on Base Mainnet.
        </p>
      </div>

      {/* Features */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "10px",
        marginBottom: "40px",
      }}>
        {[
          { Icon: MapIcon,     label: "Daily Quests",    desc: "Earn XP every day",          color: "#0052ff", bg: "rgba(0,82,255,0.08)",    border: "rgba(0,82,255,0.15)"   },
          { Icon: SwordIcon,   label: "Boss Raids",      desc: "Fight for prize pools",       color: "#ff3b3b", bg: "rgba(255,59,59,0.06)",   border: "rgba(255,59,59,0.15)"  },
          { Icon: TrophyIcon,  label: "Leaderboard",     desc: "Compete for the top spot",    color: "#f0b429", bg: "rgba(240,180,41,0.08)",  border: "rgba(240,180,41,0.15)" },
          { Icon: SearchIcon,  label: "Wallet Analyzer", desc: "Check your Base score",       color: "#a855f7", bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.15)" },
        ].map(f => (
          <div key={f.label} style={{
            background: f.bg,
            border: `1px solid ${f.border}`,
            borderRadius: "14px", padding: "16px",
          }}>
            <f.Icon size={20} style={{ color: f.color, marginBottom: "8px" }} />
            <div style={{ color: theme.text, fontSize: "13px", fontWeight: "600", marginBottom: "3px" }}>{f.label}</div>
            <div style={{ color: theme.textMuted, fontSize: "11px" }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center" }}>
        <p style={{ color: theme.textMuted, fontSize: "13px", marginBottom: "8px" }}>
          Connect your wallet to get started
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00c853" }} />
          <span style={{ color: theme.textMuted, fontSize: "12px" }}>On Base Mainnet</span>
        </div>
      </div>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading && !userProfile) return (
    <div style={{ padding: "80px 20px", textAlign: "center" }}>
      <div className="spinner" style={{ color: "#0052ff", margin: "0 auto 16px" }} />
      <div style={{ color: theme.textMuted, fontSize: "14px" }}>Loading your profile...</div>
    </div>
  );

  // ── Connected dashboard ───────────────────────────────────────────────
  const dailyProgress = totalDaily > 0 ? (completedCount / totalDaily) * 100 : 0;

  return (
    <div style={{ padding: "28px 0" }}>

      {/* Welcome row */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{
          color: theme.text, fontSize: "20px", fontWeight: "700",
          margin: "0 0 4px", letterSpacing: "-0.3px",
        }}>
          Welcome back, {userProfile?.usernameSet ? userProfile.username : shortAddr(address)}
        </h2>
        <p style={{ color: theme.textMuted, fontSize: "13px", margin: 0 }}>
          Here's your BaseQuest overview.
        </p>
      </div>

      {/* XP + Level card */}
      {levelInfo && (
        <div style={{
          background: "linear-gradient(135deg, rgba(0,82,255,0.12), rgba(0,82,255,0.04))",
          border: "1px solid rgba(0,82,255,0.25)",
          borderRadius: "18px", padding: "22px",
          marginBottom: "14px",
        }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "18px", flexWrap: "wrap", gap: "12px",
          }}>
            <div>
              <div style={{
                color: theme.textMuted, fontSize: "10px", fontWeight: "600",
                letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px",
              }}>
                Current Level
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: `${levelInfo.current.color}20`,
                  border: `1px solid ${levelInfo.current.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <ZapIcon size={18} style={{ color: levelInfo.current.color }} />
                </div>
                <div>
                  <div style={{ color: levelInfo.current.color, fontWeight: "700", fontSize: "18px", letterSpacing: "-0.3px" }}>
                    Level {levelInfo.current.level} — {levelInfo.current.name}
                  </div>
                  {levelInfo.next && (
                    <div style={{ color: theme.textMuted, fontSize: "12px" }}>
                      Next: {levelInfo.next.name} at {levelInfo.next.minXP.toLocaleString()} XP
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#f0b429", fontWeight: "800", fontSize: "28px", letterSpacing: "-0.5px" }}>
                {levelInfo.xp.toLocaleString()}
              </div>
              <div style={{ color: theme.textMuted, fontSize: "12px" }}>Total XP</div>
            </div>
          </div>

          {/* XP progress bar */}
          {levelInfo.next && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: theme.textMuted, fontSize: "11px" }}>{levelInfo.xp.toLocaleString()} XP</span>
                <span style={{ color: theme.textMuted, fontSize: "11px" }}>{levelInfo.next.minXP.toLocaleString()} XP</span>
              </div>
              <div style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", borderRadius: "6px", height: "8px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${levelInfo.progress}%`,
                  background: `linear-gradient(90deg, ${levelInfo.current.color}, ${levelInfo.current.color}99)`,
                  borderRadius: "6px", transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "6px", textAlign: "center" }}>
                {levelInfo.progress.toFixed(1)}% to {levelInfo.next.name}
              </div>
            </>
          )}
          {!levelInfo.next && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              color: "#f0b429", fontWeight: "600", fontSize: "13px", marginTop: "8px",
            }}>
              <TrophyIcon size={14} /> Max Level Reached!
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "10px",
        marginBottom: "14px",
      }}>
        {[
          { label: "Tasks Done",     value: userProfile?.tasksCompleted?.toLocaleString() || "0", Icon: CheckCircleIcon, color: "#00c853" },
          { label: "Day Streak",     value: userProfile?.streakCount || "0",                       Icon: FireIcon,        color: "#f0b429" },
          { label: "Daily Progress", value: `${completedCount}/${totalDaily}`,                     Icon: MapIcon,         color: "#0052ff" },
          { label: "Member Since",   value: userProfile?.joinedAt
              ? new Date(userProfile.joinedAt * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "—",                                                                                Icon: CalendarIcon,    color: "#a855f7" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: theme.bgCard,
            border: `1px solid ${theme.border}`,
            borderRadius: "14px", padding: "16px",
            textAlign: "center",
          }}>
            <stat.Icon size={18} style={{ color: stat.color, margin: "0 auto 8px" }} />
            <div style={{ color: stat.color, fontWeight: "700", fontSize: "18px", letterSpacing: "-0.3px" }}>{stat.value}</div>
            <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Daily progress banner */}
      <div style={{
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: "14px", padding: "16px 20px",
        marginBottom: "14px",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MapIcon size={15} style={{ color: "#0052ff" }} />
            <span style={{ color: theme.text, fontSize: "13px", fontWeight: "600" }}>
              Daily Quests
            </span>
          </div>
          <span style={{ color: theme.textMuted, fontSize: "12px" }}>
            {completedCount} of {totalDaily} done
          </span>
        </div>
        <div style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", borderRadius: "6px", height: "6px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${dailyProgress}%`,
            background: "linear-gradient(90deg, #0052ff, #00d4ff)",
            borderRadius: "6px", transition: "width 0.6s ease",
          }} />
        </div>
        <button
          onClick={() => setActiveTab("quests")}
          style={{
            width: "100%", marginTop: "12px",
            background: "none", border: "none",
            color: "#0052ff", fontSize: "13px", fontWeight: "600",
            cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
          }}
        >
          Go to Quest Board <ArrowRightIcon size={13} />
        </button>
      </div>

      {/* Boss raid CTA */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,59,59,0.08), rgba(255,59,59,0.03))",
        border: "1px solid rgba(255,59,59,0.2)",
        borderRadius: "14px", padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
        cursor: "pointer",
      }}
        onClick={() => setActiveTab("bossraid")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <SwordIcon size={20} style={{ color: "#ff3b3b" }} />
          <div>
            <div style={{ color: theme.text, fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>
              Boss Raid is Live
            </div>
            <div style={{ color: theme.textMuted, fontSize: "12px" }}>Attack and win from the prize pool</div>
          </div>
        </div>
        <div style={{
          background: "rgba(255,59,59,0.15)", border: "1px solid rgba(255,59,59,0.3)",
          borderRadius: "20px", padding: "3px 10px",
          color: "#ff3b3b", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px",
          flexShrink: 0,
        }}>
          LIVE
        </div>
      </div>

    </div>
  );
}
