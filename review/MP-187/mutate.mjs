// MP-187's proof that each new fact bites (lessons 34 and 54): undo a fix in a copy of the built journeys page, then run the fact against
// the copy with --page. It must fail. A mutation whose text is not found exactly once is REFUSED (exit 3): later work moved that text,
// so the proof needs updating, not trusting.
//
//   node review/MP-187/mutate.mjs [fact,fact]     # default: every mutation
import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const page = readFileSync(join(REPO, 'docs/design/journeys/index.html'), 'utf8');
const out = mkdtempSync(join(tmpdir(), 'mp187-mutate-'));

/* fact: [from, to], each found exactly once in the built page */
const M = {
  'MP187-toofew': ['ISSUED = 1344, MIN = 30, FLOOR = 20', 'ISSUED = 1344, MIN = 20, FLOOR = 20'],
  'MP187-hitrate': ["    ['Calibration', x.cal, 'Slope, 1.00 is exact'],\n", ''],
  'MP187-computed': ['`${rate(x.dir, x.scored)}%`, `Direction right', '`${rate(x.dir + 9, x.scored)}%`, `Direction right'],
  'MP187-nothing': ['${none(h.first)}<p class="track-sub">All', '<p class="track-sub">All'],
  'MP187-flow': ['<span>Matured</span><b>${n0(Y6.due)}</b>', '<span>Matured</span><b>${n0(Y6.due + 1)}</b>'],
  'MP187-sums': ["['SPY', 127, 105, 0, 0], ['AZN', 111", "['SPY', 126, 105, 0, 0], ['AZN', 111"],
  'MP187-agree': ['<tr class="track-pend"><td></td><td colspan="10">${n0(h.pending)} pending${turnover(h)}</td></tr>', ''],
  'MP187-switch': ['body: recordSwitch(0) + body, rail: p ? (empty', 'body: body, rail: p ? (empty'],
  'MP187-destinations': ["Open 6 months${ic('chev-r', 's14')}", "${ic('chev-r', 's14')}"],
  'MP187-turnover': ["const turnover = h => (!h.w[2].due ? '' : h.turn ?", "const turnover = h => (true ? '' : h.turn ?"],
  'MP187-labels': ["const exploratory = chip('Exploratory', 'proposed');", "const exploratory = '';"],
};
/* a key may carry a suffix after the fact's id, so one fact can have more than one proof */
const factOf = (k) => k.replace(/-turnover$/, '-hitrate');
const want = process.argv[2] ? process.argv[2].split(',') : Object.keys(M);
let bad = 0, refused = 0;
for (const fact of want) {
  const [from, to] = M[fact] || [];
  const n = from === undefined ? 0 : page.split(from).length - 1;
  if (n !== 1) { console.log(`REFUSED ${fact}: its text is found ${n} times, not once`); refused++; continue; }
  const copy = join(out, `${fact}.html`);
  writeFileSync(copy, page.replace(from, to));
  const r = spawnSync('node', ['scripts/design_journeys_facts.mjs', factOf(fact), '--page', copy], { cwd: REPO, encoding: 'utf8' });
  const said = (r.stdout || r.stderr || '').trim().split('\n')[0].slice(0, 160);
  if (r.status === 1) console.log(`bites  ${fact}: ${said}`); else { console.log(`MISSES ${fact} (exit ${r.status}): ${said}`); bad++; }
}
console.log(`mp187-mutate: ${want.length - bad - refused} of ${want.length} facts refuse their undone fix`);
process.exit(refused ? 3 : bad ? 1 : 0);
