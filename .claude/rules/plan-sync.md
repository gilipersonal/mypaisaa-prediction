# Plan sync: the records move together (MP)

MP's version of MA's plan-sync rule (MP-35). The plan, Jira, Confluence and the code describe the same work. They are kept in step, and a check says so before any PR.

| Record | Where |
| --- | --- |
| Root docs (they win) | `README.md`, `ARCHITECTURE.md`, `TECH-STACK.md` |
| The planning pack | `docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json` (PH-00 to PH-09 and the local story drafts, which are not Jira issues), `docs/planning/ma-reconciliation-2026-11-02/direction-summary.md` (ARC-01 to ARC-12), follow-up cards such as `docs/planning/claude-models-and-batching-2026-11-02.md` (ARC-06b) |
| Jira | Project MP, mirrored offline in `docs/planning/trace.json`: each issue's key, summary, type, status, parent and `code` |
| Confluence | Space mypaisaapr, rendered by `docs/confluence/build_pages.py` (one page per phase); page ids in `docs/confluence/confluence.json` |
| The code | `backend/`, `web/`, `mobile/`, `infra/`, named per issue in the trace's `code` paths |

## The rules

1. **The owner's answers, then the root docs.** The owner's recorded answers come first; the root documents follow them and win over every other record. When the pack, Jira or Confluence disagrees with the root docs, the others change to match. The order in full is in the MP-20 sign-off pack (`docs/planning/baseline-signoff-2026-11-03/README.md`).
2. **Change one, change all, in one PR.** A new phase gets its Confluence page and published page id. A new or changed issue gets its trace row. A doc that cites an issue or an ARC decision cites one that exists.
3. **A disagreement is an open question for the owner, not a guess.** If the root docs do not settle it, write it down as a question for the owner (in the PR and on the issue) and leave both records as they are until the owner answers.
4. **Code is traced to its issue.** A Story, Task or Bug that is In Review or Done lists the paths it changed. Every path must exist now or have been deleted in git history. If the issue changed no files, give a `no_code` reason. A branch changes only product files its own issue claims.
5. **Jira is read freely and written only within the task.** Refreshing the trace reads Jira. Publishing Confluence, Jira writes beyond the running task, and any other external write each need their own yes, as `.claude/rules/mp-workflow.md` and the `mp-plan-sync` skill set out.

## When to run what

| When | Run |
| --- | --- |
| After any Jira change (new issue, status, parent) | Refresh `docs/planning/trace.json` (`python3 scripts/plan_sync.py refresh-help` prints the MCP query), then `check` |
| After editing a root doc, the pack or the Confluence generator | `python3 scripts/plan_sync.py check` |
| Before every PR | `python3 scripts/plan_sync.py check` and `python3 scripts/plan_sync.py pr-files` (add the branch's paths to its row's `code` first) |
| After changing `scripts/plan_sync.py` | `python3 scripts/plan_sync.py selftest` |
| In CI, on every PR | `check`, `selftest`, and `pr-files --base HEAD^1` with the PR's head branch in `GITHUB_HEAD_REF` |

## What the check fails on

- A key `MP-<n>` cited in the root docs, `.claude/rules/*.md` or the top level of `docs/planning/` that is not in the trace.
- An ARC id cited in the root docs that is not in the direction summary, or a follow-up id (such as ARC-06b) that is not in its own card.
- A baseline phase with no page in the generator's `PAGES` or no published page id, or a phase page with no phase.
- A Story, Task or Bug that is In Review or Done whose `code` names no path, or a path that is neither in the repo nor deleted in its history.
- A malformed trace: unreadable, a row missing its key, summary, status or type, a duplicate key, or an unknown parent.

`pr-files` fails on a changed file under `backend/`, `web/`, `mobile/` or `infra/` (committed, uncommitted or untracked) that the branch's issue does not claim. In CI it fails closed when no MP key can be found.

A clean check means the records are aligned as of the trace's `as_of` date. It does not mean live sync with Jira.
