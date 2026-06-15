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
  const forDate = taipeiDayStartUtc(forDateStr);

  // 昨天：已成功上傳過就鎖定，不可再傳
  if (kind === 'YESTERDAY') {
    const locked = await prisma.submission.findFirst({ where: { userId: uid, kind: 'YESTERDAY', forDate, status: 'PARSED' } });
    if (locked) {
      return { kind, status: 'LOCKED' as const, totalMinutes: locked.totalMin, message: '昨天的數據已上傳並鎖定，不能再更改' };
    }
  }

  // 先解析（用 buffer，不必先落地）
  const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const result = await parseScreenshot(dataUrl);

  // 今天：可重複覆蓋，但時數只能變多不能變少
  if (result.ok && kind === 'TODAY') {
    const prev = await prisma.submission.findFirst({ where: { userId: uid, kind: 'TODAY', forDate, status: 'PARSED' }, orderBy: { totalMin: 'desc' } });
    if (prev?.totalMin != null && (result.totalMinutes ?? 0) < prev.totalMin) {
      return { kind, status: 'REJECTED_DECREASE' as const, totalMinutes: result.totalMinutes, previous: prev.totalMin, message: `今天的時數只會增加；目前已記錄 ${prev.totalMin} 分，這張較少不採用` };
    }
  }

  // 落地存檔
  const ext = EXT[file.mimetype] ?? '.img';
  const dir = path.join(env.UPLOAD_DIR, uid);
  fs.mkdirSync(dir, { recursive: true });
  const id = randomUUID();
  const filePath = path.join(dir, `${id}${ext}`);
  fs.writeFileSync(filePath, file.buffer);

  if (!result.ok) {
    await prisma.submission.create({ data: { id, userId: uid, kind, forDate, imagePath: filePath, status: 'NEED_REUPLOAD' } });
    return { submissionId: id, kind, status: 'NEED_REUPLOAD' as const, reason: result.reason ?? 'parse_failed', imageUrl: `/api/submissions/${id}/image` };
  }

  await prisma.$transaction([
    prisma.submission.create({ data: { id, userId: uid, kind, forDate, imagePath: filePath, status: 'PARSED', totalMin: result.totalMinutes ?? null } }),
    prisma.extractedUsage.createMany({ data: result.apps.map((a) => ({ submissionId: id, appLabel: a.label, minutes: a.minutes })) }),
  ]);

  return {
    submissionId: id, kind, status: 'PARSED' as const,
    date: result.date, totalMinutes: result.totalMinutes, apps: result.apps,
    imageUrl: `/api/submissions/${id}/image`,
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

// 上傳狀態：昨天是否已鎖定、今天目前記錄
api.get('/submissions/status', requireAuth, async (req, res) => {
  const uid = userId(req);
  const [yLocked, tPrev] = await Promise.all([
    prisma.submission.findFirst({ where: { userId: uid, kind: 'YESTERDAY', forDate: taipeiDayStartUtc(yesterdayTaipei()), status: 'PARSED' } }),
    prisma.submission.findFirst({ where: { userId: uid, kind: 'TODAY', forDate: taipeiDayStartUtc(todayTaipei()), status: 'PARSED' }, orderBy: { totalMin: 'desc' } }),
  ]);
  res.json({
    yesterday: { locked: !!yLocked, totalMin: yLocked?.totalMin ?? null },
    today: { totalMin: tPrev?.totalMin ?? null },
  });
});

// 通知中心：使用者所有房間的近期系統公告
api.get('/notifications', requireAuth, async (req, res) => {
  const uid = userId(req);
  const memberships = await prisma.roomMember.findMany({ where: { userId: uid }, select: { roomId: true } });
  const roomIds = memberships.map((m) => m.roomId);
  if (roomIds.length === 0) {
    res.json({ items: [] });
    return;
  }
  const msgs = await prisma.chatMessage.findMany({
    where: { roomId: { in: roomIds }, kind: 'SYSTEM' },
    include: { room: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 40,
  });
  res.json({ items: msgs.map((m) => ({ id: m.id, roomId: m.room.id, room: m.room.name, body: m.body, createdAt: m.createdAt })) });
});

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
