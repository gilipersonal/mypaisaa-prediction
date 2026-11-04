# MP-64 round 2: how to fix your lane

The reports are `review/MP-64/round-2-lane-{f,m,a,s}.md`. Fix every blocking finding in your lane, and any non-blocking one that takes only a few lines. Same rules as round 1
(`fix-round-1.md`): your own journey files only, `tests/admin_facts/<lane>.mjs` holds one check per blocking finding, each proved by undoing its fix, walker on your journeys at the end, no commit. Put new checks
in the same file with ids like `R2-f1`.

These reviewers kept finding the same fault in a new place, so fix the kind, not only the line: when a finding names one state or one screen, read every state of that screen and every sibling screen
for the same fault, and hold the kind in the check with `each()`.

The coordinator has already changed: A77 say where a transfer came from; A78 decide what happens when no rules mapping qualifies; A79 approve the deterministic templates and A80 raise the event analysis cap, both `control: named`;
A74 is a real control now, with its open label; A08 and A58 list the journeys that draw them. `design_admin_facts.mjs` refuses a `control: named` act that is drawn, and an act drawn in a journey its row does not list.

Decisions for joins:

- R2-a5: draw a budget rollback as `act('A34', 'Roll back to v1')`.
- R2-m10: the count stays 4 dated decisions in Ready. Home says "4 decisions wait on you. 1 paused scope waits on your restart." Approvals and a-live say the same, with a note. Lanes f, m and a each do their part.
- R2-f1: draw A77 in `gPend`, with the two answers from the Holdings journey.
- R2-m1, R2-m6: draw A78 on a-rules with the "mapping not qualified" state. No control withdraws a factor or a rules version: the screens say no record names who does.
- R2-s6: say "MP-179" and the purchase, not "your answer".

Report per finding: fixed, or why not, and any join.
