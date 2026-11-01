# Mypaisaa Prediction

Personal, global multi-asset investment intelligence: research, portfolio visibility, transparent predictions, and disciplined outcome measurement. It provides recommendations and education only; it never executes, routes, or suggests trade orders.

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

## Start here tomorrow

The consolidated product brief, technical decisions, constraints, milestones, and open questions are in [docs/knowledge-base.md](docs/knowledge-base.md). It is the durable reference for continuing this project.

## Repository layout

| Path | Purpose |
| --- | --- |
| backend/ | FastAPI API, SSE event stream, agents, data pipelines, models, and tests |
| web/ | SvelteKit 3 PWA for research, predictions, and portfolio views |
| mobile/native-ios/ | Testable Swift domain module shared by the native iOS/iPadOS app |
| mobile/rn-shell/ | React Native navigation and platform-integration shell |
| infra/ | Local container definition and deliberately non-applying AWS plan |
| docs/ | Architecture, phased implementation plan, cost guardrails, and ADRs |

## Local development

Prerequisites: Python 3.12+, Node 22+, pnpm 9+, Docker Desktop (optional), and Xcode 16+ for the iOS module.

~~~sh
cd /Users/arundutta/arundutta/projects/mypaisaa-prediction
cp backend/.env.example backend/.env
python -m venv .venv
. .venv/bin/activate
pip install -e './backend[dev]'
uvicorn app.main:app --app-dir backend --reload
~~~

In a second terminal:

~~~sh
cd /Users/arundutta/arundutta/projects/mypaisaa-prediction/web
pnpm install
pnpm dev
~~~

Then visit http://localhost:5173. The API health endpoint is at http://localhost:8000/api/v1/health; the sample SSE endpoint is /api/v1/stream.

The starter runs without market-data or Claude credentials. Do not put keys in source control. Configure credentials only in your local .env and later in the host’s secret store.

## Quality gates

~~~sh
pytest backend/tests
cd web && pnpm test && pnpm check
cd mobile/native-ios && swift test
~~~

Before implementing an endpoint, pipeline, model, or agent, read [AGENTS.md](AGENTS.md). In particular, predictive work must use time-aware split logic and record every published prediction before its outcome is known.

## Delivery plan

The ordered, shippable plan is in [docs/implementation-plan.md](docs/implementation-plan.md). In short:

1. Establish the secure personal workspace, canonical market data, and portfolio ledger.
2. Ship an explainable baseline with walk-forward evaluation and a prediction/outcome ledger.
3. Add constrained research agents and SSE-driven web/iOS experiences.
4. Harden operations, monitoring, backups, and budget alerts before relying on it daily.

## Production stance

Do not deploy this starter as-is. The initial production target is under **£50/month AWS spend**, excluding Twelve Data and Claude API costs. It avoids always-on managed databases, load balancers, NAT gateways, and GPU instances. See [docs/cost-model.md](docs/cost-model.md) for the assumptions and stop conditions.

## Decisions already made

Key choices and their consequences are captured in [docs/adr](docs/adr):

- FastAPI and SSE for an API-light personal product
- a modular monolith on a small AWS host
- append-only prediction and outcome tracking
- purged walk-forward validation rather than random splits
- Swift-native feature surfaces inside a React Native shell
- Claude agents as bounded research tools, never trading automation
