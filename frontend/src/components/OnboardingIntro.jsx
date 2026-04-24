import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    id: 0,
    step: "01",
    tag: "Welcome",
    title: "Farm Base.\nEarn XP.\nDominate the Chain.",
    description:
      "The gamified on-chain platform built on Base Mainnet. Complete real blockchain tasks, level up your wallet, and compete for prize pools.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="14" fill="#0052ff" />
        <path d="M24 11l4 8.5 9 1.3-6.5 6.4 1.5 9-8-4.2-8 4.2 1.5-9L11 20.8l9-1.3z" fill="white" opacity="0.92"/>
      </svg>
    ),
  },
  {
    id: 1,
    step: "02",
    tag: "Daily Quests",
    title: "Complete Tasks.\nEarn XP Every Day.",
    description:
      "Swap tokens, bridge assets, use DeFi protocols — every on-chain action earns XP. Build your wallet history and rise through the ranks.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="14" fill="#0052ff" />
        <path d="M14 24h7l4-9 4 18 4-9h5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 2,
    step: "03",
    tag: "Boss Raids",
    title: "Fight Bosses.\nWin Prize Pools.",
    description:
      "Join live Boss Raids with the community. Deal damage, top the raid leaderboard, and claim your share of the prize pool.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="14" fill="#0052ff" />
        <path d="M24 13l2.8 7.5H34l-6 4.4 2.3 7.5-6.3-4.6-6.3 4.6 2.3-7.5-6-4.4h7.2z" fill="white" opacity="0.92"/>
      </svg>
    ),
  },
  {
    id: 3,
    step: "04",
    tag: "Leaderboard",
    title: "Climb the Ranks.\nProve Your Edge.",
    description:
      "Your on-chain actions are scored in real time. See where you stand globally and push for the top — the chain doesn't forget.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="14" fill="#0052ff" />
        <rect x="12" y="28" width="6" height="10" rx="2" fill="white" opacity="0.7"/>
        <rect x="21" y="20" width="6" height="18" rx="2" fill="white" opacity="0.9"/>
        <rect x="30" y="24" width="6" height="14" rx="2" fill="white" opacity="0.7"/>
      </svg>
    ),
  },
  {
    id: 4,
    step: "05",
    tag: "Ready",
    title: "Connect.\nFarm.\nLegend.",
    description:
      "Connect your wallet, sign once, and start building your on-chain legacy on Base. No gas fees to get started.",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="14" fill="#0052ff" />
        <path d="M15 24c0-5 4-9 9-9s9 4 9 9" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="19" y="24" width="10" height="9" rx="3" fill="white" opacity="0.92"/>
        <circle cx="24" cy="28.5" r="1.5" fill="#0052ff"/>
      </svg>
    ),
  },
];

const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -48 : 48, transition: { duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] } }),
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
      }}
    >
      {/* Skip */}
      <button
        onClick={finish}
        style={{
          position: "absolute", top: "24px", right: "24px",
          background: "none",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px", padding: "6px 14px",
          color: "rgba(255,255,255,0.4)", fontSize: "13px",
          fontWeight: "500", cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
      >
        Skip
      </button>

      {/* Step counter top-left */}
      <div style={{
        position: "absolute", top: "28px", left: "28px",
        fontSize: "12px", color: "rgba(255,255,255,0.25)",
        fontWeight: "500", letterSpacing: "0.04em",
        fontVariantNumeric: "tabular-nums",
      }}>
        {step + 1} / {SLIDES.length}
      </div>

      {/* Content */}
      <div style={{
        width: "100%", maxWidth: "440px",
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
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.3 }}
            >
              <div style={{
                padding: "2px",
                borderRadius: "18px",
                background: "rgba(0,82,255,0.12)",
                border: "1px solid rgba(0,82,255,0.2)",
              }}>
                {slide.icon}
              </div>
            </motion.div>

            {/* Tag */}
            <motion.div
              style={{
                display: "inline-block",
                background: "rgba(0,82,255,0.12)",
                border: "1px solid rgba(0,82,255,0.2)",
                borderRadius: "6px",
                padding: "4px 10px",
                color: "#6b9fff",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.06em",
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
                fontSize: "clamp(26px, 5.5vw, 38px)",
                fontWeight: "700",
                color: "#f1f5f9",
                lineHeight: "1.15",
                letterSpacing: "-0.03em",
                marginBottom: "18px",
                whiteSpace: "pre-line",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.3 }}
            >
              {slide.title.split("\n").map((line, i, arr) => (
                <span key={i}>
                  {i === arr.length - 1
                    ? <span style={{ color: "#0052ff" }}>{line}</span>
                    : line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </motion.h1>

            {/* Description */}
            <motion.p
              style={{
                fontSize: "15px",
                color: "#64748b",
                lineHeight: "1.65",
                maxWidth: "360px",
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
                width: i === step ? 20 : 5,
                background: i === step ? "#0052ff" : "rgba(255,255,255,0.15)",
              }}
              transition={{ duration: 0.25 }}
              style={{ height: "5px", borderRadius: "3px", border: "none", cursor: "pointer", padding: 0 }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "28px", width: "100%", maxWidth: "360px" }}>
          {step > 0 && (
            <motion.button
              onClick={() => go(step - 1)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "14px",
                color: "rgba(255,255,255,0.55)",
                fontWeight: "500",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
            >
              Back
            </motion.button>
          )}

          <button
            onClick={isLast ? finish : () => go(step + 1)}
            style={{
              flex: 2,
              background: "#0052ff",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "-0.01em",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a64ff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#0052ff"; e.currentTarget.style.transform = "none"; }}
          >
            {isLast ? "Enter BaseQuest" : "Continue"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
