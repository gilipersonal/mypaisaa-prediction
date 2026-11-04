# MP-62 round 1, lane j: findings

Anchors are `file:line` under `/Users/arundutta/projects/mypaisaa-prediction/docs/design/journeys/src/`. `holdings.js`, `journal.js`, `home.js`, `privacy.js` and `approvals.js` sit in its `journeys/` folder. `shell.js` sits in the root.

Rendered evidence is in `/private/tmp/claude-501/-Users-arundutta-projects-mypaisaa-prediction/45ba900b-058a-4437-b30a-d55697f4dbd3/scratchpad/review/j/`: `dump.json` holds the text of every view, `png/` the captures.

## P1

**R1-j1 · P1 · blocking yes · holdings.js:277, 346, 259, 436**
- **Evidence:**
  - Option B has no Imports place. `history()` is used only by `a-imports` (:346), and no default B screen contains the word "Imports".
  - `b-add` reads back "Stocks ISA" with the Settings tab lit (capture `holdings-b-iphone-default-2-light.png`), and no Stocks ISA screen is drawn.
  - `b-one` Empty offers "Go to Imports" with no target (:277).
  - On iPhone the only entry is the ISA card's Add statement (:259), so General and India demat cannot take a statement.
  - This fails "holdings and imports kept separate", the README rule and MP-53 resume.
- **Correction:** add a `b-imports` screen with history, open drafts, open differences and records. Give it a real tab and back, point all B import screens and "Go to Imports" at it, and add an iPhone entry not tied to one account.

**R1-j2 · P1 · blocking yes · holdings.js:44, 57, 120, 318; home.js:53, 71, 95, 100**
- **Evidence:**
  - Same state, same moment: Home Stale shows £84,612.40, "5 of 7 priced", AstraZeneca and HSBC stale.
  - Holdings Stale shows £78,508.20, "6 of 7 priced", only HSBC stale.
  - Holdings gives AstraZeneca "Twelve Data" (:57); Home and the shared figures give UK listings to Yahoo.
  - Ready marks HSBC Stale and Held, yet includes it in the complete total, with Value 7 of 7 and Yahoo Fresh.
  - HSBA's own page says it is "Left out of the total".
  - MP-65 says a price older than the freshness policy is not used in a total.
- **Correction:** pick one rule and put it to the owner if the records do not settle it. Proposed: HSBC alone is stale, Home's Stale shows the £78,508.20 known subtotal, and Ready states how HSBC at 16:35 is treated.

**R1-j3 · P1 · blocking yes · journal.js:30-31, 108, 241, 255; holdings.js:232**
- **Evidence:**
  - `dump.json` shows ranked badges with no "Decision support" on `a-list`, `a-one`, `a-differ`, `b-one` and `b-differ`, on web and iPhone, the two surfaces I sampled.
  - The One holding Empty action (both options, web and iPhone) has the same gap.
  - MP-62 negative: "ranked actions are labelled decision support".
- **Correction:** add the chip or a list footnote on each. This is checkable, so add a gate: a screen with `.badge` and no "Decision support" text fails.

**R1-j4 · P1 · blocking yes · journal.js:44-47, 110; home.js:12, 243-244**
- **Evidence:**
  - "If you trimmed to the ranked weight: 13.5% → 10.0%" and "the ranked trim would have taken it to 10.0%" give a target size for an owned holding. No record defines a ranked weight and FIN-OD-07 is unapproved, so this reads as personalised sizing.
  - Home opens the same action as "If it were 10% smaller": 13.5% to 12.1%, range width 24.7 to 24.0 pts, against the journal's −9.4% → −8.7%.
  - Home shows Growth 88, the journal 87.
  - Home says "Policy v1", the journal "P-3, proposed".
- **Correction:** one shared helper for the action. Use Home's neutral counterfactual and Growth 88, name one policy, and drop "ranked weight" and that sentence from `whatHappened`.

