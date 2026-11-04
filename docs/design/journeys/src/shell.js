/* ---------- Prism Journeys: the registry, the device chrome and the state helpers every journey uses ---------- */
const STATES = [
  ['default', 'Ready'], ['loading', 'Loading'], ['empty', 'Empty'], ['error', 'Error'], ['stale', 'Stale'],
  ['offline', 'Offline'], ['noModel', 'No model'], ['disagreement', 'Disagreement'], ['abstention', 'Abstaining']
];
const SURFACES = [
  ['iphone', 'iPhone', 'phone', 390, 844], ['ipad', 'iPad', 'tab', 1180, 820],
  ['web', 'Desktop', 'win', 1200, 950], ['pwa', 'Phone web', 'phone', 390, 844]
];
const sum = { journeys: [], at: { j: 0, o: 0, s: 'iphone', st: 'default' }, flipped: {} };

/* ---------- the flip: both options kept on all eight journeys (the owner, 4 Nov 2026, MP-178). A flip is per journey. Proposed: it is
   absent while signed out, during a step-up, behind an open sheet, and on a proposal, an approval or a record being written, so it can
   never change what an approval binds. ---------- */
const FLIP_NAMES = { home: ['Tiles', 'Ledger'], holdings: ['Desk', 'One by one'], forecast: ['One horizon', 'Ladder'], research: ['Brief', 'Thread'], journal: ['Timeline', 'Lanes'], cost: ['Meter', 'Pill'], approvals: ['Queue', 'In place'], privacy: ['Centre', 'In place'] };
const pairs = (...p) => Object.fromEntries(p);
const FLIPS = {
  home: pairs(['a-portfolio', 'b-ledger'], ['a-12m', 'b-12m'], ['a-board', 'b-top5'], ['a-segment', 'b-explore'], ['a-seg-uslarge', 'b-top5-uslarge'], ['a-seg-n50', 'b-top5-n50'], ['a-seg-midcap', 'b-top5-midcap'], ['a-seg-usetf', 'b-top5-usetf'], ['a-seg-uketf', 'b-top5-uketf'], ['a-seg-inetf', 'b-top5-inetf'], ['a-seg-metals', 'b-top5-metals'], ['a-brief', 'b-brief'], ['a-search', 'b-search']),
  holdings: pairs(['a-list', 'b-accounts'], ['a-private', 'b-private'], ['a-one', 'b-one'], ['a-imports', 'b-imports'], ['a-done', 'b-done']),
  forecast: pairs(['a-forecasts', 'b-forecasts'], ['a-instrument', 'b-ladder'], ['a-technical', 'b-technical'], ['a-proof', 'b-proof'], ['a-views', 'b-views'], ['a-evidence', 'b-evidence'], ['a-scenarios', 'b-scenarios'], ['a-hzstates', 'b-hzstates'], ['a-3m', 'b-ladder'], ['a-12m', 'b-ladder'], ['a-short', 'b-ladder'], ['b-forecast', 'a-instrument']),
  research: pairs(['ra-brief', 'rb-today'], ['ra-card', 'rb-card'], ['ra-ask', 'rb-ask'], ['ra-memory', 'rb-memory'], ['ra-alert', 'rb-alert']),
  journal: pairs(['a-list', 'b-board'], ['a-one', 'b-one'], ['a-differ', 'b-differ']),
  cost: pairs(['cost-a-home', 'cost-b-home'], ['cost-a-month', 'cost-b-burn'], ['cost-a-limits', 'cost-b-limits'], ['cost-a-warned', 'cost-b-warned'], ['cost-a-reduced', 'cost-b-reduced'], ['cost-a-paused', 'cost-b-paused'], ['cost-a-sources', 'cost-b-log'], ['cost-a-fit', 'cost-b-fit']),
  approvals: pairs(['aa-queue', 'ab-home']),
  privacy: pairs(['privacy-a-centre', 'privacy-b-home'], ['privacy-a-devices', 'privacy-b-devices'], ['privacy-a-notice', 'privacy-b-notice'], ['privacy-a-data', 'privacy-b-checkup'])
};
/* A state that gives a screen another partner: on these two, the instrument in question is drawn on the dossier, not the ladder. */
const FLIP_TO = { forecast: { disagreement: { 'a-instrument': 'b-forecast', 'a-technical': 'b-forecast', 'b-ladder': 'a-3m', 'b-technical': 'a-3m' }, abstention: { 'a-instrument': 'b-forecast', 'a-technical': 'b-forecast', 'b-ladder': 'a-12m', 'b-technical': 'a-12m' } } };
/* States a pair does not flip in: a commit in flight or unknown, and a permission refused. */
const FLIP_OFF = { holdings: { 'a-done': ['loading', 'error', 'offline'], 'b-done': ['loading', 'error', 'offline'], 'a-private': ['error'], 'b-private': ['error'] } };
function flipHTML(ctx, iconOnly, spec) {
  const map = FLIPS[ctx.journey];
  if (!map || !ctx.screen || (spec && spec.sheet)) return '';
  if (((FLIP_OFF[ctx.journey] || {})[ctx.screen] || []).includes(ctx.state)) return '';
  const moved = ((FLIP_TO[ctx.journey] || {})[ctx.state] || {})[ctx.screen];
  const to = moved || map[ctx.screen] || Object.keys(map).find(k => map[k] === ctx.screen);
  if (!to) return '';
  const other = ctx.option === 'a' ? 'b' : 'a';
  return flipBtn(FLIP_NAMES[ctx.journey][other === 'a' ? 0 : 1], `data-flip="${ctx.journey}|${other}|${to}"`, iconOnly);
}

