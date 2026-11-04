# MP-62 review round 1

Snapshot: `c1fa817ddaeb0ac530fd99e4246a8d13ce0e1c27`. The owner: "Review round 1 - yes". Brief: [round-1-brief.md](round-1-brief.md). The
reviewers' reports, word for word: [h](round-1-lane-h.md), [j](round-1-lane-j.md), [r](round-1-lane-r.md), [s](round-1-lane-s.md).

Lanes: four reviewers. Lane (d) split by journey pairs into h (home, forecast), j (holdings, journal) and r (research, approvals). Cost and
privacy merged into lane s with the scripts and records. `docs/design/prism/` was the spec, not reviewed as a deliverable.

Result: 120 findings, 70 blocking. All 70 are fixed and held by `fixed.json`. Each check holds on the fixed page and fails on the
reviewed one, except the three that test the gates themselves: R1-s4, R1-s14 and R1-s16. R1-s4 is a text check in the ledger because the ledger runs in CI, which has no
browser; the behaviour is proved by `node scripts/design_journeys_check.mjs --selftest`, in the `design-walk` check.

| Finding | Severity | Blocking | Anchor | Status |
| --- | --- | --- | --- | --- |
| R1-h1 | P1 | yes | `home.js:171` | fixed |
| R1-h2 | P1 | yes | `forecast.js:286` | fixed |
| R1-h3 | P1 | yes | `forecast.js:352` | fixed |
| R1-h4 | P1 | yes | `home.js:158` | fixed |
| R1-h5 | P1 | yes | `shell.js:19` | fixed |
| R1-h6 | P1 | yes | `forecast.js:74` | fixed |
| R1-h7 | P1 | yes | `docs/design/prism/index.html:776` | fixed |
| R1-h8 | P1 | yes | `home.js:150` | fixed |
| R1-h9 | P2 | yes | `home.js:141` | fixed |
| R1-h10 | P2 | yes | `home.js:113` | fixed |
| R1-h11 | P2 | no | `home.js:133` | open, non-blocking: one brief across Home and Research is still two drawings |
| R1-h12 | P2 | yes | `forecast.js:317` | fixed |
| R1-h13 | P2 | yes | `forecast.js:58` | fixed |
| R1-h14 | P2 | yes | `forecast.js` | fixed |
| R1-h15 | P2 | yes | `forecast.js:64` | fixed |
| R1-h16 | P2 | yes | `home.js:40` | fixed |
| R1-h17 | P2 | yes | `home.js:35` | fixed |
| R1-h18 | P2 | yes | `forecast.js:237` | fixed |
| R1-h19 | P2 | no | `forecast.js:67` | fixed |
| R1-h20 | P2 | yes | `forecast.js:126` | fixed |
| R1-h21 | P2 | yes | `docs/design/journeys/src/shell.css:26` | fixed |
| R1-h22 | P2 | no | `home.js:233` | open, non-blocking: no candidate action sheet with reasons |
| R1-h23 | P2 | no | `forecast.js:77` | fixed |
| R1-h24 | P2 | no | `forecast.js:135` | partly fixed: the score pair is drawn; no superseded record yet |
| R1-h25 | P2 | no | `home.js:161` | fixed |
| R1-h26 | P2 | no | `home.js:202` | fixed |
| R1-h27 | P2 | no | `forecast.js:56` | fixed |
| R1-h28 | P2 | no | `home.js:369` | fixed |
| R1-h29 | P3 | no | `forecast.css:12` | open, non-blocking: some filter chips and inputs sit under the 44-point rule, above WCAG's 24 |
| R1-h30 | P3 | no | `home.js:174` | partly fixed: rows, tiles, links and steps are real controls; hit areas are R1-h29 |
| R1-h31 | P3 | no | `forecast.js:290` | fixed |
| R1-h32 | P3 | no | `home.js:168` | fixed |
| R1-h33 | P3 | no | `forecast.js:145` | fixed |
| R1-h34 | P3 | no | `shell.js:166` | fixed |
| R1-h35 | P3 | no | `forecast.js:243` | fixed |
| R1-h36 | P3 | no | `home.js:269` | fixed |
| R1-h37 | P3 | no | `home.js:243` | fixed |
| R1-h38 | P3 | no | `forecast.js:231` | fixed |
| R1-j1 | P1 | yes | `holdings.js:277` | fixed |
| R1-j2 | P1 | yes | `holdings.js:44` | fixed |
| R1-j3 | P1 | yes | `journal.js:30` | fixed |
| R1-j4 | P1 | yes | `journal.js:44` | fixed |
| R1-j5 | P1 | yes | `holdings.js:184` | fixed |
| R1-j6 | P1 | yes | `holdings.js:287` | fixed |
| R1-j7 | P2 | yes | `holdings.js:24` | fixed |
| R1-j8 | P2 | yes | `holdings.js:238` | fixed |
| R1-j9 | P2 | yes | `journal.js:12` | fixed |
| R1-j10 | P2 | yes | `journal.js:67` | fixed |
| R1-j11 | P2 | yes | `holdings.js:173` | fixed |
| R1-j12 | P2 | no | `holdings.js:344` | fixed |
| R1-j13 | P2 | yes | `holdings.js:96` | fixed |
| R1-j14 | P2 | yes | `holdings.js:219` | fixed |
| R1-j15 | P2 | no | `holdings.js:156` | fixed |
| R1-j16 | P2 | yes | `holdings.js:158` | fixed |
| R1-j17 | P2 | yes | `shell.js:17` | fixed |
| R1-j18 | P2 | yes | `holdings.js:319` | fixed |
| R1-j19 | P2 | yes | `holdings.js:17` | fixed |
| R1-j20 | P2 | yes | `holdings.js:100` | fixed |
| R1-j21 | P2 | no | `journal.js:145` | open, non-blocking: track records by horizon and regime are not drawn; on the open list |
| R1-j22 | P2 | yes | `journal.js:13` | fixed |
| R1-j23 | P2 | no | `holdings.js:133` | fixed |
| R1-j24 | P2 | no | `holdings.js:366` | open, non-blocking: the hostile-text flagged preview and the superseded revision are not drawn |
| R1-j25 | P2 | no | `holdings.js:183` | fixed |
| R1-j26 | P2 | no | `holdings.js:138` | fixed |
| R1-j27 | P3 | no | `holdings.js:185` | fixed |
| R1-j28 | P3 | no | `holdings.js:122` | fixed |
| R1-j29 | P3 | no | `shell.js:71` | partly fixed: holdings and journal parts fixed; the sidebar count is fixed in the shell |
| R1-j30 | P3 | no | `holdings.js:106` | fixed |
| R1-r1 | P1 | yes | `approvals.js:93` | fixed |
| R1-r2 | P1 | yes | `approvals.js:92` | fixed |
| R1-r3 | P1 | yes | `approvals.js:178` | fixed |
| R1-r4 | P1 | yes | `research.js:222` | fixed |
| R1-r5 | P1 | yes | `approvals.js:300` | fixed |
| R1-r6 | P2 | yes | `approvals.js:266` | fixed |
| R1-r7 | P2 | yes | `approvals.js:58` | fixed |
| R1-r8 | P2 | yes | `approvals.js:102` | fixed |
| R1-r9 | P2 | yes | `approvals.js:268` | fixed |
| R1-r10 | P2 | yes | `approvals.js:52` | fixed |
| R1-r11 | P2 | yes | `research.js:142` | fixed |
| R1-r12 | P2 | yes | `research.js:130` | fixed |
| R1-r13 | P2 | yes | `research.js:40` | fixed |
| R1-r14 | P2 | yes | `research.js:47` | fixed |
| R1-r15 | P2 | yes | `research.js:37` | fixed |
| R1-r16 | P2 | no | `research.js:35` | partly fixed: step wording fixed; the event-analysis source is not drawn |
| R1-r17 | P2 | no | `research.js:163` | partly fixed: rights label and Updated added; the refusal receipt and rights_blocked and withdrawn states are not drawn |
| R1-r18 | P2 | no | `research.js:186` | fixed |
| R1-r19 | P2 | yes | `approvals.js:157` | fixed |
| R1-r20 | P2 | no | `approvals.js:134` | fixed |
| R1-r21 | P2 | no | `shell.js:161` | fixed |
| R1-r22 | P2 | no | `approvals.js:11` | fixed |
| R1-r23 | P3 | no | `approvals.js:66` | fixed |
| R1-s1 | P1 | yes | `cost.js:226` | fixed |
| R1-s2 | P1 | yes | `cost.js:328` | fixed |
| R1-s3 | P1 | yes | `privacy.js:294` | fixed |
| R1-s4 | P1 | yes | `scripts/design_journeys_check.mjs:104` | fixed |
| R1-s5 | P2 | yes | `privacy.js:244` | fixed |
| R1-s6 | P2 | yes | `cost.js:194` | fixed |
| R1-s7 | P2 | yes | `cost.js:30` | fixed |
| R1-s8 | P2 | yes | `privacy.js:205` | fixed |
| R1-s9 | P2 | yes | `privacy.js:194` | fixed |
| R1-s10 | P2 | yes | `privacy.js:272` | fixed |
| R1-s11 | P2 | yes | `privacy.js:306` | fixed |
| R1-s12 | P2 | yes | `home.js:29` | fixed |
| R1-s13 | P2 | yes | `cost.js:113` | fixed |
| R1-s14 | P2 | yes | `docs/design/reviews/MP-62/decision.md:165` | fixed |
| R1-s15 | P2 | yes | `cost.js:57` | fixed |
| R1-s16 | P2 | yes | `scripts/design_gates.py:512` | fixed |
| R1-s17 | P2 | no | `.github/workflows/verify.yml:65` | fixed |
| R1-s18 | P2 | no | `privacy.js:176` | fixed |
| R1-s19 | P2 | no | `privacy.js:140` | fixed |
| R1-s20 | P2 | no | `decision.md:176` | fixed |
| R1-s21 | P2 | no | `shell.js:182` | fixed |
| R1-s22 | P2 | no | `cost.js:222` | fixed |
| R1-s23 | P2 | no | `.claude/rules/design-sync.md` | fixed |
| R1-s24 | P2 | no | `cost.js:29` | fixed |
| R1-s25 | P3 | no | `scripts/design_tokens.py:249` | fixed |
| R1-s26 | P3 | no | `cost.js:90` | fixed |
| R1-s27 | P3 | no | `cost.js:161` | partly fixed: chips reach 44 px; the other four drill-downs are not drawn |
| R1-s28 | P3 | no | `cost.js:8` | fixed |
| R1-s29 | P3 | no | `privacy.js:125` | fixed |
