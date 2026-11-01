# Mypaisaa Prediction

Personal, global multi-asset investment intelligence: research, portfolio visibility, transparent predictions, and disciplined outcome measurement. It provides recommendations and education only; it never executes, routes, or suggests trade orders.

**Starter implementation · Personal use · No trading · Production not deployed**

As of **1 November 2026**, the runnable product code consists of FastAPI health and sample SSE routes. The static site is an illustrative preview. Authentication, durable records, providers, models, agents and web/native product apps remain planned. [Current status and roadmap](docs/implementation-plan.md#current-implementation-status) separates those states explicitly.

| Read next | What it answers |
| --- | --- |
| [Architecture](docs/architecture.md) | How the components, scientific controls and proposed AWS deployment fit together |
| [Technology stack](docs/tech-stack.md) | Which technologies are chosen, which versions are locked and what is implemented |
| [Knowledge base](docs/knowledge-base.md) | Product intent, working decisions and open questions |
| [Implementation plan](docs/implementation-plan.md) | Six delivery phases, exit criteria and manual Jira links |
| [Visual sources](docs/diagrams/README.md) | Editable Lucidcharts, animated companions and static alternatives |
| [Plan-sync record](docs/plan-sync-2026-11-01.md) | The dated local/Jira/Confluence evidence and remaining delivery steps |

## Product boundaries

- **Personal use only.** One operator, least-privilege access, no multi-tenant roadmap in the initial release.
- **Assets:** equities, ETFs, indices, FX, commodities, and crypto where the licensed provider supports them.
- **Not investment advice.** Every prediction is probabilistic, explainable, timestamped, and paired with uncertainty and validation context.
- **No execution.** There are no broker credentials, order endpoints, trade buttons, or agent permissions to transact.

## Architecture at a glance

~~~text
SvelteKit 3 PWA ───────┐                         ┌─ Twelve Data (licensed feed)
React Native shell ────┼─ HTTPS + SSE ─ FastAPI ─┼─ approved public research sources
Swift iOS/iPadOS UI ───┘                    │    └─ Claude API / Agent SDK
                                              │
                              PostgreSQL + object storage backups
                                              │
                         scheduled ingestion → features → model runs
                                              │
                    prediction ledger → outcomes → calibration dashboard
~~~

The detailed component and data design is in [docs/architecture.md](docs/architecture.md). The production footprint is intentionally a small single-host deployment with encrypted backups; see [docs/cost-model.md](docs/cost-model.md).

## Visual guides

The animation follows the **planned** clients, API, data and prediction flow. Moving connectors explain sequence; they are not live traffic, deployed services or measured prediction accuracy. Blue denotes clients, teal API/records, amber data, purple quantitative work, rose research/consent and navy operations; labels carry the same meaning without colour.

![Animated planned system architecture: clients, API, market data, quantitative jobs and immutable predictions](docs/diagrams/system-architecture.gif)

[Static system image](docs/diagrams/system-architecture.png) · [Editable system Lucidchart](https://lucid.app/lucidchart/3ac220d1-225e-43ea-ac44-361d0c369e69/edit)

The native Lucid export below shows the **proposed** single-host AWS footprint, using AWS service components. No resource or region has been provisioned by this documentation work.

[![Native Lucidchart export of the proposed budget-first AWS deployment](docs/diagrams/aws-deployment-lucid.png)](https://lucid.app/lucidchart/f9a80493-7f58-44c1-b201-e97034a1398c/edit)

[Open the editable AWS Lucidchart](https://lucid.app/lucidchart/f9a80493-7f58-44c1-b201-e97034a1398c/edit) · [Diagram sources, snapshots and motion alternatives](docs/diagrams/README.md). GIFs loop; use the static images if motion is distracting. The text diagram above remains a readable fallback.

## Start here tomorrow

The consolidated product brief, technical decisions, constraints, milestones, and open questions are in [docs/knowledge-base.md](docs/knowledge-base.md). It is the durable reference for continuing this project. Read the [current implementation status](docs/implementation-plan.md#current-implementation-status) to distinguish the runnable starter from planned capabilities.

## Repository layout

| Path | Purpose |
| --- | --- |
| backend/ | Runnable FastAPI health/sample SSE starter and tests; planned home for agents, data pipelines and models |
| web/ | Placeholder for the planned SvelteKit 3 PWA |
| mobile/native-ios/ | Placeholder for the planned native Swift/SwiftUI iOS/iPadOS app and domain modules |
| mobile/rn-shell/ | Placeholder for the planned React Native navigation and bridge shell |
| infra/ | Placeholder directories for future local containers and AWS infrastructure as code; no executable infrastructure definition yet |
| docs/ | Architecture, phased implementation plan, cost guardrails, and ADRs |

## Local development

The API is runnable today. The web and mobile directories are placeholders without build manifests. Use Python 3.12 and uv 0.12.9 for the current locked backend environment; web and native toolchains will be established when those apps are implemented.

~~~sh
cd /Users/arundutta/projects/mypaisaa-prediction
cp backend/.env.example backend/.env
uv sync --project backend --frozen --extra dev --python 3.12
uv run --project backend --frozen --extra dev uvicorn app.main:app --reload
~~~

The API health endpoint is at http://localhost:8000/api/v1/health; the sample SSE endpoint is /api/v1/stream. The separate static product preview is in `site/dist/index.html`.

The starter runs without market-data or Claude credentials. Do not put keys in source control. Configure credentials only in your local .env and later in the host’s secret store.

## Quality gates

~~~sh
uv lock --project backend --check
uv run --project backend --frozen --extra dev ruff check backend
uv run --project backend --frozen --extra dev pytest backend/tests -q
python3 -m unittest discover -s tests -v
~~~

Before implementing an endpoint, pipeline, model, or agent, read [AGENTS.md](AGENTS.md). In particular, predictive work must use time-aware split logic and record every published prediction before its outcome is known.

For Codex review rounds, [the review optimisation note](docs/review-optimisation.md) explains risk-based test selection, evidence reuse, regression coverage, and when expensive suites run. Required release gates still apply before shipping.

[GitHub delivery and CI](docs/github-workflow.md) defines `main`, issue branches, PRs, current checks and the GitHub plan restriction that currently prevents server-side branch protection.

## Delivery plan

The ordered, shippable plan is in [docs/implementation-plan.md](docs/implementation-plan.md). In short:

1. Establish the secure personal workspace, canonical market data, and portfolio ledger.
2. Ship an explainable baseline with walk-forward evaluation and a prediction/outcome ledger.
3. Add constrained research agents and SSE-driven web/iOS experiences.
4. Harden operations, monitoring, backups, and budget alerts before relying on it daily.

## Production stance

Do not deploy this starter as-is. The initial production target is under **£50/month AWS spend**, excluding Twelve Data and Claude API costs. It avoids always-on managed databases, load balancers, NAT gateways, and GPU instances. AWS Budgets is an account-level control; its alerts are not an enforced spending cap. See [docs/cost-model.md](docs/cost-model.md) for the assumptions and stop conditions.

## Decisions already made

Key choices and their consequences are captured in [docs/adr](docs/adr):

- FastAPI and SSE for an API-light personal product
- a modular monolith on a small AWS host
- append-only prediction and outcome tracking
- purged walk-forward validation rather than random splits
- Swift-native feature surfaces inside a React Native shell
- Claude agents as bounded research tools, never trading automation
