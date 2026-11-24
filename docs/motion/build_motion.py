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

    alloc = [("Data", 30, "saffron"), ("AWS", 22, "sky"), ("Claude", 15, "violet"), ("", 3, "muted")]  # owner, 3 Nov 2026
    segs, acc = "", 0.0
    for i, (name, gbp, col) in enumerate(alloc):
        segs += (
            f'<g class="fade" {at(0.9 + i * 0.25)}><rect x="{X(acc) + 1}" y="150" width="{gbp * scale - 2}" height="44" rx="6" fill="{C[col]}" opacity=".9"/>'
            + (f'<text x="{X(acc) + 8}" y="177" fill="{C["bg"]}" font-size="12.5" font-weight="700">{(name + " ") if name else ""}£{gbp}</text>' if gbp >= 5 else "")
            + '</g>'
        )
        acc += gbp
    marks = ""
    for i, (gbp, label, col) in enumerate([(60, "warn", "saffron"), (75, "reduce", "saffron"), (85, "pause", "rose"), (100, "ceiling", "text")]):
        marks += (
            f'<g class="fade" {at(2.2 + i * 0.2)}><line x1="{X(gbp)}" x2="{X(gbp)}" y1="{128 - 18 * (i % 2)}" y2="420" stroke="{C[col]}" stroke-opacity=".7" stroke-dasharray="3 4"/>'
            f'<text x="{X(gbp)}" y="{122 - 18 * (i % 2)}" text-anchor="middle" fill="{C[col]}" font-size="12" font-weight="700">£{gbp} {label}</text></g>'
        )
    scenarios = [  # the owner's selection: Virginia, Grow 55 (costs/specification.md)
        ("An ordinary month, Claude off", 46.48, "mint"),
        ("Claude option A, with the top-5 scan at its £5 cap", 59.73, "mint"),
        ("The Apple fee month, only if the owner joins: the one allowed exception", 141.52, "rose"),
    ]
    bars = ""
    for i, (label, gbp, col) in enumerate(scenarios):
        y, t = 254 + i * 58, 3.3 + i * 0.9
        shown = min(gbp, 118)  # past £118 the bar is cut and its figure sits inside it
        value = (f'<text x="{X(shown) - 10}" y="{y + 16}" text-anchor="end" fill="{C["bg"]}" font-size="14" font-weight="700" '
                 f'class="fade" {at(t + .7)}>£{gbp:.2f} ›</text>') if gbp > shown else (
                 f'<text x="{X(gbp) + 8}" y="{y + 16}" fill="{C[col]}" font-size="14" font-weight="700" class="fade" {at(t + .7)}>£{gbp:.2f}</text>')
        bars += (
            f'<text x="{x0}" y="{y - 8}" fill="{C["muted"]}" font-size="13" class="fade" {at(t)}>{label}</text>'
            f'<rect x="{x0}" y="{y}" width="{shown * scale}" height="22" rx="5" fill="{C[col]}" class="grow" {at(t, .8)}/>'
            + value
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
  <text x="{x0}" y="210" fill="{C['muted']}" font-size="12" class="fade" {at(1.9)}>Planned operation £70 as proposed ceilings (Claude includes evals; £3 covers forecast and price uncertainty), then a £30 reserve</text>
  <g class="rise" {at(6.2)}>
    <text x="{x0}" y="470" fill="{C['text']}" font-size="15" font-weight="700">Every ordinary month fits.</text>
    <text x="{x0 + 205}" y="470" fill="{C['muted']}" font-size="13">Virginia, Grow 55, £0.80/USD and 20% tax · costs/specification.md · nothing bought</text>
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


# ---------------------------------------------------------------- shared by the planning scenes


def packet(d: str, t: float, dur: float, size: int = 12, col: str = C["paper"], glow: str = C["saffron"]) -> str:
    """A dot that travels along an SVG path, visible only while it moves."""
    return (
        f'<div class="window" style="--at:{t}s;--dur:{dur}s"><div class="move" style="offset-path:path(\'{d}\');--at:{t}s;--dur:{dur}s;'
        f'width:{size}px;height:{size}px;border-radius:{size / 2}px;background:{col};box-shadow:0 0 0 3px {glow}55,0 0 12px {glow}"></div></div>'
    )


def card3(x: float, y: float, w: float, h: float, title: str, lines: list[str], col: str, t: float, chip: str = "") -> str:
    """A card with an accent bar, a title and up to two muted lines."""
    out = (
        f'<g class="rise" {at(t)}><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{C["surface"]}" stroke="{C["line"]}"/>'
        f'<rect x="{x}" y="{y + 14}" width="4" height="{h - 28}" rx="2" fill="{C[col]}"/>'
        f'<text x="{x + 18}" y="{y + 28}" fill="{C["text"]}" font-size="15" font-weight="650">{title}</text>'
    )
    for i, line in enumerate(lines):
        out += f'<text x="{x + 18}" y="{y + 48 + i * 17}" fill="{C["muted"]}" font-size="12">{line}</text>'
    if chip:
        out += (
            f'<rect x="{x + w - 62}" y="{y + 14}" width="50" height="18" rx="9" fill="{C["violet"]}"/>'
            f'<text x="{x + w - 37}" y="{y + 27}" text-anchor="middle" fill="{C["bg"]}" font-size="10" font-weight="800" letter-spacing=".8">{chip}</text>'
        )
    return out + "</g>"


# ---------------------------------------------------------------- 7. the roadmap

ROAD_PHASES = [  # shortened from docs/planning/ma-reconciliation-2026-11-02/phase-story-baseline.json
    ("PH-00", "Baseline and contracts"),
    ("PH-01", "Portfolio and imports"),
    ("PH-02", "Identity, audit, cost"),
    ("PH-03", "Market data and risk"),
    ("PH-04", "Forecaster and learning"),
    ("PH-05", "Research, agents, chat"),
    ("PH-06", "Web, actions, briefings"),
    ("PH-07", "Native Apple and push"),
    ("PH-08", "Acceptance and launch"),
    ("PH-09", "Versioned extensions"),
]
ROAD_GATES = ["Architecture sign-off", "Full UX design", "UX approval", "Permission to build"]


def roadmap() -> tuple[str, int, int, float, float]:
    w, h = 1200, 620
    ya, yb, yc, r = 170, 330, 490, 80
    xs, xr, xl, xe = 70, 1060, 140, 940
    road = f"M{xs} {ya} L{xr} {ya} A{r} {r} 0 0 1 {xr} {yb} L{xl} {yb} A{r} {r} 0 0 0 {xl} {yc} L{xe} {yc}"
    arc = math.pi * r
    total = (xr - xs) + arc + (xr - xl) + arc + (xe - xl)
    t_road, d_road = 0.4, 3.2

    def when(x: float, row: int) -> float:
        if row == 0:
            d = x - xs
        elif row == 1:
            d = (xr - xs) + arc + (xr - x)
        else:
            d = (xr - xs) + arc + (xr - xl) + arc + (x - xl)
        return round(t_road + d_road * d / total, 2)

    stops = [(150, 0, ROAD_PHASES[0])]
    stops += [(x, 1, p) for x, p in zip([1000, 820, 640, 460, 280], ROAD_PHASES[1:6])]
    stops += [(x, 2, p) for x, p in zip([280, 460, 640, 820], ROAD_PHASES[6:])]
    ys = [ya, yb, yc]
    nodes = ""
    for x, row, (pid, title) in stops:
        y, t = ys[row], when(x, row)
        here = pid == "PH-00"
        ring_col = C["mint"] if here else C["sky"]
        nodes += (
            f'<g class="pop" {at(t)}><circle cx="{x}" cy="{y}" r="11" fill="{C["mint"] if here else C["surface"]}" stroke="{ring_col}" stroke-width="2.5"/></g>'
            f'<g class="rise" {at(t + 0.05)}><text x="{x}" y="{y + 40}" text-anchor="middle" class="mono" fill="{ring_col}" font-size="12" font-weight="700">{pid}</text>'
            f'<text x="{x}" y="{y + 58}" text-anchor="middle" fill="{C["text"]}" font-size="13" font-weight="600">{title}</text></g>'
        )
    gates = ""
    for i, (x, label) in enumerate(zip([340, 520, 700, 880], ROAD_GATES)):
        t, lit = when(x, 0), 4.0 + i * 0.6
        diamond = f'<rect x="{x - 13}" y="{ya - 13}" width="26" height="26" rx="4" transform="rotate(45 {x} {ya})"'
        gates += (
            f'<g class="pop" {at(t)}>{diamond} fill="{C["bg"]}" stroke="{C["saffron"]}" stroke-width="2.5"/>'
            f'<text x="{x}" y="{ya + 5}" text-anchor="middle" fill="{C["saffron"]}" font-size="13" font-weight="800">{i + 1}</text></g>'
            f'<g class="window" {at(lit, 1.0)}>{diamond} fill="{C["saffron"]}"/>'
            f'<text x="{x}" y="{ya + 5}" text-anchor="middle" fill="{C["bg"]}" font-size="13" font-weight="800">{i + 1}</text></g>'
            f'<circle cx="{x}" cy="{ya}" r="14" fill="none" stroke="{C["saffron"]}" stroke-width="2" class="ring" {at(lit)}/>'
            f'<g class="rise" {at(t + 0.05)}><text x="{x}" y="{ya + 40}" text-anchor="middle" fill="{C["saffron"]}" font-size="11" font-weight="700" letter-spacing="1.5">OWNER GATE {i + 1}</text>'
            f'<text x="{x}" y="{ya + 58}" text-anchor="middle" fill="{C["text"]}" font-size="13" font-weight="600">{label}</text></g>'
        )
    t_here = 4.0 + 4 * 0.6 + 0.4
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "THE ROADMAP · NO DATES", "Ten phases, and four owner gates before any build")}
  <path d="{road}" pathLength="1" class="drawlin" {at(t_road, d_road)} fill="none" stroke="{C['raised']}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="{road}" class="fade" {at(t_road + d_road, .6)} fill="none" stroke="{C['paper']}" stroke-opacity=".22" stroke-width="2" stroke-dasharray="10 12"/>
  <text x="60" y="284" class="fade" {at(1.4)} fill="{C['muted']}" font-size="11" font-weight="700" letter-spacing="1.5">BUILD PHASES · EACH ONE WAITS FOR GATE 4</text>
  {gates}{nodes}
  <circle cx="150" cy="{ya}" r="12" fill="none" stroke="{C['mint']}" stroke-width="2" class="ring" {at(t_here + 0.1)}/>
  <circle cx="150" cy="{ya}" r="12" fill="none" stroke="{C['mint']}" stroke-width="2" class="ring" {at(t_here + 1.3)}/>
  <g class="rise" {at(t_here)}>
    <rect x="35" y="104" width="230" height="30" rx="15" fill="{C['mint']}"/>
    <path d="M141 133 L150 145 L159 133 Z" fill="{C['mint']}"/>
    <text x="150" y="124" text-anchor="middle" fill="{C['bg']}" font-size="13" font-weight="700">We are here: PH-00 · planning</text>
  </g>
  <g class="rise" {at(t_here + 0.4)}>
    <text x="60" y="598" fill="{C['text']}" font-size="14" font-weight="700">Nothing is built until all four gates pass, in order.<tspan dx="14" fill="{C['muted']}" font-size="13" font-weight="400">Each gate is the owner's explicit decision. No phase has a date.</tspan></text>
  </g>
