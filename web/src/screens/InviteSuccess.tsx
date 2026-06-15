import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, QRPlaceholder } from '../components/ui';

export default function InviteSuccess() {
  const nav = useNavigate();
  return (
    <Phone>
      <div className="backbar">
        <div style={{ width: 36 }} />
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 900, fontSize: 18 }}>邀請朋友加入</div>
        <button className="iconbtn" style={{ width: 36, height: 36 }} onClick={() => nav('/rooms/sad')} aria-label="關閉"><Icon name="x" size={19} /></button>
      </div>
      <div className="wrap scroll-body" style={{ textAlign: 'center' }}>
        <span className="center" style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--good-soft)', color: 'var(--good-ink)', margin: '6px auto 12px' }}>
          <Icon name="checkCircle" size={30} sw={1.7} />
        </span>
        <div style={{ fontWeight: 900, fontSize: 21 }}>「沉澱小隊」建好了！</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 6 }}>掃描 QR 或分享連結，邀朋友一起加入</div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '22px 0 18px' }}>
          <div className="qrbox"><QRPlaceholder size={172} /></div>
        </div>

        <div className="card flat" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', textAlign: 'left' }}>
          <Icon name="link" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <span className="mono" style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-2)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>screenpact.app/j/9F4K-2QXP</span>
          <button className="btn soft sm" style={{ padding: '8px 12px' }}><Icon name="copy" size={16} />複製</button>
        </div>

        <div className="card" style={{ marginTop: 12, display: 'flex', gap: 11, padding: 14, textAlign: 'left', background: 'var(--card)', boxShadow: 'none' }}>
          <Icon name="info" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>邀請連結將於 <b style={{ color: 'var(--ink)' }}>7 天後失效</b>。失效後可隨時重新產生新的連結與 QR。</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn ghost block sm"><Icon name="refresh" size={17} />重新產生</button>
          <button className="btn primary block sm"><Icon name="send" size={17} />分享連結</button>
        </div>
      </div>
    </Phone>
  );
}
