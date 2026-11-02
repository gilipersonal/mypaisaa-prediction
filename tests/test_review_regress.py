"""Exercise the runner against synthetic ledgers, never a real review."""

import contextlib
import copy
import hashlib
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
        baseline = json.loads((root / ".codex/review-document-baseline.json").read_text(encoding="utf-8"))
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
            actual = {"skill_sha256": hashlib.sha256(skill_text.encode("utf-8")).hexdigest(),
                      "ledger_sha256": hashlib.sha256(ledger_text.encode("utf-8")).hexdigest()}
            return (data == expected and actual == baseline
                    and section(skill_text) == policy and section(ledger_text) == policy)
        self.assertTrue(protected(skill, ledger, policy_data))
        self.assertFalse(protected(skill.replace(policy, "Only for the first review round: " + policy), ledger, policy_data))
        self.assertFalse(protected(skill, ledger.replace(policy, "Only for the first review round: " + policy), policy_data))
        self.assertFalse(protected(skill.replace(policy, "Only for the first review round:\n\n" + policy), ledger, policy_data))
        self.assertFalse(protected(skill, ledger.replace(policy, "Only for the first review round:\n\n" + policy), policy_data))
        heading = "## Manual verification gate"
        qualifier = "The following manual verification gate applies only to the first review round.\n\n"
        self.assertFalse(protected(skill.replace(heading, qualifier + heading), ledger, policy_data))
        self.assertFalse(protected(skill, ledger.replace(heading, qualifier + heading), policy_data))
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


