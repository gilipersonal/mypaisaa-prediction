<script lang="ts">
  /* A place that holds its spot in the navigation, in the design's frame, until its step is built. */
  import Frame from '#lib/shell/Frame.svelte';
  import NotBuilt from '#lib/components/NotBuilt.svelte';
  import { placeById } from '#lib/places.ts';
  const place = placeById('sources');
</script>

<Frame title={place.label} state="ready">
  {#snippet body()}<NotBuilt what="Data sources and their status" step="a later phase" />{/snippet}
</Frame>
