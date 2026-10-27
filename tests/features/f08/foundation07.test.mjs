/* SPDX-License-Identifier: Apache-2.0 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {model,inspect,A,fixture,generate} from './fixture.mjs';
import {model as reopen} from '../f04/fixture.mjs';
import {changeWall,changeWalls,changeLevel,newLevel,copyLevel,saveWallAssembly} from '../../../app/model-ops.js';
import {readWalls,storedShape,wallOutlines,locationLine,wallsThrough,PLAN_CUT} from '../../../app/model-walls.js';
import {readLevels} from '../../../app/model-levels.js';
import {readAssemblies} from '../../../app/wall-assemblies.js';
import {readJoinRecord,JOIN_PSET} from '../../../app/wall-join-records.js';
import {storeyLoops} from '../../../app/model-slabs.js';
import {readWallDimensions,resolveDimension} from '../../../app/wall-dimensions.js';
import {rootIdentities} from '../upstream07/replay-support.mjs';
if(!fs.existsSync(fixture)){fs.mkdirSync(new URL('../../../fixtures/f08/',import.meta.url),{recursive:true});fs.writeFileSync(fixture,await generate());}
const out='.cc-test/f08-07';fs.mkdirSync(out,{recursive:true});
const bytes=m=>m.w().api.file(m.w().mid).save({timeStamp:'2026-10-26T12:00:00'});
const near=(a,b)=>assert.ok(Math.abs(a-b)<.005,`${a} differs from ${b}`);
const save=(m,name)=>{fs.writeFileSync(out+'/'+name+'.ifc',m.ed.save());fs.writeFileSync(out+'/'+name+'.json',JSON.stringify(inspect(m)));};
test('Copy Level preserves both end controls and remaps retained node/T identities through three replays and reopen',async()=>{
 const m=await model();m.change(newLevel({name:'Copied F08',elevation:3300,height:3300}));const levels=readLevels(m.w()),source=readWalls(m.w(),levels[0].id);
 for(const wall of [source[0],source[9],source[10]])m.change(changeWall(wall.guid,{joinSettings:{...wall.joinSettings,a:{...wall.joinSettings.a,allow:false},b:{...wall.joinSettings.b,cap:'square'}}}));
 const before=rootIdentities(m),src=readWalls(m.w(),levels[0].id),dims=readWallDimensions(m.w()).map(d=>[d.guid,d.refs,resolveDimension(d,src).value]);
 m.change(copyLevel({from:levels[0].guid,to:levels[1].guid}));const identities=rootIdentities(m);
 const check=state=>{
  assert.deepEqual(rootIdentities(state),identities);const copies=readWalls(state.w(),levels[1].id);assert.equal(copies.length,src.length);const map=new Map(src.map((w,i)=>[w.guid,copies[i].guid]));
  for(const [i,w] of src.entries())for(const end of ['a','b']){const old=w.joinSettings[end],now=copies[i].joinSettings[end];assert.equal(now.allow,old.allow);assert.equal(now.cap,old.cap);if(old.tee)assert.equal(now.tee,map.get(old.tee));if(old.node)assert.equal(now.node,'join:'+old.node.slice(5).split('|').map(s=>map.get(s.slice(0,-2))+s.slice(-2)).sort().join('|'));}
  assert.deepEqual(readWalls(state.w(),levels[0].id),src);assert.deepEqual(readWallDimensions(state.w()).map(d=>[d.guid,d.refs,resolveDimension(d,readWalls(state.w())).value]),dims);
 };
 check(m);for(let i=0;i<3;i++){m.ed.undo();assert.deepEqual(rootIdentities(m),before);m.ed.redo();check(m);}const re=await reopen(m.ed.save());check(re);save(m,'copied');
});
test('joined walls through upper levels retain base/top offset geometry, core anchors and dimensions across level/finish replay',async()=>{
 const m=await model();m.change(newLevel({name:'F08 Middle',elevation:3300,height:3300}));m.change(newLevel({name:'F08 Top',elevation:6600,height:3300}));const levels=readLevels(m.w()),guids=readWalls(m.w()).map(w=>w.guid),initial=readWalls(m.w()),dims=readWallDimensions(m.w()).map(d=>resolveDimension(d,initial).value);
 m.change(changeWalls(guids,{baseOffset:125,topLevel:levels[2].guid,topOffset:-75}));
 const check=(elevation,finish)=>{const walls=readWalls(m.w());assert.equal(wallsThrough(walls,readLevels(m.w()),levels[1].id,PLAN_CUT).length,16);assert.equal(storeyLoops(m.w(),levels[1].id).walls.length,16);assert.deepEqual(wallOutlines(walls.map(w=>({...w,key:w.guid}))).diagnostics,[]);for(const w of walls){near(w.z,125);near(w.height,elevation-200);near(storedShape(m.w(),w.id).depth,elevation-200);}readWallDimensions(m.w()).map(d=>resolveDimension(d,walls).value).forEach((value,i)=>near(value,dims[i]+(finish&&i===1?6.35:0)));const target=walls.find(w=>w.justification==='coreCenter'&&w.extSide==='right'),old=initial.find(w=>w.guid===target.guid);near(locationLine(target).a[1],locationLine(old).a[1]);};
 check(6600,false);m.change(changeLevel(levels[2].guid,{elevation:6900}));const beforeFinish=rootIdentities(m);check(6900,false);const type=readAssemblies(m.w()).find(t=>t.key===A.key);m.change(saveWallAssembly({...type,layers:type.layers.map((l,i)=>({...l,t:l.t+(i===0?6.35:0)}))}));const final=rootIdentities(m);check(6900,true);
 for(let i=0;i<3;i++){m.ed.undo();assert.deepEqual(rootIdentities(m),beforeFinish);check(6900,false);m.ed.redo();assert.deepEqual(rootIdentities(m),final);check(6900,true);}const re=await reopen(m.ed.save());assert.deepEqual(rootIdentities(re),final);save(m,'multilevel');fs.writeFileSync(out+'/multilevel-info.json',JSON.stringify({level:levels[1].guid,baseOffset:125,height:6700,walls:16}));
});
test('protected join record blocks Copy Level without partial mutation or history',async()=>{
 const m=await model();m.change(newLevel({name:'Blocked copy',elevation:3300,height:3300}));const levels=readLevels(m.w()),wall=readWalls(m.w())[0];m.w().run(w=>w.upsertPset(wall.id,JOIN_PSET,[['Settings','IFCTEXT','{"version":99,"future":true}']]));const original=bytes(m),history=m.ed.changes.length;assert.ok(readJoinRecord(m.w(),wall.id).issue);assert.throws(()=>m.change(copyLevel({from:levels[0].guid,to:levels[1].guid})));assert.deepEqual(bytes(m),original);assert.equal(m.ed.changes.length,history);
});
