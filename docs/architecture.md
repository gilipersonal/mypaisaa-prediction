# Architecture

## Scope

The first production release serves one authenticated owner. It aggregates licensed market data and portfolio records, runs reproducible research/prediction jobs, presents the resulting evidence in web and native mobile clients, and records what happened after every forecast horizon. It is not a brokerage or execution system.

## Logical components

| Component | Responsibility | Initial implementation |
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

## Core records

| Record | Minimum fields |
| --- | --- |
| Instrument | internal ID, asset class, provider symbols, exchange, currency, active state |
| Market observation | instrument ID, provider, source time, received time, interval, OHLCV/value, quality flags |
| Portfolio transaction | immutable ID, account/import batch, instrument, quantity, price, fees, currency, trade/settle time, source |
| Feature set | version, data cutoff, definition hash, asset universe, storage reference |
| Model run | version, training cutoff, feature set, fold definitions, parameters, metrics, calibration, artefact hash |
| Prediction | ID, model run, instrument, as-of, horizon, forecast distribution, confidence, explanation, status |
| Outcome | prediction ID, realised value/time, scoring method, metrics, outcome version |
| Research item | source URL, publisher/date, retrieval time, extracted claims, citations, agent run ID |

## API and event contract

All external API routes start with /api/v1. The initial read/write surface is deliberately small:

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

## Security and privacy baseline

- Authenticate every non-health API endpoint; use device-bound/passkey-capable authentication where possible.
- Store passwords/tokens only in a suitable identity layer or iOS Keychain, never in the web bundle or git.
- Encrypt storage and backups; restrict the server security group to HTTPS and administrative access through a VPN/SSM-style path.
- Rate-limit login and expensive research/model endpoints. Apply CSRF controls to cookie-based web sessions.
- Redact secrets, portfolio values, and provider responses from application logs.
- Validate CSV imports in quarantine before commit; retain original file hash and import diagnostics.
- Document provider licences and retention/use limits before enabling an asset class.

## Evolution point

The modular monolith is intentional. Split ingestion, research, or model workers only when measured resource contention, isolation, or reliability needs exceed the cost budget. The contracts above allow that extraction without changing clients.
