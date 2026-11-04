# MP-62 round 1, lane h: findings

38 findings: 8 P1, 20 P2, 10 P3. 18 are blocking.

## P1

**R1-h1 · P1 · blocking: yes · `home.js:171`, also `:73`, `:183`, `:289`**
- **Evidence:** In No model, the holdings banner says "No approved model covers India yet" and the brief says "India is rules only". The board on the same screen still shows "Nifty 50 | ICICIBANK 72 | HDFCBANK 69 | TCS 66 | INFY 64 | SBIN 61", under a banner reading "India is not ranked". Search also keeps ICICIBANK 72 and HDFCBANK 69. Growth and protection come from the forecasts, so a score with no model breaks POLICY-006 and the issue's negative acceptance. Reliance, itself a Nifty 50 name, is flagged no-model.
- **Correction:** Add `n50` to the no-model branch in `bTile`, withhold both Search scores, and widen `boardNote.noModel` to all of India.

**R1-h2 · P1 · blocking: yes · `forecast.js:286`, `:280`, `:295`**
- **Evidence:** The Option B ladder in Abstaining reads "12 months abstained" and the row says "so no range". The fan still draws to 12 months, labelled "+12.4%", "+33.9%", "−10.2%", under an "Evaluated" chip, and the chart's `aria-label` repeats them. In Disagreement, the 3-month median is removed from the row but stays marked on the fan.
- **Correction:** Make `ladderFan` take the state: stop at 6 months with "12 months abstained" at the end, and drop those figures from the labels. Mark the 3-month point as split in Disagreement.

**R1-h3 · P1 · blocking: yes · `forecast.js:352`, `:303`**
- **Evidence:** Option B has no proof on iPad or desktop. Across all five B screens at `web`, these are all absent: `ds-2026-10-30`, "Hit rate", "Benchmark", "Model sheet", "Analog sheet", "22 since 2015". The Proof tab exists but pressing it changes nothing. MP-157 needs dataset, folds, baseline, sheets and hit rate with its companions.
- **Correction:** Add a `b-proof` screen with `dossier(1)`, `proofMain` and `proofRail`, or render them on wide inside `b-forecast`.

**R1-h4 · P1 · blocking: yes · `home.js:158-175`, `:188`, `:332`**
- **Evidence:** The Top 5 has no range, uncertainty or freshness on home. Counted on `a-board` and `b-top5`, phone and desktop: 0 percentages, 0 ranges, and no "decision support" text. The owner's record says "They come with their ranges and uncertainty, as decision support, not advice". MP-153 says "each with its range, uncertainty and freshness". Only US tech's drill-down shows ranges (`FC` covers three names), and Option A's stated cost mentions reasons and parts, not ranges. Ready shows no ranking date or version.
- **Correction:** Extend `FC` to every listed name and draw the median and 80% range per row in `t5Card` and the tiles. If the tile can't hold them, put that to the owner as a stated cost, and draw every segment's drill-down. Add "Ranked 3 Nov · policy v1 · decision support" to `legendT` and `t5foot`.

**R1-h5 · P1 · blocking: yes · `shell.js:19`, `home.js:82`, `:322`, `forecast.js:65`**
- **Evidence:** In Loading, the provider chips collapse to "Refreshing · last good 21:15", so Twelve Data and Yahoo disappear from the header and sidebar. The value card says "showing 21:15", but the rows are skeletons, so every range and HSBC's stale flag are hidden. The forecast card says "Last good forecast 21:15" and shows no figure. The issue and MP-153 both bar hiding risk or provider status behind loading.
- **Correction:** Keep both provider chips next to "Refreshing". Draw the last good rows and forecast, dimmed, with a banner.

**R1-h6 · P1 · blocking: yes · `forecast.js:74`, `home.js:40`, `shell.js:51`**
- **Evidence:** The Error state shows "As of 20:45 London | Data cutoff 21:00", an as-of before its own cutoff, from a single-string `.replace`. A daily forecast can't exist at 20:45, before the 21:00 US close, and the page says "Next run tomorrow 21:15". On home, the banner says rows are "the last loaded version, 20:45", while the Data column prints "21:15" and the sidebar "As of 21:15 · cutoff 21:00". MP-153: "it never mixes two versions".
- **Correction:** Show Monday's issue in full: as-of, cutoff and horizon date. Make `dataCell` and `dataRow` aware of state.

