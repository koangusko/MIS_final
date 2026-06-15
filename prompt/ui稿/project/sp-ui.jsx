/* ScreenPact — shared UI kit (icons + primitives) */

// ─── line icon set (1.6 stroke, currentColor) ───
const ICON_PATHS = {
  home: 'M3 9.5L10 4l7 5.5M5 8.5V16h10V8.5',
  room: 'M7 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM13 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3 16c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5M11.5 12.7c1.9-.2 4.5.6 4.5 3.3',
  upload: 'M10 14V5M6.5 8.5L10 5l3.5 3.5M4 15h12',
  bell: 'M6 8a4 4 0 118 0c0 3.5 1.2 4.5 1.2 4.5H4.8S6 11.5 6 8zM8.3 15.5a1.8 1.8 0 003.4 0',
  user: 'M10 10a3 3 0 100-6 3 3 0 000 6zM4.5 16.5c0-2.6 2.4-4 5.5-4s5.5 1.4 5.5 4',
  chart: 'M4 16V9M9 16V4M14 16v-5',
  clock: 'M10 17a7 7 0 100-14 7 7 0 000 14zM10 6v4l2.5 1.5',
  camera: 'M3 7.5A1.5 1.5 0 014.5 6h1l1-1.5h5L13.5 6h2A1.5 1.5 0 0117 7.5v7A1.5 1.5 0 0115.5 16h-11A1.5 1.5 0 013 14.5v-7zM10 13.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  image: 'M3.5 4.5h13v11h-13zM3.5 13l3.5-3.5 3 3 2.5-2.5 4 4M7 8.5a1 1 0 100-2 1 1 0 000 2z',
  check: 'M4 10.5l4 4 8-9',
  checkCircle: 'M10 17a7 7 0 100-14 7 7 0 000 14zM6.8 10l2.2 2.2 4.2-4.4',
  x: 'M5 5l10 10M15 5L5 15',
  xCircle: 'M10 17a7 7 0 100-14 7 7 0 000 14zM7.5 7.5l5 5M12.5 7.5l-5 5',
  alert: 'M10 3.5L17.5 16.5H2.5L10 3.5zM10 8.5v3.5M10 14.3v.2',
  chevR: 'M8 5l5 5-5 5',
  chevD: 'M5 8l5 5 5-5',
  chevL: 'M12 5l-5 5 5 5',
  qr: 'M3.5 3.5h4v4h-4zM12.5 3.5h4v4h-4zM3.5 12.5h4v4h-4zM12.5 12.5h1.5v1.5h-1.5zM16 14.5v2M12.5 16h2M10 4v5M10 12v4M5.2 5.2v.6M14.2 5.2v.6M5.2 14.2v.6',
  link: 'M8 12l4-4M7.5 10l-1.8 1.8a2.5 2.5 0 003.5 3.5L11 13.5M12.5 10l1.8-1.8a2.5 2.5 0 00-3.5-3.5L9 6.5',
  copy: 'M7 7V5.5A1.5 1.5 0 018.5 4h6A1.5 1.5 0 0116 5.5v6a1.5 1.5 0 01-1.5 1.5H13M4 8.5h7A1.5 1.5 0 0112.5 10v5A1.5 1.5 0 0111 16.5H4A1.5 1.5 0 012.5 15v-5A1.5 1.5 0 014 8.5z',
  refresh: 'M16 6.5A7 7 0 104 8M16 3v3.5h-3.5M4 17v-3.5h3.5',
  trophy: 'M6 4h8v3a4 4 0 01-8 0V4zM6 5H4v1.5A2 2 0 006 8.5M14 5h2v1.5a2 2 0 01-2 2M8 11.5h4M7.5 16h5M10 11.5V16',
  crown: 'M4 14h12M4 14l-1-7 4 3 3-5 3 5 4-3-1 7',
  plus: 'M10 4v12M4 10h12',
  google: 'M10 8.2v3.6h5a5 5 0 11-1.5-5.6',
  lock: 'M6 9V7a4 4 0 018 0v2M5 9h10v7H5z',
  send: 'M3.5 10L16 4l-4 12-2.5-5L3.5 10z',
  search: 'M9 15a6 6 0 100-12 6 6 0 000 12zM14 14l3 3',
  info: 'M10 17a7 7 0 100-14 7 7 0 000 14zM10 9.5V14M10 6.4v.2',
  calendar: 'M4 6.5h12v9.5H4zM4 9h12M7 4v3M13 4v3',
  settings: 'M10 13a3 3 0 100-6 3 3 0 000 6zM10 2.5v2M10 15.5v2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M2.5 10h2M15.5 10h2M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4',
  edit: 'M13 4l3 3-8.5 8.5L4 16.5l.9-3.4L13 4z',
  flame: 'M10 3.5c3 3 4.5 5 4.5 7.5a4.5 4.5 0 11-9 0c0-1.2.5-2.3 1.5-3.3.2 1 .8 1.8 1.5 2.3C9.5 8 9 5.5 10 3.5z',
  scan: 'M3.5 7V5A1.5 1.5 0 015 3.5h2M13 3.5h2A1.5 1.5 0 0116.5 5v2M16.5 13v2a1.5 1.5 0 01-1.5 1.5h-2M7 16.5H5A1.5 1.5 0 013.5 15v-2M3.5 10h13',
  hourglass: 'M6 4h8M6 16h8M6.5 4c0 3 7 3.5 7 6s-6.5 3-7 6M13.5 4c0 3-7 3.5-7 6s6.5 3 7 6',
};

