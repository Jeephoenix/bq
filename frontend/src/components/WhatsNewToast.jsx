import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon } from "./Icons";

export const WHATS_NEW_VERSION = "2026.04.26";

const WHATS_NEW_ITEMS = [
  "Leaderboard now shows the top 10 users",
  "Fixed action buttons overflowing on Tools page (mobile)",
  "Chat input no longer overflows on narrow screens",
];

const STORAGE_KEY = "bq_whatsnew_dismissed";

export default function WhatsNewToast({ theme }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed !== WHATS_NEW_VERSION) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, WHATS_NEW_VERSION);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            position:     "fixed",
            left:         "16px",
            bottom:       "92px",
            zIndex:       9999,
            maxWidth:     "320px",
            background:   "linear-gradient(135deg, rgba(0,82,255,0.18), rgba(0,82,255,0.06))",
            border:       "1px solid rgba(0,82,255,0.4)",
            borderRadius: "14px",
            padding:      "14px 16px",
            color:        theme?.text || "#f1f5f9",
            boxShadow:    "0 8px 32px rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
            fontFamily:   "inherit",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                background:   "#0052ff",
                color:        "white",
                fontSize:     "10px",
                fontWeight:   "700",
                padding:      "3px 7px",
                borderRadius: "6px",
                letterSpacing: "0.4px",
                textTransform: "uppercase",
              }}>
                New
              </span>
              <span style={{ fontWeight: "700", fontSize: "13px" }}>What's new</span>
            </div>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              style={{
                background:   "none",
                border:       "none",
                color:        theme?.textMuted || "#64748b",
                cursor:       "pointer",
                fontSize:     "18px",
                lineHeight:   1,
                padding:      "0 2px",
                fontFamily:   "inherit",
              }}
            >
              ×
            </button>
          </div>

          <ul style={{
            listStyle:  "none",
            padding:    0,
            margin:     "0 0 10px 0",
            display:    "flex",
            flexDirection: "column",
            gap:        "6px",
          }}>
            {WHATS_NEW_ITEMS.map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", lineHeight: 1.4 }}>
                <CheckIcon size={13} style={{ color: "#22c55e", flexShrink: 0, marginTop: "3px" }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={dismiss}
            style={{
              background:   "rgba(0,82,255,0.2)",
              border:       "1px solid rgba(0,82,255,0.35)",
              borderRadius: "8px",
              padding:      "6px 12px",
              color:        "white",
              fontSize:     "12px",
              fontWeight:   "600",
              cursor:       "pointer",
              fontFamily:   "inherit",
              width:        "100%",
            }}
          >
            Got it
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
