# MP-64 admin journeys: fact sheet for designers

Compiled 4 November 2026 from the repo at `67f72de` (branch MP-64-admin-journeys). Serves PH00-S06 (MP-64, To Do, `docs/planning/trace.json`). Read only: nothing in the repo or Jira was changed. Nothing here approves a design, a build or a policy.

**Reading rule.** The owner's recorded answers win, then the root documents, then the foundation pack, then planning packs, then Jira (SIGN:14-28). `[inferred]` marks my reading, never a record's words. `[history]` marks `aws-options-2026-11-01`, which ranks 7 of 7 ("Evidence of how a choice was reached. Never current instruction", SIGN:26): use it for vocabulary, not authority.

**Source key.**

| Key | File |
| --- | --- |
| ARCH, TS | `ARCHITECTURE.md`, `TECH-STACK.md` |
| DL | `docs/planning/ma-reconciliation-2026-11-02/decision-log.md` |
| POL | `docs/planning/foundation-policy-discussion-2026-11-02.md` |
| GAP-id | record in `docs/planning/ma-reconciliation-2026-11-02/gap-register.json` |
| PH0n-Snn | story in `docs/planning/story-readiness-2026-11-03/stories/PH-0n.json` (Jira key given in section 2) |
| MP40-Qn | `docs/planning/story-readiness-2026-11-03/questions.json` |
| FP, FOD, FS | `docs/planning/foundation-specifications-2026-11-02/financial/` `policies.json`, `open-decisions.json`, `specification.md` |
| FIX | `.../foundation-specifications-2026-11-02/fixed-policies.json` |
| CS, RES | `.../costs/specification.md`, `.../costs/reservation-contract.json` |
| SCI | `.../forecasting/forecasting-specification.md` |
| SIGN | `docs/planning/baseline-signoff-2026-11-03/README.md` |
| RN | `docs/planning/region-network-2026-11-03/README.md` |
| PH8 | `docs/planning/ma-reconciliation-2026-11-02/phases/PH-08.md` |
| AOR | `docs/planning/aws-options-2026-11-01/audit-observability-requirements.md` `[history]` |
| Lesson n | checklist in `.claude/rules/independent-review.md` |
| story README | `docs/planning/story-readiness-2026-11-03/README.md` |
| J:name | `docs/design/journeys/src/journeys/name.js`; J:shell is `docs/design/journeys/src/shell.js` |

---

## 1. Scope

**What the records say.**

- Admin is a named component: "Admin | Files, audit, runs, models, approvals, costs, incidents, identity | Full journeys specified before the first build (ARC-08) | Owner-selected" (ARCH:116).
- ARC-08: "Full admin journeys before first build" and "Cost monitoring remains directly accessible from the main app, not solely in admin" (DL:81, DL:83).
- Devices: PH00-S06 names none. PH00-S05 names "web, iPhone and iPad"; the accessibility answer covers the same three ("WCAG 2.2 AA (Recommended)", for web, iPhone and iPad, DL:265; ARCH:301). GAP-CT-16 requires: "Mobile and web workflows share backend contracts but have separately specified recovery/privacy/accessibility states." So all four surfaces (web, phone web PWA, iPhone, iPad) are `[inferred]` in scope, with separate recovery, privacy and accessibility states per surface.
- PH07-S02 lists the native journeys as "holdings and top 5, imports, forecasts and proof, chat, costs and approvals". It does not name audit, runs, agents, incidents or identity. Whether those admin journeys are native at launch is open (GAP-CT-16: "launch-minimum versus later depth").
- PWA and iPad as doors: "Works on a laptop, an iPad or a phone" (TS:86). Swift owns iOS and iPadOS screens; React Native owns navigation and bridges only (ARCH:293-294).

**Separate app, route or authority boundary? The records settle only the last.**

| Boundary | Answer in the records | Source |
| --- | --- | --- |
| Separate app | None recorded. No record creates one. The stack has one PWA and one Apple app | ARCH:66, ARCH:291-294 |
| Separate route | None. Route families are `costs`, `audit`, `settings` ("Spend by environment, activity, protected controls"), `imports`, `jobs` and others; there is no `admin` family | ARCH:226-234 |
| Separate authority | No. One owner: "Only the owner signs in; no other user is created" (PH02-S01); "No admin role recovers the account on the owner's behalf" (PH02-S02); "Only the signed-in owner calls the API" (PH02-S11) | stories |
| Navigation | Open: "Approve launch-minimum versus later depth, navigation/domain boundaries and action permissions before screen design" | GAP-CT-16 |

**Where the owner journeys already point.** Tabs are Portfolio, Forecasts, Segments, Record, Settings (J:shell:49); the sidebar adds Data sources (J:approvals:21). None is called admin. Approvals and Imports sit under Settings, as a maker's proposed answer, not the owner's (J:shell:271). The approvals journey promises: "The full audit sits in the admin area, for search across all of them." (J:approvals:450). Lesson 28 applies: that promise needs a destination.

**Environment.** Dev and prod have the same shape (ARCH:61). Dev holds only synthetic data, and no dev role trusts a prod role (RN:128). Target checks: "Environment banners and target checks prevent operating on prod while investigating dev" (AOR:78 `[history]`). A dev token is refused by prod and the reverse (PH02-S01). A replay never crosses environments (PH08-S06).

**How MP-64 differs from MP-62.** PH00-S06 says "the owner picks one per journey". The flip answer of 4 November covers "both options kept on all eight journeys" of MP-62 (DL:277). It does not extend to admin unless the owner says so `[inferred]`. A rejected journey gets a new options round for that journey alone (PH00-S06). No em dash in anything that reaches Jira (story README:59).

---

## 2. The nine journeys

**Count.** You asked for nine, and PH00-S06's sentence reads as nine if "Agents" stands alone. ARC-08 and GAP-CT-16 list eight, with "Agents/Models/Evals" as one domain (DL:83). This sheet keeps nine; the split is a design choice, not a record.

**Each journey must cover** (PH00-S06, DL:83): investigation and comparison; approve and reject; source inspection; reprocessing and correction; configuration changes; cost reconciliation; stale, conflicting, expired and denied; failure, replay, restore, rollback and deletion.

**State vocabulary for every admin screen** (PH8:92-95): success, empty, loading, partial, unavailable; stale source, insufficient evidence; permission denied, fresh authentication required, approval pending/expired/rejected, conflicting revision; offline/reconnecting, delayed job, retry exhausted, partial commit, safe recovery; privacy mode, keyboard and screen reader, light/dark, reduced motion on web and Apple. Note: PH00-S05's eight-state rule (loading, empty, error, stale, offline, no-model, disagreement, abstention) is written for owner journeys; PH00-S06 sets no list of its own.

**Contract status.** Run through the story gate (`contracts_known`, `stories.py:48`).

| Status | Contracts |
| --- | --- |
| Specified, with a schema (status still proposed, not approved) | AuditEvidence, AuditQuery, OwnerApproval, SourceReceipt, ImportDraft, CommitReceipt, PromotionRecord, Score, Eligibility, Entitlement, SourceCapability, QuotaReservation |
| Named only, no schema: "Names here are a catalogue, not implemented schemas" (PH8:27) | ApprovalRequest, SensitiveAction, IdentitySession, JobRecord, RunRecord, OutboxEvent (PH-02 catalogue); ClientState, OfflineSnapshot, DeepLink (PH-07); IncidentRecord, ReplayRequest, RecoveryExercise, ReleaseEvidence, DeletionTombstone (PH-08); NotificationIntent, AgentManifest, ToolContract, EvalResult, EvalLabel, EvaluationRun, MemoryNote, PromotionDecision, ModelVersion, AuditEvent |
| Proposed contract file, gate says planned | CostReservation (RES) |

Designers may name the fields a story states for a planned contract, and no others.

### 2.1 Files and Imports

