#!/usr/bin/env python3
"""Plan sync for Mypaisaa Prediction (MP-35): keep the root docs, the planning pack, the Jira mirror, the
Confluence page list and the code in step. Stdlib only, offline: CI has no Jira access, so Jira is read through
its local mirror, docs/planning/trace.json, refreshed with the Atlassian MCP (see `refresh-help`).

    python3 scripts/plan_sync.py check                 # exit 1, one line per problem
    python3 scripts/plan_sync.py pr-files [--base REF] [--key MP-<n>]
    python3 scripts/plan_sync.py refresh-help          # how to refresh trace.json from Jira
    python3 scripts/plan_sync.py selftest              # prove every rule refuses what it should

The rule is .claude/rules/plan-sync.md.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRACE = "docs/planning/trace.json"
ROOT_DOCS = ("README.md", "ARCHITECTURE.md", "TECH-STACK.md")
DIRECTION = "docs/planning/ma-reconciliation-2026-11-02/direction-summary.md"
# An ARC id with a letter suffix is a follow-up card in its own file, not a row of the direction summary.
ARC_CARDS = {"ARC-06b": "docs/planning/claude-models-and-batching-2026-11-02.md"}
BASELINE = "docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json"
BUILD_PAGES = "docs/confluence/build_pages.py"
CONFLUENCE = "docs/confluence/confluence.json"
CODE_DIRS = ("backend", "web", "mobile", "infra")
CODE_TYPES = {"Story", "Task", "Bug"}
FINISHED = {"In Review", "Done"}
JQL = "project = MP ORDER BY key ASC"
CLOUD_ID = "81c51173-bbea-4905-bbc5-1a880fa348bb"

KEY = re.compile(r"\bMP-(\d+)\b")
ARC = re.compile(r"\bARC-\d+[a-z]?\b")


def git(root: Path, *args: str) -> str:
    return subprocess.run(["git", "-C", str(root), *args], capture_output=True, text=True, check=True).stdout


def key_order(key: str) -> tuple[int, str]:
    m = re.fullmatch(r"MP-(\d+)", key)
    return (int(m.group(1)), "") if m else (sys.maxsize, key)


# ---------------------------------------------------------------- the trace (rule e)

def load_trace(root: Path) -> tuple[dict | None, list[str]]:
    """The trace and its shape problems. A trace that cannot be read is one problem and no trace."""
    path = root / TRACE
    try:
        trace = json.loads(path.read_text())
    except (OSError, ValueError) as e:
        return None, [f"{TRACE}: cannot be read as JSON: {e}"]
    if not isinstance(trace, dict) or not isinstance(trace.get("issues"), list):
        return None, [f"{TRACE}: needs an object with an `issues` list"]
    problems = [f"{TRACE}: missing `{f}`" for f in ("as_of", "jql") if not trace.get(f)]
    seen: set[str] = set()
    for i, row in enumerate(trace["issues"]):
        if not isinstance(row, dict):
            problems.append(f"{TRACE}: issues[{i}] is not an object")
            continue
        name = row.get("key") if isinstance(row.get("key"), str) else f"issues[{i}]"
        for field in ("key", "summary", "status", "type"):
            if not isinstance(row.get(field), str) or not row[field].strip():
                problems.append(f"{TRACE}: {name} has no `{field}`")
        if isinstance(row.get("key"), str):
            if not re.fullmatch(r"MP-\d+", row["key"]):
                problems.append(f"{TRACE}: {name} is not an MP-<n> key")
            if row["key"] in seen:
                problems.append(f"{TRACE}: {name} appears more than once")
            seen.add(row["key"])
        code = row.get("code", [])
        if not isinstance(code, list) or not all(isinstance(c, str) and c.strip() for c in code):
            problems.append(f"{TRACE}: {name} has a `code` that is not a list of paths")
    for row in trace["issues"]:
        if isinstance(row, dict) and row.get("parent") is not None and row["parent"] not in seen:
            problems.append(f"{TRACE}: {row.get('key')} names parent {row['parent']!r}, which is not in the trace")
    return trace, problems


def rows(trace: dict | None) -> list[dict]:
    return [r for r in (trace or {}).get("issues", []) if isinstance(r, dict) and isinstance(r.get("key"), str)]


# ---------------------------------------------------------------- cited keys and ARC ids (rules a, b)

def cited_files(root: Path) -> list[Path]:
    files = [root / d for d in ROOT_DOCS]
    files += sorted((root / ".claude/rules").glob("*.md"))
    files += sorted((root / "docs/planning").glob("*.md"))  # top level only
    return files


def key_problems(root: Path, trace: dict | None) -> list[str]:
    known = {r["key"] for r in rows(trace)}
    problems = []
    for f in cited_files(root):
        if not f.is_file():
            problems.append(f"{f.relative_to(root)}: missing (a root doc is always read)")
            continue
        for key in sorted({f"MP-{n}" for n in KEY.findall(f.read_text())}, key=key_order):
            if key not in known:
                problems.append(f"{f.relative_to(root)}: cites {key}, which is not in {TRACE} (refresh it, see refresh-help)")
    return problems


def arc_problems(root: Path) -> list[str]:
    def text(rel: str) -> str:
        p = root / rel
        return p.read_text() if p.is_file() else ""
    defined = set(ARC.findall(text(DIRECTION)))
    problems = []
    for doc in ROOT_DOCS:
        p = root / doc
        if not p.is_file():
            continue  # reported by key_problems
        for arc in sorted(set(ARC.findall(p.read_text()))):
            if arc[-1].isalpha():
                card = ARC_CARDS.get(arc)
                if card is None:
                    problems.append(f"{doc}: cites {arc}, a follow-up card with no card file in plan_sync.ARC_CARDS")
                elif arc not in set(ARC.findall(text(card))):
                    problems.append(f"{doc}: cites {arc}, which is not in its card {card}")
            elif arc not in defined:
                problems.append(f"{doc}: cites {arc}, which is not in {DIRECTION}")
    return problems


# ---------------------------------------------------------------- phases and Confluence pages (rule c)

def load_pages(root: Path) -> list[dict]:
    """build_pages.PAGES, imported read-only (no bytecode written, nothing rendered)."""
    path = root / BUILD_PAGES
    spec = importlib.util.spec_from_file_location(f"_mp_build_pages_{abs(hash(str(path)))}", path)
    if spec is None or spec.loader is None:
        raise ImportError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    old = sys.dont_write_bytecode
    sys.dont_write_bytecode = True
    try:
        spec.loader.exec_module(module)
    finally:
        sys.dont_write_bytecode = old
    pages = getattr(module, "PAGES", None)
    if not isinstance(pages, list):
        raise ImportError("PAGES is not a list")
    return [p for p in pages if isinstance(p, dict)]


def phase_problems(root: Path) -> list[str]:
    try:
        baseline = json.loads((root / BASELINE).read_text())
        phases = [p["id"] for p in baseline["phases"]]
    except (OSError, ValueError, KeyError, TypeError) as e:
        return [f"{BASELINE}: cannot read its phases: {e!r}"]
    try:
        pages = load_pages(root)
    except Exception as e:  # noqa: BLE001 - any failure to import is a failed check
        return [f"{BUILD_PAGES}: cannot import PAGES: {e!r}"]
    try:
        published = json.loads((root / CONFLUENCE).read_text()).get("pages", {})
    except (OSError, ValueError, AttributeError) as e:
        return [f"{CONFLUENCE}: cannot be read: {e!r}"]
    want = {p.lower(): p for p in phases}
    phase_pages = {p.get("slug") for p in pages
                   if p.get("parent") == "phases" or re.fullmatch(r"ph-\d+", str(p.get("slug")))}
    problems = []
    for slug, pid in want.items():
        if slug not in phase_pages:
            problems.append(f"{BASELINE}: phase {pid} has no page `{slug}` in {BUILD_PAGES} PAGES")
        if not (isinstance(published.get(slug), dict) and published[slug].get("id")):
            problems.append(f"{CONFLUENCE}: phase {pid} has no published page id for `{slug}` (publish it with /mp-plan-sync)")
    for slug in sorted(s for s in phase_pages if s not in want):
        problems.append(f"{BUILD_PAGES}: phase page `{slug}` has no phase in {BASELINE}")
    for slug in sorted(s for s in published if re.fullmatch(r"ph-\d+", s) and s not in want):
        problems.append(f"{CONFLUENCE}: page `{slug}` has no phase in {BASELINE}")
    return problems


# ---------------------------------------------------------------- code paths (rule d)

def claims(path: str, rel: str) -> bool:
    """Whether a trace code path covers a repo file: the file itself, a folder above it, or a glob (`*` and `?`
    within a folder, `**` across folders); a glob that names a folder covers what is in it."""
    path = path.rstrip("/")
    if not re.search(r"[*?]", path):
        return rel == path or rel.startswith(path + "/")
    rx = "".join({"**/": "(?:.*/)?", "**": ".*", "*": "[^/]*", "?": "[^/]"}.get(t, re.escape(t))
                 for t in re.split(r"(\*\*/|\*\*|\*|\?)", path))
    return re.fullmatch(rx + r"(?:/.*)?", rel) is not None


def code_problems(root: Path, trace: dict | None) -> list[str]:
    todo = [r for r in rows(trace) if r.get("type") in CODE_TYPES and r.get("status") in FINISHED]
    if not todo:
        return []
    try:
        if git(root, "rev-parse", "--is-shallow-repository").strip() == "true":
            return ["git: shallow clone; the code check needs full history (checkout with fetch-depth: 0)"]
        present = set(git(root, "ls-files", "-z").split("\0")) - {""}
        present |= set(git(root, "ls-files", "--others", "--exclude-standard", "-z").split("\0")) - {""}
        deleted = set(git(root, "log", "--all", "--no-renames", "--diff-filter=D", "--name-only", "--format=").split("\n")) - {""}
    except (OSError, subprocess.CalledProcessError) as e:
        return [f"git: cannot list the repo's files: {getattr(e, 'stderr', '') or e}".strip()]
    problems = []
    for r in todo:
        code = r.get("code") if isinstance(r.get("code"), list) else []
        if not code:
            if not (isinstance(r.get("no_code"), str) and r["no_code"].strip()):
                problems.append(f"{TRACE}: {r['key']} is {r['status']} but names no code (or a `no_code` reason)")
            continue
        for c in code:
            if not isinstance(c, str):
                continue
            if any(claims(c, f) for f in present):
                continue
            if any(claims(c, f) for f in deleted):
                continue  # removed since, and its removal is in git history
            problems.append(f"{TRACE}: {r['key']} ({r['status']}) cites `{c}`, which matches nothing in the repo or its history")
    return problems


def check(root: Path = ROOT) -> list[str]:
    trace, problems = load_trace(root)
    problems += key_problems(root, trace)
    problems += arc_problems(root)
    problems += phase_problems(root)
    problems += code_problems(root, trace)
    return problems


# ---------------------------------------------------------------- pr-files

def branch_key(root: Path, env: dict) -> str | None:
    """The MP key of the branch under test: GITHUB_HEAD_REF when set (a pull_request run checks out the merge
    commit, detached), else the checked-out branch."""
    name = env.get("GITHUB_HEAD_REF") or ""
    if not name:
        r = subprocess.run(["git", "-C", str(root), "rev-parse", "--abbrev-ref", "HEAD"], capture_output=True, text=True)
        name = r.stdout.strip() if r.returncode == 0 else ""
    m = re.match(r"(MP-\d+)(?:\b|$)", name)
    return m.group(1) if m else None


def changed_files(root: Path, base: str) -> tuple[str, list[str]]:
    """The files changed since the merge-base with `base`: committed, uncommitted and untracked."""
    mb = git(root, "merge-base", "HEAD", base).strip()
    changed = git(root, "diff", "--name-only", "--no-renames", "-z", mb).split("\0")
    untracked = git(root, "ls-files", "--others", "--exclude-standard", "-z").split("\0")
    return mb, sorted({f for f in changed + untracked if f})


def default_base(root: Path) -> str:
    for ref in ("origin/main", "main"):
        if subprocess.run(["git", "-C", str(root), "rev-parse", "--verify", "-q", ref], capture_output=True).returncode == 0:
            return ref
    return "origin/main"


def pr_files(root: Path = ROOT, base: str | None = None, key: str | None = None, env: dict | None = None,
             out=print) -> int:
    """0 when every product file the branch changes is claimed by its own issue's trace row; 1 when one is not;
    2 when it cannot tell (bad --key, git failure, or no key in CI)."""
    env = dict(os.environ) if env is None else env
    if key is not None and not re.fullmatch(r"MP-\d+", key):
        out(f"pr-files: --key needs MP-<n>, not {key!r}")
        return 2
    key = key or branch_key(root, env)
    if not key and env.get("CI"):
        out("pr-files: no MP key in GITHUB_HEAD_REF, the branch name or --key; in CI that fails closed")
        return 2
    base = base or default_base(root)
    try:
        mb, files = changed_files(root, base)
    except (OSError, subprocess.CalledProcessError) as e:
        out(f"pr-files: git cannot say what changed since {base}: {getattr(e, 'stderr', '') or e}".strip())
        return 2
    trace, shape = load_trace(root)
    by_key = {r["key"]: r for r in rows(trace)}
    product = [f for f in files if f.startswith(tuple(d + "/" for d in CODE_DIRS))]
    out(f"pr-files: {len(product)} product files changed on {key or 'a branch with no MP key'} since {mb[:7]} ({base})")
    if not key:
        out("pr-files: no MP key outside CI; reported only")
        return 0
    if trace is None:
        for p in shape:
            out(f"  {p}")
        return 1
    own = by_key.get(key, {}).get("code") or []
    if key not in by_key and product:
        out(f"  {key} is not in {TRACE}: refresh the trace (refresh-help)")
    bad = 0
    for f in product:
        if any(isinstance(c, str) and claims(c, f) for c in own):
            continue
        others = sorted({k for k, r in by_key.items() if k != key and any(isinstance(c, str) and claims(c, f) for c in r.get("code") or [])},
                        key=key_order)
        hint = f" (claimed by {', '.join(others)})" if others else ""
        out(f"  UNCLAIMED: {f} is not in {key}'s code in {TRACE}{hint}")
        bad += 1
    out(f"pr-files: {bad} not claimed by {key}")
    return 1 if bad else 0


# ---------------------------------------------------------------- refresh-help

REFRESH = f"""Refresh {TRACE} from Jira (this script cannot reach Jira; CI reads only the mirror):

