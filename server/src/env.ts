import dotenv from 'dotenv';
import path from 'node:path';

// 本機開發時 .env 在 repo 根目錄（server/src → ../../.env，build 後 server/dist → ../../.env）。
// 容器內無 .env、環境變數由 docker 提供，此時 config 找不到檔案會安靜略過。
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = Number(process.env.PORT) || 8080;

export const env = {
  PORT,
  APP_BASE_URL: process.env.APP_BASE_URL || `http://localhost:${PORT}`,
  DATABASE_URL: process.env.DATABASE_URL || '',
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev-insecure-secret-change-me',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
};

export const isHttps = env.APP_BASE_URL.startsWith('https://');
export const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
