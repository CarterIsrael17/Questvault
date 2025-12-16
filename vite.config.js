// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Disable source maps in production
  },
  server: {
    sourcemap: false, // Optional: disable in dev server
  },
});
