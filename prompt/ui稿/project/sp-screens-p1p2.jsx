/* ScreenPact — P1 ⑦⑧⑨⑩ + P2 ⑪⑫ */

function PageHeader({ title, sub, right, close }) {
  return (
    <div className="backbar" style={{ padding: '4px 16px 8px' }}>
      <button className="iconbtn" style={{ width: 36, height: 36 }}><Icon name={close ? 'x' : 'chevL'} size={close ? 19 : 20} /></button>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 19 }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function CheckCircle({ on }) {
  return on
    ? <span className="center" style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', flex: '0 0 auto' }}><Icon name="check" size={15} sw={2.6} /></span>
    : <span style={{ width: 24, height: 24, borderRadius: '50%', border: '1.8px solid var(--stone)', flex: '0 0 auto' }} />;
}

// ─────────── ⑦ 追蹤 App 設定（房主）───────────
const CATALOG = {
  '社交': [
    { n: '社群相簿', g: 'camera', c: '#a8728c', on: true, cap: '30 分' },
    { n: '動態社群', g: 'room', c: '#6d7fa3', on: false },
    { n: '微網誌', g: 'hourglass', c: '#7a7f86', on: false },
  ],
  '短影音': [
    { n: '短影音 A', g: 'flame', c: '#5d6b73', on: true, cap: '40 分' },
    { n: '短影音 B', g: 'image', c: '#b06a5a', on: true, cap: '40 分' },
  ],
  '其他': [
    { n: '影音平台', g: 'image', c: '#7d8a86', on: true, cap: '25 分' },
    { n: '串流音樂', g: 'chart', c: '#94937f', on: false },
  ],
};
function TrackingSettings() {
  return (
    <div className="phone" style={{ height: 960 }}>
      <StatusBar />
      <PageHeader title="編輯追蹤清單" sub="勾選要一起控管的 App"
        right={<Chip kind="accent"><Icon name="crown" size={13} />房主</Chip>} />
      <div className="wrap scroll-body">
        {Object.entries(CATALOG).map(([group, apps], gi) => (
          <div key={gi}>
            <div className="sectlabel" style={{ marginTop: gi ? 18 : 8 }}>{group}</div>
            <div className="card" style={{ padding: '4px 16px' }}>
              {apps.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
                  <AppIcon glyph={a.g} color={a.c} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14.5 }}>{a.n}</div>
                    {a.on
                      ? <div className="row" style={{ gap: 5, fontSize: 12, color: 'var(--accent-ink)', marginTop: 2 }}>每日上限 {a.cap}<Icon name="chevR" size={13} /></div>
                      : <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>未追蹤</div>}
                  </div>
                  <CheckCircle on={a.on} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="card" style={{ marginTop: 16, background: 'var(--accent-soft)', boxShadow: 'none', display: 'flex', gap: 11, padding: 14 }}>
          <Icon name="info" size={18} style={{ color: 'var(--accent-ink)', flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.5, color: 'var(--accent-ink)', lineHeight: 1.55 }}>儲存後，更新內容<b>將自動於聊天室公告</b>，提醒所有成員。</div>
        </div>
      </div>
      <div style={{ padding: '10px 18px 12px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
        <button className="btn primary"><Icon name="check" size={19} sw={2.2} />儲存並公告（追蹤 4 個 App）</button>
      </div>
      <HomeBar />
    </div>
  );
}

// ─────────── ⑧ 規則與投票 ───────────
function RulesVote() {
  const opts = [
    { t: '維持 40 分', v: 1, pct: 20 },
    { t: '改為 30 分', v: 2, pct: 40, mine: true },
    { t: '改為 20 分', v: 1, pct: 20 },
  ];
  return (
    <div className="phone" style={{ height: 1000 }}>
      <StatusBar />
      <PageHeader title="規則與投票" sub="沉澱小隊" />
      <div className="wrap scroll-body">
        {/* current rule snapshot */}
        <div className="card" style={{ padding: 16 }}>
          <div className="between" style={{ marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>目前規則</span>
            <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }} className="row">查看全部<Icon name="chevR" size={14} /></span>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Chip kind="neutral">短影音 40 分</Chip>
            <Chip kind="neutral">社群 30 分</Chip>
            <Chip kind="neutral">每日結算</Chip>
            <Chip kind="neutral">截止 23:00</Chip>
          </div>
        </div>

        <button className="btn soft" style={{ marginTop: 14 }}><Icon name="plus" size={18} sw={2.2} />發起提案（改上限 / 改懲罰）</button>

        <div className="sectlabel">進行中的提案</div>
        {/* active proposal */}
        <div className="card">
          <div className="between" style={{ marginBottom: 4 }}>
            <Chip kind="accent" dot>投票中</Chip>
            <span className="row" style={{ gap: 5, fontSize: 12, color: 'var(--warn-ink)' }}><Icon name="clock" size={14} />剩 1 天</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, margin: '10px 0 4px' }}>短影音每日上限要調整嗎？</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 14 }}>庭瑄 發起 · 通過門檻 ≥ 半數（需 3 / 5 票）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {opts.map((o, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: o.mine ? '1.5px solid var(--accent)' : '1px solid var(--line)', padding: '11px 13px' }}>
                <div style={{ position: 'absolute', inset: 0, background: o.mine ? 'var(--accent-soft)' : 'var(--sand)', width: o.pct + '%', opacity: o.mine ? 1 : 0.6 }} />
                <div className="between" style={{ position: 'relative' }}>
                  <span className="row" style={{ gap: 8, fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>{o.mine && <Icon name="checkCircle" size={17} style={{ color: 'var(--accent)' }} />}{o.t}</span>
                  <span className="tnum" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)' }}>{o.v} 票</span>
                </div>
              </div>
            ))}
          </div>
          <div className="between" style={{ marginTop: 13 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>已投 4 / 5 票 · 你已投「改為 30 分」</span>
            <button className="btn ghost sm" style={{ padding: '8px 14px' }}>改投</button>
          </div>
        </div>

        {/* second proposal — waiting */}
        <div className="card" style={{ opacity: 0.92 }}>
          <div className="between" style={{ marginBottom: 8 }}>
            <Chip kind="neutral">尚未投票</Chip>
            <span className="row" style={{ gap: 5, fontSize: 12, color: 'var(--ink-3)' }}><Icon name="clock" size={14} />剩 2 天</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>超標懲罰改成「請喝手搖」？</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '6px 0 12px' }}>哲哲 發起 · 需 3 / 5 票</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn outline sm block">反對</button>
            <button className="btn primary sm block">贊成</button>
          </div>
        </div>
      </div>
      <HomeBar />
    </div>
  );
}

