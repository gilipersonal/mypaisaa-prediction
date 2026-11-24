<script lang="ts">
  import type { Place } from '#lib/places.ts';
  let { place }: { place: Place } = $props();
</script>

<header class="ph">
  <h1 class="ltitle">{place.label}</h1>
</header>

<style>
  .ph { padding: 20px 0 8px; }
  .ph h1 { padding: 0; }
</style>
