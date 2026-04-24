import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_CONFIG = {
  success: { border: "#00c853", icon: "✓", iconBg: "rgba(0,200,83,0.15)", iconColor: "#00c853" },
  error:   { border: "#ff3b3b", icon: "✕", iconBg: "rgba(255,59,59,0.15)",  iconColor: "#ff6b6b" },
  info:    { border: "#0052ff", icon: "↗", iconBg: "rgba(0,82,255,0.15)",   iconColor: "#6b9fff" },
  xp:      { border: "#e8a920", icon: "⚡", iconBg: "rgba(232,169,32,0.15)", iconColor: "#e8a920" },
};

const DURATION = 4200;

function Toast({ toast, onDismiss }) {
  const cfg = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), DURATION);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: 12, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      style={{
        width:        "320px",
        background:   "#12141a",
        border:       `1px solid rgba(255,255,255,0.09)`,
        borderLeft:   `3px solid ${cfg.border}`,
        borderRadius: "12px",
        overflow:     "hidden",
        boxShadow:    "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
        cursor:       "pointer",
        position:     "relative",
      }}
      onClick={() => onDismiss(toast.id)}
    >
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>

        {/* Icon */}
        <div style={{
          width:          "32px",
          height:         "32px",
          borderRadius:   "8px",
          background:     cfg.iconBg,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
          fontSize:       toast.type === "xp" ? "16px" : "14px",
          fontWeight:     "700",
          color:          cfg.iconColor,
        }}>
          {cfg.icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color:        "#f1f5f9",
            fontWeight:   "600",
            fontSize:     "13px",
            letterSpacing:"-0.01em",
            marginBottom: toast.body ? "3px" : 0,
          }}>
            {toast.title}
          </div>
          {toast.body && (
            <div style={{
              color:     "#64748b",
              fontSize:  "12px",
              lineHeight:"1.5",
              overflow:  "hidden",
              textOverflow: "ellipsis",
              whiteSpace:"nowrap",
            }}>
              {toast.body}
            </div>
          )}
        </div>

        {/* XP badge */}
        {toast.xp && (
          <div style={{
            background:    "rgba(232,169,32,0.1)",
            border:        "1px solid rgba(232,169,32,0.25)",
            borderRadius:  "8px",
            padding:       "4px 10px",
            color:         "#e8a920",
            fontWeight:    "800",
            fontSize:      "15px",
            flexShrink:    0,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}>
            {toast.xp}
          </div>
        )}
      </div>

      {/* Auto-dismiss progress bar */}
      <div style={{
        position:   "absolute",
        bottom:     0,
        left:       0,
        height:     "2px",
        background: cfg.border,
        opacity:    0.5,
        animation:  `toast-shrink ${DURATION}ms linear forwards`,
      }} />
    </motion.div>
  );
}

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" style={{
      position:      "fixed",
      bottom:        "80px",
      right:         "20px",
      zIndex:        9999,
      display:       "flex",
      flexDirection: "column",
      gap:           "10px",
      alignItems:    "flex-end",
      pointerEvents: "none",
    }}>
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: "auto" }}>
            <Toast toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
