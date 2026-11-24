#!/usr/bin/env python3
"""Build the owner's question pack page from the rounds' packs and Prism's CSS: python3 docs/design/question-pack/build.py [--check]

The page asks the current round (MP-203, 24 November 2026) and keeps every earlier round's answers readable as history
(MP-184, 5 November 2026). One page and one artifact URL across rounds, so the owner's link never changes.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PRISM = ROOT / "docs/design/prism/index.html"
CURRENT = ROOT / "docs/planning/owner-question-pack-2026-11-24/pack.json"
FIRST = ROOT / "docs/planning/owner-question-pack-2026-11-05"
OUT = HERE / "index.html"


def history() -> dict:
    """The 5 November round as answered: each question, the pick, how it was given and what the option read."""
    pack = json.loads((FIRST / "pack.json").read_text())
    answers = json.loads((FIRST / "answers.json").read_text())
    by = {i["id"]: i for i in pack["items"]}
    rows = []
    for a in answers["answers"]:
        item = by[a["id"]]
        opt = next((o for o in item["options"] if o["label"] == a["pick"]), None)
        rows.append({"id": a["id"], "title": a["title"], "tier": a["tier"], "pick": a["pick"], "recommended": a["recommended"],
                     "how": a["how"], "owner_words": a["owner_words"], "read": opt["says"] if opt else ""})
    return {"as_of": answers["as_of"], "issue": answers["issue"], "answers": rows, "follow_up": answers.get("follow_up", [])}


def build() -> str:
    css = re.search(r"<style>(.*?)</style>", PRISM.read_text(), flags=re.S).group(1)
    data = json.dumps({"current": json.loads(CURRENT.read_text()), "history": history()}, ensure_ascii=False)
    data = data.replace("</", "<\\/")   # a string in the data must not close the script
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
