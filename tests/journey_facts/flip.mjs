// MP-178: both options on all eight journeys, with a flip between them. What each check holds, on the rendered screens.
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const flips = (html) => [...html.matchAll(/data-flip="([^"]+)"/g)].map((m) => m[1]);
const chips = (html) => (html.match(/<div class="jfresh[\s\S]*?<\/div>/) || [''])[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const amount = (t) => t.replace(/£([\d,]+) £\1 \.(\d\d)/g, '£$1.$2');

// each entry: journey, A screen, B screen, and what both must say in Ready
const SAME = [
  ['home', 'a', 'a-portfolio', 'b-ledger', [/£84,612/, /1\.48%/]],
  ['holdings', 'a', 'a-list', 'b-accounts', [/£84,612/]],
  ['forecast', 'a', 'a-instrument', 'b-ladder', [/\+6\.2%/, /21:15/]],
  ['cost', 'a', 'cost-a-home', 'cost-b-home', [/£46/, /£100/]],
  ['cost', 'a', 'cost-a-month', 'cost-b-burn', [/£46\.42/, /£59\.73/]],
];

export default {
  // Every journey flips, both ways, on every surface and in every state.
  'MP-178-eight': ({ journeys, screens, view, must }) => {
    must(journeys().length === 8, `${journeys().length} journeys`);
    for (const j of journeys()) for (const o of ['a', 'b']) for (const surface of SURFACES) for (const state of STATES) {
      const n = screens(j, o).filter((s) => flips(view(j, o, s, surface, state).html).length).length;
      must(n >= 1, `${j}.${o} ${surface} ${state}: no screen has a flip`);
    }
  },
  // A flip goes to a real screen of the other option, and turning it again never strands the owner.
  'MP-178-targets': ({ journeys, screens, view, must }) => {
    for (const j of journeys()) for (const o of ['a', 'b']) for (const s of screens(j, o)) for (const f of flips(view(j, o, s).html)) {
      const [jj, oo, ss] = f.split('|');
      must(jj === j && oo !== o, `${j}.${o}.${s} flips to ${f}`);
      must(screens(jj, oo).includes(ss), `${j}.${o}.${s} flips to a screen that is not drawn: ${f}`);
      must(flips(view(jj, oo, ss).html).length, `${f} has no way back`);
    }
  },
  // No flip while signed out, during a step-up, or on an approval, an outcome or a record in progress.
  'MP-178-never': ({ view, must }) => {
    const none = [['holdings', 'a', 'a-approve'], ['holdings', 'a', 'a-live'], ['holdings', 'b', 'b-approve'], ['holdings', 'b', 'b-live'], ['approvals', 'a', 'aa-step'], ['approvals', 'a', 'aa-result'], ['approvals', 'b', 'ab-step'], ['approvals', 'b', 'ab-model-step'], ['journal', 'a', 'a-record'], ['journal', 'b', 'b-decide'], ['privacy', 'a', 'privacy-a-signin'], ['privacy', 'b', 'privacy-b-signin'], ['privacy', 'a', 'privacy-a-device'], ['privacy', 'b', 'privacy-b-lost']];
    for (const [j, o, s] of none) for (const surface of SURFACES) must(!flips(view(j, o, s, surface).html).length, `${j}.${o}.${s} ${surface} has a flip`);
  },
  // A flipped pair shows the same freshness and provider status in every state, and the same figures in Ready.
  'MP-178-same': ({ view, must, has }) => {
    for (const [j, o, a, b, figures] of SAME) {
      const other = o === 'a' ? 'b' : 'a';
      for (const state of STATES) must(chips(view(j, o, a, 'web', state).html) === chips(view(j, other, b, 'web', state).html), `${j} ${a} and ${b} differ in ${state}: "${chips(view(j, o, a, 'web', state).html)}" against "${chips(view(j, other, b, 'web', state).html)}"`);
      for (const re of figures) for (const [oo, s] of [[o, a], [other, b]]) has(amount(view(j, oo, s).text), re, `${j}.${oo}.${s} does not show ${re}`);
    }
  },
  // The control is a real button, named for the view it turns to.
  'MP-178-control': ({ view, has }) => {
    has(view('home', 'a', 'a-portfolio').html, /<button class="flipbtn[^>]*aria-label="Flip to Ledger"/);
    has(view('home', 'b', 'b-ledger').html, /<button class="flipbtn[^>]*aria-label="Flip to Tiles"/);
    has(view('privacy', 'a', 'privacy-a-centre', 'pwa').html, /aria-label="Flip to Checkup"/);
  },
};
