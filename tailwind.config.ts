import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0B1020",
          card: "#111827",
          elevated: "#1F2937",
        },
        brand: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          dark: "#1D4ED8",
        },
        ink: {
          DEFAULT: "#F1F5F9",
          muted: "#94A3B8",
          faint: "#64748B",
        },
        border: {
          DEFAULT: "rgba(59,130,246,0.2)",
        },
      },
      boxShadow: {
        glow: "0 0 24px rgba(96,165,250,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
