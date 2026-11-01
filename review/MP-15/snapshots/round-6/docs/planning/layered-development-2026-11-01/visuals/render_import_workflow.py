#!/usr/bin/env python3
"""Render a proposed supporting workflow; never calls services or reads financial inputs.

Run: python3 docs/planning/layered-development-2026-11-01/visuals/render_import_workflow.py
Outputs: editable draw.io XML, accessible SVG, static PNG, seven-frame illustrative GIF.
Only Pillow and macOS-bundled Arial fonts are used. This does not implement the workflow.
"""
from __future__ import annotations
import hashlib,json,math
from pathlib import Path
import xml.etree.ElementTree as ET
from PIL import Image,ImageDraw,ImageFont,ImageChops

HERE=Path(__file__).resolve().parent
W,H=1600,880
FONT_DIR=Path('/System/Library/Fonts/Supplemental')
FONTS={'regular':FONT_DIR/'Arial.ttf','bold':FONT_DIR/'Arial Bold.ttf'}
C={'bg':'#f8fafc','ink':'#0f172a','muted':'#475569','line':'#64748b','band':'#e2e8f0','bandtext':'#334155','active':'#0f172a'}
NODES=[
 {'id':'receive','title':['Receive','original'],'body':['CSV / Excel / PDF','Screenshot or manual'],'x':48,'y':216,'color':'#1d4ed8','tint':'#eff6ff'},
 {'id':'validate','title':['Validate /','quarantine'],'body':['Check type, size, scope','Reject unsafe inputs'],'x':432,'y':216,'color':'#9f1239','tint':'#fff1f2'},
 {'id':'extract','title':['Extract','candidates'],'body':['Capture field + source','Treat text as untrusted'],'x':816,'y':216,'color':'#6d28d9','tint':'#f5f3ff'},
 {'id':'match','title':['Match /','normalise'],'body':['Resolve listing + units','Review uncertain values'],'x':1200,'y':216,'color':'#0e7490','tint':'#ecfeff'},
 {'id':'approve','title':['Owner preview','+ approval'],'body':['Review exact draft','Bind scope + revision'],'x':1200,'y':516,'color':'#92400e','tint':'#fffbeb'},
 {'id':'commit','title':['Commit +','financial audit'],'body':['One logical application','Fence financial visibility'],'x':816,'y':516,'color':'#047857','tint':'#ecfdf5'},
 {'id':'receipt','title':['Durable receipt','/ reconcile'],'body':['Recover the result','Check ledger + originals'],'x':432,'y':516,'color':'#334155','tint':'#f1f5f9'}
]
BW,BH=352,208
EDGES=[[(400,320),(432,320)],[(784,320),(816,320)],[(1168,320),(1200,320)],[(1376,424),(1376,516)],[(1200,620),(1168,620)],[(816,620),(784,620)]]
DESC='Proposed import workflow, not implemented or live telemetry. Seven ordered stages: Receive original; Validate or quarantine; Extract candidates; Match and normalise; Owner preview and approval; Commit and financial audit; Durable receipt and reconciliation. Trace, source, status and cost evidence applies at every stage. Failed, cancelled or staged work has no financial visibility. Financial visibility is permitted only after a successful logical commit. Static PNG and SVG alternatives are available.'

def font(size,bold=False): return ImageFont.truetype(str(FONTS['bold' if bold else 'regular']),size)
def center_text(draw,xy,text,f,fill):
 x,y=xy; box=draw.textbbox((0,0),text,font=f);draw.text((x-(box[2]-box[0])/2,y),text,font=f,fill=fill)
def arrow(draw,pts,fill,width=4):
 draw.line(pts,fill=fill,width=width,joint='curve');a,b=pts[-2:];theta=math.atan2(b[1]-a[1],b[0]-a[0]);l=10
 tip=b;wing1=(b[0]-l*math.cos(theta-.5),b[1]-l*math.sin(theta-.5));wing2=(b[0]-l*math.cos(theta+.5),b[1]-l*math.sin(theta+.5));draw.polygon([tip,wing1,wing2],fill=fill)
