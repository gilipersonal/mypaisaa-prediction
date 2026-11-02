# Foundation policy discussion

**2 November 2026 · MP-20 · Planning decisions only · Baseline/UX/build unapproved**

This journal captures owner answers after Foundation Pack 1 commit `6e15f25a9fad41297ccf936b8bc1b5a06572fb81`. It is a draft decision receipt for later coordinated integration into the specifications; it does not silently rewrite that reviewed/fixed snapshot or approve its remaining proposals.

## Twelve selected policies at a glance

| Policy | Owner-selected direction | Important boundary |
| --- | --- | --- |
| 001 | 15-minute import/correction approval window | Exact approved content; trusted-writer submission, not guaranteed completion, before expiry |
| 002 | Ordinary daily forecast window of close +75 minutes | Collection +15, retry +40, frozen cutoff +60; source/processing verification required |
| 003 | Automatically pause affected forecasting scope and notify | Only advance-approved triggers; owner approval before restart; no replacement promotion |
| 004 | Downside/central/upside templates plus editable 3/5-year assumptions | Numeric assumptions need approval; no implied likelihood or forecast qualification |
| 005 | Allow explicitly approved complete transaction groups within imports | Fresh proposal; dependent entries stay together; unresolved entries remain pending |
| 006 | Require all three components for the combined recommendation score | Preserve growth/protection/opportunity weights 35/40/25; no missing-as-zero or silent reweighting |
| 007 | Trade-date holdings, separate cash settlement | Preserve source dates; no guessed settlement or double-counted cash |
| 008 | At most two shared experiment campaigns/month | 96 fits and 6 instance-hours each; cost/resource admission can allow less |
| 009 | Labelled analytical FIFO fallback when history supports it | Preserve broker figures; separate from tax basis; no invented history |
| 010 | Account-lifetime core financial/decision evidence | Deletion and permissions apply; original files and operational telemetry remain separate |
| 011 | One-hour private export download authorization | New authenticated request after expiry; separate from stored-export retention and financial approvals |
| 012 | Prepare versioned historical rebuild proposals when later uploads fill gaps | Reconcile and seek exact-content approval before activation; earlier predictions stay unchanged |

These are twelve selections within the existing policy groups, not twelve fully qualified implementations. The detailed receipts below define each selection's scope.

## Review choice

The owner selected **“Keep drafts; discuss remaining policies first”** in reply to `call_039cad3da1954dacab5e726ab828bfe5`. Review round 2 and the updated five-entry regression-ledger run are not authorised. The round-1 fixes retain maker verification only. No publication, PR, merge or issue closure is authorised by this discussion.

## POLICY-001 — Import and correction approval lifetime

**Owner-confirmed:** 15 minutes for the backend to start committing an exact approved holdings import or financial correction.

Source: `call_fbb81035f3be4a048388860eabf76349`, answer **“15 minutes (Recommended) — allow a practical confirmation window”**.

- Any change to the approved content requires fresh approval.
- An expired approval must be renewed before starting the commit.
- The window governs trusted-writer transaction submission; it is not a guarantee that a transaction completes before expiry.
- This confirms the duration and the exact-content/renewal conditions only. It does not approve all of `FIN-OD-02`: authentication assurance, revocation, concurrency and optional subset rules still require their stated specification and evidence.
- It grants no financial-write, implementation, cloud or deployment permission.

Integration target: [FIN-OD-02](foundation-specifications-2026-11-02/financial/open-decisions.json). The foundation pack's original two horizon receipts remain unchanged; this is a separate later policy receipt.

## POLICY-002 — Ordinary daily forecast timing

**Owner-confirmed, subject to verification:** use the 75-minute window after each eligible exchange close.

Source: `call_8cfe435833c74f3982cd154ad61360d9`, answer **“75-minute window, subject to verification (Recommended)”**.

| Clock | Relative to the eligible exchange close |
| --- | --- |
| Start ordinary collection | +15 minutes |
| Start the missing-data retry | +40 minutes |
| Freeze the information cutoff | +60 minutes |
| Complete forecast issuance | By +75 minutes, strictly before the next eligible session opens |

