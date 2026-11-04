Anchors are under `/Users/arundutta/projects/mypaisaa-prediction/docs/design/journeys/src/`; `holdings.js` and `journal.js` sit in its `journeys/` folder. `flip.mjs` and `j.mjs` are in `/Users/arundutta/projects/mypaisaa-prediction/tests/journey_facts/`. Views are named `screen state surface`.

## P1

**R2-j1 · P1 · blocking yes · shell.js:18, 26-33; holdings.js:370-374, 393-397, 438-442, 416-420, 578, 603-618, 698-713, 463-472; flip.mjs:36-37**
- **Evidence:**
  - The README and shell.js:12-13 both say no flip on an approval, a record in progress, or a step-up. `flipHTML` has no state gate, and every holdings pair flips in all nine states (rendered matrix: `a-done 111111111`, `a-manual 111111111`, `a-edit 111111111`).
  - The flip is drawn on these views:
    - `a-done loading` ("Committing").
    - `a-done offline` ("Connection lost during the commit", "Outcome unknown").
    - `a-done error` ("Still approved, until 21:33" with Revoke approval).
    - `a-manual` and `a-edit` (a record being typed or edited).
    - `a-preview` and `b-check` (a draft being worked).
    - `a-difference` (a reason being written).
    - `a-rebuild` (a proposal awaiting approval).
    - `a-private error` ("Permission denied… Sign in again").
  - Ran in Chrome: typed 37 into Units on `a-manual`, pressed the flip, and the field came back as 2. Flipping `a-done loading` removed the Staged, Sealed, Publishing, Done steps.
  - `MP-178-never` lists 14 views, all in Ready, and none of these.
- **Correction:**
  - Remove the pairs `a-manual`, `a-edit`, `a-preview`, `a-difference` and `a-rebuild` from `FLIPS.holdings`.
  - Add a per-state gate so `a-done`/`b-done` flip only when committed, and the private pair does not flip on Error.
  - Extend `MP-178-never` to every state.
  - If the owner wants any of these to flip, put it to him; the rule is his proposal to accept (MP-178).

**R2-j2 · P1 · blocking yes · journal.js:22, 31, 44, 156-157, 226, 250, 292-293, 236, 303, 305; flip.mjs:9-15**
- **Evidence:** the two sides of each Journal flip are different journals.
  - `a-list` holds 7 entries, led by "NVIDIA Today · You chose not to". `b-board` holds 6; that entry is missing and NVIDIA sits in To decide as "Ranked today".
  - Wrap-up: A "1 entry recorded", B "No entries this week".
  - Counts: A "You differed 4", "4 times in 7 decisions", "Only 3 of your 7". B "You differed 3", "All 6", "Scored 3 of 6", "Only 3 of your 6".
  - `a-pick` also lists NVIDIA as open while `a-list` shows it recorded today.
  - `SAME` in flip.mjs has no Journal pair, so no check saw this. MP-178: "Flipping shows the same figures".
- **Correction:**
  - Pick one truth. Smallest: put `fresh` in B's Waiting lane (4, "3 for a horizon, 1 unresolved"), and take NVIDIA out of To decide and `a-pick`.
  - Then B reads All 7, Differed 4, "3 of 7", and `b-differ` keys include `fresh`. The wrap-up reads the same on both sides.
  - Add Journal pairs to `SAME`, comparing entry counts and tallies in every state.

**R2-j3 · P1 · blocking yes · holdings.js:228, 236-237, 355-357, 446, 191, 246, 170**
- **Evidence:**
  - Rendered search for "places no trade", "records what already happened" or "at your broker" across all import screens, Ready and six other states on web. Hits are only `a-approve` and `b-approve` in Ready, Disagreement and Abstaining. Every other screen has none.
  - `a-manual` reads as an order ticket: "A transaction", Account, Instrument, Units, Price, Currency, Fee, then primary "Send to preview".
  - `a-live` reads as a pending order with a cancel window: "Approved, not yet committed", "Still approved, until 21:33", "Apple 60 → 64 units", "AstraZeneca 85 → 75 units", "Revoke approval".
  - The expired sheet (`a-approve stale`) has a live "Sign in and approve" with no note.
  - MP-62 negative: no screen offers a trade or an order. MP-158 has the same rule for entries, and the Journal holds it everywhere.
- **Correction:**
  - One sentence, word for word (lesson 7): "This records what already happened at your broker. It places no trade."
  - Put it on the manual form, the draft head and `b-check`, the live approval, the receipt and every approve sheet.
  - Change "Send to preview" to "Add to preview".
  - Add a check over every import screen and state.

