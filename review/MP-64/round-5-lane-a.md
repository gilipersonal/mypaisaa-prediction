# MP-64 round 5, lane a: approvals, costs, owner Approvals

Reviewed: `git diff 1fd5ff6..eacda92` for `docs/design/admin/src/journeys/approvals.*`, `costs.*`, `docs/design/journeys/src/journeys/approvals.js`, and their direct joins. Screens read through the page's own render functions, in the states named below.

`tests/journey_facts/r.mjs` has no change in `1fd5ff6..eacda92` (`git diff --quiet` is clean), and neither do `approvals.css` or `costs.css`, so there was nothing to review in them.

Counts: 7 findings, 4 blocking. The table is at the end.

### R5-a1 · P1 · blocking · docs/design/journeys/src/journeys/approvals.js:135

**Owner Ready now says a scope is paused, and nothing else in owner Ready has a paused scope (lessons 27, 29, 31).**

Evidence, all in the owner page, state Ready:

- `aa-model` and `ab-model` print "Two scopes this does not settle US tech, 12 months Stays paused" (`SCOPES`, line 135, used at line 137). `Previous safe R2-HGB v3, where eligible` sits above it. No text on the screen says why it is paused; the reason is only in No model.
- `aa-queue` prints "4 decisions wait on you", with no restart row and no paused notice. The restart row, the banner "A forecast scope is paused." and the notice "US tech, 12 months paused" are drawn in No model only (lines 364, 391). The page's own note says "No model shows a paused scope that needs a restart."
- `forecast a-12m` prints "AAPL · XNAS · US tech", "12-month forecast", "median +12.4%", "As of 21:15 London", "R2-HGB v3", "Model R2-HGB v3 Approved 1 Oct 2026". So US tech at 12 months is issuing in Ready. Admin Models says "A paused scope issues nothing, so nothing here can mature yet."
- `ab-model` Ready heads the same screen with "Active R2-HGB v3 Approved 1 Oct 2026". In No model that header becomes "Approval expired on US tech, 12 months".
- `aa-result` Ready ends "It writes forecasts from tonight's run" and "Active model v3 v4", with neither scope named. The No model outcome names both. So the Ready rail promises what the Ready outcome drops.

Before this delta the page's Ready and the admin's Ready disagreed across two pages. This delta puts the disagreement on the owner page itself, on the screen where the owner approves.

Correction: keep `SCOPES` where R4-a5 holds it, and make owner Ready true. Draw the pause in Ready as No model does: the "Restart US tech, 12 months" row outside the count in `aa-queue` and `ab-home`, the notice in `noticeList`, the reason line in the `SCOPES` box, the two scopes in the `resultCore` `ok` text, and 12-month US tech on `forecast` and `home` labelled as the last issue before the pause or withheld. That touches flipped owner journeys, so if it is too wide it goes to the owner as an open question under plan-sync rule 3: is owner Ready before or after the Tue 21:20 pause? Records with it: `docs/design/journeys/src/journeys/approvals.js`, `forecast.js`, `home.js`, `tests/journey_facts/r.mjs`, and a new `tests/admin_facts/a.mjs` check that fails when Ready says "Stays paused" and its queue has no paused row.

### R5-a2 · P2 · blocking · docs/design/admin/src/journeys/approvals.js:301

**In Expired, a proposal expires five days after the date on the screen, and this delta removed the note that said so (lessons 26, 39).**

Evidence: `aa-band` and `ab-request`, Expired, print "Records current · 18:05", "Wed 4 Nov · London", then "Expired Mon 18:00.", "Expired Mon 18:00 · never current" and "Expires Mon 9 Nov, 18:00". Mon 9 Nov 18:00 has not happened at Wed 4 Nov 18:05. The chip moved from 11:40 to 18:05 in `shell.js:68`, the dated row at `shell.js:102` still says Wed 4 Nov, and the note that read "Expired reads as that later moment, Mon 18:00" was deleted from `aa-band`. `ab-request` never had it. Costs meets the same case with its own "A day later" chip; this screen has nothing.

Correction: let `frame` take a clock for one screen, and pass `Records current · Mon 18:05` with `Mon 9 Nov · London` for `aa-band` and `ab-request` Expired. Add a check that an Expired screen naming a weekday past Wed 4 Nov also shows that weekday on its clock. Records: `shell.js`, `approvals.js`, `tests/admin_facts/a.mjs`, `review/MP-64/fixed.json`.

### R5-a3 · P2 · blocking · docs/design/admin/src/journeys/approvals.js:313

**The new note says the import expired later than the chip. Files and Audit say it expired the night before (lessons 27, 31).**

