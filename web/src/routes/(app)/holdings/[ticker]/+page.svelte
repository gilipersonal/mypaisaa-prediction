<script lang="ts">
  // One holding, option A "Review desk" (docs/design/journeys/src/journeys/holdings.js, screen a-one; MP-205). Viewing
  // only: the design's Record decision is a write and arrives in a later step. Read in the browser, never at build time.
  import '#lib/prism/holdings.css';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { source, type Holding } from '#lib/data/index.ts';
  import { currentDataState, type DataState } from '#lib/data/state.ts';
  import Head from '#lib/holdings/Head.svelte';
  import Fresh from '#lib/holdings/Fresh.svelte';
  import Money from '#lib/holdings/Money.svelte';
  import Masked from '#lib/holdings/Masked.svelte';
  import Range from '#lib/holdings/Range.svelte';
  import Badge from '#lib/holdings/Badge.svelte';
  import EvChip from '#lib/holdings/EvChip.svelte';
  import RuleChip from '#lib/holdings/RuleChip.svelte';
  import Ico from '#lib/holdings/Ico.svelte';
  import Skel from '#lib/holdings/Skel.svelte';
  import { ACCOUNTS, CLOCK, FRESH, LEDGER, MEASURES, RETURN_FAILED, SAY, SOURCES, WHY, WHY_TAIL, asOf, lastGood, pct, type Measure } from '#lib/holdings/design.ts';

  const ticker = $derived(page.params.ticker ?? '');
  let ds = $state<DataState>('loading');
  let h: Holding | undefined = $state();
  let read = $state(false);
  let failed = $state(false);

  async function load(): Promise<void> {
    failed = false;
    try {
      h = (await source.portfolio()).items.find((x: Holding) => x.ticker === ticker);
      read = true;
    } catch {
      failed = true;
    }
  }

  onMount(() => {
    ds = currentDataState();
    void load();
  });

  const stale = $derived(ds === 'stale');
  const l = $derived(LEDGER[ticker]);
  const late = $derived(!!h?.staleAt);
  /**
   * The measures as this state leaves them true. HSBC's drawn measures are the stale ones (it leaves the total); while its
   * price is late but inside the limit it stays in the total, so its value says that, under the same rule (OWN-07). In
   * Error only the return fails its check.
   */
  const measures = $derived.by((): Measure[] | undefined => {
    const m = MEASURES[ticker];
    if (!m) return undefined;
    let rows = m;
    if (ticker === 'HSBA' && !stale && l) {
      const price = ['old', `Price ${h?.staleAt ?? ''}`] as const;
      rows = [{ ...m[0]!, s: price, n: SAY.late }, m[1]!, { ...m[2]!, s: price }, { k: m[3]!.k, v: l.ret, s: price, n: '' }];
    }
    return ds === 'error' ? [...rows.slice(0, 3), RETURN_FAILED] : rows;
  });
  const accounts = $derived(ACCOUNTS[ticker]);
  const accountReturn = (r: string) => (ds === 'error' ? SAY.notShown : ticker === 'HSBA' && !stale ? (l?.ret ?? r) : r);
  const clock = $derived(CLOCK[h?.venue ?? 'XNAS'] ?? CLOCK.XNAS!);
  const meta = $derived(!h ? '' : ds === 'loading' ? SAY.refreshing : ds === 'offline' ? SAY.oneFrom : ds === 'error' ? lastGood(h.venue) : asOf(h.venue));
  const fcAsOf = $derived(!h ? '' : (ds === 'error' ? lastGood(h.venue) : asOf(h.venue)).split(' · ')[0]);
  const why = $derived(WHY[ticker]);
  const sources = $derived(SOURCES[ticker]);
</script>

<Head title={ticker} back="Holdings" backTo="/holdings" />

