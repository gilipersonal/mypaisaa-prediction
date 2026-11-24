// Home (MP-205): every word and figure the page draws that does not come from `source` is found in the rendered design,
// state by state (docs/design/journeys, home option A, screen a-portfolio), so none can drift. The design is rendered by
// the repository's own loader (scripts/design_journeys_facts.mjs), which runs the page's script with no browser.
import { beforeAll, describe, expect, it } from 'vitest';
import { SAMPLE_PORTFOLIO } from '../../src/lib/data/fake';
import { DATA_STATES, type DataState } from '../../src/lib/data/state';
import { shownMoney } from '../../src/lib/privacy.svelte';
import {
  BROWSER_UNVERIFIED, DAY_CHANGE, EMPTY, LATE_RULE, OUT_NOTE, SUPPORT, allocLabel, allocationOf, ccyOf, dayPct, dayWord, designState,
  flagText, freshOf, metaOf, noteOf, pct, pillOf, rangeLabel, stamp, valueOf, type DesignState
} from '../../src/lib/home/home';

type Render = (ctx: Record<string, unknown>) => string;
let render: (surface: string, state: DesignState, hidden?: boolean) => string;
let textOf: (html: string) => string;

beforeAll(async () => {
  // A computed specifier, so the type checker does not pull the repository's script into the web app's program.
  const facts = await import(/* @vite-ignore */ new URL('../../../scripts/design_journeys_facts.mjs', import.meta.url).href);
  const journeys = facts.load(new URL('../../../docs/design/journeys/index.html', import.meta.url).pathname);
  textOf = facts.textOf;
  const home = journeys.find((j: { id: string }) => j.id === 'home');
  const screen = home.options.find((o: { id: string }) => o.id === 'a').screens.find((s: { id: string }) => s.id === 'a-portfolio');
  const r: Render = screen.render;
  render = (surface, state, hidden = false) => r({ kind: surface, state, scheme: 'light', journey: 'home', option: 'a', screen: 'a-portfolio', hidden });
});

const flat = (s: string) => s.replace(/\s+/g, '');
const one = (html: string, re: RegExp, what: string): string => {
  const m = re.exec(html);
  if (!m || m[1] === undefined) throw new Error(`the design draws no ${what}`);
  return m[1];
};
const STATES = DATA_STATES.map(designState);
const p = SAMPLE_PORTFOLIO;

describe('the cost pill is the design\'s, state by state, and opens nothing', () => {
  for (const st of STATES) {
    for (const hidden of [false, true]) {
      it(`${st}${hidden ? ', amounts hidden' : ''}`, () => {
        const html = one(render('pwa', st, hidden), /(<button class="chip glass cost-pill"[\s\S]*?<\/button>)/, 'cost pill');
        const pill = pillOf(st, hidden);
        const mine = `Cost this month: ${pill.parts.map((x) => x.t).join('')}. ${pill.more}`;
        // The design's pill is a button that "Opens the month"; Cost is not built in this step, so the app's says neither.
        expect(flat(textOf(html))).toBe(flat(`${mine}. Opens the month`));
        expect(pill.more).not.toMatch(/open/i);
        if (pill.icon) expect(html).toContain(`#i-${pill.icon}"`);
        else expect(html).toContain(`width:${pill.fill}%`);
      });
    }
  }
  it('masks the pounds and keeps the bar when amounts are hidden', () => {
    expect(pillOf('default', true).parts[0]!.t).toBe('£•• of £100');
    expect(pillOf('loading', true).parts[0]!.t).toBe('Last good £••');
    expect(pillOf('default', true).fill).toBe(46.42);
  });
});

describe('the freshness row is the frame\'s own', () => {
  for (const st of STATES) {
    it(st, () => {
      const html = one(render('pwa', st), /(<div class="jfresh on-glass">[\s\S]*?<\/div>)/, 'freshness row');
      const chips = freshOf(st);
      expect(flat(textOf(html))).toBe(flat(chips.map((c) => c.text).join(' ')));
      expect([...html.matchAll(/class="chip (\w+)"/g)].map((m) => m[1])).toEqual(chips.map((c) => c.kind));
      for (const c of chips) if (c.icon) expect(html).toContain(`#i-${c.icon}"`);
    });
  }
});

