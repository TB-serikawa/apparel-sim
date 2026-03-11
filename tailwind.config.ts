import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#38bdf8',
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'Urbanist', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
