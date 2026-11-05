# Prism UX audit and Claude handover

Prepared for Arun and Claude on 4 November 2026; interactive-browser addendum on 5 November 2026. Tracking: [MP-181](https://duttaarun2015.atlassian.net/browse/MP-181).

**Status: independent review round 1 completed on commit `fff5e2b`, with no blockers and one P3 follow-up. No UX approval or application implementation authority is implied.** See the [review record](../../../../review/MP-181/round-1.md). Source baseline: `bf2ed3033cc5b8a320118e66b2b1dc8678366740` on `main`.

Prism has a coherent product-specific foundation and unusually extensive state coverage. Preserve its selected identity, owner journey flips and admin choices. The next work should make the designs dependable as a handover: resolve contradictory stories, distinguish working interactions from illustrated controls, specify accessible behaviour, and close evidence gaps before treating the screens as implementable contracts.

**Update, 5 November:** A separate Playwright MCP connection enabled representative visual and keyboard/pointer inspection. Read the [interactive browser follow-up](visual-follow-up-2026-11-05.md) for screenshots, confirmed findings and new UX-15. The combined handover now contains 15 findings (5 P1, 9 P2, 1 P3). The original-run methodology and score below remain dated evidence.

## Method and limits

This is an **Impeccable audit**, using version 4.8.0, its audit playbook and Operate-mode guidance, plus the project design-first rules. The source and documentation assessment is single-author. It is not the skill's separate dual-agent `critique` workflow, nor a project independent-review round. The latter requires separate consent under `.codex/rules/workflow.md`.

The scope is the current Prism system, all eight owner journey definitions and all ten admin journey definitions, their shared shells, generated pages, permission inventory, decision records and check implementations. Historical options in `reviews/MP-62` supply provenance, not a competing redesign brief. Read depth varies: shared foundations and the findings below received focused source inspection; every journey received an inventory/coverage pass and the automated matrix walk. This is not a claim of manual line-by-line inspection of all journey code.

During the original 4 November run, the interactive browser tool returned **“The browser access host is unavailable.”** No human-style visual screenshot assessment, live overlay, VoiceOver session or physical-device check was completed in that original run. The 5 November addendum supersedes only the visual/interactive-browser part of this limitation. Existing repository browser checks did execute in locally launched test browsers. Their results are evidence of what those scripts measure, not substitutes for the missing observations. No native SwiftUI app was exercised. Do not describe this report as a completed visual or WCAG conformance certification.

`impeccable context --target docs/design` found an incumbent implementation but no root PRODUCT.md, DESIGN.md or matching surface brief. That permits an audit of the existing system; it does not justify a redesign or silently creating new product truth.

## Preserve these decisions

The live local decision records supersede older planning and memory notes. In particular, the reconciliation README still carries an older “UX not started” heading. Do not use that heading to discard the later selected design work.

| Area | Current authority | Preserve |
| --- | --- | --- |
| Identity | [MP-62 decision](../../reviews/MP-62/decision.md), [Prism README](../../prism/README.md) | Prism selected 3 November; MA-derived ink/fonts and selected motion language; selection is not full UX approval |
| Owner journeys | [Owner README](../../journeys/README.md), MP-62 decision | Both options kept on all eight journeys; A initially; per-device preference intended; flips forbidden on binding/write steps and open sheets; shared facts agree, one side may show more |
| Admin home | [MP-64 decision](../../reviews/MP-64/decision.md) | B, Nine places |
| Audit | MP-64 decision | B, Explorer |
| Other admin journeys | MP-64 decision | A for Files, Runs, Agents, Models, Approvals/configuration, Costs, Incidents, Identity |
| Admin location and phone policy | MP-64 decision; [permissions.json](../../admin/permissions.json) | Under Settings; phone reading plus accepted acknowledgement/account-recovery exceptions; no general admin write access on phones |
| Forecasts | Owner README | 3/6/12-month forecasts lead; short-term sessions separate; conditional scenarios do not claim likelihood; evidence and uncertainty remain accessible |
| Money and actions | Project agreement | No trading, no broker credentials, no personalised financial advice; append-only audit; £100 combined monthly ceiling, £70 planned and £30 reserve |
| Publication | Current local design records | Local-first prototypes; private Claude artifacts are recorded destinations. This audit authorises no new sync or publication |

“Recommended” on a historical option is not the owner's current selection. The admin shell correctly displays recorded picks; keep that distinction.

## Audit health

**Implementation integrity verdict: coherent foundation, incomplete behaviour contract.** The product is recognisable through holdings-first views, forecast ranges, provenance, approval binding, cost controls and privacy. Generic cards are not intrinsically a fault in an operational tool. The main weakness is that comprehensive screen drawings can look more executable and settled than they are.

Scores below are provisional expert assessments on Impeccable's 0–4 scale. Unknowns lower confidence; they are not asserted runtime failures.

| Dimension | Score | Reason |
| --- | ---: | --- |
| Accessibility | 2/4 | Focus styles, text alternatives and contrast checks exist; sheet focus management and illustrated controls leave important behavioural gaps |
| Performance | 2/4 | Bounded motion and incremental screen creation exist; full production/browser/device performance is unproved; see runtime evidence for the narrower measured result |
| Theming | 3/4 | 77 canonical tokens, generated CSS/Swift and passing pair checks; component recipes still embed many metrics and independent motion values |
| Responsive design | 2/4 | Four frame types and both themes are walked; arbitrary widths, enlarged text, virtual keyboards and actual touch gestures are not proved |
| Implementation integrity | 2/4 | Generated outputs match sources and choices are explicit; unresolved owner/admin stories and live-versus-illustrated affordances prevent a clean build handover |
| **Total** | **11/20** | **Significant handover work remains; this is not a verdict that the selected visual identity should be replaced** |

### Strengths to retain

- The owner matrix covers 1,152 combinations and 1,176 flip presses without a reported failure. The admin matrix covers 1,600 combinations without a reported failure. Both builds match their checked-in sources.
- Freshness, partial/failed states, no-trading wording, forecast provenance and explicit proposed decisions are central to the design rather than hidden legal copy.
- Admin actions are routed through an 82-action permission inventory with 19 explicit refused acts, as recorded in MP-64. Preserve its phone exceptions and binding checks.
- Reduced-motion handling includes a specific opacity alternative for the sheet demo. Do not report the global duration override alone as proof that every reduced-motion interaction is broken.

## Prioritised findings

The original 4 November assessment contains **14 handover findings: 0 P0, 5 P1, 8 P2 and 1 P3**. P1 means resolve before relying on this as a complete UX/build handover; some P1s are decision or validation gaps, not demonstrated production defects. P2 means address in the next design pass. No finding authorises Claude to implement application code.

### UX-01 — P1 — The working confirmation demo does not manage modal focus

**Evidence:** [Prism index](../../prism/index.html), lines 2007–2030, `renderPatterns()`. `#sheetDemo` declares `role="dialog" aria-modal="true"`. Its `open()` function only toggles CSS classes. It does not focus the dialog, contain Tab navigation, make the background inert or restore focus to `#sheetOpen`. Escape is handled. This is a source-confirmed behavioural gap in an interactive example, not merely a static board.

**Impact:** A keyboard or assistive-technology user can be left in the background while a confirmation is visibly open. Claude could copy the example and reproduce the fault throughout approvals and destructive actions.

**Handover:** Define a shared Sheet/Dialog behaviour contract: initial focus appropriate to the consequence, background inertness, contained focus, labelled heading, Escape/cancel semantics, return focus, and announcement of success/failure. Use a native dialog or a well-tested equivalent for an authorised web prototype fix. Keep static storyboard sheets distinct from active dialogs.

**Acceptance:** Open with keyboard; focus enters; Tab/Shift+Tab stay inside; cancel returns to the trigger; closed sheet controls cannot receive focus; screen reader announces the correct title; an action is not repeated on dismissal. Add a focused behavioural gate when the example is changed.

**Command:** `/impeccable harden`. Reference: [W3C modal-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), which describes initial focus, contained navigation and return focus.

### UX-02 — P1 — Screens imply a navigable journey beyond what the prototype implements

**Evidence:** [Admin shell](../../admin/src/shell.js), `act()`, `item()`, `bs()` and `btn()`; [admin Home](../../admin/src/journeys/home.js), `tiles()` at line 29. The tiles are focusable `div role="button"` elements but carry no route target. The admin shell's screen click handler addresses `[data-flip]`; it does not navigate these tiles. Many generated action buttons illustrate a proposed action with no execution handler. Owner journeys likewise mix working horizon/dossier/flip controls with drawn navigation and confirmation controls.

**Impact:** Arun or a future implementer can mistake screen completeness for task completeness. An assistive-technology user encounters buttons that promise an action without an outcome. This does not mean a design prototype should execute real writes.

**Handover:** Add a prototype interaction contract with three states: working demonstration, illustrative control, and unavailable-by-policy control. Provide a linked, synthetic route through selected screens, or an explicit screen-to-screen flow map where interactions remain illustrative. For actionable navigation use real links/buttons; custom button semantics must support Enter and Space. Do not connect live authentication, paid calls or financial writes.

**Acceptance:** From Portfolio, explain and demonstrate the route to Research, Imports, Approvals, Privacy and Admin; from selected Admin B, reach each selected journey and return to Settings. Each remaining illustration is visibly identified as such. Include cancel/back/retry paths. A keyboard task script must reach the same endpoints as a pointer script.

**Command:** `/impeccable harden`, then `/impeccable clarify`.

### UX-03 — P1 — Cross-journey contradictions are documented but not resolved

**Evidence:** [Admin shell](../../admin/src/shell.js), `OPEN` at lines 297 onward, explicitly records: owner cutoff 21:00 versus the daily-clock +60 cutoff at 22:00; 6 originals versus 8 receipts; passkey-specific revocation versus fresh-sign-in wording; replacement passkey device differences; R1-LGB naming versus an R1 ridge definition; and notice dismissal versus incident acknowledgement. [Owner shell](../../journeys/src/shell.js), `OPEN`, also records unresolved contracts.

**Impact:** The same underlying event can acquire different meanings depending on the screen. A coherent visual system cannot make inconsistent operational or scientific stories trustworthy.

**Handover:** Create a decision reconciliation table, one row per contradiction: source A, source B, governing contract, impacted screen IDs, owner decision needed, proposed resolution and acceptance evidence. Separate a harmless illustrative count repair from changes to scientific, security or operational policy. Do not silently choose which policy wins. This is a local design decision pack; external plan-sync remains separately authorised.

**Acceptance:** One canonical fixture/story for each settled event; all affected screens agree. Unsettled items remain visibly proposed with a named decision owner. A time assertion cannot fail before its illustrated scheduled start unless the scenario explicitly says this is a preflight failure.

**Command:** `/impeccable clarify` after the policy owner settles the facts; do not ask a styling command to settle policy.

### UX-04 — P1 — Forecast track-record and weekend-brief coverage remain explicitly absent

**Evidence:** [Owner shell](../../journeys/src/shell.js), `OPEN`: “Where do track records by horizon and regime live? (MP-154)” is answered “Not drawn. The journal shows only the scored decisions.” The weekend brief (MP40-Q11) is also marked “Not drawn.” [Forecast source](../../journeys/src/journeys/forecast.js) has forecast/proof/evidence screens, which do not by themselves establish the missing full track-record journey.

**Impact:** A reader can see a forecast without a complete route to judging its historical reliability by the relevant horizon/regime. The journal of personal decisions is a different evidence set from forecast evaluation.

**Handover:** First settle whether each missing journey belongs in the approved UX baseline. If included, propose its entry point and empty/insufficient-maturity/partial/stale states. Track-record UX should distinguish sample counts, evaluation windows, live versus walk-forward results, coverage, calibration and benchmarks, using already agreed scientific contracts. Never fabricate qualification thresholds.

**Acceptance:** Every included requirement maps to reachable screens and states. Where no outcome has matured, the design says so and withholds a misleading performance score. Excluded/deferred requirements have an explicit owner decision.

**Command:** `/impeccable shape` only after scope approval, then `/impeccable clarify`.

### UX-05 — P1 — Responsive coverage does not establish enlarged-text or native accessibility readiness

**Evidence:** [Owner shell](../../journeys/src/shell.js), lines 6–10: fixed drawing sizes 390×844, 1180×820 and 1200×950. Both shells' `fitFrames()` shrink wide boards to 70% before scrolling. [Matrix checker](../../../../scripts/design_journeys_check.mjs), lines 174–198, walks frame types inside a 1440×1000 browser viewport with reduced motion and true-size frames. This is useful but not a text-resize, arbitrary-width or native Dynamic Type test.

**Impact:** A passing board can still be hard to read in the review page or lose critical information at larger text sizes. Native-looking frames and Swift token generation do not prove native component behaviour.

**Handover:** Add a validation specification for 320/390/600/768/1024/1440 CSS-pixel widths, 200% text/zoom behaviour, long instrument/provider names, large and negative amounts, phone landscape, virtual keyboard and safe areas. Separate review-canvas scrolling from product scrolling. For native design specify Dynamic Type wrapping, VoiceOver order and accessibility actions; execute native tests only when an authorised app exists.

**Acceptance:** Risk, provenance, exact approval payload and cancel controls remain reachable and readable. Document real devices/engines and unsupported sizes. Do not infer a failure solely from a fixed storyboard frame. [W3C resize-text guidance](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) requires scaling up to 200% without loss of content or functionality, subject to its stated exceptions.

**Command:** `/impeccable adapt`.

### UX-06 — P2 — Chart scrubbing needs an explicit touch and cancellation contract

**Evidence:** [Prism index](../../prism/index.html), `wire()` at lines 1727–1753. The example supports pointer movement, pointer leave, focus/blur and left/right keys. No `touch-action`, pointer capture or pointer-cancel handling appears in that file. The pattern text promises “Hover, drag or use the arrow keys.”

**Impact:** A phone user may scroll while attempting to scrub, lose the selected point on gesture interruption, or struggle to obtain an exact value. These are risks inferred from source, not a demonstrated physical-device failure.

**Handover:** Specify horizontal inspection versus vertical page scrolling, tap-to-inspect, cancel/leave behaviour, and a textual data alternative. Preserve keyboard arrows and the existing tooltip status announcement. Avoid announcing every pixel of pointer movement.

**Acceptance:** Test tap, drag, vertical scroll, interrupted gesture and re-entry in touch-enabled Chrome/WebKit and a physical phone; record which were actually used. Keyboard and non-gesture access reach the same values.

**Command:** `/impeccable adapt` and `/impeccable harden`.

### UX-07 — P2 — The per-device flip promise exceeds the demonstrated persistence

**Evidence:** [Owner shell](../../journeys/src/shell.js), line 10 stores `flipped` in memory. The shell records route state in the URL but has no localStorage/sessionStorage preference implementation. Prism persists the theme, and admin persists comparison picks; neither is an owner journey preference store. The owner README promises per-device choices.

**Impact:** A prototype reader can assume that reloading or returning retains the preferred view because the written contract says so. The current demonstration does not establish that behaviour.

**Handover:** Decide and document whether the prototype will demonstrate preference persistence or explicitly label it as future behaviour. Define preference keys per journey/device, initial A, migration/fallback, storage-unavailable handling, and separation from sensitive draft or approval state. Do not persist holdings or sensitive payloads just to remember a layout.

**Acceptance:** Change one journey's preference, leave/return/reload, and verify the agreed behaviour without changing other journeys; forbidden flip contexts remain forbidden. This is a documented prototype fidelity gap, not proof of an application bug.

**Command:** `/impeccable harden`.

### UX-08 — P2 — Reviewer controls rebuild themselves without an explicit focus strategy

**Evidence:** Both [owner](../../journeys/src/shell.js) and [admin](../../admin/src/shell.js) shells: `show()` replaces `#jopt`, `#jsurf` and `#jstate`; their click handlers call `show()`. Unlike the flip handler and admin comparison handler, these paths do not explicitly restore focus. Inventory navigation also opens a journey/state rather than naming an individual target screen.

**Impact:** Keyboard reviewers can lose their place when changing option, device or state. Large screen sets make finding the intended changed screen unnecessarily difficult.

**Handover:** Preserve the active control or deliberately restore focus after rendering; announce the changed state once. Add stable per-screen links and a next/previous screen path, preserving journey/option/device/state. Avoid scrolling unexpectedly on routine state changes.

**Acceptance:** Tab and activate each shell control; focus remains on the corresponding selected control. Open an inventory cell and reach its named screen. Browser back/forward behaviour is explicitly documented. Verify the suspected focus loss in a browser before classifying it as a measured defect.

**Command:** `/impeccable harden`.

### UX-09 — P2 — Demonstration motion needs separation from operational motion

**Evidence:** [Prism tokens](../../prism/tokens.json) and [Prism index](../../prism/index.html), lines 823–844: 340ms base, 520ms slow, 950ms chart draw, 750ms count and staggered entry roles. Journey README asks for subtle arrivals. Impeccable Operate guidance favours short task feedback over repeated page-entry choreography.

**Impact:** Copying all showcase arrivals into frequently visited operational views could delay scanning and repeat unnecessary motion. Existing bounded iteration and reduced-motion alternatives are positives; duration alone does not prove a dropped frame. A separate runtime sweep did record a 50.7ms long animation frame in Chrome dark at 1440px, above the 50ms gate; all seven other engine/theme/width cases passed. See validation.md for the targeted repeat. Retain this measured performance warning alongside the design recommendation.

**Handover:** Keep the selected identity. Classify motion into showcase, navigation, state update, chart inspection and confirmation. Propose shorter task transitions and immediate stable data on return visits; preserve intentional animation where the owner selected it. Keep essential status visible before animation completes.

**Acceptance:** Compare normal/reduced motion on actual task transitions; no hidden risk while entering; interruption lands in a correct state; rapid repeated input does not queue a choreography. Obtain approval before changing the selected motion character.

**Command:** `/impeccable animate`, then `/impeccable optimize`.

### UX-10 — P2 — Gate descriptions overstate parts of the readability guarantee

**Evidence:** [Owner README](../../journeys/README.md), line 84, says text is at least 12px. [Matrix checker](../../../../scripts/design_journeys_check.mjs) rejects below approximately 11px, and applies 4.5:1/full and approximately 3:1/dim to visible text rather than a semantic body-tier classification. [Prism README](../../prism/README.md) states body 7:1/full and 4.5:1/dim. Token pair checks do test their declared tiers; that does not prove every body element uses a body-tier pair. The dim calculation in [runtime checker](../../../../scripts/design_runtime.mjs) is a mathematical luminance scaling model, not a physical brightness measurement.

**Impact:** “All gates pass” can be read as proof of a stricter minimum than those scripts actually enforce. No under-12px product text is asserted here solely from this mismatch.

**Handover:** Align the written contract and gate thresholds after confirming the intended exceptions. Classify body versus secondary/control text. Call the dim result a simulated 20% luminance check and add physical-device evidence to support the owner's brightness objective. Distinguish the project's 44-point/pixel target goal from WCAG AA's 24 CSS-pixel minimum with exceptions.

**Acceptance:** Synthetic fixtures demonstrate that a prohibited 11px label and a body-tier contrast failure are rejected while approved exceptions remain visible. Record manual brightness observations separately. [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) explains the 24px minimum and exceptions; it does not replace Prism's stronger target goal.

**Command:** `/impeccable audit` after correcting the checks.

### UX-11 — P2 — Token governance is stronger for colours than for component recipes

**Evidence:** [Prism README](../../prism/README.md) calls tokens.json the only place a value changes. Both shells embed numeric padding, typography, radii and heights in templates. The embedded Claude styling in [Prism index](../../prism/index.html), around lines 1255–1278, includes literal durations and curves. [Journey builder](../../journeys/build.py) extracts sections from Prism HTML using textual markers and independently loads the shared Claude fragment.

**Impact:** A future “global” spacing or motion edit can miss duplicated literals. Conversely, mechanically replacing every number can destroy necessary chart coordinates and prototype device geometry.

**Handover:** Audit repeated semantic component metrics, distinguish intentional illustration geometry, and consolidate only genuine shared recipes. Document the builder dependency graph: canonical tokens → CSS/Swift; Prism/shared Claude assets → owner/admin generated HTML. Change sources and regenerate outputs; never fix only the generated index files.

**Acceptance:** A representative shared component adjustment propagates to Prism, owner and admin pages; build checks remain current; approved exceptions are named. Avoid a broad generator refactor unless separately scoped.

**Command:** `/impeccable extract` or `/impeccable document` after choosing a bounded scope.

### UX-12 — P2 — State coverage is extensive but does not test combined conditions

**Evidence:** The [owner shell](../../journeys/src/shell.js) selects one of nine top-level states; the [admin shell](../../admin/src/shell.js) selects one of ten. Both render functions accept a single `ctx.state`. A matrix pass verifies these defined states, not every independent state combination. Admin's generic empty fallback says a view fills when there is something to show; individual journeys may override it.

**Impact:** Offline plus expired approval, stale billing plus withdrawal of paid consent, and privacy mode plus a failed import can expose interactions absent from the single-state menu. A drawn state count is not a transition-coverage count.

**Handover:** Define a small risk-based transition matrix, using the existing accepted decisions: stale/conflicting approval at execution, billing unknown with consent withdrawal, offline recovery, partial market data with abstention, and hidden amounts after an error. Distinguish no activity, nothing due, no access and failed-to-load empty screens.

**Acceptance:** Each scenario names trigger, facts retained, controls enabled, recovery path and final audit evidence. Sensitive writes never become allowed merely because one higher-priority visual state hides another. Test a bounded set; do not generate an unmanageable Cartesian product.

**Command:** `/impeccable harden` and `/impeccable onboard` for first-use empty states.

### UX-13 — P2 — Cost chronology and terminology need one explanatory contract

**Evidence:** [Admin home](../../admin/src/journeys/home.js) presents £46.42 committed on day 18 of 30 while the admin shell uses 4 November. [MP-64 decision](../../reviews/MP-64/decision.md) explicitly says the cost month has its own illustrative calendar. [Owner cost](../../journeys/src/journeys/cost.js) and [admin costs](../../admin/src/journeys/costs.js) are separate journeys. The owner shell lists unresolved billing freshness and budget-change questions.

**Impact:** Readers may compare numbers from different illustrative periods or treat held, committed, billed and forecast amounts as interchangeable. This is a comprehension risk; the distinct calendar is deliberately documented, not an arithmetic defect established here.

**Handover:** Use the same visible period and timezone when comparing cost views, or repeat a clear period qualifier where they differ. Provide one plain-language glossary for held/reserved, committed, provider-reported and estimated totals; carry unknown/freshness labels with amounts. Preserve the owner-selected location of budget changes in Admin under Settings.

**Acceptance:** A first-time reader can explain what counts toward the £100 ceiling, what remains unknown, and whether an approval increases permitted spending. No proposed threshold or estimated provider charge becomes authoritative through copy editing.

**Command:** `/impeccable clarify`.

### UX-14 — P3 — Add a concise entry point for future design agents

**Evidence:** Impeccable context finds no PRODUCT.md/DESIGN.md/surface brief; actual authority is distributed across Prism, journey READMEs, decisions, permission inventory and planning docs. These existing files are substantive, so missing filenames are not grounds to rebuild the system.

**Impact:** A new agent can follow older planning headings or a historical “recommended” option and undo selected work.

**Handover:** Add a short source-of-truth index, or approved PRODUCT.md/DESIGN.md pointers, that links current decisions and identifies superseded headings. Keep one owner for each fact. Do not duplicate the entire system into another competing specification.

**Acceptance:** A fresh agent can identify selected options, pending decisions, source/generated files and forbidden actions from one entry point. This report can serve that purpose until a permanent index is approved.

**Command:** `/impeccable document`; use `init` only if product truth itself needs eliciting.

## Coverage and next work by journey

This table is a follow-up map, not 18 separate newly proven defects. All listed journeys were included in the automated walk. Follow-ups are derived from the findings above and the source inventories.

| Journey | Keep | Claude's focused follow-up |
| --- | --- | --- |
| Owner Home | Holdings first; both Tiles and Ledger | Confirm range discovery and provenance; test partial/stale values without changing shared facts |
| Holdings/imports | Separate holdings and import spaces; append-only correction | Connect synthetic preview → exact approval → receipt → correction; reconcile original counts |
| Forecast | Long-term first; short-term apart; scenarios separate | Complete track-record route; touch/text chart access; no-maturity state |
| Research | Brief and Thread; citations; Claude explains | Make source opening and interrupted explanation behaviour explicit; settle weekend scope |
| Journal | Decision support; matured outcome comparison | Distinguish saving, unknown commit, committed and correction; accessible confirmation |
| Owner Cost | Meter and pill; visibility from home | Shared period/glossary; unknown billing; route to Admin budget changes |
| Owner Approvals | Binding protection; no flip on proposals | Expiry, stale revision, cancellation and step-up as transitions, not isolated cards |
| Privacy/recovery | Hidden money; device recovery | Reconcile with Identity; define masking across errors, offline copies and notifications |
| Admin Home B | Nine places, selected by owner | Real prototype route map; keyboard links; persistent urgent status without redesigning the directory |
| Files A | Status queue and version comparison | Consistent source counts; no repeat commit on retry; phone restrictions |
| Audit B | Explorer and lineage | Actor vocabulary, notice/incident distinction, gap meaning and accessible filters |
| Runs A | Tonight's clock | Resolve cutoff/start times; timezone and market chronology; recovery entry points |
| Agents A | Roster, versions, memory and costs | Actor/permission boundaries; revoked sources; unknown usage; no implied model authority |
| Models A | Pipeline and evaluation evidence | Correct model identity, maturity/probation clarity, scoped restart proof |
| Admin Approvals A | Settings by version | Old/new version comparison, exact payload, expired/conflict recovery |
| Admin Costs A | Side by side | Same cost semantics, reserve versus spend, withdrawing paid use when collection fails |
| Incidents A | Timeline and recovery | Acknowledged versus resolved; account recovery versus operational restore; scoped retries |
| Identity A | Paths first | Recovery-path count, Developer Program dependency, revocation semantics matching Privacy |

## Persona and cognitive-load checks for the next pass

**Frequent operator:** trace an incident to the run, evidence, permitted recovery and receipt. Avoid re-reading unrelated cards or having to remember identifiers between screens. Nine admin destinations are a selected directory, not a reason to force an arbitrary four-item menu. Group context and show what needs attention without changing the selected layout.

**First-time owner:** start with no holdings, add an illustrative statement, inspect uncertainty, approve exactly the draft and understand the receipt. Explain “cutoff”, “calibration”, “abstention”, “held cost” and “fresh sign-in” where a decision depends on them. Preserve concise expert labels with in-place help rather than replacing precise terms with vague language.

**Keyboard/low-vision user:** switch state, open a confirmation, inspect chart values and return to the originating control. Prioritise focus, enlarged text and reading order over additional decorative polish.

**Interrupted phone user:** hide amounts, inspect a pending item, leave and return, then see an expired/offline state. Preserve view preference but never preserve expired authority. The reassuring ending is an explicit receipt or “nothing changed”, not an ambiguous success toast.

## Detector triage

Raw output is retained in [impeccable-detector.json](evidence/impeccable-detector.json). Exit code 2 means findings, not a crash. It emitted **114 warnings**: 96 low-contrast, 17 cramped-padding and 1 tight-leading. Distribution: Prism 110, owner generated page 2, admin generated page 2. All reported line numbers are 0.

Do not turn these counts into 114 confirmed defects. The source scan cannot fully resolve runtime-generated screens. Examples pair dark-theme ink `#f3f5f8` against white or black against a dark surface, while the dedicated token checks pass both themes. These are suspected theme/context false positives, not all dismissed without inspection. Use the runtime result and a rendered element inspection to decide each applicable contrast warning. The `segctl`/`tblwrap` padding findings can be intentional control/table containers. The 1.29 line-height warning can flag the chosen 17/22 type rhythm; it is not automatically a readability failure.

Keep the selected palette unless a specific rendered pair fails. Record rule, selector, theme, actual background, measured ratio and disposition before changing it. The Prism runtime sweep passed its text-contrast checks in all eight engine/theme/width cases, although one case failed the separate animation-frame budget. That narrows the static warning concern for the measured text; it does not dispose of every source warning. No live detector overlay was installed.

## Claude execution order and acceptance

1. **Read and preserve.** Read this report, local Codex/Claude workflow applicable to your session, current MP-62/MP-64 decisions, Prism and both journey READMEs. Confirm the working-tree state and source baseline. Read existing fixed findings before proposing fixes; do not undo established fixes or silently reset review-round counts.
2. **Resolve policy and scope.** Prepare the UX-03/04/13 decision table. Separate facts that can be reconciled from choices requiring Arun. Do not silently edit architecture, scientific rules, approval policy or privacy guarantees.
3. **Repair shared prototype contracts when authorised.** Address UX-01/02/06/08 in the shared system/shells first, then regenerate both journey pages. Add focused checks for the defects these changes address. Keep prototype actions synthetic.
4. **Complete coverage evidence.** Address UX-05/07/10/12: enlarged text, touch, view preference and compound-state scenarios. Retain explicit “not tested” rows for physical/native checks that cannot run.
5. **Refine shared recipes and copy.** Address UX-09/11/13/14 without replacing Prism. Obtain the owner's choice for material design changes. Use `/impeccable polish` last, after meaningful gaps are closed.
6. **Re-run the bounded gates.** Token and build freshness, static design checks, complete owner/admin matrices, relevant interaction checks and targeted accessibility tests. Run real fixed-finding ledgers only under the applicable explicit approval. Offer a fresh independent review under the project's current consent and round rules.

**Definition of handover readiness:** each P1 has either verified closure or an explicit owner-approved deferral; source/outputs agree; selected choices remain intact; every claimed interaction and device behaviour has corresponding evidence; unresolved choices are not presented as implementable policy. Passing gates alone does not grant UX approval, application implementation permission or publication authority.

## Validation evidence

See [validation.md](validation.md) for exact commands and results. Initial passes:

- 77 tokens and 98 contrast-pair measurements pass; generated CSS and Swift are current.
- Static design gates pass Prism, both current journey pages and the historical hybrid references included by that gate.
- Owner and admin `build.py --check` pass without rewriting sources.
- Owner browser matrix: 1,152 combinations, 1,176 flips, 0 reported problems.
- Admin browser matrix: 1,600 combinations, 0 flips by design, 0 reported problems.
- Impeccable source detector completed with warnings requiring triage as above.

At original authoring, no real review-regression ledger, independent reviewer, plan-sync operation, app test suite, native build or artifact publication had run. The subsequent MP-181 independent round and its approved regression precheck are recorded separately. Backend suites would not validate a documentation-only audit. No new runtime cost, data licence entitlement or prediction-validity claim is introduced.

## Suggested prompt for Claude

> Read `docs/design/handover/impeccable-2026-11-04/README.md` and `validation.md`, then verify the source baseline against the current checkout. Read the independent review record at `review/MP-181/round-1.md`; its approval of the handover does not close the 15 UX findings or authorise building the application. Preserve Prism, both owner options and their safe flip rules, and the exact MP-64 admin picks. First prepare a response to UX-01 through UX-14: confirm, refute with evidence, or identify the owner decision needed. Include UX-15 and the updated evidence in `visual-follow-up-2026-11-05.md`. Separate prototype fidelity defects, policy conflicts and untested hypotheses. Propose bounded design/prototype fixes and their acceptance checks, following the approval rules of this session. Change canonical sources and regenerate outputs, never only the generated pages. Do not publish, sync external plans, implement the application, alter scientific/security policy, run independent review or ship without the applicable permission. Return per-finding evidence and a list of remaining decisions.
