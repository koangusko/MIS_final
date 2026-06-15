import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, TabBar, Avatar, Chip } from '../components/ui';
import { useAuth, logout } from '../lib/auth';
import { api } from '../lib/api';

type Binding = { bound: boolean; code?: string; addFriendUrl?: string };

export default function Settings() {
  const nav = useNavigate();
  const { user, refresh } = useAuth();
  const [binding, setBinding] = useState<Binding | null>(null);
  const bound = !!user?.lineUserId;

  useEffect(() => {
    if (bound) return;
    api.get<Binding>('/api/line/binding-code').then(setBinding).catch(() => setBinding(null));
  }, [bound]);

  const onLogout = async () => { await logout(); await refresh(); nav('/login'); };

  return (
    <Phone>
      <div className="appbar"><div><h1>我的</h1></div></div>
      <div className="wrap scroll-body">
        {/* profile */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
          <Avatar name={(user?.name ?? '?').slice(0, 1)} idx={2} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name ?? '使用者'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email ?? ''}</div>
          </div>
        </div>

        {/* LINE binding */}
        <div className="sectlabel">LINE 綁定</div>
        <div className="card" style={{ border: bound ? '1px solid var(--line)' : '1.5px solid var(--accent)', boxShadow: 'none' }}>
          <div className="between">
            <div className="row" style={{ gap: 11 }}>
              <span className="center" style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--good-soft)', color: 'var(--good-ink)' }}><Icon name="send" size={21} /></span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>LINE 推播通知</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>結算、超標、投票、公告即時通知</div>
              </div>
            </div>
            {bound ? <Chip kind="good" dot>已綁定</Chip> : <Chip kind="neutral">未綁定</Chip>}
          </div>

          {!bound && (
            <>
              <div style={{ margin: '14px 0', padding: '14px', borderRadius: 12, background: 'var(--card)', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 6 }}>你的綁定碼</div>
                <div className="mono" style={{ fontSize: 24, fontWeight: 500, letterSpacing: 4, color: 'var(--ink)' }}>{binding?.code ?? '…'}</div>
              </div>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {['加入 ScreenPact LINE 官方帳號', '把上方綁定碼傳給 bot', '收到「綁定成功」即完成'].map((s, i) => (
                  <li key={i} className="row" style={{ gap: 10, fontSize: 13, color: 'var(--ink-2)', padding: '5px 0' }}>
                    <span className="center" style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-ink)', fontSize: 11, fontWeight: 700, flex: '0 0 auto' }}>{i + 1}</span>{s}
                  </li>
                ))}
              </ol>
              <button className="btn primary" style={{ marginTop: 8 }} onClick={() => binding?.addFriendUrl && window.open(binding.addFriendUrl, '_blank')}>
                <Icon name="link" size={18} />加入 LINE 好友
              </button>
              <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => refresh()}>我綁好了，重新整理</button>
            </>
          )}
          {bound && <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 12 }}>已連結 LINE，房間通知會推播給你。</div>}
        </div>

        <div className="card flat" style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
          <span className="row" style={{ gap: 10, fontSize: 14, color: 'var(--ink-2)' }}><Icon name="info" size={18} />關於 ScreenPact</span>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>v1.0</span>
        </div>
        <button className="btn outline" style={{ marginTop: 16, color: 'var(--warn-ink)', borderColor: 'var(--warn-soft)' }} onClick={onLogout}>登出</button>
      </div>
      <TabBar />
    </Phone>
  );
}
