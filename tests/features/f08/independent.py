# SPDX-License-Identifier: Apache-2.0
"""Read actual IFC bodies, layers, joins and vector paths with independent readers.
Shapely is test-only; no application geometry implementation is imported or copied.
"""
import csv,json,math,sys
from pathlib import Path
import ifcopenshell
import ifcopenshell.validate
import ifcopenshell.util.element as element
import ifcopenshell.util.placement as placement
import ifcopenshell.util.unit as unit
from shapely.geometry import Polygon
from shapely.ops import unary_union
from pypdf import PdfReader
from pypdf.generic import ContentStream
root=Path(sys.argv[1] if len(sys.argv)>1 else '.cc-test/f08')
def near(a,b): assert abs(a-b)<.005,(a,b)
def physical(file,expected,check_overlap=True):
 logger=ifcopenshell.validate.json_logger()
 ifcopenshell.validate.validate(str(file),logger,express_rules=True)
 assert not logger.statements,(str(file),logger.statements)
 f=ifcopenshell.open(str(file));factor=unit.calculate_unit_scale(f)*1000
 gids=[o.GlobalId for o in f.by_type('IfcRoot')];assert len(gids)==len(set(gids))
 polygons=[];vertical=[];actual={}
 for wall in expected['walls']:
  obj=f.by_guid(wall['guid']);ps=element.get_psets(obj)['CadCraft_Wall']
  assert ps['TypeKey']==wall['typeKey'] and ps.get('ExteriorSide')==wall['extSide']
  assert element.get_type(obj).GlobalId==wall['assembly']['guid']
  body=next(r for r in obj.Representation.Representations if r.RepresentationIdentifier=='Body').Items[0]
  assert body.is_a('IfcExtrudedAreaSolid') and body.SweptArea.is_a('IfcArbitraryClosedProfileDef')
  near(body.Depth*factor,wall['height'])
  points=[(float(p.Coordinates[0])*factor,float(p.Coordinates[1])*factor) for p in body.SweptArea.OuterCurve.Points]
  shape=Polygon(points);assert shape.is_valid and not shape.is_empty and shape.area>0 and shape.exterior.is_ccw
  expected_points=next(s['points'] for s in expected['shapes'] if s['guid']==wall['guid'])
  assert shape.hausdorff_distance(Polygon(expected_points))<.005
  matrix=placement.get_local_placement(obj.ObjectPlacement)
  world=[(matrix[0,0]*x+matrix[0,1]*y+matrix[0,3]*factor,matrix[1,0]*x+matrix[1,1]*y+matrix[1,3]*factor) for x,y in points]
  poly=Polygon(world);polygons.append(poly);vertical.append((matrix[2,3]*factor,matrix[2,3]*factor+float(body.Depth)*factor));actual[wall['guid']]=poly
  if 'CadCraft_WallJoin' in element.get_psets(obj):
   settings=json.loads(element.get_psets(obj)['CadCraft_WallJoin']['Settings'])
   assert settings==wall['joinSettings'] and settings['version']==1
 for a in range(len(polygons)):
  for b in range(a):
   # Strictly joined fixture, not an intentionally disallowed intersecting end.
   if not check_overlap:continue
   if min(vertical[a][1],vertical[b][1])-max(vertical[a][0],vertical[b][0])<=.005:continue
   assert polygons[a].intersection(polygons[b]).area<.05,(file,a,b,polygons[a].intersection(polygons[b]).area)
 for ty in expected['types']:
  obj=f.by_guid(ty['guid']);recipe=json.loads(element.get_psets(obj)['CadCraft_WallType']['Recipe']);assert recipe['layers']==ty['layers']
  layers=obj.HasAssociations[0].RelatingMaterial.MaterialLayers
  assert len(layers)==len(recipe['layers'])
  for l,r in zip(layers,recipe['layers']):
   near(l.LayerThickness*factor,r['t'])
   if r['kind']=='cavity':assert l.Material is None and l.IsVentilated is True and r['t']>0
   if r['t']==0:assert l.LayerThickness==0 and r['function']=='membrane'
 for d in expected['dims']:
  spec=json.loads(element.get_psets(f.by_guid(d['guid']))['CadCraft_WallDimension']['Spec'])
  assert spec['refs']==d['refs'] and d['resolved']['status']=='ok'
  for r in spec['refs']:assert f.by_guid(r['wall']).is_a('IfcWall')
 for o in expected['openings']:
  obj=f.by_guid(o['guid']);assert obj.FillsVoids[0].RelatingOpeningElement.VoidsElements[0].RelatingBuildingElement.GlobalId==o['wallGuid']
  ps=element.get_psets(obj)['CadCraft_Window'];near(ps['Width']*factor,o['width']);near(ps['Height']*factor,o['height'])
 return {'file':str(file),'schemaFindings':0,'walls':len(polygons),'overlapChecked':check_overlap,'overlapAreaToleranceMm2':.05 if check_overlap else None,'zeroMembranes':True,'ventilatedCavities':True},actual
