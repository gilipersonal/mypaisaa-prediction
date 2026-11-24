<script lang="ts">
  /** Prism's roll(v): a figure that can roll to a new value; the ghost holds its width. */
  let { v }: { v: string } = $props();
</script>

<span class="roll" data-roll={v}><span class="roll-ghost" aria-hidden="true">{v}</span><span class="roll-live">{v}</span></span>
