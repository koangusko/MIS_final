import { prisma } from './prisma';
import { taipeiDayStartUtc } from './time';
import { announce } from './announce';

export const normAppName = (s: string) => s.toLowerCase().replace(/\s+/g, '');
const norm = normAppName;

// 某成員在指定日期清單內、追蹤 App 的合計用量；完全沒回報則回 null。
export async function memberUsage(userId: string, trackedNames: Set<string>, dates: string[]): Promise<number | null> {
  let total = 0;
  let reported = false;
  for (const d of dates) {
    const sub = await prisma.submission.findFirst({
      where: { userId, status: 'PARSED', forDate: taipeiDayStartUtc(d) },
      include: { usages: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!sub) continue;
    reported = true;
    for (const u of sub.usages) if (trackedNames.has(norm(u.appLabel))) total += u.minutes;
  }
  return reported ? total : null;
}

export type MemberSettlement = { userId: string; used: number; over: number; passed: boolean; reported: boolean };

// 結算一個房間的某一期。dates = 該期所有台北日期；periodStart/End = 邊界日期字串。
export async function settleRoom(
  roomId: string,
  periodKey: string,
  periodStart: string,
  periodEnd: string,
  dates: string[],
): Promise<MemberSettlement[] | null> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { members: { include: { user: true } }, trackedApps: { include: { app: true } } },
  });
  if (!room || room.totalCapMin == null) return null; // 沒設上限不結算
  const cap = room.totalCapMin;
  const trackedNames = new Set(room.trackedApps.map((t) => norm(t.app.name)));

  const out: MemberSettlement[] = [];
  const failedNames: string[] = [];
  for (const m of room.members) {
    const usage = await memberUsage(m.userId, trackedNames, dates);
    const reported = usage != null;
    const used = usage ?? 0;
    const passed = reported && used <= cap;
    const over = reported ? Math.max(0, used - cap) : 0; // 未回報：over=0 但 passed=false（前端以此區分）
    if (!passed) failedNames.push(`${m.user.name}（${reported ? `超 ${over} 分` : '未回報'}）`);
    await prisma.settlementResult.upsert({
      where: { roomId_userId_periodStart: { roomId, userId: m.userId, periodStart: taipeiDayStartUtc(periodStart) } },
      update: { periodEnd: taipeiDayStartUtc(periodEnd), totalMin: used, capMin: cap, overMin: over, passed, penaltyText: passed ? null : room.penaltyText },
      create: {
        roomId, userId: m.userId,
        periodStart: taipeiDayStartUtc(periodStart), periodEnd: taipeiDayStartUtc(periodEnd),
        totalMin: used, capMin: cap, overMin: over, passed, penaltyText: passed ? null : room.penaltyText,
      },
    });
    out.push({ userId: m.userId, used, over, passed, reported });
  }
  await prisma.room.update({ where: { id: roomId }, data: { lastSettledPeriod: periodKey } });

  const passed = out.filter((m) => m.passed).length;
  const failed = out.length - passed;
  const tail = failed > 0 ? `未達標：${failedNames.join('、')}。` : '全員達標！';
  await announce(roomId, `本期結算完成：${passed} 人達標、${failed} 人未達標。${tail}`);
  return out;
}
