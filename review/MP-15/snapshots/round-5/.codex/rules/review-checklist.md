# Lessons for Codex reviews

- Verify that untracked work has a runnable regression ledger without inventing a Jira key.
- Separate outstanding manual verification from a passed or malformed automated check; record independent verifier evidence before the next round.
- Test timeout handling against subprocesses, not only the direct command. Detached processes require separate handling.
- Treat broken ledger symlinks and missing referenced files as errors, not empty review histories.
- A matching nonzero exit code alone does not prove a specific refusal; test its reason or observable behaviour.
- State when project hooks still require trust and never treat an advisory hook as an enforced approval boundary.
- Fixed checks must cover both the automated check and any required human-verification policy. Test that removing the policy makes the check fail.
- Inspect ledger parent directories as well as the ledger file before reporting that no ledger exists.
- An inaccessible ledger is an error, not an absent ledger; protect this with permission tests.
- Record the exact gate and regression results before each review round, including unavailable checks.
- Check that manual verification covers every outstanding item before each review round, not just a subset.
- Ask for fresh user approval before each review round; a previous yes does not cover the next round.
- Validate that recorded gate results contain meaningful nonempty text, not merely a nonempty list.
- Mutation-test policy checks against wording that narrows a per-round requirement to only some rounds.
- Mutate by removing entire review rounds, and put contradictory qualifiers before as well as inside policy text.
- Compare state history with separately preserved snapshots and fixed-finding IDs; document that local files alone are not tamper-proof.
- Keep manual-verification policy structured, and mutation-test qualifiers placed in the preceding paragraph as well as the same paragraph.
- Test qualifiers before a policy heading as well as inside its section; a document digest detects any edit but does not establish its meaning.

- Verify native provider quote units separately from trading/settlement currency; an internally consistent synthetic fixture can still use the wrong scale.
- Runtime data validators must retain their checks under Python optimisation; test the specific corruption refusal with `-O` and `PYTHONOPTIMIZE=1`.
- Validate every daily history row against its recorded session and close, including dates outside recent intraday coverage.
- When owner deletion covers backups, include a restore-after-deletion acceptance case so recovery cannot resurrect deleted sensitive content.
- When audit-chain health is required, include synthetic missing/altered-event detection evidence, not only a successful upload/change timeline.
- In option-based decision packs, shared details must not silently enforce one option's sequence or policy on the alternatives.
- When a later owner instruction defers real inputs or a fixture is completed, update earlier immediate-step summaries and copied JSON/HTML limitations so readers do not restart deferred or finished work.
- Existing Confluence notice updates need stable observable owned markers, duplicate/ambiguous-range refusal and safe no-op/replacement after a fresh draft read. Test repeated application, server-like HTML normalization and byte-preservation of outside macros/media; include evidence footers on bounded updates as well as new pages.
