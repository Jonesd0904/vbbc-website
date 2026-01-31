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
          DEFAULT: '#0f2540',
          light: '#1a3a5c',
          dark: '#0a1a2e',
        },
        gold: {
          DEFAULT: '#c9a227',
          light: '#d4b54a',
          dark: '#a8871f',
        },
        cream: {
          DEFAULT: '#faf8f5',
          dark: '#f0ebe3',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        lora: ['Lora', 'serif'],
        trajan: ['"Trajan Pro"', 'Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
}
