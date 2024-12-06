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
        // Add more custom screen sizes as needed
      },
    },
  },
  plugins: [],
}