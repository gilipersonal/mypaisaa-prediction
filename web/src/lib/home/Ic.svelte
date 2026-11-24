<script lang="ts">
  /** Prism's icon helper, ic(id, cls), for any icon in Prism's sprite (the app's Icon names only the places' icons). */
  let { id, cls = '' }: { id: string; cls?: string } = $props();
</script>

<svg class="ico {cls}" aria-hidden="true"><use href="#i-{id}" /></svg>
