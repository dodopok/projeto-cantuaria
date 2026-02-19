/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        'cantuaria-cream': '#FDFCF8',
        'cantuaria-charcoal': '#1A1A1A',
        'cantuaria-oxford': '#002147',
        'cantuaria-crimson': '#8B0000',
        'cantuaria-gold': '#C5A059',
      },
      fontFamily: {
        serif: ['EB Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#1A1A1A',
            h1: { fontFamily: 'EB Garamond' },
            h2: { fontFamily: 'EB Garamond' },
            h3: { fontFamily: 'EB Garamond' },
          },
        },
      },
    },
  },
  plugins: [],
}
