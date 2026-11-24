/* ---------- Prism Admin (MP-64): the registry, the device chrome and the state helpers. Adapted from Prism Journeys; there is no flip here, because the owner picks one option per journey (PH00-S06). ---------- */
const STATES = [
  ['default', 'Ready'], ['loading', 'Loading'], ['empty', 'Empty'], ['partial', 'Partial'], ['error', 'Failed'], ['stale', 'Stale'],
  ['offline', 'Offline'], ['conflict', 'Conflicting'], ['expired', 'Expired'], ['denied', 'Denied']
];
const PERMS = /*PERMISSIONS*/null;
/* Every control that changes something comes from the permission inventory, so a screen cannot grow an action the inventory does not list. */
const perm = id => { const p = PERMS.actions.find(a => a.id === id); if (!p) throw new Error(`no action ${id} in permissions.json`); return p; };
const proposed = id => `<span class="chip proposed"><span class="dot"></span>Proposed · ${id}</span>`;
/* a rule the owner's pick settles: the chip quotes the pick's id, beside any value it leaves open (MP-192) */
const settled = id => `<span class="chip owner"><span class="dot"></span>Settled · ${id}</span>`;
/* The owner, 4 Nov 2026: "Under Settings, phones read only" and "Yes, recovery only". permissions.json says which acts stay live on a phone. */
let curKind = 'web';
const onPhone = () => curKind === 'iphone' || curKind === 'pwa';
function act(id, label, kind = 'tinted', icon = '') {
  const p = perm(id);
  if (p.step_up === 'outside') throw new Error(`${id} is not an MP control: say where it happens, and draw no button`);
  /* browser: live in a phone's browser (Phone web) and off in the iPhone app, as the owner picked for enrolling a passkey (ADM-04, ADM-15) */
  if (onPhone() && p.phone !== 'live' && !(p.phone === 'browser' && curKind === 'pwa')) return `<span class="aact" data-act="${id}" data-phone-off="1"><span class="small">${label}: ${p.phone === 'browser' ? 'in your phone\'s browser, or on your Mac' : p.phone_note && /^Mac only/.test(p.phone_note) ? 'on your Mac' : 'on iPad or desktop'}</span></span>`;
  const guard = p.step_up === 'yes' ? '<span class="small">Asks for a fresh sign-in</span>' : p.step_up === 'open' ? proposed('CT-01') : '';
  return `<span class="aact" data-act="${id}"><button class="btn btn-${kind}" type="button">${p.step_up === 'yes' ? ic('lock', 's18') : (icon ? ic(icon, 's18') : '')}${label}</button>${guard}</span>`;
}
function refused(id, text) {
  if (!PERMS.refused.some(r => r.id === id)) throw new Error(`no refused act ${id} in permissions.json`);
  return `<div class="arefuse" data-refuse="${id}">${ic('ban', 's18')}<span>${text}</span></div>`;
}
/* ---------- Which drawn controls work (MP-193, the audit's UX-02) ----------
   Every control on a screen is one of three kinds, marked as the screen is drawn on this page:
   work: it does something here (a flip, a switch that redraws, a row that opens, a place that opens its journey);
   illus: an illustration, a control the product will have that does nothing on this page;
   policy: not allowed here, drawn disabled, and the screen says why.
   A screen reader hears the kind, and "Mark what works" outlines them. The screens' own drawings do not change. */
