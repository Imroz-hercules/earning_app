import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#182027",
        steel: "#4b6072",
        mint: "#39b58f",
        coral: "#e86f52",
        amber: "#d69a25",
        sky: "#2580bf",
      },
      boxShadow: {
        soft: "0 12px 36px rgba(24, 32, 39, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;

