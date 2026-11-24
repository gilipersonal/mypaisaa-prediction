<script lang="ts">
  import type { DataState } from '#lib/data/state.ts';
  import Badge from './Badge.svelte';
  import Ico from './Ico.svelte';
  import Landed from './Landed.svelte';
  import Later from './Later.svelte';
  import Offline from './Offline.svelte';
  import Proof from './Proof.svelte';
  import Skel from './Skel.svelte';
  import StateCard from './StateCard.svelte';
  import Status from './Status.svelte';
  import Units from './Units.svelte';
  import { COPY, LATER, type EntryDetail } from './sample.ts';
  import type { ShownEntry } from './journal.ts';
  /**
   * One decision, screen a-one (journal.js "One decision, scored"): the outcome on the range you saw and what you recorded in the
   * body; the evidence as you saw it, frozen, what happened and the proof in the rail. Nothing here writes: adding a correction
   * comes in a later step, and its button says so when pressed.
   */
  let { part, entry, state, wide, onretry }: {
    part: 'body' | 'rail'; entry: ShownEntry & { detail: EntryDetail }; state: DataState; wide: boolean; onretry: () => void;
  } = $props();
  const d = $derived(entry.detail);
  const r = $derived(entry.detail.result);
  const happened = $derived(r.kind === 'scored' && (state === 'ready' || state === 'offline') ? r.happened : undefined);
</script>

{#snippet result()}
  {#if r.kind === 'scored'}
    <div class="card fcard" data-mo="card"><div class="journal-bar"><div class="w"><b>{r.title}</b>{r.sub}</div><span class="chip" data-mo="chip"><i class={r.outcome >= r.forecast.lo && r.outcome <= r.forecast.hi ? 'lg-sc' : 'lg-miss'} aria-hidden="true"></i>{r.chip}</span></div>
    <Landed forecast={r.forecast} outcome={r.outcome} {wide} /><div class="legend"><span><i class="lg-50"></i>50% range</span><span><i class="lg-80"></i>80% range</span><span><i class="lg-med"></i>Median</span><span><i class="lg-sc"></i>Outcome</span></div><div style="margin-top:10px"><div class="journal-kv">{#each r.lines as [k, v] (k)}<span>{k}</span><b>{v}</b>{/each}</div></div></div>
  {:else}
    <StateCard icon="clock" title={r.title} text={r.text}>{#snippet foot()}<Status outcome={entry.outcome} left={entry.left} />{/snippet}</StateCard>
  {/if}
{/snippet}

{#if part === 'body'}
  {#if state === 'loading'}
    {#if r.kind === 'scored'}<StateCard icon="clock" title={COPY.joining[0]} text={COPY.joining[1]} />{/if}<Skel n={1} />
  {:else if state === 'error'}
    {#if r.kind === 'scored'}
      <StateCard icon="alert" title={COPY.noScore[0]} text={COPY.noScore[1]}><button class="btn btn-tinted sm" type="button" onclick={onretry}><Ico name="refresh" size="s18" />{COPY.noScore[2]}</button></StateCard>
    {:else}
      <StateCard icon="alert" title={COPY.loadFailed[0]} text={COPY.loadFailed[1]}><button class="btn btn-tinted sm" type="button" onclick={onretry}><Ico name="refresh" size="s18" />Try again</button></StateCard>{@render result()}
    {/if}
  {:else if state === 'offline'}
    <Offline text={r.kind === 'scored' ? COPY.offlineOne : COPY.offline} />{@render result()}
  {:else}
    {@render result()}
  {/if}
  <div class="card state" data-mo="card"><div class="journal-bar"><div class="w"><b>What you recorded</b>{d.recorded} · saved, append-only</div>{#if entry.differed}<span class="chip" data-mo="chip"><Ico name="split" size="s14" />Differed</span>{/if}</div><p style="color:var(--ink)"><Units text={d.said} /></p><div class="journal-acts"><Later text={LATER.correction}>{#snippet children(press)}<button class="btn btn-tinted sm" type="button" onclick={press}>Add a correction</button>{/snippet}</Later></div><p>{COPY.correction}</p></div>
{:else}
  <div class="card state" data-mo="card"><div class="journal-bar"><div class="w"><b>What you saw on {d.seenOn}</b>{COPY.frozen}</div><span class="chip" data-mo="chip"><Ico name="lock" size="s14" />Exact</span></div><div class="journal-bar"><Badge action={entry.ranked} /><span class="chip illus" data-mo="chip">Decision support</span></div><div class="journal-kv">{#each d.seen as [k, v] (k)}<span>{k}</span><b>{v}</b>{/each}<span>Model</span><b>{d.model}</b><span>Ranking policy</span><b>{d.policy}</b><span>Data cutoff</span><b>{d.cutoff}</b></div></div>
  {#if happened}<div class="card state" style="height:100%" data-mo="card"><div class="journal-bar"><div class="w"><b>What happened</b>{happened.passed}</div></div><p style="color:var(--ink)">{happened.text}</p><p>{COPY.happenedNote}</p></div>{/if}
  <Proof cites={d.model} />
{/if}
