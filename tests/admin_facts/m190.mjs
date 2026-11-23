// MP-190: the owner's picks on the admin control screens (MP-184), proved on the rendered admin page and the permission inventory.
// Each changed rule must read the same on owner and admin pages, so the word-for-word facts load the owner journeys page too.
// review/MP-190/mutate.mjs undoes each fix on a copy and expects these to fail.
import { readFileSync } from 'node:fs';
import { api, load } from '../../scripts/design_journeys_facts.mjs';
import { BUDGET, RAISE, REDUCE, PAUSE } from '../journey_facts/m190.mjs';
const ALL = ['iphone', 'ipad', 'web', 'pwa'];
const WIDE = ['ipad', 'web'];
const row = (perms, id) => perms.actions.find((a) => a.id === id);
const acts = (html) => [...html.matchAll(/<span class="aact" data-act="(A\d+)"[^>]*>([\s\S]*?)<\/span><\/span>|<span class="aact" data-act="(A\d+)"[^>]*>([\s\S]*?<\/button>)([\s\S]*?)<\/span>/g)];
const liveAct = (html, id) => new RegExp(`data-act="${id}"><button(?![^>]*disabled)`).test(html);
const drawn = (html, id) => html.includes(`data-act="${id}"`);
const OWNER = () => api(load(new URL('../../docs/design/journeys/index.html', import.meta.url).pathname));
const openRows = () => { const src = readFileSync(new URL('../../docs/design/admin/index.html', import.meta.url), 'utf8'); const m = src.match(/const OPEN = \[([\s\S]*?)\n\];/); return m ? m[1] : ''; };

