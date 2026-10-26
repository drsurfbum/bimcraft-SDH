/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { model } from '../f02/fixtures.mjs';
import { rootIdentities } from './replay-support.mjs';
import { newBuilding, stackLevels } from '../../../app/new-model.js';
import { readLevels } from '../../../app/model-levels.js';
import { placeColumns } from '../../../app/model-columns.js';
import { addLevels, splitLevels } from '../../../app/model-site.js';
import { traceDrawing, tracePages } from '../../../app/model-trace.js';
import { addDrafting } from '../../../app/drafting.js';
import { placeDrawnFloor, addFloorOpening, readDrawnFloors } from '../../../app/model-floors.js';
import { placeRamp } from '../../../app/model-ramps.js';
import { placeFamily } from '../../../app/family-ops.js';
import { placeRun } from '../../../app/mep-model.js';
import { placeEquipment } from '../../../app/mep/equipment.js';

const output = new URL('../../../.cc-test/upstream07/replay/', import.meta.url);
fs.mkdirSync(output, { recursive: true });
const points = [[0, 0], [5000, 0], [5000, 4000], [0, 4000]];
const page = {
  walls: points.map((a, i) => ({ a, b: points[(i + 1) % 4], t: 200 })),
  openings: [{ wall: 0, typeKey: 'door-single', offset: 1000, width: 900, face: 'left' }],
  typeKey: 'concrete-200', height: 3000,
  underlay: { name: 'Replay probe', units: 'mm', lines: [[0, 0, 5000, 0]] },
};
const floor = storey => placeDrawnFloor({ storey, points, thickness: 200 });
const cases = {
  columns: (m, storey) => placeColumns({ storey, points: [[0, 0], [3000, 0]] }),
  levels: () => addLevels({ elevations: [3000, 6000], height: 3000 }),
  'split-levels': () => splitLevels({ total: 9000, count: 3 }),
  tracing: (m, storey) => traceDrawing({ storey, ...page }),
  'trace-pages': () => tracePages([{ level: { name: 'Traced', elevation: 3000, height: 3000 }, ...page }]),
  drafting: (m, level) => addDrafting({ level, view: 'plan:' + level, pts: [[0, 0], [5000, 0]] }),
  floor: (m, storey) => floor(storey),
  'floor-opening': (m, storey) => {
    m.ed.modelChange(floor(storey));
    return addFloorOpening(readDrawnFloors(m.w())[0].guid, [[1000, 1000], [2000, 1000], [2000, 2000], [1000, 2000]]);
  },
  ramp: (m, storey) => placeRamp({ storey, start: [0, 0], rise: 500 }),
  family: (m, storey) => placeFamily({ storey, family: 'fam-table', x: 1000, y: 1000 }),
  run: (m, storey) => placeRun({ storey, kind: 'pipe', system: 'cw', mat: 'steel', cls: '40', size: '2', points: [[0, 0, 2700], [5000, 0, 2700]] }),
  equipment: (m, storey) => placeEquipment({ storey, kind: 'pump', values: {}, x: 0, y: 0 }),
};
for (const [name, operation] of Object.entries(cases)) {
  test(`audited cached replay: ${name} keeps every IfcRoot identity through repeat replay and reopen`, async () => {
    const m = await model(new TextEncoder().encode(newBuilding({ name: 'Replay audit', levels: stackLevels(1, 3000, () => 'Ground') })));
    const change = operation(m, readLevels(m.w())[0].guid), before = rootIdentities(m);
    m.ed.modelChange(change);
    const initial = rootIdentities(m);
    assert.ok(initial.length > before.length);
    for (let i = 0; i < 3; i++) {
      m.ed.undo(); assert.deepEqual(rootIdentities(m), before);
      m.ed.redo(); assert.deepEqual(rootIdentities(m), initial);
    }
    const reopened = await model(m.ed.save());
    assert.deepEqual(rootIdentities(reopened), initial);
    fs.writeFileSync(new URL('audit-' + name + '-reopened.ifc', output), reopened.ed.save());
  });
}
