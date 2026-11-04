**Lane s, round 4: 16 findings at `b58ae49`, 8 of them blocking (2 P1, 6 P2), no P0.**

**R4-s1 · P1 · blocking · `docs/design/journeys/src/journeys/cost.js:414`**
- **Fault:** R3-s3's fix put B's risk at the bottom of the page, so a flip to Limits on a phone hides it. This breaks "Risk, staleness and uncertainty stay in view in both options".
- **Evidence:**
  - iPhone, in Ready, Disagreement and Error: "Where you are" sits at y=880 on B and y=161 on A. The frame is 844 tall and the dock starts at 760.
  - Pressed in Disagreement (`limits-turned.png`): the frame shows only Every limit and Never paused. The only chips are "Twelve Data · Fresh" and "Yahoo · HSBC late".
  - "£60 Warn Reached" and "takes the forecast past £60" are off screen. A leads with them.
- **Correction:** `body: whereYouAre(ctx) + box(Every limit…) + always()`. R3-s3's fact still holds. Add a fact that "Where you are" comes before "Every limit".

**R4-s2 · P1 · blocking · `docs/design/journeys/src/shell.js:312`, `docs/design/journeys/README.md:59`, `docs/design/reviews/MP-62/decision.md:221`**
- **Fault:** the owner's acceptance line was narrowed without his word, against lesson 23.
- **Evidence:**
  - MP-178 says "Flipping shows the same figures". The three records now say the figures both sides show stay the same, and "a side may hold more".
  - The inventory's "Proposed:" starts only after that sentence, and OPEN has no row for it.
  - The owner's record (`decision-log.md:275-280`) has no such answer. The words came from R3-s10's correction, which was a reviewer's.
  - Prism still says "The figures, their freshness and the provider status stay the same; only the layout changes" (`docs/design/prism/index.html:1906`).
  - Rendered Home, Ready and Disagreement: the forecast is visible on A, and on B it is only in `.sr` text.
- **Correction:** keep R3-s10's words and pin. Mark the sentence Proposed in all three records, add an OPEN row, and put it to the owner on MP-178. Leave Prism until he answers.

**R4-s3 · P2 · blocking · `shell.js:230-232` (comment at `:222-223`)**
- **Fault:** a press inside a turned frame is lost on the way back, so the flip changes the horizon or detail unasked. The code comment says the second press gives way "unless the owner has moved on inside the frame", but `back` tests only `landed === here`.
- **Evidence:**
  - Real path, iPhone: Home A turned to Ledger, 12M pressed and lit, flip back gives Tiles with 6M lit and "+6.2% · 6M".
  - Home B at 3M comes back at 6M.
  - Forecast A: turned to the ladder, Technical pressed, flip back gives Simple.
  - The press pass only presses before the flip.
- **Correction:** when `back`, overlay the frame's current `hz` and `mode` on `was.from[2]`. Add press cases for turn, press, flip.

**R4-s4 · P2 · blocking · `shell.js:198`, `:230`; `decision.md:220`**
- **Fault:** a turned Technical frame loses its way home after a state change, against "a second press returns to what the frame showed".
- **Evidence (20 cases in 2,464 turned frames):**
  - `a-technical` turned in Ready, then Disagreement or Abstaining: the frame shows `b-forecast`, and the press lands on `a-instrument`, caption "Instrument at a horizon", with no Turned chip.
  - `b-technical` lands on `b-ladder` the same way.
  - Further presses alternate between those two and never reach Technical mode until the state changes.
  - The R3-h2 press case asserts this landing as correct, because the control says so.
- **Correction:** when a turned frame's control points back to the slot's own option, point its `data-flip` at the slot's own screen. "Lands where it says" then still holds. Add a press case that turns, changes state and presses on every pair (lesson 35).

