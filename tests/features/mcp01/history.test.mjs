/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {model} from '../f02/fixtures.mjs';
import {installAgents,modelTools} from '../../../app/agents.js';
import {documentState} from '../../../app/material-wall-agent.js';
import {createDispatcher} from '../../../app/host.js';
const bytes=m=>m.w().api.file(m.w().mid).save({timeStamp:'2026-10-24T12:00:00'});
const view=m=>({bytes:bytes(m),changes:[...m.ed.changes],undone:[...m.ed.undone]});
const binding=m=>{const s=documentState(m.ed);return{documentId:s.documentId,expectedRevision:s.revision};};
async function edit(m,width) {
 const tools=modelTools({ed:()=>m.ed,apply:(label,op)=>m.ed.modelChange(op,{label:'Assistant: '+label})});
 return tools.find(t=>t.name==='material_edit').run({...binding(m),id:'material-studs',changes:{defaultThickness:width}});
}
async function setup(count=2) {
 const a=await model(fs.readFileSync('fixtures/f04/layered-plans.ifc')),b=await model(fs.readFileSync('fixtures/f04/layered-plans.ifc'));
 for(let i=0;i<count;i++)await edit(a,250+i);await edit(b,300);
 const h={a,b,active:a,busy:null,S:{},targets:[],before:null,after:null};
 const d=createDispatcher({allowed:()=>['read','edit','save']});
 const mutate=kind=>async hooks=>{
  await h.before?.(kind,hooks);
  hooks.before(h.active.ed);
  h.targets.push(h.active===a?'A':'B');
  const c=h.active.ed[kind]();hooks.after(h.active.ed,c);
  await h.after?.(kind,hooks);
 };
 installAgents({extend:()=>({ed:()=>h.active.ed,S:h.S,host:{}})},{control:d,undo:mutate('undo'),redo:mutate('redo'),busy:()=>h.busy});
 h.call=(name,args={})=>d.call(name,{...binding(h.active),...args});
 return h;
}
const progress=(r,n,complete,code)=>{assert.equal(!!r.isError,!complete);const s=r.structuredContent;assert.equal(s.completedSteps,n);assert.equal(s.complete,complete);if(code)assert.equal(s.stopped.code,code);return s;};
test('same-project multi-step Undo advances its own revision and subsequent Undo/Redo still work',async()=>{
 const h=await setup(),initial=bytes(h.a),b=view(h.b),start=binding(h.a);
 const r=await h.call('undo',{steps:2});progress(r,2,true);assert.equal(h.a.ed.changes.length,0);assert.deepEqual(h.targets,['A','A']);assert.deepEqual(view(h.b),b);
 assert.ok(r.structuredContent.revision>start.expectedRevision);
 for(let i=0;i<2;i++)progress(await h.call('redo'),1,true);
 assert.deepEqual(bytes(h.a),initial);progress(await h.call('undo'),1,true);progress(await h.call('redo'),1,true);
});
test('switch after the first awaited Undo reports one completed A step and never changes B',async()=>{
 const h=await setup(),b=view(h.b),state=binding(h.a);h.after=async()=>{h.active=h.b;};
 const r=await h.call('undo',{...state,steps:2}),s=progress(r,1,false,'document_changed');
 assert.equal(s.documentId,state.documentId);assert.equal(s.undone.length,1);assert.equal(s.requestedSteps,2);assert.equal(h.a.ed.changes.length,1);assert.deepEqual(view(h.b),b);assert.deepEqual(h.targets,['A']);
});
test('an obsolete callback without a receipt stops after A and distinguishes unconfirmed from owned progress',async()=>{
 const h=await setup(1),d=createDispatcher({allowed:()=>['read','edit']}),b=view(h.b);
 installAgents({extend:()=>({ed:()=>h.active.ed,S:{},host:{}})},{control:d,undo:async()=>{h.targets.push(h.active===h.a?'A':'B');h.active.ed.undo();h.active=h.b;}});
 const r=await d.call('undo',{...binding(h.a),steps:2});progress(r,0,false,'history_unconfirmed');assert.equal(r.structuredContent.unconfirmedOriginalTransition.steps,1);assert.deepEqual(h.targets,['A']);assert.deepEqual(view(h.b),b);
});
test('switch during the initial idle settle refuses before invoking any history callback',async()=>{
 const h=await setup(),a=view(h.a),b=view(h.b),pending=h.call('undo',{steps:2});h.active=h.b;
 progress(await pending,0,false,'document_changed');assert.deepEqual(view(h.a),a);assert.deepEqual(view(h.b),b);assert.deepEqual(h.targets,[]);
});
for(const kind of ['undo','redo'])test(kind+': switch before an awaited application mutation is refused at the engine guard',async()=>{
 const h=await setup();if(kind==='redo')progress(await h.call('undo'),1,true);h.targets=[];
 const a=view(h.a),b=view(h.b);let release,entered;const gate=new Promise(r=>release=r),ready=new Promise(r=>entered=r);
 h.before=async()=>{entered();await gate;};const pending=h.call(kind);await ready;h.active=h.b;release();
 progress(await pending,0,false,'document_changed');assert.deepEqual(view(h.a),a);assert.deepEqual(view(h.b),b);assert.deepEqual(h.targets,[]);
});
test('Redo switching after mutation reports A, never replacement B, and does not claim full completion',async()=>{
 const h=await setup();await h.call('undo');const b=view(h.b),state=binding(h.a);h.after=async()=>{h.active=h.b;};
 const r=await h.call('redo'),s=progress(r,1,false,'document_changed');assert.equal(s.documentId,state.documentId);assert.deepEqual(view(h.b),b);assert.equal(h.a.ed.changes.length,2);
});
test('wrong document and stale revision at entry leave both models and histories untouched',async()=>{
 const h=await setup(),a=view(h.a),b=view(h.b);
 for(const args of [{documentId:binding(h.b).documentId},{expectedRevision:binding(h.a).expectedRevision+1}])assert.equal((await h.call('undo',args)).isError,true);
 assert.deepEqual(view(h.a),a);assert.deepEqual(view(h.b),b);
});
test('an unrelated history edit after one own step stops the request without undoing that edit',async()=>{
 const h=await setup();h.after=async()=>{await edit(h.a,400);};
 progress(await h.call('undo',{steps:2}),1,false,'history_changed');assert.equal(h.a.ed.changes.length,2);assert.equal(h.a.ed.changes.at(-1).label,'Assistant: material_edit');assert.deepEqual(h.targets,['A']);
});
test('changing a lower history entry with unchanged count/top is detected',async()=>{
 const h=await setup(3);h.after=async()=>{h.a.ed.changes[0]={...h.a.ed.changes[0],label:'Person replacement'};};
 progress(await h.call('undo',{steps:2}),1,false,'history_changed');assert.equal(h.a.ed.changes.length,2);assert.deepEqual(h.targets,['A']);
});
test('busy at entry and immediately before an awaited mutation refuses without changes',async()=>{
 const h=await setup(),a=view(h.a);h.busy='person command';assert.equal((await h.call('undo')).isError,true);assert.deepEqual(view(h.a),a);
 h.busy=null;h.before=async()=>{h.busy='person command';};progress(await h.call('undo'),0,false,'busy');assert.deepEqual(view(h.a),a);
});
test('busy after one completed step reports partial progress and prevents the next step',async()=>{
 const h=await setup();h.after=async()=>{h.busy='person command';};progress(await h.call('undo',{steps:2}),1,false,'busy');assert.equal(h.a.ed.changes.length,1);assert.deepEqual(h.targets,['A']);
});
test('person-owned steps stay protected at entry and between steps; any:true remains explicit',async()=>{
 const h=await setup();h.a.ed.changes[0].label='Person edit';progress(await h.call('undo',{steps:2}),1,false,'person_owned');assert.equal(h.a.ed.changes.length,1);
 progress(await h.call('undo'),0,false,'person_owned');progress(await h.call('undo',{any:true}),1,true);
 progress(await h.call('redo'),0,false,'person_owned');progress(await h.call('redo',{any:true}),1,true);
});
test('the guarded callback rechecks ownership after an intervening await',async()=>{
 const h=await setup(),a=bytes(h.a);h.before=async()=>{h.a.ed.changes.at(-1).label='Person edit';};
 progress(await h.call('undo'),0,false,'history_changed');assert.deepEqual(bytes(h.a),a);assert.equal(h.a.ed.changes.length,2);
});
test('exhausted history explicitly reports requested versus completed steps',async()=>{
 const h=await setup(1),r=await h.call('undo',{steps:2});const s=progress(r,1,false,'history_empty');assert.equal(s.requestedSteps,2);assert.equal(h.a.ed.changes.length,0);
});
test('another pending Undo/Redo request is refused instead of sharing history ownership',async()=>{
 const h=await setup();let release,entered;const gate=new Promise(r=>release=r),ready=new Promise(r=>entered=r);
 h.before=async()=>{entered();await gate;};const pending=h.call('undo');await ready;assert.equal((await h.call('undo')).isError,true);release();progress(await pending,1,true);
});
test('switch while waiting for a real-style rebuild is detected before another history mutation',async()=>{
 const h=await setup(),b=view(h.b);h.after=async()=>{h.S.reloading=true;setTimeout(()=>{h.active=h.b;h.S.reloading=false;},5);};
 progress(await h.call('undo',{steps:2}),1,false,'document_changed');assert.deepEqual(view(h.b),b);assert.deepEqual(h.targets,['A']);
});
test('a post-mutation application error reports the completed step rather than claiming rollback',async()=>{
 const h=await setup();h.after=async()=>{throw new Error('UI rebuild failed');};
 const r=await h.call('undo',{steps:2});progress(r,1,false,'history_failed');assert.equal(r.structuredContent.stopped.message,'UI rebuild failed');assert.equal(h.a.ed.changes.length,1);assert.deepEqual(h.targets,['A']);
});
test('an unrelated Undo during a callback await is not credited to the refused request',async()=>{
 const h=await setup();h.before=async()=>{h.a.ed.undo();};
 progress(await h.call('undo'),0,false,'history_changed');assert.equal(h.a.ed.changes.length,1);assert.deepEqual(h.targets,[]);
});