/* ---------- chrome: a journey writes its content once, and each device frames it ---------- */
const WEBTABS = [['home', 'Portfolio'], ['fan', 'Forecasts'], ['grid', 'Segments'], ['target', 'Record'], ['sliders', 'Settings']];
/* mode 'default' keeps the price chips as they are on a screen whose state is not about market data. Offline and loading are always shown. */
function freshRow(ctx, mode) {
  const st = mode && !['offline', 'loading'].includes(ctx.state) ? mode : ctx.state;
  if (st === 'offline') return `<div class="jfresh on-glass"><span class="chip offline">${ic('wifi-off', 's14')}Offline · from 21:15</span></div>`;
  if (st === 'error') return `<div class="jfresh on-glass"><span class="chip error">${ic('alert', 's14')}Twelve Data · error 21:14</span>${fresh('Yahoo')}</div>`;
  if (st === 'stale') return `<div class="jfresh on-glass">${fresh('Twelve Data')}${fresh('Yahoo', 'stale', 'HSBC stale')}</div>`;
  if (st === 'loading') return `<div class="jfresh on-glass"><span class="chip fresh"><span class="dot"></span>Refreshing · last good 21:15</span>${fresh('Twelve Data')}${fresh('Yahoo', 'stale', 'HSBC late')}</div>`;
  return `<div class="jfresh on-glass">${fresh('Twelve Data')}${fresh('Yahoo', 'stale', 'HSBC late')}</div>`;
}
const banner = (kind, title, text, icon = 'info') => `<div class="jbanner ${kind}" role="status">${ic(icon, 's18')}<div><b>${title}</b> ${text}</div></div>`;
const stateCard = (icon, title, text, action = '', foot = '') => `<div class="card state" data-mo="card"><div class="sh"><span class="ic">${ic(icon, 's18')}</span>${title}</div><p>${text}</p>${action}${foot ? `<div class="foot">${foot}</div>` : ''}</div>`;
const btn = (label, kind = 'primary', icon = '') => `<button class="btn btn-${kind}" type="button">${icon ? ic(icon, 's18') : ''}${label}</button>`;
const skel = (n = 3) => `<div class="list card" style="margin:0">${Array.from({ length: n }, skelRow).join('')}</div>`;

/* one region of a screen, in the state the review has selected. Give only what differs: the rest falls back to Prism's
   state card, keeps the last good figures in view where they exist, and always keeps freshness on screen. */
