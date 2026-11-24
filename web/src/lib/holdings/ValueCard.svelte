<script lang="ts">
  import EvChip from './EvChip.svelte';
  import Ico from './Ico.svelte';
  import Mask from './Mask.svelte';
  import Money from './Money.svelte';
  import { SAY } from './design.ts';
  /**
   * The portfolio's value, as holdings.js valueCard() draws it: the total with its two parts, how fresh it is, and the gain
   * and return on the holdings that support them. Partial when a stale price leaves the total (partialCard()).
   */
  let { size, label, partial = false, total, held, cash, sub, meta, gainOf, gain, retOf, ret }: {
    size: number; label: string; partial?: boolean; total: string; held: string; cash: string;
    sub?: string; meta: string; gainOf: string; gain: string; retOf: string; ret: string;
  } = $props();
</script>

<div class="card valcard" data-testid="value-card"><div class="top"><span class="label">{label}</span>{#if partial}<EvChip ev={['part', SAY.partial]} />{:else}<span class="chip illus">{SAY.illustrative}</span>{/if}</div><Money v={total} {size} />{#if sub}<div class="d" style="font-size:13px;line-height:18px;letter-spacing:0"><span class="muted"><Mask text={sub} /></span></div>{:else}<div class="d"><span class="chg up"><Ico id="up" size="fill" /><Mask text={SAY.dayMove} /></span><span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">{SAY.today}</span></div>{/if}<div class="vparts"><Mask text={`Holdings £${held} · Cash £${cash}`} /></div><div class="meta">{meta}</div><div class="holdings-two"><div><span>{gainOf}</span><b data-testid="gain"><Mask text={gain} /></b></div><div><span>{retOf}</span><b>{ret}</b></div></div></div>
