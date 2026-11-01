# Requirements decision pack

**Proposals for Arun · 1 November 2026 · MP-15 · Not approved · Independent review not yet run**

[Working PRD](product-requirements.md) · [Confirmed decisions](product-decisions.json) · [Cost/audit requirements](audit-observability-requirements.md) · [Architecture comparison](review.html)

This pack offers **18 choices** with a recommended option and proposed acceptance criteria. Nothing is preselected as consent. The 22 confirmed decisions stay confirmed; alternatives here cannot silently remove any agreed method, horizon, market or safeguard. Approving a policy is separate from approving architecture, coding, spending, deployment or publication.

Read one group at a time. Record choices in chat using the IDs, for example `C01 A, C02 A, C03 C`, or give your own values. Answers will update the register as explicit decisions; until then every `selected_option` in the [machine-readable pack](requirements-decision-pack.json) is null. Suggested numbers are testable product defaults, not validated investment limits or promised forecast quality.

## First group: cost decisions

Start with **C01–C03**. The main discovery dashboard's cost priority is already agreed; these choices define its accounting and operating policy.

### Proposed cash allocations for C01 A

| Allocation | Monthly GBP planning ceiling |
| --- | ---: |
| market data | £28 |
| AWS production including training | £20 |
| AWS development | £5 |
| AWS shared monitoring | £5 |
| CI | £2 |
| Apple monthly reserve | £8 |
| domain monthly reserve | £2 |
| **Operating envelope** | **£70** |
| **Unallocated reserve** | **£30** |
| **Total ceiling** | **£100** |

These are limits to validate against a real resource/data model, **not a revised quote**. They include AWS training and monitoring in their named rows rather than adding those costs twice. Claude cash is conditionally £0 while verified credits cover usage; this is not a guarantee. Annual invoice months and any incremental subscription need their own truthful cash forecast. The earlier A/B £60/£65 examples remain historical initial-workload estimates; no choice below proves full-scope affordability.

## Costs

### C01 · How much of the £100 monthly cash ceiling should we plan to use?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-022.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | £70 operating envelope + £30 reserve (Recommended) | Leaves room for delayed charges, monitoring, FX/tax uncertainty and measurement. |
| B | £85 operating envelope + £15 reserve | More experimentation, with less room for price or usage surprises. |
| C | £60 operating envelope + £40 reserve | More cautious; may require fewer simultaneous research/training jobs. |

Proposed details:

- Propose ceilings of £28 data, £20 AWS production including training, £5 AWS development, £5 shared AWS/monitoring, £2 CI, £8 Apple monthly reserve and £2 domain reserve. These are allocations to test, not service quotes.
- Track calendar-month accruals AND cash invoices; annual renewals may exceed a monthly amortised allowance. Do not treat approval of this envelope as permission to pay an annual invoice.
- Claude net cash allowance is £0 only while verified eligible credit covers usage. Any incremental subscription needed for the credit belongs in the project cost model; if it does not fit, re-plan before activation.
- No budget is configured by this decision pack. All alternatives retain the £100 ceiling and require full-scope costing.

Acceptance to carry into the stories:

- The chosen allocations and reserve reconcile to £100 without double-counting AWS, monitoring or training.
- A Grow-tier, subscription, FX/tax or annual-invoice change produces an explicit affordability failure rather than silently spending the reserve.

### C02 · What should happen when Anthropic credit is low, unavailable or not verifiable?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-022.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | Pause new discretionary Claude calls; no paid fallback (Recommended) | Preserves cash control; use saved results and clearly labelled deterministic summaries. |
| B | Ask for a one-time capped paid allowance | More continuity; each allowance needs a new explicit cash decision within £100. |
| C | Pause all new Claude calls immediately | Simpler and stricter; even on-demand chat waits for verification. |

Proposed details:

