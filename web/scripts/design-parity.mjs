// Design parity: measure each built page against the design screen it is built from, element by element (MP-205).
//
//   node scripts/design-parity.mjs [--only journal,track] [--surface web,pwa] [--state default,loading,empty,error,stale,offline]
//        [--theme light,dark] [--port 4191 | --base URL] [--show N | --all]
//
// The design is the Journeys page (docs/design/journeys/index.html), drawn at its true size (no fit-to-page scaling).
// Each pair names a design screen (journey, option, screen) and the app path built from it. Both are drawn at the
// design's device size: desktop web 1200 x 950 less the 38 px window bar, phone web 390 x 844. For every visible element
// that holds text, and every element that paints a box (a fill, a border, a shadow or a radius), it records the box
// relative to the content origin and the computed type, colour, fill, border, radius and padding. Elements are matched
// by their own text (a box by the text it holds), in reading order. It reports what the design has that the app lacks,
// what the app adds, and every measure that differs by more than 0.5 px or any style that differs. It fails closed:
// a page that does not draw, a screen it cannot find, or a pair with nothing matched is a failure. Exit 0 only when
// every pair is identical.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const GIVEN = opt('--base', null);
const PORT = opt('--port', '4191');
const BASE = GIVEN ?? `http://localhost:${PORT}`;
const ONLY = opt('--only', null)?.split(',');
const SURFACES = (opt('--surface', 'web,pwa')).split(',');
const THEMES = (opt('--theme', 'light')).split(',');
/* the design's state ids beside the app's ?data= values (docs/design/journeys State menu; web/src/lib/data/state.ts) */
const STATE_MAP = { default: 'ready', loading: 'loading', empty: 'empty', error: 'error', stale: 'stale', offline: 'offline' };
const STATES = (opt('--state', 'default')).split(',');
const SHOW = Number(opt('--show', '40'));

/**
 * The pairs, one file per screen group in tests/parity/*.json: [{ name, journey, option, screen, path }], where path is the
 * app address, or an object from the design's state id to the address when the design shows a different instrument per state,
 * and storage is what the device holds when the design draws the screen (the privacy centre is drawn with amounts hidden).
 */
export const PAIRS = readdirSync(join(web, 'tests', 'parity')).filter((f) => f.endsWith('.json')).sort()
  .flatMap((f) => JSON.parse(readFileSync(join(web, 'tests', 'parity', f), 'utf8')))
  .map((p) => [p.name, p.journey, p.option, p.screen, p.path, p.storage ?? {}]);
/* the browser's viewport for each design device: desktop web less its 38 px window bar, phone web less its 54 px status bar */
const SIZE = { web: { width: 1200, height: 912 }, pwa: { width: 390, height: 790 } };
/* parts of a design frame that are the device, not the app: the window bar, the status bar, the island, the home indicator, the backdrop */
const DEVICE = '.glass[style*="height:38px"], .sbar, .island, .home-ind, .dfield, .bcap';
/* The one part of the design the app does not draw yet, taken out of the design frame before it is measured so the frame
   reflows as the app does: the flip to option B, which the owner kept (MP-178) and which comes in a later slice (MP-205). */
const EXCEPTIONS = ['the flip to option B (MP-178), a later slice: removed from each design frame before measuring'];

