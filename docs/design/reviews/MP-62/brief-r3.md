# MyPrediction design system: round 3, sharper hybrids (MP-62)

**3 November 2026 · MP-62 (PH00-S05) · Options for the owner to choose · Not approved UX · No build**

Round 2 is [brief-r2.md](brief-r2.md). This brief changes what the owner asked to change. What it supersedes is named
exactly below; everything else in rounds 1 and 2 still holds.

## The owner's words

> "Ok I need you refine the background of the light and dark a bit more. For think more about Apple human centere
> designed and Monzo App for light mode background, the current one looks like Claude's/Anthropic own theme. see
> https://monzo.com/ https://www.klarna.com/uk/
>
> For Dark mode, think about Klarna Mobile App . The font colour contrasts can be made more better.
> https://appinventiv.com/blog/cost-to-develop-an-app-like-klarna/
>
> Take special care of the icons, and the edges, they need to be sharp. Have some motion animations for claude added.
> Remember this is financial app. Draw inspiration from Karna and Monzo and think of something special and sharp.
>
> The design system should be impeccable."
>
> "https://oh-my-design.kr/design-systems/monzo This is another reference, learn from it"

## What supersedes what

| Round 2 said | Round 3 says |
| --- | --- |
| Warm paper ground | Cold daylight in light mode, violet-black ink in dark mode. White cards stay. |
| Radii control 10, row 14, sheet 16, card 20, hero 24 | Tighter: control 8, row 12, button 12, card 16, hero 20, sheet 20, pill 999 |
| The soft two-layer card shadow | A drawn hairline edge first; shadows tight and only where something floats |
| Material Symbols Rounded on the web | The shared inline SVG sprite, square caps, mitred joins. SF Symbols stay the native mapping |
| Text tier 4.5:1 full, 3:1 at 20% | Text tier 7:1 full, 3.5:1 at 20% |
| Soft blooms and glows (B's tiles and hero) | Hard-edged facets. No radial gradient, no halo |

Kept from round 2 and MA: the fonts (Nunito / SF Pro Rounded figures, Inter / SF Pro Text), the motion system (curves,
durations, stagger, lens, figure roll, chart draw-in), the smoothness rules, the UX system, the "Preview at 20%"
toggle, every product rule and the shared figures.

## What the references teach

Measured from the public pages on 3 November 2026. Inspiration only: no brand colour, font, logo, illustration, copy or
layout is taken from any of them; MP's accent colours stay MP's own.

- **Apple (HIG).** A cool grouped ground with white cards; hierarchy from size and weight; chrome that defers to
  content; continuous corners; hairline separators inset from the leading edge.
- **Monzo.** White canvas, one very dark ink, pale cool panels. Separation comes from surface contrast; the shadow
  scale is used only where something floats. The primary action is a dark ink fill with a white label, with a distinct
  rest, hover and pressed step. Focus rings are authored. The accent is rationed, because a loud colour everywhere stops
  meaning anything. Copy is short, active and consistent.
- **Klarna.** White canvas and a near-black ink with a violet cast. In the app, a deep violet-black ground, surfaces one
  step lighter, pure white text, big bold headings, no visible borders.

The diagnosis: warm cream with soft shadows and blooms is what reads as Claude's own theme. Cold neutrals make the
identity colours the only warmth on the screen, and drawn edges make it read as a financial instrument.

## The direction: cold daylight, ink, and cut edges

**Light is cold daylight.** Apple's grouped ground (`#F2F4F8`) under white cards, `--mp-canvas` pure white for large
page surfaces, near-black ink. Nothing warm in the neutrals.

**Dark is ink.** A violet-black ground (`#0A0720`), surfaces one step lighter (`#161230`, `#221C45`), a lifted violet
hero (`#241C52`), pure white text. Secondary text stays nearly white; hierarchy comes from size and weight, never from
dim grey.

**Every edge is drawn.** A card's edge is a hairline: `0 0 0 var(--mp-hair) var(--mp-edge)`, one device pixel on a
retina screen. Depth is a tight offset shadow only where something floats. No blur softens an edge.

**Something special: the cut.** Soft light is replaced by hard geometry, so the identity itself is sharp.

- **Hybrid A · Fan:** the fan is cut from hard-edged wedges, not a soft ribbon: the hero card carries a large wedge cut
  into its right edge, the bands are crisp polygons, the horizon selector's glyphs are wedges that widen. Saffron on
  midnight in light; gold on violet ink in dark, its complement.
- **Hybrid B · Prism:** each tile is cut by two or three hard facets of its own hue, like light through glass, and the
  hero takes the selected tile's facets. No bloom, no outer glow on any tile.

Both are one UX system: `shared/tokens.css` gives both pages the same neutrals, meaning colours, shape and elevation,
word for word. Identity tokens (`forecast`, `band-80`, `band-50`, `outcome`, `scenario`, `hero-mark`, `hero-band`, `ai`,
and B's segment tokens) stay each page's.

## Rule 1, raised: every word reaches AAA

| Tier | What | Full | 20% |
| --- | --- | ---: | ---: |
| body | primary text, figures, a filled button's label | 7:1 | 4.5:1 |
| text | secondary text, captions, coloured text, chip labels | **7:1** | **3.5:1** |
| ui | chart lines, the median over its band, focus, the Claude mark | 3:1 | 1.8:1 |
| presence | tracks, bands, the selected segment against its track, a card's hairline edge | 1.5:1 | 1.25:1 |

The contract gains `--mp-canvas`, `--mp-edge` and `--mp-ai`. New pairs: ink and ink-2 and ink-3 on canvas; `edge` on bg
and surface; `ai` on surface and bg. Coloured text is therefore deep in light mode (luminance under about 0.077) and
pastel in dark mode (over about 0.65).

## Rule 3, new: sharp

Measured by `python3 scripts/design_gates.py check`:

- no text shadow, no blur filter, no radial gradient, no zero-offset halo, no shadow blurred past 24 px;
- icons are `shared/icons.svg`, embedded unchanged, used as `<svg class="i"><use href="#i-name"/></svg>`, at whole-pixel
  sizes (16, 20, 24, 28), with a `.i` rule of `fill: none; stroke: currentColor; stroke-linecap: square;
  stroke-linejoin: miter`; rising and falling marks are `#i-up` and `#i-down`; no icon font; no Unicode glyph as an icon;
- the shared tokens, the sprite and the Claude component are word for word in both pages.

By hand, on the built page: no `transform: scale()` on a screen at rest; `-webkit-font-smoothing: antialiased`;
`@media (min-resolution: 2dppx) { :root { --mp-hair: 0.5px; } }`; `@supports (corner-shape: squircle)` gives cards,
heroes and buttons Apple's continuous corners; selection, caret, scrollbars and focus are themed from the tokens; icons
sit optically on their text.

## Rule 4, new: Claude has motion

"Numbers come from code and models, words from Claude." The motion shows that, in `shared/claude.html`, the same in both
hybrids, embedded once between its markers, in a Claude section of its own:

1. **Reading:** the owner's question lands; the mark's three shapes light in turn; each read-only step lands and its tick
   draws.
2. **Writing:** sentences fade in one at a time; figures are bold and each carries its source number.
3. **Citing:** the source chips land in turn. A figure with no source never appears.
4. **Handing back:** the actions rise; the mark rests. Claude proposes, the owner decides, nothing moves again.

Four more states stand still on purpose: Stopped, Refused (MP cannot trade), No evidence (Claude will not guess) and
Claude off (numbers never depend on Claude).

Each page gives the mark its own three shapes on `:root` (`--cl-s1`, `--cl-s2`, `--cl-s3`, `clip-path` polygons: A three
fan blades, B three prism facets) and its colour (`--mp-ai`). Claude's own logo is never drawn, and no sparkle. `.cl-chip`
with `.is-working` is the compact form for a row ("Claude is reading 2 filings"): use it once on the iPhone home screen.
The mapping names the SwiftUI forms: `PhaseAnimator` for the mark, `.contentTransition(.opacity)` for sentences,
`.sensoryFeedback(.success)` when the answer lands.

## The page itself

Each page is the system's own showcase, so it obeys the system: `--mp-canvas` behind it, drawn edges, sharp icons, and
none of the template habits: no eyebrow or kicker above a heading, no row of same-size stat cards, no section numbers, no
gradient text, no decorative glass. Retire every word that describes the old look ("warm", "paper", "ledger", "bloom",
"glow") and keep each claim true: counts of pairs and icons are read from the page or checked by hand.

## How the round is shown

Same files (`hybrid-a/index.html`, `hybrid-b/index.html`), same private artifacts, republished to the same URLs. The
owner picks a hybrid; the pick, in the owner's words, becomes the spec for the remaining journeys and states.
