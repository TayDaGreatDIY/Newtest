import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Helper to normalize paths with base
const normalizePath = (path: string): string => path.replace(/\/+/g, '/');

// https://vite.dev/config/
export default defineConfig(() => {
  const base = process.env.GITHUB_ACTIONS ? '/Newtest/' : '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'M2DG',
          short_name: 'M2DG',
          description: 'Next Gen Sports Experience - Mobile First PWA',
          theme_color: '#000000',
          background_color: '#000000',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
          icons: [
            { 
              src: normalizePath(`${base}pwa-192x192.svg`), 
              sizes: '192x192', 
              type: 'image/svg+xml' 
            },
            { 
              src: normalizePath(`${base}pwa-512x512.svg`), 
              sizes: '512x512', 
              type: 'image/svg+xml' 
            },
            {
              src: normalizePath(`${base}pwa-maskable-512x512.svg`),
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          navigateFallback: normalizePath(`${base}index.html`),
          navigateFallbackDenylist: [/^\/api/],
          cleanupOutdatedCaches: true,
        },
      }),
    ],
  }
})
