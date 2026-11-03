#!/usr/bin/env python3
"""MP-40: the ready stories for PH-00 to PH-09, one file per phase in stories/, and the gate that says they are ready.

    python3 docs/planning/story-readiness-2026-11-03/stories.py check            # every rule below, fail closed
    python3 docs/planning/story-readiness-2026-11-03/stories.py selftest         # prove each refusal bites
    python3 docs/planning/story-readiness-2026-11-03/stories.py body PH01-S01    # the Jira description, markdown
    python3 docs/planning/story-readiness-2026-11-03/stories.py set-key PH01-S01 MP-123
    python3 docs/planning/story-readiness-2026-11-03/stories.py sync-trace       # add or refresh the stories' trace rows
    python3 docs/planning/story-readiness-2026-11-03/stories.py externals        # cross-phase dependencies to link

A story is ready (CD-01) when it has positive, negative and recovery acceptance, the contracts it reads or writes,
who may do what, a state inventory, its dependencies (stories, open contracts, open owner questions) and the evidence
that proves it done. Every one of the 64 drafts in the phase-story baseline is kept, split, merged or dropped with a
reason, and no local id is presented as a Jira key.
"""

from __future__ import annotations

import copy
import json
import re
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
STORIES = HERE / "stories"
BASELINE = ROOT / "docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json"
GAPS = ROOT / "docs/planning/ma-reconciliation-2026-11-02/gap-register.json"
TRACE = ROOT / "docs/planning/trace.json"
PACK = ROOT / "docs/planning/foundation-specifications-2026-11-02"
CARD = ROOT / "docs/planning/claude-models-and-batching-2026-11-02.md"
DISPOSITIONS = {"kept", "split", "merged", "dropped"}
ROLES = {"reads", "writes", "validates", "emits"}
STORY_ID = re.compile(r"^PH0\d-S\d{2}$")
JIRA_KEY = re.compile(r"^MP-\d+$")
CLOSED = ("closed", "owner_confirmed")


def load(path: Path):
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError) as e:
        raise SystemExit(f"stories: cannot read {path.relative_to(ROOT)} ({e})")


def contracts_known() -> dict[str, str]:
    """Every contract name a story may cite: `specified` when the foundation pack has a schema, else `planned`."""
    known = {}
    for p in load(BASELINE)["phases"]:
        for name in p.get("contract_catalogue", []):
            known[name] = "planned"
    for rel in ("financial/contracts.schema.json", "forecasting/contracts.schema.json"):
        for name in load(PACK / rel).get("$defs", {}):
            known[name] = "specified"
    data = load(PACK / "data/contracts.json")
    for name in data.get("$defs", data.get("definitions", {})):
        known[name] = "specified"
    return known


def open_questions() -> dict[str, str]:
    """Owner questions a story may wait on, with their state; answered ones are listed so a citation is refused."""
    q = {}
    for d in load(PACK / "forecasting/open-decisions.json")["material_choices"]:
        q[d["id"]] = d["status"]
    for d in load(PACK / "financial/open-decisions.json")["decisions"]:
        q[d["id"]] = d["status"]
    for d in load(PACK / "data/catalogue.json")["owner_decisions"]:
        q[d["id"]] = d["status"]
    spec = (PACK / "costs/specification.md").read_text()
    for qid in re.findall(r"\*\*(COST-Q\d+)\b", spec):
        q.setdefault(qid, "owner_pending")
    for qid in ("COST-Q1", "COST-Q2", "COST-Q4"):
        q[qid] = "owner_confirmed"
    for d in load(HERE / "questions.json")["questions"]:
        q[d["id"]] = d["status"]
    card = CARD.read_text()
    body = card.split("## Still open after this card", 1)[1].split("\n## ", 1)[0] if "## Still open after this card" in card else ""
    for i, _ in enumerate(re.findall(r"^- ", body, re.M), 1):
        q[f"ARC-06b-O{i}"] = "open"
    return q


def phase_files(stories_dir: Path) -> dict[str, dict]:
    files = {}
    for path in sorted(stories_dir.glob("PH-0*.json")):
        files[path.stem] = load(path)
    return files


