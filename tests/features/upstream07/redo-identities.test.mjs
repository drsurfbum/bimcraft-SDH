/* SPDX-License-Identifier: Apache-2.0 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { model } from '../f02/fixtures.mjs';
import { newBuilding, stackLevels } from '../../../app/new-model.js';
import { readLevels } from '../../../app/model-levels.js';
import { drawWallPath, snapshotModel, placeOpening, placeFloor, placeCeiling, placeRoof, newLevel, copyLevel } from '../../../app/model-ops.js';

const roots = m => { const w=m.w(), list=w.api.GetLineIDsWithType(w.mid,w.W.IFCROOT,true), out=[];for(let i=0;i<list.size();i++)out.push(w.api.GetLine(w.mid,list.get(i),false).GlobalId.value);return out; };
const unique = m => { const ids=roots(m);assert.equal(new Set(ids).size,ids.length,'every IfcRoot GlobalId must remain unique'); };
test('cached product identities consume their GUID replay slots across wall chains, derived objects, openings and copy-level redo', async () => {
 const m=await model(new TextEncoder().encode(newBuilding({name:'Replay regression',levels:stackLevels(3,3000,i=>'Level '+i)}))),level=readLevels(m.w())[0],guids=[];
 const points=[[0,0],[6000,0],[6000,4000],[0,4000],[0,0]];
 for(let i=2;i<=points.length;i++){const r=m.ed.modelChange(drawWallPath({storey:level.guid,points:points.slice(0,i),guids,typeKey:'concrete-200',thickness:200,reference:'outside',extSide:'right',height:3000}));guids.push(...r.made.keys());}
 const changes=[placeOpening({wall:guids[0],typeKey:'win-fixed',offset:2000}),placeFloor({storey:level.guid,seed:[2000,2000],mode:'room'}),placeCeiling({storey:level.guid,seed:[2000,2000],mode:'room',height:2700}),placeRoof({storey:level.guid,seed:[2000,2000]}),newLevel({name:'Added',elevation:9000,height:3000}),copyLevel({from:level.guid,to:readLevels(m.w())[1].guid})];
 for(const operation of changes)m.ed.modelChange(operation);
 unique(m);const before=snapshotModel(m.ed).walls.map(w=>w.guid);
 const count=m.ed.changes.length;for(let i=0;i<count;i++)m.ed.undo();for(let i=0;i<count;i++){m.ed.redo();unique(m);}
 assert.deepEqual(snapshotModel(m.ed).walls.map(w=>w.guid),before);
 const re=await model(m.ed.save());unique(re);assert.deepEqual(snapshotModel(re.ed).walls.map(w=>w.guid),before);
});