- **Reads:** SourceReceipt, ImportDraft, DraftRow, EvidenceRef, CommitReceipt, CostReservation, DeletionTombstone.
- **Writes (through owner action):** OwnerApproval, new ImportDraft revisions, DeletionTombstone, AuditEvidence; ledger writes only by the controlled writer (PH01-S14, PH01-S15, PH01-S18, PH02-S14).
- **Source states:** received; quarantined; extracting; extracted; validation_failed; extraction_failed; cancelled (FP:27-52). Also orphan object quarantined, receipt blocked, upload link expired (PH01-S06).
- **Draft states:** draft; needs_resolution; review_ready; confirmed; staged; failed; published; cancelled (FP:53-83). Manifest: reserved; staged; sealing; complete; published; failed; cancelled (FP:84-112). Also outcome unknown (PH01-S15).
- **Dedup:** Unique; True replay suppressed; Possible duplicate awaiting review; Idempotency conflict; Correction proposed for a changed fact (PH01-S12).
- **Extraction:** Queued, awaiting credit; Extracting; Extracted, with low-confidence fields flagged; Schema validation failed; Paused for credit; Superseded by a newer model or prompt version (PH01-S08).
- **Retention:** Retained within its 24 months; Due for owner renewal; Deletion in progress; Deleted, with tombstone; Restored copy awaiting tombstone reapplication (unreadable) (PH01-S05). PH02-S14 adds extended and restricted by a source's permission.
- **Correction:** Correction draft; Awaiting approval; Published; Reversal refused for dependencies; Rebuild proposal ready; Generation superseded (PH01-S18).
- **Owner actions:** inspect an original and its extraction; compare a reprocessed revision ("the old revision stays for comparison", PH01-S08); decide a duplicate; approve, revoke or cancel; correct; reverse; approve a rebuild; renew or delete an original; request an export.
- **Comparison anchor:** "list/filter by time, owner/environment, type, instrument/import and status; inspect originals, checksums/versions, extraction and every affected change; compare reprocessing" (AOR:69 `[history]`).
- **Limits:** 15 minutes to start the exact commit (POLICY-001, POL:32-38). 24 months renewable, no automatic deletion (FIX:161-168). Transaction preflight: 100 actions, 4 MiB aggregate, 400 KiB per item, service token 10 minutes (FP:124-128). Export link: one hour to start (POLICY-011). No upload limit is approved (MP40-Q1); oversize files are held for review.
- **Rules:** edits, reprocessing, remapping or exclusions make a new immutable revision and void the pending approval (FS:23). Reprocessing with a new parser cannot bypass economic dedup; a changed fact becomes a correction proposal (PH01-S12). Reprocessing validation_failed needs a new source-processing revision, never replaced bytes (FP guards:116).
- **Stories:** PH01-S05 MP-45, S06 MP-46, S07 MP-47, S08 MP-48, S09 MP-49, S12 MP-52, S13 MP-53, S14 MP-55, S15 MP-60, S18 MP-68, S26 MP-169, S02 MP-42; PH02-S14 MP-98; PH06-S14 MP-149; PH08-S02 MP-116.

### 2.2 Audit

- **Reads:** AuditEvidence, AuditQuery, SourceReceipt, CommitReceipt, DeepLink, EvidenceRef (PH01-S04, PH06-S15). Audit is read-only here: "Only the controlled writer and the protected approval and deletion paths append audit records" (PH01-S04).
- **AuditEvidence fields** (schema): scope, audit_id, actor_type (owner, writer, extractor, reconciler, admin), actor_ref, operation, target_refs, commit_id, source_refs, approval_id, before_ref, after_ref, reason, recorded_at, economic_date, previous_digest, content_sha256, integrity_anchor_ref, integrity_claim (digest_only, externally_anchored, incomplete), retention_policy.
- **AuditQuery kinds** (schema): event_lineage, recorded_changes, economic_history, commit_completeness, outbox_delivery, source_orphans, metric_inputs, supersession, export_access. Fields: pinned_revision, from_date, to_date, resource_refs, cursor.
- **Access patterns:** FIN-AP-04 "recorded-time changes, actor, denied operation, admin/export access"; FIN-AP-05 event to source/draft/approval/before-after/correction/dependencies/forecast lineage; FIN-AP-06 pending/failed/stale-fence manifest and unmatched upload; FIN-AP-07 outbox delivery; FIN-AP-08 export snapshot (FP:267-295). Economic-date and recorded-time queries are distinct (FS:51).
- **States:** Complete lineage; Lineage with an unavailable source; Integrity check failed; Index lagging, with fallback to manifests; Query incomplete (INTEGRITY_INCOMPLETE) (PH01-S04). Deep links: resolved; superseded; permission_denied; not_found; offline_cached; stale (PH06-S15).
- **Owner actions:** query and read. The worked question: "who changed this fee, from which document, what did I approve, and which forecasts used it" (PH01-S04). Follow source, ledger, risk, forecast, action, outcome and audit (PH06-S15).
- **Limits:** unsampled; account lifetime (POLICY-010, POL:167); bounded pagination, no general scan; references only, "never document content, prompts, tokens or holding values" (PH01-S04); an integrity failure names the affected range.
- **Note:** no AuditQuery kind is named for config changes, incidents or denied actions. FIN-AP-04 places denied and admin access under recorded-time changes, so `recorded_changes` is the `[inferred]` home. `actor_type` includes `admin` although MP has no admin role: see section 6B.
- **Stories:** PH01-S04 MP-44, PH01-S21 MP-76, PH06-S15 MP-151, PH02-S13 MP-96.

### 2.3 Runs and Health

- **Reads:** JobRecord, RunRecord, OutboxEvent, EvidenceRef, IncidentRecord.
- **Writes:** none by the owner except through replay and pause actions (2.8).
- **Job states:** accepted; running; waiting durably; succeeded; failed; reconcile_required; quarantined; dead-lettered (PH02-S06).
- **Reconciler outcomes:** missing, timed_out, cancelled, partial, ambiguous_external_outcome (GAP-CT-05 acceptance, open).
- **Market run:** waiting for close; collecting; retrying; frozen; waiting_data; abstained (unsupported_schedule); missed_origin; stale (PH03-S09). Each market records watermark, last success and next due time.
- **Traces:** complete trace; linked across a queue or batch; sampled out: durable record only; missing span; expired by retention (PH02-S13). Stream: connected; heartbeat late; reconnecting; resumed; gap: full re-read; closed: expired or revoked; polling fallback (PH02-S12).
- **Owner actions:** investigate a run from its evidence; open the linked incident. "Activity links the exact config/model/source versions, guard decisions, attempts and cost reservation" (GAP-CT-05 acceptance).
- **Limits:** daily clock from the close: +15 collect, +40 retry, +60 cutoff, +75 issued (POLICY-002, POL:50-55; "still to be proven", ARCH:100-102). 30-minute checks are separate (ARCH:101). Logs 14 days, traces 30, run summaries 90 (ARCH:259). Alarms: missed daily run, stale collector, non-empty dead-letter queue, error rate (PH02-S13). Provider retries: at most 3 attempts, 2 and 8-second waits; normal workers 45 credits a minute of 55, leaving 10 for incidents and retries (PH03-S08). Streams: 15-minute limit, 5-minute idle timeout (PH02-S12). Stuck-run threshold: open (CT-05).
- **Hard rule:** "A health endpoint that reports OK while a dead-letter queue holds items or a daily run was missed fails its test" (PH08-S05). "When a span is missing or sampled out, the Activity view stays complete from the durable records" (PH02-S13).
- **Stories:** PH02-S06 MP-80, S12 MP-94, S13 MP-96, S07 MP-89; PH03-S09 MP-91, S10 MP-95; PH05-S07 MP-109; PH08-S05 MP-110.

### 2.4 Agents

