#!/usr/bin/env python3
"""Deterministic local supporting charts; Python/Pillow only; no service calls.

Run from any directory: python3 /absolute/path/to/visuals/render_planning_charts.py
The authoritative data comes from phase-story-map.json and confirmed DEC-023.
Manual draw.io edits are separate: reconcile changes into sources before re-rendering.
"""
from pathlib import Path
import hashlib,json,textwrap,xml.etree.ElementTree as ET
from PIL import Image,ImageDraw,ImageFont

HERE=Path(__file__).resolve().parent
FONT=Path('/System/Library/Fonts/Supplemental')
INK='#0f172a';MUTED='#475569';BG='#f8fafc';GRID='#cbd5e1';BLUE='#1d4ed8';BLUELIGHT='#dbeafe';GREEN='#047857';GREENLIGHT='#d1fae5';AMBER='#92400e';AMBERLIGHT='#fef3c7'
def ft(size,bold=False):return ImageFont.truetype(str(FONT/('Arial Bold.ttf' if bold else 'Arial.ttf')),size)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def wrap(text,width,size=18,bold=False):
 words=text.split();lines=[];line=''
 for word in words:
  attempt=(line+' '+word).strip()
  if ft(size,bold).getlength(attempt)>width and line:lines.append(line);line=word
  else:line=attempt
 if line:lines.append(line)
 return lines
class Scene:
 def __init__(self,w,h,title,desc):self.w=w;self.h=h;self.title=title;self.desc=desc;self.cmd=[];self.text_overflow=[]
 def rect(self,x,y,w,h,fill,stroke=None,radius=0,width=1):self.cmd.append(('rect',dict(x=x,y=y,w=w,h=h,fill=fill,stroke=stroke,r=radius,width=width)))
 def circle(self,x,y,r,fill):self.cmd.append(('circle',dict(x=x,y=y,r=r,fill=fill)))
 def text(self,x,y,value,size=20,color=INK,bold=False,anchor='start',max_width=None):
  self.cmd.append(('text',dict(x=x,y=y,value=value,size=size,color=color,bold=bold,anchor=anchor)))
  if max_width and ft(size,bold).getlength(value)>max_width:self.text_overflow.append(value)
 def export(self,name):
  im=Image.new('RGB',(self.w,self.h),BG);dr=ImageDraw.Draw(im)
  ns='http://www.w3.org/2000/svg';ET.register_namespace('',ns)
  svg=ET.Element(f'{{{ns}}}svg',{'width':str(self.w),'height':str(self.h),'viewBox':f'0 0 {self.w} {self.h}','role':'img','aria-labelledby':f'{name}-title {name}-description','lang':'en'})
  ET.SubElement(svg,f'{{{ns}}}title',{'id':name+'-title'}).text=self.title;ET.SubElement(svg,f'{{{ns}}}desc',{'id':name+'-description'}).text=self.desc
  ET.SubElement(svg,f'{{{ns}}}rect',{'width':str(self.w),'height':str(self.h),'fill':BG})
  mx=ET.Element('mxfile',{'host':'app.diagrams.net','type':'device','agent':'Local deterministic chart renderer'});diagram=ET.SubElement(mx,'diagram',{'id':name,'name':self.title});model=ET.SubElement(diagram,'mxGraphModel',{'grid':'1','gridSize':'8','page':'1','pageWidth':str(self.w),'pageHeight':str(self.h),'background':BG});root=ET.SubElement(model,'root');ET.SubElement(root,'mxCell',{'id':'0'});ET.SubElement(root,'mxCell',{'id':'1','parent':'0'})
  for n,(kind,a) in enumerate(self.cmd):
   cellid=f'{name}-{n:04}';value='';x=a['x'];y=a['y']
   if kind=='rect':
    box=(x,y,x+a['w'],y+a['h']);dr.rounded_rectangle(box,radius=a['r'],fill=a['fill'],outline=a['stroke'],width=a['width'])
    attrs={'x':str(x),'y':str(y),'width':str(a['w']),'height':str(a['h']),'rx':str(a['r']),'fill':a['fill']}
    if a['stroke']:attrs.update(stroke=a['stroke'],**{'stroke-width':str(a['width'])})
    ET.SubElement(svg,f'{{{ns}}}rect',attrs);w=a['w'];h=a['h'];style=f"rounded={int(a['r']>0)};arcSize=8;fillColor={a['fill']};strokeColor={a['stroke'] or 'none'};strokeWidth={a['width']};"
   elif kind=='circle':
    r=a['r'];dr.ellipse((x-r,y-r,x+r,y+r),fill=a['fill']);ET.SubElement(svg,f'{{{ns}}}circle',{'cx':str(x),'cy':str(y),'r':str(r),'fill':a['fill']});x-=r;y-=r;w=h=2*r;style=f"ellipse;fillColor={a['fill']};strokeColor=none;"
   else:
    f=ft(a['size'],a['bold']);length=f.getlength(a['value']);offset=length/2 if a['anchor']=='middle' else length if a['anchor']=='end' else 0;dr.text((x-offset,y),a['value'],font=f,fill=a['color'])
    attrs={'x':str(x),'y':str(y+a['size']*.91),'font-size':str(a['size']),'font-family':'Arial, Helvetica, sans-serif','fill':a['color'],'text-anchor':a['anchor']}
    if a['bold']:attrs['font-weight']='700'
    ET.SubElement(svg,f'{{{ns}}}text',attrs).text=a['value'];value=a['value'];x-=offset;w=length+12;h=a['size']*1.5;style=f"text;html=0;whiteSpace=wrap;fontFamily=Arial;fontSize={a['size']};fontColor={a['color']};fontStyle={int(a['bold'])};align=left;verticalAlign=top;spacing=0;"
   cell=ET.SubElement(root,'mxCell',{'id':cellid,'value':value,'style':style,'vertex':'1','parent':'1'});ET.SubElement(cell,'mxGeometry',{'x':str(round(x,2)),'y':str(round(y,2)),'width':str(round(w,2)),'height':str(round(h,2)),'as':'geometry'})
  ET.indent(svg);ET.ElementTree(svg).write(HERE/(name+'.svg'),encoding='utf-8',xml_declaration=True);ET.indent(mx);ET.ElementTree(mx).write(HERE/(name+'.drawio'),encoding='utf-8',xml_declaration=True);im.save(HERE/(name+'.png'),optimize=True)
  assert not self.text_overflow,self.text_overflow
  return {'dimensions':[self.w,self.h],'text_fit':'passed measured line-width checks','drawio_cells':len(root.findall('mxCell'))}
