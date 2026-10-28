/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import crypto from 'node:crypto';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {model} from '../f04/fixture.mjs';
import {documentationFixture} from './doc-mcp-fixture.mjs';
import {modelTools,installAgents,propRef} from '../../../app/agents.js';
import {createDispatcher} from '../../../app/host.js';
import {documentState} from '../../../app/material-wall-agent.js';
import {changeWall} from '../../../app/model-ops.js';
import {readWalls,locationLine,storedShape} from '../../../app/model-walls.js';
import {readOpenings} from '../../../app/model-openings.js';
import {readWallDimensions} from '../../../app/wall-dimensions.js';
import {documentationInput} from '../../../app/documentation-export.js';
import {liveHistory} from '../../../app/agent-history.js';
import {ids} from '../../../app/ifc-util.js';
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'doc-mcp-unit-')),info=await documentationFixture(tmp);
export const NAMES=['documentation_sources','documentation_activate','documentation_view_get','documentation_views_set','documentation_templates_get','documentation_template_save','documentation_template_remove','documentation_callout_save','documentation_callout_remove','documentation_annotations_get','documentation_annotation_create','documentation_annotation_edit','documentation_annotation_remove','documentation_dimensions_get','documentation_dimension_save','documentation_dimension_remove','documentation_table_prepare','documentation_sheets_get','documentation_sheet_save','documentation_sheet_remove','documentation_export'];
const open=()=>model(fs.readFileSync(info.file));
const binding=m=>{const s=documentState(m.ed);return{documentId:s.documentId,expectedRevision:s.revision};};
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'||v instanceof Uint8Array?v:JSON.stringify(v)).digest('hex');
const fingerprint=m=>({bytes:sha(m.w().api.file(m.w().mid).save({timeStamp:'2026-10-27T15:00:00'})),changes:m.ed.changes.map(c=>[c.kind,c.label]),undone:m.ed.undone.map(c=>[c.kind,c.label]),profiles:sha(readWalls(m.w()).map(w=>[w.guid,storedShape(m.w(),w.id),locationLine(w)])),openings:sha(readOpenings(m.w())),dimensions:sha(readWallDimensions(m.w()))});
const dispatcher=(m,extra={},allow=['read','edit','export'])=>{const d=createDispatcher({allowed:()=>allow});for(const t of modelTools({ed:()=>m.ed,apply:(label,op)=>m.ed.modelChange(op,{label:'Assistant: '+label}),...extra}))d.tool(t);return d;};
const call=async(d,m,name,args={})=>{const b=binding(m);if(modelTools({ed:()=>null}).find(t=>t.name===name)?.group==='read')delete b.expectedRevision;const r=await d.call(name,{...b,...args});assert.ok(!r.isError,name+': '+JSON.stringify(r));return r.structuredContent;};
const read=async(d,m,source=info.plan)=>call(d,m,'documentation_view_get',{source});

