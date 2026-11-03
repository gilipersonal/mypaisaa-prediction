"""Confluence read-back receipts (MP-35): the selftest's cases and the space's own receipts."""

from __future__ import annotations

import hashlib
import importlib.util
import json
import subprocess
import sys
import tempfile
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


def build_module():
    spec = importlib.util.spec_from_file_location("build_pages", BUILD)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class AttachmentHashes(unittest.TestCase):
    """An attachment is current only while its file matches the sha256 recorded at upload (MP-20)."""

    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "a.png").write_bytes(b"one")
        self.media_problems = build_module().media_problems
        self.rec = {"id": "m1", "collection": "contentId-1", "attachment": "att1",
                    "sha256": hashlib.sha256(b"one").hexdigest()}

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_a_current_attachment_passes(self) -> None:
        self.assertEqual(self.media_problems({"p": ["a.png"]}, {"p": {"a.png": self.rec}}, self.root), [])

    def test_a_changed_file_under_the_same_name_fails(self) -> None:
        (self.root / "a.png").write_bytes(b"two")
        problems = self.media_problems({"p": ["a.png"]}, {"p": {"a.png": self.rec}}, self.root)
        self.assertEqual(len(problems), 1)
        self.assertIn("changed since it was attached", problems[0])

    def test_a_record_with_no_hash_fails(self) -> None:
        rec = {k: v for k, v in self.rec.items() if k != "sha256"}
        problems = self.media_problems({"p": ["a.png"]}, {"p": {"a.png": rec}}, self.root)
        self.assertIn("changed since it was attached", problems[0])

    def test_an_unattached_or_missing_file_fails(self) -> None:
        self.assertIn("not attached", self.media_problems({"p": ["a.png"]}, {}, self.root)[0])
        problems = self.media_problems({"p": ["b.png"]}, {"p": {"b.png": self.rec}}, self.root)
        self.assertIn("missing from the repo", problems[0])

    def test_every_recorded_attachment_carries_a_hash(self) -> None:
        for slug, items in json.loads(MANIFEST.read_text())["media"].items():
            for path, rec in items.items():
                with self.subTest(slug=slug, path=path):
                    self.assertRegex(rec.get("sha256", ""), r"^[0-9a-f]{64}$")


if __name__ == "__main__":
    unittest.main()
