<script lang="ts">
  import type { Portfolio } from '#lib/data/types.ts';
  import Amount from '#lib/components/Amount.svelte';
  import Chg from './Chg.svelte';
  import { DAY_CHANGE, allocLabel, allocationOf, dayPct, dayWord, metaOf, valueOf, type DesignState } from './home.ts';
  /** The value card (home.js value(); Prism's valcard): cash in the total, its two parts beside it, then the allocation. */
  let { p, st, wide }: { p: Portfolio; st: DesignState; wide: boolean } = $props();
  const v = $derived(valueOf(p, st));
  // Ready draws the source's own shares; a state that leaves a holding out computes the shares of what is left.
  const alloc = $derived(st === 'stale' ? allocationOf(p, st) : p.allocation);
</script>

{#snippet amount(size: number)}
  <span class="amt" style="font-size:{size}px" data-testid="total"><Amount m={v.total} /></span>
{/snippet}
{#snippet day()}
  <Chg v={1}>+<Amount m={DAY_CHANGE} /> ({dayPct(v.total, DAY_CHANGE)})</Chg> <span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">{dayWord(st)}</span>
{/snippet}
{#snippet parts()}
  <div class="vparts">Holdings <Amount m={v.holdings} /> · Cash <Amount m={v.cash} /></div>
{/snippet}
{#snippet meta()}
  {#each v.out as h (h.ticker)}{h.name}, <Amount m={h.value} /> at {h.staleAt}, is left out until its price returns.{' '}{/each}{metaOf(st, p.asOf, v)}
{/snippet}
{#snippet allocation()}
  <div class="alloc" role="img" aria-label={allocLabel(alloc)}>{#each alloc as a (a.name)}<i style="--c:var({a.color});width:{a.pct}%"></i>{/each}</div>
  <div class="allocl">{#each alloc as a (a.name)}<span style="--c:var({a.color})">{a.name} <b>{a.pct}%</b></span>{/each}</div>
{/snippet}

{#if wide}
  <section class="card" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:20px;align-items:center;padding:14px 16px" aria-label={v.label}>
    <div>
      <div class="vlabel"><span class="label">{v.label}</span>{#if p.synthetic}<span class="chip illus">Illustrative</span>{/if}</div>
      <div style="margin-top:6px">{@render amount(34)}</div>
      {#if st !== 'stale'}<div style="margin-top:6px;font-size:13px;line-height:18px;letter-spacing:0;white-space:nowrap">{@render day()}</div>{/if}
      {@render parts()}
    </div>
    <div style="min-width:0"><div class="small muted" style="margin-bottom:8px">{@render meta()}</div>{@render allocation()}</div>
  </section>
{:else}
  <section class="card valcard" aria-label={v.label}>
    <div class="top"><span class="label">{v.label}</span>{#if p.synthetic}<span class="chip illus">Illustrative</span>{/if}</div>
    {@render amount(38)}
    {#if st !== 'stale'}<div class="d">{@render day()}</div>{/if}
    {@render parts()}
    <div class="meta">{@render meta()}</div>
    <div style="margin-top:14px">{@render allocation()}</div>
  </section>
{/if}

<style>
  .vlabel { display: flex; align-items: center; gap: var(--sp-8); }
</style>
