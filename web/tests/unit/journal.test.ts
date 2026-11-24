import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { SAMPLE_PORTFOLIO } from '../../src/lib/data/fake';
import { COPY, ENTRIES, synthetic, type JournalEntry } from '../../src/lib/journal/sample';
import {
  counts, entriesFor, howDidText, hrefOf, joinEntries, landedLabel, partLine, pct, plain, sideText, unitParts, viewOf, type ShownEntry
} from '../../src/lib/journal/journal';

/*
 * The journal's sample is the Journal design's own (MP-158, option A "Timeline"). Each text and figure is found in the design
 * as it renders (scripts/design_journeys_facts.mjs runs the Journeys page's own script), so none can drift (lesson 2).
 */
const root = (p: string) => fileURLToPath(new URL(`../../../${p}`, import.meta.url));
const journalJs = readFileSync(root('docs/design/journeys/src/journeys/journal.js'), 'utf8');
const prism = readFileSync(root('docs/design/prism/index.html'), 'utf8');
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline'] as const;

type Render = (screen: string, state: string, kind?: string) => string;
let render: Render;
let haystack = '';
const shown: ShownEntry[] = joinEntries(SAMPLE_PORTFOLIO);
const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

beforeAll(async () => {
  // A variable path, so the type checker does not follow the page loader into the repository's scripts.
  const loader = root('scripts/design_journeys_facts.mjs');
  const { load, textOf } = (await import(/* @vite-ignore */ loader)) as {
    load: (page: string) => { id: string; options: { id: string; screens: { id: string; render: (ctx: object) => string }[] }[] }[];
    textOf: (html: string) => string;
  };
  const option = load(root('docs/design/journeys/index.html')).find((j) => j.id === 'journal')!.options.find((o) => o.id === 'a')!;
  render = (screen, state, kind = 'web') =>
    squash(textOf(option.screens.find((s) => s.id === screen)!.render({ kind, state, scheme: 'light', journey: 'journal', option: 'a', screen })));
  haystack = ['a-list', 'a-one', 'a-differ'].flatMap((s) => [...STATES, 'abstention'].map((st) => render(s, st))).join(' | ');
}, 60_000);

const statusText = (e: JournalEntry) => (e.outcome === 'wait' ? e.left! : e.outcome === 'open' ? 'Unresolved' : 'Scored');
const rowText = (e: ShownEntry, differ = true) =>
  `${e.logo} ${e.name} ${e.on} · ${e.horizon} ${statusText(e)} ${e.ranked} ${plain(e.you)}${e.differed && differ ? ' Differed' : ''} ${e.line}`;

describe('the journal sample is the design\'s own', () => {
  it('is marked synthetic', () => {
    expect(synthetic).toBe(true);
  });

  it('draws every entry, newest first, word for word as the timeline does', () => {
    const list = render('a-list', 'default');
    let at = -1;
    for (const e of shown) {
      const i = list.indexOf(rowText(e));
      expect(i, rowText(e)).toBeGreaterThan(at);
      at = i;
    }
    expect(shown).toHaveLength(7);
  });

  it('names each holding as Prism\'s sample does', () => {
    for (const e of ENTRIES) expect(SAMPLE_PORTFOLIO.items.map((h) => h.ticker), e.ticker).toContain(e.ticker);
    expect(() => joinEntries({ items: [] })).toThrow(/no holding/);
  });

  it('shows each opened decision as the design draws it', () => {
    // The design draws one opened decision per state: NVIDIA scored in Ready, Apple waiting in Empty, HSBC unresolved in Stale, AstraZeneca outside in Abstaining.
    const where: Record<string, string> = { nvda: 'default', aapl: 'empty', hsba: 'stale', azn: 'abstention' };
    const opened = shown.filter((e) => e.detail);
    expect(opened.map((e) => e.id).sort()).toEqual(Object.keys(where).sort());
    for (const e of opened) {
      const d = e.detail!, t = render('a-one', where[e.id]!);
      const expectIn = (s: string) => expect(t, `${e.id}: ${s}`).toContain(s);
      expectIn(d.title);
      expectIn(`What you recorded ${d.recorded} · saved, append-only${e.differed ? ' Differed' : ''} ${plain(d.said)}`);
      expectIn(COPY.correction);
      expectIn(`What you saw on ${d.seenOn} ${COPY.frozen} Exact ${e.ranked} Decision support ${d.seen.map(([k, v]) => `${k} ${v}`).join(' ')} Model ${d.model} Ranking policy ${d.policy} Data cutoff ${d.cutoff}`);
      expectIn(`The model today. This entry cites ${d.model}, the version you saw.`);
      const r = d.result;
      if (r.kind === 'scored') {
        expectIn(`${r.title} ${r.sub} ${r.chip} ${landedLabel(r.forecast, r.outcome)} 50% range 80% range Median Outcome ${r.lines.map(([k, v]) => `${k} ${v}`).join(' ')}`);
        expectIn(`What happened ${r.happened.passed} ${r.happened.text} ${COPY.happenedNote}`);
        // the drawing's 50% band is not in its words, so it is found in the design's source
        const f = r.forecast;
        expect(journalJs).toContain(`{ med: ${f.med}, lo: ${f.lo}, hi: ${f.hi}, lo50: ${f.lo50}, hi50: ${f.hi50}, when: '${f.when}' }`);
        // the frozen evidence and the outcome agree with the forecast and the line the timeline shows
        expect(d.seen).toEqual([['6-month median', pct(f.med)], ['80% range', `${pct(f.lo)} to ${pct(f.hi)}`]]);
        expect(e.line.startsWith(`${r.outcome < 0 ? 'Fell' : 'Rose'} ${pct(Math.abs(r.outcome)).slice(1)}`)).toBe(true);
        expect(e.outcome).toBe(r.outcome >= f.lo && r.outcome <= f.hi ? 'in' : 'out');
      } else {
        expectIn(`${r.title} ${r.text} ${statusText(e)}`);
      }
    }
  });

  it('finds every sentence the screens quote in the design', () => {
    const quoted = (v: unknown): string[] => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(quoted) : Object.values(v as object).flatMap(quoted));
    for (const s of quoted(COPY)) expect(haystack, s).toContain(s);
  });

  it('takes the proof from Prism', () => {
    for (const s of Object.values(COPY.proof)) expect(prism, s).toContain(s);
    expect(prism).toContain('aria-label="Observed 79% against a target of 80%"');
  });
});

