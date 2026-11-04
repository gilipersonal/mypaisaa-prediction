#!/usr/bin/env node
// Press Compare and pick on the admin page (MP-64): a control is proved by pressing it (lesson 32).
//   perl -e 'alarm shift; exec @ARGV' 120 node scripts/design_admin_press.mjs [PAGE]
// Exit 0 when all hold, 1 when one fails.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const pw = require(process.env.PLAYWRIGHT_CORE || '/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core');
const url = 'file://' + resolve(process.argv[2] || 'docs/design/admin/index.html');
const b = await pw.chromium.launch({ channel: 'chrome' });
let bad = 0;
const must = (ok, why) => { if (!ok) { bad++; console.log(`FAIL ${why}`); } };
try {
  for (const [width, height] of [[1320, 950], [390, 844]]) {
    const c = await b.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const p = await c.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto(url + '#compare');
    await p.waitForTimeout(700);
    const counts = await p.evaluate(() => { const J = window.__prismJourneys, out = {}; for (const m of J.matrix()) out[m.j] = (out[m.j] || 0) + m.screens.length; return out; });
    for (const [j, n] of Object.entries(counts)) {
      await p.click(`[data-cj="${j}"]`);
      must(await p.locator('.acard').count() === n, `${width}: ${j} draws ${await p.locator('.acard').count()} cards of ${n}`);
      must(await p.getAttribute(`[data-cj="${j}"]`, 'aria-pressed') === 'true', `${width}: ${j} is not marked as chosen`);
      must(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: ${j}: the page scrolls sideways`);
      must(await p.evaluate(() => [...document.querySelectorAll('.acard-frame')].every((f) => f.inert && f.scrollHeight > 100)), `${width}: ${j}: a frame is empty or can take focus`);
    }
    await p.click('[data-cj="audit"]');
    must(await p.getAttribute('[data-pick="b"]', 'aria-pressed') === 'true', `${width}: the owner's pick does not start marked`);
    must((await p.inputValue('#cmpText')).includes('Audit: B, Explorer'), `${width}: the owner's pick is not in the text`);
    await p.click('[data-pick="a"]');
    must((await p.inputValue('#cmpText')).includes('Audit: A, Ask a question'), `${width}: a changed pick is not in the text`);
    must(await p.evaluate(() => document.activeElement.dataset.pick === 'a'), `${width}: focus left the pick`);
    await p.click('[data-cj="files"]');
    must(await p.getAttribute('[data-pick="a"]', 'aria-pressed') === 'true', `${width}: Files lost its pick`);
    must(await p.getAttribute('[data-pick="b"]', 'aria-pressed') === 'false', `${width}: a pick leaked to another journey`);
    await p.click('[data-cj="audit"]');
    must(await p.getAttribute('[data-pick="a"]', 'aria-pressed') === 'true', `${width}: the changed pick did not come back`);
    await p.click('[data-pick="a"]');
    must(!(await p.inputValue('#cmpText')).includes('Audit:'), `${width}: pressing again did not clear the pick`);
    await p.click('[data-pick="x"]');
    must((await p.inputValue('#cmpText')).includes('Audit: neither'), `${width}: neither is not in the text`);
    await p.click('[data-pick="x"]');
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { /* nothing kept */ } });
    const open = p.locator('[data-open]').nth(1), to = await open.getAttribute('data-open');
    await open.click();
    await p.waitForTimeout(700);
    must(await p.locator(`.scr[data-at="audit|${to}"]`).count() === 1, `${width}: Open did not reach ${to}`);
    must(await p.locator('#jinv').isHidden(), `${width}: the compare view stayed over the screen`);
    // lesson 35: press, change the view, come back; a cleared pick stays cleared, and a journey opens on its pick
    await p.goto(url + '#compare'); await p.reload(); await p.waitForTimeout(500);
    await p.click('[data-cj="audit"]');
    await p.click('[data-pick="b"]');
    await p.reload(); await p.waitForTimeout(500);
    await p.click('[data-cj="audit"]');
    must(await p.locator('[data-pick][aria-pressed="true"]').count() === 0, `${width}: a cleared pick came back after a reload`);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { /* nothing kept */ } });
    await p.goto(url); await p.reload(); await p.waitForTimeout(500);
    await p.evaluate(() => document.querySelector('#toc a[href="#audit"]').click());
    await p.waitForTimeout(300);
    must(await p.evaluate(() => /^audit\.b/.test(location.hash.slice(1))), `${width}: the journey list did not open Audit on its pick`);
    for (const e of errs) must(false, `${width}: ${e}`);
    await c.close();
  }
} finally { await b.close(); }
console.log(`design-admin-press: ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