def problems(stories_dir: Path = STORIES, trace_path: Path = TRACE) -> list[str]:
    baseline = load(BASELINE)
    phases = {p["id"]: p for p in baseline["phases"]}
    drafts = {s["id"]: s for s in baseline["stories"]}
    gaps = {g["id"] for g in load(GAPS)["gaps"]}
    known, questions = contracts_known(), open_questions()
    trace = {i["key"]: i for i in load(trace_path)["issues"]}
    files = phase_files(stories_dir)
    out, stories, seen_drafts, keys = [], {}, {}, {}

    for pid in phases:
        if pid not in files:
            out.append(f"{pid}: no stories/{pid}.json")
    for pid, f in files.items():
        if pid not in phases:
            out.append(f"stories/{pid}.json: no such phase")
            continue
        for did, disp in f.get("drafts", {}).items():
            if did in seen_drafts:
                out.append(f"{did}: accounted for in both {seen_drafts[did]} and {pid}")
            seen_drafts[did] = pid
            if did not in drafts:
                out.append(f"{pid}: {did} is not a draft in the phase-story baseline")
            elif drafts[did]["phase_id"] != pid:
                out.append(f"{pid}: {did} belongs to {drafts[did]['phase_id']}")
            if disp.get("disposition") not in DISPOSITIONS:
                out.append(f"{did}: disposition must be one of {sorted(DISPOSITIONS)}")
            elif disp["disposition"] == "dropped":
                if not str(disp.get("reason", "")).strip():
                    out.append(f"{did}: a dropped draft needs a reason")
            elif not disp.get("stories"):
                out.append(f"{did}: a {disp['disposition']} draft names no stories")
        for s in f.get("stories", []):
            sid = s.get("id", "")
            where = f"{pid}/{sid or '?'}"
            if not STORY_ID.match(sid) or not sid.startswith(pid.replace("-", "")):
                out.append(f"{where}: id must be {pid.replace('-', '')}-Snn")
            if sid in stories:
                out.append(f"{where}: duplicate id")
            stories[sid] = s
            if s.get("phase") != pid:
                out.append(f"{where}: phase must be {pid}")
            if s.get("epic") not in phases[pid]["existing_epic_crosswalk"]:
                out.append(f"{where}: epic must be one of {phases[pid]['existing_epic_crosswalk']}")
            for field in ("title", "story", "authority"):
                if not str(s.get(field, "")).strip():
                    out.append(f"{where}: no {field}")
            text = json.dumps(s, ensure_ascii=False)
            if "—" in text:
                out.append(f"{where}: an em dash; MP's Jira text uses hyphens, colons or commas")
            if re.search(r"\bMP-\d+\b", s.get("title", "")):
                out.append(f"{where}: the title carries a Jira key")
            acc = s.get("acceptance", {})
            if len([a for a in acc.get("positive", []) if str(a).strip()]) < 2:
                out.append(f"{where}: needs at least two positive acceptance criteria")
            if len([a for a in acc.get("negative", []) if str(a).strip()]) < 1:
                out.append(f"{where}: needs at least one negative acceptance criterion")
            if not acc.get("recovery") and not str(acc.get("recovery_not_applicable", "")).strip():
                out.append(f"{where}: needs recovery acceptance or a reason it does not apply")
            cs = s.get("contracts", [])
            if not cs:
                out.append(f"{where}: names no contract")
            for c in cs:
                if c.get("name") not in known:
                    out.append(f"{where}: contract {c.get('name')!r} is in no foundation schema or phase catalogue")
                if c.get("role") not in ROLES:
                    out.append(f"{where}: contract {c.get('name')} needs a role in {sorted(ROLES)}")
            if len([x for x in s.get("states", []) if str(x).strip()]) < 3:
                out.append(f"{where}: the state inventory needs at least three states")
            if not s.get("evidence"):
                out.append(f"{where}: names no evidence that proves it done")
            dep = s.get("depends_on", {})
            for g in dep.get("gaps", []):
                if g not in gaps:
                    out.append(f"{where}: unknown open contract {g}")
            asked = dep.get("owner_questions", [])
            for q in asked:
                if q not in questions:
                    out.append(f"{where}: unknown owner question {q}")
                elif str(questions[q]).startswith(CLOSED):
                    out.append(f"{where}: {q} is already answered; cite the answer, not the question")
            if bool(s.get("blocked_on_owner")) != bool(asked):
                out.append(f"{where}: blocked_on_owner must be true exactly when it waits on an owner question")
            for d in s.get("from_drafts", []):
                if f.get("drafts", {}).get(d, {}).get("disposition") == "dropped" or sid not in f.get("drafts", {}).get(d, {}).get("stories", []):
                    out.append(f"{where}: draft {d} does not list this story")
            key = s.get("jira_key")
            if key is not None:
                if not JIRA_KEY.match(str(key)):
                    out.append(f"{where}: jira_key {key!r} is not an MP key")
                elif key in keys:
                    out.append(f"{where}: jira_key {key} is also {keys[key]}")
                else:
                    keys[key] = sid
                    row = trace.get(key)
                    if not row:
                        out.append(f"{where}: {key} is not in the trace (run sync-trace)")
                    elif row.get("parent") != s.get("epic") or row.get("summary") != s.get("title"):
                        out.append(f"{where}: the trace row for {key} disagrees on parent or summary")
    for did in drafts:
        if did not in seen_drafts:
            out.append(f"{did}: not accounted for in any phase file")
    for pid, f in files.items():
        for did, disp in f.get("drafts", {}).items():
            for sid in disp.get("stories", []):
                if sid not in stories:
                    out.append(f"{did}: names {sid}, which does not exist")
    for sid, s in stories.items():
        for d in s.get("depends_on", {}).get("stories", []):
            if d not in stories:
                out.append(f"{sid}: depends on unknown story {d}")
            if d == sid:
                out.append(f"{sid}: depends on itself")
    out += cycles(stories)
    register = stories_dir.parent / "questions.json"
    if register.exists():
        for q in load(register)["questions"]:
            if str(q["status"]).startswith(CLOSED):
                continue
            for sid in q.get("stories", []):
                if sid not in stories:
                    out.append(f"{q['id']}: names {sid}, which does not exist")
                elif q["id"] not in stories[sid].get("depends_on", {}).get("owner_questions", []):
                    out.append(f"{sid}: does not cite {q['id']}, which lists it as blocked")
    return out


