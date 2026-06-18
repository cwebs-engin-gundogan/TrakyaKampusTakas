import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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
    plugins: [react()],
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
