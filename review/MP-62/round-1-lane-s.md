# MP-62 round 1, lane s: findings

## P1

**R1-s1. P1, blocking yes.** `cost.js:226` (`rowsOf`), `privacy.js:83`, `privacy.js:308`.
- **Evidence:** ranked actions show with no "decision support" label. In the rendered text of Home with the meter, Home with the pill, The month in a sheet, Privacy centre and Home amounts hidden, Add, Trim, Hold or Pause appear and "decision support" does not (checked iPhone on all five, desktop on Home with the meter only). The negative acceptance says ranked actions are labelled decision support.
- **Correction:** put a "Decision support" tag in the Holdings section head in `rowsOf`, and in both privacy row lists. Add a walker check that any screen with a `.badge` carries the label.

**R1-s2. P1, blocking yes.** `cost.js:328-353`, note at `cost.js:346`.
- **Evidence:** Cost option B has no degraded-mode screen and no fit screen.
  - MP-103: "No feature is cut silently: every degraded mode is shown to the owner with its reason." B draws no pause or reduce screen.
  - The `cost-b-log` note promises "Every invoice, reservation, refusal and threshold", but a search of its default, stale and disagreement text finds no Warn, Reduced, Paused, threshold or £60.
  - MP-112 (planned months, measured or not, options past £60) is absent from B, yet the journey lists it for both options.
- **Correction:** add threshold rows to `log()`, a paused screen, and `fitCard` to B.