const WORKING_SEGS = {};
const CONTROL = /^(button)$|role="(button|switch|link|tab|checkbox|radio|menuitem)"/;
function markControls(html, journey) {
  const segs = WORKING_SEGS[journey] || [];
  if (segs.length) html = html.replace(/(<div class="segctl[^"]*" role="group" aria-label="([^"]*)"[^>]*>)([\s\S]*?)(<\/div>)/g,
    (m, open, label, inner, close) => (segs.includes(label) ? open + inner.replace(/<button(?![\w-])/g, '<button data-ctl="work"') + close : m));
  return html.replace(/<(button|div|span|a|li)(?![\w-])([^>]*)>/g, (m, tag, attrs) => {
    if (/\sdata-ctl=/.test(attrs) || !(tag === 'button' || CONTROL.test(attrs))) return m;
    const kind = /\sdata-(flip|dossier|go)=/.test(attrs) ? 'work' : /\sdisabled(?=[\s>=]|$)|aria-disabled="true"/.test(attrs) ? 'policy' : 'illus';
    const note = kind === 'work' ? '' : `mp-${kind}`;
    if (!note) return `<${tag} data-ctl="work"${attrs}>`;
    const described = /\saria-describedby="([^"]*)"/.exec(attrs);
    const rest = described ? attrs.replace(described[0], ` aria-describedby="${described[1]} ${note}"`) : `${attrs} aria-describedby="${note}"`;
    return `<${tag} data-ctl="${kind}"${rest}>`;
  });
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
const adminSide = on => [['home', 'Admin home', 'home'], ...PLACES].map(([k, n, i]) => `<div class="si${k === on ? ' on' : ''}" role="button" tabindex="0" data-go="${k}"${k === on ? ' aria-current="page"' : ''}>${ic(i, 's18')}${n}</div>`).join('');   /* each place opens its journey on this page (MP-193) */
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
function freshRow(ctx, _m, chipText) {
  if (chipText) return `<div class="jfresh on-glass"><span class="chip fresh"><span class="dot"></span>${chipText}</span></div>`;
  const c = (k, t, i) => `<span class="chip ${k}">${i ? ic(i, 's14') : '<span class="dot"></span>'}${t}</span>`;
  const st = ctx.state;
  const chip = { offline: c('offline', 'Offline · from 11:20', 'wifi-off'), error: c('error', 'Records failed 11:38 · last good 11:20', 'alert'), stale: c('stale', 'Index lagging · from 11:12', 'clock'), loading: c('fresh', 'Refreshing · last good 11:20'), partial: c('stale', 'Partial · 3 of 4 sources', 'clock'), conflict: c('stale', 'Older version · a newer record exists', 'split'), expired: c('fresh', 'Records current · 18:05') }[st] || c('fresh', 'Records current · 11:40');
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
  const offHtml = `${spec.body || ''}${spec.rail || ''}${spec.sheet || ''}`;
  const offNote = /data-phone-off/.test(offHtml) ? `<p class="small aphone">${ctx.journey === 'identity' ? 'Account recovery works here. Other changes happen on iPad or desktop.' : /data-act="A40"(?! data-phone-off)/.test(offHtml) ? 'Acknowledging works here. Other changes happen on iPad or desktop.' : 'Changes happen on iPad or desktop.'}</p>` : '';
  const tab = spec.tab ?? 4, field = spec.field === false ? '' : '<div class="dfield"></div>';   // tab 4 is Settings, the sidebar's sixth item
  const sheet = spec.sheet ? `<div class="jsheet${ctx.kind === 'iphone' || ctx.kind === 'pwa' ? '' : ' center'}"><div class="scrim"></div>${spec.sheet}</div>` : '';
  const dataRow = `<div style="margin:12px;padding:12px;border-radius:16px;background:var(--glass-thin);display:grid;gap:6px;justify-items:start" class="on-glass"><span class="label" style="color:var(--ink)">Records</span>${freshRow(ctx)}<span class="small">Wed 4 Nov · London</span></div>`;
  const sideList = () => adminSide(ctx.journey);
  const backBtn = (size, style) => `<button class="jback" type="button"${spec.back === 'Admin' ? ' data-go="home"' : ''} aria-label="Back to ${spec.back}" style="${style}">${ic('chev-l', size)}<span>${spec.back}</span></button>`;
  if (ctx.kind === 'iphone') {
    /* A back label that would run into the centred title gives way, as on iOS: the chevron stays, and it keeps its name for a screen reader. */
    const fits = spec.back && spec.back.length * 9 + spec.title.length * 4.8 + 40 < 190;
    const back = fits ? backBtn('s24', 'font:400 17px/22px var(--font-text);letter-spacing:-.01em') : `<button class="jback" type="button"${spec.back === 'Admin' ? ' data-go="home"' : ''} aria-label="Back to ${spec.back}">${ic('chev-l', 's24')}</button>`;
    const nav = spec.back ? `<div class="navbar glass"><div class="nb">${back}<span class="nbt">${spec.title}</span><span style="display:flex;gap:6px;align-items:center;justify-content:flex-end">${flipHTML(ctx, true, spec)}${spec.actions || ''}</span></div></div>` : '';
    return `<div data-contrast-exempt style="position:absolute;inset:0 0 auto;height:54px;z-index:25">${sbar()}</div>${field}<div class="jscroll"><div class="content" style="padding-top:${spec.back ? 102 : 54}px">
      ${spec.back ? '' : `<div style="display:flex;justify-content:flex-end;gap:8px;padding:4px 16px 0" data-mo="fade">${flipHTML(ctx, false, spec)}${spec.actions || tb('search', 'Search')}</div><div class="ltitle" style="margin-top:2px" data-mo="rise">${spec.title}</div>`}
      <div style="padding:6px 16px 12px">${freshRow(ctx, spec.fresh, spec.chip)}</div>
      <div class="jbody">${offNote}${spec.body || ''}${spec.rail || ''}</div><div class="jspace${spec.accessory ? ' tall' : ''}"></div></div></div>${nav}
      ${spec.accessory ? `<div class="glass" style="position:absolute;left:12px;right:12px;bottom:96px;z-index:19;border-radius:18px;padding:8px">${spec.accessory}</div>` : ''}${dtab(tab)}${homeInd}${sheet}`;
  }
  if (ctx.kind === 'pwa') {
    return `<div style="position:absolute;inset:0 0 auto;height:54px;z-index:25">${sbar()}</div>
      <div class="glass" style="position:absolute;top:54px;left:0;right:0;z-index:20;display:flex;align-items:center;gap:10px;padding:8px 12px" data-mo="fade">${spec.back ? `<button class="jback" type="button"${spec.back === 'Admin' ? ' data-go="home"' : ''} aria-label="Back to ${spec.back}">${ic('chev-l', 's24')}</button>` : '<span class="brand-mark" aria-hidden="true"></span>'}<span style="font:600 17px/22px var(--font-text);letter-spacing:-.01em">${spec.title}</span><span style="margin-left:auto;display:flex;gap:6px;align-items:center">${flipHTML(ctx, true, spec)}${spec.webActions ?? spec.actions ?? ''}</span></div>
      ${field}<div class="jscroll"><div class="content" style="padding-top:116px"><div style="padding:0 12px 10px">${freshRow(ctx, spec.fresh, spec.chip)}</div><div class="jbody" style="padding:0 12px">${offNote}${spec.body || ''}${spec.rail || ''}</div><div class="jspace${spec.accessory ? ' tall' : ''}"></div></div></div>
      ${spec.accessory ? `<div class="glass" style="position:absolute;left:12px;right:12px;bottom:90px;z-index:19;border-radius:18px;padding:8px">${spec.accessory}</div>` : ''}
      <nav class="glass" style="position:absolute;left:0;right:0;bottom:0;z-index:20;height:80px" aria-label="Tabs">${tabbarEl(tab)}</nav>${homeInd}${sheet}`;
  }
  const cols = `<div class="jcols${spec.rail ? '' : ' one'}"><div>${spec.body || ''}</div>${spec.rail ? `<div>${spec.rail}</div>` : ''}</div>`;
  const head = `<div class="jtop" data-mo="rise">${spec.back ? backBtn('s18', 'font:400 15px/20px var(--font-text)') : ''}<span class="ttl">${spec.title}</span><div class="acts">${freshRow(ctx, spec.fresh, spec.chip)}${flipHTML(ctx, false, spec)}${spec.webActions ?? spec.actions ?? ''}</div></div>`;
  if (ctx.kind === 'ipad') {
    return `<div class="dfield" style="left:-10%;right:40%;top:-80px;height:900px"></div><div class="jipad">
      <div class="glass jside" style="padding-top:24px" data-mo="fade"><div style="display:flex;align-items:center;justify-content:space-between;padding:0 16px">${ic('sidebar', 's24')}<button class="tbtn" type="button" aria-label="Account">${ic('person', 's18')}</button></div><div style="padding:10px 12px 0"><div class="search">${ic('search', 's18')}Search</div></div><div class="side" style="flex:1">${sideList()}</div>${dataRow}</div>
      <div class="jpane" style="padding-top:16px">${head}${cols}</div></div>${sheet}`;
  }
  return `<div class="glass" style="position:absolute;inset:0 0 auto;height:38px;z-index:5;display:flex;align-items:center;gap:8px;padding:0 14px;border-radius:0"><span style="display:flex;gap:7px" aria-hidden="true"><i style="width:12px;height:12px;border-radius:50%;background:var(--fall)"></i><i style="width:12px;height:12px;border-radius:50%;background:var(--warn)"></i><i style="width:12px;height:12px;border-radius:50%;background:var(--rise)"></i></span><span style="margin:0 auto;display:flex;align-items:center;gap:6px;font:500 12px/16px var(--font-text);color:var(--ink)">${ic('lock', 's14')}MyPrediction · ${spec.title}</span></div>
    <div class="jweb" style="inset:38px 0 0"><div class="glass jside" style="border-radius:0" data-mo="fade"><div style="display:flex;align-items:center;gap:10px;padding:16px 18px 6px;font:600 17px/22px var(--font-text);letter-spacing:-.01em"><span class="brand-mark" aria-hidden="true"></span>MyPrediction</div><div class="side" style="flex:1">${sideList()}</div>${dataRow}</div>
      <div class="jpane">${head}${cols}</div></div>${sheet}`;
}