- **Reads:** AgentManifest, ToolContract, RunRecord, EvalResult, MemoryNote, CostReservation.
- **Writes:** MemoryNote corrections and forgets, DeletionTombstone (PH05-S15). Manifests are not written at runtime: "Manifests change only through a reviewed code change, and a model, tool or budget change also needs the owner's approval" (PH05-S06).
- **Roster:** "7 Claude route agents and 5 code workers with no model" (FIX:343). Routes: triage, event analysis, structured factors, statement extraction, explanations and the briefing, chat, evaluation judges. Code workers: grader, bounded calibrator, challenger trainer, data steward, ops warden (PH05-S06). Models per ARC-06b: Haiku 5.5 triage, factors, extraction; Opus 5.5 event analysis; Sonnet 5.5 chat, explanations, briefing, judges.
- **States:** manifest draft; validated; active; superseded; invalid (fails closed); uncovered (PH05-S06). Worker idle; queued; running; awaiting_owner; cancelled; dead_lettered; failed (PH05-S07). Runner credit_unverified (every call refused); admitted; running; interrupted; refused_budget; reconciled; cache_cold (PH05-S05). Memory active; tainted; expired; corrected; forget_pending; forgotten (PH05-S15).
- **Owner actions:** read a manifest and its versions; compare versions; approve a model, tool or budget change; list, correct and forget memory notes. Agents have "no recovery authority" (PH08-S06) and "no operational authority" (PH08-S09).
- **Limits:** Opus at most three analyses a day (ARCH:206). Batch request 24-hour expiry (PH05-S02). 5-minute prompt-cache TTL, no cache-warming (PH05-S05). £15 Claude and evaluations allocation, shared across routes (PH02-S10, DL:69). Per-route daily caps: open (ARC-06b-O3). If the policy store is unavailable, every tool call fails closed (PH05-S06).
- **Stories:** PH05-S05 MP-101, S06 MP-104, S07 MP-109, S15 MP-115, S02 MP-85, S03 MP-93, S04 MP-97.

### 2.5 Models and Evaluations

- **Reads:** PromotionRecord, ModelVersion, EvaluationRun, Score, Eligibility, Prediction, Outcome, EvalResult, EvalLabel.
- **Writes:** OwnerApproval-backed PromotionRecord; EvalLabel by the owner (PH05-S13).
- **State machine:** candidate, offline_qualified, shadow, owner_approved, probation, active; any issuing stage may append paused or rolled_back; a failed candidate is rejected (SCI:109; PromotionRecord enums).
- **Trial states:** shadow (week n of 8); count paused (unscoreable week); awaiting maturity; ready for the owner; rejected; promoted (PH04-S18). Live: probation; active; slipping (bad-week run in progress); reverted; paused; awaiting the owner's restart (PH04-S19). Overlay: no overlay; overlay active; step in flight, awaiting matured pairs; rolled back; out of band, awaiting the owner; paused (PH04-S20). Challenger: candidate; offline_qualified; rejected; too large for Lambda; uncalibrated (abstains) (PH04-S13). Route: not_qualified; running; qualified; advisory_only; incomplete; expired (PH05-S13).
- **What a promotion binds:** exact artefact, calibrator, tasks, scope, evidence hash, limits, expiry, previous safe version (PH04-S18, SCI:113).
- **Owner actions:** compare a candidate with base rate and current rules; promote; reject; switch forward after a revert; restart a paused scope; approve the self-correction bands; label calibration samples; approve release thresholds.
- **Limits:** 8 scored weeks, beating base rate and current rules; an unscoreable week pauses the count (DL:199, DL:221). For 3, 6 and 12 months the 8 weeks check clean running and calibration; walk-forward history carries accuracy (DL:214). Probation 4 live weeks, revert after 2 bad weeks (DL:225). After that, 4 bad weeks running reverts (DL:217). Self-correction: 5 percentage points a week on probabilities, 10% a month on a signal's weight, code only (DL:196). Campaigns: 2 a month, 96 fits and 6 instance-hours each, 192 and 12 combined (POLICY-008, POL:137-141).
- **Automatic versus owner:** reverting is automatic; restarting a paused forecast or switching forward needs the owner (DL:219). If the previous model is ineligible (revoked rights, expired approval, invalid hash) the scope pauses instead of reverting (PH04-S19). POLICY-003's pause is scoped to the model or task, "not authority for a blanket application shutdown" (POL:71).
- **Separate gates:** the live model gate stays separate from release approval (PH08-S07). A judge score never stands in for a realised outcome or a promotion decision (PH05-S13).
- **Stories:** PH04-S08 MP-133, S09 MP-136, S13 MP-146, S17 MP-154, S18 MP-156, S19 MP-159, S20 MP-161; PH05-S12 MP-111, S13 MP-121; PH06-S09 MP-157.

### 2.6 Approvals and Configuration

- **Reads and writes:** ApprovalRequest, OwnerApproval, SensitiveAction, AuditEvidence (PH02-S03, PH05-S14, PH00-S06).
- **Proposed lifecycle:** draft, validated, awaiting_owner, approved, executing, succeeded/failed/reconcile_required; rejected, expired or cancelled proposals terminate without execution (GAP-CT-02, proposed, not approved).
- **Named states:** step-up not required; step-up required; approved and fresh; expired; refused: payload or version mismatch; revoked (PH02-S03). Pending approval; Approved and live; Expired; Revoked; Step-up required; Refused for a stale revision (PH01-S14). proposed; awaiting_step_up; approved; applied; expired; denied; rolled_back (PH05-S14). proposed; checking; unsupported; over_budget; awaiting_confirm; expired; confirmed; applied (PH05-S11).
- **Approval binds:** "owner, environment, action, payload sha256, expected record or configuration version and expiry" (PH02-S03). Rechecked at execution, including after a durable wait.
- **Approval evidence:** actor, target environment, prior/new version, payload hash, reason, affected forecasts, cost estimate, rollback plan (GAP-CT-02 acceptance).
- **Configuration in scope:** risk, ranking, agent and self-correction settings (PH05-S14); ranking policy versions (PH06-S05); listings and catalogue (PH03-S03, PH05-S11); risk-acceptance scopes (PH03-S02); alert thresholds and quiet-hour exceptions (PH06-S12); market profiles (PH09-S01); budgets (2.7).
- **A proposed change shows:** expected impact, evidence, cost, rollback (PH05-S14).
- **Rollback:** "a rollback creates a new version equal to the old one with its own audit record"; a change failing part way leaves the previous version current (PH05-S14).
- **Limits:** 15 minutes covers financial writes only; "POLICY-001's 15 minutes covers financial writes only" (MP40-Q9). A denied request backs off with a visible reason; no back-off value is given (PH05-S14). Listing marginal cost: about 44 credits a month, 7 for actions, 42 once, 286 for a US listing on 30-minute checks, 44 more for a new MIC (PH03-S03).
- **Schema gap:** `OwnerApproval.operation` allows only import, correction, reversal, baseline_rebase. Every non-financial approval rests on ApprovalRequest, which has no schema.
- **Stories:** PH02-S03 MP-78, PH05-S14 MP-114, PH05-S11 MP-131, PH03-S03 MP-74, PH03-S02 MP-63, PH06-S05 MP-135, PH06-S12 MP-138, PH01-S14 MP-55, PH09-S01 MP-171.

### 2.7 Costs and Budgets

