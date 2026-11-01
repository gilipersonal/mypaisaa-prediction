# Review ledger format

The independent review keeps `review/MP-<number>/fixed.json` as an array of entries. Each has a stable `id`, a `finding`, and a `check`. Prefer behavioural command tests over searching code text. The runner only accepts argument arrays, runs from the project root without a shell, and limits each command to 60 seconds. Review every command before executing: an argv array is not a security sandbox.

```json
[
  {"id": "R1-1", "finding": "A specific observable regression", "check": {"type": "command", "argv": ["python3", "-m", "unittest", "tests.test_example"], "timeout_seconds": 30}},
  {"id": "R1-2", "finding": "A documentation requirement", "check": {"type": "file", "file": "docs/architecture.md", "pattern": "^# Architecture", "present": true}},
  {"id": "R1-3", "finding": "A visual requirement", "check": {"type": "manual", "what": "Review the approved screen at phone width"}}
]
```

`command_fails` accepts argv/timeout fields and requires an explicit non-zero `expected_exit_codes` array. The same code can describe different failures, so use a behavioural test that checks the failure reason rather than relying on an exit code alone. `command` defaults to `[0]` and may also provide explicit expected exit codes. File paths must resolve inside the project, including symlinks. Missing files, malformed checks, command timeouts, and unknown check types are not passes. Each command runs in a separate process group; the runner kills and reaps it on timeout. Checks must not deliberately detach their children.

The runner returns exit 3 when only manual checks remain, 1 for failing checks, 2 for malformed or unavailable checks, and 0 when automated checks pass or no ledger exists.

Before each review round, a fresh independent verifier must inspect every outstanding manual item and record the finding ID, evidence, verifier and result in the review state. If any item cannot be verified, stop; never treat exit 3 as an automated pass.

The reviewer gets that evidence and the fixed list. A missing ledger reports that no checks ran; it is not a clean-review result. The `--approved` flag is an acknowledgement, not a technical proof of approval.

For work without a Jira issue, use `python3 scripts/review_regress.py LOCAL --approved`, which reads `review/fixed.json`, and record state in `review/state.json`. For an MP issue use `review/MP-<number>/fixed.json` and `review/MP-<number>/state.json`. Record round number, reviewed commit or reproducible snapshot, scope, findings, manual evidence and gate results. Maintain `round_count` alongside contiguous, numbered round entries so deleting an entry is detected by the review-state test. Protect private evidence and avoid storing secrets.
