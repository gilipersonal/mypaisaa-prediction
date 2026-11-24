import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COPY, HOLDINGS_JS, LESS, PRIVACY_JS, SOURCE_OF, modeSay } from '../../src/lib/privacy-centre';
import { problems, SOURCES } from '../../scripts/prism-components.mjs';

const read = (p: string) => readFileSync(new URL(`../../../${p}`, import.meta.url), 'utf8');
const privacyJs = read(PRIVACY_JS);
const holdingsJs = read(HOLDINGS_JS);
const src = (p: string) => readFileSync(new URL(`../../src/${p}`, import.meta.url), 'utf8');
const page = src('routes/(app)/settings/privacy/+page.svelte');
const sw = src('routes/(app)/settings/privacy/Sw.svelte');
const row = src('routes/(app)/settings/privacy/HoldRow.svelte');
const later = src('lib/journal/Later.svelte');
const css = read('docs/design/journeys/src/journeys/privacy.css');
const designCss = (SOURCES as string[][]).map((p) => read(p.join('/'))).join('\n');

describe('the privacy centre says only what its design says (Privacy option A, privacy-a-centre)', () => {
  it.each(Object.entries(COPY))('finds %s in its design source', (key, phrase) => {
    const file = SOURCE_OF[key as keyof typeof COPY];
    // the design writes an apostrophe inside a quoted string as \', so the source is read as its strings read
    expect(read(file).replace(/\\'/g, "'"), `${key} in ${file}`).toContain(phrase);
  });

  it('takes the screen, its back control and its title from option A', () => {
    expect(privacyJs).toContain("id: 'a', name: 'One privacy centre', rec: true,");
    expect(privacyJs).toContain("id: 'privacy-a-centre', title: 'Privacy centre',");
    expect(privacyJs).toContain(`tab: 4, back: '${COPY.back}', title: '${COPY.title}',`);
  });

  it('names the switch and its card as modeCard does', () => {
    expect(privacyJs).toContain(`head('${COPY.mode}', sw('${COPY.hide}', true))`);
    expect(privacyJs).toContain(`const maskSay = '${COPY.hiddenSay} Tap to show for 30 seconds.';`);
    expect(privacyJs).toContain(`const maskCopy = \`${COPY.hiddenLead} \${maskSay}\`;`);
  });

  it('reads the shown sentence from the design\'s own reading of OWN-18', () => {
    expect(holdingsJs).toContain(`The owner picked "Mask units too" (OWN-18), which reads: ${COPY.shownSay}`);
  });

  it('heads the less private options as outside(ctx) does, and keeps lessCard\'s fresh sign-in sentence', () => {
    expect(privacyJs).toContain(`head('${COPY.outside}', chipOf(['fresh', '${COPY.privateDefault}']))`);
    expect(privacyJs).toContain(`<p class="small muted">${COPY.fresh}</p>`);
  });

  it('keeps every less private option the design lists, in its order, and no other', () => {
    const rows = LESS.map(([t, s]) => `['${t}', '${s}']`).join(', ');
    expect(privacyJs).toContain(`const LESS = [${rows}];`);
  });

  it('says what the switch does in each position', () => {
    expect(modeSay(true)).toBe('Amounts hidden. Money and units are masked. Percentages and ranges stay visible.');
    expect(modeSay(false)).toBe(COPY.shownSay);
    expect(modeSay(true)).not.toContain('Tap to show');
  });
});

describe('the privacy centre page', () => {
  it('draws its words from the copy, not from text of its own', () => {
    // the sentences and row labels; a single word such as "Privacy" may also sit in a comment
    const long = [...Object.values(COPY), ...LESS.flat()].filter((p) => p.length > 15);
    expect(long.length).toBeGreaterThan(8);
    for (const phrase of long) expect(page, phrase).not.toContain(phrase);
  });

  it('has one working switch; every other switch is drawn as designed and only says its act comes later', () => {
    // every switch is the one drawing in Sw.svelte, and what a press does is the page's
    expect(sw.match(/role="switch"/g)).toHaveLength(1);
    expect(sw).toContain('onclick={onpress}');
    expect(page.match(/<Sw /g)).toHaveLength(3);
    expect(page.match(/privacy\.set\(/g)).toHaveLength(1);
    expect(page).toContain('<Sw label={COPY.hide} {on} onpress={() => privacy.set(!privacy.hidden)} />');
    // the less private options are drawn off, can never turn on, and their press only says so
    expect(page).toContain('<Later text={LATER.less}>{#snippet children(press)}<Sw label={t} on={false} disabled={st === \'offline\'} onpress={press} />');
    expect(page).toMatch(/<Later text=\{LATER\.push\}>\{#snippet children\(press\)\}\{#if pc === 'on' \|\| pc === 'off'\}<Sw label=\{COPY\.phone\} on=\{pc === 'on'\} disabled=\{st === 'offline'\} onpress=\{press\} \/>/);
    expect(later).toContain('{@render children(() => { said = true; })}');
    expect(later).not.toMatch(/fetch\(|localStorage|sessionStorage|privacy\./);
  });

  it('writes nothing to a server, and only reads the sample portfolio', () => {
    for (const f of [page, sw, row, later]) {
      expect(f).not.toMatch(/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/);
      expect(f).not.toMatch(/source\.(?!portfolio\(\))/);
    }
  });
});

describe('the privacy styles are the design\'s own lines', () => {
  it('draws with the design\'s privacy styles, whole', () => expect(readFileSync(new URL('../../src/lib/prism/design.generated.css', import.meta.url), 'utf8')).toContain(css));
  it('passes the drift gate', () => expect(problems(css, designCss, 'privacy.css')).toEqual([]));
  it('refuses a changed value', () => {
    const changed = css.replace(/(\n\.[^\n]*?)(\d+)px/, (_m, a: string, n: string) => `${a}${Number(n) + 1}px`);
    expect(changed).not.toBe(css);
    expect(problems(changed, designCss, 'privacy.css')).toHaveLength(1);
  });
});
