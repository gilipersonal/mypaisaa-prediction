# Implementation plan and milestones

## Phase 0 — foundation and guardrails

**Outcome:** a safe, reproducible workspace before product data enters it.

- Confirm personal-use data licences for Twelve Data and any Yahoo Finance usage. Do not redistribute provider data.
- Set up local secrets, pre-commit/CI checks, conventional environment names, and separate development/test data stores.
- Define instrument identifiers, time-zone policy, currency conversion policy, and timestamp semantics.
- Add personal authentication design, threat model, backup/restore test procedure, and AWS budget alert plan.
- Create the prediction registry schema before writing the first model.

**Exit criteria:** no secrets in git; health/test checks run locally; data provenance and no-trading policy are written down.

## Phase 1 — trusted data and portfolio ledger

**Outcome:** a reconciled personal view of assets with visible data quality.

- Implement provider adapters behind a common interface: Twelve Data as the primary licensed feed; optional, terms-reviewed Yahoo Finance adapter limited to permitted personal usage.
- Build idempotent market-data ingestion, symbol mapping, freshness checks, missing-bar detection, and retry/dead-letter reporting.
- Implement CSV portfolio-import preview, validation, duplicate detection, commit, reversal, and reconciliation workflow.
- Build canonical instruments, transactions, holdings, cash, and price read APIs.
- Release initial SvelteKit PWA pages for dashboard, holdings, transaction import, and data-health status.

**Exit criteria:** an import can be previewed then committed exactly once; holdings can be recomputed from ledger records; provider freshness is shown to the user.

## Phase 2 — prediction baseline and scientific controls

**Outcome:** an honest baseline rather than an impressive but unmeasured model.

- Write target definitions per horizon: for example direction over 1, 5, and 20 trading days, and excess return against an explicit benchmark.
- Start with naïve and linear/tree baselines before complex ensembles. Establish a fixed investment universe and survivorship-bias treatment.
- Implement time-aware expanding/rolling walk-forward folds with purge and embargo. Each fold records data availability cutoffs.
- Add feature pipeline versioning, model artefact hashing, experiment registry, calibration, and benchmark comparison.
- Publish forecasts only through the immutable prediction ledger. Add a scheduled outcome scorer and calibration/error dashboard.

**Exit criteria:** no random-split metrics are presented; every displayed forecast has model/data provenance; every mature forecast is scoreable.

## Phase 3 — research and decision support

**Outcome:** evidence-organised research that complements quantitative signals.

- Build allowlisted source retrieval with caching, citation capture, content hashes, and licence metadata.
- Add specialist Claude agents with structured output, cost/token caps, prompt-injection resistance, and human-review state.
- Link research evidence to instruments and forecasts without allowing agents to silently modify them.
- Add PWA prediction detail, evidence timeline, portfolio exposure/risk view, and data-staleness notices.
- Add authenticated, heartbeat-enabled SSE notifications for job progress and newly available durable records.

**Exit criteria:** each agent claim links to its source; agent runs are replayable/auditable; an interrupted stream does not lose durable state.

## Phase 4 — native Apple experience

**Outcome:** a polished, native daily-use product on iPhone and iPad.

- Establish React Native shell/Swift bridge contracts and authenticate them against the same API.
- Implement SwiftUI dashboard, prediction detail, watchlist, portfolio summary, offline read cache, and accessibility support.
- Add iPad adaptive layouts, background refresh, notifications, and widgets only after privacy review.
- Test transport/schema compatibility between shell and native modules.

**Exit criteria:** key daily flows are usable offline with clearly marked staleness; VoiceOver and dynamic type work; no confidential data leaks into notifications.

## Phase 5 — production hardening

**Outcome:** reliable personal production use within the budget ceiling.

- Containerise API and worker, provision the minimal host, terminate TLS, and back up encrypted PostgreSQL dumps to S3.
- Add uptime/freshness checks, structured logs, alarms for failed ingestion/outcome scoring, and AWS budget alerts.
- Rehearse restore to a clean instance. Rotate API/provider/Claude keys and document incident response.
- Load-test expected personal concurrency and SSE reconnection; verify memory bounds for jobs.
- Review monthly spend and data/Claude usage before enabling more assets or agents.

**Exit criteria:** restore drill passes; no critical secret/log issue remains; estimated AWS recurring cost remains below £50 with headroom.

## Acceptance metrics

| Area | Initial success measure |
| --- | --- |
| Data | >99% expected bars ingested for enabled instruments, with visible freshness/error state |
| Ledger | holdings reproduce from the immutable transaction ledger and imports are idempotent |
| Forecast validity | walk-forward metrics and calibration outperform or match the declared naïve benchmark after costs/turnover assumptions |
| Transparency | 100% of predictions have cutoff, horizon, model version, uncertainty, and later outcome state |
| Reliability | daily backup verified; quarterly restore drill; failed jobs alert within the defined personal-use window |
| Budget | AWS recurring estimate plus observed usage remains below £50/month |

## Deliberately deferred

Multi-user tenancy, social features, broker connections, auto-trading, real-time tick infrastructure, GPU training, mobile Android product screens, and high-frequency strategies are out of scope. Reconsider them only through an ADR, cost review, and security review.
