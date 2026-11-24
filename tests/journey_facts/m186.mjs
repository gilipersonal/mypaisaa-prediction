// MP-186: the owner's two picks on navigation and cost, and the run clock retold per market, proved on the rendered screens.
// OWN-02, "Add them to the sidebar": "The iPad and desktop sidebar gains Research, Approvals and Imports, and the phone keeps its five tabs as drawn."
// OWN-06, "Pill on every Home": "A small pill in the top bar shows the month on Home, whichever way Cost is flipped, and the row goes."
// ADM-10, ADM-11 and ADM-22 (no owner choice): each market runs after its own close, the cutoff freezes at +60 and forecasts issue by +75,
// and a failure comes after the run starts. The admin page is read too, because the wording must agree between owner and admin pages.
import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ADMIN = process.env.MP186_ADMIN_PAGE || join(ROOT, 'docs/design/admin/index.html');
// The harness that runs these checks cannot be imported from them (it imports this file), so the admin page is read here, the same way:
// its own script runs with no browser, and each screen's render(ctx) is called directly.
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
const textOf = (html) => html.replace(/<svg[\s\S]*?<\/svg>/g, (m) => (m.match(/aria-label="([^"]*)"/) || [, ' '])[1] + ' ').replace(/<(style|script)\b[\s\S]*?<\/\1(?:\s[^>]*)?>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, (e) => ENT[e] ?? ' ').replace(/\s+/g, ' ').trim();
const stub = () => new Proxy(function () {}, { get: (_, k) => (k === Symbol.iterator ? function* () {} : k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === 'matches' ? false : stub()), apply: () => stub(), construct: () => stub(), set: () => true, has: () => true });
function adminPage(page) {
  if (!existsSync(page)) throw new Error(`no admin page at ${page}`);
  const scripts = [...readFileSync(page, 'utf8').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script(?:\s[^>]*)?>/gi)].map((m) => m[1]).filter((x) => x.includes('J.start();'));
  if (scripts.length !== 1) throw new Error(`expected one script in ${page}, found ${scripts.length}`);
  const box = { console, setTimeout: () => 0, clearTimeout: () => 0, setInterval: () => 0, requestAnimationFrame: () => 0, cancelAnimationFrame: () => 0 };
  for (const k of ['document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage', 'performance', 'getComputedStyle', 'addEventListener', 'removeEventListener', 'scrollTo', 'CSS', 'PerformanceObserver']) box[k] = stub();
  box.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
  box.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  box.ResizeObserver = box.IntersectionObserver;
  box.window = box; box.globalThis = box;
  vm.createContext(box);
  vm.runInContext(scripts[0].replace('J.start();', 'globalThis.__J = J;'), box, { filename: 'admin-page.js', timeout: 20000 });
  const all = box.__J.all(), J = (id) => all.find((x) => x.id === id), O = (j, o) => J(j).options.find((x) => x.id === o), S = (j, o, s) => O(j, o).screens.find((x) => x.id === s);
  return {
    journeys: () => all.map((x) => x.id), options: (j) => J(j).options.map((x) => x.id), screens: (j, o) => O(j, o).screens.map((x) => x.id),
    view: (j, o, s, surface, state) => { const sc = S(j, o, s); const html = sc.render({ kind: surface, state: (sc.na || {})[state] ? 'default' : state, scheme: 'light', journey: j, option: o, screen: s }); return { html, text: textOf(html) }; }
  };
}
const WIDE = ['ipad', 'web'], PHONES = ['iphone', 'pwa'], ALL = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const ADMIN_STATES = ['default', 'loading', 'empty', 'partial', 'error', 'stale', 'offline', 'conflict', 'expired', 'denied'];

/* ---------- OWN-02: the sidebar and the tab bar, read as drawn ---------- */
const SIDE = ['Portfolio', 'Forecasts', 'Segments', 'Track record', 'Research', 'Approvals', 'Imports', 'Data sources', 'Settings'];
const TABS = ['Portfolio', 'Forecasts', 'Segments', 'Record', 'Settings'];
const sideItems = (html) => [...html.matchAll(/<div class="si( on)?">([\s\S]*?)<\/div>/g)].map((m) => ({ on: !!m[1], name: textOf(m[2]).replace(/\s*\d+$/, '') }));
const tabItems = (html) => [...html.matchAll(/<button class="tb" type="button"( aria-current="page")?>([\s\S]*?)<\/button>/g)].map((m) => ({ on: !!m[1], name: textOf(m[2]) }));
const backOf = (html) => (html.match(/aria-label="Back to ([^"]+)"/) || [])[1] || null;

