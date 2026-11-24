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

/* A flip is kept per device, as the owner chose (4 Nov 2026, MP-178), and this page keeps it in this browser. The record holds which view a frame is on and
   which view it came from, as ids. It holds no figure, instrument, horizon, draft or approval. With storage refused the flip still turns,
   for this page only (MP-182). */
const FLIP_KEY = 'mp178-flips';
const flipOK = f => !!f && ['o', 's', 'st', 'landed'].every(k => typeof f[k] === 'string') && (f.from === null || (Array.isArray(f.from) && f.from.length >= 2 && f.from.slice(0, 2).every(x => typeof x === 'string')));
function flipsLoad() {
  try {
    const v = JSON.parse(localStorage.getItem(FLIP_KEY));
    if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
    return Object.fromEntries(Object.entries(v).filter(([, f]) => flipOK(f)).map(([k, f]) => [k, { ...f, got: {}, from: f.from && [f.from[0], f.from[1], {}] }]));
  } catch (e) { return {}; }
}
/* only this frame's key changes, so a second tab's flips stay */
function flipsSave(key) {
  try {
    const all = flipsLoad();
    if (sum.flipped[key]) all[key] = sum.flipped[key]; else delete all[key];
    const ids = ({ o, s, st, landed, from }) => ({ o, s, st, landed, from: from ? from.slice(0, 2) : null });
    localStorage.setItem(FLIP_KEY, JSON.stringify(Object.fromEntries(Object.entries(all).map(([k, f]) => [k, ids(f)]))));
  } catch (e) { /* the flip still turns on this page */ }
}

/* ---------- the flip: both options kept on the first eight journeys (the owner, 4 Nov 2026, MP-178). On Track record the owner picked A (24 Nov 2026, MP-187); B stays drawn, labelled not picked, with the flip. Each journey flips on its own. It is
   absent while signed out, during a step-up, behind an open sheet, and on a proposal, an approval or a record being written, so it can
   never change what an approval binds. ---------- */
const FLIP_NAMES = { home: ['Tiles', 'Ledger'], holdings: ['Desk', 'One by one'], forecast: ['One horizon', 'Ladder'], research: ['Brief', 'Thread'], journal: ['Timeline', 'Lanes'], track: ['Scorecard', 'Table'], cost: ['Ladder', 'Burn-up'], approvals: ['Queue', 'In place'], privacy: ['Centre', 'In place'] };
/* A name of its own, where the view a flip lands on is not its option's usual one. */
const FLIP_AT = { 'cost-a-sources': 'Sources', 'cost-b-log': 'Log', 'cost-a-fit': 'Months', 'cost-b-fit': 'List', 'cost-b-limits': 'Table', 'b-forecast': 'Dossier', 'b-proof': 'Dossier', 'b-views': 'Dossier', 'b-evidence': 'Dossier' };
const pairs = (...p) => Object.fromEntries(p);
const FLIPS = {
  home: pairs(['a-portfolio', 'b-ledger'], ['a-12m', 'b-12m'], ['a-launch', 'b-launch'], ['a-board', 'b-top5'], ['a-segment', 'b-explore'], ['a-seg-uslarge', 'b-top5-uslarge'], ['a-seg-n50', 'b-top5-n50'], ['a-seg-midcap', 'b-top5-midcap'], ['a-seg-usetf', 'b-top5-usetf'], ['a-seg-uketf', 'b-top5-uketf'], ['a-seg-inetf', 'b-top5-inetf'], ['a-seg-metals', 'b-top5-metals'], ['a-brief', 'b-brief'], ['a-weekend', 'b-weekend'], ['a-search', 'b-search']),
  holdings: pairs(['a-list', 'b-accounts'], ['a-private', 'b-private'], ['a-one', 'b-one'], ['a-imports', 'b-imports'], ['a-done', 'b-done']),
  forecast: pairs(['a-forecasts', 'b-forecasts'], ['a-instrument', 'b-ladder'], ['a-technical', 'b-technical'], ['a-proof', 'b-proof'], ['a-views', 'b-views'], ['a-evidence', 'b-evidence'], ['a-scenarios', 'b-scenarios'], ['a-hzstates', 'b-hzstates'], ['a-3m', 'b-ladder'], ['a-12m', 'b-ladder'], ['a-short', 'b-ladder'], ['b-forecast', 'a-instrument']),
  research: pairs(['ra-brief', 'rb-today'], ['ra-card', 'rb-card'], ['ra-ask', 'rb-ask'], ['ra-memory', 'rb-memory'], ['ra-alert', 'rb-alert']),
  journal: pairs(['a-list', 'b-board'], ['a-one', 'b-one'], ['a-differ', 'b-differ']),
  /* Track record (MP-187): the owner picked A, Scorecard, on 24 Nov 2026. B, not picked, stays drawn with the flip so the round reads back. B's one table holds all three breakdowns */
  track: pairs(['a-record', 'b-table'], ['a-slice', 'b-slice'], ['a-holding', 'b-table'], ['a-model', 'b-table'], ['a-regime', 'b-table']),
  /* no flip on Cost's Home: since "Pill on every Home" (OWN-06) both options draw the same Home, so a flip there would change nothing */
  cost: pairs(['cost-a-month', 'cost-b-burn'], ['cost-a-limits', 'cost-b-limits'], ['cost-a-warned', 'cost-b-warned'], ['cost-a-reduced', 'cost-b-reduced'], ['cost-a-paused', 'cost-b-paused'], ['cost-a-sources', 'cost-b-log'], ['cost-a-fit', 'cost-b-fit']),
  approvals: pairs(['aa-queue', 'ab-home']),
  privacy: pairs(['privacy-a-centre', 'privacy-b-home'], ['privacy-a-devices', 'privacy-b-devices'], ['privacy-a-notice', 'privacy-b-notice'], ['privacy-a-data', 'privacy-b-checkup'])
};
/* A state that gives a screen another partner: on these two, the instrument in question is drawn on the dossier, not the ladder. */
const FLIP_TO = { forecast: { disagreement: { 'a-instrument': 'b-forecast', 'a-technical': 'b-forecast', 'b-ladder': 'a-3m', 'b-technical': 'a-3m' }, abstention: { 'a-instrument': 'b-forecast', 'a-technical': 'b-forecast', 'b-ladder': 'a-12m', 'b-technical': 'a-12m' } } };
/* States a pair does not flip in: a commit in flight or unknown, and a permission refused. */
const FLIP_OFF = { holdings: { 'a-done': ['loading', 'error', 'offline'], 'b-done': ['loading', 'error', 'offline'], 'a-private': ['error'], 'b-private': ['error'] } };
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