**R2-j4 · P1 · blocking yes · holdings.js:298, 204, 301-304, 555**
- **Evidence:**
  - `b-accounts` shows a green check, "Reconciled to 30 Sep", on the General account.
  - `b-imports default` shows both on one screen: "General account Reconciled to 30 Sep" and "Open the difference General account, Q3 · cash differs by £8.15".
  - `a-difference` says the same account is "Difference open" at Q3.
  - MP-65: an open difference "stays open and visible across sessions". MP-62: never hide risk.
- **Correction:** set `ACC` General `ev` to `['amb', 'Difference open, £8.15']` (flows to `b-private` and `accountPick`). Add a check that no "Reconciled" sits beside an open difference.

## P2, blocking

**R2-j5 · P2 · blocking yes · holdings.js:673, 341, 377**
- **Evidence:**
  - `b-check abstention`: the card asks "What date was this sale?" and shows "?", while the rail says "Sold 10 AstraZeneca 22 Oct". `groupList` is not given `unread`.
  - `a-edit` and `b-edit abstention`: the Date field is blank and "Claude could not read this", while the head says "22 Oct · 3 rows".
  - `a-preview` on the same state says "Date not read", so the flip disagrees too. MP-48: an unread field "is absent, not guessed".
- **Correction:** pass `unread: st === 'abstention'` at :673, and make the `editCard` subtitle "Date not read" when `blank`. Add a check that "22 Oct" is absent on all three.

**R2-j6 · P2 · blocking yes · holdings.js:158-162, 587-588, 595**
- **Evidence:**
  - `a-preview offline` says "Selecting and editing wait until you reconnect", and `stale` says the draft is out of date.
  - In both states Confirm £107.60, Edit, Exclude group, Keep it anyway, From outside, From General and both listing radios are LIVE (read from HTML). `b-check` disables its answers in the same states, so the flip changes what can be done.
  - All five ticks read `aria-checked=false` while the rail says "1 group selected · 3 rows of 11" (Chrome, stale).
- **Correction:** `groupsCard` honours `off` on every control. Keep Apple's tick checked and disabled, so the selection matches the rail.

**R2-j7 · P2 · blocking yes · holdings.js:312, 552**
- **Evidence:**
  - Rendered, iPhone default:

    | View | Gain on | Evidence card | "No rate" | "Two rates" |
    | --- | --- | --- | --- | --- |
    | `a-list` | yes | yes | yes | yes |
    | `b-accounts` | no | no | no | no |

  - Web has all of them on both sides. On phone B, AstraZeneca's "No rate found" and Reliance's "Two rates fit" appear nowhere.
  - MP-178: uncertainty stays in view in both options.
- **Correction:** drop the `phone(ctx) ? ''` at :312 and show `coverage(ctx)` on phones at :552.

**R2-j8 · P2 · blocking yes · journal.js:157, 209, 212, 256, 259**
- **Evidence:**
  - Disagreement: `a-list` shows NVIDIA "Amended… Corrected to +11.9%". `b-board` shows "Scored… Rose 12.4%" with no mention of it, and its banner is about Reliance, which A never mentions.
  - Stale: A says "Outcomes are behind", B says "Rankings are behind… HSBC".
  - MP-130 and MP-154: both scores stay visible.
- **Correction:**
  - Pass `over` and `marks` through `laneC`, so B shows Amended.
  - Show both state facts on both sides: A's Disagreement also names Reliance, and each Stale banner carries both.

**R2-j9 · P2 · blocking yes · holdings.js:611, 706, 613, 708, 251-253**
- **Evidence:**
  - Stale: A says "This correction is out of date", B says "This reversal is out of date". The flip changes which act is stale.
  - Disagreement: B says "Reversal refused. A sale on 1 Nov depends on these units", while A keeps "Reverse the import" live with no word of it.
- **Correction:**
  - Use one stale sentence on both sides: "A newer change reached the ledger first, at revision 215".
  - In A's Disagreement show the same refusal, and take the live Reverse away.

**R2-j10 · P2 · blocking yes · holdings.js:610, 705, 449**
- **Evidence:**
  - `a-done error`: "The commit did not finish" with live "Revoke approval".
  - `a-live error`: "Too late to revoke. The commit started at 21:22".
  - MP-55 allows revoking only before commit submission.
