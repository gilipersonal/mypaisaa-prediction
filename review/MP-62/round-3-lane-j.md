## Lane j, round 3 findings

**R3-j1 · P1 · blocking yes · journal.js:176-179, 277; tests/journey_facts/j.mjs:257**
- **Evidence:** On iPhone and phone web, Lanes draws only the To decide lane.
  - Rendered in every state, `b-board` has no "Unresolved", "Rose 12.4", "Fell 11.6", "Corrected to" or "Outcome due". The one exception is No model, which draws Waiting but still no scored outcome.
  - `laneC` is unreachable on a phone. `o.on` is only ever 0 or 1.
  - In Chrome, pressing "Scored 3" on the iPhone frame changes nothing.
  - The flip goes from seven entries with their statuses to one row plus counts. The disputed HSBC outcome and every scored outcome drop out.
  - "Waiting 4" also merges what wide screens split as "3 for a horizon, 1 unresolved".
  - R2-j2 passes on phones because it reads only the three counts.
  - This breaks MP-178: "Risk, staleness and uncertainty stay in view in both options", and "in every state". It is the same class as R2-j7.
- **Correction:**
  - Draw Waiting and Scored on phones, as working lanes or as frames, and split the count ("Waiting 3 · Unresolved 1").
  - Otherwise add one summary line under the control in every state: "3 scored: 2 inside, 1 outside. 1 unresolved: HSBC."
  - Extend R2-j2 to read the entries on phones.

**R3-j2 · P2 · blocking yes · holdings.js:74, 148, 337, 341; tests/journey_facts/j.mjs:116-133**
- **Evidence:** "Two rates fit these cash flows, 10% and 20% a year" is false for the flows drawn beside it.
  - Reliance's events are 12 Feb 2024 −£5,000, 9 Sep 2024 +£5,900, 3 Mar 2025 −£6,700, and a terminal +£8,940.30.
  - They have one root in a scan from −90% to +510%: **+22.31%**. NPV is +£1,420.68 at 10% and +£223.41 at 20%.
  - Exactly two roots cannot occur on a position that opens with a purchase and ends on a positive value, short of a tangent root. The sign changes are odd, so the root count is odd. FIN-AC-19's two-root case ends negative: [-100, 230, -132].
  - The other holdings do add up: Apple 14.18, ISA 13.10, General 17.02, HSBC 8.10.
  - AstraZeneca's rewritten flows have one clean root, +5.85%, so "the search stopped at its limit" is a stretch.
  - This line predates the delta, but it is R2-j15's fault ("Do not claim a root the flows cannot produce"). R2-j7 also moved the claim onto phone B and now requires its words. The comment at :337 says "the dates give its stated return", and nothing tests that.
- **Correction:**
  - Show Reliance's true rate and draw Ambiguous on a position that can produce it, such as one closed on FIN-AC-19's shape. Or put to the owner that the status is a labelled fixture, not derived from these events.
  - Update `L`, `measures`, `coverage` and the R2-j7 regex.
  - Add a check that computes XNPV of each drawn schedule at each stated rate.

**R3-j3 · P2 · blocking yes · holdings.js:27, 124, 327; journal.js:12; shell.js:248; joins home.js:56, forecast.js:39, cost.js:252, privacy, research, decision.md:191**
- **Evidence:** `Proposed · MP40-Q6` sits on HSBC's price limit, but MP40-Q6 is another question.
  - questions.json: "Approve the cost freshness rules: AWS billing data older than 36 hours… credit proof… £15 emergency window", which "decides: When stale cost data stops optional work (gap CT-13)", story PH02-S10.
  - Answering it would settle nothing about prices.
  - Price age limits sit under FIN-OD-06, "Risk windows and source freshness", status owner_pending, still open: "source freshness".
  - The delta spreads the label (`sayBehind`) and pins it in R1-j2 and R2-j8.
- **Correction:**
  - Relabel every price use `Proposed · FIN-OD-06`, or a new question if the owner prefers. Keep MP40-Q6 on the billing uses (cost.js:34, 192; home.js:65).
  - Update the OPEN row, decision.md, and j.mjs, h.mjs:215, r.mjs:222, s.mjs:126.

