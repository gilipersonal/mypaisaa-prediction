# Mypaisaa Prediction: AWS architecture plans

[Current working PRD](product-requirements.md) and [confirmed decision register](product-decisions.json) hold the latest questionnaire answers; earlier open questions below are proposals until reconciled with that baseline.
[Requirements decision pack: all 18 initial choices answered](requirements-decision-pack.html). The initial choices are confirmed; detailed defaults, evidence and end-to-end requirements/UX approval remain open.
**Draft for Arun's decision · 1 November 2026 · MP-15 · Revised for the Lambda client-SDK, direct Anthropic credit and Yahoo/Grow decisions · Architecture brainstorming only**

**Scope expanded:** this is a standalone investment app with its own holdings/imports, rules, XIRR, LLM-assisted research and ML forecasts. The full inherited stock-forecasting scope and configurable market/theme/model extensions are recorded in the [scope and plug-in plan](forecasting-scope.html), with a [searchable 140-story acceptance register](forecasting-source-register.html). Mypaisa-agent retains its tracking, rules-based analysis and XIRR.

The strongest starting point is **Plan B: a serverless application with selective SageMaker training**, provided the chosen market-data contract covers the required UK, US and Indian listings within the data allowance. Use Lambda for APIs, scheduled ingestion and inference; use SageMaker for bounded training jobs and model registration; use a bounded Anthropic client-SDK tool loop on Lambda for research, calling Claude on Anthropic’s own platform. This gives the prediction engine a reproducible training and approval process without paying for a continuously running ML endpoint.

Plan A makes the same predictions with less managed ML machinery. The earlier AgentCore Plan C is retired after your correction; both active plans now share the Lambda/client-SDK research design. None inherently produces more accurate forecasts: the data, target definition and validation determine that. These are alternatives for review, not approved architecture or an instruction to implement.

