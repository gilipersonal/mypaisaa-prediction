# MP-182 round 1, lane (f) Frames and pages: 12 findings, 6 blocking

Pressed in real Chrome (`channel: 'chrome'`, Playwright) at `46b631b`, using routed pages. No repo files changed. Scratch scripts are in `$TMPDIR/mp182-f`. All browsers are closed.

## Findings

**R1-f1, P1, blocking: Compare frames miss a system theme change under Auto**
- **Where:** `docs/design/admin/src/shell.js:156`, `:416-419`
- **Evidence:** on Admin `#compare`, Auto, system light, I ran `emulateMedia({colorScheme:'dark'})`.
  - The page background became `rgb(6, 10, 24)`.
  - The cards stayed `{ n: 12, dark: 0, color: 'rgb(20, 23, 31)' }`.
  - `repaint` calls only `sum.retheme`, which walks `#jrow`. `cmpWatch` observes only `data-theme`, and Auto leaves that attribute unset.
  - This breaks UX-15, "every frame already drawn on ... Prism Admin". The comment at `:155` claims the Auto case is handled.
- **Correction:** in `repaint`, also restyle `.acard .dev` in place, swapping `scheme-light` and `scheme-dark`, and drop `cmpWatch`. Extend `design_prism_press.mjs` theme with Compare under Auto.

**R1-f2, P1, blocking: a theme press on Compare loses the row's scroll**
- **Where:** `docs/design/admin/src/shell.js:417`
- **Evidence:** at 1000×800, `.acmp-row` scrollLeft was `[200, 200]`. After pressing Dark it was `[0, 0]`, with page y held at 500.
  - `drawCompare` rebuilds `inv.innerHTML`, which also wipes the `#cmpSaid` status text.
  - UX-15 says the page "keeps ... scroll".
- **Correction:** the same in-place restyle as R1-f1. A press check should scroll a row first.

**R1-f3, P1, blocking: the header still collides on the review pages**
- **Where:** `docs/design/prism/index.html:270`, `:272`, reaching both generated pages
- **Evidence:** I measured every width from 320 to 760, comparing the name's text range with the `#dimctl` left edge. Below 381 the name is visually hidden, so those widths don't count.

| Page | Widths where the name overlaps the switch |
| --- | --- |
| Prism | 561-619 |
| Journeys | 381-389, 561-647 |
| Admin | 561-624 |

- At 600 the text "MyPrediction · Journeys" prints over "Preview at 20%". At 385 "Journeys" touches "20%". Screenshots are `hdr-owner-600.png` and `hdr-owner-385.png` in the scratch folder.
- At 600, `.brand` is flex-shrunk to 187px while the text runs to 247px.
- `origin/main` has the same upper band and an overlap running to 389. MP-182 only moved the lower edge.
- The audit measured 320 and 390, but the acceptance's "the header does not collide" has no width limit.
- The gate tests only 320, 360 and 390.
- **Correction:**
  - Hide `.bfull` up to about 650px.
  - Raise the 380 threshold to about 392.
  - Rebuild both pages and record the design sync.
  - Add 385 and 600 to the `narrow` check.

**R1-f4, P1, blocking: frame text below 12 px on iPad**
- **Where:** `docs/design/journeys/src/journeys/cost.js:295`, and the Research and Journal chart labels
- **Evidence:** I walked every journey, option, device and state, multiplying computed size by `getScreenCTM`, with `__prismNoFit` on so there was no review zoom.
  - 455 owner SVG text runs fall under 12 px, down to 11.49 px.
  - All are on iPad:
    - `cost-b-burn`, `-warned`, `-reduced`, `-paused`, viewBox 460 drawn at 440.5, scale 0.958.
    - `ra-ask` and `rb-ask`, viewBox 340 drawn at 331.5, scale 0.975.
  - Admin has none.
  - The gate reads `cs.fontSize`, which stays 12px, so it cannot see this.
- **Correction:** set those charts' label size so it renders at 12 px or more (about 12.6px in viewBox units), or stop scaling the SVG. Make the gate read the effective size, and add a selftest case for it.

**R1-f5, P2, blocking: a reload does not show the frame as left, and the README's new sentence is false**
- **Where:** `docs/design/journeys/src/shell.js:251-254`, `:279`; `docs/design/journeys/README.md:64-65`
- **Evidence, Home:** I pressed 12 months, flipped and reloaded.
  - Before the reload: `hz:"2", hzOn:2`.
  - After it: `hz` was undefined, `hzOn:1`.
  - Flipping home then gave `hzOn:1`. The same flip with no reload returned `hz:"2"`.
- **Evidence, Forecast B:** ladder row AAPL, flipped, stored `"got":{"hz":"2","t":"AAPL"}`. After a reload `t` and `hz` were gone.
  - So `got` is saved but never read on draw.
  - An instrument name is stored, while the README says it "keeps only which view a frame is on". The audit's UX-07 also warns against persisting holdings for a layout.
- **Correction:** apply `f.got` in `boardFor` and `settle`, and reword the README to name exactly what is kept. Or store only `o`, `s`, `st`, `landed` and the `from` ids, and drop "as you left it". Lesson 47 applies either way.

**R1-f6, P2, blocking: the sheet can open off-screen, with focus on a control nobody can see**
- **Where:** `docs/design/prism/index.html:2044`
- **Evidence:** at 1440×1000 with reduced motion, the trigger was at `[948, 992]` and I pressed Enter.
  - `activeElement` was `sheetClose`, at `[1050, 1094]`, and the demo's bottom was 1114, all below the 1000px viewport.
  - `preventScroll: true` keeps it there.
  - Also, the wheel still scrolls the page behind an open sheet. After scrolling 600px and pressing Escape, focus returned to a trigger at top -86.
  - This is Prism's one live example, the one Claude would copy.
