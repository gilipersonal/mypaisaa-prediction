"""Reproduce the MP motion mark and verify vendored Shields badges, offline."""

from __future__ import annotations

import hashlib
import json
from html import escape
from pathlib import Path

HERE = Path(__file__).resolve().parent


def mark(dark: bool, animated: bool) -> str:
    prefix = "mp-dark" if dark else "mp-light"
    rim = "#B7C2D6" if dark else "#243752"
    coin_top = "#243958" if dark else "#243752"
    coral = "#FF7A5E" if dark else "#F86F54"
    motion = """<style>
    .mp-coin { transform-box:view-box; transform-origin:128px 128px; }
    .mp-orbit { transform-box:view-box; transform-origin:128px 128px; }
    .mp-point { transform-box:fill-box; transform-origin:center; }
    @media (prefers-reduced-motion:no-preference) {
      .mp-coin { animation:mp-arrive 760ms cubic-bezier(.16,1,.3,1) both; }
      .mp-ring { stroke-dasharray:616; animation:mp-trace 1500ms cubic-bezier(.22,1,.36,1) 100ms both; }
      .mp-pound { stroke-dasharray:1; animation:mp-ink 1000ms cubic-bezier(.22,1,.36,1) 260ms both; }
      .mp-orbit { animation:mp-orbit 1880ms cubic-bezier(.22,1,.36,1) 140ms both; }
      .mp-point { animation:mp-settle 500ms cubic-bezier(.16,1,.3,1) 1770ms both; }
    }
    @keyframes mp-arrive {
      0% { opacity:0; transform:translateY(9px) scale(.84); }
      72% { opacity:1; transform:translateY(-1px) scale(1.018); }
      100% { opacity:1; transform:none; }
    }
    @keyframes mp-trace { from { opacity:0; stroke-dashoffset:616; } to { opacity:1; stroke-dashoffset:0; } }
    @keyframes mp-ink { from { stroke-dashoffset:1; opacity:0; } to { stroke-dashoffset:0; opacity:1; } }
    @keyframes mp-orbit {
      0% { opacity:0; transform:rotate(-245deg); }
      8% { opacity:1; }
      100% { opacity:1; transform:rotate(0deg); }
    }
    @keyframes mp-settle { 0% { transform:scale(1); } 45% { transform:scale(1.13); } 100% { transform:scale(1); } }
  </style>""" if animated else ""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-labelledby="{prefix}-title {prefix}-desc">
  <title id="{prefix}-title">Mypaisaa Prediction — Forecast Coin</title>
  <desc id="{prefix}-desc">A navy pound coin, a traced orbit and a coral prediction point. The introduction plays once in 2.27 seconds; reduced motion shows the resting mark.</desc>
  {motion}
  <defs>
    <linearGradient id="{prefix}-coin" x1="0" y1="0" x2=".7" y2="1">
      <stop stop-color="{coin_top}"/><stop offset="1" stop-color="#13213A"/>
    </linearGradient>
    <filter id="{prefix}-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0C1729" flood-opacity=".14"/>
    </filter>
    <mask id="{prefix}-gap" maskUnits="userSpaceOnUse" x="0" y="0" width="256" height="256">
      <rect width="256" height="256" fill="white"/>
      <g class="mp-orbit"><circle cx="197.3" cy="58.7" r="19" fill="black"/></g>
    </mask>
  </defs>
  <g mask="url(#{prefix}-gap)">
    <circle class="mp-ring" cx="128" cy="128" r="98" fill="none" stroke="{rim}" stroke-width="5.2" transform="rotate(-90 128 128)"/>
  </g>
  <g class="mp-coin" filter="url(#{prefix}-shadow)">
    <circle cx="128" cy="128" r="76" fill="url(#{prefix}-coin)"/>
    <circle cx="128" cy="128" r="75.5" fill="none" stroke="white" stroke-opacity=".08"/>
    <g fill="none" stroke="#FFFCF6" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">
      <path class="mp-pound" pathLength="1" d="M149 101 C147 86 139 79 127 79 C110 79 102 91 102 106 L104 140 C104 152 99 161 91 167 L158 167"/>
      <path class="mp-pound" pathLength="1" d="M91 126 H139"/>
    </g>
  </g>
  <g class="mp-orbit"><circle class="mp-point" cx="197.3" cy="58.7" r="12.5" fill="{coral}"/></g>