- Source availability and the processing path must be verified before activation. The window is a selected policy, not a proven service-level guarantee.
- Abstain if required data or processing cannot meet the frozen cutoff and issuance conditions. Do not move the cutoff or backdate actual ingestion to make late information eligible.
- Fund NAV retains its own publication schedule; this answer does not select NAV publication or FX freshness tolerances.
- The separate 30-minute quote/risk-monitoring cadence is unchanged.
- This confirms the ordinary daily-clock part of `SCI-D01` only. It does not approve the whole architecture, pending model-qualification policies, UX, implementation or paid/cloud operations.

Integration targets: [SCI-D01](foundation-specifications-2026-11-02/forecasting/open-decisions.json) and [daily-origin clock contract](foundation-specifications-2026-11-02/forecasting/task-catalogue.json). Round 2 remains paused.

## POLICY-003 — Automatic safety pause and owner-approved restart

**Owner-confirmed:** automatically pause an affected live model forecasting scope when a safety trigger approved by the owner in advance fires, and notify the owner. Restart requires owner approval.

Source: `call_0aae699a4f344ed79b9492e8e9850264`, answer **“Automatically pause the affected scope and notify me (Recommended)”**.

- Scope the pause to the affected model/task capability; this answer is not authority for a blanket application shutdown.
- Exact integrity/quality triggers, measurement windows, notification handling and restart evidence still need specification and advance approval. Illustrative trigger examples are not selected numeric thresholds.
- Invalid outputs remain withheld. This policy does not authorise automatic replacement, model promotion, calibration changes or restart.
- This confirms the safety-pause/restart authority part of `SCI-D05` only; model probation, qualification and remaining promotion controls stay subject to their separate requirements.
- This is a planning decision; no live model, configuration, service or account is changed. Round 2 remains paused.

Integration target: [SCI-D05](foundation-specifications-2026-11-02/forecasting/open-decisions.json).

## POLICY-004 — Editable three- and five-year scenario templates

**Owner-confirmed:** provide downside, central and upside templates plus editable custom assumptions for both three- and five-year investment scenarios.

Source: `call_4806f7b8b6a042729c4f1c6e30d05d99`, answer **“Three scenario templates plus editable assumptions (Recommended)”**.

- Make return, inflation, FX, contributions, fees and dividend-treatment assumptions explicit.
- Specific template values return to the owner for approval; this answer selects the template/custom-assumption approach, not numeric values or a return path.
- “Central” does not mean most likely. Do not attach likelihood percentages without separately validated evidence and the required approval.
- These are conditional scenarios, separate from the evaluated forecast tasks through 12 months. No predictive-accuracy claim or new model-qualification scope follows from this choice.
- This confirms the scenario-template approach within `SCI-D06`; detailed assumptions, calculation conventions and evidence remain to be specified. No UX, implementation, live computation or external publication is authorised. Round 2 remains paused.

Integration targets: [SCI-D06](foundation-specifications-2026-11-02/forecasting/open-decisions.json) and [separate scenario task](foundation-specifications-2026-11-02/forecasting/task-catalogue.json).

## POLICY-005 — Explicitly approved complete groups within an import

**Owner-confirmed:** allow an import to commit explicitly reviewed, complete transaction groups while unresolved entries remain pending.

Source: `call_1648c5ada46749309dff6c7c22f93621`, answer **“Allow explicitly reviewed, complete transaction groups (Recommended)”**.

- Generate a fresh exact proposal showing included and excluded entries. Row exclusions change the proposal/hash and require fresh approval; an earlier approval cannot authorise the changed subset.
- Preserve all required linked entries within each selected transaction group, including its cash movement, fees and other dependent entries. Do not split dependent transactions or publish an inconsistent subset.
- Keep unresolved entries pending and visible, with no silent dropping. This answer does not allow uncertain extraction to become verified financial truth.
- Apply the owner-confirmed 15-minute approval window to the exact new proposal. Existing duplicate, reconciliation, revision, scope and controlled-writer checks still apply.
- This confirms the subset policy within `FIN-OD-02`, alongside the separately confirmed duration. It does not resolve remaining authentication/concurrency evidence or authorise an actual financial write, UX or implementation. Round 2 remains paused.

Integration targets: [FIN-OD-02](foundation-specifications-2026-11-02/financial/open-decisions.json) and [import publication specification](foundation-specifications-2026-11-02/financial/specification.md).

## POLICY-006 — Complete evidence for the combined recommendation score

