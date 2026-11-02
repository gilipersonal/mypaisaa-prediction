"""Compile documentation proposals only. Does not write to external services.

Render with: uv run --no-project --with markdown-it-py==4.0.0 python <this file>
"""
from __future__ import annotations
import hashlib
import html
import json
import re
from pathlib import Path
from markdown_it import MarkdownIt

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[2]
OLD=ROOT/'docs/planning/layered-development-2026-11-01'
DATE='2026-11-02'
BRANCH='MP-19-ma-planning-reconciliation'
GITHUB=f'https://github.com/gilipersonal/mypaisaa-prediction/blob/{BRANCH}/'

def read(path):return json.loads(path.read_text())
def write(path,data):path.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()

lanes={n:read(BASE/'lanes'/f'{n}.json') for n in ['forecasting','platform','controls']}
gaps=[dict(g,lane=n,status='open_planning_contract',implementation_authorised=False) for n,d in lanes.items() for g in d['gaps']]
gaps.extend([
 {'id':'CD-01','title':'Freeze the canonical MP baseline and detailed story trace','lane':'coordinator','ma_concept':'One source per record, area specifications and a phase/story/design trace.','mp_evidence':'Ten phase drafts coexist with a historical six-phase implementation plan; 48 non-import stories are umbrella drafts.','disposition':'adapt_and_specify','recommendation':'Keep PH identifiers, assign one current authority and explicitly supersede bootstrap conflicts. Decompose every relevant acceptance into MP contracts/tests and actual Jira stories before UX starts; retain MA provenance without copying dates or permissions.','decision_needed':'Approve architecture baseline structure, epic crosswalk and story readiness protocol.','acceptance_criteria':['Record versioned requirements, ADRs, contracts, phase/story links and source dispositions; no local draft ID is presented as Jira.','All implementation stories have specific positive/negative acceptance, data/authority contracts, state inventory and dependency evidence before the UX gate.','Architecture, complete UX and explicit build permission have separate owner approvals.'],'phase':'PH-00','source_ids':['66065','197090','197133','1704017'],'research_urls':[],'status':'open_planning_contract','implementation_authorised':False},
 {'id':'CD-02','title':'Track rich-source limitations and MP visual evidence','lane':'coordinator','ma_concept':'Source design boards and native Lucid/static/motion explainers accompany architecture and phase records.','mp_evidence':'Current MA text and board references inspected; all native media/animation pixels have not been certified. MP has existing native Lucid and Site exports.','disposition':'adapt_and_specify','recommendation':'Maintain a separate evidence state for source text, board semantics and actual visual inspection. Reuse MP native diagrams as proposed, update only for selected architecture and preserve exact versions/hashes. Create MP UX after baseline approval, not copied MA boards.','decision_needed':'Approve required architecture/phase visual set and source-review boundaries.','acceptance_criteria':['Every significant component and interface has a readable technical view with native AWS components and trust boundaries.','Each visual records source, version, export hash and current/proposed status; reduced-motion/static alternatives retained.','Uninspected referenced material remains visible as a limitation; no complete visual-parity claim.'],'phase':'PH-00','source_ids':['1703977','294922','197153','197353','327919'],'research_urls':[],'status':'open_planning_contract','implementation_authorised':False}
])


# Expanded live issue concepts add scope decisions, not automatically adopted features.
extra=read(BASE/'source-issue-reconciliation.json')['additional_decisions']
for g in extra:
 gaps.append(dict(g,lane='coordinator',ma_concept='Relevant shared concept found in expanded live MA issue capture.',mp_evidence='source-issue-reconciliation.json; candidate scope, not an owner-approved feature.',disposition='explicit_scope_decision',phase=g['phase_ids'][0],source_ids=[],research_urls=[],status='open_planning_contract',implementation_authorised=False))


# Owner choices control active direction; research recommendations remain provenance.
selected_cards=[c for c in read(BASE/'decision-cards.json')['cards'] if c['owner_answer'] is not None]
for gap in gaps:
 gap['owner_directions']=[{'card_id':c['id'],'option_id':c['owner_answer']['option_id'],'meaning':c['owner_answer']['meaning']} for c in selected_cards if gap['id'] in c['gap_ids']]

