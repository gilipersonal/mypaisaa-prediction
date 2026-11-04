# MP-64 round 3: how to fix your lane

The reports are `review/MP-64/round-3-lane-{f,m,a,s}.md`. Fix every blocking finding in your lane, and any non-blocking one that takes only a few lines. Same rules as rounds 1 and 2
(`fix-round-1.md`, `fix-round-2.md`): your own journey files only, `tests/admin_facts/<lane>.mjs` holds one check per blocking finding with ids like `R3-f1`, each proved by undoing its fix, walker on your journeys at the end, no commit. Fix the kind, not the line: read every state and sibling screen for the same fault.

Round 3 shows a new pattern: **a fix introduced a new claim the records do not make** (R3-s1 "touches no passkey", R3-a1 "all new Yahoo use stops", R3-a3 the saving, R3-f5, R3-f10). Before you write a sentence, find the record that says it. If none does, leave the sentence out or label it with the id that would close it. A sum beside its inputs is computed from them.

The coordinator has already changed: A81 split and resend a held file, A82 discard a held file (yes, it writes a tombstone); A78's note and source; A46's phone note, which `act()` now prints in place of "on iPad or desktop"; R3-s6, R3-s8, R3-s9.

Joins:

- R3-a2 and R3-m1: the approval must bind the exact scope. Scope reads "All segments, except US tech, 12 months and India midcap, 3 months" and Tasks stays "3, 6, 12 months", on the owner Approvals journey, admin Approvals and admin Models, word for word. Lane a edits `docs/design/journeys/src/journeys/approvals.js` this round, and lane m edits `models.js`.
- R3-a4: lane a makes the owner step-up and outcome draw for No model.
- R3-m7: Home's run line in Failed and Conflicting is lane f's. Use "US run Tue · failed" and "US run Tue · held".
- R3-m4: `Proposed · SCI-D03`, "No record lists the choices yet, so none is drawn." Say what holds meanwhile.
- R3-f1: draw A81 and A82 on the held file. Count "3 files not taken in", as Holdings does, if the file is one of them.

Report per finding: fixed, or why not, and any join.
