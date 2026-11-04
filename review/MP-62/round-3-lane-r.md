# MP-62 and MP-178 round 3, lane r: findings

I edited nothing in the repo, and my own captures and mutated page copies stayed in scratch.

**R3-r1 · P1 · blocking · `approvals.js:59`, `:168`, `:320`, `:459`, `:533`; `shell.js` OPEN list. The listing's expiry is an open owner question shown as settled.**
- `docs/planning/story-readiness-2026-11-03/questions.json` has MP40-Q9, status `owner_pending`: "How long may a chat-proposed catalogue change ... wait for the owner's confirm before it expires?"
- It goes on: "POLICY-001's 15 minutes covers financial writes only, so until answered a proposal is refused once its coverage check is no longer current."
- MP-74 lists MP40-Q9 under `owner_questions`.
- Screens state "Expires 18:00", "Expires today 18:00", "Bound to catalogue v14 · expires 18:00" and sheet row "Expires Today, 18:00". The only chip beside them is CT-01, which is about sign-in.
- `grep -n "MP40-Q9"` across `journeys/*.js`, `shell.js`, the README, `decision.md` and `tests/journey_facts/` finds nothing.
- CT-02 also leaves proposal expiry open ("Approve proposal expiry"), so the Fri and Mon expiries have the same gap.
- This breaks lessons 20 and 23.
- Correction:
  - Add `proposed('MP40-Q9')` beside the expiry on `aa-listing`, `ab-chat` and both step sheets.
  - Add a row to the OPEN list and hold the label in R2-r2.
  - Label the model and settings expiries CT-02.

**R3-r2 · P2 · blocking · `approvals.js:361`, `:367`, `:396`; `research.js:91`, `:104`, `:257`, `:276`, `:287`. Stale's "leaves the total" is proposed elsewhere and flat here.**
- Home (`home.js:124`), Holdings (`:553`, `:570`) and Forecast (`:117`, `:396`, `:439`) carry "Proposed · MP40-Q6" on this rule. The page's OPEN list also calls it proposed.
- Rendered Stale on `aa-queue`, `ab-home`, `ra-brief`, `rb-today`, `ra-alert` and `rb-alert`, on iPhone and web, has no such chip.
- `research.js:91` and `:276` remove the chip in exactly that state: `ctx.state === 'stale' ? '' : proposed('MP40-Q6')`.
- A flip keeps the wording but it reads as settled on these journeys and proposed on the others.
- Correction: put the label on all six stale banners, drop the stale exception at `:91` and `:276`, and hold it in R2-r8.

**R3-r3 · P2 · blocking · `approvals.js:91`, `:460`. Option A shows less than B on the same listing, with Confirm live.**
- `checks(ctx)` sits only in A's `ok` branch. B's rail draws it in every state except Empty.
- Rendered web, testing for "Twelve Data end of day":

| State | `aa-listing` | `ab-chat` |
| --- | --- | --- |
| Ready | shown | shown |
| noModel | missing | shown |
| disagreement | missing | shown |
| offline | missing | shown |
| stale | missing | shown |
| abstention | missing | shown |

- In noModel and disagreement, Confirm is enabled on A with no source or delay on screen. MP-74 says: "Before the owner confirms, MP shows the resolved identity, source, delay..."
- This is the reverse of R2-r4.
- Correction: move `checks(ctx)` into `aa-listing`'s rail, as `ab-chat` does, and add `/Twelve Data end of day/` to R2-r4's parity loop.

**R3-r4 · P2 · blocking · `approvals.js:288`. The new switch-forward outcome contradicts itself and dead-ends.**
- Rendered Stale on `aa-restart-result` and `ab-restart-result`: "Expired. It cannot be approved." then "Approve again for a new window." There is no control, only Back.
- MP-78: "after expiry the owner approves again." Revoke's Stale has "Sign in and approve".
- Correction: title it "Expired. It did not apply." and add `bs('Sign in and approve', 'primary', 'lock')`.

**R3-r5 · P2 · blocking · `r.mjs:331`, `:412`, `:437`, `:474`, `:501`; `approvals.js:171`. The tightened checks pass with fixes undone.**
Each mutation ran on a page copy with `design_journeys_facts.mjs --page`. The first eight rows ran `--all --only r,flip`. The HSBC row and the three "Approve enabled offline" cases ran `--all`, across every lane.

| Mutation | Why it passes |
| --- | --- |
| Remove `SCI-D07` from `bindCard` | R2-r3's `Proposed · SCI-D07` is met by `whyBack` or `restartCore`'s chip, not the one on the 15-minute window |
| Remove `tag: CT` from `restartYes` (both branches) | Only the sheet's CT-01 is checked |
| Remove `tag: CT` from listing offline | R2-r2 covers default, noModel and disagreement only |
| Remove "· needs a fresh sign-in" from the restart foot | Not asserted |
| Set approvals' HSBC row to "700 → 790 units" | R2-r9's list omits HSBC, so revoke can disagree with `holdings.js:206` |
| Restore stale Overlap to 15.0% (`MINIS`) | R2-r8 lacks only `13.5%` and `31.0%` on the card |
| Undo `stepBound` and the setting steps' `'What this proposed'` title | R2-r10 tests only the proposal screens |
| Make setting Empty "Approved", or restart Stale "Switched forward" | R2-r11 tests default and error on the settings outcome, default and noModel on the restart outcome |
| Enable Approve offline on model, setting or restart (`o: { off: true }` removed) | No check holds the disabled state |

