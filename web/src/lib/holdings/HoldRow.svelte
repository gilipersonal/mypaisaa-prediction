<script lang="ts">
  import type { Holding } from '#lib/data/index.ts';
  import { privacy } from '#lib/privacy.svelte.ts';
  import Badge from './Badge.svelte';
  import EvChip from './EvChip.svelte';
  import Hidden from './Hidden.svelte';
  import Ico from './Ico.svelte';
  import Range from './Range.svelte';
  import { LEDGER, SAY, pct, plain, returnOf, type Ev } from './design.ts';
  /**
   * One holding in the phone's list, as holdings.js holdRow() draws it: name, value and today's move, the forecast line,
   * then the return and its evidence. The whole row opens the holding.
   */
  let { h, stale }: { h: Holding; stale: boolean } = $props();
  const l = $derived(LEDGER[h.ticker]);
  const [pounds, pence] = $derived(plain(h.value.pence).split('.'));
  const ev = $derived<Ev>(stale && h.ticker === 'HSBA' ? ['old', 'Stale'] : (l?.ev ?? ['none', 'Unavailable']));
</script>

<a class="hrow holdings-row{h.staleAt ? ' is-stale' : ''}" href="/holdings/{h.ticker}" style="text-decoration:none;color:inherit" data-testid="row-{h.ticker}"><span class="logo" style="--c:var({h.segColor})" aria-hidden="true">{h.logo}</span><div style="min-width:0"><div class="nm">{h.name}</div><div class="tk">{`${h.ticker} · ${l?.at ?? h.venue}`}</div></div><div class="vv"><div class="val">{#if privacy.hidden}<Hidden />{:else}£{pounds}<span class="pp">.{pence}</span>{/if}</div>{#if h.staleAt}<span class="chg" style="color:var(--warn);font-size:12px;line-height:16px"><Ico id="clock" size="s14" />{h.staleAt}</span>{:else}<span class="chg {h.dayPct < 0 ? 'down' : 'up'}"><Ico id={h.dayPct < 0 ? 'down' : 'up'} size="fill" />{pct(h.dayPct)}</span>{/if}</div><div class="fl">{#if h.staleAt}<span class="chip stale"><Ico id="clock" size="s14" />{SAY.forecastHeld}</span><Badge act={h.action} />{:else}<div class="rangewrap"><Range med={h.med} lo={h.lo} hi={h.hi} lo50={h.lo50} hi50={h.hi50} /></div><span class="fcv">{`${pct(h.med)} · 6M`}</span><Badge act={h.action} />{/if}</div><div class="fl holdings-ret"><span>Return <b>{returnOf(h.ticker, stale)}</b></span><EvChip {ev} /></div></a>
