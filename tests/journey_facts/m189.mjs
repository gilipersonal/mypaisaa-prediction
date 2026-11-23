// MP-189: three of the owner's picks of 5 Nov 2026 (MP-184), proved on the rendered journey screens, on every device and in every state.
//   MP40-Q2, "Local unlock step": you type the password in a step on your device, which opens the PDF there and uploads the unlocked
//     copy. The password still never leaves the device.
//   MP40-Q12c, "Both keep the five": a browser keeps the same five kinds as the Apple app, each with its age. No record covers how a
//     browser would protect them, so that stays unverified on screen.
//   OWN-37, "Saved copy also times out": the copy clears on the next connection, and the app also stops showing it after a set time
//     without reaching the server. You choose the time, so no number is drawn.
const ALL = ['iphone', 'ipad', 'web', 'pwa'], BROWSER = ['web', 'pwa'], APPLE = ['iphone', 'ipad'];
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline', 'noModel', 'disagreement', 'abstention'];
const at_ = (at) => `${at.journey}.${at.screen} ${at.surface} ${at.state}`;
const RULE = /The password never leaves this device, and it is never stored, logged or sent to a model\./;
const OLD_PROMISE = /never asks for or stores a statement password|Unlock it on your device, then upload the copy|How to unlock/;
const UNVERIFIED = /Saved in this browser How a browser protects saved records is unverified\./;
const SENTENCE = /How a browser protects saved records is unverified\./;
const OLD_OPEN = /Proposed · MP40-Q12|keeps offline is open|not settled/;
const CLEARS = /Its offline copy clears when it next connects, and stops showing after the offline time-out\./;
// every button a screen draws, with whether it can be pressed
const buttons = (html) => [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map((m) => ({ off: /\bdisabled\b/.test(m[1]), text: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }));
const live = (html, label) => buttons(html).some((b) => !b.off && b.text.includes(label));
// the password field as drawn: its type, whether it can be typed in, and what it holds
const pwd = (html) => { const m = html.match(/<input type="password"([^>]*)>/); return m && { off: /\bdisabled\b/.test(m[1]), value: (m[1].match(/value="([^"]*)"/) || [])[1] }; };
const UNLOCK = [['a', 'a-unlock', 'a-imports'], ['b', 'b-unlock', 'b-add']];

export default {
  // MP40-Q2: the locked file leads to a step on this device, drawn in both options on web, iPhone and iPad, and the old promise is gone.
  'MP189-q2': ({ screens, each, view, has, lacks, must }) => {
    for (const [option, step, from] of UNLOCK) {
      must(screens('holdings', option).includes(step), `holdings ${option}: no Unlock a PDF screen`);
      // where the locked file is met, its button goes to the step, and its row states the rule
      each({ journey: 'holdings', option, screen: from, state: 'error' }, (v, at) => {
        const row = v.html.slice(v.html.indexOf('demat-oct-locked.pdf'));
        must(v.html.includes('demat-oct-locked.pdf'), `${at_(at)}: no locked file`);
        must(live(row, 'Unlock on this device'), `${at_(at)}: the locked file has no way to unlock it here`);
        has(v.text, RULE, `${at_(at)}: the locked file does not state the rule`);
        lacks(v.text, /Proposed · MP40-Q2/, `${at_(at)}: a settled question still labelled open`);
      });
      let seen = 0;
      each({ journey: 'holdings', option, screen: step }, (v, at) => {
        seen++;
        const f = pwd(v.html);
        has(v.text, RULE, `${at_(at)}: the step does not say where the password goes`);
        has(v.text, /Only the unlocked copy is sent\./, `${at_(at)}: the step does not say what is sent`);
        has(v.text, /This records what already happened at your broker\. It places no trade\./, `${at_(at)}: the step lost the no-trade sentence`);
        if (['loading'].includes(at.state)) return;
        must(f, `${at_(at)}: no password field`);
        if (['default', 'noModel', 'disagreement', 'abstention'].includes(at.state)) {
          // a drawn password is masked, and the step can be pressed
          must(!f.off && f.value && /^•+$/.test(f.value), `${at_(at)}: the password is not typed and masked`);
          must(live(v.html, 'Open on this device'), `${at_(at)}: nothing opens the PDF`);
        }
        if (['error', 'stale'].includes(at.state)) {
          // a failed or abandoned step keeps no password, and cannot be pressed until one is typed again
          must(f.value === '', `${at_(at)}: a password was kept`);
          has(v.text, at.state === 'error' ? /what you typed is cleared/ : /The password you typed was not kept/, `${at_(at)}: it does not say the password went`);
          must(!live(v.html, 'Open on this device'), `${at_(at)}: it opens with no password`);
        }
        if (at.state === 'offline') {
          must(f.off && !live(v.html, 'Open'), `${at_(at)}: an import runs offline`);
          has(v.text, /imports never run offline/, `${at_(at)}: it does not say why it waits`);
        }
        if (at.state === 'empty') must(live(v.html, 'Choose a file') && f.off, `${at_(at)}: no file to choose, or a field with no file`);
      });
      must(seen === ALL.length * STATES.length, `${step}: walked ${seen} views`);
    }
    // the old promise and its help button are gone from every screen of every journey
    each({}, (v, at) => lacks(v.text, OLD_PROMISE, `${at_(at)}: the retired promise`));
  },

  // MP40-Q12c: every offline frame in a browser says it is saved there and that its protection is unverified; no Apple frame does,
  // and no frame calls the question open. The Offline copy screen lists the five, each with its age, on every device.
  'MP189-q12c': ({ journeys, each, has, lacks, must }) => {
    let browser = 0, apple = 0;
    for (const journey of journeys()) {
      each({ journey, state: 'offline' }, (v, at) => {
        lacks(v.text, OLD_OPEN, `${at_(at)}: a settled question still labelled open`);
        if (APPLE.includes(at.surface)) { apple++; return lacks(v.text, SENTENCE, `${at_(at)}: the Apple app's copy is encrypted, not unverified`); }
        // a sign-in cover shows no data, a cell that does not apply draws another state, and Unlock a PDF shows no saved copy
        if (/privacy-cover/.test(v.html) || v.na || /-unlock$/.test(at.screen)) return;
        browser++;
        has(v.text, journey === 'home' || journey === 'forecast' ? SENTENCE : UNVERIFIED, `${at_(at)}: a browser's offline copy with no label`);
      });
    }
    must(browser > 300 && apple > 300, `walked ${browser} browser and ${apple} Apple offline frames`);
    for (const [option, screen] of [['a', 'privacy-a-data'], ['b', 'privacy-b-devices']]) each({ journey: 'privacy', option, screen, state: STATES.filter((s) => !['loading', 'empty'].includes(s)) }, (v, at) => {
      if (v.na) return;
      const ages = [...v.html.matchAll(/<tr data-mo="rise"><td>([^<]+)<\/td><td class="r">([^<]+)</g)].map((m) => m[1]);
      must(ages.join() === 'Holdings,Prices,Forecasts,Notices,Cost', `${at_(at)}: the five are ${ages.join() || 'missing'}`);
      lacks(v.text, /This is what the Apple app keeps|Proposed · MP40-Q12/, `${at_(at)}: the old reading`);
      if (BROWSER.includes(at.surface)) { has(v.text, /This browser keeps the same five records as the Apple app, each with its age\./, at_(at)); has(v.text, /How a browser protects saved records is unverified\. That needs an architecture answer before build\./, at_(at)); }
      else { has(v.text, /Encrypted on this device, with each record's age\./, at_(at)); lacks(v.text, SENTENCE, at_(at)); }
    });
  },

  // OWN-37: the Offline copy screen says a revoke clears the copy only when the device connects, and that it also stops showing after a
  // time-out whose value is still to be set. No number is invented, and every screen that describes a revoked device's copy says the same.
  'MP189-own37': ({ each, has, lacks, must }) => {
    let n = 0;
    for (const [option, screen] of [['a', 'privacy-a-data'], ['b', 'privacy-b-devices']]) each({ journey: 'privacy', option, screen, state: STATES.filter((s) => !['loading', 'empty'].includes(s)) }, (v, at) => {
      if (v.na) return;
      n++;
      has(v.text, /Stops showing after Not set yet You set the time-out\. How well an offline app can enforce it is unverified\./, `${at_(at)}: no time-out, or a time-out with a value`);
      has(v.text, BROWSER.includes(at.surface) ? /A revoke clears it when this browser next connects\. It also stops showing once this browser has gone the offline time-out without reaching the server\./ : /A revoke clears it when this device next connects\. It also stops showing once this device has gone the offline time-out without reaching the server\./, `${at_(at)}: the revoke has no condition`);
      lacks(v.text, /Stops showing after \d|time-out of \d|\d+ (?:hours?|days?|minutes?) (?:without|offline)/i, `${at_(at)}: a time-out with a number nobody set`);
    });
    must(n >= 44, `walked ${n} Offline copy views, of 44`);
    // no screen promises a revoke clears the copy with no condition
    each({ journey: 'privacy' }, (v, at) => lacks(v.text, /Sign-out or a revoke clears it|clears on sign-out or revoke/, `${at_(at)}: a revoke that clears with no condition`));
    // the revoked device that has not checked in, and the lost-device step, say the same rule in the same words
    for (const [option, screen] of [['a', 'privacy-a-devices'], ['b', 'privacy-b-devices']]) each({ journey: 'privacy', option, screen, state: 'disagreement' }, (v, at) => { has(v.text, CLEARS, at_(at)); has(v.text, /Time-out not set · OWN-37/, at_(at)); });
    each({ journey: 'privacy', option: 'b', screen: 'privacy-b-lost', state: ['default', 'error', 'offline', 'disagreement'] }, (v, at) => has(v.text, CLEARS, `${at_(at)}: the revoke step has no condition`));
  },
};
