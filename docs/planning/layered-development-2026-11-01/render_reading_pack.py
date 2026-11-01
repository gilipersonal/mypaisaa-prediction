# /// script
# requires-python = ">=3.12"
# dependencies = ["markdown-it-py==4.0.0"]
# ///
"""Render local planning documents; no application/server or publication API."""
from __future__ import annotations

import json
import re
from html import escape
from pathlib import Path

from markdown_it import MarkdownIt

BASE = Path(__file__).resolve().parent
DOCUMENTS = {
    "README.md": ("index.html", "Reading hub"),
    "portfolio-import-spec.md": ("portfolio-import-spec.html", "Portfolio and imports"),
    "phased-delivery-plan.md": ("phased-delivery-plan.html", "Phased delivery"),
    "architecture-blueprint.md": ("architecture-blueprint.html", "Architecture"),
    "network-topology-options.md": ("network-topology-options.html", "VPC and egress options"),
    "tech-stack-matrix.md": ("tech-stack-matrix.html", "Technology choices"),
    "confluence-page-map.md": ("confluence-page-map.html", "MP page proposal"),
    "mp-sync-write-proposal.md": ("mp-sync-write-proposal.html", "Proposed sync scope"),
}

# Locally defined Tailwind-equivalent utilities/tokens keep these documents offline.
CSS = """
:root{--ink:#0f172a;--muted:#475569;--line:#cbd5e1;--surface:#f8fafc;--blue:#1d4ed8;--blue-dark:#1e3a8a;--teal:#115e59;--amber:#92400e;color-scheme:light}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--surface);color:var(--ink);font:16px/1.7 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-variant-numeric:tabular-nums}
a{color:var(--blue);text-underline-offset:3px}a:hover{color:var(--blue-dark)}a:focus-visible,button:focus-visible,[tabindex]:focus-visible,summary:focus-visible{outline:3px solid #b45309;outline-offset:4px}
.grid{display:grid}.gap-6{gap:24px}.p-6{padding:24px}.rounded-lg{border-radius:8px}.font-semibold{font-weight:600}.text-sm{font-size:14px}.text-slate-600{color:var(--muted)}
.shell{grid-template-columns:256px minmax(0,1fr);max-width:1536px;margin:auto;padding:32px}.sidebar{position:sticky;top:24px;align-self:start;max-height:92vh;overflow:auto;padding:8px}.brand{font-size:12px;letter-spacing:.12em;font-weight:700;color:var(--blue-dark);margin:0 0 16px}.sidebar a{display:block;text-decoration:none;font-size:14px;padding:8px 12px;border-left:3px solid transparent}.sidebar a[aria-current=page]{background:#dbeafe;border-color:var(--blue);font-weight:600}.sidebar .toc{border-top:1px solid var(--line);margin-top:24px;padding-top:16px}.sidebar .toc a{font-size:13px;padding:6px 12px}
.sheet{min-width:0;background:#fff;border:1px solid #e2e8f0;padding:48px}.status{border-left:4px solid #b45309;background:#fffbeb;padding:16px 24px;margin:0 0 32px}.status p{margin:0}.eyebrow{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}
h1{font-size:36px;line-height:1.18;letter-spacing:-.03em;margin:0 0 24px;color:var(--blue-dark)}h2{font-size:26px;line-height:1.3;letter-spacing:-.015em;margin:48px 0 16px;padding-top:24px;border-top:1px solid var(--line);scroll-margin-top:24px}h3{font-size:20px;line-height:1.4;margin:32px 0 12px;scroll-margin-top:24px}p,li{max-width:90ch;overflow-wrap:anywhere}p{margin:16px 0}li+li{margin-top:8px}code{font-size:.9em;background:#f1f5f9;padding:2px 4px;border-radius:4px;overflow-wrap:anywhere}pre{background:#0f172a;color:#f1f5f9;border-radius:8px;padding:24px;max-width:100%;overflow:auto;line-height:1.5;font-size:13px}pre code{padding:0;background:transparent;color:inherit;white-space:pre;overflow-wrap:normal}
.table-scroll{max-width:100%;overflow:auto;margin:24px 0;border:1px solid var(--line);border-radius:8px}table{border-collapse:collapse;width:100%;font-size:14px;line-height:1.55}th,td{text-align:left;vertical-align:top;padding:12px 16px;border-bottom:1px solid #e2e8f0;min-width:96px}th{background:#eff6ff;color:#1e3a8a;font-weight:600}tbody tr:nth-child(even){background:#f8fafc}tbody tr:last-child td{border-bottom:0}
.metrics{grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:32px}.metric{border:1px solid var(--line);padding:20px;border-radius:8px}.metric strong{display:block;font-size:28px;line-height:1.2;color:var(--teal)}.metric span{display:block;font-size:13px;color:var(--muted);margin-top:8px}
.workflow,.diagram{border:1px solid var(--line);border-radius:8px;margin:32px 0;padding:24px;background:#f8fafc}.workflow img,.diagram img{display:block;width:100%;height:auto;background:#fff}.controls{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:16px}button{font:inherit;font-size:14px;font-weight:600;background:var(--blue-dark);color:white;border:1px solid var(--blue-dark);border-radius:6px;padding:10px 16px;cursor:pointer}button:disabled{opacity:.65;cursor:default}.caption{font-size:13px;line-height:1.55;color:var(--muted)}.native-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.diagram{min-width:0}.diagram h3{margin-top:0}
details{margin:16px 0;border:1px solid var(--line);border-radius:8px;padding:16px 20px}summary{cursor:pointer;font-weight:600;color:var(--blue-dark)}details p{font-size:14px}.tag{display:inline-block;padding:3px 8px;border-radius:4px;background:#e2e8f0;font-size:12px;color:#334155}.skip{position:absolute;left:-9999px}.skip:focus{left:16px;top:16px;z-index:10;background:white;padding:12px}.footer{border-top:1px solid var(--line);margin-top:48px;padding-top:24px;font-size:13px;color:var(--muted)}
@media(max-width:1100px){.shell{grid-template-columns:220px minmax(0,1fr);padding:24px}.sheet{padding:32px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:820px){.shell{display:block;padding:16px}.sidebar{position:static;max-height:220px;border:1px solid var(--line);border-radius:8px;margin-bottom:24px}.sidebar .toc{display:none}.sheet{padding:24px}.native-grid{grid-template-columns:1fr}h1{font-size:30px}}
@media(max-width:480px){.shell{padding:8px}.sheet{padding:16px}.metrics{gap:8px}.metric{padding:12px}.metric strong{font-size:24px}.workflow,.diagram{padding:12px}th,td{padding:10px 12px}h2{font-size:23px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
@media print{.sidebar,.controls,.skip{display:none}.shell{display:block;padding:0}.sheet{border:0;padding:0}.table-scroll{overflow:visible}body{font-size:10pt;background:white}h2,h3{break-after:avoid}.workflow,.diagram{break-inside:avoid}details{break-inside:avoid}}
"""

