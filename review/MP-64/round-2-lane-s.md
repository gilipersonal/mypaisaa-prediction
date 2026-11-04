# MP-64 round 2, lane s

Snapshot `0d1ab4e`, delta from `6705fc1`. Read-only. Scratch files are in this folder.

Counts: 14 findings. P0 0, P1 3, P2 7, P3 4. Blocking 7, non-blocking 7.

Nothing here proposes undoing a fixed finding. Where a fix sits next to a check, the finding says so.

### R2-s1 · P1 · blocking · docs/design/admin/src/journeys/identity.js:38

**A lost iPhone cannot be revoked anywhere in Identity, and the page says so as a rule.**

Evidence:
- PH02-S02 (MP-87): "the power to revoke any session or device, so that losing a phone neither locks me out nor lets someone else in."
- `gone()` returns only iPad or Phone web. `lostTargets()` (`:156`) adds only Mac, iPad and Phone web.
- On `identity a a-devices default web`, the iPhone row is a plain row, shown as "iPhone Active 40 min ago · Passkey". The only control is "Revoke iPad".
- `a-lost` empty on the web offers "Revoke iPad" and "Revoke Phone web". No state on any device offers "Revoke iPhone".
- The notes at `:305` and `:325` state it outright: "The revoke target is never the device in your hand, and never the iPhone."
- The comment at `:37` gives the reason as not building on the iPhone passkey. Ending an iPhone session does not touch a passkey, and A49 is "Revoke a session or device".
- The owner journey disagrees. Privacy's `target` (`docs/design/journeys/src/journeys/privacy.js:167`) is `ctx.kind === 'ipad' ? 'iPhone' : 'iPad'`, so Privacy revokes the iPhone from an iPad. No OPEN row records the difference (lessons 27, 31).
- Side effect: the only lost device drawn in the default flow is one that signs in with Google, so step 3, "Enrol a replacement passkey", replaces nothing that was lost.

Correction:
- Make the iPhone a revoke target wherever it is not in your hand: an openable row in `devRows`, and a "Revoke iPhone" entry in `lostTargets` and in `a-lost` on web and iPad. Revoking touches sessions only, so nothing builds on the passkey row.
- Reword the notes at `:37`, `:305` and `:325`.
- Add a fact to `tests/admin_facts/s.mjs` that a live A49 labelled "Revoke iPhone" is drawn on a device other than the iPhone.

### R2-s2 · P1 · blocking · docs/design/admin/src/journeys/incidents.js:126

**inc_0012 names the wrong source and the wrong run, so the provenance trail disagrees with Runs and every owner journey.**

Evidence:
- `EV.source` is "Twelve Data · HSBA · XLON". The recorded resolution reads "HSBC prices are back from Twelve Data" (`:90`, `:110`, `:312`). The expired row at `:138` repeats the source.
- Runs says otherwise: `runs.js:140` "Late: last price 14:10 (Yahoo)", `runs.js:141` "Before the 16:35 UK close · Yahoo", `runs.js:59` "UK listings read Yahoo".
- The owner journeys agree with Runs: `journeys/home.js:8` `XLON: ['16:35', 'Yahoo']`, `forecast.js:343`, and `privacy.js:289` "Priced again when Yahoo returns a price".
- `EV.run` links "run_8d02 · Tue 21:15 · cutoff 21:00 · 7 of 7 priced". `twoRuns` also puts HSBC under run_8d02 (`:147`).
- Runs labels run_8d02 "US" and has a separate run for this fault: `runs.js:34` "run_8cf7 · UK · HSBC late", Tue 16:50.
- The page's own OPEN row says "The clock is per market; each run row names its market."
- AGENTS.md requires "a clear data provenance trail". Lesson 27: one moment shows one set of figures.

Correction:
- Change the source row to Yahoo, and the resolution sentence to "HSBC prices are back from Yahoo", in all four places.
- Link run_8cf7 for inc_0012 in `EV.run`, and rebuild `twoRuns` so HSBC is not read off a US run. Keep run_8d02 for inc_0013.
- Check `job_3e9a` against Runs for the same reason: Runs treats it as the collect job of run_8d02, yet `REQ` and `EV.job` use it for the UK collection.
- Hold it with a fact: `a-evidence` default names Yahoo and run_8cf7, and lacks Twelve Data.

### R2-s3 · P1 · blocking · docs/design/admin/src/journeys/incidents.js:92

**"Mark as mitigated" is a drawn write control, and three records say it is not.**

Evidence:
- `mitTool` calls `act('A74', 'Mark as mitigated')`. It is live on the web and iPad in `a-detail` default, partial and expired, and in `b-escalate` default, partial and expired: six screen and state pairs.
- The sentence directly above the button reads "When this counts as mitigated, and who says so, is not recorded."
- `permissions.json` A74 has `"control": "named"`, and `about` defines that as "the act is listed, and no admin screen draws it yet".
- `shell.js:309` OPEN row: "Who marks an incident mitigated? (CT-14)", "Labelled proposed, with no control."
- The live inventory contradicts both: A74's "Where drawn" prints "Incidents and recovery A, Incidents and recovery B".
- PH08-S05's authority gives the owner acknowledge and resolve only: "Code opens incidents. The owner acknowledges and resolves them."
- `design_admin_facts.mjs` skips named acts in the undrawn check and has no inverse check, so nothing refuses this.

