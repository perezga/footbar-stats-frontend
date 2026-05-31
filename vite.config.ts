import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Defaults to the local backend; in Docker it points at the backend container
// over the shared network (e.g. https://backend:4000).
const proxyTarget = process.env.VITE_PROXY_TARGET ?? 'https://localhost:4000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: false,
        secure: false,
      },
      '/auth': {
        target: proxyTarget,
        changeOrigin: false,
        secure: false,
      },
    },
  },
});
