# Navigation integration proposal

**Prepared only · PR #9 checkpoint preserved**

After the checkpoint dependency is reconciled, add one Foundation Pack 1 entry to the current root README reading table, and one source/status link each in `docs/architecture.md`, `docs/tech-stack.md` and `docs/implementation-plan.md`. The entry points to `docs/planning/foundation-specifications-2026-11-02/README.md` and states that contracts/cost/eligibility remain proposed and no UX/build approval follows.

Do not apply this against the historical root documents while PR #9 remains open: its pending navigation and authority changes must be preserved. This pack references that exact source commit and provides its own self-contained index. The new branch adds no conflicting edits to those root files.

For Confluence, recheck actual MP parents, space instructions, current content and exact-title collisions before any separately approved five-page publication. No existing planning page, source diagram or rich macro is overwritten by preparing this proposal. Publication and any bounded index insertion require their exact scope approval; a new PR also needs current consent.

A future CI integration should run this pack's pinned JSON Schema/document checker in the existing tooling job without adding application runtime dependencies. A fresh shallow checkout must explicitly obtain the pinned PR #9 reference Git object (or run after that dependency is merged); the offline checker deliberately makes no network fetch. Keep source-verification failures visible. This is a proposed follow-up, not an applied workflow edit.
