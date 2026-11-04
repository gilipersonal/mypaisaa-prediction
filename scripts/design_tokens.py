#!/usr/bin/env python3
"""Prism's design tokens: one source for the web, the PWA, iOS and iPadOS (MP-62, docs/design/prism/README.md).

    python3 scripts/design_tokens.py build      # write tokens.css and PrismTokens.swift from tokens.json
    python3 scripts/design_tokens.py check      # fail if a generated file is stale or a contrast pair falls short
    python3 scripts/design_tokens.py report     # every pair, both themes, at full and 20% brightness
    python3 scripts/design_tokens.py selftest   # mutate a copy of the tokens; each must be refused

docs/design/prism/tokens.json is the source, in the Design Tokens Community Group shape ($value, $type) with MP's own
$extensions.mp: the dark value, the SwiftUI name and the role. Nothing else sets a value. A change to a colour, a
size or a timing happens there, and the web and the Apple app both follow from the same build.

The contrast model is the gate's: scripts/design_gates.py measures at full brightness and at 20%. The owner chose MA's
ink for Prism on 3 November 2026, so its tiers are the 20% rule as first set: body 7:1 and 4.5:1, text 4.5:1 and 3:1.
"""
from __future__ import annotations

import copy
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIR = ROOT / "docs/design/prism"
SOURCE = DIR / "tokens.json"
CSS = DIR / "tokens.css"
SWIFT = DIR / "PrismTokens.swift"
TIERS = {"body": (7.0, 4.5), "text": (4.5, 3.0), "ui": (3.0, 1.8), "presence": (1.5, 1.25)}
START, END = "/* prism-tokens:start */", "/* prism-tokens:end */"

_spec = importlib.util.spec_from_file_location("design_gates", ROOT / "scripts/design_gates.py")
gates = importlib.util.module_from_spec(_spec)
sys.modules["design_gates"] = gates
_spec.loader.exec_module(gates)


class Bad(Exception):
    pass


def leaves(node: dict, path: tuple = ()):
    """Every token in the tree as (group path, name, token)."""
    for k, v in node.items():
        if k.startswith("$"):
            continue
        if isinstance(v, dict) and "$value" in v:
            yield path, k, v
        elif isinstance(v, dict):
            yield from leaves(v, path + (k,))


def css_value(t: dict, v):
    if isinstance(v, list):
        return "cubic-bezier(" + ", ".join(str(x) for x in v) + ")"
    return str(v)


def themed(tokens: dict) -> tuple[dict, dict, dict]:
    """(both themes, light, dark) as CSS custom properties."""
    both, light, dark = {}, {}, {}
    for _, name, t in leaves(tokens):
        ext = t.get("$extensions", {}).get("mp", {})
        var = f"--{name}"
        if "dark" in ext:
            light[var] = css_value(t, t["$value"])
            dark[var] = css_value(t, ext["dark"])
        else:
            both[var] = css_value(t, t["$value"])
    return both, light, dark


def block(d: dict) -> str:
    return "\n".join(f"  {k}: {v};" for k, v in d.items())


def build_css(tokens: dict) -> str:
    both, light, dark = themed(tokens)
    return (f"{START}\n/* Generated from tokens.json by scripts/design_tokens.py. Do not edit. */\n"
            f":root {{\n{block(both)}\n}}\n"
            f":root, .scheme-light {{\n{block(light)}\n}}\n"
            f"@media (prefers-color-scheme: dark) {{\n:root:not([data-theme=\"light\"]) {{\n{block(dark)}\n  color-scheme: dark;\n}}\n}}\n"
            f":root[data-theme=\"dark\"], .scheme-dark {{\n{block(dark)}\n  color-scheme: dark;\n}}\n{END}\n")


def camel(name: str) -> str:
    head, *rest = name.split("-")
    return head + "".join(w.capitalize() for w in rest)


