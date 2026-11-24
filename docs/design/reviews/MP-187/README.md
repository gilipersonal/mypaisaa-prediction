# MP-187: the Track record view in Record, options round

The owner picked "A view in Record" (OWN-24, MP-184). MP-154 asks for track records by horizon, holding, model and regime,
with 30, 90 and 365-day summaries, sample size, sufficiency and censoring, immature forecasts counted as pending, and no hit
rate without calibration, error and coverage. Nothing drew them before this round, so there is no "before": the Journeys
inventory listed the question as "Not drawn".

Design only. UX is not approved, and nothing may be built.

## Where it is

- The options are drawn in Prism Journeys, `docs/design/journeys/index.html`, as a ninth journey, **Track record**
  (`src/journeys/track.js`, `track.css`). Open the page and choose Track record, or go to `#track.a.iphone.default`.
- Each option is drawn on iPhone, iPad, desktop web and phone web, in light and dark, in all nine states. A flip turns any
  frame to the other option, so the two can be compared frame by frame.
- Record gains a switch at its top, Journal or Track record. It is drawn on the Journal's two top screens too, in both of
  the Journal's options, so the way in and the way back both exist.
- The private artifact is `ds-journeys` in `docs/design/artifacts.json`.

## What both options show

- **Live forecasts only.** Walk-forward testing stays in each forecast's Proof, labelled as testing.
- **One record, computed from its counts.** Seven holdings, one forecast each per daily origin since R2-HGB v2 went live on
  2 Feb 2026: 192 origins, so 1,344 forecasts at each horizon. Issued is pending plus matured; matured is scored, censored and
  abstained. Every rate on screen is computed from the counts beside it, and `tests/journey_facts/m187.mjs` recomputes them.
- **Sample and sufficiency on every rate.** Scored, censored and abstained beside each rate, and the non-overlapping blocks.
  No horizon has the 20 blocks a claim needs, so every rate is labelled Exploratory.
- **Too few says so.** 12 months has nothing matured and says when its first is due (2 Feb 2027). R2-HGB v3 has 27 scored at
  20 sessions and shows "Too few" with no rate.
- **Hit rate never alone.** It sits only beside coverage, calibration, error, the baseline's error and turnover, on both options.
- **Short term apart.** 10 and 20 sessions sit under their own heading, labelled "Not long-term guidance".
- **States.** Loading keeps the last good figures in view; Stale says a late price is never scored as a miss; Disagreement
  shows NVIDIA's amended outcome with both scores kept; Abstaining counts the abstention apart; No model keeps every score
  against the version that made it; a browser's offline copy says its protection is unverified.

## The options

| | A · Scorecard (Recommended) | B · One table |
| --- | --- | --- |
| Shape | One card per horizon: coverage over 30, 90 and 365 days at a glance, then the full measures for 365 days. Holding, model and regime one tap away | One page: horizons by window, then holding, model and regime over 365 days, every measure in a column |
| Screens | Track record, 6 months in full, By holding, By model, By regime | Track record (one table), 6 months opened |
| Wins | The first screen answers "how are the forecasts doing" without a table to read | Nothing is a tap away; any two readings compare side by side |
| Costs | Breakdowns take a tap; cards are long on a phone | Dense; on a phone the table becomes long rows of figures |

**Why A is Recommended.** It puts the answer first and keeps each rate beside its sample, which is what a long-term investor
needs on most visits. The breakdowns are what MP-154 asks for, but they are a second question, so a tap costs little.

## Proposed, for the owner

- A rate shows once **30** forecasts have scored (SCI-D03). The number is not on record.
- The **regime** rule: the regime at origin is whether the last 60 sessions rose or fell, and whether 20-session volatility
  was above its 80th percentile, from the forecasting specification's proposed F3 regime (SCI-D04).

## Decision

**Picked: A · Scorecard.** The owner, 24 November 2026, in the MP-187 session, answering "Which Track record option do you
pick?" by pressing the button labelled "A · Scorecard". The other button read "B · One table". The option it names is the
Recommended one: one card per horizon, coverage over 30, 90 and 365 days at a glance and the full measures beside the sample,
with holding, model and regime one tap away (screens: Track record, 6 months in full, By holding, By model, By regime).

What follows from it:

- **Every state on every device.** Option A is drawn on iPhone, iPad, desktop web and phone web, in all nine states, in light
  and dark. The walker and `tests/journey_facts/m187.mjs` hold it.
- **B stays drawn, labelled "not picked".** Proposed, not the owner's words: it is kept so the round reads back, with the flip;
  removing it is a small change if the owner prefers.
- **Before anything is built,** Option A's parts move into Prism (the window trio, the measures grid, the too-few block and the
  breakdown row), under `.claude/rules/design-sync.md`.
- **Still proposed:** a rate shows once 30 forecasts have scored (SCI-D03), and the regime rule (SCI-D04). The pick does not
  settle either.
