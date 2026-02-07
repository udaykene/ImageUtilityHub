/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#137fec",
          50: "#e6f4ff",
          100: "#cce9ff",
          200: "#99d3ff",
          300: "#66bdff",
          400: "#33a7ff",
          500: "#137fec",
          600: "#0f66bd",
          700: "#0b4d8e",
          800: "#07335f",
          900: "#041a30",
        },
        accent: {
          purple: "#a855f7",
        },
        background: {
          light: "#f6f7f8",
          dark: "#0a0f14",
        },
        card: {
          dark: "rgba(23, 37, 52, 0.6)",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}