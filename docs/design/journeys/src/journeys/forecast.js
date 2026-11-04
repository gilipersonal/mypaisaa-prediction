/* Forecast: one instrument, how far to trust it and why (MP-145, MP-157, MP-155, MP-137, MP-151).
   Option A shows one horizon at a time; Option B shows every horizon at once. Both compose the modules below.
   3 and 12 months and the short-term figures are derived from the shared 6-month range for this page. Illustrative.
   Each state is drawn on the holding where it is true, as Home draws it: HSBC is the stale one, AstraZeneca abstained at
   6 months, Reliance is split between rules and models, and gold has no forecast. Apple's 12 months abstains too, and the
   models split on Apple at 3 months. A frame keeps its instrument: a press changes the horizon, never the name. */
(() => {
const isWide = ctx => ctx.kind === 'ipad' || ctx.kind === 'web';
const A = byT.AAPL;
const scaled = (h, f) => { const r = v => +v.toFixed(1), s = Math.sqrt(f), m = h.med * f; return { ...h, med: r(m), lo: r(m - (h.med - h.lo) * s), hi: r(m + (h.hi - h.med) * s), lo50: r(m - (h.med - h.lo50) * s), hi50: r(m + (h.hi50 - h.med) * s) }; };
/* each horizon's own walk-forward record, beside its coverage in longOf. The baseline shows only where a horizon is split, and 12 months never is. Illustrative. */
const REC = [
  { hit: '61%', err: '4.7 pts', cal: '0.98', turn: '1.1', bench: '+1.4 pts', baseHeld: 84, baseErr: '5.6 pts', embargo: '3 months + 1 session', due: '1 Jan 2027' },
  { hit: '58%', err: '8.9 pts', cal: '0.96', turn: '0.6', bench: '+3.1 pts', baseHeld: 83, baseErr: '10.4 pts', embargo: '6 months + 1 session', due: '1 Apr 2027' },
  { hit: '62%', err: '15.8 pts', cal: '0.91', turn: '0.3', bench: '+5.2 pts', embargo: '12 months + 1 session', due: '1 Oct 2027' }
];
const longOf = h => [
  { k: 3, n: '3 months', f: scaled(h, .5), held: 81, scored: 104, blocks: 44, due: '3 Feb 2027' },
  { k: 6, n: '6 months', f: h, held: 79, scored: 52, blocks: 22, due: '3 May 2027' },
  { k: 12, n: '12 months', f: scaled(h, 2), held: 77, scored: 26, blocks: 11, due: '3 Nov 2027' }
];
const LONG = longOf(A);
const shortOf = h => [
  { n: 'Next day', state: 'rules' }, { n: '5 sessions', state: 'practice' },
  { n: '10 sessions', state: 'eligible', f: scaled(h, 1 / 12), held: 80, scored: 412 },
  { n: '20 sessions', state: 'eligible', f: scaled(h, 1 / 6), held: 78, scored: 208 }
];
const GOLD = { c: '--seg-metals', lg: 'Au', n: 'Gold', t: 'XAU/USD' };
const money0 = v => '£' + Math.round(v).toLocaleString('en-GB');
/* who abstains and who splits, by horizon: 0 is 3 months, 1 is 6, 2 is 12. Home keeps the same table, and a check holds the two equal. No other name. */
const OUT = { abstention: { AZN: 1, AAPL: 2 }, disagreement: { RELIANCE: 1, AAPL: 0 } };
const isOut = (st, t, hz) => !!OUT[st] && OUT[st][t] === hz;
const isSplit = (st, t, hz) => st === 'disagreement' && isOut(st, t, hz);
const HN = ['3 months', '6 months', '12 months'], HS = ['3M', '6M', '12M'];
const subj = (st, hz = 1) => (st === 'noModel' ? GOLD : st === 'stale' ? byT.HSBA : hz === 1 && st === 'abstention' ? byT.AZN : hz === 1 && st === 'disagreement' ? byT.RELIANCE : A);
const who = st => subj(st, 1);
/* a frame opened from the ladder stays on the ladder's name, across a flip and a tab. A name this state draws nowhere gives way to the
   state's own subject, so a frame remembered from another state cannot put Apple over HSBC's stale banner. */
const pick = (ctx, hz = 1) => { const t = ctx.t && byT[ctx.t]; return t && (t === subj(ctx.state, 0) || t === subj(ctx.state, 1)) ? t : subj(ctx.state, hz); };
const backOf = ctx => pick(ctx).t;
/* what proof, views and evidence read: the frame's name at the frame's horizon. In Disagreement or Abstaining, a horizon the table
   marks keeps that state, and any other reads as Ready, so an abstained horizon never shows a range under its own title. The one thing
   a horizon cannot change is what the rules read: a 200-day average and a drawdown are the same at 3 months as at 12, so Reliance keeps
   its Pause on every tab in Disagreement. */
const clear = ctx => { const h = pick(ctx), hz = +(ctx.hz ?? 1), calm = ['disagreement', 'abstention'].includes(ctx.state) && !isOut(ctx.state, h.t, hz); return { ...ctx, state: calm ? 'default' : ctx.state, h, hz, pause: ctx.state === 'disagreement' && h.t === 'RELIANCE' }; };
/* the models split on Apple: the two sides are the model and the baseline, not rules and models as on Reliance */
const modelSplit = c => c.state === 'disagreement' && c.h.t !== 'RELIANCE';
const shortH = st => (st === 'stale' ? byT.HSBA : A);
const INFO = { AAPL: 'AAPL · XNAS · US tech · USD', HSBA: 'HSBA · XLON · UK · GBP', AZN: 'AZN · XLON · UK · GBP', RELIANCE: 'RELIANCE · XNSE · India · INR' };
const dim = html => `<div class="fc-dim" aria-busy="true">${html}</div>`;
/* the late-price rule: how late a price may be and still count, on every use of it */
const qLate = '<span class="chip proposed"><span class="dot"></span>Proposed · DATA-DEC-02</span>';
const q12 = ctx => (ctx.kind === 'web' || ctx.kind === 'pwa' ? ' <span class="chip proposed"><span class="dot"></span>Proposed · MP40-Q12</span>' : '');
const LASTGOOD = 'Last good run Mon 21:15 · cutoff 21:00';
const asOf = st => (st === 'error' ? 'Last good run Mon 21:15' : st === 'stale' ? 'Held from Mon 21:15' : 'As of 21:15 London');
/* Prism's chart and proof, labelled as what they are: walk-forward testing, not a live record */
const wf = html => html.replace('Scored: inside', 'Walk-forward: inside').replace('A past forecast scored 3 months ago landed', 'A walk-forward case from 3 months ago landed').replace('<i class="lg-past"></i>Past forecast', '<i class="lg-past"></i>Walk-forward case').replace(/over 52 scored forecasts/g, 'over 52 scored forecasts in walk-forward testing').replace('<div class="proofmodel">', '<div class="proofmodel" role="button" tabindex="0">');

/* small modules */
const pill = (cls, icon, t) => `<span class="chip ${cls}" data-mo="chip">${ic(icon, 's14')}${t}</span>`;
const cw = (ctx, phone, wide) => (isWide(ctx) ? wide : phone);
const stateChip = s => ({
  eligible: pill('fc', 'fan', 'Evaluated model'),
  rules: `<span class="chip proposed fc-st" data-mo="chip"><span class="dot"></span>Rules only</span>`,
  practice: pill('', 'clock', 'In practice'),
  exploratory: `<span class="chip proposed" data-mo="chip"><span class="dot"></span>Exploratory</span>`,
  noclear: pill('', 'equal', 'No clear view'),
  costpaused: pill('', 'pause', 'Cost paused')
}[s]);
function bar(f, o = {}) {
  const w = o.w || 220, ht = o.ht || 16, min = o.min ?? -24, max = o.max ?? 40;
  const x = v => ((v - min) / (max - min)) * w, y0 = 2, y1 = ht - 2;
  return `<svg class="cx" viewBox="0 0 ${w} ${ht}" width="100%" height="${ht}" preserveAspectRatio="none" role="img" aria-label="${o.label || 'Forecast'}: ${o.split ? 'split, no median stands' : `median ${pct(f.med)}`}, 80% range ${pct(f.lo)} to ${pct(f.hi)}" style="height:${ht}px"><rect x="0" y="${ht / 2 - 1}" width="${w}" height="2" rx="1" style="fill:var(--surface-3)"/><rect class="b80" x="${x(f.lo)}" y="${y0}" width="${x(f.hi) - x(f.lo)}" height="${y1 - y0}" rx="4"/><rect class="b50" x="${x(f.lo50 ?? f.lo)}" y="${y0 + 2}" width="${x(f.hi50 ?? f.hi) - x(f.lo50 ?? f.lo)}" height="${y1 - y0 - 4}" rx="3"/><rect x="${x(0) - .5}" y="0" width="1" height="${ht}" style="fill:var(--ink-2)"/>${o.split ? '' : `<rect x="${x(f.med) - 1.25}" y="${y0 - 1}" width="2.5" height="${y1 - y0 + 2}" rx="1.25" style="fill:var(--fc-line)"/>`}</svg>`;
}
/* price history alone: no fan, no median, for when nothing may be forecast */
function histChart(ctx, label, seed = 11) {
  const W = cw(ctx, 326, 500), Ht = cw(ctx, 170, 210), ml = 38, mr = 12, mt = 12, mb = 22;
  const pts = path({ med: 4 }, seed), lo = Math.min(...pts) - 2, hi = Math.max(...pts) + 2;
  const X = i => ml + (i / (pts.length - 1)) * (W - ml - mr), Y = v => mt + (1 - (v - lo) / (hi - lo)) * (Ht - mt - mb);
  const ticks = []; for (let t = Math.ceil(lo / 10) * 10; t <= hi; t += 10) ticks.push(t);
  return `<svg class="cx" viewBox="0 0 ${W} ${Ht}" width="100%" role="img" aria-label="${label}: 12 months of price history, no forecast. Illustrative.">${ticks.map(t => `<line class="${t === 0 ? 'zero' : 'grid'}" x1="${ml}" x2="${W - mr}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${ml - 6}" y="${Y(t) + 4}" text-anchor="end">${t === 0 ? '0%' : (t > 0 ? '+' : '−') + Math.abs(t) + '%'}</text>`).join('')}<g data-mo="draw"><path class="hist" d="${pts.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join('')}"/></g><text x="${ml}" y="${Ht - 6}">Nov 2025</text><text x="${W - mr}" y="${Ht - 6}" text-anchor="end">Now</text></svg>`;
}
/* one fan with its horizons marked: Option B's picture, and Option A's at 3 and 12 months. It draws only what the state leaves
   true: an abstained 12 months has no band and no figures, and a split 3 months has no median marked. */
function ladderFan(ctx, o = {}) {
  const st = ctx.state, h = o.h || A, ls = longOf(h), span = o.to || 12, one = !!o.to, ref = one ? ls.find(l => l.k === o.to) : ls[2];
  const gap12 = !one && st === 'abstention' && isOut(st, h.t, 2), split3 = (!one && isSplit(st, h.t, 0)) || !!o.split, end = gap12 ? ls[1] : ref, upto = gap12 ? 6 : span, from = !one && split3 ? 6 : 0;
  const W = cw(ctx, 326, 500), Ht = cw(ctx, 180, 240), ml = 38, mr = 52, mt = 14, mb = 22;
  const step = ref.f.hi - ref.f.lo > 30 ? 10 : 5, lo = Math.floor((ref.f.lo - 2) / step) * step, hi = Math.ceil((ref.f.hi + 2) / step) * step;
  const X = m => ml + (m / span) * (W - ml - mr), Y = v => mt + (1 - (v - lo) / (hi - lo)) * (Ht - mt - mb);
  const N = 24, at = f => { const s = Math.sqrt(f), r = ref.f; return { m: r.med * f, u: r.med * f + (r.hi - r.med) * s, d: r.med * f - (r.med - r.lo) * s, u5: r.med * f + (r.hi50 - r.med) * s, d5: r.med * f - (r.med - r.lo50) * s }; };
  const pathOf = (a, b) => { const up = [], dn = [], last = upto / span; for (let i = 0; i <= N; i++) { const f = (i / N) * last, c = at(f); up.push(`${X(f * span).toFixed(1)} ${Y(c[a]).toFixed(1)}`); dn.unshift(`${X(f * span).toFixed(1)} ${Y(c[b]).toFixed(1)}`); } return 'M' + up.join('L') + 'L' + dn.join('L') + 'Z'; };
  const ticks = []; for (let t = lo + (lo % step ? step : 0); t <= hi; t += step) ticks.push(t);
  const marks = one ? [ref] : ls;
  const words = one ? `${ref.n}: ${o.split ? 'split, no median stands' : `median ${pct(ref.f.med)}`}, 80% range ${pct(ref.f.lo)} to ${pct(ref.f.hi)}` : ls.map(l => (gap12 && l.k === 12 ? '12 months: abstained, no range' : split3 && l.k === 3 ? `3 months: split, no median stands, 80% range ${pct(l.f.lo)} to ${pct(l.f.hi)}` : `${l.n}: median ${pct(l.f.med)}, 80% range ${pct(l.f.lo)} to ${pct(l.f.hi)}`)).join('. ');
  const dot = l => (gap12 && l.k === 12 ? '' : split3 && l.k === 3 ? `<text class="lbl" x="${X(3)}" y="${Math.max(mt + 8, Y(l.f.hi) - 6)}" text-anchor="middle">Split</text>` : `<circle cx="${X(l.k)}" cy="${Y(l.f.med)}" r="4" class="nowdot"/>`);
  const ends = `${o.split ? '' : `<text class="fcl" x="${X(upto) + 4}" y="${Y(end.f.med) + 4}">${pct(end.f.med)}</text>`}<text class="lbl" x="${X(upto) + 4}" y="${Y(end.f.hi) + 12}">${pct(end.f.hi)}</text><text class="lbl" x="${X(upto) + 4}" y="${Y(end.f.lo) + 4}">${pct(end.f.lo)}</text>`;
  return `<svg class="cx" viewBox="0 0 ${W} ${Ht}" width="100%" role="img" aria-label="${h.n}: one fan from now to ${upto} months. ${words}. Illustrative.">${ticks.map(t => `<line class="${t === 0 ? 'zero' : 'grid'}" x1="${ml}" x2="${W - mr}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${ml - 6}" y="${Y(t) + 4}" text-anchor="end">${t === 0 ? '0%' : (t > 0 ? '+' : '−') + Math.abs(t) + '%'}</text>`).join('')}<g data-mo="draw"><path class="b80" d="${pathOf('u', 'd')}"/><path class="b50" d="${pathOf('u5', 'd5')}"/>${o.split ? '' : `<path class="med" d="M${X(from)} ${Y(at(from / span).m)} L${X(upto)} ${Y(at(upto / span).m)}"/>`}</g>${marks.map(l => `<line class="now" stroke-dasharray="2 3" x1="${X(l.k)}" x2="${X(l.k)}" y1="${mt - 4}" y2="${Ht - mb}"/>${dot(l)}<text x="${l.k === span ? W - mr : X(l.k)}" y="${Ht - 6}" text-anchor="${l.k === span ? 'end' : 'middle'}">${l.n}</text>`).join('')}${ends}${gap12 ? `<text class="lbl" x="${X(12)}" y="${mt + 10}" text-anchor="end">12 months abstained</text>` : ''}<circle class="nowdot" cx="${X(0)}" cy="${Y(0)}" r="4.5"/><text x="${ml}" y="${Ht - 6}">Now</text></svg>`;
}

/* ---------- the instrument ---------- */
function inst(ctx, h = who(ctx.state)) {
  if (ctx.state === 'noModel') return `<div class="fc-inst" data-mo="rise">${logo(GOLD.c, GOLD.lg)}<div style="min-width:0"><div class="nm">Gold</div><div class="small">XAU/USD · spot · Gold &amp; silver</div><div class="small">Quote 21:00 · Source open (SCI-D08)</div></div><div class="sum">$2,684.20${chg(-0.4)}</div></div>`;
  return `<div class="fc-inst" data-mo="rise">${logo(h.c, h.lg)}<div style="min-width:0"><div class="nm">${h.n}</div><div class="small">${INFO[h.t]}</div></div><div class="sum">£${h.val}${ctx.state === 'stale' ? `<span class="chg" style="color:var(--warn);justify-content:flex-end">${ic('clock', 's14')}14:10</span>` : chg(h.day)}</div></div>`;
}
const hzSwitch = (ctx, on = 1, short = false) => {
  const chip = `<button type="button" class="chip${short ? ' fc' : ''}" aria-pressed="${short}">${ic('clock', 's14')}Short-term</button>`;
  const items = isWide(ctx) ? ['3 months', '6 months', '12 months'] : [['3M', '3 months'], ['6M', '6 months'], ['12M', '12 months']];
  const sw = seg(items, on, 'Forecast horizon', 'full');
  return `<div class="fc-hz${short ? ' off' : ''}" data-mo="rise">${short ? sw.replace('aria-pressed="true"', 'aria-pressed="false"') : sw}${chip}</div>`;
};
const modeCtl = on => `<div data-mo="rise">${seg(['Simple', 'Technical'], on, 'Detail', 'full')}</div>`;
const calib = (l = LONG[1]) => `<div class="fc-sub" style="margin-top:6px" data-mo="fade">In plain words: about 8 in 10 outcomes like this should land inside the 80% range. It held ${l.held}% of the time over ${l.scored} scored forecasts in walk-forward testing.${l.blocks < 20 ? ` Exploratory: ${l.blocks} non-overlapping blocks, under the 20 a claim needs.` : ''}</div>`;
const fcCardOf = (ctx, h = who(ctx.state)) => `<div class="card fcard" data-mo="card">${wf(fcard(h, { w: cw(ctx, 326, 500), h: cw(ctx, 186, 236), seed: 11, inter: isWide(ctx) })).replace('As of 21:15 London', asOf(ctx.state))}${calib()}${fcTable(h)}</div>`;
const legendHz = sp => `<div class="legend"><span><i class="lg-50"></i>50% range</span><span><i class="lg-80"></i>80% range</span>${sp ? '' : '<span><i class="lg-med"></i>Median</span>'}</div>`;
/* 3 and 12 months: the same card, on its own fan and its own date */
const baseOf = f => ({ lo: +(f.lo - 4.2).toFixed(1), hi: +(f.hi - 4.2).toFixed(1) });
const bothSides = (l, h) => { const b = baseOf(l.f); return `<div class="fc-kv" style="margin-top:10px"><span>R2-HGB v3, 80% range</span><b>${pct(l.f.lo)} to ${pct(l.f.hi)}</b></div><div style="margin-top:4px">${bar(l.f, { label: 'R2-HGB v3', split: true })}</div><div class="fc-kv" style="margin-top:10px"><span>Baseline, 80% range</span><b>${pct(b.lo)} to ${pct(b.hi)}</b></div><div style="margin-top:4px">${bar({ ...b, med: 0 }, { label: 'Baseline', split: true })}</div>`; };
const hzCard = (ctx, l, h) => { const sp = isSplit(ctx.state, h.t, [3, 6, 12].indexOf(l.k)); return `<div class="card fcard" data-mo="card"><div class="fh"><div class="label">${l.k}-month forecast · ${h.t}</div>${l.k === 12 && h.c === '--seg-ustech' ? pill('', 'pause', 'Last issue before the pause') : ''}${sp ? pill('', 'split', 'Models disagree') : l.blocks < 20 ? stateChip('exploratory') : `<span class="chip fc">${ic('fan', 's14')}Evaluated model</span>`}${sp ? '<div class="big"><span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">No median stands at this horizon</span></div>' : `<div class="big"><span class="amt">${roll(pct(l.f.med).replace('%', ''))}<span class="p">%</span></span><span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">median</span></div>`}</div><div class="rng"><span>80% range</span><b>${pct(l.f.lo)} to ${pct(l.f.hi)}</b><span>50% range</span><b>${pct(l.f.lo50)} to ${pct(l.f.hi50)}</b></div><div style="margin-top:10px">${ladderFan(ctx, { h, to: l.k, split: sp })}</div>${sp ? bothSides(l, h) : ''}${legendHz(sp)}<div class="fmeta"><span>${asOf(ctx.state)}</span><span>Data cutoff 21:00</span><span>Horizon ${l.due}</span><span>R2-HGB v3</span><span>Illustrative</span></div>${calib(l)}</div>`; };
const twoRanges = (h = byT.RELIANCE) => `<div class="card fcard" data-mo="card"><div class="fh"><div class="label">6-month forecast · ${h.t}</div>${pill('', 'split', 'Rules and models disagree')}</div><p class="fc-sub" style="margin-top:6px">The rules point down and the model points up. Each side shows, and no action is ranked.</p><div class="fc-kv" style="margin-top:10px"><span>Rules, heuristic strength</span><b>Pause · moderate</b><span>R2-HGB v3, 80% range</span><b>${pct(h.lo)} to ${pct(h.hi)}</b></div><div style="margin-top:4px">${bar(h, { label: 'R2-HGB v3', split: true })}</div><div class="fc-kv" style="margin-top:10px"><span>Baseline, 80% range</span><b>${pct(-15.5)} to ${pct(11.2)}</b></div><div style="margin-top:4px">${bar({ med: -2.4, lo: -15.5, hi: 11.2, lo50: -8.9, hi50: 4.2 }, { label: 'Baseline', split: true })}</div><div class="fmeta"><span>As of 21:15 London</span><span>Data cutoff 21:00</span><span>Illustrative</span></div></div>`;
const hist = (ctx, label, seed) => `<div class="card fcard" data-mo="card"><div class="label">Price history · 12 months · not a forecast</div><div style="margin-top:8px">${histChart(ctx, label, seed)}</div></div>`;
function forecastMain(ctx, hz = 1, h = subj(ctx.state, hz)) {
  const st = ctx.state, n = HN[hz], at = (OUT[st] || {})[h.t], other = at === undefined ? '' : HN[at], card = () => (hz === 1 ? fcCardOf(ctx, h) : hzCard(ctx, longOf(h)[hz], h));
  return region(ctx, {
    what: 'This forecast',
    ok: card,
    loading: () => banner('', 'Refreshing.', 'The last good forecast from 21:15 stays here, with its range, until the run lands.', 'refresh') + dim(card()),
    empty: () => stateCard('fan', 'No forecast yet', 'Apple joined your list today. Its first forecast comes from the next daily run, after tomorrow\'s close. Price history shows now.', '', '<span class="chip">Next run tomorrow 21:15</span>') + `<div class="card fcard" data-mo="card"><div class="label">Price history · 12 months</div><div style="margin-top:8px">${histChart(ctx, 'Apple')}</div></div>`,
    error: () => banner('fall', 'This forecast did not load.', `Twelve Data failed at 21:14. ${LASTGOOD}. That run shows in full, with its date.`, 'alert') + `<div>${btn('Try again', 'tinted', 'refresh')}</div>` + card(),
    stale: () => banner('warn', 'Held, not current.', `HSBC's last price is 14:10, past the freshness limit, so this is the last forecast issued. Its action stays Pause until its price returns. ${qLate}`, 'clock') + card(),
    offline: () => banner('', 'Saved at 21:15.', `This is the forecast on your device, not fresh analysis. Nothing updates until you reconnect.${q12(ctx)}`, 'wifi-off') + card(),
    noModel: () => stateCard('ban', 'Forecast unavailable', 'No forecast at any horizon for gold, while its valuation convention is open (SCI-D08). Price history still shows.', '', pill('', 'ban', 'Unavailable at all 7 horizons')) + `<div class="card fcard" data-mo="card"><div class="label">Price history · 12 months · not a forecast</div><div style="margin-top:8px">${histChart(ctx, 'Gold', 29)}</div><div class="fmeta"><span>Source open (SCI-D08)</span><span>Illustrative</span></div></div>`,
    disagreement: () => (isOut(st, h.t, hz) ? (h.t === 'RELIANCE' ? twoRanges(h) : banner('', 'Models disagree at 3 months.', 'R2-HGB v3 points up and the baseline points down, so no median stands. Both ranges show.', 'split') + card()) : banner('', `No conflict at ${n}.`, `R2-HGB v3 and the baseline agree here.${other ? ` ${h.n} is split at ${other} only.` : ''}`, 'split') + card()),
    abstention: () => (isOut(st, h.t, hz) ? stateCard('ban', 'The model abstained', `Too little comparable history for a calibrated ${n.replace(' months', '')}-month range, so no range is shown. Nothing stands in for it.`, '', pill('', 'ban', 'Abstained · no range shown')) + hist(ctx, h.n) : banner('', `${n[0].toUpperCase()}${n.slice(1)} stands.`, `${other ? `${other[0].toUpperCase()}${other.slice(1)} abstained. ` : ''}This one rests on its own evidence.`, 'ban') + card())
  });
}
const shareOf = h => (+h.val.replace(/,/g, '') / 846.124).toFixed(1);
const heldAction = (h, hz) => { const l = longOf(h)[hz]; return `${h.n} is ${shareOf(h)}% of the portfolio. The median is positive, but the ${l.n.replace(' months', '-month')} 80% range still includes a loss of ${Math.abs(l.f.lo).toFixed(1)}%. Illustrative.`; };
function actionCard(ctx, hz = 1, h = subj(ctx.state, hz)) {
  const st = ctx.state, at = (OUT[st] || {})[h.t], out = isOut(st, h.t, hz), wrap = (a, txt) => `<div class="card fc-card" data-mo="card"><div class="fc-vh">${a}<h4>Ranked action</h4><span class="chip illus">Decision support</span></div><p class="fc-sub">${txt}</p></div>`;
  const none = '<span class="chip">No action</span>', held = (more = '') => wrap(badge(h.act), heldAction(h, hz) + more);
  return ({
    loading: () => wrap('<span class="sk" style="height:26px;width:72px"></span>', 'Its reasons load here, and nothing is guessed.'),
    empty: () => wrap(none, 'No forecast yet, so no action.'),
    stale: () => wrap(pill('stale', 'clock', 'Stale'), 'Pause was published before HSBC\'s price went stale. It is held, not current, until its price returns.'),
    noModel: () => wrap(none, 'Gold and silver are not ranked (SCI-D08), so no action exists. Nothing is implied.'),
    disagreement: () => (out ? wrap(pill('', 'split', 'Conflicted'), `No action is ranked on ${h.n} at ${HN[hz]} while the two disagree. The decision is yours, outside MyPrediction.`) : held()),
    /* a horizon that stands keeps its action; the other horizon's abstention still takes the name off its list (POLICY-006) */
    abstention: () => (out ? wrap(none, `No range at ${HN[hz]}, so no action. ${h.n} is not ranked until the model qualifies again.`) : held(at === undefined ? '' : ` ${HN[at]} abstained, so ${h.n} is not ranked until the model qualifies again. <span class="chip proposed"><span class="dot"></span>Proposed · MP-144</span>`))
  }[st] || held)();
}
const LINKS = [['fan', 'Short-term', '1 to 20 sessions, kept apart'], ['split', 'Rules, models and Claude', 'Three views side by side'], ['scenario', 'Scenarios', '3 and 5 years, no likelihood'], ['layers', 'Evidence trail', 'Source to outcome']];
const linksCard = ctx => `<div class="card" data-mo="card">${LINKS.filter(l => ctx.state !== 'noModel' || l[1] === 'Evidence trail').map(([i, t, s]) => `<button class="fc-link" type="button">${ic(i, 's18')}<span>${t}<small>${s}</small></span>${ic('chev-r', 's18')}</button>`).join('')}</div>`;
/* the proof beside a forecast is that horizon's own record, with its label */
const dotsAt = l => { const inside = Math.round(l.scored * l.held / 100), out = l.scored - inside, miss = i => Math.floor((i + 1) * out / l.scored) > Math.floor(i * out / l.scored); return `<div class="cal" role="img" aria-label="${l.scored} scored forecasts: ${inside} inside their 80% range, ${out} outside">${Array.from({ length: l.scored }, (_, i) => `<i class="${miss(i) ? 'miss' : ''}"></i>`).join('')}</div><div class="legend"><span><i class="lg-sc"></i>Inside range (${inside})</span><span><i class="lg-miss"></i>Outside (${out})</span></div>`; };
const proofAt = (hz, compact = true) => { const l = LONG[hz], base = wf(proof(compact)), dots = compact || hz === 1 ? base : base.replace(/<div class="cal"[\s\S]*?<\/div>\s*<div class="legend">[\s\S]*?<\/div>/, dotsAt(l)); return dots.replace('6-month task', `${l.k}-month task`).replace(/\b79\b/g, l.held).replace(/over 52 /g, `over ${l.scored} `).replace('<i data-mo="barx"></i>', `<i data-mo="barx" style="width:${l.held}%"></i>`).replace('<div class="proofmodel"', `${l.blocks < 20 ? `<div style="margin-top:8px">${stateChip('exploratory')}</div>` : ''}<div class="proofmodel"`); };
const proofMini = (ctx, hz = 1) => {
  const st = ctx.state, card = h => `<div class="card fcard" data-mo="card">${h}</div>`;
  return ({
    loading: dim(card(proofAt(hz))),
    empty: card(`<div class="label">Proof</div><p class="fc-sub" style="margin-top:6px">Nothing to prove yet: no forecast has been issued.</p>`),
    noModel: card(`<div class="label">Proof</div><p class="fc-sub" style="margin-top:6px">No forecast, so no record. No track record is claimed for gold.</p>`),
    error: card(`<div class="label">Proof</div><p class="fc-sub" style="margin-top:6px">Proof unavailable. The forecast still shows.</p><div style="margin-top:8px">${btn('Try again', 'tinted', 'refresh').replace('class="btn', 'class="btn sm')}</div>`)
  })[st] || card(proofAt(hz));
};
/* the technical mode: more of the working, and the same uncertainty */
const hasFigure = (st, hz, h) => !['empty', 'noModel'].includes(st) && !(isOut(st, h.t, hz) && (st === 'abstention' || h.t === 'RELIANCE'));
const techCard = (ctx, hz, h) => { const l = longOf(h)[hz], f = l.f, sp = isSplit(ctx.state, h.t, hz); return (ctx.state === 'loading' ? dim : x => x)(`<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Technical</h4><span class="chip proposed"><span class="dot"></span>Proposed · MP-145</span></div><div class="fc-kv"><span>10th percentile</span><b>${pct(f.lo)}</b><span>25th percentile</span><b>${pct(f.lo50)}</b><span>Median</span><b>${sp ? 'Split · no median' : pct(f.med)}</b><span>75th percentile</span><b>${pct(f.hi50)}</b><span>90th percentile</span><b>${pct(f.hi)}</b><span>Coverage, walk-forward</span><b>${l.held}% of ${l.scored}</b><span>Calibration slope</span><b>${REC[hz].cal}</b><span>Non-overlapping blocks</span><b>${l.blocks}${l.blocks < 20 ? ' · Exploratory' : ''}</b><span>Task</span><b>${h.t} · ${l.k}-month return</b><span>Model</span><b>R2-HGB v3</b><span>Dataset</span><b>ds-2026-10-30</b></div><p class="fc-sub">Simple and technical read the same forecast. Both keep its range and its uncertainty.</p></div>`); };
const ladTech = (ctx, h) => (ctx.state === 'loading' ? dim : x => x)(`<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Technical</h4><span class="chip proposed"><span class="dot"></span>Proposed · MP-145</span></div><table class="ht pwa fc-tt"><thead><tr><th>Horizon</th><th class="r">10th</th><th class="r">25th</th><th class="r">75th</th><th class="r">90th</th></tr></thead><tbody>${longOf(h).map((l, i) => (ctx.state === 'abstention' && isOut(ctx.state, h.t, i) ? `<tr><td>${l.n}</td><td class="r" colspan="4">Abstained · no range</td></tr>` : `<tr><td>${l.n}${isSplit(ctx.state, h.t, i) ? ' · split' : ''}</td>${[l.f.lo, l.f.lo50, l.f.hi50, l.f.hi].map(v => `<td class="r">${pct(v)}</td>`).join('')}</tr>`)).join('')}</tbody></table><div class="fc-kv"><span>Calibration slope, 6M</span><b>0.96</b><span>Model</span><b>R2-HGB v3</b><span>Dataset</span><b>ds-2026-10-30</b></div><p class="fc-sub">Simple and technical read the same forecast. Both keep its range and its uncertainty.</p></div>`);

/* ---------- short-term, apart ---------- */
function shortRow(s, ctx) {
  const st = ctx.state, row = (chip, why) => `<div class="fc-lad sm" data-mo="rise"><div class="hzn">${s.n}</div><div></div>${chip}<div class="why">${why}</div></div>`;
  if (s.state === 'noclear') return row(stateChip('noclear'), s.why);
  if (s.state === 'costpaused') return row(stateChip('costpaused'), s.why);
  if (st === 'noModel' && s.state !== 'rules') return row(pill('', 'pause', 'Model paused'), 'Model paused (POLICY-003). Rules read neutral, heuristic strength moderate. Not a probability.');
  if (st === 'abstention' && s.n === '20 sessions') return row(pill('', 'ban', 'Abstained'), 'Too little comparable history, so no range.');
  if (s.state === 'rules') return row(stateChip('rules'), 'No qualified model. Rules read neutral, heuristic strength weak. Not a probability.');
  if (s.state === 'practice') return row(stateChip('practice'), 'Shadow trial, week 5 of 8. No range is published until it qualifies and you say yes.');
  const split = st === 'disagreement' && s.n === '10 sessions';
  return `<div class="fc-lad sm" data-mo="rise"><div class="hzn">${s.n}</div><div>${bar(s.f, { min: -12, max: 12, label: s.n, split })}</div><div class="med">${split ? ic('split', 's18') : pct(s.f.med)}</div><div class="rg">80% range ${pct(s.f.lo)} to ${pct(s.f.hi)} · held ${s.held}% of ${s.scored} in walk-forward testing${st === 'stale' ? ' · held, not current' : ''}</div></div>`;
}
const shortCard = (ctx, h = shortH(ctx.state)) => `<div class="card" data-mo="card"><div class="fmeta fc-smeta"><span>${asOf(ctx.state)}</span><span>Data cutoff 21:00</span><span>${ctx.state === 'noModel' ? 'R2-HGB v3 paused' : 'R2-HGB v3'}</span><span>Illustrative</span></div>${shortOf(h).map(s => shortRow(s, ctx)).join('')}</div>`;
const shortFoot = () => `<div class="fc-sub" data-mo="fade">Short-term figures never feed growth or protection; only the opportunity part of a score uses them. Next day and 5 sessions stay listed with no qualified model: a horizon is never removed, and never given a made-up number.</div>`;
function shortMain(ctx) {
  const lead = () => banner('', 'Short-term.', 'Kept apart on purpose. MyPrediction is built for 3, 6 and 12 months.', 'clock');
  const list = () => `${lead()}${shortCard(ctx)}${isWide(ctx) ? '' : shortFoot()}`;
  return region(ctx, {
    what: 'Short-term forecasts', ok: list,
    loading: () => `${banner('', 'Short-term.', 'Reading the 21:15 run. The last good rows stay here until it lands.', 'clock')}${dim(shortCard(ctx))}`,
    empty: () => stateCard('clock', 'No short-term forecast yet', 'A new listing needs its first run. The four rows appear tomorrow, each with its own state.'),
    error: () => banner('fall', 'Short-term forecasts did not load.', `${LASTGOOD}. That run shows in full.`, 'alert') + `<div>${btn('Try again', 'tinted', 'refresh')}</div>` + shortCard(ctx),
    stale: () => banner('warn', 'Stale input.', `HSBC's price stopped at 14:10, so 10 and 20 sessions are held, not current, until its price returns. ${qLate}`, 'clock') + shortCard(ctx),
    offline: () => banner('', 'Saved at 21:15.', `Short-term figures age fastest. Treat these as a record, not a reading.${q12(ctx)}`, 'wifi-off') + shortCard(ctx),
    noModel: () => banner('', 'Rules only.', 'The short-term model is paused (POLICY-003), so all four rows show the rules with their heuristic strength. Gold has no rows: no forecast and no rules until its valuation convention is set (SCI-D08).', 'pause') + shortCard(ctx),
    disagreement: () => banner('', 'Models disagree at 10 sessions.', 'R2-HGB v3 points up and the baseline points down, so no median stands. Both are in the proof.', 'split') + shortCard(ctx),
    abstention: () => banner('', '20 sessions abstained.', 'The other rows stand on their own evidence.', 'ban') + shortCard(ctx)
  });
}
/* every state a horizon can be in: what the labels on Short-term and the ladder mean */
const qH = '<span class="chip proposed"><span class="dot"></span>Proposed · MP-145</span>';
const KEY = [
  { n: '10 sessions', chip: () => stateChip('eligible'), why: 'A qualified model, with a calibrated range and its walk-forward record.' },
  { n: 'Next day', chip: () => stateChip('rules'), why: 'No qualified model. Rules read with a heuristic strength, which is not a probability.' },
  { n: '5 sessions', chip: () => stateChip('practice'), why: 'In a shadow trial. No range is published until it qualifies and you say yes.' },
  { n: '20 sessions', state: 'noclear', why: `The evidence is too evenly split to state a direction, so none is stated. The range still shows. ${qH}` },
  { n: '12 months', chip: () => pill('', 'ban', 'Abstained'), why: 'Too little comparable history, so no range.' },
  { n: '6 months', chip: () => pill('stale', 'clock', 'Stale input'), why: `An input is past its freshness limit, so the last issue is held, not current. ${qLate}` },
  { n: '10 sessions', chip: () => pill('', 'pause', 'Model paused'), why: 'Paused by the safety rule (POLICY-003). The rules show instead.' },
  { n: '20 sessions', state: 'costpaused', why: `The next run waits at the £85 line of the £100 ceiling. The last issue stays dated, and nothing is made up. ${qH}` },
  { n: 'All seven', chip: () => pill('', 'ban', 'Unavailable'), why: 'No forecast can be made, and the reason shows: gold and silver today (SCI-D08).' }
];
const keyLead = () => `<div class="fc-sub" data-mo="fade">A horizon always says which state it is in. None is removed, and none is given a made-up number.</div>`;
const keyA = ctx => `${keyLead()}<div class="card" data-mo="card">${KEY.map(k => (k.state ? shortRow(k, ctx) : `<div class="fc-lad sm" data-mo="rise"><div class="hzn">${k.n}</div><div></div>${k.chip()}<div class="why">${k.why}</div></div>`)).join('')}</div>`;
/* the ladder's order: the long horizons, nearest first, then short-term, nearest first, then all seven */
const keyRank = k => (/months/.test(k.n) ? parseInt(k.n, 10) : k.n === 'Next day' ? 100 : /sessions/.test(k.n) ? 100 + parseInt(k.n, 10) : 999);
const keyB = ctx => `${keyLead()}<div class="card" data-mo="card">${[...KEY].sort((a, b) => keyRank(a) - keyRank(b)).map(k => ladRow(k.state ? k : { ...k, state: 'key' }, ctx)).join('')}</div>`;
const naHelp = Object.fromEntries(['loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'].map(k => [k, 'This page explains the labels. It reads no data, so this state cannot change it.']));

/* ---------- proof ---------- */
const metricsOf = hz => { const l = LONG[hz], r = REC[hz]; return [['Coverage', `${l.held}%`, '80% ranges, target 80%'], ['Hit rate', r.hit, `Direction, ${l.scored} scored`], ['Error', r.err, 'Median absolute'], ['Calibration', r.cal, 'Slope, 1.00 is exact'], ['Turnover', r.turn, 'Action changes a year'], ['Benchmark', r.bench, 'Ahead of the S&P 500 base rate']]; };
const metrics = (ctx, hz = 1) => `<div class="fc-metrics${isWide(ctx) ? ' w3' : ''}">${metricsOf(hz).map(([l, v, u]) => `<div data-mo="rise"><span class="label">${l}</span><b>${roll(v)}</b><span class="u">${u}</span></div>`).join('')}</div>`;
const walk = (hz = 1) => `<div class="card fc-card" data-mo="card"><h4>How it was tested</h4><div class="fc-kv"><span>Dataset</span><b>ds-2026-10-30</b><span>Walk-forward folds</span><b>22 since 2015</b><span>Embargo</span><b>${REC[hz].embargo}</b><span>Non-overlapping blocks</span><b>${LONG[hz].blocks}${LONG[hz].blocks < 20 ? ' · Exploratory' : ''}</b><span>Live, matured</span><b>0 · first due ${REC[hz].due}</b></div><p class="fc-sub">Limits: few cases of a rate shock in the sample. One outcome was corrected in March 2025; its new score sits beside the old one.</p><div class="fc-kv"><span>March 2025 outcome, score v1</span><b>Outside the range</b><span>March 2025 outcome, score v2</span><b>Inside the range</b></div></div>`;
const SHEETS = [
  ['cube', 'Model sheet', 'R2-HGB v3 · approved 1 Oct 2026', 'Approved 1 Oct 2026 on dataset ds-2026-10-30, with its folds, baseline and limits. Live, matured: 0.'],
  ['layers', 'Regime sheet', 'Late-cycle, 14 of 22 folds', 'Today reads late-cycle, the regime in 14 of the 22 folds. A regime is a way to read the record, not a forecast.'],
  ['clock', 'Analog sheet', '38 matched days since 2015', '38 matched days since 2015, from 9 separate cases. Analogs show what happened then, not what will happen.'],
  ['alert', 'Event sheet', '3 of 7 kinds qualified so far', '3 of 7 event kinds have qualified. The other 4 stay out of this forecast until they do.'],
  ['fan', 'Pattern sheet', 'Not qualified', 'No pattern has qualified, so none feeds this forecast.']
];
const sheets = () => `<div class="card" data-mo="card">${SHEETS.map(([i, t, s, more]) => `<details class="fc-det"><summary>${ic(i, 's18')}<span>${t}<small>${s}</small></span>${ic('chev-r', 's18')}</summary><p class="fc-sub">${more}</p></details>`).join('')}</div>`;
const hzRecord = () => `<div class="card" data-mo="card">${LONG.map(l => `<div class="fc-lad sm" data-mo="rise"><div class="hzn">${l.n}</div><div class="fc-sub">${l.held}% of ${l.scored}</div>${l.blocks < 20 ? stateChip('exploratory') : '<span class="chip">Walk-forward</span>'}${l.blocks < 20 ? `<div class="why">${l.blocks} non-overlapping blocks, under the 20 a claim needs.</div>` : ''}</div>`).join('')}</div>`;
const proofTop = hz => `<div class="card fcard" data-mo="card">${proofAt(hz, false)}</div>`;
function proofMain(c) {
  const ctx = c, hz = c.hz, l = LONG[hz], r = REC[hz];
  const tested = () => `<div class="card fc-card" data-mo="card">${l.blocks < 20 ? `<div class="fc-vh"><h4>Hit rate never stands alone</h4>${stateChip('exploratory')}</div>` : '<h4>Hit rate never stands alone</h4>'}${metrics(ctx, hz)}<p class="fc-sub">Walk-forward scores, not live ones. A judge or evaluation score is never shown as accuracy.</p></div>`;
  const ok = () => proofTop(hz) + tested() + (isWide(ctx) ? '' : hzRecord() + walk(hz) + sheets());
  return region(ctx, {
    what: 'The proof', ok,
    loading: () => banner('', 'Refreshing.', 'The last good record from 21:15 stays here until the run lands.', 'refresh') + dim(ok()),
    empty: () => stateCard('clock', 'Awaiting maturity', `No ${l.k}-month outcome has matured live: a ${l.k}-month record waits ${l.k === 12 ? 'a year' : `${l.k} months`}, so no live record is claimed. The first is due ${r.due}.`, '', '<span class="chip">0 matured live</span>') + hzRecord(),
    error: () => stateCard('alert', 'Proof unavailable', 'The record did not load at 21:14. The forecast still shows, and its calibration line stays labelled with its time.', btn('Try again', 'tinted', 'refresh')),
    stale: () => banner('warn', 'HSBC\'s price is stale.', `No live forecast has matured yet, so no grade is held up. A grade that falls due waits until its price returns. Nobody edits a past score. ${qLate}`, 'clock') + ok(),
    offline: () => banner('', 'Saved at 21:15.', `The record on your device. New grades arrive when you reconnect.${q12(ctx)}`, 'wifi-off') + ok(),
    noModel: () => stateCard('cube', 'No forecast, no record', 'Gold has no forecast while its valuation convention is open (SCI-D08). There is nothing here to score, and no record is claimed.'),
    disagreement: () => banner('', 'Baseline comparison.', 'R2-HGB v3 and the baseline sit together so you can weigh them. Rules carry no scored record.', 'split') + `<div class="card fc-card" data-mo="card"><div class="fc-kv"><span>R2-HGB v3 · coverage</span><b>${l.held}%</b><span>Baseline · coverage</span><b>${r.baseHeld}%</b><span>R2-HGB v3 · error</span><b>${r.err}</b><span>Baseline · error</span><b>${r.baseErr}</b></div></div>` + ok(),
    abstention: () => banner('', 'Abstentions are counted.', `The model abstained on 7 of ${l.scored + 7} origins. They are reported here, and are not scored as hits or misses.`, 'ban') + ok()
  });
}
const proofRail = c => (c.state === 'noModel' ? `<div class="card fc-card" data-mo="card"><h4>Why there is no sheet</h4><p class="fc-sub">Model, regime and analog sheets stand behind a forecast. Gold has none until its valuation convention is set (SCI-D08).</p></div>` : ['empty', 'error'].includes(c.state) ? sheets() : hzRecord() + walk(c.hz) + sheets());

/* ---------- three views ---------- */
const clMark = '<span class="cl-mark s" aria-hidden="true"><i></i><i></i><i></i></span>';
function vRules(c) {
  const st = c.state;
  if (st === 'noModel') return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${ic('sliders', 's18')}<h4>Rules</h4><span class="chip proposed"><span class="dot"></span>Proposed · SCI-D08</span></div><div class="fc-kv"><span>Reads</span><b>Nothing</b></div><p class="fc-sub">Rules read nothing for gold without a valuation convention.</p></div>`;
  const body = c.pause ? `<div class="fc-kv"><span>Reads</span><b>Pause</b><span>Heuristic strength</span><b>Moderate</b></div><ul class="fc-sub"><li>Price is below its 200-day average.</li><li>Drawdown of 11% from its high.</li></ul>`
    : st === 'stale' ? `<div class="fc-kv"><span>Reads</span><b>Pause</b><span>Heuristic strength</span><b>Moderate</b></div><ul class="fc-sub"><li>Last price is past the freshness limit.</li><li>Nothing newer to read until its price returns.</li></ul>`
      : `<div class="fc-kv"><span>Reads</span><b>Hold</b><span>Heuristic strength</span><b>Moderate</b></div><ul class="fc-sub"><li>Price is above its 200-day average.</li><li>Valuation is above its 5-year median.</li></ul>`;
  return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${ic('sliders', 's18')}<h4>Rules</h4><span class="chip illus">Heuristic</span></div>${body}<p class="fc-sub">Strength is a label, not a probability.</p></div>`;
}
function vModels(c) {
  const st = c.state;
  if (st === 'noModel') return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${ic('cube', 's18')}<h4>Models</h4><span class="chip">Unavailable</span></div><p class="fc-sub">No approved model for gold (SCI-D08). Nothing is folded in: this view stays empty and says so.</p></div>`;
  if (st === 'abstention') return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${ic('cube', 's18')}<h4>Models</h4>${pill('', 'ban', 'Abstained')}</div><p class="fc-sub">Too little comparable history for a calibrated range. The rules stand alone today.</p></div>`;
  const sp = st === 'disagreement', l = longOf(c.h)[c.hz], f = l.f, at = HS[c.hz];
  return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${ic('cube', 's18')}<h4>Models</h4><span class="chip fc">Calibrated</span></div><div class="fc-kv">${sp ? '' : `<span>Median, ${at}</span><b>${pct(f.med)}</b>`}<span>80% range${sp ? `, ${at}` : ''}</span><b>${pct(f.lo)} to ${pct(f.hi)}</b></div>${bar(f, { label: 'R2-HGB v3', split: sp })}<p class="fc-sub">R2-HGB v3. Held ${l.held}% of ${l.scored} scored in walk-forward testing.${l.blocks < 20 ? ' Exploratory.' : ''}</p></div>`;
}
function vClaude(c) {
  const st = c.state, h = c.h, provider = h.v === 'XNAS' ? 'Twelve Data' : 'Yahoo';
  if (st === 'noModel') return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${clMark}<h4>Claude</h4><span class="chip">Off</span></div><p class="fc-sub">Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in.</p></div>`;
  if (st === 'error') return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${clMark}<h4>Claude</h4><span class="chip error">Failed</span></div><p class="fc-sub">The explanation route failed at 21:14. Rules and models still show; only the words are missing.</p>${btn('Try again', 'tinted', 'refresh').replace('class="btn', 'class="btn sm')}</div>`;
  const f = longOf(h)[c.hz].f;
  const text = modelSplit(c) ? `The model points up and the baseline points down, so no median stands at ${HN[c.hz]}. The 80% range runs <span class="cl-fig">${pct(f.lo)} to ${pct(f.hi)}</span><span class="cl-ref">3</span>. The rules read <span class="cl-fig">Hold</span><span class="cl-ref">1</span>.`
    : st === 'disagreement' ? `The rules read <span class="cl-fig">Pause</span><span class="cl-ref">1</span> after an <span class="cl-fig">11%</span><span class="cl-ref">2</span> drawdown, while the model's 80% range runs <span class="cl-fig">${pct(f.lo)} to ${pct(f.hi)}</span><span class="cl-ref">3</span>. Each side is working from different evidence.`
    : st === 'stale' ? `The last forecast has a median of <span class="cl-fig">${pct(f.med)}</span><span class="cl-ref">3</span>, issued before the price stopped. The rules read <span class="cl-fig">Pause</span><span class="cl-ref">1</span> until it returns.`
      : st === 'abstention' ? `The model abstained, so I can only describe the rules, which read <span class="cl-fig">Hold</span><span class="cl-ref">1</span>.`
        : c.pause ? `The median of <span class="cl-fig">${pct(f.med)}</span><span class="cl-ref">3</span> sits inside a range that still includes a loss of <span class="cl-fig">${Math.abs(f.lo).toFixed(1)}%</span><span class="cl-ref">3</span>. The rules read <span class="cl-fig">Pause</span><span class="cl-ref">1</span> after an <span class="cl-fig">11%</span><span class="cl-ref">2</span> drawdown, and they disagree with the model at 6 months.`
        : `The median of <span class="cl-fig">${pct(f.med)}</span><span class="cl-ref">3</span> sits inside a range that still includes a loss of <span class="cl-fig">${Math.abs(f.lo).toFixed(1)}%</span><span class="cl-ref">3</span>. The rules read <span class="cl-fig">Hold</span><span class="cl-ref">1</span>, so the two agree on direction.`;
  return `<div class="card fc-card" data-mo="card"><div class="fc-vh">${clMark}<h4>Claude</h4><span class="chip illus">Words only</span></div><p class="cl-a" style="font-size:15px;line-height:20px">${text}</p><ul class="cl-src">${(st === 'abstention' ? ['1 Rules v1'] : ['1 Rules v1', `2 Price · ${provider}`, '3 R2-HGB v3']).map(s => `<li>${s}</li>`).join('')}</ul><p class="fc-sub">Every figure comes from code. Claude supplied none.</p></div>`;
}
const compare = s => {
  const st = s.state, ms = modelSplit(s), c = (l, v) => `<div data-mo="rise"><span class="label">${l}</span><b>${v}</b></div>`;
  return `<div class="fc-cmp">${c('Rules', st === 'noModel' ? 'Nothing' : s.pause || st === 'stale' ? 'Pause' : 'Hold')}${c('Models', st === 'noModel' ? 'None' : st === 'abstention' ? 'Abstained' : ms ? 'Split' : st === 'disagreement' ? 'Points up' : pct(longOf(s.h)[s.hz].f.med))}${c('Together', ms ? 'No median' : st === 'disagreement' ? 'Disagree' : s.pause ? 'Disagree at 6M' : st === 'noModel' ? 'Neither runs' : st === 'abstention' ? 'One side' : st === 'stale' ? 'Held' : 'Agree')}</div>`;
};
const split = st => `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Contribution split</h4><span class="chip proposed"><span class="dot"></span>Experimental</span></div>${st === 'noModel' ? '<p class="fc-sub">No split: neither side runs for gold, and nothing is folded into a single score.</p>' : st === 'abstention' ? '<p class="fc-sub">No split: one side is missing, and it is never folded into a single score.</p>' : `<div class="fc-split" role="img" aria-label="Rules 38%, models 62%. Experimental, with no probability of its own."><i data-mo="barx" style="width:38%;background:var(--ink-2)"></i><i data-mo="barx" style="width:62%;background:var(--fc-line)"></i></div><div class="fc-kv"><span>Rules</span><b>38%</b><span>Models</span><b>62%</b></div><p class="fc-sub">How much each side moved this view. It carries no probability of its own.</p>`}</div>`;
const f7 = () => `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Contribution policy</h4><span class="chip">Not qualified</span></div><p class="fc-sub">Week 3 of 8 in replay and shadow. It appears only after beating simple rules for 8 weeks and your yes, and then only as a simulation.</p></div>`;
function viewsMain(c) {
  const ctx = c, st = c.state;
  const lead = {
    loading: banner('', 'Refreshing.', 'Each view loads on its own, and the last good one stays here until then.', 'refresh'),
    error: banner('warn', 'One view failed.', 'The others still show. The failed view says why.', 'alert'),
    stale: banner('warn', 'HSBC\'s price is stale.', `It stopped at 14:10, so all three views describe the last issue, not today, until its price returns. ${qLate}`, 'clock'),
    offline: banner('', 'Saved at 21:15.', `All three views are from your device.${q12(ctx)}`, 'wifi-off'),
    noModel: banner('', 'Nothing to compare yet.', 'Gold has no model and no rules reading until its valuation convention is set (SCI-D08). No combined reading is made.', 'cube'),
    disagreement: modelSplit(c) ? banner('', `Models disagree at ${HN[c.hz]}.`, 'Each keeps its own range, no median stands, and no action is ranked there.', 'split') : banner('', 'Rules and models disagree.', 'Each side keeps its own evidence, and no action is ranked.', 'split'),
    abstention: banner('', `The model abstained at ${HN[c.hz]}.`, 'The rules still show. Nothing is folded into one score.', 'ban')
  }[st] || '';
  const three = () => `${isWide(ctx) ? '' : compare(c)}<div class="${isWide(ctx) ? 'fc-3' : ''}" style="${isWide(ctx) ? '' : 'display:grid;gap:12px'}">${vRules(c)}${vModels(c)}${vClaude(c)}</div><div style="display:grid;grid-template-columns:${isWide(ctx) ? 'repeat(2,minmax(0,1fr))' : 'minmax(0,1fr)'};gap:${isWide(ctx) ? 14 : 12}px;align-items:start">${split(st)}${f7()}</div>`;
  if (st === 'loading') return lead + dim(three());
  if (st === 'empty') return stateCard('split', 'No views yet', 'A new listing has no rules, model or Claude view until its first run tomorrow. Nothing is drawn until then.');
  return lead + three();
}

/* ---------- scenarios ---------- */
const BASE = { start: 14820.5, fee: .2, fx: 0, contrib: 0, infl: 2.5 };
const TPL = [['Downside', -2], ['Central', 5], ['Upside', 10]];
const worth = (r, y, start = BASE.start) => { let v = start; for (let i = 0; i < y; i++) v = v * (1 + (r - BASE.fee + BASE.fx) / 100) + BASE.contrib * 12; return v; };
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
function scenMain(ctx, figuresFirst = false) {
  const chart = () => `<div class="card fcard" data-mo="card"><div class="fh"><div class="label">Scenarios · this holding</div>${noLike()}</div><div style="margin-top:8px">${scenChart(ctx)}</div><div class="legend"><span><i class="lg-scen"></i>Conditional path, computed from the assumptions</span></div></div>`;
  const out = () => `<div class="card fc-card" data-mo="card"><h4>At 3 years</h4>${scenRow(3)}<h4 style="margin-top:6px">At 5 years</h4>${scenRow(5)}<p class="fc-sub">Central does not mean most likely. No path has a probability, and none extends a 12-month forecast. Illustrative.</p></div>`;
  const all = () => (figuresFirst ? out() + chart() : chart() + out());
  return region(ctx, {
    what: 'Scenarios', ok: all,
    loading: () => banner('', 'Reading your saved copy.', 'The last saved paths stay here, from 2 November, until it lands.', 'refresh') + dim(all()),
    empty: () => stateCard('scenario', 'Template values wait for you', 'The downside, central and upside values need your approval before they are used (SCI-D06). Until then no scenario runs and no path is drawn.', btn('Review the template values', 'primary')),
    error: () => banner('fall', 'Inflation of 40% was refused.', 'It must be between 0% and 15%. The last saved assumptions stay, and so do these paths.', 'alert') + all(),
    stale: () => banner('warn', 'FX is from 2 November.', 'The GBP/USD quote is a day old, so the pound figures are held to that rate.', 'clock') + all(),
    offline: () => banner('', 'Saved at 21:15.', `Editing waits until you reconnect. These paths are from your last saved assumptions.${q12(ctx)}`, 'wifi-off') + all()
  });
}
function assume(ctx) {
  const st = ctx.state;
  if (st === 'empty' || st === 'loading') return `<div class="card fc-card" data-mo="card"><h4>Assumptions</h4><p class="fc-sub">${st === 'empty' ? 'Return, inflation, FX, contributions, fees and dividends each get a stated value here once you approve the templates.' : 'Reading your saved copy from 2 November.'}</p></div>`;
  const off = st === 'offline' ? ' (read only offline)' : '';
  return `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Assumptions${off}</h4><span class="chip owner"><span class="dot"></span>Your copy</span></div><div class="fc-sub" style="margin-bottom:2px">Editing changes your copy, labelled yours. Templates stay as approved.</div>
    ${field('Downside return', '−2.0%', 'A year')}${field('Central return', '5.0%', 'A year · edited by you')}${field('Upside return', '10.0%', 'A year')}
    ${field('Inflation', st === 'error' ? '40%' : '2.5%', st === 'error' ? 'Refused: 0% to 15%' : 'A year', st === 'error' ? 1 : '')}${field('FX, GBP/USD drift', '0.0%', st === 'stale' ? 'Quote from 2 Nov' : 'A year')}${field('Monthly contribution', '£0')}${field('Fees', '0.20%', 'A year')}<div class="fc-field fc-choice"><span>Dividends</span>${seg(['Reinvest', 'Cash'], 0, 'Dividends')}</div>
    <div style="display:grid;gap:8px;margin-top:4px">${seg(['This holding', 'Whole portfolio'], 0, 'Scope', 'full')}</div></div>`;
}

/* ---------- the evidence trail ---------- */
const SRC = { AAPL: 'Twelve Data · close 2 Nov · received 2 Nov 21:02', RELIANCE: 'Yahoo · close 2 Nov · received 2 Nov 10:12', AZN: 'Yahoo · close 2 Nov · received 2 Nov 16:52', HSBA: 'Yahoo · last price 14:10 · stale' };
const RISK = { AAPL: 'Exposure snapshot · US tech 31.0%', RELIANCE: 'Exposure snapshot · India 28.5%', AZN: 'Exposure snapshot · UK 18.1%', HSBA: 'Exposure snapshot · HSBC left out while stale' };
const chainOf = (h, hz = 1) => { const l = longOf(h)[hz]; return [
  ['db', 'Source', SRC[h.t], 'Known before the 21:00 data cutoff. Nothing received after it is used.'],
  ['layers', 'Ledger', `${h.n} position · v12 · £${h.val}`, 'Read from ledger revision 214.'],
  ['shield', 'Risk', RISK[h.t], 'The snapshot taken with this run.'],
  ['fan', 'Forecast', `v3 · ${pct(l.f.med)} at ${HS[hz]} · R2-HGB v3. Replaces v2, corrected for an FX quote received 20:52`, 'As of 21:15 London, data cutoff 21:00. v2 is kept, annotated, with a pointer here.'],
  ['target', 'Action', `${h.act} · policy v1 · decision support`, 'The policy version and its components, as published.'],
  ['clock', 'Outcome', `Not yet: matures ${l.due}`, 'Code grades it once the horizon has passed.'],
  ['lock', 'Audit', 'Recorded 21:15 · 7 of 7 links resolve', 'Each link opens the stored record. Nothing is rebuilt.']
]; };
const goldChain = () => [
  ['db', 'Source', 'Spot quote 21:00 · Source open (SCI-D08)', 'Quoted before the 21:00 data cutoff. Its source is still to be set.'],
  ['layers', 'Ledger', 'Watch-only: no position', 'Gold is on your watch list. The ledger holds none.'],
  ['shield', 'Risk', 'Not in the portfolio, so no exposure', 'Nothing here counts towards the snapshot.'],
  ['ban', 'Forecast', 'None: the valuation convention is open (SCI-D08)', 'No model or rule produced a figure, and none is implied.'],
  ['target', 'Action', 'None: not ranked', 'Nothing was published.'],
  ['clock', 'Outcome', 'Nothing to score', 'No forecast was issued, so nothing matures.'],
  ['lock', 'Audit', 'Recorded 21:15 · 7 of 7 links resolve', 'Each link opens the stored record. Nothing is rebuilt.']
];
const stepOf = (i, s, sel) => `<details class="fc-step${sel === i ? ' on' : ''}"${sel === i ? ' open' : ''} data-mo="rise"><summary${sel === i ? ' aria-current="step"' : ''}><span class="nd">${ic(s[0], 's18')}</span><span class="fc-sm"><b>${s[1]}</b><small>${s[2]}</small></span>${ic('chev-r', 's18')}</summary><p class="fc-sub">${s[3]}</p></details>`;
function chain(x) {
  const st = x.state, h = x.h, hz = x.hz, c = st === 'noModel' ? goldChain() : chainOf(h, hz), f = st === 'noModel' ? null : longOf(h)[hz].f;
  const set = (i, ...v) => { c[i] = [c[i][0], ...v]; };
  if (st === 'disagreement') { const b = baseOf(f); c[3] = ['split', 'Forecast', `Two sides: ${modelSplit(x) ? `R2-HGB v3 range ${pct(f.lo)} to ${pct(f.hi)}, baseline ${pct(b.lo)} to ${pct(b.hi)}` : `rules Pause, R2-HGB v3 range ${pct(f.lo)} to ${pct(f.hi)}`}`, 'Both are stored. Neither is overwritten.']; set(4, 'Action', 'None: conflicted, not ranked', 'Nothing was published.'); }
  if (st === 'abstention') { c[3] = ['ban', 'Forecast', 'Abstained: too little comparable history', 'The abstention is stored and dated.']; set(4, 'Action', 'None: no range', 'Nothing was published.'); set(5, 'Outcome', 'Nothing to score', 'An abstention is not scored as a hit or a miss.'); }
  if (st === 'stale') { set(3, 'Forecast', `v2 · ${pct(f.med)} at ${HS[hz]} · R2-HGB v3 · held from Mon 21:15`, 'No new forecast until its price returns.'); }
  if (st === 'offline') { c.forEach(s => { s[2] += ' · saved 21:15'; }); c[6] = ['lock', 'Audit', 'Saved 21:15 · cannot re-check offline', 'Each link shows its age. Writes are refused until you reconnect.']; }
  return `<div class="card fc-chain" data-mo="card">${c.map((s, i) => stepOf(i, s, 3)).join('')}</div>`;
}
function evidenceMain(c) {
  const ctx = c, head = `<div class="fc-sub" data-mo="fade">Follow any figure back to its source and on to its outcome. This opens the stored record; nothing is rebuilt.</div>`;
  return region(ctx, {
    what: 'This record',
    ok: () => head + chain(c),
    loading: () => `${head}${banner('', 'Refreshing.', 'The last good record stays here until it lands.', 'refresh')}${dim(chain(c))}`,
    empty: () => stateCard('search', 'Record not found', 'This link points to nothing MyPrediction stores. Evidence is never rebuilt to fill the gap.', btn('Back to the forecast', 'tinted')),
    error: () => stateCard('lock', 'This record is refused', 'The link points to another environment. A link carries no authority of its own, so nothing opens.', btn('Back to the forecast', 'tinted')),
    stale: () => banner('warn', 'Stale record.', `HSBC's source stopped at 14:10. The chain is complete up to there, until its price returns. ${qLate}`, 'clock') + chain(c),
    offline: () => banner('', 'Saved record.', `Each link shows its age. New notes and decisions are refused until you reconnect.${q12(ctx)}`, 'wifi-off') + chain(c),
    noModel: () => banner('', 'No forecast on record.', 'Gold has no forecast, so the chain stops at its quote.', 'cube') + chain(c),
    disagreement: () => banner('', 'Two sides, one chain.', `${modelSplit(c) ? 'The model and the baseline' : 'The rules and the forecast'} are both stored. Neither is overwritten.`, 'split') + chain(c),
    abstention: () => banner('', 'An abstention is a record too.', 'It is stored and dated, and it has no outcome to score.', 'ban') + chain(c)
  });
}
/* one stored record, one link: the id comes from the name, the horizon and the version, so no two records share it */
const linkId = (h, l, v) => { let n = 7; for (const ch of `${h.t}|${l.k}|${v}`) n = (n * 31 + ch.charCodeAt(0)) >>> 0; return `fc-${(n & 0xffffff).toString(16).padStart(6, '0')}`; };
const recordLink = id => `<div class="fc-link2">${ic('lock', 's16')}<span>mypaisapp.com/e/${id}</span></div>${btn('Copy link', 'tinted').replace('class="btn', 'class="btn sm')}<p class="fc-sub">Opens this same record on the web and in the Apple app, and only for you.</p>`;
function recordCard(c) {
  const st = c.state, h = c.h, l = st === 'noModel' ? null : longOf(h)[c.hz], held = st === 'stale';
  if (st === 'noModel') return `<div class="card fc-card" data-mo="card"><h4>No forecast record</h4><p class="fc-sub">No forecast was issued for gold, so there is no record to link to.</p></div>`;
  if (st === 'empty' || st === 'error') return `<div class="card fc-card" data-mo="card"><h4>Why links work this way</h4><p class="fc-sub">An expired session asks you to sign in, then returns to the record. A link to a superseded record opens it, with a pointer to what replaced it.</p></div>`;
  if (st === 'abstention') return `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Abstention record</h4><span class="chip">Abstained</span></div><div class="fc-kv"><span>Task</span><b>${h.t} · ${l.k}-month return</b><span>As of</span><b>21:15 London</b><span>Data cutoff</span><b>21:00</b><span>Model</span><b>R2-HGB v3</b><span>Reason</span><b>Too little comparable history</b></div>${recordLink(linkId(h, l, 'abstained'))}</div>`;
  const card = `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Forecast ${held ? 'v2' : 'v3'}</h4><span class="chip">${held ? 'Held' : 'Current'}</span></div><div class="fc-kv"><span>Task</span><b>${h.t} · ${l.k}-month return</b><span>As of</span><b>${held ? 'Mon 21:15 London' : '21:15 London'}</b><span>Data cutoff</span><b>21:00</b><span>Model</span><b>R2-HGB v3</b><span>Replaces</span><b>${held ? 'v1' : 'v2'} · kept, annotated</b></div>${recordLink(linkId(h, l, held ? 'v2' : 'v3'))}</div>`;
  return st === 'loading' ? dim(card) : card;
}

/* ---------- Option B: every horizon at once ---------- */
function ladRow(l, ctx, sel, h) {
  const st = ctx.state, i = [3, 6, 12].indexOf(l.k);
  const opens = h ? ` role="button" tabindex="0" data-dossier="${i}" data-t="${h.t}"` : '', chev = h ? `<span class="fc-chev">${ic('chev-r', 's18')}<span class="sr">Open its dossier</span></span>` : '';
  const row = (chip, why) => `<div class="fc-lad${h ? ' open' : ''}"${opens} data-mo="rise"><div class="hzn">${l.n}</div><div></div>${chip}${chev}<div class="why">${why}</div></div>`;
  if (l.state === 'key') return row(l.chip(), l.why);
  if (l.state === 'noclear' || l.state === 'costpaused') return row(stateChip(l.state), l.why);
  if (st === 'abstention' && isOut(st, h.t, i)) return row(pill('', 'ban', 'Abstained'), 'Too little comparable history, so no range.');
  const sp = isSplit(st, h.t, i);
  return `<div class="fc-lad${h ? ' open' : ''}${sel === l.k ? ' on' : ''}"${opens} data-mo="rise"><div class="hzn">${l.n}</div><div>${bar(l.f, { label: l.n, split: sp })}</div><div class="med">${sp ? ic('split', 's18') : roll(pct(l.f.med))}</div>${chev}<div class="rg">80% range ${pct(l.f.lo)} to ${pct(l.f.hi)}</div><div class="rg">Held ${l.held}% of ${l.scored} in walk-forward testing${l.blocks < 20 ? ' · Exploratory' : ''}</div></div>`;
}
const scenBlock = (h = A) => { const s = +h.val.replace(/,/g, ''); return `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Scenarios · ${h.t}</h4>${noLike()}</div><div class="fc-kv"><span>3 years, downside to upside</span><b>${money0(worth(-2, 3, s))} to ${money0(worth(10, 3, s))}</b><span>5 years, downside to upside</span><b>${money0(worth(-2, 5, s))} to ${money0(worth(10, 5, s))}</b></div><div class="legend"><span><i class="lg-scen"></i>Conditional on stated assumptions</span></div></div>`; };
function ladderMain(ctx, h) {
  const st = ctx.state;
  const tags = `<div class="fc-tags"><span class="chip fc">${ic('fan', 's14')}Evaluated</span>${st === 'abstention' ? '' : '<span class="chip proposed"><span class="dot"></span>12 months: Exploratory</span>'}</div>`;
  const main = () => `<div class="card fcard" data-mo="card"><div class="label">Long term · 3, 6 and 12 months · ${h.t}</div>${tags}<div style="margin-top:8px">${ladderFan(ctx, { h })}</div><div class="fmeta"><span>${asOf(st)}</span><span>Data cutoff 21:00</span><span>R2-HGB v3</span><span>Illustrative</span></div></div><div class="card" data-mo="card">${longOf(h).map(l => ladRow(l, ctx, 0, h)).join('')}</div><div class="fc-sub" data-mo="fade">Open a row for its dossier: forecast, proof, views and evidence.</div>`;
  return region(ctx, {
    what: 'This forecast', ok: main,
    loading: () => banner('', 'Refreshing.', 'The last good set from 21:15 stays here, with its ranges, until the run lands.', 'refresh') + dim(main()),
    empty: () => stateCard('fan', 'No forecast yet', 'Apple joined your list today. All seven horizons fill in from the next daily run. Price history shows now.', '', '<span class="chip">Next run tomorrow 21:15</span>') + `<div class="card fcard" data-mo="card"><div class="label">Price history · 12 months</div><div style="margin-top:8px">${histChart(ctx, 'Apple')}</div></div>`,
    error: () => banner('fall', 'Forecasts did not load.', `Twelve Data failed at 21:14. ${LASTGOOD}. That run shows in full, with its date.`, 'alert') + `<div>${btn('Try again', 'tinted', 'refresh')}</div>` + main(),
    stale: () => banner('warn', 'Held, not current.', `HSBC's last price is 14:10, past the freshness limit, so every horizon shows its last issue until its price returns. ${qLate}`, 'clock') + main(),
    offline: () => banner('', 'Saved at 21:15.', `Every horizon here is from your device, not fresh analysis.${q12(ctx)}`, 'wifi-off') + main(),
    noModel: () => stateCard('ban', 'Forecast unavailable', 'No forecast at any of the seven horizons for gold, while its valuation convention is open (SCI-D08). Price history still shows.', '', pill('', 'ban', 'Unavailable at all 7 horizons')) + `<div class="card fcard" data-mo="card"><div class="label">Price history · 12 months · not a forecast</div><div style="margin-top:8px">${histChart(ctx, 'Gold', 29)}</div><div class="fmeta"><span>Source open (SCI-D08)</span><span>Illustrative</span></div></div>`,
    disagreement: () => banner('', 'Models disagree at 3 months.', 'R2-HGB v3 points up and the baseline points down, so no median stands there. Open the row for both.', 'split') + main(),
    abstention: () => banner('', '12 months abstained.', '3 and 6 months stand on their own evidence.', 'ban') + main()
  });
}
function ladderRail(ctx) {
  const st = ctx.state;
  if (st === 'noModel' || st === 'empty') return `<div class="card fc-card" data-mo="card"><div class="fc-vh"><h4>Short-term and scenarios</h4>${st === 'noModel' ? '<span class="chip proposed"><span class="dot"></span>Proposed · SCI-D08</span>' : ''}</div><p class="fc-sub">${st === 'noModel' ? 'Neither runs for gold: rules read nothing without a valuation convention, and scenarios need one too.' : 'Short-term rows and scenarios appear with the first run.'}</p></div>`;
  return `<div class="card" data-mo="card"><div class="fc-link" style="min-height:44px">${ic('clock', 's18')}<span>Short-term<small>1 to 20 sessions, kept apart</small></span></div>${shortOf(shortH(st)).map(s => shortRow(s, ctx)).join('')}</div>${scenBlock(shortH(st))}`;
}
const TABS = ['Forecast', 'Proof', 'Views', 'Evidence'];
const dossier = on => `<div data-mo="rise">${seg(TABS, on, 'Dossier', 'full')}</div>`;

/* ---------- the Forecasts tab: every holding and watch-only listing, and the state of each horizon ---------- */
const WATCH = [
  { n: 'Microsoft', t: 'MSFT', med: 7.0, lo: -8.8, hi: 22.0, c: '--seg-ustech', lg: 'M' },
  { n: 'JPMorgan Chase', t: 'JPM', med: 6.4, lo: -9.6, hi: 21.2, c: '--seg-uslarge', lg: 'JP' },
  { n: 'ICICI Bank', t: 'ICICIBANK', med: 8.4, lo: -9.9, hi: 25.6, c: '--seg-n50', lg: 'IC', india: true },
  { n: 'Gold', t: 'XAU/USD', none: true, c: '--seg-metals', lg: 'Au' }
];
const ROOT = [...H, ...WATCH];
const cellOf = (x, i, st) => {
  const figure = () => scaled({ ...x, lo50: x.lo, hi50: x.hi }, [.5, 1, 2][i]), plain = i === 2 ? 'Exploratory' : 'Evaluated';
  if (x.none) return { w: 'None', l: 'Unavailable · SCI-D08' };
  if (st === 'noModel' && (x.v === 'XNSE' || x.india)) return { w: 'No model', l: 'No approved model' };
  if (x.t === 'HSBA') return { w: st === 'stale' ? 'Stale' : 'Held', l: st === 'stale' ? 'Stale · held, 14:10' : 'Held · late price, 14:10', f: figure(), warn: true };
  if (isSplit(st, x.t, i)) return { w: 'Split', l: x.t === 'RELIANCE' ? 'Rules and models disagree' : 'Models disagree', f: figure(), split: true };
  if (st === 'abstention' && isOut(st, x.t, i)) return { w: 'Abstained', l: 'Abstained · no range' };
  return { w: plain, l: plain, f: figure() };
};
const rootRow = (x, ctx, hz) => { const c = cellOf(x, hz, ctx.state); return `<div class="hrow fc-rootrow" role="button" tabindex="0" data-mo="rise">${logo(x.c, x.lg)}<div style="min-width:0"><div class="nm">${x.n}</div><div class="tk">${x.t} · ${x.v ? 'Holding' : 'Watch-only'}</div></div><div class="vv">${c.f && !c.split ? `<div class="val" style="color:var(--fc-ink)">${pct(c.f.med)}</div>` : ''}</div><div class="fl"><span class="chip${c.warn ? ' stale' : ''}">${c.l}</span>${c.f ? `<span class="small muted">80% range ${pct(c.f.lo)} to ${pct(c.f.hi)}</span>` : ''}</div></div>`; };
const rootMeta = ctx => `<div class="fc-sub" data-mo="fade">${ctx.state === 'error' ? LASTGOOD : 'As of 21:15 London · data cutoff 21:00'} · R2-HGB v3 · Illustrative${ctx.state === 'stale' ? '' : ` · HSBC late ${qLate}`}</div>`;
const rootList = (ctx, hz) => `${rootMeta(ctx)}<div class="list card" style="margin:0">${ROOT.map(x => rootRow(x, ctx, hz)).join('')}</div>`;
const rootCell = c => `<td class="r">${c.f && !c.split ? `<div style="color:var(--fc-ink);font-weight:600">${pct(c.f.med)}</div>` : ''}<div class="small muted" style="font-size:12px;line-height:16px">${c.l}</div>${c.f ? `<div class="small" style="font-size:12px;line-height:16px">${pct(c.f.lo)} to ${pct(c.f.hi)}</div>` : ''}</td>`;
const rootTable = ctx => `${rootMeta(ctx)}<div class="fc-sub" data-mo="fade">Each cell shows the median, then the 80% range.</div><div class="card" data-mo="card"><table class="ht ${isWide(ctx) ? 'dk' : 'pwa'} fc-tt"><thead><tr><th>Listing</th><th class="r">3M</th><th class="r">6M</th><th class="r">12M<br>Exploratory</th></tr></thead><tbody>${ROOT.map(x => `<tr data-mo="rise"><td><button class="fc-rowbtn" type="button"><span class="inst">${logo(x.c, x.lg, true)}<span class="fc-nm"><b>${x.t}</b><span>${x.v ? 'Holding' : 'Watch-only'}</span></span></span></button></td>${[0, 1, 2].map(i => rootCell(cellOf(x, i, ctx.state))).join('')}</tr>`).join('')}</tbody></table></div>`;
function rootMain(ctx, list) {
  return region(ctx, {
    what: 'Forecasts', ok: list,
    loading: () => banner('', 'Refreshing.', 'The last good forecasts from 21:15 stay here until the run lands.', 'refresh') + dim(list()),
    empty: () => stateCard('fan', 'No forecasts yet', 'Add a holding or a watch-only listing. Each gets its first forecast from the next daily run.', '', '<span class="chip">Next run tomorrow 21:15</span>'),
    error: () => banner('fall', 'Forecasts did not refresh.', `Twelve Data failed at 21:14. ${LASTGOOD}. Every row is from that one version.`, 'alert') + `<div>${btn('Try again', 'tinted', 'refresh')}</div>` + list(),
    stale: () => banner('warn', 'HSBC is stale.', `Its last price is 14:10, past the freshness limit. Its forecast stays held until its price returns. ${qLate}`, 'clock') + list(),
    offline: () => banner('', 'Saved at 21:15.', `These forecasts are on your device, not fresh analysis.${q12(ctx)}`, 'wifi-off') + list(),
    noModel: () => banner('', 'India has no approved model.', 'Reliance, the Nifty ETF and ICICI Bank show as no model, at every long horizon. Gold has no forecast while its valuation convention is open (SCI-D08).', 'cube') + list(),
    disagreement: () => banner('', 'Two conflicts.', 'Rules and models disagree on Reliance, and models disagree on Apple at 3 months.', 'split') + list(),
    abstention: () => banner('', 'Two abstentions.', 'AstraZeneca at 6 months and Apple at 12 months, for want of comparable history.', 'ban') + list()
  });
}

/* a switch really switches: a press redraws this frame at the chosen horizon, mode or tab. It reads what the frame shows from
   data-at, so a turned frame stays turned, keeps its flip and acts on its own side; its own hz, mode and name stay on the frame. */
const redraw = (scr, id, extra = {}) => {
  const oid = scr.dataset.at.split('|')[1], s = J.all().find(j => j.id === 'forecast').options.find(o => o.id === oid).screens.find(x => x.id === id);
  if (!s) return;
  Object.assign(scr.dataset, extra, { at: `forecast|${oid}|${id}` });
  const na = (s.na || {})[sum.at.st], scheme = /dark theme$/.test(scr.getAttribute('aria-label') || '') ? 'dark' : 'light', box = scr.closest('[data-slot]');
  scr.innerHTML = s.render({ kind: sum.at.s, state: na ? 'default' : sum.at.st, scheme, journey: 'forecast', option: oid, screen: id, hz: scr.dataset.hz, mode: scr.dataset.mode, t: scr.dataset.t });
  $$('svg.cx.inter', scr).forEach(wire);
  $$('[data-mo]', scr).forEach(n => n.removeAttribute('data-mo'));
  const title = s.titleFor ? s.titleFor(scr.dataset) : s.title;
  scr.setAttribute('aria-label', `${title}, ${scheme} theme`);
  const cap = box && $('.bcap', box), note = box && $('.jnote', box);
  if (cap && cap.childNodes[1]) cap.childNodes[1].textContent = cap.childNodes[2] ? `${title} ` : title;
  if (note) note.textContent = na ? `This state does not apply here: ${na}` : s.note || '';
};
/* the keyboard stays where it was: the pressed control comes back with the redraw */
const refocus = (scr, name, i) => { const b = $$(`[aria-label="${name}"] > button`, scr)[i]; if (b) b.focus({ preventScroll: true }); };
doc.addEventListener('segchange', e => {
  const g = e.target, scr = g.closest && g.closest('.scr'), id = ((scr && scr.dataset.at) || '').split('|');
  if (id[0] !== 'forecast') return;
  const name = g.getAttribute('aria-label'), n = e.detail;
  if (name === 'Forecast horizon') redraw(scr, id[2] === 'a-short' ? 'a-3m' : id[2], { hz: n });
  else if (name === 'Detail') redraw(scr, id[2], { mode: n });
  else if (name === 'Dossier') redraw(scr, ['b-forecast', 'b-proof', 'b-views', 'b-evidence'][n]);
  else return;
  refocus(scr, name, n);
});
/* a ladder row opens the dossier at its own horizon, on the ladder's own name */
const openRow = e => {
  const r = e.target.closest && e.target.closest('[data-dossier]');
  if (!r || (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ')) return;
  e.preventDefault();
  const scr = r.closest('.scr');
  redraw(scr, 'b-forecast', { hz: r.dataset.dossier, t: r.dataset.t });
  refocus(scr, 'Dossier', 0);
};
doc.addEventListener('click', openRow);
doc.addEventListener('keydown', openRow);

/* one instrument at a horizon, in either mode */
function instrA(ctx, hz = 1, mode0 = 0) {
  const st = ctx.state, gold = st === 'noModel', h = pick(ctx, hz), at = +(ctx.hz ?? hz), mode = +(ctx.mode ?? mode0);
  const sw = gold ? '' : hzSwitch(ctx, at), side = () => actionCard(ctx, at, h) + proofMini(ctx, at) + linksCard(ctx);
  return frame(ctx, {
    tab: 1, back: 'Forecasts', title: h.t, actions: tb('info', 'About this forecast'),
    accessory: sw,
    body: `<span class="fc-wl"></span>${inst(ctx, h)}${isWide(ctx) ? sw : ''}${gold ? '' : modeCtl(mode)}${forecastMain(ctx, at, h)}${mode && hasFigure(st, at, h) ? techCard(ctx, at, h) : ''}${isWide(ctx) ? '' : side()}`,
    rail: isWide(ctx) ? side() : ''
  });
}
function ladderB(ctx, mode0 = 0) {
  const st = ctx.state, mode = +(ctx.mode ?? mode0), gold = st === 'noModel', h = pick(ctx, 0);
  return frame(ctx, {
    tab: 1, back: 'Forecasts', title: gold ? 'XAU/USD' : h.t, actions: tb('info', 'About this forecast'),
    body: `<span class="fc-wl"></span>${inst(ctx, h)}${gold ? '' : modeCtl(mode)}${ladderMain(ctx, h)}${mode && !gold && st !== 'empty' ? ladTech(ctx, h) : ''}${isWide(ctx) ? '' : ladderRail(ctx)}`,
    rail: isWide(ctx) ? ladderRail(ctx) : ''
  });
}
const horizon36 = (ctx, hz) => `<div class="fc-hz" data-mo="rise">${H36(hz, 'full')}</div>`;
/* Short-term keeps its own name; in No model the short-term model is paused for every listing, so it has no switch and no name */
const shortA = ctx => { const gold = ctx.state === 'noModel', sw = gold ? '' : hzSwitch(ctx, 1, true); return frame(ctx, { tab: 1, back: gold ? 'Forecasts' : shortH(ctx.state).t, title: 'Short-term', actions: tb('info', 'About short-term'), accessory: sw, body: `<span class="fc-wl"></span>${isWide(ctx) ? sw : ''}${shortMain(ctx)}`, rail: isWide(ctx) ? `<div class="card fc-card" data-mo="card"><h4>Why it sits apart</h4>${shortFoot()}</div>` : '' }); };
/* a horizon page's name follows the horizon it shows: the shell and redraw both read this */
const atHorizon = hz0 => ds => `At ${HN[+(ds.hz ?? hz0)]}`;
/* the dossier: one name, its horizon in the title */
const dTitle = ctx => (ctx.state === 'noModel' ? 'XAU/USD' : HN[+(ctx.hz ?? 1)]);
function dossierF(ctx) {
  const hz = +(ctx.hz ?? 1), h = pick(ctx), side = () => actionCard(ctx, hz, h) + proofMini(ctx, hz) + (ctx.state === 'noModel' ? '' : hzRecord());
  return frame(ctx, { tab: 1, back: h.t, title: dTitle(ctx), actions: tb('info', 'About this forecast'), webActions: '', body: `<span class="fc-wl"></span>${inst(ctx, h)}${dossier(0)}${forecastMain(ctx, hz, h)}${isWide(ctx) ? '' : actionCard(ctx, hz, h) + proofMain(clear(ctx))}`, rail: isWide(ctx) ? side() : '' });
}
const naScen = { noModel: 'A scenario is arithmetic on stated assumptions. No model runs, so none can be missing.', disagreement: 'A scenario is arithmetic on stated assumptions. There are no models to disagree.', abstention: 'A scenario is arithmetic on stated assumptions. No model runs, so none can abstain.' };

J.add({
  id: 'forecast', title: 'Forecast', stories: ['MP-145', 'MP-157', 'MP-155', 'MP-137', 'MP-151'],
  summary: 'One instrument: its range at each horizon, how far to trust it, who says what, and where every figure came from. Never a bare number.',
  options: [{
    id: 'a', name: 'One horizon', rec: true,
    why: 'One horizon fills the screen with its range, calibration and model, and the proof sits directly under it. The horizon switch stays in thumb reach, so reading a forecast and judging it are one motion.',
    cost: 'You compare horizons by switching, not side by side, and each deeper view is a page of its own.',
    screens: [{
      id: 'a-forecasts', title: 'Forecasts', note: 'The Forecasts tab: every holding and watch-only listing, with its state at the horizon you choose.',
      render: ctx => { const hz = +(ctx.hz ?? 1); return frame(ctx, { tab: 1, title: 'Forecasts', webActions: '', body: `${horizon36(ctx, hz)}${rootMain(ctx, () => rootList(ctx, hz))}` }); }
    }, {
      id: 'a-instrument', title: 'Instrument at a horizon', note: 'The switch floats above the dock on a phone, and sits at the top on iPad and desktop. Each state is drawn where it is true: stale on HSBC, abstaining on AstraZeneca, disagreement on Reliance, and no model on gold, forecast unavailable at every horizon (SCI-D08).',
      render: ctx => instrA(ctx, 1)
    }, {
      id: 'a-3m', title: 'At 3 months', titleFor: atHorizon(0), note: 'The same page at 3 months, on its own fan and its own horizon date.',
      render: ctx => instrA(ctx, 0)
    }, {
      id: 'a-12m', title: 'At 12 months', titleFor: atHorizon(2), note: '12 months is exploratory: 11 blocks, under the 20 a claim needs. It abstains on Apple in the Abstaining state.',
      render: ctx => instrA(ctx, 2)
    }, {
      id: 'a-technical', title: 'Technical mode', note: 'More of the working: percentiles, calibration, the task and the dataset. Simple and technical read the same forecast, and both keep its uncertainty.',
      render: ctx => instrA(ctx, 1, 1)
    }, {
      id: 'a-short', title: 'Short-term, apart', note: 'In the app the Short-term chip beside the switch leads here; this page draws it as its own frame. Rows show their real state: rules only, in practice, or evaluated.',
      render: shortA
    }, {
      id: 'a-hzstates', title: 'Horizon states', note: 'What About short-term opens: all nine states a horizon can be in, as they appear on a row.', na: naHelp,
      render: ctx => frame(ctx, { tab: 1, back: 'Short-term', title: 'Horizon states', actions: '<span></span>', webActions: '', body: keyA(ctx) })
    }, {
      id: 'a-proof', title: 'Proof', note: 'Hit rate never appears without calibration, error, coverage, turnover and a benchmark. 12 months is labelled exploratory: 11 blocks, under the 20 a claim needs.',
      render: ctx => frame(ctx, { tab: 1, back: backOf(ctx), title: 'Proof', actions: tb('info', 'About proof'), webActions: isWide(ctx) && ctx.state !== 'noModel' ? `<span class="chip">${HN[+(ctx.hz ?? 1)]}</span>` : '', body: `<span class="fc-wl"></span>${proofMain(clear(ctx))}`, rail: isWide(ctx) ? proofRail(clear(ctx)) : '' })
    }, {
      id: 'a-views', title: 'Rules, models, Claude', note: 'Three separate views, so one score can never hide a conflict. The split is experimental and carries no probability; the contribution policy stays hidden until it qualifies.',
      render: ctx => frame(ctx, { tab: 1, back: backOf(ctx), title: 'Three views', actions: tb('info', 'About these views'), webActions: isWide(ctx) && ctx.state !== 'noModel' ? `<span class="chip">${HN[+(ctx.hz ?? 1)]}</span>` : '', body: viewsMain(clear(ctx)) })
    }, {
      id: 'a-scenarios', title: 'Scenarios', note: 'Their own section: dotted, conditional, with no likelihood. Empty is the state today: template values wait on SCI-D06.',
      na: naScen,
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: 'Scenarios', actions: tb('info', 'About scenarios'), body: `<span class="fc-wl"></span>${scenMain(ctx)}`, rail: assume(ctx) })
    }, {
      id: 'a-evidence', title: 'Evidence trail', note: 'Source, ledger, risk, forecast, action, outcome, audit: every link is stored, never rebuilt, and each opens in place. A corrected forecast names what it replaced. Empty is a link that finds nothing; Error is a refused link.',
      render: ctx => frame(ctx, { tab: 1, back: backOf(ctx), title: 'Evidence', actions: tb('info', 'About evidence'), body: `<span class="fc-wl"></span>${evidenceMain(clear(ctx))}`, rail: recordCard(clear(ctx)) })
    }]
  }, {
    id: 'b', name: 'Ladder',
    why: 'All seven horizons sit on one screen, three kinds of evidence in three looks: long term first on one shared scale, short-term apart, scenarios dotted. One tap opens one dossier for proof, views and evidence.',
    cost: 'Seven small ranges are more to read on a phone, and proof sits a level deeper than in One horizon.',
    screens: [{
      id: 'b-forecasts', title: 'Forecasts', note: 'The Forecasts tab: every holding and watch-only listing, with the state of all three long horizons side by side.',
      render: ctx => frame(ctx, { tab: 1, title: 'Forecasts', webActions: '', body: rootMain(ctx, () => rootTable(ctx)) })
    }, {
      id: 'b-ladder', title: 'Every horizon', note: 'One fan to 12 months with its three horizons marked, each with its own calibration. Short-term sits apart, and scenarios follow, dotted. Stale is drawn on HSBC and no model on gold.',
      render: ctx => ladderB(ctx)
    }, {
      id: 'b-technical', title: 'Technical mode', note: 'More of the working on every long horizon. Simple and technical read the same forecast, and both keep its uncertainty.',
      render: ctx => ladderB(ctx, 1)
    }, {
      id: 'b-forecast', title: 'Dossier: forecast and proof', note: 'One page per horizon, with four tabs instead of four pages. Forecast and proof read as one scroll on a phone. It draws the same name as the horizon page, in every state.',
      render: dossierF
    }, {
      id: 'b-proof', title: 'Dossier: proof', note: 'The Proof tab: dataset, folds, baseline, the sheets, and hit rate with its companions.',
      render: ctx => { const c = clear(ctx); return frame(ctx, { tab: 1, back: backOf(ctx), title: dTitle(ctx), actions: tb('info', 'About proof'), webActions: '', body: `<span class="fc-wl"></span>${dossier(1)}${proofMain(c)}`, rail: isWide(ctx) ? proofRail(c) : '' }); }
    }, {
      id: 'b-views', title: 'Dossier: views', note: 'The same three views, one tab along.',
      render: ctx => frame(ctx, { tab: 1, back: backOf(ctx), title: dTitle(ctx), actions: tb('info', 'About these views'), body: `${dossier(2)}${viewsMain(clear(ctx))}` })
    }, {
      id: 'b-evidence', title: 'Dossier: evidence', note: 'The chain, the last tab. Each link opens in place. Empty is a link that finds nothing; Error is a refused link.',
      render: ctx => { const c = clear(ctx); return frame(ctx, { tab: 1, back: backOf(ctx), title: dTitle(ctx), actions: tb('info', 'About evidence'), body: `<span class="fc-wl"></span>${dossier(3)}${evidenceMain(c)}`, rail: recordCard(c) }); }
    }, {
      id: 'b-scenarios', title: 'Scenarios', note: 'Opened from the ladder\'s dotted block, so the figures lead and the chart follows. Conditional, with no likelihood. Empty is the state today: template values wait on SCI-D06.',
      na: naScen,
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: 'Scenarios', actions: tb('info', 'About scenarios'), body: `<span class="fc-wl"></span>${scenMain(ctx, true)}`, rail: assume(ctx) })
    }, {
      id: 'b-hzstates', title: 'Horizon states', note: 'What About this forecast opens: all nine states a horizon can be in, as they appear on the ladder.', na: naHelp,
      render: ctx => frame(ctx, { tab: 1, back: 'AAPL', title: 'Horizon states', actions: '<span></span>', webActions: '', body: keyB(ctx) })
    }]
  }]
});
})();
