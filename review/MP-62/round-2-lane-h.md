**Lane h, round 2: 25 findings (7 P1, 14 P2, 4 P3), 18 of them blocking. No P0.**

## P1

**R2-h1 · P1 · Blocking: yes · `forecast.js:23`, `:358`, `:450`; `shell.js:19`**
- **Evidence:** pressing the flip in Chrome on `a-instrument` changes the instrument in two states.
  - Disagreement: `Reliance / RELIANCE · XNSE` turns to `Apple / AAPL · XNAS`, leading with "Models disagree at 3 months."
  - Abstaining: `AstraZeneca / AZN · XLON` turns to `Apple`, leading with "12 months abstained."
  - `a-technical` and `b-technical` do the same.
  - In No model, `a-short` (back label AAPL) flips to gold, and `b-forecast` (back label AAPL) flips to gold.
  - The horizon switch has the same fault: `subj()` drops AZN or Reliance when pressed to 3M.
  - `MP-178-same` compares this pair only in Ready, so nothing catches it.
- **Correction:** keep Apple on `a-12m` and `b-ladder`, which R1-h2 and R1-h13 hold.
  - In `flipHTML`, send `a-instrument` and `a-technical` to `b-forecast` in those two states. `b-forecast` already draws the same subject.
  - Keep the switch on one instrument.
  - Extend `MP-178-same` to compare the instrument head in all nine states.

**R2-h2 · P1 · Blocking: yes · `forecast.js:138`; `h.mjs:29`**
- **Evidence:** `b-technical` in Abstaining sits under the banner "12 months abstained." Its Technical table still reads `12 months −10.2% +0.5% +23.7% +33.9%`. This is the range R1-h2 removed from `b-ladder`, and it shows on every device I read (iPhone and web). `a-12m` says "no range is shown" in the same state.
- **Correction:** in `ladTech`, draw the 12-month row as "Abstained · no range". Extend R1-h2's check to `b-technical`.

**R2-h3 · P1 · Blocking: yes · `forecast.js:108`, `:94`, `:137`, `:395`**
- **Evidence:** the two sides of a flip contradict each other in Disagreement.
  - `a-3m` shows "Evaluated model +3.1% median".
  - `b-ladder`, which it flips to, says "no median stands there".
  - `b-forecasts` shows `+3.1% Split`, and `rootRow` draws the same median at 3M.
  - `techCard` would print "Median" at 3M after a press.
- **Correction:** one rule on every screen. The split 3-month view shows its range and no median, on `hzCard`, `cellOf` and `techCard`. Do not change the ladder (R1-h2).

**R2-h4 · P1 · Blocking: yes · `forecast.js:402`**
- **Evidence:** `b-forecasts`, on iPhone and web, has no "80% range" and no "14:10". Its rows read `+6.2% Evaluated`, HSBC reads `+2.1% Held`, and gold reads `None`. `a-forecasts` shows "80% range −9.8% to +21.4%", "Held · late price, 14:10" and "Unavailable · SCI-D08". The flip therefore drops uncertainty, staleness and the reason, and the medians are bare.
- **Correction:** add each cell's range, HSBC's late time, and gold's reason to `rootTable`.

**R2-h5 · P1 · Blocking: yes · `forecast.js:424`, `:432`; `home.js:451-452`; `shell.js:28`**
- **Evidence:** driven in Chrome.
  - Any press on Forecast horizon, Detail or Dossier removes the flip (`flip: null`), because neither redraw passes `screen` and `flipHTML` returns ''.
  - On a flipped frame the press acts on the wrong option. Home's Ledger snaps back to Tiles while the caption still reads "Ledger". The Ladder snaps back to the 6-month page while the caption reads "Every horizon".
  - The press can also go dead. In the flipped proof, Evidence takes `aria-pressed=true` but Proof stays on screen. In the B view, flipped to A, 12M lights while "6-month forecast" stays. That is R1-h13's fault again.
- **Correction:** record the frame's current option and screen on `.scr` at every draw. Have both redraws read them and pass `screen`.

**R2-h6 · P1 · Blocking: yes · `home.js:465-470`, `:530`**
- **Evidence:** `b-ledger` ends at the running cost and the brief. "Top 5" and "MSFT" are absent on iPhone and web. Its note on `b-top5` says "One card below the holdings", but `b-top5` draws no holdings, and nothing on `b-ledger` opens it. MP-62 and MP-153 require the top 5 below the holdings, and the owner keeps both options.
- **Correction:** compose `switcher()` under the ledger in `homeB`, and keep `b-top5` as that position.

