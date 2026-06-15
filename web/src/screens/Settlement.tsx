import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, PageHeader, Avatar, Bar, Chip } from '../components/ui';
import { api } from '../lib/api';

type MemberResult = {
  userId: string; name: string; initial: string; isMe: boolean; rank: number;
  totalMin: number; overMin: number; passed: boolean; reported: boolean; penaltyText: string | null;
};
type Result = {
  hasResult: boolean;
  period?: { start: string; end: string };
  cycle?: 'DAILY' | 'WEEKLY';
  capMin?: number;
  summary?: { passed: number; failed: number; avg: number; total: number };
  members?: MemberResult[];
};

const md = (iso: string) => { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()}`; };

export default function Settlement() {
  const nav = useNavigate();
  const { id } = useParams();
  const [r, setR] = useState<Result | null>(null);

  useEffect(() => {
    api.get<Result>(`/api/rooms/${id}/settlement`).then(setR).catch(() => setR({ hasResult: false }));
  }, [id]);

  if (!r) return <Phone><div className="wrap center" style={{ color: 'var(--ink-3)' }}>載入中…</div></Phone>;

  if (!r.hasResult) {
    return (
      <Phone>
        <PageHeader title="本期結算" close onBack={() => nav(`/rooms/${id}`)} />
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center', gap: 12 }}>
          <span className="center" style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon name="trophy" size={32} /></span>
          <div style={{ fontWeight: 700, fontSize: 16 }}>還沒有結算結果</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>到房主設定的回報截止時間後<br />會自動結算並顯示在這裡。<br />（記得先在「規則」設定總上限）</div>
        </div>
      </Phone>
    );
  }

  const s = r.summary!;
  const periodLabel = r.period!.start === r.period!.end ? md(r.period!.start) : `${md(r.period!.start)}–${md(r.period!.end)}`;
  return (
    <Phone>
      <PageHeader title="本期結算" sub={`${periodLabel} · ${r.cycle === 'WEEKLY' ? '每週結算' : '每日結算'}`} close onBack={() => nav(`/rooms/${id}`)} />
      <div className="wrap scroll-body">
        {/* hero */}
        <div className="card" style={{ textAlign: 'center', padding: '22px 20px', background: 'var(--accent)', color: '#fff', boxShadow: '0 8px 22px rgba(63,128,122,.28)' }}>
          <div style={{ fontSize: 13, opacity: 0.85 }}>本期結果</div>
          <div style={{ fontWeight: 900, fontSize: 22, margin: '6px 0 16px' }}>
            {s.failed === 0 ? `全員守住了 🎉` : `${s.passed} 人守住，${s.failed} 人超標`}
          </div>
          <div className="row" style={{ justifyContent: 'center', gap: 0 }}>
            <div style={{ flex: 1 }}><div className="bignum" style={{ fontSize: 32 }}>{s.passed}</div><div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>達標</div></div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,.25)' }} />
            <div style={{ flex: 1 }}><div className="bignum" style={{ fontSize: 32 }}>{s.failed}</div><div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>超標/未報</div></div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,.25)' }} />
            <div style={{ flex: 1 }}><div className="bignum" style={{ fontSize: 32 }}>{s.avg}<span style={{ fontSize: 14 }}>分</span></div><div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>平均</div></div>
          </div>
        </div>

        <div className="sectlabel">成員結果（上限 {r.capMin} 分）</div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {r.members!.map((m) => (
            <div className="lrow" key={m.userId}>
              <span className="tnum" style={{ width: 18, fontWeight: 900, color: 'var(--ink-3)', fontSize: 14 }}>{m.rank}</span>
              <Avatar name={m.initial} idx={m.rank} size={40} ring={m.isMe ? 2 : 0} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="between">
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{m.name}{m.isMe && '（你）'}</span>
                  <span className="tnum" style={{ fontWeight: 700, fontSize: 14, color: m.passed ? 'var(--ink)' : 'var(--warn-ink)' }}>{m.reported ? `${m.totalMin} 分` : '未回報'}</span>
                </div>
                <div className="row" style={{ gap: 8, marginTop: 6 }}>
                  <div style={{ flex: 1 }}><Bar pct={r.capMin ? (m.totalMin / r.capMin) * 100 : 0} state={m.passed ? 'good' : 'over'} /></div>
                  {m.passed ? <Chip kind="good">達標</Chip> : m.reported ? <Chip kind="warn">超 {m.overMin} 分</Chip> : <Chip kind="warn" dot>未回報</Chip>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* penalty */}
        {r.members!.some((m) => !m.passed && m.penaltyText) && (
          <div className="card" style={{ marginTop: 14, background: 'var(--warn-soft)', boxShadow: 'none' }}>
            <div className="row" style={{ gap: 8, color: 'var(--warn-ink)', fontWeight: 700, fontSize: 14, marginBottom: 8 }}><Icon name="flame" size={18} />套用懲罰</div>
            <div style={{ fontSize: 13, color: 'var(--warn-ink)', lineHeight: 1.55, marginBottom: 10 }}>{r.members!.find((m) => m.penaltyText)?.penaltyText}</div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              {r.members!.filter((m) => !m.passed).map((m) => <Chip key={m.userId} kind="warn">{m.name}</Chip>)}
            </div>
          </div>
        )}
      </div>
    </Phone>
  );
}
