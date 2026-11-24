// MP-194: move the unclassified action case out of the No model state (OWN-30, not a pick for the owner).
// MP-144 already leaves every listing unlabelled until thresholds are approved, and the launch screens draw that (OWN-09, MP-191).
// No model's real subject is India, so in No model only India's listings lose their range and action, with India's reason,
// and NVIDIA keeps its label like every covered row. These facts prove it on the rendered Home and Journal screens.
// review/MP-194/mutate.mjs undoes each fix on a copy of the built page and expects the fact to fail (lessons 34 and 54).
// --page PATH reads another build, so a proof can undo the fix on a copy.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const arg = (flag) => { const i = process.argv.indexOf(flag); return i >= 0 ? resolve(process.argv[i + 1]) : null; };
const page = () => arg('--page') || resolve(ROOT, 'docs/design/journeys/index.html');
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'];
const trims = (html) => (html.match(/\bb-trim\b/g) || []).length;
// the wording of the unclassified case: thresholds not approved, so evidence and no label
const UNCLASSIFIED = /Unclassified|No label|thresholds (?:are )?not approved|rather than a guess/;
const INDIA_SHEET = /No approved model covers India yet, so Reliance has no range and no action at 3, 6 or 12 months/;

export default {
  // acceptance 1: in No model only India's listings lose their range and action; NVIDIA keeps its Trim like every covered row
  'MP194-india': ({ view, must, has, lacks }) => {
    let n = 0;
    for (const [o, screen] of [['a', 'a-portfolio'], ['a', 'a-12m'], ['b', 'b-ledger'], ['b', 'b-12m'], ['a', 'a-brief'], ['b', 'b-brief']]) for (const surface of SURFACES) {
      const d = view('home', o, screen, surface, 'default'), v = view('home', o, screen, surface, 'noModel'), w = `${screen} ${surface}`;
      if (v.na) continue;
      must(trims(d.html) > 0, `${w}: default draws no Trim, so this check proves nothing`);
      must(trims(v.html) === trims(d.html), `${w}: No model draws ${trims(v.html)} Trim, default ${trims(d.html)}: NVIDIA lost its label`);
      lacks(v.text, /No label/, `${w}: a row reads No label in No model`);
      has(v.text, /Reliance and the Nifty ETF keep their value and price, with no range and no action|No approved model covers India/, `${w}: India's reason is gone`);
      n++;
    }
    // the brief names each India listing it leaves with no action, with India's reason
    for (const [o, screen] of [['a', 'a-brief'], ['b', 'b-brief']]) for (const surface of SURFACES) {
      const t = view('home', o, screen, surface, 'noModel').text;
      has(t, /No approved model covers India, so Reliance has no range and carries no action until one does/, `${screen} ${surface}: Reliance's reason`);
      has(t, /No approved model covers India, so the Nifty ETF has no range and carries no action until one does/, `${screen} ${surface}: the Nifty ETF's reason`);
    }
    // the rows behind the sheet: NVIDIA's Trim stays
    for (const [o, screen] of [['a', 'a-action'], ['b', 'b-open']]) for (const surface of SURFACES) must(trims(view('home', o, screen, surface, 'noModel').html) >= 1, `${screen} ${surface}: NVIDIA's row lost its Trim behind the sheet`);
    must(n >= 20, `only ${n} views compared`);
  },
  // No model's sheet opens India's case on Reliance, with no unclassified wording and no model version
  'MP194-sheet': ({ view, must, has, lacks }) => {
    for (const surface of SURFACES) {
      const a = view('home', 'a', 'a-action', surface, 'noModel'), sa = a.html.slice(a.html.indexOf('aria-label="Suggested action"'));
      must(a.html.includes('aria-label="Suggested action"'), `a-action ${surface}: no sheet`);
      has(sa, /<h4[^>]*>Reliance<\/h4>/, `a-action ${surface}: the sheet is not on Reliance`);
      has(a.text, INDIA_SHEET, `a-action ${surface}: India's reason`);
      has(a.text, /No model version applies/, `a-action ${surface}: a model version on a listing no model covers`);
      lacks(sa, /Unclassified|FIN-OD-07|R2-HGB v3/, `a-action ${surface}: the unclassified case, or a model, on India's sheet`);
      const b = view('home', 'b', 'b-open', surface, 'noModel');
      has(b.text, INDIA_SHEET, `b-open ${surface}: India's reason`);
      lacks(b.text, /Unclassified|rather than a guess/, `b-open ${surface}: the unclassified case`);
      // the row the sheet opens is Reliance's, as in Disagreement
      const sel = (b.html.match(/<tr class="sel"[\s\S]*?<\/tr>/) || [''])[0];
      must(/RELIANCE/.test(sel), `b-open ${surface}: the opened row is not Reliance's`);
    }
  },
  // acceptance 2: the unclassified case appears only on the launch screens and the journal's no-label state (Empty)
  'MP194-launch-only': ({ each, view, has, must }) => {
    let hits = 0;
    for (const journey of ['home', 'journal', 'forecast', 'holdings']) each({ journey }, (v, at) => {
      if (!UNCLASSIFIED.test(v.text)) return;
      hits++;
      const home = ['a-launch', 'b-launch'].includes(at.screen), journal = at.journey === 'journal' && at.state === 'empty';
      must(home || journal, `${at.journey} ${at.screen} ${at.surface} ${at.state}: the unclassified case outside launch and the journal's Empty state: ${(v.text.match(UNCLASSIFIED) || [])[0]}`);
    });
    must(hits > 0, 'the unclassified case is drawn nowhere');
    for (const surface of SURFACES) {
      for (const screen of ['a-launch', 'b-launch']) has(view('home', screen[0], screen, surface, 'noModel').text, /No label/, `${screen} ${surface}: launch lost its No label in No model`);
      has(view('journal', 'a', 'a-record', surface, 'empty').text, /No label/, `a-record ${surface}: the journal's no-label state`);
    }
  },
  // the journal's No model record is India's case on Reliance; NVIDIA keeps its model, and its scored entry keeps the proof
  'MP194-journal': ({ each, has, lacks }) => {
    for (const [o, screen] of [['a', 'a-record'], ['b', 'b-decide']]) each({ journey: 'journal', option: o, screen, state: 'noModel' }, (v, at) => {
      has(v.text, /Reliance · No action ranked|So Reliance has no range and no action is ranked/, `${screen} ${at.surface}: the record is not on Reliance`);
      lacks(v.text, /Kept all 60 units/, `${screen} ${at.surface}: NVIDIA's 60 units on Reliance's record`);
      has(v.text, /no approved model covered India/, `${screen} ${at.surface}: India's reason`);
      lacks(v.text, /No approved model covers NVIDIA|NVIDIA · No action ranked/, `${screen} ${at.surface}: NVIDIA as No model's subject`);
    });
    for (const [o, screen] of [['a', 'a-list'], ['b', 'b-board']]) each({ journey: 'journal', option: o, screen, state: 'noModel' }, (v, at) => {
      has(v.text, /No approved model covers India\./, `${screen} ${at.surface}: the banner is not about India`);
      lacks(v.text, /No approved model for new actions/, `${screen} ${at.surface}: no model at all`);
    });
    for (const [o, screen] of [['a', 'a-one'], ['b', 'b-one']]) each({ journey: 'journal', option: o, screen, state: 'noModel' }, (v, at) => {
      has(v.text, /NVIDIA keeps its model/, `${screen} ${at.surface}: NVIDIA's model is said to be missing`);
      has(v.text, /The model today/, `${screen} ${at.surface}: NVIDIA's entry lost its proof`);
      lacks(v.text, /No model is approved now/, `${screen} ${at.surface}: no model at all`);
    });
  },
  // acceptance 3: the OPEN row for OWN-30 is closed, and the thresholds row records what was drawn
  'MP194-open': ({ must }) => {
    const src = readFileSync(page(), 'utf8'), m = src.match(/const OPEN = \[([\s\S]*?)\n\];/);
    must(m, 'the OPEN table was not found on the page');
    const open = m ? m[1] : '';
    must(!/is only NVIDIA unlabelled|NVIDIA alone reads No label/.test(open), 'the OWN-30 question is still open');
    const row = open.split('\n').find((l) => l.includes("['Action thresholds (FIN-OD-07)'")) || '';
    must(row, 'the thresholds row is gone');
    for (const re of [/No model is about India alone/, /NVIDIA keeps its label/, /OWN-30, not a pick for you, closed in MP-194/, /Open: the thresholds themselves/]) must(re.test(row), `the thresholds row does not record ${re}`);
  },
};
