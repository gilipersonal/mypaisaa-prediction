#!/usr/bin/env python3
"""Build the owner's question pack page (MP-184) from pack.json and Prism's CSS: python3 docs/design/question-pack/build.py [--check]"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PRISM = ROOT / "docs/design/prism/index.html"
PACK = ROOT / "docs/planning/owner-question-pack-2026-11-05/pack.json"
OUT = HERE / "index.html"


def build() -> str:
    css = re.search(r"<style>(.*?)</style>", PRISM.read_text(), flags=re.S).group(1)
    data = PACK.read_text().replace("</", "<\\/")   # a string in the data must not close the script
    return ((HERE / "src/shell.html").read_text()
            .replace("/*PRISM_CSS*/", css)
            .replace("/*PAGE_CSS*/", (HERE / "src/shell.css").read_text())
            .replace("/*PAGE_JS*/", (HERE / "src/shell.js").read_text())
            .replace("/*PACK_JSON*/", data))


def main(argv: list[str]) -> int:
    text = build()
    if "--check" in argv:
        if not OUT.is_file() or OUT.read_text() != text:
            print("FAIL docs/design/question-pack/index.html is stale; run python3 docs/design/question-pack/build.py")
            return 1
        print("question-pack: index.html is current")
        return 0
    OUT.write_text(text)
    print(f"built {OUT.relative_to(ROOT)}: {len(text)} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
