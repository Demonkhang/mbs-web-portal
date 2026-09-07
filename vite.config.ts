import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    root: path.resolve(__dirname, './apps/web'),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './apps/web/src'),
        '@mbs/types': path.resolve(__dirname, './packages/types/src'),
        '@mbs/ui': path.resolve(__dirname, './packages/ui/src'),
        '@mbs/validation': path.resolve(__dirname, './packages/validation/src'),
        '@mbs/security-utils': path.resolve(__dirname, './packages/security-utils/src'),
        '@mbs/database': path.resolve(__dirname, './packages/database/src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
  };
});
