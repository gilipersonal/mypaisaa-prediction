---
name: mp-plan-sync
description: Compare or synchronise Mypaisaa Prediction planning, MP Jira, Confluence, designs and implementation after user approval.
---

# Plan sync for MP

Read `.codex/rules/workflow.md` and `.codex/rules/plan-sync.md`. Before starting a sync, ask the user to approve the precise scope, offering `Check only` and `Not now` through a choice tool when available, even if the user initially requested a sync. Do not run it on an unrelated yes or without a response.

Read `docs/implementation-plan.md`, relevant ADRs and design decisions, MP Jira at `https://duttaarun2015.atlassian.net`, and Confluence space `mypaisaapr` as needed. Use the Atlassian connector; discover issue transitions and field IDs rather than guessing. Compare only the relevant work and explain mismatches with source links. MP currently has no established trace schema; do not assert that a comprehensive automated drift gate exists.

For relevant architecture, stack or product-status changes, check `README.md`, `docs/architecture.md` and `docs/tech-stack.md` together. Keep current/planned status, version evidence and component contracts consistent. Their visual documentation should mix animated flow companions with native Lucidchart architecture exports and editable source links. Follow the project architecture-diagram skill for AWS/significant architecture and native colourful service components; retain static alternatives and accessibility labels. Consult `docs/diagrams/README.md` and `manifest.json` for actual document IDs, source/export versions, dates/hashes and manual-sync limitations. Compare affected diagrams and Confluence attachments without claiming automatic synchronisation. Check-only scope reports drift; it does not update files, diagrams or pages.

Use the Smart Clearance documentation patterns recorded in `.codex/rules/plan-sync.md` when refining document structure. It is a style reference, not permission to import that repository's architecture, rules or cloud settings. Limit reads to the current change rather than rechecking unrelated code or diagrams.

Use current root-document links to find the active phase/story/decision pack and its native Lucid/workflow/chart manifests, not only older bootstrap diagram snapshots. Follow the phasewise reconciliation and rich-content preservation requirements in `.codex/rules/plan-sync.md`; keep local draft IDs and implementation/readiness claims distinct from actual tracker and publication records.

Propose exact local and external corrections with affected pages, issues and consequences. Read existing pages and space instructions before proposing edits. Require explicit approval for each stated external-write scope, then use the appropriate connector. Never automatically overwrite a Confluence page, invent records, or close an issue. Parallelise independent read-only lanes only when authorised and available; observe the five-agent total limit.
