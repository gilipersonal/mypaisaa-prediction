"""Prepare the authorised 13-page publication; no external writes.

Uses existing HTML proposals plus the current owner decision register.
"""
from __future__ import annotations
import hashlib
import html
import json
import re
from html.parser import HTMLParser
from pathlib import Path

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[2]
GITHUB='https://github.com/gilipersonal/mypaisaa-prediction/blob/MP-19-ma-planning-reconciliation/'
PACK='docs/planning/ma-reconciliation-2026-11-02/'
OWNER_HASH=hashlib.sha256((BASE/'owner-decisions.json').read_bytes()).hexdigest()

def read(p):return json.loads(p.read_text())
def sha(s):return hashlib.sha256(s.encode()).hexdigest()
def esc(s):return html.escape(str(s),quote=True)

CHOICES={
 'ARC-01':('A','Yahoo Finance + Twelve Data Grow preferred candidates; Basic/Free for dev alongside synthetic fixtures. Verify each listing/use, rights and cost. Basic currently has8credits/minute and800weightedcredits/day, reset00:00UTC.'),
 'ARC-02':('A','DynamoDB + private encrypted S3, with one controlled backend service for owner-confirmed financial ledger changes.'),
 'ARC-03':('B','Python Lambda Durable Functions is primary. FastAPI runs on ordinary API Lambdas. No Step Functions in the initial direction; SQS buffers work and EventBridge Scheduler supplies clocks.'),
 'ARC-04':('A','Capped on-demand SageMaker CPU training/evaluation; approved portable S3 artefacts used for Lambda inference where compatible; store daily forecasts. No always-on endpoint by default.'),
 'ARC-05':('A','Baselines first, then bounded challengers. Additional news, pattern, analog/event and LLM-derived factors must demonstrate incremental value. All agreed horizons/capabilities remain.'),
 'ARC-06':('B','Separate Lambda workers per Claude task route with distinct permissions/context/tools/budgets/evals, sharing one versioned bounded Anthropic client-SDK runner. Claude runs on Anthropic.'),
 'ARC-07':('A','Server-verified Cognito authentication assurance/freshness for sensitive actions, with verified fresh-sign-in fallback meeting the same action policy. Bind approvals to owner, environment, exact action/payload/version and expiry.'),
 'ARC-08':('B','Specify all identified admin domains now; design their complete journeys after architecture agreement and before the first application build. Implementation may be phased.'),
 'ARC-09':('A','Inspect AI + typed MP-specific deterministic checks for agent evaluation. Runtime guards, pytest and numerical forecast validation retain distinct roles.'),
 'ARC-10':('A','Static interactive SvelteKit PWA shell/assets on S3/CloudFront with authenticated FastAPI. No separate SvelteKit SSR runtime selected; Swift/SwiftUI within the RN shell remains.'),
 'ARC-11':('B','Separate dev/prod AWS workload accounts under consolidated billing. One aggregate £100/month all-in envelope: £70 operation + £30 reserve; no multiplication of free tiers or provider credits.'),
 'ARC-12':('A','Central architecture-area specifications and shared decisions/contracts linked to one page per MP phase and individual source/contract/acceptance-test/UX-traced Jira stories.')}