</svg>"""
    end = t_here + 3.0
    return page(w, h, end, body), w, h, end + 0.5, t_here + 2.4


# ---------------------------------------------------------------- 8. importing a statement


def import_approval() -> tuple[str, int, int, float, float]:
    w, h = 1200, 600
    steps = [  # title, detail, time the step lights
        ("Statement file", "PDF, CSV or screenshot", 0.8),
        ("Private S3", "quarantined original", 1.5),
        ("Claude extraction", "no tools · a draft only", 2.2),
        ("Proposal", "you review every row", 3.0),
        ("You approve", "exact content, 15 min", 5.2),
        ("One writer", "the controlled writer", 6.8),
        ("Ledger + audit", "appended, never edited", 7.6),
    ]
    x0, dx, y = 110, 980 / 6, 150
    rail = (
        f'<rect x="{x0}" y="{y - 2}" width="980" height="4" rx="2" fill="{C["line"]}" class="fade" {at(0.3)}/>'
    )
    for i, (title, detail, t) in enumerate(steps):
        x = x0 + i * dx
        if i < len(steps) - 1:
            rail += f'<rect x="{x}" y="{y - 2}" width="{dx}" height="4" rx="2" fill="{C["saffron"]}" class="growlin" {at(t, steps[i + 1][2] - t)}/>'
        col = C["mint"] if i >= 4 else C["saffron"]
        rail += (
            f'<g class="rise" {at(0.3 + i * 0.06)}><circle cx="{x}" cy="{y}" r="14" fill="{C["raised"]}" stroke="{C["line"]}" stroke-width="1.5"/>'
            f'<text x="{x}" y="{y + 5}" text-anchor="middle" fill="{C["muted"]}" font-size="13" font-weight="700">{i + 1}</text>'
            f'<text x="{x}" y="{y + 40}" text-anchor="middle" fill="{C["text"]}" font-size="14" font-weight="700">{title}</text>'
            f'<text x="{x}" y="{y + 58}" text-anchor="middle" fill="{C["muted"]}" font-size="12">{detail}</text></g>'
            f'<g class="fade" {at(t, .3)}><circle cx="{x}" cy="{y}" r="14" fill="{col}"/>'
            f'<text x="{x}" y="{y + 5}" text-anchor="middle" fill="{C["bg"]}" font-size="13" font-weight="800">{i + 1}</text></g>'
            f'<circle cx="{x}" cy="{y}" r="14" fill="none" stroke="{col}" stroke-width="2" class="ring" {at(t)}/>'
        )
    rows = [("Buy 12 units of Fund A", "trade"), ("Cash out £1,104.00", "cash"), ("Broker fee £1.50", "fee")]
    prop = ""
    for i, (label, kind) in enumerate(rows):
        ry = 304 + i * 36
        prop += (
            f'<g class="rise" {at(3.3 + i * 0.15)}><rect x="96" y="{ry}" width="424" height="30" rx="8" fill="{C["raised"]}"/>'
            f'<text x="112" y="{ry + 20}" fill="{C["text"]}" font-size="13">{label}</text>'
            f'<text x="504" y="{ry + 20}" text-anchor="end" fill="{C["muted"]}" font-size="12">{kind}</text></g>'
            f'<text x="440" y="{ry + 20}" text-anchor="end" fill="{C["mint"]}" font-size="12" font-weight="700" class="fade" {at(7.4 + i * 0.12)}>written ✓</text>'
        )
    t_commit = 6.8
    ledger = ""
    for i, (label, kind) in enumerate(rows):
        ly = 334 + i * 28
        ledger += (
            f'<g class="rise" {at(t_commit + 0.6 + i * 0.12)}><circle cx="866" cy="{ly - 4}" r="4" fill="{C["mint"]}"/>'
            f'<text x="880" y="{ly}" fill="{C["text"]}" font-size="13">{label}</text></g>'
        )
    dots = "".join(packet(f"M548 {316 + i * 8} L832 {314 + i * 10}", t_commit + i * 0.12, 0.8, 11, C["paper"], C["mint"]) for i in range(3))
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "IMPORTING A STATEMENT", "Nothing is written until you approve it")}
  {rail}
  <g class="fade" {at(3.1)} fill="{C['muted']}" font-size="11" font-weight="700" letter-spacing="1.5">
    <text x="60" y="268">THE PROPOSAL YOU REVIEW · #7c1e</text>
    <text x="685" y="268" text-anchor="middle">YOU APPROVE</text>
    <text x="840" y="268">WHAT IS WRITTEN</text>
  </g>
  <rect x="60" y="282" width="480" height="240" rx="14" fill="{C['surface']}" stroke="{C['line']}" class="fade" {at(3.1)}/>
  {prop}
  <path d="M86 306 L80 306 L80 404 L86 404" fill="none" stroke="{C['mint']}" stroke-width="2.5" stroke-linecap="round" class="fade" {at(4.1)}/>
  <text x="96" y="430" fill="{C['mint']}" font-size="12" font-weight="700" class="fade" {at(4.1)}>Group A, complete: the trade, its cash and its fee go together</text>
  <g class="rise" {at(4.5)}>
    <rect x="96" y="444" width="424" height="30" rx="8" fill="none" stroke="{C['saffron']}" stroke-width="1.5" stroke-dasharray="5 4"/>
    <text x="112" y="464" fill="{C['text']}" font-size="13">Transfer in · amount unreadable</text>
    <text x="504" y="464" text-anchor="end" fill="{C['saffron']}" font-size="12" font-weight="700">unresolved</text>
  </g>
  <text x="96" y="502" fill="{C['muted']}" font-size="12" class="fade" {at(4.7)}>Stays pending and visible. It is never dropped or guessed.</text>
  <rect x="96" y="444" width="424" height="30" rx="8" fill="{C['saffron']}" fill-opacity=".16" class="window" {at(t_commit + 1.2, 1.6)}/>

  <circle cx="685" cy="384" r="44" fill="none" stroke="{C['line']}" stroke-width="7" class="fade" {at(3.1)}/>
  <circle cx="685" cy="384" r="44" fill="none" stroke="{C['saffron']}" stroke-width="7" stroke-linecap="round" pathLength="1" transform="rotate(-90 685 384)" class="drawlin" {at(4.9, 0.9)}/>
  <text x="685" y="384" text-anchor="middle" fill="{C['text']}" font-size="20" font-weight="800" class="fade" {at(4.9)}>15 min</text>
  <text x="685" y="402" text-anchor="middle" fill="{C['muted']}" font-size="11" class="fade" {at(4.9)}>to start</text>
  <g class="fade" {at(5.2)}>
    <text x="685" y="452" text-anchor="middle" fill="{C['text']}" font-size="13" font-weight="600">this exact proposal</text>
    <text x="685" y="470" text-anchor="middle" fill="{C['muted']}" font-size="12">a change needs a fresh yes</text>
  </g>
  <g class="pop" {at(5.9)}>
    <rect x="625" y="484" width="120" height="26" rx="13" fill="{C['mint']}"/>
    <text x="685" y="501" text-anchor="middle" fill="{C['bg']}" font-size="12" font-weight="700">Approved</text>
  </g>
  <g class="fade" {at(t_commit)}><line x1="552" x2="826" y1="324" y2="324" stroke="{C['mint']}" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="4 5"/>
  <text x="685" y="312" text-anchor="middle" fill="{C['muted']}" font-size="12">one controlled writer</text></g>

  <rect x="840" y="282" width="300" height="130" rx="14" fill="{C['surface']}" stroke="{C['line']}" class="fade" {at(3.1)}/>
  <rect x="840" y="282" width="300" height="130" rx="14" fill="none" stroke="{C['mint']}" stroke-width="2" class="fade" {at(t_commit + 0.6, .3)}/>
  <text x="858" y="300" fill="{C['mint']}" font-size="11" font-weight="700" letter-spacing="1.5" class="fade" {at(3.1)}>LEDGER</text>
  {ledger}
  <rect x="840" y="424" width="300" height="98" rx="14" fill="{C['surface']}" stroke="{C['line']}" class="fade" {at(3.1)}/>
  <text x="858" y="444" fill="{C['violet']}" font-size="11" font-weight="700" letter-spacing="1.5" class="fade" {at(3.1)}>AUDIT</text>
  <g class="rise" {at(t_commit + 1.3)}>
    <text x="858" y="470" class="mono" fill="{C['text']}" font-size="12">proposal #7c1e · group A</text>
    <text x="858" y="490" class="mono" fill="{C['text']}" font-size="12">approved by owner · 1 writer</text>
    <text x="858" y="510" class="mono" fill="{C['saffron']}" font-size="12">1 entry still pending</text>
  </g>
  <text x="60" y="570" fill="{C['muted']}" font-size="12" class="fade" {at(t_commit + 1.8)}>Illustrative entries · POLICY-001 and POLICY-005 · planned behaviour, not built</text>
</svg>{dots}"""
    end = t_commit + 4.2
    return page(w, h, end, body), w, h, end + 0.5, t_commit + 3.2