def cycles(stories: dict) -> list[str]:
    state, out = {}, []

    def visit(sid, path):
        if state.get(sid) == 1:
            out.append("dependency cycle: " + " -> ".join(path + [sid]))
            return
        if state.get(sid) == 2 or sid not in stories:
            return
        state[sid] = 1
        for d in stories[sid].get("depends_on", {}).get("stories", []):
            visit(d, path + [sid])
        state[sid] = 2

    for sid in stories:
        visit(sid, [])
    return out


def find(sid: str) -> tuple[Path, dict, dict]:
    for path in sorted(STORIES.glob("PH-0*.json")):
        f = load(path)
        for s in f.get("stories", []):
            if s["id"] == sid:
                return path, f, s
    raise SystemExit(f"stories: no story {sid}")


def body(sid: str) -> str:
    """The Jira description: generated, never typed by hand, so Jira and the repo say the same thing."""
    _, _, s = find(sid)
    known, keys = contracts_known(), {}
    for path in sorted(STORIES.glob("PH-0*.json")):
        for x in load(path).get("stories", []):
            keys[x["id"]] = x.get("jira_key")
    dep = s.get("depends_on", {})
    lines = [s["story"], "", f"**Phase:** {s['phase']} · **Local id:** {s['id']} (not a Jira key) · "
             f"**From drafts:** {', '.join(s.get('from_drafts', [])) or 'none'}", ""]
    if s.get("blocked_on_owner"):
        lines += [f"**Blocked on the owner:** {', '.join(dep.get('owner_questions', []))}", ""]
    lines += ["## Acceptance", "", "**Positive**", ""] + [f"- {a}" for a in s["acceptance"]["positive"]]
    lines += ["", "**Negative**", ""] + [f"- {a}" for a in s["acceptance"]["negative"]]
    rec = s["acceptance"].get("recovery") or []
    lines += ["", "**Recovery**", ""] + ([f"- {a}" for a in rec] or [f"- Not applicable: {s['acceptance'].get('recovery_not_applicable')}"])
    lines += ["", "## Contracts", ""] + [f"- {c['name']} ({c['role']}; {known.get(c['name'], 'unknown')})" for c in s["contracts"]]
    lines += ["", "## Who may do what", "", s["authority"], "", "## States", ""] + [f"- {x}" for x in s["states"]]
    lines += ["", "## Depends on", ""]
    lines += [f"- Story {d}" + (f" ({keys[d]})" if keys.get(d) else "") for d in dep.get("stories", [])]
    lines += [f"- Open contract {g}" for g in dep.get("gaps", [])]
    lines += [f"- Owner question {q}" for q in dep.get("owner_questions", [])]
    lines += [f"- {e}" for e in dep.get("external", [])]
    if not any(dep.get(k) for k in ("stories", "gaps", "owner_questions", "external")):
        lines.append("- Nothing")
    lines += ["", "## Done when", ""] + [f"- {e}" for e in s["evidence"]]
    lines += ["", f"Generated from docs/planning/story-readiness-2026-11-03/stories/{s['phase']}.json (MP-40). "
              "Edit the repo file, not this description. No implementation is authorised until the UX is approved "
              "and the owner gives permission to build."]
    return "\n".join(lines) + "\n"


