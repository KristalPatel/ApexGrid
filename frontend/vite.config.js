import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When the backend is ready, requests to /api go to Express on port 5000.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:5000' },
  },
})
