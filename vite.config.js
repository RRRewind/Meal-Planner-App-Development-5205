import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          framer: ['framer-motion'],
          icons: ['react-icons'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    // Optimize for mobile performance
    target: 'es2015',
    minify: 'esbuild', // Changed from 'terser' to 'esbuild' for better performance and no extra dependency
    // Remove terserOptions since we're using esbuild
  },
  // Optimize for mobile
  esbuild: {
    drop: ['console', 'debugger'],
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  },
  server: {
    force: true
  }
});