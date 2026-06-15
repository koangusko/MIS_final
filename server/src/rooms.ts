import { Router } from 'express';
import { randomInt } from 'node:crypto';
import QRCode from 'qrcode';
import { prisma } from './prisma';
import { requireAuth } from './auth';
import { env } from './env';
import { DEFAULT_TRACKED_KEYS } from './catalog';
import { announce } from './announce';
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
  const existing = await prisma.roomMember.findUnique({ where: { roomId_userId: { roomId: room.id, userId: uid(req) } } });
  if (!existing) {
    await prisma.roomMember.create({ data: { roomId: room.id, userId: uid(req), role: 'MEMBER' } });
    const u = await prisma.user.findUnique({ where: { id: uid(req) } });
    await announce(room.id, `${u?.name ?? '新成員'} 加入了房間。`);
  }
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
    totalCapMin: room.totalCapMin,
    penaltyText: room.penaltyText,
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
  await announce(room.id, `追蹤清單已更新（追蹤 ${keys.length} 個 App）。`);
  res.json({ ok: true, count: keys.length });
});

// ── 設定規則：總上限 + 懲罰文字（房主）──
rooms.put('/rooms/:id/rules', requireAuth, async (req, res) => {
  const room = await prisma.room.findUnique({ where: { id: req.params.id }, include: { members: true } });
  if (!room) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  if (!room.members.some((m) => m.userId === uid(req) && m.role === 'OWNER')) {
    res.status(403).json({ error: 'not_owner' });
    return;
  }
  const { totalCapMin, penaltyText } = req.body ?? {};
  await prisma.room.update({
    where: { id: room.id },
    data: {
      totalCapMin: typeof totalCapMin === 'number' && totalCapMin > 0 ? Math.round(totalCapMin) : null,
      penaltyText: typeof penaltyText === 'string' ? penaltyText.trim() || null : null,
    },
  });
  await announce(room.id, '房間規則已更新（合計上限／懲罰）。');
  res.json({ ok: true });
});

// ── 最近一期結算結果 ──
rooms.get('/rooms/:id/settlement', requireAuth, async (req, res) => {
  const room = await prisma.room.findUnique({ where: { id: req.params.id }, include: { members: true } });
  if (!room || !room.members.some((m) => m.userId === uid(req))) {
    res.status(room ? 403 : 404).json({ error: room ? 'not_a_member' : 'not_found' });
    return;
  }
  const latest = await prisma.settlementResult.findFirst({ where: { roomId: room.id }, orderBy: { periodStart: 'desc' } });
  if (!latest) {
    res.json({ hasResult: false });
    return;
  }
  const rows = await prisma.settlementResult.findMany({
    where: { roomId: room.id, periodStart: latest.periodStart },
    include: { user: true },
    orderBy: [{ passed: 'desc' }, { totalMin: 'asc' }],
  });
  const passedCount = rows.filter((r) => r.passed).length;
  const overRows = rows.filter((r) => !r.passed);
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.totalMin, 0) / rows.length) : 0;
  res.json({
    hasResult: true,
    period: { start: latest.periodStart, end: latest.periodEnd },
    cycle: room.cycle,
    capMin: latest.capMin,
    summary: { passed: passedCount, failed: overRows.length, avg, total: rows.length },
    members: rows.map((r, i) => ({
      userId: r.userId,
      name: r.user.name,
      initial: r.user.name.slice(0, 1),
      isMe: r.userId === uid(req),
      rank: i + 1,
      totalMin: r.totalMin,
      overMin: r.overMin,
      passed: r.passed,
      reported: !(r.overMin === 0 && !r.passed), // over=0 且未過 → 未回報
      penaltyText: r.penaltyText,
    })),
  });
});

