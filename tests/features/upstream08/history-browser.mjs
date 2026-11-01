/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {start} from '../../../devshell/serve.mjs';
const {chromium}=await import(pathToFileURL(path.resolve(process.env.UP08_PLAYWRIGHT||'.cc-test/browser-current/node_modules/playwright/index.mjs')));
const report={checks:[],errors:[]},out='.cc-test/upstream08';let server,browser;
try {
 server=await start({port:8072,host:'127.0.0.1',offline:true});browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 const settle=()=>page.waitForFunction(()=>globalThis.bimcraftLive?.editor&&!bimcraftWorkspace.snapshot().busy&&!globalThis.bimcraftPlan?.state.reloading&&!globalThis.bimcraftPlan?.state.busy,null,{timeout:90000});
 await page.goto('http://127.0.0.1:8072/?workspace=live',{waitUntil:'networkidle'});await page.locator('[data-file]').setInputFiles(path.resolve('fixtures/f04/layered-plans.ifc'));await settle();await page.locator('[data-pb-plan]').first().dblclick();await settle();
 const a=await page.evaluate(()=>bimcraftModels.list().find(m=>m.active).mi);
 await page.locator('[data-model-input]').setInputFiles(path.resolve('fixtures/f04/layered-plans.ifc'));await page.waitForFunction(()=>bimcraftModels.list().length===2&&!bimcraftWorkspace.snapshot().busy);
 const b=await page.evaluate(a=>bimcraftModels.list().find(m=>m.mi!==a).mi,a);
 const activate=async mi=>{await page.locator(`[data-model-active="${mi}"]`).evaluate(el=>el.click());await settle();};
 const edit=async value=>{await page.evaluate(async value=>{const [{getHost},{modelTools}]=await Promise.all(['host.js','agents.js'].map(f=>import('/assets/apps/bimcraft/dev/'+f)));const c=getHost({app:'bimcraft'}).control;c.configure({enabled:true,groups:['read','edit']});const r=await c.handle({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'element_set',arguments:{guid:((await import('/assets/apps/bimcraft/dev/model-ops.js')).snapshotModel(bimcraftLive.editor)).walls[0].guid,attribute:'Name',value}}},'integration-test');if(r.result?.isError||r.error)throw Error(JSON.stringify(r));},value);await settle();};
 await activate(b);await edit('B edit');await page.evaluate(()=>{window.__up08B=bimcraftLive.editor;});
 await activate(a);await edit('A edit');const before=await page.evaluate(()=>{window.__up08A=bimcraftLive.editor;const snapshot=e=>({bytes:Array.from(e.api.file(e.mid).save({timeStamp:'2026-11-01T00:00:00'})),changes:e.changes.length});return {a:snapshot(__up08A),b:snapshot(__up08B),probe:ccUndoReporter.onMessage('undo.probe')};});
 assert.equal(before.a.changes,before.b.changes);assert.ok(before.probe.step);
 await activate(b);const result=await page.evaluate(step=>{const refused=ccUndoReporter.onMessage('undo.run',{step});const snapshot=e=>({bytes:Array.from(e.api.file(e.mid).save({timeStamp:'2026-11-01T00:00:00'})),changes:e.changes.length});return {refused,probe:ccUndoReporter.onMessage('undo.probe'),a:snapshot(__up08A),b:snapshot(__up08B)};},before.probe.step);
 assert.equal(result.refused.ok,false);assert.equal(result.probe.step,'');assert.deepEqual(result.a,before.a);assert.deepEqual(result.b,before.b);report.checks.push('Native equal-depth project switch refuses prior Studio token; both actual IFC byte arrays and histories unchanged');
 await edit('B second edit');const current=await page.evaluate(()=>ccUndoReporter.onMessage('undo.probe'));assert.ok(current.step);const undo=await page.evaluate(step=>ccUndoReporter.onMessage('undo.run',{step}),current.step);assert.equal(undo.ok,true);await settle();report.checks.push('Newly observed B step supports ordinary Studio Undo after refusal');
 assert.deepEqual(report.errors,[]);report.status='PASS';await page.screenshot({path:out+'/equal-depth-switch.png'});
} catch(e){report.status='FAIL';report.error=e.stack;process.exitCode=1;}finally{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/history-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser?.close();if(server)await new Promise(r=>{server.close(r);server.closeAllConnections?.();});}