- Propose gross-use ceilings of $120 production chat/research, $15 development, $30 live evaluations, $5 online judging, plus $30 unallocated credit reserve. These sum to the reported $200 shared benefit, not to verified available project credit.
- The effective project allowance is the lower of owner allocation and conservatively available organization credit after other apps, pending calls, expiry and existing liabilities. A workspace limit is not a separate pool of credit.
- Do not start a new chargeable call when coverage cannot be established. Queue, pause or provide an explicitly non-LLM result; never fabricate freshness.
- Reserve bounded maximum request/tool liability before starting; reconcile streamed, timed-out, retried and batch requests idempotently. Deterministic safety/data-integrity controls do not depend on an LLM or on available credit.
- The dollar ceilings describe gross usage, while the cash envelope is GBP. Do not convert promotional face value into cash headroom.

Acceptance to carry into the stories:

- Simulated exhaustion, expiry, another application's usage and ambiguous request completion cannot trigger automatic paid fallback.
- The dashboard distinguishes unknown credit from zero and distinguishes paused evaluations from passed evaluations.

### C03 · How fresh should the in-app cost dashboard be?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-018, DEC-022.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | Fast usage ledger + scheduled billing reconciliation (Recommended) | Useful live estimates with bounded collection cost and honest billing delays. |
| B | Same live ledger + more frequent billing polling | More collection work; upstream billing may be unchanged. |
| C | Live estimates + daily reconciliation for both providers | Simpler, with slower provider reconciliation. |

Proposed details:

- Record request usage on completion; update the open dashboard from cached application data within a proposed 60-second target. Mark in-flight/unknown outcomes as reservations, not completed zero-cost calls.
- Propose Anthropic report collection every 6 hours and AWS billing collection every 24 hours. Show covered-through and refreshed-at timestamps; polling does not accelerate provider reporting.
- Propose a 120-request/month ceiling for primary-view Cost Explorer requests, including pagination/retries; the request-price component is $1.20 at the currently documented rate. Custom billing views may multiply per-source charges and require re-costing.
- Do not publish a partial paginated report as a complete total. Persist cursor/coverage state, keep the last complete snapshot and mark partial/stale coverage.
- Propose a stale-report warning after 36 hours without useful refreshed billing coverage. Failed collectors raise health alerts independently. Manual refresh reads cached results; a new billing collection consumes the same budget.

Acceptance to carry into the stories:

- Repeated dashboard refreshes cause zero new provider billing queries.
- Denied, partial, stale or empty reports remain visibly incomplete; API decimal cents/units are normalized without a 100x conversion error.

### C04 · Which cost-alert and spending-reduction policy should we use?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-008, DEC-022.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | Warn, reduce optional work, then pause it (Recommended) | Keeps essential deterministic services useful while protecting cash headroom. |
| B | Alerts plus owner approval for every new optional job | Tighter manual control and more interruptions. |
| C | Pause optional work at the first warning | Most conservative, with less research availability. |

Proposed details:

- Propose project alerts at £60 forecast cash, reduce discretionary research/dev jobs at £75, and deny new discretionary paid jobs at £85. Reforecast fixed bills, pending jobs and remaining-month baseline use; compare both conservative projected cash and actual incurred cash to thresholds.
- An environment or feature allocation crossing its limit raises its own alert. New nonessential work must fit the approved allocation; it cannot silently borrow another environment's budget or the reserve.
- Use separate credit-cycle alerts at 70%, 85% and 95% of the effective gross-credit allocation. Do not mix these with GBP cash percentages.
- Admissions use atomic reservations and bounded concurrency, including evaluations and tools. Existing non-cancellable provider liabilities remain counted.
- AWS Budgets/provider reports are delayed. This is an application admission/degradation policy, not a promise of a universal instantaneous AWS billing stop. Leave essential integrity, access, audit and incident detection functioning with a budgeted minimal path.

Acceptance to carry into the stories:

- Simultaneous synthetic jobs cannot reserve the same remaining allowance twice.
- A delayed provider report, exhausted credit or failing cost collector produces a safe degraded state and an owner alert, with no false 'all within budget' status.

## Investment analysis

### I01 · Which initial risk-alert profile should we propose?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-007, DEC-010.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | Balanced monitoring thresholds (Recommended) | A practical starting point to test against your holdings, with portfolio risk weighted more heavily. |
| B | Earlier warnings | More sensitivity and potentially more alerts. |
| C | Wider thresholds | Fewer alerts, with later warnings. |

