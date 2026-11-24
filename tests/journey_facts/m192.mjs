// MP-192, acceptance 1: "Every answered question leaves its OPEN list, and each Proposed label it settles comes off."
// Read from the built page and its rendered screens, so a source that never reaches the page proves nothing (lesson 2).
//   1. Every SETTLED row quotes a label the owner picked, with its id, as answers.json records it (lesson 42).
//   2. No OPEN row reads as settled without saying what is still open: an answer that starts "Settled, 5 Nov 2026 (", or a row
//      whose question the owner answered, names its "Open:" part.
//   3. No screen carries a Proposed chip for a pick MP-192 applied, or for a record id whose rule those picks settle, and each
//      such pick shows as Settled · <id> somewhere on the page, so undoing the labels fails this check (lesson 34).
// --page PATH reads another build, so a proof can undo the fix on a copy.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const PACK = resolve(ROOT, 'docs/planning/owner-question-pack-2026-11-05/pack.json');
const ANSWERS = resolve(ROOT, 'docs/planning/owner-question-pack-2026-11-05/answers.json');
// picks the owner made outside the 5 Nov pack, quoted on the page with their own date and issue
const LATER = { 'MP-187': 'A · Scorecard' };
// the picks MP-192 applies as labels (scope.md, "A Proposed label comes off"), and the record ids whose rule they settle
export const SETTLED_IDS = ['MP40-Q5', 'OWN-28', 'ADM-19', 'OWN-04', 'OWN-07', 'OWN-14', 'OWN-19', 'OWN-26', 'OWN-27', 'OWN-31', 'MP40-Q1', 'MP40-Q13',
  'OWN-08', 'OWN-21', 'OWN-29', 'ADM-05', 'ADM-20', 'MP40-Q6', 'MP40-Q9', 'OWN-22', 'OWN-03', 'OWN-10', 'OWN-33'];
export const RETIRED_RECORD_LABELS = ['DATA-DEC-02', 'SCI-D07', 'SCI-D08', 'FIN-OD-03', 'POLICY-003'];
const any = (ids) => new RegExp(`Proposed · (${ids.map((x) => x.replace(/[-]/g, '\\-')).join('|')})(?![\\w-])`);

const arg = (flag) => { const i = process.argv.indexOf(flag); return i >= 0 ? resolve(process.argv[i + 1]) : null; };
const table = (src, name) => {
  const m = src.match(new RegExp(`const ${name} = \\[\\n([\\s\\S]*?)\\n\\];`));
  if (!m) throw new Error(`no ${name} table on the page`);
  return m[1].split('\n').map((line) => {
    const r = line.match(/^\s*\['((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\],?$/);
    if (!r) throw new Error(`a ${name} row this check cannot read: ${line.trim().slice(0, 70)}`);
    return [r[1].replace(/\\'/g, "'"), r[2].replace(/\\'/g, "'")];
  });
};

export function settledFacts(page, { each, must }, want) {
  const src = readFileSync(page, 'utf8');
  const answers = Object.fromEntries(JSON.parse(readFileSync(ANSWERS, 'utf8')).answers.map((a) => [a.id, a.pick]));
  const pack = JSON.parse(readFileSync(PACK, 'utf8')).items;
  const open = table(src, 'OPEN'), settled = table(src, 'SETTLED');
  must(settled.length >= want.settledRows, `only ${settled.length} SETTLED rows, expected at least ${want.settledRows}`);
  // 1. every quote of a pick, in either table, is the owner's label with its id; every SETTLED row has one
  const quotes = (a) => [...a.matchAll(/\("([^"]+)", ((?:OWN|ADM|MP40|MP182|MP)-[\w-]+?)(?=[,)])/g)].map((m) => [m[1], m[2]]);
  for (const [q, a] of [...open, ...settled]) for (const [label, id] of quotes(a)) {
    const owner = answers[id] ?? LATER[id];
    must(owner !== undefined, `"${q.slice(0, 50)}": quotes ${id}, which the owner did not answer`);
    must(owner === label, `"${q.slice(0, 50)}": quotes "${label}" for ${id}, and the owner picked "${owner}"`);
  }
  for (const [q, a] of settled) {
    must(/^Settled, \d{1,2} Nov 2026 \("/.test(a), `SETTLED "${q.slice(0, 50)}" does not open with the owner's answer`);
    must(quotes(a).some(([, id]) => answers[id] !== undefined || LATER[id] !== undefined), `SETTLED "${q.slice(0, 50)}" quotes no label the owner picked`);
  }
  // 2. an OPEN row that the owner answered names what is still open
  const answeredQ = new Set(pack.filter((i) => answers[i.id] !== undefined).map((i) => (i.asked || {}).question));
  for (const [q, a] of open) {
    if (/^Settled, \d{1,2} Nov 2026 \(/.test(a)) must(/\bOpen:/.test(a), `OPEN "${q.slice(0, 50)}" reads as settled and names nothing open`);
    if (answeredQ.has(q)) must(/\bOpen:/.test(a), `OPEN "${q.slice(0, 50)}" was answered by the owner, and says nothing is still open`);
  }
  // 3. no Proposed chip for a settled pick, or for a record id whose rule MP-192's picks settle; each applied pick shows Settled
  const bad = any([...SETTLED_IDS, ...RETIRED_RECORD_LABELS]), seen = new Set();
  let views = 0;
  each({}, (v, at) => {
    views++;
    const m = v.text.match(bad);
    must(!m, `${at.journey}.${at.screen} ${at.surface} ${at.state}: "${m && m[0]}" on a rule the owner's pick settles`);
    for (const x of v.text.matchAll(/Settled · ((?:OWN|ADM|MP40)-[\w-]+?)(?![\w-])/g)) seen.add(x[1]);
  });
  must(views >= want.views, `walked ${views} views, expected at least ${want.views}`);
  for (const id of seen) must(answers[id] !== undefined, `a Settled · ${id} chip, and the owner never answered ${id}`);
  for (const id of want.chips) must(seen.has(id), `no screen shows Settled · ${id}`);
}

export const page = () => arg('--page') || resolve(ROOT, 'docs/design/journeys/index.html');

export default {
  'MP192-settled': (a) => settledFacts(page(), a, {
    settledRows: 26, views: 6500,
    chips: ['OWN-07', 'OWN-08', 'OWN-14', 'OWN-19', 'OWN-21', 'OWN-26', 'OWN-27', 'OWN-28', 'OWN-29', 'OWN-33', 'MP40-Q1', 'MP40-Q5', 'MP40-Q6', 'MP40-Q9'],
  }),
};
