/* ScreenPact — Style Guide page + Login + Dashboard */

// ─────────── STYLE GUIDE ───────────
function StyleGuide() {
  const Swatch = ({ c, name, hex, ink }) => (
    <div>
      <div className="sg-swatch" style={{ background: c }} />
      <div className="sg-label" style={ink ? { color: ink } : null}>{name}</div>
      <div className="sg-mono">{hex}</div>
    </div>
  );
  return (
    <div style={{ width: 760, background: 'var(--card-2)', fontFamily: "'Noto Sans TC',sans-serif", color: 'var(--ink)', padding: 40 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 4 }}>
        <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.6 }}>時間公約 · ScreenPact</div>
        <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>style guide v1</div>
      </div>
      <div style={{ color: 'var(--ink-2)', fontSize: 14, marginBottom: 30 }}>朋友互助、減少滑社群與短影音 — 沉靜、友善、輕量遊戲化</div>

      {/* neutrals */}
      <div className="sectlabel" style={{ margin: '0 0 12px' }}>NEUTRALS — 你的色盤</div>
      <div className="sg-grid" style={{ gridTemplateColumns: 'repeat(6,1fr)' }}>
        <Swatch c="#e8e4db" name="App 底" hex="#e8e4db" />
        <Swatch c="#f6f4ee" name="卡片" hex="#f6f4ee" />
        <Swatch c="#e5e1d8" name="米灰" hex="#e5e1d8" />
        <Swatch c="#c9c5c2" name="暖灰 / 線" hex="#c9c5c2" />
        <Swatch c="#abacad" name="灰 / 次文字" hex="#abacad" />
        <Swatch c="#2b2823" name="主文字" hex="#2b2823" />
      </div>

      {/* two accent directions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 28 }}>
        <div>
          <div className="sectlabel" style={{ margin: '0 0 12px', color: 'var(--accent-ink)' }}>方向 A · 沉靜 TEAL（建議 / 預設）</div>
          <div className="sg-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <Swatch c="#3f807a" name="主色 Teal" hex="#3f807a" />
            <Swatch c="#bd7150" name="超標 Coral" hex="#bd7150" />
            <Swatch c="#5f8b6a" name="達標 Sage" hex="#5f8b6a" />
          </div>
        </div>
        <div className="accent-b">
          <div className="sectlabel" style={{ margin: '0 0 12px', color: 'var(--accent-ink)' }}>方向 B · 沉靜 INDIGO（替代）</div>
          <div className="sg-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <Swatch c="#5b5f9e" name="主色 Indigo" hex="#5b5f9e" />
            <Swatch c="#c08a4a" name="超標 Amber" hex="#c08a4a" />
            <Swatch c="#5f8b6a" name="達標 Sage" hex="#5f8b6a" />
          </div>
        </div>
      </div>

      {/* type */}
      <div className="sectlabel" style={{ margin: '30px 0 12px' }}>TYPE — Noto Sans TC + Roboto Mono（數字）</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, flexWrap: 'wrap', paddingBottom: 6, borderBottom: '1px solid var(--line)' }}>
        <span style={{ fontWeight: 900, fontSize: 34, letterSpacing: -0.8 }}>大標 900</span>
        <span style={{ fontWeight: 700, fontSize: 22 }}>標題 700</span>
        <span style={{ fontWeight: 500, fontSize: 16 }}>內文 500</span>
        <span style={{ fontWeight: 400, fontSize: 14, color: 'var(--ink-2)' }}>說明 400</span>
        <span className="bignum tnum" style={{ fontSize: 40 }}>1<span className="unit">時</span>04<span className="unit">分</span></span>
      </div>

      {/* components */}
      <div className="sectlabel" style={{ margin: '28px 0 12px' }}>COMPONENTS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary sm">主要動作</button>
            <button className="btn ghost sm">次要</button>
            <button className="btn soft sm">柔和</button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Chip kind="good" dot>達標</Chip>
            <Chip kind="warn" dot>超標 20 分</Chip>
            <Chip kind="accent">已回報</Chip>
            <Chip kind="neutral">待回報</Chip>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 6 }}>進度條 — 正常 / 超標</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Bar pct={62} />
              <Bar pct={100} state="over" />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {['友','宥','庭','晴'].map((n, i) => <Avatar key={i} name={n} idx={i} size={40} />)}
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>頭像：純色 + 首字</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {Object.values(APPS).slice(0, 4).map((a, i) => <AppIcon key={i} glyph={a.glyph} color={a.color} size={40} />)}
            <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>App icon：抽象色塊 + 線圖</span>
          </div>
          <div style={{ display: 'flex', gap: 10, color: 'var(--ink)', alignItems: 'center', flexWrap: 'wrap' }}>
            {['home','room','camera','bell','user','chart','trophy','qr','link','flame','clock','crown'].map((n) => <Icon key={n} name={n} size={22} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────── ① LOGIN ───────────
function Login() {
  const sells = [
    { icon: 'chart', t: '一眼看懂用了多久', d: '上傳螢幕使用時間截圖，自動讀出各 App 時數' },
    { icon: 'room', t: '和朋友互相監督', d: '開房間、設上限、按日／週一起結算' },
    { icon: 'flame', t: '輕量遊戲化', d: '連續達標、排行榜、徽章，鼓勵不羞辱' },
  ];
  return (
    <div className="phone" style={{ height: 844 }}>
      <StatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 26px' }}>
        <div style={{ flex: '0 0 auto', paddingTop: 56, textAlign: 'center' }}>
          <div className="center" style={{ width: 72, height: 72, borderRadius: 22, background: 'var(--accent)', color: '#fff', margin: '0 auto 22px', boxShadow: '0 8px 22px rgba(63,128,122,.32)' }}>
            <Icon name="hourglass" size={36} sw={1.7} />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.8, margin: 0 }}>時間公約</h1>
          <div style={{ fontSize: 15, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.6 }}>跟朋友互相監督，<br />一起少滑一點社群與短影音。</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '34px 0' }}>
          {sells.map((s, i) => (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
              <span className="center" style={{ width: 44, height: 44, borderRadius: 13, background: 'var(--accent-soft)', color: 'var(--accent)', flex: '0 0 auto' }}><Icon name={s.icon} size={22} /></span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.t}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.45 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: '0 0 auto', paddingBottom: 14 }}>
          <button className="btn ghost" style={{ borderRadius: 16 }}>
            <span className="center" style={{ color: '#4285F4' }}><Icon name="google" size={20} sw={1.9} /></span>
            使用 Google 登入
          </button>
          <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', marginTop: 14, lineHeight: 1.5 }}>登入即表示同意服務條款與隱私權政策<br />截圖只用於讀取時數，不會公開</div>
        </div>
      </div>
      <HomeBar />
    </div>
  );
}

