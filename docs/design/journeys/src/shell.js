/* ---------- Prism Journeys: the registry, the device chrome and the state helpers every journey uses ---------- */
const STATES = [
  ['default', 'Ready'], ['loading', 'Loading'], ['empty', 'Empty'], ['error', 'Error'], ['stale', 'Stale'],
  ['offline', 'Offline'], ['noModel', 'No model'], ['disagreement', 'Disagreement'], ['abstention', 'Abstaining']
];
const SURFACES = [
  ['iphone', 'iPhone', 'phone', 390, 844], ['ipad', 'iPad', 'tab', 1180, 820],
  ['web', 'Desktop', 'win', 1200, 950], ['pwa', 'Phone web', 'phone', 390, 844]
];
const sum = { journeys: [], at: { j: 0, o: 0, s: 'iphone', st: 'default' } };

/* ---------- chrome: a journey writes its content once, and each device frames it ---------- */
const WEBTABS = [['home', 'Portfolio'], ['fan', 'Forecasts'], ['grid', 'Segments'], ['target', 'Record'], ['sliders', 'Settings']];
function freshRow(ctx) {
  const st = ctx.state;
  if (st === 'offline') return `<div class="jfresh on-glass"><span class="chip offline">${ic('wifi-off', 's14')}Offline · from 21:15</span></div>`;
  if (st === 'error') return `<div class="jfresh on-glass"><span class="chip error">${ic('alert', 's14')}Twelve Data · error 21:14</span>${fresh('Yahoo')}</div>`;
  if (st === 'stale') return `<div class="jfresh on-glass">${fresh('Twelve Data')}${fresh('Yahoo', 'stale', 'delayed since 16:35')}</div>`;
  if (st === 'loading') return `<div class="jfresh on-glass"><span class="chip fresh"><span class="dot"></span>Refreshing · last good 21:15</span></div>`;
  return `<div class="jfresh on-glass">${fresh('Twelve Data')}${fresh('Yahoo')}</div>`;
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
  const dataRow = `<div style="margin:12px;padding:12px;border-radius:16px;background:var(--glass-thin);display:grid;gap:6px;justify-items:start" class="on-glass"><span class="label" style="color:var(--ink)">Data</span>${freshRow(ctx)}<span class="small">As of 21:15 · cutoff 21:00</span></div>`;
  if (ctx.kind === 'iphone') {
    const nav = spec.back ? `<div class="navbar glass"><div class="nb"><span style="display:flex;align-items:center;font:400 17px/22px var(--font-text);letter-spacing:-.01em">${ic('chev-l', 's24')}${spec.back}</span><span class="nbt">${spec.title}</span>${spec.actions || '<span></span>'}</div></div>` : '';
    return `<div data-contrast-exempt style="position:absolute;inset:0 0 auto;height:54px;z-index:25">${sbar()}</div>${field}<div class="jscroll"><div class="content" style="padding-top:${spec.back ? 102 : 54}px">
      ${spec.back ? '' : `<div style="display:flex;justify-content:flex-end;gap:8px;padding:4px 16px 0" data-mo="fade">${spec.actions || tb('search', 'Search') + tb('eye-off', 'Hide amounts')}</div><div class="ltitle" style="margin-top:2px" data-mo="rise">${spec.title}</div>`}
      <div style="padding:6px 16px 12px">${freshRow(ctx)}</div>
      <div class="jbody">${spec.body || ''}${spec.rail || ''}</div><div class="jspace"></div></div></div>${nav}
      ${spec.accessory ? `<div class="glass" style="position:absolute;left:12px;right:12px;bottom:96px;z-index:19;border-radius:18px;padding:8px">${spec.accessory}</div>` : ''}${dtab(tab)}${homeInd}${sheet}`;
  }
  if (ctx.kind === 'pwa') {
    return `<div style="position:absolute;inset:0 0 auto;height:54px;z-index:25">${sbar()}</div>
      <div class="glass" style="position:absolute;top:54px;left:0;right:0;z-index:20;display:flex;align-items:center;gap:10px;padding:8px 12px" data-mo="fade">${spec.back ? ic('chev-l', 's24') : '<span class="brand-mark" aria-hidden="true"></span>'}<span style="font:600 17px/22px var(--font-text);letter-spacing:-.01em">${spec.title}</span><span style="margin-left:auto;display:flex;gap:6px">${spec.webActions || ''}</span></div>
      ${field}<div class="jscroll"><div class="content" style="padding-top:116px"><div style="padding:0 12px 10px">${freshRow(ctx)}</div><div class="jbody" style="padding:0 12px">${spec.body || ''}${spec.rail || ''}</div><div class="jspace"></div></div></div>
      ${spec.accessory ? `<div class="glass" style="position:absolute;left:12px;right:12px;bottom:90px;z-index:19;border-radius:18px;padding:8px">${spec.accessory}</div>` : ''}
      <nav class="glass" style="position:absolute;left:0;right:0;bottom:0;z-index:20;height:80px" aria-label="Tabs">${tabbarEl(tab)}</nav>${homeInd}${sheet}`;
  }
  const cols = `<div class="jcols${spec.rail ? '' : ' one'}"><div>${spec.body || ''}</div>${spec.rail ? `<div>${spec.rail}</div>` : ''}</div>`;
  const head = `<div class="jtop" data-mo="rise">${spec.back ? `<span style="display:flex;align-items:center;font:400 15px/20px var(--font-text)">${ic('chev-l', 's18')}${spec.back}</span>` : ''}<span class="ttl">${spec.title}</span><div class="acts">${freshRow(ctx)}${spec.webActions || ''}</div></div>`;
  if (ctx.kind === 'ipad') {
    return `<div class="dfield" style="left:-10%;right:40%;top:-80px;height:900px"></div><div class="jipad">
      <div class="glass jside" style="padding-top:24px" data-mo="fade"><div style="display:flex;align-items:center;justify-content:space-between;padding:0 16px">${ic('sidebar', 's24')}<button class="tbtn" type="button" aria-label="Account">${ic('person', 's18')}</button></div><div style="padding:10px 12px 0"><div class="search">${ic('search', 's18')}Search</div></div><div class="side" style="flex:1">${side(sideTab)}</div>${dataRow}</div>
      <div class="jpane" style="padding-top:16px">${head}${cols}</div></div>${sheet}`;
  }
  return `<div class="glass" style="position:absolute;inset:0 0 auto;height:38px;z-index:5;display:flex;align-items:center;gap:8px;padding:0 14px;border-radius:0"><span style="display:flex;gap:7px" aria-hidden="true"><i style="width:12px;height:12px;border-radius:50%;background:var(--fall)"></i><i style="width:12px;height:12px;border-radius:50%;background:var(--warn)"></i><i style="width:12px;height:12px;border-radius:50%;background:var(--rise)"></i></span><span style="margin:0 auto;display:flex;align-items:center;gap:6px;font:500 12px/16px var(--font-text);color:var(--ink)">${ic('lock', 's14')}MyPrediction · ${spec.title}</span></div>
    <div class="jweb" style="inset:38px 0 0"><div class="glass jside" style="border-radius:0" data-mo="fade"><div style="display:flex;align-items:center;gap:10px;padding:16px 18px 6px;font:600 17px/22px var(--font-text);letter-spacing:-.01em"><span class="brand-mark" aria-hidden="true"></span>MyPrediction</div><div class="side" style="flex:1">${side(sideTab)}</div>${dataRow}</div>
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
  $('#jmeta').innerHTML = `<span class="chip proposed"><span class="dot"></span>Proposed</span><span class="chip illus">Not approved UX</span><span class="chip illus">All figures illustrative</span>${(j.stories || []).map(s => `<span class="chip">${s}</span>`).join('')}`;
  $('#jopt').innerHTML = seg(j.options.map(x => [`${x.id.toUpperCase()} · ${x.name}${x.rec ? ' (Recommended)' : ''}`]), sum.at.o, 'Option', 'full');
  $('#jopt').onclick = e => { const b = e.target.closest('button'); if (!b) return; sum.at.o = $$('#jopt button').indexOf(b); show(); };
  $('#jsurf').innerHTML = seg(SURFACES.map(s => [s[1]]), SURFACES.indexOf(surf), 'Device', 'full');
  $('#jsurf').onclick = e => { const b = e.target.closest('button'); if (!b) return; sum.at.s = SURFACES[$$('#jsurf button').indexOf(b)][0]; show(); };
  const naAll = k => k !== 'default' && o.screens.every(s => (s.na || {})[k]);
  chips($('#jstate'), STATES.map(([k, t]) => [k, t, naAll(k) ? 'Does not apply to this journey' : '']), sum.at.st, k => { sum.at.st = k; show(); });
  $('#jwhy').innerHTML = `<p><b>${o.rec ? 'Why this is recommended.' : 'What this option does.'}</b> ${o.why}</p>${o.cost ? `<p><b>What it costs.</b> ${o.cost}</p>` : ''}`;
  const scheme = () => { const t = root.getAttribute('data-theme'); return t || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); };
  const row = $('#jrow');
  row.classList.toggle('wide', surf[2] !== 'phone');
  row.innerHTML = o.screens.map(s => {
    const ctx = { kind: surf[0], state: (s.na || {})[sum.at.st] ? 'default' : sum.at.st, scheme: scheme(), journey: j.id, option: o.id };
    const reason = (s.na || {})[sum.at.st];
    return boardHTML(surf[2], surf[3], surf[4], s.render(ctx), ctx.scheme, `${s.title}`) + `<p class="jnote">${reason ? `This state does not apply here: ${reason}` : s.note || ''}</p>`;
  }).map(h => `<div>${h}</div>`).join('');
  $$('svg.cx.inter', row).forEach(wire);
  fitFrames();
  watch(row);
  try { history.replaceState(null, '', `#${j.id}.${o.id}.${surf[0]}.${sum.at.st}`); } catch (e) { /* the view still shows */ }
}
const OPEN = [
  ['Where do Research, Approvals and Imports live in the navigation? Neither the five tabs nor the sidebar has them.', 'Research hangs off Portfolio; Approvals and Imports sit under Settings.'],
  ['MP-144 lets a candidate be labelled buy or watch, and MP never trades. Which word?', 'Watch only.'],
  ['Is Claude on or off at launch? Admissible credit is zero today.', 'Ready shows Claude on, £54.73. Claude off is the No model state.'],
  ['Does the portfolio total include cash?', 'The shared total holds no cash; £5,542.85 shows apart.'],
  ['Action thresholds (FIN-OD-07)', 'Every action label is provisional. No model or Empty shows the unclassified case.'],
  ['Scenario returns (SCI-D06)', 'The figures are placeholders. Empty is the state today.'],
  ['Import limits and locked PDFs (MP40-Q1, MP40-Q2)', 'Labelled proposed: unlock on your device.'],
  ['Billing data and freshness (MP40-Q5, MP40-Q6)', 'Labelled proposed.'],
  ['Weekend brief (MP40-Q11)', 'Not drawn.'],
  ['What is kept offline, and which devices (MP40-Q12)', 'Labelled proposed.'],
  ['Revocation time (CT-17) and which acts need a fresh sign-in (CT-01)', 'No exact time is promised. Step-up is drawn on the model promotion in Approvals A and on the new listing in Approvals B.']
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
  inv.insertAdjacentHTML('beforeend', `<h2 style="margin-top:32px">What these screens wait on</h2><p class="sum">Your picks are per journey. These questions cross journeys, and each is drawn as the records stand today, labelled where it is proposed.</p><div class="tblwrap"><table class="spec"><thead><tr><th>Question</th><th>How it is drawn</th></tr></thead><tbody>${OPEN.map(([q, d]) => `<tr><td>${q}</td><td>${d}</td></tr>`).join('')}</tbody></table></div><h2 style="margin-top:32px">Checked against current releases</h2><p class="sum">Checked on 4 November 2026 and nothing is installed. SvelteKit 3.1.1 with Svelte 5.57.3 on npm, which matches SvelteKit 3 in TECH-STACK. Current simulators list iPhone 17, 17 Pro, 17 Pro Max and 17e, the iPhone 16 family, iPad, iPad Air and iPad Pro (M4 and M5). The frames here are 390 × 844 and 1180 × 820. They are drawing sizes, not a device promise: which devices are supported is still open (MP40-Q12).</p>`);
  inv.onclick = e => { const b = e.target.closest('[data-go]'); if (!b) return; const [jj, oo, k] = b.dataset.go.split('|'); J.go(jj, oo, sum.at.s, k); scrollTo({ top: 0 }); };
  try { history.replaceState(null, '', '#inventory'); } catch (e) { /* the view still shows */ }
}
