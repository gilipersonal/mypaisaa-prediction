# Product, architecture and owner decisions

**Handover snapshot: 2 November 2026.** This chapter records requirements and their evidence. It grants no implementation, publication, account, model, spending or deployment authority. Read [roadmap and evidence](03-roadmap-evidence-and-open-work.md) next; external-system metadata is in [Jira, Confluence and assets](04-jira-confluence-and-assets.md).

## Product intent and current reality

MP is a private, standalone investment-intelligence app for one owner, with its own holdings, transactions, source documents and import history. It combines financial calculations, numerical ML and cited research to protect holdings, improve contributions/rebalancing, support long-term growth and identify benchmark-relative opportunities. It executes no trades, holds no brokerage execution credentials and gives agents no transaction authority. Accuracy is an ambition to measure against mature outcomes, never a promise.

Initial scope is 20–30 US/UK/India shares/ETFs from holdings and an owner-approved watchlist; later markets, instrument kinds and themes require extension evidence. The landing experience is market/discovery first, with holdings separately accessible and contextual chat. Suggestions are add/hold/pause/trim/rebalance, with reasons, uncertainty, disagreement and portfolio impact. GBP is the portfolio overview currency, with local-currency detail. Compare suitable holding benchmarks, a portfolio blend and a broad global equity benchmark; exact indices remain unresolved.

First-version imports include CSV, Excel, PDF/statements, screenshots and manual input/corrections through sample-backed layouts and generic templates, without promising every broker format. Incomplete history may remain visible while dependent calculations are withheld. Actual files will arrive progressively. Existing synthetic fixtures use real instrument identities, simulated observations and fictional accounts.

| Evidence state | What it means here |
| --- | --- |
| Runnable | FastAPI health and sample SSE routes; two backend test files; offline synthetic/document tooling; static concept/architecture presentation. |
| Owner-selected | DEC-001–041 product decisions, twelve ARC directions, two horizon details and twelve later policy selections. |
| Proposed | Detailed schemas, algorithms, acceptance cases, cost scenarios, runtime packaging, physical database design and unresolved policy values. |
| Unimplemented/unverified | Authentication, ledger/import backend, live providers, agents, numerical training/backtesting, product PWA/native apps and production infrastructure. No AWS deployment is recorded. |

The sample SSE bus has process-local queues/IDs, no authentication and no durable replay. A permitted `Last-Event-ID` header does not implement recovery. The React/Vite documentation site is not the SvelteKit product app. Optional packages in the lockfile prove dependency resolution, not functioning capabilities. See the [README](../../../README.md), [stack](../../tech-stack.md) and [starter source](../../../backend/app/main.py).

## Decision precedence and selected architecture

Use current owner instructions, then the [later policy journal](../../planning/foundation-policy-discussion-2026-11-02.md), [selected ARC directions](../../planning/ma-reconciliation-2026-11-02/direction-summary.md), detailed drafts and finally historical references. The [older knowledge base](../../knowledge-base.md) preserves intent but contains superseded Agent SDK, PostgreSQL, single-host and £50 AWS-only assumptions. A merged planning document is not architecture approval.

| Direction | Owner selection | Proof/detail still required |
| --- | --- | --- |
| ARC-01 | Yahoo Finance + Twelve Data Grow; consider Basic for dev | Exact plan, listing coverage, cadence, storage/training/display/export/Anthropic rights and invoice terms. |
| ARC-02 | DynamoDB operational records + encrypted private S3; one controlled financial writer | Atomic visibility, bounded transactions, access patterns, indexes, recovery/deletion and cost. |
| ARC-03 | Python Lambda Durable Functions as primary workflow orchestrator | Replay, external-call ambiguity, cancellation, packaging and runtime/cost proof. Step Functions is not selected initially. |
| ARC-04 | Selective capped SageMaker CPU training/evaluation + portable Lambda inference | Artefact compatibility, job resources, quotas, inference measurement and whole-system cost. No always-on endpoint by default. |
| ARC-05 | Baselines first, then bounded challengers | Task-specific scientific qualification, calibration, mature outcomes and promotion evidence. |
| ARC-06 | Separate Lambda worker per Claude task route, sharing bounded runner code | Exact role/model/tool/IAM/context/memory/cache/batch contracts and budgets. |
| ARC-07 | Cognito assurance/freshness checks for sensitive actions | Verified fresh-sign-in fallback, linking/recovery/session/tier/device evidence. |
| ARC-08 | Specify all admin journeys now; design them before first build | Protected actions, audit claims, retention/deletion, recovery objectives and complete UX. |
| ARC-09 | Inspect AI + MP deterministic checks | Scenarios, adapters, privacy, judge calibration, live-eval triggers and budgets. |
| ARC-10 | Static SvelteKit PWA on S3/CloudFront + authenticated FastAPI | Session, offline/cache, bounded SSE, push, accessibility and platform compatibility. |
| ARC-11 | Separate dev/prod workload accounts under consolidated billing | Account/role/region/network/IaC evidence; one aggregate £100 envelope. |
| ARC-12 | Central architecture-area specifications linked to phases/stories | Complete cross-contract baseline and actual implementation-story acceptance before UX. |