Proposed details:

- Proposed balanced drawdown/cost-basis loss warnings: portfolio 10% warning / 20% severe; individual holding 15% warning / 25% severe. Earlier profile: portfolio 5%/10%, holding 10%/20%. Wider profile: portfolio 15%/25%, holding 20%/35%. These are owner-review heuristics, not statistically validated safe limits or instructions to sell.
- Measure drawdown from a trailing 12-month peak (or available inception period, labelled) of a cash-flow-adjusted series. Do not treat deposits/withdrawals as gains/losses.
- Compute cost-basis measures only with sufficient reconciled history and a defined fee/FX/corporate-action convention. For portfolio net-invested-capital ratios, show unavailable when the denominator is nonpositive or economically misleading; keep money P&L and time-weighted drawdown distinct.
- Propose portfolio-versus-holding weighting of 70:30 within the downside-risk component. That is separate from the overall recommendation weights in I02.
- A threshold changes monitoring severity, not an add/trim action. Missing/stale data or a protected holding cannot silently bypass eligibility. Defaults remain configurable per portfolio/holding after owner approval.

Acceptance to carry into the stories:

- Synthetic deposits, withdrawals, splits, FX moves and missing history do not create invented losses or valid-looking undefined ratios.
- Threshold crossings explain measure, window, source age and portfolio impact; exposure/concentration rules will be specified after the actual holdings are mapped.

### I02 · How should the transparent recommendation ranking balance the three objectives?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-002, DEC-004, DEC-016, DEC-017.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | 35% growth / 40% downside protection / 25% relative opportunity (Recommended) | Balances all objectives with a modest emphasis on protection. |
| B | One-third each | Equal emphasis; display the exact equal-weight convention. |
| C | 25% growth / 50% downside protection / 25% relative opportunity | A more protective ranking, still showing all objectives. |

Proposed details:

- Each component uses a documented 0–100 scale with 'higher is better'; the downside component is protection/robustness, not raw risk. Normalize only against a declared horizon/reference population using training/reference data available at the decision time.
- Do not silently substitute zero for missing evidence or redistribute its weight. An ineligible component makes the combined actionable rank unavailable; show the separate available analyses.
- Rank comparisons within compatible horizons and contexts; do not average a next-day signal into a 12-month thesis without an explicitly approved combination rule.
- Eligibility, uncertainty and disagreement are evaluated before action ranking. Action bands, position sizing and protected-position rules need a separate holdings-aware proposal; these weights alone do not define 'add' or 'trim'.
- All score inputs, weights, model/rule versions and explanations are versioned. LLM self-confidence never substitutes for measured probability/calibration.

Acceptance to carry into the stories:

- Changing a weight reproduces a versioned ranking explanation and never rewrites an earlier recommendation.
- A high growth score cannot conceal insufficient data, conflicting signals or an unapproved action rule.

### I03 · What return and benchmark presentation should be the default?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-011, DEC-014.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | GBP portfolio view + local-currency detail (Recommended) | Shows personal portfolio effects and separates instrument performance from FX. |
| B | Local currency first + GBP portfolio summary | Prioritises market-level interpretation. |
| C | Side-by-side GBP and local views throughout | More visible detail and a denser interface. |

Proposed details:

- Use total return where the permitted data supports dividends/corporate actions; explicitly label price-return-only series. Show XIRR for investor cash-flow experience and time-weighted measures for comparable investment/benchmark performance; do not compare an XIRR directly with an unmatched index annual return.
- Propose MSCI ACWI net total return, converted into GBP with matched dates, as the broad global reference, subject to data licence/history availability. A clearly labelled permitted broad-global ETF proxy is an alternative; disclose fees/tracking differences rather than calling it the exact index.
- Choose each holding's benchmark after exact listing/share-class/exposure resolution. Construct a versioned blended portfolio comparator from approved weights fixed at the start of the evaluation period, with a declared rebalance policy; do not choose weights after seeing outcomes.
- Match date coverage, currency, dividends, fees and cash-flow conventions for comparisons. Explain any convention mismatch; withhold unsupported numerical superiority claims.

