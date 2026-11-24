<div align="center">

<img src="docs/brand/mark-small.svg" width="40" height="40" alt="Mypaisaa Prediction mark">

# Mypaisaa Prediction: Tech stack and cost

**What each layer uses, why, how far it has got, and what it costs to run.**

[README](README.md) · [Architecture](ARCHITECTURE.md)

</div>

---

<div align="center">

<img src="docs/motion/stack-build.gif" width="860" alt="Animation: eight layers stack up from quality and delivery at the bottom to clients at the top; the API and CI layers are marked as running, the rest as owner-selected">

<sub>The stack as selected on 2 November 2026. Green runs today; grey is chosen, not built. <a href="docs/motion/stack-build.png">Still image</a>.</sub>

</div>

Status labels follow [ARCHITECTURE.md](ARCHITECTURE.md): **Implemented** means code in this repository that runs;
**Owner-selected** means chosen and not built. A version in `backend/uv.lock` proves what resolves, not that a
feature exists.

## Contents

1. [Application (Python)](#1-application-python)
2. [Forecasting and data science](#2-forecasting-and-data-science)
3. [Claude](#3-claude)
4. [The web app](#4-the-web-app)
5. [The Apple app](#5-the-apple-app)
6. [AWS services](#6-aws-services)
7. [Services outside AWS](#7-services-outside-aws)
8. [Quality and delivery](#8-quality-and-delivery)
9. [Monthly cost](#9-monthly-cost)
10. [Left over from earlier plans](#10-left-over-from-earlier-plans)

## 1. Application (Python)

| Piece | Choice | Why | Status |
| --- | --- | --- | --- |
| Language | Python 3.12+ | One language for the API, the workflows, the data work and the models | Implemented |
| HTTP API | FastAPI **0.162.0** on Starlette **1.10.0** | Typed routes, Pydantic at the boundary, small enough for Lambda | Implemented (health, sample SSE) |
| Schemas and settings | Pydantic **2.14.2**, pydantic-settings **2.16.2** | Validate every request, response and provider payload | Implemented |
| Server-sent events | sse-starlette **2.4.1** | One-way notices with heartbeats | Sample implemented; auth and replay pending |
| Local server | Uvicorn **0.54.0** | Runs the starter on a laptop | Implemented |
| On AWS | Lambda with a streaming adapter | Pay per request; nothing idles | Owner-selected; streaming proof pending |
| Workflows | Lambda Durable Functions in Python | Long imports, approvals and jobs that survive restarts, in the same language | Owner-selected (ARC-03) |
| Packaging | uv **0.12.9** with a frozen lock | Reproducible installs, the same in CI | Implemented |
| Lambda adapter | AWS Lambda Web Adapter, buffered for the API and streaming for SSE (Mangum the alternative) | The same Uvicorn app on a laptop and on Lambda | Proposed (MP-36); waits on the streaming proof (PL-04) |
| Lambda utilities | Powertools for AWS Lambda (Python): Logger, Metrics, Idempotency, Parameters | Structured logs, cheap metrics, idempotent commands | Proposed (MP-36) |
| DynamoDB access | boto3 with type stubs, a thin typed repository, Decimal money, no ORM | Explicit keys and transactions for the controlled writer | Proposed (MP-36) |
| Client types | Generated from FastAPI's OpenAPI: TypeScript for the web, Swift for the app | One contract for both doors | Proposed (MP-36) |

## 2. Forecasting and data science

| Piece | Choice | Why | Status |
| --- | --- | --- | --- |
| Arrays and frames | NumPy, pandas | Standard, fast enough on CPU | In the optional `ml` extra, unused |
| Models | scikit-learn-style pipelines: ridge, logistic, histogram gradient boosting, quantile | Strong baselines that run on CPU and explain themselves | Owner-selected (ARC-05) |
| Training | SageMaker CPU jobs, at most 2 campaigns a month, 96 fits and 6 instance-hours each | Bursty training without an always-on server | Owner-selected (ARC-04) |
| Serving | Approved artefacts run in a Lambda; forecasts stored daily | No endpoint to pay for between runs | Owner-selected (ARC-04) |
| Validation | Walk-forward with purge and embargo, fold-local fitting, calibration | Time series never split at random | Specified |
| Calendars | pandas-market-calendars, exchange-calendars | Correct sessions for US, UK and India | Used by the synthetic fixtures |

## 3. Claude

| Piece | Choice | Why | Status |
| --- | --- | --- | --- |
| Model host | Anthropic API | Direct access to current Claude models | Owner-selected |
| Client | Official Anthropic Python SDK, explicit tool loop | The server decides every step; nothing autonomous | Owner-selected (ARC-06) |
| Routes | One Lambda worker per task route, one shared runner | Each route keeps its own context, tools and budget | Owner-selected |
| Evaluation | Inspect AI plus deterministic checks | Replays and scored scenarios before any live check | Owner-selected (ARC-09) |
| Models | Haiku 5.5 (`claude-haiku-5-5`) for triage, model inputs and extraction; Opus 5.5 (`claude-opus-5-5`) for up to three event analyses a day; Sonnet 5.5 (`claude-sonnet-5-5`) for chat, explanations, the briefing and eval grading | Each layer gets the model its job needs; Opus only where judgment matters, at batch price | Owner-selected (ARC-06b) |
| Batching and caching | Message Batches for triage, event analysis, model inputs and eval grading; 5-minute prompt caching on every route | Half price on work no one waits for; discounts stack | Owner-selected (ARC-06b) |

## 4. The web app

| Piece | Choice | Why | Status |
| --- | --- | --- | --- |
| Framework | SvelteKit 3, prebuilt and static | Fast, small, no server to run for the shell | Owner-selected (ARC-10) |
| Hosting | S3 and CloudFront | Cheap static hosting with a private origin | Owner-selected |
| Data | Authenticated calls to FastAPI; SSE for notices | Durable state is always a normal read | Owner-selected |
| Install | PWA with Web Push | Works on a laptop, an iPad or a phone | Owner-selected |
| Testing | Playwright end to end with ARIA snapshots, axe-core WCAG 2.2 A and AA checks, Playwright screenshot comparison | Free tools; nothing hosted | Proposed (MP-36) |

The React and Vite project in `site/` is a documentation presentation, not the product app.

## 5. The Apple app

| Piece | Choice | Why | Status |
| --- | --- | --- | --- |
| Screens | Swift and SwiftUI on iOS and iPadOS | Native feel, widgets, Keychain, notifications, large screens | Owner-selected |
| Shell | React Native | Shared navigation and typed bridges, room for other platforms | Owner-selected |
| Device matrix | Still to agree | Versions, foldables and offline behaviour need design first | Open |
| Testing | XCTest and the Maestro CLI on simulators, on the owner's Mac; free local builds on the owner's iPhone and iPad (7-day expiry) for real devices; TestFlight later, only if the owner joins the Developer Program | Free | Proposed (MP-36); free local builds owner-selected 3 Nov 2026 |

## 6. AWS services

| Service | Role in MP | Status |
| --- | --- | --- |
| CloudFront, S3 | Serve the PWA | Owner-selected |
| API Gateway | HTTPS and the SSE stream | Owner-selected |
| Cognito | Google and passkey sign-in, step-up for sensitive actions; Sign in with Apple waits for the paid Apple Developer Program | Owner-selected (ARC-07); Apple waits (owner, 3 Nov 2026) |
| Lambda | The API, data workers, Claude route workers, inference | Owner-selected |
| Lambda Durable Functions | Imports, approvals, daily forecast runs | Owner-selected (ARC-03) |
| EventBridge Scheduler | The daily runs and the 30-minute checks | Owner-selected |
| SQS and dead-letter queues | Buffered, retried, replayable work | Owner-selected |
| DynamoDB | The ledger, forecasts, outcomes and audit | Owner-selected (ARC-02) |
| S3 (private) | Source files, model artefacts, evidence | Owner-selected (ARC-02) |
| SageMaker | Capped CPU training and evaluation jobs | Owner-selected (ARC-04) |
| CloudWatch, X-Ray, CloudTrail | Logs, metrics, traces, API audit | Proposed |
| Tracing | OpenTelemetry through the ADOT Lambda layer to X-Ray, sampled; one trace per waited-on request, linked across queues and batches | Proposed (MP-36) |
| Telemetry budget | 14-day JSON logs, a small set of custom metrics and alarms: about $4.94 a month, already inside the AWS estimate | Proposed (MP-36) |
| SSM Parameter Store (SecureString) | Provider and Anthropic keys; no per-secret fee | Owner-selected 3 Nov 2026 (MP-29) |
| Two accounts | Dev and prod, same shape, one bill | Owner-selected (ARC-11) |
| AWS Organizations (all features) and a cost-guard SCP | Guard rails across the dev and prod accounts; the management account runs nothing. Resource control policies and a Region allowlist were not adopted | Owner-selected 3 Nov 2026 (MP-29) |
| KMS, S3 Block Public Access, IAM Access Analyzer (external access) | A customer key per account; no public buckets; outside sharing flagged | Proposed (MP-36) |
| VPC lockdown | None by default; optional private subnets and endpoints, costed and decided at PH-08 | Proposed (MP-36) |

Not in the plan without a costed ADR: NAT Gateway, load balancers, RDS, GPUs, always-on endpoints.

## 7. Services outside AWS

| Service | Role | Status |
| --- | --- | --- |
| Anthropic API | Claude models | Owner-selected; the shared $200 credit is unverified |
| Yahoo Finance | Prices and history | Owner-selected (ARC-01), confirmed 2 Nov 2026 for personal hobby use; the owner accepts that its published terms forbid automated collection ([MP-10 findings](docs/planning/source-rights-2026-11-02/README.md)) |
| Twelve Data Grow | Prices across US, UK and India | Owner-selected (ARC-01), confirmed 2 Nov 2026; Grow 55 ($29 a month) for prod and Basic ($0) for dev, owner-selected 2 Nov 2026; nothing bought. The owner accepts that Grow is labelled view-only |
| GitHub and Actions | Code, pull requests, CI | Implemented |
| Jira and Confluence | Work tracking and published plans | Implemented |
| Lucidchart | Architecture diagrams | Implemented |
| Apple Developer Program | TestFlight, push, Sign in with Apple and passkeys on a device | Not for now (owner, 3 Nov 2026): free local builds that expire after 7 days; phone notifications through the web app's Web Push until the Developer Program is bought (MP-179) |

## 8. Quality and delivery

| Piece | Choice | Status |
| --- | --- | --- |
| Tests | pytest **8.4.2**, httpx **0.28.1** | Implemented for the starter |
| Lint | Ruff **0.17.3** | Implemented |
| CI | GitHub Actions: Backend, Docs, Review tooling, Agent config, Plan sync, Confluence receipts, Static preview, Workflow lint, Jira traceability | Implemented |
| Code scanning | GitHub CodeQL, default setup: Python, JavaScript and TypeScript, GitHub Actions; a required check in `.github/main-protection.json` | Implemented (MP-198) |
| Change checks | `scripts/review_checks.py` picks checks by changed path | Implemented |
| Secret scanning | GitHub secret scanning with push protection, free on a public repository | Implemented (MP-198) |
| Vulnerability scanning | Dependabot alerts and security updates are on (read 24 Nov 2026); proposed: OSV-Scanner and pip-audit on the locks, gitleaks CLI, Ruff S rules, terraform validate, TFLint and Checkov on the Terraform | Dependabot implemented; the rest proposed (MP-36) |
| Release path | One artefact built on main, deployed by GitHub OIDC to dev, then to prod by a release workflow only the owner can start; Lambda alias rollback | Release route owner-selected 3 Nov 2026; the rest proposed (MP-36) |
| CI minutes | Free: standard GitHub-hosted runners, macOS included, are free and unlimited on a public repository (GitHub docs, checked 24 Nov 2026); GitHub Free caps concurrency at 20 jobs, 5 of them macOS. Apple builds stay on the owner's Mac until the owner chooses otherwise (MP-199) | Proposed (MP-36) |
| Test IDs | One shared dictionary generating web `data-testid` and Swift accessibility identifiers | Proposed (MP-36) |
| Infrastructure as code | **Terraform only**, from day one: every AWS change goes through Terraform. Plan-only until an apply is asked for ([MP-29](docs/planning/region-network-2026-11-03/README.md)) | Owner-selected 3 Nov 2026 |

## 9. Monthly cost

<div align="center">

<img src="docs/motion/budget.gif" width="860" alt="Animation: a £100 bar fills with data £30, AWS £22, Claude £15 and £3 for uncertainty, with a £30 reserve; warn, reduce and pause marks at £60, £75 and £85; three bars show the selected months: £46.48 with Claude off, £59.73 with Claude option A and the top-5 scan at its cap, and the Apple fee month of £141.52, the one allowed exception">

<sub>The ceiling, the plan and the selected months. <a href="docs/motion/budget.png">Still image</a>.</sub>

</div>

**The ceiling** is £100 a month all-in: dev and prod AWS, market data, Claude and evaluations. It is planned as £70 of
operation and £30 of reserve. Optional work gets a warning at £60, is reduced at £75 and paused at £85, keeping a small
window for sign-in, ledger reads, audit and recovery.

**The proposed split of the £70** (ceilings, not separate pots):

| Part | Up to |
| --- | --- |
| Market data | £30 |
| AWS, both accounts | £22 |
| Claude and evaluations | £15 |
| Forecast and price uncertainty | £3 |

**The selected months** at £0.80 to the dollar and 20% tax, in Virginia (us-east-1, owner-selected 2 November 2026),
with Twelve Data Grow 55 at $29 and the owner's existing domain, mypaisapp.com, renewed outside MP (owner, 3 November
2026), so no month carries a domain renewal:

| Month | Cash in the month |
| --- | --- |
| An ordinary month, Claude off | £46.48 |
| An ordinary month, Claude option A | £54.73 |
| Either, with the top-5 scan at its £5 cap | £51.48 or £59.73 |
| The Apple fee month, only if the owner joins (the one allowed exception) | about £141.52 or £149.77 |

The earlier drafts (Grow at $79: £94.48 a month, £108.88 in a domain month; Grow 55 in a domain month: £60.88) are
superseded by those choices. The fit stays conditional on the Grow 55 checkout price, listing rights and the measured
workload ([cost specification](docs/planning/foundation-specifications-2026-11-02/costs/specification.md),
[MP-29](docs/planning/region-network-2026-11-03/README.md#the-all-in-envelope)).

### What moves the number

- **The data plan.** Grow at $79 is £75.84 on its own, more than the whole operating plan. It decides the month.
- **Claude.** With the chosen models (ARC-06b) a normal month is about $8.59 (£8.24): Opus event analysis is about
  $5 of it, kept there by a cap of three a day. Live chat moves it most in a busy month. The top-5 scan may add up to
  £5 (owner, 3 November 2026), about £13.24 in all, inside the £15 Claude allocation the owner chose that day (with £3
  left for forecast and price uncertainty); a scan overrun stops at the Claude cap.
- **Streaming.** One held SSE connection for a month costs about $21.60 of Lambda time before requests; design for
  short streams and re-reads.
- **Training.** Capped by campaign, fit count and instance-hours, and admitted against the budget before it starts.

### Guard rails

- Cash is counted in the month an invoice is due, never amortised. An unknown amount blocks a new commitment.
- No paid fallback switches on by itself, and no feature is cut silently to save money.
- Hard caps on requests, concurrency, timeouts and retention, because budget alerts arrive late.
- Nothing is bought, applied or deployed without an explicit request.

Source: [the cost specification](docs/planning/foundation-specifications-2026-11-02/costs/specification.md) and
[its model](docs/planning/foundation-specifications-2026-11-02/costs/model.json). These are planning scenarios, not
invoices.

## 10. Left over from earlier plans

`backend/pyproject.toml` still lists optional extras from before the directions were chosen. They resolve in the
lock but are not the selected stack and should not be installed for new work:

| Extra | Packages (locked) | Superseded by |
| --- | --- | --- |
| `data` | SQLAlchemy 2.1.6, asyncpg 0.32.0, Alembic 1.20.1 | DynamoDB (ARC-02) |
| `agents` | claude-agent-sdk 0.2.176 | The Anthropic client SDK with an explicit loop (ARC-06) |
| `ml` | NumPy 2.5.4, pandas 2.3.3, scikit-learn 1.9.1 | Still the likely libraries; versions to be re-chosen at build time |

The single Lightsail host, PostgreSQL and the £50 AWS-only budget in the early ADRs are history.
