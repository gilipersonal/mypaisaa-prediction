#!/usr/bin/env python3
"""Build Prism Journeys, one self-contained page, from Prism and the journey sources (MP-62).

    python3 docs/design/journeys/build.py          # write index.html
    python3 docs/design/journeys/build.py --check  # fail if index.html is stale
    python3 docs/design/journeys/build.py --only home,forecast --out PATH   # a partial page, for a designer's preview

Prism is the one source: the tokens, components, icons, helpers and device frames are taken from
docs/design/prism/index.html as it stands, so a journey cannot drift from the system. A journey is one file in src/,
registered with J.add(); src/shell.* is the page around them. Nothing here is product code.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PRISM = ROOT / "docs/design/prism/index.html"
CLAUDE = ROOT / "docs/design/reviews/MP-62/shared/claude.html"
ICONS = ROOT / "docs/design/prism/icons.svg"
OUT = HERE / "index.html"
ORDER = ("home", "holdings", "forecast", "research", "journal", "cost", "approvals", "privacy")


def between(text: str, start: str, end: str) -> str:
    a = text.index(start)
    return text[a:text.index(end, a)]


def build(only: tuple[str, ...] = ()) -> str:
    page = PRISM.read_text()
    css = re.search(r"<style>(.*?)</style>", page, flags=re.S).group(1)
    claude_css = re.search(r"<style>(.*?)</style>", CLAUDE.read_text(), flags=re.S).group(1)
    filters = re.search(r'<svg class="defs".*?</svg>', page, flags=re.S).group(0)
    kit = (between(page, "/* ---------- basics ---------- */", "/* ---------- the hero, now;")
           + between(page, "/* ---------- device screens ---------- */", "function scrHomeTop()")
           + between(page, "function boardHTML(", "const boardJob ="))
    sources = {p.stem: p.read_text() for p in sorted((HERE / "src/journeys").glob("*.js"))}
    styles = {p.stem: p.read_text() for p in sorted((HERE / "src/journeys").glob("*.css"))}
    unknown = sorted((set(sources) | set(styles)) - set(ORDER))
    if unknown:
        sys.exit(f"build: unknown journey files {unknown}; the order is {ORDER}")
    keep = [k for k in ORDER if (k in only or not only)]
    journeys = "\n".join(f"/* ---------- journey: {k} ---------- */\n{sources[k]}" for k in keep if k in sources)
    journey_css = "\n".join(styles[k] for k in keep if k in styles)
    shell = (HERE / "src/shell.html").read_text()
    script = (f"(() => {{\n{kit}\n{(HERE / 'src/shell.js').read_text()}\n{journeys}\nJ.start();\n}})();")
    return (shell.replace("/*PRISM_CSS*/", css)
                 .replace("/*CLAUDE_CSS*/", claude_css)
                 .replace("/*SHELL_CSS*/", (HERE / "src/shell.css").read_text() + journey_css)
                 .replace("<!--ICONS-->", ICONS.read_text())
                 .replace("<!--FILTERS-->", filters)
                 .replace("/*SCRIPT*/", script))


def main(argv: list[str]) -> int:
    if "--only" in argv:
        only = tuple(argv[argv.index("--only") + 1].split(","))
        out = Path(argv[argv.index("--out") + 1])
        out.write_text(build(only))
        print(f"built {out}: only {', '.join(only)}")
        return 0
    text = build()
    if "--check" in argv:
        if not OUT.is_file() or OUT.read_text() != text:
            print("FAIL docs/design/journeys/index.html is stale; run python3 docs/design/journeys/build.py")
            return 1
        print("journeys: index.html is current")
        return 0
    OUT.write_text(text)
    print(f"built {OUT.relative_to(ROOT)}: {len(text)} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
