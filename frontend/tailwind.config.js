/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
      colors: {
        navy: {
          900: '#010f1f',
          800: '#051424',
          700: '#0a1d33',
        },
        electric: {
          500: '#0052ff',
          400: '#00d2ff',
        }
      }
    },
  },
  plugins: [],
}