class PortedRunnerTests(unittest.TestCase):
    """MP-35: mypaisa-agent's formats and modes (--selftest, --every, --state) on synthetic ledgers."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.review = self.root / "review"

    def write(self, key, entries=None, state=None):
        folder = self.review if key == "LOCAL" else self.review / key
        folder.mkdir(parents=True, exist_ok=True)
        if entries is not None:
            (folder / "fixed.json").write_text(json.dumps(entries), encoding="utf-8")
        if state is not None:
            (folder / "state.json").write_text(json.dumps(state), encoding="utf-8")

    def cli(self, *args):
        env = dict(os.environ, REVIEW_REGRESS_DIR=str(self.review))
        return subprocess.run([sys.executable, str(SCRIPT), *args], capture_output=True, text=True, env=env,
                              timeout=180)

    def run_ma(self, entries):
        self.write("MP-1", entries)
        with contextlib.redirect_stdout(io.StringIO()) as out, contextlib.redirect_stderr(io.StringIO()):
            code = runner.run(self.root, "MP-1")
        return code, out.getvalue()

    def test_selftest_passes(self):
        result = self.cli("--selftest")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("0 wrong", result.stdout)

    def test_ma_cmd_and_cmd_fails(self):
        ok = {"id": "r1-1", "finding": "f", "check": {"type": "cmd", "run": "exit 0"}}
        self.assertEqual(self.run_ma([ok])[0], 0)
        self.assertEqual(self.run_ma([dict(ok, check={"type": "cmd", "run": "exit 4"})])[0], 1)
        self.assertEqual(self.run_ma([dict(ok, check={"type": "cmd_fails", "argv": ["false"]})])[0], 0)
        self.assertEqual(self.run_ma([dict(ok, check={"type": "cmd_fails", "argv": ["true"]})])[0], 1)
        self.assertEqual(self.run_ma([dict(ok, check={"type": "cmd", "run": "true", "argv": ["true"]})])[0], 2)
        self.assertEqual(self.run_ma([{"id": "r1-1", "check": {"type": "cmd", "run": "true"}}])[0], 2)

    def test_ma_grep_across_lines_globs_and_missing(self):
        (self.root / "docs").mkdir()
        (self.root / "docs" / "a.md").write_text("Ask every\nround", encoding="utf-8")
        (self.root / "docs" / "b.md").write_text("ask EVERY round", encoding="utf-8")
        grep = {"type": "grep", "files": ["docs/*.md"], "pattern": r"ask\s+every\s+round", "ignore_case": True}
        self.assertEqual(self.run_ma([{"id": "r1-1", "finding": "f", "check": grep}])[0], 0)
        self.assertEqual(self.run_ma([{"id": "r1-1", "finding": "f", "check": dict(grep, ignore_case=False)}])[0], 1)
        self.assertEqual(self.run_ma([{"id": "r1-1", "finding": "f", "check": dict(grep, present=False)}])[0], 1)
        missing = {"type": "grep", "files": ["docs/*.txt"], "pattern": "x"}
        self.assertEqual(self.run_ma([{"id": "r1-1", "finding": "f", "check": missing}])[0], 1)

    def test_retired_entry_is_skipped_and_counted(self):
        marker = self.root / "ran"
        code, out = self.run_ma([{"id": "r1-1", "finding": "f", "retired": "target removed in MP-34",
                                  "check": {"type": "cmd", "run": f"touch {marker}"}}])
        self.assertEqual(code, 0)
        self.assertFalse(marker.exists())
        self.assertIn("RETIRED: r1-1 - target removed in MP-34", out)
        self.assertIn("1 retired", out)

    def test_every_runs_all_ledgers_without_approval(self):
        self.write("LOCAL", [{"id": "R1-1", "check": {"type": "command", "argv": [sys.executable, "-c", "pass"]}}])
        self.write("MP-2", [{"id": "r1-1", "finding": "f", "check": {"type": "cmd", "run": "true"}}])
        self.write("MP-3", [{"id": "R1-1", "check": {"type": "manual", "what": "Inspect"}}])
        result = self.cli("--every", "--jobs", "2")
        self.assertEqual(result.returncode, 3, result.stdout + result.stderr)
        for key in ("== LOCAL", "== MP-2", "== MP-3", "every ledger (3)"):
            self.assertIn(key, result.stdout)
        self.write("MP-2", [{"id": "r1-1", "finding": "f", "check": {"type": "cmd", "run": "false"}}])
        self.assertEqual(self.cli("--every").returncode, 1)
        self.write("MP-2", [{"id": "r1-1", "finding": "f", "check": {"type": "command", "argv": "false"}}])
        self.assertEqual(self.cli("--every").returncode, 2)

    def test_single_ledger_still_needs_approval(self):
        self.write("MP-2", [{"id": "r1-1", "finding": "f", "check": {"type": "cmd", "run": "true"}}])
        self.assertEqual(self.cli("MP-2").returncode, 2)
        self.assertEqual(self.cli("MP-2", "--approved").returncode, 0)
        self.assertEqual(self.cli("--every", "--approved").returncode, 0)

    def test_state_validates_both_shapes(self):
        mp = {"round_count": 1, "rounds": [{"round": 1, "reviewed_commit": "abcdef1", "gate_results": ["ok"]}]}
        ma = {"rounds": 1, "reviewed_sha": "abcdef1", "history": [{"round": 1, "reviewed_sha": "abcdef1"}]}
        for key, state in (("MP-4", mp), ("MP-5", ma), ("LOCAL", mp)):
            with self.subTest(key=key):
                self.write(key, [{"id": "R1-1", "finding": "f", "check": {"type": "manual", "what": "w"}}], state)
                self.assertEqual(self.cli("--state", key).returncode, 0)
        self.write("MP-6", [], dict(mp, round_count=2))
        self.assertEqual(self.cli("--state", "MP-6").returncode, 1)
        self.write("MP-7", [{"id": "R2-1", "finding": "f", "check": {"type": "manual", "what": "w"}}], mp)
        self.assertEqual(self.cli("--state", "MP-7").returncode, 1)
        self.write("MP-8", [], {"round_count": 1, "rounds": [{"round": 1, "manual_verification": [{"finding_id": "x"}],
                                                              "reviewed_commit": "abcdef1"}]})
        self.assertEqual(self.cli("--state", "MP-8").returncode, 1)
        self.assertEqual(self.cli("--state", "../MP-1").returncode, 2)

    def test_repository_state_files_are_valid(self):
        review = SCRIPT.parent.parent / "review"
        keys = ["LOCAL"] + sorted(p.parent.name for p in review.glob("*/state.json"))
        for key in keys:
            with self.subTest(key=key):
                with contextlib.redirect_stdout(io.StringIO()) as out:
                    self.assertEqual(runner.run_state(SCRIPT.parent.parent, key), 0, out.getvalue())


if __name__ == "__main__":
    unittest.main()