test('all 21 documentation schemas register identically in shared/live installers with explicit ownership and strict patches',()=>{
 const live=[];installAgents({extend:()=>({ed:()=>null,S:{},host:{}})},{control:{tool:t=>live.push(t)}});const shared=modelTools({ed:()=>null});
 assert.deepEqual(shared.filter(t=>t.name.startsWith('documentation_')).map(t=>t.name),NAMES);
 for(const name of NAMES){const t=shared.find(t=>t.name===name),actual=live.find(t=>t.name===name);assert.ok(actual,name);assert.deepEqual(actual.inputSchema,t.inputSchema);assert.ok(t.inputSchema.required.includes('documentId'));assert.equal(t.inputSchema.additionalProperties,false);if(t.group==='edit'||t.group==='export')assert.ok(t.inputSchema.required.includes('expectedRevision'));}
});
test('sources/settings/tables/reference reads are nonmutating and preserve raw mm and actual continuation identities',async()=>{
 const m=await open(),d=dispatcher(m),before=fingerprint(m);const r=await call(d,m,'documentation_sources');assert.equal(r.diagnostics.length,0);assert.ok(r.sources.some(s=>s.id===info.plan));assert.ok(r.sources.some(s=>s.continuation&&s.id==='schedule:f06-assemblies:5'));
 const v=await read(d,m);assert.equal(v.effective.scale,50);assert.equal(v.effective.detail,'fine');assert.equal(v.raw.level,info.level);
 const table=await call(d,m,'documentation_table_prepare',{source:'schedule:assemblies'});assert.equal(table.derived,true);assert.equal(table.table.csvHead.length,17);assert.equal(table.table.csvRows.filter(r=>r[0]==='layer').length,53);assert.equal(table.pages.length,5);
 const dims=await call(d,m,'documentation_dimensions_get');assert.equal(dims.dimensions.length,2);for(const dim of dims.dimensions){assert.equal(dim.resolution.status,'ok');assert.ok(dim.resolution.value>0);}
 const activate=await call(d,m,'documentation_activate',{source:info.plan});assert.equal(activate.code,'LIVE_ONLY');assert.equal(activate.completedSteps,0);assert.deepEqual(fingerprint(m),before);
});
test('multi-view writes preflight every target, preserve other settings, repeat replay and genuine no-ops',async()=>{
 const m=await open(),d=dispatcher(m),before=fingerprint(m),initial=await read(d,m);const bad=await d.call('documentation_views_set',{...binding(m),sources:[info.plan,'section:'+info.section],patch:{cut:1300}});assert.equal(bad.isError,true);assert.deepEqual(fingerprint(m),before);
 const r=await call(d,m,'documentation_views_set',{sources:[info.plan,info.rcp],patch:{detail:'coarse',scale:25}});assert.equal(r.completedSteps,2);assert.equal(r.undo.available,true);assert.equal(r.undo.steps,2);assert.equal((await read(d,m)).effective.cut,initial.effective.cut);
 const saved=fingerprint(m);for(let i=0;i<3;i++){m.ed.undo();m.ed.undo();assert.equal((await read(d,m)).effective.detail,'fine');m.ed.redo();m.ed.redo();assert.equal(fingerprint(m).profiles,saved.profiles);assert.equal((await read(d,m)).effective.scale,25);}
 const count=m.ed.changes.length,noOp=await call(d,m,'documentation_views_set',{sources:[info.plan,info.rcp],patch:{detail:'coarse',scale:25}});assert.equal(noOp.changed,false);assert.equal(noOp.completedSteps,0);assert.equal(noOp.undo.available,false);assert.equal(m.ed.changes.length,count);
 const reopened=await model(m.ed.save());assert.equal((await read(dispatcher(reopened),reopened)).effective.scale,25);assert.equal(fingerprint(m).profiles,before.profiles);assert.equal(fingerprint(m).openings,before.openings);assert.equal(fingerprint(m).dimensions,before.dimensions);
});
test('template-owned settings refuse direct writes and deletion retains effective values; callouts retain parent identities',async()=>{
 const m=await open(),d=dispatcher(m);await call(d,m,'documentation_template_save',{name:'Owned template',patch:{cut:1250,top:3300,detail:'medium',scale:100}});await call(d,m,'documentation_views_set',{sources:[info.plan],patch:{template:'Owned template'}});
 const before=fingerprint(m);assert.equal((await d.call('documentation_views_set',{...binding(m),sources:[info.plan],patch:{detail:'fine'}})).isError,true);assert.deepEqual(fingerprint(m),before);
 assert.equal((await read(d,m)).effective.cut,1250);await call(d,m,'documentation_template_remove',{name:'Owned template'});assert.equal((await read(d,m)).effective.cut,1250);assert.equal((await read(d,m)).effective.template,'');
 const c=await call(d,m,'documentation_callout_save',{name:'Detail',parent:info.plan,crop:[0,0,3000,2000],scale:25});const id=c.steps[0].value.callout.id;
 const v=await read(d,m,'callout:'+id);assert.equal(v.inheritedFrom,info.plan);assert.equal(v.effective.cut,1250);assert.equal(v.effective.scale,25);
});
for(const action of ['undo','person-edit','source-switch','project-switch','closed','notification'])test('multi-step '+action+' interruption credits only confirmed own work and stops before source two',async()=>{
 const m=await open(),other=await open(),untouched=fingerprint(other);let active=m.ed,source=info.plan,calls=0,afterPerson;
 const d=dispatcher(m,{ed:()=>active,documentationContext:()=>source,apply:async(label,op)=>{calls++;const result=m.ed.modelChange(op,{label:'Assistant: '+label});await Promise.resolve();if(action==='undo')m.ed.undo();if(action==='person-edit')m.ed.modelChange(changeWall(info.walls[0],{height:2900}),{label:'Wall'});if(action==='source-switch')source=info.rcp;if(action==='project-switch')active=other.ed;if(action==='closed')m.ed.api.CloseModel(m.ed.mid);if(action!=='closed')afterPerson=fingerprint(m);if(action==='notification')throw new Error('notification failed');return result;}});
 const r=await d.call('documentation_views_set',{...binding(m),sources:[info.plan,info.rcp],patch:{scale:25}}),s=r.structuredContent;assert.equal(r.isError,true);assert.equal(s.completedSteps,1);assert.equal(s.changed,true);assert.equal(s.complete,false);assert.equal(s.undo.available,false);assert.equal(s.undo.owner,null);assert.equal(s.readback.current,false);assert.equal(calls,1);assert.deepEqual(fingerprint(other),untouched);
 if(action!=='closed'){assert.deepEqual(fingerprint(m),afterPerson);const old=await model(m.ed.save()),rd=dispatcher(old);assert.equal((await read(rd,old,info.rcp)).effective.scale,100);}
 if(action==='person-edit'){
  const history=liveHistory({ed:()=>m.ed,busy:()=>false,settle:async()=>{},undo:async h=>{h.before(m.ed);h.after(m.ed,m.ed.undo());},redo:async()=>{}}),before=fingerprint(m),refused=await history('undo',{...binding(m),steps:1});assert.equal(refused.stopped.code,'person_owned');assert.deepEqual(fingerprint(m),before);assert.equal(readWalls(m.w())[0].height,2900);
 }
});
test('strict invalid/stale/foreign/permission/busy/duplicate requests preserve both matching projects',async()=>{
 const m=await open(),other=await open(),d=dispatcher(m),before=fingerprint(m),untouched=fingerprint(other),a={...binding(m),sources:[info.plan],patch:{scale:25}};
 assert.equal(documentState(m.ed).projectId,documentState(other.ed).projectId);assert.notEqual(binding(m).documentId,binding(other).documentId);
 for(const args of [{...a,documentId:binding(other).documentId},{...a,expectedRevision:99},{...a,patch:{}},{...a,patch:{scale:'25'}},{...a,patch:{node:'injected'}},{...a,sources:[info.plan,info.plan]},{...a,sources:['Foreign drawing name']},{...a,patch:{cut:3400,top:3300}}]){assert.equal((await d.call('documentation_views_set',args)).isError,true);assert.deepEqual(fingerprint(m),before);assert.deepEqual(fingerprint(other),untouched);}
 assert.equal((await dispatcher(m,{},['read']).call('documentation_views_set',a)).isError,true);assert.equal((await dispatcher(m,{busy:()=>true}).call('documentation_views_set',a)).isError,true);assert.deepEqual(fingerprint(m),before);
});
test('new structured records refuse direct/forged/resolved aliases specifically with Redo, IFC/profile/opening/dimension state unchanged',async()=>{
 const m=await open();m.change(changeWall(info.walls[0],{height:2900}));m.ed.undo();const d=dispatcher(m),before=fingerprint(m),entries=[...m.ed.changes],redo=[...m.ed.undone];
 for(const row of info.aliases){const w=m.w(),id=ids(w.api,w.mid,'IFCROOT',true).find(id=>w.guidOf(id)===row.recordOwner),aliasId=w.byGuid(row.owner),direct=propRef(m.ed,id,row.set,row.property),alias=propRef(m.ed,aliasId,row.alias,row.property);assert.ok(direct&&alias,row.set);assert.equal(direct.propId,alias.propId);
  for(const [owner,ref]of [[id,direct],[id,{...direct,setName:'Forged ordinary'}],[aliasId,alias]]){assert.throws(()=>m.ed.setProperty(owner,ref,'overwrite'),/protected model record/);assert.deepEqual(fingerprint(m),before);}
  for(const set of [...(row.directMcpSupported?[row.set]:[]),row.alias]){const r=await d.call('element_set',{...binding(m),guid:row.owner,set,property:row.property,value:'overwrite'});assert.equal(r.isError,true);assert.match(JSON.stringify(r),/protected model record/);assert.deepEqual(fingerprint(m),before);}
 }
 assert.ok(m.ed.changes.every((x,i)=>x===entries[i])&&m.ed.undone.every((x,i)=>x===redo[i]));m.ed.redo();assert.equal(readWalls(m.w())[0].height,2900);m.ed.undo();assert.equal(fingerprint(m).profiles,before.profiles);
});
test('unsupported/duplicate record versions refuse mutation without rewriting tolerant UI defaults',async()=>{
 for(const mode of ['future','duplicate']){const m=await open();m.w().run(w=>{const id=w.byGuid(info.hatch);if(mode==='future')w.upsertPset(id,'CadCraft_Drafting',[['Version','IFCINTEGER',2]]);else{const old=w.defNamed(id,'CadCraft_Drafting').line;const copy=w.make('IFCPROPERTYSET',w.guid(),w.ownerHistory(),w.L('CadCraft_Drafting'),null,old.HasProperties);w.relate(id,copy);}return{};});const before=fingerprint(m),d=dispatcher(m),r=await d.call('documentation_annotation_edit',{...binding(m),guid:info.hatch,patch:{pattern:'cross'}});assert.equal(r.isError,true);assert.match(JSON.stringify(r),/DOC_RECORD_(UNSUPPORTED|CORRUPT)/);assert.deepEqual(fingerprint(m),before);}
});
test('snapshot document composition retains persistent dimension endpoints, native drafting/section/callout marks and physical model',async()=>{
 const m=await open(),d=dispatcher(m),before=fingerprint(m);await call(d,m,'documentation_callout_save',{name:'Detail',parent:info.plan,crop:[0,0,3000,2200],scale:25});const current=fingerprint(m),render=await documentationInput(m.ed);try{const scene=render.sceneFor(info.plan);assert.equal(scene.dims.length,2);for(const d of scene.dims){assert.ok(d.value>0);assert.equal(d.witnesses.length,2);}assert.ok(scene.drafting.some(d=>d.guid===info.hatch));assert.ok(scene.symbols.some(s=>s.callout));assert.ok(scene.rooms.some(r=>r.label?.[0]==='A'));assert.deepEqual(fingerprint(m),current);assert.equal(current.profiles,before.profiles);}finally{render.close();}
});

