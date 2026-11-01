# Mypaisaa Prediction: Codex workflow

These instructions apply only to Codex work in this repository. Jira project MP is at https://duttaarun2015.atlassian.net/jira/software/projects/MP/boards/167/backlog. Confluence space `mypaisaapr` is at https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/overview?homepageId=5145345. Read `.claude/jira-flow.json` only as the existing shared configuration; do not change Claude's settings, rules, or skills as part of this Codex workflow.

## Decisions and permission

- Ask before each distinct plan-sync operation, independent review, and standalone review-regression run. Use the available user-input choice tool if it supports approval questions; offer `Run` and `Not now`. Otherwise ask the same concise question in chat. Do not treat a default selection, elapsed time, silence, or an unrelated yes as consent.
- Always ask for a choice before running these operations, even when initially requested. A yes to a review round includes its required regression checks only when the question names those checks; it does not include another round or a separate plan-sync operation. A yes to plan-sync only covers the stated read or proposed write scope, not a review or other external changes.
- Offer independent review at the end when a deliverable is ready, in the same question as any ship question. Explain its lanes and the five-round maximum. No or any answer other than yes means no review; state that it is unreviewed and list the gates that actually ran. After each round, report the findings and fixes, then ask for explicit permission before the next round. Silence, a default selection, or an earlier yes is not approval for another round.
- Use at most five concurrent agents total, including the coordinator, and never exceed the runtime's lower limit. If blind parallel reviewer delegation is unavailable, report the review as failed/unavailable rather than claiming a substitute is independent.
- `main` is the canonical default and PR base. Start new work from current `origin/main` on an `MP-<number>-<slug>` issue branch. Commit and push completed work to that branch and deliver it through a PR targeting `main`; never deliver feature changes by pushing directly to `main`. See `docs/github-workflow.md` for CI and the current server-enforcement limitation.
- Ask in the current prompt before raising a PR, merging, or closing an issue unless that prompt already explicitly requests the act. Prepare the branch, commit and push first, then ask once for any missing PR permission. A PR request does not authorise merging or closing its issue. No force push or branch deletion without appropriate authority. Preserve `setup/bootstrap` as historical setup; do not use it as the base for new work.
- Review round one covers the whole deliverable. Each later round covers only the immediately preceding round's fixes and their directly affected connections; exclude unrelated changes. Before each approved round run fast applicable checks, the full fixed-findings ledger for the deliverable, and broader tests selected by change risk as described in `docs/review-optimisation.md`. Required release gates still apply before shipping.

## Route work

| Work | Codex skill | Gate |
| --- | --- | --- |
| UI/UX, web, SwiftUI, charts | `.agents/skills/mp-design-first/SKILL.md` | Present viable options for material new design and obtain the user's pick before implementing that design. |
| Check or synchronise plan, Jira, Confluence, design and code | `.agents/skills/mp-plan-sync/SKILL.md` | Explicit approval for the stated scope before running; dry-run evidence before any approved external writes. |
| Independent review | `.agents/skills/mp-independent-review/SKILL.md` | Explicit approval before the review; gates first, including the regression runner within that approval. |
| Review regression checks on their own | `.agents/skills/mp-review-regression/SKILL.md` | Explicit approval before running ledger checks. |
| Finish an MP issue | `.agents/skills/autoship/SKILL.md` | Follow review and shipping permissions above. |

Parallelise independent work within the concurrency limit. Routine implementation checks, including tests of the regression runner itself using isolated synthetic fixtures, do not constitute a run against a real review ledger. The prompt reminder hook is advisory; it cannot force a native approval dialog.

## Risk-based test selection

Follow `docs/review-optimisation.md`. State the affected components and connections, the selected checks, and why broader suites are needed or deferred. Run fast applicable checks and all recorded fixed-finding checks for the deliverable before each approved round. Expand coverage for shared components, API/event contracts, security, schema/import changes, or quantitative validity. Expensive browser, device and end-to-end suites normally run at milestones or before shipping, but run them earlier when the change's risk requires their evidence. Never call a missing, deferred or failed check a pass, or silently skip a slow fixed-finding check. Reuse successful results only when their relevant inputs and environment are unchanged, recording the evidence and rationale. This is a Codex instruction-based selection process, not an automatic test-selection engine.

In a trusted project checkout, use `/hooks` in Codex CLI to inspect and trust the exact project hook definition; untrusted or changed hooks are skipped. Recheck after changes. The workflow rules still apply even when the reminder is inactive.

## AWS

Retain the project AWS target below £50/month excluding Twelve Data and Claude. Prefer infrastructure as code, separate dev and production, review plans, cost and drift, and keep secrets out of code, state, logs and chat. No AWS mutation, deployment, paid-service call or automatic apply without the user's explicit request. Follow the active secret-handling instructions and the relevant AWS skill before secret work. Do not import another project's AWS account, region, names, or deployment permissions.

## Tracking and decisions

Before working on an existing MP issue, read it and its acceptance criteria. Record meaningful evidence, tests and remaining gaps on the relevant issue when within scope. A follow-up needs an issue when the user requests tracking or it is necessary to complete the authorised workflow; do not create unrelated external records. A PR must name its issue; Done means complete and, for PR work, merged. Confluence pages are not automatically published or overwritten by a local edit.
