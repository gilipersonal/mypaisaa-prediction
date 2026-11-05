# Round 2, lane (f) Frames and pages

**Seven findings: one blocking, one P2 that needs the owner, one other P2, four P3.** All of them come from presses in real Chrome on `1484e7d`. Theme, Compare, the page bar and most stored-flip cases held. The worktree is unchanged, and my scripts are in `/var/folders/7v/76z_49bd75d052d1w83w19880000gn/T/mp182-r2-f/`.

## Findings

### R2-f1: P2, blocking yes
**Where:** `docs/design/prism/index.html:2048` and `:2061`

**Evidence:** Recording with the page moved leaves focus off screen. I opened the sheet, moved the page 1,500 px either way, and pressed Record.
- The other three ways out (Escape, the scrim, Not now) brought the trigger back into view at all 6 viewports.
- Record left focus on `sheetUndo` far out of view at all 6 viewports. At 1440x1000 it sat at `top: -884`, and at `top: 2116` when moved the other way.
- The toast was off screen too, so neither the confirmation nor Undo can be seen.
- Pressing Undo then puts focus on a trigger that is also out of view, because `:2061` still uses `preventScroll: true`.
- The line's own comment says "the way back finds the trigger, wherever the page was moved to", but `v || !!to` leaves out this one way out.

**Correction:**
- `:2048` becomes `focus({ preventScroll: v })`, and `:2061` becomes `trigger.focus()`.
- Tried on a scratch copy at 4 viewports, this gave 0 bad cases, and the stage's own `scrollTop` stayed 0.
- The selftest strings at `scripts/design_prism_press.mjs:423` and `:431` quote the old line and must move with it.
- Add a press of Record with the page moved, and a ledger entry.

### R2-f2: P2, blocking no (question for the owner)
**Where:** `docs/design/prism/index.html:1952` against `:1953` and `:1955`

**Evidence:** This delta adds "Record lands on Undo." to the sheet's accessibility text. The Toast entry on the same page still says "It never takes focus" in its lede and "Never takes focus." in its accessibility text. The press confirms the sheet's sentence: after Record, `document.activeElement` is `sheetUndo`, inside the toast. So one moment has two rules (lessons 27 and 47).

**Correction:** Toast is marked with owner status, so ask rather than guess (lesson 23). Either the toast's text gains "unless a sheet closes onto its Undo", or focus returns to the trigger and Undo stays reachable by Tab. The UX-01 acceptance only bars a hidden toast from taking focus, so the first is consistent with it. Change all three sentences together.

### R2-f3: P2, blocking no
**Where:** `docs/design/journeys/src/shell.js:16`

**Evidence:** A flip written by the previous build does not survive. I flipped a frame on `46b631b`, which stored `"from":["a","a-portfolio",{}]`, then reloaded the same origin with `1484e7d`.
- `flipOK` requires `f.from.length === 2`, so the record is refused.
- The frame came back on `home|a|a-portfolio`, not B.
- The next flip on any frame then wiped the older entry from storage, because `flipsSave` writes back only what `flipsLoad` accepted.
- `46b631b`'s subject is "Record the design sync", which suggests the artifact held that shape, so the owner may have such records. I read the commit subject only, not the artifact.

**Correction:**
- Accept `length >= 2` with `slice(0, 2)` of strings, and load `from` as `[f.from[0], f.from[1], {}]`. Tried on a copy: the old record then turned correctly.
- The selftest at `scripts/design_prism_press.mjs:438` quotes the old condition, so it must move with the fix.

### R2-f4: P3, blocking no
**Where:** `docs/design/journeys/src/shell.js:285-287`

**Evidence:** A kept flip whose way back names a screen that no longer exists leaves a dead control. With `from:["a","a-gone"]` or `from:["z","a-portfolio"]` the frame loads on B. Pressing its flip does nothing: `data-at` stays B, `#jlive` stays empty, and the record stays. Every later press does the same, and nothing on the page clears it. Screen ids do change between republishes, and storage outlives them. `goneTarget` already falls back safely, so only the way back is exposed.

**Correction:** When `back` finds no screen, fall back to the control's own `data-flip` target. Tried on a copy: the frame returned to A and the record cleared.

### R2-f5: P3, blocking no
**Where:** `docs/design/prism/index.html:2047`

