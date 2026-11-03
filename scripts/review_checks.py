#!/usr/bin/env python3
"""Select and run the fast checks that a change actually touches.

Implements the check selection in docs/review-optimisation.md: map changed paths to
their fast applicable checks, flag paths nobody has mapped, run independent checks
in parallel and reuse an earlier pass only when its inputs are byte-identical.
It never runs a fixed-findings ledger; use scripts/review_regress.py for that.
"""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import platform
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UV_DEV = ["uv", "run", "--project", "backend", "--frozen", "--extra", "dev"]
UNITTEST = ("python3", "-m", "unittest", "discover", "-s", "tests", "-p")


@dataclass(frozen=True)
class Check:
    name: str
    paths: tuple[str, ...]
    steps: tuple[tuple[str, ...], ...]
    tier: str = "fast"
    # Files outside `paths` whose change invalidates reuse (locks, shared tooling).
    inputs: tuple[str, ...] = ()
    timeout: int = 300
    tools: tuple[str, ...] = field(default=())


FOUNDATION = "docs/planning/foundation-specifications-2026-11-02"
RECONCILIATION = "docs/planning/ma-reconciliation-2026-11-02"

CHECKS = (
    Check("backend", ("backend/*",),
          ((*UV_DEV, "ruff", "check", "backend"), (*UV_DEV, "pytest", "backend/tests", "-q")),
          tools=("uv",)),
    Check("python-errors", ("scripts/*", "tests/*", ".codex/hooks/*", ".claude/hooks/*", "docs/confluence/*.py",
                            "docs/planning/baseline-signoff-*.py", "docs/planning/story-readiness-*.py"),
          ((*UV_DEV, "ruff", "check", "--select", "F", "scripts", "tests", ".codex/hooks", ".claude/hooks",
            "docs/confluence", "docs/planning/baseline-signoff-2026-11-03", "docs/planning/story-readiness-2026-11-03"),),
          inputs=("backend/uv.lock",), tools=("uv",)),
    Check("review-runner", ("scripts/review_regress.py", "tests/test_review_regress.py", ".codex/*",
                            ".agents/skills/mp-independent-review/*", "review/state.json",
                            "review/snapshots/*"),
          ((*UNITTEST, "test_review_regress.py"),)),
    Check("review-checks", ("scripts/review_checks.py", "tests/test_review_checks.py"),
          ((*UNITTEST, "test_review_checks.py"),)),
    Check("claude-workflow", (".claude/*", "tests/test_claude_review_skills.py",
                              "tests/test_claude_workflow_skills.py"),
          ((*UNITTEST, "test_claude_review_skills.py"),
           (*UNITTEST, "test_claude_workflow_skills.py"))),
    Check("agent-config", (".claude/*", ".codex/*.json", ".github/main-protection.json", ".github/workflows/*",
                           "scripts/check_agent_config.py", "tests/test_agent_config.py"),
          (("python3", "scripts/check_agent_config.py"), (*UNITTEST, "test_agent_config.py"))),
    Check("claude-hooks", (".claude/hooks/*", ".claude/settings.json", "tests/test_mp_hook.py"),
          (("python3", ".claude/hooks/mp_hook.py", "selftest"), (*UNITTEST, "test_mp_hook.py"))),
    Check("plan-sync", ("README.md", "ARCHITECTURE.md", "TECH-STACK.md", ".claude/rules/*.md", "docs/planning/*.md",
                        "docs/planning/trace.json", f"{RECONCILIATION}/direction-summary.md",
                        f"{RECONCILIATION}/phase-story-baseline.json", "docs/confluence/build_pages.py",
                        "docs/confluence/confluence.json", "scripts/plan_sync.py", "tests/test_plan_sync.py"),
          (("python3", "scripts/plan_sync.py", "check"), ("python3", "scripts/plan_sync.py", "selftest"),
           (*UNITTEST, "test_plan_sync.py"))),
    Check("confluence-receipts", ("docs/confluence/*", "tests/test_confluence_receipts.py"),
          (("python3", "docs/confluence/build_pages.py", "selftest"), ("python3", "docs/confluence/build_pages.py", "check"),
           (*UNITTEST, "test_confluence_receipts.py"))),
    Check("design-sync", ("docs/design/*", "docs/market-agent/*", "scripts/design_sync.py", "tests/test_design_sync.py"),
          (("python3", "scripts/design_sync.py", "check"), (*UNITTEST, "test_design_sync.py"))),
    Check("baseline-signoff", ("docs/planning/baseline-signoff-*", "tests/test_baseline_signoff.py",
                               f"{FOUNDATION}/*", f"{RECONCILIATION}/decision-log.md",
                               f"{RECONCILIATION}/phase-story-baseline.json", f"{RECONCILIATION}/gap-register.json",
                               f"{RECONCILIATION}/direction-summary.md", "docs/diagrams/*", "docs/design/*",
                               "docs/confluence/confluence.json", "docs/planning/trace.json", "README.md",
                               "ARCHITECTURE.md", "TECH-STACK.md", "docs/motion/*", ".claude/rules/plan-sync.md",
                               "docs/planning/foundation-policy-discussion-*",
                               "docs/planning/claude-models-and-batching-*"),
          (("python3", "docs/planning/baseline-signoff-2026-11-03/build_signoff.py", "--check"),
           (*UNITTEST, "test_baseline_signoff.py"))),
    Check("story-readiness", ("docs/planning/story-readiness-*", "tests/test_story_readiness.py",
                              f"{RECONCILIATION}/phase-story-baseline.json", f"{RECONCILIATION}/gap-register.json",
                              "docs/planning/trace.json", f"{FOUNDATION}/*/open-decisions.json",
                              f"{FOUNDATION}/*/contracts*.json", f"{FOUNDATION}/data/catalogue.json"),
          (("python3", "docs/planning/story-readiness-2026-11-03/stories.py", "check"),
           ("python3", "docs/planning/story-readiness-2026-11-03/stories.py", "selftest"),
           (*UNITTEST, "test_story_readiness.py"))),
    Check("retired-facts", ("docs/planning/retired-facts.json", "scripts/check_retired_facts.py",
                            "tests/test_check_retired_facts.py", "README.md", "ARCHITECTURE.md", "TECH-STACK.md",
                            "docs/confluence/build_pages.py", "docs/diagrams/*", "docs/motion/build_motion.py",
                            "docs/market-agent/*", "docs/architecture-explainer/*"),
          (("python3", "scripts/check_retired_facts.py"), ("python3", "scripts/check_retired_facts.py", "selftest"),
           (*UNITTEST, "test_check_retired_facts.py"))),
    Check("pr-policy", ("scripts/check_pr.py", "tests/test_pr_policy.py", ".github/*"),
          ((*UNITTEST, "test_pr_policy.py"),)),
    Check("readme", ("README.md", "ARCHITECTURE.md", "TECH-STACK.md", "docs/readme/*", "docs/brand/*",
                     "docs/motion/*"), (("python3", "docs/readme/check_readme.py"),)),
    Check("reconciliation-pack", (f"{RECONCILIATION}/*",),
          (("python3", f"{RECONCILIATION}/validate.py"),)),
    Check("foundation-pack", (f"{FOUNDATION}/*", "docs/planning/foundation-policy-discussion-*"),
          (("uv", "run", "--no-project", "--with", "jsonschema==4.25.1", "python",
            f"{FOUNDATION}/validate.py"),), tools=("uv",)),
    Check("synthetic-data", ("scripts/synthetic_data.py", "scripts/validate_synthetic_data.py",
                             "tests/test_synthetic_data.py", "fixtures/*", "data/*"),
          (("uv", "run", "--no-project", "--with", "numpy==2.5.4", "--with", "pandas==3.1.0",
            "--with", "pandas-market-calendars==5.6.0", "--with", "exchange-calendars==4.13.2",
            "python", *UNITTEST[1:], "test_synthetic_data.py"),),
          tier="broader", tools=("uv",)),
    Check("synthetic-imports", ("scripts/synthetic_import_samples.py",
                                "tests/test_synthetic_import_samples.py"),
          (("uv", "run", "--no-project", "--with", "reportlab==4.4.9", "--with", "pypdf==6.10.0",
            "--with", "Pillow==12.3.0", "python", "-m", "unittest", "discover", "-s", "tests",
            "-p", "test_synthetic_import_samples.py"),),
          tier="broader", tools=("uv", "pdftoppm")),
    # The build rewrites site/dist, which the preview test then reads: keep them in one check.
    Check("site", ("site/*", "tests/test_site_preview.py"),
          (("npm", "--prefix", "site", "run", "build"), ("npm", "--prefix", "site", "run", "check"),
           (*UNITTEST, "test_site_preview.py")),
          tier="broader", inputs=("site/package-lock.json",), timeout=600, tools=("npm",)),
    Check("workflow-lint", (".github/workflows/*",),
          (("actionlint", "-color", ".github/workflows/jira-key.yml",
            ".github/workflows/verify.yml"),), tools=("actionlint",)),
)