**R1-j5 · P1 · blocking yes · holdings.js:184, 285, 143, 216, and the screen lists at 306-390 and 395-481**
- **Evidence:**
  - No screen draws manual entry, though "Type it in" appears on both options. MP-49's refused-for-a-missing-field, resumed and snapshot cases are absent.
  - No screen draws guided edit, though Edit and Add the date are buttons.
  - There is no exclude control; `grep -i exclud` finds nothing.
  - No screen draws a history rebuild proposal. "rebuild" appears only in two sentences, against MP-68 POLICY-012 and MP-149, which lists all of these.
- **Correction:** add those three flows to both options, in every state, and draw "Rebuild proposal ready" with its reconciliation and performance effects.

**R1-j6 · P1 · blocking yes · holdings.js:287-296, 440, 465**
- **Evidence:**
  - `b-check` draws only question 1 of 3. The listing choice (MP-50, Claude suggests, owner confirms) and the transfer question are chips with no screen.
  - "All 11 rows" is static text with no screen, so MP-53's "every row" fails.
  - A's "Keep it anyway" has no B equivalent.
  - The note says a duplicate "becomes one question", but the three are price, listing and transfer.
- **Correction:** draw questions 2 and 3, the duplicate decision and the All rows view. Correct the note.

## P2

**R1-j7 · P2 · blocking yes · holdings.js:24, 59, 67, 106, 120, 322**
- **Evidence:** in the Abstaining state the list shows AstraZeneca "+6.4%" and "Available", with the banner "Its value and return stand". Its own page shows "No rate found", "Nonconvergent". Return 5 of 7 counts it.
- **Correction:** make `L.AZN` nonconvergent and Return 4 of 7 (3 in Stale). Note that `holdTable` prints "Two rates" for any other text, so that branch must change too.

**R1-j8 · P2 · blocking yes · holdings.js:238, 270-271, 278**
- **Evidence:**
  - `provenance()` gives every holding but NIFTYBEES the General CSV and ISA statement. Reliance, held only in India demat, shows both; AstraZeneca and HSBC show the General CSV.
  - In B, Reliance's "Two rates fit these cash flows" sits above a single "Opening position".
  - HSBC's +8.1% a year has one event behind it.
  - Apple under "All" lists 60 of 88 units.
  - AGENTS.md requires a clear provenance trail.
- **Correction:** per-account sources, and per-holding events that can produce the stated measure.

**R1-j9 · P2 · blocking yes · journal.js:12-19, 103-106, 156, 176, 181**
- **Evidence:** frozen evidence of 28 April and 12 May cites R2-HGB v3, and the proof beside it says "Approved 1 Oct 2026". The No model card "No approved model covers NVIDIA now" sits beside the same "Approved" proof with 79% (`journal-a-ipad-noModel-0-light.png`).
- **Correction:** older entries cite an earlier version. Swap or relabel `proof(true)` in No model on every screen that uses it.

**R1-j10 · P2 · blocking yes · journal.js:67, 105, 173, 34**
- **Evidence:**
  - `a-record` says "nothing to record against", yet `a-one` shows a recorded entry against an abstention.
  - `a-list` says the model abstained on Apple, while `a-one` shows NVIDIA.
  - The Apple row keeps a ranked Hold badge from a model that abstained.
  - Its text cites "the wider range" where no range existed.
  - The rail still says "Next outcome: Apple, 12 Nov".
- **Correction:** one abstained entry across all three screens, no ranked badge, matching text, and a corrected wrap-up. Decide whether recording against an abstention is allowed.

**R1-j11 · P2 · blocking yes · holdings.js:173**
- **Evidence:** "reading resumes when it renews. It is never retried under a new budget." contradicts itself. MP-48's rule covers a failed call, not a queued one.
- **Correction:** delete the last sentence here; `scanFailed` already states the rule.

**R1-j12 · P2 · blocking no · holdings.js:344, 433 against 288, 363**
- **Evidence:** Imports says "2 fields" are blank. Preview says "1 field", one date; B's question card shows one blank date while its header says "question 1 of 3".
- **Correction:** one count.

