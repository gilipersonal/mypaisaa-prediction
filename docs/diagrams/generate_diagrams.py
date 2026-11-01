"""Rebuild editable Draw.io sources and animated documentation exports.

Requires Pillow only. The canonical model is diagrams.json; all exports are
generated from the same node labels, geometry and connector paths.
"""

from __future__ import annotations

import html
import itertools
import json
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
PALETTE = json.loads((HERE / "palette.json").read_text())
PRIMITIVE = PALETTE["primitive"]
SEMANTIC = PALETTE["semantic"]
COMPONENT = PALETTE["component"]
REGULAR = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]
BOLD = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


def color(name: str) -> str:
    return PRIMITIVE[SEMANTIC.get(name, name)]


def role(name: str) -> tuple[str, str]:
    accent, tint = SEMANTIC[name]
    return PRIMITIVE[accent], PRIMITIVE[tint]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    for path in BOLD if bold else REGULAR:
        if Path(path).is_file():
            return ImageFont.truetype(path, size)
    raise RuntimeError("Install Arial or DejaVu Sans before rendering diagrams")


def path_segments(points):
    return [(a, b, math.dist(a, b)) for a, b in itertools.pairwise(points)]


def point_at(points, distance):
    for a, b, length in path_segments(points):
        if distance <= length:
            fraction = distance / length if length else 0
            return (a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction)
        distance -= length
    return points[-1]


def draw_edge(draw, edge, offset=0):
    points = [tuple(p) for p in edge["points"]]
    accent = role(edge.get("role", "operations"))[0]
    draw.line(points, fill=color("connector"), width=3, joint="curve")
    total = sum(length for _, _, length in path_segments(points))
    for start in range(-30, int(total) + 30, 30):
        a, b = max(0, start + offset), min(total, start + offset + 11)
        if b > a:
            draw.line([point_at(points, a), point_at(points, b)], fill=accent, width=4)
    end, before = points[-1], points[-2]
    angle = math.atan2(end[1] - before[1], end[0] - before[0])
    wings = [
        (
            end[0] - 12 * math.cos(angle + sign * 0.45),
            end[1] - 12 * math.sin(angle + sign * 0.45),
        )
        for sign in (-1, 1)
    ]
    draw.polygon([end, *wings], fill=accent)


def raster(model, offset=0):
    image = Image.new("RGB", (model["width"], model["height"]), color("background"))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((30, 25, 113, 57), radius=10, fill=role("api")[1])
    draw.text((43, 31), "MP / 03", font=font(17, True), fill=role("api")[0])
    draw.text(
        (135, 25),
        model["title"],
        font=font(COMPONENT["titleSize"], True),
        fill=color("text"),
    )
    draw.text((40, 80), model["subtitle"], font=font(19), fill=color("secondaryText"))
    for band in model.get("bands", []):
        draw.text(
            (band["x"], band["y"]),
            band["text"],
            font=font(16, True),
            fill=color("secondaryText"),
        )
    for edge in model["edges"]:
        draw_edge(draw, edge, offset)
    for node in model["nodes"]:
        x, y, w, h = node["box"]
        accent, tint = role(node["role"])
        draw.rounded_rectangle(
            (x, y + 5, x + w, y + h + 5), radius=18, fill=color("connector")
        )
        draw.rounded_rectangle(
            (x, y, x + w, y + h), radius=18, fill=tint, outline=accent, width=2
        )
        draw.rounded_rectangle(
            (x + 15, y + 16, x + 21, y + h - 16), radius=3, fill=accent
        )
        draw.text(
            (x + 35, y + 17), node["title"], font=font(22, True), fill=color("text")
        )
        for i, line in enumerate(node.get("lines", [])):
            draw.text(
                (x + 35, y + 48 + i * 24), line, font=font(18), fill=color("text")
            )
    footer_y = model["height"] - 105
    draw.line(
        (40, footer_y - 12, model["width"] - 40, footer_y - 12),
        fill=color("connector"),
        width=1,
    )
    draw.text((40, footer_y), model["note"], font=font(17, True), fill=color("text"))
    draw.text(
        (40, footer_y + 28), model["footer"], font=font(16), fill=color("secondaryText")
    )
    draw.text(
        (40, footer_y + 55),
        "1 November 2026  |  Conceptual flows, not live activity  |  Personal use only - no trading",
        font=font(16),
        fill=color("secondaryText"),
    )
    return image


