"""Independently inspect actual unit, source/package MCP and native UI/live saved IFC."""
import json
import math
import os
from pathlib import Path
import ifcopenshell
import ifcopenshell.util.placement
import ifcopenshell.util.unit

def near(a,b):
    assert len(a)==len(b)
    assert all(abs(x-y)<.005 for x,y in zip(a,b)),(a,b)

def inspect(file,expected_file):
    expected=json.loads(expected_file.read_text())
    f=ifcopenshell.open(str(file))
    factor=ifcopenshell.util.unit.calculate_unit_scale(f)*1000
    def transformed(point,transform):
        p=list(point.Coordinates)+[0]*(3-len(point.Coordinates))
        return [sum(transform[i,j]*p[j] for j in range(3))*factor+transform[i,3]*factor for i in range(2)]
    wall=f.by_guid(expected['wall'])
    matrix=ifcopenshell.util.placement.get_local_placement(wall.ObjectPlacement)
    axis=next(r for r in wall.Representation.Representations if r.RepresentationIdentifier=='Axis').Items[0]
    assert axis.is_a('IfcPolyline'),'Affected wall must be straight; no chord approximation'
    near(transformed(axis.Points[0],matrix),expected['a'])
    near(transformed(axis.Points[-1],matrix),expected['b'])
    for guid in expected['openings']:
        assert f.by_guid(guid),guid
    for host in expected.get('hosts',[]):
        product=f.by_guid(host['guid'])
        opening=product if product.is_a('IfcOpeningElement') else product.FillsVoids[0].RelatingOpeningElement
        assert opening.VoidsElements[0].RelatingBuildingElement.GlobalId==host['wallGuid']
    for d in expected['dimensions']:
        a=f.by_guid(d['guid'])
        assert d['status']=='ok'
        transform=ifcopenshell.util.placement.get_local_placement(a.ObjectPlacement)
        curves=a.Representation.Representations[0].Items[0].Elements
        normal=[-(d['b'][1]-d['a'][1])/d['value'],(d['b'][0]-d['a'][0])/d['value']]
        first=[d['a'][i]+normal[i]*d['off'] for i in range(2)]
        second=[d['b'][i]+normal[i]*d['off'] for i in range(2)]
        assert len(curves)==3
        near(transformed(curves[0].Points[0],transform),first)
        near(transformed(curves[0].Points[1],transform),second)
        near(transformed(curves[1].Points[0],transform),d['witnesses'][0])
        near(transformed(curves[2].Points[0],transform),d['witnesses'][1])
        measured=math.dist(transformed(curves[0].Points[0],transform),transformed(curves[0].Points[1],transform))
        assert abs(measured-d['value'])<.005
    return {'file':str(file),'wallAxis':True,'hostedIds':len(expected['openings']),'hostRelations':len(expected.get('hosts',[])),'dimensionCurvesAndWitnesses':len(expected['dimensions'])}

pairs=[(Path('.cc-test/f09/targeted.ifc'),Path('.cc-test/f09/expected-private.json'))]
for root in [Path('.cc-test/f09-source'),Path('.cc-test/f09-package/consumer')]:
    if (root/'expected-private.json').exists():
        pairs.append((root/'saved.ifc',root/'expected-private.json'))
ui=Path('.cc-test/f09-browser')
for name in ['established','workspace','live']:
    actual=ui/(name+'-saved.ifc')
    expected=ui/(name+'-expected-private.json')
    if os.environ.get('F09_REQUIRE_UI_OUTPUT')=='1':
        assert actual.exists() and expected.exists(),name+' actual browser output is required'
    if expected.exists():
        pairs.append((actual,expected))
checks=[inspect(*p) for p in pairs]
report={'status':'PASS','reader':'IfcOpenShell '+ifcopenshell.version,'boundMm':.005,'checks':checks}
Path('.cc-test/f09/independent.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
