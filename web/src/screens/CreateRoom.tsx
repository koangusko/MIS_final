import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, PageHeader } from '../components/ui';
import { api } from '../lib/api';

export default function CreateRoom() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [cycle, setCycle] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [deadline, setDeadline] = useState('23:00');
  const [desc, setDesc] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) { setError('請輸入房間名稱'); return; }
    setBusy(true);
    setError(null);
    try {
      const { id } = await api.post<{ id: string }>('/api/rooms', { name, cycle, reportDeadline: deadline, description: desc });
      nav(`/rooms/${id}/invite`, { replace: true });
    } catch {
      setError('建立失敗，請再試一次');
      setBusy(false);
    }
  };

  return (
    <Phone>
      <PageHeader title="建立房間" />
      <div className="wrap scroll-body">
        <div className="field">
          <label>房間名稱</label>
          <input className="input" placeholder="請輸入房間名稱" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <label>結算週期</label>
          <div className="seg" style={{ display: 'flex', width: '100%' }}>
            <button className={cycle === 'DAILY' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setCycle('DAILY')}>每日結算</button>
            <button className={cycle === 'WEEKLY' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setCycle('WEEKLY')}>每週結算</button>
          </div>
        </div>

        <div className="field">
          <label>回報截止時間</label>
          <div className="input between" style={{ display: 'flex', alignItems: 'center' }}>
            <span className="row" style={{ gap: 10, color: 'var(--ink-2)' }}><Icon name="clock" size={19} /></span>
            <input type="time" value={deadline} onChange={(e) => setDeadline(e.target.value)}
              style={{ border: 'none', background: 'transparent', font: 'inherit', color: 'var(--ink)', fontWeight: 700, flex: 1, textAlign: 'right' }} />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '7px 4px 0' }}>超過此時間未回報，視為當期未達標。</div>
        </div>

        <div className="field">
          <label>房間說明（選填）</label>
          <textarea className="input" rows={3} placeholder="例：下班後一起少滑一點，互相督促 💪" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>

        <div className="card flat" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, marginTop: 4 }}>
          <span className="center" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-soft)', color: 'var(--accent)', flex: '0 0 auto' }}><Icon name="chart" size={20} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>追蹤清單與上限</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>建立後可設定（預設：社群＋短影音）</div>
          </div>
          <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />
        </div>

        {error && (
          <div className="card" style={{ marginTop: 14, background: 'var(--warn-soft)', boxShadow: 'none', color: 'var(--warn-ink)', fontSize: 13 }}>
            <span className="row" style={{ gap: 8 }}><Icon name="alert" size={16} />{error}</span>
          </div>
        )}
      </div>
      <div className="footerbar">
        <button className="btn primary" disabled={busy} onClick={submit}>
          <Icon name="plus" size={19} sw={2.2} />{busy ? '建立中…' : '建立並產生邀請'}
        </button>
      </div>
    </Phone>
  );
}
