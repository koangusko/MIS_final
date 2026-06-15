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
