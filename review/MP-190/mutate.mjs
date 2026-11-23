// MP-190's proof that each new fact bites (lessons 34 and 54): undo a fix in a copy, then run the fact against the copy. It must fail.
// A mutation whose text is not found the expected number of times is REFUSED (exit 3): later work moved that text, so the proof needs
// updating, not trusting. Targets: J and A are copies of the built journeys and admin pages, passed with --page. P, JR and AR swap the
// real permissions.json or built page for the run, because those facts read the repo file, and always put the original back.
//
//   node review/MP-190/mutate.mjs [name,name]     # default: every mutation
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const FILES = { J: 'docs/design/journeys/index.html', A: 'docs/design/admin/index.html', P: 'docs/design/admin/permissions.json', JR: 'docs/design/journeys/index.html', AR: 'docs/design/admin/index.html' };
const out = mkdtempSync(join(tmpdir(), 'mp190-mutate-'));
const count = (s, x) => s.split(x).length - 1;
const sha = (p) => createHash('sha256').update(readFileSync(join(REPO, p))).digest('hex');

/* name: [fact, target, [[from, to, times], ...]] */
const M = {
  // OWN-35, "Code may draft one"
  '35-sentence': ['MP190-own35', 'J', [["It grants no tool, source or permission, and code refuses any change that would. ${BUDGET}`, 'shield');", "It grants no tool, source, budget or permission, and code refuses any change that would.`, 'shield');", 1]]],
  '35-margin': ['MP190-own35', 'J', [["['Against the month', '', '£5.27 under it', 'Up to £59.73 sits £5.27 under £65.']", "['Against the month', '', '£5.00 under it', 'Up to £59.73 sits £5.00 under £65.']", 1]]],
  '35-sheet': ['MP190-own35', 'J', [["sheet: stepFor(ctx, STEP_BUD, CT2) })", "sheet: '' })", 2]]],
  '35-decide': ['MP190-own35', 'J', [["return ctx.state === 'default' ? { yes: 'Approve', foot: 'Bound to Budgets v2", "return false ? { yes: 'Approve', foot: 'Bound to Budgets v2", 1]]],
  '35-flip': ['MP190-own35', 'J', [["approvals: pairs(['aa-queue', 'ab-home']),", "approvals: pairs(['aa-queue', 'ab-home'], ['aa-budget', 'ab-budget']),", 1]]],
  '35-lines': ['MP190-own35', 'J', [["Only you change one, in Settings, with a fresh sign-in. ${RAISE}</p>", "Only you change one, in Settings, with a fresh sign-in.</p>", 2]]],
  '35-sizing': ['MP190-own35', 'J', [["How code sizes a raise is not recorded. This one clears the adverse month.", "This one clears the adverse month.", 1]]],
  // OWN-16, "An open session is enough"
  '16-approvals': ['MP190-own16', 'J', [["const naRevoke = { noModel: 'Revoking an approval involves no forecast, so no model can be missing here.', abstention:", "const naRevoke = { noModel: 'Revoking an approval involves no forecast, so no model can be missing here.', abstentionX:", 1]]],
  '16-holdings': ['MP190-own16', 'J', [["const naLive = { ...naApprove, abstention:", "const naLive = { ...naApprove, abstentionX:", 1]]],
  '16-rail': ['MP190-own16', 'J', [["An open session is enough to revoke: it asks for no fresh sign-in, so the commit cannot start while you sign in.", "Revoking asks for a fresh sign-in when your session is stale.", 1]]],
  // OWN-39, "Anything that writes or widens"
  '39-listing': ['MP190-own39', 'J', [["return { yes, foot: `${foot} · needs a fresh sign-in`, o: { tag: Q9 } };", "return { yes, foot: `${foot} · needs a fresh sign-in`, o: { tag: proposed('CT-01') + Q9 } };", 1]]],
  '39-renew': ['MP190-own39', 'J', [["and asks for a fresh sign-in, because it changes a record.", "and asks for a fresh sign-in.", 1]]],
  '39-less': ['MP190-own39', 'J', [["asks for a fresh sign-in, because it widens what MP may do.", "asks for a fresh sign-in.", 1]]],
  // OWN-25, "Daily forecasts keep running", and "Yes, add them"
  '25-key': ['MP190-own25', 'J', [["why: 'Shown only where a forecast needs optional paid work, which pauses at the £85 line. Daily forecasts carry on, inside the £15 kept above £85. The last issue stays dated, and nothing is made up.' },", "why: 'The next run waits at the £85 line of the £100 ceiling. The last issue stays dated, and nothing is made up.' },", 1]]],
  '25-row': ['MP190-own25', 'J', [[", li('check', 'Daily forecasts', 'Carry on, inside the £15 kept above £85', 'Running')];", "];", 1]]],
  '25-kept': ['MP190-own25', 'J', [["const KEPT = ['Sign-in', 'Ledger reads', 'Audit', 'Recovery', 'Daily forecasts'];", "const KEPT = ['Sign-in', 'Ledger reads', 'Audit', 'Recovery'];", 1]]],
  '25-rung': ['MP190-own25', 'J', [["['£85', 'Pause', 'New optional paid work pauses, and each pause shows its reason. Daily forecasts carry on, inside the £15 kept above £85.'],", "['£85', 'Pause', 'New optional paid work pauses, and each pause shows its reason.'],", 1]]],
  // OWN-36, "Cut in a set order"
  '36-rows': ['MP190-own36', 'J', [["li('check', 'Step 2 · Challenger models', 'Next, if code cuts further. Running in full until then', 'Running')", "li('trim', 'Step 2 · Challenger models', 'Fewer runs this month', 'Reduced')", 1]]],
  '36-order': ['MP190-own36', 'J', [["? [li('trim', 'Step 1 · Backfills', 'Cut first. Each resumes from its step', 'Cut'), li('check', 'Step 2 · Challenger models', 'Next, if code cuts further. Running in full until then', 'Running'),", "? [li('check', 'Step 2 · Challenger models', 'Next, if code cuts further. Running in full until then', 'Running'), li('trim', 'Step 1 · Backfills', 'Cut first. Each resumes from its step', 'Cut'),", 1]]],
  '36-step': ['MP190-own36', 'J', [["Code cuts in a set order and says which step it reached: step 1 of 3, backfills.", "Code cuts optional work.", 1]]],
  '36-rung': ['MP190-own36', 'J', [["['£75', 'Reduce', 'Code cuts backfills first, then challenger models, then Claude jobs, and says which step it reached.'],", "['£75', 'Reduce', 'Fewer optional backfills, challenger models and Claude jobs.'],", 1]]],
  // OWN-34 and MP40-Q11a
  '34-cool': ['MP190-own34-q11a', 'J', [["const COOL = 'It pushes once in 24 hours for this holding, rule and severity, and sooner only if it worsens or the cause is new. Every event stays in the app.';", "const COOL = 'How long a cooldown runs is open.';", 1]]],
  'q11a-kinds': ['MP190-own34-q11a', 'J', [["Material means a line you set is crossed, on exposure, price move, volatility or an event flag. Critical covers security and service faults only, so an investment alert waits for 07:30.", "The line is illustrative.", 1]]],
  // MP40-Q11b, "Weekdays only"
  'q11b-pair': ['MP190-q11b', 'J', [["['a-brief', 'b-brief'], ['a-weekend', 'b-weekend'],", "['a-brief', 'b-brief'],", 1]]],
  'q11b-na': ['MP190-q11b', 'J', [["const naWeekend = {\n  error:", "const naWeekend = {\n  errorX:", 1]]],
  'q11b-label': ['MP190-q11b', 'J', [["Every alert is in the inbox already.</p><div><span class=\"chip proposed\"><span class=\"dot\"></span>Proposed · MP40-Q11</span></div>", "Every alert is in the inbox already.</p>", 1]]],
  'q11b-figure': ['MP190-q11b', 'J', [["<h4>Last closes</h4><p class=\"home-sub\">Every price", "<h4>Last closes</h4><p class=\"home-sub\">Portfolio £90,155.25. Every price", 1]]],
  'q11b-chips': ['MP190-q11b', 'J', [["return frame(ctx, { fresh: 'empty', tab: 0, back: 'Portfolio', title: 'Daily brief',", "return frame(ctx, { tab: 0, back: 'Portfolio', title: 'Daily brief',", 2]]],
  'q11b-home': ['MP190-q11b', 'J', [["const WK = ['No brief today · Saturday', 'Weekdays only: markets are shut'];", "const WK = ['No brief today', 'Markets are shut'];", 1], ["const WKB = ['No brief today · Saturday', 'Weekdays only. The next is Monday, 07:30'];", "const WKB = ['No brief today', 'Markets are shut'];", 1]]],
  'q11b-research': ['MP190-q11b', 'J', [["const WEEKEND = 'There is no brief on Saturday or Sunday, so an alert held then lands in your inbox at 07:30.';", "const WEEKEND = '';", 1]]],
  // the journeys OPEN table, read from the real built page
  'open-weekend': ['MP190-open', 'JR', [["['Weekend brief (MP40-Q11)', 'Settled, 5 Nov 2026 (\"Weekdays only\", MP40-Q11b)", "['Weekend brief (MP40-Q11)', 'Not drawn. (\"Weekdays only\")", 1]]],
  'open-raise': ['MP190-open', 'JR', [["'Settled, 5 Nov 2026 (\"Code may draft one\", OWN-35, not the Recommended option):", "'Not drawn. The records conflict. (\"Code may draft one\"):", 1]]],

  // ADM-23, "Code marks it"
  'a23-control': ['MP190-adm23', 'A', [["pt('now', 'Mitigate', `${LATE} ${MIT}`),", "pt('now', 'Mitigate', `${LATE} ${MIT}`, act('A40', 'Mark as mitigated')),", 1]]],
  'a23-mit': ['MP190-adm23', 'A', [["const MIT = 'Code marks it mitigated when its checks show the fault has stopped. You still acknowledge and resolve.';", "const MIT = 'When this counts as mitigated, and who says so, is not recorded.';", 1]]],
  'a23-perms': ['MP190-adm23', 'P', [["\"step_up\": \"outside\",\n   \"step_up_note\": \"Not an owner act. The owner picked \\\"Code marks it\\\" (ADM-23)", "\"step_up\": \"open\",\n   \"step_up_note\": \"Not an owner act. The owner picked \\\"Code marks it\\\" (ADM-23)", 1]]],
  // ADM-06, "No, keep it apart"
  'a06-time': ['MP190-adm06', 'A', [["RETRIED = 'Retried at +40, 17:15';", "RETRIED = 'Retried at +40, 17:20';", 1]]],
  'a06-cond': ['MP190-adm06', 'A', [["const LATE = 'A late price is not a missed collection, so code re-runs nothing.", "const LATE = 'Code re-runs the collection if a late price counts as a missed collection.", 1]]],
  'a06-req': ['MP190-adm06', 'A', [["default: [RETRIED, 'stale', UK, WHY12, '1', 'Not needed: the +40 retry is the only automatic one'],", "default: ['Auto-retry if CT-14 allows', 'stale', UK, WHY12, '1', 'Not needed if a late price counts as a missed collection'],", 1]]],
  // ADM-24, "Tie to month and release"
  'a24-line': ['MP190-adm24', 'A', [["so it is overdue. Overdue means a month ended with no exercise, or a change has none by the next release.',", "so a new exercise is due. How long before that counts as overdue is not set.',", 1]]],
  'a24-chip': ['MP190-adm24', 'A', [["expired: banner('warn', 'A new exercise is overdue.', 'An import change landed after rx_0007, and rel_0031 went out with none since, so rx_0007 no longer covers what is stored now.', 'clock'),", "expired: `${banner('warn', 'A new exercise is overdue.', 'An import change landed after rx_0007, and rel_0031 went out with none since, so rx_0007 no longer covers what is stored now.', 'clock')}${tags(proposed('CT-14'))}`,", 1]]],
  // ADM-07, "Record it, keep the outputs"
  'a07-row': ['MP190-adm07', 'A', [["['Yahoo values already sent to Claude', '', 'Recorded, not recalled', 'MP records what was sent and cannot recall it. They stay wherever Anthropic holds them, for a time not verified.'], ", "", 1]]],
  'a07-optionB': ['MP190-adm07', 'A', [["policies(ctx) + scopeEffect()), rail: proposeRail(ctx) })", "policies(ctx)), rail: proposeRail(ctx) })", 1]]],
  // ADM-08, "Code on trigger, or you"
  'a08-box': ['MP190-adm08', 'A', [["Bounded self-correction cannot change rules, and no agent can.</p>`)}${withdrawBox(ctx)}", "Bounded self-correction cannot change rules, and no agent can.</p>`)}", 1]]],
  'a08-offline': ['MP190-adm08', 'A', [["<div class=\"amodels-acts\">${['offline', 'stale'].includes(ctx.state) ? act('A83'", "<div class=\"amodels-acts\">${false ? act('A83'", 1]]],
  'a08-perms': ['MP190-adm08', 'P', [["   \"control\": \"named\"\n  }\n ],\n \"refused\"", "   \"control\": \"listed\"\n  }\n ],\n \"refused\"", 1]]],
  // ADM-09, "Use the best simple baseline"
  'a09-model': ['MP190-adm09', 'A', [["+ para(WAITS_RULES) + baselineYes()", "+ para(WAITS_RULES)", 2]]],
  'a09-rules': ['MP190-adm09', 'A', [["+ para('Neither side of a rules trial can be scored, so it waits until a mapping qualifies.", "+ `<div class=\"amodels-acts\">${act('A78', 'Decide what happens next', 'primary')}</div>` + para('Neither side of a rules trial can be scored, so it waits until a mapping qualifies.", 1]]],
  'a09-live': ['MP190-adm09', 'A', [["${act('A78', 'Let the best simple baseline stand in', 'primary').replace(/type=\"button\"/g, 'type=\"button\" disabled')}", "${act('A78', 'Let the best simple baseline stand in', 'primary')}", 1]]],
  // OWN-39 and OWN-16 in the inventory and on the controls
  'a39-open': ['MP190-own39', 'P', [["\"step_up\": \"no\",\n   \"step_up_note\": \"No (OWN-39, \\\"Anything that writes or widens\\\"): it only reads. A coverage check", "\"step_up\": \"open\",\n   \"step_up_note\": \"No (OWN-39, \\\"Anything that writes or widens\\\"): it only reads. A coverage check", 1]]],
  'a39-a09': ['MP190-own39', 'P', [["\"step_up\": \"no\",\n   \"step_up_note\": \"No. The owner picked \\\"An open session is enough\\\" (OWN-16)", "\"step_up\": \"yes\",\n   \"step_up_note\": \"No. The owner picked \\\"An open session is enough\\\" (OWN-16)", 1]]],
  'a39-page': ['MP190-own39', 'A', [["\"id\": \"A09\",\n   \"action\": \"Revoke an approval before commit\",\n   \"journeys\": [\n    \"approvals\"\n   ],\n   \"step_up\": \"no\",", "\"id\": \"A09\",\n   \"action\": \"Revoke an approval before commit\",\n   \"journeys\": [\n    \"approvals\"\n   ],\n   \"step_up\": \"yes\",", 1]]],
  'a39-label': ['MP190-own39', 'A', [["\"id\": \"A62\",\n   \"action\": \"Approve a rules version\",\n   \"journeys\": [\n    \"models\"\n   ],\n   \"step_up\": \"yes\",", "\"id\": \"A62\",\n   \"action\": \"Approve a rules version\",\n   \"journeys\": [\n    \"models\"\n   ],\n   \"step_up\": \"open\",", 1]]],
  // the same words on owner and admin pages
  'w-budget': ['MP190-words', 'A', [["and it stays under £100.';\n  const limits", "and stays under £100.';\n  const limits", 1]]],
  'w-raise': ['MP190-words', 'A', [["const RAISE = 'When a line is close, code may draft a raise for your Approvals, with its cost and rollback.", "const RAISE = 'When a line is close, code may draft a raise for you, with its cost and rollback.", 1]]],
  'w-never': ['MP190-words', 'A', [["['Sign-in', 'Ledger reads', 'Audit', 'Recovery', 'Daily forecasts'].map(t => chip('fresh', t))", "['Sign-in', 'Ledger reads', 'Audit', 'Recovery'].map(t => chip('fresh', t))", 1]]],
  'w-keeps': ['MP190-words', 'A', [["Sign-in, ledger reads, audit, recovery and daily forecasts stay available at every cost threshold.", "Sign-in, ledger reads, audit and recovery stay available at every cost threshold.", 1]]],
  // alerts
  'al-repeat': ['MP190-alerts', 'A', [[", ['Repeat push', 'Once in 24 hours per holding, rule and severity, sooner if it worsens or the cause is new']]", "]", 1]]],
  'al-weekend': ['MP190-alerts', 'A', [["['Held alerts arrive', 'With the 07:30 brief on weekdays. In your inbox at 07:30 at the weekend']", "['Held alerts arrive', '07:30 brief']", 1]]],
  'al-material': ['MP190-alerts', 'A', [["Material means a line you set is crossed, and each line\\'s value is still yours to set.", "What counts as material is open.", 1]]],
  // the admin OPEN table
  'open-a23': ['MP190-open', 'AR', [["'Settled, 5 Nov 2026 (\"Code marks it\", ADM-23):", "'Labelled proposed (\"Code marks it\"):", 1]]],
  'open-a06': ['MP190-open', 'AR', [["'Settled, 5 Nov 2026 (\"No, keep it apart\", ADM-06):", "'Drawn as a condition, not a fact (\"No, keep it apart\"):", 1]]],
};
/* undo the whole of a pick at once, so a fact held by two parts is not passed by one alone (lesson 54) */
const WHOLE = {
  '35-whole': ['35-sentence', '35-margin', '35-sheet', '35-decide', '35-lines', '35-sizing'],
  '16-whole': ['16-approvals', '16-holdings', '16-rail'],
  '25-whole': ['25-key', '25-row', '25-kept', '25-rung'],
  '36-whole': ['36-rows', '36-step', '36-rung'],
  'q11b-whole': ['q11b-pair', 'q11b-na', 'q11b-label', 'q11b-home', 'q11b-research'],
  'a06-whole': ['a06-time', 'a06-cond', 'a06-req'],
  'a09-whole': ['a09-model', 'a09-rules', 'a09-live'],
  'w-whole': ['w-budget', 'w-raise', 'w-never', 'w-keeps'],
};

