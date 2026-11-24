<script lang="ts">
  // One holding, option A "Review desk" (docs/design/journeys/src/journeys/holdings.js, screen a-one, holdingA(); MP-205),
  // drawn with the design's own markup in the shared frame. Every ticker uses the one template. Viewing only: the design's
  // Record decision is a write that arrives in a later step, so pressed it says so and records nothing. Figures are read in
  // the browser, never at build time.
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { source, type Holding } from '#lib/data/index.ts';
  import { currentDataState, type DataState } from '#lib/data/state.ts';
  import { privacy } from '#lib/privacy.svelte.ts';
  import Frame from '#lib/shell/Frame.svelte';
  import Badge from '#lib/holdings/Badge.svelte';
  import Banner from '#lib/holdings/Banner.svelte';
  import EvChip from '#lib/holdings/EvChip.svelte';
  import EyeBtn from '#lib/holdings/EyeBtn.svelte';
  import Ico from '#lib/holdings/Ico.svelte';
  import Kept from '#lib/holdings/Kept.svelte';
  import Later from '#lib/holdings/Later.svelte';
  import Mask from '#lib/holdings/Mask.svelte';
  import Money from '#lib/holdings/Money.svelte';
  import Range from '#lib/holdings/Range.svelte';
  import RuleChip from '#lib/holdings/RuleChip.svelte';
  import Skel from '#lib/holdings/Skel.svelte';
  import {
    ACCOUNTS, CLOCK, FRESH, LATER, LEDGER, MEASURES, NO_WHY, RETURN_FAILED, SAY, SOURCES, WHY, WHY_TAIL, asOf, lastGood, pct, plain, type Measure
  } from '#lib/holdings/design.ts';

  const ticker = $derived(page.params.ticker ?? '');
  let ds = $state<DataState>('loading');
  let h: Holding | undefined = $state();
  let read = $state(false);
  let failed = $state(false);
  let wide = $state(true);

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
  const l = $derived(LEDGER[ticker]);
  /** A holding with units and a value and no purchases behind them (the design's Empty, a snapshot). */
  const snapshot = $derived(l?.gain === 'Unavailable');
  /** Empty draws a snapshot holding as the design does; any other holding has nothing to show, so the list's Empty shows. */
  const none = $derived(ds === 'empty' && !snapshot);
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
  const title = $derived(wide ? SAY.oneTitle : ticker);
</script>

