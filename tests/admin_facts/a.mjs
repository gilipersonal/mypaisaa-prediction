// Lane a, MP-64 round 1: Approvals and configuration, Costs and budgets. Each check tests what the fix does on rendered screens, in the
// states and devices it applies to (lessons 2, 3, 11). Option B shares these parts, so a finding on both is walked on both.
import { api, load } from '../../scripts/design_journeys_facts.mjs';

// The owner Approvals page, for the findings that join it. OWNER_PAGE lets a proof undo a fix on a copy.
const ownerPage = () => api(load(process.env.OWNER_PAGE || new URL('../../docs/design/journeys/index.html', import.meta.url).pathname));
const SCOPE_WORDS = 'All segments, except US tech, 12 months and India midcap, 3 months';
const COSTS_LINES = ['ca-lines', 'cb-spikes'];
const WIDE = ['ipad', 'web'], PHONE = ['iphone', 'pwa'];
const liveBtn = (html, re) => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].filter(m => !/disabled/.test(m[1]) && re.test(m[2].replace(/<[^>]+>/g, ' ')));
const liveActs = html => [...html.matchAll(/<span class="aact" data-act="(A\d+)"><button\b([^>]*)>/g)].filter(m => !/disabled/.test(m[2])).map(m => m[1]);
const row = (text, label) => { const i = text.indexOf(label); return i < 0 ? '' : text.slice(i, i + 160); };

