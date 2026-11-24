<script lang="ts">
  import { goto } from '$app/navigation';
  import type { DataState } from '#lib/data/state.ts';
  import Banner from './Banner.svelte';
  import Ico from './Ico.svelte';
  import ListCard from './ListCard.svelte';
  import Offline from './Offline.svelte';
  import Proof from './Proof.svelte';
  import Skel from './Skel.svelte';
  import StateCard from './StateCard.svelte';
  import { COPY } from './sample.ts';
  import { counts, hrefOf, sideText, type ShownEntry } from './journal.ts';
  /**
   * The journal, option A "Timeline", screen a-list (journal.js): one log, newest first, append-only, under the Record switch.
   * part names which of the frame's columns this draws: the body, or the rail beside it (below it on a phone).
   */
  let { part, state, entries, wide, search, failed = false, onretry }: {
    part: 'body' | 'rail'; state: DataState; entries: ShownEntry[]; wide: boolean; search: string; failed?: boolean; onretry: () => void;
  } = $props();
  const c = $derived(counts(entries));
  const quiet = $derived(state === 'loading' || state === 'empty');
</script>

{#snippet week()}
  <StateCard icon="clock" title={COPY.week[0]} text={COPY.week[1]} grow>{#snippet chip()}<span class="chip illus">Illustrative</span>{/snippet}</StateCard>
{/snippet}
{#snippet side()}
  <StateCard icon="split" title={COPY.sideTitle} text={sideText(c)} grow><a class="btn btn-plain sm" id="see-differed" href={hrefOf({ kind: 'differed' }, search)} style="justify-self:start;text-decoration:none;text-align:center">{COPY.sideLink}<Ico name="chev-r" size="s14" /></a></StateCard>
{/snippet}
{#snippet list()}<ListCard {entries} {search} />{/snippet}

{#if part === 'body'}
  <div data-mo="rise"><div class="segctl full" role="group" aria-label="Record" style="--n:2;--i:0"><span class="lens" aria-hidden="true"></span><button type="button" aria-pressed="true">Journal</button><button type="button" role="link" onclick={() => goto('/record/track').catch(() => location.assign('/record/track'))}>Track record</button></div></div>
  {#if failed}
    <StateCard icon="alert" title={COPY.loadFailed[0]} text="Nothing you saved is lost."><button class="btn btn-tinted sm" type="button" onclick={onretry}><Ico name="refresh" size="s18" />Try again</button></StateCard>
  {:else if state === 'loading'}
    <Skel n={5} />
  {:else if state === 'empty'}
    <StateCard icon="target" title={COPY.empty[0]} text={COPY.empty[1]}><a class="btn btn-tinted sm" href="/forecasts" style="text-decoration:none;text-align:center"><Ico name="chev-r" size="s18" />{COPY.empty[2]}</a></StateCard>
  {:else if state === 'error'}
    <StateCard icon="alert" title={COPY.loadFailed[0]} text={COPY.loadFailed[1]}><button class="btn btn-tinted sm" type="button" onclick={onretry}><Ico name="refresh" size="s18" />Try again</button></StateCard>{@render list()}
  {:else if state === 'stale'}
    <Banner kind="warn" icon="clock" title={COPY.behind[0]} text={COPY.behind[1]} /><div class="journal-acts"><span class="chip owner" data-mo="chip"><span class="dot"></span>{COPY.settled}</span></div>{@render list()}
  {:else if state === 'offline'}
    <Offline text={COPY.offline} />{@render list()}
  {:else}
    {#if !wide}{@render week()}{/if}{@render list()}
  {/if}
{:else if wide}
  {#if quiet || failed}<Proof />{:else}{@render week()}{@render side()}<Proof />{/if}
{:else if !quiet && !failed}
  {#if state !== 'ready'}{@render week()}{/if}{@render side()}
{/if}
