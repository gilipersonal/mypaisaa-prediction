# MP-62 and MP-178 review round 2: the reviewer's brief

You are one of four independent reviewers. You saw none of the making and no earlier round. Read the files as a stranger. You are
read-only: never edit, commit, push, publish, or write to Jira or anything outside your own scratch folder.

Snapshot: branch `MP-178-journey-flip`, commit `e5dbc07750783b7b87c68de8f1ad61c3afca591a`, in
`/Users/arundutta/projects/mypaisaa-prediction`.

**Scope: only what changed since `c1fa817` and its direct joins.** Read your lane's changes with
`git diff c1fa817..e5dbc07 -- <your files>`. Direct joins are the callers and callees of what changed, the specification a changed file
builds to, and the documents that cite it. Do not review what did not change.

## The issues and their acceptance, word for word

**MP-62:** Design the owner's product journeys and every screen state for web, iPhone and iPad.

Positive:

- "Journeys cover the home screen with my holdings first and the top 5 per segment below (owner, 3 November 2026, MP-177) (US large caps,
  US tech, India Nifty 50, India midcap, one ETF list each for the US, UK and India, gold and silver), holdings and imports kept separate,
  per-horizon forecasts with their proof, research and chat, the action journal, cost visible from the main dashboard, owner approvals, and
  privacy and recovery."
- "Every screen shows its loading, empty, error, stale, offline, no-model, disagreement and abstention states, and never hides risk,
  staleness or a provider's status behind a spinner."
- "At least two options per journey are made locally with mp-design-first, synced to private Claude HTML artifacts and recorded in
  docs/design/artifacts.json; the owner keeps both options on all eight journeys, with a flip between them (owner, 4 November 2026, MP-178)."
- "Layouts adapt across web, iPhone and iPad and meet WCAG 2.2 AA (owner, 3 November 2026, MP-177)."
- "The SvelteKit version and the device list are checked against current official releases before any package is named, and nothing is
  described as installed."

Negative:

- "No screen offers a trade, an order or personalised advice; ranked actions are labelled decision support."
- "No screen shows a combined score when one of its three components is missing (POLICY-006)."
- "No UI code is written, and no design is shared beyond the owner's private artifacts without a separate yes."

**MP-178:** Design a flip so the owner can switch a journey between its two drawn options. The owner, 4 November 2026: "Can I have both A
and B implemented , user should have an option to flip it for more engaging experience." Asked which journeys should flip: "Flip all eight".

Acceptance:

- "The owner's answer on which journeys flip is recorded in their own words."
- "The flip control is in Prism with its icon, states and motion, before any journey uses it."
- "The flip is drawn on all eight journeys, on web, iPhone and iPad, in light and dark, in every state."
- "Flipping shows the same figures, the same freshness and the same provider status. Risk, staleness and uncertainty stay in view in both
  options."
- "The control meets WCAG 2.2 AA and a 44-point target, and honours reduced motion."
- "MP-62's acceptance, the state inventory and docs/design/journeys/README.md say what the flip changes."

Proposed, waiting on the owner: "each journey starts in A, the choice is kept per device, each journey flips on its own, and there is no flip
while signed out, during a step-up, or on an approval or record in progress, so a flip never changes what an approval binds (MP-55)."

Negative: "No trade, order or personalised advice in either option, and ranked actions stay labelled decision support." "No combined score when
a component is missing (POLICY-006)." "No UI code, and no sharing beyond private artifacts without a separate yes."

## What to check against

- The owner's recorded answers win over everything: `docs/planning/ma-reconciliation-2026-11-02/decision-log.md`. Then the root docs:
  `README.md`, `ARCHITECTURE.md`, `TECH-STACK.md`.
- `AGENTS.md`, every file in `.claude/rules/` (the lessons at the end of `.claude/rules/independent-review.md` above all) and
  `.codex/rules/review-checklist.md`. Check every lesson that touches your files.
- `docs/design/journeys/README.md`, the shared figures in `docs/design/reviews/MP-62/brief.md`, and the stories for your journeys in
  `docs/planning/story-readiness-2026-11-03/stories/PH-0*.json` (find each by `jira_key`).
- `docs/design/prism/` is the owner's picked design system, the spec. Report a journey that contradicts it, not the system. Its only
  changes in scope are the ones in your diff.