[Editable Lucidchart comparison: A/B active, C retired](https://lucid.app/lucidchart/02218133-613a-4b78-aea4-e0dba26db386/edit) · [Browser reading version](review.html) · [Cost assumptions and calculations](cost-model.json) · [Reference page inventory](reference-pages.json)

## 1. Decisions captured from this discussion

| Topic | Agreed requirement |
| --- | --- |
| Purpose | Standalone personal investment intelligence: own holdings/imports, rules, XIRR, LLM-derived evidence and ML predictions; no trading execution |
| Scope ownership | Advanced Forecaster/ML work from mypaisa-agent is planned here; MA keeps its wealth tracking, rules-based analysis and XIRR. No required shared ledger or live integration. |
| Extensibility | US/UK/India initially; future mainland China, Taiwan, Hong Kong and continental Europe; solar/clean-energy and other themes; versioned market/data/feature/model/horizon/agent contracts |
| Budget | **£100/month total**, including AWS dev + prod, market data, Claude usage and evaluation. The estimates also reserve money for Apple membership and a domain. This replaces the earlier £50 AWS-only assumption for this proposal. |
| First workload | **20–30 stocks/ETFs**, daily formal forecasts and **30-minute quote/risk monitoring where supported**, with alerts; expand only after measuring quality and cost |
| Geography | **UK, US and India from the start**; exact listings and exchanges still need selection |
| Forecast horizons | Next trading day and next **5–20 trading days**, plus confirmed **3, 6 and 12 months** and **3–5-year scenarios**; daily formal forecasts and 30-minute quote/risk monitoring where supported |
| First screen | **Market/discovery dashboard**; holdings in a separate section, contextual chat accessible |
| Priority cost visibility | **Claude API and AWS costs per environment on the main app dashboard**, with agent/model/feature detail, budgets, alerts and estimate/reported/credit/cash distinctions |
| Evidence and operations | Encrypted private S3 originals, configurable retention and owner deletion; upload/update auditing, whole-system and agent observability; detailed admin portal to be designed later |
| Broader universe | Daily overview; this document assumes up to 100 instruments for costing, pending your exact list |
| Web | Adaptive, responsive **SvelteKit 3 PWA** for phones, tablets and desktops |
| Chat | A first-class conversational interface on web and native Apple clients for discussing holdings, recommendations, forecasts, risks and their evidence; shared conversation state across devices |
| Agent assurance | Market-Agent-style deterministic guardrails, T0/T1/T2 evaluations, online monitoring and human-calibrated judges; budget includes all evaluation usage |
| Apple | Native **Swift/SwiftUI inside a React Native shell**; iPhone, iPadOS and the adaptive/foldable experience described as “Duo” |
| Backend | Python FastAPI; official Anthropic Python **client SDK** with an explicit bounded tool loop on Lambda for specialist research agents |
| Claude hosting and credit | Claude models run on **Anthropic’s platform**, called directly through its API. **$200 promotional credit each month**, as stated by Arun; account eligibility, renewal and remaining balance have not been independently verified. |
| Financial data | **Yahoo Finance + Twelve Data Grow**; per-instrument source selection, provenance and freshness checks |
| Cloud preference | AWS; Lambda, S3 and DynamoDB preferred; CloudFront, Route 53 and API Gateway |
| Region | Cheapest suitable region; propose **us-east-1**, with cost and availability evidence below |
| Learning | Automated data collection, training and testing; **your approval before a replacement model goes live** |
| Authentication | **AWS Cognito with Apple/Google sign-in and passkeys**; recovery/linking and sensitive-action controls to specify; VPN optional |
| Workflow | Complete and agree requirements, documentation, stories, plans and UX before implementation; designs authored locally, then synced to ChatGPT Sites when authorised |

**Forecast frequency is not forecast horizon.** Proposed v1: publish the formal next-day/5-day/20-day forecasts after each instrument's daily data is complete; refresh quotes and deterministic risk alerts every 30 minutes while its market is open. If you want the probability forecasts themselves recomputed every 30 minutes, that is an additional requirement: the model must be trained and validated using equivalent intraday information, not daily-close features applied mid-session. Every new forecast gets its own immutable timestamp and outcome record.

“Duo” is treated as an adaptive window/foldable layout requirement, consistent with the reference project's design explanation. Exact device, OS floor and supported simulator matrix remain to be confirmed; the plan does not depend on an assumed Apple hardware specification. Answered 5 November 2026 (MP-184): MP40-Q12b "Any window width" and MP40-Q12a "Your own devices only"; the current record is [TECH-STACK.md](../../../TECH-STACK.md).

## 2. What to carry over from mypaisa-agent

Twenty-one relevant Confluence pages were consulted across system context, data, clients, identity, streaming, agents, learning, environments, operations, security and testing. Page IDs and versions are recorded in `reference-pages.json`. They describe the reference project's decisions and proposed workflows; they do not prove those capabilities have been implemented or tested.

| Reference pattern | Use in Mypaisaa Prediction | Adaptation needed |
| --- | --- | --- |
| S3/CloudFront static PWA; SwiftUI with RN shell | Keep the two-client pattern and shared API contracts | Design a prediction-focused UX; do not inherit its chat-first screen selection or brand |
| Separate dev/prod resources and identities | Separate tables, buckets, queues, schedules, Cognito pools, roles and model pointers | Dev uses synthetic/replay data, with live schedules off by default |
| DynamoDB plus S3 Parquet/DuckDB | DynamoDB for operational state; S3 for historical datasets, models and large evidence | Define prediction-specific access patterns; avoid storing the whole price history as query-scanned DynamoDB items |
| Queue-backed work, idempotency and dead-letter queues | Durable ingestion/research jobs with bounded retries | A queue improves recovery; it does not guarantee losslessness or exactly-once side effects |
| Immutable image promotion and read-only production smoke tests | Build once; promote the tested digest; version web and ML artefacts | Rollback must cover contracts and model schemas, not just Lambda aliases |
| Layered offline, UI and live-model testing | Adapt the test pyramid and change-based selection | Add time-series leakage, calibration and outcome-maturity tests |
| Activity records and trace correlation | Run ID, dataset/model version, token cost, source references and errors | Keep financial content in access-controlled evidence storage, not general telemetry |
| Controlled learning and owner approvals | Candidate versions, shadow evaluation, explicit promotion and fallback | Do not inherit automatic recalibration: any live calibration change is a model change requiring approval |
| Optional VPC lockdown | Compare its security benefit with fixed charges and operational work | Do not copy its AWS account, domains, secret paths, free-tier assumptions or exact prices |

The agent runtime now follows the [reference stack decision](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/2622286): a thin, explicit **Anthropic client-SDK loop on AWS Lambda**. Claude models run on **Anthropic’s platform**, outside the AWS application boundary. Lambda sends Messages API requests, validates returned tool requests, executes only allowlisted application tools and sends structured tool results back. This replaces the prior Claude Agent SDK subprocess/Fargate/AgentCore proposal. [Anthropic tool-use contract](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)

Important reference qualifications: its “under five seconds” rollback is not an end-to-end recovery guarantee; cached assets, in-flight jobs and data compatibility also matter. Its short shadow period is not enough by itself to validate 20-day forecasts, whose labels overlap. Free tool licences do not imply zero runner, storage or evaluation cost. This revised budget uses Arun’s stated $200/month Anthropic promotional credit as an account-specific assumption; it is not a claim that all Claude subscriptions include API credits.

## 3. Shared AWS architecture

The same core is used in both active plans. The active options differ in training execution and model registration. Both use the same Lambda/client-SDK research runtime and direct Anthropic API.

| Layer | Proposed component and responsibility | Cost and design choice |
| --- | --- | --- |
| DNS/TLS | Route 53 and ACM | Separate dev/prod names; no borrowed domain or certificate. CloudFront certificate location and regional API certificate are handled explicitly. |
| Web delivery | Private S3 bucket, CloudFront origin access control; SvelteKit 3 `adapter-static` | Static authenticated app shell; FastAPI supplies data. No always-running SSR service. Public marketing pages can be prerendered. [SvelteKit adapters](https://svelte.dev/docs/kit/adapters) |
| Edge protection | CloudFront headers, throttling; evaluate its current Free flat-rate plan and included WAF features | Verify eligibility and required behaviours; do not assume every WAF, logging or origin-isolation feature is included. PAYG fallback must fit the reserve. [CloudFront plans](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html) |
| Identity | Cognito user pool per environment; invite-only owner; MFA/passkey-capable flow selected in the identity design | Prefer standard OAuth/OIDC flows over copying custom authentication Lambdas. Separate IAM Identity Center/MFA for operator access. |
| Routing/API | Regional **API Gateway REST API**; FastAPI on Lambda | Chosen because SSE is retained. REST APIs support streaming; HTTP APIs are cheaper but do not provide that response-streaming mode. [AWS streaming constraints](https://docs.aws.amazon.com/apigateway/latest/developerguide/response-transfer-mode.html) |
| API packaging | Buffered FastAPI routes via an ASGI/Lambda adapter; separate Uvicorn + Lambda Web Adapter stream function | Separate memory/concurrency limits. Pin supported versions only after a compatibility spike. |
| Schedules | EventBridge Scheduler; exchange-calendar guard in code | Run only for open markets; holiday, daylight-saving and half-day handling. No continuously running polling server. |
| Jobs | SQS plus DLQ; Step Functions Standard for multi-stage training/research orchestration | Messages carry IDs and references. Claim jobs with idempotency keys; bounded retry/backoff; no huge documents in workflow state. |
| Operational storage | DynamoDB on-demand | Portfolio ledger, latest views, predictions/outcomes, job status, approval and budget records. Conditional writes and transactions protect invariants. |
| Analytical storage | S3 raw records, canonical Parquet, feature snapshots, model/evaluation artefacts | DuckDB/Polars or pandas in bounded compute. Object versions plus manifests; no baseline Glue cluster, RDS or OpenSearch. |
| Quant serving | Lambda CPU inference, output persisted in DynamoDB | Load a small approved model artefact from S3, cache it in a warm execution environment by version; UI reads saved results. |
| Notifications | Durable alert outbox; SNS/APNs for native push; web push adapter | Notification contains a reference and neutral text; authenticated app retrieves sensitive detail. PWA background delivery differs by OS/browser. |
| Operations | CloudWatch logs/metrics/alarms, selected OTel traces, CloudTrail baseline, AWS Budgets | Short log retention, bounded high-cardinality fields, no prompts or holdings in telemetry. Data-event logging is separately costed. |
| Delivery | GitHub PRs/OIDC with AWS CodeBuild/ECR and IaC; local Mac Apple builds | AWS hosts production/build containers; Apple signing and simulator work still require Apple tooling. |

**Cloud boundary:** application hosting, data, orchestration, authentication and quantitative ML inference use AWS services. **Claude inference runs on Anthropic’s platform through its direct API**. Svelte, Python and the Anthropic client SDK remain open-source application technologies. GitHub remains the existing source/PR system and Apple remains the native distribution provider. Replacing these merely to claim an entirely AWS-branded stack would add cost or lose required capabilities.

### Data contracts and storage boundaries

Use a small number of tables by lifecycle and access pattern, rather than forcing every entity into one “clever” single table: portfolio/events; prediction/model metadata; jobs/live state. Final partition/sort keys come from documented queries. Time-bucket large histories and never rely on scans for user-facing access.

Each market observation records `instrument_id`, venue, currency and unit (including GBX versus GBP), provider, exchange/event time, provider publication time where available, ingestion time, delay classification, quality flags and corporate-action version. ISIN alone is insufficient to identify a listing. ETF share class, distribution/accumulation policy, currency, primary listing and dual listings must be explicit.

Each forecast records as-of time, feature cutoff, target/horizon, predicted distribution/probability, model and calibration version, dataset manifest, code/image digest and evidence links. A correction appends a new version. Each outcome records the exact mature target, scoring method, price source and any subsequent correction. Portfolio money uses decimal/minor-unit rules, never binary floating-point arithmetic for balances.

DynamoDB enforces transactional consistency for portfolio changes, their audit events and outbox records. S3 and DynamoDB are not one transaction: an artefact is uploaded, hashed and validated before a conditional manifest/pointer commit makes it visible; abandoned uploads are reconciled later. S3 Object Lock is a later retention decision, not an automatic irreversible setting. DynamoDB PITR and versioned S3 need tested restores; retention/versioning alone is not a complete backup strategy.

### SSE without paying for idle connections all day

Use SSE while a user is actively viewing research progress or a live screen. One leader tab shares events with other browser tabs; pause streams when backgrounded, reconnect with a cursor and re-fetch durable records after gaps. A 14-minute reconnect cycle fits the documented 15-minute streaming ceiling; heartbeats and appropriate CloudFront timeouts prevent idle disconnects. Authentication must be revalidated, not checked once for an indefinite session.

Do not copy the reference's 200 ms DynamoDB polling for this workload. Market state changes every 30 minutes; use a slow idle check or fetch on focus, and temporarily accelerate/coalesce status events during a research session. Persist semantic events, not every token, and measure request/read amplification. At the verified ARM rate, a 512 MiB Lambda held open for 120 aggregate client-hours costs about **$2.88 compute**, before API/data/read charges and without free-tier credits. That is affordable only while open hours and connection count remain bounded.

## 4. Plan A: lean AWS jobs

**Best when:** the first priority is the simplest inexpensive scientific baseline, and you are comfortable owning the training orchestration and model metadata in application code.

1. EventBridge schedules per-market refresh work. Lambda fetches and validates provider snapshots, writes versioned raw/canonical records, then updates the latest quote view. Daily bars trigger daily forecast jobs once complete.
2. Lambda runs small CPU models and deterministic intraday risk checks. It persists results before issuing events or notifications. It returns the last valid forecast with a staleness reason if inputs fail; a research agent cannot fill in missing probabilities.
3. Step Functions launches a **Fargate training task** on a weekly/monthly candidate schedule or a controlled drift request. Start with 4 vCPU/16 GiB for the experiment budget, then right-size. The task exits when finished; its data manifests, metrics and model artefact live in S3.
4. DynamoDB holds model status: candidate, validated, shadow, awaiting approval, approved, retired. You approve the exact artefact hash, feature schema, code version and evidence bundle. A separate publisher role updates the production model pointer conditionally.
5. A research request returns a job ID immediately. SQS invokes a **Lambda research worker using the official `anthropic` Python client SDK**. It restores the run state, calls Anthropic’s Messages API, validates structured tool requests, executes only permitted tools and persists progress/results. Bound each invocation well below Lambda’s 15-minute maximum; checkpoint and continue through the queue when necessary. Waiting for owner input or a batch job ends the invocation rather than keeping Lambda alive. Acknowledge the queue item only after the result or continuation is durably recorded.
6. Only the **ML training tasks** need Fargate in Plan A; research agents run on Lambda outside a custom VPC by default, reaching Anthropic over outbound HTTPS. Fargate training tasks run in a minimal VPC. The economical baseline uses public-subnet egress with a temporary public IP, **no inbound rules and no listening application endpoint**. This avoids an always-on NAT Gateway but is not an outbound allowlist or a fully private network perimeter. IAM, tool restrictions and data minimisation remain necessary. A stricter egress design is a separate cost/security choice.

**Advantages:** small managed-service footprint; portable training containers; no persistent training server; straightforward reuse of Python locally; every optional job can stop. A measured 8 hours/month at 4 vCPU/16 GiB is about **$1.49 Fargate compute** at US-East ARM rates, before storage, logs and networking.

**Disadvantages:** you build the experiment manifest, comparison UI, registry lifecycle and training recovery; the client-SDK loop needs explicit checkpoint, retry and tool-result handling; Lambda duration and repeated-context costs must be bounded; roles differ between training, research and publication.

**Proposed delivery slices, after requirements/design approval:** deterministic data/ledger/API spine; reproducible baseline evaluator; Fargate training with artefact contracts; approval/promotion and shadow track record; bounded specialist research; resilience and measured cost exercises. A failed candidate never blocks the current approved model.

**Cash budget envelope while eligible Claude usage is covered by the stated credit:** **£60/month**, leaving **£40 reserve**, under the explicit assumptions in section 9. This is an allowance-based planning envelope, not a quoted bill.

## 5. Plan B: selective SageMaker for the ML lifecycle

**Best when:** reproducible ML experiments, explicit model versions and auditable approvals are central to the product. **Recommended for your stated goal.**

Keep Plan A's application, storage, notifications, identity and Lambda/client-SDK research workers calling Anthropic directly. Replace its home-built training execution and primary model registry with:

1. A versioned training dataset and feature manifest in S3. An orchestrator starts a **SageMaker Training job** using a pinned CPU container. Start with simple scikit-learn/gradient-boosted models, not GPU training or Claude fine-tuning.
2. Run the chronological folds and calibration inside that job initially, reusing the same evaluation library as local tests. This avoids paying for a separate cluster or processing job at every small step. Persist per-fold predictions, metrics and rejected experiments as well as winners.
3. Register candidates in **SageMaker Model Registry**, with metrics, provenance and approval status. DynamoDB provides the application's read model and the production pointer; it is not a competing second approval authority. Approval originates from the authenticated owner and the publisher reconciles registry state with the pointer. [Registry capabilities](https://docs.aws.amazon.com/sagemaker/latest/dg/model-registry.html)
4. Keep **inference in Lambda** over the approved S3 artefact. Model registration does not require running a permanent inference endpoint. Test format, runtime and feature-schema compatibility before promotion; an x86 training artefact must be proven portable to ARM inference.
5. Use On-Demand CPU jobs first for predictable timing and cost measurement. Consider Managed Spot only once checkpoints and retry behaviour are proven; Spot savings vary and unavailable capacity may delay or stop the run. Keep using the current model during that delay. [Managed Spot training](https://docs.aws.amazon.com/sagemaker/latest/dg/model-managed-spot-training.html)

**Advantages:** managed job lifecycle, standard model registration and approval metadata, reproducible artefacts and a clean route to larger training later. At the verified **$0.23/hour** for `ml.m5.xlarge` training in N. Virginia, **20 instance-hours/month cost $4.60 compute**. Full-grid experimentation across every asset, horizon and parameter could cost far more; constrain the experiment matrix.

**Disadvantages:** more AWS IAM/resource configuration; managed training container constraints; job startup latency; separate compatibility testing for serving; a service catalogue makes it easy to enable unnecessary add-ons. SageMaker does not supply the financial targets, correct splits or a predictive advantage.

**Use now:** bounded Training jobs, S3 artefacts, Model Registry and CloudWatch job logs. **Consider later:** SageMaker Pipelines if the training DAG becomes complex, Batch Transform for large offline scoring, Spot and limited tuning. **Do not include in the base plan:** always-on endpoints, persistent Studio notebooks, managed MLflow server, online Feature Store, scheduled Model Monitor fleets or GPU hyperparameter sweeps.

The Studio warning is concrete: the queried `ml.m5.large` JupyterLab rate is $0.115/hour, so leaving it on for 730 hours is **$83.95/month before storage/tax**. Training is inexpensive here because it stops. SageMaker Serverless Inference can scale down, but its feature exclusions include VPC configuration, Model Monitor, data capture and GPUs; it also adds a serving surface we do not need for this small workload. [Serverless exclusions](https://docs.aws.amazon.com/sagemaker/latest/dg/serverless-endpoints.html)

**Proposed delivery slices:** complete the common baseline and reproducibility contracts; prove one bounded SageMaker train/evaluate/register run; compare its output with local execution; implement owner approval and compatible Lambda artefact promotion; then add drift-triggered candidate training. No automatic production promotion.

**Cash budget envelope while eligible Claude usage is covered by the stated credit:** **£65/month**, leaving **£35 reserve**. The higher ML allowance covers repeated validation and job overhead; it is not an inherent SageMaker subscription fee.

## 6. Holdings-aware chat, agent guardrails and evaluations

**Chat is a core product surface in both plans.** You can start a general conversation or select **Ask about this** on a holding, recommendation, forecast, alert or long-term thesis. The conversation carries the instrument/portfolio view, forecast ID, version, horizon and as-of time, so “why did you say this?” refers to the exact result you saw, not a different forecast fetched later. A new version is disclosed explicitly. Web and SwiftUI share the conversation/API contract and durable state; compact screens use a chat view or sheet, wide layouts can show discussion beside the evidence. Final layouts remain part of the local UX design stage.

Example questions to support: “Why is this ETF flagged?”, “How much do these two funds overlap?”, “What changed since last week?”, “Does this affect my five-year thesis?”, “How reliable have these forecasts been?”, and “Which facts support this recommendation?” The answer distinguishes observed holdings facts, quantitative forecasts, source-backed interpretation and assumption-based scenarios. It shows data freshness and uncertainty, and can say that evidence or an intraday feed is unavailable.

### Conversation and specialist flow

1. **Authenticated request:** Cognito identity reaches FastAPI; the server derives the owner/environment scope. The client sends a conversation ID, message idempotency key and optional context references, never an authoritative owner ID or arbitrary S3 path.
2. **Durable acceptance:** persist the user turn and run ID, then an outbox/queue record. Return a job reference promptly. Serialize turns per conversation; a reply from a cancelled or superseded run cannot replace a newer answer.
3. **Coordinator on Lambda:** restore bounded conversation context, retrieve current authorised holdings and the referenced forecast/evidence, and run the Anthropic client-SDK loop. A routing manifest chooses a portfolio analyst, forecast explainer, source researcher or long-term thesis analyst. Specialists receive only needed facts, tools and budgets. Independent read-only tasks may run concurrently within a configurable small cap; recursion/fan-out cannot grow unchecked.
4. **Typed tools:** examples are `read_holdings`, `read_forecast`, `read_track_record`, `compare_exposures`, `read_sources` and `run_scenario` with explicit assumptions. These tools return structured values with units, timestamps and source IDs. Research cannot change ledger entries, forecast probabilities, live models or infrastructure. A future write capability would require a separate draft/confirmation contract; it is not implied by adding chat.
5. **Grounded answer:** validate numerical claims against tool output; render financial figures from typed fields where practical. Check source references and horizon/version labels. Do not expose unchecked numerical token deltas and try to retract them afterward: stream safe progress events, then validated answer sections/cards. A citation-format check cannot prove a source supports a claim, so support/entailment also needs evaluation and abstention.
6. **Persistence and delivery:** save the answer, evidence links, agent/model/prompt/tool versions, checks and usage, then deliver over SSE. Reconnect/resync and cross-device history retrieve this durable result. Cancel, timeout, missing data, refusal, clarification and budget-exhausted are explicit states, not a perpetual spinner.

Session summaries and preferences never replace holdings or prediction records. Store transcripts in private AWS storage with retention/deletion controls; redact general logs. Selected context is sent to Anthropic for inference and, when enabled, judging, so this is not an “all data stays inside AWS” claim. Prefer instrument-only context for external web search; quantities, account identifiers and private documents are excluded unless essential and expressly permitted by the tool policy.

### Guardrails enforced outside the model

Adapt the [Market Agent explanation](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1769493) and [guardrails/evaluation design](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1540178), with prediction-specific tests:

| Boundary | Enforcement and failure behaviour |
| --- | --- |
| Identity and data access | Check owner/environment scope in every tool/repository access, including cached results, session resume and SSE. Refuse cross-user, cross-environment and arbitrary-key access. |
| Least agency | No trade/order tools, credential readers, arbitrary shell/SQL, model-promotion or deployment tools in chat. IAM and repository methods enforce the same boundary. |
| Tool policy | Manifest allowlist, schema/range validation, side-effect classification, idempotency, maximum turns/tool calls/concurrency and time/token limits. Policy errors fail closed. |
| Untrusted sources | Treat news, web pages, filings, uploads and retrieved text as data. Isolate extraction from outbound/write authority; taint survives summaries. A source cannot grant permissions or change prompts. |
| Financial grounding | Use typed tool results for quantities, prices, currency/GBX conversion, exposure, forecasts and performance. Test rounding/tolerance and refuse unsupported numbers rather than inventing precision. |
| Evidence and recommendations | Cite retrieved sources; bind explanations to forecast/model version; distinguish scenario from measured forecast; no guaranteed returns or unsupported claims of accuracy. |
| Privacy and output | Redacted telemetry, scoped transcript storage, safe structured rendering and vetted links; no remote image/URL generated by an untrusted answer that could exfiltrate holdings. |
| External/server tools | Local pre-tool hooks cannot intercept provider-executed server tools within an API call. Enable them only on restricted context, with supported usage caps and a separate policy; do not assume they inherit client-tool checks. |
| Spending and recovery | Reserve gross cost and available credit before execution, checkpoint continuations, handle throttling/timeouts, and stop when permission/budget is missing. A prompt cannot override a cap. |

### Evaluation programme and release gates

Use **Inspect AI** as the proposed evaluation harness, paired with deterministic pytest/property checks and real client-loop replay. It supports tasks, datasets and scorers; adopting it does not make a model judge authoritative. [Inspect documentation](https://inspect.aisi.org.uk/)

| Tier | Trigger and scope | Gate and cost treatment |
| --- | --- | --- |
| **T0: offline** | Every relevant PR: recorded multi-turn conversations, actual policy/runner code, typed-tool fixtures and coverage manifest | No paid model calls. All critical safety/regression assertions pass; runner/CI storage and compute remain in AWS/CI allowances. |
| **T1: affected live cases** | Prompt, tool, guard, routing, client SDK or loop change; affected capabilities plus critical safety and incident regressions; initially 3 trials/case | Separate eval workspace/usage meter; proposed **$10/run and $30/month** gross cap shared with T2. Stopped, missing or failed cases mean incomplete, never green. |
| **T2: model/judge promotion** | New model/judge ID or material provider behaviour change; full relevant suite, initially 5 trials/case | Same combined monthly eval cap, not an additional $30. A larger run is estimated and approved first. Pinned model IDs reduce uncontrolled changes but do not prove determinism. |
| **Online deterministic checks** | Every live chat/research run | Scope, tool-policy, numerical/evidence checks, staleness, latency and usage. Record failures and safe fallbacks; there is still normal compute/storage cost. |
| **Online semantic judging** | New flagged runs plus an initial random 10% sample, subject to a separate bounded queue | Batch nonurgent, redacted/scoped evaluations. Proposed **$5/month gross cap**. Excess flagged volume becomes a visible backlog/incident, not silently unreviewed success. |
| **Human calibration** | Monthly, after judge/rubric/model changes, and when disagreement increases | Review stratified good/bad/ambiguous examples, track judge errors and disagreement. Judges remain advisory until agreed held-out sensitivity/specificity criteria are met. |

Three suites: **safety** (every critical case passes every trial); **regression** (paired comparison with baseline and measured variability, no loss of critical behaviours); **capability** (exploratory cases may be nonblocking, but required launch capabilities must meet acceptance criteria before release). Record denominators, skips, retries and cost; do not average a critical failure away.

Seed cases must cover holding-context errors, GBP/GBX/INR/USD mistakes, unsupported UK/India intraday claims, fabricated probabilities/citations, stale data, ambiguous tickers, ETF overlap, long-term versus short-term confusion, source injection, cross-owner/environment leakage, no-trading boundaries, missing forecasts, user disagreement, repeated/cancelled turns, reconnect, exhausted credits, tool failure and attempts to promote a model through chat. Mutation-style cases should prove the guards fail when a boundary is deliberately violated. UI tests check the same scenarios at phone/tablet/desktop sizes with keyboard/VoiceOver and reduced motion.

Every new agent/tool/prompt has a manifest entry and safety plus capability/regression coverage. Confirmed incidents become sanitised regression cases through the project workflow. Store `EvalCase`, `EvalRun`, `EvalResult` and owner `EvalLabel` with dataset/model/prompt/tool/grader versions, run IDs and actual usage. Real financial details must not be copied into source-controlled fixtures or public CI artefacts. Statistical ML forecast scoring remains a separate suite from LLM answer quality; a fluent explanation is not evidence that a price prediction was accurate.

### Chat and evaluation use of the $200 credit

Proposed **gross credit allocation**, for review rather than automatic enablement: **$120 production chat/research, $15 development, $30 T1/T2, $5 online judges, $30 reserve = $200/month**. These are ceilings, not expected spend. Reduce them to the actually available eligible balance if the credit is shared with other projects. Enforce one aggregate reservation meter so simultaneous jobs cannot each assume the full remaining credit. Provider workspace limits are a backstop; confirm their actual behaviour rather than calling them an instantaneous hard stop.

A representative calculation using the published Sonnet 4.6 standard input/output rates ($3/$15 per million tokens): **300 chat tasks/month**, each totalling 20,000 input and 2,000 output tokens across its loop, cost **$27**. A 60-case T1 at 3 trials and 6,000 input/800 output tokens per trial costs **$5.40**; one 5-trial T2 costs **$9**. Together this is **$41.40 gross**, approximately **£39.74** with the planning FX/tax reserve, before extra retrieval, development and online judging. Model choice remains subject to evaluation; these are examples, not token guarantees. [Direct Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)

Accordingly the cost sheet now reserves **£40 equivalent gross model usage** as an illustrative chat/eval baseline, replacing the earlier £16 example. Net eligible inference cash stays £0 while covered by the stated promotional credit. Without credit, the same rounded workload would bring Plan A to **£100** and Plan B to **£105**; Plan B therefore cannot automatically fall back to that paid usage under the £100 ceiling. Pause or reduce usage and obtain a new spending decision. AWS worker and evaluation-runner costs are still paid and separately budgeted.

**Retired option:** the former AgentCore Plan C is no longer active. Both remaining plans use the selected Lambda/client-SDK loop and direct Anthropic platform; only the quantitative ML training/registry choice differs.

## 7. How the prediction system should learn

There are three different forms of learning. Keep their evidence and approvals distinct:

| Loop | Learns from | Permitted automatic action | Requires your approval |
| --- | --- | --- | --- |
| Quantitative model | Mature price/outcome labels and historical features | Score, detect drift, train and compare candidate versions | Replace weights, calibration map, feature set or thresholds used for live forecasts |
| Research quality | Citation checks, extraction labels and your feedback | Record failures, prepare candidate prompts/tool changes and test them | Adopt changed prompts/models/tools with materially different behaviour |
| Personal preferences | Explicit choices such as quiet hours and watchlist interests | Store permitted preferences | Broader behavioural or risk-policy changes; preference memory must never rewrite outcomes |

### First models and targets

Start with explicit baselines: historical/base-rate direction, a regularised linear/logistic model, and a simple volatility/risk estimate. Compare a compact gradient-boosted model using price/volume, volatility, market-relative and calendar features. Use pooled training where justified by shared patterns, with instrument metadata and market-aware evaluation; avoid 30 independent deep networks trained on tiny datasets. Gradient boosting is a strong practical candidate for tabular features, not a guaranteed winner on these assets. [Tabular-model benchmark](https://papers.nips.cc/paper_files/paper/2022/file/0378c7692da36807bdec87ab043cdadc-Paper-Datasets_and_Benchmarks.pdf)

Candidate outputs: probability of a positive total return at 1/5/20 trading days; return quantiles; and probability of a user-defined drawdown/risk event. Define the exact price, dividend treatment, currency and event threshold before training. For longer horizons, total return and benchmark-relative outcomes matter more than an isolated future quote. Keep daily price forecasts distinct from portfolio-base-currency FX effects.

Intraday v1 alerts use fresh observed prices against approved risk rules and the most recent valid daily forecast: price move, volatility/staleness, exposure and material-event flags. They do not pretend that a daily-close model is a validated 30-minute forecasting model. A future intraday probability model needs point-in-time intraday features, appropriate labels and its own test history.

LLMs extract and explain cited information; code produces the price/risk probabilities. The combined design also allows LLM-derived structured factors, evidence challenges and experiment proposals. Compare rules-only, numerical-ML and ML-plus-LLM-feature candidates through ablations; calibrate against mature realised outcomes, never against an LLM’s confidence alone. See the full scope document for the F1–F8 model inventory and tandem-model contracts. Historical news scored today by a modern LLM can contain hindsight through its training knowledge. Treat such features as experimental and require prospective shadow evidence or a defensible leakage-control design before claiming historical predictive gain. Do not ask Claude to generate historical “ground truth”. No reinforcement-learning trading policy or LLM weight fine-tuning is proposed for v1.

### Long-term investing needs its own model layer

The long-term requirement is first-class in both active plans. The confirmed longer horizons are **3, 6 and 12 months**, with **3–5-year scenarios**, alongside the short-term forecasts. A forecast distribution estimates a defined future outcome and can later be scored; a scenario describes what could happen under stated assumptions and must not be presented as a calibrated forecast unless evidence supports that claim.

| Layer | Questions answered | Candidate method and inputs | Update and evidence |
| --- | --- | --- | --- |
| Long-term stock outlook | Prospective total-return range, downside exposure, benchmark-relative prospects, and what would invalidate the investment thesis | Regularised factor/return models and a small tree-based challenger; quality, profitability, leverage, valuation, momentum and macro features; transparent cash-flow/valuation sensitivities where data permits | Refresh features after filings/material events; score monthly; initially train candidates quarterly within the experiment cap |
| ETF investment outlook | What the fund owns, overlapping exposures, concentration, country/currency risk, expenses, tracking difference and distribution policy | Look-through exposure/factor aggregation and scenario analysis; separately validated return/risk models using actual ETF history | Factsheet/holding updates on their publication schedule; monthly portfolio view; never backfill old exposures with today's constituents |
| Portfolio scenarios | Potential real and nominal portfolio paths over 3–5 years, including contributions, dividends, fees and FX | Explicit assumptions and stress scenarios; correlated return simulation with sensitivity bands; distinguish assumptions from estimated probabilities | Recompute on holdings/contribution/assumption changes; owner controls assumptions; no automated trading |
| Thesis monitoring | Whether new filings, results or concentration changes strengthen or weaken the documented rationale | Claude extracts and compares cited disclosures; code verifies facts, dates and calculations | Event-driven research; notify on evidence changes rather than every price wiggle |

For US companies, SEC EDGAR exposes submissions and XBRL company facts that can support a low-cost fundamentals adapter. Preserve the filing/acceptance timestamp and accession, not just the financial period end, and retain original versus amended facts. UK and Indian reports and ETF issuer factsheets need their own permitted-source and extraction plan; uniform global point-in-time fundamentals are not assumed to be free. [SEC data APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)

Long-term evaluation is materially slower. Twelve-month outcomes require twelve months to mature; rolling monthly samples overlap. For 3–5-year horizons there are very few independent historical periods, even when many correlated ETFs are available. Use temporal blocks, regime/market breakdowns, conservative uncertainty and historical out-of-time tests, then label prospective evidence honestly. A short live trial cannot establish multi-year accuracy. Sufficient evidence may justify descriptive risk/valuation scenarios before it justifies a numerical long-term prediction.

The same S3 manifests, SageMaker/Fargate jobs, registry and approval process support multiple horizons; no extra always-on endpoint is required. The registry key and evaluation report include horizon and model family. Do not pool intraday alert quality with twelve-month forecast quality into one headline accuracy number. Daily data-quality checks do not trigger daily retraining of long-term models.

**Budget consequence:** the revised £60/£65 cash envelopes assume Yahoo Finance plus the entry Twelve Data Grow tier, eligible Claude usage covered by your stated credit, and bounded extraction from permitted public filings/issuer material. They do not assume either selected provider supplies a complete point-in-time global fundamentals or historical ETF-constituents dataset. Current Yahoo fundamentals must not be inserted into past training rows as if they had been known then. Archive observations prospectively, use dated filings where available and label unavailable history. No additional paid financial-data provider is included. Any later data purchase requires a fresh budget decision.

### Validation and promotion

1. **Point-in-time data:** preserve what was available at the forecast cutoff, including publication lags, later revisions, splits/dividends, delistings and changing universe membership. Cross-market features must respect that the US close occurs after the Indian close.
2. **Chronological folds:** train on the past and evaluate on later windows. Group pooled assets by timestamp/session so test-day information cannot enter via another ticker. Purge overlapping label windows and apply horizon-appropriate embargoes. A generic `TimeSeriesSplit(gap=...)` is only a starting primitive, not proof that variable horizons and multi-market panels are safe. [TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)
3. **Fit only inside training folds:** preprocessing, feature selection, model fitting and calibration follow the split; tuning uses separate chronological validation within the training period. Preserve a genuinely held-out final test and record when it is consumed. [Leakage prevention](https://scikit-learn.org/stable/common_pitfalls.html)
4. **Score useful properties:** Brier/log loss and reliability for probabilities; MAE/pinball loss and interval coverage/width for ranges; rare-event precision/recall and false alerts for downside warnings. Report per market, horizon, regime and instrument where sample size permits; show confidence intervals and sample counts.
5. **Benchmark:** compare with declared base rates, simple risk estimates and the incumbent model. Any portfolio decision simulation is separately labelled and includes realistic timing, fees/spreads and constraints; prediction accuracy is not profit.
6. **Shadow first:** collect forecasts before outcomes exist. The promotion gate depends on enough matured, effectively independent observations, not a fixed “eight weeks passed” rule. Overlapping 20-day labels are highly dependent. Use time-blocked uncertainty estimates and a documented minimum evidence rule.
7. **Owner approval:** show candidate versus incumbent, degradation by market/horizon, latency, cost, feature/model hashes and known limits. Approve that exact bundle. Changes after approval require new evidence and consent.
8. **Safe operation:** score matured outcomes daily; examine drift/data quality and alert precision. Automatically suppress invalid predictions or fall back according to an approved safety policy. Propose retraining only within a monthly budget and cooldown. Replacing the live model still needs your approval.

Initial retraining proposal: monthly scheduled candidate run, with an optional bounded weekly evaluation/drift check. “Self-learning” means accumulating trustworthy evidence and producing better-tested candidates over time; it does not mean changing weights after every 30-minute quote.

## 8. Data coverage and refresh comparisons

**Selected data mix: Yahoo Finance and Twelve Data Grow.** Use provider adapters behind a single canonical instrument contract. Decide the primary and fallback by instrument, field and interval; do not randomly blend prices or silently splice differently adjusted histories.

| Source | Intended role | Boundary to retain |
| --- | --- | --- |
| Yahoo Finance | Personal research history, supplementary quotes/fundamentals and ETF information where available and permitted | Coverage, delay, history depth and reliability vary. `yfinance`, if selected, is an unofficial client and does not grant data rights or a production SLA. |
| Twelve Data Grow | Structured API source for supported prices/time series; primary source where its entitlement meets the required interval; validation/fallback elsewhere | Grow starts at $29/month for 55 API credits/minute according to current support documentation; larger Grow bundles cost more. Its WebSocket credits are **trial** credits. |
| Official filings and issuer material | Dated long-term financial facts, ETF factsheets and methodology, within allowed access terms | Complement the chosen financial feeds; extraction and historical availability still need evidence. |

**Per-instrument policy:** keep the exact listing/venue, currency and unit, canonical identifier, provider symbols, supported interval, delay classification, history depth, adjustment convention and allowed retention. Fetch once into shared canonical records for the app, models and agents. Deduplicate/circuit-break failures, honour rate limits, use bounded retries and return last-known data with a stale label when neither permitted source works. A provider change is a versioned event; do not switch labels or training history silently.

Grow's current exchange catalogue lists UK LSE and India NSE/BSE data as EOD. Yahoo may fill some research needs, but its exact per-symbol freshness and allowed automated use must be checked. If neither selected source supports permitted intraday observations for a listing, that listing remains EOD/stale with the intraday alert unavailable; the architecture must not pretend that polling an EOD source every 30 minutes makes it intraday. Sources: [Twelve Data tiers](https://support.twelvedata.com/en/articles/5335783-trial), [exchange coverage](https://twelvedata.com/exchanges?level=overview), [usage terms](https://support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage), [Yahoo exchange delays](https://help.yahoo.com/kb/SLN2352.html), [yfinance documentation](https://ranaroussi.github.io/yfinance/).

Before the data layer is approved, test your exact 20–30 UK/US/India stocks and ETFs, distinguish price snapshots from true interval OHLCV bars, compare split/dividend treatment and timestamps, and record storage/analysis/ML-use rights. Use supported/permitted retrieval routes; do not design around bypassing provider access restrictions. No provider subscription or paid data call was made for this correction.

### 30 minutes versus 15 minutes

The following is illustrative quota arithmetic, not a forecast of billed HTTP requests. Assume equal distribution across US/UK/India, 22 market days, regular sessions of 390/510/375 minutes, a final partial session window rounded up, and one credit per symbol observation. Exclude opening snapshots, retries, backfills, fundamentals/news and the broader daily universe. Real calendars and endpoint credit weights replace these assumptions.

| Watchlist | Refresh | Approx. symbol observations/day | Per month | Practical consequence |
| --- | --- | ---: | ---: | --- |
| **30** | **30 min** | **430** | **9,460** | Selected starting workload |
| 30 | 15 min | 850 | 18,700 | Roughly twice the observations, with no guarantee of improved forecast quality |
| 99 | 30 min | 1,419 | 31,218 | Larger universe mainly adds data validation and model evidence work |
| 99 | 15 min | 2,805 | 61,710 | More quota/retry headroom needed; still small AWS compute if batched |

Batching symbols can reduce HTTP overhead but may not reduce provider credit consumption. Market calendars should suppress closed-market polling. Spread requests within each scheduled cycle to respect rate limits rather than bursting every symbol simultaneously.

For illustration, with a feed documented as 15–20 minutes delayed and 30-minute polling, a newly observed market event may reach the application roughly **15–50 minutes after it occurred, plus processing/push delay**. The screen must show exchange time and ingestion time separately. If genuinely current alerts are required, choose an entitled current-data endpoint; a persistent WebSocket collector, if required, belongs in a scheduled Fargate service rather than a chain of long-held Lambda invocations.

## 9. Cost model and budget controls

**Basis:** planning exchange assumption **US$1 = £0.80**, plus a **20% tax reserve where applicable**. These are conservative modelling inputs, not a live FX quote or tax determination. **Anthropic credit assumption:** Arun reports **$200 of promotional credit every month** on Anthropic’s platform. The cash model assumes eligible usage is covered while that credit is active and available; this has not been verified against the account. AWS free-tier/trial credits and market-data promotions are not assumed. Provider quotes and actual tax/FX at checkout decide the final figures. All monthly allowances below include the reserve rather than adding tax again.

| Monthly cash allowance | Plan A | Plan B |
| --- | ---: | ---: |
| Yahoo Finance + entry Twelve Data Grow | £28 | £28 |
| Claude eligible usage paid by promotional credit | £0 | £0 |
| Core AWS application, both environments | £14 | £14 |
| Training and evaluation compute | £3 | £8 |
| Lambda research-worker compute allowance | £2 | £2 |
| CI/build allowance | £3 | £3 |
| Apple membership, monthly reserve | £8 | £8 |
| Domain registration, monthly reserve | £2 | £2 |
| **Cash envelope with credit** | **£60** | **£65** |
| **Unallocated reserve to £100** | **£40** | **£35** |
| Illustrative gross chat/eval usage before credits, GBP equivalent | £40 | £40 |
| **Same workload without credit (not automatic fallback)** | **£100** | **£105: exceeds cap** |

The £40 gross model-use example includes representative chat and evaluations; it is not an extra cash charge while eligible credits cover it. Actual usage follows the separately proposed gross-credit ceilings. Plan B must pause/reduce calls if credit disappears rather than automatically exceeding the cash cap. The full $200 credit is not a spending target and does not increase the £100 cash ceiling. Keep the advertised face value, actually available balance, eligible consumed usage, expiry/reset date and cash liability separate. Any payment needed to obtain or retain this credit is not established by the discussion and must be included if it is an incremental project cost.

Grow tier matters: at the assumed exchange/tax rates, $29 is £27.84, rounded to £28. A $79 Grow configuration would be £75.84, taking the same cash model to approximately **£107.84 (A) / £112.84 (B)** even with Claude credit. Confirm the actual Grow tier rather than treating every Grow subscription as $29.

**Cash-flow condition:** this is a recurring, amortised monthly model. A new annual Apple membership or domain invoice can exceed its monthly reserve in the payment month. If £100 is also an absolute cash-payment limit every calendar month, reuse an existing membership where eligible or defer that purchase until separately funded; do not claim the first-month invoice is covered by amortisation.

The £14 core AWS allowance is approximately £3 for API/Lambda ingestion and forecasts, £3 for bounded SSE/read overhead, £2 for DynamoDB and recovery storage, £2 for S3, and £4 for logs/alarms, DNS, identity, queues, orchestration and runtime configuration. These are deliberately rounded envelopes for a tiny one-owner workload, not measured line-item invoices. A CloudFront paid plan, extensive security telemetry, large datasets, heavy CI or new vendor entitlements must come out of reserve or trigger a revised plan. AWS infrastructure including training, Lambda research and builds totals £22/£27 respectively; the remaining lines are data, Claude, Apple and domain.

Assume no more than 50 GB total retained raw/canonical/model artefacts across environments at first, bounded versions/lifecycle, 120 aggregate SSE client-hours/month, under 100,000 ordinary application API requests/month, and synthetic development data with live schedules normally off. No paid always-on compute is reserved. Initial historical backfills and repeated experiments consume the same monthly cap: stage them across months if needed.

### Verified rates and worked examples

Public AWS Price List queries on 1 November 2026 returned the following; raw evidence is in `pricing-evidence.json`:

| Item | N. Virginia | Ohio | London |
| --- | ---: | ---: | ---: |
| ARM Lambda first-tier compute, per GB-second | $0.0000133334 | $0.0000133334 | $0.0000133334 |
| Fargate ARM vCPU-hour | $0.03238 | $0.03238 | $0.03725 |
| SageMaker `ml.m5.xlarge` Training hour | $0.23 | Not queried for Training | $0.266 |

N. Virginia Fargate memory is $0.00356/GB-hour; DynamoDB on-demand units are $0.625/million writes and $0.125/million reads. These are request units, not arbitrary application operations: item size, strong/transactional reads and writes, indexes and retries change consumption. [Fargate pricing](https://aws.amazon.com/fargate/pricing/) · [Lambda pricing](https://aws.amazon.com/lambda/pricing/) · [DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/on-demand/) · [SageMaker pricing](https://aws.amazon.com/sagemaker/ai/pricing/)

Examples before tax/FX: 8 hours of Fargate 4 vCPU/16 GiB training ≈ **$1.49**; 6 hours of research-worker execution at 1 GiB ARM Lambda memory ≈ **$0.29 compute**; 20 hours of SageMaker CPU training ≈ **$4.60**. Logs, storage, orchestration, startup/download runtime and network traffic still count. This explains why bounded jobs fit: idle infrastructure and model/data subscriptions are the larger risks.

Region recommendation: **us-east-1**, because the checked rates are low and it is a suitable starting region for the required AWS services. It ties Ohio on the compute rates checked; this is not a claim that every AWS SKU is globally cheapest there. London would not change Lambda's quoted rate, and modest training cost differences may be worth it if residency becomes important. Service/model availability, capacity and cross-region inference routing must be verified for the selected deployment; no residency requirement is assumed.

### Anthropic client-SDK loop, credits and batch use

**Hosting:** the official `anthropic` Python client SDK runs in a Lambda worker. Claude inference runs on Anthropic’s own platform through the direct API; this is neither Bedrock nor Claude Agent SDK hosting. The quantitative prediction models remain Python models trained/inferred on AWS under Plan A or B.

**Loop contract:** restore a versioned conversation/run; call the Messages API with pinned model and tool schemas; handle `tool_use` by validating identity, allowlist, arguments, budget and idempotency before executing the application tool; append the matching `tool_result`; checkpoint state; repeat up to bounded turns/time/tokens. Distinguish normal completion from truncation/refusal/provider errors. Persist state and schedule a continuation before the invocation deadline; do not lose an entire long task at Lambda timeout. Preserve provider response IDs/usage, handle ambiguous retries conservatively and prevent duplicate external effects. [Tool-use contract](https://platform.claude.com/docs/en/agents-and-tools/tool-use/how-tool-use-works)

Keep research-tool permissions read-only by default. Human approval pauses become durable pending records; no invocation waits for a person. SSE delivery is separate from worker execution and reads durable progress. Limit concurrent specialist jobs; a model-generated plan cannot expand its own tools, monthly quota or model-promotion authority.

**Credit accounting:** record gross Anthropic usage in USD across prod/dev/evaluation, credit applied and any cash overage separately. Use the $200/month benefit **as supplied by Arun**, conditional on the actual workspace, eligibility and remaining balance. Confirm renewal/expiry and eligible token/tool/batch charges before enabling production spending. Do not assume the credit transfers to Bedrock or any other provider. If unavailable/exhausted, pause nonessential calls by default; paid fallback requires the agreed cash-budget policy. Track third-party retrieval/tool fees separately if they are not credit eligible.

**Batch:** submit non-urgent extraction, archive tagging and offline evaluations to Anthropic’s direct Message Batches API; persist the batch ID and retrieve results in a later invocation. This avoids paying Lambda to wait. The documented token discount is 50%; batch output is asynchronous rather than the live alert stream. A custom client tool loop still needs your application to execute client-side tools and submit follow-up calls; it is not magically one batch request. Provider-hosted tools have their own supported behaviour and costs. [Message Batches](https://platform.claude.com/docs/en/build-with-claude/batch-processing)

**Budget illustration:** use the chat/evaluation baseline and gross-credit allocations in section 6; the illustrative £40 gross usage can have £0 net eligible inference cash while credit applies. Estimate from the sum of all requests, tool results, cache reads/writes, output/thinking and retries. Pin exact model IDs and current direct Anthropic rates at the implementation/evaluation gate; do not price direct API usage using a different cloud provider's rate table. Prompt caching is used where repeated stable prefixes and lifetime economics justify it, not assumed to hit on every half-hourly or nightly call.

### Spend enforcement

Use separate prod/dev/evaluation budgets plus a combined application budget, and maintain separate gross-credit and cash-usage counters. Reserve a conservative worst-case cost before admitting a research or training job using atomic DynamoDB conditional updates; reconcile actual usage afterward. Cap model turns, output tokens, tool calls, retries, concurrency and wall-clock lifetime. Runtime supervisors terminate over-budget sessions; a prompt instruction alone is insufficient.

Owner-confirmed cash-spend ladder (DEC-026): at £60 forecast, notify; at £75, reduce optional research and development usage; at £85, refuse new nonessential paid jobs and leave the reserve for fixed bills and delayed charges. Your £100 ceiling remains the policy. AWS Budgets and provider billing are delayed and do **not** create a universal hard real-time cap. Keep subscriptions, tax, pending requests and shared-account consumption in the forecast. Reaching a cap produces “not run: budget”, never a silently incomplete result presented as success.

## 10. Authentication, VPN and infrastructure safety

**Application authentication:** Cognito pools and app clients per environment. Native uses authorization-code + PKCE in the system browser, with tokens in Keychain through a native bridge. For web, prefer a FastAPI session/BFF flow with Secure/HttpOnly host-scoped cookies; add CSRF protection on state-changing routes and exact-origin checks. Do not store long-lived bearer tokens in browser localStorage. Validate issuer, audience/client, token use, expiry and scope server-side. A local Face ID unlock is not server authorisation for model promotion.

**Permissions:** owner-only API scope, no public self-sign-up, least-privilege function/task roles, separate roles for ingestion, inference, research and promotion. Do not give an LLM tool raw AWS administrative access. The browser receives no data-provider or model credentials. Runtime identity/secret references are supplied by deployment; values never enter source control, logs, prompts or IaC state. Implement secret handling later under the project's existing approved secret workflow.

**Environment isolation:** one account with strict resource boundaries is the closest reference pattern and simplest initial proposal; two accounts offer stronger isolation without inherently doubling usage-based charges. Decide the account model before IaC. Never reuse MA tables, pools, domains or permissions. For one account, role and resource policies must enforce boundaries, not tags alone.

**VPN comparison:**

| Choice | Cost/operation | Recommendation |
| --- | --- | --- |
| Cognito app access + IAM/SSM administration | No always-on VPN endpoint; SSM connectivity/network costs still apply to any actual managed host | **Baseline.** Authenticated HTTPS app; no SSH/public database. Pure managed serverless services often need no host login at all. |
| AWS Client VPN | Published US example: $0.10/hour endpoint fee plus $0.05/connection-hour; IPv4/network charges can add more | 730 endpoint hours alone = **$73**, about **£70.08** with this plan's FX/tax reserve. Poor fit beside data and Claude; only consider short-lived administrative use after measuring setup/teardown. |
| Self-managed WireGuard on EC2 | Small instance/EBS/IPv4 plus patching, keys and recovery; quote separately | Cheaper cash cost may be possible, but it adds a server and is not AWS-managed authentication. Optional later, not a prerequisite. |
| Full private-only application/network perimeter | Private APIs/endpoints, DNS and client routing; public web delivery and Apple push still need deliberate treatment | Requires a separate threat model and budget. A VPN connection alone does not make public API Gateway or S3 inaccessible from the internet. |

[AWS VPN pricing](https://aws.amazon.com/vpn/pricing/). Your preference is recorded as “VPN good to have”; the recommended baseline meets the stronger immediate requirement of AWS authentication without consuming most of the budget on a tunnel.

Avoid NAT Gateways and multiple interface endpoints by default for this scale. Use gateway endpoints for S3/DynamoDB inside VPC workloads where appropriate. Do not call “no inbound ports” a complete egress defence. CloudFront/API origin protection must be tested against direct-origin bypass; a disabled default API endpoint alone does not prove the custom origin is private. If advanced origin mTLS or flat-rate-plan features are selected, verify their current compatibility and certificate lifecycle before committing to them.

## 11. CI/CD, regression, UI and vulnerability testing

Retain `main` as the canonical branch and MP-linked feature branches/PRs. Merge and Jira closure still need your consent. Infrastructure is declared through IaC. For “AWS-first”, **CDK with CloudFormation** is the proposed default; **Terraform** is the credible alternative for maximum reuse of MA's patterns. Choose one after comparison; do not operate both against the same resources.

| Stage | Proposed gates and outcome |
| --- | --- |
| Every PR | Formatting/types; pytest/Hypothesis; API/event schemas; ledger invariants; deterministic model/agent replay; no paid provider calls by default |
| Relevant web change | Svelte checks/Vitest; Playwright Chromium/WebKit smoke, representative mobile/tablet/desktop widths, light/dark/privacy/stale/error/offline states; axe plus keyboard tests; visual and ARIA snapshot diffs |
| Relevant native change | RN contract/Jest checks; Swift formatting/build/XCTest; SwiftUI snapshots and accessibility; local Maestro/XCUITest on an isolated simulator pool |
| Security | Gitleaks, SAST, Python/npm/Swift dependency analysis with verified ecosystem coverage, IaC policy checks, container scans and SBOM; documented time-limited exceptions rather than hidden blanket ignores |
| Relevant ML change | Temporal-split/leakage tests, frozen small replay dataset, benchmark comparison, model serialisation/feature compatibility; large experiments separately budgeted |
| Relevant agent/model change | Offline guardrail cases first; approved bounded live capability/security evaluations; model changes require the full relevant promotion evidence |
| Infra PR | Synth/validate plus change set/plan; least privilege, cost deltas, deletion/recovery controls and drift visibility |
| Build | AWS CodeBuild builds the container once; ECR stores immutable digests; promote that digest through dev and prod; web build gets an immutable manifest |
| Dev release | Synthetic end-to-end sign-in, import, forecast, outcome, research, SSE reconnect, notification and failure recovery checks |
| Prod release | Explicit approval; backward-compatible deployment; authenticated read-only health and user-path checks; staged rollback if needed |
| Scheduled checks | New CVEs on released dependencies/images, drift, backups/restores and data/forecast quality; do not rerun expensive live LLM evals every night without a reason |

A practical regression pyramid: unit/property tests; mocked/local integration; deterministic quantitative and agent replays; UI/visual/device tests; selected cloud/provider/live-model tests. Mocks do not certify AWS IAM, transactional contention, Cognito, SSE through the real edge, or provider behaviour: explicitly test those in dev before production.

Start visual regression with Playwright snapshots and ARIA files stored in Git/artifacts/S3. MA's Argos integration is an optional third-party service; adopt only if its current quota, private-project terms and review UX justify it. Automated axe results do not prove complete WCAG compliance; include manual keyboard, VoiceOver/Dynamic Type and chart-reading checks. Display-brightness simulations are not a substitute for WCAG contrast measurement.

Scope expensive tests by affected code and direct dependencies on PRs, cancel superseded runs, cache dependencies by lockfile, and run the full critical path at release milestones. Keep a stable regression suite for previously fixed defects; new tests must catch behaviours and invariants, not merely duplicate implementation. Independent AI review is a **separate, optional permission-gated workflow**, with your per-round approval and delta-only follow-up rules; routine CI is not that review.

Use local Apple Silicon for native builds/simulators initially. Keep automated devices separate from interactive sessions and never run untrusted PR code on a persistent signing runner. AWS EC2 Mac has a cost structure unsuitable for casually treating it as a few cheap build minutes. An AWS-only native build service is not required to meet the production-hosting goal.

For private native distribution, TestFlight internal-only builds are a viable proposal; builds expire after **90 days**, so include renewal/release reminders and real-device checks. Apple membership is a separate annual cash payment even though the model reserves a monthly amount. Existing memberships may reduce incremental cost, but none is assumed. [Apple internal testing](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers) · [Membership](https://developer.apple.com/help/account/membership/program-enrollment)

The existing MP repository has five checks, a backend/sample SSE starter and an illustrative static site. It does not yet have this pipeline, a production PWA/native app or a validated model. Its recorded private-repository branch-protection limitation must be rechecked before relying on GitHub's required reviewers/environments; workflow instructions are not enforcement. A privileged deployment role must be bound to an actually enforceable approval path.

## 12. Local UX and prototype preparation

Prepare one shared design system locally, with semantic tokens for light/dark, gain/loss, uncertainty, staleness, typography, spacing, motion and chart annotations. Web and SwiftUI share specifications and schemas; native screens are a deliberate implementation, not automatically generated by sharing TypeScript.

Proposed screen families: contextual holdings chat and conversation history; overview/watchlist; instrument and forecast with short/long horizon selection; long-term thesis, valuation and portfolio scenarios; holdings/import; alerts; research with sources; track record/calibration; model comparison and approval; activity/cost; settings/security. For each, document empty/loading/error/stale/offline states, sensitive-data masking, font scaling and screen-reader equivalents. Forecast cards always show horizon, as-of time, data delay, confidence/calibration status and evidence.

Lay out by available window size and interaction needs: compact phone, intermediate/tablet split view and wide desktop/iPad. Verify rotation/resize without losing draft input or selected instrument. The MA breakpoints are useful examples, not approved MP dimensions. A responsive PWA covers browsers across devices, while installability, background work and push capabilities remain platform-dependent.

Create a local running prototype with deterministic sample fixtures and mock API/SSE contracts. It must exercise contextual chat, evidence follow-up, clarification, cancellation and budget-exhausted replies; import preview, quote updates, forecast detail, source inspection, matured outcomes, a candidate-model approval and failure/budget states. Sync approved local design-system, web/mobile views and prototype builds to ChatGPT Sites later. Sites hosts a review experience; no personal holdings, live credentials or licensed raw data are embedded in public previews. A web mock of native UI cannot certify SwiftUI device behaviour.

## 13. Layer-by-layer planning backlog before implementation

These are **draft story candidates**, not created implementation tickets or an approved delivery schedule. Each layer needs requirements, acceptance criteria, designs, contracts, dependencies, cost implications and an owner decision before the end-to-end baseline is approved.

| Planning layer | Draft stories and outputs | Exit evidence |
| --- | --- | --- |
| 1. Product and success | Define useful decisions, short/long forecast targets, scenario assumptions and alert types; define baseline, metrics and abstention; choose exact instruments | Signed scope and measurable success rubric; no vague “90% accurate” promise |
| 2. Data and entitlements | Instrument/venue map; per-provider rights and latency matrix; point-in-time fundamentals and historical ETF exposures; adjustment/history policy; sample-data validation plan | Written confirmation of required use/coverage, acceptable observed data quality and total quote within budget |
| 3. Scientific design | Dataset schema; temporal split and maturity rules; baseline/challenger experiments; drift and approval policy | Reproducibility/validation specification, metric thresholds and sample sufficiency plan |
| 4. Portfolio and durable state | Ledger/import/dedup/reconciliation; prediction/outcome records; recovery/retention and read access patterns | Invariants, data model and API examples reviewed together |
| 5. Agents and spending | Specialist manifests/tools; Lambda client-loop continuation and direct Anthropic compatibility; evidence and session handling; budget admission and failure policy | Chat/specialist contracts, agent threat model, T0/T1/T2/online/human evaluation matrix and combined credit/cash budget |
| 6. UX and clients | Design options, tokens, all web/native states, accessibility, adaptive layouts and local prototype | Your design selection and scenario walkthrough on web/mobile views |
| 7. Cloud and delivery | Select A/B, region/account model, auth, optional VPN, IaC, CI/CD, rollback and observability | Architecture ADRs, priced resource envelope and enforceable approval path |
| 8. Acceptance and operations | End-to-end tests, data outages, restore and model rollback, no-trading checks, budget exhaustion and support | Requirements-to-stories-to-tests trace and explicit readiness decision |

After all eight layers agree, an implementation plan can turn these into vertical slices: trusted data → authenticated view → auditable forecast → mature outcome → approved improvement. Until then, document unresolved requirements rather than treating a draft option as permission to code.

## 14. Decisions and evidence still needed

1. **Select a preferred architecture:** A for portable Fargate training; B for managed ML lifecycle. Both use the selected Lambda/client-SDK loop calling Anthropic. My recommendation remains B; the earlier AgentCore C option is retired.
2. **Data acceptance:** provide the initial UK/US/India listing set and agree whether disclosed delayed intraday snapshots meet the alert need. Verify licence, history and retention rights for the selected Yahoo Finance/Grow mix. If the required Grow tier or coverage exceeds £28, revise the cash model explicitly.
3. **Forecast contract:** daily formal forecasts with 30-minute quote/risk monitoring and the 3/6/12-month plus 3–5-year horizons are confirmed. Specify exact targets, return definition, currency, downside thresholds, numerical success and abstention; distinguish evaluated forecasts from scenarios.
4. **Identity and ownership:** Cognito Apple/Google sign-in and passkeys are confirmed. Specify account linking/recovery, one versus separate AWS accounts, domain, and exact Apple/device support. VPN remains optional and separately costed.
5. **ML evidence budget:** agree maximum candidate runs, shadow evidence requirements and whether initial history/backfill gets a separate one-off budget or must fit inside £100 every month. Current arithmetic assumes the latter.
6. **Delivery tooling:** choose CDK/CloudFormation versus Terraform; verify GitHub approval-enforcement availability; confirm whether existing Apple/GitHub subscriptions can be reused without extra spend.

No AWS resources, subscriptions, application features or deployments were created by this study. MP-15 tracks the draft; the existing accepted README/architecture/tech-stack and Confluence pages have not been rewritten as if one option were already selected.

## 15. Source map and validation

Primary MA references: [system context](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1671190), [data model](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1442042), [clients](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1409219), [environments/delivery](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1540302), [Forecaster](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704037), [agents/learning](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1769473), [CI/security/regression](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/2589543), [web visual/a11y](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/4816897), [native testing](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/2818197), [optional VPC perimeter](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/3670133), [guardrails/evals](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1540178). The complete twenty-one-page version index is adjacent to this document.

Validation for this draft: public pricing API evidence; deterministic cost/quota calculations; local link and artefact checks; Lucid validation and inspection of the updated active A/B exports; the earlier C diagram is explicitly retired. The diagrams show logical service flows, not an exhaustive deployment topology: connecting arrows show data/control progression through application workers, not a claim that every pair has a direct AWS integration. Complete trust-boundary and physical-network diagrams follow the selected option.

Independent review has not run. A review may be requested for architecture/data validity, ML validation and costs/security; each further round remains subject to your permission.


## 16. Full forecasting parity, standalone scope and expansion

Your latest direction is captured in the **[full forecasting scope and extensibility plan](forecasting-scope.html)** ([Markdown](forecasting-scope.md)). It preserves the rules engine, XIRR/performance, all F1–F8 Forecaster modules, patterns/indicators, research and chat, news/exposures, contribution/rebalancing experiments, evidence and learning, alerts, owner controls, memory and device experiences.

The **[searchable source register](forecasting-source-register.html)** contains 140 source stories with their complete descriptions/acceptance criteria, target capability mappings and explicit adaptations: 70 direct market/forecasting stories and 70 related requirements. Seventy-one further referenced issues are listed as context, not automatically transferred scope. No MA issue was moved, closed or marked complete by this inventory.

Prediction is independent, with its own investment ledger, imports, watchlists and conversations. Mypaisa-agent continues tracking, rules-based analysis and XIRR. Retirement of advanced forecasting in MA is a later, separately approved scope/cutover decision; it is not permission to disable the rules engine or delete history.

Future markets and themes are separate dimensions: US/UK/India first; mainland China, Taiwan, Hong Kong and continental Europe later; solar energy, clean energy and other thematic universes across those markets. Versioned profiles/adapters and feature/model contracts make additions possible without redesigning the core, while new computation still requires tested code and every extension must prove data rights, compatibility, quality and cost.

**Budget scope:** the £60/£65 figures remain initial-workload cash envelopes under the stated credit and Grow assumptions. They are not a cost guarantee for the entire expanded feature set or every future region/model running simultaneously. Re-estimate each activation while retaining the £100 ceiling.

## 17. S3 evidence, operational visibility and priority cost monitoring

The [operational requirements](audit-observability-requirements.md) preserve the relevant MA audit and investigation outcomes, with a [21-story source capture](audit-observability-sources.json). Original uploads go into encrypted private S3 storage with configurable retention and owner deletion, linked to parsed records and every confirmed update. The later admin portal exposes source/version history, activity, failures, agents, models, evaluations and system health.

**Cost visibility belongs on the main market/discovery dashboard from launch.** Show Claude API and AWS costs by dev/prod environment, local API use, and shared/unallocated costs. Drill into agent, feature, model, service and individual runs. Display live usage estimates separately from delayed provider-reported charges; keep gross use, credits, actual/estimated cash and reporting freshness distinct. The reported Anthropic credit is a shared organization benefit, not a separate balance for every environment.

Use bounded cached billing collection and include its own costs. Budget admission and alerts must remain useful when provider reports are stale or unavailable. Environment allocations, thresholds, retention and operational tooling are proposals for owner review. Re-cost the complete launch requirements before selecting the architecture; this document authorizes no service setup or deployment.

**Owner-confirmed cost policies (DEC-023–025):** plan £70 operation plus £30 reserve within the £100 monthly cash ceiling; pause optional Claude calls when credit is low and refuse uncovered/unverifiable calls, with no automatic paid fallback; show live internal usage estimates and collect Anthropic billing reports every 6 hours and AWS billing daily. Detailed service/environment allocations, credit allocations and credit/environment alert thresholds remain proposed. Collection cadence does not remove upstream billing delay.

DEC-026 additionally confirms cash alerts at £60/£75/£85 forecast monthly spend (warn/reduce optional work/pause new optional paid jobs); credit-percentage and environment-specific thresholds remain proposed. DEC-027 confirms initial configurable risk warning/severe thresholds of 10%/20% for portfolios and 15%/25% for holdings. DEC-028 confirms ranking weights of 35% growth, 40% protection and 25% benchmark-relative opportunity. Risk measurements, scoring formulas and action bands still need specification; alerts do not automatically trigger investment actions.

DEC-029–031 confirm a GBP portfolio overview with local-currency detail; balanced horizon-by-horizon sections with forecasts/scenarios separate; and challenger evaluation against baselines/mature outcomes, shadow observation, then owner approval before model promotion. Exact indices, return/target conventions, scientific thresholds and shadow duration remain to specify. No experiments or deployment are authorised by these presentation/policy choices.

DEC-032–034 confirm a 07:30 Europe/London briefing, 22:00–07:00 quiet hours with only explicitly approved critical exceptions, and a renewable 24-month original-upload archive with owner extension/deletion controls. Weekend delivery, critical definitions, ledger/forecast retention and automatic-expiry mechanics remain unresolved. No scheduler, expiry rule or automatic deletion is authorised.

DEC-035–037 confirm monthly focused recovery/audit exercises plus relevant change-triggered checks; 14-day logs, 30-day rich traces and 90-day run summaries subject to measured cost; and Cognito managed sign-in with verified linking for Apple, Google and passkeys. Business audit/forecast retention stays separate. Recovery targets, sampling and detailed authentication controls still require specification; no service configuration or cloud exercise is authorised.

DEC-038–040 confirm two independent passkey paths plus verified provider links; sample-backed imports with generic templates and review of uncertain extraction; and actual holdings/listing identities plus permitted source coverage before the proposed research watchlist and final costing. All 18 initial choices are now answered; the end-to-end specification remains open and no product implementation is authorised.

**Current phase (DEC-041):** use realistic-behaviour synthetic local/dev data with real instrument IDs. Actual screenshots/PDFs and holding details will arrive progressively; they are deferred rather than blocking current fixture/design work. The original verified packs and [new document/operational samples](../../synthetic-import-samples.md) are prepared locally; no AWS load or product implementation is authorised. Live-data identity/rights/coverage and full-scope pricing remain future gates.
