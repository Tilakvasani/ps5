import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: '#051124',
        foreground: '#FFFFFF',
        card: '#0C1E39',
        border: '#0C1E39',
        orange: {
          500: '#FF5C00',
        },
      },
      fontFamily: {
        sans: ["Inter", "DM Sans", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.05em",
        tighter:  "-0.03em",
        tight:    "-0.02em",
        wide:     "0.05em",
        wider:    "0.1em",
        widest:   "0.15em",
      },
      borderWidth: {
        DEFAULT: "1.5px",
        "2": "2px",
      },
    },
  },
  plugins: [],
};

export default config;
