<script lang="ts">
  import PlaceHeader from '#lib/components/PlaceHeader.svelte';
  import NotBuilt from '#lib/components/NotBuilt.svelte';
  import { placeById } from '#lib/places.ts';
</script>

<PlaceHeader place={placeById('forecasts')} />
<NotBuilt what="Forecasts for every horizon" step="a later phase" />
