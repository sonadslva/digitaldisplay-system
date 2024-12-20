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
        '2xl': '1440px',
        '3xl': '1600px', // Extra large screen
         '4xl':'1800px',
      },
    },
  },
  plugins: [],
};

