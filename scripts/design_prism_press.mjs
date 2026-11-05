#!/usr/bin/env node
// Press what the Impeccable audit found on the Prism pages (MP-182, MP-181): a control is proved by pressing it (lessons 32, 35).
//   perl -e 'alarm shift; exec @ARGV' 120 node scripts/design_prism_press.mjs [--only theme,focus,sheet,flip,text,narrow] [--root DIR]
//   perl -e 'alarm shift; exec @ARGV' 600 node scripts/design_prism_press.mjs --selftest [--case TEXT]
// Exit 0 when all hold, 1 when one fails, 2 when a page or a mutation cannot be read: a gate fails closed (lesson 8).
// The selftest undoes each fix on a copy and must see that fix's own failure, so a check is proved by undoing its fix (lesson 34).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const pw = require(process.env.PLAYWRIGHT_CORE || '/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core');
const here = dirname(fileURLToPath(import.meta.url));
const arg = (name) => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const ROOT = resolve(arg('--root') || join(here, '..'));
const SELFTEST = process.argv.includes('--selftest');
const CHECKS = ['theme', 'focus', 'sheet', 'flip', 'text', 'narrow'];
const only = arg('--only') ? arg('--only').split(',') : CHECKS;
for (const c of only) if (!CHECKS.includes(c)) { console.log(`FAIL no check named ${c}`); process.exit(2); }

const FILES = { prism: 'docs/design/prism/index.html', owner: 'docs/design/journeys/index.html', admin: 'docs/design/admin/index.html' };
const source = {};
for (const [k, f] of Object.entries(FILES)) {
  try { source[k] = readFileSync(join(ROOT, f), 'utf8'); } catch (e) { console.log(`FAIL cannot read ${f}`); process.exit(2); }
}
const wrap = (s) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>${s}</body></html>`;

async function open(b, pages, page, opts = {}) {
  const c = await b.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', reducedMotion: 'reduce', ...opts.context });
  if (opts.init) await c.addInitScript(opts.init);
  const p = await c.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).split('\n')[0].slice(0, 160)));
  await p.route('https://j.test/**', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: wrap(pages[page]) }));
  await p.goto(`https://j.test/${opts.hash || ''}`);
  await p.waitForTimeout(opts.wait ?? 700);
  return { c, p, errs };
}
const framesReady = (p, n = 2) => p.waitForFunction((want) => document.querySelectorAll('#jrow .dev').length >= want, n, { timeout: 8000 });
const themeOf = (p) => p.evaluate(() => {
  const d = [...document.querySelectorAll('#jrow [data-slot]')];
  return {
    n: d.length,
    dark: d.filter((x) => x.querySelector('.dev').classList.contains('scheme-dark')).length,
    both: d.filter((x) => { const c = x.querySelector('.dev').classList; return c.contains('scheme-dark') && c.contains('scheme-light'); }).length,
    tags: [...new Set(d.map((x) => x.querySelector('.bcap .tag').textContent))],
    labels: [...new Set(d.map((x) => (x.querySelector('.scr').getAttribute('aria-label').match(/(light|dark) theme$/) || [])[1]))],
  };
});

