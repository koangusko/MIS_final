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
  // 多模態 LLM（OpenCode，OpenAI 相容）
  OPENCODE_API_KEY: process.env.OPENCODE_API_KEY || '',
  OPENCODE_BASE_URL: (process.env.OPENCODE_BASE_URL || '').replace(/\/+$/, ''),
  LLM_MODEL: process.env.LLM_MODEL || '',
  // 開發用：未接真 LLM 時回傳假解析，方便先測整條流程
  LLM_MOCK: process.env.LLM_MOCK === '1' || process.env.LLM_MOCK === 'true',
  // LINE Messaging API
  LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET || '',
  LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  // 截圖儲存目錄
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../data/uploads'),
  TZ: process.env.TZ || 'Asia/Taipei',
};

export const isHttps = env.APP_BASE_URL.startsWith('https://');
export const googleConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
export const llmConfigured = Boolean(env.OPENCODE_API_KEY && env.OPENCODE_BASE_URL && env.LLM_MODEL);
export const lineConfigured = Boolean(env.LINE_CHANNEL_SECRET && env.LINE_CHANNEL_ACCESS_TOKEN);
