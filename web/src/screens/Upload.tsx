import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Phone, PageHeader, AppIcon, APPS } from '../components/ui';

type State = 'empty' | 'parsing' | 'success' | 'fail';

function Dropzone({ tag, title, hint, page, selected, onPick }: {
  tag: string; title: string; hint: string; page: string; selected: boolean; onPick: () => void;
}) {
  return (
    <div className="dropzone" style={selected ? { borderColor: 'var(--accent)', borderStyle: 'solid' } : undefined}>
      <div className="row" style={{ gap: 12, alignSelf: 'stretch' }}>
        <div className="ph-thumb"><Icon name="image" size={22} style={{ color: 'var(--ink-3)' }} /></div>
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div className="row" style={{ gap: 7, marginBottom: 4 }}>
            <span className="chip accent" style={{ padding: '3px 9px' }}>{tag}</span>
            {selected && <span className="chip good" style={{ padding: '3px 9px' }}><Icon name="check" size={12} sw={2.4} />已選</span>}
          </div>
          <div className="zone-title">{title}</div>
          <div className="zone-hint" style={{ marginTop: 3 }}>{hint}</div>
        </div>
      </div>
      <button className="btn soft sm" style={{ alignSelf: 'stretch', marginTop: 4 }} onClick={onPick}>
        <Icon name="upload" size={17} sw={1.9} />{selected ? '重新選擇' : '選擇截圖'}
      </button>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{page}</div>
    </div>
  );
}

export default function Upload() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [state, setState] = useState<State>((sp.get('state') as State) || 'empty');
  const [picked, setPicked] = useState<[boolean, boolean]>([false, false]);

  useEffect(() => {
    if (state !== 'parsing') return;
    const t = setTimeout(() => setState('success'), 1800);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <Phone>
      <PageHeader title="每日回報" sub="上傳兩張截圖，自動讀出時數" />
      {state === 'empty' && <Empty picked={picked} setPicked={setPicked} onSubmit={() => setState('parsing')} />}
      {state === 'parsing' && <Parsing />}
      {state === 'success' && <Success onDone={() => nav('/')} onWrong={() => setState('empty')} />}
      {state === 'fail' && <Fail onRetry={() => setState('empty')} />}
    </Phone>
  );
}

