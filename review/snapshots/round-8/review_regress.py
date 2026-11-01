#!/usr/bin/env python3
"""Run an approved MP review ledger. See .codex/rules/review-ledger.md."""

from __future__ import annotations

import argparse
import json
import os
import re
import signal
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ISSUE = re.compile(r"MP-[1-9][0-9]*\Z")


def contained_file(root: Path, name: str) -> Path:
    path = Path(name)
    if path.is_absolute() or ".." in path.parts:
        raise ValueError("file path must stay inside the project")
    resolved = (root / path).resolve()
    if not resolved.is_relative_to(root.resolve()) or not resolved.is_file():
        raise ValueError("file is missing or outside the project")
    return resolved


def check(root: Path, spec: dict) -> tuple[str, str]:
    kind = spec.get("type")
    if kind == "manual":
        text = spec.get("what")
        if not isinstance(text, str) or not text.strip():
            raise ValueError("manual check needs a description")
        return "MANUAL", text
    if kind == "file":
        file = spec.get("file")
        pattern = spec.get("pattern")
        present = spec.get("present", True)
        if not isinstance(file, str) or not isinstance(pattern, str) or not isinstance(present, bool):
            raise ValueError("file check needs file, pattern and optional boolean present")
        text = contained_file(root, file).read_text(encoding="utf-8")
        found = bool(re.search(pattern, text, flags=re.MULTILINE))
        return ("PASS" if found == present else "FAIL"), file
    if kind in ("command", "command_fails"):
        argv = spec.get("argv")
        if not isinstance(argv, list) or not argv or not all(isinstance(x, str) and x for x in argv):
            raise ValueError("command check requires a nonempty argv string array")
        timeout = spec.get("timeout_seconds", 30)
        if not isinstance(timeout, int) or isinstance(timeout, bool) or not 1 <= timeout <= 60:
            raise ValueError("timeout_seconds must be an integer between 1 and 60")
        expected = spec.get("expected_exit_codes", [0] if kind == "command" else None)
        if (not isinstance(expected, list) or not expected
                or any(not isinstance(code, int) or isinstance(code, bool) or not 0 <= code <= 255
                       for code in expected)):
            raise ValueError("expected_exit_codes must be a nonempty array of exit codes")
        if kind == "command_fails" and 0 in expected:
            raise ValueError("command_fails cannot accept a successful exit")
        process = subprocess.Popen(argv, cwd=root, stdout=subprocess.DEVNULL,
                                   stderr=subprocess.DEVNULL, start_new_session=True)
        try:
            code = process.wait(timeout=timeout)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
            raise
        if code < 0:
            return "FAIL", f"command terminated by signal {-code}"
        ok = code in expected
        return ("PASS" if ok else "FAIL"), f"{argv[0]} (exit {code})"
    raise ValueError("unknown check type")


def run(root: Path, issue: str) -> int:
    if not ISSUE.fullmatch(issue) and issue != "LOCAL":
        print("Invalid key; expected MP-<positive number> or LOCAL.", file=sys.stderr)
        return 2
    ledger = root / "review" / "fixed.json" if issue == "LOCAL" else root / "review" / issue / "fixed.json"
    try:
        for parent in dict.fromkeys((root / "review", ledger.parent)):
            try:
                parent.lstat()
            except FileNotFoundError:
                print(f"{issue}: no fixed-findings ledger yet; no checks ran.")
                return 0
            if parent.is_symlink():
                resolved = parent.resolve(strict=True)
                if not resolved.is_relative_to(root.resolve()) or not resolved.is_dir():
                    raise ValueError("ledger directory is outside the project or not a directory")
            elif parent.exists() and not parent.is_dir():
                raise ValueError("ledger parent is not a directory")
        try:
            ledger.lstat()
        except FileNotFoundError:
            print(f"{issue}: no fixed-findings ledger yet; no checks ran.")
            return 0
        ledger = contained_file(root, str(ledger.relative_to(root)))
        entries = json.loads(ledger.read_text(encoding="utf-8"))
        if not isinstance(entries, list):
            raise ValueError("ledger must be an array")
        failed = manual = 0
        for entry in entries:
            if not isinstance(entry, dict) or not isinstance(entry.get("id"), str):
                raise ValueError("each finding needs an id and check")
            if not isinstance(entry.get("check"), dict):
                raise ValueError("each finding needs a check object")
            status, detail = check(root, entry["check"])
            print(f"{status}: {entry['id']} — {detail}")
            failed += status == "FAIL"
            manual += status == "MANUAL"
        print(f"{issue}: {len(entries)} checks, {failed} failed, {manual} manual outstanding.")
        return 1 if failed else (3 if manual else 0)
    except (ValueError, OSError, re.error, subprocess.TimeoutExpired) as exc:
        print(f"Unable to complete regression checks: {exc}", file=sys.stderr)
        return 2


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("issue")
    parser.add_argument("--approved", action="store_true", help="acknowledge user approval")
    args = parser.parse_args()
    if not args.approved:
        print("User approval is required before running this ledger.", file=sys.stderr)
        return 2
    return run(ROOT, args.issue)


if __name__ == "__main__":
    sys.exit(main())
