/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    // Stable values so src/lib/supabase.js's env guard passes in CI without a
    // real .env.local. The Supabase client itself is mocked in the tests.
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          recharts: ['recharts'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    // Allow ephemeral tunnel hostnames (cloudflared / ngrok) for mobile PWA testing.
    // Leading dot matches any subdomain, so it survives the URL changing each run.
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok.io'],
  },
})