/* Runs in the page. root: the element whose box is the content origin; skip: selectors measured elsewhere or not at all. */
const MEASURE = ({ scope, originSel, dy, skip }) => {
  const root = scope ? document.querySelector(scope) : document.body;
  const at = originSel ? root.querySelector(originSel) : scope ? root : document.documentElement;
  const box0 = at.getBoundingClientRect();
  const origin = { left: box0.left, top: box0.top + (dy || 0) };
  const within = originSel ? at : root;
  const out = [];
  const own = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
  const r2 = (v) => Math.round(v * 100) / 100;
  const paints = (cs) => (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none' || cs.boxShadow !== 'none' ||
    ['Top', 'Right', 'Bottom', 'Left'].some((s) => cs[`border${s}Style`] !== 'none' && parseFloat(cs[`border${s}Width`]) > 0));
  for (const el of within.querySelectorAll('*')) {
    if (skip && el.closest(skip)) continue;
    if (el.closest('[aria-hidden="true"], script, style, template, title')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility !== 'visible' || parseFloat(cs.opacity) === 0) continue;
    const b = el.getBoundingClientRect();
    if (!b.width || !b.height) continue;
    const text = own(el), box = paints(cs);
    if (!text && !box && el.tagName.toLowerCase() !== 'svg') continue;
    const key = text ? `t:${text.slice(0, 80)}` : box ? `b:${(el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 60)}` : `i:${el.closest('[aria-label]')?.getAttribute('aria-label') || el.parentElement?.innerText?.replace(/\s+/g, ' ').trim().slice(0, 40) || ''}`;
    out.push({
      key, tag: el.tagName.toLowerCase(),
      x: r2(b.left - origin.left), y: r2(b.top - origin.top), w: r2(b.width), h: r2(b.height),
      s: {
        font: `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily.split(',')[0]}`, ls: cs.letterSpacing,
        color: cs.color, bg: cs.backgroundColor === 'rgba(0, 0, 0, 0)' ? '' : cs.backgroundColor,
        img: cs.backgroundImage === 'none' ? '' : cs.backgroundImage.slice(0, 80),
        border: ['Top', 'Right', 'Bottom', 'Left'].map((s) => cs[`border${s}Style`] === 'none' ? '0' : `${cs[`border${s}Width`]} ${cs[`border${s}Color`]}`).join(' | '),
        radius: cs.borderRadius, pad: cs.padding, shadow: cs.boxShadow === 'none' ? '' : cs.boxShadow, align: cs.textAlign, tt: cs.textTransform
      }
    });
  }
  return out;
};

function compare(d, a) {
  const pool = new Map();
  for (const e of a) { if (!pool.has(e.key)) pool.set(e.key, []); pool.get(e.key).push(e); }
  const missing = [], diffs = [];
  let matched = 0;
  for (const e of d) {
    const q = pool.get(e.key);
    if (!q?.length) { missing.push(e); continue; }
    const m = q.shift();
    matched++;
    const geo = ['x', 'y', 'w', 'h'].filter((k) => Math.abs(e[k] - m[k]) > 0.5).map((k) => `${k} ${e[k]} vs ${m[k]}`);
    const sty = Object.keys(e.s).filter((k) => e.s[k] !== m.s[k]).map((k) => `${k} "${e.s[k]}" vs "${m.s[k]}"`);
    if (geo.length || sty.length) diffs.push({ key: e.key, tag: e.tag, geo, sty });
  }
  const extra = [...pool.values()].flat();
  return { matched, missing, extra, diffs };
}