SCRIPT = """
(()=>{const img=document.getElementById('workflow-image');const button=document.getElementById('workflow-toggle');if(!img||!button)return;const motion=matchMedia('(prefers-reduced-motion: reduce)');const status=document.getElementById('workflow-status');let playing=false;
const stop=()=>{playing=false;img.src='visuals/import-workflow.png';button.setAttribute('aria-pressed','false');button.textContent='Play illustrative workflow';status.textContent='Static workflow. Financial visibility begins only after a valid commit.';};
const preference=()=>{stop();button.disabled=motion.matches;if(motion.matches)status.textContent='Reduced motion enabled. Static workflow remains available.';};
button.addEventListener('click',()=>{if(motion.matches)return;if(playing){stop();return;}playing=true;img.src='visuals/import-workflow.gif';button.setAttribute('aria-pressed','true');button.textContent='Pause animation';status.textContent='Illustrative animation of planned behaviour; no import or live telemetry is running.';});motion.addEventListener('change',preference);addEventListener('pagehide',stop);preference();})();
"""


def workflow() -> str:
    return '''<section class="workflow" aria-label="Planned import process"><h3>From source file to an auditable financial record</h3><p class="caption">Proposed process companion. Every stage retains source, status and cost evidence. This is documentation, not an app screen.</p><img id="workflow-image" src="visuals/import-workflow.png" alt="Receive, validate, extract, match, owner review, commit with audit, then durable receipt and reconciliation"><div class="controls"><button id="workflow-toggle" type="button" aria-pressed="false">Play illustrative workflow</button><a href="visuals/import-workflow.svg">Accessible SVG</a><a href="visuals/import-workflow.drawio">Editable process source</a></div><p class="caption" id="workflow-status" aria-live="polite">Static workflow.</p><noscript><p class="caption">Static workflow is available without JavaScript.</p></noscript></section>'''


