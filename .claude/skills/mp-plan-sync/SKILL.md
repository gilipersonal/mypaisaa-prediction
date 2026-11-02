---
name: mp-plan-sync
description: Compare, and with approval synchronise, Mypaisaa Prediction plans, MP Jira, the mypaisaapr Confluence space, Lucid diagrams and the code. Ask for the exact scope first; check-only by default.
---

# Plan sync for MP (Claude)

Claude's version of `.agents/skills/mp-plan-sync/SKILL.md`, with the contract in `.codex/rules/plan-sync.md`. Every sync needs the owner's yes to a **precise scope**, even if they asked for a sync: offer `Check only` (recommended) or `Not now`. A check-only yes is read-only. Each external write scope (named pages, issues or diagrams) needs its own yes after the owner has seen the exact proposed change. A plan-sync yes never covers review, publication of new pages, public sharing, a PR, merge or issue closure.

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
3. Read everything back. Record the actual IDs, versions, hashes, links and any partial failure in the pack's receipt JSON, and update the local docs in the same branch.

No continuous or two-way sync exists. Say "aligned as of `<date/sha>`", never "in sync".
