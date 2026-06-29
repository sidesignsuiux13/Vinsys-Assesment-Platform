/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#F9F0F0',
          100: '#F0D9D9',
          200: '#DFB0B0',
          300: '#C97C7C',
          400: '#AE4848',
          500: '#8F2020',
          600: '#7B1C1C',
          700: '#621616',
          800: '#4A1010',
          900: '#310A0A',
        },
        neutral: {
          50: '#F8F7F5',
          100: '#F0EEE9',
          200: '#E2DDD8',
          300: '#C4BDB5',
          400: '#9E9289',
          500: '#7A6E66',
          600: '#5C5249',
          700: '#3F3830',
          800: '#28221C',
          900: '#1A1512',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
