# MP-64 review round 5

Snapshot: `eacda924ea4c470026075344edc16b7cae625671`. Delta: `git diff 1fd5ff6..eacda92` and its direct joins. The owner: "Yes, run round 5 (Recommended)". Brief: [round-5-brief.md](round-5-brief.md). The reports, word for word: [f](round-5-lane-f.md), [m](round-5-lane-m.md), [a](round-5-lane-a.md), [s](round-5-lane-s.md).

Four new reviewers, in the same lanes. Result: 38 findings, 16 blocking, no P0, 3 P1. Across the five rounds the blocking findings ran 56, 39, 35, 18, 16, and the P1 findings 14, 8, 6, 3, 3. This is the last round the rule allows, so the findings stand open for the owner.

| Finding | Severity | Blocking | Anchor | Status |
| --- | --- | --- | --- | --- |
| R5-f1 | P2 | yes | `docs/design/admin/src/journeys/audit.js:162` | open |
| R5-f2 | P2 | yes | `docs/design/admin/src/journeys/files.js:111` | open |
| R5-f3 | P2 | no | `docs/design/admin/src/journeys/approvals.js:231` | open |
| R5-f4 | P3 | no | `docs/design/admin/src/journeys/home.js:41` | open |
| R5-f5 | P3 | no | `docs/design/admin/src/journeys/home.js:20` | open |
| R5-f6 | P3 | no | `docs/design/admin/src/journeys/home.js:64` | open |
| R5-f7 | P3 | no | `docs/design/admin/src/journeys/home.js:11` | open |
| R5-f8 | P3 | no | `docs/design/admin/src/journeys/files.js:238` | open |
| R5-m1 | P1 | yes | `docs/design/admin/src/journeys/models.js:105` | open |
| R5-m2 | P2 | yes | `docs/design/admin/src/journeys/models.js:66` | open |
| R5-m3 | P2 | yes | `docs/design/admin/src/journeys/models.js:36` | open |
| R5-m4 | P2 | yes | `docs/design/admin/src/journeys/runs.js:272` | open |
| R5-m5 | P2 | yes | `docs/design/admin/src/journeys/runs.js:41-42` | open |
| R5-m6 | P2 | no | `docs/design/admin/src/journeys/runs.js:55` | open |
| R5-m7 | P2 | no | `docs/design/admin/src/journeys/models.js:36` | open |
| R5-m8 | P3 | no | `docs/design/admin/src/journeys/models.js:152` | open |
| R5-m9 | P3 | no | `docs/design/admin/src/journeys/runs.js:158` | open |
| R5-m10 | P3 | no | `docs/design/admin/src/journeys/runs.js:238` | open |
| R5-m11 | P3 | no | `docs/design/admin/src/journeys/models.js:115` | open |
| R5-a1 | P1 | yes | `docs/design/journeys/src/journeys/approvals.js:135` | open |
| R5-a2 | P2 | yes | `docs/design/admin/src/journeys/approvals.js:301` | open |
| R5-a3 | P2 | yes | `docs/design/admin/src/journeys/approvals.js:313` | open |
| R5-a4 | P2 | yes | `docs/design/admin/src/journeys/costs.js:201` | open |
| R5-a5 | P2 | no | `docs/design/admin/src/journeys/costs.js:175` | open |
| R5-a6 | P3 | no | `docs/design/admin/src/journeys/costs.js:340` | open |
| R5-a7 | P3 | no | `docs/design/admin/src/journeys/approvals.js:159` | open |
| R5-s1 | P1 | yes | `TECH-STACK.md:135` | open |
| R5-s2 | P2 | yes | `docs/design/admin/src/shell.js:99` | open |
| R5-s3 | P2 | yes | `docs/design/admin/src/journeys/identity.js:159` | open |
| R5-s4 | P2 | yes | `docs/design/admin/src/journeys/incidents.js:178` | open |
| R5-s5 | P2 | yes | `docs/design/admin/src/journeys/incidents.js:165` | open |
| R5-s6 | P2 | no | `docs/design/admin/src/shell.js:302` | open |
| R5-s7 | P2 | no | `review/MP-64/state.json (round 4` | open |
| R5-s8 | P3 | no | `docs/design/admin/src/journeys/identity.js:180` | open |
| R5-s9 | P3 | no | `docs/design/admin/src/journeys/incidents.js:340` | open |
| R5-s10 | P3 | no | `docs/design/admin/src/journeys/incidents.js:91` | open |
| R5-s11 | P3 | no | `docs/design/admin/src/journeys/incidents.js:409` | open |
| R5-s12 | P3 | no | `docs/design/reviews/MP-64/decision.md:44` | open |
