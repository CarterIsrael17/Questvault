/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // <-- add this to include all JS/JSX/TS/TSX files in src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
