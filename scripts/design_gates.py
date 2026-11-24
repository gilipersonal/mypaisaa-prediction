#!/usr/bin/env python3
"""MP's design pages hold their 20% brightness contrast and their smoothness rules (MP-62, brief-r2.md).

    python3 scripts/design_gates.py check [FILE ...]   # the gated pages by default; exit 1 on any failure
    python3 scripts/design_gates.py report FILE        # every measured pair, both themes, as a Markdown table
    python3 scripts/design_gates.py selftest           # mutate copies of a good page; each must be refused

The owner, 3 Nov 2026: "The apps should be colour contrasted in such way so that it is even visible at 20% mobile
screen brightness level. Check all these features really careful. Smoothness is priority."

Contrast. For two colours of relative luminance L1 > L2, WCAG 2.2's ratio (L1 + 0.05) / (L2 + 0.05) at full
brightness, and (0.2 L1 + 0.05) / (0.2 L2 + 0.05) at 20%: the panel's light falls to a fifth while the room's
reflected light (the 0.05) stays. It is MA-181's 25% model made stricter. Each pair must meet its tier at both:
body 7 and 4.5, text 7 and 3.5 (raised in round 3: "the font colour contrasts can be made more better"), ui 3 and
1.8, presence 1.5 and 1.25. The pairs are the token contract's (CORE) plus
those each page declares in its `mp-design-gates` JSON block, and labels on glass are measured on the glass composited
over each named backdrop. Colours composite in sRGB, as browsers paint them.

Smoothness. Only transform and opacity animate (clip-path and stroke-dashoffset for a chart drawing in); a transition
never says `all` (nor leaves its property out, which means all); paint-only transitions stay at or under 200 ms;
nothing loops forever or more than six times; glass blurs at most 24 px, only on the control layer, with a reduced
transparency fallback; a reduced motion block exists; big boards use content-visibility; no scroll handlers or
intervals; Web Animations never move layout. Text is at least 12 px and weight 400; the two historical pages in GATED keep their 11 px.

Sharpness (round 3: "Take special care of the icons, and the edges, they need to be sharp"). No soft edge: no text
shadow, no blur filter, no radial bloom, no zero-offset halo, no shadow blurred past 24 px. Icons are the shared inline
SVG sprite, never an icon font or a Unicode glyph, drawn with square caps and mitred joins, and every reference
resolves. One system: both pages carry docs/design/reviews/MP-62/shared/ word for word (tokens.css, icons.svg,
claude.html), so the hybrids can differ only in identity.

The picked system, docs/design/prism/index.html, is the owner's choice of 3 November 2026 and has its own proof
(check_prism): round 1's look keeps its fields and blooms, so the sharpness rules above do not bind it, and its colour
pairs are measured from tokens.json by scripts/design_tokens.py. Here the gate proves what the owner asked for: MA's
exact ink, MA's fonts and no others, the generated tokens and the icon set unchanged in the page, the twelve sections
in the owner's order, the Claude component unchanged, and the same motion rules.

Prism Journeys, docs/design/journeys/index.html, is built from the picked system (check_journeys): the same proof of
what can drift, and all ten owner journeys in the page in their order, each with exactly one recommended option and
its stories named. scripts/design_journeys_check.mjs walks every rendered state and docs/design/journeys/build.py
--check proves the page is current.

The gate fails closed: a missing page, theme block, token or JSON block, a colour it cannot read, a dark block that
differs from its twin, or a measured token set anywhere but the three theme blocks is a failure, not a skip. It reads
the page's own CSS and script; scripts/design_runtime.mjs measures the rendered page.
"""
from __future__ import annotations

import contextlib
import io
import json
import re
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GATED = ("docs/design/reviews/MP-62/hybrid-a/index.html", "docs/design/reviews/MP-62/hybrid-b/index.html")
PICKED = "docs/design/prism/index.html"
JOURNEYS = "docs/design/journeys/index.html"
ADMIN = "docs/design/admin/index.html"
ADMIN_IDS = ("home", "files", "audit", "runs", "agents", "models", "approvals", "costs", "incidents", "identity")
JOURNEY_IDS = ("home", "holdings", "forecast", "research", "journal", "track", "cost", "approvals", "privacy", "peek")
VENDOR = re.compile(r"^-(webkit|moz|ms|o)-(?=transition|animation)")
# A size set relative to its parent cannot be read from the rule alone. Each entry names why it is safe; the rendered size
# is measured by scripts/design_journeys_check.mjs. The pence of a big figure are half the figure, and never under 12 px.
RELATIVE_OK = {".amt .p", ".fig .p", ".pence"}
PRISM = ROOT / "docs/design/prism"
MA_INK = {"ink": ("#14171F", "#F3F5F8"), "ink-2": ("#4E5462", "#C5CCD7")}
SECTIONS = ("Principles", "Three depths", "Foundations", "Components", "Patterns", "States", "Layout", "Screens",
            "Motion", "Claude", "Contrast at 20%", "Web and SwiftUI")
DIM = 0.2
LIMITS = {"body": (7.0, 4.5), "text": (7.0, 3.5), "ui": (3.0, 1.8), "presence": (1.5, 1.25)}
SHARED = ROOT / "docs/design/reviews/MP-62/shared"

CONTRACT = ("canvas", "bg", "surface", "surface-2", "line", "edge", "ink", "ink-2", "ink-3", "hero", "hero-2", "hero-ink", "hero-ink-2",
            "hero-up", "hero-mark", "hero-band", "accent", "on-accent", "up", "down", "alert", "alert-bg", "on-alert",
            "warn", "warn-bg", "ok", "ok-bg", "info", "info-bg", "forecast", "band-80", "band-50", "outcome",
            "scenario", "ai", "chart-grid", "track", "focus", "seg-on", "seg-on-ink", "glass")


def _core() -> list[tuple[str, str, str]]:
    p = [("body", f, b) for f, b in (("ink", "surface"), ("ink", "bg"), ("ink", "surface-2"), ("ink", "canvas"), ("hero-ink", "hero"),
                                     ("hero-ink", "hero-2"), ("on-accent", "accent"), ("seg-on-ink", "seg-on"))]
    p += [("text", f, b) for f in ("ink-2", "ink-3") for b in ("surface", "bg", "surface-2", "canvas")]
    p += [("text", f, b) for f in ("hero-ink-2", "hero-up") for b in ("hero", "hero-2")]
    p += [("text", f, b) for f in ("accent", "up", "down", "forecast") for b in ("surface", "bg")]
    p += [("text", "alert", "surface"), ("text", "alert", "alert-bg"), ("text", "on-alert", "alert")]
    p += [("text", f, b) for f in ("warn", "ok", "info") for b in ("surface", f"{f}-bg")]
    p += [("ui", "forecast", "band-80+surface"), ("ui", "forecast", "band-50+band-80+surface"),
          ("ui", "outcome", "surface"), ("ui", "outcome", "band-80+surface"), ("ui", "scenario", "surface"),
          ("ui", "focus", "surface"), ("ui", "focus", "bg"), ("ui", "ai", "surface"), ("ui", "ai", "bg"),
          ("ui", "hero-mark", "hero"),
          ("ui", "hero-mark", "hero-band+hero")]
    p += [("presence", "track", b) for b in ("surface", "bg", "surface-2")]
    p += [("presence", "edge", "bg"), ("presence", "edge", "surface")]
    p += [("presence", "band-80+surface", "surface"), ("presence", "band-50+band-80+surface", "band-80+surface"),
          ("presence", "hero-band+hero", "hero"), ("presence", "seg-on", "surface-2")]
    return [(t, "mp-" + "+mp-".join(f.split("+")), "mp-" + "+mp-".join(b.split("+"))) for t, f, b in p]


CORE = _core()
GLASS_BACKDROPS = ("mp-bg", "mp-surface", "mp-hero")

KEYFRAME_OK = {"transform", "opacity", "translate", "scale", "rotate", "clip-path", "-webkit-clip-path",
               "stroke-dashoffset", "visibility", "offset-distance", "animation-timing-function"}
TRANSITION_OK = {"transform", "opacity", "translate", "scale", "rotate", "visibility", "clip-path", "stroke-dashoffset"}
PAINT_OK = {"color", "background-color", "border-color", "outline-color", "box-shadow", "fill", "stroke",
            "text-decoration-color", "outline-offset"}
