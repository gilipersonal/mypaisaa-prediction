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
| Framework | SvelteKit **3.4.0** with Svelte **5.59.1** and Vite **8.3.8**, prebuilt and static (`@sveltejs/adapter-static` **4.0.1**) | Fast, small, no server to run for the shell | Owner-selected (ARC-10); the shell implemented locally on sample data (MP-134) |
| Hosting | S3 and CloudFront | Cheap static hosting with a private origin | Owner-selected |
| Data | Authenticated calls to FastAPI; SSE for notices | Durable state is always a normal read | Owner-selected |
| Install | PWA with Web Push | Works on a laptop, an iPad or a phone | Owner-selected |
| Testing | Playwright end to end with ARIA snapshots, axe-core WCAG 2.2 A and AA checks, Playwright screenshot comparison | Free tools; nothing hosted | Proposed (MP-36); for the shell, Vitest **5.1.1** unit tests and Playwright **1.65.1** with axe-core **4.14.1** implemented (MP-134), run locally and out of CI since 25 November 2026 (MP-206); ARIA snapshots and screenshot comparison not yet |

The React and Vite project in `site/` is a documentation presentation, not the product app.

## 5. The Apple app

| Piece | Choice | Why | Status |
| --- | --- | --- | --- |
| Screens | Swift and SwiftUI on iOS and iPadOS | Native feel, widgets, Keychain, notifications, large screens | Owner-selected |
| Shell | React Native | Shared navigation and typed bridges, room for other platforms | Owner-selected |
| Device matrix | MP40-Q12a "Your own devices only": the option read "Support and test the iPhone and iPad you own, at the iOS they run. You give the models." MP40-Q12b "Any window width": the option read "The Apple app lays out by window width, so a narrow iPad window uses the phone layout." | No foldable is promised (the option's cost) | Owner-selected 5 Nov 2026 (MP-184); the models are not yet given |
| Offline copy | MP40-Q12c "Both keep the five": the option read "A browser keeps the same five kinds, each with its age, as the web frames draw now." OWN-37 "Saved copy also times out": the option read "The copy clears on the next connection, and the app also stops showing it after a set time without reaching the server. You choose the time." MP203-01, 24 November 2026 (MP-203): the owner picked "Same rule, same time" (pressed on the page). The option read: "The browser's copy clears on its next connection and stops showing after the same time-out as the Apple app. One value, which you still set." | The five kinds as the frames draw them: holdings, prices, forecasts, notices and cost | Owner-selected 5 Nov 2026 (MP-184) and 24 Nov 2026 (MP-203); the one time, for the app and a browser alike, is not yet set, and how a browser protects its copy is unverified and needs an architecture answer before build |
| Native features | MP40-Q13 "Widgets and share first": the option read "Widgets and statement sharing come at launch, and Spotlight, Siri and Live Activities are recorded as later." MP203-07, 24 November 2026 (MP-203): the owner picked "Widen three existing stories" (pressed on the page). The option read: "MP-47 gains the unlock step, MP-107 the factsheet reader and MP-163 the two builds." MP-163 carries the widget and share-sheet builds | Unverified that both work on free seven-day builds; if either does not, it moves to later (the option's cost) | Owner-selected 5 Nov 2026 (MP-184) |
| Testing | MP203-11, 24 November 2026 (MP-203): the owner picked "Build and unit tests in CI" (pressed on the page). The option read: "Each pull request that touches the Apple app builds it and runs XCTest on a free macOS runner. Maestro journeys and real-device builds stay on your Mac." So XCTest runs on a free macOS runner for every pull request that touches the Apple app; the Maestro CLI on simulators stays on the owner's Mac; free local builds on the owner's iPhone and iPad (7-day expiry) for real devices; TestFlight later, only if the owner joins the Developer Program | Free: £0 while the repository is public; about £5.95 per 100 macOS minutes if it went private again | Proposed (MP-36); free local builds owner-selected 3 Nov 2026; build and XCTest in CI owner-selected 24 Nov 2026 (MP-203) |

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
| AWS Organizations (all features) and a cost-guard SCP | Guard rails across the dev and prod accounts; the management account runs nothing. Resource control policies and a Region allowlist were not adopted. Three more policies (keep CloudTrail on, deny root actions, forbid leaving the organisation): MP40-Q4 "Add all three": the option read "The three policies join the cost guard in Terraform, and they bind the dev and prod accounts." | Owner-selected 3 Nov 2026 (MP-29); the three added 5 Nov 2026 (MP-184) |
| KMS, S3 Block Public Access, IAM Access Analyzer (external access) | A customer key per account; no public buckets; outside sharing flagged | Proposed (MP-36) |
| VPC lockdown | None at launch: MP40-Q7 "Stay with no private network": the option read "Sign-in, permissions and each worker's allowed hosts stay the controls, with no VPC." The optional steps stay costed on the perimeter page | Owner-selected 5 Nov 2026 (MP-184) |

Not in the plan without a costed ADR: NAT Gateway, load balancers, RDS, GPUs, always-on endpoints.

## 7. Services outside AWS

| Service | Role | Status |
| --- | --- | --- |
| Anthropic API | Claude models | Owner-selected; the shared $200 credit is unverified. Paid use: OWN-04 "Approve paid Claude at launch": the option read "You approve paid use, so chat, research and explanations can run from day one, each route after passing its evaluation." Picking it does not turn Claude on: paid calls still need the owner's explicit word when the time comes. Usage and cost: MP40-Q5 "Adopt the key": the option read "The prod collector alone reads it from secure storage every six hours and fills the Claude line. Ready stands." The key's price, and whether the account can have one, are unverified (5 Nov 2026, MP-184) |
| Yahoo Finance | Prices and history | Owner-selected (ARC-01), confirmed 2 Nov 2026 for personal hobby use; the owner accepts that its published terms forbid automated collection ([MP-10 findings](docs/planning/source-rights-2026-11-02/README.md)) |
| Twelve Data Grow | Prices across US, UK and India | Owner-selected (ARC-01), confirmed 2 Nov 2026; Grow 55 ($29 a month) for prod and Basic ($0) for dev, owner-selected 2 Nov 2026; nothing bought. The owner accepts that Grow is labelled view-only |
| GitHub and Actions | Code, pull requests, CI | Implemented |
| Jira and Confluence | Work tracking and published plans | Implemented |
| Lucidchart | Architecture diagrams | Implemented |
| Apple Developer Program | TestFlight, push, Sign in with Apple and passkeys on a device. The bar covers the Apple app only: ADM-04 "Allowed in the browser": the option read "The bar covers the Apple app only, so Phone web may enrol a passkey once a test proves it works." (5 Nov 2026, MP-184; MP-197 tests it) | Not for now (owner, 3 Nov 2026): free local builds that expire after 7 days; phone notifications through the web app's Web Push until the Developer Program is bought (MP-179) |

## 8. Quality and delivery

| Piece | Choice | Status |
| --- | --- | --- |
| Tests | pytest **9.2.0**, pytest-asyncio **1.5.0**, httpx **0.28.1** | Implemented for the starter |
| Lint | Ruff **0.17.3** | Implemented |
| CI | GitHub Actions: Backend, Docs, Review tooling, Agent config, Plan sync, Confluence receipts, Static preview, Workflow lint, Jira traceability | Implemented |
| Code scanning | GitHub CodeQL, default setup: Python, JavaScript and TypeScript, GitHub Actions; a required check in `.github/main-protection.json` | Implemented (MP-198) |
| Change checks | `scripts/review_checks.py` picks checks by changed path | Implemented |
| Secret scanning | GitHub secret scanning with push protection, free on a public repository | Implemented (MP-198) |
| Vulnerability scanning | Dependabot alerts and security updates are on (read 24 Nov 2026); proposed: OSV-Scanner and pip-audit on the locks, gitleaks CLI, Ruff S rules, terraform validate, TFLint and Checkov on the Terraform | Dependabot implemented; the rest proposed (MP-36) |
| Release path | One artefact built on main, deployed by GitHub OIDC to dev, then to prod from the GitHub production environment; Lambda alias rollback. MP203-08, 24 November 2026 (MP-203): the owner picked "An environment replaces route A" (pressed on the page). The option read: "A merge to main starts the release, which waits in the production environment for your approval." It replaces route A, a release workflow the owner alone dispatched (chosen 3 Nov 2026). Administrators can bypass environment rules by default (recorded 24 November 2026). Proposed: the prod role trusts only that environment, checked against GitHub's documentation before build. It costs £0 while the repository is public; on a private repository required reviewers would need GitHub Enterprise, about £20.16 a user a month (recorded 3 November 2026). | Release route owner-selected 24 Nov 2026 (MP-203), replacing route A of 3 Nov 2026; the rest proposed (MP-36) |
| CI minutes | Free: standard GitHub-hosted runners, macOS included, are free and unlimited on a public repository (GitHub docs, checked 24 Nov 2026); GitHub Free caps concurrency at 20 jobs, 5 of them macOS. Pull requests that touch the Apple app build it and run XCTest on a free macOS runner; Maestro journeys and real-device builds stay on the owner's Mac (MP203-11). About £5.95 per 100 macOS minutes if the repository went private again | Proposed (MP-36); the Apple split owner-selected 24 Nov 2026 (MP-203) |
| Test IDs | One shared dictionary generating web `data-testid` and Swift accessibility identifiers | Proposed (MP-36) |
| Infrastructure as code | **Terraform only**, from day one: every AWS change goes through Terraform. Plan-only until an apply is asked for ([MP-29](docs/planning/region-network-2026-11-03/README.md)) | Owner-selected 3 Nov 2026 |

## 9. Monthly cost

<div align="center">

<img src="docs/motion/budget.gif" width="860" alt="Animation: a £100 bar fills with data £30, AWS £22, Claude £15 and £3 for uncertainty, with a £30 reserve; warn, reduce and pause marks at £60, £75 and £85; three bars show the selected months: £46.48 with Claude off, £59.73 with Claude option A and the top-5 scan at its cap, and the Apple fee month of £141.52, the one allowed exception">

<sub>The ceiling, the plan and the selected months. <a href="docs/motion/budget.png">Still image</a>.</sub>

</div>

**The ceiling** is £100 a month all-in: dev and prod AWS, market data, Claude and evaluations. It is planned as £70 of
operation and £30 of reserve. Optional work gets a warning at £60, is reduced at £75 and paused at £85.
The owner's picks of 5 November 2026 (MP-184): OWN-36 "Cut in a set order": the option read "Code cuts backfills first, then challenger models, then Claude jobs, and says which step it reached." OWN-25 "Daily forecasts keep running": the option read "At £85 optional paid work stops and daily forecasts carry on. Cost paused shows only where a forecast needs that paid work." MP40-Q6 "Approve all three": the option read "Past 36 hours relevant optional work waits. Credit counts only with proof under 30 minutes old. The £15 above the £85 pause stays for sign-in, ledger reads, audit and recovery."
The owner, 5 November 2026 (MP-184), asked whether daily forecasts run inside the £15 kept above £85: "Yes, add them". The list of what the £15 covers now also holds daily forecasts.

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
  left for forecast and price uncertainty); a scan overrun stops at the Claude cap. Paid use at launch: OWN-04
  "Approve paid Claude at launch" (5 November 2026, MP-184), whose cost read "£54.73 an ordinary month, £59.73 with the
  top-5 scan at its £5 cap. That is inside the £70 plan, but only 27p under the £60 warning, and £64.89 at adverse
  rates." Picking it does not turn Claude on: paid calls still need the owner's explicit word when the time comes.
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
