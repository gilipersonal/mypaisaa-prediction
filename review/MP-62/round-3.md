# MP-62 and MP-178 review round 3

Snapshot: `fc1303dba3d6dc0a321f723ccf34f23450cdabc4`, branch `MP-178-journey-flip`. Delta: `git diff e5dbc07..fc1303d` and its direct joins. The owner: "Yes, run round 3". Brief:
[round-3-brief.md](round-3-brief.md). The reviewers' reports, word for word: [h](round-3-lane-h.md), [j](round-3-lane-j.md), [r](round-3-lane-r.md), [s](round-3-lane-s.md).

Lanes as before, with four new reviewers. Result: 66 findings, 38 blocking, no P0. All 38 are fixed and held by `fixed.json`.

Round 2's record said R2-s3's behaviour was proved by pressing. It was not, until this round added the note to the press pass (R3-s7). R3-s1, s2, s4, s5, s6, s7, s9, s10 and R3-h2 are text checks in the ledger because the
ledger runs in CI, which has no browser. Their behaviour is proved by `node scripts/design_journeys_check.mjs`, `node scripts/design_journeys_press.mjs` and their selftests, in the `design-walk` check.

| Finding | Severity | Blocking | Anchor | Status |
| --- | --- | --- | --- | --- |
| R3-h1 | P1 | yes | `docs/design/journeys/src/shell.js:218` | fixed |
| R3-h2 | P1 | yes | `docs/design/journeys/src/shell.js:215` | fixed |
| R3-h3 | P1 | yes | `docs/design/journeys/src/journeys/home.js:485` | fixed |
| R3-h4 | P1 | yes | `tests/journey_facts/h.mjs:272` | fixed |
| R3-h5 | P2 | yes | `tests/journey_facts/h.mjs:412` | fixed |
| R3-h6 | P2 | yes | `docs/design/journeys/src/journeys/forecast.js:512` | fixed |
| R3-h7 | P2 | yes | `docs/design/journeys/src/journeys/home.js:424` | fixed |
| R3-h8 | P2 | yes | `docs/design/journeys/src/journeys/home.js:102` | fixed |
| R3-h9 | P2 | yes | `docs/design/journeys/src/journeys/home.js:171` | fixed |
| R3-h10 | P2 | yes | `docs/design/journeys/src/journeys/home.js:98` | fixed |
| R3-h11 | P2 | no | `docs/design/journeys/src/journeys/forecast.js:406` | open, non-blocking: HSBC has no scenario page of its own |
| R3-h12 | P3 | no | `docs/design/journeys/src/journeys/home.js:14` | partly fixed: the ladder reads the table; the table is still two literals |
| R3-h13 | P3 | no | `docs/design/journeys/src/journeys/forecast.js:459` | partly fixed: caption and name follow a press; the Short-term chip is not wired |
| R3-h14 | P3 | no | `docs/design/journeys/src/shell.js:28` | partly fixed: no median through the split; the mode is not carried on that flip |
| R3-h15 | P3 | no | `docs/design/journeys/src/journeys/home.js:245` | open, non-blocking: B's list lines differ from A's on the six other lists; neither is false |
| R3-h16 | P3 | no | `docs/design/journeys/src/journeys/forecast.js:441` | fixed |
| R3-j1 | P1 | yes | `journal.js:176` | fixed |
| R3-j2 | P2 | yes | `holdings.js:74` | fixed |
| R3-j3 | P2 | yes | `holdings.js:27` | fixed |
| R3-j4 | P2 | yes | `holdings.js:364` | fixed |
| R3-j5 | P2 | yes | `holdings.js:364` | fixed |
| R3-j6 | P2 | yes | `journal.js:38` | fixed |
| R3-j7 | P2 | yes | `journal.js:97` | fixed |
| R3-j8 | P2 | yes | `holdings.js:65` | fixed |
| R3-j9 | P2 | yes | `holdings.js:493` | fixed |
| R3-j10 | P2 | yes | `tests/journey_facts/j.mjs:251` | fixed |
| R3-j11 | P2 | no | `holdings.js:311` | fixed |
| R3-j12 | P2 | no | `holdings.js:518` | fixed |
| R3-j13 | P3 | no | `journal.js:172` | fixed |
| R3-j14 | P3 | no | `holdings.js:270` | fixed |
| R3-j15 | P3 | no | `journal.js:43` | fixed |
| R3-j16 | P3 | no | `holdings.js:149` | fixed |
| R3-j17 | P3 | no | `holdings.js:225` | fixed |
| R3-j18 | P3 | no | `journal.js:113` | fixed |
| R3-j19 | P3 | no | `holdings.js:28` | fixed |
| R3-j20 | P3 | no | `holdings.js:25` | fixed |
| R3-r1 | P1 | yes | `approvals.js:59` | fixed |
| R3-r2 | P2 | yes | `approvals.js:361` | fixed |
| R3-r3 | P2 | yes | `approvals.js:91` | fixed |
| R3-r4 | P2 | yes | `approvals.js:288` | fixed |
| R3-r5 | P2 | yes | `r.mjs:331` | fixed |
| R3-r6 | P2 | yes | `flip.mjs:10` | fixed |
| R3-r7 | P2 | yes | `approvals.js:257` | fixed |
| R3-r8 | P2 | yes | `approvals.js:191` | fixed |
| R3-r9 | P3 | no | `approvals.js:256` | fixed |
| R3-r10 | P3 | no | `research.js:327` | fixed |
| R3-r11 | P3 | no | `approvals.js:406` | fixed |
| R3-r12 | P3 | no | `approvals.js:304` | fixed |
| R3-r13 | P3 | no | `approvals.js:240` | fixed |
| R3-r14 | P3 | no | `research.js:91` | fixed |
| R3-r15 | P3 | no | `research.js:175` | fixed |
| R3-s1 | P1 | yes | `docs/design/journeys/src/shell.js:215` | fixed |
| R3-s2 | P1 | yes | `shell.js:218` | fixed |
| R3-s3 | P1 | yes | `docs/design/journeys/src/journeys/cost.js:404` | fixed |
| R3-s4 | P2 | yes | `shell.js:211` | fixed |
| R3-s5 | P2 | yes | `shell.js:216` | fixed |
| R3-s6 | P2 | yes | `scripts/design_journeys_press.mjs:80` | fixed |
| R3-s7 | P2 | yes | `review/MP-62/fixed.js` | fixed |
| R3-s8 | P2 | yes | `docs/design/journeys/src/journeys/privacy.js:287` | fixed |
| R3-s9 | P2 | yes | `shell.js:15` | fixed |
| R3-s10 | P2 | yes | `shell.js:286` | fixed |
| R3-s11 | P2 | no | `shell.js:194` | fixed |
| R3-s12 | P3 | no | `shell.js:175` | fixed |
| R3-s13 | P3 | no | `scripts/design_gates.py:693` | fixed |
| R3-s14 | P3 | no | `cost.js:322` | fixed |
| R3-s15 | P3 | no | `docs/design/journeys/README.md:3` | fixed |
