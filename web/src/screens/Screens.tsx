import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone } from '../components/ui';

// Dev-only gallery: jump to every screen / state. Not part of the product flow.
const SECTIONS: { title: string; links: [string, string][] }[] = [
  { title: '登入 / 總覽', links: [['登入頁', '/login'], ['總覽（有資料）', '/'], ['總覽（無資料）', '/g/dashboard-empty']] },
  { title: '每日上傳', links: [['上傳頁', '/upload']] },
  { title: '房間（真實流程）', links: [['房間列表', '/rooms'], ['建立房間', '/rooms/new'], ['加入連結（失效範例）', '/join/expired']] },
  { title: '導覽分頁', links: [['通知中心', '/notifications'], ['我的 / LINE 綁定', '/me']] },
  { title: 'Phase 5 設計預覽（mock）', links: [['規則與投票', '/rooms/x/vote'], ['結算結果', '/rooms/x/settlement']] },
];

export default function Screens() {
  return (
    <Phone>
      <div className="appbar">
        <div>
          <h1>畫面總覽</h1>
          <div className="sub">Phase 1 驗收用 · 點任一項預覽</div>
        </div>
      </div>
      <div className="wrap scroll-body">
        {SECTIONS.map((s, i) => (
          <div key={i}>
            <div className="sectlabel" style={{ marginTop: i ? 18 : 4 }}>{s.title}</div>
            <div className="card" style={{ padding: '4px 16px' }}>
              {s.links.map(([label, to], j) => (
                <Link key={j} to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="between" style={{ padding: '13px 0', borderTop: j ? '1px solid var(--line-2)' : 'none' }}>
                    <span style={{ fontWeight: 700, fontSize: 14.5 }}>{label}</span>
                    <Icon name="chevR" size={18} style={{ color: 'var(--ink-3)' }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 18, lineHeight: 1.6 }}>
          全部為前端 mock 資料，尚未接後端。<br />Phase 2 起接 Google 登入、上傳解析、房間等 API。
        </div>
      </div>
    </Phone>
  );
}
