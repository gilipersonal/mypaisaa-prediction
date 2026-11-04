#!/usr/bin/env node
// Measure an MP design page as it renders (MP-62, docs/design/reviews/MP-62/brief-r2.md).
//
//   perl -e 'alarm shift; exec @ARGV' 300 node scripts/design_runtime.mjs PAGE.html [PAGE.html ...] [--out report.json]
//        [--engine chrome,webkit] [--theme light,dark] [--width 390,1440]
//
// scripts/design_gates.py reads a page's tokens, CSS and script; this script loads the page the way the artifact
// host does (a UTF-8 skeleton around it) in Chrome and in WebKit, in light and dark, at 390 and 1440 px, and measures
// what a viewer would get:
//   - contrast: every visible text's real colour on its real ground (backgrounds composited up the tree, gradient
//     stops taken at their worst, ancestors' opacity applied), at full brightness and at 20%, against the text tier
//     (7:1 and 3.5:1; Prism, on the owner's MA ink, 4.5:1 and 3:1); text smaller than 11 px or lighter than 400; text on an image it cannot measure;
//   - motion: every running animation's animated properties (transform, opacity, clip-path, stroke-dashoffset,
//     visibility; short paint-only transitions), through the arrivals, a scroll of the whole page, every tab and
//     segment in reach and a theme switch;
//   - smoothness: frame times through the same, with Chrome's CPU slowed four times (the budget: 95% of frames
//     within 20 ms, no long animation frame over 50 ms after load, layout shift under 0.02);
//   - every icon on whole pixels and pointing at a real symbol, including icons a script builds;
//   - no horizontal page scroll, no console errors.
// The 20% model is the gate's: (0.2 L1 + 0.05) / (0.2 L2 + 0.05). A disabled control (:disabled, aria-disabled) and
// text a page marks data-contrast-exempt must still reach 3:1 at full brightness, and are not held to 20%. It needs playwright-core and the
// browsers named below; a browser that will not start is a failure, not a skip.

import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const require = createRequire(import.meta.url);
const PW = process.env.PLAYWRIGHT_CORE || '/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core';
const WEBKIT = process.env.MP_WEBKIT || `${process.env.HOME}/Library/Caches/ms-playwright/webkit-2359/pw_run.sh`;
const DEADLINE_MS = 280_000;
const BUDGET = { frameOk: 0.95, frameMs: 20, loafMs: 50, cls: 0.02 };

const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
const out = outAt >= 0 ? args.splice(outAt, 2)[1] : null;
const pick = (flag, all) => { const i = args.indexOf(flag); return i >= 0 ? args.splice(i, 2)[1].split(',') : all; };
const ENGINES = pick('--engine', ['chrome', 'webkit']);
const THEMES = pick('--theme', ['light', 'dark']);
const WIDTHS = pick('--width', ['390', '1440']).map(Number);
const pages = args;
if (!pages.length) {
  console.error('usage: node scripts/design_runtime.mjs PAGE.html [...] [--out report.json]');
  process.exit(2);
}

const timer = setTimeout(() => { console.error('design-runtime: FAIL ran past its deadline'); process.exit(1); }, DEADLINE_MS);

function wrap(html) {
  return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
    + '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>'
    + '</head><body>' + html + '</body></html>';
}