def heading(sc,eyebrow,title,subtitle):
 sc.text(48,36,eyebrow,18,MUTED,True);sc.text(48,80,title,40,INK,True,max_width=1280);sc.text(48,140,subtitle,22,MUTED,max_width=1504);sc.rect(1352,36,200,44,AMBERLIGHT,radius=20);sc.text(1452,44,'PROPOSED',22,'#78350f',True,'middle')
def matrices(data):
 phases=sorted(data['phases'],key=lambda p:p['id']);ids=[p['id'] for p in phases];assert ids==[f'PH-{n:02}' for n in range(10)]
 desc='Proposed dependency charts, not implemented progress or a time schedule. Rows are phases and columns are prerequisites. Filled cells mean a dependency in the draft source. '+ ' '.join(label+': '+'; '.join(p['id']+' needs '+(', '.join(p[field]) or 'none') for p in phases)+'.' for field,label in [('planning_dependencies','Planning'),('implementation_dependencies','Implementation')])+ ' PH-01 portfolio and imports can be specified from PH-00 drafts, but its later implementation needs PH-02 foundations. Full end-to-end requirements and UX approval is required before implementation.'
 sc=Scene(1600,1280,'Proposed planning and implementation dependency matrices',desc);heading(sc,'MYPAISAA PREDICTION  /  DEPENDENCY CHARTS','Plan the layers; build behind their prerequisites','Exact draft dependencies from the phase map • No timeline, progress or implementation claim')
 counts={};cells_data={}
 for field,label,x,accent,tint in [('planning_dependencies','Planning dependencies',152,BLUE,BLUELIGHT),('implementation_dependencies','Implementation dependencies',920,GREEN,GREENLIGHT)]:
  sc.text(x,194,label,28,accent,True);sc.text(x+260,234,'Column: prerequisite',18,MUTED,False,'middle');sc.text(x-104,266,'Row:',16,MUTED);sc.text(x-104,288,'phase',16,MUTED)
  top=300;cell=52;filled=[]
  for j,pid in enumerate(ids):sc.text(x+j*cell+cell/2,266,pid,17,INK,True,'middle')
  for i,p in enumerate(phases):
   sc.text(x-24,top+i*cell+16,p['id'],18,INK,True,'end')
   for j,pid in enumerate(ids):
    included=pid in p[field];sc.rect(x+j*cell,top+i*cell,cell,cell,tint if included else '#ffffff',GRID,width=1)
    if included:sc.circle(x+j*cell+cell/2,top+i*cell+cell/2,7,accent);filled.append([p['id'],pid])
    if field=='implementation_dependencies' and p['id']=='PH-01' and pid=='PH-02':sc.rect(x+j*cell+3,top+i*cell+3,cell-6,cell-6,tint,AMBER,radius=4,width=3);sc.circle(x+j*cell+cell/2,top+i*cell+cell/2,7,accent)
  counts[field]=len(filled);cells_data[field]=filled
  sc.rect(x,840,24,24,tint,GRID);sc.circle(x+12,852,5,accent);sc.text(x+36,842,f'Filled cell = draft dependency ({len(filled)} links)',18,MUTED)
 sc.rect(48,896,1504,60,AMBERLIGHT,radius=12);sc.text(800,913,'PH-01 ledger: planning can precede foundations; implementation requires PH-02.',22,'#78350f',True,'middle',max_width=1460)
 sc.text(48,988,'Phase key',24,INK,True)
 for i,p in enumerate(phases):
  col=i//5;row=i%5;x=48+col*768;y=1032+row*42;sc.text(x,y,p['id'],18,INK,True)
  lines=wrap(p['title'],650,18)
  for j,line in enumerate(lines):sc.text(x+80,y+j*20,line,18,MUTED,max_width=650)
 sc.text(48,1250,'Proposed • Full end-to-end requirements and UX approval before application implementation',18,MUTED,max_width=1504)
 result=sc.export('phase-dependencies');result.update({'source_field':'phases[].planning_dependencies / implementation_dependencies','phases':ids,'matrix_rows':10,'matrix_columns':10,'filled_counts':counts,'filled_cells':cells_data,'ledger_requires_foundation':{'planning':['PH-00'],'implementation':['PH-02']},'meaning':'Each dot is an exact draft prerequisite; no dates,elapsed time,percent complete or implementation status is encoded.'});assert phases[1]['planning_dependencies']==['PH-00'] and phases[1]['implementation_dependencies']==['PH-02'];return result

