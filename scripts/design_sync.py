#!/usr/bin/env python3
"""Keep MP's local designs and their Claude HTML artifacts in step (.claude/rules/design-sync.md).

    python3 scripts/design_sync.py check                                  # fail on a missing source; flag drift
    python3 scripts/design_sync.py record SLUG SOURCE ARTIFACT_URL MP-KEY  # after publishing SOURCE to the artifact

The repo file is the source; the artifact is published from it. The manifest, docs/design/artifacts.json, records the
sha256 of the file as last published, so a later edit that was not republished shows as PENDING.
"""

from __future__ import annotations

import datetime
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs/design/artifacts.json"
URL = re.compile(r"^https://claude\.ai/(artifact|code/artifact)/[A-Za-z0-9-]+$")
KEY = re.compile(r"^MP-\d+$")


def load(path: Path = MANIFEST) -> dict:
    return json.loads(path.read_text()) if path.exists() else {"designs": []}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def problems(manifest: dict, root: Path = ROOT) -> tuple[list[str], list[str]]:
    """(failures, pending) for every design in the manifest."""
    fail, pending, seen = [], [], set()
    designs = manifest.get("designs")
    if not isinstance(designs, list):
        return ["artifacts.json: `designs` must be a list"], []
    for d in designs:
        slug = d.get("slug") if isinstance(d, dict) else None
        if not slug:
            fail.append("artifacts.json: an entry has no slug")
            continue
        if slug in seen:
            fail.append(f"{slug}: listed twice")
        seen.add(slug)
        for field in ("source", "artifact_url", "published_sha256", "published_at", "jira"):
            if not d.get(field):
                fail.append(f"{slug}: no `{field}`")
        if d.get("artifact_url") and not URL.match(d["artifact_url"]):
            fail.append(f"{slug}: `{d['artifact_url']}` is not a claude.ai artifact link")
        if d.get("jira") and not KEY.match(d["jira"]):
            fail.append(f"{slug}: `{d['jira']}` is not an MP key")
        src = root / d["source"] if d.get("source") else None
        if src is not None and not src.is_file():
            fail.append(f"{slug}: source {d['source']} is missing")
        elif src is not None and d.get("published_sha256") and sha(src) != d["published_sha256"]:
            pending.append(f"{slug}: {d['source']} changed since it was synced to {d['artifact_url']}; republish it")
    return fail, pending


def check() -> int:
    fail, pending = problems(load())
    for line in fail:
        print(f"FAIL: {line}")
    for line in pending:
        print(f"PENDING: {line}")
    if not fail and not pending:
        print(f"design-sync: {len(load().get('designs', []))} design(s) in step with their artifacts")
    return 1 if fail or pending else 0


def record(slug: str, source: str, url: str, key: str) -> int:
    if not (ROOT / source).is_file():
        sys.exit(f"record: {source} does not exist")
    if not URL.match(url) or not KEY.match(key):
        sys.exit("record: need a claude.ai artifact link and an MP key")
    m = load()
    entry = {"slug": slug, "source": source, "artifact_url": url, "published_sha256": sha(ROOT / source),
             "published_at": datetime.date.today().isoformat(), "jira": key}
    m["designs"] = [d for d in m.get("designs", []) if d.get("slug") != slug] + [entry]
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(m, indent=1) + "\n")
    print(f"record: {slug} synced to {url}")
    return 0


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    if cmd == "check":
        sys.exit(check())
    if cmd == "record" and len(sys.argv) == 6:
        sys.exit(record(*sys.argv[2:6]))
    sys.exit(__doc__)
