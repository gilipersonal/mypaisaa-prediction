#!/usr/bin/env node
// Walk every journey in Prism Journeys and prove what MP-62 asks of it (docs/design/journeys/README.md).
//
//   perl -e 'alarm shift; exec @ARGV' 580 node scripts/design_journeys_check.mjs docs/design/journeys/index.html
//        [--only home,forecast] [--themes light,dark] [--surfaces iphone,web]
//
// For every journey, option, device, state and theme it renders the row of screens and fails on: a page error, a journey
// with fewer than two options or not exactly one recommended, a screen that draws nothing, a state marked not applicable
// with no reason, a sideways scroll inside a screen, a buy, sell or order control, text under 11 px or lighter than 400,
// text below 4.5:1 and 3:1 at 20% on its ground (read up the tree, so glass over moving content is judged by the static
// tokens instead), a state that draws exactly what the ready state draws, an icon with no symbol, a card that clips its
// content, anything that runs past its column or card, or a button under 44 px.
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const require = createRequire(import.meta.url);
const PW = process.env.PLAYWRIGHT_CORE || '/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core';
const args = process.argv.slice(2);
const pick = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args.splice(i, 2)[1].split(',') : null; };
const ONLY = pick('--only'), THEMES = pick('--themes') || ['light', 'dark'], SURF = pick('--surfaces');
const file = args[0];
if (!file) { console.error('usage: design_journeys_check.mjs PAGE [--only ids] [--themes light,dark] [--surfaces iphone,web]'); process.exit(2); }
const wrap = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + readFileSync(resolve(file), 'utf8') + '</body></html>';

const AUDIT = () => {
  const parse = (s) => { const m = s && s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const over = (f, b) => { const a = f[3] + b[3] * (1 - f[3]); return a ? [0, 1, 2].map((i) => (f[i] * f[3] + b[i] * b[3] * (1 - f[3])) / a).concat(a) : [0, 0, 0, 0]; };
  const lum = (c) => { const ch = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2]); };
  const ratio = (a, b, k) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return (k * h + 0.05) / (k * l + 0.05); };
  const out = { screens: 0, empties: [], wide: [], trade: [], small: [], low: [], clipped: [], sig: [] };
  document.querySelectorAll('#jrow .scr').forEach((scr) => {
    out.screens++;
    const text = scr.innerText.replace(/\s+/g, ' ').trim();
    out.sig.push(text.length + ':' + text.slice(0, 400));
    if (text.length < 20) out.empties.push(scr.getAttribute('aria-label'));
    scr.querySelectorAll('.jscroll, .jpane').forEach((p) => { if (p.scrollWidth > p.clientWidth + 1) out.wide.push(`${scr.getAttribute('aria-label')} is ${p.scrollWidth - p.clientWidth} px too wide`); });
    scr.querySelectorAll('button, a, [role="button"]').forEach((b) => { if (/^\s*(buy|sell|place (an )?order|trade)\b/i.test(b.textContent)) out.trade.push(b.textContent.trim().slice(0, 40)); });
    const walker = document.createTreeWalker(scr, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (!t.textContent.trim()) continue;
      const el = t.parentElement;
      if (!el || seen.has(el) || el.closest('[aria-hidden="true"],.scrim')) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      if (cs.visibility !== 'visible' || cs.display === 'none') continue;
      const svg = el.closest('svg');
      if (parseFloat(cs.fontSize) < 10.95) out.small.push(`"${t.textContent.trim().slice(0, 24)}" ${cs.fontSize}`);
      if ((parseInt(cs.fontWeight, 10) || 400) < 400) out.small.push(`"${t.textContent.trim().slice(0, 24)}" weight ${cs.fontWeight}`);
      if (el.closest(':disabled,[aria-disabled="true"],[data-contrast-exempt]')) continue;
      let bg = null;
      let gradient = false;
      for (let n = el; n; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.backgroundImage !== 'none' && !/radial/.test(s.backgroundImage)) gradient = true;
        const b = parse(s.backgroundColor);
        if (b && b[3] > 0.001) { bg = bg ? over(bg, b) : b; if (bg[3] >= 0.999) break; }
      }
      if (gradient || !bg) continue;
      if (bg[3] < 0.999) bg = over(bg, [128, 128, 128, 1]);
      const f0 = parse(svg ? (cs.fill && cs.fill !== 'none' ? cs.fill : cs.color) : cs.color);
      if (!f0) continue;
      const f = over(f0, bg);
      const full = ratio(f, bg, 1), dim = ratio(f, bg, 0.2);
      if (full < 4.5 || dim < 2.99) out.low.push(`"${t.textContent.trim().slice(0, 28)}" ${full.toFixed(2)}:1, ${dim.toFixed(2)}:1 at 20%`);
    }
    scr.querySelectorAll('.card, .sheet').forEach((k) => { if (k.scrollWidth > k.clientWidth + 1 && getComputedStyle(k).overflowX !== 'auto') out.clipped.push(`${scr.getAttribute('aria-label')}: a card clips ${k.scrollWidth - k.clientWidth} px, "${k.textContent.trim().slice(0, 36)}"`); });
    scr.querySelectorAll('.jbody > *, .jcols > div > *').forEach((k) => { const a = k.getBoundingClientRect(), p = k.parentElement.getBoundingClientRect(); if (a.width && a.right > p.right + 1) out.clipped.push(`${scr.getAttribute('aria-label')}: runs ${Math.round(a.right - p.right)} px past its column, "${k.textContent.trim().slice(0, 36)}"`); });
    scr.querySelectorAll('.chip, .btn').forEach((k) => { const box = k.closest('.card, .sheet, .jbanner'); if (!box) return; const a = k.getBoundingClientRect(), p = box.getBoundingClientRect(); if (a.width && a.right > p.right + 1) out.clipped.push(`${scr.getAttribute('aria-label')}: "${k.textContent.trim().slice(0, 28)}" runs ${Math.round(a.right - p.right)} px past its card`); });
    scr.querySelectorAll('button.btn').forEach((k) => { const a = k.getBoundingClientRect(); if (a.height && a.height < 43.5) out.clipped.push(`${scr.getAttribute('aria-label')}: the button "${k.textContent.trim().slice(0, 24)}" is ${Math.round(a.height)} px tall, under 44`); });
    scr.querySelectorAll('use').forEach((u) => { const h = u.getAttribute('href'); if (h && !document.querySelector(h)) out.trade.push(`icon ${h} has no symbol`); });
  });
  return out;
};

