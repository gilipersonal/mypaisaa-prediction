"""Tests for the Claude Code hooks in .claude/hooks/mp_hook.py and their wiring in .claude/settings.json (MP-35)."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOOK = ROOT / ".claude" / "hooks" / "mp_hook.py"
SETTINGS = ROOT / ".claude" / "settings.json"
PR = "gh pr "  # split so this file never reads as a PR command itself


def hook(mode: str, payload: object, env: dict | None = None) -> subprocess.CompletedProcess:
    stdin = payload if isinstance(payload, str) else json.dumps(payload)
    return subprocess.run([sys.executable, "-I", str(HOOK), mode], input=stdin, capture_output=True, text=True,
                          timeout=120, env={**os.environ, **(env or {})})


class SelfTest(unittest.TestCase):
    def test_selftest_passes(self) -> None:
        result = subprocess.run([sys.executable, "-I", str(HOOK), "selftest"], capture_output=True, text=True, timeout=180)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("0 wrong", result.stdout)


class BeforePr(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = Path(self.tmp.name) / "repo"
        (self.repo / "scripts").mkdir(parents=True)
        (self.repo / "docs" / "confluence").mkdir(parents=True)
        subprocess.run(["git", "init", "-q", str(self.repo)], check=True)
        self.env = {"CLAUDE_PROJECT_DIR": str(self.repo)}

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def stage(self, review: str, confluence: str) -> None:
        (self.repo / "scripts" / "review_checks.py").write_text(review)
        (self.repo / "docs" / "confluence" / "build_pages.py").write_text(confluence)

    def test_refuses_pr_when_a_check_fails_and_names_it(self) -> None:
        self.stage("print('ok')\n", "import sys\nprint('PENDING: hub: not created')\nsys.exit(1)\n")
        result = hook("before-pr", {"tool_input": {"command": PR + "create --fill"}, "cwd": str(self.repo)}, self.env)
        self.assertEqual(result.returncode, 2)
        self.assertIn("Confluence pages", result.stderr)
        self.assertIn("PENDING: hub: not created", result.stderr)

    def test_allows_pr_when_every_check_passes(self) -> None:
        self.stage("print('ok')\n", "print('ok')\n")
        result = hook("before-pr", {"tool_input": {"command": PR + "ready 12"}, "cwd": str(self.repo)}, self.env)
        self.assertEqual((result.returncode, result.stdout, result.stderr), (0, "", ""))

    def test_ignores_commands_that_raise_no_pr(self) -> None:
        self.stage("import sys\nsys.exit(1)\n", "import sys\nsys.exit(1)\n")
        for command in (PR + "view 3", "git status", "git commit -m 'docs: " + PR + "create is gated'"):
            result = hook("before-pr", {"tool_input": {"command": command}, "cwd": str(self.repo)}, self.env)
            self.assertEqual(result.returncode, 0, command)

    def test_unreadable_input_refuses_only_a_possible_pr(self) -> None:
        self.assertEqual(hook("before-pr", "not json").returncode, 1)
        self.assertEqual(hook("before-pr", "{broken " + PR + "create").returncode, 2)


class OtherModes(unittest.TestCase):
    def test_new_work_adds_context(self) -> None:
        result = hook("new-work", {"prompt": "Let's design a new screen for prediction history"})
        self.assertEqual(result.returncode, 0)
        out = json.loads(result.stdout)["hookSpecificOutput"]
        self.assertEqual(out["hookEventName"], "UserPromptSubmit")
        self.assertIn("Jira MP issue", out["additionalContext"])
        self.assertIn("docs/confluence/build_pages.py", out["additionalContext"])

    def test_new_work_is_silent_otherwise(self) -> None:
        result = hook("new-work", {"prompt": "run the unit tests"})
        self.assertEqual((result.returncode, result.stdout), (0, ""))

    def test_after_edit_ignores_files_that_are_no_record(self) -> None:
        result = hook("after-edit", {"tool_input": {"file_path": str(ROOT / "site" / "index.html")}})
        self.assertEqual((result.returncode, result.stdout), (0, ""))

    def test_hooks_that_cannot_run_carry_on(self) -> None:
        for mode in ("after-edit", "new-work"):
            self.assertEqual(hook(mode, "not json").returncode, 1, mode)
        self.assertEqual(hook("no-such-mode", {}).returncode, 0)


class Settings(unittest.TestCase):
    def setUp(self) -> None:
        self.settings = json.loads(SETTINGS.read_text())
        self.perms = self.settings["permissions"]

    def test_shipping_acts_ask_and_main_is_protected(self) -> None:
        for rule in ("Bash(gh pr create:*)", "Bash(gh pr ready:*)", "Bash(gh pr merge:*)", "Bash(git merge:*)",
                     "mcp__github__create_pull_request", "mcp__github__merge_pull_request",
                     "mcp__atlassian__transitionJiraIssue"):
            self.assertIn(rule, self.perms["ask"])
            self.assertNotIn(rule, self.perms["allow"])
        self.assertIn("Bash(git push *--force*)", self.perms["deny"])
        self.assertIn("Bash(git push * main)", self.perms["deny"])
        self.assertFalse([r for r in self.perms["allow"] if "MA-" in r or "mypaisa-agent" in r])

    def test_hooks_run_this_script_in_each_mode(self) -> None:
        wiring = {event: entry[0]["hooks"][0]["command"] for event, entry in self.settings["hooks"].items()}
        self.assertEqual(set(wiring), {"PreToolUse", "PostToolUse", "UserPromptSubmit"})
        for event, mode in (("PreToolUse", "before-pr"), ("PostToolUse", "after-edit"), ("UserPromptSubmit", "new-work")):
            self.assertIn(".claude/hooks/mp_hook.py", wiring[event])
            self.assertTrue(wiring[event].endswith(" " + mode))


if __name__ == "__main__":
    unittest.main()
