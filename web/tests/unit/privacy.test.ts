import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COPY, HOLDINGS_JS, LESS, PRIVACY_JS, SOURCE_OF, modeSay } from '../../src/lib/privacy-centre';
import { problems, SOURCES } from '../../scripts/prism-components.mjs';

const read = (p: string) => readFileSync(new URL(`../../../${p}`, import.meta.url), 'utf8');
const privacyJs = read(PRIVACY_JS);
const holdingsJs = read(HOLDINGS_JS);
const page = readFileSync(new URL('../../src/routes/(app)/settings/privacy/+page.svelte', import.meta.url), 'utf8');
const css = read('docs/design/journeys/src/journeys/privacy.css');
const designCss = (SOURCES as string[][]).map((p) => read(p.join('/'))).join('\n');

describe('the privacy centre says only what its design says (Privacy option A, privacy-a-centre)', () => {
  it.each(Object.entries(COPY))('finds %s in its design source', (key, phrase) => {
    const file = SOURCE_OF[key as keyof typeof COPY];
    expect(read(file), `${key} in ${file}`).toContain(phrase);
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

  it('has one working switch, and the less private options are drawn off and disabled', () => {
    expect(page.match(/role="switch"/g)).toHaveLength(2);
    expect(page).toContain('onclick={() => privacy.set(!privacy.hidden)}');
    expect(page).toMatch(/aria-checked="false" aria-label=\{t\} disabled>/);
  });

  it('writes nothing to a server', () => {
    expect(page).not.toMatch(/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|source\./);
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
