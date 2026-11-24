<script lang="ts">
  import Icon from './Icon.svelte';
  import { PLACES, type Place } from '#lib/places.ts';
  let { current }: { current: Place } = $props();
</script>

<nav class="side-nav" aria-label="Places">
  <a class="brand" href="/">
    <span class="brand-mark" aria-hidden="true"></span>
    <span>MyPrediction</span>
  </a>
  <ul class="side">
    {#each PLACES as p (p.id)}
      <li>
        <a class="si" class:on={p.id === current.id} href={p.path} aria-current={p.id === current.id ? 'page' : undefined}>
          <Icon name={p.icon} />{p.label}
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .side-nav { position: sticky; top: 0; height: 100dvh; overflow-y: auto; background: var(--ground-2); box-shadow: inset -1px 0 0 var(--hairline); }
  .brand { display: flex; align-items: center; gap: 10px; min-height: var(--tap); padding: 16px 22px 4px; color: var(--ink); font: 700 17px/22px var(--font-text); letter-spacing: -0.01em; text-decoration: none; }
  .side a { text-decoration: none; }
</style>
