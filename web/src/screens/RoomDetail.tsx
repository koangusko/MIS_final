import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, Avatar, AppIcon, Bar, Chip } from '../components/ui';
import { api } from '../lib/api';
import { ApiError } from '../lib/api';
import type { IconName } from '../lib/icons';

type Member = { id: string; name: string; initial: string; role: 'OWNER' | 'MEMBER'; isMe: boolean; idx: number };
type Tracked = { key: string; name: string; glyph: string; color: string; category: string; dailyCapMin: number | null };
type Room = {
  id: string; name: string; description: string | null;
  cycle: 'DAILY' | 'WEEKLY'; reportDeadline: string; role: 'OWNER' | 'MEMBER';
  totalCapMin: number | null; penaltyText: string | null;
  members: Member[]; trackedApps: Tracked[];
};

type Tab = 'member' | 'rule' | 'chat';
const TABS: [Tab, string][] = [['member', '成員'], ['rule', '規則'], ['chat', '聊天']];

export default function RoomDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const [sp] = useSearchParams();
  const [tab, setTab] = useState<Tab>((sp.get('tab') as Tab) || 'member');
  const [room, setRoom] = useState<Room | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(
    () => api.get<Room>(`/api/rooms/${id}`).then(setRoom).catch((e: ApiError) => setErr(e.status === 403 ? '你不是這個房間的成員' : '找不到這個房間')),
    [id],
  );
  useEffect(() => { void load(); }, [load]);

  if (err) {
    return (
      <Phone>
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center', gap: 16 }}>
          <span className="center" style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--sand)', color: 'var(--ink-3)' }}><Icon name="room" size={34} /></span>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{err}</div>
          <button className="btn ghost sm" onClick={() => nav('/rooms')}>回房間列表</button>
        </div>
      </Phone>
    );
  }
  if (!room) return <Phone><div className="wrap center" style={{ color: 'var(--ink-3)' }}>載入中…</div></Phone>;

  const isOwner = room.role === 'OWNER';
  return (
    <Phone>
      <div className="backbar">
        <button className="iconbtn" style={{ width: 36, height: 36 }} onClick={() => nav('/rooms')} aria-label="返回"><Icon name="chevL" size={20} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 19 }}>{room.name}</div>
          <div className="row" style={{ gap: 6, fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>
            <Icon name="clock" size={14} />{room.cycle === 'WEEKLY' ? '每週結算' : '每日結算'} · 截止 {room.reportDeadline}
          </div>
        </div>
        {isOwner && <button className="iconbtn" style={{ width: 36, height: 36 }} onClick={() => nav(`/rooms/${room.id}/invite`)} aria-label="邀請"><Icon name="send" size={18} /></button>}
      </div>
      <div style={{ padding: '4px 16px 8px', flex: '0 0 auto' }}>
        <div className="roomtabs">
          {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{label}</button>)}
        </div>
      </div>
      {tab === 'chat' ? (
        <Chat roomId={room.id} />
      ) : (
        <div className="wrap" style={{ padding: '4px 16px 22px' }}>
          {tab === 'member' && <Members room={room} isOwner={isOwner} onInvite={() => nav(`/rooms/${room.id}/invite`)} />}
          {tab === 'rule' && <Rules room={room} isOwner={isOwner} onEditTracking={() => nav(`/rooms/${room.id}/tracking`)} onSettlement={() => nav(`/rooms/${room.id}/settlement`)} onVote={() => nav(`/rooms/${room.id}/vote`)} reload={load} />}
        </div>
      )}
    </Phone>
  );
}

type Usage = {
  cap: number | null; cycle: 'DAILY' | 'WEEKLY';
  members: { userId: string; name: string; initial: string; idx: number; isMe: boolean; role: 'OWNER' | 'MEMBER'; used: number | null; reported: boolean }[];
};