- A phrasing gap: "No new notes are proposed until the budget clears." passes R1-r11, because `sentences()` needs the word Claude in the same sentence and `CLAUDE_BACK` has no "until".
- Correction: add each to its check, hold the HSBC row against Holdings' rendered text, and count the fix in `review/MP-62/fixed.json`.

**R3-r6 · P2 · blocking · `flip.mjs:10-16`. No gate holds a Research flip's figures, the same gap as R2-r16.**
- `AGREED` has no `research` key, so R2-r16 proves nothing for those flips.
- Mutation: `rb-today` changed to "US tech is 29.0% of the portfolio, under your 30% line." Result: all 165 pass, while `ra-brief` still reads 31.0%, above the line.
- Correction: add `research` to `AGREED` with 31.0%, 33.4%, 80% range −18.5% to +34.0%, and 79% of 52 scored. Prove it with this mutation.

**R3-r7 · P2 · blocking · `approvals.js:257`, `:495`, `:581`, `:159`, `:161`. R2-r10's fault survives on the restart step-up.**
- `aa-restart-step` and `ab-restart-step` disagreement on web: the sheet says "this approval is refused" beside a rail titled "This approval is bound to". I captured this for `aa-restart-step` on web and read the matching rail text in its rendered dump.
- `stepBound` (`:171`) fixed the same fault on the model and setting steps.
- Stale titles that rail "What this proposes" on a sign-in step.
- The shared sheet says "The proposal keeps its expiry" in Error and Offline, on a proposal whose head says "Waits for your yes" and has no expiry.
- Correction: give the restart step a `stepBound`-style rail, and make the sheet's line conditional. Hold both in R2-r10.

**R3-r8 · P2 · blocking · `approvals.js:191`, `:422`, `:284`, `:290`, `:310`. CT-01 is labelled before the decision and flat after it.**
- `:53` says the acts the records do not name "say so".
- The listing's record rows ("· fresh sign-in") and restart's outcomes ("Applied at 09:18 with your fresh sign-in") carry no chip.
- Revoke's Abstaining ("Fresh sign-in needed") carries no chip either. MP-55 and CT-01 name no step-up for revoking, so a stop control sits behind an invented rule during a 15-minute window.
- Correction: add `CT` to all of these. Keep the "Fresh sign-in needed" text, because R2-r9 holds it, and carry the question to `holdings.js:476`.

**R3-r9 · P3 · not blocking · `approvals.js:256`, `shell.js:257`. The 15-minute window cites a question that does not hold it.**
- SCI-D07 is "Worse-week scoring rule and exact safety triggers". Its `still_open` says nothing about approval windows.
- POLICY-001 is "15-minute import/correction approval window". CT-02 owns proposal expiry.
- An owner answering SCI-D07 would not settle this.
- Correction: relabel `bindCard` and the OPEN row CT-02. R2-r3 keeps passing on the other chips until R3-r5's fix lands, so change them together.

**R3-r10 · P3 · not blocking · `research.js:327`, `:195`. The Reliance turn sits under NVIDIA.**
- `ra-ask` disagreement on web: Back reads "NVIDIA", and the rail shows "6-month forecast · NVDA ... +9.1% median" beside an answer about a horizon with no median.
- Correction: draw the rail and Back from `subject(ctx)`.

**R3-r11 · P3 · not blocking · `approvals.js:406`. Loading hides what waits on iPad and desktop in B.**
- Phones show "Checking what waits on you, Last good 21:15". `homeRail` drops the strip on wide screens, so nothing there says proposals are loading. A says "expiry times come from the server".
- Correction: remove the loading guard.

**R3-r12 · P3 · not blocking · `approvals.js:304`, `:306`. Revoke loses Holdings' way out.**
- Revoke's Error says "To undo it, reverse the import." with no control, and Empty has none either. Holdings' same two states have "Back to Imports".
- Correction: add the button to both.

**R3-r13 · P3 · not blocking · `approvals.js:240`, `:413`. "for one retry" is not in the records.**
- MP-78: "a retry with the same payload and version inside the window is idempotent", with no count.
- Correction: say "for a retry inside its window".

**R3-r14 · P3 · not blocking, already there · `research.js:91`, `:276`, `shell.js:248`, with Home, Holdings, Forecast, Journal and Privacy. MP40-Q6 is the wrong question for a late price.**
- The record reads "Approve the cost freshness rules: AWS billing data older than 36 hours...". FIN-OD-06 holds "source freshness".
- Five checks hold the literal label (`h.mjs:215`, `j.mjs:33`, `:37`, `:337`, `r.mjs:222`, `s.mjs:126`).
- Correction: add the price limit to MP40-Q6's record with the owner's yes, or re-point the chip and checks together.

**R3-r15 · P3 · not blocking, already there · `research.js:175`. Empty shows a loading skeleton.**
- `ra-card` Empty reads "No research card yet" then "Last good 21:15" twice, for a card that was never built.
- Correction: return nothing in Empty.

**Covered:**
- The delta in `research.js`, `approvals.js` and `r.mjs`.
- `FLIPS` and `frame()`, the Holdings revoke join, the Claude card, and the 15 stories.
- Rendered text for both options on iPhone and web in all nine states, plus 49 mutation runs.
- The decide bar against content on phones, 66 measurements, none obscured.

**Could not check:** assistive technology, a real phone, and pixels beyond three captures.
