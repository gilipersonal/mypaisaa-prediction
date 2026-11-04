# MP-64 review round 1, lane a: Approvals and configuration, Costs and budgets

Reviewed at `6705fc1`. HEAD is `49f1c7d`, and the two differ only in `review/MP-64/`, so the admin source is the same.
Files read in full: `docs/design/admin/src/journeys/approvals.js`, `costs.js` (their CSS only for layout), the shell helpers, `permissions.json`, the owner journeys `cost.js` and `approvals.js`, the 18 stories these journeys name, the decision log, gap register, `questions.json`, the reservation contract and the cost specification. Screens were printed with `scripts/design_admin_text.mjs`; `costs.a.web.error` was also rendered in Chrome.

**Counts: 25 findings. P0 0, P1 3, P2 14, P3 8. Blocking 16, non-blocking 9.**

All paths below are under `docs/design/admin/src/journeys/` unless given in full. Picked options: Approvals A, Costs A.

## Blocking

### R1-a1 · P1 · blocking: yes
**`costs.js:73`.** In the Failed state on iPad and desktop, "The month" row shows Estimate **£0.00** and Held **£0.00**, directly above "it is not shown, never £0". `colSum` treats 'Not shown' as 0 and the row prints it.
Evidence, `costs a ca-lines error web`: `The month £37.69 £6.71 £0.00 £0.00 At least £44.40`. The same on `cb-tie`. MP-142 negative: "An unknown or unreconciled amount is shown as unknown, never as zero."
Correction: in `table`, print 'Not shown' for a column holding any non-number cell in that state. Add a gate to `scripts/design_admin_facts.mjs`: a Costs screen that shows 'Not shown' prints no £0.00 total.

### R1-a2 · P1 · blocking: yes
**`approvals.js:97, 100, 101, 128, 167`.** Controls that write or spend are drawn with plain `bs()`, so they are not in the inventory and stay live on a phone.
- "Run the check again" (primary on conflict and expired) starts a coverage probe, and the same screen says "8 credits reserved first" (`approvals.js:94`). MP-74 reserves those credits.
- "Run the check" and the two text inputs on Propose run on iPhone under "Read and acknowledge here. Changes happen on iPad or desktop."
- "Refresh preview" rebuilds an import preview on a phone.

Evidence: `approvals a aa-listing error iphone` shows "Run the check again" live, while "Confirm this listing: on iPad or desktop" is off. `approvals a aa-propose default iphone` shows "Run the check" live. No row in `permissions.json` covers running a check or drafting a change. `shell.js:7` says a screen "cannot grow an action the inventory does not list". This breaks the acceptance ("lists every admin action") and the owner's "Under Settings, phones read only". The gate misses it because it reads only `data-act`.
Correction: add inventory rows (run a coverage probe, with its credit reservation as the audit; save a draft change or run its check), with `phone: "off"` and step-up open. Draw them through `act()`. Disable the inputs on a phone. Update `decision.md` counts (51 actions) and `facts.md` if it lists them. Extend the facts gate to refuse `bs()` labels matching run, refresh or check outside `act()`.

### R1-a3 · P1 · blocking: yes
**`costs.js:163, 189-192`.** The two writes this journey exists for, A34 and A35, are a button and nothing else. No screen draws what is being changed, the new value, its effect on the plan, the version, or what follows. The Expired banner refers to "a threshold change you started", which is drawn nowhere.
A35 "Approve paid use beyond credit" names no amount, month, scope or expiry. MP-78 requires an approval bound to "action, payload sha256, expected record or configuration version and expiry". MP-114 requires impact, evidence, cost and rollback first. The owner placed budget changes here ("In admin, under Settings (Recommended)"), and the coverage matrix points `config` and `decide` at `ca-budget`.
Also, £100 sits in "The lines" beside "Change a line" with "Only you change one", and nothing says the ceiling is not editable. `AGENTS.md` makes a ceiling change a cost-model and ADR matter.
Correction: add a change screen to Costs A and B (same pattern as `aa-band`: exactly what would change, impact against £100 and the £70 plan, version, bound-to card, step-up, expired, refused, applied). Give A35 the same with an amount and period. Say on `ca-budget` that the £100 ceiling is not a control here.

