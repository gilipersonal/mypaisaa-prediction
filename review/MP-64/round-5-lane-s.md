# MP-64 review round 5, lane s

Snapshot `eacda92`, scope `git diff 1fd5ff6..eacda92` in my lane and its direct joins. Read-only: nothing edited, and Jira was only read (MP-64 comments, MP-164).

Counts: 12 findings, 5 blocking. P0 0, P1 1, P2 6, P3 5.

Checked and clean, so not reported: `build.py`, `README.md`, `permissions.json`, `decision.md`'s counts (110 screens, 82 actions, 19 refused all hold), the gate scripts and `verify.yml` did not change in this range. The `rec-apple-testing` receipt matches `confluence.json` and the page's sha256. MP-164's live description carries the new wording. The expired chip's 18:05 agrees with the frame and with Runs. On the iPhone, Conflicting a-detail shows Production recorded lost and a live Acknowledge in the first view (Acknowledge at 682 of 844 px). The conflict story (Two sources disagree on HSBC) agrees between Incidents and Runs.

### R5-s1 · P1 · blocking · TECH-STACK.md:135

**The wording R4-s5 removed survives in a root document and in a drawing, and the root document wins (rules: plan-sync 1, lessons 4, 21, 22, 49).**

Evidence:
- The owner's answer on what lifts the bar: "The purchase (Recommended)" (decision log, Admin journeys).
- `TECH-STACK.md:135`: "phone notifications through the web app's Web Push until the owner says when".
- `docs/diagrams/mp-quality-2026-11-02/lucid_spec.py:519` and `:542`, and `spec.json`: "No TestFlight, Apple push or Sign in with Apple until the owner says when".
- That Lucid page is page 4, which `build_pages.py:970` embeds in `rec-apple-testing`. So the page just republished as version 7 says "until the Developer Program is bought (MP-179)" in its banner and "until the owner says when" in its own drawing.
- The R4-s5 check (`tests/admin_facts/c.mjs`) reads two files for one phrase, so it passes. `git grep "says when"` finds these at once.
- `plan-sync.md` rule 1 makes the root docs win over the stories, so as it stands the old rule outranks the fix.
- Related, softer: `docs/market-agent/index.html:1777`, "only when the owner says to join".

Correction:
- Change `TECH-STACK.md:135` to "until the Developer Program is bought (MP-179)".
- Change both `lucid_spec.py` strings, regenerate `spec.json`, then re-import and re-export page 4 so the manifest hashes match (lesson 22). This needs the owner's own yes, as does republishing `rec-apple-testing` if its image changes, with a read-back (lesson 19).
- Change `docs/market-agent/index.html:1777` and resync that design.
- Add the phrase to `docs/planning/retired-facts.json` (lesson 21), scoped to the Apple sentence so that unrelated uses of "owner says" do not trip it, and widen R4-s5 to the repo rather than two named files (lesson 49).

### R5-s2 · P2 · blocking · docs/design/admin/src/shell.js:99

**On a phone, the worst incident's screen says changes happen elsewhere, directly above a live Acknowledge (lessons 7, 27; the owner's "Yes, acknowledge only (Recommended)").**

Evidence: R4-s1 put a live A40 and a phone-off A75 on the same screen for the first time. `offNote` fires on any `data-phone-off`, and in Incidents its text is unconditional. Conflicting `a-detail` on iPhone reads, in order: "Older version · a newer record exists", "Changes happen on iPad or desktop.", then "Production recorded lost" and a primary "Acknowledge". The same applies to `b-escalate` and phone web. Identity already has the right form: "Account recovery works here. Other changes happen on iPad or desktop."

Correction: when the journey is incidents and the screen also holds a live A40, the strip reads "Acknowledging works here. Other changes happen on iPad or desktop." Add a check for every phone view where a live A40 and `data-phone-off` coexist.

### R5-s3 · P2 · blocking · docs/design/admin/src/journeys/identity.js:159

**Phone web gives two answers for what unblocks recovery, and the new Open row gives the third reading (lessons 7, 27, 36).**

Evidence: the screen note, the a-enrol screen and the R3-s15 check all say Phone web is held "until you answer whether a browser passkey counts", which is a question, not the purchase. But:
- `noEnd()` has no device branch, so `a-lost` on phone web, in default, empty, partial, error, stale, offline, conflict and expired, says "No record says how recovery ends on this device until the Developer Program is bought (MP-179)."
- The new Open row, `shell.js:299`, says "Drawn as barred until the purchase." for this exact question.

If the owner bought the Program, nothing on Phone web would change until he answered, so the page tells him the wrong thing on a recovery screen of the picked option.

Correction: `noEnd(ctx)` on pwa reads "No record says how recovery ends on this device until you answer whether a browser passkey counts." with the same tags. Open row second cell: "Drawn as barred until you answer." Add a check that no pwa view of `a-lost` or `b-lost` names the purchase as the thing that ends this.

### R5-s4 · P2 · blocking · docs/design/admin/src/journeys/incidents.js:178

**The R4-s6 fix conditions the sentence and leaves the status, so the card still answers the open question (lessons 36, 39, 47).**

Evidence: the R4-s6 finding was that the card says the request is inside the allowlist and also that nobody knows. In default the condition now sits on "Your approval", but the chip beside it is the fact "Auto-retrying" (`:178`), repeated as the rail row "Replay · Auto-retrying" on `a-detail` (`:413`).
- Nothing auto-retries unless the question is already answered yes. A status should say what the system knows.
- Empty is worse (`:183`): the chip reads "Replayed" and the banner "The last one finished: replayed", a past act with no approval, and the same card says "Your approval: Not needed if a late price counts as a missed collection" and "Whether a late price counts as a missed collection is open."
- A request that already ran cannot have conditional authority. The page draws code having done something whose authority it says is undecided, and nothing says the state is illustrative.

