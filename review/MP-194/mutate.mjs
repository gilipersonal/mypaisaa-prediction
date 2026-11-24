// MP-194's proof that each new fact bites (lessons 34 and 54): undo a fix in a copy of the built journeys page, then run the fact
// against the copy with --page. It must fail. A mutation whose text is not found the expected number of times is REFUSED (exit 3):
// later work moved that text, so the proof needs updating, not trusting. The real page is never written.
//
//   node review/MP-194/mutate.mjs [name,name]     # default: every mutation, then every whole undo
import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PAGE = 'docs/design/journeys/index.html';
const out = mkdtempSync(join(tmpdir(), 'mp194-mutate-'));
const count = (s, x) => s.split(x).length - 1;

/* name: [fact, [[from, to, times], ...]] */
const M = {
  // Home: NVIDIA reads No label again in No model
  'india-row': ['MP194-india', [[" : {}),   /* only India's listings: NVIDIA keeps its label like every covered row (OWN-30, MP-194) */", " : t === 'NVDA' ? { act: noLabel } : {}),", 1]]],
  // Home: the brief stops naming India's listings and their reason
  'brief-out': ['MP194-india', [["  noModel: [['RELIANCE', 'cube', 'None', 'No approved model covers India, so Reliance has no range and carries no action until one does.'], ['NIFTYBEES', 'cube', 'None', 'No approved model covers India, so the Nifty ETF has no range and carries no action until one does.']],\n", '', 1]]],
  // Home: No model's sheet is the unclassified case again
  'sheet-old': ['MP194-sheet', [["    noModel: [head(`<span class=\"chip\">${ic('cube', 's14')}No approved model</span>`, 'Reliance'), `<p class=\"lead\">No approved model covers India yet, so Reliance has no range and no action at 3, 6 or 12 months. Its value and price stay.</p>` + india + `<p class=\"home-sub\" style=\"color:var(--ink);margin-top:10px\">No model version applies. Illustrative. No trade is placed.</p>`, false],", "    noModel: [head(`<span class=\"chip proposed\"><span class=\"dot\"></span>Unclassified</span>`), `<p class=\"lead\">Action thresholds are not approved yet (FIN-OD-07), so this shows its evidence and no label, rather than a guess.</p>` + ids(), false],", 1]]],
  // Home: the sheet opens NVIDIA's row, not Reliance's
  'sheet-t': ['MP194-sheet', [["disagreement: 'RELIANCE', noModel: 'RELIANCE', abstention: 'AZN' }[st] || 'NVDA');", "disagreement: 'RELIANCE', abstention: 'AZN' }[st] || 'NVDA');", 1]]],
  // the unclassified case leaks back into No model, on the sheet alone
  'leak': ['MP194-launch-only', [["No approved model covers India yet, so Reliance has no range and no action at 3, 6 or 12 months. Its value and price stay.", "Action thresholds are not approved yet (FIN-OD-07), so this shows its evidence and no label, rather than a guess.", 1]]],
  // Journal: the record is on NVIDIA again
  'j-pick': ['MP194-journal', [["disagreement: byT.RELIANCE, noModel: byT.RELIANCE, abstention: byT.AZN }[st] || byT.NVDA);", "disagreement: byT.RELIANCE, abstention: byT.AZN }[st] || byT.NVDA);", 1], ["    noModel: ['Reliance · No action ranked', 'No approved model covers India · price and rules only · illustrative', 'no approved model covered India', ''],", "    noModel: ['NVIDIA · No action ranked', 'No approved model · price and rules only · illustrative', 'no approved model covered it', ''],", 1], ["    if (st === 'noModel') return held('No approved model covers India', 'So Reliance has no range and no action is ranked.", "    if (st === 'noModel') return held('No approved model', 'No approved model covers NVIDIA now, so no action is ranked.", 1]]],
  // Journal: the banner says no model at all
  'j-banner': ['MP194-journal', [["  const sayNoModel = () => banner('', 'No approved model covers India.', 'India’s listings get no new action until one does.", "  const sayNoModel = () => banner('', 'No approved model for new actions.', 'No action waits for you until one is approved.", 1]]],
  // Journal: NVIDIA's scored entry is said to have no model
  'j-one': ['MP194-journal', [["      noModel: () => banner('', 'No approved model covers India.', 'NVIDIA keeps its model. The score stands", "      noModel: () => banner('', 'No model is approved now.', 'The score stands", 1]]],
  // Journal: NVIDIA's scored entry loses its proof
  'j-proof': ['MP194-journal', [["const proofCard = (ctx, cites) => (ctx.state === 'noModel' && !cites", "const proofCard = (ctx, cites) => (ctx.state === 'noModel'", 1]]],
  // Journal: Reliance's full-page record keeps NVIDIA's 60 units
  'j-units': ['MP194-journal', [["...(st === 'noModel' ? { size: 'Kept all 120 units.' } : {}), ", '', 1]]],
  // the OPEN table: OWN-30's question comes back, and the closure is not recorded
  'open-row': ['MP194-open', [["const OPEN = [\n", "const OPEN = [\n  ['In No model, is only NVIDIA unlabelled, or every non-India row? The reason given covers them all. (FIN-OD-07)', 'Not yours to choose (OWN-30).'],\n", 1]]],
  'open-record': ['MP194-open', [[" The unclassified case sits only there and in the journal\\'s Empty state: No model is about India alone, so only India\\'s listings lose their range and action, and NVIDIA keeps its label (OWN-30, not a pick for you, closed in MP-194).", '', 1]]],
};
/* undo the whole of each part at once, so a fact held by two parts is not passed by one alone (lesson 54) */
const WHOLE = {
  'home-whole': ['india-row', 'brief-out', 'sheet-old', 'sheet-t'],
  'journal-whole': ['j-pick', 'j-banner', 'j-one', 'j-proof', 'j-units'],
  'open-whole': ['open-row', 'open-record'],
};
/* a whole undo fails every fact its parts are proved against */
const factsOf = (parts) => [...new Set(parts.map((p) => M[p][0]))];

const only = process.argv[2] ? process.argv[2].split(',') : [...Object.keys(M), ...Object.keys(WHOLE)];
let bad = 0;
for (const name of only) {
  const parts = WHOLE[name] || [name];
  if (parts.some((p) => !M[p])) { console.log(`REFUSED ${name}: no such mutation`); bad = Math.max(bad, 3); continue; }
  let s = readFileSync(join(REPO, PAGE), 'utf8'), refused = '';
  for (const part of parts) for (const [from, to, n] of M[part][1]) {
    const c = count(s, from);
    if (c !== n) { refused = `"${from.slice(0, 70)}" found ${c} times, not ${n}`; break; }
    s = s.split(from).join(to);
  }
  if (refused) { console.log(`REFUSED ${name}: ${refused}`); bad = Math.max(bad, 3); continue; }
  const copy = join(out, `mut-${name}.html`);
  writeFileSync(copy, s);
  for (const fact of factsOf(parts)) {
    const r = spawnSync('node', ['scripts/design_journeys_facts.mjs', fact, '--page', copy], { cwd: REPO, encoding: 'utf8' });
    const failLine = r.stdout.split('\n').find((l) => l.startsWith(`FAIL ${fact}:`));
    const ok = r.status === 1 && failLine;
    console.log(`${ok ? 'BITES ' : 'MISSES'} ${name.padEnd(14)} ${fact.padEnd(18)} ${(failLine || r.stdout.trim().split('\n').pop() || r.stderr.trim().split('\n').pop() || '').slice(0, 170)}`);
    if (!ok) bad = Math.max(bad, 1);
  }
}
process.exit(bad);
