# Owner architecture decisions

**2 November 2026 · MP-19 · Architecture baseline not yet approved**

## ARC-01: preferred sources and verification route

The owner selected option A: **Keep Yahoo/Grow; verify uses and investigate gaps.**

Yahoo Finance and Twelve Data Grow remain preferred candidates. Verify listing coverage/freshness and permission for retained history, training/analysis, derived displays and any selected evidence sent to Anthropic. Investigate alternative sources for a documented gap, without subscribing or automatically increasing spending. Preserve the £100 all-in ceiling, modular adapters and explicit daily/unavailable fallbacks.

This settles the research/design direction only. Actual entitlements, affordability and supported capabilities remain evidence gates under FC-01/03/15, CT-13 and PL-13; none is marked closed. No provider activation, paid source, implementation or complete architecture approval is implied.

Review/publication/PR status: the owner chose to keep drafts and discuss decisions first. Independent review, Confluence publication and PR creation remain pending.

Next: ARC-05, forecast experiment breadth and scientific qualification.

## ARC-01 dev refinement: Twelve Data Basic/Free

The owner asked to consider the free tier for dev. Record it as the preferred live dev candidate alongside offline synthetic fixtures, not as an activated subscription or a guarantee of the same coverage as Grow. Official pricing/credit documentation checked on 2 November 2026 lists 8 API credits/minute and 800/day, resetting at 00:00 UTC. Credits are weighted by endpoint and symbol; one HTTP request need not equal one credit. See [dev data policy](dev-data-policy.md).

## ARC-02: operational ledger and write ownership

The owner selected option A: **DynamoDB + S3, with one controlled write service.**

DynamoDB is the selected direction for operational records; originals remain encrypted/private in S3. A backend application write service owns financial ledger commits/corrections and their audit/outbox evidence. Research/import agents prepare typed drafts; owner confirmation authorises the backend to validate and apply the exact proposed financial change. Automated market-data/job writes have separately scoped authority and are not silently treated as owner-confirmed ledger edits.

Before final sign-off, specify access patterns, financial precision and XIRR/FX conventions, duplicate identity, concurrent corrections, large-import staging/visibility, required audit queries, recovery/reconciliation and owner exports. S3 and DynamoDB do not form one atomic transaction. Keep PL-08, CT-02/03, FC-10 and IR-02 open until their own evidence/decisions are complete. Existing PostgreSQL ADRs remain historical pending explicit reconciliation.

This records the chosen storage/write direction, not completed schemas, passed integrity tests, provisioning, or approval of the whole architecture.

## ARC-03: Python durable workflow orchestration

The owner selected option B: **Lambda Durable Functions with Python workflows**. This is the primary orchestration direction and supersedes the maker's original Step Functions Standard recommendation. A later Step Functions exception needs its own requirement, cost and owner decision.

SQS remains responsible for buffering/backpressure and EventBridge Scheduler for timed triggers. DynamoDB business/approval/audit records remain authoritative for product state; durable checkpoints and execution history do not replace long-term business evidence. Keep external I/O in controlled steps and reconcile ambiguous paid calls or started training jobs instead of blindly repeating them after a crash.

Before build, prove runtime/container/SDK and regional compatibility; step naming/versioning and deterministic replay; owner approval expiry/version binding; idempotency beyond provider token windows; retries, cancellation, leases and cross-environment replay denial; redacted history retention, async API handoff, telemetry and complete cost. The existing Python 3.12 starter is not certified by this direction, but OCI support means it is not rejected solely from a managed-runtime table. No SDK, runtime or application code is changed now.

Primary documentation checked on 2 November 2026: [durable execution](https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html) and [runtime/OCI support](https://docs.aws.amazon.com/lambda/latest/dg/durable-supported-runtimes.html). The records and gaps PL-05/06 and CT-02/14 remain open until their contracts and evidence are complete.

## ARC-04: selective SageMaker training and portable forecast inference

The owner selected option A: **Selective SageMaker training + portable Lambda inference.** Use capped on-demand CPU jobs for candidate training/evaluation, approved versioned artefacts in S3 and Lambda inference only where the model/runtime/resource fit is demonstrated. Store formal daily forecast results for clients to read; do not train or refit on each app request. No always-on inference endpoint is assumed.

Lambda Durable Functions with Python coordinates job submission, completion, evaluation, shadow evidence and owner approvals. It must reconcile job identity after interruption/replay. Claude models remain hosted on Anthropic, under the separately bounded research loop.

Exact model families/tasks/horizon artefacts, job/training caps and cadence, dependency/serialisation safety, resource limits, region, serving latency, cancellation, restore and complete dev/prod cost remain open. If a model cannot fit the Lambda envelope, present a costed serving alternative for a separate owner decision. Keep PL-07 and FC-05/09 open until their own specifications and evidence pass. Model promotion still requires owner approval; selecting an execution service does not establish predictive quality or authorise a paid job.

## ARC-03 reaffirmation after FastAPI/hybrid clarification

The owner reaffirmed **Keep Durable Functions primary** on 2 November 2026. FastAPI runs on ordinary API Lambdas; Python Durable Functions runs background workflows. Step Functions is not included in the initial direction. A later ML-specific hybrid requires a demonstrated benefit, ownership/integration/cost evidence and another owner decision. This does not change the four selected direction cards or satisfy their open proof gates. Next remains ARC-05, model experiment breadth and qualification.
