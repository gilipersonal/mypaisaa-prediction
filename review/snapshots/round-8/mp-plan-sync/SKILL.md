---
name: mp-plan-sync
description: Compare or synchronise Mypaisaa Prediction planning, MP Jira, Confluence, designs and implementation after user approval.
---

# Plan sync for MP

Read `.codex/rules/workflow.md`. Before starting a sync, ask the user to approve the precise scope, offering `Check only` and `Not now` through a choice tool when available, even if the user initially requested a sync. Do not run it on an unrelated yes or without a response.

Read `docs/implementation-plan.md`, relevant ADRs and design decisions, MP Jira at `https://duttaarun2015.atlassian.net`, and Confluence space `mypaisaapr` as needed. Use the Atlassian connector; discover issue transitions and field IDs rather than guessing. Compare only the relevant work and explain mismatches with source links. MP currently has no established trace schema; do not assert that a comprehensive automated drift gate exists.

Propose exact local and external corrections with affected pages, issues and consequences. Read existing pages and space instructions before proposing edits. Require explicit approval for each stated external-write scope, then use the appropriate connector. Never automatically overwrite a Confluence page, invent records, or close an issue. Parallelise independent read-only lanes only when authorised and available; observe the five-agent total limit.
