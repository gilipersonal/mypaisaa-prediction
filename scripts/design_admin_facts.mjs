#!/usr/bin/env node
// What MP-64 asks of the admin page, proved with no browser, so CI can run it (docs/design/admin/README.md).
//
//   node scripts/design_admin_facts.mjs              # every check on docs/design/admin/index.html
//   node scripts/design_admin_facts.mjs --page PATH  # against another build, such as a designer's partial page
//   node scripts/design_admin_facts.mjs --selftest   # mutated copies must each be refused for their reason
//
// Exit 0 when all hold, 1 when one fails, 2 when it cannot run. A partial page (--page) skips only the checks that
// need the whole page, and says so.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { api, load, textOf } from './design_journeys_facts.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = join(ROOT, 'docs/design/admin/index.html');
const PERMS = JSON.parse(readFileSync(join(ROOT, 'docs/design/admin/permissions.json'), 'utf8'));
const IDS = ['home', 'files', 'audit', 'runs', 'agents', 'models', 'approvals', 'costs', 'incidents', 'identity'];
const STATES = ['default', 'loading', 'empty', 'partial', 'error', 'stale', 'offline', 'conflict', 'expired', 'denied'];
const SURFACES = ['iphone', 'ipad', 'web', 'pwa'];
const COVER = ['compare', 'decide', 'source', 'correct', 'config', 'cost', 'recover'];
const PROPOSED = /^(CT-\d+|PL-\d+|FC-\d+|FIN-OD-\d+|MP40-Q\d+|SCI-D\d+|DATA-DEC-\d+|POLICY-\d+|COST-Q\d+|ARC-06b-O\d)$/;
// A proposal names a record that exists, so an id must appear in the planning pack (lesson 36).
const planning = (() => { const out = []; const walkDir = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walkDir(p); else if (/\.(json|md)$/.test(n)) out.push(readFileSync(p, 'utf8')); } }; walkDir(join(ROOT, 'docs/planning')); return out.join('\n'); })();
// A button outside act() that reads like a write. Plain btn and bs are for moving around (R1-s4).
const WRITE = /\b(retry|refresh|run|resume|approve|confirm|reject|decline|delete|revoke|renew|save|apply|enrol|link|unlink|promote|restart|pause|replay|restore|switch|resolve|acknowledge|export|upload|reprocess|rebuild|correct|reverse|withdraw|forget|label|start again|choose)\b/i;
const NAV = /^(try again|sign in again|not now|back|close|cancel)$/i;
// One owner, no household; no over-claimed integrity; no word the records do not use for a pause (lesson 21).
const BARRED = [[/\b(household|team member|invite a user|add a user|admin role|other users?)\b/i, 'a multi-user word'], [/tamper[- ]?proof/i, 'an integrity claim'], [/kill switch/i, '"kill switch", which no record uses'], [/—/, 'an em dash'], [/\b(buy|sell|place an order|submit an order)\b/i, 'a trade word']];
const NEEDED = ['R1', 'R5', 'R6', 'R8'];   // the story's negative acceptance is drawn as a refusal

function walk(journeys, fn) {
  for (const j of journeys) for (const o of j.options) for (const s of o.screens) for (const kind of SURFACES) for (const state of STATES) {
    if ((s.na || {})[state]) continue;
    fn(s.render({ kind, state, scheme: 'light', journey: j.id, option: o.id, screen: s.id }), `${j.id}.${o.id}.${s.id} ${kind} ${state}`, { j, o, s, kind, state });
  }
}

