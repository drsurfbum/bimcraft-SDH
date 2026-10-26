# SPDX-License-Identifier: Apache-2.0
"""Validate actual semantic-transport saves using IFC/EXPRESS and independent physical polygons."""
import json,sys,math
from pathlib import Path
import ifcopenshell
import ifcopenshell.validate
import ifcopenshell.util.element as element
import ifcopenshell.util.placement as placement
import ifcopenshell.util.unit as unit
from shapely.geometry import Polygon
from shapely.ops import unary_union
root=Path(sys.argv[1]); expected=json.loads((root/'expected.json').read_text())
file=root/'saved.ifc';logger=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(str(file),logger,express_rules=True)
assert not logger.statements,logger.statements
f=ifcopenshell.open(str(file));factor=unit.calculate_unit_scale(f)*1000
ids=[x.GlobalId for x in f.by_type('IfcRoot')];assert len(ids)==len(set(ids))
polygons=[];vertices=0
for r in expected['readbacks']:
 w=f.by_guid(r['wall']);ps=element.get_psets(w)
 if r['record']['present']:assert json.loads(ps['CadCraft_WallJoin']['Settings'])==r['record']['persisted']
 else:assert 'CadCraft_WallJoin' not in ps
 body=next(x for x in w.Representation.Representations if x.RepresentationIdentifier=='Body').Items[0]
 assert body.is_a('IfcExtrudedAreaSolid') and body.SweptArea.is_a('IfcArbitraryClosedProfileDef')
 points=[tuple(float(c)*factor for c in p.Coordinates[:2]) for p in body.SweptArea.OuterCurve.Points]
 polygon=Polygon(points);reference=Polygon(r['geometry']['physical']['points'])
 assert polygon.is_valid and polygon.area>0 and polygon.exterior.is_ccw
 assert polygon.hausdorff_distance(reference)<.005
 assert abs(float(body.Depth)*factor-r['geometry']['height'])<.005
 matrix=placement.get_local_placement(w.ObjectPlacement)
 polygons.append(Polygon([(matrix[0,0]*x+matrix[0,1]*y+matrix[0,3]*factor,matrix[1,0]*x+matrix[1,1]*y+matrix[1,3]*factor)for x,y in points]));vertices+=len(points)
 row=next(x for x in expected['walls']if x['guid']==r['wall'])
 assert element.get_type(w).GlobalId==row['typeGuid']
 for opening in row['openings']:
  o=f.by_guid(opening['guid']);assert o.FillsVoids[0].RelatingOpeningElement.VoidsElements[0].RelatingBuildingElement.GlobalId==r['wall']
  p=element.get_psets(o)['CadCraft_'+('Window'if opening['kind']=='window'else'Door')]
  for key in ['width','height']:assert abs(p[key.title()]*factor-opening[key])<.005
# Final semantic workflow explicitly restores envelope/allow at all exercised ends.
# Use the retained saved-IFC 0.05 mm² serialization bound, not the stricter
# unrounded 28-case matrix bound (0.00001 mm²), which is checked separately.
# Independent square/disallow cases remain in the separate retained F08 matrix.
overlap=sum(p.intersection(q).area for i,p in enumerate(polygons)for q in polygons[:i]);assert overlap<.05,overlap
original=ifcopenshell.open(str(root/'original.ifc'));dimensions=[]
for obj in original.by_type('IfcProduct'):
 p=element.get_psets(obj).get('CadCraft_WallDimension')
 if p:
  actual=element.get_psets(f.by_guid(obj.GlobalId))['CadCraft_WallDimension']
  assert {k:v for k,v in actual.items()if k!='id'}=={k:v for k,v in p.items()if k!='id'};dimensions.append(obj.GlobalId)
assert dimensions
report={'status':'PASS','head':expected.get('head'),'schemaExpressFindings':0,'walls':len(polygons),'physicalVertices':vertices,'maxProfileToleranceMm':.005,'overlapAreaMm2':overlap,'overlapBoundMm2':.05,'dimensionRecordsUnchanged':len(dimensions),'openingsAndTypes':True,'ifcopenshell':ifcopenshell.version}
(root/'independent.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
