import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { env, googleConfigured, llmConfigured } from './env';
import { setupAuth } from './auth';
import { api } from './routes';
import { rooms } from './rooms';
import { seedCatalog } from './catalog';
import { startCron } from './cron';

const app = express();
app.use(express.json());

// 健康檢查（compose / tunnel / nginx 都用這支）
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'screenpact-server',
    googleConfigured,
    llmConfigured,
    time: new Date().toISOString(),
  });
});

// session + passport + 認證路由（/api/auth/google、/callback、/logout、/me）
setupAuth(app);

// 業務 API（上傳、解析、用量總覽、讀圖；房間/邀請/追蹤清單）— 需登入
app.use('/api', api);
app.use('/api', rooms);

// 正式環境：serve 前端建置產物（單一 origin）。
// 容器與本機 build 後相對位置一致：server/dist/index.js → ../../web/dist
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

// 啟動時 seed App 目錄（idempotent）
seedCatalog().catch((e) => console.error('[server] seedCatalog failed', e));

// 定時結算排程
startCron();

app.listen(env.PORT, () => {
  console.log(`[server] listening on http://localhost:${env.PORT}`);
  console.log(
    `[server] APP_BASE_URL=${env.APP_BASE_URL} · google=${googleConfigured ? 'configured' : 'MISSING'} · llm=${llmConfigured ? 'configured' : env.LLM_MOCK ? 'MOCK' : 'MISSING'}`,
  );
});
