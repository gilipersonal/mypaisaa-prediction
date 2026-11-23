// MP-188's proof that each passkey and recovery check bites (lessons 34 and 54): undo a fix in a copy of the built page,
// then run the checks that hold it against the copy. Each must fail (exit 1), never exit 0 or 2. A mutation whose text is
// not found the expected number of times is REFUSED (exit 3): later work has moved that text, so the proof needs updating,
// not trusting. A "whole" mutation undoes every part of one pick at once.
//
//   node review/MP-188/mutate.mjs [OUT_DIR] [name,name]   # defaults: a temp folder, every mutation
import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PAGES = { journeys: join(REPO, 'docs/design/journeys/index.html'), admin: join(REPO, 'docs/design/admin/index.html') };
const outDir = process.argv[2] || mkdtempSync(join(tmpdir(), 'mp188-mutate-'));
const count = (s, x) => s.split(x).length - 1;
// journeys checks run on the journeys runner; admin checks on the admin runner, which also reads a journeys copy with --journeys
const J = (id) => ['journeys', id], A = (id) => ['admin', id];
/* name: [page, [[from, to, times]], [checks that must fail]] */
const P = {
  // ADM-13 "Redraw Privacy now", on Privacy
  'j13-pathrow': ['journeys', [["li('lock', 'Passkey, iPhone', 'Cannot be set up until the Developer Program is bought (MP-179)', chipOf(['stale', 'Waiting on MP-179', 'clock']))", "li('lock', 'Passkey, iPhone', 'Last used today', chipOf(['fresh', 'Healthy']))", 1]], [J('MP188-adm13'), A('MP188-one-story')]],
  'j13-count': ['journeys', [['<span class="small muted">2 usable · 1 waiting</span>', '<span class="small muted">3 healthy</span>', 1]], [J('MP188-adm13'), A('MP188-one-story')]],
  'j13-devices': ['journeys', [["['iPhone', 'Active 40 min ago · Google'], ['iPad', 'Active 2 h ago · Google']", "['iPhone', 'Active 40 min ago · Passkey'], ['iPad', 'Active 2 h ago · Google']", 1]], [J('MP188-adm13'), A('MP188-one-story')]],
  // a second name takes the fixed ternary, so the old sentence is what renders (an "||" in front would bind tighter than "?:")
  'j13-replacement': ['journeys', [['const four = ctx.kind === \'web\' ? `On this Mac.', 'const four = `On the new ${gone}, when you have it.`, fixed4 = ctx.kind === \'web\' ? `On this Mac.', 1]], [J('MP188-adm13')]],
  'j13-checkup': ['journeys', [["'2 usable · Mac passkey and Google · iPhone waits on MP-179'", "'3 healthy · 2 passkeys and Google'", 1]], [J('MP188-adm13')]],
  'j13-lastpath': ['journeys', [["[li('person', 'Google', 'Linked on proof of both · the only path', chipOf(['stale', 'Last path', 'alert']))]", "[li('lock', 'Passkey, iPhone', 'This device', chipOf(['stale', 'Last path', 'alert']))]", 1]], [J('MP188-adm13'), A('MP188-one-story')]],
  'j13-pathin': ['journeys', [["const PATH_IN = { iphone: 'Google',", "const PATH_IN = { iphone: 'Your iPhone passkey',", 1]], [J('MP188-adm13')]],
  // ADM-03 "Any healthy path", on Privacy
  'j03-button': ['journeys', [['`Revoke the ${target(ctx)}`', "'Revoke with a passkey'", 1]], [J('MP188-adm03')]],
  'j03-any': ['journeys', [["const ANY = 'Any healthy path, passkey or Google, can revoke.';", "const ANY = '';", 1]], [J('MP188-adm03'), A('MP188-one-story')]],
  // ADM-02 "Revoke removes it too", on Privacy
  'j02-removes': ['journeys', [["const REMOVES = 'It also removes any passkey held on that device. Where it held one, your path count drops by one.';", "const REMOVES = '';", 1]], [J('MP188-adm02'), A('MP188-one-story')]],
  'j02-setup': ['journeys', [['Optional. Ends its sessions, closes its live streams and removes any passkey held on it. ${unv()}', 'Optional. Ends its sessions and closes its live streams.', 1]], [J('MP188-adm02')]],
  // ADM-04 "Allowed in the browser", on Privacy
  'j04-addwhere': ['journeys', [['const addWhere = ctx => (', "const addWhere = ctx => ['Add a passkey here', 'So this device can sign in by itself.'] || (", 1]], [J('MP188-adm04')]],
  'j04-browserrow': ['journeys', [["...(ctx.kind === 'pwa' ? [li('plus', 'Passkey, this browser'", "...(false ? [li('plus', 'Passkey, this browser'", 1]], [J('MP188-adm04')]],
  'j04-empty': ['journeys', [["const add = ctx.kind === 'web' ?", "const add = smbtn('Add a passkey', 'primary') || ctx.kind === 'web' ?", 1]], [J('MP188-adm04')]],
  // ADM-15 "Finish in the phone browser", and its fallback, on Privacy
  'j15-maclost': ['journeys', [['const macLost = ctx => `', "const macLost = ctx => '' && `", 1]], [J('MP188-adm15')]],
  'j15-fallback': ['journeys', [[' If the browser test fails, you stay on Google alone, warned, until you reach a Mac.', '', 1]], [J('MP188-adm15')]],
  // the Unverified label, on Privacy
  'j-unverified': ['journeys', [["const unv = () => chipOf(['unverified', 'Unverified · MP-197', 'info']);", "const unv = () => '';", 1]], [J('MP188-unverified'), J('MP188-adm02'), J('MP188-adm04'), J('MP188-adm15')]],

  // ADM-04 on Identity and the inventory
  'a04-perm': ['admin', [['"phone": "browser",', '"phone": "off",', 1]], [A('MP188-adm04-identity'), A('MP188-adm15-identity')]],
  'a04-enrol': ['admin', [["act('A48', 'Enrol a passkey in this browser', 'primary')", "''", 1]], [A('MP188-adm04-identity')]],
  'a04-appnote': ['admin', [[' A passkey in ${phoneBrowser(ctx)} counts.', '', 1]], [A('MP188-adm04-identity')]],
  // ADM-15 on Identity
  'a15-phoneend': ['admin', [[': phoneEnd(ctx);', ": st(3, '', 'Add a replacement', 'Not on this device yet.', '');", 1]], [A('MP188-adm15-identity'), A('R1-s1'), A('R5-s3')]],
  'a15-fallbackcard': ['admin', [['${macCard(ctx)}${fallbackCard(ctx)}', '${macCard(ctx)}', 1]], [A('MP188-adm15-identity')]],
  // R1-s1 asks only that a fallback shows; the rail card still does here, and the whole undo below takes both away
  'a15-fallbackline': ['admin', [['const fallbackLine = () => note(', "const fallbackLine = () => '' && note(", 1]], [A('MP188-adm15-identity')]],
  'a15-maccard': ['admin', [['you are back on two paths', 'you stay on one path', 2]], [A('MP188-adm15-identity')]],
  // ADM-02 on Identity
  'a02-rv': ['admin', [["const RV = 'Revoking also removes any passkey held on that device.", "const RV = 'What a revoke does to a passkey held on that device is not recorded.' || '", 1]], [A('MP188-adm02-identity'), A('MP188-one-story'), A('R3-s1'), A('R4-s4')]],
  'a02-sheet': ['admin', [["['Removes', 'Any passkey held on it'], ", '', 1]], [A('MP188-adm02-identity')]],
  'a02-open': ['admin', [['Settled, 5 Nov 2026 ("Revoke removes it too", ADM-02)', 'Not recorded', 1]], [A('MP188-adm02-identity')]],
  // ADM-03 on Identity
  'a03-any': ['admin', [["const ANY = 'A fresh sign-in on any healthy path, passkey or Google.';", "const ANY = 'A fresh sign-in with Passkey, Mac or Google.';", 1]], [A('MP188-adm03-identity'), A('MP188-one-story')]],
  'a03-sheet': ['admin', [["['Sign in with', 'Any healthy path, passkey or Google'], ", '', 1]], [A('MP188-adm03-identity')]],
  // ADM-13 on Identity
  'a13-devices': ['admin', [["['iPhone', 'Active 40 min ago · Google'], ['iPad', 'Active 2 h ago · Google']", "['iPhone', 'Active 40 min ago · Passkey'], ['iPad', 'Active 2 h ago · Google']", 1]], [A('MP188-adm13-identity'), A('MP188-one-story'), A('R3-s12')]],
  'a13-signedin': ['admin', [["['Signed in with', isApp(n) ? 'Google, in the system browser' : 'Google']", "['Signed in with', n === 'iPhone' ? 'Not settled · MP-179' : isApp(n) ? 'Google, in the system browser' : 'Google']", 1]], [A('MP188-adm13-identity')]],
  'a13-iphonerow': ['admin', [["'Passkey, iPhone', 'Cannot be set up yet'", "'Passkey, iPhone', 'Last used today'", 1]], [A('MP188-adm13-identity')]],
};
const WHOLE = {
  'j13-whole': ['j13-pathrow', 'j13-count', 'j13-devices', 'j13-replacement', 'j13-checkup', 'j13-lastpath', 'j13-pathin'],
  'j03-whole': ['j03-button', 'j03-any'],
  'j02-whole': ['j02-removes', 'j02-setup'],
  'j04-whole': ['j04-addwhere', 'j04-browserrow', 'j04-empty'],
  'j15-whole': ['j15-maclost', 'j15-fallback'],
  'a04-whole': ['a04-perm', 'a04-enrol', 'a04-appnote'],
  'a15-whole': ['a15-phoneend', 'a15-fallbackcard', 'a15-fallbackline', 'a15-maccard'],
  'a02-whole': ['a02-rv', 'a02-sheet', 'a02-open'],
  'a03-whole': ['a03-any', 'a03-sheet'],
  'a13-whole': ['a13-devices', 'a13-signedin', 'a13-iphonerow'],
};
const runs = [...Object.keys(P), ...Object.keys(WHOLE)];
const only = process.argv[3] ? process.argv[3].split(',') : runs;
let bad = 0;
for (const name of only) {
  const parts = WHOLE[name] || [name], kind = P[parts[0]][0];
  let s = readFileSync(PAGES[kind], 'utf8');
  for (const part of parts) for (const [from, to, n] of P[part][1]) {
    const c = count(s, from);
    if (c !== n) { console.log(`REFUSED ${name}: "${from.slice(0, 70)}" found ${c} times, not ${n}`); process.exitCode = 3; s = null; break; }
    s = s.split(from).join(to);
  }
  if (s === null) continue;
  const copy = `${outDir}/mut-${name}.html`;
  writeFileSync(copy, s);
  const checks = [...new Map(parts.flatMap((p) => P[p][2]).map((c) => [c.join(':'), c])).values()];
  for (const [runner, id] of checks) {
    const args = runner === 'journeys' ? ['scripts/design_journeys_facts.mjs', id, '--page', copy]
      : ['scripts/design_admin_facts.mjs', id, ...(kind === 'admin' ? ['--page', copy] : ['--journeys', copy])];
    const r = spawnSync('node', args, { cwd: REPO, encoding: 'utf8' });
    const line = (r.stdout.split('\n').find((l) => l.startsWith('FAIL') || l.startsWith('CANNOT')) || r.stdout.trim()).slice(0, 200);
    console.log(`${r.status === 1 ? 'BITES ' : 'MISSES'} ${name.padEnd(16)} ${id.padEnd(22)} exit ${r.status}  ${line}`);
    if (r.status !== 1) { bad++; process.exitCode = 1; }
  }
}
console.log(`mp188-mutate: ${bad ? `${bad} check(s) missed` : 'every check bites'} (copies in ${outDir})`);
