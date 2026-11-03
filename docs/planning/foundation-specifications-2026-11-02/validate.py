"""Offline foundation document/schema/example checks, not backend acceptance tests.

Reproduce with: uv run --no-project --with jsonschema==4.25.1 python <this file>
No network/service, training, deployment or real review-ledger operation is performed.
"""
from __future__ import annotations
import copy
import datetime as dt
import hashlib
import io
import json
import re
import runpy
import subprocess
from contextlib import redirect_stdout
from decimal import Decimal as D
from fractions import Fraction as F
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[2]
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def unique(xs):assert len(xs)==len(set(xs)), 'duplicate IDs'

checker=FormatChecker()
@checker.checks('date-time',raises=(ValueError,TypeError))
def aware_time(value):
 if not isinstance(value,str):return True
 if not re.fullmatch(r'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)',value):return False
 if value.endswith('-00:00'):return False
 parsed=dt.datetime.fromisoformat(value.replace('Z','+00:00'))
 return parsed.tzinfo is not None and parsed.utcoffset() is not None
@checker.checks('date',raises=(ValueError,TypeError))
def valid_date(value):
 if not isinstance(value,str):return True
 return re.fullmatch(r'\d{4}-\d{2}-\d{2}',value) is not None and dt.date.fromisoformat(value) is not None

for bad in ['not-a-time','2026-11-02T10:00:00','2026-02-30T10:00:00Z']:
 assert not checker.conforms(bad,'date-time')
assert checker.conforms('2026-11-02T10:00:00Z','date-time')
files=list(BASE.rglob('*.json'))
for p in files:read(p)
source=read(BASE/'source-pins.json')
for row in source['source_files']:
 data=subprocess.check_output(['git','show',source['source_head']+':'+row['path']],cwd=ROOT)
 assert hashlib.sha256(data).hexdigest()==row['sha256']
choices=read(BASE/'selected-directions.json')
assert len(choices['directions'])==12 and not choices['implementation_authorised']
def _signed():
 import json as _j
 so=_j.loads((Path(__file__).resolve().parents[1]/'baseline-signoff-2026-11-03'/'signoff.json').read_text()).get('signed_off') or {}
 return bool(__import__('re').fullmatch(r'[0-9a-f]{40}',str(so.get('commit',''))) and str(so.get('owner_words','')).strip())
owner=read(BASE/'owner-decisions.json');assert not owner['implementation_authorised'];assert not owner['architecture_baseline_approved'] or _signed(), 'baseline approved without a signed sign-off record'
assert {d['id'] for d in owner['decisions']}=={'FND-DEC-001','FND-DEC-002'}

schema_counts={};schema_sources={}
for name,file in [('data','contracts.json'),('financial','contracts.schema.json'),('forecasting','contracts.schema.json')]:
 s=read(BASE/name/file);Draft202012Validator.check_schema(s);schema_sources[name]=s
 def check_refs(x):
  if isinstance(x,dict):
   if '$ref' in x:
    assert x['$ref'].startswith('#/$defs/'), 'external ref is not resolved by this offline checker'
    assert x['$ref'].split('/')[-1] in s['$defs']
   for v in x.values():check_refs(v)
  elif isinstance(x,list):
   for v in x:check_refs(v)
 check_refs(s)
 schema_counts[name]=len(s['$defs'])

def validator(area,name):
 s=schema_sources[area]
 return Draft202012Validator({'$schema':s['$schema'],'$defs':s['$defs'],'$ref':'#/$defs/'+name},format_checker=checker)

fin=read(BASE/'financial/contract-examples.json');assert len(fin['records'])==21
fin_catalogue=read(BASE/'financial/contract-catalogue.json')['contracts']
assert {row['contract_ref'] for row in fin['records']}=={row['id'] for row in fin_catalogue}
for row in fin['records']:
 validator('financial',row['schema']).validate(row['value'])
 if row['contract_ref']=='FIN-12':validator('financial','OutboxRecord').validate(row['value'])
sci=read(BASE/'forecasting/contract-examples.json');assert len(sci['records'])==7
for name,value in sci['records'].items():
 validator('forecasting',name).validate(value)
 Draft202012Validator(schema_sources['forecasting'],format_checker=checker).validate(value)
bad=copy.deepcopy(sci['records']['Prediction']);bad['issued_at']='not-a-time';assert not validator('forecasting','Prediction').is_valid(bad)
for value in ['0.70','-0.10']:validator('forecasting','Decimal').validate(value)
for value in ['NaN','Infinity','1e3','01','--1']:assert not validator('forecasting','Decimal').is_valid(value)
for value in [1.5,'NaN']:
 bad={'amount':value,'currency':'GBP','quality':'booked','source_literal':None}
 assert not validator('financial','Money').is_valid(bad)