function Icon({ name, size = 20, sw = 1.6, fill = false, style }) {
  const d = ICON_PATHS[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={style}>
      <path d={d} />
    </svg>
  );
}

// status bar signal/wifi/battery glyphs
function SbGlyphs() {
  return (
    <span className="sb-icons">
      <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4.5" width="3" height="7.5" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="2" width="3" height="10" rx="1" opacity=".35"/></svg>
      <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 4.2C3.2 2.4 5.7 1.5 8.5 1.5S13.8 2.4 16 4.2"/><path d="M3.3 6.6c1.5-1.2 3.3-1.9 5.2-1.9s3.7.7 5.2 1.9"/><path d="M5.7 9c.8-.7 1.8-1 2.8-1s2 .3 2.8 1"/><circle cx="8.5" cy="10.8" r=".6" fill="currentColor"/></svg>
      <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="1" y="1" width="21" height="11" rx="3" stroke="currentColor" strokeWidth="1.1" opacity=".4"/><rect x="3" y="3" width="15" height="7" rx="1.5" fill="currentColor"/><rect x="23" y="4.5" width="1.6" height="4" rx="1" fill="currentColor" opacity=".4"/></svg>
    </span>
  );
}

function StatusBar({ time = '9:41' }) {
  return (
    <div className="statusbar">
      <span className="time">{time}</span>
      <SbGlyphs />
    </div>
  );
}

// avatar — solid greige + initial
const AV_COLORS = ['#7d8a86', '#9a8f7e', '#8a8195', '#a3877a', '#7e8f9a', '#94937f', '#a07e8a'];
function Avatar({ name = '?', size = 38, idx = 0, ring }) {
  const c = AV_COLORS[idx % AV_COLORS.length];
  return (
    <span className="av" style={{
      width: size, height: size, background: c, fontSize: size * 0.4,
      boxShadow: ring ? `0 0 0 2px var(--card-2),0 0 0 ${2 + ring}px ${c}` : 'none',
    }}>{name}</span>
  );
}

// app icon tile — abstract color block + line glyph (no real brand logos)
function AppIcon({ glyph = 'image', color = '#888', size = 38 }) {
  return (
    <span className="appicon" style={{ width: size, height: size, background: color, borderRadius: size * 0.29 }}>
      <Icon name={glyph} size={size * 0.5} sw={1.7} />
    </span>
  );
}

function Bar({ pct, state }) {
  return <div className={'bar' + (state ? ' ' + state : '')}><i style={{ width: Math.min(pct, 100) + '%' }} /></div>;
}

function Chip({ kind = 'neutral', dot, children }) {
  return <span className={'chip ' + kind}>{dot && <span className="dot" />}{children}</span>;
}

// tracked apps catalog (neutral abstract colors, line glyphs)
const APPS = {
  ig: { name: '社群相簿', glyph: 'camera', color: '#a8728c' },
  tk: { name: '短影音 A', glyph: 'flame', color: '#5d6b73' },
  yt: { name: '影音平台', glyph: 'image', color: '#b06a5a' },
  fb: { name: '動態社群', glyph: 'room', color: '#6d7fa3' },
  x: { name: '微網誌', glyph: 'hourglass', color: '#7a7f86' },
};

// bottom tab bar
function TabBar({ active = 'home' }) {
  const tabs = [
    { id: 'home', icon: 'home', label: '總覽' },
    { id: 'room', icon: 'room', label: '房間' },
  ];
  const right = [
    { id: 'bell', icon: 'bell', label: '通知' },
    { id: 'me', icon: 'user', label: '我的' },
  ];
  return (
    <div className="tabbar">
      {tabs.map((t) => (
        <button key={t.id} className={'tab' + (active === t.id ? ' on' : '')}>
          <Icon name={t.icon} size={23} sw={active === t.id ? 1.9 : 1.6} />
          <span>{t.label}</span>
        </button>
      ))}
      <div className="tab center">
        <div className="fab"><Icon name="camera" size={26} sw={1.8} /></div>
      </div>
      {right.map((t) => (
        <button key={t.id} className={'tab' + (active === t.id ? ' on' : '')}>
          <Icon name={t.icon} size={23} sw={active === t.id ? 1.9 : 1.6} />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// home-indicator pill at very bottom of an iOS-like screen (when no tabbar)
function HomeBar() {
  return <div style={{ height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
    <div style={{ width: 132, height: 5, borderRadius: 3, background: 'rgba(43,40,35,.22)' }} />
  </div>;
}

Object.assign(window, {
  Icon, SbGlyphs, StatusBar, Avatar, AppIcon, Bar, Chip, TabBar, HomeBar, APPS, AV_COLORS,
});
