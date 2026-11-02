"""Render the documentation's motion GIFs and their static PNGs from HTML scenes.

Each scene is HTML and SVG animated with CSS. The renderer pauses every animation, seeks
it frame by frame in the local Chrome, and hands the frames to ffmpeg, so a GIF is the
same every time it is built. Run from the repo root:

    uv run --no-project --with playwright python docs/motion/build_motion.py [scene ...]

Needs Google Chrome and ffmpeg. The scenes' HTML is written to docs/motion/src/ so it can
be opened and checked in a browser. Every figure on a scene is illustrative or comes from
the planning documents named beside it; none is live data.
"""

from __future__ import annotations

import math
import random
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
SRC = OUT / "src"

# The documentation palette; the mark's colours are in docs/brand/build_brand.py.
C = dict(
    bg="#0B1329", surface="#131E40", raised="#1A2852", line="#2A3A6A", text="#EEF1F8", muted="#8F9BBA",
    paper="#F7F2E8", saffron="#F5A524", mint="#3DDC97", sky="#5EB0FF", violet="#A68BFF", rose="#FF7A90",
)

BASE_CSS = """
* { box-sizing: border-box; margin: 0; }
html, body { width: 100%; height: 100%; background: BG; overflow: hidden; }
body { font-family: -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif; color: TEXT; -webkit-font-smoothing: antialiased; }
svg text { font-family: -apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif; }
.mono { font-family: "SF Mono", Menlo, monospace; }
.scene { animation: out .5s var(--end) ease-in both; }
[style*="--at"] { animation-delay: var(--at) !important; }
.draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw var(--dur, 1s) cubic-bezier(.65,0,.35,1) both; }
.drawlin { stroke-dasharray: 1; stroke-dashoffset: 1; animation: draw var(--dur, 1s) linear both; }
.fade { animation: fade var(--dur, .5s) ease-out both; }
.rise { animation: rise var(--dur, .6s) cubic-bezier(.2,.8,.2,1) both; }
.pop { transform-box: fill-box; transform-origin: center; animation: pop var(--dur, .45s) cubic-bezier(.3,1.6,.5,1) both; }
.ring { opacity: 0; transform-box: fill-box; transform-origin: center; animation: ring 1.1s ease-out forwards; }
.grow { transform-box: fill-box; transform-origin: left center; animation: grow var(--dur, .8s) cubic-bezier(.65,0,.35,1) both; }
.growlin { transform-box: fill-box; transform-origin: left center; animation: grow var(--dur, .8s) linear both; }
.window { opacity: 0; animation: window var(--dur) linear both; }
.lit { animation: lit .35s ease-out both; }
.move { position: absolute; left: 0; top: 0; offset-anchor: center; offset-rotate: 0deg; animation: move var(--dur) cubic-bezier(.45,0,.55,1) both; }
@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes fade { from { opacity: 0; } }
@keyframes rise { from { opacity: 0; transform: translateY(14px); } }
@keyframes pop { from { transform: scale(0); } }
@keyframes ring { 0% { transform: scale(.6); opacity: .9; } 100% { transform: scale(3.2); opacity: 0; } }
@keyframes grow { from { transform: scaleX(0); } }
@keyframes window { 0% { opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { opacity: 0; } }
@keyframes lit { from { opacity: .32; } }
@keyframes move { from { offset-distance: 0%; } to { offset-distance: 100%; } }
@keyframes out { to { opacity: 0; } }
"""


def page(width: int, height: int, end: float, body: str, css: str = "") -> str:
    base = BASE_CSS.replace("BG", C["bg"]).replace("TEXT", C["text"])
    return (
        f'<!doctype html><html><head><meta charset="utf-8"><style>{base}{css}</style></head>'
        f'<body><div class="scene" style="--end:{end}s;position:relative;width:{width}px;height:{height}px">{body}</div></body></html>'
    )


def at(t: float, dur: float | None = None) -> str:
    return f'style="--at:{t}s' + (f';--dur:{dur}s"' if dur is not None else '"')


