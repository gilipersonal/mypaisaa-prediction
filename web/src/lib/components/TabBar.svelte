<script lang="ts">
  import Icon from './Icon.svelte';
  import { TABS, tabOf, type Place } from '#lib/places.ts';
  let { current }: { current: Place } = $props();
  const lit = $derived(tabOf(current));
  const index = $derived(TABS.findIndex((t: Place) => t.id === lit.id));
</script>

<nav class="tab-nav glass" aria-label="Tabs">
  <div class="tabbar" style="--i: {index}">
    <span class="lens" aria-hidden="true"></span>
    {#each TABS as t (t.id)}
      <a class="tb" href={t.path} aria-current={t.id === lit.id ? 'page' : undefined}>
        <Icon name={t.icon} size="s24" /><span>{t.tabLabel ?? t.label}</span>
      </a>
    {/each}
  </div>
</nav>

<style>
  .tab-nav { position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; padding-bottom: max(8px, env(safe-area-inset-bottom, 0px)); padding-left: env(safe-area-inset-left, 0px); padding-right: env(safe-area-inset-right, 0px); }
  .tb { text-decoration: none; }
</style>
