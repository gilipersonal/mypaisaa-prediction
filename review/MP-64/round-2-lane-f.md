# MP-64 round 2, lane f: Admin home, Files and imports, Audit

Reviewed: `git diff 6705fc1..0d1ab4e` on `home.*`, `files.*`, `audit.*`, and their joins. Picks read in depth: Home B, Files A, Audit B. Line numbers are at `0d1ab4e`, under `docs/design/admin/src/journeys/`. Screens were read with `scripts/design_admin_text.mjs` and in the browser.

Counts: 19 findings. P0 0, P1 1, P2 12, P3 6. Blocking 9, non-blocking 10.

Checked and sound: every cash and unit sum in Files (draft, compare, correction, reversal, difference) foots and matches `holdings.js`; ledger revisions 210 to 214 and receipts R-0210 to R-0213 line up with Audit; AuditQuery's nine kinds are all in the filter; export link 42 min from Wed 11:22; weekdays for Nov 2026; Home's lines for agents, costs, incidents and models match those journeys; no amount appears in Audit; audit never claims tamper-proof.

---

### R2-f1 · P1 · blocking · files.js:58, files.js:61

**A transfer can only be settled by a control that does not exist, and the act is missing from the inventory.**

Evidence: `gPend` says "Not income until you say. It stays pending and visible." with no control. New in this round, `ALL_LATER` says "Approving all 5 groups comes once the 2 left out are settled." The duplicate has A05. The transfer has nothing, on any state of `a-draft`. The owner journey draws the act: `holdings.js:186` asks "Money from outside, or a transfer from your General account?" with buttons "From outside" and "From General". `permissions.json` has no action or audit cell naming a transfer. So the story's "lists every admin action" fails for an act the Files row itself promises, and lesson 28 is crossed: the promise has no destination, and "all 5 groups" can never be reached.

Correction: add an inventory row (say A77, "Say where a transfer came from": step-up open, audit a new draft revision and AuditEvidence with class open under CT-03, phone off, source the Holdings journey), draw it in `gPend` through `act()` with the two answers from `holdings.js:186`, and hide it where `go` is false, as `gDup` does. Update the coverage and the `--facts` counts with it.

### R2-f2 · P2 · blocking · files.js:59, files.js:68

**A partial draft says 3 selected and 9 of 11 rows directly above "Approve these 2 groups".**

Evidence: `files a a-draft partial web` prints "5 groups 3 selected · 9 of 11 rows", then Sold 10 AstraZeneca "Left out", then "Approve these 2 groups" and "2 groups, 6 of 11 rows, can be approved now". `groups({ noC: true })` leaves the heading fixed. The A08 label was changed in this round and the heading beside it was not (lessons 27, 37). The owner journey's abstention state reads "2 groups, 6 of 11 rows" (`holdings.js:264`).

Correction: in `groups`, use "2 selected · 6 of 11 rows" when `o.noC` is set.

### R2-f3 · P2 · blocking · files.js:73, files.js:74, files.js:110

**The £12.40 difference is still invisible on three live approvals, the same fault as R1-f13.**

Evidence: R1-f13 put `openDiff()` on Ready's draft and sheet. A08 is also live, with no mention of the difference, on `a-draft` Expired (line 73), `a-draft` Denied (line 74) and `a-approve` Expired (line 110, printed by `files a a-approve expired web`). Expired says "The rows have not changed, so a fresh approval is enough", so the difference still holds. Option B's `b-decide` Expired shares `approveOf`. Lesson 25: a required label is checked on every screen that shows the thing.

Correction: add `openDiff()` to those three, and widen R1-f13's check to every state where A08 for 3 groups is live.

### R2-f4 · P2 · blocking · audit.js:210, audit.js:228, audit.js:115

**Following the new links from the expired approval opens a different record.**

Evidence: in Expired, `b-explore` selects "Statement import approval expired", and its lineage is the short trail for ISA statement, Oct 2026, draft revision 6. The new `paneLinks` then lead away from it:
- "Before and after" opens `b-compare` Expired: "Before: Ledger revision 210", "After: None, no commit started", "After reference ref_a3c1", and Two clocks for R-0210. That approval bound revision 213 (`files.js:98`), and a record with no after shows an after reference.
- "Read the record" opens `b-record` Expired: "Nothing here expires", then `aud_4c17`, `apr_52be`, "After: Ledger revision 211". That is R-0210's commit record.

