<script lang="ts">
  import type { Icon } from '#lib/places.ts';
  let { name, size = '' }: { name: Icon; size?: '' | 's14' | 's18' | 's24' } = $props();
</script>

<svg class="ico {size}" aria-hidden="true"><use href="#i-{name}" /></svg>
