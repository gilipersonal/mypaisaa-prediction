**MP-62 round 1, lane r: 23 findings (5 P1, 17 P2, 1 P3), 16 of them blocking**

**R1-r1 · P1 · blocking · `approvals.js:93`, `:148`, with `:92`, `:94`**
- **Evidence:** The promotion binds tasks "3, 6, 12 months". NEXT promises "Each week: Scored against v3", "After 2 bad weeks: Reverts" and "After 4 good weeks: Probation ends". The same page says "No 3, 6 or 12-month forecast has matured". Owner answer 14 and MP-159 count only matured forecasts: "A week with no matured paired forecasts neither counts toward nor breaks a run." The earliest 3-month shadow forecast (w/c 31 Aug) matures about 30 Nov, and no 6 or 12-month one matures in the 4 live weeks. "4 good weeks" is not the owner's rule, which is "first 4 live weeks". The word "matured" appears nowhere in the promise.
- **Correction:** Say that scoring runs on matured paired forecasts only and that a week with none does not count. State that for 6 and 12 months probation ends with no score. Use "4 live weeks". Add the question to OPEN in `shell.js` under SCI-D07.

**R1-r2 · P1 · blocking · `approvals.js:92`, `:90`, `:94`, `:106`**
- **Evidence:** The live-shadow row that beats both comparators is "1 to 20 sessions", a task the approval does not bind. The head and Tasks say 3, 6 and 12 months. The maturity state says "too few short-term forecasts". Owner answer 13 and MP-156 say the 8 weeks only check clean running and calibration for these horizons. So the "Passed its shadow trial" evidence covers something this approval does not change.
- **Correction:** Either add the 1 to 20 session tasks to the head, Tasks and step-up, or replace the row with clean-running and matured-calibration counts for the bound tasks.

**R1-r3 · P1 · blocking · `approvals.js:178`, `:193`, with `:181`**
- **Evidence:** "Narrow a self-correction band" and "Restart US tech, 12 months" have chevrons but no proposal screen. A grep finds "self-correction" in that one queue row only, across all eight journeys. So MP-114's "impact, evidence, cost and how to roll it back" is drawn nowhere. The restart decision (owner answer 15, MP-159) and switching forward (answer 6) are not drawn either. Nothing draws an approval being revoked or cancelled before commit: MP-55 and MP-78 list that state and `revok` matches nothing in Holdings or Approvals.
- **Correction:** Add a settings-change proposal, a restart or switch-forward proposal, and a Revoked state to the step-up or outcome screen.

**R1-r4 · P1 · blocking · `research.js:222-228`**
- **Evidence:** Option B's brief shows ranked actions as bare chips ("NVDA · Trim"), with no reason and no range, and no citations or Sources anywhere on Today. Rendered text confirms it. There is no "Words by Claude" tag in Ready, yet `:239` says the template brief "is labelled so". README: ranked actions carry "a reason and the uncertainty", and every quoted figure carries a source. MP-125 says the same of figures.
- **Correction:** Give each action a reason line, an 80% range and references. Add `briefSrc` and `briefTag` to `threadBrief`.

**R1-r5 · P1 · blocking · `approvals.js:300`, `:185`**
- **Evidence:** Rendered on every screen, "Notices" appears in Option B only on iPad and desktop `ab-home`. It is absent on all six iPhone and phone web screens. MP-162: "Every notification intent appears in the in-app inbox on the web and the Apple app". In both options the rows show no detection time, no unread or dismissed state and no evidence deep link. "Opening one changes nothing" also reads against synced read state.
- **Correction:** Give Option B a phone route to the inbox. Add detection time, read state, dismiss and an evidence link to `notices()`.

**R1-r6 · P2 · blocking · `approvals.js:266-293`, `:298-325`**
- **Evidence:** Each option draws only half the outcomes, and the owner picks one option per journey. Option A has no listing outcome: applied, write failed, refused or expired, so MP-131's "confirmed but not applied" is missing. Option B has no step-up or outcome for a promotion, so no probation, no next steps and no expired model proposal. The `ab-step` and `ab-after` screens are TSM only.
- **Correction:** Add `afterCore` to Option A. Add `stepFor(ctx, STEP_MODEL)`, `resultCore` and `NEXT` to Option B.

**R1-r7 · P2 · blocking · `approvals.js:58`, `:305`, `:57`, `:273`, `:238-239`**
- **Evidence:** Claude's "code has checked its coverage and cost" renders in the loading, error and abstention states. In `ab-chat` abstention, "no tier change needed" sits beside "would need a higher Twelve Data tier". In error, all four check ticks sit beside "The check timed out". Refused screens still say "It joins only if you confirm" and "This adds one watch-only listing". In Ready, Claude says this at 08:41 while HIST has the check passing at 08:44.
- **Correction:** Make `fromChat` and `checks` take the state. Have Claude say the check is running. Drop or swap the limits line on refused proposals.