# ---------------------------------------------------------------- 9. Claude routes, batch and live


def claude_routes() -> tuple[str, int, int, float, float]:
    w, h = 1200, 620
    cy = 212  # centre line of the batch lane's cards
    chips, dots = "", ""
    kinds = [C["sky"], C["paper"], C["violet"]]
    cells = [(c, r) for r in range(6) for c in range(3)]
    for i, (c, r) in enumerate(cells):
        x, y = 66 + c * 52, 158 + r * 18
        chips += f'<rect x="{x}" y="{y}" width="42" height="11" rx="3" fill="{kinds[(c + r) % 3]}" opacity=".75" class="pop" {at(0.7 + i * 0.04)}/>'
    for i, (c, r) in enumerate(cells[::2]):
        x, y = 66 + c * 52 + 21, 158 + r * 18 + 5
        dots += packet(f"M{x} {y} L250 {cy}", 1.8 + i * 0.07, 0.6, 9)
    for i in range(8):
        dots += packet(f"M430 {cy - 21 + i * 6} L490 {cy}", 3.0 + i * 0.06, 0.5, 9)
    for i in range(3):
        dots += packet(f"M690 {cy - 8 + i * 8} L750 {cy}", 4.0 + i * 0.15, 0.5, 11, C["paper"], C["violet"])
    for i in range(3):
        dots += packet(f"M{570 + i * 20} 254 L{560 + i * 30} 300", 3.9 + i * 0.1, 0.6, 8, C["muted"], C["muted"])
    dots += packet(f"M930 {cy} L1000 {cy}", 5.1, 0.6, 12, C["paper"], C["violet"])
    dots += packet("M1075 254 L1075 380", 6.3, 0.7, 12, C["paper"], C["mint"])
    outs = [("07:30 briefing", 370), ("Explanations", 408), ("Chat: ask why", 446)]
    for i, (_, oy) in enumerate(outs):
        dots += packet(f"M1000 422 L940 {oy + 15}", 7.2 + i * 0.12, 0.5, 10, C["paper"], C["mint"])
    out_cards = "".join(
        f'<g class="rise" {at(0.9 + i * 0.05)}><rect x="760" y="{oy}" width="180" height="30" rx="15" fill="{C["surface"]}" stroke="{C["line"]}"/>'
        f'<text x="850" y="{oy + 20}" text-anchor="middle" fill="{C["text"]}" font-size="13" font-weight="600">{label}</text></g>'
        f'<rect x="760" y="{oy}" width="180" height="30" rx="15" fill="none" stroke="{C["mint"]}" stroke-width="2" class="fade" {at(7.7 + i * 0.12, .3)}/>'
        for i, (label, oy) in enumerate(outs)
    )
    lit = "".join(
        f'<rect x="{x - 3}" y="{y - 3}" width="{cw + 6}" height="{ch + 6}" rx="14" fill="none" stroke="{C[col]}" stroke-width="2" class="fade" {at(t, .3)}/>'
        for x, y, cw, ch, col, t in [
            (250, 170, 180, 84, "saffron", 2.4), (490, 170, 200, 84, "sky", 3.5), (750, 170, 180, 84, "violet", 4.5),
            (1000, 170, 150, 84, "mint", 5.7), (1000, 380, 150, 84, "mint", 6.9),
        ]
    )
    links = "".join(
        f'<path d="{d}" pathLength="1" class="draw" {at(0.8, .6)} fill="none" stroke="{C["line"]}" stroke-width="2"/>'
        for d in [f"M430 {cy} L490 {cy}", f"M690 {cy} L750 {cy}", f"M930 {cy} L1000 {cy}", "M1075 254 L1075 380",
                  "M1000 422 L940 385", "M1000 422 L940 423", "M1000 422 L940 461"]
    )
    pills = [("Batches cost half price on every token", 40, 300, "line", "text"),
             ("Results within 24 hours", 356, 214, "line", "text"),
             ("Claude never produces a forecast number", 586, 330, "rose", "rose")]
    strip = "".join(
        f'<g class="rise" {at(8.4 + i * 0.2)}><rect x="{x}" y="530" width="{pw}" height="34" rx="17" fill="{C["surface"]}" stroke="{C[stroke]}"/>'
        f'<text x="{x + pw / 2}" y="552" text-anchor="middle" fill="{C[tc]}" font-size="13" font-weight="700">{label}</text></g>'
        for i, (label, x, pw, stroke, tc) in enumerate(pills)
    )
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "CLAUDE ROUTES · OPTION A", "Read overnight in batches, answer live")}
  <g class="fade" {at(0.3)}>
    <rect x="40" y="110" width="1130" height="200" rx="18" fill="none" stroke="{C['line']}" stroke-dasharray="2 6"/>
    <text x="64" y="138" fill="{C['violet']}" font-size="12" font-weight="700" letter-spacing="1.5">OVERNIGHT · BATCH LANE</text>
    <rect x="40" y="330" width="1130" height="172" rx="18" fill="none" stroke="{C['line']}" stroke-dasharray="2 6"/>
    <text x="64" y="358" fill="{C['mint']}" font-size="12" font-weight="700" letter-spacing="1.5">LIVE LANE · AT 07:30 AND WHEN YOU ASK</text>
  </g>
  {links}{chips}
  <text x="66" y="284" fill="{C['muted']}" font-size="12" class="fade" {at(1.4)}>News, filings, calendar · hundreds a day</text>
  {card3(250, 170, 180, 84, "Haiku 5.5", ["triage: tags every item", "cheap, reads everything"], "saffron", 0.5, "BATCH")}
  {card3(490, 170, 200, 84, "Code, not Claude", ["picks the material items", "on holdings or watchlist"], "sky", 0.6)}
  {card3(750, 170, 180, 84, "Opus 5.5", ["event analysis", "at most 3 a day"], "violet", 0.7, "BATCH")}
  {card3(1000, 170, 150, 84, "Event record", ["stored and cited", "point-in-time"], "mint", 0.8)}
  {card3(1000, 380, 150, 84, "Sonnet 5.5", ["answers live", "quotes the record"], "mint", 0.9)}
  <text x="590" y="284" text-anchor="middle" fill="{C['muted']}" font-size="12" class="fade" {at(4.1)}>the rest wait a day or are dropped, with a reason</text>
  {out_cards}{lit}
  <circle cx="1075" cy="{cy}" r="16" fill="none" stroke="{C['mint']}" stroke-width="2" class="ring" {at(5.7)}/>
  <g class="rise" {at(7.0)}>
    <text x="64" y="404" fill="{C['text']}" font-size="15" font-weight="700">The briefing never waits on a new batch.</text>
    <text x="64" y="428" fill="{C['muted']}" font-size="13">It and chat use the last stored analyses instead of redoing them.</text>
    <text x="64" y="450" fill="{C['muted']}" font-size="13">If a batch fails, the last dated evidence stays and the update is marked pending.</text>
  </g>
  {strip}
</svg>{dots}"""
    end = 11.0
    return page(w, h, end, body), w, h, end + 0.5, 10.0


# ---------------------------------------------------------------- 10. the daily window


def daily_window() -> tuple[str, int, int, float, float]:
    w, h = 1100, 420
    x0, k, ya = 100, 10.6, 185  # px per minute after the close
    t0, speed = 1.2, 15.0  # the playhead covers 15 minutes a second

    def X(m: float) -> float:
        return x0 + m * k

    def T(m: float) -> float:
        return round(t0 + m / speed, 2)

    segs = [(15, 40, "collecting", "sky"), (40, 60, "retrying", "violet"), (60, 75, "models run", "saffron")]
    bars = "".join(
        f'<rect x="{X(a)}" y="{ya - 11}" width="{(b - a) * k}" height="22" rx="5" fill="{C[col]}" class="growlin" {at(T(a), (b - a) / speed)}/>'
        f'<text x="{X(a) + 16}" y="{ya + 4}" fill="{C["bg"]}" font-size="11.5" font-weight="700" class="fade" {at(T(a) + 0.3)}>{label}</text>'
        for a, b, label, col in segs
    )
    marks = [(0, "Close", "the exchange closes", "paper"), (15, "Collect", "ordinary collection", "sky"),
             (40, "Retry", "for missing data", "violet"), (60, "Cutoff", "inputs frozen", "saffron"),
             (75, "Issued", "before the next open", "mint")]
    ticks = ""
    for m, title, sub, col in marks:
        x, t = X(m), T(m)
        strong = m in (60, 75)
        ticks += (
            f'<g class="pop" {at(t)}><circle cx="{x}" cy="{ya}" r="{8 if strong else 6}" fill="{C[col]}" stroke="{C["bg"]}" stroke-width="3"/></g>'
            f'<g class="rise" {at(t)}><text x="{x}" y="{ya - 26}" text-anchor="middle" class="mono" fill="{C[col]}" font-size="13" font-weight="700">{"+" + str(m) + " min" if m else "0"}</text>'
            f'<text x="{x}" y="{ya + 40}" text-anchor="middle" fill="{C["text"]}" font-size="14" font-weight="700">{title}</text>'
            f'<text x="{x}" y="{ya + 58}" text-anchor="middle" fill="{C["muted"]}" font-size="12">{sub}</text></g>'
        )
        if strong:
            ticks += f'<circle cx="{x}" cy="{ya}" r="9" fill="none" stroke="{C[col]}" stroke-width="2" class="ring" {at(t)}/>'
    light = ""
    for i in range(9):
        lx, t = 100 + i * 110, 1.0 + i * 0.6
        light += (
            f'<g class="pop" {at(t)}><circle cx="{lx}" cy="352" r="5" fill="{C["sky"]}" fill-opacity=".7"/></g>'
            f'<circle cx="{lx}" cy="352" r="5" fill="none" stroke="{C["sky"]}" stroke-opacity=".6" stroke-width="1.5" class="ring" {at(t)}/>'
        )
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "THE DAILY FORECAST WINDOW", "From the close to issued forecasts in 75 minutes")}
  <line x1="{X(0)}" x2="{X(86)}" y1="{ya}" y2="{ya}" stroke="{C['line']}" stroke-width="4" stroke-linecap="round" pathLength="1" class="draw" {at(0.3, .7)}/>
  {bars}
  <line x1="{X(60)}" x2="{X(60)}" y1="{ya - 18}" y2="{ya + 18}" stroke="{C['saffron']}" stroke-width="3" class="fade" {at(T(60))}/>
  <g class="window" {at(t0 - 0.1, 75 / speed + 0.7)}><g style="animation:sweep {75 / speed}s linear {t0}s both"><line x1="{X(0)}" x2="{X(0)}" y1="{ya - 16}" y2="{ya + 16}" stroke="{C['paper']}" stroke-width="2"/></g></g>
  {ticks}
  <text x="{X(0)}" y="284" fill="{C['muted']}" font-size="12" class="fade" {at(T(75) + 0.4)}>If data misses the cutoff, the forecast abstains. The cutoff never moves and nothing is backdated. A selected policy, still to be verified.</text>
  <text x="100" y="330" fill="{C['muted']}" font-size="11" font-weight="700" letter-spacing="1.5" class="fade" {at(0.8)}>A SEPARATE, LIGHTER LANE</text>
  <line x1="100" x2="1000" y1="352" y2="352" stroke="{C['line']}" stroke-width="2" stroke-dasharray="3 6" class="fade" {at(0.8)}/>
  {light}
  <text x="100" y="388" fill="{C['text']}" font-size="13" class="fade" {at(1.2)}>Quote and risk checks every 30 minutes, on their own clock. <tspan fill="{C['sky']}" font-weight="700">They never produce a formal forecast.</tspan></text>
</svg>"""
    css = f"@keyframes sweep {{ from {{ transform: translateX(0); }} to {{ transform: translateX({75 * k}px); }} }}"
    end = T(75) + 3.2
    return page(w, h, end, body, css), w, h, end + 0.5, T(75) + 2.2


