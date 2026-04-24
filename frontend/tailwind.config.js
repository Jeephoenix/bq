export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base:        "#0052ff",
        "base-dark": "#0041cc",
        success:     "#00c853",
        danger:      "#ff3b3b",
        gold:        "#e8a920",
        surface:     "#12141a",
        "surface-2": "#1a1d27",
        "surface-3": "#1e2130",
        bg:          "#0a0b0f",
        muted:       "#64748b",
      },
      fontFamily: {
        sans:    ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
        mono:    ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      letterSpacing: {
        tight:   "-0.02em",
        tighter: "-0.03em",
      },
      animation: {
        "slide-up": "slideUp 0.35s ease-out",
        "fade-in":  "fadeIn 0.25s ease-out",
        "shimmer":  "shimmer 1.6s ease-in-out infinite",
      },
      keyframes: {
        slideUp: { "0%": { transform: "translateY(14px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
      },
      boxShadow: {
        card:     "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        elevated: "0 8px 32px rgba(0,0,0,0.6)",
        modal:    "0 24px 64px rgba(0,0,0,0.7)",
      },
    },
  },
  plugins: [],
};
