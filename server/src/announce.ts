import { prisma } from './prisma';
import { linePush } from './line';

// 建立系統公告（kind=SYSTEM）並推播給該房已綁定 LINE 的成員。
export async function announce(roomId: string, body: string): Promise<void> {
  try {
    await prisma.chatMessage.create({ data: { roomId, userId: null, kind: 'SYSTEM', body } });
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    const members = await prisma.roomMember.findMany({
      where: { roomId, user: { lineUserId: { not: null } } },
      include: { user: true },
    });
    const ids = members.map((m) => m.user.lineUserId).filter((x): x is string => !!x);
    if (ids.length) await linePush(ids, `【${room?.name ?? '房間'}】${body}`);
  } catch (e) {
    console.error('[announce] failed', (e as Error).message);
  }
}
