# Jira flow for MP

Use `.claude/jira-flow.json` and `.claude/jira/taxonomy.md` as the project configuration. Work items belong to MP. Read the issue and its acceptance criteria before implementation; maintain the evidence and move it to an appropriate non-Done state as work progresses. Look up transitions on the specific issue instead of guessing IDs.

Use `MP-<number>-<slug>` for issue branches, `MP-<number>: <subject>` for commits, and `[MP-<number>] <title>` for PRs. Run applicable configured gates and report failures. Add or change gates as build roots actually become runnable; do not treat a missing gate as passing.

Creating and updating issues is allowed within the user's task. Ask in the current turn before raising a PR, merging, or closing an issue, explicitly naming each requested action. Do not push directly to main or force-push. Never mark an issue Done before its work is complete and, when it has a PR, that PR is merged. Do not assume permission to delete branches.

Offer the user's independent review at the end, in the same question as any ship question. Run it only on a clear yes, and ask again before every later round, as `.claude/rules/independent-review.md` sets out: gates first, fresh blind reviewers in parallel lanes, full first round, later delta rounds, fixed-findings checks, at most five rounds. A no or any other answer means unreviewed; report the gates that ran. Do not inherit the other project's exception allowing an unasked PR or issue closure.

The Confluence space `mypaisaapr` is the documentation destination. Do not publish or synchronise a page without first checking its existing content, space instructions, and the user's request.
