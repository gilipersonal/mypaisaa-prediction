# MP-62 / MP-178 round 4, lane h findings

**R4-h1 · P1 · blocking: yes · `docs/design/journeys/src/shell.js:230-236`**
- **Fault:** a horizon or detail pressed on a turned frame is lost when you flip back. This delta introduced it: `if (back) [oo, ss, extra] = was.from;` restores the values saved before the first flip. `back` compares only the screen id, so the code comment's "unless the owner has moved on inside the frame" is not true for a press.
- **Evidence, in Chrome:** Home iPhone, flip to Ledger, press 12M, flip back.

| Commit | Result after flipping back |
| --- | --- |
| `fc1303d` | `back: '12M'`, rows `· 12M` |
| `b58ae49` | `back: '6M'`, rows `· 6M` |

- **Same fault elsewhere:**
  - Forecast, turned, Technical, back: `Technical` at `fc1303d`, `Simple` now.
  - Ladder row 12M, flip, press 3M, flip back: lands on the 12-month dossier.
- **Breaks:** "Flipping shows the same figures", and the promise of the press gate's "keeps a pressed horizon and mode, both ways" loop. That loop only presses before the first flip.
- **Correction:** record the frame's `hz` and `mode` at landing. On `back`, carry forward any value changed since landing over `was.from[2]`. Add press cases for turned, press, back: Home horizon, Forecast horizon, Forecast Detail, on iPhone and web.

**R4-h2 · P2 · blocking: yes · `docs/design/journeys/src/journeys/home.js:497`**
- **Fault:** `b-ledger` and `b-12m` in Empty, on iPhone and PWA, read "7 holdings" directly above "No holdings yet". The label is a literal with no Empty test; the sidebar's "7" is already removed in Empty.
- **Evidence:** rendered iphone and pwa have `7 holdings: true` and `No holdings yet: true`; ipad and web are false for the first. Screenshot: `/private/tmp/claude-501/-Users-arundutta-projects-mypaisaa-prediction/45ba900b-058a-4437-b30a-d55697f4dbd3/scratchpad/review4/lane-h/shots/ledger-empty-iphone.png`.
- **Also:** every Home frame in Empty keeps "Yahoo · HSBC late", which names a holding that frame says does not exist.
- **Correction:** label "Holdings" in Empty; give `freshRow` an empty branch without the HSBC words; add `lacks(/7 holdings|HSBC late/)` to R3-h3 for these frames.

**R4-h3 · P2 · blocking: yes · `docs/design/journeys/src/journeys/forecast.js:43`, `:251`**
- **Fault:** the new `clear` reads a calm horizon as Ready, so Reliance contradicts itself in one state.
- **Evidence, in Chrome, Disagreement:** `a-instrument` (Reliance), press 3M, flip, Views.

| Reliance tab | Compare row | Rules text |
| --- | --- | --- |
| 3 months | `Rules Hold / Models +3.7% / Together Agree` | "Price is above its 200-day average", and Claude says "the two agree on direction" |
| 6 months | `Rules Pause / Points up / Disagree` | "Price is below its 200-day average. Drawdown of 11%" |

- **Why it matters:** a 200-day average does not depend on the horizon. The old `clear` kept Reliance in Disagreement on every tab.
- **Correction:** keep Reliance's rules body, reading and drawdown on every horizon in this state, and change `compare` and `vClaude` to match. If rules can truly differ by horizon, make it a labelled open question instead. Add a facts case: `b-views` Disagreement at hz 0 lacks `above its 200-day`.

**R4-h4 · P2 · blocking: yes · `docs/design/journeys/src/shell.js:17`**
- **Fault:** the R3-s9 fault remains on three screens. `b-forecast` is named Dossier, but `a-proof`, `a-views` and `a-evidence` still say Ladder and land on dossier tabs, which draw no ladder.
- **Evidence:** rendered `data-flip="forecast|b|b-proof" aria-label="Flip to Ladder"`, and the same for `b-views` and `b-evidence`. The caption reads "Turned to B · Ladder".
- **Correction:** add those three screens to `FLIP_AT` as Dossier, and widen R3-s9's pinned pattern to match.

