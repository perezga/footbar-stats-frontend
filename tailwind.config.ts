import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Condensed sport face for the FUT-style player card.
        card: ['Oswald', 'Arial Narrow', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#F7335D',
          dark: '#1A1F2C',
          panel: '#0F1420',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
