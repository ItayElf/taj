module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          "extra-light": "#b4dfe5",
          light: "#36bccf",
          DEFAULT: "#158d9e",
          dark: "#303c6c",
          "extra-dark": "#1c213b",
        },
        secondary: {
          light: "#fff9e3",
          DEFAULT: "#fbe8a6",
          "semi-dark": "#fac58c",
          dark: "#fbba73",
          "extra-dark": "#f4976c",
        },
      },
      fontFamily: {
        roboto: ["Roboto"],
        cinzel: ["Cinzel Decorative"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