// ---- in the page: contrast of every visible text ----
// The ground is what is under the text on screen (document.elementsFromPoint at the text's first line, with every
// element made hit-testable for the sweep), so a sliding lens or a tile drawn as a sibling counts. Pseudo-element
// backgrounds are not seen; the static gate measures the tokens they use.
const SWEEP = async () => {
  const parse = (s) => {
    const m = s && s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  };
  const over = (f, b) => {
    const a = f[3] + b[3] * (1 - f[3]);
    if (!a) return [0, 0, 0, 0];
    return [0, 1, 2].map((i) => (f[i] * f[3] + b[i] * b[3] * (1 - f[3])) / a).concat(a);
  };
  const lum = (c) => {
    const ch = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2]);
  };
  const ratio = (a, b, k) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return (k * h + 0.05) / (k * l + 0.05); };
  const label = (el) => {
    const id = el.id ? '#' + el.id : '';
    const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return el.tagName.toLowerCase() + id + cls;
  };
  const opacityOf = (n) => { let a = 1; for (; n && n.nodeType === 1; n = n.parentElement) a *= parseFloat(getComputedStyle(n).opacity); return a; };
  const layerOf = (n) => {
    const cs = getComputedStyle(n);
    const k = opacityOf(n);
    const bc = parse(cs.backgroundColor) || [0, 0, 0, 0];
    const img = cs.backgroundImage;
    if (img && img !== 'none') {
      if (/url\(/.test(img)) return { unmeasured: 'an image under the text' };
      // a white or black sheen in a radial gradient lies in a corner, away from the words; a coloured field is measured
      let stops = (img.match(/rgba?\([^)]+\)/g) || []).map(parse);
      if (/radial-gradient/.test(img)) stops = stops.filter((c) => !(c[3] < 0.5 && new Set(c.slice(0, 3)).size === 1 && (c[0] === 255 || c[0] === 0)));
      if (stops.length) return { cands: stops.map((st) => { const c = over(st, bc); return [c[0], c[1], c[2], c[3] * k]; }) };
    }
    return { cands: [[bc[0], bc[1], bc[2], bc[3] * k]] };
  };
  const groundAt = (el, x, y) => {
    const stack = document.elementsFromPoint(x, y);
    let i = stack.indexOf(el);
    if (i < 0) return null;
    const layers = [];
    for (; i < stack.length; i++) {
      const L = layerOf(stack[i]);
      if (L.unmeasured) return L;
      if (L.cands.every((c) => c[3] <= 0.001)) continue;
      layers.push(L);
      if (L.cands.every((c) => c[3] >= 0.999)) break;
    }
    let cands = [[255, 255, 255, 1]];
    for (let j = layers.length - 1; j >= 0; j--) {
      const next = [];
      for (const c of layers[j].cands) for (const g of cands) next.push(over(c, g));
      cands = next.slice(0, 64);
    }
    return { cands };
  };
  const style = document.createElement('style');
  style.textContent = '*, *::before, *::after { pointer-events: auto !important; }';
  document.head.appendChild(style);
  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let t = walker.nextNode(); t; t = walker.nextNode()) if (t.textContent.trim()) texts.push(t);
  const results = [], done = new Set();
  const H = innerHeight, W = innerWidth;
  const total = document.scrollingElement.scrollHeight;
  let offscreen = 0;
  for (let y = 0; y < total + H; y += Math.floor(H * 0.8)) {
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    for (const t of texts) {
      const el = t.parentElement;
      if (!el || done.has(t)) continue;
      if (el.closest('script,style,noscript,template,[aria-hidden="true"],[hidden]')) { done.add(t); continue; }
      const cs = getComputedStyle(el);
      if (cs.display === 'none') { done.add(t); continue; }
      if (cs.visibility !== 'visible') continue;
      if (/Material Symbols/.test(cs.fontFamily)) { done.add(t); continue; }
      const range = document.createRange();
      range.selectNodeContents(t);
      const rect = [...range.getClientRects()].find((r) => r.width >= 1 && r.height >= 1);
      if (!rect) continue;
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      if (cy < 2 || cy > H - 2) continue;
      done.add(t);
      if (cx < 0 || cx > W) { offscreen++; continue; }
      const alpha = opacityOf(el);
      if (alpha < 0.02) continue;
      const exempt = !!el.closest('[data-contrast-exempt], :disabled, [aria-disabled="true"]');
      const inSvg = !!el.closest('svg');
      const fg0 = parse(inSvg ? (cs.fill && cs.fill !== 'none' ? cs.fill : cs.color) : cs.color) || [0, 0, 0, 1];
      const fg = [fg0[0], fg0[1], fg0[2], fg0[3] * alpha];
      const er = el.getBoundingClientRect();
      // a device board is a real screen shown scaled to fit: its type is judged at the size the device draws it
      const scale = !el.closest('.board') && el.offsetWidth ? er.width / el.offsetWidth : 1;
      const size = parseFloat(cs.fontSize) * (isFinite(scale) && scale > 0 ? scale : 1);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const text = t.textContent.trim().slice(0, 40);
      const g = groundAt(el, cx, cy);
      if (!g) continue;   // covered by something above it at this scroll position; measured when it shows
      if (g.unmeasured) { results.push({ el: label(el), text, unmeasured: g.unmeasured, exempt }); continue; }
      let full = Infinity, dim = Infinity;
      for (const c of g.cands) {
        const f = over(fg, c);
        full = Math.min(full, ratio(f, c, 1));
        dim = Math.min(dim, ratio(f, c, 0.2));
      }
      results.push({ el: label(el), text, full, dim, size, weight, exempt });
    }
  }
  style.remove();
  window.scrollTo(0, 0);
  const missed = texts.filter((t) => !done.has(t)).length;
  return { results, offscreen, missed };
};

