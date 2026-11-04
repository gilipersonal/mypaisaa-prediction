# MP-64 review round 3, lane s

Snapshot `af66cc0`, scope `git diff 0d1ab4e..af66cc0` and direct joins. HEAD `0802089` differs from it only in `review/MP-64/`. Read-only; the only files written are in this scratch folder.

**Counts: 16 findings. 10 blocking (1 P1, 9 P2). 6 non-blocking (2 P2, 4 P3).** No P0. No finding proposes undoing a ledger entry: R3-s1 keeps R2-s1 (the iPhone stays revocable) and R3-s7 keeps R2-s10 (A46 stays off on iPad).

Clean in this lane: `decision.md` counts (110 screens, each option's count, 80 actions, 19 refusals) match the page; the owner's answers in the decision log match the brief; A77 to A80 match their stories (PH01-S13, PH04-S06, PH05-S03, PH05-S08); `plan_sync check` is clean; every blocking finding of rounds 1 and 2 has a ledger row and a check; Compare's cleared pick, theme repaint and focus hold. `build.py`, `README.md` and the trace and gap-register rows did not change in this delta.

### R3-s1 · P1 · blocking · docs/design/admin/src/journeys/identity.js:238 (also :37, :306, :326)

**The page now says a revoke leaves the lost device's passkey alone. That is unrecorded, defeats the story's purpose, and contradicts the recovery screens beside it.**

Evidence:
- Round 2 added "It touches no passkey." to the picked `a-devices` card (:238), and "Revoking ends sessions and touches no passkey." to both screen notes (:306, :326). Read plainly, a lost Mac keeps a working credential after you revoke it.
- PH02-S02 (MP-87): "so that losing a phone neither locks me out nor lets someone else in", and "revokes the lost device and enrols a replacement passkey". It says what a revoke ends (refresh tokens and live streams) and says nothing of a passkey surviving. CT-17 leaves "passkey scope" and the recovery inventory open.
- Identity's own recovery needs the opposite. `macCard` (:178): the Mac "holds the only passkey that counts today... revoke it here", then `noEnd` (:157): "you stay on one path". That is only true if the revoked Mac's passkey stops counting. Step 3 says "replacement".
- Lesson 23: a mechanism the maker adds is marked proposed. No Proposed tag sits on the sentence's claim; the CT-17 chip on the card is about revocation time. The sentence was added to explain why the iPhone may be revoked, and the fix needs no such claim.

Correction: keep every Revoke control. Delete the sentence at :37, :238, :306 and :326. Where the reason is wanted, say "Revoking needs no iPhone passkey". Add one line tagged `proposed('CT-17')`: "What a revoke does to a passkey held on that device is not recorded." Add the question to `OPEN` in `shell.js`, and on PH02-S02/MP-87 as an open question for the owner (`plan-sync.md` rule 3). Hold it with a check that no identity view says "touches no passkey".

### R3-s2 · P2 · blocking · docs/design/admin/src/journeys/incidents.js:149, :398

**Picked Evidence no longer compares anything, its note says it does, and "7 of 7 priced" sits beside an unpriced HSBC.**

Evidence:
- `twoRuns` was rewritten as Tuesday UK against Tuesday US. Their rows share only Result, and both read Succeeded. The note at :398 still claims "so a change shows as a change". The Coverage page sends MP-64's "investigation and comparison" here (`covers.compare: 'a-evidence'`). A US run says nothing about a UK listing's late price, so the comparator inc_0012 needs is the previous UK run.
- The card reads, side by side, "HSBC late · last price 14:10" and "Market US... 7 of 7 priced". In the owner journeys 7 is the whole portfolio across US, UK and India (`docs/design/journeys/src/journeys/home.js:150`), and HSBC late makes it 6: `home.js:126` "6 of 7 priced". `XLON` and `XNSE` rows are in that 7 (`home.js:8`). Lessons 26, 27 and 37.

Correction: compare two UK runs, keeping `run_8cf7` and adding a Monday UK run with its own id, in `incidents.js` and `runs.js` (`ukr`, `LIST`). Show Monday's HSBC as priced to the 16:35 close and Tuesday's as last price 14:10, so the change is the row. Take the US run off this card. Lane m should confirm what `7 of 7` means on `run_8d02` in `runs.js:36` and :10, where the same figure is printed against a run labelled US.

### R3-s3 · P2 · blocking · docs/design/admin/src/journeys/incidents.js:149, :50

**Following the evidence link into Runs gives a different answer in Partial and Conflicting (lessons 27, 31).**

Evidence, same state chip on both sides:
- Partial. Incidents: "Runs, sources and alerts answered", `run_8cf7` Result "Succeeded", Found "HSBC late". Runs `a-clock`: "The UK record did not, so it shows unknown", `run_8cf7 · UK · not read`, Unknown, every UK step "Not read". Round 2 moved inc_0012 onto `run_8cf7`, which created this.
- Conflicting. Incidents `twoRuns` and `still`: `run_8d02`, Succeeded, "7 of 7 priced", "run_8d02 · succeeded". Runs `a-clock`: "run_8d02 says succeeded, and job_3e9a says reconcile_required... It counts as neither until the reconciler settles it", "Tue held", and `b-list` "Waiting on job".

Correction: in Partial, draw `run_8cf7` as Not read and Unknown in `evRows` and `twoRuns`, and change T_LIST.partial to say the UK run record did not answer; or make Runs' Partial lose the same source as Incidents. In Conflicting, `twoRuns` and `still` read `reconcile_required`, counted as neither. If R3-s2 takes the US run off the card, only `still` needs that change. Add a check that walks both pairs.

### R3-s4 · P2 · blocking · docs/design/admin/src/journeys/incidents.js:90, :138, :159

**In Expired, one incident's screens say both that HSBC prices are back from Yahoo and that they cannot arrive (lesson 46).**

Evidence:
- `a-detail` expired: the box holds "HSBC prices are back from Yahoo." and the banner says "Your words stay in the box."
- `a-evidence` expired, one tap away: "Source access expired. No new HSBC price arrives until that access is back", Source "Yahoo · HSBA · XLON · access expired".
- Both come from round 2's Twelve Data to Yahoo edit. No record gives Yahoo a key, account or term that could expire (`TECH-STACK.md:130`, `docs/planning/source-rights-2026-11-02/README.md:18`), so the expired-access story, which PH08-S05 does name, needs a source that has access. Twelve Data is the one with credentials, and it does not carry this incident.

Correction: pick one story for inc_0012 in Expired. Smallest: drop the access-expired override at :138 and rewrite T_EV.expired to the expired replay request that a-list and a-replay already tell, so the HSBC price stays late for a named reason. If expired source access must be drawn, give it to a Twelve Data listing in its own row. Hold it with a check that no incidents view in Expired pairs "are back" with "No new HSBC price".

### R3-s5 · P2 · blocking · docs/design/admin/src/journeys/incidents.js:254 (and :53, :49)

**In Conflicting, Recovery says production is recorded lost, and the incident list has never heard of it (lesson 46).**

Evidence:
- `a-recovery` conflict: "Production is recorded lost, and a restored copy waits", with a live Approve this switch.
- `a-list` conflict: one incident, inc_0012 reopened. By class: "Job failure None open", "System security None open". Still watched: run "succeeded", Restore "Passed". `a-detail`'s rail: "Last restore passed Sun 1 Nov".
- PH08-S05: "every alert to open or join an incident". The losing of production is the largest fault the page draws, and in this state it has no incident, while "Silence is not a sign that nothing is wrong" sits on the list.
- The screen's own caveat says how production came to be lost is unrecorded. That covers the mechanism, not the absence of a record in the list.

Correction: in Conflicting, add a second incident row in `incRows`, `classes` and `still`, for example inc_0014 "Production recorded lost", labelled proposed CT-14, and make Admin home's incident count agree. Alternatively, give the switch a named sub-state, so a-recovery's Conflicting draws only the drift and the switch is labelled "drawn for the case production is lost". R1-s3's rule that the switch exists only when production is lost and a copy waits must hold either way.

### R3-s6 · P2 · blocking · docs/design/admin/src/shell.js:312

**The page's open-questions table still says Mark as mitigated has no control.**

Evidence: `['Who marks an incident mitigated? (CT-14)', 'Labelled proposed, with no control.']`. `incidents.js` `mitTool` draws `act('A74', 'Mark as mitigated')`, and round 2 removed `control: named` from A74 for that reason. R2-s3's finding was that records disagreed on this control. Its check (`tests/admin_facts/c.mjs:11`) reads only `permissions.json`, so the fix left this record behind (lessons 3, 4).

Correction: change the cell to "Labelled proposed, drawn as a control for you to correct or remove." Widen R2-s3's check so the State inventory text lacks "with no control" beside this question.

### R3-s7 · P2 · blocking · docs/design/admin/src/journeys/identity.js:124 and docs/design/admin/permissions.json:551-560

**Link Google sends a phone to the iPad, and the iPad sends it to the Mac (lessons 28, 31).**

Evidence: `a-link` on iPhone and phone web: "Link Google: on iPad or desktop", from `act()`. `a-link` on iPad: "Link Google from your Mac. The proof needs your Mac passkey." The permission inventory's A46 "On a phone" cell prints "iPad or desktop", because A46 has no `phone_note`. A48 has one ("Mac only while MP-164 holds"). The inventory is a Done-when of MP-64.

Correction: add `"phone_note": "Mac only: the proof needs your Mac passkey"` to A46. Have `act()` print `p.phone_note` when set, in place of "on iPad or desktop", so `Link Google: Mac only...` matches the iPad line. Add a check that A46's phone text and iPad text name the same device.

### R3-s8 · P2 · blocking · scripts/design_admin_facts.mjs:93 (rules at :71, :72)

**The gate's two new rules are not proved. Both can be deleted and the selftest still reads 13 of 13 (lessons 8, 9).**

Evidence: I ran mutated copies in scratch (`fx/scripts/`).
- Rule at :71 (named act drawn) removed: 13 of 13.
- Rule at :72 (drawn in a journey its row does not list) removed: 13 of 13.
- Both removed: 13 of 13.

The case `a named act drawn` expects only the substring `A63`, which any failure naming A63 satisfies. The mutation also draws A63 live on a phone in another journey, so a third, older rule prints `A63`. Rule :72 has no case of its own. The brief's "selftest 13 of 13" therefore says nothing about either rule.

Correction: expect `is marked named, and a screen draws it`, with a mutation drawing A63 on `models` web only. Add a case for `its row does not list that journey`, drawing a non-named act in a journey outside its row, on web only. Re-run the deletions: each must now fail.

### R3-s9 · P2 · blocking · docs/planning/story-readiness-2026-11-03/stories/PH-07.json:595

**The sentence R2-s7 fixed in MP-164 survives in MP-163, one story along, and on the published page (lessons 3, 4, 44).**

Evidence: PH07-S09 (MP-163): "Capabilities that need the paid Apple Developer Program are marked later until the owner says to join". The owner said "I'll join the Developer Program", and what lifts the bar is "The purchase (Recommended)". Read literally, this condition has now been met with nothing bought, which is exactly the fault R2-s7 closed. The same sentence is in `docs/confluence/pages/ph-07.html`, republished in this delta at version 5. R2-s7's check reads only the longer phrase with "the Developer Program", so it misses this form. Separately, `decision-log.md:291` and `decision.md:18` still say "MP-164 says" and quote the replaced text in the present tense.

Correction: PH-07.json:595 to "until the Developer Program is bought (MP-179)". Same change in Jira MP-163's description, and regenerate and republish PH-07, reading back, each with its own yes. Widen the R2-s7 check to `/says to join/`. Change both decision records to "MP-164 said".

### R3-s10 · P2 · blocking · docs/design/admin/src/journeys/identity.js:169 (and :163, :182)

**The new clause "if the lost one held a passkey" removes the last step for the flow's own target, and nothing else ends the recovery (lessons 23, 45).**

Evidence:
- Ready on desktop, iPhone and phone web: the lost device is iPad, which reads "Active 2 h ago · Google". Step 3 now says enrol "if the lost one held a passkey", so it does not apply to the device on screen. The only other controls are Revoke and Cancel, so the flow draws no way to finish.
- Partial, same target: "Revoke iPad, done" then "Enrol a replacement passkey. Not confirmed yet", and "the new passkey is not confirmed yet". That is the step Ready just excused.
- PH02-S02 states it unconditionally: "revokes the lost device and enrols a replacement passkey". The condition is the maker's, unmarked.

Correction: smallest is to restore the story: "On a device you control. Each step is on your audit trail." If the condition is wanted, mark it `proposed('CT-17')`, draw a Finish for a device that held none, and make Partial's target a device that held a passkey.

### R3-s11 · P2 · non-blocking · docs/design/admin/src/journeys/identity.js:38 (option B only)

**On iPad in Expired, `b-device` and `b-revoke` say the iPhone expired, while the list one step back says it is active.**

Evidence: changing `gone` for iPad from Phone web to iPhone left `devRows`' expired rows pinned to Phone web and iPad. `b-devices` expired on iPad: "Phone web needs you", iPhone "Active 40 min ago". `b-device` on iPad: "This device has run out", head chip Expired, "App build Expired · reinstall from your Mac", beside "Last active 40 min ago". Unpicked, so non-blocking. It is the same kind of slip as lesson 44.

Correction: `deviceCard`, `buildRow`, `offlineRow`, `T_DEV.expired` and `sideBySide` apply Expired only when `n` is expired in `devRows`, or `gone` in Expired on iPad returns Phone web.

### R3-s12 · P3 · non-blocking · docs/design/admin/src/journeys/identity.js:35, :210

**One iPhone, two sign-in answers.** The list row reads "Active 40 min ago · Passkey", on picked `a-devices` too, with CT-17 and PL-09 chips and no MP-179. `b-device` on iPad now reads "Signed in with: Not settled · MP-179". While MP-164 bars on-device passkeys, the row states a sign-in that cannot have happened.

Correction: in `devRows`, label the iPhone row with `WAITING()`, as the path row does, or show its sub as "Active 40 min ago · not settled".

### R3-s13 · P2 · non-blocking · docs/design/admin/src/journeys/incidents.js:124-125, :398

**Round 2 removed the words "by id" rather than drawing the ids.** PH08-S05: "Each incident links alert, run, source and model evidence by id." In every non-failed state, Job reads "UK collect · found no newer price" and Trace "Linked from run_8cf7", replacing `job_3e9a` and `tr_51c2`, which were correctly moved off this incident. Alert and Source show no id in any state. The note, the rail and the section title dropped "by id", while `T_EV.loading` still says "Reading the linked records, by id." Non-blocking because it is a later story's acceptance, not MP-64's, and the run link keeps its id.

Correction: mint illustrative ids for the UK job, its trace, the alert and the source record, and restore "by id".

### R3-s14 · P3 · non-blocking · docs/design/admin/src/shell.js:434, :205

**A changed pick stops counting after a reload until Compare is opened again (lesson 35).** Pressed in Chrome: changed Audit to A on `#compare`, reloaded on `#files`, opened Audit. It opened `#audit.b`, with no "Changed in Compare, not recorded" chip, although `mp64-picks` held `audit: a`. After opening Compare once, the same press opened `#audit.a` with the chip. `sum.keep` is built only in `showCompare` (:384). Press's lesson-35 walk reloads on Compare, so it misses this.

Correction: build `sum.keep`'s picks in `J.start`, before `pickedOption` first runs, and add the press.

### R3-s15 · P3 · non-blocking · docs/design/admin/src/journeys/identity.js:299

**The `a-enrol` note over-reads the owner's answer (lesson 42).** It says iPhone, iPad and phone web say why not "until the Developer Program is bought (MP-179)". Round 2 dropped "and CT-17 and PL-09 are answered". Phone web's stated reason is different ("until you answer", R2-s6 holds it), and "The purchase" answered MP-164's bar only. The screens below still carry CT-17 and PL-09.

Correction: "iPhone and iPad until the Developer Program is bought (MP-179), with CT-17 and PL-09 still open; phone web until you answer whether a browser passkey counts."

### R3-s16 · P3 · non-blocking · docs/design/admin/src/journeys/incidents.js:165, :382

**Two labels did not follow the move to the UK run and Yahoo.**
- `WHY12` calls inc_0012 a "missed collection", while Evidence says the job "found no newer price" and the run Succeeded, and Runs says "Collect found no newer price". Nothing was missed (lesson 39). It also matters to the allowlist, which permits re-running a missed collection.
- `covers.cost` tells the Coverage page "A replay spends market data credits from the 10 a minute", while Ready's replay says "UK listings read Yahoo, not these credits". Option B's cell at :430 says the same.

Correction: reason "late price, no newer price found", with an open note on whether that is inside the allowlist (CT-14). Cover text "A replay on a Twelve Data listing spends...; one on a Yahoo listing spends no credits".
