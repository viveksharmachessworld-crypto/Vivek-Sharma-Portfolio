import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3000' } },
  build: {
    rollupOptions: {
      input: {
        home: resolve(root, 'index.html'),
        gujaratAchievement: resolve(root, 'achievements/gujarat-open-2026/index.html'),
        mandloiGame: resolve(root, 'games/vivek-sharma-vs-mukesh-mandloi/index.html'),
      },
    },
  },
});
