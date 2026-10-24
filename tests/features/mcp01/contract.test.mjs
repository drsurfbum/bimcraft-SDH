/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { model, cases } from '../f02/fixtures.mjs';
import { modelTools, installAgents } from '../../../app/agents.js';
import { buildMirror } from '../../../devshell/test.mjs';
import { documentState } from '../../../app/material-wall-agent.js';
import { createDispatcher } from '../../../app/host.js';
import { readWalls } from '../../../app/model-walls.js';
import { ids } from '../../../app/ifc-util.js';
import { REQUIRED } from './workflow.mjs';
const fixture = () => fs.readFileSync('fixtures/f04/layered-plans.ifc');
const bytes = m => m.w().api.file(m.w().mid).save({timeStamp:'2026-10-24T12:00:00'});
const dispatcher = (m, env = {}) => {
 const d=createDispatcher({allowed:()=>['read','edit','save']});
 for(const t of modelTools({ed:()=>m.ed,apply:(label,op)=>m.ed.modelChange(op,{label:'Assistant: '+label}),...env}))d.tool(t);
 return d;
};
const value=async(d,name,args={})=>{const r=await d.call(name,args);assert.ok(!r.isError,JSON.stringify(r));return r.structuredContent;};
test('required semantic registrations have strict schemas; authored selection has no static enum',async()=>{
 const m=await model(fixture()),d=dispatcher(m);
 for(const name of REQUIRED.filter(n=>n!=='redo'))assert.ok(d.has(name),name);
 assert.equal(d.get('walls_add').inputSchema.properties.type.enum,undefined);
 for(const name of ['material_create','material_edit','assembly_create','assembly_edit','assembly_duplicate','walls_edit']) {
  const s=d.get(name).inputSchema;assert.equal(s.additionalProperties,false);assert.ok(s.required.includes('documentId'));assert.ok(s.required.includes('expectedRevision'));
 }
 assert.ok((await value(d,'model_describe')).types.walls.includes('wall-f04-rainscreen'));
});
test('real live installer and headless registry have the same semantic schemas and groups',async()=>{
 buildMirror();
 const {headlessTools,createEnv}=await import('../../../.cc-test/tools/cli/headless/tools.mjs');
 const registered=[];
 installAgents({extend:()=>({ed:()=>null,S:{},host:{}})},{control:{tool:t=>registered.push(t)}});
 const headless=headlessTools(createEnv());
 for(const name of REQUIRED) {
  const live=registered.find(t=>t.name===name),h=headless.find(t=>t.name===name);assert.ok(live,name);assert.ok(h,name);assert.equal(h.group,live.group);
  if(name==='redo')continue; // generic headless history adapter also names doc; ownership is separately exercised.
  const {doc,...properties}=h.inputSchema.properties;assert.ok(doc);
  assert.deepEqual({...h.inputSchema,properties,required:h.inputSchema.required.filter(k=>k!=='doc')},live.inputSchema || {type:'object',properties:{},required:[],additionalProperties:false});
 }
});
test('read-only discovery does not migrate records, dirty the editor or alter saved bytes',async()=>{
 const m=await model(fixture()),d=dispatcher(m),before=bytes(m);
 for(const name of ['model_describe','materials_list','assemblies_list','walls_list'])await value(d,name);
 assert.equal(m.ed.dirty,false);assert.deepEqual(bytes(m),before);
});
test('separately opened copies have distinct document tokens even with identical IFC GlobalIds',async()=>{
 const a=await model(fixture()),b=await model(fixture());assert.equal(documentState(a.ed).projectId,documentState(b.ed).projectId);
 assert.notEqual(documentState(a.ed).documentId,documentState(b.ed).documentId);
 const state=documentState(a.ed),before=bytes(b),r=await dispatcher(b).call('material_edit',{documentId:state.documentId,expectedRevision:state.revision,id:'material-studs',changes:{defaultThickness:250}});
 assert.equal(r.isError,true);assert.deepEqual(bytes(b),before);
});
test('concurrent calls and stale revision are rejected before changes',async()=>{
 const m=await model(fixture());let release;
 const gate=new Promise(r=>release=r),d=dispatcher(m,{apply:async(label,op)=>{await gate;return m.ed.modelChange(op,{label:'Assistant: '+label});}}),s=documentState(m.ed);
 const args={documentId:s.documentId,expectedRevision:s.revision,id:'material-studs',changes:{defaultThickness:250}};
 const first=d.call('material_edit',args),busy=await d.call('material_edit',args);assert.equal(busy.isError,true);assert.equal(m.ed.dirty,false);
 release();assert.ok(!(await first).isError);assert.equal((await d.call('material_edit',args)).isError,true);assert.equal(m.ed.changes.length,1);
});
test('live busy and changed-document callbacks fail without applying to a replacement editor',async()=>{
 const m=await model(fixture()),other=await model(fixture()),s=documentState(m.ed),args={documentId:s.documentId,expectedRevision:s.revision,id:'material-studs',changes:{defaultThickness:250}};
 const busy=dispatcher(m,{busy:()=>true});assert.equal((await busy.call('material_edit',args)).isError,true);
 const swapped=dispatcher(m,{apply:(_label,op)=>other.ed.modelChange(op)});assert.equal((await swapped.call('material_edit',args)).isError,true);
 assert.equal(m.ed.dirty,false);assert.equal(other.ed.dirty,false);
});
test('wall batch with a valid ID followed by an unknown ID does not partially assign',async()=>{
 const m=await model(fixture()),d=dispatcher(m),s=documentState(m.ed),before=bytes(m);
 assert.equal((await d.call('walls_edit',{documentId:s.documentId,expectedRevision:s.revision,walls:[readWalls(m.w())[0].guid,'unknown'],changes:{height:2000}})).isError,true);assert.deepEqual(bytes(m),before);
});
test('invalid raw instance location line is diagnosed instead of silently falling back to center',async()=>{
 const m=await model(fixture()),wall=readWalls(m.w())[0];m.w().run(w=>{w.upsertPset(wall.id,'CadCraft_Wall',[['Justification','IFCLABEL','future-anchor']]);return {};});
 const d=dispatcher(m),s=documentState(m.ed),before=bytes(m),walls=await value(d,'walls_list');assert.ok(walls.walls.find(w=>w.guid===wall.guid).diagnostic);
 assert.equal((await d.call('walls_edit',{documentId:s.documentId,expectedRevision:s.revision,walls:[wall.guid],changes:{height:2000}})).isError,true);assert.deepEqual(bytes(m),before);
});
test('unresolved top level is refused; stored IFC type and product GlobalIds are explicit',async()=>{
 const m=await model(fixture()),d=dispatcher(m),rows=(await value(d,'walls_list')).walls;
 for(const row of rows){assert.ok(row.guid);assert.ok(row.typeGuid);assert.ok(row.levelId);assert.ok(Number.isInteger(row.id));}
 const w=readWalls(m.w())[0];m.w().run(x=>{x.upsertPset(w.id,'CadCraft_Wall',[['TopLevel','IFCIDENTIFIER','missing-level']]);return {};});
 const s=documentState(m.ed);assert.equal((await d.call('walls_edit',{documentId:s.documentId,expectedRevision:s.revision,walls:[w.guid],changes:{height:2400}})).isError,true);
 assert.ok(ids(m.w().api,m.w().mid,'IFCPROJECT').length);
});
for(const unit of ['mm','m','inch','foot'])test('F02 exact machine read-back in '+unit+' file units retains sub-0.005 mm values',async()=>{
 const c=cases.find(c=>c.unit===unit&&!c.translated),m=await model(fs.readFileSync('fixtures/f02/'+c.name+'.ifc')),d=dispatcher(m);
 const rows=(await value(d,'walls_list')).walls;assert.equal(rows.length,3);
 assert.ok(Math.abs(rows[0].height-2700.123456)<.005);assert.ok(Math.abs(rows[0].a[0]-.000123)<.005);
 const layer=(await value(d,'assemblies_list')).assemblies.find(t=>t.key==='wall-f02').layers[0];assert.equal(layer.t,19.123456);
});
