import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/ask': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api/search': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/api/v1/auth': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/api/v1/auth/mfa': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      }
    }
  }
})
