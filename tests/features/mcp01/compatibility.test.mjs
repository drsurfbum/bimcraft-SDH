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
 const before=view(m),r=await dispatcher(m).call('element_set',{...state(m),guid:w.guid,set:'OrdinaryAlias',property:'Height',value:9999});assert.equal(r.isError,true);assert.deepEqual(view(m),before);
});
test('every malformed material/assembly/wall fixture also refuses all generic mutation routes without migration',async()=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'mcp01-up07-corrupt-'));
 try{for(const file of await corruptFixtures(out)){
  const m=await model(fs.readFileSync(file)),d=dispatcher(m),before=view(m),w=readWalls(m.w())[0];
  const cases=[['element_set',{guid:w.guid,attribute:'Name',value:'no bypass'}],['wall_change',{guid:w.guid,type:'int-2x4'}],['elements_delete',{guids:[w.guid]}],['elements_move',{guids:[w.guid],by:[1,2]}],['opening_change',{guid:'missing',width:1000}]];
  for(const [name,args] of cases){assert.equal((await d.call(name,{...state(m),...args})).isError,true,path.basename(file)+' '+name);assert.deepEqual(view(m),before);}
 }}finally{fs.rmSync(out,{recursive:true,force:true});}
});