- **Correction:** after opening, call `sheet.scrollIntoView({ block: 'nearest' })`, and drop `preventScroll` on the return.

**R1-f7, P2, not blocking: a second tab wipes the first tab's flips**
- **Where:** `docs/design/journeys/src/shell.js:22`
- **Evidence:** with Home and Forecast open in two tabs, I flipped in each. Storage then held only `forecast|a|a-forecasts`, and after a reload Home showed `home|a|a-portfolio`. `flipsSave` writes the page's whole in-memory map.
- **Correction:** re-read storage and merge just the one key inside `flipsSave`.

**R1-f8, P3: a stale announcement after a selector press during a turn**
- **Where:** `docs/design/journeys/src/shell.js:281-290`
- **Evidence:** I flipped, then pressed Device, State or Option 70 ms later.
  - `#jlive` ended as "Ledger: Ledger view", overwriting the selector's words. On the Option press, Option B was showing by then.
  - Focus stayed correct.
- **Correction:** return early from the swap when `!box.isConnected`.

**R1-f9, P3: `flipsLoad` validates 4 of the 6 fields the flip uses**
- **Where:** `docs/design/journeys/src/shell.js:18-19`
- **Evidence:** a stored `from: 5` gave "TypeError: number 5 is not iterable". A stored `from` with no `got` gave "Cannot read properties of undefined (reading 'hz')". In both cases the frame's flip control went dead. It only happens with corrupted or older stored data.
- **Correction:** require `got` to be an object and `from` to be null or a three-part array.

**R1-f10, P3: "said once" is not what the page does**
- **Where:** `docs/design/journeys/src/shell.js:190`, `src/shell.html:30`, and the same in Admin
- **Evidence:** on a Device press with the title unchanged, a MutationObserver recorded 3 mutations inside `.jhead`, which is `aria-live="polite"` (`jtitle`, `jsummary`, `jmeta`), plus `#jlive`. I have not confirmed what a screen reader actually says, because VoiceOver was not run.
- **Correction:** write those three only when they change, or remove `aria-live` from `.jhead`.

**R1-f11, P3: a quick second Enter on Record undoes the record**
- **Where:** `docs/design/prism/index.html:2056-2057`
- **Evidence:** Enter, Enter on `#sheetRecord` ended with class `mdemo` and focus on the trigger. Focus had moved to Undo in between.
- **Correction:** ignore Undo for about 300 ms after recording.

**R1-f12, P3: two questions for the owner, and no record should change until he answers**
- **Which device does "kept per device" mean?** `shell.js:216`: a flip made on the iPhone frame also shows on iPad.
  - Evidence: on Forecast A, flipped then pressed iPad, the frame read `Turned to B · Ladder`.
  - The README now says "on this device", and the page has a selector called Device. Should the prototype keep a flip per drawn device?
- **May Prism's gallery shrink at narrow widths?** `index.html:272`: `.segctl.lg:not(.scr .segctl)` does not touch the header bar, because `#themectl` is not `.lg`. It only hits 5 gallery demos.
  - At 320 they show 13px, against 15px at 800, and the issue rules out changing Prism's look.
  - Does the owner accept this at 380px and below?

## Checked, nothing found

- **UX-08:** keyboard Enter or Space on every device × option × state, on Journeys forecast and Admin costs: 0 focus problems, focus on the pressed control. Mouse presses keep focus with no ring.
- **UX-15, journey row:**
  - Repaint against a fresh draw: 330 owner and 220 admin frames, system light and dark, 0 differences in HTML, caption, label or sampled colours.
  - A theme press during a flip at 40, 150, 200 and 300 ms.
  - Five theme presses while frames were drawing on Journeys.
  - Auto following the system, including a turned frame.
  - A theme press on the inventories followed by a return to a journey.
  - Page scroll held.
- **Compare:** pick, theme, press the pick again. Device, journey and pick all keep focus.
- **UX-01:**
  - Focus, trap and Escape, including a press while the sheet rises.
  - Opening twice, scrim, Record and reopen, Undo.
  - Background inert and restored to the baseline count of 14.
  - The sheet and toast fit at 320 and 390.
  - One minor note: after a click on the sheet heading, one Shift+Tab lands on BODY, then returns to the sheet.
- **UX-07:**
  - Restored across states, including `a-done` in Loading, where it correctly shows home.
  - Back press in Stale.
  - Double presses during a turn.
  - Storage refused.
- **UX-05:** 23 widths from 320 to 820, both themes, Prism with 20% preview on and off, all Journeys and Admin journeys and options, plus Compare and all inventories: no overflow or spill.
- **UX-10:** no pseudo-element text under 12 px and no `.mk` overflow.
- **Pressed-chip colours** at 360 look distinct in both themes (from computed colours, not a measured contrast ratio).
- **Lessons checked:** 2, 25, 31, 32, 35, 44 and 47. Lesson 47 is the one breached (R1-f5).

**Not tested:** a real iPhone, VoiceOver, 200% text. Inventory ticks and Compare's Open leave focus on BODY, which I left unreported as outside the option, device and state selectors.

Lane (s) should pick up two gate gaps from this: the `narrow` widths (R1-f3) and computed versus effective SVG size (R1-f4).