def set_key(sid: str, key: str) -> int:
    if not JIRA_KEY.match(key):
        raise SystemExit(f"stories: {key} is not an MP key")
    path, f, s = find(sid)
    if s.get("jira_key") not in (None, key):
        raise SystemExit(f"stories: {sid} already has {s['jira_key']}")
    s["jira_key"] = key
    path.write_text(json.dumps(f, indent=1, ensure_ascii=False) + "\n")
    print(f"stories: {sid} -> {key}")
    return 0


def sync_trace() -> int:
    """Add a trace row for each story with a Jira key, or refresh its summary and parent; never touches other rows."""
    trace = load(TRACE)
    rows = {i["key"]: i for i in trace["issues"]}
    added = 0
    for path in sorted(STORIES.glob("PH-0*.json")):
        for s in load(path).get("stories", []):
            key = s.get("jira_key")
            if not key:
                continue
            row = rows.get(key)
            if row is None:
                row = {"key": key, "summary": s["title"], "type": "Story", "status": "To Do", "parent": s["epic"], "code": []}
                trace["issues"].append(row)
                rows[key] = row
                added += 1
            row["summary"], row["parent"] = s["title"], s["epic"]
    trace["issues"].sort(key=lambda i: int(i["key"].split("-")[1]))
    TRACE.write_text(json.dumps(trace, indent=1, ensure_ascii=False) + "\n")
    print(f"stories: trace has {added} new story rows")
    return 0


