import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ui: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "Noto Sans",
          "Liberation Sans",
          "sans-serif",
        ],
        body: [
          "ui-serif",
          "Iowan Old Style",
          "Palatino Linotype",
          "Palatino",
          "Book Antiqua",
          "Georgia",
          "Noto Serif",
          "serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },

      maxWidth: {
        reading: "72ch",
        "reading-sm": "66ch",
      },

      fontSize: {
        "body": ["clamp(17px, 1.9vw, 19px)", { lineHeight: "1.75" }],
        "title": ["clamp(30px, 3.4vw, 44px)", { lineHeight: "1.12" }],
        "dek": ["clamp(16px, 1.8vw, 18px)", { lineHeight: "1.5" }],
        "meta": ["13px", { lineHeight: "1.4" }],

        "h1": ["clamp(26px, 3vw, 34px)", { lineHeight: "1.2" }],
        "h2": ["clamp(22px, 2.4vw, 28px)", { lineHeight: "1.2" }],
        "h3": ["clamp(18px, 2vw, 22px)", { lineHeight: "1.25" }],
      },

      spacing: {
        "p": "1.05em",
        "h-top": "1.6em",
        "h-bot": "0.55em",
      },

      colors: {
        reading: {
          bg: "#ffffff",
          surface: "#ffffff",
          text: "#111827",
          muted: "#4b5563",
          faint: "#6b7280",
          border: "#e5e7eb",
          link: "#1f2937",
          linkHover: "#111827",
        },
      },

      boxShadow: {
        none: "none",
      },
    },
  },
  darkMode: "media",
  plugins: [],
};

export default config;