// ---- in the page: frame timing, long animation frames, layout shift, animated properties ----
const PROBE = () => {
  const ALLOWED = new Set(['transform', 'opacity', 'translate', 'scale', 'rotate', 'clipPath', 'clip-path',
    'webkitClipPath', 'strokeDashoffset', 'stroke-dashoffset', 'visibility', 'offsetDistance']);
  const PAINT = new Set(['color', 'background-color', 'border-color', 'outline-color', 'box-shadow', 'fill', 'stroke',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'text-decoration-color',
    'outline-offset']);
  const w = window.__mp = { frames: [], loaf: [], shifts: [], bad: new Map(), on: false };
  let last = 0;
  const tick = (t) => { if (w.on && last) w.frames.push(t - last); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  // an engine that does not support an entry type ignores it silently, so ask first rather than report a zero
  const types = (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes) || [];
  w.noLoaf = !types.includes('long-animation-frame');
  w.noCls = !types.includes('layout-shift');
  if (!w.noLoaf) new PerformanceObserver((l) => { for (const e of l.getEntries()) if (w.on) w.loaf.push(e.duration); }).observe({ type: 'long-animation-frame', buffered: false });
  if (!w.noCls) new PerformanceObserver((l) => { for (const e of l.getEntries()) if (w.on && !e.hadRecentInput) w.shifts.push(e.value); }).observe({ type: 'layout-shift', buffered: false });
  w.sample = () => {
    for (const a of document.getAnimations()) {
      const t = a.effect && a.effect.target;
      const who = t ? (t.tagName || '').toLowerCase() + (t.className && typeof t.className === 'string' ? '.' + t.className.trim().split(/\s+/)[0] : '') : '?';
      if (a.transitionProperty) {
        const p = a.transitionProperty;
        const dur = a.effect.getTiming().duration;
        if (!ALLOWED.has(p) && !(PAINT.has(p) && dur <= 200)) w.bad.set(`${who}: transition of ${p} (${dur} ms)`, 1);
        continue;
      }
      let frames = [];
      try { frames = a.effect.getKeyframes(); } catch (e) { continue; }
      for (const f of frames) for (const k of Object.keys(f)) {
        if (['offset', 'easing', 'composite', 'computedOffset'].includes(k)) continue;
        if (!ALLOWED.has(k)) w.bad.set(`${who}: ${a.animationName ? '@keyframes ' + a.animationName : 'a Web Animation'} animates ${k}`, 1);
      }
      const it = a.effect.getTiming().iterations;
      if (it === Infinity) w.bad.set(`${who}: ${a.animationName || 'an animation'} loops forever`, 1);
    }
  };
  setInterval(w.sample, 120);
};

async function open(page, file) {
  // a real navigation, so init scripts run and the page has an origin of its own, as an artifact does
  await page.route('https://mp-design.test/**', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: wrap(readFileSync(file, 'utf8')) }));
  await page.goto('https://mp-design.test/', { waitUntil: 'load', timeout: 30_000 });
}