function Empty({ picked, setPicked, onSubmit }: {
  picked: [boolean, boolean]; setPicked: (p: [boolean, boolean]) => void; onSubmit: () => void;
}) {
  const both = picked[0] && picked[1];
  return (
    <div className="wrap scroll-body">
      <div className="card" style={{ background: 'var(--accent-soft)', boxShadow: 'none', display: 'flex', gap: 11, padding: 15 }}>
        <span style={{ color: 'var(--accent-ink)', flex: '0 0 auto' }}><Icon name="info" size={20} /></span>
        <div style={{ fontSize: 12.5, color: 'var(--accent-ink)', lineHeight: 1.5 }}>
          每天上傳<b>「昨天完整」</b>與<b>「今天打卡」</b>兩張，才能準確結算昨天、提早提醒今天。
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Dropzone tag="第 1 張" title="上傳昨天的完整數據" hint="昨天一整天的螢幕使用時間，用來結算。" page="截「螢幕使用時間 → 昨天」整頁"
          selected={picked[0]} onPick={() => setPicked([true, picked[1]])} />
        <Dropzone tag="第 2 張" title="今天先打個卡" hint="今天目前為止的用量，讓大家看到進度。" page="截「螢幕使用時間 → 今天」整頁"
          selected={picked[1]} onPick={() => setPicked([picked[0], true])} />
      </div>
      <button className="btn primary" style={{ marginTop: 20 }} disabled={!both} onClick={onSubmit}>
        {both ? '上傳並解析' : '請先選擇兩張截圖'}
      </button>
      <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.5 }}>
        看不懂截哪一頁？<span style={{ color: 'var(--accent)', fontWeight: 700 }}>看教學</span>
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
      <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.6 }}>
        辨識各 App 的使用時數，<br />大約需要幾秒鐘。
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 28 }}>
        {[{ t: '昨天', s: '辨識中', on: true }, { t: '今天', s: '排隊中', on: false }].map((x, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div className="ph" style={{ width: 72, height: 120 }}>{x.t}</div>
            <span className={'chip ' + (x.on ? 'accent' : 'neutral')} style={{ fontSize: 11 }}>{x.on && <span className="dot" />}{x.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Success({ onDone, onWrong }: { onDone: () => void; onWrong: () => void }) {
  const apps = [{ ...APPS.tk, m: 38 }, { ...APPS.ig, m: 22 }, { ...APPS.yt, m: 10 }, { ...APPS.fb, m: 6 }];
  return (
    <>
      <div className="wrap scroll-body">
        <div className="card" style={{ textAlign: 'center', padding: '24px 20px 20px' }}>
          <span className="center" style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--good-soft)', color: 'var(--good-ink)', margin: '0 auto 14px' }}>
            <Icon name="checkCircle" size={34} sw={1.7} />
          </span>
          <div style={{ fontWeight: 700, fontSize: 18 }}>讀到了！確認一下時數</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6 }}>昨天（6/14）社群＋短影音合計</div>
          <div className="bignum tnum" style={{ fontSize: 46, marginTop: 6, color: 'var(--ink)' }}>1<span className="unit">時</span>16<span className="unit">分</span></div>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <div className="between" style={{ marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>讀到的各 App</span>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }} className="row"><Icon name="edit" size={15} />修正</span>
          </div>
          {apps.map((a, i) => (
            <div className="approw" key={i}>
              <AppIcon glyph={a.glyph} color={a.color} />
              <div className="meta between" style={{ display: 'flex' }}><span className="nm">{a.name}</span><span className="mins">{a.m} 分</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="footerbar">
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn ghost block" onClick={onWrong}>數字不對</button>
          <button className="btn primary block" onClick={onDone}><Icon name="check" size={19} sw={2.2} />沒問題，送出</button>
        </div>
      </div>
    </>
  );
}

function Fail({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="wrap scroll-body">
      <div className="card" style={{ border: '1px solid var(--warn-soft)', boxShadow: 'none', background: 'var(--card-2)' }}>
        <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
          <div style={{ position: 'relative', flex: '0 0 auto' }}>
            <div className="ph" style={{ width: 76, height: 128, filter: 'grayscale(.4)' }}>失敗的截圖</div>
            <span className="center" style={{ position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: '50%', background: 'var(--warn)', color: '#fff', boxShadow: 'var(--shadow-sm)' }}>
              <Icon name="x" size={16} sw={2.4} />
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <span className="chip warn" style={{ marginBottom: 8 }}><Icon name="alert" size={14} />讀取失敗</span>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 8 }}>「今天」這張看不太出數字</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>畫面好像不是「螢幕使用時間」頁，或數字被裁切了。換一張完整截圖再試一次。</div>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 13, borderRadius: 12, background: 'var(--card)', fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>截圖小提醒</div>
          <div className="row" style={{ gap: 8, marginBottom: 4 }}><Icon name="check" size={15} style={{ color: 'var(--good)' }} />要有「螢幕使用時間」標題與各 App 列表</div>
          <div className="row" style={{ gap: 8 }}><Icon name="check" size={15} style={{ color: 'var(--good)' }} />數字清楚、沒被通知列或手指遮住</div>
        </div>
        <button className="btn warn" style={{ marginTop: 16 }} onClick={onRetry}><Icon name="refresh" size={18} sw={2} />重新上傳這張</button>
      </div>
      <div className="card flat" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
        <span className="center" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--good-soft)', color: 'var(--good-ink)', flex: '0 0 auto' }}>
          <Icon name="checkCircle" size={20} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>「昨天」那張已讀取成功</div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>只要重傳今天這張就好</div>
        </div>
      </div>
    </div>
  );
}