def selftest() -> int:
    """Each case breaks a copy of a known-good phase file and names the refusal it expects."""
    good = {
        "phase": "PH-09",
        "drafts": {d: {"disposition": "dropped", "reason": "selftest"} for d in
                   [s["id"] for s in load(BASELINE)["stories"] if s["phase_id"] == "PH-09"]},
        "stories": [],
    }
    first = next(iter(good["drafts"]))
    good["drafts"][first] = {"disposition": "kept", "stories": ["PH09-S01", "PH09-S02"]}
    base = {"id": "PH09-S01", "jira_key": None, "phase": "PH-09", "epic": "MP-9", "title": "A test story",
            "story": "As the owner, I want a test so that the gate is proved.", "from_drafts": [first],
            "acceptance": {"positive": ["One", "Two"], "negative": ["Refused"], "recovery": ["Retried"]},
            "contracts": [{"name": "MarketProfile", "role": "reads"}], "authority": "Owner only.",
            "states": ["empty", "ready", "failed"], "depends_on": {"stories": [], "gaps": [], "owner_questions": []},
            "blocked_on_owner": False, "evidence": ["A test passes"]}
    second = dict(copy.deepcopy(base), id="PH09-S02", depends_on={"stories": ["PH09-S01"], "gaps": ["PL-14"], "owner_questions": []})
    good["stories"] = [base, second]

    def mutate(fn):
        g = copy.deepcopy(good)
        fn(g)
        return g

    s0 = lambda g: g["stories"][0]  # noqa: E731
    cases = [
        ("a ready phase passes", good, None),
        ("a draft left unaccounted", mutate(lambda g: g["drafts"].pop(first)), "not accounted for"),
        ("a dropped draft with no reason", mutate(lambda g: g["drafts"].__setitem__(first, {"disposition": "dropped"})), "needs a reason"),
        ("one positive criterion", mutate(lambda g: s0(g)["acceptance"].__setitem__("positive", ["One"])), "two positive"),
        ("no negative criterion", mutate(lambda g: s0(g)["acceptance"].__setitem__("negative", [])), "one negative"),
        ("no recovery and no reason", mutate(lambda g: s0(g)["acceptance"].pop("recovery")), "recovery acceptance"),
        ("an unknown contract", mutate(lambda g: s0(g)["contracts"].append({"name": "Nope", "role": "reads"})), "in no foundation schema"),
        ("a contract with no role", mutate(lambda g: s0(g)["contracts"][0].pop("role")), "needs a role"),
        ("two states", mutate(lambda g: s0(g).__setitem__("states", ["a", "b"])), "three states"),
        ("no evidence", mutate(lambda g: s0(g).__setitem__("evidence", [])), "no evidence"),
        ("an unknown open contract", mutate(lambda g: s0(g)["depends_on"].__setitem__("gaps", ["ZZ-99"])), "unknown open contract"),
        ("an answered owner question", mutate(lambda g: s0(g).update(depends_on={"stories": [], "gaps": [], "owner_questions": ["SCI-D05"]}, blocked_on_owner=True)), "already answered"),
        ("blocked flag out of step", mutate(lambda g: s0(g).__setitem__("blocked_on_owner", True)), "blocked_on_owner"),
        ("a dependency cycle", mutate(lambda g: s0(g)["depends_on"].__setitem__("stories", ["PH09-S02"])), "dependency cycle"),
        ("a local id shaped like a Jira key", mutate(lambda g: s0(g).__setitem__("id", "MP-9")), "id must be"),
        ("the wrong epic", mutate(lambda g: s0(g).__setitem__("epic", "MP-5")), "epic must be"),
        ("an em dash", mutate(lambda g: s0(g).__setitem__("title", "A test — story")), "em dash"),
        ("a key missing from the trace", mutate(lambda g: s0(g).__setitem__("jira_key", "MP-99999")), "not in the trace"),
        ("a registered question its story does not cite", good, "does not cite MP40-Q99"),
    ]
    results = []
    with tempfile.TemporaryDirectory() as tmp:
        d = Path(tmp) / "stories"
        d.mkdir()
        others = {p["id"]: {"phase": p["id"], "drafts": {s["id"]: {"disposition": "dropped", "reason": "selftest"}
                                                         for s in load(BASELINE)["stories"] if s["phase_id"] == p["id"]},
                            "stories": []} for p in load(BASELINE)["phases"] if p["id"] != "PH-09"}
        for name, record, needle in cases:
            for path in d.glob("*.json"):
                path.unlink()
            for pid, f in others.items():
                (d / f"{pid}.json").write_text(json.dumps(f))
            (d / "PH-09.json").write_text(json.dumps(record))
            register = [{"id": "MP40-Q99", "status": "owner_pending", "stories": ["PH09-S01"]}] if needle and "MP40-Q99" in needle else []
            (d.parent / "questions.json").write_text(json.dumps({"questions": register}))
            found = problems(d)
            ok = found == [] if needle is None else any(needle in p for p in found)
            results.append((name, ok, found))
    for name, ok, found in results:
        print(("ok    " if ok else "FAIL  ") + name + ("" if ok else f": {found[:3]}"))
    passed = sum(ok for _, ok, _ in results)
    print(f"stories selftest: {passed} of {len(results)} cases pass")
    return 0 if passed == len(results) else 1


def externals() -> int:
    """Each cross-phase dependency still written as text, beside the target phase's stories, for the linking pass."""
    files = phase_files(STORIES)
    titles = {pid: [(x["id"], x["title"]) for x in f.get("stories", [])] for pid, f in files.items()}
    n = 0
    for pid, f in files.items():
        for x in f.get("stories", []):
            for e in x.get("depends_on", {}).get("external", []):
                m = re.match(r"(PH-0\d)\s*:", e)
                if not m:
                    continue
                n += 1
                print(f"{x['id']}: {e}")
                for sid, t in titles.get(m.group(1), []):
                    print(f"    {sid}  {t}")
    print(f"stories: {n} cross-phase dependencies still written as text")
    return 0


def main() -> int:
    cmd = sys.argv[1:] or ["check"]
    if cmd[0] == "check":
        found = problems()
        for p in found:
            print("FAIL:", p)
        if not found:
            n = sum(len(f.get("stories", [])) for f in phase_files(STORIES).values())
            keyed = sum(1 for f in phase_files(STORIES).values() for s in f.get("stories", []) if s.get("jira_key"))
            print(f"stories: {n} ready stories across 10 phases, {keyed} in Jira; every draft accounted for")
        return 1 if found else 0
    if cmd[0] == "selftest":
        return selftest()
    if cmd[0] == "body" and len(cmd) == 2:
        sys.stdout.write(body(cmd[1]))
        return 0
    if cmd[0] == "set-key" and len(cmd) == 3:
        return set_key(cmd[1], cmd[2])
    if cmd[0] == "externals":
        return externals()
    if cmd[0] == "sync-trace":
        return sync_trace()
    raise SystemExit(__doc__)


if __name__ == "__main__":
    sys.exit(main())
