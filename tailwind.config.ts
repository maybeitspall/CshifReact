import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Tailwind dipakai sebagai pelengkap; design token utama ada di styles/tokens.css
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
