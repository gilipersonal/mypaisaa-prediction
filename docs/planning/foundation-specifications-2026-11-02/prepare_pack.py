"""Prepare local pack indexes/coverage/reading bodies; never contacts external services."""
from __future__ import annotations
import hashlib
import html
import json
import re
import subprocess
from pathlib import Path
from markdown_it import MarkdownIt

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[2]
BRANCH='MP-20-foundation-specifications'
URL=f'https://github.com/gilipersonal/mypaisaa-prediction/blob/{BRANCH}/'
def read(p):return json.loads(p.read_text())
def write(p,d):p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()

work_state=read(BASE/'work-state.json')
review_status=work_state['independent_review']
review_notice='Independent review round 1 found five specification blockers. Fixes are maker-checked; independent verification of the fixes requires separately approved round 2.'
owners=read(BASE/'owner-decisions.json')
fin=read(BASE/'financial/open-decisions.json')['decisions']
sci=read(BASE/'forecasting/open-decisions.json')['material_choices']
data=read(BASE/'data/catalogue.json')['owner_decisions']
lines=['# Proposed policy bundles and evidence still needed','','**MP-20 · Maker draft · Only the two foundation horizon replies are newly owner-confirmed**','','The source twelve directions are fixed constraints. This register separates confirmed intent, policy proposals and proof gaps. It is not a request to approve every field separately; the owner can assess a readable coherent baseline once engineering defaults and their consequences are presented. Material changes or conflicts return as concise choices.','','## Confirmed during this package','']
for d in owners['decisions']:lines+=['- **'+d['id']+':** '+d['answer']+'. '+d['meaning']]
lines+=['','## Policy bundles for the baseline decision','','| Group | Current proposal | Consequence/evidence |','| --- | --- | --- |']
for d in fin:
 lines.append('| '+d['id']+' · '+d['topic']+' | '+str(d['proposal']).replace('|','/')+' | '+str(d['consequence_if_unresolved']).replace('|','/')+' |')
for d in sci:
 lines.append('| '+d['id']+' · '+d['topic']+' | '+str(d['recommendation']).replace('|','/')+' | '+str(d['why_owner_material']).replace('|','/')+' |')
