<script lang="ts">
  import type { Holding } from '#lib/data/types.ts';
  import Amount from '#lib/components/Amount.svelte';
  import Badge from './Badge.svelte';
  import Chg from './Chg.svelte';
  import Ic from './Ic.svelte';
  import Range from './Range.svelte';
  import { LATE_RULE, OUT_NOTE, ccyOf, dayWord, flagText, pct, stamp, type DesignState } from './home.ts';
  /**
   * The holdings as Home draws them (home.js hRow on a phone, ledgerDesk from 1024 wide). Each row's name opens that
   * holding and reaches across the row; the range, the action and the flags are read, never pressed.
   */
  let { items, st, wide }: { items: Holding[]; st: DesignState; wide: boolean } = $props();
  const href = (h: Holding) => `/holdings/${encodeURIComponent(h.ticker)}`;
  const flagged = $derived(items.filter((h) => !!h.staleAt));
</script>

{#snippet flag(h: Holding)}
  <span class="chip stale"><Ic id="clock" cls="s14" />{flagText(h, st)}</span>{#if st === 'stale'}<span class="home-sub">{OUT_NOTE}</span>{/if}<span class="chip owner"><span class="dot"></span>{LATE_RULE}</span>
{/snippet}
{#snippet late(h: Holding, phone: boolean)}
  <span class="chg" style={phone ? 'color:var(--warn);font-size:12px;line-height:16px' : 'color:var(--warn)'}><Ic id="clock" cls="s14" />{stamp(h, st).t}</span>
{/snippet}

{#if wide}
  <div class="card">
    <table class="ht dk">
      <thead><tr><th>Instrument</th><th class="r">Value, {dayWord(st)}</th><th>6-month forecast</th><th>Action</th><th>Data</th></tr></thead>
      <tbody>
        {#each items as h (h.ticker)}
          {@const s = stamp(h, st)}
          <tr>
            <td><a class="home-rowbtn" href={href(h)}><span class="inst"><span class="logo sm" style="--c:var({h.segColor})" aria-hidden="true">{h.logo}</span><span class="home-nm"><b>{h.name}</b><span>{h.ticker} · {ccyOf(h)}</span></span></span></a></td>
            <td class="r"><div style="font-weight:600"><Amount m={h.value} /></div>{#if h.staleAt}{@render late(h, false)}{:else}<Chg v={h.dayPct} />{/if}</td>
            <td><div style="display:flex;align-items:center;gap:6px"><span style="width:40px;color:var(--fc-ink);font-weight:600;text-align:right">{pct(h.med)}</span><span style="width:70px;display:block"><Range {h} w={70} ht={14} /></span></div><div class="small muted" style="padding-left:46px;font-size:12px;line-height:16px">{pct(h.lo)} to {pct(h.hi)}</div></td>
            <td><Badge a={h.action} /></td>
            <td><div class="small" style="font-size:12px;line-height:16px">{s.t}<div class="muted">{s.who}{h.staleAt ? ` · ${st === 'stale' ? 'stale' : 'late'}` : ''}</div></div></td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if flagged.length}<div class="t5foot home-flag">{#each flagged as h (h.ticker)}{@render flag(h)}{/each}</div>{/if}
  </div>
{:else}
  <div class="list card" style="margin:0">
    {#each items as h (h.ticker)}
      {@const s = stamp(h, st)}
      <div class="hrow" class:is-stale={!!h.staleAt}>
        <span class="logo" style="--c:var({h.segColor})" aria-hidden="true">{h.logo}</span>
        <a class="home-rowbtn" href={href(h)} style="min-width:0"><div class="nm">{h.name}</div><div class="tk home-tk">{h.ticker} · {ccyOf(h)} · {s.who} {s.t}</div></a>
        <div class="vv"><div class="val"><Amount m={h.value} /></div>{#if h.staleAt}{@render late(h, true)}{:else}<Chg v={h.dayPct} />{/if}</div>
        <div class="fl"><div class="rangewrap"><Range {h} /></div><span class="fcv">{pct(h.med)} · 6M</span><Badge a={h.action} /></div>
        {#if h.staleAt}<div class="stalenote home-flag">{@render flag(h)}</div>{/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  /* the row's name is a link, so it drops a link's underline and colour; the rest is the design's */
  .home-rowbtn { text-decoration: none; }
</style>
