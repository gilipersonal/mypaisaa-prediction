# Architecture decisions to settle before UX

**MP-19 | 2 November 2026 | Maker planning draft | 4 directions selected; 8 owner answers pending**

These cards combine the forecasting, controls and platform research. MA contributes concepts and a useful documentation structure. MP's own requirements, rights, budget and scientific evidence decide the result. Choose directions in dependency order; neither a recommendation nor a saved document is approval.

The cards deliberately distinguish **architecture decisions before UX**, **specification/proof before build**, and **live eligibility before activation**. Detailed numeric policies and unresolved evidence remain in the gap register. If an unresolved item changes a promised flow or information contract, it blocks UX until settled; it cannot be hidden as a later implementation detail.

## Confirmed constraints retained

- Standalone personal investment decision support; no trading and its own ledger.
- US/UK/India initially; future markets/themes are versioned extensions.
- All agreed short/medium/long horizons remain: daily formal forecasts plus30-minute supported quote/risk monitoring;3–5-year outputs are scenarios.
- All five first-version import methods remain, with named sample-backed layout coverage and uncertain extraction review.
- £100monthly all-in cash ceiling;£70planned operation/£30reserve;£60/75/85cash policy; reported shared$200Anthropic credit unverified and counted once; no uncovered paidfallback.
- Direct Anthropic client-SDK loop on Lambda, with Claude hosted on Anthropic; not Bedrock/AgentSDK.
- SvelteKit3adaptive PWA and Swift/SwiftUI inside RN shell; Apple/Google/passkeys through Cognito.
- Owner approval before live model promotion; separate rules/ML/research views, disagreement and abstention.
- Confirmed ranking weights35%growth/40%protection/25%opportunity remain, with eligibility/normalisation still to specify.
- 07:30Europe/London briefing;22:00–07:00quiet hours with explicitly approved critical exceptions.
- Private encrypted original archive with renewable24-month default/owner deletion; operational logs14days/traces30days/run summaries90days; monthly/change-triggered exercises.
- Cost visibility by environment/agent/model/feature directly in the main app; live estimates and delayed Anthropic6-hour/AWSdaily collection.
- Actual holdings/samples arrive progressively; synthetic real-ID local/dev fixtures support planning now. No AWSdev loading now.
- Requirements and architecture settled before UX; full UX and end-to-end baseline approved before application implementation.

## Decision order

