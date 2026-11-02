# MP controls reconciliation: admin, audit, guardrails and evals

**MP-19 · 2 November 2026 · Maker-authored planning, not independently reviewed.**

This lane carries concepts from MA and reassesses them against the owner’s MP decisions. It does not adopt MA’s household roles, chosen UI, authentication implementation, budgets, model IDs, judge thresholds or sampling percentages. No application, infrastructure, paid evaluation or provider connection was implemented.

## Findings that affect architecture sign-off

MP already retains all eighteen control families as requirements or concepts. The main gap is contract and acceptance depth, rather than absent intent: the current source registers and audit requirements are strong, but most non-import layers still have umbrella stories. Those statements need to become explicit state machines, ownership/authorization rules, data classes, measurable evidence and phase/story links before UX starts.

Four choices need particular care:

- Keep the owner-approved Cognito managed sign-in. MA’s custom auth route is not a substitute for it. Current AWS step-up documentation has rollout/feature-plan conditions, so verify the actual user-pool support and define server freshness/action binding before selecting mechanics. Local Face ID alone cannot authorize a server operation.
- Keep every financial/approval/source audit event as durable business evidence, while budgeting operational trace sampling separately. Do not import MA’s assumption that all spans can be kept without meaningful cost, or that asynchronous trace propagation needs no verification.
- Carry the T0/T1/T2 concept and code-first grading. Research and approve MP case counts, trial counts, judge tolerance, corpus size and budget. MA’s fixed label counts, point-estimate accuracy and production sampling ratio are not universal scientific guarantees.
- An eval transcript stored privately in AWS can still be transmitted to Anthropic. Batch processing entails provider-side storage; it is not an AWS-only data path. Specify data minimization, feature-specific retention, deletion and late-result rules.

## Verified source coverage

Read all sixteen assigned MA pages as full HTML, including the rich Admin/Activity/Files references. Inspect four linked local web/Apple board sources for their control labels and state semantics. Native images and animation frames were not visually reviewed, so this lane does not certify visual parity. The source checkout was `387fc38bdc99d77460b6b03d90e2637241e79d1e`; unrelated untracked MA files were preserved.

The [machine-readable lane](controls.json) and [compact read receipt](controls-evidence/read-receipt.json) contain exact page versions, returned-body hashes, heading trees, board hashes and limits. Full returned HTML snapshots are temporary evidence under `/private/tmp/mp19-source-cache/controls/`; they are not copied into MP product specifications.

