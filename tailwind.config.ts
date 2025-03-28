import { yellow } from '@mui/material/colors'
import type { Config } from 'tailwindcss'

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './theme.config.tsx'
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: yellow[600],
          light: yellow[500],
          dark: "#0055aa",
          500: "#0077cc",
        },
        "conf-black": "#0e031c",
        black: "#1b1b1b",
      },
      fontFamily: {
        catamaran: ['Catamaran', 'sans-serif'],
        cartoon: ["Bangers", "Luckiest Guy", "Comic Sans MS", "sans-serif"]
      }
    }
  },
  plugins: [],
  darkMode: 'class'
} satisfies Config
