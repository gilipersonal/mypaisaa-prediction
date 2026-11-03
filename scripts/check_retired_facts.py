#!/usr/bin/env python3
"""Fail when a fact the owner has retired is still stated in a current document or generator (MP-20 round 2).

    python3 scripts/check_retired_facts.py            # check the repo against docs/planning/retired-facts.json
    python3 scripts/check_retired_facts.py selftest   # prove each refusal bites

Each entry in the register names a pattern, why it is retired and the files it must never appear in. Dated research
packs keep their history and are not listed. A register that cannot be read, an entry with no files, or a file glob
that matches nothing is a failure, never a skip.
"""

from __future__ import annotations

import json
import re
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTER = "docs/planning/retired-facts.json"


def problems(root: Path) -> list[str]:
    path = root / REGISTER
    try:
        facts = json.loads(path.read_text())["facts"]
    except (OSError, ValueError, KeyError) as e:
        return [f"{REGISTER}: cannot read the register ({e})"]
    out = []
    for i, f in enumerate(facts):
        where = f"{REGISTER} entry {i + 1}"
        if not f.get("pattern") or not f.get("why") or not f.get("paths"):
            out.append(f"{where}: needs a pattern, a reason and paths")
            continue
        try:
            rx = re.compile(f["pattern"], re.I)
        except re.error as e:
            out.append(f"{where}: bad pattern ({e})")
            continue
        for glob in f["paths"]:
            files = sorted(p for p in root.glob(glob) if p.is_file())
            if not files:
                out.append(f"{where}: {glob} matches no file")
            for file in files:
                text = file.read_text(errors="replace")
                for m in rx.finditer(text):
                    line = text.count("\n", 0, m.start()) + 1
                    out.append(f"{file.relative_to(root)}:{line}: {m.group(0)!r} is retired: {f['why']}")
    return out


def selftest() -> int:
    cases = []
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "docs/planning").mkdir(parents=True)
        (root / "page.html").write_text("<p>The AWS run rate is £18.64.</p>\n")

        def register(facts):
            (root / REGISTER).write_text(json.dumps({"facts": facts}))

        fact = {"pattern": r"£19\.84", "why": "domain line removed", "paths": ["page.html"]}
        register([fact])
        cases.append(("a clean file passes", problems(root) == []))
        (root / "page.html").write_text("<p>The AWS run rate is\n£19.84.</p>\n")
        found = problems(root)
        cases.append(("a retired fact fails with its line", len(found) == 1 and "page.html:2" in found[0]))
        register([{**fact, "pattern": r"aws\s+run\s+rate is\s+£19\.84"}])
        cases.append(("a match across a line break fails", len(problems(root)) == 1))
        register([{**fact, "paths": ["gone.html"]}])
        cases.append(("a glob that matches nothing fails", "matches no file" in " ".join(problems(root))))
        register([{**fact, "paths": []}])
        cases.append(("an entry with no files fails", "needs a pattern" in " ".join(problems(root))))
        (root / REGISTER).write_text("{")
        cases.append(("an unreadable register fails", "cannot read" in " ".join(problems(root))))
    for name, ok in cases:
        print(("ok    " if ok else "FAIL  ") + name)
    passed = sum(ok for _, ok in cases)
    print(f"check_retired_facts selftest: {passed} of {len(cases)} cases pass")
    return 0 if passed == len(cases) else 1


def main() -> int:
    if sys.argv[1:] == ["selftest"]:
        return selftest()
    found = problems(ROOT)
    for line in found:
        print("FAIL:", line)
    if not found:
        count = len(json.loads((ROOT / REGISTER).read_text())["facts"])
        print(f"check_retired_facts: none of {count} retired facts appears where it is barred")
    return 1 if found else 0


if __name__ == "__main__":
    sys.exit(main())
