"""Check the MP-18 native-export provenance and documentation joins offline."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[2]


def read_json(name: str) -> dict:
    return json.loads((BASE / name).read_text())


def require(ok: bool, message: str) -> None:
    if not ok:
        raise AssertionError(message)


def main() -> None:
    manifest = read_json("manifest.json")
    arrows = read_json("connections.json")
    media = read_json("confluence-attachments.json")
    sync = read_json("confluence-sync.json")
    require(manifest["document_id"] == sync["lucid"]["document_id"], "Lucid mismatch")
    require(manifest["page_count"] == 8, "Unexpected number of Lucid pages")
    require(len(manifest["prior_page_ids"]) == 5 and manifest["prior_pages_preserved"], "Prior pages")
    require([p["page_number"] for p in manifest["pages"]] == [6, 7, 8], "MP page order")
    require(all(p["cards"] == 36 and p["validation_issues"] == 0 for p in manifest["pages"]), "Card/validation status")
    require(sum(p["nativeAwsIcons"] for p in manifest["pages"]) == 68, "Native AWS icon count")
    require(hashlib.sha256((BASE / "lucid-authoring.js").read_bytes()).hexdigest() == manifest["authoring_source"]["sha256"], "Source hash")

    for page in manifest["pages"]:
        path = BASE / page["filename"]
        require(path.is_file() and path.stat().st_size == page["bytes"], "Missing or changed PNG: " + page["filename"])
        require(hashlib.sha256(path.read_bytes()).hexdigest() == page["sha256"], "PNG hash: " + page["filename"])
        require(page["dimensions"] == [1880, 2153], "Unexpected export size")
        sequence = arrows[page["key"]]
        require(len(sequence) == page["numbered_connectors"], "Arrow count")
        require([x["id"] for x in sequence] == [f"{n:02}" for n in range(1, len(sequence) + 1)], "Arrow labels")
        require(all(x["from"] and x["to"] and x["meaning"] for x in sequence), "Incomplete arrow")
        attach = media[page["filename"]]
        require(attach["page_id"] == "4981639" and attach["bytes"] == page["bytes"], "Attachment mapping")
        require(attach["media_id"] in (BASE / "confluence-body-final.html").read_text(), "Missing inline image")

    receipt = sync["published_page"]
    require(receipt["id"] == "4981639" and receipt["version"] == 3 and receipt["native_media_refs"] == 3, "Published page")
    require({x["id"] for x in sync["hub_updates"]} == {"5014267", "5014301", "4981438"}, "Hub scope")
    require(all(x["version_after"] == x["version_before"] + 1 and x["old_content_canonical_tokens_preserved_in_dry_run"] for x in sync["hub_updates"]), "Hub preservation")
    final = (BASE / "confluence-body-final.html").read_text()
    require("MP18-FIGURE-" not in final and final.count('data-type="media-single"') == 3, "Final native figures")
    require(not any(x in final for x in ("<ac:", "<ri:", "{{")), "Unsupported Confluence markup")

    source = (ROOT / "docs/architecture-deep-dive.md").read_text()
    for needle in ("one server-controlled coordinator", "four proposed", "two candidate trainable families", "SQS worker DLQs", "Haiku Message Batch", "SageMaker AI", "CloudWatch", "X-Ray", "CloudTrail", "£100/month", "N1-E", "owner approval"):
        require(needle.lower() in source.lower(), "Deep-dive gap: " + needle)
    for link in re.findall(r"\]\(([^)]+)\)", source):
        if link.startswith(("https://", "http://", "#")):
            continue
        require((ROOT / "docs" / link).resolve().is_file(), "Broken local link: " + link)
    for file in (ROOT / "README.md", ROOT / "docs/architecture.md", ROOT / "docs/tech-stack.md"):
        content = file.read_text()
        require("architecture-deep-dive.md" in content and "/pages/4981639" in content, "Root doc drift: " + file.name)
    print(f"PASS: 3 native PNGs / 68 AWS icons / {sum(len(x) for x in arrows.values())} numbered arrows / 3 attachments / 4 MP pages / root-document links.")


if __name__ == "__main__":
    main()
