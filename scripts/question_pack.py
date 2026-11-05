#!/usr/bin/env python3
"""Hold the owner's question pack to its promise that no open question goes missing (MP-184).

    python3 scripts/question_pack.py check
    python3 scripts/question_pack.py selftest

check fails when an open question in the review pages or the story pack has no entry, when an entry's wording no longer matches its
source, or when a question lacks real options, one recommendation, or a resolvable source. A gate fails closed (lesson 8), and each
selftest case names the failure it expects (lesson 9).
"""
import copy
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "docs/planning/owner-question-pack-2026-11-05/pack.json"
ANSWERS = ROOT / "docs/planning/owner-question-pack-2026-11-05/answers.json"
OPEN_LISTS = {"OWN": "docs/design/journeys/src/shell.js", "ADM": "docs/design/admin/src/shell.js"}
QUESTIONS = "docs/planning/story-readiness-2026-11-03/questions.json"
SPLIT = {"OWN-01": ("OWN-01a", "OWN-01b"), "MP40-Q11": ("MP40-Q11a", "MP40-Q11b"), "MP40-Q12": ("MP40-Q12a", "MP40-Q12b", "MP40-Q12c")}
STATUS = {"decide", "answered", "duplicate", "not_owner"}
TIER = {"before_approval", "before_build", "later"}


def sources() -> dict:
    """Every open question now in the records, by source id, verbatim."""
    out = {}
    for prefix, rel in OPEN_LISTS.items():
        block = re.search(r"const OPEN = \[\n(.*?)\n\];", (ROOT / rel).read_text(), re.S)
        if not block:
            raise SystemExit(f"FAIL {rel}: no OPEN list to read")
        n = 0
        for line in block.group(1).split("\n"):
            m = re.fullmatch(r"\s*\['((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\],?", line)
            if not m:
                raise SystemExit(f"FAIL {rel}: an OPEN row this check cannot read: {line.strip()[:70]}")
            n += 1
            out[f"{prefix}-{n:02d}"] = m.group(1).replace("\\'", "'")
    q = json.loads((ROOT / QUESTIONS).read_text())
    for r in (q if isinstance(q, list) else q.get("questions", [])):
        if isinstance(r, dict) and r.get("status") == "owner_pending":
            out[r["id"]] = r["question"]
    return out


def problems(pack: dict, src: dict, answers: list | None = None) -> list:
    out = []
    answers = answers or []
    done = {a.get("id") for a in answers}
    items = pack.get("items")
    if not isinstance(items, list) or not items:
        return ["the pack holds no items"]
    ids = [i.get("id") for i in items]
    for d in sorted({x for x in ids if ids.count(x) > 1}):
        out.append(f"{d}: two entries")
    have = set(ids)
    asked = {(i.get("asked") or {}).get("question") for i in items}
    for s, text in src.items():
        if text not in asked:   # rows renumber as answered ones leave, so a question is matched by its words
            out.append(f"{s}: no entry in the pack for: {text[:60]}")
            continue
    for s in [k for k in src if k in SPLIT]:
        if not all(p in have for p in SPLIT[s]):
            out.append(f"{s}: no entry in the pack ({', '.join(p for p in SPLIT[s] if p not in have)})")
    by = {i.get("id"): i for i in items}
    for i in items:
        k = i.get("id", "?")
        a = i.get("asked") or {}
        settled = k in done or i.get("status") != "decide"   # an answered question leaves its page as the answer is applied
        if a.get("question") not in src.values() and not k.startswith("MP182-") and not settled:
            out.append(f"{k}: its question no longer matches any open row")
        if i.get("status") not in STATUS:
            out.append(f"{k}: unknown status {i.get('status')}")
        if i.get("tier") not in TIER:
            out.append(f"{k}: unknown tier {i.get('tier')}")
        text = json.dumps({x: i.get(x) for x in ("title", "why", "drawn_today", "options")}, ensure_ascii=False)
        if "—" in text:
            out.append(f"{k}: an em dash")
        if re.search(r"\b(he|his|him|she|hers)\b", text, re.I):
            out.append(f"{k}: a gendered pronoun for the owner")
        if i.get("status") == "decide":
            opts = i.get("options") or []
            rec = [o for o in opts if o.get("rec")]
            if not 2 <= len(opts) <= 4:
                out.append(f"{k}: {len(opts)} options, needs two to four")
            if len(rec) != 1:
                out.append(f"{k}: {len(rec)} recommended, needs exactly one")
            elif not rec[0].get("because"):
                out.append(f"{k}: the recommendation gives no reason")
            if any(not o.get("label") or not o.get("says") or not o.get("cost") for o in opts):
                out.append(f"{k}: an option with no label, says or cost")
            if len({o.get("label") for o in opts}) != len(opts):
                out.append(f"{k}: two options share a label")
        elif i.get("options"):
            out.append(f"{k}: options on an entry that needs no pick")
        if i.get("status") == "answered" and not (i.get("answered_by") or {}).get("words"):
            out.append(f"{k}: answered with no quote")
        if i.get("status") == "duplicate" and i.get("duplicate_of") not in by:
            out.append(f"{k}: a duplicate of {i.get('duplicate_of')}, which is not in the pack")
        for e in i.get("evidence") or []:
            m = re.match(r"([\w./-]+\.\w+):(\d+)", e)
            if m:
                p = ROOT / m.group(1)
                if not p.is_file():
                    out.append(f"{k}: cites a file that is not there: {m.group(1)}")
                elif int(m.group(2)) > len(p.read_text(errors="ignore").splitlines()):
                    out.append(f"{k}: cites past the end of {m.group(1)}")
        for l in i.get("linked") or []:
            if l not in by:
                out.append(f"{k}: read with {l}, which is not in the pack")
    if answers:
        decide = {i["id"]: i for i in items if i.get("status") == "decide"}
        seen = [x.get("id") for x in answers]
        for k in sorted(set(decide) - set(seen)):
            out.append(f"{k}: no answer recorded")
        for k in sorted({x for x in seen if seen.count(x) > 1}):
            out.append(f"{k}: two answers")
        for x in answers:
            i = decide.get(x.get("id"))
            if not i:
                out.append(f"{x.get('id')}: an answer to no open question")
                continue
            rec = next((o["label"] for o in i["options"] if o.get("rec")), None)
            if x.get("pick") != "Something else" and x.get("pick") not in [o["label"] for o in i["options"]]:
                out.append(f"{x['id']}: the pick is not one of its options")
            if x.get("recommended") != (x.get("pick") == rec):
                out.append(f"{x['id']}: says Recommended wrongly")
            if x.get("how") not in ("page", "chat") or not x.get("owner_words"):
                out.append(f"{x['id']}: no record of how the owner answered")
    return out


