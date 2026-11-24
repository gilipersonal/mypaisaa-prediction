// MP-193 (the audit's UX-02): every drawn control says what kind it is. Works here, an illustration, or not allowed here;
// a screen reader hears the kind, and "Mark what works" outlines them. Proved on the classifier the page itself runs.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const page = () => { const i = process.argv.indexOf('--page'); return i >= 0 ? resolve(process.argv[i + 1]) : resolve(ROOT, 'docs/design/journeys/index.html'); };
export const CONTROL = /<(button|div|span|a|li)(?![\w-])([^>]*)>/g;
export const isControl = (tag, attrs) => tag === 'button' || /role="(button|switch|link|tab|checkbox|radio|menuitem)"/.test(attrs);
export const WORK = /\sdata-(flip|dossier|go)=/;
export const SEGS = { home: ['Forecast horizon'], forecast: ['Forecast horizon', 'Detail', 'Dossier'] };

export function classes(html, journey, segs = SEGS) {
  const out = { work: 0, illus: 0, policy: 0, bad: [] };
  for (const [whole, tag, attrs] of html.matchAll(CONTROL)) {
    if (!isControl(tag, attrs)) continue;
    const k = (attrs.match(/\sdata-ctl="(\w+)"/) || [])[1];
    if (!k) { out.bad.push(`unmarked: ${whole.slice(0, 120)}`); continue; }
    out[k] = (out[k] || 0) + 1;
    if (WORK.test(attrs) && k !== 'work') out.bad.push(`has a working hook but is marked ${k}: ${whole.slice(0, 120)}`);
    if (k === 'work' && !WORK.test(attrs)) {
      // a working button with no hook of its own must sit in a segmented control that redraws this journey's frame
      const at = html.indexOf(whole), group = html.lastIndexOf('<div class="segctl', at), label = (html.slice(group, at).match(/aria-label="([^"]*)"/) || [])[1];
      if (group < 0 || !(segs[journey] || []).includes(label)) out.bad.push(`works with no hook: ${whole.slice(0, 120)}`);
    }
    if (k === 'illus' && !/aria-describedby="[^"]*\bmp-illus\b/.test(attrs)) out.bad.push(`illustration not described: ${whole.slice(0, 120)}`);
    if (k === 'policy' && !/aria-describedby="[^"]*\bmp-policy\b/.test(attrs)) out.bad.push(`not-allowed not described: ${whole.slice(0, 120)}`);
    if (k === 'policy' && !/\sdisabled(?=[\s>=]|$)|aria-disabled="true"/.test(attrs)) out.bad.push(`not allowed but not disabled: ${whole.slice(0, 120)}`);
  }
  return out;
}

export default {
  // every control on every screen, device and state carries its kind, and each kind holds its promise
  'MP193-every-control-classed': ({ each, mark, must }) => {
    const total = { work: 0, illus: 0, policy: 0 };
    each({}, (v, at) => {
      const c = classes(mark(v.html, at.journey), at.journey);
      must(!c.bad.length, `${at.journey}.${at.option}.${at.screen} ${at.surface} ${at.state}: ${c.bad[0]}`);
      for (const k of Object.keys(total)) total[k] += c[k];
    });
    must(total.work > 0 && total.illus > 0 && total.policy > 0, `every kind is drawn: ${JSON.stringify(total)}`);
  },
  // the horizon, detail and dossier switches that really redraw are marked as working; the same words elsewhere are not
  'MP193-working-switches': ({ view, mark, must }) => {
    const f = mark(view('forecast', 'b', 'b-forecast', 'iphone').html, 'forecast');
    must(/<div class="segctl[^"]*" role="group" aria-label="Dossier"[^>]*>[\s\S]*?<button data-ctl="work"/.test(f), 'the Dossier switch is not marked working');
    const flip = mark(view('home', 'a', 'a-portfolio', 'iphone').html, 'home');
    must(/data-ctl="work"[^>]*data-flip=/.test(flip), 'the flip is not marked working on Home');
  },
  // the page explains the kinds, offers the switch, and gives the screen reader its two sentences
  'MP193-page-legend': ({ must }) => {
    const html = readFileSync(page(), 'utf8');
    must(/id="markctl"[^>]*>|role="switch" aria-checked="false" id="markctl"/.test(html), 'no Mark what works switch');
    for (const t of ['Works here', 'Illustration: drawn, does nothing on this page', 'Not allowed here: the screen says why']) must(html.includes(t), `the legend lacks "${t}"`);
    must(/<p id="mp-illus" hidden>Illustration: drawn, and does nothing on this page\.<\/p>/.test(html), 'no mp-illus sentence');
    must(/<p id="mp-policy" hidden>Not allowed here; the screen says why\.<\/p>/.test(html), 'no mp-policy sentence');
    must(/html\.markctl \.scr \[data-ctl="illus"\] \{ outline: 2px dashed/.test(html), 'no outline for an illustration');
  },
};