test('pending Properties input refuses mutation and activation while read-only inspection remains available',async()=>{
 const m=await open(),d=dispatcher(m,{documentationEditing:()=>true}),before=fingerprint(m);
 assert.ok((await call(d,m,'documentation_view_get',{source:info.plan})).effective);
 assert.equal((await d.call('documentation_views_set',{...binding(m),sources:[info.plan],patch:{scale:25}})).isError,true);
 assert.equal((await d.call('documentation_activate',{...binding(m),source:info.plan})).isError,true);
 assert.deepEqual(fingerprint(m),before);
});
test('authored page overflow refuses before output rather than silently changing scale; six display export units retain raw mm',async()=>{
 const m=await open();let writes=0;const d=dispatcher(m,{exportDocumentation:async()=>{writes++;return{written:true};}});
 await call(d,m,'documentation_views_set',{sources:['elevation:south'],patch:{scale:20}});const before=fingerprint(m);
 const refused=await d.call('documentation_export',{...binding(m),source:'drawing-set',format:'pdf'});assert.equal(refused.isError,true);assert.match(JSON.stringify(refused),/OUTPUT_OUTSIDE_PAGE/);assert.equal(writes,0);assert.deepEqual(fingerprint(m),before);
 for(const units of ['mm','cm','m','in','ftdec','ftin']){const r=await call(d,m,'documentation_export',{source:info.plan,format:'pdf',units});assert.equal(r.exported,true);assert.deepEqual(fingerprint(m),before);}
 assert.equal(writes,6);
});
