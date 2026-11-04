// Lane a, MP-64 round 1: Approvals and configuration, Costs and budgets. Each check tests what the fix does on rendered screens, in the
// states and devices it applies to (lessons 2, 3, 11). Option B shares these parts, so a finding on both is walked on both.
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
      for (const re of [/Up to £15\.00/, /November/, /Payload hash/, /Expires/, /Month forecast/]) has(off.text, re);
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
      if (at.state !== 'loading') has(v.text, /This screen shows the cost month, day (18|1) of 30\. The Records chip is admin's own clock/);
    });
    has(view('costs', 'a', 'ca-lines', 'web', 'offline').text, /Offline · from 21:15/);
    for (const s of ['ca-held', 'ca-credit']) lacks(view('costs', 'a', s, 'web', 'error').text.replace(/Records failed 11:38 · last good 11:20/g, ''), /11:38|11:20/);
  },
  'R1-a16': ({ each, has }) => {
    each({ journey: 'costs', screen: 'ca-held', state: ['default', 'error', 'stale', 'offline'] }, (v) => { has(v.text, /Statement extraction/); has(v.text, /isa-oct-2026-scan\.pdf/); has(v.text, /imp_2b90/); });
  },
  // Round 2. Each holds the kind, not only the line.
  'R2-a1': ({ each, must }) => {
    each({ journey: 'costs', screen: 'ca-credit', state: ['offline', 'error'], surface: WIDE }, (v, at) => must(!liveBtn(v.html, /Withdraw paid use/).length, `A76 is live in ${at.state}`));
    each({ journey: 'costs', screen: 'cb-credit', state: ['offline', 'error'], surface: WIDE }, (v, at) => must(!liveBtn(v.html, /Withdraw paid use/).length, `A76 is live in ${at.state}`));
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
  'R2-a6': ({ each, view, has, lacks }) => {
    for (const [o, screen] of [['a', 'ca-credit'], ['b', 'cb-credit']]) {
      const e = view('costs', o, screen, 'web', 'error').text, st = view('costs', o, screen, 'web', 'stale').text;
      has(e, /AWS collector failed at 06:10/); lacks(e, /did not arrive/);
      has(st, /AWS billing is 39 hours old/); lacks(st, /older than one window/); has(st, /Proposed · MP40-Q6/);
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
};
