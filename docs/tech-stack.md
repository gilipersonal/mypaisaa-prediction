# Technology stack

**Snapshot: 1 November 2026 · Backend starter implemented · Product clients and production services planned**

This inventory separates technology choices from working features. A package in `uv.lock` proves a resolved dependency version, not an implemented product capability or a completed compatibility test. [Architecture](architecture.md) explains the boundaries; [implementation status](implementation-plan.md#current-implementation-status) names what remains unbuilt.

## Stack in context

The animated companion shows the intended relationship between clients, the API, licensed data, scientific evaluation, bounded research and immutable records. It explains direction and sequence; it is not live telemetry, deployed infrastructure or a performance claim.

![Animated planned technology flow across clients, API, data, research and quantitative records](diagrams/system-architecture.gif)

[Static system companion](diagrams/system-architecture.png) · [Canonical system Lucidchart](https://lucid.app/lucidchart/3ac220d1-225e-43ea-ac44-361d0c369e69/edit) · [Diagram sources and legend](diagrams/README.md). GIFs loop; use the static image if motion is distracting. Blue identifies clients, teal API/records, amber data, purple quantitative work, rose research/consent and navy operations; labels carry those meanings without colour alone.

## Components and version evidence

Versions below come from this repository's [backend manifest](../backend/pyproject.toml), [dependency lock](../backend/uv.lock) and [CI definition](../.github/workflows/verify.yml). They are not a claim that these are the latest available releases. No new provider or Claude call was made to prepare this inventory.

| Component | Chosen technology | Implemented status | Version evidence |
| --- | --- | --- | --- |
| Backend language | Python | Runnable starter; project requires Python 3.12+ | `requires-python = ">=3.12"`; CI selects Python 3.12 |
| HTTP API | FastAPI | Health and sample SSE route registration exist; product APIs pending | FastAPI **0.162.0** resolved in `backend/uv.lock` |
| Configuration | Pydantic Settings | Environment-backed starter settings | `pydantic-settings` **2.16.2** locked |
| ASGI server | Uvicorn | Local development entry point documented | Uvicorn **0.54.0** locked |
| Server-sent events | `sse-starlette` | Sample stream and heartbeat code; authentication and durable recovery pending | `sse-starlette` **2.4.1** locked |
| Dependency management | uv | Frozen backend installation and lock checks in CI | CI pins **uv 0.12.9** |
| Backend tests and lint | pytest, Ruff | Starter suites/configuration and CI exist | pytest **8.4.2**, Ruff **0.17.3** locked; a lock entry is not a fresh test result |
| Database | PostgreSQL | Planned system of record; no persistence implementation or server declared | Server major version not selected or verified |
| Database access/migrations | SQLAlchemy, asyncpg, Alembic | Optional `data` group; schemas and migrations not implemented | SQLAlchemy **2.1.6**, asyncpg **0.32.0**, Alembic **1.20.1** locked as optional dependencies |
| Quantitative pipeline | NumPy, pandas, scikit-learn-compatible estimators | Optional `ml` group; feature, evaluation, calibration and scoring code pending | NumPy **2.5.4**, pandas **2.3.3**, scikit-learn **1.9.1** locked; scientific validity not established by versions |
| Research runtime | Claude Agent SDK and Claude API | Optional `agents` group; research agents and provider invocation not implemented | `claude-agent-sdk` **0.2.176** locked; model ID/API configuration not selected |
| Primary market data | Twelve Data | Planned licensed feed; provider adapter not implemented | Subscription, enabled markets and quotas require confirmation |
| Supplemental data | Yahoo Finance, only if permitted by reviewed terms | Optional proposal; no adapter enabled | Licence/use review required before adoption |
| Product web app | SvelteKit 3 PWA | Planned; `web/` has no executable app manifest | **3** is the requested target; package versions, adapter and compatibility remain unverified |
| Apple feature UI | Swift / SwiftUI, iOS and iPadOS | Planned native product screens, cache and device integrations | No `Package.swift` or executable native project; Swift/Xcode/deployment versions not selected |
| Mobile shell | React Native | Planned navigation and typed Swift bridge | No executable shell manifest; React Native version and bridge compatibility not selected |
| Static concept preview | Buildless HTML/CSS | Illustrative `site/dist/index.html` exists; not the product PWA | No JavaScript application framework version implied |
| Containers and IaC | Small-host containers; infrastructure as code | Placeholder directories only; tool choice and definitions pending | No Docker image, Compose stack or IaC provider version claimed |
| Hosting and backups | AWS Lightsail, encrypted S3 backups | Proposed personal-production shape; not provisioned by this work | Region, sizing, retention, prices and resource definitions not yet confirmed |
| Monitoring and cost alerts | CloudWatch and AWS Budgets | Planned bounded logs/alarms and account-level spend alerts | No deployed alarms, budget or observed spend claimed |
| Delivery | GitHub Actions, issue branches and PRs to `main` | Backend/tooling/preview/workflow/Jira-metadata checks configured | Action revisions and tool pins live in `.github/workflows/`; server-side protection remains unavailable under the current GitHub plan |
| Architecture sources | Lucidchart; Draw.io supporting workflows/animation companions | Editable architecture documents and saved exports exist | Source IDs and snapshot hashes in [diagram manifest](diagrams/manifest.json); manual refresh only |

## Proposed runtime footprint

This native Lucidchart export uses AWS components for the proposed deployment. It shows one small host for the reverse proxy, API, scheduled worker and PostgreSQL, plus encrypted S3 backups and bounded monitoring. All infrastructure remains planned.

[![Native Lucidchart proposed AWS technology footprint with Lightsail, S3, CloudWatch and account-level AWS Budgets](diagrams/aws-deployment-lucid.png)](https://lucid.app/lucidchart/f9a80493-7f58-44c1-b201-e97034a1398c/edit)

[Edit the AWS Lucidchart](https://lucid.app/lucidchart/f9a80493-7f58-44c1-b201-e97034a1398c/edit) · [Animated deployment companion](diagrams/aws-deployment.gif) · [Cost assumptions](cost-model.md)

The recurring AWS target is **below £50/month**, excluding Twelve Data and Claude API. Planning allowances are not verified current prices or a spending guarantee. AWS Budgets is an account-level control outside the region boundary: forecast alerts at £30 and an investigation threshold at £40 do not enforce a hard cap. Deployment, paid calls and infrastructure changes require explicit authorisation.

## Contracts that govern the choices

- **Personal use, no trading:** no broker execution credentials, order endpoints or agent transaction authority.
- **Durable truth:** portfolio transactions, model runs, predictions, corrections and mature outcomes require append-only records. PostgreSQL is planned for that role; the sample event bus is not a database.
- **Scientific validity:** chronological walk-forward evaluation, appropriate purge/embargo, train-fold-only preprocessing/calibration, declared benchmarks and reproducible provenance are required before claiming predictive performance.
- **Research boundaries:** Claude agents organise cited evidence with allowlisted tools and token/time limits. They cannot mutate models, publish forecasts, trade or access secret values.
- **Transport:** `/api/v1/stream` currently lacks authentication and durable replay. IDs and queues are process-local; accepting `Last-Event-ID` in CORS does not implement resumption. Production clients must reconnect safely and re-fetch durable state.
- **Client split:** Swift owns meaningful iOS/iPadOS screens, cache, secure device integration and accessibility. React Native owns navigation and typed bridge contracts. The web PWA remains a separate planned client over the same authenticated API.

## Build and verification boundaries

Current CI covers **Backend, Codex tooling, Static preview, Workflow lint and Jira traceability**. The preview check is structural; it does not certify an operational PWA, browser accessibility or investment functionality. Web, Swift and React Native builds/tests must be added with their first executable manifests. [GitHub delivery and CI](github-workflow.md) records the procedure and existing evidence; this document does not assert a fresh test pass.

The initial planning tasks are [MP-10: data licences and instrument policies](https://duttaarun2015.atlassian.net/browse/MP-10), [MP-11: personal authentication](https://duttaarun2015.atlassian.net/browse/MP-11), [MP-12: persistence schemas](https://duttaarun2015.atlassian.net/browse/MP-12), and [MP-13: backups and restore verification](https://duttaarun2015.atlassian.net/browse/MP-13). The [manual roadmap mapping](implementation-plan.md#manual-roadmap-links) links phases to MP-4 through MP-9.

The [Confluence architecture](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5145394) and [development/CI page](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5014127) are published snapshots. Local docs and accepted ADRs hold versioned technical decisions; Jira holds work status. Updates are deliberate, approved plan-sync operations, not an automatic bidirectional synchronisation. [MP-3](https://duttaarun2015.atlassian.net/browse/MP-3) tracks this sync; repository changes remain on its issue branch until approved delivery to `main`.

## Documentation reference

Document organisation was informed by the user-supplied [Smart-Clearance repository](https://github.com/aibuilder2026/smart-clearance/tree/55676ab4b088713749020678afa1df40cd303f00), read on **1 November 2026** at commit `55676ab4b088713749020678afa1df40cd303f00`: its [README](https://github.com/aibuilder2026/smart-clearance/blob/55676ab4b088713749020678afa1df40cd303f00/README.md), [architecture document](https://github.com/aibuilder2026/smart-clearance/blob/55676ab4b088713749020678afa1df40cd303f00/ARCHITECTURE.md), and [technology-stack document](https://github.com/aibuilder2026/smart-clearance/blob/55676ab4b088713749020678afa1df40cd303f00/docs/smart-clearance-tech-stack.html). The adopted patterns are explicit status, layer/version tables, inline editable-diagram links, operational boundaries and known gaps. This project's technology choices and requirements remain those recorded in its own [knowledge base](knowledge-base.md) and [ADRs](adr).
