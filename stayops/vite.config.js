// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Toggle between local and ngrok backend
// Set USE_LOCAL to true for localhost:8080, false for ngrok
const USE_LOCAL = true;

const API_TARGETS = {
  local: 'http://localhost:8080',
  ngrok: 'https://nonprotuberant-nonprojective-son.ngrok-free.dev'
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Expose dev server on LAN (0.0.0.0)
    port: 5173,
    proxy: {
      '/api': {
        target: USE_LOCAL ? API_TARGETS.local : API_TARGETS.ngrok,
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    host: true, // Expose preview server on LAN as well
    port: 4173
  }
})
// export const API_BASE_URL = ''; // Empty string - uses same origin
// 
// This way, requests to /api/* will be automatically proxied to http://localhost:8080/api/*
// and you won't need CORS configuration in Spring Boot for development