Acceptance to carry into the stories:

- A synthetic FX-only move explains the difference between local and GBP returns.
- Benchmark IDs, source/rights, weights, rebalance timing and return conventions are inspectable; missing licensed benchmark history is an evidence gap, not fabricated data.

### I04 · How should the confirmed horizons be organised in the first forecast contract?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-001, DEC-019.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | Separate horizon-specific outputs and scenarios (Recommended) | Makes forecasts measurable without blurring short-term risk and long-term theses. |
| B | Long-term view first; short-term forecasts in detail | Same horizons and evidence, with less short-term emphasis in presentation. |
| C | Short-term view first; long-term forecasts in detail | Same coverage, prioritising near-term monitoring. |

Proposed details:

- Formal forecasts are published daily for next trading day, 5 and 20 trading days, and 3/6/12 calendar-month target dates mapped to the next valid target-venue close. Record the exact maturity date/calendar rule before issuance; owner can choose a different explicit calendar convention.
- Define instrument total-return, benchmark-relative and downside-event targets separately, including local/GBP units and permitted adjustment conventions. Features refresh only when new eligible data exists; daily publication does not invent a daily fundamentals update.
- Three-to-five-year outputs are assumption-based scenarios with drivers, ranges and invalidation conditions, labelled separately from empirically calibrated probabilities.
- Thirty-minute quote/risk checks do not create a new formally scored daily forecast version. Material correction/retraction is a linked immutable event, not a silent overwrite.
- Unsupported horizons remain visible as insufficient-evidence/unavailable, while valid analysis remains usable. Approving horizon organisation does not promise that every model is validated for every listing at launch.

Acceptance to carry into the stories:

- A forecast cannot be scored before its recorded maturity, even after an app timezone or calendar update.
- Original issues, corrections, scenarios, outcomes and model versions stay distinguishable and reproducible.

### I05 · What evidence policy should govern self-learning and promotion?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-001, DEC-016.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | Evidence-first challengers, then owner approval (Recommended) | Preserves reproducibility and avoids treating immature forecasts as proven. |
| B | Longer shadow evidence before the same approval | More caution, with slower candidate adoption. |
| C | Keep rules/statistical baselines active while all ML stays shadow | Makes early intelligence usable while gathering model evidence. |

Proposed details:

- Compare rules/statistical baseline, numerical ML, and ML plus LLM-derived features through versioned ablations. Use purged temporal walk-forward validation, train-fold-only transformations/calibration, locked final evaluation and outcome maturity rules.
- Evaluate probabilities with Brier/log loss and reliability/coverage, return ranges with suitable quantile/interval scores, and portfolio experiments with matched risk/benchmark/cash-flow conventions. Report uncertainty and drawdowns alongside headline accuracy.
- Propose at least four feasible time-separated walk-forward evaluation folds; require an explicit sample-sufficiency design for each horizon. Overlapping dates/instruments are not independent trials; use appropriate temporal/group uncertainty estimates.
- Freeze exact metric thresholds, baseline improvement margins, noninferiority tolerances and mature-evidence requirements before challenger experiments, after the coverage audit. This pack approves the evidence-policy direction only; those scientific thresholds remain an explicit blocker to promotion.
- Long horizons need mature horizon-appropriate evidence; a short shadow period cannot prove a 12-month model. Synthetic packs verify mechanics, never predictive skill. Historical LLM features need leakage controls and prospective corroboration.
- Training, drift checks and evaluation can run under approved budgets; model/calibration promotion requires owner approval with evidence, cost and rollback. Safety fallback may return to a previously approved baseline under an approved policy; it cannot promote an unapproved model.

Acceptance to carry into the stories:

- A candidate with insufficient mature evidence is shown as inconclusive/shadow, regardless of attractive headline accuracy.
- Each promotion packet identifies data/feature/code/model versions, temporal splits, baselines, uncertainty, tests, resource cost and a tested rollback.

## Briefings and alerts

