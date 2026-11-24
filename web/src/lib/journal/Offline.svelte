<script lang="ts">
  import Banner from '#lib/components/Banner.svelte';
  import Ico from './Ico.svelte';
  import { COPY } from './sample.ts';
  /** Offline, as the design draws it in a browser: the banner, then what this browser keeps and that how it protects it is unverified (MP40-Q12c). */
  let { text }: { text: string } = $props();
</script>

<Banner title="Offline." {text} icon="wifi-off" />
<div class="jkept"><span class="chip offline"><Ico name="wifi-off" size="s14" />{COPY.browserKept[0]}</span><span class="small muted">{COPY.browserKept[1]}</span></div>
