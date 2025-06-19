import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://tender-api.bravesmoke-248b9fb5.westeurope.azurecontainerapps.io',
        changeOrigin: true,
        secure: true
      }
    }
  }
}) 