**Owner-confirmed:** require usable evidence for all three components before producing the combined recommendation score: growth 35%, downside protection 40%, benchmark-relative opportunity 25%.

Source: `call_ef9287ca79d24a19a6371f682ae8cacc`, answer **“Require all three components for the combined score (Recommended)”**.

- If any required component is unavailable or ineligible, withhold the combined score and explain the missing evidence. Independently supported components may still be shown with their evidence and limitations.
- Do not treat missing evidence as zero, silently reweight the remaining components or create a partial combined score under this policy.
- Preserve the owner-confirmed 35/40/25 weights. Component normalization, comparability, tie handling and add/hold/trim/rebalance thresholds still need specification and evidence.
- A complete component set is necessary, not sufficient: all other data, model and recommendation eligibility conditions still apply.
- This confirms the missing-component policy within `FIN-OD-07`; it does not authorise investment actions, model promotion, UX or implementation. Round 2 remains paused.

Integration target: [FIN-OD-07](foundation-specifications-2026-11-02/financial/open-decisions.json).

## POLICY-007 — Trade-date holdings with separate settlement

**Owner-confirmed:** recognize holdings exposure from the recorded trade date for historical purchases and sales in imported statements, with settlement tracked separately.

Source: `call_044a5d13043142bb8c235d896b158633`, answer **“Trade-date holdings; track settlement separately (Recommended)”**.

- Preserve both trade and settlement evidence. Track cash owed or due until the evidenced settlement, rather than counting unsettled obligations and settled cash twice.
- Flag missing settlement information; do not invent a settlement date or a cash movement. Withhold affected unsupported calculations while preserving independently supported analysis.
- This applies to imported history and recordkeeping; the app executes no trades.
- This confirms the trade/settlement recognition choice within `FIN-OD-03`. Backfill cutover, reconciliation, unsupported margin/negative positions and the rest of that policy group remain subject to their stated specification and evidence.
- No financial-write operation, UX, implementation or cloud action is authorised. Round 2 remains paused.

Integration target: [FIN-OD-03](foundation-specifications-2026-11-02/financial/open-decisions.json).

## POLICY-008 — Shared initial model-experiment ceilings

**Owner-confirmed:** allow at most two bounded model-experiment campaigns per month across dev and production combined.

Source: `call_2f0fe9f7c5d149ab9a23dc07c50aee2a`, answer **“Two bounded campaigns per month (Recommended)”**.

- Each campaign covers one declared prediction target, horizon and market group, with at most 96 training/calibration runs and six CPU training-instance hours. Combined monthly ceilings are 192 runs and 12 training-instance hours.
- Validation-fold training and calibration count toward the run ceiling. Additional target heads, seeds and ablations consume the same bounded allowance; do not multiply it across accounts, markets or horizons.
- Training-instance hours are distinct from vCPU-hours. Actual instance compatibility, hardware, job duration, memory and pricing remain subject to evidence; this answer is not a selection or deployment of an AWS instance.
- Qualification of different scopes is staged. Two campaigns do not promise that every required horizon or market is retrained or qualified every month. The agreed forecast horizons remain requirements.
- Approved models may continue daily inference independently of retraining, with separate 30-minute quote/risk monitoring where eligible.
- Cost admission, permitted data use and resource checks may allow less than these ceilings. The £100 all-in envelope, £70 operation/£30 reserve policy, no-uncovered-Claude-call rule and owner model-promotion approval remain in force.
- This confirms the campaign, fit and compute ceilings within `SCI-D04`; it does not approve all model/feature choices or authorise experiments, paid calls, jobs, UX or implementation. Round 2 remains paused.

Integration targets: [SCI-D04](foundation-specifications-2026-11-02/forecasting/open-decisions.json) and [evaluation resource protocol](foundation-specifications-2026-11-02/forecasting/evaluation-protocol.json).

## POLICY-009 — Labelled analytical FIFO fallback

**Owner-confirmed:** allow a clearly labelled internal analytical FIFO cost-basis calculation when adequate history supports it and no usable broker cost-basis figure is available.

Source: `call_6c6b94730d6445d7acdb76981bb52d6e`, answer **“Allow labelled analytical FIFO when history supports it (Recommended)”**.

