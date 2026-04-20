import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        glowPink: "#ff5ebc",
        glowLemon: "#ffd74a"
      }
    }
  },
  plugins: []
};

export default config;
