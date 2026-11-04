// What each fixed finding of lane h (home and forecast) holds on the rendered screens (MP-62 rounds 1 and 2).
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
  const src = [...pageCss().matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((t) => t.includes('J.start();'));
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
      has(v.text, /Data cutoff 21:00/, `${screen} ${at.surface}: the cutoff is hidden`);
    });
  },
  'R1-h6': ({ each, has, lacks }) => {
    for (const journey of ['home', 'forecast']) each({ journey, state: 'error' }, (v, at) => lacks(v.text, /20:45/, `${at.screen} ${at.surface}: a second version, 20:45`));
    for (const [journey, screen] of [['home', 'a-portfolio'], ['home', 'b-ledger'], ['forecast', 'a-instrument'], ['forecast', 'b-ladder'], ['forecast', 'a-short'], ['forecast', 'a-forecasts']]) each({ journey, screen, state: 'error' }, (v, at) => {
      has(v.text, /Last good run Mon 21:15 · cutoff 21:00/, `${screen} ${at.surface}: not the last good run`);
      lacks(v.text, /As of 21:15 London/, `${screen} ${at.surface}: today's as-of on Monday's run`);
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
    each({ journey: 'home', screen: 'a-portfolio', state: 'disagreement' }, (v, at) => { has(v.text, /3 actions · 1 conflict shown/, `${at.surface}: the pill miscounts`); lacks(v.text, /2 actions/, `${at.surface}: 2 actions over three`); });
    each({ journey: 'home', screen: 'a-portfolio', state: 'abstention' }, (v, at) => { has(v.text, /3 actions · 1 abstention/, `${at.surface}: the pill miscounts`); lacks(v.text, /2 actions/, `${at.surface}: 2 actions over three`); });
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
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: 'iphone' }, v => { has(v.text, /Late: last price 14:10 \(Yahoo\)/, 'HSBC is not late'); has(v.text, /Proposed · MP40-Q6/, 'the limit is not labelled'); has(v.text, /7 of 7 priced/, 'Ready is not fully priced'); has(v.text, /84,612/, 'the total'); });
    each({ journey: 'home', screen: 'a-portfolio', state: 'stale' }, (v, at) => {
      has(v.text, /78,508/, `${at.surface}: HSBC stays in the total`);
      has(v.text, /6 of 7 priced/, `${at.surface}: the count`);
      has(v.text, /1 of 7 rows is stale/, `${at.surface}: more than HSBC is stale`);
      has(v.text, /until its price returns/, `${at.surface}: the recovery sentence`);
      lacks(v.text, /Stale[^.]{0,30}16:35|stopped at 16:35|84,612/, `${at.surface}: 16:35 or the old total`);
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
    const want = { default: /£46\.42 so far, up to £59\.73 of the £100 ceiling/, loading: /Last good: £46\.42 so far, up to £59\.73 of the £100 ceiling/, empty: /£27\.84 so far, up to £59\.73/, error: /£44\.40 last reconciled, up to £59\.73 estimated/, stale: /Billing 39 h old/, offline: /Offline · from 21:15/, noModel: /£39\.02 so far, forecast £46\.48 of the £100 ceiling/, disagreement: /£46\.73 with the bill, up to £60\.04/, abstention: /£39\.36 known so far/ };
    for (const state of STATES) for (const screen of ['a-portfolio', 'b-ledger']) each({ journey: 'home', screen, state }, (v, at) => has(v.text, want[state], `${screen} ${at.surface} ${state}: the cost row`));
    each({ journey: 'home', screen: 'a-portfolio', state: 'noModel' }, (v, at) => { has(v.text, /Claude off/, `${at.surface}: Claude off`); lacks(v.text, /£46\.42/, `${at.surface}: Claude spend on a Claude-off row`); });
    each({ journey: 'home', screen: 'a-portfolio', state: 'default', surface: 'iphone' }, v => must(v.text.indexOf('Running cost') > v.text.indexOf('NIFTYBEES ·'), 'the cost row is not after the holdings'));
    if (journeys().includes('cost')) for (const [state, l, p] of [['default', 46, 42], ['empty', 27, 84], ['error', 44, 40], ['noModel', 39, '02'], ['disagreement', 46, 73], ['abstention', 39, 36]]) {
      must(new RegExp(`£${l}\\b[^]{0,20}\\.${p}`).test(view('cost', 'a', 'cost-a-month', 'iphone', state).text), `the cost journey's ${state} no longer reads £${l}.${p}`);
    }
  },
  /* ---------- round 2 ---------- */
  'R2-h1': ({ each, view, must }) => {
    // the flip keeps the instrument, from the horizon pages and the dossier, in all nine states
    for (const [option, screen] of [['a', 'a-instrument'], ['a', 'a-technical'], ['a', 'a-3m'], ['a', 'a-12m'], ['b', 'b-forecast']]) each({ journey: 'forecast', option, screen, surface: ALL }, (v, at) => {
      must(head(v.html), `${screen} ${at.surface} ${at.state}: no instrument head`);
      const f = flips(v.html);
      must(f.length === 1, `${screen} ${at.surface} ${at.state}: ${f.length} flips`);
      const [, oo, ss] = f[0].split('|'), other = view('forecast', oo, ss, at.surface, at.state);
      must(head(other.html) === head(v.html), `${screen} ${at.surface} ${at.state}: ${head(v.html)} turns to ${head(other.html)} on ${ss}`);
    });
    each({ journey: 'forecast', option: 'a', screen: 'a-instrument', state: 'disagreement' }, (v, at) => must(flips(v.html)[0] === 'forecast|b|b-forecast', `${at.surface}: the flip does not go to the dossier`));
    // the ladder turning back. It waits on one thing: FLIP_TO still sends b-ladder and b-technical to a-instrument and a-technical in these two states, which draw the holding in question, not Apple
    for (const screen of ['b-ladder', 'b-technical']) each({ journey: 'forecast', option: 'b', screen, surface: ALL }, (v, at) => {
      const [, oo, ss] = flips(v.html)[0].split('|');
      if (['disagreement', 'abstention'].includes(at.state) && ['a-instrument', 'a-technical'].includes(ss)) return;
      must(head(view('forecast', oo, ss, at.surface, at.state).html) === head(v.html), `${screen} ${at.surface} ${at.state}: ${head(v.html)} turns to another name on ${ss}`);
    });
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
      if (at.state === 'empty') return;
      has(v.text, /MSFT/, `${screen} ${at.surface} ${at.state}: the list is not drawn`);
      must(v.text.indexOf('Top 5') > v.text.indexOf('NIFTYBEES'), `${screen} ${at.surface} ${at.state}: the top 5 is not below the holdings`);
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
      has(v.html, /class="badge b-hold"/, `${at.surface}: 3 months stands, so its action stands`);
      has(v.text, /Apple is 17\.5% of the portfolio/, `${at.surface}: the action is not Apple's`);
      has(v.text, /3-month 80% range still includes a loss of 8\.2%/, `${at.surface}: the action is not at 3 months`);
      lacks(v.text, /No range at/, `${at.surface}: "no range" over a range`);
    });
    each({ journey: 'forecast', screen: 'a-12m', state: 'abstention' }, (v, at) => has(v.text, /No range at 12 months, so no action\. Apple is not ranked/, `${at.surface}: the abstained action`));
    each({ journey: 'forecast', screen: 'a-3m', state: 'disagreement' }, (v, at) => has(v.text, /No action is ranked on Apple at 3 months/, `${at.surface}: the split action`));
    each({ journey: 'forecast', screen: 'a-12m', state: 'disagreement' }, (v, at) => has(v.html, /class="badge b-hold"/, `${at.surface}: 12 months has no conflict`));
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
      must(!rel.includes('+7.4%') && rel.includes('Disagree') && rel.includes('+3.7%') && rel.includes('+14.8%'), `${surface}: Reliance splits at 6 months only`);
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
      lacks(a3.text, /Rules and models disagree · no action|Disagree · no action/, `${surface}: Reliance is flagged at 3 months`);
    }
    // no other name, on any Home or Forecast screen
    const other = /\b(JPM|INFY|AMZN|META|HDFCBANK|IWM)\b,? (is split|is not ranked|lost|abstained|dropped)|(split|disagree|abstained) on (JPM|INFY|AMZN|META|HDFCBANK|IWM)\b|\b(JPM|INFY|AMZN|META|HDFCBANK|IWM) and (JPM|INFY|AMZN|META|HDFCBANK|IWM)\b/;
    for (const journey of ['home', 'forecast']) each({ journey, state: ['disagreement', 'abstention'], surface: ['iphone', 'web'] }, (v, at) => lacks(v.text, other, `${at.screen} ${at.surface} ${at.state}: another name`));
    // the root and the board agree with the table
    each({ journey: 'forecast', option: 'b', screen: 'b-forecasts', state: 'disagreement', surface: 'web' }, (v) => {
      must(tableRow(v.html, 'JPM').includes('+6.4%'), 'JPM stands');
      must(!tableRow(v.html, 'RELIANCE').includes('+7.4%') && tableRow(v.html, 'RELIANCE').includes('+3.7%'), 'Reliance splits at 6 months only');
    });
    each({ journey: 'home', option: 'a', screen: 'a-board', state: 'abstention' }, (v, at) => { has(v.text, /Apple lost its growth part when the model abstained at 12 months/, `${at.surface}: the board`); lacks(v.html, />AAPL<span class="sr">, you hold it<\/span>[^]{0,120}<b>\d\d<\/b>/, `${at.surface}: Apple keeps a score with a part missing`); });
    each({ journey: 'home', option: 'a', screen: 'a-board', state: 'disagreement' }, (v, at) => has(v.text, /The models split on Apple at 3 months/, `${at.surface}: the board`));
    for (const [o, screen] of [['a', 'a-segment'], ['b', 'b-explore']]) {
      each({ journey: 'home', option: o, screen, state: 'abstention' }, (v, at) => has(v.text, /Apple dropped out/, `${screen} ${at.surface}: the list`));
      each({ journey: 'home', option: o, screen, state: 'disagreement' }, (v, at) => has(v.text, /Apple is split at 3 months/, `${screen} ${at.surface}: the list`));
    }
  },
  'R2-h12': ({ each, has, lacks }) => {
    each({ journey: 'home', option: 'a', screen: 'a-action', state: 'noModel' }, (v, at) => { has(v.text, /no label, rather than a guess/, `${at.surface}: the sheet`); lacks(v.html, /b-trim/, `${at.surface}: Trim behind the sheet`); has(v.text, /No label/, `${at.surface}: the row`); });
    each({ journey: 'home', option: 'a', screen: 'a-action', state: 'empty' }, (v, at) => { has(v.text, /Nothing is suggested for NVIDIA today/, `${at.surface}: the sheet`); lacks(v.html, /b-trim/, `${at.surface}: Trim behind the sheet`); });
    each({ journey: 'home', option: 'b', screen: 'b-open', state: 'noModel' }, (v, at) => lacks(v.html, /b-trim/, `${at.surface}: Trim beside the unclassified sheet`));
    each({ journey: 'home', option: 'b', screen: 'b-open', state: 'empty' }, (v, at) => { has(v.text, /No holdings yet/, `${at.surface}: the empty ledger`); lacks(v.text, /NVIDIA/, `${at.surface}: a sheet with no holdings`); });
  },
  'R2-h13': ({ each, view, has, must }) => {
    const words_ = { default: /Spot quotes/, loading: /The last good quotes from 21:15/, empty: /No top 5 yet/, error: /Last good run Mon 21:15 · cutoff 21:00/, stale: /Gold and silver are not affected/, offline: /Quotes from 21:15, saved on this device/, noModel: /No model can cover these yet/ };
    for (const [state, re] of Object.entries(words_)) for (const [o, screen] of [['a', 'a-seg-metals'], ['b', 'b-top5-metals']]) each({ journey: 'home', option: o, screen, state }, (v, at) => {
      has(v.text, re, `${screen} ${at.surface} ${state}: ${re}`);
      has(v.text, /\$2,684\.20/, `${screen} ${at.surface} ${state}: the price is gone`);
    });
    for (const state of ['disagreement', 'abstention']) must(view('home', 'b', 'b-top5-metals', 'iphone', state).na && view('home', 'a', 'a-seg-metals', 'iphone', state).na === view('home', 'b', 'b-top5-metals', 'iphone', state).na, `${state}: the two options do not both say it does not apply`);
    each({ journey: 'home', option: 'b', screen: 'b-top5-metals', state: 'empty' }, (v, at) => must(!/ranked after each daily/.test(v.text), `${at.surface}: metals are not ranked after a run`));
  },
  'R2-h14': ({ each, has }) => {
    const want = { default: /quote 21:00 · Source open \(SCI-D08\)/, error: /quote Mon 21:00 · Source open \(SCI-D08\)/, offline: /quote saved 21:15 · Source open \(SCI-D08\)/ };
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
    const as = { error: /Last good run Mon 21:15/, stale: /Held from Mon 21:15/ };
    each({ journey: 'forecast', option: 'a', screen: 'a-short', state: STATES.filter((s) => s !== 'empty'), surface: ALL }, (v, at) => {
      has(v.text, as[at.state] || /As of 21:15 London/, `${at.surface} ${at.state}: no as-of`);
      has(v.text, /Data cutoff 21:00/, `${at.surface} ${at.state}: no cutoff`);
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
  },
  'R2-h23': ({ each, has }) => {
    each({ journey: 'home', option: 'b', screen: 'b-ledger', state: 'default', surface: WIDE }, (v, at) => has(v.text, /−9\.8% to \+21\.4%/, `${at.surface}: the range is rounded across the flip`));
  },
};
