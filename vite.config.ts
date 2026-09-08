import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// ローカル開発時に Netlify Functions を Vite 内部で直接実行するプラグイン
function localNetlifyFunctionsPlugin(): Plugin {
  return {
    name: 'local-netlify-functions',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) {
          return next();
        }

        const urlObj = new URL(url, `http://${req.headers.host || 'localhost'}`);
        const endpoint = urlObj.pathname.replace(/^\/api\//, '');

        const functionFileMap: Record<string, string> = {
          'photo-random': './netlify/functions/photo-random.ts',
          'photo-collection': './netlify/functions/photo-collection.ts',
          'collections': './netlify/functions/collections.ts',
          'track-download': './netlify/functions/track-download.ts',
        };

        const targetFile = functionFileMap[endpoint];
        if (!targetFile) {
          return next();
        }

        try {
          const mod = await server.ssrLoadModule(targetFile);
          const handler = mod.default;

          let body: any = null;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks: any[] = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            body = Buffer.concat(chunks);
          }

          const webReq = new Request(urlObj.href, {
            method: req.method,
            headers: req.headers as any,
            body: body ? body : undefined,
          });

          const webRes: Response = await handler(webReq);

          res.statusCode = webRes.status;
          webRes.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });

          const resBuffer = await webRes.arrayBuffer();
          res.end(Buffer.from(resBuffer));
        } catch (error) {
          console.error(`[local-functions] Error executing ${endpoint}:`, error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(error) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // .env ファイルの環境変数を process.env にマージ
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      localNetlifyFunctionsPlugin(),
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
  };
});
