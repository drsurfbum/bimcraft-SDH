/* SPDX-License-Identifier: Apache-2.0 */
// Real app workflow in a disposable Chromium context; no personal browser/profile.
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';import {execFileSync} from 'node:child_process';
import {start} from '../../../devshell/serve.mjs';
const root=process.cwd(),out=path.resolve('.cc-test/f05-browser');fs.mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL(path.resolve(process.env.F05_PLAYWRIGHT||'.cc-test/f05-browser-deps/node_modules/playwright/index.mjs')));
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),base:'ff0344b46ca1c29962772528c23f62d175c6d2ea',cpu:os.cpus()[0].model,platform:os.platform(),node:process.version,fixtureSha256:crypto.createHash('sha256').update(fs.readFileSync('fixtures/f05/wall-views.ifc')).digest('hex'),checks:[],console:[],notes:['Separate test context, 1680x1100 DPR1, headless SwiftShader.','Collapsed inherited menus are opened with DOM clicks; selection setup uses the existing pick hook. Edits/downloads use actual UI controls.','SVG serialization/DOM assignment, frame intervals and PDF generation are distinct proxies, not GPU or physical presentation latency. Inherited icon CSS MIME error is explicitly recorded.']};
let server,browser,page;
const check=(label,condition=true)=>{assert.ok(condition,label);report.checks.push(label);console.log('PASS',label);};
const settle=async p=>p.waitForFunction(()=>{const s=bimcraftPlan?.state;return s?.data?.walls?.length===2&&!s.busy&&!s.reloading&&!s.queue.length;},null,{timeout:90000});
async function click(p,s){await p.locator(s).first().evaluate(el=>{for(let q=el.parentElement;q;q=q.parentElement)if(q.tagName==='DETAILS'&&!q.open)q.querySelector(':scope > summary')?.click();});await p.locator(s).first().click({force:true});}
async function open(p,url,file){await p.goto(url,{waitUntil:'networkidle'});await p.locator('[data-file]').setInputFiles(file);await p.waitForFunction(()=>bimcraftLive?.editor,null,{timeout:90000});if(await p.locator('[data-model-toggle]').getAttribute('aria-pressed')!=='true')await click(p,'[data-model-toggle]');await settle(p);await click(p,'[data-model-layout="plan"]');}
async function snapshot(p){return p.evaluate(async()=>{
 const base='/assets/apps/bimcraft/dev/',ed=bimcraftLive.editor,{ModelWriter}=await import(base+'model-write.js'),w=new ModelWriter(ed.W,ed.api,ed.mid);
 const {readWalls,locationLine}=await import(base+'model-walls.js'),{readOpenings}=await import(base+'model-openings.js'),{readMaterials}=await import(base+'project-materials.js'),{readProjectedView}=await import(base+'projected-views.js');
 const input=bimcraftRes.api.ask('sheetInput'),walls=readWalls(w),section=input.sections[0];
 return {walls,openings:readOpenings(w),materials:readMaterials(w),anchors:walls.map(locationLine),view:section.view,elevation:input.elevations.find(e=>e.ref==='south').view,settings:readProjectedView(w,'section:'+section.ref)};
 });}
