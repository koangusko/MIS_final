import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone } from '../components/ui';

// Dev-only gallery: jump to every screen / state. Not part of the product flow.
const SECTIONS: { title: string; links: [string, string][] }[] = [
  { title: '① 登入', links: [['登入頁', '/login']] },
  { title: '② 個人總覽', links: [['有資料', '/'], ['無資料（首次）', '/g/dashboard-empty']] },
  { title: '③ 每日上傳', links: [['空', '/upload?state=empty'], ['解析中', '/upload?state=parsing'], ['成功確認', '/upload?state=success'], ['失敗重傳', '/upload?state=fail']] },
  { title: '④ 房間詳情', links: [['成員', '/rooms/sad?tab=member'], ['規則', '/rooms/sad?tab=rule'], ['排行', '/rooms/sad?tab=rank'], ['聊天', '/rooms/sad?tab=chat']] },
  { title: '⑤ 建立房間 + 邀請', links: [['建立房間', '/rooms/new'], ['邀請成功', '/rooms/new/invite']] },
  { title: '⑥ 加入房間預覽', links: [['連結有效', '/join/9F4K-2QXP'], ['連結已失效', '/join/expired']] },
  { title: '導覽分頁', links: [['房間列表', '/rooms'], ['通知中心', '/notifications'], ['我的 / LINE 綁定', '/me']] },
  { title: 'P1（提前實作的 mock）', links: [['追蹤清單設定', '/rooms/sad/tracking'], ['規則與投票', '/rooms/sad/vote'], ['結算結果', '/rooms/sad/settlement']] },
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
