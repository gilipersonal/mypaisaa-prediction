#!/usr/bin/env python3
"""Mypaisaa Prediction's Claude Code hooks (MP-35); .claude/settings.json runs them, in this repo only.

Adapted from mypaisa-agent's plan_sync_hook.py (MA-228, MA-260, MA-296, MA-303).

    mp_hook.py before-pr    PreToolUse on Bash: when the command raises a PR (`gh pr create` or `gh pr ready`,
                            however wrapped), run in the checkout it acts on, stopping at the first failure:
                              python3 scripts/review_checks.py --base origin/main --run
                              python3 scripts/plan_sync.py check          (only if that file exists)
                              python3 docs/confluence/build_pages.py check
                            A check that fails, cannot run or times out refuses the PR (exit 2, reason on stderr).
                            Every other command is allowed silently. Raising the PR still needs the owner's word.
    mp_hook.py after-edit   PostToolUse on Edit|Write|MultiEdit: after an edit to a record, run the fast checks that
                            apply and tell the session (additionalContext) what drifted. Never blocks an edit.
    mp_hook.py new-work     UserPromptSubmit: when the prompt talks about new work, remind the session that it gets
                            a Jira MP issue and, when it changes the plan, its Confluence page in the same change.
    mp_hook.py selftest     offline: each mode in throwaway repos with stand-in checks.

Only raising a PR is ever blocked. Any other hook that cannot run says so (exit 1, on stderr) and lets work go on.
"""
from __future__ import annotations

import contextlib
import hashlib
import io
import json
import os
import re
import shlex
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(os.environ.get("CLAUDE_PROJECT_DIR") or Path(__file__).resolve().parents[2])
MARKER = Path("scripts") / "review_checks.py"  # a checkout of this repo holds it
PR_BUDGET = 280  # seconds for every PR check together; settings.json gives the hook 300
EDIT_TIMEOUT = 60  # seconds per after-edit check; settings.json gives the hook 120

# An actual `gh pr create|ready`: at the start of a line, after a shell separator or opener, or inside `sh -c`/`eval`,
# behind any chain of wrappers (env assignments, env, command, sudo, time, nohup, xargs, timeout N,
# perl -e '...' N), with gh named by any path. Words inside an ordinary quoted string (a commit message) do not count.
_WRAPPER = (r"(?:\w+=\S*|env|command|builtin|exec|eval|nohup|time|sudo|caffeinate|xargs|timeout\s+\S+"
            r"|perl\s+-e\s+(?:'[^']*'|\"[^\"]*\")\s+\d+|-[-\w=]+)")
PR_COMMAND = re.compile(
    r"(?m)(?:^|[;&|(){`]|\$\(|\b(?:then|do|else|eval)\b|-c\s*['\"]?|\beval\s+['\"])\s*"
    rf"(?:{_WRAPPER}\s+)*(?:\S*/)?gh\s+pr\s+(create|ready)\b")

ROOT_DOCS = ("README.md", "ARCHITECTURE.md", "TECH-STACK.md")
RECORDS = re.compile(r"^(?:README\.md|ARCHITECTURE\.md|TECH-STACK\.md|AGENTS\.md|CLAUDE\.md"
                     r"|docs/(?:planning|confluence|diagrams|motion|brand|readme)/|\.claude/|\.github/|scripts/|backend/)")
NEW_WORK = re.compile(
    r"\b(new (?:feature|story|stories|epic|phase|page|screen|view|flow|design|endpoint|model|chart|decision|adr|component|work)"
    r"|feature|user stor(?:y|ies)|epic|redesign|design (?:a|an|the|for|new)|wireframe|mock-?up|phase \d|next phase"
    r"|add (?:a|an|the) .{0,40}(?:screen|page|view|button|card|chart|flow|tab|endpoint|feature)"
    r"|can we (?:have|add|build)|i (?:want|need) (?:a|an|the|to see)|let'?s (?:build|add|design)|decid(?:e|ed|ing) (?:on|to))\b",
    re.I)


def checkout(start: str | None) -> Path:
    """The checkout a tool call acts on: the git top level of `start` (the folder a command runs in, or an edited file)
    when it holds this repo's scripts, else the project folder. A worktree is checked against its own scripts and
    records, never the main checkout beside it (MA-260)."""
    if start:
        d = Path(start)
        d = d if d.is_dir() else d.parent
        try:
            top = subprocess.run(["git", "-C", str(d), "rev-parse", "--show-toplevel"], capture_output=True, text=True,
                                 timeout=10).stdout.strip()
        except (OSError, subprocess.SubprocessError):
            top = ""
        if top and (Path(top) / MARKER).is_file():
            return Path(top)
    return ROOT


