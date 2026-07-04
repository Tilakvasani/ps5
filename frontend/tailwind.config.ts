import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange:   "#FF4500",
          lime:     "#C8FF00",
          black:    "#0A0A0A",
          white:    "#FFFFFF",
          cream:    "#FFF5F0",
          gray:     "#F8F8F8",
          muted:    "#888888",
          border:   "#0A0A0A",
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
