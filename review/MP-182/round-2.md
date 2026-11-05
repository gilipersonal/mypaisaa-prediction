# MP-182 independent review round 2

Reviewed commit `1484e7d`. Owner's words: "Run round 2". Three fresh, blind reviewers ran at once on the delta from `46b631b`: frames and pages, scripts and gates, rules and records. Their reports are `round-2-lane-f.md`, `round-2-lane-s.md` and `round-2-lane-c.md`.

**Result: 24 findings after merging, 11 blocking, no P0, 3 P1.** R2-s2 merged into R2-c1, R2-c8 into R2-s4, R2-s7 and R2-c9 into R2-f7.

Most blockers were about proof, not pages: a gate or a ledger entry that would pass a fault. The one page blocker was R2-f1. Its fix also settled R2-f2: Prism's Toast entry, marked as the owner's, says a toast never takes focus, so Record now returns to the trigger and Undo is a Tab away.

`review/MP-182/pins.py` now pins every part of each fix, and the ledger calls it. CI has no browser, so that is what CI can read; the behaviour is held by `design_prism_press` and `design_runtime`, each with a selftest that runs locally.

Open and not blocking: R2-s9, and R2-f6's label overlap, which is MP-183. From round 1: R1-s7, R1-s8, R1-f8, R1-f10, R1-f11, R1-c9, R1-c11. For the owner: the three questions on MP-182.

These fixes have not been reviewed. Round 3 needs its own yes.