EASING = {"ease", "linear", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end", "allow-discrete", "normal"}
WILL_CHANGE_OK = {"transform", "opacity", "auto", "clip-path"}
MAX_PAINT_MS, MAX_BLUR_PX, MAX_ITERATIONS, MIN_FONT_PX, MIN_WEIGHT, MAX_SHADOW_BLUR = 200, 24, 6, 12, 400, 24
# The two pages in GATED stay as they were picked, a record that is not edited, so they keep the old floor. Every other page has 12 (MP-182).
HISTORICAL_MIN_FONT_PX = 11
# They also keep the Claude component they were picked with, while Prism's moves with the shared figures (MP-185).
CLAUDE_FILE = "claude.html"
HOSTS = ("https://fonts.googleapis.com", "https://fonts.gstatic.com")
LAYOUT_KEYS = ("left", "top", "right", "bottom", "width", "height", "margin", "padding", "inset", "fontSize",
               "backgroundPosition", "filter", "backdropFilter", "boxShadow", "flexBasis")
GLASS_SELECTOR_BAN = re.compile(r"(chip|badge|\bmark\b|\btag\b|\.dot\b)", re.I)


class Fail(Exception):
    pass


# ---------------------------------------------------------------- reading the page

def page_parts(html: str) -> tuple[str, str, dict | None]:
    """(css, script, gates_json) from a page: every <style>, every executable <script>, the mp-design-gates block."""
    css = "\n".join(re.findall(r"<style[^>]*>(.*?)</style(?:\s[^>]*)?>", html, flags=re.S | re.I))
    scripts, gates = [], None
    for attrs, body in re.findall(r"<script([^>]*)>(.*?)</script(?:\s[^>]*)?>", html, flags=re.S | re.I):
        if 'id="mp-design-gates"' in attrs or "id='mp-design-gates'" in attrs:
            try:
                gates = json.loads(body)
            except json.JSONDecodeError as e:
                raise Fail(f"the mp-design-gates block is not valid JSON ({e})") from e
        elif "application/json" not in attrs and "application/ld+json" not in attrs:
            scripts.append(body)
    return css, "\n".join(scripts), gates


def rules(css: str) -> list[tuple[str, str, tuple[str, ...]]]:
    """Every rule as (selector, body, enclosing blocks), comments and statements dropped."""
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    out, start, stack = [], 0, []
    quote = None
    for i, ch in enumerate(css):
        if quote:
            if ch == quote and css[i - 1] != "\\":
                quote = None
            continue
        if ch in "\"'":
            quote = ch
        elif ch == "{":
            stack.append(" ".join(css[start:i].split(";")[-1].split()))
            start = i + 1
        elif ch == "}":
            if not stack:
                raise Fail("the CSS has a '}' with no block to close; it cannot be read")
            head = stack.pop()
            if not head.startswith("@"):
                out.append((head, css[start:i], tuple(stack)))
            start = i + 1
    if stack:
        raise Fail(f"the CSS leaves a block open ('{stack[-1]}'); it cannot be read")
    return out


def split_top(text: str, sep: str) -> list[str]:
    """Split on sep outside parentheses and quotes."""
    out, depth, cur, quote = [], 0, [], None
    for ch in text:
        if quote:
            cur.append(ch)
            if ch == quote:
                quote = None
            continue
        if ch in "\"'":
            quote = ch
        elif ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == sep and depth == 0:
            out.append("".join(cur))
            cur = []
        else:
            cur.append(ch)
    out.append("".join(cur))
    return [p.strip() for p in out if p.strip()]


def decls(body: str) -> list[tuple[str, str]]:
    out = []
    for part in split_top(body, ";"):
        if ":" in part and "{" not in part:
            k, v = part.split(":", 1)
            out.append((k.strip().lower() if not k.strip().startswith("--") else k.strip(), " ".join(v.split())))
    return out


def norm_sel(sel: str) -> list[str]:
    return [" ".join(s.replace("'", '"').split()) for s in split_top(sel, ",")]


DARK_MEDIA = re.compile(r"^@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)$", re.I)


def theme_blocks(rs) -> tuple[dict, dict, dict, list]:
    """(light, dark from the media query, dark from data-theme, the theme rules themselves)."""
    light, dmedia, dattr, used = {}, {}, {}, []
    for sel, body, enc in rs:
        sels = norm_sel(sel)
        if not enc and ":root" in sels:
            light.update({k: v for k, v in decls(body) if k.startswith("--")})
            used.append((sel, body, enc))
        elif not enc and ':root[data-theme="dark"]' in sels:
            dattr.update({k: v for k, v in decls(body) if k.startswith("--")})
            used.append((sel, body, enc))
        elif len(enc) == 1 and DARK_MEDIA.match(enc[0]) and ':root:not([data-theme="light"])' in sels:
            dmedia.update({k: v for k, v in decls(body) if k.startswith("--")})
            used.append((sel, body, enc))
    return light, dmedia, dattr, used


# ---------------------------------------------------------------- colour

def parse_colour(v: str) -> tuple[float, float, float, float]:
    s = v.strip().lower()
    if s == "transparent":
        return (0.0, 0.0, 0.0, 0.0)
    if s in ("white", "#fff"):
        s = "#ffffff"
    if s == "black":
        s = "#000000"
    m = re.fullmatch(r"#([0-9a-f]{3,8})", s)
    if m:
        h = m.group(1)
        if len(h) in (3, 4):
            h = "".join(c * 2 for c in h)
        if len(h) not in (6, 8):
            raise Fail(f"cannot read the colour '{v}'")
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)
    m = re.fullmatch(r"rgba?\((.*)\)", s)
    if m:
        parts = [p for p in re.split(r"[\s,/]+", m.group(1).strip()) if p]
        if len(parts) not in (3, 4):
            raise Fail(f"cannot read the colour '{v}'")

        def chan(p):
            return float(p[:-1]) * 2.55 if p.endswith("%") else float(p)

        try:
            r, g, b = (chan(p) for p in parts[:3])
            a = (float(parts[3][:-1]) / 100 if parts[3].endswith("%") else float(parts[3])) if len(parts) == 4 else 1.0
        except ValueError as e:
            raise Fail(f"cannot read the colour '{v}'") from e
        return (r, g, b, a)
    raise Fail(f"cannot read the colour '{v}' (use hex, rgb(), rgba() or var() of a token)")


def resolve(name: str, theme: dict, seen: tuple = ()) -> tuple[float, float, float, float]:
    key = name if name.startswith("--") else "--" + name
    if key in seen:
        raise Fail(f"{key} refers to itself through var()")
    if key not in theme:
        raise Fail(f"{key} is not defined in this theme")
    v = theme[key].strip()
    m = re.fullmatch(r"var\(\s*(--[\w-]+)\s*(?:,.*)?\)", v)
    if m:
        return resolve(m.group(1), theme, seen + (key,))
    return parse_colour(v)


def over(fg, bg):
    a = fg[3] + bg[3] * (1 - fg[3])
    if a == 0:
        return (0.0, 0.0, 0.0, 0.0)
    return tuple((fg[i] * fg[3] + bg[i] * bg[3] * (1 - fg[3])) / a for i in range(3)) + (a,)


def stack(expr: str, theme: dict):
    layers = [resolve(t.strip(), theme) for t in expr.split("+")]
    out = layers[-1]
    for c in reversed(layers[:-1]):
        out = over(c, out)
    return out


def lum(c) -> float:
    def ch(v):
        v = v / 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2])


def ratios(fg, bg) -> tuple[float, float]:
    hi, lo = sorted((lum(fg), lum(bg)), reverse=True)
    return (hi + 0.05) / (lo + 0.05), (DIM * hi + 0.05) / (DIM * lo + 0.05)


def measure(tier: str, fg_expr: str, bg_expr: str, theme: dict):
    bg = stack(bg_expr, theme)
    if bg[3] < 0.999:
        raise Fail(f"the ground '{bg_expr}' is not opaque; name what lies under it (a+b)")
    fg = over(stack(fg_expr, theme), bg)
    full, dim = ratios(fg, bg)
    need_full, need_dim = LIMITS[tier]
    return full, dim, full + 1e-9 >= need_full and dim + 1e-9 >= need_dim


# ---------------------------------------------------------------- the checks

def contrast(css: str, gates: dict | None) -> tuple[list[str], list[tuple]]:
    fails, rows = [], []
    if gates is None:
        return ["no mp-design-gates JSON block: the page's own pairs and glass cannot be measured"], rows
    rs = rules(css)
    light, dmedia, dattr, used = theme_blocks(rs)
    if not light:
        fails.append("no top-level :root block: the light theme cannot be measured")
    if not dmedia:
        fails.append('no :root:not([data-theme="light"]) block inside @media (prefers-color-scheme: dark)')
    if not dattr:
        fails.append('no :root[data-theme="dark"] block')
    if fails:
        return fails, rows
    if dmedia != dattr:
        diff = sorted(set(dmedia.items()) ^ set(dattr.items()))
        fails.append(f"the two dark blocks differ ({', '.join(k for k, _ in diff[:6])}); the toggle and the system must match")
    for t in CONTRACT:
        if f"--mp-{t}" not in light:
            fails.append(f"--mp-{t} is not defined on :root (the token contract)")
    fails += one_system(light, dmedia)
    pairs = list(CORE)
    for p in gates.get("pairs", []):
        if not (isinstance(p, list) and len(p) == 3 and p[0] in LIMITS and all(isinstance(x, str) for x in p)):
            fails.append(f"declared pair {p!r} is not [tier, foreground, ground] with a known tier")
            continue
        pairs.append((p[0], p[1].removeprefix("--"), p[2].removeprefix("--")))
    glass = gates.get("glass")
    uses_glass = bool(re.search(r"backdrop-filter\s*:", css))
    if uses_glass and not glass:
        fails.append("the page uses backdrop-filter but declares no glass in its mp-design-gates block")
    if glass:
        fill = str(glass.get("fill", "")).removeprefix("--")
        backs = [str(b).removeprefix("--") for b in glass.get("backdrops", [])]
        for need in GLASS_BACKDROPS:
            if need not in backs:
                fails.append(f"glass backdrops must include {need}")
        for lab in glass.get("labels", []):
            if not (isinstance(lab, list) and len(lab) == 2 and lab[0] in LIMITS):
                fails.append(f"glass label {lab!r} is not [tier, token]")
                continue
            for b in backs:
                pairs.append((lab[0], lab[1].removeprefix("--"), f"{fill}+{b}"))
        if not glass.get("labels"):
            fails.append("glass declares no labels to measure")
    measured = {"--" + t for _, f, b in pairs for t in (f + "+" + b).split("+")}
    for sel, body, enc in rs:
        if (sel, body, enc) in used:
            continue
        for k, _ in decls(body):
            if k in measured:
                fails.append(f"{k} is set in '{sel}'{' inside ' + enc[0] if enc else ''}, outside the three theme "
                             "blocks, so what that element shows is not measured")
    themes = {"light": light, "dark": {**light, **dmedia}}
    for tier, f, b in pairs:
        for name, theme in themes.items():
            try:
                full, dim, ok = measure(tier, f, b, theme)
            except Fail as e:
                fails.append(f"{name}: {tier} {f} on {b}: {e}")
                continue
            rows.append((name, tier, f, b, full, dim, ok))
            if not ok:
                nf, nd = LIMITS[tier]
                fails.append(f"{name}: {tier} {f} on {b} is {full:.2f}:1 full and {dim:.2f}:1 at 20% "
                             f"(needs {nf}:1 and {nd}:1)")
    return fails, rows


