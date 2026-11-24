<script lang="ts">
  import { onMount } from 'svelte';
  import { MediaQuery } from 'svelte/reactivity';
  import Amount from '#lib/components/Amount.svelte';
  import { source, type Portfolio } from '#lib/data/index.ts';
  import { currentDataState } from '#lib/data/state.ts';
  import { privacy } from '#lib/privacy.svelte.ts';
  import Frame from '#lib/shell/Frame.svelte';
  import Board from '#lib/home/Board.svelte';
  import CostPill from '#lib/home/CostPill.svelte';
  import Ic from '#lib/home/Ic.svelte';
  import Later from '#lib/home/Later.svelte';
  import Ledger from '#lib/home/Ledger.svelte';
  import Rail from '#lib/home/Rail.svelte';
  import ValueCard from '#lib/home/ValueCard.svelte';
  import {
    BRIEF, EMPTY, HORIZONS, HZ_ON, LATE_RULE, LATER, SUPPORT, actsOf, boardNoteOf, designState, noteOf, pillOf, valueOf, type Note
  } from '#lib/home/home.ts';
  import { later } from '#lib/home/later.svelte.ts';

  /*
   * Home, the Portfolio place: option A "Tile board", screen a-portfolio (docs/design/journeys/src/journeys/home.js homeA),
   * drawn with the design's own markup in the shared frame. Holdings first (MP40-Q14), then the top 5 board; the month is a
   * pill in the top bar ("Pill on every Home", OWN-06); the brief takes the rail from 1024 wide and floats above the tabs on
   * a phone. Read-only: every control whose act is not built in this step (the month, search, the horizon, the brief, an
   * action's reasons, a segment's list, trying the run again, adding a holding) writes nothing and says so when pressed.
   * A holding's row opens its page.
   */
  const dataState = currentDataState();
  const st = designState(dataState);
  const empty = st === 'empty';
  const wide = new MediaQuery('min-width: 1024px', false);
  let p: Portfolio | undefined = $state();
  let failed = $state(false);

  // Read in the browser, never at build time, so no figure is baked into the static pages (MP-134). Loading keeps the last
  // good rows on screen, quieter, while the run is held; Empty reads only the segments, never a holding.
  onMount(() => {
    later.reset();
    source.portfolio().then(
      (x: Portfolio) => { p = x; },
      () => { failed = true; }
    );
  });

  const pill = $derived(pillOf(st, privacy.hidden));
  const note = noteOf(st);
  const v = $derived(p && !empty ? valueOf(p, st) : undefined);
  const late = $derived(p?.items.find((h) => !!h.staleAt));
  const boardNote = $derived(empty ? undefined : boardNoteOf(st, late));
  const held = $derived(new Set(p && !empty ? p.items.map((h) => h.ticker) : []));
  const acts = $derived(p && !empty ? actsOf(p, st) : []);
</script>

{#snippet banner(n: Note, settled = false)}<div class="jbanner {n.kind}" role="status"><Ic id={n.icon} cls="s18" /><div><b>{n.title}</b> {n.text}{#if settled}{' '}<span class="chip owner"><span class="dot"></span>{LATE_RULE}</span>{/if}</div></div>{/snippet}
{#snippet pillBtn()}<CostPill {pill} />{/snippet}
{#snippet actions()}{@render pillBtn()}<div class="search" style="width:190px"><Ic id="search" cls="s18" />Search<kbd>⌘K</kbd></div>{/snippet}
{#snippet phoneActions()}{@render pillBtn()}<button class="tbtn glass" type="button" aria-label="Search" onclick={() => later.press('search')}><Ic id="search" cls="s18" /></button><Later id="search" say={LATER.search} />{/snippet}

{#snippet holdings(p: Portfolio)}
  {#if empty}
    <div class="card state"><div class="sh"><span class="ic"><Ic id="grid" cls="s18" /></span>{EMPTY.title}</div><p>{EMPTY.text}</p><button class="btn btn-primary" type="button" onclick={() => later.press('add')}><Ic id="plus" cls="s18" />Add a holding</button><Later id="add" say={LATER.add} /></div>
  {:else}
    {#if note}{@render banner(note)}{/if}
    {#if st === 'error'}<div><button class="btn btn-tinted" type="button" onclick={() => later.press('retry')}><Ic id="refresh" cls="s18" />Try again</button><Later id="retry" say={LATER.retry} /></div>{/if}
    {#if st === 'stale' && v && late}<div class="jbanner warn" role="status"><Ic id="clock" cls="s18" /><div><b>{v.out.length} of {v.count} rows is stale.</b> {late.name} is past the freshness limit, so it leaves the total: <Amount m={v.total} /> known, {v.priced} of {v.count} priced. Its forecast stays held and its action stays {late.action} until its price returns. <span class="chip owner"><span class="dot"></span>{LATE_RULE}</span></div></div>{/if}
    {#if st === 'loading'}<div class="home-dim" aria-busy="true"><Ledger items={p.items} {st} /></div>{:else}<Ledger items={p.items} {st} />{/if}
  {/if}
{/snippet}

{#snippet body()}
  {#if failed}
    <div class="jbanner fall" role="status"><Ic id="alert" cls="s18" /><div><b>This did not load.</b> The portfolio could not be read.</div></div>
  {:else if !p}
    <div class="home-dim" aria-busy="true"></div>
  {:else}
    {#if v}<ValueCard {p} {st} />{/if}
    <div class="sech home-sech"><h3>Holdings</h3><div class="segctl" role="group" aria-label="Forecast horizon" style="--n:3;--i:{HZ_ON}"><span class="lens" aria-hidden="true"></span>{#each HORIZONS as h, i (h.s)}<button type="button" aria-pressed={i === HZ_ON} aria-label="{h.s}, {h.n}" onclick={() => { if (i !== HZ_ON) later.press('horizon'); }}>{h.s}</button>{/each}</div></div>
    <Later id="horizon" say={LATER.horizon} />
    <div class="home-sub">{SUPPORT}</div>
    {@render holdings(p)}
    {#if wide.current}<span class="home-wl"></span>{/if}
    <div class="sech home-sech"><h3>Top 5 by segment</h3></div>
    {#if boardNote}{@render banner(boardNote, st === 'stale')}{/if}
    <Board segments={p.segments} {st} wide={wide.current} {held} />
  {/if}
{/snippet}

{#snippet rail()}{#if p}<Rail {st} {acts} />{/if}{/snippet}
{#snippet accessory()}<button class="home-pill" type="button" onclick={() => later.press('brief-pill')}><Ic id="clock" cls="s18" /><span class="home-pt"><b>{BRIEF[st][0]}</b><span class="t">{BRIEF[st][1]}</span></span><Ic id="chev-r" cls="s18" /></button><Later id="brief-pill" say={LATER.brief} />{/snippet}

<Frame title="Portfolio" state={dataState} {actions} {phoneActions} {body} rail={wide.current ? rail : undefined} accessory={empty ? undefined : accessory} />
