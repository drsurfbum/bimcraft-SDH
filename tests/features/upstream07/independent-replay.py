# SPDX-License-Identifier: Apache-2.0
"""Validate actual editor saves; no application reader, optional skips or model bytes in output."""
import json
from pathlib import Path

import ifcopenshell
import ifcopenshell.util.element
import ifcopenshell.validate

root = Path(__file__).resolve().parents[3]
directory = root / '.cc-test/upstream07/replay'
rows = []

def validate(path):
    logger = ifcopenshell.validate.json_logger()
    ifcopenshell.validate.validate(str(path), logger, express_rules=True)
    # Keep public diagnostics to counts/rule names; no serialized entities or raw payloads.
    assert not logger.statements, (path.name, len(logger.statements), [s.get('attribute') for s in logger.statements])
    f = ifcopenshell.open(str(path))
    identities = sorted((e.is_a(), e.GlobalId) for e in f.by_type('IfcRoot'))
    assert len({g for _, g in identities}) == len(identities), path.name
    rows.append({'file': path.name, 'schema': f.schema, 'roots': len(identities), 'schemaFindings': 0, 'duplicateGlobalIds': 0})
    return f, identities

for kind in ['new', 'duplicate', 'new-assigned', 'duplicate-assigned', 'edit-existing']:
    expected = None
    for state in ['initial', 'redo-1', 'redo-2', 'redo-3', 'reopened']:
        f, identities = validate(directory / f'{kind}-{state}.ifc')
        if expected is None:
            expected = identities
        assert identities == expected, (kind, state, 'identity drift')
        key = 'wall-f04-rainscreen' if kind == 'edit-existing' else 'wall-up07-' + kind
        types = [t for t in f.by_type('IfcWallType') if ifcopenshell.util.element.get_psets(t).get('CadCraft_WallType', {}).get('Key') == key]
        assert len(types) == 1, (kind, state)
        walls = f.by_type('IfcWall')
        assert len(walls) == 9
        if kind.endswith('-assigned'):
            assert len([w for w in walls if ifcopenshell.util.element.get_type(w) == types[0]]) == 2

# Equipment identity replay is tested in Node. Its inherited EXPRESS type/pset
# attachment issue is a separate reported limitation; do not call that schema clean.
audit = ['columns', 'levels', 'split-levels', 'tracing', 'trace-pages', 'drafting', 'floor', 'floor-opening', 'ramp', 'family', 'run']
for name in audit:
    validate(directory / f'audit-{name}-reopened.ifc')

electrical, _ = validate(root / '.cc-test/tmp/bimcraft-res-devices.ifc')
expected = {}
for cls, predefined, kinds in [
    ('IfcOutlet', 'POWEROUTLET', 'socket socket.double socket.earth socket.3ph appliance heater cooker evcharger'),
    ('IfcOutlet', 'DATAOUTLET', 'socket.data'),
    ('IfcOutlet', 'TELEPHONEOUTLET', 'socket.tel'),
    ('IfcOutlet', 'AUDIOVISUALOUTLET', 'socket.tv'),
    ('IfcSwitchingDevice', 'TOGGLESWITCH', 'switch switch.2way'),
    ('IfcSwitchingDevice', 'DIMMERSWITCH', 'switch.dimmer'),
    ('IfcSwitchingDevice', 'MOMENTARYSWITCH', 'pushbutton'),
    ('IfcSwitchingDevice', 'SELECTORSWITCH', 'switch.key'),
    ('IfcSensor', 'MOVEMENTSENSOR', 'sensor'),
    ('IfcSensor', 'SMOKESENSOR', 'detector.smoke'),
    ('IfcSensor', 'HEATSENSOR', 'detector.heat'),
    ('IfcLightFixture', 'POINTSOURCE', 'luminaire downlight luminaire.linear'),
    ('IfcLightFixture', 'SECURITYLIGHTING', 'luminaire.emergency luminaire.exit'),
    ('IfcJunctionBox', 'POWER', 'junction'),
    ('IfcElectricDistributionBoard', 'DISTRIBUTIONBOARD', 'board board.sub'),
    ('IfcElectricTimeControl', 'TIMECLOCK', 'switch.timer'),
    ('IfcUnitaryControlElement', 'THERMOSTAT', 'thermostat'),
    ('IfcAlarm', 'MANUALPULLBOX', 'callpoint'),
    ('IfcAlarm', 'SIREN', 'sounder'),
    ('IfcFan', 'PROPELLORAXIAL', 'fan'),
    ('IfcFlowMeter', 'ENERGYMETER', 'meter'),
]:
    expected.update({kind: (cls, predefined) for kind in kinds.split()})
devices = electrical.by_type('IfcDistributionElement')
assert len(devices) == len(expected) == 33
assert {d.ObjectType for d in devices} == set(expected)
for device in devices:
    assert (device.is_a(), device.PredefinedType) == expected[device.ObjectType]
validate(root / '.cc-test/tmp/bimcraft-res-electrical.ifc')

report = {'status': 'PASS', 'reader': 'IfcOpenShell ' + ifcopenshell.version, 'expressRules': True, 'files': rows}
(directory.parent / 'independent-replay.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
