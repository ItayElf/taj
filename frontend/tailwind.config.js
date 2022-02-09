module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#d2fdff",
          DEFAULT: "#b4dfe5",
          dark: "#303c6c",
          "extra-dark": "#1c213b",
        },
        secondary: {
          light: "#fff9e3",
          DEFAULT: "#fbe8a6",
          "semi-dark": "#f6b292",
          dark: "#f4976c",
        },
      },
      fontFamily: {
        roboto: ["Roboto"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