# ---------------------------------------------------------------- shared by the quality and security scenes (MP-36)


def tag_w(label: str) -> float:
    return 20 + len(label) * 8.0


def tag(x: float, y: float, label: str, col: str, t: float, solid: bool = False) -> str:
    """A status chip such as PROPOSED or IMPLEMENTED, with its left edge at x."""
    w = tag_w(label)
    fill, text = (C[col], C["bg"]) if solid else ("none", C[col])
    return (
        f'<g class="fade" {at(t)}><rect x="{x}" y="{y}" width="{w}" height="22" rx="11" fill="{fill}" stroke="{C[col]}" stroke-width="1.5"/>'
        f'<text x="{x + w / 2}" y="{y + 15}" text-anchor="middle" fill="{text}" font-size="11" font-weight="800" letter-spacing="1">{label}</text></g>'
    )


def outline(x: float, y: float, w: float, h: float, col: str, t: float, rx: int = 14) -> str:
    """A coloured outline that lights a card from time t."""
    return f'<rect x="{x - 3}" y="{y - 3}" width="{w + 6}" height="{h + 6}" rx="{rx}" fill="none" stroke="{C[col]}" stroke-width="2" class="fade" {at(t, .3)}/>'


def tick(cx: float, cy: float, t: float, col: str = "mint", r: float = 9) -> str:
    return (
        f'<g class="pop" {at(t)}><circle cx="{cx}" cy="{cy}" r="{r}" fill="{C[col]}"/>'
        f'<path d="M{cx - r * .45:.1f} {cy + r * .02:.1f} L{cx - r * .1:.1f} {cy + r * .4:.1f} L{cx + r * .5:.1f} {cy - r * .38:.1f}" fill="none" '
        f'stroke="{C["bg"]}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>'
    )


def cross(cx: float, cy: float, t: float, dur: float | None = None, col: str = "rose", r: float = 9) -> str:
    """A failure mark; with dur it shows only for that long."""
    k = r * .38
    mark = (
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{C[col]}"/>'
        f'<path d="M{cx - k:.1f} {cy - k:.1f} L{cx + k:.1f} {cy + k:.1f} M{cx + k:.1f} {cy - k:.1f} L{cx - k:.1f} {cy + k:.1f}" stroke="{C["bg"]}" stroke-width="2.2" stroke-linecap="round"/>'
    )
    if dur is None:
        return f'<g class="pop" {at(t)}>{mark}</g>'
    return f'<g class="window" {at(t, dur)}>{mark}</g>'


# ---------------------------------------------------------------- 11. one request, traced


def trace_journey() -> tuple[str, int, int, float, float]:
    w, h = 1200, 640
    ny, nh, cw = 112, 70, 160
    ly = ny + nh // 2
    hops = [  # left edge, title, detail, colour, time the packet arrives
        (50, "The app", "PWA or iPhone", "sky", 0.9),
        (230, "API Gateway", "HTTPS · traceparent", "sky", 1.45),
        (410, "FastAPI", "on Lambda · /api/v1", "mint", 1.95),
        (590, "Durable workflow", "resumable steps", "saffron", 2.45),
        (770, "Claude worker", "one Lambda per route", "violet", 2.95),
        (990, "DynamoDB", "run record · ledger", "mint", 5.3),
    ]
    cards, lights, dots = "", "", ""
    for i, (x, title, detail, col, t) in enumerate(hops):
        cards += card3(x, ny, cw, nh, title, [detail], col, 0.3 + i * 0.06)
        lights += outline(x, ny, cw, nh, col, t)
    for i in range(4):
        x0, x1 = hops[i][0] + cw / 2, hops[i + 1][0] + cw / 2
        dots += packet(f"M{x0} {ly} L{x1} {ly}", 1.0 + i * 0.5, 0.45)
    dots += packet(f"M850 {ly} L1070 {ly}", 4.8, 0.55, 12, C["paper"], C["violet"])
    links = "".join(
        f'<line x1="{a}" x2="{b}" y1="{ly}" y2="{ly}" stroke="{C["line"]}" stroke-width="2"/>' for a, b in [(210, 230), (390, 410), (570, 590), (750, 770)]
    )
    links += (
        f'<line x1="930" x2="952" y1="{ly}" y2="{ly}" stroke="{C["line"]}" stroke-width="2"/>'
        f'<line x1="968" x2="990" y1="{ly}" y2="{ly}" stroke="{C["line"]}" stroke-width="2"/>'
        f'<path d="M953 {ly + 9} L959 {ly - 9} M961 {ly + 9} L967 {ly - 9}" stroke="{C["rose"]}" stroke-width="2" stroke-linecap="round" class="fade" {at(3.6)}/>'
    )
    rows = [  # label, start, end, colour, time it grows
        ("The app · send statement", 260, 470, "sky", 1.0),
        ("API Gateway", 274, 460, "sky", 1.5),
        ("FastAPI · 202 accepted", 288, 448, "mint", 2.0),
        ("SQS → durable workflow", 452, 540, "saffron", 2.5),
        ("Claude worker · extraction", 540, 728, "violet", 3.0),
        ("Anthropic API · edge only", 566, 712, "violet", 3.2),
        ("Workflow resumes · approved", 880, 1140, "saffron", 5.3),
        ("Controlled writer → DynamoDB", 930, 1110, "mint", 5.6),
    ]
    spans = ""
    for i, (label, a, b, col, t) in enumerate(rows):
        y = 246 + i * 22
        edge = i == 5
        style = f'fill="{C[col]}" fill-opacity=".3" stroke="{C[col]}" stroke-dasharray="3 3"' if edge else f'fill="{C[col]}"'
        spans += (
            f'<text x="60" y="{y + 10}" fill="{C["muted"]}" font-size="12" class="fade" {at(t - 0.1)}>{label}</text>'
            f'<rect x="{a}" y="{y}" width="{b - a}" height="12" rx="3" {style} class="grow" {at(t, .6)}/>'
        )
    mask_t = 6.8
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "ONE REQUEST, TRACED", "One trace while you wait, linked IDs where work waits")}
  {tag(1150 - tag_w("PROPOSED"), 38, "PROPOSED", "saffron", 0.3)}
  {links}{cards}{lights}
  <text x="580" y="204" text-anchor="middle" fill="{C['muted']}" font-size="11" class="fade" {at(2.4)}>via SQS</text>
  <g class="fade" {at(3.7)}>
    <text x="960" y="204" text-anchor="middle" fill="{C['saffron']}" font-size="11" font-weight="700">you approve</text>
  </g>
  <g class="fade" {at(0.8)} font-size="11" font-weight="700" letter-spacing="1.5">
    <text x="260" y="232" fill="{C['sky']}">ONE TRACE WHILE YOU WAIT</text>
    <text x="740" y="232" text-anchor="end" class="mono" fill="{C['muted']}" font-weight="400" letter-spacing="0">trace a1f3</text>
  </g>
  <g class="fade" {at(5.1)} font-size="11" font-weight="700" letter-spacing="1.5">
    <text x="880" y="232" fill="{C['saffron']}">A NEW TRACE, LINKED</text>
    <text x="1140" y="232" text-anchor="end" class="mono" fill="{C['muted']}" font-weight="400" letter-spacing="0">trace 7c2e</text>
  </g>
  <line x1="250" x2="250" y1="240" y2="416" stroke="{C['line']}" class="fade" {at(0.8)}/>
  <g class="fade" {at(3.7)}>
    <rect x="748" y="240" width="116" height="176" rx="8" fill="{C['raised']}" fill-opacity=".45" stroke="{C['line']}" stroke-dasharray="3 5"/>
    <text x="806" y="262" text-anchor="middle" fill="{C['muted']}" font-size="12">hours later</text>
    <text x="806" y="292" text-anchor="middle" fill="{C['rose']}" font-size="12" font-weight="700">the trace</text>
    <text x="806" y="308" text-anchor="middle" fill="{C['rose']}" font-size="12" font-weight="700">ends here</text>
  </g>
  <line x1="740" x2="740" y1="240" y2="416" stroke="{C['rose']}" stroke-width="2" class="fade" {at(3.6)}/>
  <circle cx="740" cy="340" r="8" fill="none" stroke="{C['rose']}" stroke-width="2" class="ring" {at(3.6)}/>
  {spans}
  <path d="M730 340 C800 340 810 384 878 384" pathLength="1" class="draw" {at(5.0, .6)} fill="none" stroke="{C['violet']}" stroke-width="2" stroke-dasharray="1"/>
  <text x="806" y="406" text-anchor="middle" fill="{C['violet']}" font-size="11" font-weight="700" class="fade" {at(5.4)}>span link</text>

  <g class="rise" {at(6.0)}>
    <rect x="60" y="436" width="520" height="144" rx="14" fill="{C['surface']}" stroke="{C['line']}"/>
    <text x="78" y="460" fill="{C['violet']}" font-size="11" font-weight="700" letter-spacing="1.5">REDACTION · ONE CLAUDE CALL, AS LOGGED</text>
    <text x="78" y="490" class="mono" fill="{C['muted']}" font-size="12">prompt</text>
    <text x="150" y="490" class="mono" fill="{C['text']}" font-size="12">"Extract each row from this statement…"</text>
  </g>
  <rect x="144" y="476" width="306" height="20" rx="5" fill="{C['rose']}" class="grow" {at(mask_t, .5)}/>
  <text x="297" y="490" text-anchor="middle" fill="{C['bg']}" font-size="12" font-weight="800" class="fade" {at(mask_t + 0.4)}>never logged</text>
  <g class="mono" font-size="12" fill="{C['text']}">
    <text x="78" y="514" class="fade" {at(mask_t + 0.6)}>route extraction · tokens 1,840 in, 412 out</text>
    <text x="78" y="536" class="fade" {at(mask_t + 0.8)}>cost $0.011 est. · 2.4 s · stop end_turn</text>
    <text x="78" y="558" class="fade" {at(mask_t + 1.0)} fill="{C['saffron']}">trace a1f3 · run r-19 · import im-7c</text>
  </g>
  <g class="rise" {at(8.2)}>
    <rect x="620" y="436" width="520" height="144" rx="14" fill="{C['surface']}" stroke="{C['line']}"/>
    <text x="638" y="460" fill="{C['mint']}" font-size="11" font-weight="700" letter-spacing="1.5">JOINED BY IDS, NOT BY ONE TRACE</text>
    <text x="638" y="488" fill="{C['text']}" font-size="13">Trace a1f3 ends when the work waits for you.</text>
    <text x="638" y="508" fill="{C['text']}" font-size="13">Trace 7c2e starts when it resumes, with a span link.</text>
    <text x="638" y="534" class="mono" fill="{C['saffron']}" font-size="12">import_id im-7c · job_id j-42 · run_id r-19</text>
    <text x="638" y="560" fill="{C['muted']}" font-size="12">A Message Batch joins the same way: by batch id and custom_id.</text>
  </g>
  <text x="60" y="616" fill="{C['muted']}" font-size="12" class="fade" {at(8.8)}>Illustrative IDs, tokens and timings · proposed on the observability page (PL-12, CT-06) · nothing is instrumented or deployed</text>
