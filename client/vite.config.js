import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Important for Electron
  build: {
    outDir: 'dist', // Or adjust as needed
    emptyOutDir: true,
  },
  server: {
    host: '192.168.3.10', // <-- Your local IP
    port: 5173, // or any port you want
  }
})