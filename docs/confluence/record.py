#!/usr/bin/env python3
"""Record Confluence page ids and uploaded attachments in docs/confluence/confluence.json.

    python3 docs/confluence/record.py page SLUG ID [VERSION]
    python3 docs/confluence/record.py media SLUG PATH UPLOAD_RESPONSE.json
    python3 docs/confluence/record.py published SLUG VERSION     # the rendered body was sent
"""

import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
MANIFEST = HERE / "confluence.json"


def main() -> None:
    m = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {"space": {"key": "mypaisaapr", "id": "5145174", "home": "5145345"}, "pages": {}, "media": {}}
    kind, slug = sys.argv[1], sys.argv[2]
    if kind == "page":
        m["pages"].setdefault(slug, {}).update({"id": sys.argv[3], "version": int(sys.argv[4]) if len(sys.argv) > 4 else 1})
    elif kind == "media":
        response = json.loads(Path(sys.argv[4]).read_text())
        page = m["pages"][slug]["id"]
        digest = hashlib.sha256((HERE.parents[1] / sys.argv[3]).read_bytes()).hexdigest()
        m["media"].setdefault(slug, {})[sys.argv[3]] = {"id": response["fileId"], "collection": f"contentId-{page}",
                                                        "attachment": response["id"], "sha256": digest}
    elif kind == "published":
        body = (HERE / "pages" / f"{slug}.html").read_bytes()
        m["pages"][slug].update({"version": int(sys.argv[3]), "sha256": hashlib.sha256(body).hexdigest()})
    MANIFEST.write_text(json.dumps(m, indent=1, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
