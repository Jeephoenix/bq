export default function PrivacyPolicy({ onBack, theme }) {
  const t = theme || {
    bg:        "#0a0b0f",
    text:      "white",
    textMuted: "#8892a4",
    textDim:   "#4a5568",
    border:    "rgba(255,255,255,0.06)",
    bgCard:    "rgba(255,255,255,0.03)",
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: "28px" }}>
      <div style={{
        color:        "white",
        fontSize:     "16px",
        fontWeight:   "800",
        marginBottom: "10px",
        paddingBottom:"8px",
        borderBottom: `1px solid ${t.border}`,
      }}>
        {title}
      </div>
      <div style={{ color: t.textMuted, fontSize: "14px", lineHeight: "1.8" }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "24px 0", maxWidth: "720px", margin: "0 auto" }}>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background:   "none",
          border:       `1px solid ${t.border}`,
          borderRadius: "8px",
          padding:      "8px 14px",
          color:        t.textMuted,
          fontSize:     "13px",
          fontWeight:   "600",
          cursor:       "pointer",
          marginBottom: "24px",
          display:      "flex",
          alignItems:   "center",
          gap:          "6px",
          fontFamily:   "inherit",
        }}
      >
        ← Back to App
      </button>

      {/* Header */}
      <div style={{
        background:   t.bgCard,
        border:       "1px solid rgba(0,82,255,0.2)",
        borderRadius: "16px",
        padding:      "28px 24px",
        marginBottom: "24px",
        textAlign:    "center",
      }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔐</div>
        <div style={{ color: t.text, fontSize: "26px", fontWeight: "900", marginBottom: "8px" }}>
          Privacy Policy
        </div>
        <div style={{ color: t.textMuted, fontSize: "13px" }}>
          BaseQuest — basedquests.netlify.app
        </div>
        <div style={{ color: t.textDim, fontSize: "12px", marginTop: "6px" }}>
          Last updated: March 2026
        </div>
      </div>

      {/* Content */}
      <div style={{
        background:   t.bgCard,
        border:       `1px solid ${t.border}`,
        borderRadius: "16px",
        padding:      "28px 24px",
      }}>

        <Section title="1. Introduction">
          Welcome to BaseQuest. We are committed to protecting your privacy and being transparent about how we operate. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. By using BaseQuest, you agree to the terms described in this policy.
        </Section>

        <Section title="2. Information We Collect">
          <div style={{ marginBottom: "10px" }}>
            <strong style={{ color: t.text }}>Wallet Address:</strong> When you connect your wallet, we read your public wallet address. This is a public blockchain identifier — it is not private and is visible to anyone on Base Mainnet.
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong style={{ color: t.text }}>On-Chain Activity:</strong> We read your publicly available transaction history, XP points, quest completions, and activity from the Base Mainnet blockchain. This data is public by nature and not stored by us privately.
          </div>
          <div style={{ marginBottom: "10px" }}>
            <strong style={{ color: t.text }}>Signature:</strong> We ask you to sign a free message to verify wallet ownership. This signature is not stored on our servers — it is only used to verify identity locally in your browser.
          </div>
          <div>
            <strong style={{ color: t.text }}>Local Storage:</strong> We store a small flag in your browser's local storage to remember that you have already signed the welcome message. This data never leaves your device.
          </div>
        </Section>

        <Section title="3. Information We Do NOT Collect">
          <div>We do <strong style={{ color: t.text }}>not</strong> collect any of the following:</div>
          <ul style={{ marginTop: "10px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              "Your name, email address, or any personal identifying information",
              "Your private keys or seed phrases — ever",
              "Your IP address or device information",
              "Cookies or cross-site tracking data",
              "Payment information of any kind",
              "Location data",
            ].map((item, i) => (
              <li key={i} style={{ color: t.textMuted }}>• {item}</li>
            ))}
          </ul>
        </Section>

        <Section title="4. How We Use Your Information">
          <div>The wallet address and on-chain data we read is used solely to:</div>
          <ul style={{ marginTop: "10px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              "Display your XP, level, and quest progress on the platform",
              "Calculate and display your Base Score in the Wallet Analyzer",
              "Show your position on the Leaderboard",
              "Enable DEX swaps and Boss Raid participation",
              "Power the AI Support Bot responses about BaseQuest",
            ].map((item, i) => (
              <li key={i} style={{ color: t.textMuted }}>• {item}</li>
            ))}
          </ul>
        </Section>

        <Section title="5. Third-Party Services">
          <div style={{ marginBottom: "10px" }}>
            BaseQuest integrates with several third-party services to function. Each has its own privacy policy:
          </div>
          {[
            { name: "Netlify",         desc: "Hosts the BaseQuest frontend and serverless functions. Handles HTTPS encryption.", url: "https://www.netlify.com/privacy/" },
            { name: "Base Mainnet",    desc: "All on-chain activity is public on the Base blockchain and viewable on Basescan.", url: "https://basescan.org" },
            { name: "0x Protocol",     desc: "Powers DEX swap routing. Swap quotes are fetched via our serverless proxy.", url: "https://0x.org/privacy" },
            { name: "CoinGecko",       desc: "Provides real-time token price data. No personal data is shared.", url: "https://www.coingecko.com/en/privacy" },
            { name: "Blockscout",      desc: "Provides wallet transaction history for the Wallet Analyzer.", url: "https://blockscout.com/privacy-policy" },
            { name: "Groq AI",         desc: "Powers the AI Support Bot. Only BaseQuest-related questions are sent.", url: "https://groq.com/privacy-policy/" },
          ].map(service => (
            <div key={service.name} style={{
              background:   "rgba(255,255,255,0.02)",
              border:       `1px solid ${t.border}`,
              borderRadius: "8px",
              padding:      "10px 14px",
              marginBottom: "8px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <strong style={{ color: t.text, fontSize: "13px" }}>{service.name}</strong>
                <a href={service.url} target="_blank" rel="noreferrer"
                  style={{ color: "#0052ff", fontSize: "11px", textDecoration: "none" }}>
                  Privacy Policy ↗
                </a>
              </div>
              <div style={{ color: t.textMuted, fontSize: "12px" }}>{service.desc}</div>
            </div>
          ))}
        </Section>

        <Section title="6. Blockchain Data & Transparency">
          BaseQuest is built on a public blockchain. All smart contract interactions — including XP earned, quests completed, swaps executed and boss raid attacks — are permanently recorded on Base Mainnet and are publicly visible to anyone. This is a fundamental property of blockchain technology and cannot be reversed or hidden. We encourage users to understand that on-chain activity is public by design.
        </Section>

        <Section title="7. Data Security">
          We do not store personal data on our servers. Your wallet private keys are never requested, transmitted or stored. All communications between your browser and our platform are encrypted via HTTPS provided by Netlify. The signature verification process happens entirely in your browser and is never sent to any server.
        </Section>

        <Section title="8. Children's Privacy">
          BaseQuest is not intended for users under the age of 18. We do not knowingly collect information from minors. If you are under 18, please do not use this platform.
        </Section>

        <Section title="9. Changes to This Policy">
          We may update this Privacy Policy from time to time as the platform evolves. When we do, we will update the "Last updated" date at the top of this page. Continued use of BaseQuest after any changes constitutes your acceptance of the updated policy.
        </Section>

        <Section title="10. Contact">
          <div>
            If you have any questions or concerns about this Privacy Policy or how BaseQuest handles data, please reach out directly:
          </div>
          <div style={{ marginTop: "12px" }}>
            <a
              href="https://twitter.com/Jee_phoenix"
              target="_blank" rel="noreferrer"
              style={{ color: "#0052ff", fontWeight: "700", textDecoration: "none" }}
            >
              𝕏 @Jee_phoenix
            </a>
          </div>
        </Section>

        {/* Footer note */}
        <div style={{
          marginTop:    "28px",
          paddingTop:   "20px",
          borderTop:    `1px solid ${t.border}`,
          textAlign:    "center",
          color:        t.textDim,
          fontSize:     "12px",
          lineHeight:   "1.7",
        }}>
          BaseQuest is a decentralized on-chain engagement platform built on Base Mainnet.<br />
          We are committed to transparency, security and user privacy.<br />
          <span style={{ color: t.textMuted, marginTop: "6px", display: "block" }}>
            © 2026 BaseQuest™ — Built with 💙 on Base 🟦
          </span>
        </div>
      </div>
    </div>
  );
                           }
