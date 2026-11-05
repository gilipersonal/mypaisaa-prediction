# Lane (c) Rules and records: round 2 findings on `1484e7d`

**Result:** ten findings, six blocking, one of them P1. No lesson misstates its source. All six blocking findings are fixed-list checks that pass with their fix undone. One of them also leaves a third wording of a fixed fault in `shell.js`.

**How I tested the checks:** I ran 12 mutations on a scratch copy of `1484e7d`, each followed by `python3 scripts/review_regress.py MP-182 --approved`. Every mutation exited 0 with "10 passed, 0 failed". All of them are visible in the source, so they fall outside the recorded "CI has no browser" limit.

## Blocking findings

**R2-c1, P1, blocking: `review/MP-182/fixed.json:74`, `scripts/design_runtime.mjs:245,256`**
- **Evidence:**
  - R1-c1's check only looks for `const sizeFloor = `.
  - Changing line 245 to `? 10.95 : 10.95` still passes. So does restoring `if (t.size < 10.95)` at line 256.
  - `design_runtime.mjs` has no selftest, and no press case touches its floor, so nothing holds this fix.
  - Lesson 58 says to "prove the check still refuses a page really scaled", and I found no such proof in the repo.
- **Correction:**
  - Make R1-c1 a `command` check that requires both ``reviews\\/\/\.test\(file\) \? 10\.95 : 11\.95`` and `if \(t\.size < sizeFloor\)`. I confirmed both match today.
  - Add a behavioural case that feeds 11 px text and a really scaled page to `design_runtime` and expects a refusal, proved by undoing the fix.

**R2-c2, P2, blocking: `review/MP-182/fixed.json:44`, `docs/design/journeys/src/shell.js`**
- **Evidence:**
  - R1-f5's check pins only the destructure `const ids = ({ o, s, st, landed, from })`.
  - Changing the stored value to `from: from || null` puts `from[2]` (hz, mode, t) back in storage, and the check passes.
  - Restoring "keeps only which view" in the README also passes, which is the fault lesson 57 names.
  - `design_prism_press.mjs:295` holds the storage half locally. The ledger does not.
- **Correction:** Also require `from: from \? from\.slice\(0, 2\) : null`, and require `only\s+which\s+view` to be absent from the README.

**R2-c3, P2, blocking: `review/MP-182/fixed.json:24`**
- **Evidence:**
  - R1-f3 names two bands, 381 to 389 and 561 to 647, but the check pins only the 660 px rule.
  - Changing `@media (max-width: 400px) { .brand` back to 380 passes.
  - The finding says "with R1-s1", yet nothing pins the sweep. Changing it to `w <= 390; w += 35` also passes.
- **Correction:**
  - Add `@media \(max-width: 400px\) \{ \.brand > span:last-child`.
  - Add a pin on the sweep loop in `design_prism_press.mjs`.

**R2-c4, P2, blocking: `review/MP-182/fixed.json:34`**
- **Evidence:**
  - R1-f4's fix has three parts, and the check pins only the CSS rule.
  - Removing `data-snug` from both `cost.js` and `research.js` passes, and the labels fall back under 12 px.
  - Reverting the walker's `getScreenCTM` measure, the R1-s3 half, also passes.
- **Correction:**
  - Pin `<svg class="cx" data-snug` in `cost.js`.
  - Pin `'<svg class="cx" data-snug'` in `research.js`.
  - Pin `getScreenCTM` in `scripts/design_journeys_check.mjs:62`.

**R2-c5, P2, blocking: `docs/design/journeys/src/shell.js:34`, `review/MP-182/fixed.json:100`**
- **Evidence:**
  - The R1-c3 ledger entry says "neither record answers it".
  - `shell.js:34`, repeated at `index.html:2023`, still reads "A flip is per journey". That answers the open question, and `slotKey` keeps flips per frame.
  - This breaks lessons 1 and 3: the check searches one phrase in one file.
  - Deleting the new OPEN row passes. Restoring "In the app the choice would cover the whole journey" also passes.
- **Correction:**
  - Reword line 34 to the owner's own words, "each journey flips on its own", and rebuild.
  - Require the OPEN row.
  - Require the README's "Proposed, not decided" line.
  - Refuse every wording of the old sentence.
  - The rebuilt `docs/design/journeys/index.html` is a design change, so it needs a republish and a new `design_sync` record.