def raster(active=None):
 im=Image.new('RGB',(W,H),C['bg']);dr=ImageDraw.Draw(im)
 dr.text((48,40),'MYPAISAA PREDICTION  /  IMPORT WORKFLOW',font=font(18,True),fill=C['muted'])
 dr.text((48,84),'Visible only after a confirmed commit',font=font(42,True),fill=C['ink'])
 dr.text((48,144),'Private originals → reviewed candidates → auditable financial records',font=font(23),fill=C['muted'])
 dr.rounded_rectangle((1352,40,1552,84),radius=22,fill='#fef3c7');center_text(dr,(1452,48),'PROPOSED',font(22,True),'#78350f')
 for points in EDGES:arrow(dr,points,C['line'])
 for i,n in enumerate(NODES):
  x,y=n['x'],n['y'];selected=i==active
  if selected: dr.rounded_rectangle((x-7,y-7,x+BW+7,y+BH+7),radius=24,outline=C['active'],width=4)
  dr.rounded_rectangle((x,y,x+BW,y+BH),radius=16,fill=n['tint'],outline=n['color'],width=2)
  dr.rounded_rectangle((x,y,x+BW,y+8),radius=4,fill=n['color'])
  dr.rounded_rectangle((x+20,y+24,x+62,y+62),radius=10,fill=n['color']);center_text(dr,(x+41,y+28),str(i+1),font(22,True),'#ffffff')
  if selected:
   dr.rounded_rectangle((x+236,y+28,x+330,y+60),radius=8,fill=C['active']);center_text(dr,(x+283,y+32),'FOCUS',font(16,True),'#ffffff')
  for j,line in enumerate(n['title']):dr.text((x+20,y+76+j*29),line,font=font(25,True),fill=C['ink'])
  for j,line in enumerate(n['body']):dr.text((x+20,y+145+j*25),line,font=font(19),fill=C['muted'])
 # Reserved lower-left space carries the safety invariant instead of another process node.
 dr.rounded_rectangle((48,516,400,724),radius=16,fill='#fff1f2',outline='#fda4af',width=2)
 dr.text((68,540),'NO FINANCIAL VISIBILITY',font=font(19,True),fill='#9f1239')
 for j,t in enumerate(['Failed, cancelled or','staged work stays outside','holdings, agents and totals.']):dr.text((68,582+j*28),t,font=font(20),fill='#881337')
 dr.rounded_rectangle((48,760,1552,816),radius=12,fill=C['band']);center_text(dr,(800,774),'Trace / source / status / cost evidence at every stage',font(24,True),C['bandtext'])
 note='Static overview • Proposed workflow • Not implemented' if active is None else f'Illustrative sequence: step {active+1} of 7 • Not live telemetry • Static alternative available'
 dr.text((48,838),note,font=font(18),fill=C['muted'])
 return im