## What the page is

`docs/design/journeys/index.html` is one self-contained page built by `docs/design/journeys/build.py` from `docs/design/journeys/src/`. To render
it with playwright-core at `/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core`: `chromium.launch({ channel: 'chrome' })`, then
`page.route('https://j.test/**', ...)` fulfilling
`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>`
plus the file plus `</body></html>`, and go to `https://j.test/`. Set `window.__prismNoFit = true` first, so every screen draws at once and at its true
size. `window.__prismJourneys.go(journey, option, surface, state)` then switches the view (`surface`: iphone, ipad, web, pwa; `state`: default, loading,
empty, error, stale, offline, noModel, disagreement, abstention). Screens are in `#jrow .scr`. A flip control is `[data-flip]`; pressing it turns that
frame to the other option. Use `colorScheme` for light and dark.

To read rendered text with no browser, `scripts/design_journeys_facts.mjs` documents an API at its top. `FLIPS` in
`docs/design/journeys/src/shell.js` says which screen turns to which.

Every browser or node command gets a hard limit, as this Mac has no `timeout`: `perl -e 'alarm shift; exec @ARGV' 90 <command>`. Close every browser.
Keep captures in your own folder under
`/private/tmp/claude-501/-Users-arundutta-projects-mypaisaa-prediction/45ba900b-058a-4437-b30a-d55697f4dbd3/scratchpad/review2/`. If a shell command is
refused as unparseable, write it to a file there and run the file.

## The fixed list

`review/MP-62/fixed.json` lists every fixed finding. These are fixed and held by a check. Never propose undoing any of it.

## The gates already run, so do not repeat them

Passed on this snapshot: `scripts/design_journeys_check.mjs` (selftest 11 faults refused; every journey, option, device, state and theme, 0 problems: page
errors, options, empty screens, sideways scroll, trade controls by label, text size and weight, contrast at full and 20% brightness including gradients and
opacity, states identical to Ready, icons, clipped cards, controls under 24 px, buttons under 44 px, the decision support label, a flip on every combination);
`scripts/design_journeys_facts.mjs` (88 of 88); `scripts/review_regress.py MP-62 --approved` (84 of 84); `--every` (130 of 130); `scripts/design_gates.py` and
`scripts/design_tokens.py` with selftests; `scripts/design_sync.py check`; `build.py --check`; `scripts/plan_sync.py check`; `scripts/check_retired_facts.py`;
`ruff`; `whitespace`; `actionlint`; `stories.py check`; `build_signoff.py --check`.

Failing or deferred, by name:

- `scripts/design_runtime.mjs`: Prism 8 of 8; Journeys 5 of 8. Chrome shows one long frame of 58 to 67 ms against the 50 ms limit, at four times CPU slowdown.
  Do not report this; it is known.
- `confluence-receipts`: PH-00 is regenerated locally and publishing it needs the owner's separate yes. Do not report this.

Not run: an assistive-technology pass, a real phone at 20% brightness.

## What you are here for

What no gate measures. Is a new screen true against the records? Does a figure disagree with another screen, or between the two sides of a flip? Does a flip
take the owner to the same place, showing the same facts, in every state? Does a flow dead-end? Does a state's copy describe what that state truly is? Is
risk, staleness or uncertainty hidden, or does copy read as advice? Is something marked not applicable that can occur? Is an invented fact presented as settled?
Does a check test what its fix does, and would it fail if the fix were undone? Is WCAG 2.2 AA broken in a way a contrast ratio cannot see?

Report only what no gate measures. For each finding: id (R<round>-<lane letter><n>), severity P0-P3, blocking yes/no, file:line, evidence, the correction.

- **Severity:** P0 breaks the product, loses or leaks data, or crosses a non-negotiable limit in `AGENTS.md` (trading, broker credentials, personalised
  advice); P1 breaks the issue's acceptance or a rule; P2 is wrong but contained; P3 is polish.
- **Blocking** is your call: yes when the work must not merge with it.
- **Evidence** is what you read or ran and what it showed: the quoted line, the command and its output. A finding with no evidence is not a finding.
- **The correction** is the smallest change that fixes it, with every record that must change with it.

Return only your findings, most severe first, and one line on what you covered and anything you could not check.
