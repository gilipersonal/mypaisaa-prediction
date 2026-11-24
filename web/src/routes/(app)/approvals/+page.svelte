<script lang="ts">
  import PlaceHeader from '#lib/components/PlaceHeader.svelte';
  import NotBuilt from '#lib/components/NotBuilt.svelte';
  import { placeById } from '#lib/places.ts';
</script>

<PlaceHeader place={placeById('approvals')} />
<NotBuilt what="Approvals" step="a later phase" />
