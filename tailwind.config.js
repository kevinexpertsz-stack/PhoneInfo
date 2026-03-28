/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg-color)',
        text: 'var(--text-color)',
        card: 'var(--card-bg)',
        accent: 'var(--accent)',
        border: 'var(--border-color)',
        muted: 'var(--muted-text)',
      }
    },
  },
  plugins: [],
}
