import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#FF8A00",
          400: "#ffaa44",
          500: "#FF8A00",
          600: "#e67a00",
          700: "#cc6e00",
        },
        blue: {
          DEFAULT: "#1A4B9F",
          400: "#7aaeff",
          500: "#1A4B9F",
          600: "#153d85",
          700: "#0f2d63",
        },
        charcoal: {
          DEFAULT: "#1C1C1E",
          800: "#2a2a2e",
          700: "#38383d",
          600: "#48484f",
        },
        silver: {
          DEFAULT: "#F0F2F5",
          400: "#F0F2F5",
          500: "#D8DCE3",
          600: "#B0B8C4",
        },
      },
      fontFamily: {
        sans:    ["DM Sans", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand":  "linear-gradient(135deg, #FF8A00, #1A4B9F)",
        "gradient-orange": "linear-gradient(135deg, #FF8A00, #e67a00)",
        "gradient-blue":   "linear-gradient(135deg, #1A4B9F, #2E5BFF)",
      },
      boxShadow: {
        "orange-glow": "0 0 28px rgba(255,138,0,0.4)",
        "blue-glow":   "0 0 28px rgba(26,75,159,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;