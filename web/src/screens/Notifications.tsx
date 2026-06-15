import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, TabBar } from '../components/ui';
import { api } from '../lib/api';

type Item = { id: string; roomId: string; room: string; body: string; createdAt: string };

function when(iso: string): string {
  const d = new Date(iso);
  const t = new Date(d.getTime() + 8 * 3600 * 1000); // 台北
  const mm = String(t.getUTCMonth() + 1);
  const dd = String(t.getUTCDate());
  const hh = String(t.getUTCHours()).padStart(2, '0');
  const mi = String(t.getUTCMinutes()).padStart(2, '0');
  return `${mm}/${dd} ${hh}:${mi}`;
}

export default function Notifications() {
  const nav = useNavigate();
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    api.get<{ items: Item[] }>('/api/notifications').then((d) => setItems(d.items)).catch(() => setItems([]));
  }, []);

  return (
    <Phone>
      <div className="appbar"><div><h1>通知</h1></div></div>
      <div className="wrap scroll-body">
        {items === null && <div className="center" style={{ padding: 40, color: 'var(--ink-3)' }}>載入中…</div>}

        {items?.length === 0 && (
          <div className="card flat" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <span className="center" style={{ width: 50, height: 50, borderRadius: 15, background: 'var(--sand)', color: 'var(--ink-3)', margin: '0 auto 14px' }}><Icon name="bell" size={24} /></span>
            <div style={{ fontWeight: 700, fontSize: 15 }}>還沒有通知</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 6 }}>房間有結算、投票、成員異動時，會出現在這裡。</div>
          </div>
        )}

        {items && items.length > 0 && (
          <div className="card" style={{ padding: '4px 16px' }}>
            {items.map((it, i) => (
              <div key={it.id} role="button" onClick={() => nav(`/rooms/${it.roomId}?tab=chat`)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
                <span className="center" style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--accent-soft)', color: 'var(--accent-ink)', flex: '0 0 auto' }}><Icon name="info" size={19} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="between">
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{it.room}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--ink-3)', whiteSpace: 'nowrap', paddingLeft: 8 }}>{when(it.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.45 }}>{it.body}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <TabBar />
    </Phone>
  );
}
