<script lang="ts">
  import type { Holding } from '#lib/data/index.ts';
  import EvChip from './EvChip.svelte';
  import Ico from './Ico.svelte';
  import Mask from './Mask.svelte';
  import Range from './Range.svelte';
  import RowLinks from './rowlinks.ts';
  import { LEDGER, TABLE, pct, plain, retCell, returnOf, type Ev } from './design.ts';
  import type { Snippet } from 'svelte';
  /**
   * The desktop's holdings, as holdings.js holdTable() draws them: one row a holding, its value, gain, return, 6-month
   * forecast on one scale and evidence. A row opens its holding; the name is the link a keyboard and a screen reader use.
   */
  let { items, stale, foot }: { items: Holding[]; stale: boolean; foot: Snippet } = $props();
  const evOf = (h: Holding): Ev => (stale && h.ticker === 'HSBA' ? ['old', 'Stale'] : (LEDGER[h.ticker]?.s ?? ['none', 'Unavailable']));
</script>

{#snippet na()}<span class="muted" aria-label="Unavailable">–</span>{/snippet}

<div class="card holdings-wide"><div class="holdings-head" style="padding-bottom:2px"><h3>{TABLE.title}</h3><span class="small muted">{TABLE.scale}</span></div><table class="ht dk"><thead><tr><th>{TABLE.head[0]}</th><th class="r">{TABLE.head[1]}</th><th class="r">{TABLE.head[2]}</th><th class="r">{TABLE.head[3]}</th><th>{TABLE.head[4]}</th><th>{TABLE.head[5]}</th></tr></thead><tbody {@attach RowLinks}>{#each items as h (h.ticker)}{@const l = LEDGER[h.ticker]}{@const r = retCell(returnOf(h.ticker, stale))}<tr data-testid="row-{h.ticker}"><td><a class="inst" href="/holdings/{h.ticker}" style="text-decoration:none;color:inherit"><span class="logo sm" style="--c:var({h.segColor})" aria-hidden="true">{h.logo}</span><div style="min-width:0"><b style="max-width:none;white-space:normal">{h.name}</b><span>{h.ticker}</span></div></a></td><td class="r" style="font-weight:600"><Mask text={`£${plain(h.value.pence).split('.')[0]}`} /></td><td class="r">{#if !l || l.gain === 'Unavailable'}{@render na()}{:else}<Mask text={l.gain.split('.')[0]!} />{/if}</td><td class="r">{#if !r}{@render na()}{:else if r.muted}<span class="muted">{r.text}</span>{:else}{r.text}{/if}</td><td>{#if h.staleAt}<span class="chip stale"><Ico id="clock" size="s14" />{TABLE.held}</span>{:else}<div style="display:flex;align-items:center;gap:6px"><span style="width:38px;color:var(--fc-ink);font-weight:600;text-align:right">{pct(h.med)}</span><span style="width:56px;display:block"><Range med={h.med} lo={h.lo} hi={h.hi} lo50={h.lo50} hi50={h.hi50} w={56} ht={14} /></span></div><div class="small muted" style="font-size:12px;line-height:16px;white-space:nowrap">{`${pct(h.lo)} to ${pct(h.hi)}`}</div>{/if}</td><td><EvChip ev={evOf(h)} /></td></tr>{/each}</tbody></table>{@render foot()}</div>