- The analytical convention matches sales against the oldest supported purchase lots first. Keep the method, input history, adjustments and calculation version traceable.
- Preserve source-supported broker figures and their provenance. Do not silently overwrite or relabel them as the analytical fallback; explain differences where both are available.
- Keep this internal analytical result separate from tax-basis reporting. The selection makes no claim that FIFO represents the applicable tax treatment for any market or account.
- Do not invent missing purchase history, fees or corporate-action information. Withhold unsupported basis-dependent calculations while leaving independently supported analysis available.
- This confirms the analytical fallback part of `FIN-OD-05`. Detailed lot/fee/FX/action conventions and benchmark mapping still require specification and evidence. No calculation on actual holdings, UX, implementation or cloud operation is authorised. Round 2 remains paused.

Integration target: [FIN-OD-05](foundation-specifications-2026-11-02/financial/open-decisions.json).

## POLICY-010 — Core financial and decision evidence retention

**Owner-confirmed:** retain core ledger history, approvals, business audit records, model-promotion decisions and forecast/outcome evidence for the lifetime of the account, subject to explicit owner-deletion controls and source-permission restrictions.

Source: `call_d0e4505a4a914270bec346a2fb6c001f`, answer **“Account lifetime, with deletion and permission controls (Recommended)”**.

- Preserve the evidence needed for long-term evaluation, correction lineage and explanation, where retention is permitted. This is not authority to retain restricted content indefinitely.
- Keep the renewable 24-month original-file archive separate. Operational telemetry still follows the agreed 14-day logs, 30-day rich traces and 90-day run-summary policies; a run summary is not automatically a lifetime business-evidence record.
- Licensed raw observations, source excerpts and prompt content retain their own permission and privacy constraints. A metadata/audit retention policy does not override them.
- Specify deletion propagation, backup expiry and restore-erasure controls before activation. Restores must not silently resurrect deleted content; source removal must remain visible as unavailable evidence where an allowed record is retained.
- Storage growth, cost, access patterns and deletion/recovery behaviour remain to be verified. This answer does not establish tamper resistance or prove perpetual availability of supporting originals.
- This confirms the core-retention direction within `FIN-OD-08` and the forecast evidence lifecycle. Exact record classification, integrity anchors, physical storage design and export expiry remain to be specified. No deletion, cloud change, UX or implementation is authorised. Round 2 remains paused.

Integration targets: [FIN-OD-08](foundation-specifications-2026-11-02/financial/open-decisions.json), [financial evidence specification](foundation-specifications-2026-11-02/financial/specification.md) and [forecasting specification](foundation-specifications-2026-11-02/forecasting/forecasting-specification.md).

## POLICY-011 — One-hour private export download authorization

**Owner-confirmed:** a private export download link remains usable to start a download for one hour.

Source: `call_757dc9693a254e9abae487baf4a80f1c`, answer **“1 hour”**. This overrides the offered 15-minute recommendation for export links only.

- Require a new authenticated request to obtain a replacement link after expiry. Exact issuance, authorization binding, early revocation and in-progress transfer behaviour still need specification and verification.
- Link expiry governs access to start a download; it does not select the retention or deletion period for the stored export.
- Preserve private delivery and creation/access/deletion audit requirements. The one-hour choice does not authorise public sharing or remove owner/environment isolation.
- The financial import/correction approval lifetime remains 15 minutes under `POLICY-001`; export access does not extend or renew financial-write approval.
- This confirms export-access lifetime within `FIN-OD-08` only. No link, export, account setting, cloud resource, UX or application implementation is created by this answer. Round 2 remains paused.

Integration targets: [FIN-OD-08](foundation-specifications-2026-11-02/financial/open-decisions.json) and [financial export specification](foundation-specifications-2026-11-02/financial/specification.md).

## POLICY-012 — Versioned historical rebuild proposals

**Owner-confirmed:** when a later upload supplies older transactions that fill gaps behind an existing holdings snapshot, automatically prepare a proposed rebuilt history for owner review, subject to permission and cost gates.

Source: `call_821755fc641b43a386bc61a4feb756f7`, answer **“Prepare a versioned rebuild proposal for my approval (Recommended)”**.

