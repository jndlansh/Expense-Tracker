// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

// __dirname shim for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pathSrc = resolve(__dirname, 'src');

export default defineConfig(({ mode }) => {
  // load environment variables (from .env.development or .env.production)
  const env = loadEnv(mode, __dirname, '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': pathSrc,
        '@components': resolve(pathSrc, 'components'),
        '@pages': resolve(pathSrc, 'pages'),
        '@hooks': resolve(pathSrc, 'hooks'),
        '@contexts': resolve(pathSrc, 'contexts'),
        '@services': resolve(pathSrc, 'services'),
        '@utils': resolve(pathSrc, 'utils'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