### N01 · When should the UK-morning briefing arrive?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-013, DEC-015.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | 07:30 Europe/London (Recommended) | A consistent morning planning slot, with daylight-saving handling. |
| B | 08:00 Europe/London | Later morning delivery. |
| C | Choose a custom UK-morning time | Fits your routine; record an explicit timezone. |

Proposed details:

- One daily concise briefing at the chosen local time, including weekends with a lighter market-calendar-aware format. Avoid claiming every market is open or fully updated.
- Show separate timestamps for US/UK/India observations; include priorities, changes, risks, events, unavailable data and expandable evidence.
- Idempotent schedule/delivery keys prevent duplicate briefs after DST, retries or catch-up. A missed schedule is observable; a late catch-up is labelled late.
- Choose later whether weekend briefings should be disabled; until this proposal is approved no scheduler is configured.

Acceptance to carry into the stories:

- Spring/autumn clock changes, a failed job and a restart produce the documented one-brief-per-local-date policy with correct timestamps.

### N02 · How should material-risk push alerts avoid unnecessary interruptions?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-008, DEC-012.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | 22:00–07:00 quiet hours; critical exceptions (Recommended) | Reduces overnight noise while allowing explicitly defined urgent incidents. |
| B | Quiet hours with no investment-alert exceptions | All investment alerts wait; critical security/operations routing is separately chosen. |
| C | No quiet hours; retain duplicate suppression | Most immediate delivery, potentially across UK/US/India trading hours. |

Proposed details:

- Propose one push per holding/rule/severity per 24 hours; renewed push only for worsening severity or a materially new cause. Preserve the full event history in app/chat; cooldown does not discard evidence.
- Reserve quiet-hour exceptions for defined critical security/service-integrity incidents and any owner-approved severe investment condition. Until those critical definitions are approved, do not infer an investment exception.
- Push previews default to generic text such as 'A portfolio update needs attention'; no values, account names, raw documents or detailed holdings on the lock screen.
- Attempt native/PWA push only with permission and supported delivery; record provider acceptance separately from display/read acknowledgement. On denial/offline, retain a visible in-app inbox and catch-up state.
- These are detection-driven alerts on available data, not tick-level guarantees. An unavailable source yields a freshness/coverage notice, not an invented investment-risk event.

Acceptance to carry into the stories:

- Retries, quiet hours, cooldowns and several devices do not multiply the same push; escalation retains the cause and original event.
- Sensitive synthetic markers never appear in lock-screen payloads or generic operational telemetry.

## Storage and audit

### O01 · What should the default original-document retention policy be?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-020, DEC-021.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | 24-month renewable archive policy (Recommended) | A clear review window with owner extension/deletion and predictable storage planning. |
| B | 12-month renewable archive policy | Less retained sensitive content; earlier source review/export. |
| C | Retain while account is active; periodic review | Maximum source history, with growing storage and privacy obligations. |

Proposed details:

- Retain encrypted S3 originals and noncurrent versions according to the chosen policy, with a proposed 30-day pre-expiry notice and explicit owner extension/export/deletion controls. Define the approved automatic-expiry action before activation; no irreversible lock is implied.
- Propose immediate access revocation on an owner deletion request, live-store/derived-copy cleanup target within 24 hours, and expiry of remaining recovery copies within a proposed 35-day backup window. These are design targets to verify, not existing deletion guarantees.
- A minimal protected deletion record/tombstone outlives every recoverable copy and is reapplied before restored data becomes accessible. Do not retain deleted content inside the tombstone; review indirect identifiers/privacy too.
- Retain ledger, issued prediction/outcome and approval lineage for the active account according to separately approved record-class rules, not the operational run-record TTL. Owner source deletion may remove evidence availability, which must be shown truthfully.
- Retention values are product choices, not a statement of legal/tax compliance; reconcile any actual recordkeeping needs before relying on automated expiry. No sensitive source is copied into dev for testing.

Acceptance to carry into the stories:

- Deletion covers current/noncurrent S3 versions, parsed derivatives, caches and recoverable copies with truthful progress status.
- Restore a synthetic backup containing a previously deleted document and prove deletion is reapplied before any authorized client can open it.

