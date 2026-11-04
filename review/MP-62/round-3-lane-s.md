**Lane s, round 3: 15 findings at `fc1303d`, 10 of them blocking.** All are in the delta unless a finding says otherwise. Mutations ran on copies in my scratch folder, and the repo is untouched.

**R3-s1 · P1 · blocking · `docs/design/journeys/src/shell.js:215` (joins `:28`)**
- **Fault:** a turned frame shows the wrong instrument after a state change. The press stores the target screen as it stood in that state, so `FLIP_TO` is skipped when the state moves.
- **Evidence:**
  - Forecast A, iPhone: press the flip on `a-instrument` in Ready, then choose Disagreement. The frame stays on `forecast|b|b-ladder` with "A Apple AAPL", while `FLIP_TO` sends that slot to Reliance's dossier.
  - Press the flip again and it lands on `a-instrument`, showing "R Reliance RELIANCE". So one flip goes from Apple to Reliance, against "Flipping shows the same figures".
  - The same fault applies to Abstaining (Apple against AstraZeneca) and to `a-technical`.
  - `PRESS` turns and returns inside one state, so no gate sees it.
- **Correction:** store only that the slot is turned. Work out the partner on every draw, with the same lookup `flipHTML` uses. Add a press case that turns in Ready and changes to Disagreement and Abstaining, turned and turned back.

**R3-s2 · P1 · blocking · `shell.js:218` (joins `forecast.js:454`, `:480`)**
- **Fault:** a dossier opened from a ladder row flips to another instrument, and does not come back to itself. The flip passes `hz` and `mode` but drops `scr.dataset.t`, and `a-instrument` draws the state's own subject.
- **Evidence:**
  - Forecast B, iPhone, Disagreement: press a ladder row and the frame shows `b-forecast`, "A Apple AAPL". Press the flip and it shows `a-instrument`, "R Reliance RELIANCE".
  - In Abstaining the same press gives AstraZeneca.
  - Flip back gives `b-ladder`, not the dossier. That falsifies "comes back to where it started" at `decision.md:212`.
- **Correction:** pass `t` through `ctxFor` and make `instrA` honour it, or send a ladder-opened dossier to its `FLIP_TO` partner (`a-3m`, `a-12m`). Coming back should restore what the frame showed. Add the case to `design_journeys_press.mjs`.

**R3-s3 · P1 · blocking · `docs/design/journeys/src/journeys/cost.js:404`**
- **Fault:** Flip B of The lines drops the risk that A states, against "Risk, staleness and uncertainty stay in view in both options".
- **Evidence (rendered text, iPhone):**
  - Disagreement: A reads "The bill counts, which takes the forecast past £60" and "£60 Warn Reached". B reads only "Where you are Estimate and bill differ £60 £75 £85 £100 £0". The forecast figure and "reached" appear nowhere visible on B.
  - Error: A reads "The AWS collector failed at 06:10 … the month is at least £44.40". B shows only the chip "Stale · 39 h old", with no failure and no floor.
  - Stale and Abstaining lose their sentences the same way.
  - `AGREED.cost` is only `/£46\b/`, `/£39\b/`, `/£100/`, and both sides carry the static `£46.48`, so the gate cannot see this.
- **Correction:** add `<p class="small muted">${month(ctx).say}</p>` and the first line's status (the rung text) to B's "Where you are". Add a fact that both sides carry the state's `say`.

**R3-s4 · P2 · blocking · `shell.js:211-215`, `:228-238`**
- **Fault:** quick presses can lose frames. `show()` installs the new `row.onclick` at once, but the old frames stay until the first staged draw. Slot ids repeat across journeys (`a-list`, `a-one`, `a-12m`). A flip on an old Holdings frame therefore writes `sum.flipped['journal|a|a-list'] = ['b','b-accounts']`, and Journal has no such screen.
- **Evidence:**
  - Real taps 80 ms apart, TOC Journal then the old `a-list` flip, during a 220 ms busy main thread.
  - Result: `frames: 2` of Journal's 5, with `TypeError … reading 'na'`.
  - It persists: leaving and returning to Journal again draws 2 frames. In the synchronous repeat, the same-journey option window throws `reading 'id'`.
