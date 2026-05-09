import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy forwards /api and /uploads to Express on port 5000
// If you change PORT in backend/.env, update the targets below too.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api':     { target: 'http://localhost:5007', changeOrigin: true, secure: false },
      '/uploads': { target: 'http://localhost:5007', changeOrigin: true, secure: false },
    },
  },
})
