# MyPrediction design system: round 2, Hybrid A and Hybrid B (MP-62)

**3 November 2026 · MP-62 (PH00-S05) · Options for the owner to choose · Not approved UX · No build**

Round 1 is [brief.md](brief.md); its product rules, shared illustrative figures and deliverables all still hold.
This brief adds what the owner asked for after seeing round 1.

## The owner's words

> "I am stuck between A and B, but the fonts and styling and animation effects I like the MA app better, check that.
> And create a hybrid A and Hybrid B. Reject C"
>
> "The apps should be colour contrasted in such way so that it is even visible at 20% mobile screen brightness level.
> Check all these features really careful. Smoothness is priority. Think hard and come up with the best UX design
> system"

So: C · Signal is rejected. Two hybrids are made, each its round 1 option rebuilt on MA's fonts, styling and motion,
held to a 20% brightness contrast rule and a smoothness budget, both measured by gates.

## One UX system, two looks

Both hybrids share one UX system: the same type, shapes, surfaces, layout, components, states, patterns and motion.
They differ only in identity (colour and signature motif), so the owner compares two looks of one system, not two
systems.

| | Hybrid A · Fan | Hybrid B · Prism |
| --- | --- | --- |
| Signature | The forecast fan: 50% and 80% range ribbons on every forecast, the fan horizon selector, the fan opening as the forecast's arrival | Segment colour fields: each market segment owns a luminous tile colour, Monzo's pots made into segment tiles |
| Colour | A's ink navy and warm paper, saffron for forecasts, mint for scored outcomes | B's segment palette on MA's warm paper and white cards, one action colour |
| Hero card | MA's deep navy hero card carrying the portfolio and a fan sparkline | MA's hero card, tinted by the selected segment's field |

## What comes from MA (MyPaisa DS v1, "Warm ledger": MA-101, MA-161, MA-181, MA-182)

Read these before drawing: `~/projects/mypaisa-agent/DESIGN.md`, `~/projects/mypaisa-agent/docs/design/ds-v1/`
(`tokens.css`, `ios.css`, `motion.css`, `motion.js`, `README.md`) and board 12 of `iOS kit.dc.html` (motion as it
ships in SwiftUI). MP takes MA's concepts and values for type, styling and motion; never MA's product, copy,
permissions, coral brand colour or numbers.

- **Fonts.** Figures: `ui-rounded, "SF Pro Rounded", "Nunito"` at 800, tabular, tracking -0.03em (hero 44/48,
  stepping to 36/40 below 375 px). Interface and body: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter"`.
  Technical (model ids, hashes): `ui-monospace, "SF Mono", Menlo`. Apple's Dynamic Type Large scale: body 17/22,
  callout 16/21, subheadline 15/20, footnote 13/18, caption 12/16, title 3 20/25, title 2 22/28, title 1 28/34,
  large title 34/41. Icons: Material Symbols Rounded on the web, SF Symbols named in the mapping. Load only Inter,
  Nunito and Material Symbols Rounded from Google Fonts (`display=swap`); Apple devices use the system faces and
  download nothing.
