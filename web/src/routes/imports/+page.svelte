<script lang="ts">
  import PlaceHeader from '#lib/components/PlaceHeader.svelte';
  import NotBuilt from '#lib/components/NotBuilt.svelte';
  import { placeById } from '#lib/places.ts';
</script>

<PlaceHeader place={placeById('imports')} />
<NotBuilt what="Imports" step="a later phase" />
