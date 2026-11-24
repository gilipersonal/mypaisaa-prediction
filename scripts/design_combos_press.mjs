#!/usr/bin/env node
// Presses MP-193 on the owner page in a real browser: the Combined conditions view opens from the journey list and draws every
// pair on iPhone and desktop with no write live, and Mark what works outlines each kind of control and turns off again.
// A control is proved by pressing it (lesson 32); the facts harness has no browser.
//   perl -e 'alarm shift; exec @ARGV' 120 node scripts/design_combos_press.mjs [PAGE]
// Exit 0 when all hold, 1 when one fails.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const pw = require(process.env.PLAYWRIGHT_CORE || '/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core');
const url = 'file://' + resolve(process.argv[2] || 'docs/design/journeys/index.html');
const WRITE = /^(Approve|Refuse|Confirm|Continue with passkey|Raise|Ask again|Try again|Restart|Switch forward|Promote|Revoke)\b/;
const b = await pw.chromium.launch({ channel: 'chrome' });
let bad = 0;
const must = (ok, why) => { if (!ok) { bad++; console.log(`FAIL ${why}`); } };
try {
  for (const [width, height] of [[1320, 950], [390, 844]]) {
    const c = await b.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    const p = await c.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto(url);
    await p.waitForTimeout(500);
    // open it from the journey list, as the owner would
    await p.evaluate(() => document.querySelector('#toc a[href="#combined"]').click());
    await p.waitForTimeout(600);
    const pairs = await p.locator('#jinv .combo').count(), boards = await p.locator('#jinv .combo .scr').count();
    must(pairs >= 3, `${width}: ${pairs} combined conditions drawn`);
    must(boards === pairs * 2, `${width}: ${boards} frames for ${pairs} pairs; each needs iPhone and desktop`);
    must(await p.evaluate(() => location.hash === '#combined'), `${width}: the address does not say #combined`);
    must(await p.evaluate(() => /The rule/.test(document.querySelector('#jinv .combo-rule').textContent) && /Proposed · MP-193/.test(document.querySelector('#jinv .combo-rule').textContent)), `${width}: the rule is missing or not labelled proposed`);
    // every write in every frame is held, except one a pair names (Refuse, Show amounts)
    const live = await p.evaluate((src) => { const re = new RegExp(src); return [...document.querySelectorAll('#jinv .combo .scr button:not([disabled])')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()).filter((t) => re.test(t) && !/^(Refuse|Show amounts)/.test(t)); }, WRITE.source);
    must(!live.length, `${width}: live writes in the combined frames: ${live.slice(0, 3).join(', ')}`);
    // a desktop frame fits its column, and the page never scrolls sideways
    must(await p.evaluate(() => [...document.querySelectorAll('#jinv .combo-board')].every((col) => { const d = col.querySelector('.board > .dev'); return d.getBoundingClientRect().width <= col.clientWidth + 1; })), `${width}: a frame overflows its column`);
    must(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: the page scrolls sideways`);
    // Mark what works: on outlines each kind, off clears them; then a theme change keeps the view
    await p.evaluate(() => document.querySelector('#markctl').click());
    const styles = await p.evaluate(() => ['work', 'illus', 'policy'].map((k) => { const e = document.querySelector(`#jinv .scr [data-ctl="${k}"]`) || document.querySelector(`.scr [data-ctl="${k}"]`); return e ? getComputedStyle(e).outlineStyle : 'absent'; }));
    must(styles[1] === 'dashed', `${width}: an illustration is outlined ${styles[1]}`);
    must(styles[2] === 'dotted' || styles[2] === 'absent', `${width}: a held control is outlined ${styles[2]}`);
    must(await p.getAttribute('#markctl', 'aria-checked') === 'true', `${width}: the switch does not say it is on`);
    await p.evaluate(() => document.querySelector('#markctl').click());
    must(await p.evaluate(() => !document.documentElement.classList.contains('markctl')), `${width}: Mark what works did not turn off`);
    await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await p.waitForTimeout(200);
    must(await p.locator('#jinv .combo').count() === pairs, `${width}: a theme change lost the view`);
    // leave for a journey and come back (lesson 35)
    await p.evaluate(() => document.querySelector('#toc a[href="#approvals"]').click());
    await p.waitForTimeout(500);
    must(await p.locator('#jinv').isHidden(), `${width}: the view stayed over Approvals`);
    await p.evaluate(() => document.querySelector('#toc a[href="#combined"]').click());
    await p.waitForTimeout(500);
    must(await p.locator('#jinv .combo').count() === pairs, `${width}: the view did not come back`);
    for (const e of errs) must(false, `${width}: page error: ${e}`);
    await c.close();
  }
} finally { await b.close(); }
console.log(`design-combos-press: ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
