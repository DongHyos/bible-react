import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Bible AI PWA',
        short_name: 'BibleAI',
        description: '성경 구절 검색, AI 해석, 설교 영상/내용 제공 PWA',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      'shared': path.resolve(__dirname, 'src/shared'),
      'desktop': path.resolve(__dirname, 'src/desktop'),
      'mobile': path.resolve(__dirname, 'src/mobile'),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    }
  }
})