<div class="desk" aria-busy={!read && !failed && ds !== 'empty'}>
  <div class="upper">
    <Fresh state={ds} />
    {#if ds === 'offline' && h}
      <div class="jbanner" role="status"><Ico id="wifi-off" size="s18" /><div><b>{SAY.offlineTitle}</b> {SAY.offlineOneHead}{h.name}{SAY.offlineOneTail}</div></div>
      <div class="jkept"><span class="chip offline"><Ico id="wifi-off" size="s14" />{SAY.browserKept}</span><span class="small muted">{SAY.browserUnverified}</span></div>
    {/if}
  </div>

  {#if ds === 'empty'}
    <section class="card state wide" aria-labelledby="empty-h">
      <h2 class="sh" id="empty-h"><span class="ic"><Ico id="grid" size="s18" /></span>{SAY.emptyTitle}</h2>
      <p>{SAY.empty}</p>
      <a class="btn btn-primary sm" href="/imports"><Ico id="chev-r" size="s18" />{SAY.goImports}</a>
    </section>
  {:else if failed}
    <section class="card state wide" aria-labelledby="fail-h">
      <h2 class="sh" id="fail-h"><span class="ic"><Ico id="info" size="s18" /></span>This holding could not be read.</h2>
      <button class="btn btn-tinted sm" type="button" onclick={load}><Ico id="refresh" size="s18" />{SAY.tryAgain}</button>
    </section>
  {:else if !read}
    <div class="body"><Skel n={3} /></div>
  {:else if !h || !l}
    <section class="card state wide" aria-labelledby="none-h">
      <h2 class="sh" id="none-h"><span class="ic"><Ico id="info" size="s18" /></span>{ticker} is not in your holdings.</h2>
      <a class="btn btn-tinted sm" href="/holdings">Back to Holdings</a>
    </section>
  {:else}
    <div class="body">
      <section class="card valcard" aria-labelledby="one-h" data-testid="holding-card">
        <div class="holdings-bar">
          <span class="logo" style="--c:var({h.segColor})" aria-hidden="true">{h.logo}</span>
          <div class="w"><h2 class="name" id="one-h">{h.name}</h2>{h.ticker} · {h.venue} · <Masked text={l.units} /></div>
          <span class="chip illus">{SAY.illustrative}</span>
        </div>
        <p class="fig"><Money m={h.value} size={40} /></p>
        <div class="d">
          {#if h.staleAt}
            <span class="chg late"><Ico id="clock" size="s14" />{SAY.lastPrice}{h.staleAt}</span>
          {:else}
            <span class="chg {h.dayPct < 0 ? 'down' : 'up'}"><Ico id={h.dayPct < 0 ? 'down' : 'up'} size="fill" />{pct(h.dayPct)}</span><span class="muted sub">{SAY.today}</span>
          {/if}
        </div>
        <div class="meta">{meta}</div>
      </section>

      {#if measures}
        {#if ds === 'loading'}
          <Skel n={3} />
        {:else}
          <section class="card meas" aria-labelledby="m-h">
            {#if ds !== 'error'}<div class="holdings-head"><h3 id="m-h">{SAY.coverageTitle}</h3></div>{:else}<h3 class="sr" id="m-h">{SAY.coverageTitle}</h3>{/if}
            {#each measures as m (m.k)}
              <div class="holdings-m">
                <span class="k">{m.k}</span>
                <span class="v">{#if m.k === 'Value'}<Money m={h.value} pp />{:else}<Masked text={m.v} />{/if}</span>
                <span class="s"><EvChip ev={m.s} /></span>
                {#if m.n}<span class="n">{#if m.rule}<span class="holdings-late flush"><span><Masked text={m.n} /></span><RuleChip rule={m.rule} /></span>{:else}<Masked text={m.n} />{/if}</span>{/if}
              </div>
            {/each}
          </section>
        {/if}
      {/if}

      {#if ticker === 'NIFTYBEES'}
        <section class="card state" aria-labelledby="snap-h">
          <h2 class="sh" id="snap-h"><span class="ic"><Ico id="layers" size="s18" /></span>{SAY.snapshotTitle}</h2>
          <p>{SAY.snapshot}</p>
          <a class="btn btn-tinted sm" href="/imports"><Ico id="chev-r" size="s18" />{SAY.goImports}</a>
        </section>
      {/if}

      {#if ds === 'error' && measures}
        <section class="card state" aria-labelledby="fail1-h">
          <h2 class="sh" id="fail1-h"><span class="ic"><Ico id="alert" size="s18" /></span>{SAY.oneFailedTitle}</h2>
          <p>{SAY.oneFailed}</p>
        </section>
      {/if}

      {#if accounts}
        <section class="card acc" aria-labelledby="acc-h">
          <div class="holdings-head"><h3 id="acc-h">{SAY.inAccounts}</h3></div>
          {#each accounts as [n, u, v, b, r] (n)}
            <div class="holdings-m">
              <span class="k">{n} · <Masked text={u} /></span>
              <span class="v"><Masked text={v} /></span>
              <span class="r2">{accountReturn(r)}</span>
              <span class="n"><Masked text={b} /></span>
            </div>
          {/each}
        </section>
      {/if}
    </div>

    <div class="rail">
      {#if h.staleAt}
        <section class="card state" aria-labelledby="fc-h">
          <h2 class="sh" id="fc-h"><span class="ic"><Ico id="clock" size="s18" /></span>{SAY.forecastHeld}</h2>
          <p>{SAY.heldText}</p>
          <div class="foot"><Badge act={h.action} /><span class="chip illus">{SAY.decisionSupport}</span><span class="chip stale"><Ico id="clock" size="s14" />{stale ? SAY.heldChip : `${FRESH.yahoo} · ${FRESH.late}`}</span></div>
        </section>
      {:else}
        <section class="card fcard" aria-labelledby="fc-h" data-testid="forecast">
          <div class="fh">
            <h2 class="label" id="fc-h">6-month forecast · {h.ticker}</h2>
            <span class="chip fc"><Ico id="fan" size="s14" />{SAY.evaluated}</span>
            <div class="big"><span class="amt">{pct(h.med).replace('%', '')}<span class="p">%</span></span><span class="muted sub">{SAY.median}</span></div>
          </div>
          <div class="rng"><span>80% range</span><b>{pct(h.lo)} to {pct(h.hi)}</b><span>50% range</span><b>{pct(h.lo50)} to {pct(h.hi50)}</b></div>
          <div class="chart"><Range med={h.med} lo={h.lo} hi={h.hi} lo50={h.lo50} hi50={h.hi50} /></div>
          <div class="fmeta"><span>{fcAsOf}</span><span>Data cutoff {clock[1]}</span><span>{SAY.model}</span><span>{SAY.illustrative}</span></div>
          <div class="holdings-bar act"><Badge act={h.action} /><div class="w">{SAY.ranked}</div><span class="chip illus">{SAY.decisionSupport}</span></div>
          {#if why}
            <p class="small muted why">{why[0]} {WHY_TAIL}</p>
            <p class="small muted why2">{why[1]}</p>
          {:else}
            <p class="small muted why">The reasons for this action are not in the sample data yet.</p>
          {/if}
        </section>
      {/if}

      {#if sources}
        <section class="card prov" aria-labelledby="src-h">
          <div class="holdings-head"><h3 id="src-h">{SAY.whereFrom}</h3></div>
          {#each sources as [k, n, s] (n)}
            <div class="holdings-acc two"><span class="logo sm" style="--c:var(--seg-metals)" aria-hidden="true">{k}</span><div class="who"><b>{n}</b><span>{s}</span></div></div>
          {/each}
        </section>
      {/if}
    </div>
  {/if}
</div>

<style>
  .desk { display: grid; gap: 12px; padding-bottom: 8px; grid-template-columns: minmax(0, 1fr); align-items: start; }
  .desk > * { min-width: 0; }
  .upper, .body, .rail { display: grid; gap: 12px; min-width: 0; }
  .name { font: 600 15px/20px var(--font-text); letter-spacing: -0.01em; margin: 0; }
  .fig { margin: 10px 0 0; }
  .sub { font-size: 13px; line-height: 18px; letter-spacing: 0; }
  .late { color: var(--warn); }
  .meas { padding: 4px 0; }
  .acc { padding: 0 0 4px; }
  .prov { padding: 2px 0 6px; }
  .flush { margin-top: 0; }
  .chart { margin-top: 10px; }
  .fmeta { margin-top: 8px; }
  .act { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--hairline); }
  .why { margin-top: 8px; }
  .why2 { margin-top: 4px; }
  .who { min-width: 0; }
  .two { grid-template-columns: 30px minmax(0, 1fr); }
  .state h2.sh { margin: 0; }
  .fh h2.label { margin: 0; }
  @media (min-width: 1024px) {
    .desk { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); column-gap: 16px; }
    .upper, .wide { grid-column: 1 / -1; }
  }
</style>
