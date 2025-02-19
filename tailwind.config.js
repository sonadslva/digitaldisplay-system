/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px', // Extra small screen
        '1xl':'1200px',
        '2xl': '1440px',
        '3xl': '1600px', // Extra large screen
         '4xl':'1800px',
         '5xl':'2000px',
         '6xl':'2200px',
         '7xl':'2400px',
      },
    },
  },
  plugins: [],
};

