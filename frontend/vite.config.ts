import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 2000, // increase from default 500 KB to 2 MB
  },
  server: {
    proxy: {
      // anything starting with /api goes to your backend
      '/api': {
        target: 'http://localhost:5000', // <-- your backend port
        changeOrigin: true,
      },
    },
  },
});
