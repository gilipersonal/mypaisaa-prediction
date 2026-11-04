# MP-64 review round 1

Snapshot: `6705fc1c023d1f2c9739e63b56f486fa9cd2b0d7`, branch `MP-64-admin-journeys`. The owner: "Yes, run round 1". Brief: [round-1-brief.md](round-1-brief.md). The reviewers' reports, word for word: [f](round-1-lane-f.md), [m](round-1-lane-m.md), [a](round-1-lane-a.md), [s](round-1-lane-s.md).

Four reviewers: f (Home, Files, Audit), m (Runs, Agents, Models), a (Approvals, Costs), s (Incidents, Identity, shell, inventory, scripts, records). Result: 100 findings, 56 blocking, no P0, 14 P1. All 56 are fixed and held by `fixed.json`, one check each, in `tests/admin_facts/`. Makers proved their checks by undoing each fix on a copy of the page.

| Finding | Severity | Blocking | Anchor | Status |
| --- | --- | --- | --- | --- |
| R1-f1 | P1 | yes | `audit.js:168` | fixed |
| R1-f2 | P1 | yes | `files.js:104` | fixed |
| R1-f3 | P1 | yes | `files.js:115` | fixed |
| R1-f4 | P2 | yes | `audit.js:196` | fixed |
| R1-f5 | P2 | yes | `audit.js:170` | fixed |
| R1-f6 | P2 | yes | `audit.js:180-181` | fixed |
| R1-f7 | P2 | yes | `audit.js:183-194` | fixed |
| R1-f8 | P2 | yes | `home.js:19` | fixed |
| R1-f9 | P2 | yes | `home.js:45-46` | fixed |
| R1-f10 | P2 | yes | `home.js:15` | fixed |
| R1-f11 | P2 | yes | `files.js:129` | fixed |
| R1-f12 | P2 | yes | `files.js:60` | fixed |
| R1-f13 | P2 | yes | `files.js:70` | fixed |
| R1-f14 | P2 | yes | `files.js:135` | fixed |
| R1-f15 | P2 | yes | `files.js:137-152` | fixed |
| R1-f16 | P2 | yes | `files.js:50` | fixed |
| R1-f17 | P2 | no | `files.js:32` | fixed |
| R1-f18 | P3 | no | `files.js:103-108` | fixed |
| R1-f19 | P3 | no | `home.js:24` | fixed |
| R1-f20 | P3 | no | `audit.js:168-169` | partly fixed: the selected row can still fall below the desktop first view |
| R1-f21 | P3 | no | `audit.js:151` | fixed |
| R1-f22 | P3 | no | `files.js:140` | open: A19 download on a phone is the owner's call |
| R1-f23 | P3 | no | `home.js:16` | open: Settings has no door into admin; for MP-66 |
| R1-f24 | P3 | no | `docs/design/admin/src/journeys/audit.css:7` | partly fixed: the mono token is used; the step lists are not promoted to Prism |
| R1-m1 | P1 | yes | `models.js:21` | fixed |
| R1-m2 | P1 | yes | `docs/design/admin/permissions.json` | fixed |
| R1-m3 | P2 | yes | `agents.js:33` | fixed |
| R1-m4 | P2 | yes | `models.js:44` | fixed |
| R1-m5 | P2 | yes | `runs.js:33-37` | fixed |
| R1-m6 | P2 | yes | `runs.js:79` | fixed |
| R1-m7 | P2 | yes | `runs.js:46` | fixed |
| R1-m8 | P2 | yes | `agents.js:141` | fixed |
| R1-m9 | P2 | yes | `runs.js:49` | fixed |
| R1-m10 | P2 | yes | `models.js:29` | fixed |
| R1-m11 | P2 | yes | `models.js:81` | fixed |
| R1-m12 | P2 | yes | `agents.js:47` | fixed |
| R1-m13 | P2 | yes | `docs/design/admin/permissions.json:358` | fixed |
| R1-m14 | P2 | no | `agents.js:60` | fixed |
| R1-m15 | P2 | no | `agents.js:127` | fixed |
| R1-m16 | P2 | no | `agents.js:49` | fixed |
| R1-a1 | P1 | yes | `costs.js:73` | fixed |
| R1-a2 | P1 | yes | `approvals.js:97, 100, 101, 128, 167` | fixed |
| R1-a3 | P1 | yes | `costs.js:163, 189-192` | fixed |
| R1-a4 | P2 | yes | `approvals.js:95, 197, 268` | fixed |
| R1-a5 | P2 | yes | `approvals.js:66-69, 270` | fixed |
| R1-a6 | P2 | yes | `approvals.js:227` | fixed |
| R1-a7 | P2 | yes | `costs.js:71-76, 268` | fixed |
| R1-a8 | P2 | yes | `costs.js:147, 163` | fixed |
| R1-a9 | P2 | yes | `costs.js:117` | fixed |
| R1-a10 | P2 | yes | `approvals.js:165, 172` | fixed |
| R1-a11 | P2 | yes | `approvals.js:173, 176` | fixed |
| R1-a12 | P2 | yes | `approvals.js:66-69` | fixed |
| R1-a13 | P2 | yes | `approvals.js:144, 154, 156` | fixed |
| R1-a14 | P2 | yes | `costs.js:55, 82, 133` | fixed |
| R1-a15 | P2 | yes | `shell.js:65-69` | fixed |
| R1-a16 | P2 | yes | `files.js:50` | fixed |
| R1-a17 | P2 | no | `costs.js:123` | fixed |
| R1-a18 | P3 | no | `costs.js:171` | fixed |
| R1-a19 | P3 | no | `approvals.js:138` | fixed |
| R1-a20 | P3 | no | `approvals.js:138` | fixed |
| R1-a21 | P3 | no | `costs.js:163` | fixed |
| R1-a22 | P3 | no | `costs.js:260` | fixed |
| R1-a23 | P3 | no | `approvals.js:101, 206` | fixed |
| R1-a24 | P3 | no | `costs.js:107` | fixed |
| R1-a25 | P3 | no | `approvals.js:31` | fixed |
| R1-s1 | P1 | yes | `src/journeys/identity.js:156` | fixed |
| R1-s2 | P1 | yes | `src/journeys/incidents.js:174-176` | fixed |
| R1-s3 | P1 | yes | `src/journeys/incidents.js:205` | fixed |
| R1-s4 | P1 | yes | `README.md:10` | fixed |
| R1-s5 | P1 | yes | `src/journeys/incidents.js:346` | fixed |
| R1-s6 | P1 | yes | `docs/planning/ma-reconciliation-2026-11-02/gap-register.json:1820` | fixed |
| R1-s7 | P2 | yes | `src/journeys/home.js:16` | fixed |
| R1-s8 | P2 | yes | `permissions.json:502` | fixed |
| R1-s9 | P2 | yes | `permissions.json:237` | fixed |
| R1-s10 | P2 | yes | `src/journeys/incidents.js:144` | fixed |
| R1-s11 | P2 | yes | `src/journeys/incidents.js:178` | fixed |
| R1-s12 | P2 | no | `src/journeys/identity.js:23` | fixed |
| R1-s13 | P2 | no | `src/shell.js:68` | fixed |
| R1-s14 | P2 | no | `src/journeys/identity.js` | fixed |
| R1-s15 | P2 | no | `src/journeys/identity.js:39` | fixed |
| R1-s16 | P2 | no | `src/journeys/identity.js:57` | fixed |
| R1-s17 | P2 | no | `src/shell.js:175` | fixed |
| R1-s18 | P2 | no | `review/MP-64/state.json:28` | fixed |
| R1-s19 | P2 | no | `scripts/design_journeys_check.mjs:89-90` | fixed |
| R1-s20 | P3 | no | `src/shell.js` | fixed |
| R1-s21 | P3 | no | `src/journeys/home.js:11` | fixed |
| R1-s22 | P3 | no | `docs/planning/trace.json` | partly fixed: as_of updated; MP-179 has no issue links yet |
| R1-s23 | P3 | no | `scripts/design_admin_press.mjs:8` | fixed |
| R1-m17 | P3 | no | `runs.js:250` | fixed |
| R1-m18 | P3 | no | `runs.js:130` | fixed |
| R1-m19 | P3 | no | `agents.js:113` | fixed |
| R1-m20 | P3 | no | `agents.js:28` | fixed |
| R1-m21 | P3 | no | `runs.js:49-50` | fixed |
| R1-m22 | P3 | no | `models.js:60` | fixed |
| R1-m23 | P3 | no | `models.js:61` | fixed |
| R1-m24 | P3 | no | `models.js:126` | open: R1-LGB against ridge is the owner's, on the open list |
| R1-m25 | P3 | no | `agents.js:78` | fixed |
| R1-m26 | P3 | no | `models.js:55` | fixed |
| R1-m27 | P3 | no | `models.js:112` | fixed |
| R1-m28 | P3 | no | `runs.js:66` | fixed |
