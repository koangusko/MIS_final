import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { prisma } from './prisma';
import { requireAuth } from './auth';
import { env } from './env';
import { parseScreenshot } from './llm';
import { todayTaipei, yesterdayTaipei, taipeiDayStartUtc, lastNDaysTaipei, taipeiDateStr } from './time';
import type { SubmissionKind } from '@prisma/client';

export const api = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'));
  },
});

const EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif',
};

function userId(req: { user?: unknown }): string {
  return (req.user as { id: string }).id;
}

async function handleOne(uid: string, kind: SubmissionKind, file: Express.Multer.File) {
  const forDateStr = kind === 'YESTERDAY' ? yesterdayTaipei() : todayTaipei();
  const ext = EXT[file.mimetype] ?? '.img';
  const dir = path.join(env.UPLOAD_DIR, uid);
  fs.mkdirSync(dir, { recursive: true });
  const id = randomUUID();
  const filePath = path.join(dir, `${id}${ext}`);
  fs.writeFileSync(filePath, file.buffer);

  const submission = await prisma.submission.create({
    data: { id, userId: uid, kind, forDate: taipeiDayStartUtc(forDateStr), imagePath: filePath, status: 'PENDING' },
  });

  const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const result = await parseScreenshot(dataUrl);

  if (!result.ok) {
    await prisma.submission.update({ where: { id: submission.id }, data: { status: 'NEED_REUPLOAD' } });
    return {
      submissionId: submission.id,
      kind,
      status: 'NEED_REUPLOAD' as const,
      reason: result.reason ?? 'parse_failed',
      imageUrl: `/api/submissions/${submission.id}/image`,
    };
  }

  await prisma.$transaction([
    prisma.submission.update({
      where: { id: submission.id },
      data: { status: 'PARSED', totalMin: result.totalMinutes ?? null },
    }),
    prisma.extractedUsage.createMany({
      data: result.apps.map((a) => ({ submissionId: submission.id, appLabel: a.label, minutes: a.minutes })),
    }),
  ]);

  return {
    submissionId: submission.id,
    kind,
    status: 'PARSED' as const,
    date: result.date,
    totalMinutes: result.totalMinutes,
    apps: result.apps,
    imageUrl: `/api/submissions/${submission.id}/image`,
  };
}

// 上傳「昨天完整」「今天打卡」兩張（至少一張），解析後存 DB
api.post(
  '/submissions',
  requireAuth,
  upload.fields([
    { name: 'yesterday', maxCount: 1 },
    { name: 'today', maxCount: 1 },
  ]),
  async (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const y = files?.yesterday?.[0];
    const t = files?.today?.[0];
    if (!y && !t) {
      res.status(400).json({ error: 'no_files', message: '請至少上傳一張截圖' });
      return;
    }
    try {
      const uid = userId(req);
      const results: Record<string, unknown> = {};
      if (y) results.yesterday = await handleOne(uid, 'YESTERDAY', y);
      if (t) results.today = await handleOne(uid, 'TODAY', t);
      res.json({ results });
    } catch (err) {
      console.error('[submissions] error', err);
      res.status(500).json({ error: 'server_error' });
    }
  },
);

// 安全讀圖：僅本人可存取
api.get('/submissions/:id/image', requireAuth, async (req, res) => {
  const sub = await prisma.submission.findUnique({ where: { id: req.params.id } });
  if (!sub || sub.userId !== userId(req)) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  if (!fs.existsSync(sub.imagePath)) {
    res.status(404).json({ error: 'file_missing' });
    return;
  }
  const ext = path.extname(sub.imagePath).toLowerCase();
  const ct =
    ext === '.png' ? 'image/png'
    : ext === '.jpg' ? 'image/jpeg'
    : ext === '.webp' ? 'image/webp'
    : ext === '.heic' ? 'image/heic'
    : 'application/octet-stream';
  res.setHeader('Content-Type', ct);
  res.setHeader('Cache-Control', 'private, max-age=0, no-store');
  fs.createReadStream(sub.imagePath).pipe(res);
});

// 個人總覽資料（今日 + 近 7 天），吃真實解析結果
api.get('/usage/summary', requireAuth, async (req, res) => {
  const uid = userId(req);
  const days = lastNDaysTaipei(7);
  const since = taipeiDayStartUtc(days[0]);

  const subs = await prisma.submission.findMany({
    where: { userId: uid, status: 'PARSED', forDate: { gte: since } },
    include: { usages: true },
    orderBy: { createdAt: 'asc' },
  });

  // 每個台北日期取「最新」一筆已解析的 submission
  const byDate = new Map<string, (typeof subs)[number]>();
  for (const s of subs) byDate.set(taipeiDateStr(s.forDate), s);

  const todayStr = todayTaipei();
  const todaySub = byDate.get(todayStr) ?? null;

  const week = days.map((d) => ({ date: d, minutes: byDate.get(d)?.totalMin ?? 0 }));

  const today = todaySub
    ? {
        date: todayStr,
        totalMinutes: todaySub.totalMin ?? 0,
        apps: todaySub.usages
          .map((u) => ({ label: u.appLabel, minutes: u.minutes }))
          .sort((a, b) => b.minutes - a.minutes),
      }
    : null;

  res.json({ hasData: subs.length > 0, today, week });
});