Correction:
- Remove the control. `mitTool` keeps only `tags(proposed('CT-14'))`, which is what the OPEN row and `control: named` already say. A74 stays listed as named.
- Add the inverse gate to `problems()`: an act with `control === 'named'` that any screen draws is a failure. Add a selftest case that mutates a screen to draw one.
- If the owner would rather keep the button, that is his call. Then `control: named` and the OPEN row change together, in one change.

### R2-s4 · P2 · blocking · docs/design/admin/src/journeys/incidents.js:158

**Evidence, Denied, promises a denied row that is not drawn.**

Evidence: `T_EV.denied` says "The Audit link came back permission denied, so it shows as denied, not as empty." `EV` holds alert, run, job, trace, source and model, with no Audit row. `evRows` has no denied branch, so `a-evidence denied` lists the same six rows as Ready. Nothing on the screen shows as denied. The banner's stated difference between denied and empty is the one thing missing (lessons 28, 39).

Correction: in `evRows`, add for `denied` a row `['shield', 'Audit', 'Permission denied, not empty']` with a denied chip. Add a fact that `a-evidence denied` text has that row and `default` does not.

### R2-s5 · P2 · blocking · docs/design/admin/src/journeys/incidents.js:168

**Replay contradicts itself on one screen in Denied, Partial and Stale.**

Evidence:
- `a-replay denied`: the request reads "Awaiting you" and "Your approval: Awaiting you, with a fresh sign-in", and the card below is headed "Nothing waits on you" (`needsYou`, `:192`, keys only on `AWAITS`).
- `a-replay partial`: the banner says "so approving is held", while the same screen says "Your approval: Not needed, inside the allowlist" and "Nothing waits on you". `reqOf` falls back to `REQ.default` here.
- `a-replay stale`: "Approving is held until this refreshes", with the same "Not needed" row.
- The rail of `a-detail` carries the "Awaiting you" chip in Denied, so the contradiction crosses screens.
- Lesson 29: a state reuses a figure only where that state leaves it true.

Correction, keeping R1-s2's rule that A13 and A41 are drawn only on error:
- Head the card by state: "Held until you sign in" for denied, and "Nothing waits on you" only where that is true.
- Reword `T_REP.partial`, `T_REP.stale` and `WHYNOT.partial` to speak of the request, not approving: "This request cannot be checked against job_3e9a, so it is held."
- Alternatively give `partial` and `stale` their own `REQ` rows. Do not leave "Not needed" beside "approving is held".
- `replaySteps` in option B shows "Run inside its bound" as Now while the request Awaits you in Denied. Fix it with the same change.

### R2-s6 · P2 · blocking · docs/design/admin/src/journeys/identity.js:101

**Screens still say the iPhone row waits on the owner's answer, which he has given.**

Evidence:
- The owner answered "I'll join the Developer Program", and asked what lifts the bar, "The purchase (Recommended)".
- `:101` and `:355` still read "the iPhone row that waits on your answer", on the picked `a-path`.
- The notes at `:312` and `:345` read "until MP-179 is answered". MP-179's acceptance is a confirmed purchase, not an answer.
- `:140` reads "MP-164 bars on-device passkeys until you join the Developer Program". `IPHONE` at `:42` reads "Until it is bought".
- That is three phrasings of one rule, and the owner's word is the purchase (lessons 7, 23, 39).

Correction: use one phrase, "until the Developer Program is bought (MP-179)", at `:42`, `:101`, `:140`, `:312`, `:345` and `:355`. Keep "until you answer" only on the phone-web line at `:139`, whose question is genuinely open (CT-17, PL-09). Add a fact that lacks /waits on your answer/ across Identity.

### R2-s7 · P2 · blocking · docs/planning/story-readiness-2026-11-03/stories/PH-07.json:196

**The owner's answer on what lifts the bar did not reach the story it changes.**

Evidence:
- MP-164's negative still reads "until the owner says to join the Developer Program". Read literally, the owner has now said so.
- The decision log quotes that wording and records "The purchase (Recommended)", but `git diff 6705fc1..0d1ab4e -- docs/planning` touches only the decision log, the gap register and the trace.
- Line 196 and Jira MP-164 are unchanged. MP-179's description, read in Jira, says "Joining is the owner's purchase" but does not quote the answer.
- Lesson 4: an owner decision changes every record at once, Jira descriptions included. Plan-sync rule 1 puts the owner's answers first. A builder who reads only MP-164 would lift the bar on the words "I'll join".

Correction: change PH07-S03's negative to "until the owner has bought the Developer Program (owner, 4 November 2026)", in `PH-07.json` and Jira MP-164. Add the answer to MP-179. Line 217 and the other authority lines say "until the owner says", and need the same reading. The Jira and Confluence writes need the owner's own yes, so put them in the end-of-work question.