/* ---------- OWN-06: the pill, as Cost states the month ---------- */
const pillOf = (html) => [...html.matchAll(/<button class="chip glass cost-pill"[\s\S]*?<\/button>/g)].map((m) => m[0]);
const shown = (pill) => pill.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<span class="sr">[^<]*<\/span>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const said = (pill) => textOf(pill);
const amounts = (t) => t.replace(/£([\d,]+) £\1 \.(\d\d)/g, '£$1.$2');   // money() draws the pounds and the pence apart
const esc = (t) => t.replace(/[.£+]/g, (c) => `\\${c}`);
const PILL = { default: '£46 of £100', loading: 'Last good £46', empty: '£28 of £100', error: '£38 · collector failed', stale: '£46 · billing 39 h old', offline: '£46 · saved', noModel: '£39 of £100', disagreement: '£46.73 · bill differs', abstention: '£39 · part unknown' };
const MONTH = { default: '£46.42 committed so far', loading: '£46.42 committed so far', empty: '£27.84 committed so far', error: '£37.69 last reconciled', stale: '£46.42 committed so far', offline: '£46.42 committed so far', noModel: '£39.02 committed so far', disagreement: '£46.73 with the bill', abstention: '£39.36 known so far' };
// every Home: a top-level Portfolio frame on a phone, in any journey, and Home B's top 5 in place
const HOMES = { home: ['a-portfolio', 'a-12m', 'a-launch', 'a-action', 'b-ledger', 'b-12m', 'b-launch', 'b-open', 'b-top5', 'b-top5-uslarge', 'b-top5-n50', 'b-top5-midcap', 'b-top5-usetf', 'b-top5-uketf', 'b-top5-inetf', 'b-top5-metals'], cost: ['cost-a-home', 'cost-b-home', 'cost-b-sheet'], approvals: ['ab-home'], privacy: ['privacy-b-home'] };

/* ---------- the run clock, per market (POLICY-002) ---------- */
const PAIRS = { '22:15': '22:00', '17:50': '17:35', '11:15': '11:00' };
const OLD = /cutoff\s*21:00|21:14|As of 21:15|from 21:15|last good 21:15|saved (at )?21:15|Last good run Mon 21:15|showing 21:15/i;

