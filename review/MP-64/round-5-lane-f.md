# MP-64 round 5, lane f: Admin home, Files and imports, Audit

Reviewed `git diff 1fd5ff6..eacda92` for `home.*`, `files.*`, `audit.*` and their joins into Runs, Models, Approvals, Incidents, Privacy and the owner Approvals journey. `home.css`, `files.css` and `audit.css` did not change. Screens were read in all ten states with `design_admin_text.mjs`, and Home Conflicting was rendered on iPhone and desktop. Every correction below was checked against `tests/admin_facts/f.mjs`, so none undoes a fixed finding.

Counts: 0 P0, 0 P1, 3 P2, 5 P3. Blocking: 2. Non-blocking: 6.

### R5-f1 · P2 · blocking · docs/design/admin/src/journeys/audit.js:162

**In Partial, the picked Gaps and integrity screen says delivery succeeded and says it is unknown (lesson 39).**

Evidence: `audit b b-gaps partial` prints the banner "Outbox delivery did not answer, so delivery is unknown, not fine.", then the row "Delivery · Each of these reached what follows it · Unknown". `CHECKS` (`audit.js:155`) was changed in this delta, but only its chip varies by state, so the sentence stays a statement of fact. No gate reads a row's sentence against its chip. `a-gaps` is the same, because it shares `gaps()`.

Correction: add `o.ds` to `CHECKS` for the delivery sentence, and pass `ds: 'Not read: outbox_delivery did not answer'` in `partial`. Add a selftest-backed check in `tests/admin_facts/f.mjs` and a `review/MP-64/fixed.json` entry: Partial lacks /Each of these reached/ on `a-gaps` and `b-gaps`, and Ready keeps it.

### R5-f2 · P2 · blocking · docs/design/admin/src/journeys/files.js:111

**In Expired, picked screens show an approval expiring at 21:33 under a clock that reads 18:05, with no day (lessons 27, 37).**

Evidence: this delta removed the "Expired reads as that evening" notes because the chip now reads "Records current · 18:05", and the page date reads Wed 4 Nov.

- `files a a-approve expired`, the picked Files option: "Records current · 18:05", "It expired at 21:33", "Approved 21:18", "Expires 21:33". No day appears on the screen. Only the caption, which is outside the design, says Tue.
- `audit b b-lineage expired`, the picked Audit option: the same chip, "It expired at 21:33" (`audit.js:212`) and "approved 21:18, expired 21:33" (`PANE_X`, `audit.js:175`). No day and no caption.
- The sibling screens name the day: "Approval expired Tue 21:33" in the queue, and "Recorded Tue 21:33" in `b-compare`. So this is a miss, not a choice.
- The same gap is on `b-decide` (shares `approveOf`), `a-answer` (`audit.js:73`) and `b-life` (`files.js:179`); the last two are in unpicked options.

A record of what happened at a time that has not yet come is the fault an audit screen must not have.

Correction, in the admin strings only, because the owner journeys' `Expires 21:33` is pinned by `tests/journey_facts/r.mjs` and must stay:

- `approveOf.expired`: `['Approved', 'Tue 21:18'], ['Expires', 'Tue 21:33']` and "It expired on Tue at 21:33".
- `PANE_X`: "approved Tue 21:18, expired Tue 21:33".
- `linWhy.expired`, `a-answer` expired and `lifeBody` expired: "on Tue at 21:33", the phrasing `a-record` already uses.

Add a check that every Expired screen naming 21:33 also names Tue.

### R5-f3 · P2 · non-blocking · docs/design/admin/src/journeys/approvals.js:231

**Join: in Conflicting, Home and Approvals count Promote R2-HGB v4 as waiting, and Models says it is refused (lessons 27, 31).**

Evidence:

- `home b b-home conflict`: "3 decisions wait on you", and on the same screen the Models tile reads "R2-HGB v4 evidence changed".
- `approvals a aa-now conflict`: the 3 include "Promote R2-HGB v4 ... Expires Fri 18:00", plain, with no sign of a change. The banner names only Settings.
- `models a a-pipe conflict`: "Not ready for you · R2-HGB v4 · evidence hash changed · Refused". `a-decide` conflict: "this approval could never apply".

Following the link from the Home count lands on a live-looking row, and the row's own destination refuses it. The negative still holds: "Decided in Models and evaluations" means no approve button sits on this row, and execution refuses it.

Correction: keep the count, because R3-f16 pins "3 decisions wait on you" on Home Conflicting, and the owner still has to review the new version. Give the Promote row in Approvals Conflicting the chip "Evidence changed · review the new version" in place of its plain expiry. This is lane a's file; Home needs no change.

### R5-f4 · P3 · non-blocking · docs/design/admin/src/journeys/home.js:41

**Home Conflicting leads with Settings and ends on the loss of production.**

