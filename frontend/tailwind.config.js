/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryOrange: "#f97316", // orange-500
        sakthiAmber: "#ff9100",   // brand bright amber/gold
        softYellow: "#fde047",    // yellow-300
        lightGrey: "#f3f4f6",     // gray-100
        darkGrey: "#374151",      // gray-700
        foundryCharcoal: "#2d2d2d", // main dark background
        foundryCard: "#383838",     // card dark background
        foundryBorder: "#4a4a4a",   // dark border
        foundryDeep: "#050B14",     // header deep background
      },
    },
  },
  plugins: [],
};
