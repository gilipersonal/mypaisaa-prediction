<script lang="ts">
  // Prism is the one source of tokens and icons; the app reads them in place and keeps no copy.
  // the faces the design page loads (Inter 400 to 700, Nunito 700 and 800 for figures), served by the app itself, never fetched
  import '@fontsource/inter/400.css';
  import '@fontsource/inter/500.css';
  import '@fontsource/inter/600.css';
  import '@fontsource/inter/700.css';
  import '@fontsource/nunito/700.css';
  import '@fontsource/nunito/800.css';
  import '../../../docs/design/prism/tokens.css';
  import '#lib/prism/design.generated.css';
  import '../app.css';
  import sprite from '../../../docs/design/prism/icons.svg?raw';

  let { children } = $props();
</script>

<!-- Prism's icon sprite, once per page -->
{@html sprite}

{@render children()}
