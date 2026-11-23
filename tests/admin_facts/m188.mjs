// MP-188: the owner's five passkey and recovery picks (MP-184), proved on the rendered Identity screens, and Identity read
// against Privacy on the journeys page so the two tell one story.
//   ADM-04 "Allowed in the browser": "The bar covers the Apple app only, so Phone web may enrol a passkey once a test proves it works."
//   ADM-15 "Finish in the phone browser": "You enrol the replacement passkey in the phone's browser, if you allow browser passkeys."
//   ADM-13 "Redraw Privacy now": "Privacy shows today's truth: two usable paths, the replacement on the Mac, and the iPhone row waiting on the purchase."
//   ADM-02 "Revoke removes it too": "Revoking a device also removes any passkey held on it, and your path count drops by one."
//   ADM-03 "Any healthy path": "A fresh sign-in on any healthy path, passkey or Google, can revoke, and Privacy's button changes to match."
// The browser passkey and the removal are unverified until MP-197, and the one-path fallback is drawn beside them.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, load } from '../../scripts/design_journeys_facts.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const page = () => { const i = process.argv.indexOf('--page'); return i >= 0 ? resolve(process.argv[i + 1]) : resolve(ROOT, 'docs/design/admin/index.html'); };
// the journeys page, or a copy named with --journeys, so a proof can undo Privacy's side alone
const journeys = () => { const i = process.argv.indexOf('--journeys'); return i >= 0 ? resolve(process.argv[i + 1]) : resolve(ROOT, 'docs/design/journeys/index.html'); };
const ALL = ['iphone', 'ipad', 'web', 'pwa'], PHONES = ['iphone', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'partial', 'error', 'stale', 'offline', 'conflict', 'expired', 'denied'];
const LOST = [['a', 'a-lost'], ['b', 'b-lost']];
const UNV = /Unverified · MP-197/;
const RV = /Revoking also removes any passkey held on that device\. Where it held one, your path count drops by one\. Whether Cognito can remove it, and whether a synced copy ends too, is not tested yet\./;
const BROWSER = { iphone: "this phone's browser", ipad: "your phone's browser" };
const live = (html, id) => new RegExp(`data-act="${id}"(?! data-phone-off)`).test(html);
// the live control for an act, with its words
const liveWith = (html, id, label) => [...html.matchAll(new RegExp(`<span class="aact" data-act="${id}">([\\s\\S]*?)</span>`, 'g'))].some((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().startsWith(label));
const between = (t, a, b) => { const i = t.indexOf(a); if (i < 0) return ''; const j = t.indexOf(b, i + a.length); return t.slice(i, j < 0 ? undefined : j); };
const source = () => readFileSync(page(), 'utf8');

export default {
  // ADM-04: Phone web enrols in its browser, labelled unverified; the iPhone app never draws enrolling live; the inventory says so
  'MP188-adm04-identity': ({ view, each, must, has, lacks, perms }) => {
    const a48 = perms.actions.find((p) => p.id === 'A48');
    must(a48.phone === 'browser', `A48 is ${a48.phone} on a phone, not browser`);
    has(a48.phone_note, /Allowed in the browser/); has(a48.phone_note, /MP-197/);
    each({ journey: 'identity', surface: 'iphone' }, (v, at) => must(!live(v.html, 'A48'), `A48 is live in the iPhone app at ${at.option}.${at.screen} ${at.state}`));
    for (const [o, s] of [['a', 'a-enrol'], ['b', 'b-add']]) {
      const d = view('identity', o, s, 'pwa', 'default');
      must(liveWith(d.html, 'A48', 'Enrol a passkey in this browser'), `${s} pwa: no live enrol in the browser`);
      has(d.text, /The bar covers the Apple app only\. This rests on a test that has not run: if it fails, the bar stands and this control goes\./, `${s} pwa`);
      has(d.text, UNV, `${s} pwa: unlabelled`);
      for (const st of ['offline', 'stale', 'denied']) must(!live(view('identity', o, s, 'pwa', st).html, 'A48'), `${s} pwa ${st}: enrol is live when it cannot run`);
      for (const kind of ['iphone', 'ipad']) {
        const t = view('identity', o, s, kind, 'default').text;
        has(t, new RegExp(`MP-164 bars on-device passkeys until the Developer Program is bought \\(MP-179\\)[\\s\\S]*A passkey in ${BROWSER[kind]} counts\\.`), `${s} ${kind}`);
        has(t, UNV, `${s} ${kind}: unlabelled`);
      }
    }
    // the iPhone app says where enrolling happens, not "on iPad or desktop"
    has(view('identity', 'a', 'a-lost', 'iphone', 'default').text, /Enrol the replacement on your Mac, or in this phone's browser\./);
    has(source(), /Settled, 5 Nov 2026 \("Allowed in the browser", ADM-04\)/);
  },

  // ADM-15: with the Mac lost, a phone ends in a browser on two paths; the one-path fallback stands beside it until MP-197 runs
  'MP188-adm15-identity': ({ view, must, has, lacks }) => {
    for (const [o, s] of LOST) {
      const p = view('identity', o, s, 'pwa', 'empty');
      must(liveWith(p.html, 'A48', 'Enrol in this browser'), `${s} pwa empty: no live enrol`);   // the step's title names the replacement passkey
      // the fallback stands in the last step itself, not only in the rail
      for (const kind of ['iphone', 'ipad', 'pwa']) has(view('identity', o, s, kind, 'empty').text, /If the browser test fails, recovery ends after the revoke on one path, Google, and MP warns you until you reach a Mac\./, `${s} ${kind} empty: the step has no fallback`);
      has(p.text, /In this browser, once the lost devices are revoked\. You end on two paths: Google and this passkey\./, `${s} pwa empty`);
      for (const kind of ['iphone', 'ipad']) {
        const e = view('identity', o, s, kind, 'empty');
        must(!live(e.html, 'A48'), `${s} ${kind} empty: enrol is live in an app`);
        has(e.text, new RegExp(`Finish in a phone's browser This app cannot hold a passkey until the Developer Program is bought \\(MP-179\\)\\. Open MyPrediction in ${BROWSER[kind]} and enrol the replacement there, so you end on two paths\\.`), `${s} ${kind} empty`);
      }
      for (const kind of ['iphone', 'ipad', 'pwa']) for (const st of ['default', 'empty', 'partial', 'error', 'stale']) {
        const t = view('identity', o, s, kind, st).text, at = `${s} ${kind} ${st}`;
        // the fallback, drawn: Google as the last path, warned
        has(t, /If the browser test fails Unverified · MP-197 Google The one path left after the revoke Last path/, `${at}: no fallback`);
        has(t, /recovery ends on one path and MP warns you until you reach a Mac/, `${at}: no fallback`);
        lacks(t, /No record says how recovery ends/, at);
        if (st !== 'empty') { has(t, /If your Mac is the lost device[\s\S]*back on two paths/, `${at}: the Mac card does not say how it ends`); }
      }
      for (const st of ['default', 'empty']) lacks(view('identity', o, s, 'web', st).text, /If the browser test fails/, `${s} web ${st}: the Mac is in your hand`);
      lacks(view('identity', o, s, 'pwa', 'loading').text, /If the browser test fails/, `${s} pwa loading`);
    }
    has(source(), /Settled, 5 Nov 2026 \("Finish in the phone browser", ADM-15\)/);
  },

  // ADM-02: the note beside each revoke is replaced by what the owner picked, and says what is not yet tested
  'MP188-adm02-identity': ({ view, each, must, has, lacks }) => {
    let revokes = 0;
    each({ journey: 'identity' }, (v, at) => {
      lacks(v.text, /What a revoke does to a passkey held on that device is not recorded/, `${at.screen} ${at.surface} ${at.state}`);
      if (live(v.html, 'A49')) { revokes++; has(v.text, RV, `${at.screen} ${at.surface} ${at.state}: a revoke without the rule`); has(v.text, UNV, `${at.screen} ${at.surface} ${at.state}: unlabelled`); }
    });
    must(revokes >= 70, `only ${revokes} views revoke`);   // 76 when written: every identity view with a live A49
    for (const kind of ALL) has(view('identity', 'b', 'b-revoke', kind, 'default').text, /Removes\s*Any passkey held on it/, `b-revoke ${kind}`);
    has(view('identity', 'a', 'a-lost', 'ipad', 'default').text, /Revoking removes that passkey too, so you drop to one path, Google\./);
    has(source(), /Settled, 5 Nov 2026 \("Revoke removes it too", ADM-02\)/);
  },

  // ADM-03: any healthy path, passkey or Google, signs in to revoke, on every screen that revokes
  'MP188-adm03-identity': ({ view, each, has, lacks }) => {
    for (const [o, s] of LOST) for (const kind of ALL) has(view('identity', o, s, kind, 'default').text, /Sign in from another path A fresh sign-in on any healthy path, passkey or Google\./, `${s} ${kind}`);
    for (const kind of ALL) {
      has(view('identity', 'b', 'b-revoke', kind, 'default').text, /Sign in with\s*Any healthy path, passkey or Google/, `b-revoke ${kind}`);
      has(view('identity', 'a', 'a-devices', kind, 'default').text, /Revoking A fresh sign-in on any healthy path, passkey or Google\./, `a-devices ${kind}`);
      has(view('identity', 'b', 'b-device', kind, 'default').text, /Revoke this device A fresh sign-in on any healthy path, passkey or Google\./, `b-device ${kind}`);
    }
    each({ journey: 'identity' }, (v, at) => lacks(v.text, /A fresh sign-in with Passkey, Mac or Google/, `${at.screen} ${at.surface} ${at.state}`));
    has(source(), /Settled, 5 Nov 2026 \("Any healthy path", ADM-03\)/);
  },

  // ADM-13: Identity no longer copies Privacy's iPhone passkey: the iPhone signs in with Google, and its passkey row waits on the purchase
  'MP188-adm13-identity': ({ view, each, has, lacks, must }) => {
    each({ journey: 'identity' }, (v, at) => {
      const where = `${at.screen} ${at.surface} ${at.state}`;
      lacks(`${v.text} ${v.note}`, /iPhone Active 40 min ago · Passkey|Not settled · MP-179|Shown as the Privacy journey shows it|copied from the Privacy journey|Privacy says a replacement lands on the new device/, where);
      if (/Passkey, iPhone/.test(v.text)) { const row = between(v.text, 'Passkey, iPhone', 'Passkey, Mac'); must(/Waiting on MP-179/.test(row) && !/Healthy|Last used/.test(row), `${where}: the iPhone passkey row reads as a path`); }
    });
    for (const kind of ['ipad']) has(view('identity', 'b', 'b-device', kind, 'default').text, /Signed in with\s*Google, in the system browser/);
    has(view('identity', 'a', 'a-paths', 'web', 'default').text, /Passkey, iPhone Cannot be set up yet Waits on the purchase\./);
    has(source(), /Settled, 5 Nov 2026 \("Redraw Privacy now", ADM-13\)/);
  },

  // Privacy and Identity tell one story: the same paths, the same devices, the same revoke rule, the same last path
  'MP188-one-story': ({ view, must, has }) => {
    const p = api(load(journeys()));
    for (const surface of ALL) {
      const pv = p.view('privacy', 'a', 'privacy-a-devices', surface, 'default'), pb = p.view('privacy', 'b', 'privacy-b-devices', surface, 'default');
      const i = view('identity', 'a', 'a-paths', surface, 'default'), d = view('identity', 'a', 'a-devices', surface, 'default');
      for (const [t, who] of [[pv.text, 'Privacy A'], [pb.text, 'Privacy B'], [i.text, 'Identity']]) {
        const iphone = between(t, 'Passkey, iPhone', 'Passkey, Mac');
        must(/Waiting on MP-179/.test(iphone) && !/Healthy/.test(iphone), `${who} ${surface}: the iPhone passkey row`);
        // read from the iPhone row on: Identity's count card names "Passkey, Mac and Google" before the rows
        has(between(t.slice(t.indexOf('Passkey, iPhone')), 'Passkey, Mac', 'Google'), /Healthy/, `${who} ${surface}: the Mac passkey`);
      }
      has(pv.text, /2 usable · 1 waiting/, `Privacy ${surface}: the count`);
      has(i.text, /2 usable, 1 waiting on MP-179/, `Identity ${surface}: the count`);
      const mine = { iphone: 'iPhone', ipad: 'iPad', web: 'Mac, Safari', pwa: 'Phone web' }[surface];
      for (const [name, line] of [['iPhone', 'Active 40 min ago · Google'], ['iPad', 'Active 2 h ago · Google'], ['Mac, Safari', 'Active yesterday · Passkey'], ['Phone web', 'Active 3 days ago · Google']]) {
        if (name === mine) continue;
        must(pv.text.includes(`${name} ${line}`) && d.text.includes(`${name} ${line}`), `${surface}: ${name} does not read "${line}" on both pages`);
      }
      has(pv.text, /Any healthy path, passkey or Google, can revoke\./, `Privacy ${surface}: the revoke rule`);
      has(d.text, /A fresh sign-in on any healthy path, passkey or Google\./, `Identity ${surface}: the revoke rule`);
      for (const [t, who] of [[pv.text, 'Privacy'], [d.text, 'Identity']]) { has(t, /removes any passkey held on that device\. Where it held one, your path count drops by one\./, `${who} ${surface}: the removal`); has(t, UNV, `${who} ${surface}: unlabelled`); }
      has(p.view('privacy', 'a', 'privacy-a-devices', surface, 'empty').text, /Google Linked on proof of both · the only path Last path/, `Privacy ${surface}: the last path`);
      has(view('identity', 'a', 'a-paths', surface, 'empty').text, /Google Linked on proof of both · the only path Last path/, `Identity ${surface}: the last path`);
    }
  },
};
