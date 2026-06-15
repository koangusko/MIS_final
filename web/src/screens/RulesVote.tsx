import { Icon } from '../components/Icon';
import { Phone, PageHeader, Chip } from '../components/ui';

export default function RulesVote() {
  const opts: { t: string; v: number; pct: number; mine?: boolean }[] = [
    { t: '維持 40 分', v: 1, pct: 20 },
    { t: '改為 30 分', v: 2, pct: 40, mine: true },
    { t: '改為 20 分', v: 1, pct: 20 },
  ];
  return (
    <Phone>
      <PageHeader title="規則與投票" sub="沉澱小隊" />
      <div className="wrap scroll-body">
        {/* current rule snapshot */}
        <div className="card" style={{ padding: 16 }}>
          <div className="between" style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>目前規則</span>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }} className="row">查看全部<Icon name="chevR" size={14} /></span>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Chip kind="neutral">短影音 40 分</Chip>
            <Chip kind="neutral">社群 30 分</Chip>
            <Chip kind="neutral">每日結算</Chip>
            <Chip kind="neutral">截止 23:00</Chip>
          </div>
        </div>

        <button className="btn soft" style={{ marginTop: 14 }}><Icon name="plus" size={18} sw={2.2} />發起提案（改上限 / 改懲罰）</button>

        <div className="sectlabel">進行中的提案</div>
        {/* active proposal */}
        <div className="card">
          <div className="between" style={{ marginBottom: 4 }}>
            <Chip kind="accent" dot>投票中</Chip>
            <span className="row" style={{ gap: 5, fontSize: 12, color: 'var(--warn-ink)' }}><Icon name="clock" size={14} />剩 1 天</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, margin: '10px 0 4px' }}>短影音每日上限要調整嗎？</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 14 }}>庭瑄 發起 · 通過門檻 ≥ 半數（需 3 / 5 票）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {opts.map((o, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: o.mine ? '1.5px solid var(--accent)' : '1px solid var(--line)', padding: '11px 13px' }}>
                <div style={{ position: 'absolute', inset: 0, background: o.mine ? 'var(--accent-soft)' : 'var(--sand)', width: o.pct + '%', opacity: o.mine ? 1 : 0.6 }} />
                <div className="between" style={{ position: 'relative' }}>
                  <span className="row" style={{ gap: 8, fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>{o.mine && <Icon name="checkCircle" size={17} style={{ color: 'var(--accent)' }} />}{o.t}</span>
                  <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)' }}>{o.v} 票</span>
                </div>
              </div>
            ))}
          </div>
          <div className="between" style={{ marginTop: 13 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>已投 4 / 5 票 · 你已投「改為 30 分」</span>
            <button className="btn ghost sm" style={{ padding: '8px 14px' }}>改投</button>
          </div>
        </div>

        {/* second proposal — waiting */}
        <div className="card" style={{ opacity: 0.92 }}>
          <div className="between" style={{ marginBottom: 8 }}>
            <Chip kind="neutral">尚未投票</Chip>
            <span className="row" style={{ gap: 5, fontSize: 12, color: 'var(--ink-3)' }}><Icon name="clock" size={14} />剩 2 天</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>超標懲罰改成「請喝手搖」？</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '6px 0 12px' }}>哲哲 發起 · 需 3 / 5 票</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn outline sm block">反對</button>
            <button className="btn primary sm block">贊成</button>
          </div>
        </div>
      </div>
    </Phone>
  );
}
