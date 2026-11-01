# Visual architecture and delivery guide

**Snapshot date: 1 November 2026.** These diagrams explain intended structure and
sequence. Moving connectors are explanatory animation, not live traffic, model
performance, resource deployment or an automated planning-sync service.

## Editable sources and viewing formats

| Diagram | Canonical editable source | Animated companion | Static alternative |
| --- | --- | --- | --- |
| System architecture | [Lucidchart](https://lucid.app/lucidchart/3ac220d1-225e-43ea-ac44-361d0c369e69/edit) | [GIF](system-architecture.gif), [SVG](system-architecture.svg) | [Native Lucid PNG](system-architecture-lucid.png), [companion PNG](system-architecture.png) |
| Budget-first AWS deployment | [Lucidchart](https://lucid.app/lucidchart/f9a80493-7f58-44c1-b201-e97034a1398c/edit) | [GIF](aws-deployment.gif), [SVG](aws-deployment.svg) | [Native Lucid PNG](aws-deployment-lucid.png), [companion PNG](aws-deployment.png) |
| Prediction-to-outcome lifecycle | [Draw.io](prediction-lifecycle.drawio) | [GIF](prediction-lifecycle.gif), [SVG](prediction-lifecycle.svg) | [PNG](prediction-lifecycle.png) |
| Consent-gated delivery workflow | [Draw.io](delivery-workflow.drawio) | [GIF](delivery-workflow.gif), [SVG](delivery-workflow.svg) | [PNG](delivery-workflow.png) |

Open a `.drawio` file in [diagrams.net](https://app.diagrams.net/). The system and
AWS `.drawio` files are editable **animation companions**, not replacements for
their canonical Lucidchart documents. Lucidchart architecture uses native AWS 2024
Region, Lightsail, S3, CloudWatch and AWS Budgets components where relevant.
AWS Budgets is shown outside the region as an account-level control. The
saved `.lucid.json` files record native import specifications. `*-lucid.png` files
are actual native Lucid exports; the other PNG/GIF/SVG files are generated from the
saved explanatory model and intentionally use simpler coloured blocks.

SVGs include a title and text description and stop connector motion when the
viewer honours `prefers-reduced-motion`. GIFs loop without a pause control; choose
the linked static PNG if motion is distracting. Colour is supplemented by labels
and explicit status, rather than carrying meaning alone.

## Colour and status language

| Role | Treatment | Meaning |
| --- | --- | --- |
| Clients | Blue | PWA and Swift-native Apple surfaces, with the React Native shell/bridge |
| API and records | Teal | FastAPI interfaces and durable ledger/prediction records |
| Data | Amber | Licensed inputs, provenance and tracking |
| Quantitative work | Purple | Temporal evaluation, bounded jobs and approved model runs |
| Research and consent | Rose | Bounded research or an explicit human decision |
| Operations | Navy | Delivery, infrastructure boundaries and controls |

AWS native icons retain their familiar service-category colours. All AWS resources
and all scientific-pipeline features are **planned**. The current backend supplies
only health and an unauthenticated, volatile sample SSE stream; its IDs cannot
resume durable history. Authentication, persistence, data providers, models,
research agents, PWA/native clients and production infrastructure remain pending.

Research agents are read-only assistants: they cannot trade, mutate models or
publish forecasts. Quantitative preprocessing and calibration fit only inside
each training fold; predictions are immutable, outcomes wait for maturity, and
corrections append a superseding version.

The AWS diagram expresses a target below £50/month excluding Twelve Data and
Claude API. Regional prices and actual usage still require confirmation. Budget
alerts and investigation thresholds are not an enforced spending cap. No AWS
account or selected region is implied.

The delivery diagram is a normal successful path. A Jira closure failure must
still allow an attempt to return a clean local checkout safely to `main`, with
merge, closure and local-sync results reported separately. PR creation, merge and
issue closure require the current user's explicit consent; review requires
separate consent before every round. No diagram authorises deployment.

## Maintain and regenerate

`diagrams.json` is the local explanatory model; `palette.json` separates primitive
colours, semantic roles and component settings. These drive all local companion
exports through one renderer. Native Lucid import snapshots are stored separately
as `system-architecture.lucid.json` and `aws-deployment.lucid.json`, because native
AWS icons and container geometry differ from the simplified animation companion.

To rebuild local companions with Python and Pillow:

```sh
python3 -m venv docs/diagrams/.venv
docs/diagrams/.venv/bin/python -m pip install Pillow==12.3.0
docs/diagrams/.venv/bin/python docs/diagrams/generate_diagrams.py
```

Use Arial on macOS or DejaVu Sans on Linux. The script validates XML IDs and edge
endpoints, SVG parsing, GIF frame count and actual frame movement. It does not
read Lucidchart or update Confluence. Native PNG exports are left untouched.

When changing architecture, read the canonical Lucid document first, update it
using the project architecture-diagram skill, validate it and visually inspect a
fresh native PNG. Then update the local explanatory model, regenerate companions
and deliberately refresh the approved Confluence attachments. Record source IDs,
export versions and hashes in `manifest.json`. There is **no automatic pull,
bidirectional synchronisation or diagram-drift gate**; these are manual snapshots.

## Requirements and sources

- [Architecture](../architecture.md), [ADRs](../adr), [implementation status](../implementation-plan.md#current-implementation-status) and [GitHub workflow](../github-workflow.md).
- [Draw.io animated connectors](https://www.drawio.com/docs/manual/connectors/connector-animate/) documents native flow animation and SVG/GIF export support.
- Native Lucid specifications and component IDs were discovered through the connected Lucid MCP resources and validated before creation. The diagrams were made without enabling public sharing or inviting collaborators.
