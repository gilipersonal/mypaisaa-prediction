<script lang="ts">
  import Banner from '#lib/components/Banner.svelte';
  import type { DataState } from '#lib/data/state.ts';
  import Ico from './Ico.svelte';
  import ListCard from './ListCard.svelte';
  import Offline from './Offline.svelte';
  import Proof from './Proof.svelte';
  import Skel from './Skel.svelte';
  import StateCard from './StateCard.svelte';
  import { COPY } from './sample.ts';
  import { counts, hrefOf, sideText, type ShownEntry } from './journal.ts';
  /**
   * The journal, option A "Timeline" (MP-158): one log, newest first, append-only. A mark shows where you differed from the
   * ranking. On a phone this week's wrap-up leads; from 1024 wide it sits beside the log with the ranking card and the proof.
   */
  let { state, entries, wide, search, onretry }: { state: DataState; entries: ShownEntry[]; wide: boolean; search: string; onretry: () => void } = $props();
  const c = $derived(counts(entries));
  const listed = $derived(state !== 'loading' && state !== 'empty');
</script>

{#snippet week()}
  <StateCard icon="clock" title={COPY.week[0]} text={COPY.week[1]}>{#snippet chip()}<span class="chip illus">Illustrative</span>{/snippet}</StateCard>
{/snippet}
{#snippet side()}
  <StateCard icon="split" title={COPY.sideTitle} text={sideText(c)}>
    <a class="btn btn-plain sm" id="see-differed" href={hrefOf({ kind: 'differed' }, search)}>{COPY.sideLink}<Ico name="chev-r" size="s14" /></a>
  </StateCard>
{/snippet}

<div class="cols">
  <div class="col" aria-busy={state === 'loading'}>
    {#if state === 'loading'}
      <Skel n={5} />
    {:else if state === 'empty'}
      <StateCard icon="target" title={COPY.empty[0]} text={COPY.empty[1]}>
        <a class="btn btn-tinted sm" href="/forecasts"><Ico name="chev-r" size="s18" />{COPY.empty[2]}</a>
      </StateCard>
    {:else}
      {#if state === 'error'}
        <StateCard icon="alert" title={COPY.loadFailed[0]} text={COPY.loadFailed[1]}>
          <button class="btn btn-tinted sm" type="button" onclick={onretry}><Ico name="refresh" size="s18" />Try again</button>
        </StateCard>
      {:else if state === 'stale'}
        <Banner kind="warn" icon="clock" title={COPY.behind[0]} text={COPY.behind[1]} />
        <div class="journal-acts"><span class="chip owner"><span class="dot"></span>{COPY.settled}</span></div>
      {:else if state === 'offline'}
        <Offline text={COPY.offline} />
      {/if}
      {#if !wide && state === 'ready'}{@render week()}{/if}
      <ListCard {entries} {search} />
    {/if}
  </div>
  {#if wide || listed}
    <div class="col">
      {#if listed && (wide || state !== 'ready')}{@render week()}{/if}
      {#if listed}{@render side()}{/if}
      {#if wide}<Proof />{/if}
    </div>
  {/if}
</div>

<style>
  .cols { display: grid; gap: 12px; }
  .col { display: grid; gap: 12px; min-width: 0; align-content: start; }
  @media (min-width: 1024px) { .cols { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 16px; align-items: start; } .col { gap: 14px; } }
</style>
