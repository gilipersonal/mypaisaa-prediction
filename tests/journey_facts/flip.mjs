// MP-178: both options on all eight journeys, with a flip between them. What each check holds, on the rendered screens.
// These walk every flip the page draws, on every device and in every state, so a new pair is covered without being listed.
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const flips = (html) => [...html.matchAll(/data-flip="([^"]+)"/g)].map((m) => m[1]);
const chips = (html) => (html.match(/<div class="jfresh[\s\S]*?<\/div>/) || [''])[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const amount = (t) => t.replace(/£([\d,]+) £\1 \.(\d\d)/g, '£$1.$2');

// figures each side of a flip must both show, or both not show
const AGREED = {
  home: [/£84,612/, /£78,508/, /6 of 7 priced/, /7 of 7 priced/],
  holdings: [/£84,612/, /£78,508/, /6 of 7 priced/],
  journal: [/You differed \d+/i],
  cost: [/£46\b/, /£39\b/, /£100/],
  approvals: [/£78,508/],
};

// every rendered flip: fn(journey, option, screen, surface, state, target option, target screen)
function walk(a, fn) {
  let n = 0;
  for (const j of a.journeys()) for (const o of a.options(j)) for (const s of a.screens(j, o)) for (const surface of SURFACES) for (const state of STATES) {
    for (const x of flips(a.view(j, o, s, surface, state).html)) { n++; const [, oo, ss] = x.split('|'); fn(j, o, s, surface, state, oo, ss); }
  }
  a.must(n > 100, `only ${n} flips were found, so nothing was proved`);
}

const NEVER = [['holdings', 'a', 'a-approve'], ['holdings', 'a', 'a-live'], ['holdings', 'a', 'a-manual'], ['holdings', 'a', 'a-edit'], ['holdings', 'a', 'a-preview'], ['holdings', 'a', 'a-difference'], ['holdings', 'a', 'a-rebuild'],
  ['holdings', 'b', 'b-approve'], ['holdings', 'b', 'b-live'], ['holdings', 'b', 'b-manual'], ['holdings', 'b', 'b-edit'], ['holdings', 'b', 'b-check'], ['holdings', 'b', 'b-add'], ['holdings', 'b', 'b-difference'], ['holdings', 'b', 'b-rebuild'],
  ['approvals', 'a', 'aa-listing'], ['approvals', 'a', 'aa-listing-step'], ['approvals', 'a', 'aa-model'], ['approvals', 'a', 'aa-setting'], ['approvals', 'a', 'aa-setting-step'], ['approvals', 'a', 'aa-setting-result'], ['approvals', 'a', 'aa-restart'], ['approvals', 'a', 'aa-restart-step'], ['approvals', 'a', 'aa-restart-result'], ['approvals', 'a', 'aa-step'], ['approvals', 'a', 'aa-result'], ['approvals', 'a', 'aa-after'], ['approvals', 'a', 'aa-revoke'], ['approvals', 'a', 'aa-record'],
  ['approvals', 'b', 'ab-chat'], ['approvals', 'b', 'ab-model'], ['approvals', 'b', 'ab-setting'], ['approvals', 'b', 'ab-setting-step'], ['approvals', 'b', 'ab-setting-result'], ['approvals', 'b', 'ab-restart'], ['approvals', 'b', 'ab-restart-step'], ['approvals', 'b', 'ab-restart-result'], ['approvals', 'b', 'ab-step'], ['approvals', 'b', 'ab-after'], ['approvals', 'b', 'ab-model-step'], ['approvals', 'b', 'ab-model-result'], ['approvals', 'b', 'ab-revoke'], ['approvals', 'b', 'ab-history'],
  ['journal', 'a', 'a-record'], ['journal', 'a', 'a-pick'], ['journal', 'b', 'b-decide'],
  ['privacy', 'a', 'privacy-a-signin'], ['privacy', 'b', 'privacy-b-signin'], ['privacy', 'a', 'privacy-a-device'], ['privacy', 'b', 'privacy-b-device'], ['privacy', 'b', 'privacy-b-lost'], ['privacy', 'a', 'privacy-a-delete'], ['privacy', 'b', 'privacy-b-delete'], ['privacy', 'a', 'privacy-a-renew'], ['privacy', 'b', 'privacy-b-renew']];

export default {
  // Every journey flips, on every surface and in every state.
  'MP-178-eight': ({ journeys, screens, view, must }) => {
    must(journeys().length === 8, `${journeys().length} journeys`);
    for (const j of journeys()) for (const o of ['a', 'b']) for (const surface of SURFACES) for (const state of STATES) {
      const n = screens(j, o).filter((s) => flips(view(j, o, s, surface, state).html).length).length;
      must(n >= 1, `${j}.${o} ${surface} ${state}: no screen has a flip`);
    }
  },
  // A flip goes to a real screen of the other option, and that screen can turn back from the same device and state.
  'MP-178-targets': (a) => {
    walk(a, (j, o, s, surface, state, oo, ss) => {
      a.must(oo !== o, `${j}.${o}.${s} flips to its own option`);
      a.must(a.screens(j, oo).includes(ss), `${j}.${o}.${s} flips to a screen that is not drawn: ${oo}.${ss}`);
      a.must(flips(a.view(j, oo, ss, surface, state).html).length, `${j}.${oo}.${ss} ${surface} ${state} has no way back to ${s}`);
    });
  },
  // The control is a real button, named for the view it turns to.
  'MP-178-control': ({ view, has }) => {
    has(view('home', 'a', 'a-portfolio').html, /<button class="flipbtn[^>]*aria-label="Flip to Ledger"/);
    has(view('home', 'b', 'b-ledger').html, /<button class="flipbtn[^>]*aria-label="Flip to Tiles"/);
    has(view('privacy', 'a', 'privacy-a-centre', 'pwa').html, /aria-label="Flip to In place"/);
  },
  // No flip behind an open sheet, on any screen, device or state.
  'R2-s1': ({ each, must }) => {
    each({}, (v, at) => must(!(v.html.includes('aria-modal="true"') && flips(v.html).length), `${at.journey}.${at.option}.${at.screen} ${at.surface} ${at.state}: a flip behind an open sheet`));
  },
  // No flip on a proposal, an approval, a step-up, an outcome, a draft or a sign-in, in any state.
  'R2-s2': ({ view, must }) => {
    for (const [j, o, s] of NEVER) for (const surface of SURFACES) for (const state of STATES) must(!flips(view(j, o, s, surface, state).html).length, `${j}.${o}.${s} ${surface} ${state} has a flip`);
  },
  // A commit in flight or unknown, and a refused permission, do not flip.
  'R2-j1': ({ view, must }) => {
    for (const [o, s] of [['a', 'a-done'], ['b', 'b-done']]) for (const st of ['loading', 'error', 'offline']) for (const surface of SURFACES) must(!flips(view('holdings', o, s, surface, st).html).length, `${s} ${surface} ${st} has a flip`);
    for (const [o, s] of [['a', 'a-private'], ['b', 'b-private']]) for (const surface of SURFACES) must(!flips(view('holdings', o, s, surface, 'error').html).length, `${s} ${surface} error has a flip`);
  },
  // Every flip keeps the same freshness and provider status, on every device and in every state.
  'R2-s7': (a) => {
    walk(a, (j, o, s, surface, state, oo, ss) => {
      const x = chips(a.view(j, o, s, surface, state).html), y = chips(a.view(j, oo, ss, surface, state).html);
      a.must(x && x === y, `${j} ${s} and ${ss}, ${surface} ${state}: "${x}" against "${y}"`);
    });
  },
  // Every flip keeps the journey's agreed figures: each side shows them, or neither does.
  'R2-r16': (a) => {
    walk(a, (j, o, s, surface, state, oo, ss) => {
      const x = amount(a.view(j, o, s, surface, state).text), y = amount(a.view(j, oo, ss, surface, state).text);
      for (const re of AGREED[j] || []) a.must(re.test(x) === re.test(y), `${j} ${s} and ${ss}, ${surface} ${state}: only one side shows ${re}`);
    });
  },
  // Record and history are not a pair; a record does not flip.
  'R2-r7': ({ view, must }) => {
    for (const surface of SURFACES) must(!flips(view('approvals', 'a', 'aa-record', surface).html).length && !flips(view('approvals', 'b', 'ab-history', surface).html).length, `${surface}: a record flips`);
  },
  // A screen with a sheet on the phones has no flip there.
  'R2-r15': ({ view, must }) => {
    for (const surface of ['iphone', 'pwa']) must(!flips(view('research', 'a', 'ra-source', surface).html).length, `ra-source ${surface} has a flip behind its sheet`);
  },
};
