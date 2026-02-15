import { VitePWA } from 'vite-plugin-pwa'
import type { Plugin } from 'vite'

export function pwaPlugin(): Plugin {
  return VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['**/*.{png,webp,svg,ico,woff,woff2,ttf,eot}'],
    manifest: {
      name: 'Football Miracle 11',
      short_name: 'Football 11',
      description: 'Lightweight strategy football card battle game',
      theme_color: '#1a1a2e',
      background_color: '#1a1a2e',
      display: 'standalone',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,webp,svg,woff,woff2,ttf,eot}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.+\.(?:png|webp|jpg|jpeg|svg|gif)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30
            }
          }
        },
        {
          urlPattern: /^https:\/\/.+\.(?:js|css)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-resources-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7
            }
          }
        }
      ]
    }
  })
}