group_specs=[
 ('data','MP-10','MP-4','Confirm data-use rights and affordable listing coverage',['FC-01']),
 ('identity','MP-11','MP-4','Settle managed identity, sessions and sensitive-action authentication',['PL-09','CT-01','CT-17']),
 ('persistence','MP-12','MP-4','Settle ledger, import and prediction write contracts',['PL-08','IR-02']),
 ('recovery','MP-13','MP-4','Settle retention, deletion, backup and restore evidence',['CT-04']),
 ('baseline',None,'MP-4','Freeze the researched architecture and phase/story baseline',['PL-01','CD-01','CD-02','IR-01']),
 ('science',None,'MP-6','Specify forecast tasks, scientific evaluation and model eligibility',[f'FC-{i:02}' for i in [2,3,4,5,6,7,8,9,14,15,16]]),
 ('portfolio',None,'MP-5','Specify performance, exposure and ranked investment decisions',['FC-10','FC-11','FC-12']),
 ('workflows',None,'MP-4','Choose durable workflows and define API queue replay semantics',['PL-04','PL-05','PL-06','CT-14']),
 ('ml-runtime',None,'MP-6','Select bounded AWS ML training and forecast serving architecture',['PL-07']),
 ('anthropic',None,'MP-7','Specify bounded Anthropic research tools batches and memory',['PL-02','PL-03','FC-13','CT-07','CT-08','CT-09','CT-15']),
 ('evals',None,'MP-7','Specify offline online and human-calibrated agent evaluations',['CT-10','CT-11','CT-12']),
 ('operations',None,'MP-4','Specify run evidence telemetry and conservative cost admission',['PL-12','PL-13','CT-05','CT-06','CT-13']),
 ('admin',None,'MP-4','Specify owner admin approvals audit and launch controls',['CT-02','CT-03','CT-16']),
 ('cloud',None,'MP-4','Choose MP environment region network and all-in cloud envelope',['PL-10']),
 ('delivery',None,'MP-9','Specify client compatibility release regression and alert delivery',['PL-11','PL-14','CT-18'])
]
receipt_path=BASE/'jira-receipt.json'
receipt=read(receipt_path) if receipt_path.exists() else {'issue':'MP-19','as_of':DATE,'status':'prepared_not_written','groups':[]}
actual={x['group_id']:x for x in receipt['groups']}
gap_lookup={x['id']:x for x in gaps}
assigned={}
groups=[]
for gid,key,parent,title,ids in group_specs:
 resolved=actual.get(gid,{}).get('jira_key',key)
 for ident in ids:
  if ident in assigned:raise ValueError(f'double allocation {ident}')
  assigned[ident]=gid
  gap_lookup[ident]['planning_group']=gid
  gap_lookup[ident]['jira_key']=resolved
 groups.append({'id':gid,'existing_jira_key':key,'jira_key':resolved,'parent':parent,'title':title,'gap_ids':ids,'action':'reuse_evidence_comment' if key else 'create_planning_task','implementation_authorised':False})
assert set(assigned)==set(gap_lookup)
write(BASE/'gap-register.json',{'as_of':DATE,'issue':'MP-19','status':'researched_proposals_not_owner_approved','gap_count':len(gaps),'gaps':gaps,'planning_groups':groups})

# All accessible page identities have an explicit disposition, independently of media review.
sources={}
for name,d in lanes.items():
 for s in d['sources']:sources[s['id']]=dict(s,lane=name)
coord=read(BASE/'lanes/coordinator-sources.json')
for s in coord:sources[s['id']]=dict(s,lane='coordinator')
idx=read(BASE/'ma-page-index.json')
exclude={'197058':'Generic how-to template has no product requirements.','197071':'Generic troubleshooting template has no product requirements.'}
reference={'1769513':'Retired Telegram journey is historical only; retain no Telegram runtime requirement.','327959':'Deposits/policies/whole-wealth accrual not MP scope; retain financial precision and currency concepts only.','66085':'Household debts/EMI workflows excluded; reuse only generic confirmation/notification safeguards.','66105':'Household spending budget is excluded; import confirmation/lineage concepts assessed separately.','197193':'Household net-worth projection is not an investment forecast; scenario distinctions retained.','295042':'Budget screen designs not copied; generic source-review states only.','66185':'Debt/whole-wealth screens not copied; investment identity/detail concepts retained.','1442122':'Whole-wealth domain scope excluded; generic confirm/correct/import/approval concepts retained.','1736705':'Household commitments excluded; contribution reminders and safe writes considered separately.'}
coverage=[]
for x in idx['results']:
 ident=x['content']['id']; s=sources[ident]
 related=[g['id'] for g in gaps if ident in g['source_ids']]
 if ident in exclude: disp='out_of_scope_template';why=exclude[ident]
 elif ident in reference:disp='adapt_shared_concepts_only';why=reference[ident]
 elif ident in ['197044','1703937','1671170','1703957','197112','197133','197153']:disp='reference_navigation_and_structure';why='Use as source map and documentation structure; no inherited dates, estimates, approval or implementation status.'
 else:disp='relevant_adapt';why='Reconcile relevant concepts against MP scope and researched gaps; do not adopt source choices by default.'
 coverage.append({'id':ident,'title':s['title'],'version':s['version'],'url':f'https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaaag/pages/{ident}','lane':s['lane'],'read_depth':s.get('read_depth'),'body_sha256':s.get('body_sha256') or s.get('html_sha256'),'disposition':disp,'reason':why,'gap_ids':related,'concepts':s.get('concepts',s.get('headings',[])[:12]),'visual_status':'native_pixels_not_comprehensively_verified','acceptance_parity':'concept_disposition_recorded; detailed target story acceptance remains a closure gate','limitations':s.get('limitations',[])})