CHOICES={k:(a,t.replace('has8credits/minute and800weightedcredits/day, reset00:00UTC','has 8 credits/minute and 800 weighted credits/day, reset 00:00 UTC')) for k,(a,t) in CHOICES.items()}
CONTEXT={
 'PH-00':'Complete the twelve-area baseline, shared contracts and actual story decomposition. All twelve direction answers are recorded, but the52detailed gaps and final architecture sign-off remain open. No UX starts from completing the questionnaire.',
 'PH-01':'DynamoDB/S3 and the controlled write service are selected. Imports produce reviewable drafts; exact financial commits, large-import visibility, corrections, audit and owner export semantics still need proof. Foundation implementation depends on PH-02.',
 'PH-02':'Use Cognito assurance/freshness, separate dev/prod accounts, ordinary FastAPI Lambdas and Python Durable workflows. Cost visibility, audit and least privilege start with foundations; they are not deferred to the launch phase.',
 'PH-03':'Retain Yahoo/Grow candidates and Basic dev mode with explicit weighted quotas. Verify source rights, listing/currency/calendar and point-in-time semantics; define XIRR/benchmarks/exposure/risk independently from forecast probabilities.',
 'PH-04':'Use baselines-first qualification, capped SageMaker CPU candidate jobs and compatible portable Lambda inference. Durable workflows coordinate job identity/recovery and owner promotion. Long-horizon labels mature on their own clocks;3–5-year outputs remain conditional scenarios.',
 'PH-05':'Separate Claude task workers share the bounded client-SDK library. Inspect AI organises agent evals; numerical ML validation and runtime guards remain separate. Keep tool-free untrusted extraction, private/public boundaries, scoped memory and deadline-aware nonurgent batching.',
 'PH-06':'The selected web direction is a static interactive SvelteKit PWA with authenticated FastAPI, live/SSE features and explicit privacy/offline/loading/staleness states. Discovery is first; holdings and main-dashboard cost visibility remain first-version scope.',
 'PH-07':'Swift/SwiftUI owns native surfaces within the RN shell. Reuse typed API/event/action/proof contracts with the PWA. Define secure offline/session/push/accessibility and the exact Duo device meaning before UX promises capabilities.',
 'PH-08':'Verify the already-specified full admin/end-to-end journey set. Confirm audit, recovery, eval, privacy, budget, scientific and release evidence. No phase exit, deployment, live model or implementation approval follows from publishing this page.',
 'PH-09':'Extend through versioned compatible markets/instruments/themes/features/models. Initial UK/US/India and all horizons remain. Later China/Taiwan/Hong Kong/Europe/theme coverage, personalisation, exports/interchange and any MA retirement need explicit scope/rights/cost evidence.'}

def decision_table(cards):
 rows=[]
 for c in cards:
  option,text=CHOICES[c['id']]
  assert c['owner_answer']['option_id']==option
  rows.append('<tr><td data-background="#EAE6FF"><p><strong>'+c['id']+'</strong></p></td><td><p>'+esc(c['title'])+'</p></td><td><p>'+esc(text)+'</p></td></tr>')
 return '<table data-layout="wide"><thead><tr><th data-background="#DEEBFF">Decision</th><th data-background="#DEEBFF">Area</th><th data-background="#DEEBFF">Owner-selected direction; detailed proof pending</th></tr></thead><tbody>'+''.join(rows)+'</tbody></table>'

class Text(HTMLParser):
 def __init__(self):super().__init__();self.parts=[]
 def handle_data(self,s):self.parts.append(s)

def clean_status(body):
 # Original pre-publication source remains historical; only this published body changes.
 def paragraph(m):
  text=Text();text.feed(m.group(0));s=''.join(text.parts)
  if s.startswith('Thirteen substantive Confluence page bodies are prepared locally:'):
   return '<p>This authorised MP-19 publication contains thirteen planning-draft pages: this reconciliation, architecture finalisation, documentation structure and PH-00–PH-09. Earlier MP pages and native Lucid/Site snapshots are preserved. Twelve owner-selected directions are reflected above;52contract/evidence items remain open and no final architecture/UX/build approval is implied.</p>'.replace('above;52contract','above; 52 contract')
  if s.startswith('This was a four-thread maker research exercise, not independent review.'):
   return '<p>This was maker research, not independent review. Maker checks validate source/reference/phase/publication consistency, not live rights, forecast quality, cloud viability or owner baseline approval. The owner explicitly authorised these thirteen planning-draft Confluence pages; independent review, PR creation, UX and implementation remain pending. No application code, live data/model calls, AWS resources or MA records were changed.</p>'
  return m.group(0)
 body=re.sub(r'<p(?:\s[^>]*)?>[\s\S]*?</p>',paragraph,body)
 body=body.replace('This local page is a publication proposal, not a published Confluence page.','This page is published as a planning draft; no phase exit, UX or application implementation has been approved.')
 body=body.replace('The new publication proposal is local, not applied.','This thirteen-page publication is owner-authorised and remains a planning draft. Future area/phase changes require their own scoped publication and readback evidence.')
 return body