def ideal_union(walls,through=False):
 # Independent envelope oracle: intersect offset face support lines, then
 # cap each ray with a straight seam. The application uses piecewise CORE
 # seams; only their combined external envelope must equal this analytic one.
 p=walls[1]['a'] if through else walls[0]['a']
 rays=[]
 for index,w in enumerate(walls):
  a,b=w['a'],w['b'];dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy);u=(dx/length,dy/length)
  rays.append((u,w['t']/2,b))
  if through and index==0:rays.append(((-u[0],-u[1]),w['t']/2,a))
 rays.sort(key=lambda r:math.atan2(r[0][1],r[0][0]));corners=[]
 for i,(u,h,far) in enumerate(rays):
  v,k,_=rays[(i+1)%len(rays)];n=(-u[1],u[0]);m=(-v[1],v[0]);den=n[0]*m[1]-n[1]*m[0]
  if abs(den)<1e-10:c=(p[0]+n[0]*h,p[1]+n[1]*h)
  else:
   d=n[0]*p[0]+n[1]*p[1]+h;e=m[0]*p[0]+m[1]*p[1]-k
   c=((d*m[1]-n[1]*e)/den,(n[0]*e-d*m[0])/den)
  corners.append(c)
 parts=[]
 for i,(u,h,far) in enumerate(rays):
  n=(-u[1],u[0]);ring=[corners[(i-1)%len(rays)],(far[0]-n[0]*h,far[1]-n[1]*h),(far[0]+n[0]*h,far[1]+n[1]*h),corners[i]]
  if len(rays)>2:ring.append(p)
  polygon=Polygon(ring);assert polygon.is_valid and polygon.area>0
  parts.append(polygon)
 return unary_union(parts)
reports=[]
for name in ['seed','edited']:
 path=root/(name+'.ifc')
 if path.exists():
  expected=json.loads((root/(name+'.json')).read_text());report,polys=physical(path,expected);reports.append(report)
compat=root.parent/'f08-07'
for name in ['multilevel','copied']:
 file=compat/(name+'.ifc')
 if file.exists():
  expected=json.loads((compat/(name+'.json')).read_text());r,polys=physical(file,expected,check_overlap=name!='copied');reports.append(r)
  if name=='multilevel':
   assert len(expected['walls'])==16
   for wall in expected['walls']:near(wall['baseOffset'],125);near(wall['height'],6700)
  else:
   assert len(expected['walls'])==32
   groups={}
   for wall in expected['walls']:groups.setdefault(wall['storey'],[]).append(wall)
   assert len(groups)==2 and all(len(rows)==16 for rows in groups.values())
   source,copies=groups.values();assert any(not w['joinSettings'][e]['allow'] for w in source for e in ['a','b'])
   matched=[]
   for wall in source:
    candidates=[x for x in copies if x['a']==wall['a'] and x['b']==wall['b'] and x['typeKey']==wall['typeKey']]
    assert len(candidates)==1
    copy=candidates[0];assert polys[wall['guid']].hausdorff_distance(polys[copy['guid']])<.005
    matched.append((polys[wall['guid']],polys[copy['guid']]))
   source_overlap=sum(a[0].intersection(b[0]).area for i,a in enumerate(matched) for b in matched[:i])
   copy_overlap=sum(a[1].intersection(b[1]).area for i,a in enumerate(matched) for b in matched[:i])
   assert abs(source_overlap-copy_overlap)<.00001
   reports.append({'copiedWallPairs':16,'intentionalSquareDisallowOverlapPreservedMm2':source_overlap,'copyOverlapDifferenceMm2':abs(source_overlap-copy_overlap)})