/* ---------- the run clock, per market (POLICY-002; ADM-10, ADM-11 and ADM-22, MP-186) ----------
   Each market runs after its own close, London time: collect at +15, freeze the data cutoff at +60, issue by +75. The US closes 21:00, so
   its cutoff is 22:00 and its forecasts issue by 22:15; the UK closes 16:35 (cutoff 17:35, issued 17:50); India 10:00 (11:00, 11:15).
   Nothing is one nightly run across the portfolio. The last run of the day is the US one, so a saved or last good figure reads 22:15. The
   US run starts collecting at 21:15, so Twelve Data fails at 21:16, after it starts; that failure leaves only the US on Monday's run. */
const CLOCK = { XNAS: ['22:15', '22:00'], ARCX: ['22:15', '22:00'], XLON: ['17:50', '17:35'], XNSE: ['11:15', '11:00'] };
const CUTOFFS = 'cutoffs US 22:00, UK 17:35, India 11:00';
const ASOF_ALL = `As of 22:15 London · ${CUTOFFS}`;
const LASTGOOD_ALL = 'US: last good run Mon 22:15 · cutoff 22:00. UK and India ran today';
/* Record holds two places, the Journal and the Track record ("A view in Record", OWN-24, MP-187): the top of each carries this switch.
   0 is the Journal, 1 the Track record. */
const recordSwitch = on => `<div data-mo="rise">${seg(['Journal', 'Track record'], on, 'Record', 'full')}</div>`;
/* one instrument's as-of and cutoff, by its market */
const clockOf = h => CLOCK[(h && h.v) || 'XNAS'] || CLOCK.XNAS;

/* ---------- Which drawn controls work (MP-193, the audit's UX-02) ----------
   Every control on a screen is one of three kinds, marked as the screen is drawn on this page:
   work: it does something here (a flip, a switch that redraws, a row that opens, a place that opens its journey);
   illus: an illustration, a control the product will have that does nothing on this page;
   policy: not allowed here, drawn disabled, and the screen says why.
   A screen reader hears the kind, and "Mark what works" outlines them. The screens' own drawings do not change. */
const WORKING_SEGS = { home: ['Forecast horizon'], forecast: ['Forecast horizon', 'Detail', 'Dossier'] };
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

/* ---------- the sidebar, from 1024 up: the tab bar's places, then Research, Approvals and Imports ("Add them to the sidebar", OWN-02) ----------
   A screen in one of those three lights its own place on iPad and desktop, and its first screen there needs no way back to the tab it hangs
   off on a phone (from). A phone keeps its five tabs, and its back links, as drawn. */
const SIDE = ['portfolio', 'forecasts', 'segments', 'record', 'research', 'approvals', 'imports', 'sources', 'settings'];
const wideKind = ctx => ctx.kind === 'ipad' || ctx.kind === 'web';
const placed = (ctx, place, spec, from) => (wideKind(ctx) ? { ...spec, side: place, back: from && spec.back === from ? undefined : spec.back } : spec);

/* ---------- the cost pill on every Home, whichever way Cost is flipped ("Pill on every Home", OWN-06) ----------
   The month as Cost states it, state by state: [committed, its word, its status, the forecast]. The cost journey passes its own month, and a
   fact holds the two equal on every Home. Whole pounds where it must be short; a bill that differs by 31p keeps its pence. */
const PILLM = {
  default: ['46.42', 'committed so far', 'On plan', 'up to £59.73'], loading: ['46.42', 'committed so far', 'Refreshing · last good 22:15', 'up to £59.73'],
  empty: ['27.84', 'committed so far', 'New month', 'up to £59.73, the plan'], error: ['37.69', 'last reconciled', 'Stale · 39 h old', 'up to £59.73, estimated only'],
  stale: ['46.42', 'committed so far', 'Billing 39 h old', 'up to £59.73'], offline: ['46.42', 'committed so far', 'Offline · from 22:15', 'up to £59.73'],
  noModel: ['39.02', 'committed so far', 'Claude off', '£46.48'], disagreement: ['46.73', 'with the bill', 'Estimate and bill differ', 'up to £60.04'],
  abstention: ['39.36', 'known so far', 'Claude unknown', 'Not shown']
};
function costPillOf(ctx, m) {
  const st = ctx.state, [so, word, status, fc] = m || PILLM[st] || PILLM.default, whole = `£${Math.round(parseFloat(so))}`, ceil = '<span class="sr"> of £100</span>';
  const words = { loading: `Last good ${whole}`, error: `${whole}${ceil} · collector failed`, stale: `${whole}${ceil} · billing 39 h old`, offline: `${whole}${ceil} · saved`, disagreement: `£${so}${ceil} · bill differs`, abstention: `${whole}${ceil} · part unknown` }[st] || `${whole} of £100`;
  const icon = { error: 'alert', stale: 'clock', offline: 'wifi-off', disagreement: 'split', abstention: 'ban' }[st];
  /* with amounts hidden the pounds are masked with the rest, and the bar stays, as a percentage does (OWN-18). Proposed. */
  const shown = ctx.hidden ? words.replace(/^(Last good )?£[\d.]+/, '$1£••') : words;
  return costPill(shown, { icon, fill: parseFloat(so), more: ctx.hidden ? 'Amounts hidden. Opens the month' : `£${so} ${word}. ${status}. Forecast ${fc}. Opens the month` });
}