FastAPI runs on **ordinary API Lambdas** behind API Gateway through a verified adapter. Separate Durable workflow handlers coordinate multi-step work, checkpoints, waits and approvals. SQS buffers work; Scheduler starts timed work; durable stores hold business truth. Long requests return admitted job references; SSE disconnection must not cancel work or repeat financial/model calls. The saved [API/workflow boundary](../../planning/ma-reconciliation-2026-11-02/api-workflow-boundary.md) distinguishes FastAPI's async machinery from the synchronous Python durable SDK. A later SageMaker-specific Step Functions hybrid needs its own decision.

Claude runs on **Anthropic**, called through the official **Anthropic client SDK** and a server-controlled bounded tool loop. The old optional `claude-agent-sdk` lock entry is historical. Bedrock, AgentCore and an Agent SDK runtime are not selected. Four research routes and Haiku/Sonnet classes appear in earlier proposals; exact route counts, model IDs and limits remain unqualified. Separate route workers are selected; a particular model catalogue is not.

## Financial, data and model boundaries

The [financial specification](../../planning/foundation-specifications-2026-11-02/financial/specification.md) proposes immutable originals, quarantine, extraction drafts, exact owner approval and one controlled writer. Approval binds owner/environment, content, selected/excluded groups, policies and expected ledger revision. S3 and DynamoDB do not share one transaction. Large-import staging, complete manifests, fencing, durable idempotency and a final publication transaction must prevent partial visibility. Immutable event intents and mutable delivery attempts are separate; an outbox is not an exactly-once guarantee.

Amounts use explicit decimal/unit contracts. GBX becomes GBP exactly once; FX is GBP per local currency. Broker facts, analytical cost basis, historical XIRR, TWR, drawdown and forecast probabilities are distinct. XIRR uses the measured boundary's external flows and terminal value; missing history or ambiguous roots cannot become a confident rate. Withdrawals must not appear as drawdown. Dividend cash must not be added again to total-return series. Precision, solver limits, benchmark mappings and risk-estimation defaults remain proposals.

The [data specification](../../planning/foundation-specifications-2026-11-02/data/specification.md) separates security/share-class/listing/provider aliases and economic, publication, ingestion and known times. Downloaded historical bars are not automatically point-in-time historical evidence. Rights are per listing, endpoint, environment and use; a response or software licence is not a data-use grant. All live grants remain unverified. Quotes, final closes, fund NAV, corporate actions and FX have separate schedules/eligibility. Weighted quotas and reservations span shared accounts; batching does not erase per-symbol charges.

The [forecasting specification](../../planning/foundation-specifications-2026-11-02/forecasting/forecasting-specification.md) keeps F1 data lineage, F2 the walk-forward lab, F3 regime/risk, F4 analog/events, F5 numerical forecasting, F6 proof/explanation, F7 contribution simulations and F8 patterns as modular responsibilities. These are not eight endpoints or eight trained models. Its R0 baselines, R1 regularised CPU family and R2 bounded boosted challengers refine earlier F3/F5 sketches. Artefacts vary by task/horizon/currency/features/calibration; avoid assuming one model per ticker.

Chronological folds, purging/embargo, training-fold-only transformations/calibration, frozen manifests, declared benchmarks and full trial accounting are mandatory. Return distributions, direction, benchmark excess and path-risk probabilities are separately qualified. LLM factors need their own ablation evidence; fluent explanations do not demonstrate predictive value. Predictions/outcomes/corrections remain append-only. Twelve-month accuracy requires mature twelve-month outcomes, regardless of shorter shadow operational success. Promotion follows offline evidence, shadow and owner approval; never self-promotion.

