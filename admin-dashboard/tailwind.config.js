import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, "index.html").replace(/\\/g, "/"),
    path.join(__dirname, "src/**/*.{js,ts,jsx,tsx}").replace(/\\/g, "/"),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "Segoe UI", "sans-serif"],
      },
      colors: {
        welp: {
          void: "#050a12",
          ink: "#070f1a",
          panel: "#0a1422",
          line: "rgba(255,255,255,0.08)",
          accent: "#8ec5ff",
          accentMuted: "rgba(142, 197, 255, 0.14)",
        },
      },
      boxShadow: {
        welp: "0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.55)",
        "welp-inset": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
    },
  },
  plugins: [],
};
