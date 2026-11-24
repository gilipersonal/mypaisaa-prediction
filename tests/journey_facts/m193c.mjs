// MP-193 (the audit's UX-12): risky pairs of conditions on the approval path, each drawn with both conditions showing, and
// each naming what stays, what you can do, what is held, how it recovers and what the record keeps. A write never comes
// back because one banner sits above another. Proved on the page's own drawing of each pair.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const pagePath = () => { const i = process.argv.indexOf('--page'); return i >= 0 ? resolve(process.argv[i + 1]) : resolve(ROOT, 'docs/design/journeys/index.html'); };
// the runner's own text reading, kept here because importing the runner from a check would load it twice
const textOf = (html) => html.replace(/<svg[\s\S]*?<\/svg>/g, (m) => (m.match(/aria-label="([^"]*)"/) || [, ' '])[1] + ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&[a-z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim();
const WRITE = /^(Approve|Refuse|Confirm|Continue with passkey|Raise|Ask again|Try again|Restart|Switch forward|Promote|Revoke)\b/;
// what each pair must say, in both its conditions' own words
const BOTH = {
  'offline-expired': [/Offline\. Showing this from 22:15/, /Expired Mon 18:00\. An expired proposal cannot be approved/],
  'hidden-raise': [/Amounts are hidden\. This approval is about an amount, so Approve waits until you show amounts/, /Raise the warning line £•• to £••/],
  'unknown-offline': [/Offline\. Showing this from 22:15\. Billing cannot be refreshed/, /No raise while the month is unknown/],
};
const buttons = (html) => [...html.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)].map((m) => ({ said: textOf(m[2]), off: /\sdisabled(?=[\s>=]|$)/.test(m[1]) }));

export default {
  'MP193-combined-conditions': ({ page, must }) => {
    must(page && typeof page.combos === 'function', 'the page draws no combined conditions');
    const combos = page.combos();
    must(combos.length >= 3, `only ${combos.length} combined conditions`);
    for (const c of combos) {
      for (const k of ['when', 'stays', 'can', 'held', 'recover', 'record']) must(typeof c[k] === 'string' && c[k].length > 20, `${c.id} does not say ${k}`);
      must(BOTH[c.id], `${c.id} has no check of its two conditions`);
      for (const surface of ['iphone', 'ipad', 'web', 'pwa']) for (const scheme of ['light', 'dark']) {
        const html = page.comboHTML(c, surface, scheme), text = textOf(html), at = `${c.id} ${surface} ${scheme}`;
        for (const re of BOTH[c.id]) must(re.test(text), `${at}: lacks ${re}`);
        // no write stays live unless the pair says so; a live one must be one the pair allows
        for (const b of buttons(html)) if (WRITE.test(b.said) && !b.off) must(c.allow && c.allow.test(b.said), `${at}: "${b.said}" is live`);
        if (c.hide) {
          must(!/£\s?\d/.test(html), `${at}: an amount shows while amounts are hidden`);
          must(buttons(html).some((b) => /^Approve/.test(b.said) && b.off), `${at}: Approve is not held while amounts are hidden`);
          must(buttons(html).some((b) => /^Show amounts/.test(b.said) && !b.off), `${at}: there is no way to show amounts`);
        }
        // the tab bar and the way back stay live: holding writes never holds moving about
        for (const b of buttons(html)) if (/^(Waiting|Portfolio|Forecasts|Segments|Record|Settings)$/.test(b.said)) must(!b.off, `${at}: "${b.said}" was held`);
      }
    }
  },
  // the rule is on the page, word for word, and labelled proposed for the owner
  'MP193-combined-rule': ({ page, must }) => {
    const html = readFileSync(pagePath(), 'utf8'), rule = page.comboRule();
    must(/Every condition that stops a write keeps stopping it, whichever banner shows first\./.test(rule), 'the rule lost its first sentence');
    must(html.includes(rule), 'the rule is not on the page as written');
    // the owner accepted the rule on 24 November 2026 ("Accept all three", MP-66), so it is labelled settled (MP-66)
    must(/<b>The rule<\/b> \$\{chip\('owner', 'Settled · MP-66'\)\}/.test(html), 'the rule is not labelled Settled · MP-66');
    must(/<a href="#combined" data-i="cmb">Combined conditions<\/a>/.test(html), 'the journey list has no Combined conditions');
  },
};
