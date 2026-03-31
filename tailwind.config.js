/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff', 100: '#dce8ff', 200: '#b3c9f5', 300: '#7a9fe8',
          400: '#4a72d4', 500: '#2451b3', 600: '#1a3a8f', 700: '#102b72',
          800: '#0a1f54', 900: '#050f2c', 950: '#020818',
        },
        gold: {
          200: '#ffd97a', 300: '#ffc233', 400: '#f5a800', 500: '#e08a00',
          600: '#b96d00', 900: '#3d2000',
        },
        crimson: { 400: '#f43f5e', 500: '#e11d48', 600: '#be123c', 700: '#9f1239' },
        emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669' },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
