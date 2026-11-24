// Home (MP-205): every word and figure the page draws that does not come from `source` is found in the rendered design,
// state by state (docs/design/journeys, home option A, screen a-portfolio), so none can drift. The design is rendered by
// the repository's own loader (scripts/design_journeys_facts.mjs), which runs the page's script with no browser.
import { beforeAll, describe, expect, it } from 'vitest';
import { SAMPLE_PORTFOLIO } from '../../src/lib/data/fake';
import { DATA_STATES, type DataState } from '../../src/lib/data/state';
import { shownMoney } from '../../src/lib/privacy.svelte';
import {
  ACTS_LEAD, BRIEF, BRIEF_FIRST, BROWSER_UNVERIFIED, DAY_CHANGE, EMPTY, HORIZONS, HZ_ON, LATE_RULE, LATER, LEGEND, LIST, METALS, ORDER,
  OUT_NOTE, STAMPS, SUPPORT, actsOf, allocLabel, allocationOf, boardNoteOf, ccyOf, dayPct, dayWord, designState, flagText, flagWord,
  freshOf, metaOf, metalsLine, moneyParts, noteOf, pct, pillOf, rangeLabel, rankLine, score, stamp, tileFoot, valueOf, type DesignState
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

describe('the cost pill is the design\'s, state by state, word for word', () => {
  for (const st of STATES) {
    for (const hidden of [false, true]) {
      it(`${st}${hidden ? ', amounts hidden' : ''}`, () => {
        const html = one(render('pwa', st, hidden), /(<button class="chip glass cost-pill"[\s\S]*?<\/button>)/, 'cost pill');
        const pill = pillOf(st, hidden);
        const mine = `Cost this month: ${pill.parts.map((x) => x.t).join('')}. ${pill.more}`;
        // The design's pill is a button that "Opens the month". Cost is not built in this step, so the app's says the
        // design's words and, when pressed, says the month comes in a later build step (LATER.cost; tests/e2e/home.spec.ts).
        expect(flat(textOf(html))).toBe(flat(mine));
        expect(pill.more).toMatch(/Opens the month$/);
        if (pill.icon) expect(html).toContain(`#i-${pill.icon}"`);
        else expect(html).toContain(`width:${pill.fill}%`);
      });
    }
  }
  it('says the month comes later, in one sentence, when pressed', () => {
    expect(LATER.cost).toMatch(/^[^.]+ later build step\.$/);
  });
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
      const html = render('pwa', st);
      const text = textOf(html);
      expect(text).toContain('Holding Value 6M Action');
      for (const h of p.items) {
        const s = stamp(h, st);
        const move = h.staleAt ? flagWord(st) : pct(h.dayPct);
        expect(text).toContain(`${h.ticker} ${move} ${ccyOf(h)} · ${s.who} ${s.t} ${moneyParts(h.value).whole} ${pct(h.med)} ${rangeLabel(h)}`);
        expect(html).toContain(`aria-label="${rangeLabel(h)}"`);
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

describe('the top 5 board is the design\'s, tile by tile', () => {
  const tiles = (html: string) => [...html.matchAll(/<div class="segtile home-tile[^"]*"[\s\S]*?(?=<div class="segtile home-tile|<\/div><div class="legend")/g)].map((m) => textOf(m[0]));
  for (const surface of ['web', 'pwa'] as const) {
    for (const st of STATES) {
      it(`${surface}, ${st}`, () => {
        const html = render(surface, st);
        const got = tiles(html);
        expect(got).toHaveLength(ORDER.length);
        const sm = surface === 'web';
        const shown = st === 'empty' ? 'default' : st;
        ORDER.forEach((k, i) => {
          const s = p.segments[k]!;
          const held = (t: string) => st !== 'empty' && p.items.some((h) => h.ticker === t);
          const rows = LIST[k] ?? [];
          const body = k === 'metals'
            ? `Forecast unavailable ${METALS.map(([n, px]) => `– ${n} ${px}`).join(' ')} ${metalsLine(sm)}`
            : [...rows.map((r, j) => `${j + 1} ${r[0]}${held(r[0]) ? ' , you hold it' : ''} ${score(r)}`), ...(rows.length < 5 ? [`${rows.length + 1} Withheld –`] : [])].join(' ');
          expect(got[i]).toBe(`${s.mk} ${s.name} ${body} ${tileFoot(k, shown)}`);
        });
        const legend = textOf(one(html, /(<div class="legend">[\s\S]*?<\/div>)/, 'legend'));
        expect(legend).toBe(`${st === 'empty' ? '' : 'You hold it '}${LEGEND.join(' ')} ${rankLine(shown)} Illustrative`);
        const note = boardNoteOf(st, p.items.find((h) => !!h.staleAt));
        const text = textOf(html);
        if (note) expect(text).toContain(`${note.title} ${note.text}${st === 'stale' ? ` ${LATE_RULE}` : ''}`);
        if (st === 'empty') expect(text).not.toMatch(/Re-ranking|ranking run failed|Lists from 22:15|is stale\./);
      });
    }
  }
  it('holds the two lists the source carries equal to the board\'s, score for score', () => {
    for (const [k, rows] of Object.entries(p.topFives)) {
      expect(rows.map((r) => [r[0], r[2]])).toEqual((LIST[k] ?? []).map((r) => [r[0], score(r)]));
    }
  });
});

describe('the brief and the ranked actions are the design\'s', () => {
  for (const st of STATES) {
    it(`the rail on a desktop, ${st}`, () => {
      const text = textOf(render('web', st));
      const [title, sub] = BRIEF[st];
      if (st === 'empty') expect(text).toContain(`${title} ${sub} ${BRIEF_FIRST} Ranked actions ${ACTS_LEAD} None yet.`);
      else {
        expect(text).toContain(`${title} ${sub} ${STAMPS.join(' ')} Open the brief Ranked actions ${ACTS_LEAD}`);
        expect(text).toContain(actsOf(p, st).map((a) => `${a.action} ${a.name} ${a.why}${a.settled ? ` ${LATE_RULE}` : ''}`).join(' '));
      }
    });
    it(`the pill above the tabs on a phone, ${st}`, () => {
      const html = render('pwa', st);
      const pill = /<button class="home-pill"[\s\S]*?<\/button>/.exec(html);
      if (st === 'empty') expect(pill).toBeNull();
      else expect(textOf(pill![0])).toBe(BRIEF[st].join(' '));
    });
  }
  it('computes NVIDIA\'s share from the source (lesson 37)', () => {
    expect(actsOf(p, 'default')[0]!.why).toContain('12.6% of the portfolio');
  });
});

describe('the horizon switch and the controls not built in this step', () => {
  it('draws the design\'s 3M, 6M and 12M with 6M pressed', () => {
    const html = one(render('web', 'default'), /(<div class="segctl" role="group" aria-label="Forecast horizon"[\s\S]*?<\/div>)/, 'horizon switch');
    expect([...html.matchAll(/aria-pressed="(\w+)" aria-label="([^"]+)">([^<]+)</g)].map((m) => [m[1], m[2], m[3]]))
      .toEqual(HORIZONS.map((h, i) => [String(i === HZ_ON), h.n, h.s]));
  });
  it('splits money exactly as the privacy helper prints it', () => {
    for (const m of [...p.items.map((h) => h.value), p.total, p.cash, DAY_CHANGE]) {
      const { whole, pence } = moneyParts(m);
      expect(`${whole}.${pence}`).toBe(shownMoney(m, false));
    }
  });
  it('says one sentence for each, naming a later build step', () => {
    for (const s of Object.values(LATER)) expect(s).toMatch(/^[^.]+ later build step\.$/);
  });
});

describe('the states map one to one', () => {
  it('reads ready as the design\'s default and keeps the rest', () => {
    expect(STATES).toEqual(['default', 'loading', 'empty', 'error', 'stale', 'offline']);
    expect(designState('ready' as DataState)).toBe('default');
  });
  it('writes a minus sign, not a hyphen', () => expect(pct(-0.6)).toBe('−0.6%'));
});
