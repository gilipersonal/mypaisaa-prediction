---
name: autoship
description: Finish a Mypaisaa Prediction MP issue for shipping. Run the release gates, commit and push the issue branch, then ask once before any review round, PR, merge or issue closure, naming every act. Use when asked to autoship, finish, ship or merge MP work.
---

# Autoship an MP issue (Claude)

Claude's version of `.agents/skills/autoship/SKILL.md`, adapted from mypaisa-agent's autoship in MP-35 without MA's autopilot. The owner's global shipping rule applies: **never raise a PR, merge, or close an issue unless the prompt that is running asks for it.** A yes in an earlier turn doesn't count. The independent review asks before every round (`.claude/rules/independent-review.md`). In this project this skill takes the place of `/jira-flow:ship` and `/jira-flow:pr`. Never push to `main` directly; the merge goes through the PR.

Request: $ARGUMENTS

## 1. The facts

```bash
git branch --show-current
git status --short --branch
git worktree list
git log --oneline origin/main..HEAD
gh pr list --head "$(git branch --show-current)" --json number,url,state
```

The key comes from the argument, else the branch (`MP-<n>-<slug>`). On `main` with no key, stop and say which issue the work belongs to (`/jira-flow:status`). Read `AGENTS.md`, `.claude/rules/jira-flow.md`, and the MP issue with its acceptance criteria (Atlassian MCP; the cloudId is in `.claude/jira-flow.json`). If the key, scope or intended change is unclear, stop and ask.

Codex and other agents may be working in the same checkout. Preserve every change you didn't make, and name uncommitted files that belong to other work rather than committing them. Keep `site/.openai/hosting.json` intact.

## 2. To the door, without asking

1. **Release gates.** `python3 scripts/review_checks.py --base origin/main --run --all --record "$TMPDIR/ship-checks.json"`, and in the same message `python3 scripts/review_regress.py --every --jobs 4` (exit 0, or 3 with every manual item named) and `python3 scripts/check_agent_config.py`. Fix any `FAIL`. Report each `UNAVAILABLE` or `DEFERRED` check and each unmapped path by name; never call them passes. A red gate stops here: report it and raise nothing. During development, `--run` without `--all` is enough.
2. **Docs and evidence.** Update what the change touches (README, the architecture and tech-stack documents, review state, Jira evidence). When the plan, Confluence, Jira descriptions or diagrams must change too, say so; syncing them is the `mp-plan-sync` skill's job and needs its own yes.
3. **No review yet.** The independent review is offered in the end-of-work question (section 3), never started here unless the running prompt asked for a reviewer.
4. **Commit** this issue's files only, subject `MP-<n>: <subject>`. Never commit to `main`, force-push or delete a branch.
5. **Push**: `git push -u origin <branch>`.
6. **Trace it**: comment on the issue with the branch, the commit, the gates and their results. Move it to `In Progress` if it is still `To Do`, through a transition you looked up on that issue.

## 3. The one question

Ask once, at the end, naming every pending act and offering the review round in the same question, for example:

> MP-<n> is ready on `MP-<n>-<slug>` at `<sha>`, gates green (<names>). Run review round 1 (lanes <the lanes the change touches>; each later round asked first), raise the PR, merge it once every required check passes, and close MP-<n>?

Use the turn's next-step question with the realistic answers as buttons, for example "Review round 1 first", "Raise PR, merge, close" and "Raise the PR only". Act only on what the answer names. Silence, a default or an unrelated yes is not consent. A no to the review means the work is reported as unreviewed, with the gates that ran.

## 4. On a yes to a review round

Follow `.claude/skills/mp-independent-review/SKILL.md`. In short:

1. **Gates first:** the release gates above, `python3 scripts/review_regress.py MP-<n> --approved` and `python3 scripts/review_regress.py --state MP-<n>`. A FAIL is fixed before any reviewer starts. Exit 3 means every automated check passed but `manual` items remain: one fresh verifier sub-agent, blind to the making, checks each before any lane starts (`.codex/review-policy.json`).
2. **Lanes:** one fresh sub-agent per lane in a single message, at most four, each briefed from `.claude/skills/autoship/review-brief.md`: the issue and its acceptance criteria, the rules and lessons, its lane's files, and the fixed list, never the maker's notes. Round 1 covers everything; later rounds only the delta since the previous `reviewed_commit` and its direct joins.
3. **Merge, record, fix:** one list of findings, recorded in `review/MP-<n>/state.json`; fix the blocking ones on the branch, add each to `review/MP-<n>/fixed.json` with a behavioural check, push.
4. **Ask before the next round.** Report the round and ask again, naming the next round's delta scope and any ship acts still pending. At most five rounds; after the fifth, stop and report what is left and what each fix would cost.

## 5. Act only on what the running prompt asked for

- **PR:** use `.github/pull_request_template.md`. Title `[MP-<n>] <summary>`, the issue link in the body, the gate results, and the review outcome stated plainly (for example "reviewed, clean in round 2" or "unreviewed by owner choice"). Keep `gh pr create` visible in the command. After it, call `mcp__ccd_pr__get_status` (and `bind_pr` if it doesn't show the PR); never turn on auto-merge. Comment the PR URL on the issue, and move it to `In Review` through a transition you've looked up on that issue.
- **Merge:** check that the PR still targets `main` and that its head is the commit you presented (`gh pr view <n> --json headRefOid,baseRefName,mergeStateStatus`). **Every check listed in `.github/main-protection.json` must have passed on that head** (`gh pr checks <n>`); today that is Backend, Docs, Review tooling, Agent config, Static preview, Workflow lint and Jira traceability, and any check added there later counts too. There must be no open blocking review findings. Then run `gh pr merge <n> --merge --match-head-commit <sha>`. If the head changed, ask again. Keep both branches.
- **Close:** only if closure was named, the merge is confirmed, and the acceptance criteria are complete. Match the key across the PR title, branch and link, and close no other issue. Comment the merged PR URL and merge commit, look up the issue's transitions, take the one leading to Done, and read the status back. If Jira fails, report it as outstanding and never merge again. MP-19 and MP-20 stay open until the owner says otherwise.
- **Return to main** (after a confirmed merge): `git fetch origin`, then `git switch main` and `git merge --ff-only origin/main`. Check that `HEAD` equals `origin/main`. If the checkout is dirty, diverged, or in use by Codex or another worktree, leave it alone and say so. Never reset, stash or force anything.

After a no: leave whatever is open as it is, and say so in one line.

## Report

Report the merge, the closure and the local return separately, including any partial failure:

```
PR:     <url> [MP-<n>] ...  merged <sha> (checks: <every required check>; gates: <names>; review: clean in <n> rounds | unreviewed by owner choice)
Jira:   MP-<n> Done (comments: progress, PR raised, merged) | left open: <why>
Local:  main at <sha>, synced | left alone: <why>
```
