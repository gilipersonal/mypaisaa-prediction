<script lang="ts">
  /** The design's calbar(): the observed coverage against the 80% target. */
  let { r, label }: { r: number; label: string } = $props();
</script>

<div class="calbar" role="img" aria-label="{label}: observed {r}% against a target of 80%"><i style="width:{r}%"></i><b></b></div>
