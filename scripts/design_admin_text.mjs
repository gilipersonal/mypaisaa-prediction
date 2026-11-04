#!/usr/bin/env node
// Print what a screen of the admin page says, with no browser, for a reader checking wording and figures.
//   node scripts/design_admin_text.mjs                          # every journey, option and screen id
//   node scripts/design_admin_text.mjs files a a-queue [state] [device]   # one screen; state default, device web
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load, textOf } from './design_journeys_facts.mjs';
const page = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'docs/design/admin/index.html');
const js = load(page), [j, o, s, state = 'default', kind = 'web'] = process.argv.slice(2);
if (!j) { for (const x of js) for (const y of x.options) console.log(x.id, y.id, y.screens.map((z) => z.id).join(' ')); process.exit(0); }
const sc = js.find((x) => x.id === j).options.find((x) => x.id === o).screens.find((x) => x.id === s);
if ((sc.na || {})[state]) console.log(`n/a: ${sc.na[state]}`);
else console.log(textOf(sc.render({ kind, state, scheme: 'light', journey: j, option: o, screen: s })));