def svg():
 ns='http://www.w3.org/2000/svg';ET.register_namespace('',ns)
 root=ET.Element(f'{{{ns}}}svg',{'width':str(W),'height':str(H),'viewBox':f'0 0 {W} {H}','role':'img','aria-labelledby':'workflow-title workflow-description','lang':'en'})
 def el(tag,attrs=None,text=None,parent=root):
  o=ET.SubElement(parent,f'{{{ns}}}{tag}',{k:str(v) for k,v in (attrs or {}).items()});o.text=text;return o
 el('title',{'id':'workflow-title'},'Proposed import workflow: visible only after a confirmed commit')
 el('desc',{'id':'workflow-description'},DESC)
 defs=el('defs');marker=el('marker',{'id':'arrowhead','viewBox':'0 0 10 10','refX':9,'refY':5,'markerWidth':7,'markerHeight':7,'orient':'auto-start-reverse'},parent=defs);el('path',{'d':'M 0 1 L 9 5 L 0 9 z','fill':C['line']},parent=marker)
 def rect(x,y,w,h,fill,stroke=None,r=16):
  at={'x':x,'y':y,'width':w,'height':h,'rx':r,'fill':fill}
  if stroke:at.update(stroke=stroke,**{'stroke-width':2})
  return el('rect',at)
 def text(x,y,s,size=20,fill=None,bold=False,anchor=None):
  at={'x':x,'y':y,'font-family':'Arial, Helvetica, sans-serif','font-size':size,'fill':fill or C['ink']}
  if bold:at['font-weight']=700
  if anchor:at['text-anchor']=anchor
  return el('text',at,s)
 rect(0,0,W,H,C['bg'],r=0);text(48,60,'MYPAISAA PREDICTION  /  IMPORT WORKFLOW',18,C['muted'],True)
 text(48,124,'Visible only after a confirmed commit',42,bold=True);text(48,169,'Private originals → reviewed candidates → auditable financial records',23,C['muted'])
 rect(1352,40,200,44,'#fef3c7',r=22);text(1452,69,'PROPOSED',22,'#78350f',True,'middle')
 for points in EDGES:el('polyline',{'points':' '.join(f'{x},{y}' for x,y in points),'fill':'none','stroke':C['line'],'stroke-width':4,'marker-end':'url(#arrowhead)'})
 for i,n in enumerate(NODES):
  x,y=n['x'],n['y'];el('g',{'id':f'step-{i+1}','aria-label':f'Step {i+1}: '+ ' '.join(n['title'])})
  rect(x,y,BW,BH,n['tint'],n['color']);rect(x,y,BW,8,n['color'],r=4);rect(x+20,y+24,42,38,n['color'],r=10);text(x+41,y+52,str(i+1),22,'#ffffff',True,'middle')
  for j,line in enumerate(n['title']):text(x+20,y+100+j*29,line,25,bold=True)
  for j,line in enumerate(n['body']):text(x+20,y+163+j*25,line,19,C['muted'])
 rect(48,516,352,208,'#fff1f2','#fda4af');text(68,560,'NO FINANCIAL VISIBILITY',19,'#9f1239',True)
 for j,t in enumerate(['Failed, cancelled or','staged work stays outside','holdings, agents and totals.']):text(68,602+j*28,t,20,'#881337')
 rect(48,760,1504,56,C['band'],r=12);text(800,797,'Trace / source / status / cost evidence at every stage',24,C['bandtext'],True,'middle')
 text(48,858,'Static overview • Proposed workflow • Not implemented',18,C['muted'])
 ET.indent(root);ET.ElementTree(root).write(HERE/'import-workflow.svg',encoding='utf-8',xml_declaration=True)

