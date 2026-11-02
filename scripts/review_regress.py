#!/usr/bin/env python3
"""Fixed stays fixed: re-run every check in an MP review ledger before each review round.

    python3 scripts/review_regress.py MP-20 --approved             one issue's ledger (review/MP-20/fixed.json)
    python3 scripts/review_regress.py LOCAL --approved             the ledger for work with no issue (review/fixed.json)
    python3 scripts/review_regress.py MP-20 --approved --jobs 4    its checks in 4 threads, printed in ledger order
    python3 scripts/review_regress.py MP-20 --approved --only R1-C1,R1-F1   only these entries
    python3 scripts/review_regress.py --every --jobs 4             every ledger under review/ as one pool, one total
    python3 scripts/review_regress.py --state MP-20                validate review/MP-20/state.json (LOCAL: review/state.json)
    python3 scripts/review_regress.py --selftest                   prove the runner's own refusals on temporary ledgers

Ported from mypaisa-agent's runner (MP-35). Reads review/MP-<n>/fixed.json (or review/fixed.json for LOCAL): one entry
per blocking finding a review found and a later round fixed, each with a check that passes while the fix holds.
`.codex/rules/review-ledger.md` and `.claude/rules/independent-review.md` describe the ledger. Two formats are read.

MP's format (argv only, no shell, at most 60 s):
- `command`: `argv` (a non-empty list of strings), optional `timeout_seconds` (1 to 60, default 30) and
  `expected_exit_codes` (default [0]).
- `command_fails`: the same, but `expected_exit_codes` is required and must not hold 0.
- `file`: `file` (inside the project, symlinks included) must match (`present`: true, the default) or must not
  match (`present`: false) the regex `pattern`, with `^`/`$` per line. A missing file is not a pass.

mypaisa-agent's format:
- `cmd`: a command that must exit 0, given as `run` (one string, through the shell) or `argv` (a list, no shell),
  exactly one of the two; optional `timeout` in seconds (default 600).
- `cmd_fails`: the same, but the command must exit non-zero.
- `grep`: `file`, or each of `files` (glob patterns allowed), must contain (`present`: true) or must not contain
  (`present`: false) the regex `pattern`, across line breaks, case-insensitively when `ignore_case` is true. A missing
  file, or a glob that matches nothing, FAILs.

Both: `manual`, a check only a person or a tool outside the repo can make (`what`); it is printed and never passes.
Every entry has a unique `id`. `finding` (what the review found) is required for the mypaisa-agent types and, when
present, must be a non-empty string for every type; write one on every new entry. An entry is never deleted: when its
check stops applying, it gains `"retired": "<reason and issue>"`, and the runner skips it, prints
`RETIRED: <id> - <reason>` and counts it.

Every command runs from the repo's root in its own process group. Once it exits, or runs over its time limit, the
whole group is killed (SIGKILL, so a hung grandchild goes too) and the pipe is read for a few seconds more. A FAIL
prints the last 8 lines of the command's output. Identical commands (the same argv or run string, with the same time
limit) run once per invocation, across ledgers under `--every`; later entries reuse the result and say so.

Exit codes: 0 every automated check passed (or there is no ledger: no checks ran); 1 a check FAILed, or `--state`
found a fault, or the selftest went wrong; 2 a malformed ledger or usage error (before anything runs), or a check that
could not complete (it timed out, could not start, or its `file` is missing): never a pass; 3 nothing failed but
`manual` checks remain, which a fresh verifier must clear before any lane starts (`.codex/review-policy.json`).

A single ledger needs `--approved`: the owner's yes to that run (an operator acknowledgement, not proof of consent).
`--every`, `--state` and `--selftest` run without it, because CI runs every ledger on every PR (the owner's choice,
MP-35); `--approved` is still accepted with them.

`--state MP-<n>` (or LOCAL) validates the state file. No state file means no rounds yet: exit 0, so long as the
ledger names no round past 0. MP's shape is `round_count` with a `rounds` list; mypaisa-agent's is `rounds` (a count)
with a `history` list. Either way the rounds are numbered 1 to N with no gap and the count matches; each round names
what was reviewed (`reviewed_commit`, `reviewed_sha` or `sha`, a hex commit, or `reviewed_snapshot` or `snapshot`, a
directory in the repo); a top-level commit equals the last round's, and there is none while no round has run; every
ledger id `R<k>-...` names round 0 or a round the file holds; a round past the fifth of its deliverable (its
`deliverable_round`, else its number) records the owner's word (`review_approval`, `approval`, `approval_scope`,
`asked`, or a note saying the user or owner approved it). Optional fields (`review_approval`, `gate_results`,
`deferred_gates`, `findings`, `blocking`, `blocking_findings`, `nonblocking_findings`, `manual_verification`,
`manual_evidence`, `next_round`, `owner_decisions`) are type-checked when present, top level or per round. A
finding's severity is P0 to P3; MP-16's older wording "nonblocking" is accepted only on a finding whose `blocking` is
false.

`REVIEW_REGRESS_DIR` points the runner at another review folder (the selftest's temporary ledgers); commands still
run from the repo's root.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
from concurrent.futures import Future, ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ISSUE = re.compile(r"MP-[1-9][0-9]*\Z")
MA_DEFAULT_TIMEOUT = 600
MP_DEFAULT_TIMEOUT = 30
MP_MAX_TIMEOUT = 60
TAIL = 8
DRAIN = 5  # seconds to read what is left in the pipe once the command has ended and its group is killed
MA_CMD = ("cmd", "cmd_fails")
MP_CMD = ("command", "command_fails")
CMD = MA_CMD + MP_CMD
KINDS = CMD + ("grep", "file", "manual")


def review_dir(root: Path) -> Path:
    return Path(os.environ["REVIEW_REGRESS_DIR"]) if os.environ.get("REVIEW_REGRESS_DIR") else root / "review"


def valid_key(key: str) -> bool:
    return key == "LOCAL" or bool(ISSUE.fullmatch(key))


def key_folder(review: Path, key: str) -> Path:
    return review if key == "LOCAL" else review / key


def _nonempty(v) -> bool:
    return isinstance(v, str) and bool(v.strip())


def contained_file(root: Path, name: str) -> Path:
    path = Path(name)
    if path.is_absolute() or ".." in path.parts:
        raise ValueError("file path must stay inside the project")
    resolved = (root / path).resolve()
    if not resolved.is_relative_to(root.resolve()) or not resolved.is_file():
        raise ValueError(f"{name} is missing or outside the project")
    return resolved


# ---- commands -------------------------------------------------------------------------------------------------

def cmd_limit(c: dict) -> float:
    if c["type"] in MP_CMD:
        return c.get("timeout_seconds", MP_DEFAULT_TIMEOUT)
    return c.get("timeout", MA_DEFAULT_TIMEOUT)


def cmd_text(c: dict) -> str:
    return c["run"] if "run" in c else " ".join(c["argv"])


def cmd_key(c: dict) -> tuple:
    """Two entries share a run only when the command and its time limit are both the same."""
    return ("run", c["run"], cmd_limit(c)) if "run" in c else ("argv", tuple(c["argv"]), cmd_limit(c))


def _killpg(pgid: int) -> None:
    try:
        os.killpg(pgid, signal.SIGKILL)
    except (ProcessLookupError, PermissionError):
        pass


def run_command(root: Path, c: dict) -> dict:
    """Run a command check in its own process group. The time limit is on the command itself: once it exits (or runs
    over and is killed) its group is killed and the pipe is read for DRAIN seconds more. A process that setsids away
    escapes the kill, and the output it holds back is reported lost."""
    limit = cmd_limit(c)
    shell = "run" in c
    start = time.monotonic()
    try:
        p = subprocess.Popen(c["run"] if shell else c["argv"], shell=shell, cwd=root, stdout=subprocess.PIPE,
                             stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, start_new_session=True)
    except OSError as err:  # a program that does not exist, or cannot be run
        return {"rc": None, "timed_out": False, "timeout": limit, "output": "", "secs": time.monotonic() - start,
                "error": f"could not start: {err}"}
    chunks: list[bytes] = []
    fd = p.stdout.fileno()

    def drain() -> None:
        while True:
            try:
                b = os.read(fd, 65536)
            except OSError:
                return
            if not b:
                return
            chunks.append(b)

    reader = threading.Thread(target=drain, daemon=True)
    reader.start()
    timed_out = False
    try:
        p.wait(timeout=limit)
    except subprocess.TimeoutExpired:
        timed_out = True
    _killpg(p.pid)  # on a timeout the command and its group; otherwise whatever it left running in its group
    if timed_out:
        p.wait()
    reader.join(timeout=DRAIN)
    out = b"".join(chunks).decode(errors="replace")
    if reader.is_alive():
        out += "\n(output after this point lost: a process outside the group held the pipe open)"
    else:
        p.stdout.close()
    return {"rc": p.returncode, "timed_out": timed_out, "timeout": limit, "output": out,
            "secs": time.monotonic() - start}


def judge(c: dict, res: dict) -> tuple[str, str, list[str]]:
    """A command check's verdict: (status, what, the output's tail when it did not pass)."""
    tail = res["output"].rstrip("\n").splitlines()[-TAIL:]
    if res.get("error"):  # never a pass, for the *_fails types either: nothing ran to fail
        return "ERROR", f"{cmd_text(c)} ({res['error']})", tail
    if res["timed_out"]:
        return "ERROR", f"{cmd_text(c)} (timed out after {res['timeout']} s)", tail
    rc = res["rc"]
    if rc < 0:
        return "FAIL", f"{cmd_text(c)} (terminated by signal {-rc})", tail
    if c["type"] in MP_CMD:
        expected = c.get("expected_exit_codes", [0])
        ok, want = rc in expected, f"expected {', '.join(map(str, expected))}"
    else:
        ok = (rc == 0) == (c["type"] == "cmd")
        want = "expected 0" if c["type"] == "cmd" else "expected non-zero"
    return ("PASS" if ok else "FAIL"), (cmd_text(c) if ok else f"{cmd_text(c)} (exit {rc}, {want})"), ([] if ok else tail)


# ---- the other checks -----------------------------------------------------------------------------------------

def check_other(root: Path, c: dict) -> tuple[str, str, list[str]]:
    kind = c["type"]
    if kind == "manual":
        return "MANUAL", c["what"], []
    if kind == "file":
        try:
            text = contained_file(root, c["file"]).read_text(encoding="utf-8")
        except (ValueError, OSError) as err:
            return "ERROR", str(err), []
        want = c.get("present", True)
        found = bool(re.search(c["pattern"], text, flags=re.MULTILINE))
        return ("PASS" if found == want else "FAIL"), f"{c['file']} {'has' if want else 'lacks'} /{c['pattern']}/", []
    # grep
    files, missing = [], []
    for f in c.get("files") or [c["file"]]:
        if any(ch in f for ch in "*?["):
            found = sorted(p.relative_to(root).as_posix() for p in root.glob(f) if p.is_file())
        else:
            found = [f]
        good = []
        for x in found:
            try:
                contained_file(root, x)
                good.append(x)
            except ValueError:
                pass
        if not found or len(good) != len(found):
            missing.append(f)
        files += good
    if missing:
        return "FAIL", f"missing or outside the repo: {', '.join(missing)}", []
    flags = re.M | (re.I if c.get("ignore_case") else 0)
    hits = [f for f in files if re.search(c["pattern"], (root / f).read_text(encoding="utf-8"), flags)]
    want = c.get("present", True)
    ok = len(hits) == len(files) if want else not hits
    detail = f" (lacking in {', '.join(f for f in files if f not in hits)})" if want and not ok else ""
    detail += f" (found in {', '.join(hits)})" if hits and not want else ""
    return ("PASS" if ok else "FAIL"), f"{len(files)} file(s) {'have' if want else 'lack'} /{c['pattern']}/{detail}", []


# ---- the ledger -----------------------------------------------------------------------------------------------

def _exit_codes_ok(v) -> bool:
    return (isinstance(v, list) and bool(v)
            and all(isinstance(x, int) and not isinstance(x, bool) and 0 <= x <= 255 for x in v))


def entry_faults(e) -> list[str]:
    """What makes an entry malformed (exit 2), checked before anything runs."""
    if not isinstance(e, dict):
        return [f"an entry is not an object: {e!r:.60}"]
    eid = e.get("id")
    if not _nonempty(eid):
        return [f"an entry has no id: {json.dumps(e)[:80]}"]
    out = []
    if "retired" in e and not _nonempty(e["retired"]):
        out.append(f"{eid}: retired must give the reason and the issue, a non-empty string")
    c = e.get("check")
    if not isinstance(c, dict):
        return out + [f"{eid}: no check object"]
    kind = c.get("type")
    if kind not in KINDS:
        return out + [f"{eid}: unknown check type {kind!r}"]
    if ("finding" in e or kind in MA_CMD + ("grep",)) and not _nonempty(e.get("finding")):
        out.append(f"{eid}: finding must say what the review found, a non-empty string")
    if kind in MA_CMD:
        has_run, has_argv = "run" in c, "argv" in c
        if has_run == has_argv:
            out.append(f"{eid}: a {kind} check takes run or argv, exactly one")
        elif has_run and not _nonempty(c["run"]):
            out.append(f"{eid}: run must be a non-empty string")
        elif has_argv and not (isinstance(c["argv"], list) and c["argv"] and all(_nonempty(a) for a in c["argv"])):
            out.append(f"{eid}: argv must be a non-empty list of strings")
        t = c.get("timeout", MA_DEFAULT_TIMEOUT)
        if isinstance(t, bool) or not isinstance(t, (int, float)) or t <= 0:
            out.append(f"{eid}: timeout must be a positive number of seconds, got {t!r}")
    elif kind in MP_CMD:
        if "run" in c:
            out.append(f"{eid}: a {kind} check takes argv only, never a shell string")
        argv = c.get("argv")
        if not (isinstance(argv, list) and argv and all(_nonempty(a) for a in argv)):
            out.append(f"{eid}: argv must be a non-empty list of strings")
        t = c.get("timeout_seconds", MP_DEFAULT_TIMEOUT)
        if isinstance(t, bool) or not isinstance(t, int) or not 1 <= t <= MP_MAX_TIMEOUT:
            out.append(f"{eid}: timeout_seconds must be a whole number from 1 to {MP_MAX_TIMEOUT}, got {t!r}")
        expected = c.get("expected_exit_codes", [0] if kind == "command" else None)
        if not _exit_codes_ok(expected):
            out.append(f"{eid}: expected_exit_codes must be a non-empty list of exit codes"
                       + (" (command_fails needs it)" if kind == "command_fails" else ""))
        elif kind == "command_fails" and 0 in expected:
            out.append(f"{eid}: command_fails cannot accept a successful exit")
    elif kind in ("grep", "file"):
        targets = (c.get("files") or [c.get("file")]) if kind == "grep" else [c.get("file")]
        if not (isinstance(c.get("pattern"), str) and targets and all(_nonempty(t) for t in targets)):
            out.append(f"{eid}: a {kind} check needs a pattern and a file" + (" or files" if kind == "grep" else ""))
        else:
            for t in targets:
                if Path(t).is_absolute() or ".." in Path(t).parts:
                    out.append(f"{eid}: {t} must stay inside the project")
            try:
                re.compile(c["pattern"], re.M | (re.I if c.get("ignore_case") else 0))
            except re.error as err:
                out.append(f"{eid}: pattern {c['pattern']!r} is not a valid regex ({err})")
        if "present" in c and not isinstance(c["present"], bool):
            out.append(f"{eid}: present must be true or false")
    elif kind == "manual" and not _nonempty(c.get("what")):
        out.append(f"{eid}: a manual check needs what")
    return out


def load_ledger(path: Path, label: str) -> tuple[list, list[str]]:
    try:
        entries = json.loads(path.read_text(encoding="utf-8"))
    except ValueError as err:
        return [], [f"{label}: not JSON ({err})"]
    if not isinstance(entries, list):
        return [], [f"{label}: the ledger must be a list of entries"]
    faults, seen = [], set()
    for e in entries:
        faults += entry_faults(e)
        if isinstance(e, dict) and isinstance(e.get("id"), str):
            if e["id"] in seen:
                faults.append(f"{e['id']}: the id is used twice")
            seen.add(e["id"])
    return entries, [f"{label}: {f}" for f in faults]


def locate_ledger(root: Path, review: Path, key: str) -> Path | None:
    """The ledger's path, or None when there is none. Raises ValueError/OSError when it cannot be read safely: a
    dangling or escaping symlink, a parent that is not a directory, or a folder that cannot be listed."""
    folder = key_folder(review, key)
    for parent in dict.fromkeys((review, folder)):
        try:
            parent.lstat()
        except FileNotFoundError:
            return None
        if parent.is_symlink():
            resolved = parent.resolve(strict=True)
            if not resolved.is_relative_to(root.resolve()) or not resolved.is_dir():
                raise ValueError(f"{parent} is outside the project or not a directory")
        elif not parent.is_dir():
            raise ValueError(f"{parent} is not a directory")
    ledger = folder / "fixed.json"
    try:
        ledger.lstat()
    except FileNotFoundError:
        return None
    resolved = ledger.resolve()
    allowed = (root.resolve(), review.resolve())
    if not any(resolved.is_relative_to(a) for a in allowed) or not resolved.is_file():
        raise ValueError(f"{ledger} is missing, dangling or outside the project")
    return resolved


# ---- running ledgers ------------------------------------------------------------------------------------------

def run_ledgers(root: Path, stories: list[tuple[str, list[dict], int]], jobs: int, every: bool) -> int:
    """Run (key, entries, ledger size) stories as one pool, print in ledger order, return the exit code."""
    pool = ThreadPoolExecutor(max_workers=jobs)
    first_of: dict[tuple, tuple[Future, str]] = {}
    plan = []
    for key, entries, _ in stories:
        rows = []
        for e in entries:
            if "retired" in e:
                rows.append((e, None, None))
                continue
            c = e["check"]
            if c["type"] in CMD:
                k = cmd_key(c)
                if k in first_of:
                    rows.append((e, first_of[k][0], first_of[k][1]))
                    continue
                fut = pool.submit(run_command, root, c)
                first_of[k] = (fut, f"{key} {e['id']}" if every else e["id"])
                rows.append((e, fut, None))
            else:
                rows.append((e, pool.submit(check_other, root, c), None))
        plan.append(rows)

    names = ("checks", "run", "retired", "passed", "failed", "errors", "manual", "reused")
    tot = dict.fromkeys(names, 0)
    try:
        for (key, entries, size), rows in zip(stories, plan):
            n = dict.fromkeys(names, 0)
            if every:
                print(f"\n== {key} ({len(entries)} checks)", flush=True)
            for e, fut, dup in rows:
                n["checks"] += 1
                label = f"{e['id']}: {e['finding']}" if e.get("finding") else e["id"]
                if fut is None:
                    n["retired"] += 1
                    print(f"RETIRED: {e['id']} - {e['retired']}", flush=True)
                    continue
                c = e["check"]
                if c["type"] in CMD:
                    status, what, tail = judge(c, fut.result())
                    if dup:
                        n["reused"] += 1
                        what += f"; same command as {dup}, run once"
                else:
                    status, what, tail = fut.result()
                if status == "MANUAL":
                    n["manual"] += 1
                    print(f"MANUAL {label} [{what}]", flush=True)
                    continue
                n["run"] += 1
                n[{"PASS": "passed", "FAIL": "failed", "ERROR": "errors"}[status]] += 1
                print(f"{'ok    ' if status == 'PASS' else status.ljust(6)} {label} [{what}]", flush=True)
                for ln in tail:
                    print(f"        | {ln}", flush=True)
            scope = f" (--only: {len(entries)} of {size})" if len(entries) != size else ""
            print(f"review-regress {key}: {n['checks']} checks{scope}: {n['run']} run ({n['passed']} passed, "
                  f"{n['failed']} failed, {n['errors']} could not complete), {n['retired']} retired, "
                  f"{n['manual']} manual" + (f", {n['reused']} reused a command already run" if n["reused"] else ""),
                  flush=True)
            for k in tot:
                tot[k] += n[k]
    finally:
        pool.shutdown(wait=True, cancel_futures=True)
    if every:
        print(f"\nreview-regress, every ledger ({len(stories)}): {tot['checks']} checks: {tot['run']} run "
              f"({tot['passed']} passed, {tot['failed']} failed, {tot['errors']} could not complete), "
              f"{tot['retired']} retired, {tot['manual']} manual; {len(first_of)} distinct commands run, "
              f"{tot['reused']} reused")
    if tot["errors"]:
        return 2
    if tot["failed"]:
        return 1
    return 3 if tot["manual"] else 0


def run(root: Path, issue: str, jobs: int = 1, only: list[str] | None = None) -> int:
    """Run one ledger (MP-<n> or LOCAL) and return the exit code."""
    if not valid_key(issue):
        print("Invalid key; expected MP-<positive number> or LOCAL.", file=sys.stderr)
        return 2
    review = review_dir(root)
    try:
        path = locate_ledger(root, review, issue)
        if path is None:
            if only:
                print(f"review-regress {issue}: --only names {', '.join(only)} but there is no ledger", file=sys.stderr)
                return 2
            print(f"{issue}: no fixed-findings ledger yet; no checks ran.")
            return 0
        entries, faults = load_ledger(path, issue)
    except (ValueError, OSError) as err:
        print(f"Unable to complete regression checks: {err}", file=sys.stderr)
        return 2
    if faults:
        print("review-regress: malformed ledger, nothing run:\n  " + "\n  ".join(faults), file=sys.stderr)
        return 2
    total = len(entries)
    if only:
        unknown = [i for i in only if i not in {e["id"] for e in entries}]
        if unknown:
            print(f"review-regress {issue}: --only names ids the ledger does not hold: {', '.join(unknown)}",
                  file=sys.stderr)
            return 2
        entries = [e for e in entries if e["id"] in set(only)]
    return run_ledgers(root, [(issue, entries, total)], jobs, every=False)


def every_ledger(root: Path, review: Path) -> list[tuple[str, Path]]:
    keys = (["LOCAL"] if (review / "fixed.json").exists() else [])
    keys += sorted(p.parent.name for p in review.glob("*/fixed.json"))
    return [(k, key_folder(review, k) / "fixed.json") for k in keys]


def run_every(root: Path, jobs: int) -> int:
    review = review_dir(root)
    stories, faults = [], []
    for key, _ in every_ledger(root, review):
        if not valid_key(key):
            faults.append(f"{key}: a ledger folder must be named MP-<n>")
            continue
        try:
            path = locate_ledger(root, review, key)
            if path is None:
                continue
            entries, f = load_ledger(path, key)
        except (ValueError, OSError) as err:
            faults.append(f"{key}: {err}")
            continue
        faults += f
        stories.append((key, entries, len(entries)))
    if faults:
        print("review-regress: malformed ledger(s), nothing run:\n  " + "\n  ".join(faults), file=sys.stderr)
        return 2
    return run_ledgers(root, stories, jobs, every=True)


# ---- the state file -------------------------------------------------------------------------------------------

SHA = re.compile(r"^[0-9a-f]{7,40}$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
LEDGER_ROUND = re.compile(r"^r(\d+)-", re.I)
COMMIT_KEYS = ("reviewed_commit", "reviewed_sha", "sha")
SNAPSHOT_KEYS = ("reviewed_snapshot", "snapshot")
APPROVAL_KEYS = ("review_approval", "approval", "approval_scope", "asked")
APPROVED_NOTE = re.compile(r"\b(user|owner|arun)\b[^.]*\bapprov", re.I)
MANUAL_FIELDS = ("finding_id", "evidence", "verifier", "result")


def _whole(v) -> bool:
    return isinstance(v, int) and not isinstance(v, bool) and v >= 0


def _given(v) -> bool:
    return _nonempty(v) or (isinstance(v, dict) and bool(v)) or v is True


def optional_faults(where: str, d: dict, round_no: int | None) -> list[str]:
    out = []
    if "review_approval" in d and not _given(d["review_approval"]):
        out.append(f"{where}: review_approval must record the owner's answer (a string or an object)")
    if "gate_results" in d:
        g = d["gate_results"]
        if isinstance(g, list):
            for i, r in enumerate(g):
                if not (_nonempty(r) or (isinstance(r, dict) and (_nonempty(r.get("command")) or _nonempty(r.get("gate"))
                                                                  or _nonempty(r.get("check"))) and "result" in r)):
                    out.append(f"{where}: gate_results[{i}] must be a non-empty string, or a command (or gate) with a result")
        elif isinstance(g, dict):
            if not all(isinstance(k, str) and isinstance(v, (str, bool, int, dict, list)) for k, v in g.items()):
                out.append(f"{where}: gate_results maps each gate to its result")
        else:
            out.append(f"{where}: gate_results must be a list or an object")
    if "deferred_gates" in d and not (isinstance(d["deferred_gates"], list)
                                      and all(_nonempty(x) or isinstance(x, dict) for x in d["deferred_gates"])):
        out.append(f"{where}: deferred_gates must be a list of gates (strings or objects), each with why")
    if "findings" in d:
        fs = d["findings"]
        if not isinstance(fs, list):
            out.append(f"{where}: findings must be a list")
        else:
            for i, f in enumerate(fs):
                at = f"{where}: findings[{i}]"
                if not isinstance(f, dict):
                    out.append(f"{at} is not an object")
                    continue
                if not _nonempty(f.get("id")):
                    out.append(f"{at}: id must be a non-empty string")
                else:
                    m = re.match(r"^R(\d+)-", f["id"], re.I)
                    if m and round_no is not None and int(m.group(1)) != round_no:
                        out.append(f"{at}: id {f['id']} is not round {round_no}'s")
                legacy = f.get("severity") == "nonblocking" and f.get("blocking") is False  # MP-16's round 1 wording
                if f.get("severity") not in ("P0", "P1", "P2", "P3") and not legacy:
                    out.append(f"{at}: severity must be P0 to P3, got {f.get('severity')!r}")
                if not isinstance(f.get("blocking"), bool):
                    out.append(f"{at}: blocking must be true or false")
                if not (_nonempty(f.get("finding")) or _nonempty(f.get("evidence"))):
                    out.append(f"{at}: needs the finding or its evidence, a non-empty string")
                if "status" in f and not _nonempty(f["status"]):
                    out.append(f"{at}: status must be a non-empty string")
                lane = f.get("lane")
                if "lane" in f and not (_nonempty(lane) or (isinstance(lane, list) and lane and all(map(_nonempty, lane)))):
                    out.append(f"{at}: lane must be a lane name or a list of them")
    for k in ("blocking_findings", "nonblocking_findings"):
        if k in d and not (isinstance(d[k], list) and all(_nonempty(x) or (isinstance(x, dict) and _nonempty(x.get("id")))
                                                         for x in d[k])):
            out.append(f"{where}: {k} must be a list of ids, or of objects with an id")
    if round_no is not None and "blocking" in d and not _whole(d["blocking"]):
        out.append(f"{where}: blocking must be a whole number of blocking findings, got {d['blocking']!r}")
    for k in ("manual_verification", "manual_evidence"):
        if k in d:
            v = d[k]
            if not isinstance(v, list):
                out.append(f"{where}: {k} must be a list")
                continue
            for i, x in enumerate(v):
                if not (isinstance(x, dict) and all(_nonempty(x.get(f)) for f in MANUAL_FIELDS)):
                    out.append(f"{where}: {k}[{i}] needs {', '.join(MANUAL_FIELDS)} (.codex/review-policy.json)")
    if "next_round" in d and not (d["next_round"] is None or _nonempty(d["next_round"]) or isinstance(d["next_round"], dict)):
        out.append(f"{where}: next_round must be a string, an object or null")
    if "owner_decisions" in d:
        od = d["owner_decisions"]
        if not isinstance(od, list):
            out.append(f"{where}: owner_decisions must be a list")
        else:
            for i, x in enumerate(od):
                ok = (isinstance(x, dict) and isinstance(x.get("date"), str) and DATE.match(x["date"])
                      and isinstance(x.get("story"), str) and ISSUE.fullmatch(x["story"])
                      and _nonempty(x.get("what")) and _nonempty(x.get("words")))
                if not ok:
                    out.append(f"{where}: owner_decisions[{i}] needs date (YYYY-MM-DD), story (MP-<n>), what and words")
    return out


def ledger_round_faults(root: Path, review: Path, key: str, rounds: int) -> list[str]:
    """Each ledger id R<k>- (any case) names round 0 or one of the state's rounds."""
    try:
        path = locate_ledger(root, review, key)
    except (ValueError, OSError) as err:
        return [f"ledger cannot be read: {err}"]
    if path is None:
        return []
    entries, out = load_ledger(path, "ledger")
    for e in entries:
        m = LEDGER_ROUND.match(e["id"] if isinstance(e, dict) and isinstance(e.get("id"), str) else "")
        if m and int(m.group(1)) > rounds:
            out.append(f"ledger id {e['id']} names round {m.group(1)}, which the state file does not hold")
    return out


