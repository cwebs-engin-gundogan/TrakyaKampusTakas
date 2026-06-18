import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Dev sunucusu, tarayıcıdan gelen /api ve /ws-api isteklerini backend'e
// "server-side" olarak iletir. Bu sayede backend'de CORS olmasa bile
// tarayıcı engeli yemeden gerçek sunucuya bağlanabiliriz.
//
// VARSAYILAN: gerçek (canlı) sunucu — Cloudflare tüneli.
// Yerele dönmek için frontend/.env içine şunu yaz:
//   BACKEND_ORIGIN=http://localhost:8000
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendOrigin = env.BACKEND_ORIGIN || 'https://kampustakasnoktam.keserbaros.com';
  const wsOrigin = backendOrigin.replace(/^http/, 'ws'); // https->wss, http->ws

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon-48.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Trakya Kampüs Takas',
          short_name: 'KampüsTakas',
          description: 'Kampüs içi ikinci el alışveriş ve takas platformu',
          lang: 'tr',
          dir: 'ltr',
          theme_color: '#2563EB',
          background_color: '#F4F8FF',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          navigateFallback: '/index.html',
          // API/WS asla cache'lenmesin (taze veri + kimlik doğrulama)
          navigateFallbackDenylist: [/^\/api/, /^\/ws-api/],
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        },
        devOptions: { enabled: false },
      }),
    ],
    server: {
      port: 3001,
      proxy: {
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws-api': {
          target: wsOrigin,
          ws: true,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/ws-api/, ''),
        },
      },
    },
  };
});
