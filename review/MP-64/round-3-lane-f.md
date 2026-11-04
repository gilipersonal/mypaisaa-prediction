# MP-64 round 3, lane f: Home, Files, Audit

Snapshot `af66cc0`, diff `0d1ab4e..af66cc0`. Picked options read in depth: Home B, Files A, Audit B.
Evidence comes from the source, `scripts/design_admin_text.mjs`, the records named, and one iPhone screenshot.
Nothing in the repository was edited. Every figure in the new `bothBox` was recomputed and foots.

Counts: 17 findings. 10 blocking (1 P1, 9 P2), 7 non-blocking (7 P3). No P0.

### R3-f1 · P1 · blocking · docs/design/admin/src/journeys/files.js:32

**The held file promises a decision nobody can make, and the act is missing from the inventory.**

Evidence:
- The row moved into Held apart this round. It reads "Oversized file. Held apart and not read until you decide." `heldFile` is a plain `rowAt`, with no control, in every state on every device.
- The owner journey draws the same file with two acts: `holdings.js:204`, `btn('Split and resend')` and `btn('Discard')`.
- `permissions.json` has no row for either. A search of all 80 actions for discard, split, resend, held, oversize and quarantine finds none. A15 covers only the orphan.
- PH01-S06 says "The original bytes, their storage version and a SourceReceipt exist before processing", so Discard removes stored bytes. The MP-64 negative bars deleting evidence without a recorded tombstone, so this act's audit record matters.
- The two pages also count differently: `holdings.js:202` says "3 files not taken in" and includes this file, and `files.js:33` says "2 files not taken in".

This breaks "A permission inventory lists every admin action" and lesson 28. It is the same fault as R2-f1, on another row.

Correction:
- Add one inventory row, for example A81 "Decide a held file", with its step-up and audit (tombstone if it is discarded). Source: PH01-S06, MP40-Q1.
- Draw `act('A81', 'Split and resend')` and `act('A81', 'Discard')` on `heldFile`, with `proposed('MP40-Q1')` kept. Hide them where `go` is false, as `orphan` does.
- Align the Holdings heading, or state on the page why the two counts differ.
- Update `tests/admin_facts` and the coverage counts.

### R3-f2 · P2 · blocking · docs/design/admin/src/journeys/audit.js:185

**A list read at 11:12 shows a record from 11:22.**

Evidence:
- `b-explore` Stale prints "Read from the manifests at 11:12, so this is complete to ledger revision 213", then "Export link issued · You · Wed 11:22 · revision 213".
- This round brought the row back: `chRows(7, CH.slice(1))` became `chRows(8)`, and `a-who` Stale did the same at `:146`.
- The same fault stands in two other views:
  - Offline, "Showing recorded changes from 11:20", at `:186`.
  - Failed, "Last good list, 11:20", whose row carries the chip "From 11:20, not vouched for", at `:184`.
- Files repeats it: `a-queue` Stale and Offline print "export ready, link valid 42 min" under "From 11:12" and "from 11:20". That figure only works if the link was issued at 11:22.

This is lessons 26 and 27. In the journey that exists to prove when things happened, the record contradicts its own read time.

Correction: R2-f5 holds that the row stays, so keep it and move the event before every read. Change `CH[0]` to "Wed 11:02" and `files.js:29` and `:147` to "link valid 22 min" (one hour from 11:02, at 11:40). No held check names 42 min or 11:22. `privacy.js` keeps its own clock.

### R3-f3 · P2 · blocking · docs/design/admin/src/journeys/audit.js:108

**The new expiry record is not an AuditEvidence record.**