# Paths that need no check of their own beyond the whitespace gate.
NO_CHECK = ("*.md", "docs/*", "review/*", ".gitignore", ".editorconfig", "AGENTS.md", "CLAUDE.md")


def matches(path: str, patterns: tuple[str, ...]) -> bool:
    return any(fnmatch.fnmatchcase(path, pattern) for pattern in patterns)


def select(paths: list[str]) -> tuple[list[Check], list[str]]:
    """Return the checks touched by `paths` and the paths no check or exemption covers."""
    chosen = [check for check in CHECKS if any(matches(p, check.paths) for p in paths)]
    unmapped = sorted(p for p in paths
                      if not any(matches(p, c.paths) for c in CHECKS) and not matches(p, NO_CHECK))
    return chosen, unmapped


def changed_paths(base: str) -> list[str]:
    def git(*args: str) -> list[str]:
        out = subprocess.run(["git", *args], cwd=ROOT, check=True, capture_output=True,
                             text=True, timeout=30).stdout
        return [line for line in out.splitlines() if line]
    return sorted(set(git("diff", "--name-only", f"{base}...HEAD"))
                  | set(git("diff", "--name-only", "HEAD"))
                  | set(git("ls-files", "--others", "--exclude-standard")))


def fingerprint(root: Path, check: Check) -> str:
    """Hash every tracked or new file a check reads, plus the interpreter version."""
    listed = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard"],
                            cwd=root, check=True, capture_output=True, text=True,
                            timeout=30).stdout.splitlines()
    digest = hashlib.sha256(f"{check.name}\0{check.steps}\0{platform.python_version()}".encode())
    for path in sorted(p for p in listed if matches(p, check.paths) or p in check.inputs):
        file = root / path
        if file.is_file():
            digest.update(path.encode() + b"\0" + file.read_bytes() + b"\0")
    return digest.hexdigest()


