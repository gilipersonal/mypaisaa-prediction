import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { SAMPLE_PORTFOLIO } from '../../src/lib/data/fake';
import {
  BASE, BASE_ROWS, FLOOR, HOLD, HZ, ISSUED, MIN, MODEL, MODEL_ROWS, REG, REGIME_HOW, START, WHY_OUT, YOURS, illustrative, readTrack, synthetic, type Window
} from '../../src/lib/track/sample';
import { ABOUT, PATHS, TITLES, blocksText, freshFor, metrics, n0, pts, rate, sampleText, showsRate, withState } from '../../src/lib/track/track';

/*
 * The Track record's sample is the design's own (MP-187, option A "Scorecard"). Every row is found in the design's source,
 * and every text and figure it derives is found in the design as it renders (scripts/design_journeys_facts.mjs runs the
 * Journeys page's own script), so none can drift (lessons 2, 37 and 63).
 */
const root = (p: string) => fileURLToPath(new URL(`../../../${p}`, import.meta.url));
const trackJs = readFileSync(root('docs/design/journeys/src/journeys/track.js'), 'utf8');
const SCREENS = ['a-record', 'a-slice', 'a-holding', 'a-model', 'a-regime'] as const;
const STATES = ['default', 'loading', 'empty', 'error', 'stale', 'offline'] as const;
const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

let render: (screen: string, state: string, kind?: string) => string;
let html: (screen: string) => string;
beforeAll(async () => {
  const loader = root('scripts/design_journeys_facts.mjs');
  const { load, textOf } = (await import(/* @vite-ignore */ loader)) as {
    load: (page: string) => { id: string; options: { id: string; screens: { id: string; render: (ctx: object) => string }[] }[] }[];
    textOf: (html: string) => string;
  };
  const option = load(root('docs/design/journeys/index.html')).find((j) => j.id === 'track')!.options.find((o) => o.id === 'a')!;
  render = (screen, state, kind = 'web') =>
    squash(textOf(option.screens.find((s) => s.id === screen)!.render({ kind, state, scheme: 'light', journey: 'track', option: 'a', screen })));
  html = (screen) => option.screens.find((s) => s.id === screen)!.render({ kind: 'web', state: 'default', scheme: 'light', journey: 'track', option: 'a', screen });
}, 60_000);

/** The design's w(...) call for a window, as track.js writes it. */
const wCall = (x: Window) => `w(${x.due}, ${x.inside}, ${x.outside}, ${x.censored}, ${x.abstained}, ${x.dir}, ${x.err.toFixed(1)}, '${x.cal}', ${x.base.toFixed(1)}, ${x.blocks})`;
const all = Object.values(HZ);

describe('the track sample is the design\'s own', () => {
  it('is marked synthetic and illustrative, and read in the browser as the same table', async () => {
    expect(synthetic).toBe(true);
    expect(illustrative).toBe(true);
    const r = await readTrack();
    expect(r.synthetic).toBe(true);
    expect(r.HZ).toBe(HZ);
  });

  it('holds the design\'s constants', () => {
    expect(trackJs).toContain(`const START = '${START}', ISSUED = ${ISSUED}, MIN = ${MIN}, FLOOR = ${FLOOR};`);
    expect(trackJs).toContain(`const REGIME_HOW = '${REGIME_HOW}';`);
  });

  it('holds every window of every horizon as the design writes it', () => {
    for (const h of all) {
      if (h.k === 'm12') { expect(trackJs).toContain(`m12: { n: '12 months', k: 'm12', long: true, pending: ${h.pending}, first: '${h.first}'`); continue; }
      expect(trackJs, h.n).toContain(`${h.k}: { n: '${h.n}', k: '${h.k}', ${h.long ? 'long: true, ' : ''}pending: ${h.pending}, ${h.turn ? `turn: '${h.turn}', ` : ''}w: [${h.w.map(wCall).join(', ')}] }`);
    }
  });

  it('holds the holding, model, baseline and regime rows as the design writes them', () => {
    const row = (r: (string | number)[]) => `[${r.map((v) => (typeof v === 'string' ? `'${v}'` : v)).join(', ')}]`;
    for (const k of ['m3', 'm6'] as const) {
      expect(trackJs).toContain(`${k}: [${HOLD[k].map(row).join(', ')}]`);
      expect(trackJs).toContain(`${k}: [${REG[k].map(row).join(', ')}]`);
    }
    expect(trackJs).toContain(`const BASE = { ${BASE_ROWS.map((k) => `${k}: [${BASE[k][0]}, ${BASE[k][1].toFixed(1)}]`).join(', ')} };`);
    const v2 = MODEL.v2.cells, v3 = MODEL.v3.cells;
    for (const k of ['s10', 's20'] as const) {
      const a = v2[k], b = v3[k];
      if (a.due === undefined || b.due === undefined) throw new Error(`${k} has nothing matured`);
      expect(trackJs).toContain(`${k}: ${wCall(a)}`);
      expect(trackJs).toContain(`${k}: { ...${wCall(b)}, pending: ${b.pending} }`);
    }
    expect(trackJs).toContain(`MODEL.v2.m3 = { ...HZ.m3.w[2], pending: ${v2.m3.pending} }; MODEL.v2.m6 = { ...HZ.m6.w[2], pending: ${v2.m6.pending} };`);
    expect(trackJs).toContain(`m12: { pending: ${v2.m12.pending} }`);
    for (const k of ['m3', 'm6', 'm12'] as const) expect(trackJs).toContain(`${k}: { pending: ${v3[k].pending}, first: '${v3[k].first}' }`);
    for (const t of new Set([...HOLD.m3, ...HOLD.m6].map((r) => r[0]))) expect(SAMPLE_PORTFOLIO.items.map((h) => h.ticker), t).toContain(t);
  });
});

