import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    id: 0,
    tag: "Welcome to BaseQuest",
    title: "Farm Base.\nEarn XP.\nDominate the Chain.",
    description:
      "The gamified on-chain platform built on Base Mainnet. Complete real blockchain tasks, level up your wallet, and compete for prize pools.",
    accent: "#0052ff",
    accent2: "#7c3aed",
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect width="52" height="52" rx="16" fill="url(#g0)" />
        <path d="M26 12l4.5 9 9.5 1.5-7 6.5 1.5 9.5L26 34l-8.5 4.5 1.5-9.5-7-6.5 9.5-1.5z" fill="white" opacity="0.9"/>
        <defs>
          <linearGradient id="g0" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0052ff"/>
            <stop offset="1" stopColor="#7c3aed"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    orbs: [
      { color: "rgba(0,82,255,0.18)", size: 420, x: "60%", y: "-10%", blur: 80 },
      { color: "rgba(124,58,237,0.12)", size: 300, x: "-10%", y: "60%", blur: 60 },
    ],
  },
  {
    id: 1,
    tag: "Daily Quests",
    title: "Complete Tasks.\nEarn XP Every Day.",
    description:
      "Swap tokens, bridge assets, use DeFi protocols — every on-chain action earns XP. Build your wallet history and rise through the ranks.",
    accent: "#00c853",
    accent2: "#0052ff",
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect width="52" height="52" rx="16" fill="url(#g1)" />
        <path d="M16 26h8l4-10 4 20 4-10h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00c853"/>
            <stop offset="1" stopColor="#0052ff"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    orbs: [
      { color: "rgba(0,200,83,0.15)", size: 380, x: "55%", y: "-5%", blur: 80 },
      { color: "rgba(0,82,255,0.10)", size: 280, x: "-8%", y: "55%", blur: 60 },
    ],
  },
  {
    id: 2,
    tag: "Boss Raids",
    title: "Fight Bosses.\nWin Prize Pools.",
    description:
      "Join live Boss Raids with the community. Deal damage, top the raid leaderboard, and claim your share of the prize pool.",
    accent: "#ff3b3b",
    accent2: "#ff9500",
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect width="52" height="52" rx="16" fill="url(#g2)" />
        <path d="M26 14l3 8h8l-6.5 5 2.5 8L26 30l-7 5 2.5-8L15 22h8z" fill="white" opacity="0.9"/>
        <defs>
          <linearGradient id="g2" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ff3b3b"/>
            <stop offset="1" stopColor="#ff9500"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    orbs: [
      { color: "rgba(255,59,59,0.15)", size: 400, x: "60%", y: "-8%", blur: 80 },
      { color: "rgba(255,149,0,0.10)", size: 260, x: "-5%", y: "60%", blur: 60 },
    ],
  },
  {
    id: 3,
    tag: "Leaderboard",
    title: "Climb the Ranks.\nProve Your Edge.",
    description:
      "Your on-chain actions are scored in real time. See where you stand globally and push for the top — the chain doesn't forget.",
    accent: "#f0b429",
    accent2: "#ff9500",
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect width="52" height="52" rx="16" fill="url(#g3)" />
        <rect x="14" y="28" width="6" height="12" rx="2" fill="white" opacity="0.7"/>
        <rect x="23" y="20" width="6" height="20" rx="2" fill="white" opacity="0.9"/>
        <rect x="32" y="24" width="6" height="16" rx="2" fill="white" opacity="0.7"/>
        <defs>
          <linearGradient id="g3" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f0b429"/>
            <stop offset="1" stopColor="#ff9500"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    orbs: [
      { color: "rgba(240,180,41,0.15)", size: 380, x: "55%", y: "-5%", blur: 80 },
      { color: "rgba(255,149,0,0.10)", size: 270, x: "-8%", y: "60%", blur: 60 },
    ],
  },
  {
    id: 4,
    tag: "Ready to Begin",
    title: "Connect.\nFarm.\nLegend.",
    description:
      "Connect your wallet, sign once, and start building your on-chain legacy on Base. No gas fees to get started.",
    accent: "#0052ff",
    accent2: "#00d4ff",
    icon: (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect width="52" height="52" rx="16" fill="url(#g4)" />
        <path d="M16 26c0-5.52 4.48-10 10-10s10 4.48 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="20" y="26" width="12" height="10" rx="3" fill="white" opacity="0.9"/>
        <circle cx="26" cy="31" r="1.5" fill="url(#g4)"/>
        <defs>
          <linearGradient id="g4" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0052ff"/>
            <stop offset="1" stopColor="#00d4ff"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    orbs: [
      { color: "rgba(0,82,255,0.18)", size: 420, x: "55%", y: "-8%", blur: 80 },
      { color: "rgba(0,212,255,0.12)", size: 300, x: "-10%", y: "55%", blur: 60 },
    ],
  },
];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } }),
};

function GridLines() {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      backgroundImage: "linear-gradient(rgba(0,82,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,82,255,0.04) 1px, transparent 1px)",
      backgroundSize: "48px 48px",
    }} />
  );
}