**R2-h7 · P1 · Blocking: yes · `home.js:441`, `:537`; `shell.js:17`**
- **Evidence:** in No model, `a-segment` shows US tech, "This list stands". Its flip partner `b-explore` shows Gold & silver with the filter changed. The flip therefore changes segment, figures and message.
- **Correction:** draw `b-explore` No model on US tech, matching A, and move gold to `b-top5-metals`, which already draws it. Change the note and the rail with it.

## P2

**R2-h8 · P2 · Blocking: yes · `forecast.js:113`**
- **Evidence:** `actionCard` uses `who(st)`, not the page's subject.
  - Apple's `a-3m` and `a-12m` in Abstaining read "AstraZeneca is not ranked".
  - The same two pages in Disagreement read "No action is ranked on Reliance".
- **Correction:** use `subj(st, hz)`, and give Apple's 3-month abstention case its true action.

**R2-h9 · P2 · Blocking: yes · `forecast.js:356`, `:376`**
- **Evidence:** `b-ladder` in Stale is HSBC at £6,104.20. Its Scenarios block reads "£13,864 to £19,619", computed from Apple's fixed £14,820.50 start.
- **Correction:** derive the start from the page's holding, or hide the block when the subject is not Apple.

**R2-h10 · P2 · Blocking: yes · `forecast.js:24-25`, `:227`, `:316`, `:517`**
- **Evidence:** in No model the subject splits.
  - `a-instrument` is gold, but `who()` is Apple.
  - `a-views` and `a-proof` say back to AAPL with "No approved model at this horizon", while `a-forecasts` in the same state shows Apple "Evaluated" at +6.2%.
  - Gold's Evidence trail opens "Apple position · v12".
  - `b-forecast` mixes back to AAPL with "Gold and silver are not ranked".
  - `a-views` has rules reading Hold, while `ladderRail` says rules read nothing for gold.
- **Correction:** make gold the single No model subject on these screens, and rewrite their rules text for it.

**R2-h11 · P2 · Blocking: yes · `home.js:93-95`, `:120`, `:206`; `forecast.js:394-396`, `:412-413`**
- **Evidence:** Home and Forecast disagree inside one state.
  - Abstaining: Forecast says "AstraZeneca at 6 months and Apple at 12 months". Home's `a-12m` shows Apple +12.4% with its range, marks AZN abstained, and its banner says "at 6 months" over a 12M column.
  - Abstaining, desktop: `b-ledger` blanks AZN across all three horizons, while `b-forecasts` shows `+1.5%` and `+6.0%`.
  - Disagreement: Home splits JPM ("JPM is split"), while the Forecasts root shows JPM "Evaluated" under "Two conflicts" (Reliance and Apple).
  - Disagreement: `b-ledger` shows Apple's 3-month median unflagged.
- **Correction:** one table of who abstains or splits at which horizon, read by both journeys.

**R2-h12 · P2 · Blocking: yes · `home.js:501`, `:328`, `:332`, `:524`**
- **Evidence:**
  - `a-action` in No model: the sheet says "no label, rather than a guess", while NVIDIA's row behind it reads `Trim`.
  - `a-action` in Empty: "Nothing is suggested for NVIDIA today", with `Trim` behind it.
  - `b-open` in Empty on desktop: "No holdings yet" beside an NVIDIA action sheet.
- **Correction:** make the row match the sheet, and draw no sheet when there are no holdings.

**R2-h13 · P2 · Blocking: yes · `home.js:280-285`, `:424-426`, `:235-237`, `:473`, `:532-534`**
- **Evidence:** the metals pair differs across the flip, and the copy is false for a segment with no list.
  - Error, A: "Prices did not refresh. Last good run Mon 21:15".
  - Error, B: "Today's ranking run failed. The lists from 2 November stay current", with no time on the prices.
  - Empty: A keeps the prices. B removes them and says "ranked after each daily forecast run", though metals are unranked (SCI-D08).
  - A's Loading reads "Re-ranking", and Offline reads "Lists from 21:15".
  - Disagreement and Abstaining are `na` on A, but B draws conflict banners. Flipping drops to Ready with no "does not apply" note.
- **Correction:** give `b-top5-metals` A's metals copy and the same `na`.

**R2-h14 · P2 · Blocking: yes · `home.js:225`, `:229-230`, `:274`**
- **Evidence:** "$2,684.20 ... price only" has no price time in any state. The board tile's `foot` is empty for metals. MP-153 says "Every row shows its data freshness and provider status."
- **Correction:** show the quote time with "Source open (SCI-D08)" on the row, the tile and the sheet.

**R2-h15 · P2 · Blocking: yes · `forecast.js:354`, `:369`, `:504`**
- **Evidence:** the banner says "Open the row for both", and Option B's why says "One tap opens one dossier". `fc-lad` rows have no role and no chevron. `b-ladder` contains no "Proof" text and no route to `b-forecast` in the markup.
- **Correction:** make each long-horizon row a real control that opens the dossier, with its chevron.

