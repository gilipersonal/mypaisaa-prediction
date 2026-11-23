// The coordinator's fixes from round 1: the inventory, the owner's words and the page's open list.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const row = (perms, id) => perms.actions.find((a) => a.id === id);
export default {
  'R3-owner-scope': ({ has }) => {
    has(read('docs/design/journeys/src/journeys/approvals.js'), /One scope waits\./);
    has(read('docs/design/admin/src/journeys/models.js'), /Only that scope waits \(Recommended\)/);
  },
  'R3-s6': ({ lacks }) => { lacks(read('docs/design/admin/src/shell.js'), /Who marks an incident mitigated\? \(CT-14\)', 'Labelled proposed, with no control/); },
  'R3-s8': ({ must }) => {
    // The selftest itself runs as its own step in CI and review_checks; here it would pass the ledger's 60-second limit.
    must(/design_admin_facts\.mjs --selftest/.test(read('.github/workflows/verify.yml')), 'CI no longer runs the selftest');
    must(/is marked named/.test(read('scripts/design_admin_facts.mjs')) && /its row does not list'\]/.test(read('scripts/design_admin_facts.mjs')), 'a selftest case for the two rules is gone');
  },
  'R3-s9': ({ lacks }) => { lacks(read('docs/planning/story-readiness-2026-11-03/stories/PH-07.json'), /says to join/); },
  'R4-s5': ({ lacks }) => { for (const f of ['docs/planning/story-readiness-2026-11-03/stories/PH-07.json', 'docs/confluence/build_pages.py']) lacks(read(f), /until the owner says/); },
  'R5-s2': ({ each, must }) => {
    each({ journey: 'incidents', surface: ['iphone', 'pwa'] }, (v, at) => {
      if (/data-act="A40"(?! data-phone-off)/.test(v.html) && /data-phone-off/.test(v.html)) must(/Acknowledging works here/.test(v.text), `${at.option}.${at.screen} ${at.surface} ${at.state}: the strip denies the live Acknowledge`);
    });
  },
  'R5-s1': ({ must, has }) => {
    const r = spawnSync('python3', ['scripts/check_retired_facts.py'], { encoding: 'utf8', cwd: new URL('../../', import.meta.url).pathname });
    must(r.status === 0, `a retired fact is back: ${r.stdout.slice(-200)}`);
    has(read('docs/planning/retired-facts.json'), /until the owner says when/);
  },
  'R2-s3': ({ perms, must, lacks }) => {
    // Narrowed for ADM-23, "Code marks it": A74 is code's act now, shown on the timeline with no control, so it is not named as waiting for a screen either.
    must(row(perms, 'A74').control !== 'named' && row(perms, 'A74').step_up === 'outside' && /ADM-23/.test(row(perms, 'A74').step_up_note), 'A74 is listed as an owner control, or as waiting for one');
    lacks(read('docs/design/admin/src/shell.js'), /Who marks an incident mitigated\? \(CT-14\)', 'Labelled proposed, with no control/);
  },
  'R2-s7': ({ has, lacks }) => {
    const t = read('docs/planning/story-readiness-2026-11-03/stories/PH-07.json');
    has(t, /until the Developer Program is bought/);
    lacks(t, /says to join/);
  },
  'R2-m6': ({ perms, must }) => { for (const id of ['A78', 'A79', 'A80']) must(row(perms, id), `${id} is missing`); },
  'R2-f14': ({ view, lacks }) => { for (const o of ['a', 'b']) lacks(view('home', o, `${o}-home`, 'web', 'default').text, /account account/); },
  // the page-wide gate refuses a write outside act(), and every row names a record
  'R1-s4': ({ must }) => {
    const r = spawnSync('node', ['scripts/design_admin_facts.mjs'], { encoding: 'utf8', cwd: new URL('../../', import.meta.url).pathname });
    must(r.status === 0, `the page-wide gate fails: ${r.stdout.slice(0, 200)}`);
  },
  'R1-s6': ({ perms, has, lacks }) => {
    const gap = read('docs/planning/ma-reconciliation-2026-11-02/gap-register.json');
    for (const t of [gap, perms.about]) {
      has(t, /Under Settings, phones read only/);
      has(t, /Yes, recovery only \(Recommended\)/);
      lacks(t, /phones read and acknowledge, changes happen/i);
    }
  },
  'R1-s7': ({ view, lacks, has }) => {
    has(read('docs/design/reviews/MP-64/decision.md'), /Account recovery only \(Recommended\)/);
    for (const o of ['a', 'b']) lacks(view("home", o, `${o}-home`, "web", "default").text, /(?<!account )recovery works anywhere/);
  },
  'R1-s8': ({ perms, must }) => {
    must(/OwnerApproval/.test(row(perms, 'A42').audit), 'A42 names no record of the switch');
    for (const id of ['A03', 'A06', 'A09', 'A21', 'A43']) must(!/^open\b/i.test(row(perms, id).audit), `${id} says only open`);
  },
  'R1-s9': ({ perms, must }) => {
    for (const id of ['A16', 'A20', 'A23', 'A73']) must(row(perms, id).step_up === 'yes', `${id} is not marked yes`);
    must(/not a setting/.test(row(perms, 'A24').step_up_note), 'A24 does not say how it differs from R14');
  },
};