def pr_checkout(before: str, cwd: str | None) -> Path:
    """The checkout a command raises its PR from: the last `cd` before `gh pr`, else the folder the command runs in."""
    where = cwd
    if cds := [m.end() for m in re.finditer(r"(?:^|[;&|(]|\bthen|\bdo)\s*cd\s+", before)]:
        lex = shlex.shlex(before[cds[-1]:], posix=True, punctuation_chars=True)
        lex.whitespace_split = True
        try:
            where = os.path.expanduser(next(iter(lex), "") or "") or cwd
        except ValueError:  # an unclosed quote: no path to read, so the folder the command runs in
            where = cwd
    if cds and where and cwd and not os.path.isabs(where):
        where = os.path.join(cwd, where)
    return checkout(where)


def run(root: Path, argv: list[str], timeout: float) -> tuple[int, str]:
    """Run a check in `root`; (exit code, combined output). A timeout or a check that cannot start is a failure."""
    try:
        r = subprocess.run([sys.executable, *argv], cwd=root, capture_output=True, text=True, timeout=max(timeout, 1))
    except subprocess.TimeoutExpired:
        return 124, f"timed out after {int(timeout)} s"
    except OSError as e:
        return 127, f"could not start: {e}"
    return r.returncode, (r.stdout + r.stderr).strip()


def tail(text: str, n: int = 12) -> str:
    lines = text.splitlines()[-n:]
    return "\n".join("  " + ln[:300] for ln in lines) or "  (no output)"


def say(event: str, text: str) -> None:
    print(json.dumps({"hookSpecificOutput": {"hookEventName": event, "additionalContext": text}}))


def pr_checks(root: Path) -> list[tuple[str, list[str]]]:
    checks = [("review checks", [str(MARKER), "--base", "origin/main", "--run"])]
    if (root / "scripts" / "plan_sync.py").is_file():
        checks.append(("plan sync", ["scripts/plan_sync.py", "check"]))
    checks.append(("Confluence pages", ["docs/confluence/build_pages.py", "check"]))
    return checks


def before_pr(data: dict, budget: float = PR_BUDGET) -> int:
    cmd = (data.get("tool_input") or {}).get("command") or ""
    if not isinstance(cmd, str) or not (m := PR_COMMAND.search(cmd)):
        return 0
    root = pr_checkout(cmd[:m.start()], data.get("cwd"))
    deadline = time.monotonic() + budget
    for name, argv in pr_checks(root):
        if not (root / argv[0]).is_file():
            code, out = 127, f"{argv[0]} is missing from {root}"
        else:
            code, out = run(root, argv, deadline - time.monotonic())
        # review_checks exits 2 when every check it could run passed and only a local tool (actionlint,
        # pdftoppm) is missing; CI runs those, so that is not a reason to refuse the PR.
        if code == 2 and argv[0] == str(MARKER) and "FAIL" not in out:
            continue
        if code:
            print(f"MP PR gate: refused `gh pr {m.group(1)}`. The {name} check failed (python3 {' '.join(argv)}, "
                  f"exit {code}) in {root}. Last lines:\n{tail(out)}\nFix it and try again; a PR still needs the "
                  "owner's word in the current prompt.", file=sys.stderr)
            return 2
    return 0


def edit_checks(root: Path, rel: str) -> list[tuple[str, list[str]]]:
    checks = []
    if (root / "scripts" / "plan_sync.py").is_file():
        checks.append(("plan sync", ["scripts/plan_sync.py", "check"]))
    if rel in ROOT_DOCS or rel.startswith(("docs/brand/", "docs/motion/", "docs/readme/")):
        checks.append(("README and docs", ["docs/readme/check_readme.py"]))
    if rel.startswith((".claude/", ".github/")) or rel == "scripts/check_agent_config.py":
        checks.append(("agent config", ["scripts/check_agent_config.py"]))
    return checks


def after_edit(data: dict) -> int:
    path = (data.get("tool_input") or {}).get("file_path") or ""
    if not path:
        return 0
    root = checkout(path)
    try:
        rel = Path(path).resolve().relative_to(root.resolve()).as_posix()
    except ValueError:
        return 0
    if not RECORDS.match(rel):
        return 0
    failures = []
    for name, argv in edit_checks(root, rel):
        code, out = run(root, argv, EDIT_TIMEOUT)
        if code:
            failures.append(f"{name} (python3 {' '.join(argv)}, exit {code}):\n{tail(out, 8)}")
    # Tell each drift once: a failure already told after an earlier edit is not repeated.
    seen_file = Path(tempfile.gettempdir()) / f"mypaisaa-prediction-hook-{hashlib.sha256(str(root).encode()).hexdigest()[:12]}.json"
    try:
        seen = set(json.loads(seen_file.read_text()))
    except (OSError, ValueError):
        seen = set()
    new = [f for f in failures if f not in seen]
    with contextlib.suppress(OSError):
        seen_file.write_text(json.dumps(failures))
    if new:
        say("PostToolUse", f"MP checks after editing {rel}: {len(failures)} failing, new since the last edit:\n- "
            + "\n- ".join(new) + "\nFix the records before the PR; the PR hook refuses while a check fails.")
    return 0