// ── 發起提案（成員）──
rooms.post('/rooms/:id/proposals', requireAuth, async (req, res) => {
  const me = uid(req);
  const member = await prisma.roomMember.findUnique({ where: { roomId_userId: { roomId: req.params.id, userId: me } } });
  if (!member) {
    res.status(403).json({ error: 'not_a_member' });
    return;
  }
  const { kind, newCapMin, newPenaltyText } = req.body ?? {};
  let title: string;
  const data: { kind: 'CHANGE_CAP' | 'CHANGE_PENALTY'; newCapMin?: number; newPenaltyText?: string } = { kind };
  if (kind === 'CHANGE_CAP') {
    if (typeof newCapMin !== 'number' || newCapMin <= 0) { res.status(400).json({ error: 'bad_cap' }); return; }
    data.newCapMin = Math.round(newCapMin);
    title = `合計上限改為 ${data.newCapMin} 分？`;
  } else if (kind === 'CHANGE_PENALTY') {
    if (typeof newPenaltyText !== 'string' || !newPenaltyText.trim()) { res.status(400).json({ error: 'bad_penalty' }); return; }
    data.newPenaltyText = newPenaltyText.trim();
    title = `超標懲罰改為「${data.newPenaltyText}」？`;
  } else {
    res.status(400).json({ error: 'bad_kind' });
    return;
  }
  const p = await prisma.proposal.create({
    data: { roomId: req.params.id, creatorId: me, kind: data.kind, title, newCapMin: data.newCapMin, newPenaltyText: data.newPenaltyText, closesAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
  });
  await announce(req.params.id, `有新提案要投票：${title}`);
  res.json({ id: p.id });
});

// ── 提案列表（成員）──
rooms.get('/rooms/:id/proposals', requireAuth, async (req, res) => {
  const me = uid(req);
  const room = await prisma.room.findUnique({ where: { id: req.params.id }, include: { members: true } });
  if (!room || !room.members.some((m) => m.userId === me)) {
    res.status(room ? 403 : 404).json({ error: room ? 'not_a_member' : 'not_found' });
    return;
  }
  const memberCount = room.members.length;
  const need = Math.ceil(memberCount / 2);
  const proposals = await prisma.proposal.findMany({
    where: { roomId: room.id },
    include: { votes: true, creator: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  res.json({
    memberCount,
    need,
    proposals: proposals.map((p) => {
      const approve = p.votes.filter((v) => v.approve).length;
      const reject = p.votes.filter((v) => !v.approve).length;
      const mine = p.votes.find((v) => v.userId === me);
      const expired = p.status === 'OPEN' && p.closesAt.getTime() < Date.now();
      return {
        id: p.id, kind: p.kind, title: p.title,
        creator: p.creator.name,
        approve, reject, need, memberCount,
        myVote: mine ? (mine.approve ? 'approve' : 'reject') : null,
        status: expired ? 'EXPIRED' : p.status,
        closesAt: p.closesAt,
      };
    }),
  });
});

// ── 投票（成員）；過半即通過並套用 ──
rooms.post('/proposals/:pid/vote', requireAuth, async (req, res) => {
  const me = uid(req);
  const approve = !!req.body?.approve;
  const proposal = await prisma.proposal.findUnique({ where: { id: req.params.pid }, include: { room: { include: { members: true } } } });
  if (!proposal) { res.status(404).json({ error: 'not_found' }); return; }
  if (!proposal.room.members.some((m) => m.userId === me)) { res.status(403).json({ error: 'not_a_member' }); return; }
  if (proposal.status !== 'OPEN' || proposal.closesAt.getTime() < Date.now()) { res.status(409).json({ error: 'closed' }); return; }

  await prisma.vote.upsert({
    where: { proposalId_userId: { proposalId: proposal.id, userId: me } },
    update: { approve },
    create: { proposalId: proposal.id, userId: me, approve },
  });

  const votes = await prisma.vote.findMany({ where: { proposalId: proposal.id } });
  const approveCount = votes.filter((v) => v.approve).length;
  const need = Math.ceil(proposal.room.members.length / 2);
  let passed = false;
  if (approveCount >= need) {
    passed = true;
    await prisma.$transaction([
      prisma.proposal.update({ where: { id: proposal.id }, data: { status: 'PASSED' } }),
      prisma.room.update({
        where: { id: proposal.roomId },
        data: proposal.kind === 'CHANGE_CAP'
          ? { totalCapMin: proposal.newCapMin }
          : { penaltyText: proposal.newPenaltyText },
      }),
    ]);
    await announce(proposal.roomId, `提案通過並套用：${proposal.title}`);
  }
  res.json({ ok: true, approveCount, need, passed });
});
