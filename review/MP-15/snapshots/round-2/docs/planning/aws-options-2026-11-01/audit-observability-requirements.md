# S3 evidence, admin auditing, observability and cost monitoring

**Confirmed product scope with proposed implementation details · MP-15 · 1 November 2026**

The market/discovery dashboard is the first screen. **Claude API usage/cost and AWS cost by environment are priority dashboard features**, not information available only through the AWS console or a future admin page. The admin portal adds detailed investigations and owner controls. Original uploads are retained in encrypted private S3 storage with configurable retention and owner deletion controls. No AWS resources, collectors, dashboards or instrumentation are being deployed by this requirements document.

[Working PRD](product-requirements.md) · [Decision register](product-decisions.json) · [Architecture options](README.md) · [MA observability reference](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1671230)

## 1. Cost monitoring directly on the application dashboard

The landing dashboard must show an always-accessible cost summary, with an environment selector and a combined project view. A full cost view is reachable without leaving the app. Support dev/prod attribution and local agent/API usage; display shared/evaluation costs explicitly rather than forcing them into an arbitrary environment.

| Dashboard area | Required information |
| --- | --- |
| **Claude usage and cost** | Today/cycle totals, gross estimated usage value, provider-reported cost, input/output/cache tokens, requests, batch/tool usage, credit consumed/remaining where verifiable, and actual or estimated cash liability |
| **Environment breakdown** | Dev, prod and local usage; evaluation purpose/workspace; shared/unallocated costs; attribution method and confidence. Local compute is distinct from API calls made from the Mac. |
| **Agent/feature/model breakdown** | Chat, research, briefing, news, extraction, memory, evaluations and other enabled features; per-agent/model usage, top consumers, retries, failures and cache efficiency |
| **AWS** | Month-to-date costs and period trend by environment and service; training/compute/storage/telemetry/build costs; reported-versus-estimated status and forecast where supported |
| **Budget health** | The £100 project cash ceiling, proposed environment/feature allocations, user-reported $200 Anthropic credit, burn rate, pending reservations, headroom, renewal/reset dates and threshold status |
| **Investigation** | Drill from a cost spike to runs, model/tool calls, dataset/import jobs and releases; show why usage increased rather than just a total |
| **Freshness and availability** | Source, covered period, last refreshed time, estimate/reported/reconciled label, collector health and any missing allocation. Missing or stale data is never displayed as a fresh zero. |

**Two time scales:** the application's per-request usage ledger provides low-latency estimates and admission control; provider billing provides delayed reconciliation. Do not call estimated cost a final bill or promise instantaneous AWS charges. An alert may use the live usage estimate while reporting the age of the latest provider figure.

AWS Cost Explorer refreshes at least daily, with some upstream data arriving later, and its paginated API requests have a charge. Collect/copy the required scoped results on a bounded server schedule and cache them; opening or refreshing the dashboard must not make a paid billing API request per browser refresh. Include collection, query, telemetry and storage costs in the budget being monitored. [AWS Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html)

For direct Anthropic reporting, assess the current Usage and Cost Analytics API for the selected account. It provides workspace/model/key dimensions and a freshness timestamp; current documentation allows substantial reporting delay and revisions. It is not a real-time credit-balance API merely because it reports usage/cost. Use request usage metadata for the immediate view and preserve provider report version/covered-through time for reconciliation. [Anthropic analytics API](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api)

### Credit, cash and environment accounting

- **One credit pool:** the stated $200 is an account benefit, not $200 per environment. Anthropic states that keys and workspaces in the linked organization share the balance. Other apps in that organization can consume it; distinguish this project's allocation from organization-wide remaining credit. [Credit programme](https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers)
- **Different cycles:** display the credit grant/expiry cycle separately from calendar-month budgets or invoice periods. Do not silently reset them on the same day.
- **Different money measures:** retain gross list-price estimate, any provider discounts, reported usage cost before/after credits as actually available, credit applied, purchased-credit use and cash charges as separate fields. Unknown credit/cash attribution is labelled unknown or estimated.
- **Per-environment evidence:** map dedicated project workspaces/keys and resource tags/accounts to known environments where possible. Internal run metadata supplies finer local/agent/feature attribution; it is not falsely described as provider-certified detail when a workspace is shared.
- **No double counting:** environment, feature, model and agent are views of the same usage. A request may have one billed parent and child allocations, not a separate bill for every nested span. Reconcile batches, retries, pending/ambiguous requests and late reports idempotently.
- **Shared costs:** DNS, shared builds, storage, monitoring and other shared services have a disclosed allocation rule or remain shared/unallocated. Tagged costs do not necessarily equal the entire bill. Verify tag activation, available backfill, tax, credits and report scope when implementing the collector.
- **Currency:** preserve native USD amounts and price-table version, with GBP display using a dated exchange-rate assumption/source and explicit tax treatment. Do not overwrite the original amounts when FX display changes.
- **Authority:** collection runs server-side with narrowly scoped billing/reporting authority. Neither browser clients nor normal research agents receive elevated billing credentials or permission to raise budgets. Detailed authorization and credential setup are later implementation decisions under the project's secret-handling policy.