def ms(value: str, root: dict) -> list[float]:
    out = []
    for m in re.finditer(r"var\(\s*(--[\w-]+)\s*\)|(-?\d*\.?\d+)(ms|s)\b", value):
        if m.group(1):
            v = root.get(m.group(1))
            if v is None:
                raise Fail(f"{m.group(1)} in '{value}' is not defined on :root")
            out += ms(v, root)
        else:
            out.append(float(m.group(2)) * (1000 if m.group(3) == "s" else 1))
    return out


def transition_props(value: str) -> list[tuple[str, str]]:
    """(property, the segment) for each comma-separated transition; a segment that names none means all."""
    out = []
    for seg in split_top(value, ","):
        prop = "all"
        for tok in split_top(seg, " "):
            t = tok.lower()
            if re.fullmatch(r"-?[a-z][a-z-]*", t) and t not in EASING:
                prop = t
                break
        out.append((prop, seg))
    return out


def motion(css: str, script: str) -> list[str]:
    fails = []
    rs = rules(css)
    root = {}
    for sel, body, enc in rs:
        if not enc and ":root" in norm_sel(sel):
            root.update(dict(decls(body)))
    has_reduce = any(re.search(r"prefers-reduced-motion\s*:\s*reduce", e, re.I) for _, _, enc in rs for e in enc)
    if not has_reduce:
        fails.append("no @media (prefers-reduced-motion: reduce) block")
    if re.search(r"backdrop-filter\s*:", css) and not any(
            re.search(r"prefers-reduced-transparency\s*:\s*reduce", e, re.I) for _, _, enc in rs for e in enc):
        fails.append("backdrop-filter is used with no @media (prefers-reduced-transparency: reduce) fallback")
    cv = False
    for sel, body, enc in rs:
        in_reduce = any(re.search(r"prefers-reduced-motion", e, re.I) for e in enc)
        keyframes = next((e for e in enc if e.lower().startswith(("@keyframes", "@-webkit-keyframes"))), None)
        d = [(VENDOR.sub("", k), v) for k, v in decls(body)]
        props = {k for k, _ in d}
        if "content-visibility" in props and dict(d)["content-visibility"].startswith("auto") \
                and "contain-intrinsic-size" in props:
            cv = True
        for k, v in d:
            lv = v.lower()
            if keyframes:
                if k not in KEYFRAME_OK:
                    fails.append(f"{keyframes} animates '{k}': only transform and opacity (clip-path or "
                                 "stroke-dashoffset for a chart drawing in) run on the compositor")
                continue
            if k in ("transition", "transition-property"):
                if in_reduce:
                    continue
                if k == "transition-property":
                    segs = [(p.strip().lower(), v) for p in split_top(v, ",")]
                    dur = ms(dict(d).get("transition-duration", "0s"), root)
                else:
                    segs = transition_props(v)
                    dur = None
                for prop, seg in segs:
                    if prop == "none":
                        continue
                    if prop == "all" or "*" in sel.split(","):
                        fails.append(f"'{sel}' transitions all properties ('{k}: {v}'); name transform or opacity")
                    elif prop in PAINT_OK:
                        longest = max(dur if dur is not None else ms(seg, root)[:1] or [0.0])
                        if longest > MAX_PAINT_MS:
                            fails.append(f"'{sel}' transitions {prop} for {longest:.0f} ms; paint-only "
                                         f"transitions stay at or under {MAX_PAINT_MS} ms")
                    elif prop not in TRANSITION_OK:
                        fails.append(f"'{sel}' transitions '{prop}', which is layout or an expensive paint")
            elif k in ("animation", "animation-iteration-count"):
                if in_reduce:
                    continue
                if "infinite" in lv:
                    fails.append(f"'{sel}' loops forever ('{k}: {v}'); stop after at most {MAX_ITERATIONS}")
                counts = [float(x) for x in re.findall(r"(?<![\w.#-])(\d+(?:\.\d+)?)(?![\w.%-])", lv)
                          if k == "animation-iteration-count" or not re.search(r"\d+(?:\.\d+)?m?s", x)]
                if k == "animation-iteration-count" and counts and max(counts) > MAX_ITERATIONS:
                    fails.append(f"'{sel}' repeats {max(counts):g} times; at most {MAX_ITERATIONS}")
                if k == "animation":
                    for seg in split_top(lv, ","):
                        bare = [t for t in split_top(seg, " ") if re.fullmatch(r"\d+(\.\d+)?", t)]
                        if bare and max(float(b) for b in bare) > MAX_ITERATIONS:
                            fails.append(f"'{sel}' repeats {max(float(b) for b in bare):g} times; at most {MAX_ITERATIONS}")
            elif k == "will-change":
                bad = [p for p in (x.strip() for x in lv.split(",")) if p not in WILL_CHANGE_OK]
                if bad:
                    fails.append(f"'{sel}' sets will-change: {', '.join(bad)}; only transform or opacity")
            elif k in ("backdrop-filter", "-webkit-backdrop-filter") and lv != "none":
                if GLASS_SELECTOR_BAN.search(sel):
                    fails.append(f"'{sel}' puts glass on a chip, badge or mark; glass is for the control layer")
                for arg in blur_args(lv):
                    vm = re.fullmatch(r"var\(\s*(--[\w-]+)\s*\)", arg)
                    if vm:
                        arg = root.get(vm.group(1), "")
                        if not arg:
                            fails.append(f"'{sel}': {vm.group(1)} is not defined on :root, so its blur is unknown")
                            continue
                    pm = re.fullmatch(r"(\d*\.?\d+)px", arg.strip())
                    if not pm:
                        fails.append(f"'{sel}': cannot read the blur '{arg}'")
                    elif float(pm.group(1)) > MAX_BLUR_PX:
                        fails.append(f"'{sel}' blurs {pm.group(1)} px; at most {MAX_BLUR_PX}")
            if k in ("font-size", "font"):
                why = font_problem(v, k == "font", sel)
                if why:
                    fails.append(f"'{sel}' {why}")
            if k in ("font-weight", "font"):
                why = weight_problem(v, k == "font")
                if why:
                    fails.append(f"'{sel}' {why}")
    if not cv:
        fails.append("no rule sets content-visibility: auto with a contain-intrinsic-size; long pages must skip "
                     "off-screen boards")
    fails += script_checks(script)
    return fails


def blur_args(value: str) -> list[str]:
    """The argument of each blur() in a filter value, parentheses balanced (blur(var(--x)) reads var(--x))."""
    out = []
    for m in re.finditer(r"blur\(", value):
        depth, i = 1, m.end()
        while i < len(value) and depth:
            depth += {"(": 1, ")": -1}.get(value[i], 0)
            i += 1
        out.append(value[m.end():i - 1].strip())
    return out


KEYWORDS = {"inherit", "initial", "unset", "revert"}


def font_problem(v: str, shorthand: bool, sel: str = "") -> str | None:
    """Why a text size fails, or None. A form the gate cannot read is a failure, never a skip (lesson 8)."""
    v = re.sub(r"\s*!important\s*$", "", v.strip(), flags=re.I)
    if v.lower() in KEYWORDS:
        return None
    toks = split_top(v, " ")
    if shorthand:
        size = next((t for t in toks if re.match(r"(\d*\.?\d+[a-z%]+|calc\(|clamp\(|min\(|max\(|var\()", t.lower())
                     and not t.lower().startswith("var(--font")), None)
        if size is None:
            return f"sets a font with no size the gate can read ('{v}')"
        size = size.split("/")[0]
    else:
        size = v
    low = size.strip().lower()
    m = re.fullmatch(r"(\d*\.?\d+)(px|rem|pt)", low)
    c = re.fullmatch(r"clamp\(\s*(\d*\.?\d+)(px|rem)\s*,.*\)", low)
    if m or c:
        num, unit = (m or c).groups()
        px = float(num) * {"px": 1, "rem": 16, "pt": 4 / 3}[unit]
        return None if px >= MIN_FONT_PX else f"sets text at {px:g} px; at least {MIN_FONT_PX}"
    if sel.strip() in RELATIVE_OK:
        return None
    return f"sets a text size the gate cannot read ('{size}'); use px, rem, pt or a clamp() with a px floor"


