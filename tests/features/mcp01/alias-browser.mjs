/* SPDX-License-Identifier: Apache-2.0 */
import path from 'node:path';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {protectedAliasFixture} from './negative-fixtures.mjs';
import {createLiveServer} from '../../tools/mcp/live-server.mjs';
import {initialized,tool} from './client.mjs';
export async function aliasBrowser(context,out,check) {
 const alias=await protectedAliasFixture(out),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let server;
 try {
  await page.goto('http://127.0.0.1:8046/?workspace=live',{waitUntil:'networkidle'});await page.locator('[data-file]').setInputFiles(alias.file);
  await page.waitForFunction(()=>globalThis.bimcraftLive?.editor&&!bimcraftWorkspace.snapshot().busy&&!globalThis.bimcraftPlan?.state.reloading);
  await page.evaluate(async()=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');getHost({app:'bimcraft'}).control.configure({enabled:true,groups:['read','edit'],version:'0.7.0-mcp01.1'});});
  server=createLiveServer({port:0,forward:(message,session)=>page.evaluate(async({message,sid})=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');return getHost({app:'bimcraft'}).control.handle(message,sid);},{message,sid:session.id})});
  const connection=await server.start();let sid,seq=0;
  const client={async request(method,params={}){const r=await fetch(connection.url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+connection.token,...(sid?{'Mcp-Session-Id':sid}:{})},body:JSON.stringify({jsonrpc:'2.0',id:++seq,method,params})});assert.equal(r.status,200);sid=r.headers.get('mcp-session-id')||sid;return r.json();}};
  await initialized(client);const state=await tool(client,'model_describe');
  const fingerprint=()=>page.evaluate(async()=>{const e=bimcraftLive.editor,bytes=e.api.file(e.mid).save({timeStamp:'2026-10-26T12:00:00'}),hash=await crypto.subtle.digest('SHA-256',bytes);return{sha256:Array.from(new Uint8Array(hash),x=>x.toString(16).padStart(2,'0')).join(''),changes:e.changes.map(c=>[c.kind,c.label]),undone:e.undone.map(c=>[c.kind,c.label])};});
  const before=await fingerprint();
  const error=await tool(client,'element_set',{documentId:state.documentId,expectedRevision:state.revision,guid:alias.guid,set:'OrdinaryAlias',property:'Height',value:9999},true);
  assert.match(error.content.map(c=>c.text||'').join(' '),/protected model record/);assert.deepEqual(await fingerprint(),before);assert.deepEqual(errors,[]);
  const report={status:'PASS',transport:'real HTTP to live host.control',resolvedAlias:true,protectedOwnerRefusal:true,bytesAndBothHistoryStacksUnchanged:true,errors};
  fs.writeFileSync(path.join(out,'alias-regression.json'),JSON.stringify(report,null,2)+'\n');check('live HTTP shared-property alias resolves its target and refuses protected ownership with unchanged bytes/history');return report;
 } finally {await server?.close();await page.close();}
}
