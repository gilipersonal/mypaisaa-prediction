import importlib.util
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location(
    "check_pr", Path(__file__).resolve().parents[1] / "scripts/check_pr.py"
)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class PrPolicyTests(unittest.TestCase):
    def test_valid_issue_branch_and_title(self):
        self.assertEqual([], MODULE.validate(
            "[MP-1] Configure CI", "MP-1-codex-workflows", "main", ["MP-1: Configure CI"]
        ))

    def test_mismatched_title_key_and_wrong_base_are_rejected(self):
        for title, base in [("[MP-2] Configure CI", "main"),
                            ("[MP-1] Configure CI", "setup/bootstrap")]:
            with self.subTest(title=title, base=base):
                self.assertTrue(MODULE.validate(
                    title, "MP-1-codex-workflows", base, ["MP-1: Configure CI"]
                ))

    def test_invalid_branches_titles_and_commits_are_rejected(self):
        for title, branch, subjects in [
            ("Configure CI", "MP-1-configure-ci", ["MP-1: Configure CI"]),
            ("[MP-1] Configure CI", "main", ["MP-1: Configure CI"]),
            ("[MP-1] Configure CI", "MP-1-configure-ci", ["Configure CI"]),
            ("[MP-1] Configure CI", "MP-1-configure-ci", []),
        ]:
            with self.subTest(title=title, branch=branch, subjects=subjects):
                self.assertTrue(MODULE.validate(title, branch, "main", subjects))


if __name__ == "__main__":
    unittest.main()
