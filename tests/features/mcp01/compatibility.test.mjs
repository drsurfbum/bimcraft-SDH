/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {model} from '../f02/fixtures.mjs';
import {modelTools,propRef} from '../../../app/agents.js';
import {documentState} from '../../../app/material-wall-agent.js';
import {readWalls} from '../../../app/model-walls.js';
import {readAssemblyRecords} from '../../../app/wall-assemblies.js';
import {val} from '../../../app/ifc-util.js';
import {createDispatcher} from '../../../app/host.js';
import {corruptFixtures} from './negative-fixtures.mjs';
const fixture=fs.readFileSync('fixtures/f04/layered-plans.ifc');
const bytes=m=>m.ed.api.file(m.ed.mid).save({timeStamp:'2026-10-26T12:00:00'});
const state=m=>{const s=documentState(m.ed);return{documentId:s.documentId,expectedRevision:s.revision};};
const view=m=>({bytes:bytes(m),changes:[...m.ed.changes],undone:[...m.ed.undone]});
function dispatcher(m,extra={}) {const d=createDispatcher({allowed:()=>['read','edit','save']});for(const t of modelTools({ed:()=>m.ed,apply:(label,op)=>m.ed.modelChange(op,{label:'Assistant: '+label}),...extra}))d.tool(t);return d;}
const generic=['element_set','elements_move','elements_delete','wall_change','opening_change'];
test('0.7 union registers each model capability once and every edit accepts checked bindings',async()=>{
 const m=await model(fixture),d=dispatcher(m),tools=d.list();assert.equal(new Set(tools.map(t=>t.name)).size,tools.length);
 for(const name of generic){assert.ok(d.has(name));assert.ok(d.get(name).inputSchema.properties.documentId);assert.ok(d.get(name).inputSchema.properties.expectedRevision);}
 assert.equal(d.get('wall_change').inputSchema.properties.type.enum,undefined);
});
test('generic routes refuse wrong/stale bindings, missing IDs, busy state and mixed invalid batches atomically',async()=>{
 const m=await model(fixture),other=await model(fixture),d=dispatcher(m),w=readWalls(m.w())[0],before=view(m);
 const cases=[['element_set',{guid:w.guid,attribute:'Name',value:'refused'}],['wall_change',{guid:w.guid,type:w.typeKey}],['elements_delete',{guids:[w.guid]}],['elements_move',{guids:[w.guid],by:[1,2]}]];
 for(const [name,args] of cases)for(const binding of [state(other),{...state(m),expectedRevision:999}])assert.equal((await d.call(name,{...binding,...args})).isError,true);
 assert.equal((await d.call('elements_delete',{guids:[w.guid,'missing']})).isError,true);
 assert.equal((await d.call('wall_change',{guid:w.guid,type:'wall-missing'})).isError,true);
 assert.equal((await dispatcher(m,{busy:()=>true}).call('element_set',{guid:w.guid,attribute:'Name',value:'busy'})).isError,true);
 assert.deepEqual(view(m),before);assert.equal((await dispatcher(m,{ }).call('opening_change',{guid:'missing',width:1000})).isError,true);
});
for(const interruption of ['switch','revision','busy'])test('generic deferred commit refuses an intervening '+interruption,async()=>{
 const a=await model(fixture),b=await model(fixture);let active=a,why=null,release,entered;
 const gate=new Promise(r=>release=r),ready=new Promise(r=>entered=r),beforeA=view(a),beforeB=view(b);
 const d=dispatcher(a,{ed:()=>active.ed,busy:()=>why,apply:async(label,op)=>{entered();await gate;return active.ed.modelChange(op,{label:'Assistant: '+label});}});
 const w=readWalls(a.w())[0],pending=d.call('wall_change',{...state(a),guid:w.guid,type:'int-2x4'});await ready;
 if(interruption==='switch')active=b;else if(interruption==='busy')why=true;else a.ed.setAttribute(w.id,'Name','Person intervening');
 const afterIntervention=view(a);release();assert.equal((await pending).isError,true);assert.deepEqual(view(a),interruption==='revision'?afterIntervention:beforeA);assert.deepEqual(view(b),beforeB);
});
test('generic and semantic edits share request exclusion without blocking later replay',async()=>{
 const m=await model(fixture);let release,entered;const gate=new Promise(r=>release=r),ready=new Promise(r=>entered=r);
 const d=dispatcher(m,{apply:async(label,op)=>{entered();await gate;return m.ed.modelChange(op,{label:'Assistant: '+label});}}),w=readWalls(m.w())[0];
 const pending=d.call('material_edit',{...state(m),id:'material-studs',changes:{defaultThickness:300}});await ready;
 assert.equal((await d.call('element_set',{...state(m),guid:w.guid,attribute:'Name',value:'blocked'})).isError,true);
 release();assert.ok(!(await pending).isError);const changed=bytes(m);m.ed.undo();m.ed.redo();assert.deepEqual(bytes(m),changed);
});
test('generic element_set cannot reach a protected property through an ordinary shared alias',async()=>{
 const m=await model(fixture),w=readWalls(m.w())[0],ref=propRef(m.ed,w.id,'CadCraft_Wall','Height');
 m.w().run(writer=>{const ps=writer.upsertPset(w.id,'OrdinaryAlias',[['Harmless','IFCLABEL','ok']]);const set=writer.touch(ps);set.HasProperties.push(writer.H(ref.propId));writer.write(set);return{};});
 m.ed.reindex();assert.ok(propRef(m.ed,w.id,'OrdinaryAlias','Height'));
 const before=view(m),r=await dispatcher(m).call('element_set',{...state(m),guid:w.guid,set:'OrdinaryAlias',property:'Height',value:9999});assert.equal(r.isError,true);assert.match(r.content.map(c=>c.text||'').join(' '),/protected model record/);assert.deepEqual(view(m),before);
});
test('every malformed material/assembly/wall fixture also refuses all generic mutation routes without migration',async()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'mcp01-up07-corrupt-'));
 try{for(const file of await corruptFixtures(out)){
  const m=await model(fs.readFileSync(file)),d=dispatcher(m),before=view(m),w=readWalls(m.w())[0];
  const cases=[['element_set',{guid:w.guid,attribute:'Name',value:'no bypass'}],['wall_change',{guid:w.guid,type:'int-2x4'}],['elements_delete',{guids:[w.guid]}],['elements_move',{guids:[w.guid],by:[1,2]}],['opening_change',{guid:'missing',width:1000}]];
  for(const [name,args] of cases){assert.equal((await d.call(name,{...state(m),...args})).isError,true,path.basename(file)+' '+name);assert.deepEqual(view(m),before);}
 }}finally{fs.rmSync(out,{recursive:true,force:true});}
});
test('retained generic movement changes actual placement, deletion/Undo restore it, and opening edits remain journaled',async()=>{
 const m=await model(fixture),d=dispatcher(m);
 const value=async(name,args)=>{const r=await d.call(name,{...state(m),...args});assert.ok(!r.isError,JSON.stringify(r));return r.structuredContent;};
 const floor=(await value('floor_add',{points:[[100000,100000],[102000,100000],[102000,102000],[100000,102000]]})).floor;
 const position=()=>{const w=m.w(),id=w.byGuid(floor),lp=w.api.GetLine(w.mid,id,false).ObjectPlacement.value;return [...w.api.GetWorldTransformMatrix(w.mid,lp)].slice(12,15);};
 const before=position();await value('elements_move',{guids:[floor],by:[123.123456,456.123456,0]});const moved=position();
 for(const [i,delta] of [123.123456,456.123456,0].entries())assert.ok(Math.abs(moved[i]-before[i]-delta)<.005);
 m.ed.undo();assert.deepEqual(position(),before);await value('elements_delete',{guids:[floor]});assert.equal(m.w().byGuid(floor),null);m.ed.undo();assert.deepEqual(position(),before);
 const walls=readWalls(m.w()),opening=(await d.call('walls_list',{})).structuredContent.walls.flatMap(w=>w.openings).find(o=>o.kind==='door');
 await value('opening_change',{guid:opening.guid,width:opening.width-1});m.ed.undo();assert.deepEqual(readWalls(m.w()),walls);
});

