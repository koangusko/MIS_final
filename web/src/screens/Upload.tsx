import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, PageHeader, AppIcon, APPS } from '../components/ui';
import { api } from '../lib/api';

type Phase = 'select' | 'parsing' | 'done';
type OneResult = {
  submissionId?: string;
  kind: 'YESTERDAY' | 'TODAY';
  status: 'PARSED' | 'NEED_REUPLOAD' | 'LOCKED' | 'REJECTED_DECREASE';
  reason?: string;
  message?: string;
  previous?: number | null;
  date?: string | null;
  totalMinutes?: number | null;
  apps?: { label: string; minutes: number }[];
  imageUrl?: string;
};
type UploadStatus = { yesterday: { locked: boolean; totalMin: number | null }; today: { totalMin: number | null } };

function fmt(min?: number | null): string {
  const m = min ?? 0;
  return m >= 60 ? `${Math.floor(m / 60)} 時 ${m % 60} 分` : `${m} 分`;
}

// 依 LLM 讀到的標籤挑個 glyph（純視覺，找不到就用相簿）
function glyphFor(label: string) {
  const hit = Object.values(APPS).find((a) => a.name === label);
  return hit ?? { glyph: 'image' as const, color: '#8a8195' };
}

export default function Upload() {
  const nav = useNavigate();
  const [phase, setPhase] = useState<Phase>('select');
  const [yFile, setYFile] = useState<File | null>(null);
  const [tFile, setTFile] = useState<File | null>(null);
  const [results, setResults] = useState<{ yesterday?: OneResult; today?: OneResult }>({});
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus | null>(null);

  const loadStatus = () => api.get<UploadStatus>('/api/submissions/status').then(setStatus).catch(() => {});
  useEffect(() => { void loadStatus(); }, []);

  const submit = async () => {
    setError(null);
    const fd = new FormData();
    if (yFile) fd.append('yesterday', yFile);
    if (tFile) fd.append('today', tFile);
    setPhase('parsing');
    try {
      const r = await fetch('/api/submissions', { method: 'POST', body: fd, credentials: 'include' });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        setError(e.message || e.error || '上傳失敗');
        setPhase('select');
        return;
      }
      const data = await r.json();
      setResults(data.results || {});
      setPhase('done');
      void loadStatus();
    } catch {
      setError('網路錯誤，請再試一次');
      setPhase('select');
    }
  };

  const reset = () => {
    setResults({});
    setYFile(null);
    setTFile(null);
    setPhase('select');
    void loadStatus();
  };

  return (
    <Phone>
      <PageHeader title="每日回報" sub="上傳兩張截圖，自動讀出時數" />
      {phase === 'select' && (
        <Select yFile={yFile} tFile={tFile} setY={setYFile} setT={setTFile} error={error} onSubmit={submit} status={status} />
      )}
      {phase === 'parsing' && <Parsing />}
      {phase === 'done' && <Done results={results} onDone={() => nav('/')} onReset={reset} />}
    </Phone>
  );
}

