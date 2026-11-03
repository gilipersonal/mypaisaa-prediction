#!/usr/bin/env python3
"""Upload every attachment a page needs and record each media id in confluence.json.

The Atlassian MCP's createConfluenceAttachment returns a short-lived upload URL and token for one
page; save that response as JSON and pass it here. A file already recorded for the page with the same sha256 is
skipped; a changed file is uploaded again.

    python3 docs/confluence/upload.py SLUG PREPARE_RESPONSE.json
"""

import fcntl
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]


def main() -> int:
    slug, prepared = sys.argv[1], json.loads(Path(sys.argv[2]).read_text())
    prepared = prepared.get("data", prepared)
    needed = json.loads((HERE / "media-needed.json").read_text()).get(slug, [])
    manifest = json.loads((HERE / "confluence.json").read_text())
    done = manifest["media"].get(slug, {})
    failures = 0
    for path in dict.fromkeys(needed):
        if not (ROOT / path).exists():
            print(f"skip {path}: not built yet")
            continue
        digest = hashlib.sha256((ROOT / path).read_bytes()).hexdigest()
        if done.get(path, {}).get("sha256") == digest:
            continue
        with tempfile.NamedTemporaryFile("w+", suffix=".json") as out:
            subprocess.run(["curl", "-s", "--location", prepared["uploadUrl"], "--header", "Accept: application/json",
                            "--header", f"Authorization: Bearer {prepared['mediaToken']}",
                            "--form", f"file=@{ROOT / path}", "--output", out.name], check=True, timeout=120)
            response = json.loads(Path(out.name).read_text() or "{}")
        if "fileId" not in response:
            print(f"FAIL {path}: {str(response)[:200]}")
            failures += 1
            continue
        # Several pages upload at once, so the manifest is updated under a lock.
        with open(HERE / ".confluence.lock", "w") as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            manifest = json.loads((HERE / "confluence.json").read_text())
            manifest["media"].setdefault(slug, {})[path] = {"id": response["fileId"], "collection": f"contentId-{prepared['contentId']}",
                                                           "attachment": response["id"], "sha256": digest}
            (HERE / "confluence.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False) + "\n")
        print(f"uploaded {path} -> {response['fileId']}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
