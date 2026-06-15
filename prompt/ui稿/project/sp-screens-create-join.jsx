/* ScreenPact — ⑤ Create Room + Invite Success · ⑥ Join Preview (valid/expired) */

// stylized QR placeholder — deterministic square grid (not a real code)
function QRPlaceholder({ size = 172 }) {
  const N = 21;
  const cells = [];
  // deterministic pseudo-random fill
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed % 1000) / 1000; };
  const finder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (finder(r, c)) continue;
    if (rnd() > 0.52) cells.push([r, c]);
  }
  const u = size / N;
  const Finder = ({ x, y }) => (
    <g>
      <rect x={x * u} y={y * u} width={7 * u} height={7 * u} rx={u} fill="var(--ink)" />
      <rect x={(x + 1) * u} y={(y + 1) * u} width={5 * u} height={5 * u} rx={u * 0.7} fill="var(--card-2)" />
      <rect x={(x + 2) * u} y={(y + 2) * u} width={3 * u} height={3 * u} rx={u * 0.5} fill="var(--ink)" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {cells.map(([r, c], i) => <rect key={i} x={c * u + u * 0.1} y={r * u + u * 0.1} width={u * 0.8} height={u * 0.8} rx={u * 0.25} fill="var(--ink)" />)}
      <Finder x={0} y={0} /><Finder x={N - 7} y={0} /><Finder x={0} y={N - 7} />
    </svg>
  );
}

