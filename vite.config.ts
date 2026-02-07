import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa' // Disabled - no benefit for online-only app
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA DISABLED - causes aggressive caching issues, no benefit for online-only app
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   ...
    // }),

    // Bundle analyzer (only in analyze mode)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  build: {
    // Optimize build
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.logs for debugging (TODO: re-enable for production)
        drop_debugger: true
      }
    },

    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/storage', 'firebase/auth'],
          'canvas-vendor': ['konva', 'react-konva', 'use-image'],
          'ui-vendor': ['framer-motion', 'lucide-react', '@headlessui/react']
        }
      }
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  }
})
