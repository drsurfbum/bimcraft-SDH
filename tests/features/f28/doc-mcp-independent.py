# SPDX-License-Identifier: Apache-2.0
"""Black-box readers of actual documentation MCP transport outputs. No app geometry code."""
import csv,io,json,sys
from pathlib import Path
import ifcopenshell,ifcopenshell.validate
import ifcopenshell.util.element as element
from pypdf import PdfReader
from pypdf.generic import ContentStream
root=Path(sys.argv[1]);expected=json.loads((root/'expected-private.json').read_text());target=root/'saved.ifc'
logger=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(str(target),logger,express_rules=True);assert not logger.statements,logger.statements
f=ifcopenshell.open(str(target));guids=[e.GlobalId for e in f.by_type('IfcRoot')];assert len(guids)==len(set(guids))
near=lambda a,b:abs(a-b)<.005
info=expected['info'];project=element.get_psets(f.by_type('IfcProject')[0]);sheets=project['CadCraft_Sheets']
assert json.loads(sheets[expected['sheet']])['views'][0]['ref']==info['section']
assert json.loads(sheets[expected['continuation']])['views'][0]['ref']=='f06-assemblies:2'
assert json.loads(project['CadCraft_CalloutViews'][expected['callout']])['parent']==info['rcp']
dim=json.loads(element.get_psets(f.by_guid(expected['dimension']))['CadCraft_WallDimension']['Spec']);assert dim['view']==info['rcp']
for ref in dim['refs']:assert f.by_guid(ref['wall']).is_a('IfcWall')
hatch=element.get_psets(f.by_guid(expected['hatch']))['CadCraft_Drafting'];assert hatch['Pattern']=='cross' and hatch['PatternScale']==2
rows={}
def text(x):return '' if x is None else str(x).lower() if isinstance(x,bool) else str(x)
for name,table in expected['csvExpected'].items():
 actual=list(csv.reader(io.StringIO((root/(name+'.csv')).read_text(encoding='utf-8-sig'),newline='')))
 wanted=[[text(x) for x in row] for row in [table['csvHead'],*table['csvRows']]];assert actual==wanted,(name,len(actual),len(wanted));rows[name]=len(actual)-1
assert rows['legend']==15
def page_bounds(page,reader):
 box=list(map(float,page.mediabox));x0,y0,x1,y1=box
 assert x1>x0 and y1>y0 and x1-x0<4000 and y1-y0<4000,box
 matrix=(1,0,0,1,0,0);stack=[];vertices=0;clip=None;rectangle=None;clipped=0
 def transform(x,y):
  a,b,c,d,e,f=matrix;return a*x+c*y+e,b*x+d*y+f
 def point(x,y):
  nonlocal vertices,clipped
  x,y=transform(x,y)
  if not (x0-.5<=x<=x1+.5 and y0-.5<=y<=y1+.5):
   assert clip is not None and x0-.5<=clip[0]<=clip[2]<=x1+.5 and y0-.5<=clip[1]<=clip[3]<=y1+.5,('visible path outside page',x,y,box)
   clipped+=1
  vertices+=1
 for args,op in ContentStream(page.get_contents(),reader).operations:
  v=list(map(float,args)) if op in [b'cm',b'm',b'l',b'c',b'v',b'y',b're'] else []
  if op==b'q':stack.append((matrix,clip))
  elif op==b'Q':matrix,clip=stack.pop()
  elif op==b'cm':
   a,b,c,d,e,f=matrix;A,B,C,D,E,F=v
   matrix=(a*A+c*B,b*A+d*B,a*C+c*D,b*C+d*D,a*E+c*F+e,b*E+d*F+f)
  elif op in [b'm',b'l',b'c',b'v',b'y']:
   for i in range(0,len(v),2):point(v[i],v[i+1])
  elif op in [b'W',b'W*']:
   assert rectangle is not None,'Expected explicit native rectangle clip'
   a,b,c,d=rectangle;assert x0-.5<=a<=c<=x1+.5 and y0-.5<=b<=d<=y1+.5
   clip=rectangle if clip is None else (max(a,clip[0]),max(b,clip[1]),min(c,clip[2]),min(d,clip[3]))
  elif op==b're':
   x,y,w,h=v
   ends=[transform(x,y),transform(x+w,y+h)];rectangle=(min(p[0] for p in ends),min(p[1] for p in ends),max(p[0] for p in ends),max(p[1] for p in ends))
   for X,Y in [(x,y),(x+w,y),(x+w,y+h),(x,y+h)]:point(X,Y)
 assert not stack
 return {'mediaBox':box,'pathVerticesChecked':vertices,'rawVerticesOutsidePageUnderVerifiedClip':clipped,'visiblePathsBounded':True}
reports=[];PT=72/25.4
for entry in expected['exports']:
 if entry['format']!='pdf':continue
 filename=entry['name']+'.pdf';print('CHECK',filename,flush=True);reader=PdfReader(root/filename);assert len(reader.pages)==entry['pages'];paths=0;bounds=[]
 for index,page in enumerate(reader.pages):
  print('PAGE',index+1,flush=True)
  bounds.append(page_bounds(page,reader));assert not page.get('/Resources',{}).get('/XObject'),'Unexpected raster XObjects'
  paths+=sum(op in [b'm',b'l',b'c'] for args,op in ContentStream(page.get_contents(),reader).operations)
 assert paths>0;reports.append({'file':filename,'pages':len(reader.pages),'vectorPaths':paths,'rasterImages':0,'pageBounds':bounds})
 if filename=='section.pdf':
  color=stroke=None;polys=[];poly=[];fills=[];membranes=[];dash=[]
  for args,op in ContentStream(reader.pages[0].get_contents(),reader).operations:
   if op==b'rg':color=tuple(map(float,args))
   if op==b'g':color=None
   if op==b'RG':stroke=tuple(map(float,args))
   if op==b'G':stroke=None
   if op==b'd':dash=list(map(float,args[0]))
   if op==b'm':poly=[tuple(map(float,args))];polys.append(poly)
   if op==b'l':poly.append(tuple(map(float,args)))
   if op in [b'f',b'f*']:
    if color:fills.extend((color,p) for p in polys)
    polys=[];poly=[]
   if op==b'S':
    if stroke and abs(stroke[0]-163/255)<1e-6 and dash:membranes.extend(polys)
    polys=[];poly=[]
   if op==b'n':polys=[];poly=[]
  first=[fills[i*2][1] for i in range(4)];widths=[19.05,12.7,139.7,12.7]
  errors=[]
  for p,w in zip(first,widths):errors.append(abs((max(x for x,y in p)-min(x for x,y in p))/PT*20-w))
  assert max(errors)<.005,(filename,errors)
  cavity=(min(x for x,y in first[1])-max(x for x,y in first[0]))/PT*20;assert near(cavity,25.4)
  assert membranes and all(max(x for x,y in p)-min(x for x,y in p)<1e-8 for p in membranes)
  reports[-1].update(maxLayerErrorMm=max(errors),cavityMm=cavity,membranePaths=len(membranes))
report={'status':'PASS','schemaFindings':0,'duplicateGlobalIds':0,'walls':len(f.by_type('IfcWall')),'persistentDimensions':len([a for a in f.by_type('IfcAnnotation') if 'CadCraft_WallDimension' in element.get_psets(a)]),'csvRows':rows,'pdfs':reports,'pages':sum(r['pages'] for r in reports)}
(root/'independent.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
