# MP-64 round 5: how to fix your lane

The reports are `review/MP-64/round-5-lane-{f,m,a,s}.md`. Round 5 is the last review round. The owner: "Fix all 16, no sixth round (Recommended)". So nobody will read these fixes, and each must be the correction the report states, no wider. Add no new sentence, id or figure beyond what the report's correction gives (lesson 47). Fix the blocking findings. Take a non-blocking one only if it is a word or two.

Same rules as before: your own files only, one check per blocking finding in `tests/admin_facts/<lane>.mjs` with ids like `R5-f1`, each proved by undoing its fix, walker at the end, no commit.

The owner's answer on R5-a1: "Draw the pause in Ready (Recommended)". Lane a draws the pause in owner Ready as the report says: the Restart row outside the count, the notice and the reason line, in `docs/design/journeys/src/journeys/approvals.js`, and in any other owner journey the report names. Keep `node scripts/design_journeys_facts.mjs --all` at 251 of 251; a check that assumed no pause in Ready is narrowed with a comment naming the answer, never deleted.

R5-a2 asks `frame` to take a clock for one screen. The coordinator adds `spec.chip` to `frame`: pass `chip: 'Records current · Mon 18:05'`. Lane a uses it.

R5-s2: the coordinator changes the phone strip in the shell. R5-s1 is the coordinator's.

Report per finding: fixed, or why not.