browser=root/'browser'
if (browser/'saved.ifc').exists():
 expected=json.loads((browser/'expected.json').read_text());r,polys=physical(browser/'saved.ifc',expected);reports.append(r)
 if (browser/'multilevel-saved.ifc').exists():
  extra=json.loads((browser/'multilevel-expected.json').read_text());r,_=physical(browser/'multilevel-saved.ifc',extra);reports.append(r)
 rows=list(csv.DictReader((browser/'assemblies.csv').open(encoding='utf-8-sig',newline='')))
 for ty in expected['types']:
  layer_rows=[r for r in rows if r['record_kind']=='layer' and r['type_key']==ty['key']]
  assert len(layer_rows)==len(ty['layers'])
  for l,r in zip(ty['layers'],layer_rows):
   near(l['t'],float(r['nominal_thickness_mm']));assert r['core']==str(l['core']).lower()
   if l['kind']=='cavity':assert r['cavity_ventilation']=='ventilated'
 # Check every CSV cell against records in the actual downloaded IFC, including
 # summaries, identities, localized usage, material names, empty fields and order.
 saved=ifcopenshell.open(str(browser/'saved.ifc'))
 strings=json.loads(Path('app/lang/en.json').read_text())
 library=json.loads(element.get_psets(saved.by_type('IfcProject')[0])['CadCraft_MaterialLibrary']['Library'])
 materials={m['id']:m for m in library['materials']}
 recipes=[]
 for ty in saved.by_type('IfcWallType'):
  ps=element.get_psets(ty).get('CadCraft_WallType',{})
  if 'Recipe' in ps:recipes.append((json.loads(ps['Recipe']),ty.GlobalId))
 used={element.get_psets(w).get('CadCraft_Wall',{}).get('TypeKey') for w in saved.by_type('IfcWall')}
 headers=['record_kind','type_key','type_guid','assembly_name','usage','layer_exterior_to_interior','material_id','material_name','function','core','nominal_thickness_mm','cavity_ventilation','membrane','total_thickness_mm','core_thickness_mm','status','raw_record']
 with (browser/'assemblies.csv').open(encoding='utf-8-sig',newline='') as stream:assert csv.DictReader(stream).fieldnames==headers
 complete=[]
 for recipe,guid in sorted(recipes,key=lambda item:item[0]['key']):
  prefix=[recipe['key'],guid,recipe['name'],strings['asched.used' if recipe['key'] in used else 'asched.unused']]
  for i,layer in enumerate(recipe['layers']):
   cavity=layer['kind']=='cavity'
   complete.append(['layer',*prefix,str(i+1),'' if cavity else layer['materialId'],strings['asched.cavity'] if cavity else materials[layer['materialId']]['name'],layer['function'],str(layer['core']).lower(),layer['t'],layer['ventilation'] if cavity else '',str(layer['function']=='membrane').lower(),'','','ok',''])
  complete.append(['assembly-summary',*prefix,'','','','','','','','',sum(l['t'] for l in recipe['layers']),sum(l['t'] for l in recipe['layers'] if l['core']),'ok',''])
 assert len(rows)==len(complete)
 for row,wanted in zip(rows,complete):
  assert len(wanted)==len(headers)
  for column,value in zip(headers,wanted):
   if isinstance(value,(int,float)):assert abs(float(row[column])-value)<1e-10,(column,row[column],value)
   else:assert row[column]==value,(column,row[column],value)
 reports.append({'completeCsvComparedToActualIfc':True,'csvRows':len(rows),'columns':len(headers),'checkedCells':len(rows)*len(headers)})
 # Enlarged detail: compare actual PDF fill path geometry to shared world polygons
 # at an independently calculated paper transform (A3, ratio 10, declared crop).
 reader=PdfReader(browser/'detail.pdf');assert len(reader.pages)==1
 page=reader.pages[0];assert not page.get('/Resources',{}).get('/XObject')
 fills=[];paths=[];current=[];color=None
 for args,operator in ContentStream(page.get_contents(),reader).operations:
  if operator==b'rg':color=tuple(map(float,args))
  if operator==b'g':color=None
  if operator==b'm':current=[tuple(map(float,args))];paths.append(current)
  if operator==b'l':current.append(tuple(map(float,args)))
  if operator in [b'f',b'f*']:
   if color:fills.extend(Polygon(p) for p in paths if len(p)>2 and Polygon(p).area>1e-12)
   paths=[];current=[]
  if operator in [b'S',b'n']:paths=[];current=[]
 assert fills and all(p.is_valid for p in fills)
 PT=72/25.4;ratio=10;crop=[10900,10400,12200,11800];width=crop[2]-crop[0];height=crop[3]-crop[1]
 ox=12+(396-width/ratio)/2-crop[0]/ratio
 oy=28+(257-height/ratio)/2-crop[1]/ratio
 painted=[]
 for wall in expected['scene']['walls']:
  for layer in wall.get('layers',[]):
   if layer['fill']=='none':continue
   for poly in layer['polys']:
    if len(poly)>2 and Polygon(poly).area>1e-6:painted.append(Polygon([((ox+x/ratio)*PT,(oy+y/ratio)*PT) for x,y in poly]))
 assert len(painted)==len(fills),(len(painted),len(fills))
 max_distance=max(min(p.hausdorff_distance(q) for q in fills) for p in painted)/PT*ratio
 assert max_distance<.005,max_distance
 for file in ['plan.pdf','detail.pdf']:
  pdf=PdfReader(browser/file);assert all(not p.get('/Resources',{}).get('/XObject') for p in pdf.pages)
 # Whole-plan export must fit its media box, independently of the cropped detail.
 whole=PdfReader(browser/'plan.pdf');outside=[];vertices=0
 for page in whole.pages:
  width,height=float(page.mediabox.width),float(page.mediabox.height)
  for args,operator in ContentStream(page.get_contents(),whole).operations:
   if operator in [b'm',b'l']:
    x,y=map(float,args);vertices+=1
    if not (-.001<=x<=width+.001 and -.001<=y<=height+.001):outside.append((x,y))
 assert vertices>100 and not outside,('Clipped whole-plan export',outside[:10])
 reports.append({'wholePlanPathVertices':vertices,'outsideMediaBox':len(outside)})
 reports.append({'actualDownloadedPlanPDF':True,'detailVectorFillPolygons':len(fills),'maxVectorGeometryErrorMm':max_distance,'rasterImages':0,'csvLayers':len([r for r in rows if r['record_kind']=='layer'])})
