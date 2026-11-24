// What the owner's MP-191 decision rules hold on the rendered Home and Forecast screens.
//   MP191-own32  "Conflict at every long horizon" (OWN-32): Reliance's rules and model point different ways at 3, 6 and 12 months, so each is conflicted and none is ranked.
//   MP191-own17  "Both parts go" (OWN-17): a missing or split long horizon takes growth and protection both, so the name is not ranked.
//   MP191-own20  "No score, no action" (OWN-20): a name not ranked carries no action at any horizon, and says why.
//   MP191-own09  "Evidence first" (OWN-09): at launch no action label shows, and the lists keep their scores.
// Every check reads rows off rendered frames, presses each horizon switch a frame has, and counts what it walked against the matrix it
// expects, so a frame or row that goes missing fails rather than passes by walking nothing (lessons 2, 8, 11, 30, 32).
// FACTS_COVERAGE=1 prints what each check walked.
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const ALL = ['iphone', 'ipad', 'web', 'pwa'], WIDE = ['ipad', 'web'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const OUTS = ['disagreement', 'abstention'];
const HN = ['3 months', '6 months', '12 months'], MO = [3, 6, 12];
const HELD = ['AAPL', 'NVDA', 'SPY', 'AZN', 'HSBA', 'RELIANCE', 'NIFTYBEES'];
const NAME = { AAPL: 'Apple', AZN: 'AstraZeneca', RELIANCE: 'Reliance' };
/* the owner's picks, as the states draw them: who is out at which horizon (0 is 3 months, 1 is 6, 2 is 12). Anyone out anywhere is not ranked. */
const OUT = { abstention: { AZN: [1], AAPL: [2] }, disagreement: { RELIANCE: [0, 1, 2], AAPL: [0] } };
const outAt = (st, t, hz) => ((OUT[st] || {})[t] || []).includes(hz);
const unranked = (st) => Object.keys(OUT[st] || {});
/* an action label in every form it takes: a badge class, in any order or case, and the word itself */
const BADGE = /class="[^"]*\bb-(?:add|hold|trim|pause|rebalance)\b/i;
const ACTWORD = /\b(?:Add|Hold|Trim|Pause|Rebalance)\b/;

const must = (c, m) => { if (!c) throw new Error(m); };
const words = (html) => html.replace(/<svg[\s\S]*?<\/svg>/g, (m) => (m.match(/aria-label="([^"]*)"/) || [, ' '])[1] + ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const show = (html, n = 140) => words(html).slice(0, n);
const coverage = (id, parts) => { if (process.env.FACTS_COVERAGE) console.log(`  ${id}: ${Object.entries(parts).map(([k, v]) => `${v} ${k}`).join(', ')}`); };

/* What a press draws. The facts api cannot pass a frame's hz or name, so this runs the page's own script the way the harness does and calls
   render() with them, as strings, the way .scr's dataset hands them over (as tests/journey_facts/h.mjs does). */
const stub = () => new Proxy(function () {}, { get: (_, k) => (k === Symbol.iterator ? function* () {} : k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === 'matches' ? false : stub()), apply: () => stub(), construct: () => stub(), set: () => true, has: () => true });
const pagePath = () => {
  const i = process.argv.indexOf('--page');
  return i >= 0 ? resolve(process.argv[i + 1]) : join(resolve(dirname(fileURLToPath(import.meta.url)), '../..'), 'docs/design/journeys/index.html');
};
const journeys = () => {
  if (journeys.all) return journeys.all;
  const src = [...readFileSync(pagePath(), 'utf8').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script\s*>/gi)].map((m) => m[1]).filter((t) => t.includes('J.start();'));
  must(src.length === 1, `expected one journeys script on the page, found ${src.length}`);
  const box = { console, setTimeout: () => 0, clearTimeout: () => 0, setInterval: () => 0, requestAnimationFrame: () => 0, cancelAnimationFrame: () => 0 };
  for (const k of ['document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage', 'performance', 'getComputedStyle', 'addEventListener', 'removeEventListener', 'scrollTo', 'CSS', 'PerformanceObserver']) box[k] = stub();
  box.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
  box.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  box.ResizeObserver = box.IntersectionObserver;
  box.window = box;
  box.globalThis = box;
  vm.createContext(box);
  vm.runInContext(src[0].replace('J.start();', 'globalThis.__J = J;'), box, { timeout: 20000 });
  journeys.all = box.__J.all();
  return journeys.all;
};
const screenOf = (j, o, s) => {
  const x = (((journeys().find((y) => y.id === j) || { options: [] }).options.find((y) => y.id === o) || { screens: [] }).screens).find((y) => y.id === s);
  must(x, `no screen ${j}.${o}.${s}`);
  return x;
};
const screenIds = (j, o) => journeys().find((y) => y.id === j).options.find((y) => y.id === o).screens.map((y) => y.id);
const drawable = (j, o, s, state) => !(screenOf(j, o, s).na || {})[state];
/* a frame in a state; a state the frame does not draw is a failure here, never a quiet swap to the ready view */
const draw = (j, o, s, surface, state, extra = {}) => {
  if (!drawable(j, o, s, state)) throw new Error(`${s} does not draw ${state}: ${screenOf(j, o, s).na[state]}`);
  const html = screenOf(j, o, s).render({ kind: surface, state, scheme: 'light', journey: j, option: o, screen: s, ...extra });
  return { html, text: words(html) };
};
const switchAt = (html) => [...html.matchAll(/aria-label="Forecast horizon" style="--n:3;--i:(\d)"/g)].map((m) => +m[1]);
/* A frame as it opens, then pressed to each horizon its switch offers. Each view carries the horizon the switch shows, so a press the frame
   ignores is caught. want says whether the frame must have a switch; a frame with none shows the horizon given as fixed. */
const viewsOf = (j, o, s, surface, state, { extra = {}, want, fixed } = {}) => {
  const where = `${s} ${surface} ${state}${extra.t ? ` on ${extra.t}` : ''}`, first = draw(j, o, s, surface, state, extra), sw = switchAt(first.html);
  if (want !== undefined) must(!!sw.length === want, `${where}: ${sw.length ? 'a horizon switch this check does not expect' : 'no horizon switch'}`);
  if (!sw.length) { must(fixed !== undefined, `${where}: no switch and no horizon given`); return [{ ...first, hz: fixed, where: `${where} at ${HN[fixed]}` }]; }
  must(new Set(sw).size === 1, `${where}: two switches on different horizons`);
  const out = [{ ...first, hz: sw[0], where: `${where} as opened at ${HN[sw[0]]}` }];
  for (const hz of [0, 1, 2]) {
    const v = draw(j, o, s, surface, state, { ...extra, hz: String(hz) }), at = switchAt(v.html);
    must(at.length && at.every((x) => x === hz), `${where}: a press on ${HN[hz]} drew the switch at ${at.map((x) => HN[x]).join(', ') || 'nothing'}`);
    out.push({ ...v, hz, where: `${where} pressed to ${HN[hz]}` });
  }
  return out;
};

