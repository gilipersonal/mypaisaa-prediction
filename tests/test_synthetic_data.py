"""Scientific/financial fixture invariants, using isolated generated packs."""

import copy
import gzip
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from scripts.synthetic_data import forecast_records, generate, load_rows
from scripts.validate_synthetic_data import validate


class SyntheticDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory()
        cls.root = Path(cls.temporary.name)
        cls.local = cls.root / "local"
        cls.dev = cls.root / "dev"
        cls.a = generate(cls.local, "local", start="2025-01-01", end="2025-12-31")
        cls.b = generate(cls.dev, "dev", start="2025-01-01", end="2025-12-31")

    @classmethod
    def tearDownClass(cls):
        cls.temporary.cleanup()

    def test_financial_and_temporal_invariants(self):
        self.assertEqual(validate(self.local)["status"], "passed")
        self.assertEqual(validate(self.dev)["status"], "passed")

    def test_identical_market_seed_and_separate_environment_identities(self):
        for name in ["daily_prices.jsonl.gz", "intraday_30m.jsonl.gz", "fx.jsonl.gz"]:
            self.assertEqual(self.a["sha256"][name], self.b["sha256"][name])
        self.assertNotEqual(self.a["sha256"]["accounts.json"], self.b["sha256"]["accounts.json"])

    def test_forecast_does_not_read_future_outcome(self):
        rows = load_rows(self.local / "daily_prices.jsonl.gz")
        instrument = rows[0]["instrument_id"]
        history = [r for r in rows if r["instrument_id"] == instrument]
        before, _ = forecast_records({instrument: history})
        changed = copy.deepcopy(history)
        changed[-1]["total_return_index"] *= 10
        after, _ = forecast_records({instrument: changed})
        cutoff = history[-1]["available_at"]
        self.assertEqual(
            [r for r in before if r["as_of"] < cutoff], [r for r in after if r["as_of"] < cutoff]
        )

    def test_corruption_is_detected(self):
        target = self.dev / "positions.json"
        original = target.read_bytes()
        try:
            target.write_text("[]")
            with self.assertRaises(ValueError):
                validate(self.dev)
        finally:
            target.write_bytes(original)

    def test_optimized_python_still_rejects_corruption(self):
        target = self.dev / "positions.json"
        original = target.read_bytes()
        try:
            target.write_text("[]")
            for args, extra_env in [(["-O"], {}), ([], {"PYTHONOPTIMIZE": "1"})]:
                result = subprocess.run(
                    [sys.executable, *args, "scripts/validate_synthetic_data.py", str(self.dev)],
                    capture_output=True,
                    check=False,
                    env={**os.environ, **extra_env},
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(b"positions.json", result.stderr)
                self.assertNotIn(b'"status": "passed"', result.stdout)
        finally:
            target.write_bytes(original)

    def test_cnx1_pence_to_pounds_contract(self):
        catalogue = json.loads((self.local / "instruments.json").read_text())
        instrument = next(x for x in catalogue if x["instrument_id"] == "XLON:CNX1")
        self.assertEqual(instrument["yahoo_symbol"], "CNX1.L")
        self.assertEqual(instrument["quote_unit"], "GBX")
        self.assertEqual(instrument["currency"], "GBP")
        bars = load_rows(self.local / "daily_prices.jsonl.gz")
        cnx = next(x for x in bars if x["instrument_id"] == "XLON:CNX1")
        self.assertAlmostEqual(cnx["close"] / 100, cnx["currency_close"], places=6)

    def test_older_daily_session_mutation_is_rejected(self):
        prices = self.dev / "daily_prices.jsonl.gz"
        manifest = self.dev / "manifest.json"
        old_prices, old_manifest = prices.read_bytes(), manifest.read_bytes()
        try:
            rows = load_rows(prices)
            rows[0]["session"] = "2025-01-04"  # Saturday outside the recorded sessions.
            with gzip.open(prices, "wt", encoding="utf-8") as stream:
                stream.writelines(json.dumps(row) + "\n" for row in rows)
            data = json.loads(manifest.read_text())
            data["sha256"][prices.name] = hashlib.sha256(prices.read_bytes()).hexdigest()
            manifest.write_text(json.dumps(data))
            with self.assertRaisesRegex(ValueError, "not a recorded market session"):
                validate(self.dev)
        finally:
            prices.write_bytes(old_prices)
            manifest.write_bytes(old_manifest)

    def test_production_environment_is_refused(self):
        with self.assertRaises(ValueError):
            generate(self.root / "prod", "prod")
        result = subprocess.run(
            [sys.executable, "scripts/synthetic_data.py", "--environment", "prod"],
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 2)
        self.assertFalse((self.root / "prod").exists())

    def test_known_xirr_fixture(self):
        fixture = json.loads((self.local / "xirr_known_answer.json").read_text())
        self.assertAlmostEqual(-10000 + 11000 / (1 + fixture["expected_xirr"]), 0)


if __name__ == "__main__":
    unittest.main()
