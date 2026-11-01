"""Check document/source joins and refusal boundaries, not a broker import parser."""

import json
import shutil
import tempfile
import unittest
from decimal import Decimal
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

from scripts.synthetic_import_samples import LABEL, ROOT, SOURCE_FILES, digest, generate, save


class SyntheticImportSamplesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.temp.name)
        cls.source = cls.root / "source-local"
        cls.source.mkdir()
        instruments = json.loads((ROOT / "fixtures/synthetic/instruments.json").read_text())
        accounts, positions, ledger = [], [], []
        for instrument_id in ["XNAS:AAPL", "XLON:CNX1", "XNSE:RELIANCE"]:
            instrument = next(i for i in instruments if i["instrument_id"] == instrument_id)
            account = f"synthetic-local-{instrument['market'].lower()}"
            currency = instrument["currency"]
            accounts.append(
                {
                    "account_id": account,
                    "cash": "100.00",
                    "currency": currency,
                    "is_synthetic": True,
                }
            )
            positions.append(
                {
                    "account_id": account,
                    "instrument_id": instrument_id,
                    "currency": currency,
                    "quantity": "2.0000",
                    "price": "50.12345678",
                    "value": "100.25",
                    "as_of": "2026-10-30T20:01:00+00:00",
                    "is_synthetic": True,
                }
            )
            for kind, cash in [("deposit", "200.25"), ("buy", "-100.25")]:
                ledger.append(
                    {
                        "account_id": account,
                        "instrument_id": instrument_id,
                        "date": "2026-10-30",
                        "type": kind,
                        "cash_delta": cash,
                        "quantity_delta": "2" if kind == "buy" else "0",
                        "is_synthetic": True,
                    }
                )
        for name, rows in [
            ("accounts.json", accounts),
            ("positions.json", positions),
            ("ledger.json", ledger),
            ("instruments.json", instruments),
        ]:
            save(cls.source / name, rows)
        save(
            cls.source / "manifest.json",
            {
                "dataset_id": "mypaisaa-synthetic-v1",
                "environment": "local",
                "observations_are_synthetic": True,
                "sha256": {name: digest(cls.source / name) for name in SOURCE_FILES},
            },
        )
        cls.source_hashes = {name: digest(cls.source / name) for name in SOURCE_FILES}
        cls.target = cls.root / "local"
        cls.manifest = generate(cls.source, cls.target, "local")

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def test_pdf_and_golden_records_match_source_positions_and_accounts(self):
        data = json.loads((self.target / "expected-imports.json").read_text())
        source_positions = json.loads((self.source / "positions.json").read_text())
        pages = PdfReader(self.target / "portfolio-statements.pdf").pages
        self.assertEqual(len(pages), 3)
        self.assertEqual({s["market"] for s in data["statements"]}, {"US", "UK", "IN"})
        for statement, page in zip(data["statements"], pages, strict=True):
            text = page.extract_text()
            self.assertIn(LABEL, text)
            self.assertIn(statement["account_id"], text)
            self.assertIn(statement["total_value"], text)
            self.assertFalse(statement["history_is_complete_in_document"])
            for position in statement["positions"]:
                original = next(
                    p
                    for p in source_positions
                    if p["account_id"] == statement["account_id"]
                    and p["instrument_id"] == position["instrument_id"]
                )
                for key in original:
                    self.assertEqual(position[key], original[key])
                for key in ["instrument_id", "quantity", "price", "value"]:
                    self.assertIn(position[key], text)
            self.assertEqual(
                Decimal(statement["total_value"]),
                Decimal(statement["cash"])
                + sum(Decimal(p["value"]) for p in statement["positions"]),
            )

    def test_uk_gbp_values_are_not_native_pence_quotes(self):
        data = json.loads((self.target / "expected-imports.json").read_text())
        uk = next(s for s in data["statements"] if s["market"] == "UK")
        cnx = next(p for p in uk["positions"] if p["instrument_id"] == "XLON:CNX1")
        self.assertEqual(cnx["currency"], "GBP")
        self.assertAlmostEqual(
            float(cnx["quantity"]) * float(cnx["price"]), float(cnx["value"]), delta=0.01
        )
        text = (
            PdfReader(self.target / "portfolio-statements.pdf").pages[uk["page"] - 1].extract_text()
        )
        self.assertIn("Unit price (GBP)", text)
        self.assertIn("Native GBX quotes", text)

    def test_hashes_screenshots_and_source_preservation(self):
        for name, expected in self.manifest["sha256"].items():
            self.assertEqual(digest(self.target / name), expected)
        pngs = list(self.target.glob("statement-*.png"))
        self.assertEqual(len(pngs), 3)
        for png in pngs:
            with Image.open(png) as image:
                self.assertEqual(image.format, "PNG")
                self.assertEqual(max(image.size), 1400)
                image.verify()
        self.assertEqual(
            self.source_hashes, {name: digest(self.source / name) for name in SOURCE_FILES}
        )

    def test_existing_user_directory_is_preserved(self):
        target = self.root / "existing"
        target.mkdir()
        file = target / "user.txt"
        file.write_text("preserve this")
        with self.assertRaisesRegex(ValueError, "Output exists"):
            generate(self.source, target, "local")
        self.assertEqual(file.read_text(), "preserve this")
        self.assertEqual(list(target.iterdir()), [file])

    def test_prod_and_cross_environment_inputs_are_refused(self):
        target = self.root / "refused"
        with self.assertRaisesRegex(ValueError, "Only local/dev"):
            generate(self.source, target, "prod")
        with self.assertRaisesRegex(ValueError, "Source/environment mismatch"):
            generate(self.source, target, "dev")
        self.assertFalse(target.exists())

    def test_tampered_source_is_refused_before_output_creation(self):
        source = self.root / "tampered-source"
        source.mkdir()
        for name in [*SOURCE_FILES, "manifest.json"]:
            shutil.copy2(self.source / name, source / name)
        (source / "positions.json").write_text("[]")
        target = self.root / "tampered-output"
        with self.assertRaisesRegex(ValueError, "Changed source: positions.json"):
            generate(source, target, "local")
        self.assertFalse(target.exists())

    def test_cost_scenarios_are_labelled_and_do_not_invent_balances(self):
        data = json.loads((self.target / "operations-scenarios.json").read_text())
        self.assertTrue(data["is_synthetic"])
        self.assertFalse(data["rate_card"]["current_provider_price"])
        for run in data["runs"]:
            expected = Decimal(run["input_tokens"]) * 3 + Decimal(run["output_tokens"]) * 15
            self.assertEqual(Decimal(run["gross_estimated_USD"]), expected / 1000000)
        scenarios = {s["id"]: s for s in data["independent_scenarios"]}
        self.assertIsNone(scenarios["credit-unknown"]["credit_remaining_USD"])
        self.assertEqual(scenarios["credit-unknown"]["state"], "pause-uncovered-calls")
        self.assertEqual(scenarios["cash-85"]["state"], "pause-new-optional")
        self.assertTrue(all(s["is_synthetic"] for s in scenarios.values()))


if __name__ == "__main__":
    unittest.main()