**R1-j13 · P2 · blocking yes · holdings.js:96, 321; journal.js:68, 131, 219**
- **Evidence:**
  - "Both show" is false on the iPad and desktop table, which has only a "Differ" chip.
  - It is false on the journal's disagreement card, which has no figures at all.
  - The lane says "on its card" in the banner and "on the next page" on the card.
  - MP-144's state is conflicted, "shown".
- **Correction:** draw `dual()` in those places or change the copy.

**R1-j14 · P2 · blocking yes · holdings.js:219, 478, 382, 472**
- **Evidence:** under a red "Reversal refused" the primary "Review and approve" stays enabled (`holdings-b-web-disagreement-5-dark.png`). The same happens under "Refresh it before you approve".
- **Correction:** disable it, or relabel it for the joint correction and reversal, and offer Refresh when stale.

**R1-j15 · P2 · blocking no · holdings.js:156-158**
- **Evidence:** the statement shows TRANSFER IN 500.00, and "from these rows" (£4,142.83) leaves it out as pending. The difference must then include the £500, yet the card says £12.40 against £4,130.43.
- **Correction:** statement £4,630.43 against rows £4,642.83, or name the pending £500 as a separate line.

**R1-j16 · P2 · blocking yes · holdings.js:158, 204, 343, 175**
- **Evidence:**
  - MP-65's "Resolved by the owner, with reason" has no control. Keep it open takes no reason, and "Open the difference" has no target.
  - MP-55's Revoked state has no control or screen; the only hits for "revoke" concern devices.
- **Correction:** draw both.

**R1-j17 · P2 · blocking yes · shell.js:17-18; applies to holdings.js and journal.js**
- **Evidence:** every Error view shows "Twelve Data · error 21:14", including refused files, Claude validation failure, approval refused, commit failure and a scoring job. Draft-stale shows Yahoo delayed. `privacy.js:7` already says "A failed export is not a failed price".
- **Correction:** apply the same pass-through in screens that are not about prices.

**R1-j18 · P2 · blocking yes · holdings.js:319; journal.js:170, 80; privacy.js:176**
- **Evidence:** on web and phone web, Privacy says "This browser keeps nothing to read offline". Holdings and Journal show full figures "from 21:15", and "Your draft stays here". None is labelled proposed, though MP40-Q12 is open.
- **Correction:** draw a no-cache offline state on web and phone web, or align Privacy and label it proposed.

**R1-j19 · P2 · blocking yes · holdings.js:17, 325, 330, 413, 418, 347, 367, 388; shell.js:62**
- **Evidence:**
  - Phone web has no Hide amounts: `eyeBtn` returns nothing and its frame reads only `webActions` (buttons in `dump.json`).
  - Imports, Preview and Committed show money with no eye on any surface.
  - No masked table or import screen exists for MP-84.
  - "Permission denied" appears in no journey.
- **Correction:** add the eye on phone web, draw masked views, and add a denied state.

**R1-j20 · P2 · blocking yes · holdings.js:100, 233-235; shell.js:163**
- **Evidence:** "with their reasons on each holding" is false; One holding shows a badge with no reason. The inventory says the candidate word is drawn as "Watch only", but no screen shows a candidate action, so MP-144's "Holdings and candidates are visibly distinct" is not drawn.
- **Correction:** add reasons or a link to them, and draw a watch candidate.

**R1-j21 · P2 · blocking no · journal.js:145; holdings of the sidebar item in shell.js:75**
- **Evidence:** the journey claims MP-154, but no journey draws track records by horizon, holding or regime, the 30, 90 and 365-day summaries, or censoring. "Track record" lights only the Journal. MP-130's `suspended` and `delisted_unresolved` states are also undrawn.
- **Correction:** add the screen, or move MP-154 to the journey that will carry it.

