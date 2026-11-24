<script lang="ts">
  import Icon from '#lib/components/Icon.svelte';
  import type { DataState } from '#lib/data/state.ts';
  import Chip from './Chip.svelte';
  /**
   * The state's word, said first on every screen of the journey (the design's SAY and EMPTY, one story across the journey,
   * lesson 46). Loading and error keep the last good record in view below; empty replaces it. A browser offline says what it
   * keeps and that how it protects it is unverified (MP40-Q12c). Risk and staleness are never hidden behind loading.
   */
  let { state, onretry }: { state: DataState; onretry: () => void } = $props();
</script>

{#if state === 'empty'}
  <div class="card state"><div class="sh"><span class="ic"><Icon name="target" size="s18" /></span>No forecast has been issued</div><p>The record starts with the first forecast. Each one joins as pending, and is scored once its horizon passes and every input is in. Nothing is scored before then.</p></div>
{:else if state === 'loading'}
  <div class="card state"><div class="sh"><span class="ic"><Icon name="clock" size="s18" /></span>Rebuilding the summaries</div><p>They are rebuilt from stored scores, which reproduce exactly. The last good figures, from 22:15, stay on screen meanwhile.</p></div>
{:else if state === 'error'}
  <div class="card state"><div class="sh"><span class="ic"><Icon name="alert" size="s18" /></span>The record did not load</div><p>The read failed at 21:16. These are the summaries as of 21:05 today, from stored scores. No score is lost.</p><button class="btn btn-tinted sm" type="button" onclick={onretry}><Icon name="refresh" size="s18" />Try again</button></div>
{:else if state === 'stale'}
  <div class="jbanner warn" role="status"><Icon name="clock" size="s18" /><div><b>Scores are behind.</b> Outcomes last joined 14:10, so the newest scores may be missing. HSBC last priced 14:10, past the freshness limit: its outcomes wait as pending, and a late price is never scored as a miss.</div></div><div class="track-acts"><Chip text="Settled · OWN-07" kind="owner" dot /></div>
{:else if state === 'offline'}
  <div class="jbanner" role="status"><Icon name="wifi-off" size="s18" /><div><b>Offline.</b> Showing the record from 22:15. Nothing updates until you reconnect.</div></div><div class="jkept"><span class="chip offline"><Icon name="wifi-off" size="s14" />Saved in this browser</span><span class="small muted">How a browser protects saved records is unverified.</span></div>
{/if}
