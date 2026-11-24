<script lang="ts">
  import type { Holding } from '#lib/data/index.ts';
  import type { DataState } from '#lib/data/state.ts';
  import Badge from '#lib/journal/Badge.svelte';
  import Ico from '#lib/journal/Ico.svelte';
  import { COPY, pct, settled } from '#lib/privacy-centre.ts';
  /**
   * One holding as privacy mode shows it (privacy.js masked(), Prism's hrow(h, { priv: true })): its value masked, its move,
   * range and median kept. A price past its limit marks the row late, with the settled rule (OWN-07); in Stale it is stale.
   * Offline, each row shows its age instead of its action (maskRow). The amounts here always show masked: this row shows what
   * privacy mode does. Illustrative.
   */
  let { h, state }: { h: Holding; state: DataState } = $props();
  const RMIN = -20, RMAX = 36, w = 150, ht = 16, y0 = 3, y1 = ht - 3, ym = ht / 2;
  const x = (v: number) => ((v - RMIN) / (RMAX - RMIN)) * w;
  const off = $derived(state === 'offline');
  const stale = $derived(!off && !!h.staleAt);
</script>

{#snippet range()}<div class="rangewrap"><svg class="cx" viewBox="0 0 {w} {ht}" width="100%" height={ht} preserveAspectRatio="none" role="img" aria-label="6-month forecast: median {pct(h.med)}, 80% range {pct(h.lo)} to {pct(h.hi)}" style="height:{ht}px">
    <rect x="0" y={ym - 1} width={w} height="2" rx="1" style="fill:var(--surface-3)" />
    <rect class="b80" x={x(h.lo)} y={y0} width={x(h.hi) - x(h.lo)} height={y1 - y0} rx="4" />
    <rect class="b50" x={x(h.lo50)} y={y0 + 2} width={x(h.hi50) - x(h.lo50)} height={y1 - y0 - 4} rx="3" />
    <rect x={x(0) - 0.5} y="0" width="1" height={ht} style="fill:var(--ink-2)" />
    <rect x={x(h.med) - 1.25} y={y0 - 1} width="2.5" height={y1 - y0 + 2} rx="1.25" style="fill:var(--fc-line)" />
  </svg></div>{/snippet}

<div class="hrow" class:is-stale={stale} data-mo="rise"><span class="logo" style="--c:var({h.segColor})" aria-hidden="true">{h.logo}</span><div style="min-width:0"><div class="nm">{h.name}</div><div class="tk">{h.ticker} · {h.venue}</div></div><div class="vv"><div class="val"><span class="priv">£••••</span></div>{#if stale}<span class="chg" style="color:var(--warn);font-size:12px;line-height:16px"><Ico name="clock" size="s14" />{h.staleAt}</span>{:else}<span class="chg {h.dayPct < 0 ? 'down' : 'up'}"><Ico name={h.dayPct < 0 ? 'down' : 'up'} size="fill" />{pct(h.dayPct)}</span>{/if}</div>{#if off}<div class="fl">{@render range()}<span class="fcv">{pct(h.med)} · 6M</span><span class="chip offline"><Ico name="clock" size="s14" />{COPY.saved}</span></div>{:else}<div class="fl">{@render range()}<span class="fcv">{pct(h.med)} · 6M</span><Badge action={h.action} /></div><div class="act"><Badge action={h.action} /></div>{#if stale}<div class="stalenote"><span class="chip stale"><Ico name="clock" size="s14" />{state === 'stale' ? 'Stale' : 'Late'}: last price {h.staleAt} (Yahoo)</span>{#if state !== 'stale'}<span class="chip owner" data-mo="chip"><span class="dot"></span>{settled("OWN-07")}</span>{/if}</div>{/if}{/if}</div>
