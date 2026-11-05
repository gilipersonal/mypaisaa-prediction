#!/usr/bin/env node
// Press what the Impeccable audit found on the Prism pages (MP-182, MP-181): a control is proved by pressing it (lessons 32, 35).
//   perl -e 'alarm shift; exec @ARGV' 120 node scripts/design_prism_press.mjs [--only theme,focus,sheet,flip,text,narrow] [--root DIR]
//   perl -e 'alarm shift; exec @ARGV' 280 node scripts/design_prism_press.mjs --selftest
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
    // a flip made after the press keeps the frame's new theme, and the system's own change reaches the frames under Auto
    const { c, p } = await open(b, pages, 'owner', { hash: '#home.a.iphone.default' });
    await framesReady(p, 14);
    await p.waitForTimeout(600);
    await p.emulateMedia({ colorScheme: 'dark' });
    await p.waitForTimeout(150);
    const sys = await themeOf(p);
    must(sys.dark === sys.n, `theme: owner: the system going dark left ${sys.n - sys.dark} of ${sys.n} frames light`);
    await p.locator('#jrow [data-flip]').first().click();
    await p.waitForTimeout(700);
    must(await p.evaluate(() => document.querySelector('#jrow .dev').classList.contains('scheme-dark')), 'theme: owner: a flip lost the frame\'s theme');
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
    for (const id of ['sheetClose', 'sheetRecord', 'sheetUndo']) {
      must(await p.evaluate((i) => { const e = document.getElementById(i); e.focus(); const r = document.activeElement === e; e.blur(); return !r; }, id), `sheet: closed, ${id} can still take focus`);
    }
    await p.focus('#sheetOpen');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
    const first = await at();
    must(first.inside, `sheet: opening left focus on ${first.id}`);
    must(await p.evaluate(() => document.querySelector('#sheetOpen').closest('[inert]') !== null), 'sheet: the page behind is not inert');
    must(await p.evaluate(() => document.querySelector('.toc, nav, header')?.closest('[inert]') !== null), 'sheet: the page bar is not inert');
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
    // the scrim still closes it, Not now returns, and Record lands on Undo, which returns too
    await p.keyboard.press('Enter');
    await p.waitForTimeout(100);
    await p.evaluate(() => document.querySelector('#sheetScrim').dispatchEvent(new MouseEvent('click', { bubbles: true })));
    must((await at()).id === 'sheetOpen', 'sheet: the scrim did not return focus');
    must(await p.evaluate(() => document.elementFromPoint(...(() => { const r = document.querySelector('#sheetDemo').getBoundingClientRect(); return [r.left + 10, r.top + 10]; })()) !== null), 'sheet: nothing under the demo');
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
    must(!errs.length, `flip: ${errs[0]}`);
    await c.close();
    // an approval step keeps no flip control, so nothing can be kept for it
    for (const [why, init] of [
      ['refused storage', () => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('refused'); } }); }],
      ['a malformed record', () => { try { localStorage.setItem('mp178-flips', '{"x":1,"home|a|a-portfolio":{"o":"b","s":"gone"}}'); } catch (e) { /* nothing kept */ } }],
      ['unreadable storage', () => { try { localStorage.setItem('mp178-flips', 'not json'); } catch (e) { /* nothing kept */ } }],
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

  // UX-10: no frame text under 12 px, in the two places it was found
  async text(b, pages, must) {
    const { c, p } = await open(b, pages, 'owner');
    await p.evaluate(() => { window.__prismNoFit = window.__prismInstantFlip = true; });
    for (const [j, o, s] of [['home', 'a', 'iphone'], ['home', 'b', 'iphone'], ['cost', 'a', 'iphone']]) {
      await p.evaluate(([j, o, s]) => window.__prismJourneys.go(j, o, s, 'default'), [j, o, s]);
      await p.waitForTimeout(350);
      const small = await p.evaluate(() => { const hit = []; document.querySelectorAll('#jrow .scr').forEach((sc) => { const w = document.createTreeWalker(sc, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(), e = n.parentElement; if (t && e.getClientRects().length && parseFloat(getComputedStyle(e).fontSize) < 11.95) hit.push(`${t.slice(0, 12)} ${getComputedStyle(e).fontSize}`); } }); return hit; });
      must(!small.length, `text: ${j}.${o}: ${small.length} runs under 12 px, as "${small[0]}"`);
    }
    await c.close();
  },

  // UX-05: the review pages hold at 320 CSS px, and the bar does not collide
  async narrow(b, pages, must) {
    for (const width of [320, 360, 390]) {
      for (const page of ['prism', 'owner', 'admin']) {
        const { c, p } = await open(b, pages, page, { context: { viewport: { width, height: 800 } } });
        const r = await p.evaluate(() => {
          const vw = innerWidth, spill = [];
          for (const e of document.querySelectorAll('body *')) {
            const rc = e.getBoundingClientRect();
            if (!rc.width || rc.right <= vw + .5) continue;
            let a = e.parentElement, clipped = false;
            while (a && a !== document.body) { if (getComputedStyle(a).overflowX !== 'visible') { clipped = true; break; } a = a.parentElement; }
            if (!clipped) spill.push(`${e.tagName}${e.id ? '#' + e.id : ''} ${Math.round(rc.right)}`);
          }
          const box = (e) => { const r = document.createRange(); r.selectNodeContents(e); return r.getBoundingClientRect(); };
          const name = document.querySelector('.pbar .brand > span:last-child'), dim = document.querySelector('.pbar .dimctl'), seg = document.querySelector('.pbar .segctl');
          const bn = box(name), bd = dim.getBoundingClientRect(), bs = seg.getBoundingClientRect();
          const shown = bn.width > 2 && getComputedStyle(name).clipPath === 'none';
          return { w: document.documentElement.scrollWidth, vw, spill: spill.slice(0, 2), hit: shown && bn.right > bd.left + .5, dimHit: bd.right > bs.left + .5, named: (name.textContent || '').trim().length > 0 };
        });
        must(r.w <= r.vw, `narrow: ${page} at ${width}: the page is ${r.w} wide`);
        must(!r.spill.length, `narrow: ${page} at ${width}: ${r.spill.join(', ')} runs past the edge`);
        must(!r.hit, `narrow: ${page} at ${width}: the page's name runs into the switch`);
        must(!r.dimHit, `narrow: ${page} at ${width}: the switch runs into the theme control`);
        must(r.named, `narrow: ${page} at ${width}: the page lost its name`);
        if (page !== 'prism') {
          const lab = await p.evaluate(() => [...document.querySelectorAll('.jctl .segctl button')].filter((x) => x.scrollWidth > x.clientWidth + 1).map((x) => x.textContent.trim().slice(0, 20)));
          must(!lab.length, `narrow: ${page} at ${width}: "${lab[0]}" spills out of its control`);
        }
        await c.close();
      }
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
  ['the option selector drops focus', 'focus', [['owner', "setTimeout(() => { const b = $$(`${sel} button`)[i]; if (b) b.focus({ preventScroll: true }); });", '']], /focus: owner #jopt: focus landed on BODY/],
  ['the state chips drop focus', 'focus', [['admin', "setTimeout(() => { const n = $$('button', el).find(x => x.dataset.k === k); if (n) n.focus({ preventScroll: true }); });", '']], /focus: admin #jstate: focus landed on BODY/],
  ['the sheet takes no focus', 'sheet', [['prism', '(to || (v ? $(\'#sheetClose\') : trigger)).focus({ preventScroll: true });', '']], /sheet: opening left focus/],
  ['the page behind stays live', 'sheet', [['prism', '    quiet(v);\n', '']], /the page behind is not inert/],
  ['Tab can leave the sheet', 'sheet', [['prism', "if (e.key !== 'Tab') return;", 'return;'], ['prism', '    quiet(v);\n', '']], /sheet: Tab left the sheet/],
  ['the scrim goes inert with the page', 'sheet', [['prism', 'if (c === n || c === scrim || c.inert', 'if (c === n || c.inert']], /a press on the scrim lands/],
  ['a hidden toast takes focus', 'sheet', [['prism', 'sheet.inert = toast.inert = true;', 'sheet.inert = true;']], /closed, sheetUndo can still take focus/],
  ['a closed sheet takes focus', 'sheet', [['prism', 'sheet.inert = toast.inert = true;', 'toast.inert = true;'], ['prism', 'sheet.inert = !v;', ''], ['prism', 'transform: translateY(105%); visibility: hidden;', 'transform: translateY(105%);']], /closed, sheetClose can still take focus/],
  ['Escape steals focus with the sheet closed', 'sheet', [['prism', "if (e.key === 'Escape' && st.classList.contains('open')) open(false);", "if (e.key === 'Escape') open(false);"]], /Escape on a closed sheet stole focus/],
  ['a flip is not kept', 'flip', [['owner', 'flipsSave();\n', '\n']], /flip: a reload returned/],
  ['a kept flip is not read', 'flip', [['owner', 'sum.flipped = flipsLoad();', '']], /flip: a reload returned/],
  ['a malformed record is trusted', 'flip', [['owner', ".filter(([, f]) => f && ['o', 's', 'st', 'landed'].every(k => typeof f[k] === 'string'))", '']], /a malformed record/],
  ['refused storage throws', 'flip', [['owner', "function flipsSave() { try { localStorage.setItem(FLIP_KEY, JSON.stringify(sum.flipped)); } catch (e) { /* the flip still turns on this page */ } }", 'function flipsSave() { localStorage.setItem(FLIP_KEY, JSON.stringify(sum.flipped)); }']], /with refused storage/],
  ['the market tag is 11 px', 'text', [['owner', 'place-items: center; font: 700 12px/14px var(--font-text);', 'place-items: center; font: 700 11px/14px var(--font-text);']], /text: home\.a: \d+ runs under 12 px/],
  ['the pennies follow the figure down', 'text', [['owner', '.amt .p { font-size: max(.5em, 12px);', '.amt .p { font-size: .5em;']], /text: cost\.a: \d+ runs under 12 px/],
  ['the selectors spill at 320', 'narrow', [['owner', '.jctl .segctl.full { grid-auto-flow: row; grid-template-columns: repeat(2, minmax(0, 1fr)); }', ''], ['owner', '.jctl .segctl.full button { white-space: normal; min-width: 0; padding: 6px 8px; }', '']], /narrow: owner at 320/],
  ['the name collides at 320', 'narrow', [['admin', '.brand > span:last-child { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }', '']], /narrow: admin at 320: the page's name runs into the switch/],
  ['the horizon control runs off Prism at 320', 'narrow', [['prism', '.segctl.lg:not(.scr .segctl) button { padding: 0 8px; font-size: 13px; }', '']], /narrow: prism at 320: .* runs past the edge/],
];

const b = await pw.chromium.launch({ channel: 'chrome' });
let code = 0;
try {
  if (SELFTEST) {
    const pick = arg('--case');
    const cases = UNDO.filter(([name]) => !pick || name.includes(pick));
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
