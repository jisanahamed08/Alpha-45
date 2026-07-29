import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          lucide: ['lucide'],
        }
      }
    }
  },
  server: {
    port: 3000,
    open: false,
    host: true,
  },
});
