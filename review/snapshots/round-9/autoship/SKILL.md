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