async function measurePage(pw, engine, file, theme, width) {
  const browser = engine === 'chrome'
    ? await pw.chromium.launch({ channel: 'chrome', headless: true })
    : await pw.webkit.launch({ executablePath: WEBKIT, headless: true });
  const issues = [];
  const res = { engine, theme, width };
  try {
    // contrast: Reduce Motion, so every arrival has landed
    const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, colorScheme: theme, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push(m.text()); });
    await open(page, file);
    await page.waitForTimeout(400);
    const over = await page.evaluate(() => document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth);
    if (over > 0) issues.push(`the page scrolls sideways by ${over} px`);
    const floor = /docs\/design\/(prism|journeys|admin)\//.test(file) ? [4.5, 3] : [7, 3.5];   // the owner chose MA's ink for Prism (brief-r4.md)
    const sweep = await page.evaluate(SWEEP);
    const texts = sweep.results;
    res.texts = texts.length;
    res.textsInSideScroll = sweep.offscreen;
    res.textsNeverShown = sweep.missed;
    let worst = null;
    for (const t of texts) {
      if (t.unmeasured) { if (!t.exempt) issues.push(`unmeasured text "${t.text}" (${t.el}): ${t.unmeasured}`); continue; }
      if (t.exempt) { if (t.full < 3) issues.push(`exempt text "${t.text}" (${t.el}) is ${t.full.toFixed(2)}:1, under 3:1 even at full brightness`); continue; }
      if (t.full < floor[0] || t.dim < floor[1]) issues.push(`"${t.text}" (${t.el}) is ${t.full.toFixed(2)}:1 full, ${t.dim.toFixed(2)}:1 at 20% (needs ${floor[0]} and ${floor[1]})`);
      if (t.size < 10.95) issues.push(`"${t.text}" (${t.el}) renders at ${t.size.toFixed(1)} px (at least 11)`);
      if (t.weight < 400) issues.push(`"${t.text}" (${t.el}) has weight ${t.weight} (at least 400)`);
      if (!worst || t.dim < worst.dim) worst = t;
    }
    const soft = await page.evaluate(() => [...document.querySelectorAll('svg.i')].filter((s) => { const r = s.getBoundingClientRect(); return r.width && r.height && (r.width % 1 || r.height % 1); }).slice(0, 8).map((s) => { const r = s.getBoundingClientRect(); return `${r.width}x${r.height}`; }));
    for (const x of soft) issues.push(`an icon renders at a fractional size (${x}); icons sit on whole pixels`);
    const dangling = await page.evaluate(() => [...new Set([...document.querySelectorAll('use')].map((u) => u.getAttribute('href') || u.getAttribute('xlink:href')).filter((h) => h && h.startsWith('#') && !document.querySelector(h)))]);
    for (const h of dangling) issues.push(`an icon points at ${h}, which has no symbol, so it draws nothing`);
    res.worstText = worst && { text: worst.text, el: worst.el, full: +worst.full.toFixed(2), dim: +worst.dim.toFixed(2) };
    for (const e of errors) issues.push(`console: ${e.slice(0, 200)}`);
    await ctx.close();

    // motion and smoothness: full motion, Chrome's CPU slowed four times
    const mctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, colorScheme: theme, reducedMotion: 'no-preference', deviceScaleFactor: width < 600 ? 2 : 1 });
    const mp = await mctx.newPage();
    if (engine === 'chrome') {
      const cdp = await mctx.newCDPSession(mp);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    }
    await mp.addInitScript(PROBE);
    await open(mp, file);
    await mp.waitForTimeout(600);
    await mp.evaluate(() => { window.__mp.on = true; });
    await mp.waitForTimeout(1500);                                  // the first arrivals
    const total = await mp.evaluate(() => document.scrollingElement.scrollHeight);
    await mp.mouse.move(width / 2, 300);
    for (let y = 0; y < total; y += 240) { await mp.mouse.wheel(0, 240); await mp.waitForTimeout(32); }   // a steady scroll
    await mp.evaluate(() => window.scrollTo(0, 0));
    await mp.waitForTimeout(300);
    const taps = await mp.$$('[role="tab"], [role="radio"], [aria-pressed]');
    let tapped = 0;
    for (const b of taps) {
      if (tapped >= 12) break;
      if (!(await b.isVisible())) continue;
      try { await b.click({ timeout: 1500, trial: false }); tapped++; await mp.waitForTimeout(260); } catch (e) { /* covered or moving: the next one */ }
    }
    res.tapped = tapped;
    const toggle = await mp.$('[data-theme-set="dark"], [data-set-theme="dark"], button:has-text("Dark")');
    if (toggle && (await toggle.isVisible())) { try { await toggle.click({ timeout: 1500 }); await mp.waitForTimeout(500); } catch (e) { /* none */ } }
    const m = await mp.evaluate(() => { window.__mp.sample(); const w = window.__mp; w.on = false; return { frames: w.frames, loaf: w.loaf, shifts: w.shifts, bad: [...w.bad.keys()], noLoaf: !!w.noLoaf, noCls: !!w.noCls }; });
    const fr = m.frames.filter((d) => d > 0);
    const okFrames = fr.filter((d) => d <= BUDGET.frameMs).length;
    res.frames = fr.length;
    res.frameShare = fr.length ? +(okFrames / fr.length).toFixed(3) : null;
    res.p95 = fr.length ? +[...fr].sort((a, b) => a - b)[Math.floor(fr.length * 0.95)].toFixed(1) : null;
    res.longestLoaf = m.noLoaf ? 'not measured in this engine' : Math.max(0, ...m.loaf);
    res.cls = m.noCls ? 'not measured in this engine' : +m.shifts.reduce((a, b) => a + b, 0).toFixed(4);
    if (!fr.length) issues.push('no frames were recorded');
    else if (res.frameShare < BUDGET.frameOk) issues.push(`${(res.frameShare * 100).toFixed(1)}% of ${fr.length} frames within ${BUDGET.frameMs} ms (needs ${BUDGET.frameOk * 100}%); p95 ${res.p95} ms`);
    if (!m.noLoaf && res.longestLoaf > BUDGET.loafMs) issues.push(`a long animation frame of ${res.longestLoaf.toFixed(0)} ms (at most ${BUDGET.loafMs})`);
    if (!m.noCls && res.cls > BUDGET.cls) issues.push(`layout shift ${res.cls} (under ${BUDGET.cls})`);
    for (const b of m.bad) issues.push(`motion: ${b}`);
    await mctx.close();
  } finally {
    await browser.close();
  }
  res.issues = [...new Set(issues)];
  return res;
}