def run_check(root: Path, check: Check) -> dict:
    started = time.monotonic()
    missing = [tool for tool in check.tools
               if subprocess.run(["which", tool], capture_output=True).returncode]
    if missing:
        return {"status": "UNAVAILABLE", "detail": f"missing tool: {', '.join(missing)}",
                "seconds": 0.0}
    for step in check.steps:
        try:
            result = subprocess.run(step, cwd=root, capture_output=True, text=True,
                                    timeout=check.timeout)
        except subprocess.TimeoutExpired:
            return {"status": "FAIL", "detail": f"timed out: {' '.join(step)}",
                    "seconds": round(time.monotonic() - started, 1)}
        if result.returncode:
            tail = (result.stdout + result.stderr).strip().splitlines()[-5:]
            return {"status": "FAIL", "detail": f"{' '.join(step)} exited {result.returncode}: "
                    + " | ".join(tail), "seconds": round(time.monotonic() - started, 1)}
    return {"status": "PASS", "detail": "", "seconds": round(time.monotonic() - started, 1)}


def whitespace(base: str) -> dict:
    for args in (["diff", "--check", f"{base}...HEAD"], ["diff", "--check", "HEAD"]):
        result = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True,
                                timeout=60)
        if result.returncode:
            return {"status": "FAIL", "detail": result.stdout.strip()[:500], "seconds": 0.0}
    return {"status": "PASS", "detail": "", "seconds": 0.0}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--base", default="origin/main",
                        help="commit the change is measured from (round 2+: the reviewed commit)")
    parser.add_argument("--run", action="store_true", help="run the selected checks")
    parser.add_argument("--broader", action="store_true", help="also run broader-tier checks")
    parser.add_argument("--all", action="store_true", help="select every check (release gates)")
    parser.add_argument("--reuse", type=Path,
                        help="earlier --record file; reuse its PASS where inputs are unchanged")
    parser.add_argument("--record", type=Path, help="write results and fingerprints as JSON")
    args = parser.parse_args()

    paths = changed_paths(args.base)
    chosen, unmapped = (list(CHECKS), []) if args.all else select(paths)
    deferred = [] if args.all or args.broader else [c for c in chosen if c.tier == "broader"]
    to_run = [c for c in chosen if c not in deferred]

    print(f"{len(paths)} changed path(s) since {args.base}.")
    for check in chosen:
        print(f"  {'DEFER' if check in deferred else 'SELECT'} {check.name} ({check.tier})")
    for path in unmapped:
        print(f"  UNMAPPED {path}: choose its checks by risk; unknown impact means expand")
    if not args.run:
        return 0

    previous = json.loads(args.reuse.read_text(encoding="utf-8")) if args.reuse else {}
    prints = {check.name: fingerprint(ROOT, check) for check in to_run}
    results: dict[str, dict] = {}
    fresh = []
    for check in to_run:
        old = previous.get("checks", {}).get(check.name, {})
        if old.get("status") == "PASS" and old.get("fingerprint") == prints[check.name]:
            results[check.name] = {**old, "status": "PASS", "reused_from": str(args.reuse)}
        else:
            fresh.append(check)
    with ThreadPoolExecutor(max_workers=4) as pool:
        for check, result in zip(fresh, pool.map(lambda c: run_check(ROOT, c), fresh)):
            results[check.name] = {**result, "fingerprint": prints[check.name],
                                   "steps": [" ".join(s) for s in check.steps]}
    results["whitespace"] = whitespace(args.base)

    for name, result in results.items():
        note = " (reused, inputs unchanged)" if "reused_from" in result else ""
        print(f"{result['status']}: {name}{note} {result['detail']}".rstrip())
    for check in deferred:
        print(f"DEFERRED: {check.name} (broader tier; run with --broader when risk requires)")
    if args.record:
        args.record.write_text(json.dumps({
            "base": args.base, "paths": paths, "unmapped": unmapped,
            "deferred": [c.name for c in deferred], "checks": results}, indent=2) + "\n",
            encoding="utf-8")
    statuses = {r["status"] for r in results.values()}
    if "FAIL" in statuses:
        return 1
    return 2 if "UNAVAILABLE" in statuses else 0


if __name__ == "__main__":
    sys.exit(main())