def swift_colour(v: str) -> str:
    v = v.strip()
    m = re.fullmatch(r"#([0-9A-Fa-f]{6})", v)
    if m:
        h = m.group(1)
        r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
        return f"Color(red: {r:.4f}, green: {g:.4f}, blue: {b:.4f})"
    m = re.fullmatch(r"rgba\((\d+), (\d+), (\d+), ([\d.]+)\)", v)
    if m:
        r, g, b, a = int(m[1]) / 255, int(m[2]) / 255, int(m[3]) / 255, float(m[4])
        return f"Color(red: {r:.4f}, green: {g:.4f}, blue: {b:.4f}, opacity: {a:g})"
    raise Bad(f"cannot write the colour {v} in Swift")


def build_swift(tokens: dict) -> str:
    out = ["// Generated from docs/design/prism/tokens.json by scripts/design_tokens.py. Do not edit.",
           "// A specification for the Apple app (MP-62): the app's colour assets and constants are made from this file.",
           "import SwiftUI", "", "public enum Prism {"]
    colours, numbers, curves = [], [], []
    for path, name, t in leaves(tokens):
        ext = t.get("$extensions", {}).get("mp", {})
        kind = t.get("$type")
        if kind == "color":
            light = swift_colour(t["$value"])
            dark = swift_colour(ext.get("dark", t["$value"]))
            colours.append(f"    public static let {camel(name)} = Color(light: {light}, dark: {dark})")
        elif kind in ("dimension", "duration"):
            v = float(re.sub(r"(px|ms|pt)$", "", str(t["$value"])))
            numbers.append(f"    public static let {camel(name)}: CGFloat = {v / 1000 if kind == 'duration' else v:g}")
        elif kind == "cubicBezier":
            a, b, c, d = t["$value"]
            curves.append(f"    public static let {camel(name)} = Animation.timingCurve({a}, {b}, {c}, {d})")
    out += ["  public enum Palette {"] + colours + ["  }", "", "  public enum Metric {"] + numbers + ["  }", "",
            "  public enum Curve {"] + curves + ["  }", "}", "",
            "extension Color {",
            "  /// A colour that follows the system appearance; the app's asset catalog carries the same pair.",
            "  init(light: Color, dark: Color) {",
            "    self.init(uiColor: UIColor { $0.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light) })",
            "  }", "}", ""]
    return "\n".join(out)


def theme_maps(tokens: dict) -> tuple[dict, dict]:
    both, light, dark = themed(tokens)
    return {**both, **light}, {**both, **light, **dark}


def measure_all(tokens: dict) -> tuple[list[tuple], list[str]]:
    light, dark = theme_maps(tokens)
    rows, fails = [], []
    saved = dict(gates.LIMITS)
    gates.LIMITS.update(TIERS)
    try:
        for tier, fg, bg in tokens["$extensions"]["mp"]["pairs"]:
            for theme, values in (("light", light), ("dark", dark)):
                try:
                    full, dim, ok = gates.measure(tier, fg, bg, values)
                except gates.Fail as e:
                    fails.append(f"{theme}: {tier} {fg} on {bg}: {e}")
                    continue
                rows.append((theme, tier, fg, bg, full, dim, ok))
                if not ok:
                    need = TIERS[tier]
                    fails.append(f"{theme}: {tier} {fg} on {bg} is {full:.2f}:1 full and {dim:.2f}:1 at 20% (needs {need[0]} and {need[1]})")
    finally:
        gates.LIMITS.clear()
        gates.LIMITS.update(saved)
    return rows, fails


def problems(tokens: dict) -> list[str]:
    out = []
    seen = {}
    for _, name, t in leaves(tokens):
        if name in seen:
            out.append(f"{name} is defined twice")
        seen[name] = t
        if "$type" not in t:
            out.append(f"{name} has no $type")
        if t.get("$type") == "color":
            swift = t.get("$extensions", {}).get("mp", {}).get("swift")
            if swift is None:
                out.append(f"{name} has no SwiftUI name")
            elif swift != f"Prism.Palette.{camel(name)}":
                out.append(f"{name} names {swift}, but the build generates Prism.Palette.{camel(name)}")
    if not tokens.get("$extensions", {}).get("mp", {}).get("pairs"):
        out.append("tokens.json lists no contrast pairs")
    _, fails = measure_all(tokens)
    return out + fails


