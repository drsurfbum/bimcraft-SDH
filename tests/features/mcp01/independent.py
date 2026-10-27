# SPDX-License-Identifier: Apache-2.0
"""Independent IFC/EXPRESS and actual geometry checks on saved MCP output. Never imports app code."""
import json, sys, math
from pathlib import Path
import numpy as np
import ifcopenshell
import ifcopenshell.validate
import ifcopenshell.util.element as element
import ifcopenshell.util.placement as placement
import ifcopenshell.util.unit as unit

root=Path(sys.argv[1] if len(sys.argv)>1 else '.cc-test/mcp01-headless')
expected=json.loads((root/'expected.json').read_text());target=root/'saved.ifc'
logger=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(str(target),logger,express_rules=True)
assert not logger.statements,logger.statements
f=ifcopenshell.open(str(target));scale=unit.calculate_unit_scale(f)*1000
near=lambda a,b: abs(float(a)-float(b))<.005
guids=[x.GlobalId for x in f.by_type('IfcRoot')];assert len(guids)==len(set(guids))
walls=f.by_type('IfcWall');assert len(walls)==len(expected['walls'])
types={t['key']:t for t in expected['assemblies']}
for wall in expected['walls']:
 obj=f.by_guid(wall['guid']);assert obj.is_a('IfcWall')
 p=element.get_psets(obj)['CadCraft_Wall'];assert p['TypeKey']==wall['type']
 for name,value in [('Length',wall['length']),('Thickness',wall['thickness']),('Height',wall['height']),('BaseOffset',wall['baseOffset']),('TopOffset',wall['topOffset'])]:assert near(p[name]*scale,value),(wall['guid'],name,p[name],value)
 assert p.get('Justification','center')==wall['locationLine'];assert p['ExteriorSide']==wall['exteriorSide'];assert p.get('TopLevel','')==wall['topLevel']
 assert element.get_type(obj).GlobalId==wall['typeGuid']
 storey=element.get_container(obj);assert storey.GlobalId==wall['levelId']
 matrix=np.linalg.inv(placement.get_local_placement(storey.ObjectPlacement)) @ placement.get_local_placement(obj.ObjectPlacement)
 assert near(matrix[0,3]*scale,wall['a'][0]);assert near(matrix[1,3]*scale,wall['a'][1])
 # Independent straight-axis endpoint and stored Body extrusion heights.
 theta=4*math.atan(wall.get('bulge') or 0);chord=wall['length'] if abs(theta)<1e-12 else wall['length']*math.sin(theta/2)/(theta/2)
 assert near(matrix[0,3]*scale+matrix[0,0]*chord,wall['b'][0]);assert near(matrix[1,3]*scale+matrix[1,0]*chord,wall['b'][1])
 body=next(r for r in obj.Representation.Representations if r.RepresentationIdentifier=='Body')
 depths=[item.Depth*scale for item in f.traverse(body) if item.is_a('IfcExtrudedAreaSolid')]
 assert depths and any(near(depth,wall['height']) for depth in depths),(wall['guid'],depths,wall['height'])
 actual_openings=[]
 for relation in obj.HasOpenings:
  opening=relation.RelatedOpeningElement
  for filling in opening.HasFillings:
   actual_openings.append(filling.RelatedBuildingElement.GlobalId)
 assert set(actual_openings)=={o['guid'] for o in wall['openings']}
 for opening in wall['openings']:
  product=f.by_guid(opening['guid']);assert near(product.OverallWidth*scale,opening['width']);assert near(product.OverallHeight*scale,opening['height'])
library=json.loads(element.get_psets(f.by_type('IfcProject')[0])['CadCraft_MaterialLibrary']['Library']);assert library['version']==1
assert sorted(library['materials'],key=lambda m:m['id'])==sorted(expected['materials'],key=lambda m:m['id'])
stored={}
for obj in f.by_type('IfcWallType'):
 psets={p.Name:p for p in obj.HasPropertySets or []}
 if 'CadCraft_WallType' not in psets:continue
 p={p.Name:p.NominalValue.wrappedValue for p in psets['CadCraft_WallType'].HasProperties}
 if 'Recipe' not in p:continue
 recipe=json.loads(p['Recipe']);stored[recipe['key']]=recipe
 wanted=types[recipe['key']];assert obj.GlobalId==wanted['guid'];assert recipe['layers']==wanted['layers']
 assert recipe['exterior']==wanted['exterior'];assert recipe['name']==wanted['name']
 layer_set=next(r.RelatingMaterial for r in obj.HasAssociations if r.is_a('IfcRelAssociatesMaterial'))
 assert len(layer_set.MaterialLayers)==len(recipe['layers'])
 for actual,layer in zip(layer_set.MaterialLayers,recipe['layers']):
  assert near(actual.LayerThickness*scale,layer['t']);assert actual.Category==layer['function']
  if layer['kind']=='cavity':assert actual.Material is None;assert actual.IsVentilated==(layer['ventilation']=='ventilated')
  else:assert actual.Material is not None
assert 'wall-mcp01-unused' in stored
assert any(l['t']==0 and l['function']=='membrane' for l in stored['wall-mcp01']['layers'])
assert any(l['kind']=='cavity' and l['ventilation']=='ventilated' for l in stored['wall-mcp01']['layers'])
original=ifcopenshell.open('fixtures/f04/layered-plans.ifc')
dimensions=0
for annotation in original.by_type('IfcAnnotation'):
 before=element.get_psets(annotation).get('CadCraft_WallDimension')
 if not before:continue
 after=element.get_psets(f.by_guid(annotation.GlobalId))['CadCraft_WallDimension'];assert json.loads(after['Spec'])==json.loads(before['Spec'])
 # Geometry's resolved points must stay within F02 tolerance when editing an unrelated wall/type.
 a=json.loads(after['Geometry']);b=json.loads(before['Geometry'])
 for p,q in zip(a[:2],b[:2]):assert all(near(x,y) for x,y in zip(p,q))
 dimensions+=1
if (root/'original-saved.ifc').exists():
 untouched=ifcopenshell.open(str(root/'original-saved.ifc'));assert len(untouched.by_type('IfcWall'))==len(original.by_type('IfcWall'))
 for old in original.by_type('IfcWall'):
  assert element.get_psets(untouched.by_guid(old.GlobalId))['CadCraft_Wall']==element.get_psets(old)['CadCraft_Wall']
alias=ifcopenshell.open(str(root/'alias-source.ifc'));alias_logger=ifcopenshell.validate.json_logger();ifcopenshell.validate.validate(alias,alias_logger,express_rules=True);assert not alias_logger.statements,alias_logger.statements
assert any(p.Name=='OrdinaryAlias' for p in alias.by_type('IfcPropertySet'))
report={'aliasSchemaFindings':len(alias_logger.statements),'status':'PASS','reader':'IfcOpenShell '+ifcopenshell.version,'file':target.name,'schemaFindings':len(logger.statements),'walls':len(walls),'authoredTypes':len(stored),'materials':len(library['materials']),'preservedDimensions':dimensions,'checks':['EXPRESS validation','unique GlobalIds','exact wall/type/material properties','independent placement and Body extrusion geometry','actual door/window products','cavity/ventilation/membrane IFC layers','unused definitions','unchanged original dimension specifications and points']}
(root/'independent.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
