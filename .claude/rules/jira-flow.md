# Jira flow for MP: every change is an issue, every PR carries its key

Work in this repository is tracked in Jira project **MP** (mypaisaa-prediction) at `https://duttaarun2015.atlassian.net`. `.claude/jira-flow.json` holds the project's ids, gates and ship settings; `.claude/jira/taxonomy.md` holds the epics, the labels and the issue templates. The jira-flow plugin's skills (`/jira-flow:status`, `/jira-flow:work`, `/jira-flow:plan`, `/jira-flow:bug`, `/jira-flow:track`) read them. For finishing an issue, use this project's `autoship` skill (`.claude/skills/autoship/SKILL.md`). This rule was expanded from mypaisa-agent's in MP-35; MP keeps the stricter ship gate below and never inherits MA's exceptions.

## The five habits

1. **Start of a session: know the issue.** The branch carries the key (`MP-<n>-<slug>`). If it has none and work is asked for, run `/jira-flow:status` and name the issue the work belongs to before editing. If none fits, create one with `/jira-flow:plan`. Ask only when the epic is genuinely ambiguous.
2. **Work starts: read the issue, then move it.** Read the issue and its acceptance criteria before implementation. When editing begins on an issue in `To Do`, move it to `In Progress`. Look up the transitions on that specific issue rather than guessing ids (the `transitions` in `.claude/jira-flow.json` are left blank on purpose). One issue in progress per branch.
3. **Work lands: the issue records it.** Before reporting a change as done, comment on the issue (`/jira-flow:track`) with the files changed, the gates run and their results, what was verified, and anything left open. A change nobody can find from the Jira issue did not happen.
4. **New work appears: a new issue appears with it.** A follow-up noticed, a gap found, a bug hit: create it at once (`/jira-flow:plan` or `/jira-flow:bug`), link it to the current issue, and say the key in the report. Keep the to-do list in Jira, not in the conversation. When the plan, Confluence or diagrams describe the new work too, keep them in step through the `mp-plan-sync` skill, with its own yes.
5. **A PR is traced or it is not raised.** Branch `MP-<number>-<slug>`, every commit subject `MP-<number>: <subject>`, PR title `[MP-<number>] <title>`, PR body from `.github/pull_request_template.md` with the issue link. The `Jira traceability` check fails a PR without the key. Raising the PR moves the issue to `In Review`; it moves to `Done` only after the merge, and only when asked.

## The ship gate: nothing is raised, merged or closed unasked

| Act | Needs asking in the running prompt |
| --- | --- |
| Raise a pull request (`gh pr create`, `gh pr ready`, the GitHub MCP) | **yes** |
| Merge anything (`gh pr merge`, `git merge` into `main`, the merge API) | **yes** |
| Move a Jira issue to Done, or any close or resolve transition | **yes** |
| Run an independent review round | **yes, before every round** |
| Publish or sync Confluence, Jira descriptions, Lucid or the site | **yes**, each scope separately |
| Branch, edit, commit, push an `MP-<n>-<slug>` branch | no |
| Create a Jira issue, comment on one, move it to In Progress or In Review | no |
| Everything else (build, test, gates, local evidence) | no |

"Asking" means the owner said so **in the prompt that is running**, in words or by answering the end-of-work question. A yes given in an earlier turn, a plan that mentioned a PR, silence or a default selection is not a yes now. Take the work as far as it goes without those acts, then say in one line what is ready and **ask once**, naming every act that would happen:

> Ready on MP-35-ma-best-practices at `abc1234`, gates green. Run review round 1 (lanes s and c), raise the PR, merge it, and close MP-35?

Offer the independent review in that same question; a yes covers one round, and you ask again before every later round (`.claude/rules/independent-review.md`). A no or any other answer means the work is reported as unreviewed, with the gates that ran.

**Do not inherit mypaisa-agent's exceptions.** MA raises its PR and closes its issue without asking, and treats a bare "yes" as review-then-merge; MP does neither. The jira-flow plugin's `ask-before-ship` hook turns a PR, merge or close into a permission prompt whatever route attempts it. It is a backstop, not the rule: the asking belongs in the report, in words, before a prompt ever appears.

## Merge and close

- Merge only a PR whose head is the commit you presented, after every check listed in `.github/main-protection.json` has passed on that head and no blocking review finding is open. If the head changed, ask again.
- Close an issue only when closure was named, the merge is confirmed, and its acceptance criteria are complete. Comment the merged PR and merge commit, take the issue's transition to Done, and read the status back. Never mark an issue Done before its work is complete and, when it has a PR, that PR is merged.

## Naming

- Branch `MP-<number>-<slug>`; commit `MP-<number>: <subject>`; PR `[MP-<number>] <title>`.
- Summaries are outcomes in plain words, no ticket-speak.
- Descriptions follow the templates in `.claude/jira/taxonomy.md`: what and why, where in the repository, acceptance criteria, which gates.
- Labels as the taxonomy lists them. Bugs are type `Bug` and also carry the `bug` label.
- No em dashes in summaries or descriptions; use hyphens, colons or commas.

## Gates

Run the applicable configured gates and report failures; `python3 scripts/review_checks.py --base <base> --run` maps changed paths to their checks. Add or change gates as build roots actually become runnable. A missing gate is never a pass: name it as unavailable or deferred.

## Confluence

The Confluence space `mypaisaapr` is the documentation destination. Do not publish or synchronise a page without first checking its existing content, the space instructions and the user's request, and read the page back after any write.

## What not to do

- Do not create an issue for a typo-sized change inside an issue already in progress; comment on that issue instead.
- Do not push directly to `main` or force-push. Do not delete branches without being asked.
- Do not transition an issue to Done unless the running prompt asked for the closure and the merge is confirmed.
- Do not delete issues. Ever. Say what should be deleted and let the owner do it.
- Do not paste secrets, tokens, broker credentials or device identifiers into Jira.
