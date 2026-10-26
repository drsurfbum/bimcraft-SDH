# SPDX-License-Identifier: Apache-2.0
"""Independent readers of the actual F28-C browser downloads; no application geometry code."""
import csv,io,json,sys
from pathlib import Path
import ifcopenshell
import ifcopenshell.validate
import ifcopenshell.util.element as element
from pypdf import PdfReader
from pypdf.generic import ContentStream
root=Path(sys.argv[1] if len(sys.argv)>1 else '.cc-test/f28-c-browser')
expected=json.loads((root/'expected.json').read_text());target=root/'saved.ifc'
logger=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(str(target),logger,express_rules=True)
assert not logger.statements,logger.statements
f=ifcopenshell.open(str(target));guids=[x.GlobalId for x in f.by_type('IfcRoot')];assert len(guids)==len(set(guids))
near=lambda a,b:abs(a-b)<.005
for wall in expected['walls']:
 obj=f.by_guid(wall['guid']);p=element.get_psets(obj)['CadCraft_Wall'];assert p['TypeKey']==wall['typeKey'];assert near(p['Height'],wall['height']);assert near(p['BaseOffset'],wall['baseOffset']);assert element.get_type(obj).GlobalId==wall['assembly']['guid']
rows=list(csv.DictReader(io.StringIO((root/'assemblies.csv').read_text(encoding='utf-8-sig'),newline='')))
for recipe in expected['assemblies']:
 ty=f.by_guid(recipe['guid']);payload=json.loads(element.get_psets(ty)['CadCraft_WallType']['Recipe']);assert payload['key']==recipe['key'];assert payload['layers']==recipe['layers']
 physical=ty.HasAssociations[0].RelatingMaterial.MaterialLayers
 actual=[r for r in rows if r['record_kind']=='layer' and r['type_key']==recipe['key']];assert len(actual)==len(recipe['layers'])==len(physical)
 for i,(layer,ifc_layer,row) in enumerate(zip(recipe['layers'],physical,actual)):
  assert near(ifc_layer.LayerThickness,layer['t']);assert int(row['layer_exterior_to_interior'])==i+1;assert near(float(row['nominal_thickness_mm']),layer['t']);assert row['core']==str(layer['core']).lower()
  if layer['kind']=='cavity':assert ifc_layer.Material is None and row['cavity_ventilation']==layer['ventilation']
  if layer['t']==0:assert layer['function']=='membrane' and ifc_layer.LayerThickness==0
for guid,refs,resolved in expected['dims']:
 assert json.loads(element.get_psets(f.by_guid(guid))['CadCraft_WallDimension']['Spec'])['refs']==refs;assert resolved['status']=='ok'
 for ref in refs:assert f.by_guid(ref['wall']).is_a('IfcWall')
for d in expected['drafting']:
 p=element.get_psets(f.by_guid(d['guid']))['CadCraft_Drafting'];assert p['View']==d['view'];assert p['Kind']==d['kind'];assert p['Pattern']==d['pattern'];assert near(p['PatternScale'],d['scale'])
project=element.get_psets(f.by_type('IfcProject')[0]);sheets=project['CadCraft_Sheets']
for c in expected['callouts']:
 stored=json.loads(project['CadCraft_CalloutViews'][c['id']]);assert stored['parent']==c['parent'];assert stored['crop']==c['crop'];assert stored['scale']==c['scale']
for s in expected['sheets']:
 stored=json.loads(sheets[s['id']]);assert stored['views']==s['views'];assert stored['number']==s['number']
 for v in s['views']:
  if v['kind']=='section':assert f.by_guid(v['ref']).is_a('IfcAnnotation')
assert any(v['ref']=='f06-assemblies:2' for s in expected['sheets'] for v in s['views'])
for guid,v in expected['projected']:assert json.loads(project['CadCraft_ProjectedViews']['section:'+guid])==v
legend=list(csv.DictReader(io.StringIO((root/'legend.csv').read_text(encoding='utf-8-sig'),newline='')));assert any(r['symbol_kind']=='cavity' for r in legend)
def page_bounds(page,reader):
 box=list(map(float,page.mediabox));x0,y0,x1,y1=box
 assert x1>x0 and y1>y0 and x1-x0<4000 and y1-y0<4000,box
 matrix=(1,0,0,1,0,0);stack=[];vertices=0
 def transform(x,y):
  a,b,c,d,e,f=matrix;return a*x+c*y+e,b*x+d*y+f
 def point(x,y):
  nonlocal vertices
  x,y=transform(x,y);assert x0-.5<=x<=x1+.5 and y0-.5<=y<=y1+.5,('outside page',x,y,box)
  vertices+=1
 for args,op in ContentStream(page.get_contents(),reader).operations:
  v=list(map(float,args)) if op in [b'cm',b'm',b'l',b'c',b'v',b'y',b're'] else []
  if op==b'q':stack.append(matrix)
  elif op==b'Q':matrix=stack.pop()
  elif op==b'cm':
   a,b,c,d,e,f=matrix;A,B,C,D,E,F=v
   matrix=(a*A+c*B,b*A+d*B,a*C+c*D,b*C+d*D,a*E+c*F+e,b*E+d*F+f)
  elif op in [b'm',b'l',b'c',b'v',b'y']:
   for i in range(0,len(v),2):point(v[i],v[i+1])
  elif op==b're':
   x,y,w,h=v
   for X,Y in [(x,y),(x+w,y),(x+w,y+h),(x,y+h)]:point(X,Y)
 assert not stack
 return {'mediaBox':box,'pathVerticesWithinPage':vertices}
reports=[];PT=72/25.4
for filename in ['annotated-plan.pdf','section.pdf','edited-section.pdf','elevation.pdf','assemblies.pdf','legend.pdf','continuation-sheet.pdf','drawing-sheet.pdf']:
 reader=PdfReader(root/filename);paths=0;bounds=[]
 for page in reader.pages:
  bounds.append(page_bounds(page,reader))
  assert not page.get('/Resources',{}).get('/XObject'),'Unexpected raster XObjects'
  paths+=sum(op in [b'm',b'l',b'c'] for args,op in ContentStream(page.get_contents(),reader).operations)
 assert paths>50;reports.append({'file':filename,'pages':len(reader.pages),'vectorPaths':paths,'rasterImages':0,'pageBounds':bounds})
 # Independently measure actual section material bands and blank cavity at the persisted 1:20 scale.
 if filename in ['section.pdf','edited-section.pdf']:
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
  first=[fills[i*2][1] for i in range(4)];widths=[25.4 if filename.startswith('edited') else 19.05,12.7,139.7,12.7]
  errors=[]
  for p,w in zip(first,widths):errors.append(abs((max(x for x,y in p)-min(x for x,y in p))/PT*20-w))
  assert max(errors)<.005,(filename,errors)
  cavity=(min(x for x,y in first[1])-max(x for x,y in first[0]))/PT*20;assert near(cavity,25.4)
  assert membranes and all(max(x for x,y in p)-min(x for x,y in p)<1e-8 for p in membranes)
  reports[-1].update(maxLayerErrorMm=max(errors),cavityMm=cavity,membranePaths=len(membranes))
report={'schemaFindings':0,'walls':len(expected['walls']),'types':len(expected['assemblies']),'persistentDimensions':len(expected['dims']),'annotations':len(expected['drafting']),'sheets':len(expected['sheets']),'csvLayers':len([r for r in rows if r['record_kind']=='layer']),'legendRows':len(legend),'pdfs':reports,'actualDownload':str(target)}
(root/'independent.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