- **Correction:** on the commit failure, drop the Revoke button from `stillApproved()`. Show the bound rows with only Retry safely.

**R2-j11 · P2 · blocking yes · holdings.js:302, 86, 104**
- **Evidence:** under No model, `b-accounts` shows HSBC "Late · 14:10 · forecast held", with no forecast in existence. `a-list` shows "No forecast".
- **Correction:** in `accCard`, drop "forecast held" when the state is `noModel`, leaving "Late · 14:10 · No forecast".

**R2-j12 · P2 · blocking yes · holdings.js:297, 304**
- **Evidence:**
  - The ISA shows a plain "Return +11.2% a year" although AstraZeneca has no rate.
  - 11.22 is exactly the value-weighted mean of Apple's ISA 13.1 and HSBC's 8.1, so one holding is silently left out.
  - India shows "Partial" for the same gap, and Stale turns the ISA to "Partial".
  - A says "Return on 4 of 7". MP-69: "no partial value is shown as complete".
- **Correction:** show "Partial, on 2 of 3" in every state. If it is meant as the account's own XIRR (MP-72), say so and show how AstraZeneca's flows fit.

**R2-j13 · P2 · blocking yes · journal.js:140, 117-121, 209, 221, 286**
- **Evidence:**
  - Stale, same record: `a-list` says NVIDIA 28 Apr "Scored, Rose 12.4%". `a-one` and `b-one` say "this outcome is not known yet", "Waiting on FX".
  - On web the Stale view never names the instrument: `b-one stale web` has no "NVIDIA" in its text, and the title is "One decision".
- **Correction:** in Stale, mark that row "Waiting on FX" on the list and in the Scored lane, and adjust the tallies. Alternatively use the one-decision view on a record not scored. Title the view with `s.title` on web too.

**R2-j14 · P2 · blocking yes · holdings.js:204, 290, 325**
- **Evidence:**
  - "Snapshot only… a rebuild you approve… Go to Imports" leads to `a-imports`/`b-imports`, which show no rebuild or proposal in any of nine states (rendered).
  - No control anywhere opens `a-rebuild` or `b-rebuild`. MP-149 lists rebuild proposals in the journey.
- **Correction:** add an open-work row, "Rebuild proposal ready · Nippon India Nifty 50 BeES", to `openWork()`, with its stale state.

**R2-j15 · P2 · blocking yes · holdings.js:614, 709, 316**
- **Evidence:**
  - The Abstaining receipt says Bought 4 Apple adds "a third change of direction" and two rates fit.
  - Apple's drawn events are all purchases, so another purchase adds no sign change.
  - The row that changes direction is Sold 10 AstraZeneca, and that holding already has no rate.
- **Correction:** rewrite the card around what these rows do, or draw Apple sales in `EVENTS`. Do not claim a root the flows cannot produce (MP-72).

**R2-j16 · P2 · blocking yes · holdings.js:389, 392, 435, 424**
- **Evidence:**
  - `a-edit disagreement`: you typed £106.70, Value 1,067.00, yet the rail says "Cash, Stocks ISA +£1,072.01". It should be +£1,063.01.
  - `a-difference disagreement`: a fix closed £5.05, yet the table still reads £1,522.10 and £1,530.25 (8.15 apart) beside "Difference £3.10 of £8.15".
- **Correction:** pass the edited cash into `editRail`. Show ledger £1,525.20 in that state, or show the two figures as of before the fix.

**R2-j17 · P2 · blocking yes · holdings.js:400-404, 413-414**
- **Evidence:**
  - `a-rebuild abstention` invents a partial rebase: "1,600 units kept", "4,200, 1,600 from the baseline", Generation "1 → 2", with live Review and approve. POLICY-012 and MP-68 describe retiring the baseline, not splitting it.
  - FIN-OD-03 is `partly_answered`, with "Cutover, reconciliation and recovery proof, account edge cases" still open.
  - The only Proposed chip on the rebuild screens is the Offline one (rendered).
  - No model says "rows you already approved", against "3 older statements" that nothing approved.
- **Correction:** label the partial case Proposed · FIN-OD-03 and put it to the owner (lesson 23). Reword the No model line.

**R2-j18 · P2 · blocking yes · shell.js:88; holdings.js:627**
- **Evidence:** `b-accounts default pwa`, measured in Chrome: flip 150-194, Add statement 200-361, Hide amounts 367-403, on a 390 frame with `overflow:hidden`. The privacy control is cut by 13 px, because the flip added width to the bar.
- **Correction:** on phone web, make Add statement icon-only or move it into the page. Extend the checker to the top bar.

