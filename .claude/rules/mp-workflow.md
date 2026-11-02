# MP work routing (Claude)

Claude's version of `.codex/rules/workflow.md`. Codex keeps its own files in `.codex/` and `.agents/`; don't edit them as part of Claude work, because two of them are digest-pinned by tests.

| Work | Claude skill | Gate |
| --- | --- | --- |
| Finish, ship or merge an MP issue | `autoship` | Release gates; one end-of-work question; PR, merge and close only when the running prompt asks |
| Independent review | `mp-independent-review` | A yes per round (`.claude/rules/independent-review.md`) |
| Fixed-findings regression on its own | `mp-review-regression` | Its own yes naming the ledger |
| Compare or sync plans, Jira, Confluence, diagrams and code | `mp-plan-sync` | A yes to the exact scope; check-only by default; each external write scope separately |
| Web, SwiftUI, chart or interaction design | `mp-design-first` | Architecture sign-off and UX authority first; owner picks among options |
| AWS or other significant architecture diagrams | `mp-architecture-diagrams` | Lucid, native shapes, a manifest; sharing and publication separately |

Asking is always a real question. Silence, a default selection or an unrelated yes grants nothing. At most five agents run at once, including the coordinator. Run independent work in parallel within that limit.

The checks for any change come from `python3 scripts/review_checks.py --base <base> [--run]`, which maps changed paths to checks. Add a mapping there when a new kind of file appears, rather than skipping its checks.