The earlier proposed $120 prod/$15 dev/$30 live-evals/$5 judges/$30 reserve allocation is a reviewable budget proposal, not a provisioned limit or proof that credit is available. Hard stop/degradation decisions use conservative reserved usage plus known liabilities, because billing is delayed. No automatic paid fallback is implied when promotional credit is unavailable.

## 2. S3 originals and complete upload lineage

Retain original statements, CSV/Excel files, PDFs, factsheets and screenshots before parsing. Use private encrypted storage separated by environment and owner, with stable document IDs, object version/checksum references and no publicly exposed object keys. Exact bucket/key names and account/region are not selected by this requirement.

Every upload, including failed or rejected processing, has a document lifecycle record: received, checked/quarantined, rejected or accepted, parsed/extracted, awaiting owner review, committed, corrected/superseded, reprocessed, retained or deleted. Record what failed; do not report an upload as applied merely because S3 accepted bytes.

| Lineage stage | Required evidence |
| --- | --- |
| Upload | Document/upload ID, original name/type/size in protected metadata, checksum, S3 version reference, uploader/owner/environment, client channel, upload/received times and duplicate detection result |
| Validation/extraction | Validation results, scanner/parser/extractor version, model/prompt version if used, confidence and source page/row/cell references, run/trace ID and error/retry state |
| Review and commit | Import/draft ID and hash, previewed additions/changes/rejections, owner confirmation or cancellation, commit time, affected records/events and audit transaction references |
| Update/correction | Before/after or an immutable revision reference, effective time versus recorded time, actor, reason, source document/version, previous/superseding event, rollback/reversal linkage |
| Reprocessing | New parser/model/config versions, comparison with prior extraction, changed proposed values and fresh confirmation where changes would affect the ledger |
| Retention/deletion | Owner action or retention rule/version, requested/completed status, S3 object versions and derived copies covered, failures and minimal tombstone/audit evidence according to the agreed privacy policy |

S3 upload and DynamoDB application commits are not one distributed transaction. Use durable status transitions, idempotent handlers and reconciliation for orphaned objects, missing metadata, duplicate callbacks and partial processing. Financial record changes and their audit/outbox events must satisfy the ledger's atomicity invariants. The same file imported twice must not duplicate transactions.

Original objects are not silently overwritten. Owner corrections create new record events; a corrected original file is a new document version with its own checksum. Opening a source from the portal or chat requires current owner authorization and a short-lived access path; record the access event. The exact link lifetime remains a proposed default.

**Retain does not mean irreversible lock.** The confirmed policy includes configurable retention and owner deletion. S3 versioning may retain older versions after a delete marker; deletion must have explicit semantics for versions, extracted data, caches and backups. Do not turn on an irreversible retention lock or silently copy MA's “keep forever, no expiry” rule. Preserve the non-sensitive audit trail according to an agreed policy while respecting deletion of sensitive source content. No autonomous agent deletes originals.

## 3. The admin portal and in-app Activity/Audit views

The owner plans to design the admin portal. These requirements provide its evidence and operations scope; they do not choose its final screens or authorize UI implementation now.

1. **Uploads and Files:** list/filter by time, owner/environment, type, instrument/import and status; inspect originals, checksums/versions, extraction and every affected change; compare reprocessing; retry or resolve failures under owner controls.
2. **Audit:** searchable append-only record-change and approval timeline, before/after, actor, source and reason; link file → import → record revision → forecast/recommendation affected by that revision.
3. **Activity:** scheduled/user/system runs, status, duration, agent/tool/model calls, evidence read, outputs proposed/delivered, guardrail/eval results, usage and costs; last/next schedule and data freshness.
4. **System health:** per-environment services, dependencies, errors/throttles/latency, queue age/DLQ depth, schedule/heartbeat lateness, stream/push/client issues and recovery status.
5. **Agents and model quality:** agent manifests and versions, allowed tools, prompt/model versions, evaluation/guardrail results, drift/calibration/forecast outcomes, candidates and owner promotion decisions.
6. **Costs and budgets:** the dashboard summary plus complete attribution/reconciliation/collector state; approved budget policies and alerts, reservations and spending-stop history.
7. **Incidents and recovery:** cause/evidence, original and replay run/trace, attempts, idempotency outcome, owner escalation, approved recovery action and resolution/OK notification.
8. **Security and controls:** device/session events, denied access, protected operations, settings/config versions, owner approvals/rejections/expiry, retention and deletion status. No portal control bypasses server authorization.

