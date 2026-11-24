<script lang="ts">
  import Banner from '#lib/components/Banner.svelte';
  import type { DataState } from '#lib/data/state.ts';
  import Badge from './Badge.svelte';
  import Ico from './Ico.svelte';
  import Landed from './Landed.svelte';
  import Offline from './Offline.svelte';
  import Proof from './Proof.svelte';
  import Skel from './Skel.svelte';
  import StateCard from './StateCard.svelte';
  import Status from './Status.svelte';
  import Units from './Units.svelte';
  import { COPY, type EntryDetail } from './sample.ts';
  import type { ShownEntry } from './journal.ts';
  /**
   * One decision, viewed only: the outcome on the range you saw, what you recorded, and the evidence as you saw it, frozen
   * (the design's "One decision, scored"). Nothing here writes: adding a correction is a later step.
   */
  let { entry, state, onretry }: { entry: ShownEntry & { detail: EntryDetail }; state: DataState; onretry: () => void } = $props();
  const d = $derived(entry.detail);
  const r = $derived(entry.detail.result);
  const scored = $derived(r.kind === 'scored');
  const happened = $derived(r.kind === 'scored' && (state === 'ready' || state === 'stale' || state === 'offline') ? r.happened : undefined);
</script>

{#snippet result()}
  {#if r.kind === 'scored'}
    <div class="card fcard">
      <div class="journal-bar">
        <div class="w"><b>{r.title}</b>{r.sub}</div>
        <span class="chip"><i class={r.outcome >= r.forecast.lo && r.outcome <= r.forecast.hi ? 'lg-sc' : 'lg-miss'} aria-hidden="true"></i>{r.chip}</span>
      </div>
      <Landed forecast={r.forecast} outcome={r.outcome} />
      <div class="legend"><span><i class="lg-50"></i>50% range</span><span><i class="lg-80"></i>80% range</span><span><i class="lg-med"></i>Median</span><span><i class="lg-sc"></i>Outcome</span></div>
      <div class="journal-kv lines">{#each r.lines as [k, v] (k)}<span>{k}</span><b>{v}</b>{/each}</div>
    </div>
  {:else}
    <StateCard icon="clock" title={r.title} text={r.text}>
      {#snippet foot()}<Status outcome={entry.outcome} left={entry.left} />{/snippet}
    </StateCard>
  {/if}
{/snippet}

<div class="cols">
  <div class="col" aria-busy={state === 'loading'}>
    {#if state === 'loading'}
      {#if scored}<StateCard icon="clock" title={COPY.joining[0]} text={COPY.joining[1]} />{/if}
      <Skel n={1} />
    {:else if state === 'error'}
      {#if scored}
        <StateCard icon="alert" title={COPY.noScore[0]} text={COPY.noScore[1]}>
          <button class="btn btn-tinted sm" type="button" onclick={onretry}><Ico name="refresh" size="s18" />{COPY.noScore[2]}</button>
        </StateCard>
      {:else}
        <StateCard icon="alert" title={COPY.loadFailed[0]} text={COPY.loadFailed[1]}>
          <button class="btn btn-tinted sm" type="button" onclick={onretry}><Ico name="refresh" size="s18" />Try again</button>
        </StateCard>
        {@render result()}
      {/if}
    {:else}
      {#if state === 'stale'}
        <Banner kind="warn" icon="clock" title={COPY.behind[0]} text={COPY.behind[1]} />
        <div class="journal-acts"><span class="chip owner"><span class="dot"></span>{COPY.settled}</span></div>
      {:else if state === 'offline'}
        <Offline text={scored ? COPY.offlineOne : COPY.offline} />
      {/if}
      {@render result()}
    {/if}
    <div class="card state">
      <div class="journal-bar">
        <div class="w"><b>What you recorded</b>{d.recorded} · saved, append-only</div>
        {#if entry.differed}<span class="chip"><Ico name="split" size="s14" />Differed</span>{/if}
      </div>
      <p class="ink"><Units text={d.said} /></p>
      <p>{COPY.correction}</p>
    </div>
  </div>
  <div class="col">
    <div class="card state">
      <div class="journal-bar"><div class="w"><b>What you saw on {d.seenOn}</b>{COPY.frozen}</div><span class="chip"><Ico name="lock" size="s14" />Exact</span></div>
      <div class="journal-bar"><Badge action={entry.ranked} /><span class="chip illus">Decision support</span></div>
      <div class="journal-kv">
        {#each d.seen as [k, v] (k)}<span>{k}</span><b>{v}</b>{/each}
        <span>Model</span><b>{d.model}</b><span>Ranking policy</span><b>{d.policy}</b><span>Data cutoff</span><b>{d.cutoff}</b>
      </div>
    </div>
    {#if happened}
      <div class="card state">
        <div class="journal-bar"><div class="w"><b>What happened</b>{happened.passed}</div></div>
        <p class="ink">{happened.text}</p>
        <p>{COPY.happenedNote}</p>
      </div>
    {/if}
    <Proof cites={d.model} />
  </div>
</div>

<style>
  .cols { display: grid; gap: 12px; }
  .col { display: grid; gap: 12px; min-width: 0; align-content: start; }
  .lines { margin-top: 10px; }
  .ink { color: var(--ink); }
  @media (min-width: 1024px) { .cols { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 16px; align-items: start; } .col { gap: 14px; } }
</style>
