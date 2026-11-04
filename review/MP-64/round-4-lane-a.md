# MP-64 review round 4, lane a

Snapshot `1fd5ff6`, delta `af66cc0..1fd5ff6`. Files: admin `approvals.*`, `costs.*`, owner `journeys/approvals.js`, `tests/journey_facts/r.mjs`, plus their joins. Read-only. Screens were read through `scripts/design_admin_text.mjs` and the same text helper on the owner page, against the records named in each finding.

Counts: 8 findings. P0: 0. P1: 0. P2: 7. P3: 1. Blocking: 6. Non-blocking: 2.

Every finding lands in a picked option. The `cb-*` screens of unpicked Costs B share the code of `ca-*`, so they carry the same faults.

### R4-a1 · P2 · blocking · docs/design/admin/src/journeys/costs.js:176

**This month's forecast states one figure, and the same moment states another everywhere else (lesson 27).**

Evidence: `ca-credit` Ready prints "This month's forecast £54.73 £53.54". On the same day 18 and clock, `ca-lines` Ready prints "Forecast for the month up to £59.73", `ca-budget` allocates it as £27.84 + £18.64 + £13.24, and `ca-change` uses "Forecast up to £59.73" as its evidence. £54.73 is the ordinary month before the scan at its cap (`fixed-policies.json`, `two()` on the same screen: "A month, up to £59.73 with the scan at its cap"). So the row the owner decides on shows a fall of £1.19, while the forecast the rest of the journey reports would fall by up to £6.19. The row beside it, "A full month £54.73", then repeats the same number, so the two rows that exist to differ start from one figure.

Correction: keep the cells, which R3-a3 holds, and add to the row's note: "£54.73 is before the scan at its cap. The month's forecast, up to £59.73, falls to the same figure." Keep "at most" as it is. Add the sentence to R3-a3's check.

### R4-a2 · P2 · blocking · docs/design/admin/src/journeys/costs.js:175

**In Failed, "at most" is built from a lower bound.**

Evidence: `ca-credit` Failed prints "£6.71 of Claude is already spent, and the £0.34 hold settles or releases, so at most £53.53." The same state says that figure stops at 18:00 ("What the calls cost, to 18:00"), and the lanes say "Internal estimates, Live · to 21:15 · not added to the lower bound". Ready, at the same moment, prints £7.06 and at most £53.88, because Claude ran from 18:00 to 21:15. Failed is therefore 35p under what Ready says was spent, and "at most" is false: the page's own word for £6.71 in this state is a lower bound. The AWS collector failing does not stop Claude's estimates; only the page's decision not to add them changes.

Correction: in `wdRows`, Failed keeps the to-cell at £53.19 and reads "At least £53.19" with the note "£6.71 of Claude is reported to 18:00, and later calls are not added, so at least this much." Remove the "at most" sentence in that state. `Cash, Up to £6.71` in `creditOn` (`costs.js:155`) has the same fault: use "At least £6.71" in Failed. This narrows the `['error', 6.71]` case of the R3-a3 check, which must change with it. It keeps R3-a3's fix: what is spent stays in the month.

### R4-a3 · P2 · blocking · docs/design/admin/src/journeys/costs.js:339

**The change moved to a later day on one screen and not on the screen that reports it (lessons 27, 3).**

Evidence: this delta gave `ca-change` Expired `day: 19` and the chip "A day later", because the change "expires tomorrow 18:00" from day 18. `ca-budget` Expired (also `:363`, `cb-budget`) still prints "Estimates to 21:15 ... the cost month, day 18 of 30", then "A change passed its time. Moving the warning line to £55 was not approved in time" (`:211`). On day 18 at 21:15 that change has until tomorrow 18:00, so it cannot have expired. The back link from one screen lands on a clock a day earlier.

Correction: pass `day: ctx.state === 'expired' ? 19 : 0` in both budget renders, as `ca-change` does, and add `ca-budget` and `cb-budget` to the check that holds the day. Reword the screen notes to say Expired reads as the later moment.

### R4-a4 · P2 · blocking · docs/design/admin/src/journeys/approvals.js:159

**"What was already sent" cites a decision that does not cover it, and the story's own words were dropped (lessons 36, 4).**

Evidence: the row reads "What was already sent / Disposition pending / Its treatment is open. Proposed · DATA-DEC-04". `catalogue.json` DATA-DEC-04 is "Approve grant withdrawal treatment for datasets, backups, trained models and reproducibility records", and its note concerns stored bars, backups, models, forecasts and audit records if Grow 55 ends. Nothing in it covers values already at Anthropic. MP-63 recovery says "stored data, backups and models follow the treatment the owner approves under DATA-DEC-04". The row those words sat on is gone, so the page now states a pending disposition no record holds, and omits the one MP-63 names.

Correction: replace the row with `['Stored data, backups and models', '', 'Disposition pending', 'They follow the treatment you approve, which is still open.' + DATA-DEC-04 tag]`, keeping S10's narrow first two rows, which R3-a1 holds. If a line on what already reached Anthropic is wanted, it says that no record decides it and goes to the owner as a new question, with its own id in the gap register. `Set the scope again` stays out, as R3-a1 holds.

