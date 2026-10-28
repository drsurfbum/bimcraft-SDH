/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { start } from '../../../devshell/serve.mjs';
import { createLiveServer } from '../../tools/mcp/live-server.mjs';
import { initialized, tool } from '../mcp01/client.mjs';
import { workflow } from './semantic.mjs';
import { model } from '../f04/fixture.mjs';
import { readWalls } from '../../../app/model-walls.js';
import { readOpenings } from '../../../app/model-openings.js';
import { WALL_REFERENCES, referencePoint } from '../../../app/wall-dimensions.js';
const out=path.resolve('.cc-test/f09-browser');fs.mkdirSync(out,{recursive:true});
const {chromium}=await import(pathToFileURL(path.resolve(process.env.F09_PLAYWRIGHT||'.cc-test/f09-deps/node_modules/playwright/index.mjs')));
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),checks:[],errors:[]};
const check=s=>{report.checks.push(s);console.log('PASS',s);};
const fixture=path.resolve('fixtures/f04/layered-plans.ifc');
const m=await model(),walls=readWalls(m.w()),target=walls[0],other=walls.findLast(w=>!w.bulge&&!readOpenings(m.w()).some(o=>o.wallGuid===w.guid));
const expected=Object.fromEntries(WALL_REFERENCES.map(reference=>[reference,referencePoint({wall:target.guid,reference,station:.3728282828},walls)]));
let app,browser,live,lastPage;
const settle=async page=>{await page.waitForFunction(()=>globalThis.bimcraftLive?.editor&&!bimcraftWorkspace.snapshot().busy&&(!globalThis.bimcraftPlan||!bimcraftPlan.state.reloading&&!bimcraftPlan.state.busy&&!bimcraftPlan.state.queue.length),null,{timeout:90000});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
const state=page=>page.evaluate(()=>({tool:bimcraftPlan.state.tool,changes:bimcraftLive.editor.changes.length,selection:bimcraftWorkspace.snapshot().selection}));
function assertModelNear(actual,expected){
 for(const name of ['walls','openings','dimensions']){
  const sort=rows=>[...rows].sort((a,b)=>a.guid.localeCompare(b.guid));const a=sort(actual[name]),e=sort(expected[name]);assert.equal(a.length,e.length);
  for(let j=0;j<a.length;j++){const left={...a[j]},right={...e[j]};for(const field of name==='walls'?['a','b']:name==='openings'?['offset']:[]){
   const x=Array.isArray(left[field])?left[field]:[left[field]],y=Array.isArray(right[field])?right[field]:[right[field]];
   x.forEach((v,i)=>assert.ok(Math.abs(v-y[i])<.005,field+' exceeds precision bound'));delete left[field];delete right[field];
  }assert.deepEqual(left,right);}
 }
}
async function inspect(page){return page.evaluate(async()=>{
 const base='/assets/apps/bimcraft/dev/',ed=bimcraftLive.editor;
 const [{ModelWriter},{readWalls},{readOpenings},{readWallDimensions}]=await Promise.all(['model-write.js','model-walls.js','model-openings.js','wall-dimensions.js'].map(f=>import(base+f)));
 const w=new ModelWriter(ed.W,ed.api,ed.mid);
 return {walls:readWalls(w).map(x=>({guid:x.guid,a:x.a,b:x.b,extSide:x.extSide,justification:x.justification,typeKey:x.typeKey})),
 openings:readOpenings(w).map(x=>({guid:x.guid,wallGuid:x.wallGuid,offset:x.offset,face:x.face})),dimensions:readWallDimensions(w).map(x=>({guid:x.guid,refs:x.refs}))};
});}
async function exportExpected(page,wall,file){const snapshot=await inspect(page),w=snapshot.walls.find(w=>w.guid===wall);
 const dimensions=await page.evaluate(async()=>{const base='/assets/apps/bimcraft/dev/',e=bimcraftLive.editor;const [{ModelWriter},{readWalls},{readWallDimensions,resolveDimension}]=await Promise.all(['model-write.js','model-walls.js','wall-dimensions.js'].map(f=>import(base+f)));const m=new ModelWriter(e.W,e.api,e.mid),walls=readWalls(m);return readWallDimensions(m).map(d=>({...d,...resolveDimension(d,walls)}));});
 fs.writeFileSync(file,JSON.stringify({wall,a:w.a,b:w.b,openings:snapshot.openings.map(o=>o.guid),hosts:snapshot.openings,dimensions}));
}
async function point(page,p){return page.evaluate(p=>{const v=bimcraftPlan.view,s=v.toScreen(p),r=v.canvas.getBoundingClientRect();return {x:r.x+s.x,y:r.y+s.y};},p);}
async function backgroundMenu(page){const r=await page.locator('[data-plan-canvas]').boundingBox();await page.mouse.click(r.x+r.width-35,r.y+35,{button:'right'});}
async function clickPlan(page,p,options){const q=await point(page,p);await page.mouse.click(q.x,q.y,options);}
async function open(page,layout){await page.goto('http://127.0.0.1:8061/?space=paper'+(layout?'&workspace=live':''),{waitUntil:'networkidle'});await page.locator('[data-file]').setInputFiles(fixture);await settle(page);if(layout)await page.locator('[data-pb-plan]').first().dblclick();else if(await page.locator('[data-model-toggle]').getAttribute('aria-pressed')!=='true')await page.locator('[data-model-toggle]').click();await settle(page);await page.evaluate(()=>{bimcraftPlan.state.layout='plan';document.querySelector('[data-model-layout="plan"]')?.click();bimcraftPlan.view.fit();});}
try{
 app=await start({port:8061,host:'127.0.0.1',offline:true});browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
 for(const layout of [false,true]){
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true}),page=await context.newPage();lastPage=page;page.on('pageerror',e=>report.errors.push(e.stack||e.message));
  await open(page,layout);await page.waitForFunction(()=>!!window.ccInput);await page.locator('[data-palette-open]').click();await page.locator('[data-f09-palette]').waitFor();await page.locator('[data-f09-palette] input').fill('Wall');assert.ok(await page.locator('[data-f09-palette-command="input:model.wall"]').isVisible());const paletteHistory=(await state(page)).changes;await page.locator('[data-f09-palette-command="input:model.wall"]').click();await settle(page);assert.equal((await state(page)).tool,'wall');assert.equal((await state(page)).changes,paletteHistory);await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('Escape');await page.evaluate(()=>{window.__f09Events=[];for(const phase of [true,false])window.addEventListener('keydown',e=>{__f09Events.push({key:e.key,shift:e.shiftKey,prevented:e.defaultPrevented,target:e.target.tagName,phase});if(__f09Events.length>40)__f09Events.shift();},phase);});assert.equal(await page.evaluate(()=>ccInput.current().id),'cadcraft');assert.equal(await page.evaluate(()=>ccInput.commands.filter(c=>c.mount).every(c=>document.querySelector(c.sel))),true);
  await page.locator('[data-f09-shortcuts]').click();await page.locator('[data-f09-use-ribbon]').click();
  await page.evaluate(()=>{window.__f09WallStarts=0;document.querySelector('[data-mtool="wall"]').addEventListener('click',()=>__f09WallStarts++);});
  await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('w');assert.equal((await state(page)).tool,'select');await page.keyboard.press('a');await settle(page);assert.equal((await state(page)).tool,'wall');assert.equal(await page.evaluate(()=>__f09WallStarts),1);
  await page.keyboard.press('Escape');await page.keyboard.press('Escape');await settle(page);
  await page.keyboard.press('w');await page.keyboard.press('Escape');await page.keyboard.press('n');assert.equal((await state(page)).tool,'select');
  await page.keyboard.press('w');await page.waitForTimeout(1600);await page.keyboard.press('a');assert.equal((await state(page)).tool,'select');
  await page.keyboard.press('w');await page.locator('[data-f09-target]').focus();await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('n');assert.equal((await state(page)).tool,'select');
  await page.evaluate(()=>{ccInput.setStyle('cadcraft');});
  const box=await page.locator('[data-plan-canvas]').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down({button:'right'});await page.mouse.move(box.x+box.width/2+40,box.y+box.height/2+20,{steps:4});await page.mouse.up({button:'right'});assert.equal(await page.locator('[data-f09-menu]').count(),0);
  await page.evaluate(()=>{ccInput.setStyle('ribbon');bimcraftPlan.view.fit();});
  check((layout?'workspace':'established')+': right-button pan does not open a menu; WA executes once; Escape, 1.5s timeout and focus changes clear prefixes');
  // Native text Undo: use real typing (fill() does not establish native undo history).
  await clickPlan(page,[(target.a[0]+target.b[0])/2,0]);await settle(page);
  const height=page.locator('[data-mp-height]');await height.waitFor({state:'visible'});await height.focus();const before=await state(page),original=await height.inputValue();
  await height.press('ControlOrMeta+A');await page.keyboard.insertText('3100');await height.press('ControlOrMeta+z');assert.equal(await height.inputValue(),original);assert.equal((await state(page)).changes,before.changes);
  await height.press('ControlOrMeta+A');await page.keyboard.insertText('3100');await clickPlan(page,[(other.a[0]+other.b[0])/2,other.a[1]],{button:'right'});assert.equal(await page.locator('[data-f09-menu]').count(),0);assert.equal((await state(page)).changes,before.changes);assert.equal(await height.inputValue(),'3100');
  await height.press('Escape');await page.locator('[data-plan-canvas]').focus();check('native Properties text Undo retains model history in '+(layout?'workspace':'established'));
  // Opening does not select the pointed wall or change history; stale selection is refused.
  await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('w');await page.keyboard.press('a');await settle(page);
  const unitControl=page.locator('[data-model-units]'),unitValues=await unitControl.locator('option').evaluateAll(options=>options.map(o=>o.value));assert.equal(unitValues.length,6);assert.ok(await unitControl.isVisible());assert.ok(await unitControl.isEnabled());const beforeUnits=await inspect(page);for(const unit of unitValues){await unitControl.selectOption(unit);assertModelNear(await inspect(page),beforeUnits);}await unitControl.selectOption('mm');await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('Escape');await settle(page);
  const beforeMenu=await state(page);await clickPlan(page,[(other.a[0]+other.b[0])/2,other.a[1]],{button:'right'});await page.locator('[data-f09-menu]').waitFor();assert.deepEqual(await state(page),beforeMenu);
  await page.locator('[data-f09-menu] button').first().click();await settle(page);assert.notDeepEqual((await state(page)).selection,beforeMenu.selection);assert.equal((await state(page)).changes,beforeMenu.changes);
  await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('ContextMenu');await page.locator('[data-f09-menu]').waitFor();await page.keyboard.press('Escape');await page.keyboard.press('Shift+F10');await page.locator('[data-f09-menu]').waitFor();await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');assert.equal(await page.locator('[data-f09-menu]').count(),0);
  await backgroundMenu(page);await page.locator('[data-f09-menu]').waitFor();await page.evaluate(()=>ccInput.run('edit.select-none'));const afterHuman=await state(page);await page.locator('[data-f09-menu] button').first().click();assert.deepEqual(await state(page),afterHuman);
  check('context menu preserves selection/history; keyboard navigation and stale-context refusal in '+(layout?'workspace':'established'));
  // Explicit core vs finish targeting and cancellation; numeric continuation retains the existing operation.
  await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('w');await page.keyboard.press('a');await settle(page);
  for(const reference of ['coreExterior','exterior']){
    await page.locator('[data-f09-target]').selectOption(reference);
    const p=referencePoint({wall:target.guid,reference,station:.5},walls),q=await point(page,[p[0],p[1]+.000123]);await page.mouse.move(q.x,q.y);
    await page.waitForFunction(()=>document.querySelector('[data-f09-feedback]').textContent.includes('analytic'));
    assert.ok((await page.locator('[data-f09-feedback]').innerText()).includes(reference==='exterior'?'Finish face: exterior':'Core face: exterior'));
    const count=(await state(page)).changes;await page.mouse.click(q.x,q.y);const start=await page.evaluate(()=>bimcraftPlan.state.chain?.points[0]);for(let i=0;i<2;i++)assert.ok(Math.abs(start[i]-p[i])<.005);
    assert.equal((await state(page)).changes,count);
    if(reference==='coreExterior'){
      const typed=page.locator('[data-model-typed]');await typed.fill('1200.123456 mm<45');await typed.press('Enter');await settle(page);
      const placed=(await inspect(page)).walls.at(-1);for(let i=0;i<2;i++)assert.ok(Math.abs(placed.a[i]-p[i])<.005);
      await typed.blur();await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('ControlOrMeta+z');await settle(page);assert.ok(!(await inspect(page)).walls.some(w=>w.guid===placed.guid));
      await page.keyboard.press('ControlOrMeta+Shift+z');await settle(page);assert.ok((await inspect(page)).walls.some(w=>w.guid===placed.guid));
      await page.keyboard.press('ControlOrMeta+z');await settle(page);
      // Undo clears pending placement through the existing rebuild path; restart the supported tool explicitly.
      await page.locator('[data-mtool="wall"]').click();await settle(page);
    }
    await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('Escape');
  }
  const count=(await state(page)).changes;await backgroundMenu(page);await page.locator('[data-f09-menu] button').first().click();assert.equal((await state(page)).tool,'select');assert.equal((await state(page)).changes,count);
  // Do not steal native context menus in fields.
  await page.locator('[data-f09-target]').click({button:'right'});assert.equal(await page.locator('[data-f09-menu]').count(),0);
  if(!layout){await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('d');await page.keyboard.press('i');assert.equal((await state(page)).tool,'wallDimension');assert.equal(await page.locator('[data-mopts="wallDimension"] select').nth(1).inputValue(),'aligned');await page.keyboard.press('Escape');}
  check('explicit analytic core/finish preview and cancellation; DI semantics and native field menus in '+(layout?'workspace':'established'));
  // A native midpoint grip consumes the same explicit reference as the semantic resolver.
  await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('Escape');await page.keyboard.press('Escape');await settle(page);
  await clickPlan(page,[(target.a[0]+target.b[0])/2,target.a[1]]);await settle(page);
  const beforeGrip=await inspect(page),sourceWall=beforeGrip.walls.find(w=>w.guid===target.guid),destination=referencePoint({wall:walls[1].guid,reference:'coreExterior',station:.5},walls);
  await page.locator('[data-f09-target]').selectOption('coreExterior');const grip=await point(page,[(sourceWall.a[0]+sourceWall.b[0])/2,(sourceWall.a[1]+sourceWall.b[1])/2]),to=await point(page,destination);
  await page.mouse.move(grip.x,grip.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:5});await page.keyboard.press('Escape');await page.mouse.up();await settle(page);assertModelNear(await inspect(page),beforeGrip);
  await page.locator('[data-f09-target]').selectOption('coreExterior');await page.mouse.move(grip.x,grip.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:5});await page.mouse.up();await settle(page);
  const afterGrip=await inspect(page),movedWall=afterGrip.walls.find(w=>w.guid===target.guid),expectedDelta=destination.map((x,i)=>x-(sourceWall.a[i]+sourceWall.b[i])/2);
  for(let i=0;i<2;i++){assert.ok(Math.abs(movedWall.a[i]-sourceWall.a[i]-expectedDelta[i])<.005);assert.ok(Math.abs(movedWall.b[i]-sourceWall.b[i]-expectedDelta[i])<.005);}
  assert.equal(movedWall.extSide,sourceWall.extSide);assert.equal(movedWall.justification,sourceWall.justification);assert.equal(movedWall.typeKey,sourceWall.typeKey);
  assert.deepEqual(afterGrip.openings,beforeGrip.openings);assert.deepEqual(afterGrip.dimensions,beforeGrip.dimensions);
  await page.locator('[data-plan-canvas]').focus();await page.keyboard.press('ControlOrMeta+z');await settle(page);assertModelNear(await inspect(page),beforeGrip);
  await page.keyboard.press('ControlOrMeta+Shift+z');await settle(page);assertModelNear(await inspect(page),afterGrip);
  const savedEvent=page.waitForEvent('download'),saving=page.evaluate(()=>ccInput.run('file.save'));await(await savedEvent).saveAs(path.join(out,layout?'workspace-saved.ifc':'established-saved.ifc'));await saving;
  await exportExpected(page,target.guid,path.join(out,layout?'workspace-expected-private.json':'established-expected-private.json'));
  await page.locator('[data-file]').setInputFiles(path.join(out,layout?'workspace-saved.ifc':'established-saved.ifc'));await settle(page);assert.deepEqual(await inspect(page),afterGrip);
  check('native explicit placement/grip commit, cancellation, host/orientation/reference identity, Undo/Redo and actual save/reopen in '+(layout?'workspace':'established'));
  if(layout)await page.locator('[data-pb-plan]').first().dblclick();else if(await page.locator('[data-model-toggle]').getAttribute('aria-pressed')!=='true')await page.locator('[data-model-toggle]').click();await settle(page);
  await page.locator('[data-f09-target]').selectOption('coreExterior');const demoPoint=await point(page,destination);await page.mouse.move(demoPoint.x,demoPoint.y);const demoChoice=page.locator('[data-f09-candidates]');if(await demoChoice.isVisible())await demoChoice.selectOption(walls[1].guid+':mid:0.5');
  await page.screenshot({path:path.join(out,layout?'workspace.png':'established.png')});
  if(layout){
    await open(page,true);
    await page.evaluate(async()=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');getHost({app:'bimcraft'}).control.configure({enabled:true,groups:['read','edit','save'],version:'0.7.0-mcp01.1'});});
    live=createLiveServer({port:0,forward:(message,session)=>page.evaluate(async({message,sid})=>{const {getHost}=await import('/assets/apps/bimcraft/dev/host.js');return getHost({app:'bimcraft'}).control.handle(message,sid);},{message,sid:session?.id||'f09-live'})});await live.start();
    const url=live.url,token=live.token;let sid;const client={async request(method,params={}){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,...(sid?{'Mcp-Session-Id':sid}:{})},body:JSON.stringify({jsonrpc:'2.0',id:Math.random().toString(),method,params})});sid=r.headers.get('mcp-session-id')||sid;return r.json();}};
    await initialized(client);const catalog=(await client.request('tools/list')).result.tools;assert.ok(catalog.some(t=>t.name==='wall_reference_resolve'));
    await workflow((name,args={},fails=false)=>tool(client,name,args,fails),target.guid,other.guid,expected,check);
    await exportExpected(page,other.guid,path.join(out,'live-expected-private.json'));
    const download=page.waitForEvent('download');const saved=tool(client,'model_save',{});await(await download).saveAs(path.join(out,'live-saved.ifc'));await saved;
    await live.close();live=null;
    check('actual live HTTP initialization, strict tool discovery, semantic calls and saved IFC');
  }
  await context.close();
 }
 assert.deepEqual(report.errors,[]);report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack;if(lastPage&&!lastPage.isClosed()){await lastPage.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});report.failureState=await lastPage.evaluate(()=>({events:window.__f09Events,tool:window.bimcraftPlan?.state.tool,focus:document.activeElement?.outerHTML,menus:document.querySelectorAll('[data-f09-menu]').length})).catch(()=>null);}throw e;}finally{
 console.log('F09_REPORT '+JSON.stringify(report));fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await live?.close();await browser?.close();await new Promise(r=>app?app.close(r):r());
}