// ─────────── ⑤-a CREATE ROOM (form) ───────────
function CreateRoom() {
  return (
    <div className="phone" style={{ height: 960 }}>
      <StatusBar />
      <div className="backbar" style={{ padding: '4px 16px 8px' }}>
        <button className="iconbtn" style={{ width: 36, height: 36 }}><Icon name="chevL" size={20} /></button>
        <div style={{ fontWeight: 900, fontSize: 19 }}>建立房間</div>
      </div>
      <div className="wrap scroll-body">
        <div className="field">
          <label>房間名稱</label>
          <input className="input" defaultValue="沉澱小隊" />
        </div>

        <div className="field">
          <label>結算週期</label>
          <div className="seg" style={{ display: 'flex', width: '100%' }}>
            <button className="on" style={{ flex: 1 }}>每日結算</button>
            <button style={{ flex: 1 }}>每週結算</button>
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
          <textarea className="input" rows="3" defaultValue="下班後一起少滑一點，互相督促 💪" />
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
      <div style={{ padding: '10px 18px 12px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
        <button className="btn primary"><Icon name="plus" size={19} sw={2.2} />建立並產生邀請</button>
      </div>
      <HomeBar />
    </div>
  );
}

// ─────────── ⑤-b INVITE SUCCESS ───────────
function InviteSuccess() {
  return (
    <div className="phone" style={{ height: 912 }}>
      <StatusBar />
      <div className="backbar" style={{ padding: '4px 16px 8px' }}>
        <div style={{ width: 36 }} />
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 900, fontSize: 18 }}>邀請朋友加入</div>
        <button className="iconbtn" style={{ width: 36, height: 36 }}><Icon name="x" size={19} /></button>
      </div>
      <div className="wrap scroll-body" style={{ textAlign: 'center' }}>
        <span className="center" style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--good-soft)', color: 'var(--good-ink)', margin: '6px auto 12px' }}><Icon name="checkCircle" size={30} sw={1.7} /></span>
        <div style={{ fontWeight: 900, fontSize: 21 }}>「沉澱小隊」建好了！</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 6 }}>掃描 QR 或分享連結，邀朋友一起加入</div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '22px 0 18px' }}>
          <div className="qrbox"><QRPlaceholder size={172} /></div>
        </div>

        {/* invite link */}
        <div className="card flat" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', textAlign: 'left' }}>
          <Icon name="link" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <span className="mono" style={{ flex: 1, fontSize: 12.5, color: 'var(--ink-2)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>screenpact.app/j/9F4K-2QXP</span>
          <button className="btn soft sm" style={{ padding: '8px 12px' }}><Icon name="copy" size={16} />複製</button>
        </div>

        <div className="card" style={{ marginTop: 12, display: 'flex', gap: 11, padding: 14, textAlign: 'left', background: 'var(--card)', boxShadow: 'none' }}>
          <Icon name="info" size={18} style={{ color: 'var(--ink-3)', flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>邀請連結將於 <b style={{ color: 'var(--ink)' }}>7 天後失效</b>。失效後可隨時重新產生新的連結與 QR。</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn ghost block sm"><Icon name="refresh" size={17} />重新產生</button>
          <button className="btn primary block sm"><Icon name="send" size={17} />分享連結</button>
        </div>
      </div>
      <HomeBar />
    </div>
  );
}

// ─────────── ⑥-a JOIN PREVIEW (valid) ───────────
function JoinValid() {
  const apps = [APPS.tk, APPS.ig, APPS.yt];
  return (
    <div className="phone" style={{ height: 912 }}>
      <StatusBar />
      <div className="backbar" style={{ padding: '4px 16px 8px' }}>
        <button className="iconbtn" style={{ width: 36, height: 36 }}><Icon name="chevL" size={20} /></button>
        <div style={{ fontWeight: 900, fontSize: 19 }}>加入房間</div>
      </div>
      <div className="wrap scroll-body">
        <div className="card" style={{ textAlign: 'center', padding: '24px 20px 20px' }}>
          <span className="center" style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--accent-soft)', color: 'var(--accent)', margin: '0 auto 14px' }}><Icon name="room" size={30} /></span>
          <div style={{ fontWeight: 900, fontSize: 22 }}>沉澱小隊</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>下班後一起少滑一點，互相督促 💪</div>
          <div className="center" style={{ gap: 8, marginTop: 14 }}>
            <div className="row" style={{ marginLeft: 0 }}>
              {['宥','庭','晴','安'].map((n, i) => (
                <span key={i} style={{ marginLeft: i ? -10 : 0, borderRadius: '50%', boxShadow: '0 0 0 2px var(--card-2)' }}><Avatar name={n} idx={i} size={30} /></span>
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 700 }}>已有 5 人</span>
          </div>
        </div>

        <div className="sectlabel">房間規則摘要</div>
        <div className="card">
          <div className="between" style={{ paddingBottom: 12, borderBottom: '1px solid var(--line-2)' }}>
            <span className="row" style={{ gap: 9, color: 'var(--ink-2)', fontSize: 13.5 }}><Icon name="calendar" size={18} />結算週期</span>
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>每日 · 截止 23:00</span>
          </div>
          <div style={{ padding: '12px 0' }}>
            <div className="row" style={{ gap: 9, color: 'var(--ink-2)', fontSize: 13.5, marginBottom: 10 }}><Icon name="chart" size={18} />追蹤 App（上限合計 1時30分）</div>
            <div style={{ display: 'flex', gap: 14 }}>
              {apps.map((a, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                  <AppIcon glyph={a.glyph} color={a.color} size={40} />
                  <span style={{ fontSize: 11, color: 'var(--ink-2)', textAlign: 'center' }}>{a.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ paddingTop: 12, borderTop: '1px solid var(--line-2)' }}>
            <div className="row" style={{ gap: 9, color: 'var(--warn-ink)', fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}><Icon name="flame" size={18} />超標懲罰</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>超標者請室友喝一杯飲料 🧋；超過 30 分加碼掃地一週。</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 18px 12px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
        <button className="btn primary"><Icon name="check" size={19} sw={2.2} />加入房間</button>
      </div>
      <HomeBar />
    </div>
  );
}

// ─────────── ⑥-b JOIN PREVIEW (expired) ───────────
function JoinExpired() {
  return (
    <div className="phone" style={{ height: 844 }}>
      <StatusBar />
      <div className="backbar" style={{ padding: '4px 16px 8px' }}>
        <button className="iconbtn" style={{ width: 36, height: 36 }}><Icon name="chevL" size={20} /></button>
        <div style={{ fontWeight: 900, fontSize: 19 }}>加入房間</div>
      </div>
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
        <span className="center" style={{ width: 92, height: 92, borderRadius: 28, background: 'var(--sand)', color: 'var(--ink-3)', marginBottom: 22 }}><Icon name="link" size={42} sw={1.4} /></span>
        <div style={{ fontWeight: 900, fontSize: 21 }}>這個邀請連結已失效</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.6 }}>邀請連結會在產生 7 天後自動失效。<br />請向房主索取新的連結或 QR code。</div>

        <div className="card flat" style={{ marginTop: 22, alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 12, padding: 14, textAlign: 'left' }}>
          <span className="center" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--warn-soft)', color: 'var(--warn-ink)', flex: '0 0 auto' }}><Icon name="clock" size={20} /></span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>連結於 6 月 8 日過期</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>房主可在房間內重新產生</div>
          </div>
        </div>

        <div style={{ alignSelf: 'stretch', marginTop: 22 }}>
          <button className="btn primary"><Icon name="send" size={18} sw={1.9} />向房主索取新連結</button>
          <button className="btn ghost" style={{ marginTop: 10 }}>回到總覽</button>
        </div>
      </div>
      <HomeBar />
    </div>
  );
}

Object.assign(window, { CreateRoom, InviteSuccess, JoinValid, JoinExpired });
