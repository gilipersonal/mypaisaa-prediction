# MA concepts reconciled with MP requirements

**MP-19 · 2 November 2026 · Researched planning proposals · Independent review not run**

MP should adopt useful concepts, evidence practices and documentation structure from MA, then make its own architecture decisions against the owner's discussions and current primary sources. This report does not approve the architecture, certify every embedded visual, select a vendor tier or authorise implementation.

## Scope and evidence

The live MA Confluence page inventory contains **83 current pages**. All have a full-HTML source read and an explicit disposition in [source coverage](source-coverage.json). The three specialist maker lanes cover 49 pages; the coordinator covers the remaining 34. Source versions and content hashes are recorded. Four additional web/Apple board sources were inspected for control/state semantics; native image pixels and animation frames were not comprehensively rendered.

Pagination of non-page results returned 280 entries: **278 attachments, one story-explorer database and the space result**. Attachment metadata is inventoried; the attachments are not all visually certified. The story explorer was read as CSV. Live MA Jira returned **299 issues**, including epics and earlier tooling work; the current repository trace has **263 phase items and 15 other items**. The [issue reconciliation](source-issue-reconciliation.md) disposes the expanded set separately from the earlier 140-description capture. Issue state is source history, not evidence that MP has implemented a feature.

Earlier MP records remain useful: 21 named MA reference pages, 140 forecasting/related stories with full descriptions, 71 additional reference-only issues and a separate 21-story audit/observability register. The new pass expands that boundary; it does not rewrite the old evidence or call a phase-level map sentence-level acceptance parity.

The three lanes supply **48 detailed contract gaps** and **44 primary-source research entries** before URL deduplication. Two coordinator gaps add documentation baseline/trace completeness and rich-source/visual evidence; the expanded issue pass adds two explicit scope decisions for optional personalisation and exports/interchange. The combined [52-gap register](gap-register.json) separates proposals from owner decisions. Gaps are mainly specification depth and evidence, not 50 missing headline features. Additional source-issue acceptance joins remain explicit in the issue reconciliation rather than silently marked complete.

## Concepts carried forward and MP-specific adaptation

| Area | MA concept worth retaining | MP adaptation and current closure |
| --- | --- | --- |
| System structure | One small codebase with clear responsibilities and both web/native doors | Stable component ownership and typed interfaces; do not copy service counts, household domains or old versions. PL-01/14; MP-20/30. |
| Anthropic | Thin tool loop, economical short-task model, eligible batch work and stable cache prefix | Direct client SDK on Lambda, Claude on Anthropic, proposed four task routes; exact IDs/limits tested and pinned. PL-02/03, FC-13, CT-07–09/15; MP-25. |
| AWS execution | Schedules, durable queues, independent workers, streaming and replay | Define job/outbox authority, at-least-once effects, ambiguous paid calls and bounded SSE; choose one cross-service workflow. PL-04–06/CT-14; MP-23. |
| ML and forecasts | F1–F8, rules alongside learned models, replay lab and outcome grading | All MP horizons retained, horizon-aware evidence, versioned targets, independent calibration and owner promotion; no fixed eight-week shortcut. FC-02–09/14–16; MP-21. |
| ML hosting | Small datasets and bounded CPU work | Compare requested selective SageMaker training with portable AWS jobs; serving is a separate choice, no automatic permanent endpoint. PL-07; MP-24. |
| Source data | Per-kind adapters, fallback and exposure-based relevance | Verify Yahoo/Grow listing coverage and exact storage/training/derived/Anthropic permissions. Rights and full price are unresolved. FC-01; MP-10. |
| Portfolio | Ledger, XIRR, look-through, benchmark and contribution context | Own standalone ledger, initial GBP overview/local detail, explicit financial formulas and eligibility; no household budget/debt expansion. FC-10–12/PL-08; MP-12/22. |
| Owner admin | Protected actions, devices, approvals, replay and settings | Owner-only action catalogue, server-verified freshness, proposal/version binding, audit and conflict states; launch minimum before UI design. CT-01–04/16–17; MP-11/13/28. |
| Guardrails | Code-first policy, quarantine, grounded figures and manifest coverage | Typed least privilege, public/private context separation and claim-type grounding with denial cases. CT-07–09; MP-25. |
| Evals | Offline change gates, online checks, sampled judges and human calibration | Independently select MP datasets, budgets, trial counts, judge eligibility and privacy; incomplete is not pass. CT-10–12; MP-26. |
| Audit/monitoring/cost | Run evidence, traces, metrics, alarms and cost attribution | Durable business evidence separate from sampled logs; reconcile delayed bills, reservations and shared credit. CT-05/06/13 and PL-12/13; MP-27. |
| Recovery/delivery | Safe bounded self-healing, deployment evidence, tests and drift | Owner-approved recovery authority and retention/deletion objectives; no copied free-tier claims or rapid rollback guarantees. MP-13/23/30. |

