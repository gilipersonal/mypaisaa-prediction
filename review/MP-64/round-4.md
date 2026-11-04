# MP-64 review round 4

Snapshot: `1fd5ff61e9335d70608b2fde268f1a8ab26d4d97`. Delta: `git diff af66cc0..1fd5ff6` and its direct joins. The owner: "Yes, run round 4 (Recommended)". Brief: [round-4-brief.md](round-4-brief.md). The reports, word for word: [f](round-4-lane-f.md), [m](round-4-lane-m.md), [a](round-4-lane-a.md), [s](round-4-lane-s.md).

Four new reviewers, in the same lanes. Result: 42 findings, 18 blocking (R4-f1 and R4-s3 are one), no P0, 3 P1. All are fixed and held by `fixed.json`. Across the four rounds the blocking findings ran 56, 39, 35, 18, and the P1 findings 14, 8, 6, 3.

| Finding | Severity | Blocking | Anchor | Status |
| --- | --- | --- | --- | --- |
| R4-f1 | P2 | yes | `docs/design/admin/src/journeys/home.js:21` | fixed |
| R4-f2 | P2 | yes | `docs/design/admin/src/journeys/files.js:33` | fixed |
| R4-f3 | P2 | no | `docs/design/admin/src/journeys/audit.js:177` | fixed |
| R4-f4 | P2 | no | `docs/design/admin/src/journeys/files.js:29` | fixed |
| R4-f5 | P3 | no | `docs/design/admin/src/journeys/files.js:87` | fixed |
| R4-f6 | P3 | no | `docs/design/admin/src/journeys/files.js:69` | fixed |
| R4-f7 | P3 | no | `docs/design/admin/src/journeys/files.js:238` | fixed |
| R4-f8 | P3 | no | `docs/design/admin/src/journeys/audit.js:177` | fixed |
| R4-f9 | P3 | no | `docs/design/admin/src/journeys/audit.js:163` | fixed |
| R4-f10 | P3 | no | `docs/design/admin/src/journeys/files.js:147` | fixed |
| R4-f11 | P3 | no | `docs/design/admin/src/journeys/files.js:32` | fixed |
| R4-f12 | P3 | no | `docs/design/admin/src/journeys/home.js:20` | fixed |
| R4-m1 | P1 | yes | `docs/design/admin/src/journeys/models.js:115` | fixed |
| R4-m2 | P1 | yes | `docs/design/admin/src/journeys/runs.js:49` | fixed |
| R4-m3 | P2 | yes | `docs/design/admin/src/journeys/runs.js:265` | fixed |
| R4-m4 | P2 | yes | `docs/design/admin/src/journeys/models.js:66` | fixed |
| R4-m5 | P2 | no | `docs/design/admin/src/journeys/models.js:177` | fixed |
| R4-m6 | P3 | no | `docs/design/admin/src/journeys/runs.js:41` | fixed |
| R4-m7 | P3 | no | `docs/design/admin/src/journeys/models.js:41` | fixed |
| R4-m8 | P3 | no | `docs/design/admin/src/journeys/models.js:92` | fixed by the coordinator: Environment reads Production everywhere |
| R4-m9 | P3 | no | `docs/design/admin/src/journeys/models.js:254` | fixed |
| R4-a1 | P2 | yes | `docs/design/admin/src/journeys/costs.js:176` | fixed |
| R4-a2 | P2 | yes | `docs/design/admin/src/journeys/costs.js:175` | fixed |
| R4-a3 | P2 | yes | `docs/design/admin/src/journeys/costs.js:339` | fixed |
| R4-a4 | P2 | yes | `docs/design/admin/src/journeys/approvals.js:159` | fixed |
| R4-a5 | P2 | yes | `docs/design/journeys/src/journeys/approvals.js:149` | fixed |
| R4-a6 | P2 | yes | `docs/design/journeys/src/journeys/approvals.js:132` | fixed |
| R4-a7 | P2 | no | `docs/design/admin/src/journeys/costs.js:200` | fixed |
| R4-a8 | P3 | no | `docs/design/journeys/src/journeys/approvals.js:201` | fixed |
| R4-s1 | P1 | yes | `docs/design/admin/src/journeys/incidents.js:35` | fixed |
| R4-s2 | P2 | yes | `docs/design/admin/src/journeys/runs.js:38` | fixed |
| R4-s3 | P2 | yes | `docs/design/admin/src/journeys/home.js:21` | fixed: the same finding as R4-f1 |
| R4-s4 | P2 | yes | `docs/design/admin/src/journeys/identity.js:167` | fixed |
| R4-s5 | P2 | yes | `docs/planning/story-readiness-2026-11-03/stories/PH-07.json:147` | fixed |
| R4-s6 | P2 | yes | `docs/design/admin/src/journeys/incidents.js:168` | fixed |
| R4-s7 | P2 | no | `docs/design/admin/src/journeys/identity.js:238` | fixed |
| R4-s8 | P2 | no | `docs/design/admin/src/journeys/identity.js:139` | fixed |
| R4-s9 | P3 | no | `docs/design/admin/src/shell.js:16` | fixed |
| R4-s10 | P3 | no | `docs/design/admin/src/journeys/incidents.js:126` | fixed |
| R4-s11 | P3 | no | `docs/design/admin/src/journeys/incidents.js:399` | fixed |
| R4-s12 | P3 | no | `Jira MP-64` | fixed |
| R4-s13 | P2 | no | `tests/admin_facts/s.mjs:177` | fixed |
