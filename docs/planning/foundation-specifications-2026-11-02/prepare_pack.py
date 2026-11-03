"""Prepare local pack indexes and coverage; never contacts external services."""
from __future__ import annotations
import hashlib
import json
import re
import subprocess
from pathlib import Path

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[2]
def read(p):return json.loads(p.read_text())
def write(p,d):p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()

work_state=read(BASE/'work-state.json')
review_status=work_state['independent_review']
owners=read(BASE/'owner-decisions.json')
fin=read(BASE/'financial/open-decisions.json')['decisions']
sci=read(BASE/'forecasting/open-decisions.json')['material_choices']
data=read(BASE/'data/catalogue.json')['owner_decisions']
lines=['# Proposed policy bundles and evidence still needed','','**MP-20 · Consolidated 3 Nov 2026 · Owner answers since 2 Nov are folded in; the decision log is the authority**','','The source twelve directions are fixed constraints. This register separates confirmed intent, policy proposals and proof gaps. It is not a request to approve every field separately; the owner can assess a readable coherent baseline once engineering defaults and their consequences are presented. Material changes or conflicts return as concise choices.','','## Confirmed during this package','']
for d in owners['decisions']:lines+=['- **'+d['id']+':** '+d['answer']+'. '+d['meaning']]
lines+=['','## Owner answers since this pack was written','','The [decision log](../ma-reconciliation-2026-11-02/decision-log.md) is the authority. None of these approves the architecture baseline, UX or implementation.','']
for a in owners.get('later_owner_answers',{}).get('answers',[]):lines+=['- **'+a['date']+':** '+a['summary']]
lines+=['','## Policy bundles for the baseline decision','','| Group | Current proposal | Consequence/evidence |','| --- | --- | --- |']
for d in fin:
 lines.append('| '+d['id']+' · '+d['topic']+' | '+str(d['proposal']).replace('|','/')+' | '+str(d['consequence_if_unresolved']).replace('|','/')+' |')
for d in sci:
 lines.append('| '+d['id']+' · '+d['topic']+' | '+str(d['recommendation']).replace('|','/')+' | '+str(d['why_owner_material']).replace('|','/')+' |')
lines+=['','The exact trial counts, solver limits, numeric tolerances, availability windows, case thresholds, initial model/feature inventory and recovery authority are proposals; reference research supports methods, not automatic MP empirical qualification. Application runtime guards and numerical performance remain independent evidence tracks.','','## External/deferred proof gates','',
'- **Provider plan and rights:** the owner selected Twelve Data Grow 55 ($29 a month) for prod and Basic for dev, with Yahoo Finance kept, for personal hobby use, and accepted the published-terms risk (OWNER-RISK-01, 2 Nov). All 54 use-right cells in the representative nine-row matrix stay unknown; the acceptance is a risk record, not vendor evidence. Sending provider values to Anthropic (DATA-DEC-12) and holding a Basic account beside a paid Grow account (DATA-DEC-14) remain open.',
'- **Tax/FX/payment:** the central £0.80/USD and20% tax are scenario assumptions, not a live exchange quote or invoice determination. Adverse/no-tax sensitivities are not permission to choose a favourable assumption.',
'- **Actual Claude credit:** user-reported shared $200 is unknown and counted once. No verified allocation means uncovered calls are refused, not paid. The full-function no-credit row is a counterfactual funding requirement, not an executable plan.',
'- **Whole-system fit:** with Virginia and Grow 55, the ordinary month is about £46.48 with Claude off and £54.73 with Claude option A, plus up to £5 for the top-5 scan; every ordinary month sits under the £70 operation plan. The domain is renewed outside MP, so there is no domain invoice month. The only month over the £100 ceiling is the owner-allowed Apple fee exception, about £141.52 or £149.77, and only if the owner joins the Developer Program. Keep the £100 ceiling and £30 reserve. Exchange/add-on/SMS and material network/hosting changes remain unpriced and require recosting.',
'- **Region/account/runtime/workload:** the owner selected Virginia (us-east-1) on 2 Nov. Public prices still do not certify actual account/tier/rollout, quotas, memory/artefact compatibility, end-to-end streaming, concurrency or training duration.',
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

# MP-34 removed the Confluence publication bodies and cost chart this script used to prepare.
print(json.dumps({'planned_acceptance':sum(v for k,v in counts.items() if 'acceptance' in k),'source_gaps_referenced':sum(bool(g['referenced_in_areas']) for g in source_gaps),'source_gaps_closed':0}))