**Evidence:** On short landscape screens the sheet opens with focus off screen. `scroll-padding-top` is 132 px there, so `block: 'nearest'` cannot bring the stage's foot into view.
- 568x320, trigger 180 px below the viewport top: `closeSeen: false`, stage `[70,346]`.
- 667x375, trigger 260 px down: stage `[132,408]`, and Not now and Record are both out of view.
- 740x360, trigger 240 px down: stage `[112,388]`, same result.
- 1440x1000, 390x844, 320x568, 800x600 and 1024x420 were clean at every offset. 844x390 opened with Not now and Record in view, though the stage's foot ran 15 px past the viewport.

**Correction:** After the `scrollIntoView`, add `const over = st.getBoundingClientRect().bottom - innerHeight; if (over > 0) scrollBy(0, over);`. Tried on a copy: 0 of 36 cases bad at 667x375 and 568x320. Add one short viewport to the press check.

### R2-f6: P3, blocking no
**Where:** `docs/design/journeys/src/journeys/cost.js:295` and `:301`, `docs/design/prism/index.html:533`

**Evidence:** `.cx[data-snug] text` enlarges the burn chart's labels on every device, though its comment says the need is on iPad, where they measure 12.07 px. Phones were already at 12 px or more.
- On iPhone and Phone web, "Day 24" and "30 Nov" overlapped by 10 px at base and 13 px now. "Day 23" went from 2 px to 5 px.
- The screenshot of Paused reads "Day :30 Nov".
- Labels past the SVG edge stay inside the card's 16 px padding, so nothing is clipped. iPad and Desktop do not collide.

**Correction:** Emit `data-snug` only when `ctx.kind === 'ipad'`, which keeps the iPad fix and restores the phone figures. Then drop or end-anchor one label when the day is 23 or later. The overlap existed before this delta, so the second part may be a new issue.

### R2-f7: P3, blocking no
**Where:** `docs/design/prism/README.md:26`

**Evidence:** The new sentence says `design_prism_press.mjs` "presses the live sheet and the page bar at every width". The gate steps `w += 3` from 320 to 820, in light theme only, with the 20% preview off. My own sweep shows the bar does hold, so the behaviour is right and only the claim overreaches.

**Correction:** Reword it to "every third width from 320 to 820", or make the loop step 1. Lane (s) owns the gate's own comment, which says the same.

## What I checked and found clean

- **Theme repaint:** 1,320 owner frames and 880 admin frames, in every journey, option and device, in Ready and Error, repainted in place. Compared on every element's computed colours against a fresh draw, there were 0 differences.
- **Compare after a journey change:** 220 cards across 10 journeys and 2 devices, with 0 differences. A 17-step sequence of journey, device, card Open, System and theme presses never left a card on the wrong scheme.
- **Theme and system in sequence:**
  - Frames still drawing, in a press and system sequence with real motion, ended right on both pages.
  - Theme pressed mid-flip kept the turn, the caption and the focus.
  - The system going dark under a pressed Light changed nothing.
- **Stored flips:**
  - `[]`, a string, a number, null and null entries all behaved, as did records with a wrong `landed`, an unknown state, a target screen that is gone, or an unknown journey, with no page errors.
  - Reload, the way back and the horizon going to its default all match the README.
  - One flip shows on all four drawn devices.
  - Two tabs merge their records.
  - I did not press refused storage. That is the gate's flip check.
- **Charts:**
  - All 576 owner and 800 admin combinations have no text below 12 px at true size.
  - `data-snug` lands on the research ask rail and on the burn chart.
  - At a 1440 px page, fit-to-page zooms the iPad frame to 0.98, so snug labels render at 11.82 px. The gate measures with fit off. This scales the whole frame and is not a delta fault, but it is the owner's call if UX-10 means rendered size.
- **Page bar:**
  - Every width from 320 to 1300, on three pages, both themes, 20% preview on and off.
  - There were no collisions, page overflow or spilled labels.
  - Bar height stayed at 60 px with the preview off.
  - The name changes at 400/401 and the "MyPrediction ·" prefix at 660/661, as written.
  - Theme buttons measure under 44 px at every width. That is unchanged by this delta, so I am not reporting it.
- **Sheet:** Tried in all four ways out at 6 viewports, with the page unmoved and moved both ways. Only Record failed, as R2-f1 records.
- **Doc claims:**
  - The admin README's sentence on Compare's rows matches the gate.
  - The new OPEN row matches the flip behaviour I pressed.

Not done, as the brief expected: a real iPhone, VoiceOver, the artifact viewer. All my browsers are closed. Any Playwright Chrome still running at the end belonged to another process, and I left it alone.
