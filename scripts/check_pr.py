"""Validate PR metadata without evaluating user-controlled text as shell code."""

import os
import re
import subprocess


def validate(title: str, branch: str, base: str, subjects: list[str]) -> list[str]:
    errors = []
    branch_match = re.match(r"^(MP-[1-9][0-9]*)-[a-z0-9]+(?:-[a-z0-9]+)*$", branch)
    if not branch_match:
        errors.append("Branch must use MP-<number>-<lowercase-slug>.")
    title_match = re.match(r"^\[(MP-[1-9][0-9]*)\] \S", title)
    if not title_match:
        errors.append("PR title must start with [MP-<number>] followed by a summary.")
    if branch_match and title_match and branch_match[1] != title_match[1]:
        errors.append("PR title and branch must use the same issue key.")
    if base != "main":
        errors.append("PR destination must be main.")
    if not subjects:
        errors.append("PR must contain at least one commit.")
    for subject in subjects:
        if not re.match(r"^MP-[1-9][0-9]*: \S", subject):
            errors.append("Every commit subject must start with MP-<number>: and a summary.")
    return errors


def main() -> int:
    base_sha, head_sha = os.environ["BASE_SHA"], os.environ["HEAD_SHA"]
    if not all(re.fullmatch(r"[0-9a-f]{40}", sha) for sha in (base_sha, head_sha)):
        print("Invalid commit identifiers supplied by the PR event.")
        return 1
    subjects = subprocess.run(
        ["git", "log", "--format=%s", f"{base_sha}..{head_sha}"],
        check=True, capture_output=True, text=True, timeout=30,
    ).stdout.splitlines()
    errors = validate(os.environ["TITLE"], os.environ["BRANCH"],
                      os.environ["BASE_BRANCH"], subjects)
    for error in errors:
        print(error)
    if not errors:
        print("PR targets main and has consistent Jira traceability.")
    return int(bool(errors))


if __name__ == "__main__":
    raise SystemExit(main())
