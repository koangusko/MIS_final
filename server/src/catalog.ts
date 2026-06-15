import { prisma } from './prisma';
import type { AppCategory } from '@prisma/client';

// 預設 App 目錄（glyph 對應前端 icon set）。
export const CATALOG_SEED: { key: string; name: string; category: AppCategory; glyph: string; color: string }[] = [
  { key: 'instagram', name: 'Instagram', category: 'SOCIAL', glyph: 'camera', color: '#a8728c' },
  { key: 'threads', name: 'Threads', category: 'SOCIAL', glyph: 'hourglass', color: '#5d6b73' },
  { key: 'facebook', name: 'Facebook', category: 'SOCIAL', glyph: 'room', color: '#6d7fa3' },
  { key: 'x', name: 'X / Twitter', category: 'SOCIAL', glyph: 'hourglass', color: '#7a7f86' },
  { key: 'dcard', name: 'Dcard', category: 'SOCIAL', glyph: 'room', color: '#5b5f9e' },
  { key: 'tiktok', name: 'TikTok', category: 'SHORTVIDEO', glyph: 'flame', color: '#2b2823' },
  { key: 'rednote', name: '小紅書', category: 'SHORTVIDEO', glyph: 'camera', color: '#bd7150' },
  { key: 'reels', name: 'Reels', category: 'SHORTVIDEO', glyph: 'flame', color: '#a07e8a' },
  { key: 'youtube', name: 'YouTube', category: 'OTHER', glyph: 'image', color: '#b06a5a' },
  { key: 'spotify', name: '串流音樂', category: 'OTHER', glyph: 'chart', color: '#94937f' },
];

// 建立房間時預設追蹤這些（社群＋短影音）
export const DEFAULT_TRACKED_KEYS = ['instagram', 'threads', 'tiktok', 'youtube'];

// 截圖中可能出現的 App 名稱別名 → 目錄 key（用來把 LLM 讀到的名稱對到追蹤清單）
const ALIASES: Record<string, string[]> = {
  instagram: ['instagram', 'ig', 'insta', 'インスタ'],
  threads: ['threads', '脆'],
  facebook: ['facebook', 'fb', '臉書', 'meta'],
  x: ['x', 'twitter', '推特'],
  dcard: ['dcard'],
  tiktok: ['tiktok', '抖音', 'douyin'],
  rednote: ['小紅書', '小红书', 'rednote', 'xiaohongshu'],
  reels: ['reels'],
  youtube: ['youtube', 'yt'],
  spotify: ['spotify', '串流音樂', 'kkbox', 'applemusic', 'soundon', 'podcast'],
};

const normStr = (s: string) => s.toLowerCase().replace(/\s+/g, '');

// 把截圖讀到的 App 名稱解析成目錄 key（對不上回 null）
export function matchAppKey(label: string): string | null {
  const n = normStr(label);
  if (!n) return null;
  for (const [key, aliases] of Object.entries(ALIASES)) {
    for (const a of aliases) {
      const na = normStr(a);
      // 短別名（≤2 字，如 x/ig/yt/fb）需完全相等，避免誤判
      if (na.length <= 2 ? n === na : n === na || n.includes(na) || na.includes(n)) return key;
    }
  }
  return null;
}

// 啟動時若目錄為空就 seed（idempotent）
export async function seedCatalog(): Promise<void> {
  for (const a of CATALOG_SEED) {
    await prisma.appCatalog.upsert({
      where: { key: a.key },
      update: { name: a.name, category: a.category, glyph: a.glyph, color: a.color },
      create: a,
    });
  }
}
