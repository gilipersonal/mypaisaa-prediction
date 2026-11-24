/* Track record: how the live forecasts did once their horizons passed, in Record (MP-187, MP-154; "A view in Record", OWN-24).
   Live forecasts only. Walk-forward testing stays in each forecast's Proof, labelled as testing. Every figure on these screens is
   computed below from one illustrative table, so a rate always matches the counts beside it (lessons 37 and 63). Today is 3 Nov 2026.
   A block, so these helpers stay private to this journey. */
{
  const phone = ctx => ctx.kind === 'iphone' || ctx.kind === 'pwa';
  const n0 = v => v.toLocaleString('en-GB');
  const rate = (a, b) => Math.round((a / b) * 100);
  const pts = v => `${v.toFixed(1)} pts`;
  const chip = (t, c = '', icon = '') => `<span class="chip${c ? ' ' + c : ''}" data-mo="chip">${icon ? ic(icon, 's14') : c === 'proposed' ? '<span class="dot"></span>' : ''}${t}</span>`;
  const proposed = ref => chip(`Proposed · ${ref}`, 'proposed');
  const exploratory = chip('Exploratory', 'proposed');

  /* ---------- the record, as stored scores would rebuild it. Illustrative. ----------
     Seven holdings, one forecast each per daily origin since R2-HGB v2 went live on 2 Feb 2026: 192 origins, so 1,344 forecasts at
     every horizon. v2 issued the first 168 origins (1,176 a horizon); R2-HGB v3, approved 1 Oct 2026, the last 24 (168). A window
     holds the forecasts whose horizon passed inside it. Matured = scored + censored + abstained; issued = matured + pending. */
  const START = '2 Feb 2026', ISSUED = 1344, MIN = 30, FLOOR = 20;
  const W = ['30 days', '90 days', '365 days'];
  /* each window: due (horizon passed), inside and outside the 80% range, censored, abstained, direction right, median absolute error,
     calibration slope, the baseline's error on the same origins, non-overlapping blocks */
  const w = (due, inside, outside, cens, abst, dir, err, cal, base, blocks) => ({ due, inside, outside, cens, abst, dir, err, cal, base, blocks, scored: inside + outside });
  const HZ = {
    m3: { n: '3 months', k: 'm3', long: true, pending: 455, turn: '1.2', w: [w(147, 104, 35, 3, 5, 82, 5.6, '0.92', 6.0, 1), w(441, 322, 91, 12, 16, 248, 5.1, '0.95', 5.9, 1), w(889, 663, 171, 21, 34, 506, 4.9, '0.97', 5.8, 2)] },
    m6: { n: '6 months', k: 'm6', long: true, pending: 903, turn: '0.7', w: [w(147, 101, 35, 4, 7, 77, 9.9, '0.90', 10.4, 1), w(427, 308, 92, 9, 18, 233, 9.3, '0.94', 10.2, 1), w(441, 318, 95, 9, 19, 241, 9.2, '0.94', 10.1, 1)] },
    m12: { n: '12 months', k: 'm12', long: true, pending: 1344, first: '2 Feb 2027', w: [w(0, 0, 0, 0, 0, 0, 0, '', 0, 0), w(0, 0, 0, 0, 0, 0, 0, '', 0, 0), w(0, 0, 0, 0, 0, 0, 0, '', 0, 0)] },
    s10: { n: '10 sessions', k: 's10', pending: 70, w: [w(147, 108, 33, 1, 5, 79, 2.4, '0.93', 2.5, 2), w(448, 342, 93, 2, 11, 237, 2.2, '0.96', 2.4, 6), w(1274, 982, 252, 6, 34, 679, 2.1, '0.98', 2.3, 18)] },
    s20: { n: '20 sessions', k: 's20', pending: 140, w: [w(147, 107, 35, 1, 4, 80, 3.6, '0.90', 3.8, 1), w(448, 333, 101, 2, 12, 241, 3.4, '0.93', 3.7, 3), w(1204, 905, 263, 6, 30, 654, 3.3, '0.95', 3.6, 8)] }
  };
  const LONG = [HZ.m3, HZ.m6, HZ.m12], SHORT = [HZ.s10, HZ.s20];
  /* over 365 days, the whole live record: by holding, at 3 and 6 months. [ticker, scored, inside, censored, abstained]. Each holding has
     127 matured at 3 months and 63 at 6. HSBC's censored are the disputed dividend; AstraZeneca's abstentions are its thin history */
  const HOLD = {
    m3: [['AAPL', 124, 101, 0, 3], ['NVDA', 121, 88, 0, 6], ['SPY', 127, 105, 0, 0], ['AZN', 111, 86, 0, 16], ['HSBA', 102, 79, 21, 4], ['RELIANCE', 122, 98, 0, 5], ['NIFTYBEES', 127, 106, 0, 0]],
    m6: [['AAPL', 62, 49, 0, 1], ['NVDA', 60, 43, 0, 3], ['SPY', 63, 51, 0, 0], ['AZN', 53, 37, 0, 10], ['HSBA', 51, 38, 9, 3], ['RELIANCE', 61, 48, 0, 2], ['NIFTYBEES', 63, 52, 0, 0]]
  };
  /* by model, over 365 days. v3 has nothing matured at 3, 6 or 12 months; its first forecasts there mature on these dates */
  const MODEL = {
    v2: { n: 'R2-HGB v2', s: 'Live 2 Feb to 30 Sep 2026. Its forecasts still mature, and are scored against v2.', m3: { pending: 287 }, m6: { pending: 735 }, m12: { pending: 1176 }, s10: w(1176, 905, 233, 6, 32, 627, 2.1, '0.98', 2.3, 17), s20: w(1176, 883, 258, 6, 29, 638, 3.3, '0.95', 3.6, 8) },
    v3: { n: 'R2-HGB v3', s: 'Approved 1 Oct 2026. It issues today’s forecasts.', m3: { pending: 168, first: '1 Jan 2027' }, m6: { pending: 168, first: '1 Apr 2027' }, m12: { pending: 168, first: '1 Oct 2027' }, s10: { ...w(98, 77, 19, 0, 2, 52, 2.0, '0.97', 2.2, 1), pending: 70 }, s20: { ...w(28, 22, 5, 0, 1, 16, 3.1, '0.94', 3.4, 0), pending: 140 } }
  };
  MODEL.v2.m3 = { ...HZ.m3.w[2], pending: 287 }; MODEL.v2.m6 = { ...HZ.m6.w[2], pending: 735 }; MODEL.v2.s10.pending = 0; MODEL.v2.s20.pending = 0;
  /* the baseline, scored on exactly the same origins as the model: [inside, error] by horizon */
  const BASE = { m3: [704, 5.8], m6: [349, 10.1], s10: [1017, 2.3], s20: [958, 3.6] };
  /* by the regime at each forecast's origin, over 365 days. [regime, scored, inside] */
  const REG = {
    m3: [['Rising, calm', 412, 338], ['Rising, volatile', 118, 86], ['Falling, calm', 196, 154], ['Falling, volatile', 108, 85]],
    m6: [['Rising, calm', 207, 170], ['Rising, volatile', 61, 41], ['Falling, calm', 92, 70], ['Falling, volatile', 53, 37]]
  };
  const REGIME_HOW = 'The regime at each forecast’s origin: whether the last 60 sessions rose or fell, and whether 20-session volatility was above its 80th percentile.';

  /* ---------- small modules ---------- */
  const calbar = (r, label) => `<div class="calbar" role="img" aria-label="${label}: observed ${r}% against a target of 80%"><i data-mo="barx" style="width:${r}%"></i><b></b></div>`;
  const few = (s, what = 'scored') => `<div class="track-few"><b>Too few to show a rate</b><span>${s} ${what}. A rate shows from ${MIN}.</span></div>`;
  const none = first => `<div class="track-few"><b>Nothing has matured</b><span>First due ${first}.</span></div>`;
  /* every rate carries its sample: scored, censored, abstained, and its blocks */
  const sample = x => `${n0(x.scored)} scored · ${x.cens} censored · ${x.abst} abstained`;
  const blocks = x => `${x.blocks} non-overlapping ${x.blocks === 1 ? 'block' : 'blocks'}, under the ${FLOOR} a claim needs.`;
  /* hit rate never stands alone: coverage, calibration, error and the baseline sit beside it, and turnover where an action can follow */
  const metrics = (x, h, wide) => `<div class="track-met${wide ? ' w3' : ''}" role="list">${[
    ['Coverage', `${rate(x.inside, x.scored)}%`, `80% ranges held, ${n0(x.inside)} of ${n0(x.scored)}`],
    ['Calibration', x.cal, 'Slope, 1.00 is exact'],
    ['Error', pts(x.err), 'Median absolute'],
    ['Hit rate', `${rate(x.dir, x.scored)}%`, `Direction right, ${n0(x.dir)} of ${n0(x.scored)}`],
    ['Benchmark', `${(x.base - x.err).toFixed(1)} pts`, `Less error than the baseline’s ${pts(x.base)}`],
    ['Turnover', h.turn || 'None', h.turn ? 'Action changes a year' : 'Short horizons rank no action']
  ].map(([l, v, u]) => `<div role="listitem" data-mo="rise"><span class="label">${l}</span><b>${roll(v)}</b><span class="u">${u}</span></div>`).join('')}</div>`;
  const liveOnly = () => `<p class="track-sub" data-mo="fade">Live forecasts only, each scored once its horizon passed and every input was in. Walk-forward testing sits in each forecast’s Proof, labelled as testing.</p>`;
  const sayExploratory = () => banner('', 'Every rate here is exploratory.', `The live record began ${START}, so no horizon has the ${FLOOR} non-overlapping blocks a claim needs. Each rate shows with its sample.`, 'info');
  const counted = () => `<div class="card track-card" data-mo="card"><h4>How it is counted</h4><div class="track-kv"><span>Pending</span><b>Horizon not passed yet</b><span>Censored</span><b>Horizon passed, an input missing</b><span>Abstained</span><b>No range was given</b><span>Scored</span><b>Inside or outside its 80% range</b></div><p class="track-sub">Pending, censored and abstained are counted apart, never as misses. A window holds the forecasts whose horizon passed inside it. Summaries are rebuilt from stored scores and reproduce exactly; a corrected outcome keeps its first score beside the new one.</p><p class="track-sub">A rate shows once ${MIN} have scored. Below ${FLOOR} non-overlapping blocks it is exploratory.</p><div class="track-acts">${proposed('SCI-D03')}</div></div>`;

  /* ---------- states: one story across every screen of the journey (lesson 46) ---------- */
  const notPrices = ctx => (ctx.state === 'error' ? 'default' : undefined);
  const kept = ctx => (ctx.kind === 'web' || ctx.kind === 'pwa' ? browserKept() : '');
  const SAY = {
    loading: () => stateCard('clock', 'Rebuilding the summaries', 'They are rebuilt from stored scores, which reproduce exactly. The last good figures, from 22:15, stay on screen meanwhile.'),
    error: () => stateCard('alert', 'The record did not load', 'The read failed at 21:16. These are the summaries as of 21:05 today, from stored scores. No score is lost.', btn('Try again', 'tinted sm', 'refresh')),
    stale: () => banner('warn', 'Scores are behind.', 'Outcomes last joined 14:10, so the newest scores may be missing. HSBC last priced 14:10, past the freshness limit: its outcomes wait as pending, and a late price is never scored as a miss.', 'clock') + `<div class="track-acts">${proposed('DATA-DEC-02')}</div>`,
    offline: ctx => banner('', 'Offline.', 'Showing the record from 22:15. Nothing updates until you reconnect.', 'wifi-off') + kept(ctx),
    noModel: () => banner('', 'No approved model now.', 'No new forecasts are issued, so nothing new joins pending. Every score so far stays on record against the version that made it.', 'cube'),
    disagreement: () => banner('', '1 score was amended.', 'NVIDIA’s close was corrected on 30 Oct, from +12.4% to +11.9%. Its 6-month forecast of 28 Apr still lands inside its range, so no summary moves. The first and corrected scores both stay.', 'split') + banner('', 'Rules and models differ on Reliance today.', 'That changes no score: the model’s forecasts are scored as issued, and both sides are stored.', 'split'),
    abstention: () => banner('', 'The model abstains on AstraZeneca at 6 months today.', 'An abstention is counted beside every rate, never scored as a hit or a miss.', 'ban')
  };
  const EMPTY = () => stateCard('target', 'No forecast has been issued', 'The record starts with the first forecast. Each one joins as pending, and is scored once its horizon passes and every input is in. Nothing is scored before then.');
  /* a screen's body in the selected state: the state's word first, then the record, which stays in view in every state but Empty */
  const inState = (ctx, body) => {
    const st = ctx.state;
    if (st === 'empty') return EMPTY();
    const say = SAY[st] ? SAY[st](ctx) : '';
    return `${say}${st === 'loading' ? `<div class="track-dim" aria-busy="true">${body()}</div>` : body()}`;
  };

  /* ---------- Option A: a scorecard, then read it by holding, model or regime ---------- */
  const trio = h => `<div class="track-trio">${h.w.map((x, i) => `<div data-mo="rise"><span class="label">${W[i]}</span>${x.due === 0 ? `<b>None</b><span class="u">nothing matured</span>` : x.scored < MIN ? `<b>Too few</b><span class="u">${x.scored} scored</span>` : `<b>${roll(`${rate(x.inside, x.scored)}%`)}</b><span class="u">of ${n0(x.scored)} scored</span>${calbar(rate(x.inside, x.scored), `${h.n}, ${W[i]}`)}`}</div>`).join('')}</div>`;
  const hzCard = (h, ctx, o = {}) => {
    const y = h.w[2];
    const top = `<div class="track-vh"><h4>${h.n}</h4>${y.due ? exploratory : ''}<span class="chip" data-mo="chip">${ic('clock', 's14')}${n0(h.pending)} pending</span></div>`;
    if (!y.due) return `<div class="card track-card" data-mo="card">${top}${none(h.first)}<p class="track-sub">All ${n0(ISSUED)} forecasts since ${START} are pending. Nothing is scored before its horizon passes.</p></div>`;
    return `<div class="card track-card" data-mo="card">${top}<p class="track-sub">Coverage of the 80% range, by when the horizon passed</p>${trio(h)}<div class="track-rule"></div><p class="track-sub"><b>365 days</b> · ${sample(y)}. ${blocks(y)}</p>${metrics(y, h, !phone(ctx))}${o.open ? `<button class="btn btn-plain sm" type="button" style="justify-self:start">${h.n} in full${ic('chev-r', 's14')}</button>` : ''}</div>`;
  };
  const shortCard = (h, ctx) => { const y = h.w[2]; return `<div class="card track-card" data-mo="card"><div class="track-vh"><h4>${h.n}</h4>${exploratory}<span class="chip" data-mo="chip">${ic('clock', 's14')}${n0(h.pending)} pending</span></div>${trio(h)}<p class="track-sub"><b>365 days</b> · ${sample(y)}. ${blocks(y)}</p>${metrics(y, h, !phone(ctx))}</div>`; };
  const shortHead = () => `<div class="track-sec" data-mo="rise"><h3>Short term</h3>${chip('Not long-term guidance', 'illus')}</div><p class="track-sub" data-mo="fade">Next day runs on rules only and 5 sessions is in practice, so neither has a live record.</p>`;
  const readBy = () => `<div class="card track-by" data-mo="card"><div class="track-sec in"><h3>Read it by</h3></div>${[['layers', 'Holding', 'Seven holdings, at 3 and 6 months'], ['cube', 'Model', 'R2-HGB v2, v3 and the baseline'], ['split', 'Regime', 'Four regimes at origin']].map(([i, t, s]) => `<button class="track-row" type="button">${ic(i, 's18')}<span><b>${t}</b><small>${s}</small></span>${ic('chev-r', 's18')}</button>`).join('')}</div>`;
  const recordA = ctx => inState(ctx, () => `${sayExploratory()}${LONG.map(h => hzCard(h, ctx, { open: h.k === 'm6' })).join('')}${shortHead()}${SHORT.map(h => shortCard(h, ctx)).join('')}`);

  /* the breakdown rows: coverage with its sample, never a hit rate without the rest */
  const brow = (lead, name, sub, v, note) => `<div class="track-br${lead ? '' : ' nolead'}" data-mo="rise">${lead}<div class="m"><b>${name}</b><span>${sub}</span></div>${v.word ? `<div class="v"><b>${v.word}</b><span>${v.sub}</span></div>` : v.scored < MIN ? `<div class="v"><b>Too few</b><span>${v.scored} scored</span></div>` : `<div class="v"><b>${rate(v.inside, v.scored)}%</b><span>of ${n0(v.scored)}</span></div>${calbar(rate(v.inside, v.scored), name)}`}${note ? `<div class="o">${note}</div>` : ''}</div>`;
  const holdCard = (k, ctx) => { const h = HZ[k], y = h.w[2]; return `<div class="card track-list" data-mo="card"><div class="track-sec in"><h3>${h.n}</h3>${exploratory}</div><p class="track-sub in">365 days · ${n0(y.scored)} scored across 7 holdings · coverage of the 80% range</p>${HOLD[k].map(([t, s, i, c, a]) => { const x = byT[t]; return brow(logo(x.c, x.lg, true), x.n, `${x.t} · ${s + c + a} matured`, { scored: s, inside: i }, [c ? `${c} censored: a dividend is disputed, so no score yet` : '', a ? `${a} abstained` : ''].filter(Boolean).join(' · ')); }).join('')}</div>`; };
  const holdingA = ctx => inState(ctx, () => `${sayExploratory()}${holdCard('m3', ctx)}${holdCard('m6', ctx)}<p class="track-sub">12 months has nothing matured. Short-term horizons are read by horizon only.</p>`);
  const mIcon = k => `<span class="track-ic">${ic(k === 'base' ? 'equal' : 'cube', 's18')}</span>`;
  const modelRows = (m, ks) => ks.map(k => {
    const x = m[k], h = HZ[k];
    if (!x.due) return brow('', h.n, `${n0(x.pending)} pending`, { word: 'None', sub: 'matured' }, x.first ? `Nothing matured. First due ${x.first}.` : 'Nothing matured.');
    return brow('', h.n, `${n0(x.scored)} scored · ${x.cens} censored · ${x.abst} abstained${x.pending ? ` · ${n0(x.pending)} pending` : ''}`, x, x.scored < MIN ? `A rate shows from ${MIN}.` : `Error ${pts(x.err)} · calibration ${x.cal}`);
  }).join('');
  const modelCard = key => { const m = MODEL[key]; return `<div class="card track-list" data-mo="card"><div class="track-sec in">${mIcon(key)}<h3>${m.n}</h3>${exploratory}</div><p class="track-sub in">${m.s}</p>${modelRows(m, ['m3', 'm6', 'm12', 's10', 's20'])}</div>`; };
  const baseCard = () => `<div class="card track-list" data-mo="card"><div class="track-sec in">${mIcon('base')}<h3>Baseline</h3>${exploratory}</div><p class="track-sub in">The historical-distribution baseline, scored on exactly the same origins as the model.</p>${['m3', 'm6', 's10', 's20'].map(k => { const y = HZ[k].w[2], [i, e] = BASE[k]; return brow('', HZ[k].n, `${n0(y.scored)} scored`, { scored: y.scored, inside: i }, `Error ${pts(e)}, against the model’s ${pts(y.err)}`); }).join('')}</div>`;
  const modelA = ctx => inState(ctx, () => `${sayExploratory()}${modelCard('v2')}${modelCard('v3')}${baseCard()}`);
  const regCard = k => { const h = HZ[k], y = h.w[2]; return `<div class="card track-list" data-mo="card"><div class="track-sec in"><h3>${h.n}</h3>${exploratory}</div><p class="track-sub in">365 days · ${n0(y.scored)} scored · coverage of the 80% range</p>${REG[k].map(([r, s, i]) => brow('', r, 'Regime at origin', { scored: s, inside: i }, '')).join('')}</div>`; };
  const regHow = () => `<div class="card track-card" data-mo="card"><h4>What a regime is here</h4><p class="track-sub">${REGIME_HOW} A regime is a way to read the record, not a forecast. Censored and abstained forecasts are counted at the horizon, not by regime.</p><div class="track-acts">${proposed('SCI-D04')}</div></div>`;
  const regimeA = ctx => inState(ctx, () => `${sayExploratory()}${regCard('m3')}${regCard('m6')}`);

  /* ---------- one horizon, in full: 6 months, the lead horizon ---------- */
  const H6 = HZ.m6, Y6 = H6.w[2];
  const flow = () => `<div class="card track-card" data-mo="card"><h4>Every 6-month forecast since ${START}</h4><div class="track-kv"><span>Issued</span><b>${n0(ISSUED)}</b><span>Pending, horizon not passed</span><b>${n0(H6.pending)}</b><span>Matured</span><b>${n0(Y6.due)}</b><span>· Scored</span><b>${n0(Y6.scored)}</b><span>· Censored</span><b>${Y6.cens}</b><span>· Abstained</span><b>${Y6.abst}</b></div><p class="track-sub">Issued is pending plus matured, and matured is scored, censored and abstained. None is dropped.</p></div>`;
  const yours = st => `<div class="card track-card" data-mo="card"><h4>From your journal</h4><div class="track-kv"><span>NVIDIA · 28 Apr</span><b>Inside, ${st === 'disagreement' ? '+11.9%, amended' : '+12.4%'}</b><span>AstraZeneca · 3 Mar</span><b>Outside, −11.6%</b></div><p class="track-sub">Two of the ${Y6.scored} scored. One outcome says little about a forecast; the rate above is the record.</p></div>`;
  const whyOut = () => `<div class="card track-card" data-mo="card"><h4>Not scored, and why</h4><div class="track-kv"><span>HSBC · censored</span><b>9</b><span>AstraZeneca · abstained</span><b>10</b><span>Other holdings · abstained</span><b>9</b></div><p class="track-sub">HSBC’s dividend is disputed, so its outcomes are not known yet; a missing input is never scored as a zero. AstraZeneca has too little comparable history for a calibrated range.</p></div>`;
  const modelLine = () => `<div class="card track-card" data-mo="card"><h4>Which model</h4><p class="track-sub">R2-HGB v2 made all ${Y6.due} matured. R2-HGB v3’s first 6-month forecast matures on 1 Apr 2027; its ${MODEL.v3.m6.pending} are pending. Later models never rewrite a score.</p></div>`;
  const windowsA = ctx => `<div class="card track-card" data-mo="card"><div class="track-vh"><h4>${H6.n}</h4>${exploratory}</div><p class="track-sub">Coverage of the 80% range, by when the horizon passed. The target is 80%.</p>${trio(H6)}<div class="track-rule"></div><p class="track-sub"><b>365 days</b> · ${sample(Y6)}. ${blocks(Y6)}</p>${metrics(Y6, H6, !phone(ctx))}</div>`;
  const sliceA = ctx => inState(ctx, () => `${windowsA(ctx)}${flow()}${yours(ctx.state)}`);
  const sliceRail = ctx => (ctx.state === 'empty' ? counted() : `${whyOut()}${modelLine()}`);

  /* ---------- Option B: one table, every reading on one page ---------- */
  /* turnover sits with each horizon that has a record, beside its hit rate (AGENTS.md) */
  const turnover = h => (!h.w[2].due ? '' : h.turn ? ` · turnover ${h.turn} action changes a year` : ' · turnover none, short horizons rank no action');
  const openSix = `<button class="btn btn-plain sm" type="button">Open 6 months${ic('chev-r', 's14')}</button>`;
  const cols = ['Scored', 'Coverage', 'Calibration', 'Error', 'Hit rate', 'Baseline error', 'Censored', 'Abstained', 'Blocks'];
  const cells = x => (x.scored < MIN ? [n0(x.scored), `Too few · from ${MIN}`, '', '', '', '', x.cens, x.abst, x.blocks] : [n0(x.scored), `${rate(x.inside, x.scored)}%`, x.cal, pts(x.err), `${rate(x.dir, x.scored)}%`, pts(x.base), x.cens, x.abst, x.blocks]);
  const hzRows = (h) => (h.w[2].due ? h.w.map((x, i) => `<tr data-mo="rise"><td>${i === 0 ? `<b>${h.n}</b>` : ''}</td><td>${W[i]}</td>${cells(x).map(c => `<td class="r">${c}</td>`).join('')}</tr>`).join('') : `<tr data-mo="rise"><td><b>${h.n}</b></td><td>All</td><td class="r">0</td><td colspan="8" style="white-space:normal">Nothing has matured. First due ${h.first}.</td></tr>`) + `<tr class="track-pend"><td></td><td colspan="10">${n0(h.pending)} pending${turnover(h)}</td></tr>`;
  const head = first => `<thead><tr><th>${first}</th><th>Window</th>${cols.map(c => `<th class="r">${c}</th>`).join('')}</tr></thead>`;
  const tableWide = () => `<div class="card track-wide" data-mo="card"><div class="track-sec in"><h3>By horizon</h3>${exploratory}</div><div class="track-scroll"><table class="ht track-t">${head('Horizon')}<tbody>${LONG.map(hzRows).join('')}<tr class="track-grp"><td colspan="11">Short term · not long-term guidance</td></tr>${SHORT.map(hzRows).join('')}</tbody></table></div><p class="track-sub in">Coverage is of the 80% range, target 80%. Calibration is a slope, 1.00 exact. Error is median absolute. Hit rate is direction right. A window holds the forecasts whose horizon passed inside it.</p><div class="track-acts in">${openSix}</div></div>`;
  /* the breakdowns, over 365 days, as their own tables */
  const holdTable = () => `<div class="card track-wide" data-mo="card"><div class="track-sec in"><h3>By holding · 365 days</h3>${exploratory}</div><div class="track-scroll"><table class="ht track-t"><thead><tr><th>Holding</th><th class="r">3 months</th><th class="r">Scored</th><th class="r">6 months</th><th class="r">Scored</th><th class="r">Censored</th><th class="r">Abstained</th></tr></thead><tbody>${HOLD.m3.map(([t, s, i, c, a], r) => { const [, s6, i6, c6, a6] = HOLD.m6[r], x = byT[t]; return `<tr data-mo="rise"><td><div class="inst">${logo(x.c, x.lg, true)}<div style="min-width:0"><b>${x.n}</b><span>${x.t}</span></div></div></td><td class="r">${rate(i, s)}%</td><td class="r">${s}</td><td class="r">${rate(i6, s6)}%</td><td class="r">${s6}</td><td class="r">${c + c6}</td><td class="r">${a + a6}</td></tr>`; }).join('')}<tr><td><b>All 7</b></td><td class="r">${rate(HZ.m3.w[2].inside, HZ.m3.w[2].scored)}%</td><td class="r">${HZ.m3.w[2].scored}</td><td class="r">${rate(Y6.inside, Y6.scored)}%</td><td class="r">${Y6.scored}</td><td class="r">${HZ.m3.w[2].cens + Y6.cens}</td><td class="r">${HZ.m3.w[2].abst + Y6.abst}</td></tr></tbody></table></div><p class="track-sub in">Censored and abstained are counted across both horizons. HSBC’s censored are its disputed dividend.</p></div>`;
  const modelTable = () => `<div class="card track-wide" data-mo="card"><div class="track-sec in"><h3>By model · 365 days</h3></div><div class="track-scroll"><table class="ht track-t"><thead><tr><th>Model</th><th>Horizon</th><th class="r">Scored</th><th class="r">Coverage</th><th class="r">Error</th><th class="r">Pending</th><th>Note</th></tr></thead><tbody>${['v2', 'v3'].map(key => { const m = MODEL[key]; return ['m3', 'm6', 'm12', 's10', 's20'].map((k, r) => { const x = m[k]; const cov = !x.due ? 'None' : x.scored < MIN ? 'Too few' : `${rate(x.inside, x.scored)}%`; return `<tr data-mo="rise"><td>${r ? '' : `<b>${m.n}</b>`}</td><td>${HZ[k].n}</td><td class="r">${x.due ? x.scored : 0}</td><td class="r">${cov}</td><td class="r">${x.due && x.scored >= MIN ? pts(x.err) : ''}</td><td class="r">${n0(x.pending || 0)}</td><td style="white-space:normal">${!x.due ? (x.first ? `First due ${x.first}` : 'Nothing matured') : x.scored < MIN ? `A rate shows from ${MIN}` : ''}</td></tr>`; }).join(''); }).join('')}${['m3', 'm6', 's10', 's20'].map((k, r) => { const y = HZ[k].w[2], [i, e] = BASE[k]; return `<tr data-mo="rise"><td>${r ? '' : '<b>Baseline</b>'}</td><td>${HZ[k].n}</td><td class="r">${y.scored}</td><td class="r">${rate(i, y.scored)}%</td><td class="r">${pts(e)}</td><td class="r"></td><td style="white-space:normal">Same origins as the model</td></tr>`; }).join('')}</tbody></table></div></div>`;
  const regTable = () => `<div class="card track-wide" data-mo="card"><div class="track-sec in"><h3>By regime · 365 days</h3>${exploratory}</div><div class="track-scroll"><table class="ht track-t"><thead><tr><th>Regime at origin</th><th class="r">3 months</th><th class="r">Scored</th><th class="r">6 months</th><th class="r">Scored</th></tr></thead><tbody>${REG.m3.map(([r, s, i], k) => { const [, s6, i6] = REG.m6[k]; return `<tr data-mo="rise"><td>${r}</td><td class="r">${rate(i, s)}%</td><td class="r">${s}</td><td class="r">${rate(i6, s6)}%</td><td class="r">${s6}</td></tr>`; }).join('')}</tbody></table></div><p class="track-sub in">${REGIME_HOW}</p><div class="track-acts in">${proposed('SCI-D04')}</div></div>`;
  /* on a phone the table reads as rows of figures, one window to a row */
  const hzPhone = h => `<div class="card track-list" data-mo="card"><div class="track-sec in"><h3>${h.n}</h3>${h.w[2].due ? exploratory : ''}<span class="chip" data-mo="chip">${ic('clock', 's14')}${n0(h.pending)} pending</span></div>${h.w[2].due ? `<p class="track-sub in">${turnover(h).slice(3).replace(/^t/, 'T')}.</p>` : ''}${h.w[2].due ? h.w.map((x, i) => `<div class="track-pr" data-mo="rise"><div class="k"><b>${W[i]}</b><span>${n0(x.scored)} scored · ${x.cens} censored · ${x.abst} abstained · ${x.blocks} ${x.blocks === 1 ? 'block' : 'blocks'}</span></div>${x.scored < MIN ? few(x.scored) : `<div class="track-kv"><span>Coverage</span><b>${rate(x.inside, x.scored)}%</b><span>Calibration</span><b>${x.cal}</b><span>Error</span><b>${pts(x.err)}</b><span>Hit rate</span><b>${rate(x.dir, x.scored)}%</b><span>Baseline error</span><b>${pts(x.base)}</b></div>`}</div>`).join('') : `<div class="track-pr">${none(h.first)}</div>`}${h.k === 'm6' ? `<div class="track-acts in">${openSix}</div>` : ''}</div>`;
  const holdPhone = () => `<div class="card track-list" data-mo="card"><div class="track-sec in"><h3>By holding · 365 days</h3>${exploratory}</div>${HOLD.m3.map(([t, s, i, c, a], r) => { const [, s6, i6, c6, a6] = HOLD.m6[r], x = byT[t]; return `<div class="track-pr" data-mo="rise"><div class="k">${logo(x.c, x.lg, true)}<b>${x.n}</b></div><div class="track-kv"><span>3 months</span><b>${rate(i, s)}% of ${s}</b><span>6 months</span><b>${rate(i6, s6)}% of ${s6}</b>${c + c6 ? `<span>Censored</span><b>${c + c6}</b>` : ''}${a + a6 ? `<span>Abstained</span><b>${a + a6}</b>` : ''}</div></div>`; }).join('')}<p class="track-sub in">All 7: ${rate(HZ.m3.w[2].inside, HZ.m3.w[2].scored)}% of ${HZ.m3.w[2].scored} at 3 months, ${rate(Y6.inside, Y6.scored)}% of ${Y6.scored} at 6.</p></div>`;
  const modelPhone = () => `<div class="card track-list" data-mo="card"><div class="track-sec in"><h3>By model · 365 days</h3></div>${['v2', 'v3'].map(key => { const m = MODEL[key]; return `<div class="track-pr" data-mo="rise"><div class="k"><b>${m.n}</b><span>${m.s}</span></div><div class="track-kv">${['m3', 'm6', 'm12', 's10', 's20'].map(k => { const x = m[k]; return `<span>${HZ[k].n}</span><b>${!x.due ? `${n0(x.pending)} pending${x.first ? `, first due ${x.first}` : ''}` : x.scored < MIN ? `Too few, ${x.scored} scored; a rate shows from ${MIN}` : `${rate(x.inside, x.scored)}% of ${n0(x.scored)}`}</b>`; }).join('')}</div></div>`; }).join('')}<div class="track-pr" data-mo="rise"><div class="k"><b>Baseline</b><span>Same origins as the model</span></div><div class="track-kv">${['m3', 'm6', 's10', 's20'].map(k => { const y = HZ[k].w[2], [i, e] = BASE[k]; return `<span>${HZ[k].n}</span><b>${rate(i, y.scored)}% · error ${pts(e)}</b>`; }).join('')}</div></div></div>`;
  const regPhone = () => `<div class="card track-list" data-mo="card"><div class="track-sec in"><h3>By regime · 365 days</h3>${exploratory}</div>${REG.m3.map(([r, s, i], k) => { const [, s6, i6] = REG.m6[k]; return `<div class="track-pr" data-mo="rise"><div class="k"><b>${r}</b></div><div class="track-kv"><span>3 months</span><b>${rate(i, s)}% of ${s}</b><span>6 months</span><b>${rate(i6, s6)}% of ${s6}</b></div></div>`; }).join('')}<p class="track-sub in">${REGIME_HOW}</p><div class="track-acts in">${proposed('SCI-D04')}</div></div>`;
  const tableB = ctx => inState(ctx, () => (phone(ctx)
    ? `${sayExploratory()}${LONG.map(hzPhone).join('')}${shortHead()}${SHORT.map(hzPhone).join('')}${holdPhone()}${modelPhone()}${regPhone()}`
    : `${sayExploratory()}${tableWide()}${holdTable()}${modelTable()}${regTable()}${counted()}`));

  /* one row opened: 6 months, with the windows as columns */
  const sliceTable = () => { const rows = [['Matured', x => n0(x.due)], ['Scored', x => n0(x.scored)], ['Censored', x => x.cens], ['Abstained', x => x.abst], ['Coverage', x => `${rate(x.inside, x.scored)}%`], ['Calibration', x => x.cal], ['Error', x => pts(x.err)], ['Hit rate', x => `${rate(x.dir, x.scored)}%`], ['Baseline error', x => pts(x.base)], ['Blocks', x => x.blocks]]; return `<div class="card track-wide" data-mo="card"><div class="track-sec in"><h3>${H6.n} · ${n0(H6.pending)} pending</h3>${exploratory}</div><div class="track-scroll"><table class="ht track-t"><thead><tr><th></th>${W.map(t => `<th class="r">${t}</th>`).join('')}</tr></thead><tbody>${rows.map(([k, f]) => `<tr data-mo="rise"><td>${k}</td>${H6.w.map(x => `<td class="r">${f(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="track-sub in">Coverage of the 80% range, target 80%. ${blocks(Y6)} Turnover ${H6.turn} action changes a year.</p></div>`; };
  const sliceB = ctx => inState(ctx, () => `${sliceTable()}${flow()}${yours(ctx.state)}`);

  J.add({
    id: 'track', title: 'Track record', stories: ['MP-154', 'MP-187'], round: true,
    summary: 'How the live forecasts did once their horizons passed, by horizon, holding, model and regime, over 30, 90 and 365 days, with every sample, pending and censored count in view.',
    options: [{
      id: 'a', name: 'Scorecard', rec: true,
      why: 'Each horizon is one card: its coverage over 30, 90 and 365 days at a glance, then the full set of measures beside its sample. The breakdowns sit one tap away, so the first screen answers how the forecasts are doing without a table to read.',
      cost: 'Holding, model and regime each take a tap, and the cards are long on a phone. Comparing a holding against a regime means going back and forth.',
      screens: [{
        id: 'a-record', title: 'Track record',
        note: 'The top of Record, beside the Journal. Long term leads; short term sits apart, labelled. Each card counts pending, censored and abstained apart from the scored, and shows hit rate only beside coverage, calibration, error, the baseline and turnover. 12 months has nothing matured, so it says so and shows no rate.',
        render: ctx => frame(ctx, { tab: 3, fresh: notPrices(ctx), title: 'Track record', actions: tb('info', 'About the track record'), body: `${recordSwitch(1)}${liveOnly()}${recordA(ctx)}`, rail: ctx.state === 'empty' ? counted() : `${readBy()}${counted()}` })
      }, {
        id: 'a-slice', title: '6 months, in full',
        note: 'Where the 6-month card leads: the lead horizon, opened. Every forecast since 2 Feb 2026 is accounted for, and the two from your journal are named so the record and the journal agree.',
        render: ctx => frame(ctx, { tab: 3, fresh: notPrices(ctx), title: '6 months', back: 'Track record', actions: tb('info', 'About this horizon'), body: sliceA(ctx), rail: sliceRail(ctx) })
      }, {
        id: 'a-holding', title: 'By holding',
        note: 'Coverage by holding, over 365 days, at the two horizons with a record. A row shows coverage with its sample; hit rate shows only on the horizon cards, beside the rest.',
        render: ctx => frame(ctx, { tab: 3, fresh: notPrices(ctx), title: 'By holding', back: 'Track record', actions: tb('info', 'About this view'), body: holdingA(ctx), rail: ctx.state === 'empty' ? '' : counted() })
      }, {
        id: 'a-model', title: 'By model',
        note: 'Each model keeps its own record. v3 has nothing matured at 3, 6 or 12 months and too few at 20 sessions, so it says so and shows no rate. The baseline is scored on the same origins.',
        render: ctx => frame(ctx, { tab: 3, fresh: notPrices(ctx), title: 'By model', back: 'Track record', actions: tb('info', 'About this view'), body: modelA(ctx), rail: ctx.state === 'empty' ? '' : counted() })
      }, {
        id: 'a-regime', title: 'By regime',
        note: 'The record read by the regime each forecast was made in. The regime rule is proposed.',
        render: ctx => frame(ctx, { tab: 3, fresh: notPrices(ctx), title: 'By regime', back: 'Track record', actions: tb('info', 'About this view'), body: regimeA(ctx), rail: ctx.state === 'empty' ? '' : regHow() })
      }]
    }, {
      id: 'b', name: 'One table',
      why: 'Everything on one page: each horizon by window, then by holding, model and regime, every measure in its own column. Nothing is a tap away, and any two readings can be compared side by side.',
      cost: 'It is dense. On a phone the table turns into long rows of figures, and the first screen reads as a spreadsheet rather than an answer.',
      screens: [{
        id: 'b-table', title: 'Track record, one table',
        note: 'One page, top to bottom: horizons by window, then holding, model and regime over 365 days. On a phone each window is a row of figures. The same counts as the Scorecard, and the same rule: a rate shows only with its sample, and hit rate only beside the rest.',
        render: ctx => frame(ctx, { tab: 3, fresh: notPrices(ctx), title: 'Track record', actions: tb('info', 'About the track record'), body: `${recordSwitch(1)}${liveOnly()}${tableB(ctx)}`, rail: phone(ctx) ? (ctx.state === 'empty' ? '' : counted()) : '' })
      }, {
        id: 'b-slice', title: '6 months, opened',
        note: 'One row opened: the windows become columns, so 30, 90 and 365 days read across.',
        render: ctx => frame(ctx, { tab: 3, fresh: notPrices(ctx), title: '6 months', back: 'Track record', actions: tb('info', 'About this horizon'), body: sliceB(ctx), rail: sliceRail(ctx) })
      }]
    }]
  });
}