function Picker({ tag, title, hint, page, file, onPick }: {
  tag: string; title: string; hint: string; page: string; file: File | null; onPick: (f: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="dropzone" style={file ? { borderColor: 'var(--accent)', borderStyle: 'solid' } : undefined}>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
      <div className="row" style={{ gap: 12, alignSelf: 'stretch' }}>
        <div className="ph-thumb"><Icon name="image" size={22} style={{ color: 'var(--ink-3)' }} /></div>
        <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 7, marginBottom: 4 }}>
            <span className="chip accent" style={{ padding: '3px 9px' }}>{tag}</span>
            {file && <span className="chip good" style={{ padding: '3px 9px' }}><Icon name="check" size={12} sw={2.4} />已選</span>}
          </div>
          <div className="zone-title">{title}</div>
          {file ? (
            <div className="zone-hint" style={{ marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
          ) : (
            <div className="zone-hint" style={{ marginTop: 3 }}>{hint}</div>
          )}
        </div>
      </div>
      <button className="btn soft sm" style={{ alignSelf: 'stretch', marginTop: 4 }} onClick={() => ref.current?.click()}>
        <Icon name="upload" size={17} sw={1.9} />{file ? '重新選擇' : '選擇截圖'}
      </button>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{page}</div>
    </div>
  );
}

function Select({ yFile, tFile, setY, setT, error, onSubmit, status }: {
  yFile: File | null; tFile: File | null; setY: (f: File | null) => void; setT: (f: File | null) => void;
  error: string | null; onSubmit: () => void; status: UploadStatus | null;
}) {
  const yLocked = status?.yesterday.locked ?? false;
  const todayMin = status?.today.totalMin ?? null;
  const any = (!yLocked && !!yFile) || !!tFile;
  return (
    <div className="wrap scroll-body">
      <div className="card" style={{ background: 'var(--accent-soft)', boxShadow: 'none', display: 'flex', gap: 11, padding: 15 }}>
        <span style={{ color: 'var(--accent-ink)', flex: '0 0 auto' }}><Icon name="info" size={20} /></span>
        <div style={{ fontSize: 12.5, color: 'var(--accent-ink)', lineHeight: 1.5 }}>
          昨天成功上傳後會<b>鎖定</b>；今天可重複覆蓋，但時數<b>只會往上加</b>。
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {yLocked ? (
          <div className="card flat" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
            <span className="center" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--good-soft)', color: 'var(--good-ink)', flex: '0 0 auto' }}><Icon name="lock" size={18} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>昨天已上傳並鎖定</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>合計 {status?.yesterday.totalMin ?? 0} 分 · 不可再更改</div>
            </div>
          </div>
        ) : (
          <Picker tag="第 1 張" title="上傳昨天的完整數據" hint="昨天一整天的螢幕使用時間，用來結算（成功後鎖定）。" page="截「螢幕使用時間 → 昨天」整頁" file={yFile} onPick={setY} />
        )}
        <Picker tag="第 2 張" title="今天先打個卡" hint={todayMin != null ? `目前已記錄 ${todayMin} 分；只能再往上加。` : '今天目前為止的用量，讓大家看到進度。'} page="截「螢幕使用時間 → 今天」整頁" file={tFile} onPick={setT} />
      </div>
      {error && (
        <div className="card" style={{ marginTop: 14, background: 'var(--warn-soft)', boxShadow: 'none', color: 'var(--warn-ink)', fontSize: 13 }}>
          <span className="row" style={{ gap: 8 }}><Icon name="alert" size={16} />{error}</span>
        </div>
      )}
      <button className="btn primary" style={{ marginTop: 20 }} disabled={!any} onClick={onSubmit}>
        {any ? '上傳並解析' : '請先選擇截圖'}
      </button>
      <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.5 }}>
        截「設定 → 螢幕使用時間」整頁，數字清楚別被遮住。
      </div>
    </div>
  );
}

function Parsing() {
  return (
    <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 6 }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="48" cy="48" r="42" fill="none" stroke="var(--sand)" strokeWidth="7" />
          <circle cx="48" cy="48" r="42" fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="150">
            <animateTransform attributeName="transform" type="rotate" from="0 48 48" to="360 48 48" dur="1.1s" repeatCount="indefinite" />
          </circle>
        </svg>
        <span className="center" style={{ position: 'absolute', inset: 0, color: 'var(--accent)' }}><Icon name="scan" size={34} sw={1.5} /></span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 18, marginTop: 18 }}>正在讀取截圖…</div>
      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.6 }}>辨識各 App 的使用時數，<br />大約需要幾秒鐘。</div>
    </div>
  );
}

