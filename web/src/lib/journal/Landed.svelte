<script lang="ts">
  import { landedLabel, pct } from './journal.ts';
  import type { FrozenForecast } from './sample.ts';
  /**
   * journal.js landed(): where the outcome landed on the range you saw. The design draws it 460 wide on the desktop and 326 on a
   * phone, scaled to its column. Illustrative.
   */
  let { forecast: t, outcome: out, wide }: { forecast: FrozenForecast; outcome: number; wide: boolean } = $props();
  const w = $derived(wide ? 460 : 326);
  const ht = 74, min = -25, max = 40, y0 = 30, y1 = 48;
  const x = (v: number) => 10 + ((v - min) / (max - min)) * (w - 20);
  const label = $derived(landedLabel(t, out));
</script>

<div style="margin-top:6px"><svg class="cx" viewBox="0 0 {w} {ht}" width="100%" role="img" aria-label={label}>
      <rect x="10" y="38" width={w - 20} height="2" rx="1" style="fill:var(--surface-3)" /><rect class="b80" x={x(t.lo)} y={y0} width={x(t.hi) - x(t.lo)} height={y1 - y0} rx="6" /><rect class="b50" x={x(t.lo50)} y={y0 + 3} width={x(t.hi50) - x(t.lo50)} height={y1 - y0 - 6} rx="4" />
      <rect x={x(0) - 0.5} y={y0 - 6} width="1" height={y1 - y0 + 12} style="fill:var(--ink-2)" /><rect x={x(t.med) - 1.25} y={y0 - 2} width="2.5" height={y1 - y0 + 4} rx="1.25" style="fill:var(--fc-line)" />
      <g data-mo="dot"><circle class="scd" cx={x(out)} cy="39" r="5" /><circle class="scr-ring" cx={x(out)} cy="39" r="8" /></g>
      <g data-mo="label"><text class="scl" x={x(out)} y="20" text-anchor="middle">Outcome {pct(out)}</text><text x={x(t.lo)} y="66" text-anchor="start">{pct(t.lo)}</text><text x={x(t.hi)} y="66" text-anchor="end">{pct(t.hi)}</text></g></svg></div>
