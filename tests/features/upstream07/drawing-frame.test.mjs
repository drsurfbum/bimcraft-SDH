/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as W from '../../../app/ifc/api.js';
import { IfcModel } from '../../../app/ifc-model.js';
import { IfcEditor } from '../../../app/ifc-edit.js';
import { ModelWriter } from '../../../app/model-write.js';
import { readWalls } from '../../../app/model-walls.js';
import { readLevels } from '../../../app/model-levels.js';
import { changeWall } from '../../../app/model-ops.js';
import { modelTriangles } from '../../../app/res-views.js';
import { viewerToPlan } from '../../../app/model-plan.js';
import { model } from '../f02/fixtures.mjs';

test('documentation retains double coordinates when an edited model keeps its old coordination frame', async () => {
  const bytes = fs.readFileSync(new URL('../../../fixtures/f05/wall-views.ifc', import.meta.url));
  const loaded = await IfcModel.create(W, null, { manifold: false });
  await loaded.load(bytes); const frame = loaded.api.GetCoordinationMatrix(loaded.modelID);
  const ed = new IfcEditor(W, loaded), writer = () => new ModelWriter(W, loaded.api, loaded.modelID);
  ed.modelChange(changeWall(readWalls(writer())[0].guid, { height: 3150 }));
  const saved = ed.save();
  const kept = await loaded.load(saved, () => {}, { coordination: frame });
  const reopened = await IfcModel.create(W, null, { manifold: false });
  const fresh = await reopened.load(saved);
  const triangles = (engine, data) => {
    const w = new ModelWriter(W, engine.api, engine.modelID), level = readLevels(w)[0];
    return modelTriangles(data, viewerToPlan(engine.api.GetCoordinationMatrix(engine.modelID), w.storeyWorld(level.id)));
  };
  assert.ok(kept.batches.every(b => b.documentPositions instanceof Float64Array && b.positions instanceof Float32Array));
  const a = triangles(loaded, kept), b = triangles(reopened, fresh);
  assert.deepEqual(a, b);
  const independent = await model(saved); assert.equal(readWalls(independent.w())[0].height, 3150);
});
