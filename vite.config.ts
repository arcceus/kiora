// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      // Let the plugin handle core globals and protocol imports
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
  ],

  // One safe global mapping for libraries that reference `global`
  define: {
    global: 'globalThis',
  },

  // Keep optimizeDeps minimal; force-prebundle only app-specific deps if needed
  optimizeDeps: {
    include: ['@ardrive/turbo-sdk/web'],
  },

  resolve: {
    alias: {
      // Start with no core-module aliases. Add only if a specific error persists:
      // 'stream': 'stream-browserify',
      // 'crypto': 'crypto-browserify',
      // 'buffer': 'buffer',
      // 'process': 'process/browser',
      // 'util': 'util',
      '@': '/src',
    },
  },
})