def weight_problem(v: str, shorthand: bool) -> str | None:
    v = re.sub(r"\s*!important\s*$", "", v.strip(), flags=re.I)
    low = v.lower()
    if low in KEYWORDS or low in ("normal", "bold", "bolder"):
        return None
    if low == "lighter":
        return f"sets font weight lighter; at least {MIN_WEIGHT}"
    for t in split_top(low, " "):
        t = t.strip()
        if re.fullmatch(r"\d{1,4}", t):
            return None if int(t) >= MIN_WEIGHT else f"sets font weight {t}; at least {MIN_WEIGHT}"
        if t == "lighter":
            return f"sets font weight lighter; at least {MIN_WEIGHT}"
        if shorthand:
            continue
        return f"sets a font weight the gate cannot read ('{v}')"
    return None


def script_checks(script: str) -> list[str]:
    fails = []
    if re.search(r"addEventListener\(\s*['\"]scroll['\"]|\bonscroll\s*=", script):
        fails.append("a scroll handler: start arrivals from an IntersectionObserver instead")
    if re.search(r"\bsetInterval\s*\(", script):
        fails.append("setInterval: nothing loops on a timer; use requestAnimationFrame that ends")
    for m in re.finditer(r"\.animate\(", script):
        window = script[m.end():m.end() + 600]
        end = window.find("})")
        window = window[: end if end > 0 else 600]
        for key in LAYOUT_KEYS:
            if re.search(rf"[{{,\s]['\"]?{key}['\"]?\s*:", window):
                fails.append(f"a Web Animation moves '{key}'; animate transform or opacity")
                break
    return fails


def shared_tokens() -> tuple[dict, dict, dict]:
    """(light, dark, both) from shared/tokens.css, the values both hybrids must carry word for word."""
    text = re.sub(r"/\*.*?\*/", lambda m: m.group(0) if m.group(0).startswith(("/* LIGHT", "/* DARK", "/* BOTH")) else "",
                  (SHARED / "tokens.css").read_text(), flags=re.S)
    light, rest = text.split("/* DARK", 1)
    dark, both = rest.split("/* BOTH", 1)
    read = lambda t: {k: " ".join(v.split()) for k, v in re.findall(r"(--mp-[\w-]+):\s*([^;]+);", t)}
    return read(light), read(dark), read(both)


def one_system(light: dict, dark: dict) -> list[str]:
    fails = []
    try:
        s_light, s_dark, s_both = shared_tokens()
    except (OSError, ValueError) as e:
        return [f"shared/tokens.css cannot be read ({e})"]
    for name, want, have in (("light", {**s_light, **s_both}, light), ("dark", {**s_light, **s_both, **s_dark}, {**light, **dark})):
        for k, v in want.items():
            if " ".join(have.get(k, "").split()).lower() != v.lower():
                fails.append(f"{name}: {k} is '{have.get(k)}', which differs from shared/tokens.css ('{v}')")
    return fails


def shadow_problems(sel: str, value: str) -> list[str]:
    out = []
    for layer in split_top(value, ","):
        toks = split_top(layer, " ")
        nums = [float(re.sub(r"px$", "", t)) for t in toks if re.fullmatch(r"-?\d*\.?\d+(px)?", t)]
        if len(nums) >= 3 and nums[2] > 0:
            if nums[0] == 0 and nums[1] == 0:
                out.append(f"'{sel}' has a soft halo ('{layer}'): a shadow needs an offset, and an edge stays sharp")
            if nums[2] > MAX_SHADOW_BLUR:
                out.append(f"'{sel}' blurs a shadow {nums[2]:g} px ('{layer}'); at most {MAX_SHADOW_BLUR}")
    return out


def sharpness(css: str) -> list[str]:
    fails = []
    for sel, body, enc in rules(css):
        for k, v in decls(body):
            lv = v.lower()
            if k == "text-shadow" and lv != "none":
                fails.append(f"'{sel}' sets a text shadow, which blurs the glyph's edge")
            if k in ("filter", "-webkit-filter") and "blur(" in lv:
                fails.append(f"'{sel}' sets a blur filter, which softens every edge under it")
            if "radial-gradient(" in lv:
                fails.append(f"'{sel}' uses a radial gradient, a bloom with no edge; draw a sharp facet instead")
            if k == "box-shadow" or k.startswith("--mp-elev"):
                fails += shadow_problems(sel, v)
    return fails


def sprite_of(text: str) -> str | None:
    m = re.search(r'<svg id="mp-icons".*?</svg>', text, flags=re.S)
    return " ".join(m.group(0).split()) if m else None


def claude_of(text: str) -> str | None:
    m = re.search(r"<!-- mp-claude:start -->.*?<!-- mp-claude:end -->", text, flags=re.S)
    return m.group(0) if m else None


def icons_and_claude(html: str, css: str) -> list[str]:
    fails = []
    if re.search(r"Material[ +]Symbols|Material[ +]Icons", html):
        fails.append("an icon font is loaded; fonts blur at small sizes, so icons come from the shared SVG sprite")
    if re.search(r"""<[a-z]+[^>]*class=["'](?:[^"']*\s)?ms(?:\s[^"']*)?["']""", html):
        fails.append("a leftover icon-font span (class ms): with no font it prints its name as a word")
    for g in ("▲", "▼", "✓", "✔", "✕", "✖", "⚠"):
        if g in html:
            fails.append(f"the Unicode glyph {g} stands in for an icon; use the sprite")
    try:
        want_sprite, want_claude = (SHARED / "icons.svg").read_text(), (SHARED / CLAUDE_FILE).read_text()
    except OSError as e:
        return fails + [f"a shared file cannot be read ({e})"]
    have = sprite_of(html)
    ids = set(re.findall(r'<symbol id="i-([a-z0-9-]+)"', want_sprite))
    if have is None:
        fails.append("the shared icon sprite <svg id=\"mp-icons\"> is not in the page")
    elif have != sprite_of(want_sprite):
        fails.append("the page's icon sprite differs from shared/icons.svg")
    for ref in sorted(set(re.findall(r"#i-([a-z0-9-]+)", html))):
        if ref not in ids:
            fails.append(f"#i-{ref} has no symbol in the sprite")
    icon_rules = [dict(decls(b)) for sel, b, _ in rules(css) if ".i" in norm_sel(sel)]
    if not any(r.get("stroke-linecap") == "square" and r.get("stroke-linejoin") == "miter" for r in icon_rules):
        fails.append("no .i rule sets square caps and mitred joins, so icons would render soft")
    block = claude_of(html)
    if block is None:
        fails.append("no Claude component between the mp-claude markers")
    elif block != claude_of(want_claude):
        fails.append("the page's Claude component differs from shared/claude.html")
    for k in ("--cl-s1", "--cl-s2", "--cl-s3"):
        if f"{k}:" not in css.replace(f"{k}: ", f"{k}:"):
            fails.append(f"{k}, a shape of the Claude mark, is not set")
    return fails


def markup(html: str) -> list[str]:
    fails = []
    if not re.search(r"<title>[^<]+</title>", html[:8192], re.I):
        fails.append("no <title> in the first 8 KB")
    for tag in ("html", "head", "body"):
        if re.search(rf"<{tag}[\s>]", html, re.I):
            fails.append(f"a <{tag}> tag: the artifact host adds the skeleton")
    for m in re.finditer(r"""(?:<script[^>]*\ssrc|<link[^>]*\shref)\s*=\s*["']([^"']+)|url\(\s*["']?(https?://[^"')]+)|@import\s+(?:url\()?\s*["']([^"']+)""",
                         html, re.I):
        url = next(g for g in m.groups() if g)
        if url.startswith(("data:", "#")) or url.startswith(HOSTS):
            continue
        fails.append(f"an external load from {url}; only Google Fonts may load")
    for m in re.finditer(r"""font-size\s*=\s*["'](\d*\.?\d+)""", html):
        if float(m.group(1)) < MIN_FONT_PX:
            fails.append(f"an SVG text at font-size {m.group(1)}; draw labels at {MIN_FONT_PX} px or more")
    for m in re.finditer(r"""style\s*=\s*(?:"([^"]*)"|'([^']*)')""", html):
        body = m.group(1) if m.group(1) is not None else m.group(2)
        # decls() drops a part holding a brace, and a value computed in the script holds one: read those here too
        for k, v in [tuple(p.split(":", 1)) for p in split_top(body, ";") if ":" in p]:
            k, v = VENDOR.sub("", k.strip().lower()), " ".join(v.split())
            if k in ("animation", "animation-iteration-count") and "infinite" in v.lower():
                fails.append(f"an inline style loops forever ('{k}: {v}'); stop after at most {MAX_ITERATIONS}")
            if "${" in v or "${" in k:
                if re.search(r"\banimation\b[^;]*\binfinite\b", k + " " + v):
                    fails.append(f"an inline style loops forever inside a computed value ('{v}')")   # a value computed in the script; the rendered size is measured by the walker
                continue
            if k in ("font-size", "font"):
                why = font_problem(v, k == "font")
                if why:
                    fails.append(f"an inline style {why}")
            if k == "transition":
                for prop, _ in transition_props(v):
                    if prop == "all":
                        fails.append(f"an inline style transitions all properties ('{v}')")
                    elif prop != "none" and prop not in TRANSITION_OK and prop not in PAINT_OK:
                        fails.append(f"an inline style transitions '{prop}', which is layout or an expensive paint")
    return fails


