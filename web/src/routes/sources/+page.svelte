<script lang="ts">
  import PlaceHeader from '#lib/components/PlaceHeader.svelte';
  import NotBuilt from '#lib/components/NotBuilt.svelte';
  import { placeById } from '#lib/places.ts';
</script>

<PlaceHeader place={placeById('sources')} />
<NotBuilt what="Data sources and their status" step="a later phase" />
