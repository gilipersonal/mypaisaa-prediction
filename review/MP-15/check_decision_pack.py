"""Offline structural/representation gates for the proposed decision pack."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'docs/planning/aws-options-2026-11-01'


def require(condition, message):
    if not condition:
        raise ValueError(message)


class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.refs = []
        self.text = []
        self.hidden = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            require(attrs['id'] not in self.ids, f'duplicate HTML ID {attrs["id"]}')
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if key in attrs:
                self.refs.append(attrs[key])
        if tag in ('style', 'script'):
            self.hidden += 1

    def handle_endtag(self, tag):
        if tag in ('style', 'script'):
            self.hidden -= 1

    def handle_data(self, data):
        if not self.hidden:
            self.text.append(data)


def normalize(text):
    return ' '.join(text.split())


def main():
    pack = json.loads((BASE / 'requirements-decision-pack.json').read_text())
    decisions = json.loads((BASE / 'product-decisions.json').read_text())
    markdown = (BASE / 'requirements-decision-pack.md').read_text()
    html = (BASE / 'requirements-decision-pack.html').read_text()
    doc = Document()
    doc.feed(html)
    rendered = normalize(' '.join(doc.text))
    proposals = pack['proposals']
    ids = [card['id'] for card in proposals]
    require(len(ids) == len(set(ids)) == 18, 'proposal IDs/count')
    require(len(decisions['decisions']) == pack['confirmed_decision_count'], 'confirmed decision count')
    confirmed = {d['id'] for d in decisions['decisions'] if d['status'] == 'confirmed'}
    require(len(confirmed) == len(decisions['decisions']), 'confirmed decisions changed status')
    require(not pack['implementation_authorised'] and
            not decisions['implementation_authorised'], 'implementation not approved')
    require(all(i in ids for i in pack['first_choice_group']), 'choice group IDs')
    for card in proposals:
        ident = card['id']
        if card['selected_option'] is None:
            require(card['status'] == 'proposed', f'{ident}: unanswered status')
        else:
            decision = next((d for d in decisions['decisions']
                             if d['id'] == card.get('confirmed_decision_id')), None)
            require(decision is not None, f'{ident}: no explicit decision evidence')
            require(decision.get('source_proposal') == ident and
                    decision.get('answer') == card.get('owner_answer') and
                    decision['value'] == card.get('confirmed_scope'),
                    f'{ident}: answer/register scope mismatch')
            require(card['selected_option'] in {o['id'] for o in card['options']},
                    f'{ident}: selected option missing')
        options = card['options']
        require(len(options) == len({o['id'] for o in options}) == 3,
                f'{ident}: option IDs/count')
        recommended = [o['id'] for o in options if '(Recommended)' in o['label']]
        require(recommended == [card['recommended_option']], f'{ident}: recommendation')
        require(set(card['confirmed_decision_refs']) <= confirmed, f'{ident}: references')
        require(f'### {ident} · {card["question"]}' in markdown, f'{ident}: Markdown heading')
        content = [card['question']]
        content += [s for o in options for s in (o['label'], o['tradeoff'])]
        content += card['proposed_defaults'] + card['acceptance']
        require(card['proposed_defaults'] and card['acceptance'], f'{ident}: details missing')
        for text in content:
            require(text in markdown, f'{ident}: JSON/Markdown drift')
            require(normalize(text) in rendered, f'{ident}: JSON/HTML drift')
    cash = pack['cash_envelope']
    require(sum(cash['proposed_allocations'].values()) == cash['proposed_operating_total'] == 70,
            'operating allocation arithmetic')
    require(cash['proposed_operating_total'] + cash['reserve'] == cash['monthly_ceiling'] == 100,
            'cash envelope arithmetic')
    for name in ('requirements-decision-pack.md', 'product-requirements.md', 'README.md'):
        for ref in re.findall(r'\]\(([^)]+)\)', (BASE / name).read_text()):
            if '://' not in ref and not ref.startswith('#'):
                require((BASE / ref.split('#')[0]).exists(), f'{name}: missing {ref}')
    for ref in doc.refs:
        if '://' in ref or ref.startswith(('mailto:', 'data:')):
            continue
        if ref.startswith('#'):
            require(ref[1:] in doc.ids, f'missing anchor {ref}')
        else:
            require((BASE / ref.split('#')[0]).exists(), f'missing HTML target {ref}')
    require('prefers-reduced-motion' in html, 'reduced-motion support')
    answered = sum(c['selected_option'] is not None for c in proposals)
    require(answered == pack.get('answered_count', 0), 'answer count')
    print(f'PASS: {len(proposals)} choices, {answered} explicit answers, '
          f'{len(confirmed)} confirmed decisions; content parity, links and cash arithmetic.')


if __name__ == '__main__':
    main()