// ─────────── ⑨ 房間聊天室（完整）───────────
function RoomChatFull() {
  return (
    <div className="phone" style={{ height: 912 }}>
      <StatusBar />
      <div className="backbar" style={{ padding: '4px 16px 8px' }}>
        <button className="iconbtn" style={{ width: 36, height: 36 }}><Icon name="chevL" size={20} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>沉澱小隊</div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>5 位成員 · 4 人在線</div>
        </div>
        <div className="row">
          {['宥','庭','晴'].map((n, i) => <span key={i} style={{ marginLeft: i ? -9 : 0, borderRadius: '50%', boxShadow: '0 0 0 2px var(--bg)' }}><Avatar name={n} idx={i} size={28} /></span>)}
        </div>
      </div>
      <div className="wrap" style={{ padding: '6px 16px 8px', display: 'flex', flexDirection: 'column', gap: 11, overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)' }}>今天</div>

        <div className="sysline">
          <span className="st"><Icon name="settings" size={15} />追蹤清單更新</span>
          <span>房主新增「短影音 B」，每日上限 40 分。</span>
        </div>

        <div className="row" style={{ gap: 9, alignItems: 'flex-end' }}>
          <Avatar name="庭" idx={1} size={32} />
          <div><div style={{ fontSize: 11, color: 'var(--ink-3)', margin: '0 0 3px 4px' }}>庭瑄</div><div className="bubble them">大家今天記得回報～截止 23:00 🙏</div></div>
        </div>
        <div className="row" style={{ gap: 9, alignItems: 'flex-end' }}>
          <Avatar name="安" idx={3} size={32} />
          <div className="bubble them">傳好了，今天只用 38 分 💪</div>
        </div>
        <div style={{ alignSelf: 'flex-end' }}><div className="bubble me">太強了！我也來拼一下 😤</div></div>

        <div className="sysline" style={{ background: 'var(--warn-soft)', color: 'var(--warn-ink)' }}>
          <span className="st"><Icon name="clock" size={15} />截止時間調整</span>
          <span>回報截止時間改為 23:00（原 22:00），經投票通過。</span>
        </div>

        <div className="sysline" style={{ background: 'var(--good-soft)', color: 'var(--good-ink)' }}>
          <span className="st"><Icon name="trophy" size={15} />本期結算完成</span>
          <span>本期 4 人達標、1 人超標。點我看結算結果與排行 ›</span>
        </div>
      </div>
      <div className="row" style={{ gap: 10, padding: '8px 16px 0' }}>
        <button className="iconbtn" style={{ width: 40, height: 40 }}><Icon name="plus" size={20} /></button>
        <div className="input row" style={{ flex: 1, padding: '10px 14px', color: 'var(--ink-3)' }}>輸入訊息…</div>
        <button className="center" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: '#fff', border: 'none', flex: '0 0 auto' }}><Icon name="send" size={20} sw={1.9} /></button>
      </div>
      <HomeBar />
    </div>
  );
}

