import { Icon } from '../components/Icon';
import { Phone, PageHeader, AppIcon, Chip, CheckCircle } from '../components/ui';
import type { IconName } from '../lib/icons';

type CatApp = { n: string; g: IconName; c: string; on: boolean; cap?: string };
const CATALOG: Record<string, CatApp[]> = {
  社交: [
    { n: '社群相簿', g: 'camera', c: '#a8728c', on: true, cap: '30 分' },
    { n: '動態社群', g: 'room', c: '#6d7fa3', on: false },
    { n: '微網誌', g: 'hourglass', c: '#7a7f86', on: false },
  ],
  短影音: [
    { n: '短影音 A', g: 'flame', c: '#5d6b73', on: true, cap: '40 分' },
    { n: '短影音 B', g: 'image', c: '#b06a5a', on: true, cap: '40 分' },
  ],
  其他: [
    { n: '影音平台', g: 'image', c: '#7d8a86', on: true, cap: '25 分' },
    { n: '串流音樂', g: 'chart', c: '#94937f', on: false },
  ],
};

export default function Tracking() {
  return (
    <Phone>
      <PageHeader title="編輯追蹤清單" sub="勾選要一起控管的 App"
        right={<Chip kind="accent"><Icon name="crown" size={13} />房主</Chip>} />
      <div className="wrap scroll-body">
        {Object.entries(CATALOG).map(([group, apps], gi) => (
          <div key={gi}>
            <div className="sectlabel" style={{ marginTop: gi ? 18 : 8 }}>{group}</div>
            <div className="card" style={{ padding: '4px 16px' }}>
              {apps.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
                  <AppIcon glyph={a.g} color={a.c} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14.5 }}>{a.n}</div>
                    {a.on
                      ? <div className="row" style={{ gap: 5, fontSize: 12, color: 'var(--accent-ink)', marginTop: 2 }}>每日上限 {a.cap}<Icon name="chevR" size={13} /></div>
                      : <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>未追蹤</div>}
                  </div>
                  <CheckCircle on={a.on} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="card" style={{ marginTop: 16, background: 'var(--accent-soft)', boxShadow: 'none', display: 'flex', gap: 11, padding: 14 }}>
          <Icon name="info" size={18} style={{ color: 'var(--accent-ink)', flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'var(--accent-ink)', lineHeight: 1.55 }}>儲存後，更新內容<b>將自動於聊天室公告</b>，提醒所有成員。</div>
        </div>
      </div>
      <div className="footerbar">
        <button className="btn primary"><Icon name="check" size={19} sw={2.2} />儲存並公告（追蹤 4 個 App）</button>
      </div>
    </Phone>
  );
}
