import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // Listen on all network interfaces (equivalent to 0.0.0.0)
    port: 5173, // Change this to a different port (5173 is Vite's default)
    proxy: {
      '/api': {
        target: 'http://172.16.37.25:5001',
        changeOrigin: true,
        secure: false,
        timeout: 60000, // Increased timeout for large file uploads
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying API request:', req.method, req.url, '→', `http://127.0.0.1:5000/${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received API response:', req.method, req.url, proxyRes.statusCode);
          });
        }
      }
    }
  },
  plugins: [react()],
  // Add optimizeDeps to include axios for better bundling
  optimizeDeps: {
    include: ['axios']
  },
})
