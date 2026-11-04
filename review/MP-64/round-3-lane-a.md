# MP-64 review round 3, lane a

Snapshot `af66cc0`. Delta read: `git diff 0d1ab4e..af66cc0` on `admin/src/journeys/approvals.*`, `costs.*`, `journeys/src/journeys/approvals.js`, `tests/journey_facts/r.mjs`.
Screens read with `scripts/design_admin_text.mjs`, and with the same loader on `docs/design/journeys/index.html` for the owner journey. Live or shut controls read from rendered HTML.

Counts: 14 findings. 8 blocking (3 P1, 5 P2). 6 non-blocking (2 P2, 4 P3). No P0.

### R3-a1 · P1 · blocking · docs/design/admin/src/journeys/approvals.js:158

**"If you withdraw S10" says all new Yahoo use stops. S10 covers only sending Yahoo values to Claude.**

Evidence: `aa-policies` prints "If you withdraw S10 / New use of Yahoo / risk_accepted / Stops at once", beside "Stored data, backups and models / Disposition pending". In `docs/planning/foundation-specifications-2026-11-02/data/catalogue.json`, OWNER-RISK-01-S10 has `uses: ["anthropic_transmission"]`, "Only values already inside S6 ... or S7". Yahoo's quotes (S6, UK and Indian delayed intraday) and daily cross-check (S7) sit under their own scopes and do not stop. The card on the same screen also says "Claude routes: S9 Grow 55, S10 Yahoo, prod".

The owner accepted a stated risk on Yahoo collection (decision log, MP-10 answers). This card tells him one press ends Yahoo use, when collection, storage and display would carry on. Storage and models are also not S10 uses, so the disposition row is PH03-S02's general rule applied to a scope it does not fit. "Set the scope again" names a control that no state draws: A37 appears only as "Withdraw".

