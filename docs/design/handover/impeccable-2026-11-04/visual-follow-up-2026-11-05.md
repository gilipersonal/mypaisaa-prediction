# Interactive browser follow-up

**5 November 2026 · MP-181 · Maker assessment, subsequently independently reviewed in round 1 at `fff5e2b`.** See the [review record](../../../../review/MP-181/round-1.md): no blocking findings; one P3 repeatability follow-up. This supplements the [original audit](README.md). The 76 source/check hashes still match the original manifest; the report branch was at `da378ef39ec783e6019c406afc58216ed775f6ff` before this follow-up.

The original computer-use browser host still returned “The browser access host is unavailable”. A separately exposed **Playwright MCP connection worked**, allowing real page navigation, pointer activation, keyboard presses, viewport resizing, DOM inspection and screenshot capture in an isolated context. No native-app browser control was used. Chrome reported version 156 in its user agent; this is a desktop browser rendering HTML phone/tablet frames, not an iOS device or Safari test.

The prototype files were served from a temporary loopback-only server at `127.0.0.1:8768`. The server wrapped the HTML fragments in a UTF-8 document with an English language attribute and responsive viewport, matching the repository tests' artifact-host approach. That wrapper is a test fixture, not an edit to the prototype. The preview server and the isolated review tab were closed after inspection.

## What was inspected visually

Fourteen screenshots are retained under [visual evidence](evidence/visual-2026-11-05/). Nine are representative product-frame captures, two show the desktop system/review shell, two show narrow review pages, and one shows a theme mismatch. These are sampled frames, not a visual pass over every screen or every state.

| View | State and treatment | Evidence |
| --- | --- | --- |
| Prism system | Desktop, light, 1440×1000 viewport | [Screenshot](evidence/visual-2026-11-05/prism-desktop.png) |
| Owner review shell | Desktop Home, light | [Screenshot](evidence/visual-2026-11-05/owner-desktop-shell.png) |
| Owner Home A | iPhone frame, Ready, light and dark | [Light](evidence/visual-2026-11-05/owner-home-phone-light.png), [dark](evidence/visual-2026-11-05/owner-home-phone-dark.png) |
| Forecast A | Desktop frame, Ready, dark | [Screenshot](evidence/visual-2026-11-05/forecast-desktop-dark.png) |
| Holdings A | iPhone frame, Stale, light | [Screenshot](evidence/visual-2026-11-05/holdings-phone-stale.png) |
| Privacy A sign-in | iPhone frame, Offline, light | [Screenshot](evidence/visual-2026-11-05/privacy-phone-offline.png) |
| Selected Admin Home B | Desktop light and iPhone dark, Ready | [Desktop](evidence/visual-2026-11-05/admin-home-desktop.png), [phone](evidence/visual-2026-11-05/admin-home-phone-dark.png) |
| Admin Costs A | iPad frame, Partial, light | [Screenshot](evidence/visual-2026-11-05/admin-costs-ipad-partial.png) |
| Admin Identity A | iPhone frame, Denied, light | [Screenshot](evidence/visual-2026-11-05/admin-identity-phone-denied.png) |
| Owner review page | Actual browser viewport 390 and 320 CSS px, dark | [390px](evidence/visual-2026-11-05/review-page-390.png), [320px](evidence/visual-2026-11-05/review-page-320.png) |
| Owner theme switch | Dark outer page with mismatched light/dark frames | [Screenshot](evidence/visual-2026-11-05/theme-mismatch.png) |

The nine final product-frame screenshots and the two desktop system/review screenshots use reduced motion so values land immediately. Earlier trial captures caught the number-roll animation mid-count and were replaced; those transient values were not treated as arithmetic errors. The theme-mismatch screenshot records a separate normal-motion observation. This pass does not measure smoothness; retain the original runtime measurements for that claim.

## Visual assessment

The selected Prism direction holds up in the inspected frames. The large portfolio figure, solid data surfaces, understated provider chips and separate forecast colour make the information hierarchy readable. Light and dark retain the same hierarchy. The Holdings Stale frame explicitly identifies HSBC, shows why it is excluded, and labels £78,508.20 as a known partial value. This is stronger than a generic stale badge.

Admin Home B reads as a clear directory on desktop, with the pending decisions and incident explanation in a separate rail. On phone the warning precedes a long single-column directory; only the first four destinations fit in the initial frame. Keep the selected option, but verify navigation and scrolling to the remaining destinations. The static screenshot alone is not evidence that below-fold destinations are inaccessible.

The iPad Costs Partial frame visibly distinguishes bill, usage, estimate, held and total, and explicitly explains its cost-month clock. This qualifies UX-13: that screen already explains the distinct period. Follow-up should ensure the explanation survives navigation and smaller layouts, rather than adding redundant warnings everywhere.