function region(ctx, o) {
  const st = ctx.state, ok = () => (typeof o.ok === 'function' ? o.ok() : o.ok) || '';
  const own = o[st];
  if (st !== 'default' && own !== undefined) return typeof own === 'function' ? own() : own;
  const what = o.what || 'This view';
  switch (st) {
    case 'loading': return skel(o.rows || 3);
    case 'empty': return stateCard('grid', 'Nothing here yet', `${what} fills in once there is something to show.`, o.emptyAction || '');
    case 'error': return stateCard('alert', 'This did not load', `${what} failed at 21:14. The last good figures stay on screen, labelled with their time.`, btn('Try again', 'tinted', 'refresh')) + ok();
    case 'stale': return banner('warn', 'Stale.', `${what} last updated 16:35. It is held until prices return.`, 'clock') + ok();
    case 'offline': return banner('', 'Offline.', `Showing ${what.toLowerCase()} from 21:15. Nothing updates until you reconnect.`, 'wifi-off') + ok();
    case 'noModel': return stateCard('cube', 'No approved model', `No approved model covers this yet, so no forecast is shown. Prices and holdings still work.`) + ok();
    case 'disagreement': return banner('', 'Models disagree.', 'R2-HGB v3 and the baseline differ on direction. Both ranges show, and no action is ranked.', 'split') + ok();
    case 'abstention': return stateCard('ban', 'The model abstained', `Too little comparable history for a calibrated range, so no range is shown.`) + ok();
    default: return ok();
  }
}