</svg>\n'''


def preview(records: list[dict]) -> str:
    badges = "\n".join(f'<img src="{escape(row["file"], quote=True)}" alt="{escape(row["label"] + ": " + row["message"], quote=True)}">' for row in records)
    return '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mypaisaa Prediction — motion mark</title><style>
*{box-sizing:border-box}body{margin:0;background:#f6f3ed;color:#13213a;font:16px/1.5 system-ui,sans-serif}
main{max-width:1000px;margin:48px auto;padding:0 24px}h1{font-size:32px;letter-spacing:-1px;margin-bottom:8px}
.eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#657186}.panels{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:28px 0}
.panel{min-height:330px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;border:1px solid #dededb;border-radius:20px}
.panel svg{width:180px;height:180px}.dark{background:#1f2931;color:#e3e7ed;border-color:#1f2931}.panel p{font-size:13px;letter-spacing:.04em}
button{font:inherit;background:#13213a;color:white;border:0;border-radius:8px;padding:10px 18px;margin-right:8px;cursor:pointer}button:focus-visible{outline:3px solid #f86f54;outline-offset:3px}
button:disabled{opacity:.5;cursor:default}.badges{display:flex;gap:5px;flex-wrap:wrap;margin-top:24px}.badges img{height:20px;max-width:100%}.note{font-size:14px;color:#596474}a{color:#215cad}
@media(max-width:600px){main{margin:24px auto}.panels{grid-template-columns:1fr}.panel{min-height:270px}.panel svg{width:150px;height:150px}h1{font-size:26px}}
</style><main><div class="eyebrow">Mypaisaa Prediction / documentation identity</div><h1>The Forecast Coin</h1>
<p>A quiet coin entrance, a hand-drawn currency mark, then a coral point resolving around its orbit.</p><div class="panels"><section class="panel">''' + mark(False, True) + '''<p>LIGHT / FINAL RESTING STATE</p></section><section class="panel dark">''' + mark(True, True) + '''<p>DARK / FINAL RESTING STATE</p></section></div>
<button id="replay" type="button">Replay motion</button><button id="slow" type="button">Replay at half speed</button><p class="note" id="motion-note">One introduction, about 2.3 seconds. No endless spinning. Reduced-motion settings show the final mark.</p>
<div class="badges">''' + badges + '''</div><p class="note">Compact Shields badges with embedded technology logos. Labels describe MP's selected plan, not deployment status.</p>
<p><a href="../../README.md">README source</a> · <a href="mark.svg">Animated light SVG</a> · <a href="mark-dark.svg">Animated dark SVG</a> · <a href="mark-static.svg">Static alternative</a></p>
<script>
const media=matchMedia('(prefers-reduced-motion: reduce)');
function replay(rate){for(const a of document.getAnimations()){a.playbackRate=rate;a.currentTime=0;a.play();}}
document.getElementById('replay').addEventListener('click',()=>replay(1));
document.getElementById('slow').addEventListener('click',()=>replay(.5));
function preference(){document.getElementById('replay').disabled=media.matches;document.getElementById('slow').disabled=media.matches;if(media.matches)document.getElementById('motion-note').textContent='Reduced motion is enabled. The final mark is shown without movement.';}
preference();media.addEventListener('change',preference);
</script></main></html>\n'''


def main() -> None:
    manifest = json.loads((HERE / "shields-badges.json").read_text())
    for row in manifest["records"]:
        path = (HERE / row["file"]).resolve()
        if not path.is_relative_to(HERE) or hashlib.sha256(path.read_bytes()).hexdigest() != row["sha256"]:
            raise ValueError("Vendored badge differs from its source snapshot: " + row["id"])
    for dark, suffix in [(False, ""), (True, "-dark")]:
        for animated, stem in [(True, "mark"), (False, "mark-static")]:
            content = "\n".join(line.rstrip() for line in mark(dark, animated).splitlines()) + "\n"
            (HERE / f"{stem}{suffix}.svg").write_text(content)
    (HERE / "logo-preview.html").write_text(preview(manifest["records"]))
    print(f"Verified {len(manifest['records'])} vendored badges; generated four mark variants and the local motion preview, offline.")


if __name__ == "__main__":
    main()
