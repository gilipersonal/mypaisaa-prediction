#!/usr/bin/env node
// Presses the horizon, detail and dossier switches on Home and Forecast in a real browser, and asserts what the frame then shows
// (R2-h1, R2-h5, R2-h15, R2-h18, R2-h19, R3-h1, R3-h2). A check that needs a press cannot run in tests/journey_facts: that harness has no browser.
//
//   perl -e 'alarm shift; exec @ARGV' 280 node scripts/design_journeys_press.mjs docs/design/journeys/index.html
import { createRequire } from 'module';
import { readFileSync } from 'fs';
const require = createRequire(import.meta.url);
const pw = require(process.env.PLAYWRIGHT_CORE || '/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core');
if (process.argv.includes('--selftest')) {
  // a flip that loses the horizon must be refused, and the good page must pass, so the harness proves something (lesson 9)
  const { spawnSync } = await import('child_process');
  const { mkdtempSync, writeFileSync } = await import('fs');
  const { tmpdir } = await import('os');
  const { join, resolve, dirname } = await import('path');
  const { fileURLToPath } = await import('url');
  const self = fileURLToPath(import.meta.url), tmp = mkdtempSync(join(tmpdir(), 'press-selftest-')), good = join(tmp, 'good.html');
  const built = spawnSync('python3', ['docs/design/journeys/build.py', '--only', 'home,forecast', '--out', good], { cwd: resolve(dirname(self), '..'), encoding: 'utf8' });
  if (built.status !== 0) { console.log(`selftest: FAIL could not build: ${built.stderr}`); process.exit(2); }
  const html = readFileSync(good, 'utf8'), bad = join(tmp, 'bad.html');
  const lost = html.replace('saved = { hz: scr.dataset.hz, mode: scr.dataset.mode, t: scr.dataset.t }', 'saved = {}');
  if (lost === html) { console.log('selftest: FAIL the mutation did not apply'); process.exit(2); }
  writeFileSync(bad, lost);
  const run = (f) => spawnSync('perl', ['-e', 'alarm shift; exec @ARGV', '200', 'node', self, f], { encoding: 'utf8' });
  const a = run(good), b = run(bad);
  if (a.status !== 0) { console.log(`selftest: FAIL the good page is refused:\n${a.stdout.slice(0, 400)}`); process.exit(1); }
  if (b.status === 0) { console.log('selftest: FAIL a flip that drops the horizon passed'); process.exit(1); }
  console.log('selftest: the good page passes and a flip that drops the horizon is refused');
  process.exit(0);
}
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
  await p.evaluate(() => { window.__prismNoFit = window.__prismInstantFlip = true; });
  // a turned slot stays turned across go(), so each case starts from a fresh page
  const go = async (j, o, s, st) => { await p.goto('https://j.test/?' + Math.random()); await p.waitForTimeout(120); await p.evaluate(([a, b_, c_, d]) => { window.__prismNoFit = window.__prismInstantFlip = true; window.__prismJourneys.go(a, b_, c_, d); }, [j, o, s, st]); };
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
    ['home', 'a', 'iphone', 'default', 'a-portfolio', true, 'Forecast horizon', 0, /Value 3M Action/, /zz/],
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
  for (const [j, o, surface, slot, group, i, want] of [['home', 'a', 'iphone', 'a-portfolio', 'Forecast horizon', 2, /· 12M|Value 12M Action/], ['forecast', 'a', 'iphone', 'a-instrument', 'Detail', 1, /10th/]]) {
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
  // R3-h1: a row's name holds across the flip and back, from the row and from a dossier tab
  for (const surface of ['iphone', 'web']) for (const [st, name, ticker] of [['default', 'Apple', 'AAPL'], ['disagreement', 'Apple', 'AAPL'], ['abstention', 'Apple', 'AAPL'], ['stale', 'HSBC', 'HSBA']]) for (const row of [0, 1, 2]) {
    n++;
    await go('forecast', 'b', surface, st);
    const where = `open row ${row} ${surface} ${st}`;
    const r = await frame('b-ladder', () => {
      const head = () => (scr.querySelector('.fc-inst .nm') || {}).textContent, el = scr.querySelectorAll('[data-dossier]')[arg];
      if (!el) return { err: 'no row' };
      el.click();
      const a = head(), at0 = scr.dataset.at;
      scr.querySelector('[data-flip]').click();
      const b = head(), at1 = scr.dataset.at;
      scr.querySelector('[data-flip]').click();
      return { a, b, c: head(), at0, at1, at2: scr.dataset.at };
    }, row);
    if (r.err) { fail(`${where}: ${r.err}`); continue; }
    if (r.a !== name || r.b !== name || r.c !== name) fail(`${where}: ${r.a}, turned ${r.b}, back ${r.c}`);
    if (r.at2 !== r.at0) fail(`${where}: went from ${r.at0} to ${r.at1} and came back to ${r.at2}`);
    for (const tab of [1, 2, 3]) {
      n++;
      await go('forecast', 'b', surface, st);
      const t = await frame('b-ladder', () => {
        const [row, tab] = arg, el = scr.querySelectorAll('[data-dossier]')[row];
        if (!el) return { err: 'no row' };
        el.click();
        const e = press('Dossier', tab);
        if (e) return { err: e };
        const here = scr.dataset.at, f = scr.querySelector('[data-flip]'), to = f && f.dataset.flip;
        if (!f) return { err: 'no flip' };
        f.click();
        const back = scr.querySelector('[aria-label^="Back to"]');
        return { here, to, at: scr.dataset.at, back: back ? back.getAttribute('aria-label') : '', text: text() };
      }, [row, tab]);
      if (t.err) { fail(`${where} tab ${tab}: ${t.err}`); continue; }
      if (t.at !== t.to) fail(`${where} tab ${tab}: the flip says ${t.to} and lands on ${t.at}`);
      if (t.back !== `Back to ${ticker}`) fail(`${where} tab ${tab}: ${t.back}, turned from ${t.here}`);
      if (st === 'disagreement' && /Reliance|RELIANCE/.test(t.text)) fail(`${where} tab ${tab}: Reliance on Apple's frame`);
      if (st === 'abstention' && /AstraZeneca|\bAZN\b/.test(t.text)) fail(`${where} tab ${tab}: AstraZeneca on Apple's frame`);
    }
  }
  // R3-h2: a flip after a tab press lands where the control says, turned or not
  for (const slot of ['a-proof', 'a-views', 'a-evidence']) for (const tab of [0, 1, 2, 3].filter((i) => i !== ['a-proof', 'a-views', 'a-evidence'].indexOf(slot) + 1)) {
    n++;
    await go('forecast', 'a', 'iphone', 'default');
    const r = await frame(slot, () => {
      scr.querySelector('[data-flip]').click();
      const e = press('Dossier', arg);
      if (e) return { err: e };
      const f = scr.querySelector('[data-flip]'), to = f.dataset.flip;
      f.click();
      return { to, at: scr.dataset.at };
    }, tab);
    if (r.err) { fail(`${slot} turned, tab ${tab}: ${r.err}`); continue; }
    if (r.to !== r.at) fail(`${slot} turned, tab ${tab}: the flip says ${r.to} and lands on ${r.at}`);
  }
  {
    n++;
    await go('forecast', 'b', 'iphone', 'default');
    const r = await frame('b-forecast', () => { press('Dossier', 1); const a = scr.dataset.at; scr.querySelector('[data-flip]').click(); const b = scr.dataset.at; scr.querySelector('[data-flip]').click(); return { a, b, c: scr.dataset.at }; });
    if (r.a !== 'forecast|b|b-proof' || r.b !== 'forecast|a|a-proof' || r.c !== r.a) fail(`b-forecast, Proof, flip and back: ${r.a}, ${r.b}, ${r.c}`);
  }
  // R3-h2: a frame turned in Ready, then a state change: it shows its partner for that state, and the flip lands where it says, on the same name
  for (const [slot, st, name] of [['a-instrument', 'disagreement', 'Reliance'], ['a-instrument', 'abstention', 'AstraZeneca'], ['a-technical', 'disagreement', 'Reliance'], ['a-technical', 'abstention', 'AstraZeneca']]) {
    n++;
    await go('forecast', 'a', 'iphone', 'default');
    await frame(slot, () => scr.querySelector('[data-flip]').click());
    await p.evaluate((s) => window.__prismJourneys.go('forecast', 'a', 'iphone', s), st);
    const r = await frame(slot, () => {
      const head = () => (scr.querySelector('.fc-inst .nm') || {}).textContent, f = scr.querySelector('[data-flip]');
      if (!f) return { err: 'no flip' };
      const a = head(), at0 = scr.dataset.at, to = f.dataset.flip;
      f.click();
      return { a, at0, to, at: scr.dataset.at, b: head() };
    });
    if (r.err) { fail(`${slot} turned, then ${st}: ${r.err}`); continue; }
    if (r.at0 !== 'forecast|b|b-forecast') fail(`${slot} turned, then ${st}: the frame shows ${r.at0}`);
    if (r.at !== r.to) fail(`${slot} turned, then ${st}: the flip says ${r.to} and lands on ${r.at}`);
    if (r.a !== name || r.b !== name) fail(`${slot} turned, then ${st}: ${r.a} turned to ${r.b}`);
  }
  for (const e of errs) fail('page error: ' + e);
  await c.close();
} finally { await b.close(); }
console.log(`presses: ${n} cases, ${bad} failed`);
process.exit(bad ? 1 : 0);
