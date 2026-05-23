import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#EB9220",
          400: "#FFA726",
          500: "#EB9220",
          600: "#E65100",
          700: "#D84315",
        },
        blue: {
          DEFAULT: "#002A30",
          400: "#359E4C",
          500: "#48C062",
          600: "#002A30",
          700: "#001C20",
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
        "zupwell-blue":  "#002A30",
        "zupwell-blue-light": "#48C062",
        "zupwell-orange": "#EB9220",
      },
      fontFamily: {
        sans:    ["Rajdhani", "sans-serif"],
        display: ["Squada One", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand":  "linear-gradient(135deg, #EB9220, #002A30)",
        "gradient-orange": "linear-gradient(135deg, #EB9220, #E65100)",
        "gradient-blue":   "linear-gradient(135deg, #002A30, #48C062)",
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