# Source lane checker recomputes dimensions/quotas/108 run rates and216 cash timings.
with redirect_stdout(io.StringIO()) as captured:runpy.run_path(str(BASE/'costs/validate_specifications.py'),run_name='__main__')
data_cost_report=json.loads(captured.getvalue())
assert data_cost_report['status']=='passed' and data_cost_report['run_rate_variants']==108 and data_cost_report['cash_variants']==216
# Explicit date/time validation additionally covers all data examples.
dex=read(BASE/'data/examples.json');dc=read(BASE/'data/catalogue.json')
data_record_count=0
for name,rows in [('Observation',dex['observations']),('Listing',dc['listings']),('SourceCapability',dex['capabilities']),('CorporateAction',dex['corporate_actions'])]:
 for row in rows:validator('data',name).validate(row)
 data_record_count+=len(rows)

# Focused document proofs for round-1 timing fixes; not model/live acceptance.
with redirect_stdout(io.StringIO()):
 timing=runpy.run_path(str(BASE/'forecasting/timing_checks.py'))
 daily_timing_cases=timing['verify_daily_origin_clock_contract']()
 event_timing_cases=timing['verify_event_availability_contract']()
assert daily_timing_cases==6 and event_timing_cases==9


# Actual computed synthetic leaf-to-root graph, separate from placeholder wire examples.
proof=runpy.run_path(str(BASE/'financial/verify_hash_contract.py'))['check']()
assert proof['status']=='passed' and proof['leaf_mutation_changes_root'] and proof['delivery_failure_retry_success_preserve_root']
graph=read(BASE/'financial/hash-graph-example.json')
hash_graph_record_count=0
for leaf in graph['leaves']:
 validator('financial',leaf['record_type']).validate(leaf['value'])
 hash_graph_record_count+=1
for key,name in [('chunk_contents','ChunkContent'),('chunk_receipts','ChunkReceipt'),('pages','ManifestPage'),('delivery_states','DeliveryState'),('delivery_attempts','DeliveryAttempt')]:
 for record in graph[key]:
  validator('financial',name).validate(record)
  hash_graph_record_count+=1
for key,name in [('manifest','CommitManifest'),('publication_pointer','PublicationPointer')]:
 validator('financial',name).validate(graph[key])
 hash_graph_record_count+=1

# Independent known-answer arithmetic: these do not fit a model or implement a solver.
financial={x['id']:x for x in read(BASE/'financial/worked-examples.json')['examples']}
assert len(financial)==15
f=lambda n:financial['FIN-EX-'+str(n).zfill(2)]
assert F(-100)+F(110)/(1+F('.10'))==0
for rate in [F('.10'),F('.20')]:assert F(-100)+F(230)/(1+rate)-F(132)/(1+rate)**2==0
assert (dt.date(2026,1,1)-dt.date(2025,1,1)).days==365
assert F(1000)-201+8-3==F(f(3)['expected']['cash_GBP'])
assert F(f(3)['expected']['cash_GBP'])+2*110==F(f(3)['expected']['NAV_GBP'])
assert F(1024,1000)-1==F(f(3)['expected']['portfolio_XIRR'])
assert -(2*F(12000)*F('.01')+1)==F(f(5)['expected']['cash_delta_GBP'])
assert F('1.1')*F('.9375')-1==F(f(6)['expected']['GBP_return'])
assert F('1.1')*F('.9')-1==F(f(12)['expected']['TWR'])
assert 1-F(99,110)==F(f(12)['expected']['maximum_drawdown'])
assert (F(100,100)+F(110,110))*121==F(f(13)['expected']['benchmark_terminal_value_GBP'])
assert F('.55')**2+F('.35')**2==F(f(14)['expected']['known_only_HHI'])
assert F('.35')*80+F('.40')*70+F('.25')*60==71

golden={x['id']:x for x in read(BASE/'forecasting/golden-examples.json')['examples']};assert len(golden)==15
for x in golden.values():assert x['is_synthetic'] and not x['amounts_are_observed'] and not x['real_holdings']
g=lambda n:golden['SCI-G'+str(n).zfill(2)]
path=[D(x) for x in g(1)['inputs']['wealth_path']];peak=path[0];mdd=D(0)
for x in path:peak=max(peak,x);mdd=max(mdd,1-x/peak)
assert mdd==D(g(1)['expected']['maximum_drawdown_daily_path'])
assert path[-1]/path[0]-1==D(g(1)['expected']['terminal_return'])
assert max(D(0),1-min(path)/path[0])==D(g(1)['expected']['origin_adverse_excursion'])
assert D('110')*D('.72')/(D('100')*D('.80'))-1==D(g(2)['expected']['GBP_return'])
assert D(50)*2/100-1==D(g(3)['expected']['terminal_return'])
assert (D(98)+2)/100-1==D(g(4)['expected']['gross_total_return'])
assert D(11000)/100/(D(10000)/100)-1==D(g(5)['expected']['terminal_return'])
assert D('.70')**2==D(g(12)['expected']['first_Brier'])
assert (D('.70')-1)**2==D(g(12)['expected']['corrected_Brier'])
assert D('.02')-D('.03')==D(g(15)['expected']['excess_return'])

