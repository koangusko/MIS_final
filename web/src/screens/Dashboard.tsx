import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, TabBar, AppIcon, Bar, Chip, APPS } from '../components/ui';
import { useAuth } from '../lib/auth';

function DashboardEmpty() {
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
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.6 }}>
            從 iPhone「設定 → 螢幕使用時間」<br />截圖上傳，我們會自動讀出各 App 時數。
          </div>
          <button className="btn primary" style={{ marginTop: 22 }} onClick={() => nav('/upload')}>
            <Icon name="upload" size={20} sw={1.9} />上傳今日截圖
          </button>
        </div>

        <div className="sectlabel">我的房間</div>
        <div className="card flat" style={{ textAlign: 'center', padding: '26px 20px' }}>
          <span className="center" style={{ width: 50, height: 50, borderRadius: 15, background: 'var(--sand)', color: 'var(--ink-3)', margin: '0 auto 14px' }}>
            <Icon name="room" size={26} />
          </span>
          <div style={{ fontWeight: 700, fontSize: 15 }}>還沒有加入任何房間</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '6px 0 16px' }}>建立房間找朋友，或用連結加入</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn soft sm block" onClick={() => nav('/rooms/new')}><Icon name="plus" size={18} sw={2} />建立房間</button>
            <button className="btn ghost sm block" onClick={() => nav('/join/9F4K-2QXP')}><Icon name="scan" size={18} />掃描加入</button>
          </div>
        </div>
      </div>
      <TabBar />
    </>
  );
}

function DashboardData() {
  const nav = useNavigate();
  const days: { d: string; v: number; over?: boolean; today?: boolean }[] = [
    { d: '一', v: 64 }, { d: '二', v: 52 }, { d: '三', v: 78, over: true },
    { d: '四', v: 41 }, { d: '五', v: 58 }, { d: '六', v: 88, over: true }, { d: '日', v: 70, today: true },
  ];
  const max = 90;
  const apps = [
    { ...APPS.tk, m: 38, cap: 40 },
    { ...APPS.ig, m: 22, cap: 30 },
    { ...APPS.yt, m: 10, cap: 25 },
  ];
  return (
    <>
      <div className="appbar">
        <div>
          <h1>今日總覽</h1>
          <div className="sub">6 月 15 日 · 週日</div>
        </div>
        <button className="iconbtn" onClick={() => nav('/notifications')}><Icon name="bell" size={20} /></button>
      </div>
      <div className="wrap scroll-body">
        {/* total card */}
        <div className="card">
          <div className="between">
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>社群＋短影音</span>
            <div className="seg"><button className="on">今日</button><button>本週</button></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14 }}>
            <span className="bignum tnum" style={{ fontSize: 56 }}>1<span className="unit">時</span>10<span className="unit">分</span></span>
            <Chip kind="good" dot>較昨日 −12 分</Chip>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="between" style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 6 }}>
              <span>距每日上限 1時30分</span>
              <span className="tnum" style={{ fontWeight: 700, color: 'var(--good-ink)' }}>還剩 20 分</span>
            </div>
            <Bar pct={78} />
          </div>
        </div>

        {/* trend chart */}
        <div className="card">
          <div className="between" style={{ marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>近 7 天趨勢</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>分鐘</span>
          </div>
          <div className="chart">
            {days.map((d, i) => (
              <div className="day" key={i}>
                <div className={'stack' + (d.over ? ' over' : d.today ? '' : ' dim')} style={{ height: (d.v / max * 100) + '%' }} />
                <div className="dlabel" style={d.today ? { color: 'var(--accent)', fontWeight: 700 } : undefined}>{d.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* tracked apps */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>各 App 使用</div>
          {apps.map((a, i) => {
            const pct = a.m / a.cap * 100;
            const over = a.m > a.cap;
            return (
              <div className="approw" key={i}>
                <AppIcon glyph={a.glyph} color={a.color} />
                <div className="meta">
                  <div className="between">
                    <span className="nm">{a.name}</span>
                    <span className="mins" style={over ? { color: 'var(--warn-ink)' } : undefined}>{a.m} 分</span>
                  </div>
                  <div style={{ marginTop: 6 }}><Bar pct={pct} state={over ? 'over' : ''} /></div>
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 10, textAlign: 'center' }}>上限為房間「沉澱小隊」設定</div>
        </div>

        {/* my rooms */}
        <div className="sectlabel">我的房間</div>
        <div className="card" style={{ padding: 16 }} onClick={() => nav('/rooms/sad')} role="button">
          <div className="between">
            <div className="row" style={{ gap: 11 }}>
              <span className="center" style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon name="room" size={21} /></span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>沉澱小隊</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>5 人 · 每日結算</div>
              </div>
            </div>
            <Chip kind="good" dot>本期達標</Chip>
          </div>
          <div className="between" style={{ marginTop: 13, paddingTop: 13, borderTop: '1px solid var(--line-2)', fontSize: 12.5 }}>
            <span className="row" style={{ gap: 6, color: 'var(--warn-ink)' }}><Icon name="clock" size={15} />距回報截止 4 小時</span>
            <span className="row" style={{ gap: 4, color: 'var(--accent)', fontWeight: 700 }}>進入房間<Icon name="chevR" size={15} /></span>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }} onClick={() => nav('/rooms/off')} role="button">
          <div className="between">
            <div className="row" style={{ gap: 11 }}>
              <span className="center" style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--sand)', color: 'var(--ink-2)' }}><Icon name="flame" size={21} /></span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>下班不滑挑戰</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>8 人 · 每週結算</div>
              </div>
            </div>
            <Chip kind="warn" dot>超標 15 分</Chip>
          </div>
        </div>
      </div>
      <TabBar />
    </>
  );
}

export default function Dashboard({ variant = 'data' }: { variant?: 'empty' | 'data' }) {
  return <Phone>{variant === 'empty' ? <DashboardEmpty /> : <DashboardData />}</Phone>;
}