for (const e of EXCEPTIONS) console.log(`NOTE measured without ${e}`);
/* a preview server of its own on the build as it is now (vite preview indexes the files it starts with), stopped at the end */
let server = null;
if (!GIVEN) {
  server = spawn('npx', ['vite', 'preview', '--port', PORT, '--strictPort'], { cwd: web, stdio: 'ignore', detached: true });
  let up = false;
  for (let i = 0; i < 100 && !up; i++) { try { up = (await fetch(BASE)).ok; } catch { await new Promise((r) => setTimeout(r, 150)); } }
  if (!up) { console.log(`FAIL the preview server did not start on ${PORT}`); try { process.kill(-server.pid); } catch {} process.exit(2); }
}
const browser = await chromium.launch({ channel: 'chrome' });
let failed = 0;
try {
  const html = readFileSync(join(web, '..', 'docs', 'design', 'journeys', 'index.html'), 'utf8');
  const wrap = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${html}</body></html>`;
  for (const theme of THEMES) for (const surface of SURFACES) {
    const sz = SIZE[surface];
    // the design page, wide enough to lay one frame out at its true size
    const dc = await browser.newContext({ viewport: { width: 1600, height: 1200 }, colorScheme: theme, reducedMotion: 'reduce' });
    const dp = await dc.newPage();
    await dp.route('https://design.test/**', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: wrap }));
    await dp.goto('https://design.test/');
    await dp.waitForFunction(() => !!window.__prismJourneys);
    await dp.evaluate(() => { window.__prismNoFit = window.__prismInstantFlip = true; });
    const ac = await browser.newContext({ viewport: { width: sz.width, height: sz.height }, colorScheme: theme, reducedMotion: 'reduce' });
    const ap = await ac.newPage();
    await ap.goto(`${BASE}/signin?next=%2F`);
    await ap.getByRole('button', { name: 'Continue with a passkey' }).click();
    await ap.waitForURL((u) => !u.pathname.startsWith('/signin'));
    for (const [name, j, o, sid, path, storage] of PAIRS) for (const state of STATES) {
      if (ONLY && !ONLY.includes(name)) continue;
      const where = `${name} ${surface} ${state} ${theme}`;
      const idx = await dp.evaluate(([j, o, sid]) => {
        const row = window.__prismJourneys.matrix().find((r) => r.j === j && r.o === o);
        return row ? row.screens.findIndex((s) => s.id === sid) : -1;
      }, [j, o, sid]);
      if (idx < 0) { console.log(`FAIL ${where}: the design has no screen ${j}.${o} ${sid}`); failed++; continue; }
      await dp.evaluate(([j, o, s, st]) => window.__prismJourneys.go(j, o, s, st), [j, o, surface, state]);
      await dp.evaluate(() => document.fonts.ready);
      await dp.evaluate((i) => {
        const scr = document.querySelectorAll('#jrow .scr')[i];
        scr?.setAttribute('data-parity', '');
        scr?.querySelectorAll('[data-flip]').forEach((f) => f.remove());
      }, idx);
      const d = await dp.evaluate(MEASURE, { scope: '#jrow .scr[data-parity]', originSel: surface === 'web' ? '.jweb' : null, dy: surface === 'web' ? 0 : 54, skip: DEVICE });
      const appState = STATE_MAP[state];
      if (!appState) { console.log(`FAIL ${where}: the app has no ${state} state to compare`); failed++; continue; }
      const at = typeof path === 'string' ? path : path[state];
      if (!at) { console.log(`FAIL ${where}: no app address for the ${state} state`); failed++; continue; }
      // the device state the design screen is drawn in (a pair's `storage`, as { key: value }), set before the page loads
      await ap.evaluate((st) => { for (const k of Object.keys(localStorage)) if (k.startsWith('mp-hide')) localStorage.removeItem(k); for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v); }, storage);
      await ap.goto(`${BASE}${at}${appState === 'ready' ? '' : `${at.includes('?') ? '&' : '?'}data=${appState}`}`);
      await ap.getByRole('heading', { level: 1 }).first().waitFor();
      if (appState !== 'loading') await ap.waitForFunction(() => !document.querySelector('[aria-busy="true"]'));
      await ap.evaluate(() => document.fonts.ready);
      await ap.waitForTimeout(150);
      const a = await ap.evaluate(MEASURE, { scope: null, originSel: null, dy: 0, skip: '.skip' });
      if (!d.length || !a.length) { console.log(`FAIL ${where}: nothing measured (design ${d.length}, app ${a.length})`); failed++; continue; }
      const c = compare(d, a);
      const ok = !c.missing.length && !c.extra.length && !c.diffs.length;
      if (!ok) failed++;
      console.log(`${ok ? 'PASS' : 'FAIL'} ${where}: ${d.length} design elements, ${c.matched} matched, ${c.missing.length} missing, ${c.extra.length} added, ${c.diffs.length} differ`);
      if (!ok && (args.includes('--all') || SHOW)) {
        const lim = args.includes('--all') ? Infinity : SHOW;
        for (const m of c.missing.slice(0, lim)) console.log(`  missing ${m.tag} ${m.key} @${m.x},${m.y} ${m.w}x${m.h}`);
        for (const m of c.extra.slice(0, lim)) console.log(`  added   ${m.tag} ${m.key} @${m.x},${m.y} ${m.w}x${m.h}`);
        for (const m of c.diffs.slice(0, lim)) console.log(`  differs ${m.tag} ${m.key}: ${[...m.geo, ...m.sty].join('; ')}`);
      }
    }
    await dc.close(); await ac.close();
  }
} finally {
  await browser.close();
  if (server) try { process.kill(-server.pid); } catch {}
}
process.exit(failed ? 1 : 0);
