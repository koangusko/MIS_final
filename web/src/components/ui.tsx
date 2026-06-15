import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from './Icon';
import type { IconName } from '../lib/icons';

// ─── avatar — solid greige + initial ───
export const AV_COLORS = ['#7d8a86', '#9a8f7e', '#8a8195', '#a3877a', '#7e8f9a', '#94937f', '#a07e8a'];

export function Avatar({ name = '?', size = 38, idx = 0, ring }: {
  name?: string; size?: number; idx?: number; ring?: number;
}) {
  const c = AV_COLORS[idx % AV_COLORS.length];
  return (
    <span
      className="av"
      style={{
        width: size, height: size, background: c, fontSize: size * 0.4,
        boxShadow: ring ? `0 0 0 2px var(--card-2),0 0 0 ${2 + ring}px ${c}` : 'none',
      }}
    >
      {name}
    </span>
  );
}

// ─── app icon tile — abstract color block + line glyph ───
export function AppIcon({ glyph = 'image', color = '#888', size = 38 }: {
  glyph?: IconName; color?: string; size?: number;
}) {
  return (
    <span className="appicon" style={{ width: size, height: size, background: color, borderRadius: size * 0.29 }}>
      <Icon name={glyph} size={size * 0.5} sw={1.7} />
    </span>
  );
}

export function Bar({ pct, state }: { pct: number; state?: string }) {
  return (
    <div className={'bar' + (state ? ' ' + state : '')}>
      <i style={{ width: Math.min(pct, 100) + '%' }} />
    </div>
  );
}

export function Chip({ kind = 'neutral', dot, children }: {
  kind?: 'neutral' | 'good' | 'warn' | 'accent'; dot?: boolean; children: ReactNode;
}) {
  return (
    <span className={'chip ' + kind}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

// ─── tracked apps catalog (neutral abstract colors, line glyphs) ───
export const APPS: Record<string, { name: string; glyph: IconName; color: string }> = {
  ig: { name: '社群相簿', glyph: 'camera', color: '#a8728c' },
  tk: { name: '短影音 A', glyph: 'flame', color: '#5d6b73' },
  yt: { name: '影音平台', glyph: 'image', color: '#b06a5a' },
  fb: { name: '動態社群', glyph: 'room', color: '#6d7fa3' },
  x: { name: '微網誌', glyph: 'hourglass', color: '#7a7f86' },
};

// ─── page header (back / close + title + optional right slot) ───
export function PageHeader({ title, sub, right, close, onBack }: {
  title: string; sub?: string; right?: ReactNode; close?: boolean; onBack?: () => void;
}) {
  const nav = useNavigate();
  const back = onBack ?? (() => nav(-1));
  return (
    <div className="backbar">
      <button className="iconbtn" style={{ width: 36, height: 36 }} onClick={back} aria-label="返回">
        <Icon name={close ? 'x' : 'chevL'} size={close ? 19 : 20} />
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 19 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// ─── bottom tab bar (router-aware) ───
export function TabBar() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const on = (p: string) => (p === '/' ? pathname === '/' : pathname.startsWith(p));
  const Tab = ({ to, icon, label }: { to: string; icon: IconName; label: string }) => (
    <button className={'tab' + (on(to) ? ' on' : '')} onClick={() => nav(to)}>
      <Icon name={icon} size={23} sw={on(to) ? 1.9 : 1.6} />
      <span>{label}</span>
    </button>
  );
  return (
    <div className="tabbar">
      <Tab to="/" icon="home" label="總覽" />
      <Tab to="/rooms" icon="room" label="房間" />
      <div className="tab center">
        <button className="fab" onClick={() => nav('/upload')} aria-label="上傳截圖">
          <Icon name="camera" size={26} sw={1.8} />
        </button>
      </div>
      <Tab to="/notifications" icon="bell" label="通知" />
      <Tab to="/me" icon="user" label="我的" />
    </div>
  );
}

// ─── stylized QR placeholder — deterministic square grid (not a real code) ───
export function QRPlaceholder({ size = 172 }: { size?: number }) {
  const N = 21;
  const cells: [number, number][] = [];
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed % 1000) / 1000; };
  const finder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (finder(r, c)) continue;
    if (rnd() > 0.52) cells.push([r, c]);
  }
  const u = size / N;
  const Finder = ({ x, y }: { x: number; y: number }) => (
    <g>
      <rect x={x * u} y={y * u} width={7 * u} height={7 * u} rx={u} fill="var(--ink)" />
      <rect x={(x + 1) * u} y={(y + 1) * u} width={5 * u} height={5 * u} rx={u * 0.7} fill="var(--card-2)" />
      <rect x={(x + 2) * u} y={(y + 2) * u} width={3 * u} height={3 * u} rx={u * 0.5} fill="var(--ink)" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {cells.map(([r, c], i) => (
        <rect key={i} x={c * u + u * 0.1} y={r * u + u * 0.1} width={u * 0.8} height={u * 0.8} rx={u * 0.25} fill="var(--ink)" />
      ))}
      <Finder x={0} y={0} /><Finder x={N - 7} y={0} /><Finder x={0} y={N - 7} />
    </svg>
  );
}

// ─── checkbox circle ───
export function CheckCircle({ on }: { on?: boolean }) {
  return on ? (
    <span className="center" style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', flex: '0 0 auto' }}>
      <Icon name="check" size={15} sw={2.6} />
    </span>
  ) : (
    <span style={{ width: 24, height: 24, borderRadius: '50%', border: '1.8px solid var(--stone)', flex: '0 0 auto', display: 'inline-block' }} />
  );
}

// ─── full-height app-shell frame ───
export function Phone({ children }: { children: ReactNode }) {
  return <div className="phone">{children}</div>;
}