- **Reads:** CostReservation, QuotaReservation, RunRecord, JobRecord, ReleaseEvidence (PH02-S07 to S10, PH06-S03, PH08-S08).
- **Writes:** allocation and threshold changes through settings (PH06-S03: "budget changes are settings (PH05-S14)"; PH02-S08: "in admin, not on the meter").
- **Must stay in the main app:** "The cost view is never only in admin; it is one tap from the home view" (PH06-S03). Meter and spend views are read-only for budgets.
- **Reservation states:** reserved; dispatched; ambiguous; settled; cancel_pending; released; refused (PH02-S09; transitions RES). Encumbered cash = settled + outstanding unreconciled liability + future fixed commitments + open reservations (CS:93).
- **Collector:** fresh; stale (AWS older than 36 hours, Anthropic older than one window); partial (page cap reached); failed; reconciled (PH02-S07). Meter: current; stale; partial; unknown credit; discrepancy shown; collector failed (PH02-S08). Thresholds: normal; warning; reduced; optional work paused; stale billing: optional admission blocked; Apple fee month (PH02-S10). PH06-S03 adds estimated_only and unknown. Proof: within the plan; past the warning; past the ceiling; unmeasured (PH08-S08).
- **Owner actions:** drill from a spike to runs, jobs and releases (AOR:20 `[history]`); see estimate, usage and bill side by side; change a threshold or allocation; approve paid Claude use beyond credit.
- **Limits:** £100 ceiling; £70 plan, £30 reserve; warn £60, reduce £75, pause £85 (ARCH:269-270, FIX:14-22). Allocations: data £30, AWS £22, Claude and evaluations £15, uncertainty £3, "Planning ceilings, not separate pots" (FIX:39-47). Top-5 scan £5 a month, overrun stops at the Claude cap (PH02-S10). Sign-in, ledger reads, audit and recovery stay available at every threshold (PH02-S10, TS:163). Lag: estimates live, Anthropic every six hours, AWS daily (ARCH:266-267). Cost Explorer: 120 pages a month (CS:99, PH02-S07). Cash in the month an invoice is due, never amortised (TS:203).
- **Credit:** "Unknown shared credit stays unknown" (PH02-S08). Admissible credit is zero today; optional Claude is refused whatever the cash headroom (PH02-S09, COST-AT-05). No paid fallback by itself (TS:204).
- **Selected months:** £46.48 Claude off; £54.73 Claude option A; £51.48 or £59.73 with the scan at its cap (TS:178-183).
- **Stories:** PH02-S07 MP-89, S08 MP-100, S09 MP-90, S10 MP-103; PH06-S03 MP-142; PH01-S02 MP-42; PH03-S08 MP-70; PH08-S08 MP-112; PH09-S03 MP-173.

### 2.8 Incidents and Recovery

- **Reads and writes:** IncidentRecord, NotificationIntent, ReplayRequest, RecoveryExercise, ReleaseEvidence, RunRecord, JobRecord, PromotionRecord (PH08-S01 to S09).
- **Incident states:** open; acknowledged; mitigated; resolved; reopened (PH08-S05). "Code opens incidents. The owner acknowledges and resolves them. Agents cannot close an incident." Closes only with a recorded resolution; reopens if the fault recurs.
- **Alert classes:** financial risk, system security, data quality, billing, job failure (PH08-S05, CT-18). Alerts for a missed forecast run, a stalled collector, stale billing, dead-letter depth, expired source access, out-of-order conversation events. Investment risk alerts are a separate class from operational incidents (PH06-S12). A downstream outage produces one incident with linked symptoms (GAP-CT-18 acceptance).
- **Other incident sources:** source disagreement beyond tolerance raises a quality incident, both hashes kept (PH03-S05). A failed exercise opens one (PH08-S03, PH08-S04). A replay stopping at its bound escalates to one (PH08-S06). A job past the stuck-run threshold raises one (PH02-S06).
- **Replay states:** eligible; auto-retrying; bound reached: escalated; awaiting the owner; replayed; refused (PH08-S06). A ReplayRequest records scope, reason, items, idempotency keys and, where needed, the owner's approval.
- **Automatic allowlist:** retry an idempotent job within its bounds; replay a dead-letter item up to a limit; re-run a missed collection; resume a durable workflow (PH08-S06). The limits themselves are open (CT-14).
- **Replay rules:** preserves the original business id, new attempt and trace links, no double commit or notify; rechecks permissions, retention, deletion and latest config (GAP-CT-14 acceptance).
- **Restore states:** scheduled; running; reconciled; mismatch; failed; overdue (PH08-S03). Rollback rehearsal: passed; partial; failed; overdue (PH08-S04). Release: built; deployed to dev; awaiting the owner; released; rolled back; blocked: failed gate or drift (PH08-S01). Gate report: green; failed; incomplete; waived by the owner, in the owner's words; stale (PH08-S07). Runbook: drafted; walked through; failed step; signed off by the owner (PH08-S09).
- **Owner actions:** acknowledge; resolve; approve a broad replay, financial reprocessing or new paid call; approve switching authority to a restored copy; approve switching forward; start a release; waive a gate in words; use pause switches ("optional work, a forecast scope under POLICY-003, a feature", PH08-S09).
- **Limits:** restore every month and after any storage, import or audit change (PH08-S03). Rollback by Lambda alias to the previous release (PH08-S01). Failed exercise blocks the next release until fixed and re-run. Restore covers ledger, audit, approvals, originals, forecasts and outcomes, model pointers, reconciled by counts, hashes and financial balances. RPO and RTO: "agreed and recorded per record class", values open (CT-14).
- **Note:** no record uses "kill switch". The nearest are PH08-S09's pause switches and POLICY-003's automatic scoped pause.
- **Stories:** PH08-S01 MP-106, S03 MP-108, S04 MP-118, S05 MP-110, S06 MP-119, S07 MP-122, S09 MP-126; PH04-S19 MP-159; PH06-S12 MP-138; PH07-S07 MP-167, S08 MP-162.

### 2.9 Identity and Devices

- **Reads and writes:** IdentitySession, SensitiveAction, AuditEvidence, OfflineSnapshot, ClientState (PH02-S01, S02, S03, PH07-S03, S04, PH06-S04).
- **States:** signed out; signed in, fresh; session expired; provider unavailable; link pending verification; denied: wrong environment or not the owner (PH02-S01). two or more paths healthy; one path left: warning shown; recovery in progress; device revoked; locked out: only the written procedure applies (PH02-S02). Offline copy fresh; cached_aged; offline; revoked_cleared; corrupt_rebuilt (PH07-S04). App installed; expiring_soon; expired; reinstalled; unsupported_os (PH07-S03).
- **Owner actions:** link, unlink, revoke a session or device, enrol a passkey, run lost-device recovery; see the recovery inventory. "Only the owner links, unlinks, revokes or enrols, each with step-up" (PH02-S02).
- **Lost device:** from another path, sign in with step-up, revoke the lost device, enrol a replacement passkey; each step audited (PH02-S02). A recovery interrupted midway leaves old paths intact.
- **Limits:** at least two independent recovery paths (PH02-S02). Providers: Cognito with Google and passkeys; Sign in with Apple waits for the paid Apple Developer Program (ARCH:250-251, DL:208). One user pool per account, Essentials or Plus (PH02-S01). Apple builds expire after 7 days (PH07-S03). Revocation closes streams "within the revocation time the owner approves" (value open, CT-17). No financial write offline (PH07-S04). Repeated failed sign-ins are rate-limited without revealing whether an account exists (PH02-S01).
- **Outside the app:** the owner's AWS Identity Center role is prod describe-only with no ledger reads; "break-glass admin needs MFA, lasts an hour and raises an alarm" (RN:142, marked proposed in ARCH:282-283). That is AWS access, not an MP screen `[inferred]`.
- **Stories:** PH02-S01 MP-73, S02 MP-87, S03 MP-78, S11 MP-83, S12 MP-94; PH06-S04 MP-134; PH07-S02 MP-168, S03 MP-164, S04 MP-165, S05 MP-166.

---

## 3. Permission inventory (draft)

**How to read.** "Yes" means a story or owner record requires a fresh sign-in or step-up for this act. "Open" means no record says, so CT-01 decides. Even a "Yes" has no approved freshness window or assurance level: "No exact time window or assurance level is approved by this direction" (DL:77). CT-01's matrix is proposed: import confirmation, deletion, replay, credential linking and recovery, budget expansion, model promotion. Local Face ID, a refreshed token or an open app never counts (PH02-S03).

**Audit column.** AuditEvidence is the record unless named otherwise. `operation` is a free string and the only name in the examples is `publish_owner_confirmed_import` (financial/contract-examples.json:340). No operation vocabulary is approved (CT-03), so none is invented here. Every sensitive act also carries the approval id and an opaque auth evidence reference, never a token (PH02-S03, DL:75).

