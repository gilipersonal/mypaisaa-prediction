<script lang="ts">
  import { onMount } from 'svelte';
  import { MediaQuery } from 'svelte/reactivity';
  import '#lib/prism/home.css';
  import PlaceLinks from '#lib/components/PlaceLinks.svelte';
  import Amount from '#lib/components/Amount.svelte';
  import { childrenOf } from '#lib/places.ts';
  import { source, type Portfolio } from '#lib/data/index.ts';
  import { currentDataState } from '#lib/data/state.ts';
  import { privacy } from '#lib/privacy.svelte.ts';
  import CostPill from '#lib/home/CostPill.svelte';
  import Holdings from '#lib/home/Holdings.svelte';
  import Ic from '#lib/home/Ic.svelte';
  import ValueCard from '#lib/home/ValueCard.svelte';
  import { EMPTY, LATE_RULE, SUPPORT, designState, freshOf, noteOf, pillOf, valueOf } from '#lib/home/home.ts';

  /*
   * Home, the Portfolio place: option A "Tile board", screen a-portfolio (docs/design/journeys/src/journeys/home.js).
   * Holdings first (MP40-Q14), the month as a pill in the top bar ("Pill on every Home", OWN-06). Read-only: the top 5
   * board, the brief, search and the horizon switch wait for the steps that bring them, so none is drawn here.
   */
  const st = designState(currentDataState());
  const wide = new MediaQuery('min-width: 1024px', false);
  let p: Portfolio | undefined = $state();
  let failed = $state(false);

  // Read in the browser, never at build time, so no figure is baked into the static pages (MP-134). Empty has no
  // holdings to read. Loading reads the last good rows and keeps them on screen, quieter, while the run is held.
  onMount(() => {
    if (st === 'empty') return;
    source.portfolio().then(
      (x: Portfolio) => { p = x; },
      () => { failed = true; }
    );
  });

  const pill = $derived(pillOf(st, privacy.hidden));
  const note = noteOf(st);
  const v = $derived(p ? valueOf(p, st) : undefined);
</script>

<header class="hh">
  <h1 class="ltitle">Portfolio</h1>
  <div class="hh-pill"><CostPill {pill} /></div>
  <div class="jfresh hh-fresh">
    {#each freshOf(st) as f (f.text)}<span class="chip {f.kind}">{#if f.icon}<Ic id={f.icon} cls="s14" />{:else}<span class="dot"></span>{/if}{f.text}</span>{/each}
  </div>
</header>

<div class="hbody">
  {#if st === 'empty'}
    <div class="sech home-sech"><h3>Holdings</h3></div>
    <div class="home-sub">{SUPPORT}</div>
    <div class="card state"><div class="sh"><span class="ic"><Ic id="grid" cls="s18" /></span>{EMPTY.title}</div><p>{EMPTY.text}</p></div>
  {:else if failed}
    <div class="jbanner fall" role="status"><Ic id="alert" cls="s18" /><div><b>This did not load.</b> The portfolio could not be read.</div></div>
  {:else if !p || !v}
    <div class="hwait" aria-busy="true"></div>
  {:else}
    <ValueCard {p} {st} wide={wide.current} />
    <div class="sech home-sech"><h3>Holdings</h3></div>
    <div class="home-sub">{SUPPORT}</div>
    {#if note}
      <div class="jbanner {note.kind}" role="status"><Ic id={note.icon} cls="s18" /><div><b>{note.title}</b> {note.text}</div></div>
    {:else if v.out.length}
      <div class="jbanner warn" role="status"><Ic id="clock" cls="s18" /><div><b>{v.out.length} of {v.count} rows is stale.</b> {#each v.out as h (h.ticker)}{h.name} is past the freshness limit, so it leaves the total: <Amount m={v.total} /> known, {v.priced} of {v.count} priced. Its forecast stays held and its action stays {h.action} until its price returns.{' '}{/each}<span class="chip owner"><span class="dot"></span>{LATE_RULE}</span></div></div>
    {/if}
    {#if st === 'loading'}
      <div class="home-dim" aria-busy="true"><Holdings items={p.items} {st} wide={wide.current} /></div>
    {:else}
      <Holdings items={p.items} {st} wide={wide.current} />
    {/if}
  {/if}
</div>

<PlaceLinks places={childrenOf('portfolio')} label="More from Portfolio" />

<style>
  /* The top bar: the title and the pill on one line (the pill wraps under a title it would cover), each market's freshness
     under them; from 1024 wide, all on one line. */
  .hh { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--sp-8) var(--sp-12); padding: var(--sp-20) 0 var(--sp-12); }
  .hh h1 { padding: 0; }
  .hh-fresh { order: 3; flex-basis: 100%; }
  .hbody { display: grid; gap: var(--sp-12); min-width: 0; }
  .hbody > :global(*) { min-width: 0; }
  .hwait { min-height: var(--tap); }
  @media (min-width: 1024px) {
    .hh-fresh { order: 2; flex: 1 1 0; justify-content: flex-end; }
    .hh-pill { order: 3; }
  }
</style>