**R1-h7 · P1 · blocking: yes · `docs/design/prism/index.html:776` via `home.css:35`; gate `scripts/design_journeys_check.mjs:60`**
- **Evidence:** `.win b { color: var(--ink) }` also matches the `.dev.win` desktop frame. So desktop light tile scores are rgb(20,23,31) on tile colours, not white, at 15 px weight 800. Computed ratios are 2.90 to 3.62:1 on all seven scored tiles (for example, India midcap 2.90, UK ETFs 3.62). The gate passed because `if (gradient || !bg) continue` skips all tile text.
- **Pixel sample (brightest pixel under each score):** iPhone light US ETFs 4.13, UK ETFs 4.00. Desktop dark 3.71 to 4.52. Many tiles fall below 3:1 at 20% brightness.
- **Correction:** Add `color: inherit` to `.home-tile li b`. Make the gate judge gradient grounds rather than skip them, and add a ledger check. Put the sheen residual to the owner, as it is Prism's.

**R1-h8 · P1 · blocking: yes · `home.js:150`**
- **Evidence:** The Loading brief shows "Hold Apple: median positive, range still includes a loss." and "Add Reliance: 7.4% median at 6 months." The screen has no "decision support" text, and the Add is a bare median with no range. That breaks the issue's "ranked actions are labelled decision support".
- **Correction:** Title it "Yesterday, 07:30 · decision support". Give the Add its range, −12.0% to +24.9%.

## P2

**R1-h9 · P2 · blocking: yes · `home.js:141`**
- **Evidence:** The brief renders in the order Actions, Changes, Risks, Upcoming (text offsets 281, 548, 645, 790 on iPhone). MP-148 and the screen's own note say actions, then risks, changes, events. Wide reading order is the same.
- **Correction:** Put Risks directly after Actions in `left`, and move Changes to `right` before Upcoming.

**R1-h10 · P2 · blocking: yes · `home.js:113-114`, `:119-124`**
- **Evidence:** The pill says "2 actions · 1 conflict shown", while the list directly below shows Trim, Add, Pause plus Split. Abstention says "2 actions · 1 abstention" over the same three actions.
- **Correction:** Change both to "3 actions".

**R1-h11 · P2 · blocking: no · `home.js:133-153`, `research.js:71`, `:65-68`, `:263`**
- **Evidence:** MP-148 is drawn twice, differently. Home says "3 actions · 2 risks · 2 changes" (no Reliance). Research says "Four ranked actions and one risk held overnight", with different events. "No model" also means India rules in one and Claude off in the other. They are dated a day apart, so the counts aren't strictly contradictory, but the owner would be picking two designs of one screen.
- **Correction:** Name one owner journey for the brief, and have the other link to it with the same content.

**R1-h12 · P2 · blocking: yes · `forecast.js:317`, `home.js:387`, `journal.js:156`, `approvals.js:319`**
- **Evidence:** The Forecasts tab has no root. All eleven forecast frames carry `back`, while journal and approvals go `back: 'Forecasts'` to a screen no journey draws. Option A's Segments tab also has no root (`a-segment` is tab 2 with `back: 'Portfolio'`). In Option B, tab "Segments" is titled "Explore". None of this is in the inventory's open list.
- **Correction:** Draw a Forecasts root in both options, with every holding and watch-only listing and its horizon state. Put `a-board` under tab 2 in Option A. Align the labels.

**R1-h13 · P2 · blocking: yes · `forecast.js:58-63`, `:316-321`, `home.js:376`**
- **Evidence:** Only the 6-month instrument is drawn. After settling, pressing 12M set `aria-pressed=true` while the text was unchanged, still "6-month forecast". Home's 12M does the same, with rows still reading "· 6M". The 12-month view, where Exploratory matters most, is never drawn on an instrument, though the issue asks for per-horizon forecasts.
- **Correction:** Draw 3M and 12M (`LONG` holds the figures), or make the control change the content.

**R1-h14 · P2 · blocking: yes · `forecast.js` (absent)**
- **Evidence:** A search of the journeys and Prism finds no simple or technical mode, no `no_clear_view` and no `cost_paused`. MP-145 requires "both the simple and the technical mode keep material uncertainty", and lists both states.
- **Correction:** Draw the mode control and the two states in `shortRow` and `ladRow`, and add them to the inventory. If a mode isn't wanted, ask the owner, and don't drop it silently.

**R1-h15 · P2 · blocking: yes · `forecast.js:64`, `:113`, `:166`, `:281`, `:286`, `home.js:313-316`**
- **Evidence:** "held 79% … over 52 scored", "Held 77% of 26 scored · Exploratory", "held 80% of 412" and "Held 79% of 52 scored." appear on `a-instrument`, `b-ladder`, `a-short` and `a-views`. None of the four says walk-forward. Only the Proof screen says "not live ones", and the model was approved 1 Oct 2026 with "Live, matured 0". The chart's "Scored: inside" reads as a live record. The Option B desktop "12 months" column and the fan's "Evaluated" chip carry no Exploratory label, against MP-157's rule for under 20 blocks.
- **Correction:** Add "in walk-forward testing" to each line, Exploratory to the 12-month header and chip, and label the chart's past forecast as a walk-forward case.

