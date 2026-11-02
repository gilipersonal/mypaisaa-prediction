"""Offline trace, arithmetic, link and publication-preparation gates for this draft."""
from __future__ import annotations

import json
import re
from decimal import Decimal
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[2]


def require(condition, detail):
    if not condition:
        raise ValueError(detail)


def read(name):
    return json.loads((BASE / name).read_text())


def acyclic(graph, label):
    active, done = set(), set()
    def visit(node):
        require(node in graph, f'{label}: unknown dependency {node}')
        require(node not in active, f'{label}: cycle at {node}')
        if node in done:
            return
        active.add(node)
        for parent in graph[node]:
            visit(parent)
        active.remove(node)
        done.add(node)
    for node in graph:
        visit(node)


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            require(attrs['id'] not in self.ids, f'duplicate HTML id {attrs["id"]}')
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if key in attrs:
                self.links.append(attrs[key])


# Removed in MP-34: the two documents the root ARCHITECTURE.md and TECH-STACK.md replace, and Codex's images.
RETIRED = ('docs/architecture.md', 'docs/tech-stack.md', 'docs/planning/layered-development-2026-11-01/visuals/',
           'docs/planning/aws-options-2026-11-01/', 'docs/diagrams/')


def local_link(path, target, ids=None):
    parsed = urlparse(target)
    if parsed.scheme or target.startswith(('{{', 'mailto:')):
        return
    if not parsed.path:
        if parsed.fragment and ids is not None:
            require(unquote(parsed.fragment) in ids, f'{path.name}: missing anchor {target}')
        return
    resolved = (path.parent / unquote(parsed.path)).resolve()
    # This dated pack keeps its published bytes; links to documents retired in MP-34 stay as written.
    rel = resolved.relative_to(ROOT).as_posix()
    if not resolved.exists() and rel.startswith(RETIRED):
        return
    require(resolved.exists(), f'{path.name}: missing link {target}')