Correction: rewrite `SCOPE_ROWS` for S10. Row 1: "Yahoo values to Claude routes", `risk_accepted`, "Stops at once" (R2-a11's check needs that phrase, so keep it). Add a row "Yahoo prices, S6 and S7", "Unchanged", with a note that they have their own scopes. Row 2 should keep the story's words: "cached projections and affected derivations". Remove or narrow the disposition row, with DATA-DEC-04 settled against what S10 actually holds. Check `SCOPE_END` too. If "Withdraw S10, Yahoo" stays, its label should say "to Claude". Add a fixed check that the card names S6 and S7 as unchanged.

### R3-a2 · P1 · blocking · docs/design/journeys/src/journeys/approvals.js:125, :129, :176; docs/design/admin/src/journeys/models.js:40 (lane m's file, the join)

**The approval binds "All segments" and "3, 6, 12 months" while the screen says one of them is left out.**

Evidence: owner `aa-model` noModel prints the banner "That scope stays paused until you restart it", then the head "3, 6 and 12 months · all segments", and the bound card "Tasks 3, 6, 12 months / Scope All segments / Previous safe None on US tech, 12 months; R2-HGB v3 elsewhere". Admin `a-decide` Ready prints the same "Scope All segments" with "Two scopes this does not settle: US tech, 12 months Stays paused; India midcap, 3 months Stays on R1-LGB v1" and "Active model v3 to v4, where v3 issues". PH04-S18: "The owner's approval binds the exact artefact, calibrator, tasks, scope". The owner's answer was "Only that scope waits". The bound scope is therefore not the scope acted on, and a server rechecking the payload would read all segments.

The two pages also phrase one fact differently (lessons 7, 27). Owner: "None on US tech, 12 months; R2-HGB v3 elsewhere", "Back to v3, except US tech, 12 months", "Active model v3 to v4". Admin: "R2-HGB v3, where eligible", "Back to v3 by itself, where v3 is eligible", "Active model v3 to v4, where v3 issues". The owner's "R2-HGB v3 elsewhere" is also untrue of India midcap, 3 months, on the admin figures.

Correction: in noModel on the owner page and every A25 state in admin, set the Scope row to name the exclusion in one phrase, such as "All segments, except US tech, 12 months", and carry it into the head line and `MODEL_ROWS`. Give India midcap, 3 months the same treatment in admin. If "all segments" is meant to stay as a contract value, ask the owner rather than choosing (plan-sync rule 3). Lane m has `models.js:40`.

### R3-a3 · P1 · blocking · docs/design/admin/src/journeys/costs.js:173

**Withdrawing paid use on day 18 is drawn as saving £8.25, which cannot be true.**

Evidence: `ca-credit` Ready prints "If you withdraw paid use / Month forecast £54.73 £46.48". £46.48 is the Claude-blocked month (`docs/planning/source-rights-2026-11-02/README.md:83`): £27.84 data plus £18.64 AWS, as `ca-budget` shows. On this screen Claude gross is £7.06, and `ca-lines` shows a £0.34 hold. Money already used stays in the month. So withdrawing today gives £46.48 + £7.06 = £53.54, plus whatever of the £0.34 settles, at most £53.88. The ordinary Claude month is £54.73 - £46.48 = £8.25, of which £7.40 is committed, so the real saving against £54.73 is under £1.20. This breaks lessons 29 and 37, and it sits on a write the owner decides alone.

R2-a11's check still holds after the fix, because "Off £46.48 A month" stays on the page.

The neighbouring `PAID_ROWS` at `:171` (not in the delta) has the mirror fault. Denied is also day 18, and Off to On is drawn as the whole £8.25 with 12 days left.

Correction: in `WD_ROWS`, compute the row from the page's figures: "Month forecast / £54.73 / £53.54", with a note like "£7.06 of Claude is already spent, and the £0.34 hold settles or releases, so at most £53.88". Keep "£46.48 a month" only as a full-month figure. Compute a state-specific value in Empty if Withdraw stays live there. Relabel the `PAID_ROWS` row as a full month or compute it. Add a check that this row plus the committed Claude figure ties.

### R3-a4 · P2 · blocking · docs/design/journeys/src/journeys/approvals.js:453-454, :514-519, :564-569

**Approve is now live in No model, and its step-up and outcome are still marked "cannot occur".**

Evidence: `modelYes` returns a live Approve for noModel (the delta at `:154`), and `tests/journey_facts/r.mjs` requires it. `aa-step` and `ab-model-step` carry `na: naStep`, "Signing in involves no forecast, so no model can be missing here". `aa-result` and `ab-model-result` carry `na: naResult`, "A missing model shows on the proposal". `docs/design/journeys/README.md` allows `na` "only when it truly cannot occur on that screen". It now can. The only drawn sheet is Ready's `STEP_MODEL`, which says "Scope All segments, Previous safe R2-HGB v3". So the owner has no drawn sheet or outcome for approving with one scope waiting, and nothing says US tech, 12 months stayed paused afterwards (lessons 28, 32). The inventory shows him a reason that is now false.

Correction: remove `noModel` from `na` on those four model screens, or give them their own `na` maps, since `aa-setting-step` and the rest share `naStep` validly. Draw the sheet with the noModel binding, and an outcome that says "Promoted where v3 was eligible. US tech, 12 months stays paused, and its restart still waits on you." Add facts for both.

### R3-a5 · P2 · blocking · docs/design/admin/src/journeys/approvals.js:185

**The proposed change's "Also moves" misses the promotion it disturbs.**

Evidence: `aa-propose` Ready moves the signal weight band from 10% to 8% a month. Its ending says only "Approving moves settings to v10, so a proposal waiting against v9 is refused and rebuilt." The promotion binds "Limits 5 points, 10%" (`models.js:40`, owner `approvals.js:129`). `aa-band` says of the weekly band that the same binding "sends the other back to its check". Moving the 10% half has the same effect, and nothing on this new screen says so (the fault in R1-a6, lessons 27, 31). The generic sentence also leaves the owner to work out that the waiting v9 proposal is "Narrow a self-correction band".

Correction: `PROP_END` "Also moves": name both, as in "Narrow a self-correction band is refused and rebuilt on v10, and Promote R2-HGB v4 binds the 10% limit, so it goes back to its check." Mirror the note on the promotion's overlap if this draft is live. Add a fixed check.

### R3-a6 · P2 · blocking · docs/design/admin/src/journeys/costs.js:245

**On a refused or expired change, the rail still talks as if the change were open.**

Evidence: `ca-change` Expired prints "Expired at 18:00", then "Bound to Budgets v2 · expires tomorrow 18:00" and "Not now keeps your draft until it expires", with a live "Not now", and "Expires Tomorrow, 18:00" under "What this proposed". Conflicting prints "Refused for a stale version", with the same three lines. There is nothing left to keep or postpone. The Not now sentence is new in this delta. The screen note says Expired is "a later moment, past tomorrow 18:00", while `CLOCK` has no expired entry, so the clock chip still says "Estimates to 21:15 ... day 18 of 30".

Approvals already handles this shape: `bandRail` replaces the decision with "An expired proposal cannot be approved." (lesson 29).

Correction: in `changeRail`, for `conflict` and `expired`, draw a closed box ("An expired change cannot be approved." / "Refused against v2. Nothing to decide on it."), with A34 shut and no Not now. Change the bound row's Expires to "Expired" in Expired. Add a `CLOCK.expired` entry, or `asReady` for it, naming day 19.

### R3-a7 · P2 · blocking · docs/design/admin/src/journeys/approvals.js:185, :201

**`aa-propose` Conflicting states versions that the same screen disproves.**

Evidence: the banner reads "Settings v10 was written at 09:01, so your draft against v9 stops here", with head "Settings v10", and the action is "Start again from v10". The rail below prints `PROP_END` unchanged: "Settings v10 keeps v9 as its previous version", "Settings v9 stays current", "Approved, not applied ... settings v9 stays current", "Approving moves settings to v10". All four are false in this state, where v10 is current and a restart would make v11 (lesson 29).

Correction: make `PROP_END` a function of state. In Conflicting draw v11 on v10, or draw no endings until the draft is restarted.

### R3-a8 · P2 · blocking · docs/design/admin/src/journeys/approvals.js:178, :189

**"Pick a setting to change" has nothing to pick from.**

Evidence: `aa-propose` Empty says "Pick a setting to change" with a primary-looking "Choose a setting" (new as A58 in this delta). No picker exists in any state. `proposeBase` hard-codes "Signal weight band" and offers only New value and Why, so every entry, including Propose from Weekly band versions on `aa-band`, lands on that one setting. PH05-S14 covers "risk, ranking, agent and self-correction settings". This is R2-a3's fault ("nowhere to say which line"), fixed only in Costs (lessons 3, 28).

Correction: give `proposeBase` a Setting select, as `draftCard` does in Costs, listing the proposable settings. Make "Choose a setting" focus it, or remove the button. Add a fixed check on the select.

### R3-a9 · P2 · non-blocking · docs/design/admin/src/journeys/costs.js:178, :195

**Withdraw paid use and budget rollback are shut in Failed with no reason given.**

Evidence: `ca-credit` Failed renders "Withdraw paid use" OFF. Its banner says Claude usage "still reads" and states no limit on acting. `ca-budget` Failed and Partial render "Roll back to v1" OFF beside a LIVE "Change a line", again with no reason. Offline has R16, and Denied has its banner. An AWS collector failure gives no evident reason to bar the act that stops Claude spending, which is when the owner may most want it.

Correction: add one sentence on the shut control ("Waits until records load" or similar). Or, better, ask the owner whether A76 stays live in Failed, since it only reduces spend.

### R3-a10 · P2 · non-blocking · docs/design/admin/src/journeys/costs.js:196

**A step-up rollback whose content is undisclosed.**

Evidence: `ca-budget` Ready offers "Roll back to v1", live, described only as "The same lines · an allocation differs". Nothing says which allocation or by how much, and nothing downstream shows what would change. PH05-S14 requires impact on a proposed change. Also, v2's allocations are the records' own (COST-Q1: £30, £22, £15, £3), so v1 is an invented earlier plan with no figures.

Correction: name the difference in the row, labelled illustrative, as in `aa-band`'s rows, and show its delta before approval.

### R3-a11 · P3 · non-blocking · docs/design/journeys/src/journeys/approvals.js:560

`ab-model` noModel heads the screen with "Approval expired R2-HGB v3", no scope. The banner beneath says it expired on US tech, 12 months, and v3 still issues elsewhere. Correction: "Approval expired on US tech, 12 months". This keeps the word "Active" off the screen, so the `r.mjs` check holds.

### R3-a12 · P3 · non-blocking · docs/design/admin/src/journeys/approvals.js:163

`aa-policies` Empty says "Nothing here can be decided yet. Each card says what it waits on.", while "Withdraw S10, Yahoo" is LIVE on that screen and the scope card waits on nothing (lesson 39). Correction: "Nothing here is waiting for a decision. Each proposed card says what it waits on."

### R3-a13 · P3 · non-blocking · docs/design/admin/src/journeys/costs.js:173-174

Two wordings in the Withdraw card. "To turn it back on: A new approval" drops the route `WD_END` gives on the same screen, "until credit is verified or you approve paid use again" (lessons 7, 27). "Open reservations: Settle" is one outcome of several: PH02-S09's states include `cancel_pending` and `released`, so held work not yet sent is released, not settled. Correction: reuse the CLAUDE_OFF sentence, and say "Settle or release".

### R3-a14 · P3 · non-blocking · docs/design/admin/src/journeys/costs.js:224, :245

Two gaps against the claim "The same shape as a settings proposal". There is no Refuse: A51 lists only `approvals`, and Costs offers "Not now", so a checked budget draft can only lapse. There are no "How this can end" rows on `ca-change`, which `aa-propose` has. Also, the select offers four allocations, yet the only drawn check suits a threshold ("Below £75"). Raising an allocation has its own test against the £70 plan and the reserve (PH02-S09, "a higher allocation"), and no state draws it (lesson 28). Correction: add A51 and `ends()`, and draw one allocation case or say what code checks for it.

## Checked and clean

- Budget versions tie across `ca-budget`, `ca-change` and every state (v2 current, v3 proposed, v4 rollback), and £59.73 - £55 = £4.73.
- Weekdays and dates: Fri 6, Mon 9 and Tue 10 Nov 2026.
- The paused-scope line and the 4-plus-1 count agree across Home, Models and Approvals. Empty has no paused scope, and Incidents agrees.
- `checks('stopped')` and `checks('partial')` match the listing states.
- A58, A34 and A76 go off on phones through `act()`.
- `r.mjs`'s changes hold what they claim. The narrowed `Active(?! model)` regex is justified by the owner's answer.
