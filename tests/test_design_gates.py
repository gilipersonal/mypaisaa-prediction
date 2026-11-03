import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("design_gates", ROOT / "scripts/design_gates.py")
dg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dg)


class DesignGatesTests(unittest.TestCase):
    def test_the_good_page_passes(self):
        fails, rows = dg.check_page(dg.good_page())
        self.assertEqual(fails, [])
        self.assertGreater(len(rows), len(dg.CORE))

    def test_every_mutation_is_refused_with_its_reason(self):
        base = dg.good_page()
        for name, (mutate, expect) in dg.MUTATIONS.items():
            with self.subTest(name):
                fails, _ = dg.check_page(mutate(base))
                self.assertTrue(any(expect in f for f in fails), (name, fails))

    def test_the_20_percent_model(self):
        # white on black: 21:1 at full brightness, and the best any pair reaches at 20% is 5:1
        full, dim = dg.ratios((255, 255, 255, 1), (0, 0, 0, 1))
        self.assertAlmostEqual(full, 21.0, places=2)
        self.assertAlmostEqual(dim, 5.0, places=2)

    def test_a_pair_that_passes_full_but_not_at_20_percent_fails(self):
        theme = {"--a": "#333333", "--b": "#F6F4F1"}
        full, dim, ok = dg.measure("body", "a", "b", theme)
        self.assertGreater(full, 7)
        self.assertLess(dim, 4.5)
        self.assertFalse(ok)

    def test_a_translucent_ground_is_refused(self):
        with self.assertRaises(dg.Fail):
            dg.measure("text", "a", "b", {"--a": "#000000", "--b": "rgba(255, 255, 255, 0.5)"})

    def test_a_missing_gated_page_fails(self):
        self.assertEqual(dg.check(["docs/design/reviews/MP-62/no-such-page.html"]), 1)


if __name__ == "__main__":
    unittest.main()
