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
        self.assertEqual(chosen, {"foundation-pack", "baseline-signoff"})
        chosen, _ = names(["docs/planning/ma-reconciliation-2026-11-02/gap-register.json"])
        self.assertEqual(chosen, {"reconciliation-pack", "baseline-signoff", "story-readiness"})
        chosen, _ = names(["docs/planning/ma-reconciliation-2026-11-02/source-coverage.json"])
        self.assertEqual(chosen, {"reconciliation-pack"})

    def test_generators_and_root_docs_select_the_retired_facts_check(self):
        for path in ("README.md", "docs/confluence/build_pages.py", "docs/diagrams/mp-quality-2026-11-02/lucid_spec.py",
                     "docs/motion/build_motion.py", "docs/market-agent/index.html", "docs/planning/retired-facts.json"):
            self.assertIn("retired-facts", names([path])[0], path)

    def test_story_files_and_their_inputs_select_the_story_gate(self):
        for path in ("docs/planning/story-readiness-2026-11-03/stories/PH-01.json", "tests/test_story_readiness.py",
                     "docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json", "docs/planning/trace.json",
                     "docs/planning/foundation-specifications-2026-11-02/forecasting/open-decisions.json"):
            self.assertIn("story-readiness", names([path])[0], path)

    def test_designs_and_their_gate_select_the_design_gates(self):
        for path in ("docs/design/reviews/MP-62/hybrid-a/index.html", "scripts/design_gates.py",
                     "scripts/design_runtime.mjs", "tests/test_design_gates.py", "docs/design/prism/tokens.json",
                     "scripts/design_tokens.py", "tests/test_design_tokens.py"):
            self.assertIn("design-gates", names([path])[0], path)

    def test_the_signoff_builder_selects_python_errors(self):
        self.assertIn("python-errors", names(["docs/planning/baseline-signoff-2026-11-03/build_signoff.py"])[0])
        self.assertIn("python-errors", names(["docs/planning/story-readiness-2026-11-03/stories.py"])[0])

    def test_signoff_pack_and_its_inputs_select_the_signoff_check(self):
        for path in ("docs/planning/baseline-signoff-2026-11-03/README.md", "tests/test_baseline_signoff.py",
                     "docs/diagrams/mp-quality-2026-11-02/manifest.json", "docs/design/artifacts.json",
                     "docs/motion/budget.gif", ".claude/rules/plan-sync.md",
                     "docs/planning/foundation-policy-discussion-2026-11-02.md"):
            self.assertIn("baseline-signoff", names([path])[0], path)

    def test_policy_journal_selects_foundation_pack(self):
        chosen, _ = names(["docs/planning/foundation-policy-discussion-2026-11-02.md"])
        self.assertEqual(chosen, {"foundation-pack", "plan-sync", "baseline-signoff"})

    def test_claude_rules_select_their_policy_test(self):
        chosen, _ = names([".claude/rules/independent-review.md"])
        self.assertEqual(chosen, {"claude-workflow", "agent-config", "plan-sync"})

    def test_agent_config_follows_its_inputs(self):
        for path in (".codex/hooks.json", ".github/main-protection.json", "scripts/check_agent_config.py"):
            self.assertIn("agent-config", names([path])[0], path)

    def test_root_docs_brand_and_motion_select_the_docs_check(self):
        for path in ("ARCHITECTURE.md", "TECH-STACK.md"):
            self.assertEqual(names([path]), ({"readme", "plan-sync", "baseline-signoff", "retired-facts"}, []), path)
        self.assertEqual(names(["docs/brand/mark.svg"]), ({"readme"}, []))
        self.assertEqual(names(["docs/motion/budget.gif"]), ({"readme", "baseline-signoff"}, []))

    def test_new_hooks_plan_sync_and_receipts_select_their_checks(self):
        self.assertIn("claude-hooks", names([".claude/hooks/mp_hook.py"])[0])
        self.assertIn("plan-sync", names(["docs/planning/trace.json"])[0])
        self.assertIn("confluence-receipts", names(["docs/confluence/receipts/hub.json"])[0])

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


class SkipTests(unittest.TestCase):
    """--skip leaves a named check out and says so; an unknown name stops everything (MP-195)."""

    def run_script(self, *args):
        return subprocess.run([sys.executable, str(SCRIPT), "--base", "HEAD", *args],
                              capture_output=True, text=True, cwd=ROOT, timeout=60)

    def test_all_with_skip_selects_everything_but_the_walk(self):
        r = self.run_script("--all", "--skip", "design-walk")
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        lines = {l.split()[1]: l.split()[0] for l in r.stdout.splitlines() if l.startswith("  ") and len(l.split()) > 2}
        self.assertEqual(lines.get("design-walk"), "SKIP")
        others = {c.name for c in checks.CHECKS} - {"design-walk"}
        self.assertEqual({n for n, how in lines.items() if how == "SELECT"}, others)
        self.assertNotIn("DEFER", lines.values())

    def test_unknown_skip_name_runs_nothing(self):
        r = self.run_script("--all", "--skip", "design-walks", "--run")
        self.assertEqual(r.returncode, 2)
        self.assertIn("no check named design-walks", r.stdout)
        self.assertNotIn("PASS:", r.stdout)

    def test_a_skipped_check_is_never_reported_as_a_pass(self):
        # in-process, with two stand-in checks, so the test never runs the real gates (or itself)
        import contextlib, io, json
        fake = (checks.Check("kept", ("x/*",), (("true",),)), checks.Check("left", ("x/*",), (("true",),), tier="broader"))
        saved = (checks.CHECKS, checks.changed_paths, checks.whitespace, sys.argv)
        with tempfile.TemporaryDirectory() as tmp:
            record = Path(tmp) / "r.json"
            try:
                checks.CHECKS = fake
                checks.changed_paths = lambda base: ["x/a"]
                checks.whitespace = lambda base: {"status": "PASS", "detail": ""}
                sys.argv = ["review_checks.py", "--all", "--skip", "left", "--run", "--record", str(record)]
                out = io.StringIO()
                with contextlib.redirect_stdout(out):
                    code = checks.main()
            finally:
                checks.CHECKS, checks.changed_paths, checks.whitespace, sys.argv = saved
            body = json.loads(record.read_text())
        self.assertEqual(code, 0, out.getvalue())
        self.assertIn("PASS: kept", out.getvalue())
        self.assertIn("SKIPPED: left (left out with --skip; not a pass)", out.getvalue())
        self.assertNotIn("PASS: left", out.getvalue())
        self.assertNotIn("left", body["checks"])
        self.assertEqual(body["skipped"], ["left"])


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
