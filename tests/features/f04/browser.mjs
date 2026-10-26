/* SPDX-License-Identifier: Apache-2.0 */
// Real Chromium app workflow. Test hooks only read state, frame screenshots and
// measure the production painter; editing and persistence use existing UI controls.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {start} from '../../../devshell/serve.mjs';
const root=process.cwd(),out=path.resolve('.cc-test/f04-browser');
fs.mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL(path.resolve('.cc-test/f04-browser-deps/node_modules/playwright/index.mjs')));
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),approvedBase:'656d46236ff32b444cbd5a2b4ebe5164858c3848',cpu:os.cpus()[0].model,platform:os.platform(),memory:os.totalmem(),node:process.version,fixtureSha256:crypto.createHash('sha256').update(fs.readFileSync('fixtures/f04/layered-plans.ifc')).digest('hex'),checks:[],console:[],notes:['DOM clicks reveal existing collapsed toolbar/project-browser groups; this is not a certification of inherited menu/icon accessibility.','Paint CPU duration and requestAnimationFrame intervals are reported separately; no GPU or large-model claim.']};
const check=(name,condition)=>{assert.ok(condition,name);report.checks.push(name);console.log('PASS',name);};
let browser,server,baselineServer,page;
const saveReport=()=>fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
const settled=async p=>{await p.waitForFunction(()=>{const s=window.bimcraftPlan?.state;return s?.data?.walls?.length===9&&!s.busy&&!s.reloading&&!s.queue.length;},{},{timeout:90000});};
async function reveal(p,selector){await p.locator(selector).first().evaluate(el=>{for(let q=el.parentElement;q;q=q.parentElement)if(q.tagName==='DETAILS'&&!q.open)q.querySelector(':scope > summary')?.click();});}
async function click(p,selector){await reveal(p,selector);await p.locator(selector).first().click({force:true});}
async function open(p,url,file){
 await p.goto(url,{waitUntil:'networkidle'});
 await p.locator('[data-file]').setInputFiles(file);
 await p.waitForFunction(()=>window.bimcraftLive?.editor,{},{timeout:90000});
 if(await p.locator('[data-model-toggle]').getAttribute('aria-pressed')!=='true')await click(p,'[data-model-toggle]');
 await settled(p);await click(p,'[data-model-layout="plan"]');
 await p.waitForFunction(()=>window.bimcraftPlan.view.scene.walls.length===9);
}
async function detail(p,value){await click(p,'[data-pb-range]');await p.locator('[data-pv-detail]').selectOption(value);await p.locator('[data-pv-scale]').selectOption('100');await p.locator('[data-pv-ok]').click();await settled(p);await p.waitForFunction(d=>window.bimcraftPlan.view.scene.detail===d,value);}
async function frame(p,bounds){await p.evaluate(b=>{const v=window.bimcraftPlan.view,c=v.canvas.getBoundingClientRect(),bar=document.querySelector('[data-modelbar]').getBoundingClientRect();v.padTop=Math.max(0,bar.bottom-c.top)+12;v.fit(b||undefined);v.render();},bounds);}
async function snapshot(p){return p.evaluate(async()=>{
 const base='/assets/apps/bimcraft/dev/',ed=window.bimcraftLive.editor;
 const {ModelWriter}=await import(base+'model-write.js'),w=new ModelWriter(ed.W,ed.api,ed.mid);
 const [{readWalls,locationLine},{readAssemblies},{readWallDimensions,resolveDimension},{readOpenings},{readMaterials}]=await Promise.all(['model-walls.js','wall-assemblies.js','wall-dimensions.js','model-openings.js','project-materials.js'].map(f=>import(base+f)));
 const walls=readWalls(w),dims=readWallDimensions(w);
 return {geometry:{walls,types:readAssemblies(w),openings:readOpenings(w),dims,values:dims.map(d=>resolveDimension(d,walls).value),anchors:walls.map(locationLine)},materials:readMaterials(w),detail:window.bimcraftPlan.view.scene.detail,layers:window.bimcraftPlan.view.scene.walls.map(w=>w.layers||null)};
 });}