**R4-s5 · P2 · blocking · `shell.js:15-17`**
- **Fault:** R3-s9 is only partly fixed. The flip still names views it does not turn to, against Prism's "the name of the view it turns to" (`prism/index.html:1908`) and WCAG 2.4.6.
- **Evidence:**
  - `a-proof` says "Flip to Ladder" and lands on "Dossier: proof". The caption reads "Turned to B · Ladder" and no ladder is drawn.
  - By title, `a-views` and `a-evidence` land the same way, on "Dossier: views" and "Dossier: evidence".
  - Web: `cost-a-limits`, `cost-a-sources` and `cost-a-fit` say "Burn-up" and land on a table, a log and a list with no chart.
  - `cost-b-log` and `cost-b-fit` say "Ladder" and land with no ladder and no rung.
  - `#jlive` repeats it: "Limits: Burn-up view".
- **Correction:** add `FLIP_AT` names for those targets, and add a fact that reads each `aria-label`. The R3-s9 ledger pin matches the whole `FLIP_AT` line, so it must be narrowed to keep its three entries.

**R4-s6 · P2 · blocking · `review/MP-62/round-3.md:8`, `review/MP-62/fixed.json:3452`, `scripts/design_journeys_press.mjs:21-27`**
- **Fault:** three blocking fixes can be undone with their checks still passing, although `round-3.md` says the walker, the press pass and their selftests prove their behaviour. This fails lessons 2, 9 and 34.
- **Evidence (each on a copy):**
  - R3-s9: `FLIP_NAMES` cost put back to `['Meter', 'Pill']`, the original fault. Facts 213 of 213, walker `--only cost` on web 0 problems, and the ledger pin reads a different line. Names are in rendered HTML, so "CI has no browser" does not apply.
  - R3-s4: owner guard removed. Facts 213 of 213, walker `--only holdings,journal` 0 problems. No selftest case exists, though R3-s4's correction asked for one, and the press pass has no quick-press case.
  - R3-s6: regex put back to `/12M/`. `--selftest` still printed "the good page passes and a flip that drops the horizon is refused". The bad page fails 86 of 140, and only 2 are the named fault. Line 27 tests only `status === 0`, so an alarm kill also counts as refused.
- **Correction:**
  - Add a fact for the flip names.
  - Add a selftest case for the guard.
  - Mutate `hz` alone. That copy gave exactly one failure, "home a-portfolio: the flip drops the press", so assert that text.
  - Correct `round-3.md`.

**R4-s7 · P2 · blocking · `docs/design/journeys/src/journeys/privacy.js:27`, `:371`, `:444`**
- **Fault:** No model is marked not applicable on A notice, but it can occur.
- **Evidence:**
  - The reason reads "The missing model is for India. This notice is about HSBC, so nothing changes", which admits the state occurs.
  - It appears under the inventory's "Why it cannot occur" (`shell.js:312`), against the README's "only when it truly cannot occur".
  - The screen holds a forecast row, "Forecast held", and the notice opens from the Privacy centre's inbox in that state.
- **Correction:** draw the state with one line, such as "No approved model covers India yet. HSBC keeps its forecast, held." Remove `noModel: NA_NOTICE`, and change only the `must(v.na…)` line at `tests/journey_facts/s.mjs:380`. R3-s8's fix stays: forecast held, nothing "covers HSBC".

**R4-s8 · P2 · blocking · `cost.js:131-134`, `:368`**
- **Fault:** the Where you are card states proposed rules with no label beside them, against lessons 25 and 36. R3-s3 copied `m.say` into B without `m.q`.
- **Evidence:**
  - Stale: "Past 36, optional work waits" has no chip in its card on either side. The only MP40-Q6 chip is on Never paused, about the £15 window.
  - Abstaining: `q: 'MP40-Q5'` appears nowhere on `cost-a-limits` or `cost-b-limits`.
- **Correction:** add `${m.q ? proposed(m.q) : ''}` to both cards, and a fact for it.

