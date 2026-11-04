# MP-62 and MP-178 review round 4

Snapshot: `b58ae49c9490deded2e5bc1f6b9b10acb7c66b4e`, branch `MP-178-journey-flip`. Delta: `git diff fc1303d..b58ae49` and its direct joins. The owner: "Yes, run round 4". Brief:
[round-4-brief.md](round-4-brief.md). The reviewers' reports, word for word: [h](round-4-lane-h.md), [j](round-4-lane-j.md), [r](round-4-lane-r.md), [s](round-4-lane-s.md).

Lanes as before, with four new reviewers. Result: 54 findings, 25 blocking, no P0, 3 P1. All 25 are fixed and held by `fixed.json`.

R4-h1, R4-s2, R4-s3 and R4-s4 are text checks in the ledger, because the ledger runs in CI, which has no browser. R4-h1, R4-s3 and R4-s4 are proved by pressing, in `node scripts/design_journeys_press.mjs` and `node scripts/design_journeys_check.mjs`.
R4-s2 is the owner's: MP-178's line stays as the owner wrote it, and whether a side may hold more is marked proposed.

| Finding | Severity | Blocking | Anchor | Status |
| --- | --- | --- | --- | --- |
| R4-h1 | P1 | yes | `docs/design/journeys/src/shell.js:230` | fixed |
| R4-h2 | P2 | yes | `docs/design/journeys/src/journeys/home.js:497` | fixed |
| R4-h3 | P2 | yes | `docs/design/journeys/src/journeys/forecast.js:43` | fixed |
| R4-h4 | P2 | yes | `docs/design/journeys/src/shell.js:17` | fixed |
| R4-h5 | P2 | yes | `docs/design/journeys/src/journeys/forecast.js:474` | fixed |
| R4-h6 | P2 | yes | `docs/design/journeys/src/journeys/forecast.js:384` | fixed |
| R4-h7 | P2 | yes | `docs/design/journeys/src/journeys/home.js:515` | fixed |
| R4-h8 | P2 | yes | `tests/journey_facts/h.mjs:73` | fixed |
| R4-h9 | P2 | yes | `tests/journey_facts/h.mjs:544` | fixed |
| R4-h10 | P2 | no | `review/MP-62/fixed.js` | open, non-blocking: the ledger's flip checks are text; the press script is local |
| R4-h11 | P2 | no | `docs/design/journeys/src/journeys/home.js:100` | open, non-blocking: the owner's choice, on the open list |
| R4-h12 | P3 | no | `docs/design/journeys/src/shell.js:30` | open, non-blocking: the mode is not carried on b-technical's flip in two states |
| R4-h13 | P3 | no | `docs/design/journeys/src/journeys/forecast.js:233` | fixed |
| R4-h14 | P3 | no | `docs/design/journeys/src/journeys/forecast.js:238` | fixed |
| R4-h15 | P3 | no | `docs/design/journeys/src/journeys/forecast.js:240` | fixed |
| R4-h16 | P3 | no | `docs/design/journeys/src/journeys/forecast.js:403` | open, non-blocking: the ladder's scenario block is not a control |
| R4-h17 | P3 | no | `docs/design/journeys/src/journeys/home.js:256` | fixed |
| R4-h18 | P3 | no | `docs/design/journeys/src/journeys/forecast.js` | partly fixed: the horizon and order parts are fixed; whether folds change by horizon is open |
| R4-j1 | P2 | yes | `holdings.js:83` | fixed |
| R4-j2 | P2 | yes | `holdings.js:71` | fixed |
| R4-j3 | P2 | yes | `holdings.js:455` | fixed |
| R4-j4 | P2 | yes | `holdings.js:128` | fixed |
| R4-j5 | P2 | no | `journal.js:26` | fixed |
| R4-j6 | P2 | no | `holdings.js:535` | fixed |
| R4-j7 | P2 | no | `holdings.js:273` | fixed |
| R4-j8 | P3 | no | `holdings.js:77` | fixed |
| R4-j9 | P3 | no | `holdings.js:151` | fixed |
| R4-j10 | P3 | no | `j.mjs:642` | fixed |
| R4-r1 | P2 | yes | `r.mjs:716` | fixed |
| R4-r2 | P2 | yes | `r.mjs:531` | fixed |
| R4-r3 | P2 | yes | `approvals.js:14` | fixed |
| R4-r4 | P2 | yes | `approvals.js:58` | fixed |
| R4-r5 | P2 | no | `approvals.js:281` | fixed |
| R4-r6 | P3 | no | `approvals.js:255` | fixed |
| R4-r7 | P3 | no | `approvals.js:279` | fixed |
| R4-r8 | P3 | no | `approvals.js:246` | fixed |
| R4-r9 | P3 | no | `r.mjs:27` | fixed |
| R4-r10 | P3 | no | `approvals.js:288` | fixed |
| R4-s1 | P1 | yes | `docs/design/journeys/src/journeys/cost.js:414` | fixed |
| R4-s2 | P1 | yes | `docs/design/journeys/src/shell.js:312` | fixed |
| R4-s3 | P2 | yes | `shell.js:230` | fixed |
| R4-s4 | P2 | yes | `shell.js:198` | fixed |
| R4-s5 | P2 | yes | `shell.js:15` | fixed |
| R4-s6 | P2 | yes | `review/MP-62/round-3.md:8` | fixed |
| R4-s7 | P2 | yes | `docs/design/journeys/src/journeys/privacy.js:27` | fixed |
| R4-s8 | P2 | yes | `cost.js:131` | fixed |
| R4-s9 | P2 | no | `cost.js:384` | fixed |
| R4-s10 | P3 | no | `docs/design/journeys/src/journeys/forecast.js:476` | open, non-blocking: a press inside a turned frame can leave the caption's chip behind |
| R4-s11 | P3 | no | `scripts/design_journeys_check.mjs:202` | open, non-blocking: the text comparison runs in three states, not nine |
| R4-s12 | P3 | no | `scripts/design_gates.py:782` | open, non-blocking: more script forms of a token write are not read |
| R4-s13 | P3 | no | `design_journeys_check.mjs:128` | partly fixed: the frame-does-not-turn case is added; three refusals still have no selftest case |
| R4-s14 | P3 | no | `decision.md:221` | fixed |
| R4-s15 | P3 | no | `review/MP-62/round-3.md:70` | fixed |
| R4-s16 | P3 | no | `privacy.js:149` | fixed |
