<script lang="ts">
  import Icon from './Icon.svelte';
  import type { Place } from '#lib/places.ts';
  let { places, label }: { places: Place[]; label: string } = $props();
</script>

<!-- On a phone, the places that hang off this tab; the sidebar shows them itself from 1024 wide. -->
<nav class="links card" aria-label={label}>
  <ul>
    {#each places as p (p.id)}
      <li>
        <a href={p.path}><Icon name={p.icon} /><span>{p.label}</span><Icon name="chev-r" size="s18" /></a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .links { margin-top: 16px; }
  .links a { display: flex; align-items: center; gap: 12px; min-height: var(--tap); padding: 10px 16px; color: var(--ink); text-decoration: none; font: 400 17px/22px var(--font-text); letter-spacing: -0.01em; --ic2: var(--link); }
  .links a span { flex: 1; }
  .links li + li a { box-shadow: inset 0 1px 0 var(--hairline); }
  @media (min-width: 1024px) { .links { display: none; } }
</style>