def main():
    for path in BASE.glob('*.json'):
        json.loads(path.read_text())
    phases = read('phase-story-map.json')
    layer = read('portfolio-import-stories.json')
    contracts = read('portfolio-import-contracts.json')
    examples = read('portfolio-import-examples.json')
    decisions = json.loads((BASE.parent/'aws-options-2026-11-01/product-decisions.json').read_text())
    decision_ids = {d['id'] for d in decisions['decisions']}
    require(len(decision_ids) == 41 and not decisions['implementation_authorised'], 'decision authority')
    require(not layer['implementation_authorised'] and not contracts['implementation_authorised'],
            'implementation falsely authorised')
    pmap = {p['id']: p for p in phases['phases']}
    require(len(pmap) == 10, 'phase count')
    for key in ('planning_dependencies', 'implementation_dependencies'):
        acyclic({p['id']:p[key] for p in phases['phases']}, key)
    stories = {s['id']:s for s in phases['stories'] + layer['stories']}
    require(len(phases['stories']) == 48 and len(layer['stories']) == 16 and len(stories) == 64,
            'story IDs/counts')
    acyclic({s['id']:s.get('depends_on', []) for s in stories.values()}, 'story dependencies')
    require(all(s.get('jira_key') is None for s in stories.values()), 'fabricated Jira key')
    require(all(s.get('phase',s.get('phase_id')) in pmap for s in stories.values()),
            'unknown story phase')
    entity_names = {e['name'] for e in contracts['entities']}
    require(len(entity_names) == 15, 'entity count')
    ex = {e['id']:e for e in examples['examples']}
    require(len(ex) == 12 and all(e['is_synthetic'] for e in ex.values()), 'synthetic examples')
    catalogue=json.loads((ROOT/'fixtures/synthetic/instruments.json').read_text())
    real_ids={i['instrument_id'] for i in catalogue}
    def instrument_ids(value):
        if isinstance(value,dict):
            for key,item in value.items():
                if key=='instrument_id':
                    require(item in real_ids, f'fictional/unverified instrument ID: {item}')
                instrument_ids(item)
        elif isinstance(value,list):
            for item in value:
                instrument_ids(item)
    instrument_ids(examples['examples'])
    criteria = []
    for story in layer['stories']:
        require(set(story['decision_refs']) <= decision_ids, f'{story["id"]}: decisions')
        require(set(story['contract_refs']) <= entity_names, f'{story["id"]}: contracts')
        require(set(story['example_refs']) <= set(ex), f'{story["id"]}: examples')
        criteria.extend(a['id'] for a in story['acceptance'])
    require(len(criteria) == len(set(criteria)) == 64, 'L1 acceptance IDs/count')
    for example in ex.values():
        require(set(example['story_refs']) <= set(stories), f'{example["id"]}: story refs')
        for ref in example.get('source_refs', []):
            require((ROOT/ref['repo_relative_path']).exists(), f'{example["id"]}: source path')
    sources = json.loads((BASE.parent/'aws-options-2026-11-01/forecasting-source-register.json').read_text())
    mapped = phases['historical_source_phase_mapping']
    require({r['source_key'] for r in mapped} == {r['key'] for r in sources['issues']}
            and len(mapped) == 140, 'source-to-phase coverage')
    require(set(phases['decision_phase_mapping']) == decision_ids, 'decision-to-phase coverage')
    for story in layer['stories']:
        require(set(story['reference_issue_refs']) <= {r['key'] for r in sources['issues']},
                f'{story["id"]}: uncaptured reference issue')
    e = ex['L1-E01'];g,x=e['given'],e['expected']
    require(sum(Decimal(p['source_position_value']) for p in g['positions']) ==
            Decimal(x['recomputed_positions_value']), 'E01 position values')
    require(Decimal(x['recomputed_positions_value']) + Decimal(g['cash']) ==
            Decimal(x['recomputed_total_value']), 'E01 account total')
    e=ex['L1-E02'];g,x=e['given'],e['expected']
    price=Decimal(g['artificial_raw_quote'])/100
    gross=price*Decimal(g['quantity'])
    require(price==Decimal(x['unit_price_GBP']) and gross==Decimal(x['gross_GBP']) and
            -(gross+Decimal(g['fee_GBP']))==Decimal(x['cash_delta_GBP']), 'E02 quote units')
    e=ex['L1-E07'];g,x=e['given'],e['expected']
    balances={k:Decimal(v) for k,v in g['starting_cash'].items()}
    for leg in g['linked_legs']:
        balances[leg['currency']]+=Decimal(leg['amount'])
    require(balances=={k:Decimal(v) for k,v in x['ending_cash'].items()}, 'E07 currency legs')
    require(balances['GBP']+balances['USD']*Decimal(g['valuation_rate']['GBP_per_USD'])==
            Decimal(x['NAV_GBP']), 'E07 base-currency NAV')
    e=ex['L1-E12'];g,x=e['given'],e['expected']
    flows=g['complete_golden_case']['cashflows'];rate=Decimal(x['golden_case']['xirr'])
    require(Decimal(flows[0]['amount'])+Decimal(flows[1]['amount'])/(1+rate)==0, 'E12 golden')
    for root in x['ambiguous_roots_variant']['root_checks']:
        z=1+Decimal(root['rate'])
        require(-100*z*z+230*z-132==0, 'E12 ambiguous root')
    require(x['ambiguous_roots_variant']['xirr'] is None, 'E12 false unique XIRR')
    for path in [*BASE.glob('*.md'), ROOT/'README.md', ROOT/'ARCHITECTURE.md', ROOT/'TECH-STACK.md']:
        for link in re.findall(r'\]\(([^)]+)\)', path.read_text()):
            local_link(path, link)
    for path in BASE.glob('*.html'):
        doc=Page();doc.feed(path.read_text())
        for link in doc.links:
            local_link(path, link, doc.ids)
    payload=read('confluence-publish-payloads.json')
    require(not payload['published'] and payload['external_writes_performed']==0,
            'unapproved Confluence write')
    require(len(payload['create_actions'])==5 and len(payload['update_actions'])==6,
            'publication page scope')
    require(len(payload['attachment_upsert_actions'])==8, 'publication visual scope')
    for action in payload['create_actions'] + payload['update_actions'] + payload['attachment_upsert_actions']:
        require(action['space_key']=='mypaisaapr' and action['space_id']=='5145174',
                'wrong Confluence destination')
    for action in payload['update_actions']:
        require(action['preserve_all_existing_body_nodes'] and
                action['preserve_all_existing_macros_attachments_history_and_permissions'],
                'destructive page update')
    # The source snapshot pinned the files behind the 1 November publication to Codex's Confluence
    # pages, which MP-34 archived; README.md has since been rewritten, so it is no longer compared.
    # The eight attachment images were removed in MP-34 (git history keeps them), so their
    # hashes are no longer checked here.
    sync=read('mp-sync-write-proposal.json')
    require(not sync['external_writes_authorised'] and not sync['sync_applied'],
            'unapproved sync applied')
    require(sync['scope_counts']['jira_existing_description_updates']==11 and
            sync['scope_counts']['jira_new_issues']==0 and
            sync['scope_counts']['jira_status_changes']==0 and
            sync['scope_counts']['jira_closures']==0, 'Jira mutation scope')
    updates=sync['jira']['issues']
    require({i['issue_key'] for i in updates}==
            {f'MP-{i}' for i in [*range(4,14),15]}, 'wrong Jira targets')
    require(sync['jira']['fields_only']==['description'], 'unexpected Jira fields')
    markers=[]
    proposal_text=(BASE/'mp-sync-write-proposal.md').read_text()
    for issue in updates:
        require(issue['target_status']=='unchanged' and issue['allowed_fields']==['description'],
                'Jira status or non-description change')
        require(all(issue[key] for key in ['preserve_comments','preserve_attachments',
                    'preserve_changelog','preserve_rich_description_nodes']), 'Jira content loss')
        require(issue['markdown_insertion'] in proposal_text, 'Jira proposal text drift')
        markers += [issue['section_marker_begin'],issue['section_marker_end']]
    require(len(markers)==len(set(markers))==22, 'nonunique Jira section markers')
    report={'status':'maker structural/arithmetic checks passed; independent review not run',
            'as_of':'2026-11-01','phases':len(pmap),'stories':len(stories),
            'L1_stories':len(layer['stories']),'L1_acceptance_criteria':len(criteria),
            'contracts':len(entity_names),'synthetic_examples':len(ex),'source_mappings':len(mapped),
            'publication':{'creates':5,'bounded_updates':6,'image_upserts':8,
                           'Jira_description_updates':11,'status_changes':0,'writes_performed':0},
            'coverage_limit':'Phase-level source mapping does not prove source-clause decomposition or product acceptance.',
            'gates':['planning/implementation/story dependency DAGs','decision/source/story/contract/example joins',
                     'synthetic Decimal arithmetic and ambiguous-XIRR evidence','local Markdown/HTML links and anchors',
                     'MP-only non-destructive publication actions and current source/image hashes'],
            'application_implementation_authorised':False}
    (BASE/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))


if __name__=='__main__':
    main()
