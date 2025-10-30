/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#2d5a3d",
        "primary-dark": "#234731",
        "beige-light": "#f8f4ee",
      },
    },
  },
  plugins: [],
};
