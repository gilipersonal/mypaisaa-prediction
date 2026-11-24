// MP-180: the Journeys page's long frame. Forcing every frame on the page to render cost a 51 to 64 ms frame on Chrome
// at 4x CPU when the theme switched; off-screen frames now skip rendering, as Prism's own boards do. A walker measuring
// every frame at its true size (window.__prismNoFit) still has every frame rendered. Both halves are pinned (lesson 59);
// the behaviour is proved by `node scripts/design_runtime.mjs docs/design/journeys/index.html --engine chrome` (local).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const page = () => { const i = process.argv.indexOf('--page'); return i >= 0 ? resolve(process.argv[i + 1]) : resolve(ROOT, 'docs/design/journeys/index.html'); };

export default {
  'MP180-offscreen-frames-skip': ({ must }) => {
    const html = readFileSync(page(), 'utf8');
    const rule = html.match(/\.jrow \.board \{([^}]*)\}/);
    must(rule, 'no .jrow .board rule on the page');
    must(/content-visibility:\s*auto/.test(rule[1]), `a viewer's frames all render again: .jrow .board {${rule[1]}}`);
    must(/\.jall \.jrow \.board \{\s*content-visibility:\s*visible;\s*\}/.test(html), 'a walker no longer has every frame rendered');
    must(/root\.classList\.toggle\('jall', !!window\.__prismNoFit\)/.test(html), 'the page no longer marks a walker\'s view');
  },
};