**R1-h16 · P2 · blocking: yes · `home.js:40`, `:71`, `:117-118`**
- **Evidence:** The Stale banner says "Yahoo stopped at 16:35", yet Reliance and the Nifty ETF still read "21:15 | Yahoo". In Ready, AZN and Reliance read "21:15" beside "UK closed Mon 16:35" and "India closed Mon 10:00". HSBC's reason, "Last price 16:35, so its forecast is held", is simply the closing time, so MP-153's "how fresh its price is" isn't true here.
- **Correction:** Print each market's actual price time, and date HSBC's staleness as "Mon 16:35". That changes the shared figure in `docs/design/reviews/MP-62/brief.md`.

**R1-h17 · P2 · blocking: yes · `home.js:35-38`, `:49`**
- **Evidence:** MP-153 says "Every row shows its data freshness and provider status". Only the desktop table does. iPhone Option A rows show neither unless stale. The phone-web ledger and Option B iPhone show "AAPL | +1.9% | £14,820 | +6.2% | Hold", with no time, provider or local currency.
- **Correction:** Add the price time and provider to the second line, and the currency to `pTr`.

**R1-h18 · P2 · blocking: yes · `forecast.js:237`, `:240`, `:274`**
- **Evidence:** "close 3 Nov · received 21:02" and "corrected for a late FX quote at 21:11" sit on a record with "Data cutoff 21:00". Both arrived after the cutoff. The checklist says "A retry after cutoff must not backdate known-at time".
- **Correction:** Give v3 a cutoff at or after 21:11, or use inputs known before 21:00. Note that a 21:00 cutoff can't include the 21:00 US close, so `brief.md` may need changing.

**R1-h19 · P2 · blocking: no · `forecast.js:67`, `:90`, `:150`, `:249`, `:127`**
- **Evidence:** One Disagreement state on Apple names two different conflicts: "The approved model and the baseline differ" on the instrument, proof and chain, and "Rules and models disagree" on Views. Home says rules against model, and MP-144's and MP-155's case is rules against models. The instrument never shows the rules side. Short-term says "Models disagree at 10 sessions", but the row is unmarked and shows one range.
- **Correction:** Pick rules against models for the action conflict, and show each side. Treat baseline disagreement as a separately labelled case.

**R1-h20 · P2 · blocking: yes · `forecast.js:126`, `:109-112`**
- **Evidence:** "so all four rows show the rules", but 5 sessions still reads "In practice · Shadow trial, week 5 of 8". The banner says "paused", the rows say "No qualified model", and MP-145 lists `model_paused` as its own state.
- **Correction:** Fix the count, and give the paused rows their own wording.

**R1-h21 · P2 · blocking: yes · `docs/design/journeys/src/shell.css:26`**
- **Evidence:** At maximum scroll on iPhone, the last card still runs under the floating bar: 1261 against 1241 on forecast, 1261 against 1233 on home, and phone web on forecast is also short. The capture shows "Forecast up to £59.73" and "Source to outcome" never clear the bar, on a screen meant to keep cost visible.
- **Correction:** Raise `.jspace` to at least 168 px when an accessory is present.

**R1-h22 · P2 · blocking: no · `home.js:233`, `:271-274`**
- **Evidence:** No candidate action is drawn with its reasons. Microsoft shows "Watch · decision support" with no reasons, impact or versions. ICICI shows impact but no action. Only NVIDIA has a sheet, while MP-144 says "each action shows its reasons, uncertainty and horizon and the counterfactual change".
- **Correction:** Draw a candidate action sheet.

**R1-h23 · P2 · blocking: no · `forecast.js:77`, `:94-95`, `:300`**
- **Evidence:** Gold's chart says "Yahoo · as of 21:15 London", but the data specification names Twelve Data (coverage unproven) and SCI-D08 leaves the source open. Option A offers Short-term, Three views and Scenarios on gold, while Option B says "Neither runs for gold", a statement I found in no record.
- **Correction:** Show "Source open (SCI-D08)". Remove those links on gold. Mark the claim as proposed.

**R1-h24 · P2 · blocking: no · `forecast.js:135`, `:272`**
- **Evidence:** "its new score sits beside the old one" is claimed, but no such pair is drawn. The superseded link appears only as a sentence. MP-157 `corrected` and MP-151 `superseded` are listed states.
- **Correction:** Draw both.

**R1-h25 · P2 · blocking: no · `home.js:161`, `:376`, `shell.js:71`, `:75`**
- **Evidence:** In Empty, "No holdings yet" sits above ticks reading "you hold it" on NVDA, AAPL, SPY and NIFTYBEES, under a legend and a sidebar "Portfolio 7".
- **Correction:** Pass an empty held set and a zero count for this state.