### O02 · How often should we exercise recovery and audit integrity?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-020, DEC-021.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | Monthly focused exercises + change-triggered checks (Recommended) | Balances operational evidence with a small-system budget. |
| B | Weekly focused exercises + change-triggered checks | Finds regressions sooner, with more test/compute cost. |
| C | Quarterly exercises + change-triggered checks | Less recurring work, with a longer gap between routine proofs. |

Proposed details:

- All options require release gates for affected storage, backup, import or audit changes. The interval chooses routine exercises, not permission to ship untested changes.
- Exercise failed/duplicate/reprocessed imports, owner-confirmed updates, manual-entry provenance, transaction/audit/outbox atomicity, crash recovery and deletion-after-restore.
- Inject a missing or altered synthetic audit event and require detection plus an operator incident; define the final detection/verification mechanism during architecture design.
- Propose recovery objectives of at most 24 hours of data loss and 4 hours to restore essential owner read access, then validate them against the actual backup mode and cost. Recovery may show stale last-known analysis; it must not invent fresh results.
- Audit evidence must identify the exercise version, scenario, actual RPO/RTO achieved, verifier and unresolved failures. No successful checksum alone proves the full recovered application works.

Acceptance to carry into the stories:

- A restore drill measures time and recoverable state rather than only proving files exist.
- An intentionally altered/deleted event is detected; an authorized correction remains an intact, linked new event rather than appearing as unexplained tampering.

### O03 · How much operational telemetry should we retain initially?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-021, DEC-022.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | 14-day logs / 30-day rich traces / 90-day run summaries (Recommended) | A bounded starting point, subject to measured monitoring cost. |
| B | 7-day logs / 14-day rich traces / 30-day run summaries | Lower volume with shorter investigations. |
| C | 30-day logs / 90-day rich traces / 180-day run summaries | Longer investigations and a larger storage/query envelope. |

Proposed details:

- Every meaningful operation has a durable outcome and required source/decision links; audit and required prediction/approval evidence are never sampled. A run-summary TTL must not remove the only link needed by retained business records.
- Propose rich traces for all failed/denied runs plus a bounded deterministic 10% sample of successful runs; cap noisy cascades and retain durable failure summaries when rich-trace limits are reached. Validate collector sampling compatibility before selecting tooling.
- Telemetry content is allowlisted metadata, not raw prompts/replies, imports, portfolio amounts, credentials or signed URLs. Exception messages and tool error bodies also need redaction.
- Metric dimensions stay bounded. Per-run/per-instrument investigations use protected records/logs rather than unlimited metric cardinality. Track dropped/sampled data and collector health.
- Sampling, retention and collector costs must be measured inside the shared AWS/monitoring envelope; no paid observability product is activated by this choice.

Acceptance to carry into the stories:

- Sensitive-marker leak tests and owner/environment access tests pass, including failed requests and retry paths.
- An unsampled run still links to durable business evidence; expired telemetry is labelled unavailable rather than breaking or silently rewriting the audit trail.

## Sign-in and access

### S01 · How should we deliver the already-confirmed Cognito sign-in methods?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-009.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | Cognito managed sign-in + verified account linking (Recommended) | Reuses provider-supported flows and limits custom authentication logic. |
| B | Custom web/native sign-in UI on Cognito | More design control and more authentication testing. |
| C | Managed sign-in first, custom UI after usage evidence | Same required methods, with visual customisation deferred. |

Proposed details:

- Apple, Google and passkeys remain required; this choice concerns the flow, not dropping a method. Plan the Cognito feature tier required for passkeys and test web/native domain association support.
- Use one canonical owner identity per environment. Link identities only after proving control of the existing owner and the new provider/passkey; matching email alone does not authorize a link.
- Cognito federation does not automatically add local passkey flows to an unlinked federated user. Specify and test the linked local-owner model, including Apple private-relay addresses and IdP subject identifiers.
- Owner-only admission has no open financial-data signup. Server APIs enforce owner/environment access and scoped sensitive-action reauthentication; a hidden admin menu is not authorization.
- Propose reauthentication within 5 minutes for source deletion, recovery/linking, budget increases and model promotion. Retain server-confirmed operation details, anti-replay/expiry and audit evidence, not just a client 'biometric succeeded' flag.