/* spec: { tab, title, back, actions: html, body: html, rail: html, accessory: html, sheet: html, field: bool } */
function frame(ctx, spec) {
  const tab = spec.tab ?? 0, sideTab = tab === 4 ? 5 : tab, field = spec.field === false ? '' : '<div class="dfield"></div>';   // tab 4 is Settings, the sidebar's sixth item
  const sheet = spec.sheet ? `<div class="jsheet${ctx.kind === 'iphone' || ctx.kind === 'pwa' ? '' : ' center'}"><div class="scrim"></div>${spec.sheet}</div>` : '';
  const dataRow = `<div style="margin:12px;padding:12px;border-radius:16px;background:var(--glass-thin);display:grid;gap:6px;justify-items:start" class="on-glass"><span class="label" style="color:var(--ink)">Data</span>${freshRow(ctx, spec.fresh)}<span class="small">${ctx.state === 'error' && !spec.fresh ? 'Last good run Mon 21:15 · cutoff 21:00' : 'As of 21:15 · cutoff 21:00'}</span></div>`;
  const sideList = () => (ctx.state === 'empty' ? side(sideTab).replace('<span class="n">7</span>', '') : side(sideTab));
  const backBtn = (size, style) => `<button class="jback" type="button" aria-label="Back to ${spec.back}" style="${style}">${ic('chev-l', size)}<span>${spec.back}</span></button>`;
  if (ctx.kind === 'iphone') {
    const nav = spec.back ? `<div class="navbar glass"><div class="nb">${backBtn('s24', 'font:400 17px/22px var(--font-text);letter-spacing:-.01em')}<span class="nbt">${spec.title}</span><span style="display:flex;gap:6px;align-items:center;justify-content:flex-end">${flipHTML(ctx, true, spec)}${spec.actions || ''}</span></div></div>` : '';
    return `<div data-contrast-exempt style="position:absolute;inset:0 0 auto;height:54px;z-index:25">${sbar()}</div>${field}<div class="jscroll"><div class="content" style="padding-top:${spec.back ? 102 : 54}px">
      ${spec.back ? '' : `<div style="display:flex;justify-content:flex-end;gap:8px;padding:4px 16px 0" data-mo="fade">${flipHTML(ctx, false, spec)}${spec.actions || tb('search', 'Search') + tb('eye-off', 'Hide amounts')}</div><div class="ltitle" style="margin-top:2px" data-mo="rise">${spec.title}</div>`}
      <div style="padding:6px 16px 12px">${freshRow(ctx, spec.fresh)}</div>
      <div class="jbody">${spec.body || ''}${spec.rail || ''}</div><div class="jspace${spec.accessory ? ' tall' : ''}"></div></div></div>${nav}
      ${spec.accessory ? `<div class="glass" style="position:absolute;left:12px;right:12px;bottom:96px;z-index:19;border-radius:18px;padding:8px">${spec.accessory}</div>` : ''}${dtab(tab)}${homeInd}${sheet}`;
  }
  if (ctx.kind === 'pwa') {
    return `<div style="position:absolute;inset:0 0 auto;height:54px;z-index:25">${sbar()}</div>
      <div class="glass" style="position:absolute;top:54px;left:0;right:0;z-index:20;display:flex;align-items:center;gap:10px;padding:8px 12px" data-mo="fade">${spec.back ? `<button class="jback" type="button" aria-label="Back to ${spec.back}">${ic('chev-l', 's24')}</button>` : '<span class="brand-mark" aria-hidden="true"></span>'}<span style="font:600 17px/22px var(--font-text);letter-spacing:-.01em">${spec.title}</span><span style="margin-left:auto;display:flex;gap:6px;align-items:center">${flipHTML(ctx, true, spec)}${spec.webActions ?? spec.actions ?? ''}</span></div>
      ${field}<div class="jscroll"><div class="content" style="padding-top:116px"><div style="padding:0 12px 10px">${freshRow(ctx, spec.fresh)}</div><div class="jbody" style="padding:0 12px">${spec.body || ''}${spec.rail || ''}</div><div class="jspace${spec.accessory ? ' tall' : ''}"></div></div></div>
      ${spec.accessory ? `<div class="glass" style="position:absolute;left:12px;right:12px;bottom:90px;z-index:19;border-radius:18px;padding:8px">${spec.accessory}</div>` : ''}
      <nav class="glass" style="position:absolute;left:0;right:0;bottom:0;z-index:20;height:80px" aria-label="Tabs">${tabbarEl(tab)}</nav>${homeInd}${sheet}`;
  }
  const cols = `<div class="jcols${spec.rail ? '' : ' one'}"><div>${spec.body || ''}</div>${spec.rail ? `<div>${spec.rail}</div>` : ''}</div>`;
  const head = `<div class="jtop" data-mo="rise">${spec.back ? backBtn('s18', 'font:400 15px/20px var(--font-text)') : ''}<span class="ttl">${spec.title}</span><div class="acts">${freshRow(ctx, spec.fresh)}${flipHTML(ctx, false, spec)}${spec.webActions ?? spec.actions ?? ''}</div></div>`;
  if (ctx.kind === 'ipad') {
    return `<div class="dfield" style="left:-10%;right:40%;top:-80px;height:900px"></div><div class="jipad">
      <div class="glass jside" style="padding-top:24px" data-mo="fade"><div style="display:flex;align-items:center;justify-content:space-between;padding:0 16px">${ic('sidebar', 's24')}<button class="tbtn" type="button" aria-label="Account">${ic('person', 's18')}</button></div><div style="padding:10px 12px 0"><div class="search">${ic('search', 's18')}Search</div></div><div class="side" style="flex:1">${sideList()}</div>${dataRow}</div>
      <div class="jpane" style="padding-top:16px">${head}${cols}</div></div>${sheet}`;
  }
  return `<div class="glass" style="position:absolute;inset:0 0 auto;height:38px;z-index:5;display:flex;align-items:center;gap:8px;padding:0 14px;border-radius:0"><span style="display:flex;gap:7px" aria-hidden="true"><i style="width:12px;height:12px;border-radius:50%;background:var(--fall)"></i><i style="width:12px;height:12px;border-radius:50%;background:var(--warn)"></i><i style="width:12px;height:12px;border-radius:50%;background:var(--rise)"></i></span><span style="margin:0 auto;display:flex;align-items:center;gap:6px;font:500 12px/16px var(--font-text);color:var(--ink)">${ic('lock', 's14')}MyPrediction · ${spec.title}</span></div>
    <div class="jweb" style="inset:38px 0 0"><div class="glass jside" style="border-radius:0" data-mo="fade"><div style="display:flex;align-items:center;gap:10px;padding:16px 18px 6px;font:600 17px/22px var(--font-text);letter-spacing:-.01em"><span class="brand-mark" aria-hidden="true"></span>MyPrediction</div><div class="side" style="flex:1">${sideList()}</div>${dataRow}</div>
      <div class="jpane">${head}${cols}</div></div>${sheet}`;
}