async function settings(p,detail,scale=20,crop='-2200, -200, 400, 3200') {await click(p,'[data-pb-projected^="section:"]');await p.locator('[data-pj-detail]').selectOption(detail);await p.locator('[data-pj-scale]').fill(String(scale));await p.locator('[data-pj-crop]').fill(crop);await click(p,'[data-pj-save]');await p.waitForSelector('[data-pj-dialog]',{state:'detached'});await settle(p);}
async function download(p,selector,name){const next=p.waitForEvent('download');await click(p,selector);const d=await next;await d.saveAs(path.join(out,name));check('download '+name,fs.statSync(path.join(out,name)).size>1000);}
async function pick(p,kind,index=0){await p.evaluate(({kind,index})=>{const s=bimcraftPlan.state,item=(kind==='wall'?s.data.walls:s.data.openings.filter(o=>o.kind==='window'))[index];bimcraftVis.pick([bimcraftRes.api.kb()+item.id]);},{kind,index});}
async function field(p,selector,value){await p.locator(selector).fill(value);await p.locator(selector).press('Enter');await settle(p);}
async function measure(p,label){return p.evaluate(async label=>{
 const A=bimcraftRes.api,{composeSheet,sheetSvg,setPdf}=await import('/assets/apps/bimcraft/dev/res-sheets.js'),raw={generation:[],svg:[],dom:[],frames:[],pdf:[]};
 const input=A.ask('sheetInput'),ref=input.sections[0].ref,spec={number:'F05',title:'Measurement',views:[{kind:'section',ref,x:100,y:165,ratio:20}]};
 const sh=composeSheet(spec,input,{paper:'a3',units:'mm'}),svg=sheetSvg(sh,{paper:'a3'}),host=document.createElement('div');host.style='position:fixed;inset:0;z-index:99999;background:white';document.body.append(host);
 for(let i=-5;i<30;i++){
  let t=performance.now();A.ask('sheetInput');let ms=performance.now()-t;if(i>=0)raw.generation.push(ms);
  t=performance.now();sheetSvg(sh,{paper:'a3'});ms=performance.now()-t;if(i>=0)raw.svg.push(ms);
  const a=await new Promise(requestAnimationFrame);t=performance.now();host.innerHTML=svg;host.getBoundingClientRect();ms=performance.now()-t;const b=await new Promise(requestAnimationFrame);if(i>=0){raw.dom.push(ms);raw.frames.push(b-a);}
  t=performance.now();setPdf([sh],{paper:'a3'});ms=performance.now()-t;if(i>=0)raw.pdf.push(ms);
 }
 host.remove();const stats=a=>{const s=[...a].sort((a,b)=>a-b);return{n:s.length,p50Ms:s[Math.ceil(s.length*.5)-1],p95Ms:s[Math.ceil(s.length*.95)-1]};};return{label,raw,summary:Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,stats(v)]))};
 },label);}
