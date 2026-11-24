<script lang="ts">
  /** Prism's ic(id, cls): one symbol from the sprite (docs/design/prism/icons.svg). */
  let { name, size = '' }: { name: string; size?: '' | 's14' | 's18' | 's24' } = $props();
</script>

<svg class="ico {size}" aria-hidden="true"><use href="#i-{name}" /></svg>