let pw;
try { pw = require(PW); } catch (e) { console.error(`design-runtime: FAIL playwright-core not found at ${PW}`); process.exit(1); }
const report = [];
let failed = 0;
for (const p of pages) {
  const file = resolve(p);
  for (const engine of ENGINES) {
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        let r;
        try { r = await measurePage(pw, engine, file, theme, width); }
        catch (e) { r = { engine, theme, width, issues: [`could not measure: ${String(e).split('\n')[0]}`] }; }
        r.page = p;
        report.push(r);
        const head = `${p} ${engine} ${theme} ${width}px`;
        const stats = r.frames != null ? ` texts ${r.texts}, worst ${r.worstText ? r.worstText.dim + ':1 at 20%' : '-'}, frames ${r.frameShare != null ? (r.frameShare * 100).toFixed(1) + '%' : '-'} ok (p95 ${r.p95} ms), LoAF ${r.longestLoaf}, CLS ${r.cls}, tapped ${r.tapped}` : '';
        if (r.issues.length) {
          failed += r.issues.length;
          console.log(`FAIL ${head}:${stats}`);
          for (const i of r.issues.slice(0, 25)) console.log(`  - ${i}`);
          if (r.issues.length > 25) console.log(`  ... and ${r.issues.length - 25} more`);
        } else console.log(`ok   ${head}:${stats}`);
      }
    }
  }
}
if (out) writeFileSync(out, JSON.stringify(report, null, 1));
clearTimeout(timer);
process.exit(failed ? 1 : 0);
