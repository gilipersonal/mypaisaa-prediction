# MP-62 and MP-178 review round 2

Snapshot: `e5dbc07750783b7b87c68de8f1ad61c3afca591a`, branch `MP-178-journey-flip`. Delta: `git diff c1fa817..e5dbc07` and its direct joins. The owner: "Yes, run round 2". Brief:
[round-2-brief.md](round-2-brief.md). The reviewers' reports, word for word: [h](round-2-lane-h.md), [j](round-2-lane-j.md), [r](round-2-lane-r.md), [s](round-2-lane-s.md).

Lanes as in round 1, with four new reviewers: h (home, forecast), j (holdings, journal), r (research, approvals), s (cost, privacy, the flip, tooling, records).

Result: 95 findings, 68 blocking, no P0. All 68 are fixed and held by `fixed.json`. Checks on the rendered screens hold on the fixed page and fail on the reviewed one. R2-s3, R2-s8, R2-s9, R2-s10 are
text checks in the ledger because the ledger runs in CI, which has no browser: their behaviour is proved by pressing, in `node scripts/design_journeys_check.mjs` and its `--selftest`, in the `design-walk` check.

The main change: the flip now shows only where the owner reads. It was on live proposals, drafts and behind open sheets, against the proposed rule.

| Finding | Severity | Blocking | Anchor | Status |
| --- | --- | --- | --- | --- |
| R2-h1 | P1 | yes | `forecast.js:23` | fixed |
| R2-h2 | P1 | yes | `forecast.js:138` | fixed |
| R2-h3 | P1 | yes | `forecast.js:108` | fixed |
| R2-h4 | P1 | yes | `forecast.js:402` | fixed |
| R2-h5 | P1 | yes | `forecast.js:424` | fixed |
| R2-h6 | P1 | yes | `home.js:465` | fixed |
| R2-h7 | P1 | yes | `home.js:441` | fixed |
| R2-h8 | P2 | yes | `forecast.js:113` | fixed |
| R2-h9 | P2 | yes | `forecast.js:356` | fixed |
| R2-h10 | P2 | yes | `forecast.js:24` | fixed |
| R2-h11 | P2 | yes | `home.js:93` | fixed |
| R2-h12 | P2 | yes | `home.js:501` | fixed |
| R2-h13 | P2 | yes | `home.js:280` | fixed |
| R2-h14 | P2 | yes | `home.js:225` | fixed |
| R2-h15 | P2 | yes | `forecast.js:354` | fixed |
| R2-h16 | P2 | yes | `forecast.js:150` | fixed |
| R2-h17 | P2 | yes | `home.js:84` | fixed |
| R2-h18 | P2 | yes | `tests/journey_facts/h.mjs:18` | fixed |
| R2-h19 | P2 | no | `forecast.js:424` | fixed |
| R2-h20 | P2 | no | `home.js:185` | fixed |
| R2-h21 | P2 | no | `shell.js:19` | fixed |
| R2-h22 | P3 | no | `shell.js:17` | fixed: answered by the strict rule: a sheet does not flip |
| R2-h23 | P3 | no | `home.js:390` | fixed |
| R2-h24 | P3 | no | `home.js:214` | fixed: the list no longer closes up: gone with the shared table of who abstains |
| R2-h25 | P3 | no | `forecast.js:133` | fixed |
| R2-j1 | P1 | yes | `shell.js:18` | fixed |
| R2-j2 | P1 | yes | `journal.js:22` | fixed |
| R2-j3 | P1 | yes | `holdings.js:228` | fixed |
| R2-j4 | P1 | yes | `holdings.js:298` | fixed |
| R2-j5 | P2 | yes | `holdings.js:673` | fixed |
| R2-j6 | P2 | yes | `holdings.js:158` | fixed |
| R2-j7 | P2 | yes | `holdings.js:312` | fixed |
| R2-j8 | P2 | yes | `journal.js:157` | fixed |
| R2-j9 | P2 | yes | `holdings.js:611` | fixed |
| R2-j10 | P2 | yes | `holdings.js:610` | fixed |
| R2-j11 | P2 | yes | `holdings.js:302` | fixed |
| R2-j12 | P2 | yes | `holdings.js:297` | fixed |
| R2-j13 | P2 | yes | `journal.js:140` | fixed |
| R2-j14 | P2 | yes | `holdings.js:204` | fixed |
| R2-j15 | P2 | yes | `holdings.js:614` | fixed |
| R2-j16 | P2 | yes | `holdings.js:389` | fixed |
| R2-j17 | P2 | yes | `holdings.js:400` | fixed |
| R2-j18 | P2 | yes | `shell.js:88` | fixed |
| R2-j19 | P2 | no | `holdings.js:302` | open, non-blocking: whether units count as amounts is the owner's question, labelled Proposed · MP-84 |
| R2-j20 | P2 | no | `holdings.js:462` | fixed |
| R2-j21 | P2 | no | `j.mjs:103` | fixed |
| R2-j22 | P2 | no | `journal.js:29` | fixed |
| R2-j23 | P3 | no | `holdings.js:392` | fixed |
| R2-j24 | P3 | no | `journal.js:235` | fixed |
| R2-j25 | P3 | no | `holdings.js:110` | fixed |
| R2-j26 | P3 | no | `holdings.js:249` | fixed |
| R2-r1 | P1 | yes | `approvals.js:27` | fixed |
| R2-r2 | P1 | yes | `approvals.js:396` | fixed |
| R2-r3 | P1 | yes | `approvals.js:226` | fixed |
| R2-r4 | P1 | yes | `approvals.js:86` | fixed |
| R2-r5 | P1 | yes | `research.js:322` | fixed |
| R2-r6 | P1 | yes | `approvals.js:297` | fixed |
| R2-r7 | P1 | yes | `shell.js:23` | fixed |
| R2-r8 | P2 | yes | `approvals.js:318` | fixed |
| R2-r9 | P2 | yes | `approvals.js:254` | fixed |
| R2-r10 | P2 | yes | `approvals.js:403` | fixed |
| R2-r11 | P2 | yes | `approvals.js:219` | fixed |
| R2-r12 | P2 | yes | `approvals.js:447` | fixed |
| R2-r13 | P2 | no | `approvals.js:300` | fixed |
| R2-r14 | P2 | yes | `research.js:96` | fixed |
| R2-r15 | P2 | yes | `shell.js:20` | fixed |
| R2-r16 | P2 | yes | `flip.mjs:9` | fixed |
| R2-r17 | P2 | yes | `r.mjs:115` | fixed |
| R2-r18 | P2 | no | `shell.js:12` | fixed: answered by the strict rule: no flip on a proposal; the rule itself is proposed to the owner |
| R2-r19 | P3 | no | `research.js:259` | fixed |
| R2-r20 | P3 | no | `research.js:268` | fixed |
| R2-r21 | P3 | no | `research.js:332` | fixed |
| R2-r22 | P3 | no | `research.js:254` | fixed |
| R2-s1 | P1 | yes | `docs/design/journeys/src/shell.js:24` | fixed |
| R2-s2 | P1 | yes | `shell.js:18` | fixed |
| R2-s3 | P1 | yes | `shell.js:196` | fixed |
| R2-s4 | P1 | yes | `docs/design/journeys/src/journeys/privacy.js:347` | fixed |
| R2-s5 | P1 | yes | `shell.js:24` | fixed |
| R2-s6 | P1 | yes | `docs/design/journeys/src/journeys/cost.js:266` | fixed |
| R2-s7 | P2 | yes | `tests/journey_facts/flip.mjs:9` | fixed |
| R2-s8 | P2 | yes | `shell.js:167` | fixed |
| R2-s9 | P2 | yes | `shell.js:195` | fixed |
| R2-s10 | P2 | yes | `shell.js:88` | fixed |
| R2-s11 | P2 | yes | `cost.js:280` | fixed |
| R2-s12 | P2 | yes | `cost.js:162` | fixed |
| R2-s13 | P2 | yes | `privacy.js:286` | fixed |
| R2-s14 | P2 | yes | `docs/design/journeys/README.md:59` | fixed |
| R2-s15 | P2 | yes | `docs/planning/story-readiness-2026-11-03/stories/PH-00.js` | fixed |
| R2-s16 | P2 | yes | `scripts/design_gates.py:776` | fixed |
| R2-s17 | P2 | no | `scripts/design_journeys_check.mjs:48` | fixed |
| R2-s18 | P2 | no | `privacy.js:298` | fixed |
| R2-s19 | P3 | no | `design_gates.py` | fixed |
| R2-s20 | P3 | no | `scripts/design_tokens.py:264` | fixed |
| R2-s21 | P3 | no | `shell.js:14` | fixed |
| R2-s22 | P3 | no | `shell.js:254` | fixed |