try{
 const baselineRoot=process.env.F05_BASELINE_ROOT;assert.ok(baselineRoot,'F05_BASELINE_ROOT required');
 const baseline=await import(pathToFileURL(path.join(baselineRoot,'devshell/serve.mjs')));
 server=await baseline.start({port:8024,host:'127.0.0.1',offline:true});
 browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
 const context=await browser.newContext({viewport:{width:1680,height:1100},acceptDownloads:true});await context.addInitScript(()=>localStorage.setItem('bimcraft.model.units','mm'));
 const bp=await context.newPage();await open(bp,'http://127.0.0.1:8024',path.join(root,'fixtures/f05/wall-views.ifc'));report.before=await measure(bp,'approved mesh envelopes');await bp.close();await new Promise(r=>server.close(r));server=null;
 server=await start({port:8024,host:'127.0.0.1',offline:true});page=await context.newPage();
 page.on('console',m=>{if(['error','warning'].includes(m.type()))report.console.push({type:m.type(),text:m.text()});});page.on('pageerror',e=>report.console.push({type:'pageerror',text:e.stack||e.message}));
 await open(page,'http://127.0.0.1:8024',path.join(root,'fixtures/f05/wall-views.ifc'));const initial=await snapshot(page);
 check('overall elevation note uses the actual 6000 mm wall length',initial.elevation.notes.some(n=>n.t==='dim'&&Math.abs(n.b[0]-n.a[0]-6000)<.005));
 check('live cut layers and visible-only elevation',initial.view.cuts.filter(c=>c.layers).length===2&&initial.elevation.cuts.every(c=>!c.layers));
 await settings(page,'coarse');check('coarse envelope',!(await snapshot(page)).view.cuts.some(c=>c.layers));report.coarse=await measure(page,'F05 coarse');
 await settings(page,'medium');check('medium has exact layers without hatch',(await snapshot(page)).view.cuts.filter(c=>c.layers).every(c=>c.layers.every(l=>!l.hatch.length)));
 await settings(page,'fine');const fine=await snapshot(page);assert.deepEqual(fine.walls,initial.walls);report.fine=await measure(page,'F05 fine');
 await click(page,'[data-pb-sheet]');await page.screenshot({path:path.join(out,'normal.png')});await download(page,'[data-sh-pdf]','normal.pdf');await page.locator('[data-sh-dialog] button[value="cancel"]').click();
 await settings(page,'fine',5,'-150, 400, 150, 1400');await click(page,'[data-pb-newsheet]');await page.locator('[data-sh-paper]').selectOption('a3');await page.locator('[data-sh-add^="section:"]').first().click();await page.screenshot({path:path.join(out,'detail.png')});await download(page,'[data-sh-pdf]','detail.pdf');await page.locator('[data-sh-dialog] button[value="cancel"]').click();await settings(page,'fine');
 await pick(page,'wall');await field(page,'[data-mp-height]','3150 mm');check('wall height updates section',Math.max(...(await snapshot(page)).view.cuts.find(c=>c.guid===initial.walls[0].guid).loops.flat().map(p=>p[1]))===3150);
 await click(page,'[data-undo]');await settle(page);check('Undo restores height',(await snapshot(page)).walls[0].height===3000);await page.locator('[data-status]').click({force:true});await page.keyboard.press('Control+Shift+z');await settle(page);check('Redo updates height',(await snapshot(page)).walls[0].height===3150);
 await pick(page,'wall');await click(page,'[data-mp-assembly]');await page.locator('[data-assembly-editor] input[aria-label="Thickness 1"]').fill('25.4 mm');await click(page,'[data-assembly-save]');await settle(page);const assembly=await snapshot(page);check('assembly edit updates exact cut width',assembly.view.cuts.find(c=>c.guid===initial.walls[0].guid).layers[0].thickness===25.4);
 await pick(page,'window');await field(page,'[data-mp-ow]','1600 mm');await field(page,'[data-mp-osill]','950 mm');const revised=await snapshot(page);check('window edit updates sill/head and width',revised.openings.find(o=>o.guid===initial.openings.find(x=>x.kind==='window').guid).width===1600&&revised.view.cuts.find(c=>c.guid===initial.walls[0].guid).loops.some(p=>p.some(q=>Math.abs(q[1]-950)<.005)));
 await click(page,'[data-materials-menu]');const dlg=page.locator('[data-material-library]'),labels=JSON.parse(fs.readFileSync('app/lang/en.json'));await dlg.locator('select').first().selectOption('material-studs');await dlg.getByLabel(labels['materials.defaultThickness'],{exact:true}).fill('333 mm');await dlg.getByLabel(labels['materials.color'],{exact:true}).fill('#174f92');await click(page,'[data-material-save]');await settle(page);const styled=await snapshot(page);assert.deepEqual(styled.walls,revised.walls);check('material/default edits preserve physical layer widths',styled.materials.find(m=>m.id==='material-studs').defaultThickness===333);
 await click(page,'[data-pb-sheet]');await page.screenshot({path:path.join(out,'edited-sheet.png')});await download(page,'[data-sh-pdf]','edited-sheet.pdf');await page.locator('[data-sh-dialog] button[value="cancel"]').click();
 await download(page,'[data-save]','saved.ifc');await page.reload({waitUntil:'networkidle'});await page.locator('[data-file]').setInputFiles(path.join(out,'saved.ifc'));await page.waitForFunction(()=>bimcraftLive?.editor,null,{timeout:90000});if(await page.locator('[data-model-toggle]').getAttribute('aria-pressed')!=='true')await click(page,'[data-model-toggle]');await settle(page);await click(page,'[data-model-layout="plan"]');const reopened=await snapshot(page);assert.deepEqual(reopened,styled);check('actual IFC download/reopen preserves model references graphics settings');
 await click(page,'[data-pb-sheet]');await page.screenshot({path:path.join(out,'reopened-sheet.png')});await page.locator('[data-sh-dialog] button[value="cancel"]').click();
 const other=await context.newPage();await open(other,'http://127.0.0.1:8024',path.join(root,'fixtures/f05/wall-views.ifc'));assert.deepEqual(await snapshot(other),initial);check('second project remains isolated');await other.close();
 // Create a fresh section through the ordinary Section tool and trusted pointer events.
 await click(page,'[data-mtool="section"]');const points=await page.evaluate(()=>{const v=bimcraftPlan.view;v.fit({x0:-800,y0:-1000,x1:6800,y1:3000});v.draw();const r=v.canvas.getBoundingClientRect();return [[5000,-450],[5000,2200]].map(p=>{const s=v.toScreen(p);return {x:r.left+s.x,y:r.top+s.y};});});for(const p of points)await page.mouse.click(p.x,p.y);await settle(page);check('user can create another section',await page.evaluate(()=>bimcraftRes.state.secs.length===2));await page.keyboard.press('Escape');
 check('no unexpected browser errors',report.console.every(x=>x.type!=='pageerror'&&(x.text.includes('/bootstrap-icons/current/bootstrap-icons.min.css')||(x.type==='warning'&&x.text==='Failed to create WebGPU Context Provider'))));report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack||String(e);console.error(e);if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});process.exitCode=1;}
finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks,error:report.error}));await browser?.close();await new Promise(r=>server?server.close(r):r());}
