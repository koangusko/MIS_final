import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, TabBar, AppIcon, Bar, Chip, APPS } from '../components/ui';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

type Summary = {
  hasData: boolean;
  today: { date: string; totalMinutes: number; apps: { label: string; minutes: number }[] } | null;
  week: { date: string; minutes: number }[];
};
type Room = { id: string; name: string; cycle: 'DAILY' | 'WEEKLY'; memberCount: number; role: 'OWNER' | 'MEMBER' };

const WD = ['日', '一', '二', '三', '四', '五', '六'];
const weekday = (d: string) => WD[new Date(`${d}T00:00:00+08:00`).getDay()];
const glyphFor = (label: string) => Object.values(APPS).find((a) => a.name === label) ?? { glyph: 'image' as const, color: '#8a8195' };
function Big({ min }: { min: number }) {
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? <>{h}<span className="unit">時</span>{m}<span className="unit">分</span></> : <>{m}<span className="unit">分</span></>;
}

function RoomsSection({ rooms }: { rooms: Room[] | null }) {
  const nav = useNavigate();
  return (
    <>
      <div className="sectlabel">我的房間</div>
      {rooms && rooms.length > 0 ? (
        rooms.map((r) => (
          <div key={r.id} className="card" style={{ padding: 16 }} role="button" onClick={() => nav(`/rooms/${r.id}`)}>
            <div className="between">
              <div className="row" style={{ gap: 11 }}>
                <span className="center" style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon name="room" size={21} /></span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>{r.memberCount} 人 · {r.cycle === 'WEEKLY' ? '每週結算' : '每日結算'}</div>
                </div>
              </div>
              {r.role === 'OWNER' ? <Chip kind="accent"><Icon name="crown" size={13} />房主</Chip> : <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />}
            </div>
          </div>
        ))
      ) : (
        <div className="card flat" style={{ textAlign: 'center', padding: '26px 20px' }}>
          <span className="center" style={{ width: 50, height: 50, borderRadius: 15, background: 'var(--sand)', color: 'var(--ink-3)', margin: '0 auto 14px' }}><Icon name="room" size={26} /></span>
          <div style={{ fontWeight: 700, fontSize: 15 }}>還沒有加入任何房間</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '6px 0 16px' }}>建立房間找朋友，或用連結加入</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn soft sm block" onClick={() => nav('/rooms/new')}><Icon name="plus" size={18} sw={2} />建立房間</button>
            <button className="btn ghost sm block" onClick={() => nav('/rooms')}><Icon name="room" size={18} />房間列表</button>
          </div>
        </div>
      )}
    </>
  );
}

function DashboardEmpty({ rooms }: { rooms: Room[] | null }) {
  const nav = useNavigate();
  const { user } = useAuth();
  return (
    <>
      <div className="appbar">
        <div>
          <h1>嗨，{user?.name ?? '朋友'} 👋</h1>
          <div className="sub">今天還沒有資料，先上傳第一張吧</div>
        </div>
        <button className="iconbtn" onClick={() => nav('/notifications')}><Icon name="bell" size={20} /></button>
      </div>
      <div className="wrap scroll-body">
        <div className="card" style={{ textAlign: 'center', padding: '34px 22px' }}>
          <div className="empty-ill"><Icon name="camera" size={52} sw={1.4} /></div>
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 20 }}>上傳第一張螢幕使用時間</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.6 }}>從 iPhone「設定 → 螢幕使用時間」<br />截圖上傳，我們會自動讀出各 App 時數。</div>
          <button className="btn primary" style={{ marginTop: 22 }} onClick={() => nav('/upload')}><Icon name="upload" size={20} sw={1.9} />上傳今日截圖</button>
        </div>
        <RoomsSection rooms={rooms} />
      </div>
      <TabBar />
    </>
  );
}

function DashboardData({ summary, rooms }: { summary: Summary; rooms: Room[] | null }) {
  const nav = useNavigate();
  const total = summary.today?.totalMinutes ?? 0;
  const apps = summary.today?.apps ?? [];
  const maxApp = Math.max(1, ...apps.map((a) => a.minutes));
  const maxDay = Math.max(1, ...summary.week.map((d) => d.minutes));
  const todayStr = summary.week[summary.week.length - 1]?.date;
  return (
    <>
      <div className="appbar">
        <div>
          <h1>今日總覽</h1>
          <div className="sub">{summary.today ? '今日已回報' : '今天還沒打卡'}</div>
        </div>
        <button className="iconbtn" onClick={() => nav('/notifications')}><Icon name="bell" size={20} /></button>
      </div>
      <div className="wrap scroll-body">
        <div className="card">
          <div className="between">
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>社群＋短影音</span>
            <Chip kind="accent">{summary.today ? '今日' : '近 7 天'}</Chip>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14 }}>
            <span className="bignum tnum" style={{ fontSize: 56 }}><Big min={total} /></span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 12 }}>加入房間設定上限後，這裡會顯示對上限的進度。</div>
        </div>

        <div className="card">
          <div className="between" style={{ marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>近 7 天趨勢</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>分鐘</span>
          </div>
          <div className="chart">
            {summary.week.map((d, i) => {
              const isToday = d.date === todayStr;
              return (
                <div className="day" key={i}>
                  <div className={'stack' + (isToday ? '' : ' dim')} style={{ height: Math.max(5, (d.minutes / maxDay) * 100) + '%' }} />
                  <div className="dlabel" style={isToday ? { color: 'var(--accent)', fontWeight: 700 } : undefined}>{weekday(d.date)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {apps.length > 0 && (
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>各 App 使用</div>
            {apps.map((a, i) => {
              const g = glyphFor(a.label);
              return (
                <div className="approw" key={i}>
                  <AppIcon glyph={g.glyph} color={g.color} />
                  <div className="meta">
                    <div className="between"><span className="nm">{a.label}</span><span className="mins">{a.minutes} 分</span></div>
                    <div style={{ marginTop: 6 }}><Bar pct={(a.minutes / maxApp) * 100} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <RoomsSection rooms={rooms} />
      </div>
      <TabBar />
    </>
  );
}

export default function Dashboard({ force }: { force?: 'empty' }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [loading, setLoading] = useState(force !== 'empty');

  useEffect(() => {
    let alive = true;
    api.get<Room[]>('/api/rooms').then((r) => alive && setRooms(r)).catch(() => alive && setRooms([]));
    if (force === 'empty') return () => { alive = false; };
    api.get<Summary>('/api/usage/summary')
      .then((d) => { if (alive) { setSummary(d); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [force]);

  if (force === 'empty') return <Phone><DashboardEmpty rooms={rooms} /></Phone>;
  if (loading) return <Phone><div className="wrap center" style={{ color: 'var(--ink-3)' }}>載入中…</div><TabBar /></Phone>;
  if (!summary?.hasData) return <Phone><DashboardEmpty rooms={rooms} /></Phone>;
  return <Phone><DashboardData summary={summary} rooms={rooms} /></Phone>;
}