Acceptance to carry into the stories:

- An attacker with the same email claim, a stale session or a dev identity cannot link to or operate the prod owner.
- All three methods work for the same approved owner on the supported PWA/native device matrix; account linking and fresh sensitive-action authorization are demonstrated.

### S02 · How much recovery redundancy should we require?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-009, DEC-021.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | Two independent passkey paths + verified Apple/Google links (Recommended) | Reduces dependence on one lost device or one sync account. |
| B | One passkey path + verified Apple/Google links | Less setup, with greater dependence on identity-provider recovery. |
| C | Two hardware-backed recovery keys + verified provider links | Strong physical separation, with purchase/handling overhead. |

Proposed details:

- Treat two synced passkeys in the same provider account as one failure domain where appropriate. Test recovery from loss of the primary device and provider access.
- Recovery is an explicit audited owner procedure with an out-of-band proof policy; do not assume Cognito password-reset email recovers a passkey-only/federated account.
- Propose 30-minute foreground inactivity lock for sensitive views and reauthentication for protected operations. Authentication-token and refresh lifetimes require explicit compatibility/cost/security validation before implementation.
- The device/session list supports revocation and sign-out. Test actual enforcement for already-issued access tokens; a UI logout alone is not immediate server revocation.
- Operator AWS access is separate from the application owner session. No financial account data, recovery proof or elevated billing authority enters a general research-agent context.

Acceptance to carry into the stories:

- Recovery cannot be used as a weaker route around owner authorization; successful recovery revokes the intended old sessions with documented propagation.
- Loss of the primary device has a tested recovery route and an auditable result without revealing private holdings in notifications.

## Data and imports

### D01 · How should first-version import support be bounded while retaining every agreed method?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-005, DEC-014, DEC-020.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | Sample-backed layouts + generic templates (Recommended) | Makes CSV/Excel/PDF/screenshots/manual usable with honest coverage and review. |
| B | Your most-used broker layouts first, plus generic paths | Prioritises personal onboarding once the broker list is known. |
| C | Generic structured template plus assisted extraction review | Broader intake with more manual confirmation of unfamiliar layouts. |

Proposed details:

- All options preserve CSV/Excel, PDFs/statements, screenshots and manual entry in the first version. Proposed initial automated layout target: one sample-backed statement family per active market, chosen from your actual brokers; it is not support for every institution.
- Generic CSV/XLSX templates and manual corrections remain available. Unsupported PDFs/screenshots can become a visibly uncertain extraction draft requiring review, not a silently successful import.
- Include image/PDF/Excel fixtures, duplicate/reprocess cases, formulas/macros/hidden sheets, ambiguous dates/currencies/units, protected documents, oversize/malformed files and malicious embedded instructions in parser/evaluation plans. No macros/formulas are executed as import instructions.
- Every extracted field retains source page/row/cell or manual actor/reason; uncertain instrument matching requires confirmation. Never infer your actual ETF share class from the synthetic catalogue.
- Incomplete history can create a flagged holding, while unsupported XIRR/cost/return measures remain unavailable. Preview and confirmation precede any ledger commit.

Acceptance to carry into the stories:

- Each supported method has a representative synthetic/redacted sample and a documented success/failure contract.
- Duplicate uploads, reprocessing and owner corrections preserve originals and produce reversible, attributable ledger events.

### D02 · Which evidence should we gather first before final architecture costing?

Status: **proposed, awaiting your answer**. Related confirmed decisions: DEC-003, DEC-006, DEC-011.

| Option | Choice | Trade-off |
| --- | --- | --- |
| A | Resolve actual holdings and source entitlements first (Recommended) | Avoids choosing paid data, benchmarks or training history that do not cover your instruments. |
| B | Propose the balanced research universe first | Moves discovery planning forward; actual holdings still need resolution. |
| C | Collect broker format samples first | Accelerates import contracts; data pricing remains unresolved. |

