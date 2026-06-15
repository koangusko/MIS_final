import express from 'express';
import path from 'node:path';
import fs from 'node:fs';

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.use(express.json());

// 健康檢查（compose / tunnel / nginx 都用這支）
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'screenpact-server',
    time: new Date().toISOString(),
  });
});

// 正式環境：serve 前端建置產物（單一 origin）。
// 容器與本機 build 後的相對位置一致：server/dist/index.js → ../../web/dist
const webDist = path.resolve(__dirname, '../../web/dist');
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  // SPA fallback：非 /api 路徑一律回 index.html
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(webDist, 'index.html'));
  });
} else {
  console.warn(`[server] web build not found at ${webDist}（dev 模式請另跑 web 的 vite）`);
}

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
