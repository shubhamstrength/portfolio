import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works from any host path (GitHub Pages, Netlify, a subfolder).
  base: './',
  plugins: [react()],
})
