/* Forecast: one instrument, how far to trust it and why (MP-145, MP-157, MP-155, MP-137, MP-151).
   Option A shows one horizon at a time; Option B shows every horizon at once. Both compose the modules below.
   3 and 12 months and the short-term figures are derived from the shared 6-month range for this page. Illustrative. */
(() => {
const isWide = ctx => ctx.kind === 'ipad' || ctx.kind === 'web';
const A = byT.AAPL;
const scaled = (h, f) => { const r = v => +v.toFixed(1), s = Math.sqrt(f), m = h.med * f; return { ...h, med: r(m), lo: r(m - (h.med - h.lo) * s), hi: r(m + (h.hi - h.med) * s), lo50: r(m - (h.med - h.lo50) * s), hi50: r(m + (h.hi50 - h.med) * s) }; };
const LONG = [
  { k: 3, n: '3 months', f: scaled(A, .5), held: 81, scored: 104, blocks: 44 },
  { k: 6, n: '6 months', f: A, held: 79, scored: 52, blocks: 22 },
  { k: 12, n: '12 months', f: scaled(A, 2), held: 77, scored: 26, blocks: 11 }
];
const SHORT = [
  { n: 'Next day', state: 'rules' }, { n: '5 sessions', state: 'practice' },
  { n: '10 sessions', state: 'eligible', f: scaled(A, 1 / 12), held: 80, scored: 412 },
  { n: '20 sessions', state: 'eligible', f: scaled(A, 1 / 6), held: 78, scored: 208 }
];
const GOLD = { c: '--seg-metals', lg: 'Au' };
const money0 = v => '£' + Math.round(v).toLocaleString('en-GB');

/* small modules */
const pill = (cls, icon, t) => `<span class="chip ${cls}" data-mo="chip">${ic(icon, 's14')}${t}</span>`;
const cw = (ctx, phone, wide) => (isWide(ctx) ? wide : phone);
const stateChip = s => ({
  eligible: pill('fc', 'fan', 'Evaluated model'),
  rules: `<span class="chip proposed fc-st" data-mo="chip"><span class="dot"></span>Rules only</span>`,
  practice: pill('', 'clock', 'In practice'),
  exploratory: `<span class="chip proposed" data-mo="chip"><span class="dot"></span>Exploratory</span>`
}[s]);
function bar(f, o = {}) {
  const w = o.w || 220, ht = o.ht || 16, min = o.min ?? -24, max = o.max ?? 40;
  const x = v => ((v - min) / (max - min)) * w, y0 = 2, y1 = ht - 2;
  return `<svg class="cx" viewBox="0 0 ${w} ${ht}" width="100%" height="${ht}" preserveAspectRatio="none" role="img" aria-label="${o.label || 'Forecast'}: median ${pct(f.med)}, 80% range ${pct(f.lo)} to ${pct(f.hi)}" style="height:${ht}px"><rect x="0" y="${ht / 2 - 1}" width="${w}" height="2" rx="1" style="fill:var(--surface-3)"/><rect class="b80" x="${x(f.lo)}" y="${y0}" width="${x(f.hi) - x(f.lo)}" height="${y1 - y0}" rx="4"/><rect class="b50" x="${x(f.lo50 ?? f.lo)}" y="${y0 + 2}" width="${x(f.hi50 ?? f.hi) - x(f.lo50 ?? f.lo)}" height="${y1 - y0 - 4}" rx="3"/><rect x="${x(0) - .5}" y="0" width="1" height="${ht}" style="fill:var(--ink-2)"/><rect x="${x(f.med) - 1.25}" y="${y0 - 1}" width="2.5" height="${y1 - y0 + 2}" rx="1.25" style="fill:var(--fc-line)"/></svg>`;
}
/* price history alone: no fan, no median, for when nothing may be forecast */
function histChart(ctx, label, seed = 11) {
  const W = cw(ctx, 326, 500), Ht = cw(ctx, 170, 210), ml = 38, mr = 12, mt = 12, mb = 22;
  const pts = path({ med: 4 }, seed), lo = Math.min(...pts) - 2, hi = Math.max(...pts) + 2;
  const X = i => ml + (i / (pts.length - 1)) * (W - ml - mr), Y = v => mt + (1 - (v - lo) / (hi - lo)) * (Ht - mt - mb);
  const ticks = []; for (let t = Math.ceil(lo / 10) * 10; t <= hi; t += 10) ticks.push(t);
  return `<svg class="cx" viewBox="0 0 ${W} ${Ht}" width="100%" role="img" aria-label="${label}: 12 months of price history, no forecast. Illustrative.">${ticks.map(t => `<line class="${t === 0 ? 'zero' : 'grid'}" x1="${ml}" x2="${W - mr}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${ml - 6}" y="${Y(t) + 4}" text-anchor="end">${t === 0 ? '0%' : (t > 0 ? '+' : '−') + Math.abs(t) + '%'}</text>`).join('')}<g data-mo="draw"><path class="hist" d="${pts.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('')}"/></g><text x="${ml}" y="${Ht - 6}">Nov 2025</text><text x="${W - mr}" y="${Ht - 6}" text-anchor="end">Now</text></svg>`;
}
/* one fan out to 12 months with its three horizons marked: Option B's picture */
function ladderFan(ctx) {
  const W = cw(ctx, 326, 500), Ht = cw(ctx, 180, 240), ml = 38, mr = 52, mt = 14, mb = 22;
  const lo = -14, hi = 38, X = m => ml + (m / 12) * (W - ml - mr), Y = v => mt + (1 - (v - lo) / (hi - lo)) * (Ht - mt - mb);
  const f12 = LONG[2].f, N = 24, at = f => { const s = Math.sqrt(f); return { m: f12.med * f, u: f12.med * f + (f12.hi - f12.med) * s, d: f12.med * f - (f12.med - f12.lo) * s, u5: f12.med * f + (f12.hi50 - f12.med) * s, d5: f12.med * f - (f12.med - f12.lo50) * s }; };
  const pathOf = (a, b) => { const up = [], dn = []; for (let i = 0; i <= N; i++) { const f = i / N, c = at(f); up.push(`${X(f * 12).toFixed(1)} ${Y(c[a]).toFixed(1)}`); dn.unshift(`${X(f * 12).toFixed(1)} ${Y(c[b]).toFixed(1)}`); } return 'M' + up.join('L') + 'L' + dn.join('L') + 'Z'; };
  const ticks = [-10, 0, 10, 20, 30];
  return `<svg class="cx" viewBox="0 0 ${W} ${Ht}" width="100%" role="img" aria-label="Apple: one fan from now to 12 months. ${LONG.map(l => `${l.n}: median ${pct(l.f.med)}, 80% range ${pct(l.f.lo)} to ${pct(l.f.hi)}`).join('. ')}. Illustrative.">${ticks.map(t => `<line class="${t === 0 ? 'zero' : 'grid'}" x1="${ml}" x2="${W - mr}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${ml - 6}" y="${Y(t) + 4}" text-anchor="end">${t === 0 ? '0%' : (t > 0 ? '+' : '−') + Math.abs(t) + '%'}</text>`).join('')}<g data-mo="draw"><path class="b80" d="${pathOf('u', 'd')}"/><path class="b50" d="${pathOf('u5', 'd5')}"/><path class="med" d="M${X(0)} ${Y(0)} L${X(12)} ${Y(f12.med)}"/></g>${LONG.map(l => `<line class="now" stroke-dasharray="2 3" x1="${X(l.k)}" x2="${X(l.k)}" y1="${mt - 4}" y2="${Ht - mb}"/><circle cx="${X(l.k)}" cy="${Y(l.f.med)}" r="4" class="nowdot"/><text x="${l.k === 12 ? W - mr : X(l.k)}" y="${Ht - 6}" text-anchor="${l.k === 12 ? 'end' : 'middle'}">${l.k} months</text>`).join('')}<text class="fcl" x="${X(12) + 4}" y="${Y(f12.med) + 4}">${pct(f12.med)}</text><text class="lbl" x="${X(12) + 4}" y="${Y(f12.hi) + 12}">${pct(f12.hi)}</text><text class="lbl" x="${X(12) + 4}" y="${Y(f12.lo) + 4}">${pct(f12.lo)}</text><circle class="nowdot" cx="${X(0)}" cy="${Y(0)}" r="4.5"/><text x="${ml}" y="${Ht - 6}">Now</text></svg>`;
}

/* ---------- the instrument ---------- */
function inst(ctx) {
  if (ctx.state === 'noModel') return `<div class="fc-inst" data-mo="rise">${logo(GOLD.c, GOLD.lg)}<div style="min-width:0"><div class="nm">Gold</div><div class="small">XAU/USD · spot · Gold &amp; silver</div></div><div class="sum">$2,684.20${chg(-0.4)}</div></div>`;
  return `<div class="fc-inst" data-mo="rise">${logo(A.c, A.lg)}<div style="min-width:0"><div class="nm">Apple</div><div class="small">AAPL · XNAS · US tech · USD</div></div><div class="sum">£14,820.50${ctx.state === 'stale' ? `<span class="chg" style="color:var(--warn);justify-content:flex-end">${ic('clock', 's14')}16:35</span>` : chg(A.day)}</div></div>`;
}
const hzSwitch = (ctx, on = 1, short = false) => {
  const chip = `<button type="button" class="chip${short ? ' fc' : ''}" aria-pressed="${short}">${ic('clock', 's14')}Short-term</button>`;
  const items = isWide(ctx) ? ['3 months', '6 months', '12 months'] : [['3M', '3 months'], ['6M', '6 months'], ['12M', '12 months']];
  const sw = seg(items, on, 'Forecast horizon', 'full');
  return `<div class="fc-hz${short ? ' off' : ''}" data-mo="rise">${short ? sw.replace('aria-pressed="true"', 'aria-pressed="false"') : sw}${chip}</div>`;
};
const calib = (l = LONG[1]) => `<div class="fc-sub" style="margin-top:6px" data-mo="fade">In plain words: about 8 in 10 outcomes like this should land inside the 80% range. It held ${l.held}% of the time over ${l.scored} scored forecasts.</div>`;
const skelFc = (lbl = '6-month forecast · AAPL') => `<div class="card fcard" data-mo="card"><div class="label">${lbl}</div><span class="sk" style="height:40px;width:128px;margin-top:8px"></span><span class="sk" style="height:14px;width:62%;margin-top:10px"></span><span class="sk" style="height:150px;margin-top:12px"></span><div class="fmeta"><span>Last good forecast 21:15</span><span>Data cutoff 21:00</span></div></div>`;
const fcCardOf = (ctx, opts = {}) => `<div class="card fcard" data-mo="card">${fcard(A, { w: cw(ctx, 326, 500), h: cw(ctx, 186, 236), seed: 11, inter: isWide(ctx), ...opts })}${calib()}${fcTable(A)}</div>`;
const twoRanges = () => `<div class="card fcard" data-mo="card"><div class="fh"><div class="label">6-month forecast · AAPL</div>${pill('', 'split', 'Models disagree')}</div><p class="fc-sub" style="margin-top:6px">The approved model and the baseline differ on direction. Both show on one scale, and no action is ranked.</p><div class="fc-kv" style="margin-top:10px"><span>R2-HGB v3, median</span><b>${pct(A.med)}</b></div><div style="margin-top:4px">${bar(A, { label: 'R2-HGB v3' })}</div><div class="fc-kv" style="margin-top:10px"><span>Baseline, median</span><b>${pct(-2.4)}</b></div><div style="margin-top:4px">${bar({ med: -2.4, lo: -15.5, hi: 11.2, lo50: -8.9, hi50: 4.2 }, { label: 'Baseline' })}</div><div class="fmeta"><span>As of 21:15 London</span><span>Data cutoff 21:00</span><span>Illustrative</span></div></div>`;
function forecastMain(ctx) {
  return region(ctx, {
    what: 'This forecast',
    ok: () => fcCardOf(ctx),
    loading: () => skelFc(),
    empty: () => stateCard('fan', 'No forecast yet', 'Apple joined your list today. Its first forecast comes from the next daily run, after tomorrow\'s close. Price history shows now.', '', '<span class="chip">Next run tomorrow 21:15</span>') + `<div class="card fcard" data-mo="card"><div class="label">Price history · 12 months</div><div style="margin-top:8px">${histChart(ctx, 'Apple')}</div></div>`,
    error: () => banner('fall', 'This forecast did not load.', 'Twelve Data failed at 21:14. The forecast from 20:45 stays here, labelled with its time.', 'alert') + `<div>${btn('Try again', 'tinted', 'refresh')}</div>` + fcCardOf(ctx).replace('As of 21:15 London', 'As of 20:45 London'),
    stale: () => banner('warn', 'Held, not current.', 'An input stopped at 16:35, so this forecast is the last one issued. Its action pauses until prices return.', 'clock') + fcCardOf(ctx),
    offline: () => banner('', 'Saved at 21:15.', 'This is the forecast on your device, not fresh analysis. Nothing updates until you reconnect.', 'wifi-off') + fcCardOf(ctx),
    noModel: () => stateCard('ban', 'Forecast unavailable', 'No forecast at any horizon for gold, while its valuation convention is open (SCI-D08). Price history still shows.', '', pill('', 'ban', 'Unavailable at all 7 horizons')) + `<div class="card fcard" data-mo="card"><div class="label">Price history · 12 months · not a forecast</div><div style="margin-top:8px">${histChart(ctx, 'Gold', 29)}</div><div class="fmeta"><span>Yahoo · as of 21:15 London</span><span>Illustrative</span></div></div>`,
    disagreement: () => twoRanges(),
    abstention: () => stateCard('ban', 'The model abstained', 'Too little comparable history for a calibrated 6-month range, so no range is shown. Nothing stands in for it.', '', pill('', 'ban', 'Abstained · no range shown')) + `<div class="card fcard" data-mo="card"><div class="label">Price history · 12 months · not a forecast</div><div style="margin-top:8px">${histChart(ctx, 'Apple')}</div></div>`
  });
}
function actionCard(ctx) {
  const st = ctx.state, wrap = (a, txt) => `<div class="card fc-card" data-mo="card"><div class="fc-vh">${a}<h4>Ranked action</h4><span class="chip illus">Decision support</span></div><p class="fc-sub">${txt}</p></div>`;
  const none = '<span class="chip">No action</span>';
  return ({
    loading: wrap('<span class="sk" style="height:26px;width:72px"></span>', 'Stays hidden until its reasons load.'),
    empty: wrap(none, 'No forecast yet, so no action.'),
    stale: wrap(pill('stale', 'clock', 'Stale'), 'Hold was published before an input went stale. It is held, not current, until the next ranking run.'),
    noModel: wrap(none, 'Gold and silver are not ranked (SCI-D08), so no action exists. Nothing is implied.'),
    disagreement: wrap(pill('', 'split', 'Conflicted'), 'No action is ranked while the two disagree. The decision is yours, outside MyPrediction.'),
    abstention: wrap(none, 'No range, so no action. Apple is not ranked until the model qualifies again.')
  })[st] || wrap(badge('Hold'), `Apple is 17.5% of the portfolio. The median is positive, but the 80% range still includes a loss of 9.8%. Illustrative.`);
}
const LINKS = [['fan', 'Short-term', '1 to 20 sessions, kept apart'], ['split', 'Rules, models and Claude', 'Three views side by side'], ['scenario', 'Scenarios', '3 and 5 years, no likelihood'], ['layers', 'Evidence trail', 'Source to outcome']];
const linksCard = () => `<div class="card" data-mo="card">${LINKS.map(([i, t, s]) => `<div class="fc-link">${ic(i, 's18')}<span>${t}<small>${s}</small></span>${ic('chev-r', 's18')}</div>`).join('')}</div>`;
const proofMini = ctx => {
  const st = ctx.state, card = h => `<div class="card fcard" data-mo="card">${h}</div>`;
  return ({
    loading: card(`<div class="label">Proof · 6-month task</div><span class="sk" style="height:30px;width:90px;margin-top:8px"></span>`),
    empty: card(`<div class="label">Proof</div><p class="fc-sub" style="margin-top:6px">Nothing to prove yet: no forecast has been issued.</p>`),
    noModel: card(`<div class="label">Proof</div><p class="fc-sub" style="margin-top:6px">No forecast, so no record. No track record is claimed for gold.</p>`),
    error: card(`<div class="label">Proof</div><p class="fc-sub" style="margin-top:6px">Proof unavailable. The forecast still shows.</p><div style="margin-top:8px">${btn('Try again', 'tinted', 'refresh').replace('class="btn', 'class="btn sm')}</div>`)
  })[st] || card(proof(true));
};

/* ---------- short-term, apart ---------- */
function shortRow(s, ctx) {
  const st = ctx.state;
  if (st === 'noModel' && s.state === 'eligible') return `<div class="fc-lad sm" data-mo="rise"><div class="hzn">${s.n}</div><div></div>${stateChip('rules')}<div class="why">No qualified model. Rules read neutral, heuristic strength moderate. Not a probability.</div></div>`;
  if (st === 'abstention' && s.n === '20 sessions') return `<div class="fc-lad sm" data-mo="rise"><div class="hzn">${s.n}</div><div></div>${pill('', 'ban', 'Abstained')}<div class="why">Too little comparable history, so no range.</div></div>`;
  if (s.state === 'rules') return `<div class="fc-lad sm" data-mo="rise"><div class="hzn">${s.n}</div><div></div>${stateChip('rules')}<div class="why">No qualified model. Rules read neutral, heuristic strength weak. Not a probability.</div></div>`;
  if (s.state === 'practice') return `<div class="fc-lad sm" data-mo="rise"><div class="hzn">${s.n}</div><div></div>${stateChip('practice')}<div class="why">Shadow trial, week 5 of 8. No range is published until it qualifies and you say yes.</div></div>`;
  return `<div class="fc-lad sm" data-mo="rise"><div class="hzn">${s.n}</div><div>${bar(s.f, { min: -12, max: 12, label: s.n })}</div><div class="med">${pct(s.f.med)}</div><div class="rg">80% range ${pct(s.f.lo)} to ${pct(s.f.hi)} · held ${s.held}% of ${s.scored}</div></div>`;
}
const shortCard = ctx => `<div class="card" data-mo="card">${SHORT.map(s => shortRow(s, ctx)).join('')}</div>`;
const shortFoot = () => `<div class="fc-sub" data-mo="fade">Short-term figures never feed growth or protection; only the opportunity part of a score uses them. Next day and 5 sessions stay listed with no qualified model: a horizon is never removed, and never given a made-up number.</div>`;
function shortMain(ctx) {
  const list = () => `${banner('', 'Short-term.', 'Kept apart on purpose. MyPrediction is built for 3, 6 and 12 months.', 'clock')}${shortCard(ctx)}${isWide(ctx) ? '' : shortFoot()}`;
  return region(ctx, {
    what: 'Short-term forecasts', ok: list,
    loading: () => `${banner('', 'Short-term.', 'Reading the 21:15 run.', 'clock')}${skel(4)}`,
    empty: () => stateCard('clock', 'No short-term forecast yet', 'A new listing needs its first run. The four rows appear tomorrow, each with its own state.'),
    error: () => banner('fall', 'Short-term forecasts did not load.', 'The last good set is from 20:45.', 'alert') + `<div>${btn('Try again', 'tinted', 'refresh')}</div>` + shortCard(ctx),
    stale: () => banner('warn', 'Stale input.', 'A price stopped at 16:35, so 10 and 20 sessions are held, not current.', 'clock') + shortCard(ctx),
    offline: () => banner('', 'Saved at 21:15.', 'Short-term figures age fastest. Treat these as a record, not a reading.', 'wifi-off') + shortCard(ctx),
    noModel: () => banner('', 'Rules only.', 'The short-term model is paused (POLICY-003), so all four rows show the rules with their heuristic strength.', 'pause') + shortCard(ctx),
    disagreement: () => banner('', 'Models disagree at 10 sessions.', 'R2-HGB v3 points up and the baseline points down. Both are in the proof.', 'split') + shortCard(ctx),
    abstention: () => banner('', '20 sessions abstained.', 'The other rows stand on their own evidence.', 'ban') + shortCard(ctx)
  });
}

/* ---------- proof ---------- */
const METRICS = [['Coverage', '79%', '80% ranges, target 80%'], ['Hit rate', '58%', 'Direction, 52 scored'], ['Error', '8.9 pts', 'Median absolute'], ['Calibration', '0.96', 'Slope, 1.00 is exact'], ['Turnover', '0.6', 'Action changes a year'], ['Benchmark', '+3.1 pts', 'Ahead of the S&P 500 base rate']];
const metrics = ctx => `<div class="fc-metrics${isWide(ctx) ? ' w3' : ''}">${METRICS.map(([l, v, u]) => `<div data-mo="rise"><span class="label">${l}</span><b>${roll(v)}</b><span class="u">${u}</span></div>`).join('')}</div>`;
const walk = () => `<div class="card fc-card" data-mo="card"><h4>How it was tested</h4><div class="fc-kv"><span>Dataset</span><b>ds-2026-10-30</b><span>Walk-forward folds</span><b>22 since 2015</b><span>Embargo</span><b>6 months + 1 session</b><span>Non-overlapping blocks</span><b>22</b><span>Live, matured</span><b>0 · first due 1 Apr 2027</b></div><p class="fc-sub">Limits: few cases of a rate shock in the sample. One outcome was corrected in March 2025; its new score sits beside the old one.</p></div>`;
const sheets = () => `<div class="card" data-mo="card">${[['cube', 'Model sheet', 'R2-HGB v3 · approved 1 Oct 2026'], ['layers', 'Regime sheet', 'Late-cycle, 14 of 22 folds'], ['clock', 'Analog sheet', '38 matched days since 2015'], ['alert', 'Event sheet', '3 of 7 kinds qualified so far'], ['fan', 'Pattern sheet', 'Not qualified']].map(([i, t, s]) => `<div class="fc-link">${ic(i, 's18')}<span>${t}<small>${s}</small></span>${ic('chev-r', 's18')}</div>`).join('')}</div>`;
const hzRecord = () => `<div class="card" data-mo="card">${LONG.map(l => `<div class="fc-lad sm" data-mo="rise"><div class="hzn">${l.n}</div><div class="fc-sub">${l.held}% of ${l.scored}</div>${l.blocks < 20 ? stateChip('exploratory') : '<span class="chip">Walk-forward</span>'}${l.blocks < 20 ? `<div class="why">${l.blocks} non-overlapping blocks, under the 20 a claim needs.</div>` : ''}</div>`).join('')}</div>`;
const proofTop = ctx => `<div class="card fcard" data-mo="card">${proof(false)}</div>`;
function proofMain(ctx) {
  const tested = () => `<div class="card fc-card" data-mo="card"><h4>Hit rate never stands alone</h4>${metrics(ctx)}<p class="fc-sub">Walk-forward scores, not live ones. A judge or evaluation score is never shown as accuracy.</p></div>`;
  const ok = () => proofTop(ctx) + tested() + (isWide(ctx) ? '' : hzRecord() + walk() + sheets());
  return region(ctx, {
    what: 'The proof', ok,
    loading: () => `<div class="card fcard" data-mo="card"><div class="label">Proof · 6-month task</div><span class="sk" style="height:30px;width:90px;margin-top:8px"></span><span class="sk" style="height:8px;margin-top:12px"></span></div>` + skel(3),
    empty: () => stateCard('clock', 'Awaiting maturity', 'No 12-month outcome has matured live: a 12-month record waits a year, so no live record is claimed. The first is due 1 Oct 2027.', '', '<span class="chip">0 of 26 matured live</span>') + hzRecord(),
    error: () => stateCard('alert', 'Proof unavailable', 'The record did not load at 21:14. The forecast still shows, and its calibration line stays labelled with its time.', btn('Try again', 'tinted', 'refresh')),
    stale: () => banner('warn', 'Graded to 2 November.', 'Today\'s matured forecasts wait for prices. Nobody edits a past score; these are simply a day behind.', 'clock') + ok(),
    offline: () => banner('', 'Saved at 21:15.', 'The record on your device. New grades arrive when you reconnect.', 'wifi-off') + ok(),
    noModel: () => stateCard('cube', 'No model, no record', 'Rules carry a heuristic strength, which is not a calibrated probability. There is nothing here to score, and none is claimed.'),
    disagreement: () => banner('', 'Two records.', 'R2-HGB v3 and the baseline disagree today. Their records sit together so you can weigh them.', 'split') + `<div class="card fc-card" data-mo="card"><div class="fc-kv"><span>R2-HGB v3 · coverage</span><b>79%</b><span>Baseline · coverage</span><b>83%</b><span>R2-HGB v3 · error</span><b>8.9 pts</b><span>Baseline · error</span><b>10.4 pts</b></div></div>` + ok(),
    abstention: () => banner('', 'Abstentions are counted.', 'The model abstained on 7 of 59 origins. They are reported here, and are not scored as hits or misses.', 'ban') + ok()
  });
}
const proofRail = ctx => (['loading', 'empty', 'error', 'noModel'].includes(ctx.state) ? sheets() : hzRecord() + walk() + sheets());

/* ---------- three views ---------- */
const clMark = '<span class="cl-mark s" aria-hidden="true"><i></i><i></i><i></i></span>';
function vRules(st) {
  const body = st === 'disagreement' ? `<div class="fc-kv"><span>Reads</span><b>Pause</b><span>Heuristic strength</span><b>Moderate</b></div><ul class="fc-sub"><li>Price is below its 200-day average.</li><li>Drawdown of 11% from its high.</li></ul>`
    : `<div class="fc-kv"><span>Reads</span><b>Hold</b><span>Heuristic strength</span><b>Moderate</b></div><ul class="fc-sub"><li>Price is above its 200-day average.</li><li>Valuation is above its 5-year median.</li></ul>`;
  return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${ic('sliders', 's18')}<h4>Rules</h4><span class="chip illus">Heuristic</span></div>${body}<p class="fc-sub">Strength is a label, not a probability.</p></div>`;
}
function vModels(st) {
  if (st === 'noModel') return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${ic('cube', 's18')}<h4>Models</h4><span class="chip">Unavailable</span></div><p class="fc-sub">No approved model at this horizon. Nothing is folded in: this view stays empty and says so.</p></div>`;
  if (st === 'abstention') return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${ic('cube', 's18')}<h4>Models</h4>${pill('', 'ban', 'Abstained')}</div><p class="fc-sub">Too little comparable history for a calibrated range. The rules stand alone today.</p></div>`;
  return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${ic('cube', 's18')}<h4>Models</h4><span class="chip fc">Calibrated</span></div><div class="fc-kv"><span>Median, 6M</span><b>${pct(A.med)}</b><span>80% range</span><b>${pct(A.lo)} to ${pct(A.hi)}</b></div>${bar(A, { label: 'R2-HGB v3' })}<p class="fc-sub">R2-HGB v3. Held 79% of 52 scored.</p></div>`;
}
function vClaude(st) {
  if (st === 'error') return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${clMark}<h4>Claude</h4><span class="chip error">Failed</span></div><p class="fc-sub">The explanation route failed at 21:14. Rules and models still show; only the words are missing.</p>${btn('Try again', 'tinted', 'refresh').replace('class="btn', 'class="btn sm')}</div>`;
  const text = st === 'disagreement' ? `The rules read <span class="cl-fig">Pause</span><span class="cl-ref">1</span> after an <span class="cl-fig">11%</span><span class="cl-ref">2</span> drawdown, while the model's median stays at <span class="cl-fig">${pct(A.med)}</span><span class="cl-ref">3</span>. Each side is working from different evidence.`
    : st === 'noModel' ? `Only the rules are available, reading <span class="cl-fig">Hold</span><span class="cl-ref">1</span>. I have no calibrated range to explain.`
      : st === 'abstention' ? `The model abstained, so I can only describe the rules, which read <span class="cl-fig">Hold</span><span class="cl-ref">1</span>.`
        : `The median of <span class="cl-fig">${pct(A.med)}</span><span class="cl-ref">3</span> sits inside a range that still includes a loss of <span class="cl-fig">9.8%</span><span class="cl-ref">3</span>. The rules read <span class="cl-fig">Hold</span><span class="cl-ref">1</span>, so the two agree on direction.`;
  return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${clMark}<h4>Claude</h4><span class="chip illus">Words only</span></div><p class="cl-a" style="font-size:15px;line-height:20px">${text}</p><ul class="cl-src">${(st === 'noModel' || st === 'abstention' ? ['1 Rules v1'] : ['1 Rules v1', '2 Price · Twelve Data', '3 R2-HGB v3']).map(s => `<li>${s}</li>`).join('')}</ul><p class="fc-sub">Every figure comes from code. Claude supplied none.</p></div>`;
}
const compare = st => {
  const c = (l, v) => `<div data-mo="rise"><span class="label">${l}</span><b>${v}</b></div>`;
  return `<div class="fc-cmp">${c('Rules', st === 'disagreement' ? 'Pause' : 'Hold')}${c('Models', st === 'noModel' ? 'None' : st === 'abstention' ? 'Abstained' : '+6.2%')}${c('Together', st === 'disagreement' ? 'Disagree' : st === 'noModel' || st === 'abstention' ? 'One side' : 'Agree')}</div>`;
};
const split = st => `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Contribution split</h4><span class="chip proposed"><span class="dot"></span>Experimental</span></div>${st === 'noModel' || st === 'abstention' ? '<p class="fc-sub">No split: one side is missing, and it is never folded into a single score.</p>' : `<div class="fc-split" role="img" aria-label="Rules 38%, models 62%. Experimental, with no probability of its own."><i data-mo="barx" style="width:38%;background:var(--ink-2)"></i><i data-mo="barx" style="width:62%;background:var(--fc-line)"></i></div><div class="fc-kv"><span>Rules</span><b>38%</b><span>Models</span><b>62%</b></div><p class="fc-sub">How much each side moved this view. It carries no probability of its own.</p>`}</div>`;
const f7 = () => `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Contribution policy</h4><span class="chip">Not qualified</span></div><p class="fc-sub">Week 3 of 8 in replay and shadow. It appears only after beating simple rules for 8 weeks and your yes, and then only as a simulation.</p></div>`;
function viewsMain(ctx) {
  const st = ctx.state;
  const lead = {
    error: banner('warn', 'One view failed.', 'The others still show. The failed view says why.', 'alert'),
    stale: banner('warn', 'Input stale since 16:35.', 'All three views describe the last issue, not today.', 'clock'),
    offline: banner('', 'Saved at 21:15.', 'All three views are from your device.', 'wifi-off'),
    noModel: banner('', 'One side is unavailable.', 'No model covers this horizon, so the rules stand alone and no combined reading is made.', 'cube'),
    disagreement: banner('', 'Rules and models disagree.', 'Each side keeps its own evidence, and no action is ranked.', 'split'),
    abstention: banner('', 'The model abstained.', 'The rules still show. Nothing is folded into one score.', 'ban')
  }[st] || '';
  const three = () => `${lead}${isWide(ctx) ? '' : compare(st)}<div class="${isWide(ctx) ? 'fc-3' : ''}" style="${isWide(ctx) ? '' : 'display:grid;gap:12px'}">${vRules(st)}${vModels(st)}${vClaude(st)}</div><div style="display:grid;grid-template-columns:${isWide(ctx) ? 'repeat(2,minmax(0,1fr))' : 'minmax(0,1fr)'};gap:${isWide(ctx) ? 14 : 12}px;align-items:start">${split(st)}${f7()}</div>`;
  if (st === 'loading') return `<div class="${isWide(ctx) ? 'fc-3' : ''}" style="${isWide(ctx) ? '' : 'display:grid;gap:12px'}">${['Rules', 'Models', 'Claude'].map(t => `<div class="card fc-card" data-mo="card"><h4>${t}</h4><span class="sk" style="height:14px;width:80%"></span><span class="sk" style="height:14px;width:60%"></span></div>`).join('')}</div><div class="fc-sub">Each view loads on its own, so one slow view holds up nothing.</div>`;
  if (st === 'empty') return stateCard('split', 'No views yet', 'A new listing has no rules, model or Claude view until its first run tomorrow. Nothing is drawn until then.');
  return three();
}

/* ---------- scenarios ---------- */
const BASE = { start: 14820.5, fee: .2, fx: 0, contrib: 0, infl: 2.5 };
const TPL = [['Downside', -2], ['Central', 5], ['Upside', 10]];
const worth = (r, y) => { let v = BASE.start; for (let i = 0; i < y; i++) v = v * (1 + (r - BASE.fee + BASE.fx) / 100) + BASE.contrib * 12; return v; };
const real = (v, y) => v / (1 + BASE.infl / 100) ** y;
function scenChart(ctx) {
  const W = cw(ctx, 326, 500), Ht = cw(ctx, 200, 250), ml = 12, mr = 86, mt = 14, mb = 22;
  const lo = worth(-2, 5) * .92, hi = worth(10, 5) * 1.04, X = y => ml + (y / 5) * (W - ml - mr), Y = v => mt + (1 - (v - lo) / (hi - lo)) * (Ht - mt - mb);
  const line = r => `<path d="M${[0, 1, 2, 3, 4, 5].map(y => `${X(y).toFixed(1)} ${Y(worth(r, y)).toFixed(1)}`).join('L')}" fill="none" style="stroke:var(--ink-2)" stroke-width="2" stroke-dasharray="1.5 4" stroke-linecap="round"/>`;
  return `<svg class="cx" viewBox="0 0 ${W} ${Ht}" width="100%" role="img" aria-label="Three conditional paths for this Apple holding over 5 years, dotted, with no likelihood. ${TPL.map(([n, r]) => `${n}: ${money0(worth(r, 3))} at 3 years, ${money0(worth(r, 5))} at 5 years`).join('. ')}. Illustrative."><line class="zero" x1="${ml}" x2="${X(5)}" y1="${Y(BASE.start)}" y2="${Y(BASE.start)}"/><line class="grid" x1="${X(3)}" x2="${X(3)}" y1="${mt - 4}" y2="${Ht - mb}"/><line class="grid" x1="${X(5)}" x2="${X(5)}" y1="${mt - 4}" y2="${Ht - mb}"/><g data-mo="draw">${TPL.map(([, r]) => line(r)).join('')}</g><circle class="nowdot" cx="${X(0)}" cy="${Y(BASE.start)}" r="4.5"/>${TPL.map(([n, r]) => `<text class="lbl" x="${X(5) + 6}" y="${Y(worth(r, 5)) + 4}">${money0(worth(r, 5))}</text><text x="${X(5) + 6}" y="${Y(worth(r, 5)) + 19}">${n}</text>`).join('')}<text x="${ml}" y="${Ht - 6}">Now</text><text x="${X(3)}" y="${Ht - 6}" text-anchor="middle">3 years</text><text x="${X(5)}" y="${Ht - 6}" text-anchor="middle">5 years</text></svg>`;
}
const scenRow = y => `<div class="fc-scen">${TPL.map(([n, r]) => `<div data-mo="rise"><span class="label">${n}</span><b>${roll(money0(worth(r, y)))}</b><span class="u">${money0(real(worth(r, y), y))} in today's money</span></div>`).join('')}</div>`;
const field = (l, v, sub = '', bad = '') => `<label class="fc-field${bad ? ' bad' : ''}"><span>${l}${sub ? `<small>${sub}</small>` : ''}</span><input type="text" inputmode="decimal" value="${v}" aria-label="${l}"${bad ? ' aria-invalid="true"' : ''}></label>`;
const noLike = () => pill('', 'scenario', 'Conditional · no likelihood');
function scenMain(ctx) {
  const chart = () => `<div class="card fcard" data-mo="card"><div class="fh"><div class="label">Scenarios · this holding</div>${noLike()}</div><div style="margin-top:8px">${scenChart(ctx)}</div><div class="legend"><span><i class="lg-scen"></i>Conditional path, computed from the assumptions</span></div></div>`;
  const out = () => `<div class="card fc-card" data-mo="card"><h4>At 3 years</h4>${scenRow(3)}<h4 style="margin-top:6px">At 5 years</h4>${scenRow(5)}<p class="fc-sub">Central does not mean most likely. No path has a probability, and none extends a 12-month forecast. Illustrative.</p></div>`;
  const all = () => chart() + out();
  return region(ctx, {
    what: 'Scenarios', ok: all,
    loading: () => `<div class="card fcard" data-mo="card"><div class="label">Scenarios · this holding</div><span class="sk" style="height:170px;margin-top:10px"></span><div class="fmeta"><span>Assumptions saved 2 Nov</span></div></div>`,
    empty: () => stateCard('scenario', 'Template values wait for you', 'The downside, central and upside values need your approval before they are used (SCI-D06). Until then no scenario runs and no path is drawn.', btn('Review the template values', 'primary')),
    error: () => banner('fall', 'Inflation of 40% was refused.', 'It must be between 0% and 15%. The last saved assumptions stay, and so do these paths.', 'alert') + all(),
    stale: () => banner('warn', 'FX is from 2 November.', 'The GBP/USD quote is a day old, so the pound figures are held to that rate.', 'clock') + all(),
    offline: () => banner('', 'Saved at 21:15.', 'Editing waits until you reconnect. These paths are from your last saved assumptions.', 'wifi-off') + all()
  });
}
function assume(ctx) {
  const st = ctx.state;
  if (st === 'empty' || st === 'loading') return `<div class="card fc-card" data-mo="card"><h4>Assumptions</h4><p class="fc-sub">${st === 'empty' ? 'Return, inflation, FX, contributions, fees and dividends each get a stated value here once you approve the templates.' : 'Reading your saved copy from 2 November.'}</p></div>`;
  const off = st === 'offline' ? ' (read only offline)' : '';
  return `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Assumptions${off}</h4><span class="chip owner"><span class="dot"></span>Your copy</span></div><div class="fc-sub" style="margin-bottom:2px">Editing changes your copy, labelled yours. Templates stay as approved.</div>
    ${field('Downside return', '−2.0%', 'A year')}${field('Central return', '5.0%', 'A year · edited by you')}${field('Upside return', '10.0%', 'A year')}
    ${field('Inflation', st === 'error' ? '40%' : '2.5%', st === 'error' ? 'Refused: 0% to 15%' : 'A year', st === 'error' ? 1 : '')}${field('FX, GBP/USD drift', '0.0%', st === 'stale' ? 'Quote from 2 Nov' : 'A year')}${field('Monthly contribution', '£0')}${field('Fees', '0.20%', 'A year')}${field('Dividends', 'Reinvest')}
    <div style="display:grid;gap:8px;margin-top:4px">${seg(['This holding', 'Whole portfolio'], 0, 'Scope', 'full')}</div></div>`;
}

/* ---------- the evidence trail ---------- */
const CHAIN = [
  ['db', 'Source', 'Twelve Data · close 3 Nov · received 21:02'],
  ['layers', 'Ledger', 'Apple position · v12 · £14,820.50'],
  ['shield', 'Risk', 'Exposure snapshot · US tech 31.0%'],
  ['fan', 'Forecast', 'v3 · +6.2% at 6M · R2-HGB v3. Replaces v2, corrected for a late FX quote at 21:11'],
  ['target', 'Action', 'Hold · policy v1 · decision support'],
  ['clock', 'Outcome', 'Not yet: matures 3 May 2027'],
  ['lock', 'Audit', 'Sealed 21:15 · 7 of 7 links resolve']
];
const stepOf = (i, s, sel) => `<div class="fc-step${sel === i ? ' on' : ''}${s.off ? ' off' : ''}" data-mo="rise"><span class="nd">${ic(s[0], 's18')}</span><div style="min-width:0"><b>${s[1]}</b><small>${s[2]}</small></div>${ic('chev-r', 's18')}</div>`;
function chain(st) {
  const c = CHAIN.map(s => [...s]);
  if (st === 'noModel') { c[3] = ['sliders', 'Rules, no model', 'No approved model. Rules v1, heuristic strength moderate']; c[4] = ['target', 'Action', 'None: not ranked']; c[5] = ['clock', 'Outcome', 'Nothing to score']; }
  if (st === 'disagreement') { c[3] = ['split', 'Forecast', 'Two records: R2-HGB v3 +6.2%, baseline −2.4%']; c[4] = ['target', 'Action', 'None: conflicted, not ranked']; }
  if (st === 'abstention') { c[3] = ['ban', 'Forecast', 'Abstained: too little comparable history']; c[4] = ['target', 'Action', 'None: no range']; c[5] = ['clock', 'Outcome', 'Nothing to score']; }
  if (st === 'stale') { c[0] = ['clock', 'Source', 'Yahoo · last good 16:35 · stale']; }
  if (st === 'offline') { c.forEach(s => { s[2] += ' · saved 21:15'; }); c[6] = ['lock', 'Audit', 'Saved 21:15 · cannot re-check offline']; }
  return `<div class="card fc-chain" data-mo="card">${c.map((s, i) => stepOf(i, s, 3)).join('')}</div>`;
}
function evidenceMain(ctx) {
  const st = ctx.state, head = `<div class="fc-sub" data-mo="fade">Follow any figure back to its source and on to its outcome. This opens the stored record; nothing is rebuilt.</div>`;
  return region(ctx, {
    what: 'This record',
    ok: () => head + chain(st),
    loading: () => `${head}${skel(5)}`,
    empty: () => stateCard('search', 'Record not found', 'This link points to nothing MyPrediction stores. Evidence is never rebuilt to fill the gap.', btn('Back to the forecast', 'tinted')),
    error: () => stateCard('lock', 'This record is refused', 'The link points to another environment. A link carries no authority of its own, so nothing opens.', btn('Back to the forecast', 'tinted')),
    stale: () => banner('warn', 'Stale record.', 'Its source stopped at 16:35. The chain is complete up to there.', 'clock') + chain(st),
    offline: () => banner('', 'Saved record.', 'Each link shows its age. New notes and decisions are refused until you reconnect.', 'wifi-off') + chain(st),
    noModel: () => banner('', 'A rules record.', 'No model produced this figure, so the chain runs through the rules.', 'cube') + chain(st),
    disagreement: () => banner('', 'Two records, one chain.', 'Both forecasts are stored. Neither is overwritten.', 'split') + chain(st),
    abstention: () => banner('', 'An abstention is a record too.', 'It is stored and dated, and it has no outcome to score.', 'ban') + chain(st)
  });
}
function recordCard(ctx) {
  const st = ctx.state;
  if (st === 'empty' || st === 'error') return `<div class="card fc-card" data-mo="card"><h4>Why links work this way</h4><p class="fc-sub">An expired session asks you to sign in, then returns to the record. A link to a superseded record opens it, with a pointer to what replaced it.</p></div>`;
  if (st === 'loading') return `<div class="card fc-card" data-mo="card"><h4>Forecast record</h4><span class="sk" style="height:14px;width:80%"></span></div>`;
  return `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Forecast v3</h4><span class="chip">Current</span></div><div class="fc-kv"><span>Task</span><b>AAPL · 6-month return</b><span>As of</span><b>21:15 London</b><span>Data cutoff</span><b>21:00</b><span>Model</span><b>R2-HGB v3</b><span>Replaces</span><b>v2 · kept, annotated</b></div><div class="fc-link2">${ic('lock', 's16')}<span>mypaisapp.com/e/fc-8f21c3</span></div>${btn('Copy link', 'tinted').replace('class="btn', 'class="btn sm')}<p class="fc-sub">Opens this same record on the web and in the Apple app, and only for you.</p></div>`;
}

/* ---------- Option B: every horizon at once ---------- */
function ladRow(l, ctx, sel) {
  const st = ctx.state;
  if (st === 'abstention' && l.k === 12) return `<div class="fc-lad" data-mo="rise"><div class="hzn">${l.n}</div><div></div>${pill('', 'ban', 'Abstained')}<div class="why">Too little comparable history, so no range.</div></div>`;
  return `<div class="fc-lad${sel === l.k ? ' on' : ''}" data-mo="rise"><div class="hzn">${l.n}</div><div>${bar(l.f, { label: l.n })}</div><div class="med">${roll(pct(l.f.med))}</div><div class="rg">80% range ${pct(l.f.lo)} to ${pct(l.f.hi)}</div><div class="rg">Held ${l.held}% of ${l.scored} scored${l.blocks < 20 ? ' · Exploratory' : ''}</div></div>`;
}
const scenBlock = () => `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Scenarios</h4>${noLike()}</div><div class="fc-kv"><span>3 years, downside to upside</span><b>${money0(worth(-2, 3))} to ${money0(worth(10, 3))}</b><span>5 years, downside to upside</span><b>${money0(worth(-2, 5))} to ${money0(worth(10, 5))}</b></div><div class="legend"><span><i class="lg-scen"></i>Conditional on stated assumptions</span></div></div>`;
function ladderMain(ctx) {
  const st = ctx.state;
  const main = () => `<div class="card fcard" data-mo="card"><div class="fh"><div class="label">Long term · 3, 6 and 12 months · AAPL</div><span class="chip fc">${ic('fan', 's14')}Evaluated</span></div><div style="margin-top:8px">${ladderFan(ctx)}</div><div class="fmeta"><span>As of 21:15 London</span><span>Data cutoff 21:00</span><span>R2-HGB v3</span><span>Illustrative</span></div></div><div class="card" data-mo="card">${LONG.map(l => ladRow(l, ctx)).join('')}</div>`;
  return region(ctx, {
    what: 'This forecast', ok: main,
    loading: () => skelFc('Long term · 3, 6 and 12 months · AAPL') + skel(3),
    empty: () => stateCard('fan', 'No forecast yet', 'Apple joined your list today. All seven horizons fill in from the next daily run. Price history shows now.', '', '<span class="chip">Next run tomorrow 21:15</span>'),
    error: () => banner('fall', 'Forecasts did not load.', 'Twelve Data failed at 21:14. The 20:45 set stays here, labelled with its time.', 'alert') + `<div>${btn('Try again', 'tinted', 'refresh')}</div>` + main(),
    stale: () => banner('warn', 'Held, not current.', 'An input stopped at 16:35, so every horizon shows its last issue.', 'clock') + main(),
    offline: () => banner('', 'Saved at 21:15.', 'Every horizon here is from your device, not fresh analysis.', 'wifi-off') + main(),
    noModel: () => stateCard('ban', 'Forecast unavailable', 'No forecast at any of the seven horizons for gold, while its valuation convention is open (SCI-D08). Price history still shows.', '', pill('', 'ban', 'Unavailable at all 7 horizons')) + `<div class="card fcard" data-mo="card"><div class="label">Price history · 12 months · not a forecast</div><div style="margin-top:8px">${histChart(ctx, 'Gold', 29)}</div></div>`,
    disagreement: () => banner('', 'Models disagree at 3 months.', 'The approved model points up and the baseline points down. Open the row for both.', 'split') + main().replace(`<div class="med">${roll(pct(LONG[0].f.med))}</div>`, `<div class="med">${ic('split', 's18')}</div>`),
    abstention: () => banner('', '12 months abstained.', '3 and 6 months stand on their own evidence.', 'ban') + main()
  });
}
function ladderRail(ctx) {
  if (ctx.state === 'noModel' || ctx.state === 'empty') return `<div class="card fc-card" data-mo="card"><h4>Short-term and scenarios</h4><p class="fc-sub">${ctx.state === 'noModel' ? 'Neither runs for gold: rules read nothing without a valuation convention, and scenarios need one too.' : 'Short-term rows and scenarios appear with the first run.'}</p></div>`;
  return `<div class="card" data-mo="card"><div class="fc-link" style="min-height:44px">${ic('clock', 's18')}<span>Short-term<small>1 to 20 sessions, kept apart</small></span></div>${SHORT.map(s => shortRow(s, ctx)).join('')}</div>${scenBlock()}`;
}
const TABS = ['Forecast', 'Proof', 'Views', 'Evidence'];
const dossier = on => `<div data-mo="rise">${seg(TABS, on, 'Dossier', 'full')}</div>`;
const dosHead = () => `<div class="fc-hz" data-mo="rise" style="justify-content:space-between"><span class="fc-sub">Apple · 6 months</span>${stateChip('eligible')}</div>`;

J.add({
  id: 'forecast', title: 'Forecast', stories: ['MP-145', 'MP-157', 'MP-155', 'MP-137', 'MP-151'],
  summary: 'One instrument: its range at each horizon, how far to trust it, who says what, and where every figure came from. Never a bare number.',
  options: [{
    id: 'a', name: 'One horizon', rec: true,
    why: 'One horizon fills the screen with its range, calibration and model, and the proof sits directly under it. The horizon switch stays in thumb reach, so reading a forecast and judging it are one motion.',
    cost: 'You compare horizons by switching, not side by side, and each deeper view is a page of its own.',
    screens: [{
      id: 'a-instrument', title: 'Instrument at a horizon', note: 'The switch floats above the dock on a phone, and sits at the top on iPad and desktop. No model is drawn on gold, the real case: forecast unavailable at every horizon (SCI-D08).',
      render: ctx => frame(ctx, {
        tab: 1, back: 'Portfolio', title: ctx.state === 'noModel' ? 'XAU/USD' : 'AAPL', actions: tb('info', 'About this forecast'),
        accessory: ctx.state === 'noModel' ? '' : hzSwitch(ctx),
        body: `<span class="fc-wl"></span>${inst(ctx)}${isWide(ctx) && ctx.state !== 'noModel' ? hzSwitch(ctx) : ''}${forecastMain(ctx)}${isWide(ctx) ? '' : actionCard(ctx) + proofMini(ctx) + linksCard()}`,
        rail: isWide(ctx) ? actionCard(ctx) + proofMini(ctx) + linksCard() : ''
      })
    }, {
      id: 'a-short', title: 'Short-term, apart', note: 'Reached from the switch, and labelled so. Rows show their real state: rules only, in practice, or evaluated.',
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: 'Short-term', actions: tb('info', 'About short-term'), accessory: hzSwitch(ctx, 1, true), body: `<span class="fc-wl"></span>${isWide(ctx) ? hzSwitch(ctx, 1, true) : ''}${shortMain(ctx)}`, rail: isWide(ctx) ? `<div class="card fc-card" data-mo="card"><h4>Why it sits apart</h4>${shortFoot()}</div>` : '' })
    }, {
      id: 'a-proof', title: 'Proof', note: 'Hit rate never appears without calibration, error, coverage, turnover and a benchmark. 12 months is labelled exploratory: 11 blocks, under the 20 a claim needs.',
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: 'Proof', actions: tb('info', 'About proof'), webActions: isWide(ctx) ? H36(1) : '', body: `<span class="fc-wl"></span>${proofMain(ctx)}`, rail: isWide(ctx) ? proofRail(ctx) : '' })
    }, {
      id: 'a-views', title: 'Rules, models, Claude', note: 'Three separate views, so one score can never hide a conflict. The split is experimental and carries no probability; the contribution policy stays hidden until it qualifies.',
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: 'Three views', actions: tb('info', 'About these views'), webActions: isWide(ctx) ? H36(1) : '', body: viewsMain(ctx) })
    }, {
      id: 'a-scenarios', title: 'Scenarios', note: 'Their own section: dotted, conditional, with no likelihood. Empty is the state today: template values wait on SCI-D06.',
      na: { noModel: 'A scenario is arithmetic on stated assumptions. No model runs, so none can be missing.', disagreement: 'A scenario is arithmetic on stated assumptions. There are no models to disagree.', abstention: 'A scenario is arithmetic on stated assumptions. No model runs, so none can abstain.' },
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: 'Scenarios', actions: tb('info', 'About scenarios'), body: `<span class="fc-wl"></span>${scenMain(ctx)}`, rail: assume(ctx) })
    }, {
      id: 'a-evidence', title: 'Evidence trail', note: 'Source, ledger, risk, forecast, action, outcome, audit: every link is stored, never rebuilt. A corrected forecast names what it replaced. Empty is a link that finds nothing; Error is a refused link.',
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: 'Evidence', actions: tb('info', 'About evidence'), body: `<span class="fc-wl"></span>${evidenceMain(ctx)}`, rail: recordCard(ctx) })
    }]
  }, {
    id: 'b', name: 'Ladder',
    why: 'All seven horizons sit on one screen, three kinds of evidence in three looks: long term first on one shared scale, short-term apart, scenarios dotted. One tap opens one dossier for proof, views and evidence.',
    cost: 'Seven small ranges are more to read on a phone, and proof sits a level deeper than in One horizon.',
    screens: [{
      id: 'b-ladder', title: 'Every horizon', note: 'One fan to 12 months with its three horizons marked, each with its own calibration. Short-term sits apart, and scenarios follow, dotted. No model is drawn on gold.',
      render: ctx => frame(ctx, {
        tab: 1, back: 'Portfolio', title: ctx.state === 'noModel' ? 'XAU/USD' : 'AAPL', actions: tb('info', 'About this forecast'),
        body: `<span class="fc-wl"></span>${inst(ctx)}${ladderMain(ctx)}${isWide(ctx) ? '' : ladderRail(ctx)}`,
        rail: isWide(ctx) ? ladderRail(ctx) : ''
      })
    }, {
      id: 'b-forecast', title: 'Dossier: forecast and proof', note: 'One page per horizon, with four tabs instead of four pages. Forecast and proof read as one scroll.',
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: '6 months', actions: tb('info', 'About this forecast'), webActions: '', body: `<span class="fc-wl"></span>${dossier(0)}${ctx.state === 'noModel' ? stateCard('cube', 'Rules only at 6 months', 'No qualified model, so this shows the rules with their heuristic strength and no range. No probability is made up.', '', stateChip('rules')) : forecastMain(ctx)}${isWide(ctx) ? '' : actionCard(ctx) + proofMain(ctx)}`, rail: isWide(ctx) ? actionCard(ctx) + proofMini(ctx) + hzRecord() : '' })
    }, {
      id: 'b-views', title: 'Dossier: views', note: 'The same three views, one tab along.',
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: '6 months', actions: tb('info', 'About these views'), body: `${dossier(2)}${viewsMain(ctx)}` })
    }, {
      id: 'b-evidence', title: 'Dossier: evidence', note: 'The chain, the last tab. Empty is a link that finds nothing; Error is a refused link.',
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: '6 months', actions: tb('info', 'About evidence'), body: `<span class="fc-wl"></span>${dossier(3)}${evidenceMain(ctx)}`, rail: recordCard(ctx) })
    }, {
      id: 'b-scenarios', title: 'Scenarios', note: 'Opened from the ladder\'s dotted block. Conditional, with no likelihood. Empty is the state today: template values wait on SCI-D06.',
      na: { noModel: 'A scenario is arithmetic on stated assumptions. No model runs, so none can be missing.', disagreement: 'A scenario is arithmetic on stated assumptions. There are no models to disagree.', abstention: 'A scenario is arithmetic on stated assumptions. No model runs, so none can abstain.' },
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: 'Scenarios', actions: tb('info', 'About scenarios'), body: `<span class="fc-wl"></span>${scenMain(ctx)}`, rail: assume(ctx) })
    }]
  }]
});
})();
