// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Configuration for Budget Analyzer Web
 *
 * Development flow:
 * 1. Vite dev server runs on port 3000 (hot reload)
 * 2. Session Gateway (8081) proxies frontend requests to NGINX (8080)
 * 3. NGINX (8080) proxies frontend requests to Vite (3000)
 * 4. Browser accesses app via http://localhost:8081
 *
 * All API requests go through Session Gateway → NGINX → Backend services
 * All frontend requests go through Session Gateway → NGINX → Vite
 *
 * Production:
 * - Vite builds static files to dist/
 * - NGINX serves static files directly
 * - Session Gateway proxies to NGINX
 */
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
    allowedHosts: true, // Allow all hosts (needed for Docker/NGINX proxy access)
    // Note: In dev, access the app via http://localhost:8081 (Session Gateway)
    // not http://localhost:3000 (Vite dev server directly)
  },
});