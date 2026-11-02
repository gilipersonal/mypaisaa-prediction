"""Keep Claude's MP review rule and skills asking before every round."""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RULE = ROOT / ".claude/rules/independent-review.md"
REVIEW = ROOT / ".claude/skills/mp-independent-review/SKILL.md"
REGRESSION = ROOT / ".claude/skills/mp-review-regression/SKILL.md"


def text(path):
    return re.sub(r"\s+", " ", path.read_text(encoding="utf-8"))


class ClaudeReviewPolicyTests(unittest.TestCase):
    def test_rule_limits_each_yes_to_one_round(self):
        rule = text(RULE)
        self.assertIn("round 1 and its named regression run only", rule)
        self.assertIn("ask again before the next round", rule)
        self.assertNotRegex(rule, r"(?i)without asking again|without further instruction|"
                                  r"covers (up to )?five rounds")

    def test_review_skill_asks_every_round_and_runs_gates_first(self):
        skill = text(REVIEW)
        self.assertIn("one yes covers one round", skill)
        self.assertIn("Ask again before every later round", skill)
        for command in ("scripts/review_checks.py", "scripts/review_regress.py MP-<n> --approved"):
            self.assertIn(command, skill)
        self.assertIn("Fix any failure before reviewers start", skill)
        self.assertIn("in a single message", skill)
        self.assertIn("Never pass maker notes or reasoning", skill)

    def test_review_skill_keeps_delta_scope_and_cap(self):
        skill = text(REVIEW)
        self.assertIn("unchanged lanes sit out", skill)
        self.assertIn("The whole ledger runs every round", skill)
        self.assertIn("After round five, stop", skill)

    def test_regression_skill_needs_its_own_yes_and_reads_exit_codes(self):
        skill = text(REGRESSION)
        self.assertIn("needs its own yes", skill)
        self.assertIn("Never silently skip an entry", skill)
        for code in ("`0`", "`1`", "`2`", "`3`"):
            self.assertIn(code, skill)

    def test_jira_rule_points_at_per_round_consent(self):
        jira = text(ROOT / ".claude/rules/jira-flow.md")
        self.assertIn("ask again before every later round", jira)
        self.assertNotIn("without further instruction", jira)

    def test_codex_pinned_documents_are_untouched_by_claude_adaptation(self):
        # The Claude skills sit beside, not in place of, the digest-pinned Codex files.
        pinned = (".agents/skills/mp-independent-review/SKILL.md", ".codex/rules/review-ledger.md")
        for path in pinned:
            self.assertTrue((ROOT / path).is_file())


if __name__ == "__main__":
    unittest.main()
