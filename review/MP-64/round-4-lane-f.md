# MP-64 round 4, lane f: home, files, audit

Snapshot `1fd5ff6`, delta `af66cc0..1fd5ff6`. Picks read in depth: Admin home B, Files A, Audit B.

Counts: 12 findings. 2 blocking (both P2), 10 non-blocking (2 P2, 8 P3). No P0 or P1.

Read and held, no finding: every figure the delta touched in Files recomputes (draft cash, 2-group and 3-group commits, the correction, the sale at 4 × £170.00 less £3.99, the combined approval to £4,688.61, 3+3+3+1+1 = 11 rows). The reversal with its dependent correction matches FIN-AC-17 (PH01-S18), the 15-minute expiry matches POLICY-001, and A81 and A82 match the Holdings journey and `permissions.json`. Home's new lines match Approvals (3 decisions in Conflicting and Expired, v10 and v15 in Empty), Runs, Models and Incidents. Audit's new ids agree across Record, Lineage and Before and after, and the 11:02 export row sits before both lagged reads.

### R4-f1 · P2 · blocking · docs/design/admin/src/journeys/home.js:21

**In Conflicting, the picked Admin home never says production is recorded lost.**

Evidence: Incidents Conflicting says "Production is recorded lost, so inc_0014 is open and Recovery holds the copy" (`incidents.js:74`). This round added that fact to Home, but only in `FIRST.conflict[2]` (`home.js:26`), which only option A's `needs()` draws. Option B, the owner's pick, uses `lineOf` and `topOf`. `node scripts/design_admin_text.mjs home b b-home conflict iphone` prints the banner "Settings changed while you read. ... 2 incidents not resolved." and the tile "Incidents and recovery 2 not resolved · last restore passed". So the gravest fact on the page reads as a routine count, next to a reassuring "last restore passed", and the banner leads with a settings version. Option B's stated cost is that an incident is easier to miss, which makes the tile line the only place it can be carried. Lessons 27 and 39.

Correction: set `LINES.conflict.incidents` to "2 not resolved · production recorded lost". In `topOf.conflict`, name it too, for example `${WAITS(3, '2 incidents')} Production is recorded lost.`, with the Proposed · CT-14 chip that Incidents shows beside this claim. Add a check to the ledger that mutates the Home B line.

### R4-f2 · P2 · blocking · docs/design/admin/src/journeys/files.js:33

**Queue Partial states a held-apart count in the state that says the count is unknown.**

Evidence: `a-queue` Partial prints "The quarantine list did not answer, so what is held apart is unknown. It is not shown as nothing held.", then "Held apart: Quarantine not read, Unknown, not zero", and the rail reads "Held apart: Unknown". Directly below, `refusedFiles()` prints "3 files not taken in · 1 more is held apart". This round added that header. It is fixed text, and Partial (line 38) calls it unchanged. The third file is the oversized one in quarantine, so the header claims what the banner says was not read. Lessons 29 and 39.

Correction: give `refusedFiles` a `held` argument. In Partial, print "2 files refused at the door" with an aside such as "Quarantine not read", and keep the 3 and "1 more" everywhere else. Option B's Partial does not draw this section, so it needs no change.

### R4-f3 · P2 · non-blocking · docs/design/admin/src/journeys/audit.js:177

**Expired, on the picked Explorer: "Records current · 11:40" sits above a row stamped 18:00.**

Evidence: `audit b b-explore expired iphone` prints "Records current · 11:40" and then "Watch Taiwan Semiconductor · Nobody · expired 18:00". The chip comes from `shell.js:68`, which has no `expired` entry. The new row brought this into Audit, and Home B Expired shows the same pair ("Records current · 11:40" and "Taiwan Semiconductor expired at 18:00"). The disclosure is only in the page note on `b-explore` and on Home ("Expired is the exception to the clock"). The note on `a-who`, which draws the same row, has no such line. A list cannot be current at 11:40 and hold a record from 18:00: the row beside the status proves it false (lesson 39), and this is the same fault as fixed finding R3-f2. Non-blocking because the page note discloses it.

Correction: add an `expired` entry to the shell chip map, for example "Records current · 18:05". Check it against the other journeys' Expired screens, because the shell is shared. Then drop the exception wording from the notes. This crosses into lane s.

### R4-f4 · P2 · non-blocking · docs/design/admin/src/journeys/files.js:29

**The new countdown is measured from 11:40 in lists read earlier.**

Evidence: "link valid 22 min" is right at 11:40 for a link issued at 11:02. `qKept`'s default also prints it in the queue's Stale ("From 11:12"), Offline ("from 11:20") and Failed ("this is the list from 11:20") states, confirmed in the text output for Stale desktop and Offline iPhone. A list read then would say 50 or 42 minutes. The same export on `a-keep` withdraws the chip in those states (`Last known 11:12`, `Needs a connection`, `Failed 11:38`). This is the sibling of R3-f2: that fix moved the timestamp but left the derived figure in the lagged lists. In Failed, the queue says "export ready" while `a-keep` says the export failed.

