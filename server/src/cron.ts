import cron from 'node-cron';
import { prisma } from './prisma';
import { nowTaipeiHHMM, todayTaipei, yesterdayTaipei, taipeiDow, lastNDaysTaipei } from './time';
import { settleRoom } from './settlement';

// 每分鐘檢查各房是否到結算時間（台北時間）。
async function tick() {
  const hhmm = nowTaipeiHHMM();
  const rooms = await prisma.room.findMany({ where: { totalCapMin: { not: null } } });
  for (const room of rooms) {
    if (hhmm < room.reportDeadline) continue; // 還沒到截止時間

    if (room.cycle === 'DAILY') {
      // 截止後結算「昨天」（昨天已是完整的一天）
      const y = yesterdayTaipei();
      const key = `D:${y}`;
      if (room.lastSettledPeriod === key) continue;
      try {
        const r = await settleRoom(room.id, key, y, y, [y]);
        if (r) console.log(`[cron] settled DAILY room ${room.id} for ${y}: ${r.length} members`);
      } catch (e) {
        console.error('[cron] settle DAILY failed', room.id, (e as Error).message);
      }
    } else {
      // WEEKLY：每週一截止後結算上週一..上週日
      if (taipeiDow(todayTaipei()) !== 1) continue;
      const week = lastNDaysTaipei(8).slice(0, 7); // 上週一..上週日
      const key = `W:${week[0]}`;
      if (room.lastSettledPeriod === key) continue;
      try {
        const r = await settleRoom(room.id, key, week[0], week[6], week);
        if (r) console.log(`[cron] settled WEEKLY room ${room.id} for ${week[0]}~${week[6]}: ${r.length} members`);
      } catch (e) {
        console.error('[cron] settle WEEKLY failed', room.id, (e as Error).message);
      }
    }
  }
}

export function startCron() {
  cron.schedule('* * * * *', () => {
    tick().catch((e) => console.error('[cron] tick error', (e as Error).message));
  });
  console.log('[cron] settlement scheduler started (every minute, Asia/Taipei)');
}
