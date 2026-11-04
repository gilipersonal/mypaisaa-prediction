**R3-h1, P1, blocking.** `docs/design/journeys/src/shell.js:218`, `docs/design/journeys/src/journeys/forecast.js:488`
- **Evidence:** in Chrome on iPhone and web, I opened any `b-ladder` row in Disagreement or Abstaining, then pressed the flip. The name changed.
  - Disagreement: `Apple forecast|b|b-forecast` became `Reliance forecast|a|a-instrument`, at all three rows.
  - Abstaining: Apple became AstraZeneca.
  - The same happens from a dossier tab. Apple's Views turned to `a-views` with title and back reading RELIANCE.
- **Cause:** a row sets `scr.dataset.t`, but the flip's `ctxFor(...)` passes only `hz` and `mode`, and `instrA` reads `subj(st, hz)`. forecast.js line 6 says "A frame keeps its instrument".
- **Correction:**
  - Pass `t: scr.dataset.t` in the flip's context.
  - Have `instrA` and `ladderB` use `pick(ctx, hz)`, and apply `clear()` on `a-proof`, `a-views` and `a-evidence`.
  - Add a press case to `scripts/design_journeys_press.mjs`: open a row, flip, compare heads.

**R3-h2, P1, blocking.** `docs/design/journeys/src/shell.js:215`
- **Evidence:** the click ignores `data-flip` and only deletes the slot's memory.
  - Turned `a-proof`, Dossier Views: the flip says `forecast|a|a-views` and lands on `a-proof`. All 9 tab cases on `a-proof`, `a-views` and `a-evidence` land on the slot's own screen.
  - Turned `a-instrument` in Ready, then state set to Disagreement: the frame shows Apple's ladder and the flip says `a-3m`, but it lands on Reliance `a-instrument`. Abstaining lands on AstraZeneca. `a-technical` does the same.
  - Unturned `b-forecast`, Proof, flip, flip back: returns to the Forecast tab.
- **Correction:** always take the target from `data-flip`. Delete the key only when the target is the slot's own option and screen. Add a press case for a flip after a tab press and after a state change.

**R3-h3, P1, blocking.** `docs/design/journeys/src/journeys/home.js:485`, `home.js:493`, `tests/journey_facts/h.mjs:338`
- **Evidence:** in Empty on all four devices, `a-portfolio` draws the board with scores ("1 MSFT 74"). The flip partner `b-ledger` says "Until the first run, no list and no score exists." `b-12m` does the same.
- The new R2-h6 check returns early on Empty, so it never sees this.
- **Correction:**
  - Give `homeB` the same treatment as `homeA`: `switcher` at `{ ...ctx, state: 'default', nohold: true }`. Rankings need no holdings (MP-135).
  - `t5Row`'s `held()` must then honour `nohold`.
  - Replace the early return with a check that both sides agree.
  - `a-board` still says no lists in Empty, so tell the owner what Empty means on each screen.

**R3-h4, P1, blocking.** `tests/journey_facts/h.mjs:272-275`
- **Evidence:** the R2-h1 check skips `b-ladder` and `b-technical` when the target is `a-instrument` or `a-technical` in Disagreement or Abstaining, and its comment says FLIP_TO "still sends" them there. That is no longer true.
- I restored those FLIP_TO targets on a copy of the page. Apple's ladder then turns to another name, yet facts pass 165 of 165 and presses pass 30 of 30. The fix is unguarded (lessons 2, 8).
- **Correction:** delete the skip and the stale comment, so head equality is required in every state.

**R3-h5, P2, blocking.** `tests/journey_facts/h.mjs:412-414`
- **Evidence:** "no other name, on any Home or Forecast screen" is a regex over six old tickers in set phrases.
- I added `NVDA: 1` to both disagreement tables and `MSFT: 1` to both abstention tables. NVIDIA rendered "split, no median stands" and Microsoft rendered "Abstained · no range". Facts still passed 165 of 165.
- **Correction:** assert from the rendered rows that the holding rows on Home and the listing cells on Forecast show Split or Abstained only for the four table entries.

**R3-h6, P2, blocking.** `docs/design/journeys/src/journeys/forecast.js:512`, `forecast.js:576`, `forecast.js:579`, `forecast.js:582`
- **Evidence:** a dossier opened on the 12-month row titles itself "12 months". Its Proof, Views and Evidence tabs then read "6 months", because `dTitle(ctx)` drops hz. The Forecast tab reads 12 months again.
- On iPhone and phone web, `b-forecast` at hz 2 puts "over 26 scored forecasts" above "Proof · 6-month task … over 52 … Coverage 79%". That is R2-h25's fault on the new route. Its check covers only `a-12m`. Web and iPad are correct.
- **Correction:**
  - Pass `ctx.hz` to `dTitle`.
  - Give `proofMain` and `proofTop` the horizon (`proofAt(hz)`, 12 months labelled Exploratory).
  - Extend R2-h25 to `b-forecast` and `b-proof` at `{hz:'2'}`.

**R3-h7, P2, blocking.** `docs/design/journeys/src/journeys/home.js:424`
- **Evidence:** the `t5Row` screen-reader text on Apple says ", rules and models disagree". Apple's models split at 3 months, and the rules-and-models conflict is Reliance's. `tileRows` got the fix and this row did not (lessons 1, 3).
- Visible text on B is an icon alone, while A says "split at 3 months".
- Restoring the old wording on the tile on a copy still passes 165 of 165, so neither row is held.
- **Correction:** use `FLAG[st][r[0]]` in visible text in `t5Row`, and add a check on both rows.

