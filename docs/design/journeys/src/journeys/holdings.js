/* Holdings: what you own, then, as a separate place, how records arrive (MP-62). Both options follow one illustrative
   scanned statement from drop to commit. A block, so these helpers cannot collide with another journey's in the shared script. */
{
  const phone = ctx => ctx.kind === 'iphone' || ctx.kind === 'pwa';
  const acts = (...b) => `<div class="holdings-acts">${b.filter(Boolean).join('')}</div>`;
  const proposed = `<span class="chip proposed" data-mo="chip"><span class="dot"></span>Proposed</span>`;
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
  const eyeBtn = ctx => phone(ctx) ? '' : `<button class="tbtn glass" type="button" aria-label="Hide amounts">${ic('eye-off', 's18')}</button>`;

  /* ---------- the ledger behind the shared figures. Illustrative; values add up to the shared £84,612.40 ---------- */
  const L = {
    AAPL: { at: '2 accounts', units: '88 units', gain: '+£3,288.10', ret: '+14.2% a year', ev: ['ok', 'Part analytical'], s: ['ok', 'Available'] },
    NVDA: { at: 'General account', units: '60 units', gain: '+£4,902.10', ret: '+31.6% a year', ev: ['ok', 'Available'], s: ['ok', 'Available'] },
    SPY: { at: 'General account', units: '40 units', gain: '+£3,160.00', ret: '+9.8% a year', ev: ['ok', 'Available'], s: ['ok', 'Available'] },
    AZN: { at: 'Stocks ISA', units: '85 units', gain: '+£1,015.75', ret: '+6.4% a year', ev: ['ok', 'Available'], s: ['ok', 'Available'] },
    HSBA: { at: 'Stocks ISA', units: '700 units', gain: '+£804.20', ret: '+8.1% a year', ev: ['old', 'Price 16:35'], s: ['old', 'Stale'] },
    RELIANCE: { at: 'India demat', units: '120 units', gain: '+£1,240.30', ret: 'No single rate', ev: ['amb', 'Two rates fit'], s: ['amb', 'Ambiguous'] },
    NIFTYBEES: { at: 'India demat', units: '4,200 units', gain: 'Unavailable', ret: 'Unavailable', ev: ['none', 'Snapshot only'], s: ['none', 'Unavailable'] }
  };
  /* the measures of one holding: name, figure, status, why. Each has its own status, set before any wording (MP-69) */
  const measures = h => ({
    AAPL: [
      ['Value', '£14,820.50', ev('ok', 'Available'), 'Priced 21:00, Twelve Data. FX 21:00.'],
      ['Cost basis', '£11,532.40', ev('ok', 'Available'), 'Broker figure for the ISA; analytical FIFO for the General account, not tax basis.'],
      ['Gain', '+£3,288.10 (+28.5%)', ev('ok', 'Available'), 'Value less the cost basis above.'],
      ['Money-weighted return', '+14.2% a year', ev('ok', 'Available'), 'Local +11.9, FX +1.9, interaction +0.4 points. FX estimated from dated reference rates.']
    ],
    NIFTYBEES: [
      ['Value', '£15,169.55', ev('ok', 'Available'), 'From a snapshot of 4,200 units. Priced 21:00, Yahoo.'],
      ['Cost basis', 'Unavailable', ev('none', 'Unavailable'), 'No purchase history. Nothing is invented to fill it.'],
      ['Gain', 'Unavailable', ev('none', 'Unavailable'), 'Needs a cost basis.'],
      ['Money-weighted return', 'Unavailable', ev('none', 'Unavailable'), 'Needs dated cash flows. Never shown as zero.']
    ],
    HSBA: [
      ['Value', '£6,104.20', ev('old', 'Stale'), 'Last price 16:35, Yahoo. Left out of the total until a price returns.'],
      ['Cost basis', '£5,300.00', ev('ok', 'Available'), 'Broker figure, statement of 30 Sep.'],
      ['Gain', '+£804.20 (+15.2%)', ev('old', 'Stale'), 'Uses the 16:35 price.'],
      ['Money-weighted return', '+8.1% a year', ev('old', 'Stale'), 'Uses the 16:35 price as its closing value.']
    ],
    RELIANCE: [
      ['Value', '£8,940.30', ev('ok', 'Available'), 'Priced 21:00, Yahoo. FX 21:00.'],
      ['Cost basis', '£7,700.00', ev('ok', 'Available'), 'Broker figure in INR, dated FX labelled estimated.'],
      ['Gain', '+£1,240.30 (+16.1%)', ev('ok', 'Available'), 'Value less the cost basis above.'],
      ['Money-weighted return', 'No single rate', ev('amb', 'Ambiguous'), 'Two rates fit these cash flows, 10% and 20% a year. Neither is picked.']
    ],
    AZN: [
      ['Value', '£9,215.75', ev('ok', 'Available'), 'Priced 21:00, Twelve Data.'],
      ['Cost basis', '£8,200.00', ev('ok', 'Available'), 'Broker figure, statement of 30 Sep.'],
      ['Gain', '+£1,015.75 (+12.4%)', ev('ok', 'Available'), 'Value less the cost basis above.'],
      ['Money-weighted return', 'No rate found', ev('amb', 'Nonconvergent'), 'The search stopped at its limit with no rate. Same inputs give the same result. Diagnostics kept.']
    ]
  }[h.t]);
  const accountsOf = h => ({
    AAPL: [['Stocks ISA', '60 units', '£10,104.90', 'Basis £7,920.00, broker', '+13.1% a year'], ['General account', '28 units', '£4,715.60', 'Basis £3,612.40, analytical, not tax basis', '+16.6% a year']],
    NIFTYBEES: [['India demat', '4,200 units', '£15,169.55', 'No basis: snapshot of 30 Sep', 'Unavailable']],
    HSBA: [['Stocks ISA', '700 units', '£6,104.20', 'Basis £5,300.00, broker', '+8.1% a year']],
    RELIANCE: [['India demat', '120 units', '£8,940.30', 'Basis £7,700.00, broker', 'No single rate']],
    AZN: [['Stocks ISA', '85 units', '£9,215.75', 'Basis £8,200.00, broker', 'No rate found']]
  }[h.t]);
  /* which holding best shows each state of the one-holding screen */
  const pick = st => ({ empty: byT.NIFTYBEES, stale: byT.HSBA, disagreement: byT.RELIANCE, abstention: byT.AZN }[st] || byT.AAPL);
  const dual = () => `<div class="holdings-split" role="img" aria-label="At 3 months the baseline shows a median of minus 1.5% and R2-HGB v3 plus 2.8%, so no action is ranked"><span>Baseline</span>${range({ ...byT.RELIANCE, med: -1.5, lo: -14, hi: 11, lo50: -7.5, hi50: 4 })}<span>R2-HGB v3</span>${range({ ...byT.RELIANCE, med: 2.8, lo: -6.5, hi: 12.4, lo50: -1.1, hi50: 6.7 })}</div>`;

  /* ---------- holdings: list rows and the desktop table ---------- */
  const fcLine = (h, ctx) => {
    const st = ctx.state;
    if (st === 'noModel') return `<span class="small muted">No forecast · no approved model</span>`;
    if (st === 'abstention' && h.t === 'AZN') return `<span class="chip">${ic('ban', 's14')}Abstained · no range shown</span>`;
    if (st === 'disagreement' && h.t === 'RELIANCE') return dual();
    if (h.stale) return `<span class="chip stale">${ic('clock', 's14')}Forecast held · action paused</span>`;
    return `<div class="rangewrap">${range(h)}</div><span class="fcv">${pct(h.med)} · 6M</span>${badge(h.act)}`;
  };
  const holdRow = (h, ctx) => {
    const l = L[h.t], [a, b] = h.val.split('.');
    return `<div class="hrow holdings-row${h.stale ? ' is-stale' : ''}" data-mo="rise">
      ${logo(h.c, h.lg)}
      <div style="min-width:0"><div class="nm">${h.n}</div><div class="tk">${h.t} · ${l.at}</div></div>
      <div class="vv"><div class="val">£${a}<span class="pp">.${b}</span></div>${h.stale ? `<span class="chg" style="color:var(--warn);font-size:12px;line-height:16px">${ic('clock', 's14')}16:35</span>` : chg(h.day)}</div>
      <div class="fl">${fcLine(h, ctx)}</div>
      <div class="fl holdings-ret"><span>Return <b>${l.ret}</b></span>${ev(...l.ev)}</div>
    </div>`;
  };
  const fcCell = (h, ctx) => {
    const st = ctx.state;
    if (st === 'noModel') return `<span class="muted">No forecast</span>`;
    if (st === 'abstention' && h.t === 'AZN') return `<span class="chip">${ic('ban', 's14')}Abstained</span>`;
    if (st === 'disagreement' && h.t === 'RELIANCE') return `<span class="chip">${ic('split', 's14')}Differ</span>`;
    if (h.stale) return `<span class="chip stale">${ic('clock', 's14')}Held</span>`;
    return `<div style="display:flex;align-items:center;gap:6px"><span style="width:38px;color:var(--fc-ink);font-weight:600;text-align:right">${pct(h.med)}</span><span style="width:56px;display:block">${range(h, 56, 14)}</span></div><div class="small muted" style="font-size:12px;line-height:16px;white-space:nowrap">${pct(h.lo)} to ${pct(h.hi)}</div>`;
  };
  const listFoot = `<div class="t5foot">Forecast ranges are 80%. Actions are decision support, with their reasons on each holding. MyPrediction never places a trade. Illustrative.</div>`;
  const holdTable = (ctx, title = 'Holdings') => {
    const gain = ctx.kind === 'web', na = `<span class="muted" aria-label="Unavailable">–</span>`;
    return `<div class="card holdings-wide" data-mo="card"><div class="holdings-head" style="padding-bottom:2px"><h3>${title}</h3><span class="small muted">One forecast scale, −20% to +36%</span></div>
    <table class="ht dk"><thead><tr><th>Holding</th><th class="r">Value</th>${gain ? '<th class="r">Gain</th>' : ''}<th class="r">Return</th><th>6-month forecast</th><th>Evidence</th></tr></thead><tbody>${H.map(h => {
      const l = L[h.t];
      return `<tr data-mo="rise"><td><div class="inst">${logo(h.c, h.lg, true)}<div style="min-width:0"><b style="max-width:96px">${h.n}</b><span>${h.t}</span></div></div></td><td class="r" style="font-weight:600">£${h.val.split('.')[0]}</td>${gain ? `<td class="r">${l.gain === 'Unavailable' ? na : l.gain.split('.')[0]}</td>` : ''}<td class="r">${l.ret.startsWith('+') ? l.ret.replace(' a year', '') : l.ret === 'Unavailable' ? na : '<span class="muted">Two rates</span>'}</td><td>${fcCell(h, ctx)}</td><td>${ev(...l.s)}</td></tr>`;
    }).join('')}</tbody></table>${listFoot}</div>`;
  };
  const statsTwo = (ctx, partial) => `<div class="holdings-two"><div><span>Gain on ${partial ? '5' : '6'} of 7</span><b>${partial ? '+£13,606.25' : '+£14,410.45'}</b></div><div><span>Return, partial</span><b>+11.8% a year</b></div></div>`;
  const valueCard = (ctx, o = {}) => `<div class="card valcard" data-mo="card">
    <div class="top"><span class="label">${o.label || 'Holdings value'}</span>${o.chip || illus()}</div>
    ${money(o.val || '84,612.40', phone(ctx) ? 40 : 36)}
    ${o.sub || `<div class="d">${chg(1, '+£1,236.18 (1.48%)')}<span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">today</span></div>`}
    <div class="meta">${o.meta || 'As of 21:15 London · data cutoff 21:00'}</div>
    ${statsTwo(ctx, o.partial)}
    <div class="small muted" style="margin-top:8px">Cash of £5,542.85 is shown apart from this value.</div>
  </div>`;
  const partialCard = ctx => valueCard(ctx, { label: 'Known value, 6 of 7 priced', val: '78,508.20', partial: true, chip: ev('part', 'Partial'), sub: `<div class="d" style="font-size:13px;line-height:18px;letter-spacing:0"><span class="muted">HSBC, £6,104.20 at 16:35, is left out until it has a fresh price.</span></div>` });
  const coverage = ctx => `<div class="card" style="padding:14px 16px" data-mo="card"><div class="label">What your evidence supports</div>
    ${(ctx.state === 'stale' ? [['Value', 6], ['Cost basis', 6], ['Gain', 5], ['Return', 4]] : [['Value', 7], ['Cost basis', 6], ['Gain', 6], ['Return', 5]]).map(([k, n]) => `<div class="holdings-cov"><span>${k}</span><i role="img" aria-label="${k}: ${n} of 7 holdings"><u data-mo="barx" style="--v:${Math.round(n / 7 * 100)}%"></u></i><b>${n} of 7</b></div>`).join('')}
    <p class="small muted" style="margin-top:10px">${ctx.state === 'stale' ? 'HSBC has no fresh price, so it leaves the value, gain and return. ' : ''}Nippon Nifty BeES is a snapshot with no history. Two rates fit Reliance, so neither is picked. Older statements fill the gaps.</p></div>`;
  const toImports = (ctx, n = '1 import is ready for you', t = 'Imports is where records arrive. Nothing here changes until you approve it.') => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('layers', 's18')}</span><span style="flex:1;min-width:0">${n}</span>${ic('chev-r', 's18')}</div><p>${t}</p></div>`;

  /* ---------- the import this journey follows: one scanned ISA statement, 11 rows in 5 groups ---------- */
  const G = {
    a: { t: 'Bought 4 Apple', d: '6 Oct', n: 3, l: 'Trade £672.80 · Fee £3.99 · Cash −£676.79', fx: 'Apple 60 → 64 units. Changes value, cost basis, gain and return.' },
    c: { t: 'Sold 10 AstraZeneca', d: '22 Oct', n: 3, l: 'Trade £1,076.00 · Fee £3.99 · Cash +£1,072.01', fx: 'AstraZeneca 85 → 75 units. Changes value, cost basis, gain and return.' },
    b: { t: 'Bought 30 HSBC', d: '13 Oct', n: 3, l: 'Trade £261.00 · Fee £3.99 · Cash −£264.99', fx: 'HSBC 700 → 730 units once the listing is chosen.' },
    d: { t: 'AstraZeneca dividend', d: '20 Oct', n: 1, l: 'Cash +£41.16' },
    e: { t: 'Transfer in', d: '28 Oct', n: 1, l: 'Cash +£500.00' }
  };
  const tick = (t, on, dis) => `<button class="holdings-tick" type="button" role="checkbox" aria-checked="${!!on}" aria-label="Select ${t}"${dis ? ' disabled' : ''}>${on ? ic('check', 's16') : ''}</button>`;
  const gRow = (g, o = {}) => `<div class="holdings-g" data-mo="rise">${tick(g.t, o.on, o.dis)}<div class="t"><div style="min-width:0"><b>${g.t}</b><span class="w">${o.d || g.d} · ${g.n} row${g.n > 1 ? 's' : ''}</span></div>${o.chip || ''}</div><div class="x"><span>${g.l}</span>${g.fx && !o.nofx ? `<span class="fx">${g.fx}</span>` : ''}${o.x || ''}</div></div>`;
  const scan = (blank) => `<div class="holdings-scan" role="img" aria-label="Page 2 of the scanned statement. The row for AstraZeneca reads 10 at 107.60, value 1,076.00. ${blank ? 'Its date could not be read.' : 'The price 107.60 is flagged as low confidence.'}"><div class="hd"><span>Your scan, page 2, row 6</span><span>GBP</span></div>
    <div class="ln dim"><span>20/10</span><span>ASTRAZENECA DIV</span><span></span><span></span><span>41.16</span></div>
    <div class="ln"><span>${blank ? '<mark>?</mark>' : '22/10'}</span><span>ASTRAZENECA</span><span>10</span><span>${blank ? '107.60' : '<mark>107.60</mark>'}</span><span>1,076.00</span></div>
    <div class="ln dim"><span>28/10</span><span>TRANSFER IN</span><span></span><span></span><span>500.00</span></div></div>`;
  const listingChoice = () => `<div class="holdings-opt"><span class="o" aria-hidden="true"></span><span><b>HSBA · XLON · GBP</b>Ordinary share. Claude suggests this; only you confirm it.</span></div><div class="holdings-opt"><span class="o" aria-hidden="true"></span><span><b>HSBC · XNYS · USD</b>American depositary share.</span></div>`;
  const groupsCard = (ctx, o = {}) => {
    const off = !!o.off, done = !!o.resolved;
    return `<div class="card" style="padding:2px 0" data-mo="card">
      ${gRow(G.a, { on: !off, dis: off, chip: ev('ok', 'Ready') })}
      ${done && !o.unread ? gRow(G.c, { on: true, chip: ev('ok', 'Confirmed') }) : gRow(G.c, { dis: true, d: o.unread ? 'Date not read' : '', chip: o.unread ? ev('none', 'Date not read') : ev('old', 'Check 1 field'), x: o.unread ? `<span class="holdings-note">Claude could not read the date on this row, so it is blank, not guessed. Type it from your statement.</span>${acts(btn('Add the date', 'tinted sm'))}` : `${scan()}<span class="holdings-note">Claude read £107.60 with low confidence.</span>${acts(btn('Confirm £107.60', 'primary sm'), btn('Edit', 'tinted sm'))}` })}
      ${done ? gRow(G.b, { on: true, chip: ev('ok', 'HSBA chosen') }) : gRow(G.b, { dis: true, chip: ev('amb', 'Choose a listing'), x: `<span class="holdings-note">Two listings fit “HSBC HOLDINGS”. Only this group waits on the choice.</span>${listingChoice()}` })}
      ${gRow(G.d, { dis: true, chip: ev('none', 'Duplicate'), x: `<span>Same date, amount and account as your typed entry of 21 Oct, receipt R-0211. Left out, still listed.</span>${acts(btn('Keep it anyway', 'plain sm'))}` })}
      ${gRow(G.e, { dis: true, chip: ev('part', 'Stays pending'), x: `<span>Money from outside, or a transfer from your General account? It is not income until you say. It stays pending and visible.</span>${acts(btn('From outside', 'tinted sm'), btn('From General', 'tinted sm'))}` })}
    </div>`;
  };
  const draftHead = (ctx, o = {}) => `<div class="card" style="padding:14px 16px;display:grid;gap:8px" data-mo="card">
    <div class="holdings-bar"><div class="w"><b>ISA statement, Oct 2026</b>Scan · 4 pages · 11 rows in 5 groups · revision ${o.rev || 4}</div></div>
    <div class="holdings-acts">${draftChip}<span class="cl-chip"><span class="cl-mark s" aria-hidden="true"><i></i><i></i><i></i></span>${o.claude || 'Read by Claude, no tools, 1 field flagged'}</span></div></div>`;
  const change = (o = {}) => `<div class="card" style="padding:14px 16px;display:grid;gap:10px" data-mo="card"><div class="holdings-bar"><div class="w"><b>What will change</b>${o.sub || '1 group selected · 3 rows of 11'}</div>${illus()}</div>
    <div class="holdings-ba">${(o.rows || [['Apple, Stocks ISA', '60 → 64 units'], ['Cash, Stocks ISA', '£4,012.60 → £3,335.81']]).map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}</div>
    <p class="small muted">${o.note || 'Changes value, cost basis, gain and return on Apple, and your ISA cash. 2 groups need you. The duplicate and the transfer stay listed.'}</p>${o.go === false ? '' : btn('Review and approve', 'primary sm')}</div>`;
  const pending = (n = '1 group') => `<div class="holdings-bar"><div class="w"><b>${n} · 3 rows</b>2 groups need you</div>${btn('Review', 'primary sm')}</div>`;
  const mismatch = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('split', 's18')}</span>Statement and rows differ by £12.40</div>
    <div class="holdings-ba"><span>Closing cash on the statement</span><b>£4,130.43</b><span>Closing cash from these rows</span><b>£4,142.83</b><span>Difference, cash</span><b>£12.40</b></div>
    <p>Nothing is plugged or overwritten. Fix a row, add the missing one, or commit and keep the difference open, in plain sight, with your reason.</p>${acts(btn('Find the row', 'tinted sm'), btn('Keep it open', 'plain sm'))}</div>`;

  /* the failures an upload can meet. Two depend on open owner questions, so they are labelled proposed */
  const failRow = (k, n, t, s, chip, a) => `<div class="hrow" style="grid-template-columns:30px minmax(0,1fr);align-items:start" data-mo="rise">${logo('--seg-metals', k, true)}<div style="min-width:0;display:grid;gap:6px"><div><div class="nm">${n}</div><div class="tk" style="white-space:normal">${t}</div></div><p class="small muted">${s}</p>${chip ? `<div class="holdings-acts">${chip}</div>` : ''}${a}</div></div>`;
  const failures = () => `<div class="card" style="padding:2px 0" data-mo="card"><div class="holdings-head"><h3>3 files not taken in</h3>${ev('bad', 'Nothing was read')}</div>
    ${failRow('PDF', 'isa-scan-copy.pdf', 'Unreadable file', 'Its contents do not match a PDF. It was refused at the door, and nothing reached Claude. Export it again from your broker.', '', acts(btn('Choose another', 'tinted sm')))}
    ${failRow('PDF', 'isa-2019-to-2026.pdf', 'Oversized file', 'Larger than a statement should be. It is held apart and not read until you decide. No upload limit is approved yet.', proposed, acts(btn('Split and resend', 'tinted sm'), btn('Discard', 'plain sm')))}
    ${failRow('PDF', 'demat-oct-locked.pdf', 'Password-protected PDF', 'Unlock it on your device, then upload the copy. MyPrediction never asks for or stores a statement password.', proposed, acts(btn('How to unlock', 'tinted sm')))}</div>`;
  const interrupted = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('wifi-off', 's18')}</span>Upload stopped at 62%</div><p>isa-oct-2026-scan.pdf did not finish, so no part of it was kept. Send it again once you are back online. Your link has expired and a new one is made for you.</p><div class="calbar" role="img" aria-label="Stopped at 62%"><i style="width:62%;background:var(--ink-2)"></i></div>${acts(`<button class="btn btn-tinted sm" type="button" disabled>Send again when online</button>`)}</div>`;
  const STEP = ['Received', 'Checked', 'Reading', 'Ready'];
  const steps = at => `<ol class="holdings-steps" aria-label="Import progress">${STEP.map((t, i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}"${i === at ? ' aria-current="step"' : ''}><i data-mo="barx"></i><span>${i < at ? ic('check', 's14') : ''}${t}</span></li>`).join('')}</ol>`;
  const fileHead = (chip, t = 'ISA statement, Oct 2026', s = 'isa-oct-2026-scan.pdf · 4 pages') => `<div class="sh"><span class="ic">${ic('layers', 's18')}</span><span style="flex:1;min-width:0">${t}<span class="holdings-sub">${s}</span></span>${chip}</div>`;
  const running = (ctx, o = {}) => `<div class="card state" data-mo="card">${fileHead(o.chip || ev('live', 'Live'))}${steps(o.at ?? 2)}${o.body || `<span class="cl-chip is-working" style="align-self:flex-start"><span class="cl-mark s" aria-hidden="true"><i></i><i></i><i></i></span>Claude is reading page 3 of 4</span><p>Checked and held apart before anything read it. Claude has no tools here and can change nothing. You review every row.</p>`}</div>`;
  const uploading = () => `<div class="card state" data-mo="card">${fileHead(`<span class="chip"><span class="spin" aria-hidden="true"></span>62%</span>`)}${steps(0)}<div class="calbar" role="img" aria-label="Upload 62% done"><i data-mo="barx" style="width:62%;background:var(--link)"></i></div><p>Uploading privately. Size, type and pages are checked next, before anything reads the file.</p></div>`;
  const reconnecting = () => running({}, { chip: ev('old', 'Last known 21:09'), body: `<p>Live updates stopped at 21:09. Reading was the last known step, shown here as stale. MyPrediction is re-reading the import itself, so what you see next is the true status.</p>${acts(btn('Check now', 'tinted sm', 'refresh'))}` });
  const scansOff = () => `<div class="card state" data-mo="card">${fileHead(ev('old', 'Paused for credit'))}${steps(2)}<p>This scan is queued and no model has read it. Claude's budget for the month is spent, so reading resumes when it renews. It is never retried under a new budget. CSV, Excel, text PDFs and typed rows work now.</p>${acts(btn('Type the rows in', 'tinted sm'))}</div>`;
  const scanFailed = () => `<div class="card state" data-mo="card">${fileHead(ev('bad', 'Not read'))}${steps(2)}<p>Claude’s reply failed validation, so it was refused and no rows were made. Your original is safe and nothing reached your ledger. A retry stays inside the same budget, and stops with a reason if it fails again.</p>${acts(btn('Try again', 'tinted sm', 'refresh'), btn('Type the rows in', 'plain sm'))}</div>`;
  const stillApproved = () => `<div class="card" style="padding:12px 14px;display:grid;gap:8px" data-mo="card"><div class="label">Still approved, until 21:33</div><div class="holdings-ba"><span>Apple</span><b>60 → 64 units</b><span>HSBC, HSBA · XLON</span><b>700 → 730 units</b><span>AstraZeneca</span><b>85 → 75 units</b><span>ISA cash</span><b>£4,012.60 → £4,142.83</b></div></div>`;
  const HIST = [
    ['CSV', 'General account, Q3', '18 rows · committed 24 Oct · R-0212', ev('ok', 'Committed')],
    [ic('plus', 's16'), 'AstraZeneca dividend, typed', '1 row · committed 21 Oct · R-0211', ev('ok', 'Committed')],
    ['PDF', 'India demat, September', '6 rows · committed 2 Oct · R-0209', ev('ok', 'Committed')],
    ['PNG', 'Apple screenshot', '1 row · reversed 12 Sep · R-0204', ev('none', 'Reversed')]
  ];
  const history = (o = {}) => `<div class="card top5" style="padding:2px 0" data-mo="card"><div class="holdings-head"><h3>Earlier imports</h3></div>${(o.rows || HIST).map(([k, n, s, c]) => `<div class="holdings-acc" style="grid-template-columns:30px minmax(0,1fr) auto" data-mo="rise">${logo('--seg-metals', k, true)}<div style="min-width:0"><b>${n}</b><span>${s}</span></div>${c}</div>`).join('')}</div>`;
  const records = (first, off) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('shield', 's18')}</span>Your records</div>${first ? '<p>Originals are kept privately for a renewable 24 months, and only you can delete them. There is nothing to export yet.</p>' : `<p>6 originals kept privately for a renewable 24 months. Next renewal is 12 Sep 2028.</p><p>Export the ledger and its evidence as of revision 212. The private link starts a download for one hour.</p>${acts(off ? '<button class="btn btn-tinted sm" type="button" disabled>Export when online</button>' : btn('Export', 'tinted sm'), off ? '' : btn('Manage originals', 'plain sm'))}`}</div>`;
  const dropZone = ctx => `<div class="holdings-drop" data-mo="card"><span class="ring">${ic('layers', 's24')}</span><b>${phone(ctx) ? 'Add a statement' : 'Drop a statement here'}</b><p>CSV, Excel, PDF or a screenshot. It is held apart and checked before anything reads it.</p>${acts(btn('Choose a file', 'primary sm'), btn('Type it in', 'tinted sm'))}</div>`;
  const placeBack = ctx => (ctx.kind === 'iphone' || ctx.kind === 'pwa' ? 'Settings' : 'Data sources');

  /* ---------- the approval: names exactly what will change ---------- */
  const approveList = (o = {}) => `<div class="card" style="margin-top:12px;padding:12px 14px;display:grid;gap:8px" data-mo="card"><div class="label">Commit ${o.n || '3 groups, 9 of 11 rows'}, to Stocks ISA</div>
    <div class="holdings-ba">${(o.rows || [['Apple', '60 → 64 units'], ['HSBC, HSBA · XLON', '700 → 730 units'], ['AstraZeneca', '85 → 75 units'], ['Cash', '£4,012.60 → £4,142.83']]).map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}</div>
    <p class="small muted">${o.left || 'Left out and still listed: AstraZeneca dividend, duplicate. Transfer in £500.00, pending.'}</p></div>`;
  const bind = (rev = 6, led = 212) => `<div class="holdings-bind" style="margin-top:10px"><span>Draft revision ${rev}</span><span>Hash <code>7f3a…c21e</code></span><span>Ledger revision ${led}</span><span>Illustrative</span></div>`;
  const sheetHead = t => `<div class="grabber"></div><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><h4>${t}</h4><button class="iconbtn sm" type="button" aria-label="Close">${ic('x', 's16')}</button></div>`;
  const sheetBtns = (a, b) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px">${a}${b}</div>`;
  const approveNote = `<p class="holdings-note" style="margin-top:10px">This records what already happened at your broker. It places no trade. Approving needs a fresh sign-in, and the commit must start within 15 minutes. Any change needs a new approval.</p>`;
  const approveSheet = ctx => {
    const st = ctx.state, go = (l, dis) => `<button class="btn sm btn-primary" type="button"${dis ? ' disabled' : ''}>${l}</button>`, no = btn('Not now', 'tinted sm');
    const open = (head, mid, foot) => `<div class="sheet" role="dialog" aria-modal="true" aria-label="Approve exactly this" data-mo="sheet">${sheetHead(head)}${mid}${foot}</div>`;
    switch (st) {
      case 'loading': return open('Waiting for your sign-in', `${approveList()}${bind()}<p class="holdings-note" style="margin-top:10px">Checking your sign-in with the server. A Face ID unlock alone does not count. Nothing has been approved yet.</p>`, sheetBtns(no, `<button class="btn sm btn-tinted" type="button" disabled><span class="spin" aria-hidden="true"></span>Checking</button>`));
      case 'empty': return open('Nothing selected', `<p class="holdings-note" style="margin-top:10px">Select at least one complete group. Each keeps its cash, fee and linked rows together, so a part of a group cannot be committed.</p>`, sheetBtns(no, go('Sign in and approve', true)));
      case 'error': return open('Approval refused', `<div style="margin-top:10px">${banner('fall', 'Ledger moved on.', 'It is now at revision 213, and this approval was for 212. Nothing was committed. Refresh the preview to approve the new one.', 'alert')}</div>${approveList()}${bind()}`, sheetBtns(no, btn('Refresh preview', 'primary sm')));
      case 'stale': return open('This approval expired', `<div style="margin-top:10px">${banner('warn', 'Expired at 21:33.', 'The commit did not start within 15 minutes, so nothing was committed. The rows have not changed, so a fresh approval is enough.', 'clock')}</div>${approveList()}${bind()}`, sheetBtns(no, go('Sign in and approve')));
      case 'offline': return open('You are offline', `<div style="margin-top:10px">${banner('', 'Approval needs a connection.', 'The server has to check your sign-in. Your selection is safe on revision 6, and nothing was approved.', 'wifi-off')}</div>${approveList()}${bind()}`, sheetBtns(no, go('Sign in and approve', true)));
      case 'disagreement': return open('Approve exactly this', `${approveList()}<div style="margin-top:10px">${banner('warn', 'A £12.40 cash difference stays open.', 'Approving does not clear it. It stays visible on the receipt until you fix it or resolve it with a reason.', 'split')}</div>${bind()}${approveNote}`, sheetBtns(no, go('Sign in and approve')));
      case 'abstention': return open('Approve exactly this', `${approveList({ n: '2 groups, 6 of 11 rows', rows: [['Apple', '60 → 64 units'], ['HSBC, HSBA · XLON', '700 → 730 units'], ['Cash', '£4,012.60 → £3,070.82']], left: 'Left out and still listed: Sold 10 AstraZeneca, date not read. AstraZeneca dividend, duplicate. Transfer in £500.00, pending.' })}<div style="margin-top:10px">${banner('', 'One group cannot be approved.', 'Claude could not read its date, and a blank is never filled in. Add the date to include it.', 'ban')}</div>${bind(5)}${approveNote}`, sheetBtns(no, go('Sign in and approve')));
      default: return open('Approve exactly this', `${approveList()}${bind()}${approveNote}`, sheetBtns(no, go('Sign in and approve')));
    }
  };
  const naApprove = { noModel: 'This sheet lists ledger changes you reviewed. No model is involved, and no model can approve anything.' };

  /* the receipt, and how a mistake is put right */
  const receipt = (ctx, o = {}) => `<div class="card valcard" data-mo="card"><div class="holdings-bar"><span class="holdings-done">${ic('check', 's24')}</span><div class="w"><b>${o.t || 'Committed'}</b>${o.s || 'All 9 rows, all at once, at 21:22'}</div>${illus()}</div>
    <div class="holdings-ba" style="margin-top:12px"><span>Ledger revision</span><b>212 → 213</b><span>Receipt</span><b>R-0213</b><span>Apple</span><b>64 units</b><span>HSBC, HSBA · XLON</span><b>730 units</b><span>AstraZeneca</span><b>75 units</b><span>ISA cash</span><b>£4,142.83</b></div>
    <p class="small muted" style="margin-top:10px">2 rows stay in the draft and remain visible: the duplicate and the pending transfer.</p></div>`;
  const original = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('lock', 's18')}</span>Original kept to 3 Nov 2028</div><p>isa-oct-2026-scan.pdf stays private and renewable. Deleting it keeps these ledger rows, marked evidence unavailable, and a restore can never bring it back.</p>${acts(btn('Renew', 'tinted sm'), btn('Delete original', 'plain sm'))}</div>`;
  const correction = (o = {}) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('refresh', 's18')}</span>Correct a row</div><p>Sold 8, not 10? A correction reverses every leg of the original and commits its replacement together. The original stays on record.</p>
    <div class="holdings-ba"><span>Reverse: Sold 10 AstraZeneca</span><b>+10 · −£1,072.01</b><span>Replace: Sold 8 AstraZeneca</span><b>−8 · +£856.81</b><span>AstraZeneca after</span><b>77 units</b><span>ISA cash after</span><b>£3,927.63</b></div>${o.top || ''}${acts(btn('Review and approve', 'primary sm'), btn('Reverse the import', 'plain sm'))}</div>`;
  const reversal = (o = {}) => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('rebalance', 's18')}</span>Reverse this import</div><p>A reversal has its own preview and approval. Later events are checked first, and the original rows stay on record.</p>
    <div class="holdings-ba"><span>Apple</span><b>64 → 60 units</b><span>HSBC</span><b>730 → 700 units</b><span>AstraZeneca</span><b>75 → 85 units</b><span>ISA cash</span><b>£4,142.83 → £4,012.60</b></div>${o.top || ''}${acts(btn('Review and approve', 'primary sm'), btn('Correct one row', 'plain sm'))}</div>`;

  /* ---------- Option A, one holding ---------- */
  const mRow = ([k, v, s, n]) => `<div class="holdings-m" data-mo="rise"><span class="k">${k}</span><span class="v">${v}</span><span class="s">${s}</span><span class="n">${n}</span></div>`;
  const hHead = (ctx, h, o = {}) => `<div class="card valcard" data-mo="card"><div class="holdings-bar">${logo(h.c, h.lg)}<div class="w"><b>${h.n}</b>${h.t} · ${h.v} · ${L[h.t].units}</div>${illus()}</div>
    <div style="margin-top:10px">${money(h.val, phone(ctx) ? 40 : 36)}</div><div class="d">${h.stale ? `<span class="chg" style="color:var(--warn)">${ic('clock', 's14')}Last price 16:35</span>` : `${chg(h.day)}<span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">today</span>`}</div><div class="meta">${o.meta || 'As of 21:15 London · data cutoff 21:00'}</div></div>`;
  const acctCard = h => `<div class="card" style="padding:0 0 4px" data-mo="card"><div class="holdings-head"><h3>In your accounts</h3></div>${accountsOf(h).map(([n, u, v, b, r]) => `<div class="holdings-m" data-mo="rise"><span class="k">${n} · ${u}</span><span class="v">${v}</span><span class="r2">${r}</span><span class="n">${b}</span></div>`).join('')}</div>`;
  const fcAction = (h, ctx) => {
    const st = ctx.state, foot = `<div class="fmeta" style="margin-top:8px"><span>As of 21:15 London</span><span>Data cutoff 21:00</span><span>R2-HGB v3</span><span>Illustrative</span></div>`;
    if (st === 'noModel') return stateCard('cube', 'No approved model', `No approved model covers ${h.n} yet, so no forecast or action shows. Your figures come from your records, so everything else here stands.`);
    if (st === 'abstention') return stateCard('ban', 'The model abstained', 'Too little comparable history for a calibrated 6-month range, so no range and no action show.', '', ev('none', 'Abstained · no range shown'));
    if (st === 'disagreement') return `<div class="card fcard" data-mo="card"><div class="label">3-month forecast · RELIANCE</div><p class="small muted" style="margin:6px 0 8px">R2-HGB v3 and the baseline differ on direction. Both show, and no action is ranked.</p>${dual()}${foot}</div>`;
    if (h.stale) return stateCard('clock', 'Forecast held', 'HSBC last priced 16:35. Its forecast is held and its action paused until prices return.', '', ev('old', 'Yahoo · delayed since 16:35'));
    if (st === 'empty') return `<div class="card fcard" data-mo="card">${fcHead(h)}<div style="margin-top:10px">${range(h)}</div>${foot}<div class="proofmodel" style="--ic2:var(--link)">${badge(h.act)}<div style="flex:1"><div class="small muted">Ranked on the forecast. Your return is not part of it.</div></div></div></div>`;
    return `<div class="card fcard" data-mo="card">${fcHead(h)}<div style="margin-top:10px">${range(h)}</div>${foot}
      <div class="holdings-bar" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--hairline)">${badge(h.act)}<div class="w">Ranked action</div><span class="chip illus">Decision support</span></div>
      <div style="margin-top:10px">${btn('Record decision', 'tinted sm')}</div></div>`;
  };
  const provenance = h => `<div class="card top5" style="padding:2px 0 6px" data-mo="card"><div class="holdings-head"><h3>Where this comes from</h3></div>
    ${(h.t === 'NIFTYBEES' ? [['PDF', 'India demat, September', 'Committed 2 Oct · R-0209']] : [['CSV', 'General account, Q3', 'Committed 24 Oct · R-0212'], ['PDF', 'ISA statement, September', 'Committed 6 Oct · R-0210']]).map(([k, n, s]) => `<div class="holdings-acc" style="grid-template-columns:30px minmax(0,1fr) auto" data-mo="rise">${logo('--seg-metals', k, true)}<div style="min-width:0"><b>${n}</b><span>${s}</span></div>${ic('chev-r', 's18')}</div>`).join('')}</div>`;
  const holdingA = (ctx, o = {}) => {
    const st = ctx.state, h = pick(st);
    const top = st === 'loading' ? hHead(ctx, h, { meta: 'Last good 21:15 · refreshing' }) : st === 'offline' ? banner('', 'Offline.', 'Showing Apple from 21:15. Nothing updates until you reconnect.', 'wifi-off') + hHead(ctx, h, { meta: 'From 21:15 · not updating' }) : hHead(ctx, h);
    const list = st === 'loading' ? skel(3) : st === 'error'
      ? `<div class="card" style="padding:4px 0" data-mo="card">${measures(h).slice(0, 3).map(mRow).join('')}${mRow(['Money-weighted return', 'Not shown', ev('bad', 'Integrity failed'), 'The cash flows did not balance at 21:14. No partial rate is shown. It is tried again on the next run.'])}</div>`
      : `<div class="card" style="padding:4px 0" data-mo="card"><div class="holdings-head"><h3>What your evidence supports</h3></div>${measures(h).map(mRow).join('')}</div>`;
    const gap = st === 'empty' ? stateCard('layers', 'Snapshot only', 'You have units and a value, with no purchases behind them. Older statements fill the history through a rebuild you approve. Forecasts you have seen stay as they were.', btn('Go to Imports', 'tinted sm', 'chev-r')) : '';
    const body = `${top}${list}${gap}${st === 'error' ? stateCard('alert', 'One measure failed', 'Value, cost basis and gain are sound. Only the return failed its check, so only the return is held back.') : ''}${acctCard(h)}`;
    return { body, rail: `${fcAction(h, ctx)}${provenance(h)}` };
  };

  /* ---------- Option B: by account, one question at a time ---------- */
  const ACC = [
    { n: 'Stocks ISA', c: '--seg-uketf', m: 'GBP · 3 holdings', hold: '£25,424.85', cash: '£4,012.60', ret: '+11.2% a year', ev: ['old', 'October statement due'], rows: [['AAPL', '60 units', '£10,104.90'], ['AZN', '85 units', '£9,215.75'], ['HSBA', '700 units', '£6,104.20']] },
    { n: 'General account', c: '--seg-uslarge', m: 'GBP · 3 holdings', hold: '£35,077.70', cash: '£1,530.25', ret: '+17.4% a year', ev: ['ok', 'Reconciled to 30 Sep'], rows: [['AAPL', '28 units', '£4,715.60'], ['NVDA', '60 units', '£11,402.10'], ['SPY', '40 units', '£18,960.00']] },
    { n: 'India demat', c: '--seg-n50', m: 'INR, shown in GBP · 2 holdings', hold: '£24,109.85', cash: 'None held', ret: 'Partial', ev: ['part', '1 snapshot, no history'], rows: [['RELIANCE', '120 units', '£8,940.30'], ['NIFTYBEES', '4,200 units', '£15,169.55']] }
  ];
  const accCard = (a, ctx) => `<div class="card top5" data-mo="card"><div class="t5h" style="--c:var(${a.c})"><h4>${a.n}</h4><p>${a.m}</p></div>
    ${a.rows.map(([t, u, v]) => { const h = byT[t], stale = h.stale; return `<div class="holdings-acc" data-mo="rise">${logo(h.c, h.lg, true)}<div style="min-width:0"><b>${h.n}</b><span>${t} · ${u}</span></div><div><div class="r">${v}</div>${stale ? `<span style="text-align:right;color:var(--warn)">Price 16:35</span>` : `<span style="text-align:right">${fcSmall(h, ctx)}</span>`}</div></div>`; }).join('')}
    <div class="holdings-foot"><div><span>Holdings</span><b>${a.hold}</b></div><div><span>Cash</span><b>${a.cash}</b></div><div><span>Return</span><b>${a.ret}</b></div></div>
    <div style="padding:0 16px 12px;display:flex;align-items:center;gap:8px;justify-content:space-between;flex-wrap:wrap">${ev(...a.ev)}${a.n === 'Stocks ISA' ? btn('Add statement', 'plain sm') : ''}</div></div>`;
  const fcSmall = (h, ctx) => {
    const st = ctx.state;
    if (st === 'noModel') return 'No forecast';
    if (st === 'abstention' && h.t === 'AZN') return 'Abstained';
    if (st === 'disagreement' && h.t === 'RELIANCE') return 'Models differ';
    return `6M ${pct(h.med)}, ${pct(h.lo)} to ${pct(h.hi)}`;
  };
  const accSummary = (ctx, o = {}) => `<div class="card valcard" data-mo="card"><div class="top"><span class="label">${o.label || 'All accounts'}</span>${o.chip || illus()}</div>${money(o.val || '84,612.40', phone(ctx) ? 40 : 36)}${o.sub || `<div class="d">${chg(1, '+£1,236.18 (1.48%)')}<span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">today · 3 accounts</span></div>`}<div class="meta">${o.meta || 'As of 21:15 London · data cutoff 21:00'}</div>${phone(ctx) ? '' : statsTwo(ctx, o.partial)}</div>`;
  const accSummaryPartial = ctx => accSummary(ctx, { label: 'Known value, 6 of 7 priced', val: '78,508.20', chip: ev('part', 'Partial'), partial: true, sub: `<div class="d" style="font-size:13px;line-height:18px;letter-spacing:0"><span class="muted">HSBC, in your ISA, is left out until it has a fresh price.</span></div>` });
  const EVENTS = [
    ['plus', 'Bought 40', '14 Aug 2025 · £5,280.00', 'Statement, page 1', ''],
    ['plus', 'Bought 20', '2 Mar 2025 · £2,640.00', 'Original deleted', 'none']
  ];
  const holdingB = ctx => {
    const st = ctx.state, h = pick(st), ms = measures(h), showing = st === 'error' ? ms.slice(0, 3).concat([['Money-weighted return', 'Not shown', ev('bad', 'Integrity failed'), 'Cash flows did not balance at 21:14. No partial rate shows.']]) : ms;
    const statGrid = st === 'loading' ? skel(2) : `<div class="holdings-stat">${showing.map(([k, v, s, n]) => `<div data-mo="card"><span class="k">${k}</span><span class="v">${v}</span>${s}<span class="n">${n}</span></div>`).join('')}</div>`;
    const accts = h.t === 'AAPL' ? [['All', 'All accounts'], ['ISA', 'Stocks ISA'], ['General', 'General account']] : [[L[h.t].at, L[h.t].at]];
    const events = st === 'empty' ? stateCard('layers', 'No events behind this holding', 'A snapshot records units and value only, never invented purchases. Older statements add the history through a rebuild you approve.', btn('Go to Imports', 'tinted sm', 'chev-r'))
      : `<div class="card top5" style="padding:2px 0 6px" data-mo="card"><div class="holdings-head"><h3>What built this position</h3>${illus()}</div>${(h.t === 'AAPL' ? EVENTS : [['plus', 'Opening position', '30 Sep · from your statement', 'Statement, page 1', '']]).map(([i, n, s, e, k]) => `<div class="holdings-acc" data-mo="rise"><span class="logo sm" style="--c:var(--seg-metals)" aria-hidden="true">${ic(i, 's16')}</span><div style="min-width:0"><b>${n}</b><span>${s}</span></div>${k ? ev('none', e) : `<span class="small muted">${e}</span>`}</div>`).join('')}</div>`;
    const tabsRow = `<div data-mo="rise">${seg(accts.map(a => [a[0], a[1]]), 0, 'Account', 'full')}</div>`;
    const top = st === 'loading' ? hHead(ctx, h, { meta: 'Last good 21:15 · refreshing' }) : st === 'offline' ? banner('', 'Offline.', 'Showing Apple from 21:15. Nothing updates until you reconnect.', 'wifi-off') + hHead(ctx, h, { meta: 'From 21:15 · not updating' }) : hHead(ctx, h);
    return { body: `${top}${tabsRow}${statGrid}${st === 'error' ? stateCard('alert', 'One measure failed', 'Value, cost basis and gain are sound. Only the return failed its check.') : ''}${events}`, rail: `${fcAction(h, ctx)}${provenance(h)}` };
  };
  const STEPB = (at) => `<ol class="holdings-steps" aria-label="Import steps" data-mo="rise">${['Add', 'Read', 'Check', 'Approve'].map((t, i) => `<li class="${i < at ? 'done' : i === at ? 'now' : ''}"${i === at ? ' aria-current="step"' : ''}><i></i><span>${i < at ? ic('check', 's14') : ''}${t}</span></li>`).join('')}</ol>`;
  const methods = (ctx, o = {}) => `<div class="card top5" style="padding:4px 0" data-mo="card">
    ${[['layers', 'A file', 'CSV, Excel or PDF', o.fileNote], ['eye-off', 'A scan or screenshot', 'Read by Claude, with no tools', o.scanNote], ['plus', 'Type it in', 'Same review, same approval', '']].map(([i, n, s, x]) => `<div class="holdings-acc" style="min-height:56px" data-mo="rise"><span class="logo sm" style="--c:var(--seg-metals)" aria-hidden="true">${ic(i === 'eye-off' ? 'search' : i, 's16')}</span><div style="min-width:0"><b>${n}</b><span>${x || s}</span></div>${ic('chev-r', 's18')}</div>`).join('')}</div>`;
  const expectCard = () => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('clock', 's18')}</span><span style="flex:1;min-width:0">October statement<span class="holdings-sub">Stocks ISA · covers 1 to 31 Oct · last one to 30 Sep</span></span></div></div>`;
  const qCard = (ctx, st) => {
    if (st === 'abstention') return `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('ban', 's18')}</span><span style="flex:1;min-width:0">What date was this sale?<span class="holdings-sub">Sold 10 AstraZeneca · question 1 of 3</span></span></div>${scan(true)}<p>Claude could not read the date on this row, so it is blank, not guessed. Type it from your statement.</p>${acts(btn('Add the date', 'tinted sm'))}</div>`;
    return `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('search', 's18')}</span><span style="flex:1;min-width:0">Is this the price?<span class="holdings-sub">Sold 10 AstraZeneca · question 1 of 3</span></span></div>${scan()}<p>Claude read <b style="color:var(--ink);font-weight:600">£107.60</b> with low confidence. Check it against your statement, then answer.</p>${phone(ctx) ? '' : acts(btn('Yes, £107.60', 'primary sm'), btn('No, edit it', 'tinted sm'))}</div>`;
  };
  const groupList = (o = {}) => `<div class="card" style="padding:2px 0" data-mo="card"><div class="holdings-head"><h3>Groups</h3>${o.chip || `<span class="small muted">All 11 rows ${ic('chev-r', 's14').replace('class="ico s14"', 'class="ico s14" style="display:inline-block;vertical-align:-2px"')}</span>`}</div>
    ${gRow(G.a, { on: !o.off, dis: o.off, chip: ev('ok', 'Ready'), nofx: true })}
    ${o.resolved && !o.unread ? gRow(G.c, { on: true, chip: ev('ok', 'Confirmed'), nofx: true }) : gRow(G.c, { dis: true, d: o.unread ? 'Date not read' : '', chip: o.unread ? ev('none', 'Date not read') : ev('old', 'Question 1'), nofx: true })}
    ${o.resolved ? gRow(G.b, { on: true, chip: ev('ok', 'HSBA chosen'), nofx: true }) : gRow(G.b, { dis: true, chip: ev('amb', 'Question 2'), nofx: true })}
    ${gRow(G.e, { dis: true, chip: ev('part', o.resolved ? 'Stays pending' : 'Question 3'), nofx: true })}
    ${gRow(G.d, { dis: true, chip: ev('none', 'Duplicate'), nofx: true })}</div>`;

  J.add({
    id: 'holdings', title: 'Holdings and imports',
    stories: ['MP-84', 'MP-149', 'MP-46', 'MP-48', 'MP-49', 'MP-50', 'MP-53', 'MP-55', 'MP-60', 'MP-65', 'MP-68', 'MP-69', 'MP-72', 'MP-79', 'MP-45', 'MP-169'],
    summary: 'What you own, then, as a separate place, how records arrive. Nothing reaches your ledger until you approve exactly what will change.',
    options: [{
      id: 'a', name: 'Review desk', rec: true,
      why: 'Every row, what it changes and what is blocked sit in one view, so you approve what you actually read. A long statement is no slower to judge than a short one, and the desktop holds it all at once.',
      cost: 'The preview is dense on iPhone, and you choose the order of your own checks.',
      screens: [{
        id: 'a-list', title: 'Holdings',
        note: 'A place for what you own: value, cost basis, return and how far the evidence goes, with the forecast range beside them. Cash is shown apart because the shared figure of £84,612.40 holds none.',
        render: ctx => {
          const st = ctx.state, p = phone(ctx);
          const rows = () => p ? `<div class="card" style="padding:2px 0;margin:0">${H.map(h => holdRow(h, ctx)).join('')}${listFoot}</div>` : holdTable(ctx);
          const val = () => (p ? valueCard(ctx) : '');
          const body = region(ctx, {
            ok: () => val() + rows(),
            loading: () => (p ? valueCard(ctx, { meta: 'Last good 21:15 · refreshing' }) : '') + (p ? skel(4) : `<div class="holdings-wide">${skel(6)}</div>`),
            empty: () => `<div class="holdings-wide"></div>` + stateCard('grid', 'No holdings yet', 'Holdings come from records you approve: a statement, a spreadsheet, a screenshot or a typed entry. MyPrediction never connects to a broker.', btn('Go to Imports', 'primary sm', 'chev-r')),
            error: () => stateCard('alert', 'Holdings did not load', 'The read failed at 21:14. These are the last good figures, from 20:45. They may have moved.', btn('Try again', 'tinted sm', 'refresh')) + (p ? valueCard(ctx, { meta: 'Last good read 20:45 · not current' }) : '') + rows(),
            stale: () => banner('warn', 'Yahoo is delayed.', 'HSBC last priced 16:35, so it is left out of the total and its forecast is held.', 'clock') + (p ? partialCard(ctx) : '') + rows(),
            offline: () => banner('', 'Offline.', 'Showing holdings from 21:15. Imports and approvals wait until you reconnect.', 'wifi-off') + val() + rows(),
            noModel: () => banner('', 'No approved model.', 'Forecast ranges and actions are off. Value, cost basis and return come from your records, so they stand.', 'cube') + val() + rows(),
            disagreement: () => banner('', 'Models disagree on Reliance.', 'R2-HGB v3 and the baseline differ on direction at 3 months. Both show, and no action is ranked.', 'split') + val() + rows(),
            abstention: () => banner('', 'The model abstained on AstraZeneca.', 'Too little comparable history for a calibrated 6-month range, so none shows. Its value and return stand.', 'ban') + val() + rows()
          });
          const rail = st === 'empty' ? toImports(ctx, 'Start in Imports', 'Drop a file, check every row, then approve exactly what goes in.') : (p ? '' : (st === 'stale' ? partialCard(ctx) : st === 'error' ? valueCard(ctx, { meta: 'Last good read 20:45 · not current' }) : st === 'loading' ? valueCard(ctx, { meta: 'Last good 21:15 · refreshing' }) : valueCard(ctx))) + coverage(ctx) + toImports(ctx);
          return frame(ctx, { tab: 0, title: 'Holdings', back: 'Portfolio', actions: tb('eye-off', 'Hide amounts'), webActions: `${btn('Imports', 'tinted sm', 'layers')}${eyeBtn(ctx)}`, body, rail });
        }
      }, {
        id: 'a-one', title: 'One holding',
        note: 'Each measure carries its own status. Each state shows the holding that best proves it: Empty a snapshot, Stale HSBC, Disagreement Reliance with two possible rates, Abstaining AstraZeneca with no rate found.',
        render: ctx => { const h = pick(ctx.state), s = holdingA(ctx); return frame(ctx, { tab: 0, title: h.t, back: 'Holdings', actions: tb('eye-off', 'Hide amounts'), webActions: eyeBtn(ctx), ...s }); }
      }, {
        id: 'a-imports', title: 'Imports: drop a file, watch it read',
        note: 'Imports is its own place. Error shows the three ways a file is refused; the upload limit (MP40-Q1) and how a locked PDF is opened (MP40-Q2) are open owner questions, so those two are labelled proposed. Offline shows an interrupted upload; Stale shows reconnect.',
        render: ctx => {
          const body = region(ctx, {
            ok: () => dropZone(ctx) + running(ctx),
            loading: () => dropZone(ctx) + uploading(),
            empty: () => dropZone(ctx) + stateCard('layers', 'No imports yet', 'Bring in a statement to start your ledger. Every row waits for your review, and nothing changes until you approve it.'),
            error: () => dropZone(ctx) + failures(),
            stale: () => dropZone(ctx) + reconnecting(),
            offline: () => banner('', 'Offline.', 'Uploads need a connection. Past imports are shown from 21:15.', 'wifi-off') + interrupted(),
            noModel: () => dropZone(ctx) + scansOff(),
            disagreement: () => dropZone(ctx) + `<div class="card state" data-mo="card">${fileHead(ev('amb', 'Difference open'), 'General account, Q3', 'Committed 24 Oct · R-0212')}<p>The statement closes £8.15 away from the ledger on cash. It stays open across sessions until you fix or resolve it, and no plug trade clears it.</p>${acts(btn('Open the difference', 'tinted sm'))}</div>`,
            abstention: () => dropZone(ctx) + running(ctx, { at: 3, chip: ev('ok', 'Ready for you'), body: `<p>Claude read 9 of the 11 rows in full. 2 fields it could not read are blank, not guessed, and wait for you.</p>${acts(btn('Open preview', 'primary sm'))}` })
          });
          const rail = ctx.state === 'empty' ? records(true) : history() + records(false, ctx.state === 'offline');
          return frame(ctx, { tab: 4, title: 'Imports', back: placeBack(ctx), actions: tb('info', 'About imports'), body, rail });
        }
      }, {
        id: 'a-preview', title: 'Preview: check every row',
        note: 'A scan read by Claude with no tools, one field flagged low confidence, a duplicate found, and one ambiguous listing. Unresolved groups stay visible and unselected. Each edit makes a new revision and voids any earlier approval. Disagreement shows a reconciliation mismatch.',
        render: ctx => {
          const st = ctx.state, p = phone(ctx);
          const body = region(ctx, {
            ok: () => draftHead(ctx) + groupsCard(ctx),
            loading: () => draftHead(ctx, { claude: 'Claude is reading page 3 of 4' }).replace('class="cl-chip"', 'class="cl-chip is-working"') + skel(3),
            empty: () => draftHead(ctx, { claude: 'Read by Claude, no tools' }) + stateCard('check', 'Nothing to commit', 'All 11 rows are already in your ledger, so this draft changes nothing. Cancel it; the original stays.', btn('Cancel draft', 'tinted sm')),
            error: () => scanFailed(),
            stale: () => banner('warn', 'This draft is out of date.', 'Your ledger moved to revision 213 when another import was committed. Refresh it to check the rows again. Any earlier approval no longer applies.', 'clock') + acts(btn('Refresh preview', 'primary sm', 'refresh')) + draftHead(ctx) + groupsCard(ctx, { off: true }),
            offline: () => banner('', 'Offline.', 'Your draft is safe on the server at revision 4. Selecting and editing wait until you reconnect.', 'wifi-off') + draftHead(ctx) + groupsCard(ctx, { off: true }),
            noModel: () => scansOff(),
            disagreement: () => mismatch() + draftHead(ctx) + groupsCard(ctx),
            abstention: () => banner('', 'Claude left 1 field blank.', 'A date on page 2 could not be read. A blank is never filled in, and that one group waits for you.', 'ban') + draftHead(ctx, { claude: 'Read by Claude, no tools, 1 field blank' }) + groupsCard(ctx, { unread: true })
          }) + (p ? '<div class="holdings-pad"></div>' : '');
          const blocked = ['error', 'noModel', 'empty', 'loading'].includes(st);
          const rail = blocked ? (p ? '' : change({ go: false, sub: 'Nothing selected', rows: [], note: 'Your holdings stay exactly as they are.' })) : (p ? '' : change()) + (p ? '' : `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic('shield', 's18')}</span>Claude only proposes</div><p>It read this scan with no tools and cannot select, edit or approve. Instructions inside a document have no effect.</p></div>`);
          return frame(ctx, { tab: 4, title: 'Preview', back: 'Imports', actions: tb('info', 'About this preview'), body, rail, accessory: p && !blocked ? pending() : '' });
        }
      }, {
        id: 'a-approve', title: 'Approve exactly this', na: naApprove,
        note: 'Bound to the rows, the hash and the ledger revision you saw. By now the price is confirmed and the listing chosen, so three groups are selected. Face ID alone does not count: the server checks a fresh sign-in.',
        render: ctx => frame(ctx, { tab: 4, title: 'Preview', back: 'Imports', body: ctx.state === 'empty' ? draftHead(ctx) + groupsCard(ctx, { off: true }) : draftHead(ctx, { rev: ctx.state === 'abstention' ? 5 : 6, claude: 'Read by Claude, no tools, your checks done' }) + groupsCard(ctx, { resolved: true, unread: ctx.state === 'abstention' }), sheet: approveSheet(ctx) })
      }, {
        id: 'a-done', title: 'Committed, and how to correct it', na: { noModel: 'A commit reads your approval and your rows. It uses no model, so a missing model cannot touch this screen.' },
        note: 'All of it or none of it: nobody sees a part. A correction keeps the original and links its inverse. Offline shows a lost response, resolved by reading the receipt, never by a second commit.',
        render: ctx => {
          const body = region(ctx, {
            ok: () => receipt(ctx),
            loading: () => `<div class="card state" data-mo="card">${fileHead(`<span class="chip"><span class="spin" aria-hidden="true"></span>Committing</span>`)}<p>Your holdings stay at revision 212 until all 9 rows are ready. Nobody sees a part of it.</p>${steps(2).replace('Received', 'Staged').replace('Checked', 'Sealed').replace('Reading', 'Publishing').replace('Ready', 'Done')}</div>`,
            empty: () => stateCard('x', 'Draft cancelled', 'Nothing was committed, and your ledger stays at revision 212. The original stays, so you can start again.', btn('Back to Imports', 'tinted sm')),
            error: () => stateCard('alert', 'The commit did not finish', 'Nothing is visible and your ledger stays at revision 212. Retrying repeats the same operation, so it can never commit twice.', btn('Retry safely', 'primary sm', 'refresh')) + stillApproved(),
            stale: () => banner('warn', 'This correction is out of date.', 'Another change reached the ledger first, at revision 214. Refresh it before you approve. Only one change can win.', 'clock') + receipt(ctx),
            offline: () => banner('', 'Connection lost during the commit.', 'The outcome is unknown for now. MyPrediction reads the receipt and the ledger and shows the truth when you reconnect. It never sends a second commit.', 'wifi-off') + `<div class="card state" data-mo="card">${fileHead(ev('old', 'Outcome unknown'))}<p>Last known step: publishing, 21:22. Your holdings show the last confirmed revision, 212.</p></div>`,
            disagreement: () => receipt(ctx) + mismatch(),
            abstention: () => receipt(ctx) + stateCard('split', 'Apple has no single return now', 'These rows add a third change of direction to its cash flows, and two rates now fit: 12% and 19% a year. Neither is picked, and the rest of Apple’s figures stand.', '', ev('amb', 'Ambiguous'))
          });
          const dead = ['loading', 'empty', 'error', 'offline'].includes(ctx.state);
          return frame(ctx, { tab: 4, title: dead ? 'Commit' : 'Committed', back: 'Imports', actions: tb('info', 'About this receipt'), body, rail: dead ? original() : `${correction()}${original()}` });
        }
      }]
    }, {
      id: 'b', name: 'One question at a time',
      why: 'Holdings open by account, because statements arrive by account. An import then asks one thing at a time, under your thumb, and its groups tick off as you answer.',
      cost: 'One more tap to reach a holding, and an instrument held in two accounts shows twice. A statement with many issues means many taps, and the whole picture sits behind All rows.',
      screens: [{
        id: 'b-accounts', title: 'Holdings by account',
        note: 'Each account shows what it holds, its cash and how far its statements reach, and a due statement starts an import. Apple shows twice because it sits in two accounts.',
        render: ctx => {
          const st = ctx.state, p = phone(ctx);
          const cards = () => ACC.map(a => accCard(a, ctx)).join('');
          const body = region(ctx, {
            ok: () => (p ? accSummary(ctx) : '') + cards(),
            loading: () => (p ? accSummary(ctx, { meta: 'Last good 21:15 · refreshing' }) : '') + skel(3) + skel(2),
            empty: () => stateCard('grid', 'No accounts yet', 'An account appears with its first statement or typed entry, once you approve it. MyPrediction never connects to a broker.', btn('Add a statement', 'primary sm')),
            error: () => stateCard('alert', 'Accounts did not load', 'The read failed at 21:14. These are the last good figures, from 20:45.', btn('Try again', 'tinted sm', 'refresh')) + (p ? accSummary(ctx, { meta: 'Last good read 20:45 · not current' }) : '') + cards(),
            stale: () => banner('warn', 'Yahoo is delayed.', 'HSBC last priced 16:35, so the total leaves it out.', 'clock') + (p ? accSummaryPartial(ctx) : '') + cards(),
            offline: () => banner('', 'Offline.', 'Showing accounts from 21:15. Statements wait until you reconnect.', 'wifi-off') + (p ? accSummary(ctx) : '') + cards(),
            noModel: () => banner('', 'No approved model.', 'Forecast ranges and actions are off. Your account figures stand.', 'cube') + (p ? accSummary(ctx) : '') + cards(),
            disagreement: () => banner('', 'Models disagree on Reliance.', 'No action is ranked for it. Its value and account figures stand.', 'split') + (p ? accSummary(ctx) : '') + cards(),
            abstention: () => banner('', 'The model abstained on AstraZeneca.', 'No range shows for it. Its value and account figures stand.', 'ban') + (p ? accSummary(ctx) : '') + cards()
          });
          const rail = p ? '' : st === 'empty' ? toImports(ctx, 'Add your first statement', 'Pick an account, add its statement, and answer what MyPrediction cannot be sure of.') : (st === 'stale' ? accSummaryPartial(ctx) : st === 'loading' ? accSummary(ctx, { meta: 'Last good 21:15 · refreshing' }) : accSummary(ctx)) + coverage(ctx);
          return frame(ctx, { tab: 0, title: 'Accounts', back: 'Portfolio', actions: tb('eye-off', 'Hide amounts'), webActions: `${btn('Add statement', 'tinted sm', 'plus')}${eyeBtn(ctx)}`, body, rail });
        }
      }, {
        id: 'b-one', title: 'One holding, by account',
        note: 'Switch account, or read all of them together. What built this position lists each event with its evidence; a deleted original keeps its ledger event, marked unavailable.',
        render: ctx => { const h = pick(ctx.state); return frame(ctx, { tab: 0, title: h.t, back: 'Accounts', actions: tb('eye-off', 'Hide amounts'), webActions: eyeBtn(ctx), ...holdingB(ctx) }); }
      }, {
        id: 'b-add', title: 'Add a statement, read it',
        note: 'One job on screen. The owner picks how the records arrive, then watches them read. The same refusals as A apply; the upload limit (MP40-Q1) and locked PDFs (MP40-Q2) are open, so those two are labelled proposed.',
        render: ctx => {
          const st = ctx.state, top = STEPB(st === 'default' || st === 'stale' || st === 'noModel' || st === 'abstention' ? 1 : 0);
          const body = top + region(ctx, {
            ok: () => expectCard() + running(ctx),
            loading: () => expectCard() + uploading(),
            empty: () => expectCard() + methods(ctx),
            error: () => failures() + methods(ctx),
            stale: () => expectCard() + reconnecting(),
            offline: () => banner('', 'Offline.', 'Statements need a connection.', 'wifi-off') + interrupted(),
            noModel: () => expectCard() + scansOff() + methods(ctx, { scanNote: 'Paused until the budget renews' }),
            disagreement: () => expectCard() + `<div class="card state" data-mo="card">${fileHead(ev('amb', 'Gap found'))}<p>This statement starts on 4 Oct, and your last one ends on 30 Sep. 3 days are missing. Carry on, and the gap stays visible, or add the missing statement first.</p>${acts(btn('Carry on', 'tinted sm'), btn('Add the missing one', 'plain sm'))}</div>`,
            abstention: () => expectCard() + running(ctx, { at: 3, chip: ev('ok', 'Ready for you'), body: `<p>Claude read 9 of the 11 rows in full. 2 fields are blank, not guessed, and become questions.</p>${acts(btn('Start checking', 'primary sm'))}` })
          });
          const rail = phone(ctx) ? (['default', 'stale', 'abstention', 'disagreement', 'loading'].includes(st) ? methods(ctx) : '') : methods(ctx) + records(false, st === 'offline');
          return frame(ctx, { tab: 4, title: 'Add statement', back: 'Stocks ISA', actions: tb('x', 'Cancel'), body, rail });
        }
      }, {
        id: 'b-check', title: 'Check: one question at a time',
        note: 'A scan read by Claude with no tools. Each low-confidence field, duplicate or unclear listing becomes one question. Answering makes a new revision. Unanswered groups stay visible and unselected, and a duplicate is left out until you say otherwise.',
        render: ctx => {
          const st = ctx.state, p = phone(ctx);
          const answer = `<div class="holdings-bar"><button class="btn sm btn-tinted" type="button">No, edit it</button><button class="btn sm btn-primary" type="button" style="flex:1">Yes, £107.60</button></div>`;
          const body = STEPB(2) + region(ctx, {
            ok: () => qCard(ctx),
            loading: () => stateCard('search', 'Preparing your questions', 'Claude is reading page 3 of 4. Rows appear when they pass their checks, and until then they are nowhere in your holdings.') + skel(2),
            empty: () => stateCard('check', 'No questions, and nothing to commit', 'All 11 rows are already in your ledger. Cancel this draft; the original stays.', btn('Cancel draft', 'tinted sm')),
            error: () => scanFailed(),
            stale: () => banner('warn', 'Your answers need a fresh look.', 'The ledger moved to revision 213. Your 1 answer is kept. Refresh to check the rows again.', 'clock') + acts(btn('Refresh', 'primary sm', 'refresh')) + qCard(ctx),
            offline: () => banner('', 'Offline.', 'Your last answer reached the server at revision 4. The next ones wait until you reconnect.', 'wifi-off') + qCard(ctx),
            noModel: () => scansOff(),
            disagreement: () => mismatch(),
            abstention: () => qCard(ctx, 'abstention')
          });
          const dead = ['loading', 'empty', 'error', 'noModel'].includes(st);
          const rail = dead ? (p ? '' : change({ go: false, sub: 'Nothing selected', rows: [], note: 'Your holdings stay exactly as they are.' })) : groupList({ off: ['stale', 'offline'].includes(st) }) + (p ? '<div class="holdings-pad"></div>' : change());
          return frame(ctx, { tab: 4, title: 'Check 1 of 3', back: 'Stocks ISA', actions: tb('x', 'Cancel'), body, rail, accessory: p && !dead && !['disagreement', 'abstention'].includes(st) ? answer : '' });
        }
      }, {
        id: 'b-approve', title: 'Approve exactly this', na: naApprove,
        note: 'All three questions answered. The sheet is the same in both options, because what you approve is the same: these rows, this hash, this ledger revision, within 15 minutes of a fresh sign-in.',
        render: ctx => frame(ctx, { tab: 4, title: 'Approve', back: 'Stocks ISA', body: STEPB(3) + (ctx.state === 'empty' ? groupList({ off: true }) : groupList({ resolved: true, unread: ctx.state === 'abstention' })), sheet: approveSheet(ctx) })
      }, {
        id: 'b-done', title: 'Committed, and how to reverse it', na: { noModel: 'A commit reads your approval and your rows. It uses no model, so a missing model cannot touch this screen.' },
        note: 'Option A leads with correcting a row; this one leads with reversing the import. Both are always available. Disagreement also shows a reversal refused because a later event depends on these rows.',
        render: ctx => {
          const body = region(ctx, {
            ok: () => receipt(ctx),
            loading: () => `<div class="card state" data-mo="card">${fileHead(`<span class="chip"><span class="spin" aria-hidden="true"></span>Committing</span>`)}<p>Your account stays at revision 212 until all 9 rows are ready. Nobody sees a part of it.</p></div>`,
            empty: () => stateCard('x', 'Nothing was committed', 'You stopped before approving. Your account is unchanged, the draft is cancelled and the original stays.', btn('Back to Stocks ISA', 'tinted sm')),
            error: () => stateCard('alert', 'The commit did not finish', 'Nothing is visible. Retrying repeats the same operation, so it can never commit twice.', btn('Retry safely', 'primary sm', 'refresh')) + stillApproved(),
            stale: () => banner('warn', 'This reversal is out of date.', 'A newer change reached the ledger first, at revision 214. Refresh it before you approve.', 'clock') + receipt(ctx),
            offline: () => banner('', 'Connection lost during the commit.', 'The outcome is unknown for now. MyPrediction reads the receipt when you reconnect, and never sends a second commit.', 'wifi-off') + `<div class="card state" data-mo="card">${fileHead(ev('old', 'Outcome unknown'))}<p>Last known step: publishing, 21:22. Your account shows the last confirmed revision, 212.</p></div>`,
            disagreement: () => receipt(ctx) + mismatch(),
            abstention: () => receipt(ctx) + stateCard('split', 'Apple has no single return now', 'Two rates now fit its cash flows, 12% and 19% a year. Neither is picked, and the rest of Apple’s figures stand.', '', ev('amb', 'Ambiguous'))
          });
          const dead = ['loading', 'empty', 'error', 'offline'].includes(ctx.state);
          const refused = ctx.state === 'disagreement' ? banner('fall', 'Reversal refused.', 'A sale on 1 Nov depends on these units. Approve its correction together with this reversal, or leave both as they are.', 'ban') : '<p>Checked: no later event depends on these rows.</p>';
          return frame(ctx, { tab: 4, title: dead ? 'Commit' : 'Committed', back: 'Stocks ISA', actions: tb('info', 'About this receipt'), body, rail: dead ? original() : `${reversal({ top: refused })}${original()}` });
        }
      }]
    }]
  });
}