lines+=['','The exact trial counts, solver limits, numeric tolerances, availability windows, case thresholds, initial model/feature inventory and recovery authority are proposals; reference research supports methods, not automatic MP empirical qualification. Application runtime guards and numerical performance remain independent evidence tracks.','','## External/deferred proof gates','',
'- **Current provider price and rights:** reconcile displayed Grow377 $79 and support-reported Grow55 $29, including term/current availability and every intended use/listing. All54 use-right cells in the representative nine-row matrix remain unverified. Basic dev coverage/rights and any retained/derived data or transmission to Anthropic need their own evidence.',
'- **Tax/FX/payment:** the central £0.80/USD and20% tax are scenario assumptions, not a live exchange quote or invoice determination. Adverse/no-tax sensitivities are not permission to choose a favourable assumption.',
'- **Actual Claude credit:** user-reported shared $200 is unknown and counted once. No verified allocation means uncovered calls are refused, not paid. The full-function no-credit row is a counterfactual funding requirement, not an executable plan.',
'- **Whole-system fit:** the Virginia displayed-tier blocked-Claude run rate is about£95.68, above the£70 operation plan. Its annual domain invoice month requires about£108.88 cash, above the£100 ceiling; ordinary/invoice timing must be admitted separately. Conditional lower-tier arithmetic is not a feasible licensed source proof. Keep the£100 ceiling and£30 reserve. Apple membership, exchange/add-on/SMS and material network/hosting changes remain unselected/unpriced and require recosting.',
'- **Region/account/runtime/workload:** public prices do not certify actual account/tier/rollout, quotas, memory/artefact compatibility, end-to-end streaming, concurrency, training duration or region suitability. No region is selected by the lowest illustrative total.',
'- **Real inputs:** owner holdings/listings and samples arrive progressively. They do not block this synthetic specification draft; live capability/layout/forecast eligibility requires their later evidence.',
'- **Source-side withdrawal/deletion:** specify effects on archives, derivative datasets, features, models, labels, backups and retained audit evidence before accepting the detailed privacy/recovery baseline.',
'','## Cross-lane decision joins','',
'- DATA acquisition start/retry, SCI frozen cutoff and issuance deadline are separate clocks. Positive collection latency must fit before cutoff; late data cannot be backdated. Pre-release schedule-only, subsequent-daily-origin post-release features and descriptive prior-close event studies remain distinct.',
'- FIN analytical/FX/benchmark conventions and SCI target contracts must agree before combining scores; cost-basis loss, MDD, MAE, terminal loss and preference ranks remain distinct.',
'- FIN sealed event intents use stable IDs and acyclic content projections; delivery state/attempts are outside the immutable hash graph.',
'- FIN approval lifetime is currently proposed at trusted-writer transaction submission; strict completion-before-expiry is not a proven DynamoDB server-clock predicate.',
'- SCI campaign/fit/CPU caps are subordinate to shared cost admission. Proposed internal money allocations are ceilings, not independent spendable pots or automatic permission to use cash for uncovered calls.',
'','[Financial choices](financial/open-decisions.json) · [Scientific choices](forecasting/open-decisions.json) · [Data capability proposals](data/catalogue.json) · [Quantitative cost model](costs/model.json)']
text='\n'.join(lines)+'\n'
for a,b in [('All54','All 54'),('and20%','and 20%'),('about£95.68','about £95.68'),('the£70','the £70'),('the£100','the £100'),('and£30','and £30')]:text=text.replace(a,b)
(BASE/'policy-evidence-register.md').write_text(text)

source=read(BASE/'source-pins.json');old=json.loads(subprocess.check_output(['git','show',source['source_head']+':docs/planning/ma-reconciliation-2026-11-02/gap-register.json'],cwd=ROOT,text=True))
area_files={area:[str(p.relative_to(BASE)) for p in sorted((BASE/area).iterdir()) if p.is_file()] for area in ['data','costs','financial','forecasting']}
refs={}
for area,files in area_files.items():
 content='\n'.join((BASE/f).read_text(errors='replace') for f in files if Path(f).suffix in ['.json','.md'])
 refs[area]=set(re.findall(r'\b(?:FC|PL|CT|CD|IR)-\d{2}\b',content))
source_gaps=[]
for g in old['gaps']:
 areas=[a for a,x in refs.items() if g['id'] in x]
 source_gaps.append({'source_gap':g['id'],'planning_issue':g['jira_key'],'referenced_in_areas':areas,'status':'proposed_contract_detail_present_approval_or_proof_pending' if areas else 'outside_pack1_or_consolidation_followup','closed':False})
counts={'financial_worked_examples':15,'scientific_worked_examples':15,'data_acceptance':len(read(BASE/'data/acceptance.json')['cases']),'cost_acceptance':len(read(BASE/'costs/acceptance.json')['cases']),'financial_acceptance':len(read(BASE/'financial/acceptance.json')['cases']),'scientific_acceptance':len(read(BASE/'forecasting/acceptance-cases.json')['cases'])}
write(BASE/'coverage.json',{'date':'2026-11-02','primary_issue':'MP-20','source_pr9_head':source['source_head'],'implementation_authorised':False,'independent_review':review_status,'scope':'Reference presence and proposed contract trace; not acceptance completion or source-gap closure.','areas':area_files,'counts':counts,'planned_acceptance_total':sum(v for k,v in counts.items() if 'acceptance' in k),'source_gaps':source_gaps,'all_source_gaps_still_open':True,'story_limit':'Thirty financial cases reference all 16 prior L1 drafts; actual implementation Jira keys/complete phase exits remain future readiness work.'})

