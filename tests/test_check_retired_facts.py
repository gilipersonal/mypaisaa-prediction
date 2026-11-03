import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/check_retired_facts.py"


class RetiredFactsTests(unittest.TestCase):
    def run_script(self, *args):
        return subprocess.run([sys.executable, str(SCRIPT), *args], capture_output=True, text=True)

    def test_selftest_proves_every_refusal(self):
        r = self.run_script("selftest")
        self.assertEqual(r.returncode, 0, r.stdout)
        self.assertRegex(r.stdout, r"selftest: (\d+) of \1 cases pass")

    def test_the_repo_states_no_retired_fact(self):
        r = self.run_script()
        self.assertEqual(r.returncode, 0, r.stdout)


if __name__ == "__main__":
    unittest.main()
