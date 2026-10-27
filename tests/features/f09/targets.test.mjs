/* SPDX-License-Identifier: Apache-2.0 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { model } from '../f04/fixture.mjs';
import { readWalls, locationLine } from '../../../app/model-walls.js';
import { readOpenings } from '../../../app/model-openings.js';
import { referencePoint, WALL_REFERENCES, readWallDimensions, resolveDimension } from '../../../app/wall-dimensions.js';
import { changeWall } from '../../../app/model-ops.js';
import { snapPoint } from '../../../app/model-tools.js';
import { wallTarget, wallTargetCandidates, targetCandidateId } from '../../../app/wall-targets.js';
import { modelTools } from '../../../app/agents.js';
import { documentState } from '../../../app/material-wall-agent.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<.005,`${a} vs ${b}`);
test('six explicit references reuse exact F02 coordinates; ambiguity and unsupported records are honest', async () => {
  const m=await model(),walls=readWalls(m.w()),wall=walls[0],before=m.ed.changes.length;
  for(const reference of WALL_REFERENCES)for(const station of [0,.123456789,.5,1]){
    const ref={wall:wall.guid,reference,station},target=wallTarget(walls,ref);
    assert.deepEqual(target.p,referencePoint(ref,walls));assert.equal(target.geometry,'analytic-wall-reference');assert.equal(target.persistent,false);
    const candidates=wallTargetCandidates(target.p,walls,reference,.001);
    assert.ok(candidates.some(c=>c.reference.wall===wall.guid));
  }
  assert.notDeepEqual(wallTarget(walls,{wall:wall.guid,reference:'exterior',station:.5}).p,wallTarget(walls,{wall:wall.guid,reference:'coreExterior',station:.5}).p);
  for(const bad of [{...wall,bulge:.1},{...wall,assembly:null},{...wall,referenceIssue:'unsupported'}])assert.equal(wallTarget([bad],{wall:wall.guid,reference:'coreExterior',station:.5}),null);
  assert.equal(wallTarget([wall,wall],{wall:wall.guid,reference:'exterior',station:.5}),null);
  assert.equal(wallTarget(walls,{wall:wall.guid,reference:'coreExterior',station:2}),null);
  assert.deepEqual(wallTargetCandidates([0,0],walls,'invented',12),[]);
  const coincident=[wall,{...wall,guid:'0F09W00000000000000001'}],p=referencePoint({wall:wall.guid,reference:'coreCenter',station:.5},[wall]);
  const candidates=wallTargetCandidates(p,coincident,'coreCenter',.001);
  assert.equal(new Set(candidates.map(c=>c.reference.wall)).size,2,'coincident hosts are not collapsed');
  assert.equal(m.ed.changes.length,before);
});
test('targeted wall translation preserves host, orientation, anchors, IDs and references through Undo/Redo/save/reopen', async () => {
  const m=await model(),walls=readWalls(m.w()),wall=walls.find(w=>readOpenings(m.w()).some(o=>o.wallGuid===w.guid))||walls[0],other=walls.find(w=>w.guid!==wall.guid);
  const dims=readWallDimensions(m.w()),openings=readOpenings(m.w()),target=wallTarget(walls,{wall:other.guid,reference:'coreExterior',station:.3728282828});
  const mid=wall.a.map((x,i)=>(x+wall.b[i])/2),delta=target.p.map((x,i)=>x-mid[i]);
  const move={a:wall.a.map((x,i)=>x+delta[i]),b:wall.b.map((x,i)=>x+delta[i])};
  m.change(changeWall(wall.guid,move));
  const after=readWalls(m.w()).find(w=>w.guid===wall.guid);
  after.a.forEach((x,i)=>near(x,move.a[i]));after.b.forEach((x,i)=>near(x,move.b[i]));
  assert.equal(after.extSide,wall.extSide);assert.equal(after.justification,wall.justification);assert.equal(after.typeKey,wall.typeKey);
  const actualOpenings=readOpenings(m.w());
  assert.deepEqual(actualOpenings.map(o=>[o.guid,o.wallGuid,o.face]),openings.map(o=>[o.guid,o.wallGuid,o.face]));
  // Retain the established afterWallMove contract: an axial start shift preserves the opening's world station.
  const shift=delta[0]*(wall.b[0]-wall.a[0])/wall.len+delta[1]*(wall.b[1]-wall.a[1])/wall.len;
  for(const o of openings)near(actualOpenings.find(a=>a.guid===o.guid).offset,o.offset-(o.wallGuid===wall.guid?shift:0));
  assert.deepEqual(readWallDimensions(m.w()).map(d=>[d.guid,d.refs]),dims.map(d=>[d.guid,d.refs]));
  const movedAnchors=locationLine(after);m.ed.undo();assert.deepEqual(locationLine(readWalls(m.w()).find(w=>w.guid===wall.guid)),locationLine(wall));m.ed.redo();assert.deepEqual(locationLine(readWalls(m.w()).find(w=>w.guid===wall.guid)),movedAnchors);
  const bytes=m.ed.save(),reopened=await model(bytes);
  const actual=readWalls(reopened.w()).find(w=>w.guid===wall.guid);actual.a.forEach((x,i)=>near(x,move.a[i]));
  for(const d of readWallDimensions(reopened.w()))assert.equal(resolveDimension(d,readWalls(reopened.w())).status,'ok');
  fs.mkdirSync('.cc-test/f09',{recursive:true});fs.writeFileSync('.cc-test/f09/targeted.ifc',bytes);
  fs.writeFileSync('.cc-test/f09/expected-private.json',JSON.stringify({wall:wall.guid,a:move.a,b:move.b,openings:openings.map(o=>o.guid),dimensions:readWallDimensions(reopened.w()).map(d=>({guid:d.guid,...resolveDimension(d,readWalls(reopened.w()))}))}));
});
test('new semantic resolver requires revision/document binding, is read-only, and refuses stale/foreign/curved targets', async () => {
  const m=await model(),state=documentState(m.ed),wall=readWalls(m.w())[0],before=m.ed.changes.length;
  const tools=modelTools({ed:()=>m.ed}),tool=tools.find(t=>t.name==='wall_reference_resolve');
  assert.ok(tool);assert.equal(tool.group,'read');assert.deepEqual(tool.inputSchema.required,['documentId','expectedRevision','wall','reference','station']);
  const args={...state,wall:wall.guid,reference:'coreExterior',station:.369696969};
  const result=tool.run(args);assert.deepEqual(result.p,referencePoint(args,readWalls(m.w())));assert.equal(m.ed.changes.length,before);
  assert.throws(()=>tool.run({...args,documentId:'foreign'}),/documentId/);
  assert.throws(()=>tool.run({...args,expectedRevision:state.revision+1}),/Revision/);
  assert.throws(()=>tool.run({...args,wall:'0F09W00000000000000001'}),/foreign/);
  m.change(changeWall(wall.guid,{bulge:.1}));assert.throws(()=>tool.run({...args,...documentState(m.ed)}),/Unsupported/);m.ed.undo();
});

test('shared snap engine resolves explicit references, exposes ambiguous hosts and respects temporary snap-off', async () => {
  const m=await model(),walls=readWalls(m.w()),wall=walls[0],ref={wall:wall.guid,reference:'coreInterior',station:.3728282828};
  const p=referencePoint(ref,walls),raw=[p[0],p[1]+.000123],result=snapPoint(raw,{walls},{reference:ref.reference,tol:.001});
  assert.deepEqual(result.p,p);assert.equal(result.reference.wall,wall.guid);
  assert.deepEqual(snapPoint(raw,{walls},{enabled:false}),{p:raw,kind:'free'});
  const coincident=[wall,{...wall,guid:'0F09W00000000000000001'}];
  const ambiguous=snapPoint(raw,{walls:coincident},{reference:ref.reference,tol:.001});
  assert.equal(ambiguous.ambiguous,true);assert.deepEqual(ambiguous.p,raw);
  const chosen=ambiguous.candidates.find(c=>c.reference.wall!==wall.guid);
  const resolved=snapPoint(raw,{walls:coincident},{reference:ref.reference,tol:.001,candidateId:targetCandidateId(chosen)});
  assert.equal(resolved.reference.wall,chosen.reference.wall);assert.deepEqual(resolved.p,p);
});
