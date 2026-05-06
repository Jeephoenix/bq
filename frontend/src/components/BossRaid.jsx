import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getBossRaidContract, shortAddr, timeAgo, formatEth } from "../utils/contracts";
import { SwordIcon, ZapIcon, TrophyIcon, UsersIcon, AlertIcon, SkullIcon, TargetIcon, CheckCircleIcon } from "./Icons";

export default function BossRaid({ wallet, theme, isDark }) {
  if (!theme) theme = { text: "#f1f5f9", textMuted: "#64748b", textDim: "#334155", bgCard: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)" };
  const { address, signer, isConnected } = wallet;

  const [boss,          setBoss]          = useState(null);
  const [playerStats,   setPlayerStats]   = useState(null);
  const [recentAttacks, setRecentAttacks] = useState([]);
  const [attacking,     setAttacking]     = useState(false);
  const [lastDamage,    setLastDamage]    = useState(null);
  const [ethPrice,      setEthPrice]      = useState(2500);
  const [loading,       setLoading]       = useState(true);
  const [shake,         setShake]         = useState(false);
  const [flash,         setFlash]         = useState("");

  const loadBossData = useCallback(async () => {
    if (!signer) return;
    try {
      const contract = getBossRaidContract(signer);
      const [status, attacks] = await Promise.all([
        contract.getBossStatus(),
        contract.getRecentAttacks(10),
      ]);

      setBoss({
        raidNumber:  Number(status.raidNumber),
        maxHP:       Number(status.maxHP),
        currentHP:   Number(status.currentHP),
        hpPercent:   Number(status.hpPercent),
        defeated:    status.defeated,
        winner:      status.winner,
        prizePool:   status.prizePool,
        startedAt:   Number(status.startedAt),
        attackCount: Number(status.attackCount),
        playerCount: Number(status.playerCount),
      });

      const atks = [];
      for (let i = 0; i < attacks.attackers.length; i++) {
        atks.push({
          attacker:    attacks.attackers[i],
          damage:      Number(attacks.damages[i]),
          hpAfter:     Number(attacks.hpAfters[i]),
          killingBlow: attacks.killingBlows[i],
          timestamp:   Number(attacks.timestamps[i]),
        });
      }
      setRecentAttacks(atks.reverse());

      if (address) {
        const stats = await contract.getPlayerStats(address);
        setPlayerStats({
          damageThisRaid:      Number(stats.damageThisRaid),
          totalDamage:         Number(stats.totalDamage),
          raidsJoined:         Number(stats.raidsJoined),
          raidsWon:            Number(stats.raidsWon),
          hasAttackedThisRaid: stats.hasAttackedThisRaid,
        });
      }
    } catch (err) {
      console.warn("loadBossData error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [signer, address]);

  useEffect(() => {
    if (signer) loadBossData();
    const iv = setInterval(() => { if (signer) loadBossData(); }, 5000);
    return () => clearInterval(iv);
  }, [signer, loadBossData]);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      .then(r => r.json()).then(d => setEthPrice(d.ethereum?.usd || 2500)).catch(() => {});
  }, []);

  const handleAttack = async () => {
    if (!isConnected || !signer) return;
    setAttacking(true);
    setLastDamage(null);
    setFlash("");
    try {
      const contract = getBossRaidContract(signer);
      const tx       = await contract.attack({ value: ethers.parseEther("0.00005") });

      contract.once("AttackLanded", (attacker, damage, hpRemaining, killingBlow) => {
        if (attacker.toLowerCase() === address.toLowerCase()) {
          const dmg = Number(damage);
          setLastDamage({ damage: dmg, killingBlow });
          setShake(true);
          setFlash(killingBlow ? "kill" : dmg >= 80 ? "crit" : "hit");
          setTimeout(() => setShake(false), 600);
          setTimeout(() => setFlash(""), 1800);
        }
      });

      await tx.wait();
      await loadBossData();
    } catch (err) {
      const msg = err?.reason || err?.message || "";
      if (msg.includes("user rejected") || msg.includes("User denied")) {
        console.log("Cancelled");
      } else {
        alert(msg.slice(0, 100));
      }
    } finally {
      setAttacking(false);
    }
  };

  const hpColor = (pct) => {
    if (pct > 60) return "#00c853";
    if (pct > 30) return "#f0b429";
    return "#ff3b3b";
  };

  const hpGradient = (pct) => {
    if (pct > 60) return "linear-gradient(90deg, #00c853, #00ff72)";
    if (pct > 30) return "linear-gradient(90deg, #f0b429, #ffd97a)";
    return "linear-gradient(90deg, #cc0000, #ff3b3b)";
  };

  const BossVisual = ({ pct, shake, flash }) => (
    <div style={{
      width: "120px", height: "120px",
      margin: "0 auto 20px",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${hpColor(pct)}22 0%, transparent 70%)`,
        animation: "glow-pulse 2s ease-in-out infinite",
      }} />
      <div style={{
        width: "90px", height: "90px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${hpColor(pct)}18 0%, transparent 70%)`,
        border: `2px solid ${hpColor(pct)}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: shake ? "shake 0.5s ease" : "none",
        filter: flash === "kill" ? `drop-shadow(0 0 24px #f0b429)`
              : flash === "crit" ? `drop-shadow(0 0 20px #ff3b3b)`
              : flash === "hit"  ? `drop-shadow(0 0 14px #0052ff)`
              : "none",
        transition: "filter 0.2s",
      }}>
        {pct > 33
          ? <TargetIcon size={52} style={{ color: hpColor(pct) }} />
          : <SkullIcon  size={52} style={{ color: "#ff3b3b" }} />
        }
      </div>
    </div>
  );

  const prizeUsd = boss ? (parseFloat(ethers.formatEther(boss.prizePool)) * ethPrice).toFixed(2) : "0.00";

  if (!isConnected) return (
    <div style={{ padding: "80px 20px", textAlign: "center", maxWidth: "400px", margin: "0 auto" }}>
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%",
        background: "rgba(255,59,59,0.1)", border: "2px solid rgba(255,59,59,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
        boxShadow: "0 0 32px rgba(255,59,59,0.2)",
      }}>
        <SwordIcon size={36} style={{ color: "#ff6b6b" }} />
      </div>
      <div style={{ color: theme.text, fontSize: "20px", fontWeight: "800", marginBottom: "8px", letterSpacing: "-0.03em" }}>Boss Raid</div>
      <div style={{ color: theme.textMuted, fontSize: "14px" }}>Connect your wallet to join the raid!</div>
    </div>
  );

  if (loading) return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <div className="skeleton" style={{ height: "340px", borderRadius: "24px", marginBottom: "16px" }} />
      <div className="skeleton" style={{ height: "140px", borderRadius: "16px", marginBottom: "12px" }} />
      <div className="skeleton" style={{ height: "220px", borderRadius: "16px" }} />
    </div>
  );

  return (
    <div style={{ padding: "24px 0", maxWidth: "800px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <SwordIcon size={20} style={{ color: "#ff3b3b" }} />
          <h2 style={{ color: theme.text, fontSize: "22px", fontWeight: "800", margin: 0, letterSpacing: "-0.04em" }}>
            Boss Raid
          </h2>
          <div style={{
            background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.25)",
            borderRadius: "6px", padding: "2px 8px",
            color: "#ff6b6b", fontSize: "10px", fontWeight: "800", letterSpacing: "0.08em",
            animation: "live-pulse 2s ease-in-out infinite",
          }}>LIVE</div>
        </div>
        <p style={{ color: theme.textMuted, fontSize: "13px", margin: 0 }}>
          Attack the boss, deal damage, land the killing blow and win the prize pool!
        </p>
      </div>

      {/* Boss card */}
      <div style={{
        position:     "relative",
        background:   "linear-gradient(160deg, #180a0a 0%, #1a0808 40%, #120a0a 100%)",
        border:       "1px solid rgba(255,59,59,0.3)",
        borderRadius: "24px",
        padding:      "32px 28px",
        marginBottom: "16px",
        textAlign:    "center",
        overflow:     "hidden",
        boxShadow:    "0 0 0 1px rgba(255,59,59,0.08), 0 8px 40px rgba(255,59,59,0.08)",
      }} className="boss-card-padding">

        {/* Background grid pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,59,59,1) 40px, rgba(255,59,59,1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,59,59,1) 40px, rgba(255,59,59,1) 41px)",
        }} />

        {/* Center glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "320px", height: "320px",
          background: "radial-gradient(circle, rgba(255,59,59,0.1) 0%, transparent 65%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          {/* Raid label */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.2)",
            borderRadius: "20px", padding: "4px 14px",
            color: "#ff6b6b", fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em",
            marginBottom: "20px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff3b3b", boxShadow: "0 0 6px rgba(255,59,59,0.8)" }} />
            RAID #{boss?.raidNumber} — {boss?.playerCount} RAIDERS
          </div>

          {/* Boss visual */}
          <BossVisual pct={boss?.hpPercent || 0} shake={shake} flash={flash} />

          {/* Last damage popup */}
          {lastDamage && (
            <div style={{
              position:   "absolute",
              top:        "16px",
              right:      "16px",
              background: lastDamage.killingBlow ? "rgba(240,180,41,0.15)" : "rgba(255,59,59,0.12)",
              border:     `1px solid ${lastDamage.killingBlow ? "rgba(240,180,41,0.5)" : "rgba(255,59,59,0.4)"}`,
              borderRadius: "14px",
              padding:    "10px 16px",
              color:      lastDamage.killingBlow ? "#f0b429" : "#ff6b6b",
              fontWeight: "900",
              fontSize:   "20px",
              boxShadow:  lastDamage.killingBlow ? "0 0 20px rgba(240,180,41,0.4)" : "0 0 16px rgba(255,59,59,0.4)",
              animation:  "slideUp 0.2s ease-out",
            }}>
              {lastDamage.killingBlow ? "⚔️ KILLING BLOW!" : `-${lastDamage.damage} HP`}
            </div>
          )}

          {/* HP display */}
          <div style={{
            fontWeight: "900", fontSize: "32px", marginBottom: "12px",
            letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums",
            color: hpColor(boss?.hpPercent || 0),
            textShadow: `0 0 20px ${hpColor(boss?.hpPercent || 0)}66`,
          }}>
            {boss?.currentHP?.toLocaleString()} <span style={{ fontSize: "18px", opacity: 0.5 }}>/ {boss?.maxHP?.toLocaleString()}</span> HP
          </div>

          {/* HP bar */}
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "12px", height: "18px", margin: "0 0 24px", overflow: "hidden", position: "relative" }}>
            <div style={{
              height:       "100%",
              width:        `${boss?.hpPercent || 0}%`,
              background:   hpGradient(boss?.hpPercent || 0),
              borderRadius: "12px",
              transition:   "width 0.6s ease, background 0.6s ease",
              boxShadow:    `0 0 16px ${hpColor(boss?.hpPercent || 0)}88`,
            }}/>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "12px",
              background: "linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.06) 100%)",
            }}/>
          </div>

          {/* Stats row */}
          <div className="boss-stats-row" style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "24px", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                fontWeight: "900", fontSize: "22px", letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #f0b429, #ffd97a)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                {parseFloat(ethers.formatEther(boss?.prizePool || 0)).toFixed(5)} ETH
              </div>
              <div style={{ color: theme.textMuted, fontSize: "12px", fontWeight: "500" }}>Prize Pool (~${prizeUsd})</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#6b9fff", fontWeight: "800", fontSize: "22px", fontVariantNumeric: "tabular-nums" }}>{boss?.attackCount}</div>
              <div style={{ color: theme.textMuted, fontSize: "12px", fontWeight: "500" }}>Total Attacks</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#00c853", fontWeight: "800", fontSize: "22px", fontVariantNumeric: "tabular-nums" }}>{boss?.playerCount}</div>
              <div style={{ color: theme.textMuted, fontSize: "12px", fontWeight: "500" }}>Raiders</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#f1f5f9", fontWeight: "800", fontSize: "22px", fontVariantNumeric: "tabular-nums" }}>
                {boss?.hpPercent}%
              </div>
              <div style={{ color: theme.textMuted, fontSize: "12px", fontWeight: "500" }}>HP Remaining</div>
            </div>
          </div>

          {/* Attack button */}
          <button
            onClick={handleAttack}
            disabled={attacking || !isConnected || boss?.defeated}
            className="boss-attack-btn"
            style={{
              background:   attacking ? "rgba(255,59,59,0.25)"
                          : boss?.defeated ? "rgba(80,80,80,0.2)"
                          : "linear-gradient(135deg, #cc0000, #ff3b3b, #ff6b6b)",
              border:       attacking || boss?.defeated ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,100,100,0.3)",
              borderRadius: "16px",
              padding:      "16px 52px",
              color:        "white",
              fontWeight:   "900",
              fontSize:     "18px",
              cursor:       attacking || boss?.defeated ? "not-allowed" : "pointer",
              opacity:      boss?.defeated ? 0.5 : 1,
              boxShadow:    attacking || boss?.defeated ? "none" : "0 0 32px rgba(255,59,59,0.5), 0 4px 16px rgba(255,59,59,0.3)",
              transition:   "all 0.2s",
              letterSpacing: "0.5px",
              fontFamily:   "inherit",
              display:      "inline-flex", alignItems: "center", gap: "8px",
            }}
            onMouseEnter={e => { if (!attacking && !boss?.defeated) { e.currentTarget.style.boxShadow = "0 0 48px rgba(255,59,59,0.7), 0 4px 20px rgba(255,59,59,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = attacking || boss?.defeated ? "none" : "0 0 32px rgba(255,59,59,0.5), 0 4px 16px rgba(255,59,59,0.3)"; e.currentTarget.style.transform = "none"; }}
          >
            {attacking
              ? <><div className="spinner spinner-sm" />Attacking...</>
              : boss?.defeated
              ? <><SkullIcon size={18} />Boss Defeated</>
              : <><SwordIcon size={18} />ATTACK! (0.00005 ETH)</>
            }
          </button>

          {!boss?.defeated && (
            <div style={{ color: theme.textMuted, fontSize: "12px", marginTop: "14px" }}>
              Each attack deals <strong style={{ color: theme.text }}>10–100 random damage</strong> •
              Killing blow wins <strong style={{ color: "#f0b429" }}>80% of the prize pool</strong>
            </div>
          )}

          {boss?.defeated && boss?.winner && (
            <div style={{
              marginTop:    "16px",
              background:   "rgba(240,180,41,0.08)",
              border:       "1px solid rgba(240,180,41,0.3)",
              borderRadius: "14px",
              padding:      "14px 20px",
              color:        "#f0b429",
              fontWeight:   "700",
              fontSize:     "14px",
              display:      "flex", alignItems: "center", gap: "8px", justifyContent: "center",
              boxShadow:    "0 0 20px rgba(240,180,41,0.1)",
            }}>
              <TrophyIcon size={16} />
              Winner: {shortAddr(boss.winner)} landed the killing blow! Next boss is spawning...
            </div>
          )}
        </div>
      </div>

      {/* Player stats */}
      {playerStats && (
        <div style={{
          background:   "linear-gradient(135deg, rgba(0,82,255,0.07), rgba(0,82,255,0.03))",
          border:       "1px solid rgba(0,82,255,0.2)",
          borderRadius: "18px",
          padding:      "20px",
          marginBottom: "16px",
          boxShadow:    "0 0 20px rgba(0,82,255,0.05)",
        }}>
          <div style={{ color: theme.text, fontWeight: "800", fontSize: "15px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", letterSpacing: "-0.02em" }}>
            <SwordIcon size={16} style={{ color: "#6b9fff" }} /> Your Raid Stats
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: "10px" }}>
            {[
              { label: "Damage This Raid", value: playerStats.damageThisRaid.toLocaleString(), color: "#ff6b6b" },
              { label: "Total Damage",     value: playerStats.totalDamage.toLocaleString(),    color: "#ff3b3b" },
              { label: "Raids Joined",     value: playerStats.raidsJoined,                     color: "#6b9fff" },
              { label: "Raids Won",        value: playerStats.raidsWon,                        color: "#f0b429" },
            ].map(s => (
              <div key={s.label} style={{
                background:   "rgba(255,255,255,0.03)",
                border:       `1px solid rgba(255,255,255,0.07)`,
                borderRadius: "12px", padding: "14px", textAlign: "center",
                transition:   "border-color 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
              >
                <div style={{ color: s.color, fontWeight: "800", fontSize: "22px", letterSpacing: "-0.03em" }}>{s.value}</div>
                <div style={{ color: theme.textMuted, fontSize: "11px", marginTop: "4px", fontWeight: "500" }}>{s.label}</div>
              </div>
            ))}
          </div>
          {playerStats.hasAttackedThisRaid && (
            <div style={{ marginTop: "12px", color: "#00c853", fontSize: "13px", fontWeight: "600", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <CheckCircleIcon size={14} />You have attacked this raid — keep going for more chances!
            </div>
          )}
        </div>
      )}

      {/* Live attack feed */}
      <div style={{
        background:   "#12141a",
        border:       "1px solid rgba(255,255,255,0.07)",
        borderRadius: "18px",
        padding:      "20px",
      }}>
        <div style={{ color: theme.text, fontWeight: "800", fontSize: "15px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", letterSpacing: "-0.02em" }}>
          <ZapIcon size={16} style={{ color: "#f0b429" }} /> Live Attack Feed
        </div>
        {recentAttacks.length === 0 ? (
          <div style={{ color: theme.textMuted, fontSize: "14px", textAlign: "center", padding: "24px 0" }}>
            No attacks yet — be the first to strike!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentAttacks.map((atk, i) => (
              <div key={i} style={{
                background:   atk.killingBlow ? "rgba(240,180,41,0.07)" : "rgba(255,255,255,0.02)",
                border:       `1px solid ${atk.killingBlow ? "rgba(240,180,41,0.25)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "10px",
                padding:      "10px 14px",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "space-between",
                gap:          "12px",
                boxShadow:    atk.killingBlow ? "0 0 12px rgba(240,180,41,0.08)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: atk.killingBlow ? "rgba(240,180,41,0.12)" : "rgba(255,59,59,0.1)",
                    border: `1px solid ${atk.killingBlow ? "rgba(240,180,41,0.3)" : "rgba(255,59,59,0.2)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {atk.killingBlow
                      ? <SkullIcon size={14} style={{ color: "#f0b429" }} />
                      : <SwordIcon size={14} style={{ color: "#ff6b6b" }} />
                    }
                  </div>
                  <div>
                    <span style={{ color: atk.killingBlow ? "#f0b429" : theme.text, fontWeight: "700", fontSize: "13px" }}>
                      {shortAddr(atk.attacker)}
                    </span>
                    <span style={{ color: theme.textMuted, fontSize: "12px" }}>
                      {" "}dealt{" "}
                      <strong style={{ color: atk.killingBlow ? "#f0b429" : "#ff6b6b" }}>
                        {atk.damage} dmg
                      </strong>
                      {atk.killingBlow && <span style={{ color: "#f0b429", fontWeight: "700" }}> — KILLING BLOW! <TrophyIcon size={11} style={{ verticalAlign: "middle" }} /></span>}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: theme.textMuted, fontSize: "11px" }}>{timeAgo(atk.timestamp)}</div>
                  <div style={{ color: theme.textMuted, fontSize: "11px", fontVariantNumeric: "tabular-nums" }}>{atk.hpAfter.toLocaleString()} HP left</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%  { transform: translateX(0) rotate(0deg); }
          15% { transform: translateX(-10px) rotate(-3deg); }
          30% { transform: translateX(10px) rotate(3deg); }
          45% { transform: translateX(-6px) rotate(-1.5deg); }
          60% { transform: translateX(6px) rotate(1.5deg); }
          75% { transform: translateX(-3px); }
          100%{ transform: translateX(0) rotate(0deg); }
        }
        @keyframes glow-pulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
