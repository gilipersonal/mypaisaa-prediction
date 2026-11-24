// What each fixed finding of lane h (home and forecast) holds on the rendered screens (MP-62 rounds 1 to 4).
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const ALL = ['iphone', 'ipad', 'web', 'pwa'], PHONES = ['iphone', 'pwa'], WIDE = ['ipad', 'web'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const count = (t, re) => (t.match(re) || []).length;
const SEGS = ['a-segment', 'a-seg-uslarge', 'a-seg-n50', 'a-seg-midcap', 'a-seg-usetf', 'a-seg-uketf', 'a-seg-inetf'];
/* every ranked name, by the list it is on. Abstaining and Disagreement touch only Apple and Reliance. */
const LISTS = {
  ustech: ['MSFT', 'NVDA', 'AAPL', 'AMZN'], uslarge: ['JPM', 'JNJ', 'BRK.B', 'LLY', 'XOM'], n50: ['ICICIBANK', 'HDFCBANK', 'TCS', 'INFY', 'SBIN'],
  midcap: ['PERSISTENT', 'MAXHEALTH', 'FEDERALBNK', 'TATAPOWER', 'POLYCAB'], usetf: ['SPY', 'QQQ', 'VTI', 'DIA', 'IWM'], uketf: ['VUSA', 'VWRL', 'CNX1', 'ISF', 'VMID'],
  inetf: ['NIFTYBEES', 'BANKBEES', 'JUNIORBEES', 'ITBEES', 'MID150BEES'],
};
const INDIA = [...LISTS.n50, ...LISTS.midcap, ...LISTS.inetf];
const listOf = (screen) => (screen === 'a-segment' || screen === 'b-top5' ? 'ustech' : screen.replace(/^a-seg-|^b-top5-/, ''));
/* one ranked row of a list, by its ticker, on a phone list or a table, with its charts left out: a range in a chart's label is not one on screen */
const rowFor = (html, name) => (html.split(/(?=<div class="t5r|<tr[ >])/).find((r) => r.includes(`>${name}<`)) || '').replace(/<svg[\s\S]*?<\/svg>/g, ' ');
const flips = (html) => [...html.matchAll(/data-flip="([^"]+)"/g)].map((m) => m[1]);
const head = (html) => (html.match(/<div class="fc-inst"[\s\S]*?<div class="nm">([^<]+)<\/div>/) || [])[1];
const tableRow = (html, word) => html.split(/(?=<tr[ >])/).find((r) => r.includes(`<b>${word}</b>`)) || '';
/* the CSS is not in a rendered view, so this one reads the page the run was given */
const pageCss = () => {
  const i = process.argv.indexOf('--page');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  return readFileSync(i >= 0 ? resolve(process.argv[i + 1]) : join(root, 'docs/design/journeys/index.html'), 'utf8');
};
/* What a press draws. The facts api cannot pass a frame's hz, mode or name, so this runs the page's own script the way the harness does and
   calls render() with them, as strings, the way .scr's dataset hands them over. Whether a press reaches render() needs a browser: the walker's. */
const stub = () => new Proxy(function () {}, { get: (_, k) => (k === Symbol.iterator ? function* () {} : k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === 'matches' ? false : stub()), apply: () => stub(), construct: () => stub(), set: () => true, has: () => true });
const pageJourneys = () => {
  if (pageJourneys.all) return pageJourneys.all;
  const src = [...pageCss().matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script\s*>/gi)].map((m) => m[1]).find((t) => t.includes('J.start();'));
  if (!src) throw new Error('no journeys script on the page');
  const box = { console, setTimeout: () => 0, clearTimeout: () => 0, setInterval: () => 0, requestAnimationFrame: () => 0, cancelAnimationFrame: () => 0 };
  for (const k of ['document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage', 'performance', 'getComputedStyle', 'addEventListener', 'removeEventListener', 'scrollTo', 'CSS', 'PerformanceObserver']) box[k] = stub();
  box.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
  box.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  box.ResizeObserver = box.IntersectionObserver;
  box.window = box;
  box.globalThis = box;
  vm.createContext(box);
  vm.runInContext(src.replace('J.start();', 'globalThis.__J = J;'), box, { timeout: 20000 });
  pageJourneys.all = box.__J.all();
  return pageJourneys.all;
};
const words = (html) => html.replace(/<svg[\s\S]*?<\/svg>/g, (m) => (m.match(/aria-label="([^"]*)"/) || [, ' '])[1] + ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const pressed = (j, o, s, surface, state, extra = {}) => {
  const sc = pageJourneys().find((x) => x.id === j).options.find((x) => x.id === o).screens.find((x) => x.id === s);
  if (!sc) throw new Error(`no screen ${s}`);
  const html = sc.render({ kind: surface, state, scheme: 'light', journey: j, option: o, screen: s, ...extra });
  return { html, text: words(html) };
};
/* R3-h4: a flip keeps the name, from the ladder and its technical mode, in every state and on every device */
const ladderHeads = ({ each, view, must }) => {
  for (const screen of ['b-ladder', 'b-technical']) each({ journey: 'forecast', option: 'b', screen, surface: ALL }, (v, at) => {
    must(head(v.html), `${screen} ${at.surface} ${at.state}: no instrument head`);
    const f = flips(v.html);
    must(f.length === 1, `${screen} ${at.surface} ${at.state}: ${f.length} flips`);
    const [, oo, ss] = f[0].split('|');
    must(head(view('forecast', oo, ss, at.surface, at.state).html) === head(v.html), `${screen} ${at.surface} ${at.state}: ${head(v.html)} turns to another name on ${ss}`);
  });
};
/* R3-h5: who abstains and who splits, by horizon: 0 is 3 months, 1 is 6, 2 is 12. Read off the rendered rows, so a name added to the page's tables is caught. */
/* narrowed in MP-191: Reliance disagrees at every long horizon ("Conflict at every long horizon", OWN-32) */
const OUTS = { abstention: { AZN: [1], AAPL: [2] }, disagreement: { RELIANCE: [0, 1, 2], AAPL: [0] } };
const outAt = (state, t, hz) => (OUTS[state][t] || []).includes(hz);
const HELD = ['AAPL', 'NVDA', 'SPY', 'AZN', 'HSBA', 'RELIANCE', 'NIFTYBEES'];
const ROOT_NAMES = [...HELD, 'MSFT', 'JPM', 'ICICIBANK', 'XAU/USD'];
const SAYS_OUT = /split|disagree|abstain/i;
const nameIn = (r, names) => names.filter((t) => new RegExp(`(^|[\\s>])${t.replace('/', '\\/')}(?=[\\s<·]|$)`).test(words(r)));
// narrowed in MP-186: the cost row is gone ("Pill on every Home", OWN-06), so the holdings end where the board's heading starts
const holdingRows = (html) => html.slice(0, html.indexOf('>Top 5 by segment<')).split(/(?=<div class="hrow|<tr[ >])/).filter((r) => /^<(div class="hrow|tr[ >])/.test(r) && !r.includes('<th'));
const flaggedOnly = ({ each, view, must }) => {
  const holdsAt = (where, rows, names, state, hz, cell) => {
    must(rows.length === names.length, `${where}: ${rows.length} rows of ${names.length}`);
    for (const r of rows) {
      const found = nameIn(r, names);
      must(found.length === 1, `${where}: a row reads as ${found.join(', ') || 'no name'}`);
      const t = found[0], text = cell ? cell(r, hz) : r;
      must(SAYS_OUT.test(words(text)) === outAt(state, t, hz), `${where}: ${t} at ${['3', '6', '12'][hz]} months ${SAYS_OUT.test(words(text)) ? 'shows out' : 'does not show out'}: ${words(text).slice(0, 120)}`);
    }
  };
  const td = (r, hz, from) => r.split(/(?=<td)/).filter((x) => x.startsWith('<td'))[from + hz] || '';
  for (const state of ['disagreement', 'abstention']) for (const surface of ALL) for (const hz of [0, 1, 2]) {
    holdsAt(`a-portfolio ${surface} ${state}`, holdingRows(pressed('home', 'a', 'a-portfolio', surface, state, { hz: String(hz) }).html), HELD, state, hz);
    const list = pressed('forecast', 'a', 'a-forecasts', surface, state, { hz: String(hz) }).html.split(/(?=<div class="hrow fc-rootrow)/).slice(1);
    holdsAt(`a-forecasts ${surface} ${state}`, list, ROOT_NAMES, state, hz);
    const table = pressed('forecast', 'b', 'b-forecasts', surface, state).html.split(/(?=<tr[ >])/).filter((r) => r.includes('fc-rowbtn'));
    holdsAt(`b-forecasts ${surface} ${state}`, table, ROOT_NAMES, state, hz, (r, i) => td(r, i, 1));
    if (WIDE.includes(surface)) holdsAt(`b-ledger ${surface} ${state}`, holdingRows(pressed('home', 'b', 'b-ledger', surface, state).html), HELD, state, hz, (r, i) => td(r, i, 3));
  }
  // and on the ranked lists: only Apple drops out, and no other name reads as out
  for (const state of ['disagreement', 'abstention']) for (const screen of SEGS) each({ journey: 'home', option: 'a', screen, state }, (v, at) => {
    for (const name of LISTS[listOf(screen)]) if (name !== 'AAPL') {
      const r = rowFor(v.html, name);
      must(r, `${screen} ${at.surface} ${state}: no row for ${name}`);
      must(!SAYS_OUT.test(words(r)), `${screen} ${at.surface} ${state}: ${name} reads as out`);
    }
  });
};
/* R4-h8: the rows above show who is out; this reads the words, on every screen. Every listed name counts, as a ticker and as a name, read off the
   rendered lists so a new listing is covered without touching this file. */
const listedNames = (each) => {
  const found = new Map();
  for (const [journey, option] of [['home', 'a'], ['home', 'b'], ['forecast', 'a']]) each({ journey, option, surface: 'iphone', state: 'default' }, (v) => {
    for (const m of v.html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').matchAll(/class="tt">([A-Z][A-Z0-9.\/]+)\s*<span>([^·<]+)/g)) found.set(m[1], m[2].trim());
    for (const m of v.html.matchAll(/class="nm">([^<]+)<\/div><div class="tk[^"]*">([A-Z][A-Z0-9.\/]+)/g)) found.set(m[2], m[1].trim());
  });
  return found;
};
const escaped = (s) => s.replace(/[.*+?^${}()|[\]\\\/&]/g, '\\$&');
const anyOf = (names) => `(?<![A-Za-z0-9.])(?:${[...names].sort((a, b) => b.length - a.length).map(escaped).join('|')})(?![A-Za-z0-9])`;
/* every form the old list refused, over every name: a name said to be out, out "on" a name, and two names side by side */
const saidOut = (names) => { const n = anyOf(names); return new RegExp(`${n},?(?: too| also)? (?:is split|is not ranked|lost|abstained|dropped|splits|disagrees?|abstains?)|(?:split|disagree|abstained) on (?:the )?${n}|${n} and ${n}`); };
/* the prose of a frame, sentence by sentence, for phrasings no list of forms foresaw */
const sentences = (html) => [...html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').matchAll(/<(p|li)\b[^>]*>([^]*?)<\/\1>|class="(?:jbanner[^"]*|home-sub|fc-sub|t5foot[^"]*)"[^>]*>([^]*?)<\/(?:div|span)>/g)].flatMap((m) => words(m[2] || m[3] || '').split(/(?<=[.!?])\s+/));
/* the screen's own record, as the page holds it, for what a frame is called */
const screenOf = (j, o, s) => pageJourneys().find((x) => x.id === j).options.find((x) => x.id === o).screens.find((x) => x.id === s);
/* each horizon's walk-forward record, as a frame reads it */
const RECORD = (r) => [`Hit rate ${r.hit}`, `Error ${r.err}`, `Calibration ${r.cal}`, `Turnover ${r.turn}`, `Benchmark ${r.bench}`, `Embargo ${r.embargo}`, `first due ${r.due}`];
const REC3 = { hit: '61%', err: '4.7 pts', cal: '0.98', turn: '1.1', bench: '+1.4 pts', embargo: '3 months + 1 session', due: '1 Jan 2027' };
const REC6 = { hit: '58%', err: '8.9 pts', cal: '0.96', turn: '0.6', bench: '+3.1 pts', embargo: '6 months + 1 session', due: '1 Apr 2027' };
const REC12 = { hit: '62%', err: '15.8 pts', cal: '0.91', turn: '0.3', bench: '+5.2 pts', embargo: '12 months + 1 session', due: '1 Oct 2027' };
const recordLink = (t) => (t.match(/mypaisapp\.com\/e\/(fc-[0-9a-f]{6})/) || [])[1];
/* what a tile and a list row draw for US tech: rank, ticker, score. A not-ranked or withheld row has no digit rank, so it is left out on both sides. */
const ranked = (part) => [...part.matchAll(/<span class="rk">(\d)<\/span>(?:(?!<span class="rk">)[^])*?class="(?:tk|tt)">([A-Z.]+)(?:(?!<span class="rk">)[^])*?<b>(\d+)<\/b>/g)].map((m) => `${m[1]} ${m[2]} ${m[3]}`);
const techTile = (html) => html.split('class="segtile home-tile').find((p) => p.includes('>US tech<')) || '';
const techCard = (html) => html.split('class="card top5"').find((p) => p.includes('Top 5 · US tech')) || '';
const LATE_RULE = /freshness limit|Late: last price|Stale: last price|left out|Out of the total|HSBC is stale|Stale input|Held · late price|Stale · held|HSBC's (price|source|last price)/i;

export default {
  'R1-h1': ({ each, has, lacks, must }) => {
    const names = new RegExp(`(^|\\s)(${INDIA.join('|')})\\b`);
    for (const screen of ['a-portfolio', 'a-board']) each({ journey: 'home', option: 'a', screen, state: 'noModel' }, (v, at) => {
      const board = words(v.html.slice(v.html.indexOf('class="home-board')));
      must(v.html.includes('class="home-board'), `${screen} ${at.surface}: no board`);
      lacks(board, names, `${screen} ${at.surface}: an India list is ranked with no model`);
      must(count(v.html, /<p class="un">[^]{0,120}?No approved model<\/p>/g) === 3, `${screen} ${at.surface}: not all three India tiles wait`);
      has(v.text, /Nifty 50, India midcap and India ETF lists wait/, `${screen} ${at.surface}: the banner does not widen to all of India`);
    });
    for (const k of ['n50', 'midcap', 'inetf']) {
      each({ journey: 'home', option: 'a', screen: `a-seg-${k}`, state: 'noModel' }, (v, at) => { lacks(v.text, names, `a-seg-${k} ${at.surface}: a name with no model`); has(v.text, /so this list is not ranked/, `a-seg-${k} ${at.surface}: the list does not wait`); });
      each({ journey: 'home', option: 'b', screen: `b-top5-${k}`, state: 'noModel' }, (v, at) => { lacks(v.text, names, `b-top5-${k} ${at.surface}: a name with no model`); has(v.text, /Not ranked until an approved model covers India/, `b-top5-${k} ${at.surface}: the list does not wait`); });
    }
    each({ journey: 'home', screen: 'a-search', state: 'noModel' }, (v, at) => lacks(v.text, /XNSE Universe \d\d/, `${at.surface}: search keeps an India score`));
    each({ journey: 'home', screen: 'b-search', state: 'noModel' }, (v, at) => lacks(v.text, /XNSE Universe \d\d/, `${at.surface}: search keeps an India score`));
    each({ journey: 'home', screen: 'a-brief', state: 'noModel' }, (v, at) => lacks(v.text, /leads Nifty 50 at 72/, `${at.surface}: the brief quotes an India score`));
  },
  'R1-h2': ({ each, has, lacks, must }) => {
    for (const screen of ['b-ladder', 'b-technical']) each({ journey: 'forecast', option: 'b', screen, state: 'abstention' }, (v, at) => {
      for (const fig of ['+33.9%', '−10.2%', '+12.4%']) must(!v.html.includes(fig), `${screen} ${at.surface}: the abstained 12 months still shows ${fig}`);
      has(v.html, /12 months abstained<\/text>/, `${screen} ${at.surface}: the fan does not end on "12 months abstained"`);
      has(v.text, /12 months: abstained, no range/, `${screen} ${at.surface}: the text alternative keeps the 12-month figures`);
    });
    each({ journey: 'forecast', option: 'b', screen: 'b-ladder', state: 'disagreement' }, (v, at) => {
      has(v.html, />Split<\/text>/, `${at.surface}: the 3-month point is not marked split`);
      lacks(v.text, /3 months: median/, `${at.surface}: the split 3 months keeps its median`);
    });
  },
  'R1-h3': ({ each, has }) => {
    each({ journey: 'forecast', option: 'b', screen: 'b-proof', state: 'default', surface: ALL }, (v, at) => {
      for (const re of [/ds-2026-10-30/, /Hit rate/, /Benchmark/, /Model sheet/, /Analog sheet/, /22 since 2015/]) has(v.text, re, `${at.surface}: the dossier's proof lacks ${re}`);
      has(v.html, /aria-label="Dossier"[^]*?<button type="button" aria-pressed="false">Forecast<\/button><button type="button" aria-pressed="true">Proof/, `${at.surface}: the Proof tab is not the one selected`);
    });
  },
  'R1-h4': ({ each, has, must }) => {
    for (const screen of SEGS) each({ journey: 'home', option: 'a', screen, state: 'default', surface: ['iphone', 'web'] }, (v, at) => {
      for (const name of LISTS[listOf(screen)]) must(/[+−]\d+\.\d% to [+−]\d+\.\d%/.test(rowFor(v.html, name)), `${screen} ${at.surface}: ${name} has no row with its 80% range`);
      has(v.text, /Ranked 3 Nov · policy v1 · decision support/, `${screen} ${at.surface}: no ranking date and version`);
      has(v.text, /(Twelve Data|Yahoo) \d\d:\d\d/, `${screen} ${at.surface}: no freshness`);
    });
    each({ journey: 'home', option: 'a', screen: 'a-seg-metals', state: 'default' }, (v, at) => has(v.text, /Forecast unavailable/, `${at.surface}: gold's drill-down`));
    each({ journey: 'home', option: 'a', screen: 'a-board', state: 'default' }, (v, at) => {
      has(v.text, /Ranked 3 Nov · policy v1 · decision support/, `${at.surface}: the board has no ranking date`);
      has(v.text, /Twelve Data 21:00/, `${at.surface}: the tile has no freshness`);
      has(v.text, /Yahoo 10:00/, `${at.surface}: India's tile has no freshness`);
    });
    for (const screen of ['b-top5', 'b-top5-uslarge', 'b-top5-n50', 'b-top5-midcap', 'b-top5-usetf', 'b-top5-uketf', 'b-top5-inetf']) each({ journey: 'home', option: 'b', screen, state: 'default', surface: ['iphone', 'web'] }, (v, at) => {
      for (const name of LISTS[listOf(screen)]) must(/[+−]\d+\.\d% · 80% range [+−]\d+\.\d% to [+−]\d+\.\d% · 6M/.test(words(rowFor(v.html, name))), `${screen} ${at.surface}: ${name} has no median and range`);
      has(v.text, /Ranked 3 Nov · policy v1 · decision support/, `${screen} ${at.surface}: no ranking date`);
    });
  },
  'R1-h5': ({ each, has, must }) => {
    each({ journey: 'home', screen: 'a-portfolio', state: 'loading' }, (v, at) => {
      has(v.html, /home-dim/, `${at.surface}: the rows are not drawn dimmed`);
      has(v.text, /80% range −18\.5% to \+34\.0%/, `${at.surface}: a holding's range is hidden`);
      has(v.text, /Late/, `${at.surface}: HSBC's flag is hidden`);
      must(!/<div class="hrow"><span class="logo sk"/.test(v.html), `${at.surface}: a skeleton row`);
    });
    each({ journey: 'home', screen: 'b-ledger', state: 'loading' }, (v, at) => {
      has(v.html, /home-dim/, `${at.surface}: the ledger is not dimmed`);
      has(v.text, /Late|late/, `${at.surface}: HSBC's flag is hidden`);
    });
    for (const [journey, screen] of [['forecast', 'a-instrument'], ['forecast', 'b-ladder'], ['forecast', 'a-3m'], ['forecast', 'a-12m'], ['forecast', 'b-forecast']]) each({ journey, screen, state: 'loading' }, (v, at) => {
      has(v.html, /fc-dim/, `${screen} ${at.surface}: the forecast is not dimmed`);
      has(v.text, /80% range/, `${screen} ${at.surface}: the range is hidden`);
      has(v.text, /Data cutoff (22:00|17:35|11:00)/, `${screen} ${at.surface}: the cutoff is hidden`);   // narrowed in MP-186: each market's +60 cutoff (ADM-22)
    });
  },
  'R1-h6': ({ each, has, lacks }) => {
    for (const journey of ['home', 'forecast']) each({ journey, state: 'error' }, (v, at) => lacks(v.text, /20:45/, `${at.screen} ${at.surface}: a second version, 20:45`));
    for (const [journey, screen] of [['home', 'a-portfolio'], ['home', 'b-ledger'], ['forecast', 'a-instrument'], ['forecast', 'b-ladder'], ['forecast', 'a-short'], ['forecast', 'a-forecasts']]) each({ journey, screen, state: 'error' }, (v, at) => {
      // narrowed in MP-186: the US run issues 22:15 with its cutoff at 22:00, and only the US run failed (ADM-10, ADM-22)
      has(v.text, /[Ll]ast good run Mon 22:15 · cutoff 22:00/, `${screen} ${at.surface}: not the last good run`);
      lacks(v.text, /As of 22:15 London/, `${screen} ${at.surface}: today's as-of on Monday's run`);
    });
    each({ journey: 'home', screen: 'a-portfolio', state: 'error', surface: WIDE }, (v, at) => {
      has(v.text, /Mon 21:00 Twelve Data/, `${at.surface}: the Data column is not on Monday`);
      lacks(v.text, /\s21:15 (Twelve Data|Yahoo)/, `${at.surface}: the Data column mixes versions`);
    });
  },
  'R1-h7': ({ must }) => {
    must(/\.home-tile li b\s*\{[^}]*color:\s*inherit/.test(pageCss()), 'a tile score does not inherit the tile\'s ink');
  },
  'R1-h8': ({ each, has }) => {
    for (const screen of ['a-brief', 'b-brief']) each({ journey: 'home', screen, state: 'loading' }, (v, at) => {
      has(v.text, /Yesterday, 07:30 · decision support/, `${at.surface}: the brief is not labelled decision support`);
      has(v.text, /Reliance: median \+7\.4% at 6 months, 80% range −12\.0% to \+24\.9%/, `${at.surface}: the Add has no range`);
    });
  },
  'R1-h9': ({ each, must }) => {
    each({ journey: 'home', option: 'a', screen: 'a-brief', state: 'default' }, (v, at) => {
      const at_ = ['Actions · decision support', 'Risks', 'Changes', 'Upcoming'].map(w => v.text.indexOf(w));
      must(at_.every((n, i) => n >= 0 && (i === 0 || n > at_[i - 1])), `${at.surface}: the brief reads ${at_}`);
    });
  },
  'R1-h10': ({ each, has, lacks }) => {
    each({ journey: 'home', screen: 'a-portfolio', state: 'disagreement' }, (v, at) => { has(v.text, /3 actions ·/, `${at.surface}: the pill miscounts`); lacks(v.text, /2 actions/, `${at.surface}: 2 actions over three`); });
    each({ journey: 'home', screen: 'a-portfolio', state: 'abstention' }, (v, at) => { has(v.text, /3 actions ·/, `${at.surface}: the pill miscounts`); lacks(v.text, /2 actions/, `${at.surface}: 2 actions over three`); });
  },
  'R1-h12': ({ each, has, lacks, must }) => {
    for (const screen of ['a-forecasts', 'b-forecasts']) each({ journey: 'forecast', screen, state: 'default' }, (v, at) => {
      must(!v.html.includes('class="jback"'), `${screen} ${at.surface}: a root has no back`);
      for (const t of ['AAPL', 'NVDA', 'SPY', 'AZN', 'HSBA', 'RELIANCE', 'NIFTYBEES', 'MSFT', 'JPM', 'ICICIBANK', 'XAU/USD']) has(v.text, new RegExp(t.replace('/', '\\/')), `${screen} ${at.surface}: ${t} is missing`);
      has(v.text, /Watch-only/, `${screen} ${at.surface}: watch-only is not apart`);
      has(v.text, /Evaluated/, `${screen} ${at.surface}: no horizon state`);
      if (screen === 'b-forecasts') has(v.text, /Exploratory/, `${screen} ${at.surface}: no exploratory state`);
    });
    each({ journey: 'forecast', screen: 'a-instrument', state: 'default' }, (v, at) => has(v.html, /aria-label="Back to Forecasts"/, `${at.surface}: back does not lead to the root`));
    each({ journey: 'forecast', screen: 'b-ladder', state: 'default' }, (v, at) => has(v.html, /aria-label="Back to Forecasts"/, `${at.surface}: back does not lead to the root`));
    each({ journey: 'home', screen: 'a-board', state: 'default', surface: PHONES }, (v, at) => {
      has(v.html, /aria-current="page">[^]{0,200}?Segments/, `${at.surface}: Segments is not the lit tab`);
      must(!v.html.includes('class="jback"'), `${at.surface}: a root has no back`);
    });
    each({ journey: 'home', screen: 'a-segment', state: 'default' }, (v, at) => has(v.html, /aria-label="Back to Segments"/, `${at.surface}: a list does not lead back to its root`));
    for (const screen of ['b-explore', 'b-search']) each({ journey: 'home', screen, state: 'default' }, (v, at) => lacks(v.text, /Explore/, `${screen} ${at.surface}: the tab is called Segments`));
  },
  'R1-h13': ({ each, has, lacks }) => {
    each({ journey: 'forecast', screen: 'a-3m', state: 'default' }, (v, at) => { has(v.text, /3-month forecast · AAPL/, `${at.surface}: no 3-month forecast`); has(v.text, /Horizon 3 Feb 2027/, `${at.surface}: no 3-month date`); has(v.text, /\+3\.1%/, `${at.surface}: no 3-month median`); has(v.html, /aria-pressed="true"[^>]*>3/, `${at.surface}: the switch is not on 3 months`); });
    each({ journey: 'forecast', screen: 'a-12m', state: 'default' }, (v, at) => { has(v.text, /12-month forecast · AAPL/, `${at.surface}: no 12-month forecast`); has(v.text, /Horizon 3 Nov 2027/, `${at.surface}: no 12-month date`); has(v.text, /Exploratory/, `${at.surface}: 12 months is not exploratory`); has(v.text, /\+12\.4%/, `${at.surface}: no 12-month median`); });
    each({ journey: 'forecast', screen: 'a-12m', state: 'abstention' }, (v, at) => { has(v.text, /calibrated 12-month range/, `${at.surface}: 12 months does not abstain`); lacks(v.text, /\+33\.9%/, `${at.surface}: an abstained range`); });
    each({ journey: 'home', screen: 'a-12m', state: 'default', surface: 'iphone' }, v => { has(v.text, /· 12M/, 'the rows do not read 12M'); lacks(v.text, /· 6M/, 'a row stays on 6M'); has(v.text, /Exploratory/, '12 months is not exploratory'); });
    each({ journey: 'home', screen: 'a-12m', state: 'default', surface: 'web' }, v => { has(v.text, /12-month forecast/, 'the column does not read 12-month'); lacks(v.text, /6-month forecast/, 'the column stays on 6 months'); });
    each({ journey: 'home', screen: 'b-12m', state: 'default', surface: PHONES }, (v, at) => { lacks(v.text, />6M</, `${at.surface}: the ledger stays on 6M`); has(v.text, /\+12\.4%/, `${at.surface}: Apple's 12-month median`); });
  },
  'R1-h14': ({ each, has }) => {
    for (const screen of ['a-technical', 'b-technical']) each({ journey: 'forecast', screen, state: 'default' }, (v, at) => {
      has(v.html, /aria-label="Detail"/, `${screen} ${at.surface}: no mode control`);
      has(v.html, /aria-pressed="true">Technical/, `${screen} ${at.surface}: not in technical mode`);
      has(v.text, /Simple Technical/, `${screen} ${at.surface}: both modes are not offered`);
      has(v.text, /80% range/, `${screen} ${at.surface}: technical drops the range`);
      has(v.text, /Both keep its range and its uncertainty/, `${screen} ${at.surface}: the uncertainty is not kept`);
    });
    for (const screen of ['a-instrument', 'b-ladder']) each({ journey: 'forecast', screen, state: 'default' }, (v, at) => has(v.html, /aria-pressed="true">Simple/, `${screen} ${at.surface}: no simple mode`));
    for (const screen of ['a-hzstates', 'b-hzstates']) each({ journey: 'forecast', screen, state: 'default' }, (v, at) => {
      for (const w of ['Evaluated model', 'Rules only', 'In practice', 'No clear view', 'Abstained', 'Stale input', 'Model paused', 'Cost paused', 'Unavailable']) has(v.text, new RegExp(w), `${screen} ${at.surface}: ${w} is not drawn`);
    });
  },
  'R1-h15': ({ each, has, lacks }) => {
    each({ journey: 'forecast', screen: 'a-instrument', state: 'default' }, (v, at) => {
      has(v.text, /held 79% of the time over 52 scored forecasts in walk-forward testing/, `${at.surface}: the calibration line`);
      has(v.html, /Walk-forward: inside/, `${at.surface}: the chart's case is not walk-forward`);
      lacks(v.html, /Scored: inside/, `${at.surface}: the chart reads as a live record`);
      has(v.text, /Walk-forward case/, `${at.surface}: the legend`);
    });
    each({ journey: 'forecast', screen: 'b-ladder', state: 'default' }, (v, at) => {
      has(v.text, /Held 77% of 26 in walk-forward testing · Exploratory/, `${at.surface}: the 12-month row`);
      has(v.text, /Held 79% of 52 in walk-forward testing/, `${at.surface}: the 6-month row`);
      has(v.text, /12 months: Exploratory/, `${at.surface}: the fan's chip`);
    });
    each({ journey: 'forecast', screen: 'a-short', state: 'default' }, (v, at) => has(v.text, /held 80% of 412 in walk-forward testing/, `${at.surface}: the short-term row`));
    each({ journey: 'forecast', screen: 'a-views', state: 'default' }, (v, at) => has(v.text, /Held 79% of 52 scored in walk-forward testing/, `${at.surface}: the model view`));
    each({ journey: 'home', screen: 'b-ledger', state: 'default', surface: WIDE }, (v, at) => has(v.text, /12 months Exploratory/, `${at.surface}: the 12-month column`));
  },
  'R1-h16': ({ each, has, lacks }) => {
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: WIDE }, (v, at) => {
      for (const re of [/21:00 Twelve Data/, /16:35 Yahoo/, /14:10 Yahoo · late/, /10:00 Yahoo/]) has(v.text, re, `${at.surface}: ${re}`);
      lacks(v.text, /\s21:15 (Twelve Data|Yahoo)/, `${at.surface}: a row's price time is the run's`);
    });
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: 'iphone' }, v => { has(v.text, /Late: last price 14:10 \(Yahoo\)/, 'HSBC is not late'); has(v.text, /Proposed · DATA-DEC-02/, 'the limit is not labelled'); has(v.text, /7 of 7 priced/, 'Ready is not fully priced'); has(v.text, /84,612/, 'the total'); });
    each({ journey: 'home', screen: 'a-portfolio', state: 'stale' }, (v, at) => {
      has(v.text, /84,051/, `${at.surface}: HSBC stays in the total`);
      has(v.text, /6 of 7 priced/, `${at.surface}: the count`);
      has(v.text, /1 of 7 rows is stale/, `${at.surface}: more than HSBC is stale`);
      has(v.text, /until its price returns/, `${at.surface}: the recovery sentence`);
      lacks(v.text, /Stale[^.]{0,30}16:35|stopped at 16:35|90,155/, `${at.surface}: 16:35 or the old total`);
    });
    for (const journey of ['forecast']) each({ journey, state: 'stale' }, (v, at) => lacks(v.text, /16:35/, `${at.screen} ${at.surface}: 16:35 means only the UK close`));
    each({ journey: 'forecast', screen: 'a-instrument', state: 'stale' }, (v, at) => { has(v.text, /HSBC/, `${at.surface}: stale is not drawn on HSBC`); has(v.text, /until its price returns/, `${at.surface}: the recovery sentence`); });
    each({ journey: 'home', screen: 'a-action', state: 'stale' }, (v, at) => { has(v.text, /This action is stale/, `${at.surface}: the sheet`); lacks(v.text, /at 16:35/, `${at.surface}: the old stale time`); });
  },
  'R1-h17': ({ each, has }) => {
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: 'iphone' }, v => { for (const re of [/AAPL · USD · Twelve Data 21:00/, /AZN · GBP · Yahoo 16:35/, /HSBA · GBP · Yahoo 14:10/, /RELIANCE · INR · Yahoo 10:00/]) has(v.text, re, `the row lacks ${re}`); });
    for (const [screen, surface] of [['a-portfolio', 'pwa'], ['b-ledger', 'iphone'], ['b-ledger', 'pwa']]) each({ journey: 'home', screen, state: 'default', surface }, v => { for (const re of [/USD · Twelve Data 21:00/, /GBP · Yahoo 16:35/, /GBP · Yahoo 14:10/, /INR · Yahoo 10:00/]) has(v.text, re, `${screen} ${surface}: ${re}`); });
  },
  'R1-h18': ({ each, has, lacks }) => {
    for (const screen of ['a-evidence', 'b-evidence']) each({ journey: 'forecast', screen, state: 'default' }, (v, at) => {
      lacks(v.text, /close 3 Nov|at 21:11/, `${screen} ${at.surface}: an input after the cutoff`);
      has(v.text, /close 2 Nov/, `${screen} ${at.surface}: not the previous close`);
      has(v.text, /FX quote received 20:52/, `${screen} ${at.surface}: the FX quote is not before the cutoff`);
    });
  },
  'R1-h20': ({ each, has, lacks, must }) => {
    each({ journey: 'forecast', screen: 'a-short', state: 'noModel' }, (v, at) => {
      must(count(v.text, /Model paused \(POLICY-003\)/g) === 3, `${at.surface}: the paused rows have no wording of their own`);
      has(v.text, /all four rows show the rules/, `${at.surface}: the banner`);
      lacks(v.text, /Shadow trial/, `${at.surface}: a paused row reads in practice`);
    });
  },
  'R1-h21': ({ each, has, must }) => {
    const tall = +(pageCss().match(/\.jspace\.tall\s*\{[^}]*height:\s*(\d+)px/) || [])[1];
    must(tall >= 168, `the room under the last card is ${tall} px; the floating bar sits 96 px up and stands 60 px tall, with 12 px of air`);
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: PHONES }, (v, at) => has(v.html, /class="jspace tall"/, `${at.surface}: the last card can run under the floating bar`));
    each({ journey: 'forecast', screen: 'a-instrument', state: 'default', surface: PHONES }, (v, at) => has(v.html, /class="jspace tall"/, `${at.surface}: the last card can run under the floating bar`));
  },
  /* owner's request on this round: the home cost row reads the month, and every state reads as the cost journey does */
  'R1-h-cost': ({ each, has, lacks, journeys, view, must }) => {
    // narrowed in MP-186: the owner picked "Pill on every Home" (OWN-06), so the row after the holdings goes and a pill in the top bar
    // reads the month in every state, in the cost journey's own figures. The row's words are retired with it; the month they held stays.
    const want = { default: /£46\.42 committed so far\. On plan\. Forecast up to £59\.73/, loading: /Last good £46 .*Refreshing · last good 22:15/, empty: /£27\.84 committed so far\. New month/, error: /£37\.69 last reconciled\. Stale · 39 h old\. Forecast up to £59\.73, estimated only/, stale: /billing 39 h old/, offline: /Offline · from 22:15/, noModel: /£39\.02 committed so far\. Claude off\. Forecast £46\.48/, disagreement: /£46\.73 with the bill\. Estimate and bill differ/, abstention: /£39\.36 known so far\. Claude unknown/ };
    for (const state of STATES) for (const screen of ['a-portfolio', 'b-ledger']) each({ journey: 'home', screen, state }, (v, at) => { has(v.text, want[state], `${screen} ${at.surface} ${state}: the pill`); lacks(v.text, /Running cost/, `${screen} ${at.surface} ${state}: the row is back`); });
    each({ journey: 'home', screen: 'a-portfolio', state: 'noModel' }, (v, at) => { has(v.text, /Claude off/, `${at.surface}: Claude off`); lacks(v.text, /£46\.42/, `${at.surface}: Claude spend on a Claude-off pill`); });
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: 'iphone' }, v => must(v.text.indexOf('Cost this month') >= 0 && v.text.indexOf('Cost this month') < v.text.indexOf('NIFTYBEES ·'), 'the pill is not in the top bar, above the holdings'));
    if (journeys().includes('cost')) for (const [state, l, p] of [['default', 46, 42], ['empty', 27, 84], ['error', 44, 40], ['noModel', 39, '02'], ['disagreement', 46, 73], ['abstention', 39, 36]]) {
      must(new RegExp(`£${l}\\b[^]{0,20}\\.${p}`).test(view('cost', 'a', 'cost-a-month', 'iphone', state).text), `the cost journey's ${state} no longer reads £${l}.${p}`);
    }
  },
  /* ---------- round 2 ---------- */
  'R2-h1': (api) => {
    const { each, view, must } = api;
    // the flip keeps the instrument, from the horizon pages and the dossier, in all nine states
    for (const [option, screen] of [['a', 'a-instrument'], ['a', 'a-technical'], ['a', 'a-3m'], ['a', 'a-12m'], ['b', 'b-forecast']]) each({ journey: 'forecast', option, screen, surface: ALL }, (v, at) => {
      must(head(v.html), `${screen} ${at.surface} ${at.state}: no instrument head`);
      const f = flips(v.html);
      must(f.length === 1, `${screen} ${at.surface} ${at.state}: ${f.length} flips`);
      const [, oo, ss] = f[0].split('|'), other = view('forecast', oo, ss, at.surface, at.state);
      must(head(other.html) === head(v.html), `${screen} ${at.surface} ${at.state}: ${head(v.html)} turns to ${head(other.html)} on ${ss}`);
    });
    each({ journey: 'forecast', option: 'a', screen: 'a-instrument', state: 'disagreement' }, (v, at) => must(flips(v.html)[0] === 'forecast|b|b-forecast', `${at.surface}: the flip does not go to the dossier`));
    // the ladder turning back, in every state
    ladderHeads(api);
    // Short-term names no instrument in No model, so its flip to gold changes none
    each({ journey: 'forecast', option: 'a', screen: 'a-short', state: 'noModel' }, (v, at) => { must(v.html.includes('aria-label="Back to Forecasts"'), `${at.surface}: back names an instrument`); must(!v.html.includes('aria-label="Forecast horizon"'), `${at.surface}: a switch with no instrument`); });
    // the horizon switch stays on one instrument, at every horizon and in every state
    for (const screen of ['a-instrument', 'a-3m', 'a-12m', 'a-technical']) for (const state of STATES) for (const hz of ['0', '1', '2']) {
      const base = pressed('forecast', 'a', screen, 'iphone', state), at = pressed('forecast', 'a', screen, 'iphone', state, { hz });
      must(head(at.html) && head(at.html) === head(base.html), `${screen} ${state} at ${hz}: ${head(base.html)} became ${head(at.html)}`);
    }
    // a dossier heads with what the page it came from heads with
    for (const [state, name] of [['disagreement', 'Reliance'], ['abstention', 'AstraZeneca'], ['noModel', 'Gold'], ['stale', 'HSBC'], ['default', 'Apple']]) must(head(view('forecast', 'b', 'b-forecast', 'web', state).html) === name, `b-forecast ${state} does not draw ${name}`);
  },
  'R2-h2': ({ each, has, lacks }) => {
    each({ journey: 'forecast', option: 'b', screen: 'b-technical', state: 'abstention', surface: ALL }, (v, at) => {
      has(v.text, /12 months Abstained · no range/, `${at.surface}: the technical table keeps a 12-month row`);
      lacks(v.text, /\+23\.7%|12 months −10\.2%/, `${at.surface}: a percentile of the abstained 12 months`);
    });
  },
  'R2-h3': ({ each, has, lacks }) => {
    const rule = (t, at) => { lacks(t, /\+3\.1%/, `${at}: a median on the split 3 months`); };
    each({ journey: 'forecast', screen: 'a-3m', state: 'disagreement', surface: ALL }, (v, at) => {
      rule(v.html, `a-3m ${at.surface}`);
      has(v.text, /No median stands at this horizon/, `${at.surface}: the card does not say so`);
      has(v.text, /80% range −8\.2% to \+13\.8%/, `${at.surface}: the range does not stand`);
      has(v.text, /Baseline, 80% range/, `${at.surface}: both ranges do not show`);
      lacks(v.text, /median \+/, `${at.surface}: the fan's text keeps a median`);
    });
    for (const surface of ALL) {
      rule(pressed('forecast', 'a', 'a-3m', surface, 'disagreement', { mode: '1' }).html, `technical ${surface}`);
      has(pressed('forecast', 'a', 'a-3m', surface, 'disagreement', { mode: '1' }).text, /Median Split · no median/, `${surface}: the technical card prints a median`);
      rule(pressed('forecast', 'a', 'a-forecasts', surface, 'disagreement', { hz: '0' }).html, `root ${surface}`);
      rule(pressed('forecast', 'b', 'b-forecasts', surface, 'disagreement').html, `b-forecasts ${surface}`);
    }
  },
  'R2-h4': ({ each, has }) => {
    each({ journey: 'forecast', option: 'b', screen: 'b-forecasts', state: 'default', surface: ALL }, (v, at) => {
      for (const re of [/80% range/, /−9\.8% to \+21\.4%/, /Held · late price, 14:10/, /Unavailable · SCI-D08/, /−10\.2% to \+12\.6%/]) has(v.text, re, `${at.surface}: ${re}`);
    });
    each({ journey: 'forecast', option: 'b', screen: 'b-forecasts', state: 'stale', surface: ALL }, (v, at) => has(v.text, /Stale · held, 14:10/, `${at.surface}: stale HSBC`));
    each({ journey: 'forecast', option: 'b', screen: 'b-forecasts', state: 'noModel', surface: ALL }, (v, at) => has(v.text, /No approved model/, `${at.surface}: no-model reason`));
  },
  'R2-h5': ({ must, has }) => {
    // a redraw keeps its flip and draws the side the frame shows, with hz and mode as the shell's dataset hands them over. The press itself is the walker's.
    for (const surface of PHONES) {
      for (const [j, o, s] of [['home', 'a', 'a-portfolio'], ['home', 'a', 'a-12m'], ['home', 'b', 'b-ledger'], ['home', 'b', 'b-12m'], ['forecast', 'a', 'a-instrument'], ['forecast', 'a', 'a-3m'], ['forecast', 'a', 'a-forecasts']]) for (const hz of ['0', '1', '2']) {
        const v = pressed(j, o, s, surface, 'default', { hz });
        must(flips(v.html).length === 1, `${s} ${surface} at ${hz}: the press removes the flip`);
        has(v.html, new RegExp(`aria-label="Forecast horizon"[^]*?<button type="button" aria-pressed="false"[^]*?`), `${s} ${surface}: no switch`);
        const on = [...v.html.slice(v.html.indexOf('aria-label="Forecast horizon"')).matchAll(/aria-pressed="(true|false)"/g)].slice(0, 3).map((m) => m[1]);
        must(on[+hz] === 'true', `${s} ${surface} at ${hz}: the switch lights ${on}`);
      }
      for (const mode of ['0', '1']) for (const [o, s] of [['a', 'a-instrument'], ['a', 'a-technical'], ['b', 'b-ladder'], ['b', 'b-technical']]) {
        const v = pressed('forecast', o, s, surface, 'default', { mode });
        must(flips(v.html).length === 1, `${s} ${surface} mode ${mode}: the press removes the flip`);
        has(v.html, new RegExp(`aria-pressed="true">${mode === '1' ? 'Technical' : 'Simple'}`), `${s} ${surface}: mode ${mode} does not light`);
        must(/Both keep its range and its uncertainty/.test(v.text) === (mode === '1'), `${s} ${surface}: mode ${mode} draws the wrong mode`);
      }
    }
  },
  'R2-h6': ({ each, has, must }) => {
    for (const screen of ['b-ledger', 'b-12m']) each({ journey: 'home', option: 'b', screen, surface: ALL }, (v, at) => {
      has(v.text, /Top 5/, `${screen} ${at.surface} ${at.state}: no top 5`);
      has(v.text, /MSFT/, `${screen} ${at.surface} ${at.state}: the list is not drawn`);
      const above = at.state === 'empty' ? 'No holdings yet' : 'NIFTYBEES';
      must(v.text.includes(above) && v.text.indexOf('Top 5') > v.text.indexOf(above), `${screen} ${at.surface} ${at.state}: the top 5 is not below the holdings`);
    });
  },
  'R2-h7': ({ each, view, has, lacks, must }) => {
    for (const [o, screen] of [['a', 'a-segment'], ['b', 'b-explore']]) each({ journey: 'home', option: o, screen, state: 'noModel' }, (v, at) => {
      for (const re of [/This list stands/, /US tech has its model/, /MSFT/, /AMZN/]) has(v.text, re, `${screen} ${at.surface}: ${re}`);
      lacks(v.text, /XAU\/USD/, `${screen} ${at.surface}: gold on a US tech list`);
    });
    each({ journey: 'home', option: 'b', screen: 'b-explore', state: 'noModel', surface: WIDE }, (v, at) => has(v.text, /Microsoft/, `${at.surface}: the rail is not on US tech`));
    must(!/gold and silver\.$/i.test(view('home', 'b', 'b-explore').note), 'the note still draws No model on gold');
    each({ journey: 'home', option: 'b', screen: 'b-top5-metals', state: 'noModel' }, (v, at) => has(v.text, /XAU\/USD/, `${at.surface}: gold is not on its own list`));
  },
  'R2-h8': ({ each, has, lacks }) => {
    for (const screen of ['a-3m', 'a-12m']) {
      each({ journey: 'forecast', screen, state: 'abstention' }, (v, at) => lacks(v.text, /AstraZeneca is not ranked|AstraZeneca/, `${screen} ${at.surface}: another name on Apple's page`));
      each({ journey: 'forecast', screen, state: 'disagreement' }, (v, at) => lacks(v.text, /Reliance/, `${screen} ${at.surface}: another name on Apple's page`));
    }
    each({ journey: 'forecast', screen: 'a-3m', state: 'abstention' }, (v, at) => {
      // narrowed in MP-191: a name not ranked carries no action at any horizon ("No score, no action", OWN-20), so 3 months keeps its range and loses its Hold
      lacks(v.html, /class="badge b-hold"/, `${at.surface}: a Hold on a name that is not ranked`);
      has(v.text, /12 months abstained, so growth and protection are both missing\. Apple is not ranked, and carries no action at any horizon/, `${at.surface}: the action is not Apple's, or gives no reason`);
      has(v.text, /80% range −8\.2% to/, `${at.surface}: the range is not at 3 months`);
      lacks(v.text, /No range at/, `${at.surface}: "no range" over a range`);
    });
    each({ journey: 'forecast', screen: 'a-12m', state: 'abstention' }, (v, at) => has(v.text, /No range at 12 months, so no action\. Apple is not ranked/, `${at.surface}: the abstained action`));
    each({ journey: 'forecast', screen: 'a-3m', state: 'disagreement' }, (v, at) => has(v.text, /No action is ranked on Apple at 3 months/, `${at.surface}: the split action`));
    // narrowed in MP-191: 12 months has no conflict, and Apple still carries no action there, because the split at 3 months leaves it not ranked (OWN-17, OWN-20)
    each({ journey: 'forecast', screen: 'a-12m', state: 'disagreement' }, (v, at) => { has(v.text, /No conflict at 12 months/, `${at.surface}: 12 months has no conflict`); lacks(v.html, /class="badge b-hold"/, `${at.surface}: a Hold on a name that is not ranked`); has(v.text, /The models split on Apple at 3 months, so growth and protection are both missing/, `${at.surface}: no reason for no action`); });
  },
  'R2-h9': ({ each, has, lacks }) => {
    const money = (v) => `£${Math.round(v).toLocaleString('en-GB')}`, run = (r, y) => { let v = 6104.2; for (let i = 0; i < y; i++) v *= 1 + (r - 0.2) / 100; return v; };
    for (const screen of ['b-ladder', 'b-technical']) each({ journey: 'forecast', option: 'b', screen, state: 'stale' }, (v, at) => {
      has(v.text, /Scenarios · HSBA/, `${screen} ${at.surface}: the block does not name the holding`);
      for (const y of [3, 5]) has(v.text, new RegExp(`${money(run(-2, y))} to ${money(run(10, y))}`), `${screen} ${at.surface}: ${y} years is not from £6,104.20`);
      lacks(v.text, /£13,864|£19,619/, `${screen} ${at.surface}: Apple's start on HSBC's page`);
    });
    each({ journey: 'forecast', option: 'b', screen: 'b-ladder', state: 'default', surface: 'web' }, (v) => has(v.text, /£13,864 to £19,619/, 'Apple keeps its own figures'));
  },
  'R2-h10': ({ each, has, lacks }) => {
    for (const [o, screen] of [['a', 'a-proof'], ['a', 'a-views'], ['a', 'a-evidence'], ['b', 'b-forecast'], ['b', 'b-proof'], ['b', 'b-views'], ['b', 'b-evidence']]) each({ journey: 'forecast', option: o, screen, state: 'noModel' }, (v, at) => {
      has(v.html, /aria-label="Back to XAU\/USD"/, `${screen} ${at.surface}: back does not lead to gold`);
      lacks(v.text, /AAPL|Apple|No approved model at this horizon|Reads Hold|reading Hold|Rules only at 6 months|R2-HGB v3, heuristic/, `${screen} ${at.surface}: another subject in gold's No model`);
    });
    for (const [o, screen] of [['a', 'a-views'], ['b', 'b-views']]) each({ journey: 'forecast', option: o, screen, state: 'noModel' }, (v, at) => {
      has(v.text, /Rules read nothing for gold without a valuation convention/, `${screen} ${at.surface}: the rules text`);
      has(v.text, /Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in\./, `${screen} ${at.surface}: Claude off`);
    });
    for (const [o, screen] of [['a', 'a-evidence'], ['b', 'b-evidence']]) each({ journey: 'forecast', option: o, screen, state: 'noModel' }, (v, at) => has(v.text, /Watch-only: no position/, `${screen} ${at.surface}: gold is not held`));
    each({ journey: 'forecast', screen: 'b-forecast', state: 'noModel', surface: WIDE }, (v, at) => lacks(v.text, /Held \d+% of/, `${at.surface}: a record beside no forecast`));
  },
  'R2-h11': ({ each, has, lacks, must, view }) => {
    // the table, on Home, cell by cell
    const cells = (surface) => ({ dis: view('home', 'b', 'b-ledger', surface, 'disagreement').html, abs: view('home', 'b', 'b-ledger', surface, 'abstention').html });
    for (const surface of WIDE) {
      const { dis, abs } = cells(surface), az = tableRow(abs, 'AstraZeneca'), ap = tableRow(abs, 'Apple'), apd = tableRow(dis, 'Apple'), rel = tableRow(dis, 'Reliance');
      must(az.includes('+1.5%') && az.includes('+6.0%') && !az.includes('+3.0%') && az.includes('Abstained'), `${surface}: AstraZeneca abstains at 6 months only`);
      must(ap.includes('+3.1%') && ap.includes('+6.2%') && !ap.includes('+12.4%') && ap.includes('Abstained'), `${surface}: Apple abstains at 12 months only`);
      must(!apd.includes('+3.1%') && apd.includes('Split') && apd.includes('+6.2%') && apd.includes('+12.4%'), `${surface}: Apple splits at 3 months only`);
      // narrowed in MP-191: the owner picked "Conflict at every long horizon" (OWN-32), so Reliance disagrees at 3, 6 and 12 months
      must(!rel.includes('+3.7%') && !rel.includes('+7.4%') && !rel.includes('+14.8%') && (rel.match(/Disagree/g) || []).length >= 3, `${surface}: Reliance disagrees at 3, 6 and 12 months`);
      must(words(rel).includes('−12.0% to +24.9%') && words(apd).includes('−8.2% to +13.8%'), `${surface}: a split horizon keeps its range`);
    }
    // the rows follow the horizon they show, and so does the action
    for (const surface of ['iphone', 'web']) {
      const a12 = view('home', 'a', 'a-12m', surface, 'abstention');
      lacks(a12.text, /\+12\.4%/, `${surface}: Apple's abstained 12 months`);
      has(a12.text, /\+6\.0%/, `${surface}: AstraZeneca stands at 12 months`);
      const a6 = view('home', 'a', 'a-portfolio', surface, 'abstention');
      has(a6.text, /\+6\.2%/, `${surface}: Apple stands at 6 months`);
      must(!a6.html.includes('+3.0%'), `${surface}: AstraZeneca's abstained 6 months`);
      const a3 = pressed('home', 'a', 'a-portfolio', surface, 'disagreement', { hz: '0' });
      lacks(a3.html, /\+3\.1%/, `${surface}: Apple's split 3 months`);
      has(a3.text, /Models split/i, `${surface}: Apple is not flagged at 3 months`);
      has(a3.text, /Rules and models disagree · no action|Disagree · no action/, `${surface}: Reliance is not flagged at 3 months (OWN-32)`);
    }
    // no other name: read off the rendered rows of Home and Forecast
    flaggedOnly({ each, view, must });
    // the root and the board agree with the table
    each({ journey: 'forecast', option: 'b', screen: 'b-forecasts', state: 'disagreement', surface: 'web' }, (v) => {
      must(tableRow(v.html, 'JPM').includes('+6.4%'), 'JPM stands');
      must(!tableRow(v.html, 'RELIANCE').includes('+7.4%') && !tableRow(v.html, 'RELIANCE').includes('+3.7%'), 'Reliance disagrees at 3 and 6 months (OWN-32)');
    });
    each({ journey: 'home', option: 'a', screen: 'a-board', state: 'abstention' }, (v, at) => { has(v.text, /Apple lost its growth and protection parts when the model abstained at 12 months/, `${at.surface}: the board`); lacks(v.html, />AAPL<span class="sr">, you hold it<\/span>[^]{0,120}<b>\d\d<\/b>/, `${at.surface}: Apple keeps a score with a part missing`); });
    each({ journey: 'home', option: 'a', screen: 'a-board', state: 'disagreement' }, (v, at) => { has(v.text, /The models split on Apple at 3 months, so it lost its growth and protection parts/, `${at.surface}: the board`); lacks(v.html, />AAPL<span class="sr">, you hold it<\/span>[^]{0,120}<b>\d\d<\/b>/, `${at.surface}: Apple keeps a score over a split horizon (OWN-17)`); });
    for (const [o, screen] of [['a', 'a-segment'], ['b', 'b-explore']]) {
      each({ journey: 'home', option: o, screen, state: 'abstention' }, (v, at) => has(v.text, /Apple dropped out/, `${screen} ${at.surface}: the list`));
      each({ journey: 'home', option: o, screen, state: 'disagreement' }, (v, at) => has(v.text, /Apple dropped out\. The models split on it at 3 months/, `${screen} ${at.surface}: the list`));
    }
  },
  'R2-h12': ({ each, has, lacks }) => {
    each({ journey: 'home', option: 'a', screen: 'a-action', state: 'noModel' }, (v, at) => { has(v.text, /no label, rather than a guess/, `${at.surface}: the sheet`); lacks(v.html, /b-trim/, `${at.surface}: Trim behind the sheet`); has(v.text, /No label/, `${at.surface}: the row`); });
    each({ journey: 'home', option: 'a', screen: 'a-action', state: 'empty' }, (v, at) => { has(v.text, /Nothing is suggested for NVIDIA today/, `${at.surface}: the sheet`); lacks(v.html, /b-trim/, `${at.surface}: Trim behind the sheet`); });
    each({ journey: 'home', option: 'b', screen: 'b-open', state: 'noModel' }, (v, at) => lacks(v.html, /b-trim/, `${at.surface}: Trim beside the unclassified sheet`));
    each({ journey: 'home', option: 'b', screen: 'b-open', state: 'empty' }, (v, at) => { has(v.text, /No holdings yet/, `${at.surface}: the empty ledger`); lacks(v.text, /NVIDIA/, `${at.surface}: a sheet with no holdings`); });
    for (const [o, screen] of [['a', 'a-portfolio'], ['b', 'b-ledger'], ['a', 'a-brief'], ['b', 'b-brief']]) each({ journey: 'home', option: o, screen, state: 'noModel' }, (v, at) => { has(v.text, /No label/, `${screen} ${at.surface}: the row`); lacks(v.html, /b-trim/, `${screen} ${at.surface}: Trim on a row the sheet calls unclassified`); });
  },
  'R2-h13': ({ each, view, has, must }) => {
    // narrowed in MP-186: the last good and saved figures are from 22:15, when the US run lands, and only the US run failed (ADM-10, ADM-22)
    const words_ = { default: /Spot quotes/, loading: /The last good quotes from 22:15/, empty: /No top 5 yet/, error: /US: last good run Mon 22:15 · cutoff 22:00/, stale: /Gold and silver are not affected/, offline: /Quotes from 22:15, saved on this device/, noModel: /No model can cover these yet/ };
    for (const [state, re] of Object.entries(words_)) for (const [o, screen] of [['a', 'a-seg-metals'], ['b', 'b-top5-metals']]) each({ journey: 'home', option: o, screen, state }, (v, at) => {
      has(v.text, re, `${screen} ${at.surface} ${state}: ${re}`);
      has(v.text, /\$2,684\.20/, `${screen} ${at.surface} ${state}: the price is gone`);
    });
    for (const state of ['disagreement', 'abstention']) must(view('home', 'b', 'b-top5-metals', 'iphone', state).na && view('home', 'a', 'a-seg-metals', 'iphone', state).na === view('home', 'b', 'b-top5-metals', 'iphone', state).na, `${state}: the two options do not both say it does not apply`);
    each({ journey: 'home', option: 'b', screen: 'b-top5-metals', state: 'empty' }, (v, at) => must(!/ranked after each daily/.test(v.text), `${at.surface}: metals are not ranked after a run`));
  },
  'R2-h14': ({ each, has }) => {
    const want = { default: /quote 21:00 · Source open \(SCI-D08\)/, error: /quote Mon 21:00 · Source open \(SCI-D08\)/, offline: /quote saved 22:15 · Source open \(SCI-D08\)/ };   // narrowed in MP-186: saved after the US run lands, 22:15 (ADM-22)
    for (const [state, re] of Object.entries(want)) for (const [o, screen] of [['a', 'a-seg-metals'], ['b', 'b-top5-metals']]) each({ journey: 'home', option: o, screen, state }, (v, at) => has(v.text, re, `${screen} ${at.surface} ${state}: the row has no quote time`));
    for (const state of STATES) each({ journey: 'home', option: 'a', screen: 'a-board', state }, (v, at) => has(v.text, /Quote [^·]+ · Source open \(SCI-D08\)/i, `${at.surface} ${state}: the tile has no quote time`));
    each({ journey: 'forecast', option: 'a', screen: 'a-instrument', state: 'noModel' }, (v, at) => has(v.text, /Quote 21:00 · Source open \(SCI-D08\)/, `${at.surface}: gold's head`));
  },
  'R2-h15': ({ each, has, must }) => {
    each({ journey: 'forecast', option: 'b', screen: 'b-ladder', state: ['default', 'stale', 'disagreement', 'abstention'] }, (v, at) => {
      const rows = v.html.split(/(?=<div class="fc-lad)/).filter((r) => r.includes('data-dossier'));
      must(rows.length === 3, `${at.surface} ${at.state}: ${rows.length} rows open the dossier`);
      for (const r of rows) { must(/role="button" tabindex="0"/.test(r), `${at.surface} ${at.state}: a row is not a control`); must(r.includes('#i-chev-r'), `${at.surface} ${at.state}: a row has no chevron`); }
      has(v.text, /Open a row for its dossier: forecast, proof, views and evidence/, `${at.surface} ${at.state}: the route is not said`);
    });
    // the row Disagreement sends you to shows both
    for (const surface of ALL) {
      const v = pressed('forecast', 'b', 'b-forecast', surface, 'disagreement', { hz: '0', t: 'AAPL' });
      must(head(v.html) === 'Apple', `${surface}: the dossier left the ladder's name`);
      has(v.text, /R2-HGB v3, 80% range/, `${surface}: one side is missing`);
      has(v.text, /Baseline, 80% range/, `${surface}: one side is missing`);
    }
  },
  'R2-h16': ({ each, has }) => {
    // narrowed in MP-186: Apple reads the US run, 22:15 and 22:00; Stale shows HSBC, held from Monday's UK run, 17:50 and 17:35 (ADM-10, ADM-22)
    const as = { error: /Last good run Mon 22:15/, stale: /Held from Mon 17:50/ };
    each({ journey: 'forecast', option: 'a', screen: 'a-short', state: STATES.filter((s) => s !== 'empty'), surface: ALL }, (v, at) => {
      has(v.text, as[at.state] || /As of 22:15 London/, `${at.surface} ${at.state}: no as-of`);
      has(v.text, at.state === 'stale' ? /Data cutoff 17:35/ : /Data cutoff 22:00/, `${at.surface} ${at.state}: no cutoff`);
      has(v.text, /R2-HGB v3/, `${at.surface} ${at.state}: no model`);
    });
  },
  'R2-h17': ({ each, must }) => {
    for (const journey of ['home', 'forecast']) each({ journey, state: ['default', 'noModel', 'abstention'] }, (v, at) => must(!/<tr[^>]*role="button"/.test(v.html), `${at.screen} ${at.surface}: a row is a button, and the table is lost`));
    for (const [journey, o, screen, btn, n] of [['home', 'a', 'a-portfolio', 'home-rowbtn', 7], ['home', 'b', 'b-ledger', 'home-rowbtn', 7], ['forecast', 'b', 'b-forecasts', 'fc-rowbtn', 11]]) each({ journey, option: o, screen, state: 'default', surface: ['ipad', 'web', 'pwa'] }, (v, at) => {
      if (journey === 'home' && at.surface === 'iphone') return;
      must(count(v.html, new RegExp(`<td><button class="${btn}" type="button">`, 'g')) >= n, `${screen} ${at.surface}: a row has no real control in its cell`);
    });
    each({ journey: 'home', option: 'a', screen: 'a-segment', state: 'default', surface: 'web' }, (v) => must(count(v.html, /<td><button class="home-rowbtn"/g) >= 4, 'a list row has no real control'));
  },
  'R2-h18': ({ has, lacks }) => {
    // what a press draws, frame by frame; R2-h5 proves the flip stays. That a press reaches render() needs a browser, so the walker presses each switch.
    const h3 = pressed('forecast', 'a', 'a-instrument', 'iphone', 'default', { hz: '0' }), h12 = pressed('forecast', 'a', 'a-instrument', 'iphone', 'default', { hz: '2' });
    has(h3.text, /3-month forecast · AAPL/, 'a 3M press does not draw 3 months');
    has(h12.text, /12-month forecast · AAPL/, 'a 12M press does not draw 12 months');
    has(pressed('forecast', 'a', 'a-3m', 'iphone', 'default', { hz: '1' }).text, /6-month forecast|Horizon 3 May 2027/, 'a 6M press does not draw 6 months');
    has(pressed('forecast', 'a', 'a-instrument', 'iphone', 'default', { mode: '1' }).text, /10th percentile/, 'Technical does not draw the working');
    lacks(pressed('forecast', 'a', 'a-technical', 'iphone', 'default', { mode: '0' }).text, /10th percentile/, 'Simple keeps the working');
    has(pressed('forecast', 'a', 'a-instrument', 'iphone', 'abstention', { hz: '0' }).text, /3-month forecast · AZN/, 'AstraZeneca does not carry to 3 months');
    has(pressed('forecast', 'a', 'a-instrument', 'iphone', 'disagreement', { hz: '2' }).text, /12-month forecast · RELIANCE/, 'Reliance does not carry to 12 months');
    has(pressed('forecast', 'a', 'a-12m', 'iphone', 'abstention', { hz: '1' }).text, /6 months stands/, 'Apple does not carry to 6 months');
    has(pressed('home', 'a', 'a-portfolio', 'iphone', 'default', { hz: '2' }).text, /· 12M/, 'Home does not redraw at 12 months');
    has(pressed('home', 'b', 'b-ledger', 'iphone', 'default', { hz: '0' }).text, /3M/, 'the ledger does not redraw at 3 months');
    has(pressed('forecast', 'a', 'a-forecasts', 'web', 'default', { hz: '2' }).text, /\+12\.4%/, 'the root does not redraw at 12 months');
  },
  'R2-h20': ({ each, has, lacks }) => {
    for (const screen of ['a-brief', 'b-brief']) each({ journey: 'home', screen, state: 'error' }, (v, at) => { has(v.text, /code wrote the words too/, `${screen} ${at.surface}: the line`); lacks(v.text, /Claude writes the words/, `${screen} ${at.surface}: Claude on a brief code wrote`); });
  },
  'R2-h25': ({ each, has, lacks }) => {
    each({ journey: 'forecast', option: 'a', screen: 'a-12m', state: 'default' }, (v, at) => { has(v.text, /Proof · 12-month task/, `${at.surface}: the 6-month record under a 12-month forecast`); has(v.text, /over 26 scored forecasts/, `${at.surface}: the 12-month record`); lacks(v.text, /Observed 79%/, `${at.surface}: the 6-month figure`); });
    each({ journey: 'forecast', option: 'a', screen: 'a-instrument', state: 'default' }, (v, at) => has(v.text, /Proof · 6-month task/, `${at.surface}: the 6-month proof moved`));
    for (const surface of PHONES) {
      const v = pressed('forecast', 'b', 'b-forecast', surface, 'default', { hz: '2' });
      has(v.text, /Proof · 12-month task/, `b-forecast ${surface}: the 6-month proof under 12 months`);
      lacks(v.text, /over 52 scored|Observed 79%|Coverage 79%|Direction, 52 scored/, `b-forecast ${surface}: a 6-month figure under 12 months`);
    }
    for (const surface of ALL) {
      const v = pressed('forecast', 'b', 'b-proof', surface, 'default', { hz: '2' });
      has(v.text, /Proof · 12-month task/, `b-proof ${surface}: the 6-month proof`);
      has(v.text, /over 26 scored forecasts/, `b-proof ${surface}: the 12-month record`);
      has(v.text, /Exploratory/, `b-proof ${surface}: 12 months is not exploratory`);
      has(v.text, /Coverage 77%/, `b-proof ${surface}: the coverage is not 12 months'`);
      has(v.html, /26 scored forecasts: 20 inside their 80% range, 6 outside/, `b-proof ${surface}: the dots are not 12 months'`);
      lacks(v.text, /Observed 79%|Coverage 79%|over 52 scored|Direction, 52 scored|first due 1 Apr 2027/, `b-proof ${surface}: a 6-month figure under 12 months`);
    }
  },
  'R3-h1': ({ must, has, lacks }) => {
    // a row's name holds on every frame it can turn to, at every horizon, and the state's own subject does not creep back in
    for (const surface of ALL) for (const [state, other] of [['disagreement', /Reliance|RELIANCE/], ['abstention', /AstraZeneca|\bAZN\b/]]) for (const hz of ['0', '1', '2']) {
      for (const [o, s] of [['a', 'a-instrument'], ['a', 'a-technical'], ['b', 'b-forecast'], ['b', 'b-ladder'], ['b', 'b-technical']]) {
        const v = pressed('forecast', o, s, surface, state, { hz, t: 'AAPL' });
        must(head(v.html) === 'Apple', `${s} ${surface} ${state} at ${hz}: the row's Apple became ${head(v.html)}`);
        lacks(v.text, other, `${s} ${surface} ${state} at ${hz}: another name on Apple's frame`);
      }
      for (const [o, s] of [['a', 'a-proof'], ['a', 'a-views'], ['a', 'a-evidence'], ['b', 'b-proof'], ['b', 'b-views'], ['b', 'b-evidence']]) {
        const v = pressed('forecast', o, s, surface, state, { hz, t: 'AAPL' });
        has(v.html, /aria-label="Back to AAPL"/, `${s} ${surface} ${state} at ${hz}: back leaves Apple`);
        lacks(v.text, other, `${s} ${surface} ${state} at ${hz}: another name on Apple's frame`);
      }
    }
    // a marked horizon stays marked on its tabs: no range for the abstained one, no median for the split one
    for (const surface of ALL) for (const [o, s] of [['a', 'a-proof'], ['a', 'a-views'], ['a', 'a-evidence'], ['b', 'b-proof'], ['b', 'b-views'], ['b', 'b-evidence']]) {
      lacks(pressed('forecast', o, s, surface, 'abstention', { hz: '2', t: 'AAPL' }).text, /\+12\.4%|\+33\.9%/, `${s} ${surface}: Apple's abstained 12 months`);
      lacks(pressed('forecast', o, s, surface, 'disagreement', { hz: '0', t: 'AAPL' }).text, /\+3\.1%/, `${s} ${surface}: Apple's split 3 months`);
    }
    // the horizon that stands reads as Ready, at that horizon
    has(pressed('forecast', 'b', 'b-views', 'web', 'abstention', { hz: '1', t: 'AAPL' }).text, /Median, 6M \+6\.2%/, 'Apple at 6 months stands on Views');
    // a name the state draws nowhere gives way: a frame remembered from Ready cannot put Apple over HSBC's stale banner, or over gold
    must(head(pressed('forecast', 'b', 'b-forecast', 'web', 'stale', { t: 'AAPL' }).html) === 'HSBC', 'Apple over the stale banner');
    must(head(pressed('forecast', 'b', 'b-forecast', 'web', 'noModel', { t: 'AAPL' }).html) === 'Gold', 'Apple over gold');
  },
  'R3-h3': ({ each, view, has, lacks, must }) => {
    // Empty is no holdings: the daily run has happened, so Tiles and Ledger draw the same lists, and neither marks a holding
    for (const surface of ALL) {
      for (const [a, b] of [['a-portfolio', 'b-ledger'], ['a-12m', 'b-12m']]) for (const state of STATES) {
        const left = view('home', 'a', a, surface, state).html, right = view('home', 'b', b, surface, state).html;
        const l = ranked(techTile(left)), r = ranked(techCard(right));
        must(l.length >= 3 && l.join() === r.join(), `${a} ${surface} ${state}: Tiles read ${l}, Ledger reads ${r}`);
      }
      for (const screen of ['b-ledger', 'b-12m']) {
        const v = view('home', 'b', screen, surface, 'empty');
        lacks(v.text, /You hold it/, `${screen} ${surface}: a holding marked with no holdings`);
        lacks(v.text, /no list and no score/, `${screen} ${surface}: says no list while its partner draws them`);
      }
      // Empty on the Segments tab is the first morning, before any run: both options say no list
      has(view('home', 'a', 'a-board', surface, 'empty').text, /First list after the first daily run/, `a-board ${surface}: a list before the first run`);
      has(view('home', 'b', 'b-top5', surface, 'empty').text, /Until the first run, no list and no score exists/, `b-top5 ${surface}: a list before the first run`);
    }
  },
  'R3-h4': ladderHeads,
  'R3-h5': flaggedOnly,
  'R3-h6': ({ has, lacks }) => {
    for (const surface of ALL) {
      for (const [s, re] of [['b-forecast', /Horizon 3 Nov 2027/], ['b-proof', /Proof · 12-month task/], ['b-views', /Median, 12M \+12\.4%/], ['b-evidence', /\+12\.4% at 12M/]]) {
        const v = pressed('forecast', 'b', s, surface, 'default', { hz: '2' });
        has(v.html, />12 months<\/span>/, `${s} ${surface}: the title leaves 12 months`);
        lacks(v.html, />6 months<\/span>/, `${s} ${surface}: the title reads 6 months`);
        has(v.text, re, `${s} ${surface}: the body is not at 12 months`);
      }
      const e = pressed('forecast', 'b', 'b-evidence', surface, 'default', { hz: '2' }), m = pressed('forecast', 'b', 'b-views', surface, 'default', { hz: '2' });
      has(e.text, /matures 3 Nov 2027/, `${surface}: the outcome date`);
      has(e.text, /AAPL · 12-month return/, `${surface}: the record's task`);
      has(m.text, /Held 77% of 26 scored in walk-forward testing\. Exploratory/, `${surface}: the model view`);
    }
    for (const surface of WIDE) for (const s of ['a-proof', 'a-views']) has(pressed('forecast', 'a', s, surface, 'default', { hz: '2' }).html, /<span class="chip">12 months<\/span>/, `${s} ${surface}: the chip stays on 6 months`);
  },
  'R3-h7': ({ each, must, has, lacks }) => {
    // the tile has room for a mark and hidden words; the row says it where it can be read. Both say what is true of Apple.
    // Narrowed in MP-191: a split takes Apple off its list ("Both parts go", OWN-17), so the tile names the gap and the row reads Not ranked.
    for (const screen of ['a-board', 'a-portfolio']) each({ journey: 'home', option: 'a', screen, state: 'disagreement' }, (v, at) => {
      const t = techTile(v.html);
      has(t, /class="tk">AAPL split<\/span><b>–<\/b>/, `${screen} ${at.surface}: the tile`);
      lacks(t, /rules and models disagree/i, `${screen} ${at.surface}: the conflict is Reliance's`);
    });
    each({ journey: 'home', option: 'b', screen: 'b-top5', state: 'disagreement' }, (v, at) => {
      const r = techCard(v.html).split(/(?=<div class="t5r)/).find((x) => /class="tt">AAPL\b/.test(x)) || '';
      must(r, `${at.surface}: no Apple row`);
      has(words(r), /Not ranked/, `${at.surface}: the row does not say it in visible text`);
      lacks(r, /rules and models disagree/i, `${at.surface}: the conflict is Reliance's`);
    });
  },
  'R3-h8': ({ each, has, lacks, must }) => {
    const heads = (html) => [...html.matchAll(/<th[^>]*>([^]*?)<\/th>/g)].map((m) => m[1]);
    for (const [screen, want] of [['b-ledger', 'Action, 6M'], ['b-12m', 'Action, 12M']]) each({ journey: 'home', option: 'b', screen, surface: WIDE, state: STATES.filter((s) => s !== 'empty') }, (v, at) => must(heads(v.html).includes(want), `${screen} ${at.surface} ${at.state}: the Action column names no horizon: ${heads(v.html).join(' | ').slice(0, 160)}`));
  },
  'R3-h9': ({ each, has, lacks }) => {
    for (const screen of ['a-brief', 'b-brief']) {
      // narrowed in MP-191: both names lose their action ("No score, no action", OWN-20), so the banner counts two
      each({ journey: 'home', screen, state: 'disagreement' }, (v, at) => { has(v.text, /Two conflicts move actions\./, `${screen} ${at.surface}: the banner`); lacks(v.text, /One conflict/, `${screen} ${at.surface}: one conflict, then a second`); });
      each({ journey: 'home', screen, state: 'abstention' }, (v, at) => { has(v.text, /Two abstentions move actions\./, `${screen} ${at.surface}: the banner`); lacks(v.text, /One abstention/, `${screen} ${at.surface}: one abstention, then a second`); });
    }
    each({ journey: 'home', screen: 'a-portfolio', state: 'abstention' }, (v, at) => { has(v.text, /Two holdings abstained\./, `${at.surface}: the holdings`); has(v.text, /3 actions · 2 abstentions/, `${at.surface}: the pill counts another figure`); });
    each({ journey: 'home', screen: 'a-portfolio', state: 'disagreement' }, (v, at) => { has(v.text, /Two holdings are split\./, `${at.surface}: the holdings`); has(v.text, /3 actions · 2 conflicts/, `${at.surface}: the pill counts another figure`); });
  },
  'R3-h10': ({ each, lacks }) => {
    each({ journey: 'home', state: 'noModel' }, (v, at) => lacks(v.html, /b-trim/, `${at.screen} ${at.surface}: Trim, with action thresholds unapproved`));
  },
  /* the late-price rule cites DATA-DEC-02 on every price use, on both sides of a flip. MP40-Q6 stays on billing and cost freshness only. */
  'R3-h-late': ({ each, view, has, lacks, must }) => {
    for (const journey of ['home', 'forecast']) each({ journey }, (v, at) => {
      lacks(v.text.replace(/Billing 39 h old · Proposed · MP40-Q6/g, ''), /MP40-Q6/, `${at.screen} ${at.surface} ${at.state}: a price use cites the billing question`);
      if (LATE_RULE.test(v.text)) has(v.text, /Proposed · DATA-DEC-02/, `${at.screen} ${at.surface} ${at.state}: states the rule, unlabelled: ${(v.text.match(LATE_RULE) || [])[0]}`);
    });
    // narrowed in MP-186: "Pill on every Home" (OWN-06) takes the row off Home. The pill states billing's age, as Cost's own Home always has, and no
    // rule, so it carries no label; Cost, one tap on, states the 36-hour rule with Proposed · MP40-Q6 (R2-s6, the cost lanes' checks).
    for (const screen of ['a-portfolio', 'b-ledger']) each({ journey: 'home', screen, state: 'stale' }, (v, at) => has(v.text, /billing 39 h old/, `${screen} ${at.surface}: the pill drops billing's age`));
    for (const state of ['default', 'stale']) for (const journey of ['home', 'forecast']) each({ journey, state }, (v, at) => {
      for (const f of flips(v.html)) {
        const [, oo, ss] = f.split('|'), other = view(journey, oo, ss, at.surface, state);
        if (/Proposed · DATA-DEC-02/.test(v.text) && LATE_RULE.test(other.text)) has(other.text, /Proposed · DATA-DEC-02/, `${at.screen} ${at.surface} ${state}: the label goes on the turn to ${ss}`);
      }
    });
  },
  /* ---------- round 4. R4-h1 needs a press, so it lives in scripts/design_journeys_press.mjs. ---------- */
  'R4-h2': ({ each, has, lacks }) => {
    // no count and no late holding over "No holdings yet"
    for (const [o, screen] of [['a', 'a-portfolio'], ['a', 'a-12m'], ['b', 'b-ledger'], ['b', 'b-12m']]) each({ journey: 'home', option: o, screen, state: 'empty', surface: ALL }, (v, at) => {
      has(v.text, /No holdings yet/, `${screen} ${at.surface}: not the empty ledger`);
      lacks(v.text, /\d+ holdings|HSBC late/, `${screen} ${at.surface}: a holding named over no holdings`);
    });
    // a-action's Empty is a holding with no action band: its rows stand, so HSBC is still late on the chip, as on its own row
    each({ journey: 'home', option: 'a', screen: 'a-action', state: 'empty' }, (v, at) => {
      has(v.text, /Late: last price 14:10|14:10 Yahoo · late/, `a-action ${at.surface}: HSBC's row`);
      has(v.text, /HSBC late/, `a-action ${at.surface}: the chip calls Yahoo fresh over a late row`);
    });
    for (const screen of ['b-ledger', 'b-12m']) {
      each({ journey: 'home', option: 'b', screen, state: 'empty', surface: PHONES }, (v, at) => has(v.text, /Holdings/, `${screen} ${at.surface}: the row lost its label`));
      each({ journey: 'home', option: 'b', screen, state: 'default', surface: PHONES }, (v, at) => has(v.text, /7 holdings/, `${screen} ${at.surface}: the count goes where there are holdings`));
    }
  },
  'R4-h3': ({ has, lacks }) => {
    // a 200-day average does not depend on the horizon: Reliance reads Pause on every tab in Disagreement, and its compare row and Claude say the same
    for (const surface of ALL) for (const [o, s] of [['a', 'a-views'], ['b', 'b-views']]) for (const hz of ['0', '1', '2']) for (const extra of [{ hz }, { hz, t: 'RELIANCE' }]) {
      const { text } = pressed('forecast', o, s, surface, 'disagreement', extra), where = `${s} ${surface} at ${hz}${extra.t ? ' from the row' : ''}`;
      has(text, /Reads Pause/, `${where}: the rules do not read Pause`);
      has(text, /Price is below its 200-day average/, `${where}: the rules' body`);
      has(text, /Drawdown of 11% from its high/, `${where}: the drawdown`);
      has(text, /The rules read Pause/, `${where}: Claude`);
      lacks(text, /above its 200-day|Reads Hold|agree on direction|Together Agree|Rules Hold/, `${where}: the rules change with the horizon`);
      if (PHONES.includes(surface)) has(text, /Rules Pause Models \S+(?: up)? Together Disagree/, `${where}: the compare row`);
    }
    // only Reliance: Apple's rules read Hold on every tab, and Ready is unchanged
    for (const surface of ALL) for (const hz of ['0', '1', '2']) {
      const apple = pressed('forecast', 'b', 'b-views', surface, 'disagreement', { hz, t: 'AAPL' }).text;
      has(apple, /Reads Hold/, `Apple ${surface} at ${hz}: Reliance's Pause reached Apple`);
      lacks(apple, /below its 200-day|Drawdown of 11%/, `Apple ${surface} at ${hz}: Reliance's rules on Apple's frame`);
      has(pressed('forecast', 'b', 'b-views', surface, 'default', { hz }).text, /Reads Hold/, `Ready ${surface} at ${hz}: the rules moved`);
    }
  },
  'R4-h5': ({ must }) => {
    // what the shell and a redraw both ask: a frame's name is the horizon it shows. The press itself is scripts/design_journeys_press.mjs.
    for (const [j, o, s, hz0, name] of [['forecast', 'a', 'a-3m', 0, (m) => `At ${m} months`], ['forecast', 'a', 'a-12m', 2, (m) => `At ${m} months`], ['home', 'a', 'a-12m', 2, (m) => `Portfolio at ${m} months`], ['home', 'b', 'b-12m', 2, (m) => `Ledger at ${m} months`]]) {
      const sc = screenOf(j, o, s);
      must(typeof sc.titleFor === 'function', `${j} ${s}: no titleFor, so a press keeps the old name`);
      must(sc.titleFor({}) === sc.title && sc.title === name([3, 6, 12][hz0]), `${j} ${s}: an unpressed frame reads ${sc.titleFor({})}`);
      [3, 6, 12].forEach((m, i) => { for (const hz of [String(i), i]) must(sc.titleFor({ hz }) === name(m), `${j} ${s} at ${hz}: reads ${sc.titleFor({ hz })}`); });
    }
  },
  'R4-h6': ({ has, lacks, must }) => {
    // an abstained horizon has an abstention record, not a current forecast
    for (const surface of ALL) for (const [o, s] of [['a', 'a-evidence'], ['b', 'b-evidence']]) for (const [extra, task] of [[{ hz: '2', t: 'AAPL' }, /AAPL · 12-month return/], [{ hz: '1' }, /AZN · 6-month return/]]) {
      const { text } = pressed('forecast', o, s, surface, 'abstention', extra), where = `${s} ${surface} ${extra.t || 'AZN'}`;
      has(text, /Abstention record/, `${where}: no abstention record`);
      has(text, task, `${where}: the record's task`);
      lacks(text, /Forecast v\d|Current|Replaces|kept, annotated/, `${where}: a version beside a chain that abstained`);
      must(recordLink(text), `${where}: no link`);
    }
    // the horizon that stands keeps its forecast record
    has(pressed('forecast', 'b', 'b-evidence', 'web', 'abstention', { hz: '1', t: 'AAPL' }).text, /Forecast v3 Current/, 'Apple at 6 months stands');
    // one record, one link: no two share an id, and a record keeps its id across option and device
    const seen = new Map();
    for (const [state, t, hzs, what] of [['default', 'AAPL', ['0', '1', '2'], 'v3'], ['disagreement', 'RELIANCE', ['0', '1', '2'], 'v3'], ['abstention', 'AZN', ['0', '2'], 'v3'], ['abstention', 'AZN', ['1'], 'abstained'], ['abstention', 'AAPL', ['2'], 'abstained'], ['stale', 'HSBA', ['0', '1', '2'], 'v2']]) for (const hz of hzs) {
      const ids = new Set(ALL.flatMap((surface) => ['a-evidence', 'b-evidence'].map((s) => recordLink(pressed('forecast', s[0], s, surface, state, { hz, t }).text))));
      must(ids.size === 1 && [...ids][0], `${t} at ${hz} ${state}: links ${[...ids].join(', ')}`);
      const id = [...ids][0], me = `${t} ${hz} ${what}`;
      must(!seen.has(id) || seen.get(id) === me, `${me} shares ${id} with ${seen.get(id)}`);
      seen.set(id, me);
    }
    must(seen.size === 13, `${seen.size} records, expected 13`);
  },
  'R4-h7': ({ screens, view, must }) => {
    // every Home frame says which Empty it means, so a tile that shows a list and the frame it opens can both be true
    const meaning = (s) => (/metals$/.test(s) ? /Empty here means no list, as in every state\./ : ['a-portfolio', 'a-12m', 'a-launch', 'b-ledger', 'b-12m', 'b-launch'].includes(s) ? /Empty here means no holdings yet: the lists still show, because a ranking needs no holdings \(MP-135\)\./
      // Narrowed for MP40-Q11b, "Weekdays only": the weekend no longer waits on MP40-Q11, and its own screen says what Empty means there
      : /brief$/.test(s) ? /Empty is the first morning\. There is no brief at the weekend, and No brief at the weekend says why \(MP40-Q11b\)\./ : /weekend$/.test(s) ? /Empty here means no holdings yet, so the first brief comes on the first weekday after they are in\./ : s === 'a-action' ? /Empty here means a holding with no action band\./ : s === 'b-open' ? /Empty here means no holdings yet, so no row opens\./
        : /search$/.test(s) ? /Empty here means a search that finds nothing\./ : /Empty here means the first morning, before any daily run, so no list exists yet\./);
    for (const o of ['a', 'b']) {
      const all = screens('home', o);
      must(all.length >= 8, `home ${o}: ${all.length} screens`);
      for (const s of all) must(meaning(s).test(view('home', o, s).note || ''), `${s}: the note does not say which Empty it means: ${(view('home', o, s).note || '').slice(-90)}`);
    }
  },
  'R4-h8': ({ each, must }) => {
    const names = listedNames(each);
    must(names.size >= 39, `only ${names.size} listed names were found`);
    for (const state of ['disagreement', 'abstention']) {
      const others = [...names].filter(([t]) => !(t in OUTS[state])).flatMap(([t, n]) => [t, n]), said = saidOut(others), named = new RegExp(anyOf(others));
      for (const journey of ['home', 'forecast']) each({ journey, state }, (v, at) => {
        const m = v.text.match(said);
        must(!m, `${at.screen} ${at.surface} ${state}: ${m && m[0]}`);
        for (const line of sentences(v.html)) if (SAYS_OUT.test(line)) { const n = line.match(named); must(!n, `${at.screen} ${at.surface} ${state}: "${line.slice(0, 90)}" puts ${n && n[0]} out`); }
      });
    }
  },
  'R4-h9': ({ each, has, lacks, must }) => {
    // every REC value on a pressed render, and no 6-month value under another horizon
    for (const surface of ALL) for (const [o, s] of [['a', 'a-proof'], ['b', 'b-proof'], ...(PHONES.includes(surface) ? [['b', 'b-forecast']] : [])]) {
      for (const [hz, rec] of [['0', REC3], ['1', REC6], ['2', REC12]]) {
        const { text } = pressed('forecast', o, s, surface, 'default', { hz });
        for (const want of RECORD(rec)) must(text.includes(want), `${s} ${surface} at ${hz}: no "${want}"`);
        if (rec !== REC6) for (const six of RECORD(REC6)) must(!text.includes(six), `${s} ${surface} at ${hz}: the 6-month "${six}"`);
      }
    }
    for (const surface of ALL) for (const [hz, cal] of [['0', '0.98'], ['1', '0.96'], ['2', '0.91']]) {
      const { text } = pressed('forecast', 'a', 'a-instrument', surface, 'default', { hz, mode: '1' });
      has(text, new RegExp(`Calibration slope ${cal}`), `${surface} at ${hz}: the technical card`);
    }
    // the baseline shows where a horizon is split: 12 months never is
    for (const surface of ALL) for (const [o, s] of [['a', 'a-proof'], ['b', 'b-proof']]) {
      const apple = pressed('forecast', o, s, surface, 'disagreement', { hz: '0', t: 'AAPL' }).text, reliance = pressed('forecast', o, s, surface, 'disagreement', { hz: '1' }).text;
      for (const re of [/R2-HGB v3 · coverage 81%/, /Baseline · coverage 84%/, /R2-HGB v3 · error 4\.7 pts/, /Baseline · error 5\.6 pts/]) has(apple, re, `${s} ${surface}: Apple at 3 months lacks ${re}`);
      lacks(apple, /Baseline · coverage 83%|Baseline · error 10\.4 pts/, `${s} ${surface}: a 6-month baseline at 3 months`);
      for (const re of [/R2-HGB v3 · coverage 79%/, /Baseline · coverage 83%/, /R2-HGB v3 · error 8\.9 pts/, /Baseline · error 10\.4 pts/]) has(reliance, re, `${s} ${surface}: Reliance at 6 months lacks ${re}`);
      lacks(pressed('forecast', o, s, surface, 'disagreement', { hz: '2', t: 'AAPL' }).text, /Baseline · (coverage|error)|undefined/, `${s} ${surface}: a baseline at 12 months`);
    }
    // the four layout choices that held on nothing: the brief's ticker, figures first, the key's order, and the flip's name
    each({ journey: 'home', option: 'b', screen: 'b-brief', state: 'default' }, (v, at) => { for (const re of [/NVIDIA · NVDA/, /SPDR S&P 500 ETF Trust · SPY/, /HSBC · HSBA/]) has(v.text, re, `b-brief ${at.surface}: ${re}`); });
    each({ journey: 'home', option: 'a', screen: 'a-brief', state: 'default' }, (v, at) => lacks(v.text, /NVIDIA · NVDA/, `a-brief ${at.surface}: the ticker is the ledger's`));
    const before = (t, a, b) => t.includes(a) && t.includes(b) && t.indexOf(a) < t.indexOf(b);
    each({ journey: 'forecast', option: 'b', screen: 'b-scenarios', state: 'default' }, (v, at) => must(before(v.text, 'At 3 years', 'Scenarios · this holding'), `b-scenarios ${at.surface}: the figures do not lead`));
    each({ journey: 'forecast', option: 'a', screen: 'a-scenarios', state: 'default' }, (v, at) => must(before(v.text, 'Scenarios · this holding', 'At 3 years'), `a-scenarios ${at.surface}: the chart does not lead`));
    const order = ['6 months', '12 months', 'Next day', '5 sessions', '10 sessions', '10 sessions', '20 sessions', '20 sessions', 'All seven'];
    each({ journey: 'forecast', option: 'b', screen: 'b-hzstates', state: 'default' }, (v, at) => { const got = [...v.html.matchAll(/class="hzn">([^<]+)/g)].map((m) => m[1]); must(got.join() === order.join(), `b-hzstates ${at.surface}: ${got.join(', ')}`); });
    const flipsTo = (html, name) => new RegExp(`aria-label="Flip to ${name}" data-flip=`).test(html);
    for (const screen of ['a-proof', 'a-views', 'a-evidence']) each({ journey: 'forecast', option: 'a', screen, state: 'default' }, (v, at) => must(flipsTo(v.html, 'Dossier'), `${screen} ${at.surface}: a dossier tab is not called Dossier`));
    for (const state of ['disagreement', 'abstention']) each({ journey: 'forecast', option: 'a', screen: 'a-instrument', state }, (v, at) => must(flipsTo(v.html, 'Dossier'), `a-instrument ${at.surface} ${state}: it lands on the dossier`));
    each({ journey: 'forecast', option: 'a', screen: 'a-instrument', state: 'default' }, (v, at) => must(flipsTo(v.html, 'Ladder'), `a-instrument ${at.surface}: it lands on the ladder`));
  },
  'R4-h13': ({ must }) => {
    const card = (hz) => pressed('forecast', 'b', 'b-proof', 'web', 'default', { hz }).html.split('Hit rate never stands alone')[1] || '';
    must(/^<\/h4><span class="chip proposed"[^>]*><span class="dot"><\/span>Exploratory/.test(card('2')), 'the 12-month card has no Exploratory label');
    must(card('0') && !/^<\/h4><span class="chip/.test(card('0')) && !/^<\/h4><span class="chip/.test(card('1')), '3 and 6 months are not exploratory');
  },
  'R4-h14': ({ has, lacks }) => {
    for (const surface of ALL) for (const [hz, k, due, not] of [['0', 3, '1 Jan 2027', /No 6-month|No 12-month|1 Apr 2027/], ['1', 6, '1 Apr 2027', /No 3-month|No 12-month|1 Oct 2027/], ['2', 12, '1 Oct 2027', /No 3-month|No 6-month|1 Apr 2027/]]) {
      const { text } = pressed('forecast', 'b', 'b-proof', surface, 'empty', { hz });
      has(text, new RegExp(`No ${k}-month outcome has matured live`), `${surface} at ${hz}: the card's horizon`);
      has(text, new RegExp(`The first is due ${due}`), `${surface} at ${hz}: the card's date`);
      lacks(text, not, `${surface} at ${hz}: another horizon's words`);
    }
  },
  'R4-h15': ({ each, has, lacks }) => {
    for (const [o, screen] of [['a', 'a-proof'], ['b', 'b-proof']]) each({ journey: 'forecast', option: o, screen, state: 'stale' }, (v, at) => {
      has(v.text, /Live, matured 0/, `${screen} ${at.surface}: no live record`);
      has(v.text, /No live forecast has matured yet/, `${screen} ${at.surface}: the banner`);
      lacks(v.text, /matured forecast|One grade waits/, `${screen} ${at.surface}: a matured forecast, with none matured`);
    });
  },
  'R4-h17': ({ each, has, lacks }) => {
    // narrowed in MP-191: the owner answered MP-135 with "Both parts go" (OWN-17), so a split takes the score, on every list, and no Proposed label is left on it
    for (const [o, screen, line] of [['a', 'a-board', /growth and protection parts[^.]*\.? ?[^.]*shows as not ranked, with no action, and nothing fills the gap\. (Reliance|AstraZeneca) is on none of these lists\./], ['b', 'b-top5', /growth and protection parts[^.]*\.? ?[^.]*shows as not ranked, with no action, and nothing fills the gap\. (Reliance|AstraZeneca) is on none of these lists\./], ['a', 'a-segment', /is not ranked, carries no action, and nothing fills the gap\./], ['b', 'b-explore', /is not ranked, carries no action, and nothing fills the gap\./]]) for (const state of ['disagreement', 'abstention']) each({ journey: 'home', option: o, screen, state }, (v, at) => { has(v.text, line, `${screen} ${at.surface} ${state}: a score over a split horizon, as settled`); lacks(v.text, /Proposed · MP-135/, `${screen} ${at.surface} ${state}: MP-135 is answered`); });
  },
  'R4-h18': ({ has }) => {
    for (const surface of ALL) {
      has(pressed('forecast', 'a', 'a-views', surface, 'abstention', { hz: '2', t: 'AAPL' }).text, /The model abstained at 12 months\./, `a-views ${surface}: no horizon`);
      has(pressed('forecast', 'b', 'b-views', surface, 'abstention', { hz: '1' }).text, /The model abstained at 6 months\./, `b-views ${surface}: no horizon`);
    }
  },
  'R2-h23': ({ each, has }) => {
    each({ journey: 'home', option: 'b', screen: 'b-ledger', state: 'default', surface: WIDE }, (v, at) => has(v.text, /−9\.8% to \+21\.4%/, `${at.surface}: the range is rounded across the flip`));
  },
};