def new_work(data: dict) -> int:
    prompt = data.get("prompt")
    if isinstance(prompt, str) and NEW_WORK.search(prompt):
        say("UserPromptSubmit", "MP rule (.claude/rules/jira-flow.md): new work (a feature, story, design, phase, page, "
            "screen or decision) gets a Jira MP issue under its epic before it starts. When it changes the plan, its "
            "Confluence page changes in the same change: edit docs/confluence/build_pages.py, then run "
            "`python3 docs/confluence/build_pages.py write` and `check`. Publishing to Confluence and plan sync each "
            "need the owner's own yes (mp-plan-sync); UI work goes design-first (mp-design-first). If this prompt is "
            "not about new work, ignore this.")
    return 0


def selftest() -> int:
    """Offline: checkout detection, PR-command detection, the PR gate and the edit checks with stand-ins, new-work."""
    bad = 0

    def expect(what: str, got: object, want: object) -> None:
        nonlocal bad
        if got != want:
            bad += 1
            print(f"FAIL: {what}: got {got!r}, want {want!r}")

    count = 0
    with tempfile.TemporaryDirectory() as t:
        main_repo, wt, other = Path(t) / "main", Path(t) / "main" / ".claude" / "worktrees" / "a b", Path(t) / "plain"
        for repo in (main_repo, wt):
            (repo / "scripts").mkdir(parents=True)
            (repo / MARKER).write_text("")
            subprocess.run(["git", "init", "-q", str(repo)], check=True)
        other.mkdir()
        for what, got, want in [
            ("the command's folder", pr_checkout("", str(wt)), wt),
            ("a file deep in a worktree", checkout(str(wt / "scripts" / "review_checks.py")), wt),
            ("cd into a worktree from main", pr_checkout(f'cd "{wt}" && ', str(main_repo)), wt),
            ("cd into main from a worktree", pr_checkout(f"cd {main_repo}; ", str(wt)), main_repo),
            ("the last cd wins", pr_checkout(f"cd {main_repo} && cd '{wt}' && ", str(other)), wt),
            ("a relative cd", pr_checkout("cd .claude/worktrees/'a b' && ", str(main_repo)), wt),
            ("a folder that is no checkout of this repo", pr_checkout("", str(other)), ROOT),
            ("no folder at all", pr_checkout("", None), ROOT),
        ]:
            count += 1
            expect(f"checkout, {what}", got.resolve(), want.resolve())

        g = "gh pr "
        for cmd, want in [
            (g + "create -t x", True), ("git add -A && " + g + "ready 7", True), ("bash -c '" + g + "create --fill'", True),
            ("GH_TOKEN=x env FOO=1 " + g + "create", True), ("/opt/homebrew/bin/" + g + "create", True),
            ("perl -e 'alarm shift; exec @ARGV' 60 " + g + "create", True), ("echo $(" + g + "create)", True),
            ("if true; then " + g + "ready; fi", True), ("cd /x\n" + g + "create", True),
            (g + "view 7", False), (g + "merge 7", False), ("git commit -m 'gate " + g + "create'", False),
            ("echo " + g + "create", False), ("gh issue create", False), ("ls -la", False),
        ]:
            count += 1
            expect(f"PR command detection, {cmd!r}", bool(PR_COMMAND.search(cmd)), want)

        gate = Path(t) / "gate"
        for d in ("scripts", "docs/confluence", "docs/readme", ".claude/rules", "backend", "site"):
            (gate / d).mkdir(parents=True)
        subprocess.run(["git", "init", "-q", str(gate)], check=True)
        ok, fail = "print('ok')\n", "import sys, uuid\nprint('DRIFT ' + uuid.uuid4().hex)\nsys.exit(1)\n"
        argv_guard = ("import sys\nassert sys.argv[1:] == ['--base', 'origin/main', '--run'], sys.argv\nprint('ok')\n")

        def stage(review: str | None, confluence: str | None, plan: str | None = None) -> None:
            for rel, body in (("scripts/review_checks.py", review), ("docs/confluence/build_pages.py", confluence),
                              ("scripts/plan_sync.py", plan)):
                (gate / rel).unlink(missing_ok=True)
                if body is not None:
                    (gate / rel).write_text(body)

        raise_pr = g + "create -t x"
        for what, files, cmd, budget, want, named in [
            ("every check passes", (argv_guard, ok), raise_pr, PR_BUDGET, 0, ""),
            ("the review checks fail", (fail, ok), raise_pr, PR_BUDGET, 2, "review checks"),
            ("the Confluence check fails", (ok, fail), "git push -u origin MP-1-x && " + g + "ready", PR_BUDGET, 2, "Confluence pages"),
            ("plan sync is present and fails", (ok, ok, fail), raise_pr, PR_BUDGET, 2, "plan sync"),
            ("plan sync is present and passes", (ok, ok, ok), raise_pr, PR_BUDGET, 0, ""),
            ("a check that exits without a word", ("import sys\nsys.exit(3)\n", ok), raise_pr, PR_BUDGET, 2, "exit 3"),
            ("only a local tool is unavailable", ("import sys\nprint('UNAVAILABLE: workflow-lint')\nsys.exit(2)\n", ok), raise_pr, PR_BUDGET, 0, ""),
            ("a failure alongside an unavailable tool", ("import sys\nprint('FAIL: readme')\nprint('UNAVAILABLE: x')\nsys.exit(2)\n", ok), raise_pr, PR_BUDGET, 2, "review checks"),
            ("a check that cannot run", ("this is not python\n", ok), raise_pr, PR_BUDGET, 2, "review checks"),
            ("a check that hangs", ("import time\ntime.sleep(30)\n", ok), raise_pr, 2, 2, "timed out"),
            ("a check that is missing", (ok, None), raise_pr, PR_BUDGET, 2, "missing"),
            ("a command that raises no PR", (fail, fail), "gh pr view 7", PR_BUDGET, 0, ""),
        ]:
            count += 1
            stage(*files)
            err = io.StringIO()
            with contextlib.redirect_stderr(err):
                got = before_pr({"tool_input": {"command": cmd}, "cwd": str(gate)}, budget)
            expect(f"PR gate, {what}", got, want)
            if named and named not in err.getvalue():
                bad += 1
                print(f"FAIL: PR gate, {what}: the refusal does not name {named!r}: {err.getvalue()!r}")

        stage(ok, ok, None)
        (gate / "docs/readme/check_readme.py").write_text(fail)
        (gate / "scripts/check_agent_config.py").write_text(fail)
        for what, rel, want in [
            ("the README", "README.md", "README and docs"), ("a brand file", "docs/brand/mark.svg", "README and docs"),
            ("a Claude rule", ".claude/rules/x.md", "agent config"), ("a workflow", ".github/workflows/v.yml", "agent config"),
            ("backend code, with no plan sync", "backend/app.py", None), ("the site", "site/index.html", None),
            ("a file outside the repo", str(other / "x.md"), None),
        ]:
            count += 1
            target = Path(rel) if Path(rel).is_absolute() else gate / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text("x\n")
            out = io.StringIO()
            with contextlib.redirect_stdout(out):
                code = after_edit({"tool_input": {"file_path": str(target)}})
            expect(f"after-edit exit, {what}", code, 0)
            text = out.getvalue()
            expect(f"after-edit, {what}", (want in text) if want else text, True if want else "")
        count += 1
        (gate / "scripts/plan_sync.py").write_text(fail)
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            after_edit({"tool_input": {"file_path": str(gate / "backend/app.py")}})
        expect("after-edit, backend code with plan sync present", "plan sync" in out.getvalue(), True)

    for prompt, want in [("Let's add a new screen for the forecast history", True), ("Plan the next phase", True),
                         ("We decided to use DynamoDB", True), ("Write a user story for alerts", True),
                         ("fix the typo in README", False), ("run the tests", False)]:
        count += 1
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            new_work({"prompt": prompt})
        expect(f"new-work, {prompt!r}", "Jira MP issue" in out.getvalue(), want)

    print(f"mp_hook selftest: {count} cases, {bad} wrong")
    return 1 if bad else 0


def main(argv: list[str]) -> int:
    mode = argv[1] if len(argv) > 1 else ""
    if mode == "selftest":
        return selftest()
    handlers = {"after-edit": after_edit, "before-pr": before_pr, "new-work": new_work}
    if mode not in handlers:
        print(__doc__, file=sys.stderr)
        return 0
    raw = ""
    try:
        raw = sys.stdin.read()
        data = json.loads(raw)
        if not isinstance(data, dict):
            raise ValueError("hook input is not a JSON object")
        return handlers[mode](data)
    except Exception as e:  # noqa: BLE001 - a hook that cannot run says so
        # Unreadable input refuses only what may raise a PR; anything else goes on, with the fault said.
        if mode == "before-pr" and (not isinstance(e, ValueError) or re.search(r"\bgh\b.{0,80}\bpr\b", raw, re.S)):
            print(f"MP PR gate could not run ({type(e).__name__}: {e}); refusing the command. If it raises no PR, "
                  "this is a hook fault: report it.", file=sys.stderr)
            return 2
        print(f"MP {mode} hook could not run ({type(e).__name__}: {e}); carrying on without it.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
