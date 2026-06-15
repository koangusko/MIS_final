import { Router } from 'express';
import { randomInt } from 'node:crypto';
import QRCode from 'qrcode';
import { prisma } from './prisma';
import { requireAuth } from './auth';
import { env } from './env';
import { DEFAULT_TRACKED_KEYS } from './catalog';
import type { Cycle } from '@prisma/client';

export const rooms = Router();

function uid(req: { user?: unknown }): string {
  return (req.user as { id: string }).id;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉易混字
function genToken(): string {
  let s = '';
  for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}
function expiry7d(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

async function inviteInfo(token: string, expiresAt: Date | null) {
  const url = `${env.APP_BASE_URL}/join/${token}`;
  const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 320, color: { dark: '#2b2823', light: '#fdfcf9' } });
  return { token, url, expiresAt, qrDataUrl };
}

const CAT_LABEL: Record<string, string> = { SOCIAL: '社交', SHORTVIDEO: '短影音', OTHER: '其他' };

// ── 建立房間 ──
rooms.post('/rooms', requireAuth, async (req, res) => {
  const { name, cycle, reportDeadline, description } = req.body ?? {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'name_required' });
    return;
  }
  const token = genToken();
  const room = await prisma.room.create({
    data: {
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : null,
      cycle: (cycle === 'WEEKLY' ? 'WEEKLY' : 'DAILY') as Cycle,
      reportDeadline: typeof reportDeadline === 'string' && /^\d{1,2}:\d{2}$/.test(reportDeadline) ? reportDeadline : '23:00',
      ownerId: uid(req),
      joinToken: token,
      joinTokenExpiresAt: expiry7d(),
      members: { create: { userId: uid(req), role: 'OWNER' } },
    },
  });
  // 預設追蹤社群＋短影音
  const defaults = await prisma.appCatalog.findMany({ where: { key: { in: DEFAULT_TRACKED_KEYS } } });
  if (defaults.length) {
    await prisma.trackedApp.createMany({ data: defaults.map((a) => ({ roomId: room.id, appId: a.id })) });
  }
  res.json({ id: room.id });
});

// ── 我的房間列表 ──
rooms.get('/rooms', requireAuth, async (req, res) => {
  const memberships = await prisma.roomMember.findMany({
    where: { userId: uid(req) },
    include: { room: { include: { _count: { select: { members: true } } } } },
    orderBy: { joinedAt: 'desc' },
  });
  res.json(
    memberships.map((m) => ({
      id: m.room.id,
      name: m.room.name,
      cycle: m.room.cycle,
      reportDeadline: m.room.reportDeadline,
      memberCount: m.room._count.members,
      role: m.role,
    })),
  );
});

// ── 用 token 預覽（加入前）── 必須放在 /rooms/:id 之前
rooms.get('/rooms/join/:token', requireAuth, async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { joinToken: req.params.token },
    include: { _count: { select: { members: true } }, trackedApps: { include: { app: true } } },
  });
  if (!room) {
    res.json({ valid: false });
    return;
  }
  if (room.joinTokenExpiresAt && room.joinTokenExpiresAt.getTime() < Date.now()) {
    res.json({ valid: false, expired: true, expiresAt: room.joinTokenExpiresAt });
    return;
  }
  const already = await prisma.roomMember.findUnique({ where: { roomId_userId: { roomId: room.id, userId: uid(req) } } });
  res.json({
    valid: true,
    alreadyMember: !!already,
    room: {
      id: room.id,
      name: room.name,
      description: room.description,
      cycle: room.cycle,
      reportDeadline: room.reportDeadline,
      memberCount: room._count.members,
      trackedApps: room.trackedApps.map((t) => ({ key: t.app.key, name: t.app.name, glyph: t.app.glyph, color: t.app.color, category: t.app.category })),
    },
  });
});

// ── 確認加入 ──
rooms.post('/rooms/join/:token', requireAuth, async (req, res) => {
  const room = await prisma.room.findUnique({ where: { joinToken: req.params.token } });
  if (!room) {
    res.status(404).json({ error: 'invalid_token' });
    return;
  }
  if (room.joinTokenExpiresAt && room.joinTokenExpiresAt.getTime() < Date.now()) {
    res.status(410).json({ error: 'expired' });
    return;
  }
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: room.id, userId: uid(req) } },
    update: {},
    create: { roomId: room.id, userId: uid(req), role: 'MEMBER' },
  });
  res.json({ roomId: room.id });
});