**R3-j4 · P2 · blocking yes · holdings.js:364, 513**
- **Evidence:** Rendered Abstaining on `b-check-2`, `b-check-3` and `b-duplicate`: "Sold 10 AstraZeneca 22 Oct · 3 rows… Confirmed".
  - The step before says Claude could not read that date, and the step after (`b-approve`) says "Date not read… One group cannot be approved".
  - MP-48: "absent, not guessed".
  - R2-j5 says "absent everywhere" but lists seven screens and omits these three.
- **Correction:** Pass `unread: ctx.state === 'abstention'` from `stepScreen`, let `unread` beat `o.at >= 2`, and add the three screens to R2-j5.

**R3-j5 · P2 · blocking yes · holdings.js:364-365; tests/journey_facts/j.mjs:308**
- **Evidence:** In Stale and Offline, `b-check-2` has "Select Sold 10 AstraZeneca" live. `b-check-3` and `b-duplicate` also have "Select Bought 30 HSBC" live.
  - The same screens say "Answering waits until you reconnect".
  - The delta gave `dis: o.off` to Apple's row only. R2-j6 ("nothing can be pressed") covers only `a-preview` and `b-check`.
- **Correction:** Add `dis: o.off` to both `on: true` rows, and extend R2-j6 to the three steps. Its exactly-one-ticked rule must change, because 2 or 3 are ticked there.

**R3-j6 · P2 · blocking yes · journal.js:38, 232**
- **Evidence:** New on `a-list` in this delta: "Rules and models differ on Reliance. Both sides show, and no action is ranked."
  - Timeline shows neither side. Its only Reliance row is the 2 Jun entry, and baseline −2.4% and +7.4% appear nowhere.
  - B's card does show them, so the flip changes the facts.
  - This is R1-j13's fault back on a new screen. R1-j13 covers `b-board`, not `a-list`.
- **Correction:** Put the figures in `sayRanking` for both sides: "At 6 months the baseline shows −2.4% and R2-HGB v3 +7.4%, and no action is ranked." Add `a-list` to the check.

**R3-j7 · P2 · blocking yes · journal.js:97-99, 113, 202, 213, 288; shell.js:259**
- **Evidence:** The abstention rule and the disagreement drawing contradict each other, and only one is labelled.
  - `a-pick`'s note says "with no action there is nothing to record against".
  - In Disagreement, `a-pick` lists "Reliance… No action ranked", and `a-record` and `b-decide` offer live "Record decision" with no Proposed label. The sheet says "Saved with the action… you saw", though no action exists.
  - "A disagreement stays recordable" is marked proposed only in the inventory. MP-158 ties an entry to "the exact action".
- **Correction:** Show `Proposed · MP-158` on those Disagreement screens and `b-board`, change the sheet line for that state, and put the question to the owner.

**R3-j8 · P2 · blocking yes · holdings.js:65, 291, 304-305**
- **Evidence:** `a-one` and `b-one` in Stale say "Left out of the total until its price returns" with no Proposed label on any device. `a-list`, `b-accounts`, `a-record` and `a-pick` all carry one in the same state.
- **Correction:** Add the label in both one-holding views and a check. Use the id settled by R3-j3.

**R3-j9 · P2 · blocking yes · holdings.js:493; tests/journey_facts/j.mjs:13, 280-286**
- **Evidence:** `a-private` and `b-private` draw the import card "What will change · Imports · 1 group selected · 3 rows of 11 · Apple 60 → 64 units" without the sentence.
  - `b-private` has no trade wording at all, on web or iPhone. `a-private` has only the list foot.
  - `PRICED` exempts both from R2-j3.
- **Correction:** Put `NO_TRADE` on that card and cover it in R2-j3.

**R3-j10 · P2 · blocking yes · tests/journey_facts/j.mjs:251-278, 287-289**
- **Evidence:** Two tightened checks claim more than they test. Mutations were run on copies with `--page`.
  - R2-j2 says "the same entries". It still passed with `b-differ`'s table cut to 2 of its 4 rows (R2-j8 passed too).
  - It also passed with Reliance repeated in the Scored lane, and with HSBC replacing AstraZeneca there.
  - R2-j4 says "No 'Reconciled' beside an open difference, anywhere". It passed with a green "Reconciled, 30 Sep" chip beside "Difference open, £8.15", because it matches only `/Reconciled to/` (lessons 3, 11).
