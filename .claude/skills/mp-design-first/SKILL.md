---
name: mp-design-first
description: Design Mypaisaa Prediction web, SwiftUI, chart and interaction work before building it. Use for any MP screen, flow, card, chart, motion or visual change. Gated hard on MP's order (architecture sign-off, full UX design, UX approval, permission to build); draws 2 or 3 options locally with one marked (Recommended), the owner picks, the pick is the spec, and later changes go back to the design first. Made locally and synced to a private Claude HTML artifact (.claude/rules/design-sync.md).
---

# Design first for MP (Claude)

Claude's version of `.agents/skills/mp-design-first/SKILL.md`, expanded from mypaisa-agent's design-first practice
(MP-35). MP takes MA's method (design before code, an options round, the owner's pick as the spec), not MA's product
scope, figures, boards, design system or tooling.

## 0. The gate, before anything is drawn

MP's order is fixed (`AGENTS.md`, `CLAUDE_HANDOVER.md`,
`docs/planning/ma-reconciliation-2026-11-02/README.md`):

1. **Architecture sign-off.** The owner signs off the contracts and the complete phase and story baseline at an exact
   revision (MP-20).
2. **Full UX design.** Every user and admin journey, end to end, designed locally. This skill does this step.
3. **UX approval.** The owner approves the whole UX, not a screen at a time.
4. **Permission to build.** A separate, explicit yes to implement.

UX starts only after the owner signs off the architecture and separately authorises UX. Building starts only after
full end-to-end UX approval plus explicit permission to implement. Check the record before starting:

- No architecture sign-off on record: stop. Say UX cannot start yet and what is missing. Do not draw "just a
  sketch" of a product screen.
- Signed off, but UX not authorised in the running prompt or on record: stop and ask.
- UX authorised: design (steps 1 to 4 below). Nothing under `web/`, `mobile/` or `backend/` that changes what the
  owner sees is written.
- UX approved but no permission to build: the designs may be refined on request; still no product code.
- Permission to build: build **only** the picked and approved design.

A diagram, a README badge, a Confluence page, a motion GIF or the static Site is not a product screen and does not
pass any of these gates. Changes that touch no design skip this skill: a typo, a broken link, data, or a backend change
the owner never sees. When unsure whether something is a design change, treat it as one.

## 1. Ticket, branch and context

- Find or create the MP issue and move it along (`.claude/rules/jira-flow.md`); branch `MP-<n>-<slug>` from `main`.
- Read the context: the phase page and its stories in
  `docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json`, `ARCHITECTURE.md` (the rules and the two
  doors), `TECH-STACK.md`, the owner's decisions and receipts, the UX direction in
  `docs/planning/future-architecture-sites-ux-direction-2026-11-02.md`, and any approved MP design for the surface.
- Find the forecast information contract and the states the screen must show (gaps FC-16, PL-14, CT-16 in the gap
  register) before drawing. A screen drawn ahead of its contract is a guess.
- If a current screen exists, capture it into the round's folder as the "before".

## 2. Draw 2 or 3 options

- **Each option is a complete answer** to the request, different in a way that matters: structure, flow, emphasis or
  treatment. Never one idea in two colours.
- **Mark exactly one "(Recommended)"** and say why in one or two sentences: the trade-off it wins and what it costs.
- A **small change** to an approved design follows the existing system; no invented alternatives.
- **Both doors in the same round.** The web PWA (SvelteKit) at desktop and at phone width (390), and the Apple app
  (SwiftUI in the React Native shell) on iPhone and iPad, in light and dark. A change that only fits one door says why.
- **Local first.** Draw in the repo under `docs/design/` (create it with the first round), one folder per round,
  `docs/design/reviews/MP-<n>/`, holding the options, the "before", the brief and the decision. Boards are plain HTML
  and CSS on shared tokens, viewable from a local server, each part mapping onto a Svelte component or a SwiftUI view.
- **Tools, by fit:** `impeccable` (design, critique, polish), `ui-ux-pro-max`, `dataviz` for every chart, `design:*`
  and `design-skills:*` for critique, accessibility and UX copy, `threeui` for motion. Check a connector (Figma,
  axe-accessibility) is signed in before relying on it. No paid image or design service without a yes. The taste and
  landing-page skills stay off product screens.
