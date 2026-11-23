// MP-188: the owner's five passkey and recovery picks (MP-184), proved on the rendered Privacy screens.
//   ADM-13 "Redraw Privacy now": "Privacy shows today's truth: two usable paths, the replacement on the Mac, and the iPhone row waiting on the purchase."
//   ADM-04 "Allowed in the browser": "The bar covers the Apple app only, so Phone web may enrol a passkey once a test proves it works."
//   ADM-15 "Finish in the phone browser": "You enrol the replacement passkey in the phone's browser, if you allow browser passkeys."
//   ADM-02 "Revoke removes it too": "Revoking a device also removes any passkey held on it, and your path count drops by one."
//   ADM-03 "Any healthy path": "A fresh sign-in on any healthy path, passkey or Google, can revoke, and Privacy's button changes to match."
// The browser passkey and the removal are unverified until MP-197, and every screen that rests on them says so.
// Privacy read against Identity, "one story", is MP188-one-story in tests/admin_facts/m188.mjs, whose runner loads both pages.
const ALL = ['iphone', 'ipad', 'web', 'pwa'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const UNV = /Unverified · MP-197/;
const BROWSER = { pwa: 'this browser', iphone: "this phone's browser", ipad: "your phone's browser", web: "your phone's browser" };
const GONE = { iphone: 'iPad', ipad: 'iPhone', web: 'iPad', pwa: 'iPad' };
// the screens that draw the sign-in paths card
const PATHS = [['a', 'privacy-a-devices'], ['b', 'privacy-b-devices'], ['b', 'privacy-b-lost']];
const DEVICES = [['a', 'privacy-a-devices'], ['b', 'privacy-b-devices']];
const SETUP = [['a', 'privacy-a-device'], ['b', 'privacy-b-device']];
const between = (t, a, b) => { const i = t.indexOf(a); if (i < 0) return ''; const j = t.indexOf(b, i + a.length); return t.slice(i, j < 0 ? undefined : j); };
// a button a reader can press, by its words
const live = (html, label) => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].some((m) => !/\bdisabled\b/.test(m[1]) && m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() === label);
const shown = (html, label) => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].some((m) => m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() === label);