/* A frame's horizon, mode and name come back from its data attributes or from storage. Only the code's own copy of each reaches the
   HTML, so text written into the page or into storage never does (MP-198, CodeQL js/xss-through-dom). */
const FRAME_HZ = ['0', '1', '2'], FRAME_MODE = ['0', '1'];
const frameExtra = e => ({ hz: FRAME_HZ.find(x => x === String(e.hz)), mode: FRAME_MODE.find(x => x === String(e.mode)), t: (byT[e.t] || {}).t });
/* The page's theme reaches the HTML only as the code's own 'light' or 'dark', never as the data-theme attribute's text
   (MP-198, CodeQL js/xss-through-dom). Unset or unknown follows the system, as before. */
const SCHEMES_OK = ['light', 'dark'];
const schemeNow = () => SCHEMES_OK.find(x => x === root.getAttribute('data-theme')) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
/* ---------- the registry ---------- */
const J = {
  /* J.add({ id, title, stories: ['MP-153'], summary, options: [{ id: 'a', name, rec: true, why, cost, screens: [{ id, title, note, na: { noModel: 'reason' }, render: ctx => frame(ctx, {...}) }] }] }) */
  add(j) {
    j.options.forEach(o => o.screens.forEach(s => { const r = s.render; s.render = ctx => { curKind = ctx.kind; return r(ctx); }; }));
    sum.journeys.push(j);
  },
  all: () => sum.journeys,
  start() {
    const hash = location.hash.slice(1).split('.');
    const i = sum.journeys.findIndex(j => j.id === hash[0]);
    if (i >= 0) { sum.at.j = i; sum.at.o = pickedOption(sum.journeys[i]); }
    if (hash[1] === 'b') sum.at.o = 1;
    if (hash[1] === 'a') sum.at.o = 0;
    const surfAt = SURFACES.find(s => s[0] === hash[2]), stateAt = STATES.find(s => s[0] === hash[3]);   // the code's own ids, never the address bar's text (MP-198)
    if (surfAt) sum.at.s = surfAt[0];
    if (stateAt) sum.at.st = stateAt[0];
    buildToc();
    /* Mark what works (MP-193): a page setting, kept for this visit only */
    const mk = $('#markctl');
    mk.onclick = () => { const on = mk.getAttribute('aria-checked') !== 'true'; mk.setAttribute('aria-checked', String(on)); root.classList.toggle('markctl', on); $('#jlive').textContent = on ? 'Controls marked: solid works here, dashed is an illustration, dotted is not allowed here' : 'Controls not marked'; };
    if (hash[0] === 'inventory') showInventory(); else if (hash[0] === 'permissions') showPermissions(); else if (hash[0] === 'compare') showCompare(); else if (hash[0] === 'coverage') showCoverage(); else show();
    /* a theme press, or the system's theme changing under Auto */
    const repaint = () => {
      if (sum.retheme) sum.retheme();
      const sch = schemeNow();
      $$('.acard .dev').forEach(d => { d.classList.remove('scheme-light', 'scheme-dark'); d.classList.add(`scheme-${sch}`); });
    };
    if (typeof MutationObserver === 'function') new MutationObserver(repaint).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaint);
    addEventListener('resize', fitFrames);
  },
  /* for scripts/design_journeys_check.mjs: every combination the review can reach */
  matrix() {
    return sum.journeys.flatMap(j => j.options.map(o => ({ j: j.id, o: o.id, screens: o.screens.map(s => ({ id: s.id, title: s.title, na: s.na || {} })) })));
  },
  go(j, o, s, st) { Object.assign(sum.at, { j: sum.journeys.findIndex(x => x.id === j), o: o === 'b' ? 1 : 0, s: (SURFACES.find(x => x[0] === s) || [sum.at.s])[0], st: (STATES.find(x => x[0] === st) || [sum.at.st])[0] }); show(); }
};
window.__prismJourneys = J;
J.markControls = markControls;
window.__prismStates = STATES;
window.__prismFlipless = true;
window.__prismSurfaces = SURFACES;

