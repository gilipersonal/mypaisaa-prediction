/* ---------- Prism Admin (MP-64): the registry, the device chrome and the state helpers. Adapted from Prism Journeys; there is no flip here, because the owner picks one option per journey (PH00-S06). ---------- */
const STATES = [
  ['default', 'Ready'], ['loading', 'Loading'], ['empty', 'Empty'], ['partial', 'Partial'], ['error', 'Failed'], ['stale', 'Stale'],
  ['offline', 'Offline'], ['conflict', 'Conflicting'], ['expired', 'Expired'], ['denied', 'Denied']
];
const PERMS = /*PERMISSIONS*/null;
/* Every control that changes something comes from the permission inventory, so a screen cannot grow an action the inventory does not list. */
const perm = id => { const p = PERMS.actions.find(a => a.id === id); if (!p) throw new Error(`no action ${id} in permissions.json`); return p; };
const proposed = id => `<span class="chip proposed"><span class="dot"></span>Proposed · ${id}</span>`;
function act(id, label, kind = 'tinted', icon = '') {
  const p = perm(id);
  if (p.step_up === 'outside') throw new Error(`${id} is not an MP control: say where it happens, and draw no button`);
  const guard = p.step_up === 'yes' ? '<span class="small">Asks for a fresh sign-in</span>' : p.step_up === 'open' ? proposed('CT-01') : '';
  return `<span class="aact" data-act="${id}"><button class="btn btn-${kind}" type="button">${p.step_up === 'yes' ? ic('lock', 's18') : (icon ? ic(icon, 's18') : '')}${label}</button>${guard}</span>`;
}
function refused(id, text) {
  if (!PERMS.refused.some(r => r.id === id)) throw new Error(`no refused act ${id} in permissions.json`);
  return `<div class="arefuse" data-refuse="${id}">${ic('ban', 's18')}<span>${text}</span></div>`;
}
/* ---------- Prism rows and small parts, composed the same way on every screen ---------- */
const wide = ctx => ctx.kind === 'ipad' || ctx.kind === 'web';
const browser = ctx => ctx.kind === 'web' || ctx.kind === 'pwa';
const plain = t => String(t).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const bs = (label, kind = 'tinted', icon = '') => `<button class="btn sm btn-${kind}" type="button">${icon ? ic(icon, 's16') : ''}${label}</button>`;
const lead = (i, tone = '') => { const [bg, fg] = tone === 'warn' ? ['--warn-tint', '--warn'] : tone === 'fall' ? ['--fall-tint', '--fall'] : tone === 'rise' ? ['--rise-tint', '--rise'] : tone === 'sel' ? ['--surface', '--ink'] : ['--surface-2', '--ink']; return `<span class="logo" style="--c:var(${bg});color:var(${fg});--ic2:var(--link)" aria-hidden="true">${ic(i, 's18')}</span>`; };
/* open marks a row that opens something: a real control, named by all its visible words, its status too */
const item = (l, t, s, r = '', x = '', sel = false, open = false) => `<div class="hrow${sel ? ' sel' : ''}" data-mo="rise"${open ? ` role="button" tabindex="0" aria-label="${[t, s, r, x].map(plain).filter(Boolean).join(', ')}"` : ''}>${l}<div style="min-width:0"><div class="nm" style="white-space:normal">${t}</div><div class="tk" style="white-space:normal">${s}</div></div><div class="vv" style="justify-self:end;text-align:right">${r}</div>${x ? `<div class="fl" style="display:block">${x}</div>` : ''}</div>`;
const list = rows => `<div class="list card" style="margin:0" data-mo="card">${rows}</div>`;
const sec = (t, r = '') => `<div class="sech" style="padding:8px 4px 0" data-mo="rise"><h3 style="font:600 17px/22px var(--font-text);letter-spacing:-.01em">${t}</h3>${r}</div>`;
const kv = rows => `<dl class="kv">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
const box = (inner, st = '') => `<div class="card fcard" data-mo="card" style="${st}">${inner}</div>`;
const lbl = t => `<div class="label">${t}</div>`;
const PLACES = [['files', 'Files and imports', 'layers'], ['audit', 'Audit', 'shield'], ['runs', 'Runs and health', 'refresh'], ['agents', 'Agents', 'cube'], ['models', 'Models and evaluations', 'fan'], ['approvals', 'Approvals and configuration', 'sliders'], ['costs', 'Costs and budgets', 'target'], ['incidents', 'Incidents and recovery', 'alert'], ['identity', 'Identity and devices', 'person']];
const adminSide = on => [['home', 'Admin home', 'home'], ...PLACES].map(([k, n, i]) => `<div class="si${k === on ? ' on' : ''}">${ic(i, 's18')}${n}</div>`).join('');
const SURFACES = [
  ['iphone', 'iPhone', 'phone', 390, 844], ['ipad', 'iPad', 'tab', 1180, 820],
  ['web', 'Desktop', 'win', 1200, 950], ['pwa', 'Phone web', 'phone', 390, 844]
];
const sum = { journeys: [], at: { j: 0, o: 0, s: 'iphone', st: 'default' }, flipped: {} };

/* ---------- no flip in admin: these stay empty, so no control is drawn ---------- */
const FLIP_NAMES = {}, FLIP_AT = {}, FLIPS = {}, FLIP_TO = {}, FLIP_OFF = {};
/* Where a screen turns to in a state. One lookup, for the control and for a frame that stays turned as the state changes. */
function flipTarget(journey, screen, state) {
  const map = FLIPS[journey];
  if (!map || ((FLIP_OFF[journey] || {})[screen] || []).includes(state)) return null;
  return ((FLIP_TO[journey] || {})[state] || {})[screen] || map[screen] || Object.keys(map).find(k => map[k] === screen) || null;
}
const flipName = (journey, option, to) => FLIP_AT[to] || FLIP_NAMES[journey][option === 'a' ? 0 : 1];
function flipHTML(ctx, iconOnly, spec) {
  if (!ctx.screen || (spec && spec.sheet)) return '';
  const to = flipTarget(ctx.journey, ctx.screen, ctx.state);
  if (!to) return '';
  const other = ctx.option === 'a' ? 'b' : 'a';
  return flipBtn(flipName(ctx.journey, other, to), `data-flip="${ctx.journey}|${other}|${to}"`, iconOnly);
}

/* ---------- chrome: a journey writes its content once, and each device frames it ---------- */
const WEBTABS = [['home', 'Portfolio'], ['fan', 'Forecasts'], ['grid', 'Segments'], ['target', 'Record'], ['sliders', 'Settings']];
/* Admin's freshness is the records', not the market's. It stays in view in every state. */
function freshRow(ctx) {
  const c = (k, t, i) => `<span class="chip ${k}">${i ? ic(i, 's14') : '<span class="dot"></span>'}${t}</span>`;
  const st = ctx.state;
  const chip = { offline: c('offline', 'Offline · from 11:20', 'wifi-off'), error: c('error', 'Records failed 11:38 · last good 11:20', 'alert'), stale: c('stale', 'Index lagging · from 11:12', 'clock'), loading: c('fresh', 'Refreshing · last good 11:20'), partial: c('stale', 'Partial · 3 of 4 sources', 'clock') }[st] || c('fresh', 'Records current · 11:40');
  return `<div class="jfresh on-glass">${chip}</div>`;
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
    case 'partial': return banner('warn', 'Partial.', `${what}: 3 of 4 sources answered. What is missing is named, and never counted as zero.`, 'clock') + ok();
    case 'error': return stateCard('alert', 'This did not load', `${what} failed at 11:38. The last good records stay on screen, labelled with their time.`, btn('Try again', 'tinted', 'refresh')) + ok();
    case 'stale': return banner('warn', 'Stale.', `${what} is from 11:12, because the index is lagging. Nothing here is newer than that.`, 'clock') + ok();
    case 'offline': return banner('', 'Offline.', `Showing ${what.toLowerCase()} from 11:20. Nothing can be changed until you reconnect.`, 'wifi-off') + ok();
    case 'conflict': return banner('warn', 'Conflicting.', `${what} changed while you were reading, so this stays at the version you opened. Nothing was applied.`, 'split') + ok();
    case 'expired': return banner('warn', 'Expired.', `${what}: the request passed its time, so nothing ran. It needs a new request.`, 'clock') + ok();
    case 'denied': return stateCard('lock', 'A fresh sign-in is needed', 'Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in.', btn('Sign in again', 'primary', 'lock')) + ok();
    default: return ok();
  }
}

/* spec: { tab, title, back, actions: html, body: html, rail: html, accessory: html, sheet: html, field: bool } */
function frame(ctx, spec) {
  const tab = spec.tab ?? 4, field = spec.field === false ? '' : '<div class="dfield"></div>';   // tab 4 is Settings, the sidebar's sixth item
  const sheet = spec.sheet ? `<div class="jsheet${ctx.kind === 'iphone' || ctx.kind === 'pwa' ? '' : ' center'}"><div class="scrim"></div>${spec.sheet}</div>` : '';
  const dataRow = `<div style="margin:12px;padding:12px;border-radius:16px;background:var(--glass-thin);display:grid;gap:6px;justify-items:start" class="on-glass"><span class="label" style="color:var(--ink)">Records</span>${freshRow(ctx)}<span class="small">Wed 4 Nov · London</span></div>`;
  const sideList = () => adminSide(ctx.journey);
  const backBtn = (size, style) => `<button class="jback" type="button" aria-label="Back to ${spec.back}" style="${style}">${ic('chev-l', size)}<span>${spec.back}</span></button>`;
  if (ctx.kind === 'iphone') {
    /* A back label that would run into the centred title gives way, as on iOS: the chevron stays, and it keeps its name for a screen reader. */
    const fits = spec.back && spec.back.length * 9 + spec.title.length * 4.8 + 40 < 190;
    const back = fits ? backBtn('s24', 'font:400 17px/22px var(--font-text);letter-spacing:-.01em') : `<button class="jback" type="button" aria-label="Back to ${spec.back}">${ic('chev-l', 's24')}</button>`;
    const nav = spec.back ? `<div class="navbar glass"><div class="nb">${back}<span class="nbt">${spec.title}</span><span style="display:flex;gap:6px;align-items:center;justify-content:flex-end">${flipHTML(ctx, true, spec)}${spec.actions || ''}</span></div></div>` : '';
    return `<div data-contrast-exempt style="position:absolute;inset:0 0 auto;height:54px;z-index:25">${sbar()}</div>${field}<div class="jscroll"><div class="content" style="padding-top:${spec.back ? 102 : 54}px">
      ${spec.back ? '' : `<div style="display:flex;justify-content:flex-end;gap:8px;padding:4px 16px 0" data-mo="fade">${flipHTML(ctx, false, spec)}${spec.actions || tb('search', 'Search')}</div><div class="ltitle" style="margin-top:2px" data-mo="rise">${spec.title}</div>`}
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
    if (hash[0] === 'inventory') showInventory(); else if (hash[0] === 'permissions') showPermissions(); else if (hash[0] === 'coverage') showCoverage(); else show();
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
window.__prismFlipless = true;
window.__prismSurfaces = SURFACES;

