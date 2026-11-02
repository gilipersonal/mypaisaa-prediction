"""Render the MP-18 technical source as a rich, scoped Confluence page body.

The published version replaces three visible figure placeholders with native
attachment media nodes after Confluence returns the real media IDs.
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

from markdown_it import MarkdownIt

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[2]
DOC = ROOT / "docs/architecture-deep-dive.md"
BRANCH = "MP-18-aws-architecture-deep-dive"
SOURCE_BASE = f"https://github.com/gilipersonal/mypaisaa-prediction/blob/{BRANCH}/docs/"
FIGURES = {
    "aws-request-topology.png": "MP18-FIGURE-REQUEST",
    "aws-events-batching.png": "MP18-FIGURE-EVENTS",
    "aws-forecasting-science.png": "MP18-FIGURE-FORECASTING",
}


def render(attachments: dict[str, dict] | None = None) -> str:
    source = DOC.read_text()
    source = source.split("\n", 1)[1]
    result = MarkdownIt("commonmark", {"html": False}).enable("table").render(source)

    def image(match: re.Match[str]) -> str:
        src = match.group(1)
        filename = Path(src).name
        if filename not in FIGURES:
            raise ValueError(f"Unexpected image: {filename}")
        marker = FIGURES[filename]
        if attachments is None:
            return f"<p><code>{marker}</code> Native Lucid export will appear here after its page attachment is verified.</p>"
        media = attachments[filename]
        for key in ("media_id", "collection"):
            if not media.get(key):
                raise ValueError(f"Missing verified {key} for {filename}")
        return (
            '<figure data-type="media-single" data-layout="center" '
            'data-width="100" data-width-type="percentage">'
            f'<div data-type="media" data-media-type="file" data-id="{html.escape(media["media_id"])}" '
            f'data-collection="{html.escape(media["collection"])}" '
            f'data-alt="{html.escape(match.group(2))}"></div>'
            f'<figcaption>Native Lucid page {6 + list(FIGURES).index(filename)}. '
            "Proposed technical design; open the image for full-resolution labels."
            "</figcaption></figure>"
        )

    result = re.sub(r'<img src="([^"]+)" alt="([^"]*)"\s*/?>', image, result)
    result = result.replace("<th>", '<th data-background="#DEEBFF">')
    result = result.replace("<table>", '<table data-layout="wide">')

    def link(match: re.Match[str]) -> str:
        target = html.unescape(match.group(1))
        if target.startswith(("https://", "http://", "#")):
            return match.group(0)
        resolved = (DOC.parent / target).resolve()
        if not resolved.is_relative_to(ROOT) or not resolved.is_file():
            raise ValueError(f"Broken source link: {target}")
        return f'href="{SOURCE_BASE}{html.escape(str(resolved.relative_to(ROOT / "docs")))}"'

    result = re.sub(r'href="([^"]+)"', link, result)
    status = (
        '<div data-type="panel-info"><p>'
        '<span data-type="status" data-color="yellow" data-status-style="bold">PROPOSED ARCHITECTURE</span> '
        '<time datetime="2026-11-01">1 November 2026</time> · MP-18 · '
        'Three native Lucid drawings · 36 components per drawing · '
        'one coordinator and four proposed Claude task routes · '
        'two proposed SageMaker model families. No AWS application deployment or final architecture approval.'
        "</p></div>"
    )
    result = status + result
    if attachments is not None and any(marker in result for marker in FIGURES.values()):
        raise ValueError("Figure placeholder remains in published body")
    if any(tag in result for tag in ("<ac:", "<ri:", "<html", "<body", "{{")):
        raise ValueError("Unsupported Confluence markup or unresolved allocation")
    return result


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--attachments", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    attached = json.loads(args.attachments.read_text()) if args.attachments else None
    args.output.write_text(render(attached))
    print(json.dumps({"output": str(args.output), "bytes": args.output.stat().st_size, "final": attached is not None}))
