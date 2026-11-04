# MP-64 round 4: how to fix your lane

The reports are `review/MP-64/round-4-lane-{f,m,a,s}.md`. Fix every blocking finding in your lane, and any non-blocking one that takes only a few lines. Same rules as before (`fix-round-1.md`, `fix-round-2.md`, `fix-round-3.md`): your own files only, one check per blocking finding in `tests/admin_facts/<lane>.mjs` with ids like `R4-f1`, each proved by undoing its fix, walker at the end, no commit.

Fix the kind, not the line. No sentence without a record. A new row or a new word is read in every state, on the picked option first, then the other.

Picked options again: Home B, Files A, Audit B, Runs A, Agents A, Models A, Approvals A, Costs A, Incidents A, Identity A. A fact added to one option goes on the picked one first (R4-f1).

R4-s13 found that many round 3 fixes fail no check when undone. Where your lane's round 3 fix has no check that bites, add one.

The coordinator has already changed: the Expired freshness chip in the shell reads "Records current · 18:05", so drop any exception wording in your notes; R4-s5 in the records.

Joins:

- R4-f1 and R4-s3 are one finding: Home B must say production is recorded lost in Conflicting. Lane f.
- R4-s2: Runs and Incidents must agree. inc_0012 reads Reopened in Conflicting everywhere, and Partial names the same unread record in both. Lane s sets the words in Incidents; lane m matches them in Runs.
- R4-m3 comes from `run_8bf3`, added by the coordinator. Lane m decides: it reads Unknown in Partial like the UK row, with the same check.
- R4-a5 and R4-a6: the owner promotion screens say what happens to the two excluded scopes, and one payload hash holds one set of values across owner Approvals, admin Approvals and Models. Lane a settles the words, lane m matches them.
- R4-a2 may change the `['error', 6.71]` case in R3-a3's check; that is allowed, and keeps R3-a3's purpose.

Report per finding: fixed, or why not, and any join.
