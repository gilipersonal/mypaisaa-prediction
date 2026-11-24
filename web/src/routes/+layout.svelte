<script lang="ts">
  // Prism is the one source of tokens and icons; the app reads them in place and keeps no copy.
  import '../../../docs/design/prism/tokens.css';
  import '#lib/prism/components.css';
  import '../app.css';
  import sprite from '../../../docs/design/prism/icons.svg?raw';

  let { children } = $props();
</script>

<!-- Prism's icon sprite, once per page -->
{@html sprite}

{@render children()}