## What the research changes

### Data rights and money gate the shape

The current [Twelve Data pricing](https://twelvedata.com/pricing) distinguishes Grow internal display access from explicit non-display access on another tier; its [terms](https://twelvedata.com/terms) condition uses on subscription rights. That is **not a finding that MP's proposed Grow use is prohibited**. It means scheduled analytics, training, retention, derived display and transfer to Anthropic require a precise per-use entitlement check. The [yfinance library](https://github.com/ranaroussi/yfinance) does not itself grant Yahoo market-data rights.

Retain the owner-confirmed £100 all-in ceiling, £70 operation/£30 reserve, £60/75/85 forecast-cash controls and no uncovered automatic paid fallback. Reprice the entire source/compute/storage/telemetry/eval/recovery/build envelope, including relevant tax/FX assumptions. The shared reported $200 benefit is unverified. Neither MA's cost table nor a proposed diagram proves affordability. Full scope remains a requirement; present an explicit trade-off if affordability fails.

### Forecast sophistication must earn its place

A next-day task, 20-day task and 12-month task have different labels, effective evidence and eligibility. Daily refreshing does not mature outcomes or create independent samples. Long-term conditional scenarios retain assumptions separately from evaluated predictive distributions. Use transparent baselines, chronological validation, horizon-aware label purging, train-fold-only preprocessing, untouched candidate tests, experiment accounting and calibrated uncertainty. [Forecast evaluation](https://otexts.com/fpp3/toolbox.html), [probability calibration](https://scikit-learn.org/stable/modules/calibration.html), [backtest selection research](https://www.davidhbailey.com/dhbpapers/backtest-prob.pdf) and [adaptive conformal research](https://jmlr.org/papers/v25/22-1218.html) motivate the detailed FC contracts.

Rules, XIRR, portfolio facts, ML probabilities and LLM research have distinct meanings. The model catalogue counts trainable families and versioned artefacts, not logical module names or one model per ticker. LLM-derived features need prospective/point-in-time evidence and an ablation beyond narrative quality. No promise of highly accurate returns is justified by the architecture.

### Managed services have different boundaries

Official [API Gateway REST streaming](https://docs.aws.amazon.com/apigateway/latest/developerguide/response-transfer-mode.html) support does not establish Python packaging, authenticated replay or affordable polling. [SQS/Lambda](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html) is an at-least-once boundary; exactly-once business effects require an explicit design. Proposed Step Functions Standard and Lambda Durable Functions alternatives need an owner selection and compatibility/cost evidence.

[SageMaker Serverless Inference](https://docs.aws.amazon.com/sagemaker/latest/dg/serverless-endpoints.html) is not the same as private training or full Model Monitor/data-capture support. Capped CPU candidate jobs, portable inference and stored forecast serving are a recommendation, not a selected architecture. N0/N1/N1-E remain conditional network options; no NAT, endpoint, account or region is inherited from MA.

### Owner controls and evaluation privacy are architectural

[Cognito step-up assurance](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html) has plan/rollout considerations. Preserve managed sign-in, but verify actual capability, authentication freshness and action binding. Local Face ID alone cannot authorise a backend change.

Anthropic [batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing) has asynchronous timing and provider retention. AWS-private transcript storage does not mean evaluation data never leaves AWS when it is sent to Anthropic. Agree minimisation, permission, retention and batch result cleanup. LLM judges need held-out human labels and uncertainty; MA's 10% sample rate, trial counts and 0.8 threshold are research inputs, not approved MP defaults.

## What is not carried as MP scope or authority

Household income/spending budgets, loans/EMIs, policies/deposit accrual, household net-worth projection, member invitations/joint ownership and Telegram are not automatically added. Shared currency, import, confirmation, privacy and recovery concepts may be adapted without those domains. MA's app names, AWS resources, account/region, secrets paths, Terraform permissions, automatic issue closure/branch deletion and review exceptions are not copied. Its design boards remain inspiration and evidence, not selected MP screens.

Initial UK/US/India and future China/Taiwan/Hong Kong/Europe/themes remain separate compatibility/licence/cost gates. Optional UI personalisation or wider household learning needs its own explicit scope decision; self-learning investment models do not imply autonomous interface or setting changes.

## Actual MP tracking and preparation

Eleven new **planning tasks** MP-20–MP-30 carry the grouped closure contracts; existing MP-10–MP-13 receive current reconciliation evidence without overwriting their historical descriptions or changing status. [Jira receipt](jira-receipt.json) records actual results. MP-19 tracks this reconciliation and remains open. No implementation task is marked complete.

The [ten phase specifications](phases) retain PH-00–PH-09 and compile **64 local story drafts**: 16 more detailed import drafts and 48 umbrellas. Each shows contracts, dependencies, open gaps, acceptance and future UX states. Their actual implementation Jira keys remain unallocated. Detailed decomposition and real issue creation are required before the pre-UX phase/story gate; the new planning tickets do not stand in for that work.

Thirteen substantive Confluence page bodies are prepared locally: reconciliation, architecture sign-off, documentation structure and one page for every phase. They target the existing MP hubs and do not replace rich content. The [publication proposal](confluence-publication-proposal.json) is **not applied**. Existing Confluence and Lucid/Site snapshots remain unchanged by this reconciliation. Native MP diagrams stay proposed until choices are settled and corresponding exports are updated.

## Owner direction recorded after this research

On 2 November 2026 the owner selected ARC-01 option A: retain Yahoo/Grow as preferred candidates, verify each use and investigate alternatives for documented gaps. Rights, listing coverage and full-budget evidence remain pending; no gap is closed by selecting this direction. See the [decision log](decision-log.md). The owner chose to retain drafts and discuss decisions before review/publication/PR.

ARC-02 subsequently selected DynamoDB + S3 and one controlled backend financial write service. Exact financial/approval/query/import/recovery contracts remain open; the owner has not approved the complete architecture.

ARC-03 subsequently selected Lambda Durable Functions with Python workflows, superseding the maker Step Functions recommendation. SQS/Scheduler/business-record boundaries remain; runtime/replay/external-effect/cost evidence stays open.

## Recommended path to a settled architecture

1. **Feasibility:** resolve the source-use matrix and all-in operating envelope first.
2. **Contracts:** settle portfolio/task/approval ownership, financial and forecast semantics, data/API/event states and environment boundaries.
3. **Architecture decisions:** choose workflow/ML/serving/client/network approaches from researched options, then pin supported versions and update ADRs/diagrams.
4. **Operating and scientific policies:** approve guardrails/evals, learning/promotion, audit/retention/recovery and conservative spend controls.
5. **Detailed phase plan:** decompose the 48 umbrellas and every relevant source acceptance, create actual phase-linked implementation stories, and publish reconciled area/phase documents with readiness evidence.
6. **Architecture/plan sign-off:** approve exact baseline revision, conditional activation prerequisites and the complete phase/story structure. No UX starts while a UI-shaping decision remains open.
7. **UX:** design locally across PWA/Apple/admin, all normal/error/permission/privacy/offline states and the end-to-end prototype. Obtain complete UX approval.
8. **Build permission:** ask separately to start the approved implementation plan. Individual live models still need evidence and owner promotion later.

The [decision cards](decision-cards.md) give two options and a recommendation for each material choice. The [finalisation sequence](architecture-finalisation.md) explains the evidence and approval boundary. Structure can be agreed now; choices requiring owner answers or rights/compatibility proof remain visibly open.

## Review and validation status

This was a four-thread maker research exercise, not independent review. Maker checks validate inventories, reference joins, phase graph, local links and publication payloads; they do not establish licence rights, cloud viability, forecast performance, device compatibility or owner approval. Independent review and publication/PR choices remain separate end-of-work decisions. No application code, live data/model calls, AWS resources or MA records were changed.
