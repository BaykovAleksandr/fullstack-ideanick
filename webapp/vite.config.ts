import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          exportType: 'named',
          ref: true,
          svgo: false,
          titleProp: true,
        },
        include: '**/*.svg',
      }),
    ],
    server: {
      port: +env.PORT,
    },
    preview: {
      port: +env.PORT,
    },
  };
});
