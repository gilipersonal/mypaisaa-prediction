<script lang="ts">
  // Holdings, option A "Review desk" (docs/design/journeys/src/journeys/holdings.js, screen a-list; MP-205). Viewing only:
  // nothing here writes, and import, edit and correction arrive in later steps. Read in the browser, never at build time.
  import { onMount } from 'svelte';
  import { source, type Holding, type Portfolio } from '#lib/data/index.ts';
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
  import { CUTOFFS, LASTGOOD_ALL, LEDGER, SAY, WATCH, coverage, pct, returnOf, signedGbp, type Ev } from '#lib/holdings/design.ts';

  let ds = $state<DataState>('loading');
  let p: Portfolio | undefined = $state();
  let failed = $state(false);

  async function load(): Promise<void> {
    failed = false;
    try {
      p = await source.portfolio();
    } catch {
      failed = true;
    }
  }

  onMount(() => {
    ds = currentDataState();
    void load();
  });

  const stale = $derived(ds === 'stale');
  // Past the freshness limit, a late price leaves the total until it returns (OWN-07); late but inside it, it stays.
  const out = $derived(stale && p ? p.items.filter((h: Holding) => h.staleAt) : []);
  const outPence = $derived(out.reduce((a: number, h: Holding) => a + h.value.pence, 0));
  const cov = $derived(coverage(stale));
  const covRows = $derived([['Value', cov.value], ['Cost basis', cov.basis], ['Gain', cov.gain], ['Return', cov.ret]] as const);
  const meta = $derived(ds === 'error' ? LASTGOOD_ALL : ds === 'loading' ? SAY.refreshing : `${p?.asOf ?? ''} · ${CUTOFFS}`);
  const gbp = (pence: number) => ({ pence, currency: 'GBP' as const });
  const evOf = (h: Holding): Ev => (stale && h.ticker === 'HSBA' ? ['old', 'Stale'] : (LEDGER[h.ticker]?.ev ?? ['none', 'Unavailable']));
</script>

<Head title="Holdings" back="Portfolio" backTo="/" />