- Show reconciliation differences and effects on historical performance. Proposal preparation does not activate a new financial history.
- Require exact-content owner approval before activation, using the selected 15-minute submission window and the controlled financial writer.
- If accepted history replaces an opening baseline, use an explicit cutover and a new version/projection generation. Do not add snapshot balances to the same reconstructed transactions or double count overlapping history. Preserve prior generations and correction lineage.
- Earlier predictions and their original input records remain unchanged. Revised financial calculations receive new versions; later knowledge must not be backdated into an earlier forecast.
- Missing or inconsistent evidence remains unresolved rather than becoming a fabricated balancing transaction. Preparation remains subject to normal data permissions, validation and cost admission.
- This confirms the backfill/rebase proposal direction within `FIN-OD-03`; exact recovery, concurrency and reconciliation proofs remain open. No actual import, recalculation of owner holdings, UX, implementation or cloud operation is authorised. Round 2 remains paused.

Integration targets: [FIN-OD-03](foundation-specifications-2026-11-02/financial/open-decisions.json) and [snapshot/backfill specification](foundation-specifications-2026-11-02/financial/specification.md).

## Remaining specification and evidence work

The following is a draft work inventory, not a plan-sync result or a claim that the architecture baseline is complete. It uses the local foundation proposals as its reference. Later coordinated integration must apply these twelve receipts without marking an entire policy group approved merely because one part was selected.

| Policy area | Selected in this discussion | Still proposed or unproven |
| --- | --- | --- |
| FIN-OD-01 | None | Precision, rounding and reconciliation limits need worked coverage and justified engineering defaults |
| FIN-OD-02 | Approval duration and complete-group subset policy | Authentication assurance, expiry/revocation/concurrency enforcement and retry proof |
| FIN-OD-03 | Trade-date recognition and rebuild-proposal workflow | Cutover/reconciliation/recovery proof, account edge cases and unsupported-position policy |
| FIN-OD-04 | None | XIRR domain, tolerances, finite resource budget, uniqueness certificate or abstention |
| FIN-OD-05 | Analytical FIFO fallback | Lot/fee/FX/action details, benchmark mapping and return conventions |
| FIN-OD-06 | None | Risk estimation windows, coverage, cross-market alignment and source freshness |
| FIN-OD-07 | All three components required, existing 35/40/25 weights retained | Validated normalization, comparability, tie handling and action thresholds |
| FIN-OD-08 | Core retention direction and one-hour export access | Record classification, protected integrity anchors, storage/index costs, deletion/restore and export revocation/transfer behaviour |
| SCI-D01 | Conditional +15/+40/+60/+75 daily clocks | Source finality, runtime feasibility, NAV publication and FX freshness policies |
| SCI-D02 | No new target-threshold selection | Per-horizon event definitions/thresholds and market/kind benchmark mapping |
| SCI-D03 | No new numeric quality threshold selection | Data sufficiency, chronological split/calibration protocol and justified effect/uncertainty/coverage thresholds; no pilot or fitting authorised |
| SCI-D04 | Campaign, fit and instance-hour ceilings | Model/feature catalogue, initial qualification scopes and runtime/cost fit |
| SCI-D05 | Advance-approved automatic pause, notification and owner-approved restart | Exact triggers, monitoring/probation windows and restart evidence; existing owner promotion control remains |
| SCI-D06 | Three templates plus custom assumptions | Specific approved values, calculation conventions and evidence for scenario assumptions |

External proof gates remain separate: intended-use permissions and coverage for Yahoo/Twelve Data (including Basic dev), current subscription/invoice terms, actual Claude credit and enforceable allocation, complete all-in cash fit, and AWS account/region/runtime/auth/streaming compatibility. No preference answer establishes those facts.

Next planning sequence: integrate the receipts into a new, traceable draft of the financial/scientific contracts and acceptance definitions; research the unresolved technical proposals and public evidence; present the resulting coherent baseline and its remaining proof gates for owner decisions. Detailed phase documents and actual Jira-story acceptance must be ready before the separate UX gate. Review round 2 remains unapproved, and no publication, PR, architecture sign-off, UX or implementation follows from this inventory.

## Later Git delivery request

After this policy discussion, the owner requested a colourful MA-structured README and Git PR/merge delivery of all relevant work. That separately authorises committing/pushing these receipts and the saved future-direction note through PRs. It does not approve the complete architecture, close incomplete Jira acceptance, publish Confluence/Sites/Lucid changes, authorise review round 2, or start UX/application implementation. The original question replies and their narrower boundaries above remain intact.