Correction: pass `kept` in those three states, for example "8 originals kept · export ready as of 11:12", with no countdown. Or state the fixed end, "link ends 12:02", which is true in any read.

### R4-f5 · P3 · non-blocking · docs/design/admin/src/journeys/files.js:87

**The revision rule was widened in four places and missed a fifth.**

Evidence: lines 59, 61, 83 and 233 now include answers on a duplicate or a transfer. `a-compare` Empty still says "An edit, a reprocess, a remap or an exclusion makes the next one." Its own rail, on the same screen, gives the longer list. Lessons 1 and 7.

Correction: reuse the phrase from line 83.

### R4-f6 · P3 · non-blocking · docs/design/admin/src/journeys/files.js:69

**"A blank is never filled in" now sits above "Add the date".**

Evidence: draft Partial's banner keeps the old sentence, while this round's row says "Type it from your statement" with an A56 button, and Compare reads "22 Oct, added by you". The banner means Claude never guesses, but it reads as if the owner cannot fill it either.

Correction: "...so that group waits and the date stays blank until you add it." Line 60 already says "blank, not guessed".

### R4-f7 · P3 · non-blocking · docs/design/admin/src/journeys/files.js:238

**A note lost its antecedent.** The same applies at line 262.

Evidence: the edit removed "a later evening" but left "Partial and Failed read as that later moment", so "that" now points at nothing.

Correction: "Partial and Failed read as a later evening, not the 11:38 of the chip."

### R4-f8 · P3 · non-blocking · docs/design/admin/src/journeys/audit.js:177

**The new row is the only one in the record list with no day.**

Evidence: "Nobody · expired 18:00" sits among "Wed 11:02", "Wed 08:14" and "Tue 21:33". This list spans the account's lifetime, so a bare time cannot be placed.

Correction: "Nobody · expired Wed 18:00".

### R4-f9 · P3 · non-blocking · docs/design/admin/src/journeys/audit.js:163

**In Failed, two of the three checks are marked and Restore is not.**

Evidence: `audit b b-gaps error desktop` prints Commits and Delivery as "From 11:20, not vouched for", and Restore as "Exercise rx_0007 passed, Sun 1 Nov" with "Tombstones reapplied first". All three come from the same read. The restore post-dates the affected range of 28 Oct to 30 Oct, so it is the row a reader would most want qualified.

Correction: give `CHECKS` an `r` chip, as for `c` and `d`, and pass the same hold in Failed. In Stale, pass "From 11:12".

### R4-f10 · P3 · non-blocking · docs/design/admin/src/journeys/files.js:147

**The same export reads differently on the owner page, with nothing saying why.**

Evidence: this round moved Files to "Ready · link valid 22 min". `docs/design/journeys/src/journeys/privacy.js:200` still says "Ready · link valid 42 min" over the same pin, "Revision 213 · root 9f3a…c21", and the same sentence. The owner journeys run on their own clock, so this is not strictly false, but the brief requires admin figures to agree with them. R3-f2 holds the 11:02 row, so this does not undo it.

Correction: add to the `a-keep` note that 22 minutes is admin's 11:40, and that Privacy's 42 is the owner journeys' own clock.

### R4-f11 · P3 · non-blocking · docs/design/admin/src/journeys/files.js:32

**The oversized file now waits on a decision but is not under "Needs you".**

Evidence: this round gave it A81 and A82, and it says "not read until you decide". It stays in "Held apart", and Files A's reason for existing is that "every file is sorted by what it needs". The `a-queue` note explains only why the unmatched object is left off Admin home. Home's Files line and option A's list omit the held file, unexplained.

Correction: either add it to `qNeed` and to Home's count, or extend the `a-queue` note to say why it stays out.

### R4-f12 · P3 · non-blocking · docs/design/admin/src/journeys/home.js:20

**Home Failed: the Runs line is the one place without its time, and option A's rail still shows Tuesday's run as the last run.**

Evidence: the picked B banner says "each place shows its line from 11:20", but this round's Runs tile reads "US run Tue · failed" with no suffix, unlike its neighbours. The Runs journey itself says its records are from 11:20. In unpicked option A, the rail under "Last run" still prints "Forecast run: Tue 21:15 · cutoff 21:00" in Failed (line 64), beside "US run Tue · failed", while Audit and Incidents give the last good run as Mon 21:15.

Correction: "US run Tue · failed · from 11:20". In option A's rail, use a Failed value of "Mon 21:15 · cutoff 21:00, last good".