async function measure(p,label){
 await frame(p);
 return p.evaluate(async label=>{
  const v=window.bimcraftPlan.view,{planPdf}=await import('/assets/apps/bimcraft/dev/model-pdf.js');
  const paint=[],frameIntervals=[],pdf=[];let prev=null;
  for(let i=0;i<35;i++){const now=await new Promise(requestAnimationFrame);if(i>=5&&prev!==null)frameIntervals.push(now-prev);prev=now;const t=performance.now();v.draw();if(i>=5)paint.push(performance.now()-t);}
  for(let i=0;i<35;i++){const t=performance.now();planPdf(v.scene,{paper:'a3',units:'mm',scale:100});if(i>=5)pdf.push(performance.now()-t);}
  const stats=a=>{a.sort((a,b)=>a-b);return {n:a.length,p50Ms:a[Math.floor(a.length*.5)],p95Ms:a[Math.ceil(a.length*.95)-1]};};
  return {label,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,paintCpu:stats(paint),frameIntervals:stats(frameIntervals),planPdf:stats(pdf)};
 },label);
}
async function download(p,selector,name){const pending=p.waitForEvent('download');await click(p,selector);const d=await pending;await d.saveAs(path.join(out,name));check('download '+name,fs.statSync(path.join(out,name)).size>1000);}
try{
 server=await start({port:8022,host:'127.0.0.1',offline:true});
 const baselineRoot=process.env.F04_BASELINE_ROOT;
 assert.ok(baselineRoot,'F04_BASELINE_ROOT required for same-machine comparison');
 const baseline=await import(pathToFileURL(path.join(baselineRoot,'devshell/serve.mjs')));
 baselineServer=await baseline.start({port:8023,host:'127.0.0.1',offline:true});
 browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
 const context=await browser.newContext({viewport:{width:1680,height:1100},acceptDownloads:true});
 await context.addInitScript(()=>localStorage.setItem('bimcraft.model.units','mm'));
 const baselinePage=await context.newPage();
 await open(baselinePage,'http://127.0.0.1:8023',path.join(root,'fixtures/f04/layered-plans.ifc'));
 report.before=await measure(baselinePage,'approved baseline coarse');
 await baselinePage.screenshot({path:path.join(out,'before.png')});await baselinePage.close();
 page=await context.newPage();
 page.on('console',m=>{if(['error','warning'].includes(m.type()))report.console.push({type:m.type(),text:m.text()});});
 page.on('pageerror',e=>report.console.push({type:'pageerror',text:e.stack||e.message}));
 await open(page,'http://127.0.0.1:8022',path.join(root,'fixtures/f04/layered-plans.ifc'));
 const initial=await snapshot(page);check('fixture opens with 9 walls / 5 hosted openings',initial.geometry.walls.length===9&&initial.geometry.openings.length===5);
 check('legacy view defaults to coarse',initial.detail==='coarse'&&initial.layers.every(l=>l===null));
 report.afterCoarse=await measure(page,'F04 coarse');
 await detail(page,'medium');const medium=await snapshot(page);check('medium renders layers without hatching',medium.layers.every(Boolean)&&medium.layers.every(ls=>ls.every(l=>!l.hatch.length)));
 await detail(page,'fine');const fine=await snapshot(page);assert.deepEqual(fine.geometry,initial.geometry);assert.deepEqual(fine.layers.map(ls=>ls.map(l=>l.polys)),medium.layers.map(ls=>ls.map(l=>l.polys)));
 check('fine uses medium boundaries and adds patterns without model edits',fine.layers.some(ls=>ls.some(l=>l.hatch.length)));
 check('true cavity width and zero-width unfilled membrane',fine.layers[0][1].thickness===25.4&&fine.layers[0][1].fill==='none'&&fine.layers[0][2].thickness===0&&fine.layers[0][2].polys.length===0);
 report.afterFine=await measure(page,'F04 fine');await frame(page);await page.screenshot({path:path.join(out,'fine-whole.png')});
 await frame(page,{x0:4300,y0:-500,x1:6100,y1:700});await page.screenshot({path:path.join(out,'fine-detail.png')});
 await frame(page,{x0:-500,y0:2300,x1:6500,y1:7500});await page.screenshot({path:path.join(out,'fine-curves.png')});
 await frame(page,{x0:7800,y0:-400,x1:14400,y1:10000});await page.screenshot({path:path.join(out,'fine-junctions.png')});
 await download(page,'[data-model-print]','browser-fine-plan.pdf');
 await click(page,'[data-materials-menu]');const dlg=page.locator('[data-material-library]');
 await dlg.locator('select').first().selectOption('material-studs');
 const labels=JSON.parse(fs.readFileSync('app/lang/en.json','utf8'));
 await dlg.getByLabel(labels['materials.color'],{exact:true}).fill('#174f92');
 await dlg.getByLabel(labels['materials.fill'],{exact:true}).selectOption('crosshatch');
 await dlg.getByLabel(labels['materials.fillColor'],{exact:true}).fill('#9f1122');
 await dlg.getByLabel(labels['materials.defaultThickness'],{exact:true}).fill('333 mm');
 await page.screenshot({path:path.join(out,'material-dialog.png')});
 await dlg.locator('[data-material-save]').click();await settled(page);await page.waitForSelector('[data-material-library]',{state:'detached'});
 const styled=await snapshot(page);assert.deepEqual(styled.geometry,initial.geometry);
 check('material edit changes graphic style without dimensions, anchors, IDs or layer widths',styled.materials.find(m=>m.id==='material-studs').defaultThickness===333&&JSON.stringify(styled.layers)!==JSON.stringify(fine.layers));
 await click(page,'[data-undo]');await settled(page);assert.deepEqual((await snapshot(page)).layers,fine.layers);check('UI Undo restores graphics',true);
 await page.locator('[data-status]').click({force:true});await page.keyboard.press('Control+Shift+z');await settled(page);assert.deepEqual((await snapshot(page)).layers,styled.layers);check('UI Redo reapplies graphics',true);
 await frame(page,{x0:4300,y0:-500,x1:6100,y1:700});await page.screenshot({path:path.join(out,'styled-detail.png')});
 await download(page,'[data-model-print]','browser-styled-plan.pdf');
 await click(page,'[data-pb-newsheet]');await page.locator('[data-sh-paper]').selectOption('a3');await page.locator('[data-sh-number]').fill('F04-01');
 await page.locator('[data-sh-add^="plan:"]').first().click();await page.locator('[data-sh-scale]').selectOption('100');
 await page.screenshot({path:path.join(out,'sheet.png')});await download(page,'[data-sh-pdf]','browser-sheet.pdf');await page.locator('[data-sh-save]').click();await settled(page);
 await download(page,'[data-save]','browser-saved.ifc');
 await page.reload({waitUntil:'networkidle'});await page.locator('[data-file]').setInputFiles(path.join(out,'browser-saved.ifc'));
 await page.waitForFunction(()=>window.bimcraftLive?.editor,{},{timeout:90000});if(await page.locator('[data-model-toggle]').getAttribute('aria-pressed')!=='true')await click(page,'[data-model-toggle]');await settled(page);await click(page,'[data-model-layout="plan"]');
 const reopened=await snapshot(page);assert.deepEqual(reopened.geometry,initial.geometry);assert.deepEqual(reopened.layers,styled.layers);assert.deepEqual(reopened.materials,styled.materials);
 check('actual downloaded IFC reopens with fine detail, material edits and unchanged geometry',reopened.detail==='fine');
 await frame(page,{x0:4300,y0:-500,x1:6100,y1:700});await page.screenshot({path:path.join(out,'reopened.png')});
 const isolated=await context.newPage();await open(isolated,'http://127.0.0.1:8022',path.join(root,'fixtures/f04/layered-plans.ifc'));const clean=await snapshot(isolated);assert.deepEqual(clean.materials,initial.materials);check('second project retains original material styles and coarse detail',clean.detail==='coarse');await isolated.close();
 check('no unexpected browser errors',report.console.every(x=>x.type!=='pageerror'&&(x.text.includes('/bootstrap-icons/current/bootstrap-icons.min.css')||(x.type==='warning'&&x.text==='Failed to create WebGPU Context Provider'))));
 report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack||String(e);console.error(e);if(page){await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});fs.writeFileSync(path.join(out,'failure.html'),await page.content().catch(()=>''));}process.exitCode=1;}
finally{saveReport();console.log(JSON.stringify(report,null,2));await browser?.close();await new Promise(r=>server?server.close(r):r());await new Promise(r=>baselineServer?baselineServer.close(r):r());}
