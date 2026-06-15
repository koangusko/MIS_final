import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, TabBar, Chip } from '../components/ui';
import { api } from '../lib/api';

type Room = { id: string; name: string; cycle: 'DAILY' | 'WEEKLY'; reportDeadline: string; memberCount: number; role: 'OWNER' | 'MEMBER' };

export default function RoomsList() {
  const nav = useNavigate();
  const [rooms, setRooms] = useState<Room[] | null>(null);

  useEffect(() => {
    api.get<Room[]>('/api/rooms').then(setRooms).catch(() => setRooms([]));
  }, []);

  return (
    <Phone>
      <div className="appbar">
        <div><h1>房間</h1></div>
        <button className="iconbtn" onClick={() => nav('/rooms/new')} aria-label="建立房間"><Icon name="plus" size={20} sw={2} /></button>
      </div>
      <div className="wrap scroll-body">
        {rooms === null && <div className="center" style={{ padding: 40, color: 'var(--ink-3)' }}>載入中…</div>}

        {rooms?.length === 0 && (
          <div className="card flat" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <span className="center" style={{ width: 50, height: 50, borderRadius: 15, background: 'var(--sand)', color: 'var(--ink-3)', margin: '0 auto 14px' }}><Icon name="room" size={26} /></span>
            <div style={{ fontWeight: 700, fontSize: 15 }}>還沒有房間</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '6px 0 4px' }}>建立一個找朋友，或用連結加入</div>
          </div>
        )}

        {rooms?.map((r) => (
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
        ))}

        <button className="btn soft" style={{ marginTop: 16 }} onClick={() => nav('/rooms/new')}><Icon name="plus" size={18} sw={2.2} />建立新房間</button>
      </div>
      <TabBar />
    </Phone>
  );
}