def svg(model):
    def text(x, y, value, size=18, weight=400, fill=None):
        return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill or color("text")}">{html.escape(value)}</text>'

    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{model["width"]}" height="{model["height"]}" viewBox="0 0 {model["width"]} {model["height"]}" role="img" aria-labelledby="title desc">',
        f'<title id="title">{html.escape(model["title"])}</title>',
        f'<desc id="desc">{html.escape(model["description"])}</desc>',
        "<style>text{font-family:Arial,Helvetica,sans-serif}.flow{stroke-dasharray:11 19;animation:flow 1.2s linear infinite}@keyframes flow{to{stroke-dashoffset:-30}}@media(prefers-reduced-motion:reduce){.flow{animation:none}}</style>",
        f'<rect width="100%" height="100%" fill="{color("background")}"/>',
        text(40, 55, "MYPAISAA / " + model["title"], 32, 700),
        text(40, 96, model["subtitle"], 19, fill=color("secondaryText")),
    ]
    for band in model.get("bands", []):
        out.append(
            text(
                band["x"], band["y"] + 16, band["text"], 16, 700, color("secondaryText")
            )
        )
    for index, edge in enumerate(model["edges"]):
        accent = role(edge.get("role", "operations"))[0]
        marker = f"arrow-{index}"
        out.append(
            f'<defs><marker id="{marker}" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 Z" fill="{accent}"/></marker></defs>'
        )
        points = " ".join(f"{x},{y}" for x, y in edge["points"])
        out.append(
            f'<polyline points="{points}" fill="none" stroke="{color("connector")}" stroke-width="3"/>'
        )
        out.append(
            f'<polyline class="flow" points="{points}" fill="none" stroke="{accent}" stroke-width="3" marker-end="url(#{marker})"/>'
        )
    for node in model["nodes"]:
        x, y, w, h = node["box"]
        accent, tint = role(node["role"])
        out.extend(
            [
                f'<rect x="{x}" y="{y + 5}" width="{w}" height="{h}" rx="18" fill="{color("connector")}"/>',
                f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="18" fill="{tint}" stroke="{accent}" stroke-width="2"/>',
                f'<rect x="{x + 15}" y="{y + 16}" width="6" height="{h - 32}" rx="3" fill="{accent}"/>',
                text(x + 35, y + 38, node["title"], 22, 700),
            ]
        )
        out.extend(
            text(x + 35, y + 66 + i * 24, line)
            for i, line in enumerate(node.get("lines", []))
        )
    y = model["height"] - 105
    out.extend(
        [
            f'<path d="M40,{y - 12} H{model["width"] - 40}" stroke="{color("connector")}"/>',
            text(40, y + 18, model["note"], 17, 700),
            text(40, y + 46, model["footer"], 16, fill=color("secondaryText")),
            text(
                40,
                y + 73,
                "1 November 2026 | Conceptual flows, not live activity | Personal use only - no trading",
                16,
                fill=color("secondaryText"),
            ),
            "</svg>",
        ]
    )
    return "\n".join(out)