/* ---------- chrome: a journey writes its content once, and each device frames it ---------- */
const WEBTABS = [['home', 'Portfolio'], ['fan', 'Forecasts'], ['grid', 'Segments'], ['target', 'Record'], ['sliders', 'Settings']];
/* mode 'default' keeps the price chips as they are on a screen whose state is not about market data. Offline and loading are always shown. */
function freshRow(ctx, mode) {
  const st = mode && !['offline', 'loading'].includes(ctx.state) ? mode : ctx.state;
  if (st === 'offline') return `<div class="jfresh on-glass"><span class="chip offline">${ic('wifi-off', 's14')}Offline · from 22:15</span></div>`;
  if (st === 'error') return `<div class="jfresh on-glass"><span class="chip error">${ic('alert', 's14')}Twelve Data · error 21:16</span>${fresh('Yahoo')}</div>`;
  if (st === 'stale') return `<div class="jfresh on-glass">${fresh('Twelve Data')}${fresh('Yahoo', 'stale', 'HSBC stale')}</div>`;
  if (st === 'empty') return `<div class="jfresh on-glass">${fresh('Twelve Data')}${fresh('Yahoo')}</div>`;   // no holdings to be late
  if (st === 'loading') return `<div class="jfresh on-glass"><span class="chip fresh"><span class="dot"></span>Refreshing · last good 22:15</span>${fresh('Twelve Data')}${fresh('Yahoo', 'stale', 'HSBC late')}</div>`;
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
    case 'error': return stateCard('alert', 'This did not load', `${what} failed at 21:16. The last good figures stay on screen, labelled with their time.`, btn('Try again', 'tinted', 'refresh')) + ok();
    case 'stale': return banner('warn', 'Stale.', `${what} last updated 16:35. It is held until prices return.`, 'clock') + ok();
    case 'offline': return banner('', 'Offline.', `Showing ${what.toLowerCase()} from 22:15. Nothing updates until you reconnect.`, 'wifi-off') + ok();
    case 'noModel': return stateCard('cube', 'No approved model', `No approved model covers this yet, so no forecast is shown. Prices and holdings still work.`) + ok();
    case 'disagreement': return banner('', 'Models disagree.', 'R2-HGB v3 and the baseline differ on direction. Both ranges show, and no action is ranked.', 'split') + ok();
    case 'abstention': return stateCard('ban', 'The model abstained', `Too little comparable history for a calibrated range, so no range is shown.`) + ok();
    default: return ok();
  }
}