Evidence:
- `RECORD_X` drops two fields that `RECORD` shows and the schema requires: Approval and Previous digest (`contracts.schema.json`, `AuditEvidence.required`).
- PH01-S04 says each record carries an "approval id". An approval was made at 21:18, so it has one. The row "Approved · 21:18" is not a field of the contract.
- `b-record`'s note still says "The fields of AuditEvidence". `claimBox` says "Each record carries a digest of the one before it", yet this record shows none on the same page.
- Source is a name, "ISA statement, Oct 2026", where `RECORD` holds a reference. The page says audit holds "References only".
- The rail says the actor "is drawn as You or Writer here", directly beside "Actor · Nobody".
- `PANE_X` Audit step reads "This expiry is the record", with no id, though the record is `aud_5b19` (lesson 31).

Correction:
- In `RECORD_X`, replace "Approved" with `['Approval', mono('apr_6c03')]`, keep the time in Reason, and add `['Previous digest', mono(...)]`.
- Use a source reference, and add the new ids to the minted-ids note at `:249`.
- Change the `recRail` sentence to include Nobody.
- Name `aud_5b19` in `PANE_X`.
- R2-f4 bars `apr_52be`, so mint a new id.

### R3-f4 · P2 · blocking · docs/design/admin/src/journeys/audit.js:233

**R2-f4's fix left another record's reference in place, and the same screen contradicts its Empty state.**

Evidence:
- `b-compare` Expired prints "Before · Ledger revision 213" and "Before reference ref_a3c0". In Ready, `ref_a3c0` is the reference for revision 210 on R-0210. One reference cannot name two revisions. R2-f4's check bars only `ref_a3c1`.
- `:227` says of Empty: "This record changed nothing, so it has no before and after. An expiry or a refusal is like that." Expired then draws a before and an after for an expiry.

Correction:
- Pass a minted reference for 213 into `beforeAfter`, and extend R2-f4's check to bar `ref_a3c0`.
- Change `:227` to "A refusal is like that."

### R3-f5 · P2 · blocking · docs/design/admin/src/journeys/audit.js:233

**"Nothing happened at your broker" is false for this import.**

Evidence:
- Expired's Two clocks reads "Economic date · None: nothing happened at your broker".
- The record is the ISA statement import, whose rows are trades dated 6 to 22 Oct. Every Files screen on the same import opens with "This records what already happened at your broker."
- What did not happen is a commit. MP cannot know the first claim, and the second is the fact (lesson 39).

Correction: "None: nothing reached your ledger".

### R3-f6 · P2 · blocking · docs/design/admin/src/journeys/audit.js:163

**In Failed, Gaps and integrity reads as a passed result where the Explorer says the same receipts are not vouched for.**

Evidence:
- This round replaced Commits' `fail('Not vouched for')` with a range row. Commits and Delivery now show their neutral chips: "R-0212, R-0211 and R-0210 finished whole · commit_completeness" and "Each of these reached what follows it · outbox_delivery".
- In the same state, `b-explore` marks those three receipts "From 11:20, not vouched for", and says "the query gives no partial answer".
- PH01-S04 allows the complete lineage or INTEGRITY_INCOMPLETE "rather than a partial answer".
- The frame says "last good 11:20", and Stale labels these same rows "From 11:12". Failed is the one state that leaves them bare (lessons 27, 31).

Correction: `CHECKS({ range: true, c: hold('From 11:20, not vouched for'), d: hold('From 11:20, not vouched for') })`, keeping the range row.

### R3-f7 · P2 · blocking · docs/design/admin/src/journeys/home.js:41

**Home's Expired state says something expired at 18:00 under a chip that reads 11:40.**

Evidence:
- `b-home` Expired prints "Records current · 11:40 Wed 4 Nov" and "Taiwan Semiconductor expired at 18:00", in the banner and on the Approvals tile.
- Ready, on the same page and clock, says "Next: Taiwan Semiconductor, 18:00".
- Admin Approvals carries this reasoning in its notes: `docs/design/admin/src/journeys/approvals.js:298` and `:304`, "Expired reads as that evening, past 18:00, not the 11:40 of Ready." R2-f6's fix moved Home to Taiwan without the note. `b-home` has none.

