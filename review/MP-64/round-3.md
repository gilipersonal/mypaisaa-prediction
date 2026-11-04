# MP-64 review round 3

Snapshot: `af66cc03f8cfbcf87090d7fb3c82021a101a9f61`. Delta: `git diff 0d1ab4e..af66cc0` and its direct joins. The owner: "Yes, run round 3 (Recommended)". Brief: [round-3-brief.md](round-3-brief.md). The reports, word for word: [f](round-3-lane-f.md), [m](round-3-lane-m.md), [a](round-3-lane-a.md), [s](round-3-lane-s.md).

Four new reviewers, in the same lanes. Result: 63 findings, 35 blocking, no P0, 6 P1. All 35 are fixed and held by `fixed.json`. Across the three rounds the blocking findings ran 56, 39, 35, and the P1 findings 14, 8, 6.

| Finding | Severity | Blocking | Anchor | Status |
| --- | --- | --- | --- | --- |
| R3-f1 | P1 | yes | `docs/design/admin/src/journeys/files.js:32` | fixed |
| R3-f2 | P2 | yes | `docs/design/admin/src/journeys/audit.js:185` | fixed |
| R3-f3 | P2 | yes | `docs/design/admin/src/journeys/audit.js:108` | fixed |
| R3-f4 | P2 | yes | `docs/design/admin/src/journeys/audit.js:233` | fixed |
| R3-f5 | P2 | yes | `docs/design/admin/src/journeys/audit.js:233` | fixed |
| R3-f6 | P2 | yes | `docs/design/admin/src/journeys/audit.js:163` | fixed |
| R3-f7 | P2 | yes | `docs/design/admin/src/journeys/home.js:41` | fixed |
| R3-f8 | P2 | yes | `docs/design/admin/src/journeys/audit.js:177` | fixed |
| R3-f9 | P2 | yes | `docs/design/admin/src/journeys/files.js:69` | fixed |
| R3-f10 | P2 | yes | `docs/design/admin/src/journeys/files.js:121` | fixed |
| R3-f11 | P3 | no | `docs/design/admin/src/journeys/files.js:39` | fixed |
| R3-f12 | P3 | no | `docs/design/admin/src/journeys/files.js:61` | fixed |
| R3-f13 | P3 | no | `docs/design/admin/src/journeys/files.js:121` | fixed |
| R3-f14 | P3 | no | `docs/design/admin/src/journeys/files.js:238` | fixed |
| R3-f15 | P3 | no | `docs/design/admin/src/journeys/home.js:18` | fixed |
| R3-f16 | P3 | no | `docs/design/admin/src/journeys/home.js:26` | fixed |
| R3-f17 | P3 | no | `docs/design/admin/src/journeys/audit.js:90` | fixed |
| R3-m1 | P1 | yes | `docs/design/admin/src/journeys/models.js:40` | fixed |
| R3-m2 | P2 | yes | `docs/design/admin/src/journeys/models.js:31` | fixed |
| R3-m3 | P2 | yes | `docs/design/admin/src/journeys/models.js:23` | fixed |
| R3-m4 | P2 | yes | `docs/design/admin/src/journeys/models.js:141` | fixed |
| R3-m5 | P2 | yes | `docs/design/admin/src/journeys/models.js:171` | fixed |
| R3-m6 | P2 | yes | `docs/design/admin/src/journeys/models.js:72` | fixed |
| R3-m7 | P2 | yes | `docs/design/admin/src/journeys/home.js:20` | fixed |
| R3-m8 | P2 | no | `docs/design/admin/src/journeys/models.js:113` | fixed |
| R3-m9 | P2 | no | `docs/design/admin/src/journeys/agents.js:158` | fixed |
| R3-m10 | P3 | no | `docs/design/admin/src/journeys/models.js:141` | fixed |
| R3-m11 | P3 | no | `docs/design/admin/src/journeys/models.js:125` | fixed |
| R3-m12 | P3 | no | `docs/design/admin/src/journeys/models.js:65` | fixed |
| R3-m13 | P3 | no | `docs/design/admin/src/journeys/models.js:220` | fixed |
| R3-m14 | P3 | no | `docs/design/admin/src/journeys/models.js:47` | fixed |
| R3-m15 | P3 | no | `docs/design/admin/src/journeys/runs.js:60` | fixed |
| R3-m16 | P3 | no | `docs/design/admin/src/journeys/models.js:204` | fixed |
| R3-a1 | P1 | yes | `docs/design/admin/src/journeys/approvals.js:158` | fixed |
| R3-a2 | P1 | yes | `docs/design/journeys/src/journeys/approvals.js:125` | fixed |
| R3-a3 | P1 | yes | `docs/design/admin/src/journeys/costs.js:173` | fixed |
| R3-a4 | P2 | yes | `docs/design/journeys/src/journeys/approvals.js:453-454` | fixed |
| R3-a5 | P2 | yes | `docs/design/admin/src/journeys/approvals.js:185` | fixed |
| R3-a6 | P2 | yes | `docs/design/admin/src/journeys/costs.js:245` | fixed |
| R3-a7 | P2 | yes | `docs/design/admin/src/journeys/approvals.js:185` | fixed |
| R3-a8 | P2 | yes | `docs/design/admin/src/journeys/approvals.js:178` | fixed |
| R3-a9 | P2 | no | `docs/design/admin/src/journeys/costs.js:178` | partly fixed: whether A76 stays live in Failed is the owner's |
| R3-a10 | P2 | no | `docs/design/admin/src/journeys/costs.js:196` | mostly fixed |
| R3-a11 | P3 | no | `docs/design/journeys/src/journeys/approvals.js:560` | fixed |
| R3-a12 | P3 | no | `docs/design/admin/src/journeys/approvals.js:163` | fixed |
| R3-a13 | P3 | no | `docs/design/admin/src/journeys/costs.js:173-174` | fixed |
| R3-a14 | P3 | no | `docs/design/admin/src/journeys/costs.js:224` | partly fixed: no Refuse on Costs |
| R3-s1 | P1 | yes | `docs/design/admin/src/journeys/identity.js:238 (also :37` | fixed |
| R3-s2 | P2 | yes | `docs/design/admin/src/journeys/incidents.js:149` | fixed |
| R3-s3 | P2 | yes | `docs/design/admin/src/journeys/incidents.js:149` | fixed |
| R3-s4 | P2 | yes | `docs/design/admin/src/journeys/incidents.js:90` | fixed |
| R3-s5 | P2 | yes | `docs/design/admin/src/journeys/incidents.js:254 (and :53` | fixed |
| R3-s6 | P2 | yes | `docs/design/admin/src/shell.js:312` | fixed |
| R3-s7 | P2 | yes | `docs/design/admin/src/journeys/identity.js:124 and docs/design/admin/permissions.json:551-560` | fixed |
| R3-s8 | P2 | yes | `scripts/design_admin_facts.mjs:93 (rules at :71` | fixed |
| R3-s9 | P2 | yes | `docs/planning/story-readiness-2026-11-03/stories/PH-07.json:595` | fixed |
| R3-s10 | P2 | yes | `docs/design/admin/src/journeys/identity.js:169 (and :163` | fixed |
| R3-s11 | P2 | no | `docs/design/admin/src/journeys/identity.js:38 (option B only)` | fixed |
| R3-s12 | P3 | no | `docs/design/admin/src/journeys/identity.js:35` | fixed |
| R3-s13 | P2 | no | `docs/design/admin/src/journeys/incidents.js:124-125` | partly fixed: no UK job or trace ids minted |
| R3-s14 | P3 | no | `docs/design/admin/src/shell.js:434` | fixed |
| R3-s15 | P3 | no | `docs/design/admin/src/journeys/identity.js:299` | fixed |
| R3-s16 | P3 | no | `docs/design/admin/src/journeys/incidents.js:165` | fixed |
