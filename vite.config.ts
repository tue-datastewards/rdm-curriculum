import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages project sites are served from /<repo-name>/. The deployment
// workflow sets BASE_PATH. Local builds default to "/" so that
// `npm run preview` works out of the box.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? base : '/',
  plugins: [react(), tailwindcss()],
  build: {
    // A single bundle is intentional: releasing a new deploy removes the old
    // hashed chunks, so lazy routes could 404 for readers with an open tab.
    chunkSizeWarningLimit: 700,
  },
}))
