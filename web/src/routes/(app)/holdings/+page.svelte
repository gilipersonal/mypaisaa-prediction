<script lang="ts">
  // Holdings, option A "Review desk" (docs/design/journeys/src/journeys/holdings.js, screen a-list, listParts(); MP-205),
  // drawn with the design's own markup in the shared frame. Viewing only: nothing here writes. Figures are read in the
  // browser, never at build time; words are the design's own (#lib/holdings/design.ts).
  import { onMount } from 'svelte';
  import { source, type Holding, type Portfolio } from '#lib/data/index.ts';
  import { currentDataState, type DataState } from '#lib/data/state.ts';
  import { privacy } from '#lib/privacy.svelte.ts';
  import Frame from '#lib/shell/Frame.svelte';
  import Banner from '#lib/holdings/Banner.svelte';
  import EyeBtn from '#lib/holdings/EyeBtn.svelte';
  import HoldRow from '#lib/holdings/HoldRow.svelte';
  import HoldTable from '#lib/holdings/HoldTable.svelte';
  import Ico from '#lib/holdings/Ico.svelte';
  import Kept from '#lib/holdings/Kept.svelte';
  import Mask from '#lib/holdings/Mask.svelte';
  import RuleChip from '#lib/holdings/RuleChip.svelte';
  import Skel from '#lib/holdings/Skel.svelte';
  import ValueCard from '#lib/holdings/ValueCard.svelte';
  import { CUTOFFS, DIFF_OPEN, IMPORT_NOW, IMPORT_SUB, LASTGOOD_ALL, SAY, WATCH, coverage, pct, plain, signedGbp } from '#lib/holdings/design.ts';

  let ds = $state<DataState>('loading');
  let p: Portfolio | undefined = $state();
  let failed = $state(false);
  let wide = $state(true);

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
    const mq = matchMedia('(min-width: 1024px)');
    const fit = () => { wide = mq.matches; };
    fit();
    mq.addEventListener('change', fit);
    const net = () => { ds = currentDataState(); };
    addEventListener('online', net);
    addEventListener('offline', net);
    return () => {
      mq.removeEventListener('change', fit);
      removeEventListener('online', net);
      removeEventListener('offline', net);
    };
  });

  const phone = $derived(!wide);
  const stale = $derived(ds === 'stale');
  // Past the freshness limit a late price leaves the total until it returns (OWN-07); late but inside it, it stays.
  const out = $derived(stale && p ? p.items.filter((h: Holding) => h.staleAt) : []);
  const outPence = $derived(out.reduce((a: number, h: Holding) => a + h.value.pence, 0));
  const cov = $derived(coverage(stale));
  const covRows = $derived([['Value', cov.value], ['Cost basis', cov.basis], ['Gain', cov.gain], ['Return', cov.ret]] as const);
  const meta = $derived(ds === 'error' ? LASTGOOD_ALL : ds === 'loading' ? SAY.refreshing : `${p?.asOf ?? ''} · ${CUTOFFS}`);
  const importNow = $derived(`${IMPORT_NOW[ds] ?? IMPORT_NOW.ready} · ${DIFF_OPEN}`);
  const foot = $derived(SAY.foot + SAY.footTail);
</script>

