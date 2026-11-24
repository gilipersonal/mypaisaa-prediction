<script lang="ts">
  import { onMount } from 'svelte';
  import { MediaQuery } from 'svelte/reactivity';
  import { source, type Holding } from '#lib/data/index.ts';
  import { currentDataState, type DataState } from '#lib/data/state.ts';
  import Banner from '#lib/journal/Banner.svelte';
  import Ico from '#lib/journal/Ico.svelte';
  import type { JournalIcon } from '#lib/journal/journal.ts';
  import Kept from '#lib/journal/Kept.svelte';
  import Later from '#lib/journal/Later.svelte';
  import { privacy } from '#lib/privacy.svelte.ts';
  import {
    COPY, DAY, HOME_SAY, INBOX_TOP, LATER, LESS, LESS_NOTE, MASKED, NOTICES, PUSH, PUSH_BUTTON, modeSay, proposed, settled, valueLabel, type Say
  } from '#lib/privacy-centre.ts';
  import Frame from '#lib/shell/Frame.svelte';
  import HoldRow from './HoldRow.svelte';
  import Sw from './Sw.svelte';

  /*
   * The privacy centre, Privacy option A "One privacy centre", screen privacy-a-centre (docs/design/journeys/src/journeys/
   * privacy.js): Settings, then Privacy. Hide amounts is the one control that works here. It is kept on this device, like the
   * theme, and writes nothing to any server; the page already drawn changes at once. Every other control is drawn as designed,
   * writes nothing, and says when pressed that its act comes in a later build step.
   *
   * The rows are read in the browser, never at build time. The data state comes from the address (?data=); loading is held
   * until the page is pressed on, so it can be seen and tested.
   */
  const wideQ = new MediaQuery('min-width: 1024px', false);
  const wide = $derived(wideQ.current);
  let st: DataState = $state('loading');
  let items: Holding[] = $state([]);
  let read = $state(false);
  const on = $derived(privacy.hidden);
  const rows = $derived(MASKED.map((t) => items.find((h) => h.ticker === t)).filter((h): h is Holding => !!h));
  const late = $derived(items.filter((h) => h.staleAt));
  const icon = (s: string) => s as JournalIcon;

  onMount(() => {
    const want = currentDataState();
    let stop = () => {};
    source.portfolio().then(
      (p) => { items = p.items; read = true; },
      () => { read = true; }
    );
    if (want === 'loading') {
      const go = () => { stop(); st = 'ready'; };
      stop = () => { removeEventListener('pointerdown', go); removeEventListener('keydown', go); };
      addEventListener('pointerdown', go);
      addEventListener('keydown', go);
    } else st = want;
    return () => stop();
  });
  const busy = $derived(st === 'loading' || !read);
</script>