def kicker(x: int, y: int, label: str, title: str) -> str:
    return (
        f'<text x="{x}" y="{y}" class="fade" {at(0.1)} fill="{C["saffron"]}" font-size="12" font-weight="700" letter-spacing="2">{label}</text>'
        f'<text x="{x}" y="{y + 32}" class="fade" {at(0.25)} fill="{C["text"]}" font-size="26" font-weight="700" letter-spacing="-.3">{title}</text>'
    )


def walk(seed: int, n: int, start: float, end: float, vol: float) -> list[float]:
    """A random walk pinned at both ends (a Brownian bridge), deterministic for a seed."""
    rng = random.Random(seed)
    steps = [rng.gauss(0, vol) for _ in range(n)]
    path, y = [start], start
    for s in steps:
        y += s
        path.append(y)
    drift = (end - path[-1]) / n
    return [p + drift * i for i, p in enumerate(path)]


def poly(points: list[tuple[float, float]]) -> str:
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in points)


# ---------------------------------------------------------------- 1. forecast lifecycle


def forecast_lifecycle() -> tuple[str, int, int, float, float]:
    w, h, end = 960, 540, 10.6
    x0, nowx, hx = 70, 470, 830
    nowy, med_end = 300, 262
    hist = walk(7, 40, 330, nowy, 7)
    hist_pts = [(x0 + (nowx - x0) * i / 40, y) for i, y in enumerate(hist)]

    def band(k: float) -> str:
        xs = [nowx + (hx - nowx) * i / 30 for i in range(31)]
        mid = [nowy + (med_end - nowy) * i / 30 for i in range(31)]
        up = [(x, m - k * math.sqrt(i / 30)) for i, (x, m) in enumerate(zip(xs, mid))]
        lo = [(x, m + k * math.sqrt(i / 30)) for i, (x, m) in enumerate(zip(xs, mid))]
        return poly(up + lo[::-1]) + " Z"

    real = walk(11, 30, nowy, 196, 9)
    real_pts = [(nowx + (hx - nowx) * i / 30, y) for i, y in enumerate(real)]
    grid = "".join(
        f'<line x1="{x0}" x2="{hx + 50}" y1="{y}" y2="{y}" stroke="{C["line"]}" stroke-width="1"/>' for y in range(160, 400, 50)
    )
    steps = [
        ("1", "Freeze the inputs", 0.3, 2.4),
        ("2", "Forecast a distribution", 2.4, 4.1),
        ("3", "Wait for the horizon", 4.2, 7.3),
        ("4", "Score the outcome", 7.3, 8.8),
    ]
    rail = ""
    for i, (n, label, t0, t1) in enumerate(steps):
        sx = 70 + i * 215
        rail += (
            f'<g class="lit" {at(t0)}><circle cx="{sx + 12}" cy="476" r="12" fill="{C["raised"]}" stroke="{C["saffron"]}" stroke-width="1.5"/>'
            f'<text x="{sx + 12}" y="481" text-anchor="middle" fill="{C["saffron"]}" font-size="13" font-weight="700">{n}</text>'
            f'<text x="{sx + 34}" y="481" fill="{C["text"]}" font-size="15" font-weight="600">{label}</text></g>'
            f'<rect x="{sx}" y="500" width="196" height="3" rx="1.5" fill="{C["line"]}"/>'
            f'<rect x="{sx}" y="500" width="196" height="3" rx="1.5" fill="{C["saffron"]}" class="growlin" {at(t0, t1 - t0)}/>'
        )
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <defs><linearGradient id="fanG" x1="0" x2="1"><stop offset="0" stop-color="{C['saffron']}" stop-opacity=".9"/><stop offset="1" stop-color="{C['saffron']}" stop-opacity=".55"/></linearGradient></defs>
  {kicker(70, 52, "THE FORECAST LIFECYCLE", "Every forecast is frozen, then graded")}
  <g class="fade" {at(0.2)}>{grid}</g>
  <text x="{x0}" y="430" fill="{C['muted']}" font-size="12" class="fade" {at(0.4)}>Illustrative values · not a real instrument</text>
  <path d="{poly(hist_pts)}" pathLength="1" class="draw" {at(0.3, 1.8)} fill="none" stroke="{C['paper']}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  <g class="fade" {at(2.1, .4)}>
    <line x1="{nowx}" x2="{nowx}" y1="150" y2="400" stroke="{C['paper']}" stroke-opacity=".5" stroke-dasharray="4 5"/>
    <text x="{nowx - 10}" y="396" text-anchor="end" fill="{C['paper']}" font-size="13" font-weight="600">Data cutoff</text>
  </g>
  <g style="transform-origin:{nowx}px {nowy}px;animation:unfold .9s cubic-bezier(.16,1,.3,1) 2.6s both">
    <path d="{band(100)}" fill="url(#fanG)" opacity=".45"/>
    <path d="{band(50)}" fill="url(#fanG)" opacity=".85"/>
  </g>
  <path d="M{nowx} {nowy} L{hx} {med_end}" pathLength="1" class="draw" {at(3.0, .7)} stroke="{C['paper']}" stroke-opacity=".7" stroke-width="1.5" stroke-dasharray="1"/>
  <g class="fade" {at(3.3)} font-size="12" font-weight="600">
    <text x="{hx + 8}" y="{med_end - 100 + 4}" fill="{C['saffron']}">80%</text>
    <text x="{hx + 8}" y="{med_end - 50 + 4}" fill="{C['saffron']}">50%</text>
    <text x="{hx + 8}" y="{med_end + 4}" fill="{C['paper']}">median</text>
  </g>
  <circle cx="{nowx}" cy="{nowy}" r="7" fill="{C['paper']}" stroke="{C['bg']}" stroke-width="3" class="pop" {at(2.3)}/>
  <path d="{poly(real_pts)}" pathLength="1" class="drawlin" {at(4.2, 3.0)} fill="none" stroke="{C['mint']}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
  <g style="animation:sweep 3s linear 4.2s both"><line x1="{nowx}" x2="{nowx}" y1="150" y2="400" stroke="{C['mint']}" stroke-opacity=".8"/></g>
  <g class="fade" {at(4.2, .3)}>
    <rect x="{nowx}" y="408" width="{hx - nowx}" height="4" rx="2" fill="{C['line']}"/>
    <rect x="{nowx}" y="408" width="{hx - nowx}" height="4" rx="2" fill="{C['mint']}" class="growlin" {at(4.2, 3.0)}/>
    <text x="{nowx}" y="430" fill="{C['muted']}" font-size="12">Horizon: 20 trading days. Nothing is scored before it ends.</text>
  </g>
  <circle cx="{hx}" cy="196" r="8" fill="none" stroke="{C['mint']}" stroke-width="2" class="ring" {at(7.35)}/>
  <circle cx="{hx}" cy="196" r="7" fill="{C['mint']}" stroke="{C['bg']}" stroke-width="3" class="pop" {at(7.25)}/>
  <g class="rise" {at(3.6)}>
    <rect x="70" y="96" width="330" height="44" rx="10" fill="{C['surface']}" stroke="{C['line']}"/>
    <text x="86" y="114" fill="{C['muted']}" font-size="11" font-weight="600" letter-spacing="1">FORECAST · FROZEN AT CUTOFF</text>
    <text x="86" y="131" fill="{C['text']}" font-size="13">median +3.1% · 80% band −7% to +11% · model v1</text>
  </g>
  <g class="rise" {at(7.8)}>
    <rect x="520" y="96" width="370" height="44" rx="10" fill="{C['surface']}" stroke="{C['mint']}" stroke-opacity=".6"/>
    <text x="536" y="114" fill="{C['mint']}" font-size="11" font-weight="600" letter-spacing="1">SCORED · APPENDED, NEVER OVERWRITTEN</text>
    <text x="536" y="131" fill="{C['text']}" font-size="13">outcome +7.4% · inside the 80% band, outside the 50%</text>
  </g>
  {rail}
