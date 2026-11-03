import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REL = "docs/planning/baseline-signoff-2026-11-03/build_signoff.py"


def inputs() -> list[str]:
    import importlib.util
    spec = importlib.util.spec_from_file_location("build_signoff", ROOT / REL)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return list(mod.INPUTS.values())


class BaselineSignoffTests(unittest.TestCase):
    """Each case mutates a copy of the inputs and names the refusal it expects."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        paths = [REL, *inputs(), "docs/diagrams/mp-architecture-2026-11-02/spec.json",
                 "docs/diagrams/mp-quality-2026-11-02/spec.json"]
        for folder in ("docs/diagrams/mp-architecture-2026-11-02", "docs/diagrams/mp-quality-2026-11-02",
                       "docs/motion"):
            paths += [str(p.relative_to(ROOT)) for p in (ROOT / folder).glob("*.png")]
            paths += [str(p.relative_to(ROOT)) for p in (ROOT / folder).glob("*.gif")]
        for rel in paths:
            (self.root / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / rel, self.root / rel)

    def tearDown(self):
        self.tmp.cleanup()

    def run_builder(self, *args):
        return subprocess.run([sys.executable, str(self.root / REL), *args], capture_output=True, text=True)

    def test_the_repo_pack_is_current(self):
        result = subprocess.run([sys.executable, str(ROOT / REL), "--check"], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_a_built_pack_passes_then_an_input_edit_makes_it_stale(self):
        self.assertEqual(self.run_builder().returncode, 0)
        self.assertEqual(self.run_builder("--check").returncode, 0)
        log = self.root / "docs/planning/ma-reconciliation-2026-11-02/decision-log.md"
        log.write_text(log.read_text() + "\nA new owner answer.\n")
        result = self.run_builder("--check")
        self.assertEqual(result.returncode, 1)
        self.assertIn("stale", result.stdout)

    def test_refined_directions_are_reported_from_the_record(self):
        self.assertEqual(self.run_builder().returncode, 0)
        readme = (self.root / "docs/planning/baseline-signoff-2026-11-03/README.md").read_text()
        self.assertIn("| ARC-01 | Keep Yahoo/Grow; verify uses and investigate gaps (Recommended) | 2026-11-02 | "
                      "2026-11-02, 2026-11-03 |", readme)
        self.assertRegex(readme, r"\| ARC-02 \|[^\n]*\| no \|")

    def test_a_missing_input_fails(self):
        (self.root / "docs/planning/trace.json").unlink()
        result = self.run_builder()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("trace.json is missing", result.stderr)

    def test_an_export_that_differs_from_its_manifest_fails(self):
        png = next((self.root / "docs/diagrams/mp-quality-2026-11-02").glob("*.png"))
        png.write_bytes(png.read_bytes() + b"x")
        result = self.run_builder()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("does not match its manifest", result.stderr)

    def test_a_lucid_spec_that_drifts_from_its_manifest_fails(self):
        spec = self.root / "docs/diagrams/mp-quality-2026-11-02/spec.json"
        spec.write_text(spec.read_text() + " ")
        result = self.run_builder()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("differs from its manifest's spec_sha256", result.stderr)

    def test_a_cost_question_whose_record_drops_it_fails(self):
        model = self.root / "docs/planning/foundation-specifications-2026-11-02/costs/model.json"
        model.write_text(model.read_text().replace("Possible double count", "Settled"))
        result = self.run_builder()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("COST-Q2", result.stderr)

    def test_a_signed_pack_refuses_a_rebuild(self):
        self.assertEqual(self.run_builder().returncode, 0)
        pins = self.root / "docs/planning/baseline-signoff-2026-11-03/signoff.json"
        data = json.loads(pins.read_text())
        data["signed_off"] = {"commit": "0" * 40, "owner_words": "test", "date": "2026-11-03"}
        pins.write_text(json.dumps(data))
        result = self.run_builder()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("signed off", result.stderr)
        # outside a git repository nothing can match the signed commit, so the check fails closed
        self.assertEqual(self.run_builder("--check").returncode, 1)


if __name__ == "__main__":
    unittest.main()