test('generic edits cannot migrate legacy recipes; explicit semantic save migrates with reversible history',async()=>{
 const m=await model(fixture),record=readAssemblyRecords(m.w())[0],legacy=JSON.parse(record.raw);delete legacy.version;
 m.w().run(w=>{const ps=w.api.GetLine(w.mid,record.psetId,false),p=ps.HasProperties.map(h=>w.api.GetLine(w.mid,h.value,false)).find(p=>val(p.Name)==='Recipe');const q=w.touch(p.expressID);q.NominalValue=w.T('IFCTEXT',JSON.stringify(legacy));w.write(q);return{};});
 const d=dispatcher(m),original=bytes(m),w=readWalls(m.w()).find(w=>w.typeKey===record.key);
 for(const name of ['materials_list','assemblies_list','walls_list'])assert.ok(!(await d.call(name,{})).isError);
 assert.deepEqual(bytes(m),original);
 assert.equal((await d.call('element_set',{...state(m),guid:w.guid,set:'CadCraft_WallType',property:'Recipe',value:JSON.stringify({...legacy,version:1}),type:true})).isError,true);assert.deepEqual(bytes(m),original);
 assert.ok(!(await d.call('element_set',{...state(m),guid:w.guid,attribute:'Name',value:'ordinary legacy edit'})).isError);m.ed.undo();assert.deepEqual(bytes(m),original);
 assert.ok(!(await d.call('assembly_edit',{...state(m),key:record.key,typeGuid:record.guid,changes:{name:record.name+' migrated'}})).isError);
 assert.equal(JSON.parse(readAssemblyRecords(m.w()).find(r=>r.key===record.key).raw).version,1);m.ed.undo();assert.deepEqual(bytes(m),original);m.ed.redo();assert.equal(JSON.parse(readAssemblyRecords(m.w()).find(r=>r.key===record.key).raw).version,1);
});
