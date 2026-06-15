import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, Avatar, AppIcon, Bar, Chip, APPS } from '../components/ui';

type Tab = 'member' | 'rule' | 'rank' | 'chat';
const TABS: [Tab, string][] = [['member', '成員'], ['rule', '規則'], ['rank', '排行'], ['chat', '聊天']];

export default function RoomDetail() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [tab, setTab] = useState<Tab>((sp.get('tab') as Tab) || 'member');
  return (
    <Phone>
      <div className="backbar">
        <button className="iconbtn" style={{ width: 36, height: 36 }} onClick={() => nav(-1)} aria-label="返回"><Icon name="chevL" size={20} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 19 }}>沉澱小隊</div>
          <div className="row" style={{ gap: 6, fontSize: 12, color: 'var(--warn-ink)', marginTop: 1 }}><Icon name="clock" size={14} />距每日結算 4 小時 12 分</div>
        </div>
        <button className="iconbtn" style={{ width: 36, height: 36 }} onClick={() => nav('/rooms/sad/settings')} aria-label="設定"><Icon name="settings" size={19} /></button>
      </div>
      <div style={{ padding: '4px 16px 8px', flex: '0 0 auto' }}>
        <div className="roomtabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
      </div>
      <div className="wrap" style={{ padding: '4px 16px 22px' }}>
        {tab === 'member' && <Members />}
        {tab === 'rule' && <Rules onTracking={() => nav('/rooms/sad/tracking')} onVote={() => nav('/rooms/sad/vote')} />}
        {tab === 'rank' && <Rank />}
        {tab === 'chat' && <Chat />}
      </div>
    </Phone>
  );
}