| MA source | Version read | Concepts assessed |
| --- | --- | --- |
| [Guardrails and evals: how the agents are guarded and tested](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1540178) | 13 | Code-enforced permissions and confirmation, quarantined extraction, figure checks; Manifest coverage, T0/T1/T2, outcome-first scoring, human-calibrated judges |
| [🔭 §10 · Observability: one trace from the door to the model](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1671230) | 12 | RunRecord as protected operational evidence, cross-boundary trace/correlation; Model/tool spans, metrics, alarms, client evidence, privacy/retention/cost |
| [👥 §20 · The agent team](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1769473) | 14 | Logical agent responsibilities, versioned settings and owner ChangeRequest desk; Grading/calibration, bounded self-healing, team budgets, learning boundaries |
| [💷 §15 · Cost, the Claude budget, caps and alerts](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1442062) | 11 | Usage metering, tiered degradation and owner-configurable limits; Alert routing and recovery, provider-credit assumptions need MP replacement |
| [🔐 §4.5 · Identity, members and views](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1540282) | 8 | Identity federation/passkeys, action-bound server-verified fresh authentication; Sessions/device revocation, linking/recovery, household roles must be adapted to personal MP |
| [🛡️ §14 · Security and privacy](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1147065) | 10 | Least privilege, privacy, encrypted stores, untrusted source rendering; Security and incident cases as release evidence |
| [🛠️ Flows · Running it: the Admin center, failures, the ladder and the month](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1736745) | 5 | Owner-only Admin journey, server second check and audit; Failed-work replay, bounded spend ladder and contribution journey |
| [🏠 Inside MyPaisa: the admin's journey in nine steps](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704057) | 4 | Nine-step owner journey connecting onboarding, holdings, analytics and admin; Plain-language explanation and progressive evidence drill-down |
| [✉️ Inside MyPaisa: one message, the agent team, the safety nets and a day](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1736725) | 5 | Message flow, specialist responsibilities and admin approval; Safety nets, daily operation and failure-state narrative |
| [Phase 8 · Audit, search and the Admin center at every door](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/294962) | 25 | Phase-8 admin/audit exit demonstration and per-story linkage; Explicit unresolved design and alert-routing questions, not an approved MP UI |
| [Phase 18 · The agent team: configured, approved, self-healing, self-learning](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197293) | 20 | Phase-18 team configuration, approval, measured-learning and recovery stories; Source phase structure, estimated dates and household assumptions are not MP commitments |
| [Screens · Activity, Audit and files](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/328059) | 7 | Activity/Audit/files across web and Apple screens; Source board links and story/phase associations retained in rich HTML |
| [Screens · The Admin center](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/197333) | 7 | Admin controls and fresh authentication across web/Apple; Source board links and story/phase associations retained in rich HTML |
| [Screens · Registering and check-ins](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/295022) | 6 | Register/import/check-in proposal and confirmation journeys; Input uncertainty, amend/cancel state and provenance |
| [➕ Flows · Adding a holding and logging money](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1704077) | 4 | Add a holding from evidence, validate and confirm; Changes audited with exact source and numerical parsing |
| [🔑 Flows · Joining and signing in](https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/1147105) | 5 | Sign-in and linking journeys, recovery and server second check; Provider/passkey branches and revoked/expired challenge cases |

## Proposed control state and record boundaries

An owner approval should use a common contract rather than each feature inventing its own confirmation rules:

`draft → validated → awaiting_owner → approved → executing → succeeded / failed / reconcile_required`

`awaiting_owner → rejected / expired / cancelled` are non-executing terminal branches.

These are proposed state names. An approval pins the exact operation, owner, target environment, proposal/payload hash, expected prior version, evidence and rollback plan. Authentication evidence is verified at the server. If the payload or prior version changes, the old approval cannot apply. Approval is distinct from successful completion; ambiguous external outcomes remain visible and reserve any potential liability.

| Record class | Required role | What it must not become |
| --- | --- | --- |
| Financial/source/forecast event | Durable owner-scoped truth with source and version lineage | An overwriteable chat note or expiring log |
| Approval/configuration event | Exact authorized change and outcome | Blanket authority for later changed proposals |
| Job/run/attempt record | Accepted/start/terminal or reconciled status, including crashes | Only a row written after successful completion |
| Operational span/log/metric | Redacted, budgeted diagnostic signal linked to stable business IDs | A second store of statements, private prompts or personal holdings |
| Eval case/result/label | Versioned fixture, answer, scorer, human label and evidence | An LLM score treated as market truth or an untraceable overwritten verdict |
| Agent memory | Sourced, scoped, revisable/forgettable note with taint | Permission, ledger truth or an approved setting |

## Control closure register

These are proposed planning contracts, not implementation defects. Each entry identifies what exists and the evidence needed to settle it. Labels such as partial specification describe depth, not a claim that an entire capability is missing.

### CT-01 · Define the owner-sensitive action and fresh-authentication policy

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/product-requirements.md DEC-037 and audit-observability-requirements.md section3 specify managed sign-in and sensitive actions; exact assurance/challenge policy remains open.

**MA concept:** MA second check and owner-only admin routes.

**MP recommendation:** Keep the agreed Cognito managed sign-in. Propose recent server-verified authentication for record-affecting import confirmation, deletion, replay, credential linking/recovery, budget expansion and model promotion. Verify actual Cognito step-up availability and plan before deciding the mechanism; a local biometric unlock grants no server authority.

**Owner decision:** Owner approves the sensitive-action matrix, freshness window, assurance requirements and recovery fallback.

**Primary phase:** PH-02. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Action matrix names read, propose, approve and execute permissions for every admin operation.
- Server checks owner, environment, session status, assurance and authentication age immediately before execution.
- Action challenge binds owner, environment, operation and exact target/payload hash; stale or reused proof fails.
- Tests include local-biometric-only, forged client claim, refreshed-old authentication, cross-environment proof and unavailable step-up capability.

**Primary research:** [docs.aws.amazon.com](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html).

### CT-02 · Specify the approval and configuration-change state machine

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md CAP-13 and AgentManifest; audit-observability-requirements.md sections2–3 describe confirmation but no common detailed approval contract.

**MA concept:** MA PendingAction and ChangeRequest with evidence, impact and second check.

**MP recommendation:** Use draft → validated → awaiting_owner → approved/rejected/expired/cancelled → executing → succeeded/failed/reconcile_required. Pin the exact proposal and expected prior config/ledger version; separate viewing a card, approving it and completing the operation.

**Owner decision:** Approve proposal expiry, allowed bounded automatic adjustments, rollback policy and which operations require a second confirmation.

**Primary phase:** PH-02. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Approval evidence includes actor, target environment, prior/new version, payload hash, reason, affected forecasts, cost estimate and rollback plan.
- Changed inputs or stale prior version invalidate approval and require a new proposal.
- Concurrent approve/reject and duplicate execution produce at most one effective state transition.
- An approval failure or timeout leaves no silent partial financial/config update.

**Primary research:** [docs.aws.amazon.com](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html), [docs.aws.amazon.com](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html).

### CT-03 · Define durable business audit contracts and integrity claims

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/audit-observability-requirements.md sections2–4 already gives detailed upload/change lineage; portfolio-import-spec.md defines ledger joins.

**MA concept:** MA immutable audit rows, source attachments and RunRecord joins.

**MP recommendation:** Separate durable financial/approval/source audit from expiring operational logs. Define atomic ledger/audit/outbox boundaries and detect missing/altered events. An append-only API is not by itself tamper-proof against privileged administrators.

**Owner decision:** Approve required audit record classes, privileged threat model, integrity-check mechanism and evidence retention.

**Primary phase:** PH-01. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Every committed change links event/revision, original hash/version, actor, reason, confirmation and prior/superseding revision.
- Injected failure between financial commit, audit and outbox cannot leave an unreported inconsistency.
- Integrity exercises detect a removed or altered event and report coverage; gaps are not certified intact.
- Source access, denied actions and administrative changes have appropriate privacy-safe evidence.

**Primary research:** [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html).

### CT-04 · Resolve retention, deletion and restored-copy policy

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/audit-observability-requirements.md sections2,6 defines24-month renewable originals and operational14/30/90days, but remaining class matrix is open.

**MA concept:** MA originals/audit retention and protected evidence views.

**MP recommendation:** Retain MP owner deletion rights rather than MA permanent-file assumptions. Specify S3 versions, parsed derivatives, caches, model-training datasets, evaluation labels, backups and provider batches independently. Restore must reapply deletion tombstones before data is made available.

**Owner decision:** Approve record-class duration, backup expiry/deletion limits, retained minimal tombstone data and policy for models trained on deleted sources.

**Primary phase:** PH-02. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Deleting a versioned original checks/removes the intended versions rather than only a delete marker.
- Portal reports requested/in_progress/completed/partially_failed with affected stores and unavoidable residual retention.
- Restored data cannot silently resurrect deleted originals or excluded evaluation cases.
- Retention extensions and any irreversible lock require explicit owner decisions.

**Primary research:** [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html), [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/batch-processing), [platform.claude.com](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention).

### CT-05 · Specify run lifecycle evidence that survives crashes

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/audit-observability-requirements.md section4 and architecture-deep-dive.md monitoring describe correlations; terminal-only writes are insufficient for crashed workers.

**MA concept:** MA per-function RunRecord with checks and Activity drill-down.

**MP recommendation:** Create accepted/started and terminal lifecycle evidence or equivalent durable job state, plus timeout reconciliation. Run summaries are not the only source for durable forecast and approval truth.

**Owner decision:** Approve timeout/stuck-run thresholds, the run summary schema and protected content-versus-metadata policy.

**Primary phase:** PH-02. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Accepted jobs and started runs remain discoverable if a worker crashes before writing completion.
- A reconciler distinguishes missing, timed_out, cancelled, partial and ambiguous_external_outcome.
- Activity links the exact config/model/source versions, guard decisions, attempts and cost reservation.
- Completion is never inferred solely from a successful queue acknowledgement or stream close.

**Primary research:** [docs.aws.amazon.com](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html).

### CT-06 · Validate asynchronous trace joins and budgeted telemetry

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/audit-observability-requirements.md sections4–6 already rejects unproved automatic propagation and unsampled-is-free assumptions.

**MA concept:** MA one door-to-model trace, full instrumentation and saved investigations.

**MP recommendation:** Use stable business IDs as the durable join; adopt parent/child spans or span links according to asynchronous lifecycle and replay. Pin OTel convention/version and test every integration. Budget sampling, cardinality, queries and retention separately.

**Owner decision:** Choose the minimum launch signal set, trace sampling strategy, correlation fields and measured observability allowance.

**Primary phase:** PH-02. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- A synthetic UI→API→queue→worker→Anthropic/batch→storage→push example resolves through protected business IDs even after traces expire.
- Replay gets a new attempt/run and linked trace, not the original successful span rewritten.
- Trace headers are validated; client-provided baggage cannot inject identities, secrets or unbounded attributes.
- Leak tests cover raw prompts, holdings amounts, filenames, signed URLs, account identifiers and model/tool arguments.

**Primary research:** [opentelemetry.io](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/), [docs.aws.amazon.com](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html).

### CT-07 · Freeze a typed agent/tool capability manifest

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md AgentManifest and CAP-14 capture the concept; no final tool catalogue/side-effect matrix exists.

**MA concept:** MA one manifest drives runtime policy and eval coverage.

**MP recommendation:** Declare roles independently from LLM routes. Runtime policy checks tool, owner/environment scope, schema/ranges, side effect, current approval, repetition, remaining time/cost and untrusted-content state. Fail closed when policy is unavailable.

**Owner decision:** Approve the v1 roles/tools, permitted read/draft actions, external research surface and numerical-service ownership.

**Primary phase:** PH-05. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- No model prompt or agent message can grant a new tool, secret access, trade capability, budget or promotion authority.
- Each entry maps to at least one negative safety case and useful capability/regression case.
- Policy applies to every application-side tool invocation and rechecks permission before committing.
- Provider-hosted tools are constrained at request admission because application middleware cannot intercept every internal action.

**Primary research:** [platform.claude.com](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks), [inspect.aisi.org.uk](https://inspect.aisi.org.uk/scoring.html).

### CT-08 · Define quarantine and public/private research boundaries

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md CAP-14 and audit requirements describe quarantine; detailed route/context and egress contracts are pending.

**MA concept:** MA no-tool extractor and restrictions after untrusted text.

**MP recommendation:** Treat PDFs, screenshots, merchant/issuer text, web results and agent notes as untrusted data. Use no-tool structured extraction and validate fields/provenance; keep public research requests free of holdings quantities/private documents. Carry taint through summaries and memory. Test residual misinformation even when exfiltration is blocked.

**Owner decision:** Approve minimum outbound context by route, whether any optional classifier is justified and what happens when evidence is suspicious.

**Primary phase:** PH-05. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Poisoned PDF/image/OCR/news/tool-result cases cannot cause a prohibited tool, disclosure or record mutation.
- Structured output does not automatically count as truthful; schema validity, source references and field plausibility are checked separately.
- Outbound tool URLs/arguments are policy-controlled and sensitive context cannot enter public web research.
- A screening refusal, timeout or no verdict is not an allow decision; safe extraction/abstention remains available.

**Primary research:** [platform.claude.com](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks).

### CT-09 · Specify numerical and evidence grounding by claim type

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md CAP-14 and PRD contextual-chat requirement retain numerical grounding; final claim schema is not defined.

**MA concept:** MA figure check, refusal and template fallback.

**MP recommendation:** Ground rendered financial claims in typed tools and exact snapshot/as-of/version references. Verify amount, currency/unit, sign, horizon and uncertainty label; matching a number somewhere in context is insufficient. Scientific probabilities and scenarios have separate eligibility checks.

**Owner decision:** Approve allowed financial claim types, numeric tolerances, citation freshness and safe failure/fallback experience.

**Primary phase:** PH-05. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Contradicted/stale values, wrong currency/unit, invented probability and swapped horizons fail even when the number exists in another tool output.
- Figures derived from multiple values are calculated by deterministic services with formula versions.
- Every recommendation can open its exact evidence context without a new unsupported reconstruction.
- Failed grounding abstains or uses an approved deterministic template within the budget; retries are bounded.

**Primary research:** [platform.claude.com](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks), [inspect.aisi.org.uk](https://inspect.aisi.org.uk/scoring.html).

### CT-10 · Define MP T0/T1/T2 with coverage and incomplete outcomes

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md CAP-14 and testing section retain T0/T1/T2 at umbrella level; MP CI does not implement those product evals.

**MA concept:** MA path-triggered offline eval tiers and synthetic case manifest.

**MP recommendation:** Propose T0 offline deterministic replays on relevant changes; T1 bounded live tests for affected agent/tool/prompt/SDK routes; T2 full affected qualification for model/routing/release changes. Select case/trial counts from failure risk and budget rather than copying MA3/5 trials or dollar caps. Keep ML temporal validation separate.

**Owner decision:** Approve harness, v1 case inventory, coverage triggers, per-run/month limits and which unresolved failures block a release.

**Primary phase:** PH-05. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Case metadata links requirement, phase/story, agent/tool, threat or capability, fixture version and expected state invariants.
- A changed tool without mapped tests blocks readiness; unsupported dynamic plug-ins cannot bypass coverage.
- Budget exhaustion, missing model access, timeout and invalid fixtures report incomplete/error rather than pass.
- Original answer outputs and appended scorer versions remain auditable, and no live API is called by ordinary unit tests.

**Primary research:** [inspect.aisi.org.uk](https://inspect.aisi.org.uk/scoring-workflow.html), [inspect.aisi.org.uk](https://inspect.aisi.org.uk/scoring.html).

### CT-11 · Calibrate judges using independent labels and uncertainty

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/product-requirements.md and forecasting-scope.md require human-calibrated judging but contain no approved eligibility protocol.

**MA concept:** MA advisory judges, monthly owner calibration and labelled regression cases.

**MP recommendation:** Use a separate binary/ordinal rubric per failure mode plus unknown, independent held-out owner labels and confidence intervals for false positives/negatives. Report strata such as extraction, research, financial explanation and market. Remain advisory while evidence is insufficient.

**Owner decision:** Approve severity-specific error tolerance, sampling mix, recalibration cadence and sufficient evidence; MA50pass/50fail and0.8 are reference values only.

**Primary phase:** PH-05. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Judge calibration labels are separate from judge prompt development and repeat examples cannot inflate sample count.
- Low sample size or a changed judge/model/rubric resets eligibility or triggers requalification.
- Sample both suspicious and apparently successful runs, record selection probabilities and avoid presenting oversampled-failure rates as population rates.
- Judge disagreement routes to owner review; an LLM judge cannot certify numerical truth or model predictive performance.

**Primary research:** [inspect.aisi.org.uk](https://inspect.aisi.org.uk/scoring-workflow.html), [inspect.aisi.org.uk](https://inspect.aisi.org.uk/scoring.html).

### CT-12 · Resolve evaluation privacy and batch-result evidence

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/audit-observability-requirements.md section6 separates provider retention; exact live-transcript eligibility is open.

**MA concept:** MA AWS-held eval transcripts and overnight Haiku batch judges.

**MP recommendation:** Start with synthetic/redacted fixtures. Actual portfolio transcripts need a separately documented minimum payload and provider feature/retention assessment. Asynchronous judging is nonurgent, item-versioned and reconciled; archive only necessary protected evidence, not indiscriminate full prompts.

**Owner decision:** Approve real-data evaluation eligibility, provider batch use, transcript/label retention and deletion semantics.

**Primary phase:** PH-05. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Register which data leaves AWS for each model API feature, purpose and account arrangement.
- Partial/expired/cancelled batch items stay distinct from successful judge coverage and retain original run references.
- Late results cannot overwrite newer adjudication, labels or decisions.
- Synthetic regression cases preserve failure shape without retaining real account details; owner confirms release to the case corpus.

**Primary research:** [platform.claude.com](https://platform.claude.com/docs/en/build-with-claude/batch-processing), [platform.claude.com](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention).

### CT-13 · Specify conservative cost admission and billing reconciliation

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/audit-observability-requirements.md sections1,7 already provides detailed MP-specific policy; stale root rules still mention the old£50 target.

**MA concept:** MA metering and spend ladder with admin caps.

**MP recommendation:** Preserve confirmed£100all-in,£70operation+£30reserve and£60/75/85cash thresholds. Allocate evals, monitors, retries, cache writes and batches within the same envelope. Reserve before external work, carry ambiguous liabilities and distinguish pre-credit reported cost from cash/verified credit.

**Owner decision:** Approve feature/environment/eval suballocations, stale/unknown-credit thresholds and emergency minimum functions; resolve conflicting root rules.

**Primary phase:** PH-02. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Shared credits are counted once and cannot be assumed available to MP merely because the account has promotional entitlement.
- Two concurrent requests cannot each spend the same remaining allowance.
- Dashboard uses cached reports with source age and reconciliation status; polling cadence is not guaranteed provider freshness.
- Permission/budget failure sends no uncovered request and does not silently switch to paid fallback.

**Primary research:** [platform.claude.com](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api).

### CT-14 · Bound self-healing, replay and recovery authority

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/audit-observability-requirements.md sections3,7 and layered recovery joins preserve owner control but lack per-action recovery contracts.

**MA concept:** MA ops warden, incidents, DLQ replay and automatic rollback bands.

**MP recommendation:** Automatically retry only explicitly idempotent work within approved bounds. New external calls, financial reprocessing, broad replay, deleting evidence or increasing spend require current policy/approval. Use isolated restore plus reconciliation before switching authority.

**Owner decision:** Approve incident classes, automatic recovery allowlist, replay limits, RPO/RTO and operator escalation path.

**Primary phase:** PH-08. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Replay preserves original business id and generates new attempt/trace links; duplicates cannot double-commit or double-notify.
- Replays recheck current owner permissions, source retention/deletion and latest applicable config.
- Restore exercise proves ledger/audit/source/model joins and deletion tombstones, not just object availability.
- No app agent can grant infrastructure permissions or perform an unapproved production apply.

**Primary research:** [docs.aws.amazon.com](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html), [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html).

### CT-15 · Separate learning proposals, approved settings and memory

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/forecasting-scope.md CAP-13/15 and ablation/promotion rules retain the concepts; exact policy bands are unresolved.

**MA concept:** MA versioned settings, bounded tuning, agent notes and owner ChangeRequests.

**MP recommendation:** Use read-only defaults; propose rather than mutate model/prompt/rule/budget settings. Distinguish evaluated numerical calibration, research notes and user preferences. Memory is sourced/tainted/revisable and cannot become ledger truth or authority.

**Owner decision:** Approve any automatic safe adjustments, owner promotion scope, memory classes, forgetting and poisoning controls.

**Primary phase:** PH-04. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Every proposed model/rule/prompt change pins mature outcome evidence and relevant safety/eval/cost impact.
- A note or summary cannot overwrite source data, outcomes, thresholds or an approved configuration.
- Drift or insufficient mature evidence triggers abstention/shadow/disable according to policy, never autonomous promotion.
- Version rollback preserves original forecast and outcome history.

**Primary research:** [platform.claude.com](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks), [inspect.aisi.org.uk](https://inspect.aisi.org.uk/scoring.html).

### CT-16 · Define admin information architecture and launch-minimum controls before UX

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/audit-observability-requirements.md section3 lists eight portal areas; current MP phase map remains umbrella-level outside detailed L1.

**MA concept:** MA cross-device Admin, Activity, Audit and Files board structure.

**MP recommendation:** Prepare an MP admin domain map covering Files/Imports, Audit, Runs/Health, Agents/Models/Evals, Approvals/Config, Costs/Budgets, Incidents/Recovery, Identity/Devices. Keep owner-only personal scope; do not import household-member administration or copy MA board styling.

**Owner decision:** Approve launch-minimum versus later depth, navigation/domain boundaries and action permissions before screen design.

**Primary phase:** PH-00. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Every launch-sensitive action has a defined path, observable pending/failure/cancel/rejected state and evidence drill-down.
- Read-only cost/audit access is distinct from controls that change budgets, data or model state.
- Mobile and web workflows share backend contracts but have separately specified recovery/privacy/accessibility states.
- Phase pages cite actual MP stories/contracts and clearly distinguish planned UI from implemented functionality.

**Primary research:** [docs.aws.amazon.com](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html), [inspect.aisi.org.uk](https://inspect.aisi.org.uk/scoring.html).

### CT-17 · Specify personal identity linking, sessions and owner recovery

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/DEC-037/038 retains Cognito managed login, verified linking, Apple/Google/passkeys and two independent paths; detailed recovery remains open.

**MA concept:** MA multi-provider links, devices, revocation and two independent sign-in paths.

**MP recommendation:** Design personal-owner recovery rather than household invites. Link only after verified control of both identities, use stable provider subjects rather than email equality and avoid unlinking the final usable path. Define web cookies/native secure storage and live-stream reauthorization.

**Owner decision:** Approve trusted origins/RP IDs, recovery inventory, session/stream revocation latency and loss-of-all-devices procedure.

**Primary phase:** PH-02. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- Email collision cannot merge identities or grant access; linking/recovery changes require current owner authorization.
- Revoked sessions cannot keep an SSE connection/data link indefinitely; explicit maximum delay is tested.
- A lost device can be revoked using an independent verified path without disabling the only owner irrecoverably.
- Dev/prod origin, issuer, audience, callback and passkey scope are explicit and fail on cross-environment tokens.

**Primary research:** [docs.aws.amazon.com](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html).

### CT-18 · Separate material investment alerts from operational incident routing

**Existing MP evidence:** docs/planning/aws-options-2026-11-01/DEC-032/033 and audit-observability-requirements.md section5 approve07:30London,22:00–07:00quiet hours and defined exceptions; severity/cooldowns remain open.

**MA concept:** MA alert router, quiet hours, cooldowns, recovery and budget ladder.

**MP recommendation:** Maintain separate financial-risk, system-security, data-quality, billing and job-failure alert classes with correlation/dedup, explicit evidence and recovery state. Product push channels remain native/PWA plus app/chat; additional operator email is a choice.

**Owner decision:** Approve material/critical conditions, quiet-hour exceptions, grouping/cooldowns, emergency channel and weekend briefing.

**Primary phase:** PH-07. Controls must accompany their first dependent feature; the phase label does not postpone safety until a later admin screen.

**Acceptance evidence to specify before UX:**

- A downstream outage produces one incident with linked symptoms rather than one push per failed component.
- Risk alerts use eligible as-of data; unavailable providers cannot generate a confident all-clear.
- Push provider acceptance is labelled delivery attempt/acceptance, not proof the owner read it.
- Alert policy edits are versioned/audited; recovery notifications link the incident and do not erase prior failures.

**Primary research:** [docs.aws.amazon.com](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html).

## Suggested issue grouping and phase documentation

Keep these eighteen contracts at requirement level, but avoid eighteen duplicate Jira tickets. Suggested planning-story groups are:

| Planning group | Contracts | Reuse or likely epic | Required specification result |
| --- | --- | --- | --- |
| Personal identity, server step-up and sessions | CT-01, CT-17 | Reuse MP-11, foundation MP-4 | Operation-permission/freshness matrix, identity linking/recovery and revocation cases |
| Archive/deletion/restore/replay | CT-04, CT-14 | Reuse MP-13, hardening MP-9 | Record-class retention matrix, deletion tombstones, restore/replay runbook and RPO/RTO decision |
| Approval and durable audit contracts | CT-02, CT-03 | Foundation/ledger MP-4 / MP-5 | State-machine and atomicity/idempotency invariants with source/approval/event links |
| Run evidence, telemetry and cost | CT-05, CT-06, CT-13 | Foundation MP-4 / hardening MP-9 | Run/attempt schema, correlation tests, redaction/sampling plan and conservative admission |
| Agent capabilities, quarantine and claims | CT-07, CT-08, CT-09 | Research MP-7 | Typed role/tool matrix, outbound-context rules and financial-claim eligibility |
| Evals and human calibration | CT-10, CT-11, CT-12 | Research MP-7 | Offline/online/judge policy with coverage, privacy and cost boundaries |
| Controlled learning and admin/alerts domains | CT-15, CT-16, CT-18 | Prediction MP-6 / research MP-7 / hardening MP-9 | Owner-change matrix, launch-minimum domains, material/operational incident classes |

For the area-by-area Confluence architecture, create distinct sections for **Identity and owner controls**, **Admin and approval state**, **Financial/source audit**, **Runs, telemetry and costs**, **Agent trust boundaries**, **Guardrails and evaluations**, and **Recovery/retention**. Reference the same contracts from each affected phase page rather than rewriting slightly different policies in multiple places.

Each phase page needs: scope/out-of-scope, upstream accepted contracts, named requirements and real Jira links, data/events/state diagrams, positive/negative/failure acceptance cases, necessary owner decisions, synthetic versus real evidence, cost/privacy impact, operational observability and rollback, UX states to design later, and a truthful exit checklist. No UI story starts because an architecture illustration exists.

## Research register

All external research below uses primary provider/project documentation, consulted on 2 November 2026. The MP implications are recommendations, not existing owner decisions.

| Primary source | Verified constraint or capability | MP implication |
| --- | --- | --- |
| [Cognito authentication levels with ACR and AMR claims](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-step-up-authentication.html) | Current AWS documentation describes assurance/freshness claims for step-up, with gradual rollout and Essentials/Plus plan requirements. Token refresh does not reset authentication time. | Verify actual user-pool support and cost. Specify server action binding and freshness; do not copy MA custom authentication or rely on local Face ID. |
| [Anthropic prompt-injection mitigations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks) | Anthropic recommends treating retrieved content as untrusted, explicit provenance, constrained permissions and adversarial tests. Screening is one possible layer rather than an authorization boundary. | Use no-tool extraction and a policy-enforced split between private portfolio computation and public-source research; do not promise injection immunity or add a paid classifier to every read without evidence. |
| [Inspect scoring workflow](https://inspect.aisi.org.uk/scoring-workflow.html) | Inspect supports deferred scoring, rescoring existing outputs and appending new scores alongside old ones. | Keep versioned generated answers and scorer versions separate; compare judges without regenerating all answers or overwriting original evaluation evidence. |
| [Inspect scoring and metrics](https://inspect.aisi.org.uk/scoring.html) | Inspect distinguishes deterministic and model grading and supports grouped metrics and uncertainty-aware analysis. | Adopt the harness concept provisionally, with task-specific scorers, safety invariants and evaluated judge agreement rather than a universal LLM quality score. |
| [OpenTelemetry GenAI spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/) | GenAI telemetry has semantic conventions for operations, models and usage; content capture requires explicit privacy treatment and versioned instrumentation assumptions. | Record metadata by default, with separate protected business evidence and synthetic-only diagnostics. Do not place full portfolio prompts or outputs in general tracing. |
| [Deleting S3 object versions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html) | A simple deletion of a versioned S3 object creates a delete marker; permanently removing a specific version requires version-aware deletion. Noncurrent versions also incur storage charges. | Owner deletion needs explicit versions, derivative and restore semantics, not a successful simple DELETE response. |
| [Anthropic batch processing](https://platform.claude.com/docs/en/build-with-claude/batch-processing) | Asynchronous batches store inputs/outputs during processing and provide results for a limited period, currently up to29 days after creation. Items have independent outcomes and batches may take up to24 hours. | Describe provider retention honestly; use minimal/synthetic judge payloads and bounded nonurgent judging, with stale/expired results excluded from successful coverage. |
| [Anthropic Usage and Cost Analytics API](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api) | Current beta analytics reports refresh timestamps and pre-credit cost values; documentation describes typical4-hour and possible24-hour delay plus revisions. | Retain live reservations and estimated charges, and separate reported cost from verified credit/cash liability. Six-hour polling is not a six-hour freshness guarantee. |
| [Lambda SQS partial batch and retry handling](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html) | Batch failure can cause successful items to reappear; partial batch responses reduce unnecessary retries, and FIFO handlers need ordering-aware failure handling. | Replay is a controlled business operation with stable idempotency keys and current permission/deletion checks, not merely a queue redrive button. |
| [Anthropic API data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention) | Retention depends on API features, model and account arrangements; AWS-side storage policy alone does not define provider retention. | Require a feature-by-feature outbound-data and retention register before approving use of actual statements or production evaluation transcripts. |

## Pre-UX closure sequence

1. Confirm domain ownership and the owner-sensitive action matrix, including managed-auth compatibility and personal recovery.
2. Agree the approval, source/ledger audit, run/attempt, retention/deletion and notification contracts.
3. Approve the agent/tool/outbound-context catalogue and claim-grounding rules.
4. Approve MP-specific evaluation coverage, judge qualification, data eligibility and budget.
5. Resolve permitted automatic recovery/tuning, operator escalation and minimal launch admin controls.
6. Link every retained concept to a real MP planning story and phase exit. Verify references and record open evidence honestly.
7. Ask the owner to approve the complete architecture/requirements baseline. Only then start UX specifications and design choices; implementation needs the later whole-UX approval as well.

No independent review, actual eval suite, actual regression ledger, cloud exercise or application test was run by this lane. Maker checks are limited to evidence retrieval, source/contract consistency and JSON/Markdown integrity.
