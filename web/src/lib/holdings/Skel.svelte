<script lang="ts">
  import { SKEL_CHIP } from './design.ts';
  /** Rows still loading, as Prism's skelRow() draws them: shapes only, with the last good time kept in view. */
  let { n = 3 }: { n?: number } = $props();
</script>

<div class="card" aria-busy="true">
  <span class="sr">Loading</span>
  {#each Array.from({ length: n }, (_, i) => i) as i (i)}
    <div class="hrow">
      <span class="logo sk"></span>
      <div><span class="sk a"></span><span class="sk b"></span></div>
      <div><span class="sk c"></span><span class="sk d"></span></div>
      <div class="fl"><span class="sk e"></span><span class="chip fresh"><span class="dot"></span>{SKEL_CHIP}</span></div>
    </div>
  {/each}
</div>

<style>
  .hrow { cursor: default; }
  .logo.sk { background: var(--surface-3); }
  .a { height: 14px; width: 70%; }
  .b { height: 12px; width: 40%; margin-top: 6px; }
  .c { height: 14px; width: 72px; }
  .d { height: 12px; width: 40px; margin: 6px 0 0 auto; }
  .e { height: 10px; flex: 1; }
</style>
