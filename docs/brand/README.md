# The mark: the Fan

<img src="mark-animated.svg" width="120" height="120" alt="The Fan mark, animated"> &nbsp; <img src="mark-dark.svg" width="120" height="120" alt="The Fan mark on a dark ground"> &nbsp; <img src="mark-small.svg" width="40" height="40" alt="The small mark">

![The logo intro: the mark draws itself and the wordmark rises beside it](../motion/logo-intro.gif)

A price line climbs to **now**, then opens into a **forecast fan**: the inner band is the 50% range, the outer the
80%, the faint arcs are horizons and the pale line is the median. A **mint dot** lands inside the band, the forecast
graded against what happened. That is the product's promise in one picture: show the uncertainty, score every
forecast.

**Status: the documentation identity, Proposed for the app.** It becomes the app icon only with the owner's UX
approval.

## Motion

The intro plays once, about 3.4 seconds, and stops on the final frame. It never loops.

| Time | What moves |
| --- | --- |
| 0.0 s | The tile settles in from 86% scale |
| 0.35 s | The price line draws, left to right |
| 1.25 s | The "now" point pops |
| 1.5 s | The fan unfolds from "now" |
| 1.9 s | The median fades in |
| 2.35 s | The outcome lands, with one ring of light |

With **Reduce Motion** on, the animated SVGs show the final frame and nothing moves. The README's `<picture>` also
falls back to the static marks for viewers who ask for reduced motion.

## Files

| File | Use |
| --- | --- |
| `mark.svg`, `mark-dark.svg` | Static mark for light and dark grounds (the dark one adds a hairline edge) |
| `mark-animated.svg`, `mark-animated-dark.svg` | The README and the app's launch moment |
| `mark-small.svg` | 32 px and below, favicons: no grid, median or horizons, thicker strokes |
| `mark-icon.svg`, `mark-icon-1024.png` | Full-bleed square, the source for an app icon (the platform rounds the corners) |
| `mark-64.png`, `mark-256.png`, `mark-512.png` | Raster sizes |
| `build_brand.py` | Builds every file above from one geometry |

## Palette

| Token | Hex | Role |
| --- | --- | --- |
| Ink | `#16244A` to `#0B1329` | The tile, a diagonal gradient |
| Paper | `#F7F2E8` | History, the "now" point |
| Saffron | `#F5A524` | The forecast fan |
| Mint | `#3DDC97` | The scored outcome |

The documentation animations add sky `#5EB0FF`, violet `#A68BFF` and rose `#FF7A90` for their diagrams.

## Rebuild

```bash
python3 docs/brand/build_brand.py
```

```bash
uv run --no-project --with playwright python docs/brand/build_brand.py --png
```

The first writes the SVGs with no dependencies; the second also renders the PNGs with the local Chrome.
