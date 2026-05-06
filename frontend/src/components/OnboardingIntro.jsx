import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    id: 0,
    step: "01",
    tag: "Welcome",
    title: "Farm Base.\nEarn XP.",
    highlight: "Dominate the Chain.",
    description:
      "The gamified on-chain platform built on Base Mainnet. Complete real blockchain tasks, level up your wallet, and compete for prize pools.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect width="56" height="56" rx="16" fill="url(#g1)" />
        <path d="M28 13l4.5 9.5L43 24.5l-7.5 7.3 1.8 10.2L28 37.2l-9.3 4.8 1.8-10.2L13 24.5l10.5-2L28 13z" fill="white" opacity="0.95"/>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0052ff"/>
            <stop offset="1" stopColor="#1a6aff"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 1,
    step: "02",
    tag: "Daily Quests",
    title: "Complete Tasks.\n",
    highlight: "Earn XP Every Day.",
    description:
      "Swap tokens, bridge assets, use DeFi protocols — every on-chain action earns XP. Build your wallet history and rise through the ranks.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect width="56" height="56" rx="16" fill="url(#g2)" />
        <path d="M16 28h8l4.5-10 4.5 20 4.5-10h7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0052ff"/>
            <stop offset="1" stopColor="#6b9fff"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 2,
    step: "03",
    tag: "Boss Raids",
    title: "Fight Bosses.\n",
    highlight: "Win Prize Pools.",
    description:
      "Join live Boss Raids with the community. Deal damage, top the raid leaderboard, and claim your share of the prize pool.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect width="56" height="56" rx="16" fill="url(#g3)" />
        <path d="M28 15l3.2 8.5H40l-7 5.1 2.7 8.5L28 32.5l-7.7 4.6 2.7-8.5-7-5.1h8.8z" fill="white" opacity="0.95"/>
        <defs>
          <linearGradient id="g3" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#cc0000"/>
            <stop offset="1" stopColor="#ff3b3b"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 3,
    step: "04",
    tag: "Leaderboard",
    title: "Climb the Ranks.\n",
    highlight: "Prove Your Edge.",
    description:
      "Your on-chain actions are scored in real time. See where you stand globally and push for the top — the chain doesn't forget.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect width="56" height="56" rx="16" fill="url(#g4)" />
        <rect x="14" y="32" width="7" height="12" rx="2" fill="white" opacity="0.7"/>
        <rect x="24.5" y="24" width="7" height="20" rx="2" fill="white" opacity="0.9"/>
        <rect x="35" y="28" width="7" height="16" rx="2" fill="white" opacity="0.7"/>
        <defs>
          <linearGradient id="g4" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e8a920"/>
            <stop offset="1" stopColor="#f0b429"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 4,
    step: "05",
    tag: "Ready",
    title: "Connect. Farm.\n",
    highlight: "Become Legend.",
    description:
      "Connect your wallet, sign once, and start building your on-chain legacy on Base. No gas fees to get started.",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect width="56" height="56" rx="16" fill="url(#g5)" />
        <path d="M17 28c0-6 4.9-11 11-11s11 4.9 11 11" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="22" y="28" width="12" height="11" rx="3.5" fill="white" opacity="0.95"/>
        <circle cx="28" cy="33.5" r="1.8" fill="url(#g5)"/>
        <defs>
          <linearGradient id="g5" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00c853"/>
            <stop offset="1" stopColor="#00ff72"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

const variants = {
  enter:  (dir) => ({ opacity: 0, x: dir > 0 ? 56 : -56 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -56 : 56, transition: { duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

export default function OnboardingIntro({ onDone }) {
  const [step, setStep] = useState(0);
  const [dir,  setDir]  = useState(1);
  const slide  = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const finish = () => {
    localStorage.setItem("bq_onboarded", "1");
    onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "#0a0b0f",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Background mesh */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,82,255,0.06) 0%, transparent 70%)",
      }} />

      {/* Skip */}
      <button
        onClick={finish}
        style={{
          position: "absolute", top: "24px", right: "24px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "8px", padding: "6px 14px",
          color: "rgba(255,255,255,0.35)", fontSize: "13px",
          fontWeight: "500", cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      >
        Skip
      </button>

      {/* Step counter */}
      <div style={{
        position: "absolute", top: "28px", left: "28px",
        fontSize: "12px", color: "rgba(255,255,255,0.2)",
        fontWeight: "600", letterSpacing: "0.04em",
        fontVariantNumeric: "tabular-nums",
      }}>
        {step + 1} / {SLIDES.length}
      </div>

      {/* Content */}
      <div style={{
        width: "100%", maxWidth: "460px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative",
      }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ width: "100%", textAlign: "center" }}
          >
            {/* Icon */}
            <motion.div
              style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.06, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div style={{
                padding: "16px",
                borderRadius: "24px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}>
                {slide.icon}
              </div>
            </motion.div>

            {/* Tag */}
            <motion.div
              style={{
                display: "inline-block",
                background: "rgba(0,82,255,0.1)",
                border: "1px solid rgba(0,82,255,0.22)",
                borderRadius: "20px",
                padding: "4px 12px",
                color: "#6b9fff",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.28 }}
            >
              {slide.tag}
            </motion.div>

            {/* Title */}
            <motion.h1
              style={{
                fontSize: "clamp(28px, 6vw, 42px)",
                fontWeight: "900",
                lineHeight: "1.1",
                letterSpacing: "-0.04em",
                marginBottom: "18px",
                whiteSpace: "pre-line",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.3 }}
            >
              <span style={{ color: "#f1f5f9" }}>{slide.title}</span>
              <span style={{
                background: "linear-gradient(135deg, #0052ff 0%, #6b9fff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {slide.highlight}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              style={{
                fontSize: "15px",
                color: "#64748b",
                lineHeight: "1.7",
                maxWidth: "380px",
                margin: "0 auto",
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.3 }}
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: "6px", marginTop: "40px", alignItems: "center" }}>
          {SLIDES.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => go(i)}
              animate={{
                width: i === step ? 24 : 6,
                background: i === step ? "#0052ff" : "rgba(255,255,255,0.12)",
                boxShadow: i === step ? "0 0 8px rgba(0,82,255,0.6)" : "none",
              }}
              transition={{ duration: 0.25 }}
              style={{ height: "6px", borderRadius: "3px", border: "none", cursor: "pointer", padding: 0 }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "28px", width: "100%", maxWidth: "380px" }}>
          {step > 0 && (
            <motion.button
              onClick={() => go(step - 1)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "12px",
                padding: "14px",
                color: "rgba(255,255,255,0.5)",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
            >
              Back
            </motion.button>
          )}

          <button
            onClick={isLast ? finish : () => go(step + 1)}
            style={{
              flex: 2,
              background: "linear-gradient(135deg, #0052ff, #1a6aff)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              padding: "14px",
              color: "white",
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "-0.02em",
              transition: "all 0.15s",
              boxShadow: "0 0 20px rgba(0,82,255,0.4)",
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 32px rgba(0,82,255,0.6)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(0,82,255,0.4)"; e.currentTarget.style.transform = "none"; }}
          >
            {isLast ? "Enter BaseQuest →" : "Continue →"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
