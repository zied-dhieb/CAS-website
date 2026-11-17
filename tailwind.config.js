/** Design tokens live here. Colors come only from the CAS logo (green + black). */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#2E8B2E', light: '#6BAA1C', dark: '#1B5E20' },
        ink: '#0C1A10',
        paper: '#F7F9F5',
        night: "#071009",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
