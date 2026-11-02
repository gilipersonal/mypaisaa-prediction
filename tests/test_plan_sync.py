"""Plan sync (MP-35): the selftest proves each rule on mutated fixture repos, and this repo itself is clean."""

import contextlib
import importlib.util
import io
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("plan_sync", ROOT / "scripts" / "plan_sync.py")
plan_sync = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(plan_sync)


class PlanSyncTests(unittest.TestCase):
    def test_selftest_every_rule_fails_and_passes_when_it_should(self):
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            code = plan_sync.selftest()
        self.assertEqual(code, 0, out.getvalue())

    def test_selftest_covers_every_rule_and_the_ci_head_ref(self):
        names = " ".join(c[0] for c in plan_sync.CHECK_CASES)
        for rule in ("a:", "b:", "c:", "d:", "e:"):
            self.assertIn(rule, names)
        pr = " ".join(c[0] for c in plan_sync.PR_CASES)
        self.assertIn("GITHUB_HEAD_REF", pr)
        self.assertIn("fails closed", pr)

    def test_this_repo_is_in_step(self):
        problems = plan_sync.check(ROOT)
        self.assertEqual(problems, [], "\n".join(problems))

    def test_trace_mirrors_every_issue_once(self):
        trace = json.loads((ROOT / plan_sync.TRACE).read_text())
        self.assertEqual(trace["jql"], plan_sync.JQL)
        keys = [r["key"] for r in trace["issues"]]
        self.assertEqual(len(keys), len(set(keys)))
        self.assertEqual(keys, sorted(keys, key=plan_sync.key_order))

    def test_refresh_help_names_the_query(self):
        self.assertIn(plan_sync.JQL, plan_sync.REFRESH)
        self.assertIn(plan_sync.CLOUD_ID, plan_sync.REFRESH)


if __name__ == "__main__":
    unittest.main()