{#snippet actions()}<a class="btn btn-tinted sm" href="/imports" style="text-decoration:none;text-align:center"><Ico id="layers" size="s18" />{SAY.imports}</a><EyeBtn />{/snippet}

{#snippet value(pf: Portfolio)}
  {#if stale}
    <ValueCard size={phone ? 40 : 36} label={SAY.partialLabel} partial total={plain(pf.total.pence - outPence)} held={plain(pf.holdings.pence - outPence)} cash={plain(pf.cash.pence)}
      sub={out.map((h) => `${SAY.partialSubHead}£${plain(h.value.pence)}${SAY.partialSubTail}`).join(' ')} {meta}
      gainOf={`${SAY.gainOn}${cov.gain} of ${cov.of}`} gain={signedGbp(cov.gainPence)} retOf={`${SAY.returnOn}${cov.ret} of ${cov.of}`} ret={SAY.retPartial + SAY.aYear} />
  {:else}
    <ValueCard size={phone ? 40 : 36} label={SAY.valueLabel} total={plain(pf.total.pence)} held={plain(pf.holdings.pence)} cash={plain(pf.cash.pence)} {meta}
      gainOf={`${SAY.gainOn}${cov.gain} of ${cov.of}`} gain={signedGbp(cov.gainPence)} retOf={`${SAY.returnOn}${cov.ret} of ${cov.of}`} ret={SAY.ret + SAY.aYear} />
  {/if}
{/snippet}

{#snippet listFoot()}<div class="t5foot">{foot}{#if !stale}<div class="holdings-late"><span>{SAY.late}</span><RuleChip rule={['settled', 'OWN-07']} /></div>{/if}</div>{/snippet}

{#snippet rows(pf: Portfolio)}
  {#if phone}
    <div class="card" style="padding:2px 0;margin:0">{#each pf.items as h (h.ticker)}<HoldRow {h} {stale} />{/each}{@render listFoot()}</div>
  {:else}
    <HoldTable items={pf.items} {stale} foot={listFoot} />
  {/if}
{/snippet}

<Frame title="Holdings" state={ds} back={{ label: 'Portfolio', href: '/' }} {actions} {body} rail={ds === 'empty' || failed ? undefined : rail} />

{#snippet body()}
  {#if privacy.masked && ds !== 'empty'}<Banner title={SAY.hiddenTitle} text={SAY.hidden} icon="eye-off" />{/if}
  {#if ds === 'empty'}
    <div class="card state"><h2 class="sh"><span class="ic"><Ico id="grid" size="s18" /></span>{SAY.emptyTitle}</h2><p>{SAY.empty}</p><a class="btn btn-primary sm" href="/imports" style="text-decoration:none;text-align:center"><Ico id="chev-r" size="s18" />{SAY.goImports}</a></div>
  {:else if failed}
    <div class="card state" role="alert"><h2 class="sh"><span class="ic"><Ico id="alert" size="s18" /></span>Your holdings could not be read.</h2><p>Nothing you saved is lost.</p><button class="btn btn-tinted sm" type="button" onclick={load}><Ico id="refresh" size="s18" />{SAY.tryAgain}</button></div>
  {:else if !p}
    <Skel n={4} />
  {:else if ds === 'loading'}
    {#if phone}{@render value(p)}<Skel n={4} />{:else}<div class="holdings-wide"><Skel n={6} /></div>{/if}
  {:else}
    {#if ds === 'error'}
      <div class="card state"><h2 class="sh"><span class="ic"><Ico id="alert" size="s18" /></span>{SAY.errorTitle}</h2><p>{SAY.error}</p><button class="btn btn-tinted sm" type="button" onclick={load}><Ico id="refresh" size="s18" />{SAY.tryAgain}</button></div>
    {:else if ds === 'stale'}
      <Banner kind="warn" title={SAY.staleTitle} text={SAY.stale} icon="clock" /><div class="holdings-acts"><RuleChip rule={['settled', 'OWN-07']} /></div>
    {:else if ds === 'offline'}
      <Banner title={SAY.offlineTitle} text={SAY.offline} icon="wifi-off" /><Kept />
    {/if}
    {#if phone}{@render value(p)}{/if}
    {@render rows(p)}
  {/if}
{/snippet}

{#snippet rail()}
  {#if p}
    {#if !phone}{@render value(p)}{/if}
    <div class="card" style="padding:14px 16px"><div class="label">{SAY.coverageTitle}</div>{#each covRows as [k, n] (k)}<div class="holdings-cov"><span>{k}</span><i role="img" aria-label="{k}: {n} of {cov.of} holdings"><u style="--v:{Math.round((n / cov.of) * 100)}%"></u></i><b>{`${n} of ${cov.of}`}</b></div>{/each}<p class="small muted" style="margin-top:10px">{(stale ? SAY.coverageStale : '') + SAY.coverage}</p><div class="holdings-acts" style="margin-top:8px"><RuleChip rule={['proposed', 'FIN-OD-04']} /><RuleChip rule={['settled', 'OWN-14']} /></div></div>
    {#if ds !== 'loading'}
      <div class="card state"><div class="sh"><span class="ic"><Ico id="target" size="s18" /></span><span style="flex:1;min-width:0">{SAY.watchTitle}<span class="holdings-sub">{SAY.watchSub}</span></span></div><div class="holdings-acc" style="padding:0"><span class="logo sm" style="--c:var({WATCH.color})" aria-hidden="true">{WATCH.logo}</span><div style="min-width:0"><b>{WATCH.name}</b><span>{`${WATCH.ticker} · 6M ${pct(WATCH.med)}, ${pct(WATCH.lo)} to ${pct(WATCH.hi)}, 80% range`}</span></div><span class="badge"><Ico id="target" size="s16" />{SAY.watch}</span></div><div class="holdings-acts"><span class="chip illus">{SAY.decisionSupport}</span><span class="chip illus">{SAY.illustrative}</span></div></div>
    {/if}
    <a class="card holdings-link" href="/imports" style="text-decoration:none"><span class="ic"><Ico id="layers" size="s18" /></span><span>{importNow}<small><Mask text={IMPORT_SUB} /></small></span><Ico id="chev-r" size="s18" /></a>
  {/if}
{/snippet}
