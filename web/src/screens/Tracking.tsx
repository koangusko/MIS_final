import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, PageHeader, AppIcon, Chip, CheckCircle } from '../components/ui';
import { api } from '../lib/api';
import type { IconName } from '../lib/icons';

type CatApp = { key: string; name: string; glyph: string; color: string };
type Group = { category: string; label: string; apps: CatApp[] };
type Tracked = { key: string; dailyCapMin: number | null };
type SelState = Record<string, { on: boolean; cap: string }>;

export default function Tracking() {
  const nav = useNavigate();
  const { id } = useParams();
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [sel, setSel] = useState<SelState>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<{ groups: Group[] }>('/api/catalog'),
      api.get<{ role: string; trackedApps: Tracked[] }>(`/api/rooms/${id}`),
    ])
      .then(([cat, room]) => {
        setGroups(cat.groups);
        const s: SelState = {};
        for (const t of room.trackedApps) s[t.key] = { on: true, cap: t.dailyCapMin ? String(t.dailyCapMin) : '' };
        setSel(s);
      })
      .catch(() => setGroups([]));
  }, [id]);

  const toggle = (key: string) => setSel((s) => ({ ...s, [key]: { on: !s[key]?.on, cap: s[key]?.cap ?? '' } }));
  const setCap = (key: string, cap: string) => setSel((s) => ({ ...s, [key]: { on: true, cap: cap.replace(/[^0-9]/g, '') } }));
  const count = Object.values(sel).filter((v) => v.on).length;

  const save = async () => {
    setBusy(true);
    const apps = Object.entries(sel)
      .filter(([, v]) => v.on)
      .map(([key, v]) => ({ key, dailyCapMin: v.cap ? Number(v.cap) : undefined }));
    try {
      await api.put(`/api/rooms/${id}/tracked-apps`, { apps });
      nav(`/rooms/${id}?tab=rule`, { replace: true });
    } catch {
      setBusy(false);
    }
  };

  return (
    <Phone>
      <PageHeader title="編輯追蹤清單" sub="勾選要一起控管的 App" right={<Chip kind="accent"><Icon name="crown" size={13} />房主</Chip>} />
      <div className="wrap scroll-body">
        {groups === null && <div className="center" style={{ padding: 40, color: 'var(--ink-3)' }}>載入中…</div>}
        {groups?.map((g, gi) => (
          <div key={g.category}>
            <div className="sectlabel" style={{ marginTop: gi ? 18 : 8 }}>{g.label}</div>
            <div className="card" style={{ padding: '4px 16px' }}>
              {g.apps.map((a, i) => {
                const on = !!sel[a.key]?.on;
                return (
                  <div key={a.key} style={{ borderTop: i ? '1px solid var(--line-2)' : 'none', padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                      <AppIcon glyph={a.glyph as IconName} color={a.color} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 14.5 }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: on ? 'var(--accent-ink)' : 'var(--ink-3)', marginTop: 2 }}>{on ? '追蹤中' : '未追蹤'}</div>
                      </div>
                      <button className="linkbtn" onClick={() => toggle(a.key)} aria-label="切換追蹤"><CheckCircle on={on} /></button>
                    </div>
                    {on && (
                      <div className="row" style={{ gap: 8, marginTop: 10, paddingLeft: 51 }}>
                        <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>每日上限</span>
                        <input className="input" inputMode="numeric" placeholder="不限" value={sel[a.key]?.cap ?? ''}
                          onChange={(e) => setCap(a.key, e.target.value)} style={{ width: 84, padding: '7px 10px', fontSize: 14 }} />
                        <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>分</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="card" style={{ marginTop: 16, background: 'var(--accent-soft)', boxShadow: 'none', display: 'flex', gap: 11, padding: 14 }}>
          <Icon name="info" size={18} style={{ color: 'var(--accent-ink)', flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'var(--accent-ink)', lineHeight: 1.55 }}>追蹤清單之後在聊天室的自動公告會於 Phase 6 上線。</div>
        </div>
      </div>
      <div className="footerbar">
        <button className="btn primary" disabled={busy || count === 0} onClick={save}>
          <Icon name="check" size={19} sw={2.2} />{busy ? '儲存中…' : `儲存（追蹤 ${count} 個 App）`}
        </button>
      </div>
    </Phone>
  );
}
