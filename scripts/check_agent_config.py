#!/usr/bin/env python3
"""Check the coding agents' configuration: Claude's skills, rules and Jira flow, Codex's JSON,
and that the branch-protection file names exactly the CI checks the workflows define.

Standard library only, no network. Exits non-zero and lists every problem it finds.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

JSON_FILES = (
    ".claude/jira-flow.json",
    ".codex/hooks.json",
    ".codex/review-policy.json",
    ".codex/review-document-baseline.json",
    ".github/main-protection.json",
)
WORKFLOWS = (".github/workflows/verify.yml", ".github/workflows/jira-key.yml")
# A backticked path in a rule is checked when it looks like a concrete repository file.
RULE_PATH = re.compile(r"`([A-Za-z0-9_.\-/]+\.(?:md|json|py|yml))`")
LINK = re.compile(r"\[[^\]]*\]\(([^)#\s]+)(?:#[^)]*)?\)")
JOB_NAME = re.compile(r"^    name: (.+)$", re.MULTILINE)


def load_json(root: Path, rel: str, problems: list[str]) -> object | None:
    path = root / rel
    if not path.exists():
        problems.append(f"{rel}: missing")
        return None
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as error:
        problems.append(f"{rel}: invalid JSON ({error})")
        return None


def frontmatter(text: str) -> dict[str, str] | None:
    if not text.startswith("---\n"):
        return None
    end = text.find("\n---\n", 4)
    if end < 0:
        return None
    fields = {}
    for line in text[4:end].splitlines():
        key, sep, value = line.partition(":")
        if sep:
            fields[key.strip()] = value.strip()
    return fields


def check_skills(root: Path, problems: list[str]) -> None:
    skills = sorted((root / ".claude/skills").glob("*/SKILL.md"))
    if not skills:
        problems.append(".claude/skills: no SKILL.md found")
    for path in skills:
        rel = path.relative_to(root)
        fields = frontmatter(path.read_text())
        if fields is None:
            problems.append(f"{rel}: no frontmatter block")
            continue
        if fields.get("name") != path.parent.name:
            problems.append(f"{rel}: name {fields.get('name')!r} does not match its folder {path.parent.name!r}")
        if not fields.get("description"):
            problems.append(f"{rel}: description is empty")


def check_rules(root: Path, problems: list[str]) -> None:
    for path in sorted((root / ".claude/rules").glob("*.md")):
        rel = path.relative_to(root)
        text = path.read_text()
        for target in LINK.findall(text):
            if "://" not in target and not (path.parent / target).resolve().exists():
                problems.append(f"{rel}: broken link {target}")
        for target in RULE_PATH.findall(text):
            if "/" in target and not (root / target).exists():
                problems.append(f"{rel}: names {target}, which does not exist")


def check_protection(root: Path, protection: object, problems: list[str]) -> None:
    jobs: list[str] = []
    for rel in WORKFLOWS:
        path = root / rel
        if not path.exists():
            problems.append(f"{rel}: missing")
            continue
        jobs += [name.strip().strip("'\"") for name in JOB_NAME.findall(path.read_text())]
    try:
        required = protection["required_status_checks"]["contexts"]  # type: ignore[index]
    except (KeyError, TypeError):
        problems.append(".github/main-protection.json: no required_status_checks.contexts")
        return
    if sorted(required) != sorted(jobs):
        problems.append(f".github/main-protection.json: requires {sorted(required)}, but the workflows define {sorted(jobs)}")


def check(root: Path = ROOT) -> list[str]:
    problems: list[str] = []
    loaded = {rel: load_json(root, rel, problems) for rel in JSON_FILES}
    flow = loaded[".claude/jira-flow.json"]
    if isinstance(flow, dict) and flow.get("jira", {}).get("projectKey") != "MP":
        problems.append(".claude/jira-flow.json: jira.projectKey is not MP")
    check_skills(root, problems)
    check_rules(root, problems)
    if loaded[".github/main-protection.json"] is not None:
        check_protection(root, loaded[".github/main-protection.json"], problems)
    return problems


def main() -> int:
    problems = check()
    for problem in problems:
        print(f"FAIL: {problem}")
    if not problems:
        print("Agent config: Claude skills, rules and Jira flow, Codex JSON and the protection checks are consistent.")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
