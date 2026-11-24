// MP-190: the owner's picks on the control screens (MP-184), proved on the rendered owner journeys.
// Each fact quotes the label the owner chose. The pages' labels for what stays open are checked, so a pick never reads as more than it settled.
// review/MP-190/mutate.mjs undoes each fix on a copy of the built page and expects the fact to fail.
import { readFileSync } from 'fs';
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const live = (html, label) => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].some((m) => !/\bdisabled\b/.test(m[1]) && m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() === label);
const flips = (html) => [...html.matchAll(/data-flip="([^"]+)"/g)].map((m) => m[1]);
const pounds = (t) => Number(t.replace(/[£,]/g, ''));
// the one sentence on every approval, word for word with admin Approvals (OWN-35)
export const BUDGET = 'A budget changes only when you change a line in Settings, or approve a raise code drafted with its cost and rollback, and it stays under £100.';
// the lines' sentences, word for word with admin Costs (OWN-35, OWN-36, OWN-25)
export const RAISE = 'When a line is close, code may draft a raise for your Approvals, with its cost and rollback. Only your yes, with a fresh sign-in, applies it, and it stays under £100.';
export const REDUCE = 'Code cuts backfills first, then challenger models, then Claude jobs, and says which step it reached.';
export const PAUSE = 'New optional paid work pauses, and each pause shows its reason. Daily forecasts carry on, inside the £15 kept above £85.';
const OLD_BUDGET = /grants no tool, source, budget or permission/;
// what the OPEN table says, read from the built page that draws it
const openRows = (page) => { const src = readFileSync(page, 'utf8'); const m = src.match(/const OPEN = \[([\s\S]*?)\n\];/); return m ? m[1] : ''; };
// narrowed in MP-192: an answered row moves from OPEN to SETTLED, "Settled by the owner", so the owner's answer is read from both tables together
const settledRows = (page) => { const src = readFileSync(page, 'utf8'); const m = src.match(/const SETTLED = \[([\s\S]*?)\n\];/); return m ? m[1] : ''; };

