import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const projectRoot = dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    resolve(projectRoot, 'index.html'),
    resolve(projectRoot, 'src/**/*.{js,jsx}'),
    resolve(projectRoot, 'pages/**/*.{js,jsx}'),
    resolve(projectRoot, 'features/**/*.{js,jsx}'),
  ],
  theme: {
    extend: {
      colors: { ink: '#14213D', fog: '#64748B', paper: '#F8F7F4', amber: '#F5A524', route: '#2563EB', depot: '#16A34A', caution: '#DC2626' },
      fontFamily: { display: ['Space Grotesk', 'sans-serif'], sans: ['Inter', 'sans-serif'], mono: ['IBM Plex Mono', 'monospace'] },
    },
  },
  plugins: [],
}
