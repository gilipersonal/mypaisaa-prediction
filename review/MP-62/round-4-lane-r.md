**Key:** `approvals.js` and `research.js` are in `/Users/arundutta/projects/mypaisaa-prediction/docs/design/journeys/src/journeys/`, `shell.js` is `/Users/arundutta/projects/mypaisaa-prediction/docs/design/journeys/src/shell.js`, and `r.mjs` is `/Users/arundutta/projects/mypaisaa-prediction/tests/journey_facts/r.mjs`.

Unless stated, each mutation ran on a copy of `index.html` with `design_journeys_facts.mjs --all --page`. "Passes" means 213 of 213 still held.

**R4-r1 · P2 · blocking · `r.mjs:716-727`. No check holds the decision controls off, and R3-r5's claim fails.**
- R3-r5's comment says "nothing can be approved offline, on any proposal". It tests only Refuse and Approve on eight screens.
- The page is right today: I listed every control offline and none is live that should be off. Nothing holds that, though.
- These all pass:

| Control made live | Where |
| --- | --- |
| Continue with passkey | offline, on all 8 step sheets |
| Roll back | offline, beside "A rollback waits until you reconnect" |
| See the evidence, Dismiss | offline |
| Confirm | expired, decided or refused, checking or timed-out listing |
| Approve | every non-Ready model state, expired or refused setting |
| Switch forward | Stale, Error, Loading, Abstaining |

- The journey's summary says "an expired one cannot be approved". `design_journeys_check.mjs --only approvals --surfaces iphone --themes light` on a copy with a live Confirm on an expired listing and live passkeys offline reported 0 problems. `design_journeys_press.mjs` presses only Home and Forecast.
- **Correction:** extend R3-r5 to a table of (screen, state) with no enabled decision control, and add passkey, Roll back, Dismiss and See the evidence offline.

**R4-r2 · P2 · blocking · `r.mjs:531-534`. "The restart's rail" check reads the sheet, not the rail.**
- Mutation: `restartStepBound` always uses `FWD_BIND`, so on iPad and desktop the rail reads "Artefact R1-LGB v2 · India midcap" beside a sheet restarting R2-HGB v3. It passes, because `/Artefact R2-HGB v3/` matches the sheet's own row.
- This breaks lesson 2.
- **Correction:** split the sheet from the rail before testing, then assert the rail holds `R2-HGB v3 · 91d4` and lacks `R1-LGB`.

**R4-r3 · P2 · blocking · `approvals.js:14`, `:203`; `research.js:22`. Status chips are missing from row names, so assistive technology does not get them.**
- The delta adds `x` to the row's `aria-label` but leaves `r` out. A `role="button"` takes its name from that label, and its children are presentational.
- Chrome's accessibility tree gives "Let the chat route add listings, Code · Tue 17:20 · would widen authority", with no "Blocked". That can be heard as something that happened.
- Also missing from names: Approved, Expired, Automatic and Revoked on `aa-record`, and Tainted, Corrected and Left out on the `ra-memory` and `rb-memory` rows.
- This breaks WCAG 1.3.1, 4.1.2 and 2.5.3, so MP-62's AA acceptance. The `aa-record` note also says reverts are "marked Automatic".
- Reverting the delta's `x` change passes too, so nothing holds it.
- **Correction:** add `plain(r)` to the name in both `item` helpers, and add a check that every open row's name contains its visible words.

