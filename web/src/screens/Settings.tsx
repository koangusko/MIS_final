import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, TabBar, Avatar, Chip } from '../components/ui';
import type { IconName } from '../lib/icons';

function Row({ ic, t, v, last }: { ic: IconName; t: string; v?: string; last?: boolean }) {
  return (
    <div className="between" style={{ padding: '13px 0', borderTop: last ? '1px solid var(--line-2)' : 'none' }}>
      <span className="row" style={{ gap: 12, fontSize: 14.5 }}><span style={{ color: 'var(--ink-2)' }}><Icon name={ic} size={20} /></span>{t}</span>
      <span className="row" style={{ gap: 6, color: 'var(--ink-3)', fontSize: 13 }}>{v}<Icon name="chevR" size={16} /></span>
    </div>
  );
}

export default function Settings() {
  const nav = useNavigate();
  return (
    <Phone>
      <div className="appbar"><div><h1>我的</h1></div></div>
      <div className="wrap scroll-body">
        {/* profile */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
          <Avatar name="宥" idx={2} size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>宥宥</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>yuyu@gmail.com</div>
          </div>
          <button className="btn ghost sm" style={{ padding: '8px 14px' }}>編輯</button>
        </div>

        {/* LINE binding — highlighted */}
        <div className="sectlabel">LINE 綁定</div>
        <div className="card" style={{ border: '1.5px solid var(--accent)', boxShadow: 'none' }}>
          <div className="between">
            <div className="row" style={{ gap: 11 }}>
              <span className="center" style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--good-soft)', color: 'var(--good-ink)' }}><Icon name="send" size={21} /></span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>綁定 LINE 接收推播</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>回報提醒、結算結果即時通知</div>
              </div>
            </div>
            <Chip kind="neutral">未綁定</Chip>
          </div>
          <div style={{ margin: '14px 0', padding: '14px', borderRadius: 12, background: 'var(--card)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 6 }}>你的綁定碼</div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 500, letterSpacing: 4, color: 'var(--ink)' }}>SP-7F4K</div>
          </div>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {['加入 ScreenPact LINE 官方帳號', '傳送上方綁定碼給 bot', '收到「綁定成功」即完成'].map((s, i) => (
              <li key={i} className="row" style={{ gap: 10, fontSize: 13, color: 'var(--ink-2)', padding: '5px 0' }}>
                <span className="center" style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-ink)', fontSize: 11, fontWeight: 700, flex: '0 0 auto' }}>{i + 1}</span>{s}
              </li>
            ))}
          </ol>
          <button className="btn primary" style={{ marginTop: 8 }}><Icon name="link" size={18} />加入 LINE 好友並綁定</button>
        </div>

        <div className="sectlabel">一般</div>
        <div className="card" style={{ padding: '4px 16px' }}>
          <Row ic="bell" t="通知設定" v="開啟" />
          <Row ic="lock" t="隱私與資料" last />
          <Row ic="info" t="關於 ScreenPact" v="v1.0" last />
        </div>
        <button className="btn outline" style={{ marginTop: 16, color: 'var(--warn-ink)', borderColor: 'var(--warn-soft)' }} onClick={() => nav('/login')}>登出</button>
      </div>
      <TabBar />
    </Phone>
  );
}
