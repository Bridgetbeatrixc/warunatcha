/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f5f0d8",
        paper: "#fffdf7",
        ink: "#172338",
        muted: "#6d7588",
        matcha: "#708b4f",
        moss: "#405634",
        butter: "#efe6b7",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 35, 56, 0.12)",
      },
      fontFamily: {
        display: ["Trebuchet MS", "Avenir Next", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "Avenir Next", "Segoe UI", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
