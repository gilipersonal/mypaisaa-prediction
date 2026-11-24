<script lang="ts">
  import Icon from './Icon.svelte';
  import { TABS, tabOf, type Place } from '#lib/places.ts';
  let { current }: { current: Place } = $props();
  const lit = $derived(tabOf(current));
  const index = $derived(TABS.findIndex((t: Place) => t.id === lit.id));
</script>

<nav class="tab-nav glass" style="position:fixed;left:0;right:0;bottom:0;z-index:20;height:80px" aria-label="Tabs">
  <div class="tabbar" style="--i: {index}">
    <span class="lens" aria-hidden="true"></span>
    {#each TABS as t (t.id)}
      <a class="tb" href={t.path} style="text-decoration:none" aria-current={t.id === lit.id ? 'page' : undefined}>
        <Icon name={t.icon} size="s24" />{t.tabLabel ?? t.label}
      </a>
    {/each}
  </div>
</nav>

