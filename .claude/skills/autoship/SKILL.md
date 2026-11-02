---
name: autoship
description: Finish a Mypaisaa Prediction MP issue for shipping. Run the release gates, commit and push the issue branch, then ask once before any review, PR, merge or issue closure. Use when asked to autoship, finish, ship or merge MP work.
---

# Autoship an MP issue (Claude)

Claude's version of `.agents/skills/autoship/SKILL.md`. The owner's global shipping rule applies: **never raise a PR, merge, or close an issue unless the prompt that is running asks for it.** A yes in an earlier turn doesn't count.

## 1. Prepare (no asking needed)

1. Read `AGENTS.md`, `.claude/rules/jira-flow.md`, the MP issue and its acceptance criteria (Atlassian MCP, cloudId in `.claude/jira-flow.json`). If the key, scope or intended change is unclear, stop and ask.
2. Run `git status --short --branch` and `git worktree list`. Codex may be working in the same checkout, so preserve any change you didn't make. Keep `site/.openai/hosting.json` intact.
3. Work on `MP-<n>-<slug>` from `origin/main`. Commit subjects start with `MP-<n>: `. Never commit to `main`, force-push or delete a branch.
4. **Release gates:** `python3 scripts/review_checks.py --base origin/main --run --all --record "$TMPDIR/ship-checks.json"`. Fix any `FAIL`. Report each `UNAVAILABLE` check and each unmapped path by name; never call them passes. During development, the cheaper `--run` without `--all` is enough.
5. Update the docs and evidence the change touches (README, architecture, tech-stack, review state). Commit, push with `-u origin`, and add a progress comment to the issue.

## 2. Ask once, at the end

One question naming every pending act, for example: *"Ready on MP-<n>-<slug> at `<sha>`. Run review round 1 (lanes …), raise the PR, merge it, close MP-<n> and return to main?"* Offer the review in the same question (`.claude/rules/independent-review.md`; one yes covers one round). Give the realistic choices as buttons. Silence or a default is not consent.

## 3. Act only on what the running prompt asked for

- **PR:** use `.github/pull_request_template.md`. Title `[MP-<n>] <summary>`, the issue link in the body, the gate results, and the review outcome stated plainly (for example "unreviewed by owner choice"). After `gh pr create`, call `mcp__ccd_pr__get_status` (and `bind_pr` if it doesn't show the PR). Don't poll CI yourself, and never turn on auto-merge. Comment the PR URL on the issue, and move it to In Review only through a transition you've looked up on that issue.
- **Merge:** check that the PR still targets `main` and that its head is the commit you presented (`gh pr view <n> --json headRefOid,baseRefName,mergeStateStatus`). All seven checks must have passed on that head (`gh pr checks <n>`): Backend, Docs, Review tooling, Agent config, Static preview, Workflow lint and Jira traceability; `.github/main-protection.json` lists them. There must be no open blocking review findings. Then run `gh pr merge <n> --merge --match-head-commit <sha>`. If the head changed, ask again. Keep both branches.
- **Close:** only if closure was named, the merge is confirmed, and the acceptance criteria are complete. Match the key across the PR title, branch and link, and close no other issue. Comment the merged PR URL and merge commit, look up the issue's transitions, take the one leading to Done, and read the status back. If Jira fails, report it as outstanding and never merge again. MP-19 and MP-20 stay open until the owner says otherwise.
- **Return to main** (after a confirmed merge): `git fetch origin`, then `git switch main` and `git merge --ff-only origin/main`. Check that `HEAD` equals `origin/main`. If the checkout is dirty, diverged, or in use by Codex or another worktree, leave it alone and say so. Never reset, stash or force anything.

Report the merge, the closure and the local return separately, including any partial failure.
