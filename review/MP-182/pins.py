#!/usr/bin/env python3
"""What each fixed finding needs to stay true in the source: python3 review/MP-182/pins.py R1-f3

CI has no browser, so the ledger can read the source there. The behaviour itself is pressed by scripts/design_prism_press.mjs and
scripts/design_runtime.mjs, each with a selftest that undoes the fix. A pin lists every part of a fix, not one line of it (R2-c1 to R2-c6).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ADMIN, OWNER = "docs/design/admin/src/shell.js", "docs/design/journeys/src/shell.js"
PRISM, README = "docs/design/prism/index.html", "docs/design/journeys/README.md"
PRESS, RUNTIME, WALK = "scripts/design_prism_press.mjs", "scripts/design_runtime.mjs", "scripts/design_journeys_check.mjs"
COST, RESEARCH = "docs/design/journeys/src/journeys/cost.js", "docs/design/journeys/src/journeys/research.js"

PINS = {
    "R1-f1": [(ADMIN, r"\$\$\('\.acard \.dev'\)\.forEach"), (ADMIN, r"addEventListener\('change', repaint\)")],
    "R1-f2": [(ADMIN, r"cmpWatch", False)],
    "R1-f3": [(PRISM, r"@media \(max-width: 660px\) \{ \.bfull \{ display: none; \} \}"),
              (PRISM, r"@media \(max-width: 400px\) \{ \.brand > span:last-child"),
              (PRESS, r"for \(let w = 320; w <= 820; w\+\+\)")],
    "R1-f4": [(PRISM, r"\.cx\[data-snug\] text \{ font-size: 12\.6px; \}"), (COST, r"ctx\.kind === 'ipad' \? ' data-snug' : ''"),
              (RESEARCH, r"ctx\.kind === 'ipad' \? fcard\(N, .*?data-snug"), (WALK, r"getScreenCTM"), (PRESS, r"getScreenCTM")],
    "R1-f5": [(OWNER, r"const ids = \(\{ o, s, st, landed, from \}\)"), (OWNER, r"from: from \? from\.slice\(0, 2\) : null"), (README, r"only\s+which\s+view", False)],
    "R1-f6": [(PRISM, r"st\.scrollIntoView\(\{ block: 'nearest' \}\)")],
    "R1-s2": [(PRESS, re.escape(n)) for n in ("Not now does nothing", "admin does not watch the system theme", "the chosen control loses its look", "Undo leaves the toast live", "opening again leaves the toast live", "a turn back keeps a detail")],
    "R1-c1": [(RUNTIME, r"hybrid-\[ab\]\\/\/\.test\(file\) \? 10\.95 : 11\.95"), (RUNTIME, r"if \(t\.size < sizeFloor\)"), (RUNTIME, r"t\.size < 10\.95", False)],
    # narrowed in MP-192: the owner answered the question R1-c3 kept open, "Whole journey" (OWN-01a) and "Your real devices only" (OWN-01b),
    # so the README states the owner's answer in place of its "Proposed, not decided" label, and the old label must be gone. The refusals stand.
    "R1-c3": [(OWNER, r"Does a kept flip cover one screen or the whole journey"), (README, r"Proposed,\s+not\s+decided", False),
              (README, r'a kept flip covers the whole journey \("Whole journey", OWN-01a\)'), (README, r'"Your real devices only", OWN-01b'),
              (OWNER, r'Settled, 5 Nov 2026 \("Whole journey", OWN-01a\)'), (OWNER, r"as the app would", False),
              (OWNER, r"A flip is\s+per\s+journey", False), (README, r"would\s+cover\s+the\s+whole\s+journey", False)],
    "R2-f1": [(PRISM, r"toast\.inert = false; open\(false\);"), (PRISM, r"focus\(\{ preventScroll: v \}\)"), (PRISM, r"Record lands on Undo", False), (PRESS, r"a toast never takes focus")],
    "R2-s1": [(RUNTIME, r"ups\.scale"), (RUNTIME, r"the scale property")],
    "R2-s3": [(PRESS, r"loaded fresh"), (PRESS, r"a page wide only on a fresh load")],
    "R2-s5": [(PRESS, r"a press lost its state"), (PRESS, r"#forecast\.a\.iphone\.stale")],
    "R2-c1": [(RUNTIME, r"args\.includes\('--selftest'\)"), ("scripts/review_checks.py", r'"scripts/design_runtime\.mjs", "--selftest"')],
    "R2-s4": [(RUNTIME, r"reviews\\/MP-62\\/hybrid-\[ab\]"), ("scripts/design_gates.py", r"for g in GATED")],
}
PINS["R2-c2"], PINS["R2-c3"], PINS["R2-c4"], PINS["R2-c5"], PINS["R2-c6"] = PINS["R1-f5"], PINS["R1-f3"], PINS["R1-f4"], PINS["R1-c3"], PINS["R1-s2"]


def trace_ok():
    rows = {x["key"]: x for x in json.loads((ROOT / "docs/planning/trace.json").read_text())["issues"]}
    return rows["MP-180"]["parent"] == "MP-4" and rows["MP-39"]["status"] == "Done"


def main(key):
    if key == "R1-c2":
        return 0 if trace_ok() else 1
    if key not in PINS:
        print(f"no pins for {key}")
        return 2
    bad = 0
    for pin in PINS[key]:
        path, pattern, want = (*pin, True)[:3]
        try:
            found = re.search(pattern, (ROOT / path).read_text()) is not None
        except OSError:
            print(f"{key}: cannot read {path}")
            return 2
        if found != want:
            print(f"{key}: {path}: {pattern!r} should be {'present' if want else 'absent'}")
            bad += 1
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]) if len(sys.argv) == 2 else 2)