def budget(decisions):
 dec=next(x for x in decisions['decisions'] if x['id']=='DEC-023');assert dec['status']=='confirmed';v=dec['value'];total=v['monthly_ceiling_GBP'];operation=v['planned_operation_GBP'];reserve=v['reserve_GBP'];assert operation+reserve==total and all(isinstance(n,int) and n>0 for n in [total,operation,reserve])
 op_percent=operation*100/total;reserve_percent=reserve*100/total;money=lambda n:f'£{n:,}'
 desc=f'Proposed monthly cash planning allocation, not actual spending or a provider quote. Confirmed DEC-023 provides {money(total)} monthly ceiling, divided into {money(operation)} planned operation ({op_percent:g} percent) and {money(reserve)} reserve ({reserve_percent:g} percent). No service or environment suballocation is approved by this chart. Spending and deployment remain unauthorised.'
 sc=Scene(1600,720,'Proposed monthly cash planning allocation from confirmed DEC-023',desc);heading(sc,'MYPAISAA PREDICTION  /  CASH PLANNING ENVELOPE','A bounded plan with a reserve','Confirmed owner allocation from DEC-023 • No service or environment breakdown')
 sc.text(48,216,money(total),72,INK,True);sc.text(280,253,'per month · aggregate cash ceiling',26,MUTED)
 x,y,width,height=48,350,1504,176;ow=width*operation/total;rw=width*reserve/total
 sc.rect(x,y,ow,height,BLUE);sc.rect(x+ow,y,rw,height,AMBER)
 sc.text(x+32,y+30,money(operation),52,'#ffffff',True);sc.text(x+32,y+104,f'Planned operation · {op_percent:g}%',28,'#ffffff',True,max_width=ow-64)
 sc.text(x+ow+32,y+30,money(reserve),52,'#ffffff',True);sc.text(x+ow+32,y+104,f'Reserve · {reserve_percent:g}%',28,'#ffffff',True,max_width=rw-64)
 sc.rect(48,570,1504,64,AMBERLIGHT,radius=12);sc.text(800,589,'Planning allocation — not actual spend, a resource quote or permission to spend',23,'#78350f',True,'middle',max_width=1460)
 sc.text(48,666,'Proposed / not implemented • Full-scope pricing remains unvalidated • Source: confirmed DEC-023',19,MUTED,max_width=1504)
 result=sc.export('budget-envelope');result.update({'source_decision':'DEC-023','source_status':dec['status'],'unit':'GBP per month','ceiling':total,'planned_operation':operation,'reserve':reserve,'planned_operation_percent':op_percent,'reserve_percent':reserve_percent,'stack_geometry':{'total_width_px':width,'planned_operation_width_px':ow,'reserve_width_px':rw},'sum_and_proportions':'passed exact values and proportional width calculation','meaning':'Confirmed planning allocation only; no actual usage,service/environment quote or credit is plotted.'});return result