// ── 房間詳情 ──
rooms.get('/rooms/:id', requireAuth, async (req, res) => {
  const me = uid(req);
  const room = await prisma.room.findUnique({
    where: { id: req.params.id },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: 'asc' } },
      trackedApps: { include: { app: true } },
    },
  });
  if (!room) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  const myMember = room.members.find((m) => m.userId === me);
  if (!myMember) {
    res.status(403).json({ error: 'not_a_member' });
    return;
  }
  const isOwner = myMember.role === 'OWNER';
  res.json({
    id: room.id,
    name: room.name,
    description: room.description,
    cycle: room.cycle,
    reportDeadline: room.reportDeadline,
    role: myMember.role,
    members: room.members.map((m, i) => ({
      id: m.userId,
      name: m.user.name,
      initial: m.user.name.slice(0, 1),
      role: m.role,
      isMe: m.userId === me,
      idx: i,
    })),
    trackedApps: room.trackedApps.map((t) => ({
      key: t.app.key,
      name: t.app.name,
      glyph: t.app.glyph,
      color: t.app.color,
      category: t.app.category,
      dailyCapMin: t.dailyCapMin,
    })),
    invite: isOwner ? await inviteInfo(room.joinToken!, room.joinTokenExpiresAt) : undefined,
  });
});

// ── 重新產生邀請 ──
rooms.post('/rooms/:id/invite/regenerate', requireAuth, async (req, res) => {
  const room = await prisma.room.findUnique({ where: { id: req.params.id }, include: { members: true } });
  if (!room) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  if (!room.members.some((m) => m.userId === uid(req) && m.role === 'OWNER')) {
    res.status(403).json({ error: 'not_owner' });
    return;
  }
  const token = genToken();
  const expiresAt = expiry7d();
  await prisma.room.update({ where: { id: room.id }, data: { joinToken: token, joinTokenExpiresAt: expiresAt } });
  res.json({ invite: await inviteInfo(token, expiresAt) });
});

// ── App 目錄（分組）──
rooms.get('/catalog', requireAuth, async (_req, res) => {
  const apps = await prisma.appCatalog.findMany({ orderBy: { name: 'asc' } });
  const order = ['SOCIAL', 'SHORTVIDEO', 'OTHER'];
  const groups = order.map((cat) => ({
    category: cat,
    label: CAT_LABEL[cat],
    apps: apps.filter((a) => a.category === cat).map((a) => ({ key: a.key, name: a.name, glyph: a.glyph, color: a.color })),
  }));
  res.json({ groups });
});

// ── 設定追蹤清單（房主）──
rooms.put('/rooms/:id/tracked-apps', requireAuth, async (req, res) => {
  const room = await prisma.room.findUnique({ where: { id: req.params.id }, include: { members: true } });
  if (!room) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  if (!room.members.some((m) => m.userId === uid(req) && m.role === 'OWNER')) {
    res.status(403).json({ error: 'not_owner' });
    return;
  }
  const items: { key: string; dailyCapMin?: number }[] = Array.isArray(req.body?.apps) ? req.body.apps : [];
  const keys = items.map((i) => i.key);
  const catalog = await prisma.appCatalog.findMany({ where: { key: { in: keys } } });
  const byKey = new Map(catalog.map((a) => [a.key, a]));
  await prisma.$transaction([
    prisma.trackedApp.deleteMany({ where: { roomId: room.id } }),
    prisma.trackedApp.createMany({
      data: items
        .filter((i) => byKey.has(i.key))
        .map((i) => ({
          roomId: room.id,
          appId: byKey.get(i.key)!.id,
          dailyCapMin: typeof i.dailyCapMin === 'number' && i.dailyCapMin > 0 ? Math.round(i.dailyCapMin) : null,
        })),
    }),
  ]);
  res.json({ ok: true, count: keys.length });
});