/* blocks of markup, read whole: a div from its opening tag to its own close */
const blockAt = (html, i) => {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = i;
  let d = 0, m;
  while ((m = re.exec(html))) { d += m[0] === '</div>' ? -1 : 1; if (!d) return html.slice(i, m.index + 6); }
  throw new Error(`an unclosed block: ${show(html.slice(i))}`);
};
const blocks = (html, open) => { const out = []; let i = -1; while ((i = html.indexOf(open, i + 1)) >= 0) out.push(blockAt(html, i)); return out; };

/* ---------- holdings: every row, on the four forms a holding row takes ---------- */
const nameIn = (r, names) => names.filter((t) => new RegExp(`(^|[\\s>])${t}(?=[\\s<·]|$)`).test(words(r)));
/* a phone row (div.hrow), or a table row whose name is the control. Narrowed in MP-186: the owner picked "Pill on every Home" (OWN-06),
   so no running-cost row closes the holdings any more; the board's heading does. */
const holdingRows = (html) => {
  const end = html.indexOf('>Top 5 by segment<'), part = end >= 0 ? html.slice(0, end) : html;
  return part.split(/(?=<div class="hrow|<tr[ >])/)
    .filter((r) => (r.startsWith('<div class="hrow') && r.includes('home-tk')) || (r.startsWith('<tr') && r.includes('home-rowbtn')))
    .map((r) => (r.startsWith('<tr') ? r.slice(0, r.indexOf('</tr>') + 5) : blockAt(r, 0)));
};
const cells = (r) => r.split(/(?=<td\b)/).filter((c) => c.startsWith('<td')).map(words);
/* which form a row takes: the phone list, the one-horizon table (5 columns), the phone table (4) or the three-horizon ledger (8) */
const formOf = (r) => (r.startsWith('<div') ? 'phone' : ({ 5: 'desk', 4: 'pwa', 8: 'ledger' })[cells(r).length] || `a ${cells(r).length}-column row`);
/* the seven holdings of a frame, by ticker. A frame that draws fewer, or a row that reads as two names, fails. */
const rowsByName = (v) => {
  const rows = holdingRows(v.html), by = {};
  must(rows.length === HELD.length, `${v.where}: ${rows.length} holding rows of ${HELD.length}`);
  for (const r of rows) {
    const found = nameIn(r, HELD);
    must(found.length === 1, `${v.where}: a row reads as ${found.join(', ') || 'no name'}: ${show(r)}`);
    must(!by[found[0]], `${v.where}: ${found[0]} has two rows`);
    by[found[0]] = r;
  }
  return by;
};
/* the Home frames with holding rows: which have a horizon switch on which device, and the horizon a frame without one shows */
const HOME_ROWS = [['a', 'a-portfolio'], ['a', 'a-12m'], ['a', 'a-launch'], ['a', 'a-action'], ['b', 'b-ledger'], ['b', 'b-12m'], ['b', 'b-launch'], ['b', 'b-open']];
const SWITCHED = (s, surface) => ['a-portfolio', 'a-12m', 'a-launch'].includes(s) || (['b-ledger', 'b-12m', 'b-launch'].includes(s) && !WIDE.includes(surface));
const FIXED = { 'a-action': 1, 'b-open': 1, 'b-ledger': 1, 'b-12m': 2, 'b-launch': 1 };
const homeViews = (o, s, surface, state) => viewsOf('home', o, s, surface, state, { want: SWITCHED(s, surface), fixed: FIXED[s] });

/* ---------- the lists: every US tech list a Home frame draws, as a tile or a list ---------- */
const techLists = (html) => [
  ...blocks(html, '<div class="segtile home-tile').filter((b) => b.includes('<div class="tn">US tech</div>')).map((b) => ({ kind: 'tile', b })),
  ...blocks(html, '<div class="card top5"').filter((b) => /<div class="tt">MSFT<|<b>MSFT<\/b>/.test(b)).map((b) => ({ kind: 'list', b })),
];
/* the rows of a list: rank, ticker and score, wherever the list draws them (a tile's li, a phone row, a table row) */
const listRows = (b) => b.split(/(?=<li[ >]|<div class="t5r|<tr[ >])/).filter((r) => /^<(?:li[ >]|div class="t5r|tr[ >])/.test(r) && !r.includes('<th')).map((r) => {
  const row = r.startsWith('<tr') ? r.slice(0, r.indexOf('</tr>') + 5) : r.startsWith('<li') ? r.slice(0, r.indexOf('</li>') + 5) : blockAt(r, 0);
  const rank = (row.match(/<span class="rk">([^<]*)<\/span>/) || row.match(/^<tr[^>]*><td class="r">([^<]*)<\/td>/) || [])[1];
  const t = (row.match(/<span class="tk">([A-Z][A-Z0-9.]*)/) || row.match(/<div class="tt">([A-Z][A-Z0-9.]*)/) || row.match(/<span class="home-nm"><b>([A-Z][A-Z0-9.]*)<\/b>/) || [])[1];
  const score = (row.match(/<div class="score"[^>]*>\s*<b>(\d+)<\/b>/) || (row.startsWith('<li') ? row.match(/<b>(\d+)<\/b><\/li>$/) : null) || [])[1];
  return { row, rank, t, score, gap: row.startsWith('<li class="wh"') };
});
const rankedOf = (rows) => rows.filter((r) => /^\d+$/.test(r.rank || '') && r.t && r.score).map((r) => `${r.rank} ${r.t} ${r.score}`);
/* every scored row on every list and tile a frame draws, so two frames can be compared */
const allScores = (html) => [...blocks(html, '<div class="segtile home-tile'), ...blocks(html, '<div class="card top5"')].flatMap((b) => rankedOf(listRows(b)));
/* the frames that must draw a US tech list in every state these checks read */
const TECH_FRAMES = { a: ['a-portfolio', 'a-12m', 'a-launch', 'a-board', 'a-segment'], b: ['b-top5', 'b-ledger', 'b-12m', 'b-launch', 'b-explore'] };
const TECH_RANKED = { default: ['1 MSFT 74', '2 NVDA 71', '3 AAPL 68', '4 AMZN 66'], out: ['1 MSFT 74', '2 NVDA 71', '3 AMZN 66'] };
/* walk every Home frame on every device in a state, and hand each US tech list to fn */
const eachTechList = (state, fn) => {
  let lists = 0;
  for (const o of ['a', 'b']) for (const s of screenIds('home', o)) {
    if (!drawable('home', o, s, state)) continue;
    for (const surface of ALL) {
      const v = draw('home', o, s, surface, state), found = techLists(v.html);
      if (TECH_FRAMES[o].includes(s)) must(found.length >= 1, `${s} ${surface} ${state}: no US tech list`);
      for (const l of found) { lists++; fn(l, { ...v, where: `${s} ${surface} ${state} (${l.kind})` }); }
    }
  }
  return lists;
};

/* ---------- Forecast: one name at one horizon ---------- */
const head = (html) => (html.match(/<div class="fc-inst"[\s\S]*?<div class="nm">([^<]+)<\/div>/) || [])[1];
const actionCards = (html) => blocks(html, '<div class="card fc-card"').filter((b) => b.includes('<h4>Ranked action</h4>'));
/* the one-horizon pages, opened on a name: the horizon pages are pressed through their switch; the dossier opens at a horizon from a ladder row */
const ONE_HZ = [['a', 'a-instrument'], ['a', 'a-3m'], ['a', 'a-12m'], ['a', 'a-technical'], ['b', 'b-forecast']];
const nameViews = (o, s, surface, state, t) => {
  const views = s === 'b-forecast'
    ? [0, 1, 2].map((hz) => ({ ...draw('forecast', o, s, surface, state, { t, hz: String(hz) }), hz, where: `${s} ${surface} ${state} on ${t}, opened at ${HN[hz]}` }))
    : viewsOf('forecast', o, s, surface, state, { extra: { t }, want: true });
  for (const v of views) must(head(v.html) === NAME[t], `${v.where}: the frame draws ${head(v.html) || 'no name'}, not ${NAME[t]}`);
  return views;
};
const cardOf = (v) => { const c = actionCards(v.html); must(c.length === 1, `${v.where}: ${c.length} ranked-action cards`); return c[0]; };
/* one step of an evidence chain, read whole: its name, what it records and the line under it */
const chainStep = (v, name) => {
  const s = v.html.split('<details').slice(1).map((d) => `<details${d.slice(0, d.indexOf('</details>'))}`).filter((d) => d.includes(`<b>${name}</b>`));
  must(s.length === 1, `${v.where}: ${s.length} ${name} steps in the chain`);
  return words(s[0]);
};
const flipsOf = (html) => [...html.matchAll(/data-flip="([^"]+)"/g)].map((m) => m[1]);
/* the fan of a ladder: the long-term card's picture, and the words it gives a screen reader */
const ladderFanOf = (v) => {
  const card = blocks(v.html, '<div class="card fcard"').filter((b) => b.includes('Long term · 3, 6 and 12 months'));
  must(card.length === 1, `${v.where}: ${card.length} long-term fans`);
  const svg = (card[0].match(/<svg class="cx"[\s\S]*?<\/svg>/) || [])[0];
  must(svg, `${v.where}: no fan in the long-term card`);
  return { svg, label: (svg.match(/aria-label="([^"]*)"/) || [, ''])[1] };
};

/* ---------- the sentences of a frame, for phrasings no list of forms foresaw (lesson 49) ---------- */
const sentences = (html) => [...html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').matchAll(/<(p|li)\b[^>]*>([^]*?)<\/\1>|class="(?:jbanner[^"]*|home-sub|fc-sub|t5foot[^"]*)"[^>]*>([^]*?)<\/(?:div|span)>/g)]
  .flatMap((m) => words(m[2] || m[3] || '').split(/(?<=[.!?])\s+/));
/* the long horizons a sentence names: "6 months", "12-month", and lists such as "3, 6 and 12 months" */
const horizonsIn = (s) => new Set([...s.matchAll(/((?:\b(?:3|6|12)\b(?:,\s*|\s+and\s+|\s+or\s+|\s*to\s*))*\b(?:3|6|12))(?:-month|\s+months?\b)/g)].flatMap((m) => m[1].match(/\d+/g).map(Number)));
/* a sentence that puts Reliance's conflict at some long horizons names all three, or only the horizon of the one-horizon page it is on */
const relianceEverywhere = (v, oneHz) => {
  for (const s of sentences(v.html)) {
    if (!/Reliance/.test(s) || !/disagree|split|conflict/i.test(s)) continue;
    const hs = horizonsIn(s);
    if (!hs.size) continue;
    const all = [3, 6, 12].every((x) => hs.has(x)), own = oneHz !== undefined && hs.size === 1 && hs.has(MO[oneHz]);
    must(all || own, `${v.where}: Reliance's conflict is put at ${[...hs].join(', ')} months only: "${s}"`);
  }
};

export default {
  /* OWN-32: Reliance's rules and model disagree at 3, 6 and 12 months, so every one of those horizons is conflicted and no action is ranked there */
  'MP191-own32': () => {
    const n = { views: 0, relianceRows: 0, rootRows: 0, tableCells: 0, horizonPages: 0, ladderRows: 0, fans: 0, briefRows: 0, sheets: 0, searches: 0, frames: 0, sentencesSwept: 0 };
    const sweep = (v, oneHz) => { n.sentencesSwept += sentences(v.html).length; relianceEverywhere(v, oneHz); };
    const st = 'disagreement';
    // Home: Reliance's holding row, at every horizon a frame shows, on every form a row takes
    for (const [o, s] of HOME_ROWS) for (const surface of ALL) for (const v of homeViews(o, s, surface, st)) {
      n.views++;
      sweep(v);
      const r = rowsByName(v).RELIANCE, f = formOf(r), at = `${v.where}: Reliance's ${f} row`;
      must(!BADGE.test(r) && !ACTWORD.test(words(r)), `${at} carries an action: ${show(r)}`);
      if (f === 'phone') { must(/Rules and models disagree · no action/.test(words(r)), `${at} is not flagged as conflicted: ${show(r, 200)}`); must(/split, no median stands/.test(words(r)), `${at} draws a median`); }
      else if (f === 'desk') must(/^Disagree · no action\b/.test(cells(r)[2]), `${at} is not flagged as conflicted: ${cells(r)[2]}`);
      else if (f === 'pwa') must(/^Split\b/.test(cells(r)[2]), `${at} is not flagged as conflicted: ${cells(r)[2]}`);
      else if (f === 'ledger') [3, 4, 5].forEach((i, hz) => { n.tableCells++; must(/^Disagree\b/.test(cells(r)[i]) && !/^[+−-]?\d/.test(cells(r)[i]), `${at}, ${HN[hz]}: ${cells(r)[i]}`); });
      else must(false, `${at} takes ${f}`);
      must(/^None\b/.test(f === 'phone' ? (words(r).match(/None|No label/) || [''])[0] : cells(r)[f === 'ledger' ? 6 : 3]), `${at}: its action does not read None`);
      n.relianceRows++;
      if (!/launch|action|open/.test(s)) must(/The rules and the model disagree on Reliance at 3, 6 and 12 months\./.test(v.text), `${v.where}: the holdings banner does not put the conflict at 3, 6 and 12 months`);
    }
    // Home: the brief and the rail list Reliance with no action, and its sheet says so at every horizon
    for (const surface of ALL) {
      for (const [o, s] of [['a', 'a-brief'], ['b', 'b-brief'], ...(WIDE.includes(surface) ? [['a', 'a-portfolio'], ['a', 'a-12m']] : [])]) {
        const v = { ...draw('home', o, s, surface, st), where: `${s} ${surface} ${st}` }, rows = blocks(v.html, '<div class="home-act"').filter((b) => /\bReliance\b/.test(words(b)));
        sweep(v);
        must(rows.length === 1, `${v.where}: ${rows.length} action rows for Reliance`);
        must(!BADGE.test(rows[0]) && /^Split Reliance\b/.test(words(rows[0])) && /Rules and models disagree at 3, 6 and 12 months, so no action is ranked\./.test(words(rows[0])), `${v.where}: Reliance's action row: ${show(rows[0], 200)}`);
        if (/brief/.test(s)) must(/Rules and models disagree on Reliance at 3, 6 and 12 months/.test(v.text), `${v.where}: the brief's banner`);
        n.briefRows++;
      }
      for (const [o, s] of [['a', 'a-action'], ['b', 'b-open']]) {
        const v = draw('home', o, s, surface, st), sh = blockAt(v.html, v.html.lastIndexOf('<div', v.html.indexOf('aria-label="Suggested action"')));
        must(!BADGE.test(sh) && /^Conflicted Reliance\b/.test(words(sh)) && /Rules and models disagree at 3, 6 and 12 months, so no action is ranked at any of them\./.test(words(sh)), `${s} ${surface}: Reliance's sheet: ${show(sh, 240)}`);
        n.sheets++;
      }
    }
    // Forecast: the root list and table flag Reliance at every horizon, with no median
    for (const surface of ALL) {
      for (const v of viewsOf('forecast', 'a', 'a-forecasts', surface, st, { want: true })) {
        sweep(v);
        const rows = v.html.split(/(?=<div class="hrow fc-rootrow)/).slice(1).map((r) => blockAt(r, 0)).filter((r) => /<div class="tk">RELIANCE ·/.test(r));
        must(rows.length === 1, `${v.where}: ${rows.length} Reliance rows`);
        must(/Rules and models disagree/.test(words(rows[0])) && !rows[0].includes('class="val"'), `${v.where}: Reliance's row is not conflicted: ${show(rows[0], 200)}`);
        must(/Rules and models disagree on Reliance at 3, 6 and 12 months/.test(v.text), `${v.where}: the banner`);
        n.rootRows++;
      }
      const t = { ...draw('forecast', 'b', 'b-forecasts', surface, st), where: `b-forecasts ${surface} ${st}` };
      sweep(t);
      const rows = t.html.split(/(?=<tr[ >])/).filter((r) => /<span class="fc-nm"><b>RELIANCE<\/b>/.test(r)).map((r) => r.slice(0, r.indexOf('</tr>') + 5));
      must(rows.length === 1, `${t.where}: ${rows.length} Reliance rows`);
      const cs = rows[0].split(/(?=<td\b)/).filter((c) => c.startsWith('<td')).slice(1);
      must(cs.length === 3, `${t.where}: Reliance has ${cs.length} horizon cells`);
      cs.forEach((c, hz) => { n.tableCells++; must(/Rules and models disagree/.test(words(c)) && !c.includes('font-weight:600'), `${t.where}: Reliance at ${HN[hz]}: ${show(c)}`); });
    }
    // Forecast: Reliance's own pages, at each horizon: both sides drawn, the action conflicted, never "no conflict"
    for (const [o, s] of ONE_HZ) for (const surface of ALL) for (const v of nameViews(o, s, surface, st, 'RELIANCE')) {
      sweep(v, v.hz);
      must(new RegExp(`${MO[v.hz]}-month forecast · RELIANCE</div>[^]{0,400}?Rules and models disagree`).test(v.html), `${v.where}: no rules-and-models card at ${HN[v.hz]}`);
      must(!/No conflict at/.test(v.text), `${v.where}: says there is no conflict`);
      const c = cardOf(v);
      must(!BADGE.test(c) && /^Conflicted Ranked action\b/.test(words(c)) && new RegExp(`No action is ranked on Reliance at ${HN[v.hz]} while the two disagree\\.`).test(words(c)), `${v.where}: the action card: ${show(c, 200)}`);
      n.horizonPages++;
    }
    // Forecast: views and evidence on Reliance read the conflict at every horizon; the ladder's rows split at all three
    for (const surface of ALL) for (const hz of [0, 1, 2]) {
      for (const [o, s] of [['a', 'a-views'], ['b', 'b-views'], ['a', 'a-evidence'], ['b', 'b-evidence']]) {
        const v = { ...draw('forecast', o, s, surface, st, { t: 'RELIANCE', hz: String(hz) }), where: `${s} ${surface} ${st} on Reliance at ${HN[hz]}` };
        sweep(v, hz);
        if (/views/.test(s)) must(/Rules and models disagree\. Each side keeps its own evidence, and no action is ranked\./.test(v.text), `${v.where}: the views do not show the conflict`);
        else must(/Forecast Two sides: rules Pause/.test(v.text) && /Action None: conflicted, not ranked/.test(v.text), `${v.where}: the chain does not record the conflict`);
        n.horizonPages++;
      }
    }
    for (const [o, s] of [['b', 'b-ladder'], ['b', 'b-technical']]) for (const surface of ALL) {
      const v = { ...draw('forecast', o, s, surface, st, { t: 'RELIANCE' }), where: `${s} ${surface} ${st} on Reliance` };
      must(head(v.html) === 'Reliance', `${v.where}: draws ${head(v.html)}`);
      const rows = v.html.split(/(?=<div class="fc-lad)/).filter((r) => r.includes('data-dossier=')).map((r) => blockAt(r, 0));
      must(rows.length === 3, `${v.where}: ${rows.length} long-horizon rows`);
      rows.forEach((r, hz) => { n.ladderRows++; must(new RegExp(`${HN[hz]}: split, no median stands`).test(words(r)) && !/<div class="med">[^<]*\d/.test(r), `${v.where}: ${HN[hz]} is not conflicted: ${show(r)}`); });
      // the ladder on Reliance: its banner names the rules-and-models conflict at all three, and its fan marks each horizon split, with no median
      // line, dot or end figure. No press in the page draws it today (a ladder opens on Apple), so the render is called on Reliance's name.
      must(/Rules and models disagree at 3, 6 and 12 months\./.test(v.text) && !/Models disagree at 3 months/.test(v.text), `${v.where}: the banner: ${(v.text.match(/[^.]*disagree[^.]*\./) || ['none'])[0]}`);
      const fan = ladderFanOf(v);
      HN.forEach((h) => must(new RegExp(`${h}: split, no median stands`).test(fan.label), `${v.where}: the fan's words put a median at ${h}: ${fan.label}`));
      must(!/median [+−-]?\d/.test(fan.label), `${v.where}: the fan's words give a median: ${fan.label}`);
      must((fan.svg.match(/>Split<\/text>/g) || []).length === 3, `${v.where}: the fan marks ${(fan.svg.match(/>Split<\/text>/g) || []).length} horizons split, not 3`);
      must(!/<path class="med"/.test(fan.svg) && !/<text class="fcl"/.test(fan.svg) && !/r="4" class="nowdot"/.test(fan.svg), `${v.where}: the fan draws a median line, end figure or dot`);
      n.fans++;
      // and the same ladder on Apple, split at 3 months only, keeps its medians at 6 and 12: the reader sees a median where one is drawn
      const a = { ...draw('forecast', o, s, surface, st), where: `${s} ${surface} ${st} on Apple` }, af = ladderFanOf(a);
      must(head(a.html) === 'Apple' && /Models disagree at 3 months\./.test(a.text) && /3 months: split, no median stands/.test(af.label) && /6 months: median \+/.test(af.label) && /<path class="med"/.test(af.svg) && (af.svg.match(/>Split<\/text>/g) || []).length === 1, `${a.where}: Apple's ladder does not read as split at 3 months only: ${af.label}`);
    }
    // every Home frame, search included, and every Forecast frame as it opens: a sentence on Reliance's conflict names all three horizons
    for (const [j, opts] of [['home', ['a', 'b']], ['forecast', ['a', 'b']]]) for (const o of opts) for (const s of screenIds(j, o)) {
      if (!drawable(j, o, s, st)) continue;
      for (const surface of ALL) {
        const v = { ...draw(j, o, s, surface, st), where: `${s} ${surface} ${st}` };
        sweep(v, j === 'forecast' ? (switchAt(v.html)[0] ?? 1) : undefined);
        if (/search$/.test(s)) { must(/Rules and models disagree on Reliance at 3, 6 and 12 months, and the models split on Apple at 3 months\./.test(v.text), `${v.where}: the search banner`); n.searches++; }
        n.frames++;
      }
    }
    // the matrix: 3 switched Home frames x 4 devices x 4 views, 3 ledgers x (2 phones x 4 + 2 wide x 1), 2 sheet frames x 4; brief rows on
    // 2 briefs x 4 devices and 2 rails x 2 wide; 4 switched horizon pages x 4 devices x 4 views, the dossier x 4 x 3, views and evidence 4 x 4 x 3
    // and the sweep: 28 Home and 16 Forecast frames draw Disagreement (the gold lists, scenarios and horizon states do not), on 4 devices
    const want = { views: 86, relianceRows: 86, rootRows: 16, tableCells: 6 * 3 + 4 * 3, horizonPages: 64 + 12 + 48, ladderRows: 24, fans: 8, briefRows: 12, sheets: 8, searches: 8, frames: 44 * 4 };
    for (const [k, x] of Object.entries(want)) must(n[k] === x, `walked ${n[k]} ${k}, not ${x}: ${JSON.stringify(n)}`);
    coverage('MP191-own32', n);
  },

  /* OWN-17: a missing or split long horizon takes growth and protection both, so Apple leaves US tech in both states and AstraZeneca's score is withheld */
  'MP191-own17': () => {
    const n = { techLists: 0, defaultLists: 0, appleRows: 0, sheets: 0, horizonPages: 0 };
    // the reader proves it reads Apple's rank where Apple is ranked (lesson 30)
    n.defaultLists = eachTechList('default', (l, v) => {
      const rows = listRows(l.b);
      must(JSON.stringify(rankedOf(rows)) === JSON.stringify(TECH_RANKED.default), `${v.where}: reads ${rankedOf(rows).join(', ') || 'no ranked row'}`);
    });
    for (const st of OUTS) n.techLists += eachTechList(st, (l, v) => {
      const rows = listRows(l.b), ranked = rankedOf(rows), apple = rows.filter((r) => r.t === 'AAPL');
      must(JSON.stringify(ranked) === JSON.stringify(TECH_RANKED.out), `${v.where}: ranked ${ranked.join(', ')}`);
      must(apple.length === 1, `${v.where}: ${apple.length} Apple rows`);
      const a = apple[0], w = words(a.row);
      if (l.kind === 'tile') must(a.gap && w === `${a.rank} AAPL ${st === 'abstention' ? 'abstained' : 'split'} –`, `${v.where}: Apple's tile line: ${w}`);
      else if (a.row.startsWith('<tr')) { const c = cells(a.row); must(a.rank === '–' && c[2] === 'Not ranked' && c[3] === '–' && c[4] === '–' && c[5] === '65', `${v.where}: Apple's table row: ${c.join(' | ')}`); }
      else must(a.rank === '–' && /Not ranked Growth – · Protection – · Opportunity 65$/.test(w), `${v.where}: Apple's row: ${w}`);
      // the place Apple left stays empty and says whose it was; that both parts went is read off Apple's row above and the frame's words below
      if (l.kind === 'list') must(/Withheld: AAPL (?:is not ranked|lost its growth and protection parts), and nothing fills the gap/.test(words(l.b)), `${v.where}: the withheld place does not say Apple left it: ${(words(l.b).match(/Withheld[^.]*/) || ['no withheld place'])[0]}`);
      must(/lost its growth and protection parts/.test(v.text), `${v.where}: the frame does not say Apple lost both parts`);
      n.appleRows++;
    });
    // AstraZeneca's sheet withholds its score with both parts missing
    for (const surface of ALL) for (const [o, s] of [['a', 'a-action'], ['b', 'b-open']]) {
      const v = draw('home', o, s, surface, 'abstention'), sh = blockAt(v.html, v.html.lastIndexOf('<div', v.html.indexOf('aria-label="Suggested action"')));
      must(/^Ineligible AstraZeneca\b/.test(words(sh)), `${s} ${surface}: the sheet is not AstraZeneca's: ${show(sh)}`);
      must(/Component evidence Growth Missing Protection Missing Opportunity 58 Combined score Withheld/.test(words(sh)), `${s} ${surface}: AstraZeneca's evidence: ${show(sh, 400)}`);
      n.sheets++;
    }
    // Forecast: at a horizon that stands, a name out elsewhere still says both parts are missing
    for (const st of OUTS) for (const t of unranked(st)) for (const [o, s] of ONE_HZ) for (const surface of ALL) for (const v of nameViews(o, s, surface, st, t)) {
      if (outAt(st, t, v.hz)) continue;
      must(/growth and protection are both missing/.test(words(cardOf(v))), `${v.where}: the action card does not say both parts are missing: ${show(cardOf(v), 220)}`);
      n.horizonPages++;
    }
    // the matrix: 10 Home frames draw US tech on each of 4 devices, and the US large caps picker draws it beside its own on 2 wide ones; the
    // horizons that stand: per device, AstraZeneca 12 and Apple 13 views in Abstaining, Apple 13 in Disagreement, Reliance none
    const want = { defaultLists: 42, techLists: 84, appleRows: 84, sheets: 8, horizonPages: 4 * (12 + 13 + 13) };
    for (const [k, x] of Object.entries(want)) must(n[k] === x, `walked ${n[k]} ${k}, not ${x}: ${JSON.stringify(n)}`);
    coverage('MP191-own17', n);
  },

  /* OWN-20: a name not ranked carries no action at any horizon, on every row, list, brief, sheet and page, and says why */
  'MP191-own20': () => {
    const n = { views: 0, rows: 0, briefRows: 0, sheets: 0, listRows: 0, horizonPages: 0, trails: 0, routes: 0, calibrations: 0 };
    const SAYS_OUT = { abstention: /Abstained/, disagreement: /disagree|split/i };
    /* the reason names the horizon the name lost, in a chip or in a line under it: "Not ranked: no range at 12 months · no action", or
       "Not ranked · no action" over "No range at 12 months." */
    const lost = (st, t) => new RegExp(`\\bno (?:range|median) at ${HN[OUT[st][t][0]]}\\b`, 'i');
    // Home: every holding row of a name not ranked, at every horizon and on every form
    for (const st of OUTS) for (const [o, s] of HOME_ROWS) for (const surface of ALL) for (const v of homeViews(o, s, surface, st)) {
      n.views++;
      const by = rowsByName(v);
      if (!/launch/.test(s)) { must(BADGE.test(by.NVDA), `${v.where}: NVIDIA's row shows no badge, so this reader cannot see one`); n.calibrations++; }
      for (const t of unranked(st)) {
        const r = by[t], at = `${v.where}: ${NAME[t]}'s ${formOf(r)} row`;
        must(!BADGE.test(r), `${at} carries a badge`);
        must(!ACTWORD.test(words(r)), `${at} names an action: ${show(r, 200)}`);
        const out = outAt(st, t, v.hz);
        must((out ? SAYS_OUT[st] : /Not ranked/).test(words(r)), `${at} gives no reason (${out ? 'out here' : 'not ranked'}): ${show(r, 200)}`);
        if (!out && formOf(r) === 'phone') must(/\bNot ranked\b/.test(words(r)) && /\bno action\b/.test(words(r)) && lost(st, t).test(words(r)), `${at} does not say it is not ranked, with no action, for the horizon it lost: ${show(r, 220)}`);
        if (!out && formOf(r) !== 'phone') must(/\bNone Not ranked\b/.test(words(r)), `${at}: its action cell does not read None, not ranked`);
        n.rows++;
      }
    }
    // Home: the brief and the rail list each name not ranked, with no action and the reason; the sheet shows none
    for (const st of OUTS) for (const surface of ALL) {
      for (const [o, s] of [['a', 'a-brief'], ['b', 'b-brief'], ...(WIDE.includes(surface) ? [['a', 'a-portfolio'], ['a', 'a-12m']] : [])]) {
        const v = draw('home', o, s, surface, st), acts = blocks(v.html, '<div class="home-act"');
        must(acts.some((b) => /\bNVIDIA\b/.test(words(b)) && BADGE.test(b)), `${s} ${surface} ${st}: no badge on NVIDIA's action row, so this reader cannot see one`);
        for (const t of unranked(st)) {
          const rows = acts.filter((b) => new RegExp(`\\b${NAME[t]}\\b`).test(words(b)));
          must(rows.length === 1, `${s} ${surface} ${st}: ${rows.length} action rows for ${NAME[t]}`);
          must(!BADGE.test(rows[0]) && !ACTWORD.test(words(rows[0])), `${s} ${surface} ${st}: ${NAME[t]} carries an action: ${show(rows[0])}`);
          must(/not ranked and carries no action|no action is ranked/.test(words(rows[0])), `${s} ${surface} ${st}: ${NAME[t]}'s row gives no reason: ${show(rows[0], 200)}`);
          n.briefRows++;
        }
      }
      for (const [o, s] of [['a', 'a-action'], ['b', 'b-open']]) {
        const v = draw('home', o, s, surface, st), sh = blockAt(v.html, v.html.lastIndexOf('<div', v.html.indexOf('aria-label="Suggested action"')));
        must(!BADGE.test(sh), `${s} ${surface} ${st}: a badge on the sheet`);
        must(st === 'abstention' ? /^Ineligible AstraZeneca\b[^]*AstraZeneca is not ranked, and carries no action at any horizon/.test(words(sh)) : /^Conflicted Reliance\b[^]*no action is ranked at any of them/.test(words(sh)), `${s} ${surface} ${st}: the sheet: ${show(sh, 260)}`);
        n.sheets++;
      }
    }
    // Home: Apple's not-ranked row on every US tech list carries no action
    for (const st of OUTS) eachTechList(st, (l, v) => {
      const a = listRows(l.b).filter((r) => r.t === 'AAPL');
      must(a.length === 1 && !BADGE.test(a[0].row) && !ACTWORD.test(words(a[0].row)), `${v.where}: Apple's list row: ${a.map((r) => show(r.row)).join(' / ') || 'none'}`);
      n.listRows++;
    });
    // Forecast: each name not ranked, on each one-horizon page, at every horizon, carries no action and says why
    for (const [o, s] of ONE_HZ) for (const surface of ALL) {
      const d = { ...draw('forecast', o, s, surface, 'default', s === 'b-forecast' ? { t: 'AAPL' } : {}), where: `${s} ${surface} default` };
      must(BADGE.test(cardOf(d)), `${d.where}: no badge on the ready action card, so this reader cannot see one`);
      n.calibrations++;
      for (const st of OUTS) for (const t of unranked(st)) for (const v of nameViews(o, s, surface, st, t)) {
        const c = cardOf(v), w = words(c), out = outAt(st, t, v.hz);
        must(!BADGE.test(v.html), `${v.where}: a badge on the page`);
        must(!ACTWORD.test(w), `${v.where}: the action card names an action: ${show(c, 200)}`);
        const why = out && st === 'disagreement' ? new RegExp(`^Conflicted Ranked action[^]*No action is ranked on ${NAME[t]} at ${HN[v.hz]} while the two disagree\\.`)
          : out ? new RegExp(`^No action Ranked action[^]*No range at ${HN[v.hz]}, so no action\\. ${NAME[t]} is not ranked, and carries no action at any horizon`)
            : new RegExp(`^No action Ranked action[^]*(?:${NAME[t]}|It) is not ranked, and carries no action at any horizon`);
        must(why.test(w), `${v.where}: the action card: ${show(c, 240)}`);
        n.horizonPages++;
      }
    }
    // Forecast: the evidence trail of each name not ranked records no action at any horizon, and at a horizon that stands says why. The
    // ready trail on Apple records its Hold, so the reader sees an action where one is published.
    const STANDS = { abstention: (t) => `${HN[OUT.abstention[t][0]].replace(/^./, (c) => c.toUpperCase())} abstained`, disagreement: (t) => `The models split at ${HN[OUT.disagreement[t][0]]}` };
    const trailHolds = (v, st, t, hz) => {
      const a = chainStep(v, 'Action');
      must(/^Action None\b/.test(a) && !ACTWORD.test(a), `${v.where}: the trail records an action: ${a}`);
      if (!outAt(st, t, hz)) must(new RegExp(`^Action None: not ranked ${STANDS[st](t)}, so growth and protection are both missing\\. Nothing was published\\.$`).test(a), `${v.where}: the trail does not say why nothing was published: ${a}`);
      else must(/Nothing was published\.$/.test(a), `${v.where}: the trail: ${a}`);
      n.trails++;
    };
    for (const surface of ALL) for (const [o, s] of [['a', 'a-evidence'], ['b', 'b-evidence']]) {
      const d = { ...draw('forecast', o, s, surface, 'default', { t: 'AAPL', hz: '1' }), where: `${s} ${surface} default on AAPL` };
      must(ACTWORD.test(chainStep(d, 'Action')), `${d.where}: the ready trail records no action, so this reader cannot see one`);
      n.calibrations++;
      for (const st of OUTS) for (const t of unranked(st)) for (const hz of [0, 1, 2]) {
        const v = { ...draw('forecast', o, s, surface, st, { t, hz: String(hz) }), where: `${s} ${surface} ${st} on ${t} at ${HN[hz]}` };
        must(head(v.html) === undefined || head(v.html) === NAME[t], `${v.where}: draws ${head(v.html)}`);
        trailHolds(v, st, t, hz);
      }
    }
    // and along the route a reader takes: a ladder row opens the dossier at its horizon, its Evidence tab keeps the name and horizon, and its
    // flip turns to the other option's trail with both
    for (const st of OUTS) for (const surface of ALL) {
      const lad = draw('forecast', 'b', 'b-ladder', surface, st), rows = [...lad.html.matchAll(/data-dossier="(\d)" data-t="([A-Z.]+)"/g)];
      must(rows.length === 3, `b-ladder ${surface} ${st}: ${rows.length} rows open a dossier`);
      for (const [, i, t] of rows) {
        const ex = { t, hz: i }, at = `the ladder's ${HN[+i]} row on ${t}, ${surface} ${st}`;
        must(head(draw('forecast', 'b', 'b-forecast', surface, st, ex).html) === NAME[t], `${at}: the dossier draws another name`);
        const ev = { ...draw('forecast', 'b', 'b-evidence', surface, st, ex), where: `${at}, Evidence tab` }, f = flipsOf(ev.html);
        must(f.length === 1 && f[0] === 'forecast|a|a-evidence', `${ev.where}: flips to ${f.join(', ') || 'nothing'}`);
        trailHolds(ev, st, t, +i);
        trailHolds({ ...draw('forecast', 'a', 'a-evidence', surface, st, ex), where: `${at}, Evidence tab flipped` }, st, t, +i);
        n.routes++;
      }
    }
    // Forecast: no list or ladder shows an action label in these states
    for (const st of OUTS) for (const surface of ALL) for (const [o, s] of [['a', 'a-forecasts'], ['b', 'b-forecasts'], ['b', 'b-ladder'], ['b', 'b-technical']]) {
      const v = draw('forecast', o, s, surface, st);
      must(!BADGE.test(v.html), `${s} ${surface} ${st}: an action badge`);
    }
    // the matrix: own32's 86 Home views in each of two states, two names each; NVIDIA's badge read on the 60 views a state draws after
    // approval, and on the ready card of 5 pages x 4 devices; 12 action lists x 2 names x 2 states; 19 page views x 4 devices x 2 names x 2 states
    // and the trails: 2 trail frames x 4 devices x 2 names x 3 horizons x 2 states, plus each ladder's 3 rows x 4 devices x 2 states, read on
    // both options; the ready trail read once per frame and device
    const want = { views: 172, rows: 344, calibrations: 2 * 60 + 20 + 8, briefRows: 48, sheets: 16, listRows: 84, horizonPages: 19 * 4 * 2 * 2, trails: 96 + 48, routes: 24 };
    for (const [k, x] of Object.entries(want)) must(n[k] === x, `walked ${n[k]} ${k}, not ${x}: ${JSON.stringify(n)}`);
    coverage('MP191-own20', n);
  },

  /* OWN-09: at launch no action label shows on any holding, the rail and the brief say so, the two launch frames flip to each other, and the lists keep their scores */
  'MP191-own09': () => {
    const n = { views: 0, rows: 0, rails: 0, flips: 0, scoreRows: 0, staleNotes: 0, sweeps: 0 };
    /* the Stale holdings note: at launch HSBC's forecast is held and no action is named; after approval its Pause is held with it */
    const STALE_LAUNCH = /Its forecast stays held until its price returns\./, STALE_AFTER = /Its forecast stays held and its action stays Pause until its price returns\./;
    /* an action named in a launch frame's words, outside the launch banner that explains them: a label, or an action said to stay, read, be held */
    const named = (html) => words(html.replace(blocks(html, '<div class="jbanner').find((b) => b.includes('No action labels yet.')) || '\u0000', ' '))
      .match(/\b(?:Hold|Trim|Pause|Rebalance)\b|\bAdd\b(?! a holding\b| what you hold\b)|\baction (?:stays|reads|is|was|held)\b[^.]*/);
    const PAIR = { 'a-launch': ['a', 'b', 'b-launch', 'a-portfolio'], 'b-launch': ['b', 'a', 'a-launch', 'b-ledger'] };
    // the readers see a label and a count where the frames after approval draw them
    for (const surface of ALL) for (const [o, s] of [['a', 'a-portfolio'], ['b', 'b-ledger']]) {
      const v = draw('home', o, s, surface, 'default');
      must(BADGE.test(v.html) && /\b3 actions\b/.test(v.text), `${s} ${surface}: no badge or no action count, so this reader cannot see them`);
      // and the frames after approval keep HSBC's Pause in Stale, so the launch frames' wording is read against the other side
      for (const w of homeViews(o, s, surface, 'stale')) { must(STALE_AFTER.test(w.text) && !STALE_LAUNCH.test(w.text) && named(w.html), `${w.where}: the Stale note does not keep HSBC's Pause after approval`); n.staleNotes++; }
    }
    for (const [s, [o, oo, to, twin]] of Object.entries(PAIR)) for (const surface of ALL) for (const st of STATES) {
      for (const v of homeViews(o, s, surface, st)) {
        n.views++;
        must(!BADGE.test(v.html), `${v.where}: an action badge at launch`);
        must(!v.html.includes('class="home-act"'), `${v.where}: a ranked-action row at launch`);
        must(!/\b\d+ actions?\b/.test(v.text), `${v.where}: the brief counts actions: ${(v.text.match(/[^.]{0,40}\b\d+ actions?\b[^.]{0,20}/) || [])[0]}`);
        if (['default', 'disagreement', 'abstention'].includes(st)) must(/Evidence only, no labels/.test(v.text), `${v.where}: the brief does not say it carries evidence only`);
        if (st === 'stale') { must(STALE_LAUNCH.test(v.text) && !STALE_AFTER.test(v.text) && !/action stays/i.test(v.text), `${v.where}: the Stale note names an action at launch: ${(v.text.match(/[^.]*stays held[^.]*\./) || ['no stale note'])[0]}`); n.staleNotes++; }
        const said = named(v.html);
        must(!said, `${v.where}: the frame names an action at launch: "${said && said[0]}"`);
        n.sweeps++;
        if (st !== 'empty') {
          must((v.text.match(/No action labels yet\./g) || []).length === 1, `${v.where}: no "No action labels yet." banner`);
          const by = rowsByName(v);
          for (const t of HELD) {
            const r = by[t];
            must(!BADGE.test(r) && !ACTWORD.test(words(r)), `${v.where}: ${t}'s row carries an action: ${show(r, 200)}`);
            // the action slot reads No label or None; a phone row whose horizon abstained gives the slot to that chip, as it does after approval
            must(/No label|None|no action|Abstained · no range shown/.test(words(r)), `${v.where}: ${t}'s row does not say it has no label: ${show(r, 200)}`);
            n.rows++;
          }
        }
        const rail = blocks(v.html, '<div class="card home-card"').filter((b) => b.includes('<h4>Ranked actions</h4>'));
        if (s === 'a-launch' && WIDE.includes(surface)) {
          must(rail.length === 1 && /^Ranked actions None at launch\. Labels wait until evaluation supports the thresholds and you approve a ranking policy\.$/.test(words(rail[0])), `${v.where}: the rail: ${rail.map((b) => show(b)).join(' / ') || 'none'}`);
          n.rails++;
        } else must(!rail.length, `${v.where}: a ranked-actions card`);
        // the lists keep their scores: the same rows, ranks and scores as the frame after approval
        const twinV = draw('home', o, twin, surface, st, v.where.includes('pressed') ? { hz: String(v.hz) } : {}), mine = allScores(v.html);
        must(JSON.stringify(mine) === JSON.stringify(allScores(twinV.html)), `${v.where}: the lists differ from ${twin}'s: ${mine.join(', ')}`);
        const tech = techLists(v.html), wantTech = TECH_RANKED[OUTS.includes(st) ? 'out' : 'default'];
        must(tech.length >= 1 && tech.every((l) => JSON.stringify(rankedOf(listRows(l.b))) === JSON.stringify(wantTech)), `${v.where}: US tech does not keep its scores: ${tech.map((l) => rankedOf(listRows(l.b)).join(', ')).join(' / ') || 'no list'}`);
        n.scoreRows += mine.length;
      }
      // the two launch frames turn to each other, in every state and on every device
      const v = draw('home', o, s, surface, st), f = [...v.html.matchAll(/data-flip="([^"]+)"/g)].map((m) => m[1]);
      must(f.length === 1 && f[0] === `home|${oo}|${to}`, `${s} ${surface} ${st}: flips to ${f.join(', ') || 'nothing'}`);
      const back = draw('home', oo, to, surface, st), fb = [...back.html.matchAll(/data-flip="([^"]+)"/g)].map((m) => m[1]);
      must(fb.length === 1 && fb[0] === `home|${o}|${s}`, `${to} ${surface} ${st}: flips back to ${fb.join(', ') || 'nothing'}`);
      if (st !== 'empty') must(/No action labels yet\./.test(back.text), `${to} ${surface} ${st}: the flip lands on a frame with labels`);
      n.flips++;
    }
    // the matrix: per state, Portfolio at launch on 4 devices x 4 views and Ledger at launch on 2 phones x 4 and 2 wide x 1; seven rows on
    // every view but Empty's; the rail on 2 wide devices x 4 views; one flip each way per frame, device and state
    // and the Stale note: 26 launch views, and 26 views of Portfolio and Ledger after approval
    const want = { views: 26 * 9, rows: 26 * 8 * 7, rails: 2 * 4 * 9, flips: 2 * 4 * 9, staleNotes: 26 + 26, sweeps: 26 * 9 };
    for (const [k, x] of Object.entries(want)) must(n[k] === x, `walked ${n[k]} ${k}, not ${x}: ${JSON.stringify(n)}`);
    coverage('MP191-own09', n);
  },
};
