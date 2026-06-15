import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, Avatar, AppIcon, APPS } from '../components/ui';

export default function Join() {
  const { token } = useParams();
  return token === 'expired' ? <JoinExpired /> : <JoinValid />;
}

function JoinValid() {
  const nav = useNavigate();
  const apps = [APPS.tk, APPS.ig, APPS.yt];
  return (
    <Phone>
      <div className="backbar">
        <button className="iconbtn" style={{ width: 36, height: 36 }} onClick={() => nav('/')} aria-label="返回"><Icon name="chevL" size={20} /></button>
        <div style={{ fontWeight: 900, fontSize: 19 }}>加入房間</div>
      </div>
      <div className="wrap scroll-body">
        <div className="card" style={{ textAlign: 'center', padding: '24px 20px 20px' }}>
          <span className="center" style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--accent-soft)', color: 'var(--accent)', margin: '0 auto 14px' }}><Icon name="room" size={30} /></span>
          <div style={{ fontWeight: 900, fontSize: 22 }}>沉澱小隊</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>下班後一起少滑一點，互相督促 💪</div>
          <div className="center" style={{ gap: 8, marginTop: 14 }}>
            <div className="row" style={{ marginLeft: 0 }}>
              {['宥', '庭', '晴', '安'].map((n, i) => (
                <span key={i} style={{ marginLeft: i ? -10 : 0, borderRadius: '50%', boxShadow: '0 0 0 2px var(--card-2)' }}><Avatar name={n} idx={i} size={30} /></span>
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 700 }}>已有 5 人</span>
          </div>
        </div>

        <div className="sectlabel">房間規則摘要</div>
        <div className="card">
          <div className="between" style={{ paddingBottom: 12, borderBottom: '1px solid var(--line-2)' }}>
            <span className="row" style={{ gap: 9, color: 'var(--ink-2)', fontSize: 13.5 }}><Icon name="calendar" size={18} />結算週期</span>
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>每日 · 截止 23:00</span>
          </div>
          <div style={{ padding: '12px 0' }}>
            <div className="row" style={{ gap: 9, color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 10 }}><Icon name="chart" size={18} />追蹤 App（上限合計 1時30分）</div>
            <div style={{ display: 'flex', gap: 14 }}>
              {apps.map((a, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                  <AppIcon glyph={a.glyph} color={a.color} size={40} />
                  <span style={{ fontSize: 11, color: 'var(--ink-2)', textAlign: 'center' }}>{a.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--line-2)' }}>
            <div className="row" style={{ gap: 9, color: 'var(--warn-ink)', fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}><Icon name="flame" size={18} />超標懲罰</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>超標者請室友喝一杯飲料 🧋；超過 30 分加碼掃地一週。</div>
          </div>
        </div>
      </div>
      <div className="footerbar">
        <button className="btn primary" onClick={() => nav('/rooms/sad')}><Icon name="check" size={19} sw={2.2} />加入房間</button>
      </div>
    </Phone>
  );
}

function JoinExpired() {
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
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.6 }}>
          邀請連結會在產生 7 天後自動失效。<br />請向房主索取新的連結或 QR code。
        </div>

        <div className="card flat" style={{ marginTop: 22, alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 12, padding: 14, textAlign: 'left' }}>
          <span className="center" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--warn-soft)', color: 'var(--warn-ink)', flex: '0 0 auto' }}><Icon name="clock" size={20} /></span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>連結於 6 月 8 日過期</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>房主可在房間內重新產生</div>
          </div>
        </div>

        <div style={{ alignSelf: 'stretch', marginTop: 22 }}>
          <button className="btn primary"><Icon name="send" size={18} sw={1.9} />向房主索取新連結</button>
          <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => nav('/')}>回到總覽</button>
        </div>
      </div>
    </Phone>
  );
}