{#snippet actions()}<EyeBtn />{/snippet}

{#snippet mRow(m: Measure)}<div class="holdings-m"><span class="k">{m.k}</span><span class="v"><Mask text={m.v} /></span><span class="s"><EvChip ev={m.s} /></span>{#if m.n}<span class="n">{#if m.rule}<span class="holdings-late" style="margin-top:0"><span><Mask text={m.n} /></span><RuleChip rule={m.rule} /></span>{:else}<Mask text={m.n} />{/if}</span>{/if}</div>{/snippet}

<Frame {title} state={ds} back={{ label: 'Holdings', href: '/holdings' }} {actions} {body} rail={read && h && l && !none && !failed ? rail : undefined} />

{#snippet body()}
  {#if privacy.hidden && !none}<Banner title={SAY.hiddenTitle} text={SAY.hidden} icon="eye-off" />{/if}
  {#if failed}
    <div class="card state" role="alert"><h2 class="sh"><span class="ic"><Ico id="alert" size="s18" /></span>This holding could not be read.</h2><p>Nothing you saved is lost.</p><button class="btn btn-tinted sm" type="button" onclick={load}><Ico id="refresh" size="s18" />{SAY.tryAgain}</button></div>
  {:else if none}
    <div class="card state"><h2 class="sh"><span class="ic"><Ico id="grid" size="s18" /></span>{SAY.emptyTitle}</h2><p>{SAY.empty}</p><a class="btn btn-primary sm" href="/imports" style="text-decoration:none;text-align:center"><Ico id="chev-r" size="s18" />{SAY.goImports}</a></div>
  {:else if !read}
    <Skel n={3} />
  {:else if !h || !l}
    <div class="card state"><h2 class="sh"><span class="ic"><Ico id="info" size="s18" /></span>{`${ticker} is not in your holdings.`}</h2><p>Only holdings from records you approve show here.</p><a class="btn btn-tinted sm" href="/holdings" style="text-decoration:none;text-align:center">Back to Holdings</a></div>
  {:else}
    {#if ds === 'offline'}<Banner title={SAY.offlineTitle} text={`${SAY.offlineOneHead}${h.name}${SAY.offlineOneTail}`} icon="wifi-off" /><Kept />{/if}
    <div class="card valcard" data-testid="holding-card"><div class="holdings-bar"><span class="logo" style="--c:var({h.segColor})" aria-hidden="true">{h.logo}</span><div class="w"><b>{h.name}</b><Mask text={`${h.ticker} · ${h.venue} · ${l.units}`} /></div><span class="chip illus">{SAY.illustrative}</span></div><div style="margin-top:10px"><Money v={plain(h.value.pence)} size={phone ? 40 : 36} /></div><div class="d">{#if h.staleAt}<span class="chg" style="color:var(--warn)"><Ico id="clock" size="s14" />{`${SAY.lastPrice}${h.staleAt}`}</span>{:else}<span class="chg {h.dayPct < 0 ? 'down' : 'up'}"><Ico id={h.dayPct < 0 ? 'down' : 'up'} size="fill" />{pct(h.dayPct)}</span><span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">{SAY.today}</span>{/if}</div><div class="meta">{meta}</div></div>
    {#if measures}
      {#if ds === 'loading'}
        <Skel n={3} />
      {:else if ds === 'error'}
        <div class="card" style="padding:4px 0">{#each measures as m (m.k)}{@render mRow(m)}{/each}</div>
      {:else}
        <div class="card" style="padding:4px 0"><div class="holdings-head"><h3>{SAY.coverageTitle}</h3></div>{#each measures as m (m.k)}{@render mRow(m)}{/each}</div>
      {/if}
    {/if}
    {#if snapshot}
      <div class="card state"><h2 class="sh"><span class="ic"><Ico id="layers" size="s18" /></span>{SAY.snapshotTitle}</h2><p>{SAY.snapshot}</p><a class="btn btn-tinted sm" href="/imports" style="text-decoration:none;text-align:center"><Ico id="chev-r" size="s18" />{SAY.goImports}</a></div>
    {/if}
    {#if ds === 'error' && measures}
      <div class="card state"><h2 class="sh"><span class="ic"><Ico id="alert" size="s18" /></span>{SAY.oneFailedTitle}</h2><p>{SAY.oneFailed}</p></div>
    {/if}
    {#if accounts}
      <div class="card" style="padding:0 0 4px"><div class="holdings-head"><h3>{SAY.inAccounts}</h3></div>{#each accounts as [n, u, v, b, r] (n)}<div class="holdings-m"><span class="k"><Mask text={`${n} · ${u}`} /></span><span class="v"><Mask text={v} /></span><span class="r2">{accountReturn(r)}</span><span class="n"><Mask text={b} /></span></div>{/each}</div>
    {/if}
  {/if}
{/snippet}

{#snippet rail()}
  {#if h}
    {#if h.staleAt}
      <div class="card state"><h2 class="sh"><span class="ic"><Ico id="clock" size="s18" /></span>{SAY.forecastHeld}</h2><p>{SAY.heldText}</p><div class="foot"><Badge act={h.action} /><span class="chip illus">{SAY.decisionSupport}</span><EvChip ev={['old', stale ? SAY.heldChip : `${FRESH.yahoo} · ${FRESH.late}`]} /></div></div>
    {:else}
      <div class="card fcard" data-testid="forecast"><div class="fh"><h2 class="label">{`6-month forecast · ${h.ticker}`}</h2><span class="chip fc"><Ico id="fan" size="s14" />{SAY.evaluated}</span><div class="big"><span class="amt"><span class="roll" data-roll={pct(h.med).replace('%', '')}><span class="roll-ghost" aria-hidden="true">{pct(h.med).replace('%', '')}</span><span class="roll-live">{pct(h.med).replace('%', '')}</span></span><span class="p">%</span></span><span class="muted" style="font-size:13px;line-height:18px;letter-spacing:0">{SAY.median}</span></div></div><div class="rng"><span>80% range</span><b>{`${pct(h.lo)} to ${pct(h.hi)}`}</b><span>50% range</span><b>{`${pct(h.lo50)} to ${pct(h.hi50)}`}</b></div><div style="margin-top:10px"><Range med={h.med} lo={h.lo} hi={h.hi} lo50={h.lo50} hi50={h.hi50} /></div><div class="fmeta" style="margin-top:8px"><span>{fcAsOf}</span><span>{`Data cutoff ${clock[1]}`}</span><span>{SAY.model}</span><span>{SAY.illustrative}</span></div><div class="holdings-bar" style="margin-top:12px;padding-top:12px;border-top:1px solid var(--hairline)"><Badge act={h.action} /><div class="w">{SAY.ranked}</div><span class="chip illus">{SAY.decisionSupport}</span></div>{#if why}<p class="small muted" style="margin-top:8px" data-testid="why">{`${why[0]} ${WHY_TAIL}`}</p><p class="small muted" style="margin-top:4px">{why[1]}</p>{:else}<p class="small muted" style="margin-top:8px" data-testid="why">{NO_WHY}</p>{/if}{#if ds !== 'empty'}<div style="margin-top:10px"><Later label={LATER.record} say={LATER.recordSay} /></div>{/if}</div>
    {/if}
    {#if sources}
      <div class="card top5" style="padding:2px 0 6px"><div class="holdings-head"><h3>{SAY.whereFrom}</h3></div>{#each sources as [k, n, s] (n)}<div class="holdings-acc" style="grid-template-columns:30px minmax(0,1fr)"><span class="logo sm" style="--c:var(--seg-metals)" aria-hidden="true">{k}</span><div style="min-width:0"><b>{n}</b><span>{s}</span></div></div>{/each}</div>
    {/if}
  {/if}
{/snippet}