/* ---------- the registry ---------- */
const J = {
  /* J.add({ id, title, stories: ['MP-153'], summary, options: [{ id: 'a', name, rec: true, why, cost, screens: [{ id, title, note, na: { noModel: 'reason' }, render: ctx => frame(ctx, {...}) }] }] }) */
  add(j) { sum.journeys.push(j); },
  all: () => sum.journeys,
  start() {
    const hash = location.hash.slice(1).split('.');
    const i = sum.journeys.findIndex(j => j.id === hash[0]);
    if (i >= 0) sum.at.j = i;
    if (hash[1] === 'b') sum.at.o = 1;
    if (SURFACES.some(s => s[0] === hash[2])) sum.at.s = hash[2];
    if (STATES.some(s => s[0] === hash[3])) sum.at.st = hash[3];
    buildToc();
    if (hash[0] === 'inventory') showInventory(); else show();
    addEventListener('resize', fitFrames);
  },
  /* for scripts/design_journeys_check.mjs: every combination the review can reach */
  matrix() {
    return sum.journeys.flatMap(j => j.options.map(o => ({ j: j.id, o: o.id, screens: o.screens.map(s => ({ id: s.id, title: s.title, na: s.na || {} })) })));
  },
  go(j, o, s, st) { Object.assign(sum.at, { j: sum.journeys.findIndex(x => x.id === j), o: o === 'b' ? 1 : 0, s, st }); show(); }
};
window.__prismJourneys = J;
window.__prismStates = STATES;
window.__prismSurfaces = SURFACES;

