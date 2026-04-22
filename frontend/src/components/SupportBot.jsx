import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are the official BaseQuest support assistant. BaseQuest is a gamified on-chain engagement platform built on Base Mainnet. You help users understand and use the app.

Here is everything you know about BaseQuest:

🌐 APP URL: bquest.vercel.app

📋 WHAT IS BASEQUEST:
BaseQuest is an on-chain XP farming platform on Base Mainnet. Users complete daily on-chain tasks to earn XP, build their wallet history, and prepare for potential Base airdrops. XP has no monetary value — it tracks genuine on-chain activity and real contributors.

🗺️ DAILY QUESTS & XP:
- ☀️ GM Base — Send a GM on-chain — +50 XP — costs 0.00005 ETH
- 🚀 Deploy Contract — Deploy a contract to Base Mainnet — +100 XP — costs 0.00005 ETH
- 🔄 Swap on Base — Swap on any Base DEX — +75 XP — costs 0.00005 ETH
- 🌉 Bridge to Base — Bridge assets to Base — +100 XP — costs 0.00005 ETH
- 🐉 Boss Raid — Attack the boss & win prize pool — +75 XP — costs 0.00005 ETH
- 🪪 Set Profile — Set your on-chain username — +50 XP (one-time) — costs 0.00005 ETH
- 🔥 Streak Bonus — Auto-awarded every 7 days — +200 XP — free

📌 SUB-TASKS (bonus XP):
- Deploy on Remix IDE — +50 XP
- Swap on Aerodrome — +50 XP
- Swap on Uniswap — +50 XP
- Swap on Jumper — +50 XP
- Swap on Relay — +50 XP
- Bridge via Jumper — +50 XP
- Bridge via Relay — +50 XP

💎 BASEQUEST DEX:
An exclusive built-in DEX powered by 0x Protocol. Users can swap any token on Base and earn +100 XP per swap. Has XP multipliers based on total XP balance. 0.5% platform fee on swaps.

XP Multipliers for DEX swaps:
- Default: 1x (100 XP)
- 10,000 XP: 1.5x (150 XP)
- 20,000 XP: 2x (200 XP)
- 50,000 XP: 3x (300 XP)

🐉 BOSS RAID:
- Boss spawns with 1000 HP (scales +200 HP each raid)
- Each attack costs 0.00005 ETH
- Random 10-100 damage per attack
- Killing blow winner gets 80% of prize pool + 200 XP bonus
- All attackers get +75 XP for participating
- Boss auto-respawns after defeat

🏆 LEADERBOARD:
Shows top farmers ranked by XP. Updates in real time. Shows username, level, tasks completed and streak.

🔍 WALLET ANALYZER:
Scan any Base wallet address to get:
- Base Score out of 100
- Total transactions, wallet age, contracts interacted with
- Activity heatmap (90 days)
- First, latest, largest and smallest transactions on Base
- Top contracts interacted with
- Volume sent and received

📊 LEVELS:
- 🌱 Newbie: 0-499 XP
- 🌾 Farmer: 500-1499 XP
- 🔨 Builder: 1500-3499 XP
- ⚡ Degen: 3500-7499 XP
- 🔥 OG Base: 7500-14999 XP
- 🦅 Phoenix: 15000+ XP

🚀 HOW TO GET STARTED:
1. Go to basedquests.netlify.app
2. Click Connect Wallet (MetaMask or Coinbase Wallet)
3. Make sure you are on Base Mainnet (Chain ID: 8453)
4. Go to Quests and complete your first task
5. Check your Base Score in Wallet Analyzer
6. Attack the Boss Raid
7. Check the Leaderboard

⚠️ IMPORTANT NOTES:
- XP has NO monetary value
- Designed for genuine on-chain activity only
- No bots, no repetitive farming, no sybil behavior
- Quality activity always beats quantity
- BaseQuest will migrate from Netlify to a dedicated domain in the future
- More chains will be added over time
- Open source: github.com/Jeephoenix/basequest

📞 CONTACT:
- Twitter/X: @Jee_phoenix
- Telegram: @Jeephoenix

