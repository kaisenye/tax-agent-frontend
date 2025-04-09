import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // Listen on all network interfaces (equivalent to 0.0.0.0)
    port: 5173, // Change this to a different port (5173 is Vite's default)
  },
  plugins: [react()],
  // Add optimizeDeps to include axios for better bundling
  optimizeDeps: {
    include: ['axios']
  },
})