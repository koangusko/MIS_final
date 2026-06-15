import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone } from '../components/ui';
import { api } from '../lib/api';

type Invite = { token: string; url: string; expiresAt: string | null; qrDataUrl: string };
type Room = { id: string; name: string; invite?: Invite };

export default function InviteSuccess() {
  const nav = useNavigate();
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get<Room>(`/api/rooms/${id}`).then(setRoom).catch(() => setRoom(null));
  }, [id]);

  const invite = room?.invite;
  const expiry = invite?.expiresAt ? new Date(invite.expiresAt) : null;

  const copy = async () => {
    if (!invite) return;
    try { await navigator.clipboard.writeText(invite.url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };
  const regenerate = async () => {
    setBusy(true);
    try {
      const { invite: ni } = await api.post<{ invite: Invite }>(`/api/rooms/${id}/invite/regenerate`);
      setRoom((r) => (r ? { ...r, invite: ni } : r));
    } catch { /* ignore */ } finally { setBusy(false); }
  };
  const share = async () => {
    if (!invite) return;
    if (navigator.share) { try { await navigator.share({ title: room?.name, url: invite.url }); return; } catch { /* fallthrough */ } }
    copy();
  };

  return (
    <Phone>
      <div className="backbar">
        <div style={{ width: 36 }} />
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 900, fontSize: 18 }}>邀請朋友加入</div>
        <button className="iconbtn" style={{ width: 36, height: 36 }} onClick={() => nav(`/rooms/${id}`)} aria-label="關閉"><Icon name="x" size={19} /></button>
      </div>
      <div className="wrap scroll-body" style={{ textAlign: 'center' }}>
        <span className="center" style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--good-soft)', color: 'var(--good-ink)', margin: '6px auto 12px' }}>
          <Icon name="checkCircle" size={30} sw={1.7} />
        </span>
        <div style={{ fontWeight: 900, fontSize: 21 }}>「{room?.name ?? '房間'}」建好了！</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 6 }}>掃描 QR 或分享連結，邀朋友一起加入</div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '22px 0 18px' }}>
          <div className="qrbox">
            {invite ? <img src={invite.qrDataUrl} alt="邀請 QR" style={{ width: 172, height: 172 }} /> : <div className="center" style={{ width: 172, height: 172, color: 'var(--ink-3)' }}>產生中…</div>}
          </div>
        </div>

        <div className="card flat" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', textAlign: 'left' }}>
          <Icon name="link" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <span className="mono" style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-2)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{invite?.url ?? '…'}</span>
          <button className="btn soft sm" style={{ padding: '8px 12px' }} onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={16} />{copied ? '已複製' : '複製'}</button>
        </div>

        <div className="card" style={{ marginTop: 12, display: 'flex', gap: 11, padding: 14, textAlign: 'left', background: 'var(--card)', boxShadow: 'none' }}>
          <Icon name="info" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
            邀請連結將於 <b style={{ color: 'var(--ink)' }}>{expiry ? `${expiry.getMonth() + 1} 月 ${expiry.getDate()} 日` : '7 天後'}</b> 失效。失效後可隨時重新產生。
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn ghost block sm" disabled={busy} onClick={regenerate}><Icon name="refresh" size={17} />{busy ? '產生中…' : '重新產生'}</button>
          <button className="btn primary block sm" onClick={share}><Icon name="send" size={17} />分享連結</button>
        </div>
      </div>
    </Phone>
  );
}
