<script lang="ts">
  import Icon from '#lib/components/Icon.svelte';
  /** The design's chip(): a status word, with an icon, or the dot a proposed or settled chip carries. */
  let { text, kind = '', icon = '', dot = false }: { text: string; kind?: '' | 'proposed' | 'illus' | 'owner'; icon?: string; dot?: boolean } = $props();
</script>

<span class="chip{kind ? ` ${kind}` : ''}">{#if icon}<Icon name={icon} size="s14" />{:else if dot || kind === 'proposed'}<span class="dot"></span>{/if}{text}</span>