// ─────────── ⑩ 結算結果 ───────────
function Settlement() {
  const ms = [
    { n: '庭', name: '庭瑄', m: 28, cap: 90, rank: 1 },
    { n: '安', name: '安安', m: 38, cap: 90, rank: 2 },
    { n: '宥', name: '宥宥（你）', m: 70, cap: 90, rank: 3, me: true },
    { n: '哲', name: '哲哲', m: 82, cap: 90, rank: 4 },
    { n: '晴', name: '晴晴', m: 104, cap: 90, rank: 5, over: 14 },
  ];
  return (
    <div className="phone" style={{ height: 1040 }}>
      <StatusBar />
      <PageHeader title="本期結算" sub="6/14 · 每日結算" close />
      <div className="wrap scroll-body">
        {/* hero summary */}
        <div className="card" style={{ textAlign: 'center', padding: '22px 20px', background: 'var(--accent)', color: '#fff', boxShadow: '0 8px 22px rgba(63,128,122,.28)' }}>
          <div style={{ fontSize: 13, opacity: 0.85 }}>本期結果</div>
          <div style={{ fontWeight: 900, fontSize: 22, margin: '6px 0 16px' }}>4 人守住了，1 人超標 🙌</div>
          <div className="row" style={{ justifyContent: 'center', gap: 0 }}>
            <div style={{ flex: 1 }}><div className="bignum" style={{ fontSize: 32 }}>4</div><div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>達標</div></div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,.25)' }} />
            <div style={{ flex: 1 }}><div className="bignum" style={{ fontSize: 32 }}>1</div><div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>超標</div></div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,.25)' }} />
            <div style={{ flex: 1 }}><div className="bignum" style={{ fontSize: 32 }}>56<span style={{ fontSize: 14 }}>分</span></div><div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>平均用量</div></div>
          </div>
        </div>

        <div className="sectlabel">成員結果</div>
        <div className="card" style={{ padding: '4px 16px' }}>
          {ms.map((m, i) => (
            <div className="lrow" key={i}>
              <span className="tnum" style={{ width: 18, fontWeight: 900, color: 'var(--ink-3)', fontSize: 14 }}>{m.rank}</span>
              <Avatar name={m.n} idx={m.rank} size={40} ring={m.me ? 2 : 0} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="between"><span style={{ fontWeight: 700, fontSize: 14.5 }}>{m.name}</span><span className="tnum" style={{ fontWeight: 700, fontSize: 14, color: m.over ? 'var(--warn-ink)' : 'var(--ink)' }}>{m.m} 分</span></div>
                <div className="row" style={{ gap: 8, marginTop: 6 }}>
                  <div style={{ flex: 1 }}><Bar pct={m.m / m.cap * 100} state={m.over ? 'over' : 'good'} /></div>
                  {m.over ? <Chip kind="warn">超 {m.over} 分</Chip> : <Chip kind="good">達標</Chip>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* penalty applied */}
        <div className="card" style={{ marginTop: 14, background: 'var(--warn-soft)', boxShadow: 'none' }}>
          <div className="row" style={{ gap: 10 }}>
            <Avatar name="晴" idx={5} size={40} />
            <div style={{ flex: 1 }}>
              <div className="row" style={{ gap: 7 }}><span style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--warn-ink)' }}>晴晴</span><Chip kind="warn" dot>超標 14 分</Chip></div>
              <div style={{ fontSize: 12.5, color: 'var(--warn-ink)', marginTop: 5, lineHeight: 1.5 }}>套用懲罰：這期請室友喝一杯飲料 🧋</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn ghost block sm"><Icon name="trophy" size={17} />看排行</button>
          <button className="btn primary block sm"><Icon name="send" size={17} />到聊天室公告</button>
        </div>
      </div>
      <HomeBar />
    </div>
  );
}