### R1-a4 · P2 · blocking: yes
**`approvals.js:95, 197, 268`.** The picked option's routes end in dead ends (lesson 28).
- "4 decisions wait on you" has a chevron, and Option A draws no list of them. Its `cost` says what waits "sits one level down, inside each family", but two of the four have no family: the import (`FAM` has no imports row, `approvals.js:187`) and the promotion. So `aa-import` has `back: 'In force'` and nothing on In force opens it.
- "Propose a change" has no entry from In force or a family.
- `bs('See the versions')` on listing Empty has nothing behind it: `aa-listing` draws no versions, nor does `aa-policies`. `why` says "Every family reads the same way, by version", which holds only for the bands.

Correction: send the row to the owner queue and say so, or add a small "What waits" list to `aa-now`. Add a "Propose a change" control to `aa-band`. Draw catalogue versions on `aa-listing`, or reword `why` and drop "See the versions".

### R1-a5 · P2 · blocking: yes
**`approvals.js:66-69, 270`.** `covers.decide` and `covers.recover` point at `aa-band`, but neither ending is drawn in Option A.
- Pressing "Refuse" (A51) leads nowhere, and MP-114's `denied` state with its visible back-off is drawn in no state of A. The expired text only says "A repeat backs off with a visible reason".
- "Roll back to v8" (A32) has no result: no v10-as-v8 version, no rechecked proposal, no failed-part-way case. v8's values are not shown either ("Kept with its own record"), so the owner rolls back to something the screen hides, in the option whose `why` is "what it was before, and how to go back".
- MP-131's "confirmed but not applied, for retry" is not in `aa-listing`. The owner journey draws these (`aa-setting-result`, `aa-after`), but this option neither draws them nor points to them. Lesson 28: "an option the owner may pick alone must draw every outcome itself".

Correction: add the settings outcome to `aa-band` (refused, applied, rolled back, write failed) and the listing outcome to `aa-listing`, reusing the owner journey's text. Show v8's band and monthly figure in its row.

### R1-a6 · P2 · blocking: yes
**`approvals.js:227`.** Approving the band sends the waiting promotion back to its check, and only the unpicked option says so. Option B: "The promotion binds the 5-point band and the settings change moves it to 4, so approving one sends the other back to its check." Owner promotion bind: `['Limits', '5 points, 10%']` (`docs/design/journeys/src/journeys/approvals.js:129`). `aa-band` in Option A states "Cost a month £0", "Slower correction", and nothing about R2-HGB v4, which expires Fri 18:00.
Correction: add the same sentence to `SET_WHY` or `aa-band` rail, and to the promotion's screen in `models.js` (lane m join).

### R1-a7 · P2 · blocking: yes
**`costs.js:71-76, 268`.** From Costs A's first screen there is no way to Held, Credit or Lines and allocations, where the owner put budget changes. `ca-lines` has no rail and no control for them. On iPad and desktop the table rows have no chevron, no `role="button"` and no tab stop, though `cost` says you "open one to reach its runs". Phone rows are buttons, but only AWS has a screen behind it; Market data has none (lesson 28; lesson 31, because phone and desktop differ).
Correction: make table rows real controls on wide screens. Add three rows or links under the table: What is held, Claude, credit and cash, Lines and allocations. Give Market data its screen or take its row's control off.

### R1-a8 · P2 · blocking: yes
**`costs.js:147, 163`.** `ca-credit` Ready says Claude is **On**, credit applied is **Unknown**, "Claude on means you approved paid use or credit is verified" and "Admissible credit is zero". Those can only be true if paid use is already approved. The rail still offers a live "Approve paid use beyond credit". The owner also has no way to stop: no control or inventory row withdraws paid use, though "no agent raises spending" makes this the owner's only control.
Correction: in the on states show "Paid use approved, version, date, limit" and a withdraw action, new inventory row, step-up per CT-01. Keep A35 live only in the Claude-off case. Update `permissions.json` and `decision.md`.

### R1-a9 · P2 · blocking: yes
**`costs.js:117`.** `ca-line` is the AWS line. Expired says "A reservation on this line expired", but AWS has Held: None on `ca-lines`, and the only open hold is Claude's Nightly explanations (£0.34, `costs.js:123`). The figures below it are unchanged. Lesson 29.
Correction: drop the override so AWS draws its own Expired (or `ok`), for example "Nothing on this line has an expiry. The month's held £0.34 is Nightly explanations."

