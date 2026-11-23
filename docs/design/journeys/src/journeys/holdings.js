/* Holdings: what you own, then, as a separate place, how records arrive (MP-62). Both options follow one illustrative
   scanned statement from drop to commit. A block, so these helpers cannot collide with another journey's in the shared script. */
{
  const phone = ctx => ctx.kind === 'iphone' || ctx.kind === 'pwa';
  const acts = (...b) => `<div class="holdings-acts">${b.filter(Boolean).join('')}</div>`;
  const proposed = ref => `<span class="chip proposed" data-mo="chip"><span class="dot"></span>Proposed · ${ref}</span>`;
  const draftChip = `<span class="chip illus" data-mo="chip">Draft, not in your holdings</span>`;
  const ev = (k, t) => ({
    ok: `<span class="chip holdings-ok" data-mo="chip">${ic('check', 's14')}${t}</span>`,
    part: `<span class="chip partial" data-mo="chip"><span class="dot"></span>${t}</span>`,
    none: `<span class="chip illus" data-mo="chip">${ic('ban', 's14')}${t}</span>`,
    amb: `<span class="chip" data-mo="chip">${ic('split', 's14')}${t}</span>`,
    old: `<span class="chip stale" data-mo="chip">${ic('clock', 's14')}${t}</span>`,
    bad: `<span class="chip error" data-mo="chip">${ic('alert', 's14')}${t}</span>`,
    live: `<span class="chip fresh" data-mo="chip"><span class="dot"></span>${t}</span>`
  }[k]);
  const eyeBtn = () => tb('eye-off', 'Hide amounts');
  const tools = (...b) => `<span class="holdings-tools">${b.join('')}</span>`;
  const eyeInfo = t => tools(eyeBtn(), tb('info', t));
  const dis = (t, k = 'tinted') => `<button class="btn btn-${k} sm" type="button" disabled>${t}</button>`;
  /* the whole portfolio in Error: only the US run failed, so the UK and India stand on today's runs (ADM-10). One holding names its own market's run. */
  const LAST = LASTGOOD_ALL;
  const asOfH = h => { const [a, c] = clockOf(h); return `As of ${a} London · data cutoff ${c}`; };
  const lastH = h => { const [a, c] = clockOf(h); return h.v === 'XNAS' || h.v === 'ARCX' ? `Last good run Mon ${a} · cutoff ${c}` : asOfH(h); };
  const CLAUDE_OFF = 'Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in.';
  const LATE = 'HSBC last priced 14:10, before the 16:35 UK close. That is inside the freshness limit, so it stays in the total.';
  /* the owner pressed "Both keep the five" (MP40-Q12c): the Apple app and a browser keep the same records, each with its age.
     How a browser protects them is unverified, so a browser's offline copy says so, and an Apple one does not */
  const kept = ctx => (ctx.kind === 'web' || ctx.kind === 'pwa' ? browserKept() : '');
  const off = (ctx, t, title = 'Offline.') => banner('', title, t, 'wifi-off') + kept(ctx);
  /* how old a price may be is DATA-DEC-02, when a price may be used as current, so every use of the late-price rule says so */
  const limit = `<div class="holdings-acts">${proposed('DATA-DEC-02')}</div>`;
  /* a line and the open question it rests on, inside one measure */
  const flagged = (t, ref) => `<span class="holdings-late" style="margin-top:0"><span>${t}</span>${proposed(ref)}</span>`;
  /* one sentence, word for word, on every import, typed entry, draft, live approval, receipt and approve sheet */
  const NO_TRADE = 'This records what already happened at your broker. It places no trade.';
  const noTrade = `<p class="holdings-note">${NO_TRADE}</p>`;
  /* every import screen is Imports' own place in the iPad and desktop sidebar ("Add them to the sidebar", OWN-02); a phone reaches it under Settings */
  const imp = (ctx, spec) => { const sp = placed(ctx, 'imports', spec, 'Settings'); return frame(ctx, sp.sheet ? sp : { ...sp, body: noTrade + sp.body }); };
  /* one state, one sentence: both sides of a flip say the same */
  const SAY_STALE = 'Its last price, 14:10, is past the freshness limit, so it leaves the total until its price returns, and its forecast is held.';
  const SAY_OFF = 'Showing holdings from 22:15. Imports and approvals wait until you reconnect.';
  const SAY_NO_MODEL = 'Forecast ranges and actions are off. Value, cost basis and return come from your records, so they stand.';
  const sayError = () => stateCard('alert', 'The US run did not issue', 'Twelve Data failed at 21:16. Apple, NVIDIA and SPY are the last good figures, from Monday\'s run, issued 22:15. The UK and India ran today. They may have moved.', btn('Try again', 'tinted sm', 'refresh'));
  const saySplit = () => banner('', 'Rules and models disagree on Reliance.', 'At 3, 6 and 12 months the rules point down and the model points up. Both show, and no action is ranked. Models also split on Apple at 3 months, so Apple is not ranked and has no action either.', 'split');
  const sayAbstain = () => banner('', 'The model abstained on AstraZeneca.', 'Too little comparable history for a calibrated 6-month range, so none shows. Its value stands. It also abstains on Apple at 12 months. Neither is ranked, so neither has an action.', 'ban');

  /* ---------- the ledger behind the shared figures. Illustrative; values add up to the shared £84,612.40 ---------- */
  const L = {
    AAPL: { at: '2 accounts', units: '88 units', gain: '+£3,288.10', ret: '+14.2% a year', ev: ['ok', 'Part analytical'], s: ['ok', 'Available'] },
    NVDA: { at: 'General account', units: '60 units', gain: '+£4,902.10', ret: '+31.6% a year', ev: ['ok', 'Available'], s: ['ok', 'Available'] },
    SPY: { at: 'General account', units: '40 units', gain: '+£3,160.00', ret: '+9.8% a year', ev: ['ok', 'Available'], s: ['ok', 'Available'] },
    AZN: { at: 'Stocks ISA', units: '85 units', gain: '+£1,015.75', ret: 'No rate stated', ev: ['amb', 'Nonconvergent'], s: ['amb', 'Nonconvergent'] },
    HSBA: { at: 'Stocks ISA', units: '700 units', gain: '+£804.20', ret: '+8.1% a year', ev: ['old', 'Price 14:10'], s: ['old', 'Late'] },
    RELIANCE: { at: 'India demat', units: '120 units', gain: '+£1,240.30', ret: 'No single rate', ev: ['amb', 'Ambiguous'], s: ['amb', 'Ambiguous'] },
    NIFTYBEES: { at: 'India demat', units: '4,200 units', gain: 'Unavailable', ret: 'Unavailable', ev: ['none', 'Snapshot only'], s: ['none', 'Unavailable'] }
  };
  /* the measures of one holding: name, figure, status, why. Each has its own status, set before any wording (MP-69) */
  const measures = h => ({
    AAPL: [
      ['Value', '£14,820.50', ev('ok', 'Available'), 'Priced 21:00, Twelve Data. FX 20:58.'],
      ['Cost basis', '£11,532.40', ev('ok', 'Available'), 'Broker figure for the ISA; analytical FIFO for the General account, not tax basis.'],
      ['Gain', '+£3,288.10 (+28.5%)', ev('ok', 'Available'), 'Value less the cost basis above.'],
      ['Money-weighted return', '+14.2% a year', ev('ok', 'Available'), 'Local +11.9, FX +1.9, interaction +0.4 points. FX estimated from dated reference rates.']
    ],
    NIFTYBEES: [
      ['Value', '£15,169.55', ev('ok', 'Available'), 'From a snapshot of 4,200 units. Priced 10:00, Yahoo.'],
      ['Cost basis', 'Unavailable', ev('none', 'Unavailable'), 'No purchase history. Nothing is invented to fill it.'],
      ['Gain', 'Unavailable', ev('none', 'Unavailable'), 'Needs a cost basis.'],
      ['Money-weighted return', 'Unavailable', ev('none', 'Unavailable'), 'Needs dated cash flows. Never shown as zero.']
    ],
    HSBA: [
      ['Value', '£6,104.20', ev('old', 'Stale'), flagged('Last price 14:10, Yahoo. Left out of the total until its price returns.', 'DATA-DEC-02')],
      ['Cost basis', '£5,300.00', ev('ok', 'Available'), 'Broker figure, statement of 30 Sep.'],
      ['Gain', '+£804.20 (+15.2%)', ev('old', 'Stale'), 'Uses the 14:10 price.'],
      ['Money-weighted return', 'Withheld', ev('old', 'Stale'), 'Its closing value is stale, so the rate is withheld until its price returns.']
    ],
    RELIANCE: [
      ['Value', '£8,940.30', ev('ok', 'Available'), 'Priced 10:00, Yahoo. FX 20:58.'],
      ['Cost basis', '£7,700.00', ev('ok', 'Available'), 'Broker figure in INR, dated FX labelled estimated.'],
      ['Gain', '+£1,240.30 (+16.1%)', ev('ok', 'Available'), 'Value less the cost basis above.'],
      ['Money-weighted return', 'No single rate', ev('amb', 'Ambiguous'), flagged('These cash flows change direction three times, so more than one rate could fit. The search found +22.3% a year and cannot prove it is the only one, so none is picked. FX estimated from dated reference rates.', 'FIN-OD-04')]
    ],
    AZN: [
      ['Value', '£9,215.75', ev('ok', 'Available'), 'Priced 16:35, Yahoo.'],
      ['Cost basis', '£8,200.00', ev('ok', 'Available'), 'Broker figure, statement of 30 Sep.'],
      ['Gain', '+£1,015.75 (+12.4%)', ev('ok', 'Available'), 'Value less the cost basis above.'],
      ['Money-weighted return', 'No rate stated', ev('amb', 'Nonconvergent'), flagged('These cash flows change direction three times, and the search used its budget before it could separate the possible rates, so none is stated. Same inputs give the same result. Diagnostics kept.', 'FIN-OD-04')]
    ]
  }[h.t]);
  const accountsOf = h => ({
    AAPL: [['Stocks ISA', '60 units', '£10,104.90', 'Basis £7,920.00, broker', '+13.1% a year'], ['General account', '28 units', '£4,715.60', 'Basis £3,612.40, analytical, not tax basis', '+17.0% a year']],
    NIFTYBEES: [['India demat', '4,200 units', '£15,169.55', 'No basis: snapshot of 30 Sep', 'Unavailable']],
    HSBA: [['Stocks ISA', '700 units', '£6,104.20', 'Basis £5,300.00, broker', 'Withheld · Stale']],
    RELIANCE: [['India demat', '120 units', '£8,940.30', 'Basis £7,700.00, broker', 'No single rate']],
    AZN: [['Stocks ISA', '85 units', '£9,215.75', 'Basis £8,200.00, broker', 'No rate stated']]
  }[h.t]);
  /* which holding best shows each state of the one-holding screen */
  const pick = st => ({ empty: byT.NIFTYBEES, stale: byT.HSBA, disagreement: byT.RELIANCE, abstention: byT.AZN }[st] || byT.AAPL);
  /* Reliance at 6 months, as Forecast draws it: the rules point down and the model points up, so each side shows and no one median stands */
  const BASE = { med: -2.4, lo: -15.5, hi: 11.2, lo50: -8.9, hi50: 4.2 };
  const dual = () => `<div class="holdings-split" role="img" aria-label="At 6 months the baseline shows a median of minus 2.4% and R2-HGB v3 plus 7.4%, so no action is ranked"><span>Baseline</span>${range({ ...byT.RELIANCE, ...BASE })}<span>R2-HGB v3</span>${range(byT.RELIANCE)}</div>`;
  const sides = () => `Baseline ${pct(BASE.med)} · R2-HGB v3 ${pct(byT.RELIANCE.med)}`;

  /* a stale valuation withholds the rate that depends on it (financial specification, line 63), so HSBC keeps its rate while Late and loses it in Stale */
  const withheld = (h, ctx) => h.t === 'HSBA' && ctx.state === 'stale';
  const retOf = (h, ctx) => (withheld(h, ctx) ? 'Withheld' : L[h.t].ret);

  /* ---------- holdings: list rows and the desktop table ---------- */
  const fcLine = (h, ctx) => {
    const st = ctx.state;
    if (st === 'noModel') return `<span class="small muted">No forecast · no approved model</span>`;
    if (st === 'abstention' && h.t === 'AZN') return `<span class="chip">${ic('ban', 's14')}Abstained · no range shown</span>`;
    if (st === 'disagreement' && h.t === 'RELIANCE') return dual();
    if (h.stale) return `<span class="chip stale">${ic('clock', 's14')}Forecast held</span>${badge('Pause')}`;
    /* Apple is out at another horizon in these states, so it is not ranked and has no action at any horizon (OWN-17, OWN-20); the banner says why */
    const none = (st === 'abstention' || st === 'disagreement') && h.t === 'AAPL';
    return `<div class="rangewrap">${range(h)}</div><span class="fcv">${pct(h.med)} · 6M</span>${none ? '<span class="small muted">None</span>' : badge(h.act)}`;
  };
  const holdRow = (h, ctx) => {
    const l = L[h.t], [a, b] = h.val.split('.');
    return `<div class="hrow holdings-row${h.stale ? ' is-stale' : ''}" data-mo="rise">
      ${logo(h.c, h.lg)}
      <div style="min-width:0"><div class="nm">${h.n}</div><div class="tk">${h.t} · ${l.at}</div></div>
      <div class="vv"><div class="val">£${a}<span class="pp">.${b}</span></div>${h.stale ? `<span class="chg" style="color:var(--warn);font-size:12px;line-height:16px">${ic('clock', 's14')}${h.stale}</span>` : chg(h.day)}</div>
      <div class="fl">${fcLine(h, ctx)}</div>
      <div class="fl holdings-ret"><span>Return <b>${retOf(h, ctx)}</b></span>${withheld(h, ctx) ? ev('old', 'Stale') : ev(...l.ev)}</div>
    </div>`;
  };
  const fcCell = (h, ctx) => {
    const st = ctx.state;
    if (st === 'noModel') return `<span class="muted">No forecast</span>`;
    if (st === 'abstention' && h.t === 'AZN') return `<span class="chip">${ic('ban', 's14')}Abstained</span>`;
    if (st === 'disagreement' && h.t === 'RELIANCE') return `<span class="chip">${ic('split', 's14')}Differ · 6M</span><div class="small muted" style="font-size:12px;line-height:16px;margin-top:2px">Baseline ${pct(BASE.med)}<br>R2-HGB v3 ${pct(byT.RELIANCE.med)}</div>`;
    if (h.stale) return `<span class="chip stale">${ic('clock', 's14')}Held</span>`;
    return `<div style="display:flex;align-items:center;gap:6px"><span style="width:38px;color:var(--fc-ink);font-weight:600;text-align:right">${pct(h.med)}</span><span style="width:56px;display:block">${range(h, 56, 14)}</span></div><div class="small muted" style="font-size:12px;line-height:16px;white-space:nowrap">${pct(h.lo)} to ${pct(h.hi)}</div>`;
  };
  const listFoot = ctx => `<div class="t5foot">${ctx.state === 'noModel' ? '' : 'Decision support: each holding gives the reasons for its action, and forecast ranges are 80%. '}MyPrediction never places a trade. Illustrative.${ctx.state === 'stale' ? '' : `<div class="holdings-late"><span>${LATE}</span>${proposed('DATA-DEC-02')}</div>`}</div>`;
  const retCell = r => (r.startsWith('+') ? r.replace(' a year', '') : r === 'Unavailable' ? '' : `<span class="muted">${{ 'No single rate': 'Not proved', 'No rate stated': 'Not stated', Withheld: 'Withheld' }[r]}</span>`);
  const evCell = (h, ctx) => (withheld(h, ctx) ? ev('old', 'Stale') : ev(...L[h.t].s));
  const holdTable = (ctx, title = 'Holdings') => {
    const gain = ctx.kind === 'web', na = `<span class="muted" aria-label="Unavailable">–</span>`;
    return `<div class="card holdings-wide" data-mo="card"><div class="holdings-head" style="padding-bottom:2px"><h3>${title}</h3><span class="small muted">One forecast scale, −20% to +36%</span></div>
    <table class="ht dk"><thead><tr><th>Holding</th><th class="r">Value</th>${gain ? '<th class="r">Gain</th>' : ''}<th class="r">Return</th><th>6-month forecast</th><th>Evidence</th></tr></thead><tbody>${H.map(h => {
      const l = L[h.t];
      return `<tr data-mo="rise"><td><div class="inst">${logo(h.c, h.lg, true)}<div style="min-width:0"><b style="max-width:none;white-space:normal">${h.n}</b><span>${h.t}</span></div></div></td><td class="r" style="font-weight:600">£${h.val.split('.')[0]}</td>${gain ? `<td class="r">${l.gain === 'Unavailable' ? na : l.gain.split('.')[0]}</td>` : ''}<td class="r">${retCell(retOf(h, ctx)) || na}</td><td>${fcCell(h, ctx)}</td><td>${evCell(h, ctx)}</td></tr>`;
    }).join('')}</tbody></table>${listFoot(ctx)}</div>`;
  };
  const statsTwo = (ctx, partial) => `<div class="holdings-two"><div><span>Gain on ${partial ? '5' : '6'} of 7</span><b>${partial ? '+£13,606.25' : '+£14,410.45'}</b></div><div><span>Return on ${partial ? '3' : '4'} of 7</span><b>${partial ? '+12.9%' : '+11.8%'} a year</b></div></div>`;
  const valueCard = (ctx, o = {}) => `<div class="card valcard" data-mo="card">
    <div class="top"><span class="label">${o.label || 'Portfolio value'}</span>${o.chip || illus()}</div>
    ${money(o.val || '90,155.25', phone(ctx) ? 40 : 36)}
    ${o.sub || `<div class="d">${chg(1, '+£1,236.18 (1.39%)')}<span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">today</span></div>`}
    ${valParts(o.held)}
    <div class="meta">${o.meta || ASOF_ALL}</div>
    ${statsTwo(ctx, o.partial)}
  </div>`;
  const partialSub = () => `<div class="d" style="font-size:13px;line-height:18px;letter-spacing:0"><span class="muted">HSBC, £6,104.20 at 14:10, in your ISA, is left out until its price returns.</span></div>`;
  const partialCard = ctx => valueCard(ctx, { label: 'Known value, 6 of 7 priced', val: '84,051.05', held: '78,508.20', partial: true, chip: ev('part', 'Partial'), sub: partialSub() });
  const coverage = ctx => `<div class="card" style="padding:14px 16px" data-mo="card"><div class="label">What your evidence supports</div>
    ${(ctx.state === 'stale' ? [['Value', 6], ['Cost basis', 6], ['Gain', 5], ['Return', 3]] : [['Value', 7], ['Cost basis', 6], ['Gain', 6], ['Return', 4]]).map(([k, n]) => `<div class="holdings-cov"><span>${k}</span><i role="img" aria-label="${k}: ${n} of 7 holdings"><u data-mo="barx" style="--v:${Math.round(n / 7 * 100)}%"></u></i><b>${n} of 7</b></div>`).join('')}
    <p class="small muted" style="margin-top:10px">${ctx.state === 'stale' ? 'HSBC is past the freshness limit, so it leaves the value, gain and return. ' : ''}Nippon India Nifty 50 BeES is a snapshot with no history. Older statements fill the gaps. No single rate is proved for Reliance. For AstraZeneca the search used its budget before it could separate the possible rates, so none is stated.</p><div class="holdings-acts" style="margin-top:8px">${proposed('FIN-OD-04')}</div></div>`;
  const IMPORT_NOW = { loading: '1 import is uploading', error: '3 files not taken in', stale: '1 import last seen at 21:09', offline: '1 upload stopped at 62%', noModel: '1 scan is queued, not read', disagreement: '', abstention: '1 import is ready for you' };
  const importNow = st => [IMPORT_NOW[st] ?? '1 import is being read', '1 difference open'].filter(Boolean).join(' · ');
  const toImports = (n, t = 'General account, Q3 · cash differs by £8.15. Nothing here changes until you approve it.') => `<button class="card holdings-link" type="button" data-mo="card"><span class="ic">${ic('layers', 's18')}</span><span>${n}<small>${t}</small></span>${ic('chev-r', 's18')}</button>`;
  /* a candidate you do not hold: visibly apart from what you own (MP-144) */
  const watchCard = ctx => (['noModel', 'empty', 'loading'].includes(ctx.state) ? '' : `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('target', 's18')}</span><span style="flex:1;min-width:0">Not held, to watch<span class="holdings-sub">A candidate, not a holding. It adds nothing to your value.</span></span></div>
    <div class="holdings-acc" style="padding:0">${logo('--seg-ustech', 'M', true)}<div style="min-width:0"><b>Microsoft</b><span>MSFT · 6M ${pct(7)}, ${pct(-8.8)} to ${pct(22)}, 80% range</span></div><span class="badge">${ic('target', 's16')}Watch</span></div>
    <div class="holdings-acts"><span class="chip illus">Decision support</span>${illus()}</div></div>`);

  /* ---------- the import this journey follows: one scanned ISA statement, 11 rows in 5 groups ---------- */
  const G = {
    a: { t: 'Bought 4 Apple', d: '6 Oct', n: 3, m: 'Stocks ISA · AAPL · XNAS', l: 'Trade £672.80 · Fee £3.99 · Cash −£676.79', fx: 'Apple 60 → 64 units. Changes value, cost basis, gain and return.' },
    c: { t: 'Sold 10 AstraZeneca', d: '22 Oct', n: 3, m: 'Stocks ISA · AZN · XLON', l: 'Trade £1,076.00 · Fee £3.99 · Cash +£1,072.01', fx: 'AstraZeneca 85 → 75 units. Changes value, cost basis, gain and return.' },
    b: { t: 'Bought 30 HSBC', d: '13 Oct', n: 3, m: 'Stocks ISA · listing not chosen', l: 'Trade £261.00 · Fee £3.99 · Cash −£264.99', fx: 'HSBC 700 → 730 units once the listing is chosen. Changes value, cost basis, gain and return.' },
    d: { t: 'AstraZeneca dividend', d: '20 Oct', n: 1, m: 'Stocks ISA · AZN · XLON', l: 'Cash +£41.16' },
    e: { t: 'Transfer in', d: '28 Oct', n: 1, m: 'Stocks ISA · cash', l: 'Cash +£500.00' }
  };
  const tick = (t, on, dis) => `<button class="holdings-tick" type="button" role="checkbox" aria-checked="${!!on}" aria-label="Select ${t}"${dis ? ' disabled' : ''}>${on ? ic('check', 's16') : ''}</button>`;
  const gRow = (g, o = {}) => `<div class="holdings-g" data-mo="rise">${tick(g.t, o.on, o.dis)}<div class="t"><div style="min-width:0"><b>${g.t}</b><span class="w">${o.d || g.d} · ${g.n} row${g.n > 1 ? 's' : ''} · ${o.m || g.m}</span></div>${o.chip || ''}</div><div class="x"><span>${g.l}</span>${g.fx && !o.nofx ? `<span class="fx">${g.fx}</span>` : ''}${o.x || ''}</div></div>`;
  const scan = (blank) => `<div class="holdings-scan" role="img" aria-label="Page 2 of the scanned statement. The row for AstraZeneca reads 10 at 107.60, value 1,076.00. ${blank ? 'Its date could not be read.' : 'The price 107.60 is flagged as low confidence.'}"><div class="hd"><span>Your scan, page 2, row 6</span><span>GBP</span></div>
    <div class="ln dim"><span>20/10</span><span>ASTRAZENECA DIV</span><span></span><span></span><span>41.16</span></div>
    <div class="ln"><span>${blank ? '<mark>?</mark>' : '22/10'}</span><span>ASTRAZENECA</span><span>10</span><span>${blank ? '107.60' : '<mark>107.60</mark>'}</span><span>1,076.00</span></div>
    <div class="ln dim"><span>28/10</span><span>TRANSFER IN</span><span></span><span></span><span>500.00</span></div></div>`;
  const listingChoice = (o = {}) => `<div class="holdings-radios" role="radiogroup" aria-label="Which listing is this?">${[['HSBA · XLON · GBP', o.noClaude ? 'Ordinary share.' : 'Ordinary share. Claude suggests this; only you confirm it.'], ['HSBC · XNYS · USD', 'American depositary share.']].map(([b, s]) => `<button class="holdings-opt" type="button" role="radio" aria-checked="false"${o.off ? ' disabled' : ''}><span class="o" aria-hidden="true"></span><span><b>${b}</b>${s}</span></button>`).join('')}</div>`;
  const groupsCard = (ctx, o = {}) => {
    const off = !!o.off, done = !!o.resolved, none = !!o.none, b = (t, k) => (off ? dis(t, k) : btn(t, `${k} sm`));
    return `<div class="card" style="padding:2px 0" data-mo="card">
      ${gRow(G.a, { on: !none, dis: off, chip: ev('ok', 'Ready'), x: none ? '' : acts(b('Exclude group', 'plain')) })}
      ${done && !o.unread ? gRow(G.c, { on: true, chip: ev('ok', 'Confirmed') }) : gRow(G.c, { dis: true, d: o.unread ? 'Date not read' : '', chip: o.unread ? ev('none', 'Date not read') : ev('old', 'Check 1 field'), x: o.unread ? `<span class="holdings-note">Claude could not read the date on this row, so it is blank, not guessed. Type it from your statement.</span>${acts(b('Add the date', 'tinted'))}` : `${scan()}<span class="holdings-note">Claude read £107.60 with low confidence.</span>${acts(b('Confirm £107.60', 'primary'), b('Edit', 'tinted'), b('Exclude group', 'plain'))}` })}
      ${done ? gRow(G.b, { on: true, m: 'Stocks ISA · HSBA · XLON', chip: ev('ok', 'HSBA chosen') }) : gRow(G.b, { dis: true, chip: ev('amb', 'Choose a listing'), x: `<span class="holdings-note">Two listings fit “HSBC HOLDINGS”. Only this group waits on the choice.</span>${listingChoice({ off })}` })}
      ${gRow(G.d, { dis: true, chip: ev('none', 'Duplicate'), x: `<span>Same date, amount and account as the entry you typed on 21 Oct, receipt R-0211. Left out, still listed.</span>${acts(b('Keep it anyway', 'plain'))}` })}
      ${gRow(G.e, { dis: true, chip: ev('part', 'Stays pending'), x: `<span>Money from outside, or a transfer from your General account? It is not income until you say. It stays pending and visible.</span>${acts(b('From outside', 'tinted'), b('From General', 'tinted'))}` })}
    </div>`;
  };
  const draftHead = (ctx, o = {}) => `<div class="card" style="padding:14px 16px;display:grid;gap:8px" data-mo="card">
    <div class="holdings-bar"><div class="w"><b>ISA statement, Oct 2026</b>Scan · 4 pages · 11 rows in 5 groups · revision ${o.rev || 4}</div></div>
    <div class="holdings-acts">${draftChip}<span class="cl-chip"><span class="cl-mark s" aria-hidden="true"><i></i><i></i><i></i></span>${o.claude || 'Read by Claude, no tools, 1 field flagged'}</span></div></div>`;
  const change = (o = {}) => `<div class="card" style="padding:14px 16px;display:grid;gap:10px" data-mo="card"><div class="holdings-bar"><div class="w"><b>What will change</b>${o.sub || '1 group selected · 3 rows of 11'}</div>${illus()}</div>
    <div class="holdings-ba">${(o.rows || [['Apple, Stocks ISA', '60 → 64 units'], ['Cash, Stocks ISA', '£4,012.60 → £3,335.81']]).map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}</div>
    <p class="small muted">${o.note || 'Changes value, cost basis, gain and return on Apple, and your ISA cash. 2 groups need you. The duplicate and the transfer stay listed.'}${o.more ? ` ${o.more}` : ''}</p>${o.trade ? noTrade : ''}${o.go === false ? '' : btn('Review and approve', 'primary sm')}</div>`;
  const pending = (n = '1 group') => `<div class="holdings-bar"><div class="w"><b>${n} · 3 rows</b>2 groups need you</div>${btn('Review', 'primary sm')}</div>`;
  const mismatch = (o = {}) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('split', 's18')}</span>Statement and rows differ by £12.40</div>
    <div class="holdings-ba"><span>Closing cash on the statement</span><b>£4,630.43</b><span>From these rows, with the £500.00 transfer</span><b>£4,642.83</b><span>Difference, cash</span><b>£12.40</b></div>
    <p>Nothing is plugged or overwritten. Fix a row, add the missing one, or ${o.done ? '' : 'commit and '}keep the difference open, in plain sight, with your reason.</p>${acts(btn('Find the row', 'tinted sm'), btn('Keep it open, with a reason', 'plain sm'))}</div>`;

  /* the failures an upload can meet. The upload limit is an open owner question, so it is labelled proposed. A locked PDF opens on
     your device: the owner pressed "Local unlock step" (MP40-Q2), so its row leads to Unlock a PDF */
  /* one sentence, word for word, wherever a statement password is met (MP40-Q2) */
  const PDF_RULE = 'The password never leaves this device, and it is never stored, logged or sent to a model.';
  const failRow = (k, n, t, s, chip, a) => `<div class="hrow" style="grid-template-columns:30px minmax(0,1fr);align-items:start" data-mo="rise">${logo('--seg-metals', k, true)}<div style="min-width:0;display:grid;gap:6px"><div><div class="nm">${n}</div><div class="tk" style="white-space:normal">${t}</div></div><p class="small muted">${s}</p>${chip ? `<div class="holdings-acts">${chip}</div>` : ''}${a}</div></div>`;
  const failures = () => `<div class="card" style="padding:2px 0" data-mo="card"><div class="holdings-head"><h3>3 files not taken in</h3>${ev('bad', 'Nothing was read')}</div>
    ${failRow('PDF', 'isa-scan-copy.pdf', 'Unreadable file', 'Its contents do not match a PDF. It was refused at the door, and nothing reached Claude. Export it again from your broker.', '', acts(btn('Choose another', 'tinted sm')))}
    ${failRow('PDF', 'isa-2019-to-2026.pdf', 'Oversized file', 'Larger than a statement should be. It is held apart and not read until you decide. No upload limit is approved yet.', proposed('MP40-Q1'), acts(btn('Split and resend', 'tinted sm'), btn('Discard', 'plain sm')))}
    ${failRow('PDF', 'demat-oct-locked.pdf', 'Password-protected PDF', `Locked with a password, so nothing read it. Open it on this device with its password, and only the unlocked copy is sent. ${PDF_RULE}`, '', acts(btn('Unlock on this device', 'tinted sm')))}</div>`;
  const interrupted = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('wifi-off', 's18')}</span>Upload stopped at 62%</div><p>isa-oct-2026-scan.pdf did not finish, so no part of it was kept. Send it again once you are back online. Your link has expired and a new one is made for you.</p><div class="calbar" role="img" aria-label="Stopped at 62%"><i style="width:62%;background:var(--ink-2)"></i></div>${acts(`<button class="btn btn-tinted sm" type="button" disabled>Send again when online</button>`)}</div>`;
  const STEP = ['Received', 'Checked', 'Reading', 'Ready'];
  const steps = at => `<ol class="holdings-steps" aria-label="Import progress">${STEP.map((t, i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}"${i === at ? ' aria-current="step"' : ''}><i data-mo="barx"></i><span>${i < at ? ic('check', 's14') : ''}${t}</span></li>`).join('')}</ol>`;
  const fileHead = (chip, t = 'ISA statement, Oct 2026', s = 'isa-oct-2026-scan.pdf · 4 pages') => `<div class="sh"><span class="ic">${ic('layers', 's18')}</span><span style="flex:1;min-width:0">${t}<span class="holdings-sub">${s}</span></span>${chip}</div>`;
  const running = (ctx, o = {}) => `<div class="card state" data-mo="card">${fileHead(o.chip || ev('live', 'Live'))}${steps(o.at ?? 2)}${o.body || `<span class="cl-chip is-working" style="align-self:flex-start"><span class="cl-mark s" aria-hidden="true"><i></i><i></i><i></i></span>Claude is reading page 3 of 4</span><p>Checked and held apart before anything read it. Claude has no tools here and can change nothing. You review every row.</p>`}</div>`;
  const uploading = () => `<div class="card state" data-mo="card">${fileHead(`<span class="chip"><span class="spin" aria-hidden="true"></span>62%</span>`)}${steps(0)}<div class="calbar" role="img" aria-label="Upload 62% done"><i data-mo="barx" style="width:62%;background:var(--link)"></i></div><p>Uploading privately. Size, type and pages are checked next, before anything reads the file.</p></div>`;
  const reconnecting = () => running({}, { chip: ev('old', 'Last known 21:09'), body: `<p>Live updates stopped at 21:09. Reading was the last known step, shown here as stale. MyPrediction is re-reading the import itself, so what you see next is the true status.</p>${acts(btn('Check now', 'tinted sm', 'refresh'))}` });
  const scansOff = () => `<div class="card state" data-mo="card">${fileHead(ev('old', 'Paused for credit'))}${steps(2)}<p>This scan is queued and no model has read it. ${CLAUDE_OFF} CSV, Excel, text PDFs and typed rows work now.</p>${acts(btn('Type the rows in', 'tinted sm'))}</div>`;
  const scanFailed = () => `<div class="card state" data-mo="card">${fileHead(ev('bad', 'Not read'))}${steps(2)}<p>Claude’s reply failed validation, so it was refused and no rows were made. Your original is safe and nothing reached your ledger. A retry stays inside the same budget, and stops with a reason if it fails again.</p>${acts(btn('Try again', 'tinted sm', 'refresh'), btn('Type the rows in', 'plain sm'))}</div>`;
  const stillApproved = (o = {}) => `<div class="card" style="padding:12px 14px;display:grid;gap:8px" data-mo="card"><div class="label">Still approved, until 21:33</div><div class="holdings-ba"><span>Apple</span><b>60 → 64 units</b><span>HSBC, HSBA · XLON</span><b>700 → 730 units</b><span>AstraZeneca</span><b>85 → 75 units</b><span>ISA cash</span><b>£4,012.60 → £4,142.83</b></div>${o.failed ? '' : acts(btn('Revoke approval', 'plain sm'))}</div>`;
  const HIST = [
    ['CSV', 'General account, Q3', '18 rows · committed 24 Oct · R-0212', ev('ok', 'Committed')],
    [ic('plus', 's16'), 'AstraZeneca dividend, typed', '1 row · committed 21 Oct · R-0211', ev('ok', 'Committed')],
    ['PDF', 'ISA statement, September', '12 rows · committed 6 Oct · R-0210', ev('ok', 'Committed')],
    ['PDF', 'India demat, September', '6 rows · committed 2 Oct · R-0209', ev('ok', 'Committed')],
    ['PNG', 'Apple screenshot', '1 row · reversed 12 Sep · R-0204', ev('none', 'Reversed')]
  ];
  const history = (o = {}) => `<div class="card top5" style="padding:2px 0" data-mo="card"><div class="holdings-head"><h3>Earlier imports</h3></div>${(o.rows || HIST).map(([k, n, s, c]) => `<div class="holdings-acc" style="grid-template-columns:30px minmax(0,1fr) auto" data-mo="rise">${logo('--seg-metals', k, true)}<div style="min-width:0"><b>${n}</b><span>${s}</span></div>${c}</div>`).join('')}</div>`;
  const records = (first, offl) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('shield', 's18')}</span>Your records</div>${first ? '<p>Originals are kept privately for a renewable 24 months, and only you can delete them. There is nothing to export yet.</p>' : `<p>6 originals kept privately for a renewable 24 months. Next due: the Dec 2024 statement, in Dec 2026.</p><p>Export the ledger and its evidence as of revision 213. The private link starts a download for one hour.</p>${acts(offl ? dis('Export when online') : btn('Export', 'tinted sm'), offl ? '' : btn('Manage originals', 'plain sm'))}`}</div>`;
  const dropZone = ctx => `<div class="holdings-drop" data-mo="card"><span class="ring">${ic('layers', 's24')}</span><b>${phone(ctx) ? 'Add a statement' : 'Drop a statement here'}</b><p>CSV, Excel, PDF or a screenshot. It is held apart and checked before anything reads it.</p>${acts(btn('Choose a file', 'primary sm'), btn('Type it in', 'tinted sm'))}</div>`;
  /* open work in Imports: an unsent typed entry and a difference that stays open across sessions */
  const openRow = (i, n, s) => `<button class="holdings-acc holdings-btn" type="button" data-mo="rise"><span class="logo sm" style="--c:var(--seg-metals)" aria-hidden="true">${ic(i, 's16')}</span><span class="t"><b>${n}</b><span>${s}</span></span>${ic('chev-r', 's18')}</button>`;
  const REBUILD_ROW = { default: ['Rebuild proposal ready', 'Nippon India Nifty 50 BeES · from 3 older statements'], stale: ['Rebuild proposal out of date', 'Nippon India Nifty 50 BeES · refresh it and approve it again'], disagreement: ['Rebuild proposal held', 'Nippon India Nifty 50 BeES · 20 units short'], abstention: ['Rebuild proposal, part history', 'Nippon India Nifty 50 BeES · Proposed · FIN-OD-03'] };
  const openWork = (st = 'default') => `<div class="card top5" style="padding:2px 0 6px" data-mo="card"><div class="holdings-head"><h3>Open work</h3></div>${openRow('plus', 'Resume typed entry', 'General account · saved 21:09 · not added')}${openRow('split', 'Open the difference', 'General account, Q3 · cash differs by £8.15')}${openRow('layers', ...REBUILD_ROW[st])}</div>`;
  const openDiff = () => `<div class="card state" data-mo="card">${fileHead(ev('amb', 'Difference open'), 'General account, Q3', 'Committed 24 Oct · R-0212')}<p>The statement closes £8.15 away from the ledger on cash. It stays open across sessions until you fix or resolve it, and no plug trade clears it.</p>${acts(btn('Open the difference', 'tinted sm'))}</div>`;
  const readyCard = (ctx, go) => running(ctx, { at: 3, chip: ev('ok', 'Ready for you'), body: `<p>Claude read 10 of the 11 rows in full. 1 field it could not read is blank, not guessed, and waits for you.</p>${acts(btn(go, 'primary sm'))}` });
  const importsPlace = (ctx, head, go) => region(ctx, {
    ok: () => head + running(ctx) + openWork(),
    loading: () => head + uploading() + openWork(),
    empty: () => head + stateCard('layers', 'No imports yet', 'Bring in a statement to start your ledger. Every row waits for your review, and nothing changes until you approve it.'),
    error: () => head + failures() + openWork(),
    stale: () => head + reconnecting() + openWork('stale'),
    offline: () => off(ctx, 'Uploads need a connection. Past imports are shown from 22:15.') + interrupted() + openDiff(),
    noModel: () => head + scansOff() + openWork(),
    disagreement: () => head + openDiff() + openWork('disagreement'),
    abstention: () => head + readyCard(ctx, go) + openWork('abstention')
  });
  const importsRail = ctx => (ctx.state === 'empty' ? records(true) : history() + records(false, ctx.state === 'offline'));

  /* ---------- the approval: names exactly what will change ---------- */
  const approveList = (o = {}) => `<div class="card" style="margin-top:12px;padding:12px 14px;display:grid;gap:8px" data-mo="card"><div class="label">Commit ${o.n || '3 groups, 9 of 11 rows'}, to Stocks ISA</div>
    <div class="holdings-ba">${(o.rows || [['Apple', '60 → 64 units'], ['HSBC, HSBA · XLON', '700 → 730 units'], ['AstraZeneca', '85 → 75 units'], ['Cash', '£4,012.60 → £4,142.83']]).map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}</div>
    <p class="small muted">${o.left || 'Left out and still listed: AstraZeneca dividend, duplicate. Transfer in £500.00, pending.'}</p></div>`;
  const HASH = { 4: '3c9e…01ab', 5: 'b41d…9e07', 6: '7f3a…c21e' };
  const bind = (rev = 6, led = 213) => `<div class="holdings-bind" style="margin-top:10px"><span>Draft revision ${rev}</span><span>Hash <code>${HASH[rev]}</code></span><span>Ledger revision ${led}</span><span>Illustrative</span></div>`;
  const sheetHead = t => `<div class="grabber"></div><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h4 id="holdings-sheet">${t}</h4><button class="iconbtn sm" type="button" aria-label="Close">${ic('x', 's16')}</button></div>`;
  const sheetBtns = (a, b) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px">${a}${b}</div>`;
  const approveNote = `<p class="holdings-note" style="margin-top:10px">Approving needs a fresh sign-in, and the commit must start within 15 minutes. Any change needs a new approval.</p>`;
  const approveSheet = ctx => {
    const st = ctx.state, go = (l, dis) => `<button class="btn sm btn-primary" type="button"${dis ? ' disabled' : ''}>${l}</button>`, no = btn('Not now', 'tinted sm');
    const open = (head, mid, foot) => `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="holdings-sheet" data-mo="sheet">${sheetHead(head)}${mid}<p class="holdings-note" style="margin-top:10px">${NO_TRADE}</p>${foot}</div>`;
    switch (st) {
      case 'loading': return open('Waiting for your sign-in', `${approveList()}${bind()}<p class="holdings-note" style="margin-top:10px">Checking your sign-in with the server. A Face ID unlock alone does not count. Nothing has been approved yet.</p>`, sheetBtns(no, `<button class="btn sm btn-tinted" type="button" disabled><span class="spin" aria-hidden="true"></span>Checking</button>`));
      case 'empty': return open('Nothing selected', `<p class="holdings-note" style="margin-top:10px">Select at least one complete group. Each keeps its cash, fee and linked rows together, so a part of a group cannot be committed.</p>`, sheetBtns(no, go('Sign in and approve', true)));
      case 'error': return open('Approval refused', `<div style="margin-top:10px">${banner('fall', 'Ledger moved on.', 'It is now at revision 214, and this approval was for 213. Nothing was committed. Refresh the preview to approve the new one.', 'alert')}</div>${approveList()}${bind()}`, sheetBtns(no, btn('Refresh preview', 'primary sm')));
      case 'stale': return open('This approval expired', `<div style="margin-top:10px">${banner('warn', 'Expired at 21:33.', 'The commit did not start within 15 minutes, so nothing was committed. The rows have not changed, so a fresh approval is enough.', 'clock')}</div>${approveList()}${bind()}`, sheetBtns(no, go('Sign in and approve')));
      case 'offline': return open('You are offline', `<div style="margin-top:10px">${off(ctx, 'The server has to check your sign-in. Your selection is safe on revision 6, and nothing was approved.', 'Approval needs a connection.')}</div>${approveList()}${bind()}`, sheetBtns(no, go('Sign in and approve', true)));
      case 'disagreement': return open('Approve exactly this', `${approveList()}<div style="margin-top:10px">${banner('warn', 'A £12.40 cash difference stays open.', 'Approving does not clear it. It stays visible on the receipt until you fix it or resolve it with a reason.', 'split')}</div>${bind()}${approveNote}`, sheetBtns(no, go('Sign in and approve')));
      case 'abstention': return open('Approve exactly this', `${approveList({ n: '2 groups, 6 of 11 rows', rows: [['Apple', '60 → 64 units'], ['HSBC, HSBA · XLON', '700 → 730 units'], ['Cash', '£4,012.60 → £3,070.82']], left: 'Left out and still listed: Sold 10 AstraZeneca, date not read. AstraZeneca dividend, duplicate. Transfer in £500.00, pending.' })}<div style="margin-top:10px">${banner('', 'One group cannot be approved.', 'Claude could not read its date, and a blank is never filled in. Add the date to include it.', 'ban')}</div>${bind(5)}${approveNote}`, sheetBtns(no, go('Sign in and approve')));
      default: return open('Approve exactly this', `${approveList()}${bind()}${approveNote}`, sheetBtns(no, go('Sign in and approve')));
    }
  };
  const naApprove = { noModel: 'This sheet lists ledger changes you reviewed. No model is involved, and no model can approve anything.' };

  /* the receipt, and how a mistake is put right */
  const receipt = (ctx, o = {}) => `<div class="card valcard" data-mo="card"><div class="holdings-bar"><span class="holdings-done">${ic('check', 's24')}</span><div class="w"><b>${o.t || 'Committed'}</b>${o.s || 'All 9 rows, all at once, at 21:22'}</div>${illus()}</div>
    <div class="holdings-ba" style="margin-top:12px"><span>Ledger revision</span><b>213 → 214</b><span>Receipt</span><b>R-0213</b><span>Apple</span><b>64 units</b><span>HSBC, HSBA · XLON</span><b>730 units</b><span>AstraZeneca</span><b>75 units</b><span>ISA cash</span><b>£4,142.83</b></div>
    <p class="small muted" style="margin-top:10px">2 rows stay in the draft and remain visible: the duplicate and the pending transfer.</p></div>`;
  const original = hold => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('lock', 's18')}</span>Original kept to Oct 2028</div><p>isa-oct-2026-scan.pdf stays private and renewable. Deleting it keeps these ledger rows, marked evidence unavailable, and a restore can never bring it back.</p>${hold ? acts(dis('Renew'), dis('Delete original', 'plain')) : acts(btn('Renew', 'tinted sm'), btn('Delete original', 'plain sm'))}</div>`;
  const refusal = () => banner('fall', 'Reversal refused.', 'A sale on 2 Nov depends on these units. Approve its correction together with this reversal, or leave both as they are.', 'ban');
  const correction = (o = {}) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('refresh', 's18')}</span>Correct a row</div><p>Sold 8, not 10? A correction reverses every leg of the original and commits its replacement together. The original stays on record.</p>
    <div class="holdings-ba"><span>Reverse: Sold 10 AstraZeneca</span><b>+10 · −£1,072.01</b><span>Replace: Sold 8 AstraZeneca</span><b>−8 · +£856.81</b><span>AstraZeneca after</span><b>77 units</b><span>ISA cash after</span><b>£3,927.63</b></div>${o.refused ? refusal() + acts(btn('Review both together', 'primary sm'), btn('Review this correction', 'plain sm')) : o.stale ? acts(btn('Refresh', 'primary sm', 'refresh'), dis('Review and approve'), btn('Reverse the import', 'plain sm')) : acts(btn('Review and approve', 'primary sm'), btn('Reverse the import', 'plain sm'))}</div>`;
  const reversal = (o = {}) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('rebalance', 's18')}</span>Reverse this import</div><p>A reversal has its own preview and approval. Later events are checked first, and the original rows stay on record.</p>
    <div class="holdings-ba"><span>Apple</span><b>64 → 60 units</b><span>HSBC</span><b>730 → 700 units</b><span>AstraZeneca</span><b>75 → 85 units</b><span>ISA cash</span><b>£4,142.83 → £4,012.60</b></div>${o.refused ? refusal() : `<p>${o.stale ? 'Not checked against revision 215.' : 'Checked: no later event depends on these rows.'}</p>`}${o.stale ? acts(btn('Refresh', 'primary sm', 'refresh'), dis('Review and approve'), btn('Correct one row', 'plain sm')) : acts(btn(o.refused ? 'Review both together' : 'Review and approve', 'primary sm'), btn('Correct one row', 'plain sm'))}</div>`;

  /* the same outcome on both sides of the receipt. The sale adds a flow in the direction of its closing value, so its flows still change direction three times, and the search budget still runs out first (MP-72) */
  const noRateNow = () => stateCard('split', 'AstraZeneca still has no stated rate', 'Sold 10 adds one more dated flow to its cash flows. The search still uses its budget before it can separate the possible rates, so none is stated, and the rest of its figures stand.', '', ev('amb', 'Nonconvergent') + proposed('FIN-OD-04'));
  const DATE_ADDED = { s: 'All 9 rows, all at once, at 21:22. You added the missing date first, then approved again.' };
  const staleChange = () => banner('warn', 'This change is out of date.', 'A newer change reached the ledger first, at revision 215. Refresh it before you approve. Only one change can win.', 'clock');
  const commitFailed = () => stateCard('alert', 'The commit did not finish', 'Nothing is visible and your ledger stays at revision 213. Retrying repeats the same operation, so it can never commit twice.', btn('Retry safely', 'primary sm', 'refresh')) + stillApproved({ failed: true });
  const cancelled = () => stateCard('x', 'Draft cancelled', 'Nothing was committed, and your ledger stays at revision 213. The original stays, so you can start again.', btn('Back to Imports', 'tinted sm'));

  /* ---------- Option A, one holding ---------- */
  const mRow = ([k, v, s, n]) => `<div class="holdings-m" data-mo="rise"><span class="k">${k}</span><span class="v">${v}</span><span class="s">${s}</span><span class="n">${n}</span></div>`;
  const hHead = (ctx, h, o = {}) => `<div class="card valcard" data-mo="card"><div class="holdings-bar">${logo(h.c, h.lg)}<div class="w"><b>${h.n}</b>${h.t} · ${h.v} · ${L[h.t].units}</div>${illus()}</div>
    <div style="margin-top:10px">${money(h.val, phone(ctx) ? 40 : 36)}</div><div class="d">${h.stale ? `<span class="chg" style="color:var(--warn)">${ic('clock', 's14')}Last price ${h.stale}</span>` : `${chg(h.day)}<span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">today</span>`}</div><div class="meta">${o.meta || asOfH(h)}</div></div>`;
  const acctCard = (h, ctx) => `<div class="card" style="padding:0 0 4px" data-mo="card"><div class="holdings-head"><h3>In your accounts</h3></div>${accountsOf(h).map(([n, u, v, b, r]) => `<div class="holdings-m" data-mo="rise"><span class="k">${n} · ${u}</span><span class="v">${v}</span><span class="r2">${ctx.state === 'error' ? 'Not shown' : r}</span><span class="n">${b}</span></div>`).join('')}</div>`;
  /* the reasons behind a ranked action on a holding, in the same parts as the ranking (MP-144). Computed by code, illustrative */
  const WHY = { AAPL: ['Protection leads, and no part is weak.', 'Growth 68, Protection 70, Opportunity 65 · score 68 · Policy v1'], NIFTYBEES: ['Protection leads, and its growth and opportunity sit close together.', 'Growth 58, Protection 76, Opportunity 56 · score 65 · Policy v1'] };
  const actionRow = h => `<div class="holdings-bar" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--hairline)">${badge(h.act)}<div class="w">Ranked action · 6 months</div><span class="chip illus">Decision support</span></div><p class="small muted" style="margin-top:8px">${WHY[h.t][0]} Your return is not part of it.</p><p class="small muted" style="margin-top:4px">${WHY[h.t][1]}</p>`;
  const fcAction = (h, ctx) => {
    const st = ctx.state, foot = `<div class="fmeta" style="margin-top:8px"><span>${(st === 'error' ? lastH(h) : asOfH(h)).split(' · ')[0]}</span><span>Data cutoff ${clockOf(h)[1]}</span><span>R2-HGB v3</span><span>Illustrative</span></div>`;
    if (st === 'noModel') return stateCard('cube', 'No approved model', `No approved model covers ${h.n} yet, so no forecast or action shows. Your figures come from your records, so everything else here stands.`);
    if (st === 'abstention') return stateCard('ban', 'The model abstained', 'Too little comparable history for a calibrated 6-month range, so no range and no action show.', '', ev('none', 'Abstained · no range shown'));
    if (st === 'disagreement') return `<div class="card fcard" data-mo="card"><div class="label">6-month forecast · RELIANCE</div><p class="small muted" style="margin:6px 0 8px">The rules point down and the model points up. Each side shows, and no action is ranked.</p><div class="holdings-ba" style="margin-bottom:8px"><span>Rules, heuristic strength</span><b>Pause · moderate</b><span>R2-HGB v3, median</span><b>${pct(byT.RELIANCE.med)}</b><span>Baseline, for comparison</span><b>${pct(BASE.med)}</b></div>${dual()}${foot}</div>`;
    if (h.stale) return stateCard('clock', 'Forecast held', 'HSBC last priced 14:10. Its forecast is held and its action stays Pause until its price returns.', '', `${badge('Pause')}<span class="chip illus">Decision support</span>${ev('old', 'Yahoo · HSBC stale')}`);
    if (st === 'empty') return `<div class="card fcard" data-mo="card">${fcHead(h)}<div style="margin-top:10px">${range(h)}</div>${foot}${actionRow(h)}</div>`;
    return `<div class="card fcard" data-mo="card">${fcHead(h)}<div style="margin-top:10px">${range(h)}</div>${foot}
      ${actionRow(h)}
      <div style="margin-top:10px">${btn('Record decision', 'tinted sm')}</div></div>`;
  };
  const SRC = { gen: ['CSV', 'General account, Q3', 'Committed 24 Oct · R-0212'], isa: ['PDF', 'ISA statement, September', 'Committed 6 Oct · R-0210'], ind: ['PDF', 'India demat, September', 'Committed 2 Oct · R-0209'], gone: ['PDF', 'ISA statement, January 2024', 'Original deleted · its ledger event stays'] };
  const sourcesOf = h => ({ AAPL: [SRC.isa, SRC.gen, SRC.gone], NIFTYBEES: [SRC.ind], RELIANCE: [SRC.ind], AZN: [SRC.isa], HSBA: [SRC.isa] }[h.t]);
  const provenance = h => `<div class="card top5" style="padding:2px 0 6px" data-mo="card"><div class="holdings-head"><h3>Where this comes from</h3></div>
    ${sourcesOf(h).map(([k, n, s]) => `<div class="holdings-acc" style="grid-template-columns:30px minmax(0,1fr)" data-mo="rise">${logo('--seg-metals', k, true)}<div style="min-width:0"><b>${n}</b><span>${s}</span></div></div>`).join('')}</div>`;
  const oneTop = (ctx, h) => {
    const st = ctx.state;
    if (st === 'loading') return hHead(ctx, h, { meta: 'Last good 22:15 · refreshing' });
    if (st === 'offline') return off(ctx, 'Showing Apple from 22:15. Nothing updates until you reconnect.') + hHead(ctx, h, { meta: 'From 22:15 · not updating' });
    return hHead(ctx, h, st === 'error' ? { meta: lastH(h) } : {});
  };
  const holdingA = (ctx, o = {}) => {
    const st = ctx.state, h = pick(st);
    const top = oneTop(ctx, h);
    const list = st === 'loading' ? skel(3) : st === 'error'
      ? `<div class="card" style="padding:4px 0" data-mo="card">${measures(h).slice(0, 3).map(mRow).join('')}${mRow(['Money-weighted return', 'Not shown', ev('bad', 'Integrity failed'), 'The cash flows did not balance at 21:16. No partial rate is shown. It is tried again on the next run.'])}</div>`
      : `<div class="card" style="padding:4px 0" data-mo="card"><div class="holdings-head"><h3>What your evidence supports</h3></div>${measures(h).map(mRow).join('')}</div>`;
    const gap = st === 'empty' ? stateCard('layers', 'Snapshot only', 'You have units and a value, with no purchases behind them. Older statements fill the history through a rebuild you approve. Forecasts you have seen stay as they were.', btn('Go to Imports', 'tinted sm', 'chev-r')) : '';
    const body = `${top}${list}${gap}${st === 'error' ? stateCard('alert', 'One measure failed', 'Value, cost basis and gain are sound. Only the return failed its check, so only the return is held back.') : ''}${acctCard(h, ctx)}`;
    return { body, rail: `${fcAction(h, ctx)}${provenance(h)}` };
  };

  /* ---------- Option B: by account, one question at a time ---------- */
  const ACC = [
    { n: 'Stocks ISA', c: '--seg-uketf', m: 'GBP · 3 holdings', hold: '£25,424.85', known: '£19,320.65', cash: '£4,012.60', ret: 'Partial, on 2 of 3', retStale: 'Partial, on 1 of 3', ev: ['old', 'October statement due'], rows: [['AAPL', '60 units', '£10,104.90'], ['AZN', '85 units', '£9,215.75'], ['HSBA', '700 units', '£6,104.20']] },
    { n: 'General account', c: '--seg-uslarge', m: 'GBP · 3 holdings', hold: '£35,077.70', cash: '£1,530.25', ret: '+17.4% a year', ev: ['amb', 'Difference open, £8.15'], rows: [['AAPL', '28 units', '£4,715.60'], ['NVDA', '60 units', '£11,402.10'], ['SPY', '40 units', '£18,960.00']] },
    { n: 'India demat', c: '--seg-n50', m: 'INR, shown in GBP · 2 holdings', hold: '£24,109.85', cash: 'None held', ret: 'Unavailable, 0 of 2', ev: ['part', '1 snapshot, no history'], rows: [['RELIANCE', '120 units', '£8,940.30'], ['NIFTYBEES', '4,200 units', '£15,169.55']] }
  ];
  const accCard = (a, ctx) => { const part = ctx.state === 'stale' && a.known; return `<div class="card top5" data-mo="card"><div class="t5h" style="--c:var(${a.c})"><h4>${a.n}</h4><p>${a.m}</p></div>
    ${a.rows.map(([t, u, v]) => { const h = byT[t], stale = h.stale; return `<div class="holdings-acc" data-mo="rise">${logo(h.c, h.lg, true)}<div style="min-width:0"><b>${h.n}</b><span>${t} · ${u}</span></div><div><div class="r">${v}</div>${stale ? `<span style="text-align:right;color:var(--warn)">${ctx.state === 'stale' ? 'Stale' : 'Late'} · ${h.stale} · ${ctx.state === 'noModel' ? 'No forecast' : 'forecast held'}</span>` : `<span style="text-align:right">${fcSmall(h, ctx)}</span>`}</div></div>${ctx.state === 'disagreement' && t === 'RELIANCE' ? `<div class="holdings-sides"><span>${sides()}</span>${dual()}</div>` : ''}`; }).join('')}
    <div class="holdings-foot"><div><span>${part ? 'Known, 2 of 3' : 'Holdings'}</span><b>${part ? a.known : a.hold}</b></div><div><span>Cash</span><b>${a.cash}</b></div><div><span>Return</span><b>${part ? a.retStale : a.ret}</b></div></div>
    <div style="padding:0 16px 12px;display:flex;align-items:center;gap:8px;justify-content:space-between;flex-wrap:wrap">${ev(...a.ev)}${btn('Add statement', 'plain sm')}</div>${a.known && ctx.state !== 'stale' ? `<div class="t5foot"><div class="holdings-late" style="margin-top:0"><span>${LATE}</span>${proposed('DATA-DEC-02')}</div></div>` : ''}</div>`; };
  const fcSmall = (h, ctx) => {
    const st = ctx.state;
    if (st === 'noModel') return 'No forecast';
    if (st === 'abstention' && h.t === 'AZN') return 'Abstained';
    if (st === 'disagreement' && h.t === 'RELIANCE') return 'Split · no action';
    return `6M ${pct(h.med)}, ${pct(h.lo)} to ${pct(h.hi)}`;
  };
  const accSummary = (ctx, o = {}) => `<div class="card valcard" data-mo="card"><div class="top"><span class="label">${o.label || 'All accounts'}</span>${o.chip || illus()}</div>${money(o.val || '90,155.25', phone(ctx) ? 40 : 36)}${o.sub || `<div class="d">${chg(1, '+£1,236.18 (1.39%)')}<span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">today · 3 accounts</span></div>`}${valParts(o.held)}<div class="meta">${o.meta || ASOF_ALL}</div>${statsTwo(ctx, o.partial)}</div>`;
  const accSummaryPartial = ctx => accSummary(ctx, { label: 'Known value, 6 of 7 priced', val: '84,051.05', held: '78,508.20', chip: ev('part', 'Partial'), partial: true, sub: partialSub() });
  /* what built each position: units and costs add up to the holding, and each dated schedule, closed at its value on 3 Nov 2026, gives its stated rate.
     Reliance and AstraZeneca change direction three times, so neither has a proved single rate: Reliance's search finds one and cannot prove it the only one, and AstraZeneca's uses its budget first (MP-72, FIN-14, proposed FIN-OD-04) */
  const EVENTS = {
    AAPL: [['plus', 'Bought 40', '22 Apr 2025 · Stocks ISA · £5,280.00', 'Statement, page 1', ''], ['plus', 'Bought 28', '21 Feb 2025 · General account · £3,612.40', 'CSV, row 12', ''], ['plus', 'Bought 20', '16 Jan 2024 · Stocks ISA · £2,640.00', 'Original deleted', 'none']],
    HSBA: [['plus', 'Bought 200', '5 Jun 2025 · £1,700.00', 'Statement, page 2', ''], ['plus', 'Bought 500', '4 Nov 2024 · £3,600.00', 'Statement, page 2', '']],
    RELIANCE: [['plus', 'Bought 100', '3 Mar 2025 · £6,700.00', 'Statement, page 3', ''], ['trim', 'Sold 80', '9 Sep 2024 · £5,900.00', 'Statement, page 3', ''], ['plus', 'Bought 100', '12 Feb 2024 · £5,000.00', 'Statement, page 3', '']],
    AZN: [['plus', 'Bought 5', '3 Mar 2026 · £500.00', 'Statement, page 1', ''], ['plus', 'Bought 20', '8 Apr 2025 · £2,000.00', 'Statement, page 1', ''], ['trim', 'Sold 40', '2 Dec 2024 · £3,920.00', 'Statement, page 1', ''], ['plus', 'Bought 100', '14 Jun 2024 · £9,500.00', 'Statement, page 1', '']]
  };
  const holdingB = ctx => {
    const st = ctx.state, h = pick(st), ms = measures(h), showing = st === 'error' ? ms.slice(0, 3).concat([['Money-weighted return', 'Not shown', ev('bad', 'Integrity failed'), 'Cash flows did not balance at 21:16. No partial rate shows.']]) : ms;
    const statGrid = st === 'loading' ? skel(2) : `<div class="holdings-stat">${showing.map(([k, v, s, n]) => `<div data-mo="card"><span class="k">${k}</span><span class="v">${v}</span>${s}<span class="n">${n}</span></div>`).join('')}</div>`;
    const accts = h.t === 'AAPL' ? [['All', 'All accounts'], ['ISA', 'Stocks ISA'], ['General', 'General account']] : [[L[h.t].at, L[h.t].at]];
    const events = st === 'empty' ? stateCard('layers', 'No events behind this holding', 'A snapshot records units and value only, never invented purchases. Older statements add the history through a rebuild you approve.', btn('Go to Imports', 'tinted sm', 'chev-r'))
      : `<div class="card top5" style="padding:2px 0 6px" data-mo="card"><div class="holdings-head"><h3>What built this position</h3>${illus()}</div>${EVENTS[h.t].map(([i, n, s, e, k]) => `<div class="holdings-acc" data-mo="rise"><span class="logo sm" style="--c:var(--seg-metals)" aria-hidden="true">${ic(i, 's16')}</span><div style="min-width:0"><b>${n}</b><span>${s}</span></div>${k ? ev('none', e) : `<span class="small muted">${e}</span>`}</div>`).join('')}</div>`;
    const tabsRow = `<div data-mo="rise">${seg(accts.map(a => [a[0], a[1]]), 0, 'Account', 'full')}</div>`;
    const top = oneTop(ctx, h);
    return { body: `${top}${tabsRow}${statGrid}${st === 'error' ? stateCard('alert', 'One measure failed', 'Value, cost basis and gain are sound. Only the return failed its check.') : ''}${events}`, rail: `${fcAction(h, ctx)}${provenance(h)}` };
  };
  const STEPB = (at) => `<ol class="holdings-steps" aria-label="Import steps" data-mo="rise">${['Add', 'Read', 'Check', 'Approve'].map((t, i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}"${i === at ? ' aria-current="step"' : ''}><i></i><span>${i < at ? ic('check', 's14') : ''}${t}</span></li>`).join('')}</ol>`;
  const methods = (ctx, o = {}) => `<div class="card top5" style="padding:4px 0" data-mo="card">
    ${[['layers', 'A file', 'CSV, Excel or PDF', o.fileNote], ['search', 'A scan or screenshot', 'Read by Claude, with no tools', o.scanNote], ['plus', 'Type it in', 'Same review, same approval', '']].map(([i, n, s, x]) => `<button class="holdings-acc holdings-btn" type="button" style="min-height:56px" data-mo="rise"><span class="logo sm" style="--c:var(--seg-metals)" aria-hidden="true">${ic(i, 's16')}</span><span class="t"><b>${n}</b><span>${x || s}</span></span>${ic('chev-r', 's18')}</button>`).join('')}</div>`;
  const expectCard = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('clock', 's18')}</span><span style="flex:1;min-width:0">October statement<span class="holdings-sub">Stocks ISA · covers 1 to 31 Oct · last one to 30 Sep</span></span></div></div>`;
  const qCard = (ctx, st) => {
    if (st === 'abstention') return `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('ban', 's18')}</span><span style="flex:1;min-width:0">What date was this sale?<span class="holdings-sub">Sold 10 AstraZeneca · question 1 of 3</span></span></div>${scan(true)}<p>Claude could not read the date on this row, so it is blank, not guessed. Type it from your statement.</p>${acts(btn('Add the date', 'tinted sm'))}</div>`;
    return `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('search', 's18')}</span><span style="flex:1;min-width:0">Is this the price?<span class="holdings-sub">Sold 10 AstraZeneca · question 1 of 3</span></span></div>${scan()}<p>Claude read <b style="color:var(--ink);font-weight:600">£107.60</b> with low confidence. Check it against your statement, then answer.</p>${phone(ctx) ? '' : ['stale', 'offline'].includes(ctx.state) ? acts(dis('Yes, £107.60', 'primary'), dis('No, edit it')) : acts(btn('Yes, £107.60', 'primary sm'), btn('No, edit it', 'tinted sm'))}</div>`;
  };
  const groupList = (o = {}) => `<div class="card" style="padding:2px 0" data-mo="card"><div class="holdings-head"><h3>Groups</h3>${o.chip || `<button class="btn btn-plain sm" type="button">All 11 rows${ic('chev-r', 's14')}</button>`}</div>
    ${gRow(G.a, { on: !o.none, dis: o.off, chip: ev('ok', 'Ready'), nofx: true })}
    ${!o.unread && (o.resolved || o.at >= 2) ? gRow(G.c, { on: true, dis: o.off, chip: ev('ok', 'Confirmed'), nofx: true }) : gRow(G.c, { dis: true, d: o.unread ? 'Date not read' : '', chip: o.unread ? ev('none', 'Date not read') : ev('old', 'Question 1'), nofx: true })}
    ${o.resolved || o.at >= 3 ? gRow(G.b, { on: true, dis: o.off, m: 'Stocks ISA · HSBA · XLON', chip: ev('ok', 'HSBA chosen'), nofx: true }) : gRow(G.b, { dis: true, chip: ev('amb', 'Question 2'), nofx: true })}
    ${gRow(G.e, { dis: true, chip: ev('part', o.resolved ? 'Stays pending' : 'Question 3'), nofx: true })}
    ${gRow(G.d, { dis: true, chip: ev('none', 'Duplicate'), nofx: true })}</div>`;

  /* ---------- a field in a form. Every value here is illustrative ---------- */
  const fld = (l, v = '', o = {}) => `<label class="holdings-f${o.wide ? ' w' : ''}${o.bad ? ' bad' : ''}"><span>${l}</span><input type="${o.type || 'text'}" value="${v}"${o.type === 'password' ? ' autocomplete="off"' : ''}${o.off ? ' disabled' : ''}${o.bad ? ' aria-invalid="true"' : ''}>${o.bad ? `<em>${o.bad}</em>` : ''}</label>`;
  const claudeOff = t => banner('', 'Claude is off.', `${CLAUDE_OFF} ${t}`, 'cube');
  const stale214 = t => banner('warn', 'This draft is out of date.', t, 'clock') + acts(btn('Refresh preview', 'primary sm', 'refresh'));

  /* ---------- typing a row in: the same draft, review and approval as a file (MP-49) ---------- */
  const manualForm = (ctx, o = {}) => {
    const v = o.snap ? ['India demat', 'HDFC Bank, HDFCBANK', '30 Sep 2026', '50', '80,000.00', 'INR'] : o.blank ? [] : ['General account', 'SPDR S&P 500 ETF Trust, SPY', o.date || '2 Nov 2026', '2', '621.00', o.noCcy ? '' : 'USD', '0.00'], d = !!o.off;
    const send = d || o.blank || o.noCcy ? dis('Add to preview', 'primary') : btn('Add to preview', 'primary sm');
    return `<div class="card state" data-mo="card"><div data-mo="rise">${seg(['A transaction', 'A snapshot'], o.snap ? 1 : 0, 'What you are typing', 'full')}</div>${o.blank ? '<p>Nothing typed yet. Every field is checked before this becomes a draft.</p>' : ''}
      <div class="holdings-form">${fld('Account', v[0], { wide: 1, off: d })}${fld('Instrument', v[1], { wide: 1, off: d })}${fld(o.snap ? 'As of' : 'Date', v[2], { off: d })}${fld('Units', v[3], { off: d })}${fld(o.snap ? 'Value' : 'Price', v[4], { off: d })}${fld('Currency', v[5], { off: d, bad: o.noCcy ? 'Required. Nothing is defaulted.' : '' })}${o.snap ? '' : fld('Fee', v[6], { off: d })}</div>
      ${acts(send, btn('Finish later', 'plain sm'))}</div>`;
  };
  const manualBody = ctx => region(ctx, {
    ok: () => manualForm(ctx),
    loading: () => `<div class="card state" data-mo="card">${fileHead(`<span class="chip"><span class="spin" aria-hidden="true"></span>Adding</span>`, 'Typed entry', 'General account · 1 row')}<p>Saved as a draft. A second tap lands on this same draft, never a copy.</p></div>${manualForm(ctx, { off: true })}`,
    empty: () => manualForm(ctx, { blank: true }),
    error: () => banner('fall', 'Refused: the currency is missing.', 'Nothing is defaulted. Add it to carry on. Your draft is kept.', 'alert') + manualForm(ctx, { noCcy: true }),
    stale: () => banner('warn', 'Resumed, and out of date.', 'You left this draft at 21:09. Your ledger has since moved to revision 214, so check it again before you add it.', 'clock') + manualForm(ctx),
    offline: () => off(ctx, 'Adding to preview waits until you reconnect. Your draft reached the server at 21:09.') + manualForm(ctx, { off: true }),
    noModel: () => claudeOff('Typed rows never use it, so this works as usual.') + manualForm(ctx),
    disagreement: () => banner('', 'This matches a row you already have.', 'Same date, units and account as a row on receipt R-0212. It can still go to preview, where it shows as a duplicate.', 'split') + manualForm(ctx, { date: '25 Sep 2026' }),
    abstention: () => banner('', 'A snapshot has no history behind it.', 'It records units and a value as an observation. No purchase is invented.', 'ban') + manualForm(ctx, { snap: true })
  });
  const manualScreen = (id, top = '') => ({
    id, title: 'Type it in',
    note: 'A typed row becomes a draft, then takes the same preview and approval as a file. Error refuses a missing field, Stale resumes an unsent draft against a newer ledger, and Abstaining records a snapshot with no invented purchases.',
    render: ctx => imp(ctx, { tab: 4, title: 'Type it in', back: 'Imports', fresh: 'default', actions: eyeInfo('About typed entries'), body: top + manualBody(ctx), rail: stateCard('shield', 'Same path as a file', 'Your entry becomes a draft, then a preview, then an approval. It never reaches your ledger on its own. Claude takes no part, and no agent can type one for you.') })
  });

  /* ---------- a password-protected PDF, opened on this device. The owner pressed "Local unlock step" (MP40-Q2, 5 Nov 2026): you type
     the password in a step on your device, which opens the PDF there and sends the unlocked copy. Drawn on web, iPhone and iPad. ---------- */
  const lockChip = t => `<span class="chip" data-mo="chip">${ic('lock', 's14')}${t}</span>`;
  const unlockCard = (ctx, o = {}) => `<div class="card state" data-mo="card">${fileHead(o.chip || lockChip('Locked'), 'Password-protected PDF', o.none ? 'No file chosen on this device' : 'demat-oct-locked.pdf · on this device')}
    <p>${PDF_RULE}</p>
    <div class="holdings-form">${fld('Statement password', o.typed ? '••••••••••' : '', { wide: 1, type: 'password', off: o.off || o.none, bad: o.bad })}</div>
    <p>Only the unlocked copy is sent. It is checked at the door like any file and read into a draft. Nothing reaches your holdings until you approve it.</p>
    ${acts(o.go || btn('Open on this device', 'primary sm'), btn('Cancel', 'plain sm'))}</div>`;
  const unlockBody = ctx => region(ctx, {
    ok: () => unlockCard(ctx, { typed: true }),
    loading: () => banner('', 'Opening on this device.', 'Nothing has been sent yet. If this stops, nothing is sent and the password is not kept.', 'clock') + unlockCard(ctx, { typed: true, off: true, chip: `<span class="chip" data-mo="chip"><span class="spin" aria-hidden="true"></span>Opening</span>`, go: dis('Opening on this device', 'primary') }),
    empty: () => banner('', 'Choose the locked PDF.', 'It opens on the device that has it, so choose it from this one.', 'layers') + unlockCard(ctx, { none: true, go: btn('Choose a file', 'primary sm') }),
    error: () => banner('fall', 'That password did not open it.', 'Nothing was sent, and what you typed is cleared. Type it again.', 'alert') + unlockCard(ctx, { bad: 'This password did not open the PDF.', go: dis('Open on this device', 'primary') }),
    stale: () => banner('warn', 'You left this step at 21:09.', 'The password you typed was not kept, so type it again. Nothing was sent.', 'clock') + unlockCard(ctx, { go: dis('Open on this device', 'primary') }),
    offline: () => banner('', 'Offline.', 'Unlocking sends the copy straight away, and imports never run offline. Nothing is opened or kept until you reconnect.', 'wifi-off') + unlockCard(ctx, { off: true, go: dis('Open when online', 'primary') }),
    noModel: () => claudeOff('Unlocking needs no model. Once sent, a text PDF reads now and a scan waits in the queue.') + unlockCard(ctx, { typed: true })
  });
  const unlockScreen = (id, back, top = '', after = 'Preview') => ({
    id, title: 'Unlock a PDF',
    note: 'The owner pressed "Local unlock step" (MP40-Q2): you type the password in a step on your device, which opens the PDF there and sends only the unlocked copy. The password never leaves the device, and it is never stored, logged or sent to a model. Reached from a locked file. Error is a wrong password, Stale a step left open, and Offline waits, because imports never run offline.',
    na: { disagreement: `Unlocking opens one file on this device and compares it with nothing. A difference shows once the unlocked copy is read, on ${after}.`, abstention: 'No model reads anything in this step, so nothing can abstain. The password never reaches a model.' },
    /* on a phone the bar holds the back label beside the title, so the title is the one word */
    render: ctx => imp(ctx, { tab: 4, title: phone(ctx) ? 'Unlock' : 'Unlock a PDF', back, fresh: 'default', actions: tb('x', 'Cancel'), body: top + unlockBody(ctx), rail: phone(ctx) ? '' : stateCard('lock', 'Why on this device', 'The PDF opens where it is kept, so its password is typed and used only there. MyPrediction receives the unlocked copy, never the password.') })
  });

  /* ---------- guided edit and exclude: each makes a new revision and voids any earlier approval (MP-53) ---------- */
  const editCard = (ctx, o = {}) => `<div class="card state" data-mo="card">${fileHead(o.chip || ev('old', 'Check 1 field'), G.c.t, `${o.blank ? 'Date not read' : G.c.d} · 3 rows · Stocks ISA · AZN · XLON`)}${scan(o.blank)}
    <div class="holdings-form">${fld('Date', o.blank ? '' : '22 Oct 2026', { off: o.off, bad: o.blank ? 'Claude could not read this. Type it from your statement.' : '' })}${fld('Units', '10', { off: o.off })}${fld('Price', o.price || '107.60', { off: o.off })}${fld('Value', o.price ? '1,067.00' : '1,076.00', { off: o.off })}</div>
    ${acts(o.off || o.blank ? dis('Save as revision 5', 'primary') : btn('Save as revision 5', 'primary sm'), btn('Not now', 'plain sm'))}</div>`;
  const excludeCard = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('ban', 's18')}</span>Exclude this group</div><p>All 3 rows leave together, so no fee or cash is stranded. They stay listed as excluded, and nothing is dropped.</p>${acts(btn('Exclude group', 'tinted sm'))}</div>`;
  const editBody = ctx => region(ctx, {
    ok: () => editCard(ctx) + excludeCard(),
    loading: () => stateCard('refresh', 'Saving revision 5', 'Each edit makes a new revision with a new hash, and any earlier approval stops applying.') + skel(1),
    empty: () => stateCard('ban', 'Group excluded, at revision 5', 'Sold 10 AstraZeneca is out of this import. All 3 rows stay listed as excluded, and its units and cash stay as they are.', btn('Put it back', 'tinted sm'), ev('none', 'Excluded')),
    error: () => banner('fall', 'Refused: a group goes whole or not at all.', 'Excluding only the fee would leave this sale with the wrong cash. Nothing changed.', 'ban') + editCard(ctx) + excludeCard(),
    stale: () => stale214('Your ledger moved to revision 214. Refresh it before you edit. Any earlier approval no longer applies.') + editCard(ctx, { off: true }),
    offline: () => off(ctx, 'Your draft is safe on the server at revision 4. Editing waits until you reconnect.') + editCard(ctx, { off: true }),
    noModel: () => claudeOff('Editing and excluding never use it, so this works as usual.') + editCard(ctx) + excludeCard(),
    disagreement: () => banner('', 'Your figure differs from the scan.', 'You typed £106.70 and Claude read £107.60. Yours is used, and both stay on the row’s record.', 'split') + editCard(ctx, { price: '106.70', chip: ev('part', 'Edited by you') }),
    abstention: () => banner('', 'Claude left the date blank.', 'A blank is never filled in. Type it from your statement.', 'ban') + editCard(ctx, { blank: true, chip: ev('none', 'Date not read') })
  });
  const editRail = ctx => (phone(ctx) && ctx.state === 'empty' ? '' : change({ go: false, sub: ctx.state === 'empty' ? 'Sold 10 AstraZeneca left out' : 'If this group is selected', rows: ctx.state === 'empty' ? [['AstraZeneca', '85 units, unchanged']] : [['AstraZeneca', '85 → 75 units'], ['Cash, Stocks ISA', ctx.state === 'disagreement' ? '+£1,063.01' : '+£1,072.01']], note: `${ctx.state === 'empty' ? 'Its value, cost basis, gain and return stay as they are.' : 'Changes value, cost basis, gain and return on AstraZeneca.'} Any edit or exclusion makes a new revision and voids any earlier approval.` }));
  const editScreen = (id, back, top = '') => ({
    id, title: 'Edit or exclude a group',
    note: 'Where Edit, Add the date and Exclude group lead. Ready shows both controls. Empty shows the group once excluded, Error refuses part of a group, and Abstaining types in a blank field.',
    render: ctx => imp(ctx, { tab: 4, title: 'Edit group', back, fresh: 'default', actions: eyeInfo('About edits'), body: top + editBody(ctx), rail: editRail(ctx) })
  });

  /* ---------- a history rebuild behind a snapshot: its own proposal and approval (MP-68, POLICY-012) ---------- */
  const rebuildCard = (ctx, o = {}) => `<div class="card state" data-mo="card">${fileHead(o.chip || ev('ok', 'Rebuild proposal ready'), 'Nippon India Nifty 50 BeES', `India demat · proposal ${o.v || 1} · from 3 older statements`)}
    <div class="holdings-ba"><span>Opening baseline, 30 Sep 2026</span><b>${o.base || '4,200 units, retired'}</b><span>Purchases found</span><b>${o.units || '4,200 units, 9 events'}</b><span>Units after the cutover</span><b>${o.after || '4,200, not 8,400'}</b><span>Generation</span><b>${o.gen || '1 → 2'}</b></div></div>`;
  const rebuildFx = (o = {}) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('layers', 's18')}</span>What it changes</div>
    <div class="holdings-ba"><span>Reconciliation</span><b>${o.rec || 'Units and cash agree'}</b><span>Cost basis</span><b>${o.basis || 'Unavailable → £12,980.00'}</b><span>Gain</span><b>${o.gain || 'Unavailable → +£2,189.55'}</b><span>Return</span><b>${o.ret || 'Unavailable → +9.6% a year'}</b></div>
    <p>Forecasts you have seen and earlier measures keep their original inputs. Nothing later is written back into them.</p>${o.go === undefined ? btn('Review and approve', 'primary sm') : o.go}</div>`;
  const rebuildBody = ctx => region(ctx, {
    ok: () => rebuildCard(ctx) + rebuildFx(),
    loading: () => stateCard('refresh', 'Building the proposal', 'Matching 3 older statements to your snapshot. Your holdings stay exactly as they are.') + skel(2),
    empty: () => stateCard('layers', 'No rebuild to propose', 'A proposal appears when an older statement fills the history behind a snapshot.', btn('Back to Imports', 'tinted sm')),
    error: () => stateCard('alert', 'The proposal did not build', 'An older statement failed its checks, so no proposal was made. Your snapshot stays as it is.', btn('Try again', 'tinted sm', 'refresh')),
    stale: () => banner('warn', 'This proposal is out of date.', 'Your ledger moved to revision 214, so proposal 1 is superseded. Refresh it and approve it again.', 'clock') + acts(btn('Refresh proposal', 'primary sm', 'refresh')) + rebuildCard(ctx, { chip: ev('old', 'Superseded') }) + rebuildFx({ go: dis('Review and approve') }),
    offline: () => off(ctx, 'Showing this proposal from 22:15. Approval needs a connection.') + rebuildCard(ctx) + rebuildFx({ go: dis('Review and approve') }),
    disagreement: () => banner('', 'The statements fall 20 units short.', 'They reach 4,180 units and your snapshot says 4,200. The baseline cannot retire until you settle it.', 'split') + rebuildCard(ctx, { chip: ev('amb', 'Difference open'), base: '4,200 units, kept', units: '4,180 units, 8 events', after: '4,200, 20 unexplained', gen: 'Stays at 1' }) + rebuildFx({ rec: '20 units apart', basis: 'Unavailable until settled', gain: 'Unavailable until settled', ret: 'Unavailable until settled', go: dis('Review and approve') }),
    noModel: () => claudeOff('Code builds this proposal from your older statements, so it carries on.') + rebuildCard(ctx) + rebuildFx(),
    abstention: () => banner('', 'The history is only part there.', 'The statements reach back to June 2025 and cover 2,600 of the 4,200 units, so the return stays unavailable. How a part history rebases is still open, so this is one way to draw it, and it cannot be approved yet.', 'ban') + acts(proposed('FIN-OD-03')) + rebuildCard(ctx, { chip: ev('part', 'Part history'), base: '1,600 units kept', units: '2,600 units, 5 events', after: '4,200, 1,600 from the baseline', gen: 'Stays at 1' }) + rebuildFx({ rec: 'Units agree', basis: 'Partial, 2,600 of 4,200 units', gain: 'Partial, 2,600 of 4,200 units', ret: 'Stays unavailable', go: dis('Review and approve') })
  });
  const rebuildScreen = (id, top = '') => ({
    id, title: 'Rebuild history',
    note: 'Older statements fill the history behind a snapshot. The opening baseline retires at a cutover in a new generation, so 4,200 units stay 4,200 and never become 8,400. Approval is the same as any import.',
    render: ctx => imp(ctx, { tab: 4, title: 'Rebuild', back: 'Imports', fresh: 'default', actions: eyeInfo('About rebuilds'), body: top + rebuildBody(ctx), rail: phone(ctx) ? '' : stateCard('shield', 'Why a proposal', 'Code proposes, and only you approve. A proposal that expires or loses to a newer revision is refreshed and approved again.') })
  });

  /* ---------- an open difference: resolved only by you, with a reason (MP-65) ---------- */
  const diffCard = (ctx, o = {}) => `<div class="card state" data-mo="card">${fileHead(o.chip || ev('amb', 'Difference open'), 'General account, Q3', 'Committed 24 Oct · R-0212')}
    <div class="holdings-ba"><span>Cash on the statement</span><b>£1,522.10</b><span>Cash in the ledger</span><b>${o.ledger || '£1,530.25'}</b><span>Difference</span><b>${o.by || '£8.15'}</b><span>Kind</span><b>${o.kind || 'Cash'}</b></div>
    <p>No plug trade clears this, and nothing is overwritten. A change to the facts goes through a correction.</p></div>`;
  const resolveCard = (ctx, o = {}) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('check', 's18')}</span>Resolve it, with a reason</div><div class="holdings-form">${fld('Your reason', 'Broker confirmed a print error on the statement; the ledger figure stands.', { wide: 1, off: o.off })}${fld('Source', 'Broker message, 3 Oct', { wide: 1, off: o.off })}</div>${acts(o.off ? dis('Resolve', 'primary') : btn('Resolve', 'primary sm'), btn('Find the row', 'tinted sm'), btn('Keep it open', 'plain sm'))}</div>`;
  const diffBody = ctx => region(ctx, {
    ok: () => diffCard(ctx) + resolveCard(ctx),
    loading: () => stateCard('refresh', 'Reconciling again', 'New evidence arrived, so these figures are being checked. The difference stays open and visible meanwhile.') + diffCard(ctx),
    empty: () => stateCard('check', 'Nothing open', 'Your last difference was resolved by you on 24 Oct, with your reason: “Broker confirmed a print error on the statement; the ledger figure stands.” The reason stays on the receipt.', '', ev('ok', 'Resolved by you')),
    error: () => banner('fall', 'That did not save.', 'Your reason is kept, and the difference stays open. Trying again cannot save it twice.', 'alert') + diffCard(ctx) + resolveCard(ctx),
    stale: () => banner('warn', 'Reconciled again at 21:09.', 'A newer statement arrived and the difference stands. Your reason has not been saved yet.', 'clock') + diffCard(ctx) + resolveCard(ctx),
    offline: () => off(ctx, 'Showing this difference from 22:15. It stays open, and resolving it waits until you reconnect.') + diffCard(ctx) + resolveCard(ctx, { off: true }),
    noModel: () => claudeOff('Code reconciles, and only you resolve, so this works as usual. Claude cannot explain it for now.') + diffCard(ctx) + resolveCard(ctx),
    disagreement: () => banner('', 'Part of it is explained.', 'A fix to one row closed £5.05. The other £3.10 stays open.', 'split') + diffCard(ctx, { by: '£3.10 of £8.15', ledger: '£1,525.20' }) + resolveCard(ctx),
    abstention: () => banner('', 'Code could not place this.', 'It does not match cash, fees, FX or dates cleanly, so it stays unclassified and open.', 'ban') + diffCard(ctx, { kind: 'Not classified', chip: ev('part', 'Not classified') }) + resolveCard(ctx)
  });
  const diffScreen = (id, top = '') => ({
    id, title: 'An open difference',
    note: 'Both figures stay in view. Only you resolve a difference, and a resolution records your reason and its source. It clears nothing in the ledger. Empty shows one already resolved.',
    render: ctx => imp(ctx, { tab: 4, title: 'Difference', back: 'Imports', fresh: 'default', actions: eyeInfo('About differences'), body: top + diffBody(ctx), rail: phone(ctx) ? '' : stateCard('shield', 'Who can resolve it', 'Code reconciles and only you resolve. Claude can explain a difference, never clear it.') })
  });

  /* ---------- an approval once given: live until the commit starts or it expires, and revocable until then (MP-55) ---------- */
  const liveBody = ctx => region(ctx, {
    ok: () => stateCard('clock', 'Approved, not yet committed', 'The commit must start within 15 minutes. You can revoke this approval until it does.', '', ev('ok', 'Live until 21:33')) + stillApproved(),
    loading: () => stateCard('refresh', 'Revoking', 'Stopping this approval before a commit starts. A second tap does nothing more.') + skel(1),
    empty: () => stateCard('ban', 'Approval revoked', 'You revoked it at 21:19, before the commit started. Nothing was committed and your ledger stays at revision 213. The draft stays at revision 6, ready for a new approval.', btn('Back to Imports', 'tinted sm'), ev('none', 'Revoked')),
    error: () => stateCard('alert', 'Too late to revoke', 'The commit started at 21:22, so it finishes whole or not at all. To undo it, reverse the import.', btn('Back to Imports', 'tinted sm')),
    stale: () => stateCard('clock', 'This approval expired', 'It expired at 21:33 with no commit started, so nothing was committed. The rows have not changed, so a fresh approval is enough.', btn('Sign in and approve', 'primary sm')),
    offline: () => off(ctx, 'Revoking needs a connection. If no commit starts by 21:33, this approval expires by itself.') + stillApproved().replace(btn('Revoke approval', 'plain sm'), dis('Revoke approval', 'plain')),
    disagreement: () => stateCard('alert', 'Refused for a stale revision', 'Your ledger moved to revision 214, so this approval for 213 can never commit. Nothing was committed. Refresh the preview to approve it again.', btn('Refresh preview', 'primary sm', 'refresh')),
    abstention: () => stateCard('lock', 'Fresh sign-in needed', 'Your sign-in is too old for this step, and a Face ID unlock alone does not count. Nothing has changed.', btn('Sign in again', 'primary sm'), proposed('CT-01'))
  });
  const liveScreen = (id, top = '') => ({
    id, title: 'Approved, until the commit starts', na: naApprove,
    note: 'What an approval does next. Ready is live, Empty revoked, Stale expired, Disagreement refused for a stale revision and Abstaining a step-up. Revoking before the commit stops it from taking effect.',
    render: ctx => imp(ctx, { tab: 4, title: 'Approved', back: 'Imports', fresh: 'default', actions: eyeInfo('About approvals'), body: top + liveBody(ctx) })
  });

  /* ---------- hide amounts: money and units are masked, percentages stay, here and in Imports (the owner, "Mask units too", OWN-18).
     A unit count takes the same mask as money, with its word kept so you can tell which figure is hidden. A failed permission shows no figure at all (MP-84) ---------- */
  const AMT = /[+−]?£[\d,]+(?:\.\d+)?/g, MASK = '<span class="sr">Amount hidden</span><span aria-hidden="true">••••</span>';
  const UNITS = /\b\d[\d,]*(?: → [\d,]+)? units\b/g, dots = u => u.replace(/[\d,]+/g, '••••');
  const unitMask = u => `<span class="sr">Units hidden</span><span aria-hidden="true">${dots(u)}</span>`;
  const mask = s => s.replace(/<span class="pp?">\.\d+<\/span>/g, '').replace(/<span class="roll" data-roll="[^"]*£[^"]*">.*?<\/span><\/span>/g, MASK).replace(/<[^>]*>|[+−]?£[\d,]+(?:\.\d+)?|\b\d[\d,]*(?: → [\d,]+)? units\b/g, m => (m[0] === '<' ? m.replace(AMT, '••••').replace(UNITS, dots) : /^\d/.test(m) ? unitMask(m) : MASK));
  const privateScreen = (id, parts, back) => ({
    id, title: 'Amounts hidden',
    note: 'The owner picked "Mask units too" (OWN-18), which reads: Hide amounts masks money and units, and percentages stay. That holds on the holdings and on what an import would change. Its stated cost: you cannot check unit counts on an import while amounts are hidden, so they show when you show amounts. Error is permission denied: nothing is drawn from a read that was refused.',
    render: ctx => {
      const no = ctx.state === 'error', s = parts(ctx);
      const body = no ? stateCard('lock', 'Permission denied', 'This session cannot read your holdings, so no figure shows. Sign in again to carry on.', btn('Sign in again', 'primary sm')) : banner('', 'Amounts hidden.', 'Money and units are masked, and percentages stay, here and in Imports.', 'eye-off') + mask(s.body);
      const rail = no ? '' : mask(s.rail) + (ctx.state === 'empty' ? '' : mask(change({ go: false, trade: true, sub: 'Imports · 1 group selected · 3 rows of 11', more: 'Unit counts show when you show amounts.' })));
      return frame(ctx, { tab: 0, title: 'Amounts hidden', back, fresh: no ? 'default' : undefined, actions: tb('eye-off', 'Show amounts'), body, rail });
    }
  });

  /* ---------- Option B: every question has its own page, and the whole picture sits behind All rows ---------- */
  const askCard = (ico, q, s, inner) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic(ico, 's18')}</span><span style="flex:1;min-width:0">${q}<span class="holdings-sub">${s}</span></span></div>${inner}</div>`;
  const stepBody = (ctx, o) => STEPB(2) + region(ctx, {
    ok: () => o.card(),
    loading: () => stateCard('refresh', 'Saving your last answer', `It becomes revision ${o.rev}. The next step opens when it lands.`) + skel(1),
    empty: () => stateCard('check', 'Nothing to answer here', o.none),
    error: () => stateCard('alert', 'That answer did not save', `Your draft stays at revision ${o.rev - 1}, and nothing reached your ledger. Trying again cannot answer twice.`, btn('Try again', 'tinted sm', 'refresh')),
    stale: () => stale214('Your ledger moved to revision 214. Refresh to check the rows again. Nothing you answered is lost.') + o.card({ off: true }),
    offline: () => off(ctx, `Your draft is safe on the server at revision ${o.rev - 1}. Answering waits until you reconnect.`) + o.card({ off: true }),
    noModel: () => banner('', 'Claude is off.', `${CLAUDE_OFF} ${o.noClaude}`, 'cube') + o.card({ noClaude: true }),
    disagreement: () => banner('', o.split[0], o.split[1], 'split') + o.card({ noClaude: true, st: 'disagreement' }),
    abstention: () => banner('', o.blank[0], o.blank[1], 'ban') + o.card({ noClaude: true, st: 'abstention' })
  });
  const stepScreen = (id, title, top, note, o) => ({
    id, title, note,
    render: ctx => imp(ctx, { tab: 4, title: top, back: 'Check', fresh: 'default', actions: tools(eyeBtn(), tb('x', 'Cancel')), body: stepBody(ctx, o), rail: groupList({ at: o.rev - 4, off: ['stale', 'offline'].includes(ctx.state), unread: ctx.state === 'abstention' }) })
  });
  const q2 = stepScreen('b-check-2', 'Check: which listing', 'Check 2 of 3', 'Claude suggests a listing and only you confirm it. Only this group waits on the choice.', {
    rev: 6, none: 'This group’s listing is already chosen: HSBA · XLON.', noClaude: 'So no listing is suggested here, and you still choose.',
    split: ['The statement and Claude point apart.', 'The statement prints “HSBC HOLDINGS” and an ISIN for the ordinary share, and Claude read a US price. Only you decide.'],
    blank: ['Claude suggests nothing here.', 'Both listings fit equally, so neither is marked. Only you decide.'],
    card: (a = {}) => askCard('split', 'Which listing is this?', `${G.b.t} · question 2 of 3`, `<p>Two listings fit “HSBC HOLDINGS”.</p>${listingChoice({ off: a.off, noClaude: a.noClaude })}<span class="holdings-note">Chosen: HSBC 700 → 730 units. Changes value, cost basis, gain and return.</span>`)
  });
  const q3 = stepScreen('b-check-3', 'Check: where the money came from', 'Check 3 of 3', 'A transfer is not income until you say so. Leaving it pending keeps it out of this commit, in plain sight.', {
    rev: 7, none: 'This transfer is already answered: from your General account.', noClaude: 'This answer never used it.',
    split: ['The two accounts disagree.', 'Your General account shows no matching £500.00 going out on 28 Oct. Nothing is assumed.'],
    blank: ['The sender could not be read.', 'The statement says only “TRANSFER IN”. A blank is never filled in.'],
    card: (a = {}) => askCard('rebalance', 'Where did this £500.00 come from?', `${G.e.t} · 28 Oct · question 3 of 3`, `<p>It is not income until you say. It stays pending and visible.</p>${acts(a.off ? dis('From outside') : btn('From outside', 'tinted sm'), a.off ? dis('From General') : btn('From General', 'tinted sm'), a.off ? dis('Leave it pending', 'plain') : btn('Leave it pending', 'plain sm'))}`)
  });
  const dup = stepScreen('b-duplicate', 'Check: a possible duplicate', 'Duplicate', 'A duplicate is not a question of its own. It is left out and listed until you say otherwise.', {
    rev: 7, none: 'No row here matches one in your ledger.', noClaude: 'This match is made by code, so nothing changes here.',
    split: ['A near match, not an exact one.', 'The dates agree and the amounts are 4p apart. It stays left out until you decide.'],
    blank: ['Claude could not read the row’s account.', 'It matches on date and amount alone, so it stays left out until you decide.'],
    card: (a = {}) => askCard('ban', 'Already in your ledger?', `${G.d.t} · 20 Oct · 1 row`, `<div class="holdings-ba"><span>On this statement</span><b>+£41.16</b><span>Your typed entry, entered on 21 Oct, R-0211</span><b>${a.st === 'disagreement' ? '+£41.12' : '+£41.16'}</b></div><p>${{ disagreement: 'Same date and account, 4p apart', abstention: 'Same date and amount' }[a.st] || 'Same date, amount and account'}, so it is left out and still listed.</p>${acts(a.off ? dis('Leave it out', 'primary') : btn('Leave it out', 'primary sm'), a.off ? dis('Keep it anyway') : btn('Keep it anyway', 'tinted sm'))}`)
  });
  const ROWS = [
    [G.a, [['Trade', '£672.80'], ['Fee', '£3.99'], ['Cash', '−£676.79']], ev('ok', 'Ready')],
    [G.b, [['Trade', '£261.00'], ['Fee', '£3.99'], ['Cash', '−£264.99']], ev('amb', 'Question 2')],
    [G.d, [['Dividend', '+£41.16']], ev('none', 'Duplicate')],
    [G.c, [['Trade', '£1,076.00'], ['Fee', '£3.99'], ['Cash', '+£1,072.01']], ev('old', 'Question 1')],
    [G.e, [['Transfer in', '+£500.00']], ev('part', 'Question 3')]
  ];
  const rowsCard = (o = {}) => `<div class="card" style="padding:2px 0" data-mo="card">${ROWS.map(([g, r, c]) => `<div class="holdings-g" style="grid-template-columns:minmax(0,1fr)" data-mo="rise"><div class="t"><div style="min-width:0"><b>${g.t}</b><span class="w">${g === G.c && o.unread ? 'Date not read' : g.d} · ${g.m}</span></div>${g === G.c && o.unread ? ev('none', 'Date not read') : c}</div><div class="holdings-ba" style="margin-top:4px">${r.map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}</div></div>`).join('')}</div>`;
  const rowsTabs = (t = ['All 11', 'Ready 3', 'Need you 7', 'Left out 1']) => `<div data-mo="rise">${seg(t, 0, 'Show', 'full')}</div>`;

  /* ---------- the two ways in: holdings as a list, and holdings by account ---------- */
  const listParts = ctx => {
    const st = ctx.state, p = phone(ctx);
    const rows = () => (p ? `<div class="card" style="padding:2px 0;margin:0">${H.map(h => holdRow(h, ctx)).join('')}${listFoot(ctx)}</div>` : holdTable(ctx));
    const val = () => (p ? valueCard(ctx) : '');
    const body = region(ctx, {
      ok: () => val() + rows(),
      loading: () => (p ? valueCard(ctx, { meta: 'Last good 22:15 · refreshing' }) : '') + (p ? skel(4) : `<div class="holdings-wide">${skel(6)}</div>`),
      empty: () => stateCard('grid', 'No holdings yet', 'Holdings come from records you approve: a statement, a spreadsheet, a screenshot or a typed entry. MyPrediction never connects to a broker.', btn('Go to Imports', 'primary sm', 'chev-r')),
      error: () => sayError() + (p ? valueCard(ctx, { meta: LAST }) : '') + rows(),
      stale: () => banner('warn', 'HSBC is stale.', SAY_STALE, 'clock') + limit + (p ? partialCard(ctx) : '') + rows(),
      offline: () => off(ctx, SAY_OFF) + val() + rows(),
      noModel: () => banner('', 'No approved model.', SAY_NO_MODEL, 'cube') + val() + rows(),
      disagreement: () => saySplit() + val() + rows(),
      abstention: () => sayAbstain() + val() + rows()
    });
    const rail = st === 'empty' ? '' : (p ? '' : (st === 'stale' ? partialCard(ctx) : st === 'error' ? valueCard(ctx, { meta: LAST }) : st === 'loading' ? valueCard(ctx, { meta: 'Last good 22:15 · refreshing' }) : valueCard(ctx))) + coverage(ctx) + watchCard(ctx) + toImports(importNow(st));
    return { body, rail };
  };
  const acctParts = ctx => {
    const st = ctx.state, p = phone(ctx);
    const cards = () => ACC.map(a => accCard(a, ctx)).join('');
    const body = region(ctx, {
      ok: () => (p ? accSummary(ctx) : '') + cards(),
      loading: () => (p ? accSummary(ctx, { meta: 'Last good 22:15 · refreshing' }) : '') + skel(3) + skel(2),
      empty: () => stateCard('grid', 'No accounts yet', 'An account appears with its first statement or typed entry, once you approve it. MyPrediction never connects to a broker.', btn('Add a statement', 'primary sm')),
      error: () => sayError() + (p ? accSummary(ctx, { meta: LAST }) : '') + cards(),
      stale: () => banner('warn', 'HSBC is stale.', SAY_STALE, 'clock') + limit + (p ? accSummaryPartial(ctx) : '') + cards(),
      offline: () => off(ctx, SAY_OFF) + (p ? accSummary(ctx) : '') + cards(),
      noModel: () => banner('', 'No approved model.', SAY_NO_MODEL, 'cube') + (p ? accSummary(ctx) : '') + cards(),
      disagreement: () => saySplit() + (p ? accSummary(ctx) : '') + cards(),
      abstention: () => sayAbstain() + (p ? accSummary(ctx) : '') + cards()
    });
    const rail = st === 'empty' ? '' : (p ? '' : (st === 'stale' ? accSummaryPartial(ctx) : st === 'error' ? accSummary(ctx, { meta: LAST }) : st === 'loading' ? accSummary(ctx, { meta: 'Last good 22:15 · refreshing' }) : accSummary(ctx))) + coverage(ctx) + watchCard(ctx) + (st === 'loading' ? toImports('Imports · 1 difference open', 'General account, Q3 · cash differs by £8.15.') : toImports('Imports', 'Statements, drafts and open differences, for every account.'));
    return { body, rail };
  };
  const accountPick = () => `<div class="card top5" style="padding:4px 0" data-mo="card"><div class="holdings-head"><h3>Add a statement</h3></div>${ACC.map(a => `<button class="holdings-acc holdings-btn" type="button" data-mo="rise"><span class="logo sm" style="--c:var(${a.c})" aria-hidden="true">${ic('layers', 's16')}</span><span class="t"><b>${a.n}</b><span>${a.ev[1]}</span></span>${ic('chev-r', 's18')}</button>`).join('')}</div>`;

  J.add({
    id: 'holdings', title: 'Holdings and imports',
    stories: ['MP-84', 'MP-149', 'MP-46', 'MP-48', 'MP-49', 'MP-50', 'MP-53', 'MP-55', 'MP-60', 'MP-65', 'MP-68', 'MP-69', 'MP-72', 'MP-79', 'MP-45', 'MP-144', 'MP-169'],
    summary: 'What you own, then, as a separate place, how records arrive. Nothing reaches your ledger until you approve exactly what will change.',
    options: [{
      id: 'a', name: 'Review desk', rec: true,
      why: 'Every row, what it changes and what is blocked sit in one view, so you approve what you actually read. A long statement is no slower to judge than a short one, and the desktop holds it all at once.',
      cost: 'The preview is dense on iPhone, and you choose the order of your own checks.',
      screens: [{
        id: 'a-list', title: 'Holdings',
        note: 'A place for what you own: value, cost basis, return and how far the evidence goes, with the forecast range beside them. The total holds your cash, shown as one of its two parts. A candidate you do not hold stays apart from what you own.',
        render: ctx => frame(ctx, { tab: 0, title: 'Holdings', back: 'Portfolio', actions: eyeBtn(), webActions: `${btn('Imports', 'tinted sm', 'layers')}${eyeBtn()}`, ...listParts(ctx) })
      }, privateScreen('a-private', listParts, 'Holdings'), {
        id: 'a-one', title: 'One holding',
        note: 'Each measure carries its own status. Each state shows the holding that best proves it: Empty a snapshot, Stale HSBC, Disagreement Reliance, whose flows change direction, so one rate found is not proved the only one, Abstaining AstraZeneca, whose search used its budget before it could separate the possible rates. How far the search goes and what proves a single rate are open (Proposed · FIN-OD-04).',
        render: ctx => { const h = pick(ctx.state), s = holdingA(ctx); return frame(ctx, { tab: 0, title: ctx.kind === 'web' ? 'One holding' : h.t, back: 'Holdings', actions: eyeBtn(), ...s }); }
      }, {
        id: 'a-imports', title: 'Imports: drop a file, watch it read',
        note: 'Imports is its own place: in the iPad and desktop sidebar ("Add them to the sidebar", OWN-02), and under Settings on a phone. Error shows the three ways a file is refused. The upload limit (MP40-Q1) is an open owner question, so it is labelled proposed. A password-protected PDF opens on your device: the owner pressed "Local unlock step" (MP40-Q2), drawn on Unlock a PDF. Offline shows an interrupted upload; Stale shows reconnect.',
        render: ctx => imp(ctx, { tab: 4, title: 'Imports', back: 'Settings', fresh: 'default', actions: eyeInfo('About imports'), body: importsPlace(ctx, dropZone(ctx), 'Open preview'), rail: importsRail(ctx) })
      }, unlockScreen('a-unlock', 'Imports'), manualScreen('a-manual'), {
        id: 'a-preview', title: 'Preview: check every row',
        note: 'A scan read by Claude with no tools, one field flagged low confidence, a duplicate found, and one ambiguous listing. Unresolved groups stay visible and unselected. Each edit makes a new revision and voids any earlier approval. Disagreement shows a reconciliation mismatch.',
        render: ctx => {
          const st = ctx.state, p = phone(ctx);
          const body = region(ctx, {
            ok: () => draftHead(ctx) + groupsCard(ctx),
            loading: () => draftHead(ctx, { claude: 'Claude is reading page 3 of 4' }).replace('class="cl-chip"', 'class="cl-chip is-working"') + skel(3),
            empty: () => draftHead(ctx, { claude: 'Read by Claude, no tools' }) + stateCard('check', 'Nothing to commit', 'All 11 rows are already in your ledger, so this draft changes nothing. Cancel it; the original stays.', btn('Cancel draft', 'tinted sm')),
            error: () => scanFailed(),
            stale: () => stale214('Your ledger moved to revision 214 when another import was committed. Refresh it to check the rows again. Any earlier approval no longer applies.') + draftHead(ctx) + groupsCard(ctx, { off: true }),
            offline: () => off(ctx, 'Your draft is safe on the server at revision 4. Selecting and editing wait until you reconnect.') + draftHead(ctx) + groupsCard(ctx, { off: true }),
            noModel: () => scansOff(),
            disagreement: () => mismatch() + draftHead(ctx) + groupsCard(ctx),
            abstention: () => banner('', 'Claude left 1 field blank.', 'A date on page 2 could not be read. A blank is never filled in, and that one group waits for you.', 'ban') + draftHead(ctx, { claude: 'Read by Claude, no tools, 1 field blank' }) + groupsCard(ctx, { unread: true })
          }) + (p ? '<div class="holdings-pad"></div>' : '');
          const blocked = ['error', 'noModel', 'empty', 'loading'].includes(st);
          const wait = ['stale', 'offline'].includes(st);
          const rail = blocked ? (p ? '' : change({ go: false, sub: 'Nothing selected', rows: [], note: 'Your holdings stay exactly as they are.' })) : (p ? '' : change(wait ? { go: false } : {})) + `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('shield', 's18')}</span>Claude only proposes</div><p>It read this scan with no tools and cannot select, edit or approve. Instructions inside a document have no effect.</p></div>`;
          return imp(ctx, { tab: 4, title: 'Preview', back: 'Imports', fresh: 'default', actions: eyeInfo('About this preview'), body, rail, accessory: p && !blocked && !wait ? pending() : '' });
        }
      }, editScreen('a-edit', 'Preview'), {
        id: 'a-approve', title: 'Approve exactly this', na: naApprove,
        note: 'Bound to the rows, the hash and the ledger revision you saw. By now the price is confirmed and the listing chosen, so three groups are selected. Face ID alone does not count: the server checks a fresh sign-in.',
        render: ctx => frame(ctx, { side: wideKind(ctx) ? 'imports' : undefined, tab: 4, title: 'Preview', back: 'Imports', fresh: 'default', actions: eyeBtn(), body: ctx.state === 'empty' ? draftHead(ctx) + groupsCard(ctx, { none: true }) : draftHead(ctx, { rev: ctx.state === 'abstention' ? 5 : 6, claude: 'Read by Claude, no tools, your checks done' }) + groupsCard(ctx, { resolved: true, unread: ctx.state === 'abstention' }), sheet: approveSheet(ctx) })
      }, liveScreen('a-live'), {
        id: 'a-done', title: 'Committed, and how to correct it', na: { noModel: 'A commit reads your approval and your rows. It uses no model, so a missing model cannot touch this screen.' },
        note: 'All of it or none of it: nobody sees a part. A correction keeps the original and links its inverse. Offline shows a lost response, resolved by reading the receipt, never by a second commit.',
        render: ctx => {
          const body = region(ctx, {
            ok: () => receipt(ctx),
            loading: () => `<div class="card state" data-mo="card">${fileHead(`<span class="chip"><span class="spin" aria-hidden="true"></span>Committing</span>`)}<p>Your holdings stay at revision 213 until all 9 rows are ready. Nobody sees a part of it.</p>${steps(2).replace('Received', 'Staged').replace('Checked', 'Sealed').replace('Reading', 'Publishing').replace('Ready', 'Done')}</div>`,
            empty: () => cancelled(),
            error: () => commitFailed(),
            stale: () => staleChange() + receipt(ctx),
            offline: () => off(ctx, 'The outcome is unknown for now. MyPrediction reads the receipt and the ledger and shows the truth when you reconnect. It never sends a second commit.', 'Connection lost during the commit.') + `<div class="card state" data-mo="card">${fileHead(ev('old', 'Outcome unknown'))}<p>Last known step: publishing, 21:22. Your holdings show the last confirmed revision, 213.</p></div>`,
            disagreement: () => receipt(ctx) + mismatch({ done: true }),
            abstention: () => receipt(ctx, DATE_ADDED) + noRateNow()
          });
          const dead = ['loading', 'empty', 'error', 'offline'].includes(ctx.state), hold = ['loading', 'offline'].includes(ctx.state);
          return imp(ctx, { tab: 4, title: dead ? 'Commit' : 'Committed', back: 'Imports', fresh: 'default', actions: eyeInfo('About this receipt'), body, rail: dead ? original(hold) : `${correction({ stale: ctx.state === 'stale', refused: ctx.state === 'disagreement' })}${original()}` });
        }
      }, diffScreen('a-difference'), rebuildScreen('a-rebuild')]
    }, {
      id: 'b', name: 'One question at a time',
      why: 'Holdings open by account, because statements arrive by account. An import then asks one thing at a time, under your thumb, and its groups tick off as you answer.',
      cost: 'One more tap to reach a holding, and an instrument held in two accounts shows twice. A statement with many issues means many taps, and the whole picture sits behind All rows.',
      screens: [{
        id: 'b-accounts', title: 'Holdings by account',
        note: 'Each account shows what it holds, its cash and how far its statements reach, and any account can take a statement. Apple shows twice because it sits in two accounts. Imports stays one tap away for everything that is not tied to one account.',
        render: ctx => frame(ctx, { tab: 0, title: 'Accounts', back: 'Portfolio', actions: eyeBtn(), webActions: `${ctx.kind === 'pwa' ? tb('plus', 'Add statement') : btn('Add statement', 'tinted sm', 'plus')}${eyeBtn()}`, ...acctParts(ctx) })
      }, privateScreen('b-private', acctParts, 'Accounts'), {
        id: 'b-one', title: 'One holding, by account',
        note: 'Switch account, or read all of them together. What built this position lists each event with its evidence; a deleted original keeps its ledger event, marked unavailable.',
        render: ctx => { const h = pick(ctx.state); return frame(ctx, { tab: 0, title: ctx.kind === 'web' ? 'One holding' : h.t, back: 'Accounts', actions: eyeBtn(), ...holdingB(ctx) }); }
      }, {
        id: 'b-imports', title: 'Imports',
        note: 'Imports is its own place in this option too, in the iPad and desktop sidebar and under Settings on a phone (OWN-02): history, open drafts, open differences and records, for every account.',
        render: ctx => imp(ctx, { tab: 4, title: 'Imports', back: 'Settings', fresh: 'default', actions: eyeInfo('About imports'), body: importsPlace(ctx, ctx.state === 'empty' ? methods(ctx) : accountPick(), 'Start checking'), rail: importsRail(ctx) })
      }, {
        id: 'b-add', title: 'Add a statement, read it',
        note: 'One job on screen. The owner picks how the records arrive, then watches them read. The same refusals as A apply. The upload limit (MP40-Q1) is open, so it is labelled proposed, and a password-protected PDF opens on your device ("Local unlock step", MP40-Q2), on Unlock a PDF.',
        render: ctx => {
          const st = ctx.state, top = STEPB(st === 'default' || st === 'stale' || st === 'noModel' || st === 'abstention' ? 1 : 0);
          const body = top + region(ctx, {
            ok: () => expectCard() + running(ctx),
            loading: () => expectCard() + uploading(),
            empty: () => expectCard() + methods(ctx),
            error: () => failures() + methods(ctx),
            stale: () => expectCard() + reconnecting(),
            offline: () => off(ctx, 'Statements need a connection.') + interrupted(),
            noModel: () => expectCard() + scansOff() + methods(ctx, { scanNote: 'Paused while Claude is off' }),
            disagreement: () => expectCard() + `<div class="card state" data-mo="card">${fileHead(ev('amb', 'Gap found'))}<p>This statement starts on 4 Oct, and your last one ends on 30 Sep. 3 days are missing. Carry on, and the gap stays visible, or add the missing statement first.</p>${acts(btn('Carry on', 'tinted sm'), btn('Add the missing one', 'plain sm'))}</div>`,
            abstention: () => expectCard() + readyCard(ctx, 'Start checking')
          });
          const rail = phone(ctx) ? (['default', 'stale', 'abstention', 'disagreement', 'loading'].includes(st) ? methods(ctx) : '') : methods(ctx) + records(false, st === 'offline');
          return imp(ctx, { tab: 4, title: 'Add statement', back: 'Imports', fresh: 'default', actions: tb('x', 'Cancel'), body, rail });
        }
      }, unlockScreen('b-unlock', 'Add statement', STEPB(0), 'Check'), manualScreen('b-manual', STEPB(0)), {
        id: 'b-check', title: 'Check: one question at a time',
        note: 'A scan read by Claude with no tools. A low-confidence field, an unclear listing and a transfer each become one question, and answering makes a new revision. A duplicate is not a question: it is left out and listed until you say otherwise. Unanswered groups stay visible and unselected.',
        render: ctx => {
          const st = ctx.state, p = phone(ctx), wait = ['stale', 'offline'].includes(st);
          const answer = `<div class="holdings-bar"><button class="btn sm btn-tinted" type="button"${wait ? ' disabled' : ''}>No, edit it</button><button class="btn sm btn-primary" type="button" style="flex:1"${wait ? ' disabled' : ''}>Yes, £107.60</button></div>`;
          const body = STEPB(2) + region(ctx, {
            ok: () => qCard(ctx),
            loading: () => stateCard('search', 'Preparing your questions', 'Claude is reading page 3 of 4. Rows appear when they pass their checks, and until then they are nowhere in your holdings.') + skel(2),
            empty: () => stateCard('check', 'No questions, and nothing to commit', 'All 11 rows are already in your ledger. Cancel this draft; the original stays.', btn('Cancel draft', 'tinted sm')),
            error: () => scanFailed(),
            stale: () => stale214('Your ledger moved to revision 214. Refresh to check the rows again. Nothing you answered is lost.') + qCard(ctx),
            offline: () => off(ctx, 'Your draft is safe on the server at revision 4. Answering waits until you reconnect.') + qCard(ctx),
            noModel: () => scansOff(),
            disagreement: () => mismatch(),
            abstention: () => qCard(ctx, 'abstention')
          });
          const dead = ['loading', 'empty', 'error', 'noModel'].includes(st);
          const rail = dead ? (p ? '' : change({ go: false, sub: 'Nothing selected', rows: [], note: 'Your holdings stay exactly as they are.' })) : groupList({ off: wait, unread: st === 'abstention' }) + change(wait ? { go: false } : {}) + (p ? '<div class="holdings-pad"></div>' : '');
          return imp(ctx, { tab: 4, title: dead ? 'Check' : 'Check 1 of 3', back: 'Imports', fresh: 'default', actions: tools(eyeBtn(), tb('x', 'Cancel')), body, rail, accessory: p && !dead && !['disagreement', 'abstention'].includes(st) ? answer : '' });
        }
      }, q2, q3, dup, {
        id: 'b-rows', title: 'All 11 rows',
        note: 'The whole statement in one list, for anyone who wants it: every ready, blocked and left-out row, with its account and listing.',
        render: ctx => {
          const body = region(ctx, {
            ok: () => rowsTabs() + rowsCard(),
            loading: () => stateCard('search', 'Preparing the rows', 'Rows appear when they pass their checks, and until then they are nowhere in your holdings.') + skel(4),
            empty: () => stateCard('check', 'Every row is already in your ledger', 'All 11 rows match it, so this draft changes nothing. Cancel it; the original stays.', btn('Cancel draft', 'tinted sm')),
            error: () => scanFailed(),
            stale: () => stale214('Your ledger moved to revision 214. Refresh to check the rows again. Nothing you answered is lost.') + rowsCard(),
            offline: () => off(ctx, 'Your draft is safe on the server at revision 4. Answering waits until you reconnect.') + rowsCard(),
            noModel: () => scansOff(),
            disagreement: () => mismatch() + rowsTabs() + rowsCard(),
            abstention: () => banner('', 'Claude left 1 field blank.', 'A date on page 2 could not be read. A blank is never filled in, and that one group waits for you.', 'ban') + rowsTabs() + rowsCard({ unread: true })
          });
          return imp(ctx, { tab: 4, title: 'All 11 rows', back: 'Check', fresh: 'default', actions: eyeBtn(), body });
        }
      }, editScreen('b-edit', 'Check', STEPB(2)), {
        id: 'b-approve', title: 'Approve exactly this', na: naApprove,
        note: 'Questions 1 and 2 are answered and the transfer is left pending, so three groups are selected. The sheet is the same in both options, because what you approve is the same: these rows, this hash, this ledger revision, within 15 minutes of a fresh sign-in.',
        render: ctx => frame(ctx, { side: wideKind(ctx) ? 'imports' : undefined, tab: 4, title: 'Approve', back: 'Imports', fresh: 'default', actions: eyeBtn(), body: STEPB(3) + (ctx.state === 'empty' ? groupList({ none: true }) : groupList({ resolved: true, unread: ctx.state === 'abstention' })), sheet: approveSheet(ctx) })
      }, liveScreen('b-live', STEPB(3)), {
        id: 'b-done', title: 'Committed, and how to reverse it', na: { noModel: 'A commit reads your approval and your rows. It uses no model, so a missing model cannot touch this screen.' },
        note: 'Option A leads with correcting a row; this one leads with reversing the import. Both are always available. Disagreement also shows a reversal refused because a later event depends on these rows.',
        render: ctx => {
          const body = region(ctx, {
            ok: () => receipt(ctx),
            loading: () => `<div class="card state" data-mo="card">${fileHead(`<span class="chip"><span class="spin" aria-hidden="true"></span>Committing</span>`)}<p>Your account stays at revision 213 until all 9 rows are ready. Nobody sees a part of it.</p></div>`,
            empty: () => cancelled(),
            error: () => commitFailed(),
            stale: () => staleChange() + receipt(ctx),
            offline: () => off(ctx, 'The outcome is unknown for now. MyPrediction reads the receipt when you reconnect, and never sends a second commit.', 'Connection lost during the commit.') + `<div class="card state" data-mo="card">${fileHead(ev('old', 'Outcome unknown'))}<p>Last known step: publishing, 21:22. Your account shows the last confirmed revision, 213.</p></div>`,
            disagreement: () => receipt(ctx) + mismatch({ done: true }),
            abstention: () => receipt(ctx, DATE_ADDED) + noRateNow()
          });
          const dead = ['loading', 'empty', 'error', 'offline'].includes(ctx.state), hold = ['loading', 'offline'].includes(ctx.state);
          return imp(ctx, { tab: 4, title: dead ? 'Commit' : 'Committed', back: 'Imports', fresh: 'default', actions: eyeInfo('About this receipt'), body, rail: dead ? original(hold) : `${reversal({ refused: ctx.state === 'disagreement', stale: ctx.state === 'stale' })}${original()}` });
        }
      }, diffScreen('b-difference', STEPB(2)), rebuildScreen('b-rebuild', STEPB(2))]
    }]
  });
}
