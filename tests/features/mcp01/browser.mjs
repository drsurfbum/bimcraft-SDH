/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { start } from '../../../devshell/serve.mjs';
import { createLiveServer } from '../../tools/mcp/live-server.mjs';
import { workflow, REQUIRED } from './workflow.mjs';
import {compatibilityCalls} from './compatibility-calls.mjs';
import { initialized, tool } from './client.mjs';
import {historyBrowser} from './history-browser.mjs';
const {chromium}=await import(pathToFileURL(path.resolve(process.env.MCP01_PLAYWRIGHT||'.cc-test/mcp01-deps/node_modules/playwright/index.mjs')));
const out=path.resolve('.cc-test/mcp01-browser');fs.mkdirSync(out,{recursive:true});
const report={checks:[],errors:[],head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),platform:os.platform(),node:process.version,skips:[]};
const check=label=>{report.checks.push(label);console.log('PASS',label);};
let app,browser,live;
try {
 app=await start({port:8046,host:'127.0.0.1',offline:true});
 browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
 const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(30000);page.on('pageerror',e=>report.errors.push(e.stack||e.message));
 const settle=async()=>page.waitForFunction(()=>globalThis.bimcraftLive?.editor&&globalThis.bimcraftWorkspace?.snapshot().document&&!bimcraftWorkspace.snapshot().busy&&(!globalThis.bimcraftPlan||(!bimcraftPlan.state.busy&&!bimcraftPlan.state.reloading&&!bimcraftPlan.state.queue.length)),null,{timeout:90000});
 async function open(file){console.log('STAGE opening '+path.basename(file));await page.locator('[data-file]').setInputFiles(file);console.log('STAGE file input set');await settle();if(!await page.evaluate(()=>!!globalThis.bimcraftPlan)) {await page.locator('[data-pb-plan]').first().dblclick();await settle();}console.log('STAGE model settled');}
 console.log('STAGE app listening, browser launched');
 await page.goto('http://127.0.0.1:8046/?workspace=live',{waitUntil:'networkidle'});await open(path.resolve('fixtures/f04/layered-plans.ifc'));
 // Only this fresh test browser is enabled. No user client, credentials or persisted preferences are changed.
 await page.evaluate(async()=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');getHost({app:'bimcraft'}).control.configure({enabled:true,groups:['read','edit','save'],version:'0.7.0-mcp01.1'});});
 live=createLiveServer({port:0,forward:(message,session)=>page.evaluate(async({message,sid})=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');return getHost({app:'bimcraft'}).control.handle(message,sid);},{message,sid:session.id})});
 const connection=await live.start();let sessionId=null,seq=0;
 const client={async request(method,params={}){
  const response=await fetch(connection.url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+connection.token,...(sessionId?{'Mcp-Session-Id':sessionId}:{})},body:JSON.stringify({jsonrpc:'2.0',id:++seq,method,params})});
  assert.equal(response.status,200);sessionId=response.headers.get('mcp-session-id')||sessionId;return response.json();
 }};
 console.log('STAGE model opened, HTTP bridge listening');
 await initialized(client);const catalog=(await client.request('tools/list')).result.tools;for(const name of REQUIRED)assert.ok(catalog.some(t=>t.name===name));
 fs.writeFileSync(path.join(out,'catalog.json'),JSON.stringify(catalog,null,2)+'\n');
 check('actual Streamable HTTP initialize/list/call to real browser host.control registration');
 const before=await page.evaluate(async()=>{const [{readWallDimensions,resolveDimension},{ModelWriter},{readWalls}]=await Promise.all(['wall-dimensions.js','model-write.js','model-walls.js'].map(f=>import('/assets/apps/bimcraft/dev/'+f)));const ed=bimcraftLive.editor,w=new ModelWriter(ed.W,ed.api,ed.mid),walls=readWalls(w);return readWallDimensions(w).map(d=>({guid:d.guid,refs:d.refs,resolved:resolveDimension(d,walls)}));});
 const other=await context.newPage();await other.goto('http://127.0.0.1:8046/?workspace=live',{waitUntil:'networkidle'});await other.locator('[data-file]').setInputFiles(path.resolve('fixtures/f04/layered-plans.ifc'));await other.waitForFunction(()=>bimcraftLive?.editor&&bimcraftWorkspace.snapshot().document&&!bimcraftWorkspace.snapshot().busy);
 const otherBytes=await other.evaluate(()=>Array.from(bimcraftLive.editor.save()));
 const call=async(name,args={},fails=false)=>{const r=await tool(client,name,args,fails);await settle();return r;};
 await compatibilityCalls(call,check);
 const result=await workflow(call,check);
 for(const unit of ['ftin','in','ftdec','mm','cm','m']) {await page.locator('[data-model-units]').selectOption(unit);await settle();assert.deepEqual((await call('walls_list')).walls,result.walls);}
 check('six display-unit modes leave exact machine-readable mm values unchanged');
 // Person-owned history boundaries remain protected. This is an ordinary UI Name edit, not another model store.
 const ownership=await page.evaluate(()=>{const e=bimcraftLive.editor,c=e.changes.at(-1);const label=c.label;c.label='Person change';return label;});
 await call('undo',{},true);await page.evaluate(label=>{bimcraftLive.editor.changes.at(-1).label=label;},ownership);
 check('live undo refuses a person-owned history step');
 const s=await call('model_describe'),editArgs={documentId:s.documentId,expectedRevision:s.revision,id:'material-mcp01',changes:{defaultThickness:400}};
 await page.evaluate(()=>{bimcraftPlan.state.chain={points:[[0,0]],guids:[]};});await call('material_edit',editArgs,true);await page.evaluate(()=>{bimcraftPlan.state.chain=null;});
 await page.evaluate(async()=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');getHost({app:'bimcraft'}).control.configure({groups:['read']});});
 await call('material_edit',editArgs,true);await call('element_set',{guid:result.walls[0].guid,attribute:'Name',value:'denied'},true);await call('model_save',{},true);
 await page.evaluate(async()=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');getHost({app:'bimcraft'}).control.configure({groups:['read','edit','save']});});
 assert.deepEqual((await call('walls_list')).walls,result.walls);check('live busy drawing and denied edit/save permissions refuse without partial changes');
 const download=page.waitForEvent('download');const save=call('model_save');await(await download).saveAs(path.join(out,'saved.ifc'));assert.equal((await save).saved,true);
 await page.screenshot({path:path.join(out,'agent-result.png')});
 const dims=await page.evaluate(async()=>{const [{readWallDimensions,resolveDimension},{ModelWriter},{readWalls}]=await Promise.all(['wall-dimensions.js','model-write.js','model-walls.js'].map(f=>import('/assets/apps/bimcraft/dev/'+f)));const e=bimcraftLive.editor,w=new ModelWriter(e.W,e.api,e.mid),walls=readWalls(w);return readWallDimensions(w).map(d=>({guid:d.guid,refs:d.refs,resolved:resolveDimension(d,walls)}));});
 assert.deepEqual(dims.map(d=>[d.guid,d.refs]),before.map(d=>[d.guid,d.refs]));for(let i=0;i<dims.length;i++)assert.ok(Math.abs(dims[i].resolved.value-before[i].resolved.value)<.005);
 const normalize=bytes=>new TextDecoder().decode(new Uint8Array(bytes)).replace(/FILE_NAME\([^;]+;/,'HEADER_TIMESTAMP');
 assert.equal(normalize(await other.evaluate(()=>Array.from(bimcraftLive.editor.save()))),normalize(otherBytes));
 check('dimension references/values and separately open original remain unchanged');
 await open(path.join(out,'saved.ifc'));const again=await call('walls_list');assert.deepEqual(again.walls,result.walls);
 assert.notEqual((await call('model_describe')).documentId,result.documentId);await call('walls_edit',{documentId:result.documentId,expectedRevision:result.revision,walls:[result.walls[0].guid],changes:{height:2500}},true);
 check('actual browser download reopens exactly and old document tokens are refused');
 fs.writeFileSync(path.join(out,'expected.json'),JSON.stringify({...result,dims},null,2)+'\n');
 report.historyRegression=await historyBrowser(context,out,check);
 assert.deepEqual(report.errors,[]);report.status='PASS';report.catalogCount=catalog.length;
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:'PASS',checks:report.checks.length,browser:report.browser}));
} catch(e) { console.error(e); report.failure=String(e.stack||e);fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify(report,null,2));throw e;
} finally {await live?.close();await browser?.close();await new Promise(resolve=>{if(app){app.close(resolve);app.closeAllConnections?.();}else resolve();});}
