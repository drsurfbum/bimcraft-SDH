/* SPDX-License-Identifier: Apache-2.0 */
// HTTP devshell, real retained renderers and transactions, separate disposable browser context.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {start} from '../../../devshell/serve.mjs';
const out=path.resolve('.cc-test/f28-browser');fs.mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL(path.resolve(process.env.F28_PLAYWRIGHT||'.cc-test/f28-browser-deps/node_modules/playwright/index.mjs')));
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),cpu:os.cpus()[0].model,node:process.version,platform:os.platform(),checks:[],errors:[],performanceIssues:['PERF-F04-01 OPEN','PERF-F05-01 OPEN'],notes:['Real UI for view activation, canvas picking, fields, shortcuts and save. setInputFiles supplies actual disk bytes to the existing file input. Read hooks inspect authoritative state and production camera/painter only.','Five warmups + 30 raw CPU render samples per layout; same IFC, detail and canvas dimensions. No GPU or optimization claim.']};
let server,browser,page;
const check=(name,yes=true)=>{assert.ok(yes,name);report.checks.push(name);console.log('PASS',name);};
const settle=async p=>{await p.waitForFunction(()=>globalThis.bimcraftWorkspace?.snapshot().document&&!bimcraftWorkspace.snapshot().busy,null,{timeout:90000});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
const button=id=>'.ws-quick [data-ws-command="'+id+'"]';
async function snap(p){return p.evaluate(async()=>{
 const base='/assets/apps/bimcraft/dev/',ed=bimcraftLive.editor,{ModelWriter}=await import(base+'model-write.js'),w=new ModelWriter(ed.W,ed.api,ed.mid);
 const [{readWalls,locationLine},{readAssemblies},{readWallDimensions,resolveDimension},{readMaterials},{readPlanViews}]=await Promise.all(['model-walls.js','wall-assemblies.js','wall-dimensions.js','project-materials.js','views-model.js'].map(f=>import(base+f)));
 const walls=readWalls(w);return {ui:bimcraftWorkspace.snapshot(),walls:JSON.parse(JSON.stringify(walls)),stable:{anchors:walls.map(x=>[x.guid,x.typeKey,locationLine(x)]),assemblies:readAssemblies(w),materials:readMaterials(w),dims:readWallDimensions(w).map(d=>[d.guid,d.refs,resolveDimension(d,walls)])},views:[...readPlanViews(w)]};
 });}
async function pickWall(p){
 const point=await p.evaluate(()=>{const pv=bimcraftPlan.view,w=bimcraftPlan.state.data.walls.find(w=>!w.bulge);const s=pv.toScreen([(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2]),r=pv.canvas.getBoundingClientRect();return {x:r.left+s.x,y:r.top+s.y,guid:w.guid};});
 await p.mouse.click(point.x,point.y);await p.locator('[data-mp-height]').waitFor({state:'visible'});await settle(p);return point.guid;
}
async function open(p,file,layout='live'){
 await p.goto('http://127.0.0.1:8032/?workspace='+layout+'&space=paper',{waitUntil:'networkidle'});await p.locator('[data-file]').setInputFiles(file);
 await p.waitForFunction(()=>globalThis.bimcraftLive?.editor,null,{timeout:90000});
 if(layout==='live')await settle(p);
}
async function renderTiming(p){return p.evaluate(()=>{const v=bimcraftPlan.view,raw=[],keep={cx:v.cx,cy:v.cy,scale:v.scale,selection:v.selection,hover:v.hover,overlay:v.overlay};try{v.cx=3500;v.cy=4000;v.scale=.05;v.selection=new Set();v.hover=null;v.overlay=null;for(let i=-5;i<30;i++){const t=performance.now();v.draw();if(i>=0)raw.push(performance.now()-t);}const s=[...raw].sort((a,b)=>a-b);return {raw,n:s.length,p50Ms:s[14],p95Ms:s[28],canvas:[v.w,v.h2],camera:[v.cx,v.cy,v.scale],detail:v.scene.detail,boundary:'Synchronous existing PlanView.draw CPU submission; excludes queued RAF, GPU completion and user latency.'};}finally{Object.assign(v,keep);v.render();}});}
try{
 server=await start({port:8032,host:'127.0.0.1',offline:true});browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,acceptDownloads:true});await ctx.addInitScript(()=>localStorage.setItem('bimcraft.model.units','mm'));
 page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.stack||e.message));
 const fixture=path.resolve('fixtures/f04/layered-plans.ifc');report.fixtureSHA256=crypto.createHash('sha256').update(fs.readFileSync(fixture)).digest('hex');
 await open(page,fixture,'established');await page.locator('[data-model-toggle]').click({force:true});await page.locator('[data-model-layout="plan"]').click({force:true});
 await page.waitForFunction(()=>globalThis.bimcraftPlan?.state.data?.walls.length===9&&!bimcraftPlan.state.busy&&!bimcraftPlan.state.reloading);
 await page.locator('[data-model-fit]').click({force:true});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 check('established canvas has painted actual model pixels',await page.evaluate(()=>{const v=bimcraftPlan.view,a=v.ctx.getImageData(0,0,v.canvas.width,v.canvas.height).data;let n=0;for(let i=0;i<a.length;i+=4)if(a[i+3]>0&&a[i]<100&&a[i+1]<100&&a[i+2]<100)n++;return n>500;}));
 await page.screenshot({path:path.join(out,'before-established.png')});
 await page.locator('[data-pb-range]').first().click({force:true});await page.locator('[data-pv-cut]').fill('1400 mm');await page.locator('[data-pv-detail]').selectOption('fine');await page.locator('[data-pv-scale]').selectOption('100');await page.locator('[data-pv-ok]').click();await page.waitForFunction(()=>!bimcraftPlan.state.busy&&!bimcraftPlan.state.reloading);
 // Same production painter and exact viewport size for comparable timing, independently of chrome occupied space.
 await page.evaluate(()=>{const v=bimcraftPlan.view;v.scene.detail='fine';v.canvas.parentElement.style.width='900px';v.canvas.parentElement.style.height='600px';v.resize();});
 report.before=await renderTiming(page);
 await open(page,fixture);check('real IFC opens in opt-in live layout',(await snap(page)).walls.length===9);
 const initial=await snap(page);await page.locator('[data-pb-plan]').first().click();check('browser selection does not activate or select model elements',(await snap(page)).ui.view.kind==='3d'&&(await snap(page)).ui.selection.length===0);await page.locator('[data-pb-plan]').first().press('Enter');await settle(page);
 check('floor plan activates real storey and drawing tab',(await snap(page)).ui.view.kind==='plan');
 check('newly activated view immediately exposes live Properties controls',await page.locator('.ws-view-props [data-ws-command="range"]').getAttribute('aria-disabled')==='false'&&await page.locator('.ws-view-props [data-ws-setting="detail"]').isEnabled());
 await page.screenshot({path:path.join(out,'after-workspace.png')});
 const guid=await pickWall(page),selected=await snap(page);check('canvas and Properties select a real wall',selected.ui.selection.length===1&&selected.walls.some(w=>w.guid===guid));
 await page.screenshot({path:path.join(out,'selected-wall.png')});
 await page.locator('[data-mp-assembly]').focus();await page.keyboard.press('Enter');await page.locator('[data-ws-type-dialog]').waitFor({state:'visible'});check('Edit Type remains in the live workspace and explains shared effects',(await page.locator('[data-ws-type-effects]').textContent()).match(/Editing this type changes (?:all \d+ walls that use|the 1 wall that uses) it/)&&await page.locator('.bc').evaluate(el=>el.classList.contains('ws-active')));await page.locator('[data-ws-dismiss]').click();
 const w0=selected.walls.find(w=>w.guid===guid),input=page.locator('[data-mp-height]');
 await input.fill('not a length');await input.press('Enter');check('existing invalid-length feedback appears',await page.locator('[data-status]').getAttribute('class').then(s=>s.includes('is-error')));assert.deepEqual((await snap(page)).walls,selected.walls);
 await page.locator('[data-mp-height]').fill(String(w0.height+250)+' mm');await page.locator('[data-mp-height]').press('Enter');await settle(page);
 const edited=await snap(page);check('height is a real existing transaction',Math.abs(edited.walls.find(w=>w.guid===guid).height-w0.height-250)<.005);assert.deepEqual(edited.stable,initial.stable);check('core anchors, material/assembly identities and persistent dimensions survive height edit');
 await page.locator('[data-ws-view-props]').click();await page.locator('.ws-view-controls [data-ws-command="range"]').click();await page.locator('[data-pv-cut]').fill('1400 mm');await page.locator('[data-pv-detail]').selectOption('fine');await page.locator('[data-pv-scale]').selectOption('100');await page.locator('[data-pv-ok]').click();await settle(page);
 check('Properties and bottom detail/scale remain synchronized',(await page.locator('.ws-view-controls [data-ws-setting="detail"]').inputValue())==='fine'&&(await page.locator('.ws-view-props [data-ws-setting="detail"]').inputValue())==='fine'&&(await page.locator('.ws-view-props [data-ws-setting="scale"]').inputValue())==='100');
 const ranged=await snap(page);check('View Range cut belongs to authoritative view',ranged.ui.settings.cut===1400);
 await page.locator(button('undo')).click();await settle(page);check('Undo restores actual view state',(await snap(page)).ui.settings.cut!==1400);
 await page.locator(button('redo')).click();await settle(page);check('Redo restores actual view state',(await snap(page)).ui.settings.cut===1400);
 await pickWall(page);await page.locator('[data-mp-height]').fill('3150 mm');await page.setViewportSize({width:1200,height:850});check('resize preserves unfinished field entry and focus',await page.locator('[data-mp-height]').evaluate(el=>document.activeElement===el&&el.value==='3150 mm'));await page.locator('[data-mp-height]').press('Escape');await page.setViewportSize({width:1440,height:1000});await page.locator('[data-mp-height]').focus();const history=await page.evaluate(()=>bimcraftLive.editor.changes.length);await page.keyboard.press('Control+z');check('model Undo does not fire in a field',(await page.evaluate(()=>bimcraftLive.editor.changes.length))===history);await page.keyboard.press('Tab');
 const camera=await page.evaluate(()=>{const p=bimcraftPlan.view;return[p.cx,p.cy,p.scale];});
 await page.locator('.shell-split-left').focus();await page.keyboard.press('ArrowRight');await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.deepEqual(await page.evaluate(()=>{const p=bimcraftPlan.view;return[p.cx,p.cy,p.scale];}),camera);check('palette resize preserves plan camera');await pickWall(page);check('plan picking survives palette resize');
 await page.locator('[data-ws-drawing="3d:default"]').click();await settle(page);const camera3d=await page.evaluate(()=>{const v=bimcraftRes.api.host.viewer();return v?[...v.camera.position.toArray(),...v.controls.target.toArray()]:null;});
 await page.locator('[data-ws-drawing^="plan:"]').click();await settle(page);await page.locator('[data-ws-drawing="3d:default"]').click();await settle(page);assert.deepEqual(await page.evaluate(()=>{const v=bimcraftRes.api.host.viewer();return v?[...v.camera.position.toArray(),...v.controls.target.toArray()]:null;}),camera3d);check('3D camera survives plan/3D switches');
 const point3d=await page.evaluate(()=>{const v=bimcraftRes.api.host.viewer(),keys=new Set(bimcraftPlan.state.data.walls.map(w=>bimcraftRes.api.kb()+w.id));for(const k of keys){const p=v.screenOf(k);if(p){const h=v.hitAt(p.x,p.y);if(h&&keys.has(h.id))return {...p,key:h.id};}}return null;});check('3D wall hit is available after view switches',point3d);await page.mouse.click(point3d.x,point3d.y);await page.locator('[data-mp-height]').waitFor({state:'visible'});check('3D native click agrees with actual ray hit',(await snap(page)).ui.selection.includes(point3d.key));
 await page.locator('[data-ws-drawing^="plan:"]').click();await settle(page);await pickWall(page);
 const count=await page.evaluate(()=>document.querySelectorAll('canvas').length);await page.locator('[data-ws-close^="plan:"]').click();await settle(page);check('closing a drawing retains the project and changes',(await snap(page)).ui.document&&await page.evaluate(()=>bimcraftLive.editor.changes.length)>0);await page.locator('[data-pb-plan]').first().dblclick();await settle(page);check('view activation retains original canvas count',count===await page.evaluate(()=>document.querySelectorAll('canvas').length));
 await page.locator('[data-ws-tab="modify"]').click();await page.locator('[data-ws-command="copy"]').first().focus();await page.keyboard.press('Enter');await page.locator('.ws-dialog').waitFor({state:'visible'});check('unsupported wall Copy explains scope without execution',(await page.locator('.ws-dialog').textContent()).includes('Wall Copy is not supported'));await page.locator('[data-ws-dismiss]').click();
 await page.setViewportSize({width:900,height:700});await page.screenshot({path:path.join(out,'narrow.png')});check('palettes scroll independently',await page.evaluate(()=>['properties','browser'].every(k=>getComputedStyle(document.querySelector('[data-ws-'+k+'-scroll]')).overflowY==='auto')));
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{const v=bimcraftPlan.view;v.canvas.parentElement.style.width='900px';v.canvas.parentElement.style.height='600px';v.resize();});report.after=await renderTiming(page);check('comparable Fine painter dimensions',JSON.stringify(report.before.canvas)===JSON.stringify(report.after.canvas)&&JSON.stringify(report.before.camera)===JSON.stringify(report.after.camera)&&report.before.raw.some(t=>t>0)&&report.after.raw.some(t=>t>0));
 const pending=page.waitForEvent('download');await page.locator(button('save')).click();const d=await pending;await d.saveAs(path.join(out,'saved.ifc'));check('real edited IFC download exists',fs.statSync(path.join(out,'saved.ifc')).size>1000);
 const saved=await snap(page);fs.writeFileSync(path.join(out,'expected.json'),JSON.stringify(saved,null,2));
 await open(page,path.join(out,'saved.ifc'));await page.locator('[data-pb-plan]').first().dblclick();await settle(page);const re=await snap(page);assert.deepEqual(re.walls,saved.walls);assert.deepEqual(re.stable,saved.stable);assert.deepEqual(re.views,saved.views);check('downloaded IFC reopens with edits, views and stable references');
 const other=await ctx.newPage();await open(other,fixture);assert.deepEqual((await snap(other)).walls,initial.walls);check('second opened project remains isolated');await other.close();
 await page.locator('[data-ws-fallback]').first().click();check('fallback restores original Properties and Project Browser',await page.evaluate(()=>document.querySelector('.bc-right').contains(document.querySelector('[data-props]'))&&document.querySelector('.bc-left').contains(document.querySelector('[data-pb-sec]'))));await pickWall(page);await page.locator('[data-mp-assembly]').click();await page.locator('[data-assembly-editor]').waitFor({state:'visible'});check('fallback opens the real assembly editor');await page.keyboard.press('Escape');
 check('no application exceptions',report.errors.length===0);report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack||String(e);console.error(e);if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});process.exitCode=1;}
finally{
 // Optional tool-readable review frames for reviewers whose environments cannot materialize artifact ZIPs.
 // Synthetic fixture screenshots only; ordinary evidence remains the Actions artifact.
 if(process.env.F28_EMIT_REVIEW_FRAMES==='1')console.log('F28_REPORT '+JSON.stringify(report));
 if(process.env.F28_EMIT_REVIEW_FRAMES==='1')for(const name of ['before-established.png','after-workspace.png','selected-wall.png','narrow.png'])if(fs.existsSync(path.join(out,name))){const b=fs.readFileSync(path.join(out,name)).toString('base64'),n=Math.ceil(b.length/12000);for(let i=0;i<n;i++)console.log('F28_FRAME '+name+' '+i+'/'+n+' '+b.slice(i*12000,(i+1)*12000));}
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks,error:report.error}));await browser?.close();await new Promise(r=>server?server.close(r):r());}
