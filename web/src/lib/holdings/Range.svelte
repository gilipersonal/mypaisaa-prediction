<script lang="ts">
  import { pct } from './design.ts';
  /** A mini 6-month forecast range on one shared scale, −20% to +36%, as the design's range() draws it. */
  let { med, lo, hi, lo50, hi50, w = 150, ht = 16 }: { med: number; lo: number; hi: number; lo50: number; hi50: number; w?: number; ht?: number } = $props();
  const RMIN = -20;
  const RMAX = 36;
  const x = (v: number) => ((v - RMIN) / (RMAX - RMIN)) * w;
  const y0 = 3;
  const y1 = $derived(ht - 3);
  const ym = $derived(ht / 2);
</script>

<svg class="cx" viewBox="0 0 {w} {ht}" width="100%" height={ht} preserveAspectRatio="none" role="img" aria-label="6-month forecast: median {pct(med)}, 80% range {pct(lo)} to {pct(hi)}" style="height:{ht}px">
  <rect x="0" y={ym - 1} width={w} height="2" rx="1" style="fill:var(--surface-3)" />
  <rect class="b80" x={x(lo)} y={y0} width={x(hi) - x(lo)} height={y1 - y0} rx="4" />
  <rect class="b50" x={x(lo50)} y={y0 + 2} width={x(hi50) - x(lo50)} height={y1 - y0 - 4} rx="3" />
  <rect x={x(0) - 0.5} y="0" width="1" height={ht} style="fill:var(--ink-2)" />
  <rect x={x(med) - 1.25} y={y0 - 1} width="2.5" height={y1 - y0 + 2} rx="1.25" style="fill:var(--fc-line)" />
</svg>
