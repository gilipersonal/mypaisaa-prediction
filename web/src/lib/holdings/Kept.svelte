<script lang="ts">
  import Ico from './Ico.svelte';
  import { SAY } from './design.ts';
  /* The shell's browserKept(): what a browser keeps offline, and that its protection is unverified. */
</script>

<div class="jkept"><span class="chip offline"><Ico id="wifi-off" size="s14" />{SAY.browserKept}</span><span class="small muted">{SAY.browserUnverified}</span></div>
