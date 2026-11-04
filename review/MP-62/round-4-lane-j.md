**R4-j1 · P2 · blocking: yes · `holdings.js:83`, `:348`, `:273`; `tests/journey_facts/j.mjs:551`, `:581`**
- **Fault:** AstraZeneca's "No rate found / The search stopped at its limit with no rate" is false for the flows drawn beside it.
- **Evidence, schedule:** −£9,500 on 14 Jun 2024, +£3,920 on 2 Dec 2024, −£2,000 on 8 Apr 2025, −£500 on 3 Mar 2026, +£9,215.75 on 3 Nov 2026.
- **Evidence, root:** I computed XNPV by FIN-14's formula. It is +£1,135.75 at 0% and −£686.86 at 10%, with one root found at +5.85%. Any bracketed search finds that root.
- **Evidence, same shape:** It has Reliance's sign pattern of three turns, and Reliance's screen says the same search "found +22.3%". The spec at line 65 says nonconventional flows without a certificate "return ambiguous/unsupported, even if one numerical root is found". Same flow shape, same solver, two different outcomes.
- **Evidence, the check:** R3-j2's header claims "a status is one its flows can produce", but its AstraZeneca branch never calls `flowsOf`. Changing the sale to £39.00 on a copy left lane j's checks passing.
- **Correction:**
  - Word the status as what MP-72 says budget exhaustion is: the search used its budget before it could separate the possible rates, so none is stated. Remove the claim that it found no rate.
  - Change `ret`, `retCell`, `noRateNow`, the coverage sentence, the `a-one` note and the `EVENTS` comment with it.
  - Name AstraZeneca in the FIN-OD-04 row of `OPEN`.
  - Make R3-j2 compute `turns(f) === 3` for AstraZeneca and refuse a no-rate claim.

**R4-j2 · P2 · blocking: yes · `holdings.js:71`, `:89`; `j.mjs:554`**
- **Fault:** HSBC shows "+8.1% a year" on a stale valuation, and the delta pins it.
- **Evidence, spec:** Line 63 says: "stale valuation or broken reconciliation withholds the dependent net XIRR".
- **Evidence, screens:**
  - `a-one` and `b-one` Stale draw "+8.1% a year · Stale · Uses the 14:10 price as its closing value".
  - `a-one`'s account row shows "+8.1% a year" with no stale mark.
  - The phone `a-list` row reads "Return +8.1% a year · Price 14:10".
  - The same state's coverage card says HSBC "leaves the value, gain and return", and "Partial, on 1 of 3" and "Return on 3 of 7" already withhold it.
- **Evidence, delta:** It moved HSBC's date to 4 Nov 2024 so +8.1 computes, and R3-j2 now requires it in Stale. Withholding the rate on a copy fails R3-j2.
- **Correction:**
  - In Stale, show "Withheld" with status Stale on `a-one`, `b-one`, the account row and both `a-list` forms.
  - Keep +8.1 for Late in Ready. Have R3-j2 prove it from `a-list` Ready against the drawn schedule, and require "Withheld" in Stale.
- **Not in this delta (non-blocking):** the same sentence covers General account's "+17.4% a year" beside "Difference open, £8.15". Put that to the owner under FIN-OD-04.

**R4-j3 · P2 · blocking: yes · `holdings.js:455`, `:459`**
- **Fault:** The new sample reason "Broker fee on the statement, missing from the ledger." closes the difference with a reason, leaving a known missing fee out of the ledger.
- **Evidence:** The card above the reason says "A change to the facts goes through a correction." MP-65 says the same: "a change to financial facts goes through a correction with a new revision". Pressing Resolve leaves ledger cash at £1,530.25 against a true £1,522.10. MP-65's story wants differences "never papered over".
- **Correction:** Use a reason that changes no fact, such as "Broker confirmed a print error on the statement; the ledger figure stands." in both strings. Add the old wording to R3-j18's `lacks`.

