"""Validate the MP-19 planning evidence, without network or service writes."""
from __future__ import annotations
import hashlib
import json
import re
from pathlib import Path

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[2]
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def unique(values):assert len(values)==len(set(values)), 'duplicate IDs'

for path in BASE.rglob('*.json'):read(path)
coverage=read(BASE/'source-coverage.json');pages=coverage['source_pages']
assert coverage['page_inventory_complete'] and len(pages)==83
unique([p['id'] for p in pages])
assert all(p['version'] and re.fullmatch('[0-9a-f]{64}',p['body_sha256']) for p in pages)
assert all(p['disposition'] and p['visual_status']=='native_pixels_not_comprehensively_verified' for p in pages)
attachments=read(BASE/'ma-attachment-index.json')
assert attachments['pagination_complete'] and attachments['total']==280
assert sum(x.get('type')=='attachment' for x in attachments['attachments'])==278
issues=read(BASE/'source-issue-reconciliation.json');rows=issues['issues']
assert len(rows)==299;unique([x['source_key'] for x in rows])
assert issues['source_capture']['sha256']==sha(BASE/'lanes/ma-issue-capture.json')
original={x['key']:x for x in read(BASE/'lanes/ma-issue-capture.json')['issues']}
for row in rows:
 assert hashlib.sha256(original[row['source_key']]['description_html'].encode()).hexdigest()==row['description_sha256']
 assert row['disposition'] and row['implementation_authorised'] is False
 if row['disposition']=='relevant_adapt':assert row['source_specific_mp_acceptance']
assert sum(bool(x['previous_140_register']) for x in rows)==140
assert not issues['coverage']['target_story_decomposition_complete']
gapdoc=read(BASE/'gap-register.json');gaps=gapdoc['gaps'];gids={g['id'] for g in gaps}
assert len(gaps)==52;unique([g['id'] for g in gaps])
for g in gaps:
 assert g['jira_key'] and g['decision_needed'] and g['acceptance_criteria'] and not g['implementation_authorised']
 assert set(g['source_ids'])<={p['id'] for p in pages}
assert set().union(*(set(g['gap_ids']) for g in gapdoc['planning_groups']))==gids
cards=read(BASE/'decision-cards.json')['cards'];assert len(cards)==12
assert set().union(*(set(c['gap_ids']) for c in cards))==gids
for card in cards:
 assert len(card['options'])==2 and card['options'][0]['recommended']
 assert '(Recommended)' in card['options'][0]['label']
 answer=card['owner_answer']
 if answer is None:assert card['status']=='owner_answer_pending'
 else:
  assert answer['option_id'] in {o['id'] for o in card['options']}
  assert answer['recorded_on'] and answer['source'] and answer['meaning']
  assert card['status']=='owner_direction_selected_evidence_pending'
answers=read(BASE/'owner-decisions.json')
assert not answers['architecture_baseline_approved'] and not answers['implementation_authorised']
assert {x['card_id'] for x in answers['decisions']}=={c['id'] for c in cards if c['owner_answer'] is not None}
unique([x['card_id'] for x in answers['decisions']])
by_card={c['id']:c for c in cards}
for recorded in answers['decisions']:
 assert recorded['answer']==by_card[recorded['card_id']]['owner_answer']
if answers.get('direction_selection_complete'):
 assert len(answers['decisions'])==12 and all(c['owner_answer'] is not None for c in cards)

phase=read(BASE/'phase-story-baseline.json');assert len(phase['phases'])==10 and len(phase['stories'])==64
unique([s['id'] for s in phase['stories']]);pids={p['id'] for p in phase['phases']}
visited=set();pending={p['id']:set(p['implementation_dependencies']) for p in phase['phases']}
while pending:
 ready={k for k,v in pending.items() if v<=visited};assert ready,'cyclic or missing phase dependency'
 visited|=ready
 pending={k:v for k,v in pending.items() if k not in ready}
for story in phase['stories']:
 assert story['phase_id'] in pids and story['acceptance'] and not story['implementation_authorised']
 assert story['jira_key'] is None and story['readiness']=='blocked_on_architecture_and_UX'
pub=read(BASE/'confluence-publication-proposal.json');assert len(pub['pages'])==13
for page in pub['pages']:
 assert page['source_sha256']==sha(BASE/page['local_source'])
 assert page['body_sha256']==sha(BASE/page['body_file'])
 body=(BASE/page['body_file']).read_text()
 assert '<div data-type="panel-warning">' in body and 'not run' in body
 assert not any(s in body for s in ['<ac:','<ri:','file:///','<html','<body','{{'])
 assert page['content_id'] is None and page['status']=='prepared_not_published'
for path in BASE.rglob('*.md'):
 for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',path.read_text()):
  if target.startswith(('http:','https:','#')):continue
  assert (path.parent/target.split('#',1)[0]).resolve().exists(),f'broken link {path}:{target}'
for name in ['README.md','docs/architecture.md','docs/tech-stack.md','docs/implementation-plan.md']:
 assert 'ma-reconciliation-2026-11-02' in (ROOT/name).read_text()
receipt=read(BASE/'jira-receipt.json');assert len(receipt['groups'])==15
assert len([x for x in receipt['groups'] if x['action']=='create_planning_task'])==11
assert all(x.get('verified_parent')==x['parent_requested'] and x.get('verified_status')=='To Do' for x in receipt['groups'] if x['action']=='create_planning_task')
publication='not_applied'
publication_receipt=BASE/'confluence-publication-receipt.json'
if publication_receipt.exists():
 live=read(publication_receipt)
 publication=live['status']
 if publication=='published_and_verified':
  evidence=read(BASE/'confluence-publication-validation.json')
  assert evidence['status']=='publication_readback_passed' and evidence['published_pages']==13
  assert evidence['selected_decision_rows_verified']==156
  assert len(live['pages'])==13 and not live['preexisting_pages_edited']
  assert all(x['same_version'] and x['canonical_body_preserved'] for x in live['parent_preservation'])
  for page in live['pages']:
   assert page['content_status']=='current' and page['planning_status']=='draft' and page['decisions_verified']==12
   assert page['readback_artifact_sha256']==sha(BASE/page['readback_file'])
  assert not live['architecture_baseline_approved'] and not live['UX_authorised'] and not live['implementation_authorised']

result={'status':'maker_checks_passed','pages':83,'attachment_entries':280,'source_issues':299,'gaps':52,'decision_cards':12,'selected_directions':len(answers['decisions']),'architecture_baseline_approved':answers['architecture_baseline_approved'],'phases':10,'local_story_drafts':64,'confluence_bodies_prepared':13,'new_planning_tasks':11,'existing_planning_tasks_supplemented':4,'independent_review':'not_run','publication':publication,'implementation_authorised':False}
(BASE/'validation.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
