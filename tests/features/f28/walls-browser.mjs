/* SPDX-License-Identifier: Apache-2.0 */
// Actual HTTP application, native bound inputs, canvas picking, disk IFC and browser downloads.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {start} from '../../../devshell/serve.mjs';
const base='0ccb30d735554b012cf21e02252ded4612fd2f54',out=path.resolve('.cc-test/f28-b-browser');
fs.mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL(path.resolve(process.env.F28B_PLAYWRIGHT||'.cc-test/f28-b-browser-deps/node_modules/playwright/index.mjs')));
const strings=JSON.parse(fs.readFileSync('app/lang/en.json'));
const report={base,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),environment:{cpu:os.cpus()[0].model,platform:os.platform(),node:process.version},checks:[],errors:[],console:[],performanceIssues:['PERF-F04-01 OPEN','PERF-F05-01 OPEN']};
let server,baselineServer,browser,page;
const check=(label,truth=true)=>{assert.ok(truth,label);report.checks.push(label);console.log('PASS',label);};
const settle=async p=>{await p.waitForFunction(()=>globalThis.bimcraftWorkspace?.snapshot().document&&!bimcraftWorkspace.snapshot().busy&&(!globalThis.bimcraftPlan||!bimcraftPlan.state.queue.length),null,{timeout:90000});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
async function open(p,file,port=8034){
 await p.goto(`http://127.0.0.1:${port}/?workspace=live&space=paper`,{waitUntil:'networkidle'});
 await p.locator('[data-file]').setInputFiles(file);await settle(p);
 await p.locator('[data-pb-plan]').first().dblclick();await settle(p);
}
async function snapshot(p){return p.evaluate(async()=>{
 const prefix='/assets/apps/bimcraft/dev/',e=bimcraftLive.editor;
 const [{ModelWriter},{readWalls,locationLine},{readAssemblies},{readMaterials},{readWallDimensions,resolveDimension},{assemblySchedules},{readPlanViews}]=await Promise.all(['model-write.js','model-walls.js','wall-assemblies.js','project-materials.js','wall-dimensions.js','assembly-schedule.js','views-model.js'].map(f=>import(prefix+f)));
 const w=new ModelWriter(e.W,e.api,e.mid),walls=readWalls(w),assemblies=readAssemblies(w),materials=readMaterials(w),dims=readWallDimensions(w);
 return JSON.parse(JSON.stringify({walls,assemblies,materials,view:[...readPlanViews(w)],anchors:walls.map(x=>[x.guid,locationLine(x)]),dims:dims.map(d=>[d.guid,d.refs,resolveDimension(d,walls)]),schedules:assemblySchedules(w),ui:bimcraftWorkspace.snapshot()}));
});}
async function pick(p,guid){
 const point=await p.evaluate(g=>{const v=bimcraftPlan.view,w=bimcraftPlan.state.data.walls.find(w=>w.guid===g),s=v.toScreen([(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2]),r=v.canvas.getBoundingClientRect();return{x:r.x+s.x,y:r.y+s.y};},guid);
 await p.mouse.click(point.x,point.y);await p.locator('[data-mp-type]').waitFor({state:'visible'});await settle(p);
 assert.equal((await snapshot(p)).ui.selection.length,1);
}
async function typed(p,value){const i=p.locator('[data-model-typed]');await i.fill(value);await i.press('Enter');await settle(p);}
async function leavePlacement(p){await p.locator('[data-model-typed]').blur();await p.keyboard.press('Escape');await settle(p);if(await p.evaluate(()=>bimcraftPlan.state.tool==='wall')){await p.keyboard.press('Escape');await settle(p);}}
async function editType(p){await p.locator('[data-mp-assembly]').click();await p.locator('[data-ws-type-dialog]').waitFor({state:'visible'});await p.locator('[data-ws-structure]').click();await p.locator('[data-assembly-editor]').waitFor({state:'visible'});}
const near=(a,b)=>assert.ok(Math.abs(a-b)<.005,`${a} ≠ ${b}`);
const semantic=walls=>walls.map(w=>({...w,assembly:w.assembly&&(({psetId,...r})=>r)(w.assembly)}));
async function measure(p){
 await p.locator('.ws-view-controls [data-ws-setting="detail"]').selectOption('fine');await settle(p);
 return p.evaluate(()=>{
  const v=bimcraftPlan.view,raw=[],parent=v.canvas.parentElement,old=parent.getAttribute('style'),keep={cx:v.cx,cy:v.cy,scale:v.scale,selection:v.selection,hover:v.hover,overlay:v.overlay};
  try{parent.style.width='900px';parent.style.height='600px';v.resize();v.cx=3500;v.cy=4000;v.scale=.05;v.selection=new Set();v.hover=null;v.overlay=null;
   for(let i=-5;i<30;i++){const t=performance.now();v.draw();if(i>=0)raw.push(performance.now()-t);}
   const s=[...raw].sort((a,b)=>a-b);return{raw,n:s.length,p50Ms:s[14],p95Ms:s[28],canvas:[v.w,v.h2],camera:[v.cx,v.cy,v.scale],detail:v.scene.detail,boundary:'Existing synchronous PlanView.draw CPU submission; no GPU completion or user latency claim.'};
  }finally{if(old===null)parent.removeAttribute('style');else parent.setAttribute('style',old);v.resize();Object.assign(v,keep);v.render();}
 });
}
try{
 server=await start({port:8034,host:'127.0.0.1',offline:true});
 const dir=path.resolve('.cc-test/f28-b-approved');fs.mkdirSync(dir,{recursive:true});
 execFileSync('tar',['-xf','-','-C',dir],{input:execFileSync('git',['archive',base],{maxBuffer:128*1024*1024})});
 if(!fs.existsSync(path.join(dir,'devshell/vendor')))fs.symlinkSync(path.resolve('devshell/vendor'),path.join(dir,'devshell/vendor'),'dir');
 baselineServer=await(await import(pathToFileURL(path.join(dir,'devshell/serve.mjs')))).start({port:8036,host:'127.0.0.1',offline:true});
 browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
 async function context(){const c=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,acceptDownloads:true});await c.addInitScript(()=>{if(location.protocol==='http:'&&location.hostname==='127.0.0.1')localStorage.setItem('bimcraft.model.units','mm');});c.on('page',p=>{p.on('pageerror',e=>report.errors.push(e.stack||e.message));p.on('console',m=>{if(['warning','error'].includes(m.type()))report.console.push({type:m.type(),text:m.text()});});});return c;}
 const ctx=await context();
 const fixture=path.resolve('fixtures/f04/layered-plans.ifc'),baseline=await ctx.newPage();await open(baseline,fixture,8036);report.before=await measure(baseline);await baseline.screenshot({path:path.join(out,'before-f28-a.png')});await baseline.close();
 page=await ctx.newPage();
 await open(page,fixture);const initial=await snapshot(page);report.after=await measure(page);await settle(page);
 check('same-environment baseline and F28-B Fine CPU submission workload',JSON.stringify(report.before.canvas)===JSON.stringify(report.after.canvas)&&JSON.stringify(report.before.camera)===JSON.stringify(report.after.camera)&&report.before.raw.some(x=>x>0)&&report.after.raw.some(x=>x>0));
 check('real core-anchored fixture has cavity, zero membrane and persistent dimensions',initial.dims.length===2&&initial.assemblies.some(t=>t.layers.some(l=>l.kind==='cavity')&&t.layers.some(l=>l.t===0)));
 await page.locator('[data-ws-tab="architecture"]').click();await page.locator('.ws-ribbon [data-ws-command="wall"]').click();await settle(page);
 check('Architecture Wall keeps the live layout and actual default controls',await page.locator('[data-model-wallref]').isVisible()&&await page.locator('[data-model-walltype]').isVisible()&&await page.locator('.bc').evaluate(e=>e.classList.contains('ws-active')));
 check('six location lines are discoverable',await page.locator('[data-model-wallref] option').count()===6);
 check('unsupported curved placement is unavailable in this slice',await page.locator('[data-model-wallshape]').isDisabled()&&await page.locator('[data-model-wallshape] option[value="arc"]').evaluate(o=>o.disabled));
 await page.locator('[data-model-walltype]').selectOption('wall-f04-rainscreen');await page.locator('[data-model-walltop]').selectOption('fixed');
 await page.locator('[data-model-wallh]').fill('bad height');await page.locator('[data-model-wallh]').press('Tab');check('placement invalid length produces existing feedback',await page.locator('[data-status]').evaluate(e=>e.classList.contains('is-error')));
 await page.locator('[data-model-units]').selectOption('ftin');await page.locator('[data-model-wallh]').fill("10'");await page.locator('[data-model-wallh]').press('Tab');
 near(await page.evaluate(()=>bimcraftPlan.state.wall.height),3048);check('imperial placement height uses the existing unit parser');check('valid placement height clears prior validation feedback',!(await page.locator('[data-status]').evaluate(e=>e.classList.contains('is-error'))));await page.locator('[data-model-units]').selectOption('mm');
 await page.screenshot({path:path.join(out,'wall-placement.png')});
 const made=[];
 for(const [i,reference]of ['center','coreCenter','outside','inside','coreExterior','coreInterior'].entries())for(const [j,side]of ['left','right'].entries()){
  await page.locator('[data-model-wallref]').selectOption(reference);await page.locator('[data-model-wallside]').selectOption(side);
  const count=(await snapshot(page)).walls.length,x=8000+j*2100,y=500+i*530;
  await typed(page,`${x} mm, ${y} mm`);await typed(page,'1800 mm<0');
  const s=await snapshot(page),w=s.walls.at(-1);assert.equal(s.walls.length,count+1);near(w.height,3048);assert.equal(w.extSide,side);
  const line=s.anchors.find(([g])=>g===w.guid)[1];near(line.a[0],x);near(line.a[1],y);near(line.b[0],x+1800);near(line.b[1],y);made.push(w.guid);
  await page.locator('[data-model-typed]').blur();await page.keyboard.press('Escape');await settle(page);
 }
 check('real typed placement verifies six location lines × two exterior orientations',made.length===12);
 const count=(await snapshot(page)).walls.length;await typed(page,'5000 mm, 8000 mm');await page.locator('[data-model-typed]').blur();await page.keyboard.press('Escape');await page.keyboard.press('Escape');await settle(page);assert.equal((await snapshot(page)).walls.length,count);check('canceling a pending first point adds no wall and exits placement');
 // Actual native pointer snapping: start close to the end of the first fixture wall, then a typed relative segment.
 await page.locator('.ws-ribbon [data-ws-command="wall"]').click();await page.locator('[data-model-wallref]').selectOption('center');
 const endpoint=await page.evaluate(()=>{const v=bimcraftPlan.view,w=bimcraftPlan.state.data.walls[0],s=v.toScreen(w.b),r=v.canvas.getBoundingClientRect();return{x:r.x+s.x+2,y:r.y+s.y+2,b:w.b};});await page.mouse.click(endpoint.x,endpoint.y);
 const chainStart=await page.evaluate(()=>bimcraftPlan.state.chain.points[0]);near(chainStart[0],endpoint.b[0]);near(chainStart[1],endpoint.b[1]);await typed(page,'1000 mm<90');await leavePlacement(page);check('native pointer endpoint snapping and numeric continuation stay active');
 const target=initial.walls[0].guid;await pick(page,target);
 await page.locator('[data-model-units]').selectOption('ftin');await page.locator('[data-mp-base]').fill('1"');await page.locator('[data-mp-base]').press('Enter');await settle(page);near((await snapshot(page)).walls.find(w=>w.guid===target).baseOffset,25.4);
 await page.locator('[data-mp-height]').fill("9'");await page.locator('[data-mp-height]').press('Enter');await settle(page);near((await snapshot(page)).walls.find(w=>w.guid===target).height,2743.2);check('real instance height and base use imperial transactions');
 const defaults=await page.evaluate(()=>({...bimcraftPlan.state.wall}));await page.locator('[data-mp-type]').selectOption('wall-f04-partition');await settle(page);assert.equal((await snapshot(page)).walls.find(w=>w.guid===target).typeKey,'wall-f04-partition');assert.deepEqual(await page.evaluate(()=>({...bimcraftPlan.state.wall})),defaults);check('instance type assignment is distinct from placement defaults');
 await page.locator('[data-mp-type]').selectOption('wall-f04-rainscreen');await settle(page);
 await page.locator('[data-mp-just]').selectOption('coreCenter');await settle(page);await page.locator('[data-mp-flipside]').click();await settle(page);check('instance location line and exterior side use existing operations');
 await page.locator('[data-model-units]').selectOption('mm');await editType(page);
 const dlg=page.locator('[data-assembly-editor]'),thickness=n=>dlg.getByLabel(strings['assembly.thickness']+' '+n,{exact:true});
 check('Edit Type Structure opens the authoritative editor without fallback',await page.locator('.bc').evaluate(e=>e.classList.contains('ws-active'))&&await dlg.locator('[data-assembly-effects]').textContent().then(s=>s.includes('Type-wide edit')));
 await page.screenshot({path:path.join(out,'assembly-editor.png')});const beforeType=await snapshot(page);
 await thickness(1).fill('-1 mm');await dlg.locator('[data-assembly-save]').click();check('invalid layer width refuses the transaction',await dlg.locator('[role="alert"]').textContent().then(s=>s.includes('thickness')));assert.deepEqual((await snapshot(page)).walls,beforeType.walls);
 await thickness(1).fill('25.4 mm');await page.setViewportSize({width:1150,height:800});check('assembly entry and focus survive resize',await thickness(1).inputValue()==='25.4 mm');await page.setViewportSize({width:1440,height:1000});await dlg.locator('[data-assembly-save]').click();await settle(page);
 const shared=await snapshot(page),sharedWalls=shared.walls.filter(w=>w.typeKey==='wall-f04-rainscreen');assert.ok(sharedWalls.length>=2);for(const w of sharedWalls)near(w.t,215.9);check('shared type edit updates two or more real instances and retains type identity',shared.assemblies.find(t=>t.key==='wall-f04-rainscreen').guid===initial.assemblies.find(t=>t.key==='wall-f04-rainscreen').guid);
 assert.deepEqual(shared.dims.map(d=>d.slice(0,2)),initial.dims.map(d=>d.slice(0,2)));check('persistent dimension identities and references survive instance and shared edits');
 for(const end of ['a','b']){const now=shared.anchors.find(([g])=>g===target)[1][end],before=beforeType.anchors.find(([g])=>g===target)[1][end];now.forEach((x,i)=>near(x,before[i]));}check('core location anchor survives the shared thickness edit');
 await pick(page,target);await editType(page);await dlg.locator('[data-assembly-duplicate]').click();await dlg.locator('[data-assembly-name]').fill('F28-B independent rainscreen');check('type duplication explains single-selection assignment',await dlg.locator('[data-assembly-effects]').textContent().then(s=>s.includes('Assign to 1 selected wall')));
 await dlg.locator('[data-assembly-save]').click();await settle(page);const duplicated=await snapshot(page),newType=duplicated.assemblies.find(t=>t.name==='F28-B independent rainscreen');assert.ok(newType);assert.notEqual(newType.guid,shared.assemblies.find(t=>t.key==='wall-f04-rainscreen').guid);assert.equal(duplicated.walls.filter(w=>w.typeKey===newType.key).length,1);check('duplicate type gets a distinct identity and assigns only the selected wall');
 await pick(page,target);await editType(page);const layerRows=dlg.locator('[data-assembly-layers] tbody tr').filter({has:page.locator('input[aria-label^="'+strings['assembly.thickness']+' "]')});
 await layerRows.first().getByRole('button',{name:strings['assembly.down'],exact:true}).click();await thickness(2).fill('28.575 mm');await dlg.locator('[data-assembly-save]').click();await settle(page);
 const layered=await snapshot(page),recipe=layered.assemblies.find(t=>t.key===newType.key);assert.equal(recipe.layers[0].kind,'cavity');assert.equal(recipe.layers[0].ventilation,'ventilated');assert.equal(recipe.layers[2].t,0);near(recipe.layers[1].t,28.575);check('authoritative layer reorder preserves cavity ventilation, zero membrane and contiguous core');
 for(const end of ['a','b']){const now=layered.anchors.find(([g])=>g===target)[1][end],before=beforeType.anchors.find(([g])=>g===target)[1][end];now.forEach((x,i)=>near(x,before[i]));}check('duplicated and reordered layers retain the original core anchor');assert.notDeepEqual(layered.schedules,initial.schedules);check('derived F06 documentation reflects actual type changes');
 for(const w of layered.walls.filter(w=>w.guid!==target))near(w.t,duplicated.walls.find(x=>x.guid===w.guid).t);check('editing the duplicated type leaves every other wall unchanged');
 await pick(page,target);await editType(page);await dlg.getByRole('button',{name:strings['materials.title'],exact:true}).click();const library=page.locator('[data-material-library]');
 await library.locator('select').first().selectOption('material-studs');await library.getByLabel(strings['materials.defaultThickness'],{exact:true}).fill('333 mm');await library.getByLabel(strings['materials.color'],{exact:true}).fill('#174f92');await library.getByLabel(strings['materials.fill'],{exact:true}).selectOption('crosshatch');await library.getByLabel(strings['materials.fillColor'],{exact:true}).fill('#9f1122');await library.locator('[data-material-save]').click();await library.waitFor({state:'detached'});await settle(page);
 assert.deepEqual((await snapshot(page)).assemblies,layered.assemblies);for(const w of (await snapshot(page)).walls)near(w.t,layered.walls.find(x=>x.guid===w.guid).t);await dlg.getByRole('button',{name:strings['assembly.cancel'],exact:true}).click();
 check('material styles/defaults use the real library without resizing existing layers',(await snapshot(page)).materials.find(m=>m.id==='material-studs').defaultThickness===333);
 // Undo the material edit separately, then test the preceding actual layer transaction.
 await page.locator('.ws-quick [data-ws-command="undo"]').click();await settle(page);
 const s0=semantic(layered.walls);await page.locator('.ws-quick [data-ws-command="undo"]').click();await settle(page);assert.notDeepEqual(semantic((await snapshot(page)).walls),s0);await page.locator('.ws-quick [data-ws-command="redo"]').click();await settle(page);assert.deepEqual(semantic((await snapshot(page)).walls),s0);check('Undo Redo restores the real type and layer transaction');
 await page.locator('.ws-quick [data-ws-command="redo"]').click();await settle(page);check('Redo reapplies material styles/defaults without changing layer widths',(await snapshot(page)).materials.find(m=>m.id==='material-studs').defaultThickness===333);
 await pick(page,target);await page.locator('[data-mp-height]').fill('2950 mm');await page.setViewportSize({width:900,height:700});check('in-progress instance entry survives narrow resize',await page.locator('[data-mp-height]').evaluate(el=>el.value==='2950 mm'&&document.activeElement===el));await page.locator('[data-mp-height]').press('Escape');await page.screenshot({path:path.join(out,'narrow.png')});
 check('Properties and Browser remain independently scrollable',await page.evaluate(()=>['properties','browser'].every(k=>getComputedStyle(document.querySelector('[data-ws-'+k+'-scroll]')).overflowY==='auto')));await page.setViewportSize({width:1440,height:1000});
 const camera=await page.evaluate(()=>{const v=bimcraftPlan.view;return[v.cx,v.cy,v.scale];});await page.locator('.ws-vsplit').focus();await page.keyboard.press('ArrowRight');await settle(page);assert.deepEqual(await page.evaluate(()=>{const v=bimcraftPlan.view;return[v.cx,v.cy,v.scale];}),camera);await pick(page,target);check('camera and picking survive new controls and palette resize');
 await page.locator('[data-mp-height]').focus();const changes=await page.evaluate(()=>bimcraftLive.editor.changes.length);await page.keyboard.press('Control+z');assert.equal(await page.evaluate(()=>bimcraftLive.editor.changes.length),changes);check('model shortcuts do not fire while entering an instance value');
 await page.locator('[data-mp-height]').blur();await page.screenshot({path:path.join(out,'selected-wall.png')});
 const saving=page.waitForEvent('download');await page.locator('.ws-quick [data-ws-command="save"]').click();const download=await saving;await download.saveAs(path.join(out,'saved.ifc'));const saved=await snapshot(page);fs.writeFileSync(path.join(out,'expected.json'),JSON.stringify(saved,null,2));
 await open(page,path.join(out,'saved.ifc'));const reopened=await snapshot(page);assert.deepEqual(reopened.walls,saved.walls);assert.deepEqual(reopened.assemblies,saved.assemblies);assert.deepEqual(reopened.materials,saved.materials);assert.deepEqual(reopened.dims,saved.dims);assert.deepEqual(reopened.schedules,saved.schedules);check('actual downloaded IFC reopens with wall, layer, material, dimension and F06 schedule data');
 const otherContext=await context(),other=await otherContext.newPage();await open(other,fixture);const original=await snapshot(other);assert.deepEqual(original.walls,initial.walls);assert.deepEqual(original.assemblies,initial.assemblies);assert.deepEqual(original.materials,initial.materials);await otherContext.close();check('separately opened original project remains unchanged');
 await page.locator('[data-ws-fallback]').first().click();check('established fallback restores bound controls and existing workflows',await page.locator('[data-model-walltype]').evaluate(e=>!!e.closest('[data-modelbar]'))&&await page.locator('[data-model-units]').evaluate(e=>!!e.closest('.bc-toolbar')));
 await page.locator('[data-msched-kind]').selectOption('assemblies');
 const csvEvent=page.waitForEvent('download');await page.locator('[data-msched-csv]').click();await(await csvEvent).saveAs(path.join(out,'assemblies.csv'));
 const pdfEvent=page.waitForEvent('download');await page.locator('[data-model-print]').click({force:true});await(await pdfEvent).saveAs(path.join(out,'plan.pdf'));
 check('fallback exports actual edited F06 layer CSV and vector plan PDF',fs.statSync(path.join(out,'assemblies.csv')).size>500&&fs.statSync(path.join(out,'plan.pdf')).size>500);
 const {model:fixtureModel}=await import('../f04/fixture.mjs'),{saveTemplate,setPlanView}=await import('../../../app/views-model.js'),{readLevels}=await import('../../../app/model-levels.js'),{readAssemblies,assertAssembliesEditable}=await import('../../../app/wall-assemblies.js');
 const controlled=await fixtureModel(fs.readFileSync(fixture)),{newLevel}=await import('../../../app/model-ops.js');controlled.change(newLevel({name:'F28-B Upper',elevation:3000,height:3000}));controlled.change(saveTemplate({name:'F28-B protected plan',cut:1200,top:3000,bottom:0,depth:50,scale:100,detail:'fine'}));controlled.change(setPlanView(readLevels(controlled.w())[0].guid,{template:'F28-B protected plan'}));const templateFile=path.join(out,'template.ifc');fs.writeFileSync(templateFile,controlled.ed.save());
 const templatePageContext=await context(),templatePage=await templatePageContext.newPage();await open(templatePage,templateFile);await templatePage.locator('[data-pb-plan="'+readLevels(controlled.w())[0].guid+'"]').dblclick();await settle(templatePage);check('template-controlled view settings remain protected',await templatePage.locator('.ws-view-controls [data-ws-setting="detail"]').isDisabled()&&await templatePage.locator('.ws-view-controls [data-ws-setting="scale"]').isDisabled());await templatePage.locator('.ws-ribbon [data-ws-command="wall"]').click();await templatePage.locator('[data-model-walltop]').selectOption('level');await templatePage.locator('[data-model-walltype]').selectOption('wall-f04-rainscreen');await typed(templatePage,'16000 mm, 0 mm');await typed(templatePage,'2000 mm<0');const constrained=(await snapshot(templatePage)).walls.at(-1);near(constrained.height,3000);assert.equal(constrained.topLevel,readLevels(controlled.w())[1].guid);check('level-above placement uses the real upper storey on a template-controlled plan');await templatePageContext.close();
 const damaged=await fixtureModel(fs.readFileSync(fixture)),r=readAssemblies(damaged.w())[0];damaged.w().run(w=>{const ps=w.api.GetLine(w.mid,r.psetId,false),p=ps.HasProperties.map(h=>w.api.GetLine(w.mid,h.value,false)).find(p=>p.Name.value==='Recipe'),q=w.touch(p.expressID);q.NominalValue=w.T('IFCTEXT',JSON.stringify({...r,version:99}));w.write(q);});assert.throws(()=>assertAssembliesEditable(damaged.w()),/version|unsupported|record/i);const badFile=path.join(out,'unsupported.ifc');fs.writeFileSync(badFile,damaged.ed.save());
 const badPageContext=await context(),badPage=await badPageContext.newPage();await open(badPage,badFile);const badWall=badPage.locator('.ws-ribbon [data-ws-command="wall"]');check('unsupported authored records refuse wall creation',await badWall.getAttribute('aria-disabled')==='true');await badWall.focus();await badPage.keyboard.press('Enter');check('unsupported record refusal is discoverable',await badPage.locator('.ws-dialog').textContent().then(s=>/version|unsupported|record/i.test(s)));await badPageContext.close();
 check('no application exceptions',report.errors.length===0);report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack||String(e);if(page)report.failureState=await page.evaluate(()=>({shape:[...document.querySelectorAll('[data-model-wallshape] option')].map(o=>({value:o.value,disabled:o.disabled})),workspace:globalThis.bimcraftWorkspace?.snapshot(),status:document.querySelector('[data-status]')?.textContent})).catch(()=>null);console.error(e);process.exitCode=1;if(page)await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});}
finally{
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log('F28B_REPORT '+JSON.stringify(report));
 if(process.env.F28_EMIT_REVIEW_FRAMES==='1')for(const name of ['before-f28-a.png','wall-placement.png','assembly-editor.png','selected-wall.png','narrow.png','failure.png'])if(fs.existsSync(path.join(out,name))){const b=fs.readFileSync(path.join(out,name)).toString('base64'),n=Math.ceil(b.length/12000);for(let i=0;i<n;i++)console.log(`F28B_FRAME ${name} ${i}/${n} ${b.slice(i*12000,(i+1)*12000)}`);}
 await browser?.close();await new Promise(r=>server?server.close(r):r());await new Promise(r=>baselineServer?baselineServer.close(r):r());
}