</svg>{dots}"""
    end = 11.4
    return page(w, h, end, body), w, h, end + 0.5, 10.4


# ---------------------------------------------------------------- 12. from a pull request to prod

CHECKS = ["Backend", "Docs", "Review tooling", "Agent config", "Plan sync", "Confluence receipts", "Static preview", "Workflow lint", "Jira traceability", "CodeQL"]


def delivery_pipeline() -> tuple[str, int, int, float, float]:
    w, h = 1200, 620
    checks = ""
    for i, name in enumerate(CHECKS):
        y, t = 194 + i * 31, 0.6 + i * 0.14  # ten rows fit inside the box (MP-199)
        checks += (
            f'<g class="rise" {at(0.3 + i * 0.04)}><circle cx="80" cy="{y}" r="9" fill="none" stroke="{C["line"]}" stroke-width="2"/>'
            f'<text x="100" y="{y + 5}" fill="{C["text"]}" font-size="14" font-weight="600">{name}</text></g>'
            + tick(80, y, t)
        )
    xs, cw, ch = [380, 575, 770, 965], 170, 80
    stages = [  # row, column, title, lines, colour, time lit, pass mark
        (0, 0, "Scan gate", ["dependencies, secrets", "and IaC · free tools"], "saffron", 2.4, "tick"),
        (0, 1, "Build once", ["one artefact on main", "sha256 and an SBOM"], "sky", 3.0, "tick"),
        (0, 2, "Deploy to dev", ["GitHub OIDC", "no stored AWS keys"], "sky", 3.6, "tick"),
        (0, 3, "Dev smoke", ["synthetic profile", "health, sign-in, SSE"], "mint", 4.2, "tick"),
        # MP203-08 (owner, 24 Nov 2026): "An environment replaces route A"; a merge to main starts the release, which waits
        # in the GitHub production environment for the owner's approval
        (1, 0, "Owner approves", ["in the production", "environment, on GitHub"], "saffron", 5.3, "tick"),
        (1, 1, "Deploy to prod", ["from CI on main only", "separate prod role"], "sky", 6.1, "tick"),
        (1, 2, "Prod smoke", ["read-only checks", "no writes or paid calls"], "rose", 6.7, "cross"),
        (1, 3, "Roll back", ["the live alias moves", "to the previous version"], "rose", 7.5, ""),
    ]
    cards = ""
    for i, (row, c, title, lines, col, t, mark) in enumerate(stages):
        x, y = xs[c], 150 + row * 150
        cards += card3(x, y, cw, ch, title, lines, col, 0.4 + i * 0.05) + outline(x, y, cw, ch, "rose" if mark == "cross" else col, t)
        if mark == "tick":
            cards += tick(x + 152, y + 24, t + 0.1, r=8)
        elif mark == "cross":
            cards += cross(x + 152, y + 24, t + 0.1, r=8)
            cards += f'<circle cx="{x + 152}" cy="{y + 24}" r="8" fill="none" stroke="{C["rose"]}" stroke-width="2" class="ring" {at(t + 0.1)}/>'
    links = "".join(
        f'<line x1="{a}" x2="{b}" y1="{y}" y2="{y}" stroke="{C["line"]}" stroke-width="2"/>'
        for y in (190, 340) for a, b in [(550, 575), (745, 770), (940, 965)]
    )
    links += (
        f'<line x1="330" x2="380" y1="190" y2="190" stroke="{C["line"]}" stroke-width="2"/>'
        f'<path d="M1050 230 L1050 265 L465 265 L465 300" fill="none" stroke="{C["line"]}" stroke-width="2"/>'
    )
    dots = packet("M300 190 L465 190", 2.0, 0.4)
    for i, (a, b) in enumerate([(465, 660), (660, 855), (855, 1050)]):
        dots += packet(f"M{a} 190 L{b} 190", 2.6 + i * 0.6, 0.4)
    dots += packet("M1050 190 L1050 265 L465 265 L465 340", 4.4, 0.9)
    dots += packet("M465 340 L660 340", 5.7, 0.4)
    dots += packet("M660 340 L855 340", 6.3, 0.4)
    dots += packet("M855 340 L1050 340", 7.1, 0.4, 12, C["paper"], C["rose"])
    move = 7.7
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "FROM A PULL REQUEST TO PROD", "Ten checks today, then a proposed road to prod")}
  <g class="rise" {at(0.2)}>
    <rect x="50" y="110" width="280" height="390" rx="14" fill="{C['surface']}" stroke="{C['line']}"/>
    <text x="68" y="136" fill="{C['muted']}" font-size="11" font-weight="700" letter-spacing="1.5">ON EVERY PR, TODAY</text>
  </g>
  {tag(68, 148, "IMPLEMENTED", "mint", 0.3, solid=True)}
  {checks}
  <rect x="47" y="107" width="286" height="396" rx="16" fill="none" stroke="{C['mint']}" stroke-width="2" class="fade" {at(1.9, .3)}/>
  {tag(380, 112, "PROPOSED · NOT BUILT", "saffron", 0.4)}
  {links}{cards}
  <g class="rise" {at(0.8)}>
    <rect x="380" y="420" width="770" height="120" rx="14" fill="none" stroke="{C['line']}" stroke-dasharray="2 6"/>
    <text x="400" y="446" fill="{C['muted']}" font-size="11" font-weight="700" letter-spacing="1.5">LAMBDA ALIAS</text>
    <rect x="560" y="430" width="150" height="34" rx="10" fill="{C['raised']}" stroke="{C['line']}"/>
    <text x="635" y="452" text-anchor="middle" class="mono" fill="{C['text']}" font-size="12">v41 · previous</text>
    <rect x="740" y="430" width="150" height="34" rx="10" fill="{C['raised']}" stroke="{C['line']}"/>
    <text x="815" y="452" text-anchor="middle" class="mono" fill="{C['text']}" font-size="12">v42 · this release</text>
  </g>
  <g class="rise" {at(0.9)}><g style="animation:alias .7s cubic-bezier(.65,0,.35,1) {move}s both">
    <path d="M805 480 L815 470 L825 480 Z" fill="{C['mint']}"/>
    <rect x="780" y="480" width="70" height="24" rx="12" fill="{C['mint']}"/>
    <text x="815" y="497" text-anchor="middle" fill="{C['bg']}" font-size="12" font-weight="800">live</text>
  </g></g>
  <rect x="557" y="427" width="156" height="40" rx="12" fill="none" stroke="{C['mint']}" stroke-width="2" class="fade" {at(move + 0.6, .3)}/>
  <g class="rise" {at(move + 0.7)}>
    <text x="930" y="448" fill="{C['text']}" font-size="14" font-weight="700">Code rolls back;</text>
    <text x="930" y="468" fill="{C['text']}" font-size="14" font-weight="700">data does not.</text>
    <text x="930" y="492" fill="{C['muted']}" font-size="12">Schema changes go in two steps.</text>
  </g>
  <text x="50" y="590" fill="{C['muted']}" font-size="12" class="fade" {at(move + 1.0)}>Check names from .github/main-protection.json · release: a merge to main waits for the owner's approval in the production environment · Terraform only · both owner-selected · nothing is deployed</text>
</svg>{dots}"""
    css = "@keyframes alias { to { transform: translateX(-180px); } }"
    end = 11.0
    return page(w, h, end, body, css), w, h, end + 0.5, 10.0


# ---------------------------------------------------------------- 13. the device matrix


