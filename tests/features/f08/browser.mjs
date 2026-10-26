/* SPDX-License-Identifier: Apache-2.0 */
// Edits/downloads use real UI controls. Setup/readback hooks never write product state.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {start} from '../../../devshell/serve.mjs';
const out=path.resolve('.cc-test/f08/browser');fs.mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL(path.resolve('.cc-test/f08-deps/node_modules/playwright/index.mjs')));
const strings=JSON.parse(fs.readFileSync('app/lang/en.json'));
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),base:'82da107dfd760199bc943249590812978c1a6082',featureCutoff:'f929205133316b29a4551083792d5712d5ffcabd',originalEvidenceBase:'3e42c21e33e642d1e07bea2fc3356344f91db00e',environment:{cpu:os.cpus()[0].model,platform:os.platform(),node:process.version},checks:[],errors:[],console:[],openFollowups:['PERF-F04-01','PERF-F05-01','TEST-F28-01']};
let server,browser,page;const contexts=[];
const check=(s,v=true)=>{assert.ok(v,s);report.checks.push(s);console.log('PASS',s);};
async function context(){
 const c=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,acceptDownloads:true});contexts.push(c);
 await c.addInitScript(()=>{if(location.protocol==='http:')localStorage.setItem('bimcraft.model.units','mm');});
 c.on('page',p=>{p.on('pageerror',e=>report.errors.push(e.stack||e.message));p.on('console',m=>{if(['warning','error'].includes(m.type()))report.console.push({type:m.type(),text:m.text()});});});return c;
}
async function click(p,selector){
 const e=p.locator(selector).first();await e.evaluate(el=>{for(let q=el.parentElement;q;q=q.parentElement)if(q.tagName==='DETAILS'&&!q.open)q.querySelector(':scope > summary')?.click();});await e.click();
}
async function settle(p){await p.waitForFunction(()=>{const s=globalThis.bimcraftPlan?.state;return s?.data?.walls?.length===16&&!s.busy&&!s.reloading&&!s.queue.length;},null,{timeout:90000});}
async function open(p,file,locale='en'){
 await p.goto('http://127.0.0.1:8040/?space=paper&lang='+locale,{waitUntil:'networkidle'});await p.locator('[data-file]').setInputFiles(file);
 await p.waitForFunction(()=>globalThis.bimcraftLive?.editor,null,{timeout:90000});
 if(await p.locator('[data-model-toggle]').getAttribute('aria-pressed')!=='true')await click(p,'[data-model-toggle]');
 await settle(p);await click(p,'[data-model-layout="plan"]');
}
async function snapshot(p){return p.evaluate(async()=>{
 const base='/assets/apps/bimcraft/dev/',ed=bimcraftLive.editor;
 const [{ModelWriter},{readWalls,wallOutlines,storedShape,locationLine},{readAssemblies},{readMaterials},{readOpenings},{readWallDimensions,resolveDimension},{assemblySchedules}]=await Promise.all(['model-write.js','model-walls.js','wall-assemblies.js','project-materials.js','model-openings.js','wall-dimensions.js','assembly-schedule.js'].map(f=>import(base+f)));
 const w=new ModelWriter(ed.W,ed.api,ed.mid),walls=readWalls(w),outlines=wallOutlines(walls.map(w=>({...w,key:w.guid})));
 return JSON.parse(JSON.stringify({walls,types:readAssemblies(w),materials:readMaterials(w),openings:readOpenings(w),dims:readWallDimensions(w).map(d=>({...d,resolved:resolveDimension(d,walls)})),outlines:[...outlines],diagnostics:outlines.diagnostics,shapes:walls.map(wall=>({guid:wall.guid,...storedShape(w,wall.id)})),anchors:walls.map(w=>[w.guid,locationLine(w)]),schedules:assemblySchedules(w),scene:bimcraftPlan.view.scene}));
});}
async function frame(p,bounds){await p.evaluate(b=>{const v=bimcraftPlan.view;v.fit(b);v.render();},bounds);}
async function pick(p,guid){
 const point=await p.evaluate(g=>{const v=bimcraftPlan.view,w=bimcraftPlan.state.data.walls.find(w=>w.guid===g),s=v.toScreen([(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2]),r=v.canvas.getBoundingClientRect();return {x:r.x+s.x,y:r.y+s.y};},guid);
 await p.mouse.click(point.x,point.y);await p.locator('[data-mp-join-a]').waitFor();await settle(p);
}
const near=(a,b)=>assert.ok(Math.abs(a-b)<.005,a+' != '+b);
const semantic=s=>({walls:s.walls.map(w=>({...w,assembly:w.assembly&&(({psetId,...x})=>x)(w.assembly)})),types:s.types.map(({psetId,...x})=>x),materials:s.materials,dims:s.dims,openings:s.openings,shapes:s.shapes,outlines:s.outlines});
try{
 server=await start({host:'127.0.0.1',port:8040,offline:true});browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
 page=await(await context()).newPage();const fixture=path.resolve('fixtures/f08/straight-joins.ifc');await open(page,fixture);const initial=await snapshot(page);
 check('fixture opens in established default with complete core/height data',initial.walls.length===16&&initial.diagnostics.length===0&&!(await page.locator('.bc').evaluate(e=>e.classList.contains('ws-active'))));
 await frame(page,{x0:900,y0:500,x1:5800,y1:5300});await page.screenshot({path:path.join(out,'L-before.png')});
 const target=initial.walls.find(w=>w.justification==='coreCenter'&&w.extSide==='right'),anchor=initial.anchors.find(([g])=>g===target.guid)[1];
 await frame(page,{x0:400,y0:20400,x1:5600,y1:25400});await pick(page,target.guid);
 check('per-end controls are visible on a real selected straight wall',await page.locator('[data-mp-cap-b]').isVisible());
 await page.locator('[data-mp-join-a]').selectOption('disallow');await settle(page);const disallowed=await snapshot(page);
 check('disallow changes the selected physical and drawing join',disallowed.walls.find(w=>w.guid===target.guid).joinSettings.a.allow===false&&JSON.stringify(disallowed.outlines)!==JSON.stringify(initial.outlines));
 await page.locator('[data-mp-cap-b]').selectOption('square');await settle(page);await page.screenshot({path:path.join(out,'end-controls.png')});
 await page.locator('[data-mp-assembly]').click();const dlg=page.locator('[data-assembly-editor]');await dlg.waitFor();await dlg.getByLabel(strings['assembly.thickness']+' 1',{exact:true}).fill('1 in');await dlg.locator('[data-assembly-save]').click();await settle(page);
 const edited=await snapshot(page);near(edited.types.find(t=>t.key===target.typeKey).layers[0].t,25.4);
 const now=edited.anchors.find(([g])=>g===target.guid)[1];near(now.a[1],anchor.a[1]);near(now.b[1],anchor.b[1]);
 assert.deepEqual(edited.walls.map(w=>w.guid),initial.walls.map(w=>w.guid));assert.deepEqual(edited.openings.map(o=>[o.guid,o.wallGuid,o.width,o.height,o.sill]),initial.openings.map(o=>[o.guid,o.wallGuid,o.width,o.height,o.sill]));
 near(edited.dims[0].resolved.value,initial.dims[0].resolved.value);check('shared imperial finish edit preserves core line, persistent core dimension, hosted opening and identities');
 const beforeUndo=semantic(edited);await click(page,'[data-undo]');await settle(page);assert.notDeepEqual(semantic(await snapshot(page)),beforeUndo);await click(page,'[data-act="redo"]');await settle(page);assert.deepEqual(semantic(await snapshot(page)),beforeUndo);check('UI Undo Redo restores shared finish and end settings');
 await pick(page,target.guid);await page.locator('[data-mp-join-a]').selectOption('allow');await settle(page);check('reenabling the start restores eligible core-first cleanup',(await snapshot(page)).diagnostics.length===0);
 await frame(page,{x0:10900,y0:10400,x1:12200,y1:11800});await page.screenshot({path:path.join(out,'T-after.png')});
 const save=page.waitForEvent('download');await click(page,'[data-save]');await(await save).saveAs(path.join(out,'saved.ifc'));const saved=await snapshot(page);fs.writeFileSync(path.join(out,'expected.json'),JSON.stringify(saved));
 // A NEW context prevents independent fixture storage leakage without disabling autosave/recovery.
 const reopenedPage=await(await context()).newPage();await open(reopenedPage,path.join(out,'saved.ifc'));const reopened=await snapshot(reopenedPage);assert.deepEqual(semantic(reopened),semantic(saved));
 check('actual downloaded IFC reopens with per-end settings, neighbors, dimensions and openings');await frame(reopenedPage,{x0:10900,y0:10400,x1:12200,y1:11800});await reopenedPage.screenshot({path:path.join(out,'reopened.png')});
 const csv=reopenedPage.waitForEvent('download');await reopenedPage.locator('[data-msched-kind]').selectOption('assemblies');await click(reopenedPage,'[data-msched-csv]');await(await csv).saveAs(path.join(out,'assemblies.csv'));
 const pdf=reopenedPage.waitForEvent('download');await click(reopenedPage,'[data-model-print]');await(await pdf).saveAs(path.join(out,'plan.pdf'));check('real UI exports current assembly CSV and vector plan PDF',fs.statSync(path.join(out,'plan.pdf')).size>1000);
 // Extra enlarged export uses the same production writer, separately identified.
 const detail=await reopenedPage.evaluate(async()=>{const {planPdf}=await import('/assets/apps/bimcraft/dev/model-pdf.js');return Array.from(planPdf({...bimcraftPlan.view.scene,crop:[10900,10400,12200,11800]},{paper:'a3',units:'mm',scale:10,title:'F08-A T detail — same production vector writer'}).bytes);});fs.writeFileSync(path.join(out,'detail.pdf'),Buffer.from(detail));
 const other=await(await context()).newPage();await open(other,fixture);assert.deepEqual(semantic(await snapshot(other)),semantic(initial));check('separately opened original is unchanged in an independent browser context');
 // Fresh real server-rendered language catalogs; units are presentation state only.
 if(process.env.F08_REQUIRE_PHP==='1'){
  execFileSync('php',['-v']);report.localeChecks=[];
  for(const locale of ['es-MX','id','en-XA']){
   const p=await(await context()).newPage();await open(p,fixture,locale);
   assert.equal(await p.locator('html').getAttribute('lang'),locale);
   const catalog=JSON.parse(await p.locator('#cc-lang').textContent());
   const before=semantic(await snapshot(p));
   await frame(p,{x0:400,y0:20400,x1:5600,y1:25400});await pick(p,target.guid);
   const label=await p.locator('[data-mp-join-a] option[value="allow"]').textContent();
   assert.equal(label.trim(),catalog.strings['join.allow']);assert.notEqual(label.trim(),'join.allow');
   check(locale+': end controls use the actual language-pack catalog');
   for(const unit of ['ftin','in','ftdec','mm','cm','m']){
    await p.locator('[data-model-units]').selectOption(unit);await settle(p);
    assert.equal(await p.evaluate(()=>bimcraftPlan.state.units),unit);
    assert.equal(await p.evaluate(async()=>(await import('/assets/apps/bimcraft/dev/model-units.js')).getDisplayUnits()),unit);
    assert.deepEqual(semantic(await snapshot(p)),before);
    check(locale+'/'+unit+': global display units preserve raw geometry and persisted end settings');
   }
   await p.locator('[data-mp-join-a]').selectOption('disallow');await settle(p);
   const edited=(await snapshot(p)).walls.find(w=>w.guid===target.guid);
   assert.equal(edited.joinSettings.a.allow,false);assert.equal(edited.joinSettings.a.cap,'envelope');
   await click(p,'[data-undo]');await settle(p);assert.deepEqual(semantic(await snapshot(p)),before);
   check(locale+': translated end edit and Undo use the same raw allow/cap contract');
   report.localeChecks.push({locale,allowLabel:label.trim(),units:6,rawRecordsPreserved:true});
  }
 }else throw new Error('F08_REQUIRE_PHP=1 is required for upstream language-pack acceptance');
 // Genuine upper-level plan: through-wall outlines must use the same F08 metadata.
 const multi=await(await context()).newPage(),multiInfo=JSON.parse(fs.readFileSync('.cc-test/f08-07/multilevel-info.json'));
 await open(multi,path.resolve('.cc-test/f08-07/multilevel.ifc'));
 const upper=multi.locator('[data-pb-plan="'+multiInfo.level+'"]');await upper.focus();await upper.press('Enter');await settle(multi);
 const upperState=await snapshot(multi);assert.equal(upperState.scene.through.length,16);assert.equal(upperState.scene.walls.length,0);
 for(const row of upperState.scene.through){const expected=upperState.outlines.find(([g])=>g===row.guid)[1];assert.equal(row.poly.length,expected.length);for(let j=0;j<row.poly.length;j++)for(let k=0;k<2;k++)near(row.poly[j][k],expected[j][k]);}
 check('upper-level through drawing retains authoritative F08 core/end outlines');
 const lowOpening=upperState.openings[0],throughHost=upperState.scene.through.find(w=>w.guid===lowOpening.wallGuid);assert.equal(throughHost.pieces.length,1);
 check('upper-level cut does not inherit a lower opening cut outside its height');
 const upperSave=multi.waitForEvent('download');await click(multi,'[data-save]');await(await upperSave).saveAs(path.join(out,'multilevel-saved.ifc'));
 fs.writeFileSync(path.join(out,'multilevel-expected.json'),JSON.stringify(await snapshot(multi)));
 const again=await(await context()).newPage();await open(again,path.join(out,'multilevel-saved.ifc'));assert.deepEqual(semantic(await snapshot(again)),semantic(upperState));
 check('actual multi-level download reopens with offsets, joins, dimensions and opening identities');
 check('no application exceptions',report.errors.length===0);check('no unexpected warning/error console entries',report.console.every(m=>/bootstrap-icons|favicon/.test(m.text)));
 report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack||String(e);console.error(e);process.exitCode=1;if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});}
finally{
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log('F08_BROWSER '+JSON.stringify(report));for(const c of contexts)await c.close();await browser?.close();await new Promise(r=>server?server.close(r):r());
 if(process.env.F08_REVIEW_FRAMES==='1')for(const name of ['L-before.png','end-controls.png','T-after.png','reopened.png','failure.png'])if(fs.existsSync(path.join(out,name)))console.log('F08_IMAGE '+name+' '+fs.readFileSync(path.join(out,name)).toString('base64'));
}
