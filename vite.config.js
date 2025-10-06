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
  },
  // ⚡ OPTIMISATIONS AJOUTÉES
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['react-icons'],
          utils: ['axios']
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  // Pré-chargement des assets
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})