</svg>"""
    css = (
        "@keyframes unfold { from { transform: scale(.02, .1); opacity: 0; } }"
        f"@keyframes sweep {{ from {{ transform: translateX(0); }} to {{ transform: translateX({hx - nowx}px); }} }}"
    )
    return page(w, h, end, body, css), w, h, end + 0.5, 9.6


# ---------------------------------------------------------------- 2. one system, four journeys

NODES = {
    # id: (x, y, w, h, title, detail, colour)
    "pwa": (60, 190, 170, 64, "Web app", "SvelteKit PWA", "sky"),
    "ios": (60, 330, 170, 64, "iPhone and iPad", "SwiftUI + RN shell", "sky"),
    "cdn": (300, 150, 180, 64, "CloudFront + S3", "the static app", "sky"),
    "cog": (300, 250, 180, 64, "Cognito", "sign-in, step-up", "rose"),
    "apigw": (300, 350, 180, 64, "API Gateway", "HTTPS + SSE", "sky"),
    "api": (540, 250, 170, 100, "FastAPI", "on Lambda · /api/v1", "mint"),
    "flow": (770, 150, 200, 64, "Durable workflows", "Lambda Durable Functions", "saffron"),
    "sched": (770, 250, 200, 64, "Scheduler + SQS", "timed and queued work", "saffron"),
    "claude": (770, 350, 200, 64, "Claude route workers", "one Lambda per route", "violet"),
    "ml": (770, 450, 200, 64, "Forecast models", "SageMaker train · Lambda infer", "saffron"),
    "ddb": (1030, 200, 170, 64, "DynamoDB", "ledger · forecasts · audit", "mint"),
    "s3": (1030, 380, 170, 64, "Private S3", "sources · artefacts", "mint"),
    "anth": (770, 586, 200, 56, "Anthropic API", "Claude models", "violet"),
    "mkt": (1030, 586, 170, 56, "Market data", "Yahoo + Twelve Data", "saffron"),
}

JOURNEYS = [
    ("Open the app", "Sign in, read the published ledger, live updates over SSE", ["pwa", "cog", "apigw", "api", "ddb", "api", "pwa"]),
    ("Import a statement", "Kept privately, read without tools, written only after you approve", ["ios", "apigw", "api", "s3", "flow", "claude", "flow", "ddb"]),
    ("The daily forecast", "Prices in, frozen at the cutoff, models run, forecasts stored", ["sched", "mkt", "flow", "ml", "s3", "ml", "ddb"]),
    ("Ask why", "Claude explains from versioned evidence; it cannot trade or change a forecast", ["pwa", "apigw", "api", "claude", "anth", "claude", "ddb", "claude", "api", "pwa"]),
]


def centre(node: str) -> tuple[float, float]:
    x, y, w, h, *_ = NODES[node]
    return x + w / 2, y + h / 2


def system_flow() -> tuple[str, int, int, float, float]:
    w, h = 1260, 700
    span, start = 3.4, 1.0
    end = start + span * len(JOURNEYS) + 0.4
    cards = ""
    for i, (nid, (x, y, cw, ch, title, detail, col)) in enumerate(NODES.items()):
        outside = nid in ("anth", "mkt")
        dash = ' stroke-dasharray="5 4"' if outside else ""
        cards += (
            f'<g class="rise" {at(0.25 + i * 0.04)}>'
            f'<rect x="{x}" y="{y}" width="{cw}" height="{ch}" rx="12" fill="{C["surface"]}" stroke="{C["line"]}"{dash}/>'
            f'<rect x="{x}" y="{y + 14}" width="4" height="{ch - 28}" rx="2" fill="{C[col]}"/>'
            f'<text x="{x + 18}" y="{y + ch / 2 - 3}" fill="{C["text"]}" font-size="15" font-weight="650">{title}</text>'
            f'<text x="{x + 18}" y="{y + ch / 2 + 15}" fill="{C["muted"]}" font-size="12">{detail}</text></g>'
        )
    lights, paths, packets, chips = "", "", "", ""
    for j, (name, caption, hops) in enumerate(JOURNEYS):
        t0 = start + j * span
        pts = [centre(n) for n in hops]
        d = poly(pts)
        for nid in dict.fromkeys(hops):
            x, y, cw, ch, *_ = NODES[nid]
            lights += f'<rect x="{x - 3}" y="{y - 3}" width="{cw + 6}" height="{ch + 6}" rx="14" fill="none" stroke="{C["saffron"]}" stroke-width="2" class="window" {at(t0, span)}/>'
        paths += (
            f'<g class="window" {at(t0, span)}><path d="{d}" pathLength="1" class="draw" {at(t0 + 0.1, 0.6)} fill="none" '
            f'stroke="{C["saffron"]}" stroke-opacity=".55" stroke-width="2.5" stroke-linejoin="round"/></g>'
        )
        packets += (
            f'<div class="window" {at(t0 + 0.5, span - 0.6)}><div class="move" '
            f'style="offset-path:path(\'{d}\');--at:{t0 + 0.6}s;--dur:{span - 1.0}s;width:18px;height:18px;border-radius:9px;'
            f'background:{C["paper"]};box-shadow:0 0 0 4px {C["saffron"]}66, 0 0 18px {C["saffron"]}"></div></div>'
        )
        cx = 560 + j * 166
        chips += (
            f'<g><rect x="{cx}" y="38" width="158" height="30" rx="15" fill="{C["surface"]}" stroke="{C["line"]}"/>'
            f'<rect x="{cx}" y="38" width="158" height="30" rx="15" fill="{C["saffron"]}" class="window" {at(t0, span)}/>'
            f'<text x="{cx + 79}" y="58" text-anchor="middle" fill="{C["muted"]}" font-size="13" font-weight="600">{j + 1} · {name}</text>'
            f'<text x="{cx + 79}" y="58" text-anchor="middle" fill="{C["bg"]}" font-size="13" font-weight="700" class="window" {at(t0, span)}>{j + 1} · {name}</text></g>'
            f'<text x="560" y="98" fill="{C["text"]}" font-size="14" class="window" {at(t0, span)}>{caption}</text>'
        )
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "ONE SYSTEM, FOUR JOURNEYS", "How a request moves through MP")}
  <g class="fade" {at(0.2)}>
    <rect x="280" y="126" width="940" height="410" rx="18" fill="none" stroke="{C['line']}" stroke-dasharray="2 6"/>
    <text x="300" y="526" fill="{C['muted']}" font-size="12" font-weight="600" letter-spacing="1">AWS · SEPARATE DEV AND PROD ACCOUNTS · OWNER-SELECTED, NOT DEPLOYED</text>
    <text x="770" y="574" fill="{C['muted']}" font-size="12" font-weight="600" letter-spacing="1">OUTSIDE AWS</text>
  </g>
  {paths}{cards}{lights}{chips}
</svg>{packets}"""
    return page(w, h, end, body), w, h, end + 0.5, start + span * 3 + 1.6