**R4-s9 · P2 · not blocking · `cost.js:384`, `:410`**
- **Fault:** the sources and log pair does not keep freshness, against README:59 ("must show the same freshness").
- **Evidence:** A shows "Age 15 h" and "Age 3 h". `cost-b-log` shows no lane age. R2-s7 compares `.jfresh` chips only.
- **Correction:** add `sourcesCard(ctx)` to the log's rail.

**R4-s10 · P3 · not blocking · `docs/design/journeys/src/journeys/forecast.js:476`, `docs/design/journeys/src/journeys/home.js:472-480`**
- **Fault:** a press inside a turned frame leaves the caption behind.
- **Evidence:**
  - "Dossier: forecast and proofTurned to B · Ladder": the chip is stale and the space is lost.
  - Home `a-12m` turned, 3M pressed: the caption still reads "Ledger at 12 months".
- **Correction:** refresh the chip's name, and the title where the horizon changes it, in both handlers.

**R4-s11 · P3 · not blocking · `scripts/design_journeys_check.mjs:202`**
- **Fault:** a flip can say "Turned to B" with identical text, because the check runs in only three states.
- **Evidence:**
  - `a-imports` in Offline, iPhone and phone web.
  - `a-done` in Empty, iPhone and phone web.
  - `a-brief` in Loading and Empty, iPhone and phone web.
  - `a-scenarios` in Empty, iPhone and phone web.
  - Phone web: cost warned, reduced, paused and fit, and devices, in Loading; A notice in Loading and Error.
- **Correction:** run the text comparison in all nine states, and let each state either differ or say why it does not.

**R4-s12 · P3 · not blocking · `scripts/design_gates.py:782`**
- **Fault:** R3-s13's gates miss forms that lesson 11 expects them to read.
- **Evidence:** each of these passes `check_journeys`:
  - `style="font-family:'Inter';--ink:#BBB"`
  - `style.cssText`
  - `setAttribute("style",…)`
  - ``setProperty(`--ink`…)``
  - a computed prefix before the token
  - `STYLE=`
  - `element.style.animation="… infinite"`
- **Correction:** match any quote, the two script forms and upper case, each with a mutation.

**R4-s13 · P3 · not blocking · `design_journeys_check.mjs:128`, `:144`, `:150`, `:218`**
- **Fault:** four refusals have no selftest case, against lesson 8: "it comes back different", "the frame does not turn", "on the real path it did not come back" and "no flip was pressed".
- **Evidence:** "the frame does not turn" does bite. A copy with the rotation removed gives 1 problem, but nothing proves that in the selftest.
- **Correction:** add one mutation for each.

**R4-s14 · P3 · not blocking · `decision.md:221-222`, `tests/journey_facts/flip.mjs:10-17`**
- **Fault:** the record says agreed figures cover "each journey's key numbers", but `AGREED` has no forecast or privacy row.
- **Correction:** add the rows, or say six of eight.

**R4-s15 · P3 · not blocking · `review/MP-62/round-3.md:70`, `review/MP-62/state.json`**
- **Fault:** R3-s7's anchor is `review/MP-62/fixed.js`, which does not exist. The lane report says `review/MP-62/fixed.json:2448`, and it is the only round 3 anchor with no line number.
- **Correction:** fix both records.

**R4-s16 · P3 · not blocking · `privacy.js:149`**
- **Fault:** `Proposed · FIN-OD-06` follows "It never performs an action", which is MP-162's settled negative, so it reads as proposed.
- **Correction:** attach the chip to the late-price row.

**Covered:** all three parts of the lane.
- **Presses:** 2,464 turned frames across state changes and 3,480 across devices. 1,168 flips matched a fresh draw exactly. I also pressed on the real path by mouse and keyboard in light, dark and reduced motion. Those runs found no stuck frame, no sheet behind a flip, no page error and no control under 44 points.
- **Could not check:** assistive technology, a real phone, or every state pair on every journey; web fonts were blocked. The Limits position was measured on iPhone only.
- **Left behind:** the repo is untouched and no browser is left running.