| Card | Decision | Dependencies | Status |
| --- | --- | --- | --- |
| [ARC-01](#arc-01) | Source rights and full-budget feasibility | First | A selected; evidence pending |
| [ARC-02](#arc-02) | Ledger, imports and write ownership | ARC-01 | A selected; evidence pending |
| [ARC-03](#arc-03) | Durable workflow orchestration | ARC-02 | B selected; evidence pending |
| [ARC-04](#arc-04) | ML training and serving execution | ARC-01, ARC-03 | A selected; evidence pending |
| [ARC-05](#arc-05) | Forecast experiments, probability calibration and recommendations | ARC-01, ARC-02, ARC-04 | Owner answer pending |
| [ARC-06](#arc-06) | Anthropic route, memory, cache and batch boundaries | ARC-03, ARC-05 | Owner answer pending |
| [ARC-07](#arc-07) | Identity, session recovery and action-bound step-up | ARC-02, ARC-06 | Owner answer pending |
| [ARC-08](#arc-08) | Admin scope, audit integrity, retention and recovery | ARC-02, ARC-03, ARC-07 | Owner answer pending |
| [ARC-09](#arc-09) | Guardrails and evaluation harness | ARC-05, ARC-06, ARC-07, ARC-08 | Owner answer pending |
| [ARC-10](#arc-10) | Client rendering and shared contracts | ARC-02, ARC-07, ARC-08, ARC-09 | Owner answer pending |
| [ARC-11](#arc-11) | Environment isolation, region, compatibility and whole-system recost | ARC-03, ARC-04, ARC-06, ARC-07, ARC-09, ARC-10 | Owner answer pending |
| [ARC-12](#arc-12) | Architecture and phase-document freeze | ARC-01, ARC-02, ARC-03, ARC-04, ARC-05, ARC-06, ARC-07, ARC-08, ARC-09, ARC-10, ARC-11 | Owner answer pending |

<a id="arc-01"></a>
## ARC-01 — Source rights and full-budget feasibility

Which source-rights resolution route should anchor the v1 capability and cost matrix?

**Owner answer: A selected on 2 November 2026 — keep Yahoo/Grow, verify uses and investigate documented gaps; consider Twelve Data Basic/Free for dev.** Coverage, rights and complete cost evidence remain pending. This is a direction decision, not activation or full architecture approval. Dependencies: none.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. Keep Yahoo/Grow candidates with explicit per-use gates (Recommended)** | Retain the requested source mixture as candidates. Obtain written clarification of storage, derived features, historical training/non-display, LLM transmission and display rights for each use/listing. Plan source adapters and daily/unavailable states now; activate no unsupported use. | Preserves the preferred providers and the £100 ceiling, but some forecasting capabilities may remain gated if Grow cannot supply the required rights within budget. |
| **B. Compare licensed alternatives before fixing the source plan** | Research alternative licences/quotes for the missing named uses alongside Yahoo/Grow, without subscribing. Present any change in source or promised scope for owner approval within the same £100 ceiling. | Adds procurement/research effort but may resolve training rights and cross-market coverage sooner; no new paid source or larger budget is approved by the choice. |

Evidence: FC-01, FC-03, FC-15, CT-13, PL-13 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://twelvedata.com/pricing), [source 2](https://twelvedata.com/terms), [source 3](https://github.com/ranaroussi/yfinance), [source 4](https://fred.stlouisfed.org/docs/api/fred/series_observations.html), [source 5](https://otexts.com/fpp3/toolbox.html), [source 6](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api), [source 7](https://aws.amazon.com/cloudwatch/pricing/).

**Before UX:** Choose the rights-resolution route and document target versus eligible capabilities for US/UK/India; keep every agreed horizon and import method represented.

**Before build:** Approve adapter contracts, minimum data/history semantics, point-in-time provenance, conservative recurring costs and unsupported-state acceptance cases.

**Before activation:** Verify actual account/tier/exchange rights and applicable licences for each enabled use; recost subscriptions, FX/tax, Claude, AWS, evals and reserve. If infeasible, return to the owner rather than silently cutting scope.


<a id="arc-02"></a>
## ARC-02 — Ledger, imports and write ownership

Which persistence boundary should the detailed ledger/import specification adopt?

**Owner answer: A selected on 2 November 2026 — DynamoDB + S3, with one controlled write service.** Integrity, access-pattern and recovery proofs remain open; this is not full architecture or build approval. Dependencies: ARC-01.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. DynamoDB with staged immutable imports (Recommended)** | Keep the preferred DynamoDB operational core and encrypted S3 originals. One application write service owns ledger changes, audit/outbox and owner-approved commit visibility; agents may create typed drafts but never commit financial records directly. Define access patterns and large-import staging before keys. | Fits the requested serverless stack, but all readers/projections must honour the same commit marker and investigation queries need explicit indexes. |
| **B. Relational ledger with AWS serverless services around it** | Keep S3, Lambda and the same draft/approval/write-service ownership, but compare a managed relational ledger for financial transactions and query-intensive audit. Select it only after its AWS cost and connectivity fit are accepted. | Simplifies some multi-row/query invariants but adds connection, network and recurring-cost concerns. This explicitly changes the preferred storage direction and may fail the budget fit. |

Evidence: PL-08, CT-02, CT-03, FC-10 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html), [source 2](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html), [source 3](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html), [source 4](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html), [source 5](https://support.microsoft.com/en-gb/excel/functions/xirr-function).

**Before UX:** Choose the persistence direction and approve the domain/write boundary under existing MP-12.

**Before build:** Specify financial precision, XIRR/root/FX/cash-flow conventions, duplicate identity, concurrent corrections, atomic audit/outbox and import visibility including beyond DynamoDB transaction limits.

**Before activation:** Run approved crash/replay/restore proofs and reconcile staged or orphaned objects before real ledger data is accepted.


<a id="arc-03"></a>
## ARC-03 — Durable workflow orchestration

Where should long-lived import, training, approval and recovery workflow state be defined?

**Owner answer: B selected on 2 November 2026 — Lambda Durable Functions with Python workflows.** The owner reaffirmed Durable Functions primary after the FastAPI/hybrid discussion; ordinary Lambda hosts FastAPI and no Step Functions is added initially. The owner choice supersedes the original Step Functions recommendation; compatibility, replay, cost and recovery evidence remain open. Dependencies: ARC-02.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. Step Functions Standard (Recommended)** | Use a small set of explicit cross-service state machines for import and train/evaluate/approve flows; SQS buffers work and Scheduler provides clocks. Store opaque evidence references in workflow state. | Matches visual/admin investigation and native SageMaker joins; state-transition/history charges and state-machine contracts need costing. |
| **B. Lambda Durable Functions** | Use checkpointed Python workflow code with durable steps/waits and typed continuation references. Keep queue, idempotency and external ambiguity contracts equivalent. | Keeps orchestration beside business logic, but runtime/container/SDK/region fit, replay discipline and inspection experience need explicit evidence. |

Evidence: PL-05, PL-06, CT-02, CT-14 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html), [source 2](https://docs.aws.amazon.com/prescriptive-guidance/latest/lambda-event-filtering-partial-batch-responses-for-sqs/best-practices-partial-batch-responses.html), [source 3](https://docs.aws.amazon.com/scheduler/latest/UserGuide/configuring-schedule-dlq.html), [source 4](https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html), [source 5](https://docs.aws.amazon.com/lambda/latest/dg/durable-supported-runtimes.html), [source 6](https://docs.aws.amazon.com/lambda/latest/dg/with-step-functions.html), [source 7](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html), [source 8](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html), [source 9](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html).

**Before UX:** Select one primary orchestrator and agree accepted/pending/approved/executing/failed/reconcile-required/cancelled state meanings.

**Before build:** Approve retries, leases, ordering, scheduler-versus-worker DLQs, side-effect ambiguity, stale approvals, cancellation and retention. Verify packaging support rather than equating managed-runtime listings with all container support.

**Before activation:** Exercise duplicate delivery, crash boundaries, expired approvals and denied cross-environment replay; no exactly-once external-call claim.


<a id="arc-04"></a>
## ARC-04 — ML training and serving execution

Which bounded AWS execution approach should carry the same scientific protocol?

**Owner answer: A selected on 2 November 2026 — selective SageMaker CPU training/evaluation with approved portable Lambda inference.** Compatibility, resources, scientific eligibility and full cost proofs remain open. Dependencies: ARC-01, ARC-03.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. Selective SageMaker training, portable serving (Recommended)** | Use capped on-demand CPU SageMaker candidate training/evaluation where its managed evidence is useful; export approved artefacts for Lambda inference and store daily forecast results. Keep no always-on endpoint by default. | Follows the requested SageMaker direction while limiting idle cost; container/job setup and artifact compatibility still need proof. |
| **B. Bounded portable AWS training jobs** | Use reproducible Lambda jobs while within resource limits and a bounded AWS container job when they are exceeded; keep artefact registry/evidence in the same contracts. Revisit SageMaker only when its operational benefit is demonstrated. | Can reduce service surface for a small dataset, but the project must own more job lifecycle and experiment-evidence plumbing. |

Evidence: PL-07, FC-05, FC-09 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://docs.aws.amazon.com/sagemaker/latest/dg/hosting-faqs.html), [source 2](https://docs.aws.amazon.com/sagemaker/latest/dg/serverless-endpoints.html), [source 3](https://otexts.com/fpp3/toolbox.html), [source 4](https://scikit-learn.org/stable/modules/calibration.html), [source 5](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf).

**Before UX:** Choose the execution direction and separate training, calibration, inference and serving responsibilities.

**Before build:** Approve job caps/cadence, artifact format, model/data/version record, resource envelopes and workflow cancellation/recovery; keep exact model counts evidence-based.

**Before activation:** Benchmark representative approved workloads and full cost. If Serverless Inference is considered, explicitly handle its VPC/network-isolation/data-capture/Model-Monitor exclusions.


<a id="arc-05"></a>
## ARC-05 — Forecast experiments, probability calibration and recommendations

How broadly should the first scientific qualification programme search for an edge?

**Owner answer: pending.** Dependencies: ARC-01, ARC-02, ARC-04.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. Baselines first, bounded challengers (Recommended)** | Freeze task/horizon/known-at/outcome contracts first. Establish rules, historical/risk and simple linear/logistic baselines, then qualify a bounded gradient-boosted/quantile challenger and individually justified news/pattern/analog factors. | Gives clearer incremental-value and leakage evidence within the budget; advanced modules may stay in shadow or unavailable longer while outcomes mature. |
| **B. Qualify the wider feature/model set together** | Evaluate regime, risk, analog/event, boosted/quantile and bounded LLM-derived/pattern feature candidates in the initial programme using a predeclared search budget and identical strict temporal validation. | May discover useful interactions earlier, but increases data needs, selection bias controls, experiment cost and the explanation burden. |

Evidence: FC-02, FC-04, FC-05, FC-06, FC-07, FC-08, FC-09, FC-11, FC-12, FC-13, FC-14, FC-16, CT-15 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://otexts.com/fpp3/toolbox.html), [source 2](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html), [source 3](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf), [source 4](https://scikit-learn.org/stable/modules/calibration.html), [source 5](https://jmlr.org/papers/v25/22-1218.html), [source 6](https://www.nber.org/papers/w10483), [source 7](https://www.nber.org/papers/w11468), [source 8](https://otexts.com/fpp3/judgmental.html), [source 9](https://fred.stlouisfed.org/docs/api/fred/series_observations.html), [source 10](https://twelvedata.com/terms), [source 11](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks), [source 12](https://inspect.aisi.org.uk/scoring.html).

**Before UX:** Choose experiment breadth; approve target/interval/risk meanings and the distinction between rule strength, calibrated probability, preference ranking and scenario. Keep agreed horizons and confirmed 35/40/25 ranking weights unchanged.

**Before build:** Approve horizon-specific folds/purge, data vintages, benchmark/cash-flow/FX conventions, calibration/proper losses, ablations, multiple-testing/search limits, sparse evidence and action eligibility. No new threshold is implied by either option.

**Before activation:** Use mature independent outcomes and prospective shadow where historical contamination cannot be bounded; present evidence for owner model promotion. Define any safety-disable/rollback authority separately.


<a id="arc-06"></a>
## ARC-06 — Anthropic route, memory, cache and batch boundaries

How should Claude responsibilities be packaged while retaining the agreed direct SDK loop?

**Owner answer: pending.** Dependencies: ARC-03, ARC-05.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. Shared bounded runner with scoped task routes (Recommended)** | Use one typed Anthropic client-runner library with a small evaluated task-route catalogue and per-route context/tool/cost/eval policy. Keep deterministic analyst/grader/budget/ops responsibilities explicit; use Haiku/Sonnet classes only where justified. | Reduces duplicated loop/policy code, but route isolation, tool narrowing and memory scope must be tested carefully. |
| **B. Separate task workers using the same runner library** | Package research/extraction/explanation routes into independent Lambda workers with distinct IAM and queues, while reusing the same SDK/policy/evidence library and model-class evaluation. | Provides stronger deployment/permission separation, but adds queue, configuration, monitoring and release joins for a personal app. |

Evidence: PL-02, PL-03, CT-07, CT-08, CT-09, CT-12, CT-15, FC-13 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [source 2](https://platform.claude.com/docs/en/build-with-claude/batch-processing), [source 3](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api), [source 4](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks), [source 5](https://inspect.aisi.org.uk/scoring.html), [source 6](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention), [source 7](https://twelvedata.com/terms), [source 8](https://fred.stlouisfed.org/docs/api/fred/series_observations.html), [source 9](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf).

**Before UX:** Approve the role/route catalogue and public/private outbound-context boundary; nine logical responsibilities do not become nine LLMs by default.

**Before build:** Pin evaluated models/prompts/tools/effort, claim-grounding and fail-closed policy. Specify sourced/tainted/revisable memory, cache eligibility/economics and deadline-aware batch item reconciliation.

**Before activation:** Verify permitted provider handling and actual credit. Immediate alerts and fresh 07:30 briefing delivery must not depend on a newly submitted batch; no automatic paid fallback or cache warming.


<a id="arc-07"></a>
## ARC-07 — Identity, session recovery and action-bound step-up

Which server-verifiable fresh-authentication path should protect sensitive owner actions?

**Owner answer: pending.** Dependencies: ARC-02, ARC-06.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. Cognito assurance-based step-up where supported (Recommended)** | Design sensitive actions around Cognito server-verified authentication freshness/assurance claims and an action-bound challenge, subject to current plan/region/rollout support. Use an explicitly verified fresh-sign-in path when that assurance capability is unavailable. | Can give a clearer assurance contract, but actual feature availability and Apple/Google/passkey behaviour must be validated before the UX promises it. |
| **B. Fresh managed sign-in for each protected action class** | Start with an explicit Cognito managed-login reauthentication sequence, verified server-side and bound to the exact action/environment/payload/expiry; add richer assurance-level policy later. | Simpler initial feature dependency, but may require more sign-in interactions and still needs proof of freshness rather than token refresh alone. |

Evidence: PL-09, CT-01, CT-02, CT-17 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html), [source 2](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation-consolidate-users.html), [source 3](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html), [source 4](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html).

**Before UX:** Choose the protected-action mechanism under MP-11 and approve sensitive-action classes, verified account linking and recovery journeys. Apple, Google, passkeys and the agreed recovery redundancy remain required in both options.

**Before build:** Define cookie/CSRF versus native PKCE/secure-storage boundaries, account linking by verified control, session/device revocation and approval payload/version binding. Local biometric unlock alone grants no server authority.

**Before activation:** Verify actual Cognito feature compatibility and exercise lost-device, final-method unlink, stale approval, revoked session and cross-environment token cases.


<a id="arc-08"></a>
## ARC-08 — Admin scope, audit integrity, retention and recovery

How much administration depth should be specified for the first UX baseline?

**Owner answer: pending.** Dependencies: ARC-02, ARC-03, ARC-07.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. All admin domains with a defined launch minimum (Recommended)** | Specify Files/Imports, Audit, Runs/Health, Agents/Models/Evals, Approvals/Config, Costs/Budgets, Incidents/Recovery and Identity/Devices now. Within each, identify required launch controls and later investigation depth; preserve full traceability from the first useful layer. | Makes the whole structure explicit before UX while keeping the initial screen/action set bounded. Detailed later controls remain tracked rather than silently dropped. |
| **B. Full investigation and administration UX before first build** | Design all identified admin investigation, comparison, recovery and configuration workflows as part of the initial complete UX baseline, then phase their implementation. | Provides more end-to-end interaction detail up front, but lengthens UX preparation and requires resolving more policies before product work can start. |

Evidence: CT-03, CT-04, CT-05, CT-14, CT-16, CT-18, PL-12 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html), [source 2](https://platform.claude.com/docs/en/build-with-claude/batch-processing), [source 3](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention), [source 4](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html), [source 5](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html), [source 6](https://inspect.aisi.org.uk/scoring.html), [source 7](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html), [source 8](https://aws.amazon.com/cloudwatch/pricing/).

**Before UX:** Approve domain/navigation/action boundaries, the privileged threat model and minimal protected evidence. Keep confirmed 24-month renewable original archive, owner deletion, telemetry retention and monthly/change-triggered exercises unchanged.

**Before build:** Resolve record-class retention/deletion, S3 versions/derivatives/provider copies/training data/labels/backups, restore tombstones, audit integrity claims, RPO/RTO, replay authority and separate financial-versus-operational alert classes.

**Before activation:** Demonstrate isolated restore, reapplication of deletions, lineage integrity and denied recovery actions; verify push permission/channel behaviour and approved critical quiet-hour exceptions.


<a id="arc-09"></a>
## ARC-09 — Guardrails and evaluation harness

Which harness should organise the same required safety, regression and capability evidence?

**Owner answer: pending.** Dependencies: ARC-05, ARC-06, ARC-07, ARC-08.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. Inspect AI with typed deterministic checks (Recommended)** | Use an Inspect AI evaluation harness for tagged cases, transcripts and deterministic/model scoring, integrated with offline replays and the MP manifests. Keep runtime guardrails in application policy code, independent of the evaluation harness. | Reuses established evaluation structure and rescore workflows, but adds a dependency and requires careful privacy, budget and adapter contracts. |
| **B. Project-owned pytest-based evaluation harness** | Use typed test/replay fixtures and custom result records in the existing Python test ecosystem; implement model-judge and replay/scoring integrations explicitly. | Keeps the dependency surface smaller, but MP must maintain equivalent case taxonomy, rescoring, trial aggregation, provenance and report tooling. |

Evidence: CT-07, CT-08, CT-09, CT-10, CT-11, CT-12, FC-13, PL-11 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks), [source 2](https://inspect.aisi.org.uk/scoring.html), [source 3](https://inspect.aisi.org.uk/scoring-workflow.html), [source 4](https://platform.claude.com/docs/en/build-with-claude/batch-processing), [source 5](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention), [source 6](https://twelvedata.com/terms), [source 7](https://fred.stlouisfed.org/docs/api/fred/series_observations.html), [source 8](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf), [source 9](https://docs.github.com/en/actions/concepts/security/openid-connect).

**Before UX:** Select the harness and approve failure taxonomy, runtime policy boundaries and required unknown/refused/incomplete UI states.

**Before build:** Specify change-triggered offline T0, bounded affected-route live T1 and model/release qualification T2; choose trial counts, failure limits and judge eligibility from risk and budget rather than importing MA numbers. Human labels/uncertainty and incident-to-regression handling are explicit; predictive ML evaluation remains separate.

**Before activation:** Run live evaluations only under separately approved spend; budget exhaustion or missing evidence is incomplete, never green. Calibrated judges remain advisory until the agreed held-out evidence supports their role.


<a id="arc-10"></a>
## ARC-10 — Client rendering and shared contracts

Which web rendering boundary should the UX specifications assume?

**Owner answer: pending.** Dependencies: ARC-02, ARC-07, ARC-08, ARC-09.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. Static SvelteKit PWA plus authenticated API (Recommended)** | Use a static SvelteKit shell on private S3/CloudFront and explicit authenticated API/session contracts. Keep Swift/SwiftUI surfaces and native cache/device responsibilities within the agreed RN navigation/typed-bridge shell. | Fits the low-idle-cost plan and clear backend boundary, but private page data, offline handling and session checks must be designed explicitly rather than assumed server-rendered. |
| **B. SvelteKit server rendering on an AWS runtime** | Add an AWS-hosted SvelteKit server for approved server-rendered/session use cases while retaining FastAPI as the domain API and the same Swift/RN ownership. | Can support server-side rendering and session flows directly, but adds a runtime, deployment/security joins and cost to justify. |

Evidence: PL-04, PL-14, FC-16, CT-16, CT-17, CT-18 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://docs.aws.amazon.com/apigateway/latest/developerguide/response-transfer-mode.html), [source 2](https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html), [source 3](https://svelte.dev/docs/kit/adapter-static), [source 4](https://otexts.com/fpp3/toolbox.html), [source 5](https://otexts.com/fpp3/judgmental.html), [source 6](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html), [source 7](https://inspect.aisi.org.uk/scoring.html), [source 8](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html).

**Before UX:** Select rendering mode and freeze typed API/event/action/error/proof contracts plus supported web/Apple device capabilities, including a precise interpretation of Duo. Both options retain SvelteKit3 and Swift/SwiftUI+RN as requested.

**Before build:** Define offline privacy/clearance, stale/unavailable/in-practice states, resumable SSE/auth refresh, service-worker/app updates, push and native bridge versioning. Separate shared contracts from separate web/native implementation stories.

**Before activation:** Verify actual browser/OS push/offline/secure-storage and accessibility behaviour on supported devices; the existing React architecture Site remains a separate documentation artifact.


<a id="arc-11"></a>
## ARC-11 — Environment isolation, region, compatibility and whole-system recost

Which environment-isolation direction should the final deployment comparison assume?

**Owner answer: pending.** Dependencies: ARC-03, ARC-04, ARC-06, ARC-07, ARC-09, ARC-10.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. One account with strictly separated dev/prod resources (Recommended)** | Compare suitable regions and start with distinct environment resources/identities/IAM/write authority in one account; customer-VPC-unattached external API Lambdas are the initial candidate. Optional private jobs get a separately justified network scope. | Reduces account administration and shared-service duplication, but same-account privileged blast radius and shared quotas require explicit controls and acceptance. |
| **B. Separate dev/prod AWS accounts** | Use separate accounts and environment-scoped OIDC deployment roles, with consolidated cost visibility and the same least-complex initial networking direction. | Stronger account-level isolation, but adds organisational setup, cross-account operations and potentially duplicated service/free-tier/cost assumptions to check. |

Evidence: PL-10, PL-11, PL-12, PL-13, CT-06, CT-13, FC-01 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html), [source 2](https://docs.github.com/en/actions/concepts/security/openid-connect), [source 3](https://docs.aws.amazon.com/lambda/latest/dg/services-xray.html), [source 4](https://aws.amazon.com/cloudwatch/pricing/), [source 5](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api), [source 6](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/), [source 7](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html), [source 8](https://twelvedata.com/pricing), [source 9](https://twelvedata.com/terms), [source 10](https://github.com/ranaroussi/yfinance).

**Before UX:** Choose the isolation direction and documented network boundaries. Keep cheapest suitable region selection evidence-based; do not inherit MA account IDs, domains, CIDRs, proxies, IaC or permissions.

**Before build:** Approve the exact compatible runtime/SDK/adapter/framework/architecture matrix and one IaC tool, immutable artifact promotion, vulnerability exceptions, rollback and offline/live gate selection. Reprice baseline/stress including active stream hours, reads, telemetry cardinality, trials, backups and collectors.

**Before activation:** Verify actual region availability, service quotas, pricing, entitlements and credit scope; obtain deployment authority separately. If any choice fails compatibility or the £70 operating envelope plus £30 reserve, reopen the affected decision before proceeding.


<a id="arc-12"></a>
## ARC-12 — Architecture and phase-document freeze

Which canonical documentation structure should be the approved handoff into UX?

**Owner answer: pending.** Dependencies: ARC-01, ARC-02, ARC-03, ARC-04, ARC-05, ARC-06, ARC-07, ARC-08, ARC-09, ARC-10, ARC-11.

| Option | Approach | Impact and trade-off |
| --- | --- | --- |
| **A. Architecture areas plus linked phase pages and story catalogue (Recommended)** | Follow MA's useful organisation: one architecture map; detailed domain/technical area specs and journeys; a decision/contract register; one phase page per MP layer; and individual stories linked to sources, contracts, cases and planned UX states. | Keeps reusable architecture decisions in one place while making each phase complete and navigable. Links and versioned publication receipts need disciplined maintenance. |
| **B. Phase-contained specifications with a shared contract register** | Make each MP phase page the main reading unit containing its relevant architecture, journey and acceptance detail; keep cross-phase contracts/ADRs central and link repeated concepts rather than copy them. | Provides a phase-by-phase reading path, but cross-cutting admin/security/eval requirements need especially careful ownership and cross-phase consistency checks. |

Evidence: PL-01, FC-16, CT-16, PL-11 in [forecasting](lanes/forecasting.json), [controls](lanes/controls.json) and [platform](lanes/platform.json).

Primary sources: [source 1](https://otexts.com/fpp3/toolbox.html), [source 2](https://otexts.com/fpp3/judgmental.html), [source 3](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html), [source 4](https://inspect.aisi.org.uk/scoring.html), [source 5](https://docs.github.com/en/actions/concepts/security/openid-connect).

**Before UX:** Approve one phase/dependency map and document ownership/naming; every gap has a disposition, owner and explicit deferred activation condition. Architecture decisions are either answered or clearly block the freeze. No UX starts merely because this packet exists.

**Before build:** Create/read back approved phasewise MP Confluence pages and actual Jira stories with acceptance criteria, source/contract/test/UX links, dependencies and readiness labels. Inspect referenced rich visuals before accepting them as UX specifications. Preserve historical docs and superseded IDs.

**Before activation:** After separately approved complete UX/prototype and all layer/release evidence, obtain implementation and later deployment/spend authority. Documentation, Jira Done and diagram publication alone never certify a working system.

## Recording an answer

Record card ID, selected option, owner wording/date, affected ADR/spec/story references and unresolved parameters. A conditionally accepted direction is not a clean architecture freeze: list the exact condition and which next gate it blocks. If new rights, compatibility or pricing evidence invalidates the choice, reopen that card and its dependent contracts before further UX/build work.

Selecting these options does not authorise a deployment, paid call, model promotion, data change, PR or implementation. Independent review has not run on this packet.

## Expanded source-issue scope decisions

The later 299-issue pass adds IR-01 under ARC-12: explicitly decide whether usage-based presentation personalisation belongs in MP; stable owner-configurable ordering is the default recommendation. If approved later, specify consent, reset, retention and a strict separation from forecast/ranking/alert-policy changes. IR-02 joins ARC-02: decide owner export formats and optional file interchange; no MA retirement, resource transfer or live dependency is implied. These are scope decisions, not adopted features. CD-01/02 add the source/story/visual evidence gates to ARC-12.
