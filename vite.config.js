import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = (env.VITE_API_ROOT || env.VITE_API_URL?.replace(/\/api\/?$/, '') || '').replace(/\/+$/, '');

  return {
    plugins: [
      tailwindcss(),
    ],
    server: apiProxyTarget ? {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    } : undefined,
  };
})