- **Illustrative data, labelled as such.** Real instrument identities from `fixtures/synthetic/instruments.json`,
  simulated prices, holdings and outcomes. Never the owner's real holdings, accounts or figures.

### The quality bar

- **Apple's Human Interface Guidelines** for the Apple app, and the same discipline on the web: system type scales,
  44-point targets, standard navigation, clear hierarchy.
- **Monzo's modular system**: a small set of semantic tokens and reusable modules (cards, rows, sheets, figures),
  composed the same way on every screen, so one change lands everywhere.
- The explanatory standard of MA's design references (`docs/planning/future-architecture-sites-ux-direction-2026-11-02.md`):
  recommended options with reasons and trade-offs, light and dark device boards, consistent example figures, compact
  confirmations, little visual nesting. MA's warm-ledger palette, Liquid Glass decisions and boards are not MP's.
- The old green and lime cinematic Site is not a reference.

### MP's product rules hold in every option

- **It cannot trade.** No trading actions: no buy, sell or order control, and no copy that reads as personalised financial advice. Ranked
  actions (add, hold, pause, trim, rebalance) are decision support with reasons and uncertainty.
- **Uncertainty on show.** Every forecast shows its horizon, as-of time and data cutoff, a range or probability, its
  calibration and track record, and the model version one tap away. A forecast is never a single bare number.
- **Three kinds of figure look different:** historical data, evaluated forecasts, and conditional scenarios (which
  claim no likelihood).
- **Never hide risk, staleness or provider status behind a loading state.** Freshness and provider health are always
  visible; stale or partial data is labelled.
- **Long-term investing is the product.** 5 to 20 trading days is never presented as long-term.
- **Every state is designed:** empty, loading, stale, partial, error, offline, no model, abstaining, disagreement, and
  permission denied.
- **Numbers come from code and models.** Claude's text explains; the design never implies Claude worked a figure out.

### Accessibility and layout

- WCAG 2.2 AA at least: contrast measured on the real background, a visible focus ring, keyboard and screen-reader
  paths, Dynamic Type and browser zoom without loss, reduced motion as a cross-fade or a final state.
- Colour is never the only signal; every chart has labelled values and a text or table alternative.
- Layout by width and size class, never by device name: phone, tablet, desktop, and split or resized windows.

## 3. Check every option yourself

Open each option in the built-in browser from a local server: phone (375 or 390), tablet (768) and desktop, light and
dark, keyboard only, reduced motion, and the states above. Fix what is broken before showing it. This is the maker's
look, not a gate the boards must pass; QA on the built code comes later, when the owner asks for it.

## 4. Show the round and get the pick

- Show the options **locally first**: give the owner the local preview (the files and how to open them) and a short
  brief: what each option is, the trade-offs, and which is "(Recommended)" and why.
- Sync the round to **Claude HTML artifacts** (owner, 3 November 2026; `.claude/rules/design-sync.md`): each option's
  repo file is published to its own private artifact, republished to the same URL after every change, and recorded with
  `scripts/design_sync.py record`. ChatGPT Sites is no longer used for new designs; the `site/` identity in
  `site/.openai/hosting.json` stays untouched (`AGENTS.md`). Never publish to Confluence or Sites, or share an artifact
  publicly, without a separate yes.
- Ask once for the pick. Silence, a default selection or an unrelated yes is not a pick.

## 5. The pick is the spec

- Record the owner's exact words, the date, the option and its scope in the round's decision file, and link it from the
  MP issue.
- The picked option gets its remaining states drawn before UX approval: every state listed above, long names, many
  holdings, privacy where money shows.
- Update the docs and trace that the design touches; the stories cite the picked boards.
- After permission to build, the build matches the picked design. A difference found while building is a design
  question, not a coding choice.

## 6. Changes go to the design first

Any later change to how MP looks or flows, including one found during the build, is made on the design first, shown to
the owner, and picked again when it is material. The code follows the updated design, never the other way round. A
design and its build that disagree are a defect in whichever one the owner did not approve.

## What this skill never does

- Starts UX before the architecture sign-off, or builds before UX approval and permission to build.
- Treats one approved screen as approval of the whole UX.
- Edits a design in its artifact instead of the repo file, or leaves a design out of sync with its artifact.
- Publishes to Sites or Confluence, or shares an artifact publicly, without a separate yes.
- Copies MA's scope, figures, boards or design system into MP as a spec.