// ─────────── ⑪ 設定 / LINE 綁定 ───────────
function SettingsLine() {
  const Row = ({ ic, t, v, last }) => (
    <div className="between" style={{ padding: '13px 0', borderTop: last ? '1px solid var(--line-2)' : 'none' }}>
      <span className="row" style={{ gap: 12, fontSize: 14.5 }}><span style={{ color: 'var(--ink-2)' }}><Icon name={ic} size={20} /></span>{t}</span>
      <span className="row" style={{ gap: 6, color: 'var(--ink-3)', fontSize: 13 }}>{v}<Icon name="chevR" size={16} /></span>
    </div>
  );
  return (
    <div className="phone" style={{ height: 900 }}>
      <StatusBar />
      <PageHeader title="設定" />
      <div className="wrap scroll-body">
        {/* profile */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
          <Avatar name="宥" idx={2} size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>宥宥</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>yuyu@gmail.com</div>
          </div>
          <button className="btn ghost sm" style={{ padding: '8px 14px' }}>編輯</button>
        </div>

        {/* LINE binding — highlighted */}
        <div className="sectlabel">LINE 綁定</div>
        <div className="card" style={{ border: '1.5px solid var(--accent)', boxShadow: 'none' }}>
          <div className="between">
            <div className="row" style={{ gap: 11 }}>
              <span className="center" style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--good-soft)', color: 'var(--good-ink)' }}><Icon name="send" size={21} /></span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>綁定 LINE 接收推播</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>回報提醒、結算結果即時通知</div>
              </div>
            </div>
            <Chip kind="neutral">未綁定</Chip>
          </div>
          <div style={{ margin: '14px 0', padding: '14px', borderRadius: 12, background: 'var(--card)', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 6 }}>你的綁定碼</div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 500, letterSpacing: 4, color: 'var(--ink)' }}>SP-7F4K</div>
          </div>
          <ol style={{ margin: 0, padding: '0 0 4px 0', listStyle: 'none', counterReset: 'st' }}>
            {['加入 ScreenPact LINE 官方帳號', '傳送上方綁定碼給 bot', '收到「綁定成功」即完成'].map((s, i) => (
              <li key={i} className="row" style={{ gap: 10, fontSize: 13, color: 'var(--ink-2)', padding: '5px 0' }}>
                <span className="center" style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-ink)', fontSize: 11, fontWeight: 700, flex: '0 0 auto' }}>{i + 1}</span>{s}
              </li>
            ))}
          </ol>
          <button className="btn primary" style={{ marginTop: 8 }}><Icon name="link" size={18} />加入 LINE 好友並綁定</button>
        </div>

        <div className="sectlabel">一般</div>
        <div className="card" style={{ padding: '4px 16px' }}>
          <Row ic="bell" t="通知設定" v="開啟" />
          <Row ic="lock" t="隱私與資料" v="" last />
          <Row ic="info" t="關於 ScreenPact" v="v1.0" last />
        </div>
        <button className="btn outline" style={{ marginTop: 16, color: 'var(--warn-ink)', borderColor: 'var(--warn-soft)' }}>登出</button>
      </div>
      <HomeBar />
    </div>
  );
}