Keep your answers short, friendly and helpful. Use emojis where appropriate. If you do not know something, say so honestly. Never make up information about BaseQuest.`;

export default function SupportBot() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role:    "assistant",
      content: "👋 Hey! I'm the BaseQuest support bot. Ask me anything about the app — quests, XP, Boss Raid, DEX, or how to get started! 🔵",
    }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system:   SYSTEM_PROMPT,
          messages: [...messages, userMsg].map(m => ({
            role:    m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const text = data?.text || "Sorry I couldn't process that. Please try again!";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role:    "assistant",
        content: "⚠️ Something went wrong. Please try again or contact us at @Jee_phoenix on X!",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={open ? "support-bot-btn-open" : "support-bot-btn-closed"}
        style={{
          position:       "fixed",
          bottom:         open ? "450px" : "80px",
          right:          "16px",
          zIndex:         200,
          width:          "52px",
          height:         "52px",
          borderRadius:   "50%",
          background:     "linear-gradient(135deg, #0052ff, #7c3aed)",
          border:         "none",
          cursor:         "pointer",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       "22px",
          boxShadow:      "0 4px 20px rgba(0,82,255,0.5)",
          transition:     "all 0.3s",
        }}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {open && (
        <div className="support-bot-chat" style={{
          position:      "fixed",
          bottom:        "80px",
          right:         "16px",
          left:          "16px",
          zIndex:        199,
          background:    "#0d0e14",
          border:        "1px solid rgba(0,82,255,0.3)",
          borderRadius:  "20px",
          boxShadow:     "0 8px 40px rgba(0,0,0,0.6)",
          display:       "flex",
          flexDirection: "column",
          maxHeight:     "430px",
          overflow:      "hidden",
        }}>

          {/* Header */}
          <div style={{
            background:   "linear-gradient(135deg, #0a0f2e, #1a0a3e)",
            padding:      "14px 16px",
            display:      "flex",
            alignItems:   "center",
            gap:          "10px",
            borderBottom: "1px solid rgba(0,82,255,0.2)",
            flexShrink:   0,
          }}>
            <div style={{
              width:          "36px",
              height:         "36px",
              borderRadius:   "50%",
              background:     "linear-gradient(135deg, #0052ff, #7c3aed)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       "18px",
              flexShrink:     0,
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "white", fontSize: "14px", fontWeight: "800" }}>
                BaseQuest Support
              </div>
              <div style={{ color: "#00c853", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "#00c853", display: "inline-block",
                }} />
                Online — powered by Groq AI
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: "none", color: "#8892a4",
                fontSize: "18px", cursor: "pointer", padding: "4px",
              }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex:          1,
            overflowY:     "auto",
            padding:       "16px",
            display:       "flex",
            flexDirection: "column",
            gap:           "12px",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display:        "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems:     "flex-end",
                gap:            "8px",
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width:          "28px",
                    height:         "28px",
                    borderRadius:   "50%",
                    background:     "linear-gradient(135deg, #0052ff, #7c3aed)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       "14px",
                    flexShrink:     0,
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth:     "80%",
                  background:   msg.role === "user"
                    ? "linear-gradient(135deg, #0052ff, #7c3aed)"
                    : "rgba(255,255,255,0.06)",
                  border:       msg.role === "user"
                    ? "none"
                    : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: msg.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  padding:      "10px 14px",
                  color:        "white",
                  fontSize:     "13px",
                  lineHeight:   "1.6",
                  whiteSpace:   "pre-wrap",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: "8px" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #0052ff, #7c3aed)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", flexShrink: 0,
                }}>🤖</div>
                <div style={{
                  background:   "rgba(255,255,255,0.06)",
                  border:       "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px 16px 16px 4px",
                  padding:      "10px 16px",
                  color:        "#8892a4",
                  fontSize:     "13px",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "6px",
                }}>
                  <span style={{ animation: "pulse 1s infinite" }}>⏳</span> Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length === 1 && (
            <div style={{
              padding:    "0 16px 12px",
              display:    "flex",
              gap:        "6px",
              flexWrap:   "wrap",
              flexShrink: 0,
            }}>
              {[
                "How do I earn XP?",
                "What is Boss Raid?",
                "How to connect wallet?",
                "What is BaseQuest DEX?",
              ].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  style={{
                    background:   "rgba(0,82,255,0.1)",
                    border:       "1px solid rgba(0,82,255,0.3)",
                    borderRadius: "20px",
                    padding:      "4px 10px",
                    color:        "#00d4ff",
                    fontSize:     "11px",
                    fontWeight:   "600",
                    cursor:       "pointer",
                    whiteSpace:   "nowrap",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding:    "12px 16px",
            borderTop:  "1px solid rgba(255,255,255,0.06)",
            display:    "flex",
            gap:        "8px",
            flexShrink: 0,
            background: "#0d0e14",
          }}>
            <input
              type="text"
              placeholder="Ask anything about BaseQuest..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              style={{
                flex:         1,
                background:   "rgba(255,255,255,0.05)",
                border:       "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding:      "10px 14px",
                color:        "white",
                fontSize:     "13px",
                outline:      "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background:   loading || !input.trim()
                  ? "rgba(0,82,255,0.3)"
                  : "linear-gradient(135deg, #0052ff, #7c3aed)",
                border:       "none",
                borderRadius: "10px",
                padding:      "10px 16px",
                color:        "white",
                fontWeight:   "800",
                fontSize:     "16px",
                cursor:       loading || !input.trim() ? "not-allowed" : "pointer",
                flexShrink:   0,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
              }