<div class="desk" aria-busy={!p && !failed && ds !== 'empty'}>
  <div class="upper">
    <Fresh state={ds} />
    {#if ds === 'offline'}
      <div class="jbanner" role="status"><Ico id="wifi-off" size="s18" /><div><b>{SAY.offlineTitle}</b> {SAY.offline}</div></div>
      <div class="jkept"><span class="chip offline"><Ico id="wifi-off" size="s14" />{SAY.browserKept}</span><span class="small muted">{SAY.browserUnverified}</span></div>
    {:else if ds === 'stale'}
      <div class="jbanner warn" role="status"><Ico id="clock" size="s18" /><div><b>{SAY.staleTitle}</b> {SAY.stale}</div></div>
      <div class="holdings-acts"><RuleChip rule={['settled', 'OWN-07']} /></div>
    {:else if ds === 'error'}
      <section class="card state" aria-labelledby="err-h">
        <h2 class="sh" id="err-h"><span class="ic"><Ico id="alert" size="s18" /></span>{SAY.errorTitle}</h2>
        <p>{SAY.error}</p>
        <button class="btn btn-tinted sm" type="button" onclick={load}><Ico id="refresh" size="s18" />{SAY.tryAgain}</button>
      </section>
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
      <h2 class="sh" id="fail-h"><span class="ic"><Ico id="info" size="s18" /></span>Your holdings could not be read.</h2>
      <button class="btn btn-tinted sm" type="button" onclick={load}><Ico id="refresh" size="s18" />{SAY.tryAgain}</button>
    </section>
  {:else if !p}
    <div class="rows"><Skel n={4} /></div>
  {:else}
    <section class="card valcard value" aria-labelledby="value-h" data-testid="value-card">
      <div class="top"><h2 class="label" id="value-h">{stale ? SAY.partialLabel : SAY.valueLabel}</h2>{#if stale}<EvChip ev={['part', SAY.partial]} />{:else}<span class="chip illus">{SAY.illustrative}</span>{/if}</div>
      <p class="fig"><Money m={gbp(p.total.pence - outPence)} size={40} /></p>
      {#if stale}
        <div class="d"><span class="muted sub">{#each out as h (h.ticker)}{SAY.partialSubHead}<Money m={h.value} pp />{SAY.partialSubTail}{/each}</span></div>
      {:else}
        <div class="d"><span class="chg up"><Ico id="up" size="fill" /><Masked text={SAY.dayMove} /></span><span class="muted sub">{SAY.today}</span></div>
      {/if}
      <div class="vparts">Holdings <Money m={gbp(p.holdings.pence - outPence)} pp /> · Cash <Money m={p.cash} pp /></div>
      <div class="meta">{meta}</div>
      <div class="holdings-two">
        <div><span>{SAY.gainOn}{cov.gain} of {cov.of}</span><b data-testid="gain"><Masked text={signedGbp(cov.gainPence)} /></b></div>
        <div><span>{SAY.returnOn}{cov.ret} of {cov.of}</span><b>{stale ? SAY.retPartial : SAY.ret}{SAY.aYear}</b></div>
      </div>
    </section>

    {#if ds === 'loading'}
      <div class="rows"><Skel n={4} /></div>
    {:else}
      <section class="card rows" aria-labelledby="rows-h">
        <h2 class="sr" id="rows-h">Your holdings</h2>
        {#each p.items as h (h.ticker)}
          {@const l = LEDGER[h.ticker]}
          <div class="hrow holdings-row" class:is-stale={!!h.staleAt} data-testid="row-{h.ticker}">
            <span class="logo" style="--c:var({h.segColor})" aria-hidden="true">{h.logo}</span>
            <div class="who"><a class="nm open" href="/holdings/{h.ticker}">{h.name}</a><div class="tk">{h.ticker} · {l?.at}</div></div>
            <div class="vv">
              <div class="val"><Money m={h.value} pp /></div>
              {#if h.staleAt}
                <span class="chg late"><Ico id="clock" size="s14" /><span class="sr">{'Last price '}</span>{h.staleAt}</span>
              {:else}
                <span class="chg {h.dayPct < 0 ? 'down' : 'up'}"><Ico id={h.dayPct < 0 ? 'down' : 'up'} size="fill" />{pct(h.dayPct)}<span class="sr">{' today'}</span></span>
              {/if}
            </div>
            <div class="fl">
              {#if h.staleAt}
                <span class="chip stale"><Ico id="clock" size="s14" />{SAY.forecastHeld}</span><Badge act={h.action} />
              {:else}
                <div class="rangewrap"><Range med={h.med} lo={h.lo} hi={h.hi} lo50={h.lo50} hi50={h.hi50} /></div>
                <span class="fcv">{pct(h.med)} · 6M</span><Badge act={h.action} />
              {/if}
            </div>
            <div class="fl holdings-ret"><span>Return <b>{returnOf(h.ticker, stale)}</b></span><EvChip ev={evOf(h)} /></div>
          </div>
        {/each}
        <div class="t5foot">
          {SAY.foot}{SAY.footTail}
          {#if !stale}<div class="holdings-late"><span>{SAY.late}</span><RuleChip rule={['settled', 'OWN-07']} /></div>{/if}
        </div>
      </section>
    {/if}

    <section class="card pad cov" aria-labelledby="cov-h">
      <h2 class="label" id="cov-h">{SAY.coverageTitle}</h2>
      {#each covRows as [k, n] (k)}
        <div class="holdings-cov"><span>{k}</span><i role="img" aria-label="{k}: {n} of {cov.of} holdings"><u style="--v:{Math.round((n / cov.of) * 100)}%"></u></i><b>{n} of {cov.of}</b></div>
      {/each}
      <p class="small muted note">{stale ? SAY.coverageStale : ''}{SAY.coverage}</p>
      <div class="holdings-acts acts"><RuleChip rule={['proposed', 'FIN-OD-04']} /><RuleChip rule={['settled', 'OWN-14']} /></div>
    </section>

    {#if ds !== 'loading'}
      <section class="card state watch" aria-labelledby="watch-h">
        <div class="sh"><span class="ic"><Ico id="target" size="s18" /></span><span class="grow"><h2 id="watch-h" class="wt">{SAY.watchTitle}</h2><span class="holdings-sub">{SAY.watchSub}</span></span></div>
        <div class="holdings-acc flush">
          <span class="logo sm" style="--c:var({WATCH.color})" aria-hidden="true">{WATCH.logo}</span>
          <div class="who"><b>{WATCH.name}</b><span>{WATCH.ticker} · 6M {pct(WATCH.med)}, {pct(WATCH.lo)} to {pct(WATCH.hi)}, 80% range</span></div>
          <span class="badge"><Ico id="target" size="s16" />{SAY.watch}</span>
        </div>
        <div class="holdings-acts"><span class="chip illus">{SAY.decisionSupport}</span><span class="chip illus">{SAY.illustrative}</span></div>
      </section>
    {/if}
  {/if}
</div>

<style>
  .desk { display: grid; gap: 12px; padding-bottom: 8px; grid-template-columns: minmax(0, 1fr); }
  .desk > * { min-width: 0; }
  .upper { display: grid; gap: 12px; }
  .fig { margin: 8px 0 0; }
  .sub { font-size: 13px; line-height: 18px; letter-spacing: 0; }
  .who { min-width: 0; }
  .open { display: block; color: inherit; text-decoration: none; }
  /* the whole row opens the holding; the name is the link, so the rest of the row reads as itself */
  .open::after { content: ''; position: absolute; inset: 0; }
  .hrow:has(.open:focus-visible) { outline: 2px solid var(--focus); outline-offset: -2px; }
  .open:focus-visible { outline: none; }
  .late { color: var(--warn); font-size: 12px; line-height: 16px; }
  .pad { padding: 14px 16px; }
  .note { margin-top: 10px; }
  .acts { margin-top: 8px; }
  .grow { flex: 1; min-width: 0; }
  .wt { font: inherit; }
  .flush { padding: 0; }
  .state h2.sh { margin: 0; }
  @media (min-width: 1024px) {
    .desk { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); grid-template-areas: 'top top' 'rows value' 'rows cov' 'rows watch' 'rows .'; grid-template-rows: auto auto auto auto 1fr; align-items: start; column-gap: 16px; }
    .upper { grid-area: top; }
    .value { grid-area: value; }
    .rows { grid-area: rows; }
    .cov { grid-area: cov; }
    .watch { grid-area: watch; }
    .wide { grid-column: 1 / -1; }
  }
</style>
