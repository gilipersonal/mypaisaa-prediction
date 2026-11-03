import importlib.util
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("design_sync", ROOT / "scripts/design_sync.py")
ds = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ds)

URL = "https://claude.ai/artifact/AbC123"


class DesignSyncTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / "page.html").write_text("<title>A page</title>")

    def tearDown(self):
        self.tmp.cleanup()

    def entry(self, **kw):
        e = {"slug": "page", "source": "page.html", "artifact_url": URL,
             "published_sha256": ds.sha(self.root / "page.html"), "published_at": "2026-11-03", "jira": "MP-37"}
        e.update(kw)
        return {"designs": [e]}

    def test_a_synced_design_passes(self):
        self.assertEqual(ds.problems(self.entry(), self.root), ([], []))

    def test_an_edit_after_publishing_is_pending(self):
        m = self.entry()
        (self.root / "page.html").write_text("<title>A page, edited</title>")
        fail, pending = ds.problems(m, self.root)
        self.assertEqual(fail, [])
        self.assertIn("changed since it was synced", pending[0])

    def test_a_missing_source_fails(self):
        fail, _ = ds.problems(self.entry(source="gone.html"), self.root)
        self.assertIn("source gone.html is missing", fail[0])

    def test_a_non_artifact_link_and_a_foreign_key_fail(self):
        fail, _ = ds.problems(self.entry(artifact_url="https://example.com/x", jira="MA-1"), self.root)
        self.assertEqual(len(fail), 2)

    def test_a_duplicate_slug_fails(self):
        m = self.entry()
        m["designs"].append(dict(m["designs"][0]))
        fail, _ = ds.problems(m, self.root)
        self.assertIn("listed twice", fail[0])

    def test_the_repo_manifest_is_in_step(self):
        fail, pending = ds.problems(ds.load())
        self.assertEqual(fail + pending, [])


if __name__ == "__main__":
    unittest.main()
