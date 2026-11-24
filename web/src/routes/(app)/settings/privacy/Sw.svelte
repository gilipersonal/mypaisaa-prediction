<script lang="ts">
  /** privacy.js sw(label, on, dis): a switch as the design draws it. What a press does is the caller's. */
  let { label, on, disabled = false, onpress, id }: { label: string; on: boolean; disabled?: boolean; onpress: () => void; id?: string } = $props();
</script>

<button class="dimctl privacy-switch" type="button" role="switch" aria-checked={on} aria-label={label} {disabled} {id} onclick={onpress}><span>{on ? 'On' : 'Off'}</span><span class="sw2"><i></i></span></button>