/* spec: { tab, title, back, actions: html, body: html, rail: html, accessory: html, sheet: html, field: bool } */
function frame(ctx, spec) {
  if (ctx.also) spec = { ...spec, body: alsoBanner(ctx.also) + (spec.body || '') };   // a combined condition (MP-193)
  const tab = spec.tab ?? 0, sideTab = spec.side ? SIDE.indexOf(spec.side) : [0, 1, 2, 3, 8][tab], field = spec.field === false ? '' : '<div class="dfield"></div>';   // tab 4 is Settings, the sidebar's ninth item
  const sheet = spec.sheet ? `<div class="jsheet${ctx.kind === 'iphone' || ctx.kind === 'pwa' ? '' : ' center'}"><div class="scrim"></div>${spec.sheet}</div>` : '';
  const dataRow = `<div style="margin:12px;padding:12px;border-radius:16px;background:var(--glass-thin);display:grid;gap:6px;justify-items:start" class="on-glass"><span class="label" style="color:var(--ink)">Data</span>${freshRow(ctx, spec.fresh)}<span class="small">${ctx.state === 'error' && !spec.fresh ? LASTGOOD_ALL : ASOF_ALL}</span></div>`;
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
  add(j) { sum.journeys.push(j); },
  all: () => sum.journeys,
  start() {
    sum.flipped = flipsLoad();
    const hash = location.hash.slice(1).split('.');
    const i = sum.journeys.findIndex(j => j.id === hash[0]);
    if (i >= 0) sum.at.j = i;
    if (hash[1] === 'b') sum.at.o = 1;
    const surfAt = SURFACES.find(s => s[0] === hash[2]), stateAt = STATES.find(s => s[0] === hash[3]);   // the code's own ids, never the address bar's text (MP-198)
    if (surfAt) sum.at.s = surfAt[0];
    if (stateAt) sum.at.st = stateAt[0];
    buildToc();
    /* Mark what works (MP-193): a page setting, kept for this visit only */
    const mk = $('#markctl');
    mk.onclick = () => { const on = mk.getAttribute('aria-checked') !== 'true'; mk.setAttribute('aria-checked', String(on)); root.classList.toggle('markctl', on); $('#jlive').textContent = on ? 'Controls marked: solid works here, dashed is an illustration, dotted is not allowed here' : 'Controls not marked'; };
    if (hash[0] === 'inventory') showInventory(); else if (hash[0] === 'combined') showCombos(); else show();
    /* a theme press, or the system's theme changing under Auto */
    const repaint = () => { if (sum.retheme) sum.retheme(); };
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
J.combos = () => COMBOS;
J.comboHTML = comboHTML;
J.comboRule = () => COMBO_RULE;
window.__prismStates = STATES;
window.__prismSurfaces = SURFACES;

function buildToc() {
  const toc = $('#toc');
  toc.innerHTML = sum.journeys.map((j, i) => `<a href="#${j.id}" data-i="${i}">${j.title}</a>`).join('') + `<a href="#inventory" data-i="inv">State inventory</a><a href="#combined" data-i="cmb">Combined conditions</a>`;
  toc.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    if (a.dataset.i === 'inv') { showInventory(); return; }
    if (a.dataset.i === 'cmb') { showCombos(); scrollTo({ top: 0 }); return; }
    sum.at.j = +a.dataset.i; sum.at.o = 0; show();
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
  ['#jrow', '#jwhy', '.jctl', '.jhead'].forEach(s => { $(s).hidden = false; });
  mark(sum.at.j);
  $('#jtitle').textContent = j.title;
  $('#jsummary').textContent = j.summary;
  $('#jmeta').innerHTML = `<span class="chip proposed"><span class="dot"></span>Proposed</span>${j.picked ? `<span class="chip owner"><span class="dot"></span>Owner picked ${j.picked.toUpperCase()} · ${(j.options.find(x => x.id === j.picked) || {}).name}, ${j.pickedOn}</span>` : '<span class="chip owner"><span class="dot"></span>Both kept, with a flip</span>'}<span class="chip illus">Not approved UX</span><span class="chip illus">All figures illustrative</span>${(j.stories || []).map(s => `<span class="chip">${s}</span>`).join('')}`;
  $('#jopt').innerHTML = seg(j.options.map(x => [`${x.id.toUpperCase()} · ${x.name}${j.picked ? (x.id === j.picked ? ' (picked)' : ' (not picked)') : x.rec ? ' (starts here)' : ''}`]), sum.at.o, 'Option', 'full');
  $('#jopt').onclick = e => { const b = e.target.closest('button'); if (!b) return; const i = $$('#jopt button').indexOf(b), said = `Option ${b.textContent}`; sum.at.o = i; show(); hold('#jopt', i, said); };
  $('#jsurf').innerHTML = seg(SURFACES.map(s => [s[1]]), SURFACES.indexOf(surf), 'Device', 'full');
  $('#jsurf').onclick = e => { const b = e.target.closest('button'); if (!b) return; const i = $$('#jsurf button').indexOf(b), said = `Device ${b.textContent}`; sum.at.s = SURFACES[i][0]; show(); hold('#jsurf', i, said); };
  const naAll = k => k !== 'default' && o.screens.every(s => (s.na || {})[k]);
  chips($('#jstate'), STATES.map(([k, t]) => [k, t, naAll(k) ? 'Does not apply to this journey' : '']), sum.at.st, k => { sum.at.st = k; show(); });
  $('#jwhy').innerHTML = `<p><b>${o.rec ? 'Why it starts here.' : 'What this view does.'}</b> ${o.why}</p>${o.cost ? `<p><b>What it costs.</b> ${o.cost}</p>` : ''}`;
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
  /* The flip turns this one frame on the review strip. In the app a kept flip covers the whole journey ("Whole journey", OWN-01a), and the review page stays as it is ("Your real devices only", OWN-01b), so the strip still turns one frame at a time. A press takes its target from the control, and a second press returns to exactly what
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
      extra = { hz: undefined, mode: undefined, t: undefined, ...was.from[2] };   // a record read back holds none of these, and they still clear
      ['hz', 'mode'].forEach(k => { if (saved[k] !== was.got[k]) extra[k] = saved[k]; });   // what was pressed inside the turned frame comes home with it
    }
    let to = screenOf(oo, ss);
    if (!to && back) { [, oo, ss] = b.dataset.flip.split('|'); extra = saved; to = screenOf(oo, ss); }   // a kept way back can name a screen since removed
    if (!to) return;
    oo = j.options.find(x => x.id === oo).id; ss = to.id; extra = frameExtra(extra);   // from here on, the code's own ids and values (MP-198)
    if (oo === o.id && ss === s.id) delete sum.flipped[key];
    else sum.flipped[key] = { o: oo, s: ss, st: sum.at.st, landed: `${j.id}|${oo}|${ss}`, got: extra, from: back ? null : [cur[1], cur[2], saved] };
    flipsSave(key);
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
/* What a browser keeps offline. The owner pressed "Both keep the five" (MP40-Q12c, 5 Nov 2026): a browser keeps the same five
   records as the Apple app, each with its age. No record says how a browser protects them, so every offline frame on web and phone
   web says so, in this one sentence, and an Apple frame does not. */
const BROWSER_UNVERIFIED = 'How a browser protects saved records is unverified.';
/* a rule the owner's pick settles: the chip quotes the pick's id, beside any value it leaves open (MP-192) */
const settled = id => `<span class="chip owner" data-mo="chip"><span class="dot"></span>Settled · ${id}</span>`;
const browserKept = () => `<div class="jkept" data-mo="rise"><span class="chip offline" data-mo="chip">${ic('wifi-off', 's14')}Saved in this browser</span><span class="small muted">${BROWSER_UNVERIFIED}</span></div>`;
const OPEN = [
  ['Where do Research, Approvals and Imports live in the navigation? Neither the five tabs nor the sidebar has them.', 'Settled, 5 Nov 2026 ("Add them to the sidebar", OWN-02): the iPad and desktop sidebar carries Research, Approvals and Imports, and each of their screens lights its own place there. The phone keeps its five tabs: Research hangs off Portfolio, and Approvals and Imports sit under Settings. Proposed: their order in the sidebar and their icons. Open: in Approvals B, where each decision stays where the thing lives, what the sidebar\'s Approvals opens is not drawn.'],
  ['When is a late price still used in the total? (DATA-DEC-02)', 'Settled (MP-65): a price past the limit leaves the total and the reason shows. Settled, 5 Nov 2026 ("Approve the proposed limits now", OWN-07): a quote is fresh to its interval end plus its delay plus 5 minutes, a close to the next expected close plus a grace, a fund price is overdue 60 minutes after its deadline, and FX may be 24 hours old. Open: the grace on a close. Illustrative: 14:10 is inside the limit in Ready and past it in Stale.'],
  ['How long may a chat-proposed listing wait for your confirm? (MP40-Q9) And other proposals? (CT-02)', 'Settled, 5 Nov 2026 ("Same day, as drawn", MP40-Q9): a chat-proposed listing expires the same day, at 18:00 as drawn, or sooner if its check changes. Settled, 5 Nov 2026 ("By kind, as drawn", OWN-08): each other kind keeps its own wait, days for a promotion or a setting, none for a restart. Open: how many days, and a replay\'s wait, so those dates are illustrative and labelled Proposed · CT-02. The 15-minute financial window is settled too (POLICY-001).'],
  ['Action thresholds (FIN-OD-07)', 'Settled, 5 Nov 2026 ("Evidence first", OWN-09): no label appears until evaluation supports the thresholds and you approve a ranking policy version. Portfolio and Ledger at launch draw that time; every other screen draws labels as they read after the approval. The unclassified case sits only there and in the journal\'s Empty state: No model is about India alone, so only India\'s listings lose their range and action, and NVIDIA keeps its label (OWN-30, not a pick for you, closed in MP-194). Open: the thresholds themselves.'],
  ['Import limits and locked PDFs (MP40-Q1, MP40-Q2)', 'Settled, 5 Nov 2026 ("Set from your real statements", MP40-Q1): oversized files stay held as drawn, and the four limits are set from your largest real statements, with a margin, when they arrive. Open: the four limit values, so none is drawn. Locked PDFs: settled, 5 Nov 2026 ("Local unlock step", MP40-Q2): you type its password in a step on your device, which opens the PDF there and sends only the unlocked copy. The password never leaves the device, and it is never stored, logged or sent to a model. Drawn as Unlock a PDF in both options of Holdings and imports.'],
  ['Is one root with no uniqueness certificate Ambiguous, and how is a search limit worded? (FIN-OD-04)', 'Settled, 5 Nov 2026 ("Show it, not picked", OWN-14): a found rate that is not proved the only one appears in the note beside the status, never as the headline, so Reliance stays Ambiguous with its one found rate shown and not picked. Open: how the search limit is worded and its tolerances, which the pack leaves to the specification. AstraZeneca stays Nonconvergent: the search used its budget before it could separate the possible rates, so none is stated, labelled Proposed · FIN-OD-04.'],
  ['What no clear view, a cost pause and the technical mode show on a forecast (MP-145)', 'The cost pause is settled, 5 Nov 2026 ("Daily forecasts keep running", OWN-25): daily forecasts carry on past £85, inside the £15 kept above it, and Cost paused shows only where a forecast needs optional paid work. Open: what no clear view and the technical mode show, which stay labelled proposed (MP-145).'],
  ['Does an open reconciliation difference withhold the account return? (FIN-OD-04)', 'Settled, 5 Nov 2026 ("Withhold only if material", OWN-31): a small difference leaves the return showing and flagged, and above a limit you approve the return is withheld. Open: that limit. Proposed: £8.15 counts as small, so General shows +17.4% beside it.'],
  ['A revoked device that has not connected can still read its saved copy, against MP-165. Is that acceptable?', 'Settled, 5 Nov 2026 ("Saved copy also times out", OWN-37): the copy clears when the device next connects, and the app also stops showing it after a set time without reaching the server. Settled, 24 Nov 2026 ("Same rule, same time", MP203-01): a browser\'s saved copy clears on its next connection and stops showing after the same time-out as the Apple app. Open: that one time, which you choose, so no number is drawn. Unverified: how well an offline app or a browser can enforce it.'],
  ['What is kept offline, and which devices (MP40-Q12)', 'What is kept: settled, 5 Nov 2026 ("Both keep the five", MP40-Q12c): the Apple app and a browser each keep holdings, prices, forecasts, notices and cost, each with its age. Unverified: how a browser protects them, which needs an architecture answer before build, so every browser offline frame says so. Which devices: settled, 5 Nov 2026 ("Your own devices only", MP40-Q12a): support and test the iPhone and iPad you own, at the iOS they run, and ("Any window width", MP40-Q12b) the Apple app lays out by window width, so a narrow iPad window uses the phone layout. Open: the models, which you give, so none is named.'],
  ['Revocation time (CT-17) and which acts need a fresh sign-in (CT-01)', 'The acts are settled, 5 Nov 2026 ("Anything that writes or widens", OWN-39): every act that changes a record, widens what MP may do or opens an original needs a fresh sign-in, and reading and stopping do not. Open: how recent a sign-in must be, and the revocation time. Both are set from measured proof before the identity phase ends, so no time is promised. Settled, 5 Nov 2026 ("Any healthy path", ADM-03): revoking a device asks for a fresh sign-in on any healthy path, passkey or Google, and the revoke removes any passkey held on it ("Revoke removes it too", ADM-02), unverified until MP-197.']
];
/* What the owner has answered: each row quotes the label the owner picked, with its id (MP-184, MP-192). A row moves here only when the picks answer the whole question */
/* ---------- Combined conditions on the approval path (MP-193, the audit's UX-12) ----------
   Each screen above shows one state at a time. These draw a few risky pairs, each on the real Approvals screen in one state, with
   the second condition's banner on top. The rule they show is proposed for the owner (MP-193): every
   condition that stops a write keeps stopping it, whichever banner comes first; reading, going back and showing what is hidden
   stay open. */
const COMBO_RULE = 'Every condition that stops a write keeps stopping it, whichever banner shows first. A screen with two conditions shows both banners, each in its own words. Reading, going back and showing what is hidden stay open; approving, refusing and anything else that writes waits until every condition has cleared.';
const WRITES = /^(Approve|Refuse|Confirm|Continue with passkey|Raise|Ask again|Try again|Restart|Switch forward|Promote|Revoke)\b/;
const COMBOS = [
  {
    id: 'offline-expired', title: 'Offline, and the proposal expired meanwhile', screen: 'aa-setting', state: 'stale',
    also: ['', 'Offline.', 'Showing this from 22:15. Nothing can be approved or asked again until you reconnect.', 'wifi-off'],
    when: 'You open a settings proposal on a train. Its expiry, Mon 18:00, passed while you were offline.',
    stays: 'The proposal, exactly what it would change, its bound version v9 and the time it expired. The data row keeps its age.',
    can: 'Read it, and go back.', held: 'Approve and Refuse: it has expired, and you are offline. Neither condition alone would let them back.',
    recover: 'Reconnect. The proposal still reads Expired. If code proposes it again, the repeat backs off with a visible reason (OWN-08), and the new one is bound to the version current then, with its own expiry and a fresh sign-in.',
    record: 'Code records the expiry. Nothing is written while you are offline, and nothing is queued to send later.',
    settled: ['OWN-08'], proposed: []
  },
  {
    id: 'hidden-raise', title: 'Amounts hidden, with a budget raise to approve', screen: 'aa-budget', state: 'default', hide: true,
    also: ['', 'Amounts are hidden.', 'This approval is about an amount, so Approve waits until you show amounts. Showing them needs only a press, on this device.', 'eye-off'],
    allow: /^(Show amounts|Refuse)/, extra: 'Show amounts',
    when: 'Privacy mode is on (money and units masked, OWN-18) and code has drafted a raise of the warning line for your queue (OWN-35).',
    stays: 'The proposal, its line, its expiry and the binding; percentages stay. Every amount reads £••.',
    can: 'Read it, refuse it, go back, or show amounts.', held: 'Approve, until amounts show: you never approve a figure you cannot see.',
    recover: 'Show amounts. Approve opens with the figures in view, then asks for your fresh sign-in, as every raise does. Amounts stay shown until you hide them again.',
    record: 'The approval, as any raise, bound to the line, value, version and expiry. Showing amounts writes nothing.',
    settled: ['OWN-18', 'OWN-35'], proposed: ['MP-193']
  },
  {
    id: 'unknown-offline', title: 'The month cannot be known, and you are offline', screen: 'aa-budget', state: 'abstention',
    also: ['', 'Offline.', 'Showing this from 22:15. Billing cannot be refreshed until you reconnect.', 'wifi-off'],
    when: 'Claude usage is not collected, so the month is unknown, and the phone has lost its connection.',
    stays: 'The raise code drafted earlier, its line and value, held, with why it cannot be approved now. The month reads unknown, never £0.',
    can: 'Read it, and go back.', held: 'Approving the raise: nothing can be approved while the month is unknown, and nothing is approved offline.',
    recover: 'Reconnecting clears only the offline part. The raise waits until the prod collector fills the month (MP40-Q5); then code checks it again, and approving it needs a fresh sign-in.',
    record: 'Nothing new. The unknown month and the collector that failed are already in the cost record.',
    settled: ['MP40-Q5'], proposed: []
  }
];
/* One combination drawn on one device: the real screen, the second banner on top, every write held, amounts masked when hidden. */
function comboHTML(c, surf, scheme) {
  const ap = sum.journeys.find(j => j.id === 'approvals'), sc = ap.options[0].screens.find(s => s.id === c.screen);
  const ctx = { kind: surf, state: c.state, scheme, journey: 'approvals', option: 'a', hidden: !!c.hide, also: c };
  let html = sc.render(ctx);
  if (c.hide) html = html.replace(/£\s?\d[\d,]*(?:\.\d+)?/g, '£••');
  html = html.replace(/<button([^>]*)>([\s\S]*?)<\/button>/g, (m, attrs, inner) => {
    const said = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!WRITES.test(said) || (c.allow && c.allow.test(said)) || /\sdisabled(?=[\s>=]|$)/.test(attrs)) return m;
    return `<button${attrs} disabled>${inner}</button>`;
  });
  return markControls(html, 'approvals');
}
/* the frame puts the second condition's banner first in the body */
const alsoBanner = c => `<div class="combo-also">${banner(c.also[0], c.also[1], c.also[2], c.also[3])}${c.extra ? `<div style="margin-top:8px">${btn(c.extra, 'tinted', 'eye-off')}</div>` : ''}</div>`;
function showCombos() {
  mark('cmb');
  ['#jrow', '#jwhy', '.jctl', '.jhead'].forEach(s => { $(s).hidden = true; });
  const inv = $('#jinv'); inv.hidden = false;
  const sch = schemeNow(), chip = (cls, t) => `<span class="chip ${cls}"><span class="dot"></span>${t}</span>`;
  const devs = [SURFACES.find(s => s[0] === 'iphone'), SURFACES.find(s => s[0] === 'web')];
  inv.innerHTML = `<h2>Combined conditions</h2><p class="sum">Each screen elsewhere shows one state at a time. These are the risky pairs on the approval path, each drawn on the real Approvals screen with both conditions showing. The screens are illustrative.</p>
    <div class="card combo-rule"><b>The rule</b> ${chip('proposed', 'Proposed · MP-193')}<p>${COMBO_RULE}</p></div>
    ${COMBOS.map(c => `<section class="combo" id="combo-${c.id}" aria-labelledby="combo-h-${c.id}"><h3 id="combo-h-${c.id}">${c.title}</h3><div class="combo-chips">${c.settled.map(s => chip('owner', `Settled · ${s}`)).join('')}${c.proposed.map(s => chip('proposed', `Proposed · ${s}`)).join('')}</div>
      <dl class="combo-kv">${[['When', c.when], ['What stays', c.stays], ['What you can do', c.can], ['What is held', c.held], ['How it recovers', c.recover], ['What the record keeps', c.record]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      <div class="combo-boards">${devs.map(d => `<div class="combo-board">${boardHTML(d[2], d[3], d[4], comboHTML(c, d[0], sch), sch, `${c.title} · ${d[1]}`)}</div>`).join('')}</div></section>`).join('')}`;
  fitCombos();
  if (!sum.comboFit) { sum.comboFit = true; addEventListener('resize', () => { if (!$('#jinv').hidden && $('#jinv .combo')) fitCombos(); }); }
  watch(inv);
  try { history.replaceState(null, '', '#combined'); } catch (e) { /* the view still shows */ }
}
/* a desktop frame fits its column, as fitFrames does on the review strip */
function fitCombos() {
  $$('#jinv .combo-board .board > .dev').forEach(d => { d.style.zoom = ''; const z = (d.closest('.combo-board').clientWidth - 8) / d.offsetWidth; if (z < 1) d.style.zoom = Math.max(.2, z).toFixed(3); });   // .2 lets a desktop frame fit a 320 wide phone
}

const SETTLED = [
  ['Does a kept flip cover one screen or the whole journey, and is "per device" the phone in your hand or the frame drawn here? The owner\'s words were "A, kept per device". (MP-182)', 'Settled, 5 Nov 2026 ("Whole journey", OWN-01a): flip once anywhere in a journey and every screen in that journey opens in that view on that device. Settled, 5 Nov 2026 ("Your real devices only", OWN-01b): in the app, each iPhone, iPad and browser keeps its own choice, and the review page stays as it is: the strip turns one frame at a time, and a flip kept in this browser shows on every drawn device.'],
  ['MP-144 lets a candidate be labelled buy or watch, and MP never trades. Which word?', 'Settled, 5 Nov 2026 ("Watch only", OWN-03): every candidate reads Watch, and MP-144 drops the word buy.'],
  ['Is Claude on or off at launch? Admissible credit is zero today.', 'Settled, 5 Nov 2026 ("Approve paid Claude at launch", OWN-04): you approve paid use, so chat, research and explanations can run from day one, each route after passing its evaluation. Ready shows Claude on, £54.73. Claude off is the No model state.'],
  ['How much cost shows on Home, and may a card sit before the holdings on a phone?', 'Settled, 5 Nov 2026 ("Pill on every Home", OWN-06): a pill in the top bar shows the month on every Home, whichever way Cost is flipped, and the row after the holdings goes. The meter sits inside Cost, at the top of This month. No cost card sits before the holdings. Proposed: with amounts hidden, the pill\'s pounds are masked with the rest and its bar stays.'],
  ['Scenario returns (SCI-D06)', 'Settled, 5 Nov 2026 ("Sourced proposal, then approve", OWN-10): a separate piece of work proposes each template value with its evidence, and you approve them. The drawn figures are placeholders, and Empty is the state today.'],
  ['Billing data and freshness (MP40-Q5, MP40-Q6)', 'Settled, 5 Nov 2026 ("Adopt the key", MP40-Q5): the prod collector alone reads it from secure storage every six hours and fills the Claude line, and Ready stands. Settled, 5 Nov 2026 ("Approve all three", MP40-Q6): past 36 hours relevant optional work waits, credit counts only with proof under 30 minutes old, and the £15 above the £85 pause stays for sign-in, ledger reads, audit and recovery. The £15 kept above £85 now also holds daily forecasts (the owner, 5 Nov 2026: "Yes, add them").'],
  ['Weekend brief (MP40-Q11)', 'Settled, 5 Nov 2026 ("Weekdays only", MP40-Q11b): no brief on Saturday or Sunday, and Home says why, drawn as No brief at the weekend. That held alerts then land in the inbox at 07:30 is proposed in the pick itself, and labelled.'],
  ['Can a disagreement with no ranked action be recorded at all? (MP-158)', 'Settled, 5 Nov 2026 ("Any time evidence shows", OWN-15): yes, saved with both sides and why no action was ranked.'],
  ['Does revoking an approval need a fresh sign-in? (CT-01)', 'Settled, 5 Nov 2026 ("An open session is enough", OWN-16): any live signed-in session revokes at once, and a signed-out device signs in first. The Sign-in too old state is gone from Approvals and Holdings.'],
  ['Does an abstained or split horizon take only growth, or protection too? (MP-135)', 'Settled, 5 Nov 2026 ("Both parts go", OWN-17): both go, so the name is not ranked. Apple leaves US tech in Disagreement and in Abstaining.'],
  ['Do units count as amounts when amounts are hidden? (MP-84)', 'Settled, 5 Nov 2026 ("Mask units too", OWN-18): money and units are masked, and percentages stay.'],
  ['How does rebasing a part of a history work? (FIN-OD-03)', 'Settled, 5 Nov 2026 ("Whole history only", OWN-19): a rebuild can be approved only when statements cover every unit, and a part one stays held and visible. Drawn as a part rebuild whose approval is disabled.'],
  ['With the model abstaining at 12 months, does a holding keep its action at 3 and 6 months? (MP-144)', 'Settled, 5 Nov 2026 ("No score, no action", OWN-20): no. A holding not ranked shows no action at any horizon until it can be ranked again, with the reason.'],
  ['How long does an approved switch forward or restart stay open? (CT-02)', 'Settled, 5 Nov 2026 ("15 minutes, as drawn", OWN-21): your yes must start applying within 15 minutes, or you approve again.'],
  ['Must ranges show on Home itself? MP-153 asks for them, and a tile cannot hold one.', 'Settled, 5 Nov 2026 ("One tap in, reword MP-153", OWN-22): Home A keeps its tiles, Home B keeps its rows, and MP-153 says the range sits on the segment list. Home A shows ranges one tap in, on every segment list, and says so in its cost. Home B shows them in the rows.'],
  ['Can a decision be recorded against an abstention? (MP-158)', 'Settled, 5 Nov 2026 ("Any time evidence shows", OWN-15): yes, against the evidence, and the entry says why no action was ranked. With no forecast at that horizon it may never get an outcome. Past entries stand.'],
  ['Where do track records by horizon and regime live? (MP-154)', 'Settled, 5 Nov 2026 ("A view in Record", OWN-24): a Track record view in Record, beside the Journal. Its shape is settled too, 24 Nov 2026 ("A · Scorecard", MP-187): one card per horizon, with holding, model and regime a tap away. One table (B) stays drawn, labelled not picked. Proposed: a rate shows once 30 forecasts have scored (SCI-D03), and the regime rule (SCI-D04).'],
  ['Gold and silver have no short-term rows, views or scenarios (SCI-D08)', 'Settled, 5 Nov 2026 ("Use the provider\'s daily bar", OWN-26): each day\'s value is the provider\'s daily bar, with its boundary recorded, once the first month proves cover. Until then gold and silver show prices, with no short-term rows, views, scenarios or list. Settled, 24 Nov 2026 ("The provider\'s bar days", MP203-10): each day the provider publishes a daily bar is a valuation day, and a missing bar is recorded as missing, never filled.'],
  ['Probation at 6 and 12 months, where nothing matures in the first 4 live weeks, and the bad-week rule (SCI-D07)', 'Settled, 5 Nov 2026 ("As proposed", OWN-27): a bad week scores strictly worse than the previous model on that week\'s matured pairs, and two must run together. At 6 and 12 months probation checks clean running only, so it ends with no score at those horizons. Settled, 24 Nov 2026 ("Pairs when there are any", MP203-04): a 3-month model on probation is judged on any pairs that mature in its 4 weeks, from forecasts it made in shadow, and is checked for clean running too. With no pairs, clean running only.'],
  ['What evidence does restarting a paused scope need, and does the yes give the model a fresh approval? (POLICY-003)', 'Settled, 5 Nov 2026 ("Cause cleared, fresh approval", OWN-28): code shows why it paused, that the cause is gone and that the model passes today\'s checks. Your yes renews its approval for that scope only.'],
  ['Does a proposal you keep paused stay with what waits on you? (CT-02)', 'Settled, 5 Nov 2026 ("It stays, undated", OWN-29): it stays with what waits on you, with no expiry, until you restart.'],
  ['Reliance reads Pause beside a positive median at 3 and 12 months, and the conflict is recorded only at 6. Is that right? (SCI-D03)', 'Settled, 5 Nov 2026 ("Conflict at every long horizon", OWN-32): wherever they point different ways at 3, 6 or 12 months, that horizon is conflicted and no action is ranked. Reliance is conflicted at all three.'],
  ['What counts as beating the rules, and how rules are scored (SCI-D03)', 'Settled, 5 Nov 2026 ("A lower score is enough", OWN-33): the model must score better on average than each comparator on the same forecasts, and rules are scored through the frozen mapping. Settled, 5 Nov 2026 ("Use the best simple baseline", ADM-09): where the rules cannot be scored fairly, the strongest simple baseline stands in for them on that task, with your yes each time, in admin Models. Settled, 24 Nov 2026 ("Once, as a standing rule", MP203-05): for range tasks you approve once that the strongest simple range baseline stands in for the rules; each promotion screen names it, and you still approve every promotion. Settled, 24 Nov 2026 ("Confirm: no hurdle, no interval", MP203-06): in the live trial a lower average score than each comparator on the same matured forecasts is enough, and the 2% hurdle and the 95% interval stay in the walk-forward test only.'],
  ['How long a risk alert cools down (CT-18)', 'Settled, 5 Nov 2026 ("Once in 24 hours", OWN-34): one push per holding, rule and severity in 24 hours, sooner only if it worsens or the cause is new. What makes an alert material or critical is settled too ("Your lines, no investment wake-ups", MP40-Q11a). Settled, 24 Nov 2026 ("Never for investment alerts", MP203-02): no investment alert breaks quiet hours, so it waits for 07:30. Settled, 24 Nov 2026 ("A short named list", MP203-03): only a named critical fault breaks them; the four faults on the list are proposed (CT-18). Each line\'s value is still yours to set (CT-18).'],
  ['May a budget be raised through an approval? MP-114 bars it and MP-78 lists it as a sensitive action.', 'Settled, 5 Nov 2026 ("Code may draft one", OWN-35, not the Recommended option): when a line is close, code drafts an exact raise for your queue, with cost and rollback, and you approve it with a fresh sign-in. Drawn as Budget raise in Approvals. How code sizes a raise is open (CT-13).'],
  ['Which runs does a Reduce line cut? (MP-103)', 'Settled, 5 Nov 2026 ("Cut in a set order", OWN-36): backfills first, then challenger models, then Claude jobs, and code says which step it reached. How far each step cuts is not set (CT-13).']
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
  inv.insertAdjacentHTML('beforeend', `<h2 style="margin-top:32px">What a flip changes</h2><p class="sum">A flip turns the view of a place. The freshness, the provider status and the risk stay the same, the figures both sides show stay the same, and a side may hold more. Each journey starts in A, keeps your choice on that device, and flips on its own. There is no flip while signed out, during a step-up, behind an open sheet, or on a proposal, an approval or a record being written, and none on a few read-only screens with no counterpart, such as the notices list in Approvals B or an opened source, nor on Cost's Home, which is the same whichever way Cost is flipped (OWN-06). A receipt turns only once its commit is done, and a refused permission does not turn. In Disagreement and Abstaining, the instrument in question turns to its dossier or its own horizon, so the name never changes.</p><h2 style="margin-top:32px">Cells that do not apply</h2><p class="sum">Why each of the ${na} cells cannot occur on its screen. This is a reading of "every screen shows", put to you to accept.</p><div class="tblwrap"><table class="spec"><thead><tr><th>Screen</th><th>State</th><th>Why it cannot occur</th></tr></thead><tbody>${naRows.join('')}</tbody></table></div>`);
  inv.insertAdjacentHTML('beforeend', `<h2 style="margin-top:32px">What these screens wait on</h2><p class="sum">Both options stay on the first eight journeys, with a flip. On Track record you picked A, Scorecard; B stays drawn, labelled not picked, with the flip. These questions cross journeys, and each is drawn as the records stand today, labelled where it is proposed.</p><div class="tblwrap"><table class="spec"><thead><tr><th>Question</th><th>How it is drawn</th></tr></thead><tbody>${OPEN.map(([q, d]) => `<tr><td>${q}</td><td>${d}</td></tr>`).join('')}</tbody></table></div><h2 style="margin-top:32px">Settled by the owner</h2><p class="sum">The owner answered these on 5 November 2026 (MP-184), or on the date given. Each quotes the label the owner picked.</p><div class="tblwrap"><table class="spec"><thead><tr><th>Question</th><th>The owner's answer</th></tr></thead><tbody>${SETTLED.map(([q, d]) => `<tr><td>${q}</td><td>${d}</td></tr>`).join('')}</tbody></table></div><h2 style="margin-top:32px">Checked against current releases</h2><p class="sum">Checked on 4 November 2026 and nothing is installed. SvelteKit 3.1.1 with Svelte 5.57.3 on npm, which matches SvelteKit 3 in TECH-STACK. Current simulators list iPhone 17, 17 Pro, 17 Pro Max and 17e, the iPhone 16 family, iPad, iPad Air and iPad Pro (M4 and M5). The frames here are 390 × 844 and 1180 × 820. They are drawing sizes, not a device promise: the app supports the iPhone and iPad you own, at the iOS they run ("Your own devices only", MP40-Q12a), and you give their models.</p>`);
  inv.onclick = e => { const b = e.target.closest('[data-go]'); if (!b) return; const [jj, oo, k] = b.dataset.go.split('|'); J.go(jj, oo, sum.at.s, k); scrollTo({ top: 0 }); };
  try { history.replaceState(null, '', '#inventory'); } catch (e) { /* the view still shows */ }
}