# Local rich reading/publication proposal. IDs resolve only after separately approved writes.
md=MarkdownIt('commonmark',{'html':False}).enable('table')
docs=[('README.md','DRAFT | MP | Foundation Specification Pack1','4981438'),('data/specification.md','DRAFT | MP | A04 source capabilities and acquisition contracts','5145394'),('financial/specification.md','DRAFT | MP | A03 ledger and financial calculation contracts','5145394'),('forecasting/forecasting-specification.md','DRAFT | MP | A05 forecasting tasks and qualification contracts','5145394'),('costs/specification.md','DRAFT | MP | A10 foundation cost feasibility and reservations','5145394')]
out=BASE/'publication';out.mkdir(exist_ok=True);pages=[]
if not (BASE/'publication-proposal.json').exists():write(BASE/'publication-proposal.json',{'status':'preparing_not_published','pages':[]})
for index,(file,title,parent) in enumerate(docs):
 path=BASE/file;body=md.render(path.read_text().split('\n',1)[1]);body=body.replace('<th>','<th data-background="#DEEBFF">').replace('<table>','<table data-layout="wide">')
 def link(m):
  href=html.unescape(m[1])
  if href.startswith(('http:','https:','#')):return m[0]
  target=(path.parent/href.split('#',1)[0]).resolve()
  if not target.is_relative_to(ROOT) or not target.exists():raise ValueError(f'Broken proposal link {file}:{href}')
  return 'href="'+URL+html.escape(str(target.relative_to(ROOT)))+'"'
 body=re.sub(r'href="([^"]+)"',link,body)
 body=re.sub(r'<img src="[^"]*cost-scenarios.png"[^>]*>', '<p><code>FOUNDATION-COST-FIGURE</code> Illustrative cost chart requires the named separately approved native attachment.</p>',body)
 banner='<div data-type="panel-warning"><p><span data-type="status" data-color="yellow">PLANNING DRAFT</span> MP-20 Foundation Pack 1. Architecture baseline unapproved; no UX or implementation. '+review_notice+' Budget status conditional/unproven.</p></div>'
 context='<div data-type="panel-info"><p>Owner-confirmed detail: next-day plus 5/10/20 trading-day points; 3/6/12 calendar-month anniversaries roll to a preceding valid local session/valuation date. Canonical-value availability controls scoring. Exact daily tolerances and policy parameters remain proposed. The source twelve directions are in the existing MP-19 planning index.</p></div>'
 body=banner+context+body;target=out/(str(index+1).zfill(2)+'.html');target.write_text(body)
 assert not any(x in body for x in ['<ac:','<ri:','file:///','<html','<body'])
 pages.append({'title':title,'parent_id':parent,'space':'mypaisaapr','source':file,'source_sha256':digest(path),'body':str(target.relative_to(BASE)),'body_sha256':digest(target),'content_id':None,'status':'prepared_not_published'})
asset=BASE/'costs/cost-scenarios.png'
write(BASE/'publication-proposal.json',{'status':'prepared_not_published','pages':pages,'new_pages':5,'attachments_proposed':[{'source':str(asset.relative_to(BASE)),'bytes':asset.stat().st_size,'sha256':digest(asset),'target_page':'Foundation Specification Pack1 index','marker':'FOUNDATION-COST-FIGURE','status':'not_uploaded'}],'existing_page_edits':[],'permission':'No Confluence/Site/Lucid write or sharing change authorised. Before publication recheck actual MP space instructions, parents and collisions, obtain exact scope approval, resolve marker with real returned media IDs, then read back.','limitations':'These are local rich reading proposals; native architecture diagram changes and scientific/backend/live proof are not performed.'})
print(json.dumps({'planned_reading_pages':len(pages),'planned_acceptance':sum(v for k,v in counts.items() if 'acceptance' in k),'source_gaps_referenced':sum(bool(g['referenced_in_areas']) for g in source_gaps),'source_gaps_closed':0}))
