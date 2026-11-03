import importlib.util
import json
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REL = "docs/planning/baseline-signoff-2026-11-03/build_signoff.py"
PACK = "docs/planning/foundation-specifications-2026-11-02"


def inputs() -> list[str]:
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
        # the pack links to files beyond its inputs; give each link its target so the link check can resolve it
        here = ROOT / Path(REL).parent
        for link in re.findall(r"\]\(([^)#]+)", (here / "README.md").read_text()):
            if link.startswith("http"):
                continue
            target = (here / link).resolve()
            copy = self.root / target.relative_to(ROOT)
            if target.is_dir():
                copy.mkdir(parents=True, exist_ok=True)
            elif target.is_file() and not copy.exists():
                copy.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(target, copy)

    def tearDown(self):
        self.tmp.cleanup()

    def run_builder(self, *args):
        return subprocess.run([sys.executable, str(self.root / REL), *args], capture_output=True, text=True)

    def refuses(self, needle):
        result = self.run_builder()
        self.assertNotEqual(result.returncode, 0, result.stdout)
        self.assertIn(needle, result.stderr)

    def edit_json(self, rel, change):
        path = self.root / rel
        data = json.loads(path.read_text())
        change(data)
        path.write_text(json.dumps(data))

    def git(self, *args):
        return subprocess.run(["git", "-c", "user.name=t", "-c", "user.email=t@example.invalid", *args],
                              cwd=self.root, capture_output=True, text=True, check=True).stdout.strip()

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

    def test_the_policy_answers_and_the_card_and_architecture_open_items_are_listed(self):
        self.assertEqual(self.run_builder().returncode, 0)
        readme = (self.root / "docs/planning/baseline-signoff-2026-11-03/README.md").read_text()
        for needle in ("| POLICY-001 |", "| POLICY-012 |", "FND-DEC-001", "| ARC-06b-O1 |", "| STORIES |",
                       "ARCHITECTURE.md §13"):
            self.assertIn(needle, readme)

    def test_a_missing_input_fails(self):
        (self.root / "docs/planning/trace.json").unlink()
        self.refuses("trace.json is missing")

    def test_an_export_that_differs_from_its_manifest_fails(self):
        png = next((self.root / "docs/diagrams/mp-quality-2026-11-02").glob("*.png"))
        png.write_bytes(png.read_bytes() + b"x")
        self.refuses("does not match its manifest")

    def test_a_lucid_spec_that_drifts_from_its_manifest_fails(self):
        spec = self.root / "docs/diagrams/mp-quality-2026-11-02/spec.json"
        spec.write_text(spec.read_text() + " ")
        self.refuses("differs from its manifest's spec_sha256")

    def test_a_drawing_with_no_status_fails(self):
        self.edit_json("docs/diagrams/mp-quality-2026-11-02/manifest.json", lambda m: m["pages"][0].pop("status"))
        self.refuses("has no `status`")

    def test_a_cost_question_whose_record_drops_it_fails(self):
        model = self.root / f"{PACK}/costs/model.json"
        model.write_text(model.read_text().replace("Possible double count", "Settled"))
        self.refuses("COST-Q2")

    def test_an_open_item_with_no_deciding_evidence_fails(self):
        def blank(cat):
            next(d for d in cat["owner_decisions"] if d["status"] != "owner_confirmed")["note"] = ""
        self.edit_json(f"{PACK}/data/catalogue.json", blank)
        self.refuses("has no `note`")

    def test_a_partly_answered_item_with_nothing_still_open_fails(self):
        def drop(od):
            next(d for d in od["material_choices"] if d["status"] == "partly_answered").pop("still_open")
        self.edit_json(f"{PACK}/forecasting/open-decisions.json", drop)
        self.refuses("has no `still_open`")

    def test_an_answered_financial_item_leaves_the_open_list(self):
        def close(od):
            od["decisions"][0]["status"] = "owner_confirmed"
        self.edit_json(f"{PACK}/financial/open-decisions.json", close)
        self.assertEqual(self.run_builder().returncode, 0)
        pins = json.loads((self.root / "docs/planning/baseline-signoff-2026-11-03/signoff.json").read_text())
        self.assertNotIn("FIN-OD-01", pins["open_items"])

    def test_a_precedence_rule_reworded_in_one_record_fails(self):
        rule = self.root / ".claude/rules/plan-sync.md"
        rule.write_text(rule.read_text().replace("come first", "usually come first"))
        self.refuses("precedence phrase")

    def test_a_phase_naming_an_unknown_contract_fails(self):
        self.edit_json("docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json",
                       lambda b: b["phases"][1]["gap_ids"].append("ZZ-99"))
        self.refuses("names contracts that do not exist")

    def test_a_copied_link_that_resolves_to_nothing_fails(self):
        arch = self.root / "ARCHITECTURE.md"
        arch.write_text(arch.read_text().replace("## 13. What is still open\n",
                                                 "## 13. What is still open\n\n- **Gone:** see [it](docs/no-such-file.md).\n", 1))
        self.refuses("links that resolve to nothing")

    def test_motion_with_no_still_fails(self):
        next((self.root / "docs/motion").glob("*.png")).unlink()
        self.refuses("no static PNG")

    def test_the_signed_mode(self):
        """A real signature passes; a changed pack, a changed pin, a moving ref or a blank signature fails."""
        self.assertEqual(self.run_builder().returncode, 0)
        self.git("init", "-q")
        self.git("add", "-A")
        self.git("commit", "-qm", "pack")
        commit = self.git("rev-parse", "HEAD")
        pins_path = self.root / "docs/planning/baseline-signoff-2026-11-03/signoff.json"
        readme_path = self.root / "docs/planning/baseline-signoff-2026-11-03/README.md"
        unsigned = json.loads(pins_path.read_text())

        def sign(signed, pins=None):
            pins_path.write_text(json.dumps({**(pins or unsigned), "signed_off": signed}))
            return self.run_builder("--check")

        good = {"commit": commit, "owner_words": "Signed off", "date": "2026-11-03"}
        result = sign(good)
        self.assertEqual(result.returncode, 0, result.stdout)
        rebuild = self.run_builder()
        self.assertNotEqual(rebuild.returncode, 0)
        self.assertIn("signed off", rebuild.stderr)
        readme = readme_path.read_text()
        readme_path.write_text(readme + "\nTAMPERED: the owner approved everything\n")
        self.assertIn("README.md differs", sign(good).stdout)
        readme_path.write_text(readme)
        tampered = json.loads(json.dumps(unsigned))
        tampered["UX_authorised"] = True
        self.assertIn("signoff.json differs", sign(good, tampered).stdout)
        tampered = json.loads(json.dumps(unsigned))
        tampered["inputs"]["trace"]["sha256"] = "0" * 64
        self.assertIn("pin for trace", sign(good, tampered).stdout)
        self.assertIn("full 40-character sha", sign({**good, "commit": "HEAD"}).stdout)
        self.assertIn("full 40-character sha", sign({**good, "commit": commit[:7]}).stdout)
        self.assertIn("`owner_words` is empty", sign({**good, "owner_words": ""}).stdout)
        result = sign({})
        self.assertEqual(result.returncode, 1)
        self.assertIn("`commit` must be", result.stdout)
        self.assertIn("not in this branch's history", sign({**good, "commit": "1" * 40}).stdout)


if __name__ == "__main__":
    unittest.main()