- **Correction:** in `row.onclick`, return when the press's journey is not `j.id` or `s` is missing. Make `sideOf` treat an unknown pair as unturned. Add a selftest case.

**R3-s5 · P2 · blocking · `shell.js:216`, `scripts/design_journeys_check.mjs:98-128`, `:144`**
- **Fault:** the press pass never presses the real flip. It sets `__prismNoFit`, and the shell swaps `flipTurn` for `(el, fn) => fn()` under that flag. Lesson 32 is not met.
- **Evidence:**
  - Page copy where `flipTurn` never calls `swap()`, so no flip ever turns: `--only cost --surfaces iphone --themes light` gives "48 flips pressed, 0 problem(s)".
  - Copy with reduced motion removed from `flipTurn`: 0 problems. Copy with `#jlive` never written: 0 problems. "Honours reduced motion" has no gate.
  - The selftest has no case for "changed nothing", freshness, sheet, no way back, not coming back, or cannot be pressed (lesson 8).
  - `design_runtime.mjs` never mentions flip.
- **Correction:** add a flag separate from `__prismNoFit`, and press at least one flip per journey on the real path. Await `scr.getAnimations()`. Assert the swap, no transform under reduced motion, and the `#jlive` text. Add a selftest case for each untested refusal.

**R3-s6 · P2 · blocking · `scripts/design_journeys_press.mjs:80`**
- **Fault:** the "flip keeps a pressed horizon" case cannot fail. `/12M/` matches the switch label "3M 6M 12M", which is always on screen.
- **Evidence:** a copy where the flip drops `hz` gives "presses: 30 cases, 0 failed". The script has no `--selftest` at all (lesson 8). Case 2's `/3M/` has the same fault.
- **Correction:** use `/· 12M/`, and `/· 3M/` for case 2. Add a selftest that drops `hz` and `mode` in a copy.

**R3-s7 · P2 · blocking · `review/MP-62/fixed.json:2448` (R2-s3), `review/MP-62/round-2.md:9`**
- **Fault:** `round-2.md` says R2-s3's behaviour "is proved by pressing", but `PRESS` never reads `.jnote`.
- **Evidence:** a copy with `noteFor = sc => sc.note || ''` keeps the ledger's grep pattern and gives "36 combinations walked, 72 flips pressed, 0 problem(s)". Lessons 2 and 34 are not met.
- **Correction:** assert the note in `PRESS`, add a selftest case, and correct `round-2.md:9`.

**R3-s8 · P2 · blocking · `docs/design/journeys/src/journeys/privacy.js:287`**
- **Fault:** the No model state contradicts itself within Privacy. The delta moved the story to India, and the notice was left behind.
- **Evidence:** `privacy-a-notice` and `privacy-b-notice` read "No forecast to hold No approved model covers HSBC yet". `privacy-a-centre` in the same state reads "No approved model covers India yet" and shows HSBC "+2.1% · 6M", Pause. Home agrees with the centre.
- **Correction:** remove the `noModel` branch so the row reads "Forecast held". Add a fact.

**R3-s9 · P2 · blocking · `shell.js:15`, `:28`**
- **Fault:** the flip names a view it does not turn to, against Prism's anatomy ("the name of the view it turns to") and WCAG 2.4.6.
- **Evidence:**
  - R2-s21 renamed Burn-up to Pill, which reversed the fault. On 7 of 8 cost pairs "Pill" lands on a screen with no pill: `cost-a-month` on web shows a visible "Pill" button that lands on the burn-up.
  - `FLIP_TO`: on `a-instrument` in Disagreement, "Flip to Ladder" lands on "Dossier: forecast and proof".
  - The caption and `#jlive` repeat the wrong name. R2-s21's check tests only the export.
- **Correction:** name the target per pair, for example Pill at Home and Burn-up elsewhere, and name the dossier as a dossier. Add a fact.

