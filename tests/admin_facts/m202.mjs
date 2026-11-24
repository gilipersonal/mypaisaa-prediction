// MP-202: the owner's act to record production lost, drawn on Prism Admin. The owner picked "Code flags, you confirm" (ADM-05,
// 5 Nov 2026), whose option read: "Code opens the incident when production stops answering its checks, and you record it lost
// with a fresh sign-in." What counts as lost, and where the record is kept if MP is down, stay open (CT-14).
// --page PATH reads another build, so a proof can undo the fix on a copy.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const page = () => { const i = process.argv.indexOf('--page'); return i >= 0 ? resolve(process.argv[i + 1]) : resolve(ROOT, 'docs/design/admin/index.html'); };
const ALL = ['iphone', 'ipad', 'web', 'pwa'], PHONES = ['iphone', 'pwa'], BIG = ['ipad', 'web'];
const STATES = ['default', 'loading', 'empty', 'partial', 'error', 'stale', 'offline', 'conflict', 'expired', 'denied'];
const SHEETS = [['a', 'a-lost', 'a-detail', 'a-recovery'], ['b', 'b-lost', 'b-escalate', 'b-restore']];
const PICK = /Code opens the incident when production stops answering its checks, and you record it lost with a fresh sign-in\./;
const OPEN = /What counts as lost is not defined yet, and where this record is kept if MP is down is not specified\./;
const PAST = /This records what has already happened to production\. It restores nothing and moves no authority\./;
// where the act can happen, and the words the control carries there
const CAN = { default: 'Record production lost', partial: 'Record production lost', error: 'Try again' };
// where it cannot, the reason the sheet gives instead (lesson 41)
const WHY = {
  loading: /Waiting for your fresh sign-in Nothing is recorded yet\./,
  empty: /Nothing to record Production answers its checks, so code has opened no incident for it, and there is nothing to record lost\./,
  stale: /Refresh first This is from 11:12\. Production may have answered since, or inc_0014 may already be recorded, so nothing can be recorded from it\./,
  offline: /You are offline A fresh sign-in has to reach the server, so nothing can be recorded offline\./,
  conflict: /Already recorded You recorded inc_0014 lost at 11:31, on iPad, while this was open\. There is nothing left to record, and the switch waits in Recovery\./,
  expired: /Your fresh sign-in ran out Nothing was recorded, and inc_0014 stays as it was\. Start again\./,
  denied: /A fresh sign-in is needed/,
};
const anyAct = (html, id) => new RegExp(`data-act="${id}"`).test(html);
const live = (html, id) => new RegExp(`data-act="${id}"(?! data-phone-off)`).test(html);
const liveWith = (html, id, label) => [...html.matchAll(new RegExp(`<span class="aact" data-act="${id}"><button[^>]*>([\\s\\S]*?)</button>([\\s\\S]*?)</span>`, 'g'))].some((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() === label && /Asks for a fresh sign-in/.test(m[2]));
const table = (name) => { const m = readFileSync(page(), 'utf8').match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\];`)); if (!m) throw new Error(`no ${name} table on the page`); return m[1]; };

export default {
  // the inventory lists the act as the pick says: a fresh sign-in, off on a phone, in incidents, and the audit names its record
  'MP202-a85-inventory': ({ must, has, perms }) => {
    const a = perms.actions.find((p) => p.id === 'A85');
    must(a, 'A85 is not in permissions.json');
    must(a.action === 'Record production lost', `A85 reads "${a.action}"`);
    must(a.step_up === 'yes', `A85 asks for a fresh sign-in: ${a.step_up}`);
    must(a.phone === 'off', `A85 on a phone is ${a.phone}, and phones read and acknowledge only`);
    must(a.journeys.join() === 'incidents', `A85 lists ${a.journeys}`);
    must(!a.control, 'A85 is marked named, and the act is drawn');
    has(a.step_up_note, /"Code flags, you confirm" \(ADM-05\)/); has(a.step_up_note, PICK); has(a.step_up_note, /CT-14/); has(a.step_up_note, /the switch is A42/);
    has(a.audit, /^IncidentRecord state and AuditEvidence/); has(a.audit, /CT-14/);
    has(a.source, /ADM-05/);
    has(perms.about, /"Code flags, you confirm" \(ADM-05\)[\s\S]*\(A85, MP-202\)/);
  },

  // the sheet: the act where it can happen, a reason where it cannot, the whole path, and the past-act sentence in every state
  'MP202-record-sheet': ({ view, each, must, has, lacks }) => {
    for (const [o, s] of SHEETS) for (const kind of ALL) for (const st of STATES) {
      const v = view('incidents', o, s, kind, st), at = `${s} ${kind} ${st}`;
      must(/role="dialog"/.test(v.html), `${at}: no sheet`);
      has(v.text, PAST, `${at}: the sheet does not say it records a past act (lesson 33)`);
      if (st !== 'empty') { has(v.text, PICK, `${at}: the pick's words are missing`); has(v.text, OPEN, `${at}: what stays open is not said`); has(v.text, /Settled · ADM-05[\s\S]*Proposed · CT-14/, `${at}: unlabelled`); }
      if (PHONES.includes(kind)) {
        must(!live(v.html, 'A85'), `${at}: recording production lost is live on a phone`);
        if (CAN[st]) has(v.text, new RegExp(`${CAN[st]}: on iPad or desktop`), `${at}: the phone does not say where it happens`);
      }
      if (BIG.includes(kind) && CAN[st]) must(liveWith(v.html, 'A85', CAN[st]), `${at}: no live "${CAN[st]}" asking for a fresh sign-in`);
      if (!CAN[st]) { must(!anyAct(v.html, 'A85'), `${at}: the act is drawn where it cannot happen`); has(v.text.replace(PAST, ' ').replace(/\s+/g, ' '), WHY[st], `${at}: no reason why not`); }
    }
    // the whole path, on the sheet where it can happen (lesson 45): what changes, the bound version, what it keeps, what follows, how it goes back
    for (const [o, s] of SHEETS) for (const st of ['default', 'partial', 'error']) {
      const t = view('incidents', o, s, 'web', st).text;
      for (const re of [/Bound to inc_0014 at revision 3, as you read it/, /Changes inc_0014 reads Production recorded lost, with you and the time/, /Keeps Authority, the ledger and every record as they are/,
        /Then Recovery offers the switch to a reconciled copy, for its own approval/, /Taking it back Not settled\. A record is never edited, and whether a later record can say production answers again is open/,
        /Kept in The incident and the audit\. Its audit class is open/, /Proposed · CT-03/]) has(t, re, `${s} ${st}: the path lacks ${re}`);
      if (st === 'partial') has(t, /What code saw Not read\. The check record did not answer/);
      else has(t, /What code saw Production stopped answering its checks at 10:58, and none has answered since/);
    }
    // the act is drawn only on its sheet, never on another screen of the journey or the page
    each({}, (v, at) => { if (!['a-lost', 'b-lost'].includes(at.screen)) must(!anyAct(v.html, 'A85'), `A85 drawn on ${at.journey}.${at.screen} ${at.surface} ${at.state}`); });
    // no value is invented for what the pick leaves open
    each({ journey: 'incidents' }, (v, at) => lacks(v.text, /counts as lost (when|after|if)|lost after \d|record is kept (in|on|at) (?!.*not specified)/i, `${at.screen} ${at.state}: a value for what CT-14 leaves open`));
  },

  // the moment after: Conflicting shows the act done, in order, by you, on the incident and in Recovery, and the switch is next
  'MP202-record-path': ({ view, each, must, has, lacks }) => {
    for (const [o, , detail, rec] of SHEETS) {
      for (const kind of ALL) {
        const t = view('incidents', o, detail, kind, 'conflict').text, at = `${detail} ${kind}`;
        has(t, /Detected\s*Code opened it · Wed 10:58, when production stopped answering its checks\.|Code opens one incident\s*Code\s*inc_0014 · Wed 10:58, when production stopped answering its checks\./, `${at}: detection`);
        // in this order, each once: detected, acknowledged, recorded lost, switch, resolve
        const i14 = t.slice(t.indexOf('inc_0014'));
        const idx = [/Wed 10:58/, /You · Wed 11:05/, /Recorded lost|Record production lost/, /Switch in Recovery/, /Resolve/].map((re) => i14.search(re));
        must(idx.every((x) => x >= 0) && idx.every((x, k) => !k || x > idx[k - 1]), `${at}: the steps are out of order: ${idx}`);
        has(t, /You · Wed 11:31 · on iPad, with a fresh sign-in\. This records what has already happened to production\. It restores nothing and moves no authority\./, `${at}: who recorded it, and how`);
        has(t, PICK, at); has(t, OPEN, at);
        lacks(t, /inc_0014 waits for you to acknowledge it|step 2 of 4, Acknowledge/, `${at}: inc_0014 still waits on an acknowledge it already had`);
        must(!anyAct(view('incidents', o, detail, kind, 'conflict').html, 'A85'), `${at}: a record control after the record`);
      }
      for (const kind of BIG) {
        const r = view('incidents', o, rec, kind, 'conflict');
        has(r.text, /Production recorded lost Recorded by you Incident inc_0014 Opened by Code · Wed 10:58, when production stopped answering its checks Recorded by You · Wed 11:31 · on iPad, with a fresh sign-in/, `${rec} ${kind}`);
        must(live(r.html, 'A42'), `${rec} ${kind}: the switch is not next`);
      }
      // everywhere else Recovery says why nothing is recorded, with the pick and what stays open
      for (const st of STATES.filter((x) => x !== 'conflict')) for (const kind of ALL) {
        const t = view('incidents', o, rec, kind, st).text;
        if (st === 'loading') continue;
        has(t, new RegExp(`Production recorded lost ${({ stale: 'Held\\. This is from 11:12', offline: 'No financial write offline' })[st] || 'Production answers its checks, so no incident asks you to record it lost\\.'}`), `${rec} ${kind} ${st}: no reason`);
        has(t, PICK, `${rec} ${kind} ${st}`); has(t, OPEN, `${rec} ${kind} ${st}`);
      }
    }
    for (const kind of ALL) has(view('home', 'b', 'b-home', kind, 'conflict').text, /Production is recorded lost\. You recorded it at 11:31, and the switch waits in Recovery\./);
  },

  // the settled row names the act and what it leaves open (CT-14); the question itself is wholly answered, so it has no OPEN row
  'MP202-tables': ({ must }) => {
    const settled = table('SETTLED'), open = table('OPEN');
    must(/\("Code flags, you confirm", ADM-05\)[^\n]*That is A85, Record production lost, on iPad or desktop \(MP-202\)\. Open: what counts as lost, and where the record is kept if MP is down \(CT-14\)\./.test(settled), 'the ADM-05 row does not name A85 and what stays open');
    must(!/not yet an act in the inventory/.test(settled + open), 'a row still says the act is missing');
    must(!/How does production come to be recorded lost/.test(open), 'the answered ADM-05 question is still in OPEN');
  },
};