def device_screen(x: float, y: float, w: float, h: float) -> str:
    """A schematic portrait screen: a freshness chip, a figure, rows and an Approve button."""
    return (
        f'<rect x="{x + 16}" y="{y + 30}" width="{w * .4:.0f}" height="7" rx="3.5" fill="{C["muted"]}" fill-opacity=".5"/>'
        f'<rect x="{x + 16}" y="{y + 48}" width="88" height="17" rx="8.5" fill="none" stroke="{C["sky"]}" stroke-width="1.5"/>'
        f'<text x="{x + 25}" y="{y + 60}" fill="{C["sky"]}" font-size="9.5" font-weight="700">as of 21:15</text>'
        f'<text x="{x + 16}" y="{y + 98}" fill="{C["paper"]}" font-size="22" font-weight="800">+3.1%</text>'
        + "".join(f'<rect x="{x + 16}" y="{y + 116 + i * 14}" width="{(w - 32) * (1 - i * .18):.0f}" height="6" rx="3" fill="{C["line"]}"/>' for i in range(3))
        + f'<rect x="{x + 16}" y="{y + h - 46}" width="{w - 32}" height="26" rx="13" fill="{C["mint"]}"/>'
        f'<text x="{x + w / 2}" y="{y + h - 29}" text-anchor="middle" fill="{C["bg"]}" font-size="11.5" font-weight="800">Approve</text>'
    )


FLOW = ["- launchApp", "- assertVisible:", "    id: mpp.forecast.freshness", "- tapOn:", "    id: mpp.import.approve", '- assertVisible: "Approved"']


def device_matrix() -> tuple[str, int, int, float, float]:
    w, h = 1200, 620
    runs = [  # time the run starts, label
        (0.9, "RUN 1 · iPhone, portrait"),
        (2.9, "RUN 2 · iPad, portrait"),
        (5.4, "RUN 3 · iPad, landscape"),
    ]
    step = 0.27
    flow = "".join(
        f'<text x="70" y="{176 + i * 24}" class="mono fade" {at(0.4 + i * 0.05)} fill="{C["text"] if line.startswith("-") else C["saffron"]}" font-size="12">'
        f'{line.replace(" ", "&#160;")}</text>'
        for i, line in enumerate(FLOW)
    )
    marks, labels = "", ""
    for t0, label in runs:
        marks += "".join(
            f'<rect x="62" y="{161 + i * 24}" width="258" height="21" rx="5" fill="{C["saffron"]}" fill-opacity=".2" class="window" {at(t0 + i * step, step + 0.05)}/>'
            for i in range(len(FLOW))
        )
        labels += f'<text x="70" y="408" fill="{C["saffron"]}" font-size="11" font-weight="700" letter-spacing="1.5" class="window" {at(t0, len(FLOW) * step + 0.3)}>{label}</text>'
    # device frames
    px, py, pw, ph = 370, 150, 130, 250
    ix, iy, iw, ih = 550, 130, 210, 280
    cxi, cyi = ix + iw / 2, iy + ih / 2
    lx, ly, lw, lh = cxi - ih / 2, cyi - iw / 2, ih, iw  # the iPad turned to landscape
    turn = 4.6
    rings = ""
    for (t0, _), (sx, sy, bx, by, bw) in zip(runs, [
        (px + 60, py + 56, px + pw / 2, py + ph - 33, pw - 32),
        (ix + 60, iy + 56, ix + iw / 2, iy + ih - 33, iw - 32),
        (lx + 165, ly + 50, lx + 205, ly + lh - 33, 110),
    ]):
        rings += (
            f'<rect x="{sx - 48}" y="{sy - 12}" width="96" height="25" rx="12" fill="none" stroke="{C["saffron"]}" stroke-width="2" class="window" {at(t0 + 2 * step, 2 * step)}/>'
            f'<circle cx="{bx}" cy="{by}" r="10" fill="none" stroke="{C["paper"]}" stroke-width="2" class="ring" {at(t0 + 4 * step)}/>'
        )
    landscape = (
        f'<rect x="{lx + 18}" y="{ly + 26}" width="110" height="7" rx="3.5" fill="{C["muted"]}" fill-opacity=".5"/>'
        + "".join(f'<rect x="{lx + 18}" y="{ly + 48 + i * 22}" width="{110 - i * 14}" height="12" rx="4" fill="{C["line"]}"/>' for i in range(5))
        + f'<line x1="{lx + 142}" x2="{lx + 142}" y1="{ly + 20}" y2="{ly + lh - 20}" stroke="{C["line"]}"/>'
        f'<rect x="{lx + 156}" y="{ly + 42}" width="88" height="17" rx="8.5" fill="none" stroke="{C["sky"]}" stroke-width="1.5"/>'
        f'<text x="{lx + 165}" y="{ly + 54}" fill="{C["sky"]}" font-size="9.5" font-weight="700">as of 21:15</text>'
        f'<text x="{lx + 156}" y="{ly + 92}" fill="{C["paper"]}" font-size="22" font-weight="800">+3.1%</text>'
        f'<rect x="{lx + 156}" y="{ly + 108}" width="100" height="6" rx="3" fill="{C["line"]}"/>'
        f'<rect x="{lx + 150}" y="{ly + lh - 46}" width="110" height="26" rx="13" fill="{C["mint"]}"/>'
        f'<text x="{lx + 205}" y="{ly + lh - 29}" text-anchor="middle" fill="{C["bg"]}" font-size="11.5" font-weight="800">Approve</text>'
    )
    checks = [("VoiceOver labels on every control", 2.3), ("Dynamic Type at the largest size", 4.3),
              ("One shared ID scheme: mpp.", 6.0), ("Rotation keeps half-typed input", 7.0)]
    check_rows = "".join(
        f'<g class="rise" {at(0.5 + i * 0.05)}><circle cx="866" cy="{172 + i * 38}" r="9" fill="none" stroke="{C["line"]}" stroke-width="2"/>'
        f'<text x="886" y="{177 + i * 38}" fill="{C["text"]}" font-size="14">{label}</text></g>' + tick(866, 172 + i * 38, t)
        for i, (label, t) in enumerate(checks)
    )
    beta = 7.9
    dots = packet(f"M{cxi} {ly + lh} Q{cxi + 60} 440 838 410", 7.3, 0.6)
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "iOS AND iPadOS TESTING", "One Maestro flow, every width, then a free local build")}
  {tag(1150 - tag_w("PROPOSED"), 38, "PROPOSED", "saffron", 0.3)}
  <g class="rise" {at(0.2)}>
    <rect x="50" y="110" width="280" height="360" rx="14" fill="{C['surface']}" stroke="{C['line']}"/>
    <text x="68" y="138" fill="{C['saffron']}" font-size="11" font-weight="700" letter-spacing="1.5">MAESTRO FLOW</text>
    <text x="68" y="342" fill="{C['muted']}" font-size="12">Journeys on simulators, on the owner's Mac</text>
    <text x="68" y="360" fill="{C['muted']}" font-size="12">Maestro CLI, free and open source</text>
  </g>
  {marks}{flow}{labels}

  <g class="rise" {at(0.4)}>
    <rect x="{px}" y="{py}" width="{pw}" height="{ph}" rx="22" fill="{C['raised']}" stroke="{C['line']}" stroke-width="2"/>
    <rect x="{px + 7}" y="{py + 7}" width="{pw - 14}" height="{ph - 14}" rx="16" fill="{C['bg']}"/>
    {device_screen(px, py, pw, ph)}
  </g>
  <rect x="{px - 4}" y="{py - 4}" width="{pw + 8}" height="{ph + 8}" rx="25" fill="none" stroke="{C['saffron']}" stroke-width="2" class="window" {at(runs[0][0], len(FLOW) * step + 0.3)}/>
  <text x="{px + pw / 2}" y="432" text-anchor="middle" fill="{C['text']}" font-size="13" font-weight="600" class="fade" {at(0.5)}>iPhone · portrait</text>

  <g class="rise" {at(0.5)}><g style="transform-box:fill-box;transform-origin:center;animation:turn .8s cubic-bezier(.65,0,.35,1) {turn}s both">
    <rect x="{ix}" y="{iy}" width="{iw}" height="{ih}" rx="20" fill="{C['raised']}" stroke="{C['line']}" stroke-width="2"/>
    <rect x="{ix + 8}" y="{iy + 8}" width="{iw - 16}" height="{ih - 16}" rx="14" fill="{C['bg']}"/>
    <g class="window" {at(0.3, turn - 0.1)}>{device_screen(ix, iy, iw, ih)}</g>
  </g></g>
  <g class="fade" {at(turn + 0.8)}>{landscape}</g>
  <rect x="{ix - 4}" y="{iy - 4}" width="{iw + 8}" height="{ih + 8}" rx="23" fill="none" stroke="{C['saffron']}" stroke-width="2" class="window" {at(runs[1][0], len(FLOW) * step + 0.3)}/>
  <rect x="{lx - 4}" y="{ly - 4}" width="{lw + 8}" height="{lh + 8}" rx="23" fill="none" stroke="{C['saffron']}" stroke-width="2" class="window" {at(runs[2][0], len(FLOW) * step + 0.3)}/>
  {rings}
  <text x="{cxi}" y="432" text-anchor="middle" fill="{C['text']}" font-size="13" font-weight="600" class="window" {at(0.5, turn)}>iPad · portrait</text>
  <text x="{cxi}" y="432" text-anchor="middle" fill="{C['text']}" font-size="13" font-weight="600" class="fade" {at(turn + 0.8)}>iPad · turned to landscape</text>

  <g class="rise" {at(0.3)}>
    <rect x="840" y="110" width="310" height="222" rx="14" fill="{C['surface']}" stroke="{C['line']}"/>
    <text x="858" y="138" fill="{C['mint']}" font-size="11" font-weight="700" letter-spacing="1.5">EVERY RUN CHECKS</text>
    <text x="858" y="318" fill="{C['muted']}" font-size="12">A real VoiceOver pass is by hand, on a device</text>
  </g>
  {check_rows}
  <g class="rise" {at(0.4)}>
    <rect x="840" y="350" width="310" height="120" rx="14" fill="{C['surface']}" stroke="{C['line']}"/>
    <rect x="840" y="364" width="4" height="92" rx="2" fill="{C['violet']}"/>
    <text x="858" y="378" fill="{C['text']}" font-size="15" font-weight="650">Free local builds, for now</text>
    <text x="858" y="398" fill="{C['muted']}" font-size="12">From Xcode to the owner's iPhone and iPad</text>
    <text x="858" y="415" fill="{C['muted']}" font-size="12">Each expires after 7 days; no Apple push</text>
    <text x="858" y="432" fill="{C['muted']}" font-size="12">TestFlight later, only if the owner joins</text>
  </g>
  {tag(858, 440, "OWNER-SELECTED · £0", "mint", 0.5)}
  {outline(840, 350, 310, 120, "violet", beta)}
  {tick(1126, 374, beta + 0.2, "violet", 8)}
  <g class="rise" {at(8.4)}>
    <rect x="50" y="500" width="600" height="34" rx="17" fill="{C['surface']}" stroke="{C['rose']}"/>
    <text x="350" y="522" text-anchor="middle" fill="{C['rose']}" font-size="13" font-weight="700">Which iPhones, iPads and iOS versions: an open question (PL-14)</text>
  </g>
  <g class="rise" {at(8.6)}>
    <rect x="670" y="500" width="480" height="34" rx="17" fill="{C['surface']}" stroke="{C['mint']}"/>
    <text x="910" y="522" text-anchor="middle" fill="{C['mint']}" font-size="13" font-weight="700">Apple-app PRs: build and XCTest on a free macOS runner</text>
  </g>
  <text x="50" y="590" fill="{C['muted']}" font-size="12" class="fade" {at(8.8)}>CI build and XCTest owner-selected 24 Nov 2026 · Maestro journeys and real-device builds stay on the owner's Mac · TestFlight needs the paid Developer Program · no Apple app yet</text>