# ---------------------------------------------------------------- 3. the learning loop

LOOP = [
    ("Record", "every forecast, frozen"),
    ("Wait", "until the horizon ends"),
    ("Score", "against the real outcome"),
    ("Propose", "a challenger model"),
    ("Shadow", "run it beside the live one"),
    ("You approve", "or it never goes live"),
]


def learning_loop() -> tuple[str, int, int, float, float]:
    w, h = 960, 600
    cx, cy, r = 480, 330, 200
    step, start = 1.05, 0.9
    end = start + step * len(LOOP) + 2.2
    circle = f"M{cx} {cy - r} A{r} {r} 0 1 1 {cx - 0.01} {cy - r}"
    nodes = ""
    for i, (title, sub) in enumerate(LOOP):
        a = -math.pi / 2 + i * 2 * math.pi / len(LOOP)
        nx, ny = cx + r * math.cos(a), cy + r * math.sin(a)
        t = start + step * i
        gate = i == len(LOOP) - 1
        col = C["mint"] if gate else C["saffron"]
        bw = 188
        nodes += (
            f'<g class="rise" {at(0.3 + i * 0.06)}><rect x="{nx - bw / 2}" y="{ny - 30}" width="{bw}" height="60" rx="14" fill="{C["surface"]}" stroke="{C["line"]}"/>'
            f'<text x="{nx}" y="{ny - 4}" text-anchor="middle" fill="{C["text"]}" font-size="16" font-weight="700">{title}</text>'
            f'<text x="{nx}" y="{ny + 16}" text-anchor="middle" fill="{C["muted"]}" font-size="12">{sub}</text></g>'
            f'<rect x="{nx - bw / 2}" y="{ny - 30}" width="{bw}" height="60" rx="14" fill="none" stroke="{col}" stroke-width="2" class="fade" {at(t, .3)}/>'
            f'<circle cx="{nx - bw / 2 + 16}" cy="{ny - 14}" r="4" fill="{col}" class="pop" {at(t)}/>'
        )
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  <circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C['line']}" stroke-width="2" class="fade" {at(0.2)}/>
  <path d="{circle}" pathLength="1" class="drawlin" {at(start, step * len(LOOP))} fill="none" stroke="{C['saffron']}" stroke-width="3" stroke-linecap="round"/>