export default {
  'R1-a1': ({ each, lacks, has }) => {
    for (const screen of COSTS_LINES) each({ journey: 'costs', screen, state: 'error' }, (v) => { lacks(v.text, /£0\.00/, 'an unknown column reads as zero'); has(v.text, /At least £44\.40|at least £44\.40/); });
    each({ journey: 'costs', screen: 'ca-lines', state: 'error', surface: WIDE }, (v) => has(row(v.text, 'The month'), /Not added/));
  },
  'R1-a2': ({ each, has, must }) => {
    each({ journey: 'approvals' }, (v, at) => {
      must(!liveBtn(v.html.replace(/<span class="aact"[\s\S]*?<\/span>/g, ''), /\b(run|refresh)\b/i).filter(m => !/try again/i.test(m[2])).length, `${at.screen} ${at.state}: a check or a refresh outside act()`);
      if (PHONE.includes(at.surface)) {
        must(!liveBtn(v.html, /\b(run|refresh preview)\b/i).length, `${at.screen} ${at.state} ${at.surface}: a check is live on a phone`);
        must(![...v.html.matchAll(/<input\b[^>]*>/g)].some(m => !/disabled/.test(m[0])), `${at.screen} ${at.state} ${at.surface}: a live text input on a phone`);
      }
    });
    each({ journey: 'approvals', option: 'a', screen: 'aa-listing', state: ['error', 'conflict', 'expired'], surface: 'web' }, (v) => has(v.html, /data-act="A57"/));
    each({ journey: 'approvals', option: 'a', screen: 'aa-propose', state: 'default', surface: 'web' }, (v) => has(v.html, /data-act="A58"/));
    each({ journey: 'approvals', option: 'a', screen: 'aa-import', state: 'conflict', surface: 'web' }, (v) => has(v.html, /data-act="A53"/));
  },
  'R1-a3': ({ each, view, has, lacks }) => {
    for (const [o, screen, budget, credit] of [['a', 'ca-change', 'ca-budget', 'ca-credit'], ['b', 'cb-change', 'cb-budget', 'cb-credit']]) {
      const d = view('costs', o, screen, 'web', 'default');
      for (const re of [/Warn line/, /£60/, /£55/, /Budgets version/, /Against £100/, /£4\.73 past it/, /This approval is bound to/, /Payload hash/, /Budgets v2/, /Expires/, /A rollback makes v4 equal to v2/]) has(d.text, re);
      has(d.html, /data-act="A34"/);
      has(view('costs', o, screen, 'web', 'empty').text, /Applied/);
      has(view('costs', o, screen, 'web', 'conflict').text, /Refused/);
      has(view('costs', o, screen, 'web', 'expired').text, /Expired/);
      has(view('costs', o, screen, 'web', 'error').text, /Approved, not applied/);
      each({ journey: 'costs', option: o, screen: budget, surface: WIDE }, (v) => { if (v.text.includes('The lines')) has(v.text, /£100 ceiling is not a control here/); });
      const off = view('costs', o, credit, 'web', 'denied');
      for (const re of [/Up to £15\.00/, /November/, /Payload hash/, /Expires/, /A full month/]) has(off.text, re);
      lacks(view('costs', o, screen, 'iphone', 'default').html.replace(/data-act="A34" data-phone-off/g, ''), /data-act="A34"/);
    }
  },
  'R1-a4': ({ view, has, lacks, must }) => {
    const now = view('approvals', 'a', 'aa-now', 'web', 'default');
    for (const re of [/Watch Taiwan Semiconductor/, /Promote R2-HGB v4/, /Narrow a self-correction band/, /Confirm a statement import/, /Propose a change/]) has(now.text, re);
    must((now.html.match(/role="button"/g) || []).length >= 4 + 7, 'the four decisions and the families are not all doors');
    has(view('approvals', 'a', 'aa-band', 'web', 'default').text, /Propose a change/);
    const l = view('approvals', 'a', 'aa-listing', 'web', 'default').text;
    has(l, /v15 · proposed/); has(l, /v14 · current/);
    lacks(view('approvals', 'a', 'aa-listing', 'web', 'empty').text, /See the versions/);
    has(view('approvals', 'a', 'aa-listing', 'web', 'empty').text, /v15 · current/);
  },
  'R1-a5': ({ view, each, has }) => {
    each({ journey: 'approvals', option: 'a', screen: 'aa-band', state: ['default', 'expired', 'conflict', 'empty'], surface: 'web' }, (v) => { for (const re of [/You refused/, /backs off with a visible reason/, /Approved, not applied/, /Rolled back/, /Settings v10 keeps v9/]) has(v.text, re); });
    has(row(view('approvals', 'a', 'aa-band', 'web', 'default').text, 'v8 · previous'), /Weekly band 5 points · 10% a month/);
    each({ journey: 'approvals', option: 'a', screen: 'aa-listing', state: ['default', 'expired'], surface: 'web' }, (v) => has(v.text, /Confirmed, not applied[\s\S]*retry inside its window/));
  },
  'R1-a6': ({ each, has }) => {
    each({ journey: 'approvals', screen: 'aa-band', state: ['default', 'stale', 'offline', 'denied', 'partial'] }, (v) => has(v.text, /approving one sends the other back to its check/));
    each({ journey: 'approvals', screen: 'ab-request', state: 'default' }, (v) => has(v.text, /approving one sends the other back to its check/));
  },
  'R1-a7': ({ view, has, lacks, must }) => {
    for (const surface of [...WIDE, ...PHONE]) {
      const v = view('costs', 'a', 'ca-lines', surface, 'default');
      for (const re of [/What is held/, /Claude, credit and cash/, /Lines and allocations/]) has(v.text, re);
      lacks(v.html, /aria-label="Market data/, 'Market data opens nothing, so it is not a door');
    }
    const t = view('costs', 'a', 'ca-lines', 'web', 'default').html;
    must(['AWS', 'Claude', 'Reserved'].every(n => new RegExp(`<button class="acosts-lnk"[^>]*>${n}`).test(t)), 'a table row with a screen behind it is not a real control');
    must(!/<button class="acosts-lnk"[^>]*>Market data/.test(t), 'Market data has no screen, so no control');
  },
  'R1-a8': ({ each, view, has, must }) => {
    for (const [o, screen] of [['a', 'ca-credit'], ['b', 'cb-credit']]) {
      each({ journey: 'costs', option: o, screen, state: ['default', 'partial', 'stale', 'conflict', 'expired', 'empty', 'error', 'offline'], surface: WIDE }, (v) => {
        for (const re of [/Paid use/, /Approved/, /Paid use v1/, /Up to £15\.00/, /1 Nov/, /Withdraw paid use/]) has(v.text, re);
        must(!liveBtn(v.html, /Approve paid use/).length, 'A35 is live while paid use is already approved');
      });
      must(liveBtn(view('costs', o, screen, 'web', 'denied').html, /Approve paid use/).length === 1, 'A35 is not live with Claude off');
    }
  },
  'R1-a9': ({ view, has, lacks }) => {
    const t = view('costs', 'a', 'ca-line', 'web', 'expired').text;
    lacks(t, /reservation on this line/i); has(t, /Nightly explanations/);
  },
  'R1-a10': ({ view, has }) => {
    const t = view('approvals', 'a', 'aa-propose', 'web', 'partial');
    has(row(t.text, 'Allowed range'), /Inside the 10% limit/); has(t.text, /Cost £0/); has(row(t.text, 'Expected impact'), /Not checked/); has(t.html, /value="8%"/);
  },
  'R1-a11': ({ view, has, lacks, must }) => {
    has(view('approvals', 'a', 'aa-propose', 'web', 'error').html, /value="8%"/);
    const c = view('approvals', 'a', 'aa-propose', 'web', 'conflict');
    has(c.text, /Settings v10 · at most/); lacks(c.text, /Settings v9 · at most/); has(c.text, /Start again from v10/);
    must(!liveBtn(c.html, /Run the check/).length, 'Run the check stays live after the setting moved');
  },
  'R1-a12': ({ view, has, lacks }) => {
    const v = view('approvals', 'a', 'aa-band', 'web', 'conflict');
    has(row(v.text, 'v10 · current'), /Written at 09:01[\s\S]*weekly band 5 points/); has(row(v.text, 'v10 · current'), /Current/);
    lacks(v.text, /v10 · proposed/); lacks(v.text, /Roll back to v8/); has(v.text, /Roll back to v9/); has(v.text, /Refused/);
  },
  'R1-a13': ({ each, must }) => {
    each({ journey: 'approvals', screen: 'aa-policies', state: ['error', 'partial', 'conflict', 'offline', 'denied'], surface: WIDE }, (v, at) => must(!liveBtn(v.html, /Withdraw S10/).length, `Withdraw is live in ${at.state}`));
    each({ journey: 'approvals', screen: 'ab-new', state: ['error', 'partial', 'conflict'], surface: WIDE }, (v, at) => must(!liveBtn(v.html, /Withdraw S10/).length, `Withdraw is live in ${at.state}`));
  },
  'R1-a14': ({ view, has, lacks }) => {
    const l = view('costs', 'a', 'ca-lines', 'web', 'error').text;
    lacks(l, /Not read while the collector/); has(l, /not added to (this|the) lower bound/); has(l, /Held back/);
    const h = view('costs', 'a', 'ca-held', 'web', 'error').text;
    lacks(h, /did not load/); has(h, /£0\.34/); has(h, /not added to the lower bound/); has(h, /At least £44\.40/);
  },
  'R1-a15': ({ each, view, has, lacks }) => {
    for (const screen of ['ca-lines', 'ca-line', 'ca-held', 'ca-credit', 'ca-budget', 'ca-change', 'cb-spikes', 'cb-credit', 'cb-budget', 'cb-change']) each({ journey: 'costs', screen }, (v, at) => {
      if (at.state !== 'loading') has(v.text, /This screen shows the cost month, day (18|19|1) of 30\. The Records chip is admin's own clock/);
    });
    has(view('costs', 'a', 'ca-lines', 'web', 'offline').text, /Offline · from 21:15/);
    for (const s of ['ca-held', 'ca-credit']) lacks(view('costs', 'a', s, 'web', 'error').text.replace(/Records failed 11:38 · last good 11:20/g, ''), /11:38|11:20/);
  },
  'R1-a16': ({ each, has }) => {
    each({ journey: 'costs', screen: 'ca-held', state: ['default', 'error', 'stale', 'offline'] }, (v) => { has(v.text, /Statement extraction/); has(v.text, /isa-oct-2026-scan\.pdf/); has(v.text, /imp_2b90/); });
  },
  // Round 2. Each holds the kind, not only the line.
  'R2-a1': ({ each, must }) => {
    each({ journey: 'costs', screen: 'ca-credit', state: 'offline', surface: WIDE }, (v, at) => must(!liveBtn(v.html, /Withdraw paid use/).length, `A76 is live in ${at.state}`));
    each({ journey: 'costs', screen: 'cb-credit', state: 'offline', surface: WIDE }, (v, at) => must(!liveBtn(v.html, /Withdraw paid use/).length, `A76 is live in ${at.state}`));
    for (const journey of ['costs', 'approvals']) each({ journey, state: 'offline', surface: WIDE }, (v, at) => must(!liveActs(v.html).filter(id => id !== 'A03').length, `${at.screen}: ${liveActs(v.html)} live offline`));
    each({ journey: 'costs', screen: 'ca-credit', state: 'default', surface: 'web' }, (v) => must(liveBtn(v.html, /Withdraw paid use/).length === 1, 'A76 is shut in Ready'));
  },
  'R2-a2': ({ each, view, has }) => {
    for (const [o, screen] of [['a', 'ca-change'], ['b', 'cb-change']]) {
      each({ journey: 'costs', option: o, screen, state: ['default', 'stale', 'offline', 'denied'] }, (v) => { for (const re of [/Impact, evidence, cost and rollback/, /Evidence/, /Allowed range/, /Proposed · CT-13/, /How to roll it back/]) has(v.text, re); });
      has(view('costs', o, screen, 'web', 'default').text, /You drafted/);
      has(row(view('costs', o, screen, 'web', 'partial').text, 'Evidence'), /Not checked/);
    }
  },
  'R2-a3': ({ each, view, has, must }) => {
    for (const [o, screen] of [['a', 'ca-change'], ['b', 'cb-change']]) {
      const d = view('costs', o, screen, 'web', 'default');
      must(/<select\b(?![^>]*disabled)/.test(d.html), 'no live choice of line or allocation');
      for (const re of [/Warn line, £60/, /AWS, £22/, /Claude and evaluations, £15/]) has(d.html, re);
      must(/<input\b[^>]*aria-label="New value"(?![^>]*disabled)/.test(d.html), 'no value field');
      has(d.html, /data-act="A58"/);
    }
    each({ journey: 'costs', surface: PHONE }, (v, at) => must(![...v.html.matchAll(/<(input|select)\b[^>]*>/g)].some(m => !/disabled/.test(m[0])), `${at.screen} ${at.state}: a live field on a phone`));
    each({ journey: 'costs', option: 'a', screen: 'ca-change', state: 'offline', surface: 'web' }, (v) => must(/<select\b[^>]*disabled/.test(v.html), 'the draft is live offline'));
  },
  'R2-a4': ({ each, has, must }) => {
    for (const screen of ['ca-budget', 'cb-budget']) {
      each({ journey: 'costs', screen, surface: WIDE }, (v, at) => {
        if (at.state === 'loading') return;
        has(v.text, /v2 · current/); has(v.text, /v1 · previous/);
        const liveRb = liveBtn(v.html, /Roll back to v1/).length;
        must(['offline', 'denied', 'error', 'partial'].includes(at.state) ? !liveRb : liveRb === 1, `the rollback in ${at.state}`);
      });
    }
  },
  'R2-a5': ({ each, must }) => {
    each({ journey: 'costs' }, (v) => must(!/data-act="A32"/.test(v.html), 'a budget rollback drawn as A32'));
    each({ journey: 'costs', screen: 'ca-budget', state: 'default', surface: 'web' }, (v) => must(/data-act="A34"><button[^>]*>[\s\S]*?Roll back to v1/.test(v.html), 'the rollback is not A34'));
    each({ journey: 'costs', screen: 'ca-change', state: 'empty', surface: 'web' }, (v) => must(/data-act="A34"><button[^>]*>[\s\S]*?Roll back to v2/.test(v.html), 'the rollback is not A34'));
  },
  // narrowed in MP-192: the owner's picks settle these rules ("Approve all three", MP40-Q6), so the label reads Settled with the pick's id, beside the same fact
  'R2-a6': ({ each, view, has, lacks }) => {
    for (const [o, screen] of [['a', 'ca-credit'], ['b', 'cb-credit']]) {
      const e = view('costs', o, screen, 'web', 'error').text, st = view('costs', o, screen, 'web', 'stale').text;
      has(e, /AWS collector failed at 06:10/); lacks(e, /did not arrive/);
      has(st, /AWS billing is 39 hours old/); lacks(st, /older than one window/); has(st, /Settled · MP40-Q6/);
    }
    each({ journey: 'costs' }, (v) => lacks(v.text, /Try again/, 'a collector is retried at its window, never by hand'));
  },
  'R2-a7': ({ each, has, lacks }) => {
    for (const screen of ['aa-listing', 'ab-listing']) each({ journey: 'approvals', screen, state: 'error', surface: WIDE }, (v) => { has(row(v.text, 'Coverage'), /Timed out, no result/); has(row(v.text, 'Busiest minute'), /Not finished/); lacks(v.text, /Rights and budget Recorded/); });
  },
  'R2-a8': ({ each, view, has, lacks, must }) => {
    for (const [o, screen] of [['a', 'aa-propose'], ['b', 'ab-new']]) {
      const d = view('approvals', o, screen, 'web', 'default');
      must(liveBtn(d.html, /Approve this change/).length === 1, 'A31 is live nowhere');
      lacks(d.text, /Waits for a value/); for (const re of [/This approval is bound to/, /Payload hash/, /How this can end/, /You drafted/]) has(d.text, re);
      must(!liveBtn(view('approvals', o, screen, 'web', 'empty').html, /Approve this change/).length, 'A31 is live with no draft');
      has(view('approvals', o, screen, 'web', 'empty').text, /Waits for a value/);
    }
  },
  'R2-a9': ({ each, must }) => {
    for (const screen of ['aa-band', 'ab-outcomes']) each({ journey: 'approvals', screen, state: ['offline', 'denied', 'error', 'partial'], surface: WIDE }, (v, at) => must(!liveBtn(v.html, /Roll back/).length, `${screen}: a rollback is live in ${at.state}`));
  },
  'R2-a10': ({ each, must }) => {
    for (const journey of ['approvals', 'costs']) each({ journey, surface: PHONE }, (v, at) => must(!liveBtn(v.html, /start again|choose a setting|propose a change|draft it again|change a line/i).length, `${at.screen} ${at.state}: a draft starts on a phone`));
  },
  'R2-a11': ({ each, has }) => {
    for (const screen of ['ca-credit', 'cb-credit']) each({ journey: 'costs', screen, state: ['default', 'offline', 'error', 'expired'], surface: 'web' }, (v) => { for (const re of [/If you withdraw paid use/, /£46\.48/, /Chat and research/, /Open reservations/, /How this can end/, /Withdrawn/]) has(v.text, re); });
    for (const screen of ['aa-policies']) each({ journey: 'approvals', screen, state: ['default', 'stale', 'empty'], surface: 'web' }, (v) => { for (const re of [/If you withdraw S10/, /Stops at once/, /Unavailable for that use/, /Disposition pending/, /How this can end/]) has(v.text, re); });
  },
  'R2-m10-a': ({ each, view, has }) => {
    for (const [o, screen] of [['a', 'aa-now'], ['b', 'ab-queue']]) {
      each({ journey: 'approvals', option: o, screen, state: ['default', 'stale', 'offline', 'denied', 'conflict', 'expired', 'partial'] }, (v) => { has(v.text, /1 paused scope waits on your restart\./); has(v.text, /Restart US tech, 12 months/); has(v.text, /outside the dated count/); });
      has(view('approvals', o, screen, 'web', 'default').text, /4 decisions wait on you|4 decisions? wait/);
    }
  },
  // Round 3: no sentence without its record, and a sum beside its inputs is computed from them.
  'R3-a1': ({ each, has, lacks }) => {
    for (const [journey, screen] of [['approvals', 'aa-policies'], ['approvals', 'ab-new']]) each({ journey, screen, surface: 'web', state: ['default', 'stale', 'partial', 'conflict', 'expired', 'denied', 'offline', 'empty', 'error'] }, (v, at) => {
      if (screen === 'ab-new') { lacks(v.text, /New use of Yahoo/); return; }
      has(row(v.text, 'Yahoo values to Claude routes'), /Stops at once/); has(row(v.text, 'Yahoo prices, S6 and S7'), /Unchanged/); lacks(v.text, /New use of Yahoo|Set the scope again/); has(v.text, /Cached projections and affected derivations/); has(v.text, /Withdraw S10, Yahoo to Claude/);
    });
  },
  'R3-a2': ({ each, has, lacks }) => {
    const o = ownerPage();
    for (const [option, screen, step] of [['a', 'aa-model', 'aa-step'], ['b', 'ab-model', 'ab-model-step']]) {
      for (const state of ['default', 'noModel', 'offline']) { const t = o.view('approvals', option, screen, 'web', state).text; o.must(t.includes(`Scope ${SCOPE_WORDS}`), `${screen} ${state}: the bound scope`); o.must(t.includes('Tasks 3, 6, 12 months'), `${screen} ${state}: the tasks`); }
      for (const state of ['default', 'noModel']) o.must(o.view('approvals', option, step, 'iphone', state).text.includes(`Scope ${SCOPE_WORDS}`), `${step} ${state}: the sheet's scope`);
      const n = o.view('approvals', option, screen, 'web', 'noModel').text;
      for (const w of ['R2-HGB v3, where eligible', 'Back to v3 by itself, where v3 is eligible', 'v4, where v3 issues']) o.must(n.includes(w), `${screen}: "${w}"`);
      o.must(!/elsewhere/.test(n), `${screen}: "elsewhere" is untrue of India midcap`);
    }
    for (const [option, screen] of [['a', 'aa-now'], ['b', 'ab-queue']]) each({ journey: 'approvals', option, screen, state: ['default', 'stale', 'partial', 'denied', 'offline'] }, (v) => has(v.text, new RegExp(SCOPE_WORDS)));
  },
  'R3-a3': ({ each, view, has, lacks }) => {
    for (const [o, screen] of [['a', 'ca-credit'], ['b', 'cb-credit']]) {
      {
        const r = row(view('costs', o, screen, 'web', 'error').text, "This month's forecast");
        has(r, /£54\.73 At least £53\.19/, 'Failed: what is spent stays in the month, and £6.71 is a lower bound'); lacks(r, /at most/); has(r, /later calls are not added/);
      }
      for (const [state, used] of [['default', 7.06], ['stale', 7.06], ['expired', 7.06]]) {
        const v = view('costs', o, screen, 'web', state).text, to = 46.48 + used, r = row(v, "This month's forecast");
        has(r, new RegExp(`£54\\.73 £${to.toFixed(2).replace('.', '\\.')}`), `${state}: the row does not tie to the Claude already spent`);
        has(r, new RegExp(`at most £${(to + 0.34).toFixed(2).replace('.', '\\.')}`));
      }
      has(row(view('costs', o, screen, 'web', 'empty').text, "This month's forecast"), /£46\.48/);
      has(row(view('costs', o, screen, 'web', 'default').text, 'A full month'), /£54\.73 £46\.48/);
      has(row(view('costs', o, screen, 'web', 'denied').text, 'A full month'), /£46\.48 £54\.73/);
      lacks(view('costs', o, screen, 'web', 'denied').text, /Month forecast/);
    }
  },
  'R3-a4': () => {
    const o = ownerPage();
    for (const [option, step, res] of [['a', 'aa-step', 'aa-result'], ['b', 'ab-model-step', 'ab-model-result']]) {
      const st = o.view('approvals', option, step, 'iphone', 'noModel'), rs = o.view('approvals', option, res, 'web', 'noModel');
      o.must(!st.na && !rs.na, `${step}: still marked as not applying`);
      o.must(/Previous safe R2-HGB v3, where eligible/.test(st.text) && /Approve with a fresh sign-in/.test(st.text) && /US tech, 12 months stays paused/.test(st.text), `${step}: the sheet does not bind the waiting scope`);
      o.must(/Promoted where v3 was eligible\./.test(rs.text) && /US tech, 12 months stays paused, and its restart still waits on you/.test(rs.text), `${res}: no outcome for the waiting scope`);
    }
  },
  'R3-a5': ({ each, has }) => {
    for (const [option, screen] of [['a', 'aa-propose'], ['b', 'ab-new']]) each({ journey: 'approvals', option, screen, state: ['default', 'stale', 'offline', 'denied', 'partial', 'error', 'expired'], surface: 'web' }, (v) => { has(v.text, /Narrow a self-correction band is refused and rebuilt on v10/); has(v.text, /Promote R2-HGB v4 binds the 10% limit/); });
  },
  'R3-a6': ({ each, has, lacks, must }) => {
    for (const screen of ['ca-change', 'cb-change']) each({ journey: 'costs', screen, state: ['conflict', 'expired'], surface: WIDE }, (v, at) => {
      lacks(v.text, /Not now|Bound to Budgets v2|until it expires|expires tomorrow/); must(!liveBtn(v.html, /Approve this change/).length, 'A34 is live on a closed change');
      if (at.state === 'expired') { has(v.text, /An expired change cannot be approved/); has(v.text, /Expires Expired/); has(v.text, /day 19 of 30/); lacks(v.text, /Tomorrow, 18:00/); } else has(v.text, /Refused against v2/);
    });
  },
  'R3-a7': ({ each, view, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-propose'], ['b', 'ab-new']]) {
      each({ journey: 'approvals', option, screen, state: 'conflict', surface: WIDE }, (v) => lacks(v.text, /keeps v9 as its previous|Settings v9 stays current|settings v9 stays current|Settings v9 ·/));
      const e = view('approvals', option, screen, 'web', 'empty').text; has(e, /Settings v11 keeps v10/); lacks(e, /Settings v9/);
    }
  },
  'R3-a8': ({ each, view, has, lacks, must }) => {
    for (const [option, screen] of [['a', 'aa-propose'], ['b', 'ab-new']]) {
      const v = view('approvals', option, screen, 'web', 'default');
      must(/<select\b(?![^>]*disabled)[^>]*aria-label="Setting"|<select aria-label="Setting">/.test(v.html), 'no live choice of setting');
      for (const re of [/Signal weight band/, /Weekly band/, /Risk settings/, /Agent settings/]) has(v.html, re);
      lacks(view('approvals', option, screen, 'web', 'empty').text, /Choose a setting/);
      each({ journey: 'approvals', option, screen, surface: PHONE }, (x, at) => must(![...x.html.matchAll(/<select\b[^>]*>/g)].some(m => !/disabled/.test(m[0])), `${at.state}: a live select on a phone`));
    }
  },
  // The owner, 4 Nov 2026, on R3-a9: "Allow it (Recommended)". With the AWS billing collector failed, withdrawing paid use stays possible, because it can only lower spend.
  'R4-owner-a76': ({ each, has, must }) => {
    for (const screen of ['ca-credit', 'cb-credit']) {
      each({ journey: 'costs', screen, state: 'error', surface: WIDE }, (v) => { must(liveBtn(v.html, /Withdraw paid use/).length === 1, 'A76 is shut in Failed'); has(v.text, /can only lower spend/); });
      each({ journey: 'costs', screen, state: 'error', surface: PHONE }, (v) => must(!liveBtn(v.html, /Withdraw paid use/).length, 'A76 is live on a phone in Failed'));
    }
  },
  // Round 4.
  'R4-a1': ({ each, has }) => {
    for (const screen of ['ca-credit', 'cb-credit']) each({ journey: 'costs', screen, state: ['default', 'stale', 'error', 'expired', 'partial', 'offline'], surface: 'web' }, (v) => has(v.text, /£54\.73 is before the scan at its cap\. The month's forecast, up to £59\.73, falls to £53\.(54|19)\./));
  },
  'R4-a2': ({ each, has, lacks }) => {
    each({ journey: 'costs', state: 'error' }, (v) => { lacks(v.text, /Up to £6\.71/, 'a lower bound reads as a ceiling'); lacks(v.text, /at most £53/); });
    for (const screen of ['ca-credit', 'cb-credit']) each({ journey: 'costs', screen, state: 'error', surface: 'web' }, (v) => has(row(v.text, 'Cash Counted'), /At least £6\.71/));
  },
  'R4-a3': ({ each, has }) => {
    for (const screen of ['ca-budget', 'cb-budget', 'ca-change', 'cb-change']) each({ journey: 'costs', screen, state: 'expired' }, (v) => { has(v.text, /A day later/); has(v.text, /day 19 of 30/); });
  },
  'R4-a4': ({ each, has, lacks }) => {
    each({ journey: 'approvals', screen: 'aa-policies', state: ['default', 'stale', 'partial', 'error', 'offline', 'conflict', 'expired', 'denied', 'empty'], surface: 'web' }, (v) => { has(row(v.text, 'Stored data, backups and models'), /Disposition pending/); has(v.text, /Proposed · DATA-DEC-04/); lacks(v.text, /What was already sent/); });
  },
  'R4-a5': () => {
    const o = ownerPage();
    for (const [option, screen, res] of [['a', 'aa-model', 'aa-result'], ['b', 'ab-model', 'ab-model-result']]) {
      for (const surface of ['web', 'iphone']) for (const state of ['default', 'offline', 'noModel']) { const t = o.view('approvals', option, screen, surface, state).text; for (const w of ['Two scopes this does not settle', 'US tech, 12 months Stays paused', 'India midcap, 3 months Stays on R1-LGB v1', 'each keeps its own yes']) o.must(t.includes(w), `${screen} ${surface} ${state}: "${w}"`); }
      const n = o.view('approvals', option, screen, 'web', 'noModel').text;
      o.must(n.includes('The rest of its scope can still be promoted') && !n.includes('The others can'), `${screen}: "the others" is untrue of India midcap`);
      const r = o.view('approvals', option, res, 'web', 'noModel').text;
      o.must(r.includes('India midcap, 3 months stays on R1-LGB v1') && /on probation|probation/i.test(r), `${res}: the outcome stops short`);
    }
  },
  'R4-a6': ({ view, must }) => {
    const o = ownerPage(), LINES = [`Scope ${SCOPE_WORDS}`, 'Tasks 3, 6, 12 months', 'Calibrator c8', 'Limits 5 points, 10%', 'Previous safe R2-HGB v3, where eligible'];
    for (const [option, screen, step] of [['a', 'aa-model', 'aa-step'], ['b', 'ab-model', 'ab-model-step']]) {
      for (const state of ['default', 'noModel']) for (const w of LINES) { o.must(o.view('approvals', option, screen, 'web', state).text.includes(w), `${screen} ${state}: "${w}"`); o.must(o.view('approvals', option, step, 'iphone', state).text.includes(w), `${step} ${state}: "${w}"`); }
    }
    let m = null;
    try { m = view('models', 'a', 'a-decide', 'web', 'default').text; } catch (e) { m = null; }   // a partial page has no Models
    if (m) for (const w of LINES) must(m.includes(w), `admin Models binds a different line for the same hash: "${w}"`);
  },
  // Round 5, the last. The owner on R5-a1: "Draw the pause in Ready (Recommended)".
  'R5-a1': () => {
    const o = ownerPage();
    for (const [option, model, q] of [['a', 'aa-model', 'aa-queue'], ['b', 'ab-model', 'ab-home']]) for (const state of ['default', 'offline']) {
      const says = o.view('approvals', option, model, 'web', state).text.includes('Stays paused');
      o.must(says, `${model} ${state}: the scope card`);
      o.must(o.view('approvals', option, q, 'web', state).text.includes('Restart US tech, 12 months'), `${q} ${state}: the screen says "Stays paused" and its queue has no paused row`);
    }
    o.must(/\b4 decisions wait on you/.test(o.view('approvals', 'a', 'aa-queue', 'web', 'default').text), 'the paused row stays outside the count');
    for (const [option, screen] of [['a', 'aa-queue'], ['b', 'ab-notices']]) o.must(o.view('approvals', option, screen, 'web', 'default').text.includes('US tech, 12 months paused'), `${screen}: no paused notice`);
    o.must(o.view('approvals', 'a', 'aa-model', 'web', 'default').text.includes("R2-HGB v3's approval expired on US tech, 12 months"), 'the reason line');
    o.must(/stays paused[\s\S]*India midcap, 3 months stays on R1-LGB v1/.test(o.view('approvals', 'a', 'aa-result', 'web', 'default').text), 'the Ready outcome drops the two scopes');
    o.must(o.view('forecast', 'a', 'a-12m', 'web', 'default').text.includes('Last issue before the pause'), 'forecast: 12-month US tech is not labelled');
    o.must(o.view('home', 'a', 'a-12m', 'iphone', 'default').text.includes('US tech: last issue before the pause'), 'home: 12-month US tech is not labelled');
  },
  'R5-a2': ({ each, lacks, has }) => {
    each({ journey: 'approvals', state: 'expired' }, (v) => lacks(v.text, /Expired Mon 18:00/, 'an expiry later than the clock on the screen'));
    each({ journey: 'approvals', screen: 'aa-band', state: 'expired' }, (v) => has(v.text, /Expires Mon 18:00/));
  },
  'R5-a3': ({ each, view, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-import'], ['b', 'ab-import']]) each({ journey: 'approvals', option, screen, state: 'expired' }, (v) => { has(v.text, /It expired Tue 21:33 with no commit started\./); lacks(v.text, /expired at 21:33/); });
  },
  'R5-a4': ({ each, has, lacks }) => {
    for (const screen of ['ca-budget', 'cb-budget']) each({ journey: 'costs', screen, surface: 'web' }, (v, at) => {
      if (at.state === 'loading') return;
      const r = row(v.text, 'Against the month');
      if (['error', 'partial'].includes(at.state)) { has(r, /Not checked/); has(r, /A missing check is never a pass/); lacks(r, /Fits/); return; }
      const aws = v.text.match(/AWS [^£]*£[\d.]+ of £22 Forecast (£[\d.]+)/), cl = v.text.match(/Claude and evaluations [^£]*£[\d.]+ of £15 Forecast (£[\d.]+)|Claude and evaluations None yet of £15 Forecast (£[\d.]+)/);
      const a2 = aws ? aws[1] : (v.text.match(/of £22 Forecast (£[\d.]+)/) || [])[1], c2 = cl ? (cl[1] || cl[2]) : (v.text.match(/of £15 Forecast (£[\d.]+)/) || [])[1];
      has(r, new RegExp(`Forecast AWS ${String(a2).replace('.', '\\.')} and Claude ${String(c2).replace('.', '\\.')} stay`), `${at.state}: the row does not read the Allocations figures`);
    });
  },
  'R5-m1-a': ({ each, must, has, lacks }) => {
    for (const [option, screen] of [['a', 'aa-band'], ['b', 'ab-request']]) each({ journey: 'approvals', option, screen, state: 'expired', surface: WIDE }, (v) => {
      must(liveBtn(v.html, /Approve this band/).length === 1, 'A29 is shut here and live on a-bands');
      has(v.text, /Expired\. It did not apply\./); has(v.text, /Approve again for a new window/); has(v.text, /Expires Mon 18:00/); lacks(v.text, /An expired proposal cannot be approved/);
      if (option === 'a') has(v.text, /v10 · proposed/);
    });
  },
};