function Members() {
  const ms: { n: string; name: string; m: number; cap: number; rep: boolean; over?: boolean }[] = [
    { n: '宥', name: '宥宥（你）', m: 70, cap: 90, rep: true },
    { n: '庭', name: '庭瑄', m: 52, cap: 90, rep: true },
    { n: '晴', name: '晴晴', m: 104, cap: 90, rep: true, over: true },
    { n: '安', name: '安安', m: 38, cap: 90, rep: true },
    { n: '哲', name: '哲哲', m: 0, cap: 90, rep: false },
  ];
  return (
    <>
      <div className="between" style={{ margin: '4px 4px 10px' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-2)' }}>本期 · 5 位成員</span>
        <span className="chip neutral">4 / 5 已回報</span>
      </div>
      <div className="card" style={{ padding: '6px 16px' }}>
        {ms.map((m, i) => {
          const pct = m.m / m.cap * 100;
          return (
            <div className="lrow" key={i}>
              <Avatar name={m.n} idx={i} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="between">
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{m.name}</span>
                  {m.rep
                    ? <span className="tnum" style={{ fontWeight: 700, fontSize: 14, color: m.over ? 'var(--warn-ink)' : 'var(--ink)' }}>{m.m} 分</span>
                    : <Chip kind="neutral">待回報</Chip>}
                </div>
                <div className="row" style={{ gap: 8, marginTop: 7 }}>
                  <div style={{ flex: 1 }}><Bar pct={m.rep ? pct : 0} state={m.over ? 'over' : 'good'} /></div>
                  {m.rep && (m.over ? <Chip kind="warn">超 14 分</Chip> : <Chip kind="good">達標</Chip>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="card flat" style={{ marginTop: 12, textAlign: 'center', padding: 14, fontSize: 13, color: 'var(--ink-2)' }}>
        每日上限 <b style={{ color: 'var(--ink)' }}>1時30分</b> · 哲哲今天還沒回報，提醒一下？
      </div>
    </>
  );
}

function Rules({ onTracking, onVote }: { onTracking: () => void; onVote: () => void }) {
  const caps = [
    { ...APPS.tk, cap: '40 分' }, { ...APPS.ig, cap: '30 分' }, { ...APPS.yt, cap: '25 分' },
  ];
  return (
    <>
      <div className="card" style={{ padding: 16 }}>
        <div className="between" style={{ marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>追蹤上限（每日）</span>
          <Chip kind="accent"><Icon name="crown" size={13} />房主可編輯</Chip>
        </div>
        {caps.map((a, i) => (
          <div className="approw" key={i}>
            <AppIcon glyph={a.glyph} color={a.color} />
            <div className="meta between" style={{ display: 'flex' }}><span className="nm">{a.name}</span><span className="mins tnum">{a.cap}</span></div>
          </div>
        ))}
        <div className="approw" style={{ color: 'var(--ink-2)' }}>
          <span className="center" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--sand)', color: 'var(--ink-2)', flex: '0 0 auto' }}><Icon name="chart" size={18} /></span>
          <div className="meta between" style={{ display: 'flex' }}><span className="nm">合計總上限</span><span className="mins tnum">1時30分</span></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        {[{ ic: 'calendar' as const, t: '結算週期', v: '每日 · 00:00 重置' }, { ic: 'clock' as const, t: '回報截止', v: '每天 23:00' }].map((r, i) => (
          <div key={i} className="between" style={{ padding: '11px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
            <span className="row" style={{ gap: 10, color: 'var(--ink-2)', fontSize: 14 }}><Icon name={r.ic} size={19} />{r.t}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{r.v}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 12, background: 'var(--warn-soft)', boxShadow: 'none' }}>
        <div className="row" style={{ gap: 8, color: 'var(--warn-ink)', fontWeight: 700, fontSize: 14, marginBottom: 7 }}><Icon name="flame" size={18} />超標懲罰</div>
        <div style={{ fontSize: 13.5, color: 'var(--warn-ink)', lineHeight: 1.6 }}>超標的人，這期請室友喝一杯飲料 🧋；超過 30 分鐘則加碼負責掃地一週。</div>
      </div>

      <button className="btn soft" style={{ marginTop: 12 }} onClick={onVote}><Icon name="chart" size={18} />規則與投票</button>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button className="btn ghost sm block" onClick={onTracking}><Icon name="edit" size={17} />編輯追蹤清單</button>
        <button className="btn ghost sm block"><Icon name="clock" size={17} />改截止時間</button>
      </div>
    </>
  );
}

function Rank() {
  const rk: { r: number; n: string; name: string; m: number; h: number; me?: boolean }[] = [
    { r: 2, n: '安', name: '安安', m: 38, h: 60 },
    { r: 1, n: '庭', name: '庭瑄', m: 28, h: 86 },
    { r: 3, n: '宥', name: '宥宥（你）', m: 70, h: 44, me: true },
  ];
  const rest: { r: number; n: string; name: string; m: number; over?: boolean }[] = [
    { r: 4, n: '哲', name: '哲哲', m: 82 },
    { r: 5, n: '晴', name: '晴晴', m: 104, over: true },
  ];
  return (
    <>
      <div className="card" style={{ padding: '20px 16px 16px' }}>
        <div className="between" style={{ marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>本期排行</span>
          <span className="chip neutral">用最少者領先</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, height: 150 }}>
          {rk.map((p, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <Avatar name={p.n} idx={p.r} size={p.r === 1 ? 56 : 46} ring={p.me ? 2 : 0} />
                {p.r === 1 && <span className="center" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', color: '#c79a3a' }}><Icon name="crown" size={22} sw={1.7} /></span>}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, textAlign: 'center' }}>{p.name}</div>
              <div className="tnum" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{p.m} 分</div>
              <div style={{ width: '100%', height: p.h, borderRadius: '10px 10px 0 0', background: p.r === 1 ? 'var(--accent)' : 'var(--accent-soft)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8, color: p.r === 1 ? '#fff' : 'var(--accent-ink)', fontWeight: 900, fontSize: 17 }}>{p.r}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ marginTop: 12, padding: '4px 16px' }}>
        {rest.map((p, i) => (
          <div className="lrow" key={i}>
            <span className="tnum" style={{ width: 22, fontWeight: 900, color: 'var(--ink-3)', fontSize: 15 }}>{p.r}</span>
            <Avatar name={p.n} idx={p.r} size={38} />
            <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5 }}>{p.name}</span>
            {p.over && <Chip kind="warn" dot>超標</Chip>}
            <span className="tnum" style={{ fontWeight: 700, fontSize: 14 }}>{p.m} 分</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Chat() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        <div className="sysline">
          <span className="st"><Icon name="info" size={15} />系統公告</span>
          <span>追蹤清單已更新：新增「短影音 A」，上限 40 分／日。</span>
        </div>
        <div className="row" style={{ gap: 9, alignItems: 'flex-end' }}>
          <Avatar name="庭" idx={1} size={32} />
          <div className="bubble them">大家今天記得回報～截止 23:00 🙏</div>
        </div>
        <div className="row" style={{ gap: 9, alignItems: 'flex-end' }}>
          <Avatar name="安" idx={3} size={32} />
          <div className="bubble them">我已經傳了，今天只用 38 分 💪</div>
        </div>
        <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
          <div className="bubble me">太強了！我也來拼一下 😤</div>
        </div>
        <div className="sysline" style={{ background: 'var(--good-soft)', color: 'var(--good-ink)' }}>
          <span className="st"><Icon name="checkCircle" size={15} />打卡通知</span>
          <span>晴晴 完成今日回報（4 / 5 已回報）。</span>
        </div>
      </div>
      <div className="row" style={{ gap: 10, marginTop: 14 }}>
        <div className="input row" style={{ flex: 1, padding: '10px 14px', color: 'var(--ink-3)' }}>輸入訊息…</div>
        <button className="center" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', flex: '0 0 auto' }} aria-label="送出"><Icon name="send" size={20} sw={1.9} /></button>
      </div>
    </>
  );
}