write(BASE/'source-coverage.json',{'as_of':DATE,'page_count':len(coverage),'page_inventory_complete':len(coverage)==idx['totalSize'],'source_pages':coverage,'attachment_metadata':'ma-attachment-index.json','story_database':'ma-story-explorer.csv','scope_limit':'All indexed page identities disposed; no claim of full native visual or sentence-level acceptance parity.'})

# Compile existing detailed import stories and umbrella stories without claiming readiness.
old=read(OLD/'phase-story-map.json');portfolio=read(OLD/'portfolio-import-stories.json')
stories=[]
for s in old['stories']:
 stories.append({'id':s['id'],'title':s['title'],'phase_id':s['phase_id'],'acceptance':s['acceptance_criteria'],'contracts':[],'depends_on':s.get('depends_on',[]),'requirements':s.get('capability_ids',[]),'evidence':s.get('required_evidence',[]),'granularity':'umbrella_requires_decomposition','jira_key':None})
for s in portfolio['stories']:
 stories.append({'id':s['id'],'title':s['title'],'phase_id':s['phase'],'acceptance':[a['text'] for a in s['acceptance']],'contracts':s.get('contract_refs',[]),'depends_on':s.get('depends_on',[]),'requirements':s.get('decision_refs',[]),'evidence':s.get('example_refs',[]),'granularity':'detailed_draft_pending_decisions_and_UX','jira_key':None})