export function problems(journeys, whole = true) {
  const out = [], acts = new Set(), refused = new Set(), live = new Set(), drawnIn = new Map();
  const heads = journeys.map((j) => j.id);
  if (whole && heads.join() !== IDS.join()) out.push(`the page holds ${heads}; it needs ${IDS}`);
  for (const j of journeys) {
    if (j.options.length < 2) out.push(`${j.id}: ${j.options.length} option(s), at least two are needed`);
    if (j.options.filter((o) => o.rec).length !== 1) out.push(`${j.id}: exactly one option is recommended`);
    for (const o of j.options) {
      const seen = new Set();
      for (const s of o.screens) { if (seen.has(s.id)) out.push(`${j.id}.${o.id}: screen ${s.id} twice`); seen.add(s.id); for (const [k, r] of Object.entries(s.na || {})) { if (!STATES.includes(k)) out.push(`${j.id}.${o.id}.${s.id}: na names ${k}, not a state`); if (String(r).length < 8) out.push(`${j.id}.${o.id}.${s.id}: ${k} is n/a with no reason`); } }
      if (j.id === 'home') continue;
      for (const k of COVER) {
        const v = (o.covers || {})[k];
        if (typeof v !== 'string') out.push(`${j.id}.${o.id}: covers has no ${k}`);
        else if (v.startsWith('n/a: ')) { if (v.length < 20) out.push(`${j.id}.${o.id}: ${k} is n/a with no reason`); }
        else if (!seen.has(v)) out.push(`${j.id}.${o.id}: covers.${k} names ${v}, which is not a screen of this option`);
      }
    }
  }
  walk(journeys, (html, at, where) => {
    for (const m of html.matchAll(/data-act="(A\d+)"/g)) { acts.add(m[1]); if (!drawnIn.has(m[1])) drawnIn.set(m[1], new Set()); drawnIn.get(m[1]).add(where.j.id); }
    for (const m of html.matchAll(/data-refuse="(R\d+)"/g)) refused.add(m[1]);
    // browser: live in a phone's browser (pwa) only, never in the iPhone app (ADM-04, MP-188)
    if (where.kind === 'iphone' || where.kind === 'pwa') for (const m of html.matchAll(/data-act="(A\d+)"(?! data-phone-off)/g)) { const ph = PERMS.actions.find((p) => p.id === m[1]).phone; if (ph !== 'live' && !(ph === 'browser' && where.kind === 'pwa')) out.push(`${at}: ${m[1]} is a live control on a phone`); }
    if (where.kind === 'iphone' || where.kind === 'pwa') for (const m of html.matchAll(/data-act="(A\d+)"(?! data-phone-off)/g)) live.add(m[1]);
    for (const m of html.replace(/<span class="aact"[^>]*>[\s\S]*?<\/span>/g, '').matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)) { const label = textOf(m[1]); if (WRITE.test(label) && !NAV.test(label)) out.push(`${at}: the button "${label}" reads like a write, outside act()`); }
    const text = textOf(html);
    if (!text) out.push(`${at}: nothing drawn`);
    for (const [re, why] of BARRED) if (re.test(text)) out.push(`${at}: ${why}: "${text.match(re)[0]}"`);
    for (const m of text.matchAll(/Proposed · ([A-Za-z0-9-]+)/g)) if (!PROPOSED.test(m[1]) || !planning.includes(m[1])) out.push(`${at}: Proposed names ${m[1]}, which is not a record id`);
  });
  if (whole) {
    for (const p of PERMS.actions) if (p.step_up !== 'outside' && p.control !== 'named' && !acts.has(p.id)) out.push(`${p.id} (${p.action}) has no control on any screen`);
    for (const p of PERMS.actions) if (p.control === 'named' && acts.has(p.id)) out.push(`${p.id} (${p.action}) is marked named, and a screen draws it`);
    for (const [id, js2] of drawnIn) { const p = PERMS.actions.find((x) => x.id === id); for (const j of js2) if (!p.journeys.includes(j)) out.push(`${id} is drawn in ${j}, and its row does not list that journey`); }
    for (const p of PERMS.actions) if ((p.phone === 'live' || p.phone === 'browser') && !live.has(p.id)) out.push(`${p.id} (${p.action}) is marked live on a phone, and no phone screen draws it live`);
    for (const p of PERMS.actions) if (!['live', 'off', 'browser'].includes(p.phone) && p.step_up !== 'outside') out.push(`${p.id} (${p.action}): phone is ${JSON.stringify(p.phone)}, not live, off or browser`);
    for (const p of PERMS.actions) if (!p.audit || /^(open|audit|none named)\b/i.test(p.audit) || /\[inferred|as \d/i.test(p.audit)) out.push(`${p.id}: the audit column does not name a record: "${p.audit}"`);
    for (const r of NEEDED) if (!refused.has(r)) out.push(`refusal ${r} is drawn nowhere`);
  }
  return [...new Set(out)];
}