- **Styling.** Warm paper ground, white cards, one deep hero card per screen (Monzo's account card), grouped inset
  lists with inset hairlines, the soft two-layer card shadow, concentric radii (control 10, row 14, sheet 16, card 20,
  hero 24, pill), a 4 px spacing grid, 44 px targets and 50 px primary buttons, `:active` scale 0.97, 3 px focus ring
  at 2 px offset. Liquid Glass only on the iOS and iPadOS control layer (tab dock, sidebar, toolbars, sheets), never on
  content, never glass on glass, never on the web PWA; Reduce Transparency makes it opaque.
- **Motion.** MA-182's system: curves `--mo-smooth cubic-bezier(0.22,1,0.36,1)`, `--mo-snappy
  cubic-bezier(0.3,1.25,0.5,1)`, `--mo-bouncy cubic-bezier(0.3,1.18,0.5,1)` (success moments only), `--mo-sheet
  cubic-bezier(0.32,0.72,0,1)`; durations fast 180, base 340, slow 520, draw 950, count 750 ms; a 45 ms stagger capped
  at eight siblings. Arrivals (rise, card, chip, pop, fade, sheet) play as a frame scrolls into view; charts draw in
  left to right, then their dots and labels land; figures roll to their value once; a segmented control and the tab
  bar slide a lens to the tapped item; a skeleton or typing mark stops by itself. Reduce Motion: arrivals land at
  once, state changes are a 150 ms cross-fade. Each has its SwiftUI form (`.smooth`, `.snappy(extraBounce: 0.08)`,
  `.contentTransition(.numericText())`, `matchedGeometryEffect`, `.sensoryFeedback`) in the mapping.

MA's lens animates `left`, `top`, `width` and `height`; MP's must move with `transform` only (see Smoothness).

## Rule 1: legible at 20% screen brightness, light and dark

The model, stated so it can be argued with: the panel's light falls to a fifth while the room's reflected light (the
0.05 in WCAG's ratio) stays. For two colours of relative luminance L1 > L2:

- full brightness: `(L1 + 0.05) / (L2 + 0.05)` (WCAG 2.2);
- 20% brightness: `(0.2·L1 + 0.05) / (0.2·L2 + 0.05)`.

The best any pair can reach at 20% is 5.0:1 (white on black), so dark mode's primary text must be near white and
light mode's raised fills must stay near white. It does not model a dark room (contrast barely falls) or direct sun
(which needs full brightness anyway). It is MA-181's 25% model, made stricter.

| Tier | What | Full | 20% |
| --- | --- | ---: | ---: |
| body | primary text, every figure, a filled button's label, selected text | 7:1 | 4.5:1 |
| text | secondary text, captions, coloured text (gains, falls, alerts, links, forecast text, chip labels) | 4.5:1 | 3:1 |
| ui | meaning without words: chart lines and marks, the median over its band, focus rings, a switch's ring, meters | 3:1 | 1.8:1 |
| presence | seen but not read: a bar's empty track, a range band against its card, the selected segment against its track | 1.5:1 | 1.25:1 |

Also: no text under 11 px (only the tab bar labels and chart axis ticks at 11 px; everything else 12 px and up), no
font weight under 400, no text dimmed with `opacity` (a disabled control is the only exception and still reaches
3:1 at full brightness), labels on glass measured on the glass composited over its worst backdrop, colour never the
only signal (▲ ▼, labels, patterns).

### The token contract the gate reads

Every hybrid defines these custom properties on bare `:root` (light), and again in
`@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` and `:root[data-theme="dark"]`, with
the two dark blocks identical. Values are hex or `rgb()`/`rgba()`, or `var()` of another contract token; no
`color-mix()` and no token set anywhere else.

| Group | Tokens |
| --- | --- |
| Surfaces | `--mp-bg`, `--mp-surface`, `--mp-surface-2`, `--mp-line` |
| Text | `--mp-ink`, `--mp-ink-2`, `--mp-ink-3` |
| Hero card | `--mp-hero`, `--mp-hero-2`, `--mp-hero-ink`, `--mp-hero-ink-2`, `--mp-hero-up`, `--mp-hero-mark`, `--mp-hero-band` |
| Action | `--mp-accent`, `--mp-on-accent` |
| Meaning | `--mp-up`, `--mp-down`, `--mp-alert`, `--mp-alert-bg`, `--mp-on-alert`, `--mp-warn`, `--mp-warn-bg`, `--mp-ok`, `--mp-ok-bg`, `--mp-info`, `--mp-info-bg` |
| Forecast | `--mp-forecast`, `--mp-band-80`, `--mp-band-50`, `--mp-outcome`, `--mp-scenario` |
| Data and controls | `--mp-chart-grid`, `--mp-track`, `--mp-focus`, `--mp-seg-on`, `--mp-seg-on-ink`, `--mp-glass` |

The pairs the gate measures from the contract, in both themes (`a+b` is `a` composited over `b`):

| Tier | Pairs (foreground / ground) |
| --- | --- |
| body | ink on surface, bg and surface-2; hero-ink on hero and hero-2; on-accent on accent (a filled button); seg-on-ink on seg-on (the selected segment's label) |
| text | ink-2 and ink-3 on surface, bg and surface-2; hero-ink-2 and hero-up on hero and hero-2; accent, up, down and forecast on surface and bg; alert on surface and alert-bg; on-alert on alert; warn, ok and info on surface and on their own -bg |
| ui | forecast on band-80+surface and on band-50+band-80+surface (the median over its bands); outcome on surface and on band-80+surface; scenario on surface; focus on surface and bg; hero-mark on hero and on hero-band+hero |
| presence | track on surface, bg and surface-2; band-80 over surface against surface; band-50 over band-80 against band-80 (the inner band against the outer); hero-band over hero against hero; seg-on against surface-2 (the segmented control's track) |

Two consequences of the 20% body tier, worked out so nobody rediscovers them: a filled button's fill must be near
black with a white label or near white with a near-black label (so `--mp-accent` is dark in light mode and near white
in dark mode, and colour identity lives in the forecast, outcome and segment colours, not the buttons); and a white
selected segment on a near-white track cannot be seen at 20%, so the selected segment is a strong fill
(`--mp-seg-on`) with its own label colour (`--mp-seg-on-ink`), on a `--mp-surface-2` track.

Each page also carries its own pairs and its glass in one block the gate reads, for whatever the contract does not
cover (B's segment tiles, A's saffron chips):

```html
<script type="application/json" id="mp-design-gates">
{"pairs": [["body", "mp-on-seg-ustech", "mp-seg-ustech"]],
 "glass": {"fill": "mp-glass", "backdrops": ["mp-bg", "mp-surface", "mp-hero", "mp-accent"],
           "labels": [["body", "mp-ink"], ["text", "mp-ink-2"], ["text", "mp-accent"]]}}
</script>
```

A ground written `a+b` is `a` composited over `b` (a band over a card). `python3 scripts/design_gates.py check` reads
both hybrids, measures every contract pair and every declared pair in both themes, and fails closed: a missing token,
an unreadable colour, a dark block that differs from its twin, or a contract token set outside the three blocks is a
failure.

## Rule 2: smoothness first

Smooth means every animation runs on the compositor, nothing fights the scroll, and nothing moves for no reason.

- Animate only `transform` and `opacity` (and `clip-path` or `stroke-dashoffset` for a chart drawing in). Never
  animate layout (`width`, `height`, `top`, `left`, margins, padding, font size) or `filter`, `backdrop-filter`,
  `background-position` or a box shadow. A transition never says `all`.
- Paint-only transitions (`color`, `background-color`, `border-color`, `box-shadow`, `fill`, `stroke`) only on small
  controls and only up to 200 ms.
- Nothing loops forever. A spinner, skeleton or typing mark runs at most six times and then rests, with words that say
  what is still happening ("Still loading prices…").
- Glass: `backdrop-filter` only on the control layer (bars, the tab dock, sidebars, sheets), blur at most 24 px,
  never on a chip, badge or mark, never animated, never stacked; a `prefers-reduced-transparency` fallback.
- The page stays light: each big board gets `content-visibility: auto` with a `contain-intrinsic-size`; arrivals start
  from an `IntersectionObserver`, never from a scroll handler; no layout read after a write in the same frame; figures
  that roll keep their width (tabular numerals, a fixed minimum width), so nothing reflows.
- A tap answers in the same frame (`:active` in CSS, not script).
- The budget, measured by the coordinator in Chromium with the CPU slowed four times and in WebKit: at least 95% of
  frames within 20 ms through the arrivals, the lens, a sheet opening, a theme switch and a scroll; no long animation
  frame over 50 ms after load; layout shift under 0.02.

`python3 scripts/design_gates.py check` also reads the CSS and script for these rules; `node
scripts/design_runtime.mjs` measures the page itself (every visible text's real contrast at full and 20%, every
running animation's properties, and the frame budget).

## The UX system both hybrids show

"The best UX design system" is more than a look. Each page states and draws these, the same in both:

1. **Principles**, six or fewer, each with what it rules out: holdings first; a forecast always carries its range and
   horizon; the proof (calibration, track record, model version) one tap away; freshness always in view; decisions
   supported, never made (no buy or sell anywhere); calm by default (a routine fall is quiet ink with ▼, red is for
   alerts that ask for action); legible at 20% brightness.
2. **Reading a forecast in three depths:** a glance (median and arrow on the row), the range (the fan or band with its
   horizon and as-of), the proof (calibration, track record, model, data cutoff). The same three depths on every
   surface.
3. **Navigation by width, not device:** compact under 600 (tab bar: Home, Markets, Forecasts, Activity, More),
   regular 600 to 1023 (one column, two from 760), wide from 1024 (sidebar, 1.3 : 1 columns, a ⌘K command bar). The
   iPad sidebar and iPhone tab dock are Liquid Glass; the web PWA uses solid paper bars.
4. **Patterns:** the horizon switch (3, 6 and 12 months lead; 1 to 20 sessions sit apart as short-term), scrubbing a
   chart with a lollipop readout (pointer and arrow keys), a sheet for every confirmation, pull to refresh that shows
   the provider and as-of, search, the empty state that says what to do next.
5. **States**, each drawn: loading (a skeleton that still shows freshness), stale, partial, offline, error, no model,
   abstaining, disagreement, forecast unavailable (gold, SCI-D08), and the 20% preview of each.
6. **One-handed reach:** on iPhone the primary actions and the horizon switch sit in the lower half.

## What each page delivers

Everything round 1 delivered (foundations, components with every state, the five screens in light and dark, the web
and SwiftUI mapping), rebuilt on the above, plus:

- the contrast table: every pair with its tier, ratio at full brightness and at 20%, and a pass mark;
- a **"Preview at 20%" toggle** in the page bar that applies an SVG filter to the page content,
  `feComponentTransfer` in linearRGB with `slope 0.2` and `intercept 0.05` on R, G and B, so the owner sees the model
  on their own screen, with one line saying it is an approximation of a phone at 20% indoors;
- the motion section: each curve and duration, each arrival, the chart draw-in, the figure roll and the lens, each
  with a replay button, and its SwiftUI form; the smoothness rules in plain words;
- the UX system section above;
- the round 1 known issues fixed: no cramped padding in segmented controls or tables (at least 8 px inside a segment,
  12 px in a table cell).

Files: `docs/design/reviews/MP-62/hybrid-a/index.html` and `hybrid-b/index.html`, each self-contained (Google Fonts the
only external load), written as an artifact page (no `<html>`, `<head>` or `<body>`; `<title>` first). Nothing is
copied from Monzo, MA's brand colour or the Figma community files.

## How the round is shown

Local first, then each hybrid synced to its own private Claude artifact and recorded in `docs/design/artifacts.json`.
Round 1's three artifacts stay as the record; C is marked rejected in [decision.md](decision.md). The owner picks a
hybrid; the pick, in the owner's words, becomes the spec for the remaining journeys and states.