phases=old['phases']
areas={'PH-00':['A01','A02','A05','A09','A12'],'PH-01':['A03','A09','A11'],'PH-02':['A02','A07','A08','A10','A11'],'PH-03':['A03','A04','A07'],'PH-04':['A05','A08','A09'],'PH-05':['A06','A08','A09'],'PH-06':['A04','A05','A06','A09','A10','A12'],'PH-07':['A02','A07','A12'],'PH-08':['A08','A09','A10','A11','A12'],'PH-09':['A01','A04','A05','A06']}
contracts={'PH-00':['RequirementTrace','DecisionRecord','ArchitectureBaseline','StoryReadiness'],'PH-01':['ScopeEnvelope','InstrumentListing','InvestmentAccount','SourceDocument','ImportDraft','LedgerCommit','AuditEvent'],'PH-02':['IdentitySession','SensitiveAction','ApprovalRequest','JobRecord','OutboxEvent','RunRecord','CostReservation'],'PH-03':['SourceCapability','MarketObservation','FXObservation','PerformanceResult','ExposureSnapshot','BenchmarkComparison'],'PH-04':['ForecastTask','DatasetManifest','FeatureSetVersion','EvaluationRun','ModelVersion','Prediction','RealisedOutcome','PromotionDecision'],'PH-05':['AgentManifest','ToolContract','EvidenceBundle','ClaimReference','ConversationContext','BatchItem','EvalResult','EvalLabel','MemoryNote'],'PH-06':['DiscoveryResult','RecommendationPolicy','RankedAction','ForecastView','Briefing','NotificationIntent'],'PH-07':['NativeBridge','OfflineSnapshot','PushSubscription','DeepLink','ClientState'],'PH-08':['ReleaseEvidence','RecoveryExercise','IncidentRecord','ReplayRequest','DeletionTombstone'],'PH-09':['MarketProfile','InstrumentKind','ThemeMembership','PluginCompatibility','ExtensionApproval']}
epics={'PH-00':['MP-4'],'PH-01':['MP-5'],'PH-02':['MP-4'],'PH-03':['MP-5'],'PH-04':['MP-6'],'PH-05':['MP-7'],'PH-06':['MP-7'],'PH-07':['MP-8'],'PH-08':['MP-9'],'PH-09':['MP-9']}
(BASE/'phases').mkdir(exist_ok=True)
for p in phases:
 pid=p['id']; ss=sorted([s for s in stories if s['phase_id']==pid],key=lambda s:s['id']); relevant=[g for g in gaps if g['phase']==pid or (pid=='PH-00')]
 p.update({'architecture_areas':areas[pid],'contract_catalogue':contracts[pid],'story_ids':[s['id'] for s in ss],'gap_ids':[g['id'] for g in relevant],'existing_epic_crosswalk':epics[pid],'readiness':'blocked_on_architecture_and_UX','implementation_authorised':False})
 for s in ss:s.update({'gap_ids':p['gap_ids'],'implementation_authorised':False,'readiness':'blocked_on_architecture_and_UX'})
 lines=[f"# {pid} · {p['title']}",'', '**Planning specification · MP-19 · Proposed, not approved · No implementation authority**','', '## Outcome and scope','',*p['deliverables'],'',f"Architecture areas: {', '.join(areas[pid])}. Existing Jira epic crosswalk: {', '.join(epics[pid])}. These are historical epic containers, not newly created phase epics.",'','## Dependencies and readiness','',f"Planning dependencies: {', '.join(p.get('planning_dependencies',[])) or 'none'}. Implementation dependencies: {', '.join(p.get('implementation_dependencies',[])) or 'none'}. Every phase also requires architecture baseline, complete UX and explicit build permission.",'','The phase is blocked on architecture and UX. Its ordering does not permit implementation now. Native/web information contracts are specified together even where build work is grouped later.','', '## Contracts to settle','',*['- '+x for x in contracts[pid]],'', 'Each contract needs owner/producer/consumer, version, units, validation, positive/error schemas, idempotency, authorisation, retention and audit/cost effects. Names here are a catalogue, not implemented schemas.','','## Open closure packages','', '| Gap | Decision or contract | Planning issue |','| --- | --- | --- |']
 for g in relevant:lines.append(f"| {g['id']} | {g['title']} | {g.get('jira_key') or 'allocation pending'} |")
 lines+=['','## Story catalogue and planned acceptance','',f"{len(ss)} current local story drafts. An actual Jira implementation story and detailed readiness evidence are required before UX; the closure tickets above are planning work, not substitutes.",'']
 for s in ss:
  lines+=[f"### {s['id']} · {s['title']}",'',f"State: {s['granularity']}; actual implementation Jira key not allocated. Dependencies: {', '.join(s['depends_on']) or 'see phase gates'}.",'',*['- '+a for a in s['acceptance']],'',f"Contracts: {', '.join(s['contracts'] or contracts[pid])}. Evidence/examples: {', '.join(s['evidence']) or 'specific synthetic positive/negative/recovery examples required'}.",'']
 lines+=['## UX states to specify after architecture sign-off','', '- Success, empty, loading, partial and unavailable; stale source and insufficient evidence.','- Permission denied, fresh authentication required, approval pending/expired/rejected and conflicting revision.','- Offline/reconnecting, delayed job, retry exhausted, partial commit and safe recovery.','- Privacy mode, keyboard/screen reader, light/dark and reduced-motion equivalents on web and Apple.','','## Audit, monitoring and cost acceptance','', '- Record relevant actor/environment/business IDs, source/config/model versions and immutable approval/change/run evidence.','- Define signals for failure, lateness, duplicate handling, source age and reconciliation; redact private payloads from operational telemetry.','- Include source/provider, compute, storage, trace, retry and eval costs in the shared budget; no silent paid fallback.','','## Exit demonstration and failures','',p['exit_gate'],'', 'The planned exit demonstration must run the phase user journey plus one permission failure, one stale/partial data case, one duplicate/reconnect/retry case and one recovery path with evidence. Scientific phases additionally prove temporal/data maturity invariants; no invented live accuracy.','',f"Failure/recovery intent: {p['failure_or_rollback']}",'', 'No exit is currently certified. Deployment, live activation, model eligibility and owner approval are separate records.','','## Source and publication','', '[Current reconciliation](../reconciliation-report.md) · [Architecture decisions](../architecture-finalisation.md) · [Gap register](../gap-register.json) · [Documentation structure](../documentation-structure.md). This local page is a publication proposal, not a published Confluence page.']
 (BASE/'phases'/f'{pid}.md').write_text('\n'.join(lines)+'\n')
write(BASE/'phase-story-baseline.json',{'as_of':DATE,'status':'proposed_unapproved','implementation_authorised':False,'phases':phases,'stories':stories,'story_count':len(stories),'counts':{'detailed_import_drafts':len(portfolio['stories']),'umbrella_drafts':len(old['stories'])},'readiness_limit':'Detailed import drafts and 48 umbrellas are not certified ready; decompose/allocate target Jira stories before UX. Existing PH identifiers preserved.'})

