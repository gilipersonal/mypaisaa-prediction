# GitHub delivery and CI

Repository: https://github.com/gilipersonal/mypaisaa-prediction

## Branches and delivery

`main` is the default branch and the destination for all feature PRs. It was created from the published setup baseline `0b00793`; the existing `setup/bootstrap` branch is preserved for history. The first PR brings the Codex workflow work and this CI setup into `main` through the normal review path.

Start each new task from updated `origin/main`, using an actual MP issue and `MP-<number>-<lowercase-slug>` branch. Use `MP-<number>: <summary>` commit subjects and `[MP-<number>] <summary>` PR titles. The title and branch issue keys must match. Commit and push completed work to the issue branch, then raise a PR to `main` when the running prompt requests it; otherwise ask once for permission at the end. Do not commit feature changes directly to `main`, force-push, delete branches, merge PRs or close issues without the appropriate explicit authority. Creating a PR does not authorise its merge.

Codex plan-sync and review permissions are unchanged. Offer independent review of a new deliverable at the end. Each review round and standalone findings-ledger run needs its own approval; CI does not grant it. Claude configuration and other repositories are outside this change.

## CI coverage

All five named checks should be green before merging:

| Check | What it runs |
| --- | --- |
| Backend | Python 3.12, lock freshness, frozen development dependency installation, backend Ruff checks, Python tooling error checks and backend tests |
| Codex tooling | Runner unit tests with synthetic fixtures, review-policy/history assertions, PR-policy tests and JSON syntax checks |
| Static preview | Preview HTML language/title/viewport presence, local file references and same-page anchor targets |
| Workflow lint | Checksum-verified actionlint 1.7.12 checks all workflow YAML and supported shell expressions |
| Jira traceability | PR targets `main`; branch/title share an MP key; every included commit has an MP key |

CI runs on PRs to `main` and on `main` pushes; the Jira metadata check runs for every PR, including title edits, so it can reject another destination. Workflow runs have job time limits, cancel superseded runs, use read-only repository access and do not retain checkout credentials. GitHub actions are pinned to commit SHAs. No workflow deploys, publishes the site, calls market-data/Claude services, runs independent agents or executes the real fixed-findings ledger. The unit tests exercise the runner using isolated fixtures; policy tests also inspect the checked-in review documents and history.

Backend dependencies are recorded in `backend/uv.lock`. Update intentionally with `uv lock --project backend`, review the dependency diff and rerun checks. CI pins uv 0.12.9 and refuses stale locks. Update action SHAs and the actionlint archive checksum through an MP issue PR. No cloud credentials are needed. Hosted Actions consumes the organisation's Actions allowance; these settings do not change its billing limit or buy additional capacity.

`web/` and `mobile/native-ios/` are currently placeholders without `package.json` or `Package.swift`. Their previous CI jobs could not run. No web build, browser E2E or Swift test pass is claimed. When adding the first executable web, Swift or React Native project, add its locked installation, lint/type checks, build and tests to CI in the same PR. Device/browser suites follow the risk and milestone policy in `review-optimisation.md`. The static preview check is a structural smoke test, not browser, accessibility or product validation.

## Server-side protection

As checked on 2026-11-01, GitHub returned HTTP 403 for both branch-protection and ruleset APIs on this private repository, requesting a plan upgrade. **Server-side PR-only and required-check enforcement is not active.** Repository instructions and CI are in place; they do not prevent an administrator or another client from bypassing the process.

The intended settings are versioned in `.github/main-protection.json`: require a PR, the five named checks with an up-to-date base, resolved conversations, admin enforcement, and no force pushes or deletion. Zero mandatory GitHub approvals supports the personal-only workflow; the separately approved Codex review is not a GitHub approval. The repository stays private and no plan upgrade is authorised by this setup. GitHub documents plan availability at https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches.

After the owner enables a compatible GitHub plan, apply the saved policy with:

```sh
gh api --method PUT repos/gilipersonal/mypaisaa-prediction/branches/main/protection \
  --input .github/main-protection.json
```

Then read back the protection and verify the exact check names against a successful PR. The JSON is a desired configuration, not proof that GitHub has applied it. Do not change repository visibility or billing as a workaround.