def drawio():
 root=ET.Element('mxfile',{'host':'app.diagrams.net','type':'device','agent':'Local deterministic renderer - supporting workflow only'})
 diag=ET.SubElement(root,'diagram',{'id':'mp-import-workflow','name':'Proposed import workflow'})
 model=ET.SubElement(diag,'mxGraphModel',{'dx':str(W),'dy':str(H),'grid':'1','gridSize':'8','page':'1','pageWidth':str(W),'pageHeight':str(H),'background':C['bg']});graph=ET.SubElement(model,'root');ET.SubElement(graph,'mxCell',{'id':'0'});ET.SubElement(graph,'mxCell',{'id':'1','parent':'0'})
 def cell(id,value,x,y,w,h,style):
  a=ET.SubElement(graph,'mxCell',{'id':id,'value':value,'style':style,'vertex':'1','parent':'1'});ET.SubElement(a,'mxGeometry',{'x':str(x),'y':str(y),'width':str(w),'height':str(h),'as':'geometry'});return a
 base='rounded=1;whiteSpace=wrap;html=0;fontFamily=Arial;fontSize=22;fontColor=#0f172a;spacing=20;align=left;verticalAlign=middle;'
 cell('workflow-heading','Visible only after a confirmed commit\nPROPOSED supporting import workflow',48,40,1504,128,'text;whiteSpace=wrap;html=0;fontFamily=Arial;fontSize=32;fontStyle=1;align=left;fontColor=#0f172a;')
 for i,n in enumerate(NODES):cell(n['id'],str(i+1)+'. '+' '.join(n['title'])+'\n\n'+'\n'.join(n['body']),n['x'],n['y'],BW,BH,base+f"fillColor={n['tint']};strokeColor={n['color']};strokeWidth=2;")
 for i in range(6):
  a=ET.SubElement(graph,'mxCell',{'id':f'edge-{i+1}','edge':'1','parent':'1','source':NODES[i]['id'],'target':NODES[i+1]['id'],'style':'edgeStyle=orthogonalEdgeStyle;rounded=0;html=0;endArrow=block;endFill=1;strokeColor=#64748b;strokeWidth=3;'});ET.SubElement(a,'mxGeometry',{'relative':'1','as':'geometry'})
 cell('visibility-rule','NO FINANCIAL VISIBILITY\n\nFailed, cancelled or staged work stays outside holdings, agents and totals.',48,516,352,208,base+'fillColor=#fff1f2;strokeColor=#fda4af;fontColor=#881337;fontSize=20;')
 cell('evidence-band','Trace / source / status / cost evidence at every stage',48,760,1504,56,base+'fillColor=#e2e8f0;strokeColor=none;align=center;fontStyle=1;')
 cell('status-note','Proposed workflow - not implemented. Animation is an illustrative walkthrough, not live telemetry.',48,832,1504,32,'text;whiteSpace=wrap;html=0;fontFamily=Arial;fontSize=18;fontColor=#475569;align=left;')
 ET.indent(root);ET.ElementTree(root).write(HERE/'import-workflow.drawio',encoding='utf-8',xml_declaration=True)

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def luminance(hex_):
 vals=[int(hex_[i:i+2],16)/255 for i in (1,3,5)];vals=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in vals];return sum(v*w for v,w in zip(vals,[.2126,.7152,.0722]))
def contrast(a,b):
 x,y=sorted([luminance(a),luminance(b)]);return (y+.05)/(x+.05)
def validate():
 tree=ET.parse(HERE/'import-workflow.drawio');cells=tree.findall('.//mxCell');ids=[x.get('id') for x in cells];assert len(ids)==len(set(ids));edges=[c for c in cells if c.get('edge')=='1'];assert len(edges)==6
 assert [(x.get('source'),x.get('target')) for x in edges]==[(NODES[i]['id'],NODES[i+1]['id']) for i in range(6)]
 assert all(x.get('source') in ids and x.get('target') in ids for x in edges)
 doc=ET.parse(HERE/'import-workflow.svg');ns={'s':'http://www.w3.org/2000/svg'};assert doc.find('s:title',ns) is not None and doc.find('s:desc',ns) is not None;assert doc.getroot().get('role')=='img';assert len(doc.findall('.//s:polyline',ns))==6
 checks=[]
 for n in NODES:checks += [(C['ink'],n['tint']), (C['muted'],n['tint']),('#ffffff',n['color'])]
 checks += [('#9f1239','#fff1f2'),('#881337','#fff1f2'),(C['bandtext'],C['band']),('#78350f','#fef3c7'),(C['muted'],C['bg'])]
 ratios=[contrast(*c) for c in checks];assert min(ratios)>=4.5
 for n in NODES:
  for text in n['title']:assert font(25,True).getlength(text)<=BW-40,text
  for text in n['body']:assert font(19).getlength(text)<=BW-40,text
 gif=Image.open(HERE/'import-workflow.gif');assert gif.n_frames==7;frames=[];durations=[]
 for i in range(gif.n_frames):gif.seek(i);frames.append(gif.convert('RGB').copy());durations.append(gif.info.get('duration'))
 deltas=[ImageChops.difference(frames[i],frames[(i+1)%len(frames)]).getbbox() for i in range(len(frames))];assert all(deltas);assert set(durations)=={1800};assert all(f.size==(W,H) for f in frames)
 png=Image.open(HERE/'import-workflow.png');assert png.size==(W,H)
 return {'drawio_xml_parse':'passed','drawio_unique_cell_ids':len(ids),'drawio_ordered_connected_process_edges':6,'svg_xml_accessible_title_description_role':'passed','svg_process_edges':6,'text_fit':'passed for every process title/body line','minimum_text_contrast_ratio':round(min(ratios),2),'text_contrast_4_5_to_1':'passed','png_dimensions':[W,H],'gif_frames':gif.n_frames,'gif_frame_duration_ms':durations,'gif_adjacent_frames_visually_distinct':True,'gif_frame_difference_bounds':deltas,'gif_cycle_ms':sum(durations),'gif_focus_changes_per_second':round(1000/1800,3),'png_visual_inspection':'pending maker inspection','independent_review':'not_run','application_or_live_pipeline_validation':'not_run'}

