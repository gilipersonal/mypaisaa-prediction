#!/usr/bin/env node
// Presses the horizon, detail and dossier switches on Home and Forecast in a real browser, and asserts what the frame then shows
// (R2-h1, R2-h5, R2-h15, R2-h18, R2-h19). A check that needs a press cannot run in tests/journey_facts: that harness has no browser.
//
//   perl -e 'alarm shift; exec @ARGV' 280 node scripts/design_journeys_press.mjs docs/design/journeys/index.html
import { createRequire } from 'module';
import { readFileSync } from 'fs';
const require = createRequire(import.meta.url);
const pw = require(process.env.PLAYWRIGHT_CORE || '/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core');
const page = process.argv[2];
const wrap = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + readFileSync(page, 'utf8') + '</body></html>';
const b = await pw.chromium.launch({ channel: 'chrome' });
let bad = 0, n = 0;
const fail = (m) => { bad++; console.log('FAIL ' + m); };
try {
  const c = await b.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const p = await c.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).split('\n')[0]));
  await p.route('https://j.test/**', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: wrap }));
  await p.goto('https://j.test/');
  await p.waitForTimeout(600);
  await p.evaluate(() => { window.__prismNoFit = true; });
  // a turned slot stays turned across go(), so each case starts from a fresh page
  const go = async (j, o, s, st) => { await p.goto('https://j.test/?' + Math.random()); await p.waitForTimeout(120); await p.evaluate(([a, b_, c_, d]) => { window.__prismNoFit = true; window.__prismJourneys.go(a, b_, c_, d); }, [j, o, s, st]); };
  // one frame: optional flip first, then the press, and what must then show
  const frame = async (slot, fn, arg) => p.evaluate(({ slot, fn, arg }) => {
    const box = document.querySelector(`#jrow [data-slot="${slot}"]`), scr = box.querySelector('.scr');
    const text = () => scr.innerText.replace(/\s+/g, ' ').trim();
    const press = (name, i) => { const g = scr.querySelector(`[aria-label="${name}"]`); if (!g) return 'no group ' + name; [...g.querySelectorAll(':scope > button')][i].click(); return ''; };
    const f = new Function('box', 'scr', 'text', 'press', 'arg', `return (${fn})()`);
    return f(box, scr, text, press, arg);
  }, { slot, fn: fn.toString(), arg });
  const CASES = [
    // [journey, option, surface, state, slot, flip first?, group, index, must show, must not show, keeps head]
    ['home', 'a', 'iphone', 'default', 'a-portfolio', false, 'Forecast horizon', 2, /· 12M/, /· 6M/],
    ['home', 'a', 'iphone', 'default', 'a-portfolio', true, 'Forecast horizon', 0, /3M/, /zz/],
    ['home', 'b', 'iphone', 'default', 'b-ledger', true, 'Forecast horizon', 2, /· 12M/, /· 6M · |zz/],
    ['home', 'a', 'web', 'default', 'a-portfolio', false, 'Forecast horizon', 2, /12-month forecast/, /6-month forecast/],
    ['home', 'a', 'web', 'disagreement', 'a-portfolio', false, 'Forecast horizon', 0, /Split · no action/, /\+3\.1%/],
    ['forecast', 'a', 'iphone', 'default', 'a-instrument', false, 'Forecast horizon', 0, /3-month forecast · AAPL/, /6-month forecast/],
    ['forecast', 'a', 'iphone', 'default', 'a-instrument', false, 'Forecast horizon', 2, /12-month forecast · AAPL/, /6-month forecast/],
    ['forecast', 'a', 'iphone', 'default', 'a-3m', false, 'Forecast horizon', 1, /Horizon 3 May 2027|6-month/, /3-month forecast/],
    ['forecast', 'a', 'iphone', 'abstention', 'a-instrument', false, 'Forecast horizon', 0, /3-month forecast · AZN/, /· AAPL/],
    ['forecast', 'a', 'iphone', 'disagreement', 'a-instrument', false, 'Forecast horizon', 2, /12-month forecast · RELIANCE/, /· AAPL/],
    ['forecast', 'a', 'iphone', 'abstention', 'a-12m', false, 'Forecast horizon', 1, /6 months stands/, /AstraZeneca/],
    ['forecast', 'a', 'iphone', 'disagreement', 'a-3m', false, 'Detail', 1, /Split · no median/, /\+3\.1%/],
    ['forecast', 'a', 'iphone', 'default', 'a-instrument', false, 'Detail', 1, /10th percentile/, /zz/],
    ['forecast', 'a', 'iphone', 'default', 'a-technical', false, 'Detail', 0, /Simple/, /10th percentile/],
    ['forecast', 'b', 'iphone', 'default', 'b-ladder', false, 'Detail', 1, /10th/, /zz/],
    ['forecast', 'a', 'iphone', 'default', 'a-instrument', true, 'Detail', 1, /10th/, /zz/],
    ['forecast', 'b', 'iphone', 'default', 'b-forecast', false, 'Dossier', 1, /ds-2026-10-30/, /zz/],
    ['forecast', 'b', 'web', 'default', 'b-forecast', false, 'Dossier', 1, /ds-2026-10-30/, /zz/],
    ['forecast', 'a', 'iphone', 'default', 'a-proof', true, 'Dossier', 2, /Three views|Rules/, /zz/],
    ['forecast', 'a', 'web', 'default', 'a-forecasts', false, 'Forecast horizon', 2, /\+12\.4%/, /zz/],
  ];
  for (const [j, o, surface, st, slot, flip, group, i, want, not] of CASES) {
    n++;
    await go(j, o, surface, st);
    const where = `${j}.${o} ${surface} ${st} ${slot}${flip ? ' turned' : ''} ${group} ${i}`;
    const r = await frame(slot, () => {
      const [group, i, flip] = arg;
      if (flip) { const f = scr.querySelector('[data-flip]'); if (!f) return { err: 'no flip to turn' }; f.click(); }
      const at0 = scr.dataset.at, cap0 = box.querySelector('.bcap').textContent;
      const e = press(group, i);
      if (e) return { err: e };
      const on = scr.querySelector(`[aria-label="${group}"] > button[aria-pressed="true"]`);
      return { at0, at: scr.dataset.at, cap0, cap: box.querySelector('.bcap').textContent, text: text(), flip: !!scr.querySelector('[data-flip]'), pressed: on ? [...on.parentElement.querySelectorAll(':scope > button')].indexOf(on) : -1, focus: document.activeElement === on, turned: /Turned to/.test(box.querySelector('.bcap').textContent) };
    }, [group, i, flip]);
    if (r.err) { fail(`${where}: ${r.err}`); continue; }
    if (!r.flip) fail(`${where}: the press removed the flip`);
    if (r.pressed !== i) fail(`${where}: ${r.pressed} is lit`);
    if (!r.focus) fail(`${where}: focus left the control`);
    if (flip && !r.turned) fail(`${where}: the frame stopped saying it is turned`);
    if (flip && r.at0.split('|')[1] !== r.at.split('|')[1]) fail(`${where}: the press changed side, ${r.at0} to ${r.at}`);
    if (!want.test(r.text)) fail(`${where}: no ${want} in ${r.text.slice(0, 200)}`);
    if (not.test(r.text)) fail(`${where}: ${not} still shows`);
  }
  // the flip keeps a pressed horizon and mode, both ways
  for (const [j, o, surface, slot, group, i, want] of [['home', 'a', 'iphone', 'a-portfolio', 'Forecast horizon', 2, /12M/], ['forecast', 'a', 'iphone', 'a-instrument', 'Detail', 1, /10th/]]) {
    n++;
    await go(j, o, surface, 'default');
    const r = await frame(slot, () => { const [group, i] = arg; press(group, i); scr.querySelector('[data-flip]').click(); const t1 = text(); scr.querySelector('[data-flip]').click(); return { t1, t2: text(), at: scr.dataset.at }; }, [group, i]);
    if (!want.test(r.t1) || !want.test(r.t2)) fail(`${j} ${slot}: the flip drops the press`);
  }
  // a ladder row opens its dossier, by click and by key, on the ladder's name
  for (const [st, row, want, not] of [['default', 0, /3-month forecast · AAPL/, /zz/], ['disagreement', 0, /No median stands/, /Reliance/], ['abstention', 2, /calibrated 12-month range/, /AstraZeneca/], ['stale', 1, /HSBC/, /Apple/]]) for (const how of ['click', 'key']) {
    n++;
    await go('forecast', 'b', 'iphone', st);
    const r = await frame('b-ladder', () => {
      const [row, how] = arg, rows = scr.querySelectorAll('[data-dossier]'), el = rows[row];
      if (!el) return { err: 'no row' };
      if (how === 'click') el.click(); else { el.focus(); el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); }
      return { at: scr.dataset.at, text: text(), flip: !!scr.querySelector('[data-flip]'), cap: box.querySelector('.bcap').textContent, tab: !!scr.querySelector('[aria-label="Dossier"]') };
    }, [row, how]);
    if (r.err) { fail(`ladder ${st} ${row}: ${r.err}`); continue; }
    if (!/b-forecast/.test(r.at) || !r.tab) fail(`ladder ${st} ${row} ${how}: no dossier, ${r.at}`);
    if (!r.flip) fail(`ladder ${st} ${row} ${how}: no flip`);
    if (!/Dossier/.test(r.cap)) fail(`ladder ${st} ${row} ${how}: the caption reads ${r.cap}`);
    if (!want.test(r.text)) fail(`ladder ${st} ${row} ${how}: no ${want} in ${r.text.slice(0, 240)}`);
    if (not.test(r.text)) fail(`ladder ${st} ${row} ${how}: ${not} shows`);
  }
  for (const e of errs) fail('page error: ' + e);
  await c.close();
} finally { await b.close(); }
console.log(`presses: ${n} cases, ${bad} failed`);
process.exit(bad ? 1 : 0);