Evidence: the notes at `:313` (`aa-import`) and `:331` (`ab-import`) now read "Its 21:18 and 21:33 belong to the evening it is approved, so Expired here reads later than the 18:05 on the chip." The same approval in Files prints "Approval expired Tue 21:33" (`files.js:74`, `:193`). Audit prints "The approval ran out on Tue at 21:33" (`audit.js:119`) and "Nobody · Tue 21:33 · no commit started" (`audit.js:177`). Tue 21:33 is earlier than Wed 18:05, so there is no clash to explain, and the note creates one. The screen itself prints only "It expired at 21:33" with no day.

Correction: note on both screens: "Its 21:18 and 21:33 are Tue 3 Nov, as Files and Audit record them." Give `importCore` Expired the day: "It expired Tue 21:33 with no commit started." Records: `approvals.js`, a check in `tests/admin_facts/a.mjs`.

### R5-a4 · P2 · blocking · docs/design/admin/src/journeys/costs.js:201

**The new "Against the month" row is the same in every state, so it contradicts its own screen (lessons 29, 39, 36).**

Evidence: the row is a literal: "Against the month Fits Forecast AWS £18.64 and Claude £13.24 stay inside both."

- `ca-budget` and `cb-budget` Conflicting print "AWS £11.49 of £22 Forecast £18.95" in Allocations, then "Forecast AWS £18.64" in this row, on one screen. The banner on that screen says the forecast moved.
- Partly estimated and Failed print "Fits" beside "Rolling back waits until the billing records load." and with the rollback shut. The same journey's `ca-change` Partial prints "Against the month Not checked A missing check is never a pass." A check the page says it cannot finish cannot report Fits.

Correction: read the AWS forecast from `ALLOC(ctx)` so Conflicting says £18.95, and in `error` and `partial` print "Not checked" with "A missing check is never a pass." Add a check that the row's figures equal the Allocations figures in every state. Records: `costs.js`, `tests/admin_facts/a.mjs`.

### R5-a5 · P2 · non-blocking · docs/design/admin/src/journeys/costs.js:175

**"The same figure" points at the wrong number.**

Evidence: `ca-credit` Ready prints "so at most £53.88. £54.73 is before the scan at its cap. The month's forecast, up to £59.73, falls to the same figure." The nearest figure before those words is £54.73, which is the Claude-on month. The figure meant is the Off column, £53.54. The Off column beside it lets a careful reader work this out, and this card exists to say what withdrawing saves. Failed reads the same way with "At least £53.19".

Correction: name the figure: `The month's forecast, up to £59.73, falls to ${off}.` Only `wdRows` changes.

### R5-a6 · P3 · non-blocking · docs/design/admin/src/journeys/costs.js:340

**Day 19 draws day 18's figures (lesson 29).**

Evidence: `ca-budget` and `cb-budget` Expired now print "A day later" and "day 19 of 30" (also `:364`), then "27p away", "AWS £11.18 of £22" and "Top-5 scan £2.12 of the £5 cap", the day 18 figures. Admin home in Expired still prints "£46.42 committed · day 18 of 30". The 21:15 estimates would have moved in a day.

Correction: say so in the clock line for this state, for example "Figures are from day 18, the last saved." Only `clock` in `costs.js` changes.

### R5-a7 · P3 · non-blocking · docs/design/admin/src/journeys/approvals.js:159

**Two rows of one card read against each other, and one word was left behind.**

Evidence: in "If you withdraw S10", row 2 says "Yahoo prices, S6 and S7 Unchanged ... collection, storage and display carry on", and the new row 4 says "Stored data, backups and models Disposition pending". The wording follows PH-03 and DATA-AT-12, so the row is right, but on one card it reads as stored data both unchanged and pending. Separately, this delta moved `authority()` from "Prod" to "Production", and `costs.js:302` (`cb-run`, unpicked) still prints "Environment Prod"; so do lines in `home.js:64`, `files.js:46` and `audit.js:39`, which belong to lane f.

Correction: keep the row's key, which R4-a4 reads, and start its note "Whatever this use touched follows the treatment you approve, which is still open." Change `Prod` to `Production` where the label is Environment.

## Checked and found right

- Rollback sum £30 + £23 + £14 + £3 = £70, and £13.24 and £18.64 fit inside £14 and £23. £13.24 is COST-Q1's figure.
- `wdRows`: £46.48 + £7.06 = £53.54, + £0.34 = £53.88, and Failed £46.48 + £6.71 = £53.19, against the cost specification's table. Withdraw stays live in Failed, as the owner answered.
- `creditOn` Failed: Cash "At least £6.71" agrees with the state's lower bound.
- `SCOPE_ROWS` row 4 keeps PH-03's words and cites a DATA-DEC-04 that covers stored data, backups and models.
- `bound` and `STEP_MODEL` now agree with admin Models on `Previous safe`, and `SCOPES` copies admin's rows word for word.

## Counts

| Severity | Blocking | Non-blocking |
| --- | --- | --- |
| P0 | 0 | 0 |
| P1 | 1 | 0 |
| P2 | 3 | 1 |
| P3 | 0 | 2 |

Total 7: 4 blocking, 3 non-blocking.
