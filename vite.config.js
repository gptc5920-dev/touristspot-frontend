import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Django collects the production bundle under /static/. Keeping the normal
  // root base for development preserves Vite's local server behaviour.
  base: mode === 'django' ? '/static/' : '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@fortawesome/')) {
            return 'fontawesome'
          }
        },
      },
    },
  },
  server: {
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/media': 'http://127.0.0.1:8000',
    },
  },
}))
