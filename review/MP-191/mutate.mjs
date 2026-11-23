// MP-191's proof that each decision-rule check bites (lesson 34): undo a fix in a copy of the built page, then run the
// check against the copy. It must fail (exit 1), never exit 0 or 2. A mutation whose text is not found the expected number
// of times is REFUSED (exit 3): later work has moved that text, so the proof needs updating, not trusting.
//
//   node review/MP-191/mutate.mjs [PAGE] [OUT_DIR] [name,name]   # defaults: the built journeys page, a temp folder, every mutation
import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const page = process.argv[2] || join(REPO, 'docs/design/journeys/index.html');
const outDir = process.argv[3] || mkdtempSync(join(tmpdir(), 'mp191-mutate-'));
const src = readFileSync(page, 'utf8');
const count = (s, x) => s.split(x).length - 1;
/* [from, to, times]: each from must occur exactly that often, or the mutation is refused as a no-op */
const P = {
  // OWN-32
  '32-data': [['disagreement: { RELIANCE: [0, 1, 2], AAPL: [0] }', 'disagreement: { RELIANCE: [1], AAPL: [0] }', 2]],
  '32-banner': [['The rules and the model disagree on Reliance at 3, 6 and 12 months. At 3 months', 'At 6 months the rules and the model disagree on Reliance. At 3 months', 1]],
  '32-brief': [['Rules and models disagree on Reliance at 3, 6 and 12 months, and the models split on Apple at 3 months. Neither is ranked', 'Rules and models disagree on Reliance at 6 months, and the models split on Apple at 3 months. Neither is ranked', 1]],
  '32-actrow': [["'Rules and models disagree at 3, 6 and 12 months, so no action is ranked.'", "'Rules and models disagree, so no action is ranked.'", 1]],
  '32-sheet': [['Rules and models disagree at 3, 6 and 12 months, so no action is ranked at any of them.', 'Rules and models disagree, so no action is ranked.', 1]],
  '32-root': [['Rules and models disagree on Reliance at 3, 6 and 12 months, and models disagree on Apple', 'Rules and models disagree on Reliance, and models disagree on Apple', 1]],
  '32-tworanges': [["twoRanges(h, hz) : banner(", "twoRanges(h) : banner(", 1]],
  // OWN-17
  '17-protection70': [["['AAPL', 'Apple', 'A', '–', '–', 65, 'Abstained at 12 months']", "['AAPL', 'Apple', 'A', '–', 70, 65, 'Growth abstained at 12 months']", 1]],
  '17-dropdis': [["const DROP = { abstention: { ustech: 'AAPL' }, disagreement: { ustech: 'AAPL' } };", "const DROP = { abstention: { ustech: 'AAPL' } };", 1]],
  '17-nrdis': [["disagreement: { ustech: [['AAPL', 'Apple', 'A', '–', '–', 65, 'Split at 3 months']] }", 'disagreement: {}', 1]],
  '17-aznsheet': [['<span>Growth</span><b>Missing</b><span>Protection</span><b>Missing</b>', '<span>Growth</span><b>Abstained</b><span>Protection</span><b>74</b>', 1]],
  '17-words': [['lost its growth and protection parts', 'lost its growth part', 4]],
  '17-whygap': [['Withheld: ${skip} is not ranked, and nothing fills the gap', 'Withheld: ${skip} lost its growth part, and nothing fills the gap', 1]],
  '17-cardtext': [["so growth and protection are both missing. It is not ranked", 'so a part is missing. It is not ranked', 1], ["abstained, so growth and protection are both missing. ${h.n}", 'abstained, so a part is missing. ${h.n}', 1]],
  // OWN-20
  '20-nonenr': [['const noneNR = (st, t) => ({ act:', 'const noneNR = (st, t) => ({}) || ({ act:', 1]],
  '20-card': [[': other ? wrap(none,', ': false ? wrap(none,', 2]],
  '20-outact': [[", ['AAPL', 'split', 'None', 'The models split at 3 months, so Apple is not ranked and carries no action until it can be ranked again.']", '', 1], [", ['AAPL', 'ban', 'None', 'The model abstained at 12 months, so Apple is not ranked and carries no action until it qualifies again.']", '', 1]],
  '20-reason': [["const NRWHY = { abstention: { AZN: 'No range at 6 months.', AAPL: 'No range at 12 months.' }, disagreement: { AAPL: 'No median at 3 months.' } };", "const NRWHY = { abstention: { AZN: '', AAPL: '' }, disagreement: { AAPL: '' } };", 1]],
  '20-sheet': [['AstraZeneca is not ranked, and carries no action at any horizon until the model qualifies again.', 'AstraZeneca is not ranked and carries no 6-month action until the next run.', 1]],
  // OWN-09
  '09-rows': [['return ctx.launch ? { ...m, act: m.act ?? noLabel, actP: m.actP ?? m.act ?? noLabel } : m;', 'return m;', 1]],
  '09-rail': [['${ctx.launch ? \'<p class="home-sub">None at launch.', '${false ? \'<p class="home-sub">None at launch.', 1]],
  '09-brief': [["return ctx.launch ? [b[0], b[1].replace(/^\\d+ actions/, 'Evidence only, no labels')] : b;", 'return b;', 1]],
  '09-banner': [["${ctx.launch && !empty ? launchNote() : ''}", "${''}", 2]],
  '09-flip': [["['a-launch', 'b-launch'], ", '', 1]],
  // the four faults fixed after round one
  '20-trail-was': [['was: ctx.state, ', '', 1]],
  '20-trail-step': [["if (other) set(4, 'Action', 'None: not ranked',", "if (false) set(4, 'Action', 'None: not ranked',", 1]],
  '32-search': [["'Rules and models disagree on Reliance at 3, 6 and 12 months, and the models split on Apple at 3 months. Neither is in this search.'", "'Rules and models disagree on Reliance at 6 months, and the models split on Apple at 3 months. Neither is in this search.'", 1]],
  '32-fan': [['split: [0, 1, 2].every(i => isSplit(st, h.t, i))', 'split: false', 1]],
  '32-fanmarks': [['(allSp || (split3 && l.k === 3))', '(split3 && l.k === 3)', 2]],
  '32-ladbanner': [["(h.t === 'RELIANCE' ? banner('', 'Rules and models disagree at 3, 6 and 12 months.'", "(false ? banner('', 'Rules and models disagree at 3, 6 and 12 months.'", 1]],
  '09-stale': [["${ctx && ctx.launch ? '' : ' and its action stays Pause'}", "${' and its action stays Pause'}", 1]],
  '09-stale-otherside': [["${ctx && ctx.launch ? '' : ' and its action stays Pause'}", "${''}", 1]],
  '09-stale-ctxA': [['stale: () => holdingsNote.stale(ctx) + list(),', 'stale: () => holdingsNote.stale() + list(),', 1]],
  '09-stale-ctxB': [['stale: () => holdingsNote.stale(ctx) + body(),', 'stale: () => holdingsNote.stale() + body(),', 1]],
};
const WHOLE = {
  '32-whole': ['32-data', '32-banner', '32-brief', '32-actrow', '32-sheet', '32-root', '32-tworanges', '32-search', '32-fan', '32-fanmarks', '32-ladbanner'],
  '32-ladder-whole': ['32-fan', '32-fanmarks', '32-ladbanner'],
  '17-whole': ['17-protection70', '17-dropdis', '17-nrdis', '17-aznsheet', '17-words', '17-whygap', '17-cardtext'],
  '20-whole': ['20-nonenr', '20-reason', '20-card', '20-outact', '20-sheet', '20-trail-was', '20-trail-step'],
  '20-trail-whole': ['20-trail-was', '20-trail-step'],
  '09-whole': ['09-rows', '09-rail', '09-brief', '09-banner', '09-flip', '09-stale'],
  '09-stale-whole': ['09-stale', '09-stale-ctxA', '09-stale-ctxB'],
};
const runs = [...Object.keys(P), ...Object.keys(WHOLE)];
const only = process.argv[4] ? process.argv[4].split(',') : runs;
for (const name of only) {
  let s = src;
  parts: for (const part of WHOLE[name] || [name]) for (const [from, to, n] of P[part]) {
    const c = count(s, from);
    if (c !== n) { console.log(`REFUSED ${name}: "${from.slice(0, 70)}" found ${c} times, not ${n}`); process.exitCode = 3; s = null; break parts; }
    s = s.split(from).join(to);
  }
  if (s === null) continue;
  const copy = `${outDir}/mut-${name}.html`;
  writeFileSync(copy, s);
  const id = `MP191-own${name.slice(0, 2)}`;
  const r = spawnSync('node', ['scripts/design_journeys_facts.mjs', id, '--page', copy], { cwd: REPO, encoding: 'utf8' });
  const line = (r.stdout.split('\n').find((l) => l.startsWith('FAIL') || l.startsWith('CANNOT')) || r.stdout.trim()).slice(0, 300);
  console.log(`${r.status === 1 ? 'BITES ' : 'MISSES'} ${name.padEnd(16)} exit ${r.status}  ${line}`);
  if (r.status !== 1) process.exitCode = 1;
}
