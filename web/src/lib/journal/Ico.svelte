<script lang="ts">
  import type { JournalIcon } from './journal.ts';
  /** One of Prism's icons, from the sprite drawn once per page. The journal uses some the places' list does not name (chev-l, cube, the action marks). */
  let { name, size = '' }: { name: JournalIcon; size?: '' | 's14' | 's16' | 's18' | 's24' } = $props();
</script>

<svg class="ico {size}" aria-hidden="true"><use href="#i-{name}" /></svg>