def load_answers() -> list:
    try:
        return json.loads(ANSWERS.read_text())["answers"]
    except (OSError, ValueError, KeyError) as e:
        raise SystemExit(f"FAIL cannot read {ANSWERS.relative_to(ROOT)}: {e}")


def check() -> int:
    try:
        pack = json.loads(PACK.read_text())
    except (OSError, ValueError) as e:
        print(f"FAIL cannot read {PACK.relative_to(ROOT)}: {e}")
        return 2
    bad = problems(pack, sources(), load_answers())
    for b in bad:
        print(f"FAIL {b}")
    if bad:
        return 1
    d = [i for i in pack["items"] if i["status"] == "decide"]
    print(f"question-pack: {len(pack['items'])} entries, {len(d)} to decide, {sum(i['tier'] == 'before_approval' for i in d)} before approval; every open question is carried")
    return 0


def selftest() -> int:
    good = json.loads(PACK.read_text())
    src = sources()
    real = load_answers()
    if problems(good, src, real):
        print("selftest: FAIL the real pack is refused, so the harness proves nothing")
        return 1
    first = next(i for i in good["items"] if i["status"] == "decide")
    fid = first["id"]

    def drop(p):
        p["items"] = [i for i in p["items"] if i["id"] != "ADM-04"]

    def item(p, k=fid):
        return next(i for i in p["items"] if i["id"] == k)

    cases = {
        "a changed question, unanswered": (lambda p: item(p)["asked"].update(question="Reworded"), "no entry in the pack for"),
        "a source with no entry": (drop, "no entry in the pack for"),
        "a new question on a page": (None, "ZZZ-01: no entry"),
        "two recommended": (lambda p: [o.update(rec=True) for o in item(p)["options"]], "needs exactly one"),
        "none recommended": (lambda p: [o.pop("rec", None) for o in item(p)["options"]], "0 recommended"),
        "a reason gone": (lambda p: next(o for o in item(p)["options"] if o.get("rec")).pop("because"), "gives no reason"),
        "one option": (lambda p: item(p).update(options=item(p)["options"][:1]), "needs two to four"),
        "a dead citation": (lambda p: item(p).update(evidence=["docs/none/such.md:3 x"]), "a file that is not there"),
        "a duplicate of nothing": (lambda p: item(p).update(status="duplicate", options=[], duplicate_of="NOPE"), "which is not in the pack"),
        "an answer with no quote": (lambda p: item(p).update(status="answered", options=[], answered_by=None), "answered with no quote"),
        "an em dash": (lambda p: item(p).update(why="One — two"), "an em dash"),
        "a pronoun": (lambda p: item(p).update(why="Until he answers."), "gendered pronoun"),
    }
    def ans(k=fid):
        return lambda a: next(x for x in a if x["id"] == k)

    answer_cases = {
        "an answer missing": (lambda a: a.pop(0), "no answer recorded"),
        "an answer twice": (lambda a: a.append(dict(a[0])), "two answers"),
        "a pick that is no option": (lambda a: a[0].update(pick="Made up"), "not one of its options"),
        "a wrong Recommended mark": (lambda a: a[0].update(recommended=not a[0]["recommended"]), "says Recommended wrongly"),
        "no record of how": (lambda a: a[0].update(owner_words=""), "no record of how"),
    }
    bad = 0
    for name, (mutate, expect) in answer_cases.items():
        a = copy.deepcopy(real)
        mutate(a)
        found = problems(good, src, a)
        if not any(expect in f for f in found):
            print(f"selftest: FAIL {name}: expected {expect!r}, got {found[:2]}")
            bad += 1
    gone = {k: v for k, v in src.items() if v != first["asked"]["question"]}
    if problems(good, gone, real):
        print(f"selftest: FAIL an answered question leaving its page is refused: {problems(good, gone, real)[:2]}")
        bad += 1
    for name, (mutate, expect) in cases.items():
        p, s = copy.deepcopy(good), dict(src)
        if mutate:
            mutate(p)
        else:
            s["ZZZ-01"] = "A new question"
        found = problems(p, s)
        if not any(expect in f for f in found):
            print(f"selftest: FAIL {name}: expected {expect!r}, got {found[:2]}")
            bad += 1
    total = len(cases) + len(answer_cases) + 1
    print(f"selftest: {total - bad} of {total} faults refused for their reason")
    return 1 if bad else 0


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    sys.exit({"check": check, "selftest": selftest}.get(cmd, lambda: 2)())