def reviewed_faults(root: Path, where: str, h: dict) -> tuple[list[str], str | None]:
    out, commit = [], None
    commits = [h[k] for k in COMMIT_KEYS if k in h]
    snaps = [h[k] for k in SNAPSHOT_KEYS if k in h]
    if not commits and not snaps:
        return [f"{where} names nothing it reviewed (reviewed_commit, reviewed_sha or reviewed_snapshot)"], None
    for c in commits:
        if not (isinstance(c, str) and SHA.match(c)):
            out.append(f"{where}: reviewed commit {c!r} is not a hex commit")
        else:
            commit = commit or c
    for s in snaps:
        if not (_nonempty(s) and not Path(s).is_absolute() and ".." not in Path(s).parts and (root / s).is_dir()):
            out.append(f"{where}: reviewed snapshot {s!r} is not a directory in the repo")
    return out, commit


def state_faults(root: Path, key: str) -> list[str]:
    review = review_dir(root)
    path = key_folder(review, key) / "state.json"
    if not path.is_file():  # no rounds yet: the ledger may hold only round 0's fixes
        return ledger_round_faults(root, review, key, 0)
    try:
        s = json.loads(path.read_text(encoding="utf-8"))
    except ValueError as err:
        return [f"state.json is not JSON ({err})"]
    if not isinstance(s, dict):
        return ["state.json must be an object"]
    out = []
    if "history" in s:  # mypaisa-agent's shape
        hist, count, count_name, list_name = s["history"], s.get("rounds"), "rounds", "history"
    else:  # MP's shape
        hist, count, count_name, list_name = s.get("rounds"), s.get("round_count"), "round_count", "rounds"
    if not isinstance(hist, list) or not all(isinstance(h, dict) for h in hist):
        return [f"{list_name} must be a list of rounds (objects)"]
    nums = [h.get("round") for h in hist]
    if nums != list(range(1, len(hist) + 1)):
        out.append(f"{list_name} rounds are numbered {nums}, not 1 to {len(hist)} in order")
    if not _whole(count) or count != len(hist):
        out.append(f"{count_name} is {count!r} but {list_name} holds {len(hist)} rounds")
    commits = []
    for i, h in enumerate(hist, 1):
        where = f"round {h.get('round', i)}"
        faults, commit = reviewed_faults(root, where, h)
        out += faults
        commits.append(commit)
        rn = h.get("round") if isinstance(h.get("round"), int) else None
        out += optional_faults(where, h, rn)
        ordinal = h.get("deliverable_round", i)
        if not _whole(ordinal) or ordinal < 1:
            out.append(f"{where}: deliverable_round must be a whole number from 1, got {ordinal!r}")
        elif ordinal > 5:
            noted = any(APPROVED_NOTE.search(h[k]) for k in ("snapshot_note", "note") if isinstance(h.get(k), str))
            top = isinstance(s.get("note"), str) and APPROVED_NOTE.search(s["note"]) and re.search(rf"\bround {i}\b", s["note"])
            if not (any(_given(h.get(k)) for k in APPROVAL_KEYS) or noted or top):
                out.append(f"{where} is past the fifth round of its deliverable with no record of the owner's word "
                           f"({', '.join(APPROVAL_KEYS)}, or a note saying the owner approved it)")
    for k in COMMIT_KEYS:
        if k in s:
            if not hist:
                out.append(f"{k} {s[k]!r} is set, but no round has run")
            elif commits and commits[-1] is not None and s[k] != commits[-1]:
                out.append(f"{k} {s[k]!r} is not the last round's ({commits[-1]!r})")
    out += optional_faults("state", s, None)
    return out + ledger_round_faults(root, review, key, len(hist))


