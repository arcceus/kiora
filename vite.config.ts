import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Add this define section
  define: {
    global: 'globalThis',
    'process.env': '{}',
  },
  
  // Add this optimizeDeps section
  optimizeDeps: {
    include: ['process', 'buffer', 'util'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      process: 'process/browser',
      buffer: 'buffer',
      util: 'util',
    },
  },
})
