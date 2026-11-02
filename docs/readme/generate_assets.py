"""Generate local README artwork. No provider calls, fonts or external assets."""

from html import escape
from pathlib import Path

HERE = Path(__file__).resolve().parent
BADGES = {
    "stage": ("Requirements & architecture", "#fff1d6", "#aa620c"),
    "budget": ("£100 all-in ceiling", "#ffe5df", "#b44733"),
    "scope": ("Private · No trading", "#e1f3e9", "#27704c"),
    "ci": ("CI · 5 named checks", "#e8eef8", "#355a96"),
    "python": ("Python 3.12+", "#e6effc", "#3267aa"),
    "api": ("FastAPI · Lambda", "#dff4ee", "#186b57"),
    "web": ("SvelteKit 3 · PWA", "#ffe8df", "#b94326"),
    "apple": ("SwiftUI · RN shell", "#ffe2e4", "#a93845"),
    "claude": ("Anthropic SDK · Claude", "#eee7fa", "#6d47a0"),
    "durable": ("Lambda Durable Functions", "#fff1d6", "#aa620c"),
    "records": ("DynamoDB · S3", "#e3ecfc", "#3e5eb1"),
    "ml": ("SageMaker · CPU", "#dff2f1", "#236965"),
    "evals": ("Inspect AI · checks", "#eee7fa", "#6d47a0"),
}


def mark(dark: bool, animated: bool) -> str:
    ground = "#182a43" if dark else "#f5f2ec"
    ink = "#f5f2ec" if dark else "#182a43"
    motion = """<style>
      .trace { stroke-dasharray:180; animation:reveal 1.6s ease-out 1 both; }
      @keyframes reveal { from { stroke-dashoffset:180; } to { stroke-dashoffset:0; } }
      @media (prefers-reduced-motion:reduce) { .trace { animation:none; } }
    </style>""" if animated else ""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="104" height="104" viewBox="0 0 104 104" role="img" aria-labelledby="title desc">
  <title id="title">Mypaisaa Prediction</title>
  <desc id="desc">Documentation mark: a compass and three evidence points around a bounded forecast band. Not observed market data.</desc>
  {motion}
  <rect x="2" y="2" width="100" height="100" rx="27" fill="{ground}"/>
  <path d="M52 14 87 52 52 90 17 52Z" fill="none" stroke="{ink}" stroke-opacity=".17" stroke-width="1.5"/>
  <path d="M22 64 42 39 61 47 83 24 83 57 61 67 42 59 22 78Z" fill="#9184d9" fill-opacity=".25"/>
  <path class="trace" d="M22 71 42 49 61 57 83 41" fill="none" stroke="{ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="22" cy="71" r="4.8" fill="#e57f68"/>
  <circle cx="42" cy="49" r="4.8" fill="#dba451"/>
  <circle cx="61" cy="57" r="4.8" fill="#5fae91"/>
  <circle cx="83" cy="41" r="4.8" fill="#a194e2"/>
  <path d="M52 14 48 24 56 24Z" fill="#e57f68"/>
</svg>\n'''


def main() -> None:
    (HERE / "badges").mkdir(parents=True, exist_ok=True)
    for name, (label, background, accent) in BADGES.items():
        width = round(len(label) * 6.7 + 28)
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="28" viewBox="0 0 {width} 28" role="img" aria-label="{escape(label, quote=True)}">
  <title>{escape(label)}</title>
  <rect x=".5" y=".5" width="{width - 1}" height="27" rx="6" fill="{background}" stroke="{accent}" stroke-opacity=".28"/>
  <circle cx="12" cy="14" r="3" fill="{accent}"/>
  <text x="22" y="18" fill="#182a43" font-family="Arial,Helvetica,sans-serif" font-size="12" font-weight="600">{escape(label)}</text>
</svg>\n'''
        (HERE / "badges" / f"{name}.svg").write_text(svg)
    for dark, suffix in [(False, ""), (True, "-dark")]:
        for animated, stem in [(True, "mark"), (False, "mark-static")]:
            content = "\n".join(line.rstrip() for line in mark(dark, animated).splitlines()) + "\n"
            (HERE / f"{stem}{suffix}.svg").write_text(content)
    print(f"Generated {len(BADGES)} badges and four mark variants, offline.")


if __name__ == "__main__":
    main()