export default {
  // OWN-35, "Code may draft one" (not the Recommended option): a raise code drafted, with its cost and rollback, approved with a fresh sign-in, under £100.
  'MP190-own35': ({ each, view, has, lacks, must }) => {
    let n = 0;
    for (const [o, s, step] of [['a', 'aa-budget', 'aa-budget-step'], ['b', 'ab-budget', 'ab-budget-step']]) {
      each({ journey: 'approvals', option: o, screen: s, state: 'default' }, (v, at) => {
        const w = `${s} ${at.surface}`;
        for (const re of [/Raise the warning line/, /£60 to £65 · code drafted this · cost month, day 18 of 30/, /Code drafted/, /You decide/, /Cost a month £0/, /How to roll it back A new version/, /A rollback makes v4 equal to v2/, /The £100 ceiling, the £70 plan, the £30 reserve, £75, £85 and the £15 kept above £85 stay as they are/, /needs a fresh sign-in/, /Proposed · CT-13 How code sizes a raise is not recorded/]) has(v.text, re, `${w}: ${re}`);
        must(live(v.html, 'Approve') && live(v.html, 'Refuse'), `${w}: the decision is not live`);
        // the figures beside their inputs are computed from them (lesson 37): £65 clears the adverse month, £64.89, and the forecast sits £5.27 under it
        const fc = pounds(v.text.match(/forecast for the month is up to (£[\d.]+)/)[1]), adv = pounds(v.text.match(/the scan at its cap reach (£[\d.]+)/)[1]);
        must(fc === 59.73 && adv === 64.89, `${w}: the inputs moved: ${fc}, ${adv}`);
        must(Math.ceil(adv) === 65 && adv > 60, `${w}: £65 is not the first whole pound above the adverse month`);
        has(v.text, new RegExp(`£${(65 - fc).toFixed(2)} under it`), `${w}: the margin is not computed from the forecast`);
        has(v.text, new RegExp(`${Math.round((60 - fc) * 100)}p from the line`), `${w}: the distance to £60 is not computed`);
        n++;
      });
      // the inputs are the cost journey's own: the forecast on day 18 and the adverse month
      has(view('cost', 'a', 'cost-a-month', 'web', 'default').text, /Forecast up to £59\.73/, 'the cost journey no longer shows £59.73');
      has(view('cost', 'a', 'cost-a-fit', 'web', 'default').text, /reach £64\.89/, 'the cost journey no longer shows the adverse month');
      each({ journey: 'approvals', option: o, screen: step, state: 'default' }, (v, at) => {
        must(v.html.includes('aria-modal="true"'), `${step} ${at.surface}: no sheet`);
        for (const re of [/Approve with a fresh sign-in/, /Drafted by Code/, /Change £60 to £65/, /Current version Budgets v2/, /Expires Tomorrow, 18:00/]) has(v.text, re, `${step} ${at.surface}: ${re}`);
        must(live(v.html, 'Continue with passkey'), `${step} ${at.surface}: the step-up cannot be pressed`);
      });
      // a proposal never flips, in any state
      for (const sc of [s, step]) each({ journey: 'approvals', option: o, screen: sc }, (v, at) => must(!flips(v.html).length, `${sc} ${at.surface} ${at.state}: a flip on a proposal`));
      const note = view('approvals', o, s).note;
      has(note, /The owner picked "Code may draft one" \(OWN-35\), not the Recommended option/, `${s}: the note does not quote the pick`);
    }
    must(n === 8, `walked ${n} budget screens`);
    // the sentence every approval shows changed, wherever it appears, and only to the new one
    let banners = 0;
    each({ journey: 'approvals' }, (v, at) => {
      lacks(v.text, OLD_BUDGET, `${at.screen} ${at.surface} ${at.state}: the old no-budget sentence`);
      if (/Cannot widen authority\./.test(v.text)) { banners++; must(v.text.includes(BUDGET), `${at.screen} ${at.surface} ${at.state}: the banner drops the budget sentence`); }
    });
    must(banners > 50, `only ${banners} banners read`);
    // the lines pages say where a raise goes, word for word
    for (const [o, s] of [['a', 'cost-a-limits'], ['b', 'cost-b-limits']]) each({ journey: 'cost', option: o, screen: s, state: 'default' }, (v, at) => must(v.text.includes(RAISE), `${s} ${at.surface}: the raise rule is missing`));
  },

  // OWN-16, "An open session is enough": a revoke asks for no sign-in, on Approvals and on Holdings, in both options.
  'MP190-own16': ({ each, view, has, lacks, must }) => {
    for (const [j, o, s] of [['approvals', 'a', 'aa-revoke'], ['approvals', 'b', 'ab-revoke'], ['holdings', 'a', 'a-live'], ['holdings', 'b', 'b-live']]) {
      each({ journey: j, option: o, screen: s }, (v, at) => lacks(v.text, /Sign-in too old|Fresh sign-in needed/, `${s} ${at.surface} ${at.state}: a revoke behind a sign-in`));
      for (const surface of SURFACES) must(/OWN-16/.test(view(j, o, s, surface, 'abstention').na || ''), `${s} ${surface}: Abstaining still draws a step-up`);
      lacks(view(j, o, s).note, /Abstaining (is )?a step-up/, `${s}: the note still promises a step-up`);
    }
    for (const s of ['aa-revoke', 'ab-revoke']) each({ journey: 'approvals', screen: s, state: 'default' }, (v, at) => {
      has(v.text, /An open session is enough to revoke: it asks for no fresh sign-in, so the commit cannot start while you sign in/, `${s} ${at.surface}: the rule is not said`);
      must(live(v.html, 'Revoke this approval'), `${s} ${at.surface}: nothing to revoke with`);
    });
  },

  // OWN-39, "Anything that writes or widens": the acts that write or widen need a fresh sign-in by the owner's rule, so their CT-01 labels are gone.
  'MP190-own39': ({ each, has, lacks, must }) => {
    let feet = 0;
    each({ journey: 'approvals' }, (v, at) => {
      // a fresh sign-in an act needs is never labelled open now; a label may only sit on how recent it must be
      for (const m of v.text.matchAll(/(needs a fresh sign-in|a connection and a fresh sign-in|fresh sign-in Approved|with your fresh sign-in\.[^]*?Approved)( Proposed · CT-01)/g)) must(false, `${at.screen} ${at.surface} ${at.state}: "${m[0].slice(-60)}"`);
      if (/needs a fresh sign-in/.test(v.text)) feet++;
    });
    must(feet > 20, `only ${feet} feet read`);
    for (const [o, s] of [['a', 'privacy-a-renew'], ['b', 'privacy-b-renew']]) each({ journey: 'privacy', option: o, screen: s, state: 'default' }, (v, at) => { has(v.text, /asks for a fresh sign-in, because it changes a record/, `${s} ${at.surface}`); lacks(v.text, /Proposed · CT-01/, `${s} ${at.surface}: still labelled`); });
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-outside', state: 'default' }, (v, at) => { has(v.text, /turning one on asks for a fresh sign-in, because it widens what MP may do/, `privacy-b-outside ${at.surface}`); lacks(v.text, /Proposed · CT-01/, `privacy-b-outside ${at.surface}: still labelled`); });
  },

  // OWN-25, "Daily forecasts keep running", with the owner's "Yes, add them": daily forecasts run past £85, inside the £15 kept above it.
  'MP190-own25': ({ each, view, has, lacks, must }) => {
    for (const [o, s] of [['a', 'a-hzstates'], ['b', 'b-hzstates']]) each({ journey: 'forecast', option: o, screen: s, state: 'default' }, (v, at) => {
      has(v.text, /Cost paused Shown only where a forecast needs optional paid work, which pauses at the £85 line\. Daily forecasts carry on, inside the £15 kept above £85\./, `${s} ${at.surface}: the cost pause`);
      lacks(v.text, /The next run waits at the £85 line/, `${s} ${at.surface}: the old pause`);
    });
    let rows = 0;
    for (const [o, s] of [['a', 'cost-a-paused'], ['b', 'cost-b-paused']]) each({ journey: 'cost', option: o, screen: s, state: ['default', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'] }, (v, at) => {
      has(v.text, /Daily forecasts Carry on, inside the £15 kept above £85 Running/, `${s} ${at.surface} ${at.state}: daily forecasts are not shown running`);
      has(v.text, /Still working Sign-in Ledger reads Audit Recovery Daily forecasts/, `${s} ${at.surface} ${at.state}: still working`);
      rows++;
    });
    must(rows === 48, `walked ${rows} paused views`);
    for (const [o, s] of [['a', 'cost-a-limits'], ['b', 'cost-b-limits']]) each({ journey: 'cost', option: o, screen: s, state: 'default' }, (v, at) => {
      if (o === 'a') must(v.text.includes(PAUSE), `${s} ${at.surface}: the pause line`);
      has(v.text, /Never paused Sign-in Ledger reads Audit Recovery Daily forecasts These stay available at every threshold\. A £15 window above £85 is kept for them, daily forecasts included\./, `${s} ${at.surface}: the £15 window`);
    });
    has(view('cost', 'b', 'cost-b-limits', 'web', 'default').text, /£85 Pause Optional paid work pauses, with its reason\. Daily forecasts carry on/, 'the limits table');
  },

  // OWN-36, "Cut in a set order": backfills first, then challenger models, then Claude jobs, and code says which step it reached.
  'MP190-own36': ({ each, view, has, lacks, must }) => {
    for (const [o, s] of [['a', 'cost-a-reduced'], ['b', 'cost-b-reduced']]) each({ journey: 'cost', option: o, screen: s, state: ['default', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'] }, (v, at) => {
      const w = `${s} ${at.surface} ${at.state}`, t = v.text;
      const at1 = t.indexOf('Step 1 · Backfills'), at2 = t.indexOf('Step 2 · Challenger models'), at3 = t.indexOf('Step 3 · Claude jobs');
      must(at1 >= 0 && at1 < at2 && at2 < at3, `${w}: the steps are not in the owner's order`);
      has(t, /Step 1 · Backfills Cut first\. Each resumes from its step Cut/, `${w}: step 1 is not cut`);
      has(t, /Step 2 · Challenger models Next, if code cuts further\. Running in full until then Running/, `${w}: step 2`);
      has(t, /Code cuts in a set order and says which step it reached: step 1 of 3, backfills\./, `${w}: the step reached`);
      has(t, /Proposed · CT-13 How far each step cuts, and what moves code to the next, is not set\./, `${w}: how far is open`);
      lacks(t, /Fewer runs|Fewer scans/, `${w}: the old trim`);
    });
    for (const [o, s] of [['a', 'cost-a-limits'], ['a', 'cost-a-month']]) each({ journey: 'cost', option: o, screen: s, state: 'default' }, (v, at) => { if (s === 'cost-a-limits') must(v.text.includes(REDUCE), `${s} ${at.surface}: the reduce line`); lacks(v.text, /Fewer optional backfills/, `${s} ${at.surface}: the old reduce line`); });
    has(view('cost', 'b', 'cost-b-limits', 'web', 'default').text, /£75 Reduce Backfills first, then challengers, then Claude jobs/, 'the limits table');
    has(view('cost', 'a', 'cost-a-paused', 'web', 'default').text, /Reduced at £75 23 Nov · backfills cut first, step 1 of 3/, 'how the month got here');
  },

  // OWN-34, "Once in 24 hours", and MP40-Q11a, "Your lines, no investment wake-ups", on the risk alert.
  'MP190-own34-q11a': ({ each, has, lacks }) => {
    for (const [o, s] of [['a', 'ra-alert'], ['b', 'rb-alert']]) each({ journey: 'research', option: o, screen: s, state: ['default', 'loading', 'error', 'stale', 'offline', 'noModel', 'disagreement'] }, (v, at) => {
      const w = `${s} ${at.surface} ${at.state}`;
      has(v.text, /It pushes once in 24 hours for this holding, rule and severity, and sooner only if it worsens or the cause is new\. Every event stays in the app\./, `${w}: the cooldown`);
      lacks(v.text, /How long a cooldown runs is open/, `${w}: the old open cooldown`);
      if (!['loading'].includes(at.state)) {
        has(v.text, /Material means a line you set is crossed, on exposure, price move, volatility or an event flag\. Critical covers security and service faults only, so an investment alert waits for 07:30\. Each line still needs your value before build\. Proposed · CT-18/, `${w}: what material and critical mean`);
        has(v.text, /It is material, not critical, so it waited/, `${w}: why it waited`);
      }
    });
    each({ journey: 'research', screen: 'ra-alert' }, (v, at) => has(v.note, /"Your lines, no investment wake-ups" \(MP40-Q11a\)/, `ra-alert: the note does not quote the pick`));
  },

  // MP40-Q11b, "Weekdays only": no brief on Saturday or Sunday, Home says why, and held alerts land in the inbox at 07:30, labelled as the pick proposes.
  'MP190-q11b': ({ each, view, has, lacks, must }) => {
    const sat = new Date(Date.UTC(2026, 10, 7)), mon = new Date(Date.UTC(2026, 10, 9)), tue = new Date(Date.UTC(2026, 10, 3));
    must(sat.getUTCDay() === 6 && mon.getUTCDay() === 1 && tue.getUTCDay() === 2, 'the weekend dates are not a weekend after Tuesday 3 November');
    let drawn = 0;
    for (const [o, s, other] of [['a', 'a-weekend', 'b-weekend'], ['b', 'b-weekend', 'a-weekend']]) {
      each({ journey: 'home', option: o, screen: s, state: ['default', 'offline'] }, (v, at) => {
        const w = `${s} ${at.surface} ${at.state}`;
        has(v.text, o === 'a' ? /On Home, above the dock No brief today · Saturday Weekdays only: markets are shut/ : /On the ledger, after the holdings No brief today · Saturday Weekdays only\. The next is Monday, 07:30/, `${w}: Home does not say why`);
        has(v.text, /No brief today MP writes the brief on weekdays only\. Markets are shut on Saturday and Sunday, so a weekend brief would mostly repeat Friday\. The next is Monday 9 November, 07:30 London\./, `${w}: why`);
        has(v.text, /an alert held by quiet hours lands in your inbox at 07:30\. Every alert is in the inbox already\. Proposed · MP40-Q11/, `${w}: the held alerts, labelled`);
        lacks(v.text, /£90,155|£84,051|Tuesday 3 November/, `${w}: a figure from another day`);
        lacks(v.text, /HSBC late|HSBC stale/, `${w}: Tuesday's late HSBC price on a Saturday, when every price is Friday's close`);
        must(flips(v.html).includes(`home|${o === 'a' ? 'b' : 'a'}|${other}`), `${w}: no flip to ${other}`);
        drawn++;
      });
      for (const st of ['error', 'stale', 'noModel', 'disagreement', 'abstention']) must(view('home', o, s, 'web', st).na, `${s} ${st}: drawn with no reason, or not drawn`);
      has(view('home', o, s, 'web', 'empty').text, /Your first brief arrives on Monday 9 November, 07:30 London/, `${s}: Empty`);
      has(view('home', o, s).note, /The owner picked "Weekdays only" \(MP40-Q11b\)/, `${s}: the note does not quote the pick`);
    }
    must(drawn === 16, `walked ${drawn} weekend views`);
    for (const s of ['a-brief', 'b-brief']) lacks(view('home', s[0], s).note, /a weekend brief waits on MP40-Q11/, `${s}: still waits on MP40-Q11`);
    // the rule that held alerts arrive with the brief changes where it is stated
    each({ journey: 'research', option: 'a', screen: 'ra-alert', state: 'default' }, (v, at) => has(v.text, /There is no brief on Saturday or Sunday, so an alert held then lands in your inbox at 07:30\. Proposed · MP40-Q11/, `ra-alert ${at.surface}`));
    each({ journey: 'privacy', option: 'a', screen: 'privacy-a-centre', state: 'default' }, (v, at) => has(v.text, /Held notices arrive with the 07:30 brief on weekdays, and in your inbox at 07:30 at the weekend, when there is no brief \(MP40-Q11b\) Proposed · MP40-Q11/, `privacy-a-centre ${at.surface}`));
  },

  // The OPEN table no longer calls a settled question open, and each row quotes the label the owner chose.
  'MP190-open': ({ must }) => {
    const page = new URL('../../docs/design/journeys/index.html', import.meta.url).pathname, open = openRows(page), settled = settledRows(page), rows = `${open}\n${settled}`;
    must(open.length > 1000, 'the OPEN table was not found on the built page');
    must(settled.length > 1000, 'the SETTLED table was not found on the built page');
    for (const [q, want] of [
      ['Weekend brief \\(MP40-Q11\\)', /Settled, 5 Nov 2026 \("Weekdays only", MP40-Q11b\)/],
      ['Does revoking an approval need a fresh sign-in\\? \\(CT-01\\)', /Settled, 5 Nov 2026 \("An open session is enough", OWN-16\)/],
      ['How long a risk alert cools down \\(CT-18\\)', /Settled, 5 Nov 2026 \("Once in 24 hours", OWN-34\)/],
      ['May a budget be raised through an approval\\?', /Settled, 5 Nov 2026 \("Code may draft one", OWN-35, not the Recommended option\)/],
      ['Which runs does a Reduce line cut\\? \\(MP-103\\)', /Settled, 5 Nov 2026 \("Cut in a set order", OWN-36\)/],
      ['Revocation time \\(CT-17\\) and which acts need a fresh sign-in \\(CT-01\\)', /The acts are settled, 5 Nov 2026 \("Anything that writes or widens", OWN-39\)[^\]]*Open: how recent a sign-in must be, and the revocation time/],
      ['What no clear view, a cost pause and the technical mode show on a forecast \\(MP-145\\)', /The cost pause is settled, 5 Nov 2026 \("Daily forecasts keep running", OWN-25\)/],
      ['What counts as beating the rules, and how rules are scored \\(SCI-D03\\)', /"Use the best simple baseline", ADM-09/],
      ['Billing data and freshness \\(MP40-Q5, MP40-Q6\\)', /now also holds daily forecasts \(the owner, 5 Nov 2026: \\?"Yes, add them\\?"\)/]
    ]) must(new RegExp(`${q}[^\\n]*`).test(rows) && want.test(rows.match(new RegExp(`${q}[^\\n]*`))[0]), `the OPEN row "${q}" does not give the owner's answer`);
    must(!/'Not drawn\. The records conflict\.'|'No time is promised\.'\]|'Labelled proposed: fewer optional runs\.'/.test(rows), 'an OPEN row still reads open');
    // MP-192: a question the picks answer whole has left OPEN
    for (const q of ['Weekend brief \\(MP40-Q11\\)', 'Does revoking an approval need a fresh sign-in\\?', 'How long a risk alert cools down', 'May a budget be raised through an approval\\?', 'Which runs does a Reduce line cut\\?']) must(!new RegExp(q).test(open), `the answered row "${q}" is still in OPEN`);
  },
};
