#!/usr/bin/env node
// A keyboard-only pass on the web (MP-180): for every journey on the Journeys and Admin pages, on each option the owner
// keeps (Journeys: both, with the flip, except Track record, picked A; Admin: the owner's picks), at desktop size, Tab
// walks the whole page and must reach every control the screens draw, each with a visible focus ring, never stopping
// on something hidden or inert, and never getting stuck. A control inside a closed disclosure is left out until it is
// opened; its summary is counted, so the way to it is. A walker proves it walked (lesson 30): it counts the controls
// it reached against the controls the page has.
//   perl -e 'alarm shift; exec @ARGV' 900 node scripts/design_keyboard_pass.mjs [--only journeys|admin] [--journey id]
// Exit 0 when all hold, 1 when one fails, 2 when it cannot run.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const require = createRequire(import.meta.url);
const pw = require(process.env.PLAYWRIGHT_CORE || '/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core');
const arg = (k) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : null; };
const ONLY = arg('--only'), JOURNEY = arg('--journey');
const PAGES = [['journeys', 'docs/design/journeys/index.html'], ['admin', 'docs/design/admin/index.html']].filter(([n]) => !ONLY || ONLY === n)
  .map(([n, f]) => [n, (ONLY === n && arg('--page')) || f]);   // --page PATH with --only: a copy, so a proof can undo a fix
const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary';

let bad = 0, walked = 0, reached = 0;
const must = (ok, why) => { if (!ok) { bad++; if (bad <= 60) console.log(`FAIL ${why}`); } };
let b;
try {
  b = await pw.chromium.launch({ channel: 'chrome' });
} catch (e) { console.log(`CANNOT RUN: ${e.message}`); process.exit(2); }
try {
  for (const [name, file] of PAGES) {
    const url = 'file://' + resolve(file);
    const c = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await c.addInitScript(() => { window.__prismNoFit = true; window.__prismInstantFlip = true; });
    const p = await c.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto(url);
    await p.waitForTimeout(400);
    // the journeys and the options to walk, read from the page itself
    const plan = await p.evaluate((page) => {
      const J = window.__prismJourneys;
      return J.all().map((j) => ({ id: j.id, options: page === 'admin' ? [j.options[Math.max(0, j.options.findIndex((o) => o.id === (window.__prismPicks || {})[j.id]))].id] : (j.picked ? [j.picked] : j.options.map((o) => o.id)) }));
    }, name);
    // Admin: a journey opened by its id alone opens on the owner's pick, so read the pick from where the page goes
    if (name === 'admin') {
      for (const j of plan) {
        await p.goto(`${url}#${j.id}`);
        await p.reload();
        await p.waitForTimeout(300);
        const o = await p.evaluate(() => location.hash.slice(1).split('.')[1]);
        must(o === 'a' || o === 'b', `admin ${j.id}: the page did not open on a pick (${o})`);
        j.options = [o];
      }
    }
    for (const j of plan) {
      if (JOURNEY && j.id !== JOURNEY) continue;
      for (const o of j.options) {
        await p.goto(`${url}#${j.id}.${o}.web.default`);
        await p.reload();
        await p.waitForTimeout(500);
        const where = `${name} ${j.id}.${o}`;
        // every control the screens draw
        const total = await p.evaluate((sel) => [...document.querySelectorAll('#jrow .scr')].flatMap((s) => [...s.querySelectorAll(sel)]).filter((e) => !e.closest('[inert],[aria-hidden="true"],[hidden]') && !(e.tagName !== 'SUMMARY' && !e.closest('summary') && e.closest('details:not([open])')) && e.getClientRects().length).length, FOCUSABLE);
        await p.evaluate((sel) => { window.__kb = new Set(); let n = 0; [...document.querySelectorAll('#jrow .scr')].forEach((s) => s.querySelectorAll(sel).forEach((e) => { e.dataset.kb = String(n++); })); }, FOCUSABLE);
        await p.focus('body').catch(() => {});
        await p.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
        let last = null, same = 0, seen = 0;
        const limit = total * 2 + 200;
        for (let i = 0; i < limit; i++) {
          await p.keyboard.press('Tab');
          const at = await p.evaluate(() => {
            const e = document.activeElement;
            if (!e || e === document.body) return { body: true };
            const cs = getComputedStyle(e), r = e.getBoundingClientRect();
            const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || (cs.boxShadow && cs.boxShadow !== 'none');
            const hidden = !!e.closest('[inert],[aria-hidden="true"],[hidden]') || !e.getClientRects().length || cs.visibility === 'hidden';
            if (e.dataset.kb) window.__kb.add(e.dataset.kb);
            return { kb: e.dataset.kb || null, tag: e.tagName, label: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 40), ring, hidden, w: r.width, h: r.height };
          });
          if (at.body) { if (seen > 0) break; continue; }
          seen++;
          const key = `${at.kb}|${at.tag}|${at.label}`;
          if (key === last) same++; else same = 0;
          must(same < 3, `${where}: focus is stuck on ${at.tag} "${at.label}"`);
          if (same >= 3) break;
          last = key;
          must(!at.hidden, `${where}: focus reached a hidden or inert ${at.tag} "${at.label}"`);
          if (at.kb) must(at.ring, `${where}: ${at.tag} "${at.label}" shows no focus ring`);
        }
        const got = await p.evaluate(() => window.__kb.size);
        walked += total; reached += got;
        must(total > 0, `${where}: no control on the screens to walk`);
        if (got !== total) {
          const missed = await p.evaluate((sel) => [...document.querySelectorAll('#jrow .scr')].flatMap((s) => [...s.querySelectorAll(sel)]).filter((e) => !e.closest('[inert],[aria-hidden="true"],[hidden]') && !(e.tagName !== 'SUMMARY' && !e.closest('summary') && e.closest('details:not([open])')) && e.getClientRects().length && !window.__kb.has(e.dataset.kb)).slice(0, 6).map((e) => `${e.closest('.scr').dataset.at} ${e.tagName} "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30)}"`), FOCUSABLE);
          must(false, `${where}: Tab reached ${got} of ${total} controls on the screens; missed ${missed.join('; ')}`);
        }
      }
    }
    for (const e of errs) must(false, `${name}: page error: ${e}`);
    await c.close();
  }
} finally { await b.close(); }
console.log(`design-keyboard-pass: ${reached} of ${walked} controls reached by Tab; ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