</svg>
DOT
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(48, 50, "CONTROLLED LEARNING", "Self-learning, with a human gate")}
  {nodes}
  <g class="fade" {at(0.5)}>
    <text x="{cx}" y="{cy - 44}" text-anchor="middle" fill="{C['text']}" font-size="20" font-weight="700">No silent changes</text>
    <text x="{cx}" y="{cy - 20}" text-anchor="middle" fill="{C['muted']}" font-size="13">Live weights never change on their own.</text>
    <text x="{cx}" y="{cy - 2}" text-anchor="middle" fill="{C['muted']}" font-size="13">Old forecasts are never rewritten.</text>
  </g>
  <g class="rise" {at(start + step * len(LOOP) + 0.1)}>
    <rect x="{cx - 120}" y="{cy + 18}" width="240" height="34" rx="17" fill="{C['mint']}"/>
    <text x="{cx}" y="{cy + 40}" text-anchor="middle" fill="{C['bg']}" font-size="14" font-weight="700">Promoted, with its evidence</text>
  </g>
</svg>"""
    dot = (f'<div class="move" style="offset-path:path(\'{circle}\');--at:{start}s;--dur:{step * len(LOOP)}s;animation-timing-function:linear;'
           f'width:16px;height:16px;border-radius:8px;background:{C["paper"]};box-shadow:0 0 0 4px {C["saffron"]}66,0 0 16px {C["saffron"]}"></div>')
    body = body.replace("DOT", dot)
    return page(w, h, end, body), w, h, end + 0.5, start + step * len(LOOP) + 1.0


# ---------------------------------------------------------------- 4. the stack

STACK = [  # top to bottom
    ("Clients", "SvelteKit PWA · SwiftUI with a React Native shell", "sky", "Owner-selected"),
    ("Edge and identity", "CloudFront · S3 · API Gateway · Cognito step-up", "rose", "Owner-selected"),
    ("API", "Python 3.12 · FastAPI on Lambda · SSE", "mint", "Starter runs"),
    ("Background work", "Lambda Durable Functions · EventBridge Scheduler · SQS", "saffron", "Owner-selected"),
    ("Claude routes", "Anthropic Python SDK · one Lambda worker per route", "violet", "Owner-selected"),
    ("Forecast models", "Baselines first · SageMaker CPU training · Lambda inference", "saffron", "Owner-selected"),
    ("Records", "DynamoDB · private S3 · one controlled writer", "mint", "Owner-selected"),
    ("Quality and delivery", "pytest · Inspect AI · GitHub Actions · CloudWatch", "sky", "CI runs"),
]


def stack_build() -> tuple[str, int, int, float, float]:
    w, h = 1000, 640
    rows, n = "", len(STACK)
    for i, (layer, tech, col, status) in enumerate(STACK):
        y = 110 + i * 60
        t = 0.5 + (n - 1 - i) * 0.32
        real = status != "Owner-selected"
        chip = C["mint"] if real else C["raised"]
        chip_text = C["bg"] if real else C["muted"]
        rows += (
            f'<g class="rise" {at(t)}><rect x="60" y="{y}" width="880" height="50" rx="12" fill="{C["surface"]}" stroke="{C["line"]}"/>'
            f'<rect x="60" y="{y}" width="8" height="50" rx="4" fill="{C[col]}"/>'
            f'<text x="88" y="{y + 31}" fill="{C["text"]}" font-size="16" font-weight="700">{layer}</text>'
            f'<text x="290" y="{y + 31}" fill="{C["muted"]}" font-size="14">{tech}</text>'
            f'<rect x="{940 - 136}" y="{y + 12}" width="122" height="26" rx="13" fill="{chip}"/>'
            f'<text x="{940 - 75}" y="{y + 30}" text-anchor="middle" fill="{chip_text}" font-size="12" font-weight="700">{status}</text></g>'
        )
    t_end = 0.5 + n * 0.32 + 0.4
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "THE STACK, 2 NOVEMBER 2026", "Selected, layer by layer")}
  {rows}
  <g class="rise" {at(t_end)}>
    <text x="60" y="618" fill="{C['muted']}" font-size="13">Green: running today (the API starter and CI). Grey: chosen by the owner, not built or deployed.</text>
  </g>
</svg>"""
    end = t_end + 2.8
    return page(w, h, end, body), w, h, end + 0.5, t_end + 1.0


