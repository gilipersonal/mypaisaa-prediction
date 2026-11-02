"""Check saved Confluence readback against the authorised publication payloads."""
from __future__ import annotations
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from prepare_publication import CHOICES

BASE=Path(__file__).resolve().parent

def read(p):return json.loads(p.read_text())
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def canonical_link(s):
 # Confluence normalises page-title slugs to the same numeric page locator.
 return re.sub(r'^(https://duttaarun2015\.atlassian\.net/wiki/spaces/mypaisaapr/pages/\d+)(?:/[^?#]*)?([?#].*)?$',lambda m:m[1]+(m[2] or ''),s)
def normal(s):return re.sub(r'\s+',' ',s).strip()

class PublishedHTML(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.text=[];self.rows=[];self.row=None;self.cell=None;self.links=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='a' and 'href' in attrs:self.links.append(attrs['href'])
  if tag=='tr':self.row=[]
  if tag in ['td','th']:self.cell=[]
 def handle_data(self,data):
  self.text.append(data)
  if self.cell is not None:self.cell.append(data)
 def handle_endtag(self,tag):
  if tag in ['td','th'] and self.cell is not None:
   if self.row is not None:self.row.append(normal(''.join(self.cell)))
   self.cell=None
  if tag=='tr' and self.row is not None:self.rows.append(self.row);self.row=None

def parse(path):
 p=PublishedHTML();p.feed(path.read_text());return p

plan=read(BASE/'confluence-publication-plan.json')
meta=read(BASE/'confluence-readback-metadata.json')
receipt=read(BASE/'confluence-publication-receipt.json')
assert len(plan['pages'])==len(meta)==len(receipt['pages'])==13
assert len({x['content_id'] for x in meta})==13
checks=[]
all_urls={canonical_link(x['url']) for x in receipt['pages']}
for p in receipt['pages']:
 m=next(x for x in meta if x['content_id']==p['content_id'])
 expected=next(x for x in plan['pages'] if x['local_source']==p['local_source'])
 assert p['source_sha256']==expected['source_sha256']
 assert p['published_body_sha256']==expected['publication_body_sha256']==digest(BASE/expected['publication_body'])
 assert m['version']==p['version']==2 and m['status']=='current' and m['space_id']=='5145174'
 assert m['title']==p['title'] and p['title'].startswith('DRAFT | MP |')
 payload=parse(BASE/expected['publication_body']);actual=parse(BASE/m['readback_file'])
 rows={r[0]:r for r in actual.rows if r and r[0] in CHOICES}
 assert len(rows)==12
 for cid,(_,text) in CHOICES.items():assert rows[cid][2]==normal(text),(p['content_id'],cid)
 text=normal(' '.join(actual.text))
 assert 'PLANNING DRAFT' in text and 'No UX or implementation yet.' in text
 assert 'detailed architecture baseline unapproved' in text and 'Independent review not run' in text
 for stale in ['not a published Confluence page','publication proposal is local, not applied','publication proposal is not applied']:
  assert stale not in text
 assert {canonical_link(u) for u in payload.links}<={canonical_link(u) for u in actual.links},f'Link lost: {p["content_id"]}'
 if p['local_source']=='reconciliation-report.md':assert all_urls<={canonical_link(u) for u in actual.links}
 assert not any('file:///' in link or '{{' in link for link in actual.links)
 checks.append({'content_id':p['content_id'],'version':m['version'],'title':p['title'],'decisions_verified':12,'selected_decision_text_match':True,'planning_draft_banner':True,'no_UX_or_implementation':True,'links_preserved':True,'readback_file':m['readback_file'],'readback_artifact_sha256':digest(BASE/m['readback_file'])})
result={'status':'publication_readback_passed','published_pages':13,'decisions_per_page':12,'selected_decision_rows_verified':156,'architecture_baseline_approved':False,'UX_authorised':False,'implementation_authorised':False,'review':'not_run','pages':checks}
(BASE/'confluence-publication-validation.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='pages'}))