Sensitive actions are explicit, server-verified owner actions: replay, reprocessing that changes records, source deletion, budget/settings changes, model promotion or rollback outside an approved automatic safety policy. Viewing costs/audit is separate from permission to change them. Environment banners and target checks prevent operating on prod while investigating dev.

## 4. End-to-end traceability across the whole system

The aim is a complete logical chain for every meaningful action, not an unsupported promise that every third-party internal operation exposes a span. Link web/Apple client action → API → queue/workflow → worker/agent/model/tool → storage/evaluation → stream/push → observed client result. Do the same for scheduled ingestion, features, training, inference, grading, imports, releases and alarms.

Use stable business IDs (`document_id`, `import_id`, `prediction_id`, `model_version`, `config_version`, `client_message_id`, `conversation_id`, `job_id`) plus correlation IDs (`run_id`, `trace_id`, `span_id`, `request_id`, parent/retry/replay ID), environment, build/image revision and client/app version. Propagate context explicitly where required, with linked traces for asynchronous continuations/replays rather than pretending every workflow must fit one indefinitely open span. Validate actual API Gateway/SQS/Step Functions/OTel propagation during implementation; do not assume it works automatically.

Every run has durable accepted/started/heartbeat/terminal or recovered state. Timeouts and process death must leave an observable incomplete/failed run through a reconciler/watchdog; relying only on a successful final write loses the failures most worth investigating. Capture exception class and bounded diagnostic metadata without copying financial content into logs.

Per model call: requested/responded model, provider response ID, prompt/tool/schema versions, token categories, cache behaviour, batch/service tier, elapsed/first-token time, stop/refusal/fallback reason, estimated/gross usage cost and reconciliation state. Per tool: validated tool name/version, scoped resources/evidence references, policy decision, duration, retries, outcome, error class and input/output sizes. Protected input/output content belongs only in authorized evidence storage, not generic spans.

For Anthropic, trace the application's request/response boundary and returned identifiers/usage. This does not expose Anthropic's private model internals or require storing hidden chain-of-thought. Explainable evidence and decision rationale are distinct from internal reasoning traces.

## 5. MA monitoring coverage carried here

The MA design's three surfaces remain: in-app Activity/Audit and cost views; operator dashboards/log/trace queries; and owner alerts with deep links. Adapt all eight MA panels: today/health, chat/delivery, models/cost, tools, queues/schedules, data, quality, and releases/alarms. The dashboard cost summary is additionally a first-screen priority in this app.

| Component or concern | Required signals and investigations |
| --- | --- |
| API and authentication | Request/status/latency/error rates, rejected access and sign-in patterns, route template, correlation, deployment revision; never request bodies/tokens |
| Lambda and bounded jobs | Errors, throttles, duration/timeouts, concurrency/cold start and missing terminal runs; separate agent/stream/worker roles |
| SQS and workflows | Queue age/depth, DLQs, retry/replay counts, execution failure/timeout and stuck states, idempotency and original-run links |
| Storage and data | Database throttles/errors, backup/restore status, import/document orphan reconciliation, price/feature freshness, gaps/disagreement, audit-chain health and export completeness |
| Scheduler and recovery | Due/started/completed times, late/missed runs, dead-man switch and silent agent heartbeats, incident escalation and recovery |
| LLMs and agents | Model/tool latency/errors, tokens/cache/batch/usage/cost, refusal/fallback, loops/repeated tools, denied actions, grounding failures and incomplete evaluations |
| ML and recommendations | Dataset/feature/model lineage, training failures, drift, mature outcome/calibration/benchmark metrics, shadow eligibility, abstention/disagreement and promotion/rollback |
| Streaming and notifications | First safe response time, reconnect/resync/gaps, active stream/concurrency, push attempt/provider acceptance, failures and client acknowledgements where available; provider acceptance is not proof the user saw a push |
| Web and Apple clients | App/version/platform, safe response/render timing, errors/crashes/hangs, offline and resume behaviour; redacted, authenticated and rate-limited telemetry |
| Releases and infrastructure | Build/digest/alias/config changes, deployment and rollback evidence, IaC drift, infrastructure/admin activity, service health notices and collector failure |
| Spending and monitoring itself | AWS and Claude environment totals, reservation/headroom, unexpected usage, logging/span/query volume, telemetry collection cost and missing/outdated billing |

