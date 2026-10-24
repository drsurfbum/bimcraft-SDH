/* SPDX-License-Identifier: Apache-2.0 */
// Rebase compatibility: real six-unit controls, retained model values and fallback ownership.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {start} from '../../../devshell/serve.mjs';
const out=path.resolve('.cc-test/upstream-browser');fs.mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL(path.resolve(process.env.REBASE_PLAYWRIGHT||'.cc-test/f28-browser-deps/node_modules/playwright/index.mjs')));
const port=Number(process.env.REBASE_PORT||8053),report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),checks:[],errors:[],console:[]};
let server,browser,page;
const check=name=>{report.checks.push(name);console.log('PASS',name);};
const settle=async()=>{await page.waitForFunction(()=>globalThis.bimcraftWorkspace?.snapshot().document&&!bimcraftWorkspace.snapshot().busy&&(!globalThis.bimcraftPlan||!bimcraftPlan.state.queue.length));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
const records=()=>page.evaluate(async()=>{const pre='/assets/apps/bimcraft/dev/',e=bimcraftLive.editor,[{ModelWriter},{readWalls},{readAssemblies},{readMaterials},{readWallDimensions}]=await Promise.all(['model-write.js','model-walls.js','wall-assemblies.js','project-materials.js','wall-dimensions.js'].map(f=>import(pre+f))),w=new ModelWriter(e.W,e.api,e.mid);return{walls:readWalls(w),assemblies:readAssemblies(w),materials:readMaterials(w),dimensions:readWallDimensions(w)};});
try{
 server=await start({port,host:'127.0.0.1',offline:true});browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});await ctx.addInitScript(()=>{if(!localStorage.getItem('bimcraft.model.units'))localStorage.setItem('bimcraft.model.units','mm');});page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.stack||e.message));page.on('console',m=>{if(['warning','error'].includes(m.type()))report.console.push({type:m.type(),text:m.text()});});
 async function open(){await page.goto(`http://127.0.0.1:${port}/?workspace=live&space=paper`,{waitUntil:'networkidle'});await page.locator('[data-file]').setInputFiles(path.resolve('fixtures/f04/layered-plans.ifc'));await settle();const b=page.locator('[data-pb-plan]').first();await b.focus();await b.press('Enter');await settle();}
 await open();const before=await records();
 const cases=[['ftin',"10'",3048],['in','120',3048],['ftdec','10',3048],['mm','3048',3048],['cm','304.8',3048],['m','3.048',3048]];
 assert.deepEqual(await page.locator('[data-model-units] option').evaluateAll(xs=>xs.map(x=>x.value)),cases.map(x=>x[0]));check('all six upstream unit choices are present in the live workspace');
 for(const [unit,input,mm]of cases){
  await page.locator('[data-model-units]').selectOption(unit);await settle();
  assert.equal(await page.evaluate(()=>bimcraftPlan.state.units),unit);assert.equal(await page.evaluate(async()=> (await import('/assets/apps/bimcraft/dev/model-units.js')).getDisplayUnits()),unit);
  await page.locator('.ws-ribbon [data-ws-command="wall"]').click();await page.locator('[data-model-walltop]').selectOption('fixed');await page.locator('[data-model-wallh]').fill(input);await page.locator('[data-model-wallh]').press('Tab');assert.ok(Math.abs(await page.evaluate(()=>bimcraftPlan.state.wall.height)-mm)<.005);
  await page.keyboard.press('Escape');await settle();assert.deepEqual(await records(),before);check(unit+': shared display state and typed height retain raw IFC records');
  await open();assert.equal(await page.locator('[data-model-units]').inputValue(),unit);assert.equal(await page.evaluate(()=>bimcraftPlan.state.units),unit);check(unit+': unit choice survives a real page reload');
 }
 await page.locator('[data-ws-fallback]').first().click();assert.ok(await page.locator('[data-model-units]').evaluate(e=>!!e.closest('.bc-toolbar')));assert.equal(await page.locator('[data-model-units]').inputValue(),'m');await page.locator('[data-model-units]').selectOption('cm');assert.equal(await page.evaluate(()=>bimcraftPlan.state.units),'cm');check('established fallback restores the upstream global control and its handler');
 await page.locator('[data-ws-launch]').click();await settle();assert.equal(await page.locator('[data-model-units]').inputValue(),'cm');assert.deepEqual(await records(),before);check('live workspace round trip preserves units and the exact authored model');
 await page.screenshot({path:path.join(out,'six-units.png')});
 if(process.env.REBASE_REQUIRE_PHP==='1'){
  execFileSync('php',['-v']);report.locales=[];
  for(const locale of ['es-MX','id','en-XA']){
   await page.goto(`http://127.0.0.1:${port}/?lang=${locale}&space=paper`,{waitUntil:'networkidle'});
   assert.equal(await page.locator('html').getAttribute('lang'),locale);
   const boot=await page.locator('#cc-lang').textContent(),catalog=JSON.parse(boot);assert.equal(catalog.locale,locale);
   const label=await page.locator('[data-model-units] option[value="m"]').textContent();assert.equal(label.trim(),catalog.strings['model.units.m']);assert.notEqual(label.trim(),'model.units.m');
   await page.locator('[data-file]').setInputFiles(path.resolve('fixtures/f04/layered-plans.ifc'));await page.waitForFunction(()=>globalThis.bimcraftLive?.editor,null,{timeout:90000});
   const result=await records();assert.deepEqual(result,before);report.locales.push({locale,unitLabel:label.trim(),rawRecordsUnchanged:true});check(locale+': real PHP locale and fallback open the authored model unchanged');
  }
 }else report.localeLimit='Full PHP-rendered locale checks require REBASE_REQUIRE_PHP=1 and PHP.';
 assert.equal(report.errors.length,0);check('no application exceptions');report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack||String(e);process.exitCode=1;await page?.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});}
finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log('UPSTREAM_REPORT '+JSON.stringify(report));await browser?.close();if(server)await new Promise(r=>server.close(r));}
