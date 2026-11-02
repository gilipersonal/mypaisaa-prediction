"""Build the Mypaisaa Prediction mark ("Fan") in every variant from one geometry.

The mark: a price line runs up to "now", opens into a forecast fan (the 50% and 80%
bands around a median), and a mint dot lands inside the band, the forecast graded
against the outcome. Run from the repo root:

    python3 docs/brand/build_brand.py            # SVGs only, no dependencies
    uv run --no-project --with playwright python docs/brand/build_brand.py --png

--png also renders the PNG sizes and the 1024 px app-icon source with the local Chrome.
"""

from __future__ import annotations

import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent

# Palette (also in docs/brand/README.md).
INK_TOP, INK_BOTTOM = "#16244A", "#0B1329"
PAPER = "#F7F2E8"
SAFFRON = "#F5A524"
MINT = "#3DDC97"

NOW = (52, 68)
HISTORY = "M15 89 L27 78 L36 82 L45 70 L52 68"
# The fan is a sector centred on "now": its far edge is the horizon, its spread the 80% and 50% bands.
OUTER = "M52 68 L90.3 35.9 A50 50 0 0 1 99.6 83.5 Z"
INNER = "M52 68 L97.7 47.7 A50 50 0 0 1 101.8 72.4 Z"
HORIZONS = ("M75.0 48.7 A30 30 0 0 1 81.5 73.2", "M82.6 42.3 A40 40 0 0 1 90.0 80.4")
MEDIAN = "M52 68 L101.4 60.2"
OUTCOME = (90.6, 59.0)

MOTION = """
  <style>
    .tile { animation: mp-tile .5s cubic-bezier(.2,.8,.2,1) both; transform-origin: 60px 60px; }
    .hist { stroke-dasharray: 60; animation: mp-draw 1s .35s cubic-bezier(.65,0,.35,1) both; }
    .now { animation: mp-pop .45s 1.25s cubic-bezier(.3,1.6,.5,1) both; transform-box: fill-box; transform-origin: center; }
    .fan { animation: mp-fan .9s 1.5s cubic-bezier(.16,1,.3,1) both; transform-origin: 52px 68px; }
    .med { animation: mp-fade .5s 1.9s ease-out both; }
    .hit { animation: mp-pop .5s 2.35s cubic-bezier(.3,1.6,.5,1) both; transform-box: fill-box; transform-origin: center; }
    .ring { animation: mp-ring 1s 2.45s ease-out forwards; transform-box: fill-box; transform-origin: center; }
    @keyframes mp-tile { from { opacity: 0; transform: scale(.86); } }
    @keyframes mp-draw { from { stroke-dashoffset: 60; } }
    @keyframes mp-pop { from { transform: scale(0); } }
    @keyframes mp-fade { from { opacity: 0; } }
    @keyframes mp-fan { from { transform: scaleX(0) scaleY(.2); opacity: 0; } }
    @keyframes mp-ring { 0% { transform: scale(.6); opacity: .9; } 100% { transform: scale(2.6); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } .ring { opacity: 0; } }
  </style>"""


def mark(*, animated: bool, dark: bool, full_bleed: bool = False, small: bool = False, title: str) -> str:
    edge = "" if not dark else '<rect x="4.5" y="4.5" width="111" height="111" rx="27.5" fill="none" stroke="#FFFFFF" stroke-opacity=".14"/>'
    tile = (
        '<rect width="120" height="120" fill="url(#ink)"/>'
        if full_bleed
        else '<rect x="4" y="4" width="112" height="112" rx="28" fill="url(#ink)"/>'
    )
    grid = "" if small else "".join(
        f'<line x1="18" x2="102" y1="{y}" y2="{y}" stroke="{PAPER}" stroke-opacity=".07" stroke-width="1"/>'
        for y in (32, 56, 80)
    )
    sw = 9 if small else 5.5
    now_r, hit_r = (8.5, 8) if small else (6, 5.5)
    median = "" if small else (
        f'<path class="med" d="{MEDIAN}" fill="none" stroke="{PAPER}" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>'
    )
    ring = "" if (small or not animated) else (
        f'<circle class="ring" cx="{OUTCOME[0]}" cy="{OUTCOME[1]}" r="{hit_r}" fill="none" stroke="{MINT}" stroke-width="2" opacity="0"/>'
    )
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" role="img" aria-labelledby="t">
  <title id="t">{title}</title>
  <defs>
    <linearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{INK_TOP}"/><stop offset="1" stop-color="{INK_BOTTOM}"/>
    </linearGradient>
    <linearGradient id="fan" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="{SAFFRON}" stop-opacity=".95"/><stop offset="1" stop-color="{SAFFRON}" stop-opacity=".55"/>
    </linearGradient>
  </defs>{MOTION if animated else ""}
  <g class="tile">
    {tile}{edge}
    {grid}
    <g class="fan">
      <path d="{OUTER}" fill="url(#fan)" opacity=".5"/>
      <path d="{INNER}" fill="url(#fan)" opacity=".9"/>
      {"" if small else "".join(f'<path d="{d}" fill="none" stroke="{INK_BOTTOM}" stroke-opacity=".35" stroke-width="1.2"/>' for d in HORIZONS)}
    </g>
    {median}
    <path class="hist" d="{HISTORY}" fill="none" stroke="{PAPER}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="now" cx="{NOW[0]}" cy="{NOW[1]}" r="{now_r}" fill="{PAPER}" stroke="{INK_BOTTOM}" stroke-width="2.2"/>
    {ring}
    <circle class="hit" cx="{OUTCOME[0]}" cy="{OUTCOME[1]}" r="{hit_r}" fill="{MINT}" stroke="{INK_BOTTOM}" stroke-width="2"/>
  </g>
</svg>
"""


TITLE = "Mypaisaa Prediction: a price line opens into a forecast fan, and the outcome lands inside it"

VARIANTS = {
    "mark.svg": dict(animated=False, dark=False),
    "mark-dark.svg": dict(animated=False, dark=True),
    "mark-animated.svg": dict(animated=True, dark=False),
    "mark-animated-dark.svg": dict(animated=True, dark=True),
    "mark-small.svg": dict(animated=False, dark=False, small=True),
    "mark-icon.svg": dict(animated=False, dark=False, full_bleed=True),
}


def write_svgs() -> None:
    for name, opts in VARIANTS.items():
        (OUT / name).write_text(mark(title=TITLE, **opts))
        print("wrote", name)


def write_pngs() -> None:
    from playwright.sync_api import sync_playwright

    jobs = [("mark.svg", 64), ("mark.svg", 256), ("mark.svg", 512), ("mark-icon.svg", 1024)]
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        for src, size in jobs:
            page = browser.new_page(viewport={"width": size, "height": size})
            svg = (OUT / src).read_text().replace('width="120" height="120"', f'width="{size}" height="{size}"', 1)
            page.set_content(f'<html><body style="margin:0;background:transparent">{svg}</body></html>')
            name = "mark-icon-1024.png" if src == "mark-icon.svg" else f"mark-{size}.png"
            page.screenshot(path=str(OUT / name), omit_background=True)
            page.close()
            print("wrote", name)
        browser.close()


if __name__ == "__main__":
    write_svgs()
    if "--png" in sys.argv:
        write_pngs()