### R4-a5 · P2 · blocking · docs/design/journeys/src/journeys/approvals.js:149

**The exact scope now binds on the owner page, and the owner page does not say what happens to the two scopes it leaves out (lessons 31, 27).**

Evidence:
- `aa-model` No model: "That scope stays paused until you restart it. The others can still be promoted." One screen line later the bound scope excludes India midcap, 3 months. So "the others" is untrue of that scope, the same fault R3-a2's check bars in the word "elsewhere".
- `aa-result` No model (`:191`): "Promoted where v3 was eligible." One line below: "v4, where v3 issues". R2-HGB v3's approval lapsed only on US tech, 12 months, so v3 is not shown as ineligible on India midcap, and the headline reads as if that scope were promoted. It stays on R1-LGB v1 (admin `models.js:48`).
- `aa-model` Ready: the scope excludes both, and nothing on the screen says why. Walking all nine states of `aa-model`, only No model mentions the pause, and no state says anything about India midcap beyond the Scope line. Admin answers this with "Two scopes this does not settle". The owner, who approves "exactly this", gets no such card.

Correction: add admin's card, word for word, to `modelRail` in Ready, Offline and No model: US tech, 12 months, stays paused. India midcap, 3 months, stays on R1-LGB v1. "Each keeps its own yes." Change the banner to "The rest of its scope can still be promoted." Keep "Promoted where v3 was eligible.", which R3-a4 holds, and add to its text: "India midcap, 3 months stays on R1-LGB v1." Add both to R3-a2's check.

### R4-a6 · P2 · blocking · docs/design/journeys/src/journeys/approvals.js:132

**One approval, one payload hash, two values on a bound line (lesson 31).**

Evidence: MP-156 says the approval binds "previous safe version". Owner Ready, in `bound` and `STEP_MODEL` (`:179`): "Previous safe R2-HGB v3". Admin `models.js:41`, same hash `a81f…60de`, a constant: "R2-HGB v3, where eligible". Owner No model: "R2-HGB v3, where eligible", again with the same hash. The sheet says "If any line changes, it needs a new approval". Calibrator differs in the same way: owner "c8", admin "c7 to c8". The source comment asks for one phrase, word for word, for Scope, but the fix stopped at that line.

Correction: use `PREV_PAUSED` in `bound` and `STEP_MODEL` for every open proposal and remove the `stepModel` and `stepBound` branches. Use "c8" in admin's bind card, keeping "c7 to c8" in What would change. `tests/journey_facts/r.mjs:325` still matches, and R3-a2 holds. Add a check that compares the two pages' bound lines.

### R4-a7 · P2 · non-blocking · docs/design/admin/src/journeys/costs.js:200

**The rollback target is not checked against what it must pay for (lesson 16).**

Evidence: "If you roll back to v1" shows Claude and evaluations £15 to £13. The Allocations card directly above prints "Forecast £13.24", and `ca-credit` says paid use is approved "Up to £15.00" and "Inside the Claude and evaluations allocation". The sums to £70 tie, and that is the only impact drawn. The sibling, `CH_WHY`, shows "Against the month"; this card does not, though a rollback is a change to a line (R2-a5).

Correction: add a row, "Against the month: £13.24 forecast, 24p past £13. Paid use stays approved up to £15." Or choose illustrative v1 figures that hold, such as AWS £23 and Claude and evaluations £14, in `budVersions` and its check.

### R4-a8 · P3 · non-blocking · docs/design/journeys/src/journeys/approvals.js:201

**Three smaller gaps left by this delta, each a copy or outcome that stops short (lessons 28, 29).**

Evidence:
- Owner `aa-result` No model has no "probation", no tonight's forecasts and no revert rule. Ready's rail shows them in `NEXT()`, and the same model goes on the same probation.
- Admin `approvals.js:177`: the new Setting list offers Weekly band, Risk settings, Ranking settings and Agent settings, but the head, checks and bound card stay "Signal weight band". Costs says so ("Only the warning line is worked here"), and Approvals says nothing. Ranking settings also sits beside "this cannot be approved yet" on `aa-policies`.
- `costs.js:176`, `ca-credit` Empty: "Open reservations, Settle or release, Work already held reconciles", while `ca-held` Empty says "Nothing reserved yet".

Correction: show `NEXT()` above the safe box in No model. Add one line under the Setting list: "Only the signal weight band is worked here." Tag it with the open question that sets the other schemas. In Empty, make the reservations row "None yet".

## The fixed list

No finding proposes undoing a fixed item. R4-a2 changes one case of R3-a3's check, and says why. The other corrections add to checks.

## What I did not find

No fault in the rest of the delta: S6 and S7 scope wording against `catalogue.json`, the `£30 + £24 + £13 + £3` sum, the Allow-it behaviour of A76 in Failed, its shutting offline and on phones, `propEnd`'s versions in Empty and Conflicting, the expired `ca-change` rail, the `PAUSED` sentence against `models.js` and `home.js`, and the CSS for the new select.