Correction:
- Default chip and rail row: "Auto-retry if CT-14 allows".
- Empty "Your approval" cell: "None asked. Drawn as if CT-14 counts this", with Proposed · CT-14 kept.
- Option B: `:317` "code is recovering" and `:340`, to the same words.
- Extend R4-s6 to refuse a bare "Auto-retrying" in Incidents.

### R5-s5 · P2 · blocking · docs/design/admin/src/journeys/incidents.js:165

**R4-s10 added a row that the banner above it now contradicts (lessons 39, 47).**

Evidence: `a-evidence` Partial banner: "run_8cf7 and its collect job are not read, which is unknown, not clear. The other links opened." The list below now shows "Trace · Not read, it links from run_8cf7", so one of "the other links" did not open. The same delta makes run_8bf3, Monday's run, read "Result Unknown · HSBC Not read" in `twoRuns`, which the banner does not name either. The same rows sit under `b-escalate`'s rail.

Correction: banner reads "run_8cf7, its collect job and its trace are not read, and neither is Monday's run_8bf3, which is unknown, not clear. The alert, the source and the model link opened." Add to R4-s10 a check that the banner names Trace.

### R5-s6 · P2 · non-blocking · docs/design/admin/src/shell.js:302

**The five open questions added in this range reached no record that could close them (lessons 20, 36; plan-sync rule 3; jira-flow habit 4).**

Evidence: `shell.js:298` to `:302` add five questions. `gap-register.json` and the stories did not change in this range. CT-14's `decision_needed` asks for classes, allowlist, limits, RPO/RTO and the escalation path, and does not ask how production comes to be recorded lost or whether a late price is a missed collection. CT-17 and PL-09 do not ask whether a browser passkey counts. MP-64's latest comment, "Still open", names none of the five. The Yahoo row names no id at all ("It needs its own record"), and no issue exists for it. So each label `Proposed · CT-14` points at a record that could close without anyone answering.

Correction: add the questions to the CT-14, CT-17 and PL-09 records with their stories, create an issue for the Yahoo question and cite it in the row, and name the five on MP-64.

### R5-s7 · P2 · non-blocking · review/MP-64/state.json (round 4, `publication`)

**The wording sync's external writes have no recorded yes, and the records still say they are waiting (rule: jira-flow gate, "each scope separately"; habit 3).**

Evidence: commit `eacda92` records `rec-apple-testing` version 7 published, and MP-164's description carries the new text (updated 22:02). But round 4's `publication` still says those writes "wait on the owner's yes for R4-s5"; MP-64's last comment (22:00) says they "need the owner's yes"; and the decision log records "Sync both" for MP-164, Confluence PH-07 and MP-163 only, with nothing for MP-167, MP-168 or `rec-apple-testing`. A yes may have been given in chat. I cannot see one in any record, so I do not claim it was missing.

Correction: record the owner's words for that scope in the decision log and the state file, and comment on MP-64 with what was synced and read back.

### R5-s8 · P3 · non-blocking · docs/design/admin/src/journeys/identity.js:180

**The revoke sentence left the one card about the passkey at stake (lesson 7).** R4-s4's title was that the sentence was missing "where a passkey is actually at stake". The fix took it out of `macCard`, which says "It holds the only passkey that counts today" and carries a live "Revoke Mac, Safari", and relies on step 2 in another card. R4-s4's page-level test passes either way. On a phone the two cards are a long scroll apart.

Correction: add `rvNote()` to `macCard`, and test it in that card's own markup.

### R5-s9 · P3 · non-blocking · docs/design/admin/src/journeys/incidents.js:340

**Unpicked option. `moreRow` always says "Auto-retrying" for inc_0012 (lesson 31).** R4-s1 now draws it inside the Conflicting `b-escalate` card for inc_0012, where the Replay it opens is chipped "Refused". It is also wrong in Partial (Held), Expired (Expired) and Denied (Awaiting you).

Correction: use `plain(reqChip(ctx))`, as `a-detail`'s rail does.

### R5-s10 · P3 · non-blocking · docs/design/admin/src/journeys/incidents.js:91

**Two boxes with one name.** Conflicting `a-detail` and `b-escalate` on iPad and desktop now draw two textareas, both with `aria-label="Recorded resolution"`, one for inc_0014 and one for inc_0012. The second sits above a refused control, so it takes words that cannot be sent.

Correction: pass the incident id into `field()` for the label, and omit the box where the control is held for conflict, keeping inc_0014's box as R4-s1 requires.

### R5-s11 · P3 · non-blocking · docs/design/admin/src/journeys/incidents.js:409

**The screen note is out of date.** `a-detail`'s note says "detect, acknowledge, mitigate, resolve. Failed shows inc_0013". Conflicting now shows inc_0014, whose timeline has a switch and no mitigate step.

Correction: add "Conflicting shows inc_0014, with a switch in place of mitigate."

### R5-s12 · P3 · non-blocking · docs/design/reviews/MP-64/decision.md:44

**A maker's choice changed without its line changing.** `decision.md` lists "Admin's clock is Wed 4 Nov, 11:40 London" for the owner to accept, and `shell.js:68` now puts Expired at 18:05 on every journey.

Correction: add "Expired reads Wed 18:05, the evening the owner journeys' expiries fall in" to that line.
