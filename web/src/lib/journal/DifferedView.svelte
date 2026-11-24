<script lang="ts">
  import Banner from '#lib/components/Banner.svelte';
  import type { DataState } from '#lib/data/state.ts';
  import Ico from './Ico.svelte';
  import ListCard from './ListCard.svelte';
  import Offline from './Offline.svelte';
  import Skel from './Skel.svelte';
  import StateCard from './StateCard.svelte';
  import { COPY } from './sample.ts';
  import { counts, howDidText, partLine, type ShownEntry } from './journal.ts';
  /**
   * Where you differed: counts, not a rate, until enough have scored; how many is enough is not set. A scored outcome grades
   * the forecast, never the owner, so this view makes no claim that you or the ranking was right (the design's a-differ).
   */
  let { state, entries, search, onretry }: { state: DataState; entries: ShownEntry[]; search: string; onretry: () => void } = $props();
  const c = $derived(counts(entries));
  const differed = $derived(entries.filter((e) => e.differed));
</script>

{#snippet tally()}
  <div class="journal-ba">
    <div><span class="k">You followed</span><span class="v">{c.followed.n}</span><span class="n">{partLine(c.followed, ['scored'])}</span></div>
    <div><span class="k">You differed</span><span class="v">{c.differed.n}</span><span class="n">{partLine(c.differed, ['scored'])}</span></div>
  </div>
{/snippet}
{#snippet counted()}
  {@render tally()}
  <p class="small muted">{COPY.tooFew}</p>
  <ListCard entries={differed} {search} showDiffer={false}>
    {#snippet head()}<div class="journal-head"><h2>{differed.length} entries</h2><span class="chip illus">Illustrative</span></div>{/snippet}
  </ListCard>
{/snippet}

<div class="cols">
  <div class="col" aria-busy={state === 'loading'}>
    {#if state === 'loading'}
      {@render tally()}
      <Skel n={3} />
    {:else if state === 'empty'}
      <StateCard icon="check" title={COPY.differEmpty[0]} text={COPY.differEmpty[1]} />
    {:else}
      {#if state === 'error'}
        <StateCard icon="alert" title={COPY.differFailed[0]} text={COPY.differFailed[1]}>
          <button class="btn btn-tinted sm" type="button" onclick={onretry}><Ico name="refresh" size="s18" />Try again</button>
        </StateCard>
      {:else if state === 'stale'}
        <Banner kind="warn" icon="clock" title={COPY.differBehind[0]} text={COPY.differBehind[1]} />
      {:else if state === 'offline'}
        <Offline text={COPY.differOffline} />
      {/if}
      {@render counted()}
    {/if}
  </div>
  {#if state !== 'empty'}
    <div class="col"><StateCard icon="fan" title={COPY.howDidTitle} text={howDidText(c)} /></div>
  {/if}
</div>

<style>
  .cols { display: grid; gap: 12px; }
  .col { display: grid; gap: 12px; min-width: 0; align-content: start; }
  .journal-head h2 { font: 600 17px/22px var(--font-text); letter-spacing: -0.01em; }
  @media (min-width: 1024px) { .cols { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 16px; align-items: start; } .col { gap: 14px; } }
</style>
