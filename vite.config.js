import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(root, 'src') }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        bureau: resolve(root, 'bureau.html'),
        detective: resolve(root, 'detective.html')
      }
    }
  }
});