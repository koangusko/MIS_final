import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, Avatar, AppIcon, Chip } from '../components/ui';
import { api } from '../lib/api';
import { ApiError } from '../lib/api';
import type { IconName } from '../lib/icons';

type Member = { id: string; name: string; initial: string; role: 'OWNER' | 'MEMBER'; isMe: boolean; idx: number };
type Tracked = { key: string; name: string; glyph: string; color: string; category: string; dailyCapMin: number | null };
type Room = {
  id: string; name: string; description: string | null;
  cycle: 'DAILY' | 'WEEKLY'; reportDeadline: string; role: 'OWNER' | 'MEMBER';
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

  useEffect(() => {
    api.get<Room>(`/api/rooms/${id}`).then(setRoom).catch((e: ApiError) => setErr(e.status === 403 ? '你不是這個房間的成員' : '找不到這個房間'));
  }, [id]);

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
      <div className="wrap" style={{ padding: '4px 16px 22px' }}>
        {tab === 'member' && <Members room={room} isOwner={isOwner} onInvite={() => nav(`/rooms/${room.id}/invite`)} />}
        {tab === 'rule' && <Rules room={room} isOwner={isOwner} onEdit={() => nav(`/rooms/${room.id}/tracking`)} />}
        {tab === 'chat' && <Placeholder icon="room" title="房間聊天室即將推出" desc="成員聊天與系統公告會在 Phase 6 上線。" />}
      </div>
    </Phone>
  );
}

function Members({ room, isOwner, onInvite }: { room: Room; isOwner: boolean; onInvite: () => void }) {
  return (
    <>
      <div className="between" style={{ margin: '4px 4px 10px' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-2)' }}>{room.members.length} 位成員</span>
        {isOwner && <button className="btn soft sm" style={{ padding: '7px 12px' }} onClick={onInvite}><Icon name="plus" size={15} sw={2} />邀請</button>}
      </div>
      <div className="card" style={{ padding: '6px 16px' }}>
        {room.members.map((m) => (
          <div className="lrow" key={m.id}>
            <Avatar name={m.initial} idx={m.idx} size={42} ring={m.isMe ? 2 : 0} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{m.name}{m.isMe && '（你）'}</div>
            </div>
            {m.role === 'OWNER' && <Chip kind="accent"><Icon name="crown" size={13} />房主</Chip>}
          </div>
        ))}
      </div>
      <div className="card flat" style={{ marginTop: 12, textAlign: 'center', padding: 14, fontSize: 12.5, color: 'var(--ink-2)' }}>
        每日上傳截圖回報用量；按{room.cycle === 'WEEKLY' ? '週' : '日'}結算後會顯示各成員達標狀況。
      </div>
    </>
  );
}

function Rules({ room, isOwner, onEdit }: { room: Room; isOwner: boolean; onEdit: () => void }) {
  return (
    <>
      <div className="card" style={{ padding: 16 }}>
        <div className="between" style={{ marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>追蹤的 App</span>
          {isOwner && <Chip kind="accent"><Icon name="crown" size={13} />房主可編輯</Chip>}
        </div>
        {room.trackedApps.length === 0 && <div style={{ fontSize: 13, color: 'var(--ink-2)', padding: '10px 0' }}>尚未設定追蹤清單。</div>}
        {room.trackedApps.map((a) => (
          <div className="approw" key={a.key}>
            <AppIcon glyph={a.glyph as IconName} color={a.color} />
            <div className="meta between" style={{ display: 'flex' }}>
              <span className="nm">{a.name}</span>
              <span className="mins tnum">{a.dailyCapMin ? `${a.dailyCapMin} 分` : '未設上限'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        {[{ ic: 'calendar' as const, t: '結算週期', v: room.cycle === 'WEEKLY' ? '每週' : '每日' }, { ic: 'clock' as const, t: '回報截止', v: `每天 ${room.reportDeadline}` }].map((r, i) => (
          <div key={i} className="between" style={{ padding: '11px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
            <span className="row" style={{ gap: 10, color: 'var(--ink-2)', fontSize: 14 }}><Icon name={r.ic} size={19} />{r.t}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{r.v}</span>
          </div>
        ))}
      </div>

      <div className="card flat" style={{ marginTop: 12, display: 'flex', gap: 10, padding: 14, fontSize: 12.5, color: 'var(--ink-2)' }}>
        <Icon name="flame" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
        <span>上限與超標懲罰、投票於 <b style={{ color: 'var(--ink)' }}>Phase 5</b> 上線。</span>
      </div>

      {isOwner && (
        <button className="btn ghost" style={{ marginTop: 14 }} onClick={onEdit}><Icon name="edit" size={17} />編輯追蹤清單</button>
      )}
    </>
  );
}

function Placeholder({ icon, title, desc }: { icon: IconName; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '50px 24px', gap: 12 }}>
      <span className="center" style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon name={icon} size={32} /></span>
      <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}