def check() -> int:
    if not SOURCE.is_file():
        print(f"FAIL {SOURCE.relative_to(ROOT)} is missing")
        return 1
    tokens = json.loads(SOURCE.read_text())
    bad = problems(tokens)
    if not CSS.is_file() or CSS.read_text() != build_css(tokens):
        bad.append("tokens.css is stale; run python3 scripts/design_tokens.py build")
    if not SWIFT.is_file() or SWIFT.read_text() != build_swift(tokens):
        bad.append("PrismTokens.swift is stale; run python3 scripts/design_tokens.py build")
    for b in bad:
        print(f"FAIL {b}")
    if not bad:
        rows, _ = measure_all(tokens)
        print(f"design-tokens: {sum(1 for _ in leaves(tokens))} tokens; {len(rows)} pair measurements pass; css and swift are current")
    return 1 if bad else 0


def report() -> int:
    tokens = json.loads(SOURCE.read_text())
    rows, _ = measure_all(tokens)
    print("| Theme | Tier | Foreground | Ground | Full | 20% | Pass |\n| --- | --- | --- | --- | ---: | ---: | --- |")
    for theme, tier, f, b, full, dim, ok in rows:
        print(f"| {theme} | {tier} | {f} | {b} | {full:.2f} | {dim:.2f} | {'yes' if ok else 'NO'} |")
    return 0


def selftest() -> int:
    good = json.loads(SOURCE.read_text())
    if problems(good):
        print("selftest: FAIL the real tokens are refused, so the harness proves nothing")
        return 1

    def setv(name, value, dark=False):
        def f(t):
            for _, n, leaf in leaves(t):
                if n == name:
                    if dark:
                        leaf["$extensions"]["mp"]["dark"] = value
                    else:
                        leaf["$value"] = value
        return f

    def drop_swift(t):
        for _, n, leaf in leaves(t):
            if n == "ink":
                del leaf["$extensions"]["mp"]["swift"]

    cases = {
        "weak-ink": (setv("ink", "#6A7080"), "body ink on surface"),
        "weak-dark-ink": (setv("ink", "#9AA0B0", True), "dark: body ink on"),
        "low-secondary": (setv("ink-2", "#8A90A0"), "text ink-2 on"),
        "unreadable": (setv("ink", "color-mix(in srgb, #000, #fff)"), "cannot read the colour"),
        "missing-pair-token": (lambda t: t["$extensions"]["mp"]["pairs"].append(["body", "nope", "surface"]), "--nope is not defined"),
        "no-pairs": (lambda t: t["$extensions"]["mp"].update(pairs=[]), "lists no contrast pairs"),
        "no-swift-name": (drop_swift, "ink has no SwiftUI name"),
        "wrong-swift-name": (lambda t: t["color"]["ink"]["ink"]["$extensions"]["mp"].update(swift="Color.prism.ink"), "but the build generates"),
    }
    bad = 0
    for name, (mutate, expect) in cases.items():
        t = copy.deepcopy(good)
        mutate(t)
        found = problems(t)
        if not any(expect in f for f in found):
            print(f"selftest: FAIL {name}: expected {expect!r}, got {found or 'a pass'}")
            bad += 1
    if build_css(good) == build_css({**good, "extra": {"$type": "color"}}) is False:
        bad += 1
    if bad:
        return 1
    print(f"selftest: the real tokens pass and all {len(cases)} mutations are refused")
    return 0


def main(argv: list[str]) -> int:
    cmd = argv[0] if argv else ""
    if cmd == "build":
        tokens = json.loads(SOURCE.read_text())
        CSS.write_text(build_css(tokens))
        SWIFT.write_text(build_swift(tokens))
        print(f"built {CSS.relative_to(ROOT)} and {SWIFT.relative_to(ROOT)}")
        return 0
    if cmd == "check":
        return check()
    if cmd == "report":
        return report()
    if cmd == "selftest":
        return selftest()
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
