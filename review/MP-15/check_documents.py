"""Offline structural gates for the MP-15 requirements review; no billing calls."""
from pathlib import Path
from html.parser import HTMLParser
import json
import math
import re

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'docs/planning/aws-options-2026-11-01'


def require(condition, message):
    if not condition:
        raise ValueError(message)


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.refs = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            require(attrs['id'] not in self.ids, 'duplicate HTML ID')
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if key in attrs:
                self.refs.append(attrs[key])


def main():
    for path in BASE.glob('*.json'):
        json.loads(path.read_text())
    decisions = json.loads((BASE / 'product-decisions.json').read_text())
    require([d['id'] for d in decisions['decisions']] ==
            [f'DEC-{i:03d}' for i in range(1, len(decisions['decisions']) + 1)], 'decision IDs/count')
    require(not decisions['implementation_authorised'], 'implementation not approved')
    require('C01' not in ' '.join(decisions['pending_question_round']) and
            'C02' not in ' '.join(decisions['pending_question_round']) and
            'C03' not in ' '.join(decisions['pending_question_round']),
            'answered cost choices still pending')
    sources = json.loads((BASE / 'audit-observability-sources.json').read_text())
    require(sources['source_issue_count'] == len(sources['issues']) == 21,
            'source issue counts')
    require(len({i['key'] for i in sources['issues']}) == 21, 'duplicate source issue')
    require(all(i['fields'].get('description') for i in sources['issues']),
            'source descriptions missing')
    for name in ('product-requirements.md', 'audit-observability-requirements.md', 'README.md'):
        path = BASE / name
        for ref in re.findall(r'\]\(([^)]+)\)', path.read_text()):
            if '://' in ref or ref.startswith('#'):
                continue
            require((path.parent / ref.split('#')[0]).exists(), f'broken {name}: {ref}')
    parser = Links()
    rendered = (BASE / 'review.html').read_text()
    parser.feed(rendered)
    for ref in parser.refs:
        if '://' in ref or ref.startswith(('mailto:', 'data:')):
            continue
        if ref.startswith('#'):
            require(ref[1:] in parser.ids, f'broken HTML anchor: {ref}')
        else:
            require((BASE / ref.split('#')[0]).exists(), f'broken HTML link: {ref}')
    require('17. S3 evidence, operational visibility and priority cost monitoring' in rendered,
            'rendered operational update missing')
    require('longer horizons awaiting your selection' not in rendered,
            'stale rendered horizons')
    cost = json.loads((BASE / 'cost-model.json').read_text())
    pack = json.loads((BASE / 'requirements-decision-pack.json').read_text())
    if 'synthetic local/dev first' in pack.get('next_evidence_step', {}).get('current_phase', ''):
        decision_text = (BASE / 'requirements-decision-pack.md').read_text()
        summary = decision_text.split('## Initial questionnaire completion and immediate evidence step')[1]
        summary = summary.split('\n## ', 1)[0]
        require('Resolve exact holding identities and data rights/coverage first' not in summary,
                'DEC-041 synthetic-first phase contradicted by stale immediate-step summary')
        data_card = next(c for c in pack['proposals'] if c['id'] == 'D02')
        require('document-specific fixture work is still needed' not in
                ' '.join(data_card['proposed_defaults']), 'Prepared document fixtures called missing')
        require('data/synthetic-imports-v1' in ' '.join(data_card['proposed_defaults']),
                'Prepared generic fixtures missing from D02 coverage description')
    require(cost['scope_validation']['recost_required'], 'expanded scope recosting missing')
    for name, plan in cost['plans'].items():
        require(math.isclose(sum(plan['GBP_allowances'].values()), plan['total']),
                f'{name}: allowance arithmetic')
        require(plan['total'] + plan['reserve'] == 100, f'{name}: cash envelope')
        require(not plan['automatic_paid_fallback'], f'{name}: paid fallback not approved')
    require('pending' not in cost['long_term_requirement']['status'].lower(),
            'confirmed horizon selection still pending in cost model')
    print('PASS: planning JSON, decision/source integrity, local links, HTML anchors, '
          'cost arithmetic, approval boundaries and forecast metadata.')


if __name__ == '__main__':
    main()
