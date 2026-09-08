import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import netlify from '@netlify/vite-plugin';

// /api/* のリクエストをローカルの /.netlify/functions/* に内部転送するプラグイン
function apiRewritePlugin(): Plugin {
  return {
    name: 'api-rewrite-plugin',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          req.url = req.url.replace(/^\/api\//, '/.netlify/functions/');
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    netlify(),
    apiRewritePlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'img/icons/*.png'],
      manifest: {
        name: 'PhotoClock',
        short_name: 'PhotoClock',
        description: 'A minimalist digital clock with dynamic Unsplash wallpapers',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: 'img/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'img/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
