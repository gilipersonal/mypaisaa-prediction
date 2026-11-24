<script lang="ts">
  import PlaceHeader from '#lib/components/PlaceHeader.svelte';
  import PlaceLinks from '#lib/components/PlaceLinks.svelte';
  import NotBuilt from '#lib/components/NotBuilt.svelte';
  import SampleTotal from '#lib/components/SampleTotal.svelte';
  import { placeById, childrenOf } from '#lib/places.ts';
</script>

<PlaceHeader place={placeById('portfolio')} />
<SampleTotal />
<PlaceLinks places={childrenOf('portfolio')} label="More from Portfolio" />
<div class="gap"></div>
<NotBuilt what="Home, holdings first, with the cost pill" step="step 3" />

<style>
  .gap { height: 16px; }
</style>
