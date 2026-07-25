/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Slate background mappings
        surface: "#141218",
        "surface-container": "#211f24",
        "surface-container-high": "#2b292f",
        "surface-container-low": "#1d1b20",
        "surface-container-lowest": "#0f0d13",
        // Role based highlighting
        primary: "#cfbcff",       // default theme / Player Emerald or Coach Blue
        secondary: "#cdc0e9",
        tertiary: "#e7c365",      // Organizer Amber color
        error: "#ffb4ab",
        "on-surface": "#e6e0e9",
        "on-surface-variant": "#cbc4d2",
        "outline-variant": "#494551",
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