**R4-h5 · P2 · blocking: yes · `docs/design/journeys/src/journeys/forecast.js:474`, `:476`; `docs/design/journeys/src/shell.js:209`**
- **Fault:** the new "At N months" caption and screen name fall back to the wrong horizon. They update only when that press carries `hz`, and `dress` always writes `sc.title`.
- **Evidence, in Chrome:**
  - `a-3m`, press 6M, press Technical: caption and `aria-label` read `At 3 months` over `6-month forecast · AAPL`.
  - `a-3m`, press 6M, flip, flip back: the same.
- **Impact:** a screen reader gets a screen name that contradicts the content, against WCAG 2.4.6 and 4.1.2.
- **Correction:** derive the title from `scr.dataset.hz` in one helper used by both `redraw` and `dress`, and add a press case. Home's `a-12m` and `b-12m` have the older version of this: after 3M the caption stays "at 12 months".

**R4-h6 · P2 · blocking: yes · `docs/design/journeys/src/journeys/forecast.js:384`**
- **Fault:** `recordCard` claims a current forecast on an abstained horizon. The delta widened this from AZN at 6 months to Apple at 12.
- **Evidence:** `b-evidence` web, Abstaining, `t: AAPL`, hz 2. The chain says "Abstained: too little comparable history", "None: no range", "Nothing to score". The rail beside it says "Forecast v3 Current · Task AAPL · 12-month return · Replaces v2 · kept, annotated".
- **Also:** the link is the same `fc-8f21c3` for every name and horizon, under "Opens this same record".
- **Correction:** draw an abstention record in Abstaining, with no version or "Current", and give each record its own link id.

**R4-h7 · P2 · blocking: yes · `docs/design/journeys/src/journeys/home.js:515, 521, 524, 528, 545, 561, 565`**
- **Fault:** the two meanings of Empty reach only `a-portfolio`, `b-ledger`, `a-board` and `b-top5`.
- **Evidence:**
  - In Empty, `a-portfolio` tiles show "1 MSFT 74", and the frame a tile opens, `a-segment`, says "Until the first run there is no list and no score".
  - `a-12m`, `b-12m`, `a-segment`, `a-seg-*`, `b-top5-*`, `b-explore` and `b-brief` carry no sentence saying which meaning applies.
  - There is a third, unstated meaning: `a-action` in Empty draws "Portfolio value £84,612 … 7 of 7 priced" with seven rows, while `b-open` says "No holdings yet".
- **Correction:** add the sentence to each of those notes (lesson 1). Add to `a-action`: "Empty here means a holding with no action band."

**R4-h8 · P2 · blocking: yes · `tests/journey_facts/h.mjs:73` (lesson 10)**
- **Fault:** `flaggedOnly` replaced the old "no other name" regex and lost its text-wide refusals. It reads rows only.
- **Evidence:** on a scratch copy I added "JPM is split at 3 months too." to the board banner.
  - R2-h7 and R3-h5 exit 0.
  - The old regex hits 24 views, for example `a-portfolio iphone disagreement: JPM is split`, and 0 on the real page.
  - Banner mutations on search, and on the brief naming a ticker the old list lacked, also pass.
- **Correction:** keep a text-level refusal alongside the row check, across all Home and Forecast screens, over every listed ticker outside `OUTS`.

**R4-h9 · P2 · blocking: yes · `tests/journey_facts/h.mjs:544`; `docs/design/journeys/src/journeys/forecast.js:11-15` (lessons 2, 3)**
- **Fault:** most of the new per-horizon figures have no check.
- **Evidence:** I mutated eight values one at a time, and R2-h25 plus R3-h6 exit 0 on each: 12-month hit 58%, calibration 0.96, error 8.9 pts, benchmark +3.1 pts, turnover 0.6, embargo "6 months + 1 session", baseline error 10.4 pts, and 3-month hit and error at the 6-month values. A grep of `tests/` and `scripts/` finds none of the new figures.
- **Also not held:** four layout changes pass `--all` when reverted: the `b-brief` ticker, scenario figures first, `keyB` order, and `FLIP_AT` Dossier. `FLIP_AT` is held only by the R3-s9 text grep.
- **Correction:** assert every `REC` value at 3 and 12 months on a pressed render, and lack the 6-month values.

The figures themselves check out. Embargo matches the spec's "exact task horizon plus one eligible valuation session". Dots and percentages agree: 84/104, 20/26. First-due dates are approval date plus horizon.