def drawio(model):
    wrapper = ET.Element("mxfile", {"host": "app.diagrams.net", "version": "29.0.0"})
    page = ET.SubElement(
        wrapper, "diagram", {"id": model["id"], "name": model["title"]}
    )
    graph = ET.SubElement(
        page,
        "mxGraphModel",
        {
            "pageWidth": str(model["width"]),
            "pageHeight": str(model["height"]),
            "page": "1",
            "background": color("background"),
            "adaptiveColors": "none",
        },
    )
    root = ET.SubElement(graph, "root")
    ET.SubElement(root, "mxCell", {"id": "0"})
    ET.SubElement(root, "mxCell", {"id": "1", "parent": "0"})

    def cell(identifier, value, x, y, w, h, style):
        c = ET.SubElement(
            root,
            "mxCell",
            {
                "id": identifier,
                "value": value,
                "vertex": "1",
                "parent": "1",
                "style": style,
            },
        )
        ET.SubElement(
            c,
            "mxGeometry",
            {
                "x": str(x),
                "y": str(y),
                "width": str(w),
                "height": str(h),
                "as": "geometry",
            },
        )

    base = f"fontFamily=Arial;fontColor={color('text')};html=0;whiteSpace=wrap;"
    cell(
        "heading",
        model["title"],
        40,
        20,
        model["width"] - 80,
        50,
        base + "text;align=left;fontSize=34;fontStyle=1;",
    )
    cell(
        "subtitle",
        model["subtitle"],
        40,
        75,
        model["width"] - 80,
        35,
        base + "text;align=left;fontSize=19;",
    )
    for node in model["nodes"]:
        accent, tint = role(node["role"])
        cell(
            node["id"],
            "\n".join([node["title"], *node.get("lines", [])]),
            *node["box"],
            base
            + f"rounded=1;arcSize=18;fillColor={tint};strokeColor={accent};strokeWidth=2;fontSize=18;spacing=10;",
        )
    nodes = {node["id"]: node for node in model["nodes"]}
    for index, edge in enumerate(model["edges"]):
        accent = role(edge.get("role", "operations"))[0]
        attrs = {
            "id": f"edge-{index}",
            "edge": "1",
            "parent": "1",
            "source": edge["source"],
            "target": edge["target"],
            "style": f"edgeStyle=orthogonalEdgeStyle;rounded=1;strokeColor={accent};strokeWidth=3;dashed=1;dashPattern=11 19;flowAnimation=1;endArrow=block;endFill=1;",
        }
        c = ET.SubElement(root, "mxCell", attrs)
        geometry = ET.SubElement(c, "mxGeometry", {"relative": "1", "as": "geometry"})
        # Connection anchors are intentional: exports and editable source share endpoints.
        for end, key in [("source", "exit"), ("target", "entry")]:
            node = nodes[edge[end]]
            x, y, w, h = node["box"]
            px, py = edge["points"][0 if end == "source" else -1]
            c.attrib["style"] += f"{key}X={(px - x) / w};{key}Y={(py - y) / h};"
        if len(edge["points"]) > 2:
            points = ET.SubElement(geometry, "Array", {"as": "points"})
            for x, y in edge["points"][1:-1]:
                ET.SubElement(points, "mxPoint", {"x": str(x), "y": str(y)})
    for i, band in enumerate(model.get("bands", [])):
        cell(
            f"band-{i}",
            band["text"],
            band["x"],
            band["y"],
            400,
            30,
            base + "text;align=left;fontSize=16;fontStyle=1;",
        )
    cell(
        "footer",
        "\n".join(
            [
                model["note"],
                model["footer"],
                "1 November 2026 | Conceptual flows, not live activity | Personal use only - no trading",
            ]
        ),
        40,
        model["height"] - 115,
        model["width"] - 80,
        100,
        base + "text;align=left;fontSize=17;",
    )
    ET.indent(wrapper, space="  ")
    return ET.tostring(wrapper, encoding="unicode")


def validate(model):
    ids = [node["id"] for node in model["nodes"]]
    assert len(ids) == len(set(ids)), "Duplicate node IDs"
    for node in model["nodes"]:
        x, y, w, h = node["box"]
        assert (
            min(x, y) >= 0 and x + w <= model["width"] and y + h < model["height"] - 115
        )
        assert node["role"] in SEMANTIC
    for edge in model["edges"]:
        assert edge["source"] in ids and edge["target"] in ids
        assert len(edge["points"]) >= 2
    parsed = ET.fromstring(drawio(model))
    cells = parsed.findall(".//mxCell")
    assert len({cell.get("id") for cell in cells}) == len(cells)


def main():
    models = json.loads((HERE / "diagrams.json").read_text())["diagrams"]
    for model in models:
        validate(model)
        prefix = HERE / model["id"]
        prefix.with_suffix(".drawio").write_text(drawio(model) + "\n")
        prefix.with_suffix(".svg").write_text(svg(model) + "\n")
        ET.parse(prefix.with_suffix(".svg"))
        base = raster(model)
        base.save(prefix.with_suffix(".png"), optimize=True)
        frames = [raster(model, i * 2.5).quantize(colors=96) for i in range(12)]
        frames[0].save(
            prefix.with_suffix(".gif"),
            save_all=True,
            append_images=frames[1:],
            duration=100,
            loop=0,
            disposal=2,
            optimize=True,
        )
        with Image.open(prefix.with_suffix(".gif")) as gif:
            assert gif.n_frames == 12
            first = gif.convert("RGB").tobytes()
            gif.seek(1)
            assert gif.convert("RGB").tobytes() != first, "Animation did not move"
        print(
            model["id"],
            "validated; PNG, animated SVG/GIF and editable draw.io source rebuilt",
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