1. With the Atlassian MCP, run mcp__atlassian__searchJiraIssuesUsingJql with
     cloudId: {CLOUD_ID}
     jql: {JQL}
     fields: ["summary", "status", "issuetype", "parent"], maxResults: 100
   and page with nextPageToken until there is no next page.
2. For every issue write a row: key, summary, type (issuetype.name), status (status.name),
   parent (parent.key, when there is one), and code.
3. code: the repo paths the issue changed, from
     git log main --no-renames --name-only --format= -E --grep '^MP-<n>:'
   (a folder below the top level holding five or more of its files may be listed as the folder;
   globs are allowed). Keep any paths already listed for work not yet merged. An Epic has no code.
   A Story/Task/Bug that is In Review or Done and changed no files needs a `no_code` reason.
4. Set as_of to today's date and keep jql as above. Then run:
     python3 scripts/plan_sync.py check
Reading Jira is free; writing to Jira or publishing Confluence needs its own yes (.claude/rules/mp-workflow.md)."""


# ---------------------------------------------------------------- selftest

FIX_ARCH = "# Architecture\n\nThe baseline sign-off (MP-2) and ARC-01, ARC-02 and ARC-06b. Branches are `MP-<n>-<slug>`.\n"
FIX_BUILD_PAGES = '''import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
B = json.loads((ROOT / "docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json").read_text())
PAGES = [{"slug": "home", "parent": None}, {"slug": "phases", "parent": "home"}]
for _p in B["phases"]:
    PAGES.append({"slug": _p["id"].lower(), "parent": "phases"})
'''


def _fixture(root: Path) -> None:
    """A small repo that passes every rule."""
    def w(rel: str, text: str) -> None:
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text)
    w("README.md", "# MP\n\nSee MP-1 and ARC-01.\n")
    w("ARCHITECTURE.md", FIX_ARCH)
    w("TECH-STACK.md", "# Stack\n\nNo keys here.\n")
    w(".claude/rules/flow.md", "Use `MP-<number>-<slug>` branches.\n")
    w("docs/planning/note.md", "Decided under MP-1.\n")
    w("docs/planning/pack/deep.md", "MP-999 lives below the top level and is not read.\n")
    w(DIRECTION, "| ARC-01 | a |\n| ARC-02 | b |\n")
    w(ARC_CARDS["ARC-06b"], "# ARC-06b card\n")
    w(BASELINE, json.dumps({"phases": [{"id": "PH-00"}, {"id": "PH-01"}]}))
    w(BUILD_PAGES, FIX_BUILD_PAGES)
    w(CONFLUENCE, json.dumps({"pages": {"home": {"id": "1"}, "phases": {"id": "2"}, "ph-00": {"id": "3"}, "ph-01": {"id": "4"}}}))
    w("backend/app/main.py", "print('hi')\n")
    w("backend/app/gone.py", "x = 1\n")
    w("web/src/app.ts", "export {}\n")
    w(TRACE, json.dumps({"as_of": "2026-11-02", "jql": JQL, "issues": [
        {"key": "MP-1", "summary": "Epic", "type": "Epic", "status": "To Do", "code": []},
        {"key": "MP-2", "summary": "Backend", "type": "Story", "status": "Done", "parent": "MP-1",
         "code": ["backend/app/main.py", "backend/app/gone.py"]},
        {"key": "MP-3", "summary": "Web", "type": "Task", "status": "In Review", "code": ["web/src/*.ts"]},
        {"key": "MP-4", "summary": "Planned", "type": "Task", "status": "To Do", "code": ["backend/not/yet.py"]},
    ]}, indent=1))
    g = ["git", "-C", str(root), "-c", "user.name=selftest", "-c", "user.email=selftest@example.invalid",
         "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null"]
    subprocess.run(["git", "init", "-q", "-b", "main", str(root)], check=True)
    subprocess.run([*g, "add", "-A"], check=True)
    subprocess.run([*g, "commit", "-qm", "base"], check=True)
    subprocess.run([*g, "rm", "-q", "backend/app/gone.py"], check=True)
    subprocess.run([*g, "commit", "-qm", "MP-2: remove gone.py"], check=True)


def _git(root: Path, *a: str) -> None:
    subprocess.run(["git", "-C", str(root), "-c", "user.name=selftest", "-c", "user.email=selftest@example.invalid",
                    "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", *a],
                   check=True, capture_output=True)


def _edit(rel: str, fn):
    def apply(root: Path) -> None:
        p = root / rel
        p.write_text(fn(p.read_text()))
    return apply


def _trace(fn):
    def apply(root: Path) -> None:
        p = root / TRACE
        t = json.loads(p.read_text())
        fn(t)
        p.write_text(json.dumps(t))
    return apply


def _row(t: dict, key: str) -> dict:
    return next(r for r in t["issues"] if r["key"] == key)


def _append(rel: str, text: str):
    return _edit(rel, lambda s: s + text)


# (name, mutation, expected substring of a problem, or None when the check must pass)
CHECK_CASES = [
    ("the fixture passes", lambda r: None, None),
    ("a: an unknown key in README fails", _append("README.md", "MP-99\n"), "README.md: cites MP-99"),
    ("a: an unknown key in TECH-STACK fails", _append("TECH-STACK.md", "MP-77\n"), "TECH-STACK.md: cites MP-77"),
    ("a: an unknown key in a .claude rule fails", _append(".claude/rules/flow.md", "see MP-98\n"), "flow.md: cites MP-98"),
    ("a: an unknown key in a top-level planning doc fails", _append("docs/planning/note.md", "MP-97\n"), "note.md: cites MP-97"),
    ("a: a placeholder MP-<n> is no key", _append("README.md", "`MP-<n>: subject`\n"), None),
    ("a: a missing root doc fails", lambda r: (r / "TECH-STACK.md").unlink(), "TECH-STACK.md: missing"),
    ("b: an ARC id not in the direction summary fails", _append("ARCHITECTURE.md", "ARC-13\n"), "cites ARC-13"),
    ("b: ARC-06b missing from its card fails", _edit(ARC_CARDS["ARC-06b"], lambda s: "# card\n"), "not in its card"),
    ("b: ARC-06b in the direction summary only still fails",
     lambda r: (_edit(ARC_CARDS["ARC-06b"], lambda s: "# card\n")(r), _append(DIRECTION, "ARC-06b\n")(r)), "not in its card"),
    ("b: an unknown follow-up card fails", _append("README.md", "ARC-07c\n"), "no card file"),
    ("b: an ARC id only in a non-root doc is not read", _append("docs/planning/note.md", "ARC-55\n"), None),
    ("c: a new phase with no published page fails",
     _edit(BASELINE, lambda s: json.dumps({"phases": [{"id": "PH-00"}, {"id": "PH-01"}, {"id": "PH-02"}]})),
     "phase PH-02 has no published page id"),
    ("c: a phase with no page in PAGES fails",
     _edit(BUILD_PAGES, lambda s: s.replace('PAGES.append', 'if _p["id"] != "PH-01": PAGES.append')),
     "phase PH-01 has no page `ph-01`"),
    ("c: a phase page with no phase fails",
     _append(BUILD_PAGES, 'PAGES.append({"slug": "ph-09", "parent": "phases"})\n'), "phase page `ph-09` has no phase"),
    ("c: a published phase page with no phase fails",
     _edit(CONFLUENCE, lambda s: s.replace('"ph-01"', '"ph-07": {"id": "9"}, "ph-01"')), "`ph-07` has no phase"),
    ("c: build_pages that does not import fails", _append(BUILD_PAGES, "raise RuntimeError('broken')\n"), "cannot import PAGES"),
    ("d: a Done path that never existed fails", _trace(lambda t: _row(t, "MP-2")["code"].append("backend/app/nope.py")),
     "MP-2 (Done) cites `backend/app/nope.py`"),
    ("d: a Done path deleted in git history passes", _trace(lambda t: _row(t, "MP-2").update(code=["backend/app/gone.py"])), None),
    ("d: an In Review glob that matches nothing fails", _trace(lambda t: _row(t, "MP-3").update(code=["web/src/*.tsx"])),
     "MP-3 (In Review) cites `web/src/*.tsx`"),
    ("d: an In Review folder passes", _trace(lambda t: _row(t, "MP-3").update(code=["web/"])), None),
    ("d: an untracked file counts as present",
     lambda r: ((r / "web/src/new.tsx").write_text("x"), _trace(lambda t: _row(t, "MP-3").update(code=["web/src/new.tsx"]))(r)), None),
    ("d: a To Do path that does not exist yet passes", _trace(lambda t: _row(t, "MP-4")["code"].append("infra/later/")), None),
    ("d: a Done issue with no code fails", _trace(lambda t: _row(t, "MP-2").update(code=[])), "names no code"),
    ("d: a Done issue with no code and a reason passes",
     _trace(lambda t: _row(t, "MP-2").update(code=[], no_code="Jira-only housekeeping")), None),
    ("e: unreadable JSON fails", _edit(TRACE, lambda s: s[:-2]), "cannot be read as JSON"),
    ("e: no issues list fails", _edit(TRACE, lambda s: "{}"), "`issues` list"),
    ("e: a missing summary fails", _trace(lambda t: _row(t, "MP-2").pop("summary")), "MP-2 has no `summary`"),
    ("e: a missing status fails", _trace(lambda t: _row(t, "MP-3").pop("status")), "MP-3 has no `status`"),
    ("e: a missing type fails", _trace(lambda t: _row(t, "MP-4").pop("type")), "MP-4 has no `type`"),
    ("e: a missing key fails", _trace(lambda t: _row(t, "MP-4").pop("key")), "has no `key`"),
    ("e: a duplicate key fails", _trace(lambda t: t["issues"].append(dict(_row(t, "MP-4")))), "MP-4 appears more than once"),
    ("e: a key that is not MP-<n> fails", _trace(lambda t: _row(t, "MP-4").update(key="MA-4")), "not an MP-<n> key"),
    ("e: code that is not a list fails", _trace(lambda t: _row(t, "MP-4").update(code="backend/")), "not a list of paths"),
    ("e: an unknown parent fails", _trace(lambda t: _row(t, "MP-2").update(parent="MP-50")), "parent 'MP-50'"),
    ("e: a missing as_of fails", _trace(lambda t: t.pop("as_of")), "missing `as_of`"),
]


def _branch(name: str):
    def make(root: Path) -> None:
        _git(root, "checkout", "-qb", name)
    return make


def _write(rel: str, text: str = "x\n"):
    def make(root: Path) -> None:
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text)
    return make


def _commit(msg: str):
    def make(root: Path) -> None:
        _git(root, "add", "-A")
        _git(root, "commit", "-qm", msg)
    return make


def _detach(root: Path) -> None:
    _git(root, "checkout", "-q", "--detach")


# (name, steps, env, --key, expected exit code)
PR_CASES = [
    ("a claimed committed file passes", [_branch("MP-2-x"), _write("backend/app/main.py", "y\n"), _commit("MP-2: c")], {}, None, 0),
    ("an unclaimed untracked file fails", [_branch("MP-2-x"), _write("web/src/new.ts")], {}, None, 1),
    ("an unclaimed uncommitted change fails", [_branch("MP-2-x"), _write("web/src/app.ts", "y\n")], {}, None, 1),
    ("a file claimed only by another issue fails", [_branch("MP-2-x"), _write("web/src/app.ts", "y\n"), _commit("MP-2: c")], {}, None, 1),
    ("a deleted unclaimed file fails", [_branch("MP-2-x"), lambda r: _git(r, "rm", "-q", "web/src/app.ts")], {}, None, 1),
    ("a deleted claimed file passes", [_branch("MP-3-x"), lambda r: _git(r, "rm", "-q", "web/src/app.ts")], {}, None, 0),
    ("a non-product file needs no claim", [_branch("MP-2-x"), _write("docs/notes.md")], {}, None, 0),
    ("a branch whose key is not in the trace fails", [_branch("MP-50-x"), _write("backend/app/main.py", "z\n")], {}, None, 1),
    ("CI on a detached merge commit takes the key from GITHUB_HEAD_REF",
     [_branch("MP-2-x"), _write("backend/app/main.py", "y\n"), _commit("MP-2: c"), _detach],
     {"CI": "true", "GITHUB_HEAD_REF": "MP-2-x"}, None, 0),
    ("GITHUB_HEAD_REF wins over the checked-out branch name",
     [_branch("MP-2-x"), _write("backend/app/main.py", "y\n"), _commit("MP-2: c")],
     {"CI": "true", "GITHUB_HEAD_REF": "MP-3-y"}, None, 1),
    ("CI on a detached HEAD with no key fails closed", [_branch("MP-2-x"), _detach], {"CI": "true"}, None, 2),
    ("CI on a branch with no MP key fails closed", [_branch("feature-x")], {"CI": "true"}, None, 2),
    ("outside CI with no key it reports and passes", [_branch("feature-x"), _write("web/src/new.ts")], {}, None, 0),
    ("--key overrides a detached HEAD", [_branch("MP-2-x"), _write("web/src/new.ts"), _detach], {}, "MP-2", 1),
    ("--key that is not MP-<n> fails closed", [_branch("MP-2-x")], {}, "main", 2),
]


def selftest(verbose: bool = False) -> int:
    bad = 0
    with tempfile.TemporaryDirectory(prefix="mp-plan-sync-") as tmp:
        base = Path(tmp) / "base"
        _fixture(base)
        for i, (name, mutate, want) in enumerate(CHECK_CASES):
            root = Path(tmp) / f"c{i}"
            shutil.copytree(base, root, symlinks=True)
            mutate(root)
            problems = check(root)
            ok = (not problems) if want is None else any(want in p for p in problems)
            if not ok or verbose:
                print(f"{'ok  ' if ok else 'FAIL'} check: {name}" + ("" if ok else f" -> {problems or 'no problems'}"))
            bad += not ok
        for i, (name, steps, env, key, want) in enumerate(PR_CASES):
            root = Path(tmp) / f"p{i}"
            shutil.copytree(base, root, symlinks=True)
            for step in steps:
                step(root)
            lines: list[str] = []
            got = pr_files(root, base="main", key=key, env=env, out=lines.append)
            ok = got == want
            if not ok or verbose:
                print(f"{'ok  ' if ok else 'FAIL'} pr-files: {name} (exit {got}, want {want})" + ("" if ok else "\n    " + "\n    ".join(lines)))
            bad += not ok
    total = len(CHECK_CASES) + len(PR_CASES)
    print(f"selftest: {total - bad}/{total} cases behave as they should")
    return 1 if bad else 0


# ---------------------------------------------------------------- main

def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check", help="fail on drift between the records")
    pf = sub.add_parser("pr-files", help="fail on product files the branch's issue does not claim")
    pf.add_argument("--base", help="base ref (default: the merge-base with origin/main)")
    pf.add_argument("--key", help="MP-<n> to use instead of GITHUB_HEAD_REF or the branch name")
    sub.add_parser("refresh-help", help="how to refresh docs/planning/trace.json from Jira")
    st = sub.add_parser("selftest", help="prove every rule fails and passes when it should")
    st.add_argument("-v", "--verbose", action="store_true")
    a = ap.parse_args(argv)
    if a.cmd == "check":
        problems = check()
        for p in problems:
            print(p)
        print(f"plan-sync check: {len(problems)} problem(s)" if problems else "plan-sync check: clean")
        return 1 if problems else 0
    if a.cmd == "pr-files":
        return pr_files(base=a.base, key=a.key)
    if a.cmd == "refresh-help":
        print(REFRESH)
        return 0
    return selftest(a.verbose)


if __name__ == "__main__":
    sys.exit(main())
