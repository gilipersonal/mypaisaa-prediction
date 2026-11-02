---
name: mp-plan-sync
description: Compare, and with approval synchronise, Mypaisaa Prediction plans, MP Jira, the mypaisaapr Confluence space, Lucid diagrams and the code. Ask for the exact scope first; check-only by default.
---

# Plan sync for MP (Claude)

Claude's version of `.agents/skills/mp-plan-sync/SKILL.md`, with the contract in `.codex/rules/plan-sync.md`. Every sync needs the owner's yes to a **precise scope**, even if they asked for a sync: offer `Check only` (recommended) or `Not now`. A check-only yes is read-only. Each external write scope (named pages, issues or diagrams) needs its own yes after the owner has seen the exact proposed change. A plan-sync yes never covers review, publication of new pages, public sharing, a PR, merge or issue closure.

## The offline check, first

`python3 scripts/plan_sync.py check` compares the local records with no sign-in, using the rules in `.claude/rules/plan-sync.md`. It reads the root docs, the planning pack, the Jira mirror `docs/planning/trace.json`, the Confluence page list and the code. Run it before and after every lane below; it needs no yes.

1. **Refresh the mirror** when Jira is in scope. Reading Jira is part of a check-only yes. `python3 scripts/plan_sync.py refresh-help` prints the query (`project = MP ORDER BY key ASC`) and how each row is written. Update the rows, set `as_of`, and keep every row's `code`.
2. **Run `check`.** One line per problem: an unknown cited key or ARC id, a phase with no Confluence page or page id, a finished issue whose code paths match nothing, or a malformed trace. Fix the record the root docs say is wrong. If they don't settle it, it is an open question for the owner.
3. **Before a PR**, run `python3 scripts/plan_sync.py pr-files`. Every product file the branch changes must be in its own issue's `code`.
4. If `scripts/plan_sync.py` changed, run `python3 scripts/plan_sync.py selftest`.

Changing `docs/planning/trace.json` is a local edit on the issue branch, not an external write.

## Check (read-only), fast

Start the read lanes the scope needs **in one message**, either as parallel tool calls or as up to four `Explore` agents (five agents including you). Each returns differences with source links, not file dumps:

| Lane | Reads |
| --- | --- |
| Local plan | `README.md`, `ARCHITECTURE.md` and `TECH-STACK.md` at the root (always together); the active pack under `docs/planning/`; owner receipts (`foundation-policy-discussion-*.md`, `owner-decisions.json`, `direction-summary.md`) |
| Jira | `mcp__atlassian__searchJiraIssuesUsingJql` for `project = MP`, then the issues in scope: description, acceptance, comments, status and links |
| Confluence | `mcp__atlassian__getConfluenceContent` for the pages listed in `docs/confluence/confluence.json`. Compare meaning, not markup, and note any rich macros or media. |
| Diagrams | `docs/diagrams/README.md` and its manifests (document IDs, versions, hashes); read the live Lucid source only if it's in scope (see `mp-architecture-diagrams`) |

Compare only what the scope names, and keep these distinct:
- local draft story IDs versus real Jira keys;
- phase coverage versus clause-level decomposition;
- a dependency or diagram existing versus a feature being built;
- Proposed, Owner-selected, Approved architecture, Implemented, and Deployed and verified.

The newest owner receipt wins over older drafts. Smart Clearance (`.codex/rules/plan-sync.md`) is a documentation-style reference only.

Report a table with the item, local value, Jira/Confluence/Lucid value, which source wins and why, and the exact proposed correction.

## Write (only the approved scope)

1. Re-read each target right before writing: current version, parent, owned markers, macros and attachments. Reuse existing page and issue IDs. Never create duplicates or overwrite a page wholesale.
2. Apply the approved edits only. For Confluence, preserve the content outside the owned markers byte for byte. For Jira, change only the named fields or comments, and never close an issue.
3. Read everything back. Record the actual IDs, versions, hashes, links and any partial failure in the pack's receipt JSON, and update the local docs and `docs/planning/trace.json` in the same branch, then run `python3 scripts/plan_sync.py check` again.

No continuous or two-way sync exists. Say "aligned as of `<date/sha>`", never "in sync".
