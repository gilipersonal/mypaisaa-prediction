/* Cost: the month against the £100 ceiling. Cost is visible from home (MP-100, MP-142), opens to the month, and says what
   each threshold does (MP-103), what is held (MP-90), how old each figure is (MP-89) and whether the month fits (MP-112).
   The ceiling, plan, thresholds, allocations and planned months are the owner's recorded figures; the month to date is
   an illustrative month, day 18 of 30. The state slots carry what is real here: billing that is late (stale), a collector
   that failed (error), Claude off (no model), an estimate and a bill that differ (disagreement), an amount MP will not
   state (abstaining). */
{
  const C = { data: '--mark-us', aws: '--mark-uk', claude: '--seg-ustech', held: '--ink-2' };
  const chipOf = ([kind, text, icon]) => `<span class="chip ${kind}" data-mo="chip">${icon ? ic(icon, 's14') : '<span class="dot"></span>'}${text}</span>`;
  const proposed = q => chipOf(['proposed', `Proposed · ${q}`]);
  const box = (inner, cls = '') => `<div class="card fcard cost-box${cls ? ' ' + cls : ''}" data-mo="card">${inner}</div>`;
  const head = (t, right = '') => `<div class="cost-head"><h3>${t}</h3>${right}</div>`;
  const wide = ctx => ctx.kind === 'web' || ctx.kind === 'ipad';
  /* A late bill is not a late price, so a screen with no price on it keeps the price chips as they are. Home shows prices, so it
     takes the state as it stands and keeps its value and rows true to it. */
  const browser = ctx => ctx.kind === 'web' || ctx.kind === 'pwa';
  const offNote = ctx => (ctx.state === 'offline' && browser(ctx) ? `<div class="cost-chips" data-mo="rise">${chipOf(['offline', 'Saved in this browser', 'wifi-off'])}${proposed('MP40-Q12')}</div>` : '');
  const homePage = (ctx, spec) => frame(ctx, { ...spec, body: offNote(ctx) + spec.body });
  const page = (ctx, spec) => homePage(ctx, { fresh: 'default', ...spec });
  const li = (icon, t, s, e = '', o = {}) => `<div class="cost-li${icon ? '' : ' plain'}${o.cls ? ' ' + o.cls : ''}" data-mo="rise">${icon ? `<span class="cost-ic">${ic(icon, 's18')}</span>` : ''}<div style="min-width:0"><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ''}</div><div class="e">${e}</div></div>`;
  const list = rows => `<div class="cost-list">${rows.join('')}</div>`;
  const sk = (w, h = 14) => `<span class="sk" style="height:${h}px;width:${w}"></span>`;
  const skCard = (t, n = 3) => box(`${head(t, chipOf(['fresh', 'Last good 21:15']))}<div style="display:grid;gap:10px">${Array.from({ length: n }, (_, i) => sk(`${92 - i * 12}%`)).join('')}</div>`);

  /* ---------- the month, in every state ---------- */
  const BARS = [[C.data, 27.84], [C.aws, 11.18], [C.claude, 7.06], [C.held, 0.34]];
  const KEYS = [[C.data, 'Market data', '£27.84'], [C.aws, 'AWS', '£11.18'], [C.claude, 'Claude', '£7.06'], [C.held, 'Reserved', '£0.34']];
  const BASE = { so: '46.42', word: 'committed so far', fc: 'up to £59.73', to: 59.73, bars: BARS, keys: KEYS, day: 18 };
  const MONTH = {
    default: { ...BASE, st: ['fresh', 'On plan'], say: 'Forecast up to £59.73. That is 27p under the £60 warning, before about £0.15 of transfer and other lines not yet modelled.' },
    loading: { ...BASE, st: ['fresh', 'Refreshing · last good 21:15'], say: 'Showing the last good figures, from 21:15.' },
    empty: { ...BASE, so: '27.84', day: 1, fc: 'up to £59.73, the plan', bars: [BARS[0]], keys: [KEYS[0]], st: ['', 'New month', 'clock'], say: 'Only the data invoice so far. AWS arrives tomorrow, Claude within six hours.' },
    error: { ...BASE, so: '37.69', word: 'last reconciled', fc: 'up to £59.73, estimated only', last: 16, unk: 6.71, bars: [BARS[0], [C.aws, 9.85]], keys: [KEYS[0], [C.aws, 'AWS', '£9.85'], [C.held, 'Claude, not reconciled', '£6.71']], st: ['stale', 'Stale · 39 h old', 'clock'], st2: ['error', 'Collector failed', 'alert'], say: 'The AWS collector failed at 06:10 and retries at the next window. Figures stop at 16 Nov. With Claude usage to 18:00, the month is at least £44.40.' },
    stale: { ...BASE, st: ['stale', 'Billing 39 h old', 'clock'], say: 'AWS has sent no new bill for 39 hours. Past 36, optional work waits until it is reconciled.', q: 'MP40-Q6' },
    offline: { ...BASE, st: ['offline', 'Offline · from 21:15', 'wifi-off'], say: 'Nothing updates until you reconnect.' },
    noModel: { ...BASE, so: '39.02', fc: '£46.48', to: 46.48, bars: [BARS[0], BARS[1]], keys: [KEYS[0], KEYS[1], [C.claude, 'Claude', 'off']], st: ['', 'Claude off', 'ban'], say: 'No verified credit and no paid approval, so every Claude call is refused.' },
    disagreement: { ...BASE, so: '46.73', word: 'with the bill', fc: 'up to £60.04', to: 60.04, bars: [BARS[0], [C.aws, 11.49], BARS[2], BARS[3]], keys: [KEYS[0], [C.aws, 'AWS', '£11.49'], KEYS[2], KEYS[3]], st: ['stale', 'Estimate and bill differ', 'split'], say: '17 Nov: estimate £0.71, bill £1.02. The bill counts, which takes the forecast past £60.' },
    abstention: { ...BASE, so: '39.36', word: 'known so far', fc: 'Not shown', to: 0, unk: 15, bars: [BARS[0], BARS[1], BARS[3]], keys: [KEYS[0], KEYS[1], KEYS[3], [C.held, 'Claude', 'unknown']], st: ['', 'Claude unknown', 'ban'], say: 'Claude usage is not collected, so it stays unknown, never £0. Its £15 allocation is held.', q: 'MP40-Q5' }
  };
  const month = ctx => MONTH[ctx.state] || MONTH.default;

  function lad(m, o = {}) {
    let x = 0;
    const fills = (o.mono ? [['--ink', m.bars.reduce((a, b) => a + b[1], 0)]] : m.bars).map(([c, v], i) => { const s = `<i data-mo="barx" style="--c:var(${c});left:${x.toFixed(2)}%;width:${v.toFixed(2)}%;--i:${i}"></i>`; x += v; return s; }).join('');
    const fc = m.to > x ? `<i class="fc" data-mo="barx" style="left:${x.toFixed(2)}%;width:${(m.to - x).toFixed(2)}%;--i:${m.bars.length}"></i>` : '';
    const unk = m.unk ? `<i class="unk" style="left:${x.toFixed(2)}%;width:${m.unk}%"></i>` : '';
    const marks = [[60, '£60'], [75, '£75'], [85, '£85'], [100, '£100']];
    return `<div class="cost-lad" ${o.mono ? 'aria-hidden="true"' : `role="img" aria-label="${m.so} pounds ${m.word} on a scale to the £100 ceiling. Forecast ${m.fc}. Warn at £60, reduce at £75, pause at £85. Illustrative."`}>
      <div class="cost-track"><i class="res"></i>${fills}${fc}${unk}</div>
      ${marks.map(([v, t]) => `<b class="cost-tick" style="left:${v === 100 ? 99.6 : v}%"></b><span class="cost-lbl${v === 100 ? ' end' : ''}" style="left:${v}%">${t}</span>`).join('')}
      <span class="cost-lbl start">${o.start || '£0'}</span></div>`;
  }
  const keyOf = m => `<div class="allocl" style="margin-top:0">${m.keys.map(([c, t, v]) => `<span style="--c:var(${c})">${t} <b>${v}</b></span>`).join('')}${m.to ? `<span style="--c:var(--fc-80)">Forecast</span>` : ''}<span style="--c:var(--hairline-2)">Reserve from £70</span></div>`;
  const statusOf = m => `<div class="cost-status">${chipOf(m.st)}${m.st2 ? chipOf(m.st2) : ''}${m.q ? proposed(m.q) : ''}<p class="small muted">${m.say}</p></div>`;
  const askOf = m => (m.q ? `<div class="cost-chips">${proposed(m.q)}</div>` : '');
  const dayOf = m => `November · day ${m.day} of 30`;
  const lastGood = 'Last good: £46.42 committed, forecast up to £59.73. This view reads saved figures, so refreshing never calls billing.';

  /* the compact meter, pinned above the dock on a phone so holdings stay first: the figure, one scale in one colour, the forecast */
  function strip(ctx) {
    const m = month(ctx);
    if (ctx.state === 'loading') return `<div class="card cost-strip cost-box" data-mo="card" role="button" tabindex="0" aria-label="Cost this month, refreshing. Last good: £46.42 committed so far. Opens the month."><div class="cost-row">${sk('112px', 22)}${chipOf(['fresh', 'Last good 21:15'])}</div>${sk('100%', 12)}<div class="small muted">Last good: £46.42 committed so far</div></div>`;
    return `<div class="card cost-strip cost-box" data-mo="card" role="button" tabindex="0" aria-label="Cost this month: £${m.so} ${m.word}. ${m.st[1]}. Forecast ${m.fc}. Opens the month.">
      <div class="cost-row"><div class="cost-fig">${money(m.so, 22)}<span class="small muted">${m.word}</span></div>${chipOf(m.st)}</div>
      ${lad(m, { mono: true })}
      <div class="cost-row"><span class="small muted">Forecast ${m.fc}</span>${ic('chev-r', 's16')}</div></div>`;
  }
  function hero(ctx) {
    const m = month(ctx);
    if (ctx.state === 'loading') return box(`<div class="cost-row"><span class="label">${dayOf(m)}</span>${illus()}</div>${sk('180px', 40)}${sk('100%', 12)}${sk('70%')}<div class="cost-status">${chipOf(m.st)}<p class="small muted">${lastGood}</p></div>`);
    return box(`<div class="cost-row"><span class="label">${dayOf(m)}</span>${illus()}</div>
      <div class="cost-fig">${money(m.so, 40)}<span class="small muted">${m.word}</span></div>
      <div class="cost-row"><span class="small muted">Forecast for the month</span><b>${m.fc}</b></div>
      ${lad(m)}${keyOf(m)}${statusOf(m)}`);
  }

  /* ---------- parts of the month ---------- */
  const part = (c, l, n, who, sub, val, of, so, fcv) => `<div class="hrow" data-mo="rise">${logo(c, l)}
    <div style="min-width:0"><div class="nm cost-wrap">${n}</div><div class="tk cost-wrap">${who}</div></div>
    <div class="vv"><div class="val">${val}</div><div class="small muted" style="text-align:right">of £${of}</div></div>
    <div class="fl"><span class="cost-mini" role="img" aria-label="${val} so far, forecast ${fcv}, allocation £${of}">${so >= 0 ? `<i class="fc" style="width:${Math.min(100, (parseFloat(fcv.replace('£', '')) / of) * 100).toFixed(1)}%"></i><i data-mo="barx" style="--c:var(${c});width:${Math.min(100, (so / of) * 100).toFixed(1)}%"></i>` : '<i class="unk" style="width:100%"></i>'}</span><span class="cost-mini-t">${so >= 0 ? `Forecast ${fcv}` : 'Forecast unknown'}</span></div><div class="fl"><span class="small muted cost-wrap">${sub}</span></div></div>`;
  function parts(ctx) {
    const s = ctx.state;
    if (s === 'loading') return skel(3);
    const aws = {
      empty: ['First collection tomorrow', '£0.00', 0], error: ['Last reconciled 16 Nov · collector failed 06:10', '£9.85', 9.85],
      stale: ['Last bill 39 hours ago · estimate since then', '£11.18', 11.18], disagreement: ['Bill £1.02, estimate £0.71 on 17 Nov', '£11.49', 11.49, '£18.95'],
      offline: ['From 21:15 · Dev £2.96 · Prod £7.80 · Shared £0.42', '£11.18', 11.18]
    }[s] || ['Dev £2.96 · Prod £7.80 · Shared £0.42', '£11.18', 11.18];
    const cl = {
      empty: ['First usage report within six hours', '£0.00', 0, '£13.24'], error: ['Usage to 18:00 · top-5 scan £2.12 of £5', '£6.71', 6.71, '£13.24'],
      noModel: ['Off · nothing is spent · no calls run', '£0.00', 0, '£0.00'], abstention: ['Unknown · never counted as £0', 'Unknown', -1, '£15'],
      offline: ['From 18:00 · Dev £1.20 · Prod £5.46 · Local £0.40', '£7.06', 7.06, '£13.24']
    }[s] || ['Dev £1.20 · Prod £5.46 · Local £0.40', '£7.06', 7.06, '£13.24'];
    const foot = s === 'noModel' ? 'Claude off: the month forecast is £46.48. Forecasts and figures run as usual, because Claude only explains.' : 'Plan £70: these three plus £3 for forecast and price uncertainty. Reserve £30, untouched. Allocations are limits, not separate pots.';
    return `<div class="card" data-mo="card" style="min-width:0">${part(C.data, 'D', 'Market data', 'Twelve Data Grow 55', s === 'offline' ? 'From 21:15 · Prod £27.84 · Dev £0.00' : 'Prod £27.84 · Dev £0.00', '£27.84', 30, 27.84, '£27.84')}${part(C.aws, 'A', 'AWS', 'Dev and prod accounts', aws[0], aws[1], 22, aws[2], aws[3] || '£18.64')}${part(C.claude, 'C', 'Claude and evaluations', 'Anthropic', cl[0], cl[1], 15, cl[2], cl[3])}<div class="t5foot">${foot}</div></div>`;
  }

  /* ---------- the scan cap, and Claude on and off ---------- */
  function scan(ctx) {
    const s = ctx.state;
    if (s === 'loading') return skCard('Top-5 scan', 2);
    const v = { empty: 0, noModel: 0 }[s] ?? 2.12;
    const txt = s === 'noModel' ? 'Off with Claude. Rankings still update, because they come from code. Explanations wait.' : s === 'abstention' ? 'Unknown until Claude usage is collected. The cap still refuses work that could cross it.' : s === 'offline' ? 'From 18:00. The cap holds on the server, not on this device.' : 'A batch that could cross £5 is refused. Rankings still update, because they come from code. Only the explanations stop.';
    const val = s === 'abstention' ? 'Unknown' : `£${v.toFixed(2)}`;
    return box(`${head('Top-5 scan', `<span class="small muted">${val} of the £5 cap</span>`)}<div class="cost-row"><span class="cost-mini" role="img" aria-label="${val} of the £5 scan cap">${s === 'abstention' ? '<i class="unk" style="width:100%"></i>' : `<i data-mo="barx" style="--c:var(${C.claude});width:${(v / 5) * 100}%"></i>`}</span></div><p class="small muted">${txt}</p>`);
  }
  function claudeCard(ctx) {
    const s = ctx.state, off = s === 'noModel';
    const foot = off ? 'Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in.'
      : s === 'abstention' ? 'Credit is unknown. A reported credit is not proof, so admissible credit stays at zero.'
        : 'Claude on means you approved paid use or credit is verified. Admissible credit is zero until a bill proves it.';
    return box(`${head('Claude', chipOf(off ? ['', 'Off', 'ban'] : ['fresh', 'On']))}<div class="cost-two">
      <div class="${off ? '' : 'on'}"><span class="t">On</span><b>£54.73</b><p>A month, up to £59.73 with the scan at its cap. Chat, research and explanations run.</p></div>
      <div class="${off ? 'on' : ''}"><span class="t">Off</span><b>£46.48</b><p>A month. No Claude calls. Chat and research show as unavailable, with the reason.</p></div></div><p class="small muted">${foot}</p>`);
  }

  /* ---------- the thresholds ---------- */
  const RUNGS = [
    ['£60', 'Warn', 'A notice reaches you. Nothing stops.'],
    ['£75', 'Reduce', 'Fewer optional backfills, challenger models and Claude jobs.'],
    ['£85', 'Pause', 'New optional paid work pauses, and each pause shows its reason.'],
    ['£100', 'Ceiling', 'The limit of the month. It is not an instant AWS shut-off: hard caps on requests, concurrency, timeouts and retention back it.']
  ];
  const firstOf = s => ({ default: '27p away', stale: '27p away', offline: '27p away', loading: 'Last good: 27p away', empty: 'Plan: 27p away', noModel: '£13.52 away', error: 'Estimated: 27p away', disagreement: 'Reached' }[s] || 'Not known');
  const rungHead = (v, t, status, reached) => `<span class="v">${v}</span><span class="t">${t}</span><span class="chip ${reached ? 'stale' : 'illus'}">${status}</span>`;
  function rungs(ctx) {
    const first = firstOf(ctx.state), rest = first === 'Not known' ? 'Not known' : 'Not reached';
    return RUNGS.map(([v, t, p], i) => `<div class="cost-rung" data-mo="rise">${rungHead(v, t, i === 0 ? first : rest, i === 0 && first === 'Reached')}<p>${p}</p></div>`).join('');
  }
  /* Limits holds what The lines holds: the state's own sentence and how far the first line is, in every state */
  function whereYouAre(ctx) {
    const m = month(ctx), load = ctx.state === 'loading', first = firstOf(ctx.state), [v, t] = RUNGS[0];
    return box(`${head('Where you are', chipOf(m.st))}${load ? sk('100%', 12) : lad(m)}<div class="cost-rung" data-mo="rise">${rungHead(v, t, first, first === 'Reached')}</div><p class="small muted">${load ? lastGood : m.say}</p>${askOf(m)}`);
  }
  const miniRungs = () => RUNGS.slice(0, 3).map(([v, t, p]) => `<div class="cost-rung mini" data-mo="rise"><span class="v">${v}</span><span class="t">${t}</span><p>${p}</p></div>`).join('');
  const always = () => box(`${head('Never paused')}<div class="cost-chips">${['Sign-in', 'Ledger reads', 'Audit', 'Recovery'].map(t => chipOf(['fresh', t])).join('')}</div><p class="small muted">These stay available at every threshold. A £15 window is kept for them.</p><div class="cost-chips">${proposed('MP40-Q6')}</div>`);

  /* ---------- where the figures come from ---------- */
  const LANES = {
    default: [['Reconciled billing', 'Daily · AWS to 17 Nov', 'Age 15 h', 'fresh'], ['Anthropic usage', 'Every six hours · to 18:00', 'Age 3 h', 'fresh'], ['Internal estimates', 'Live · to 21:15', 'Now', 'fresh']],
    error: [['Reconciled billing', 'Failed 06:10 · AWS to 16 Nov · retries next window', 'Age 39 h', 'error'], ['Anthropic usage', 'Every six hours · to 18:00', 'Age 3 h', 'fresh'], ['Internal estimates', 'Live · to 21:15', 'Now', 'fresh']],
    stale: [['Reconciled billing', 'Daily · AWS to 16 Nov · no new bill', 'Age 39 h', 'stale'], ['Anthropic usage', 'Every six hours · to 18:00', 'Age 3 h', 'fresh'], ['Internal estimates', 'Live · to 21:15', 'Now', 'fresh']],
    offline: [['Reconciled billing', 'Saved · AWS to 17 Nov', 'Age 15 h', 'offline'], ['Anthropic usage', 'Saved · to 18:00', 'Age 3 h', 'offline'], ['Internal estimates', 'Saved · to 21:15', 'Offline', 'offline']],
    noModel: [['Reconciled billing', 'Daily · AWS to 17 Nov', 'Age 15 h', 'fresh'], ['Anthropic usage', 'Claude is off, so there is nothing to collect', 'Off', ''], ['Internal estimates', 'Live · to 21:15', 'Now', 'fresh']],
    empty: [['Reconciled billing', 'First run tomorrow, 06:10', 'None yet', ''], ['Anthropic usage', 'First report within six hours', 'None yet', ''], ['Internal estimates', 'Live · nothing to estimate yet', 'Now', 'fresh']],
    abstention: [['Reconciled billing', 'Daily · AWS to 17 Nov', 'Age 15 h', 'fresh'], ['Anthropic usage', 'Unavailable until an admin key is adopted', 'Unknown', ''], ['Internal estimates', 'Live · AWS only', 'Now', 'fresh']]
  };
  const laneRows = ctx => list((LANES[ctx.state] || LANES.default).map(([t, s, age, kind]) => li('', t, s, `<span class="chip ${kind}">${kind === 'fresh' ? '<span class="dot"></span>' : kind === 'stale' ? ic('clock', 's14') : kind === 'error' ? ic('alert', 's14') : kind === 'offline' ? ic('wifi-off', 's14') : ic('ban', 's14')}${age}</span>`)).concat(li('', 'Billing pages', 'Monthly cap of 120. Past it, a collection waits and shows as partial', ctx.state === 'empty' ? '0 of 120' : '54 of 120')));
  function sourcesCard(ctx) {
    if (ctx.state === 'loading') return skCard('How old each figure is');
    return box(`${head('How old each figure is')}${laneRows(ctx)}<p class="small muted">The view reads saved figures, so opening it never calls billing.</p><div class="cost-chips">${proposed('MP40-Q5: Anthropic admin key')}</div>`);
  }
  function committedCard(ctx, o = {}) {
    const s = ctx.state;
    if (s === 'loading') return skCard('What committed adds up to', 4);
    const usual = [['Settled', 'Bills paid or reconciled', '£38.40'], ['Not yet reconciled', 'Usage £6.71, estimates £0.97', '£7.68'], ['Future fixed', 'Nothing more due this month', '£0.00'], ['Open reservations', 'Held at worst case', '£0.34'], '£46.42'];
    const d = {
      empty: [['Settled', 'Nothing reconciled yet', '£0.00'], ['Not yet reconciled', 'Nothing collected yet', '£0.00'], ['Future fixed', 'Twelve Data, due now', '£27.84'], ['Open reservations', 'None', '£0.00'], '£27.84'],
      error: [['Settled', 'Reconciled to 16 Nov', '£37.69'], ['Not yet reconciled', 'Claude usage to 18:00', '£6.71'], ['Future fixed', 'Nothing more due this month', '£0.00'], ['Since 16 Nov', 'AWS not collected', 'Not shown'], 'At least £44.40'],
      noModel: [['Settled', 'Bills paid or reconciled', '£38.40'], ['Not yet reconciled', 'AWS estimates only', '£0.62'], ['Future fixed', 'Nothing more due this month', '£0.00'], ['Open reservations', 'None. Claude is off', '£0.00'], '£39.02'],
      disagreement: [['Settled', 'With the 17 Nov bill', '£38.71'], ['Not yet reconciled', 'Usage £6.71, estimates £0.97', '£7.68'], ['Future fixed', 'Nothing more due this month', '£0.00'], ['Open reservations', 'Held at worst case', '£0.34'], '£46.73'],
      abstention: [['Settled', 'Bills paid or reconciled', '£38.40'], ['Not yet reconciled', 'AWS estimates only', '£0.62'], ['Claude usage', 'Not collected', 'Unknown'], ['Open reservations', 'Held at worst case', '£0.34'], 'At least £39.36']
    }[s] || usual;
    return box(`${head('What committed adds up to', illus())}${list(d.slice(0, 4).map(x => li('', x[0], x[1], x[2])).concat(li('', 'Committed', '', d[4], { cls: 'cost-sum' })))}${o.forecast ? `<div class="cost-row"><span class="small muted">Forecast for the month</span><b>${month(ctx).fc}</b></div>` : ''}`);
  }
  function creditCard(ctx) {
    if (ctx.state === 'loading') return skCard('Gross, credit and cash');
    const s = ctx.state, gross = { noModel: '£0.00', empty: '£0.00', abstention: 'Unknown', error: '£6.71' }[s] || '£7.06';
    return box(`${head('Gross, credit and cash')}${list([li('', 'Claude gross usage', s === 'error' ? 'What the calls cost, to 18:00' : 'What the calls cost', gross), li('', 'Credit applied', 'A shared credit is reported, not proven', 'Unknown'), li('', 'Cash', 'Counted in full until a bill proves credit', ['£0.00', 'Unknown'].includes(gross) ? gross : `Up to ${gross}`)])}<p class="small muted">Credit counts only with proof under 30 minutes old. A usage report is never that proof.</p><div class="cost-chips">${proposed('MP40-Q6')}</div>`);
  }
  function drill(ctx) {
    if (ctx.state === 'loading') return skCard('Claude by feature', 4);
    const on = ['By provider', 'By agent', 'By model', 'By feature', 'By service'];
    const none = ctx.state === 'noModel' ? 'Claude is off, so no feature is spending.' : ctx.state === 'abstention' ? 'Features show once Claude usage is collected. Nothing is estimated in its place.' : ctx.state === 'empty' ? 'Nothing spent yet this month.' : '';
    return box(`${head('Claude by feature', illus())}<div class="cost-chips">${on.map((t, i) => `<button type="button" class="chip ${i === 3 ? 'owner' : ''} cost-pick"${i === 3 ? ' aria-pressed="true"' : ' aria-pressed="false"'}>${t}</button>`).join('')}</div>${none ? `<p class="small muted">${none}</p>` : list([['Top-5 explanations', '£2.12'], ['Chat and research', ctx.state === 'error' ? '£1.29' : '£1.64'], ['Event analysis', '£1.18'], ['Evaluations', '£1.12'], ['Morning brief', '£1.00']].map(([t, v]) => li('', t, '', v)))}`);
  }
  function holds(ctx) {
    if (ctx.state === 'loading') return skCard('Held before work starts', 3);
    const rows = ctx.state === 'noModel' ? [li('ban', 'Top-5 batch', 'Refused: no verified credit', 'Refused')] : ctx.state === 'empty' ? [] : [
      li('clock', 'Nightly explanations', 'Reserved at its worst case', '£0.34'),
      li('check', 'Event analysis, 17 Nov', 'Settled. The bill replaced the hold', '£0.22'),
      li('ban', 'Top-5 batch, 14 Nov', 'Refused: £3.20 could cross the £5 cap', 'Refused')
    ];
    return box(`${head('Held before work starts')}${rows.length ? list(rows) : '<p class="small muted">Nothing reserved yet this month.</p>'}<p class="small muted">Paid work reserves its worst case first. A batch that times out keeps its hold until reconciled and is never sent twice.</p>`);
  }

  /* ---------- a line reached: warned, reduced or paused. Every degraded mode shows here with its reason and how it ends ---------- */
  const OVERS = {
    warn: { line: '£60', noun: 'warning', head: 'What changes', day: 20, when: '20 Nov at 06:14', so: '51.06', fc: 61.20, aws: 14.60, cl: 8.28, off: [23.22, 60.90], bill: 59.80, st: ['stale', 'Warned at £60', 'alert'], does: 'Nothing stops.', back: 'so the warning clears at the next check.', none: 'No warning this month', noneSay: 'The forecast is under £60. A notice reaches you the moment it passes, and this page then says how far the next line is.' },
    reduce: { line: '£75', noun: 'reduction', head: 'Reduced', day: 23, when: '23 Nov at 06:14', so: '64.86', fc: 76.10, aws: 24.10, cl: 12.58, off: [36.90, 75.70], bill: 74.30, st: ['stale', 'Reduced at £75', 'trim'], does: 'Fewer optional jobs run.', back: 'so optional work is back in full at the next check.', none: 'Nothing is reduced this month', noneSay: 'Every optional job runs in full. A reduction would show here with its reason, the moment one starts.' },
    pause: { line: '£85', noun: 'pause', head: 'Paused', day: 24, when: '24 Nov at 06:14', so: '71.20', fc: 86.40, aws: 28.40, cl: 14.62, off: [43.02, 85.90], bill: 84.10, st: ['error', 'Paused at £85', 'pause'], does: 'New optional paid work waits.', back: 'so optional work is admitted at the next check.', none: 'Nothing is paused this month', noneSay: 'Every optional job is admitted. A pause would show here with its reason, the moment one starts.' }
  };
  const gbp = v => `£${v.toFixed(2)}`;
  function overOf(ctx, k) {
    const L = OVERS[k], s = ctx.state, off = s === 'noModel', aws = off ? L.off[0] : L.aws, fc = off ? L.off[1] : L.fc;
    const bars = off ? [BARS[0], [C.aws, aws]] : [BARS[0], [C.aws, aws], [C.claude, L.cl], BARS[3]];
    const keys = off ? [KEYS[0], [C.aws, 'AWS', gbp(aws)], [C.claude, 'Claude', 'off']] : [KEYS[0], [C.aws, 'AWS', gbp(aws)], [C.claude, 'Claude', gbp(L.cl)], KEYS[3]];
    const m = { so: off ? (27.84 + aws).toFixed(2) : L.so, word: 'committed so far', fc: gbp(fc), to: fc, lo: fc - 6, hi: fc + 6, day: L.day, bars, keys, st: L.st, say: `Forecast ${gbp(fc)} passed ${L.line} on ${L.when}. ${L.does}` };
    if (s === 'stale') { m.st = ['stale', `${L.st[1].split(' ')[0]} · billing 39 h old`, 'clock']; m.say = `The ${L.noun} holds until AWS billing is reconciled, then the next check decides.`; m.q = 'MP40-Q6'; }
    if (s === 'error') m.word = 'last good';
    if (s === 'offline') { m.st = ['offline', 'Offline · from 21:15', 'wifi-off']; m.say = `Saved at 21:15. The ${L.noun} may have changed since then.`; }
    if (off) m.say = `Forecast ${gbp(fc)} passed ${L.line} on ${L.when}. Claude was already off, so all of this is market data and AWS.`;
    if (s === 'disagreement') { m.st = ['stale', 'Estimate and bill differ', 'split']; m.fc = `${gbp(L.bill)} on the bill`; m.to = L.bill; m.lo = L.bill - 6; m.hi = L.bill + 6; m.say = `Estimate ${gbp(fc)}, bill ${gbp(L.bill)}. The bill counts, ${L.back}`; }
    if (s === 'abstention') { m.st = ['', 'Forecast unknown', 'ban']; m.word = 'known so far'; m.fc = 'Not shown'; m.to = 0; m.unk = 13; m.keys = [KEYS[0], [C.aws, 'AWS', gbp(aws)], [C.claude, 'Claude', `at least ${gbp(L.cl)}`], KEYS[3]]; m.say = `Claude usage stopped being collected. The ${L.noun} holds until the month is known again.`; m.q = 'MP40-Q5'; }
    return m;
  }
  function overTop(ctx, k, o = {}) {
    const L = OVERS[k], s = ctx.state, draw = o.draw || (m => lad(m) + keyOf(m));
    if (s === 'empty') return stateCard('check', L.none, L.noneSay, btn(o.to || 'See the thresholds', 'tinted'), chipOf(['fresh', 'Committed £27.84']));
    const m = overOf(ctx, k), top = `<div class="cost-row"><span class="label">${dayOf(m)}</span>${illus()}</div>`;
    if (s === 'loading') return box(`${top}${sk('180px', 40)}${sk('100%', 12)}${sk('70%')}<div class="cost-status">${chipOf(['fresh', 'Refreshing · last good 21:15'])}<p class="small muted">Last good: £${m.so} committed, forecast ${m.fc}. This view reads saved figures, so refreshing never calls billing.</p></div>`);
    return box(`${top}<div class="cost-fig">${money(m.so, 40)}<span class="small muted">${m.word}</span></div><div class="cost-row"><span class="small muted">Forecast for the month</span><b>${m.fc}</b></div>${draw(m)}${statusOf(m)}`);
  }
  function overList(ctx, k) {
    const L = OVERS[k], s = ctx.state, off = s === 'noModel';
    if (s === 'loading') return skCard(L.head, 3);
    if (s === 'error') return stateCard('alert', k === 'warn' ? 'This list did not load' : `The ${L.head.toLowerCase()} list did not load`, `It failed at 21:14. The ${L.noun} itself holds on the server, and sign-in, ledger reads, audit and recovery are unaffected.`, btn('Try again', 'tinted', 'refresh'));
    const tag = s === 'offline' ? chipOf(['offline', 'From 21:15', 'wifi-off']) : '';
    if (k === 'warn') {
      const m = overOf(ctx, k), left = m.to ? `£${(75 - m.to).toFixed(2)} away` : 'Not known while the forecast is unknown';
      return box(`${head(L.head, tag)}${list([li('alert', 'A notice reached you', '20 Nov at 06:14 · it stays in your inbox', 'Sent'), li('check', 'Optional work', 'All of it still runs. Nothing stops at £60', 'Running'), li('trim', 'Next line: reduce at £75', left, '')])}<p class="small muted">The warning clears at the next check once the forecast falls under £60, after reconciliation or on 1 December.</p>`);
    }
    const rows = k === 'reduce'
      ? [li('trim', 'Backfills', 'Fewer runs. Each resumes from its step', 'Reduced'), li('trim', 'Challenger models', 'Fewer runs this month', 'Reduced'), off ? li('ban', 'Claude jobs', 'Already off, so nothing to reduce', 'Off') : li('trim', 'Claude jobs', 'Fewer scans, explanations and research runs', 'Reduced')]
      : [li('pause', 'Backfills', 'Stopped at step 4 of 9. Resumes from that step', 'Paused'), li('pause', 'Challenger models', 'The next run waits', 'Paused'), off ? li('ban', 'Claude jobs', 'Already off, so nothing to pause', 'Off') : li('pause', 'Claude jobs', 'Scans, explanations and research wait', 'Paused')];
    return box(`${head(L.head, tag)}${list(rows)}<p class="small muted">It comes back at the next check once cash falls under ${L.line}, after reconciliation or on 1 December.</p>`);
  }
  const howHere = k => box(`${head('How the month got here', illus())}${list([li('alert', 'Warned at £60', '20 Nov · a notice reached you', ''), li('trim', 'Reduced at £75', '23 Nov · fewer optional jobs', ''), li('pause', 'Paused at £85', '24 Nov · a challenger run and extra build minutes took AWS past £22', '')].slice(0, Object.keys(OVERS).indexOf(k) + 1))}`);
  const stillOn = () => box(`${head('Still working')}<div class="cost-chips">${['Sign-in', 'Ledger reads', 'Audit', 'Recovery'].map(t => chipOf(['fresh', t])).join('')}</div><p class="small muted">Bills can still arrive after a pause. A threshold is not an instant AWS shut-off.</p>`);
  const overRail = (ctx, k) => (ctx.state === 'empty' ? '' : howHere(k)) + stillOn();

  /* ---------- does the month fit ---------- */
  const FIT = [
    ['Ordinary', '£46.48', '£54.73'], ['Top-5 scan at its £5 cap', '£51.48', '£59.73'], ['Adverse rates', '£50.87', '£59.89'],
    ['Apple fee month, whole', '£141.52', '£149.77'], ['Apple fee month, without the fee', '£46.48', '£54.73']
  ];
  const fitTable = () => `<div style="overflow-x:auto"><table class="ht"><thead><tr><th>A month</th><th class="r">Claude off</th><th class="r">Claude on</th></tr></thead><tbody>${FIT.map(r => `<tr data-mo="rise"><td style="white-space:normal">${r[0]}</td><td class="r">${r[1]}</td><td class="r"><b style="font-weight:600">${r[2]}</b></td></tr>`).join('')}</tbody></table></div>`;
  /* the same months as option B's log reads, one row each */
  const fitRows = () => list(FIT.map(([t, off, on]) => li('', t, `Claude off ${off}`, `Claude on ${on}`)));
  const barTo = (v, c, t) => `<div class="cost-row"><span class="cost-mini" role="img" aria-label="${t}"><i data-mo="barx" style="--c:var(${c});width:${(v / 150) * 100}%"></i></span></div>`;
  function apple(ctx) {
    if (ctx.state === 'loading') return skCard('Apple fee month', 3);
    return box(`${head('Apple fee month', chipOf(['', 'Not bought', 'ban']))}<p class="small muted">If you ever buy the Developer Program, its month is the one allowed month above £100, for this fee only.</p>
      <div class="cost-row"><span class="small">Whole month, recorded</span><b>£149.77</b></div>${barTo(149.77, '--mark-in', 'Whole month £149.77 on a scale to £150')}
      <div class="cost-row"><span class="small">Judged without the $99 fee</span><b>£54.73</b></div>${barTo(54.73, C.claude, 'Month without the fee £54.73 on a scale to £150')}
      <p class="small muted">Optional work runs while the month without the fee stays under £60, £75 and £85. The full month and its flags stay on record.</p>`);
  }
  function fitCard(ctx, months = fitTable) {
    const s = ctx.state, terms = '<p class="small muted">The fit stays conditional on the Grow 55 checkout price, listing rights and the measured workload. £59.73 is 27p under the warning, and that margin leaves out about £0.15 of data transfer, Terraform state and the scan\'s compute and storage, which are not yet in the model.</p>';
    if (s === 'loading') return skCard('Planned months', 5);
    if (s === 'empty') return stateCard('clock', 'Not measured yet', 'The full launch workload has not run on dev. These are the planned months, not measurements.', '', chipOf(['', 'Unmeasured', 'clock'])) + box(`${head('Planned months', illus())}${months()}${terms}`);
    const top = { error: banner('fall', 'The measurement failed.', 'The dev run stopped at 21:14. The planned months stay here, and nothing changes until it is re-run.', 'alert'),
      stale: banner('warn', 'Rates are old.', 'These months use the rates of 3 November. Prices or FX may have moved since.', 'clock'),
      offline: banner('', 'Offline.', 'Saved figures from 21:15.', 'wifi-off'),
      disagreement: banner('warn', 'The measurement and the plan differ.', 'Measured £62.73 against a planned £59.73: past the £60 warning. The result and your options come to you, and nothing is cut silently.', 'split'),
      abstention: banner('', 'Conditional.', 'MP will not say the month fits until checkout confirms $29 for Grow 55, with its terms and the measured workload.', 'ban') }[s] || '';
    return top + box(`${head('Planned months', illus())}${months()}<p class="small muted">Adverse rates with the scan at its cap reach £64.89, past the warning. Claude off with the scan is a cautious bound, because the scan needs Claude.</p>${terms}${s === 'default' || s === 'noModel' ? `<div class="cost-row"><span class="small">Full workload measured on dev</span>${chipOf(['', 'Not yet', 'clock'])}</div>` : ''}`);
  }

  /* ---------- home ---------- */
  /* Home shows prices, so its value and rows follow the shared story. Ready: HSBC is late but inside the limit. Stale: it leaves the total. Error: the last good run shows in full. */
  const late = html => html.replace('Stale: last price 14:10 (Yahoo)</span>', `Late: last price 14:10 (Yahoo)</span>${proposed('DATA-DEC-02')}`);
  const rowsOf = (ctx, n) => `<div class="sech" style="padding:6px 0 0" data-mo="rise"><h3>Holdings</h3><span class="cost-chips" style="align-items:center"><span class="small muted">6 months</span>${illus('Decision support')}</span></div><div class="list card" style="margin:0">${H.slice(0, n).map(h => (ctx.state === 'stale' ? hrow(h) : late(hrow(h)))).join('')}</div>`;
  function valueOf(ctx) {
    const size = wide(ctx) ? 40 : 44, v = valcard(size);
    if (ctx.state === 'error') return v.replace('As of 21:15 London · data cutoff 21:00', 'Last good run Mon 21:15 · cutoff 21:00').replace('>today<', '>last good run<');
    if (ctx.state === 'stale') return v.replace('Portfolio value', 'Known value, 6 of 7 priced').replace(money('90,155.25', size), money('84,051.05', size)).replace('Holdings £84,612.40', 'Holdings £78,508.20').replace(/<div class="d">[\s\S]*?<\/div>/, `<div class="d" style="font-size:13px;line-height:18px;letter-spacing:0"><span class="muted">HSBC, £6,104.20 at 14:10, is left out until its price returns.</span>${proposed('DATA-DEC-02')}</div>`).replace(/50\.1/g, '53.8').replace(/26\.7/g, '28.7').replace(/17\.0/g, '11.0').replace(/\b6\.1\b/g, '6.6');
    return v;
  }
  const top5s = ctx => (wide(ctx) ? `<div class="card top5 dk5" data-mo="card">${top5('ustech')}</div>` : '');
  const toThresholds = `<button class="btn sm btn-plain" type="button" style="justify-self:start;padding:0">What each line does${ic('chev-r', 's16')}</button>`;

  /* ---------- option B's parts: the pill, the chart, the log ---------- */
  function pill(ctx) {
    const m = month(ctx), s = ctx.state, pc = parseFloat(m.so), whole = `£${Math.round(pc)}`, ceil = '<span class="sr"> of £100</span>';
    /* whole pounds where it must be short. A bill that differs by 31p keeps its pence, or the difference would not show. */
    const t = { loading: `Last good ${whole}`, error: `${whole}${ceil} · collector failed`, stale: `${whole}${ceil} · billing 39 h old`, offline: `${whole}${ceil} · saved`, disagreement: `£${m.so}${ceil} · bill differs`, abstention: `${whole}${ceil} · part unknown` }[s] || `${whole} of £100`;
    const i = { error: 'alert', stale: 'clock', offline: 'wifi-off', disagreement: 'split', abstention: 'ban' }[s];
    return `<button class="chip glass cost-pill" type="button" data-mo="chip">${i ? ic(i, 's14') : `<span class="cost-pillbar"><i style="width:${pc}%"></i></span>`}<span><span class="sr">Cost this month: </span>${t}<span class="sr">. £${m.so} ${m.word}. ${m.st[1]}. Forecast ${m.fc}. Opens the month.</span></span></button>`;
  }
  const INC = [.7, .9, 1.1, .8, 1.6, .9, .7, 1.2, 1, .9, 1.4, 1.1, .8, 1.3, 1, 1.2, 1, 1.3, 1.4, 1.8, 2.4, 3, 3.4, 2.6, 2, 1.6, 1.2, 1];
  function burn(ctx, W = 326, Ht = 220, m = month(ctx)) {
    const s = ctx.state, ml = 8, mr = 70, mt = 12, mb = 22;
    const X = d => ml + ((d - 1) / 29) * (W - ml - mr), Y = v => mt + (1 - v / 100) * (Ht - mt - mb);
    const end = parseFloat(m.so), days = m.last || m.day, sumInc = INC.slice(0, days - 1).reduce((a, b) => a + b, 0);
    const pts = [[1, 27.84]]; let v = 27.84;
    for (let d = 2; d <= days; d++) { v += INC[d - 2] * ((end - 27.84) / sumInc); pts.push([d, v]); }
    const line = (arr) => arr.map(([d, y], i) => `${i ? 'L' : 'M'}${X(d).toFixed(1)} ${Y(y).toFixed(1)}`).join('');
    const billed = m.last || m.day - (s === 'stale' ? 2 : 1), known = pts.filter(p => p[0] <= billed), tail = pts.filter(p => p[0] >= billed);
    /* "up to" tops the band with the figure. A month past a line has a point forecast, so the line ends on it, inside its band. */
    const last = pts[pts.length - 1], loTo = m.lo ?? (s === 'noModel' ? 46.48 : 54.73), hiTo = m.hi ?? m.to, medTo = m.lo === undefined ? loTo : m.to;
    const fan = s === 'abstention' ? '' : `<path class="b80" d="M${X(last[0]).toFixed(1)} ${Y(last[1]).toFixed(1)}L${X(30).toFixed(1)} ${Y(hiTo).toFixed(1)}L${X(30).toFixed(1)} ${Y(loTo).toFixed(1)}Z"/><path class="med" d="M${X(last[0]).toFixed(1)} ${Y(last[1]).toFixed(1)}L${X(30).toFixed(1)} ${Y(medTo).toFixed(1)}"/>`;
    const lines = [[60, '£60 Warn'], [75, '£75 Reduce'], [85, '£85 Pause'], [100, '£100 Ceiling']];
    return `<svg class="cx"${ctx.kind === 'ipad' ? ' data-snug' : ''} viewBox="0 0 ${W} ${Ht}" width="100%" role="img" aria-label="Spend by day this month: ${m.so} pounds on day ${last[0]}, heading ${m.fc} by day 30, against lines at £60, £75, £85 and £100. Illustrative.">
      ${lines.map(([y, t]) => `<line class="${y === 100 ? 'zero' : 'grid'}" x1="${ml}" x2="${W - mr}" y1="${Y(y)}" y2="${Y(y)}"/><text class="lbl" x="${W - mr + 4}" y="${Y(y) + 4}">${t}</text>`).join('')}
      <line class="zero" x1="${ml}" x2="${W - mr}" y1="${Y(0)}" y2="${Y(0)}"/>
      <g data-mo="draw">${fan}<line class="now" x1="${X(last[0])}" x2="${X(last[0])}" y1="${mt}" y2="${Ht - mb}"/>
      <path class="hist" d="${line(known.length > 1 ? known : pts)}"/>${tail.length > 1 ? `<path class="hist" stroke-dasharray="2 3" d="${line(tail)}"/>` : ''}</g>
      <g data-mo="dot"><circle class="nowdot" cx="${X(last[0])}" cy="${Y(last[1])}" r="4.5"/></g>
      <text x="${X(1) + 2}" y="${Y(27.84) + 18}">Invoice £27.84</text><text x="${ml}" y="${Ht - 6}">1 Nov</text><text x="${X(last[0])}" y="${Ht - 6}" text-anchor="middle">${last[0] === 1 ? '' : `Day ${last[0]}`}</text><text x="${X(30)}" y="${Ht - 6}" text-anchor="end">30 Nov</text>
    </svg>`;
  }
  const burnKey = () => `<div class="legend" style="margin-top:0"><span><i class="lg-hist"></i>Committed</span><span><i class="lg-scen"></i>Not yet billed</span><span><i class="lg-80"></i>Forecast range</span><span><i class="lg-med"></i>Forecast</span></div>`;
  const burnTable = (m) => `<details><summary>Chart as a table</summary><div style="overflow-x:auto"><table class="ht"><thead><tr><th>Day</th><th class="r">Committed</th></tr></thead><tbody><tr><td>1 Nov</td><td class="r">£27.84</td></tr>${m.day === 1 ? '' : `<tr><td>Day ${m.last || m.day}</td><td class="r">£${m.so}</td></tr>`}<tr><td>30 Nov, forecast</td><td class="r">${m.fc}</td></tr></tbody></table></div></details>`;
  const burnDraw = ctx => m => `${burn(ctx, wide(ctx) ? 460 : 326, wide(ctx) ? 250 : 220, m)}${burnKey()}`;
  function burnCard(ctx) {
    const m = month(ctx);
    if (ctx.state === 'loading') return box(`<div class="cost-row"><span class="label">${dayOf(m)}</span>${illus()}</div>${sk('100%', 200)}<div class="cost-status">${chipOf(m.st)}<p class="small muted">Last good: £46.42 committed, forecast up to £59.73.</p></div>`);
    return box(`<div class="cost-row"><span class="label">${dayOf(m)}</span>${illus()}</div><div class="cost-fig">${money(m.so, 34)}<span class="small muted">${m.word}, forecast ${m.fc}</span></div>${burnDraw(ctx)(m)}${statusOf(m)}${burnTable(m)}`);
  }
  function log(ctx) {
    const s = ctx.state;
    if (s === 'loading') return skCard('What happened', 4);
    const noLine = t => ['check', 'No line reached', t, ''];
    const LINES = {
      default: noLine('Forecast up to £59.73, 27p under the £60 warning'), stale: noLine('Forecast up to £59.73, 27p under the £60 warning, with billing 39 hours old'),
      error: noLine('Estimated up to £59.73, 27p under the £60 warning'), offline: noLine('Saved at 21:15: 27p under the £60 warning'), noModel: noLine('Forecast £46.48, £13.52 under the £60 warning'),
      disagreement: ['alert', 'Warned at £60', '18 Nov · the bill took the forecast to £60.04. A notice reached you', '£60.04'], abstention: ['ban', 'No line can be judged', 'The forecast is unknown, so the £60 warning is not known either', 'Unknown'],
      empty: noLine('The plan is up to £59.73, 27p under the £60 warning')
    };
    if (s === 'empty') return box(`${head('What happened')}${list([li(...LINES.empty), li('check', 'Twelve Data invoice', 'Fixed. Due on the 1st', '£27.84')])}<p class="small muted">AWS and Claude start here at their first collection.</p>`);
    const extra = {
      error: [['Today', [['alert', 'AWS collector failed', '06:10. Retries at the next window', 'Failed']]]],
      stale: [['Today', [['clock', 'Optional work held', 'No new AWS bill for 39 hours', 'Held']]]],
      offline: [['Saved at 21:15', [['wifi-off', 'Newer events show when you reconnect', '', '']]]],
      noModel: [['Today', [['ban', 'Top-5 batch refused', 'No verified credit, Claude is off', 'Refused']]]],
      disagreement: [['17 Nov', [['split', 'Estimate and bill differ', 'Estimate £0.71, bill £1.02', '+£0.31']]]],
      abstention: [['Today', [['ban', 'Claude usage not collected', 'Stays unknown, never £0', 'Unknown']]]]
    }[s] || [];
    const spent = s === 'noModel' ? [] : [['18 Nov', [['clock', 'Nightly explanations reserved', 'Held at worst case', '£0.34']]], ['17 Nov', [['check', 'Event analysis settled', 'The bill replaced the hold', '£0.22']]], ['14 Nov', [['ban', 'Top-5 batch refused', '£3.20 could cross the £5 cap', 'Refused']]]];
    const days = extra.concat([['Thresholds this month', [LINES[s]]]], spent, [['1 Nov', [['check', 'Twelve Data invoice', 'Fixed. Due on the 1st', '£27.84']]]]);
    const m = month(ctx), sofar = li('', m.word[0].toUpperCase() + m.word.slice(1), dayOf({ day: m.last || m.day }), `£${m.so}`);
    return box(`${head('What happened', illus())}${list([sofar])}${days.map(([d, rows], i) => `<div class="cost-day">${d}</div>${list(rows.map(r => li(r[0], r[1], r[2], r[3])))}${i === 0 ? askOf(m) : ''}`).join('')}`);
  }
  const limitTable = ctx => `<div style="overflow-x:auto"><table class="ht"><thead><tr><th>Line</th><th>What changes</th></tr></thead><tbody>${[
    ['£60 Warn', 'A notice reaches you. Nothing stops'], ['£75 Reduce', 'Fewer optional backfills, challengers and Claude jobs'], ['£85 Pause', 'New optional paid work pauses, with its reason'],
    ['£100 Ceiling', 'The limit. Not an instant AWS shut-off'], ['£5 Scan cap', 'A batch that could cross it is refused'], ['Claude off', '£46.48 a month. Chat and research unavailable'], ['Apple fee month', 'Whole month £149.77. Judged on £54.73']
  ].map(r => `<tr data-mo="rise"><td style="font-weight:600">${r[0]}</td><td style="white-space:normal">${r[1]}</td></tr>`).join('')}</tbody></table></div>`;
  const sheetOf = (ctx) => {
    const m = month(ctx);
    return `<div class="sheet cost-sheet" role="dialog" aria-modal="true" aria-label="Cost this month" data-mo="sheet">${wide(ctx) ? '' : '<div class="grabber"></div>'}
      <div class="cost-row"><h4>This month</h4>${illus()}</div>
      ${ctx.state === 'loading' ? `${sk('140px', 34)}${sk('100%', 12)}` : `<div class="cost-fig">${money(m.so, 34)}<span class="small muted">${m.word}</span></div>${lad(m)}`}
      ${statusOf(m)}
      ${list(m.keys.filter(k => k[1] !== 'Reserved').map(k => li('', k[1], '', k[2])))}
      <div class="cost-row"><span class="small muted">Forecast for the month</span><b>${m.fc}</b></div>
      ${btn('Open the month')}</div>`;
  };

  J.add({
    id: 'cost', title: 'Cost', stories: ['MP-100', 'MP-142', 'MP-103', 'MP-90', 'MP-89', 'MP-112'],
    summary: 'What this month costs against the £100 ceiling, one tap from home, with what happens at each line. The month is drawn at day 18, later than the 3 November used elsewhere, so the lines have something to show.',
    options: [{
      id: 'a', name: 'Meter and ladder', rec: true,
      why: 'The meter stays in view on Home without a tap, and one tap opens everything on one page. You always see how far the next line is and what happens there.',
      cost: 'On a phone the meter pins above the dock, so holdings stay first but it covers a strip of the list as you scroll. How the month got here is a step further in.',
      screens: [{
        id: 'cost-a-home', title: 'Home with the meter',
        note: 'Pinned above the dock on a phone, so holdings stay first; at the top of the rail on iPad and desktop.',
        render: ctx => homePage(ctx, { tab: 0, title: 'Portfolio', body: valueOf(ctx) + rowsOf(ctx, wide(ctx) ? 5 : 3), rail: wide(ctx) ? hero(ctx) + top5s(ctx) : '', accessory: wide(ctx) ? '' : strip(ctx) })
      }, {
        id: 'cost-a-month', title: 'This month',
        note: 'Tap the meter. Spend against £100, by part, with the forecast and each figure\'s age.',
        render: ctx => page(ctx, { tab: 0, back: 'Portfolio', title: 'This month', webActions: illus('Read only'), body: hero(ctx) + parts(ctx) + scan(ctx), rail: box(`${head('The lines')}<div>${miniRungs()}</div>${toThresholds}`) + sourcesCard(ctx) })
      }, {
        id: 'cost-a-limits', title: 'The lines',
        note: 'Code applies the lines. Only you change one, in Settings, with a fresh sign-in, so this page has no control.',
        render: ctx => page(ctx, { tab: 0, back: 'This month', title: 'The lines', webActions: illus('Read only'), body: (ctx.state === 'loading' ? hero(ctx) : box(`${head('Where you are', chipOf(month(ctx).st))}${lad(month(ctx))}<p class="small muted">${month(ctx).say}</p>${askOf(month(ctx))}`)) + box(`${head('The lines')}<p class="small muted">Each line is judged on the forecast for the month, before paid work starts. Code applies them. Only you change one, in Settings, with a fresh sign-in.</p><div>${rungs(ctx)}</div>`) + always(), rail: scan(ctx) + claudeCard(ctx) })
      }, {
        id: 'cost-a-warned', title: 'Warned at £60',
        note: 'A notice opens this. Nothing stops at £60, and the page says how far the next line is.',
        render: ctx => page(ctx, { tab: 0, back: 'This month', title: 'Warned', webActions: illus('Read only'), body: overTop(ctx, 'warn') + (ctx.state === 'empty' ? '' : overList(ctx, 'warn')), rail: overRail(ctx, 'warn') })
      }, {
        id: 'cost-a-reduced', title: 'Optional work reduced',
        note: 'A notice opens this. No feature is cut silently: what is reduced shows here with its reason and how it ends.',
        render: ctx => page(ctx, { tab: 0, back: 'This month', title: 'Reduced', webActions: illus('Read only'), body: overTop(ctx, 'reduce') + (ctx.state === 'empty' ? '' : overList(ctx, 'reduce')), rail: overRail(ctx, 'reduce') })
      }, {
        id: 'cost-a-paused', title: 'Optional work paused',
        note: 'A notice opens this. No feature is cut silently: every pause shows here with its reason and how it ends.',
        render: ctx => page(ctx, { tab: 0, back: 'This month', title: 'Paused', webActions: illus('Read only'), body: overTop(ctx, 'pause') + (ctx.state === 'empty' ? '' : overList(ctx, 'pause')), rail: overRail(ctx, 'pause') })
      }, {
        id: 'cost-a-sources', title: 'Where the figures come from',
        note: 'Estimates, usage and bills stay apart, each with its lag. Unknown is never shown as zero.',
        render: ctx => page(ctx, { tab: 0, back: 'This month', title: 'The figures', body: committedCard(ctx, { forecast: true }) + sourcesCard(ctx) + creditCard(ctx), rail: drill(ctx) + holds(ctx) })
      }, {
        id: 'cost-a-fit', title: 'Does the month fit',
        note: 'Your recorded figures. The Apple fee month is judged without its fee, as you answered in COST-Q4.',
        na: { noModel: 'These planned months already show Claude on and off side by side, and no forecasting model is on this page' },
        render: ctx => page(ctx, { tab: 0, back: 'This month', title: 'Does it fit', body: fitCard(ctx), rail: apple(ctx) })
      }]
    }, {
      id: 'b', name: 'Pill and burn-up',
      why: 'A small pill in the top bar keeps your holdings higher on the screen. It opens the month as a story: a day-by-day chart and a log of what spent what, with the limits one table away.',
      cost: 'The pill is a figure, not a ladder, so you do not see the next line from home. What degrades at each line is two taps away.',
      screens: [{
        id: 'cost-b-home', title: 'Home with the pill',
        note: 'One tap from home, and no height taken from holdings.',
        render: ctx => homePage(ctx, { tab: 0, title: 'Portfolio', actions: pill(ctx) + tb('search', 'Search') + tb('eye-off', 'Hide amounts'), webActions: pill(ctx), body: valueOf(ctx) + rowsOf(ctx, wide(ctx) ? 5 : 3), rail: top5s(ctx) })
      }, {
        id: 'cost-b-sheet', title: 'The month in a sheet',
        note: 'Tap the pill. The sheet answers the quick question, and the page holds the rest.',
        render: ctx => homePage(ctx, { tab: 0, title: 'Portfolio', actions: pill(ctx) + tb('search', 'Search') + tb('eye-off', 'Hide amounts'), webActions: pill(ctx), body: valueOf(ctx) + rowsOf(ctx, 3), rail: top5s(ctx), sheet: sheetOf(ctx) })
      }, {
        id: 'cost-b-burn', title: 'The month by day',
        note: 'Committed spend climbs against the lines. The dotted part is not yet billed; the band is the forecast to day 30.',
        render: ctx => page(ctx, { tab: 0, back: 'Portfolio', title: 'This month', webActions: illus('Read only'), body: burnCard(ctx) + parts(ctx), rail: sourcesCard(ctx) + committedCard(ctx) })
      }, {
        id: 'cost-b-log', title: 'What happened',
        note: 'Every invoice, reservation, refusal and threshold, newest first.',
        render: ctx => page(ctx, { tab: 0, back: 'This month', title: 'What happened', body: log(ctx), rail: sourcesCard(ctx) + drill(ctx) + creditCard(ctx) })
      }, {
        id: 'cost-b-limits', title: 'Limits',
        note: 'One table for the lines, the scan cap, Claude and the Apple fee month.',
        render: ctx => page(ctx, { tab: 0, back: 'This month', title: 'Limits', webActions: illus('Read only'), body: whereYouAre(ctx) + box(`${head('Every limit', illus())}${limitTable(ctx)}<p class="small muted">Code applies these. Only you change one, in Settings, with a fresh sign-in.</p>`) + always(), rail: claudeCard(ctx) + scan(ctx) + apple(ctx) })
      }, {
        id: 'cost-b-warned', title: 'Warned at £60',
        note: 'A notice opens this. The same chart, with the forecast past the first line. Nothing stops at £60.',
        render: ctx => page(ctx, { tab: 0, back: 'What happened', title: 'Warned', webActions: illus('Read only'), body: overTop(ctx, 'warn', { draw: burnDraw(ctx), to: 'See the limits' }) + (ctx.state === 'empty' ? '' : overList(ctx, 'warn')), rail: overRail(ctx, 'warn') })
      }, {
        id: 'cost-b-reduced', title: 'Optional work reduced',
        note: 'A notice opens this. No feature is cut silently: what is reduced shows here with its reason and how it ends.',
        render: ctx => page(ctx, { tab: 0, back: 'What happened', title: 'Reduced', webActions: illus('Read only'), body: overTop(ctx, 'reduce', { draw: burnDraw(ctx), to: 'See the limits' }) + (ctx.state === 'empty' ? '' : overList(ctx, 'reduce')), rail: overRail(ctx, 'reduce') })
      }, {
        id: 'cost-b-paused', title: 'Optional work paused',
        note: 'A notice opens this. No feature is cut silently: every pause shows here with its reason and how it ends.',
        render: ctx => page(ctx, { tab: 0, back: 'What happened', title: 'Paused', webActions: illus('Read only'), body: overTop(ctx, 'pause', { draw: burnDraw(ctx), to: 'See the limits' }) + (ctx.state === 'empty' ? '' : overList(ctx, 'pause')), rail: overRail(ctx, 'pause') })
      }, {
        id: 'cost-b-fit', title: 'Does the month fit',
        note: 'Your recorded figures, the same as option A. The Apple fee month is judged without its fee, as you answered in COST-Q4.',
        na: { noModel: 'These planned months already show Claude on and off side by side, and no forecasting model is on this page' },
        render: ctx => page(ctx, { tab: 0, back: 'Limits', title: 'Does it fit', body: fitCard(ctx, fitRows), rail: apple(ctx) })
      }]
    }]
  });
}
