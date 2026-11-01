import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { NODES, EDGES, PATHS, JOURNEY, PHASES } from "./content.js";

const site = fileURLToPath(new URL("..", import.meta.url));
const output = path.join(site, "dist");
const ids = new Set(NODES.map((n) => n.id));
assert.equal(ids.size, NODES.length, "Duplicate component identity");
for (const e of EDGES) {
  assert(ids.has(e.from) && ids.has(e.to), "Edge with missing endpoint");
  assert(e.label.trim());
}
for (const n of NODES) {
  assert(
    EDGES.some((e) => e.from === n.id || e.to === n.id),
    "Unconnected component",
  );
  for (const key of ["input", "output", "trust", "failure"])
    assert(n[key]?.trim(), "Missing integration contract");
}
for (const p of PATHS)
  for (const id of p.nodes) assert(ids.has(id), "Invalid journey component");
for (const j of JOURNEY)
  for (const id of j.nodes) assert(ids.has(id), "Invalid narrative component");
assert.equal(new Set(PHASES.map((p) => p[0])).size, 10);
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(output, "architecture/assets/provenance.json"),
    "utf8",
  ),
);
assert.equal(
  JSON.parse(fs.readFileSync(path.join(site, ".openai/hosting.json"), "utf8"))
    .project_id,
  "appgprj_6ae70bec3f6c8191947480b6423b4bb1",
  "Site identity changed",
);
for (const e of manifest.native_exports) {
  const file = path.join(output, "architecture/assets", e.file);
  assert.equal(
    createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
    e.sha256,
    "Native export changed",
  );
}
for (const [relative, digest] of Object.entries(manifest.local_source_hashes)) {
  const source = path.resolve(site, "..", relative);
  if (fs.existsSync(source))
    assert.equal(
      createHash("sha256").update(fs.readFileSync(source)).digest("hex"),
      digest,
      "Architecture source drift requires a new snapshot",
    );
}
for (const relative of ["index.html", "architecture/index.html"]) {
  const file = path.join(output, relative);
  const html = fs.readFileSync(file, "utf8");
  assert(/<html[^>]+lang="en"/.test(html));
  assert(html.includes('name="viewport"'));
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(?:https?:|data:|#)/.test(url)) continue;
    const local = path.resolve(
      url.startsWith("/") ? output : path.dirname(file),
      url.replace(/^\//, ""),
    );
    assert(local.startsWith(output + path.sep), "Path escaped static output");
    assert(fs.existsSync(local), "Missing built resource: " + url);
  }
}
const main = fs.readFileSync(path.join(site, "architecture/main.jsx"), "utf8");
assert(
  !/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(main),
  "Presentation must not call live application services",
);
assert(
  main.includes("useState(false)") && main.includes("useSystemReducedMotion"),
  "Static-first motion contract missing",
);
const film = fs.readFileSync(
  path.join(site, "architecture/StoryFilm.jsx"),
  "utf8",
);
assert(film.includes("autoPlay={false}"), "Story must not autoplay");
console.log(
  `PASS: ${NODES.length} component contracts, ${EDGES.length} labelled joins, ${PATHS.length} valid map paths, native hashes, source snapshot, Site identity and built local resources.`,
);
