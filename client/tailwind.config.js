/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "vintage-paper": "#f4f1ea",
        "typewriter-dark": "#2c2c2c",
      },
      fontFamily: {
        typewriter: ['"Special Elite"', "serif"],
      },
    },
  },
  plugins: [],
};