const pw = require(PW);
const b = await pw.chromium.launch({ channel: 'chrome' });
let problems = 0, combos = 0;
const say = (m) => { problems++; if (problems <= 60) console.log('FAIL ' + m); };
try {
  for (const theme of THEMES) {
    const c = await b.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce' });
    const p = await c.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).split('\n')[0].slice(0, 200)));
    await p.route('https://j.test/**', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: wrap }));
    await p.goto('https://j.test/');
    await p.waitForTimeout(800);
    await p.evaluate(() => { window.__prismNoFit = true; });   // measure every frame at its true size
    const shape = await p.evaluate(() => ({ m: window.__prismJourneys.matrix(), states: window.__prismStates.map((s) => s[0]), surfaces: window.__prismSurfaces.map((s) => s[0]), recs: window.__prismJourneys.all().map((j) => [j.id, j.options.length, j.options.filter((o) => o.rec).length]) }));
    for (const [id, n, rec] of shape.recs) {
      if (ONLY && !ONLY.includes(id)) continue;
      if (n < 2) say(`${id}: ${n} option(s), at least two are needed`);
      if (rec !== 1) say(`${id}: ${rec} recommended, exactly one is needed`);
    }
    for (const row of shape.m) {
      if (ONLY && !ONLY.includes(row.j)) continue;
      for (const s of row.screens) for (const [k, why] of Object.entries(s.na)) if (!why || String(why).length < 8) say(`${row.j}.${row.o} ${s.id}: ${k} is marked not applicable with no reason`);
      for (const surface of SURF || shape.surfaces) {
        let ready = null;
        for (const st of shape.states) {
          combos++;
          errs.length = 0;
          await p.evaluate(([j, o, s, k]) => window.__prismJourneys.go(j, o, s, k), [row.j, row.o, surface, st]);
          const a = await p.evaluate(AUDIT);
          const where = `${row.j}.${row.o} ${surface} ${st} ${theme}`;
          if (st === 'default') ready = a.sig;
          else if (ready) a.sig.forEach((sig, i) => { if (sig === ready[i] && !row.screens[i].na[st]) say(`${where}: "${row.screens[i].title}" draws exactly what Ready draws`); });
          for (const e of errs) say(`${where}: ${e}`);
          if (!a.screens) say(`${where}: no screens drawn`);
          for (const x of a.empties) say(`${where}: nothing drawn in ${x}`);
          for (const x of [...new Set(a.wide)]) say(`${where}: ${x}`);
          for (const x of [...new Set(a.trade)]) say(`${where}: ${x}`);
          for (const x of [...new Set(a.small)].slice(0, 3)) say(`${where}: text ${x}`);
          for (const x of [...new Set(a.low)].slice(0, 3)) say(`${where}: ${x}`);
          for (const x of [...new Set(a.clipped)].slice(0, 3)) say(`${where}: ${x}`);
        }
      }
    }
    await c.close();
  }
} finally {
  await b.close();
}
console.log(`design-journeys: ${combos} combinations walked, ${problems} problem(s)${problems > 60 ? ' (first 60 shown)' : ''}`);
process.exit(problems ? 1 : 0);
