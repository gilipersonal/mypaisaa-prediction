# Working agreement for Codex contributors

## Mission and non-negotiable limits

Mypaisaa Prediction is a private research and decision-support tool. It must not execute trades, store broker trading credentials, submit orders, or frame output as personalised financial advice. Changes must preserve transparent uncertainty, a clear data provenance trail, and a complete prediction-to-outcome audit trail.

## First checks

The owner requires researched architecture/contracts and the complete phase/story baseline to be agreed before UX begins, then complete end-to-end UX approval and explicit permission before application implementation. On 24 November 2026 the owner started a small build before whole-product UX approval: web screens and a local read API on synthetic data, in four steps (MP-134 first); the decision log's entry of that date holds the owner's words and what it does not cover. The same day the owner approved the whole UX with named conditions and kept the build to those four steps (MP-66, `docs/design/reviews/MP-66/README.md`). Use `docs/planning/ma-reconciliation-2026-11-02/README.md` for the current closure sequence. MA supplies concepts and documentation structure; do not blindly copy its scope, choices, versions, budgets or permissions.

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

- The current owner-confirmed ceiling is £100/month all-in across dev/prod AWS, market data and Claude/evaluations, with £70 planned operation and £30 reserve. It supersedes the historical £50 AWS-only target. Do not introduce an ALB, NAT Gateway, RDS, GPU compute, or a new paid managed service without revising the complete cost model and an ADR.
- IaC changes are plan-only in this repository. Never apply, deploy, or make paid-service calls unless the user explicitly asks.
- Current planning prefers AWS Lambda, private S3 and DynamoDB subject to financial atomicity/access-pattern proof. Earlier local PostgreSQL topology is historical; final persistence, network and ML execution ADRs remain unselected. Test restore procedures before considering data protected.

## Definition of done

A change is complete only when it has focused tests, reasonable error handling, no secrets, updated docs/contracts where necessary, and a short note on any new cost, data-license, or prediction-validity impact.

## Jira and delivery

- `main` is the canonical default branch. Deliver all changes on `MP-<number>-<slug>` branches through PRs targeting `main`; see `docs/github-workflow.md` for CI and protection status. Push completed issue branches within the authorised task; follow the current-prompt permissions below for PR creation, merge and issue closure.
- In Codex, when the PR is ready, offer combined consent to merge it, close its linked MP issue and return to local `main`. After the approved successful merge and completed acceptance criteria, close the verified named issue and fast-forward the clean local checkout from `origin/main`. Preserve user changes and branches; report merge, Jira closure and local sync separately, including partial failures. Use the project autoship procedure.
- This project's Jira key is MP. Read `.claude/jira-flow.json` and `.claude/rules/jira-flow.md` for the project workflow; the Confluence space is `mypaisaapr`.
- For a finished MP issue, use the project-local autoship skill at `.agents/skills/autoship/SKILL.md`. Follow the user's global instruction to ask before raising a PR, merging, or closing an issue; never inherit mypaisa-agent's project-only exceptions.
- Before presenting a deliverable, offer the independent review, stating the lanes and up to five rounds. Run it only with approval, with gates first, fresh parallel reviewers, a fixed-findings regression ledger, and delta review after round one. For Codex, ask separately before every round as specified below. On no or another answer, report it as unreviewed and list gates run.
- The `site/` source belongs to this repository. Preserve its `.openai/hosting.json` Sites identity and track `site/dist/`, which is its source for the buildless preview. The separate Sites publication workflow must be reconciled with this repository before publishing.

## Codex-only project workflows

When working in Codex, read `.codex/rules/workflow.md`. The project-local skills under `.agents/skills/` contain the detailed procedures. Plan sync, independent review, and running the review-regression ledger each require explicit approval as described there. These instructions do not change Claude configuration or any other project.

For Codex architecture documentation, follow `.codex/rules/architecture-diagrams.md` and the `mp-architecture-diagrams` skill. Use Lucidchart for AWS and other significant architecture, with colourful native service components, clearly labelled implementation status, and readable static alternatives to animation.
