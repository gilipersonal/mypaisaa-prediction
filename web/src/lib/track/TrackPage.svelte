<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { afterNavigate, goto } from '$app/navigation';
  import Icon from '#lib/components/Icon.svelte';
  import { source } from '#lib/data/index.ts';
  import type { Holding } from '#lib/data/types.ts';
  import { currentDataState, type DataState } from '#lib/data/state.ts';
  import Frame from '#lib/shell/Frame.svelte';
  import Brow from './Brow.svelte';
  import Chip from './Chip.svelte';
  import Counted from './Counted.svelte';
  import HzCard from './HzCard.svelte';
  import NotYet from './NotYet.svelte';
  import ReadBy from './ReadBy.svelte';
  import Say from './Say.svelte';
  import {
    BASE_ROWS, ISSUED, MODEL_ROWS, REGIME_HOW, START, WHY_OUT, YOURS, readTrack, type HoldRow, type ModelKey, type TrackSample
  } from './sample.ts';
  import { ABOUT, PATHS, TITLES, freshFor, n0, pts, showsRate, withState, type TrackView } from './track.ts';

  /*
   * The Track record, option A "Scorecard" (the owner's pick, 24 Nov 2026, MP-187): how the live forecasts did once their
   * horizons passed, and the screens its rows open. Viewing only: nothing here writes, records or trades. Every figure is the
   * design's illustrative sample, read in the browser, never at build time.
   *
   * The data state comes from the address (?data=), and loading is held until the page is pressed on, so it can be seen and
   * tested; then the record is ready. Every state but Empty keeps the record in view below the state's word.
   */
  let { view }: { view: TrackView } = $props();

  let rec: TrackSample | undefined = $state();
  let byT: Record<string, Holding> = $state({});
  let dataState: DataState = $state('loading');
  let search = $state('');
  let wide = $state(true);
  let run = 0;
  let release: (() => void) | undefined;

  const title = $derived(TITLES[view]);
  const href = (v: TrackView) => withState(PATHS[v], search);
  const back = $derived(view === 'record' ? undefined : { label: 'Track record', href: href('record') });

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

  /** Reads the record. A retry keeps what is on screen while it reads, so the button pressed keeps its focus. */
  async function read(retry = false): Promise<void> {
    const mine = ++run;
    const want = currentDataState();
    if (!retry) dataState = 'loading';
    const [r, p] = await Promise.all([readTrack(), source.portfolio()]);
    if (mine !== run) return;
    rec = r;
    byT = Object.fromEntries(p.items.map((h) => [h.ticker, h]));
    if (want === 'loading') await pressed();
    if (mine !== run) return;
    dataState = want === 'loading' ? 'ready' : want;
  }

  let readFor = '';
  afterNavigate(async ({ from }) => {
    search = location.search;
    const want = currentDataState();
    if (want !== readFor) { readFor = want; read(); }
    // Back from a screen the scorecard opens, focus returns to what was pressed to open it.
    if (view !== 'record' || !from) return;
    const was = (Object.keys(PATHS) as TrackView[]).find((v) => v !== 'record' && PATHS[v] === from.url.pathname);
    if (!was) return;
    await tick();
    document.getElementById(`track-open-${was}`)?.focus();
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

  const holdNote = (c: number, a: number) => [c ? `${c} censored: a dividend is disputed, so no score yet` : '', a ? `${a} abstained` : ''].filter(Boolean).join(' · ');
  const matured = ([, s, , c, a]: HoldRow) => s + c + a;
  const TWO = ['m3', 'm6'] as const;
  /* holding, model and regime draw no rail when nothing has been issued */
  const hasRail = $derived.by(() => !(dataState === 'empty' && (view === 'holding' || view === 'model' || view === 'regime')));
</script>

{#snippet about()}<NotYet cls="tbtn glass" label={ABOUT[view]} what="The note about this view"><Icon name="info" size="s18" /></NotYet>{/snippet}

{#snippet exploratory()}<Chip text="Exploratory" kind="proposed" />{/snippet}

{#snippet sayExploratory()}<div class="jbanner" role="status"><Icon name="info" size="s18" /><div><b>Every rate here is exploratory.</b> The live record began {START}, so no horizon has the 20 non-overlapping blocks a claim needs. Each rate shows with its sample.</div></div>{/snippet}

{#snippet recordBody(r: TrackSample)}
  {@render sayExploratory()}
  {#each [r.HZ.m3, r.HZ.m6, r.HZ.m12] as h (h.k)}<HzCard {h} {wide} variant="long" open={h.k === 'm6' ? href('slice') : undefined} openId={h.k === 'm6' ? 'track-open-slice' : undefined} />{/each}
  <div class="track-sec"><h3>Short term</h3><Chip text="Not long-term guidance" kind="illus" /></div>
  <p class="track-sub">Next day runs on rules only and 5 sessions is in practice, so neither has a live record.</p>
  {#each [r.HZ.s10, r.HZ.s20] as h (h.k)}<HzCard {h} {wide} variant="short" />{/each}
{/snippet}

{#snippet sliceBody(r: TrackSample)}
  {@const h = r.HZ.m6}
  {@const y = h.w[2]}
  <HzCard {h} {wide} variant="slice" />
  <div class="card track-card"><h4>Every 6-month forecast since {START}</h4><div class="track-kv"><span>Issued</span><b>{n0(ISSUED)}</b><span>Pending, horizon not passed</span><b>{n0(h.pending)}</b><span>Matured</span><b>{n0(y.due)}</b><span>· Scored</span><b>{n0(y.scored)}</b><span>· Censored</span><b>{y.censored}</b><span>· Abstained</span><b>{y.abstained}</b></div><p class="track-sub">Issued is pending plus matured, and matured is scored, censored and abstained. None is dropped.</p></div>
  <div class="card track-card"><h4>From your journal</h4><div class="track-kv">{#each YOURS as [k, v] (k)}<span>{k}</span><b>{v}</b>{/each}</div><p class="track-sub">Two of the {y.scored} scored. One outcome says little about a forecast; the rate above is the record.</p></div>
{/snippet}

{#snippet holdCard(r: TrackSample, k: 'm3' | 'm6')}
  {@const h = r.HZ[k]}
  <div class="card track-list"><div class="track-sec in"><h3>{h.n}</h3>{@render exploratory()}</div><p class="track-sub in">365 days · {n0(h.w[2].scored)} scored across 7 holdings · coverage of the 80% range</p>{#each r.HOLD[k] as row (row[0])}{@const x = byT[row[0]]}{#if x}<Brow name={x.name} sub="{x.ticker} · {matured(row)} matured" v={{ scored: row[1], inside: row[2] }} note={holdNote(row[3], row[4])}>{#snippet lead()}<span class="logo sm" style="--c:var({x.segColor})" aria-hidden="true">{x.logo}</span>{/snippet}</Brow>{/if}{/each}</div>
{/snippet}

{#snippet holdingBody(r: TrackSample)}
  {@render sayExploratory()}
  {@render holdCard(r, 'm3')}
  {@render holdCard(r, 'm6')}
  <p class="track-sub">12 months has nothing matured. Short-term horizons are read by horizon only.</p>
{/snippet}

{#snippet modelCard(r: TrackSample, key: ModelKey)}
  {@const m = r.MODEL[key]}
  <div class="card track-list"><div class="track-sec in"><span class="track-ic"><Icon name="cube" size="s18" /></span><h3>{m.n}</h3>{@render exploratory()}</div><p class="track-sub in">{m.s}</p>{#each MODEL_ROWS as k (k)}{@const x = m.cells[k]}{@const n = r.HZ[k].n}{#if !x.due}<Brow name={n} sub="{n0(x.pending)} pending" v={{ word: 'None', sub: 'matured' }} note={x.first ? `Nothing matured. First due ${x.first}.` : 'Nothing matured.'} />{:else}<Brow name={n} sub="{n0(x.scored)} scored · {x.censored} censored · {x.abstained} abstained{x.pending ? ` · ${n0(x.pending)} pending` : ''}" v={x} note={showsRate(x.scored) ? `Error ${pts(x.err)} · calibration ${x.cal}` : 'A rate shows from 30.'} />{/if}{/each}</div>
{/snippet}

{#snippet modelBody(r: TrackSample)}
  {@render sayExploratory()}
  {@render modelCard(r, 'v2')}
  {@render modelCard(r, 'v3')}
  <div class="card track-list"><div class="track-sec in"><span class="track-ic"><Icon name="equal" size="s18" /></span><h3>Baseline</h3>{@render exploratory()}</div><p class="track-sub in">The historical-distribution baseline, scored on exactly the same origins as the model.</p>{#each BASE_ROWS as k (k)}{@const y = r.HZ[k].w[2]}{@const b = r.BASE[k]}<Brow name={r.HZ[k].n} sub="{n0(y.scored)} scored" v={{ scored: y.scored, inside: b[0] }} note="Error {pts(b[1])}, against the model’s {pts(y.err)}" />{/each}</div>
{/snippet}

{#snippet regimeBody(r: TrackSample)}
  {@render sayExploratory()}
  {#each TWO as k (k)}
    {@const h = r.HZ[k]}
    <div class="card track-list"><div class="track-sec in"><h3>{h.n}</h3>{@render exploratory()}</div><p class="track-sub in">365 days · {n0(h.w[2].scored)} scored · coverage of the 80% range</p>{#each r.REG[k] as [g, s, i] (g)}<Brow name={g} sub="Regime at origin" v={{ scored: s, inside: i }} />{/each}</div>
  {/each}
{/snippet}

{#snippet viewBody(r: TrackSample)}
  {#if view === 'record'}{@render recordBody(r)}{:else if view === 'slice'}{@render sliceBody(r)}{:else if view === 'holding'}{@render holdingBody(r)}{:else if view === 'model'}{@render modelBody(r)}{:else}{@render regimeBody(r)}{/if}
{/snippet}

{#snippet rail()}
  {#if rec}
    {#if view === 'record'}
      {#if dataState !== 'empty'}<ReadBy hrefs={{ holding: href('holding'), model: href('model'), regime: href('regime') }} />{/if}<Counted />
    {:else if view === 'slice'}
      {#if dataState === 'empty'}<Counted />{:else}
        <div class="card track-card"><h4>Not scored, and why</h4><div class="track-kv">{#each WHY_OUT as [k, v] (k)}<span>{k}</span><b>{v}</b>{/each}</div><p class="track-sub">HSBC’s dividend is disputed, so its outcomes are not known yet; a missing input is never scored as a zero. AstraZeneca has too little comparable history for a calibrated range.</p></div>
        <div class="card track-card"><h4>Which model</h4><p class="track-sub">R2-HGB v2 made all {rec.HZ.m6.w[2].due} matured. R2-HGB v3’s first 6-month forecast matures on 1 Apr 2027; its {rec.MODEL.v3.cells.m6.pending} are pending. Later models never rewrite a score.</p></div>
      {/if}
    {:else if view === 'regime'}
      <div class="card track-card"><h4>What a regime is here</h4><p class="track-sub">{REGIME_HOW} A regime is a way to read the record, not a forecast. Censored and abstained forecasts are counted at the horizon, not by regime.</p><div class="track-acts"><Chip text="Proposed · SCI-D04" kind="proposed" /></div></div>
    {:else}
      <Counted />
    {/if}
  {/if}
{/snippet}

<Frame {title} state={dataState} fresh={freshFor(dataState)} {back} actions={about} rail={hasRail ? rail : undefined}>
  {#snippet body()}
    {#if view === 'record'}
      <div><div class="segctl full" role="group" aria-label="Record" style="--n:2;--i:1"><span class="lens" aria-hidden="true"></span><button type="button" aria-pressed="false" onclick={() => goto(withState('/record', search))}>Journal</button><button type="button" aria-pressed="true">Track record</button></div></div>
      <p class="track-sub">Live forecasts only, each scored once its horizon passed and every input was in. Walk-forward testing sits in each forecast’s Proof, labelled as testing.</p>
    {/if}
    {#if rec}
      <Say state={dataState} onretry={() => read(true)} />
      {#if dataState === 'loading'}
        <div class="track-dim" aria-busy="true">{@render viewBody(rec)}</div>
      {:else if dataState !== 'empty'}
        {@render viewBody(rec)}
      {/if}
    {/if}
  {/snippet}
</Frame>
