# MP-62 review round 1: the reviewer's brief

You are one of four independent reviewers. You saw none of the making. Read the files as a stranger. You are read-only:
never edit, commit, push, publish, or write to Jira or anything outside your own scratch folder.

Snapshot: branch `MP-62-design-system`, commit `c1fa817ddaeb0ac530fd99e4246a8d13ce0e1c27`, in
`/Users/arundutta/projects/mypaisaa-prediction`.

## The issue and its acceptance, word for word

**MP-62:** Design the owner's product journeys and every screen state for web, iPhone and iPad.

Story: "As the owner, I want the complete product journeys designed across web, iPhone and iPad with every state drawn, so
that I can choose a design before anything is built."

Positive:

- "Journeys cover the home screen with my holdings first and the top 5 per segment below (owner, 3 November 2026, MP-177)
  (US large caps, US tech, India Nifty 50, India midcap, one ETF list each for the US, UK and India, gold and silver),
  holdings and imports kept separate, per-horizon forecasts with their proof, research and chat, the action journal, cost
  visible from the main dashboard, owner approvals, and privacy and recovery."
- "Every screen shows its loading, empty, error, stale, offline, no-model, disagreement and abstention states, and never
  hides risk, staleness or a provider's status behind a spinner."
- "At least two options per journey are made locally with mp-design-first, synced to private Claude HTML artifacts and
  recorded in docs/design/artifacts.json; the owner picks one per journey."
- "Layouts adapt across web, iPhone and iPad and meet WCAG 2.2 AA (owner, 3 November 2026, MP-177)."
- "The SvelteKit version and the device list are checked against current official releases before any package is named,
  and nothing is described as installed."

Negative:

- "No screen offers a trade, an order or personalised advice; ranked actions are labelled decision support."
- "No screen shows a combined score when one of its three components is missing (POLICY-006)."
- "No UI code is written, and no design is shared beyond the owner's private artifacts without a separate yes."

Recovery: "If the owner rejects every option for a journey, a new options round is made for that journey alone; chosen
journeys are kept."

Evidence the story asks for: the design files under docs/design, each with its artifact URL in docs/design/artifacts.json;
`python3 scripts/design_sync.py check` passes; a state inventory listing every screen against every state.

## What to check against

- The owner's recorded answers win over everything: `docs/planning/ma-reconciliation-2026-11-02/decision-log.md`. Then the
  root docs: `README.md`, `ARCHITECTURE.md`, `TECH-STACK.md`.
- `AGENTS.md`, every file in `.claude/rules/` (the lessons at the end of `.claude/rules/independent-review.md` above all) and
  `.codex/rules/review-checklist.md`. Check every lesson that touches your files.
- `docs/design/journeys/README.md`: the rules these journeys were to follow.
- The stories named for your journeys, in `docs/planning/story-readiness-2026-11-03/stories/PH-0*.json`. Find each by its
  `jira_key` and read its acceptance, states and authority. Check the screens against them.
- The shared figures in `docs/design/reviews/MP-62/brief.md`.
- `docs/design/prism/` is the owner's picked design system, the spec these journeys were made from. Treat it as the spec:
  report a journey that contradicts it, not the system itself. The owner chose its ink, its fonts and its look.

## What the page is

`docs/design/journeys/index.html` is one self-contained page built by `docs/design/journeys/build.py` from
`docs/design/journeys/src/`. Published privately at https://claude.ai/artifact/UXvLXTKyH9zd1r7CtXG2Kq. Read the sources, and
look at the rendered screens too, because the visual and the flow are what you are here for.

To render it with playwright-core at `/Users/arundutta/projects/mypaisa-agent/scripts/node_modules/playwright-core`:
`chromium.launch({ channel: 'chrome' })`, then `page.route('https://j.test/**', ...)` fulfilling
`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>`
plus the file plus `</body></html>`, and go to `https://j.test/`. `window.__prismJourneys.go(journey, option, surface, state)`
switches the view (`surface`: iphone, ipad, web, pwa; `state`: default, loading, empty, error, stale, offline, noModel,
disagreement, abstention). The screens are in `#jrow .scr`. Use `colorScheme` for light and dark.

Every browser or node command gets a hard limit, as this Mac has no `timeout`:
`perl -e 'alarm shift; exec @ARGV' 90 <command>`. Close every browser. Keep your captures in your own folder under
`/private/tmp/claude-501/-Users-arundutta-projects-mypaisaa-prediction/45ba900b-058a-4437-b30a-d55697f4dbd3/scratchpad/review/`.
If a shell command is refused as unparseable, write it to a file there and run the file.

## The fixed list

There is no fixed-findings ledger for MP-62 yet, so nothing is fixed and held by a check. The line that applies to every
later round: "These are fixed and held by a check. Never propose undoing any of it."

## The gates already run, so do not repeat them

Passed on this snapshot:

- `scripts/design_journeys_check.mjs`: walks every journey, option, device, state and theme, and fails on a page error,
  fewer than two options, not exactly one recommended, an empty screen, a state marked not applicable with no reason, a
  sideways scroll, a buy, sell or order control by its label, text under 11 px or under weight 400, text under 4.5:1 or 3:1
  at 20% brightness, a state identical to Ready, a dangling icon, a clipped card, a button under 44 px. It does not press
  controls, and it judges nothing about meaning.
- `scripts/design_runtime.mjs`: 8 of 8 on Journeys and Prism, Chrome and WebKit, measuring contrast and frame timing on the
  page's first view only.
- `scripts/design_gates.py` check and selftest, `scripts/design_tokens.py` check and selftest, `scripts/design_sync.py check`,
  `docs/design/journeys/build.py --check`, `scripts/plan_sync.py check`, `scripts/check_retired_facts.py`,
  `scripts/review_regress.py --every` (46 of 46), `python-errors` (ruff), `whitespace`, `actionlint`.

Not run: an end-to-end press of every control, an assistive-technology pass, a real phone at 20% brightness.

## What you are here for

What no gate measures. Does a screen say something false against the records? Does a figure disagree with another screen or
with the owner's answers? Does a flow dead-end, or could the owner not do what the story asks? Does a state's copy describe
what that state truly is? Is risk, staleness or uncertainty hidden, or does copy read as advice? Is a state marked not
applicable when it can occur? Is a story's acceptance missing from the journey? Is WCAG 2.2 AA broken in a way a contrast
ratio cannot see, such as meaning carried by colour alone, focus order, a target too small, a missing name on a control or
a chart with no text alternative? Are the two options really different in structure? Does the layout use the width on iPad
and desktop? Is anything an invented fact presented as settled?

Report only what no gate measures. For each finding: id (R<round>-<lane letter><n>), severity P0-P3, blocking yes/no,
file:line, evidence, the correction.

- **Severity:** P0 breaks the product, loses or leaks data, or crosses a non-negotiable limit in `AGENTS.md` (trading, broker
  credentials, personalised advice); P1 breaks the issue's acceptance or a rule; P2 is wrong but contained; P3 is polish.
- **Blocking** is your call: yes when the work must not merge with it.
- **Evidence** is what you read or ran and what it showed: the quoted line, the command and its output. A finding with no
  evidence is not a finding.
- **The correction** is the smallest change that fixes it, with every record that must change with it.

Return only your findings, most severe first, and one line on what you covered and anything you could not check.
