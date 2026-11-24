<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import '#lib/prism/journal.css';
  import { source } from '#lib/data/index.ts';
  import { currentDataState, type DataState } from '#lib/data/state.ts';
  import DifferedView from '#lib/journal/DifferedView.svelte';
  import EntryView from '#lib/journal/EntryView.svelte';
  import Freshness from '#lib/journal/Freshness.svelte';
  import Ico from '#lib/journal/Ico.svelte';
  import ListView from '#lib/journal/ListView.svelte';
  import { entriesFor, hrefOf, joinEntries, viewOf, type ShownEntry } from '#lib/journal/journal.ts';

  /*
   * Record holds two views, the Journal and the Track record ("A view in Record", OWN-24). This step builds the Journal, option A
   * "Timeline" (MP-158), for viewing only: the log, one decision opened, and where you differed. Recording a decision, adding a
   * correction and the Track record view come later, so nothing here offers them. MyPrediction never trades: an entry records
   * what the owner did and why, at the broker, outside the app.
   *
   * Everything is read in the browser, never at build time. The data state comes from the address (?data=), and loading is held
   * until the page is pressed on, so it can be seen and tested; then the journal is ready.
   */
  let all: ShownEntry[] = $state([]);
  let dataState: DataState = $state('loading');
  let failed = $state(false);
  let search = $state('');
  let wide = $state(false);
  let run = 0;
  let release: (() => void) | undefined;

  const entries = $derived(entriesFor(dataState, all));
  const view = $derived(viewOf(search));
  const opened = $derived.by(() => {
    if (view.kind !== 'entry') return undefined;
    const id = view.id;
    const e = entries.find((x) => x.id === id);
    return e && e.detail ? { ...e, detail: e.detail } : undefined;
  });
  const shown = $derived(view.kind === 'entry' && !opened ? ({ kind: 'list' } as const) : view);
  const title = $derived(shown.kind === 'differed' ? 'Where you differed' : opened && shown.kind === 'entry' ? opened.detail.title : 'Journal');
  const back = $derived(hrefOf({ kind: 'list' }, search));

  /** Waits for a press anywhere on the page; a later read cancels the wait. */
  function pressed(): Promise<void> {
    return new Promise((done) => {
      const go = () => { stop(); done(); };
      const stop = () => { removeEventListener('pointerdown', go); removeEventListener('keydown', go); release = undefined; };
      release?.();
      release = stop;
      addEventListener('pointerdown', go);
      addEventListener('keydown', go);
    });
  }

  /** Reads the journal. A retry keeps what is on screen while it reads, so the button pressed keeps focus if the read fails again. */
  async function read(retry = false): Promise<void> {
    const mine = ++run;
    const want = currentDataState();
    if (!retry) { dataState = 'loading'; failed = false; }
    try {
      const joined = joinEntries(await source.portfolio());
      if (mine !== run) return;
      // the entries are in hand before loading ends, so a view the design draws with them while loading (one decision, the counts) can
      all = joined;
      if (want === 'loading') await pressed();
      if (mine !== run) return;
      failed = false;
      dataState = want === 'loading' ? 'ready' : want;
    } catch {
      if (mine !== run) return;
      failed = true;
      dataState = 'error';
    }
  }

  let readFor = '';
  afterNavigate(async ({ from }) => {
    search = location.search;
    const want = currentDataState();
    if (want !== readFor) { readFor = want; read(); }
    // Back from an entry, or from where you differed, focus returns to what was pressed to open it.
    const was = from ? viewOf(from.url.search) : undefined;
    if (!was || shown.kind !== 'list' || was.kind === 'list') return;
    await tick();
    document.getElementById(was.kind === 'entry' ? `entry-${was.id}` : 'see-differed')?.focus();
  });

  onMount(() => {
    const mq = matchMedia('(min-width: 1024px)');
    const fit = () => { wide = mq.matches; };
    fit();
    mq.addEventListener('change', fit);
    const net = () => { readFor = currentDataState(); read(); };
    addEventListener('online', net);
    addEventListener('offline', net);
    return () => {
      release?.();
      mq.removeEventListener('change', fit);
      removeEventListener('online', net);
      removeEventListener('offline', net);
    };
  });
</script>

<header class="jhead">
  {#if shown.kind !== 'list'}
    <a class="jback" href={back}><Ico name="chev-l" size="s24" /><span>Journal</span></a>
  {/if}
  <h1 class="ltitle">{title}</h1>
  <Freshness state={dataState} />
</header>

{#if shown.kind === 'list'}
  <div class="switch">
    <div class="segctl full" role="group" aria-label="Record" style="--n: 2; --i: 0">
      <span class="lens" aria-hidden="true"></span>
      <button type="button" aria-pressed="true">Journal</button>
      <button type="button" aria-pressed="false" disabled aria-describedby="track-later">Track record</button>
    </div>
    <p class="small muted" id="track-later">The Track record view is not built yet.</p>
  </div>
{/if}

{#if failed}
  <div class="card state" role="alert">
    <div class="sh"><span class="ic"><Ico name="alert" size="s18" /></span>The journal did not load</div>
    <p>Nothing you saved is lost.</p>
    <button class="btn btn-tinted sm" type="button" onclick={() => read(true)}><Ico name="refresh" size="s18" />Try again</button>
  </div>
{:else if shown.kind === 'entry' && opened}
  <EntryView entry={opened} state={dataState} onretry={() => read(true)} />
{:else if shown.kind === 'differed'}
  <DifferedView state={dataState} {entries} {search} onretry={() => read(true)} />
{:else}
  <ListView state={dataState} {entries} {wide} {search} onretry={() => read(true)} />
{/if}

<style>
  .jhead { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; padding: 20px 0 12px; }
  .jhead h1 { padding: 0; flex: 1 1 100%; min-width: 0; overflow-wrap: anywhere; }
  .jback { text-decoration: none; color: var(--link); font: 400 17px/22px var(--font-text); letter-spacing: -0.01em; flex: 1 1 100%; }
  .switch { display: grid; gap: 6px; margin-bottom: 12px; }
  @media (min-width: 1024px) {
    .jhead h1 { flex: 0 1 auto; }
    .jhead :global(.jfresh) { margin-left: auto; }
  }
</style>
