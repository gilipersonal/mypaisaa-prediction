"""Exercise the runner against synthetic ledgers, never a real review."""

import contextlib
import importlib.util
import io
import json
import subprocess
import sys
import tempfile
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
        self.assertEqual(self.run_ledger([{"id": "one", "check": {"type": "manual", "what": "Inspect"}}]), 2)

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


if __name__ == "__main__":
    unittest.main()
