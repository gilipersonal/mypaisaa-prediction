// The app's Prism component styles are lines copied word for word from Prism (docs/design/prism/index.html).
// With --check, every rule line in src/lib/prism/components.css must appear exactly in Prism, so a component is
// changed in Prism first and never redrawn in the app (.claude/rules/design-sync.md). Fails closed.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
/** @param {string} componentsCss @param {string} prismHtml @returns {string[]} */
export function problems(componentsCss, prismHtml) {
  const prism = new Set(prismHtml.split('\n').map((/** @type {string} */ l) => l.trim()));
  const out = [];
  let rules = 0;
  for (const [i, raw] of componentsCss.split('\n').entries()) {
    const line = raw.trim();
    if (!line || line.startsWith('/*')) continue;
    rules += 1;
    if (!prism.has(line)) out.push(`components.css:${i + 1} is not a Prism line: ${line.slice(0, 90)}`);
  }
  if (rules === 0) out.push('components.css holds no rules');
  return out;
}

if (process.argv.includes('--check')) {
  let css, html;
  try {
    css = readFileSync(join(web, 'src', 'lib', 'prism', 'components.css'), 'utf8');
    html = readFileSync(join(web, '..', 'docs', 'design', 'prism', 'index.html'), 'utf8');
  } catch (e) {
    console.error(`prism-components: cannot read a source: ${e instanceof Error ? e.message : e}`);
    process.exit(2);
  }
  const p = problems(css, html);
  if (p.length) {
    console.error(p.join('\n'));
    process.exit(1);
  }
  console.log('prism-components: every component rule is Prism\'s own');
}