**R1-r8 · P2 · blocking · `approvals.js:102`, `:88`**
- **Evidence:** The Stale state reads "5 of 8 scored weeks" and "the count is paused at 5", but `stop: 7` draws 6 ticks plus the pause. Six weeks precede 12 Oct. The captured iPad dark frame shows 6 ticks. Owner answer 16 is the rule this state illustrates.
- **Correction:** Say 6, or use `stop: 6` and move the pause.

**R1-r9 · P2 · blocking · `approvals.js:268`, `shell.js:62`, `:68`**
- **Evidence:** "The record" is passed as `actions`, which only the iPhone renders. Measured `[aria-label="The record"]` count: iPhone 1, phone web 0, iPad 0, desktop 0. In Ready, Option A has no path to `aa-record` on three of four surfaces.
- **Correction:** Pass it in `webActions` too, or add a "See the record" row to the queue.

**R1-r10 · P2 · blocking · `approvals.js:52`, `:57`, `:70`, `:231`**
- **Evidence:** "New venue XNYS 44" and 1,855 charge for a MIC not yet polled. XNYS is first in the catalogue's `change_detection_mics`, the fixtures hold JPM, JNJ and XOM on it, and `home.js:263` shows JPM · XNYS watch-only, score 70. So 1,811 is the right total, and "No approved model covers XNYS" is contradicted too. "Busiest minute 31" implies joining the 30-credit slot, but the 286 a month for that is absent (my inference). The base of 1,760 sits against 18,360 planned in DATA-07.
- **Correction:** Remove the venue charge and use 1,811, or use a genuinely new MIC. Change the No model reason. Align the base figure and busiest minute with DATA-07.

**R1-r11 · P2 · blocking · `research.js:142`, `:239`, against `cost.js:33`, `:104`**
- **Evidence:** Research says "Asking returns when the budget hold lifts" and "until the hold lifts". Cost says "No verified credit and no paid approval" and "Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in." Waiting never brings Claude back. These sentences are the journey's own; the "stay inside the budget" line is Prism's.
- **Correction:** Replace both with Cost's condition and link to Settings. Confirm with the owner whether Prism's line should follow.

**R1-r12 · P2 · blocking · `research.js:130-146`, `:296`**
- **Evidence:** MP-127 lists `cap_reached`, with recovery "chat says so and offers the stored explanations instead". A grep finds the cap only in Option B's cost text. MP-127's concise answer with technical detail and a glossary on request has no control either.
- **Correction:** Draw a cap-reached turn in `askThread` for both options, and add an expand control.

**R1-r13 · P2 · blocking · `research.js:40`, `:120`, `:254`, `:201`, `:290`, `:315`**
- **Evidence:** "No model" means two things. On `ra-card` and `rb-card` the body says "No approved model for 12 months", the composer says "Claude is off this month", and an adjudication still appears. Its meta still reads "Horizon 3 May 2027, R2-HGB v3" with 12M selected. On the alert, No model is marked n/a for a forecast reason, but Claude off can occur there and "Ask why" is its primary button.
- **Correction:** Add a separate Claude-off flag to the composer. Fix the meta. Draw the alert with Ask why unavailable instead of n/a.

**R1-r14 · P2 · blocking · `research.js:47`, `:55`, `:67`, `:71`, `:78`**
- **Evidence:** Ready shows "Yahoo · Fresh" beside "Yahoo delayed, so its action is paused". The same screen gives UK last close as 16:35, so a 16:35 price is the close, not stale. Stale reuses the same four rows but retitles them "Three ranked actions, one paused", while Ready calls them four.
- **Correction:** Change the shared stale time to before the close in `docs/design/reviews/MP-62/brief.md` and every journey that repeats it. Show Yahoo as delayed in Ready, and count the same way in both titles.

**R1-r15 · P2 · blocking · `research.js:37`**
- **Evidence:** Claude closes with "Trimming would narrow the portfolio's range." It has no reference and no tool result behind it, and it directly follows a Trim badge. MP-125 requires derived results from deterministic services, and AGENTS bars wording that reads as advice.
- **Correction:** Remove it, or replace it with a code-computed figure carrying a source.

