/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        void:    "#051F20",
        surface: "#0B2B26",
        panel:   "#163832",
        border:  "#235347",
        accent: { DEFAULT: "#28623A", light: "#8EB69B", glow: "#28623A33" },
        neon: { green: "#8EB69B", pink: "#ff2d78", blue: "#DAF1DE", amber: "#ffb347" },
      },
      boxShadow: {
        glow:    "0 0 20px rgba(40,98,58,0.5)",
        "glow-sm": "0 0 10px rgba(40,98,58,0.3)",
        card:    "0 4px 24px rgba(0,0,0,0.5)",
      },
      animation: {
        "slide-in": "slideIn 0.3s cubic-bezier(0.16,1,0.3,1)",
        "fade-up":  "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)",
        shimmer:    "shimmer 2s infinite",
        pulse2:     "pulse2 2s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        slideIn: { from: { transform: "translateX(-16px)", opacity: "0" }, to: { transform: "translateX(0)",   opacity: "1" } },
        fadeUp:  { from: { transform: "translateY(12px)",  opacity: "0" }, to: { transform: "translateY(0)",   opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulse2:  { "0%,100%": { opacity: "1" }, "50%": { opacity: ".4" } },
      },
    },
  },
  plugins: [],
};
