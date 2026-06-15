import { Router } from 'express';
import { prisma } from './prisma';
import { requireAuth } from './auth';
import { verifyLineSignature, lineReply, genBindingCode } from './line';

export const chat = Router();

function uid(req: { user?: unknown }): string {
  return (req.user as { id: string }).id;
}

// 聊天訊息（前端每數秒輪詢）
chat.get('/rooms/:id/messages', requireAuth, async (req, res) => {
  const me = uid(req);
  const member = await prisma.roomMember.findUnique({ where: { roomId_userId: { roomId: req.params.id, userId: me } } });
  if (!member) { res.status(403).json({ error: 'not_a_member' }); return; }
  const msgs = await prisma.chatMessage.findMany({
    where: { roomId: req.params.id },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });
  res.json(
    msgs.map((m) => ({
      id: m.id,
      kind: m.kind,
      body: m.body,
      createdAt: m.createdAt,
      name: m.user?.name ?? null,
      initial: m.user?.name?.slice(0, 1) ?? null,
      isMe: m.userId === me,
    })),
  );
});

// 發言
chat.post('/rooms/:id/messages', requireAuth, async (req, res) => {
  const me = uid(req);
  const member = await prisma.roomMember.findUnique({ where: { roomId_userId: { roomId: req.params.id, userId: me } } });
  if (!member) { res.status(403).json({ error: 'not_a_member' }); return; }
  const body = String(req.body?.body ?? '').trim();
  if (!body) { res.status(400).json({ error: 'empty' }); return; }
  const m = await prisma.chatMessage.create({ data: { roomId: req.params.id, userId: me, kind: 'USER', body: body.slice(0, 1000) } });
  res.json({ id: m.id });
});

// 取得 / 產生 LINE 綁定碼
chat.get('/line/binding-code', requireAuth, async (req, res) => {
  const me = uid(req);
  const user = await prisma.user.findUnique({ where: { id: me } });
  if (user?.lineUserId) { res.json({ bound: true }); return; }
  let code = genBindingCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.user.findUnique({ where: { lineBindingCode: code } });
    if (!exists) break;
    code = genBindingCode();
  }
  await prisma.user.update({ where: { id: me }, data: { lineBindingCode: code } });
  res.json({ bound: false, code, addFriendUrl: 'https://line.me/R/ti/p/@329gzkoe' });
});

// LINE webhook（驗簽；處理綁定碼）。注意：rawBody 由 index.ts 的 express.json verify 捕捉。
chat.post('/line/webhook', async (req, res) => {
  const sig = req.header('x-line-signature');
  const raw = (req as unknown as { rawBody?: Buffer }).rawBody;
  if (!verifyLineSignature(raw ?? Buffer.from(''), sig)) {
    res.status(401).end();
    return;
  }
  const events: any[] = req.body?.events ?? [];
  for (const ev of events) {
    if (ev.type !== 'message' || ev.message?.type !== 'text') continue;
    const lineUserId: string | undefined = ev.source?.userId;
    const code = String(ev.message.text).trim().toUpperCase().replace(/\s+/g, '');
    const user = code ? await prisma.user.findUnique({ where: { lineBindingCode: code } }) : null;
    if (user && lineUserId) {
      await prisma.user.update({ where: { id: user.id }, data: { lineUserId, lineBindingCode: null } });
      if (ev.replyToken) await lineReply(ev.replyToken, `綁定成功！${user.name} 之後會在這裡收到房間通知。`);
    } else if (ev.replyToken) {
      await lineReply(ev.replyToken, '請從 App 的「我的」頁取得綁定碼，傳給我即可完成綁定。');
    }
  }
  res.status(200).end();
});
