/* ScreenPact — ③ Daily Upload (4 states) + ④ Room Detail (4 tabs) */

function UploadHeader() {
  return (
    <div className="backbar" style={{ padding: '4px 16px 8px' }}>
      <button className="iconbtn" style={{ width: 36, height: 36 }}><Icon name="chevL" size={20} /></button>
      <div>
        <div style={{ fontWeight: 900, fontSize: 19 }}>每日回報</div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>上傳兩張截圖，自動讀出時數</div>
      </div>
    </div>
  );
}

function Dropzone({ tag, title, hint, page }) {
  return (
    <div className="dropzone">
      <div className="row" style={{ gap: 12, alignSelf: 'stretch' }}>
        <div className="ph-thumb"><Icon name="image" size={22} style={{ color: 'var(--ink-3)' }} /></div>
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div className="row" style={{ gap: 7, marginBottom: 4 }}>
            <span className="chip accent" style={{ padding: '3px 9px' }}>{tag}</span>
          </div>
          <div className="zone-title">{title}</div>
          <div className="zone-hint" style={{ marginTop: 3 }}>{hint}</div>
        </div>
      </div>
      <button className="btn soft sm" style={{ alignSelf: 'stretch', marginTop: 4 }}><Icon name="upload" size={17} sw={1.9} />選擇截圖</button>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>{page}</div>
    </div>
  );
}

// ③-a 空
function UploadEmpty() {
  return (
    <div className="phone" style={{ height: 844 }}>
      <StatusBar />
      <UploadHeader />
      <div className="wrap scroll-body">
        <div className="card" style={{ background: 'var(--accent-soft)', boxShadow: 'none', display: 'flex', gap: 11, padding: 15 }}>
          <span style={{ color: 'var(--accent-ink)', flex: '0 0 auto' }}><Icon name="info" size={20} /></span>
          <div style={{ fontSize: 12.5, color: 'var(--accent-ink)', lineHeight: 1.5 }}>每天上傳<b>「昨天完整」</b>與<b>「今天打卡」</b>兩張，才能準確結算昨天、提早提醒今天。</div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Dropzone tag="第 1 張" title="上傳昨天的完整數據" hint="昨天一整天的螢幕使用時間，用來結算。" page="截「螢幕使用時間 → 昨天」整頁" />
          <Dropzone tag="第 2 張" title="今天先打個卡" hint="今天目前為止的用量，讓大家看到進度。" page="截「螢幕使用時間 → 今天」整頁" />
        </div>
        <button className="btn primary" style={{ marginTop: 20 }} disabled>請先選擇兩張截圖</button>
        <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.5 }}>看不懂截哪一頁？<span style={{ color: 'var(--accent)', fontWeight: 700 }}>看教學</span></div>
      </div>
      <HomeBar />
    </div>
  );
}

// ③-b 解析中
function UploadParsing() {
  return (
    <div className="phone" style={{ height: 844 }}>
      <StatusBar />
      <UploadHeader />
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 6 }}>
          <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="48" cy="48" r="42" fill="none" stroke="var(--sand)" strokeWidth="7" />
            <circle cx="48" cy="48" r="42" fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="150" />
          </svg>
          <span className="center" style={{ position: 'absolute', inset: 0, color: 'var(--accent)' }}><Icon name="scan" size={34} sw={1.5} /></span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 18, marginTop: 18 }}>正在讀取截圖…</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 8, lineHeight: 1.6 }}>辨識各 App 的使用時數，<br />大約需要幾秒鐘。</div>
        <div style={{ display: 'flex', gap: 18, marginTop: 28 }}>
          {[{ t: '昨天', s: '辨識中', on: true }, { t: '今天', s: '排隊中', on: false }].map((x, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div className="ph" style={{ width: 72, height: 120 }}>{x.t}</div>
              <span className={'chip ' + (x.on ? 'accent' : 'neutral')} style={{ fontSize: 11 }}>{x.on && <span className="dot" />}{x.s}</span>
            </div>
          ))}
        </div>
      </div>
      <HomeBar />
    </div>
  );
}

