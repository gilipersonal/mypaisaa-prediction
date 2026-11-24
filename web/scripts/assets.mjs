// Copy the brand mark into static/brand for the web manifest. docs/brand stays the one source; static/brand is
// generated and git-ignored. The mark is "Proposed for the app" (docs/brand/README.md) until the owner's UX approval.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const web = join(dirname(fileURLToPath(import.meta.url)), '..');
const brand = join(web, '..', 'docs', 'brand');
const out = join(web, 'static', 'brand');
const files = ['mark-icon.svg', 'mark-64.png', 'mark-256.png', 'mark-512.png', 'mark-icon-1024.png'];

mkdirSync(out, { recursive: true });
for (const f of files) {
  const from = join(brand, f);
  if (!existsSync(from)) {
    console.error(`assets: ${from} is missing`);
    process.exit(1);
  }
  copyFileSync(from, join(out, f));
}
console.log(`assets: ${files.length} brand files copied from docs/brand`);