def build(mapping=None):
 proposal=read(BASE/'confluence-publication-proposal.json')
 cards=read(BASE/'decision-cards.json')['cards']
 assert len(cards)==12 and all(c['owner_answer'] for c in cards)
 assert len(proposal['pages'])==13
 mapping=mapping or {}
 source_to_url={x['local_source']:x['url'] for x in mapping.values()}
 central=next((x['url'] for x in mapping.values() if x['local_source']=='reconciliation-report.md'),'https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/4981438')
 table=decision_table(cards)
 outdir=BASE/'confluence-publication';outdir.mkdir(exist_ok=True)
 outputs=[]
 for p in proposal['pages']:
  body=(BASE/p['body_file']).read_text()
  assert sha(body)==p['body_sha256']
  body=re.sub(r'^<div data-type="panel-warning">[\s\S]*?</div>','',body,count=1)
  body=clean_status(body)
  for source,url in source_to_url.items():
   body=body.replace(GITHUB+PACK+source,url)
  panel=('<div data-type="panel-warning"><p><span data-type="status" data-color="yellow" data-status-style="bold">PLANNING DRAFT</span> '
   '<time datetime="2026-11-02">2 November 2026</time> · MP-19. All twelve broad directions selected; detailed architecture baseline unapproved. '
   '<strong>No UX or implementation yet.</strong> No cloud setup, paid model/data calls, deployment or model promotion authorised. Independent review not run.</p></div>')
  note=('<div data-type="panel-note"><p>The selected directions below control this snapshot. Earlier alternatives/maker recommendations retained in the source are historical comparisons, not additional selected services. Exact formulas, schemas, policies, region/network/compatibility and full cost remain open. The 52 detailed contract/evidence items remain open.</p></div>')
  summary='<h2>Twelve owner-selected architecture directions</h2>'+table
  if p['local_source'].startswith('phases/'):
   summary='<details><summary>Twelve selected directions applying to this phase</summary>'+table+'</details>'
   phase=Path(p['local_source']).stem
   context=CONTEXT[phase].replace('the52detailed','the 52 detailed').replace(';3–5-year','; 3–5-year')
   summary='<div data-type="panel-info"><p><strong>'+phase+' current decision context:</strong> '+esc(context)+'</p></div>'+summary
  nav='<p>Full decision and publication index: <a href="'+central+'">MP-19 reconciliation and selected directions</a>. Existing roadmap: <a href="https://duttaarun2015.atlassian.net/wiki/spaces/mypaisaapr/pages/5014255">MP phase plan</a>. Exact sources and pending proofs remain linked below.</p>'
  if p['local_source']=='reconciliation-report.md' and mapping:
   nav+='<h2>Planning-draft pages in this publication</h2><ul>'+''.join('<li><a href="'+esc(x['url'])+'">'+esc(x['title'])+'</a></li>' for x in mapping.values())+'</ul>'
  source=GITHUB+PACK+p['local_source']
  provenance='<hr><p><strong>Publication provenance:</strong> owner-authorised planning-draft snapshot from <a href="'+source+'">the versioned MP source</a>. Source SHA-256: <code>'+p['source_sha256']+'</code>; owner-decisions SHA-256: <code>'+OWNER_HASH+'</code>. The publication receipt records actual page IDs, versions and readback. Manual snapshot; no automatic/bidirectional sync.</p>'
  result=panel+note+nav+summary+body+provenance
  assert all(cid in result for cid in CHOICES)
  assert not any(t in result for t in ['<ac:','<ri:','file:///','<html','<body','{{'])
  assert 'not a published Confluence page' not in result and 'proposal is local, not applied' not in result
  title='DRAFT | '+p['title']
  target=outdir/Path(p['body_file']).name;target.write_text(result)
  outputs.append({**p,'publication_title':title,'publication_body':str(target.relative_to(BASE)),'publication_body_sha256':sha(result),'owner_decisions_sha256':OWNER_HASH})
 (BASE/'confluence-publication-plan.json').write_text(json.dumps({'issue':'MP-19','scope':'13 new MP planning-draft pages; preserve all pre-existing pages; no sharing/attachment/MA/UX/implementation/review/PR actions','owner_authorisation':'Current user: publish 13 planning pages to MP Confluence and reflect all 12 decisions; planning drafts, no UX or implementation','decision_count':12,'pages':outputs},indent=2,ensure_ascii=False)+'\n')
 print(json.dumps({'prepared_pages':len(outputs),'decisions_on_every_page':12,'cross_page_links_resolved':len(mapping)}))

if __name__=='__main__':
 import argparse
 parser=argparse.ArgumentParser();parser.add_argument('--mapping',type=Path);args=parser.parse_args()
 build(read(args.mapping) if args.mapping else None)