def run_state(root: Path, key: str) -> int:
    if not valid_key(key):
        print("review-regress: --state takes MP-<positive number> or LOCAL", file=sys.stderr)
        return 2
    faults = state_faults(root, key)
    for f in faults:
        print(f"fault  {key}: {f}")
    fresh = "" if (key_folder(review_dir(root), key) / "state.json").is_file() else " (no state file: no rounds yet)"
    print(f"review-regress --state {key}: " + (f"{len(faults)} fault(s)" if faults else "ok") + fresh)
    return 1 if faults else 0


# ---- selftest -------------------------------------------------------------------------------------------------

def _alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    r = subprocess.run(["ps", "-o", "stat=", "-p", str(pid)], capture_output=True, text=True)
    return bool(r.stdout.strip()) and not r.stdout.strip().startswith("Z")


def selftest() -> int:
    wrong, cases = [], 0
    py = sys.executable
    with tempfile.TemporaryDirectory() as tmp:
        t = Path(tmp)
        rev = t / "review"

        def ledger(key: str, entries: list, state: dict | None = None) -> None:
            folder = rev if key == "LOCAL" else rev / key
            folder.mkdir(parents=True, exist_ok=True)
            (folder / "fixed.json").write_text(json.dumps(entries))
            if state is not None:
                (folder / "state.json").write_text(json.dumps(state))

        def run_(*args: str) -> subprocess.CompletedProcess:
            env = dict(os.environ, REVIEW_REGRESS_DIR=str(rev))
            return subprocess.run([py, str(Path(__file__).resolve()), *args], env=env, cwd=ROOT,
                                  capture_output=True, text=True, timeout=120)

        def case(name: str, ok: bool, out: str = "") -> None:
            nonlocal cases
            cases += 1
            if not ok:
                wrong.append(name)
                print(f"WRONG {name}\n" + "\n".join(f"        | {ln}" for ln in out.splitlines()[-12:]))
            else:
                print(f"ok    {name}")

        # 1. a timeout kills the child and its grandchild and is never a pass (exit 2)
        cp, gp = t / "child.pid", t / "grandchild.pid"
        ledger("MP-901", [{"id": "R1-1", "finding": "sleeps", "check": {
            "type": "cmd", "timeout": 1,
            "run": f"echo $$ > {cp}; sh -c 'echo $$ > {gp}; exec sleep 300' & sleep 300"}}])
        start = time.monotonic()
        r = run_("MP-901", "--approved")
        took = time.monotonic() - start
        pids = [int(p.read_text()) for p in (cp, gp) if p.is_file()]
        deadline = time.monotonic() + 5
        while any(_alive(p) for p in pids) and time.monotonic() < deadline:
            time.sleep(0.1)
        case("a timeout kills the child and the grandchild and exits 2",
             r.returncode == 2 and "timed out after 1 s" in r.stdout and len(pids) == 2
             and not any(_alive(p) for p in pids) and took < 30, r.stdout + r.stderr)

        # 2. an identical command runs once, within a ledger and across ledgers under --every
        shutil.rmtree(rev, ignore_errors=True)
        counter = t / "count"
        same = {"type": "cmd", "run": f"echo x >> {counter}"}
        ledger("MP-902", [{"id": "R1-1", "finding": "a", "check": same}, {"id": "R1-2", "finding": "b", "check": same}])
        ledger("MP-903", [{"id": "R1-1", "finding": "c", "check": same},
                          {"id": "R1-2", "finding": "d", "check": {"type": "command", "argv": [py, "-c", "pass"]}}])
        r = run_("--every", "--jobs", "3")
        runs = len(counter.read_text().splitlines()) if counter.is_file() else 0
        case("a duplicate command runs once, and later entries say so",
             r.returncode == 0 and runs == 1 and r.stdout.count("run once") == 2, r.stdout + r.stderr)

        # 3. --every reads the LOCAL ledger too, and needs no --approved
        ledger("LOCAL", [{"id": "R1-1", "finding": "local", "check": {"type": "command", "argv": [py, "-c", "pass"]}}])
        r = run_("--every")
        case("--every runs review/fixed.json as LOCAL without --approved",
             r.returncode == 0 and "== LOCAL" in r.stdout and "every ledger (3)" in r.stdout, r.stdout + r.stderr)
        shutil.rmtree(rev, ignore_errors=True)

        # 4. a single ledger still needs --approved
        ledger("MP-904", [{"id": "R1-1", "finding": "f", "check": {"type": "cmd", "run": "true"}}])
        r = run_("MP-904")
        case("a single ledger without --approved exits 2", r.returncode == 2 and "approval is required" in r.stderr,
             r.stdout + r.stderr)

        # 5. a retired entry is skipped, printed and counted
        marker = t / "retired-ran"
        ledger("MP-905", [{"id": "R1-1", "finding": "kept", "check": {"type": "cmd", "argv": [py, "-c", "pass"]}},
                          {"id": "R1-2", "finding": "stopped", "retired": "target removed in MP-34",
                           "check": {"type": "cmd", "run": f"touch {marker}"}}])
        r = run_("MP-905", "--approved")
        case("a retired entry is skipped, printed and counted",
             r.returncode == 0 and not marker.exists() and "RETIRED: R1-2 - target removed in MP-34" in r.stdout
             and "1 retired" in r.stdout, r.stdout + r.stderr)

        # 6. exit 3 for manual leftovers; exit 1 with the output's tail on a failure; exit 2 on a malformed entry
        ledger("MP-906", [{"id": "R1-1", "finding": "passes", "check": {"type": "cmd", "run": "true"}},
                          {"id": "R1-2", "finding": "by eye", "check": {"type": "manual", "what": "look at it"}}])
        r = run_("MP-906", "--approved")
        case("a manual check left over exits 3", r.returncode == 3 and "1 manual" in r.stdout, r.stdout + r.stderr)
        ledger("MP-907", [{"id": "R1-1", "finding": "fails", "check": {
            "type": "cmd", "run": "for i in 1 2 3 4 5 6 7 8 9 10; do echo line$i; done; exit 4"}},
            {"id": "R1-2", "finding": "by eye", "check": {"type": "manual", "what": "look"}}])
        r = run_("MP-907", "--approved")
        case("a FAIL exits 1 and prints the last 8 lines of its output",
             r.returncode == 1 and "| line10" in r.stdout and "| line3" in r.stdout and "| line2\n" not in r.stdout,
             r.stdout + r.stderr)
        ledger("MP-908", [{"id": "R1-1", "finding": "both", "check": {"type": "cmd", "run": "true", "argv": ["true"]}}])
        r = run_("MP-908", "--approved")
        case("a malformed entry exits 2 before anything runs", r.returncode == 2, r.stdout + r.stderr)

        # 7. MP's format: expected exit codes, command_fails, file checks, and its refusals
        ledger("MP-909", [
            {"id": "R1-1", "finding": "exit 3 expected", "check": {
                "type": "command", "argv": [py, "-c", "raise SystemExit(3)"], "expected_exit_codes": [3]}},
            {"id": "R1-2", "finding": "refuses", "check": {
                "type": "command_fails", "argv": [py, "-c", "raise SystemExit(5)"], "expected_exit_codes": [5]}},
            {"id": "R1-3", "check": {"type": "file", "file": "scripts/review_regress.py", "pattern": "^ROOT = "}},
            {"id": "R1-4", "check": {"type": "file", "file": "scripts/review_regress.py", "pattern": "^NO SUCH LINE$",
                                     "present": False}}])
        r = run_("MP-909", "--approved")
        case("MP command, command_fails and file checks pass", r.returncode == 0 and "4 passed" in r.stdout,
             r.stdout + r.stderr)
        for name, bad in (("a shell string in an MP command", {"type": "command", "argv": "echo unsafe"}),
                          ("command_fails with no exit codes", {"type": "command_fails", "argv": ["false"]}),
                          ("command_fails accepting 0", {"type": "command_fails", "argv": ["true"],
                                                         "expected_exit_codes": [0, 1]}),
                          ("timeout_seconds past 60", {"type": "command", "argv": ["true"], "timeout_seconds": 61}),
                          ("a file path leaving the repo", {"type": "file", "file": "../outside.txt", "pattern": "x"})):
            ledger("MP-910", [{"id": "R1-1", "finding": "f", "check": bad}])
            r = run_("MP-910", "--approved")
            case(f"{name} exits 2", r.returncode == 2, r.stdout + r.stderr)
        ledger("MP-911", [{"id": "R1-1", "check": {"type": "file", "file": "no/such/file.md", "pattern": "x"}}])
        r = run_("MP-911", "--approved")
        case("an MP file check on a missing file exits 2", r.returncode == 2 and "ERROR" in r.stdout, r.stdout + r.stderr)
        ledger("MP-912", [{"id": "R1-1", "check": {"type": "command", "argv": [py, "-c", "import time; time.sleep(5)"],
                                                   "timeout_seconds": 1}}])
        r = run_("MP-912", "--approved")
        case("an MP command that times out exits 2", r.returncode == 2 and "timed out" in r.stdout, r.stdout + r.stderr)

        # 8. --state, both shapes: accepts a whole history; refuses gaps, ledger rounds it lacks, a sixth round unasked
        good = {"rounds": 2, "reviewed_sha": "bbbbbbb",
                "history": [{"round": 1, "reviewed_sha": "aaaaaaa"}, {"round": 2, "sha": "bbbbbbb"}],
                "owner_decisions": [{"date": "2026-11-02", "story": "MP-35", "what": "x", "words": "y"}]}
        ledger("MP-913", [{"id": "R2-1", "finding": "f", "check": {"type": "manual", "what": "w"}},
                          {"id": "r0-1", "finding": "f", "check": {"type": "manual", "what": "w"}},
                          {"id": "o1", "finding": "f", "check": {"type": "manual", "what": "w"}}], good)
        r = run_("--state", "MP-913")
        case("--state accepts a whole mypaisa-agent history", r.returncode == 0, r.stdout + r.stderr)
        mp_good = {"round_count": 2, "reviewed_commit": "bbbbbbb",
                   "rounds": [{"round": 1, "reviewed_commit": "aaaaaaa", "gate_results": ["ruff F passed"],
                               "manual_evidence": []},
                              {"round": 2, "reviewed_commit": "bbbbbbb", "blocking_findings": ["R2-1"],
                               "findings": [{"id": "R2-1", "severity": "P2", "blocking": True, "finding": "x"}]}]}
        ledger("MP-914", [{"id": "R2-1", "finding": "f", "check": {"type": "manual", "what": "w"}}], mp_good)
        r = run_("--state", "MP-914")
        case("--state accepts a whole MP rounds list", r.returncode == 0, r.stdout + r.stderr)
        ledger("MP-915", [], dict(mp_good, round_count=3))
        r = run_("--state", "MP-915")
        case("--state refuses a round_count the rounds do not match",
             r.returncode == 1 and "round_count is 3" in r.stdout, r.stdout + r.stderr)
        gap = dict(good, history=[{"round": 1, "reviewed_sha": "aaaaaaa"}, {"round": 3, "reviewed_sha": "bbbbbbb"}])
        ledger("MP-916", [], gap)
        r = run_("--state", "MP-916")
        case("--state refuses a gap in the round numbers", r.returncode == 1 and "not 1 to 2" in r.stdout,
             r.stdout + r.stderr)
        ledger("MP-917", [{"id": "R3-1", "finding": "f", "check": {"type": "manual", "what": "w"}}], mp_good)
        r = run_("--state", "MP-917")
        case("--state refuses a ledger id naming a round the state lacks", r.returncode == 1 and "R3-1" in r.stdout,
             r.stdout + r.stderr)
        six = {"round_count": 6, "rounds": [{"round": i, "reviewed_commit": "abcdef1"} for i in range(1, 7)]}
        ledger("MP-918", [], six)
        r = run_("--state", "MP-918")
        case("--state refuses a sixth round with no word from the owner", r.returncode == 1 and "round 6" in r.stdout,
             r.stdout + r.stderr)
        six["rounds"][5]["review_approval"] = "Owner: run round 6"
        ledger("MP-918", [], six)
        r = run_("--state", "MP-918")
        case("--state accepts a sixth round the owner asked for", r.returncode == 0, r.stdout + r.stderr)
        six["rounds"][5] = {"round": 6, "reviewed_commit": "abcdef1", "deliverable_round": 1}
        ledger("MP-918", [], six)
        r = run_("--state", "MP-918")
        case("--state counts five rounds per deliverable", r.returncode == 0, r.stdout + r.stderr)
        for name, bad_round in (("a round naming nothing it reviewed", {"round": 1}),
                                ("a snapshot that is not a directory", {"round": 1, "reviewed_snapshot": "no/such/dir"}),
                                ("a finding with severity P5", {"round": 1, "reviewed_commit": "aaaaaaa", "findings": [
                                    {"id": "R1-a1", "severity": "P5", "blocking": True, "finding": "x"}]}),
                                ("manual evidence with no verifier", {"round": 1, "reviewed_commit": "aaaaaaa",
                                    "manual_verification": [{"finding_id": "R1-1", "evidence": "e", "result": "ok"}]}),
                                ("a blocking count of True", {"round": 1, "reviewed_commit": "aaaaaaa", "blocking": True}),
                                ("an empty gate result", {"round": 1, "reviewed_commit": "aaaaaaa", "gate_results": [" "]})):
            ledger("MP-919", [], {"round_count": 1, "rounds": [bad_round]})
            r = run_("--state", "MP-919")
            case(f"--state refuses {name}", r.returncode == 1 and "fault" in r.stdout, r.stdout + r.stderr)
        ledger("MP-920", [], {"round_count": 0, "rounds": [], "reviewed_commit": "aaaaaaa"})
        r = run_("--state", "MP-920")
        case("--state refuses a top reviewed commit with no rounds", r.returncode == 1 and "no round has run" in r.stdout,
             r.stdout + r.stderr)
        ledger("MP-921", [{"id": "R0-1", "finding": "f", "check": {"type": "manual", "what": "w"}}])
        r = run_("--state", "MP-921")
        case("--state with no state file is no rounds yet, exit 0", r.returncode == 0 and "no rounds yet" in r.stdout,
             r.stdout + r.stderr)
        ledger("MP-921", [{"id": "R1-1", "finding": "f", "check": {"type": "manual", "what": "w"}}])
        r = run_("--state", "MP-921")
        case("--state with no state file refuses a ledger id naming round 1", r.returncode == 1 and "R1-1" in r.stdout,
             r.stdout + r.stderr)
        ledger("LOCAL", [], {"round_count": 1, "rounds": [{"round": 1, "reviewed_commit": "aaaaaaa"}]})
        r = run_("--state", "LOCAL")
        case("--state LOCAL reads review/state.json", r.returncode == 0, r.stdout + r.stderr)

        # 9. a background child left holding stdout is killed, and the command is not a timeout
        shutil.rmtree(rev, ignore_errors=True)
        bg = t / "bg.pid"
        ledger("MP-922", [{"id": "R1-1", "finding": "f", "check": {
            "type": "cmd", "timeout": 4, "run": f"sleep 30 & echo $! > {bg}; echo done; exit 0"}}])
        start = time.monotonic()
        r = run_("MP-922", "--approved")
        took = time.monotonic() - start
        bgpid = int(bg.read_text()) if bg.is_file() else 0
        deadline = time.monotonic() + 5
        while bgpid and _alive(bgpid) and time.monotonic() < deadline:
            time.sleep(0.1)
        case("a background child holding stdout neither times the command out nor outlives it",
             r.returncode == 0 and "timed out" not in r.stdout and took < 4 and bgpid and not _alive(bgpid),
             r.stdout + r.stderr + f"\ntook {took:.1f} s")

        # 10. the same command with another timeout is a separate run
        counter = t / "count2"
        ledger("MP-923", [{"id": "R1-1", "finding": "a", "check": {"type": "cmd", "run": f"echo x >> {counter}"}},
                          {"id": "R1-2", "finding": "b", "check": {"type": "cmd", "run": f"echo x >> {counter}",
                                                                   "timeout": 30}}])
        r = run_("MP-923", "--approved")
        runs = len(counter.read_text().splitlines()) if counter.is_file() else 0
        case("the same command with another timeout runs again", r.returncode == 0 and runs == 2
             and "run once" not in r.stdout, r.stdout + r.stderr)

        # 11. a malformed ledger is refused before anything runs; a program that does not exist never passes
        for name, bad in (("a grep pattern that is not a regex", {"id": "R1-2", "finding": "f", "check": {
                              "type": "grep", "file": "README.md", "pattern": "([unclosed"}}),
                          ("a cmd entry with no finding", {"id": "R1-2", "check": {"type": "cmd", "run": "true"}}),
                          ("an empty finding", {"id": "R1-2", "finding": " ", "check": {"type": "manual", "what": "w"}}),
                          ("an empty retired reason", {"id": "R1-2", "finding": "f", "retired": "",
                                                       "check": {"type": "manual", "what": "w"}})):
            ran = t / "ran"
            ran.unlink(missing_ok=True)
            ledger("MP-924", [{"id": "R1-1", "finding": "f", "check": {"type": "cmd", "run": f"touch {ran}"}}, bad])
            r = run_("MP-924", "--approved")
            case(f"{name} exits 2 before anything runs", r.returncode == 2 and not ran.exists() and "R1-2" in r.stderr,
                 r.stdout + r.stderr)
            r = run_("--every")
            case("... and under --every", r.returncode == 2 and not ran.exists(), r.stdout + r.stderr)
            shutil.rmtree(rev / "MP-924")
        for kind in CMD:
            check = {"type": kind, "argv": ["/nonexistent/mypaisaa-no-such-program"]}
            if kind == "command_fails":
                check["expected_exit_codes"] = [1]
            ledger("MP-925", [{"id": "R1-1", "finding": "f", "check": check}])
            r = run_("MP-925", "--approved")
            case(f"a {kind} whose program does not exist exits 2", r.returncode == 2 and "could not start" in r.stdout,
                 r.stdout + r.stderr)
    print(f"review-regress selftest: {cases} cases, {len(wrong)} wrong")
    return 1 if wrong else 0