const run = {
  // UX-15: a frame already drawn follows a theme press, on both pages, with no reload, and keeps what it shows
  async theme(b, pages, must) {
    for (const [page, hash, want] of [['owner', '#home.a.iphone.default', 14], ['admin', '#costs.a.iphone.default', 3]]) {
      const { c, p, errs } = await open(b, pages, page, { hash });
      await framesReady(p, want);
      await p.waitForTimeout(600);
      const start = await themeOf(p);
      must(start.n >= want && start.dark === 0, `theme: ${page} does not start light (${JSON.stringify(start)})`);
      if (page === 'owner') { await p.locator('#jrow [data-flip]').first().click(); await p.waitForTimeout(700); }
      await p.evaluate(() => { const s = document.querySelector('#jrow .jscroll'); if (s) s.scrollTop = 120; document.querySelector('#jrow').scrollLeft = 60; });
      const held = () => p.evaluate(() => { const r = document.querySelector('#jrow'), s = r.querySelector('.jscroll'), d = r.querySelector('.scr'); return JSON.stringify({ frame: s ? s.scrollTop : 0, row: r.scrollLeft, data: { ...d.dataset } }); });
      const kept = await held();
      const y = await p.evaluate(() => { scrollTo(0, 400); return scrollY; });
      const at = await p.evaluate(() => [...document.querySelectorAll('#jrow .scr')].map((s) => s.dataset.at).join());
      await p.evaluate(() => document.querySelector('[data-t="dark"]').click());   // the page's own press: a tool's click scrolls first
      await p.waitForTimeout(150);
      const dark = await themeOf(p);
      must(dark.dark === dark.n && dark.n === start.n, `theme: ${page}: Dark left ${dark.n - dark.dark} of ${dark.n} frames light`);
      must(!dark.both, `theme: ${page}: a frame holds both themes`);
      must(dark.tags.join() === 'Dark', `theme: ${page}: the caption says ${dark.tags.join()}`);
      must(dark.labels.join() === 'dark', `theme: ${page}: the frame's name says ${dark.labels.join()}`);
      must(await p.evaluate(() => [...document.querySelectorAll('#jrow .scr')].map((s) => s.dataset.at).join()) === at, `theme: ${page}: a press changed what the frames show`);
      must(await held() === kept, `theme: ${page}: a press lost a frame's scroll or detail`);
      const moved = await p.evaluate(() => scrollY);
      must(Math.abs(moved - y) < 2, `theme: ${page}: a press moved the page from ${y} to ${moved}`);
      const paint = await p.evaluate(() => { const d = document.querySelector('#jrow .dev'); return getComputedStyle(d).getPropertyValue('--ink').trim() === getComputedStyle(document.documentElement).getPropertyValue('--ink').trim(); });
      must(paint, `theme: ${page}: a frame's ink is not the page's ink`);
      await p.locator('[data-t="light"]').click();
      await p.waitForTimeout(150);
      const light = await themeOf(p);
      must(light.dark === 0 && light.tags.join() === 'Light', `theme: ${page}: Light did not come back (${JSON.stringify(light)})`);
      // a press while frames are still arriving leaves no mixed set
      await p.evaluate(([s]) => window.__prismJourneys.go(...s), [page === 'owner' ? ['forecast', 'a', 'iphone', 'default'] : ['costs', 'a', 'iphone', 'default']]);
      await p.locator('[data-t="dark"]').click();
      await p.waitForTimeout(1600);
      const mid = await themeOf(p);
      must(mid.n > 1 && mid.dark === mid.n, `theme: ${page}: a press mid-draw left ${mid.n - mid.dark} of ${mid.n} frames light`);
      must(!errs.length, `theme: ${page}: ${errs[0]}`);
      await c.close();
    }
    // the system's own change reaches the frames under Auto, on both pages, and a flip made after it keeps the frame's new theme
    for (const [page, hash, want] of [['owner', '#home.a.iphone.default', 14], ['admin', '#costs.a.iphone.default', 3]]) {
      const { c, p } = await open(b, pages, page, { hash });
      await framesReady(p, want);
      await p.waitForTimeout(600);
      await p.emulateMedia({ colorScheme: 'dark' });
      await p.waitForTimeout(150);
      const sys = await themeOf(p);
      must(sys.dark === sys.n, `theme: ${page}: the system going dark left ${sys.n - sys.dark} of ${sys.n} frames light`);
      if (page === 'owner') {
        await p.locator('#jrow [data-flip]').first().click();
        await p.waitForTimeout(700);
        must(await p.evaluate(() => document.querySelector('#jrow .dev').classList.contains('scheme-dark')), 'theme: owner: a flip lost the frame\'s theme');
      }
      await c.close();
    }
    // Compare holds drawn frames too: a theme press or a system change restyles them in place, so a row keeps its scroll
    const { c, p, errs } = await open(b, pages, 'admin', { hash: '#compare', context: { viewport: { width: 1000, height: 800 } } });
    await p.waitForSelector('.acard .dev');
    const cards = () => p.evaluate(() => { const d = [...document.querySelectorAll('.acard .dev')]; return { n: d.length, dark: d.filter((x) => x.classList.contains('scheme-dark')).length, scroll: [...document.querySelectorAll('.acmp-row')].map((r) => r.scrollLeft).join() }; });
    await p.evaluate(() => document.querySelectorAll('.acmp-row').forEach((r) => { r.scrollLeft = 200; }));
    const first = await cards();
    must(first.n > 0 && /[1-9]/.test(first.scroll), `theme: compare: no row scrolled, so this proves nothing (${JSON.stringify(first)})`);
    await p.emulateMedia({ colorScheme: 'dark' });
    await p.waitForTimeout(150);
    const sys = await cards();
    must(sys.dark === sys.n, `theme: compare: the system going dark left ${sys.n - sys.dark} of ${sys.n} cards light`);
    must(sys.scroll === first.scroll, `theme: compare: a system change lost the rows' scroll, ${first.scroll} to ${sys.scroll}`);
    await p.evaluate(() => document.querySelector('[data-t="light"]').click());
    await p.waitForTimeout(150);
    const pressed = await cards();
    must(pressed.dark === 0, `theme: compare: Light left ${pressed.dark} of ${pressed.n} cards dark`);
    must(pressed.scroll === first.scroll, `theme: compare: a theme press lost the rows' scroll, ${first.scroll} to ${pressed.scroll}`);
    must(!errs.length, `theme: compare: ${errs[0]}`);
    await c.close();
  },

  // UX-08: a selector redraws itself when pressed, and focus stays on the control pressed
  async focus(b, pages, must) {
    for (const page of ['owner', 'admin']) {
      const { c, p, errs } = await open(b, pages, page);
      for (const [sel, n] of [['#jopt', 1], ['#jsurf', 2], ['#jstate', 3]]) {
        await p.locator(`${sel} button`).nth(n).focus();
        const name = (await p.locator(`${sel} button`).nth(n).textContent()).trim();
        await p.keyboard.press('Enter');
        await p.waitForTimeout(250);
        const a = await p.evaluate(() => ({ tag: document.activeElement.tagName, text: document.activeElement.textContent.trim(), pressed: document.activeElement.getAttribute('aria-pressed') }));
        must(a.tag === 'BUTTON' && a.text === name, `focus: ${page} ${sel}: focus landed on ${a.tag} "${a.text.slice(0, 20)}", not "${name.slice(0, 20)}"`);
        must(a.pressed === 'true', `focus: ${page} ${sel}: the control under focus is not the chosen one`);
        must((await p.locator('#jlive').textContent()).includes(name.slice(0, 8)), `focus: ${page} ${sel}: the change was not said`);
      }
      // the next press works from where focus landed: focus is proved across a change of state (lesson 35)
      await p.keyboard.press('Tab');
      must(await p.evaluate(() => document.activeElement !== document.body), `focus: ${page}: Tab after a press fell to the page`);
      must(!errs.length, `focus: ${page}: ${errs[0]}`);
      await c.close();
    }
  },

  // UX-01: Prism's sheet spec says focus moves in and returns, and this is the one live sheet
  async sheet(b, pages, must) {
    const { c, p, errs } = await open(b, pages, 'prism', { wait: 1200 });
    const seen = await p.waitForFunction(() => document.querySelector('#sheetOpen'), null, { timeout: 8000 }).then(() => true, () => false);
    must(seen, 'sheet: the demo never drew');
    if (!seen) { await c.close(); return; }
    await p.evaluate(() => document.querySelector('#sheetOpen').scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(300);
    const at = () => p.evaluate(() => { const a = document.activeElement; return { id: a.id || a.tagName, inside: !!a.closest('[role=dialog]') }; });
    const quiet = async (when, ids = ['sheetClose', 'sheetRecord', 'sheetUndo']) => {
      for (const id of ids) must(await p.evaluate((i) => { const e = document.getElementById(i), was = document.activeElement; e.focus(); const r = document.activeElement === e; e.blur(); if (was && was.focus) was.focus(); return !r; }, id), `sheet: ${when}, ${id} can still take focus`);
    };
    await quiet('closed');
    await p.focus('#sheetOpen');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
    const first = await at();
    must(first.inside, `sheet: opening left focus on ${first.id}`);
    must(await p.evaluate(() => document.querySelector('#sheetOpen').closest('[inert]') !== null), 'sheet: the page behind is not inert');
    must(await p.evaluate(() => { const e = document.querySelector('.pbar'); return !!e && e.closest('[inert]') !== null; }), 'sheet: the page bar is not inert');
    await quiet('open', ['sheetUndo']);
    const stops = [];
    for (let i = 0; i < 4; i++) { await p.keyboard.press('Tab'); stops.push(await at()); }
    must(stops.every((s) => s.inside), `sheet: Tab left the sheet for ${stops.find((s) => !s.inside)?.id}`);
    must(new Set(stops.map((s) => s.id)).size === 2, `sheet: Tab reached ${[...new Set(stops.map((s) => s.id))].join()}, not both buttons`);
    await p.keyboard.press('Shift+Tab');
    must((await at()).inside, 'sheet: Shift+Tab left the sheet');
    await p.keyboard.press('Escape');
    await p.waitForTimeout(100);
    must((await at()).id === 'sheetOpen', `sheet: Escape returned focus to ${(await at()).id}`);
    must(await p.evaluate(() => document.querySelector('#sheetOpen').closest('[inert]') === null), 'sheet: the page stayed inert after closing');
    await quiet('after Escape');
    // Not now closes it and returns, the scrim does too, and Record lands on Undo, which returns too
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
    await p.keyboard.press('Enter');   // focus starts on Not now
    await p.waitForTimeout(100);
    must(await p.evaluate(() => !document.querySelector('#sheetDemo').classList.contains('open')), 'sheet: Not now did not close it');
    must((await at()).id === 'sheetOpen', `sheet: Not now returned focus to ${(await at()).id}`);
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
    await p.evaluate(() => document.querySelector('#sheetScrim').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    must((await at()).id === 'sheetOpen', 'sheet: the scrim did not return focus');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
    const hit = await p.evaluate(() => { const r = document.querySelector('#sheetScrim').getBoundingClientRect(); return document.elementFromPoint(r.left + 20, r.top + 20)?.id; });
    must(hit === 'sheetScrim', `sheet: a press on the scrim lands on "${hit}", so it cannot close the sheet`);
    await p.focus('#sheetRecord');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
    must((await at()).id === 'sheetUndo', `sheet: Record left focus on ${(await at()).id}`);
    must(await p.evaluate(() => document.querySelector('#sheetDemo').classList.contains('saved') && !document.querySelector('#sheetDemo').classList.contains('open')), 'sheet: Record did not record');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
    must((await at()).id === 'sheetOpen', `sheet: Undo left focus on ${(await at()).id}`);
    must(await p.evaluate(() => !document.querySelector('#sheetDemo').classList.contains('saved')), 'sheet: Undo did not undo');
    await quiet('after Undo');
    await p.waitForTimeout(100);
    // Record, then open again without Undo: the old toast hides, and takes no focus behind the sheet or after it
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
    await p.focus('#sheetRecord');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
    await p.focus('#sheetOpen');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
    await p.keyboard.press('Escape');
    await p.waitForTimeout(100);
    await quiet('after Record and open again');
    // the sheet comes into view when its trigger sits at the bottom of the window, and the way back finds the trigger after the page moved
    await p.evaluate(() => { const r = document.querySelector('#sheetDemo').getBoundingClientRect(), t = document.querySelector('#sheetOpen').getBoundingClientRect(); scrollBy(0, t.bottom - innerHeight + 8); return r.top; });
    await p.waitForTimeout(100);
    await p.focus('#sheetOpen', { preventScroll: true }).catch(() => {});
    await p.evaluate(() => document.querySelector('#sheetOpen').focus({ preventScroll: true }));
    await p.keyboard.press('Enter');
    await p.waitForTimeout(150);
    const seenAt = await p.evaluate(() => { const r = document.querySelector('#sheetClose').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: innerHeight }; });
    must(seenAt.top >= 0 && seenAt.bottom <= seenAt.h, `sheet: it opened off screen, its first button at ${Math.round(seenAt.top)} of ${seenAt.h}`);
    await p.evaluate(() => scrollBy(0, 900));
    await p.waitForTimeout(100);
    await p.keyboard.press('Escape');
    await p.waitForTimeout(150);
    const backAt = await p.evaluate(() => { const r = document.querySelector('#sheetOpen').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: innerHeight }; });
    must(backAt.top >= 0 && backAt.bottom <= backAt.h, `sheet: focus returned to a trigger off screen, at ${Math.round(backAt.top)} of ${backAt.h}`);
    // Escape with the sheet closed takes nothing away from where focus is
    await p.locator('#themectl button').first().focus();
    await p.keyboard.press('Escape');
    must((await at()).id !== 'sheetOpen', 'sheet: Escape on a closed sheet stole focus');
    must(!errs.length, `sheet: ${errs[0]}`);
    await c.close();
  },

  // UX-07: a flip stays on this device, journey by journey, and refused storage breaks nothing
  async flip(b, pages, must) {
    const hash = '#home.a.iphone.default';
    const { c, p, errs } = await open(b, pages, 'owner', { hash });
    await framesReady(p, 14);
    await p.waitForTimeout(500);
    const first = () => p.evaluate(() => document.querySelector('#jrow .scr').dataset.at);
    const was = await first();
    await p.locator('#jrow [data-flip]').first().click();
    await p.waitForTimeout(700);
    const turned = await first();
    must(turned !== was, 'flip: the flip did not turn');
    const stored = await p.evaluate(() => localStorage.getItem('mp178-flips') || '');
    must(!/£|\d{2,}\.\d{2}/.test(stored), `flip: a figure was kept: ${stored.slice(0, 60)}`);
    await p.reload();
    await framesReady(p, 14);
    await p.waitForTimeout(500);
    must(await first() === turned, `flip: a reload returned ${await first()}, not ${turned}`);
    must(/Turned to/.test(await p.locator('#jrow .bcap').first().textContent()), 'flip: a kept flip does not say it is turned');
    await p.evaluate(() => window.__prismJourneys.go('forecast', 'a', 'iphone', 'default'));
    await p.waitForTimeout(900);
    must(!/Turned to/.test(await p.locator('#jrow').textContent()), 'flip: a flip on Home turned another journey');
    await p.evaluate(() => window.__prismJourneys.go('home', 'a', 'iphone', 'default'));
    await p.waitForTimeout(900);
    must(await first() === turned, 'flip: leaving and returning lost the flip');
    await p.locator('#jrow [data-flip]').first().click();
    await p.waitForTimeout(700);
    must(await first() === was, `flip: turning back after a reload reached ${await first()}`);
    await p.reload();
    await framesReady(p, 14);
    await p.waitForTimeout(500);
    must(await first() === was, 'flip: a turned-back frame did not stay back after a reload');
    // a detail pressed on a turned frame after a reload does not come home with it
    await p.locator('#jrow [data-flip]').first().click();
    await p.waitForTimeout(700);
    await p.reload();
    await framesReady(p, 14);
    await p.waitForTimeout(500);
    await p.evaluate(() => { document.querySelector('#jrow .scr').dataset.t = 'X'; });
    await p.locator('#jrow [data-flip]').first().click();
    await p.waitForTimeout(700);
    must(await p.evaluate(() => document.querySelector('#jrow .scr').dataset.t === undefined), 'flip: a turn back kept a detail from the turned frame');
    await p.evaluate(() => localStorage.removeItem('mp178-flips'));
    // only the view is kept: never the instrument or the horizon pressed on the way
    await p.evaluate(() => window.__prismJourneys.go('forecast', 'b', 'iphone', 'default'));
    await p.waitForTimeout(900);
    await p.evaluate(() => { const s = document.querySelector('#jrow [data-slot="b-ladder"] .scr'); s.querySelectorAll('[data-dossier]')[0].click(); s.querySelector('[data-flip]').click(); });
    await p.waitForTimeout(700);
    const kept = await p.evaluate(() => localStorage.getItem('mp178-flips') || '');
    must(kept.includes('b-ladder'), `flip: the detail test turned nothing (${kept.slice(0, 60)})`);
    must(!/"(t|hz|mode|got)"|AAPL/.test(kept), `flip: it kept more than the view: ${kept.slice(0, 120)}`);
    // a second tab keeps its own flip and leaves the first tab's alone
    await p.evaluate(() => { localStorage.removeItem('mp178-flips'); window.__prismJourneys.go('home', 'a', 'iphone', 'default'); });
    await p.waitForTimeout(900);
    const q = await c.newPage();
    await q.route('https://j.test/**', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: wrap(pages.owner) }));
    await q.goto('https://j.test/#forecast.a.iphone.default');
    await q.waitForTimeout(1500);
    await p.locator('#jrow [data-flip]').first().click();
    await p.waitForTimeout(700);
    await q.locator('#jrow [data-flip]').first().click();
    await q.waitForTimeout(700);
    const both = await q.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('mp178-flips') || '{}')).map((k) => k.split('|')[0]).sort().join());
    must(both === 'forecast,home', `flip: a second tab left the record as "${both}"`);
    await q.close();
    must(!errs.length, `flip: ${errs[0]}`);
    await c.close();
    // an approval step keeps no flip control, so nothing can be kept for it
    for (const [why, init] of [
      ['refused storage', () => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('refused'); } }); }],
      ['a malformed record', () => { try { localStorage.setItem('mp178-flips', '{"x":1,"home|a|a-portfolio":{"o":"b","s":"gone"}}'); } catch (e) { /* nothing kept */ } }],
      ['unreadable storage', () => { try { localStorage.setItem('mp178-flips', 'not json'); } catch (e) { /* nothing kept */ } }],
      ['a bad way back', () => { try { localStorage.setItem('mp178-flips', '{"home|a|a-portfolio":{"o":"b","s":"b-ledger","st":"default","landed":"home|b|b-ledger","from":5}}'); } catch (e) { /* nothing kept */ } }],
    ]) {
      const o = await open(b, pages, 'owner', { hash, init });
      await framesReady(o.p, 14);
      await o.p.waitForTimeout(400);
      must(await o.p.evaluate(() => document.querySelector('#jrow .scr').dataset.at) === was, `flip: ${why} did not start in A`);
      await o.p.locator('#jrow [data-flip]').first().click();
      await o.p.waitForTimeout(700);
      must(await o.p.evaluate(() => document.querySelector('#jrow .scr').dataset.at) === turned, `flip: with ${why} the flip did not turn`);
      must(!o.errs.length, `flip: with ${why}: ${o.errs[0]}`);
      await o.c.close();
    }
  },

  // UX-10: no frame text under 12 px as drawn, so a chart's viewBox scaling counts, in the places it was found
  async text(b, pages, must) {
    const { c, p } = await open(b, pages, 'owner');
    await p.evaluate(() => { window.__prismNoFit = window.__prismInstantFlip = true; });
    for (const [j, o, s] of [['home', 'a', 'iphone'], ['home', 'b', 'iphone'], ['cost', 'a', 'iphone'], ['cost', 'b', 'ipad'], ['research', 'a', 'ipad'], ['research', 'b', 'ipad']]) {
      await p.evaluate(([j, o, s]) => window.__prismJourneys.go(j, o, s, 'default'), [j, o, s]);
      await p.waitForTimeout(350);
      const small = await p.evaluate(() => { const hit = []; document.querySelectorAll('#jrow .scr').forEach((sc) => { const w = document.createTreeWalker(sc, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(), e = n.parentElement; if (!t || !e.getClientRects().length) continue; const g = e.closest('text'), z = g ? g.getScreenCTM().a : 1, px = parseFloat(getComputedStyle(e).fontSize) * z; if (px < 11.95) hit.push(`${t.slice(0, 12)} ${px.toFixed(2)}px`); } }); return hit; });
      must(!small.length, `text: ${j}.${o}: ${small.length} runs under 12 px, as "${small[0]}"`);
    }
    await c.close();
  },

  // UX-05: the review pages hold at 320 CSS px, and the bar does not collide at any width up to where it stops being tight.
  // Every width for the bar, because a collision can sit in a band a few sample widths step over (R1-f3).
  async narrow(b, pages, must) {
    const widths = []; for (let w = 320; w <= 820; w += 3) widths.push(w);
    for (const page of ['prism', 'owner', 'admin']) {
      const { c, p } = await open(b, pages, page, { context: { viewport: { width: 1000, height: 800 } } });
      for (const width of widths) {
        await p.setViewportSize({ width, height: 800 });
        await p.waitForTimeout(25);
        const r = await p.evaluate(() => {
          const box = (e) => { const g = document.createRange(); g.selectNodeContents(e); return g.getBoundingClientRect(); };
          const name = document.querySelector('.pbar .brand > span:last-child'), dim = document.querySelector('.pbar .dimctl'), seg = document.querySelector('.pbar .segctl');
          const bn = box(name), bd = dim.getBoundingClientRect(), bs = seg.getBoundingClientRect();
          const shown = bn.width > 2 && getComputedStyle(name).clipPath === 'none';
          const out = [...document.querySelectorAll('.pbar button, .pbar a, .jctl button')].filter((x) => { const k = x.getBoundingClientRect(); return k.width && k.right > innerWidth + .5; }).map((x) => x.textContent.trim().slice(0, 16));
          return { hit: shown && bn.right > bd.left + .5, dimHit: bd.right > bs.left + .5, named: (name.textContent || '').trim().length > 0, out };
        });
        must(!r.hit, `narrow: ${page} at ${width}: the page's name runs into the switch`);
        must(!r.dimHit, `narrow: ${page} at ${width}: the switch runs into the theme control`);
        must(r.named, `narrow: ${page} at ${width}: the page lost its name`);
        must(!r.out.length, `narrow: ${page} at ${width}: "${r.out[0]}" sits past the edge`);
      }
      for (const width of [320, 360, 390, 480, 600, 768]) {
        await p.setViewportSize({ width, height: 800 });
        await p.waitForTimeout(120);
        const r = await p.evaluate(() => {
          const vw = innerWidth, spill = [];
          for (const e of document.querySelectorAll('body *')) {
            const rc = e.getBoundingClientRect();
            if (!rc.width || rc.right <= vw + .5) continue;
            let a = e.parentElement, clipped = false;
            while (a && a !== document.body) { if (getComputedStyle(a).overflowX !== 'visible') { clipped = true; break; } a = a.parentElement; }
            if (!clipped) spill.push(`${e.tagName}${e.id ? '#' + e.id : ''} ${Math.round(rc.right)}`);
          }
          return { w: document.documentElement.scrollWidth, vw, spill: spill.slice(0, 2) };
        });
        must(r.w <= r.vw, `narrow: ${page} at ${width}: the page is ${r.w} wide`);
        must(!r.spill.length, `narrow: ${page} at ${width}: ${r.spill.join(', ')} runs past the edge`);
        if (page !== 'prism') {
          const lab = await p.evaluate(() => [...document.querySelectorAll('.jctl .segctl button')].filter((x) => x.scrollWidth > x.clientWidth + 1).map((x) => x.textContent.trim().slice(0, 20)));
          must(!lab.length, `narrow: ${page} at ${width}: "${lab[0]}" spills out of its control`);
        }
      }
      if (page !== 'prism') {
        // at 480 and under the lens is gone, so the chosen control must still look chosen
        await p.setViewportSize({ width: 320, height: 800 });
        await p.waitForTimeout(120);
        const look = await p.evaluate(() => [...document.querySelectorAll('.jctl .segctl')].map((g) => { const on = g.querySelector('button[aria-pressed="true"]'), off = g.querySelector('button[aria-pressed="false"]'); return !on || !off || getComputedStyle(on).backgroundColor !== getComputedStyle(off).backgroundColor; }));
        must(look.length > 0 && look.every(Boolean), `narrow: ${page} at 320: the chosen control looks like the others`);
      }
      await c.close();
    }
  },
};

