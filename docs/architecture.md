# Architecture

## Scope

The first production release serves one authenticated owner. It aggregates licensed market data and portfolio records, runs reproducible research/prediction jobs, presents the resulting evidence in web and native mobile clients, and records what happened after every forecast horizon. It is not a brokerage or execution system.

**Status: planned architecture with a runnable backend starter.** As of **1 November 2026**, health and a local sample SSE stream exist, alongside an illustrative static preview. Authentication, persistence, providers, quantitative/research jobs, PWA/native clients and production infrastructure remain pending. The [implementation status](implementation-plan.md#current-implementation-status) and [technology inventory](tech-stack.md) record this boundary.

## Contents

- [System boundaries and visual guides](#visual-guides)
- [Logical components](#logical-components)
- [Data flow](#data-flow)
- [Core records](#core-records)
- [API and event contract](#api-and-event-contract)
- [Research-agent boundaries](#research-agent-boundaries)
- [Mobile division of responsibility](#mobile-division-of-responsibility)
- [Proposed AWS deployment](#proposed-aws-deployment)
- [Security and privacy baseline](#security-and-privacy-baseline)
- [Delivery, evidence and known gaps](#delivery-evidence-and-known-gaps)

## Visual guides

The native Lucid system drawing is the editable source for significant component and trust boundaries. Its labels distinguish the starter from planned services; arrows show intended communication, not live telemetry.

[![Native Lucidchart system architecture: private clients, FastAPI, quantitative and research boundaries, and durable records](diagrams/system-architecture-lucid.png)](https://lucid.app/lucidchart/3ac220d1-225e-43ea-ac44-361d0c369e69/edit)

[Edit the system Lucidchart](https://lucid.app/lucidchart/3ac220d1-225e-43ea-ac44-361d0c369e69/edit). The saved animation below is an explanatory companion, not a live synchronised Lucid document.

![Animated companion showing intended movement through the planned system](diagrams/system-architecture.gif)

[Static system companion](diagrams/system-architecture.png) · [Text fallback](../README.md#architecture-at-a-glance) · [Sources and motion alternatives](diagrams/README.md). GIFs loop; use the static exports when needed. Blue identifies clients, teal API/records, amber data, purple quantitative work, rose research/consent and navy operations; the labels explain every role without depending on colour.

## Logical components

These are planned component responsibilities and technology choices. See the [current implementation status](implementation-plan.md#current-implementation-status) for what exists today.

| Component | Responsibility | Planned initial technology |
| --- | --- | --- |
| API | Authenticated commands, read models, SSE updates, schema validation | FastAPI modular monolith |
| Ingestion | Provider normalisation, quality checks, idempotent writes | scheduled Python jobs |
| Research | Source retrieval, citation extraction, specialist summaries | bounded Claude Agent SDK tools |
| Quant engine | feature creation, training, validation, calibration, scoring | Python, scikit-learn-compatible pipelines |
| Ledger | transactions, holdings, cash, imports, reconciliation | PostgreSQL append-only tables |
| Prediction registry | immutable forecast, model, data cutoff, and realised-outcome records | PostgreSQL |
| Web | installable PWA, research and portfolio views | SvelteKit 3 |
| Mobile | native device experience and shared navigation contracts | Swift-native surfaces in React Native shell |
| Operations | container runtime, backup, logs, restore drill | Docker on a small AWS host plus S3 |

## Data flow

1. An ingestion schedule fetches only permitted provider data. It validates the payload, maps provider symbols to internal instruments, records timestamps and quality flags, then writes immutable raw/canonical records.
2. A feature job declares a data cutoff and emits a versioned feature set. It may only use observations available before that cutoff.
3. A training job runs temporal folds. Each fold learns all preprocessing exclusively from that fold’s training window. It stores metrics, calibration, baselines, feature definition, code revision, dataset hash, and artefact reference.
4. A publishing job may create a forecast only from an approved model run. It saves target, direction/return distribution, horizon, confidence, uncertainty, as-of timestamp, evidence, and explanation.
5. When the horizon passes, the outcome job loads the canonical realised value, creates an immutable outcome record, and updates aggregate dashboards. It never rewrites the original forecast.
6. The API publishes a small SSE notification such as prediction-published or outcome-scored. Clients fetch durable state through normal authenticated API reads.

The lifecycle animation makes the scientific order explicit: declare a cutoff, fit preprocessing only inside each training fold, compare benchmarks, append a forecast, wait for maturity and append its outcome. Research agents supply cited evidence and cannot publish or alter forecasts.

![Animated planned prediction lifecycle: cutoff, walk-forward evaluation, immutable forecast and mature outcome](diagrams/prediction-lifecycle.gif)

[Static lifecycle](diagrams/prediction-lifecycle.png) · [Editable supporting Draw.io source](diagrams/prediction-lifecycle.drawio)

## Core records

| Record | Minimum fields |
| --- | --- |
| Instrument | internal ID, asset class, provider symbols, exchange, currency, active state |
| Market observation | instrument ID, provider, source time, received time, interval, OHLCV/value, quality flags |
| Portfolio transaction | immutable ID, account/import batch, instrument, quantity, price, fees, currency, trade/settle time, source |
| Feature set | version, data cutoff, definition hash, asset universe, storage reference |
| Model run | version, training cutoff, feature set, fold definitions, parameters, metrics, calibration, artefact hash |
| Prediction | ID, model run, instrument, as-of, explicit data cutoff, target, horizon, forecast distribution/probability, confidence/calibration, uncertainty, explanation/evidence references, status, version/supersedes linkage |
| Outcome | prediction ID, realised value/time, scoring method, metrics, outcome version |
| Research item | source URL, publisher/date, retrieval time, extracted claims, citations, agent run ID |

## API and event contract

All external API routes start with /api/v1. The planned initial read/write surface is deliberately small:

| Route family | Purpose |
| --- | --- |
| health | liveness and non-sensitive dependency status |
| instruments | searchable canonical asset catalogue |
| prices | timestamped history and provider freshness metadata |
| portfolio | CSV import preview/commit, transaction ledger, holdings and reconciliation warnings |
| research | source-backed briefings and retrieval status |
| predictions | current forecasts, historical forecasts, outcome metrics, model provenance |
| stream | authenticated server-sent events |

SSE messages contain an event ID, type, occurred-at time, and a resource reference. They do not include credentials, account holdings, raw provider payloads, or model artefacts. Heartbeats detect dead connections. Clients reconnect with the last event ID and then re-fetch their read model so an ephemeral event never becomes a source of truth.

**Starter limitation:** the current stream has no authentication or durable replay and uses volatile in-process IDs/queues. Allowing a `Last-Event-ID` header in CORS does not implement resumption. Authentication, reconnection tests and recovery by re-fetching durable records must be added before production. The contract above describes the required behaviour, not a completed implementation.

## Research-agent boundaries

Specialist agents are useful for source-backed synthesis, not for authority:

| Specialist | Allowed work | Explicitly forbidden |
| --- | --- | --- |
| Market context | summarise macro calendar and cited releases | make price targets or place orders |
| Company research | extract filings/news claims with citations | invent sources or alter forecasts |
| Risk reviewer | identify data staleness, concentration and contradictory evidence | override ledger records |
| Evaluation analyst | explain validation/outcome dashboards | retrain or publish without a gated job |

Each agent receives a narrow task, approved tools, time/token budget, and structured response schema. Browser/retrieval text is untrusted. The system persists prompts, tool calls, cited sources, output, cost metadata, and review status for later auditing.

## Mobile division of responsibility

The Swift layer is the native iOS/iPadOS product: SwiftUI screens, Keychain access, offline cache, widgets, notifications, and large-screen layouts. The React Native shell provides shared navigation, bridge contracts, release coordination, and a path for future non-Apple clients. Feature teams should prefer a native Swift implementation for data-rich iOS/iPadOS screens and expose only stable, typed bridge interfaces.

## Proposed AWS deployment

[![Native Lucidchart AWS deployment: proposed Lightsail host, encrypted S3 backups, CloudWatch and account-level AWS Budgets](diagrams/aws-deployment-lucid.png)](https://lucid.app/lucidchart/f9a80493-7f58-44c1-b201-e97034a1398c/edit)

[Edit the AWS Lucidchart](https://lucid.app/lucidchart/f9a80493-7f58-44c1-b201-e97034a1398c/edit) · [Animated deployment companion](diagrams/aws-deployment.gif)

The initial proposal runs the reverse proxy, API, scheduled worker and PostgreSQL on one small Lightsail host, with encrypted S3 backups and bounded CloudWatch monitoring. This accepts a single-host availability profile; a tested restore path is essential. Region, instance sizing, recovery targets and current regional prices still need confirmation. No executable IaC or deployed resources are claimed.

The recurring AWS target is **below £50/month**, excluding Twelve Data and Claude API. The [cost model](cost-model.md) is a planning estimate, not a verified bill. AWS Budgets operates at account level and is drawn outside the region boundary; £30/£40 alerts are investigation controls, not an enforced spending cap. Deployment and any paid calls still require explicit authorisation.

## Security and privacy baseline

- Authenticate every non-health API endpoint; use device-bound/passkey-capable authentication where possible.
- Store passwords/tokens only in a suitable identity layer or iOS Keychain, never in the web bundle or git.
- Encrypt storage and backups; restrict the server security group to HTTPS and administrative access through a VPN/SSM-style path.
- Rate-limit login and expensive research/model endpoints. Apply CSRF controls to cookie-based web sessions.
- Redact secrets, portfolio values, and provider responses from application logs.
- Validate CSV imports in quarantine before commit; retain original file hash and import diagnostics.
- Document provider licences and retention/use limits before enabling an asset class.

## Delivery, evidence and known gaps

The runnable checks cover backend, Codex tooling, the static preview, workflow syntax and Jira PR metadata. There are no executable PWA, Swift or React Native manifests yet, so no corresponding build, accessibility or device-test pass is claimed. [GitHub workflow](github-workflow.md) documents the five check names and the current lack of server-side branch protection. CI does not deploy or approve independent review.

Implementation follows [MP-4 through MP-9](implementation-plan.md#manual-roadmap-links), with the initial foundation work in MP-10 through MP-13. [MP-3](https://duttaarun2015.atlassian.net/browse/MP-3) tracks this documentation sync. Provider licensing, instrument policies, authentication, persistence schemas and restore procedures remain open foundation work. No approved application screen design or measured predictive result is implied by these architecture drawings.

The [published Confluence architecture](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5145394) and [roadmap](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5112476) are manually maintained snapshots. Repository docs/ADRs hold versioned technical decisions; Jira holds work status. The [dated sync record](plan-sync-2026-11-01.md) records evidence and remaining delivery steps. No comprehensive automatic planning or diagram-drift gate exists.

## Evolution point

The modular monolith is intentional. Split ingestion, research, or model workers only when measured resource contention, isolation, or reliability needs exceed the cost budget. The contracts above allow that extraction without changing clients.
