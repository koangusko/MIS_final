import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, PageHeader, Chip, Bar } from '../components/ui';
import { api } from '../lib/api';

type Proposal = {
  id: string; kind: 'CHANGE_CAP' | 'CHANGE_PENALTY'; title: string; creator: string;
  approve: number; reject: number; need: number; memberCount: number;
  myVote: 'approve' | 'reject' | null; status: 'OPEN' | 'PASSED' | 'REJECTED' | 'EXPIRED'; closesAt: string;
};
type Room = { totalCapMin: number | null; penaltyText: string | null };

export default function RulesVote() {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [list, setList] = useState<{ memberCount: number; need: number; proposals: Proposal[] } | null>(null);
  const [creating, setCreating] = useState(false);
  const [kind, setKind] = useState<'CHANGE_CAP' | 'CHANGE_PENALTY'>('CHANGE_CAP');
  const [cap, setCap] = useState('');
  const [penalty, setPenalty] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [r, l] = await Promise.all([
      api.get<Room>(`/api/rooms/${id}`),
      api.get<{ memberCount: number; need: number; proposals: Proposal[] }>(`/api/rooms/${id}/proposals`),
    ]);
    setRoom(r);
    setList(l);
  }, [id]);
  useEffect(() => { void load().catch(() => setList({ memberCount: 0, need: 0, proposals: [] })); }, [load]);

  const submit = async () => {
    setBusy(true);
    try {
      const body = kind === 'CHANGE_CAP' ? { kind, newCapMin: Number(cap) } : { kind, newPenaltyText: penalty };
      await api.post(`/api/rooms/${id}/proposals`, body);
      setCreating(false); setCap(''); setPenalty('');
      await load();
    } catch { /* ignore */ } finally { setBusy(false); }
  };
  const vote = async (pid: string, approve: boolean) => {
    try { await api.post(`/api/proposals/${pid}/vote`, { approve }); await load(); } catch { /* ignore */ }
  };

  return (
    <Phone>
      <PageHeader title="規則與投票" />
      <div className="wrap scroll-body">
        {/* current rule snapshot */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>目前規則</div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Chip kind="neutral">合計上限 {room?.totalCapMin ? `${room.totalCapMin} 分` : '未設定'}</Chip>
            <Chip kind="neutral">{room?.penaltyText ? `懲罰：${room.penaltyText.slice(0, 12)}${room.penaltyText.length > 12 ? '…' : ''}` : '未設懲罰'}</Chip>
          </div>
        </div>

        {!creating ? (
          <button className="btn soft" style={{ marginTop: 14 }} onClick={() => setCreating(true)}><Icon name="plus" size={18} sw={2.2} />發起提案（改上限 / 改懲罰）</button>
        ) : (
          <div className="card" style={{ marginTop: 14, padding: 16 }}>
            <div className="seg" style={{ display: 'flex', width: '100%', marginBottom: 12 }}>
              <button className={kind === 'CHANGE_CAP' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setKind('CHANGE_CAP')}>改上限</button>
              <button className={kind === 'CHANGE_PENALTY' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setKind('CHANGE_PENALTY')}>改懲罰</button>
            </div>
            {kind === 'CHANGE_CAP' ? (
              <div className="field" style={{ marginBottom: 12 }}>
                <label>新的合計上限（分）</label>
                <input className="input" inputMode="numeric" placeholder="例：90" value={cap} onChange={(e) => setCap(e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
            ) : (
              <div className="field" style={{ marginBottom: 12 }}>
                <label>新的懲罰文字</label>
                <textarea className="input" rows={2} placeholder="例：超標者請喝手搖 🧋" value={penalty} onChange={(e) => setPenalty(e.target.value)} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn ghost sm block" onClick={() => setCreating(false)}>取消</button>
              <button className="btn primary sm block" disabled={busy || (kind === 'CHANGE_CAP' ? !cap : !penalty.trim())} onClick={submit}>{busy ? '送出中…' : '發起'}</button>
            </div>
          </div>
        )}

        <div className="sectlabel">提案</div>
        {list && list.proposals.length === 0 && (
          <div className="card flat" style={{ textAlign: 'center', padding: '24px 20px', fontSize: 13, color: 'var(--ink-2)' }}>還沒有提案。發起一個來改規則吧。</div>
        )}
        {list?.proposals.map((p) => {
          const open = p.status === 'OPEN';
          const pct = p.need ? (p.approve / p.need) * 100 : 0;
          return (
            <div className="card" key={p.id}>
              <div className="between" style={{ marginBottom: 4 }}>
                {p.status === 'PASSED' ? <Chip kind="good" dot>已通過</Chip>
                  : p.status === 'EXPIRED' ? <Chip kind="neutral">已過期</Chip>
                  : p.status === 'REJECTED' ? <Chip kind="warn">已否決</Chip>
                  : <Chip kind="accent" dot>投票中</Chip>}
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.creator} 發起</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, margin: '8px 0 10px' }}>{p.title}</div>
              <div className="between" style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 6 }}>
                <span>贊成 {p.approve} / 需 {p.need} 票（共 {p.memberCount} 人）</span>
                {p.reject > 0 && <span>反對 {p.reject}</span>}
              </div>
              <Bar pct={pct} state={p.status === 'PASSED' ? 'good' : ''} />
              {open && (
                <div style={{ display: 'flex', gap: 10, marginTop: 13 }}>
                  <button className={'btn sm block ' + (p.myVote === 'reject' ? 'warn' : 'outline')} onClick={() => vote(p.id, false)}>反對{p.myVote === 'reject' && ' ✓'}</button>
                  <button className={'btn sm block ' + (p.myVote === 'approve' ? 'primary' : 'soft')} onClick={() => vote(p.id, true)}>贊成{p.myVote === 'approve' && ' ✓'}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Phone>
  );
}