def main():
 HERE.mkdir(exist_ok=True);svg();drawio();raster().save(HERE/'import-workflow.png',optimize=True)
 palette=raster(0).quantize(colors=192,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
 frames=[raster(i).quantize(palette=palette,dither=Image.Dither.NONE) for i in range(7)]
 frames[0].save(HERE/'import-workflow.gif',save_all=True,append_images=frames[1:],duration=1800,loop=0,optimize=False,disposal=2)
 result=validate();artifacts=[]
 for name,kind in [('render_import_workflow.py','reproducible-source'),('import-workflow.drawio','editable-native-process-model'),('import-workflow.svg','accessible-static-vector-export'),('import-workflow.png','static-raster-export'),('import-workflow.gif','illustrative-animation-export')]:
  p=HERE/name;artifacts.append({'path':name,'kind':kind,'sha256':sha(p),'bytes':p.stat().st_size})
 sources=[]
 for name in ['portfolio-import-contracts.json','portfolio-import-spec.md','portfolio-import-stories.json']:
  p=HERE.parent/name;sources.append({'path':'../'+name,'sha256':sha(p),'role':'requirements reference; not implementation evidence'})
 manifest={'schema_version':1,'project':'mypaisaa-prediction','prepared_on':'2026-11-01','status':'Proposed - local supporting workflow, implementation not authorised','published':False,'model':{'kind':'deterministic seven-stage process model in renderer NODES/EDGES','ai_image_generation_model':None,'renderer':'Python/Pillow using macOS-bundled Arial fonts','pillow_version':Image.__version__,'editing_model':'import-workflow.drawio contains editable labelled process blocks; exports regenerated from renderer source','source_and_export_relationship':'Renderer is the reproducible authority for this bundle; draw.io is separately editable. Manual draw.io edits are not automatically reflected in SVG/PNG/GIF. Reconcile edits into renderer before re-export.','architecture_boundary':'Supporting import workflow only; not AWS/system architecture, not an alternative phase DAG and not a replacement for canonical Lucid diagrams.'},'sources':sources,'artifacts':artifacts,'alt_text':DESC,'animation':{'purpose':'Slow focus walkthrough of seven proposed stages, not live telemetry','default':'Use static PNG/SVG by default; opt-in animation button,restore static to stop','reduced_motion':'Host must suppress automatic playback and use static when prefers-reduced-motion is reduce','embedded_gif_note':'GIF cannot enforce reduced-motion by itself; host owns the opt-in control','static_alternatives':['import-workflow.png','import-workflow.svg'],'loop':'repeats while host chooses GIF; 12.6 second cycle','flashing':'No flicker; one bounded focus change every 1.8 seconds'},'reproduce':'python3 docs/planning/layered-development-2026-11-01/visuals/render_import_workflow.py','validation':result}
 (HERE/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n');print(json.dumps(result,indent=2));print('Artifact bytes:',{a['path']:a['bytes'] for a in artifacts})
if __name__=='__main__':main()
