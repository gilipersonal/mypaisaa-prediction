"""Check actual README navigation/artwork without network or extra dependencies."""

from __future__ import annotations

import base64
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def slug(text: str) -> str:
    return re.sub(r"[^\w\- ]", "", text.strip().lower()).replace(" ", "-")


def check_svg_content(svg: ET.Element, depth: int = 0) -> None:
    require(depth <= 2, "Nested SVG resources exceed the badge limit")
    for element in svg.iter():
        require(element.tag.rsplit("}", 1)[-1] not in {"script", "foreignObject"}, "Executable/foreign SVG content")
        for key, value in element.attrib.items():
            require(not key.lower().startswith("on"), "SVG event handler")
            if key.rsplit("}", 1)[-1] == "href":
                if value.startswith("#"):
                    continue
                prefix = "data:image/svg+xml;base64,"
                require(value.startswith(prefix) and len(value) < 128000, "External SVG resource")
                nested = ET.fromstring(base64.b64decode(value[len(prefix):], validate=True))
                require(nested.tag == "{http://www.w3.org/2000/svg}svg", "Invalid embedded SVG logo")
                check_svg_content(nested, depth + 1)


def main() -> None:
    source = (ROOT / "README.md").read_text()
    picture = re.search(r"<picture>(.*?)</picture>", source, flags=re.S)
    require(picture is not None, "Missing motion-aware logo picture")
    sources = re.findall(r'<source media="([^"]+)" srcset="([^"]+)"', picture[1])
    require(len(sources) >= 3, "Logo needs explicit reduced-motion and theme fallbacks")
    require(sources[:3] == [
        ("(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)", "docs/readme/mark-static-dark.svg"),
        ("(prefers-reduced-motion: reduce)", "docs/readme/mark-static.svg"),
        ("(prefers-color-scheme: dark)", "docs/readme/mark-dark.svg"),
    ], "Static motion fallbacks must precede animated theme sources")
    headings = {slug(x) for x in re.findall(r"^#{1,6} (.+)$", source, re.M)}
    links = re.findall(r"\[[^\]]*\]\(([^)]+)\)", source)
    links += re.findall(r'(?:src|srcset|href)="([^"]+)"', source)
    local = 0
    for link in links:
        parts = urlsplit(link)
        if parts.scheme or parts.netloc:
            continue
        if not parts.path:
            require(parts.fragment in headings, "Missing README anchor: " + link)
        else:
            target = (ROOT / unquote(parts.path)).resolve()
            require(target.is_relative_to(ROOT) and target.exists(), "Missing local reference: " + link)
        local += 1
    svgs = list((ROOT / "docs/readme").rglob("*.svg"))
    require(bool(svgs), "README artwork is missing")
    for path in svgs:
        svg = ET.parse(path).getroot()
        require(svg.tag == "{http://www.w3.org/2000/svg}svg", "Invalid SVG root")
        require(float(svg.attrib["width"]) > 0 and float(svg.attrib["height"]) > 0, "Invalid SVG size")
        require(svg.find("{http://www.w3.org/2000/svg}title") is not None, "Missing SVG title")
        check_svg_content(svg)
    manifest = json.loads((ROOT / "docs/readme/shields-badges.json").read_text())
    for row in manifest["records"]:
        path = (ROOT / "docs/readme" / row["file"]).resolve()
        require(path.is_relative_to(ROOT / "docs/readme/badges"), "Badge path outside its directory")
        require(hashlib.sha256(path.read_bytes()).hexdigest() == row["sha256"], "Vendored badge hash differs")
        require(ET.parse(path).getroot().attrib["height"] == "20", "Badge is not the compact reference style")
    print(f"README: {local} local/anchor references and {len(svgs)} SVGs checked; no network calls.")


if __name__ == "__main__":
    main()
