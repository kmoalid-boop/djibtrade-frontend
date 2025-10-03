import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    allowedHosts: [
      '.ngrok.io',
      '.ngrok-free.app',
      '.loca.lt',
      'localhost'
    ],
    cors: true,
    origin: 'http://localhost:5173'
  }
})