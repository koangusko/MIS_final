import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, AppIcon } from '../components/ui';
import { api } from '../lib/api';
import type { IconName } from '../lib/icons';

type Preview = {
  valid: boolean;
  expired?: boolean;
  alreadyMember?: boolean;
  room?: {
    id: string;
    name: string;
    description: string | null;
    cycle: 'DAILY' | 'WEEKLY';
    reportDeadline: string;
    memberCount: number;
    trackedApps: { key: string; name: string; glyph: string; color: string }[];
  };
};

export default function Join() {
  const { token } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get<Preview>(`/api/rooms/join/${token}`).then(setP).catch(() => setP({ valid: false }));
  }, [token]);

  const join = async () => {
    setBusy(true);
    try {
      const { roomId } = await api.post<{ roomId: string }>(`/api/rooms/join/${token}`);
      nav(`/rooms/${roomId}`, { replace: true });
    } catch {
      setBusy(false);
    }
  };

  if (!p) return <Phone><div className="wrap center" style={{ color: 'var(--ink-3)' }}>載入中…</div></Phone>;
  if (!p.valid || !p.room) return <Expired />;

  const r = p.room;
  return (
    <Phone>
      <div className="backbar">
        <button className="iconbtn" style={{ width: 36, height: 36 }} onClick={() => nav('/')} aria-label="返回"><Icon name="chevL" size={20} /></button>
        <div style={{ fontWeight: 900, fontSize: 19 }}>加入房間</div>
      </div>
      <div className="wrap scroll-body">
        <div className="card" style={{ textAlign: 'center', padding: '24px 20px 20px' }}>
          <span className="center" style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--accent-soft)', color: 'var(--accent)', margin: '0 auto 14px' }}><Icon name="room" size={30} /></span>
          <div style={{ fontWeight: 900, fontSize: 22 }}>{r.name}</div>
          {r.description && <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>{r.description}</div>}
          <div className="center" style={{ gap: 8, marginTop: 14 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 700 }}>已有 {r.memberCount} 人</span>
          </div>
        </div>

        <div className="sectlabel">房間規則摘要</div>
        <div className="card">
          <div className="between" style={{ paddingBottom: 12, borderBottom: '1px solid var(--line-2)' }}>
            <span className="row" style={{ gap: 9, color: 'var(--ink-2)', fontSize: 13.5 }}><Icon name="calendar" size={18} />結算週期</span>
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>{r.cycle === 'WEEKLY' ? '每週' : '每日'} · 截止 {r.reportDeadline}</span>
          </div>
          <div style={{ paddingTop: 12 }}>
            <div className="row" style={{ gap: 9, color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 10 }}><Icon name="chart" size={18} />追蹤 App（{r.trackedApps.length} 個）</div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {r.trackedApps.map((a) => (
                <div key={a.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 64 }}>
                  <AppIcon glyph={a.glyph as IconName} color={a.color} size={40} />
                  <span style={{ fontSize: 11, color: 'var(--ink-2)', textAlign: 'center' }}>{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="footerbar">
        <button className="btn primary" disabled={busy} onClick={join}>
          <Icon name="check" size={19} sw={2.2} />{p.alreadyMember ? '已加入，進入房間' : busy ? '加入中…' : '加入房間'}
        </button>
      </div>
    </Phone>
  );
}

function Expired() {
  const nav = useNavigate();
  return (
    <Phone>
      <div className="backbar">
        <button className="iconbtn" style={{ width: 36, height: 36 }} onClick={() => nav('/')} aria-label="返回"><Icon name="chevL" size={20} /></button>
        <div style={{ fontWeight: 900, fontSize: 19 }}>加入房間</div>
      </div>
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
        <span className="center" style={{ width: 92, height: 92, borderRadius: 28, background: 'var(--sand)', color: 'var(--ink-3)', marginBottom: 22 }}><Icon name="link" size={42} sw={1.4} /></span>
        <div style={{ fontWeight: 900, fontSize: 21 }}>這個邀請連結已失效</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.6 }}>連結可能已過期或不存在。<br />請向房主索取新的連結或 QR code。</div>
        <div style={{ alignSelf: 'stretch', marginTop: 22 }}>
          <button className="btn primary" onClick={() => nav('/')}>回到總覽</button>
        </div>
      </div>
    </Phone>
  );
}
