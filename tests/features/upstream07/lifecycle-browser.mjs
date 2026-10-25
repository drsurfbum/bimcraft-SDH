/* SPDX-License-Identifier: Apache-2.0 */
// Actual file controls, source switching, native field transaction and legitimate autosave.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {start} from '../../../devshell/serve.mjs';
const {chromium}=await import(pathToFileURL(path.resolve('.cc-test/shell-deps/node_modules/playwright/index.mjs')));
const out='.cc-test/upstream07-shell',report={checks:[],errors:[]},server=await start({port:8068,host:'127.0.0.1',offline:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
const watch=p=>p.on('pageerror',e=>report.errors.push(e.message));
let page=await ctx.newPage();watch(page);
const goto=()=>page.goto('http://127.0.0.1:8068/?workspace=established&space=paper',{waitUntil:'networkidle'});
const idle=()=>page.waitForFunction(()=>globalThis.bimcraftLive?.editor&&!bimcraftPlan?.state.busy&&!bimcraftPlan?.state.reloading);
const records=()=>page.evaluate(async()=>{const p='/assets/apps/bimcraft/dev/',e=bimcraftLive.editor,[{ModelWriter},{readWalls}]=await Promise.all([import(p+'model-write.js'),import(p+'model-walls.js')]);return readWalls(new ModelWriter(e.W,e.api,e.mid)).map(w=>({guid:w.guid,height:w.height,a:w.a,b:w.b,type:w.typeKey}));});
try {
 await goto();await page.locator('[data-file]').setInputFiles({name:'Duplicate.ifc',mimeType:'application/x-step',buffer:fs.readFileSync('fixtures/f04/layered-plans.ifc')});await idle();const first=await records();
 await page.locator('[data-model-input]').setInputFiles({name:'Duplicate.ifc',mimeType:'application/x-step',buffer:fs.readFileSync('fixtures/f05/wall-views.ifc')});await page.waitForFunction(()=>document.querySelectorAll('[data-model-active]').length===2);await idle();
 const ids=await page.locator('[data-model-active]').evaluateAll(xs=>xs.map(x=>x.dataset.modelActive));assert.equal(new Set(ids).size,2);assert.deepEqual(await page.locator('.bc-model-name').allTextContents(),['Duplicate.ifc','Duplicate.ifc']);
 await page.locator('[data-model-active="'+ids[1]+'"]').check();await idle();const second=await records();assert.equal(first.length,9);assert.equal(second.length,2);
 await page.locator('[data-model-active="'+ids[0]+'"]').check();await idle();assert.deepEqual(await records(),first);report.checks.push('duplicate file names retain distinct source identities and native active-source ownership');
 // Close the clean federation; a new isolated tab performs the real transaction to be recovered.
 await page.close();page=await ctx.newPage();watch(page);await page.goto('http://127.0.0.1:8068/?workspace=live&space=paper',{waitUntil:'networkidle'});
 await page.locator('[data-file]').setInputFiles(path.resolve('fixtures/f04/layered-plans.ifc'));await idle();await page.locator('[data-pb-plan]').first().dblclick();await idle();
 const point=await page.evaluate(()=>{const v=bimcraftPlan.view,w=bimcraftPlan.state.data.walls[0],s=v.toScreen([(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2]),r=v.canvas.getBoundingClientRect();return{x:r.x+s.x,y:r.y+s.y};});await page.mouse.click(point.x,point.y);
 await page.locator('[data-mp-height]').fill('3210 mm');await page.locator('[data-mp-height]').press('Enter');await idle();const edited=await records();assert.ok(edited.some(w=>w.height===3210));
 // Wait for production's normal debounce; never insert or synthesize a recovery record.
 await page.waitForTimeout(4000);await page.close({runBeforeUnload:false});page=await ctx.newPage();watch(page);await goto();
 await page.locator('[data-autosave-dialog][open]').waitFor();assert.equal(await page.locator('[data-autosave-row]').count(),1);await page.locator('[data-autosave-recover]').click();await idle();assert.deepEqual(await records(),edited);assert.ok(await page.locator('[data-save]').isEnabled());report.checks.push('normal autosave survives tab closure and recovers the exact authored edit');
 const pending=page.waitForEvent('download');await page.locator('[data-save]').click();const download=await pending;await download.saveAs(path.resolve(out,'recovered.ifc'));await page.waitForTimeout(1000);await page.close();page=await ctx.newPage();watch(page);await goto();await page.waitForTimeout(1600);assert.equal(await page.locator('[data-autosave-dialog][open]').count(),0);report.checks.push('real saved download clears the recovery offer');
 assert.deepEqual(report.errors,[]);report.status='PASS';
} catch(e) {report.status='FAIL';report.error=e.stack;process.exitCode=1;}
finally {fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'lifecycle.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await ctx.close();await browser.close();await new Promise(r=>server.close(r));}