export default {
  // ADM-23, "Code marks it": the Mark as mitigated control goes, and the timeline shows code marking it.
  'MP190-adm23': ({ each, view, has, lacks, must, perms }) => {
    each({ journey: 'incidents' }, (v, at) => { must(!drawn(v.html, 'A74'), `${at.screen} ${at.surface} ${at.state}: A74 is drawn`); lacks(v.text, /Mark as mitigated|who says so, is not recorded/, `${at.screen} ${at.surface} ${at.state}: the old control or its question`); });
    for (const [o, s] of [['a', 'a-detail'], ['b', 'b-escalate']]) {
      for (const k of ALL) has(view('incidents', o, s, k, 'default').text, /Code marks it mitigated when its checks show the fault has stopped\. You still acknowledge and resolve\./, `${s} ${k}: who marks it`);
      has(view('incidents', o, s, 'web', 'empty').text, o === 'a' ? /Mitigated Code · its next check found a newer HSBC price, so it marked this mitigated\./ : /Its next check found a newer HSBC price, so code marked it mitigated\./, `${s}: Empty does not show code marking it`);
    }
    const p = row(perms, 'A74');
    must(p.step_up === 'outside' && /"Code marks it" \(ADM-23\)/.test(p.step_up_note) && p.control !== 'named', 'A74 is still an owner act in the inventory');
  },

  // ADM-06, "No, keep it apart": a late price is a data quality incident; the +40 retry is the only automatic one.
  'MP190-adm06': ({ each, view, has, lacks, must }) => {
    // UK close 16:35, read off the evidence, plus 40 minutes, is the retry's time on every screen that names it
    const close = view('incidents', 'a', 'a-evidence', 'web', 'default').text.match(/Close (\d\d):(\d\d)/);
    must(close, 'the evidence no longer shows the UK close');
    const t = Number(close[1]) * 60 + Number(close[2]) + 40, retry = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    must(retry === '17:15', `the +40 retry would be ${retry}`);
    let seen = 0;
    for (const [o, s] of [['a', 'a-replay'], ['b', 'b-replay'], ['a', 'a-detail'], ['b', 'b-escalate']]) each({ journey: 'incidents', option: o, screen: s, state: ['default', 'empty', 'partial', 'stale', 'offline', 'expired', 'denied'] }, (v, at) => {
      lacks(v.text, /if a late price counts|Whether a late price counts|CT-14 allows|Drawn as if CT-14/, `${s} ${at.surface} ${at.state}: the open condition`);
      // every time stated for the +40 retry is the close plus 40 minutes, wherever it is said
      for (const m of v.text.matchAll(/\+40(?: retry)?, (?:at )?(\d\d:\d\d)/g)) { seen++; must(m[1] === retry, `${s} ${at.surface} ${at.state}: the +40 retry at ${m[1]}, not ${retry}`); }
    });
    must(seen > 40, `only ${seen} views name the retry`);
    for (const [o, s] of [['a', 'a-replay'], ['b', 'b-replay']]) has(view('incidents', o, s, 'web', 'default').text, /A late price is not a missed collection/, `${s}: the answer`);
    has(view('incidents', 'a', 'a-replay', 'web', 'default').text, /A late price is not a missed collection, so it is not re-run\./, 'the allowlist card');
  },

  // ADM-24, "Tie to month and release": overdue has a meaning, and no number of days.
  'MP190-adm24': ({ each, view, has, lacks }) => {
    for (const [o, s] of [['a', 'a-recovery'], ['b', 'b-restore'], ['b', 'b-runbook']]) each({ journey: 'incidents', option: o, screen: s, state: 'expired' }, (v, at) => {
      has(v.text, /overdue/, `${s} ${at.surface}: not overdue`);
      lacks(v.text, /counts as overdue is not set/, `${s} ${at.surface}: the old open threshold`);
      lacks(v.text, /exercise is overdue\.[^.]*\.\s*Proposed · CT-14/, `${s} ${at.surface}: the settled threshold is still labelled`);
      lacks(v.text, /\d+ days/, `${s} ${at.surface}: a number of days`);
    });
    for (const [o, s] of [['a', 'a-recovery'], ['b', 'b-restore']]) has(view('incidents', o, s, 'web', 'expired').text, /Overdue means a month ended with no exercise, or a change has none by the next release\./, `${s}: the meaning`);
  },

  // ADM-07, "Record it, keep the outputs": withdrawing S10 records what was sent, cannot recall it, and keeps Claude's text, labelled. On both options.
  'MP190-adm07': ({ each, has }) => {
    for (const [o, s] of [['a', 'aa-policies'], ['b', 'ab-new']]) each({ journey: 'approvals', option: o, screen: s, state: ['default', 'empty', 'partial', 'stale', 'conflict', 'expired', 'denied', 'offline'], surface: WIDE }, (v, at) => {
      const w = `${s} ${at.surface} ${at.state}`;
      has(v.text, /Yahoo values already sent to Claude\s*Recorded, not recalled\s*MP records what was sent and cannot recall it\. They stay wherever Anthropic holds them, for a time not verified\./, `${w}: what was sent`);
      has(v.text, /Claude text built on them\s*Stays, labelled/, `${w}: the outputs`);
      has(v.text, /and what had already been sent/, `${w}: the ending`);
    });
  },

  // ADM-08, "Code on trigger, or you": you can withdraw by hand with a fresh sign-in; code only on a trigger you approved, and none is listed.
  'MP190-adm08': ({ each, view, has, must, perms }) => {
    for (const [o, s] of [['a', 'a-rules'], ['b', 'b-rules']]) {
      for (const k of WIDE) {
        const v = view('models', o, s, k, 'default');
        must(liveAct(v.html, 'A83'), `${s} ${k}: no live withdraw`);
        has(v.text, /Withdraw Rules v5\s*Asks for a fresh sign-in/, `${s} ${k}: the withdraw does not ask for a fresh sign-in`);
        has(v.text, /Code does it by itself only on a trigger you approved in advance, and tells you\. No trigger is listed yet, so code withdraws nothing by itself today\./, `${s} ${k}: the trigger rule`);
      }
      for (const st of ['offline', 'stale']) must(drawn(view('models', o, s, 'web', st).html, 'A83') && !liveAct(view('models', o, s, 'web', st).html, 'A83'), `${s} ${st}: the withdraw is live`);
      for (const k of ['iphone', 'pwa']) must(/data-act="A83" data-phone-off/.test(view('models', o, s, k, 'default').html), `${s} ${k}: live on a phone`);
    }
    for (const o of ['a', 'b']) has(view('agents', o, `${o}-factors`, 'web', 'default').text, /you can withdraw an admitted one by hand with a fresh sign-in \(ADM-08\)/, `${o}-factors: the factor rule`);
    const a83 = row(perms, 'A83'), a84 = row(perms, 'A84');
    must(a83 && a83.step_up === 'yes' && /"Code on trigger, or you" \(ADM-08\)/.test(a83.step_up_note) && a83.journeys.includes('models'), 'A83 is not in the inventory as the owner picked it');
    must(a84 && a84.control === 'named' && a84.step_up === 'yes', 'A84, approving the triggers, is not named');
  },

  // ADM-09, "Use the best simple baseline": on a model trial, the baseline stands in for the rules, with your yes each time; a rules trial waits.
  'MP190-adm09': ({ each, view, has, lacks, must, perms }) => {
    for (const [o, s] of [['a', 'a-evidence'], ['a', 'a-decide'], ['b', 'b-scope']]) for (const k of WIDE) {
      const v = view('models', o, s, k, 'error');
      must(drawn(v.html, 'A78') && !liveAct(v.html, 'A78'), `${s} ${k}: A78 is missing, or live before the scores load`);
      has(v.text, /The strongest simple baseline stands in for them on each task, with your yes each time, once the scores load\./, `${s} ${k}: the owner's rule`);
      has(v.text, /Waits until the scores load\. Your yes covers one task at a time\./, `${s} ${k}: why it waits`);
    }
    for (const [o, s] of [['a', 'a-rules'], ['b', 'b-rules']]) each({ journey: 'models', option: o, screen: s }, (v, at) => {
      must(!drawn(v.html, 'A78'), `${s} ${at.surface} ${at.state}: A78 on a rules trial`);
      lacks(v.text, /No record lists the choices|waits for you\./, `${s} ${at.surface} ${at.state}: the old open decision`);
    });
    has(view('models', 'a', 'a-rules', 'web', 'error').text, /Neither side of a rules trial can be scored, so it waits until a mapping qualifies\./, 'the rules trial does not wait');
    const p = row(perms, 'A78');
    must(/"Use the best simple baseline" \(ADM-09\)/.test(p.step_up_note) && p.step_up === 'yes' && /best simple baseline/.test(p.action), 'A78 is not the owner\'s pick in the inventory');
  },

  // OWN-39, "Anything that writes or widens", and OWN-16, "An open session is enough": the inventory and every control follow them.
  'MP190-own39': ({ each, must, perms }) => {
    const open = perms.actions.filter((p) => p.step_up === 'open').map((p) => p.id);
    must(open.join() === 'A40' && /Put to the owner/.test(row(perms, 'A40').step_up_note), `open acts: ${open.join(', ')}`);
    for (const p of perms.actions) if (['yes', 'no'].includes(p.step_up) && /OWN-39/.test(p.step_up_note)) must(p.step_up === 'yes' ? /^Yes \(OWN-39/.test(p.step_up_note) : /^No \(OWN-39/.test(p.step_up_note), `${p.id}: the value and its note disagree`);
    must(perms.actions.filter((p) => /OWN-39/.test(p.step_up_note)).length >= 50, 'fewer rows than the 53 open acts name the owner\'s rule');
    const a09 = row(perms, 'A09');
    must(a09.step_up === 'no' && /"An open session is enough" \(OWN-16\)/.test(a09.step_up_note), 'A09 still asks for a sign-in');
    must(/"Anything that writes or widens" \(OWN-39\)/.test(perms.about), 'the inventory does not give the owner\'s answer');
    // on the page: a CT-01 label sits only on the act still open, and a stop asks for nothing
    let n = 0;
    each({ surface: WIDE, state: 'default' }, (v, at) => {
      // the guard act() draws right after a control's button: a fresh sign-in, a CT-01 label, or nothing
      for (const m of v.html.matchAll(/<span class="aact" data-act="(A\d+)"><button[^>]*>[\s\S]*?<\/button>(<span class="small">Asks for a fresh sign-in<\/span>|<span class="chip proposed"><span class="dot"><\/span>Proposed · CT-01<\/span>)?<\/span>/g)) {
        n++;
        const guard = m[2] || '';
        if (/Proposed · CT-01/.test(guard)) must(m[1] === 'A40', `${at.journey}.${at.screen} ${at.surface}: ${m[1]} is labelled CT-01`);
        if (['A09', 'A06', 'A43', 'A50', 'A76', 'A51', 'A60', 'A26'].includes(m[1])) must(!/Asks for a fresh sign-in/.test(guard), `${at.journey}.${at.screen}: ${m[1]} stops, and asks for a sign-in`);
        if (['A62', 'A25', 'A31', 'A08'].includes(m[1])) must(/Asks for a fresh sign-in/.test(guard), `${at.journey}.${at.screen}: ${m[1]} writes, and asks for no sign-in`);
      }
    });
    must(n > 100, `only ${n} controls read`);
  },

  // The rules MP-190 changes read the same on owner and admin pages (Jira acceptance; lesson 7).
  'MP190-words': ({ each, view, must, has }) => {
    const owner = OWNER();
    let banners = 0;
    each({ journey: 'approvals' }, (v, at) => { if (/Cannot widen authority\./.test(v.text)) { banners++; must(v.text.includes(BUDGET), `admin ${at.screen} ${at.surface} ${at.state}: the budget sentence differs`); } must(!/grants no tool, source, budget or permission/.test(v.text), `admin ${at.screen}: the old sentence`); });
    must(banners > 20, `only ${banners} admin banners read`);
    for (const [o, s] of [['a', 'ca-budget'], ['b', 'cb-budget']]) for (const k of WIDE) {
      const t = view('costs', o, s, k, 'default').text;
      for (const [name, x] of [['raise', RAISE], ['reduce', REDUCE], ['pause', PAUSE]]) must(t.includes(x), `${s} ${k}: the ${name} sentence differs from the owner journeys`);
      has(t, /Never paused\s*Sign-in\s*Ledger reads\s*Audit\s*Recovery\s*Daily forecasts\s*These stay available at every threshold\. A £15 window above £85 is kept for them, daily forecasts included\./, `${s} ${k}: the £15 window`);
    }
    const ownerLimits = owner.view('cost', 'a', 'cost-a-limits', 'web', 'default').text;
    for (const x of [RAISE, REDUCE, PAUSE]) must(ownerLimits.includes(x), `the owner journeys lost "${x.slice(0, 40)}"`);
    must(owner.view('approvals', 'a', 'aa-budget', 'web', 'default').text.includes(BUDGET), 'the owner budget raise lost the budget sentence');
    has(view('incidents', 'a', 'a-pause', 'web', 'default').text, /Sign-in, ledger reads, audit, recovery and daily forecasts stay available at every cost threshold\./, 'incidents: what keeps running');
    // a budget the owner raises in the queue is the one admin works as its example: v2 to v3, the warning line, and £55 is Budgets v3
    has(view('costs', 'a', 'ca-change', 'web', 'empty').text, /Applied\. The warning line is £55\.[\s\S]*Budgets v3 keeps v2/, 'admin no longer applies £55 as Budgets v3');
    must(/You moved the warning line to £55 in Settings, as Budgets v3, so this raise against v2 is refused/.test(owner.view('approvals', 'a', 'aa-budget', 'web', 'disagreement').text), 'the owner raise does not meet admin\'s £55 on v3');
  },

  // MP40-Q11a, MP40-Q11b and OWN-34 on the alert policy, and what counts as material in Incidents.
  'MP190-alerts': ({ each, view, has, lacks }) => {
    for (const [o, s] of [['a', 'aa-policies'], ['b', 'ab-new']]) each({ journey: 'approvals', option: o, screen: s, state: ['default', 'empty', 'stale', 'offline'], surface: WIDE }, (v, at) => {
      const w = `${s} ${at.surface} ${at.state}`;
      has(v.text, /Material\s*A line you set, crossed: exposure, price move, volatility or an event flag\s*Critical\s*Security and service faults only/, `${w}: material and critical`);
      has(v.text, /Held alerts arrive\s*With the 07:30 brief on weekdays\. In your inbox at 07:30 at the weekend/, `${w}: the weekend`);
      has(v.text, /Repeat push\s*Once in 24 hours per holding, rule and severity, sooner if it worsens or the cause is new/, `${w}: the cooldown`);
      has(v.text, /You picked "Your lines, no investment wake-ups"[\s\S]*"Once in 24 hours"[\s\S]*Each line still needs a value from you, and no record sets one yet, so nothing is here to approve\.[\s\S]*proposed in "Weekdays only" itself/, `${w}: the picks and what stays open`);
      lacks(v.text, /No record sets their values yet/, `${w}: the old reading`);
    });
    has(view('incidents', 'a', 'a-list', 'web', 'default').text, /Material means a line you set is crossed, and each line's value is still yours to set\. Proposed · CT-18/, 'incidents: material');
  },

  // The admin OPEN table gives the owner's answers, in the owner's words.
  'MP190-open': ({ must }) => {
    const rows = openRows();
    must(rows.length > 1000, 'the OPEN table was not found');
    for (const [q, want] of [
      ['Is a late price a missed collection', /Settled, 5 Nov 2026 \("No, keep it apart", ADM-06\)/],
      ['What happens to Yahoo values already sent to Anthropic', /Settled, 5 Nov 2026 \("Record it, keep the outputs", ADM-07\)/],
      ['Who withdraws a factor or a rules version', /Settled, 5 Nov 2026 \("Code on trigger, or you", ADM-08\)/],
      ['What does an owner decide when no rules mapping qualifies', /Settled, 5 Nov 2026 \("Use the best simple baseline", ADM-09\)/],
      ['Who marks an incident mitigated', /Settled, 5 Nov 2026 \("Code marks it", ADM-23\)/],
      ['Does an overdue exercise have a threshold', /Settled, 5 Nov 2026 \("Tie to month and release", ADM-24\)/]
    ]) { const line = (rows.match(new RegExp(`${q}[^\\n]*`)) || [''])[0]; must(want.test(line), `the OPEN row "${q}" does not give the owner's answer`); }
  },
};