function run(fact, target, mutated) {
  const real = FILES[target], isReal = target.length === 2 || target === 'P';
  if (isReal) {
    const backup = join(out, `orig-${target}`), before = sha(real);
    copyFileSync(join(REPO, real), backup);
    try {
      writeFileSync(join(REPO, real), mutated);
      return target === 'JR' ? spawnSync('node', ['scripts/design_journeys_facts.mjs', fact], { cwd: REPO, encoding: 'utf8' }) : spawnSync('node', ['scripts/design_admin_facts.mjs', '--facts'], { cwd: REPO, encoding: 'utf8' });
    } finally {
      copyFileSync(backup, join(REPO, real));
      if (sha(real) !== before) throw new Error(`${real} was not restored`);
    }
  }
  const copy = join(out, `mut-${fact}-${Date.now()}.html`);
  writeFileSync(copy, mutated);
  return target === 'J' ? spawnSync('node', ['scripts/design_journeys_facts.mjs', fact, '--page', copy], { cwd: REPO, encoding: 'utf8' }) : spawnSync('node', ['scripts/design_admin_facts.mjs', '--facts', '--page', copy], { cwd: REPO, encoding: 'utf8' });
}

const only = process.argv[2] ? process.argv[2].split(',') : [...Object.keys(M), ...Object.keys(WHOLE)];
let bad = 0;
for (const name of only) {
  const parts = WHOLE[name] || [name], [fact, target] = M[parts[0]];
  let s = readFileSync(join(REPO, FILES[target]), 'utf8'), refused = '';
  for (const part of parts) for (const [from, to, n] of M[part][2]) {
    const c = count(s, from);
    if (c !== n) { refused = `"${from.slice(0, 70)}" found ${c} times, not ${n}`; break; }
    s = s.split(from).join(to);
  }
  if (refused) { console.log(`REFUSED ${name}: ${refused}`); bad = Math.max(bad, 3); continue; }
  const r = run(fact, target, s);
  const failLine = r.stdout.split('\n').find((l) => l.startsWith(`FAIL ${fact}:`));
  const ok = target === 'J' || target === 'JR' ? r.status === 1 && failLine : failLine;
  console.log(`${ok ? 'BITES ' : 'MISSES'} ${name.padEnd(14)} ${fact.padEnd(18)} ${(failLine || r.stdout.trim().split('\n').pop() || '').slice(0, 170)}`);
  if (!ok) bad = Math.max(bad, 1);
}
process.exit(bad);
