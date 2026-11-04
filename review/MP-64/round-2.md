# MP-64 review round 2

Snapshot: `0d1ab4eae441376556b648572b51ff59536fc83e`. Delta: `git diff 6705fc1..0d1ab4e` and its direct joins. The owner: "Yes, run round 2 (Recommended)". Brief: [round-2-brief.md](round-2-brief.md). The reports, word for word: [f](round-2-lane-f.md), [m](round-2-lane-m.md), [a](round-2-lane-a.md), [s](round-2-lane-s.md).

Four new reviewers, in the same lanes. Result: 72 findings, 39 blocking, no P0, 8 P1. All 39 are fixed and held by `fixed.json`. R2-m2 is fixed by a label, and its question is on the page for the owner. Across the two rounds the blocking findings ran 56, 39, and the P1 findings 14, 8.

| Finding | Severity | Blocking | Anchor | Status |
| --- | --- | --- | --- | --- |
| R2-f1 | P1 | yes | `files.js:58` | fixed |
| R2-f2 | P2 | yes | `files.js:59` | fixed |
| R2-f3 | P2 | yes | `files.js:73` | fixed |
| R2-f4 | P2 | yes | `audit.js:210` | fixed |
| R2-f5 | P2 | yes | `audit.js:204` | fixed |
| R2-f6 | P2 | yes | `home.js:21` | fixed |
| R2-f7 | P2 | yes | `home.js:38` | fixed |
| R2-f8 | P2 | yes | `files.js:119` | fixed |
| R2-f9 | P2 | no | `audit.js:111` | fixed |
| R2-f10 | P2 | no | `audit.js:272` | fixed |
| R2-f11 | P2 | no | `audit.js:206` | fixed |
| R2-f12 | P2 | no | `files.js:128` | fixed |
| R2-f13 | P2 | no | `files.js:151` | fixed |
| R2-f14 | P3 | yes | `home.js:43` | fixed |
| R2-f15 | P3 | no | `audit.js:173` | fixed |
| R2-f16 | P3 | no | `files.js:45` | fixed |
| R2-f17 | P3 | no | `home.js:11` | fixed |
| R2-f18 | P3 | no | `home.js:40` | fixed |
| R2-f19 | P3 | no | `files.js:111` | fixed |
| R2-m1 | P1 | yes | `docs/design/admin/src/journeys/models.js:127` | fixed |
| R2-m2 | P1 | yes | `docs/design/admin/src/journeys/models.js:47` | fixed by a label: the promotion stays live with that scope kept apart, and the question is on the page for the owner |
| R2-m3 | P2 | yes | `docs/design/admin/src/journeys/models.js:59` | fixed |
| R2-m4 | P2 | yes | `docs/design/admin/src/journeys/models.js:89` | fixed |
| R2-m5 | P2 | yes | `docs/design/admin/src/journeys/models.js:108` | fixed |
| R2-m6 | P2 | yes | `docs/design/admin/permissions.json` | fixed |
| R2-m7 | P2 | yes | `docs/design/admin/src/journeys/models.js:165` | fixed |
| R2-m8 | P2 | yes | `docs/design/admin/src/journeys/runs.js:47` | fixed |
| R2-m9 | P2 | yes | `docs/design/admin/src/journeys/runs.js:265` | fixed |
| R2-m10 | P2 | yes | `docs/design/admin/src/journeys/home.js:5 (join from models.js:66` | fixed |
| R2-m11 | P2 | yes | `docs/design/admin/src/journeys/agents.js:59` | fixed |
| R2-m12 | P2 | yes | `docs/design/admin/src/journeys/models.js:139` | fixed |
| R2-m13 | P3 | no | `docs/design/admin/src/journeys/runs.js:83` | fixed |
| R2-m14 | P3 | no | `docs/design/admin/src/journeys/runs.js:59` | fixed |
| R2-m15 | P3 | no | `docs/design/admin/src/journeys/runs.js:263` | fixed |
| R2-m16 | P3 | no | `docs/design/admin/src/journeys/agents.js:156` | fixed |
| R2-m17 | P3 | no | `docs/design/admin/src/journeys/runs.js:69` | fixed |
| R2-m18 | P3 | no | `docs/design/admin/src/journeys/models.js:140` | fixed |
| R2-a1 | P1 | yes | `docs/design/admin/src/journeys/costs.js:174` | fixed |
| R2-a2 | P1 | yes | `docs/design/admin/src/journeys/costs.js:209` | fixed |
| R2-a3 | P2 | yes | `docs/design/admin/src/journeys/costs.js:204` | fixed |
| R2-a4 | P2 | yes | `docs/design/admin/src/journeys/costs.js:216` | fixed |
| R2-a5 | P2 | yes | `docs/design/admin/src/journeys/costs.js:216` | fixed |
| R2-a6 | P2 | yes | `docs/design/admin/src/journeys/costs.js:159` | fixed |
| R2-a7 | P2 | yes | `docs/design/admin/src/journeys/approvals.js:103` | fixed |
| R2-a8 | P2 | yes | `docs/design/admin/src/journeys/approvals.js:190` | fixed |
| R2-a9 | P2 | yes | `docs/design/admin/src/journeys/approvals.js:66` | fixed |
| R2-a10 | P2 | yes | `docs/design/admin/src/journeys/approvals.js:183` | fixed |
| R2-a11 | P2 | yes | `docs/design/admin/src/journeys/costs.js:174` | fixed |
| R2-a12 | P2 | no | `docs/design/admin/src/journeys/costs.js:210` | fixed |
| R2-a13 | P3 | no | `docs/design/admin/src/journeys/approvals.js:158` | fixed |
| R2-a14 | P3 | no | `docs/design/admin/src/journeys/approvals.js:184` | fixed |
| R2-a15 | P3 | no | `docs/design/admin/src/journeys/costs.js:22` | fixed |
| R2-a16 | P3 | no | `docs/design/admin/src/journeys/approvals.js:62` | fixed |
| R2-a17 | P3 | no | `docs/design/admin/src/journeys/costs.js:230` | fixed |
| R2-a18 | P3 | no | `docs/design/admin/src/journeys/costs.js:203` | fixed |
| R2-a19 | P3 | no | `docs/design/admin/src/journeys/agents.js:116` | open: agents.js and the owner cost journey still say the bill replaced the hold |
| R2-a20 | P3 | no | `docs/design/admin/permissions.json` | fixed |
| R2-a21 | P3 | no | `docs/design/admin/src/journeys/costs.js:88` | open: Claude-unknown is not drawn; on the page as a question for MP40-Q5 |
| R2-s1 | P1 | yes | `docs/design/admin/src/journeys/identity.js:38` | fixed |
| R2-s2 | P1 | yes | `docs/design/admin/src/journeys/incidents.js:126` | fixed |
| R2-s3 | P1 | yes | `docs/design/admin/src/journeys/incidents.js:92` | fixed |
| R2-s4 | P2 | yes | `docs/design/admin/src/journeys/incidents.js:158` | fixed |
| R2-s5 | P2 | yes | `docs/design/admin/src/journeys/incidents.js:168` | fixed |
| R2-s6 | P2 | yes | `docs/design/admin/src/journeys/identity.js:101` | fixed |
| R2-s7 | P2 | yes | `docs/planning/story-readiness-2026-11-03/stories/PH-07.json:196` | fixed |
| R2-s8 | P2 | no | `docs/design/admin/src/shell.js:313` | fixed |
| R2-s9 | P2 | no | `docs/design/reviews/MP-64/decision.md:25` | fixed |
| R2-s10 | P2 | no | `docs/design/admin/src/journeys/identity.js:122` | fixed |
| R2-s11 | P3 | no | `docs/design/admin/src/journeys/incidents.js:87` | fixed |
| R2-s12 | P3 | no | `docs/design/admin/src/shell.js:205` | fixed |
| R2-s13 | P3 | no | `docs/design/admin/src/journeys/incidents.js:247` | fixed |
| R2-s14 | P3 | no | `docs/design/admin/src/shell.js:365` | fixed |