**R1-s3. P1, blocking yes.** `privacy.js:294-332`, `privacy.js:226-232`, note at `privacy.js:313`.
- **Evidence:** Privacy option B dead-ends. The Checkup note says "each row opens the place that thing lives", but three of those places are not drawn:
  - No devices and sessions list, so MP-87's revoke of any session or device exists only through the lost-device flow.
  - No screen for the less-private settings, so MP-166's "setting_change_failed" and its recovery are not drawn.
  - No new-device or link screen: sign-in Empty says "Use Google, then confirm on a device you trust", and no confirm step exists (MP-73's "link pending verification").
- **Correction:** add those three screens to B, or drop the stories from B and say so in `cost:`.

**R1-s4. P1, blocking yes.** `scripts/design_journeys_check.mjs:104,127`, `:71`, `:60`.
- **Evidence:** the walker fails open and has no selftest (lesson 8). Runs on scratch copies:
  - `--only nosuch`: "0 combinations walked, 0 problem(s)", exit 0.
  - A page with no journeys: exit 0.
  - `throw` at load: exit 0, although the header says it fails on a page error. Line 104 clears `errs` before anything reads it.
  - Text at `opacity:.3`: exit 0.
  - A pressable chip at `min-height:12px`: exit 0. Only `button.btn` is measured.
  - Near-white text (1.17:1) on a card with a linear gradient: passes on option A. Line 60 skips it, and the only failures were B's sheet, which has no such card.
- **Correction:**
  - Fail when combinations fall under matrix × states × surfaces × themes, or are zero.
  - Report load errors.
  - Multiply opacity up the tree.
  - Measure every `button, [role=button], summary`.
  - Treat gradient text as unmeasured unless measured by stops.
  - Add a selftest mode where each case names its failure, and run it in `review_checks.py`.

## P2

**R1-s5. P2, blocking yes.** `privacy.js:244,320`, `:147-149`.
- **Evidence:** in `privacy-b-lost` Abstaining, the card says "Locked out. With no path left" while the rail on the same screen says "Sign-in paths · 3 healthy", and the frame sits inside Settings with "Checkup" back. Option A marks this very case not applicable: "A locked-out owner cannot reach this page" (`privacy.js:281`).
- **Correction:** draw locked-out on the signed-out cover, or mark it n/a as in A.

**R1-s6. P2, blocking yes.** `cost.js:194`, `cost.js:176`.
- **Evidence:** on Paused, No model, the status reads "Claude was already off, so this is all AWS", and the list says "Already off". The same card shows "Claude £14.62" and a Claude bar, because `OVER` is reused unchanged.
- **Correction:** give noModel its own bars, keys and figures with no Claude spend.

**R1-s7. P2, blocking yes.** `cost.js:30`, `cost.js:147`.
- **Evidence:** Error reads "£44.40 last reconciled", but the breakdown on the Sources screen shows £37.69 reconciled plus £6.71 "Not yet reconciled".
  - "Since 16 Nov" is "Not shown", yet the total reads flat £44.40. Abstaining says "At least £39.36".
  - MP-142 recovery asks for a stale label. No such word appears in this state.
- **Correction:** show £37.69 as last reconciled, make the sum "At least £44.40", and add a "Stale" label.

**R1-s8. P2, blocking yes.** `privacy.js:205`, `:179,185`.
- **Evidence:** the Stale delete sheet says of "Broker statement, Sep 2026" that "Its 24 months end soon". The list behind it says "kept to Sep 2028", and the file due is the Indian funds statement.
  - The same banner says "renew it or delete it here", but only Not now and Delete exist.
  - "Renew" is a chip everywhere, so MP-45's owner extension has no control and no fresh-sign-in step.
- **Correction:** name the Dec 2024 file in this state, make Renew a real control, and draw its step-up.

**R1-s9. P2, blocking yes.** `privacy.js:194`.
- **Evidence:** the tainted memory note has no Forget. Its end slot holds the "Untrusted source" chip instead. MP-115 says the owner can list, correct and forget notes. This is the note most likely to need it.
- **Correction:** give every note Forget, with the chip beside it.

**R1-s10. P2, blocking yes.** `privacy.js:272`, `:107`, `:115`.
- **Evidence:** Privacy centre marks Empty n/a because "the private defaults always exist". That page also holds the inbox and phone notifications. So "No notices yet" and "Not asked yet", MP-167's day-one `permission_not_asked`, can never be reached in option A. The README allows n/a "only when it truly cannot occur".
- **Correction:** remove the n/a and let Empty draw those two cards.

**R1-s11. P2, blocking yes.** `privacy.js:306`, `:8`.
- **Evidence:** `privacy-b-home` passes through `fx()`, whose comment says a failed export is not a failed price. This screen does show prices.
  - Stale renders "Twelve Data · Fresh Yahoo · Fresh" above "Stale. HSBC last priced 16:35".
  - Error renders the same two chips above "Holdings failed at 21:14".
  - That hides provider status, which the acceptance forbids.
- **Correction:** use `ctx`, not `fx(ctx)`, on this screen.

**R1-s12. P2, blocking yes.** `home.js:29,376-406`, `cost.js:305,335`.
- **Evidence:** Home draws a third cost presence, a static row "Forecast up to £59.73 of the £100 ceiling", which matches neither Cost's meter nor its pill.
  - On a phone it sits after the holdings. Cost A puts a card before them, which the option admits, against "Holdings first on home" (MP40-Q14, README). Only Apple and part of NVIDIA show above the dock, where option B shows three holdings.
  - It never changes with state and shows no spend, though MP-142 asks for this month's spend.
  - Picks per journey cannot combine, and this is not in the page's open list.
- **Correction:** make Home carry the picked Cost element, with its states. Add the question to `OPEN`, including whether a card may precede holdings on a phone.

**R1-s13. P2, blocking yes.** `cost.js:113-121,183-197`.
- **Evidence:** MP-142's warning and reduced states have no drawing in option A.
  - Reduced appears only as a rung and a past event. No screen shows what is reduced and why, against MP-103's "every degraded mode is shown".
  - Warning appears only as a rung chip reading "Reached".
  - Also undrawn, non-blocking on their own: MP-100 and MP-89 partial, MP-112 past the ceiling, MP-166 `owner_enabled_detail`, MP-162 dismissed, MP-115 `forget_pending`.
- **Correction:** add `warn` and `reduced` variants of the Paused screen, and list the rest in the inventory's open items.

**R1-s14. P2, blocking yes.** `docs/design/reviews/MP-62/decision.md:165`, `docs/design/prism/index.html:2066`.
- **Evidence:** decision.md says the top 5 was corrected to "3 to 12 months". Prism line 2066 still reads "6 months · score = growth 35% + protection 40% + opportunity 25%" (lesson 1). The same page is the owner's live artifact.
- **Correction:** fix the line, add the retired fact (lesson 21), republish, record the sync.

**R1-s15. P2, blocking yes.** `cost.js:57`.
- **Evidence:** the home meter's accessible name is "Cost this month: On plan. Opens the month." The visible "£46.42 committed so far" and the forecast are absent, so assistive technology never gets the amount (WCAG 2.5.3 Label in Name). The nested `role="img"` ladder inside a button is presentational.
- **Correction:** put figure, word and forecast in the name.

**R1-s16. P2, blocking yes.** `scripts/design_gates.py:512-520`, `:431`, `:452`, `:669`, `:739-780`.
- **Evidence:** the static gate skips forms it cannot read (lessons 8 and 11). Each of these passed `check_journeys` when injected into the real page:
  - `font-size` in em, %, pt, `calc()`, `clamp()` or `var()`.
  - `font-weight:350`.
  - `-webkit-animation: ... infinite` and `-webkit-transition: width`.
  - Inline `animation ... infinite` and inline `transition: width`.
  - A single-quoted inline `font-size: 6px`.
  - `.cost-box { --ink:#BBB; --surface:#DDD }`: the stray-token refusal in `contrast()` is not run for Prism or Journeys.
- **Correction:** fail on any unread form, read vendor and inline forms, port the stray-token refusal, and add a selftest case for each.

**R1-s17. P2, blocking no.** `.github/workflows/verify.yml:65`, `scripts/review_checks.py:79-85`, `design_journeys_check.mjs:18`.
- **Evidence:** neither the walker nor the runtime gate runs in CI or in the selected checks. A change to the walker selects only Python checks, so nothing exercises it. Both hard-code a path in the sibling MA repo. `round-1-checks.json` shows `deferred: []`, while the CI step is titled "Every gated design holds 20% brightness contrast". In CI, `check_journeys` measures no contrast and renders nothing.
- **Correction:** run them in CI, or name them as deferred and retitle the step.

**R1-s18. P2, blocking no.** `privacy.js:176,308`, `shell.js:16`.
- **Evidence:** the Offline copy card says "This browser keeps nothing to read offline". The phone web frames still show "Offline · from 21:15", "Saved copies" and £46.42. MP-134 leaves PWA caching to the offline policy, and MP40-Q12 is open.
- **Correction:** either draw web and PWA offline with no private figures, or reword the card and add the question.

**R1-s19. P2, blocking no.** `privacy.js:140`, `:237`.
- **Evidence:** of a revoked iPad that has not connected, the screen says its copy "cannot be read before then". An offline device cannot learn it was revoked, and the app reads the cache offline by design. The promise comes from MP-165's negative and matters most for a lost phone.
- **Correction:** put it to the owner as an open question (plan-sync rule 3), and until answered write "clears when it next connects".

**R1-s20. P2, blocking no.** `decision.md:176-178`, `design_journeys_check.mjs:51,60`.
- **Evidence:** three claims overreach:
  - "The exemption keeps the 3:1 floor" holds only in `design_runtime.mjs`, which sees the first view. The walker, the only gate reaching other sheets, skips exempt text outright.
  - "The one text exempt" ignores disabled controls and the phone web status bar, which has no exempt mark and is never measured behind a scrim.
  - "Every piece of MP's own text holds" is unproven: 376 distinct text items sit on linear gradients and skip the walker (sampled on iPhone and desktop, five states).
  - Separately, line 172 says three questions are new, while the `OPEN` list adds a fourth: Claude on or off at launch.
- **Correction:** restate each to what the gates show, and fix the count.

**R1-s21. P2, blocking no.** `shell.js:182`, `README.md:57`.
- **Evidence:** in the inventory an n/a cell's reason lives only in a `title` attribute. It shows "n/a", with no reason on touch or by keyboard. decision.md says this reading is put to the owner. The reason does appear under the board.
- **Correction:** print the 19 reasons in a list under the table.

**R1-s22. P2, blocking no.** `cost.js:222`.
- **Evidence:** Does it fit, Ready, shows the months with no condition. The Grow 55 condition appears only under Abstaining. TECH-STACK says the fit "stays conditional on the Grow 55 checkout price, listing rights and the measured workload". The specification adds that the 27p margin excludes unmodelled lines, about £0.15 of transfer plus Terraform state and scan compute.
- **Correction:** state the conditions in Ready, and on the 27p line.

**R1-s23. P2, blocking no.** `.claude/rules/design-sync.md`, `docs/design/journeys/README.md:13`.
- **Evidence:** the rule says "A new value or component is added to Prism first, not drawn on one page". The README allows journey CSS, and `cost.css` and `privacy.css` define the ladder, rungs, stepper and signed-out cover with raw radii and sizes.
- **Correction:** promote these to Prism, or reconcile the two records.

**R1-s24. P2, blocking no.** `cost.js:29,65,188,263`.
- **Evidence:** Empty shows "New month" and "AWS arrives tomorrow" under the fixed "November · day 18 of 30". Paused, Loading shows day 18 and £46.42 on a day 24, £71.20 screen.
- **Correction:** pass the day and figures through each state.

## P3

**R1-s25. P3, blocking no.** `scripts/design_tokens.py:249`, `:114-121`.
- **Evidence:** the line `... == ... is False` is a chained comparison that can never be true, so it is dead. No selftest case proves the stale-file refusal. A token of any other `$type` is dropped from Swift silently.
- **Correction:** add a mutation for a stale `tokens.css`, and fail on unknown types.

**R1-s26. P3, blocking no.** `cost.js:90,120-121`, `privacy.js:98`.
- **Evidence:** figures that disagree:
  - In disagreement, AWS stays "Forecast £18.64" while the month rises to £60.04.
  - In Abstaining, the £75 to £100 rungs say "Not reached" under an unknown forecast.
  - The privacy inbox's Ready has "Cost warning reached: Forecast passed £60" while Cost's Ready is 27p under.
- **Correction:** raise AWS by £0.31, say "Not known" on those rungs, and word the notice to fit.

**R1-s27. P3, blocking no.** `cost.js:161-163`, `cost.css:61`.
- **Evidence:** only "By feature" of MP-100's five drill-downs is drawn. The chips are 32 px with no extended hit area, against the README's 44.
- **Correction:** draw the others, and raise the target.

**R1-s28. P3, blocking no.** `cost.js:8`, `:54-60`.
- **Evidence:** the home meter has no legend, and its blue and teal are the US and UK colours in the bar directly above it.
- **Correction:** use the cost colours on their own, or add words.

**R1-s29. P3, blocking no.** `privacy.js:125,148,228`, `:52,58,66`, `privacy.css` (`.privacy-step.now`, `.unread`).
- **Evidence:** copy and cue slips:
  - The desktop and iPad frames say iPhone is "This device".
  - iPad signs in by "Passkey", but no iPad passkey is listed.
  - "newest 2 days ago" conflicts with "active now".
  - "Nothing changes until the last step" sits above a revoke at step 3.
  - Empty says "No other device to confirm on" above "Use a passkey on your iPhone or Mac".
  - The current step and unread state have no text cue.
- **Correction:** fix the copy, and add `aria-current` and hidden text.

**Coverage:** I reviewed the cost and privacy journeys in code and rendered screens, and all listed tooling and records, and confirmed these current:
- the recorded figures and thresholds
- `design_tokens` at 77 tokens and 98 pairs
- the `ds-journeys` hash in `artifacts.json`
- SvelteKit 3.1.1, Svelte 5.57.3 and the device list

I found no refusal removed across the branch's commits. I could not check Jira, a real phone or assistive technology, or press controls end to end. One capture command was refused by the shell's removal check, though it held no removal, so I ran it from a file as the brief allows. Nothing was deleted or edited in the repo.
