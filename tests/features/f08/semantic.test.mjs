/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { model, inspect, generate, fixture } from './fixture.mjs';
import { modelTools, installAgents, propRef } from '../../../app/agents.js';
import { createDispatcher } from '../../../app/host.js';
import { documentState } from '../../../app/material-wall-agent.js';
import { readWalls, storedShape } from '../../../app/model-walls.js';
import { changeWall } from '../../../app/model-ops.js';
import { readJoinRecord, JOIN_PSET } from '../../../app/wall-join-records.js';
if (!fs.existsSync(fixture)) fs.writeFileSync(fixture, await generate());
const target = m => readWalls(m.w()).find(w => w.extSide === 'right');
const binding = m => { const s = documentState(m.ed); return { documentId: s.documentId, expectedRevision: s.revision }; };
const bytes = m => m.w().api.file(m.w().mid).save({ timeStamp: '2026-10-26T12:00:00' });
const fingerprint = m => ({ bytes: bytes(m), changes: [...m.ed.changes], undone: [...m.ed.undone], shapes: inspect(m).shapes, openings: inspect(m).openings, dimensions: inspect(m).dims });
function dispatcher(m, overrides = {}, allow = ['read','edit']) {
  const d = createDispatcher({ allowed: () => allow });
  for (const t of modelTools({ ed: () => m.ed, apply: (label, op) => m.ed.modelChange(op, { label: 'Assistant: ' + label }), ...overrides })) d.tool(t);
  return d;
}
const value = async (d, name, args) => { const r = await d.call(name, args); assert.ok(!r.isError, JSON.stringify(r)); return r.structuredContent; };
const patch = (m, end = 'a', changes = { allow: false }) => ({ ...binding(m), wall: target(m).guid, end, patch: changes });