- **Correction:**
  - In R2-j2, compare ordered entries (name, date, status, line) across each flip pair.
  - In R2-j4, use `/Reconciled(?! again)/`.

**R3-j11 · P2 · blocking no (already there) · holdings.js:311, 314**
- **Evidence:** `a-one` Error says "No partial rate is shown" above "Stocks ISA… +13.1% a year" and "General account… +17.0% a year". `b-one` shows neither, so the flip changes the figures. MP-69: no partial value shown as complete.
- **Correction:** Show "Not shown" in `acctCard` on Error.

**R3-j12 · P2 · blocking no (already there) · holdings.js:518-519, 508-509**
- **Evidence:** `b-check-2` Abstaining says "Claude suggests nothing here… neither is marked", then the option reads "Claude suggests this; only you confirm it". Disagreement says Claude read a US price, yet the option suggests HSBA.
- **Correction:** Pass `noClaude` in both states.

**R3-j13 · P3 · blocking no · journal.js:172**
- **Evidence:** "Reliance · Ranked today · 6 months · No action ranked" appears on one row, and R2-j2 pins "Ranked today".
- **Correction:** Use "Not ranked today" in that state.

**R3-j14 · P3 · blocking no · holdings.js:270, 274**
- **Evidence:** `b-done` Stale has "A newer change reached the ledger first, at revision 215" above "Checked: no later event depends on these rows."
- **Correction:** Say "Not checked against revision 215" in Stale.

**R3-j15 · P3 · blocking no · journal.js:43, 90-91, 97**
- **Evidence:** The Today entry conflicts with three states.
  - Error reads "your entries as of Mon 21:15" above "NVIDIA Today", and today is Tuesday 3 Nov.
  - `a-record` No model says no action is ranked on NVIDIA, while `a-list` No model holds a Trim entry recorded Today.
  - "Your entries on NVIDIA" lists one of its two entries.
- **Correction:** Fix the snapshot day or the entry label, and show both entries.

**R3-j16 · P3 · blocking no · holdings.js:149, 559**
- **Evidence:** `a-list` always says "1 import is being read". Imports says "no model has read it" in No model and "Upload stopped at 62%" offline.
- **Correction:** Take the wording from the state.

**R3-j17 · P3 · blocking no · holdings.js:225, 227, 339**
- **Evidence:** Two rendering gaps.
  - `a-imports` Loading and Error drop the open difference, while `b-imports` still shows £8.15. `b-accounts` Loading drops it, while `a-list` still shows it. MP-65: it stays open and visible.
  - "Original deleted" shows only on B. A never shows the evidence gap on Apple.
- **Correction:** Keep both facts on each side.

**R3-j18 · P3 · blocking no · journal.js:113, 288; holdings.js:390, 449, 453, 339-340, 266**
- **Evidence:** Illustrative details that do not hold.
  - Reliance "Added 10 units… On the rules alone" sits beside "the rules point down".
  - "Broker fee taken after the statement closed" cannot explain a statement £8.15 below the ledger.
  - Trades fall on non-trading days: 26 Sep 2026 (Saturday, new in this delta), 22 Feb 2025, 3 Nov 2024, 1 Nov 2026.
- **Correction:** Change the wording and dates.

**R3-j19 · P3 · blocking no · holdings.js:28; tests/journey_facts/j.mjs:279**
- **Evidence:** Both comments call the sentence "the owner's own words". It came from R2-j3's correction, and no owner record contains it (lesson 23).
- **Correction:** Change the comments, or get the owner's words.

**R3-j20 · P3 · blocking no (already there) · holdings.js:25; journal.js:14**
- **Evidence:** The MP40-Q12 label shows only on web and phone web, but Q12 asks what "the app may keep offline", and Privacy labels it on native. iPhone and iPad offline copies carry no label.
- **Correction:** Show the label on every surface.

I covered the lane's delta on all states and sides, the Approvals revoke join (no faults: figures, hash, times and sentence match), every event sum and rate, the ticks and account foot in both themes, and mutations of copies. I could not check an assistive-technology pass or a real device. Evidence scripts are in `/private/tmp/claude-501/-Users-arundutta-projects-mypaisaa-prediction/45ba900b-058a-4437-b30a-d55697f4dbd3/scratchpad/review3/j/`, and the repo was not touched.
