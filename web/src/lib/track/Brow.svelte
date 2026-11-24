<script lang="ts">
  import type { Snippet } from 'svelte';
  import Calbar from './Calbar.svelte';
  import { n0, rate, showsRate } from './track.ts';
  /** The design's brow(): one breakdown row, coverage with its sample, never a hit rate without the rest. */
  type V = { word: string; sub: string } | { scored: number; inside: number };
  let { lead, name, sub, v, note = '' }: { lead?: Snippet; name: string; sub: string; v: V; note?: string } = $props();
</script>

<div class="track-br{lead ? '' : ' nolead'}">{@render lead?.()}<div class="m"><b>{name}</b><span>{sub}</span></div>{#if 'word' in v}<div class="v"><b>{v.word}</b><span>{v.sub}</span></div>{:else if !showsRate(v.scored)}<div class="v"><b>Too few</b><span>{v.scored} scored</span></div>{:else}<div class="v"><b>{rate(v.inside, v.scored)}%</b><span>of {n0(v.scored)}</span></div><Calbar r={rate(v.inside, v.scored)} label={name} />{/if}{#if note}<div class="o">{note}</div>{/if}</div>