function FloatingOrb({ color, size, x, y, blur, delay = 0 }) {
  return (
    <motion.div
      style={{
        position: "absolute", borderRadius: "50%",
        width: size, height: size,
        left: x, top: y,
        background: color,
        filter: `blur(${blur}px)`,
        pointerEvents: "none",
      }}
      animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function Particles({ accent }) {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.5 + Math.random() * 2,
    dur: 4 + Math.random() * 6,
    delay: Math.random() * 4,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {dots.map(d => (
        <motion.div
          key={d.id}
          style={{
            position: "absolute",
            left: `${d.x}%`, top: `${d.y}%`,
            width: d.size, height: d.size,
            borderRadius: "50%",
            background: accent,
            opacity: 0,
          }}
          animate={{ opacity: [0, 0.7, 0], y: [0, -30] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export default function OnboardingIntro({ onDone }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const slide = SLIDES[step];
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
      transition={{ duration: 0.4 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "#0a0b0f",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <GridLines />

      {slide.orbs.map((orb, i) => (
        <FloatingOrb key={`${step}-orb-${i}`} {...orb} delay={i * 1.5} />
      ))}

      <Particles accent={slide.accent} />

      {/* Skip button */}
      <button
        onClick={finish}
        style={{
          position: "absolute", top: "24px", right: "24px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "20px", padding: "7px 18px",
          color: "rgba(255,255,255,0.5)", fontSize: "13px",
          fontWeight: "500", cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.2s",
          zIndex: 10,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      >
        Skip
      </button>

      {/* Main card */}
      <div style={{
        width: "100%", maxWidth: "480px",
        padding: "0 24px",
        display: "flex", flexDirection: "column", alignItems: "center",
        position: "relative", zIndex: 5,
      }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ width: "100%", textAlign: "center" }}
          >
            {/* Icon */}
            <motion.div
              style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <div style={{
                padding: "4px",
                background: `linear-gradient(135deg, ${slide.accent}33, ${slide.accent2}22)`,
                borderRadius: "22px",
                boxShadow: `0 0 40px ${slide.accent}44`,
              }}>
                {slide.icon}
              </div>
            </motion.div>

            {/* Tag */}
            <motion.div
              style={{
                display: "inline-block",
                background: `${slide.accent}18`,
                border: `1px solid ${slide.accent}44`,
                borderRadius: "20px", padding: "5px 14px",
                color: slide.accent, fontSize: "11px",
                fontWeight: "600", letterSpacing: "0.8px",
                textTransform: "uppercase", marginBottom: "20px",
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
            >
              {slide.tag}
            </motion.div>

            {/* Title */}
            <motion.h1
              style={{
                fontSize: "clamp(28px, 6vw, 40px)",
                fontWeight: "800",
                color: "white",
                lineHeight: "1.18",
                letterSpacing: "-1px",
                marginBottom: "20px",
                whiteSpace: "pre-line",
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.38 }}
            >
              {slide.title.split("\n").map((line, i, arr) => (
                <span key={i}>
                  {i === arr.length - 1
                    ? <span style={{ background: `linear-gradient(90deg, ${slide.accent}, ${slide.accent2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{line}</span>
                    : line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </motion.h1>

            {/* Description */}
            <motion.p
              style={{
                fontSize: "15px", color: "#8892a4",
                lineHeight: "1.7", maxWidth: "380px",
                margin: "0 auto",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.27, duration: 0.38 }}
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: "8px", marginTop: "44px", alignItems: "center" }}>
          {SLIDES.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => go(i)}
              animate={{
                width: i === step ? 24 : 6,
                background: i === step ? slide.accent : "rgba(255,255,255,0.2)",
              }}
              transition={{ duration: 0.3 }}
              style={{
                height: "6px", borderRadius: "3px",
                border: "none", cursor: "pointer", padding: 0,
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", marginTop: "32px", width: "100%" }}>
          {step > 0 && (
            <motion.button
              onClick={() => go(step - 1)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "14px", padding: "16px",
                color: "rgba(255,255,255,0.6)", fontWeight: "600",
                fontSize: "15px", cursor: "pointer",
                fontFamily: "inherit", letterSpacing: "-0.1px",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >
              Back
            </motion.button>
          )}

          <button
            onClick={isLast ? finish : () => go(step + 1)}
            style={{
              flex: 2,
              background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent2})`,
              border: "none", borderRadius: "14px", padding: "16px",
              color: "white", fontWeight: "700",
              fontSize: "15px", cursor: "pointer",
              fontFamily: "inherit", letterSpacing: "-0.1px",
              boxShadow: `0 4px 28px ${slide.accent}55`,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 36px ${slide.accent}77`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 28px ${slide.accent}55`; }}
          >
            {isLast ? "Enter BaseQuest →" : "Next →"}
          </button>
        </div>

        {/* Step counter */}
        <div style={{ marginTop: "20px", color: "rgba(255,255,255,0.25)", fontSize: "12px", fontWeight: "500" }}>
          {step + 1} / {SLIDES.length}
        </div>
      </div>
    </motion.div>
  );
}