{#snippet say(s: Say)}<Banner kind={s[0]} title={s[1]} text={s[2]} icon={icon(s[3])} />{/snippet}
{#snippet sk(title: string, n: number)}<div class="card fcard privacy-box" data-mo="card" aria-busy="true"><div class="privacy-head"><h3>{title}</h3><span class="chip fresh" data-mo="chip"><span class="dot"></span>{COPY.lastGood}</span></div><div style="display:grid;gap:10px">{#each [92, 80, 68].slice(0, n) as w (w)}<span class="sk" style="height:14px;width:{w}%"></span>{/each}</div></div>{/snippet}
{#snippet li(ic: string, t: string, s: string, e?: import('svelte').Snippet)}<div class="privacy-li" data-mo="rise"><span class="privacy-ic"><Ico name={icon(ic)} size="s18" /></span><div style="min-width:0"><div class="t">{t}</div>{#if s}<div class="s">{s}</div>{/if}</div><div class="e">{@render e?.()}</div></div>{/snippet}

{#snippet mode()}
  {#if busy}{@render sk(COPY.mode, 3)}
  {:else}
    <div class="card fcard privacy-box" data-mo="card"><div class="privacy-head"><h3>{COPY.mode}</h3><Sw label={COPY.hide} {on} onpress={() => privacy.set(!privacy.hidden)} /></div>
      {#if st === 'empty'}<p class="small muted">{COPY.noHoldings}</p>
      {:else}<p class="small muted" id="mode-say">{modeSay(on)}</p><div class="privacy-list"><div class="privacy-row"><span class="label">{valueLabel(items.length - (st === 'stale' ? late.length : 0), items.length)}</span><span class="chip illus">Illustrative</span></div><div><span class="amt priv" style="font-size:30px">£•••••</span></div><div class="privacy-row" style="justify-content:flex-start;flex-wrap:wrap;font-size:15px;line-height:20px">{#if st === 'stale'}<span class="small muted">{late.map((h) => h.name).join(', ')} {COPY.leftOut}</span><span class="chip owner" data-mo="chip"><span class="dot"></span>{settled("OWN-07")}</span>{:else}<span class="chg up"><Ico name="up" size="fill" />{DAY.pct}</span><span class="small muted">{st === 'error' ? 'last good' : 'today'}</span>{/if}</div></div><div class="card" style="box-shadow:inset 0 0 0 1px var(--hairline)">{#if st !== 'offline'}<div class="privacy-row privacy-rows-h"><span class="label">{COPY.holdingsLabel}</span><span class="chip illus">{COPY.support}</span></div>{/if}{#each rows as h (h.ticker)}<HoldRow {h} state={st} />{/each}</div>{/if}</div>
  {/if}
{/snippet}

{#snippet outside()}
  {#if busy}{@render sk(COPY.outside, 2)}
  {:else}
    <div class="card fcard privacy-box" data-mo="card"><div class="privacy-head"><h3>{COPY.outside}</h3><span class="chip fresh" data-mo="chip"><span class="dot"></span>{COPY.privateDefault}</span></div>{#each [LESS_NOTE[st]].filter((s) => !!s) as s (s)}{@render say(s!)}{/each}<div class="privacy-glances">
    <figure><div class="privacy-g lock" role="img" aria-label="Lock screen: the time and one neutral notice, no amounts or names"><span class="time">9:41</span><span class="privacy-n"><b>MyPrediction</b>You have a new notice</span></div><figcaption>Lock screen<span>Neutral text</span></figcaption></figure>
    <figure><div class="privacy-g" role="img" aria-label="App switcher: a covered snapshot"><span class="brand-mark" aria-hidden="true"></span><span>Covered</span></div><figcaption>App switcher<span>Snapshot covered</span></figcaption></figure>
    <figure><div class="privacy-g wid" role="img" aria-label="Widget: no holdings shown"><span class="brand-mark" aria-hidden="true"></span><span>Open to view</span></div><figcaption>Widget<span>No holdings</span></figcaption></figure></div><div class="privacy-list">{#each LESS as [t, s], i (t)}<div class="privacy-li plain" data-mo="rise"><div style="min-width:0"><div class="t">{t}</div><div class="s">{s}</div></div><div class="e">{#if st === 'error' && i === 1}<span class="chip error" data-mo="chip"><Ico name="alert" size="s14" />{COPY.notSaved}</span>{:else}<Later text={LATER.less}>{#snippet children(press)}<Sw label={t} on={false} disabled={st === 'offline'} onpress={press} />{/snippet}</Later>{/if}</div></div>{/each}{@render li('shield', COPY.shared, COPY.sharedSay)}</div></div>
  {/if}
{/snippet}

{#snippet push()}
  {#if busy}{@render sk(COPY.phone, 3)}
  {:else}
    {@const [pi, ps, pc] = PUSH[st]}
    <div class="card fcard privacy-box" data-mo="card"><div class="privacy-head"><h3>{COPY.notifications}</h3></div><div class="privacy-list">{#snippet ctl()}<Later text={LATER.push}>{#snippet children(press)}{#if pc === 'on' || pc === 'off'}<Sw label={COPY.phone} on={pc === 'on'} disabled={st === 'offline'} onpress={press} />{:else}<button class="btn sm btn-primary" type="button" onclick={press}>{PUSH_BUTTON[pc]}</button>{/if}{/snippet}</Later>{/snippet}{@render li(pi, COPY.phone, ps, ctl)}{#snippet chip()}<span class="chip proposed" data-mo="chip"><span class="dot"></span>{proposed('MP40-Q11')}</span>{/snippet}{@render li('clock', COPY.quiet, COPY.quietSay, chip)}{@render li('lock', COPY.says, COPY.saysSay)}</div><p class="small muted">{COPY.delivery}</p></div>
  {/if}
{/snippet}

{#snippet inbox()}
  {#if busy}{@render sk(COPY.notices, 3)}
  {:else if st === 'empty'}
    <div class="card fcard privacy-box" data-mo="card"><div class="privacy-head"><h3>{COPY.notices}</h3></div><p class="small muted">{COPY.noNotices}</p></div>
  {:else}
    <div class="card fcard privacy-box" data-mo="card"><div class="privacy-head"><h3>{COPY.notices}</h3><span class="small muted">{COPY.unread}</span></div>{#each [INBOX_TOP[st]].filter((s) => !!s) as s (s)}{@render say(s!)}{/each}{#if st !== 'error'}<div class="privacy-list">{#each NOTICES as [ni, nt, ns, unread, q] (nt)}<Later text={LATER.notice}>{#snippet children(press)}<div role="button" tabindex="0" class="privacy-li tap{unread ? ' unread' : ''}" data-mo="rise" onclick={press} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press(); } }}><span class="privacy-ic"><Ico name={icon(ni)} size="s18" /></span><div style="min-width:0"><div class="t">{#if unread}<span class="sr">Unread: </span>{/if}{st === 'stale' ? nt.replace('is late', 'is stale') : nt}</div><div class="s">{ns}{#if q}<div class="privacy-chips"><span class="chip owner" data-mo="chip"><span class="dot"></span>Settled · {q}</span></div>{/if}</div></div><div class="e"><span class="muted" style="display:inline-grid"><Ico name="chev-r" size="s16" /></span></div></div>{/snippet}</Later>{/each}</div>{/if}<p class="small muted">{COPY.opening}</p></div>
  {/if}
{/snippet}

{#snippet body()}
  {#if st === 'offline'}<Kept />{/if}
  {#if !busy && st === 'error'}<div class="card state" data-mo="card"><div class="sh"><span class="ic"><Ico name="alert" size="s18" /></span>{COPY.usFailed}</div><p>{COPY.usFailedSay}</p><Later text={LATER.retry}>{#snippet children(press)}<button class="btn btn-tinted" type="button" onclick={press}><Ico name="refresh" size="s18" />Try again</button>{/snippet}</Later><div class="foot">{COPY.lastGoodAll}</div></div>
  {:else if !busy}{#each [HOME_SAY[st]].filter((s) => !!s) as s (s)}{@render say(s!)}{/each}{/if}
  {@render mode()}{#if !wide}{@render outside()}{/if}{@render push()}
{/snippet}
{#snippet rail()}{#if wide}{@render outside()}{/if}{@render inbox()}{/snippet}

<Frame title={COPY.title} state={st} back={{ label: COPY.back, href: '/settings' }} {body} {rail} />
