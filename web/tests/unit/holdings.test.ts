import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SAMPLE_PORTFOLIO } from '../../src/lib/data/fake';
import {
  ACCOUNTS, CLOCK, CUTOFFS, DIFF_OPEN, FIGURE, FRESH, HOLDINGS_JS, IMPORT_NOW, IMPORT_SUB, LASTGOOD_ALL, LATER, LEDGER, MEASURES, PRISM_HTML,
  RETURN_FAILED, SAY, SHELL_JS, SKEL_CHIP, SOURCES, TABLE, WATCH, WHY, WHY_TAIL, asOf, coverage, lastGood, pct, pencePart, plain, retCell,
  returnOf, signedGbp, type Ev, type Measure
} from '../../src/lib/holdings/design';

// Every figure and word the Holdings screens take from the design rather than the source is found here in its design
// file, in the place the design writes it, so none can drift (MP-205). A JavaScript source escapes its apostrophes.
const read = (p: string) => readFileSync(new URL(`../../../${p}`, import.meta.url), 'utf8').replace(/\\'/g, "'");
const holdings = read(HOLDINGS_JS);
const shell = read(SHELL_JS);
const prism = read(PRISM_HTML);
const journeys = read('docs/design/journeys/index.html');
const q = (s: string) => `'${s}'`;
const ev = ([k, t]: Ev) => `ev(${q(k)}, ${q(t)})`;

describe('the design figures are the design\'s own', () => {
  it('pins each holding\'s ledger row, whole, to its holding', () => {
    expect(Object.keys(LEDGER).sort()).toEqual(SAMPLE_PORTFOLIO.items.map((h) => h.ticker).sort());
    for (const [t, l] of Object.entries(LEDGER)) {
      const row = `${t}: { at: ${q(l.at)}, units: ${q(l.units)}, gain: ${q(l.gain)}, ret: ${q(l.ret)}, ev: [${q(l.ev[0])}, ${q(l.ev[1])}], s: [${q(l.s[0])}, ${q(l.s[1])}] }`;
      expect(holdings, t).toContain(row);
    }
  });

  it('pins every measure, in order, to its holding', () => {
    const one = (m: Measure) => {
      const why = m.rule ? `flagged(${q(m.n)}, ${m.rule[0]}(${q(m.rule[1])}))` : q(m.n);
      return `[${q(m.k)}, ${q(m.v)}, ${ev(m.s)}, ${why}]`;
    };
    for (const [t, ms] of Object.entries(MEASURES)) {
      const block = holdings.slice(holdings.indexOf(`    ${t}: [`, holdings.indexOf('const measures = h =>')));
      const at = ms.map((m) => block.indexOf(one(m)));
      expect(at.every((i) => i >= 0), `${t}: ${ms.map(one).filter((_, i) => at[i]! < 0).join('\n')}`).toBe(true);
      expect([...at].sort((a, b) => a - b), t).toEqual(at);
    }
    expect(holdings).toContain(`mRow([${q(RETURN_FAILED.k)}, ${q(RETURN_FAILED.v)}, ${ev(RETURN_FAILED.s)}, ${q(RETURN_FAILED.n)}])`);
  });

  it('pins the accounts, the reasons and the provenance to each holding', () => {
    for (const [t, rows] of Object.entries(ACCOUNTS)) {
      expect(holdings, t).toContain(`${t}: [${rows.map((r) => `[${r.map(q).join(', ')}]`).join(', ')}]`);
    }
    for (const [t, [a, b]] of Object.entries(WHY)) expect(holdings, t).toContain(`${t}: [${q(a)}, ${q(b)}]`);
    expect(holdings).toContain(`\${WHY[h.t][0]} ${WHY_TAIL}`);
    const src: Record<string, string> = { 'General account, Q3': 'gen', 'ISA statement, September': 'isa', 'India demat, September': 'ind', 'ISA statement, January 2024': 'gone' };
    for (const [name, key] of Object.entries(src)) {
      const p = Object.values(SOURCES).flat().find((s) => s[1] === name)!;
      expect(holdings, name).toContain(`${key}: [${p.map(q).join(', ')}]`);
    }
    for (const [t, ps] of Object.entries(SOURCES)) expect(holdings, t).toContain(`${t}: [${ps.map((p) => `SRC.${src[p[1]]}`).join(', ')}]`);
  });

  it('pins the run clock, the cutoffs and the providers\' freshness to the shell', () => {
    expect(shell).toContain(`const CLOCK = { ${Object.entries(CLOCK).map(([k, [a, c]]) => `${k}: [${q(a)}, ${q(c)}]`).join(', ')} };`);
    expect(shell).toContain(`const CUTOFFS = ${q(CUTOFFS)};`);
    expect(shell).toContain(`const LASTGOOD_ALL = ${q(LASTGOOD_ALL)};`);
    for (const t of [FRESH.offline, FRESH.error, FRESH.refreshing]) expect(shell, t).toContain(t);
    expect(shell).toContain(`fresh(${q(FRESH.yahoo)}, 'stale', ${q(FRESH.late)})`);
    expect(shell).toContain(`fresh(${q(FRESH.yahoo)}, 'stale', ${q(FRESH.stale)})`);
    expect(shell).toContain(`fresh(${q(FRESH.twelve)})`);
    expect(journeys).toContain(`txt = ${q(FRESH.fresh)}`);
    expect(prism).toContain(`<span class="dot"></span>${SKEL_CHIP}</span>`);
    expect(shell).toContain(`const BROWSER_UNVERIFIED = ${q(SAY.browserUnverified)};`);
    expect(shell).toContain(`${SAY.browserKept}</span>`);
  });

  it('finds every word the screens write in the holdings design', () => {
    // Words a shared helper writes are found where that helper is written: Prism's fcHead(), the page's illus(), the shell.
    const elsewhere = new Map<string, string>([
      [SAY.evaluated, prism], [SAY.median, prism], [SAY.illustrative, journeys], [SAY.browserKept, shell], [SAY.browserUnverified, shell]
    ]);
    for (const [k, v] of Object.entries(SAY)) {
      const where = elsewhere.get(v) ?? holdings;
      expect(where.includes(v), `SAY.${k}: ${v}`).toBe(true);
    }
    expect(prism).toContain(`${SAY.evaluated}</span><div class="big">`);
    expect(prism).toContain(`letter-spacing:0">${SAY.median}</span>`);
    expect(journeys).toContain(`const illus = (t = ${q(SAY.illustrative)})`);
    // the composed lines, as the design composes them
    expect(holdings).toContain(`${SAY.partialSubHead}£6,104.20${SAY.partialSubTail}`);
    expect(holdings).toContain(`${SAY.offlineOneHead}Apple${SAY.offlineOneTail}`);
    expect(holdings).toContain(`chg(1, ${q(SAY.dayMove)})`);
    expect(holdings).toContain(`${SAY.gainOn}\${partial ? '5' : '6'} of 7`);
    expect(holdings).toContain(`\${partial ? ${q(SAY.retPartial)} : ${q(SAY.ret)}}${SAY.aYear}`);
    expect(holdings).toContain("(st === 'error' ? lastH(h) : asOfH(h)).split(' · ')[0]");
    expect(holdings).toContain(`<span>${SAY.model}</span><span>${SAY.illustrative}</span>`);
    expect(holdings).toContain(`<b>${WATCH.name}</b><span>${WATCH.ticker} · 6M \${pct(${WATCH.med})}, \${pct(${WATCH.lo})} to \${pct(${WATCH.hi})}, 80% range</span>`);
    expect(holdings).toContain(`logo(${q(WATCH.color)}, ${q(WATCH.logo)}, true)`);
  });
});

describe('the desktop table and the way to Imports are the design\'s own', () => {
  it('pins the table\'s title, scale, columns and held chip', () => {
    expect(holdings).toContain(`const holdTable = (ctx, title = ${q(TABLE.title)})`);
    expect(holdings).toContain(`<span class="small muted">${TABLE.scale}</span>`);
    const [a, b, c, d, e, f] = TABLE.head;
    expect(holdings).toContain(`<th>${a}</th><th class="r">${b}</th>\${gain ? '<th class="r">${c}</th>' : ''}<th class="r">${d}</th><th>${e}</th><th>${f}</th>`);
    expect(holdings).toContain(`ic('clock', 's14')}${TABLE.held}</span>`);
  });

  it('writes a return in the table as retCell() does', () => {
    expect(holdings).toContain("{ 'No single rate': 'Not proved', 'No rate stated': 'Not stated', Withheld: 'Withheld' }");
    expect(retCell('+14.2% a year')).toEqual({ text: '+14.2%', muted: false });
    expect(retCell('No single rate')).toEqual({ text: 'Not proved', muted: true });
    expect(retCell('No rate stated')).toEqual({ text: 'Not stated', muted: true });
    expect(retCell('Withheld')).toEqual({ text: 'Withheld', muted: true });
    expect(retCell('Unavailable')).toBeNull();
  });

  it('pins the way to Imports, state by state, the titles and the one control not built yet', () => {
    for (const st of ['loading', 'error', 'stale', 'offline']) expect(holdings, st).toContain(`${st}: ${q(IMPORT_NOW[st]!)}`);
    expect(holdings).toContain(`IMPORT_NOW[st] ?? ${q(IMPORT_NOW.ready!)}, ${q(DIFF_OPEN)}`);
    expect(holdings).toContain(`const toImports = (n, t = ${q(IMPORT_SUB)})`);
    expect(holdings).toContain(`btn(${q(SAY.imports)}, 'tinted sm', 'layers')`);
    expect(holdings).toContain(`tb('eye-off', ${q(SAY.hideAmounts)})`);
    expect(holdings).toContain(`title: ctx.kind === 'web' ? ${q(SAY.oneTitle)} : h.t`);
    expect(holdings).toContain(`btn(${q(LATER.record)}, 'tinted sm')`);
  });
});

describe('figures beside their inputs are computed from them (lesson 37)', () => {
  it('counts the evidence and sums the gains as the design states them', () => {
    const all = coverage(false);
    expect([all.value, all.basis, all.gain, all.ret]).toEqual([7, 6, 6, 4]);
    expect(signedGbp(all.gainPence)).toBe('+£14,410.45');
    expect(holdings).toContain(signedGbp(all.gainPence));
    const st = coverage(true);
    expect([st.value, st.basis, st.gain, st.ret]).toEqual([6, 6, 5, 3]);
    expect(signedGbp(st.gainPence)).toBe('+£13,606.25');
    expect(holdings).toContain(signedGbp(st.gainPence));
    expect(holdings).toContain("[['Value', 6], ['Cost basis', 6], ['Gain', 5], ['Return', 3]] : [['Value', 7], ['Cost basis', 6], ['Gain', 6], ['Return', 4]]");
  });

  it('leaves HSBC out of the known value when its price is stale, to the design\'s figures', () => {
    const hsba = SAMPLE_PORTFOLIO.items.find((h) => h.ticker === 'HSBA')!;
    expect(signedGbp(SAMPLE_PORTFOLIO.total.pence - hsba.value.pence)).toBe('+£84,051.05');
    expect(signedGbp(SAMPLE_PORTFOLIO.holdings.pence - hsba.value.pence)).toBe('+£78,508.20');
    expect(holdings).toContain("val: '84,051.05', held: '78,508.20'");
  });

  it('matches the design\'s value strings to the source\'s values', () => {
    for (const h of SAMPLE_PORTFOLIO.items) {
      const v = MEASURES[h.ticker]?.find((m) => m.k === 'Value');
      if (v) expect(pencePart(v.v), h.ticker).toBe(h.value.pence);
      const acc = ACCOUNTS[h.ticker];
      if (acc) expect(acc.reduce((a, r) => a + pencePart(r[2])!, 0), h.ticker).toBe(h.value.pence);
    }
  });

  it('adds the accounts\' units to the holding\'s units', () => {
    for (const [t, rows] of Object.entries(ACCOUNTS)) {
      const n = (s: string) => Number(s.replace(/,/g, '').split(' ')[0]);
      expect(rows.reduce((a, r) => a + n(r[1]), 0), t).toBe(n(LEDGER[t]!.units));
    }
  });
});

describe('the helpers', () => {
  it('prints per cent with a sign and a true minus', () => {
    expect(pct(6.2)).toBe('+6.2%');
    expect(pct(-9.8)).toBe('−9.8%');
    expect(pct(22)).toBe('+22.0%');
  });

  it('withholds HSBC\'s return only when its price is stale', () => {
    expect(returnOf('HSBA', false)).toBe('+8.1% a year');
    expect(returnOf('HSBA', true)).toBe('Withheld');
    expect(returnOf('AAPL', true)).toBe('+14.2% a year');
  });

  it('dates a holding by its own market, and a US one by its last good run in Error', () => {
    expect(asOf('XLON')).toBe('As of 17:50 London · data cutoff 17:35');
    expect(lastGood('XNAS')).toBe('Last good run Mon 22:15 · cutoff 22:00');
    expect(lastGood('XNSE')).toBe(asOf('XNSE'));
  });

  it('finds every sum of money and count of units that hiding amounts masks, and no percentage', () => {
    const figs = (s: string) => s.split(FIGURE).filter((_, i) => i % 2 === 1);
    expect(figs('+£3,288.10 (+28.5%)')).toEqual(['+£3,288.10']);
    expect(figs('Basis £3,612.40, analytical')).toEqual(['£3,612.40']);
    expect(figs('From a snapshot of 4,200 units. Priced 10:00')).toEqual(['4,200 units']);
    expect(figs('+14.2% a year')).toEqual([]);
    expect(figs(SAY.dayMove)).toEqual(['+£1,236.18']);
  });

  it('masks whole pounds and a unit change too, as the design\'s mask() does', () => {
    const figs = (s: string) => s.split(FIGURE).filter((_, i) => i % 2 === 1);
    expect(figs('£14,820')).toEqual(['£14,820']);
    expect(figs('+£3,288 and 60 → 64 units')).toEqual(['+£3,288', '60 → 64 units']);
  });

  it('writes pence inside the pound sign, and refuses anything but whole pence', () => {
    expect(plain(1_482_050)).toBe('14,820.50');
    expect(plain(9_015_525)).toBe('90,155.25');
    expect(() => plain(1.5)).toThrow();
  });

  it('reads signed money to pence', () => {
    expect(pencePart('+£3,288.10')).toBe(328_810);
    expect(pencePart('−£1.05')).toBe(-105);
    expect(pencePart('Unavailable')).toBeNull();
  });
});
