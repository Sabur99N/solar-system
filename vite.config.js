import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  server: {
    open: false,
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
  // Project `/static` assets are copied into `public/static` for Vite serving
});