| # | Admin action | Journey | Step-up | Audit record | Source |
| --- | --- | --- | --- | --- | --- |
| 1 | Read audit, query lineage | Audit | No, read; freshness of source access open | Source access has "privacy-safe evidence" | PH01-S04; CT-03 acceptance |
| 2 | Open an original or its extracted text | Files | Open (CT-01); needs "current owner authorization and a short-lived access path" `[history]` | Access event; class open (CT-03) | AOR:61 |
| 3 | Read cost, runs, health | Costs, Runs | No: read access is "distinct from controls" | None named | GAP-CT-16 |
| 4 | Upload a file | Files | Open (not on the matrix) | AuditEvidence, SourceReceipt | PH01-S06 |
| 5 | Decide a duplicate collision | Files | Open | New draft revision; audit class open | PH01-S12 |
| 6 | Cancel a draft | Files | Open | Open (CT-03) | FP:53-83 |
| 7 | Approve an import | Files, Approvals | Yes | OwnerApproval, AuditEvidence, CommitReceipt in the same logical commit | PH01-S14, PH01-S04 |
| 8 | Approve a partial group set | Files | Yes | New hash, as 7 | POLICY-005 |
| 9 | Revoke an approval before commit | Approvals | Open. "Neither MP-55 nor CT-01 names it" | Open (records revoked_at) | J:shell:285; OwnerApproval schema |
| 10 | Approve a correction | Files | Yes | OwnerApproval, LedgerEvent links, AuditEvidence | PH02-S03, PH01-S18 |
| 11 | Approve a reversal | Files | Yes `[inferred from "corrections"; operation is its own enum value]` | As 10 | PH01-S18, schema |
| 12 | Approve a baseline rebuild | Files | Yes, 15-minute window | As 10, new generation | POLICY-012 POL:201 |
| 13 | Financial reprocessing | Files, Incidents | Yes | ReplayRequest, AuditEvidence | PH08-S06 |
| 14 | Non-financial reprocess into a new draft revision | Files | Open; a new revision voids any approval | New revision; audit class open | PH01-S08 |
| 15 | Record an orphan's disposition | Files, Audit | Open | "recorded disposition"; actor unnamed | PH01-S05, FS:43 |
| 16 | Delete an original | Files | Yes | DeletionTombstone, AuditEvidence | PH01-S05, PH02-S14 |
| 17 | Renew or extend an original | Files | Yes | AuditEvidence | PH01-S05, PH02-S14 |
| 18 | Request an export | Files | Yes, "fresh sign-in for the request" | AuditEvidence (owner, environment, revision) | PH01-S26 |
| 19 | Download an export | Files | Open | AuditEvidence | PH01-S26 |
| 20 | Delete a stored export | Files | Open | AuditEvidence | PH01-S26 |
| 21 | Revoke an export link early | Files | Open; the behaviour itself is open (FIN-OD-08) | Open | FOD:147 |
| 22 | Correct a memory note | Agents | Open | New version; class open | PH05-S15 |
| 23 | Forget a memory note | Agents | Open | DeletionTombstone | PH05-S15 |
| 24 | Approve a route model, tool or budget change | Agents | Open; a budget change is Yes under 34 | Manifest version; audit class open | PH05-S06 |
| 25 | Promote a model | Models | Yes, "fresh authentication bound to the exact payload" | PromotionRecord, OwnerApproval, PromotionDecision | PH04-S18 |
| 26 | Reject a candidate | Models | Open | PromotionRecord (to rejected) | PH04-S18 |
| 27 | Switch forward after a revert | Models | Open; drawn with a fresh sign-in, tagged `Proposed · CT-01` | PromotionRecord | PH04-S19; J:approvals:296 |
| 28 | Restart a paused scope | Models | Open; same | PromotionRecord, tagged `Proposed · POLICY-003` | DL:219; J:approvals:302 |
| 29 | Approve self-correction bands | Models, Config | Yes `[inferred: a sensitive setting]` | Audit, setting version | PH05-S14 |
| 30 | Label calibration samples, approve release thresholds | Models | Open | EvalLabel | PH05-S13 |
| 31 | Change a sensitive setting | Config | Yes | ApprovalRequest, OwnerApproval, AuditEvidence | PH05-S14 |
| 32 | Roll back a setting | Config | Open | New version, "its own audit record" | PH05-S14 |
| 33 | Approve a ranking policy version | Config | Open | Policy version | PH06-S05 |
| 34 | Change a threshold or allocation | Costs | Yes | Audit, new version | PH02-S10, PH02-S08 |
| 35 | Approve paid cash beyond credit | Costs | Yes | Audit | PH02-S09 |
| 36 | Confirm a watch-only listing or segment | Config | "the authentication PH-02 requires for a configuration change": level open; drawn `Proposed · CT-01` | Catalogue version, owner approval record | PH03-S03, PH05-S11 |
| 37 | Set or withdraw a risk-acceptance scope | Config | Open | Entitlement, AuditEvidence | PH03-S02 |
| 38 | Activate or deactivate a market extension | Config | Open | ExtensionApproval | PH09-S01 |
| 39 | Approve alert thresholds or a quiet-hour exception | Config | Open; edits are "versioned/audited" | Audit, policy version | PH06-S12; CT-18 |
| 40 | Acknowledge or resolve an incident | Incidents | Open | IncidentRecord; recorded resolution | PH08-S05 |
| 41 | Broad replay or a new paid external call | Incidents | Yes | ReplayRequest with the owner's approval | PH08-S06 |
| 42 | Approve switching authority to a restored copy | Incidents | Open | RecoveryExercise; AuditEvidence read | PH08-S03 |
| 43 | Use a pause switch by hand | Incidents | Open; only the runbook names them | Open | PH08-S09 |
| 44 | Start a prod release | Incidents | Not an MP step-up: a GitHub workflow only the owner can start | ReleaseEvidence (owner's start) | PH08-S01, DL:203 |
| 45 | Waive a release gate | Incidents | Not an MP step-up: "in words" | ReleaseEvidence, owner's words | PH08-S07 |
| 46 | Link an identity | Identity | Yes | Audit, opaque references | PH02-S01, S02 |
| 47 | Unlink a path | Identity | Yes | Audit | PH02-S02 |
| 48 | Enrol a passkey | Identity | Yes | Audit | PH02-S02 |
| 49 | Revoke a session or device | Identity | Yes | Audit | PH02-S02 |
| 50 | Cancel a recovery in progress | Identity | Open | Audit `[inferred: "each step is audited"]` | PH02-S02 |

**Not in-app controls.** Retention changes "need the owner and go through Terraform" (PH02-S13). Billing collector role changes need the owner (PH02-S07). Lifecycle rules are in Terraform (PH02-S14). Plan tier changes are a separate owner decision with recosting (PH03-S03). Terraform applies to prod run only through the release route (PH08-S01). A screen may show these and link to the procedure; it may not offer a button `[inferred]`.

**Refused: draw the refusal, offer no control.**

| # | Refused act | Refusal source |
| --- | --- | --- |
| R1 | Edit the ledger outside the controlled writer | PH00-S06 negative; PH02-S05; PH02-S11 |
| R2 | Edit a projection by hand | PH01-S16 |
| R3 | Edit a stored observation, the owner included | PH03-S05 |
| R4 | Move a frozen cutoff or backdate an origin, the owner included | PH03-S09 |
| R5 | Promote with fewer than 8 scored weeks, failing a comparator, or with a different artefact, an expired approval or a changed evidence hash | PH04-S18 |
| R6 | Delete evidence without a recorded tombstone | PH00-S06 negative |
| R7 | Edit or delete an audit record outside the approved deletion policy | PH01-S04 |
| R8 | Household or multi-user administration | PH00-S06 negative |
| R9 | Remove the last usable sign-in path | PH02-S02 |
| R10 | Recover by email equality, SMS or a support route | PH02-S02 |
| R11 | Destructive restore into production | PH08-S03 |
| R12 | Replay across environments | PH08-S06 |
| R13 | Rehearse a rollback in prod | PH08-S04 |
| R14 | Any settings change granting a route a tool, source, budget, infrastructure permission or approval authority | PH05-S14 |
| R15 | Force a partial publish | PH01-S15 |
| R16 | A financial write offline | PH07-S04, PH06-S04 |
| R17 | Any runbook step bypassing the writer, step-up or release workflow | PH08-S09 |
| R18 | Make an original public | PH01-S05 |
| R19 | A trade or an order | ARCH:52 |

---

## 4. Hard limits

| Limit | Wording | Source |
| --- | --- | --- |
| One controlled writer | "One controlled writer commits to the ledger, and only an exact change the owner approved." "Only the ledger writer can write the ledger; the API, agents and other workers cannot." The writer has no ledger deletes | ARCH:48-49; PH02-S05; RN boundary matrix |
| Atomic commit | Appears "all at once or not at all"; a staged, failed or cancelled commit is invisible to every reader | PH01-S15 |
| Append-only history | A correction is a new version; "the original forecast is never rewritten" | ARCH:46-47 |
| Model promotion evidence | "No admin action ... promotes a model without its evidence"; "A challenger model is promoted only by the owner, with its evidence" | PH00-S06; ARCH:49 |
| Tombstone | "No admin action ... deletes evidence without a recorded tombstone." "Deletion never removes ledger history or audit records; it removes content only" | PH00-S06; PH01-S05 |
| No automatic deletion | "reaching 24 months raises a renewal prompt, never a delete"; `automatic_deletion_authorised: false` | PH02-S14; FIX:164 |
| Restore never resurrects | "tombstones are applied before restored content is readable" | PH01-S05 |
| Rollback keeps history | "A rollback never deletes a forecast, an outcome or an audit record" | PH08-S04 |
| One owner | "No household or multi-user administration is designed; MP has one owner" | PH00-S06 |
| No trade | "It cannot trade. No broker credentials, no order path, no personalised advice" | ARCH:52 |
| Agents read-only | "Agents cannot write the ledger, publish or change a forecast, promote a model, read secrets or trade"; tools "allowlisted and read-only by default" | ARCH:216-218 |
| No agent approves | "Agents may draft a proposal but never approve or execute it. Nobody approves on the owner's behalf" | PH02-S03 |
| Agents in recovery | "No agent edits infrastructure, buys a provider, raises spending or deletes evidence" | PH08-S06 |
| No authority by setting | No settings change widens authority; a memory note or chat message "can draft a change but never apply one" | PH05-S14 |
| Protected actions fail closed | "protected actions fail closed if adequate proof cannot be obtained" | DL:73 |
| Execution rechecks | Authority rechecked "at execution, including after a durable wait" | DL:75 |
| No silent paid fallback | "No paid fallback switches on by itself, and no feature is cut silently to save money" | TS:204 |
| Essentials stay up | Sign-in, ledger reads, audit and recovery at every threshold | PH02-S10 |
| No over-claiming integrity | "A hash chain alone is never described as tamper-proof"; "An append-only API is not by itself tamper-proof against privileged administrators" | PH01-S04; GAP-CT-03 |
| Missing is not zero | "An unknown or unreconciled amount is shown as unknown, never as zero" | PH06-S03 |
| Missing is not green | "A missing or failed gate is never green"; a missing run "is incomplete, never green" | PH08-S07; PH05-S12 |
| No secrets on a screen | Audit holds references only; incidents "carry no holdings or secrets" | PH01-S04; PH08-S05 |
| UX is not permission | "UX approval is never read as permission to build, to apply Terraform or to spend" | PH00-S07 |

---

## 5. The shared story

Every figure below is illustrative in the owner journeys and must be reused, not redrawn. Lesson 27: one moment shows one set of figures. Lesson 37: a figure beside its inputs is computed from them.

**Wording rules to reuse.** Open items carry the chip `Proposed · <id>` (J:approvals:23). Who did what: "Claude drafted", "Code checked", "You decide" (J:approvals chain). Step-up: "Opening the app with Face ID, or an open session, is not enough. The server checks a fresh sign-in." (J:approvals:162). No trade on every import screen: "This records what already happened at your broker. It places no trade." (J:holdings:32; lesson 33). Reverts: "Reverts by code are marked Automatic, and never read as your decision." (approvals `aa-record` note). Silence: "Silence is not a sign that nothing is wrong" (J:privacy:146).

**The clock.**

| Fact | Exact wording | Source |
| --- | --- | --- |
| Normal | "As of 21:15 London · data cutoff 21:00 · 7 of 7 priced" | J:home:150 |
| Failure | "Twelve Data failed at 21:14. Last good run Mon 21:15 · cutoff 21:00." | J:home:125 |
| Short form | "Last good run Mon 21:15 · cutoff 21:00" | J:forecast:54 |
| Stale | "Held from Mon 21:15" | J:forecast:55 |
| Late price | HSBC "Last price 14:10", detected Tue 16:50 | J:approvals:345; J:privacy:138 |
| Run notice | "Forecast run finished", "21 runs · yesterday 21:30" | J:privacy:140 |
| Next run | "Tonight 21:15" | J:approvals:192 |
| Generic failure time | "It failed at 21:14." | J:privacy:147 and others |
| Stale snapshot | "From 14:10." | J:privacy:147 |

There is no run id, job id, incident id, trace id or request id in the owner journeys. The only opaque id is `apr_7f3c` (J:approvals:217). Admin will be first to mint these; stories require `request_id` and `trace_id` on errors (PH02-S11).

**The import and the ledger.**

| Fact | Exact wording or value | Source |
| --- | --- | --- |
| Queue row | "Confirm a statement import", "11 rows · ledger revision 213", "15 min once approved" | J:approvals:336 |
| File | ISA statement, Oct 2026; `isa-oct-2026-scan.pdf`; Scan, 4 pages, "11 rows in 5 groups" | J:holdings:190, 209 |
| Selection | "Statement import, 9 of 11 rows"; "ISA statement · 3 groups · against ledger revision 213" | J:approvals:311 |
| Binding | Draft revision 6; selected rows hash 7f3a…c21e; expected revision 213; approved 21:18; expires 21:33 | J:approvals:312 |
| Change | Apple 60 → 64 units; HSBC, HSBA · XLON 700 → 730; AstraZeneca 85 → 75; ISA cash £4,012.60 → £4,142.83 | J:approvals:313 |
| Left out | AstraZeneca dividend, duplicate; transfer in £500.00, pending | J:holdings:248 |
| Commit | "All 9 rows, all at once, at 21:22"; "Ledger revision 213 → 214"; receipt R-0213 | J:holdings:271-272 |
| Revoked | "You revoked this at 21:19, before the commit started" | J:approvals:318 |
| Too late | "The commit started at 21:22, before your revoke reached MP" | J:approvals:319 |
| Expired | "It expired at 21:33 with no commit started" | J:approvals:320 |
| Stale revision | "Your ledger moved to revision 214, so this approval for 213 can never commit." | J:approvals:322 |
| Lost race | "A newer change reached the ledger first, at revision 215." | J:holdings:284 |
| Failed commit | "Nothing is visible and your ledger stays at revision 213." | J:holdings:285 |
| Open differences | £12.40 cash, this statement; £8.15 cash, General account, Q3, "stays open across sessions" | J:holdings:196, 230 |
| Rebuild | Nippon India Nifty 50 BeES, "from 3 older statements" | J:holdings:228 |
| Earlier receipts | R-0212 General account Q3, 18 rows, 24 Oct; R-0211 AstraZeneca dividend, typed, 21 Oct; R-0210 ISA statement September, 12 rows, 6 Oct; R-0209 India demat September, 6 rows, 2 Oct; R-0204 Apple screenshot, reversed 12 Sep | J:holdings:217-221 |
| Refused uploads | `isa-scan-copy.pdf` (not a PDF), `isa-2019-to-2026.pdf` (oversized, `Proposed · MP40-Q1`), `demat-oct-locked.pdf` (`Proposed · MP40-Q2`); upload stopped at 62% | J:holdings:203-206 |
| Refused reversal | "A sale on 2 Nov depends on these units." | J:holdings:275 |
| Portfolio | £84,612.40; stale "Known value, 6 of 7 priced" £78,508.20; cash £5,542.85 shown apart | J:home:153; J:holdings:149 |
| Holdings | Apple, NVIDIA, SPDR S&P 500 ETF Trust, AstraZeneca, HSBC, Reliance, Nippon India Nifty 50 BeES | prism/index.html:1500-1508 |

**Export and originals.** Pinned to "Revision 213 · root 9f3a…c21" (J:privacy:198). "Ready · link valid 42 min" (:200). "Revision 214 published while this was building. This export stays on revision 213, whole" (:206). Originals: Broker statement Oct 2026, kept to Oct 2028; Sep 2026, kept to Sep 2028; Holdings screenshot Aug 2026, kept to Aug 2028; Indian funds statement Dec 2024, due in Dec 2026 (:224). Holdings says 6 originals are kept (J:holdings:224). Delete target: "Broker statement, Sep 2026 · version 3"; "The two ledger events it supported stay, marked evidence unavailable." (:247, :257). Deleted row: "Removed 2 Oct · evidence unavailable" (:230). Restore: "A restored backup holds this copy until its deletion record is applied again." (:254).

**Decisions, models, settings.**

| Fact | Value | Source |
| --- | --- | --- |
| Waiting | "4 decisions wait on you"; next "Taiwan Semiconductor, 18:00" | J:approvals:393 |
| Listing | TSM · XNYS · watch-only, expires today 18:00; catalogue v14 to v15; 18,360 → 18,411 credits a month, 42 once; payload 2d7a…b310 | J:approvals:67-72, 176 |
| Promotion | Promote R2-HGB v4; artefact 4be1…09fa; calibrator c7 → c8; evidence 9c1e…44ab; payload a81f…60de; previous safe R2-HGB v3; expires Fri 18:00 | J:approvals:125-129, 175 |
| Scores | Brier: v4 0.188, rules 0.197, base rate 0.203, tagged `Proposed · SCI-D03` | J:approvals:127 |
| Outcome | Decided Wed 4 Nov, 09:14; approval apr_7f3c; "It writes forecasts from tonight's run." | J:approvals:184, 217 |
| Band | "Narrow a self-correction band", 5 to 4 points a week; settings v9 → v10; payload 1b7c…d3e4; expires Mon 9 Nov, 18:00; conflict: "Settings v10 was written at 09:01" | J:approvals:177, 221-235 |
| Revert | R1-LGB v2 reverted to v1, India midcap, 3 months, Code, Mon 22:20, 2 bad weeks on probation (weeks of 19 and 26 Oct: 0.231 v 0.219, 0.228 v 0.217) | J:approvals:202, 272 |
| Forward | R1-LGB v2, 7e20…c4d1, calibrator c5, Models v22, b3f6…2a90 | J:approvals:263 |
| Pause | US tech, 12 months paused, "Previous model not eligible", Tue 21:20; R2-HGB v3, 91d4…e7b2, c7, "None eligible" | J:approvals:264, 354 |
| Record rows | Taiwan Semiconductor added, Wed 09:02; Watch Barclays, expired Wed 08:14; "Let the chat route add listings", Code, Tue 17:20, would widen authority; Statement import approval revoked, Fri 30 Oct | J:approvals:197-204 |

**Cost month** (illustrative, "day 18 of 30", J:cost:3-4).

| Fact | Value | Source |
| --- | --- | --- |
| Committed | £46.42 committed so far; forecast up to £59.73, "27p under the £60 warning" | J:cost:28-30 |
| Parts | Market data £27.84; AWS £11.18; Claude £7.06; Reserved £0.34 | J:cost:27 |
| Sum | Settled £38.40 + not yet reconciled £7.68 (usage £6.71, estimates £0.97) + open reservations £0.34 | J:cost:157 |
| AWS | Dev £2.96, Prod £7.80, Shared £0.42 | J:cost:89 |
| Claude | Dev £1.20, Prod £5.46, Local £0.40; top-5 scan £2.12 of £5 | J:cost:91-94 |
| Lanes | Reconciled billing daily, AWS to 17 Nov, age 15 h; Anthropic every six hours, to 18:00, age 3 h; internal estimates live, to 21:15 | J:cost:141 |
| Stale | "Billing 39 h old"; past 36, optional work waits, `Proposed · MP40-Q6` | J:cost:34 |
| Collector | "The AWS collector failed at 06:10"; figures stop at 16 Nov; "the month is at least £44.40" | J:cost:33, 160 |
| Disagreement | "17 Nov: estimate £0.71, bill £1.02. The bill counts, which takes the forecast past £60." | J:cost:37 |
| Reservations | Nightly explanations held £0.34; Event analysis 17 Nov settled £0.22; Top-5 batch 14 Nov refused, "£3.20 could cross the £5 cap" | J:cost:181-183 |
| Threshold days | Warned 20 Nov 06:14; reduced 23 Nov 06:14; paused 24 Nov 06:14 | J:cost:190-192 |

**Claude off.** "Claude stays off until credit is verified or you approve paid use, in Settings, with a fresh sign-in." (J:holdings:22, J:cost:110, word for word). Cost state: "No verified credit and no paid approval, so every Claude call is refused." Forecast £46.48 (J:cost:36). "Claude off: the month forecast is £46.48. Forecasts and figures run as usual, because Claude only explains." (J:cost:95). Scan: "This scan is queued and no model has read it." (J:holdings:213). Credit: "A reported credit is not proof, so admissible credit stays at zero." (J:cost:111). Maker's rule: "Ready shows Claude on, £54.73. Claude off is the No model state." (J:shell:273). Lesson 29: a Claude-off screen shows no Claude spend.

**Identity.** Devices: iPhone, active 40 min ago, Passkey; iPad, active 2 h ago, Google; Mac, Safari, active yesterday, Passkey; Phone web, active 3 days ago, Google (J:privacy:164). Paths: Passkey iPhone; Passkey Mac; Google, "Linked on proof of both"; "3 healthy" (:190-191). Revoked "21:02" (:174). Quiet hours "22:00 to 07:00 London" (:160). Memory notes: "Show the 6-month view first", expires Feb 2027; "Watch India midcap fees", expires Jan 2027, Untrusted source (:239-240).

**Two calendars.** The approvals story sits on Wed 4 Nov and the week around it (J:approvals:217). The cost month sits at day 18 of 30, with billing to 17 Nov (J:cost:141). They do not share a date. An admin screen joining cost to a run or a decision must pick one and say so; no record settles it.

---

## 6. Open owner questions inside these journeys

**A. Label table.** Chip format as in the owner journeys. Lesson 36: a claim the records leave open carries the id of the record that would close it. Lesson 39: a status says what the system knows.

| Id | Journey | Answered | Still open | Label on screen |
| --- | --- | --- | --- | --- |
| FIN-OD-08 | Audit, Files, Incidents | POLICY-010 core retention for the account's lifetime; POLICY-011 one-hour link to start a download (FOD:144-145) | "Record classification, protected integrity anchors, storage and index costs, deletion and restore-erasure, the stored export's retention period, and export revocation and in-progress transfer behaviour" (FOD:147) | `Proposed · FIN-OD-08` on any integrity claim, stored-export retention or early revoke |
| FIN-OD-02 | Approvals | POLICY-001 15 minutes; POLICY-005 subsets | "Authentication assurance, expiry, revocation and concurrency enforcement, and retry proof" (FOD:48). Strict commit-before-expiry is unproved (FP:321) | Say "must start within 15 minutes", never "completes within"; `Proposed · FIN-OD-02` on revocation |
| CT-01 | All | ARC-07 direction; the action list is proposed | The matrix, freshness window, assurance levels, recovery fallback | `Proposed · CT-01` on every "Open" row in section 3 |
| CT-02 | Approvals, Models, Config | 15-minute financial window only | Proposal expiry, allowed automatic adjustments, rollback policy, which acts need a second confirmation | `Proposed · CT-02` on any non-financial expiry; every expiry drawn is illustrative (J:shell:277) |
| MP40-Q9 | Config | None | How long a chat-proposed catalogue change waits | `Proposed · MP40-Q9` |
| CT-03 | Audit | Separate durable audit from logs; unsampled (PH01-S04) | Audit record classes, privileged threat model, integrity-check mechanism, evidence retention | `digest_only` shown as such; `Proposed · CT-03` on classes |
| CT-04 | Files, Incidents | 24-month renewable originals, no auto-delete, tombstones before availability | Record-class durations, backup expiry and deletion limits, retained tombstone data, models trained on deleted sources | `Proposed · CT-04`; completion shows requested, in_progress, completed or partially_failed with stores and residual retention (CT-04 acceptance) |
| CT-05 | Runs | Crash-surviving records direction | Timeout and stuck-run thresholds, run summary schema, content versus metadata policy | `Proposed · CT-05` on "stuck" |
| CT-13 | Costs | £100, £70, £30, £60/75/85, allocations | Suballocations by feature and environment, stale and unknown-credit thresholds, emergency minimum functions | `Proposed · CT-13` |
| MP40-Q5 | Costs, Agents | None | Whether to adopt an Anthropic admin key; until then Claude usage shows unavailable | `Proposed · MP40-Q5: Anthropic admin key` (J:cost:152) |
| MP40-Q6 | Costs | None | 36-hour billing block, 30-minute credit proof, £15 emergency window | `Proposed · MP40-Q6` |
| COST-Q3 | Costs | Q1, Q2, Q4 answered 3 Nov (CS:105-110) | AWS compute and storage of the ~150-name scan | "Not yet measured", `Proposed · COST-Q3` |
| CT-14 | Incidents, Runs | Bounded direction; allowlist named in PH08-S06 | Incident classes, automatic allowlist approval, replay limits, RPO and RTO, escalation path | `Proposed · CT-14` on every limit, RPO and RTO; no number |
| CT-16 | All | Eight domains, owner-only scope, cost in main app | Launch minimum versus later depth, navigation and domain boundaries, action permissions | `Proposed · CT-16` on any launch-or-later marking |
| CT-17 | Identity | Cognito, Google, passkeys, two paths, verified linking | Trusted origins and RP IDs, recovery inventory, session and stream revocation latency, loss-of-all-devices procedure | "in a time you approve" (J:privacy:184), `Proposed · CT-17`; no number |
| CT-18, MP40-Q11 | Incidents, Config | 07:30 brief, 22:00 to 07:00 quiet hours | Material and critical conditions, quiet-hour exceptions, grouping and cooldowns, emergency channel, weekend brief | `Proposed · CT-18` or `Proposed · MP40-Q11` |
| SCI-D03 | Models | SCI-OA-04: 8 weeks, pause rule, long-horizon reliance | Folds, final test, hurdles, how rules get a proper score, what a scored week is per horizon | `Proposed · SCI-D03` |
| SCI-D07 | Models, Incidents | 2 and 4 bad weeks | Bad-week metric, pairing, minimum count, exact safety triggers, first-promotion comparator | `Proposed · SCI-D07` |
| SCI-D10 | Models, Config | 5 points a week, 10% a month | Window readings, overlay lineage, one step in flight per horizon | `Proposed · SCI-D10` |
| FIN-OD-07 | Config | POLICY-006, weights 35/40/25 | Normalisation, comparability, ties, action thresholds | `Proposed · FIN-OD-07` |
| DATA-DEC-02 | Runs, Costs | None | Close, NAV, FX and quote freshness; cache and retry rules | `Proposed · DATA-DEC-02` |
| DATA-DEC-04 | Config, Files | None | Grant-withdrawal treatment of datasets, backups, models, reproducibility records | `Proposed · DATA-DEC-04` on "disposition pending" |
| DATA-DEC-14, DATA-DEC-15 | Config, Models | None | Basic beside Grow accounts; Yahoo as training input | Named when a screen touches them |
| MP40-Q1, MP40-Q2 | Files | None | Upload limits; PDF unlock | As drawn: `Proposed · MP40-Q1`, `Proposed · MP40-Q2` |
| MP40-Q12 | All on web and phone web | None | Device matrix, what the app may keep offline, what "Duo" means | `Proposed · MP40-Q12`, "What a browser keeps offline is open." (J:approvals:25) |
| ARC-06b-O2, O3, O4 | Agents | Models per route | Refusal fallback; per-route daily caps; prompts, tool lists and qualifying cases | `Proposed · ARC-06b-O3` and so on |
| Credit proof (CT-13, RES) | Agents, Costs | Zero Claude calls until the shared credit is verified | How credit is proved: `org_wide_credit_allocation_proof` is "Required, currently unproven" (RES); the $200 credit is "unverified" (TS:129) | "Credit unknown"; no id closes the proof step by name beyond CT-13 |
| MP40-Q4, MP40-Q7 | Incidents | Cost-guard SCP, N0 | Three further SCPs; lockdown at PH-08 | Named only if a screen shows guard rails |
| PL-04 | Runs, Identity | None | SSE streaming proof; until then clients poll | `Proposed · PL-04` on live status |

**B. Conflicts and holes the records leave. Each is a question for the owner, not a guess.**

1. **Passkey on iPhone.** PH07-S03: "No TestFlight, Apple push, Sign in with Apple or on-device passkeys is used until the owner says to join the Developer Program", and app sign-in is Google through the system browser. TS:135 puts "passkeys on a device" with the paid program. J:privacy:164 and :190 show iPhone sessions and paths as Passkey, and :58 says "Use a passkey on your iPhone or Mac". PH02-S02's example inventory is "passkeys on two separate devices plus the verified Google link". Whether a phone web or browser passkey covers this is not recorded. Closes under CT-17 and PL-09, with the owner's Apple decision (DL:208). Identity must not extend the iPhone passkey fact until answered.
2. **Settings or admin.** Budget changes are "in admin, not on the meter" (PH02-S08), "settings (PH05-S14)" (PH06-S03), and "in Settings" (J:cost:110, :368). PH05-S14 lists its UX as "settings and approvals (admin journeys, ARC-08)". Closes under CT-16.
3. **Restart evidence has no open id.** POL:72 says restart evidence "still need specification". SCI-D05 closed and moved only "exact safety triggers and the worse-week scoring rule" to SCI-D07 (forecasting/open-decisions.json:92). The journey tags it `Proposed · POLICY-003` (J:approvals:57). Needs an owning id.
4. **`actor_type: admin`.** The AuditEvidence enum includes `admin`, while no admin role exists (PH02-S01, PH02-S02). Which actor an owner's admin act records is open under CT-03; I expect `owner` `[inferred]`.
5. **Non-financial approvals have no schema.** See 2.6. The expiry for "Approve" on a setting, a promotion and a restore switch all wait on ApprovalRequest and CT-02. Approvals drew "15 minutes after you approve" for switching forward and restarting as proposed (J:shell:290).
6. **Eight or nine journeys.** See section 2.
7. **Pause switches.** PH08-S09 names three; only the POLICY-003 scope pause has a rule. No contract, state or actor is recorded for a hand pause of "optional work" or "a feature". Closes under CT-14 or CT-16.
8. **Who cancels a run or records an orphan's disposition.** PH05-S07 and PH01-S05 state the outcome, not the actor.
9. **SIGN is behind the decision log** on COST-Q1, Q2, Q4, SCI-D09 and DATA-DEC-12, which it still shows as open at lines 107-128. DL:233-270 and CS:105-110 answer them. Use the decision log.
10. **Owner journey naming.** "ISA statement, Oct 2026" (J:holdings:190) and "Broker statement, Oct 2026" (J:privacy:224) both end at Oct 2028 and may be one file; nothing says so. Files must pick one and flag it back to MP-62.