Checked and fine: `trace.json`'s new `as_of` holds. Jira's highest key is MP-179, MP-64 is In Progress, and MP-164 and MP-179 are To Do, all as the trace says.

### R2-s8 · P2 · non-blocking · docs/design/admin/src/shell.js:313

**After Compare has been opened, pressing a theme repaints Compare over the State inventory.**

Evidence: pressed in Chrome. Open `#compare`, press State inventory, press Dark. `#jinv h2` reads "Compare and pick" while the hash stays `#inventory`. `showInventory` does not go through `pageOnly`, so `sum.cmp` stays set, and the MutationObserver at `:383` calls `drawCompare()`. Permissions and Coverage use `pageOnly` and are safe. `design_admin_press.mjs` does not cover it (lesson 35).

Correction: set `sum.cmp = null` in `showInventory`, or have it call `pageOnly('inv')`. Add the sequence to `design_admin_press.mjs`.

### R2-s9 · P2 · non-blocking · docs/design/reviews/MP-64/decision.md:25

**The screen counts are stale, in a paragraph this delta edited.**

Evidence: the same line changed "51 actions" to "76 actions", but it still says "105 screens". The page holds 110. The table says Agents A 6, B 5, Models A 6, B 5, Costs A 5. The page has Agents 7 and 6, Models 7 and 6, Costs A 6. Those five extra screens make the difference.

Correction: update the line and the table. Add a fact that parses the table against `J.matrix()`, since a command can catch this.

### R2-s10 · P2 · non-blocking · docs/design/admin/src/journeys/identity.js:122

**Link Google is live on iPad, but its step 2 needs the Mac.**

Evidence: `a-link default ipad` draws a live "Link Google", with step 2 "A fresh sign-in with your Mac passkey. Both identities are needed." The same journey says enrolling is drawn on the Mac alone, and the iPad holds no passkey and cannot prove one. In Ready's alternative world, where Google is unlinked, the iPad's only sign-in is also gone (`enrolHere`, `:140`). The control promises an act the device cannot finish (lesson 28). A46's `phone: off` covers phones only.

Correction: on iPad, hold A46 with "Link Google from your Mac. The proof needs your Mac passkey.", as `enrolHere` does. Say in A46's `phone_note` that it is Mac only while MP-164 holds. Or record the iPad route as an open question under CT-17.

### R2-s11 · P3 · non-blocking · docs/design/admin/src/journeys/incidents.js:87

**"Your words stay in the box" on a phone, where no box is drawn.**

Evidence: `a-detail expired iphone`. `resolveTool` omits `field()` on a phone and A75 is off there, so a phone could not have sent a resolution. The banner still says "Your resolution did not land in time ... Your words stay in the box."

Correction: make `T_DET.expired` a function that drops the sentence on a phone, or draws the iPad and desktop line "Resolving happens on iPad or desktop, and nothing was recorded."

### R2-s12 · P3 · non-blocking · docs/design/admin/src/shell.js:205

**A pick changed in Compare does not reach the journey, and Compare's sentence can be false.**

Evidence:
- Pressed: Pick A on Audit in Compare, then open Audit. It opens on B and the chip says "You picked B · Explorer", while Compare's tab says "Audit · A". `show()` and `pickedOption` read the constant `PICKS`, and Compare reads `sum.keep`.
- With a partial store (`{audit:'a'}`), Compare says "Your picks of 4 November are marked" and "1 of 10 picked". `picksLoad() || {...PICKS}` replaces the owner's picks wholesale, and there is no way back to them.
- R1's cleared-pick behaviour stays as it is.

Correction: label the chip as the recorded pick, or have it say when this browser holds a change. Reword Compare's sentence for when the store differs from `PICKS`, and add a "Back to the recorded picks" control.

### R2-s13 · P3 · non-blocking · docs/design/admin/src/journeys/incidents.js:247

**The picked Recovery calls a data gap "drift".**

Evidence: `T_REC.conflict`: "The copy stops at Sun 1 Nov, so the two differ by whatever came after. Drift blocks the release until it is resolved through Terraform." In PH08-S01, drift is infrastructure drift. Read in sequence, this tells the owner a lost-data gap is resolved through Terraform.

Correction: split the sentences. Name the data gap as the gap, and say "Separately, infrastructure drift blocks the release...", or remove the drift sentence from this banner, since `T_REL` holds it.

### R2-s14 · P3 · non-blocking · docs/design/admin/src/shell.js:365

**Two small leftovers.**

Evidence:
- The comment still says "both options side by side", which the README and the page's sentence changed to "option by option" (lesson 1).
- In Empty, `a-list` shows "Restore exercise Passed · Sun 1 Nov", and `home.js` says "last restore passed", while `a-recovery` says "No exercise has finished". The hedge "in this view" (`:217`) carries it, but one state reads two ways across frames shown together (lessons 27, 29).

Correction: reword the comment. Give `still()` and Home's empty line "No result yet", or make `a-recovery` Empty say rx_0007 stays the last pass and the next is scheduled.