R1-f6 fixed this mismatch beside the list; the links recreate it one press later (lesson 31).

Correction: give `b-compare` Expired its own rows (Before "Ledger revision 213", After "None, no commit started", no after reference, and drop R-0210's clocks or give the expired approval's own) and `b-record` Expired its own short record (`RECORD_X`: operation left unnamed as CT-03, target the approval, recorded 21:33, no commit, no after). Alternatively hide both links in Expired, which leaves that record unreadable, so the first is better.

### R2-f5 · P2 · blocking · audit.js:204, audit.js:181

**A lagging index is drawn as a third outcome that PH01-S04 does not allow.**

Evidence: PH01-S04 recovery: "If an index lags, the query falls back to authoritative manifest joins and returns the complete lineage, or reports INTEGRITY_INCOMPLETE rather than a partial answer." New line 204 says "This lineage was read from manifests at 11:12. A newer step may not show yet." Line 181 says the same of the list, and drops the newest row (`CH.slice(1)`). `paneFor` marks every step "stale". That is an answer that may be partial, read from the authoritative source, and labelled as doubtful (PH01-S04 lists the state as "Index lagging, with fallback to manifests").

Correction: say what the contract says: "Read from the manifests at 11:12, so this is complete to ledger revision 213. Anything after that pin is not part of this question." Show steps as `resolved` with a "From manifests, 11:12" verdict. Change line 181 to match, and keep the row. If the owner wants the softer wording, it goes to him as a question on PH01-S04, not into the design.

### R2-f6 · P2 · blocking · home.js:21, home.js:39

**Home's Expired state and the Approvals screen it opens disagree on the count and on what expired.**