**R3-h8, P2, blocking.** `docs/design/journeys/src/journeys/home.js:102`, `home.js:412`
- **Evidence:** web `b-ledger` and `b-12m` draw the same three-horizon table, but the Action column differs.
  - Disagreement: Reliance reads None on `b-ledger`. On `b-12m` it reads Add, beside its own "Disagree" 6-month cell.
  - Abstaining: AZN reads Hold beside "Abstained", and Apple flips from Hold to None.
- The column names no horizon (MP-144).
- **Correction:** header `Action, ${HZ[hz].s}` in `ledgerFull`, plus a check on both frames.

**R3-h9, P2, blocking.** `docs/design/journeys/src/journeys/home.js:171-172`, `home.js:205-206`
- **Evidence:** `a-brief` reads "One abstention." then "Apple abstained at 12 months". It reads "One conflict." then "The models also split on Apple".
- `a-portfolio` shows "Two holdings abstained." and "3 actions · 1 abstention" on one frame. The Forecast root and Research say "Two abstentions".
- **Correction:** retitle the banners to what they count, for example "One abstention moves an action." The pill is held by R1-h10, so keep its "3 actions". Change its second half only if that check is narrowed to the action count.

**R3-h10, P2, blocking.** `docs/design/journeys/src/journeys/home.js:98`, `home.js:105`, `home.js:176`
- **Evidence:** R2-h12 changed only the row behind the sheet. In No model, `a-action` reads "No label" and "rather than a guess". `a-portfolio`, `b-ledger` and `a-brief` in the same state read Trim on NVIDIA, and that row is what opens the sheet (MP-144).
- **Correction:** apply the No model label in `rowOf` and in `actRows`, and extend R2-h12 to those three screens.

**R3-h11, P2, non-blocking.** `docs/design/journeys/src/journeys/forecast.js:406`, `forecast.js:553`, `forecast.js:586`
- **Evidence:** in Stale, the ladder block reads "Scenarios · HSBA £5,710 to £8,080". The screen it opens is "this Apple holding", £13,864, with back to AAPL.
- **Correction:** make the stale block open HSBC's own scenario, or say the stale FX example is drawn on Apple.

**R3-h12, P3, non-blocking.** `docs/design/journeys/src/journeys/home.js:14`, `docs/design/journeys/src/journeys/forecast.js:25`, `forecast.js:74`, `forecast.js:382-383`
- **Evidence:** "Forecast reads the same table" is false, because `OUT` is two literals. The ladder and its fan hard-code `l.k === 12` and `l.k === 3`.
- **Correction:** move `OUT` to the shell and read it in the ladder.

**R3-h13, P3, non-blocking.** `docs/design/journeys/src/journeys/forecast.js:459`, `forecast.js:468`, `forecast.js:539`
- **Evidence:**
  - After a horizon press, `a-3m` and `a-short` show "12-month forecast", while the caption and `aria-label` still read "At 3 months".
  - `a-short`, press 3M, flip twice: returns to Short-term.
  - The Short-term chip does nothing, though the note says "Reached from the switch".
- **Correction:** update the caption from `hz`, and wire the chip or change the note.

**R3-h14, P3, non-blocking.** `docs/design/journeys/src/shell.js:28`, `docs/design/journeys/src/journeys/forecast.js:85`
- **Evidence:**
  - In Disagreement and Abstaining, `b-technical` flips to `a-3m` and `a-12m` in Simple, and the percentiles go.
  - The flip reads "Ladder" where the target is the single-horizon dossier.
  - On the ladder the median line and ring still sit at +3.1% under "no median stands there".
- **Correction:** carry the mode, name the target, and do not draw the median through a split 3 months.

**R3-h15, P3, non-blocking.** `docs/design/journeys/src/journeys/home.js:245-254`, `home.js:300`
- **Evidence:** on the six non-US-tech lists, A reads "No conflict here." or "Nothing dropped out here." or "This list stands." B reads "One name is split." or "One name lost a part." or "India is not ranked." Neither is false, but the US tech pair was made word for word and these were not.
- **Correction:** give B the list's own line.

**R3-h16, P3, non-blocking.** `docs/design/journeys/src/journeys/forecast.js:441`, `docs/design/journeys/src/journeys/home.js:221`, `home.js:253`
- **Evidence:** gold holds as the No model subject on every instrument page, but the Forecast root's No model banner names only India. Separately, "Apple lost its growth part … at 12 months" is unlabelled, and MP-135 feeds growth and protection from those forecasts, yet Protection 70 stands.
- **Correction:** add gold to the banner, and put the growth-only reading to the owner as a proposed question.

**Covered:** the lane's delta and joins, pressed in Chrome on iPhone, web, iPad and phone web, with non-browser renders of every flip pair in every state and 6 mutated page copies. Scripts are in `/private/tmp/claude-501/-Users-arundutta-projects-mypaisaa-prediction/45ba900b-058a-4437-b30a-d55697f4dbd3/scratchpad/review3/h/`. **Not checked:** an assistive-technology pass, or `tr { position: relative }` in Safari.
