/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { model } from '../f02/fixtures.mjs';
import { readWalls } from '../../../app/model-walls.js';
import { modelTools, propRef } from '../../../app/agents.js';
const bytes = fs.readFileSync(new URL('../../../fixtures/f02/mm-local.ifc', import.meta.url));

test('generic property edits refuse actual protected sets, including forged reference labels, before any mutation', async () => {
  const m = await model(bytes), original = m.ed.save(), histories = [m.ed.changes.length, m.ed.undone.length];
  const kinds = new Set();
  const list = m.ed.api.GetLineIDsWithType(m.ed.mid, m.ed.W.IFCPROPERTYSET);
  for (let i = 0; i < list.size(); i++) {
    const set = m.ed.api.GetLine(m.ed.mid, list.get(i), false), name = set.Name?.value;
    if (!['CadCraft_Wall', 'CadCraft_WallType', 'CadCraft_MaterialLibrary', 'CadCraft_WallDimension'].includes(name)) continue;
    kinds.add(name);
    for (const h of set.HasProperties) {
      const p = m.ed.api.GetLine(m.ed.mid, h.value, false);
      if (!p.NominalValue) continue;
      for (const label of [name, 'Forged harmless display name']) {
        assert.throws(() => m.ed.setProperty(0, { psetId: set.expressID, propId: p.expressID, setName: label, propName: p.Name.value }, '{"version":999}'), /protected model record/);
        assert.deepEqual(m.ed.save(), original);
        assert.deepEqual([m.ed.changes.length, m.ed.undone.length], histories);
      }
    }
  }
  assert.deepEqual([...kinds].sort(), ['CadCraft_MaterialLibrary','CadCraft_Wall','CadCraft_WallDimension','CadCraft_WallType']);
});

test('0.7 element_set uses the shared refusal, preserves other projects and still supports ordinary attributes and Undo/Redo', async () => {
  const a = await model(bytes), b = await model(bytes), wall = readWalls(a.w())[0], original = a.ed.save(), other = b.ed.save();
  const tools = modelTools({ ed: () => a.ed, apply: async (label, op) => a.ed.modelChange(op, { label: 'Assistant: ' + label }) });
  const set = tools.find(t => t.name === 'element_set');
  assert.ok(set); assert.equal(set.group, 'edit');
  for (const [pset, property, type] of [['CadCraft_Wall','Height',false], ['CadCraft_WallType','Recipe',true]]) {
    assert.ok(propRef(a.ed, wall.id, pset, property));
    await assert.rejects(set.run({ guid: wall.guid, set: pset, property, value: 'not a valid domain record', type }), /protected model record/);
    assert.deepEqual(a.ed.save(), original); assert.equal(a.ed.changes.length, 0); assert.equal(a.ed.undone.length, 0);
  }
  assert.equal((await set.run({ guid: wall.guid, attribute: 'Name', value: 'Foundation test wall' })).changed, true);
  const edited = a.ed.save(); a.ed.undo(); assert.deepEqual(a.ed.save(), original); a.ed.redo(); assert.deepEqual(a.ed.save(), edited);
  assert.deepEqual(b.ed.save(), other);
});
