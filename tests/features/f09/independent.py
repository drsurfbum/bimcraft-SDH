"""Read actual saved IFC using IfcOpenShell; no imports of application geometry."""
import json
import math
from pathlib import Path
import ifcopenshell
import ifcopenshell.util.placement
import ifcopenshell.util.unit

root = Path('.cc-test/f09')
expected = json.loads((root / 'expected-private.json').read_text())
f = ifcopenshell.open(str(root / 'targeted.ifc'))
factor = ifcopenshell.util.unit.calculate_unit_scale(f) * 1000
wall = f.by_guid(expected['wall'])
matrix = ifcopenshell.util.placement.get_local_placement(wall.ObjectPlacement)
axis = next(r for r in wall.Representation.Representations if r.RepresentationIdentifier == 'Axis').Items[0]

def transformed(point, transform):
    p = list(point.Coordinates) + [0] * (3 - len(point.Coordinates))
    return [sum(transform[i, j] * p[j] for j in range(3)) * factor + transform[i, 3] * factor for i in range(2)]

def near(a, b):
    assert len(a) == len(b)
    assert all(abs(x - y) < .005 for x, y in zip(a, b)), (a, b)

near(transformed(axis.Points[0], matrix), expected['a'])
near(transformed(axis.Points[-1], matrix), expected['b'])
for guid in expected['openings']:
    assert f.by_guid(guid), guid

for d in expected['dimensions']:
    a = f.by_guid(d['guid'])
    transform = ifcopenshell.util.placement.get_local_placement(a.ObjectPlacement)
    curves = a.Representation.Representations[0].Items[0].Elements
    normal = [-(d['b'][1] - d['a'][1]) / d['value'], (d['b'][0] - d['a'][0]) / d['value']]
    first = [d['a'][i] + normal[i] * d['off'] for i in range(2)]
    second = [d['b'][i] + normal[i] * d['off'] for i in range(2)]
    assert len(curves) == 3
    near(transformed(curves[0].Points[0], transform), first)
    near(transformed(curves[0].Points[1], transform), second)
    near(transformed(curves[1].Points[0], transform), d['witnesses'][0])
    near(transformed(curves[2].Points[0], transform), d['witnesses'][1])
    measured = math.dist(transformed(curves[0].Points[0], transform), transformed(curves[0].Points[1], transform))
    assert abs(measured - d['value']) < .005

report = {'status': 'PASS', 'reader': 'IfcOpenShell ' + ifcopenshell.version, 'wallAxis': True,
          'hostedIds': len(expected['openings']), 'dimensionCurvesAndWitnesses': len(expected['dimensions']), 'boundMm': .005}
(root / 'independent.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
