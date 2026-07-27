/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#141414',
          card: '#2A2A2A',
          border: '#3A3A3A',
        },
        lime: {
          DEFAULT: '#C6FF00',
          light: '#D4FF33',
          dark: '#A3CC00',
        },
        muted: '#8A8A8A',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
