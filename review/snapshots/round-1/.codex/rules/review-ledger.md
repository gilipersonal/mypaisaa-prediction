# Review ledger format

The independent review keeps `review/MP-<number>/fixed.json` as an array of entries. Each has a stable `id`, a `finding`, and a `check`. Prefer behavioural command tests over searching code text. The runner only accepts argument arrays, runs from the project root without a shell, and limits each command to 60 seconds. Review every command before executing: an argv array is not a security sandbox.

```json
[
  {"id": "R1-1", "finding": "A specific observable regression", "check": {"type": "command", "argv": ["python3", "-m", "unittest", "tests.test_example"], "timeout_seconds": 30}},
  {"id": "R1-2", "finding": "A documentation requirement", "check": {"type": "file", "file": "docs/architecture.md", "pattern": "^# Architecture", "present": true}},
  {"id": "R1-3", "finding": "A visual requirement", "check": {"type": "manual", "what": "Review the approved screen at phone width"}}
]
```

`command_fails` accepts argv/timeout fields and requires an explicit non-zero `expected_exit_codes` array so an unrelated error does not count as a pass. `command` defaults to `[0]` and may also provide explicit expected exit codes. File paths must resolve inside the project, including symlinks. Missing files, malformed checks, command timeouts, and unknown check types are not passes. Manual checks return exit 2 until reviewed separately; failed checks return 1; malformed/unavailable checks return 2. A missing ledger reports that no checks ran and returns 0 so a first review can begin; it is not a clean-review result. The `--approved` flag is an acknowledgement, not a technical proof of approval.

Record round number, reviewed commit or reproducible snapshot, scope, findings and gate results in `review/MP-<number>/state.json`. Protect private evidence and avoid storing secrets.
