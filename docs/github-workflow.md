# GitHub delivery and CI

Repository: https://github.com/gilipersonal/mypaisaa-prediction

## Branches and delivery

`main` is the default branch and the destination for all feature PRs. It was created from the published setup baseline `0b00793`; the existing `setup/bootstrap` branch is preserved for history. [PR #1](https://github.com/gilipersonal/mypaisaa-prediction/pull/1) merged the Codex workflows and CI as `27fa39214797f8ca762f218e4529d625a70d1530`. [PR #2](https://github.com/gilipersonal/mypaisaa-prediction/pull/2) merged the linked-Jira-closure workflow as `d0e0c1441a6ff952eb64b47c3f10017f227431af`. Both corresponding issues, MP-1 and MP-2, are Done.

Start each new task from updated `origin/main`, using an actual MP issue and `MP-<number>-<lowercase-slug>` branch. Use `MP-<number>: <summary>` commit subjects and `[MP-<number>] <summary>` PR titles. The title and branch issue keys must match. Commit and push completed work to the issue branch, then raise a PR to `main` when the running prompt requests it; otherwise ask once for permission at the end. Do not commit feature changes directly to `main`, force-push, delete branches, merge PRs or close issues without the appropriate explicit authority. Creating a PR does not authorise its merge.

Codex plan-sync and review permissions are unchanged. Offer independent review of a new deliverable at the end. Each review round and standalone findings-ledger run needs its own approval; CI does not grant it. Claude configuration and other repositories are outside this change.

## Merge consent and local return

Once an open PR is ready, Codex presents its link, current commit, linked MP issue, check results and review outcome, then offers `Merge PR, close MP-<number>, and switch to main` or `Keep PR open`, plus `Review first` when applicable. The combined choice authorises the named merge and issue closure in the running prompt. A merge-only instruction authorises only merging; a workflow-configuration request, PR request or review approval does not authorise those acts. Silence leaves the PR open. Branch deletion remains separate.

Before merging, Codex checks the current PR head against the commit presented for consent, confirms the destination is `main`, verifies all ten named checks passed on that head, and confirms no blocking review findings remain. A changed head requires fresh checks and renewed consent. The merge uses the configured method and an expected-head guard, without auto-merge.

After GitHub confirms the successful merge and the issue's acceptance criteria are complete, Codex records the merged PR URL and merge commit on the verified linked issue, discovers the available transition leading to Done and closes it when closure was included in consent. It checks the returned status rather than assuming success. An issue already Done needs no repeated transition. Ambiguous links, unfinished acceptance criteria or an unconfirmed merge leave the issue open. A Jira failure is reported as outstanding and does not prevent the safe local return below; merge, closure and local sync are reported separately.

After GitHub confirms the merge, Codex fetches `origin`, switches the clean local checkout to `main`, ensures it tracks `origin/main`, and fast-forwards with `git merge --ff-only origin/main`. A missing local `main` can be created from `origin/main`. Local and remote tips must match before Codex reports the checkout up to date. Unsaved work, another active session or worktree using the branch, or local divergence stops the local switch/update without resets, stashing, forced checkout or discarded changes. Codex reports the successful remote merge and any remaining local-sync problem separately.

## CI coverage

All ten named checks should be green before merging:

| Check | What it runs |
| --- | --- |
| Backend | Python 3.12, lock freshness, frozen development dependency installation, backend Ruff checks, Python tooling error checks and backend tests |
| Docs | `docs/readme/check_readme.py`: links and anchors in README, ARCHITECTURE and TECH-STACK, the mark's SVGs and Reduce Motion fallbacks, every GIF's frames and still image, and the vendored badges |
| Review tooling | Review-regression runner, PR-policy and check-selection tests; the runner's self-test; every fixed finding in every ledger still holds (exit 3, only manual checks left, passes); every review state file is whole |
| Plan sync | `scripts/plan_sync.py`: the Jira mirror in `docs/planning/trace.json`, the root documents, the phases and the Confluence pages agree; on a PR, every product file changed belongs to the branch's issue; plus its self-test |
| Confluence receipts | `docs/confluence/build_pages.py`: every page is rendered from the repo, published, and read back whole; plus its self-test |
| Agent config | `scripts/check_agent_config.py`: Claude skill frontmatter, `.claude/rules/` links and named paths, `.claude/jira-flow.json`, Codex JSON syntax, and that `.github/main-protection.json` names exactly these jobs plus CodeQL, which must stay listed; then its tests, the Claude skill tests and the hooks' self-test |
| Static preview | Preview HTML language/title/viewport presence, local file references and same-page anchor targets |
| Workflow lint | Checksum-verified actionlint 1.7.12 checks all workflow YAML and supported shell expressions |
| Jira traceability | PR targets `main`; branch/title share an MP key; every included commit has an MP key |
| CodeQL | GitHub code scanning in its default setup, not a workflow in this repository: Python, JavaScript and TypeScript, and GitHub Actions, with the default query suite. A new alert fails the check. Required since 24 November 2026 (MP-198) |

CI runs on PRs to `main` and on `main` pushes; the Jira metadata check runs for every PR, including title edits, so it can reject another destination. Workflow runs have job time limits, cancel superseded runs, use read-only repository access and do not retain checkout credentials. GitHub actions are pinned to commit SHAs. No workflow deploys, publishes the site, calls market-data/Claude services, runs independent agents or executes the real fixed-findings ledger. The unit tests exercise the runner using isolated fixtures; policy tests also inspect the checked-in review documents and history.

Backend dependencies are recorded in `backend/uv.lock`. Update intentionally with `uv lock --project backend`, review the dependency diff and rerun checks. CI pins uv 0.12.9 and refuses stale locks. Update action SHAs and the actionlint archive checksum through an MP issue PR. No cloud credentials are needed. Hosted Actions consumes the organisation's Actions allowance; these settings do not change its billing limit or buy additional capacity.

`web/` and `mobile/native-ios/` are currently placeholders without `package.json` or `Package.swift`. Their previous CI jobs could not run. No web build, browser E2E or Swift test pass is claimed. When adding the first executable web, Swift or React Native project, add its locked installation, lint/type checks, build and tests to CI in the same PR. Device/browser suites follow the risk and milestone policy in `review-optimisation.md`. The static preview check is a structural smoke test, not browser, accessibility or product validation.

## Server-side protection

As checked on 2026-11-01, GitHub returned HTTP 403 for both branch-protection and ruleset APIs on this repository, then private, requesting a plan upgrade.

As checked on 2026-11-24 (MP-198), the repository is **public**, and both APIs answer:

- Branch protection on `main`: none (HTTP 404, "Branch not protected").
- One active ruleset, "main" (id 27945580, created 2026-11-23), holds the deletion and non-fast-forward rules, but its branch list is empty, so it applies to no branch; `gh api repos/gilipersonal/mypaisaa-prediction/rules/branches/main` returns no rules.
- Code scanning: GitHub's CodeQL default setup is configured.

The visibility change was not made by MP-198. This file had said the repository stays private, so whether public is intended is an open question for the owner.

**Server-side PR-only and required-check enforcement is not active.** Repository instructions and CI are in place; they do not prevent an administrator or another client from bypassing the process.

The intended settings are versioned in `.github/main-protection.json`: require a PR, the ten named checks with an up-to-date base, resolved conversations, admin enforcement, and no force pushes or deletion. Zero mandatory GitHub approvals supports the personal-only workflow; the separately approved Codex review is not a GitHub approval. No plan upgrade is authorised by this setup. GitHub documents plan availability at https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches.

Applying the saved policy is a repository-settings change and needs the owner's yes in the running prompt. While the APIs answer, apply it with:

```sh
gh api --method PUT repos/gilipersonal/mypaisaa-prediction/branches/main/protection \
  --input .github/main-protection.json
```

Then read back the protection and verify the exact check names against a successful PR. The JSON is a desired configuration, not proof that GitHub has applied it. Do not change repository visibility or billing as a workaround.
