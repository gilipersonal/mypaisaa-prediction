"""The agent-config check, on synthetic repository trees and on this repository."""

import importlib.util
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "check_agent_config.py"
SPEC = importlib.util.spec_from_file_location("check_agent_config", SCRIPT)
config = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = config
SPEC.loader.exec_module(config)

VERIFY = """name: CI
jobs:
  backend:
    name: Backend
    steps:
      - name: Test backend
"""
JIRA = """name: Jira key
jobs:
  key:
    name: Jira traceability
"""


class AgentConfigTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.write(".claude/jira-flow.json", json.dumps({"jira": {"projectKey": "MP"}}))
        self.write(".claude/skills/autoship/SKILL.md", "---\nname: autoship\ndescription: Ship it.\n---\n\nBody\n")
        self.write(".claude/rules/flow.md", "Use `.claude/jira-flow.json` and [the skill](../skills/autoship/SKILL.md).\n")
        for rel in (".codex/hooks.json", ".codex/review-policy.json", ".codex/review-document-baseline.json"):
            self.write(rel, "{}")
        self.write(".github/main-protection.json",
                   json.dumps({"required_status_checks": {"contexts": ["Backend", "Jira traceability"]}}))
        self.write(".github/workflows/verify.yml", VERIFY)
        self.write(".github/workflows/jira-key.yml", JIRA)

    def write(self, rel, text):
        path = self.root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)

    def test_consistent_tree_passes(self):
        self.assertEqual(config.check(self.root), [])

    def test_skill_name_must_match_its_folder(self):
        self.write(".claude/skills/autoship/SKILL.md", "---\nname: ship\ndescription: Ship it.\n---\n")
        self.assertIn("does not match its folder", " ".join(config.check(self.root)))

    def test_skill_needs_a_description(self):
        self.write(".claude/skills/autoship/SKILL.md", "---\nname: autoship\ndescription:\n---\n")
        self.assertIn("description is empty", " ".join(config.check(self.root)))

    def test_rule_naming_a_missing_file_fails(self):
        self.write(".claude/rules/flow.md", "Read `scripts/gone.py` first.\n")
        self.assertIn("scripts/gone.py", " ".join(config.check(self.root)))

    def test_rule_with_a_broken_link_fails(self):
        self.write(".claude/rules/flow.md", "See [the skill](../skills/missing/SKILL.md).\n")
        self.assertIn("broken link", " ".join(config.check(self.root)))

    def test_invalid_codex_json_fails(self):
        self.write(".codex/hooks.json", "{not json")
        self.assertIn(".codex/hooks.json: invalid JSON", " ".join(config.check(self.root)))

    def test_protection_must_name_exactly_the_workflow_jobs(self):
        self.write(".github/main-protection.json",
                   json.dumps({"required_status_checks": {"contexts": ["Backend", "Codex tooling"]}}))
        self.assertIn("but the workflows define", " ".join(config.check(self.root)))

    def test_step_names_are_not_mistaken_for_jobs(self):
        self.assertNotIn("Test backend", " ".join(config.check(self.root)))

    def test_this_repository_passes(self):
        self.assertEqual(config.check(ROOT), [])


if __name__ == "__main__":
    unittest.main()
