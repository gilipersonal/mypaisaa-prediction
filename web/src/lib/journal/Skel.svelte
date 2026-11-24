<script lang="ts">
  import { COPY } from './sample.ts';
  /** Prism's skel(n) and skelRow(): the shape of what is coming, each row with the time of the last good figures. */
  let { n }: { n: number } = $props();
</script>

<div class="list card" style="margin:0" aria-busy="true">{#each Array.from({ length: n }, (_, i) => i) as i (i)}<div class="hrow"><span class="logo sk" style="background:var(--surface-3)"></span><div><span class="sk" style="height:14px;width:70%"></span><span class="sk" style="height:12px;width:40%;margin-top:6px"></span></div><div><span class="sk" style="height:14px;width:72px"></span><span class="sk" style="height:12px;width:40px;margin:6px 0 0 auto"></span></div><div class="fl"><span class="sk" style="height:10px;flex:1"></span><span class="chip fresh"><span class="dot"></span>{COPY.lastGood}</span></div></div>{/each}</div>
