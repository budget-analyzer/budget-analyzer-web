// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow Docker to access the dev server
    open: 'http://localhost:8080', // Open via NGINX gateway instead of direct dev server
  }
});