**R4-r4 · P2 · blocking · `approvals.js:58`, `research.js:32`, `shell.js:269`. The late-price label cites a question that hands off, and it marks a settled rule proposed.**
- FIN-OD-06 is "Risk windows and source freshness". Its proposal says "Price/NAV/FX age limits join the data specification", and only MP-105 and MP-107 list it.
- DATA-DEC-02 "Decides when a close, NAV, FX rate or 30-minute quote may be shown or used as current". MP-65, MP-153 and MP-138 list it.
- MP-65 already settles the rule: a price "older than the freshness policy allows, is not used in a total, and the reason is shown". Only the limit is open.
- `shell.js:269` still reads "Proposed: ... Stale leaves it out of the total."
- **Correction:**
  - Keep the FIN-OD-06 chip (R3-r2 and R3-r14 hold it) and add `proposed('DATA-DEC-02')` beside it on every journey that carries it.
  - Reword the OPEN row: "Settled (MP-65): a price past the limit leaves the total and the reason shows. Open: the limit (DATA-DEC-02, FIN-OD-06). Proposed: 14:10 is inside it in Ready and past it in Stale."
  - Add DATA-DEC-02 at `docs/design/reviews/MP-62/decision.md:191`.

**R4-r5 · P2 · not blocking, already there · `approvals.js:281`. Restart's Abstaining invents a gate on the owner's yes.**
- It says "No matured paired forecasts exist since the revert ... nothing can be approved until then."
- MP-159 and owner answer 6 need only the owner's yes.
- Ready has the same evidence, with the last scored week 26 Oct and the revert on Mon 22:20, yet Switch forward is live.
- **Correction:** say no new score exists and leave the decision his, or label the wait as proposed.

**R4-r6 · P3 · not blocking · `approvals.js:255-256`. "Proposed · CT-02" sits on a settled fact.**
- The chip reads "Waits for your yes", which is MP-159 and owner answers 6 and 15. What CT-02 leaves open is that the proposal has no expiry.
- **Correction:** word the chip "No expiry · waits for your yes" and update R3-r1's regex.

**R4-r7 · P3 · not blocking, already there · `approvals.js:279`, `:299`, `shell.js:289`. SCI-D07 does not hold restarting.**
- Its record covers bad-week scoring and safety triggers. "This yes gives it a fresh approval" is in no record.
- The open item is restart evidence (`docs/planning/foundation-policy-discussion-2026-11-02.md:72`).
- This is the same fault as R3-r9.
- **Correction:** give it its own OPEN row, naming POLICY-003's remainder.

**R4-r8 · P3 · not blocking · `approvals.js:246`, `:422`. The retry window is stated flat.**
- "for a retry inside its window" carries no label on `aa-setting-result`, `ab-setting-result`, `aa-after` or `ab-after`. Those windows are open, and R3-r1's `OTHER` regex has no `window`.
- **Correction:** add CT-02 on the setting outcomes and MP40-Q9 on the listing outcomes, and extend the regex.

**R4-r9 · P3 · not blocking · `r.mjs:27`, `:37`, `:633-674`. Smaller holes in the tightened checks. Each of these passes:**
- Removing the CT-02 chip from `fwdHead` in Stale, Disagreement or Offline, or from the model and setting sheets in Stale or Loading. R3-r1 claims "beside the fact", but only named states are adjacency-held.
- Cutting Evidence hash, Limits, Previous safe and Expected version from `STEP_FWD`, or the Listing row from `STEP_TSM`. The phone has no rail to cover them.
- Changing Holdings' ISA cash to £4,199.99, because `importRows` reads units only.
- "asking why waits for next month" and "comes back tomorrow", because `WAIT` needs a budget word.

**R4-r10 · P3 · not blocking, already there · `approvals.js:288`, `:292-301`. "Keep paused" has no outcome.**
- Stay on v1 reaches Empty, but no state draws Keep paused or says what happens to the proposal.
- **Correction:** draw the outcome, and say whether the proposal stays in the queue.

**Covered:** the delta in `research.js`, `approvals.js` and `r.mjs`, `FLIPS` and the OPEN list, every label against its record, each expiry, the restart step and outcomes, Option A's rail, Holdings' revoke join, a scan of every offline control, phone layout measured in Chrome, and 60 mutations; no real screen reader was run, so R4-r3 rests on Chrome's accessibility tree. I changed nothing in the repo.
