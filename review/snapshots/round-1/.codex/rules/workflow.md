# Mypaisaa Prediction: Codex workflow

These instructions apply only to Codex work in this repository. Jira project MP is at https://duttaarun2015.atlassian.net/jira/software/projects/MP/boards/167/backlog. Confluence space `mypaisaapr` is at https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/overview?homepageId=5145345. Read `.claude/jira-flow.json` only as the existing shared configuration; do not change Claude's settings, rules, or skills as part of this Codex workflow.

## Decisions and permission

- Ask before each distinct plan-sync operation, independent review, and standalone review-regression run. Use the available user-input choice tool if it supports approval questions; offer `Run` and `Not now`. Otherwise ask the same concise question in chat. Do not treat a default selection, elapsed time, silence, or an unrelated yes as consent.
- Always ask for a choice before running these operations, even when initially requested. A yes to an independent review includes its required regression checks and up to five rounds only when the question names those checks; it does not include a separate plan-sync operation. A yes to plan-sync only covers the stated read or proposed write scope, not a review or other external changes.
- Offer independent review at the end when a deliverable is ready, in the same question as any ship question. Explain its lanes and the five-round maximum. No or any answer other than yes means no review; state that it is unreviewed and list the gates that actually ran. Never ask again between rounds authorised by that yes.
- Use at most five concurrent agents total, including the coordinator, and never exceed the runtime's lower limit. If blind parallel reviewer delegation is unavailable, report the review as failed/unavailable rather than claiming a substitute is independent.
- Ask in the current prompt before raising a PR, merging, or closing an issue. No force push, direct push to main, or branch deletion without appropriate authority. The existing temporary default branch `setup/bootstrap` must be reconciled with the intended base `main` before any PR; do not silently change the remote default.

## Route work

| Work | Codex skill | Gate |
| --- | --- | --- |
| UI/UX, web, SwiftUI, charts | `.agents/skills/mp-design-first/SKILL.md` | Present viable options for material new design and obtain the user's pick before implementing that design. |
| Check or synchronise plan, Jira, Confluence, design and code | `.agents/skills/mp-plan-sync/SKILL.md` | Explicit approval for the stated scope before running; dry-run evidence before any approved external writes. |
| Independent review | `.agents/skills/mp-independent-review/SKILL.md` | Explicit approval before the review; gates first, including the regression runner within that approval. |
| Review regression checks on their own | `.agents/skills/mp-review-regression/SKILL.md` | Explicit approval before running ledger checks. |
| Finish an MP issue | `.agents/skills/autoship/SKILL.md` | Follow review and shipping permissions above. |

Parallelise independent work within the concurrency limit. Routine implementation checks, including tests of the regression runner itself using isolated synthetic fixtures, do not constitute a run against a real review ledger. The prompt reminder hook is advisory; it cannot force a native approval dialog.

## AWS

Retain the project AWS target below £50/month excluding Twelve Data and Claude. Prefer infrastructure as code, separate dev and production, review plans, cost and drift, and keep secrets out of code, state, logs and chat. No AWS mutation, deployment, paid-service call or automatic apply without the user's explicit request. Follow the active secret-handling instructions and the relevant AWS skill before secret work. Do not import another project's AWS account, region, names, or deployment permissions.

## Tracking and decisions

Before working on an existing MP issue, read it and its acceptance criteria. Record meaningful evidence, tests and remaining gaps on the relevant issue when within scope. A follow-up needs an issue when the user requests tracking or it is necessary to complete the authorised workflow; do not create unrelated external records. A PR must name its issue; Done means complete and, for PR work, merged. Confluence pages are not automatically published or overwritten by a local edit.