describe('every count adds up, and nothing pending, censored or abstained is a miss', () => {
  it('scores only inside or outside its range, and counts the rest apart', () => {
    for (const h of all) for (const x of h.w) {
      expect(x.scored).toBe(x.inside + x.outside);
      expect(x.due, `${h.n} matured`).toBe(x.scored + x.censored + x.abstained);
    }
  });

  it('accounts for every forecast issued at a long horizon: pending plus matured over the whole record', () => {
    for (const h of [HZ.m3, HZ.m6, HZ.m12]) expect(h.pending + h.w[2].due, h.n).toBe(ISSUED);
    expect(HZ.m12.w.every((x) => x.due === 0)).toBe(true);
  });

  it('shows a rate only from MIN scored, and says so below it', () => {
    expect(showsRate(MIN)).toBe(true);
    expect(showsRate(MIN - 1)).toBe(false);
    const s20 = MODEL.v3.cells.s20;
    expect(s20.due !== undefined && !showsRate(s20.scored)).toBe(true);
  });

  it('keeps every horizon exploratory: none has the blocks a claim needs', () => {
    for (const h of all) for (const x of h.w) expect(x.blocks).toBeLessThan(FLOOR);
  });

  it('puts hit rate only beside coverage, calibration, error, the benchmark and turnover', () => {
    const m = metrics(HZ.m6.w[2], HZ.m6);
    expect(m.map(([l]) => l)).toEqual(['Coverage', 'Calibration', 'Error', 'Hit rate', 'Benchmark', 'Turnover']);
    expect(m[0]?.[1]).toBe(`${rate(318, 413)}%`);
    expect(metrics(HZ.s10.w[2], HZ.s10)[5]).toEqual(['Turnover', 'None', 'Short horizons rank no action']);
  });

  it('accounts for the 6-month forecasts not scored', () => {
    const y = HZ.m6.w[2];
    expect(WHY_OUT.filter(([k]) => k.includes('censored')).reduce((a, [, n]) => a + n, 0)).toBe(y.censored);
    expect(WHY_OUT.filter(([k]) => k.includes('abstained')).reduce((a, [, n]) => a + n, 0)).toBe(y.abstained);
  });
});

describe('the words match the design as it renders', () => {
  it('draws each card\'s sample, blocks and measures word for word', () => {
    const rec = render('a-record', 'default');
    for (const h of all) {
      expect(rec, h.n).toContain(`${n0(h.pending)} pending`);
      if (!h.w[2].due) continue;
      const y = h.w[2];
      expect(rec).toContain(`365 days · ${sampleText(y)}. ${blocksText(y)}`);
      for (const [l, v, u] of metrics(y, h)) expect(rec, `${h.n} ${l}`).toContain(`${l} ${v} ${v} ${u}`);
    }
    expect(rec).toContain(`All ${n0(ISSUED)} forecasts since ${START} are pending.`);
  });

  it('draws the breakdowns as the design does', () => {
    const hold = render('a-holding', 'default');
    for (const [t, s, i, c, a] of HOLD.m3) {
      const x = SAMPLE_PORTFOLIO.items.find((h) => h.ticker === t)!;
      expect(hold).toContain(`${x.name} ${t} · ${s + c + a} matured ${rate(i, s)}% of ${n0(s)}`);
    }
    const model = render('a-model', 'default');
    for (const key of ['v2', 'v3'] as const) {
      expect(model).toContain(MODEL[key].s);
      for (const k of MODEL_ROWS) {
        const x = MODEL[key].cells[k];
        expect(model, `${key} ${k}`).toContain(x.due ? `${n0(x.scored)} scored · ${x.censored} censored · ${x.abstained} abstained` : `${n0(x.pending)} pending None matured`);
      }
    }
    for (const k of BASE_ROWS) expect(model).toContain(`Error ${pts(BASE[k][1])}, against the model’s ${pts(HZ[k].w[2].err)}`);
    const reg = render('a-regime', 'default');
    for (const [g, s, i] of REG.m6) expect(reg).toContain(`${g} Regime at origin ${rate(i, s)}% of ${n0(s)}`);
    const slice = render('a-slice', 'default');
    for (const [k, v] of YOURS) expect(slice).toContain(`${k} ${v}`);
    for (const [k, v] of WHY_OUT) expect(slice).toContain(`${k} ${v}`);
  });

  it('titles each screen and its info button as the design does', () => {
    const ids = { record: 'a-record', slice: 'a-slice', holding: 'a-holding', model: 'a-model', regime: 'a-regime' } as const;
    for (const [v, id] of Object.entries(ids) as [keyof typeof ids, string][]) {
      const text = render(id, 'default');
      expect(text, v).toContain(TITLES[v]);
      expect(html(id), v).toContain(`aria-label="${ABOUT[v]}"`);
    }
    for (const s of SCREENS) for (const st of STATES) expect(render(s, st).length, `${s} ${st}`).toBeGreaterThan(0);
  });
});

describe('addresses and freshness', () => {
  it('keeps the data state on every link', () => {
    expect(withState(PATHS.slice, '?data=stale')).toBe('/record/track/slice?data=stale');
    expect(withState(PATHS.record, '')).toBe('/record/track');
    expect(withState('/record', '?data=offline&x=1')).toBe('/record?data=offline');
    expect(Object.values(PATHS).every((p) => p.startsWith('/record/track'))).toBe(true);
  });

  it('keeps the price chips when only the record failed', () => {
    expect(freshFor('error')).toBe('default');
    expect(freshFor('stale')).toBeUndefined();
  });
});
