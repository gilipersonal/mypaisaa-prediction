// The coordinator's fixes from round 1: the inventory, the owner's words and the page's open list.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const row = (perms, id) => perms.actions.find((a) => a.id === id);
export default {
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
