"""Compare the original rich page with the suffix after a scoped Confluence insertion."""

import json
import sys
import tty
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "planning/layered-development-2026-11-01"))
from confluence_notice_composition import _Signature  # noqa: E402

tty.setraw(0)
payload = json.loads(sys.stdin.buffer.readline())
before = _Signature(payload["old"]).tokens
after = _Signature(payload["after"]).tokens
changes = [i for i, (a, b) in enumerate(zip(before, after)) if a != b]
print(json.dumps({"same": before == after, "tokens_old": len(before), "tokens_after": len(after), "first_difference": changes[0] if changes else None, "difference_count": len(changes)}))
