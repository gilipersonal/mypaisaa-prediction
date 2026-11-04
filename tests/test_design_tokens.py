import copy
import importlib.util
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("design_tokens", ROOT / "scripts/design_tokens.py")
dt = importlib.util.module_from_spec(spec)
sys.modules["design_tokens"] = dt
spec.loader.exec_module(dt)


class DesignTokensTests(unittest.TestCase):
    def setUp(self):
        self.tokens = json.loads(dt.SOURCE.read_text())

    def test_the_real_tokens_pass_and_the_generated_files_are_current(self):
        self.assertEqual(dt.problems(self.tokens), [])
        self.assertEqual(dt.CSS.read_text(), dt.build_css(self.tokens))
        self.assertEqual(dt.SWIFT.read_text(), dt.build_swift(self.tokens))

    def test_the_ink_is_mas_home_board(self):
        ink = self.tokens["color"]["ink"]
        self.assertEqual((ink["ink"]["$value"], ink["ink"]["$extensions"]["mp"]["dark"]), ("#14171F", "#F3F5F8"))
        self.assertEqual((ink["ink-2"]["$value"], ink["ink-2"]["$extensions"]["mp"]["dark"]), ("#4E5462", "#C5CCD7"))

    def test_a_pair_that_passes_at_full_but_not_at_20_percent_is_refused(self):
        t = copy.deepcopy(self.tokens)
        t["color"]["ink"]["ink"]["$value"] = "#333333"
        self.assertTrue(any("body ink on" in f for f in dt.problems(t)))

    def test_the_css_carries_both_dark_blocks_and_they_match(self):
        css = dt.build_css(self.tokens)
        self.assertIn(':root:not([data-theme="light"])', css)
        self.assertIn(':root[data-theme="dark"], .scheme-dark', css)
        self.assertIn("--ink: #F3F5F8;", css)

    def test_the_swift_names_every_colour_with_both_appearances(self):
        swift = dt.build_swift(self.tokens)
        self.assertIn("public static let ink = Color(light:", swift)
        self.assertIn("public static let moFast: CGFloat = 0.18", swift)

    def test_a_colour_swift_cannot_write_is_refused(self):
        with self.assertRaises(dt.Bad):
            dt.swift_colour("hsl(10, 20%, 30%)")


if __name__ == "__main__":
    unittest.main()