# ---------------------------------------------------------------- 5. the budget


def budget() -> tuple[str, int, int, float, float]:
    w, h = 960, 500
    x0, scale = 60, 7.4  # px per pound; £120 fits

    def X(pounds: float) -> float:
        return x0 + pounds * scale

    alloc = [("Data", 30, "saffron"), ("AWS", 22, "sky"), ("Claude", 10, "violet"), ("", 8, "muted")]
    segs, acc = "", 0.0
    for i, (name, gbp, col) in enumerate(alloc):
        segs += (
            f'<g class="fade" {at(0.9 + i * 0.25)}><rect x="{X(acc) + 1}" y="150" width="{gbp * scale - 2}" height="44" rx="6" fill="{C[col]}" opacity=".9"/>'
            f'<text x="{X(acc) + 8}" y="177" fill="{C["bg"]}" font-size="12.5" font-weight="700">{(name + " ") if name else ""}£{gbp}</text></g>'
        )
        acc += gbp
    marks = ""
    for i, (gbp, label, col) in enumerate([(60, "warn", "saffron"), (75, "reduce", "saffron"), (85, "pause", "rose"), (100, "ceiling", "text")]):
        marks += (
            f'<g class="fade" {at(2.2 + i * 0.2)}><line x1="{X(gbp)}" x2="{X(gbp)}" y1="{128 - 18 * (i % 2)}" y2="420" stroke="{C[col]}" stroke-opacity=".7" stroke-dasharray="3 4"/>'
            f'<text x="{X(gbp)}" y="{122 - 18 * (i % 2)}" text-anchor="middle" fill="{C[col]}" font-size="12" font-weight="700">£{gbp} {label}</text></g>'
        )
    scenarios = [
        ("Grow $79, Claude blocked: ordinary month", 94.48, "saffron"),
        ("Grow $79, Claude blocked: month the domain renews", 108.88, "rose"),
        ("Grow $55 (if offered), Claude blocked: that month", 60.88, "mint"),
    ]
    bars = ""
    for i, (label, gbp, col) in enumerate(scenarios):
        y, t = 254 + i * 58, 3.3 + i * 0.9
        bars += (
            f'<text x="{x0}" y="{y - 8}" fill="{C["muted"]}" font-size="13" class="fade" {at(t)}>{label}</text>'
            f'<rect x="{x0}" y="{y}" width="{gbp * scale}" height="22" rx="5" fill="{C[col]}" class="grow" {at(t, .8)}/>'
            f'<text x="{X(gbp) + 8}" y="{y + 16}" fill="{C[col]}" font-size="14" font-weight="700" class="fade" {at(t + .7)}>£{gbp:.2f}</text>'
        )
    end = 7.6
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "THE £100 CEILING", "All-in: dev and prod AWS, market data, Claude and evals")}
  <rect x="{X(0)}" y="150" width="{100 * scale}" height="44" rx="8" fill="{C['surface']}" stroke="{C['line']}" class="fade" {at(0.5)}/>
  <g class="fade" {at(0.6)}><rect x="{X(70) + 1}" y="150" width="{30 * scale - 2}" height="44" rx="6" fill="url(#hatch)"/>
  <text x="{X(70) + 12}" y="177" fill="{C['muted']}" font-size="13" font-weight="700">Reserve £30</text></g>
  <defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="{C['surface']}"/><line x1="0" y1="0" x2="0" y2="8" stroke="{C['line']}" stroke-width="3"/></pattern></defs>
  {segs}{marks}{bars}
  <text x="{x0}" y="210" fill="{C['muted']}" font-size="12" class="fade" {at(1.9)}>Planned operation £70 as proposed ceilings (Claude includes evals; £8 covers forecast and price uncertainty), then a £30 reserve</text>
  <g class="rise" {at(6.2)}>
    <text x="{x0}" y="470" fill="{C['text']}" font-size="15" font-weight="700">Not yet shown to fit.</text>
    <text x="{x0 + 160}" y="470" fill="{C['muted']}" font-size="13">Draft scenarios at £0.80/USD and 20% tax · costs/specification.md · nothing bought</text>
  </g>