Proposed details:

- Gather exact listing/ticker/share class/venue/currency and broker for supplied holdings, then propose the research watchlist for approval. Quantities and account numbers are not required to resolve instrument identities.
- Create a per-listing coverage matrix for Yahoo/Grow: permitted access/storage/ML use, interval/delay, history depth, corporate actions, fundamentals/exposures, benchmarks, quota and actual tier price. Public ticker availability is not proof of training/retention rights.
- Where an entitlement cannot support 30-minute monitoring, use the already-approved daily-analysis fallback and ask before a paid source. Do not reopen that settled fallback choice.
- Use real identifiers with unmistakably synthetic observations/accounts in local/dev. The existing price/ledger packs are test foundations, not evidence of model skill; document-specific fixture work is still needed. AWS dev loading remains deferred.
- No paid API request, subscription change or live AWS dev environment is enabled by gathering this planning evidence.

Acceptance to carry into the stories:

- Each proposed active listing has a verified identity and a truthful capability/rights row or is explicitly held pending.
- A costed architecture can point to the exact market-data quote/tier and expected workload rather than assuming all UK/US/India symbols have equivalent fresh coverage.

## Evidence behind the recommendations

The policy numbers above are proposals. Provider facts were checked against the following primary sources on 1 November 2026; source documentation does not verify your private account balance, entitlements or deployed configuration.

- [AWS Cost Explorer freshness](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html): Billing data is delayed; scheduled collection and explicit freshness are required.
- [AWS Cost Explorer pricing](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/pricing/): Primary-view API requests cost $0.01 each; custom-view charges depend on sources. This pack prices a proposed bounded request count, not an observed bill.
- [Anthropic Usage and Cost Analytics API](https://platform.claude.com/docs/en/manage-claude/usage-cost-analytics-api): Current analytics are delayed/revisable. Cost fields are decimal cents, after discounts and before credits; they are not verified remaining cash/credit balance.
- [Anthropic API credit programme](https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers): Linked-organization keys/workspaces share credits; credit renewal and monthly spend-cap periods differ. The user's reported $200 account benefit remains unverified.
- [Cognito authentication flows](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html): Federated and local flows need a deliberate linked identity design; passkeys are not automatically added to an unlinked federated user.
- [Cognito authentication and plan requirements](https://docs.aws.amazon.com/cognito/latest/developerguide/authentication.html): Verify required feature tier/domain and supported passkey flows in the chosen clients.
- [S3 versioned-object deletion](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DeletingObjectVersions.html): A delete marker alone does not erase retained object versions; deletion must handle versions and derivatives.
- [scikit-learn temporal cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html#time-series-split): Time-aware evaluation is needed; this alone is not a full financial leakage-control or promotion-evidence specification.
- [MSCI ACWI methodology reference](https://www.msci.com/documents/10199/255599/msci-acwi-net.pdf): Candidate broad-global net-return benchmark reference; use/licence, currencies and available history still require confirmation.

## Review follow-ups incorporated as proposals

The previous operational-requirements review found no blockers and two optional acceptance refinements. O01/O02 now propose deletion-after-restore and missing/altered audit-event tests. Their presence here does not claim the old document was changed, the new pack was independently reviewed, or those behaviours are implemented. [Previous review](../../../review/MP-15/round-1-result.md).

## What still blocks implementation readiness

- Owner choices on proposals; further scientific threshold and action-policy specification.
- Actual holdings, broker sample coverage, data/benchmark entitlements and current prices.
- Architecture A/B selection, account/region isolation, IaC and full monitoring/training costing.
- Exact web/native device/OS matrix and clarification of adaptive Duo requirements.
- Complete layer-by-layer stories, contracts, local UX/prototype acceptance and end-to-end approval before product coding.

After the owner choices, turn the agreed requirements into versioned stories/acceptance tests, resolve the remaining evidence and architecture decisions, re-cost the full initial scope, and prepare the local design system/web/mobile prototype for approval. Sync to Sites only when authorised. No application coding follows automatically from completing this questionnaire.
