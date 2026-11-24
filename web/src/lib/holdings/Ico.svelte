<script lang="ts">
  /** Any icon in Prism's sprite (docs/design/prism/icons.svg), as the design's ic() draws it. */
  let { id, size = '' }: { id: string; size?: '' | 's14' | 's16' | 's18' | 's24' | 'fill' } = $props();
</script>

<svg class="ico {size}" aria-hidden="true"><use href="#i-{id}" /></svg>
