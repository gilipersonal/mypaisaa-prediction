<script lang="ts">
  import Icon from './Icon.svelte';
  import type { Icon as IconName } from '#lib/places.ts';
  /** The Journeys banner: a state said in one bold title and one sentence. */
  let { title, text, icon = 'info', kind = '' }: { title: string; text: string; icon?: IconName; kind?: '' | 'warn' | 'fall' } = $props();
</script>

<div class="jbanner {kind}" role="status"><Icon name={icon} size="s18" /><div><b>{title}</b> {text}</div></div>
