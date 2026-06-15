import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 開發時前端跑在 5173，/api 代理到後端 8080；正式環境由後端 serve 建置產物。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8088',
    },
  },
});