// ─────────── ② DASHBOARD — 無資料 ───────────
function DashboardEmpty() {
  return (
    <div className="phone" style={{ height: 844 }}>
      <StatusBar />
      <div className="appbar">
        <div>
          <h1>嗨，宥宥 👋</h1>
          <div className="sub">今天還沒有資料，先上傳第一張吧</div>
        </div>
        <button className="iconbtn"><Icon name="bell" size={20} /></button>
      </div>
      <div className="wrap scroll-body">
        <div className="card" style={{ textAlign: 'center', padding: '34px 22px' }}>
          <div className="empty-ill"><Icon name="camera" size={52} sw={1.4} /></div>
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 20 }}>上傳第一張螢幕使用時間</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.6 }}>從 iPhone「設定 → 螢幕使用時間」<br />截圖上傳，我們會自動讀出各 App 時數。</div>
          <button className="btn primary" style={{ marginTop: 22 }}><Icon name="upload" size={20} sw={1.9} />上傳今日截圖</button>
        </div>

        <div className="sectlabel">我的房間</div>
        <div className="card flat" style={{ textAlign: 'center', padding: '26px 20px' }}>
          <span className="center" style={{ width: 50, height: 50, borderRadius: 15, background: 'var(--sand)', color: 'var(--ink-3)', margin: '0 auto 14px' }}><Icon name="room" size={26} /></span>
          <div style={{ fontWeight: 700, fontSize: 15 }}>還沒有加入任何房間</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '6px 0 16px' }}>建立房間找朋友，或用連結加入</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn soft sm block"><Icon name="plus" size={18} sw={2} />建立房間</button>
            <button className="btn ghost sm block"><Icon name="scan" size={18} />掃描加入</button>
          </div>
        </div>
      </div>
      <TabBar active="home" />
    </div>
  );
}

