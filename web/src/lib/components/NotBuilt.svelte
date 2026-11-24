<script lang="ts">
  import Icon from './Icon.svelte';
  let { what, step }: { what: string; step: string } = $props();
</script>

<section class="card state" aria-label="Not built yet">
  <div class="sh"><span class="ic"><Icon name="clock" size="s18" /></span>Not built yet</div>
  <p>{what} arrives in {step}. This page holds its place in the navigation and shows no data.</p>
</section>
