# Documentation motion

Fifteen animations, each built from an HTML and SVG scene in [`build_motion.py`](build_motion.py). The renderer pauses
every CSS animation, seeks it frame by frame in the local Chrome and hands the frames to ffmpeg, so a GIF comes out
the same every time. Each GIF has a still PNG beside it for anyone who prefers no motion; GIFs loop and have no pause
control.

| Animation | Used in | Shows |
| --- | --- | --- |
| [forecast-lifecycle](forecast-lifecycle.gif) · [still](forecast-lifecycle.png) | README | Freeze the inputs, forecast a distribution, wait for the horizon, score the outcome |
| [system-flow](system-flow.gif) · [still](system-flow.png) | ARCHITECTURE §3 | Four journeys through the system: open the app, import, the daily forecast, ask why |
| [learning-loop](learning-loop.gif) · [still](learning-loop.png) | ARCHITECTURE §6 | Record, wait, score, propose, shadow, and the owner's approval |
| [stack-build](stack-build.gif) · [still](stack-build.png) | TECH-STACK | Eight layers, with what runs today marked |
| [budget](budget.gif) · [still](budget.png) | TECH-STACK §9 | The £100 ceiling, the £70 plan, the thresholds and three draft scenarios |
| [logo-intro](logo-intro.gif) · [still](logo-intro.png) | docs/brand | The mark drawing itself beside the wordmark |
| [roadmap](roadmap.gif) · [still](roadmap.png) | Confluence | The ten phases as a road, the four owner gates before any build, and where planning stands (PH-00) |
| [import-approval](import-approval.gif) · [still](import-approval.png) | Confluence | A statement from quarantine to an approved proposal: a complete group is written, an unresolved entry stays pending |
| [claude-routes](claude-routes.gif) · [still](claude-routes.png) | Confluence | Overnight batch lane (Haiku triage, Opus event analysis) and live lane (Sonnet briefing, explanations and chat) |
| [daily-window](daily-window.gif) · [still](daily-window.png) | Confluence | The 75-minute window from the close to issued forecasts, beside the 30-minute quote and risk checks |
| [trace-journey](trace-journey.gif) · [still](trace-journey.png) | Confluence | One request traced from the app to DynamoDB: the trace ends where work waits for approval, a span link and shared IDs carry on, and a prompt is never logged (proposed) |
| [delivery-pipeline](delivery-pipeline.gif) · [still](delivery-pipeline.png) | Confluence | The nine CI checks that run today, then the proposed scan gate, dev, smoke, owner approval, prod and a Lambda alias rollback |
| [device-matrix](device-matrix.gif) · [still](device-matrix.png) | Confluence | One Maestro flow on an iPhone and a rotating iPad, the accessibility and ID checks, then a private TestFlight beta (proposed) |
| [perimeter-layers](perimeter-layers.gif) · [still](perimeter-layers.png) | Confluence | The data perimeter built layer by layer, beside what each VPC lockdown step costs against the £22 AWS share and the £100 ceiling (proposed) |
| [a11y-pipeline](a11y-pipeline.gif) · [still](a11y-pipeline.png) | Confluence | One web page through Playwright, an ARIA snapshot, axe-core for WCAG 2.2 AA and a screenshot diff, and the rule that no figure hides behind a spinner (proposed) |

These are explainers. They show no live traffic, no deployed service and no real forecast; figures on them are
illustrative or come from the planning documents named on the scene.

## Rebuild

Needs Google Chrome and ffmpeg.

```bash
uv run --no-project --with playwright python docs/motion/build_motion.py
```

Name scenes to rebuild only those, for example `... build_motion.py budget system-flow`. The rendered HTML of each
scene is written to `src/` so it can be opened in a browser. `python3 docs/readme/check_readme.py` checks that every
GIF has real motion, a still and a sensible size.