**R3-s10 · P2 · blocking · `shell.js:286`, `docs/design/reviews/MP-62/decision.md:212-213`, `docs/design/journeys/README.md:58-59`**
- **Fault:** the records overclaim what a flip changes, which is MP-178's acceptance line.
- **Evidence:**
  - Inventory: "only the layout changes". Yet `privacy-a-data` holds Originals and the checkup holds devices and sign-in paths, `cost-a-sources` reads "The figures" against `cost-b-log`'s "What happened", and R3-s3 applies.
  - `cost-a-fit`/`cost-b-fit` share 99.1% of their words, and `a-brief`/`b-brief` 99.5%, so those flips change almost nothing while saying "Turned". `PRESS` compares only `data-at`.
  - `FLIP_OFF` (permission refused) and `FLIP_TO` appear in no record.
  - The no-flip list omits read-only screens such as `privacy-b-notices`, `ab-notices` and `ra-source`.
  - `decision.md`'s "A pair now shows the same facts in every state" and "comes back" are false per R3-s1 to R3-s3.
- **Correction:** say the shared figures stay the same, and that a side may hold more. List `FLIP_TO`, `FLIP_OFF` and the read-only exceptions. Correct `decision.md` once the fixes land.

**R3-s11 · P2 · not blocking · `shell.js:194-197`**
- **Fault:** a turned frame can name the wrong theme. `dress` reads the page theme, not the frame's.
- **Evidence:** switch the theme to Dark, then flip. The caption reads "DarkThe month by day" and the group name "dark theme", while the frame keeps `dev scheme-light` and light ink `#14171F`. `redraw` then reads that label and passes dark on.
- **Correction:** read the scheme from `.dev`, or redraw on a theme change.

**R3-s12 · P3 · not blocking · `shell.js:175`, `:132`, `:145`**
- **Fault:** turned frames clear inconsistently, and the flip can vanish inside a turned frame.
- **Evidence:**
  - The Option control on Cost cleared Home's turned frame, against "each journey flips on its own".
  - `J.go` and the TOC do not clear. Going to B and back through inventory ticks left Home's frame turned, against the comment "until … the option changes".
  - A frame turned to `b-done` or `b-private` loses its flip in Loading, Error or Offline.
- **Correction:** clear only the journey's own keys, and in one place.

**R3-s13 · P3 · not blocking · `scripts/design_gates.py:693-700`, `:774`**
- **Fault:** the token and inline-style gates miss forms lesson 11 expects them to read.
- **Evidence (`check_journeys` on mutated pages):** `style="--ink: #BBBBBB"` passes, `setProperty('--ink', …)` passes, and `style="${x ? 'animation: spin 1s linear infinite;' : ''}"` passes.
- **Correction:** read inline token declarations, and read inside computed values.

**R3-s14 · P3 · not blocking · `cost.js:322`**
- **Fault:** the log dates its figure two days late in Error.
- **Evidence:** the log reads "Last reconciled November · day 18 of 30 £37.69", while the burn-up says day 16 and "Figures stop at 16 Nov".
- **Correction:** use `m.last` in the row.

**R3-s15 · P3 · not blocking · `docs/design/journeys/README.md:3`, `:20-21`**
- **Fault:** the README has fallen behind the page.
- **Evidence:** line 3 says "one recommended" where the page says "starts here, proposed". `design_journeys_press.mjs` is not listed.
- **Correction:** update both lines.

**Covered:**
- All three parts, by the delta and by pressing.
- Mouse and keyboard on all four devices, in light, dark and reduced motion.
- Quick presses, and flips interrupted by a state, device or option change.
- The six states the gate does not press: 2,320 flips, 0 problems.
- A control audit of every frame, and the inventory counts (1398 of 1485, which match the page's matrix).
- `decision.md`'s 95 and 68 counts, which match `state.json`.
- Lesson citations and the wording of the MP-66 entry. `PH-00.json:380` belongs to the admin journeys (the design-time story in MP-64's scope), so it is not a fault.

**Could not check:** assistive technology and a real phone. Web fonts were blocked in my renders.