Evidence: Home Expired says "4 decisions wait on you" and "Watch Barclays, Wed 08:14", tile "Watch Barclays expired Wed 08:14". The tile opens `aa-now` Expired (`approvals.js:214`): "Taiwan Semiconductor expired at 18:00" and `waiting(3, 'Next: Promote R2-HGB v4, Fri 18:00')`. In Home's Ready, Barclays has already expired (`approvals.js:97` and `:226` list it under "Cannot be approved"), so Home's Expired adds nothing new (lessons 27, 31; the state strip is R1-f9's fix).

Correction: make Home's Expired follow Approvals: "3 decisions wait on you. 1 incident not resolved." and "Taiwan Semiconductor expired at 18:00. It changed nothing." with the matching tile line. Lane a should settle the 18:00 stamp under an 11:40 freshness chip at the same time (see R2-f15).

### R2-f7 · P2 · blocking · home.js:38

**Home's Conflicting state drops the incident and the count from the first view on a phone.**

Evidence: every other known state carries `WAIT` in the banner; Conflicting says only "Settings changed while you read." On iPhone the only remaining signal of the incident is the eighth tile; the frame shows four tiles above the tab bar. R1-f10 fixed exactly this for Ready, and lesson 38 says risk in view means the first view. Approvals' Conflicting state has 3 waiting (`approvals.js:213`), so plain `WAIT` would be wrong.

Correction: `banner('warn', 'Settings changed while you read.', 'Settings v10 was written at 09:01, so a proposal built on v9 needs a new look. Nothing was applied. 3 decisions wait on you. 1 incident not resolved.', 'split')`, and run R1-f10's check across the states.

### R2-f8 · P2 · blocking · files.js:119

**"Approve both together" approves a preview that is never drawn.**

Evidence: `bothBox` says "The combined preview names every row before you approve", and its only button is a live A11 "Approve both together", on the same card. The card holds two lines: "Reverses all 9 rows" and "Its correction, drafted". It does not say which holding the 2 Nov sale was, or what its correction changes. The owner journey's button is "Review both together" (`holdings.js:277`), which is a step to a preview, not an approval. PH01-S18 requires exact approval, and every other approval in Files shows its rows beside the control (lesson 28).

Correction: this extends R1-f11 and undoes none of it. Add the sale's rows and the combined after-figures to `bothBox`, marked illustrative, so the approval sits beside what it binds, and keep A11. Name the sale's holding in `holdings.js` too if the owner journey is reopened; otherwise tag the gap in the note.

### R2-f9 · P2 · non-blocking · audit.js:111, audit.js:159, audit.js:192, audit.js:203, audit.js:224

**In the Failed state, one record is both vouched for and not vouched for.**

Evidence: range 28 to 30 Oct. `b-record`: "This record is outside the affected range... so its digest still matches" for `aud_4c17`. `b-lineage`, for the same record: "No step below is vouched for", and step 11, `aud_4c17`, chip "Not vouched for". `b-gaps`: Commits "R-0212, R-0211 and R-0210 finished whole" is "Not vouched for", though all three (24, 21, 6 Oct) predate the range, while Delivery on the same three keeps its plain chip (lessons 27, 39). The reason differs: a lineage query is incomplete as a whole, while one record's digest can be sound.

Correction: keep R1-f7's lineage wording. Change line 111 to "This record's own digest still matches: it was written before the affected range. A lineage that includes it stays incomplete, because later steps read that range." Say the same at line 224. In `b-gaps`, mark what the check actually cannot say: leave the three commits as checked and add one row for the affected range, or treat Commits and Delivery alike.

### R2-f10 · P2 · non-blocking · audit.js:272, audit.js:190

**Full lineage keeps "Open the source in Files" where there is no source, and Empty has no not_found.**

Evidence:
- Empty: `audit b b-lineage empty web` prints "Choose a record to see its lineage." then "Open the source in Files". The line was edited this round to hide the button only in Expired.
- MP-151 (PH06-S15) lists `not_found`. Option A's `a-follow` draws it; the picked Explorer's full-screen lineage does not. `linWhy` has no `empty` entry, and "Choose a record" is copy for the pane beside a list, not for a screen reached by a link.
- Partial: the source is "Evidence unavailable · tombstone recorded", and the button still shows. It opens Files, where `a-keep` Partial lists "ISA statement, September, PDF · kept to Oct 2028 · R-0210" as kept (the row added at `files.js:139`). Files' deleted example is ISA statement, January 2024 (lesson 31).

Correction: add `linWhy.empty` with `stateCard('search', 'not_found', 'This link points at nothing MP has recorded. No step is guessed.', bs('Back to Audit'))`. Hide the button in Empty and Partial. In Partial, draw the worked deletion on the file Files shows deleted, or say in the screen note that this state assumes R-0210's original was deleted.

### R2-f11 · P2 · non-blocking · audit.js:206, audit.js:195

**Superseded lineage gives no pointer to its successor.**

Evidence: PH06-S15 recovery: "A link to a superseded record opens it with a pointer to its successor." `b-lineage` Conflicting says "A newer record replaced this one", with the step "A newer record exists". There is no id and no control. Option A's `a-answer` has "Read the newer record", and `b-record` has "Superseded by aud_5a02". Line 206 is new this round.

Correction: add `bs('Read the newer record', 'tinted', 'layers')` to `b-lineage` Conflicting, and put `aud_5a02` in the Correction step.

### R2-f12 · P2 · non-blocking · files.js:128, files.js:118

**"Nothing open" sits above the receipt that carries the open £12.40.**

Evidence: `files a a-fix empty web` prints "Nothing open. Your last difference was resolved by you on 24 Oct", then R-0213 "Ledger revision 213 → 214", "ISA cash £4,142.83". `openDiff` says that difference "stays visible on the receipt until you fix it or resolve it with a reason". R-0213 is later than 24 Oct, and ISA cash is the figure that differs from the statement. So "last" and "Nothing open" cannot both hold (lesson 29).

Correction: in Empty, drop `receipt()`, or use a receipt that had no difference. Alternatively resolve on a date after the commit and name both differences. The first is the smallest.

### R2-f13 · P2 · non-blocking · files.js:151, files.js:142

**A file being deleted is also listed as kept.**

Evidence: `files a a-keep partial web` lists "Broker statement, Sep 2026, Version 3 · deletion in progress" first, then "Broker statement, Sep 2026, PDF · kept to Sep 2028", under "8 originals" (lesson 29). This state was not rewritten when `origList` was changed this round.

Correction: `origList` takes the name of a row to leave out when `o.first` replaces it. The count stays 8 while the deletion is unfinished.

### R2-f14 · P3 · blocking · home.js:43

**"account account recovery" on every Home frame.**

Evidence: `home b b-home default iphone` prints "and account account recovery works anywhere." It renders in both options, four devices, ten states, in the sentence that states the owner's phone rule. No check caught it.

Correction: remove one word, and add a doubled-word check on rendered text to `design_admin_facts.mjs` the same day (global rule: a fault a command could have caught becomes a gate). Marked blocking only because it costs one word and this is the sentence the owner reads before UX approval.

### R2-f15 · P3 · non-blocking · audit.js:173, files.js:236, files.js:42

**21:33 appears in frames stamped 11:40, and the explaining note is missing where it matters.**

Evidence: the note on `a-approve` says the times are "the evening the owner journeys draw, later than admin's 11:40". `b-explore` Expired puts "Statement import approval expired, Nobody · 21:33" at the top of a newest-first list, above "Wed 11:22", under "Records current · 11:40", with no day and no note. `a-queue` and `a-draft` Expired have the same stamp and no note (lesson 26).

Correction: on Expired, name the day as Tue and place the row in date order, between Wed 08:14 and Tue 21:20. That reading fits: nothing committed, ledger still 213. Scope the two notes to the states that are truly later.

### R2-f16 · P3 · non-blocking · files.js:45, files.js:32

**"Held apart 2" against one row under Held apart.**

Evidence: the rail, changed this round from 1 to 2, sits beside a Held apart section with one row. The second is `isa-2019-to-2026.pdf`, under "3 files not taken in", whose own row says "Held apart" (lesson 37). "Not taken in" and "held apart" are also different claims.

Correction: move the oversized file into Held apart and retitle the other section "2 files not taken in".

### R2-f17 · P3 · non-blocking · home.js:11, home.js:33

**"Nothing waits on you" beside a line waiting on the owner's own purchase.**

Evidence: Home Empty keeps "2 usable paths · 1 waiting on MP-179". MP-179 is "Join the Apple Developer Program and lift the on-device passkey bar", and the decision log says the bar lifts on the owner's purchase. A bare ticket key also tells the screen's reader nothing (lesson 39).

Correction: in `LINES.empty`, and at the source if lane s agrees: "2 usable paths · passkey waits on the Developer Program".

### R2-f18 · P3 · non-blocking · home.js:40, audit.js:197, audit.js:208

**A step-up the inventory marks open is stated as settled, with no CT-01 tag.**

Evidence: A02 is `step_up: open`, and most inventory acts are too. `b-lineage` Denied says "Opening the original is the part that needs more", followed by "The server checks a fresh sign-in", with chip `permission_denied` and no tag; Option A's `a-follow` does carry `proposed('CT-01')`. Home Denied says flatly "Changing something does" (A58 needs none, and many are open) (lesson 36).

Correction: add `proposed('CT-01')` to `paneFor` Denied. In Home Denied say "Some changes do, and each says so before you press it", with the same tag.

### R2-f19 · P3 · non-blocking · files.js:111, audit.js:216

**Two small leftovers from this round's edits.**

Evidence:
- `a-approve` Denied on a phone: dropping "Sign in again" on phones left a sheet saying "Your sign-in is too old for this step" with no control, no "Not now", and no "Changes happen on iPad or desktop", because `frame` writes that only when a `data-phone-off` control is present.
- `b-filter` keeps a "Which clock" control, while its note says the fields are AuditQuery's. The contract has `kind`, `resource_refs`, `pinned_revision`, `from_date`, `to_date` and `cursor`, and no clock. `economic_history` already asks by economic date. R1-f4's class of fault, and `recorded_changes` plus Economic date has no query behind it.

Correction: on phones give that sheet `bs('Not now')` and one line, "Approving happens on iPad or desktop." Remove `clockBar()` from `filterSheet`.

---

## Joins for other lanes

- Lane a: `approvals.js:214` stamps "expired at 18:00" under "Records current · 11:40". Settle it with R2-f6.
- Lane s: R2-f1 adds a row to `permissions.json` and changes coverage counts. R2-f17 touches `identity.js:43` and `:75` if the wording moves at the source. R2-f14's gate goes in `design_admin_facts.mjs`.
- Lesson candidate: a fix made in one state is checked in every state where the same control is live (R2-f3, R2-f7), and a new link is followed in every state it shows in (R2-f4, R2-f10).