**R4-h10 · P2 · blocking: no · `review/MP-62/fixed.json`, R3-h2 (lesson 2)**
- **Fault:** the check is a source grep for `let [, oo, ss] = b.dataset.flip.split`.
- **Evidence:** I broke the handler and kept that text. The pattern still matches, while the press gate fails 36 of 140 cases. CI runs facts and the ledger but not the press script, so a regression in this handler can merge green, as R4-h1 shows.
- **Correction:** give the ledger a behavioural check through a short press subset within the 60-second limit.

**R4-h11 · P2 · blocking: no · `docs/design/journeys/src/journeys/home.js:100`, `:347`**
- **Fault:** in No model, NVIDIA alone reads "No label", for a reason that covers every label.
- **Evidence:** the sheet says "Action thresholds are not approved yet (FIN-OD-07)", yet `a-brief` shows Add and Pause beside it, and holdings keep Hold.
- **Correction:** put the owner a choice: unlabel every non-India row, or reword the sheet so the reason is not global.

**R4-h12 · P3 · blocking: no · `docs/design/journeys/src/shell.js:30`**
In Disagreement and Abstaining, `b-technical` flips to `a-3m` or `a-12m` in Simple, so the percentiles go. Its Technical mode is a default, not in `dataset.mode`. Ready keeps it. Carry the mode across.

**R4-h13 · P3 · blocking: no · `docs/design/journeys/src/journeys/forecast.js:233`**
The 12-month "Hit rate never stands alone" card carries no Exploratory label, though it shows the highest hit rate (62%) and "+5.2 pts Ahead of…" on 11 blocks. The chip is only on the card above (MP-157). Add it to the card.

**R4-h14 · P3 · blocking: no · `docs/design/journeys/src/journeys/forecast.js:238`**
Proof's Empty card stayed 12-month after the per-horizon pass: `b-proof` titled 6 months reads "No 12-month outcome… first due 1 Oct 2027". Read `HN[hz]` and `REC[hz].due`.

**R4-h15 · P3 · blocking: no · `docs/design/journeys/src/journeys/forecast.js:240`, `:220`**
Already there, but both lines were edited. In Stale, the banner says "HSBC's matured forecast waits for its price", while the same page says "Live, matured 0 · first due…". Reword the banner.

**R4-h16 · P3 · blocking: no · `docs/design/journeys/src/journeys/forecast.js:403`**
The `b-scenarios` note now says "Opened from the ladder's dotted block", but that block is not a control. In Stale it reads "Scenarios · HSBA £5,710 to £8,080", while the frame it names shows Apple's £13,864 and back "AAPL". Make it a control and carry the name.

**R4-h17 · P3 · blocking: no · `docs/design/journeys/src/journeys/home.js:256`, `:290`**
A split 3 months has no median, yet "its score stands" is stated as settled. Abstention gets `Proposed · MP-135` for the same open question: growth comes from the 3, 6 and 12-month forecasts. Label it and add it to the question (lesson 20).

**R4-h18 · P3 · blocking: no · `docs/design/journeys/src/journeys/forecast.js`, `a-views`, `:220`, `keyB`**
- `a-views` on a phone names no horizon when Apple abstained at 12 months.
- "Walk-forward folds 22" stays fixed while blocks run 44, 22 and 11.
- `keyB`'s comment says "the ladder's order", but the rows read 12 then 6, and short-term is unsorted.

**What held:**
- A sweep of 84 row, tab and state combinations on iPhone kept name, horizon and ranges across a flip.
- `pick` and `clear` hold against reversion: both mutations were caught, the OUT table check bit, and the late-price chip check bit.
- Three press mutations were refused with 92, 36 and 12 failures.
- FIN-OD-06 is a correct citation.
- No trade, advice or POLICY-006 fault in this delta.

**Covered:** the lane diff since `fc1303d` and its joins, rendered in node and Chrome, with mutations on scratch copies only; no Chrome left running.

**Not checked:** assistive technology, a real phone, dark-mode screenshots of pressed frames.

**One slip:** I ran `build.py --help`, which has no help flag and rewrote `docs/design/journeys/index.html`. The output was byte-identical (blob `1bd4e82` equals `HEAD`, no change in `git status`).
