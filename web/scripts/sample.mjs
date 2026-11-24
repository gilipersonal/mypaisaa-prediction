// The app's sample data is the approved designs' own: Prism's holdings, segments, top-fives and allocation, read from
// docs/design/prism/index.html at build time, never copied by hand (MP-205). The figures are illustrative and synthetic.
// Writes src/lib/data/sample.generated.json (git-ignored). Fails closed if the block cannot be found or read.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

/** "14,820.50" to whole pence, exactly. @param {string} s @returns {number} */
export function pence(s) {
  const m = /^(\d{1,3}(?:,\d{3})*)\.(\d{2})$/.exec(s);
  if (!m || m[1] === undefined || m[2] === undefined) throw new Error(`sample: ${s} is not a money figure`);
  return Number(m[1].replace(/,/g, '')) * 100 + Number(m[2]);
}

/** @param {string} prism @returns {Record<string, unknown>} */
export function sampleFrom(prism) {
  const start = prism.indexOf('const SEG = {');
  const endLine = prism.indexOf('const ALLOC = [', start);
  const end = prism.indexOf('\n', endLine);
  if (start < 0 || endLine < 0 || end < 0) throw new Error('sample: Prism no longer holds const SEG ... const ALLOC');
  /** @type {{ out?: any }} */
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(`${prism.slice(start, end)}\nthis.out = { SEG, H, T5, ALLOC };`, ctx, { timeout: 2000 });
  const { SEG, H, T5, ALLOC } = ctx.out;
  const holdings = H.map((/** @type {any} */ h) => ({
    name: h.n, ticker: h.t, venue: h.v, value: { pence: pence(h.val), currency: 'GBP' }, dayPct: h.day,
    med: h.med, lo: h.lo, hi: h.hi, lo50: h.lo50, hi50: h.hi50, action: h.act, segColor: h.c, logo: h.lg,
    ...(h.stale ? { staleAt: h.stale } : {})
  }));
  return {
    source: 'docs/design/prism/index.html (const SEG ... const ALLOC)',
    synthetic: true,
    segments: SEG,
    holdings,
    topFives: T5,
    allocation: ALLOC.map((/** @type {any[]} */ [name, color, pct]) => ({ name, color, pct: String(pct) }))
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const web = join(dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const out = sampleFrom(readFileSync(join(web, '..', 'docs', 'design', 'prism', 'index.html'), 'utf8'));
    writeFileSync(join(web, 'src', 'lib', 'data', 'sample.generated.json'), JSON.stringify(out, null, 1) + '\n');
    console.log(`sample: ${/** @type {unknown[]} */ (out.holdings).length} holdings read from Prism`);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(2);
  }
}