describe('counts are computed from the entries (lesson 37)', () => {
  const c = counts(ENTRIES);

  it('match the design\'s figures', () => {
    expect([c.all, c.followed.n, c.differed.n, c.scored, c.inside, c.outside]).toEqual([7, 3, 4, 3, 2, 1]);
    const differ = render('a-differ', 'default');
    expect(differ).toContain(`You followed ${c.followed.n}`);
    expect(differ).toContain(partLine(c.followed, ['scored']));
    expect(differ).toContain(`You differed ${c.differed.n}`);
    expect(differ).toContain(partLine(c.differed, ['scored']));
    expect(differ).toContain(`${c.differed.n} entries Illustrative`);
    expect(differ).toContain(howDidText(c));
    expect(render('a-list', 'default')).toContain(sideText(c));
  });

  it('lists the differed entries in the design\'s order, without the Differed mark', () => {
    const differ = render('a-differ', 'default');
    let at = -1;
    for (const e of shown.filter((x) => x.differed)) {
      const i = differ.indexOf(rowText(e, false));
      expect(i, e.id).toBeGreaterThan(at);
      at = i;
    }
  });

  it('change when the entries change', () => {
    const more = counts([...ENTRIES, { ...ENTRIES[0]!, id: 'x', differed: false, outcome: 'out' }]);
    expect(sideText(more)).toContain('4 times in 8 decisions');
    expect(howDidText(more)).toContain('Of the 4 scored, 2 landed inside their 80% range and 2 outside');
    expect(partLine(more.followed, ['scored'])).toBe('1 scored · 2 waiting · 1 unresolved');
  });
});

describe('units and links', () => {
  it('marks every number of units, and only numbers', () => {
    const texts = ENTRIES.flatMap((e) => [e.you, e.detail?.said ?? '']);
    const marked = texts.flatMap((t) => unitParts(t).filter((p) => p.units).map((p) => p.text));
    expect(marked).toEqual(['6', '88', '60', '5', '5']);
    // no number of units is left unmarked, so none shows when amounts are hidden
    for (const t of texts) expect(t.replace(/\{\d+\}/g, ''), t).not.toMatch(/\d+ units/);
    expect(unitParts('Kept all {60} units.')).toEqual([{ text: 'Kept all ', units: false }, { text: '60', units: true }, { text: ' units.', units: false }]);
  });

  it('opens only the decisions the design draws, and keeps the data state', () => {
    expect(viewOf('?entry=nvda')).toEqual({ kind: 'entry', id: 'nvda' });
    expect(viewOf('?entry=spy')).toEqual({ kind: 'list' });
    expect(viewOf('?entry=nope')).toEqual({ kind: 'list' });
    expect(viewOf('?view=differed')).toEqual({ kind: 'differed' });
    expect(viewOf('')).toEqual({ kind: 'list' });
    expect(hrefOf({ kind: 'entry', id: 'nvda' }, '?data=stale')).toBe('/record?entry=nvda&data=stale');
    expect(hrefOf({ kind: 'list' }, '?entry=nvda&data=offline')).toBe('/record?data=offline');
    expect(hrefOf({ kind: 'differed' }, '?data="><script>')).toBe('/record?view=differed');
    expect(hrefOf({ kind: 'list' }, '')).toBe('/record');
  });

  it('holds no entry when the journal is empty, and all of them otherwise', () => {
    expect(entriesFor('empty', shown)).toEqual([]);
    for (const s of ['ready', 'loading', 'error', 'stale', 'offline'] as const) expect(entriesFor(s, shown)).toHaveLength(7);
  });
});
