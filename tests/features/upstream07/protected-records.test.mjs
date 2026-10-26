/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { model } from '../f02/fixtures.mjs';
import { readWalls } from '../../../app/model-walls.js';
import { modelTools, propRef } from '../../../app/agents.js';
const bytes = fs.readFileSync(new URL('../../../fixtures/f02/mm-local.ifc', import.meta.url));

// Compare every IFC byte at a fixed serialization timestamp; report only hashes on failure.
const fingerprint=ed=>crypto.createHash('sha256').update(ed.api.file(ed.mid).save({timeStamp:'2026-10-25T00:00:00'})).digest('hex');

test('generic property edits refuse actual protected sets, including forged reference labels, before any mutation', async () => {
  const m = await model(bytes), original = fingerprint(m.ed), histories = [m.ed.changes.length, m.ed.undone.length];
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
        assert.deepEqual(fingerprint(m.ed), original);
        assert.deepEqual([m.ed.changes.length, m.ed.undone.length], histories);
      }
    }
  }
  assert.deepEqual([...kinds].sort(), ['CadCraft_MaterialLibrary','CadCraft_Wall','CadCraft_WallDimension','CadCraft_WallType']);
});

test('0.7 element_set uses the shared refusal, preserves other projects and still supports ordinary attributes and Undo/Redo', async () => {
  const a = await model(bytes), b = await model(bytes), wall = readWalls(a.w())[0], original = fingerprint(a.ed), other = fingerprint(b.ed);
  const tools = modelTools({ ed: () => a.ed, apply: async (label, op) => a.ed.modelChange(op, { label: 'Assistant: ' + label }) });
  const set = tools.find(t => t.name === 'element_set');
  assert.ok(set); assert.equal(set.group, 'edit');
  for (const [pset, property, type] of [['CadCraft_Wall','Height',false], ['CadCraft_WallType','Recipe',true]]) {
    assert.ok(propRef(a.ed, wall.id, pset, property));
    await assert.rejects(set.run({ guid: wall.guid, set: pset, property, value: 'not a valid domain record', type }), /protected model record/);
    assert.deepEqual(fingerprint(a.ed), original); assert.equal(a.ed.changes.length, 0); assert.equal(a.ed.undone.length, 0);
  }
  assert.equal((await set.run({ guid: wall.guid, attribute: 'Name', value: 'Foundation test wall' })).changed, true);
  const edited = fingerprint(a.ed); a.ed.undo(); assert.deepEqual(fingerprint(a.ed), original); a.ed.redo(); assert.deepEqual(fingerprint(a.ed), edited);
  assert.deepEqual(fingerprint(b.ed), other);
});


test('forged set ids and shared ordinary-set references cannot alias protected property entities',async()=>{
 const m=await model(bytes),api=m.ed.api,mid=m.ed.mid,W=m.ed.W,sets=api.GetLineIDsWithType(mid,W.IFCPROPERTYSET);
 const all=Array.from({length:sets.size()},(_,i)=>api.GetLine(mid,sets.get(i),false));
 const protectedSet=all.find(s=>s.Name?.value==='CadCraft_Wall');
 const ordinary=all.find(s=>!s.Name?.value?.startsWith('CadCraft_')&&s.HasProperties?.length);assert.ok(ordinary);
 const propId=protectedSet.HasProperties[0].value,ref={psetId:ordinary.expressID,propId,setName:ordinary.Name.value};
 const original=fingerprint(m.ed);assert.throws(()=>m.ed.setProperty(0,ref,9999),/single-value/);assert.equal(fingerprint(m.ed),original);
 ordinary.HasProperties.push(new W.Handle(propId));api.WriteLine(mid,ordinary);
 const aliased=fingerprint(m.ed);assert.throws(()=>m.ed.setProperty(0,ref,9999),/protected model record/);assert.equal(fingerprint(m.ed),aliased);assert.equal(m.ed.changes.length,0);
});
