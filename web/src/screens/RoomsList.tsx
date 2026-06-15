import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, TabBar, Chip } from '../components/ui';
import type { IconName } from '../lib/icons';

type Room = { id: string; name: string; sub: string; glyph: IconName; tone: 'accent' | 'sand'; chip: { kind: 'good' | 'warn'; text: string } };

const ROOMS: Room[] = [
  { id: 'sad', name: '沉澱小隊', sub: '5 人 · 每日結算', glyph: 'room', tone: 'accent', chip: { kind: 'good', text: '本期達標' } },
  { id: 'off', name: '下班不滑挑戰', sub: '8 人 · 每週結算', glyph: 'flame', tone: 'sand', chip: { kind: 'warn', text: '超標 15 分' } },
];

export default function RoomsList() {
  const nav = useNavigate();
  return (
    <Phone>
      <div className="appbar">
        <div><h1>房間</h1></div>
        <button className="iconbtn" onClick={() => nav('/rooms/new')} aria-label="建立房間"><Icon name="plus" size={20} sw={2} /></button>
      </div>
      <div className="wrap scroll-body">
        {ROOMS.map((r) => (
          <div key={r.id} className="card" style={{ padding: 16 }} role="button" onClick={() => nav(`/rooms/${r.id}`)}>
            <div className="between">
              <div className="row" style={{ gap: 11 }}>
                <span className="center" style={{ width: 42, height: 42, borderRadius: 13, background: r.tone === 'accent' ? 'var(--accent-soft)' : 'var(--sand)', color: r.tone === 'accent' ? 'var(--accent)' : 'var(--ink-2)' }}>
                  <Icon name={r.glyph} size={21} />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>{r.sub}</div>
                </div>
              </div>
              <Chip kind={r.chip.kind} dot>{r.chip.text}</Chip>
            </div>
          </div>
        ))}

        <button className="btn soft" style={{ marginTop: 16 }} onClick={() => nav('/rooms/new')}><Icon name="plus" size={18} sw={2.2} />建立新房間</button>
        <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => nav('/join/9F4K-2QXP')}><Icon name="scan" size={18} />用連結 / QR 加入</button>
      </div>
      <TabBar />
    </Phone>
  );
}