def prism_core(html: str) -> tuple[list[str], str, str]:
    """What can drift on any page made from Prism: tokens, MA's ink and fonts, the icon set. (fails, css, script)."""
    fails = []
    try:
        css, script, _ = page_parts(html)
        rules(css)
    except Fail as e:
        return [str(e)], "", ""
    try:
        tokens = json.loads((PRISM / "tokens.json").read_text())
        want_css = (PRISM / "tokens.css").read_text()
        want_icons = (PRISM / "icons.svg").read_text()
    except (OSError, ValueError) as e:
        return [f"a Prism source file cannot be read ({e})"], "", ""
    block = re.search(r"/\* prism-tokens:start \*/.*?/\* prism-tokens:end \*/", css, flags=re.S)
    if block is None:
        fails.append("the generated tokens are not in the page between the prism-tokens markers")
    elif block.group(0).strip() != want_css.strip():
        fails.append("the page's tokens differ from tokens.css; paste the generated block, word for word")
    ink = tokens["color"]["ink"]
    for name, (light, dark) in MA_INK.items():
        t = ink.get(name, {})
        if (t.get("$value"), t.get("$extensions", {}).get("mp", {}).get("dark")) != (light, dark):
            fails.append(f"tokens.json {name} is not MA's ink ({light}, {dark})")
    for ban, why in (("--ink-3", "a third ink: MA's Home board uses two"), ("Bricolage", "round 1's display face"),
                     ("Instrument Sans", "round 1's text face"), ("font-variation-settings", "a variable-font axis MA's faces do not use"),
                     ("--font-display", "round 1's display variable"), ("Material Symbols", "an icon font")):
        if ban in html:
            fails.append(f"{ban} is in the page: {why}")
    for name, face in (("--font-figure", "Nunito"), ("--font-text", "Inter")):
        m = re.search(rf"{name}\s*:\s*([^;]+);", css)
        if m is None or face not in m.group(1):
            fails.append(f"{name} is not set to MA's stack with {face}")
    for link in re.findall(r"""fonts\.googleapis\.com/css2\?([^"']+)""", html):
        for fam in re.findall(r"family=([A-Za-z+]+)", link):
            if fam not in ("Inter", "Nunito"):
                fails.append(f"Google Fonts loads {fam.replace('+', ' ')}; only Inter and Nunito")
    for g in ("▲", "▼", "✓", "✔", "✕", "✖", "⚠"):
        if g in html:
            fails.append(f"the Unicode glyph {g} stands in for an icon; use the icon set")
    m = re.search(r'<svg id="prism-icons".*?</svg>', html, flags=re.S)
    w = re.search(r'<svg id="prism-icons".*?</svg>', want_icons, flags=re.S)
    if m is None:
        fails.append("the Prism icon set <svg id=\"prism-icons\"> is not in the page")
    elif " ".join(m.group(0).split()) != " ".join(w.group(0).split()):
        fails.append("the page's icon set differs from docs/design/prism/icons.svg")
    ids = set(re.findall(r'<symbol id="i-([a-z0-9-]+)"', want_icons))
    for ref in sorted(set(re.findall(r"#i-([a-z0-9-]+)", html))):
        if ref not in ids:
            fails.append(f"#i-{ref} has no symbol in the icon set")
    ico = [dict(decls(b)) for sel, b, _ in rules(css) if ".ico" in norm_sel(sel)]
    if not any(r.get("stroke-linecap") == "square" and r.get("stroke-linejoin") == "miter" for r in ico):
        fails.append("no .ico rule sets square ends and mitred corners, so icons would render soft")
    for k in ("--cl-s1", "--cl-s2", "--cl-s3"):
        if not re.search(rf"{k}\s*:", css):
            fails.append(f"{k}, a shape of the Claude mark, is not set")
    names = set(re.findall(r"^\s*(--[\w-]+)\s*:", want_css, flags=re.M))
    rest = css.replace(want_css.strip(), "", 1)   # only the generated block may set a token, however a rule is written
    for sel, body, enc in rules(rest):
        for k, _ in decls(body):
            if k in names:
                fails.append(f"{k} is set in '{sel.strip()}'{' inside ' + enc[0] if enc else ''}, outside tokens.css; "
                             "a value that changes goes in tokens.json")
    for k in sorted(names):
        if re.search(rf"""style\s*=\s*["'][^"']*{re.escape(k)}\s*:""", html) or re.search(rf"""setProperty\(\s*['"]{re.escape(k)}['"]""", html):
            fails.append(f"{k} is set inline or by a script, outside tokens.css; a value that changes goes in tokens.json")
    return fails, css, script


def check_prism(html: str) -> list[str]:
    """What the owner asked of the picked system, read from the page and from tokens.json."""
    fails, css, script = prism_core(html)
    if not css:
        return fails
    try:
        want_claude = (SHARED / "claude.html").read_text()
    except OSError as e:
        return [f"a Prism source file cannot be read ({e})"]
    index = next((n for n in re.findall(r"<nav\b.*?</nav>", html, flags=re.S) if "Principles" in n), None)
    if index is None:
        fails.append("no section index: a <nav> listing the twelve sections")
    else:
        labels = [re.sub(r"<[^>]+>", "", x).strip() for x in re.findall(r"<a\b[^>]*>(.*?)</a>", index, flags=re.S)]
        if tuple(labels) != SECTIONS:
            fails.append(f"the section index reads {labels}; the owner's order is {list(SECTIONS)}")
    block = claude_of(html)
    if block is None:
        fails.append("no Claude component between the mp-claude markers")
    elif block != claude_of(want_claude):
        fails.append("the page's Claude component differs from shared/claude.html")
    return markup(html) + fails + motion(css, script)


JOURNEY_HEAD = re.compile(r"/\* -{10} journey: ([a-z]+) -{10} \*/")


def check_journeys(html: str, ids: tuple[str, ...] = JOURNEY_IDS) -> list[str]:
    """The journeys page: what can drift from Prism, and all ten journeys (Track record joined in MP-187, Tap to show in MP-205), each with one recommended option."""
    fails, css, script = prism_core(html)
    if not css:
        return fails
    heads = JOURNEY_HEAD.findall(script)
    if tuple(heads) != ids:
        fails.append(f"the page holds journeys {heads}; the {'ten' if ids == JOURNEY_IDS else len(ids)}, in order, are {list(ids)}")
    if ids == JOURNEY_IDS and "__prismFlipless" in script:
        fails.append("the journeys page says it has no flip, and the owner kept both options with a flip")
    for name, body in zip(heads, JOURNEY_HEAD.split(script)[2::2]):
        if len(re.findall(r"\bJ\.add\(", body)) != 1:
            fails.append(f"journey {name} does not register once with J.add()")
        recs = len(re.findall(r"\brec\s*:\s*true\b", body))
        if recs != 1:
            fails.append(f"journey {name} recommends {recs} options; exactly one")
        if not re.search(r"\bstories\s*:\s*\[\s*['\"]MP-\d+", body):
            fails.append(f"journey {name} names no stories")
    return markup(html) + fails + motion(css, script)


def check_page(html: str) -> tuple[list[str], list[tuple]]:
    try:
        css, script, gates = page_parts(html)
        cfails, rows = contrast(css, gates)
        return markup(html) + cfails + motion(css, script) + sharpness(css) + icons_and_claude(html, css), rows
    except Fail as e:
        return [str(e)], []


def check(paths: list[str]) -> int:
    global MIN_FONT_PX, CLAUDE_FILE
    targets = paths or [*GATED, PICKED, JOURNEYS, ADMIN]
    extra = [str(p.relative_to(ROOT)) for p in (ROOT / "docs/design").rglob("*.html")
             if 'id="mp-design-gates"' in p.read_text(errors="ignore")] if not paths else []
    bad = 0
    for rel in dict.fromkeys(targets + extra):
        p = ROOT / rel if not Path(rel).is_absolute() else Path(rel)
        if not p.is_file():
            print(f"FAIL {rel}: the page is missing")
            bad += 1
            continue
        if rel == PICKED or p == ROOT / PICKED:
            fails, rows = check_prism(p.read_text()), None
        elif rel == JOURNEYS or p == ROOT / JOURNEYS:
            fails, rows = check_journeys(p.read_text()), "journeys"
        elif rel == ADMIN or p == ROOT / ADMIN:
            fails, rows = check_journeys(p.read_text(), ADMIN_IDS), "admin"
        else:
            frozen = p.resolve() in [(ROOT / g).resolve() for g in GATED]
            kept, kept_claude = MIN_FONT_PX, CLAUDE_FILE
            if frozen:
                MIN_FONT_PX, CLAUDE_FILE = HISTORICAL_MIN_FONT_PX, "claude-at-pick.html"
            try:
                fails, rows = check_page(p.read_text())
            finally:
                MIN_FONT_PX, CLAUDE_FILE = kept, kept_claude
        for f in fails:
            print(f"FAIL {rel}: {f}")
        bad += len(fails)
        if not fails and rows == "admin":
            print(f"design-gates: {rel}: the admin journeys, Prism's tokens, ink, fonts and icons hold; motion rules hold")
        elif not fails and rows == "journeys":
            print(f"design-gates: {rel}: the ten journeys, Prism's tokens, ink, fonts and icons hold; motion rules hold")
        elif not fails and rows is None:
            print(f"design-gates: {rel}: MA's ink and fonts, the tokens, icons, sections and Claude hold; motion rules hold")
        elif not fails:
            print(f"design-gates: {rel}: {len(rows)} pair measurements pass at full and 20% brightness; motion rules hold")
    return 1 if bad else 0