test('three semantic tools have identical live/shared schemas, required binding and strict nested inputs', async () => {
  const live = []; installAgents({ extend: () => ({ ed: () => null, S: {}, host: {} }) }, { control: { tool: t => live.push(t) } });
  const shared = modelTools({ ed: () => null });
  for (const name of ['wall_joins_get','wall_join_end_set','wall_join_diagnostics']) {
    const a = live.find(t => t.name === name), b = shared.find(t => t.name === name); assert.ok(a && b, name);
    assert.deepEqual(b.inputSchema, a.inputSchema);
    assert.ok(a.inputSchema.required.includes('documentId')); assert.equal(a.inputSchema.additionalProperties, false);
  }
});
test('reads expose absent defaults without mutation; diagnostics inspect the full T neighborhood', async () => {
  const m = await model(), d = dispatcher(m), before = fingerprint(m), w = target(m);
  const r = await value(d, 'wall_joins_get', { documentId: binding(m).documentId, wall: w.guid });
  assert.equal(r.record.classification, 'absent'); assert.equal(r.record.persisted, null); assert.equal(r.ends.a.id, w.guid + ':a');
  const stem = readWalls(m.w()).find(w => w.joinSettings?.a?.tee) || readWalls(m.w())[9];
  const out = await value(d, 'wall_join_diagnostics', { documentId: binding(m).documentId, walls: [stem.guid] });
  assert.deepEqual(out.diagnostics, []); assert.deepEqual(fingerprint(m), before);
});
for (const end of ['a','b']) for (const allow of [false,true]) for (const cap of ['square','envelope']) test(`typed ${end} allow=${allow} cap=${cap} retains other end, relations, bodies and repeated replay`, async () => {
  const m = await model(), seed = target(m);
  m.change(changeWall(seed.guid, { joinSettings: { ...seed.joinSettings, [end]: { ...seed.joinSettings[end], allow: !allow, cap: cap === 'square' ? 'envelope' : 'square' } } }));
  const d = dispatcher(m), w = target(m), before = inspect(m);
  const r = await value(d, 'wall_join_end_set', patch(m, end, { allow, cap }));
  assert.equal(r.changed, true); assert.equal(r.completedSteps, 1); assert.ok(r.affectedWalls.includes(w.guid));
  const saved = inspect(m), other = end === 'a' ? 'b' : 'a';
  assert.deepEqual(saved.walls.find(x => x.guid === w.guid).joinSettings[other], w.joinSettings[other]);
  assert.equal(r.after.allow, allow); assert.equal(r.after.cap, cap); assert.equal(r.undo.owner, 'assistant');
  assert.deepEqual(saved.openings, before.openings); assert.deepEqual(saved.dims, before.dims); assert.deepEqual(saved.anchors, before.anchors);
  if (end === 'a' && allow && cap === 'envelope') assert.notDeepEqual(saved.shapes, before.shapes);
  for (let i = 0; i < 4; i++) { m.ed.undo(); assert.deepEqual(inspect(m).shapes, before.shapes); m.ed.redo(); assert.deepEqual(inspect(m).shapes, saved.shapes); }
  const reopen = await model(m.ed.save()); assert.deepEqual(inspect(reopen).shapes, saved.shapes);
  assert.deepEqual(readJoinRecord(reopen.w(), target(reopen).id).settings, saved.walls.find(x => x.guid === w.guid).joinSettings);
  const count = m.ed.changes.length, noOp = await value(d, 'wall_join_end_set', patch(m, end, { allow, cap }));
  assert.equal(noOp.changed, false); assert.equal(m.ed.changes.length, count);
});
test('central guard refuses direct, forged and actually resolved shared aliases with bytes and both histories intact', async () => {
  const m = await model(), w = target(m); m.change(changeWall(w.guid, { joinSettings: w.joinSettings }));
  m.w().run(x => { const ps = x.defNamed(w.id, JOIN_PSET).line, alias = x.upsertPset(w.id, 'OrdinaryJoinAlias', [['Harmless','IFCLABEL','ok']]), set = x.touch(alias); set.HasProperties.push(ps.HasProperties[0]); x.write(set); return {}; });
  // Leave a real Redo stack to prove a refused generic edit cannot erase it.
  m.change(changeWall(w.guid, { height: 2999 })); m.ed.undo();
  const direct = propRef(m.ed, w.id, JOIN_PSET, 'Settings'), alias = propRef(m.ed, w.id, 'OrdinaryJoinAlias', 'Settings'); assert.ok(direct && alias); assert.equal(direct.propId, alias.propId);
  const before = fingerprint(m), next = JSON.stringify({ ...w.joinSettings, a: { ...w.joinSettings.a, allow: false } });
  for (const ref of [direct, { ...direct, setName: 'Ordinary' }, alias, { ...alias, setName: 'Ordinary' }]) {
    assert.throws(() => m.ed.setProperty(w.id, ref, next), /protected model record/); assert.deepEqual(fingerprint(m), before);
  }
  for (const set of [JOIN_PSET, 'OrdinaryJoinAlias']) {
    const result = await dispatcher(m).call('element_set', { ...binding(m), guid: w.guid, set, property: 'Settings', value: next });
    assert.equal(result.isError, true); assert.match(JSON.stringify(result), /protected model record/); assert.deepEqual(fingerprint(m), before);
  }
});
test('legacy explicit same-values migration is undoable; supported same-values is a true no-op', async () => {
  const m = await model(), w = target(m), legacy = { ...w.joinSettings }; delete legacy.version;
  m.w().run(x => x.upsertPset(w.id, JOIN_PSET, [['Settings','IFCTEXT',JSON.stringify(legacy)]]));
  const before = bytes(m), d = dispatcher(m); assert.equal((await value(d, 'wall_joins_get', { documentId: binding(m).documentId, wall: w.guid })).record.classification, 'legacy');
  assert.equal((await value(d, 'wall_join_end_set', patch(m, 'a', { allow: true }))).changed, true);
  m.ed.undo(); assert.deepEqual(bytes(m), before);
});
test('malformed scope, invalid patches, stale/foreign binding, permissions and busy state refuse without partial changes', async () => {
  const m = await model(), other = await model(), d = dispatcher(m), before = fingerprint(m), untouched = fingerprint(other), a = patch(m);
  assert.equal(documentState(m.ed).projectId, documentState(other.ed).projectId); assert.notEqual(binding(m).documentId, binding(other).documentId);
  for (const args of [{ ...a, documentId: binding(other).documentId }, { ...a, expectedRevision: 99 }, { ...a, end: 'c' }, { ...a, patch: {} }, { ...a, patch: { allow: 'false' } }, { ...a, patch: { cap: 'wrap' } }, { ...a, patch: { node: 'injected' } }, { ...a, patch: { tee: target(other).guid } }, { ...a, expectedRevision: null }, { ...a, expectedRevision: .5 }]) {
    assert.equal((await d.call('wall_join_end_set', args)).isError, true); assert.deepEqual(fingerprint(m), before); assert.deepEqual(fingerprint(other), untouched);
  }
  assert.equal((await dispatcher(m, {}, ['read']).call('wall_join_end_set', a)).isError, true);
  assert.equal((await dispatcher(m, { busy: () => true }).call('wall_join_end_set', a)).isError, true);
  for (const scope of [{}, { walls: [a.wall], storey: '0F08W00000000000000000' }, { walls: [a.wall,a.wall] }, { walls: [a.wall], unexpected: true }]) assert.equal((await d.call('wall_join_diagnostics', { documentId: a.documentId, ...scope })).isError, true);
  assert.deepEqual(fingerprint(m), before);
});
test('ownership checks refuse precommit switches and report actual postcommit notification/switch progress', async () => {
  for (const mode of ['before','after','notification']) {
    const m = await model(), other = await model(), before = fingerprint(m), otherBefore = fingerprint(other); let current = m.ed;
    const d = dispatcher(m, { ed: () => current, apply: async (label, op) => {
      await Promise.resolve();
      if (mode === 'before') { current = other.ed; return other.ed.modelChange(op); }
      const result = m.ed.modelChange(op, { label: 'Assistant: ' + label });
      await Promise.resolve(); if (mode === 'after') current = other.ed;
      else throw new Error('notification failed'); return result;
    } });
    const r = await d.call('wall_join_end_set', patch(m)); assert.equal(r.isError, true); assert.deepEqual(fingerprint(other), otherBefore);
    if (mode === 'before') assert.deepEqual(fingerprint(m), before);
    else { assert.equal(r.structuredContent.changed, true); assert.equal(r.structuredContent.completedSteps, 1); assert.equal(r.structuredContent.code, 'POST_COMMIT_INTERRUPTED'); assert.equal(r.structuredContent.documentId, binding(m).documentId); }
  }
});

test('a unique target refuses ambiguous participating neighbor identities without changing bytes or either history', async () => {
 const m=await model(), targetWall=target(m);m.change(changeWall(targetWall.guid,{joinSettings:targetWall.joinSettings}));
 m.w().run(w=>{const walls=readWalls(w),neighbor=walls.find(x=>x.guid==='0F08W00000000000000015'),other=walls.find(x=>x.guid!==targetWall.guid&&x.guid!==neighbor.guid),line=w.touch(other.id);line.GlobalId=w.T('IFCGLOBALLYUNIQUEID',neighbor.guid);w.write(line);return{};});
 const before=fingerprint(m),d=dispatcher(m),args=patch(m);
 for(const [name,call]of [['wall_joins_get',{documentId:args.documentId,wall:args.wall}],['wall_join_diagnostics',{documentId:args.documentId,walls:[args.wall]}],['wall_join_end_set',args]]){
  const r=await d.call(name,call);assert.equal(r.isError,true);assert.match(JSON.stringify(r),/Ambiguous participating wall GlobalId/);assert.deepEqual(fingerprint(m),before);
 }
});