// ③-c 成功
function UploadSuccess() {
  const apps = [
    { ...APPS.tk, m: 38 }, { ...APPS.ig, m: 22 }, { ...APPS.yt, m: 10 }, { ...APPS.fb, m: 6 },
  ];
  return (
    <div className="phone" style={{ height: 816 }}>
      <StatusBar />
      <UploadHeader />
      <div className="wrap scroll-body">
        <div className="card" style={{ textAlign: 'center', padding: '24px 20px 20px' }}>
          <span className="center" style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--good-soft)', color: 'var(--good-ink)', margin: '0 auto 14px' }}><Icon name="checkCircle" size={34} sw={1.7} /></span>
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
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn ghost block">數字不對</button>
          <button className="btn primary block"><Icon name="check" size={19} sw={2.2} />沒問題，送出</button>
        </div>
      </div>
      <HomeBar />
    </div>
  );
}

// ③-d 失敗重傳
function UploadFail() {
  return (
    <div className="phone" style={{ height: 760 }}>
      <StatusBar />
      <UploadHeader />
      <div className="wrap scroll-body">
        <div className="card" style={{ border: '1px solid var(--warn-soft)', boxShadow: 'none', background: 'var(--card-2)' }}>
          <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', flex: '0 0 auto' }}>
              <div className="ph" style={{ width: 76, height: 128, filter: 'grayscale(.4)' }}>失敗的截圖</div>
              <span className="center" style={{ position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: '50%', background: 'var(--warn)', color: '#fff', boxShadow: 'var(--shadow-sm)' }}><Icon name="x" size={16} sw={2.4} /></span>
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
          <button className="btn warn" style={{ marginTop: 16 }}><Icon name="refresh" size={18} sw={2} />重新上傳這張</button>
        </div>
        <div className="card flat" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, padding: 14 }}>
          <span className="center" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--good-soft)', color: 'var(--good-ink)', flex: '0 0 auto' }}><Icon name="checkCircle" size={20} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>「昨天」那張已讀取成功</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>只要重傳今天這張就好</div>
          </div>
        </div>
      </div>
      <HomeBar />
    </div>
  );
}

// ─────────── ④ ROOM DETAIL ───────────
function RoomShell({ tab, children, height }) {
  const tabs = [['member', '成員'], ['rule', '規則'], ['rank', '排行'], ['chat', '聊天']];
  return (
    <div className="phone" style={{ height }}>
      <StatusBar />
      <div className="backbar" style={{ padding: '4px 16px 6px' }}>
        <button className="iconbtn" style={{ width: 36, height: 36 }}><Icon name="chevL" size={20} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 19 }}>沉澱小隊</div>
          <div className="row" style={{ gap: 6, fontSize: 12, color: 'var(--warn-ink)', marginTop: 1 }}><Icon name="clock" size={14} />距每日結算 4 小時 12 分</div>
        </div>
        <button className="iconbtn" style={{ width: 36, height: 36 }}><Icon name="settings" size={19} /></button>
      </div>
      <div style={{ padding: '4px 16px 8px' }}>
        <div className="roomtabs">
          {tabs.map(([id, label]) => <button key={id} className={tab === id ? 'on' : ''}>{label}</button>)}
        </div>
      </div>
      <div className="wrap" style={{ padding: '4px 16px 22px', overflow: 'hidden' }}>{children}</div>
      <HomeBar />
    </div>
  );
}