def lum(c):
 a=[int(c[i:i+2],16)/255 for i in (1,3,5)];a=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in a];return sum(x*w for x,w in zip(a,[.2126,.7152,.0722]))
def ratio(a,b):x,y=sorted([lum(a),lum(b)]);return (y+.05)/(x+.05)
def main():
 phase_path=HERE.parent/'phase-story-map.json';decision_path=HERE.parent/'../aws-options-2026-11-01/product-decisions.json';p=json.loads(phase_path.read_text());d=json.loads(decision_path.read_text());results={'phase-dependencies':matrices(p),'budget-envelope':budget(d)}
 artifacts=[]
 for name,result in results.items():
  for ext,kind in [('drawio','editable native supporting chart'),('svg','accessible static vector export'),('png','static raster export')]:
   file=HERE/f'{name}.{ext}';artifacts.append({'path':file.name,'kind':kind,'sha256':sha(file),'bytes':file.stat().st_size})
   if ext in ['drawio','svg']:
    root=ET.parse(file).getroot();ids=[e.get('id') for e in root.iter() if e.get('id')];assert len(ids)==len(set(ids));result[ext+'_xml_unique_ids']='passed'
    if ext=='svg':ns={'s':'http://www.w3.org/2000/svg'};assert root.find('s:title',ns) is not None and root.find('s:desc',ns) is not None and root.get('role')=='img';result['svg_accessible_title_desc_role']='passed'
  result['png_visual_inspection']='pending maker inspection'
 low=min(ratio(*a) for a in [(INK,BG),(MUTED,BG),(INK,'#ffffff'),('#ffffff',BLUE),('#ffffff',AMBER),('#78350f',AMBERLIGHT),(BLUE,BLUELIGHT),(GREEN,GREENLIGHT)]);assert low>=4.5
 renderer=HERE/'render_planning_charts.py';artifacts.append({'path':renderer.name,'kind':'reproducible source renderer','sha256':sha(renderer),'bytes':renderer.stat().st_size})
 m={'schema_version':1,'project':'mypaisaa-prediction','prepared_on':'2026-11-01','status':'Proposed local supporting charts, not implemented','published':False,'external_calls':0,'independent_review':'not_run','model':{'kind':'Deterministic exact-data dependency matrices and proportional budget stack','image_generation_model':None,'renderer':'Python/Pillow '+Image.__version__+' with macOS-bundled Arial','source_authority':'phase-story-map.json exact dependencies and confirmed DEC-023 exact allocation','editable_vs_exports':'Draw.io is editable; exports are generated from renderer and current JSON source. Reconcile manual chart edits into authority/renderer before re-export.','boundary':'Supporting process/dependency and planning-budget charts only; not AWS/system architecture or a replacement for canonical Lucid diagrams.'},'sources':[{'path':'../phase-story-map.json','sha256':sha(phase_path)},{'path':'../../aws-options-2026-11-01/product-decisions.json','sha256':sha(decision_path),'decision_id':'DEC-023'}],'reproduce':'python3 docs/planning/layered-development-2026-11-01/visuals/render_planning_charts.py','artifacts':artifacts,'validation':{'minimum_text_contrast_ratio':round(low,2),'text_contrast_4_5_to_1':'passed','charts':results,'application_or_live_billing_validation':'not_run'}}
 (HERE/'planning-chart-manifest.json').write_text(json.dumps(m,indent=2,ensure_ascii=False)+'\n');print(json.dumps({'chart_results':results,'minimum_contrast':round(low,2),'artifacts':artifacts},indent=2))
if __name__=='__main__':main()