// ─────────── ② DASHBOARD — 有資料 ───────────
function DashboardData() {
  const days = [
    { d: '一', v: 64 }, { d: '二', v: 52 }, { d: '三', v: 78, over: true },
    { d: '四', v: 41 }, { d: '五', v: 58 }, { d: '六', v: 88, over: true }, { d: '日', v: 70, today: true },
  ];
  const max = 90;
  const apps = [
    { ...APPS.tk, m: 38, cap: 40 },
    { ...APPS.ig, m: 22, cap: 30 },
    { ...APPS.yt, m: 10, cap: 25 },
  ];
  return (
    <div className="phone" style={{ height: 1024 }}>
      <StatusBar />
      <div className="appbar">
        <div>
          <h1>今日總覽</h1>
          <div className="sub">6 月 15 日 · 週日</div>
        </div>
        <button className="iconbtn"><Icon name="bell" size={20} /></button>
      </div>
      <div className="wrap scroll-body">
        {/* total card */}
        <div className="card">
          <div className="between">
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>社群＋短影音</span>
            <div className="seg"><button className="on">今日</button><button>本週</button></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14 }}>
            <span className="bignum tnum" style={{ fontSize: 56 }}>1<span className="unit">時</span>10<span className="unit">分</span></span>
            <Chip kind="good" dot>較昨日 −12 分</Chip>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="between" style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 6 }}><span>距每日上限 1時30分</span><span className="tnum" style={{ fontWeight: 700, color: 'var(--good-ink)' }}>還剩 20 分</span></div>
            <Bar pct={78} />
          </div>
        </div>

        {/* trend chart */}
        <div className="card">
          <div className="between" style={{ marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>近 7 天趨勢</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>分鐘</span>
          </div>
          <div className="chart">
            {days.map((d, i) => (
              <div className="day" key={i}>
                <div className={'stack' + (d.over ? ' over' : d.today ? '' : ' dim')} style={{ height: (d.v / max * 100) + '%', opacity: d.today ? 1 : undefined }} />
                <div className="dlabel" style={d.today ? { color: 'var(--accent)', fontWeight: 700 } : null}>{d.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* tracked apps */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>各 App 使用</div>
          {apps.map((a, i) => {
            const pct = a.m / a.cap * 100; const over = a.m > a.cap;
            return (
              <div className="approw" key={i}>
                <AppIcon glyph={a.glyph} color={a.color} />
                <div className="meta">
                  <div className="between"><span className="nm">{a.name}</span><span className="mins" style={over ? { color: 'var(--warn-ink)' } : null}>{a.m} 分</span></div>
                  <div style={{ marginTop: 6 }}><Bar pct={pct} state={over ? 'over' : ''} /></div>
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 10, textAlign: 'center' }}>上限為房間「沉澱小隊」設定</div>
        </div>

        {/* my rooms */}
        <div className="sectlabel">我的房間</div>
        <div className="card" style={{ padding: 16 }}>
          <div className="between">
            <div className="row" style={{ gap: 11 }}>
              <span className="center" style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--accent-soft)', color: 'var(--accent)' }}><Icon name="room" size={21} /></span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>沉澱小隊</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>5 人 · 每日結算</div>
              </div>
            </div>
            <Chip kind="good" dot>本期達標</Chip>
          </div>
          <div className="between" style={{ marginTop: 13, paddingTop: 13, borderTop: '1px solid var(--line-2)', fontSize: 12.5 }}>
            <span className="row" style={{ gap: 6, color: 'var(--warn-ink)' }}><Icon name="clock" size={15} />距回報截止 4 小時</span>
            <span className="row" style={{ gap: 4, color: 'var(--accent)', fontWeight: 700 }}>進入房間<Icon name="chevR" size={15} /></span>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="between">
            <div className="row" style={{ gap: 11 }}>
              <span className="center" style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--sand)', color: 'var(--ink-2)' }}><Icon name="flame" size={21} /></span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>下班不滑挑戰</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>8 人 · 每週結算</div>
              </div>
            </div>
            <Chip kind="warn" dot>超標 15 分</Chip>
          </div>
        </div>
      </div>
      <TabBar active="home" />
    </div>
  );
}

Object.assign(window, { StyleGuide, Login, DashboardEmpty, DashboardData });