function buildToc() {
  const toc = $('#toc');
  toc.innerHTML = sum.journeys.map((j, i) => `<a href="#${j.id}" data-i="${i}">${j.title}</a>`).join('') + `<a href="#compare" data-i="cmp">Compare and pick</a><a href="#inventory" data-i="inv">State inventory</a><a href="#permissions" data-i="perm">Permission inventory</a><a href="#coverage" data-i="cov">What each journey covers</a>`;
  toc.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    if (a.dataset.i === 'inv') { showInventory(); return; }
    if (a.dataset.i === 'perm') { showPermissions(); return; }
    if (a.dataset.i === 'cmp') { showCompare(); return; }
    if (a.dataset.i === 'cov') { showCoverage(); return; }
    sum.at.j = +a.dataset.i; sum.at.o = pickedOption(sum.journeys[sum.at.j]); show();
    scrollTo({ top: 0 });
  });
}
function mark(i) {
  $$('#toc a').forEach(a => { if (a.dataset.i === String(i)) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
}
function chips(el, items, on, pick) {
  el.innerHTML = items.map(([k, t, dis]) => `<button type="button" data-k="${k}" aria-pressed="${k === on}"${dis ? ` disabled title="${dis}"` : ''}>${t}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('button'); if (!b || b.disabled) return; const k = b.dataset.k, said = b.textContent; pick(k); $('#jlive').textContent = said; setTimeout(() => { const n = $$('button', el).find(x => x.dataset.k === k); if (n) n.focus({ preventScroll: true }); }); };
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
/* A selector redraws itself when pressed, so focus goes back to the control pressed and the live region says the change. Focus goes in the next task,
   so the redraw's frame does not pay for a second layout (MP-182). */
function hold(sel, i, said) {
  $('#jlive').textContent = said;
  setTimeout(() => { const b = $$(`${sel} button`)[i]; if (b) b.focus({ preventScroll: true }); });
}
function show() {
  const j = sum.journeys[sum.at.j], o = j.options[sum.at.o], surf = SURFACES.find(s => s[0] === sum.at.s);
  $('#jinv').hidden = true;
  sum.cmp = null;
  ['#jrow', '#jwhy', '.jctl', '.jhead'].forEach(s => { $(s).hidden = false; });
  mark(sum.at.j);
  $('#jtitle').textContent = j.title;
  $('#jsummary').textContent = j.summary;
  $('#jmeta').innerHTML = `<span class="chip owner"><span class="dot"></span>UX approved with conditions · MP-66</span><span class="chip owner"><span class="dot"></span>You picked ${PICKS[j.id].toUpperCase()} · ${j.options.find(p => p.id === PICKS[j.id]).name}</span>${sum.keep && sum.keep.picks[j.id] !== PICKS[j.id] ? '<span class="chip stale">Changed in Compare, not recorded</span>' : ''}<span class="chip illus">All figures illustrative</span>${(j.stories || []).map(s => `<span class="chip">${s}</span>`).join('')}`;
  $('#jopt').innerHTML = seg(j.options.map(x => [`${x.id.toUpperCase()} · ${x.name}`]), sum.at.o, 'Option', 'full');
  $('#jopt').onclick = e => { const b = e.target.closest('button'); if (!b) return; const i = $$('#jopt button').indexOf(b), said = `Option ${b.textContent}`; sum.at.o = i; show(); hold('#jopt', i, said); };
  $('#jsurf').innerHTML = seg(SURFACES.map(s => [s[1]]), SURFACES.indexOf(surf), 'Device', 'full');
  $('#jsurf').onclick = e => { const b = e.target.closest('button'); if (!b) return; const i = $$('#jsurf button').indexOf(b), said = `Device ${b.textContent}`; sum.at.s = SURFACES[i][0]; show(); hold('#jsurf', i, said); };
  const naAll = k => k !== 'default' && o.screens.every(s => (s.na || {})[k]);
  chips($('#jstate'), STATES.map(([k, t]) => [k, t, naAll(k) ? 'Does not apply to this journey' : '']), sum.at.st, k => { sum.at.st = k; show(); });
  $('#jwhy').innerHTML = `<p><b>${o.rec ? 'Why it is recommended.' : 'What this view does.'}</b> ${o.why}</p>${o.cost ? `<p><b>What it costs.</b> ${o.cost}</p>` : ''}`;
  const scheme = schemeNow;
  const row = $('#jrow');
  row.classList.toggle('wide', surf[2] !== 'phone');
  /* A slot remembers the side it is on and the state it turned in, and stays turned until it is turned back. In another state a turned
     frame shows its screen's partner for that state, by the same lookup the control uses. */
  const slotKey = s => `${j.id}|${o.id}|${s.id}`;
  const screenOf = (oid, id) => (((j.options.find(x => x.id === oid) || {}).screens) || []).find(x => x.id === id);
  const sideOf = s => {
    const f = sum.flipped[slotKey(s)], base = { oid: o.id, sc: s };
    if (!f) return base;
    /* a turn read back from storage names its side by the code's own ids, never by the stored text (MP-198) */
    const side = j.options.find(x => x.id === f.o);
    if (!side) return base;
    if (f.st === sum.at.st) { const sc = screenOf(side.id, f.s); return sc ? { oid: side.id, sc } : base; }
    const to = side.id === o.id ? null : flipTarget(j.id, s.id, sum.at.st), sc = to && screenOf(side.id, to);
    return sc ? { oid: side.id, sc } : base;
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
  /* A theme press repaints the frames already drawn, in place: nothing is redrawn, so a flip, a state and the place on the page all hold. Frames still to come read the new theme themselves (MP-182). */
  sum.retheme = () => {
    const sch = scheme();
    $$('[data-slot]', row).forEach(box => {
      const dev = $('.dev', box), scr = $('.scr', box), tag = $('.bcap .tag', box);
      if (dev.classList.contains(`scheme-${sch}`)) return;   // Dark pressed on a page already dark under Auto: nothing to restyle
      dev.classList.remove('scheme-light', 'scheme-dark');
      dev.classList.add(`scheme-${sch}`);
      if (tag) tag.textContent = sch === 'light' ? 'Light' : 'Dark';
      scr.setAttribute('aria-label', (scr.getAttribute('aria-label') || '').replace(/, (light|dark) theme$/, `, ${sch} theme`));
    });
  };
  const boardFor = s => {
    const { oid, sc } = sideOf(s), ctx = ctxFor(oid, sc);
    return `<div data-slot="${s.id}" data-owner="${j.id}|${o.id}">${boardHTML(surf[2], surf[3], surf[4], markControls(sc.render(ctx), j.id), ctx.scheme, sc.title)}<p class="jnote">${noteFor(sc)}</p></div>`;
  };
  const settle = el => {
    (el.matches('[data-slot]') ? [el] : $$('[data-slot]', el)).forEach(box => { const s = o.screens.find(x => x.id === box.dataset.slot), side = sideOf(s); dress(box, side.oid, side.sc); });
    $$('svg.cx.inter', el).forEach(wire);
    fitFrames();
    watch(row);
  };
  /* The flip turns this one frame on the review strip. A press takes its target from the control, and a second press returns to exactly what
     the frame showed, with its instrument, horizon and detail, unless the owner has moved on inside the frame. */
  /* A place on Admin home, in the sidebar or a Back to Admin opens that journey on this page, on its picked option, the same device and
     state, and says so; a key press works as a click (MP-193). */
  const goPlace = e => {
    const g = e.target.closest('.scr [data-go]');
    if (!g || (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ')) return false;
    const to = sum.journeys.find(x => x.id === g.dataset.go);
    if (!to) return false;
    e.preventDefault();
    J.go(to.id, to.options[pickedOption(to)].id, sum.at.s, sum.at.st);
    scrollTo({ top: 0 });
    $('#jtitle').setAttribute('tabindex', '-1');
    $('#jtitle').focus({ preventScroll: true });
    $('#jlive').textContent = `Opened ${to.title}`;
    return true;
  };
  row.onkeydown = e => { goPlace(e); };
  row.onclick = e => {
    if (goPlace(e)) return;
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
    oo = j.options.find(x => x.id === oo).id; ss = to.id; extra = frameExtra(extra);   // from here on, the code's own ids and values (MP-198)
    if (oo === o.id && ss === s.id) delete sum.flipped[key];
    else sum.flipped[key] = { o: oo, s: ss, st: sum.at.st, landed: `${j.id}|${oo}|${ss}`, got: extra, from: back ? null : [cur[1], cur[2], saved] };
    (window.__prismInstantFlip ? (el, fn) => fn() : flipTurn)(scr, () => {
      Object.entries(extra).forEach(([k, v]) => { if (v === undefined) delete scr.dataset[k]; else scr.dataset[k] = v; });
      scr.innerHTML = markControls(to.render(ctxFor(oo, to, { ...extra, scheme: frameScheme(box) })), j.id);
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
  ['Is a forecast run per market or portfolio-wide? (POLICY-002)', 'Per market, as PH03-S09 says (ADM-10). The clock is per market and each run row names its market, and the owner journeys now say the same (MP-186).'],
  ['The story fails at 21:14, before the +15 start at 21:15. (POLICY-002)', 'Fixed (ADM-11, MP-186): the run is due 21:15 and Twelve Data fails at 21:16, here and in the owner journeys.'],
  ['Holdings says 6 originals are kept, and the receipts name 8.', 'Drawn as 8. The owner journeys stay as they are.'],
  ['R1-LGB names LightGBM, and the records define R1 as ridge. Should the name change everywhere?', 'Kept, as the owner journeys use it.'],
  ['Who records which actor for an owner act? AuditEvidence has an admin actor, and MP has no admin role. (CT-03)', 'Drawn as You. The actor name is not an approved vocabulary.'],
  ['Non-financial approvals have no schema: ApprovalRequest is only a name. (CT-02)', 'Settled, 5 Nov 2026 ("By kind, as drawn", OWN-08): each kind keeps its own wait, days for a promotion or a setting, none for a restart. A chat-proposed listing expires the same day ("Same day, as drawn", MP40-Q9), an approved switch forward or restart has 15 minutes to apply ("15 minutes, as drawn", OWN-21), and a scope you keep paused stays, undated ("It stays, undated", OWN-29). Open: how many days, a replay\'s wait, the wait on a route, factor or rules change, the window after any other yes, and the schema itself, so those expiries are illustrative and labelled Proposed · CT-02.'],
  ['MP-162 shows the HSBC notice as dismissed, and admin holds inc_0012 as acknowledged. Are a notice and an incident two records?', 'Drawn as two records. No record says so.'],
  ['The daily clock freezes the cutoff at +60, 22:00 for the US, and the owner journeys say cutoff 21:00. Which holds? (POLICY-002)', 'Your daily window holds (ADM-22): the cutoff freezes at +60 and forecasts issue by +75, 22:00 and 22:15 for the US. The owner journeys now say the same, and each run keeps their words (MP-186). The window is still to be proven on real sources.'],
  ['Is ISA statement, Oct 2026 the same file as Broker statement, Oct 2026? (MP-62)', 'Drawn as the ISA statement, the import the owner journeys use.']
];
/* What the owner has answered: each row quotes the label the owner picked, with its id (MP-184, MP-192). A row moves here only when the picks answer the whole question */
const SETTLED = [
  ['Does Claude usage show unknown until you decide on an Anthropic admin key? (MP40-Q5)', 'Settled, 5 Nov 2026 ("Adopt the key", MP40-Q5): the prod collector alone reads it from secure storage every six hours and fills the Claude line, and Ready stands. Costs shows the owner journey figures in Ready.'],
  ['What does a revoke do to a passkey held on that device? (PH02-S02, CT-17)', 'Settled, 5 Nov 2026 ("Revoke removes it too", ADM-02): revoking a device also removes any passkey held on it, and your path count drops by one. Unverified: whether Cognito can remove one this way, and whether a synced copy ends too (MP-197).'],
  ['Privacy revokes a device with a passkey, and Identity with a fresh sign-in. Which holds? (CT-01, CT-17)', 'Settled, 5 Nov 2026 ("Any healthy path", ADM-03): a fresh sign-in on any healthy path, passkey or Google, can revoke. Both pages draw it, and Privacy\'s button no longer names a passkey.'],
  ['Does a browser passkey on a phone count as an on-device passkey under MP-164? (CT-17, PL-09)', 'Settled, 5 Nov 2026 ("Allowed in the browser", ADM-04): the bar covers the Apple app only, so Phone web can enrol a passkey. Unverified until MP-197 tests it; if it fails, the bar stands.'],
  ['How does production come to be recorded lost, and who records it? (CT-14)', 'Settled, 5 Nov 2026 ("Code flags, you confirm", ADM-05): code opens the incident when production stops answering its checks, and you record it lost with a fresh sign-in. That is A85, Record production lost, on iPad or desktop (MP-202). Open: what counts as lost, and where the record is kept if MP is down (CT-14).'],
  ['Is a late price a missed collection, inside the replay allowlist? (CT-14)', 'Settled, 5 Nov 2026 ("No, keep it apart", ADM-06): a late price stays a data quality incident. The +40 retry is the only automatic one, and a newer price arrives at the next check.'],
  ['What happens to Yahoo values already sent to Anthropic? No record decides it.', 'Settled, 5 Nov 2026 ("Record it, keep the outputs", ADM-07): MP records what was sent and says it cannot recall it, and Claude text built on it stays, labelled. How long Anthropic holds the values is not verified.'],
  ['Who withdraws a factor or a rules version? PH05-S04 and PH04-S05 name the outcome, not the actor.', 'Settled, 5 Nov 2026 ("Code on trigger, or you", ADM-08): code withdraws on a trigger you approved in advance and tells you, and you can withdraw by hand with a fresh sign-in (A83). No trigger is listed yet, so approving them (A84) is named and not drawn.'],
  ['What does an owner decide when no rules mapping qualifies? (PH04-S06)', 'Settled, 5 Nov 2026 ("Use the best simple baseline", ADM-09): for that task, the strongest simple baseline stands in for the rules, with your yes each time (A78). A trial of new rules against old ones waits for a mapping.'],
  ['Privacy lands a replacement passkey on the new device, and its one path left is a passkey. Identity keeps the replacement on the Mac, and its one path left is Google.', 'Settled, 5 Nov 2026 ("Redraw Privacy now", ADM-13): Privacy is redrawn to match Identity: two usable paths, the replacement on the Mac, and the iPhone row waiting on the purchase (MP-179).'],
  ['With the Mac lost, how does recovery finish on a phone while MP-164 bars a passkey there? (CT-17)', 'Settled, 5 Nov 2026 ("Finish in the phone browser", ADM-15): you enrol the replacement in the phone\'s browser and end on two paths. The iPhone app sends you there. Unverified until MP-197; if it fails, recovery ends on one path, Google, warned, and that is drawn too.'],
  ['Restart evidence has no open id. POLICY-003 says it still needs specifying.', 'Settled, 5 Nov 2026 ("Cause cleared, fresh approval", OWN-28): code shows why it paused, that the cause is gone and that the model passes today\'s checks. Your yes renews its approval for that scope only, as the owner journey says.'],
  ['Pause switches: only the POLICY-003 scope pause has a rule. Optional work and a feature have no contract or actor. (CT-14, CT-16)', 'Settled, 5 Nov 2026 ("All three, as drawn", ADM-19): you can pause optional work, one forecast scope or one feature by hand, on iPad or desktop, each kept in the record.'],
  ['Who cancels a run, and who records what happens to an orphan file? (MP-109, MP-45)', 'Settled, 5 Nov 2026 ("Code cancels, orphans yours", ADM-20): only code cancels a run, and you record what happens to each orphan, as drawn. No control cancels a run: the state shows, and the inventory lists no such act.'],
  ['Who marks an incident mitigated? (CT-14)', 'Settled, 5 Nov 2026 ("Code marks it", ADM-23): code marks it when its checks show the fault has stopped. The control is gone, and you still acknowledge and resolve.'],
  ['Does an overdue exercise have a threshold? (CT-14)', 'Settled, 5 Nov 2026 ("Tie to month and release", ADM-24): overdue means a month ended with no exercise, or a change has none by the next release. No number of days is set.']
];
function showInventory() {
  mark('inv');
  sum.cmp = null;
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
  inv.insertAdjacentHTML('beforeend', `<h2 style="margin-top:32px">What these screens wait on</h2><p class="sum">These questions cross journeys, and each is drawn as the records stand today, labelled where it is proposed.</p><div class="tblwrap"><table class="spec"><thead><tr><th>Question</th><th>How it is drawn</th></tr></thead><tbody>${OPEN.map(([q, d]) => `<tr><td>${q}</td><td>${d}</td></tr>`).join('')}</tbody></table></div><h2 style="margin-top:32px">Settled by the owner</h2><p class="sum">The owner answered these on 5 November 2026 (MP-184), or on the date given. Each quotes the label the owner picked.</p><div class="tblwrap"><table class="spec"><thead><tr><th>Question</th><th>The owner's answer</th></tr></thead><tbody>${SETTLED.map(([q, d]) => `<tr><td>${q}</td><td>${d}</td></tr>`).join('')}</tbody></table></div><h2 style="margin-top:32px">Checked against current releases</h2><p class="sum">Checked on 4 November 2026 and nothing is installed. SvelteKit 3.1.1 with Svelte 5.57.3 on npm, which matches SvelteKit 3 in TECH-STACK. Current simulators list iPhone 17, 17 Pro, 17 Pro Max and 17e, the iPhone 16 family, iPad, iPad Air and iPad Pro (M4 and M5). The frames here are 390 × 844 and 1180 × 820. They are drawing sizes, not a device promise: the app supports the iPhone and iPad you own, at the iOS they run ("Your own devices only", MP40-Q12a), and you give their models.</p>`);
  inv.onclick = e => { const b = e.target.closest('[data-go]'); if (!b) return; const [jj, oo, k] = b.dataset.go.split('|'); J.go(jj, oo, sum.at.s, k); scrollTo({ top: 0 }); };
  try { history.replaceState(null, '', '#inventory'); } catch (e) { /* the view still shows */ }
}

const COVER = [['compare', 'Investigate and compare'], ['decide', 'Approve and reject'], ['source', 'Inspect the source'], ['correct', 'Reprocess and correct'], ['config', 'Change configuration'], ['cost', 'Reconcile cost'], ['recover', 'Failure, replay, restore, rollback, delete']];
function pageOnly(id) {
  mark(id);
  sum.cmp = null;
  ['#jrow', '#jwhy', '.jctl', '.jhead'].forEach(s => { $(s).hidden = true; });
  const inv = $('#jinv'); inv.hidden = false;
  return inv;
}
/* Where each action is drawn, read from the screens themselves. */
function drawnWhere() {
  const at = {};
  sum.journeys.forEach(j => j.options.forEach(o => o.screens.forEach(s => STATES.forEach(([state]) => {
    if ((s.na || {})[state]) return;
    const html = s.render({ kind: 'web', state, scheme: 'light', journey: j.id, option: o.id, screen: s.id });
    [...html.matchAll(/data-(?:act|refuse)="([AR]\d+)"/g)].forEach(m => { (at[m[1]] = at[m[1]] || new Set()).add(`${j.title} ${o.id.toUpperCase()}`); });
  }))));
  return at;
}
function showPermissions() {
  const inv = pageOnly('perm'), at = drawnWhere();
  const lab = { yes: 'Yes', no: 'No', open: 'Open · CT-01', outside: 'Not an MP step-up' };
  const rows = PERMS.actions.map(p => `<tr><td>${p.id}</td><td>${p.action}</td><td>${lab[p.step_up]}</td><td>${p.phone_note || (p.phone === 'live' ? 'Yes' : p.phone === 'off' ? 'iPad or desktop' : 'Outside MP')}</td><td>${p.audit}</td><td>${[...(at[p.id] || [])].join(', ') || (p.control === 'named' ? 'Named, no screen yet' : 'Named, no control')}</td><td>${p.source}</td></tr>`).join('');
  const ref = PERMS.refused.map(p => `<tr><td>${p.id}</td><td>${p.act}</td><td>${[...(at[p.id] || [])].join(', ') || 'Not drawn'}</td><td>${p.source}</td></tr>`).join('');
  inv.innerHTML = `<h2>Permission inventory</h2><p class="sum">Every admin action, whether it needs a fresh sign-in (ARC-07), whether it works on a phone and what it writes to the audit, from docs/design/admin/permissions.json. Yes means a story or owner record requires it, and the owner answered for every act on 5 November 2026: "Anything that writes or widens" (OWN-39), so an act that changes a record, widens what MP may do or opens an original needs one, and reading and stopping do not. Open means the owner's rule leaves it unclear, and it is put to the owner. Not an MP step-up covers acts outside MP and A74, which code does. No freshness window or assurance level is approved, and no audit vocabulary is (CT-03). MP has one owner, so this lists acts, not roles. Sources name stories (PH01-S14), open records (CT-01) and policies. The live and off split on phones follows your answers, and the rest of it is the maker's reading.</p><div class="tblwrap" tabindex="0" role="region" aria-label="Inventory"><table class="spec"><thead><tr><th>Id</th><th>Action</th><th>Fresh sign-in</th><th>On a phone</th><th>Audit record</th><th>Where drawn</th><th>Source</th></tr></thead><tbody>${rows}</tbody></table></div><h2 style="margin-top:32px">Refused</h2><p class="sum">The screen says so, and offers no control.</p><div class="tblwrap" tabindex="0" role="region" aria-label="Inventory"><table class="spec"><thead><tr><th>Id</th><th>Refused act</th><th>Where drawn</th><th>Source</th></tr></thead><tbody>${ref}</tbody></table></div>`;
  try { history.replaceState(null, '', '#permissions'); } catch (e) { /* the view still shows */ }
}
function showCoverage() {
  const inv = pageOnly('cov');
  const rows = sum.journeys.filter(j => j.id !== 'home').flatMap(j => j.options.map(o => `<tr><td>${j.title} · ${o.id.toUpperCase()}</td>${COVER.map(([k]) => { const v = (o.covers || {})[k] || ''; const sc = o.screens.find(s => s.id === v); return `<td>${sc ? sc.title : v.replace(/^n\/a: /, 'Not here: ')}</td>`; }).join('')}</tr>`)).join('');
  inv.innerHTML = `<h2>What each journey covers</h2><p class="sum">MP-64 asks each journey for these. Stale, conflicting, expired and denied are states of every screen. Each cell names the screen that does it, or says why it does not belong in this journey.</p><div class="tblwrap" tabindex="0" role="region" aria-label="Inventory"><table class="spec"><thead><tr><th>Journey</th>${COVER.map(([, t]) => `<th>${t}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
  try { history.replaceState(null, '', '#coverage'); } catch (e) { /* the view still shows */ }
}

/* Compare and pick: one card per screen, option by option, in the Ready state. The frames are the real screens, drawn small and inert;
   a card's button opens the full screen. The owner's picks start marked, and a change leaves this page only when the owner copies it. */
/* The owner's picks, 4 November 2026 (docs/design/reviews/MP-64/decision.md). */
const PICKS = { home: 'b', files: 'a', audit: 'b', runs: 'a', agents: 'a', models: 'a', approvals: 'a', costs: 'a', incidents: 'a', identity: 'a' };
const CMP_KEY = 'mp64-picks';
/* picks read back from storage keep only the code's own values, so stored text never reaches the HTML (MP-198) */
function picksLoad() { try { const p = JSON.parse(localStorage.getItem(CMP_KEY)); if (!p || typeof p !== 'object') return null; return Object.fromEntries(Object.keys(PICKS).map(k => [k, ['a', 'b', 'x'].find(v => v === p[k]) || ''])); } catch (e) { return null; } }
function picksSave(p) { try { localStorage.setItem(CMP_KEY, JSON.stringify(Object.fromEntries(Object.keys(PICKS).map(k => [k, p[k] || ''])))); } catch (e) { /* the picks still show on this page, and copy */ } }
const CMP_DEV = { iphone: ['iPhone', 390, 844, 'phone', .5], web: ['Desktop', 1200, 950, 'win', .36] };
function picksText(p) {
  const name = (j, v) => (v === 'x' ? 'neither' : `${v.toUpperCase()}, ${j.options.find(o => o.id === v).name}`);
  const done = sum.journeys.filter(j => p[j.id]);
  return done.length ? `MP-64 picks. ${done.map(j => `${j.title}: ${name(j, p[j.id])}`).join('. ')}.` : '';
}
function showCompare() {
  const inv = pageOnly('cmp');
  sum.keep = sum.keep || { j: sum.journeys.find(j => j.id !== 'home').id, dev: 'iphone', picks: { ...PICKS, ...(picksLoad() || {}) } };
  sum.cmp = sum.keep;
  drawCompare();
  try { history.replaceState(null, '', '#compare'); } catch (e) { /* the view still shows */ }
  inv.onclick = e => {
    const c = sum.cmp, t = e.target.closest('[data-cj],[data-cdev],[data-pick],[data-open],[data-copy]');
    if (!t) return;
    if (t.dataset.cj) { c.j = t.dataset.cj; drawCompare(); $(`[data-cj="${c.j}"]`, inv).focus({ preventScroll: true }); return; }
    if (t.dataset.cdev) { c.dev = t.dataset.cdev; drawCompare(); $(`[data-cdev="${c.dev}"]`, inv).focus({ preventScroll: true }); return; }
    if (t.dataset.pick) {
      const v = t.dataset.pick;
      if (c.picks[c.j] === v) delete c.picks[c.j]; else c.picks[c.j] = v;
      picksSave(c.picks); drawCompare();
      $(`[data-pick="${v}"]`, inv).focus({ preventScroll: true });
      $('#jlive').textContent = c.picks[c.j] ? `${sum.journeys.find(j => j.id === c.j).title}: picked` : 'Pick cleared';
      return;
    }
    if (t.dataset.open) {
      const [oid, sid] = t.dataset.open.split('|');
      J.go(c.j, oid, c.dev, 'default');
      const at = `${c.j}|${oid}|${sid}`;
      let n = 0;
      const seek = () => { const el = $(`.scr[data-at="${at}"]`); if (el) el.closest('.bfig').scrollIntoView({ block: 'start' }); else if (n++ < 60) setTimeout(seek, 32); };
      seek();
      return;
    }
    const text = picksText(c.picks), area = $('#cmpText', inv), said = $('#cmpSaid', inv);
    const fall = () => { area.focus(); area.select(); said.textContent = 'Selected. Copy it from the box.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => { said.textContent = 'Copied. Paste it to Claude to record your picks.'; }, fall); else fall();
  };
}
function drawCompare() {
  const inv = $('#jinv'), c = sum.cmp, j = sum.journeys.find(x => x.id === c.j), [dn, w, h, kind, z] = CMP_DEV[c.dev];
  const sch = schemeNow();
  const picked = sum.journeys.filter(x => c.picks[x.id]).length, text = picksText(c.picks);
  const card = (o, s) => `<article class="acard" style="--cw:${Math.round((w + (kind === 'win' ? 0 : 20)) * z)}px;--cr:${kind === 'win' ? 6 : 32}px"><div class="acard-frame" inert aria-hidden="true"><div class="dev${kind === 'win' ? ' win' : ''} scheme-${sch}" style="--w:${w}px;--h:${h}px;zoom:${z}"><div class="scr">${s.render({ kind: c.dev, state: 'default', scheme: sch, journey: j.id, option: o.id, screen: s.id })}</div></div></div><h4>${s.title}</h4>${s.note ? `<p>${s.note}</p>` : ''}<button class="btn sm btn-tinted" type="button" data-open="${o.id}|${s.id}" aria-label="Open ${s.title}, option ${o.id.toUpperCase()}">Open</button></article>`;
  const opt = o => `<section class="acmp-opt" aria-label="Option ${o.id.toUpperCase()}, ${o.name}"><div class="acmp-head"><h3>${o.id.toUpperCase()} · ${o.name}</h3>${o.rec ? '<span class="chip owner">Recommended</span>' : ''}<span class="small">${o.screens.length} ${o.screens.length === 1 ? 'screen' : 'screens'}</span><button class="btn sm ${c.picks[j.id] === o.id ? 'btn-primary' : 'btn-tinted'}" type="button" data-pick="${o.id}" aria-pressed="${c.picks[j.id] === o.id}">${c.picks[j.id] === o.id ? `${ic('check', 's16')}Picked` : `Pick ${o.id.toUpperCase()}`}</button></div><p class="acmp-why">${o.why}${o.cost ? ` <b>What it costs.</b> ${o.cost}` : ''}</p><div class="acmp-row" tabindex="0" role="region" aria-label="Screens of option ${o.id.toUpperCase()}">${o.screens.map(s => card(o, s)).join('')}</div></section>`;
  inv.innerHTML = `<h2>Compare and pick</h2><p class="sum">One card per screen, option by option, in the Ready state, for the journey you choose. ${sum.journeys.every(x => c.picks[x.id] === PICKS[x.id]) ? 'Your picks of 4 November are marked.' : 'Changed from your picks of 4 November, and not recorded until you copy this to Claude.'} ${picked} of ${sum.journeys.length} picked.</p>
    <div class="jstates acmp-tabs" role="group" aria-label="Journey">${sum.journeys.map(x => `<button type="button" data-cj="${x.id}" aria-pressed="${x.id === c.j}">${c.picks[x.id] ? `${x.title} · ${c.picks[x.id] === 'x' ? 'neither' : c.picks[x.id].toUpperCase()}` : x.title}</button>`).join('')}</div>
    <div class="jstates acmp-tabs" role="group" aria-label="Device">${Object.entries(CMP_DEV).map(([k, v]) => `<button type="button" data-cdev="${k}" aria-pressed="${k === c.dev}">${v[0]}</button>`).join('')}</div>
    <p class="sum" style="color:var(--ink)">${j.summary}</p>${j.options.map(opt).join('')}
    <div class="acmp-foot"><button class="btn sm ${c.picks[j.id] === 'x' ? 'btn-primary' : 'btn-tinted'}" type="button" data-pick="x" aria-pressed="${c.picks[j.id] === 'x'}">${c.picks[j.id] === 'x' ? `${ic('check', 's16')}Neither` : 'Neither, draw new options'}</button><span class="small">A journey you reject gets its own new options round. The others are kept.</span></div>
    <div class="card acmp-out"><label class="label" for="cmpText">Your picks so far</label><textarea id="cmpText" readonly rows="3" placeholder="Nothing picked yet">${text}</textarea><div class="acmp-copy"><button class="btn sm btn-primary" type="button" data-copy="1"${text ? '' : ' disabled'}>Copy my picks</button><span class="small" id="cmpSaid" role="status">A change stays in this browser until you paste it to Claude.</span></div></div>`;
  $$('[data-mo]', inv).forEach(n => n.removeAttribute('data-mo'));
}

const pickedOption = j => Math.max(0, j.options.findIndex(o => o.id === (sum.keep ? sum.keep.picks : PICKS)[j.id]));
