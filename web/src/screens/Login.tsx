import { Icon } from '../components/Icon';
import { Phone } from '../components/ui';
import type { IconName } from '../lib/icons';

const SELLS: { icon: IconName; t: string; d: string }[] = [
  { icon: 'chart', t: '一眼看懂用了多久', d: '上傳螢幕使用時間截圖，自動讀出各 App 時數' },
  { icon: 'room', t: '和朋友互相監督', d: '開房間、設上限、按日／週一起結算' },
  { icon: 'flame', t: '輕量遊戲化', d: '連續達標、排行榜、徽章，鼓勵不羞辱' },
];

export default function Login() {
  // 導去後端開始 Google OAuth（整頁跳轉，非 fetch）
  const signIn = () => {
    window.location.href = '/api/auth/google';
  };
  return (
    <Phone>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 26px', overflowY: 'auto' }}>
        <div style={{ flex: '0 0 auto', paddingTop: 56, textAlign: 'center' }}>
          <div className="center" style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--accent)', color: '#fff', margin: '0 auto 22px', boxShadow: '0 8px 22px rgba(63,128,122,.32)' }}>
            <Icon name="hourglass" size={36} sw={1.7} />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.8, margin: 0 }}>時間公約</h1>
          <div style={{ fontSize: 15, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.6 }}>
            跟朋友互相監督，<br />一起少滑一點社群與短影音。
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '34px 0' }}>
          {SELLS.map((s, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
              <span className="center" style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--accent-soft)', color: 'var(--accent)', flex: '0 0 auto' }}>
                <Icon name={s.icon} size={22} />
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.t}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.45 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: '0 0 auto', paddingBottom: 24 }}>
          <button className="btn ghost" style={{ borderRadius: 16 }} onClick={signIn}>
            <span className="center" style={{ color: '#4285F4' }}><Icon name="google" size={20} sw={1.9} /></span>
            使用 Google 登入
          </button>
          <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', marginTop: 14, lineHeight: 1.5 }}>
            登入即表示同意服務條款與隱私權政策<br />截圖只用於讀取時數，不會公開
          </div>
        </div>
      </div>
    </Phone>
  );
}