function Members({ room, isOwner, onInvite }: { room: Room; isOwner: boolean; onInvite: () => void }) {
  const [u, setU] = useState<Usage | null>(null);
  useEffect(() => {
    let alive = true;
    const fetchUsage = () => api.get<Usage>(`/api/rooms/${room.id}/usage`).then((x) => alive && setU(x)).catch(() => {});
    void fetchUsage();
    const t = setInterval(() => void fetchUsage(), 15000);
    return () => { alive = false; clearInterval(t); };
  }, [room.id]);

  const cap = u?.cap ?? null;
  const list = u?.members ?? room.members.map((m) => ({ userId: m.id, name: m.name, initial: m.initial, idx: m.idx, isMe: m.isMe, role: m.role, used: null as number | null, reported: false }));

  return (
    <>
      <div className="between" style={{ margin: '4px 4px 10px' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-2)' }}>
          本{(u?.cycle ?? room.cycle) === 'WEEKLY' ? '週' : '日'} · {list.length} 位成員{cap != null ? ` · 上限 ${cap} 分` : ''}
        </span>
        {isOwner && <button className="btn soft sm" style={{ padding: '7px 12px' }} onClick={onInvite}><Icon name="plus" size={15} sw={2} />邀請</button>}
      </div>
      <div className="card" style={{ padding: '6px 16px' }}>
        {list.map((m) => {
          const over = cap != null && m.reported && (m.used ?? 0) > cap;
          return (
            <div className="lrow" key={m.userId}>
              <Avatar name={m.initial} idx={m.idx} size={42} ring={m.isMe ? 2 : 0} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="between">
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{m.name}{m.isMe && '（你）'}{m.role === 'OWNER' && ' · 房主'}</span>
                  <span className="tnum" style={{ fontWeight: 700, fontSize: 14, color: over ? 'var(--warn-ink)' : 'var(--ink)' }}>{m.reported ? `${m.used} 分` : '未回報'}</span>
                </div>
                <div className="row" style={{ gap: 8, marginTop: 7 }}>
                  <div style={{ flex: 1 }}><Bar pct={cap != null && m.reported ? ((m.used ?? 0) / cap) * 100 : 0} state={over ? 'over' : m.reported ? 'good' : ''} /></div>
                  {cap != null && m.reported && (over ? <Chip kind="warn">超 {(m.used ?? 0) - cap} 分</Chip> : <Chip kind="good">達標</Chip>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="card flat" style={{ marginTop: 12, textAlign: 'center', padding: 14, fontSize: 12.5, color: 'var(--ink-2)' }}>
        {cap != null
          ? `每天上傳「今天打卡」即時更新用量；按${(u?.cycle ?? room.cycle) === 'WEEKLY' ? '週' : '日'}結算正式判定達標。`
          : '房主到「規則」設定總上限後，這裡會顯示各成員達標狀況。'}
      </div>
    </>
  );
}

function Rules({ room, isOwner, onEditTracking, onSettlement, onVote, reload }: {
  room: Room; isOwner: boolean; onEditTracking: () => void; onSettlement: () => void; onVote: () => void; reload: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [cap, setCap] = useState(room.totalCapMin ? String(room.totalCapMin) : '');
  const [penalty, setPenalty] = useState(room.penaltyText ?? '');
  const [deadline, setDeadline] = useState(room.reportDeadline);
  const [cycle, setCycle] = useState<'DAILY' | 'WEEKLY'>(room.cycle);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await api.put(`/api/rooms/${room.id}/rules`, { totalCapMin: cap ? Number(cap) : null, penaltyText: penalty, reportDeadline: deadline, cycle });
      await reload();
      setEditing(false);
    } catch { /* ignore */ } finally { setBusy(false); }
  };

  return (
    <>
      {/* 上限 + 懲罰 */}
      <div className="card" style={{ padding: 16 }}>
        <div className="between" style={{ marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>每{room.cycle === 'WEEKLY' ? '週' : '日'}總上限與懲罰</span>
          {isOwner && !editing && <button className="btn ghost sm" style={{ padding: '6px 12px' }} onClick={() => setEditing(true)}><Icon name="edit" size={15} />編輯</button>}
        </div>
        {editing ? (
          <>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>追蹤 App 合計上限（分）</label>
              <input className="input" inputMode="numeric" placeholder="例：90" value={cap} onChange={(e) => setCap(e.target.value.replace(/[^0-9]/g, ''))} />
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>超標懲罰（自訂文字）</label>
              <textarea className="input" rows={2} placeholder="例：超標者請室友喝一杯飲料" value={penalty} onChange={(e) => setPenalty(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>結算週期</label>
              <div className="seg" style={{ display: 'flex', width: '100%' }}>
                <button className={cycle === 'DAILY' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setCycle('DAILY')}>每日</button>
                <button className={cycle === 'WEEKLY' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setCycle('WEEKLY')}>每週</button>
              </div>
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>回報截止時間</label>
              <div className="input between" style={{ display: 'flex', alignItems: 'center' }}>
                <span className="row" style={{ gap: 10, color: 'var(--ink-2)' }}><Icon name="clock" size={19} /></span>
                <input type="time" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ border: 'none', background: 'transparent', font: 'inherit', color: 'var(--ink)', fontWeight: 700, flex: 1, textAlign: 'right' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn ghost sm block" onClick={() => setEditing(false)}>取消</button>
              <button className="btn primary sm block" disabled={busy} onClick={save}><Icon name="check" size={16} sw={2.2} />{busy ? '儲存中…' : '儲存'}</button>
            </div>
          </>
        ) : (
          <>
            <div className="between" style={{ padding: '4px 0' }}>
              <span className="row" style={{ gap: 10, color: 'var(--ink-2)', fontSize: 14 }}><Icon name="chart" size={19} />合計上限</span>
              <span className="tnum" style={{ fontWeight: 700, fontSize: 14 }}>{room.totalCapMin ? `${room.totalCapMin} 分` : '未設定'}</span>
            </div>
            <div style={{ paddingTop: 10, marginTop: 6, borderTop: '1px solid var(--line-2)' }}>
              <div className="row" style={{ gap: 8, color: 'var(--warn-ink)', fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}><Icon name="flame" size={17} />超標懲罰</div>
              <div style={{ fontSize: 13, color: room.penaltyText ? 'var(--ink)' : 'var(--ink-3)', lineHeight: 1.5 }}>{room.penaltyText || '尚未設定懲罰'}</div>
            </div>
          </>
        )}
      </div>

      {/* 追蹤清單 */}
      <div className="card" style={{ marginTop: 12, padding: 16 }}>
        <div className="between" style={{ marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>追蹤的 App</span>
          {isOwner && <Chip kind="accent"><Icon name="crown" size={13} />房主可編輯</Chip>}
        </div>
        {room.trackedApps.length === 0 && <div style={{ fontSize: 13, color: 'var(--ink-2)', padding: '10px 0' }}>尚未設定追蹤清單。</div>}
        {room.trackedApps.map((a) => (
          <div className="approw" key={a.key}>
            <AppIcon glyph={a.glyph as IconName} color={a.color} />
            <div className="meta"><span className="nm">{a.name}</span></div>
          </div>
        ))}
      </div>

      {/* 週期 */}
      <div className="card" style={{ marginTop: 12 }}>
        {[{ ic: 'calendar' as const, t: '結算週期', v: room.cycle === 'WEEKLY' ? '每週' : '每日' }, { ic: 'clock' as const, t: '回報截止', v: `每天 ${room.reportDeadline}` }].map((r, i) => (
          <div key={i} className="between" style={{ padding: '11px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
            <span className="row" style={{ gap: 10, color: 'var(--ink-2)', fontSize: 14 }}><Icon name={r.ic} size={19} />{r.t}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{r.v}</span>
          </div>
        ))}
      </div>

      <button className="btn soft" style={{ marginTop: 14 }} onClick={onVote}><Icon name="chart" size={18} />規則與投票（改上限 / 改懲罰）</button>
      <button className="btn ghost" style={{ marginTop: 10 }} onClick={onSettlement}><Icon name="trophy" size={18} />看本期結算結果</button>
      {isOwner && <button className="btn ghost" style={{ marginTop: 10 }} onClick={onEditTracking}><Icon name="edit" size={17} />編輯追蹤清單</button>}
    </>
  );
}

type Msg = { id: string; kind: 'USER' | 'SYSTEM'; body: string; createdAt: string; name: string | null; initial: string | null; isMe: boolean };
const hashIdx = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

function Chat({ roomId }: { roomId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const load = useCallback(() => api.get<Msg[]>(`/api/rooms/${roomId}/messages`).then(setMsgs).catch(() => {}), [roomId]);
  useEffect(() => { void load(); const t = setInterval(() => void load(), 4000); return () => clearInterval(t); }, [load]);
  useEffect(() => { endRef.current?.scrollIntoView(); }, [msgs.length]);
  const send = async () => {
    const b = text.trim();
    if (!b) return;
    setText('');
    try { await api.post(`/api/rooms/${roomId}/messages`, { body: b }); await load(); } catch { /* ignore */ }
  };
  return (
    <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {msgs.length === 0 && <div className="center" style={{ color: 'var(--ink-3)', fontSize: 13, padding: 30 }}>還沒有訊息，開始聊吧</div>}
        {msgs.map((m) =>
          m.kind === 'SYSTEM' ? (
            <div key={m.id} className="sysline"><span className="st"><Icon name="info" size={15} />系統公告</span><span>{m.body}</span></div>
          ) : m.isMe ? (
            <div key={m.id} style={{ alignSelf: 'flex-end', maxWidth: '78%' }}><div className="bubble me">{m.body}</div></div>
          ) : (
            <div key={m.id} className="row" style={{ gap: 9, alignItems: 'flex-end' }}>
              <Avatar name={m.initial ?? '?'} idx={hashIdx(m.name ?? '')} size={32} />
              <div style={{ minWidth: 0, maxWidth: '78%' }}><div style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 3px 4px' }}>{m.name}</div><div className="bubble them">{m.body}</div></div>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>
      <div className="footerbar" style={{ display: 'flex', gap: 10 }}>
        <input className="input" style={{ flex: 1, padding: '10px 14px' }} value={text} placeholder="輸入訊息…"
          onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void send(); }} />
        <button className="center" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', flex: '0 0 auto' }} onClick={() => void send()} aria-label="送出"><Icon name="send" size={20} sw={1.9} /></button>
      </div>
    </div>
  );
}