export default {
  // ADM-13: two usable paths, the iPhone row waiting on the purchase, the replacement on the Mac, and no iPhone passkey anywhere
  'MP188-adm13': ({ each, view, has, lacks, must }) => {
    let seen = 0;
    for (const [o, s] of PATHS) for (const surface of ALL) for (const state of ['default', 'stale', 'error', 'disagreement']) {
      const t = view('privacy', o, s, surface, state).text, paths = t.slice(t.indexOf('Sign-in paths'));
      const at = `${s} ${surface} ${state}`;
      must(t.includes('Sign-in paths'), `${at}: no sign-in paths`);
      has(paths, /^Sign-in paths 2 usable · 1 waiting/, `${at}: the count`);
      const iphone = between(paths, 'Passkey, iPhone', 'Passkey, Mac');
      has(iphone, /Waiting on MP-179/, `${at}: the iPhone row does not wait on the purchase`);
      lacks(iphone, /Healthy/, `${at}: the iPhone row reads healthy`);
      has(between(paths, 'Passkey, Mac', 'Google'), /Healthy/, `${at}: the Mac passkey`);
      has(between(paths, 'Google', 'Removing your last path'), /Healthy/, `${at}: Google`);
      seen++;
    }
    // one path left is Google, as Identity draws it, never a passkey in an app
    for (const [o, s] of PATHS) for (const surface of ALL) {
      const t = view('privacy', o, s, surface, 'empty').text;
      has(t, /Google Linked on proof of both · the only path Last path/, `${s} ${surface} empty: the last path`);
      lacks(t, /Passkey, (iPhone|iPad|Mac) This device Last path/, `${s} ${surface} empty: a passkey as the last path`);
    }
    // the replacement goes on the Mac; the new app cannot hold it
    for (const surface of ALL) {
      const t = view('privacy', 'b', 'privacy-b-lost', surface, 'default').text;
      has(t, new RegExp(`Add a replacement passkey On (this|your) Mac[^.]*\\. The new ${GONE[surface]} cannot hold one until the Developer Program is bought \\(MP-179\\)`), `b-lost ${surface}: the replacement`);
      has(view('privacy', 'b', 'privacy-b-checkup', surface, 'default').text, /Sign-in paths 2 usable · Mac passkey and Google · iPhone waits on MP-179/, `checkup ${surface}`);
    }
    // nowhere does Privacy sign in with, call healthy, or land a replacement on an iPhone or iPad passkey
    each({ journey: 'privacy' }, (v, at) => {
      const where = `${at.screen} ${at.surface} ${at.state}`;
      lacks(v.text, /iPhone Active 40 min ago · Passkey|Your iPhone passkey|Use a passkey on your iPhone|3 healthy|2 passkeys and Google|On the new (iPad|iPhone)|Only this device can sign in/, where);
      lacks(v.text, /Passkey, iPhone (This device|Last used today)/, where);
      seen++;
    });
    must(seen > PATHS.length * ALL.length * 4, `walked ${seen} views`);
  },

  // ADM-03: Privacy's button names the device and its line says any healthy path will do; no screen revokes "with a passkey"
  'MP188-adm03': ({ each, view, has, lacks, must }) => {
    each({ journey: 'privacy' }, (v, at) => lacks(v.text, /Revoke with a passkey/, `${at.screen} ${at.surface} ${at.state}`));
    for (const surface of ALL) {
      const label = `Revoke the ${GONE[surface]}`, d = view('privacy', 'b', 'privacy-b-lost', surface, 'default');
      must(live(d.html, label), `b-lost ${surface}: no "${label}" to press`);
      has(d.text, /Revoking asks for a fresh sign-in\. Any healthy path, passkey or Google, can revoke\./, `b-lost ${surface}: the line`);
      has(d.text, /just now\. Any healthy path, passkey or Google, can revoke\./, `b-lost ${surface}: step 1`);
      const off = view('privacy', 'b', 'privacy-b-lost', surface, 'offline');
      must(shown(off.html, label) && !live(off.html, label), `b-lost ${surface} offline: revoking needs a connection`);
      for (const [o, s] of DEVICES) has(view('privacy', o, s, surface, 'default').text, /Revoking asks for a fresh sign-in\. Any healthy path, passkey or Google, can revoke\./, `${s} ${surface}`);
    }
  },

  // ADM-02: every screen that revokes says the passkey goes too, and that this is not yet tested
  'MP188-adm02': ({ view, has, lacks }) => {
    const SAYS = /It also removes any passkey held on that device\. Where it held one, your path count drops by one\./;
    for (const [o, s] of DEVICES) for (const surface of ALL) for (const state of ['default', 'error', 'stale', 'offline', 'disagreement']) {
      const t = view('privacy', o, s, surface, state).text;
      has(t, SAYS, `${s} ${surface} ${state}`); has(t, UNV, `${s} ${surface} ${state}: unlabelled`);
    }
    for (const surface of ALL) {
      for (const state of ['default', 'error', 'offline', 'disagreement']) { const t = view('privacy', 'b', 'privacy-b-lost', surface, state).text; has(between(t, 'Revoke it', 'Add a replacement passkey'), SAYS, `b-lost ${surface} ${state}: step 3`); has(t, UNV, `b-lost ${surface} ${state}`); }
      for (const [o, s] of SETUP) { const t = view('privacy', o, s, surface, 'default').text; has(t, /Lost a device\? Revoke it Optional\. Ends its sessions, closes its live streams and removes any passkey held on it\./, `${s} ${surface}`); has(t, UNV, `${s} ${surface}`); }
      lacks(view('privacy', 'a', 'privacy-a-devices', surface, 'default').text, /Revoking asks for a fresh sign-in, ends the device's sessions and closes its live streams, in a time you approve\.$/, surface);
    }
  },

  // ADM-04: Phone web adds a passkey in its browser; the apps send you to the Mac or a phone's browser and draw no control for it
  'MP188-adm04': ({ view, has, lacks, must }) => {
    for (const [o, s] of SETUP) for (const surface of ALL) {
      const t = view('privacy', o, s, surface, 'default').text, at = `${s} ${surface}`;
      if (surface === 'web') { has(t, /Add a passkey here So this Mac can sign in by itself\./, at); continue; }
      lacks(t, /Add a passkey here/, at);
      if (surface === 'pwa') { has(t, /Add a passkey in this browser So this phone can sign in by itself\./, at); has(t, UNV, at); }
      else { has(t, new RegExp(`Add a passkey on your Mac This app cannot hold one until the Developer Program is bought \\(MP-179\\)\\. A passkey in ${BROWSER[surface]} also counts\\.`), at); has(t, UNV, at); }
    }
    // the sign-in paths on Phone web carry a browser row to add one, which needs a connection
    for (const [o, s] of PATHS) for (const surface of ALL) {
      const d = view('privacy', o, s, surface, 'default');
      if (surface !== 'pwa') { lacks(d.text, /Passkey, this browser/, `${s} ${surface}`); continue; }
      has(d.text, /Passkey, this browser Not added\. The bar covers the Apple app only/, `${s} pwa`);
      must(live(d.html, 'Add'), `${s} pwa: nothing to add with`);
      const off = view('privacy', o, s, 'pwa', 'offline');
      must(shown(off.html, 'Add') && !live(off.html, 'Add'), `${s} pwa offline: adding needs a connection`);
    }
    // one path left: Phone web can add in its browser, the Mac here, and the apps draw no button
    for (const [o, s] of DEVICES) {
      must(live(view('privacy', o, s, 'pwa', 'empty').html, 'Add a passkey in this browser'), `${s} pwa empty`);
      must(live(view('privacy', o, s, 'web', 'empty').html, 'Add a passkey'), `${s} web empty`);
      for (const surface of ['iphone', 'ipad']) {
        const e = view('privacy', o, s, surface, 'empty');
        must(!shown(e.html, 'Add a passkey') && !shown(e.html, 'Add a passkey in this browser'), `${s} ${surface} empty: an app draws a passkey control`);
        has(e.text, new RegExp(`Add a passkey on your Mac, or in ${BROWSER[surface]}\\. This app cannot hold one until the Developer Program is bought \\(MP-179\\)\\.`), `${s} ${surface} empty`);
        has(e.text, UNV, `${s} ${surface} empty`);
      }
    }
  },

  // ADM-15: with the Mac lost, recovery ends in a phone's browser on two paths, and the one-path ending if the test fails is drawn beside it
  'MP188-adm15': ({ view, has }) => {
    for (const surface of ALL) for (const [o, s, at] of [['a', 'privacy-a-devices', 'Lost a device?'], ['b', 'privacy-b-lost', 'If your Mac is lost']]) for (const state of ['default', 'stale', 'error', 'offline', 'disagreement']) {
      const t = view('privacy', o, s, surface, state).text, where = `${s} ${surface} ${state}`;
      has(t, new RegExp(`${at.replace('?', '\\?')}[\\s\\S]*If the Mac is the one lost, sign in with Google, revoke it, and add the replacement in ${BROWSER[surface]}\\. You end on two paths\\.`), `${where}: the phone finish`);
      has(t, /If the browser test fails, you stay on Google alone, warned, until you reach a Mac\./, `${where}: the fallback`);
      has(t, UNV, `${where}: unlabelled`);
    }
  },

  // "Each screen that rests on browser passkeys says it does until the test has run", and so does each that removes one on revoke
  'MP188-unverified': ({ each, must }) => {
    let rests = 0;
    each({ journey: 'privacy' }, (v, at) => {
      // a browser passkey or a removal on revoke, not an offline copy "Saved in this browser"
      if (/(passkey|replacement|Mac,) (on your Mac, )?(or )?in (this|this phone's|your phone's|a phone's) browser|Passkey, this browser|removes any passkey/i.test(v.text)) { rests++; must(UNV.test(v.text), `${at.screen} ${at.surface} ${at.state}: rests on MP-197 and does not say so`); }
    });
    must(rests >= 100, `only ${rests} views rest on the browser passkey or the removal`);
  },
};
