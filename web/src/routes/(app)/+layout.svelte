<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { afterNavigate, goto } from '$app/navigation';
  import Sidebar from '#lib/components/Sidebar.svelte';
  import TabBar from '#lib/components/TabBar.svelte';
  import { pageTitle, placeOf } from '#lib/places.ts';
  import { auth } from '#lib/auth/auth.svelte.ts';
  import { privacy } from '#lib/privacy.svelte.ts';
  import { source } from '#lib/data/index.ts';
  import { dataStateOf } from '#lib/data/state.ts';

  let { children } = $props();
  const current = $derived(placeOf(page.url.pathname));
  // the title names the page the heading names, not only its place (MP-205)
  const title = $derived(pageTitle(page.url.pathname));
  let main: HTMLElement | undefined = $state();
  // from 1024 wide the app is the design's desktop frame (.dev.win), and its pane scrolls on its own
  let wide = $state(false);
  // the sidebar's state and counts, as the design draws them: the holdings and segments in the sample (none when empty)
  const dataState = $derived(dataStateOf(page.url.search));
  let held = $state<{ holdings: number; segments: number } | null>(null);
  const counts = $derived({ portfolio: dataState === 'empty' ? undefined : held?.holdings, segments: held?.segments });

  // Nothing behind sign-in is drawn until a session is confirmed; without one the page goes to sign-in.
  function guard() {
    auth.refresh();
    if (auth.status === 'signed_in') return;
    const next = encodeURIComponent(page.url.pathname + page.url.search);
    const reason = auth.status === 'expired' ? '&reason=expired' : '';
    goto(`/signin?next=${next}${reason}`, { replaceState: true });
  }

  onMount(() => {
    privacy.load();
    const mq = matchMedia('(min-width: 1024px)');
    const fit = () => (wide = mq.matches);
    fit();
    mq.addEventListener('change', fit);
    source.portfolio().then((p) => (held = { holdings: p.items.length, segments: Object.keys(p.segments).length }));
    auth.init(location.search);
    guard();
    // A session that runs out while the app is open goes back to sign-in.
    const timer = setInterval(guard, 15_000);
    const onFocus = () => guard();
    // and when the app goes to the background
    const onHide = () => { if (document.hidden) privacy.hideNow(); };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onHide);
    };
  });

  // After a change of place, focus moves to the page so a screen reader starts at its title.
  afterNavigate(({ from }) => {
    // the pane scrolls on its own on a desktop, so a new page starts at its top there too
    if (main && from?.url.pathname !== page.url.pathname) main.scrollTop = 0;
    // amounts shown by a tap hide again on leaving the screen (Tap to show, option A)
    if (from?.url.pathname !== page.url.pathname) privacy.hideNow();
    if (from && auth.status === 'signed_in') main?.focus();
  });
</script>

<svelte:head>
  <title>{title} · MyPrediction</title>
</svelte:head>

{#if auth.status === 'signed_in'}
  <a class="skip" href="#main">Skip to content</a>
  <div class="app" class:win={wide}>
    <Sidebar {current} state={dataState} {counts} />
    <main id="main" class="jpane" tabindex="-1" bind:this={main}>
      {@render children()}
    </main>
    <TabBar {current} />
    <!-- what a screen reader hears when a tap shows amounts and when they hide again, once each (Tap to show, option A) -->
    <div class="sr" role="status">{privacy.said}</div>
  </div>
{/if}
