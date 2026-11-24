<script lang="ts">
  import type { Holding } from '#lib/data/types.ts';
  import { RMAX, RMIN, rangeLabel } from './home.ts';
  /** Prism's mini range, range(h, w, ht): the 80% and 50% bands, zero and the median, on one shared scale. */
  let { h, w = 150, ht = 16 }: { h: Holding; w?: number; ht?: number } = $props();
  const x = (v: number) => ((v - RMIN) / (RMAX - RMIN)) * w;
  const y0 = 3;
  const y1 = $derived(ht - 3);
  const ym = $derived(ht / 2);
</script>

<svg class="cx" viewBox="0 0 {w} {ht}" width="100%" height={ht} preserveAspectRatio="none" role="img" aria-label={rangeLabel(h)} style="height:{ht}px">
  <rect x="0" y={ym - 1} width={w} height="2" rx="1" style="fill:var(--surface-3)" />
  <rect class="b80" x={x(h.lo)} y={y0} width={x(h.hi) - x(h.lo)} height={y1 - y0} rx="4" />
  <rect class="b50" x={x(h.lo50)} y={y0 + 2} width={x(h.hi50) - x(h.lo50)} height={y1 - y0 - 4} rx="3" />
  <rect x={x(0) - 0.5} y="0" width="1" height={ht} style="fill:var(--ink-2)" />
  <rect x={x(h.med) - 1.25} y={y0 - 1} width="2.5" height={y1 - y0 + 2} rx="1.25" style="fill:var(--fc-line)" />
</svg>