// ─────────── ⑫ 通知中心 ───────────
function Notifications() {
  const groups = [
    {
      label: '今天', items: [
        { ic: 'clock', tone: 'warn', t: '今天還沒回報', d: '距「沉澱小隊」截止剩 4 小時', time: '18:02', unread: true },
        { ic: 'trophy', tone: 'good', t: '本期結算完成', d: '沉澱小隊 · 你排第 3，達標 👍', time: '09:00', unread: true },
        { ic: 'alert', tone: 'warn', t: '晴晴 超標了', d: '下班不滑挑戰 · 超出 14 分', time: '08:30' },
      ],
    },
    {
      label: '本週', items: [
        { ic: 'chart', tone: 'accent', t: '有新提案要投票', d: '「短影音上限改 30 分」剩 1 天', time: '週四', unread: false },
        { ic: 'settings', tone: 'neutral', t: '追蹤清單已更新', d: '房主新增「短影音 B」', time: '週三' },
        { ic: 'room', tone: 'neutral', t: '安安 加入了房間', d: '沉澱小隊 現有 5 人', time: '週一' },
      ],
    },
  ];
  const toneBg = { warn: 'var(--warn-soft)', good: 'var(--good-soft)', accent: 'var(--accent-soft)', neutral: 'var(--sand)' };
  const toneFg = { warn: 'var(--warn-ink)', good: 'var(--good-ink)', accent: 'var(--accent-ink)', neutral: 'var(--ink-2)' };
  return (
    <div className="phone" style={{ height: 912 }}>
      <StatusBar />
      <div className="appbar">
        <div><h1>通知</h1></div>
        <button className="btn ghost sm" style={{ padding: '8px 14px' }}>全部已讀</button>
      </div>
      <div className="wrap scroll-body">
        {groups.map((g, gi) => (
          <div key={gi}>
            <div className="sectlabel" style={{ marginTop: gi ? 18 : 4 }}>{g.label}</div>
            <div className="card" style={{ padding: '4px 16px' }}>
              {g.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 0', borderTop: i ? '1px solid var(--line-2)' : 'none' }}>
                  <span className="center" style={{ width: 38, height: 38, borderRadius: 12, background: toneBg[it.tone], color: toneFg[it.tone], flex: '0 0 auto' }}><Icon name={it.ic} size={19} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="between"><span style={{ fontWeight: 700, fontSize: 14.5 }}>{it.t}</span><span style={{ fontSize: 11.5, color: 'var(--ink-3)', whiteSpace: 'nowrap', paddingLeft: 8 }}>{it.time}</span></div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.45 }}>{it.d}</div>
                  </div>
                  {it.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flex: '0 0 auto', marginTop: 6 }} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <TabBar active="bell" />
    </div>
  );
}

Object.assign(window, { TrackingSettings, RulesVote, RoomChatFull, Settlement, SettingsLine, Notifications });