**R1-j22 · P2 · blocking yes · journal.js:13-19, 54-56, 140-142, 176**
- **Evidence:**
  - "You added 6 units" has no source. A's sheet has only two answers and Why; B's picks have no units.
  - B records the same NVIDIA case as "I acted, Hold" where A says "I chose not to".
  - "Record a decision" has no destination when no action is open.
- **Correction:** add a what-you-did field to both options, make the case consistent, and draw the entry path.

**R1-j23 · P2 · blocking no · holdings.js:133, 366, 456**
- **Evidence:** MP-53 requires account and listing mappings and affected measures. Rows show neither mapping except HSBC. On phone A the account appears only in the approval sheet. B's phone view shows no before and after, and no affected measures at any point.
- **Correction:** add the mapping to each group, and the effect to B.

**R1-j24 · P2 · blocking no · holdings.js:366**
- **Evidence:** MP-48's hostile-text "flagged" case and "Superseded by a newer model or prompt version" are undrawn. "Claude only proposes" is omitted on phones.
- **Correction:** draw the flagged preview and the superseded revision, and show the line on phones.

**R1-j25 · P2 · blocking no · holdings.js:183; privacy.js:156, 179; approvals.js:179**
- **Evidence:**
  - "Next renewal is 12 Sep 2028" against Privacy's "kept to Aug 2028" and a Dec 2024 statement "due for renewal".
  - Export at revision 212 against 12.
  - The pending import is 11 rows at 212 against 12 rows at 214.
- **Correction:** one set of records.

**R1-j26 · P2 · blocking no · holdings.js:138, 197, 122, 285, 291; journal.js:37, 55; shell.js:53, 62, 68**
- **Evidence:**
  - The listing options are plain divs, with no radio role or keyboard path, and they are the only way to resolve that group.
  - Every approval dialog is named "Approve exactly this", even when titled "Approval refused" or "You are offline".
  - Chevron cards, "All 11 rows" and "See where you differed" are not controls.
  - Back is a span everywhere, and an unnamed icon on phone web.
  - The Why field is a static role=textbox.
- **Correction:** real controls, `aria-labelledby` on the sheet title as the journal does.

## P3

**R1-j27 · P3 · blocking no · holdings.js:185, 347**
- **Evidence:** Imports reads back "Data sources" on iPad and desktop while Settings is lit, and the inventory says Settings.
- **Correction:** one place name.

**R1-j28 · P3 · blocking no · holdings.js:122, 158, 200, 372, 449-450, 457; journal.js:254**
- **Evidence:**
  - "1 import is ready for you" while Imports Ready shows reading.
  - "or commit" on a screen already committed.
  - "Check 1 of 3" over "No questions".
  - "Your 1 answer is kept" over an unanswered question.
  - "last answer ... at revision 4", though answers make new revisions.
  - Empty shows "Differed 3".
  - "Select at least one" with every tick disabled.
- **Correction:** word each for its state.

**R1-j29 · P3 · blocking no · shell.js:71, 75; holdings.js:109, 191**
- **Evidence:** the sidebar shows "Portfolio 7" over "No holdings yet". "Return, partial" stays +11.8% when HSBC leaves. Revisions 5 and 6 share one hash. Not-applicable `a-differ` No model says nothing changes, yet its proof card would.
- **Correction:** state-aware values.

**R1-j30 · P3 · blocking no · holdings.js:106, 316; shell.js:74**
- **Evidence:** a fixed 96px cut truncates "SPDR S&P 5…" and "Nippon India …" with room to spare. The iPad Empty state repeats one message in two cards. The desktop title bar carries the holding and decision, for example "NVIDIA · 28 Apr", against MP-84's page-title concern.
- **Correction:** remove the cap, merge the cards, and use a neutral title.

**Covered:** both journeys and options in text on all four devices and nine states (144 views, no page errors), every figure recomputed, and about 45 screens viewed in light or dark. **Not checked:** pressing controls, an assistive-technology pass, a real phone, and most dark views beyond the sample. The ledger, cash, correction and reversal figures all add up, apart from R1-j15, and both journeys' options differ in structure.
