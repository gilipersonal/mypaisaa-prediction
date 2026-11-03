"""Keep Claude's six MP workflow skills present, routed and holding their consent gates."""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ("autoship", "mp-independent-review", "mp-review-regression", "mp-plan-sync",
          "mp-design-first", "mp-architecture-diagrams")


def text(path):
    return re.sub(r"\s+", " ", (ROOT / path).read_text(encoding="utf-8"))


def skill(name):
    return text(f".claude/skills/{name}/SKILL.md")


class ClaudeWorkflowSkillTests(unittest.TestCase):
    def test_every_codex_skill_has_a_named_claude_counterpart(self):
        codex = sorted(p.parent.name for p in (ROOT / ".agents/skills").glob("*/SKILL.md"))
        self.assertEqual(codex, sorted(SKILLS))
        for name in SKILLS:
            body = (ROOT / f".claude/skills/{name}/SKILL.md").read_text(encoding="utf-8")
            front = re.match(r"---\nname: (\S+)\ndescription: (.+?)\n---\n", body, re.S)
            self.assertIsNotNone(front, name)
            self.assertEqual(front[1], name)
            self.assertIn(f".agents/skills/{name}/SKILL.md", body, name)

    def test_routing_rule_lists_every_skill(self):
        routing = text(".claude/rules/mp-workflow.md")
        for name in SKILLS:
            self.assertIn(f"`{name}`", routing)
        self.assertIn("At most five agents run at once", routing)

    def test_autoship_acts_only_on_the_running_prompt_and_guards_the_head(self):
        body = skill("autoship")
        self.assertIn("unless the prompt that is running asks for it", body)
        self.assertIn("--match-head-commit <sha>", body)
        self.assertIn("never turn on auto-merge", body)
        self.assertIn("git merge --ff-only origin/main", body)
        self.assertIn("Never reset, stash or force anything", body)
        self.assertIn("--run --all", body)
        self.assertNotIn("wrapper", body.lower())

    def test_plan_sync_defaults_to_read_only_and_scopes_writes(self):
        body = skill("mp-plan-sync")
        self.assertIn("`Check only` (recommended)", body)
        self.assertIn("A check-only yes is read-only", body)
        self.assertIn("Each external write scope", body)
        self.assertIn("never close an issue", body)
        self.assertIn('never "in sync"', body)

    def test_design_first_waits_for_both_gates_and_syncs_to_claude_artifacts(self):
        # Owner, 3 Nov 2026: designs are made locally and synced to Claude HTML artifacts (design-sync.md).
        body = skill("mp-design-first")
        self.assertIn("UX starts only after the owner signs off", body)
        self.assertIn("explicit permission to implement", body)
        self.assertIn("Sync the round to **Claude HTML artifacts**", body)
        self.assertIn("scripts/design_sync.py record", body)
        self.assertNotIn("**ChatGPT Sites**, not Claude artifacts", body)
        self.assertIn("No trading actions", body)

    def test_architecture_diagrams_use_lucid_and_never_imply_deployment(self):
        body = skill("mp-architecture-diagrams")
        self.assertIn("lucid://skills/readme", body)
        self.assertIn("02218133-613a-4b78-aea4-e0dba26db386", body)
        self.assertIn("never claim live sync", body)
        self.assertIn("A diagram never approves architecture, deployment or spend", body)


if __name__ == "__main__":
    unittest.main()
