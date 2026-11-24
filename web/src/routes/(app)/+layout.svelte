<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { afterNavigate, goto } from '$app/navigation';
  import Sidebar from '#lib/components/Sidebar.svelte';
  import TabBar from '#lib/components/TabBar.svelte';
  import { placeOf } from '#lib/places.ts';
  import { auth } from '#lib/auth/auth.svelte.ts';

  let { children } = $props();
  const current = $derived(placeOf(page.url.pathname));
  let main: HTMLElement | undefined = $state();

  // Nothing behind sign-in is drawn until a session is confirmed; without one the page goes to sign-in.
  function guard() {
    auth.refresh();
    if (auth.status === 'signed_in') return;
    const next = encodeURIComponent(page.url.pathname + page.url.search);
    const reason = auth.status === 'expired' ? '&reason=expired' : '';
    goto(`/signin?next=${next}${reason}`, { replaceState: true });
  }

  onMount(() => {
    auth.init(location.search);
    guard();
    // A session that runs out while the app is open goes back to sign-in.
    const timer = setInterval(guard, 15_000);
    const onFocus = () => guard();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  });

  // After a change of place, focus moves to the page so a screen reader starts at its title.
  afterNavigate(({ from }) => {
    if (from && auth.status === 'signed_in') main?.focus();
  });
</script>

<svelte:head>
  <title>{current.label} · MyPrediction</title>
</svelte:head>

{#if auth.status === 'signed_in'}
  <a class="skip" href="#main">Skip to content</a>
  <div class="app">
    <Sidebar {current} />
    <main id="main" tabindex="-1" bind:this={main}>
      {@render children()}
    </main>
    <TabBar {current} />
  </div>
{/if}
