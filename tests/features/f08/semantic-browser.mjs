/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {start} from '../../../devshell/serve.mjs';
import {createLiveServer} from '../../tools/mcp/live-server.mjs';
import {initialized,tool} from '../mcp01/client.mjs';
import {semanticFixtures} from './semantic-fixtures.mjs';
import {semanticWorkflow,REQUIRED} from './semantic-workflow.mjs';
import {liveOwnership} from './semantic-live-ownership.mjs';
const out=path.resolve('.cc-test/f08-semantic-browser');fs.mkdirSync(out,{recursive:true});const info=await semanticFixtures(out);
const {chromium}=await import(pathToFileURL(path.resolve(process.env.F08_PLAYWRIGHT||'.cc-test/f08-deps/node_modules/playwright/index.mjs')));
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),checks:[],errors:[],console:[]};
const check=s=>{report.checks.push(s);console.log('PASS',s);};let app,browser,live;
try{
 app=await start({port:8040,host:'127.0.0.1',offline:true});browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
 const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1000}}),page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.stack||e.message));page.on('console',m=>{if(['warning','error'].includes(m.type()))report.console.push({type:m.type(),text:m.text()});});
 const settle=async()=>page.waitForFunction(()=>globalThis.bimcraftLive?.editor&&!bimcraftWorkspace.snapshot().busy&&(!globalThis.bimcraftPlan||(!bimcraftPlan.state.busy&&!bimcraftPlan.state.reloading&&!bimcraftPlan.state.queue.length)),null,{timeout:90000});
 const open=async file=>{await page.locator('[data-file]').setInputFiles(file);await settle();if(!await page.evaluate(()=>!!globalThis.bimcraftPlan)){await page.locator('[data-pb-plan]').first().dblclick();await settle();}};
 await page.goto('http://127.0.0.1:8040/?workspace=live',{waitUntil:'networkidle'});await open(info.file);
 await page.evaluate(async()=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');getHost({app:'bimcraft'}).control.configure({enabled:true,groups:['read','edit','save'],version:'0.7.0-mcp01.1'});});
 live=createLiveServer({port:0,forward:(message,session)=>page.evaluate(async({message,sid})=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');return getHost({app:'bimcraft'}).control.handle(message,sid);},{message,sid:session.id})});
 const connection=await live.start();let sid=null,seq=0;const trace=[];
 const client={async request(method,params={}){const r=await fetch(connection.url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+connection.token,...(sid?{'Mcp-Session-Id':sid}:{})},body:JSON.stringify({jsonrpc:'2.0',id:++seq,method,params})});assert.equal(r.status,200);sid=r.headers.get('mcp-session-id')||sid;return r.json();}};
 await initialized(client);const catalog=(await client.request('tools/list')).result.tools;for(const name of REQUIRED)assert.ok(catalog.some(t=>t.name===name),name);
 fs.writeFileSync(path.join(out,'catalog.json'),JSON.stringify(catalog,null,2));check('real Streamable HTTP initialization/discovery through live host.control');
 const call=async(name,args={},fails=false)=>{const result=await tool(client,name,args,fails);await settle();trace.push({name,args,result});return result;};
 const fingerprint=async p=>p.evaluate(async()=>{const e=bimcraftLive.editor,b=e.api.file(e.mid).save({timeStamp:'2026-10-26T12:00:00'}),h=await crypto.subtle.digest('SHA-256',b);return{sha256:[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join(''),changes:e.changes.map(c=>[c.kind,c.label]),undone:e.undone.map(c=>[c.kind,c.label])};});
 const otherContext=await browser.newContext(),other=await otherContext.newPage();await other.goto('http://127.0.0.1:8040/?workspace=live',{waitUntil:'networkidle'});await other.locator('[data-file]').setInputFiles(info.file);await other.waitForFunction(()=>globalThis.bimcraftLive?.editor&&!bimcraftWorkspace.snapshot().busy);const foreignBefore=await fingerprint(other);
 const result=await semanticWorkflow(call,info,check,{protectedSnapshot:()=>fingerprint(page)});
 const state=await call('model_describe');
 const args={documentId:state.documentId,expectedRevision:state.revision,wall:info.a,end:'a',patch:{allow:false}};
 const foreignId=await other.evaluate(async()=>{const {documentState}=await import('/assets/apps/bimcraft/dev/material-wall-agent.js');return documentState(bimcraftLive.editor).documentId;});assert.notEqual(foreignId,state.documentId);
 const before=await fingerprint(page);await call('wall_join_end_set',{...args,documentId:foreignId},true);assert.deepEqual(await fingerprint(page),before);assert.deepEqual(await fingerprint(other),foreignBefore);
 await page.evaluate(()=>{bimcraftPlan.state.chain={points:[[0,0]],guids:[]};});await call('wall_join_end_set',args,true);await page.evaluate(()=>{bimcraftPlan.state.chain=null;});
 await page.evaluate(async()=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');getHost({app:'bimcraft'}).control.configure({groups:['read']});});
 await call('wall_join_end_set',args,true);await call('model_save',{},true);await call('usd_export',{},true);
 await page.evaluate(async()=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');getHost({app:'bimcraft'}).control.configure({groups:['read','edit','save']});});
 assert.deepEqual(await fingerprint(page),before);check('identical projects/names in separate live editors, wrong token, busy and denied edit/save/export retain both projects');
 const download=page.waitForEvent('download'),saved=call('model_save');await(await download).saveAs(path.join(out,'saved.ifc'));assert.equal((await saved).saved,true);
 await page.screenshot({path:path.join(out,'semantic-tools.png')});await open(path.join(out,'saved.ifc'));const reopened=await call('model_describe');assert.notEqual(reopened.documentId,state.documentId);
 for(const r of result.readbacks){const actual=await call('wall_joins_get',{documentId:reopened.documentId,wall:r.wall});assert.deepEqual(actual.record,r.record);assert.deepEqual(actual.geometry,r.geometry);}
 await call('wall_join_end_set',args,true);assert.deepEqual(await fingerprint(other),foreignBefore);check('actual live MCP save/download/reopen preserves profiles/records and refuses old instance binding');
 report.ownership=await liveOwnership(page,call,info.file,info.a,settle,check);
 for(const n of info.negatives){
  await open(n.file);const s=await call('model_describe'),before=await fingerprint(page);
  const read=await call('wall_joins_get',{documentId:s.documentId,wall:n.wall},n.kind==='duplicate-id');
  if(n.kind==='legacy'){
   assert.equal(read.record.classification,'legacy');fs.writeFileSync(path.join(out,'legacy-before-private.ifc'),Buffer.from(await page.evaluate(()=>Array.from(bimcraftLive.editor.api.file(bimcraftLive.editor.mid).save({timeStamp:'2026-10-26T12:00:00'})))));await call('wall_join_end_set',{documentId:s.documentId,expectedRevision:s.revision,wall:n.wall,end:'a',patch:{allow:true}});
   const now=await call('model_describe');await call('undo',{documentId:now.documentId,expectedRevision:now.revision,steps:1});
   fs.writeFileSync(path.join(out,'legacy-after-private.ifc'),Buffer.from(await page.evaluate(()=>Array.from(bimcraftLive.editor.api.file(bimcraftLive.editor.mid).save({timeStamp:'2026-10-26T12:00:00'})))));
   // Native Undo restores identical entities but may restore deleted rows at the end of DATA.
   // Compare every STEP line, including IDs/values/multiplicity; only DATA row order is normalized.
   const canonical=buffer=>buffer.toString().replace(/DATA;\n([\s\S]*?)ENDSEC;/,(_,data)=>'DATA;\n'+data.trim().split('\n').sort((a,b)=>Number(a.match(/^#(\d+)/)?.[1]||0)-Number(b.match(/^#(\d+)/)?.[1]||0)).join('\n')+'\nENDSEC;');
   assert.equal(canonical(fs.readFileSync(path.join(out,'legacy-after-private.ifc'))),canonical(fs.readFileSync(path.join(out,'legacy-before-private.ifc'))));
  }else{
   if(!['duplicate-id','curve'].includes(n.kind))assert.equal(read.record.classification,n.kind);
   await call('wall_join_end_set',{documentId:s.documentId,expectedRevision:s.revision,wall:n.wall,end:'a',patch:{allow:false}},true);
   assert.deepEqual(await fingerprint(page),before);
  }
 }
 check('actual live transport corrupt/duplicate/future/ambiguous/curved refusals preserve bytes and histories; legacy migration Undo restores every STEP entity (DATA row order normalized)');
 fs.writeFileSync(path.join(out,'expected.json'),JSON.stringify(result));fs.writeFileSync(path.join(out,'trace-private.json'),JSON.stringify(trace));
 assert.deepEqual(report.errors,[]);report.catalogCount=catalog.length;report.requests=trace.length;report.status='PASS';
 // Console warnings remain verbatim evidence. The retained F08 browser workflow owns its separate strict console gate.
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks.length,requests:trace.length,warnings:report.console.length}));
}catch(e){fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({...report,error:e.stack},null,2));throw e;}
finally{await live?.close();await browser?.close();await new Promise(r=>{if(app){app.close(r);app.closeAllConnections?.();}else r();});}
