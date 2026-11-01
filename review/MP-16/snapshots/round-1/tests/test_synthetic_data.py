"""Scientific/financial fixture invariants, using isolated generated packs."""

import copy
import json
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
            with self.assertRaises(AssertionError):
                validate(self.dev)
        finally:
            target.write_bytes(original)

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