# ---- command line ---------------------------------------------------------------------------------------------

def parse(argv: list[str]) -> dict:
    o = {"key": None, "jobs": 1, "only": None, "every": False, "state": None, "selftest": False, "approved": False,
         "help": False, "err": None}
    rest = list(argv)
    while rest:
        a = rest.pop(0)
        if a in ("--jobs", "--only", "--state"):
            if not rest:
                o["err"] = f"{a} needs a value"
                return o
            v = rest.pop(0)
            if a == "--jobs":
                if not v.isdigit() or int(v) < 1:
                    o["err"] = f"--jobs takes a whole number from 1, got {v!r}"
                    return o
                o["jobs"] = int(v)
            elif a == "--only":
                o["only"] = [x.strip() for x in v.split(",") if x.strip()]
                if not o["only"]:
                    o["err"] = "--only needs at least one id"
                    return o
            else:
                o["state"] = v
        elif a == "--every":
            o["every"] = True
        elif a == "--selftest":
            o["selftest"] = True
        elif a == "--approved":
            o["approved"] = True
        elif a in ("-h", "--help"):
            o["help"] = True
        elif a.startswith("-"):
            o["err"] = f"unknown option {a}"
            return o
        elif o["key"] is None:
            o["key"] = a
        else:
            o["err"] = f"one ledger at a time, got {o['key']} and {a} (--every runs them all)"
            return o
    modes = sum(bool(x) for x in (o["key"], o["every"], o["state"], o["selftest"]))
    if modes > 1:
        o["err"] = "give one of an issue key (or LOCAL), --every, --state MP-<n> or --selftest"
    elif o["only"] and not o["key"]:
        o["err"] = "--only works on one ledger"
    return o


def main(argv: list[str]) -> int:
    o = parse(argv)
    if o["help"]:
        print(__doc__)
        return 0
    if o["err"]:
        print(f"review-regress: {o['err']}", file=sys.stderr)
        return 2
    if o["selftest"]:
        return selftest()
    if o["state"]:
        return run_state(ROOT, o["state"])
    if o["every"]:
        return run_every(ROOT, o["jobs"])
    if o["key"] is None:
        print(__doc__)
        return 2
    if not o["approved"]:
        print("User approval is required before running this ledger (add --approved once the owner has said yes).",
              file=sys.stderr)
        return 2
    return run(ROOT, o["key"], o["jobs"], o["only"])


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