async function sweep(b, pages, names) {
  const fails = [];
  const must = (ok, why) => { if (!ok) fails.push(why); };
  for (const n of names) {
    try { await run[n](b, pages, must); } catch (e) { fails.push(`${n}: could not finish: ${String(e).split('\n')[0].slice(0, 140)}`); }
  }
  return fails;
}

// Each case undoes one fix on a copy. It names the failure it expects, so it cannot pass on a failure of its own making (lesson 9).
const UNDO = [
  ['a theme press leaves the frames alone', 'theme', [['owner', 'if (sum.retheme) sum.retheme();', '']], /theme: owner: Dark left/],
  ['the admin page leaves its frames alone', 'theme', [['admin', 'if (sum.retheme) sum.retheme();', '']], /theme: admin: Dark left/],
  ['a system theme change is not watched', 'theme', [['owner', "matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaint);", '']], /the system going dark/],
  ['the caption keeps its old theme', 'theme', [['owner', "if (tag) tag.textContent = sch === 'light' ? 'Light' : 'Dark';", '']], /the caption says/],
  ['the frame keeps its old name', 'theme', [['admin', 'scr.setAttribute(\'aria-label\', (scr.getAttribute(\'aria-label\') || \'\').replace(/, (light|dark) theme$/, `, ${sch} theme`));', '']], /the frame's name says/],
  ['admin does not watch the system theme', 'theme', [['admin', "matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaint);", '']], /theme: admin: the system going dark/],
  ['Compare is not repainted', 'theme', [['admin', "$$('.acard .dev').forEach(d => { d.classList.remove('scheme-light', 'scheme-dark'); d.classList.add(`scheme-${sch}`); });", '']], /theme: compare: the system going dark/],
  ['Compare redraws on a press', 'theme', [['admin', "$$('.acard .dev').forEach(d => { d.classList.remove('scheme-light', 'scheme-dark'); d.classList.add(`scheme-${sch}`); });", 'if (sum.cmp) drawCompare();']], /theme: compare: a (theme press|system change) lost the rows' scroll/],
  ['a frame arriving mid-draw reads an old theme', 'theme', [['owner', "scheme: scheme(), journey: j.id", "scheme: 'light', journey: j.id"]], /a press mid-draw left/],
  ['a press resets a frame', 'theme', [['owner', "      dev.classList.remove('scheme-light', 'scheme-dark');\n", "      dev.classList.remove('scheme-light', 'scheme-dark');\n      $('.jscroll', box) && ($('.jscroll', box).scrollTop = 0);\n"]], /a press lost a frame's scroll or detail/],
  ['a selector press is not said', 'focus', [['owner', "  $('#jlive').textContent = said;\n  setTimeout", "  setTimeout"]], /the change was not said/],
  ['the option selector drops focus', 'focus', [['owner', "setTimeout(() => { const b = $$(`${sel} button`)[i]; if (b) b.focus({ preventScroll: true }); });", '']], /focus: owner #jopt: focus landed on BODY/],
  ['the state chips drop focus', 'focus', [['admin', "setTimeout(() => { const n = $$('button', el).find(x => x.dataset.k === k); if (n) n.focus({ preventScroll: true }); });", '']], /focus: admin #jstate: focus landed on BODY/],
  ['the sheet takes no focus', 'sheet', [['prism', '(to || (v ? $(\'#sheetClose\') : trigger)).focus({ preventScroll: true });', '']], /sheet: opening left focus/],
  ['the page behind stays live', 'sheet', [['prism', '    quiet(v);\n', '']], /the page behind is not inert/],
  ['Tab can leave the sheet', 'sheet', [['prism', "if (e.key !== 'Tab') return;", 'return;'], ['prism', '    quiet(v);\n', '']], /sheet: Tab left the sheet/],
  ['the scrim goes inert with the page', 'sheet', [['prism', 'if (c === n || c === scrim || c.inert', 'if (c === n || c.inert']], /a press on the scrim lands/],
  ['Not now does nothing', 'sheet', [['prism', "$('#sheetClose').addEventListener('click', () => open(false));", '']], /Not now did not close it/],
  ['Undo leaves the toast live', 'sheet', [['prism', "st.classList.remove('saved'); toast.inert = true; trigger.focus({ preventScroll: true });", "st.classList.remove('saved'); trigger.focus({ preventScroll: true });"]], /after Undo, sheetUndo can still take focus/],
  ['opening again leaves the toast live', 'sheet', [['prism', "if (v) { st.classList.remove('saved'); toast.inert = true; }", "if (v) { st.classList.remove('saved'); }"]], /open, sheetUndo can still take focus|after Record and open again, sheetUndo/],
  ['the sheet opens off screen', 'sheet', [['prism', "if (v) st.scrollIntoView({ block: 'nearest' });", '']], /it opened off screen/],
  ['the way back does not find the trigger', 'sheet', [['prism', 'focus({ preventScroll: v || !!to });', 'focus({ preventScroll: true });']], /focus returned to a trigger off screen/],
  ['a hidden toast takes focus', 'sheet', [['prism', 'sheet.inert = toast.inert = true;', 'sheet.inert = true;']], /closed, sheetUndo can still take focus/],
  ['a closed sheet takes focus', 'sheet', [['prism', 'sheet.inert = toast.inert = true;', 'toast.inert = true;'], ['prism', 'sheet.inert = !v;', ''], ['prism', 'transform: translateY(105%); visibility: hidden;', 'transform: translateY(105%);']], /closed, sheetClose can still take focus/],
  ['Escape steals focus with the sheet closed', 'sheet', [['prism', "if (e.key === 'Escape' && st.classList.contains('open')) open(false);", "if (e.key === 'Escape') open(false);"]], /Escape on a closed sheet stole focus/],
  ['a flip is not kept', 'flip', [['owner', 'flipsSave(key);\n', '\n']], /flip: a reload returned/],
  ['a kept flip is not read', 'flip', [['owner', 'sum.flipped = flipsLoad();', '']], /flip: a reload returned/],
  ['a malformed record is trusted', 'flip', [['owner', '.filter(([, f]) => flipOK(f))', '']], /a malformed record/],
  ['a bad way back is trusted', 'flip', [['owner', " && (f.from === null || (Array.isArray(f.from) && f.from.length === 2 && f.from.every(x => typeof x === 'string')))", '']], /a bad way back/],
  ['unreadable storage throws', 'flip', [['owner', "  } catch (e) { return {}; }\n}\n/* only this frame", "  } catch (e) { throw e; }\n}\n/* only this frame"]], /unreadable storage|could not finish/],
  ['the whole record is kept', 'flip', [['owner', 'JSON.stringify(Object.fromEntries(Object.entries(all).map(([k, f]) => [k, ids(f)])))', 'JSON.stringify(all)']], /it kept more than the view/],
  ['a save writes this tab over the other', 'flip', [['owner', 'const all = flipsLoad();', 'const all = { ...sum.flipped };']], /a second tab left the record/],
  ['a turn back keeps a detail', 'flip', [['owner', 'extra = { hz: undefined, mode: undefined, t: undefined, ...was.from[2] };', 'extra = { ...was.from[2] };']], /a turn back kept a detail/],
  ['refused storage throws', 'flip', [['owner', '  } catch (e) { /* the flip still turns on this page */ }\n}', '  } catch (e) { throw e; }\n}']], /with refused storage/],
  ['the market tag is 11 px', 'text', [['owner', 'place-items: center; font: 700 12px/14px var(--font-text);', 'place-items: center; font: 700 11px/14px var(--font-text);']], /text: home\.a: \d+ runs under 12 px/],
  ['the pennies follow the figure down', 'text', [['owner', '.amt .p { font-size: max(.5em, 12px);', '.amt .p { font-size: .5em;']], /text: cost\.a: \d+ runs under 12 px/],
  ['the pennies follow a chart down', 'text', [['owner', '.cx.snug text { font-size: 12.6px; }', '']], /text: cost\.b: \d+ runs under 12 px/],
  ['the research chart is not snug', 'text', [['owner', ".replace('<svg class=\"cx', '<svg class=\"cx snug')", '']], /text: research\.a: \d+ runs under 12 px/],
  ['the chosen control loses its look', 'narrow', [['owner', '.jctl .segctl.full button[aria-pressed="true"] { background: var(--thumb); box-shadow: var(--shadow-lens); }', '']], /owner at 320: the chosen control looks like the others/],
  ['the selectors spill at 320', 'narrow', [['owner', '.jctl .segctl.full { grid-auto-flow: row; grid-template-columns: repeat(2, minmax(0, 1fr)); }', ''], ['owner', '.jctl .segctl.full button { white-space: normal; min-width: 0; padding: 6px 8px; }', '']], /narrow: owner at 320/],
  ['the name collides at 320', 'narrow', [['admin', '.brand > span:last-child { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }', '']], /narrow: admin at 320: the page's name runs into the switch/],
  ['the name shows again just under 400', 'narrow', [['owner', '@media (max-width: 400px) { .brand > span:last-child', '@media (max-width: 380px) { .brand > span:last-child']], /narrow: owner at 3[89]\d: the page's name runs into the switch/],
  ['the long name shows at 600', 'narrow', [['admin', '@media (max-width: 660px) { .bfull { display: none; } }', '']], /narrow: admin at [56]\d\d: the page's name runs into the switch/],
  ['the horizon control runs off Prism at 320', 'narrow', [['prism', '.segctl.lg:not(.scr .segctl) button { padding: 0 8px; font-size: 13px; }', '']], /narrow: prism at 320: .* runs past the edge/],
];

const b = await pw.chromium.launch({ channel: 'chrome' });
let code = 0;
try {
  if (SELFTEST) {
    const pick = arg('--case');
    const cases = UNDO.filter(([name]) => !pick || name.includes(pick));
    if (!cases.length) { console.log(`FAIL no case matches "${pick}"`); code = 2; }
    let left = cases.length;
    for (const [name, check, edits, expect] of cases) {
      const pages = { ...source };
      let readable = true;
      for (const [page, from, to] of edits) {
        if (!pages[page].includes(from)) { console.log(`FAIL ${name}: the fix to undo is not on the ${page} page`); readable = false; code = 2; break; }
        pages[page] = pages[page].replaceAll(from, to);
      }
      if (!readable) continue;
      const fails = await sweep(b, pages, [check]);
      if (fails.some((f) => expect.test(f))) { left--; console.log(`ok   ${name}`); } else { code = code || 1; console.log(`FAIL ${name}: expected ${expect}, got: ${fails[0] || 'no failure'}`); }
    }
    console.log(left ? `design_prism_press selftest: ${left} of ${cases.length} did not bite` : `design_prism_press selftest: ${cases.length} faults, all refused`);
  } else {
    const fails = await sweep(b, source, only);
    for (const f of fails) console.log(`FAIL ${f}`);
    if (fails.length) code = 1; else console.log(`design_prism_press: ${only.join(', ')} hold`);
  }
} finally { await b.close(); }
process.exit(code);
