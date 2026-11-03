import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "docs/planning/story-readiness-2026-11-03/stories.py"


class StoryReadinessTests(unittest.TestCase):
    def run_script(self, *args):
        return subprocess.run([sys.executable, str(SCRIPT), *args], capture_output=True, text=True)

    def test_selftest_proves_every_refusal(self):
        r = self.run_script("selftest")
        self.assertEqual(r.returncode, 0, r.stdout)
        self.assertRegex(r.stdout, r"selftest: (\d+) of \1 cases pass")

    def test_every_story_is_ready_and_every_draft_accounted_for(self):
        r = self.run_script("check")
        self.assertEqual(r.returncode, 0, r.stdout)


if __name__ == "__main__":
    unittest.main()
