/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#2A3A42',
          100: '#243238',
          200: '#1E2A30',
          300: '#1A2529',
          400: '#FFFFFF',
          500: '#FFFFFF',
          600: '#FFFFFF',
          700: '#FFFFFF',
          800: '#FFFFFF',
          900: '#FFFFFF',
        },
        mint: {
          50: '#0D2E25',
          100: '#114033',
          200: '#165C47',
          300: '#1A7A5C',
          400: '#10B981',
          500: '#10B981',
          600: '#34D399',
          700: '#6EE7B7',
        },
        cobalt: {
          50: '#1A2540',
          100: '#1E3055',
          500: '#3B82F6',
          600: '#60A5FA',
        },
        peach: {
          50: '#3D2A20',
          100: '#5C3F30',
          200: '#7A5540',
          300: '#F2C2A3',
          400: '#F5D5BE',
          500: '#F8E4D4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.3)',
        'glass-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-heavy': '40px',
      },
    },
  },
  plugins: [],
}
