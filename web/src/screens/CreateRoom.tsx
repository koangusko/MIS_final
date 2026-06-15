import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, PageHeader } from '../components/ui';

export default function CreateRoom() {
  const nav = useNavigate();
  const [cycle, setCycle] = useState<'daily' | 'weekly'>('daily');
  return (
    <Phone>
      <PageHeader title="建立房間" />
      <div className="wrap scroll-body">
        <div className="field">
          <label>房間名稱</label>
          <input className="input" defaultValue="沉澱小隊" />
        </div>

        <div className="field">
          <label>結算週期</label>
          <div className="seg" style={{ display: 'flex', width: '100%' }}>
            <button className={cycle === 'daily' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setCycle('daily')}>每日結算</button>
            <button className={cycle === 'weekly' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setCycle('weekly')}>每週結算</button>
          </div>
        </div>

        <div className="field">
          <label>回報截止時間</label>
          <div className="input between" style={{ display: 'flex' }}>
            <span className="row" style={{ gap: 10, color: 'var(--ink-2)' }}><Icon name="clock" size={19} /><span style={{ color: 'var(--ink)', fontWeight: 700 }}>每天 23:00</span></span>
            <Icon name="chevD" size={18} style={{ color: 'var(--ink-3)' }} />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '7px 4px 0' }}>超過此時間未回報，視為當期未達標。</div>
        </div>

        <div className="field">
          <label>房間說明（選填）</label>
          <textarea className="input" rows={3} defaultValue="下班後一起少滑一點，互相督促 💪" />
        </div>

        <div className="card flat" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, marginTop: 4 }}>
          <span className="center" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-soft)', color: 'var(--accent)', flex: '0 0 auto' }}><Icon name="chart" size={20} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>追蹤清單與上限</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>建立後可設定（預設：社群＋短影音）</div>
          </div>
          <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />
        </div>
      </div>
      <div className="footerbar">
        <button className="btn primary" onClick={() => nav('/rooms/new/invite')}><Icon name="plus" size={19} sw={2.2} />建立並產生邀請</button>
      </div>
    </Phone>
  );
}
