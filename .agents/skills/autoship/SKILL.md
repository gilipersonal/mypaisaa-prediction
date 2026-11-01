---
name: autoship
description: Prepare completed Mypaisaa Prediction MP issue work for review and shipping, then ask before raising a PR, merging, or closing the issue. Use when asked to autoship or finish an MP issue.
---

# Autoship an MP issue

Read `AGENTS.md`, `.claude/jira-flow.json`, `.claude/rules/jira-flow.md`, the current issue and its acceptance criteria. Identify the branch, changed files and any unrelated user changes. Preserve the Site's `.openai/hosting.json` identity. If the issue key, repository, or intended changes are unclear, stop and ask.

Run applicable configured gates and relevant whole-deliverable checks; stop on failures. Report missing or unrunnable gates honestly. Review the diff, update relevant documentation and evidence, then commit and push the issue branch only when these actions are within the user's task and a suitable remote exists. Do not create a remote, push to main, force-push, or delete branches without the necessary authority.

For Codex, use `docs/review-optimisation.md` to select checks during development and review rounds. Run all required release gates before shipping; risk-based review selection does not disable CI or release requirements. Leave other runtimes' gate selection unchanged.

At the end ask one question that names each pending action: independent review and any requested PR, merge, and issue closure. For Codex, a clear yes authorises only the named review round and named regression checks; ask again before every later round, up to five. For other runtimes, retain the user's existing global review rule. Any other answer means no review. The review uses fresh blind reviewers in parallel lanes, gates and regression checks first, full coverage in round one and delta coverage thereafter, with fixed findings recorded and checked. Never raise a PR, merge, or close an issue unless explicitly requested in the prompt running that action; do not infer authorisation from a previous turn.

If a PR was explicitly requested, create it only after gates pass, using the template and a verified MP issue link; move the issue to In Review only if an appropriate transition is available. Wait for checks and report their result. If a merge and closure were explicitly requested in the current prompt, verify the correct PR, required checks and review state before acting. Otherwise leave them pending. A failed review is not a skipped review.

## Codex merge consent and return to main

For Codex in this repository, once an open PR is ready, offer the merge decision instead of stopping at "PR open". Name the PR, its current commit, checks and review outcome. Use choice buttons when available: `Merge PR and switch to main`, `Keep PR open`, and, when review is pending, `Review first`. Combine the independent-review offer with this end-of-work decision; explain its lanes and regression scope if offered. Consent to create a PR, run a review or configure this workflow does not authorise a merge. A clear merge request for this PR in the running prompt is consent; otherwise wait for the explicit choice. Do not enable auto-merge or close the Jira issue as part of this choice.

Before an approved merge, verify the PR still targets `main`, its head is the reviewed or presented commit, every check named in `docs/github-workflow.md` passed on that head, and no blocking review findings remain. If the head changed or a check is missing, pending or failed, stop and resolve or report it before merging; renewed consent is needed for a changed head. Use the configured merge method and match the expected head commit (for gh, `--match-head-commit <sha>`). Preserve both branches.

After GitHub confirms the merge, fetch `origin` and return this project's clean local checkout to `main`, set its upstream to `origin/main`, and fast-forward it with `git merge --ff-only origin/main`. Create local `main` tracking `origin/main` only if absent. Do not reset, stash, force a checkout, delete a branch, or discard changes. If the checkout is dirty, another session is using it, `main` is checked out in another worktree, or the local branch has diverged, leave the affected checkout intact and report that the PR merged but local return/sync remains blocked. Confirm local `main` equals `origin/main` before reporting it as up to date. These additions do not alter other runtimes' workflow.
