/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { model, recipe as newRecipe } from '../f02/fixtures.mjs';
import { readAssemblies } from '../../../app/wall-assemblies.js';
import { readWalls } from '../../../app/model-walls.js';
import { rootIdentities } from './replay-support.mjs';
import { saveWallAssembly } from '../../../app/model-ops.js';

const fixture = fs.readFileSync(new URL('../../../fixtures/f04/layered-plans.ifc', import.meta.url));
const output = new URL('../../../.cc-test/upstream07/replay/', import.meta.url);
fs.mkdirSync(output, { recursive: true });


for (const kind of ['new', 'duplicate', 'new-assigned', 'duplicate-assigned', 'edit-existing']) {
  test(`assembly ${kind}: stable type, wall assignments and all root identities through three replay cycles and reopen`, async () => {
    const m = await model(fixture), original = rootIdentities(m);
    const source = readAssemblies(m.w()).find(x => x.key === 'wall-f04-rainscreen');
    assert.ok(source);
    const existing = kind === 'edit-existing', assigned = kind.endsWith('-assigned');
    const input = structuredClone(kind.startsWith('new') ? newRecipe : source);
    input.key = existing ? source.key : 'wall-up07-' + kind;
    input.name = 'UP07 ' + kind;
    if (existing) input.layers[0].t += 10;
    const beforeWalls = readWalls(m.w()).map(w => [w.guid, w.typeKey]);
    const assign = assigned ? beforeWalls.slice(0, 2).map(([guid]) => guid) : [];
    assert.equal(beforeWalls.length, 9, 'use actual layered-plan walls');
    m.ed.modelChange(saveWallAssembly(input, assign));
    const expected = rootIdentities(m), type = readAssemblies(m.w()).find(x => x.key === input.key);
    const expectedLayers = structuredClone(type.layers);
    input.layers.forEach((layer, i) => { for (const [key, value] of Object.entries(layer)) assert.deepEqual(type.layers[i][key], value); });
    const typeGuid = m.w().guidOf(type.id);
    if (existing) assert.equal(typeGuid, m.w().guidOf(source.id));
    const check = state => {
      assert.deepEqual(rootIdentities(state), expected, 'all first-write identities survive replay/reopen');
      const type = readAssemblies(state.w()).find(x => x.key === input.key);
      assert.equal(state.w().guidOf(type.id), typeGuid);
      assert.deepEqual(type.layers, expectedLayers);
      for (const [guid, key] of beforeWalls) {
        const wall = readWalls(state.w()).find(x => x.guid === guid);
        assert.equal(wall.typeKey, assign.includes(guid) ? input.key : key);
        if (wall.typeKey === input.key) assert.ok(Math.abs(wall.t - input.layers.reduce((s, l) => s + l.t, 0)) < 1e-9);
      }
    };
    check(m);
    fs.writeFileSync(new URL(kind + '-initial.ifc', output), m.ed.save());
    for (let cycle = 1; cycle <= 3; cycle++) {
      m.ed.undo();
      assert.deepEqual(rootIdentities(m), original, 'Undo restores all original identities');
      assert.deepEqual(readWalls(m.w()).map(w => [w.guid, w.typeKey]), beforeWalls);
      if (!existing) assert.ok(!readAssemblies(m.w()).some(x => x.key === input.key));
      m.ed.redo(); check(m);
      fs.writeFileSync(new URL(kind + '-redo-' + cycle + '.ifc', output), m.ed.save());
    }
    const reopened = await model(m.ed.save()); check(reopened);
    fs.writeFileSync(new URL(kind + '-reopened.ifc', output), reopened.ed.save());
  });
}
