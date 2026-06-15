import { Icon } from '../components/Icon';
import { Phone, TabBar } from '../components/ui';
import type { IconName } from '../lib/icons';

type Tone = 'warn' | 'good' | 'accent' | 'neutral';
type Item = { ic: IconName; tone: Tone; t: string; d: string; time: string; unread?: boolean };

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: '今天', items: [
      { ic: 'clock', tone: 'warn', t: '今天還沒回報', d: '距「沉澱小隊」截止剩 4 小時', time: '18:02', unread: true },
      { ic: 'trophy', tone: 'good', t: '本期結算完成', d: '沉澱小隊 · 你排第 3，達標', time: '09:00', unread: true },
      { ic: 'alert', tone: 'warn', t: '晴晴 超標了', d: '下班不滑挑戰 · 超出 14 分', time: '08:30' },
    ],
  },
  {
    label: '本週', items: [
      { ic: 'chart', tone: 'accent', t: '有新提案要投票', d: '「短影音上限改 30 分」剩 1 天', time: '週四' },
      { ic: 'settings', tone: 'neutral', t: '追蹤清單已更新', d: '房主新增「短影音 B」', time: '週三' },
      { ic: 'room', tone: 'neutral', t: '安安 加入了房間', d: '沉澱小隊 現有 5 人', time: '週一' },
    ],
  },
];

const toneBg: Record<Tone, string> = { warn: 'var(--warn-soft)', good: 'var(--good-soft)', accent: 'var(--accent-soft)', neutral: 'var(--sand)' };
const toneFg: Record<Tone, string> = { warn: 'var(--warn-ink)', good: 'var(--good-ink)', accent: 'var(--accent-ink)', neutral: 'var(--ink-2)' };

export default function Notifications() {
  return (
    <Phone>
      <div className="appbar">
        <div><h1>通知</h1></div>
        <button className="btn ghost sm" style={{ padding: '8px 14px' }}>全部已讀</button>
      </div>
      <div className="wrap scroll-body">
        {GROUPS.map((g, gi) => (
          <div key={gi}>
            <div className="sectlabel" style={{ marginTop: gi ? 18 : 4 }}>{g.label}</div>
            <div className="card" style={{ padding: '4px 16px' }}>
              {g.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
                  <span className="center" style={{ width: 38, height: 38, borderRadius: 12, background: toneBg[it.tone], color: toneFg[it.tone], flex: '0 0 auto' }}><Icon name={it.ic} size={19} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="between"><span style={{ fontWeight: 700, fontSize: 14.5 }}>{it.t}</span><span style={{ fontSize: 11.5, color: 'var(--ink-3)', whiteSpace: 'nowrap', paddingLeft: 8 }}>{it.time}</span></div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.45 }}>{it.d}</div>
                  </div>
                  {it.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flex: '0 0 auto', marginTop: 6 }} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <TabBar />
    </Phone>
  );
}
