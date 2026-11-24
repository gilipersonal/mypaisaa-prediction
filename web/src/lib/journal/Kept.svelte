<script lang="ts">
  import Ico from './Ico.svelte';
  import { COPY } from './sample.ts';
  /* shell.js browserKept(): what a browser keeps offline, and that how it protects it is unverified (MP40-Q12c). */
</script>

<div class="jkept" data-mo="rise"><span class="chip offline" data-mo="chip"><Ico name="wifi-off" size="s14" />{COPY.browserKept[0]}</span><span class="small muted">{COPY.browserKept[1]}</span></div>
