import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#F47C41",
          400: "#f79b6e",
          500: "#F47C41",
          600: "#d9673a",
          700: "#bf5a32",
        },
        blue: {
          DEFAULT: "#0B2C6F",
          400: "#4CC9F0",
          500: "#1E5AA8",
          600: "#0B2C6F",
          700: "#071d4a",
        },
        charcoal: {
          DEFAULT: "#111827",
          800: "#1f2937",
          700: "#374151",
          600: "#4B5563",
        },
        silver: {
          DEFAULT: "#F4F6FA",
          400: "#F4F6FA",
          500: "#D9DEE8",
          600: "#6B7280",
        },
        "neon-sky":      "#4CC9F0",
        "lemon-yellow":  "#FFD166",
        "mint-green":    "#2EC4B6",
        "zupwell-blue":  "#0B2C6F",
        "zupwell-blue-light": "#1E5AA8",
        "zupwell-orange": "#F47C41",
      },
      fontFamily: {
        sans:    ["DM Sans", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand":  "linear-gradient(135deg, #F47C41, #1E5AA8)",
        "gradient-orange": "linear-gradient(135deg, #F47C41, #d9673a)",
        "gradient-blue":   "linear-gradient(135deg, #0B2C6F, #1E5AA8)",
        "gradient-teal":   "linear-gradient(135deg, #2EC4B6, #4CC9F0)",
      },
      boxShadow: {
        "orange-glow": "0 0 28px rgba(244,124,65,0.4)",
        "blue-glow":   "0 0 28px rgba(11,44,111,0.4)",
        "sky-glow":    "0 0 28px rgba(76,201,240,0.4)",
        "mint-glow":   "0 0 28px rgba(46,196,182,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
