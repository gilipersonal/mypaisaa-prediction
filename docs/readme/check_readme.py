"""Check actual README navigation/artwork without network or extra dependencies."""

from __future__ import annotations

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


def main() -> None:
    source = (ROOT / "README.md").read_text()
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
        for element in svg.iter():
            require(element.tag.rsplit("}", 1)[-1] not in {"script", "foreignObject"}, "Executable/foreign SVG content")
            for key, value in element.attrib.items():
                if key.rsplit("}", 1)[-1] == "href":
                    require(value.startswith("#"), "External SVG resource")
    print(f"README: {local} local/anchor references and {len(svgs)} SVGs checked; no network calls.")


if __name__ == "__main__":
    main()
