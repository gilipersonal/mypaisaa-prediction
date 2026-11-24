<script lang="ts">
  import { COPY } from './sample.ts';
  /** Prism's loading rows (skelRow): the shape of what is coming, each with the time of the last good figures. */
  let { n }: { n: number } = $props();
</script>

<div class="list card skel" aria-busy="true">
  {#each Array.from({ length: n }, (_, i) => i) as i (i)}
    <div class="hrow">
      <span class="logo sk"></span>
      <div><span class="sk a"></span><span class="sk b"></span></div>
      <div><span class="sk c"></span><span class="sk d"></span></div>
      <div class="fl"><span class="sk e"></span><span class="chip fresh"><span class="dot"></span>{COPY.lastGood}</span></div>
    </div>
  {/each}
</div>

<style>
  .skel { margin: 0; }
  .logo.sk { background: var(--surface-3); }
  .a { height: 14px; width: 70%; }
  .b { height: 12px; width: 40%; margin-top: 6px; }
  .c { height: 14px; width: 72px; }
  .d { height: 12px; width: 40px; margin: 6px 0 0 auto; }
  .e { height: 10px; flex: 1; }
</style>