Evidence: rendered on iPhone and desktop, the banner is `warn`, titled "Settings changed while you read.", and "Production is recorded lost." is its sixth and last sentence. The fix for R4-f1 and R4-s3 does keep it in the first view, so lesson 38 is met. But it is the worst event admin can show, and the page's own cost line for option B says "an open incident is easier to miss". `Proposed · CT-14` then sits beneath a banner headed Settings, though CT-14 bounds recovery authority, not settings (lesson 36).

Correction: title the banner "Production is recorded lost." with kind `fall`, and move the Settings sentence into its body. "Settings v10 was written at 09:01" and the `WAITS` text stay, so the count and "Production is recorded lost" remain in the first view as R2-f7, R4-f1 and R4-s3 require. No check in `tests/admin_facts/` pins the title.

### R5-f5 · P3 · non-blocking · docs/design/admin/src/journeys/home.js:20

**In Failed, two lines say the wrong moment: one 11:20 line holds an 11:38 event, and one list from 11:20 holds a row from 11:38 (lesson 39).**

Evidence:

- Home's Audit tile reads "Query incomplete · from 11:20". Audit says the failure came later: "The records failed at 11:38. Answers from 11:20 stay" (`a-ask` error), and "Query incomplete at 11:38" (`b-filter` error). At 11:20 the line could not have said that.
- `files a a-queue error` says "this is the list from 11:20", and its Kept row, new in this delta, says "export failed 11:38" (`files.js:39`). R4-f4 pins that row, and the row is right to match `a-keep`, so the row stays.

Correction: Home's Audit tile becomes "Query incomplete · 11:38", which keeps R3-m7's /Query incomplete/. The Home banner's "each place shows its line from 11:20" gains "unless it names a later time". The queue's card adds "The export row is newer, from 11:38."

### R5-f6 · P3 · non-blocking · docs/design/admin/src/journeys/home.js:64

**Unpicked option A: the rail still shows a plain forecast run in Conflicting.**

Evidence: this delta made the rail's Forecast run row state-aware for Failed only. In Conflicting it still reads "Tue 21:15 · cutoff 21:00" while the tile on the same screen says "US run Tue · held" and Incidents says "reconcile_required, counted as neither" (lesson 29).

Correction: extend the same conditional: `conflict` shows "Tue 21:15 · held, reconcile_required".

### R5-f7 · P3 · non-blocking · docs/design/admin/src/journeys/home.js:11

**Join: the picked Admin home never shows the original due for renewal.**

Evidence: the changed `a-queue` note names what Home leaves out, "Admin home counts neither held row", which reads as if everything else in the queue reaches Home. But "1 original due for renewal" is a row in `NEEDS` (`home.js:8`), and only option A draws `NEEDS`. Option B's banner and its Files tile, "8 originals kept · 1 draft waiting", omit it, although `a-queue` lists it under Needs you. Nothing deletes by itself, so no harm follows.

Correction: `PLACE_LINE.files` becomes "8 originals kept · 1 draft waiting · 1 due for renewal", or the note says Home B leaves the renewal out too. `LINES.empty.files` stays as it is.

### R5-f8 · P3 · non-blocking · docs/design/admin/src/journeys/files.js:238

**The `a-approve` and `b-decide` notes give Partial an 11:38 chip it does not have.**

Evidence: both notes, reworded in this delta, say "Partial and Failed read as a later evening, not the 11:38 of the chip". Partial's chip reads "Partial · 3 of 4 sources" (`shell.js`, `freshRow`), and only Failed shows 11:38.

Correction: "Partial and Failed read as a later evening than the page's Wed 4 Nov, 11:40." Same wording in both notes.

## Joins checked, no finding

- Home Failed against Runs, Models and Incidents: run failed, last good Mon 21:15, 2 incidents.
- Home Conflicting against Incidents: inc_0014 and inc_0012 reopened. Runs: "Tue held".
- Home Expired against Approvals: Taiwan Semiconductor at 18:00, next is Promote on Fri 18:00, 3 decisions.
- Audit "expired Wed 18:00" against Approvals "Expires today 18:00" and the Wed 4 Nov page date. `CH_X` runs newest first, and each selected index points at the intended row.
- The export link across states: issued Wed 11:02 (Audit), a one-hour link, 22 minutes left at 11:40, ended by 18:05. Stale and Offline carry no countdown.
- `refusedFiles(false)` against the Partial rail: Held apart reads Unknown.
- Every figure on the draft, `bothBox`, `correctBox` and `reverseBox` recomputed: cash, units and row counts all hold.
- The owner Approvals note in `b-explore`: its promise exists at `approvals.js:459`.
- Lesson 1, across the changed wording: no remnant of the removed notes or of "never filled in" in `docs/design/admin/`.
