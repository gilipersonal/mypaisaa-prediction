"""Check selection and evidence reuse, using synthetic paths and temporary repositories."""

import fnmatch
import importlib.util
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "review_checks.py"
SPEC = importlib.util.spec_from_file_location("review_checks", SCRIPT)
checks = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = checks  # dataclasses resolve their module through sys.modules
SPEC.loader.exec_module(checks)


def names(paths):
    chosen, unmapped = checks.select(paths)
    return {c.name for c in chosen}, unmapped


class SelectionTests(unittest.TestCase):
    def test_backend_change_selects_backend_only(self):
        chosen, unmapped = names(["backend/app/main.py"])
        self.assertEqual(chosen, {"backend"})
        self.assertEqual(unmapped, [])

    def test_ledger_tooling_change_selects_runner_tests_and_python_errors(self):
        chosen, _ = names(["scripts/review_regress.py"])
        self.assertEqual(chosen, {"review-runner", "python-errors"})

    def test_spec_change_selects_its_pack_validator(self):
        chosen, _ = names(["docs/planning/foundation-specifications-2026-11-02/costs/model.json"])
        self.assertEqual(chosen, {"foundation-pack"})
        chosen, _ = names(["docs/planning/ma-reconciliation-2026-11-02/gap-register.json"])
        self.assertEqual(chosen, {"reconciliation-pack"})

    def test_policy_journal_selects_foundation_pack(self):
        chosen, _ = names(["docs/planning/foundation-policy-discussion-2026-11-02.md"])
        self.assertEqual(chosen, {"foundation-pack"})

    def test_claude_rules_select_their_policy_test(self):
        chosen, _ = names([".claude/rules/independent-review.md"])
        self.assertEqual(chosen, {"claude-workflow"})

    def test_plain_docs_need_no_extra_check(self):
        self.assertEqual(names(["docs/architecture.md", "review/MP-20/round-1.md"]), (set(), []))

    def test_unknown_path_is_reported_not_ignored(self):
        _, unmapped = names(["infra/terraform/main.tf", "mobile/native-ios/App.swift"])
        self.assertEqual(unmapped, ["infra/terraform/main.tf", "mobile/native-ios/App.swift"])

    def test_site_build_and_preview_stay_in_one_ordered_check(self):
        site = next(c for c in checks.CHECKS if c.name == "site")
        flat = [" ".join(step) for step in site.steps]
        self.assertLess(next(i for i, s in enumerate(flat) if "run build" in s),
                        next(i for i, s in enumerate(flat) if "test_site_preview" in s))
        self.assertEqual(site.tier, "broader")

    def test_every_tracked_test_file_is_covered_by_some_check(self):
        tests = sorted(p.name for p in (ROOT / "tests").glob("test_*.py"))
        covered = [t for t in tests
                   if any(fnmatch.fnmatchcase(f"tests/{t}", pattern)
                          for c in checks.CHECKS for pattern in c.paths if pattern != "tests/*")]
        self.assertEqual(covered, tests, "a test file has no check that runs it")


class FingerprintTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        subprocess.run(["git", "init", "-q"], cwd=self.root, check=True)
        (self.root / "backend").mkdir()
        (self.root / "backend" / "a.py").write_text("x = 1\n", encoding="utf-8")
        (self.root / "README.md").write_text("readme\n", encoding="utf-8")
        self.check = next(c for c in checks.CHECKS if c.name == "backend")

    def tearDown(self):
        self.temporary.cleanup()

    def test_unrelated_change_keeps_fingerprint(self):
        before = checks.fingerprint(self.root, self.check)
        (self.root / "README.md").write_text("changed\n", encoding="utf-8")
        self.assertEqual(before, checks.fingerprint(self.root, self.check))

    def test_input_change_or_new_file_invalidates_reuse(self):
        before = checks.fingerprint(self.root, self.check)
        (self.root / "backend" / "a.py").write_text("x = 2\n", encoding="utf-8")
        edited = checks.fingerprint(self.root, self.check)
        self.assertNotEqual(before, edited)
        (self.root / "backend" / "b.py").write_text("", encoding="utf-8")
        self.assertNotEqual(edited, checks.fingerprint(self.root, self.check))

    def test_missing_tool_is_unavailable_not_pass(self):
        check = checks.Check("ghost", ("x/*",), (("true",),), tools=("no-such-tool-mp",))
        self.assertEqual(checks.run_check(self.root, check)["status"], "UNAVAILABLE")

    def test_failing_step_is_fail_and_stops_later_steps(self):
        marker = self.root / "ran"
        check = checks.Check("two", ("x/*",), (("false",), ("touch", str(marker))))
        self.assertEqual(checks.run_check(self.root, check)["status"], "FAIL")
        self.assertFalse(marker.exists())


if __name__ == "__main__":
    unittest.main()