def report(path: str) -> int:
    fails, rows = check_page((ROOT / path).read_text())
    print("| Theme | Tier | Foreground | Ground | Full | 20% | Pass |\n| --- | --- | --- | --- | ---: | ---: | --- |")
    for theme, tier, f, b, full, dim, ok in rows:
        print(f"| {theme} | {tier} | {f} | {b} | {full:.2f} | {dim:.2f} | {'yes' if ok else 'NO'} |")
    for f in fails:
        print(f"FAIL: {f}")
    return 1 if fails else 0


# ---------------------------------------------------------------- selftest

IDENTITY_LIGHT = {
    "hero-mark": "#FFB547", "hero-band": "rgba(255, 181, 71, 0.36)", "forecast": "#6B3F00",
    "band-80": "rgba(245, 165, 36, 0.57)", "band-50": "rgba(196, 108, 0, 0.48)", "outcome": "#07592F",
    "scenario": "#4A2FA0", "ai": "#B85F00",
}
IDENTITY_DARK = {
    "hero-mark": "#FFB547", "hero-band": "rgba(255, 181, 71, 0.36)", "forecast": "#FFD27A",
    "band-80": "rgba(255, 181, 71, 0.34)", "band-50": "rgba(255, 181, 71, 0.31)", "outcome": "#86EFB0",
    "scenario": "#D3C6FF", "ai": "#FFC24D",
}


def good_page() -> str:
    s_light, s_dark, s_both = shared_tokens()
    def block(*ds):
        out = []
        for d in ds:
            out += [f"{k if k.startswith('--') else '--mp-' + k}: {v};" for k, v in d.items()]
        return " ".join(out)
    light, dark = block(s_light, s_both, IDENTITY_LIGHT), block(s_dark, IDENTITY_DARK)
    gates = {"pairs": [["text", "mp-ink-2", "mp-chip-bg"]],
             "glass": {"fill": "mp-glass", "backdrops": ["mp-bg", "mp-surface", "mp-hero", "mp-accent"],
                       "labels": [["body", "mp-ink"], ["text", "mp-ink-2"]]}}
    return f"""<title>Selftest page</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap">
<style>
:root {{ {light} --mp-chip-bg: #F6F8FB; --mo-fast: 180ms; --blur: 18px; --cl-s1: polygon(0 50%, 100% 8%, 100% 36%); --cl-s2: polygon(0 50%, 100% 40%, 100% 60%); --cl-s3: polygon(0 50%, 100% 64%, 100% 92%); color-scheme: light; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ {dark} --mp-chip-bg: #1A1538; color-scheme: dark; }} }}
:root[data-theme="dark"] {{ {dark} --mp-chip-bg: #1A1538; color-scheme: dark; }}
body {{ background: var(--mp-canvas); color: var(--mp-ink); font: 400 17px/22px Inter, sans-serif; }}
.cap {{ font-size: 12px; font-weight: 500; }}
.i {{ width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: square; stroke-linejoin: miter; }}
.btn {{ transition: transform var(--mo-fast) ease, background-color 150ms linear; }}
.btn:active {{ transform: scale(0.97); }}
.card {{ box-shadow: 0 0 0 var(--mp-hair) var(--mp-edge), var(--mp-elev-1); }}
.tabbar {{ background: var(--mp-glass); backdrop-filter: blur(var(--blur)) saturate(1.8); }}
.board {{ content-visibility: auto; contain-intrinsic-size: auto 900px; }}
.skel {{ animation: pulse 1.3s ease-in-out 3 both; }}
.lens {{ will-change: transform; }}
@keyframes pulse {{ 0% {{ opacity: 1; }} 50% {{ opacity: 0.5; }} 100% {{ opacity: 1; }} }}
@keyframes draw {{ from {{ clip-path: inset(0 100% 0 0); }} to {{ clip-path: inset(0 0 0 0); }} }}
@media (prefers-reduced-motion: reduce) {{ * {{ animation-duration: 1ms !important; transition: opacity 150ms linear !important; }} }}
@media (prefers-reduced-transparency: reduce) {{ .tabbar {{ background: var(--mp-surface); backdrop-filter: none; }} }}
</style>
<script type="application/json" id="mp-design-gates">{json.dumps(gates)}</script>
{(SHARED / "icons.svg").read_text()}
<div class="board"><svg class="i"><use href="#i-home"/></svg><svg viewBox="0 0 10 10"><text font-size="12">x</text></svg></div>
{(SHARED / "claude.html").read_text()}
<script>
const io = new IntersectionObserver(() => {{}});
lens.animate([{{ transform: 'translateX(0)' }}, {{ transform: 'translateX(40px)' }}], {{ duration: 340 }});
</script>
"""


def _sub(old: str, new: str, count: int = 1):
    def f(page: str) -> str:
        if old not in page:
            raise AssertionError(f"selftest mutation target not found: {old!r}")
        return page.replace(old, new, count)
    return f