**R4-j4 · P2 · blocking: yes · `holdings.js:128`; `j.mjs:579`**
- **Fault:** The "Two rates" fix on the wide table is not held by any check.
- **Evidence:** I put `'No single rate': 'Two rates'` back into `retCell` on a copy. `design_journeys_facts.mjs --all --page` still printed 213 of 213. R3-j2's `lacks` reads only `a-one` and `b-one`. This breaks lesson 3 and "fixed stays fixed".
- **Correction:** In R3-j2, run `lacks(/Two rates/)` across all of holdings, and require "Not proved" on the `a-list` table.

**R4-j5 · P2 · blocking: no · `journal.js:26`; `j.mjs:546`**
- **Fault:** "Outcome due 21 Nov 2026 / 18 days" falls on a Saturday.
- **Evidence:** FND-DEC-002 and spec line 81 roll a month anniversary back to the preceding valid session, and MP-130 says "the rolled anniversary". SPY's 3-month outcome is therefore due Fri 20 Nov, 17 days away. Stacked Lanes bring this line to phones, and R3-j1 now pins it. R3-j18 checks only holdings dates.
- **Correction:** Change the line and `left`, update R3-j1, and add a weekday check on journal due dates.

**R4-j6 · P2 · blocking: no · `holdings.js:535-537`, pre-existing**
- **Fault:** `b-duplicate` contradicts itself on one screen.
- **Evidence:**
  - Disagreement says "the amounts are 4p apart" above "+£41.16 / +£41.16 · Same date, amount and account".
  - Abstaining says "Claude could not read the row's account. It matches on date and amount alone" above the same line.
  - The delta passed `noClaude` to this card, and the card ignores it.
- **Correction:** Pass the state to `dup.card`. Draw £41.12 in Disagreement, and drop "and account" in Abstaining.

**R4-j7 · P2 · blocking: no · `holdings.js:273`, pre-existing, delta added only the label**
- **Fault:** In Abstaining, the commit does not match what was approved.
- **Evidence:** `a-approve` and `b-approve` read "Commit 2 groups, 6 of 11 rows… Cash → £3,070.82 · Left out: Sold 10 AstraZeneca, date not read". The next screen, `a-done`/`b-done`, reads "All 9 rows… AstraZeneca 75 units, ISA cash £4,142.83", then "Sold 10 adds one more dated flow".
- **Correction:** Draw the 6-row receipt in Abstaining and drop `noRateNow`, or say the date was added first.

**R4-j8 · P3 · blocking: no · `holdings.js:77`**
- **Fault:** The new +22.3% is a GBP rate on INR flows with no "estimated" label.
- **Evidence:** MP-72 requires dated reference FX "labelled estimated" and lists "Estimated FX, labelled" as a state. Reliance's cost row says FX is estimated, and Apple's return row says so too.
- **Correction:** Append "FX estimated from dated reference rates."

**R4-j9 · P3 · blocking: no · `holdings.js:151`**
- **Fault:** "Older statements fill the gaps. Proposed · FIN-OD-04" reads as if older statements settle Reliance and AstraZeneca, and they cannot.
- **Correction:** Move that sentence to straight after the Nippon snapshot sentence, and update R3-j2.

**R4-j10 · P3 · blocking: no · `j.mjs:642`, `holdings.js:482`**
- **Fault:** Two new lines are not held.
- **Evidence:** Each of the `IMPORT_NOW` lines for Stale, Loading and Disagreement, set back to "being read" one at a time, left lane j's checks passing. Removing the holdings `CT-01` chip printed 213 of 213.
- **Correction:** Add those three states to R3-j16 and a label check for `a-live`/`b-live`.

**Covered:**
- **No fault found:**
  - The stacked Lanes on phones, in a capture and in text across all states.
  - Reliance's three turns and its root of +22.31%.
  - The Apple and HSBC schedules.
  - Every FIN-OD-06, MP-158 and MP40-Q12 line.
  - The new dates and receipt arithmetic.
  - The ordered-entry comparison, whose parsed fields are real and non-empty.
- **Not checked:**
  - Assistive technology.
  - A real device.
  - iPad and desktop, which I read as text but did not capture.

No repo files changed. My captures and scripts are in `/private/tmp/claude-501/-Users-arundutta-projects-mypaisaa-prediction/45ba900b-058a-4437-b30a-d55697f4dbd3/scratchpad/review4/j/`.
