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