MUTATIONS = {
    "missing-token": (_sub("--mp-seg-on-ink: #FFFFFF;", ""), "--mp-seg-on-ink is not defined on :root"),
    "dark-blocks-differ": (_sub("--mp-ink: #FFFFFF;", "--mp-ink: #FAFAFA;"), "the two dark blocks differ"),
    "stray-token": (_sub(".cap {", ".hero { --mp-ink: #777777; } .cap {"), "outside the three theme blocks"),
    "stray-in-media": (_sub("@media (prefers-reduced-transparency: reduce) {",
                            "@media (min-width: 900px) { .x { --mp-surface: #CCCCCC; } } @media (prefers-reduced-transparency: reduce) {"),
                       "inside @media (min-width: 900px)"),
    "unreadable-colour": (_sub("--mp-ink-3: #454D5C;", "--mp-ink-3: color-mix(in srgb, #000 50%, #fff);"),
                          "cannot read the colour"),
    "fails-only-at-20": (_sub("--mp-surface-2: #F0F3F7;", "--mp-surface-2: #E8ECF2;"),
                         "light: body mp-ink on mp-surface-2"),
    "dark-body-dim": (_sub("--mp-ink: #FFFFFF;", "--mp-ink: #E6E9EE;", 2), "dark: body mp-ink on mp-surface"),
    "white-segment": (_sub("--mp-seg-on: #0A1A33;", "--mp-seg-on: #FFFFFF;"),
                      "presence mp-seg-on on mp-surface-2"),
    "unknown-declared": (_sub('"mp-chip-bg"]', '"mp-chip-nope"]'), "--mp-chip-nope is not defined"),
    "bad-tier": (_sub('[["text", "mp-ink-2", "mp-chip-bg"]]', '[["bold", "mp-ink-2", "mp-chip-bg"]]'),
                 "is not [tier, foreground, ground]"),
    "no-json": (_sub('id="mp-design-gates"', 'id="other"'), "no mp-design-gates JSON block"),
    "bad-json": (_sub('{"pairs"', '{pairs'), "not valid JSON"),
    "thin-glass": (_sub("--mp-glass: rgba(255, 255, 255, 0.97);", "--mp-glass: rgba(255, 255, 255, 0.30);"),
                   "on mp-glass+mp-hero"),
    "glass-missing-hero": (_sub('"mp-hero", "mp-accent"', '"mp-accent"'), "glass backdrops must include mp-hero"),
    "translucent-ground": (_sub('"mp-chip-bg"]', '"mp-band-80"]'), "is not opaque"),
    "var-cycle": (_sub("--mp-ink-3: #454D5C;", "--mp-ink-3: var(--mp-ink-3);"), "refers to itself"),
    "no-reduced-transparency": (_sub("@media (prefers-reduced-transparency: reduce)", "@media (min-width: 1px)"),
                                "no @media (prefers-reduced-transparency: reduce) fallback"),
    "blur-30": (_sub("--blur: 18px;", "--blur: 30px;"), "blurs 30 px"),
    "glass-on-chip": (_sub(".tabbar {", ".tabbar, .chip {"), "glass on a chip, badge or mark"),
    "transition-all": (_sub("transform var(--mo-fast) ease,", "all var(--mo-fast) ease,"), "transitions all properties"),
    "transition-implicit-all": (_sub("transform var(--mo-fast) ease, background-color 150ms linear",
                                     "var(--mo-fast) ease"), "transitions all properties"),
    "transition-all-second": (_sub("background-color 150ms linear", "all 300ms linear"), "transitions all properties"),
    "transition-width": (_sub("background-color 150ms linear", "width 150ms linear"), "transitions 'width'"),
    "paint-too-long": (_sub("background-color 150ms linear", "background-color 400ms linear"), "for 400 ms"),
    "keyframe-bgpos": (_sub("0% { opacity: 1; }", "0% { background-position: 0 0; }"), "animates 'background-position'"),
    "keyframe-filter": (_sub("from { clip-path: inset(0 100% 0 0); }", "from { filter: blur(8px); }"), "animates 'filter'"),
    "keyframe-custom-prop": (_sub("0% { opacity: 1; }", "0% { --x: 1; }"), "animates '--x'"),
    "infinite": (_sub("1.3s ease-in-out 3 both", "1.3s ease-in-out infinite both"), "loops forever"),
    "infinite-upper": (_sub("1.3s ease-in-out 3 both", "1.3s ease-in-out INFINITE both"), "loops forever"),
    "ten-times": (_sub("1.3s ease-in-out 3 both", "1.3s ease-in-out 10 both"), "repeats 10 times"),
    "no-reduced-motion": (_sub("@media (prefers-reduced-motion: reduce)", "@media (min-width: 2px)", 9),
                          "no @media (prefers-reduced-motion: reduce) block"),
    "font-10": (_sub(".cap { font-size: 12px;", ".cap { font-size: 10px;"), "text at 10 px"),
    "font-11": (_sub(".cap { font-size: 12px;", ".cap { font-size: 11px;"), "text at 11 px"),
    "font-shorthand-10": (_sub("font: 400 17px/22px", "font: 400 10px/22px"), "text at 10 px"),
    "font-rem": (_sub(".cap { font-size: 12px;", ".cap { font-size: 0.6rem;"), "text at 9.6 px"),
    "weight-300": (_sub("font-weight: 500;", "font-weight: 300;"), "font weight 300"),
    "svg-text-9": (_sub('font-size="12"', 'font-size="9"'), "SVG text at font-size 9"),
    "inline-10": (_sub('<div class="board">', '<div class="board" style="font-size: 10px">'), "inline style sets text at 10 px"),
    "js-animate-left": (_sub("{ transform: 'translateX(0)' }, { transform: 'translateX(40px)' }",
                             "{ left: '0px', width: '20px' }, { left: '40px', width: '30px' }"), "moves 'left'"),
    "scroll-handler": (_sub("const io", "window.addEventListener('scroll', () => {}); const io"), "a scroll handler"),
    "set-interval": (_sub("const io", "setInterval(() => {}, 100); const io"), "setInterval"),
    "no-content-visibility": (_sub("content-visibility: auto;", ""), "content-visibility"),
    "will-change-width": (_sub("will-change: transform;", "will-change: width;"), "will-change: width"),
    "external-script": (_sub("<script>\nconst", '<script src="https://cdn.example.com/x.js"></script><script>\nconst'),
                        "external load from https://cdn.example.com/x.js"),
    "body-tag": (_sub('<div class="board">', '<body><div class="board">'), "a <body> tag"),
    "no-title": (_sub("<title>Selftest page</title>", ""), "no <title>"),
    "unclosed-css": (_sub("@keyframes draw {", "@keyframes draw { {"), "cannot be read"),
    "warm-paper-ground": (_sub("--mp-bg: #F2F4F8;", "--mp-bg: #F6F4F1;"), "differs from shared/tokens.css"),
    "weak-secondary-text": (_sub("--mp-ink-2: #3A4250;", "--mp-ink-2: #5A6270;"), "light: text mp-ink-2 on"),
    "weak-dark-text": (_sub("--mp-ink-3: #DEDBEC;", "--mp-ink-3: #B5B1C8;", 2), "dark: text mp-ink-3 on"),
    "no-ai-colour": (_sub("--mp-ai: #B85F00;", ""), "--mp-ai is not defined on :root"),
    "faint-edge": (_sub("--mp-edge: #BFC7D3;", "--mp-edge: #E9EDF2;"), "presence mp-edge on mp-bg"),
    "icon-font": (_sub("family=Inter&", "family=Material+Symbols+Rounded&"), "an icon font is loaded"),
    "leftover-icon-span": (_sub('<div class="board">', '<div class="board"><span class="ms" aria-hidden="true">lock</span>'),
                           "leftover icon-font span"),
    "leftover-span-classes": (_sub('<div class="board">', '<div class="board"><span class="x ms y">lock</span>'),
                              "leftover icon-font span"),
    "sprite-edited": (_sub('<symbol id="i-home"', '<symbol id="i-house"'), "differs from shared/icons.svg"),
    "dangling-icon": (_sub('<use href="#i-home"/>', '<use href="#i-nope"/>'), "#i-nope has no symbol"),
    "soft-icon": (_sub("stroke-linecap: square; stroke-linejoin: miter;", "stroke-linecap: round; stroke-linejoin: round;"),
                  "square caps and mitred joins"),
    "unicode-arrow": (_sub('<div class="board">', '<div class="board">▲'), "the Unicode glyph ▲"),
    "claude-edited": (_sub("Why is NVIDIA ranked Trim?", "Why is NVIDIA ranked Hold?"), "differs from shared/claude.html"),
    "claude-removed": (_sub("<!-- mp-claude:start -->", "<!-- removed -->"), "no Claude component"),
    "no-mark-shape": (_sub("--cl-s2: polygon(0 50%, 100% 40%, 100% 60%); ", ""), "--cl-s2"),
    "halo": (_sub(".cap {", ".tile { box-shadow: 0 0 24px rgba(255, 0, 0, 0.5); } .cap {"), "a soft halo"),
    "wide-shadow": (_sub(".cap {", ".tile { box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2); } .cap {"), "blurs a shadow 48 px"),
    "text-shadow": (_sub(".cap {", ".fig { text-shadow: 0 1px 2px #000; } .cap {"), "text shadow"),
    "blur-filter": (_sub(".cap {", ".bloom { filter: blur(12px); } .cap {"), "a blur filter"),
    "radial-bloom": (_sub(".cap {", ".tile { background: radial-gradient(circle, #f0f, #00f); } .cap {"), "radial gradient"),
}


def good_prism() -> str:
    """A small page that holds everything check_prism asks for, from the real source files."""
    nav = "".join(f'<a href="#s{i}">{name}</a>' for i, name in enumerate(SECTIONS))
    return f"""<title>Selftest Prism</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@700;800&display=swap">
<style>
{(PRISM / "tokens.css").read_text()}
:root {{ --font-figure: ui-rounded, "SF Pro Rounded", "Nunito", system-ui; --font-text: -apple-system, "SF Pro Text", "Inter", system-ui;
  --cl-s1: polygon(50% 6%, 30% 94%, 2% 94%); --cl-s2: polygon(50% 6%, 70% 94%, 30% 94%); --cl-s3: polygon(50% 6%, 98% 94%, 70% 94%); }}
.ico {{ width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: square; stroke-linejoin: miter; }}
.bar {{ background: var(--glass); backdrop-filter: blur(22px); }}
.board {{ content-visibility: auto; contain-intrinsic-size: auto 800px; }}
@media (prefers-reduced-motion: reduce) {{ * {{ animation-duration: 1ms !important; }} }}
@media (prefers-reduced-transparency: reduce) {{ .bar {{ background: var(--surface); backdrop-filter: none; }} }}
</style>
{(PRISM / "icons.svg").read_text()}
<nav aria-label="Sections">{nav}</nav>
<div class="board"><svg class="ico"><use href="#i-home"/></svg></div>
{(SHARED / "claude.html").read_text()}
"""


PRISM_MUTATIONS = {
    "tokens-edited": (_sub("--ink: #14171F;", "--ink: #000000;"), "differ from tokens.css"),
    "no-tokens": (_sub("/* prism-tokens:start */", "/* removed */"), "not in the page between the prism-tokens markers"),
    "third-ink": (_sub(".bar {", ".x { color: var(--ink-3); } .bar {"), "--ink-3 is in the page"),
    "old-face": (_sub("family=Nunito:wght@700;800", "family=Bricolage+Grotesque:wght@700"), "Bricolage"),
    "other-face": (_sub("family=Nunito:wght@700;800", "family=Poppins:wght@700"), "Google Fonts loads Poppins"),
    "axis": (_sub(".bar {", '.x { font-variation-settings: "wdth" 92; } .bar {'), "font-variation-settings"),
    "figure-face": (_sub('"Nunito", system-ui', 'Georgia'), "--font-figure is not set"),
    "icon-edited": (_sub('<symbol id="i-home"', '<symbol id="i-house"'), "differs from docs/design/prism/icons.svg"),
    "no-icons": (_sub('id="prism-icons"', 'id="other"'), "is not in the page"),
    "dangling-icon": (_sub('<use href="#i-home"/>', '<use href="#i-nope"/>'), "#i-nope has no symbol"),
    "soft-icon": (_sub("stroke-linecap: square; stroke-linejoin: miter;", "stroke-linecap: round; stroke-linejoin: round;"),
                  "square ends and mitred corners"),
    "unicode-arrow": (_sub('<div class="board">', '<div class="board">▲'), "the Unicode glyph ▲"),
    "section-moved": (_sub('<a href="#s0">Principles</a><a href="#s1">Three depths</a>',
                           '<a href="#s1">Three depths</a><a href="#s0">Principles</a>'), "the owner's order"),
    "section-missing": (_sub('<a href="#s10">Contrast at 20%</a>', ''), "the owner's order"),
    "no-index": (_sub('<nav aria-label="Sections">', '<div aria-label="Sections">'), "no section index"),
    "claude-edited": (_sub("Why is NVIDIA ranked Trim?", "Why is NVIDIA ranked Hold?"), "differs from shared/claude.html"),
    "no-mark-shape": (_sub("--cl-s2: polygon(50% 6%, 70% 94%, 30% 94%); ", ""), "--cl-s2"),
    "infinite-loop": (_sub(".bar {", ".s { animation: spin 1s linear infinite; } .bar {"), "loops forever"),
    "layout-transition": (_sub(".bar {", ".s { transition: width 200ms ease; } .bar {"), "transitions 'width'"),
    "blur-keyframe": (_sub(".bar {", "@keyframes r { from { filter: blur(8px); } } .bar {"), "animates 'filter'"),
    "no-transparency-fallback": (_sub("@media (prefers-reduced-transparency: reduce)", "@media (min-width: 3px)"), "reduced-transparency"),
    "small-text": (_sub(".bar {", ".s { font-size: 10px; } .bar {"), "text at 10 px"),
    "small-text-11": (_sub(".bar {", ".s { font-size: 11px; } .bar {"), "text at 11 px"),
}


