"""Exercise the runner against synthetic ledgers, never a real review."""

import contextlib
import copy
import importlib.util
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "review_regress.py"
SPEC = importlib.util.spec_from_file_location("review_regress", SCRIPT)
runner = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(runner)


class ReviewRunnerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root / "review" / "MP-1").mkdir(parents=True)
        self.ledger = self.root / "review" / "MP-1" / "fixed.json"

    def run_ledger(self, entries):
        self.ledger.write_text(json.dumps(entries), encoding="utf-8")
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            return runner.run(self.root, "MP-1")

    def test_passing_and_failed_commands(self):
        entry = {"id": "one", "check": {"type": "command", "argv": [sys.executable, "-c", "pass"]}}
        self.assertEqual(self.run_ledger([entry]), 0)
        entry["check"]["argv"][-1] = "raise SystemExit(3)"
        self.assertEqual(self.run_ledger([entry]), 1)
        entry["check"]["type"] = "command_fails"
        entry["check"]["expected_exit_codes"] = [3]
        self.assertEqual(self.run_ledger([entry]), 0)
        entry["check"]["expected_exit_codes"] = [4]
        self.assertEqual(self.run_ledger([entry]), 1)

    def test_manual_is_outstanding_not_passed(self):
        self.assertEqual(self.run_ledger([{"id": "one", "check": {"type": "manual", "what": "Inspect"}}]), 3)

    def test_manual_verification_policy_is_preserved(self):
        root = SCRIPT.parent.parent
        skill = (root / ".agents/skills/mp-independent-review/SKILL.md").read_text(encoding="utf-8")
        ledger = (root / ".codex/rules/review-ledger.md").read_text(encoding="utf-8")
        policy_data = json.loads((root / ".codex/review-policy.json").read_text(encoding="utf-8"))
        expected = {"manual_verification": {"frequency": "every_round", "scope": "all_outstanding",
                    "verifier": "fresh_independent", "if_unverified": "stop",
                    "evidence_fields": ["finding_id", "evidence", "verifier", "result"]}}
        policy = ("Follow `.codex/review-policy.json`: before each review round, a fresh independent "
                  "verifier must inspect every outstanding manual item and record the finding ID, "
                  "evidence, verifier and result in the review state. If any item cannot be verified, "
                  "stop; never treat exit 3 as an automated pass.")
        def protected(skill_text, ledger_text, data):
            def section(text):
                parts = text.split("## Manual verification gate\n", 1)
                return parts[1].split("\n## ", 1)[0].strip() if len(parts) == 2 else ""
            return data == expected and section(skill_text) == policy and section(ledger_text) == policy
        self.assertTrue(protected(skill, ledger, policy_data))
        self.assertFalse(protected(skill.replace(policy, "Only for the first review round: " + policy), ledger, policy_data))
        self.assertFalse(protected(skill, ledger.replace(policy, "Only for the first review round: " + policy), policy_data))
        self.assertFalse(protected(skill.replace(policy, "Only for the first review round:\n\n" + policy), ledger, policy_data))
        self.assertFalse(protected(skill, ledger.replace(policy, "Only for the first review round:\n\n" + policy), policy_data))
        altered = copy.deepcopy(policy_data)
        altered["manual_verification"]["frequency"] = "first_round"
        self.assertFalse(protected(skill, ledger, altered))

    def test_missing_file_and_path_escape_fail(self):
        for name in ("missing.txt", "../outside.txt"):
            with self.subTest(name=name):
                entry = {"id": "one", "check": {"type": "file", "file": name, "pattern": "x"}}
                self.assertEqual(self.run_ledger([entry]), 2)

    def test_file_presence_and_absence(self):
        (self.root / "example.txt").write_text("hello world", encoding="utf-8")
        entry = {"id": "one", "check": {"type": "file", "file": "example.txt", "pattern": "world"}}
        self.assertEqual(self.run_ledger([entry]), 0)
        entry["check"]["present"] = False
        self.assertEqual(self.run_ledger([entry]), 1)

    def test_rejects_shell_strings_and_invalid_issue(self):
        entry = {"id": "one", "check": {"type": "command", "argv": "echo unsafe"}}
        self.assertEqual(self.run_ledger([entry]), 2)
        with contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(runner.run(self.root, "../MP-1"), 2)

    def test_cli_requires_approval_flag(self):
        result = subprocess.run([sys.executable, str(SCRIPT), "MP-1"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 2)
        self.assertIn("approval is required", result.stderr)

    def test_timeout_is_not_a_pass(self):
        entry = {"id": "one", "check": {"type": "command", "argv": [sys.executable, "-c", "import time; time.sleep(2)"], "timeout_seconds": 1}}
        self.assertEqual(self.run_ledger([entry]), 2)

    def test_local_review_uses_shared_ledger_and_broken_symlink_is_an_error(self):
        local = self.root / "review" / "fixed.json"
        local.write_text(json.dumps([{"id": "local", "check": {"type": "manual", "what": "Inspect"}}]), encoding="utf-8")
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(runner.run(self.root, "LOCAL"), 3)
        local.unlink()
        local.symlink_to(self.root / "missing.json")
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(runner.run(self.root, "LOCAL"), 2)

    def test_timeout_stops_child_process(self):
        marker = self.root / "child-survived"
        child = "import time,pathlib;time.sleep(1.8);pathlib.Path(" + repr(str(marker)) + ").touch()"
        parent = "import subprocess,sys,time;subprocess.Popen([sys.executable,'-c'," + repr(child) + "]);time.sleep(10)"
        entry = {"id": "one", "check": {"type": "command", "argv": [sys.executable, "-c", parent], "timeout_seconds": 1}}
        self.assertEqual(self.run_ledger([entry]), 2)
        time.sleep(1.1)
        self.assertFalse(marker.exists(), "a timed-out child continued running")

    def test_broken_parent_symlinks_are_errors_for_local_and_issue_ledgers(self):
        (self.root / "review" / "MP-1").rmdir()
        (self.root / "review" / "MP-1").symlink_to(self.root / "missing-issue")
        with contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(runner.run(self.root, "MP-1"), 2)
        (self.root / "review" / "MP-1").unlink()
        (self.root / "review").rmdir()
        (self.root / "review").symlink_to(self.root / "missing-review")
        with contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(runner.run(self.root, "LOCAL"), 2)

    def test_inaccessible_ledger_is_error_for_local_and_issue(self):
        if os.geteuid() == 0:
            self.skipTest("root can bypass directory permissions")
        review = self.root / "review"
        (review / "fixed.json").write_text("[]", encoding="utf-8")
        self.ledger.write_text("[]", encoding="utf-8")
        review.chmod(0)
        try:
            with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(runner.run(self.root, "LOCAL"), 2)
                self.assertEqual(runner.run(self.root, "MP-1"), 2)
        finally:
            review.chmod(0o700)

    def test_review_state_records_gates_for_every_round(self):
        root = SCRIPT.parent.parent
        state = json.loads((root / "review/state.json").read_text(encoding="utf-8"))
        fixed = json.loads((root / "review/fixed.json").read_text(encoding="utf-8"))
        snapshots = {int(match.group(1)) for path in (root / "review/snapshots").iterdir()
                     if path.is_dir() and (match := re.fullmatch(r"round-([1-9][0-9]*)", path.name))}
        fixed_rounds = {int(match.group(1)) for item in fixed
                        if (match := re.match(r"R([1-9][0-9]*)-", item["id"]))}
        def has_gates(value, snapshot_rounds, finding_rounds):
            rounds = value.get("rounds")
            count = value.get("round_count")
            return (isinstance(count, int) and not isinstance(count, bool) and count > 0
                    and isinstance(rounds, list) and len(rounds) == count
                    and [item.get("round") for item in rounds] == list(range(1, count + 1))
                    and snapshot_rounds == set(range(1, count + 1))
                    and finding_rounds.issubset(snapshot_rounds)
                    and all(
                isinstance(item.get("gate_results"), list) and item["gate_results"]
                and all(isinstance(result, str) and result.strip() for result in item["gate_results"])
                for item in rounds
            ))
        self.assertTrue(has_gates(state, snapshots, fixed_rounds))
        for entry in state["rounds"]:
            original = entry.pop("gate_results")
            self.assertFalse(has_gates(state, snapshots, fixed_rounds))
            entry["gate_results"] = original
            for invalid in ([None], [""], ["   "]):
                entry["gate_results"] = invalid
                self.assertFalse(has_gates(state, snapshots, fixed_rounds))
            entry["gate_results"] = original
        for index in range(len(state["rounds"])):
            reduced = dict(state, rounds=state["rounds"][:index] + state["rounds"][index + 1:])
            self.assertFalse(has_gates(reduced, snapshots, fixed_rounds), f"missing round {index + 1} must fail")
        truncated = dict(state, round_count=state["round_count"] - 1, rounds=state["rounds"][:-1])
        self.assertFalse(has_gates(truncated, snapshots, fixed_rounds))


if __name__ == "__main__":
    unittest.main()
