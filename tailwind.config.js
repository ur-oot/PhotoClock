/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-rounded',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Hiragino Kaku Gothic ProN',
          'Meiryo',
          'sans-serif',
        ],
        serif: [
          '"Playfair Display"',
          'ui-serif',
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
