"""Independently inspect actual unit, source/package MCP and native UI/live saved IFC."""
import json
import math
import os
import csv
import io
from pathlib import Path
import ifcopenshell
import ifcopenshell.validate
import ifcopenshell.util.element
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
    extra={}
    output=Path(str(file)+'.output-private.json')
    if os.environ.get('F09_REQUIRE_UI_OUTPUT')=='1':
        assert output.exists(),'Actual saved-file export evidence is required: '+str(file)
    if output.exists():
        from pypdf import PdfReader
        from pypdf.generic import ContentStream
        data=json.loads(output.read_text())
        logger=ifcopenshell.validate.json_logger()
        ifcopenshell.validate.validate(str(file),logger,express_rules=True)
        assert not logger.statements,logger.statements
        guids=[x.GlobalId for x in f.by_type('IfcRoot')]
        assert len(guids)==len(set(guids))
        body=next(r for r in wall.Representation.Representations if r.RepresentationIdentifier=='Body').Items[0]
        assert body.is_a('IfcExtrudedAreaSolid') and body.SweptArea.is_a('IfcArbitraryClosedProfileDef')
        profile=[transformed(p,matrix) for p in body.SweptArea.OuterCurve.Points]
        physical=data['physical']
        for a,b in [(profile,physical),(physical,profile)]:
            assert all(min(math.dist(p,q) for q in b)<.005 for p in a),(profile,physical)
        assert abs(body.Depth*factor-data['height'])<.005
        rows=list(csv.DictReader(io.StringIO(Path(str(file)+'.assemblies.csv').read_text(encoding='utf-8-sig'),newline='')))
        layers=0
        for walltype in f.by_type('IfcWallType'):
            props=ifcopenshell.util.element.get_psets(walltype).get('CadCraft_WallType')
            if not props:continue
            recipe=json.loads(props['Recipe'])
            actual=[r for r in rows if r['record_kind']=='layer' and r['type_key']==recipe['key']]
            assert len(actual)==len(recipe['layers'])
            for i,(row,layer) in enumerate(zip(actual,recipe['layers'])):
                assert int(row['layer_exterior_to_interior'])==i+1
                assert float(row['nominal_thickness_mm'])==layer['t']
                assert row['core']==str(layer['core']).lower()
                if layer.get('kind')!='cavity':assert row['material_id']==layer['materialId']
                layers+=1
        reader=PdfReader(str(file)+'.plan.pdf');assert len(reader.pages)==1
        paths=[];groups=[];current=[];width=0
        for page in reader.pages:
            assert not page.get('/Resources',{}).get('/XObject'),'Raster PDF is not vector evidence'
            for args,op in ContentStream(page.get_contents(),reader).operations:
                if op==b'w':width=float(args[0])
                if op==b'm':current=[tuple(map(float,args))];paths.append(current)
                if op==b'l':current.append(tuple(map(float,args)))
                if op==b'S':
                    if width==round(.13*72/25.4,3):groups.append(paths)
                    paths=[];current=[]
                if op in (b'f',b'f*',b'n'):paths=[];current=[]
        for dimension in data['dimensions']:
            # Compare the actual vector dimension line in model mm, independent of page translation.
            delta=[dimension['b'][i]-dimension['a'][i] for i in range(2)]
            assert any(len(g)==5 and len(g[0])==2 and all(abs((g[0][1][i]-g[0][0][i])*data['scale']*25.4/72-delta[i])<.005 for i in range(2)) for g in groups),dimension
        extra={'schemaExpressFindings':0,'physicalProfileMm':True,'csvLayers':layers,'vectorPdf':True,'pdfDimensionLines':len(data['dimensions'])}
    return {'file':str(file),'wallAxis':True,'hostedIds':len(expected['openings']),'hostRelations':len(expected.get('hosts',[])),'dimensionCurvesAndWitnesses':len(expected['dimensions']),**extra}

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