tasks=read(BASE/'forecasting/task-catalogue.json');assert len(tasks['horizons'])==7
assert {h['value'] for h in tasks['horizons'] if h['unit']=='valuation_session'}=={1,5,10,20}
assert {h['value'] for h in tasks['horizons'] if h['unit']=='calendar_month'}=={3,6,12}
assert all('FND-DEC-002' in h['convention_status'] for h in tasks['horizons'] if h['unit']=='calendar_month')
protocol=read(BASE/'forecasting/evaluation-protocol.json');caps=protocol['search_caps'];resources=protocol['resource_caps_proposed']
assert caps['max_learned_fits_per_campaign_including_all_stages']==96 and caps['max_learned_fits_per_month_across_dev_prod']==192
assert caps['campaigns_per_month']==2
assert resources['maximum_vcpu_hours_per_month']==24 and resources['max_billable_instance_hours_per_campaign']==6
assert resources['actual_billable_instance_memory_GiB']==8
model=read(BASE/'costs/model.json');assert model['budget_verdict']['verdict']=='CONDITIONAL_UNPROVEN'
assert model['assumptions']['unknown_shared_anthropic_credit_admissible_usd']==0
assert model['assumptions']['free_tier_deduction']==0
assert model['assumptions']['baseline_training_instance_hours_dev_plus_prod']==12
fixed=read(BASE/'fixed-policies.json')
assert fixed['cost_collection']['billing_collection_hours']=={'AWS':24,'Anthropic':6}
assert model['assumptions']['billing_collection_hours']==fixed['cost_collection']['billing_collection_hours']
# MP-34 removed the prepared Confluence publication bodies and their proposal; git history keeps them.


contracts={r['id'] for r in read(BASE/'financial/contract-catalogue.json')['contracts']}
fac=read(BASE/'financial/acceptance.json');sac=read(BASE/'forecasting/acceptance-cases.json')
for row in fac['cases']:
 assert set(row['contract_refs'])<=contracts
 assert set(row['example_refs'])<=set(financial)
assert len(fac['cases'])==30 and len(fac['baseline_story_coverage'])==16 and all(fac['baseline_story_coverage'].values())
assert len(sac['cases'])==17
for rows in [fac['cases'],sac['cases'],read(BASE/'data/acceptance.json')['cases'],read(BASE/'costs/acceptance.json')['cases']]:unique([r['id'] for r in rows])
# Lane hashes are maker provenance; verify no integration edit left stale companion receipts.
for area,key in [('financial','artifact_hashes'),('forecasting','artifact_sha256')]:
 for name,value in read(BASE/area/'maker-checks.json')[key].items():assert sha(BASE/area/name)==value,(area,name)
for p in BASE.rglob('*.md'):
 for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',p.read_text()):
  if target.startswith(('http:','https:','#')):continue
  assert (p.parent/target.split('#',1)[0]).resolve().exists(),(p,target)
report={'status':'maker_document_checks_passed','schema_definitions':schema_counts,'validated_positive_wire_records':data_record_count+len(fin['records'])+len(sci['records']),'financial_worked_examples':15,'forecast_worked_examples':15,'financial_acceptance_cases':30,'forecast_acceptance_cases':17,'data_acceptance_cases':len(read(BASE/'data/acceptance.json')['cases']),'cost_acceptance_cases':len(read(BASE/'costs/acceptance.json')['cases']),'cost_run_rate_variants':108,'cost_cash_variants':216,'computed_hash_graph_records':hash_graph_record_count,'acyclic_hash_delivery_proof':proof['status'],'daily_clock_proofs':daily_timing_cases,'event_availability_proofs':event_timing_cases,'owner_detail_decisions':2,'source_pr9_head':source['source_head'],'budget_status':model['budget_verdict']['verdict'],'architecture_baseline_approved':owner['architecture_baseline_approved'],'UX_authorised':False,'implementation_authorised':False,'independent_review':read(BASE/'work-state.json')['independent_review'],'live_provider_model_AWS_calls':False,'limitations':['Shape/math/provenance checks only; planned backend/live acceptance not executed.','No model fit, backtest, solver implementation, cloud proof or licence approval.','No complete architecture/UX readiness from these checks.']}
(BASE/'validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
