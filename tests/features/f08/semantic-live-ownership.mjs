/* SPDX-License-Identifier: Apache-2.0 */
// Native federated-project switching while the real MCP edit awaits its UI rebuild. No mutation/dispatcher mocks.
import assert from 'node:assert/strict';
const receipt = r => Object.fromEntries(['documentId','revision','wall','end','endId','changed','completedSteps','complete','code','affectedWalls','geometryChangedWalls','readback','undo','error'].filter(k=>k in r).map(k=>[k,r[k]]));
export async function liveOwnership(page,call,file,wall,settle,check){
 const a=await page.evaluate(()=>{window.__f08Original=bimcraftLive.editor;return bimcraftModels.list().find(m=>m.active).mi;});
 await page.locator('[data-model-input]').setInputFiles(file);await page.waitForFunction(()=>bimcraftModels.list().length===2&&!bimcraftWorkspace.snapshot().busy);
 const b=await page.evaluate(()=>bimcraftModels.list().find(m=>!m.active).mi);
 const activate=async mi=>{await page.evaluate(mi=>document.querySelector(`[data-model-active="${mi}"]`).click(),mi);await settle();};
 await activate(b);
 await page.evaluate(()=>{const e=bimcraftLive.editor;window.__f08Replacement={ed:e,bytes:e.api.file(e.mid).save({timeStamp:'2026-10-26T12:00:00'}),changes:[...e.changes],undone:[...e.undone]};});
 await activate(a);let state=await call('model_describe');const args={documentId:state.documentId,expectedRevision:state.revision,wall,end:'a',patch:{allow:false}};
 await page.evaluate(mi=>{
  const e=window.__f08Original;window.__f08Switch={armed:true,switched:false,count:e.changes.length};
  const attempt=()=>{const s=window.__f08Switch;if(!s.armed)return;
   if(e.changes.length===s.count+1&&!bimcraftPlan.state.reloading&&!bimcraftPlan.state.busy&&!bimcraftWorkspace.snapshot().busy){s.armed=false;observer.disconnect();document.querySelector(`[data-model-active="${mi}"]`).click();s.switched=true;}
  };
  const observer=new MutationObserver(()=>{attempt();queueMicrotask(attempt);});observer.observe(document.body,{subtree:true,childList:true,attributes:true});window.__f08SwitchObserver=observer;
 },b);
 try{
  const refused=await call('wall_join_end_set',args,true),r=refused.structuredContent;
  assert.equal(r.documentId,state.documentId);assert.equal(r.changed,true);assert.equal(r.completedSteps,1);assert.equal(r.code,'POST_COMMIT_INTERRUPTED');
  const proof=await page.evaluate(()=>{const b=window.__f08Replacement,e=b.ed,bytes=e.api.file(e.mid).save({timeStamp:'2026-10-26T12:00:00'});return{switched:window.__f08Switch.switched,replacementActive:bimcraftLive.editor===e,bytesUnchanged:bytes.length===b.bytes.length&&bytes.every((v,i)=>v===b.bytes[i]),historyUnchanged:e.changes.length===b.changes.length&&e.changes.every((v,i)=>v===b.changes[i])&&e.undone.length===b.undone.length&&e.undone.every((v,i)=>v===b.undone[i])};});
  assert.deepEqual(proof,{switched:true,replacementActive:true,bytesUnchanged:true,historyUnchanged:true});
  await activate(a);state=await call('model_describe');await call('undo',{documentId:state.documentId,expectedRevision:state.revision,steps:1});
  const restored=await call('wall_joins_get',{documentId:state.documentId,wall});assert.equal(restored.ends.a.allow,true);
  check('native project switch during semantic edit reports completed original mutation; replacement bytes/both histories unchanged; original Undo works');
  return{status:'PASS',receipt:receipt(r),proof,mockedDispatcher:false,mockedMutation:false};
 }finally{await page.evaluate(()=>{if(window.__f08Switch)window.__f08Switch.armed=false;window.__f08SwitchObserver?.disconnect();});}
}

// Replace the entire project through the existing live-open entrypoint while an edit awaits rebuilding.
export async function liveFileClose(page,call,bytes,wall,settle,check){
 const state=await call('model_describe');
 await page.evaluate(({bytes})=>{
  const e=bimcraftLive.editor;window.__f08Close={ed:e,count:e.changes.length,armed:true,opened:false};
  const attempt=()=>{const s=window.__f08Close;if(!s.armed)return;
   if(e.changes.length===s.count+1&&!bimcraftPlan.state.reloading&&!bimcraftPlan.state.busy&&!bimcraftWorkspace.snapshot().busy){
    s.armed=false;observer.disconnect();s.midAtOpen=e.mid;s.apiAtOpen=e.api;void bimcraftLive.open(new Uint8Array(bytes),'original.ifc');s.opened=true;
   }
  };
  const observer=new MutationObserver(()=>{attempt();queueMicrotask(attempt);});observer.observe(document.body,{subtree:true,childList:true,attributes:true});window.__f08CloseObserver=observer;
 },{bytes});
 try{
  const result=await call('wall_join_end_set',{documentId:state.documentId,expectedRevision:state.revision,wall,end:'a',patch:{allow:false}},true),r=result.structuredContent;
  assert.equal(r.documentId,state.documentId);assert.equal(r.changed,true);assert.equal(r.completedSteps,1);assert.equal(r.readback.phase,'synchronous-commit');assert.equal(r.readback.originalDocumentReadable,false);assert.equal(r.undo.available,false);
  await settle();const replacement=await call('model_describe');assert.notEqual(replacement.documentId,state.documentId);
  const untouched=await call('wall_joins_get',{documentId:replacement.documentId,wall});assert.equal(untouched.ends.a.allow,true);
  const proof=await page.evaluate(()=>{const s=window.__f08Close;let closed=false;try{s.apiAtOpen.file(s.midAtOpen).save();}catch{closed=true;}return{existingLiveOpenInvoked:s.opened,originalIfcClosed:closed,replacementHistorySteps:bimcraftLive.editor.changes.length};});
  assert.deepEqual(proof,{existingLiveOpenInvoked:true,originalIfcClosed:true,replacementHistorySteps:0});
  check('existing full-project live open closes original IFC yet preserves confirmed mutation progress; captured readback is labeled and replacement remains untouched');
  return{status:'PASS',receipt:receipt(r),proof,mockedDispatcher:false,mockedMutation:false};
 }finally{await page.evaluate(()=>{if(window.__f08Close)window.__f08Close.armed=false;window.__f08CloseObserver?.disconnect();});}
}