The review page itself consumes substantial phone height before any design frame appears. At 390px, explanation and controls fill the first viewport. A compact reviewer toolbar or explicit jump-to-screen affordance is a useful proposed refinement under UX-08; it must not remove the explanatory context needed to compare options.

## Findings upgraded from source concerns to browser evidence

Exact results are recorded in [interaction-results.json](evidence/visual-2026-11-05/interaction-results.json).

| Finding | Executed action | Observed result | Disposition |
| --- | --- | --- | --- |
| UX-01 confirmation focus | Focus `#sheetOpen`, press Enter, press Tab four times, Escape | Opening leaves focus on `sheetOpen`, outside the dialog. Tabs reach `sheetClose`, `sheetRecord`, then `sheetUndo` outside the dialog and another background control. Escape does not restore focus to the trigger | Confirmed; preserve P1 |
| UX-02 illustrated navigation | Click the first Admin Home B tile, then focus it and press Enter and Space | The heading remains Admin home and the route remains `#home.b.web.default` after each action | Confirmed for the sampled tile; do not generalise to every control |
| UX-07 flip persistence | Flip first owner Home frame to Ledger, reload | `home|b|b-ledger` returns to `home|a|a-portfolio` | Confirmed for this per-frame preference demonstration; application behaviour remains unimplemented |
| UX-08 selector focus | Focus Desktop in the device selector and press Enter | Route changes to `#home.a.web.default`; active element becomes BODY | Confirmed loss of focus on this selector |
| UX-05 narrow review layout | Resize the actual browser viewport to 390px then 320px | 390px document width stays 390px. At 320px, document width is 329px, Phone web button right edge is 328.79px, and the header's brand/20% label visibly overlap | Confirmed review-shell defect, not proof that product frames fail at every narrow width |

For UX-05, the horizontally scrollable journey navigation strip is intentional and is not itself the reported overflow defect. The overflowing device selector and header collision are the actionable targets. Do not conflate this 320px check with browser zoom or native Dynamic Type.

## UX-15 — P2 — Theme switching does not update already-rendered owner frames

**Observed reproduction:** Load owner Home A in Light, wait for all 14 frames, then click Dark. The document root changes to `data-theme="dark"`, while all 14 existing frame wrappers remain `scheme-light` with background `rgb(244, 246, 251)`. Reloading applies the saved Dark theme. Switching during incremental frame creation also produced a light first frame and a dark next frame, captured in the screenshot.

**Source:** `docs/design/prism/index.html`, `setTheme()` at line 1460; `docs/design/journeys/src/shell.js`, `show()`, `scheme()` and `boardFor()`. Theme is sampled when each frame is created. The owner shell does not listen for the theme change to update existing frame classes. The admin comparison view has its own observer; it should not be assumed to repair the owner shell.

**Impact:** A reviewer can believe they are assessing the selected Dark theme while looking at Light product frames, or compare inconsistent theme states in one journey.

**Claude handover:** Make the review theme contract explicit and apply it atomically to current frames. Preserve the active journey, option, selected state, flip destination, scroll and focus. Do not rebuild a binding step in a way that changes its payload or loses its state. If mixed-theme comparison is deliberate in a future view, give that view separate explicit controls.

**Acceptance:** After the full row renders, Light → Dark → Light updates every intended frame's class, label and computed foreground/background without reload. Repeat while frames are being appended; no mixed set remains after rendering settles. Retain all current flip restrictions and selected journey options. Add a focused interaction gate when the authorised prototype fix is made.

**Impeccable command:** `/impeccable harden`, followed by `/impeccable audit` and final `/impeccable polish`.

There are now **15 findings in the combined handover: 5 P1, 9 P2 and 1 P3**. The original 11/20 score remains labelled as the 4 November provisional assessment; this sampled browser pass is not a full rescoring exercise.

## Remaining limits and next action

Physical touch gestures, VoiceOver, 200% text resizing/real browser zoom, native Dynamic Type, a native SwiftUI app and the live Impeccable detector overlay remain untested. An HTML iPhone frame is not native-device evidence. The only console error inspected was the temporary host's missing `favicon.ico` (404), which is not a product runtime exception.

Claude should use the new evidence to fix or explicitly label the prototype behaviour, then repeat the exact interactions above. The unchanged-source hash check allows the earlier static/token/matrix results to remain historical evidence; they were not rerun as fresh full suites for this documentation-only follow-up. The new report link/JSON/hash/whitespace checks are recorded separately. No real review ledger or independent review ran during this browser follow-up; the subsequent independent round is recorded at the link above. No application code, UX source, external artifact or product policy was changed.