### R1-a10 · P2 · blocking: yes
**`approvals.js:165, 172`.** Propose, Partial: the banner says "Range and cost answered. Impact and evidence did not". `CHECKS(v)` writes one value into all four rows, so the screen prints `Allowed range Not checked … Cost Not checked`. Also the New value field is empty while a check is reported as run on it.
Correction: give `CHECKS` per-row values, fill the field, for example range "Inside 0 to 10%", cost "£0", impact and evidence "Not checked".

### R1-a11 · P2 · blocking: yes
**`approvals.js:173, 176`.** Failed says "Your draft is kept", and the fields show only placeholders. Conflicting says "a draft against v9 stops here. Start again from v10", and the same screen keeps the head "Settings v9" and a live "Run the check" on empty fields.
Correction: Failed shows the kept value and reason. Conflicting draws the head as v10, or disables the run and offers "Start again from v10".

### R1-a12 · P2 · blocking: yes
**`approvals.js:66-69`.** `aa-band` Conflicting has no current version. The rows read `v10 · proposed / A different v10 was written at 09:01 / Proposed`, `v9 · previous`, `v8 · previous`. A written v10 carries a Proposed chip, nothing is marked Current, its value is not shown, and the button still offers "Roll back to v8" when v9 is the previous one (Option B's `undo` gets this right with "Roll back to v9").
Correction: in Conflicting draw `v10 · current, written at 09:01` with its value and chip Current, list the refused proposal apart, and offer "Roll back to v9".

### R1-a13 · P2 · blocking: yes
**`approvals.js:144, 154, 156`.** `shut` covers only offline and denied. So "Withdraw S10, Yahoo" (A37) stays live under Failed, which says "nothing can be approved until this loads", under Partial with the scope gate unavailable, and under Conflicting, where a scope was just withdrawn and the row reads "withdrawn, disposition pending". Withdrawing has MP-63 consequences for stored data under DATA-DEC-04.
Correction: add error, partial and conflict to `shut`.

### R1-a14 · P2 · blocking: yes
**`costs.js:55, 82, 133`.** One Failed moment gives three accounts (lesson 27).
- Estimate is 'Not shown' on `ca-lines`, while the lanes on the same screen say Internal estimates "Live · to 21:15 · Now", and the Stale state does show AWS estimated since 16 Nov at £1.33. A failed billing collector does not stop internal estimates.
- Reserved is "Not read while the collector is down", but reservations are MP's own table, not the collector's. `ca-held` in the same state shows £0.34.

Correction: keep "At least £44.40", which the owner page uses, and give a true reason: "Not added to the lower bound". Mark the Estimates lane as held back in this state, or show the estimate labelled. Bring `ca-held` into line. Change the owner journey if the figure changes.

### R1-a15 · P2 · blocking: yes
**`shell.js:65-69`, `costs.js:85, 133`.** Costs prints two clocks as one. `frame` passes `spec.fresh`, and admin's `freshRow` ignores it. Evidence:
- Offline: chip "Offline · from 11:20" above "Internal estimates, Saved · to 21:15", so saved figures are newer than the save.
- Ready: "Records current · 11:40" and "Wed 4 Nov" sit above "day 18 of 30", and "Internal estimates, Now" is 21:15.
- `ca-held` Failed: "these rows are from 11:20" beside "Claude usage to 18:00".

`decision.md` says "screens say which they show". Only option B's `CAL` does, inside its screens. In Option A the sole statement is a caption under `ca-lines`. Lessons 27 and 39.
Correction: give Costs a cost-month chip through `fresh` (as the owner journey's "Offline · from 21:15"), and put `CAL`'s sentence on `ca-lines`, `ca-held`, `ca-credit` and `ca-budget`. Move the failure times in `ca-held`, `ca-credit` to the cost clock.

### R1-a16 · P2 · blocking: yes
**Join: `files.js:50`, `costs.js:123, 260`.** Files says "The amount sits in Costs and budgets", and Costs lists MP-42 in `stories`. MP-42 positive: "Import activity appears in the main per-environment cost view, linked by import id". `grep -in "import\|extraction\|statement" costs.js` finds nothing, and the five Claude features add to £7.06 with no extraction line. The owner cost journey has none either, and Agents has a "Statement extraction" job.
Correction: add a settled row to `HELD` naming the file and import id, which changes no total, and the same on the owner's `holds`. Then Files' promise lands.

## Non-blocking

### R1-a17 · P2 · blocking: no
**`costs.js:123`, `docs/design/journeys/src/journeys/cost.js:182`.** "Event analysis, 17 Nov: Settled. The bill replaced the hold" is a Claude job, and Claude has "No bill yet" on `ca-lines` and in `lineFacts`. Settled £38.40 is data plus AWS only. Correction: "Settled. Usage replaced the hold", in both journeys, or say the bill source.

### R1-a18 · P3 · blocking: no
**`costs.js:171`.** Forecasts on `ca-budget` add to £59.72 (27.84 + 18.64 + 13.24), and the first line on that screen says "27p away", from £59.73. Conflicting: £60.03 against £60.04. The figures are the records' own (£13.24, COST-Q1; 46.48 + 5 + 8.25), so it is rounding (lesson 37). Correction: "Rounded to the penny" under the allocations.

### R1-a19 · P3 · blocking: no
**`approvals.js:138`, `files.js:100`.** The same 9-of-11 approval is A07 here and A08 in Files, and the two audit records differ ("New hash"). Correction: use one id for this import in both.

### R1-a20 · P3 · blocking: no
**`approvals.js:138`.** `aa-import` has approve and no way to say no. The other decisions have Refuse, and the owner's has "Not now". Acceptance names "approve and reject". Correction: add a link to A06 Cancel a draft, in Files.

### R1-a21 · P3 · blocking: no
**`costs.js:163`.** A35 carries "Proposed · CT-16", but the owner answered where this lives on 4 November (decision log). CT-16 is the admin map, not paid use, and what stays open here is CT-13 and MP40-Q6. Lesson 36. Correction: use `CT-13`.

### R1-a22 · P3 · blocking: no
**`costs.js:260`.** `stories` names MP-70 and MP-173, and nothing is drawn for them: no credit bucket, no screening line. Separately the owner said "I'll join the Developer Program", and Costs has no fee-month case (MP-142, COST-Q4), though the owner journey does. Correction: drop the two keys or draw them, and add a one-line fee-month note on `ca-budget`.

### R1-a23 · P3 · blocking: no
**`approvals.js:101, 206`.** The Expired states report "expired at 18:00" and "Expired Mon 18:00" under "Records current · 11:40, Wed 4 Nov". The import screens have a caption for this, and these do not. Correction: the same caption.

### R1-a24 · P3 · blocking: no
**`costs.js:107`, `runs.js:68`.** "Open the runs behind this" on the AWS line leads to run screens whose cost box holds market data and Claude only, so no run explains AWS spend. It also shows when Empty has no run. Correction: reword to "See the runs", hide it on Empty.

### R1-a25 · P3 · blocking: no
**`approvals.js:31`, `costs.js:163`.** Denied on a phone shows primary "Sign in again" beside "Approve this band: on iPad or desktop", so the sign-in unlocks nothing there. Correction: hide it when the act is phone-off.

## Checked and clean

- Costs sums: Ready, Stale, Partial, Conflicting and Failed all tie. Bill, usage, estimate and held make £46.42 (£46.73 with the bill). AWS and Claude sub-lines, the day rows and the ten and nine "moved" rows tie. £60.04 and £18.95 are right.
- Costs agrees with the owner journey on month figures, rungs, lanes, `Claude off` text and the £5 cap. MP-90, MP-89, MP-103 wording holds, and A34 and A35's step-up is in the stories' authority fields.
- Approvals agrees with the owner journey and Models on v9, v10, v14, v15, the payload hash, 09:01, 09:16, the import's revisions, hash and units, and Files on 213, 214, 21:33.
- TSM: 44 + 7 = 51 and 18,360 to 18,411 hold. No Claude-widening control exists, and R1, R7, R8 and R14 are drawn. "No trade" shows in every import state. No household or multi-user wording.
- Every proposed id cited resolves to an open record, apart from R1-a21.
