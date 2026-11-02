"""Confluence read-back receipts (MP-35): the selftest's cases and the space's own receipts."""

from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "docs/confluence/build_pages.py"
RECEIPTS = ROOT / "docs/confluence/receipts"
MANIFEST = ROOT / "docs/confluence/confluence.json"


def run(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run([sys.executable, str(BUILD), *args], cwd=ROOT, capture_output=True, text=True, timeout=120)


class ConfluenceReceipts(unittest.TestCase):
    def test_selftest_passes_every_case(self) -> None:
        r = run("selftest")
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertNotIn("FAIL", r.stdout)
        self.assertRegex(r.stdout, r"selftest: (\d+) of \1 cases pass")

    def test_check_passes_with_a_receipt_for_every_published_page(self) -> None:
        r = run("check")
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertNotIn("PENDING", r.stdout)

    def test_every_receipt_is_a_match_for_the_version_published(self) -> None:
        pages = json.loads(MANIFEST.read_text())["pages"]
        published = {s for s, rec in pages.items() if rec.get("id") and rec.get("sha256")}
        self.assertEqual({p.stem for p in RECEIPTS.glob("*.json")}, published)
        for slug in sorted(published):
            r = json.loads((RECEIPTS / f"{slug}.json").read_text())
            with self.subTest(slug=slug):
                self.assertEqual(r["verdict"], "match")
                self.assertEqual(r["sent_sha256"], pages[slug]["sha256"])
                self.assertEqual(r["version"], pages[slug]["version"])
                self.assertEqual(r["page_id"], str(pages[slug]["id"]))
                self.assertTrue(r["id_checked"])
                self.assertEqual(r["differences"], [])


if __name__ == "__main__":
    unittest.main()
