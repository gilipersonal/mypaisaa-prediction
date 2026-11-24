<script lang="ts">
  import type { JournalIcon } from './journal.ts';
  /** Prism's ic(id, cls): one symbol from the sprite drawn once per page. */
  let { name, size = '' }: { name: JournalIcon; size?: '' | 's14' | 's16' | 's18' | 's24' | 'fill' } = $props();
</script>

<svg class="ico {size}" aria-hidden="true"><use href="#i-{name}" /></svg>
