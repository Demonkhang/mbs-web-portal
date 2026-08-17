import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mbs/types': path.resolve(__dirname, '../../packages/types/src'),
      '@mbs/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@mbs/validation': path.resolve(__dirname, '../../packages/validation/src'),
      '@mbs/security-utils': path.resolve(__dirname, '../../packages/security-utils/src'),
      '@mbs/database': path.resolve(__dirname, '../../packages/database/src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