function ParsedCard({ r }: { r: OneResult }) {
  const title = r.kind === 'YESTERDAY' ? '昨天（完整）' : '今天（打卡）';
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="between" style={{ marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
        <span className="bignum tnum" style={{ fontSize: 22 }}>{fmt(r.totalMinutes)}</span>
      </div>
      {(r.apps ?? []).map((a, i) => {
        const g = glyphFor(a.label);
        return (
          <div className="approw" key={i}>
            <AppIcon glyph={g.glyph} color={g.color} />
            <div className="meta between" style={{ display: 'flex' }}>
              <span className="nm">{a.label}</span>
              <span className="mins">{a.minutes} 分</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FailCard({ r }: { r: OneResult }) {
  const title = r.kind === 'YESTERDAY' ? '昨天' : '今天';
  const msg =
    r.reason === 'llm_not_configured' ? 'LLM 尚未設定（請填 OpenCode 金鑰）'
    : r.reason === 'no_apps_detected' ? '讀不出 App 數字，換一張完整截圖'
    : r.reason === 'llm_timeout' ? '解析逾時，請再試一次'
    : '這張看不太出數字，換一張完整截圖再試';
  return (
    <div className="card" style={{ marginBottom: 14, border: '1px solid var(--warn-soft)', boxShadow: 'none' }}>
      <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          <img src={r.imageUrl} alt="失敗截圖" style={{ width: 76, height: 128, objectFit: 'cover', borderRadius: 12, filter: 'grayscale(.4)', border: '1px solid var(--line)' }} />
          <span className="center" style={{ position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: '50%', background: 'var(--warn)', color: '#fff' }}><Icon name="x" size={16} sw={2.4} /></span>
        </div>
        <div style={{ flex: 1 }}>
          <span className="chip warn"><Icon name="alert" size={14} />讀取失敗</span>
          <div style={{ fontWeight: 700, fontSize: 15, marginTop: 8 }}>「{title}」這張</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>{msg}</div>
        </div>
      </div>
    </div>
  );
}

function NoteCard({ r }: { r: OneResult }) {
  const title = r.kind === 'YESTERDAY' ? '昨天' : '今天';
  const locked = r.status === 'LOCKED';
  return (
    <div className="card flat" style={{ marginBottom: 14, display: 'flex', gap: 12, padding: 14, alignItems: 'flex-start' }}>
      <span className="center" style={{ width: 38, height: 38, borderRadius: 11, background: locked ? 'var(--good-soft)' : 'var(--warn-soft)', color: locked ? 'var(--good-ink)' : 'var(--warn-ink)', flex: '0 0 auto' }}>
        <Icon name={locked ? 'lock' : 'alert'} size={18} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>「{title}」{locked ? '已鎖定' : '未採用'}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>{r.message ?? (locked ? '已上傳並鎖定，不能再更改。' : '時數比目前記錄少，未採用。')}</div>
      </div>
    </div>
  );
}

function Done({ results, onDone, onReset }: { results: { yesterday?: OneResult; today?: OneResult }; onDone: () => void; onReset: () => void }) {
  const list = [results.yesterday, results.today].filter(Boolean) as OneResult[];
  const anyOk = list.some((r) => r.status === 'PARSED');
  const anyFail = list.some((r) => r.status === 'NEED_REUPLOAD');
  return (
    <>
      <div className="wrap scroll-body">
        <div className="card" style={{ textAlign: 'center', padding: '22px 20px 18px', marginBottom: 14 }}>
          <span className="center" style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px', background: anyOk ? 'var(--good-soft)' : 'var(--warn-soft)', color: anyOk ? 'var(--good-ink)' : 'var(--warn-ink)' }}>
            <Icon name={anyOk ? 'checkCircle' : 'alert'} size={30} sw={1.7} />
          </span>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{anyOk ? '讀到了！確認一下時數' : '看一下結果'}</div>
          {anyFail && <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 6 }}>有截圖需要重傳</div>}
        </div>
        {list.map((r) =>
          r.status === 'PARSED' ? <ParsedCard key={r.kind} r={r} />
          : r.status === 'NEED_REUPLOAD' ? <FailCard key={r.kind} r={r} />
          : <NoteCard key={r.kind} r={r} />,
        )}
      </div>
      <div className="footerbar">
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn ghost block" onClick={onReset}>{anyFail ? '重新上傳' : '再傳一張'}</button>
          <button className="btn primary block" onClick={onDone}><Icon name="check" size={19} sw={2.2} />完成</button>
        </div>
      </div>
    </>
  );
}
