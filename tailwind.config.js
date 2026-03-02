module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#34D399',      // Emerald — yumuşak yeşil
        secondary: '#60A5FA',    // Soft mavi
        accent: '#FBBF24',       // Amber — vurgular
        warning: '#F87171',      // Soft kırmızı
        surface: '#111827',      // Kart arka planı
        background: '#030712',   // Ana arka plan (gray-950)
        water: '#38BDF8',        // Su mavisi
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