# Compare union/overlap without trusting renderer topology or application tests.
if (root/'audit-after.json').exists():
 before=json.loads((root/'audit-before.json').read_text());after=json.loads((root/'audit-after.json').read_text())
 old=[Polygon(p) for _,p in before['polygons']];new=[Polygon(p) for _,p in after['polygons']]
 assert all(p.is_valid and p.area>0 for p in new);assert not after['diagnostics']
 overlap=sum(a.intersection(b).area for i,a in enumerate(new) for b in new[:i])
 assert overlap<.00001,overlap
 expected=[];start=0
 for i,count in enumerate([2,2,2,2,2,4,2]):
  expected.append(ideal_union(after['walls'][start:start+count],through=i==4));start+=count
 ideal=unary_union(expected)
 union_difference=ideal.symmetric_difference(unary_union(new)).area
 assert union_difference<.001,union_difference
 baseline_difference=ideal.symmetric_difference(unary_union(old)).area
 reports.append({'idealEnvelopeDifferenceMm2':union_difference,'baselineEnvelopeDifferenceFromIdealMm2':baseline_difference,'newOverlapAreaMm2':overlap})
if (root/'matrix.json').exists():
 matrix=json.loads((root/'matrix.json').read_text());assert len(matrix)==28
 for case in matrix:
  new=[Polygon(p) for _,p in case['polygons']]
  old=[Polygon(p) for _,p in case['before']]
  assert all(p.is_valid and p.area>0 for p in new),case
  assert new[0].intersection(new[1]).area<.00001,case
  assert unary_union(new).symmetric_difference(ideal_union(case['walls'])).area<.001,case
 reports.append({'independentAngleCoreOrientationCases':len(matrix),'angles':[30,45,60,90,120,135,150],'maxAllowedOverlapMm2':.00001})
assert reports
(root/'independent.json').write_text(json.dumps(reports,indent=2)+'\n')
print('F08_INDEPENDENT '+json.dumps(reports))