export default {
  'MP186-own02': ({ journeys, options, screens, view, must, has }) => {
    let wide = 0, lit = { Research: 0, Approvals: 0, Imports: 0 };
    for (const j of journeys()) for (const o of options(j)) for (const s of screens(j, o)) {
      // what the phone shows for this screen: its tab, and its way back
      const phone = view(j, o, s, 'iphone', 'default'), tab = (tabItems(phone.html).find((t) => t.on) || {}).name;
      must(tabItems(phone.html).map((t) => t.name).join('|') === TABS.join('|'), `${j}.${s} iphone: the tab bar is not the five tabs: ${tabItems(phone.html).map((t) => t.name).join(', ')}`);
      // the place a wide frame must light: Research for the brief and every research screen a phone does not file under Settings;
      // Approvals for option A's queue and all it opens; Imports for every holdings screen a phone files under Settings
      const want = (j === 'research' && tab !== 'Settings') || (j === 'home' && /-brief$/.test(s)) ? 'Research' : j === 'approvals' && o === 'a' ? 'Approvals' : j === 'holdings' && tab === 'Settings' ? 'Imports' : null;
      for (const surface of WIDE) for (const state of STATES) {
        const v = view(j, o, s, surface, state), items = sideItems(v.html), on = items.filter((x) => x.on);
        wide++;
        must(items.map((x) => x.name).join('|') === SIDE.join('|'), `${j}.${s} ${surface} ${state}: the sidebar reads ${items.map((x) => x.name).join(', ')}`);
        must(on.length === 1, `${j}.${s} ${surface} ${state}: ${on.length} places lit`);
        if (want) { must(on[0].name === want, `${j}.${s} ${surface} ${state}: lights ${on[0].name}, not ${want}`); lit[want]++; }
        else must(!['Research', 'Approvals', 'Imports'].includes(on[0].name), `${j}.${s} ${surface} ${state}: lights ${on[0].name}, which is not its place`);
      }
    }
    must(wide > 2000 && lit.Research > 50 && lit.Approvals > 100 && lit.Imports > 100, `walked ${wide} wide frames, lit ${JSON.stringify(lit)}`);
    // a place's first screen has no way back on iPad and desktop, and keeps the phone's way back
    for (const [j, o, s, back] of [['research', 'a', 'ra-brief', 'Portfolio'], ['home', 'a', 'a-brief', 'Portfolio'], ['home', 'b', 'b-brief', 'Portfolio'], ['holdings', 'a', 'a-imports', 'Settings'], ['holdings', 'b', 'b-imports', 'Settings']]) {
      for (const surface of WIDE) must(backOf(view(j, o, s, surface, 'default').html) === null, `${s} ${surface}: a way back to ${backOf(view(j, o, s, surface, 'default').html)} from a place of its own`);
      for (const surface of PHONES) must(backOf(view(j, o, s, surface, 'default').html) === back, `${s} ${surface}: the phone lost its way back to ${back}`);
    }
    // the phone keeps the queue under Settings
    for (const surface of PHONES) must((tabItems(view('approvals', 'a', 'aa-queue', surface, 'default').html).find((t) => t.on) || {}).name === 'Settings', `aa-queue ${surface}: not under Settings on a phone`);
  },

  'MP186-own06': ({ view, screens, must, has, lacks }) => {
    let n = 0;
    for (const [j, ids] of Object.entries(HOMES)) for (const s of ids) {
      must(screens(j, s.startsWith('cost-a') || s.startsWith('a-') ? 'a' : 'b').includes(s), `${j}.${s}: no such Home`);
      const o = s.startsWith('cost-a') || s.startsWith('a-') ? 'a' : 'b';
      for (const surface of ALL) for (const state of STATES) {
        // under the action sheet Empty means a holding with no action band, so that Home is drawn as Ready, its month too; and
        const v = view(j, o, s, surface, state), pills = pillOf(v.html), at = `${j}.${s} ${surface} ${state}`, month = v.na || (s === 'a-action' && state === 'empty') ? 'default' : state;   // a state that does not apply draws Ready
        n++;
        must(pills.length === 1, `${at}: ${pills.length} pills`);
        lacks(v.text, /Running cost/, `${at}: the cost row is back`);
        must(!/cost-strip/.test(v.html), `${at}: the meter is on Home`);
        // the pill is in the top bar, above the holdings and above the value
        const first = v.html.search(/class="hrow|<table class="ht|class="card valcard|class="amt priv/);
        if (first >= 0) must(v.html.indexOf('cost-pill') < first, `${at}: the pill sits below the holdings`);
        // with amounts hidden its pounds are masked with the rest (Proposed): no figure but the £100 ceiling
        if (j === 'privacy') { must(/£••/.test(shown(pills[0])) && !/£(?!100\b)\d/.test(said(pills[0])), `${at}: amounts hidden, and the pill says "${said(pills[0])}"`); continue; }
        // the same month as Cost, in the same words, whichever way Cost is flipped
        must(shown(pills[0]) === PILL[month], `${at}: the pill reads "${shown(pills[0])}", not "${PILL[month]}"`);
        has(said(pills[0]), new RegExp(esc(MONTH[month])), `${at}: the pill's name is not the month: "${said(pills[0])}"`);
        has(said(pills[0]), /Opens the month/, `${at}: the pill does not say where it goes`);
      }
    }
    must(n === Object.values(HOMES).flat().length * ALL.length * STATES.length && n > 700, `walked ${n} Home views`);
    // both Cost options draw the same Home, so it has no flip: a flip there would change nothing (the walker presses every flip drawn)
    for (const s of ['cost-a-home', 'cost-b-home']) for (const surface of ALL) for (const state of STATES) must(!/data-flip=/.test(view('cost', s === 'cost-a-home' ? 'a' : 'b', s, surface, state).html), `${s} ${surface} ${state}: a flip that changes nothing`);
    // Cost's own month says the same figure the pill names, and the meter sits inside Cost, first on This month
    for (const surface of ALL) for (const state of STATES) {
      const m = view('cost', 'a', 'cost-a-month', surface, state);
      if (state !== 'loading') has(amounts(m.text), new RegExp(esc(MONTH[state])), `cost-a-month ${surface} ${state}: Cost does not say the pill's month`);
      if (state !== 'loading') must(/class="cost-lad" role="img"/.test(m.html), `cost-a-month ${surface} ${state}: no meter inside Cost`);
    }
  },

  'MP186-clock': ({ each, view, must, has, lacks }) => {
    let seen = 0, pairs = new Set();
    for (const journey of ['home', 'holdings', 'forecast', 'research', 'journal', 'track', 'cost', 'approvals', 'privacy']) each({ journey }, (v, at) => {
      seen++;
      lacks(v.text, OLD, `${at.journey}.${at.screen} ${at.surface} ${at.state}: the old clock`);
      for (const m of v.text.matchAll(/As of (\d\d:\d\d) London[\s·,]*(?:[Dd]ata )?cutoffs? (\d\d:\d\d)/g)) { must(PAIRS[m[1]] === m[2], `${at.journey}.${at.screen} ${at.surface} ${at.state}: as of ${m[1]} with cutoff ${m[2]}`); pairs.add(m[1]); }
      for (const m of v.text.matchAll(/Last good run Mon (\d\d:\d\d) · cutoff (\d\d:\d\d)/g)) must(m[1] === '22:15' && m[2] === '22:00', `${at.journey}.${at.screen} ${at.surface} ${at.state}: only the US run failed, and its last good is ${m[1]}, ${m[2]}`);
      if (/Twelve Data · error/.test(v.text)) has(v.text, /Twelve Data · error 21:16/, `${at.journey}.${at.screen} ${at.surface} ${at.state}: the failure is not after the 21:15 start`);
    });
    must(seen > 5000, `walked ${seen} views`);
    must(['22:15', '17:50', '11:15'].every((t) => pairs.has(t)), `each market's clock is drawn somewhere: ${[...pairs].join(', ')}`);
    // the portfolio names each market's cutoff, never one run across all seven
    for (const surface of ALL) has(view('home', 'a', 'a-portfolio', surface, 'default').text, /As of 22:15 London · cutoffs US 22:00, UK 17:35, India 11:00 · 7 of 7 priced/, `${surface}: one run across the portfolio`);
    for (const surface of WIDE) has(view('home', 'a', 'a-portfolio', surface, 'default').html, /<span class="small">As of 22:15 London · cutoffs US 22:00, UK 17:35, India 11:00<\/span>/, `${surface}: the sidebar's data line`);
    // in Error only the US run failed: US rows are Monday's, and the UK and India are today's
    for (const surface of WIDE) {
      // the holdings only: the board below keeps the 2 November lists, with their own date, because the ranking run failed too
      const h = view('home', 'a', 'a-portfolio', surface, 'error').html, t = textOf(h.slice(0, h.indexOf('>Top 5 by segment<')));
      has(t, /Mon 21:00 Twelve Data/, `${surface}: the US rows are not Monday's`);
      lacks(t, /Mon 16:35|Mon 10:00|Mon 14:10/, `${surface}: a UK or India row is on Monday's run`);
      has(t, /UK and India ran today/, `${surface}: the UK and India runs are not named`);
    }
    // one instrument reads its own market's clock
    has(view('forecast', 'a', 'a-short', 'iphone', 'stale').text, /Held from Mon 17:50 Data cutoff 17:35/, 'HSBC is not on the UK clock');
    has(view('holdings', 'a', 'a-one', 'iphone', 'disagreement').text, /As of 11:15 London · data cutoff 11:00/, 'Reliance is not on the India clock');
    // the admin page tells the same US run in the same words (ADM-10, ADM-11, ADM-22)
    const admin = adminPage(ADMIN), ownerErr = view('forecast', 'a', 'a-instrument', 'web', 'error').text;
    const run = admin.view('runs', 'a', 'a-run', 'web', 'default').text, runErr = admin.view('runs', 'a', 'a-run', 'web', 'error').text;
    has(run, /As of 22:15 London · data cutoff 22:00 · 3 of 3 priced/, 'admin: the US run does not read as the owner journeys');
    lacks(run, /7 of 7|HSBC|21:30/, 'admin: the US run prices the whole portfolio');
    for (const re of [/Twelve Data failed at 21:16/, /Last good run Mon 22:15 · cutoff 22:00/]) { has(runErr, re, `admin: ${re}`); has(ownerErr, re, `owner: ${re}`); }
    has(runErr, /21:16 Twelve Data failed[\s\S]*21:40 The \+40 retry failed[\s\S]*22:00 Frozen at \+60/, 'admin: the failure is not after the start, or before the freeze');
    let adminSeen = 0;
    for (const j of admin.journeys()) for (const o of admin.options(j)) for (const s of admin.screens(j, o)) for (const surface of ALL) for (const state of ADMIN_STATES) {
      adminSeen++;
      lacks(admin.view(j, o, s, surface, state).text, /21:14|cutoff\s*21:00|7 of 7 priced/i, `admin ${j}.${s} ${surface} ${state}: the old clock`);
    }
    must(adminSeen > 3000, `walked ${adminSeen} admin views`);
  },
};
