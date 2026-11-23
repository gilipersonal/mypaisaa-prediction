"""The journeys build writes only where it is told, and refuses what it cannot read (MP-191).

Two makers ran `build.py --out PATH` without `--only`; the script ignored --out and overwrote index.html.
These cases undo that: each runs the real script and checks index.html is untouched unless it was the target.
"""
import hashlib
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "docs/design/journeys/build.py"
PAGE = ROOT / "docs/design/journeys/index.html"


def run(*args):
    return subprocess.run([sys.executable, str(BUILD), *args], capture_output=True, text=True, cwd=ROOT, timeout=120)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


class JourneysBuildTest(unittest.TestCase):
    def setUp(self):
        self.before = digest(PAGE)
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()
        self.assertEqual(digest(PAGE), self.before, "the build changed index.html")

    def test_out_alone_writes_the_whole_page_there(self):
        out = self.dir / "full.html"
        r = run("--out", str(out))
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertTrue(out.is_file())
        self.assertIn("J.start();", out.read_text())
        self.assertGreater(out.stat().st_size, 100_000, "the whole page, not a partial one")

    def test_only_with_out_writes_a_partial_page_there(self):
        out = self.dir / "home.html"
        r = run("--only", "home", "--out", str(out))
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertLess(out.stat().st_size, PAGE.stat().st_size)

    def test_refusals(self):
        for args, why in [(("--bogus",), "cannot read"), (("--out",), "cannot read"), (("--only", "home"), "needs --out"),
                          (("--only",), "cannot read"), (("out", "x.html"), "cannot read")]:
            with self.subTest(args=args):
                r = run(*args)
                self.assertEqual(r.returncode, 2, f"{args}: {r.stdout}")
                self.assertIn(why, r.stdout)

    def test_check_reads_and_writes_nothing(self):
        r = run("--check")
        self.assertIn(r.returncode, (0, 1), r.stdout)


if __name__ == "__main__":
    unittest.main()