</svg>{dots}"""
    css = "@keyframes turn { to { transform: rotate(90deg); } }"
    end = 11.0
    return page(w, h, end, body, css), w, h, end + 0.5, 10.2


# ---------------------------------------------------------------- 14. the data perimeter and its cost


def perimeter_layers() -> tuple[str, int, int, float, float]:
    w, h = 1200, 630
    cx, cy = 340, 356
    layers = [  # inside out: label, colour; the last is the optional lockdown
        ("Encryption, a key per account", "violet"),
        ("S3 Block Public Access", "sky"),
        ("Resource policies, exact roles", "sky"),
        ("Least-privilege IAM, a role per Lambda", "mint"),
        ("CloudTrail in each account", "saffron"),
        ("Two accounts in Organizations, cost-guard SCP · selected", "mint"),
        ("Optional VPC lockdown · off by default", "rose"),
    ]
    rings = ""
    for k in range(len(layers), 0, -1):
        label, col = layers[k - 1]
        hw, hh = 80 + 30 * k, 32 + 28 * k
        lockdown = k == len(layers)
        t = 4.0 if lockdown else 0.9 + (k - 1) * 0.45
        fill = "none" if lockdown else (C["surface"] if k % 2 else C["bg"])
        dash = ' stroke-dasharray="6 5"' if lockdown else ""
        rings += (
            f'<g class="rise" {at(t)}><rect x="{cx - hw}" y="{cy - hh}" width="{2 * hw}" height="{2 * hh}" rx="{16 + 2 * k}" fill="{fill}" '
            f'stroke="{C[col]}" stroke-opacity=".8" stroke-width="{2 if lockdown else 1.5}"{dash}/>'
            f'<text x="{cx}" y="{cy - hh + 19}" text-anchor="middle" fill="{C[col]}" font-size="12" font-weight="700">{label}</text></g>'
        )
    x0, s = 680, 3.6  # px per pound; £130 fits

    def X(gbp: float) -> float:
        return x0 + gbp * s

    base = 18.64
    bars_in = [  # label, extra on the baseline, colour, time
        ("Baseline perimeter, no VPC", 0.0, "mint", 0.9),
        ("L1 private jobs only", 0.0, "mint", 4.4),
        ("L2 lean lockdown, NAT instance", 21.19, "saffron", 5.0),
        ("L3 managed NAT Gateway", 105.38, "rose", 5.8),
        ("L4 strict, plus endpoints", 189.53, "rose", 6.6),
    ]
    # the limit lines cross the bars only, never the row labels
    markers = "".join(
        f'<line x1="{X(gbp):.1f}" x2="{X(gbp):.1f}" y1="{y1}" y2="{y2}" stroke="{C[lc]}" stroke-width="1.5" stroke-dasharray="3 4"/>'
        for gbp, lc in ((22, "sky"), (100, "paper"))
        for y1, y2 in [(158, 172)] + [(196 + i * 58 - 4, 196 + i * 58 + 24) for i in range(len(bars_in))]
    )
    bars = ""
    for i, (label, extra, col, t) in enumerate(bars_in):
        y = 196 + i * 58
        total = base + extra
        value = f"£{base:.2f} of £22" if i == 0 else f"+£{extra:.2f} · £{total:.2f}"
        bars += (
            f'<text x="{x0}" y="{y - 9}" fill="{C["text"] if i == 0 else C["muted"]}" font-size="13" class="fade" {at(t)}>{label}</text>'
            f'<text x="1150" y="{y - 9}" text-anchor="end" fill="{C[col]}" font-size="13" font-weight="700" class="fade" {at(t + (2.4 if i == 0 else 0.7))}>{value}</text>'
        )
        if i == 0:
            bars += f'<rect x="{x0}" y="{y}" width="{base * s:.1f}" height="20" rx="5" fill="{C["mint"]}" class="growlin" {at(t, 2.6)}/>'
            continue
        bars += f'<rect x="{x0}" y="{y}" width="{base * s:.1f}" height="20" rx="5" fill="{C["mint"]}" fill-opacity=".45" class="fade" {at(t)}/>'
        if extra:
            shown = min(extra, 130 - base)
            bars += f'<rect x="{X(base):.1f}" y="{y}" width="{shown * s:.1f}" height="20" rx="5" fill="{C[col]}" class="grow" {at(t + 0.1, .8)}/>'
            if extra > shown:
                bars += f'<path d="M1150 {y - 3} L1164 {y + 10} L1150 {y + 23} Z" fill="{C[col]}" class="fade" {at(t + 0.9)}/>'
            for limit, lc in ((22, "sky"), (100, "rose")):
                if total > limit:
                    when = t + 0.1 + 0.8 * min(1.0, (limit - base) / shown)
                    bars += f'<circle cx="{X(limit):.1f}" cy="{y + 10}" r="8" fill="none" stroke="{C[lc]}" stroke-width="2" class="ring" {at(round(when, 2))}/>'
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "THE DATA PERIMETER", "Who may act on what, before any network wall")}
  {tag(1150 - tag_w("N0 OWNER-SELECTED · LOCKDOWN OPEN"), 38, "N0 OWNER-SELECTED · LOCKDOWN OPEN", "mint", 0.3)}
  {rings}
  <g class="pop" {at(0.5)}>
    <rect x="{cx - 80}" y="{cy - 32}" width="160" height="64" rx="12" fill="{C['raised']}" stroke="{C['paper']}" stroke-opacity=".6"/>
    <text x="{cx}" y="{cy - 3}" text-anchor="middle" fill="{C['text']}" font-size="14" font-weight="700">Ledger, evidence</text>
    <text x="{cx}" y="{cy + 15}" text-anchor="middle" fill="{C['text']}" font-size="14" font-weight="700">and secrets</text>
  </g>
  <text x="{x0}" y="128" fill="{C['muted']}" font-size="11" font-weight="700" letter-spacing="1.5" class="fade" {at(0.6)}>AWS A MONTH, DEV AND PROD ACCOUNTS</text>
  {bars}
  <g class="fade" {at(0.8)}>
    {markers}
    <text x="{X(22):.1f}" y="152" text-anchor="middle" fill="{C['sky']}" font-size="12" font-weight="700">£22 AWS share</text>
    <text x="{X(100):.1f}" y="152" text-anchor="middle" fill="{C['paper']}" font-size="12" font-weight="700">£100 ceiling, all-in</text>
  </g>
  <g class="rise" {at(7.6)}>
    <text x="{x0}" y="486" fill="{C['text']}" font-size="14" font-weight="700">The perimeter itself costs about £0;</text>
    <text x="{x0}" y="506" fill="{C['muted']}" font-size="13">its KMS keys are already in the cost model.</text>
    <text x="{x0}" y="534" fill="{C['text']}" font-size="14" font-weight="700">The baseline leaves £3.36 of the £22 AWS share.</text>
    <text x="{x0}" y="554" fill="{C['muted']}" font-size="13">Every paid step overruns it. L3 and L4 alone pass £100.</text>
    <text x="{x0}" y="582" fill="{C['muted']}" font-size="13">The cost-guard SCP denies NAT and endpoints until an ADR lifts it.</text>
  </g>
  <text x="60" y="616" fill="{C['muted']}" font-size="12" class="fade" {at(8.2)}>N0 owner-selected 3 Nov 2026, nothing deployed · Virginia prices checked 2 Nov 2026 · dev 1 zone, prod 2 zones · £0.80 to the dollar and 20% tax</text>
</svg>"""
    end = 10.8
    return page(w, h, end, body), w, h, end + 0.5, 9.8


# ---------------------------------------------------------------- 15. the web quality checks


