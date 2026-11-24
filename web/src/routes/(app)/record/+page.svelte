<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { MediaQuery } from 'svelte/reactivity';
  import { afterNavigate } from '$app/navigation';
  import { source } from '#lib/data/index.ts';
  import { currentDataState, type DataState } from '#lib/data/state.ts';
  import DifferedView from '#lib/journal/DifferedView.svelte';
  import EntryView from '#lib/journal/EntryView.svelte';
  import Frame from '#lib/shell/Frame.svelte';
  import Ico from '#lib/journal/Ico.svelte';
  import Later from '#lib/journal/Later.svelte';
  import ListView from '#lib/journal/ListView.svelte';
  import { LATER } from '#lib/journal/sample.ts';
  import { entriesFor, hrefOf, joinEntries, viewOf, type ShownEntry } from '#lib/journal/journal.ts';

  /*
   * Record holds two views, the Journal and the Track record ("A view in Record", OWN-24). This is the Journal, option A
   * "Timeline" (MP-158), drawn as its design draws it (docs/design/journeys/src/journeys/journal.js): the log (a-list), one
   * decision opened (a-one) and where you differed (a-differ). Viewing only: Record a decision, Add a correction and the info
   * buttons are drawn as designed and say, when pressed, that their act comes in a later step. MyPrediction never trades.
   *
   * Everything is read in the browser, never at build time. The data state comes from the address (?data=), and loading is held
   * until the page is pressed on, so it can be seen and tested; then the journal is ready.
   */
  let all: ShownEntry[] = $state([]);
  let dataState: DataState = $state('loading');
  let failed = $state(false);
  let search = $state('');
  const wideQ = new MediaQuery('min-width: 1024px', false);
  const wide = $derived(wideQ.current);
  let run = 0;
  let release: (() => void) | undefined;

  const entries = $derived(entriesFor(dataState, all));
  const view = $derived(viewOf(search));
  // one decision keeps its entry in every state: the design's Empty for it is a decision still waiting for its horizon
  const opened = $derived.by(() => {
    if (view.kind !== 'entry') return undefined;
    const id = view.id;
    const e = all.find((x) => x.id === id);
    return e && e.detail ? { ...e, detail: e.detail } : undefined;
  });
  const shown = $derived(view.kind === 'entry' && !opened ? ({ kind: 'list' } as const) : view);
  const title = $derived(shown.kind === 'differed' ? 'Where you differed' : opened && shown.kind === 'entry' ? opened.detail.title : 'Journal');
  const back = $derived(hrefOf({ kind: 'list' }, search));
  const hasRail = $derived(
    shown.kind === 'entry' ? true
      : shown.kind === 'differed' ? dataState !== 'empty'
      : wide || (!failed && dataState !== 'loading' && dataState !== 'empty')
  );

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
    const net = () => { readFor = currentDataState(); read(); };
    addEventListener('online', net);
    addEventListener('offline', net);
    return () => {
      release?.();
      removeEventListener('online', net);
      removeEventListener('offline', net);
    };
  });
</script>

{#snippet record()}<Later text={LATER.record}>{#snippet children(press)}<button class="btn btn-tinted sm" type="button" onclick={press}><Ico name="plus" size="s18" />Record a decision</button>{/snippet}</Later>{/snippet}
{#snippet recordTb()}<Later text={LATER.record}>{#snippet children(press)}<button class="tbtn glass" type="button" aria-label="Record a decision" onclick={press}><Ico name="plus" size="s18" /></button>{/snippet}</Later>{/snippet}
{#snippet about()}<Later text={LATER.about}>{#snippet children(press)}<button class="tbtn glass" type="button" aria-label={shown.kind === 'entry' ? 'About this score' : 'About this view'} onclick={press}><Ico name="info" size="s18" /></button>{/snippet}</Later>{/snippet}

{#snippet body()}
  {#if shown.kind === 'entry' && opened}
    <EntryView part="body" entry={opened} state={dataState} {wide} onretry={() => read(true)} />
  {:else if shown.kind === 'differed'}
    <DifferedView part="body" state={dataState} {entries} {search} onretry={() => read(true)} />
  {:else}
    <ListView part="body" state={dataState} {entries} {wide} {search} {failed} onretry={() => read(true)} />
  {/if}
{/snippet}
{#snippet rail()}
  {#if shown.kind === 'entry' && opened}
    <EntryView part="rail" entry={opened} state={dataState} {wide} onretry={() => read(true)} />
  {:else if shown.kind === 'differed'}
    <DifferedView part="rail" state={dataState} {entries} {search} onretry={() => read(true)} />
  {:else}
    <ListView part="rail" state={dataState} {entries} {wide} {search} {failed} onretry={() => read(true)} />
  {/if}
{/snippet}

<Frame {title} state={dataState} fresh={dataState === 'error' ? 'default' : undefined} back={shown.kind === 'list' ? undefined : { label: 'Journal', href: back }} actions={shown.kind === 'list' ? record : about} phoneActions={shown.kind === 'list' ? recordTb : about} {body} rail={hasRail ? rail : undefined} />
