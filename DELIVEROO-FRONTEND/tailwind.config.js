/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14213D', fog: '#64748B', paper: '#F8F7F4',
        amber: { DEFAULT: '#F5A524', 500: '#F5A524', 600: '#DB8F14' },
        route: '#2563EB', depot: '#16A34A', caution: '#DC2626',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