**R1-r16 · P2 · not blocking · `research.js:35`, `:147`, `:36`, `:153`**
- **Evidence:** The step says "Read a filing", but "What Claude may read" (MP-127's list, word for word) has no filings, and the story says chat quotes a stored analysis. Source 4 is load-bearing ("the main bull point"), yet no screen opens an event analysis. ARC-06b's record of uncertainty, invalidation and citations is drawn nowhere ("invalidat" has no journey match).
- **Correction:** Read only the stored analysis and cite the filing through it, or ask the owner to widen the list. Draw the event-analysis source.

**R1-r17 · P2 · not blocking · `research.js:163`, `:165`, `:152`**
- **Evidence:** The quarantined item shows "Rights: No record yet", with a content hash and its text stored. MP-81: no rights record means "refused at intake with reason rights_blocked and only the refusal receipt is kept". The `Updated` time and the `rights_blocked` and `withdrawn` states are also undrawn.
- **Correction:** Give the quarantined item a rights record, draw a separate refusal receipt, and add `Updated`.

**R1-r18 · P2 · not blocking · `research.js:186`, `:192`, `:183`, `:187`**
- **Evidence:** The disagreement banner says "until you correct or forget it", but the detail shows the tainted note, which is not in that list, so the conflicting note has no actions. "Renew it" is not in MP-115 and has no control. "So Claude did not use it as evidence" implies other notes can be evidence, against "never accepted as evidence".
- **Correction:** Show the conflicting note's detail, drop Renew, and reword to "Left out of the answer".

**R1-r19 · P2 · blocking · `approvals.js:157`, `:31`**
- **Evidence:** "Raise the Claude cap to £20" sits in the record as the owner's refusal. The same journey says approvals grant no budget "and code refuses any change that would", and MP-114 bars granting a route a budget. MP-78 separately lists budget expansion as a sensitive action, so the records conflict.
- **Correction:** Draw it as Blocked by code, or put the conflict to the owner rather than choosing.

**R1-r20 · P2 · not blocking · `approvals.js:134`, `:284`, `:93`**
- **Evidence:** The sheet says "You approve exactly this", but STEP_MODEL omits artefact, calibrator, tasks, scope, limits, previous safe and a payload hash. MP-156 binds them, and phones see no `bound()` card there. "Typical 80% range: 1.2 points narrower" has no before value.
- **Correction:** Add those lines to the sheet, and show from and to values for the range.

**R1-r21 · P2 · not blocking · `shell.js:161-173`, `approvals.js:92`, `research.js:214`**
- **Evidence:** The Rules column looks settled, but a rules score needs R0-RULEMAP and "beating" is proposed, both open in SCI-D03. The bad-week rule is pending in SCI-D07. "Cooldown runs to Thu 07:30" is not in any approved record, and the only figure on record, one push per 24 hours (a proposal), would end Wednesday 22:15. OPEN lists none of these.
- **Correction:** Add them to OPEN and label those lines proposed.

**R1-r22 · P2 · not blocking · `approvals.js:11`, `:206`, `shell.js:53`, `:62`, `:68`**
- **Evidence:** Queue rows, the only way into a decision, are `div`s with a chevron. Option B's strip is `role="group"` and Back is a `span`, so keyboard and VoiceOver users have no target or name (WCAG 2.1.1, 4.1.2). Citations are spans too, but that is Prism's spec.
- **Correction:** Make rows, the strip and Back real buttons or links. Raise citations as a Prism change.

**R1-r23 · P3 · not blocking · slips**
- `approvals.js:66` says 09:12, `:153` says 09:02.
- `:165` lists the record from 16:35, while `:171` shows the newer promotion in the rail.
- `:228` shows a "Refused" chip on "Confirmed, not applied", and `:312` calls it "applied late".
- `:204` has 2 decisions where Option A has 4.
- `:104` with `:318` shows v3 Active, Approved 1 Oct, beside "its approval has expired".
- `research.js:67` says run 21:15, `:212` and `approvals.js:148` say 22:15.
- `research.js:144` says "next week" for results on 18 Nov.
- `research.js:118` has no way to open version 4.
- `research.js:200` has a citation with no sources list.

**Coverage:** I read both journeys, `shell.js`, ARC-06b, the decision log and all 15 stories. I rendered 144 combinations of device, option and state as text, with default screenshots in both themes plus 14 close-up frames, 3 of them dark. Assistive technology, real devices and pressing controls were not checked. One capture command was refused as unparseable; it contained no removal, so I ran it from a file as the brief allows, and nothing was deleted. Captures are in `/private/tmp/claude-501/-Users-arundutta-projects-mypaisaa-prediction/45ba900b-058a-4437-b30a-d55697f4dbd3/scratchpad/review/r/`.