Saved investigations include one run/trace/document/import; changes to a holding; slow/failing tools; costs/tokens by agent/feature/model/env; source quality; stream/push failures by app version; releases correlated with incidents; denied actions; and forecast changes caused by a data/model revision.

Preserve deduplicated owner alerts, severity, cooldown, quiet hours, daily digest, immediate incidents where agreed, recovery/OK notifications and a composite unhealthy signal to avoid paging once per downstream symptom. Numerical thresholds, channels for operator emergencies and retry bounds are proposed configuration to approve, not copied hardcoded MA constants. The confirmed first-version product channels are app/chat and native/PWA push; email for operational emergencies remains a proposal rather than automatically added product scope.

## 6. Privacy, retention and cost discipline

Business audit and required prediction/approval lineage are not sampled. Operational tracing must cover every component and support the required joins, but rich-span sampling/retention is a separate budgeted decision. Full unsampled production telemetry and every paid monitoring feature are not assumed free. Do not use user/run/instrument identifiers as unbounded metric dimensions; keep detailed high-cardinality investigation fields in controlled logs/spans/business records.

Never send raw import files, portfolio values, personal names/account numbers, prompts/replies, authentication material or signed source URLs to general production logs or spans. Cost/usage metrics may carry explicitly approved non-portfolio billing amounts. Any diagnostic content capture is opt-in, non-prod and verified synthetic-only, not enabled merely because an environment is named dev. Add leak tests and access tests.

The MA values of 14-day logs, 30-day spans and 90-day run records are candidate starting points only. Approve a retention matrix by record class, including longer forecast/approval lineage and owner-controlled originals. Export/restore must preserve the joins even after operational traces expire. Provider-side data retention is separately documented; private storage in AWS does not mean inputs never reach Anthropic.

Use OpenTelemetry as the application convention and assess CloudWatch Logs/metrics/alarms, X-Ray/Transaction Search and Application Signals for the selected implementation. CloudWatch Omni is a separately evaluated product path, not an alias or automatic prerequisite. Preserve the same investigation outcomes while verifying current compatibility, IAM, regional availability and costs before implementation. No first-time setup procedure or service activation is authorized here.

## 7. Acceptance and release gates

- From a synthetic upload, the owner can identify its exact original/version, parser/extractor/model versions, preview/confirmation, changed records, audit entries and linked runs/traces. Failed/duplicate/reprocessed files have an equally visible outcome.
- A correction never silently rewrites the original prediction or source. Search and links resolve within authorized owner/environment scope; no cross-environment or public-original access.
- A user action, schedule, retried job and replay each have the correct logical trace/links, build/config/model attribution and observed terminal/recovery status. Injected failures at every major hop remain diagnosable.
- Redaction tests prove sensitive synthetic markers never enter production-style logs/spans/metrics, while protected portal evidence remains available only through authorized APIs.
- The main app shows per-environment Claude/AWS costs, estimates versus reported values, source refresh times, budgets, alerts and shared/unallocated amounts. Missing/denied/stale reports are explicit, not zeros.
- Internal and provider cost totals reconcile without double counting, including cache/batch/tool costs, retries, credit cycles, FX/tax display and other organization credit usage. An ambiguous provider outcome reserves liability until reconciled.
- Billing/report collectors have independent health, retry/latency and cost limits; dashboard refreshes use cached data. Budget-stop behaviour is tested under delayed reports and exhausted shared credit.
- Retention and deletion tests cover S3 versions and derivatives, with owner confirmation and truthful completion state. Recovery/restore tests prove required audit/forecast lineage remains meaningful.
- The initial release cannot treat cost visibility or basic auditability as a later optional feature. Data/trace/evaluation/model controls arrive with each corresponding layer rather than being bolted on after it ships.

## 8. Source and pending details

MA references: architecture §§4.6, 9.3 and 10.1–10.10; [observability](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1671230), [data/audit model](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1442042), and the captured 21-story [audit/observability source register](audit-observability-sources.json). In particular MA-29/61/71/79/102/108/137/145/148/149/180/196/230–236/255/256 provide audit, monitoring, owner-control and evaluation lineage requirements.

Pending owner review: detailed admin UX; retention/deletion matrix; identity/access model for the portal; exact signal/alert set and thresholds; safe trace propagation; which optional observability products are worth their cost; billing collector access and source freshness; global credit visibility; shared-cost allocations; and the updated operational cost envelope. The earlier low-cost architecture example is not proof that the complete monitoring design fits without measurement.
