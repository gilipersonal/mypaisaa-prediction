#!/usr/bin/env python3
"""Remind Codex of project-specific approval boundaries; never run a review."""

import json
import re
import sys


def main() -> None:
    try:
        event = json.load(sys.stdin)
    except (ValueError, OSError):
        return
    prompt = event.get("prompt", "")
    if not isinstance(prompt, str):
        return
    if re.search(r"\b(review|regression|plan[ -]?sync|drift|synchroni[sz]e)\b", prompt, re.I):
        print(json.dumps({"hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": (
                "Mypaisaa Prediction: read .codex/rules/workflow.md. Plan-sync, "
                "independent review, and review-regression runs require approval "
                "for their stated scope, even if initially requested. Ask again "
                "before every review round. Offer choices when available. Do not "
                "assume approval from silence or an unrelated answer."
            ),
        }}))


if __name__ == "__main__":
    main()
