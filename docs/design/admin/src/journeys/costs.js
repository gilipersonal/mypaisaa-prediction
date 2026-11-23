/* Costs and budgets (MP-64, ARC-08). Estimate, usage and bill kept apart, each with its age, so the month can be reconciled and a jump
   traced to what caused it. Read-only except a threshold, an allocation and paid use, each with a fresh sign-in. Cost stays one tap from
   the main app as well (MP-142). The month is its own illustrative calendar, day 18 of 30, and a screen that joins cost to a run says
   which clock it shows. Every sum is computed from the rows beside it: bill £38.40 + usage £6.71 + estimates £0.97 + held £0.34 = £46.42. */
{
  const chip = (cls, t, i) => `<span class="chip ${cls}">${i ? ic(i, 's14') : '<span class="dot"></span>'}${t}</span>`;
  const tags = (...c) => `<div class="acosts-tags">${c.join('')}</div>`;
  const p = t => `<p class="small muted">${t}</p>`;
  const gbp = v => `£${v.toFixed(2)}`;
  const off = h => h.replace(/type="button"/g, 'type="button" disabled');
  const head = (t, r = '') => `<div class="acosts-head"><b>${t}</b>${r}</div>`;
  const STEP = 'Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.';
  const OFFLINE = 'No financial write offline. Nothing can be changed until you reconnect.';
  const OLD = 'Reading needs no fresh sign-in. Changing something does, and yours is too old for this action.';
  const CLAUDE_OFF = 'Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in.';
  const ONE = () => `<div class="acosts-one" data-mo="rise">${ic('home', 's18')}<span>Cost stays one tap from the main app as well as here (MP-142).</span></div>`;
  const D = '--mark-us', A = '--mark-uk', C = '--seg-ustech', H = '--ink-2';
  const sk = (w, h = 14) => `<span class="sk" style="height:${h}px;width:${w}"></span>`;
  const delta = r => r.map(([k, a, b, x]) => `<div class="acosts-ch"><span class="small muted">${k}</span><span class="acosts-to">${a ? `<span class="muted">${a}</span>${ic('chev-r', 's14')}` : ''}${b}</span>${x ? `<span class="small muted acosts-full">${x}</span>` : ''}</div>`).join('');
  const deltaCard = (r, t = 'Exactly what would change') => box(`${lbl(t)}<div class="acosts-gap">${delta(r)}</div>`);
  /* the cost month's own clock. The chip in the frame is admin's records clock, Wed 4 Nov, and the two never mean the same day */
  const CLOCK = { offline: ['offline', 'Offline · from 21:15', 'wifi-off'], loading: ['fresh', 'Refreshing · last good 21:15'], error: ['error', 'Collector failed 06:10', 'alert'], stale: ['stale', 'Billing 39 h old', 'clock'], partial: ['stale', 'Partial · page cap reached', 'clock'], empty: ['', 'New month', 'clock'] };
  const clock = (ctx, day) => `<div class="acosts-clock" data-mo="rise">${chip(...(day === 19 ? ['stale', 'A day later', 'clock'] : CLOCK[ctx.state] || ['fresh', 'Estimates to 21:15']))}<span class="small muted">This screen shows the cost month, day ${day || (ctx.state === 'empty' ? 1 : 18)} of 30. The Records chip is admin's own clock, Wed 4 Nov.</span></div>`;
  const cp = (ctx, spec) => frame(ctx, { ...spec, body: clock(spec.asReady ? { ...ctx, state: 'default' } : ctx, spec.day) + spec.body });
  const ends = rows => box(`${lbl('How this can end')}${rows.map(([t, x]) => `<div class="acosts-end"><b>${t}</b><span class="small muted">${x}</span></div>`).join('')}`);
  const fieldOf = (ctx, l, inner) => `<label class="acosts-field"><span class="small">${l}</span>${inner}</label>`;
  const shutField = (ctx, dead) => (dead || !wide(ctx) ? ' disabled' : '');

  /* ---------- the month, in every state ---------- */
  const BARS = [[D, 27.84], [A, 11.18], [C, 7.06], [H, 0.34]];
  const BASE = { so: '46.42', word: 'committed so far', fc: 'up to £59.73', to: 59.73, bars: BARS, day: 18 };
  const MONTH = {
    default: { ...BASE, st: chip('fresh', 'On plan'), say: 'Forecast up to £59.73. That is 27p under the £60 warning, before about £0.15 of transfer and other lines not yet modelled.' },
    loading: { ...BASE, st: chip('fresh', 'Refreshing'), say: 'Last good: £46.42 committed, forecast up to £59.73. This view reads saved figures, so refreshing never calls billing.' },
    empty: { ...BASE, so: '27.84', day: 1, fc: 'up to £59.73, the plan', bars: [BARS[0]], st: chip('', 'New month', 'clock'), say: 'Only the data invoice so far. AWS arrives tomorrow, Claude within six hours.' },
    partial: { ...BASE, st: chip('stale', 'Partial · page cap reached', 'clock'), say: 'The 120-page cap was reached, so the rest of the AWS collection waits and shows as partial, never silently cut short.' },
    error: { ...BASE, so: '37.69', word: 'last reconciled', fc: 'up to £59.73, estimated only', bars: [BARS[0], [A, 9.85]], unk: 6.71, st: chip('error', 'Collector failed', 'alert') + chip('stale', 'Stale · 39 h old', 'clock'), say: 'The AWS collector failed at 06:10 and retries at the next window. Figures stop at 16 Nov. With Claude usage to 18:00, the month is at least £44.40.' },
    stale: { ...BASE, st: chip('stale', 'Billing 39 h old', 'clock'), say: 'AWS has sent no new bill for 39 hours. Past 36, optional work waits until it is reconciled.', q: 'MP40-Q6' },
    offline: { ...BASE, st: chip('offline', 'Offline · saved figures', 'wifi-off'), say: 'Nothing updates until you reconnect.' },
    conflict: { ...BASE, so: '46.73', word: 'with the bill', fc: 'up to £60.04', to: 60.04, bars: [BARS[0], [A, 11.49], BARS[2], BARS[3]], st: chip('stale', 'Estimate and bill differ', 'split'), say: '17 Nov: estimate £0.71, bill £1.02. The bill counts, which takes the forecast past £60.' },
    expired: { ...BASE, st: chip('stale', 'A hold passed its time', 'clock'), say: 'The nightly explanations hold of £0.34 passed its time. It stays counted until its batch is reconciled, because only confirmed unspent liability is released.' },
    denied: { ...BASE, st: chip('fresh', 'Reads stay open'), say: 'Reading needs no fresh sign-in. Changing a budget does.' }
  };
  const month = ctx => MONTH[ctx.state] || MONTH.default;
  const lad = m => {
    let x = 0;
    const fills = m.bars.map(([c, v]) => { const s = `<i style="--c:var(${c});left:${x.toFixed(2)}%;width:${v.toFixed(2)}%"></i>`; x += v; return s; }).join('');
    const fc = m.to > x ? `<i class="fc" style="left:${x.toFixed(2)}%;width:${(m.to - x).toFixed(2)}%"></i>` : '';
    const unk = m.unk ? `<i class="unk" style="left:${x.toFixed(2)}%;width:${m.unk}%"></i>` : '';
    return `<div class="acosts-lad" role="img" aria-label="${m.so} pounds ${m.word} on a scale to the £100 ceiling. Forecast ${m.fc}. Warn at £60, reduce at £75, pause at £85. Illustrative."><div class="acosts-track">${fills}${fc}${unk}</div>${[[60, '£60'], [75, '£75'], [85, '£85'], [100, '£100']].map(([v, t]) => `<b style="left:${v === 100 ? 99.6 : v}%"></b><span class="${v === 100 ? 'end' : ''}" style="left:${v}%">${t}</span>`).join('')}<span class="start">£0</span></div>`;
  };
  const hero = (ctx, o = {}) => {
    const m = month(ctx), top = `<div class="acosts-row"><span class="label">November · day ${m.day} of 30</span>${illus()}</div>`;
    if (ctx.state === 'loading') return box(`${top}${sk('180px', 40)}${sk('100%', 12)}${tags(m.st)}${p(m.say)}`, 'display:grid;gap:10px');
    return box(`${top}<div class="acosts-fig">${money(m.so, o.size || 40)}<span class="small muted">${m.word}</span></div><div class="acosts-row"><span class="small muted">Forecast for the month</span><b>${m.fc}</b></div>${lad(m)}${tags(m.st, m.q ? proposed(m.q) : '')}${p(m.say)}`, 'display:grid;gap:10px');
  };

  /* ---------- estimate, usage and bill, line by line. Each line's cells add up to its total, and each column to the month ---------- */
  const none = 'None', nob = 'No bill yet', NA = 'Not added';
  const SUBS = { data: 'Twelve Data Grow 55', aws: 'Dev £2.96 · Prod £7.80 · Shared £0.42', cl: 'Dev £1.20 · Prod £5.46 · Local £0.40', res: 'Held at worst case' };
  const mk = (awsBill, awsEst, cl = [6.71, 0.35], res = 0.34) => [['Market data', SUBS.data, 'layers', 27.84, none, none, none], ['AWS', SUBS.aws, 'cube', awsBill, none, awsEst, none], ['Claude', SUBS.cl, 'fan', nob, cl[0], cl[1], none], ['Reserved', SUBS.res, 'clock', none, none, none, res]];
  const LINES = {
    default: mk(10.56, 0.62), stale: mk(9.85, 1.33), partial: mk(9.85, 1.33), conflict: mk(10.87, 0.62).map(l => (l[0] === 'AWS' ? [l[0], 'Bill £1.02, estimate £0.71 on 17 Nov', ...l.slice(2)] : l)),
    error: [['Market data', SUBS.data, 'layers', 27.84, none, none, none], ['AWS', 'Reconciled to 16 Nov · collector failed 06:10', 'cube', 9.85, none, NA, none], ['Claude', 'Usage to 18:00', 'fan', nob, 6.71, NA, none], ['Reserved', 'Held £0.34 · not added to the lower bound', 'clock', none, none, none, NA]],
    empty: [['Market data', 'Twelve Data, due now', 'layers', 'Due now', none, none, none], ['AWS', 'First collection tomorrow', 'cube', 'None yet', none, 'None yet', none], ['Claude', 'First usage report within six hours', 'fan', nob, 'None yet', 'None yet', none], ['Reserved', 'Nothing reserved yet', 'clock', none, none, none, none]]
  };
  const COLS = ['Bill', 'Usage', 'Estimate', 'Held'];
  const lineRows = ctx => LINES[ctx.state] || LINES.default;
  const nums = r => r.slice(3).filter(v => typeof v === 'number');
  const cell = v => (typeof v === 'number' ? gbp(v) : v);
  const lineTotal = (ctx, r) => (ctx.state === 'empty' && r[0] === 'Market data' ? '£27.84' : nums(r).length ? (ctx.state === 'error' && r[0] !== 'Market data' ? `At least ${gbp(nums(r).reduce((a, b) => a + b, 0))}` : gbp(nums(r).reduce((a, b) => a + b, 0))) : r[0] === 'Reserved' && ctx.state === 'error' ? NA : ctx.state === 'empty' && r[0] !== 'Reserved' ? 'None yet' : none);
  const colSum = (rows, i) => rows.reduce((a, r) => a + (typeof r[i] === 'number' ? r[i] : 0), 0);
  const sumLine = ctx => {
    const r = lineRows(ctx);
    if (ctx.state === 'empty') return 'Nothing is reconciled yet. Committed is the data invoice, £27.84.';
    if (ctx.state === 'error') return `Bill ${gbp(colSum(r, 3))} + usage ${gbp(colSum(r, 4))} = at least £44.40. AWS since 16 Nov is not collected, so it is not shown, never £0. Estimates and the £0.34 held are not added to this lower bound.`;
    const [b, u, e, h] = [3, 4, 5, 6].map(i => colSum(r, i));
    return `Bill ${gbp(b)} + usage ${gbp(u)} + estimates ${gbp(e)} + held ${gbp(h)} = ${gbp(b + u + e + h)}.`;
  };
  const table = ctx => {
    const r = lineRows(ctx);
    const foot = ctx.state === 'empty' ? '' : `<tr class="acosts-tot"><td>The month</td>${[3, 4, 5, 6].map(i => `<td class="r">${r.some(l => l[i] === NA) ? NA : gbp(colSum(r, i))}</td>`).join('')}<td class="r">${ctx.state === 'error' ? 'At least £44.40' : gbp([3, 4, 5, 6].reduce((a, i) => a + colSum(r, i), 0))}</td></tr>`;
    return `<div class="acosts-tw" tabindex="0" role="region" aria-label="Lines by estimate, usage and bill"><table class="ht"><thead><tr><th>Line</th>${COLS.map(c => `<th class="r">${c}</th>`).join('')}<th class="r">Total</th></tr></thead><tbody>${r.map(l => `<tr data-mo="rise"><td class="acosts-wrap">${l[0] === 'Market data' ? `<b>${l[0]}</b>` : `<button class="acosts-lnk" type="button">${l[0]}${ic('chev-r', 's14')}</button>`}<br><span class="muted">${l[1]}</span></td>${l.slice(3).map(v => `<td class="r${typeof v === 'number' ? '' : ' muted'}">${cell(v)}</td>`).join('')}<td class="r"><b>${lineTotal(ctx, l)}</b></td></tr>`).join('')}${foot}</tbody></table></div>`;
  };
  const phoneRows = ctx => list(lineRows(ctx).map(l => item(lead(l[2]), l[0], l[1], `<span class="val">${lineTotal(ctx, l)}</span>`, `<div class="acosts-cells">${COLS.map((c, i) => `<span><i>${c}</i>${cell(l[i + 3])}</span>`).join('')}</div>`, false, l[0] !== 'Market data')).join(''));
  const doors = () => `${sec('Open')}${list([['clock', 'What is held', 'Reservations, and what committed adds up to'], ['fan', 'Claude, credit and cash', 'Gross, credit, cash and paid use'], ['target', 'Lines and allocations', 'The lines, allocations and changing one']].map(([i, t, x]) => item(lead(i), t, x, ic('chev-r', 's18'), '', false, true)).join(''))}`;
  const lines = ctx => (ctx.state === 'loading' ? skel(4) : `${wide(ctx) ? box(table(ctx), 'padding:6px 6px 10px') : phoneRows(ctx)}<p class="small muted" data-mo="rise">${sumLine(ctx)}</p>`);

  /* how old each figure is: the three lanes stay apart */
  const LANES = {
    default: [['Reconciled billing', 'Daily · AWS to 17 Nov', 'Age 15 h', 'fresh'], ['Anthropic usage', 'Every six hours · to 18:00', 'Age 3 h', 'fresh'], ['Internal estimates', 'Live · to 21:15', 'Now', 'fresh']],
    error: [['Reconciled billing', 'Failed 06:10 · AWS to 16 Nov · retries next window', 'Age 39 h', 'error'], ['Anthropic usage', 'Every six hours · to 18:00', 'Age 3 h', 'fresh'], ['Internal estimates', 'Live · to 21:15 · not added to the lower bound', 'Held back', '']],
    stale: [['Reconciled billing', 'Daily · AWS to 16 Nov · no new bill', 'Age 39 h', 'stale'], ['Anthropic usage', 'Every six hours · to 18:00', 'Age 3 h', 'fresh'], ['Internal estimates', 'Live · to 21:15', 'Now', 'fresh']],
    partial: [['Reconciled billing', 'Partial · AWS to 16 Nov · page cap reached', 'Partial', 'stale'], ['Anthropic usage', 'Every six hours · to 18:00', 'Age 3 h', 'fresh'], ['Internal estimates', 'Live · to 21:15', 'Now', 'fresh']],
    offline: [['Reconciled billing', 'Saved · AWS to 17 Nov', 'Age 15 h', 'offline'], ['Anthropic usage', 'Saved · to 18:00', 'Age 3 h', 'offline'], ['Internal estimates', 'Saved · to 21:15', 'Offline', 'offline']],
    empty: [['Reconciled billing', 'First run tomorrow, 06:10', 'None yet', ''], ['Anthropic usage', 'First report within six hours', 'None yet', ''], ['Internal estimates', 'Live · nothing to estimate yet', 'Now', 'fresh']]
  };
  const laneIcon = { fresh: '', stale: 'clock', error: 'alert', offline: 'wifi-off', '': 'ban' };
  const laneRows = ctx => list((LANES[ctx.state] || LANES.default).map(([t, s, age, k]) => item('', t, s, chip(k, age, laneIcon[k]))).concat(item('', 'Billing pages', 'Monthly cap of 120. Past it, a collection waits and shows as partial', `<span class="val">${ctx.state === 'empty' ? '0 of 120' : ctx.state === 'partial' ? '120 of 120' : '54 of 120'}</span>`)).join('')).replace(/<div class="hrow([^"]*)"/g, '<div class="hrow acosts-nolead$1"');
  const lanes = ctx => (ctx.state === 'loading' ? skel(3) : `${sec('How old each figure is')}${laneRows(ctx)}${p('This view reads saved figures, so opening it never calls billing.')}${tags(proposed('MP40-Q5: Anthropic admin key'))}`);

  /* ---------- one line: AWS, down to the day ---------- */
  const DAYS = {
    default: [['To 16 Nov', 'Reconciled', '£9.85'], ['17 Nov', 'Reconciled · bill matches the estimate', '£0.71'], ['Since 17 Nov', 'Internal estimate', '£0.62']],
    conflict: [['To 16 Nov', 'Reconciled', '£9.85'], ['17 Nov', 'Bill £1.02, estimate £0.71. The bill counts', '£1.02'], ['Since 17 Nov', 'Internal estimate', '£0.62']],
    stale: [['To 16 Nov', 'Reconciled', '£9.85'], ['Since 16 Nov', 'Internal estimate · no new bill for 39 hours', '£1.33']],
    partial: [['To 16 Nov', 'Reconciled', '£9.85'], ['Since 16 Nov', 'Internal estimate · the page cap stopped the rest', '£1.33']],
    error: [['To 16 Nov', 'Reconciled', '£9.85'], ['Since 16 Nov', 'Not collected, and estimates are not added', 'Not shown']],
    empty: [['1 Nov', 'First collection tomorrow', 'None yet']]
  };
  const lineTop = ctx => {
    const v = { conflict: '£11.49', error: 'At least £9.85', empty: 'None yet' }[ctx.state] || '£11.18';
    return box(`<div class="acosts-row"><span class="label">AWS · November · day ${month(ctx).day} of 30</span>${illus()}</div><div class="acosts-row"><span class="acosts-big">${v}</span><span class="small muted">of the £22 allocation</span></div><div class="acosts-gap">${kv(ctx.state === 'error' ? [['Dev, prod and shared', 'Not shown after 16 Nov']] : [['Dev', ctx.state === 'empty' ? 'None yet' : '£2.96'], ['Prod', ctx.state === 'empty' ? 'None yet' : '£7.80'], ['Shared', ctx.state === 'empty' ? 'None yet' : '£0.42'], ...(ctx.state === 'conflict' ? [['17 Nov bill, not yet split', '£0.31']] : [])])}</div>`);
  };
  const dayRows = ctx => `${sec('By day')}${list((DAYS[ctx.state] || DAYS.default).map(([t, s, v]) => item('', t, s, `<span class="val">${v}</span>`)).join('')).replace(/<div class="hrow([^"]*)"/g, '<div class="hrow acosts-nolead$1"')}`;
  const collector = () => box(`${lbl('Where this comes from')}<div class="acosts-gap">${kv([['Collector', 'Prod billing collector'], ['Access', 'Read-only Cost Explorer role'], ['Stores', 'Source time, collected time, status'], ['Writes', 'The cost table only']])}</div><p class="small muted acosts-gap">Only that collector calls billing. A change to its role needs you and goes through Terraform, so there is no control for it here.</p>`);
  const toRun = () => `<div class="acosts-acts">${act('A03', 'See the runs', 'tinted', 'refresh')}</div>`;
  const lineCore = ctx => region(ctx, {
    what: 'AWS', rows: 4, ok: () => lineTop(ctx) + dayRows(ctx),
    loading: () => box(`${lbl('AWS')}${sk('140px', 34)}${sk('70%')}`, 'display:grid;gap:10px') + skel(3),
    empty: () => lineTop(ctx) + stateCard('clock', 'Nothing collected yet', 'The first AWS collection runs tomorrow at 06:10. A new month shows no line until a figure exists, and none shows as £0.') + dayRows(ctx),
    partial: () => banner('warn', 'Partial.', 'The monthly page cap stopped this collection. Pages past it are deferred, and the estimate stands in, labelled.', 'clock') + lineTop(ctx) + dayRows(ctx),
    error: () => stateCard('alert', 'The AWS collector failed at 06:10', 'It retries at the next window, and a gap is backfilled once the source returns. Nothing here is retried by hand.', '', chip('stale', 'Stale · 39 h old', 'clock')) + lineTop(ctx) + dayRows(ctx),
    stale: () => banner('warn', 'Billing 39 h old.', 'AWS has sent no new bill for 39 hours. Past 36, optional work waits until it is reconciled.', 'clock') + tags(proposed('MP40-Q6')) + lineTop(ctx) + dayRows(ctx),
    offline: () => banner('', 'Offline.', 'Saved figures. Nothing updates until you reconnect.', 'wifi-off') + lineTop(ctx) + dayRows(ctx),
    conflict: () => banner('warn', 'Estimate and bill differ.', '17 Nov: estimate £0.71, bill £1.02, a difference of £0.31. The bill counts, which takes the forecast past £60.', 'split') + lineTop(ctx) + dayRows(ctx),
    expired: () => banner('', 'Nothing on this line has an expiry.', 'The month\'s held £0.34 is Nightly explanations, on the Claude line.', 'clock') + lineTop(ctx) + dayRows(ctx),
    denied: () => banner('', 'Reads stay open.', 'This line needs no fresh sign-in to read, and it has nothing to change.', 'eye-off') + lineTop(ctx) + dayRows(ctx)
  });
  const lineRail = ctx => `${['loading', 'empty'].includes(ctx.state) ? '' : toRun()}${lanes(ctx)}${ctx.state === 'loading' ? '' : collector()}`;

  /* ---------- what is held before work starts (MP-90) ---------- */
  const HELD = [['clock', 'Nightly explanations', 'Reserved at its worst case', chip('', 'reserved')], ['check', 'Event analysis, 17 Nov', 'Settled. Usage replaced the hold', chip('fresh', 'settled')], ['ban', 'Top-5 batch, 14 Nov', 'Refused: £3.20 could cross the £5 cap', chip('error', 'refused', 'ban')], ['layers', 'Statement extraction', 'Settled · isa-oct-2026-scan.pdf · import imp_2b90 · inside Claude\'s £7.06', chip('fresh', 'settled')]];
  const heldVal = ['£0.34', '£0.22', 'Refused', '£0.06'];
  const heldRows = (ctx, sub = {}, pick = [0, 1, 2, 3]) => list(pick.map(i => { const h = HELD[i]; return item(lead(h[0]), h[1], sub[i] || h[2], `<span class="val">${sub[`v${i}`] || heldVal[i]}</span>`, sub[`c${i}`] || h[3]); }).join(''));
  const sumRows = rows => list(rows.map(([t, s, v]) => item('', t, s, `<span class="val">${v}</span>`)).join('')).replace(/<div class="hrow([^"]*)"/g, '<div class="hrow acosts-nolead$1"');
  const ENC = [['Settled', 'Bills paid or reconciled', '£38.40'], ['Not yet reconciled', 'Usage £6.71, estimates £0.97', '£7.68'], ['Future fixed', 'Nothing more due this month', '£0.00'], ['Open reservations', 'Held at worst case', '£0.34'], ['Committed', '£38.40 + £7.68 + £0.00 + £0.34', '£46.42']];
  const heldBase = ctx => `${sec('Held before work starts')}${heldRows(ctx)}${p('Paid work reserves its worst case first, and is admitted only if that fits the month, the environment and the route. A batch that times out keeps its hold until reconciled and is never sent twice.')}`;
  const heldCore = ctx => region(ctx, {
    what: 'Reservations', rows: 3, ok: () => heldBase(ctx),
    empty: () => stateCard('clock', 'Nothing reserved yet', 'No paid work has started this month. Each job reserves its worst case here before it runs.'),
    partial: () => banner('warn', 'One hold is ambiguous.', 'A batch timed out after the provider accepted it, so nightly explanations keep their £0.34 until reconciled, and the batch is never sent twice.', 'clock') + `${sec('Held before work starts')}${heldRows(ctx, { c0: chip('stale', 'ambiguous', 'clock') })}`,
    error: () => banner('fall', 'The AWS collector failed at 06:10.', 'Reservations are MP\'s own table, so they still read. The £0.34 held is not added to the lower bound of £44.40.', 'alert') + heldBase(ctx),
    stale: () => banner('warn', 'Admission is holding back.', 'AWS billing is 39 hours old, so optional work waits until it is reconciled.', 'clock') + tags(proposed('MP40-Q6')) + heldBase(ctx),
    offline: () => banner('', 'Offline.', 'Saved reservations. The limits hold on the server, not on this device.', 'wifi-off') + heldBase(ctx),
    conflict: () => banner('warn', 'Two jobs reached for the last of it.', 'When two workers reserve the same final amount, at most one succeeds. Settlement replaces a reservation and never adds to it.', 'split') + heldBase(ctx),
    expired: () => banner('warn', 'A hold passed its time.', 'Nightly explanations stay at £0.34 until reconciled. An expired reservation releases only confirmed unspent liability.', 'clock') + `${sec('Held before work starts')}${heldRows(ctx, { 0: 'Passed its time · waiting to reconcile', c0: chip('stale', 'cancel_pending', 'clock') })}`,
    denied: () => banner('', 'Refused by code, not by you.', 'A reservation that would cross a limit is refused before the work starts. Reads stay open, and no sign-in changes that answer.', 'ban') + heldBase(ctx)
  });
  const encCard = ctx => (ctx.state === 'loading' ? skel(4) : ctx.state === 'error' ? box(`${lbl('What committed adds up to')}<div class="acosts-gap">${sumRows([['Settled', 'Reconciled to 16 Nov', '£37.69'], ['Not yet reconciled', 'Claude usage to 18:00', '£6.71'], ['Since 16 Nov', 'AWS not collected', 'Not shown'], ['Open reservations', 'Held £0.34, not added to the lower bound', NA], ['Committed', '£37.69 + £6.71, and what is not shown', 'At least £44.40']])}</div>`) : ctx.state === 'empty' ? box(`${lbl('What committed adds up to')}<div class="acosts-gap">${sumRows([['Settled', 'Nothing reconciled yet', '£0.00'], ['Future fixed', 'Twelve Data, due now', '£27.84'], ['Committed', '£0.00 + £27.84', '£27.84']])}</div>`) : ctx.state === 'conflict' ? box(`${lbl('What committed adds up to')}<div class="acosts-gap">${sumRows([['Settled', 'With the 17 Nov bill', '£38.71'], ...ENC.slice(1, 4), ['Committed', '£38.71 + £7.68 + £0.00 + £0.34', '£46.73']])}</div>`) : ['stale', 'partial'].includes(ctx.state) ? box(`${lbl('What committed adds up to')}<div class="acosts-gap">${sumRows([['Settled', 'Reconciled to 16 Nov', '£37.69'], ['Not yet reconciled', 'Usage £6.71, estimates £1.68', '£8.39'], ENC[2], ENC[3], ['Committed', '£37.69 + £8.39 + £0.00 + £0.34', '£46.42']])}</div>`) : box(`${lbl('What committed adds up to')}<div class="acosts-gap">${sumRows(ENC)}</div>`));

  /* ---------- Claude, credit and cash (MP-90): shown in Denied as Claude off, because then every call is refused ---------- */
  const creditOn = ctx => {
    const gross = ctx.state === 'error' ? '£6.71' : ctx.state === 'empty' ? 'None yet' : '£7.06';
    return box(`${head('Gross, credit and cash', illus())}<div class="acosts-gap">${sumRows([['Claude gross usage', ctx.state === 'error' ? 'What the calls cost, to 18:00' : 'What the calls cost', gross], ['Credit applied', 'A shared credit is reported, not proven', 'Unknown'], ['Cash', 'Counted in full until a bill proves credit', ctx.state === 'empty' ? 'None yet' : ctx.state === 'error' ? `At least ${gross}` : `Up to ${gross}`]])}</div><p class="small muted acosts-gap">Credit counts only with proof under 30 minutes old. A usage report is never that proof.</p>${tags(proposed('MP40-Q6'), proposed('CT-13'))}`);
  };
  const two = on => box(`${head('Claude', on ? chip('fresh', 'On') : chip('', 'Off', 'ban'))}<div class="acosts-two"><div class="${on ? 'on' : ''}"><span>On</span><b>£54.73</b>${p('A month, up to £59.73 with the scan at its cap.')}</div><div class="${on ? '' : 'on'}"><span>Off</span><b>£46.48</b>${p('A month. No Claude calls.')}</div></div>${p(on ? 'Claude is on because you approved paid use. Admissible credit is zero until a bill proves it.' : CLAUDE_OFF)}`);
  const creditCore = ctx => region(ctx, {
    what: 'Credit', rows: 3, ok: () => creditOn(ctx) + two(true),
    empty: () => stateCard('clock', 'Nothing spent yet this month', 'Claude usage arrives within six hours. Until then gross, credit and cash show as none yet, not £0.') + creditOn(ctx) + two(true),
    partial: () => banner('warn', 'Credit unknown.', 'A reported credit is not proof, so admissible credit stays at zero. Unknown shared credit is never split per route.', 'clock') + creditOn(ctx) + two(true),
    error: () => banner('fall', 'The AWS collector failed at 06:10.', 'Claude usage still reads, to 18:00, and the next report comes at its window. Cash stays counted in full.', 'alert') + creditOn(ctx) + two(true),
    stale: () => banner('warn', 'AWS billing is 39 hours old, so optional work waits.', 'Anthropic usage is on time, and credit stays unknown.', 'clock') + tags(proposed('MP40-Q6')) + creditOn(ctx) + two(true),
    offline: () => banner('', 'Offline.', 'Saved figures. Paid use cannot be changed until you reconnect.', 'wifi-off') + creditOn(ctx) + two(true),
    conflict: () => banner('warn', 'A report and the proof differ.', 'A credit is reported and no bill proves it. A reported credit is not proof, so admissible credit stays at zero.', 'split') + creditOn(ctx) + two(true),
    expired: () => banner('warn', 'The credit proof is too old.', 'Credit counts only with proof under 30 minutes old, so nothing counts as credit until new proof arrives.', 'clock') + tags(proposed('MP40-Q6')) + creditOn(ctx) + two(true),
    denied: () => banner('', 'Claude off.', 'No verified credit and no paid approval, so every Claude call is refused. Forecasts and figures run as usual, because Claude only explains.', 'ban') + box(`${head('Gross, credit and cash')}<div class="acosts-gap">${sumRows([['Claude gross usage', 'No calls run', '£0.00'], ['Credit applied', 'A reported credit is not proof', 'Unknown'], ['Cash', 'Nothing is spent', '£0.00']])}</div>`) + two(false)
  });
  /* Claude is on in Ready, so paid use is already approved: A35 opens only where Claude is off, which Denied draws */
  const PAID = [['Amount', 'Up to £15.00'], ['Period', 'November'], ['Scope', 'Claude and evaluations'], ['Version', 'Paid use v1'], ['Approved', '1 Nov, with a fresh sign-in']];
  const PAID_ROWS = [['Claude', 'Off', 'On'], ['A full month', '£46.48', '£54.73', 'Up to £59.73 with the scan at its cap, 27p under the £60 warning. This month has fewer days left to run.'], ['Against the plan', '', 'Inside £15', 'Inside the Claude and evaluations allocation and the £70 plan. The £100 ceiling is untouched.']];
  const PAID_BIND = [['Action', 'Approve paid cash beyond credit'], ['Amount', 'Up to £15.00'], ['Period', 'November'], ['Environment', 'Production'], ['Expected version', 'None approved yet'], ['Payload hash', 'e7d2…41b6'], ['Expires', 'Tomorrow, 18:00']];
  /* What is spent stays in the month, so withdrawing saves only what has not run: £46.48 plus the Claude gross this state shows */
  const wdRows = ctx => {
    const st = ctx.state, used = st === 'error' ? 6.71 : st === 'empty' ? 0 : 7.06, to = 46.48 + used, scan = `£54.73 is before the scan at its cap. The month's forecast, up to £59.73, falls to ${gbp(to)}.`;
    const note = st === 'error' ? `£6.71 of Claude is reported to 18:00, and later calls are not added, so at least this much. ${scan}` : used ? `${gbp(used)} of Claude is already spent, and the £0.34 hold settles or releases, so at most ${gbp(to + 0.34)}. ${scan}` : 'Nothing is spent yet, so the month is the Claude-off month.';
    return [['Claude', 'On', 'Off', 'Forecasts and figures run as usual, because Claude only explains.'], ['This month\'s forecast', '£54.73', st === 'error' ? `At least ${gbp(to)}` : gbp(to), note], ['A full month', '£54.73', '£46.48'], ['Chat and research', '', 'Unavailable', 'Each shows the reason.'], st === 'empty' ? ['Open reservations', '', 'None yet'] : ['Open reservations', '', 'Settle or release', 'Work already held reconciles, and nothing is sent twice.'], ['Paid use version', 'v1', 'v2'], ['To turn it back on', '', 'Credit or approval', CLAUDE_OFF]];
  };
  const WD_END = [['Withdrawn', 'Claude stays off until credit is verified or you approve paid use again. No paid fallback switches on by itself.'], ['Not applied', 'The write failed part way, so paid use v1 stays current and nothing was half-changed.']];
  const creditRail = ctx => {
    const s = ctx.state, y = act('A35', 'Approve paid use beyond credit', 'primary');
    if (s === 'loading') return skel(2);
    const stop = s === 'offline', wd = act('A76', 'Withdraw paid use');
    if (s === 'denied') return `${deltaCard(PAID_ROWS)}${box(`${lbl('Your decision')}<p class="small muted acosts-gap">Only you approve paid cash beyond credit. No paid fallback switches on by itself, and no agent raises spending.</p><div class="acosts-acts acosts-gap">${y}</div>${wide(ctx) ? `<p class="small acosts-gap">${STEP}</p>` : ''}`)}${box(`${lbl('This approval is bound to')}<div class="acosts-gap">${kv(PAID_BIND)}</div>${tags(proposed('CT-02'), proposed('CT-13'))}`)}${box(`${lbl('Claude off')}${p('Claude off: the month forecast is £46.48.')}`)}`;
    return `${box(`${head('Paid use', chip('fresh', 'Approved'))}<div class="acosts-gap">${kv(PAID)}</div><p class="small muted acosts-gap">Already approved for November, so this stays shut. It opens when Claude is off. No paid fallback switches on by itself, and no agent raises spending.</p><div class="acosts-acts acosts-gap">${off(y)}</div>${s === 'offline' ? `<div class="acosts-gap">${refused('R16', OFFLINE)}</div>` : ''}<div class="acosts-gap">${stop ? off(wd) : wd}</div>${s === 'error' ? p('This stays open while the collector is down, because withdrawing can only lower spend.') : ''}${tags(proposed('CT-13'), proposed('MP40-Q6'))}`)}${deltaCard(wdRows(ctx), 'If you withdraw paid use')}${ends(WD_END)}`;
  };

  /* ---------- the lines and allocations (MP-103): code applies them, only you change one ---------- */
  const RUNGS = [['£60', 'Warn', 'A notice reaches you. Nothing stops.'], ['£75', 'Reduce', 'Fewer optional backfills, challenger models and Claude jobs.'], ['£85', 'Pause', 'New optional paid work pauses, and each pause shows its reason.'], ['£100', 'Ceiling', 'The limit of the month. It is not an instant AWS shut-off: hard caps on requests, concurrency, timeouts and retention back it.']];
  const firstOf = s => ({ loading: 'Last good: 27p away', empty: 'Plan: 27p away', error: 'Estimated: 27p away', partial: 'Estimated: 27p away', conflict: 'Reached' }[s] || '27p away');
  const rungs = ctx => box(`${head('The lines')}${RUNGS.map(([v, t, s], i) => { const f = i === 0 ? firstOf(ctx.state) : 'Not reached'; return `<div class="acosts-rung"><span class="v">${v}</span><span class="t">${t}</span><span class="chip ${f === 'Reached' ? 'stale' : 'illus'}">${f}</span><p>${s}</p></div>`; }).join('')}<p class="small muted acosts-gap">The £100 ceiling is not a control here. Changing it is your decision, with a revised cost model. If you join the Developer Program, its fee month shows the fee as the one allowed exception, and optional work is judged on the month without it.</p>`);
  const mini = (c, used, of) => `<span class="acosts-mini" aria-hidden="true"><i style="--c:var(${c});width:${Math.min(100, (used / of) * 100).toFixed(1)}%"></i></span>`;
  const ALLOC = ctx => {
    const s = ctx.state, e = s === 'empty', bad = s === 'error';
    return [['Market data', '£27.84', 30, 27.84, D, 'Forecast £27.84'], ['AWS', s === 'conflict' ? '£11.49' : bad ? 'At least £9.85' : e ? 'None yet' : '£11.18', 22, s === 'conflict' ? 11.49 : bad ? 9.85 : e ? 0 : 11.18, A, s === 'conflict' ? 'Forecast £18.95' : 'Forecast £18.64'], ['Claude and evaluations', bad ? '£6.71' : e ? 'None yet' : '£7.06', 15, bad ? 6.71 : e ? 0 : 7.06, C, 'Forecast £13.24'], ['Forecast and price uncertainty', 'Held', 3, 0, H, 'Not spent as a line']];
  };
  const allocs = ctx => box(`${head('Allocations', illus())}${ALLOC(ctx).map(([t, v, of, u, c, f]) => `<div class="acosts-alloc"><div class="acosts-row"><span class="small acosts-w">${t}</span><b>${v} <span class="muted">of £${of}</span></b></div>${mini(c, u, of)}<span class="small muted">${f}</span></div>`).join('')}<div class="acosts-alloc"><div class="acosts-row"><span class="small acosts-w">Top-5 scan</span><b>${ctx.state === 'empty' ? 'None yet' : '£2.12'} <span class="muted">of the £5 cap</span></b></div>${mini(C, ctx.state === 'empty' ? 0 : 2.12, 5)}<span class="small muted">A batch that could cross £5 is refused.</span></div><p class="small muted acosts-gap">Plan £70: £30 + £22 + £15 + £3. Reserve £30, untouched. Planning ceilings, not separate pots. Forecasts are rounded to the penny.</p>`);
  const never = () => box(`${head('Never paused')}${tags(...['Sign-in', 'Ledger reads', 'Audit', 'Recovery'].map(t => chip('fresh', t)))}<p class="small muted acosts-gap">These stay available at every threshold.</p>`);
  const budVersions = ctx => {
    const rb = act('A34', 'Roll back to v1'), shut = ['offline', 'denied', 'error', 'partial'].includes(ctx.state);
    return `${sec('Versions', illus())}${list(item(lead('check', 'rise'), 'v2 · current', 'Warn £60 · reduce £75 · pause £85 · the allocations above', chip('fresh', 'Current')) + item(lead('layers'), 'v1 · previous', 'The same lines · AWS £23 · Claude and evaluations £14 · kept with its own record', chip('', 'Kept'), shut ? off(rb) : rb))}${deltaCard([['AWS allocation', '£22', '£23'], ['Claude and evaluations', '£15', '£14'], ['The £70 plan', '', 'Unchanged', '£30 + £23 + £14 + £3.'], ['error', 'partial'].includes(ctx.state) ? ['Against the month', '', 'Not checked', 'A missing check is never a pass.'] : ['Against the month', '', 'Fits', `Forecast AWS ${ALLOC(ctx)[1][5].replace('Forecast ', '')} and Claude ${ALLOC(ctx)[2][5].replace('Forecast ', '')} stay inside both.`]], 'If you roll back to v1')}${['error', 'partial'].includes(ctx.state) ? p('Rolling back waits until the billing records load.') : ''}${p('A rollback makes a new version equal to the old one, with its own audit record. Nothing is overwritten.')}`;
  };
  const budgetBase = ctx => rungs(ctx) + allocs(ctx) + budVersions(ctx);
  const budgetCore = ctx => ONE() + region(ctx, {
    what: 'Budgets', rows: 4, ok: () => budgetBase(ctx),
    empty: () => banner('', 'New month.', 'The lines and allocations carry over. Spend starts again, and nothing is counted until it is collected.', 'clock') + budgetBase(ctx),
    partial: () => banner('warn', 'Partly estimated.', 'The AWS collection reached the page cap, so the first line is judged on an estimate.', 'clock') + budgetBase(ctx),
    error: () => stateCard('alert', 'The collector failed at 06:10', 'The lines still apply on the last reconciled figures and the estimates. Nothing is cut silently.', '', chip('stale', 'Stale · 39 h old', 'clock')) + budgetBase(ctx),
    stale: () => banner('warn', 'Stale billing: optional admission blocked.', 'AWS billing is 39 hours old. Past 36, optional work waits until it is reconciled. Essentials keep running.', 'clock') + tags(proposed('MP40-Q6')) + budgetBase(ctx),
    offline: () => banner('', 'Offline.', 'The lines hold on the server, not on this device.', 'wifi-off') + budgetBase(ctx),
    conflict: () => banner('warn', 'The bill reached the first line.', '17 Nov: estimate £0.71, bill £1.02. The bill counts, so the forecast is up to £60.04 and the £60 warning has reached you. Nothing stops.', 'split') + budgetBase(ctx),
    expired: () => banner('warn', 'A change passed its time.', 'Moving the warning line to £55 was not approved in time, so nothing changed. The lines below are in force.', 'clock') + tags(proposed('CT-02')) + budgetBase(ctx),
    denied: () => banner('warn', 'A fresh sign-in is needed to change these.', OLD, 'lock') + budgetBase(ctx)
  });
  const budgetRail = ctx => {
    const s = ctx.state, y = act('A58', 'Change a line', 'primary');
    if (s === 'loading') return skel(2);
    const live = s !== 'offline';
    return `${box(`${lbl('Change a line')}<p class="small muted acosts-gap">Code applies the lines. Only you change one, and each change writes a new version and an audit record. The next screen takes the line or allocation and its new value, then shows what would change before you approve. The meter in the main app stays read-only.</p><div class="acosts-acts acosts-gap">${live ? y : off(y)}</div>${s === 'offline' ? `<div class="acosts-gap">${refused('R16', OFFLINE)}</div>` : ''}${s === 'denied' && wide(ctx) ? `<div class="acosts-gap">${btn('Sign in again', 'primary', 'lock')}</div>` : ''}${tags(proposed('CT-13'))}`)}${never()}${refused('R14', 'No setting can give a Claude route a budget. A route budget needs a reviewed change and your approval, in Agents.')}`;
  };

  /* ---------- changing a line (MP-103, MP-114): draft it, code checks it, you decide. The same shape as a settings proposal. The worked example moves the warning to £55 ---------- */
  const CH_ROWS = [['Warn line', '£60', '£55'], ['Budgets version', 'v2', 'v3']];
  const CH_WHY = [['Against the month', '', '£4.73 past it', 'Forecast up to £59.73 would pass £55, so a notice reaches you. Nothing stops.'], ['Against £100 and the plan', '', 'Unchanged', 'The £100 ceiling, the £70 plan, the £30 reserve, £75 and £85 stay as they are.'], ['Evidence', '', 'This month\'s forecast', 'Up to £59.73, from the saved figures to 21:15.'], ['Allowed range', '', 'Below £75', `Inside the £100 ceiling. No record sets a range.${tags(proposed('CT-13'))}`], ['Cost a month', '', '£0'], ['How to roll it back', '', 'A new version', 'A rollback makes v4 equal to v2, with its own record. Nothing is overwritten.']];
  const WHY_T = 'Impact, evidence, cost and rollback';
  const CH_END = [['Approved', 'Applied with your fresh sign-in. Budgets v3 keeps v2 as its previous version.'], ['Not now', 'Your draft stays until it expires. Nothing changes.'], ['Approved, not applied', 'The write failed part way, so Budgets v2 stays current. Your approval holds, for a retry inside its window.']];
  const CH_BIND = [['Owner', 'You'], ['Environment', 'Production'], ['Setting', 'Warn line'], ['Value', '£55'], ['Current version', 'Budgets v2'], ['Payload hash', '5e2c…a7f1'], ['Expires', 'Tomorrow, 18:00']];
  const chHead = (c = chip('stale', 'Expires tomorrow 18:00', 'clock')) => box(`<div class="acosts-row"><b>Move the warning line</b>${illus('Example')}</div>${p('£60 to £55 · you drafted this')}${tags(c, proposed('CT-02'))}`, 'display:grid;gap:6px');
  const chain = () => `<div class="acosts-chain" role="list" aria-label="Who did what" data-mo="rise"><div role="listitem">${ic('person', 's16')}<span>You drafted</span></div><div role="listitem">${ic('check', 's16')}<span>Code checked</span></div><div role="listitem" class="me">${ic('person', 's16')}<span>You decide</span></div></div>`;
  const LINES_TO = ['Warn line, £60', 'Reduce line, £75', 'Pause line, £85', 'Market data, £30', 'AWS, £22', 'Claude and evaluations, £15', 'Forecast and price uncertainty, £3'];
  const draftCard = (ctx, o = {}) => box(`${lbl('Your change')}<div class="acosts-form">${fieldOf(ctx, 'Line or allocation', `<select aria-label="Line or allocation"${shutField(ctx, o.dead)}>${LINES_TO.map((t, i) => `<option${i === 0 ? ' selected' : ''}>${t}</option>`).join('')}</select>`)}${fieldOf(ctx, 'New value', `<input type="text" value="£55" aria-label="New value"${shutField(ctx, o.dead)}>`)}${fieldOf(ctx, 'Why', `<input type="text" value="An earlier notice" aria-label="Why"${shutField(ctx, o.dead)}>`)}</div><div class="acosts-acts acosts-gap">${o.run || act('A58', 'Run the check', 'tinted', 'refresh')}</div><p class="small muted acosts-gap">Only the warning line is worked here. What code checks for an allocation is open.</p>${tags(proposed('CT-13'))}`);
  const chOk = (ctx, o) => draftCard(ctx, o) + chHead() + chain() + deltaCard(CH_ROWS) + deltaCard(CH_WHY, WHY_T);
  const again = ctx => draftCard(ctx, { dead: true, run: act('A58', 'Draft it again', 'primary') });
  const changeCore = ctx => region(ctx, {
    what: 'This change', rows: 3, ok: () => chOk(ctx),
    loading: () => chHead('<span class="chip"><span class="spin" aria-hidden="true"></span>Loading</span>') + skel(2),
    empty: () => box(`${head('Applied. The warning line is £55.', chip('fresh', 'Applied'))}${p('Applied with your fresh sign-in. Budgets v3 keeps v2 as its previous version.')}<div class="acosts-acts">${act('A34', 'Roll back to v2')}</div>`, 'display:grid;gap:10px') + deltaCard(CH_ROWS, 'What changed'),
    partial: () => banner('warn', 'Partly checked.', 'The AWS collection reached the page cap, so the impact is on an estimate and this cannot be approved yet. A missing check is never a pass.', 'clock') + draftCard(ctx) + chHead() + deltaCard(CH_ROWS) + deltaCard([['Against the month', '', 'Not checked', 'A missing check is never a pass.'], CH_WHY[1], ['Evidence', '', 'Not checked', 'The forecast rests on the part the cap stopped.'], ...CH_WHY.slice(3)], WHY_T),
    error: () => box(`${head('Approved, not applied', chip('stale', 'Not applied', 'clock'))}${p('The write failed part way, so Budgets v2 stays current and nothing was half-changed. Your approval holds, for a retry inside its window.')}<div class="acosts-acts">${act('A34', 'Try this change again', 'primary')}</div>`, 'display:grid;gap:10px') + deltaCard(CH_ROWS, 'What this proposed'),
    stale: () => banner('warn', 'Billing 39 h old.', 'The impact uses old billing. This rechecks itself before it applies.', 'clock') + chOk(ctx),
    offline: () => banner('', 'Offline.', 'You can read this change. Approving needs a connection and a fresh sign-in.', 'wifi-off') + chOk(ctx, { dead: true, run: off(act('A58', 'Run the check', 'tinted', 'refresh')) }),
    conflict: () => banner('warn', 'Refused for a stale version.', 'Budgets v3 was written on your iPad, so this change against v2 is refused. Nothing changed here.', 'split') + again(ctx) + chHead(chip('error', 'Refused', 'x')) + deltaCard(CH_ROWS, 'What this proposed'),
    expired: () => banner('warn', 'Expired at 18:00.', 'An expired change cannot be approved, and nothing changed. Budgets v2 stays current.', 'clock') + again(ctx) + chHead(chip('stale', 'Expired', 'clock')) + deltaCard(CH_ROWS, 'What this proposed'),
    denied: () => banner('warn', 'A fresh sign-in is needed.', OLD, 'lock') + chOk(ctx)
  });
  const changeRail = ctx => {
    const s = ctx.state, y = act('A34', 'Approve this change', 'primary');
    if (s === 'loading') return skel(2);
    if (s === 'empty' || s === 'error') return box(`${lbl('Your decision')}${p(s === 'empty' ? 'Already decided.' : 'Your approval holds. The previous version stays current until this applies.')}`) + never();
    if (s === 'conflict' || s === 'expired') return `${box(`${lbl('Your decision')}<p class="small muted acosts-gap">${s === 'expired' ? 'An expired change cannot be approved.' : 'Refused against v2. Nothing to decide on it.'}</p><div class="acosts-acts acosts-gap">${off(y)}</div>`)}${box(`${lbl('What this proposed')}<div class="acosts-gap">${kv(CH_BIND.map(r => (r[0] === 'Expires' && s === 'expired' ? [r[0], 'Expired'] : r)))}</div>${tags(proposed('CT-02'), proposed('CT-13'))}`)}${box(`${lbl('The ceiling')}${p('The £100 ceiling is not a control here.')}`)}`;
    const live = s === 'default' || s === 'stale';
    return `${box(`${lbl('Your decision')}<p class="small muted acosts-gap">Bound to Budgets v2 · expires tomorrow 18:00. A stale, replayed or expired approval is refused.</p><div class="acosts-acts acosts-gap">${live ? y : off(y)}${bs('Not now', 'plain')}</div><p class="small muted acosts-gap">Not now keeps your draft until it expires. Nothing changes.</p>${s === 'offline' ? `<div class="acosts-gap">${refused('R16', OFFLINE)}</div>` : ''}${wide(ctx) ? `<p class="small acosts-gap">${STEP}</p>` : ''}${s === 'denied' && wide(ctx) ? `<div class="acosts-gap">${btn('Sign in again', 'primary', 'lock')}</div>` : ''}`)}${box(`${lbl('This approval is bound to')}<div class="acosts-gap">${kv(CH_BIND)}</div>${tags(proposed('CT-02'), proposed('CT-13'))}`)}${ends(CH_END)}${box(`${lbl('The ceiling')}${p('The £100 ceiling is not a control here.')}`)}`;
  };

  /* ---------- from a spike: every line of the month, largest first. They add up to the month ---------- */
  const MOVES = [['Twelve Data invoice', 'Market data · fixed, due on the 1st', 27.84, D], ['AWS prod', 'AWS · to 17 Nov, then estimates', 7.80, A], ['AWS dev', 'AWS', 2.96, A], ['Top-5 explanations', 'Claude · £2.12 of the £5 cap', 2.12, C], ['Chat and research', 'Claude', 1.64, C], ['Event analysis', 'Claude', 1.18, C], ['Evaluations', 'Claude', 1.12, C], ['Morning brief', 'Claude', 1.00, C], ['AWS shared', 'AWS', 0.42, A], ['Reserved', 'Held at worst case', 0.34, H]];
  const moveRows = (ctx, o = {}) => {
    const r = o.rows || MOVES, top = r.length ? r[0][2] : 1;
    return list(r.map(m => item('', m[0], m[1], `<span class="val">${gbp(m[2])}</span>`, `<span class="acosts-mini" aria-hidden="true"><i style="--c:var(${m[3]});width:${((m[2] / top) * 100).toFixed(1)}%"></i></span>`, m[0] === 'Top-5 explanations' && wide(ctx), true)).join('')).replace(/<div class="hrow([^"]*)"/g, '<div class="hrow acosts-nolead$1"');
  };
  const moves = (ctx, o) => `${sec('What moved the month', illus())}${moveRows(ctx, o)}<p class="small muted">Ten lines, largest first. Together they make £${MOVES.reduce((a, m) => a + m[2], 0).toFixed(2)}.</p>`;
  const CAUGHT = () => list(item(lead('ban', 'fall'), 'Top-5 batch, 14 Nov', 'Refused: £3.20 could cross the £5 cap', ic('chev-r', 's18'), '', false, true) + item(lead('clock'), 'Nightly explanations', 'Held at worst case, £0.34', ic('chev-r', 's18'), '', false, true));
  const look = (ctx, extra = '') => `${sec('Worth a look')}${extra}${CAUGHT()}`;
  const spikeRail = ctx => {
    if (ctx.state === 'loading') return skel(3);
    const add = ctx.state === 'conflict' ? list(item(lead('split', 'warn'), 'AWS, 17 Nov', 'Estimate £0.71, bill £1.02', '<span class="val">+£0.31</span>', '', false, true)) : '';
    return `${look(ctx, add)}<div class="acosts-acts">${act('A03', 'Open the top line', 'tinted', 'search')}</div>`;
  };
  const AWS_ONLY = [MOVES[0], ['AWS', 'Reconciled to 16 Nov', 9.85, A], ['Claude', 'Usage to 18:00', 6.71, C]];
  const spikeCore = ctx => ONE() + hero(ctx, { size: 34 }) + region(ctx, {
    what: 'The month', rows: 5, ok: () => moves(ctx),
    empty: () => `${sec('What moved the month', illus())}${moveRows(ctx, { rows: [MOVES[0]] })}${p('Only the data invoice so far.')}`,
    partial: () => banner('warn', 'Part of AWS is an estimate.', 'The page cap stopped the collection, so AWS after 16 Nov comes from estimates until the rest is collected.', 'clock') + moves(ctx),
    error: () => banner('fall', 'AWS stops at 16 Nov.', 'Its split by environment is not shown, and what came after is not collected. It is not £0.', 'alert') + `${sec('What moved the month', illus())}${moveRows(ctx, { rows: AWS_ONLY })}${p('£27.84 + £9.85 + £6.71 = £44.40, and what is not collected.')}`,
    stale: () => banner('warn', 'AWS is estimated after 16 Nov.', 'No new bill for 39 hours, so these AWS lines may still move.', 'clock') + moves(ctx),
    offline: () => moves(ctx),
    conflict: () => moves(ctx, { rows: [MOVES[0], ['AWS prod and dev', '£10.76, plus £0.31 from the 17 Nov bill, not yet split', 11.07, A], ...MOVES.slice(3)] }).replace(/Ten lines, largest first\. Together they make £46\.42\./, 'Nine lines, largest first. With the 17 Nov bill they make £46.73.'),
    expired: () => moves(ctx),
    denied: () => moves(ctx)
  });

  /* ---------- the line behind a spike ---------- */
  const CAL = () => banner('', 'Two calendars.', 'This screen shows the cost month, day 18 of 30. A run keeps its own clock, so the run below reads Tue 3 Nov.', 'clock');
  const capBox = (v, n) => box(`${head('Top-5 scan', `<span class="small muted">${v} of the £5 cap</span>`)}${mini(C, n, 5)}${p('A batch that could cross £5 is refused. Rankings still update, because they come from code. Only the explanations stop.')}`, 'display:grid;gap:10px');
  const lineFacts = () => box(`${lbl('How this line is known')}<div class="acosts-gap">${kv([['Route', 'Explanations and the briefing'], ['Model', 'Sonnet 5.5, in batches'], ['Estimate', 'Live, to 21:15'], ['Usage', 'Every six hours, to 18:00'], ['Bill', 'No bill yet']])}</div>${tags(proposed('MP40-Q5: Anthropic admin key'))}`);
  const behind = (ctx, sub) => `${sec('Behind it')}${heldRows(ctx, sub, [0, 2])}<p class="small muted">Each reservation names its job, so a jump leads to the run that asked for it.</p>`;
  const spikeLine = ctx => region(ctx, {
    what: 'This line', rows: 3, ok: () => CAL() + capBox('£2.12', 2.12) + behind(ctx),
    empty: () => stateCard('clock', 'Nothing spent on this line yet', 'Top-5 explanations start with the first nightly run. Claude usage arrives within six hours.') + capBox('None yet', 0),
    partial: () => banner('warn', 'Part of this line is missing.', 'The run behind the 14 Nov batch has no linked trace: sampled out, durable record only.', 'clock') + CAL() + capBox('£2.12', 2.12) + behind(ctx),
    error: () => banner('fall', 'The AWS collector failed at 06:10.', 'Claude usage runs to 18:00, so this line still reads. The cap holds on the server.', 'alert') + CAL() + capBox('£2.12', 2.12) + behind(ctx),
    stale: () => banner('warn', 'Usage may be behind.', 'This line is usage and estimate, and neither is a bill yet. It may still move.', 'clock') + CAL() + capBox('£2.12', 2.12) + behind(ctx),
    offline: () => banner('', 'Offline.', 'From saved figures. The cap holds on the server, not on this device.', 'wifi-off') + CAL() + capBox('£2.12', 2.12) + behind(ctx),
    conflict: () => banner('warn', 'Two jobs reached for the same cap.', 'At most one reservation succeeds, so one job waits. Settlement replaces a hold and never adds to it.', 'split') + CAL() + capBox('£2.12', 2.12) + behind(ctx),
    expired: () => banner('warn', 'The hold passed its time.', 'Nightly explanations stay at £0.34 until reconciled.', 'clock') + CAL() + capBox('£2.12', 2.12) + behind(ctx, { c0: chip('stale', 'cancel_pending', 'clock') }),
    denied: () => banner('', 'Refused by code.', 'A reservation that would cross the cap is refused before the work starts, whoever asks. No sign-in changes that.', 'ban') + CAL() + capBox('£2.12', 2.12) + behind(ctx)
  });
  const spikeLineRail = ctx => (ctx.state === 'loading' ? skel(2) : `<div class="acosts-acts">${act('A03', 'Open the run behind it', 'tinted', 'refresh')}</div>${lineFacts()}`);

  /* ---------- the run behind it (GAP-CT-05 names what a run links). This screen is on the run's clock ---------- */
  const RUNCAL = () => banner('', 'This shows the run\'s clock, Tue 3 Nov.', 'The hold of £0.34 is from the illustrative cost month, day 18 of 30. The two are not the same day.', 'clock');
  const runKv = (o = {}) => box(`${lbl('Forecast run')}<div class="acosts-gap">${kv([['Run', 'run_8d02'], ...(o.failed ? [] : [['Started', 'Tue 3 Nov, 21:15']]), ['Data cutoff', '22:00'], ['Priced', o.p || '3 of 3'], ['Result', o.r || 'Succeeded'], ['Collect job', 'job_3e9a'], ['Trace', o.tr || 'tr_51c2'], ['Environment', 'Production']])}</div>`);
  const runLinks = (failed = false) => box(`${lbl(failed ? 'What it was due to run with' : 'What it ran with')}<div class="acosts-gap">${kv([['Settings', 'v9'], ['Catalogue', 'v14'], [failed ? 'Due to use' : 'Models', 'R2-HGB v3, R1-LGB v1'], ['Release', 'rel_0031'], ['Cost reservation', 'Nightly explanations, £0.34']])}</div><div class="acosts-gap">${bs('Open in Runs and health', 'tinted', 'refresh')}</div>`);
  const runCore = ctx => region(ctx, {
    what: 'This run', rows: 3, ok: () => RUNCAL() + runKv() + runLinks(),
    empty: () => stateCard('refresh', 'No run behind this yet', 'A new month has no run to link. The first forecast run appears here with its job, trace and reservation.', bs('Open in Runs and health', 'tinted', 'refresh')),
    partial: () => banner('warn', 'Sampled out.', 'The trace was sampled out, so this reads from the durable record only. The record stays complete.', 'clock') + RUNCAL() + runKv({ tr: 'tr_51c2, sampled out' }) + runLinks(),
    error: () => stateCard('alert', 'This run failed', 'Twelve Data failed at 21:16. Last good run Mon 22:15 · cutoff 22:00. Its hold releases only what is confirmed unspent.', '', chip('', 'req_a90f') + chip('error', 'inc_0013', 'alert')) + RUNCAL() + runKv({ failed: true, r: 'Failed at 21:16', p: 'Not finished' }) + runLinks(true),
    stale: () => banner('warn', 'Index lagging.', 'This run is from 11:12, and a later one may exist. Tonight 21:15 is the next.', 'clock') + RUNCAL() + runKv() + runLinks(),
    offline: () => banner('', 'Offline.', 'From saved records. Nothing here can be replayed or changed from this screen.', 'wifi-off') + RUNCAL() + runKv() + runLinks(),
    conflict: () => banner('warn', 'The hold settled while you read.', 'Usage replaced the £0.34 hold. Settlement replaces a reservation and never adds to it, so the month does not count it twice.', 'split') + RUNCAL() + runKv() + runLinks(),
    expired: () => banner('warn', 'Expired by retention.', 'Read later, this trace is past its 30 days. The durable run record stays, and so do its ids.', 'clock') + RUNCAL() + runKv({ tr: 'tr_51c2, expired by retention' }) + runLinks(),
    denied: () => banner('', 'Reads stay open.', 'A broad replay needs your approval, in Incidents and recovery. Reading this run needs none.', 'eye-off') + RUNCAL() + runKv() + runLinks()
  });

  const covers = (a, b, c) => ({ compare: a, decide: b, source: c.source, correct: c.correct, config: c.config, cost: a, recover: c.recover });
  J.add({
    id: 'costs', title: 'Costs and budgets',
    stories: ['MP-89', 'MP-100', 'MP-90', 'MP-103', 'MP-142', 'MP-42', 'MP-112'],
    summary: 'Reconcile the month line by line, trace a jump to what caused it, and change a line with a fresh sign-in. Cost stays one tap from the main app as well as here (MP-142).',
    options: [{
      id: 'a', name: 'Side by side', rec: true,
      why: 'The owner cost view already shows the month, so admin answers what it cannot: does each line tie, and how old is it. Estimate, usage and bill stay apart on one table, and every column adds up to the month.',
      cost: 'A jump has no starting point here. You find it by reading the lines, then open one to reach its runs.',
      covers: covers('ca-lines', 'ca-change', { source: 'ca-line', correct: 'ca-line', config: 'ca-change', recover: 'ca-budget' }),
      screens: [{
        id: 'ca-lines', title: 'Line by line', note: 'Dates here are the illustrative cost month, day 18 of 30. The records chip above the screen is admin\'s own clock.',
        render: ctx => cp(ctx, { title: 'Costs', back: 'Admin', body: `${ONE()}${hero(ctx)}${lines(ctx)}${doors()}${lanes(ctx)}` })
      }, {
        id: 'ca-line', title: 'One line, to the day', note: 'AWS by day: the bill, then estimates since. Opening a line is how this option reaches its runs.',
        render: ctx => cp(ctx, { title: 'AWS', back: 'Costs', body: lineCore(ctx), rail: lineRail(ctx) })
      }, {
        id: 'ca-held', title: 'What is held', note: 'Reservations and what committed adds up to. Refused work is listed, and it adds nothing to the month.',
        render: ctx => cp(ctx, { title: 'Held', back: 'Costs', body: heldCore(ctx), rail: encCard(ctx) })
      }, {
        id: 'ca-credit', title: 'Claude, credit and cash', note: 'Denied shows Claude off: no verified credit and no paid approval.',
        render: ctx => cp(ctx, { title: 'Credit', back: 'Costs', body: creditCore(ctx), rail: creditRail(ctx) })
      }, {
        id: 'ca-budget', title: 'Lines and allocations', note: 'Budget changes live here, in admin under Settings (the owner, 4 November 2026), so the Settings wording on the owner cost journey stays true.',
        render: ctx => cp(ctx, { day: ctx.state === 'expired' ? 19 : 0, title: 'Budgets', back: 'Costs', body: budgetCore(ctx), rail: budgetRail(ctx) })
      }, {
        id: 'ca-change', title: 'Change a line', note: 'You pick the line or allocation and its value, code checks it, then you decide. The £55 is an example. Empty draws it applied, Failed part way, Conflicting refused. Expired reads as a later moment, past tomorrow 18:00.',
        render: ctx => cp(ctx, { asReady: ['empty', 'error'].includes(ctx.state), day: ctx.state === 'expired' ? 19 : 0, title: 'Change a line', back: 'Budgets', body: changeCore(ctx), rail: changeRail(ctx) })
      }]
    }, {
      id: 'b', name: 'From a spike',
      why: 'Admin is opened when something looks wrong, so this starts from what moved the month and drills to the jobs and the run behind it. Three taps from a figure to its evidence.',
      cost: 'Reconciling is one step in, and the records give no spike threshold, so it ranks lines by size rather than flagging a jump.',
      covers: covers('cb-spikes', 'cb-change', { source: 'cb-run', correct: 'cb-spikes', config: 'cb-change', recover: 'cb-budget' }),
      screens: [{
        id: 'cb-spikes', title: 'What moved the month', note: 'No record sets a spike threshold, so nothing is flagged by a number: lines are ranked by size.',
        render: ctx => cp(ctx, { title: 'Costs', back: 'Admin', body: `${spikeCore(ctx)}${sec('Does it tie')}${lines(ctx)}`, rail: `${spikeRail(ctx)}${lanes(ctx)}` })
      }, {
        id: 'cb-line', title: 'The line behind it', note: 'Says which calendar it shows, because it joins the cost month to a run.',
        render: ctx => frame(ctx, { title: 'Top-5 scan', back: 'Costs', body: spikeLine(ctx), rail: spikeLineRail(ctx) })
      }, {
        id: 'cb-run', title: 'The run behind it', note: 'The ids are admin\'s. This screen is on the run\'s clock, and says so.',
        render: ctx => frame(ctx, { title: 'run_8d02', back: 'Top-5 scan', body: runCore(ctx), rail: ctx.state === 'loading' ? '' : encCard(ctx) })
      }, {
        id: 'cb-credit', title: 'Claude, credit and cash', note: 'Denied shows Claude off: no verified credit and no paid approval.',
        render: ctx => cp(ctx, { title: 'Credit', back: 'Costs', body: creditCore(ctx), rail: creditRail(ctx) })
      }, {
        id: 'cb-budget', title: 'Lines and allocations', note: 'Budget changes live here, in admin under Settings (the owner, 4 November 2026), so the Settings wording on the owner cost journey stays true.',
        render: ctx => cp(ctx, { day: ctx.state === 'expired' ? 19 : 0, title: 'Budgets', back: 'Costs', body: budgetCore(ctx), rail: budgetRail(ctx) })
      }, {
        id: 'cb-change', title: 'Change a line', note: 'You pick the line or allocation and its value, code checks it, then you decide. The £55 is an example. Empty draws it applied, Failed part way, Conflicting refused. Expired reads as a later moment, past tomorrow 18:00.',
        render: ctx => cp(ctx, { asReady: ['empty', 'error'].includes(ctx.state), day: ctx.state === 'expired' ? 19 : 0, title: 'Change a line', back: 'Budgets', body: changeCore(ctx), rail: changeRail(ctx) })
      }]
    }]
  });
}
