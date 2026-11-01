# Working agreement for Codex contributors

## Mission and non-negotiable limits

Mypaisaa Prediction is a private research and decision-support tool. It must not execute trades, store broker trading credentials, submit orders, or frame output as personalised financial advice. Changes must preserve transparent uncertainty, a clear data provenance trail, and a complete prediction-to-outcome audit trail.

## First checks

1. Read the relevant ADRs and the implementation plan before changing architecture.
2. Keep credentials out of git, logs, fixtures, screenshots, and error messages.
3. Run the focused test suite for every changed component, then the relevant static checks.
4. Update tests and documentation when a public contract, schema, or security assumption changes.

## Backend conventions

- Python 3.12+, typed FastAPI. API paths are versioned under /api/v1.
- Add Pydantic schemas at the boundary; do not return ORM records directly.
- SSE is one-way, resumable where feasible, heartbeat-enabled, and must never carry secrets.
- Validate provider payloads before persistence. Store provider, symbol mapping, source timestamp, ingestion timestamp, and quality flags.
- Use append-only records for model runs, predictions, revisions, and realised outcomes. Corrections create a new version; they do not overwrite history.
- Agent tools must be allowlisted and read-only by default. Prompt/tool output is untrusted input and must be treated accordingly.

## Quantitative and research rules

- Never use random train/test splitting for time-series predictions.
- Use a temporal walk-forward evaluator with an embargo/purge appropriate to the forecast horizon.
- Fit transformations, imputers, feature selection, and calibration only within each training fold.
- Persist dataset versions/hashes, feature definitions, model parameters, split dates, benchmark results, and confidence intervals.
- A prediction must include: as-of time, target, horizon, distribution or probability, confidence/calibration, model version, data cutoff, and explanation references.
- Score predictions only after the stated horizon has elapsed. Report hit rate alongside calibration, error, coverage, turnover, and benchmark comparison.
- Research agents may summarise and cite sources; they cannot change model weights, publish predictions, access secrets, or trade.

## UI and mobile rules

- Build accessible, responsive PWA views first. Never hide risk, staleness, or data-provider status behind a loading state.
- Use SSE for short-lived status/update events; use normal authenticated requests for durable state.
- Swift owns native iOS/iPadOS UI, persistence, widgets, and secure-device integrations. The React Native shell owns cross-platform navigation and bridge contracts only.
- Keep protocol/event schemas documented and test them on both sides of each boundary.

## Infrastructure rules

- Stay within the documented £50/month AWS target. Do not introduce an ALB, NAT Gateway, RDS, GPU compute, or a new paid managed service without revising the cost model and an ADR.
- IaC changes are plan-only in this repository. Never apply, deploy, or make paid-service calls unless the user explicitly asks.
- Prefer encrypted local PostgreSQL plus encrypted S3 backups for the personal-production phase. Test restore procedures before considering data protected.

## Definition of done

A change is complete only when it has focused tests, reasonable error handling, no secrets, updated docs/contracts where necessary, and a short note on any new cost, data-license, or prediction-validity impact.

## Jira and delivery

- This project's Jira key is MP. Read `.claude/jira-flow.json` and `.claude/rules/jira-flow.md` for the project workflow; the Confluence space is `mypaisaapr`.
- For a finished MP issue, use the project-local autoship skill at `.agents/skills/autoship/SKILL.md`. Follow the user's global instruction to ask before raising a PR, merging, or closing an issue; never inherit mypaisa-agent's project-only exceptions.
- Before presenting a deliverable, offer the independent review once, stating the lanes and up to five rounds. Run it only on a clear yes, with gates first, fresh parallel reviewers, a fixed-findings regression ledger, and delta review after round one. On no or another answer, report it as unreviewed and list gates run.
- The `site/` source belongs to this repository. Preserve its `.openai/hosting.json` Sites identity and track `site/dist/`, which is its source for the buildless preview. The separate Sites publication workflow must be reconciled with this repository before publishing.