**R2-c6, P2, blocking: `review/MP-182/fixed.json:64`**
- **Evidence:**
  - R1-s2 lists four parts, and the check holds one label.
  - Dropping the "Not now does nothing", "admin does not watch the system theme" and "the chosen control loses its look" selftest cases still passes.
- **Correction:** Pin all four case names.

## Non-blocking findings

**R2-c7, P3, non-blocking: `docs/design/journeys/src/shell.js:12`**
- **Evidence:** The old comment read "on this device ... as the owner chose". It now reads "A flip stays on this browser, journey by journey, as the owner chose". The owner's label was "A, kept per device", and what "per device" means is open on the same page. This attributes the maker's reading to the owner (lessons 23 and 42).
- **Correction:** "A flip is kept per device, as the owner chose. This page keeps it in this browser." Then rebuild.

**R2-c8, P3, non-blocking: `scripts/design_runtime.mjs:245`, `scripts/design_gates.py:112`**
- **Evidence:** `design_runtime` gives the old floor to everything under `docs/design/reviews/`, which is five pages. `design_gates` gives it to the two pages in `GATED` and says "Every other page has 12". The gates disagree on `option-a`, `option-b` and `option-c`, against lesson 52's "every gate holds the same one".
- **Correction:** Use one list of historical pages in both gates, or state the difference in both.

**R2-c9, P3, non-blocking: `docs/design/prism/README.md:26`, `scripts/design_prism_press.mjs:345,347`**
- **Evidence:** The README and the gate comment say "every width", but the loop uses `w += 3`, so lesson 55's sweep is itself a sample. My step-1 sweep from 320 to 820 found no collision on any of the three pages, so only the claim is wrong.
- **Correction:** Use `w++`, or write "every third width".

**R2-c10, P3, non-blocking: `docs/planning/trace.json`, MP-182 `code`**
- **Evidence:** The row lists `fixed.json` and `state.json`, but the branch also changes seven other `review/MP-182/` files. MP-15, MP-62 and MP-64 list the folder instead.
- **Correction:** Replace both entries with `review/MP-182/`.

## Checked and clean

- **Lesson 52:** The floor was 11 in all three gates on `main`. On `46b631b`, two gates had moved to 12 and `design_runtime` still read 10.95.
- **Lesson 53:** The audit's UX-06 says no `touch-action` appears in the file. `bf2ed30` has it at line 528.
- **Lesson 55:** On `46b631b`, Journeys collides at 381 to 389 and 561 to 647. Prism collides at 561 to 619 and Admin at 561 to 624. All three are clear now.
- **Lesson 56:** 11.49 is 12 × 0.957, the chart's scale with the preview zoom removed. Only the walker's unfitted measure gives that figure.
- **Lesson 57:** `saved` held `hz`, `mode` and `t`, and the old README said "only which view".
- **Lesson 58:** The maths follows from the code, but I did not reproduce the "showed as 11" case.
- **Lessons 1, 3, 4, 5, 7, 49:** I searched for the floor and flip wordings across line breaks in the rules, README files, scripts, planning records and Confluence pages. The only faults are R2-c5, R2-c7 and R2-c8.
- **Ledger entries that hold their findings:** R1-f1, R1-f2, R1-f6 and R1-c2.
- **Trace:**
  - MP-39 (Done), MP-180 (parent MP-4), MP-181 (no parent) and MP-182 (In Progress, parent MP-4) all match Jira.
  - The seven In Progress or In Review rows match Jira.
  - No key from MP-183 to MP-188 exists.
  - I did not compare the other rows.
- **Artifacts:**
  - All nine manifest hashes match their sources, and `design_sync` is in step.
  - The published Prism, Journeys and Admin pages each contain the source byte for byte inside the publish wrapper.
- **Open questions:** The flip questions are on MP-182 in Jira, as plan-sync rule 3 requires. There is no PR yet to carry them.

## Limits on this review

- A search hit three lines of `review/MP-182/state.json` (109, 226, 332) by accident. They appeared in its output, and I used nothing from them.
- The MP-182 Jira comments include the maker's round 1 summary. I read them to check the open questions.
- `playwright-core` disappeared from `mypaisa-agent/scripts/node_modules` for a moment and then came back. Another process may be touching that folder.
- My scratch files are in `/private/tmp/claude-501/-Users-arundutta-projects-mypaisaa-prediction/45ba900b-058a-4437-b30a-d55697f4dbd3/scratchpad`, not a folder I made under `$TMPDIR`. The worktree is unchanged by me.
