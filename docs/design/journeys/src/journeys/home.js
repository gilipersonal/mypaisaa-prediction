/* Home: what you own first, then the top 5 per segment (MP-153, MP-141, MP-135, MP-144, MP-148).
   Every figure is illustrative. Scores are computed here from their three parts, so a list can be checked by hand. */
(() => {
const isWide = ctx => ctx.kind === 'ipad' || ctx.kind === 'web';
const ORDER = ['uslarge', 'ustech', 'n50', 'midcap', 'usetf', 'uketf', 'inetf', 'metals'];
const CCY = { XNAS: 'USD', ARCX: 'USD', XLON: 'GBP', XNSE: 'INR' };
/* each market's own price time and source. HSBC alone is late: 14:10, before the 16:35 UK close. */
const PRICE = { XNAS: ['21:00', 'Twelve Data'], ARCX: ['21:00', 'Twelve Data'], XLON: ['16:35', 'Yahoo'], XNSE: ['10:00', 'Yahoo'] };
const SEGP = { uslarge: 'XNAS', ustech: 'XNAS', usetf: 'ARCX', uketf: 'XLON', n50: 'XNSE', midcap: 'XNSE', inetf: 'XNSE' };
const stamp = (h, st) => { const [at, who] = PRICE[h.v], t = h.t === 'HSBA' ? '14:10' : at; return { t: st === 'error' ? `Mon ${t}` : t, who }; };
const held = (t, st) => st !== 'empty' && !!byT[t];
const INDIA = ['n50', 'midcap', 'inetf'];
/* who abstains and who splits, by horizon: 0 is 3 months, 1 is 6, 2 is 12. Forecast keeps the same table, and a check holds the two equal. No other name. */
const OUT = { abstention: { AZN: 1, AAPL: 2 }, disagreement: { RELIANCE: 1, AAPL: 0 } };
const isOut = (st, t, hz) => !!OUT[st] && OUT[st][t] === hz;

/* the horizon a holding is read at: 3, 6 or 12 months, scaled from the shared 6-month range for this page */
const HZ = [{ s: '3M', n: '3-month', f: .5 }, { s: '6M', n: '6-month', f: 1 }, { s: '12M', n: '12-month', f: 2 }];
const atHz = (h, i = 1) => { const f = HZ[i].f, q = Math.sqrt(f), r = v => +v.toFixed(1), m = h.med * f; return { ...h, med: r(m), lo: r(m - (h.med - h.lo) * q), hi: r(m + (h.hi - h.med) * q), lo50: r(m - (h.med - h.lo50) * q), hi50: r(m + (h.hi50 - h.med) * q) }; };
function rangeAt(h, i = 1, w = 150, ht = 16, split = false) {
  if (i === 1 && !split) return range(h, w, ht);
  const f = atHz(h, i), x = v => ((v + 24) / 80) * w, y0 = 3, y1 = ht - 3, ym = ht / 2;
  return `<svg class="cx" viewBox="0 0 ${w} ${ht}" width="100%" height="${ht}" preserveAspectRatio="none" role="img" aria-label="${HZ[i].n} forecast: ${split ? 'split, no median stands' : `median ${pct(f.med)}`}, 80% range ${pct(f.lo)} to ${pct(f.hi)}" style="height:${ht}px"><rect x="0" y="${ym - 1}" width="${w}" height="2" rx="1" style="fill:var(--surface-3)"/><rect class="b80" x="${x(f.lo)}" y="${y0}" width="${x(f.hi) - x(f.lo)}" height="${y1 - y0}" rx="4"/><rect class="b50" x="${x(f.lo50)}" y="${y0 + 2}" width="${x(f.hi50) - x(f.lo50)}" height="${y1 - y0 - 4}" rx="3"/><rect x="${x(0) - .5}" y="0" width="1" height="${ht}" style="fill:var(--ink-2)"/>${split ? '' : `<rect x="${x(f.med) - 1.25}" y="${y0 - 1}" width="2.5" height="${y1 - y0 + 2}" rx="1.25" style="fill:var(--fc-line)"/>`}</svg>`;
}

/* [ticker, name, growth, protection, opportunity, logo]. US tech has four: the fifth is withheld, nothing fills it. */
const LIST = {
  uslarge: [['JPM', 'JPMorgan Chase', 72, 70, 66, 'JP'], ['JNJ', 'Johnson & Johnson', 58, 80, 60, 'JJ'], ['BRK.B', 'Berkshire Hathaway', 60, 78, 56, 'BH'], ['LLY', 'Eli Lilly', 80, 50, 68, 'EL'], ['XOM', 'Exxon Mobil', 56, 70, 60, 'XO']],
  ustech: [['MSFT', 'Microsoft', 78, 72, 72, 'M'], ['NVDA', 'NVIDIA', 88, 52, 78, 'N'], ['AAPL', 'Apple', 68, 70, 65, 'A'], ['AMZN', 'Amazon', 74, 60, 64, 'Am']],
  n50: [['ICICIBANK', 'ICICI Bank', 76, 70, 70, 'IC'], ['HDFCBANK', 'HDFC Bank', 68, 74, 63, 'HD'], ['TCS', 'Tata Consultancy Services', 62, 74, 60, 'T'], ['INFY', 'Infosys', 64, 66, 60, 'In'], ['SBIN', 'State Bank of India', 66, 56, 61, 'SB']],
  midcap: [['PERSISTENT', 'Persistent Systems', 74, 56, 70, 'PS'], ['MAXHEALTH', 'Max Healthcare', 72, 58, 64, 'MH'], ['FEDERALBNK', 'Federal Bank', 62, 62, 60, 'FB'], ['TATAPOWER', 'Tata Power', 64, 54, 62, 'TP'], ['POLYCAB', 'Polycab India', 60, 54, 60, 'PC']],
  usetf: [['SPY', 'SPDR S&P 500 ETF Trust', 60, 82, 58, 'S'], ['QQQ', 'Invesco QQQ ETF', 72, 62, 66, 'Q'], ['VTI', 'Vanguard Total Stock Market', 58, 78, 58, 'VT'], ['DIA', 'SPDR Dow Jones Industrial', 54, 76, 54, 'DI'], ['IWM', 'iShares Russell 2000', 62, 58, 64, 'IW']],
  uketf: [['VUSA', 'Vanguard S&P 500 UCITS', 60, 78, 58, 'VU'], ['VWRL', 'Vanguard FTSE All-World', 58, 80, 56, 'VW'], ['CNX1', 'iShares NASDAQ 100 UCITS', 70, 60, 62, 'CN'], ['ISF', 'iShares Core FTSE 100', 50, 76, 62, 'IS'], ['VMID', 'Vanguard FTSE 250 UCITS', 52, 66, 60, 'VM']],
  inetf: [['NIFTYBEES', 'Nippon India Nifty 50 BeES', 58, 76, 56, 'NB'], ['BANKBEES', 'Nippon India Bank BeES', 64, 62, 58, 'BB'], ['JUNIORBEES', 'Nippon India Junior BeES', 66, 58, 60, 'JB'], ['ITBEES', 'Nippon India IT BeES', 60, 60, 60, 'IT'], ['MID150BEES', 'Nippon India Midcap 150', 66, 50, 62, 'MB']]
};
const score = r => Math.round(.35 * r[2] + .4 * r[3] + .25 * r[4]);
/* every listed name that is not a holding: its 6-month median and 80% range */
const FC = Object.fromEntries(Object.entries({
  JPM: [6.4, -9.6, 21.2], JNJ: [4.2, -6.4, 14.6], 'BRK.B': [4.8, -7.0, 16.0], LLY: [9.8, -17.4, 33.6], XOM: [3.9, -9.2, 16.4],
  MSFT: [7.0, -8.8, 22.0], AMZN: [6.6, -12.4, 25.1], AVGO: [8.2, -16.0, 30.5],
  ICICIBANK: [8.4, -9.9, 25.6], HDFCBANK: [6.6, -8.7, 21.0], TCS: [5.2, -8.6, 18.4], INFY: [5.6, -10.8, 21.2], SBIN: [6.0, -14.2, 25.4],
  PERSISTENT: [9.4, -15.8, 33.2], MAXHEALTH: [8.6, -14.6, 30.4], FEDERALBNK: [5.8, -12.2, 23.0], TATAPOWER: [6.4, -15.4, 27.2], POLYCAB: [5.4, -15.6, 25.8],
  QQQ: [6.8, -11.6, 24.2], VTI: [4.2, -7.4, 15.4], DIA: [3.6, -7.8, 14.8], IWM: [5.2, -13.8, 23.4],
  VUSA: [4.3, -7.2, 15.2], VWRL: [3.9, -6.8, 14.2], CNX1: [6.6, -12.0, 24.4], ISF: [3.2, -7.6, 13.8], VMID: [3.8, -10.4, 17.6],
  BANKBEES: [5.8, -11.8, 23.2], JUNIORBEES: [6.4, -13.4, 25.8], ITBEES: [5.0, -12.6, 22.4], MID150BEES: [6.8, -16.2, 29.4]
}).map(([t, [med, lo, hi]]) => [t, { med, lo, hi }]));
const K = 0.6745 / 1.2816;
const fcOf = t => { const h = byT[t]; if (h) return h; const f = FC[t]; return { ...f, lo50: +(f.med - (f.med - f.lo) * K).toFixed(1), hi50: +(f.med + (f.hi - f.med) * K).toFixed(1) }; };

/* small modules, all Prism classes */
const sec = (title, right = '') => `<div class="sech home-sech" data-mo="rise"><h3>${title}</h3>${right}</div>`;
const sup = 'Actions are decision support, not advice. MyPrediction places no trades.';
const watch = `<span class="badge">${ic('target', 's16')}Watch</span>`;
const webSearch = ctx => ctx.kind === 'web' ? `<div class="search" style="width:190px">${ic('search', 's18')}Search<kbd>⌘K</kbd></div>` : ctx.kind === 'pwa' ? tb('search', 'Search') : '';
const dim = html => `<div class="home-dim" aria-busy="true">${html}</div>`;
/* the late-price rule: how late a price may be and still count, on every use of it. Billing freshness cites its own question in COST. */
const qLate = '<span class="chip proposed"><span class="dot"></span>Proposed · DATA-DEC-02</span>';
/* a browser's offline copy is an open question; the Apple apps have their own answer */
const q12 = ctx => (ctx.kind === 'web' || ctx.kind === 'pwa' ? ' <span class="chip proposed"><span class="dot"></span>Proposed · MP40-Q12</span>' : '');
/* the month, in the words and figures of the cost journey: one row after the holdings, whichever way Cost is flipped */
const COST = {
  default: ['£46.42 so far, up to £59.73 of the £100 ceiling', 'On plan'],
  loading: ['Last good: £46.42 so far, up to £59.73 of the £100 ceiling', 'Refreshing · last good 21:15'],
  empty: ['£27.84 so far, up to £59.73 of the £100 ceiling', 'New month'],
  error: ['£44.40 last reconciled, up to £59.73 estimated, of the £100 ceiling', 'Collector failed'],
  stale: ['£46.42 so far, up to £59.73 of the £100 ceiling', 'Billing 39 h old · Proposed · MP40-Q6'],
  offline: ['£46.42 so far, up to £59.73 of the £100 ceiling', 'Offline · from 21:15'],
  noModel: ['£39.02 so far, forecast £46.48 of the £100 ceiling', 'Claude off'],
  disagreement: ['£46.73 with the bill, up to £60.04 of the £100 ceiling', 'Estimate and bill differ'],
  abstention: ['£39.36 known so far of the £100 ceiling, forecast not shown', 'Claude unknown · Proposed · MP40-Q5']
};
const costRow = ctx => { const c = COST[ctx.state] || COST.default; return `<button class="card home-link" type="button" data-mo="card">${ic('layers', 's18')}<span>Running cost<small>${c[0]}</small><small>${c[1]}</small></span>${ic('chev-r', 's18')}</button>`; };

/* ---------- holdings ---------- */
const flagChip = st => (st === 'stale' ? `<span class="chip stale">${ic('clock', 's14')}Stale: last price 14:10 (Yahoo)</span><span class="home-sub">Left out of the total until its price returns.</span>${qLate}` : `<span class="chip stale">${ic('clock', 's14')}Late: last price 14:10 (Yahoo)</span>${qLate}`);
function hRow(h, o = {}) {
  const st = o.state, flag = h.t === 'HSBA', [l, p] = h.val.split('.'), s = stamp(h, st), hz = o.hz ?? 1, f = atHz(h, hz);
  const fl = o.fl !== undefined ? o.fl : `<div class="rangewrap">${rangeAt(h, hz, 150, 16, o.split)}</div><span class="fcv">${o.split ? `${pct(f.lo)} to ${pct(f.hi)}` : pct(f.med)} · ${HZ[hz].s}</span>${o.act !== undefined ? o.act : badge(h.act)}`;
  return `<div class="hrow${o.sel ? ' sel' : ''}${flag ? ' is-stale' : ''}" role="button" tabindex="0" data-mo="rise">${logo(h.c, h.lg)}
    <div style="min-width:0"><div class="nm">${h.n}</div><div class="tk home-tk">${h.t} · ${CCY[h.v]} · ${s.who} ${s.t}</div></div>
    <div class="vv"><div class="val">£${l}<span class="pp">.${p}</span></div>${flag ? `<span class="chg" style="color:var(--warn);font-size:12px;line-height:16px">${ic('clock', 's14')}${s.t}</span>` : chg(h.day)}</div>
    <div class="fl">${fl}</div>${o.chip ? `<div class="stalenote home-flag">${o.chip}</div>` : ''}${flag ? `<div class="stalenote home-flag">${flagChip(st)}</div>` : ''}</div>`;
}
/* a table keeps its table: the row's name is the real control, and it reaches across the row */
const nameBtn = (h, name, sub, raw) => `<button class="home-rowbtn" type="button"><span class="inst">${logo(h.c, h.lg, true)}<span class="home-nm"><b>${name}</b>${raw ? sub : `<span>${sub}</span>`}</span></span></button>`;
const dataCell = (h, st) => { const s = stamp(h, st); return `<div class="small" style="font-size:12px;line-height:16px">${s.t}<div class="muted">${s.who}${h.t === 'HSBA' ? ` · ${st === 'stale' ? 'stale' : 'late'}` : ''}</div></div>`; };
function hTr(h, o = {}) {
  const st = o.state, flag = h.t === 'HSBA', s = stamp(h, st), hz = o.hz ?? 1, f = atHz(h, hz);
  const fc = o.fl !== undefined ? o.fl : `<div style="display:flex;align-items:center;gap:6px"><span style="width:40px;color:var(--fc-ink);font-weight:600;text-align:right">${pct(f.med)}</span><span style="width:70px;display:block">${rangeAt(h, hz, 70, 14)}</span></div><div class="small muted" style="padding-left:46px;font-size:12px;line-height:16px">${pct(f.lo)} to ${pct(f.hi)}</div>`;
  return `<tr class="${o.sel ? 'sel' : ''}" data-mo="rise"><td>${nameBtn(h, h.n, `${h.t} · ${CCY[h.v]}`)}</td><td class="r"><div style="font-weight:600">£${h.val}</div>${flag ? `<span class="chg" style="color:var(--warn)">${ic('clock', 's14')}${s.t}</span>` : chg(h.day)}</td><td>${fc}</td><td>${o.act !== undefined ? o.act : badge(h.act)}</td><td>${dataCell(h, st)}</td></tr>`;
}
function pTr(h, o = {}) {
  const st = o.state, flag = h.t === 'HSBA', s = stamp(h, st), hz = o.hz ?? 1, f = atHz(h, hz);
  const fc = o.fl !== undefined ? o.fl : `<div style="color:var(--fc-ink);font-weight:600">${pct(f.med)}</div><div style="width:64px;margin-left:auto">${rangeAt(h, hz, 64, 12)}</div>`;
  return `<tr class="${o.sel ? 'sel' : ''}" data-mo="rise"><td>${nameBtn(h, h.t, `<span>${flag ? `<span style="color:var(--warn);font-weight:600">${st === 'stale' ? 'Stale' : 'Late'}</span>` : chg(h.day)}</span><span class="home-fresh">${CCY[h.v]} · ${s.who} ${s.t}</span>`, true)}</td><td class="r" style="font-weight:600">£${h.val.split('.')[0]}</td><td class="r">${fc}</td><td>${o.act !== undefined ? o.act : badge(h.act)}</td></tr>`;
}
/* the rows in one state, on the three forms a holding takes. HSBC's late and stale flags are in the rows themselves. */
const noLabel = '<span class="small muted">No label</span>';
const flagged = {
  noModel: t => (t === 'RELIANCE' || t === 'NIFTYBEES' ? { fl: '<span class="chip proposed"><span class="dot"></span>No approved model · no action</span>', flS: 'No model', flT: 'No model · no action', act: '<span class="small muted">None</span>' } : t === 'NVDA' ? { act: noLabel } : {}),
  disagreement: (t, hz) => (!isOut('disagreement', t, hz) ? {} : { split: true, chip: `<span class="chip">${ic('split', 's14')}${t === 'RELIANCE' ? 'Rules and models disagree' : 'Models split'} · no action</span>`, flS: 'Split', flT: t === 'RELIANCE' ? 'Disagree · no action' : 'Split · no action', act: '<span class="small muted">None</span>' }),
  abstention: (t, hz) => (isOut('abstention', t, hz) ? { fl: `<span class="chip">${ic('ban', 's14')}Abstained · no range shown</span>`, flS: 'Abstained', flT: 'Abstained · no range', act: '<span class="small muted">None</span>' } : {})
};
const mods = (ctx, t) => (flagged[ctx.state] ? flagged[ctx.state](t, ctx.hz ?? 1) : {});
const rowOf = (ctx, h, sel) => ({ ...mods(ctx, h.t), ...(ctx.over || {})[h.t], sel: h.t === sel, state: ctx.state, hz: ctx.hz });
/* the row behind a suggested action says what its sheet says */
const sheetOver = st => ({ empty: { NVDA: { act: '<span class="small muted">None</span>' } } }[st]);
const rangeLine = (h, hz) => { const f = atHz(h, hz); return `<div class="small muted" style="font-size:12px;line-height:16px;white-space:normal">${pct(f.lo)} to ${pct(f.hi)}</div>`; };
const dayWord = st => (st === 'error' ? 'Monday' : 'today');
const lateFoot = st => `<div class="t5foot home-flag">${flagChip(st)}</div>`;
function ledgerPhone(ctx, sel) {
  return `<div class="list card" style="margin:0">${H.map(h => hRow(h, rowOf(ctx, h, sel))).join('')}</div>`;
}
function ledgerDesk(ctx, sel) {
  const hz = ctx.hz ?? 1;
  return `<div class="card" data-mo="card"><table class="ht dk"><thead><tr><th>Instrument</th><th class="r">Value, ${dayWord(ctx.state)}</th><th>${HZ[hz].n} forecast${hz === 2 ? '<br>Exploratory' : ''}</th><th>Action</th><th>Data</th></tr></thead><tbody>${H.map(h => { const m = rowOf(ctx, h, sel); return hTr(h, { ...m, fl: m.flT !== undefined ? `<span class="small">${m.flT}</span>${m.split ? rangeLine(h, hz) : ''}` : undefined }); }).join('')}</tbody></table>${lateFoot(ctx.state)}</div>`;
}
function ledgerPwa(ctx, sel, open = '') {
  return `<div class="card" data-mo="card"><table class="ht pwa"><thead><tr><th>Holding</th><th class="r">Value</th><th class="r">${HZ[ctx.hz ?? 1].s}</th><th>Action</th></tr></thead><tbody>${H.map(h => { const m = rowOf(ctx, h, sel); return pTr(h, { ...m, fl: m.flS !== undefined ? `<span class="small">${m.flS}</span>${m.split ? rangeLine(h, ctx.hz ?? 1) : ''}` : undefined }) + (h.t === sel ? open : ''); }).join('')}</tbody></table>${lateFoot(ctx.state)}</div>`;
}
const ledger = (ctx, sel) => (isWide(ctx) ? ledgerDesk : ctx.kind === 'pwa' ? ledgerPwa : ledgerPhone)(ctx, sel);
const hzNote = (hz = 1) => (hz === 2 ? `<div class="home-sub"><span class="chip proposed"><span class="dot"></span>Exploratory</span> 12 months rests on 11 non-overlapping blocks, under the 20 a claim needs.</div>` : '');
const holdingsNote = {
  loading: () => banner('', 'Refreshing.', 'The last good rows from 21:15 stay here, with their ranges and flags, until the run lands.', 'refresh'),
  error: () => banner('fall', 'Holdings did not refresh.', 'Twelve Data failed at 21:14. Last good run Mon 21:15 · cutoff 21:00. Every row below is from that one version.', 'alert') + `<div>${btn('Try again', 'tinted', 'refresh')}</div>`,
  stale: () => banner('warn', '1 of 7 rows is stale.', `HSBC is past the freshness limit, so it leaves the total: £78,508.20 known, 6 of 7 priced. Its forecast stays held and its action stays Pause until its price returns. ${qLate}`, 'clock'),
  offline: ctx => banner('', 'Offline.', `Holdings from 21:15, saved on this device. Nothing here is fresh analysis until you reconnect.${q12(ctx)}`, 'wifi-off'),
  noModel: () => banner('', 'No approved model covers India yet.', 'Reliance and the Nifty ETF keep their value and price, with no range and no action.', 'cube'),
  disagreement: () => banner('', 'Two holdings are split.', 'At 6 months the rules and the model disagree on Reliance. At 3 months the models split on Apple. Each shows its range and no median there, and no action is ranked there.', 'split'),
  abstention: () => banner('', 'Two holdings abstained.', 'AstraZeneca at 6 months and Apple at 12 months have too little comparable history for a calibrated range, so neither shows one there.', 'ban')
};
function holdings(ctx, sel) {
  const list = () => ledger(ctx, sel);
  return region(ctx, {
    what: 'Holdings',
    ok: list,
    loading: () => holdingsNote.loading() + dim(list()),
    empty: () => stateCard('grid', 'No holdings yet', 'Add what you hold and MyPrediction starts watching it. It never connects to a broker.', btn('Add a holding', 'primary', 'plus')),
    error: () => holdingsNote.error() + list(),
    stale: () => holdingsNote.stale() + list(),
    offline: () => holdingsNote.offline(ctx) + list(),
    noModel: () => holdingsNote.noModel() + list(),
    disagreement: () => holdingsNote.disagreement() + list(),
    abstention: () => holdingsNote.abstention() + list()
  });
}

/* ---------- value ---------- */
const META = {
  default: 'As of 21:15 London · data cutoff 21:00 · 7 of 7 priced', loading: 'Refreshing · showing 21:15', error: 'Last good run Mon 21:15 · cutoff 21:00', stale: 'HSBC, £6,104.20 at 14:10, is left out until its price returns. As of 21:15 London · data cutoff 21:00', offline: 'Saved 21:15 · not updating'
};
const metaOf = ctx => META[ctx.state] || 'As of 21:15 London · data cutoff 21:00';
const valOf = st => (st === 'stale' ? { label: 'Known value, 6 of 7 priced', amt: '78,508.20' } : { label: 'Portfolio value', amt: '84,612.40' });
/* HSBC out of the total: the shares of what is left */
const allocOf = st => (st === 'stale' ? alloc().replace(/53\.4/g, '57.6').replace(/28\.5/g, '30.7').replace(/18\.1/g, '11.7') : alloc());
const dayLine = (ctx, txt) => (ctx.state === 'stale' ? '' : `${chg(1, txt)} <span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">${dayWord(ctx.state)}</span>`);
function value(ctx) {
  const st = ctx.state, v = valOf(st);
  if (st === 'empty') return '';
  if (isWide(ctx)) return `<div class="card" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:20px;align-items:center;padding:14px 16px" data-mo="card"><div><div class="label">${v.label}</div><div style="margin-top:6px">${money(v.amt, 34)}</div><div style="margin-top:6px;font-size:13px;line-height:18px;letter-spacing:0;white-space:nowrap">${dayLine(ctx, '+£1,236.18 (1.48%)')}</div></div><div style="min-width:0"><div class="small muted" style="margin-bottom:8px">${metaOf(ctx)}</div>${allocOf(st)}</div></div>`;
  return `<div class="card valcard" data-mo="card"><div class="top"><span class="label">${v.label}</span>${illus()}</div>${money(v.amt, ctx.kind === 'pwa' ? 38 : 44)}${st === 'stale' ? '' : `<div class="d">${dayLine(ctx, '+£1,236.18 (1.48%)')}</div>`}<div class="meta">${metaOf(ctx)}</div><div style="margin-top:14px">${allocOf(st)}</div></div>`;
}

/* ---------- the brief, as it surfaces on home ---------- */
const BL = {
  default: ['Today\'s brief · 07:30', '3 actions · 2 risks · 2 changes'],
  loading: ['Today\'s brief · 07:30', 'Stays readable while prices refresh'],
  empty: ['First brief tomorrow', 'Due 07:30 London'],
  error: ['Plain brief · 07:30', 'Code wrote it: the text route failed'],
  stale: ['Late brief · issued 09:12', 'MyPrediction was down at 07:30'],
  offline: ['Saved brief · 07:30', 'Readable offline, not updating'],
  noModel: ['Today\'s brief · 07:30', 'India is rules only: no approved model'],
  disagreement: ['Today\'s brief · 07:30', '3 actions · 2 conflicts'],
  abstention: ['Today\'s brief · 07:30', '3 actions · 2 abstentions']
};
const briefPill = ctx => { const b = BL[ctx.state]; return `<button class="home-pill" type="button">${ic('clock', 's18')}<span class="home-pt"><b>${b[0]}</b><span class="t">${b[1]}</span></span>${ic('chev-r', 's18')}</button>`; };
const stamps = () => `<div class="home-stamps">${['US closed Mon 21:00', 'UK closed Mon 16:35', 'India closed Mon 10:00'].map(s => `<span class="chip" data-mo="chip">${s}</span>`).join('')}</div>`;
const ACTS = [['NVDA', 'Trim', () => 'Widest 80% range of the holdings, and 13.5% of the portfolio.'], ['SPY', 'Add', () => 'Among the narrowest 80% ranges of the holdings: −7.1% to +15.2%.'], ['HSBA', 'Pause', st => `${st === 'stale' ? 'Last price 14:10, past the freshness limit. Out of the total until its price returns.' : 'Last price 14:10, before the 16:35 UK close. Late but inside the limit, so its forecast is held.'} ${qLate}`]];
const actRows = (ctx, n = 3) => {
  const skip = ctx.state === 'disagreement' ? 'RELIANCE' : ctx.state === 'abstention' ? 'AZN' : '', tick = t => (ctx.tick ? ` · ${t}` : '');
  const rows = ACTS.slice(0, n).map(([t, a, why]) => `<div class="home-act" role="button" tabindex="0" data-mo="rise">${mods(ctx, t).act ?? badge(a)}<b>${byT[t].n}${tick(t)}</b><span class="home-sub">${why(ctx.state)}</span></div>`).join('');
  const extra = skip === 'RELIANCE' ? `<div class="home-act" role="button" tabindex="0" data-mo="rise"><span class="chip">${ic('split', 's14')}Split</span><b>Reliance${tick('RELIANCE')}</b><span class="home-sub">Rules and models disagree, so no action is ranked.</span></div>` : skip === 'AZN' ? `<div class="home-act" role="button" tabindex="0" data-mo="rise"><span class="chip">${ic('ban', 's14')}None</span><b>AstraZeneca${tick('AZN')}</b><span class="home-sub">The model abstained at 6 months, so no action is ranked.</span></div>` : '';
  return rows + extra;
};
function briefCard(ctx) {
  const b = BL[ctx.state];
  const body = {
    empty: '<p class="home-sub">The brief starts the morning after your first holdings are in. Each market keeps its own timestamp.</p>',
    noModel: '<p class="home-sub">No approved model covers India, so its items carry the rules with their heuristic strength and no ranges.</p>'
  }[ctx.state] || '';
  return `<div class="card home-card" data-mo="card"><div style="display:flex;align-items:center;gap:8px">${ic('clock', 's18')}<h4 style="flex:1">${b[0]}</h4></div><p class="home-sub">${b[1]}</p>${ctx.state === 'empty' ? '' : stamps()}${body}${ctx.state === 'empty' ? '' : `<button class="btn sm btn-tinted" type="button">Open the brief</button>`}</div>`;
}
function briefBody(ctx) {
  const st = ctx.state;
  const head = `<div class="card home-card" data-mo="card"><div class="label">Tuesday 3 November · issued 07:30 London</div><p class="home-sub">Each market keeps its own time. ${st === 'noModel' ? 'Figures come from code. Claude is off, so code wrote the words too.' : st === 'error' ? 'Figures come from code. The writing route failed, so code wrote the words too.' : 'Figures come from code; Claude writes the words, and every figure it quotes has a source.'}</p>${stamps()}</div>`;
  const section = (t, html) => `<div class="card home-card" data-mo="card"><h4>${t}</h4>${html}</div>`;
  const acts = section('Actions · decision support', actRows(ctx));
  const risks = section('Risks', `<ul class="home-ul"><li><b>US tech is 31.0%</b> of the portfolio, the largest single block.</li><li><b>The rupee</b> moved 0.6% against the pound, which moves 28.5% of the value.</li></ul>`);
  const changes = section('Changes', `<ul class="home-ul"><li><b>NVDA</b> rose to 2nd in US tech, from 3rd.</li>${st === 'noModel' ? '<li><b>Nifty 50</b> is not ranked: no approved model covers India.</li>' : '<li><b>ICICIBANK</b> leads Nifty 50 at 72, up from 69.</li>'}</ul>`);
  const events = section('Upcoming', `<ul class="home-ul"><li><b>Thu 5 Nov</b> Bank of England rate decision.</li><li><b>Fri 6 Nov</b> US jobs report.</li></ul><p class="home-sub">Dated by when they become known. Illustrative.</p>`);
  const all = { left: head + acts + risks, right: changes + events };
  const lead = {
    error: banner('warn', 'Plain brief.', 'The writing route failed at 07:29, so code issued this from stored figures. Nothing is missing, only the words are plainer.', 'alert'),
    stale: banner('warn', 'Late.', 'MyPrediction was down at 07:30, so this was issued at 09:12, once. Timestamps are from the last eligible close.', 'clock'),
    offline: banner('', 'Saved copy.', `This brief reached the device at 07:31. Nothing updates until you reconnect.${q12(ctx)}`, 'wifi-off'),
    noModel: banner('', 'India is rules only.', 'No approved model covers India, so its items come from rules, labelled heuristic, with no ranges.', 'cube'),
    disagreement: banner('', 'One conflict moves an action.', 'Rules and models disagree on Reliance at 6 months. It is listed, with no action ranked. The models also split on Apple at 3 months, which moves no action here.', 'split'),
    abstention: banner('', 'One abstention moves an action.', 'The model abstained on AstraZeneca at 6 months, so it carries no action this morning. Apple abstained at 12 months, which moves no action here.', 'ban')
  }[st] || '';
  if (st === 'loading') return { left: `<div class="card home-card" data-mo="card"><div class="label">Issuing 07:30 brief</div><p class="home-sub">Reading the stored close for each market. Yesterday's brief stays readable below.</p><span class="sk" style="height:14px;width:80%"></span><span class="sk" style="height:14px;width:60%"></span></div>` + section('Yesterday, 07:30 · decision support', `<ul class="home-ul"><li><b>Hold</b> Apple: median +6.2% at 6 months, 80% range −9.8% to +21.4%.</li><li><b>Add</b> Reliance: median +7.4% at 6 months, 80% range −12.0% to +24.9%.</li></ul>`), right: '' };
  if (st === 'empty') return { left: stateCard('clock', 'No brief yet', 'Your first brief arrives at 07:30 London tomorrow, with actions first, then risks, changes and upcoming events.', ''), right: '' };
  return { left: lead + all.left, right: all.right };
}

/* ---------- the top 5 board ---------- */
/* which part an abstained horizon takes: MP-135 feeds growth and protection from the same forecasts, and only growth is drawn missing */
const qParts = '<span class="chip proposed"><span class="dot"></span>Proposed · MP-135</span>';
/* a split on a list: the list reads 6 months, so the score, the range and the action stand */
const FLAG = { disagreement: { AAPL: 'split at 3 months' } };
/* an abstained horizon takes a part from the score, so the name is not ranked (POLICY-006). AstraZeneca is on no list. */
const DROP = { abstention: { ustech: 'AAPL' } };
const rowsOf = (k, st) => LIST[k].filter(r => r[0] !== (DROP[st] || {})[k]);
const NR = {
  ustech: [['AVGO', 'Broadcom', 'Bc', 72, 61, '–', 'Opportunity not eligible']],
  abstention: { ustech: [['AAPL', 'Apple', 'A', '–', 70, 65, 'Growth abstained at 12 months']] }
};
const nrOf = (k, st) => [...(NR[k] || []), ...((NR[st] || {})[k] || [])];
const whyGap = (k, st) => { const skip = (DROP[st] || {})[k]; return skip ? `Withheld: ${skip} lost its growth part, and nothing fills the gap` : 'Withheld: no other eligible listing'; };
const rankLine = st => (st === 'empty' ? '' : `Ranked ${st === 'error' ? '2' : '3'} Nov · policy v1 · decision support`);
function tileRows(k, st, noHold) {
  const skip = (DROP[st] || {})[k], rows = rowsOf(k, st), mine = t => !noHold && held(t, st);
  const li = rows.map((r, i) => `<li><span class="rk">${i + 1}</span><span class="tk">${r[0]}${mine(r[0]) ? `<span class="sr">, you hold it</span>${ic('check', 's14')}` : ''}${(FLAG[st] || {})[r[0]] ? `<span class="sr">, ${FLAG[st][r[0]]}</span>${ic('split', 's14')}` : ''}</span><b>${score(r)}</b></li>`).join('');
  const gaps = rows.length < 5 ? `<li class="wh"><span class="rk">${rows.length + 1}</span><span class="tk">${skip ? `${skip} abstained` : 'Withheld'}</span><b>–</b></li>` : '';
  return `<ol>${li}${gaps}</ol>`;
}
const quoteAt = st => (st === 'offline' ? 'saved 21:15' : st === 'error' ? 'Mon 21:00' : '21:00');
function bTile(k, st, sm, noHold) {
  const s = SEG[k];
  let body;
  if (k === 'metals') body = `<p class="un">${ic('ban', 's14')}Forecast unavailable</p><ol><li><span class="rk">–</span><span class="tk">Gold</span><b class="home-px">$2,684</b></li><li><span class="rk">–</span><span class="tk">Silver</span><b class="home-px">$31.72</b></li></ol><p class="tm">${sm ? 'Not ranked (SCI-D08)' : 'Not ranked until a valuation convention is set (SCI-D08).'}</p>`;
  else if (st === 'empty') body = `<p class="tm">First list after the first daily run.</p>`;
  else if (st === 'noModel' && INDIA.includes(k)) body = `<p class="un">${ic('cube', 's14')}No approved model</p><p class="tm">Not ranked until one covers India at 3 to 12 months.</p>`;
  else body = tileRows(k, st, noHold);
  const [t, who] = k === 'metals' ? [] : PRICE[SEGP[k]];
  const foot = k === 'metals' ? `<p class="tm">Quote ${quoteAt(st)} · Source open (SCI-D08)</p>` : st === 'empty' ? '' : `<p class="tm">${st === 'offline' ? 'Saved 21:15' : st === 'error' ? `Ranked 2 Nov · ${who} Mon ${t}` : `${who} ${t}`}</p>`;
  return `<div class="segtile home-tile${st === 'loading' ? ' home-tdim' : ''}" style="--c:var(${s.c})" role="button" tabindex="0" data-mo="card"><span class="mk">${s.mk}</span><div class="tn">${s.name}</div>${body}${foot}</div>`;
}
const board = (ctx, sm) => `<div class="home-board${isWide(ctx) ? ' w4' : ''}${sm ? ' sm' : ''}">${ORDER.map(k => bTile(k, ctx.state, sm, ctx.nohold)).join('')}</div>`;
const boardNote = {
  loading: () => banner('', 'Re-ranking.', 'The last good lists stay here until the daily run lands.', 'refresh'),
  empty: () => stateCard('grid', 'No lists yet', 'The top 5 are ranked after each daily forecast run. Until the first run, no list and no score exists.'),
  error: () => banner('fall', 'Today\'s ranking run failed.', 'The lists from 2 November stay current, with their date, until a run succeeds.', 'alert'),
  stale: () => banner('warn', 'HSBC is stale.', `Its last price is 14:10. It is in none of these lists, so they stand as ranked until its price returns. ${qLate}`, 'clock'),
  offline: ctx => banner('', 'Offline.', `Lists from 21:15, saved on this device.${q12(ctx)}`, 'wifi-off'),
  noModel: () => banner('', 'India is not ranked.', 'No approved model covers India yet, so the Nifty 50, India midcap and India ETF lists wait. A missing part is never zero.', 'cube'),
  disagreement: () => banner('', 'One name is split.', `The models split on Apple at 3 months, so no median stands there. Its 6-month figures and its score stand. Reliance is on none of these lists. ${qParts}`, 'split'),
  abstention: () => banner('', 'One name lost a part.', `Apple lost its growth part when the model abstained at 12 months, so it shows as not ranked, and nothing fills the gap. AstraZeneca is on none of these lists. ${qParts}`, 'ban')
};
const noteOf = ctx => (boardNote[ctx.state] ? boardNote[ctx.state](ctx) : '');
const legendT = (st, noHold) => `<div class="legend">${noHold || st === 'empty' ? '' : `<span>${ic('check', 's14')}You hold it</span>`}<span>Score out of 100</span><span>Ranked on 3 to 12 months, re-ranked daily</span>${rankLine(st) ? `<span>${rankLine(st)}</span>` : ''}<span>Illustrative</span></div>`;
const rule = () => `<div class="card home-card" data-mo="card"><h4>How a list is made</h4><p class="home-sub">Score = growth 35% + protection 40% + opportunity 25%, shown only when all three are eligible. A missing part is never zero, and never reweighted: that name is not ranked.</p><div class="t5r withheld" style="padding:4px 0;grid-template-columns:18px 30px minmax(0,1fr)"><span class="rk">–</span><span class="logo sm" style="background:var(--surface-3);color:var(--ink-2)">${ic('ban', 's14')}</span><div class="tt">A withheld score reads "Not ranked", with the parts it has.</div></div></div>`;

/* ---------- one segment: every name with its median, 80% range and freshness ---------- */
const SEGSUB = { ustech: 'Nasdaq-100 technology names' };
const segHead = k => { const s = SEG[k]; return `<div class="t5h" style="--c:var(${s.c})"><h4>Top 5 · ${s.name}</h4><p>${SEGSUB[k] || s.note} · ranked on 3 to 12 months · re-ranked daily</p></div>`; };
const rankFoot = (k, st) => { const [t, who] = PRICE[SEGP[k]]; return `<div class="t5foot">${rankLine(st)} · ${who} ${st === 'error' ? 'Mon ' : ''}${t}. Illustrative.</div>`; };
const actOf = (t, st) => mods({ state: st }, t).act ?? (byT[t] ? badge(byT[t].act) : watch);
const splitWord = (t, st) => ((FLAG[st] || {})[t] ? ` · ${FLAG[st][t]}` : '');
const rangeText = f => `80% range ${pct(f.lo)} to ${pct(f.hi)}`;
const pxLine = (k, st) => { const [t, who] = PRICE[SEGP[k]]; return `${who} ${st === 'error' ? 'Mon ' : ''}${t}`; };
function segPhone(k, st) {
  const list = rowsOf(k, st);
  const rows = list.map((r, i) => { const f = fcOf(r[0]); return `<div class="t5r home-t5" role="button" tabindex="0" data-mo="rise"><span class="rk">${i + 1}</span>${logo(SEG[k].c, r[5], true)}<div class="tt">${r[0]}<span>${r[1]}${held(r[0], st) ? ' · You hold it' : ' · Candidate'}${splitWord(r[0], st)}</span></div><div class="score" role="img" aria-label="Score ${score(r)} of 100"><b>${score(r)}</b><i><u data-mo="barx" style="--v:${score(r)}%"></u></i></div>
    <div class="home-parts">Growth ${r[2]} · Protection ${r[3]} · Opportunity ${r[4]}</div>
    <div class="home-fl"><div class="rangewrap">${range(f)}</div><span class="fcv">${pct(f.med)} · 6M</span>${actOf(r[0], st)}</div>
    <div class="home-parts">${rangeText(f)} · ${pxLine(k, st)}</div></div>`; }).join('');
  return rows + (list.length < 5 ? withheld(k, st, list.length + 1) : '') + nrOf(k, st).map(n => notRanked(k, n)).join('');
}
const withheld = (k, st, n) => `<div class="t5r withheld" data-mo="rise"><span class="rk">${n}</span><span class="logo sm" style="background:var(--surface-3);color:var(--ink-2)">${ic('ban', 's14')}</span><div class="tt" style="grid-column:3/5">${whyGap(k, st)}</div></div>`;
const notRanked = (k, n) => `<div class="t5r home-t5" role="button" tabindex="0" data-mo="rise"><span class="rk">–</span>${logo(SEG[k].c, n[2], true)}<div class="tt">${n[0]}<span>${n[1]} · ${byT[n[0]] ? 'You hold it' : 'Candidate'}</span></div><div class="home-nr">Not ranked</div><div class="home-parts">Growth ${n[3]} · Protection ${n[4]} · Opportunity ${n[5] === '–' ? 'not eligible' : n[5]}</div></div>`;
function segTable(k, st) {
  const list = rowsOf(k, st);
  const tr = (r, i) => { const f = fcOf(r[0]); return `<tr data-mo="rise"><td class="r">${i + 1}</td><td>${nameBtn({ c: SEG[k].c, lg: r[5] }, r[0], `${held(r[0], st) ? 'You hold it' : 'Candidate'}${splitWord(r[0], st)}`)}</td><td class="home-n"><div class="score" style="grid-template-columns:24px 34px"><b>${score(r)}</b><i><u data-mo="barx" style="--v:${score(r)}%"></u></i></div></td><td class="home-n">${r[2]}</td><td class="home-n">${r[3]}</td><td class="home-n">${r[4]}</td><td><span style="color:var(--fc-ink);font-weight:600">${pct(f.med)}</span><span class="home-range">${range(f, 74, 12)}</span><span class="home-rt">${pct(f.lo)} to ${pct(f.hi)}</span></td><td>${actOf(r[0], st)}</td></tr>`; };
  const nr = n => `<tr data-mo="rise"><td class="r">–</td><td>${nameBtn({ c: SEG[k].c, lg: n[2] }, n[0], byT[n[0]] ? 'You hold it' : 'Candidate')}</td><td><b style="font-weight:600">Not ranked</b></td><td class="home-n">${n[3]}</td><td class="home-n">${n[4]}</td><td class="home-n">${n[5]}</td><td colspan="2"><span class="muted">${n[6]}</span></td></tr>`;
  return `<table class="ht dk home-seg"><thead><tr><th class="r">#</th><th>Listing</th><th>Score</th><th class="home-n">Growth</th><th class="home-n">Protect.</th><th class="home-n">Opport.</th><th>6M, 80% range</th><th>Action</th></tr></thead><tbody>${list.map(tr).join('')}${list.length < 5 ? `<tr data-mo="rise"><td class="r">${list.length + 1}</td><td colspan="7"><span class="muted">${whyGap(k, st)}. Nothing is filled in.</span></td></tr>` : ''}${nrOf(k, st).map(nr).join('')}</tbody></table>`;
}
const metalsCard = st => `<div class="card top5" data-mo="card"><div class="t5h" style="--c:var(--seg-metals)"><h4>Gold &amp; silver</h4><p>Spot quotes · no top 5 yet</p></div>${[['XAU/USD', 'Gold', '$2,684.20', -0.4, 'Au'], ['XAG/USD', 'Silver', '$31.72', 0.9, 'Ag']].map(([t, n, p, d, sym]) => `<div class="t5r" data-mo="rise" style="grid-template-columns:30px minmax(0,1fr) auto"><span class="logo sm" style="--c:var(--seg-metals)" aria-hidden="true">${sym}</span><div class="tt">${n}<span class="home-q">${t} · price only · quote ${quoteAt(st)} · Source open (SCI-D08)</span></div><div style="text-align:right;font:600 15px/20px var(--font-text)">${p}<div style="font-size:13px;line-height:18px">${chg(d)}</div></div></div>`).join('')}<div class="t5foot" style="display:flex;gap:6px;align-items:flex-start">${ic('ban', 's14')}<span>Forecast unavailable: the valuation convention is open (SCI-D08). Neither metal is ranked, and nothing stands in for a score. Source open (SCI-D08).</span></div></div>`;
const indiaWait = () => stateCard('cube', 'No approved model', 'No approved model covers India yet, so this list is not ranked. A missing part is never zero, and prices and holdings still work.');
/* US tech's own line in a state, in the same words on both options */
const TECHSAY = { disagreement: { ustech: ['Apple is split at 3 months.', `The models split there, so no median stands. Its 6-month figures, its score and its action stand. ${qParts}`] }, abstention: { ustech: ['Apple dropped out.', `It lost its growth part when the model abstained at 12 months, so it is not ranked, and nothing fills the gap. ${qParts}`] } };
const listStands = name => banner('', 'This list stands.', `No approved model covers India yet. ${name} has its model, so its ranking is unchanged.`, 'cube');
function segMain(ctx, k = 'ustech') {
  const st = ctx.state, name = SEG[k].name, metals = () => metalsCard(st);
  if (k === 'metals') return region(ctx, {
    what: 'Gold and silver', ok: metals,
    loading: () => banner('', 'Refreshing.', 'The last good quotes from 21:15 stay here until the refresh lands.', 'refresh') + dim(metals()),
    empty: () => stateCard('grid', 'No top 5 yet', 'Gold and silver stay unranked until a valuation convention is set (SCI-D08). Nothing stands in for a list.') + metals(),
    error: () => banner('fall', 'Prices did not refresh.', 'Last good run Mon 21:15 · cutoff 21:00.', 'alert') + `<div>${btn('Try again', 'tinted', 'refresh')}</div>` + metals(),
    stale: () => banner('warn', 'HSBC is stale.', `Gold and silver are not affected, and they stay unranked (SCI-D08). ${qLate}`, 'clock') + metals(),
    offline: () => banner('', 'Offline.', `Quotes from 21:15, saved on this device.${q12(ctx)}`, 'wifi-off') + metals(),
    noModel: () => banner('', 'No model can cover these yet.', 'Gold and silver wait for a valuation convention (SCI-D08), so no forecast and no score exist.', 'cube') + metals()
  });
  const card = () => `<div class="card top5" data-mo="card">${segHead(k)}${isWide(ctx) ? segTable(k, st) : segPhone(k, st)}${rankFoot(k, st)}</div>`;
  const say = (icon, none) => { const b = (TECHSAY[st] || {})[k]; return (b ? banner('', b[0], b[1], icon) : banner('', none[0], none[1], icon)) + card(); };
  return region(ctx, {
    what: 'This list',
    ok: card,
    loading: () => boardNote.loading() + dim(card()),
    empty: () => stateCard('grid', 'No list yet', `${name} is ranked after each daily run. Until the first run there is no list and no score, and nothing stands in for one.`, '', '<span class="chip">Next run tomorrow 21:15</span>'),
    error: () => boardNote.error() + `<div>${btn('Try again', 'tinted', 'refresh')}</div>` + card(),
    stale: () => boardNote.stale() + card(),
    offline: () => boardNote.offline(ctx) + card(),
    noModel: () => (INDIA.includes(k) ? indiaWait() : listStands(name) + card()),
    disagreement: () => say('split', ['No conflict here.', `No name on this ${name} list is split.`]),
    abstention: () => say('ban', ['Nothing dropped out here.', `Every name on this ${name} list kept its three parts.`])
  });
}
function segRail(ctx, k = 'ustech') {
  const st = ctx.state;
  if (k === 'metals') return `<div class="card home-card" data-mo="card"><h4>Why this list waits</h4><p class="home-sub">Gold and silver clear only when you set a valuation instant, a source and a calendar for each spot quote (SCI-D08).</p></div>`;
  if (st === 'empty') return rule();
  if (st === 'noModel' && INDIA.includes(k)) return `<div class="card home-card" data-mo="card"><h4>Why this list waits</h4><p class="home-sub">Growth and protection come from the 3, 6 and 12-month forecasts, so with no approved model neither exists. The list returns when one covers India.</p></div>${rule()}`;
  const r = rowsOf(k, st)[0], f = fcOf(r[0]), mine = held(r[0], st), actText = byT[r[0]] ? byT[r[0]].act : 'Watch';
  const open = (st === 'loading' ? dim : x => x)(`<div class="card home-card" data-mo="card"><div style="display:flex;align-items:center;gap:8px">${logo(SEG[k].c, r[5], true)}<h4 style="flex:1">${r[1]}</h4><span class="chip illus">${mine ? 'Holding' : 'Candidate'}</span></div><div class="home-kv"><span>Score</span><b>${score(r)} · rank 1</b><span>6-month median</span><b>${pct(f.med)}</b><span>80% range</span><b>${pct(f.lo)} to ${pct(f.hi)}</b><span>Action</span><b>${(FLAG[st] || {})[r[0]] ? 'None' : actText} · decision support</b></div>${btn('Open the forecast', 'tinted', 'fan').replace('class="btn', 'class="btn sm')}</div>`);
  return open + rule();
}

/* ---------- a suggested action ---------- */
const sheetT = st => ({ stale: 'HSBA', disagreement: 'RELIANCE', abstention: 'AZN' }[st] || 'NVDA');
function actionSheet(ctx) {
  const st = ctx.state, n = byT.NVDA, hs = byT.HSBA, rel = byT.RELIANCE;
  const shell = (head, html, foot = true) => `<div class="sheet home-sheet" role="dialog" aria-label="Suggested action" data-mo="rise"><div class="grabber"></div>${head}${html}${foot ? `<div class="acts"><button class="btn sm btn-tinted" type="button">Not now</button><button class="btn sm btn-primary" type="button">Record your decision</button></div>` : ''}</div>`;
  const head = (a, name = 'NVIDIA') => `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">${a}<h4 style="flex:1">${name}</h4><span class="chip illus">Decision support</span></div>`;
  const why = `<span class="lab">Why, at 6 months</span><ul class="home-ul"><li>Widest 80% range of the holdings: ${pct(n.lo)} to ${pct(n.hi)}.</li><li>13.5% of the portfolio, inside a US tech block of 31.0%.</li><li>Median ${pct(n.med)}, score 71, rank 2 in US tech.</li></ul>`;
  const unc = `<span class="lab">Uncertainty</span><div style="margin-top:6px">${range(n)}</div>`;
  const cf = `<span class="lab">If it were 10% smaller (computed by code, total unchanged)</span><div class="home-kv"><span>NVIDIA share</span><b>13.5% to 12.1%</b><span>US tech share</span><b>31.0% to 29.6%</b><span>Width of the portfolio's 80% range, 6M</span><b>24.7 to 24.0 pts</b></div>`;
  const ids = (who = 'Growth 88, Protection 52, Opportunity 78 · ') => `<p class="home-sub" style="color:var(--ink);margin-top:10px">Policy v1 · R2-HGB v3 · ${who}3 sources. Illustrative. No trade is placed.</p>`;
  const body = why + unc + cf + ids();
  const noLabel = `<span class="lab">Component evidence</span><div class="home-kv"><span>Growth</span><b>88</b><span>Protection</span><b>52</b><span>Opportunity</span><b>78</b><span>Combined score</span><b>71</b></div>`;
  const azn = `<span class="lab">Component evidence</span><div class="home-kv"><span>Growth</span><b>Abstained</b><span>Protection</span><b>74</b><span>Opportunity</span><b>58</b><span>Combined score</span><b>Withheld</b></div>`;
  return shell(...({
    loading: [head(`<span class="sk" style="height:26px;width:72px"></span>`), `<span class="lab">Reading the last published ranking</span><span class="sk" style="height:14px;width:90%;margin-top:8px"></span><span class="sk" style="height:14px;width:70%;margin-top:6px"></span><p class="home-sub" style="margin-top:10px;color:var(--ink)">Last good 21:15. Its reasons load here, and nothing is guessed.</p>`, false],
    empty: [head(`<span class="chip">${ic('equal', 's14')}No action</span>`), `<p class="lead">Nothing is suggested for NVIDIA today: no action band applies. Its range and score stay on its forecast.</p>`, false],
    error: [head(badge('Trim')), banner('fall', 'Reasons did not load.', 'Last good run Mon 21:15 · cutoff 21:00. The action comes from that run. Its reasons stay hidden rather than guessed.', 'alert') + `<div class="acts"><button class="btn sm btn-tinted" type="button">${ic('refresh', 's16')}Try again</button><button class="btn sm btn-tinted" type="button">Not now</button></div>`, false],
    stale: [head(`<span class="chip stale">${ic('clock', 's14')}Stale</span>`, 'HSBC'), banner('warn', 'This action is stale.', `HSBC's last price is 14:10, past the freshness limit. Pause is held, not current, until its price returns. ${qLate}`, 'clock') + `<span class="lab">Why, at 6 months</span><ul class="home-ul"><li>Last forecast issued: median ${pct(hs.med)}, 80% range ${pct(hs.lo)} to ${pct(hs.hi)}.</li><li>Out of the total: £78,508.20 known, 6 of 7 priced.</li></ul>` + ids(''), false],
    offline: [head(badge('Trim')), banner('', 'Offline.', `Saved at 21:15. Recording a decision waits until you reconnect.${q12(ctx)}`, 'wifi-off') + why + cf, false],
    noModel: [head(`<span class="chip proposed"><span class="dot"></span>Unclassified</span>`), `<p class="lead">Action thresholds are not approved yet (FIN-OD-07), so this shows its evidence and no label, rather than a guess.</p>` + noLabel + ids(), false],
    disagreement: [head(`<span class="chip">${ic('split', 's14')}Conflicted</span>`, 'Reliance'), `<span class="lab">Each side</span><div class="home-kv"><span>Rules, heuristic strength</span><b>Pause · moderate</b><span>R2-HGB v3, 80% range, 6M</span><b>${pct(rel.lo)} to ${pct(rel.hi)}</b></div><p class="lead">Rules and models disagree, so no action is ranked. Both stay on the forecast.</p>` + ids(''), false],
    abstention: [head(`<span class="chip">${ic('ban', 's14')}Ineligible</span>`, 'AstraZeneca'), `<p class="lead">The model abstained at 6 months, so a part of the score is missing. AstraZeneca is not ranked and carries no 6-month action until the next run.</p>` + azn, false]
  }[st] || [head(badge('Trim')), body]));
}

/* ---------- search, shared idea, two layouts ---------- */
const RES = [
  ['ICICIBANK', 'ICICI Bank · XNSE', 'Universe', '72', '--seg-n50', 'IC'],
  ['HSBA', 'HSBC · XLON', 'Your holding', '–', '--seg-uketf', 'H'],
  ['JPM', 'JPMorgan Chase · XNYS', 'Watch-only', '70', '--seg-uslarge', 'JP'],
  ['BANKBEES', 'Nippon India Bank BeES · XNSE', 'Universe', '62', '--seg-inetf', 'BB'],
  ['HDFCBANK', 'HDFC Bank · XNSE', 'Universe', '69', '--seg-n50', 'HD']
];
const kindChip = k => (k === 'Your holding' ? `<span class="chip owner"><span class="dot"></span>Holding</span>` : k === 'Watch-only' ? `<span class="chip">${ic('target', 's14')}Watch-only</span>` : `<span class="chip illus">Universe</span>`);
const resRow = (r, o = {}) => `<div class="t5r" data-mo="rise" style="grid-template-columns:30px minmax(0,1fr) auto auto"><span>${logo(r[4], r[5], true)}</span><div class="tt">${r[0]}<span>${r[1]}</span></div>${kindChip(r[2])}<div style="font:800 15px/18px var(--font-figure);text-align:right;min-width:22px">${o.score !== undefined ? o.score : r[3]}</div></div>`;
const filters = on => `<div class="home-chips" role="group" aria-label="Filters" data-mo="fade">${['All', 'Holdings', 'Watch-only', 'US', 'UK', 'India', 'Equity', 'ETF', 'Segment'].map(t => `<button class="chip${t === on ? ' owner' : ''}" type="button" aria-pressed="${t === on}">${t}</button>`).join('')}</div>`;
const lists = () => `<div class="card home-card" data-mo="card"><h4>Watchlists</h4><div class="home-kv"><span>Long-term ideas · 6 names</span><b>v4 · 2 Nov</b><span>India banks · 3 names</span><b>v2 · 28 Oct</b></div>${btn('Save this search as a list', 'tinted', 'plus').replace('class="btn', 'class="btn sm')}</div>`;
const candidate = () => `<div class="card home-card" data-mo="card"><div style="display:flex;align-items:center;gap:8px">${logo('--seg-n50', 'IC', true)}<h4 style="flex:1">ICICI Bank</h4><span class="chip illus">Candidate</span></div>
  <div class="home-kv"><span>Peers</span><b>HDFCBANK, SBIN</b><span>Benchmark</span><b>Nifty 50</b><span>Overlap with NIFTYBEES</span><b>8.9% of that ETF</b></div>
  <span class="label" style="margin-top:4px">At an example 5% size, in new money (computed by code)</span>
  <div class="home-kv"><span>India share</span><b>28.5% to 31.9%</b><span>Banks share, direct holdings</span><b>7.2% to 11.6%</b></div><p class="home-sub">Decision support, not advice. Illustrative.</p></div>`;
function searchMain(ctx, opts = {}) {
  const st = ctx.state, q = opts.q || 'bank';
  const field = `<div class="search on" data-mo="fade">${ic('search', 's18')}${q}</div>`;
  const list = (rows, html = '') => `${field}${filters('All')}${html}<div class="list card" style="margin:0">${rows}</div>`;
  const rows = RES.map(r => resRow(r)).join('');
  const un = `<div class="t5r" data-mo="rise" style="grid-template-columns:30px minmax(0,1fr) auto"><span class="logo sm" style="background:var(--surface-3);color:var(--ink-2)">${ic('ban', 's14')}</span><div class="tt">BANKNIFTY<span>Unavailable: rights unverified</span></div><span class="chip">Unavailable</span></div>`;
  return region(ctx, {
    what: 'Search',
    ok: () => list(rows),
    loading: () => list(rows, boardNote.loading()).replace('<div class="list card" style="margin:0">', '<div class="list card home-dim" aria-busy="true" style="margin:0">'),
    empty: () => `<div class="search on" data-mo="fade">${ic('search', 's18')}xauusdt</div>${stateCard('search', 'No listing matches "xauusdt"', 'Try a ticker like XAU or a name like Gold. Outside the 150-name catalogue, ask Claude in chat: code checks coverage and cost, and you confirm before anything is added.', btn('Ask in chat', 'tinted'))}`,
    error: () => list(rows, banner('fall', 'That list did not save.', 'Your list stays at v4. Try again; a repeat cannot save it twice.', 'alert')),
    stale: () => list(RES.map(r => resRow(r, r[0] === 'HSBA' ? { score: ic('clock', 's18') } : {})).join(''), banner('warn', 'HSBC is stale.', `Its last price is 14:10, until its price returns. Every other result is current. ${qLate}`, 'clock')),
    offline: () => `${field}${banner('', 'Offline.', `Search covers your 7 holdings and 9 saved names on this device. The wider catalogue returns when you reconnect.${q12(ctx)}`, 'wifi-off')}<div class="list card" style="margin:0">${resRow(RES[1])}${resRow(RES[2])}</div>`,
    noModel: () => list(RES.map(r => resRow(r, /· XNSE/.test(r[1]) ? { score: '–' } : {})).join('') + un, banner('', 'India results have no score.', 'No approved model covers India, so ICICIBANK, BANKBEES and HDFCBANK are not ranked. A listing with unverified rights shows as unavailable, never with made-up data.', 'cube')),
    disagreement: () => list(rows, banner('', 'No conflict in these results.', 'Rules and models disagree on Reliance at 6 months, and the models split on Apple at 3 months. Neither is in this search.', 'split')),
    abstention: () => list(rows, banner('', 'Nothing here abstained.', 'The model abstained on AstraZeneca at 6 months and on Apple at 12 months. Neither is in this search.', 'ban'))
  });
}
function searchRail(ctx) {
  const st = ctx.state;
  if (st === 'empty') return lists();
  if (st === 'loading') return lists();
  if (st === 'error') return candidate() + `<div class="card home-card" data-mo="card"><h4>Watchlists</h4><div class="home-kv"><span>Long-term ideas · 6 names</span><b>v4 kept</b></div>${btn('Try again', 'tinted', 'refresh').replace('class="btn', 'class="btn sm')}</div>`;
  if (st === 'offline') return `<div class="card home-card" data-mo="card"><h4>Watchlists</h4><p class="home-sub">Saved lists are readable. Changes wait until you reconnect.</p></div>`;
  return candidate() + lists();
}

/* ---------- Option B: rows that open in place ---------- */
const strip = ctx => {
  const st = ctx.state, v = valOf(st);
  if (st === 'empty') return '';
  return `<div class="card" style="padding:12px 14px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 14px;align-items:baseline" data-mo="card"><div>${money(v.amt, ctx.kind === 'pwa' ? 28 : 30)}</div><div style="text-align:right;font-size:13px;line-height:18px;letter-spacing:0">${st === 'stale' ? '<span class="muted">Known value, 6 of 7 priced</span>' : `${chg(1, '+1.48%')} <span class="muted">${dayWord(st)}</span>`}</div><div class="small muted" style="grid-column:1/-1">${metaOf(ctx)} · Illustrative</div></div>`;
};
const ldgr3 = (h, m, st) => {
  const flag = h.t === 'HSBA', s = stamp(h, st);
  const small = t => `<div class="small muted" style="font-size:12px;line-height:16px;white-space:normal">${t}</div>`;
  const cell = i => {
    const c = atHz(h, i), off = isOut(st, h.t, i), fig = `${pct(c.lo)} to ${pct(c.hi)}`;
    if (off && st === 'abstention') return `<td class="r"><span class="small">Abstained</span>${small('No range')}</td>`;
    if (off) return `<td class="r"><span class="small">${h.t === 'RELIANCE' ? 'Disagree' : 'Split'}</span>${small(fig)}</td>`;
    return `<td class="r"><div style="color:var(--fc-ink);font-weight:600">${pct(c.med)}</div>${small(fig)}</td>`;
  };
  const blank = t => `<td class="r" colspan="3"><span class="small">${t}</span></td>`;
  return `<tr data-mo="rise"><td>${nameBtn(h, h.n, `${h.t} · ${CCY[h.v]}`)}</td><td class="r" style="font-weight:600">£${h.val}</td><td class="r">${flag ? `<span class="chg" style="color:var(--warn)">${ic('clock', 's14')}${s.t}</span>` : chg(h.day)}</td>${st === 'noModel' && m.flS !== undefined ? blank(m.fl.replace(/<[^>]+>/g, '') || m.flS) : cell(0) + cell(1) + cell(2)}<td>${m.act !== undefined ? m.act : badge(h.act)}</td><td>${dataCell(h, st)}</td></tr>`;
};
function ledgerFull(ctx) {
  return `<div class="card" data-mo="card"><table class="ht dk"><thead><tr><th>Instrument</th><th class="r">Value</th><th class="r">${ctx.state === 'error' ? 'Monday' : 'Today'}</th><th class="r">3 months</th><th class="r">6 months</th><th class="r">12 months<br>Exploratory</th><th>Action, ${HZ[ctx.hz ?? 1].s}</th><th>Data</th></tr></thead><tbody>${H.map(h => ldgr3(h, mods(ctx, h.t), ctx.state)).join('')}</tbody></table>${lateFoot(ctx.state)}</div>`;
}
const openCell = ctx => `<tr class="home-open"><td colspan="4">${actionSheet(ctx).replace('class="sheet home-sheet"', 'class="home-sheet"').replace('<div class="grabber"></div>', '')}</td></tr>`;
function ledgerB(ctx, open) {
  const body = () => (isWide(ctx) ? (open ? ledgerDesk(ctx, sheetT(ctx.state)) : ledgerFull(ctx)) : ledgerPwa(ctx, open ? sheetT(ctx.state) : '', open ? openCell(ctx) : ''));
  return region(ctx, {
    what: 'Holdings', ok: body, loading: () => holdingsNote.loading() + dim(body()),
    empty: () => stateCard('grid', 'No holdings yet', 'Add what you hold and the ledger starts. It never connects to a broker.', btn('Add a holding', 'primary', 'plus')),
    error: () => holdingsNote.error() + body(), stale: () => holdingsNote.stale() + body(), offline: () => holdingsNote.offline(ctx) + body(),
    noModel: () => holdingsNote.noModel() + body(), disagreement: () => holdingsNote.disagreement() + body(), abstention: () => holdingsNote.abstention() + body()
  });
}
const t5Row = (k, r, i, st, noHold) => { const f = fcOf(r[0]), s = SEG[k]; return `<div class="t5r home-t5" role="button" tabindex="0" data-mo="rise"><span class="rk">${i + 1}</span>${logo(s.c, r[5], true)}<div class="tt">${r[0]}${(FLAG[st] || {})[r[0]] ? ` ${ic('split', 's14')}` : ''}<span>${r[1]}${!noHold && held(r[0], st) ? ' · You hold it' : ''}${splitWord(r[0], st)}</span></div><div class="score" role="img" aria-label="Score ${score(r)} of 100"><b>${score(r)}</b><i><u data-mo="barx" style="--v:${score(r)}%"></u></i></div><div class="home-parts">${pct(f.med)} · ${rangeText(f)} · 6M</div><div class="home-parts">${pxLine(k, st)}</div></div>`; };
const t5Card = (k, st, noHold) => {
  const s = SEG[k];
  if (k === 'metals') return metalsCard(st);
  if (st === 'noModel' && INDIA.includes(k)) return `<div class="card top5" data-mo="card"><div class="t5h" style="--c:var(${s.c})"><h4>Top 5 · ${s.name}</h4><p>${s.note} · 3 to 12 months</p></div><div class="t5foot" style="display:flex;gap:6px;align-items:flex-start;border-top:0">${ic('cube', 's14')}<span>Not ranked until an approved model covers India at 3 to 12 months. A missing part is never zero.</span></div></div>`;
  const rows = rowsOf(k, st);
  return `<div class="card top5" data-mo="card"><div class="t5h" style="--c:var(${s.c})"><h4>Top 5 · ${s.name}</h4><p>${s.note} · 3 to 12 months · re-ranked daily</p></div>${rows.map((r, i) => t5Row(k, r, i, st, noHold)).join('')}${rows.length < 5 ? withheld(k, st, rows.length + 1) : ''}${nrOf(k, st).map(n => notRanked(k, n)).join('')}<div class="t5foot">${rankLine(st)}. Score = growth 35% + protection 40% + opportunity 25%, shown only when all three are eligible. Illustrative.</div></div>`;
};
const pickTile = (k, on) => { const s = SEG[k], sel = k === on; return `<button class="segtile slim${sel ? ' sel' : ''}" type="button" aria-pressed="${sel}" style="--c:var(${s.c});min-height:44px" data-mo="card"><span class="mk">${s.mk}</span><span class="tn">${s.name}</span></button>`; };
const picker = (ctx, on) => `<div class="home-pick${isWide(ctx) ? ' w4' : ''}">${ORDER.map(k => pickTile(k, on)).join('')}</div>`;
function switcher(ctx, on = 'ustech') {
  if (on === 'metals') return picker(ctx, on) + segMain(ctx, on);
  const st = ctx.state, next = ORDER[(ORDER.indexOf(on) + 1) % ORDER.length];
  const pair = isWide(ctx) ? `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start">${t5Card(on, st, ctx.nohold)}${t5Card(next, st, ctx.nohold)}</div>` : t5Card(on, st, ctx.nohold);
  const main = () => `${picker(ctx, on)}${pair}`;
  return region(ctx, {
    what: 'The lists', ok: main,
    loading: () => boardNote.loading() + picker(ctx, on) + dim(pair),
    empty: () => `${picker(ctx, on)}${boardNote.empty()}`,
    error: () => boardNote.error() + main(), stale: () => boardNote.stale() + main(), offline: () => boardNote.offline(ctx) + main(),
    noModel: () => boardNote.noModel() + main(),
    disagreement: () => boardNote.disagreement() + main(), abstention: () => boardNote.abstention() + main()
  });
}
function explorer(ctx) {
  const st = ctx.state, k = 'ustech';
  const field = `<div class="search" data-mo="fade">${ic('search', 's18')}Search 150 names</div>`;
  const chips = `<div class="home-chips" role="group" aria-label="Segment filter" data-mo="fade">${['US tech', 'Holdings', 'Watch-only', 'Not ranked'].map((t, i) => `<button class="chip${i === 0 ? ' owner' : ''}" type="button" aria-pressed="${i === 0}">${t}</button>`).join('')}</div>`;
  const list = () => `<div class="card top5" data-mo="card">${isWide(ctx) ? segTable(k, st) : segPhone(k, st)}${rankFoot(k, st)}</div>`;
  const rows = () => `${field}${chips}${list()}`;
  return region(ctx, {
    what: 'This list', ok: rows,
    loading: () => `${field}${chips}${boardNote.loading()}${dim(list())}`,
    empty: () => `${field}${chips}${stateCard('grid', 'No list yet', 'US tech is ranked after each daily run. Until the first run there is no list and no score.')}`,
    error: () => boardNote.error() + rows(), stale: () => boardNote.stale() + rows(), offline: () => boardNote.offline(ctx) + rows(),
    noModel: () => listStands(SEG[k].name) + rows(),
    disagreement: () => banner('', ...TECHSAY.disagreement.ustech, 'split') + rows(),
    abstention: () => banner('', ...TECHSAY.abstention.ustech, 'ban') + rows()
  });
}

/* a horizon switch really switches: a press redraws that frame at the chosen horizon, as the story's "chosen horizon" asks. It reads
   what the frame shows from data-at, so a turned frame stays turned and keeps its flip, and it keeps its horizon on the frame. */
doc.addEventListener('segchange', e => {
  const g = e.target, scr = g.closest && g.closest('.scr'), [jid, oid, id] = ((scr && scr.dataset.at) || '').split('|');
  if (jid !== 'home' || g.getAttribute('aria-label') !== 'Forecast horizon') return;
  const s = J.all().find(j => j.id === 'home').options.find(o => o.id === oid).screens.find(x => x.id === id);
  if (!s) return;
  scr.dataset.hz = e.detail;
  const box = scr.closest('[data-slot]'), cap = box && $('.bcap', box), title = s.titleFor ? s.titleFor(scr.dataset) : s.title, scheme = /dark theme$/.test(scr.getAttribute('aria-label') || '') ? 'dark' : 'light';
  scr.innerHTML = s.render({ kind: sum.at.s, state: (s.na || {})[sum.at.st] ? 'default' : sum.at.st, scheme, journey: 'home', option: oid, screen: id, hz: e.detail });
  $$('[data-mo]', scr).forEach(n => n.removeAttribute('data-mo'));
  scr.setAttribute('aria-label', `${title}, ${scheme} theme`);
  if (cap && cap.childNodes[1]) cap.childNodes[1].textContent = cap.childNodes[2] ? `${title} ` : title;
  const b = $$('[aria-label="Forecast horizon"] > button', scr)[e.detail];
  if (b) b.focus({ preventScroll: true });
});

/* a frame's name follows the horizon it shows: the shell and the press above both read this */
const atMonths = (name, hz0) => ds => `${name} at ${[3, 6, 12][+(ds.hz ?? hz0)]} months`;
/* the two home layouts, at any horizon */
function homeA(ctx, hz0 = 1) {
  const hz = +(ctx.hz ?? hz0), c = { ...ctx, hz }, wide = isWide(ctx), st = ctx.state, empty = st === 'empty';
  return frame(ctx, {
    tab: 0, title: 'Portfolio', webActions: webSearch(ctx),
    accessory: empty ? '' : briefPill(ctx),
    body: `${value(ctx)}${sec('Holdings', H36(hz))}<div class="home-sub">${sup}</div>${hzNote(hz)}${holdings(c)}${costRow(ctx)}${wide ? '<span class="home-wl"></span>' : ''}${sec('Top 5 by segment')}${empty ? '' : noteOf(ctx)}${board(empty ? { ...ctx, state: 'default', nohold: true } : ctx, wide)}${legendT(empty ? 'default' : st, empty)}`,
    rail: wide ? `${briefCard(ctx)}<div class="card home-card" data-mo="card"><h4>Ranked actions</h4><p class="home-sub">Decision support, with the reasons a tap away.</p>${empty ? '<p class="home-sub">None yet.</p>' : actRows(ctx, 3)}</div>` : ''
  });
}
function homeB(ctx, hz0 = 1) {
  const hz = +(ctx.hz ?? hz0), c = { ...ctx, hz }, wide = isWide(ctx), empty = ctx.state === 'empty';
  return frame(ctx, {
    tab: 0, title: 'Portfolio', webActions: webSearch(ctx),
    body: `${strip(ctx)}${wide ? `<div class="home-sub">${sup}</div>` : `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px" data-mo="rise"><span class="label">${empty ? 'Holdings' : '7 holdings'}</span>${H36(hz)}</div>${hzNote(hz)}`}${ledgerB(c)}${wide ? `${costRow(ctx)}${briefCard(ctx)}` : `<div class="home-sub">${sup}</div>${costRow(ctx)}<div class="card" data-mo="card">${briefPill(ctx)}</div>`}${sec('Top 5 by segment')}${switcher(empty ? { ...ctx, state: 'default', nohold: true } : ctx)}`
  });
}
const OTHERS = ORDER.filter(k => k !== 'ustech');
/* what Empty means on each kind of frame, one phrase each, so two frames that differ say why */
const EMPTY = {
  holdings: 'Empty here means no holdings yet: the lists still show, because a ranking needs no holdings (MP-135).',
  lists: 'Empty here means the first morning, before any daily run, so no list exists yet.',
  brief: 'Empty is the first morning; a weekend brief waits on MP40-Q11.',
  band: 'Empty here means a holding with no action band.',
  rows: 'Empty here means no holdings yet, so no row opens.',
  metals: 'Empty here means no list, as in every state.',
  search: 'Empty here means a search that finds nothing.'
};
const naMetals = { disagreement: 'No forecast runs for gold or silver, so there is nothing to disagree.', abstention: 'No forecast runs for gold or silver, so none can abstain.' };
const segFrame = (ctx, k) => frame(ctx, { tab: 2, back: 'Segments', title: SEG[k].name, actions: tb('info', 'How a list is made'), webActions: webSearch(ctx), body: `<span class="home-wl"></span>${segMain(ctx, k)}`, rail: segRail(ctx, k) });

J.add({
  id: 'home', title: 'Home', stories: ['MP-153', 'MP-141', 'MP-135', 'MP-144', 'MP-148'],
  summary: 'What you own comes first, with its ranges. Below it, the top 5 for each of eight segments, ranked by code as decision support.',
  options: [{
    id: 'a', name: 'Tile board', rec: true,
    why: 'Your holdings come first with their ranges, and one board below shows all eight top 5s at a glance, in Prism\'s segment colours. A tile opens its list, so home stays calm.',
    cost: 'A tile holds each name\'s rank and score and its segment\'s price time, not its range: at 12 px on colour, five ranges will not fit. Each name\'s median, 80% range and reasons are one tap away, in that segment\'s list. A phone also scrolls past seven rows to reach the board.',
    screens: [{
      id: 'a-portfolio', title: 'Portfolio', note: `Holdings first, then the running cost, then the board. The brief floats above the dock on a phone, so it never pushes a holding down; on iPad and desktop it takes the rail. ${EMPTY.holdings}`,
      render: ctx => homeA(ctx)
    }, {
      id: 'a-12m', title: 'Portfolio at 12 months', titleFor: atMonths('Portfolio', 2), note: `The horizon switch redraws every row. 12 months is labelled exploratory, because it rests on 11 blocks. ${EMPTY.holdings}`,
      render: ctx => homeA(ctx, 2)
    }, {
      id: 'a-board', title: 'Segments', note: `The Segments tab: the same board that sits under the holdings, with a list behind every tile. Each list below carries its names' ranges. ${EMPTY.lists}`,
      render: ctx => frame(ctx, { tab: 2, title: 'Segments', webActions: webSearch(ctx), body: `${noteOf(ctx)}${board(ctx)}${legendT(ctx.state)}${rule()}` })
    }, {
      id: 'a-segment', title: 'One segment', note: `What a tile opens: every name with its median, 80% range and price time. A not-ranked listing shows the parts it has; the withheld fifth place stays empty. ${EMPTY.lists}`,
      render: ctx => segFrame(ctx, 'ustech')
    }, ...OTHERS.map(k => ({
      id: `a-seg-${k}`, title: `Segment: ${SEG[k].name}`, note: k === 'metals' ? `Gold and silver have prices and no list until a valuation convention is set (SCI-D08). ${EMPTY.metals}` : `What the ${SEG[k].name} tile opens. ${EMPTY.lists}`,
      ...(k === 'metals' ? { na: naMetals } : {}),
      render: ctx => segFrame(ctx, k)
    })), {
      id: 'a-action', title: 'Suggested action', note: `What a holding's action opens: reasons, uncertainty, what would change, and the versions behind it. Recording goes to the journal; nothing acts on it. No model shows the unclassified case, which holds until FIN-OD-07 is approved. ${EMPTY.band}`,
      render: ctx => { const base = ctx.state === 'empty' ? { ...ctx, state: 'default' } : ctx; return frame(base, { tab: 0, title: 'Portfolio', body: `${value(base)}${ledger({ ...base, over: sheetOver(ctx.state) })}`, sheet: actionSheet(ctx) }); }
    }, {
      id: 'a-brief', title: 'Daily brief', note: `Actions, then risks, changes and upcoming events, with each market on its own clock. ${EMPTY.brief}`,
      render: ctx => { const b = briefBody(ctx); return frame(ctx, { tab: 0, back: 'Portfolio', title: 'Daily brief', actions: tb('info', 'About the brief'), body: b.left, rail: b.right }); }
    }, {
      id: 'a-search', title: 'Search', note: `Holdings, watch-only and the 150-name universe stay visibly apart. Search cannot add a listing: that goes through chat, a coverage check and your confirm. ${EMPTY.search}`,
      render: ctx => frame(ctx, { tab: 0, back: 'Portfolio', title: 'Search', actions: '<span></span>', body: searchMain(ctx), rail: searchRail(ctx) })
    }]
  }, {
    id: 'b', name: 'Ledger',
    why: 'Holdings, the top 5 and the 150-name universe share one row, and a row opens where it sits. More fits on a phone, search and segments are one place, and desktop shows 3, 6 and 12 months at once.',
    cost: 'One segment shows at a time, so you lose the all-eight view, and Prism\'s colour gives way to rows.',
    screens: [{
      id: 'b-ledger', title: 'Ledger', note: `A compact row for every holding, then the running cost and the brief, then the top 5 below the holdings. Desktop widens the row to all three long horizons. ${EMPTY.holdings}`,
      render: ctx => homeB(ctx)
    }, {
      id: 'b-12m', title: 'Ledger at 12 months', titleFor: atMonths('Ledger', 2), note: `On a phone the horizon switch redraws every row. Desktop already shows all three, with 12 months labelled exploratory. ${EMPTY.holdings}`,
      render: ctx => homeB(ctx, 2)
    }, {
      id: 'b-open', title: 'A row opened', note: `A tap opens the reasons in the row on a phone, and in the rail on iPad and desktop, with the ledger still in view. ${EMPTY.rows}`,
      render: ctx => frame(ctx, {
        tab: 0, title: 'Portfolio', webActions: webSearch(ctx),
        body: `<span class="home-wl"></span>${strip(ctx)}${ledgerB({ ...ctx, over: sheetOver(ctx.state) }, true)}`,
        rail: isWide(ctx) && ctx.state !== 'empty' ? actionSheet(ctx).replace('class="sheet home-sheet"', 'class="card home-card home-sheet"').replace('<div class="grabber"></div>', '') : ''
      })
    }, {
      id: 'b-brief', title: 'Daily brief', note: `What the brief row opens: actions, then risks, changes and upcoming events, each market on its own clock. Each action row carries its ticker, as a ledger row does. ${EMPTY.brief}`,
      render: ctx => { const b = briefBody({ ...ctx, tick: true }); return frame(ctx, { tab: 0, back: 'Portfolio', title: 'Daily brief', actions: tb('info', 'About the brief'), body: b.left, rail: b.right }); }
    }, {
      id: 'b-top5', title: 'Top 5 in place', note: `The top 5 as it sits below the holdings on the ledger, here on its own, with eight segments as a picker, so the list changes under your thumb and you never leave home. Each name carries its median and 80% range. ${EMPTY.lists}`,
      render: ctx => frame(ctx, { tab: 0, title: 'Top 5', webActions: webSearch(ctx), body: switcher(ctx) })
    }, ...OTHERS.map(k => ({
      id: `b-top5-${k}`, title: `Top 5: ${SEG[k].name}`, note: k === 'metals' ? `The picker on Gold & silver: prices and no list until a valuation convention is set (SCI-D08). ${EMPTY.metals}` : `The picker on ${SEG[k].name}. ${EMPTY.lists}`,
      ...(k === 'metals' ? { na: naMetals } : {}),
      render: ctx => frame(ctx, { tab: 0, title: 'Top 5', webActions: webSearch(ctx), body: `${k === 'metals' ? '<span class="home-wl"></span>' : ''}${switcher(ctx, k)}`, rail: k === 'metals' ? segRail(ctx, k) : '' })
    })), {
      id: 'b-explore', title: 'One segment', note: `The Segments tab. A segment's list is a filter on the universe: search and segments share a screen. Gold and silver keep their own place in the picker. ${EMPTY.lists}`,
      render: ctx => frame(ctx, { tab: 2, title: 'Segments', webActions: webSearch(ctx), body: `<span class="home-wl"></span>${explorer(ctx)}`, rail: segRail(ctx, 'ustech') })
    }, {
      id: 'b-search', title: 'Search', note: `Typing narrows the same ledger. The candidate opens beside it on iPad and desktop, and below it on a phone. ${EMPTY.search}`,
      render: ctx => frame(ctx, { tab: 2, title: 'Segments', webActions: webSearch(ctx), body: searchMain(ctx), rail: searchRail(ctx) })
    }]
  }]
});
})();