def a11y_pipeline() -> tuple[str, int, int, float, float]:
    w, h = 1200, 630
    fix = 4.9
    stages = [  # title, lines, colour, time lit
        ("Playwright", ["Chromium and WebKit, a phone and a laptop width", "against a local stub API with synthetic data"], "sky", 0.8),
        ("ARIA snapshot", ["compared with the stored .aria.yml", "a changed line fails until it is reviewed"], "violet", 2.0),
        ("axe-core · WCAG 2.2 AA", ["the WCAG 2.0, 2.1 and 2.2 A and AA tags", "any violation fails the test"], "saffron", 3.6),
        ("Screenshot diff", ["toHaveScreenshot in one pinned Linux image", "baselines kept in the repo"], "mint", 5.8),
    ]
    cards = ""
    for i, (title, lines, col, t) in enumerate(stages):
        y = 110 + i * 98
        cards += card3(480, y, 670, 88, title, lines, col, 0.3 + i * 0.06) + outline(480, y, 670, 88, col, t)
    snap = ['- heading "Forecasts" [level=1]', '- status: "Stale · as of 21:15"', None, '- text: "Twelve Data · delayed"']
    aria = "".join(
        f'<text x="830" y="{230 + i * 17}" class="mono fade" {at(2.1 + i * 0.1)} fill="{C["text"]}" font-size="11">{line}</text>'
        for i, line in enumerate(snap) if line
    )
    aria += (
        f'<rect x="822" y="{230 + 2 * 17 - 12}" width="300" height="16" rx="4" fill="{C["rose"]}" fill-opacity=".22" class="window" {at(2.8, fix + 0.3 - 2.8)}/>'
        f'<rect x="822" y="{230 + 2 * 17 - 12}" width="300" height="16" rx="4" fill="{C["mint"]}" fill-opacity=".18" class="fade" {at(fix + 0.3)}/>'
        f'<text x="830" y="{230 + 2 * 17}" class="mono window" {at(2.3, 0.5)} fill="{C["text"]}" font-size="11">- button "Approve"</text>'
        f'<text x="830" y="{230 + 2 * 17}" class="mono window" {at(2.8, fix + 0.3 - 2.8)} fill="{C["rose"]}" font-size="11">- button&#160;&#160;&#160;&#160;← its name is gone</text>'
        f'<text x="830" y="{230 + 2 * 17}" class="mono fade" {at(fix + 0.3)} fill="{C["mint"]}" font-size="11">- button "Approve"&#160;&#160;matches</text>'
    )
    axe = (
        f'<g class="window" {at(3.9, fix + 0.3 - 3.9)}><rect x="830" y="338" width="262" height="30" rx="15" fill="none" stroke="{C["rose"]}" stroke-width="1.5"/>'
        f'<text x="961" y="358" text-anchor="middle" fill="{C["rose"]}" font-size="12.5" font-weight="700">1 violation · button-name</text></g>'
        f'<g class="fade" {at(fix + 0.3)}><rect x="830" y="338" width="262" height="30" rx="15" fill="{C["mint"]}"/>'
        f'<text x="961" y="358" text-anchor="middle" fill="{C["bg"]}" font-size="12.5" font-weight="700">0 violations</text></g>'
    )

    def thumb(x: float, label: str) -> str:
        return (
            f'<rect x="{x}" y="418" width="120" height="62" rx="6" fill="{C["bg"]}" stroke="{C["line"]}"/>'
            f'<rect x="{x + 10}" y="428" width="44" height="6" rx="3" fill="{C["muted"]}" fill-opacity=".6"/>'
            f'<rect x="{x + 10}" y="440" width="100" height="18" rx="4" fill="{C["raised"]}"/>'
            f'<rect x="{x + 10}" y="464" width="34" height="9" rx="4.5" fill="{C["mint"]}"/>'
            f'<text x="{x + 110}" y="472" text-anchor="end" fill="{C["muted"]}" font-size="9">{label}</text>'
        )

    shots = (
        f'<g class="fade" {at(5.9)}>{thumb(830, "baseline")}{thumb(966, "this run")}</g>'
        f'<g class="window" {at(6.1, 0.9)}><g style="animation:scan .8s linear 6.1s both"><rect x="830" y="416" width="2" height="66" fill="{C["mint"]}"/></g></g>'
    )
    marks = (
        tick(1126, 134, 1.8) + cross(1126, 232, 2.9, fix + 0.3 - 2.9) + tick(1126, 232, fix + 0.4)
        + cross(1126, 330, 4.0, fix + 0.3 - 4.0) + tick(1126, 330, fix + 0.4) + tick(1126, 428, 7.0)
    )
    spin = 7.0
    body = f"""
<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="position:absolute;inset:0">
  {kicker(60, 50, "WEB QUALITY", "One page, four checks, and no figure behind a spinner")}
  {tag(1150 - tag_w("PROPOSED"), 38, "PROPOSED", "saffron", 0.3)}
  <g class="rise" {at(0.2)}>
    <rect x="50" y="110" width="390" height="360" rx="14" fill="{C['surface']}" stroke="{C['line']}"/>
    <line x1="50" x2="440" y1="144" y2="144" stroke="{C['line']}"/>
    <circle cx="70" cy="127" r="4.5" fill="{C['muted']}"/><circle cx="85" cy="127" r="4.5" fill="{C['muted']}"/><circle cx="100" cy="127" r="4.5" fill="{C['muted']}"/>
    <rect x="118" y="118" width="300" height="18" rx="9" fill="{C['bg']}"/>
    <text x="130" y="131" class="mono" fill="{C['muted']}" font-size="10">localhost · stub API · synthetic data</text>
  </g>
  <g class="rise" {at(0.9)}>
    <text x="72" y="182" fill="{C['text']}" font-size="20" font-weight="700">Forecasts</text>
    <rect x="70" y="198" width="350" height="150" rx="12" fill="{C['raised']}"/>
    <text x="88" y="222" fill="{C['muted']}" font-size="12">Fund A · 20 trading days</text>
    <text x="88" y="264" fill="{C['paper']}" font-size="30" font-weight="800">+3.1%</text>
    <text x="186" y="264" fill="{C['muted']}" font-size="12">median</text>
    <rect x="88" y="280" width="152" height="22" rx="11" fill="none" stroke="{C['saffron']}" stroke-width="1.5"/>
    <text x="100" y="295" fill="{C['saffron']}" font-size="11" font-weight="700">Stale · as of 21:15</text>
    <text x="88" y="330" fill="{C['muted']}" font-size="12">Twelve Data · delayed</text>
  </g>
  <g class="window" {at(1.1, fix - 1.1)}>
    <rect x="70" y="366" width="44" height="34" rx="10" fill="{C['mint']}"/>
    <path d="M84 383 L100 383 M94 377 L100 383 L94 389" fill="none" stroke="{C['bg']}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <g class="fade" {at(fix)}>
    <rect x="70" y="366" width="120" height="34" rx="10" fill="{C['mint']}"/>
    <text x="130" y="388" text-anchor="middle" fill="{C['bg']}" font-size="13" font-weight="800">Approve</text>
  </g>
  <rect x="66" y="362" width="52" height="42" rx="12" fill="none" stroke="{C['rose']}" stroke-width="2" class="window" {at(2.8, fix - 2.8)}/>
  <text x="130" y="388" fill="{C['rose']}" font-size="12" font-weight="700" class="window" {at(2.8, fix - 2.8)}>an icon with no name</text>
  <text x="204" y="388" fill="{C['mint']}" font-size="12" font-weight="700" class="fade" {at(fix + 0.2)}>fixed: it has a name</text>
  <text x="72" y="452" fill="{C['muted']}" font-size="12" class="fade" {at(1.0)}>An illustrative page, not a design</text>
  <g class="window" {at(spin, 2.8)}>
    <g style="transform-box:fill-box;transform-origin:center;animation:spin .9s linear {spin}s infinite">
      <circle cx="380" cy="250" r="14" fill="none" stroke="{C['line']}" stroke-width="3"/>
      <path d="M380 236 A14 14 0 0 1 394 250" fill="none" stroke="{C['saffron']}" stroke-width="3" stroke-linecap="round"/>
    </g>
    <text x="380" y="282" text-anchor="middle" fill="{C['muted']}" font-size="11">refreshing</text>
  </g>
  <rect x="84" y="276" width="160" height="30" rx="15" fill="none" stroke="{C['mint']}" stroke-width="2" class="window" {at(7.6, 2.2)}/>
  <rect x="82" y="314" width="150" height="24" rx="8" fill="none" stroke="{C['mint']}" stroke-width="2" class="window" {at(7.6, 2.2)}/>
  <g class="rise" {at(7.2)}>
    <rect x="50" y="486" width="390" height="96" rx="14" fill="{C['surface']}" stroke="{C['line']}"/>
    <text x="68" y="508" fill="{C['saffron']}" font-size="11" font-weight="700" letter-spacing="1.5">THE SPINNER RULE</text>
    <text x="68" y="530" fill="{C['text']}" font-size="13">The reply is held. The stale label, the as-of</text>
    <text x="68" y="549" fill="{C['text']}" font-size="13">time and the provider status stay visible,</text>
    <text x="68" y="568" fill="{C['text']}" font-size="13">and stay in the ARIA tree. A spinner alone fails.</text>
  </g>
  {tick(418, 504, 8.4)}
  {cards}
  <text x="830" y="164" class="mono fade" {at(1.1)} fill="{C['text']}" font-size="12">open → read → approve</text>
  {aria}{axe}{shots}{marks}
  <g class="rise" {at(8.8)}>
    <rect x="480" y="512" width="670" height="70" rx="14" fill="none" stroke="{C['line']}" stroke-dasharray="2 6"/>
    <text x="500" y="540" fill="{C['text']}" font-size="14" font-weight="700">Runs only once web/ exists, after UX approval.</text>
    <text x="500" y="562" fill="{C['muted']}" font-size="13">WCAG 2.2 AA is proposed; ARCHITECTURE.md says only accessible and responsive.</text>
  </g>
  <text x="60" y="616" fill="{C['muted']}" font-size="12" class="fade" {at(9.0)}>Illustrative page and figures · checks proposed on the web quality page (PL-11, PL-14) · nothing is built</text>
</svg>"""
    css = (
        "@keyframes scan { to { transform: translateX(256px); } }"
        "@keyframes spin { to { transform: rotate(360deg); } }"
    )
    end = 11.2
    return page(w, h, end, body, css), w, h, end + 0.5, 10.2


SCENES = {
    "forecast-lifecycle": forecast_lifecycle,
    "system-flow": system_flow,
    "learning-loop": learning_loop,
    "stack-build": stack_build,
    "budget": budget,
    "logo-intro": logo_intro,
    "roadmap": roadmap,
    "import-approval": import_approval,
    "claude-routes": claude_routes,
    "daily-window": daily_window,
    "trace-journey": trace_journey,
    "delivery-pipeline": delivery_pipeline,
    "device-matrix": device_matrix,
    "perimeter-layers": perimeter_layers,
    "a11y-pipeline": a11y_pipeline,
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
