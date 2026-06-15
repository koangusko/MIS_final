import crypto from 'node:crypto';
import { env } from './env';

// 驗 LINE webhook 簽章：base64(HMAC-SHA256(channelSecret, rawBody)) === X-Line-Signature
export function verifyLineSignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!env.LINE_CHANNEL_SECRET || !signature || !rawBody) return false;
  const expected = crypto.createHmac('sha256', env.LINE_CHANNEL_SECRET).update(rawBody).digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// 回覆（webhook 內用 replyToken）
export async function lineReply(replyToken: string, text: string): Promise<void> {
  if (!env.LINE_CHANNEL_ACCESS_TOKEN) return;
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
    body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] }),
  }).catch((e) => console.error('[line] reply failed', (e as Error).message));
}

// 主動推播給多位已綁定使用者（逐一 push）
export async function linePush(lineUserIds: string[], text: string): Promise<void> {
  if (!env.LINE_CHANNEL_ACCESS_TOKEN || lineUserIds.length === 0) return;
  await Promise.all(
    lineUserIds.map((to) =>
      fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}` },
        body: JSON.stringify({ to, messages: [{ type: 'text', text }] }),
      }).catch((e) => console.error('[line] push failed', (e as Error).message)),
    ),
  );
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function genBindingCode(): string {
  let s = '';
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  return `SP-${s}`;
}
