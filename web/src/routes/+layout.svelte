<script lang="ts">
  // Prism is the one source of tokens and icons; the app reads them in place and keeps no copy.
  import '../../../docs/design/prism/tokens.css';
  import '#lib/prism/components.css';
  import '../app.css';
  import sprite from '../../../docs/design/prism/icons.svg?raw';
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import Sidebar from '#lib/components/Sidebar.svelte';
  import TabBar from '#lib/components/TabBar.svelte';
  import { placeOf } from '#lib/places.ts';

  let { children } = $props();
  const current = $derived(placeOf(page.url.pathname));
  let main: HTMLElement | undefined = $state();

  // After a change of place, focus moves to the page so a screen reader starts at its title.
  afterNavigate(({ from }) => {
    if (from) main?.focus();
  });
</script>

<svelte:head>
  <title>{current.label} · Mypaisaa</title>
</svelte:head>

<!-- Prism's icon sprite, once per page -->
{@html sprite}

<a class="skip" href="#main">Skip to content</a>
<div class="app">
  <Sidebar {current} />
  <main id="main" tabindex="-1" bind:this={main}>
    {@render children()}
  </main>
  <TabBar {current} />
</div>
