/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'accent-yellow': '#E5A812',
        'accent-yellow-hover': '#D4970A',
        'accent-yellow-light': '#FEF9EE',
        'dark-primary': '#111111',
        'dark-secondary': '#1E1E1E',
        'dark-card': '#181818',
        'light-bg': '#F8F8F7',
        'light-border': '#EEEEEE',
        'text-muted': '#666666',
        'text-subtle': '#888888',
      },
      fontFamily: {
        display: ['"Syne"', '"Noto Sans Kannada"', '"Noto Serif Kannada"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Kannada"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', '"Noto Serif Kannada"', 'sans-serif'],
        'kannada-sans': ['"Noto Sans Kannada"', 'sans-serif'],
        'kannada-serif': ['"Noto Serif Kannada"', 'serif'],
        script: ['"Caveat"', 'cursive'],
        serif: ['"Noto Serif Kannada"', 'serif'],
        cinzel: ['"Syne"', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.06)',
        'elevated': '0 12px 30px rgba(0, 0, 0, 0.09)',
      }
    },
  },
  plugins: [],
}