def good_journeys() -> str:
    """A small journeys page: the good Prism page without its index and Claude block, and ten registered journeys."""
    body = re.sub(r'<nav aria-label="Sections">.*?</nav>', "", good_prism(), flags=re.S)
    body = re.sub(r"<!-- mp-claude:start -->.*?<!-- mp-claude:end -->", "", body, flags=re.S)
    journeys = "\n".join(f"/* ---------- journey: {j} ---------- */\nJ.add({{ id: '{j}', stories: ['MP-153'], options: "
                         f"[{{ id: 'a', rec: true }}, {{ id: 'b' }}] }});" for j in JOURNEY_IDS)
    return f"{body}\n<script>{journeys}</script>"


JOURNEY_MUTATIONS = {
    "journey-missing": (_sub("/* ---------- journey: cost ---------- */\nJ.add({ id: 'cost', stories: ['MP-153'], options: "
                             "[{ id: 'a', rec: true }, { id: 'b' }] });", ""), "the ten, in order"),
    "journey-moved": (_sub("journey: home ----", "journey: holdings ----"), "the ten, in order"),
    "journeys-say-flipless": (_sub("journey: home ----", "journey: home ---- window.__prismFlipless"), "has no flip"),
    "no-recommendation": (_sub("J.add({ id: 'forecast', stories: ['MP-153'], options: [{ id: 'a', rec: true }",
                               "J.add({ id: 'forecast', stories: ['MP-153'], options: [{ id: 'a' }"), "forecast recommends 0"),
    "two-recommended": (_sub("J.add({ id: 'journal', stories: ['MP-153'], options: [{ id: 'a', rec: true }, { id: 'b' }]",
                             "J.add({ id: 'journal', stories: ['MP-153'], options: [{ id: 'a', rec: true }, { id: 'b', rec: true }]"),
                        "journal recommends 2"),
    "no-stories": (_sub("J.add({ id: 'privacy', stories: ['MP-153'],", "J.add({ id: 'privacy', stories: [],"), "privacy names no stories"),
    "not-registered": (_sub("J.add({ id: 'research',", "J.other({ id: 'research',"), "research does not register"),
    "tokens-edited": (_sub("--ink: #14171F;", "--ink: #000000;"), "differ from tokens.css"),
    "other-face": (_sub("family=Nunito:wght@700;800", "family=Poppins:wght@700"), "Google Fonts loads Poppins"),
    "icon-edited": (_sub('<symbol id="i-home"', '<symbol id="i-house"'), "differs from docs/design/prism/icons.svg"),
    "dangling-icon": (_sub('<use href="#i-home"/>', '<use href="#i-nope"/>'), "#i-nope has no symbol"),
    "infinite-loop": (_sub(".bar {", ".s { animation: spin 1s linear infinite; } .bar {"), "loops forever"),
    "small-text": (_sub(".bar {", ".s { font-size: 10px; } .bar {"), "text at 10 px"),
    "small-text-11": (_sub(".bar {", ".s { font-size: 11px; } .bar {"), "text at 11 px"),
    "size-em": (_sub(".bar {", ".s { font-size: .4em; } .bar {"), "cannot read"),
    "size-percent": (_sub(".bar {", ".s { font-size: 40%; } .bar {"), "cannot read"),
    "size-calc": (_sub(".bar {", ".s { font-size: calc(1px + 2px); } .bar {"), "cannot read"),
    "size-var": (_sub(".bar {", ".s { font-size: var(--tiny); } .bar {"), "cannot read"),
    "size-pt": (_sub(".bar {", ".s { font-size: 6pt; } .bar {"), "text at 8 px"),
    "size-clamp": (_sub(".bar {", ".s { font-size: clamp(6px, 2vw, 20px); } .bar {"), "text at 6 px"),
    "font-var-size": (_sub(".bar {", ".s { font: var(--x); } .bar {"), "cannot read"),
    "font-no-size": (_sub(".bar {", ".s { font: bold serif; } .bar {"), "no size the gate can read"),
    "weight-350": (_sub(".bar {", ".s { font-weight: 350; } .bar {"), "font weight 350"),
    "weight-lighter": (_sub(".bar {", ".s { font-weight: lighter; } .bar {"), "font weight lighter"),
    "webkit-infinite": (_sub(".bar {", ".s { -webkit-animation: spin 1s infinite; } .bar {"), "loops forever"),
    "webkit-transition": (_sub(".bar {", ".s { -webkit-transition: width 200ms ease; } .bar {"), "transitions 'width'"),
    "inline-infinite": (_sub('<div class="board">', '<div class="board" style="animation: spin 1s infinite">'), "inline style loops forever"),
    "inline-layout": (_sub('<div class="board">', '<div class="board" style="transition: width 200ms">'), "inline style transitions 'width'"),
    "inline-single-quote": (_sub('<div class="board">', """<div class="board" style='font-size: 6px'>"""), "text at 6 px"),
    "stray-token": (_sub(".bar {", ".cost-box { --ink: #BBBBBB; --surface: #DDDDDD; } .bar {"), "outside tokens.css"),
    "second-root": (_sub(".bar {", ":root { --ink: #BBBBBB; } .bar {"), "outside tokens.css"),
    "second-light-block": (_sub(".bar {", ":root, .scheme-light { --ink: #BBBBBB; } .bar {"), "outside tokens.css"),
    "second-dark-block": (_sub(".bar {", ':root[data-theme="dark"], .scheme-dark { --ink: #333333; } .bar {'), "outside tokens.css"),
    "inline-infinite-computed": (_sub('<div class="board">', '<div class="board" style="animation: spin ${d}s linear infinite">'), "inline style loops forever"),
    "inline-infinite-in-a-value": (_sub('<div class="board">', """<div class="board" style="${x ? 'animation: spin 1s linear infinite;' : ''}">"""), "loops forever"),
    "inline-token": (_sub('<div class="board">', '<div class="board" style="--ink: #BBBBBB">'), "set inline or by a script"),
    "script-token": (_sub('<div class="board">', """<div class="board"><script>document.body.style.setProperty('--ink', '#BBBBBB')</script>"""), "set inline or by a script"),
}


def selftest() -> int:
    bad = 0
    journeys = good_journeys()
    fails = check_journeys(journeys)
    if fails:
        print("selftest: FAIL the good journeys page is refused, so the harness proves nothing:")
        for f in fails:
            print(f"  {f}")
        return 1
    for name, (mutate, expect) in JOURNEY_MUTATIONS.items():
        fails = check_journeys(mutate(journeys))
        if not any(expect in f for f in fails):
            print(f"selftest: FAIL journeys {name}: expected a failure containing {expect!r}, got {fails or 'a pass'}")
            bad += 1
    prism = good_prism()
    fails = check_prism(prism)
    if fails:
        print("selftest: FAIL the good Prism page is refused, so the harness proves nothing:")
        for f in fails:
            print(f"  {f}")
        return 1
    for name, (mutate, expect) in PRISM_MUTATIONS.items():
        fails = check_prism(mutate(prism))
        if not any(expect in f for f in fails):
            print(f"selftest: FAIL prism {name}: expected a failure containing {expect!r}, got {fails or 'a pass'}")
            bad += 1
    base = good_page()
    fails, _ = check_page(base)
    if fails:
        print("selftest: FAIL the good page is refused, so the harness proves nothing:")
        for f in fails:
            print(f"  {f}")
        return 1
    for name, (mutate, expect) in MUTATIONS.items():
        page = mutate(base)
        fails, _ = check_page(page)
        if not any(expect in f for f in fails):
            print(f"selftest: FAIL {name}: expected a failure containing {expect!r}, got {fails or 'a pass'}")
            bad += 1
    with tempfile.TemporaryDirectory() as tmp, contextlib.redirect_stdout(io.StringIO()):
        missing = Path(tmp) / "gone.html"
        if check([str(missing)]) != 1:
            print("selftest: FAIL a missing page passed")
            bad += 1
    if bad:
        return 1
    print(f"selftest: the three good pages pass and all {len(MUTATIONS) + len(PRISM_MUTATIONS) + len(JOURNEY_MUTATIONS) + 1} mutations are refused")
    return 0


def main(argv: list[str]) -> int:
    if not argv or argv[0] not in ("check", "report", "selftest"):
        print(__doc__)
        return 2
    if argv[0] == "check":
        return check(argv[1:])
    if argv[0] == "report":
        if len(argv) != 2:
            print("report needs one page")
            return 2
        return report(argv[1])
    return selftest()


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