## P2, not blocking

**R2-j19 · P2 · blocking no · holdings.js:302, 170, 462**
- **Evidence:** the masked B view keeps "AAPL · 60 units", "NIFTYBEES · 4,200 units" and "60 → 64 units". With a public price these reveal the money. MP-84 says "masks amounts"; the README says money.
- **Correction:** ask the owner whether units count as amounts. Until then, label it as an open question.

**R2-j20 · P2 · blocking no · holdings.js:462**
- **Evidence:** `mask` writes literal `••••` with no accessible name. A screen reader gets bullets, or nothing, for every figure. MP-84 requires screen-reader use.
- **Correction:** render the mask with a visually hidden "Amount hidden" and hide the bullets from assistive technology.

**R2-j21 · P2 · blocking no · j.mjs:103-106, 151, 163, 175, 182; flip.mjs:9-15**
- **Evidence:** on a scratch copy, a direct undo of each fix was caught 20 of 20. One planned undo, R1-j17's on the Add statement screen, did not match the page text and never ran. R1-j9 was not exercised (a no-op entry). Thirteen partial undos, chosen where I suspected a gap, all survived:
  - R1-j8: Reliance and AstraZeneca events no longer add to their units, and Apple's cost no longer adds to its basis. Only Apple's units are summed.
  - R1-j17: price chips back on the difference, rebuild, live approval and questions 2 and 3. The screen list predates them.
  - R1-j22: renaming "What you did, at your broker" makes the split return empty, so the negative passes. This fails open (lesson 8).
  - R1-j19: money in Loading. That state is not checked.
  - R1-j20: the candidate on `b-accounts` under No model.
  - R1-j15: a wrong heading or difference row while the two figures stand.
  - R1-j7: a wrong Gain count.
  - R1-j16: the import's "Keep it open, with a reason" losing its reason.
- **Correction:** sum units and cost for every holding, drive R1-j17 from `fresh: 'default'` screens, make R1-j22 fail when the split finds nothing, and widen the states.

**R2-j22 · P2 · blocking no · journal.js:29, 120; holdings.js:319**
- **Evidence:** the Journal records "Added 5 units" of AstraZeneca on 3 Mar 2026. "What built this position" has no such event; its last is 8 Apr 2025, and 100 − 40 + 25 already gives 85.
- **Correction:** split the 2025 purchase into Bought 20 (£2,000.00) and Bought 5 on 3 Mar 2026 (£500.00). That keeps 85 units and £8,200.00.

## P3

**R2-j23 · P3 · blocking no · holdings.js:392, 174, 161, 507, 367**
- **Evidence:**
  - `a-edit empty`: "85 units, unchanged" sits above "Changes value, cost basis, gain and return".
  - `mismatch({done})` reads "Fix a row, add the missing one, keep the difference open", with no "or".
  - The duplicate says "Same date" beside 20 Oct and "typed entry, 21 Oct".
  - `a-manual disagreement` matches a row dated 2 Nov to R-0212, a Q3 receipt committed on 24 Oct.
- **Correction:** add an Empty note, add "or", say "entered on 21 Oct", and name a different receipt or date.

**R2-j24 · P3 · blocking no · journal.js:235, 302**
- **Evidence:** "1 entry is left out… Reliance on 9 Oct" names an entry that `a-list` and `b-board` do not list. Disagreement still counts 7 decisions.
- **Correction:** draw it, or reword around Reliance's open row.

**R2-j25 · P3 · blocking no · holdings.js:110**
- **Evidence:** under No model the foot still says "each holding gives the reasons for its action, and forecast ranges are 80%".
- **Correction:** drop that clause in No model.

**R2-j26 · P3 · blocking no · holdings.js:249, 617, 712**
- **Evidence:** Renew and Delete original are live in `a-done offline` and during Committing. `records()` disables its own actions offline.
- **Correction:** give `original()` the same offline handling, and hold it during a commit.

**Covered:** every flip pair in both journeys, in all nine states on iPhone and web, compared by rendered text and figure diff, with phone web layout in Chrome. iPad flips and the private views were sampled, not walked in every state; the rest of that lane's lists were checked from the code that all surfaces share. Also the new screens against their stories, the figure arithmetic, and `j.mjs` by mutation on scratch copies.

**Not checked:** no assistive-technology pass and no real phone. The repo is untouched. One browser script was refused as unparseable (it held no removal) and ran from a file, as the brief allows.