# Bounded write proposal for tracker closure tasks.
payloads=[]
for group in groups:
 gs=[gap_lookup[i] for i in group['gap_ids']]
 body=['Planning outcome: '+group['title']+'.','', 'Research and specification only. MA concepts are reference; current MP owner decisions control. No application/infrastructure implementation, paid calls or automatic promotion.','', '## Decisions and acceptance']
 for g in gs:
  body += ['',f"### {g['id']} - {g['title']}",g['recommendation'],'Owner decision: '+g['decision_needed'],'',*['- '+a for a in g['acceptance_criteria']]]
 urls=sorted({u for g in gs for u in g['research_urls']})
 body += ['','## Evidence and completion','- Record the exact decision, contracts, positive/negative/recovery acceptance and owner answer; remain open if unresolved.','- Link MP-19 reconciliation, phase/story map and planned Confluence pages. No claim that a proposal is accepted or implemented.','- Architecture and detailed phase/story baseline precede UX; full UX and separate owner permission precede build.','',f"Local source: {GITHUB}docs/planning/ma-reconciliation-2026-11-02/gap-register.json",'Sources: '+', '.join(urls)]
 payloads.append(dict(group,description='\n'.join(body),labels=['planning','ma-reconciliation','architecture-baseline']))
write(BASE/'jira-write-proposal.json',{'issue':'MP-19','scope':'11 new planning tasks plus evidence comments on MP-10–MP-13; no status/description replacement or closure','groups':payloads})

# Rich Confluence bodies, exact targets, source hashes. No publisher/API writes.
md=MarkdownIt('commonmark',{'html':False}).enable('table')
publication=[]
docs=[('reconciliation-report.md','MP | MA concept reconciliation and researched gaps','4981438'),('architecture-finalisation.md','MP | Architecture finalisation and sign-off','5145394'),('documentation-structure.md','MP | Architecture areas and phase documentation contract','4981438')]
docs += [(f'phases/{p["id"]}.md',f'MP | {p["id"]} | {p["title"]}','5014255') for p in phases]
(BASE/'confluence').mkdir(exist_ok=True)
if not (BASE/'confluence-publication-proposal.json').exists():write(BASE/'confluence-publication-proposal.json',{'status':'preparing_not_published','pages':[]})
for filename,title,parent in docs:
 path=BASE/filename
 if not path.exists():continue
 body=md.render(path.read_text().split('\n',1)[1])
 body=body.replace('<th>','<th data-background="#DEEBFF">').replace('<table>','<table data-layout="wide">')
 def link(m):
  target=html.unescape(m[1]);
  if target.startswith(('https://','http://','#')):return m[0]
  file=(path.parent/target.split('#',1)[0]).resolve()
  if not file.is_relative_to(ROOT) or not file.exists():raise ValueError(f'Broken link {path}:{target}')
  return 'href="'+GITHUB+html.escape(str(file.relative_to(ROOT)))+'"'
 body=re.sub('href="([^"]+)"',link,body)
 panel='<div data-type="panel-warning"><p><span data-type="status" data-color="yellow">PLANNING PROPOSAL</span> MP-19 · <time datetime="2026-11-02">2 November 2026</time>. Architecture and UX unapproved; no implementation authority. MA concepts researched, not copied. Independent review not run.</p></div>'
 output=BASE/'confluence'/(Path(filename).stem+'.html');output.write_text(panel+body)
 publication.append({'title':title,'action':'create_only_if_exact_title_absent','space_key':'mypaisaapr','parent_id':parent,'local_source':filename,'source_sha256':digest(path),'body_file':str(output.relative_to(BASE)),'body_sha256':digest(output),'content_id':None,'status':'prepared_not_published'})
write(BASE/'confluence-publication-proposal.json',{'issue':'MP-19','status':'prepared_not_published','snapshot_role':'prepublication_source_payloads','actual_publication_receipt':'confluence-publication-receipt.json','space':'mypaisaapr','scope':'13 substantive new reading pages under existing MP hubs; no move/delete/replacement/attachment/sharing changes. Recheck exact-title collisions and parent versions at publication.','pages':publication,'existing_page_updates':[],'review':'not_run','independent_review_required_choice':'Ask owner at end; this generator does not authorise or run review.'})
print(json.dumps({'pages':len(coverage),'gaps':len(gaps),'planning_groups':len(groups),'phases':len(phases),'local_stories':len(stories),'publication_bodies':len(publication)}))
