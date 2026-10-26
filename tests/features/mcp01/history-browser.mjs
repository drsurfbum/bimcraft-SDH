/* SPDX-License-Identifier: Apache-2.0 */
// Real HTTP MCP → real installer → actual app Undo/Redo, with a native active-model radio switch during rebuilding.
// No dispatcher/Undo replacement, paused engine, disabled switching or production test hook.
import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createLiveServer} from '../../tools/mcp/live-server.mjs';
import {initialized,tool} from './client.mjs';
export async function historyBrowser(context, out, check) {
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));let server;
 const report={transport:'existing token-protected Streamable HTTP → browser host.control',switch:'native active-model radio after the first rebuild settles, before the pending request continues',mockedDispatcher:false,mockedHistoryMutation:false};
 const settle=()=>page.waitForFunction(()=>bimcraftLive?.editor&&!bimcraftWorkspace.snapshot().busy&&!bimcraftPlan?.state.reloading&&!bimcraftPlan?.state.busy,null,{timeout:90000});
 try {
  await page.goto('http://127.0.0.1:8046/?workspace=live',{waitUntil:'networkidle'});
  await page.locator('[data-file]').setInputFiles(path.resolve('fixtures/f04/layered-plans.ifc'));
  await page.waitForFunction(()=>globalThis.bimcraftLive?.editor&&!bimcraftWorkspace.snapshot().busy);
  await page.locator('[data-pb-plan]').first().dblclick();await settle();
  const a=await page.evaluate(()=>{window.__mcpHistoryA=bimcraftLive.editor;return bimcraftModels.list().find(m=>m.active).mi;});
  // Add a second actual IFC using the existing federated-model file input, then the normal native model radio.
  await page.locator('[data-model-input]').setInputFiles(path.resolve('fixtures/f04/layered-plans.ifc'));
  await page.waitForFunction(()=>bimcraftModels.list().length===2&&!bimcraftWorkspace.snapshot().busy);
  const b=await page.evaluate(()=>bimcraftModels.list().find(m=>!m.active).mi);
  const activate=async mi=>{await page.evaluate(mi=>document.querySelector(`[data-model-active="${mi}"]`).click(),mi);await settle();};
  await page.evaluate(async()=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');getHost({app:'bimcraft'}).control.configure({enabled:true,groups:['read','edit','save'],version:'0.7.0-mcp01.1'});});
  server=createLiveServer({port:0,forward:(message,session)=>page.evaluate(async({message,sid})=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');return getHost({app:'bimcraft'}).control.handle(message,sid);},{message,sid:session.id})});
  const connection=await server.start();let sid,seq=0;
  const client={async request(method,params={}){const r=await fetch(connection.url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+connection.token,...(sid?{'Mcp-Session-Id':sid}:{})},body:JSON.stringify({jsonrpc:'2.0',id:++seq,method,params})});assert.equal(r.status,200);sid=r.headers.get('mcp-session-id')||sid;return r.json();}};
  await initialized(client);
  const call=async(name,args={},fails=false)=>{const r=await tool(client,name,args,fails);await settle();return r;};
  const edit=async width=>{const s=await call('model_describe');return call('material_edit',{documentId:s.documentId,expectedRevision:s.revision,id:'material-studs',changes:{defaultThickness:width}});};
  await activate(b);await edit(350.123456);
  await page.evaluate(()=>{const ed=bimcraftLive.editor;window.__mcpHistoryB={ed,bytes:ed.api.file(ed.mid).save({timeStamp:'2026-10-24T12:00:00'}),changes:[...ed.changes],undone:[...ed.undone]};});
  await activate(a);await edit(250.123456);await edit(251.123456);
  let s=await call('model_describe');const normal=await call('undo',{documentId:s.documentId,expectedRevision:s.revision,steps:2});
  assert.equal(normal.complete,true);assert.equal(normal.completedSteps,2);
  for(let i=0;i<2;i++){s=await call('model_describe');assert.equal((await call('redo',{documentId:s.documentId,expectedRevision:s.revision})).complete,true);}
  check('live HTTP same-project two-step Undo and subsequent Redo preserve normal history');
  s=await call('model_describe');report.requestedDocument=s.documentId;
  await page.evaluate(mi=>{
   window.__mcpUndoSwitch={armed:true,switched:false,observedSteps:null,uiIdle:false};
   const observer=new MutationObserver(()=>{const state=window.__mcpUndoSwitch;if(!state.armed)return;
    if(window.__mcpHistoryA.changes.length===1&&Number.isInteger(window.__mcpHistoryA.mid)&&Number.isInteger(window.__mcpHistoryB.ed.mid)&&!bimcraftPlan.state.reloading&&!bimcraftPlan.state.busy&&!bimcraftWorkspace.snapshot().busy){
     state.observedSteps=1;state.uiIdle=true;state.armed=false;observer.disconnect();document.querySelector(`[data-model-active="${mi}"]`).click();state.switched=true;
    }
   });observer.observe(document.body,{subtree:true,childList:true,attributes:true});window.__mcpUndoObserver=observer;
  },b);
  const refused=await call('undo',{documentId:s.documentId,expectedRevision:s.revision,steps:2},true);
  const result=refused.structuredContent;assert.equal(result.documentId,s.documentId);assert.equal(result.stopped.code,'document_changed');assert.equal(result.completedSteps,1);assert.equal(result.requestedSteps,2);assert.equal(result.complete,false);assert.equal(result.undone.length,1);
  const proof=await page.evaluate(()=>{
   const b=window.__mcpHistoryB,bytes=b.ed.api.file(b.ed.mid).save({timeStamp:'2026-10-24T12:00:00'});
   return{switch:window.__mcpUndoSwitch,AChanges:window.__mcpHistoryA.changes.length,BChanges:b.ed.changes.length,BBytesUnchanged:bytes.length===b.bytes.length&&bytes.every((x,i)=>x===b.bytes[i]),BHistoryUnchanged:b.ed.changes.length===b.changes.length&&b.ed.changes.every((x,i)=>x===b.changes[i])&&b.ed.undone.length===b.undone.length&&b.ed.undone.every((x,i)=>x===b.undone[i]),replacementIsActive:bimcraftLive.editor===b.ed};
  });
  assert.equal(proof.switch.switched,true);assert.equal(proof.switch.uiIdle,true);assert.equal(proof.switch.observedSteps,1);assert.equal(proof.AChanges,1);assert.equal(proof.BChanges,1);assert.equal(proof.BBytesUnchanged,true);assert.equal(proof.BHistoryUnchanged,true);assert.equal(proof.replacementIsActive,true);
  check('live HTTP project switch after one Undo leaves replacement IFC bytes and history unchanged; partial progress is explicit');
  await page.screenshot({path:path.join(out,'history-document-switch.png')});
  await activate(a);s=await call('model_describe');assert.equal((await call('redo',{documentId:s.documentId,expectedRevision:s.revision})).complete,true);
  check('live normal Redo still works on the original project after the interrupted request');
  assert.deepEqual(errors,[]);Object.assign(report,{status:'PASS',normalSameProject:normal,switchResult:result,proof,errors});
  fs.writeFileSync(path.join(out,'history-regression.json'),JSON.stringify(report,null,2)+'\n');return report;
 } finally {await page.evaluate(()=>{if(window.__mcpUndoSwitch)window.__mcpUndoSwitch.armed=false;window.__mcpUndoObserver?.disconnect();}).catch(()=>{});await server?.close();await page.close();}
}