</svg>"""
    return page(w, h, end, body), w, h, end + 0.5, 7.0


# ---------------------------------------------------------------- 6. the logo intro


def logo_intro() -> tuple[str, int, int, float, float]:
    w, h, end = 1200, 420, 6.2
    sys.path.insert(0, str(ROOT / "docs/brand"))
    from build_brand import TITLE, mark

    svg = mark(animated=True, dark=True, title=TITLE).replace('width="120" height="120"', 'width="230" height="230"', 1)
    body = f"""
<div style="position:absolute;inset:0;display:flex;align-items:center;gap:44px;padding-left:150px;
  background:radial-gradient(900px 420px at 30% 50%, #16244A 0%, {C['bg']} 70%)">
  {svg}
  <div>
    <div class="rise" style="--at:2.5s;font-size:64px;font-weight:800;letter-spacing:-1.6px;color:{C['text']}">Mypaisaa Prediction</div>
    <div class="rise" style="--at:2.9s;margin-top:10px;font-size:25px;color:{C['muted']}">Show the uncertainty. <span style="color:{C['mint']}">Score every forecast.</span></div>
  </div>
</div>"""
    return page(w, h, end, body), w, h, end + 0.5, 5.0


SCENES = {
    "forecast-lifecycle": forecast_lifecycle,
    "system-flow": system_flow,
    "learning-loop": learning_loop,
    "stack-build": stack_build,
    "budget": budget,
    "logo-intro": logo_intro,
}
FPS = 15


def render(name: str, browser) -> None:
    html, w, h, duration, still = SCENES[name]()
    SRC.mkdir(exist_ok=True)
    (SRC / f"{name}.html").write_text(html)
    out = OUT / f"{name}.gif"
    page_ = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=2)
    page_.set_content(html)
    page_.evaluate("document.fonts.ready")
    page_.evaluate("document.getAnimations().forEach(a => a.pause())")

    def seek(seconds: float) -> None:
        page_.evaluate(f"document.getAnimations().forEach(a => a.currentTime = {seconds * 1000})")

    with tempfile.TemporaryDirectory() as tmp:
        frames = int(duration * FPS)
        for i in range(frames):
            seek(i / FPS)
            page_.screenshot(path=f"{tmp}/{i:04d}.png")
        palette = "split[a][b];[a]palettegen=max_colors=200:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle"
        subprocess.run(
            ["ffmpeg", "-loglevel", "error", "-y", "-framerate", str(FPS), "-i", f"{tmp}/%04d.png",
             "-vf", f"scale={w}:-1:flags=lanczos,{palette}", "-loop", "0", str(out)],
            check=True,
        )
    seek(still)
    page_.screenshot(path=str(OUT / f"{name}.png"))
    page_.close()
    print(f"{name}: {frames} frames, {out.stat().st_size / 1e6:.2f} MB")


def main() -> None:
    from playwright.sync_api import sync_playwright

    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is needed")
    names = sys.argv[1:] or list(SCENES)
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        for name in names:
            render(name, browser)
        browser.close()


if __name__ == "__main__":
    main()
