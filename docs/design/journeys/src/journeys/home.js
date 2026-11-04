/* Home: what you own first, then the top 5 per segment (MP-153, MP-141, MP-135, MP-144, MP-148).
   Every figure is illustrative. Scores are computed here from their three parts, so a list can be checked by hand. */
(() => {
const isWide = ctx => ctx.kind === 'ipad' || ctx.kind === 'web';
const ORDER = ['uslarge', 'ustech', 'n50', 'midcap', 'usetf', 'uketf', 'inetf', 'metals'];
const CCY = { XNAS: 'USD', ARCX: 'USD', XLON: 'GBP', XNSE: 'INR' };
const held = t => !!byT[t];

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
const FC = { MSFT: { med: 7.0, lo: -8.8, hi: 22.0 }, AMZN: { med: 6.6, lo: -12.4, hi: 25.1 }, AVGO: { med: 8.2, lo: -16.0, hi: 30.5 } };
const K = 0.6745 / 1.2816;
const fcOf = t => { const h = byT[t]; if (h) return h; const f = FC[t]; return { ...f, lo50: +(f.med - (f.med - f.lo) * K).toFixed(1), hi50: +(f.med + (f.hi - f.med) * K).toFixed(1) }; };

/* small modules, all Prism classes */
const sec = (title, right = '') => `<div class="sech home-sech" data-mo="rise"><h3>${title}</h3>${right}</div>`;
const sup = 'Actions are decision support, not advice. MyPrediction places no trades.';
const watch = `<span class="badge">${ic('target', 's16')}Watch</span>`;
const webSearch = ctx => ctx.kind === 'web' ? `<div class="search" style="width:190px">${ic('search', 's18')}Search<kbd>⌘K</kbd></div>` : ctx.kind === 'pwa' ? tb('search', 'Search') : '';
const costRow = () => `<div class="card home-link" data-mo="card">${ic('layers', 's18')}<span>Running cost<small>Forecast up to £59.73 of the £100 ceiling</small></span>${ic('chev-r', 's18')}</div>`;

/* ---------- holdings ---------- */
function hRow(h, o = {}) {
  const stale = h.stale || o.stale, [l, p] = h.val.split('.');
  const fl = o.fl !== undefined ? o.fl : `<div class="rangewrap">${range(h)}</div><span class="fcv">${pct(h.med)} · 6M</span>${badge(h.act)}`;
  return `<div class="hrow${o.sel ? ' sel' : ''}${stale ? ' is-stale' : ''}" data-mo="rise">${logo(h.c, h.lg)}
    <div style="min-width:0"><div class="nm">${h.n}</div><div class="tk">${h.t} · ${h.v} · ${CCY[h.v]}</div></div>
    <div class="vv"><div class="val">£${l}<span class="pp">.${p}</span></div>${stale ? `<span class="chg" style="color:var(--warn);font-size:12px;line-height:16px">${ic('clock', 's14')}16:35</span>` : chg(h.day)}</div>
    <div class="fl">${fl}</div>${stale ? `<div class="stalenote"><span class="chip stale">${ic('clock', 's14')}Stale: last price 16:35 (Yahoo)</span></div>` : ''}</div>`;
}
const dataCell = (h, stale) => `<div class="small" style="font-size:12px;line-height:16px">${stale ? '16:35' : '21:15'}<div class="muted">${h.v === 'XNAS' || h.v === 'ARCX' ? 'Twelve Data' : 'Yahoo'}</div></div>`;
function hTr(h, o = {}) {
  const stale = h.stale || o.stale;
  const fc = o.fl !== undefined ? o.fl : `<div style="display:flex;align-items:center;gap:6px"><span style="width:40px;color:var(--fc-ink);font-weight:600;text-align:right">${pct(h.med)}</span><span style="width:70px;display:block">${range(h, 70, 14)}</span></div><div class="small muted" style="padding-left:46px;font-size:12px;line-height:16px">${pct(h.lo)} to ${pct(h.hi)}</div>`;
  return `<tr class="${o.sel ? 'sel' : ''}" data-mo="rise"><td><div class="inst">${logo(h.c, h.lg, true)}<div style="min-width:0"><b>${h.n}</b><span>${h.t} · ${CCY[h.v]}</span></div></div></td><td class="r"><div style="font-weight:600">£${h.val}</div>${stale ? `<span class="chg" style="color:var(--warn)">${ic('clock', 's14')}16:35</span>` : chg(h.day)}</td><td>${fc}</td><td>${o.act !== undefined ? o.act : badge(h.act)}</td><td>${dataCell(h, stale)}</td></tr>`;
}
function pTr(h, o = {}) {
  const stale = h.stale || o.stale;
  const fc = o.fl !== undefined ? o.fl : `<div style="color:var(--fc-ink);font-weight:600">${pct(h.med)}</div><div style="width:64px;margin-left:auto">${range(h, 64, 12)}</div>`;
  return `<tr class="${o.sel ? 'sel' : ''}" data-mo="rise"><td><div class="inst">${logo(h.c, h.lg, true)}<div><b>${h.t}</b><span>${stale ? `<span style="color:var(--warn);font-weight:600">Stale 16:35</span>` : chg(h.day)}</span></div></div></td><td class="r" style="font-weight:600">£${h.val.split('.')[0]}</td><td class="r">${fc}</td><td>${o.act !== undefined ? o.act : badge(h.act)}</td></tr>`;
}
/* the rows in one state, on the three forms a holding takes */
const flagged = {
  stale: t => t === 'AZN' || t === 'HSBA' ? { stale: true, h: { ...byT[t], act: 'Pause' } } : {},
  noModel: t => (t === 'RELIANCE' || t === 'NIFTYBEES' ? { fl: '<span class="chip proposed"><span class="dot"></span>No approved model · no action</span>', flS: 'No model', flT: 'No model · no action', act: '<span class="small muted">None</span>' } : {}),
  disagreement: t => t === 'RELIANCE' ? { fl: `<span class="chip">${ic('split', 's14')}Rules and models disagree · no action</span>`, flS: 'Split', flT: 'Disagree · no action', act: '<span class="small muted">None</span>' } : {},
  abstention: t => t === 'AZN' ? { fl: `<span class="chip">${ic('ban', 's14')}Abstained · no range shown</span>`, flS: 'None', flT: 'Abstained · no range', act: '<span class="small muted">None</span>' } : {}
};
const mods = (ctx, t) => (flagged[ctx.state] ? flagged[ctx.state](t) : {});
function ledgerPhone(ctx, sel) {
  return `<div class="list card" style="margin:0">${H.map(h => { const m = mods(ctx, h.t); return hRow(m.h || h, { ...m, sel: h.t === sel }); }).join('')}</div>`;
}
function ledgerDesk(ctx, sel) {
  return `<div class="card" data-mo="card"><table class="ht dk"><thead><tr><th>Instrument</th><th class="r">Value, today</th><th>6-month forecast</th><th>Action</th><th>Data</th></tr></thead><tbody>${H.map(h => { const m = mods(ctx, h.t); return hTr(m.h || h, { ...m, fl: m.flT !== undefined ? `<span class="small">${m.flT}</span>` : undefined, sel: h.t === sel }); }).join('')}</tbody></table></div>`;
}
function ledgerPwa(ctx, sel, open = '') {
  return `<div class="card" data-mo="card"><table class="ht pwa"><thead><tr><th>Holding</th><th class="r">Value</th><th class="r">6M</th><th>Action</th></tr></thead><tbody>${H.map(h => { const m = mods(ctx, h.t); return pTr(m.h || h, { ...m, fl: m.flS !== undefined ? `<span class="small">${m.flS}</span>` : undefined, sel: h.t === sel }) + (h.t === sel ? open : ''); }).join('')}</tbody></table></div>`;
}
const ledger = (ctx, sel) => (isWide(ctx) ? ledgerDesk : ctx.kind === 'pwa' ? ledgerPwa : ledgerPhone)(ctx, sel);
const holdingsNote = {
  error: () => banner('fall', 'Holdings did not refresh.', 'Twelve Data failed at 21:14. These rows are the last loaded version, 20:45, all from that one version.', 'alert') + `<div>${btn('Try again', 'tinted', 'refresh')}</div>`,
  stale: () => banner('warn', '2 of 7 rows are stale.', 'Yahoo stopped at 16:35, so AstraZeneca and HSBC hold their last forecast and their actions pause.', 'clock'),
  offline: () => banner('', 'Offline.', 'Holdings from 21:15, saved on this device. Nothing here is fresh analysis until you reconnect.', 'wifi-off'),
  noModel: () => banner('', 'No approved model covers India yet.', 'Reliance and the Nifty ETF keep their value and price, with no range and no action.', 'cube'),
  disagreement: () => banner('', 'One holding is split.', 'On Reliance the rules point down and the model points up. Both are in its forecast, and no action is ranked.', 'split'),
  abstention: () => banner('', 'One holding abstained.', 'AstraZeneca has too little comparable history at 6 months for a calibrated range, so none is shown.', 'ban')
};
function holdings(ctx, sel) {
  const list = () => ledger(ctx, sel);
  return region(ctx, {
    what: 'Holdings',
    ok: list,
    loading: () => skel(5),
    empty: () => stateCard('grid', 'No holdings yet', 'Add what you hold and MyPrediction starts watching it. It never connects to a broker.', btn('Add a holding', 'primary', 'plus')),
    error: () => holdingsNote.error() + list(),
    stale: () => holdingsNote.stale() + list(),
    offline: () => holdingsNote.offline() + list(),
    noModel: () => holdingsNote.noModel() + list(),
    disagreement: () => holdingsNote.disagreement() + list(),
    abstention: () => holdingsNote.abstention() + list()
  });
}

/* ---------- value ---------- */
const META = {
  loading: 'Refreshing · showing 21:15', error: 'Last loaded 20:45 · 29 minutes old', stale: '5 of 7 priced at 21:15 · 2 at 16:35', offline: 'Saved 21:15 · not updating'
};
const metaOf = ctx => META[ctx.state] || 'As of 21:15 London · data cutoff 21:00';
function value(ctx) {
  if (ctx.state === 'empty') return '';
  if (isWide(ctx)) return `<div class="card" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:20px;align-items:center;padding:14px 16px" data-mo="card"><div><div class="label">Portfolio value</div><div style="margin-top:6px">${money('84,612.40', 34)}</div><div style="margin-top:6px;font-size:13px;line-height:18px;letter-spacing:0;white-space:nowrap">${chg(1, '+£1,236.18 (1.48%)')} <span class="muted">today</span></div></div><div style="min-width:0"><div class="small muted" style="margin-bottom:8px">${metaOf(ctx)}</div>${alloc()}</div></div>`;
  return valcard(ctx.kind === 'pwa' ? 38 : 44).replace('As of 21:15 London · data cutoff 21:00', metaOf(ctx));
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
  disagreement: ['Today\'s brief · 07:30', '2 actions · 1 conflict shown'],
  abstention: ['Today\'s brief · 07:30', '2 actions · 1 abstention']
};
const briefPill = ctx => { const b = BL[ctx.state]; return `<div class="home-pill">${ic('clock', 's18')}<div><b>${b[0]}</b><span class="t">${b[1]}</span></div>${ic('chev-r', 's18')}</div>`; };
const stamps = () => `<div class="home-stamps">${['US closed Mon 21:00', 'UK closed Mon 16:35', 'India closed Mon 10:00'].map(s => `<span class="chip" data-mo="chip">${s}</span>`).join('')}</div>`;
const ACTS = [['NVDA', 'Trim', 'Widest 80% range of the holdings, and 13.5% of the portfolio.'], ['SPY', 'Add', 'Among the narrowest 80% ranges of the holdings: −7.1% to +15.2%.'], ['HSBA', 'Pause', 'Last price 16:35, so its forecast is held.']];
const actRows = (ctx, n = 3) => {
  const skip = ctx.state === 'disagreement' ? 'RELIANCE' : ctx.state === 'abstention' ? 'AZN' : '';
  const rows = ACTS.slice(0, n).map(([t, a, why]) => `<div class="home-act" data-mo="rise">${badge(a)}<b>${byT[t].n}</b><span class="home-sub">${why}</span></div>`).join('');
  const extra = skip === 'RELIANCE' ? `<div class="home-act" data-mo="rise"><span class="chip">${ic('split', 's14')}Split</span><b>Reliance</b><span class="home-sub">Rules and models disagree, so no action is ranked.</span></div>` : skip === 'AZN' ? `<div class="home-act" data-mo="rise"><span class="chip">${ic('ban', 's14')}None</span><b>AstraZeneca</b><span class="home-sub">The model abstained at 6 months, so no action is ranked.</span></div>` : '';
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
  const head = `<div class="card home-card" data-mo="card"><div class="label">Tuesday 3 November · issued 07:30 London</div><p class="home-sub">Each market keeps its own time. Figures come from code; Claude writes the words, and every figure it quotes has a source.</p>${stamps()}</div>`;
  const section = (t, html) => `<div class="card home-card" data-mo="card"><h4>${t}</h4>${html}</div>`;
  const acts = section('Actions · decision support', actRows(ctx));
  const risks = section('Risks', `<ul class="home-ul"><li><b>US tech is 31.0%</b> of the portfolio, the largest single block.</li><li><b>The rupee</b> moved 0.6% against the pound, which moves 28.5% of the value.</li></ul>`);
  const changes = section('Changes', `<ul class="home-ul"><li><b>NVDA</b> rose to 2nd in US tech, from 3rd.</li><li><b>ICICIBANK</b> leads Nifty 50 at 72, up from 69.</li></ul>`);
  const events = section('Upcoming', `<ul class="home-ul"><li><b>Thu 5 Nov</b> Bank of England rate decision.</li><li><b>Fri 6 Nov</b> US jobs report.</li></ul><p class="home-sub">Dated by when they become known. Illustrative.</p>`);
  const all = { left: head + acts + changes, right: risks + events };
  const lead = {
    error: banner('warn', 'Plain brief.', 'The writing route failed at 07:29, so code issued this from stored figures. Nothing is missing, only the words are plainer.', 'alert'),
    stale: banner('warn', 'Late.', 'MyPrediction was down at 07:30, so this was issued at 09:12, once. Timestamps are from the last eligible close.', 'clock'),
    offline: banner('', 'Saved copy.', 'This brief reached the device at 07:31. Nothing updates until you reconnect.', 'wifi-off'),
    noModel: banner('', 'India is rules only.', 'No approved model covers India, so its items come from rules, labelled heuristic, with no ranges.', 'cube'),
    disagreement: banner('', 'One conflict.', 'Rules and models disagree on Reliance. It is listed, with no action ranked.', 'split'),
    abstention: banner('', 'One abstention.', 'The model abstained on AstraZeneca at 6 months, so it carries no action this morning.', 'ban')
  }[st] || '';
  if (st === 'loading') return { left: `<div class="card home-card" data-mo="card"><div class="label">Issuing 07:30 brief</div><p class="home-sub">Reading the stored close for each market. Yesterday's brief stays readable below.</p><span class="sk" style="height:14px;width:80%"></span><span class="sk" style="height:14px;width:60%"></span></div>` + section('Yesterday, 07:30', `<ul class="home-ul"><li><b>Hold</b> Apple: median positive, range still includes a loss.</li><li><b>Add</b> Reliance: 7.4% median at 6 months.</li></ul>`), right: '' };
  if (st === 'empty') return { left: stateCard('clock', 'No brief yet', 'Your first brief arrives at 07:30 London tomorrow, with actions first, then risks, changes and upcoming events.', ''), right: '' };
  return { left: lead + all.left, right: all.right };
}

/* ---------- the top 5 board ---------- */
const FLAG = { disagreement: { INFY: 'split', AMZN: 'split' } };
const DROP = { abstention: { n50: 'TCS', usetf: 'IWM' } };
function tileRows(k, st) {
  const skip = (DROP[st] || {})[k];
  const rows = LIST[k].filter(r => r[0] !== skip);
  const li = rows.map((r, i) => `<li><span class="rk">${i + 1}</span><span class="tk">${r[0]}${held(r[0]) ? `<span class="sr">, you hold it</span>${ic('check', 's14')}` : ''}${(FLAG[st] || {})[r[0]] ? `<span class="sr">, rules and models disagree</span>${ic('split', 's14')}` : ''}</span><b>${score(r)}</b></li>`).join('');
  const gaps = rows.length < 5 ? `<li class="wh"><span class="rk">${rows.length + 1}</span><span class="tk">${skip ? `${skip} abstained` : 'Withheld'}</span><b>–</b></li>` : '';
  return `<ol>${li}${gaps}</ol>`;
}
function bTile(k, st, sm) {
  const s = SEG[k];
  let body;
  if (k === 'metals') body = `<p class="un">${ic('ban', 's14')}Forecast unavailable</p><p class="tm">${sm ? 'Not ranked (SCI-D08)' : 'XAU/USD and XAG/USD are not ranked until a valuation convention is set (SCI-D08). Prices still show.'}</p>`;
  else if (st === 'loading') body = `<ol>${[80, 70, 76, 62, 68].map(w => `<li style="display:block"><span class="sk" style="width:${w}%"></span></li>`).join('')}</ol>`;
  else if (st === 'empty') body = `<p class="tm">First list after the first daily run.</p>`;
  else if (st === 'noModel' && (k === 'midcap' || k === 'inetf')) body = `<p class="un">${ic('cube', 's14')}No approved model</p><p class="tm">Not ranked until one covers India at 3 to 12 months.</p>`;
  else body = tileRows(k, st);
  const foot = st === 'stale' && k !== 'metals' ? '<p class="tm">Ranked 2 Nov</p>' : st === 'offline' && k !== 'metals' ? '<p class="tm">Saved 21:15</p>' : '';
  return `<div class="segtile home-tile" style="--c:var(${s.c})" data-mo="card"><span class="mk">${s.mk}</span><div class="tn">${s.name}</div>${body}${foot}</div>`;
}
const board = (ctx, sm) => `<div class="home-board${isWide(ctx) ? ' w4' : ''}${sm ? ' sm' : ''}">${ORDER.map(k => bTile(k, ctx.state, sm)).join('')}</div>`;
const boardNote = {
  loading: () => banner('', 'Re-ranking.', 'The lists re-rank after each daily forecast run. The last good lists return when it lands.', 'refresh'),
  empty: () => stateCard('grid', 'No lists yet', 'The top 5 are ranked after each daily forecast run. Until the first run, no list and no score exists.'),
  error: () => banner('fall', 'Today\'s ranking run failed.', 'The lists from 2 November stay current, with their date, until a run succeeds.', 'alert'),
  stale: () => banner('warn', 'No ranking since the last close.', 'These lists are from 2 November and hold until the next daily run.', 'clock'),
  offline: () => banner('', 'Offline.', 'Lists from 21:15, saved on this device.', 'wifi-off'),
  noModel: () => banner('', 'India is not ranked.', 'No approved model covers India midcap or India ETFs yet. A missing part is never zero, so those lists wait.', 'cube'),
  disagreement: () => banner('', 'Two scores carry a conflict.', 'Rules and models disagree on INFY and AMZN. Their scores stand; neither gets an action.', 'split'),
  abstention: () => banner('', 'Two names dropped out.', 'TCS and IWM lost a part when the model abstained. Each list closes up, and nothing fills the gap.', 'ban')
};
const noteOf = ctx => (boardNote[ctx.state] ? boardNote[ctx.state]() : '');
const legendT = `<div class="legend"><span>${ic('check', 's14')}You hold it</span><span>Score out of 100</span><span>Ranked on 3 to 12 months, re-ranked daily</span><span>Illustrative</span></div>`;
const rule = () => `<div class="card home-card" data-mo="card"><h4>How a list is made</h4><p class="home-sub">Score = growth 35% + protection 40% + opportunity 25%, shown only when all three are eligible. A missing part is never zero, and never reweighted: that name is not ranked.</p><div class="t5r withheld" style="padding:4px 0;grid-template-columns:18px 30px minmax(0,1fr)"><span class="rk">–</span><span class="logo sm" style="background:var(--surface-3);color:var(--ink-2)">${ic('ban', 's14')}</span><div class="tt">A withheld score reads "Not ranked", with the parts it has.</div></div></div>`;

/* ---------- one segment ---------- */
const SEGSUB = { ustech: 'Nasdaq-100 technology names' };
function segHead(k) {
  const s = SEG[k];
  return `<div class="t5h" style="--c:var(${s.c})"><h4>Top 5 · ${s.name}</h4><p>${SEGSUB[k]} · ranked on 3 to 12 months · re-ranked daily</p></div>`;
}
const actOf = (t, st) => {
  if (st === 'disagreement' && t === 'AMZN') return `<span class="chip">${ic('split', 's14')}None</span>`;
  return byT[t] ? badge(byT[t].act) : watch;
};
function segPhone(k, st) {
  const rows = LIST[k].map((r, i) => `<div class="t5r home-t5" data-mo="rise"><span class="rk">${i + 1}</span>${logo(SEG[k].c, r[5], true)}<div class="tt">${r[0]}<span>${r[1]}${held(r[0]) ? ' · You hold it' : ' · Candidate'}</span></div><div class="score" role="img" aria-label="Score ${score(r)} of 100"><b>${score(r)}</b><i><u data-mo="barx" style="--v:${score(r)}%"></u></i></div>
    <div class="home-parts">Growth ${r[2]} · Protection ${r[3]} · Opportunity ${r[4]}</div>
    <div class="home-fl"><div class="rangewrap">${range(fcOf(r[0]))}</div><span class="fcv">${pct(fcOf(r[0]).med)} · 6M</span>${actOf(r[0], st)}</div></div>`).join('');
  return rows + withheld() + notRanked();
}
const withheld = () => `<div class="t5r withheld" data-mo="rise"><span class="rk">5</span><span class="logo sm" style="background:var(--surface-3);color:var(--ink-2)">${ic('ban', 's14')}</span><div class="tt" style="grid-column:3/5">Withheld: no other eligible listing</div></div>`;
const notRanked = () => `<div class="t5r home-t5" data-mo="rise"><span class="rk">–</span>${logo('--seg-ustech', 'Bc', true)}<div class="tt">AVGO<span>Broadcom · Candidate</span></div><div class="home-nr">Not ranked</div><div class="home-parts">Growth 72 · Protection 61 · Opportunity not eligible</div></div>`;
function segTable(k, st) {
  const tr = (r, i) => `<tr data-mo="rise"><td class="r">${i + 1}</td><td><div class="inst">${logo(SEG[k].c, r[5], true)}<div style="min-width:0"><b>${r[0]}</b><span>${held(r[0]) ? 'You hold it' : 'Candidate'}</span></div></div></td><td class="home-n"><div class="score" style="grid-template-columns:24px 34px"><b>${score(r)}</b><i><u data-mo="barx" style="--v:${score(r)}%"></u></i></div></td><td class="home-n">${r[2]}</td><td class="home-n">${r[3]}</td><td class="home-n">${r[4]}</td><td><span style="color:var(--fc-ink);font-weight:600">${pct(fcOf(r[0]).med)}</span><span class="home-range">${range(fcOf(r[0]), 74, 12)}</span></td><td>${actOf(r[0], st)}</td></tr>`;
  return `<table class="ht dk"><thead><tr><th class="r">#</th><th>Listing</th><th>Score</th><th class="home-n">Growth</th><th class="home-n">Protect.</th><th class="home-n">Opport.</th><th>6M</th><th>Action</th></tr></thead><tbody>${LIST[k].map(tr).join('')}<tr data-mo="rise"><td class="r">5</td><td colspan="7"><span class="muted">Withheld: no other eligible listing. Nothing is filled in.</span></td></tr><tr data-mo="rise"><td class="r">–</td><td><div class="inst">${logo('--seg-ustech', 'Bc', true)}<div style="min-width:0"><b>AVGO</b><span>Candidate</span></div></div></td><td><b style="font-weight:600">Not ranked</b></td><td class="home-n">72</td><td class="home-n">61</td><td class="home-n">–</td><td colspan="2"><span class="muted">Opportunity not eligible</span></td></tr></tbody></table>`;
}
const metalsCard = () => `<div class="card top5" data-mo="card"><div class="t5h" style="--c:var(--seg-metals)"><h4>Gold &amp; silver</h4><p>Spot quotes · no top 5 yet</p></div>${[['XAU/USD', 'Gold', '$2,684.20', -0.4, 'Au'], ['XAG/USD', 'Silver', '$31.72', 0.9, 'Ag']].map(([t, n, p, d, sym]) => `<div class="t5r" data-mo="rise" style="grid-template-columns:30px minmax(0,1fr) auto"><span class="logo sm" style="--c:var(--seg-metals)" aria-hidden="true">${sym}</span><div class="tt">${n}<span>${t} · price only</span></div><div style="text-align:right;font:600 15px/20px var(--font-text)">${p}<div style="font-size:13px;line-height:18px">${chg(d)}</div></div></div>`).join('')}<div class="t5foot" style="display:flex;gap:6px;align-items:flex-start">${ic('ban', 's14')}<span>Forecast unavailable: the valuation convention is open (SCI-D08). Neither metal is ranked, and nothing stands in for a score. Prices still show.</span></div></div>`;
function segMain(ctx) {
  const k = 'ustech', st = ctx.state;
  if (st === 'noModel') return metalsCard();
  const card = () => `<div class="card top5" data-mo="card">${segHead(k)}${isWide(ctx) ? segTable(k, st) : segPhone(k, st)}</div>`;
  return region(ctx, {
    what: 'This list',
    ok: card,
    loading: () => `<div class="card top5" data-mo="card">${segHead(k)}</div>` + skel(4),
    empty: () => stateCard('grid', 'No list yet', 'US tech is ranked after each daily run. Until the first run there is no list and no score, and nothing stands in for one.', '', '<span class="chip">Next run tomorrow 21:15</span>'),
    error: () => boardNote.error() + `<div>${btn('Try again', 'tinted', 'refresh')}</div>` + card(),
    stale: () => boardNote.stale() + card(),
    offline: () => boardNote.offline() + card(),
    disagreement: () => banner('', 'AMZN is split.', 'Rules point down and the model points up. Its score stands, each side is in its forecast, and it gets no action.', 'split') + card(),
    abstention: () => banner('', 'A name dropped out.', 'META lost its growth part when the model abstained, so it is not ranked. The list stays at four.', 'ban') + card()
  });
}
function segRail(ctx) {
  const st = ctx.state;
  if (st === 'noModel') return `<div class="card home-card" data-mo="card"><h4>Why this list waits</h4><p class="home-sub">This state is drawn on gold and silver, the case that exists today. It clears only when you set a valuation instant, a source and a calendar for each spot quote.</p></div>`;
  return `<div class="card home-card" data-mo="card"><div style="display:flex;align-items:center;gap:8px">${logo('--seg-ustech', 'M', true)}<h4 style="flex:1">Microsoft</h4><span class="chip illus">Candidate</span></div><div class="home-kv"><span>Score</span><b>74 · rank 1</b><span>6-month median</span><b>+7.0%</b><span>80% range</span><b>−8.8% to +22.0%</b><span>Action</span><b>Watch · decision support</b></div>${btn('Open the forecast', 'tinted', 'fan').replace('class="btn', 'class="btn sm')}</div>${rule()}`;
}

/* ---------- a suggested action ---------- */
function actionSheet(ctx) {
  const st = ctx.state, n = byT.NVDA;
  const shell = (head, html, foot = true) => `<div class="sheet home-sheet" role="dialog" aria-label="Suggested action" data-mo="rise"><div class="grabber"></div>${head}${html}${foot ? `<div class="acts"><button class="btn sm btn-tinted" type="button">Not now</button><button class="btn sm btn-primary" type="button">Record your decision</button></div>` : ''}</div>`;
  const head = a => `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">${a}<h4 style="flex:1">NVIDIA</h4><span class="chip illus">Decision support</span></div>`;
  const why = `<span class="lab">Why, at 6 months</span><ul class="home-ul"><li>Widest 80% range of the holdings: ${pct(n.lo)} to ${pct(n.hi)}.</li><li>13.5% of the portfolio, inside a US tech block of 31.0%.</li><li>Median ${pct(n.med)}, score 71, rank 2 in US tech.</li></ul>`;
  const unc = `<span class="lab">Uncertainty</span><div style="margin-top:6px">${range(n)}</div>`;
  const cf = `<span class="lab">If it were 10% smaller (computed by code)</span><div class="home-kv"><span>NVIDIA share</span><b>13.5% to 12.1%</b><span>US tech share</span><b>31.0% to 29.6%</b><span>Width of the portfolio's 80% range, 6M</span><b>24.7 to 24.0 pts</b></div>`;
  const ids = `<p class="home-sub" style="color:var(--ink);margin-top:10px">Policy v1 · R2-HGB v3 · Growth 88, Protection 52, Opportunity 78 · 3 sources. Illustrative. No trade is placed.</p>`;
  const body = why + unc + cf + ids;
  const noLabel = `<span class="lab">Component evidence</span><div class="home-kv"><span>Growth</span><b>88</b><span>Protection</span><b>52</b><span>Opportunity</span><b>78</b><span>Combined score</span><b>71</b></div>`;
  return shell(...({
    loading: [head(`<span class="sk" style="height:26px;width:72px"></span>`), `<span class="lab">Reading the last published ranking</span><span class="sk" style="height:14px;width:90%;margin-top:8px"></span><span class="sk" style="height:14px;width:70%;margin-top:6px"></span><p class="home-sub" style="margin-top:10px;color:var(--ink)">Last good 21:15. The action stays hidden until its reasons load.</p>`, false],
    empty: [head(`<span class="chip">${ic('equal', 's14')}No action</span>`), `<p class="lead">Nothing is suggested for NVIDIA today: no action band applies. Its range and score stay on its forecast.</p>`, false],
    error: [head(badge('Trim')), banner('fall', 'Reasons did not load.', 'The action comes from the 20:45 version. Its reasons stay hidden rather than guessed.', 'alert') + `<div class="acts"><button class="btn sm btn-tinted" type="button">${ic('refresh', 's16')}Try again</button><button class="btn sm btn-tinted" type="button">Not now</button></div>`, false],
    stale: [head(`<span class="chip stale">${ic('clock', 's14')}Stale</span>`), banner('warn', 'This action is stale.', 'An input went stale at 16:35, after publication. Trim is held, not current, until the next ranking run.', 'clock') + why, false],
    offline: [head(badge('Trim')), banner('', 'Offline.', 'Saved at 21:15. Recording a decision waits until you reconnect.', 'wifi-off') + why + cf, false],
    noModel: [head(`<span class="chip proposed"><span class="dot"></span>Unclassified</span>`), `<p class="lead">Action thresholds are not approved yet (FIN-OD-07), so this shows its evidence and no label, rather than a guess.</p>` + noLabel + ids, false],
    disagreement: [head(`<span class="chip">${ic('split', 's14')}Conflicted</span>`), `<span class="lab">Each side</span><div class="home-kv"><span>Rules, heuristic strength</span><b>Pause · moderate</b><span>R2-HGB v3, 6M median</span><b>${pct(n.med)}</b></div><p class="lead">Rules and models disagree, so no action is ranked. Both stay on the forecast.</p>` + ids, false],
    abstention: [head(`<span class="chip">${ic('ban', 's14')}Ineligible</span>`), `<p class="lead">The model abstained, so a part of the score is missing. NVIDIA is not ranked and carries no action until the next run.</p>` + noLabel.replace('<b>71</b>', '<b>Withheld</b>').replace('<b>78</b>', '<b>Abstained</b>'), false]
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
const filters = on => `<div class="home-chips" role="group" aria-label="Filters" data-mo="fade">${['All', 'US', 'UK', 'India', 'Equity', 'ETF'].map((t, i) => `<button class="chip${t === on ? ' owner' : ''}" type="button" aria-pressed="${t === on}">${t}</button>`).join('')}</div>`;
const lists = () => `<div class="card home-card" data-mo="card"><h4>Watchlists</h4><div class="home-kv"><span>Long-term ideas · 6 names</span><b>v4 · 2 Nov</b><span>India banks · 3 names</span><b>v2 · 28 Oct</b></div>${btn('Save this search as a list', 'tinted', 'plus').replace('class="btn', 'class="btn sm')}</div>`;
const candidate = () => `<div class="card home-card" data-mo="card"><div style="display:flex;align-items:center;gap:8px">${logo('--seg-n50', 'IC', true)}<h4 style="flex:1">ICICI Bank</h4><span class="chip illus">Candidate</span></div>
  <div class="home-kv"><span>Peers</span><b>HDFCBANK, SBIN</b><span>Benchmark</span><b>Nifty 50</b><span>Overlap with NIFTYBEES</span><b>8.9% of that ETF</b></div>
  <span class="label" style="margin-top:4px">At an example 5% size, in new money (computed by code)</span>
  <div class="home-kv"><span>India share</span><b>28.5% to 31.9%</b><span>Banks share</span><b>7.2% to 11.6%</b></div><p class="home-sub">Decision support, not advice. Illustrative.</p></div>`;
function searchMain(ctx, opts = {}) {
  const st = ctx.state, q = opts.q || 'bank';
  const field = `<div class="search on" data-mo="fade">${ic('search', 's18')}${q}</div>`;
  const list = (rows, html = '') => `${field}${filters('All')}${html}<div class="list card" style="margin:0">${rows}</div>`;
  const rows = RES.map(r => resRow(r)).join('');
  const un = `<div class="t5r" data-mo="rise" style="grid-template-columns:30px minmax(0,1fr) auto"><span class="logo sm" style="background:var(--surface-3);color:var(--ink-2)">${ic('ban', 's14')}</span><div class="tt">BANKNIFTY<span>Unavailable: rights unverified</span></div><span class="chip">Unavailable</span></div>`;
  return region(ctx, {
    what: 'Search',
    ok: () => list(rows),
    loading: () => `${field}${filters('All')}${skel(3)}`,
    empty: () => `<div class="search on" data-mo="fade">${ic('search', 's18')}xauusdt</div>${stateCard('search', 'No listing matches "xauusdt"', 'Try a ticker like XAU or a name like Gold. Outside the 150-name catalogue, ask Claude in chat: code checks coverage and cost, and you confirm before anything is added.', btn('Ask in chat', 'tinted'))}`,
    error: () => list(rows, banner('fall', 'That list did not save.', 'Your list stays at v4. Try again; a repeat cannot save it twice.', 'alert')),
    stale: () => list(rows, banner('warn', 'Scores are from 2 November.', 'No ranking has run since the last close, so each result carries its last score.', 'clock')),
    offline: () => `${field}${banner('', 'Offline.', 'Search covers your 7 holdings and 9 saved names on this device. The wider catalogue returns when you reconnect.', 'wifi-off')}<div class="list card" style="margin:0">${resRow(RES[1])}${resRow(RES[2])}</div>`,
    noModel: () => list(rows.replace('>62<', '>–<') + un, banner('', 'Some results have no score.', 'BANKBEES has no approved model, so it is not ranked. A listing with unverified rights shows as unavailable, never with made-up data.', 'cube')),
    disagreement: () => list(RES.map(r => resRow(r, r[0] === 'JPM' ? { score: ic('split', 's18') } : {})).join(''), banner('', 'JPM is split.', 'Rules and models disagree, so it carries no action. Its forecast shows both.', 'split')),
    abstention: () => list(RES.map(r => resRow(r, r[0] === 'HDFCBANK' ? { score: '–' } : {})).join(''), banner('', 'HDFCBANK is not ranked.', 'The model abstained at 6 months, so a part is missing and its score is withheld.', 'ban'))
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
  if (ctx.state === 'empty') return '';
  return `<div class="card" style="padding:12px 14px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 14px;align-items:baseline" data-mo="card"><div>${money('84,612.40', ctx.kind === 'pwa' ? 28 : 30)}</div><div style="text-align:right;font-size:13px;line-height:18px;letter-spacing:0">${chg(1, '+1.48%')} <span class="muted">today</span></div><div class="small muted" style="grid-column:1/-1">${metaOf(ctx)} · Illustrative</div></div>`;
};
const ldgr3 = (h, m) => {
  const r = f => { const k = f, s = Math.sqrt(k), med = h.med * k; return { med, lo: med - (h.med - h.lo) * s, hi: med + (h.hi - h.med) * s }; };
  const cell = f => { const c = r(f); return `<td class="r"><div style="color:var(--fc-ink);font-weight:600">${pct(c.med)}</div><div class="small muted" style="font-size:12px;line-height:16px">${pct(c.lo, 0)} to ${pct(c.hi, 0)}</div></td>`; };
  const blank = t => `<td class="r" colspan="3"><span class="small">${t}</span></td>`;
  const stale = h.stale || m.stale;
  return `<tr data-mo="rise"><td><div class="inst">${logo(h.c, h.lg, true)}<div style="min-width:0"><b>${h.n}</b><span>${h.t} · ${CCY[h.v]}</span></div></div></td><td class="r" style="font-weight:600">£${h.val}</td><td class="r">${stale ? `<span class="chg" style="color:var(--warn)">${ic('clock', 's14')}16:35</span>` : chg(h.day)}</td>${m.flS !== undefined ? blank(m.fl.replace(/<[^>]+>/g, '') || m.flS) : cell(.5) + cell(1) + cell(2)}<td>${m.act !== undefined ? m.act : badge(h.act)}</td><td>${dataCell(h, stale)}</td></tr>`;
};
function ledgerFull(ctx) {
  return `<div class="card" data-mo="card"><table class="ht dk"><thead><tr><th>Instrument</th><th class="r">Value</th><th class="r">Today</th><th class="r">3 months</th><th class="r">6 months</th><th class="r">12 months</th><th>Action</th><th>Data</th></tr></thead><tbody>${H.map(h => { const m = mods(ctx, h.t); return ldgr3(m.h || h, m); }).join('')}</tbody></table></div>`;
}
const openCell = ctx => `<tr class="home-open"><td colspan="4">${actionSheet(ctx).replace('class="sheet home-sheet"', 'class="home-sheet"').replace('<div class="grabber"></div>', '')}</td></tr>`;
function ledgerB(ctx, open) {
  const body = () => (isWide(ctx) ? (open ? ledgerDesk(ctx, 'NVDA') : ledgerFull(ctx)) : ledgerPwa(ctx, open ? 'NVDA' : '', open ? openCell(ctx) : ''));
  return region(ctx, {
    what: 'Holdings', ok: body, loading: () => skel(5),
    empty: () => stateCard('grid', 'No holdings yet', 'Add what you hold and the ledger starts. It never connects to a broker.', btn('Add a holding', 'primary', 'plus')),
    error: () => holdingsNote.error() + body(), stale: () => holdingsNote.stale() + body(), offline: () => holdingsNote.offline() + body(),
    noModel: () => holdingsNote.noModel() + body(), disagreement: () => holdingsNote.disagreement() + body(), abstention: () => holdingsNote.abstention() + body()
  });
}
const t5Card = (k, st) => {
  const s = SEG[k];
  if (k === 'metals') return metalsCard();
  const rows = LIST[k].filter(r => r[0] !== (DROP[st] || {})[k]);
  return `<div class="card top5" data-mo="card"><div class="t5h" style="--c:var(${s.c})"><h4>Top 5 · ${s.name}</h4><p>${s.note} · 3 to 12 months · re-ranked daily</p></div>${rows.map((r, i) => `<div class="t5r" data-mo="rise"><span class="rk">${i + 1}</span>${logo(s.c, r[5], true)}<div class="tt">${r[0]}<span>${r[1]}${held(r[0]) ? ' · You hold it' : ''}</span></div><div class="score" role="img" aria-label="Score ${score(r)} of 100"><b>${score(r)}</b><i><u data-mo="barx" style="--v:${score(r)}%"></u></i></div></div>`).join('')}${rows.length < 5 ? `<div class="t5r withheld" data-mo="rise"><span class="rk">${rows.length + 1}</span><span class="logo sm" style="background:var(--surface-3);color:var(--ink-2)">${ic('ban', 's14')}</span><div class="tt" style="grid-column:3/5">Withheld: no other eligible listing</div></div>` : ''}<div class="t5foot">Score = growth 35% + protection 40% + opportunity 25%, shown only when all three are eligible. Illustrative.</div></div>`;
};
const picker = (ctx, on) => `<div class="home-pick${isWide(ctx) ? ' w4' : ''}">${ORDER.map(k => tile(k, { sel: k === on, compact: true, nolead: true, slim: true, h: 44 })).join('')}</div>`;
function switcher(ctx, on = 'ustech') {
  const st = ctx.state;
  const pair = isWide(ctx) ? `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start">${t5Card(on, st)}${t5Card('n50', st)}</div>` : t5Card(on, st);
  const main = () => `${picker(ctx, on)}${pair}`;
  return region(ctx, {
    what: 'The lists', ok: main,
    loading: () => `${picker(ctx, on)}${skel(4)}`,
    empty: () => `${picker(ctx, on)}${boardNote.empty()}`,
    error: () => boardNote.error() + main(), stale: () => boardNote.stale() + main(), offline: () => boardNote.offline() + main(),
    noModel: () => `${picker(ctx, 'metals')}${metalsCard()}`,
    disagreement: () => boardNote.disagreement() + main(), abstention: () => boardNote.abstention() + main()
  });
}
function explorer(ctx) {
  const st = ctx.state, k = 'ustech';
  const field = `<div class="search" data-mo="fade">${ic('search', 's18')}Search 150 names</div>`;
  const chips = `<div class="home-chips" role="group" aria-label="Segment filter" data-mo="fade">${['US tech', 'Holdings', 'Watch-only', 'Not ranked'].map((t, i) => `<button class="chip${i === 0 ? ' owner' : ''}" type="button" aria-pressed="${i === 0}">${t}</button>`).join('')}</div>`;
  const rows = () => `${field}${chips}<div class="card top5" data-mo="card">${isWide(ctx) ? segTable(k, st) : segPhone(k, st)}</div>`;
  return region(ctx, {
    what: 'This list', ok: rows,
    loading: () => `${field}${chips}${skel(4)}`,
    empty: () => `${field}${chips}${stateCard('grid', 'No list yet', 'US tech is ranked after each daily run. Until the first run there is no list and no score.')}`,
    error: () => boardNote.error() + rows(), stale: () => boardNote.stale() + rows(), offline: () => boardNote.offline() + rows(),
    noModel: () => `${field}<div class="home-chips" data-mo="fade"><button class="chip owner" type="button" aria-pressed="true">Gold &amp; silver</button></div>${metalsCard()}`,
    disagreement: () => banner('', 'AMZN is split.', 'Rules and models disagree. Its score stands, and it gets no action.', 'split') + rows(),
    abstention: () => banner('', 'A name dropped out.', 'META lost its growth part when the model abstained, so the list stays at four.', 'ban') + rows()
  });
}

J.add({
  id: 'home', title: 'Home', stories: ['MP-153', 'MP-141', 'MP-135', 'MP-144', 'MP-148'],
  summary: 'What you own comes first, with its ranges. Below it, the top 5 for each of eight segments, ranked by code as decision support.',
  options: [{
    id: 'a', name: 'Tile board', rec: true,
    why: 'Your holdings fill the first screen with their ranges, and one board below shows all eight top 5s at a glance, in Prism\'s segment colours. A row or a tile opens its reasons, so home stays calm.',
    cost: 'Reasons and score parts sit one tap away, and a phone scrolls past seven two-line rows to reach the board.',
    screens: [{
      id: 'a-portfolio', title: 'Portfolio', note: 'Holdings first. The brief floats above the dock on a phone, so it never pushes a holding down; on iPad and desktop it takes the rail.',
      render: ctx => frame(ctx, {
        tab: 0, title: 'Portfolio', webActions: webSearch(ctx),
        accessory: ctx.state === 'empty' ? '' : briefPill(ctx),
        body: `${value(ctx)}${sec('Holdings', H36(1))}<div class="home-sub">${sup}</div>${holdings(ctx)}${isWide(ctx) ? `<span class="home-wl"></span>${sec('Top 5 by segment')}${ctx.state === 'empty' ? '' : noteOf(ctx)}${board(ctx.state === 'empty' ? { ...ctx, state: 'default' } : ctx, true)}${legendT}` : `<div class="card home-link" data-mo="card">${ic('grid', 's18')}<span>Top 5 by segment<small>8 segments, just below</small></span>${ic('chev-d', 's18')}</div>${costRow()}`}`,
        rail: isWide(ctx) ? `${briefCard(ctx)}<div class="card home-card" data-mo="card"><h4>Ranked actions</h4><p class="home-sub">Decision support, with the reasons a tap away.</p>${ctx.state === 'empty' ? '<p class="home-sub">None yet.</p>' : actRows(ctx, 3)}</div>${costRow()}` : ''
      })
    }, {
      id: 'a-board', title: 'Top 5 by segment', note: 'The same scroll as Portfolio, drawn from where the board begins. All eight segments, every name, on one screen.',
      render: ctx => frame(ctx, {
        tab: 0, title: 'Top 5', webActions: webSearch(ctx),
        body: `${noteOf(ctx)}${board(ctx)}${legendT}${isWide(ctx) ? `<div style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:14px">${rule()}${costRow()}</div>` : rule()}`
      })
    }, {
      id: 'a-segment', title: 'One segment', note: 'What a tile opens. A not-ranked listing shows the parts it has; the withheld fifth place stays empty. No model is drawn on gold and silver, where it is true today.',
      render: ctx => frame(ctx, { tab: 2, back: 'Portfolio', title: ctx.state === 'noModel' ? 'Gold & silver' : 'US tech', actions: tb('info', 'How a list is made'), webActions: webSearch(ctx), body: `<span class="home-wl"></span>${segMain(ctx)}`, rail: segRail(ctx) })
    }, {
      id: 'a-action', title: 'Suggested action', note: 'What a holding\'s action opens: reasons, uncertainty, what would change, and the versions behind it. Recording goes to the journal; nothing acts on it. No model shows the unclassified case, which holds until FIN-OD-07 is approved.',
      render: ctx => frame(ctx, { tab: 0, title: 'Portfolio', body: `${value(ctx)}${ledger({ ...ctx, state: 'default' })}`, sheet: actionSheet(ctx) })
    }, {
      id: 'a-brief', title: 'Daily brief', note: 'Actions, then risks, changes and upcoming events, with each market on its own clock. Empty is the first morning; a weekend brief waits on MP40-Q11.',
      render: ctx => { const b = briefBody(ctx); return frame(ctx, { tab: 0, back: 'Portfolio', title: 'Daily brief', actions: tb('info', 'About the brief'), body: b.left, rail: b.right }); }
    }, {
      id: 'a-search', title: 'Search', note: 'Holdings, watch-only and the 150-name universe stay visibly apart. Search cannot add a listing: that goes through chat, a coverage check and your confirm.',
      render: ctx => frame(ctx, { tab: 0, back: 'Portfolio', title: 'Search', actions: '<span></span>', body: searchMain(ctx), rail: searchRail(ctx) })
    }]
  }, {
    id: 'b', name: 'Ledger',
    why: 'Holdings, the top 5 and the 150-name universe share one row, and a row opens where it sits. More fits on a phone, search and segments are one place, and desktop shows 3, 6 and 12 months at once.',
    cost: 'One segment shows at a time, so you lose the all-eight view, and Prism\'s colour gives way to rows.',
    screens: [{
      id: 'b-ledger', title: 'Ledger', note: 'A one-line row for every holding, so all seven and the brief fit above the fold. Desktop widens the row to all three long horizons.',
      render: ctx => frame(ctx, {
        tab: 0, title: 'Portfolio', webActions: webSearch(ctx),
        body: `${strip(ctx)}${isWide(ctx) ? `<div class="home-sub">${sup}</div>` : `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px" data-mo="rise"><span class="label">7 holdings</span>${H36(1)}</div>`}${ledgerB(ctx)}${isWide(ctx) ? `<div style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:14px;align-items:start">${briefCard(ctx)}${costRow()}</div>` : `<div class="home-sub">${sup}</div><div class="card" data-mo="card">${briefPill(ctx)}</div>${costRow()}`}`
      })
    }, {
      id: 'b-open', title: 'A row opened', note: 'A tap opens the reasons in the row on a phone, and in the rail on iPad and desktop, with the ledger still in view.',
      render: ctx => frame(ctx, {
        tab: 0, title: 'Portfolio', webActions: webSearch(ctx),
        body: `<span class="home-wl"></span>${strip(ctx)}${ledgerB(ctx, true)}`,
        rail: isWide(ctx) ? actionSheet(ctx).replace('class="sheet home-sheet"', 'class="card home-card home-sheet"').replace('<div class="grabber"></div>', '') : ''
      })
    }, {
      id: 'b-top5', title: 'Top 5 in place', note: 'One card below the holdings, with eight segments as a picker, so the list changes under your thumb and you never leave home. No model is drawn on gold and silver.',
      render: ctx => frame(ctx, { tab: 0, title: 'Top 5', webActions: webSearch(ctx), body: switcher(ctx) })
    }, {
      id: 'b-explore', title: 'One segment', note: 'The segment\'s list is a filter on the universe: search and segments share a screen. No model is drawn on gold and silver.',
      render: ctx => frame(ctx, { tab: 2, title: 'Explore', webActions: webSearch(ctx), body: `<span class="home-wl"></span>${explorer(ctx)}`, rail: segRail(ctx) })
    }, {
      id: 'b-search', title: 'Search', note: 'Typing narrows the same ledger. The candidate opens beside it on iPad and desktop, and below it on a phone.',
      render: ctx => frame(ctx, { tab: 2, title: 'Explore', webActions: webSearch(ctx), body: searchMain(ctx), rail: searchRail(ctx) })
    }]
  }]
});
})();