**R2-h16 · P2 · Blocking: yes · `forecast.js:150`, `:156`**
- **Evidence:** `a-short` on iPhone has no "As of", no cutoff and no `R2-HGB`. Web has neither row-level as-of nor a model. MP-145 requires as-of time, data cutoff and model version for each horizon.
- **Correction:** add the `fmeta` line above the rows, with `asOf(state)`.

**R2-h17 · P2 · Blocking: yes · `home.js:84`, `:89`, `:270-271`, `:392`; `forecast.js:402`**
- **Evidence:** `<tr role="button">` is new in this diff (0 to 6 rows). The AX tree of `a-portfolio` on web has 10 tables, 71 columnheaders, 11 rows and 2 cells. Apple's row is one button: "Apple AAPL · USD £14,820.50 +1.9% +6.2% ...". Cell and header relationships are lost, which breaks WCAG 1.3.1.
- **Correction:** keep the table semantics and put a real button or link in the first cell.

**R2-h18 · P2 · Blocking: yes · `tests/journey_facts/h.mjs:18-27`, `:47`, `:91`, `:127-145`, `:198-201`**
- **Evidence:** run on mutated copies (20 of 20 still hold each time):
  - Both `segchange` listeners removed. R1-h13 and R1-h14 still pass, and R1-h3 is unprotected too, because none of them presses anything.
  - `.jspace.tall` set to 20px. R1-h21 still passes because it reads a class name. The real clearance holds today (1237 against 1277).
  - `INDIA = ['n50']`. R1-h1 still passes with midcap and India ETF ranked.

  Without a run:
  - R1-h4's `>= 4` counts 11 on a five-name list (each name twice, plus the rail), so two names with ranges would pass.
  - R1-h7 searches CSS text.
  - R1-h2 stops at `b-ladder` (R2-h2).
- **Correction:**
  - Add a browser check that presses each switch and asserts the text.
  - Assert the measured clearance for R1-h21.
  - Test all three India lists for R1-h1.
  - Count named rows for R1-h4.

**R2-h19 · P2 · Blocking: no · `forecast.js:424`; `home.js:452`**
- **Evidence:** after a keyboard press on the horizon switch, `document.activeElement` is `BODY`. The flip restores focus; these redraws do not (WCAG 2.4.3).
- **Correction:** return focus to the pressed control.

**R2-h20 · P2 · Blocking: no · `home.js:185`**
- **Evidence:** `a-brief` in Error says "code issued this", then "Claude writes the words".
- **Correction:** use the deterministic line in Error too, as No model already does.

**R2-h21 · P2 · Blocking: no · `shell.js:19`, `:191`**
- **Evidence:** flipping `a-3m` to the ladder and back lands on "6-month forecast". `a-12m` and `a-short` share the same reverse mapping. The flip handler also passes no `hz` or `mode`, so restoring the flip under R2-h5 would change the figures after a horizon press.
- **Correction:** remember the source screen on the frame, and pass `hz` and `mode` through.

## P3

**R2-h22 · P3 · Blocking: no · `shell.js:17`**
- **Evidence:** `a-action` and `b-open` have no flip and are not on the `MP-178-never` list, although neither is an approval or record in progress.
- **Correction:** pair them, or record the owner's exception.

**R2-h23 · P3 · Blocking: no · `home.js:390`**
- **Evidence:** B's desktop ledger reads "−10% to +21%" where A reads "−9.8% to +21.4%". The whole-percent ranges differ across the flip.
- **Correction:** use one decimal, or show the rounding in both.

**R2-h24 · P3 · Blocking: no · `home.js:214`, `:242`, `:288`**
- **Evidence:** "The list closes up at four" and "nothing fills the gap". MP-135 ranks all eligible listings, so one abstention in the Nifty 50 would promote the sixth name.
- **Correction:** promote the next name and note it, or put the point to the owner as an open question.

**R2-h25 · P3 · Blocking: no · `forecast.js:133`**
- **Evidence:** `a-12m` carries "Proof · 6-month task ... 79%" directly under a forecast whose own line says 77% of 26, Exploratory. The stronger record sits beside the weaker forecast.
- **Correction:** use the horizon's own record, keeping the Exploratory label.

**Covered:** all home and forecast flip pairs across the nine states on iPhone (web for the selected wide cases), the changed lists, horizon, proof and technical screens against the ten stories, and every `h.mjs` check by reading, with four mutated-copy runs. iPad and phone web were read only where a finding needed them. **Not checked:** assistive technology or dark mode by eye, though no journey file reads `ctx.scheme`. One shell command was refused as unparseable, so I reran it from files as the brief allows; it contained no removal. No browser is left running and the repo is unchanged.
