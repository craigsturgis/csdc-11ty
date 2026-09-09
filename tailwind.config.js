module.exports = {
  darkMode: "media",
  content: ["./src/**/*.{html,js,njk,md}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0d0c",
        paper: "#f2f0e9",
        mint: "#6dc18b",
        fog: "#a8ada9",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["SFMono-Regular", "Consolas", "Liberation Mono", "monospace"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
