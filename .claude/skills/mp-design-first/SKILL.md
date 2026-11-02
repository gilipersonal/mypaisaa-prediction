---
name: mp-design-first
description: Design Mypaisaa Prediction web, SwiftUI, chart and interaction work before building it. Present options for any material new direction and get the owner's pick. Only once UX work is authorised.
---

# Design first for MP (Claude)

Claude's version of `.agents/skills/mp-design-first/SKILL.md`.

**Gate check first.** UX starts only after the owner signs off the architecture, contract and phase/story baseline (MP-20) and separately authorises UX. Building starts only after full end-to-end UX approval plus explicit permission to implement. If those yeses aren't on record, say so and stop. A diagram, README badge or Site page is not a product screen.

## Make the options

- Read the relevant phase page, ADRs, owner receipts, `docs/planning/future-architecture-sites-ux-direction-2026-11-02.md` and any approved design.
- For a **material new screen or direction**, build two or three genuinely distinct options and present them with "(Recommended)" on one. Use clearly labelled synthetic data with real instrument identities from `fixtures/synthetic/instruments.json`, covering holdings, evidence and uncertainty. For a **small change** to an approved design, follow the existing system without inventing alternatives.
- Quality bar: MA's explanatory design approach, Apple HIG and Monzo's modular semantic tokens. The old green/lime cinematic Site is not a reference. Don't copy MA's product scope, figures or boards as an MP spec.
- Capabilities to use when they fit: `impeccable` (design, critique, polish), `ui-ux-pro-max`, `design:*` / `design-skills:*`, `threeui` for motion. Figma, axe-accessibility and other account connectors may be missing or need sign-in, so check before relying on them. No paid image services without a yes.

## Check every option

Preview locally in the built-in browser:
- phone (375), tablet (768) and desktop sizes, in light and dark;
- keyboard and screen-reader access, contrast, and reduced motion;
- empty, loading, stale, error and offline states.

Charts need labelled values and a non-colour alternative. Historical data, evaluated forecasts and conditional scenarios must look different. Always show horizon, data freshness, uncertainty and provider status, and never hide risk or staleness behind a loading state. Long-term investing is the product; 5–20 trading days is never presented as long-term. No trading actions, and nothing reads as personal financial advice.

## Record the choice

Keep editable sources, tokens and boards in the repo, local first. Record the owner's exact pick and its scope, and update the docs. Publication goes to **ChatGPT Sites**, not Claude artifacts, and only with a separate yes. Never publish to Confluence or Sites silently.
