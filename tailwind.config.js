/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './bureau.html', './detective.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bureau: {
          paper: 'var(--background)',
          surface: 'var(--surface)',
          ink: 'var(--ink)',
          muted: 'var(--muted)',
          line: 'var(--line)',
          rust: 'var(--accent)'
        }
      },
      borderRadius: { bureau: '10px' }
    }
  },
  plugins: []
};