Correction: add the same note to `b-home` and `a-home`.

### R3-f8 · P2 · blocking · docs/design/admin/src/journeys/audit.js:177

**The expiry Home names is not in the record.**

Evidence:
- Home and Approvals in Expired both say Taiwan Semiconductor expired. The Explorer in Expired lists Watch Barclays and the statement approval, and no Taiwan row.
- The owner journey's record promises "Every approval, refusal, expiry and automatic revert lands here" (`docs/design/journeys/src/journeys/approvals.js:210`). `b-explore`'s note makes this screen the full search across all of them.
- R2-f6 moved Home off Barclays and left Audit where it was (lessons 27, 31).

Correction:
- Add `['clock', 'Watch Taiwan Semiconductor', 'Nobody · expired 18:00', hold('Expired'), proposed('MP40-Q9')]` at the top of `CH_X`.
- Move the selection to `chRows(3, CH_X)` at `:188`, which keeps R1-f6's pane match.
- Add to the note at `:258` that Expired is the exception.

### R3-f9 · P2 · blocking · docs/design/admin/src/journeys/files.js:69

**Files Partial has no way forward: the blank date cannot be filled, and the 2-group approval has no sheet.**

Evidence:
- The banner says "that group waits". The box says "Sold 10 AstraZeneca waits for its date". Its controls are Approve, Open the original, Reprocess and Cancel. A56 is dropped here, and it is the only control that could add a date.
- The page's own a-compare says revision 6 has "22 Oct, added by you".
- Owner Holdings draws it: "Type it from your statement" with `Add the date` (`holdings.js:183`).
- "Approve these 2 groups" leads nowhere. `approveOf` draws only "Commit 3 groups, 9 of 11 rows", on draft revision 6, and its Partial entry is "Outcome unknown". Holdings draws the 2-group sheet (`holdings.js:264`: `£4,012.60 → £3,070.82`, "Left out and still listed", `bind(5)`).

Lesson 28. A live ledger approval has no preview of what it commits.

Correction:
- Add `act('A56', 'Add the date')` to the left-out row in `groups({ noC: true })`, and use Holdings' sentence.
- Draw the 2-group change and its binds inline in the Partial box, as Holdings does. That means Apple, HSBC, ISA cash `£4,012.60 → £3,070.82`, the left-out list, draft revision 5 and hash `b41d…9e07`.

### R3-f10 · P2 · blocking · docs/design/admin/src/journeys/files.js:121

**"The rows above are all it binds" is false, and the correction it approves is not drawn.**

Evidence:
- PH01-S14: an approval binds "owner, environment, operation, draft revision, canonical payload hash, selected-rows hash, expected ledger revision, assurance policy version and an expiry 15 minutes after approval". `files.js:99` and a-approve's note show hash and revision for the same writer. `bothBox`, the highest-stakes approval on the page, shows neither and says the rows are all it binds.
- The ledger revision it would bind is not derivable from the page. The sale was "recorded after this receipt", so the ledger is at 215 or later, while the a-fix note at `:241` says "the ledger reads revision 214 here".
- PH01-S18: a correction commits "a linked inverse of every original leg together with its replacement". `correctBox` draws those legs. In `bothBox` the correction is one sentence, "Draws the 4 units from the 60 held before this import", with no legs. "Names every row" (R2-f8) is therefore only partly met.

Correction:
- Add a binds block: expected revision 215, payload hash, expiry 15 minutes. Mark it Illustrative.
- Add reverse and replace legs for the sale, with `-£676.01` and `+£676.01`.
- Reword to "Both reach the writer as one approval, or neither does."
- Add to the a-fix and b-after notes that Conflicting reads revision 215.
- The R2-f8 check holds if A11 stays after "After both".

### R3-f11 · P3 · non-blocking · docs/design/admin/src/journeys/files.js:39

**Failed's Held apart list has one row, and the rail beside it says 2.**