function buildToc() {
  const toc = $('#toc');
  toc.innerHTML = sum.journeys.map((j, i) => `<a href="#${j.id}" data-i="${i}">${j.title}</a>`).join('') + `<a href="#inventory" data-i="inv">State inventory</a><a href="#permissions" data-i="perm">Permission inventory</a><a href="#coverage" data-i="cov">What each journey covers</a>`;
  toc.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    if (a.dataset.i === 'inv') { showInventory(); return; }
    if (a.dataset.i === 'perm') { showPermissions(); return; }
    if (a.dataset.i === 'cov') { showCoverage(); return; }
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
  $('#jmeta').innerHTML = `<span class="chip proposed"><span class="dot"></span>Proposed</span><span class="chip owner"><span class="dot"></span>You pick one</span><span class="chip owner">${(j.options.find(x => x.rec) || {}).id ? `${j.options.find(x => x.rec).id.toUpperCase()} · ${j.options.find(x => x.rec).name} (Recommended)` : ''}</span><span class="chip illus">Not approved UX</span><span class="chip illus">All figures illustrative</span>${(j.stories || []).map(s => `<span class="chip">${s}</span>`).join('')}`;
  $('#jopt').innerHTML = seg(j.options.map(x => [`${x.id.toUpperCase()} · ${x.name}`]), sum.at.o, 'Option', 'full');
  $('#jopt').onclick = e => { const b = e.target.closest('button'); if (!b) return; sum.at.o = $$('#jopt button').indexOf(b); show(); };
  $('#jsurf').innerHTML = seg(SURFACES.map(s => [s[1]]), SURFACES.indexOf(surf), 'Device', 'full');
  $('#jsurf').onclick = e => { const b = e.target.closest('button'); if (!b) return; sum.at.s = SURFACES[$$('#jsurf button').indexOf(b)][0]; show(); };
  const naAll = k => k !== 'default' && o.screens.every(s => (s.na || {})[k]);
  chips($('#jstate'), STATES.map(([k, t]) => [k, t, naAll(k) ? 'Does not apply to this journey' : '']), sum.at.st, k => { sum.at.st = k; show(); });
  $('#jwhy').innerHTML = `<p><b>${o.rec ? 'Why it is recommended.' : 'What this view does.'}</b> ${o.why}</p>${o.cost ? `<p><b>What it costs.</b> ${o.cost}</p>` : ''}`;
  const scheme = () => { const t = root.getAttribute('data-theme'); return t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); };
  const row = $('#jrow');
  row.classList.toggle('wide', surf[2] !== 'phone');
  /* A slot remembers the side it is on and the state it turned in, and stays turned until it is turned back. In another state a turned
     frame shows its screen's partner for that state, by the same lookup the control uses. */
  const slotKey = s => `${j.id}|${o.id}|${s.id}`;
  const screenOf = (oid, id) => (((j.options.find(x => x.id === oid) || {}).screens) || []).find(x => x.id === id);
  const sideOf = s => {
    const f = sum.flipped[slotKey(s)], base = { oid: o.id, sc: s };
    if (!f) return base;
    if (f.st === sum.at.st) { const sc = screenOf(f.o, f.s); return sc ? { oid: f.o, sc } : base; }
    const to = f.o === o.id ? null : flipTarget(j.id, s.id, sum.at.st), sc = to && screenOf(f.o, to);
    return sc ? { oid: f.o, sc } : base;
  };
  const ctxFor = (oid, sc, extra = {}) => ({ kind: surf[0], state: (sc.na || {})[sum.at.st] ? 'default' : sum.at.st, scheme: scheme(), journey: j.id, option: oid, screen: sc.id, ...extra });
  const noteFor = sc => { const r = (sc.na || {})[sum.at.st]; return r ? `This state does not apply here: ${r}` : sc.note || ''; };
  /* the caption, note, group name and data-at follow what the frame shows; a turned frame says so, and keeps its own theme */
  const frameScheme = box => ($('.dev', box).className.includes('scheme-dark') ? 'dark' : 'light');
  const dress = (box, oid, sc) => {
    const scr = $('.scr', box), cap = $('.bcap', box), note = $('.jnote', box), sch = frameScheme(box);
    scr.dataset.at = `${j.id}|${oid}|${sc.id}`;
    const title = sc.titleFor ? sc.titleFor(scr.dataset) : sc.title;
    scr.setAttribute('aria-label', `${title}, ${sch} theme`);
    const home = $('[data-flip]', scr);
    if (home && oid !== o.id && home.dataset.flip.split('|')[1] === o.id) home.dataset.flip = `${j.id}|${o.id}|${box.dataset.slot}`;
    cap.innerHTML = `<span class="tag">${sch === 'light' ? 'Light' : 'Dark'}</span>${title}${oid === o.id ? '' : ` <span class="chip illus">Turned to ${oid.toUpperCase()} · ${flipName(j.id, oid, sc.id)}</span>`}`;
    note.textContent = noteFor(sc);
  };
  const boardFor = s => {
    const { oid, sc } = sideOf(s), ctx = ctxFor(oid, sc);
    return `<div data-slot="${s.id}" data-owner="${j.id}|${o.id}">${boardHTML(surf[2], surf[3], surf[4], sc.render(ctx), ctx.scheme, sc.title)}<p class="jnote">${noteFor(sc)}</p></div>`;
  };
  const settle = el => {
    (el.matches('[data-slot]') ? [el] : $$('[data-slot]', el)).forEach(box => { const s = o.screens.find(x => x.id === box.dataset.slot), side = sideOf(s); dress(box, side.oid, side.sc); });
    $$('svg.cx.inter', el).forEach(wire);
    fitFrames();
    watch(row);
  };
  /* The flip turns this one frame, as the app would. A press takes its target from the control, and a second press returns to exactly what
     the frame showed, with its instrument, horizon and detail, unless the owner has moved on inside the frame. */
  row.onclick = e => {
    const b = e.target.closest('[data-flip]');
    if (!b) return;
    const box = b.closest('[data-slot]'), s = box && o.screens.find(x => x.id === box.dataset.slot);
    if (!s || box.dataset.owner !== `${j.id}|${o.id}`) return;   // a frame left over from the view just left
    const scr = b.closest('.scr'), key = slotKey(s), was = sum.flipped[key], here = scr.dataset.at, cur = here.split('|');
    const saved = { hz: scr.dataset.hz, mode: scr.dataset.mode, t: scr.dataset.t }, back = !!(was && was.from && was.landed === here);
    let [, oo, ss] = b.dataset.flip.split('|'), extra = saved;
    if (back) {
      [oo, ss] = was.from;
      extra = { ...was.from[2] };
      ['hz', 'mode'].forEach(k => { if (saved[k] !== was.got[k]) extra[k] = saved[k]; });   // what was pressed inside the turned frame comes home with it
    }
    const to = screenOf(oo, ss);
    if (!to) return;
    if (oo === o.id && ss === s.id) delete sum.flipped[key];
    else sum.flipped[key] = { o: oo, s: ss, st: sum.at.st, landed: `${j.id}|${oo}|${ss}`, got: extra, from: back ? null : [cur[1], cur[2], saved] };
    (window.__prismInstantFlip ? (el, fn) => fn() : flipTurn)(scr, () => {
      Object.entries(extra).forEach(([k, v]) => { if (v === undefined) delete scr.dataset[k]; else scr.dataset[k] = v; });
      scr.innerHTML = to.render(ctxFor(oo, to, { ...extra, scheme: frameScheme(box) }));
      $$('svg.cx.inter', scr).forEach(wire);
      $$('[data-mo]', scr).forEach(n => n.removeAttribute('data-mo'));
      dress(box, oo, to);
      const next = $('[data-flip]', scr);
      if (next) next.focus({ preventScroll: true });
      $('#jlive').textContent = `${to.titleFor ? to.titleFor(scr.dataset) : to.title}: ${flipName(j.id, oo, to.id)} view`;
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
  ['Is Agents its own journey? The story reads as nine; ARC-08 and CT-16 list eight, with agents, models and evaluations as one domain.', 'Drawn as nine. Costs one more pick for you.'],
  ['Where does admin live, and how much of it is on phones at launch? (CT-16)', 'Drawn as a place under Settings, on all four devices. No screen is marked launch or later.'],
  ['Budget changes: in admin (MP-100), or in Settings (MP-142, the cost journey)? (CT-16)', 'Drawn in Costs and budgets, and the owner cost journey keeps its Settings wording until you answer.'],
  ['iPhone passkeys: MP-164 bars them until the Developer Program is bought, and the Privacy journey shows them. (CT-17, PL-09)', 'Identity does not extend the iPhone passkey. The two records stay as they are until you answer.'],
  ['Who records which actor for an owner act? AuditEvidence has an admin actor, and MP has no admin role. (CT-03)', 'Drawn as You. The actor name is not an approved vocabulary.'],
  ['Non-financial approvals have no schema: ApprovalRequest is only a name. (CT-02)', 'Every non-financial expiry is illustrative and labelled.'],
  ['Restart evidence has no open id. POLICY-003 says it still needs specifying.', 'Labelled Proposed · POLICY-003, as the owner journey does.'],
  ['Pause switches: only the POLICY-003 scope pause has a rule. Optional work and a feature have no contract or actor. (CT-14, CT-16)', 'Drawn as proposed.'],
  ['Who cancels a run, and who records what happens to an orphan file? (MP-109, MP-45)', 'No control cancels a run: the state shows, and the inventory lists no such act. An orphan is drawn as yours, labelled proposed.'],
  ['MP-162 shows the HSBC notice as dismissed, and admin holds inc_0012 as acknowledged. Are a notice and an incident two records?', 'Drawn as two records. No record says so.'],
  ['The daily clock freezes the cutoff at +60, 22:00 for the US, and the owner journeys say cutoff 21:00. Which holds? (POLICY-002)', 'The clock screens follow POLICY-002. The owner wording stays on each run, word for word.'],
  ['Who marks an incident mitigated? (CT-14)', 'Labelled proposed, with no control.'],
  ['Does an overdue exercise have a threshold? (CT-14)', 'No number is shown.'],
  ['Is ISA statement, Oct 2026 the same file as Broker statement, Oct 2026? (MP-62)', 'Drawn as the ISA statement, the import the owner journeys use.']
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
  inv.insertAdjacentHTML('beforeend', `<h2 style="margin-top:32px">What these screens wait on</h2><p class="sum">These questions cross journeys, and each is drawn as the records stand today, labelled where it is proposed.</p><div class="tblwrap"><table class="spec"><thead><tr><th>Question</th><th>How it is drawn</th></tr></thead><tbody>${OPEN.map(([q, d]) => `<tr><td>${q}</td><td>${d}</td></tr>`).join('')}</tbody></table></div><h2 style="margin-top:32px">Checked against current releases</h2><p class="sum">Checked on 4 November 2026 and nothing is installed. SvelteKit 3.1.1 with Svelte 5.57.3 on npm, which matches SvelteKit 3 in TECH-STACK. Current simulators list iPhone 17, 17 Pro, 17 Pro Max and 17e, the iPhone 16 family, iPad, iPad Air and iPad Pro (M4 and M5). The frames here are 390 × 844 and 1180 × 820. They are drawing sizes, not a device promise: which devices are supported is still open (MP40-Q12).</p>`);
  inv.onclick = e => { const b = e.target.closest('[data-go]'); if (!b) return; const [jj, oo, k] = b.dataset.go.split('|'); J.go(jj, oo, sum.at.s, k); scrollTo({ top: 0 }); };
  try { history.replaceState(null, '', '#inventory'); } catch (e) { /* the view still shows */ }
}

const COVER = [['compare', 'Investigate and compare'], ['decide', 'Approve and reject'], ['source', 'Inspect the source'], ['correct', 'Reprocess and correct'], ['config', 'Change configuration'], ['cost', 'Reconcile cost'], ['recover', 'Failure, replay, restore, rollback, delete']];
function pageOnly(id) {
  mark(id);
  ['#jrow', '#jwhy', '.jctl', '.jhead'].forEach(s => { $(s).hidden = true; });
  const inv = $('#jinv'); inv.hidden = false;
  return inv;
}
/* Where each action is drawn, read from the screens themselves. */
function drawnWhere() {
  const at = {};
  sum.journeys.forEach(j => j.options.forEach(o => o.screens.forEach(s => {
    const html = s.render({ kind: 'web', state: 'default', scheme: 'light', journey: j.id, option: o.id, screen: s.id });
    [...html.matchAll(/data-(?:act|refuse)="([AR]\d+)"/g)].forEach(m => { (at[m[1]] = at[m[1]] || new Set()).add(`${j.title} ${o.id.toUpperCase()}`); });
  })));
  return at;
}
function showPermissions() {
  const inv = pageOnly('perm'), at = drawnWhere();
  const lab = { yes: 'Yes', no: 'No', open: 'Open · CT-01', outside: 'Not an MP step-up' };
  const rows = PERMS.actions.map(p => `<tr><td>${p.id}</td><td>${p.action}</td><td>${lab[p.step_up]}</td><td>${p.audit}</td><td>${[...(at[p.id] || [])].join(', ') || 'Named, no control'}</td><td>${p.source}</td></tr>`).join('');
  const ref = PERMS.refused.map(p => `<tr><td>${p.id}</td><td>${p.act}</td><td>${[...(at[p.id] || [])].join(', ') || 'Not drawn'}</td><td>${p.source}</td></tr>`).join('');
  inv.innerHTML = `<h2>Permission inventory</h2><p class="sum">Every admin action, whether it needs a fresh sign-in (ARC-07) and what it writes to the audit, from docs/design/admin/permissions.json. Yes means a story or owner record requires it. Open means no record says, so CT-01 decides. No freshness window or assurance level is approved, and no audit vocabulary is (CT-03). MP has one owner, so this lists acts, not roles.</p><div class="tblwrap" tabindex="0" role="region" aria-label="Inventory"><table class="spec"><thead><tr><th>Id</th><th>Action</th><th>Fresh sign-in</th><th>Audit record</th><th>Where drawn</th><th>Source</th></tr></thead><tbody>${rows}</tbody></table></div><h2 style="margin-top:32px">Refused</h2><p class="sum">The screen says so, and offers no control.</p><div class="tblwrap" tabindex="0" role="region" aria-label="Inventory"><table class="spec"><thead><tr><th>Id</th><th>Refused act</th><th>Where drawn</th><th>Source</th></tr></thead><tbody>${ref}</tbody></table></div>`;
  try { history.replaceState(null, '', '#permissions'); } catch (e) { /* the view still shows */ }
}
function showCoverage() {
  const inv = pageOnly('cov');
  const rows = sum.journeys.filter(j => j.id !== 'home').flatMap(j => j.options.map(o => `<tr><td>${j.title} · ${o.id.toUpperCase()}</td>${COVER.map(([k]) => { const v = (o.covers || {})[k] || ''; const sc = o.screens.find(s => s.id === v); return `<td>${sc ? sc.title : v.replace(/^n\/a: /, 'Not here: ')}</td>`; }).join('')}</tr>`)).join('');
  inv.innerHTML = `<h2>What each journey covers</h2><p class="sum">MP-64 asks each journey for these. Stale, conflicting, expired and denied are states of every screen. Each cell names the screen that does it, or says why it does not belong in this journey.</p><div class="tblwrap" tabindex="0" role="region" aria-label="Inventory"><table class="spec"><thead><tr><th>Journey</th>${COVER.map(([, t]) => `<th>${t}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
  try { history.replaceState(null, '', '#coverage'); } catch (e) { /* the view still shows */ }
}