def native_diagrams() -> str:
    cards = []
    for option, label in [('a', 'A: portable ML jobs'), ('b', 'B: selective SageMaker')]:
        src = f'../aws-options-2026-11-01/option-{option}-lucid.png'
        cards.append(f'<figure class="diagram"><h3>Proposed {label}</h3><a href="{src}"><img src="{src}" alt="Native Lucidchart export of proposed architecture option {option.upper()}" loading="lazy"></a><figcaption class="caption">Initial planning snapshot; final training/runtime choices and detailed topology remain open.</figcaption></figure>')
    return '<section aria-label="Existing native Lucid architecture snapshots"><h2>Native Lucidchart planning references</h2><p><a href="https://lucid.app/lucidchart/02218133-613a-4b78-aea4-e0dba26db386/edit">Editable Lucidchart source</a> · <a href="../aws-options-2026-11-01/diagram-manifest.json">Source/export manifest</a></p><div class="grid gap-6 native-grid">'+''.join(cards)+'</div></section>'


def chart(name: str, title: str, description: str) -> str:
    return f'<figure class="diagram"><h3>{escape(title)}</h3><a href="visuals/{name}.png"><img src="visuals/{name}.png" alt="{escape(description)}" loading="lazy"></a><figcaption class="caption">{escape(description)} · <a href="visuals/{name}.svg">Accessible SVG</a> · <a href="visuals/{name}.drawio">Editable draw.io source</a></figcaption></figure>'


def detailed_architecture() -> str:
    image = BASE/'visuals/mp-system-architecture-native.png'
    if not image.exists():
        return ''
    return '<section><h2>Detailed proposed MP system</h2><p>Native Lucidchart export with AWS components and labelled logical boundaries. Training/workflow choices and full-scope costs remain open.</p><figure class="diagram"><a href="visuals/mp-system-architecture-native.png"><img src="visuals/mp-system-architecture-native.png" alt="Detailed proposed Mypaisaa Prediction architecture with private clients, bounded APIs/jobs, source and ledger data, models, agents and cost visibility" loading="lazy"></a><figcaption class="caption"><a href="https://lucid.app/lucidchart/02218133-613a-4b78-aea4-e0dba26db386/edit">Editable Lucidchart document</a> · <a href="visuals/architecture-lucid-manifest.json">Native export/source manifest</a></figcaption></figure></section>'


def story_appendix() -> str:
    data = json.loads((BASE/'portfolio-import-stories.json').read_text())
    cards = []
    for story in data['stories']:
        criteria = ''.join(f'<li>{escape(c["id"])}: {escape(c["text"])}</li>' for c in story['acceptance'])
        cards.append(f'<details><summary>{escape(story["id"])} · {escape(story["title"])}</summary><p>{escape(story["user_story"])}</p><p class="caption">Draft local story; no Jira issue or implementation evidence.</p><ul>{criteria}</ul><p class="caption">Examples: {escape(", ".join(story["example_refs"]))}</p></details>')
    examples = json.loads((BASE/'portfolio-import-examples.json').read_text())
    ex = ''.join(f'<details><summary>{escape(e["id"])} · {escape(e["title"])}</summary><pre><code>{escape(json.dumps(e, indent=2, ensure_ascii=False))}</code></pre></details>' for e in examples['examples'])
    return '<section><h2>Layer 1 acceptance stories</h2>'+''.join(cards)+'<h2>Worked synthetic examples</h2><p>Source-backed or proposed acceptance cases; no importer implementation is certified.</p>'+ex+'</section>'


