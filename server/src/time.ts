// 台北時間（Asia/Taipei = UTC+8，無日光節約）日期工具。
// 一律以台北時間判定「今天 / 昨天」與日/週邊界。
const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;

/** 取得某時刻在台北時區的 YYYY-MM-DD。 */
export function taipeiDateStr(d: Date = new Date()): string {
  const t = new Date(d.getTime() + TAIPEI_OFFSET_MS);
  return t.toISOString().slice(0, 10);
}

/** 台北「今天」的 YYYY-MM-DD。 */
export function todayTaipei(): string {
  return taipeiDateStr();
}

/** 台北「昨天」的 YYYY-MM-DD。 */
export function yesterdayTaipei(): string {
  return taipeiDateStr(new Date(Date.now() - 24 * 60 * 60 * 1000));
}

/** 把台北日期字串（YYYY-MM-DD）轉成該日台北 00:00 對應的 UTC Date（存 DB 用）。 */
export function taipeiDayStartUtc(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+08:00`);
}

/** 近 N 天（含今天）的台北日期字串陣列，由舊到新。 */
export function lastNDaysTaipei(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    out.push(taipeiDateStr(new Date(Date.now() - i * 24 * 60 * 60 * 1000)));
  }
  return out;
}

/** 現在台北時間 HH:MM。 */
export function nowTaipeiHHMM(): string {
  return new Date(Date.now() + TAIPEI_OFFSET_MS).toISOString().slice(11, 16);
}

/** 台北星期（0=日 .. 6=六）。 */
export function taipeiDow(dateStr: string): number {
  return new Date(`${dateStr}T00:00:00+08:00`).getDay();
}
