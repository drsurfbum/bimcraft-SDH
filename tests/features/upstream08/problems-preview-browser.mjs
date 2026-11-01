/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {start} from '../../../devshell/serve.mjs';
const {chromium}=await import(pathToFileURL(path.resolve(process.env.UP08_PLAYWRIGHT||'.cc-test/browser-current/node_modules/playwright/index.mjs')));
const modifier=process.platform==='darwin'?'Meta':'Control';
const out='.cc-test/upstream08',report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),checks:[],errors:[]};let server,browser;
try{
 server=await start({port:0,host:'127.0.0.1',offline:true});browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true}),page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});
 await page.goto(`http://127.0.0.1:${server.address().port}/?workspace=live`,{waitUntil:'networkidle'});
 await page.locator('[data-file]').setInputFiles(path.resolve('fixtures/f04/layered-plans.ifc'));
 const settle=()=>page.waitForFunction(()=>globalThis.bimcraftLive?.editor&&!bimcraftWorkspace.snapshot().busy&&!globalThis.bimcraftPlan?.state.reloading&&!globalThis.bimcraftPlan?.state.busy,null,{timeout:90000});await settle();
 await page.waitForFunction(()=>globalThis.ccProblems?.store.sources().some(x=>x.id==='bimcraft.checks'));
 assert.equal(await page.locator('[data-problems-open]').count(),1);
 await page.keyboard.press(`${modifier}+Shift+m`);await page.locator('[data-problems-panel]').waitFor({state:'visible'});
 const data=await page.evaluate(async()=>{
  const base='/assets/apps/bimcraft/dev/',{getHost}=await import(base+'host.js'),{snapshotModel}=await import(base+'model-ops.js');
  const c=getHost({app:'bimcraft'}).control;c.configure({enabled:true,groups:['read','edit']});
  window.__up08Call=async(name,args)=>{const r=await c.handle({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}},'up08-browser');if(r.error||r.result?.isError)throw Error(JSON.stringify(r));return r.result.structuredContent;};
  const e=bimcraftLive.editor,guid=snapshotModel(e).walls[0].guid;
  ccProblems.source({id:'integration.fixture',kind:'check',label:'Integration fixture'}).set([{code:'test.warning',severity:'warning',text:'Fixture warning: verify retained acceptance.',about:[{kind:'element',id:guid,label:'Wall'}]}]);
  return {guid,sources:ccProblems.store.sources().map(x=>x.id),catalog:(await c.handle({jsonrpc:'2.0',id:2,method:'tools/list',params:{}},'up08-browser')).result.tools.map(t=>t.name)};
 });
 for(const name of ['problems_list','problems_show','problems_fix','problems_accept','problems_unaccept','problems_report'])assert.ok(data.catalog.includes(name),name);
 report.checks.push('Real Problems shell loads once, mounts actual BimCraft sources and registers all six assistant tools');
 const row=page.locator('[data-problem]').filter({hasText:'Fixture warning'});await row.locator('[data-problem-accept]').click();await row.locator('[data-problem-name]').fill('Integration test');await row.locator('[data-problem-reason]').fill('Fixture reviewed');await row.locator('[data-problem-accept-ok]').click();
 await page.waitForFunction(()=>ccProblems.store.accepted().length===1);await settle();
 const saved=await page.evaluate(()=>Array.from(bimcraftLive.editor.api.SaveModel(bimcraftLive.editor.mid)));fs.writeFileSync(out+'/problems-accepted.ifc',new Uint8Array(saved));
 assert.ok(new TextDecoder().decode(new Uint8Array(saved)).includes('CadCraft_Problems'));
 await page.locator('[data-act="undo"]').first().evaluate(el=>el.click());await settle();await page.waitForFunction(()=>ccProblems.store.accepted().length===0);
 await page.locator('[data-act="redo"]').first().evaluate(el=>el.click());await settle();await page.waitForFunction(()=>ccProblems.store.accepted().length===1);
 report.checks.push('Native acceptance persists to IFC, participates in human Undo/Redo and reloads the accepted record');
 await page.locator('[data-problems-close]').click();
 const preview=await page.evaluate(async guid=>{
  const e=bimcraftLive.editor,snapshot=()=>JSON.stringify({bytes:Array.from(e.api.file(e.mid).save({timeStamp:'2026-11-01T00:00:00'})),changes:e.changes.map(x=>x.label),redo:e.undone.map(x=>x.label)});
  const before=snapshot();const result=await __up08Call('element_set',{guid,attribute:'Name',value:'Preview without mutation',preview:true});return {before,after:snapshot(),result};
 },data.guid);assert.equal(preview.before,preview.after);assert.equal(preview.result.preview,true);assert.equal(preview.result.applied,false);
 report.checks.push('Real live host preview returns a detached result without mutating IFC, Undo or Redo');
 await page.keyboard.press(`${modifier}+Shift+m`);await page.locator('[data-problems-accepted]').check();
 const download=page.waitForEvent('download');await page.locator('[data-problems-pdf]').click();await(await download).saveAs(out+'/problems-report.pdf');
 assert.ok(fs.readFileSync(out+'/problems-report.pdf').subarray(0,5).equals(Buffer.from('%PDF-')));
 await page.screenshot({path:out+'/problems-panel.png'});
 report.checks.push('Native Problems report downloads a real PDF with the accepted finding');
 assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack;process.exitCode=1;}finally{fs.writeFileSync(out+'/problems-preview-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser?.close();if(server)await new Promise(r=>{server.close(r);server.closeAllConnections?.();});}