function buildToc() {
  const toc = $('#toc');
  toc.innerHTML = sum.journeys.map((j, i) => `<a href="#${j.id}" data-i="${i}">${j.title}</a>`).join('') + `<a href="#inventory" data-i="inv">State inventory</a>`;
  toc.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    if (a.dataset.i === 'inv') { showInventory(); return; }
    sum.at.j = +a.dataset.i; sum.at.o = 0; show();
    scrollTo({ top: 0 });
  });
}
function mark(i) {
  $$('#toc a').forEach(a => { if (a.dataset.i === String(i)) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
}
function chips(el, items, on, pick) {
  el.innerHTML = items.map(([k, t, dis]) => `<button type="button" data-k="${k}" aria-pressed="${k === on}"${dis ? ` disabled title="${dis}"` : ''}>${t}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('button'); if (b && !b.disabled) pick(b.dataset.k); };
}
/* A wide frame fits the page, so its right-hand column never hides off to the side. Below 70% it scrolls instead, to stay readable. */
function fitFrames() {
  const row = $('#jrow');
  if (window.__prismNoFit || !row || !row.classList.contains('wide')) return;
  $$('.board > .dev', row).forEach(d => {
    d.style.zoom = '';
    const z = (d.parentElement.clientWidth - 8) / d.offsetWidth;
    if (z < 1) d.style.zoom = Math.max(.7, z).toFixed(3);
  });
}
function show() {
  const j = sum.journeys[sum.at.j], o = j.options[sum.at.o], surf = SURFACES.find(s => s[0] === sum.at.s);
  $('#jinv').hidden = true;
  ['#jrow', '#jwhy', '.jctl', '.jhead'].forEach(s => { $(s).hidden = false; });
  mark(sum.at.j);
  $('#jtitle').textContent = j.title;
  $('#jsummary').textContent = j.summary;
  $('#jmeta').innerHTML = `<span class="chip proposed"><span class="dot"></span>Proposed</span><span class="chip owner"><span class="dot"></span>Both kept, with a flip</span><span class="chip illus">Not approved UX</span><span class="chip illus">All figures illustrative</span>${(j.stories || []).map(s => `<span class="chip">${s}</span>`).join('')}`;
  $('#jopt').innerHTML = seg(j.options.map(x => [`${x.id.toUpperCase()} · ${x.name}${x.rec ? ' (starts here, proposed)' : ''}`]), sum.at.o, 'Option', 'full');
  $('#jopt').onclick = e => { const b = e.target.closest('button'); if (!b) return; sum.at.o = $$('#jopt button').indexOf(b); sum.flipped = {}; show(); };
  $('#jsurf').innerHTML = seg(SURFACES.map(s => [s[1]]), SURFACES.indexOf(surf), 'Device', 'full');
  $('#jsurf').onclick = e => { const b = e.target.closest('button'); if (!b) return; sum.at.s = SURFACES[$$('#jsurf button').indexOf(b)][0]; show(); };
  const naAll = k => k !== 'default' && o.screens.every(s => (s.na || {})[k]);
  chips($('#jstate'), STATES.map(([k, t]) => [k, t, naAll(k) ? 'Does not apply to this journey' : '']), sum.at.st, k => { sum.at.st = k; show(); });
  $('#jwhy').innerHTML = `<p><b>${o.rec ? 'Why it would start here (proposed).' : 'What this view does.'}</b> ${o.why}</p>${o.cost ? `<p><b>What it costs.</b> ${o.cost}</p>` : ''}`;
  const scheme = () => { const t = root.getAttribute('data-theme'); return t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); };
  const row = $('#jrow');
  row.classList.toggle('wide', surf[2] !== 'phone');
  /* A turned slot stays turned across states and devices, until it is turned back or the option changes. */
  const slotKey = s => `${j.id}|${o.id}|${s.id}`;
  const sideOf = s => {
    const f = sum.flipped[slotKey(s)];
    return f ? { oid: f[0], sc: j.options.find(x => x.id === f[0]).screens.find(x => x.id === f[1]) } : { oid: o.id, sc: s };
  };
  const ctxFor = (oid, sc, extra = {}) => ({ kind: surf[0], state: (sc.na || {})[sum.at.st] ? 'default' : sum.at.st, scheme: scheme(), journey: j.id, option: oid, screen: sc.id, ...extra });
  const noteFor = sc => { const r = (sc.na || {})[sum.at.st]; return r ? `This state does not apply here: ${r}` : sc.note || ''; };
  /* the caption, note, group name and data-at follow what the frame shows; a turned frame says so */
  const dress = (box, oid, sc) => {
    const scr = $('.scr', box), cap = $('.bcap', box), note = $('.jnote', box), scheme_ = scheme();
    scr.dataset.at = `${j.id}|${oid}|${sc.id}`;
    scr.setAttribute('aria-label', `${sc.title}, ${scheme_} theme`);
    cap.innerHTML = `<span class="tag">${scheme_ === 'light' ? 'Light' : 'Dark'}</span>${sc.title}${oid === o.id ? '' : ` <span class="chip illus">Turned to ${oid.toUpperCase()} · ${FLIP_NAMES[j.id][oid === 'a' ? 0 : 1]}</span>`}`;
    note.textContent = noteFor(sc);
  };
  const boardFor = s => {
    const { oid, sc } = sideOf(s), ctx = ctxFor(oid, sc);
    return `<div data-slot="${s.id}">${boardHTML(surf[2], surf[3], surf[4], sc.render(ctx), ctx.scheme, sc.title)}<p class="jnote">${noteFor(sc)}</p></div>`;
  };
  const settle = el => {
    (el.matches('[data-slot]') ? [el] : $$('[data-slot]', el)).forEach(box => { const s = o.screens.find(x => x.id === box.dataset.slot), side = sideOf(s); dress(box, side.oid, side.sc); });
    $$('svg.cx.inter', el).forEach(wire);
    fitFrames();
    watch(row);
  };
  /* the flip turns this one frame, as the app would. The rest of the row stays where it is. */
  row.onclick = e => {
    const b = e.target.closest('[data-flip]');
    if (!b) return;
    const box = b.closest('[data-slot]'), s = o.screens.find(x => x.id === box.dataset.slot), scr = b.closest('.scr'), key = slotKey(s);
    if (sum.flipped[key]) delete sum.flipped[key]; else { const f = b.dataset.flip.split('|'); sum.flipped[key] = [f[1], f[2]]; }
    (window.__prismNoFit ? (el, fn) => fn() : flipTurn)(scr, () => {
      const { oid, sc } = sideOf(s);
      scr.innerHTML = sc.render(ctxFor(oid, sc, { hz: scr.dataset.hz, mode: scr.dataset.mode }));
      $$('svg.cx.inter', scr).forEach(wire);
      $$('[data-mo]', scr).forEach(n => n.removeAttribute('data-mo'));
      dress(box, oid, sc);
      const next = $('[data-flip]', scr);
      if (next) next.focus({ preventScroll: true });
      $('#jlive').textContent = `${sc.title}: ${FLIP_NAMES[j.id][oid === 'a' ? 0 : 1]} view`;
    });
  };
  /* Screens draw one at a time, each after the press has answered, so a long journey never holds a frame. The walker draws them all. */
  const all = o.screens, run = sum.run = {};
  let at = window.__prismNoFit ? all.length : 0;
  if (at) { row.innerHTML = all.map(boardFor).join(''); settle(row); }
  const more = () => {
    if (sum.run !== run || at >= all.length) return;
    if (!at) row.innerHTML = '';
    row.insertAdjacentHTML('beforeend', boardFor(all[at++]));
    settle(row.lastElementChild);
    setTimeout(more, 16);
  };
  setTimeout(more, 16);
  try { history.replaceState(null, '', `#${j.id}.${o.id}.${surf[0]}.${sum.at.st}`); } catch (e) { /* the view still shows */ }
}
const OPEN = [
  ['Where do Research, Approvals and Imports live in the navigation? Neither the five tabs nor the sidebar has them.', 'Research hangs off Portfolio; Approvals and Imports sit under Settings.'],
  ['MP-144 lets a candidate be labelled buy or watch, and MP never trades. Which word?', 'Watch only.'],
  ['Is Claude on or off at launch? Admissible credit is zero today.', 'Ready shows Claude on, £54.73. Claude off is the No model state.'],
  ['Does the portfolio total include cash?', 'The shared total holds no cash; £5,542.85 shows apart.'],
  ['How does the flip behave? Which view does each journey start in, is the choice kept per device, and is it one flip per journey?', 'Proposed · MP-178: each journey starts in A, keeps your choice on that device, and flips on its own. No flip while signed out, during a step-up, behind an open sheet, or on a proposal, an approval or a record being written.'],
  ['How much cost shows on Home, and may a card sit before the holdings on a phone?', 'Cost flips between a meter and a pill on its own Home screens. The Home journey keeps a plain row after the holdings.'],
  ['When is a late price still used in the total? (MP40-Q6)', 'Proposed: Ready keeps HSBC at its 14:10 price, inside the limit, with its forecast held. Stale leaves it out of the total.'],
  ['Action thresholds (FIN-OD-07)', 'Every action label is provisional. No model shows the unclassified case.'],
  ['Scenario returns (SCI-D06)', 'The figures are placeholders. Empty is the state today.'],
  ['Import limits and locked PDFs (MP40-Q1, MP40-Q2)', 'Labelled proposed: unlock on your device.'],
  ['Billing data and freshness (MP40-Q5, MP40-Q6)', 'Labelled proposed.'],
  ['Weekend brief (MP40-Q11)', 'Not drawn.'],
  ['Do units count as amounts when amounts are hidden? (MP-84)', 'Proposed: units stay in view; money is masked.'],
  ['How does rebasing a part of a history work? (FIN-OD-03)', 'Labelled proposed, and its approval is disabled.'],
  ['With the model abstaining at 12 months, does a holding keep its action at 3 and 6 months? (MP-144)', 'Proposed: Apple is not ranked in US tech, and its Hold stands.'],
  ['How long does an approved switch forward or restart stay open? (SCI-D07)', 'Proposed: 15 minutes after you approve.'],
  ['Must ranges show on Home itself? MP-153 asks for them, and a tile cannot hold one.', 'Home A shows ranges one tap in, on every segment list, and says so in its cost. Home B shows them in the rows.'],
  ['Can a decision be recorded against an abstention? (MP-158)', 'Proposed: no new entry, because an entry ties to the exact action shown. Past entries stand, and a disagreement stays recordable.'],
  ['Where do track records by horizon and regime live? (MP-154)', 'Not drawn. The journal shows only the scored decisions.'],
  ['What no clear view, a cost pause and the technical mode show on a forecast (MP-145)', 'Labelled proposed.'],
  ['Gold and silver have no short-term rows, views or scenarios (SCI-D08)', 'Labelled proposed.'],
  ['Probation at 6 and 12 months, where nothing matures in the first 4 live weeks; the bad-week rule; restarting a paused scope (SCI-D07)', 'Labelled proposed. Probation ends with no score at those horizons.'],
  ['What counts as beating the rules, and how rules are scored (SCI-D03)', 'Labelled proposed.'],
  ['How long a risk alert cools down (CT-18)', 'No time is promised.'],
  ['May a budget be raised through an approval? MP-114 bars it and MP-78 lists it as a sensitive action.', 'Not drawn. The records conflict.'],
  ['Which runs does a Reduce line cut? (MP-103)', 'Labelled proposed: fewer optional runs.'],
  ['A revoked device that has not connected can still read its saved copy, against MP-165. Is that acceptable?', 'Proposed: it clears when it next connects (MP40-Q12).'],
  ['What is kept offline, and which devices (MP40-Q12)', 'Labelled proposed.'],
  ['Revocation time (CT-17) and which acts need a fresh sign-in (CT-01)', 'No exact time is promised. Every approval asks for a fresh sign-in, in both options. Renewing an original and turning on a less private option also ask for one (Proposed · CT-01).']
];
function showInventory() {
  mark('inv');
  ['#jrow', '#jwhy', '.jctl', '.jhead'].forEach(s => { $(s).hidden = true; });
  const inv = $('#jinv'); inv.hidden = false;
  let cells = 0, drawn = 0, na = 0;
  const rows = sum.journeys.flatMap(j => j.options.flatMap(o => [`<tr class="jgrp"><td colspan="${STATES.length + 1}">${j.title} · ${o.id.toUpperCase()} · ${o.name}</td></tr>`].concat(o.screens.map(s => `<tr><td>${s.title}</td>${STATES.map(([k, t]) => {
    cells++;
    const r = (s.na || {})[k];
    if (r) { na++; return `<td class="n" title="${r}">n/a</td>`; }
    drawn++;
    return `<td class="y"><button type="button" aria-label="${s.title}, ${t}" data-go="${j.id}|${o.id}|${k}">${ic('check', 's16')}</button></td>`;
  }).join('')}</tr>`))));
  inv.innerHTML = `<h2>State inventory</h2><p class="sum">Every screen against every state, generated from the screens themselves. ${drawn} of ${cells} cells are drawn; ${na} do not apply, each with its reason. Each screen also adapts to iPhone, iPad, desktop and phone web, in light and dark. Tap a tick to open that state.</p><div class="tblwrap"><table class="spec"><thead><tr><th>Screen</th>${STATES.map(s => `<th>${s[1]}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  const naRows = sum.journeys.flatMap(j => j.options.flatMap(o => o.screens.flatMap(s => Object.entries(s.na || {}).map(([k, r]) => `<tr><td>${j.title} · ${o.id.toUpperCase()} · ${s.title}</td><td>${(STATES.find(x => x[0] === k) || [k, k])[1]}</td><td>${r}</td></tr>`))));
  inv.insertAdjacentHTML('beforeend', `<h2 style="margin-top:32px">What a flip changes</h2><p class="sum">A flip turns the view of a place. The figures, the freshness, the provider status and the risk stay the same; only the layout changes. Proposed: no flip while signed out, during a step-up, behind an open sheet, or on a proposal, an approval or a record being written. So screens such as a proposal, a sign-in or a record in progress show no flip control.</p><h2 style="margin-top:32px">Cells that do not apply</h2><p class="sum">Why each of the ${na} cells cannot occur on its screen. This is a reading of "every screen shows", put to you to accept.</p><div class="tblwrap"><table class="spec"><thead><tr><th>Screen</th><th>State</th><th>Why it cannot occur</th></tr></thead><tbody>${naRows.join('')}</tbody></table></div>`);
  inv.insertAdjacentHTML('beforeend', `<h2 style="margin-top:32px">What these screens wait on</h2><p class="sum">Both options stay on all eight journeys, with a flip. These questions cross journeys, and each is drawn as the records stand today, labelled where it is proposed.</p><div class="tblwrap"><table class="spec"><thead><tr><th>Question</th><th>How it is drawn</th></tr></thead><tbody>${OPEN.map(([q, d]) => `<tr><td>${q}</td><td>${d}</td></tr>`).join('')}</tbody></table></div><h2 style="margin-top:32px">Checked against current releases</h2><p class="sum">Checked on 4 November 2026 and nothing is installed. SvelteKit 3.1.1 with Svelte 5.57.3 on npm, which matches SvelteKit 3 in TECH-STACK. Current simulators list iPhone 17, 17 Pro, 17 Pro Max and 17e, the iPhone 16 family, iPad, iPad Air and iPad Pro (M4 and M5). The frames here are 390 × 844 and 1180 × 820. They are drawing sizes, not a device promise: which devices are supported is still open (MP40-Q12).</p>`);
  inv.onclick = e => { const b = e.target.closest('[data-go]'); if (!b) return; const [jj, oo, k] = b.dataset.go.split('|'); J.go(jj, oo, sum.at.s, k); scrollTo({ top: 0 }); };
  try { history.replaceState(null, '', '#inventory'); } catch (e) { /* the view still shows */ }
}
