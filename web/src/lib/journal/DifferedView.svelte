<script lang="ts">
  import type { DataState } from '#lib/data/state.ts';
  import Banner from './Banner.svelte';
  import Ico from './Ico.svelte';
  import ListCard from './ListCard.svelte';
  import Offline from './Offline.svelte';
  import Roll from './Roll.svelte';
  import Skel from './Skel.svelte';
  import StateCard from './StateCard.svelte';
  import { COPY } from './sample.ts';
  import { counts, howDidText, partLine, type ShownEntry } from './journal.ts';
  /**
   * Where you differed, screen a-differ (journal.js): counts, not a rate, until enough have scored; how many is enough is not set.
   * A scored outcome grades the forecast, never the owner, so this view makes no claim that you or the ranking was right.
   */
  let { part, state, entries, search, onretry }: { part: 'body' | 'rail'; state: DataState; entries: ShownEntry[]; search: string; onretry: () => void } = $props();
  const c = $derived(counts(entries));
  const differed = $derived(entries.filter((e) => e.differed));
</script>

{#snippet tally()}<div class="journal-ba"><div data-mo="card"><span class="k">You followed</span><span class="v"><Roll v={String(c.followed.n)} /></span><span class="n">{partLine(c.followed, ['scored'])}</span></div><div data-mo="card"><span class="k">You differed</span><span class="v"><Roll v={String(c.differed.n)} /></span><span class="n">{partLine(c.differed, ['scored'])}</span></div></div>{/snippet}
{#snippet counted()}
  {@render tally()}<p class="small muted">{COPY.tooFew}</p>
  <ListCard entries={differed} {search} showDiffer={false}>{#snippet head()}<div class="journal-head"><h3>{differed.length} entries</h3><span class="chip illus">Illustrative</span></div>{/snippet}</ListCard>
{/snippet}

{#if part === 'body'}
  {#if state === 'loading'}
    {@render tally()}<Skel n={3} />
  {:else if state === 'empty'}
    <StateCard icon="check" title={COPY.differEmpty[0]} text={COPY.differEmpty[1]} />
  {:else if state === 'error'}
    <StateCard icon="alert" title={COPY.differFailed[0]} text={COPY.differFailed[1]}><button class="btn btn-tinted sm" type="button" onclick={onretry}><Ico name="refresh" size="s18" />Try again</button></StateCard>{@render counted()}
  {:else if state === 'stale'}
    <Banner kind="warn" icon="clock" title={COPY.differBehind[0]} text={COPY.differBehind[1]} />{@render counted()}
  {:else if state === 'offline'}
    <Offline text={COPY.differOffline} />{@render counted()}
  {:else}
    {@render counted()}
  {/if}
{:else if state !== 'empty'}
  <StateCard icon="fan" title={COPY.howDidTitle} text={howDidText(c)} grow />
{/if}
