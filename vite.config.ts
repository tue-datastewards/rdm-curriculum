import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves project sites from /<repo-name>/. The deployment
// workflow sets BASE_PATH automatically. Local builds default to "/" so that
// `npm run preview` works out of the box.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? base : '/',
  plugins: [react(), tailwindcss()],
}))
