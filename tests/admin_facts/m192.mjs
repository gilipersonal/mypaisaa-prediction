// MP-192, acceptance 1, on Prism Admin: every answered question leaves its OPEN list, each SETTLED row quotes the owner's label
// with its id, and no screen keeps a Proposed chip for a rule the owner's picks settle. The rules are tests/journey_facts/m192.mjs's.
// --page PATH reads another build, so a proof can undo the fix on a copy.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { settledFacts } from '../journey_facts/m192.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const page = () => { const i = process.argv.indexOf('--page'); return i >= 0 ? resolve(process.argv[i + 1]) : resolve(ROOT, 'docs/design/admin/index.html'); };

export default {
  'MP192-settled-admin': (a) => settledFacts(page(), a, {
    settledRows: 16, views: 4400,
    chips: ['OWN-07', 'OWN-08', 'OWN-19', 'OWN-21', 'OWN-27', 'OWN-28', 'OWN-29', 'OWN-33', 'MP40-Q1', 'MP40-Q5', 'MP40-Q6', 'MP40-Q9', 'ADM-05', 'ADM-19', 'ADM-20'],
  }),
};
