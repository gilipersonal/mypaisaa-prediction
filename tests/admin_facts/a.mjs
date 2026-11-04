// Lane a, MP-64 round 1: Approvals and configuration, Costs and budgets. Each check tests what the fix does on rendered screens, in the
// states and devices it applies to (lessons 2, 3, 11). Option B shares these parts, so a finding on both is walked on both.
const COSTS_LINES = ['ca-lines', 'cb-spikes'];
const WIDE = ['ipad', 'web'], PHONE = ['iphone', 'pwa'];
const liveBtn = (html, re) => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].filter(m => !/disabled/.test(m[1]) && re.test(m[2].replace(/<[^>]+>/g, ' ')));
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
      for (const re of [/Warn line/, /£60/, /£55/, /Budgets version/, /Against £100/, /£4\.73 past it/, /This approval is bound to/, /Payload hash/, /Budgets v1/, /Expires/, /A rollback makes v3 equal to v1/]) has(d.text, re);
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
};
