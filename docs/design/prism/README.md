# Prism, MyPrediction's design system

**Status: owner-selected look (MP-62, 3 November 2026). Not approved UX; no permission to build.** The owner's words and
the reasoning are in [decision.md](../reviews/MP-62/decision.md) and [brief-r4.md](../reviews/MP-62/brief-r4.md).

Prism serves one product on four surfaces: desktop web, mobile web, the installed PWA, and the native iOS and iPadOS app.
[index.html](index.html) is the system: principles, foundations, components, patterns, states, layout, screens, motion,
Claude, contrast and the web and SwiftUI contract. It syncs to a private Claude artifact
(`.claude/rules/design-sync.md`).

## One source

| File | What | Edited by hand |
| --- | --- | --- |
| [tokens.json](tokens.json) | Every colour, radius, space, size, duration and curve, with its dark value, SwiftUI name and role, plus the type scale and the contrast pairs | Yes: this is the only place a value changes |
| [tokens.css](tokens.css) | CSS custom properties for the web and the PWA | No, generated |
| [PrismTokens.swift](PrismTokens.swift) | The same values for iOS and iPadOS | No, generated |
| [icons.svg](icons.svg) | The icon set | Yes, by adding to the set |

## Changing a value

1. Edit `tokens.json`.
2. `python3 scripts/design_tokens.py build` writes `tokens.css` and `PrismTokens.swift`.
3. `python3 scripts/design_tokens.py check` measures every pair at full and at 20% brightness and refuses stale files.
4. Paste the new `tokens.css` block into `index.html` between its `prism-tokens` markers.
5. `python3 scripts/design_gates.py check` and `node scripts/design_runtime.mjs docs/design/prism/index.html`.
6. Republish to the same artifact and run `python3 scripts/design_sync.py record`.

Tier one is the value, tier two the semantic role (`--ink`, `--surface`, `--rise`), tier three a component's use of a role.
A component names a role, never a value.

## The rules that hold everywhere

- MP never trades. No buy, sell or order control, and no personalised advice.
- A forecast is never a bare number: horizon, as-of time, range, calibration and model are always one tap away.
- Freshness and provider status stay in view. Stale and partial data is labelled.
- Legible at 20% screen brightness in light and dark: body 7:1 and 4.5:1 at 20%, text 4.5:1 and 3:1, measured.
- Smoothness first: only transform and opacity animate (clip-path or stroke-dashoffset for a draw-in), nothing loops
  forever, Reduce Motion lands at once.
- Figures sit on solid surfaces. Glass is the control layer.
- Layout follows width, not device: compact under 600, regular 600 to 1023, wide from 1024.

## Versions and changes

Proposed by the maker, not yet chosen by the owner. Prism follows semantic versions: a patch fixes, a minor adds, a major changes or removes a token or a component's
contract. A change is proposed in a Jira MP issue, drawn here, and recorded in `decision.md` with the owner's words.
Nothing is removed without a deprecation note naming its replacement. Each component carries a status label: Proposed,
Owner-selected, Implemented, Deployed and verified. Only evidence moves a label forward.
