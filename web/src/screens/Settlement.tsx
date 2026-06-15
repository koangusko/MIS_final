import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, PageHeader, Avatar, Bar, Chip } from '../components/ui';

export default function Settlement() {
  const nav = useNavigate();
  const ms: { n: string; name: string; m: number; cap: number; rank: number; me?: boolean; over?: number }[] = [
    { n: '庭', name: '庭瑄', m: 28, cap: 90, rank: 1 },
    { n: '安', name: '安安', m: 38, cap: 90, rank: 2 },
    { n: '宥', name: '宥宥（你）', m: 70, cap: 90, rank: 3, me: true },
    { n: '哲', name: '哲哲', m: 82, cap: 90, rank: 4 },
    { n: '晴', name: '晴晴', m: 104, cap: 90, rank: 5, over: 14 },
  ];
  return (
    <Phone>
      <PageHeader title="本期結算" sub="6/14 · 每日結算" close onBack={() => nav('/rooms/sad')} />
      <div className="wrap scroll-body">
        {/* hero summary */}
        <div className="card" style={{ textAlign: 'center', padding: '22px 20px', background: 'var(--accent)', color: '#fff', boxShadow: '0 8px 22px rgba(63,128,122,.28)' }}>
          <div style={{ fontSize: 13, opacity: 0.85 }}>本期結果</div>
          <div style={{ fontWeight: 900, fontSize: 22, margin: '6px 0 16px' }}>4 人守住了，1 人超標 🙌</div>
          <div className="row" style={{ justifyContent: 'center', gap: 0 }}>
            <div style={{ flex: 1 }}><div className="bignum" style={{ fontSize: 32 }}>4</div><div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>達標</div></div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,.25)' }} />
            <div style={{ flex: 1 }}><div className="bignum" style={{ fontSize: 32 }}>1</div><div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>超標</div></div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,.25)' }} />
            <div style={{ flex: 1 }}><div className="bignum" style={{ fontSize: 32 }}>56<span style={{ fontSize: 14 }}>分</span></div><div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>平均用量</div></div>
          </div>
        </div>

        <div className="sectlabel">成員結果</div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {ms.map((m, i) => (
            <div className="lrow" key={i}>
              <span className="tnum" style={{ width: 18, fontWeight: 900, color: 'var(--ink-3)', fontSize: 14 }}>{m.rank}</span>
              <Avatar name={m.n} idx={m.rank} size={40} ring={m.me ? 2 : 0} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="between"><span style={{ fontWeight: 700, fontSize: 14.5 }}>{m.name}</span><span className="tnum" style={{ fontWeight: 700, fontSize: 14, color: m.over ? 'var(--warn-ink)' : 'var(--ink)' }}>{m.m} 分</span></div>
                <div className="row" style={{ gap: 8, marginTop: 6 }}>
                  <div style={{ flex: 1 }}><Bar pct={m.m / m.cap * 100} state={m.over ? 'over' : 'good'} /></div>
                  {m.over ? <Chip kind="warn">超 {m.over} 分</Chip> : <Chip kind="good">達標</Chip>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* penalty applied */}
        <div className="card" style={{ marginTop: 14, background: 'var(--warn-soft)', boxShadow: 'none' }}>
          <div className="row" style={{ gap: 10 }}>
            <Avatar name="晴" idx={5} size={40} />
            <div style={{ flex: 1 }}>
              <div className="row" style={{ gap: 7 }}><span style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--warn-ink)' }}>晴晴</span><Chip kind="warn" dot>超標 14 分</Chip></div>
              <div style={{ fontSize: 12.5, color: 'var(--warn-ink)', marginTop: 5, lineHeight: 1.5 }}>套用懲罰：這期請室友喝一杯飲料 🧋</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn ghost block sm" onClick={() => nav('/rooms/sad?tab=rank')}><Icon name="trophy" size={17} />看排行</button>
          <button className="btn primary block sm" onClick={() => nav('/rooms/sad?tab=chat')}><Icon name="send" size={17} />到聊天室公告</button>
        </div>
      </div>
    </Phone>
  );
}