**R1-h26 · P2 · blocking: no · `home.js:202-212`, `:227`, `:332`**
- **Evidence:** In Abstaining, "META lost its growth part" but META appears nowhere on the list, only unrelated AVGO, against "shows as not ranked with the parts it has". Option B says "Withheld: no other eligible listing" where TCS dropped out. Its disagreement rows have no mark on INFY or AMZN.
- **Correction:** Draw META as a Not ranked row with its parts. Correct the reason. Add the split mark.

**R1-h27 · P2 · blocking: no · `forecast.js:56`, `:75`, `:88`, `:251`**
- **Evidence:** In Stale, Apple shows a 16:35 clock while "Twelve Data · Fresh" stays up, the chain swaps its source to Yahoo, and home keeps Apple at 21:15. The banner says "until prices return", while the card says "until the next ranking run", which is MP-144's wording.
- **Correction:** Use a Yahoo listing for this state, or describe a non-price input. Use one recovery sentence.

**R1-h28 · P2 · blocking: no · `home.js:369`, `:403`**
- **Evidence:** These are claims the owner chooses on, and they fail on iPhone. Option A's "fill the first screen" shows 2 of 7 rows above the pill (bottoms 599, 695; pill at 696). Option B's "all seven and the brief fit above the fold": the seventh row ends at 694, but the brief starts at 754 and the dock at 760.
- **Correction:** Reword both.

## P3

**R1-h29 · P3 · blocking: no · `forecast.css:12`, `:67`, `home.js:269`**
- **Evidence:** Short-term measures 106×36, assumption inputs 92×36, filter chips 40 to 43 wide, and top-bar icons 36 wide, against the 44-point rule. None fails WCAG's 24 px minimum.
- **Correction:** Extend the hit areas.

**R1-h30 · P3 · blocking: no · `home.js:174`, `:29`, `forecast.js:245`**
- **Evidence:** Tiles, table rows, links and chain steps are plain elements (8 tiles, 7 rows and 7 steps not focusable), so no keyboard path can be shown. The selected step is marked by background alone, with no `aria-current`.
- **Correction:** Use real controls, and mark the current step.

**R1-h31 · P3 · blocking: no · `forecast.js:290`**
- **Evidence:** Option B's Empty says "Price history shows now" and no chart is drawn.
- **Correction:** Add `histChart`.

**R1-h32 · P3 · blocking: no · `home.js:168`**
- **Evidence:** The gold tile says "Prices still show" with no price on it.
- **Correction:** Add the prices, or drop the phrase.

**R1-h33 · P3 · blocking: no · `forecast.js:145`**
- **Evidence:** "0 of 26 matured live" uses the walk-forward count as if it were a live denominator.
- **Correction:** Say "0 matured live".

**R1-h34 · P3 · blocking: no · `shell.js:166`, `home.js:249`**
- **Evidence:** The inventory says "No model or Empty shows the unclassified case", but Empty says "no action band applies", which is a different case.
- **Correction:** Align the inventory with the screen.

**R1-h35 · P3 · blocking: no · `forecast.js:243`**
- **Evidence:** "Sealed 21:15" implies an integrity guarantee, while FIN-OD-08 leaves integrity anchors open.
- **Correction:** Say "Recorded", or mark it proposed.

**R1-h36 · P3 · blocking: no · `home.js:269`**
- **Evidence:** Search filters have no segment or holding/watch-only filter, which MP-141 lists.
- **Correction:** Add them.

**R1-h37 · P3 · blocking: no · `home.js:243`, `:272-274`**
- **Evidence:** "If it were 10% smaller" holds the total constant (12.1%, against 12.3% if the money leaves) without saying so, and the total holds no cash. "Banks share 7.2%" counts HSBC only, beside an ETF overlap on the same card.
- **Correction:** State each basis.

**R1-h38 · P3 · blocking: no · `forecast.js:231`, `home.js:232`**
- **Evidence:** "Dividends" is a decimal text input holding "Reinvest". "This state is drawn on gold and silver" is designer language inside a product screen.
- **Correction:** Use a choice control, and product copy.

---

**Covered:** the four files with `shell.js` as a join, ten stories, all eight segments, scores recomputed by hand, 144 home and forecast combinations rendered in Chrome with no page errors, about 40 screens viewed in light and dark across all four devices, and the horizon controls pressed. Scores, portfolio shares, scenario arithmetic and the cost figure all checked out. LSE as GBP matches DATA-04. The two options are structurally different in both journeys, and width use on iPad and desktop is sound.

**Not checked:** WebKit, a real device or assistive technology, and every state drawn at each screen beyond the text dump. I discarded the iPhone India ETFs pixel sample because that tile sits under the dock. One capture command was refused as unparseable (it contained no removal), so I ran it from a file, as the brief allows. Nothing was changed outside my scratch folder. Every correction needs `build.py`, a republish and `design_sync.py record`.