function selftest() {
  const cases = [
    ['a missing cover', (js) => { delete js[1].options[0].covers.cost; }, 'covers has no cost'],
    ['a cover naming no screen', (js) => { js[1].options[0].covers.cost = 'nowhere'; }, 'not a screen of this option'],
    ['two recommended', (js) => { js[1].options[1].rec = true; }, 'exactly one option'],
    ['a state with no reason', (js) => { js[1].options[0].screens[0].na = { stale: 'no' }; }, 'n/a with no reason'],
    ['a barred word', (js) => { const r = js[1].options[0].screens[0].render; js[1].options[0].screens[0].render = (c) => r(c) + '<p>Hit the kill switch</p>'; }, 'kill switch'],
    ['an unknown proposal', (js) => { const r = js[1].options[0].screens[0].render; js[1].options[0].screens[0].render = (c) => r(c) + '<p>Proposed · SOON</p>'; }, 'not a record id'],
    ['a live control on a phone', (js) => { const r = js[1].options[0].screens[0].render; js[1].options[0].screens[0].render = (c) => r(c) + '<span class="aact" data-act="A07"><button>Approve</button></span>'; }, 'is a live control on a phone'],
    // A48 is browser: live on Phone web, and refused live in the iPhone app (ADM-04)
    ['a browser act live in the iPhone app', (js) => { const r = js[1].options[0].screens[0].render; js[1].options[0].screens[0].render = (c) => r(c) + (c.kind === 'iphone' ? '<span class="aact" data-act="A48"><button>Enrol a passkey</button></span>' : ''); }, 'A48 is a live control on a phone'],
    ['an unknown record', (js) => { const r = js[1].options[0].screens[0].render; js[1].options[0].screens[0].render = (c) => r(c) + '<p>Proposed · CT-99</p>'; }, 'not a record id'],
    ['a write outside act', (js) => { const r = js[1].options[0].screens[0].render; js[1].options[0].screens[0].render = (c) => r(c) + '<button class="btn">Retry safely</button>'; }, 'reads like a write'],
    ['an action undrawn', (js) => { for (const j of js) for (const o of j.options) for (const s of o.screens) { const r = s.render; s.render = (c) => r(c).replace(/data-act="A16"/g, ''); } }, 'A16'],
    ['a refusal undrawn', (js) => { for (const j of js) for (const o of j.options) for (const s of o.screens) { const r = s.render; s.render = (c) => r(c).replace(/data-refuse="R8"/g, ''); } }, 'refusal R8'],
    ['a named act drawn', (js) => { const r = js[1].options[0].screens[0].render; js[1].options[0].screens[0].render = (c) => r(c) + '<span class="aact" data-act="A63" data-phone-off="1"><button>Do it</button></span>'; }, 'is marked named'],
    ['an act outside its journeys', (js) => { const r = js[1].options[0].screens[0].render; js[1].options[0].screens[0].render = (c) => r(c) + '<span class="aact" data-act="A41" data-phone-off="1"><button>Do it</button></span>'; }, 'its row does not list'],
    ['a journey removed', (js) => { js.splice(2, 1); }, 'it needs'],
  ];
  let bad = 0;
  for (const [name, mutate, reason] of cases) {
    const js = load(PAGE);
    mutate(js);
    const got = problems(js);
    if (!got.some((p) => p.includes(reason))) { bad++; console.log(`FAIL selftest ${name}: not refused for "${reason}"`); }
  }
  console.log(`design-admin-facts selftest: ${cases.length - bad} of ${cases.length} faults refused`);
  return bad ? 1 : 0;
}

/* Checks that hold a fixed finding, one per finding, in tests/admin_facts/. Each gets api() from the journeys harness, whose each() walks admin's states. */
async function factFiles() {
  const dir = join(ROOT, 'tests/admin_facts'), out = {};
  if (!existsSync(dir)) return out;
  for (const n of readdirSync(dir).filter((x) => x.endsWith('.mjs')).sort()) for (const [k, v] of Object.entries((await import(pathToFileURL(join(dir, n)))).default)) { if (out[k]) throw new Error(`${k} is defined twice`); out[k] = v; }
  return out;
}
function adminApi(js) {
  const a = api(js);
  a.each = (f, fn) => {
    let n = 0;
    for (const j of js) { if (f.journey && f.journey !== j.id) continue; for (const o of j.options) { if (f.option && f.option !== o.id) continue; for (const s of o.screens) { if (f.screen && f.screen !== s.id) continue;
      for (const surface of f.surface ? [].concat(f.surface) : SURFACES) for (const state of f.state ? [].concat(f.state) : STATES) { n++; fn(a.view(j.id, o.id, s.id, surface, state), { journey: j.id, option: o.id, screen: s.id, surface, state }); } } } }
    a.must(n > 0, `the filter ${JSON.stringify(f)} matched no view`);
  };
  a.perms = PERMS;
  return a;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), i = args.indexOf('--page');
    if (args.includes('--selftest')) process.exit(selftest());
    // a check id: a review finding (R1-s1) or an issue's own fact (MP188-adm04-identity); --page and --journeys take a path
    const ids = args.filter((x, k) => /^(R\d+|MP\d+)-/.test(x) && !['--page', '--journeys'].includes(args[k - 1]));
    if (ids.length || args.includes('--facts')) {
      const facts = await factFiles(), a = adminApi(load(i >= 0 ? resolve(args[i + 1]) : PAGE)), run = ids.length ? ids : Object.keys(facts);
      let failed = 0;
      for (const id of run) {
        if (!facts[id]) { console.log(`CANNOT RUN ${id}: no such check`); process.exit(2); }
        try { facts[id](a); } catch (e) { failed++; console.log(`FAIL ${id}: ${String(e.message).slice(0, 240)}`); }
      }
      console.log(`design-admin-facts: ${run.length - failed} of ${run.length} checks hold`);
      process.exit(failed ? 1 : 0);
    }
    const page = i >= 0 ? resolve(args[i + 1]) : PAGE;
    const got = problems(load(page), i < 0);
    for (const p of got.slice(0, 60)) console.log(`FAIL ${p}`);
    console.log(`design-admin-facts: ${got.length} problem(s)${i >= 0 ? ' on a partial page; whole-page checks skipped' : ''}`);
    process.exit(got.length ? 1 : 0);
  } catch (e) {
    console.log(`CANNOT RUN: ${e.message}`);
    process.exit(2);
  }
}
