<script lang="ts">
  import type { Portfolio } from '#lib/data/types.ts';
  import Amount from '#lib/components/Amount.svelte';
  import { privacy, shownMoney } from '#lib/privacy.svelte.ts';
  import Ic from './Ic.svelte';
  import Money from './Money.svelte';
  import { DAY_CHANGE, allocLabel, allocationOf, dayPct, dayWord, metaOf, valueOf, type DesignState } from './home.ts';
  /** The value card (home.js value(); Prism's valcard): cash in the total, its two parts under it, then the allocation. */
  let { p, st }: { p: Portfolio; st: DesignState } = $props();
  const v = $derived(valueOf(p, st));
  // Ready draws the source's own shares; a state that leaves a holding out computes the shares of what is left.
  const alloc = $derived(st === 'stale' ? allocationOf(p, st) : p.allocation);
  const day = $derived(dayPct(v.total, DAY_CHANGE));
</script>

{#snippet dayLine()}{#if st !== 'stale'}<span class="chg up"><Ic id="up" cls="fill" />{#if privacy.masked}+<Amount m={DAY_CHANGE} /> ({day}){:else}{`+${shownMoney(DAY_CHANGE, false)} (${day})`}{/if}</span> <span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">{dayWord(st)}</span>{/if}{/snippet}
{#snippet parts()}<div class="vparts">Holdings <Amount m={v.holdings} /> · Cash <Amount m={v.cash} /></div>{/snippet}
{#snippet meta()}{#each v.out as h (h.ticker)}{h.name}, <Amount m={h.value} /> at {h.staleAt}, is left out until its price returns. {/each}{metaOf(st, p.asOf, v)}{/snippet}
{#snippet allocation()}<div class="alloc" role="img" aria-label={allocLabel(alloc)}>{#each alloc as a (a.name)}<i style="--c:var({a.color});width:{a.pct}%"></i>{/each}</div><div class="allocl">{#each alloc as a (a.name)}<span style="--c:var({a.color})">{a.name} <b>{a.pct}%</b></span>{/each}</div>{/snippet}

<div class="card d-only" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:20px;align-items:center;padding:14px 16px"><div><div class="label">{v.label}</div><div style="margin-top:6px"><Money m={v.total} size={34} /></div><div style="margin-top:6px;font-size:13px;line-height:18px;letter-spacing:0;white-space:nowrap">{@render dayLine()}</div>{@render parts()}</div><div style="min-width:0"><div class="small muted" style="margin-bottom:8px">{@render meta()}</div>{@render allocation()}</div></div>
<div class="card valcard p-only"><div class="top"><span class="label">{v.label}</span>{#if p.synthetic}<span class="chip illus">Illustrative</span>{/if}</div><Money m={v.total} size={38} />{#if st !== 'stale'}<div class="d">{@render dayLine()}</div>{/if}{@render parts()}<div class="meta">{@render meta()}</div><div style="margin-top:14px">{@render allocation()}</div></div>