// ④-a 成員
function RoomMembers() {
  const ms = [
    { n: '宥', name: '宥宥（你）', m: 70, cap: 90, rep: true },
    { n: '庭', name: '庭瑄', m: 52, cap: 90, rep: true },
    { n: '晴', name: '晴晴', m: 104, cap: 90, rep: true, over: true },
    { n: '安', name: '安安', m: 38, cap: 90, rep: true },
    { n: '哲', name: '哲哲', m: 0, cap: 90, rep: false },
  ];
  return (
    <RoomShell tab="member" height={912}>
      <div className="between" style={{ margin: '4px 4px 10px' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-2)' }}>本期 · 5 位成員</span>
        <span className="chip neutral">4 / 5 已回報</span>
      </div>
      <div className="card" style={{ padding: '6px 16px' }}>
        {ms.map((m, i) => {
          const pct = m.m / m.cap * 100;
          return (
            <div className="lrow" key={i}>
              <Avatar name={m.n} idx={i} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="between"><span style={{ fontWeight: 700, fontSize: 14.5 }}>{m.name}</span>
                  {m.rep ? <span className="tnum" style={{ fontWeight: 700, fontSize: 14, color: m.over ? 'var(--warn-ink)' : 'var(--ink)' }}>{m.m} 分</span>
                    : <Chip kind="neutral">待回報</Chip>}
                </div>
                <div className="row" style={{ gap: 8, marginTop: 7 }}>
                  <div style={{ flex: 1 }}><Bar pct={m.rep ? pct : 0} state={m.over ? 'over' : 'good'} /></div>
                  {m.rep && (m.over ? <Chip kind="warn">超 14 分</Chip> : <Chip kind="good">達標</Chip>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="card flat" style={{ marginTop: 12, textAlign: 'center', padding: 14, fontSize: 13, color: 'var(--ink-2)' }}>
        每日上限 <b style={{ color: 'var(--ink)' }}>1時30分</b> · 哲哲今天還沒回報，提醒一下？
      </div>
    </RoomShell>
  );
}

// ④-b 規則
function RoomRules() {
  const caps = [
    { ...APPS.tk, cap: '40 分' }, { ...APPS.ig, cap: '30 分' }, { ...APPS.yt, cap: '25 分' },
  ];
  return (
    <RoomShell tab="rule" height={940}>
      <div className="card" style={{ padding: 16 }}>
        <div className="between" style={{ marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>追蹤上限（每日）</span>
          <Chip kind="accent"><Icon name="crown" size={13} />房主可編輯</Chip>
        </div>
        {caps.map((a, i) => (
          <div className="approw" key={i}>
            <AppIcon glyph={a.glyph} color={a.color} />
            <div className="meta between" style={{ display: 'flex' }}><span className="nm">{a.name}</span><span className="mins tnum">{a.cap}</span></div>
          </div>
        ))}
        <div className="approw" style={{ color: 'var(--ink-2)' }}>
          <span className="center" style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--sand)', color: 'var(--ink-2)', flex: '0 0 auto' }}><Icon name="chart" size={18} /></span>
          <div className="meta between" style={{ display: 'flex' }}><span className="nm">合計總上限</span><span className="mins tnum">1時30分</span></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        {[
          { ic: 'calendar', t: '結算週期', v: '每日 · 00:00 重置' },
          { ic: 'clock', t: '回報截止', v: '每天 23:00' },
        ].map((r, i) => (
          <div key={i} className="between" style={{ padding: '11px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
            <span className="row" style={{ gap: 10, color: 'var(--ink-2)', fontSize: 14 }}><Icon name={r.ic} size={19} />{r.t}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{r.v}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 12, background: 'var(--warn-soft)', boxShadow: 'none' }}>
        <div className="row" style={{ gap: 8, color: 'var(--warn-ink)', fontWeight: 700, fontSize: 14, marginBottom: 7 }}><Icon name="flame" size={18} />超標懲罰</div>
        <div style={{ fontSize: 13.5, color: 'var(--warn-ink)', lineHeight: 1.6 }}>超標的人，這期請室友喝一杯飲料 🧋；超過 30 分鐘則加碼負責掃地一週。</div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button className="btn ghost sm block"><Icon name="edit" size={17} />編輯追蹤清單</button>
        <button className="btn ghost sm block"><Icon name="clock" size={17} />改截止時間</button>
      </div>
    </RoomShell>
  );
}

// ④-c 排行
function RoomRank() {
  const rk = [
    { r: 2, n: '安', name: '安安', m: 38, h: 60 },
    { r: 1, n: '庭', name: '庭瑄', m: 28, h: 86 },
    { r: 3, n: '宥', name: '宥宥（你）', m: 70, h: 44, me: true },
  ];
  const rest = [
    { r: 4, n: '哲', name: '哲哲', m: 82 },
    { r: 5, n: '晴', name: '晴晴', m: 104, over: true },
  ];
  return (
    <RoomShell tab="rank" height={912}>
      <div className="card" style={{ padding: '20px 16px 16px' }}>
        <div className="between" style={{ marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>本期排行</span>
          <span className="chip neutral">用最少者領先</span>
        </div>
        {/* podium */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, height: 150 }}>
          {rk.map((p, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <Avatar name={p.n} idx={p.r} size={p.r === 1 ? 56 : 46} ring={p.me ? 2 : 0} />
                {p.r === 1 && <span className="center" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', color: '#c79a3a' }}><Icon name="crown" size={22} sw={1.7} /></span>}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, textAlign: 'center' }}>{p.name}</div>
              <div className="tnum" style={{ fontSize: 12, color: 'var(--ink-2)' }}>{p.m} 分</div>
              <div style={{ width: '100%', height: p.h, borderRadius: '10px 10px 0 0', background: p.r === 1 ? 'var(--accent)' : 'var(--accent-soft)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8, color: p.r === 1 ? '#fff' : 'var(--accent-ink)', fontWeight: 900, fontSize: 17 }}>{p.r}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ marginTop: 12, padding: '4px 16px' }}>
        {rest.map((p, i) => (
          <div className="lrow" key={i}>
            <span className="tnum" style={{ width: 22, fontWeight: 900, color: 'var(--ink-3)', fontSize: 15 }}>{p.r}</span>
            <Avatar name={p.n} idx={p.r} size={38} />
            <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5 }}>{p.name}</span>
            {p.over && <Chip kind="warn" dot>超標</Chip>}
            <span className="tnum" style={{ fontWeight: 700, fontSize: 14 }}>{p.m} 分</span>
          </div>
        ))}
      </div>
    </RoomShell>
  );
}

// ④-d 聊天
function RoomChat() {
  return (
    <RoomShell tab="chat" height={912}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        <div className="sysline">
          <span className="st"><Icon name="info" size={15} />系統公告</span>
          <span>追蹤清單已更新：新增「短影音 A」，上限 40 分／日。</span>
        </div>
        <div className="row" style={{ gap: 9, alignItems: 'flex-end' }}>
          <Avatar name="庭" idx={1} size={32} />
          <div className="bubble them">大家今天記得回報～截止 23:00 🙏</div>
        </div>
        <div className="row" style={{ gap: 9, alignItems: 'flex-end' }}>
          <Avatar name="安" idx={3} size={32} />
          <div className="bubble them">我已經傳了，今天只用 38 分 💪</div>
        </div>
        <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
          <div className="bubble me">太強了！我也來拼一下 😤</div>
        </div>
        <div className="sysline" style={{ background: 'var(--good-soft)', color: 'var(--good-ink)' }}>
          <span className="st"><Icon name="checkCircle" size={15} />打卡通知</span>
          <span>晴晴 完成今日回報（4 / 5 已回報）。</span>
        </div>
      </div>
      <div className="row" style={{ gap: 10, marginTop: 14 }}>
        <div className="input row" style={{ flex: 1, padding: '10px 14px', color: 'var(--ink-3)' }}>輸入訊息…</div>
        <button className="center" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', flex: '0 0 auto' }}><Icon name="send" size={20} sw={1.9} /></button>
      </div>
    </RoomShell>
  );
}

Object.assign(window, {
  UploadEmpty, UploadParsing, UploadSuccess, UploadFail,
  RoomMembers, RoomRules, RoomRank, RoomChat,
});