Evidence: `a-queue` error prints Held apart with `isa-2019-to-2026.pdf` only, then "Right now · Held apart 2". The card calls this "the list from 11:20", yet Open work, the orphan and Kept are all gone (lesson 37).

Correction: use `qHeld(false)` in place of the single row, and keep `qWork()` and `qKept()`.

### R3-f12 · P3 · non-blocking · docs/design/admin/src/journeys/files.js:61

**A05 and A77 make a new revision, and the draft never says so or draws the outcome.**

Evidence: `permissions.json` says "New draft revision" for both. Owner Holdings moves to revision 7 at `holdings.js:533`. `draftActs` and the rail name only editing, excluding, remapping and reprocessing. `a-draft` Expired says "a fresh approval is enough" beside live A05 and A77 buttons. A77 appears nowhere else on the page, so its result is undrawn (lesson 32).

Correction: add "deciding a duplicate or a transfer" to the shared sentence, and use one line of outcome text on `gPend`.

### R3-f13 · P3 · non-blocking · docs/design/admin/src/journeys/files.js:121

**"The figures on the left" points at the labels.**

Evidence: on iPhone the left column is Apple, HSBC, AstraZeneca and ISA cash, and every figure sits on the right.

Correction: "The starting figures include the sale".

### R3-f14 · P3 · non-blocking · docs/design/admin/src/journeys/files.js:238

**"A later evening" is after the page's own clock.**

Evidence: Expired is Tue 21:33 and the page's clock is Wed 4 Nov 11:40, so no later evening has happened yet. `a-approve` Failed sits under "Records failed 11:38" with Approved 21:18, Expires 21:33 and a live Retry. Lines `:241`, `:262` and `:265` inherit the reading.

Correction: use Approvals' form: "Partial and Failed read as that later moment, not the 11:38 of the chip."

### R3-f15 · P3 · non-blocking · docs/design/admin/src/journeys/home.js:18

**Home Empty and Approvals Empty name different versions.**

Evidence: the Home tile says "Settings v9 · catalogue v14". `docs/design/admin/src/journeys/approvals.js:223` Empty says "Settings v10" and "Catalogue v15 · 4 watch-only listings", because every proposal is decided (lesson 31). This code did not change this round. It is reported as a join.

Correction: add `approvals: 'Settings v10 · catalogue v15'` to `LINES.empty`.

### R3-f16 · P3 · non-blocking · docs/design/admin/src/journeys/home.js:26

**R2-f6 and R2-f7 reached only Home B. Unpicked Home A contradicts itself.**

Evidence: `a-home` Expired prints "4 decisions wait on you · Next: Taiwan Semiconductor, 18:00" and, in the same frame, "Taiwan Semiconductor expired at 18:00". Conflicting says 4 where B and Approvals say 3.

Correction: pass the count and the next line through `needs` by state, as `topOf` does.

### R3-f17 · P3 · non-blocking · docs/design/admin/src/journeys/audit.js:90

**A comment states the rule R2-f5 removed.**

Evidence: "a stale or saved chain says so on every step, so no old step reads green". Stale steps now read `resolved`, on purpose.

Correction: "a saved or unvouched chain says so on every step".

## Checked and clean

- `bothBox` arithmetic: 680.00 - 3.99 = 676.01; 4,142.83 + 676.01 = 4,818.84; less 130.23 = 4,688.61; units 64 - 4 - 4 = 56. "Illustrative" is present, and the owner's "Keep it, illustrative" is honoured.
- Home's counts in Conflicting and Expired (3) match Approvals. The first view on a phone carries the incident and the count.
- The LAG phrase matches PH01-S04 and is one phrase across the Audit result screens.
- `CHECKS` range row, `linWhy`, `b-lineage` Conflicting link, and the Files group counts (2 of 6, 3 of 9).
- The fixed list: nothing above asks to undo a held fix. R3-f2 keeps the row R2-f5 holds. R3-f8 keeps R1-f6's match.