Agents require scoped allowlists, untrusted-source handling, time/token/tool/cost bounds and numerical grounding. They cannot alter the ledger, publish forecasts, change live models, access secret values, increase budgets or trade. Runtime guardrails, ordinary software tests, Inspect answer-quality evaluations and numerical predictive evaluation are four different evidence tracks. Identity requires verified account linking and independent recovery paths, not email matching alone. Admin capabilities include investigation, cost/admission, approvals, jobs/replay, sources, model promotion and recovery from the foundations.

## Horizon details and twelve later policies

[FND-DEC-001/002](../../planning/foundation-specifications-2026-11-02/owner-decisions.json) fix next day plus **5/10/20 trading days**, and **3/6/12 calendar months**. Month anniversaries roll back to the preceding valid local session/valuation date; scoring waits for the canonical target value. Three/five-year scenarios remain separate. Invalid-day conventions and other unselected timing details remain proposed.

The following receipts override stale “pending” wording only for their stated parts. They await coordinated integration; none approves a whole FIN-OD/SCI-D group.

| Policy | Selected boundary |
| --- | --- |
| 001 | Exact import/correction approval lasts 15 minutes for trusted-writer submission; completion may follow expiry. Changed content needs approval again. |
| 002 | Ordinary close collection +15 minutes, retry +40, frozen cutoff +60, issuance by +75 and before next open, subject to source/runtime verification; otherwise abstain. |
| 003 | Automatically pause only the affected forecasting scope on advance-approved triggers, notify, and require owner approval to restart. |
| 004 | Downside/central/upside plus editable assumptions for three/five-year scenarios. Values need approval; “central” implies no likelihood. |
| 005 | Explicitly approved complete transaction groups may commit; dependent entries stay together, unresolved entries stay pending, and exclusions create a fresh proposal/hash. |
| 006 | Combined score needs all three eligible components: growth 35%, protection 40%, opportunity 25%. No missing-as-zero or silent reweighting. |
| 007 | Holdings exposure follows recorded trade date; settlement/cash obligations remain separate. Missing settlement is not guessed. |
| 008 | At most two shared campaigns/month; each at most 96 training/calibration fits and six CPU training-instance hours. Across dev/prod: 192 fits/12 instance-hours; admission may allow less. |
| 009 | Labelled analytical FIFO only with adequate history and no usable broker basis. Preserve broker figures and keep tax basis separate. |
| 010 | Core financial, approval, business-audit, promotion and forecast/outcome evidence lasts for account lifetime, subject to deletion and source permissions. |
| 011 | Private export authorization allows starting a download for one hour. Renewal needs authentication; stored-export retention and financial approval remain separate. |
| 012 | Later historical uploads can produce versioned rebuild proposals. Exact approval and cutover precede activation; no snapshot/history double counting or rewriting earlier forecasts. |

Original files retain a separate renewable 24-month policy. Operational logs/traces/run summaries retain 14/30/90 days; those TTLs cannot delete required lifetime business evidence. Deletion propagation, backup expiry, restore-erasure and integrity anchors remain unproven. Monthly focused recovery/audit exercises are selected, but RPO/RTO are not. The 07:30 Europe/London briefing and 22:00–07:00 quiet hours are selected; critical exceptions need approval. Thirty-minute eligible quote/risk monitoring is separate from daily formal forecasts. Balanced portfolio 10%/20% and holding 15%/25% alert profiles are selected initial settings; calculation windows/semantics still need agreement.

## Budget is a blocking feasibility question

The ceiling is **£100/month all-in**, across dev/prod AWS, data and Claude/evals, with **£70 operation + £30 reserve**. Forecast cash thresholds are £60 warning, £75 optional-work reduction and £85 optional-job pause. Billing collection is AWS daily and Anthropic every six hours; live estimates, reported gross usage, credits and cash remain distinct.

The [saved cost model](../../planning/foundation-specifications-2026-11-02/costs/specification.md), using assumed £0.80/USD and 20% tax, gives Virginia plus displayed Grow $79 with Claude blocked: **£95.68 amortised run rate, £94.48 ordinary-month cash, £108.88 annual-domain invoice-month cash**. The last breaches £100; all exceed £70. Conditional Grow $29/55-credit pricing yields £47.68/£46.48/£60.88 respectively, but price, rights and coverage are unverified. No region, subscription, domain or bill is selected by these scenarios.

The reported shared $200 Anthropic benefit is unverified; admissible credit is zero. No automatic cash-paid fallback is authorised. A delayed usage report does not prove available, enforceably allocated credit. Full-function cash-funded scenarios are counterfactuals. No free tiers are deducted, and quotas/credits must not be multiplied across environments. The £100 fit remains unproven.
