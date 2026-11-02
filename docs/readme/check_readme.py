"""Check the root documents' links, the mark and the motion GIFs, offline and with the standard library."""

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


DOCS = ("README.md", "ARCHITECTURE.md", "TECH-STACK.md")
MAX_GIF_BYTES = 3_000_000


def gif_frames(data: bytes) -> int:
    """Count the image descriptors in a GIF by walking its blocks."""
    require(data[:6] in (b"GIF87a", b"GIF89a"), "Not a GIF")
    i, flags = 13, data[10]
    if flags & 0x80:
        i += 3 * (2 << (flags & 7))
    frames = 0
    while i < len(data):
        block = data[i]
        if block == 0x3B:
            break
        if block == 0x21:
            i += 2
        elif block == 0x2C:
            frames += 1
            local = data[i + 9]
            i += 10 + (3 * (2 << (local & 7)) if local & 0x80 else 0) + 1
        else:
            raise ValueError("Malformed GIF block")
        while data[i]:
            i += data[i] + 1
        i += 1
    return frames


def check_links(name: str) -> int:
    source = (ROOT / name).read_text()
    headings = {slug(x) for x in re.findall(r"^#{1,6} (.+)$", source, re.M)}
    links = re.findall(r"\[[^\]]*\]\(([^)]+)\)", source)
    links += re.findall(r'(?:src|srcset|href)="([^"]+)"', source)
    local = 0
    for link in links:
        parts = urlsplit(link)
        if parts.scheme or parts.netloc:
            continue
        if not parts.path:
            require(parts.fragment in headings, f"Missing anchor in {name}: {link}")
        else:
            target = (ROOT / unquote(parts.path)).resolve()
            require(target.is_relative_to(ROOT) and target.exists(), f"Missing local reference in {name}: {link}")
            if parts.fragment and target.suffix == ".md":
                theirs = {slug(x) for x in re.findall(r"^#{1,6} (.+)$", target.read_text(), re.M)}
                require(parts.fragment in theirs, f"Missing anchor in {name}: {link}")
        local += 1
    return local


def main() -> None:
    source = (ROOT / "README.md").read_text()
    picture = re.search(r"<picture>(.*?)</picture>", source, flags=re.S)
    require(picture is not None, "Missing motion-aware logo picture")
    sources = re.findall(r'<source media="([^"]+)" srcset="([^"]+)"', picture[1])
    require(sources[:3] == [
        ("(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)", "docs/brand/mark-dark.svg"),
        ("(prefers-reduced-motion: reduce)", "docs/brand/mark.svg"),
        ("(prefers-color-scheme: dark)", "docs/brand/mark-animated-dark.svg"),
    ], "Static motion fallbacks must precede animated theme sources")
    require('src="docs/brand/mark-animated.svg"' in picture[1], "The default logo must be the animated light mark")
    local = sum(check_links(name) for name in DOCS)

    svgs = sorted((ROOT / "docs/brand").glob("*.svg")) + sorted((ROOT / "docs/readme").rglob("*.svg"))
    require(bool(svgs), "README artwork is missing")
    for path in svgs:
        svg = ET.parse(path).getroot()
        require(svg.tag == "{http://www.w3.org/2000/svg}svg", f"Invalid SVG root: {path.name}")
        require(float(svg.attrib["width"]) > 0 and float(svg.attrib["height"]) > 0, f"Invalid SVG size: {path.name}")
        require(svg.find("{http://www.w3.org/2000/svg}title") is not None, f"Missing SVG title: {path.name}")
        check_svg_content(svg)
        text = path.read_text()
        if path.parent.name == "brand":
            animated = "animated" in path.stem
            require(("@keyframes" in text) == animated, f"Only the animated marks may animate: {path.name}")
            if animated:
                require("prefers-reduced-motion: reduce" in text, f"Animated mark ignores Reduce Motion: {path.name}")

    gifs = sorted((ROOT / "docs/motion").glob("*.gif"))
    require(bool(gifs), "Documentation motion is missing")
    for gif in gifs:
        data = gif.read_bytes()
        require(len(data) <= MAX_GIF_BYTES, f"GIF over {MAX_GIF_BYTES} bytes: {gif.name}")
        require(gif_frames(data) > 1, f"GIF has no motion: {gif.name}")
        require(gif.with_suffix(".png").exists(), f"GIF has no still image: {gif.name}")

    manifest = json.loads((ROOT / "docs/readme/shields-badges.json").read_text())
    for row in manifest["records"]:
        path = (ROOT / "docs/readme" / row["file"]).resolve()
        require(path.is_relative_to(ROOT / "docs/readme/badges"), "Badge path outside its directory")
        require(hashlib.sha256(path.read_bytes()).hexdigest() == row["sha256"], "Vendored badge hash differs")
        require(ET.parse(path).getroot().attrib["height"] == "20", "Badge is not the compact reference style")
    print(f"Docs: {local} local/anchor references in {len(DOCS)} documents, {len(svgs)} SVGs and "
          f"{len(gifs)} GIFs checked; no network calls.")


if __name__ == "__main__":
    main()