describe('the value card reads the source and says what the design says', () => {
  for (const st of STATES.filter((s) => s !== 'empty')) {
    it(st, () => {
      const html = render('pwa', st);
      const v = valueOf(p, st);
      expect(textOf(one(html, /<div class="top"><span class="label">([^<]*)<\/span>/, 'value label'))).toBe(v.label);
      expect(one(html, /data-roll="([^"]+)"/, 'value') + one(html, /<span class="p">([^<]+)<\/span>/, 'pence')).toBe(shownMoney(v.total, false));
      expect(textOf(one(html, /<div class="vparts">([\s\S]*?)<\/div>/, 'value parts'))).toBe(`Holdings ${shownMoney(v.holdings, false)} · Cash ${shownMoney(v.cash, false)}`);
      const out = v.out.map((h) => `${h.name}, ${shownMoney(h.value, false)} at ${h.staleAt}, is left out until its price returns. `).join('');
      expect(textOf(one(html, /<div class="meta">([\s\S]*?)<\/div>/, 'value line'))).toBe(out + metaOf(st, p.asOf, v));
      const day = /<div class="d">([\s\S]*?)<\/div>/.exec(html);
      if (st === 'stale') expect(day).toBeNull();
      else expect(flat(textOf(day![1]!))).toBe(flat(`+${shownMoney(DAY_CHANGE, false)} (${dayPct(v.total, DAY_CHANGE)}) ${dayWord(st)}`));
    });
  }

  it('computes the day\'s share from the total and the move (lesson 37)', () => {
    expect(dayPct(valueOf(p, 'default').total, DAY_CHANGE)).toBe('1.39%');
  });

  it('computes the allocation from the holdings and reproduces the source\'s shares first (lesson 63)', () => {
    expect(allocationOf(p, 'default').map((a) => a.pct)).toEqual(p.allocation.map((a) => a.pct));
    for (const st of ['default', 'stale'] as const) {
      expect(one(render('pwa', st), /aria-label="(Allocation:[^"]+)"/, 'allocation')).toBe(allocLabel(st === 'stale' ? allocationOf(p, st) : p.allocation));
    }
    expect(allocationOf(p, 'stale').find((a) => a.name === 'UK')!.pct).toBe('11.0');
  });

  it('leaves the stale holding out of the total and counts what is priced', () => {
    const v = valueOf(p, 'stale');
    expect(v.out.map((h) => h.ticker)).toEqual(['HSBA']);
    expect(shownMoney(v.total, false)).toBe('£84,051.05');
    expect(v.label).toBe('Known value, 6 of 7 priced');
    expect(valueOf(p, 'default').out).toEqual([]);
  });
});

describe('the notes over the holdings are the design\'s words', () => {
  for (const st of STATES) {
    it(st, () => {
      const text = textOf(render('pwa', st));
      const note = noteOf(st);
      if (note) expect(text).toContain(`${note.title} ${note.text}`);
      if (st === 'stale') {
        const v = valueOf(p, st);
        const h = v.out[0]!;
        expect(text).toContain(`${v.out.length} of ${v.count} rows is stale. ${h.name} is past the freshness limit, so it leaves the total: ${shownMoney(v.total, false)} known, ${v.priced} of ${v.count} priced. Its forecast stays held and its action stays ${h.action} until its price returns. ${LATE_RULE}`);
      }
      if (st === 'offline') expect(note!.text).toContain(BROWSER_UNVERIFIED);
      expect(text).toContain(SUPPORT);
    });
  }
  it('says the empty state in the design\'s words', () => {
    expect(textOf(render('pwa', 'empty'))).toContain(`${EMPTY.title} ${EMPTY.text}`);
  });
});

describe('each holding row says what the design says', () => {
  for (const st of STATES.filter((s) => s !== 'empty')) {
    it(`on a phone, ${st}`, () => {
      const html = render('iphone', st);
      const text = textOf(html);
      for (const h of p.items) {
        const s = stamp(h, st);
        expect(text).toContain(`${h.name} ${h.ticker} · ${ccyOf(h)} · ${s.who} ${s.t}`);
        expect(html).toContain(`aria-label="${rangeLabel(h)}"`);
        expect(text).toContain(`${pct(h.med)} · 6M ${h.action}`);
        if (h.staleAt) expect(text).toContain(`${flagText(h, st)}${st === 'stale' ? ` ${OUT_NOTE}` : ''} ${LATE_RULE}`);
      }
    });
    it(`on a desktop, ${st}`, () => {
      const text = textOf(render('web', st));
      expect(text).toContain(`Instrument Value, ${dayWord(st)} 6-month forecast Action Data`);
      for (const h of p.items) {
        const s = stamp(h, st);
        expect(text).toContain(`${h.name} ${h.ticker} · ${ccyOf(h)} ${shownMoney(h.value, false)}`);
        expect(text).toContain(`${pct(h.lo)} to ${pct(h.hi)} ${h.action} ${s.t} ${s.who}${h.staleAt ? ` · ${st === 'stale' ? 'stale' : 'late'}` : ''}`);
      }
    });
  }
});

describe('the states map one to one', () => {
  it('reads ready as the design\'s default and keeps the rest', () => {
    expect(STATES).toEqual(['default', 'loading', 'empty', 'error', 'stale', 'offline']);
    expect(designState('ready' as DataState)).toBe('default');
  });
  it('writes a minus sign, not a hyphen', () => expect(pct(-0.6)).toBe('−0.6%'));
});
