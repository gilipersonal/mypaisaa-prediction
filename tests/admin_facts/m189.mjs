// MP-189: the owner's picks of 5 Nov 2026 where the admin page repeats them, proved on its rendered screens, every device and state.
//   MP40-Q2, "Local unlock step": a locked PDF is unlocked on the owner's device; the password never leaves it.
//   MP40-Q12c, "Both keep the five": a browser keeps the same five records as the Apple app, and how it protects them is unverified.
//   OWN-37, "Saved copy also times out": a revoked device's copy clears on its next connection, and stops showing after a time-out
//     whose value is still the owner's to set.
// Admin's own pages (runs, models, agents, audit, files) are not among the five, so their "What a browser keeps offline is open" stands.
const BROWSER = ['web', 'pwa'];
const at_ = (at) => `${at.journey}.${at.screen} ${at.surface} ${at.state}`;
const CLEARS = /Its offline copy clears when it next connects, and stops showing after the offline time-out\./;

export default {
  'MP189-admin-q2': ({ each, has, lacks, must }) => {
    let met = 0;
    each({ journey: 'files' }, (v, at) => {
      lacks(v.text, /never asks for or stores a statement password|Proposed · MP40-Q2/, `${at_(at)}: the retired promise, or a settled question labelled open`);
      if (!v.text.includes('demat-oct-locked.pdf')) return;
      met++;
      has(v.text, /Password-protected PDF, so nothing read it\. You unlock it on your own device, and only the unlocked copy is sent\. The password never leaves that device, and it is never stored, logged or sent to a model\./, `${at_(at)}: the locked file does not state the rule`);
    });
    must(met >= 24, `the locked file showed on ${met} views`);
  },
  'MP189-admin-own37': ({ each, has, lacks, must }) => {
    let notes = 0;
    each({ journey: 'identity' }, (v, at) => {
      lacks(v.text, /clears on sign-out or revoke|Sign-out or a revoke clears it|What a browser keeps offline is open|Offline copy Open\b|Proposed · MP40-Q12/, `${at_(at)}: an unconditional revoke, or the browser's copy labelled open`);
      if (/clears when it next connects/.test(v.text)) has(v.text, /stops showing after the (?:offline )?time-out/, `${at_(at)}: a revoke that clears with no time-out`);
      if (!v.text.includes('If this device is revoked:')) return;
      notes++;
      has(v.text, CLEARS, at_(at));
      has(v.text, /You set the time-out\. How well an offline app can enforce it is unverified\. Time-out not set · OWN-37/, `${at_(at)}: the time-out's value or its doubt is missing`);
      if (BROWSER.includes(at.surface)) has(v.text, /This browser keeps the same five records as the Apple app, each with its age\. How a browser protects saved records is unverified\./, at_(at));
      else { has(v.text, /The offline copy on this device is encrypted\. Sign-out clears it\./, at_(at)); lacks(v.text, /How a browser protects/, at_(at)); }
    });
    must(notes >= 100, `the note on this device showed on ${notes} views`);
  },
};
