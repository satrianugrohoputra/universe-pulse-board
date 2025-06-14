
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b1120",
        accent: {
          DEFAULT: "#06b6d4",
          light: "#67e8f9",
        }
      },
      borderRadius: {
        xl: "1rem"
      }
    }
  },
  plugins: [require('@tailwindcss/forms')],
}
