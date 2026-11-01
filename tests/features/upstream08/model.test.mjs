/* SPDX-License-Identifier: Apache-2.0 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {model} from '../f08/fixture.mjs';
import {readWalls,locationLine,wallOutlines} from '../../../app/model-walls.js';
import {readOpenings} from '../../../app/model-openings.js';
import {moveElements,movables,alignMoves,distributeMoves} from '../../../app/model-modify.js';
import {changeWall} from '../../../app/model-ops.js';
import {documentHistoryState} from '../../../app/material-wall-agent.js';
const near=(a,b)=>a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<.005,`${a} != ${b}`));
test('accepted wall_change still carries a joined neighbour and keeps F09 core/finish references',async()=>{
 const m=await model(),before=readWalls(m.w()),a=before[0],b=before[1],ref=locationLine(a),n=m.ed.changes.length;
 m.change(changeWall(a.guid,{a:a.a.map((v,i)=>v+[120,80][i]),b:a.b.map((v,i)=>v+[120,80][i])}));
 const after=readWalls(m.w()),aa=after.find(x=>x.guid===a.guid),bb=after.find(x=>x.guid===b.guid);
 near(aa.a,a.a.map((v,i)=>v+[120,80][i]));near(bb.a,b.a.map((v,i)=>v+[120,80][i]));near(bb.b,b.b);
 near(locationLine(aa).a,ref.a.map((v,i)=>v+[120,80][i]));assert.equal(aa.justification,a.justification);assert.equal(m.ed.changes.length,n+1);
 m.ed.undo();near(readWalls(m.w())[0].a,a.a);m.ed.redo();near(readWalls(m.w())[0].a,aa.a);
 const reopened=await model(m.ed.save());near(readWalls(reopened.w())[0].a,aa.a);
});
test('0.8 multi-wall Move applies explicit translations once',async()=>{
 const m=await model(),before=readWalls(m.w()).slice(0,2);
 m.change(moveElements(before.map(x=>({guid:x.guid,dx:123.456,dy:78.123}))));
 for(const x of before){const a=readWalls(m.w()).find(a=>a.guid===x.guid);near(a.a,x.a.map((v,i)=>v+[123.456,78.123][i]));near(a.b,x.b.map((v,i)=>v+[123.456,78.123][i]));}
});
test('0.8 Copy retains explicit end controls, authored settings and hosted opening identities across Redo',async()=>{
 const m=await model(),walls=readWalls(m.w()),source=walls.find(x=>readOpenings(m.w()).some(o=>o.wallGuid===x.guid));
 m.change(changeWall(source.guid,{joinSettings:{version:1,a:{allow:false,cap:'square'},b:{allow:false,cap:'square'}}}));
 const before=readWalls(m.w()).find(x=>x.guid===source.guid);
 const n=m.ed.changes.length;assert.throws(()=>m.change(moveElements([{guid:source.guid,dx:30000,dy:0}],{copy:true})),/join/);assert.equal(m.ed.changes.length,n);
 const group=new Set([source.guid]);for(const e of Object.values(before.joinSettings))if(e?.node)for(const member of e.node.slice(5).split('|'))group.add(member.slice(0,-2));
 const r=m.change(moveElements([...group].map(guid=>({guid,dx:30000,dy:0})),{copy:true}));
 const guid=[...r.made.keys()][0],copied=readWalls(m.w()).find(x=>x.guid===guid);assert.ok(copied);
 for(const end of ['a','b']){assert.equal(copied.joinSettings[end].allow,before.joinSettings[end].allow);assert.equal(copied.joinSettings[end].cap,before.joinSettings[end].cap);if(copied.joinSettings[end].node)assert.ok(!copied.joinSettings[end].node.includes(source.guid));}assert.equal(copied.typeKey,before.typeKey);assert.equal(copied.justification,before.justification);assert.equal(copied.extSide,before.extSide);
 const openings=readOpenings(m.w()).filter(o=>o.wallGuid===guid).map(o=>o.guid);assert.ok(openings.length);
 m.ed.undo();assert.ok(!readWalls(m.w()).some(x=>x.guid===guid));m.ed.redo();assert.deepEqual(readOpenings(m.w()).filter(o=>o.wallGuid===guid).map(o=>o.guid),openings);
 fs.mkdirSync('.cc-test/upstream08',{recursive:true});fs.writeFileSync('.cc-test/upstream08/copied.ifc',m.ed.save());
 const reopened=await model(m.ed.save());assert.deepEqual(readWalls(reopened.w()).find(x=>x.guid===guid).joinSettings,copied.joinSettings);
});
test('coalesced model edit invalidates revision while keeping one Undo step',async()=>{
 const m=await model(),wall=readWalls(m.w())[0];const coalesce={key:'integration-height',merge:(a,b)=>({...a,...b}),ms:100000};
 m.ed.modelChange(changeWall(wall.guid,{height:3100}),{label:'Height',coalesce});const before=documentHistoryState(m.ed),entry=m.ed.changes.at(-1),count=m.ed.changes.length;
 m.ed.modelChange(changeWall(wall.guid,{height:3200}),{label:'Height',coalesce});assert.notEqual(m.ed.changes.at(-1),entry);assert.equal(m.ed.changes.length,count);assert.ok(documentHistoryState(m.ed).revision>before.revision);
});

test('0.8 batch dimensions keep every new GlobalId across Undo/Redo and reopen',async()=>{
 const [{readWallDimensions,saveWallDimensions},{readLevels}]=await Promise.all([import('../../../app/wall-dimensions.js'),import('../../../app/model-levels.js')]);
 const m=await model(),before=readWallDimensions(m.w()),level=readLevels(m.w())[0];
 const specs=before.map(({refs,axis,offset,view})=>({version:1,level:level.guid,refs,axis,offset:(offset||100)+100,view}));
 const r=m.change(saveWallDimensions(specs)),guids=[...r.made.keys()];assert.equal(new Set(guids).size,specs.length);
 m.ed.undo();assert.equal(readWallDimensions(m.w()).length,before.length);m.ed.redo();const reopened=await model(m.ed.save());
 for(const guid of guids)assert.ok(readWallDimensions(reopened.w()).some(d=>d.guid===guid));
});

test('model registry retains the exact pinned upstream and accepted fork capability union',async()=>{
 const {modelTools}=await import('../../../app/agents.js');const expected=JSON.parse(fs.readFileSync(new URL('./model-catalog.json',import.meta.url))).union;
 const actual=modelTools({ed:()=>null}).map(({name,group})=>({name,group}));const sort=xs=>xs.sort((a,b)=>a.name.localeCompare(b.name));
 assert.deepEqual(sort(actual),sort(expected));assert.equal(new Set(actual.map(x=>x.name)).size,actual.length);
});


test('Modify bounds follow actual offset/curved wall profiles; align and gaps use those bounds',async()=>{
 const {model:layered}=await import('../f04/fixture.mjs');const m=await layered(),walls=readWalls(m.w()),list=movables(m.w()).filter(x=>x.kind==='wall'),polys=wallOutlines(walls.map(x=>({...x,key:x.guid})));
 assert.ok(walls.some(x=>x.bulge));assert.ok(walls.some(x=>x.justification!=='center'));
 for(const item of list){const p=polys.get(item.guid);assert.deepEqual(item.box,{minX:Math.min(...p.map(p=>p[0])),minY:Math.min(...p.map(p=>p[1])),maxX:Math.max(...p.map(p=>p[0])),maxY:Math.max(...p.map(p=>p[1]))});}
 const isolated=list.filter(x=>walls.find(w=>w.guid===x.guid).a[0]<7000).slice(0,3),aligned=alignMoves(isolated,{side:'left',to:'point',point:[35000,0]});
 for(const x of isolated)assert.ok(Math.abs(x.box.minX+aligned.get(x.guid)[0]-35000)<.005);
 const moves=distributeMoves(isolated,{axis:'v',mode:'gaps'}),placed=isolated.map(x=>({...x.box,minY:x.box.minY+(moves.get(x.guid)?.[1]||0),maxY:x.box.maxY+(moves.get(x.guid)?.[1]||0)})).sort((a,b)=>a.minY-b.minY);
 assert.ok(Math.abs((placed[1].minY-placed[0].maxY)-(placed[2].minY-placed[1].maxY))<.005);
 m.change(moveElements([...aligned].map(([guid,[dx,dy]])=>({guid,dx,dy}))));
 const moved=readWalls(m.w()),physical=wallOutlines(moved.map(x=>({...x,key:x.guid})));
 for(const item of isolated){const wall=moved.find(x=>x.guid===item.guid),before=walls.find(x=>x.guid===item.guid);assert.ok(Math.abs(Math.min(...physical.get(item.guid).map(p=>p[0]))-35000)<.005);assert.equal(wall.justification,before.justification);assert.equal(wall.extSide,before.extSide);assert.equal(wall.typeKey,before.typeKey);}
 m.ed.undo();for(const wall of readWalls(m.w()))near(wall.a,walls.find(x=>x.guid===wall.guid).a);

});