def render() -> None:
    for source, (output, label) in DOCUMENTS.items():
        body = MarkdownIt('commonmark', {'html':False}).enable('table').render((BASE/source).read_text())
        for md, (html, _) in DOCUMENTS.items():
            body = body.replace(f'href="{md}', f'href="{html}')
        ids = set()
        toc = []
        def heading(match):
            content = match.group(1)
            title = re.sub('<[^>]+>', '', content)
            slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
            original = slug
            n = 1
            while slug in ids:
                n += 1
                slug = f'{original}-{n}'
            ids.add(slug)
            toc.append((slug, title))
            return f'<h2 id="{slug}">{content}</h2>'
        body = re.sub(r'<h2>(.*?)</h2>', heading, body)
        title_match = re.search(r'<h1>.*?</h1>', body)
        main_title = title_match.group(0) if title_match else ''
        if main_title:
            body = body.replace(main_title, '', 1)
        body = re.sub(r'<table>(.*?)</table>', r'<div class="table-scroll" tabindex="0" role="region" aria-label="Planning table"><table>\1</table></div>', body, flags=re.S)
        navigation = ''.join(f'<a href="{name}"'+(' aria-current="page"' if name==output else '')+f'>{escape(title)}</a>' for name,title in DOCUMENTS.values())
        navigation += '<div class="toc">'+''.join(f'<a href="#{slug}">{escape(title)}</a>' for slug,title in toc)+'</div>'
        extra = ''
        if source == 'README.md':
            extra = '<div class="grid gap-6 metrics"><div class="metric"><strong>10</strong><span>planned phases</span></div><div class="metric"><strong>64</strong><span>local draft stories</span></div><div class="metric"><strong>12</strong><span>synthetic acceptance cases</span></div><div class="metric"><strong>Pending</strong><span>end-to-end approval</span></div></div>'
        if source in {'README.md','portfolio-import-spec.md'}:
            extra += workflow()
        appendix = story_appendix() if source=='portfolio-import-spec.md' else ''
        if source in {'README.md','phased-delivery-plan.md'}:
            appendix += chart('phase-dependencies', 'Planning and implementation prerequisites', 'Exact draft prerequisite matrices. They do not plot dates, progress or completed implementation.')
        if source in {'README.md','tech-stack-matrix.md'}:
            appendix += chart('budget-envelope', 'The confirmed cash planning envelope', 'DEC-023: £70 planned operation plus £30 reserve within £100; resource prices and actual spend are not plotted.')
        if source in {'README.md','architecture-blueprint.md','tech-stack-matrix.md'}:
            appendix += detailed_architecture() + native_diagrams()
        if source in {'README.md','architecture-blueprint.md','tech-stack-matrix.md','network-topology-options.md'}:
            appendix += '<section><h2>Detailed AWS network options</h2><figure class="diagram"><a href="visuals/mp-network-options-native.png"><img src="visuals/mp-network-options-native.png" alt="Native Lucidchart network options showing N0, two-AZ N1 private subnets and endpoints, and conditional NAT egress" loading="lazy"></a><figcaption class="caption">Proposed network choices, not provisioned resources. <a href="visuals/network-lucid-manifest.json">Native source and validation</a></figcaption></figure></section>'
        page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MP | {escape(label)}</title><link rel="icon" href="data:,"><style>{CSS}</style></head><body><a class="skip" href="#main">Skip to document</a><div class="grid gap-6 shell"><aside class="sidebar"><p class="brand">MYPAISAA PREDICTION / MP</p><nav aria-label="Planning documents and sections">{navigation}</nav></aside><main class="sheet rounded-lg" id="main"><p class="eyebrow">Requirements and architecture / 1 November 2026</p>{main_title}<div class="status"><p class="font-semibold">Draft documentation · Independent review pending</p><p class="text-sm">Synthetic local/dev phase. End-to-end requirements, UX and architecture choices remain unapproved. No product deployment or Confluence publication has occurred.</p></div>{extra}{body}{appendix}<footer class="footer">MP private planning pack. Planned behaviour, version evidence and current starter status are distinct. Canonical architecture diagrams use Lucidchart; this reading format does not imply automatic sync.</footer></main></div><script>{SCRIPT}</script></body></html>'''
        receipt_path = BASE / 'sync-receipt.json'
        if receipt_path.exists():
            receipt = json.loads(receipt_path.read_text())
            if receipt.get('status') == 'completed_and_readback_verified':
                old_banner = '<div class="status"><p class="font-semibold">Draft documentation · Independent review pending</p><p class="text-sm">Synthetic local/dev phase. End-to-end requirements, UX and architecture choices remain unapproved. No product deployment or Confluence publication has occurred.</p></div>'
                current_banner = '<div class="status"><p class="font-semibold">MP documentation published · Round 4: no blockers</p><p class="text-sm">Five new pages, six hub updates, eight visuals and eleven Jira descriptions were verified. <a href="SYNC-COMPLETED.md">Current completion record</a> · <a href="sync-receipt.json">Publication receipt</a>. Text below preserves the reviewed preparation state, including its historical pending labels. End-to-end requirements, UX and architecture choices remain unapproved; no application deployment occurred.</p></div>'
                page = page.replace(old_banner, current_banner)
        (BASE/output).write_text(page)
    print(f'Rendered {len(DOCUMENTS)} offline reading pages with static-first workflow and native Lucid references.')


if __name__ == '__main__':
    render()
