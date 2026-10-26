/* SPDX-License-Identifier: Apache-2.0 */
// F28C-PM-01: actual Properties actions must match the rendered source, independently of browser selection.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {model} from '../f05/fixture.mjs';
import {saveSheet,readSheets} from '../../../app/views-model.js';
import {assemblySchedules} from '../../../app/assembly-schedule.js';
import {scheduleCsv} from '../../../app/model-schedule.js';
import {fixture} from './documentation-fixture.mjs';

export async function verifySourceActions({newContext,openProject,settle,out,check}) {
  const m=await model(fs.readFileSync(fixture)),original=readSheets(m.w())[0];
  for(const number of ['C-101','C-102'])m.change(saveSheet({number,title:'Source action review',paper:'a3',views:original.views}));
  const sheets=readSheets(m.w()),a=sheets.find(s=>s.number==='C-101'),b=sheets.find(s=>s.number==='C-102');
  const file=path.join(out,'source-actions.ifc');fs.writeFileSync(file,m.ed.save());
  const expected=assemblySchedules(m.w()),ctx=await newContext({hasTouch:true}),page=await ctx.newPage();
  const result={fixtureSHA256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),sheets:[a.id,b.id],downloads:[]},downloads=[];
  page.on('download',d=>downloads.push(d.suggestedFilename()));
  const group=async key=>{const d=page.locator(`[data-pb-group="${key}"]`);if(!await d.evaluate(d=>d.open))await d.locator('summary').click();};
  const choose=async(kind,ref,activate=false)=>{await group(kind==='sheet'?'sheets':'sched');const button=page.locator(`[data-pb-${kind==='sheet'?'sheet':'sched'}="${ref}"]`);await button.click();if(activate)await button.press('Enter');await settle(page);};
  const state=()=>page.evaluate(()=>bimcraftWorkspace.snapshot());
  const records=()=>page.evaluate(async()=>{const pre='/assets/apps/bimcraft/dev/',[{ModelWriter},{readSheets}]=await Promise.all(['model-write.js','views-model.js'].map(f=>import(pre+f))),e=bimcraftLive.editor;return readSheets(new ModelWriter(e.W,e.api,e.mid));});
  const props=id=>page.locator(`.ws-view-props [data-ws-command="${id}"]`);
  async function blocked(id,gesture='click') {
    const button=props(id),n=downloads.length;
    assert.equal(await button.getAttribute('aria-disabled'),'true');assert.equal(await button.evaluate(el=>el.disabled),false);
    await button.focus();assert.ok((await button.getAttribute('data-ws-reason')).includes('Open the source shown in Properties'));
    assert.equal(await page.locator('[role="tooltip"]').isVisible(),true);
    if(gesture==='keyboard')await button.press('Enter');else {
      // Playwright's click/tap actionability treats aria-disabled as native disabled. Use real input with a hit-test;
      // the product intentionally keeps these buttons focusable/clickable to explain unavailability.
      const box=await button.boundingBox();assert.ok(box);const point={x:box.x+box.width/2,y:box.y+box.height/2};
      assert.equal(await button.evaluate((el,p)=>document.elementFromPoint(p.x,p.y)?.closest('button')===el,point),true);
      if(gesture==='touch')await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
    }
    const dialog=page.locator('dialog.ws-explain');await dialog.waitFor({state:'visible'});
    assert.match(await dialog.textContent(),/Open the source shown in Properties/);
    assert.equal(await page.locator('[data-sh-dialog][open]').count(),0);assert.equal(downloads.length,n);
    await dialog.getByRole('button',{name:'Close',exact:true}).click();
  }
  async function csv(selector,source,name) {
    const event=page.waitForEvent('download');await page.locator(selector).click();const d=await event,file=path.join(out,name);await d.saveAs(file);
    const bytes=fs.readFileSync(file);assert.equal(bytes.toString('utf8').replace(/^\ufeff/,''),scheduleCsv(expected[source]));
    result.downloads.push({source,suggestedName:d.suggestedFilename(),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
  }
  try {
    await openProject(page,file);
    await choose('sheet',a.id,true);await choose('sheet',b.id);
    assert.equal((await state()).view.id,'sheet:'+a.id);assert.ok((await page.locator('.ws-view-props').textContent()).includes(b.id));
    await page.screenshot({path:path.join(out,'properties-source-sheet-inactive.png')});
    const before=await records();await blocked('editsheet');assert.deepEqual(await records(),before);
    check('Properties sheet action refuses an unopened displayed source without changing the active sheet');
    await page.locator('[data-ws-tab="view"]').click();const toolbar=page.locator('.ws-ribbon [data-ws-command="editsheet"]');
    assert.equal(await toolbar.getAttribute('aria-disabled'),'false');await toolbar.click();
    assert.equal(await page.locator('[data-sh-number]').inputValue(),a.number);await page.keyboard.press('Escape');
    check('ribbon sheet editing stays targeted to the active drawing despite a different browser selection');
    await choose('sheet',b.id,true);assert.equal(await props('editsheet').getAttribute('aria-disabled'),'false');await props('editsheet').click();
    assert.equal(await page.locator('[data-sh-number]').inputValue(),b.number);await page.locator('[data-sh-title]').fill('Only intended B');await page.locator('[data-sh-save]').click();await settle(page);
    let changed=await records();assert.deepEqual(changed.find(s=>s.id===a.id),a);assert.equal(changed.find(s=>s.id===b.id).title,'Only intended B');
    check('activating the displayed sheet enables Properties editing and saves only its source ID');
    // Duplicate labels are valid existing sheet records. Rename through the real editor, without changing IDs.
    await props('editsheet').click();await page.locator('[data-sh-number]').fill(a.number);await page.locator('[data-sh-title]').fill(a.title);await page.locator('[data-sh-save]').click();await settle(page);
    await group('sheets');assert.equal(await page.locator(`[data-pb-sheet="${a.id}"]`).textContent(),await page.locator(`[data-pb-sheet="${b.id}"]`).textContent());
    await choose('sheet',a.id);assert.equal((await state()).view.id,'sheet:'+b.id);await blocked('editsheet','touch');
    await choose('sheet',a.id,true);await props('editsheet').click();await page.locator('[data-sh-title]').fill('Only intended A');await page.locator('[data-sh-save]').click();await settle(page);
    changed=await records();assert.equal(changed.find(s=>s.id===a.id).title,'Only intended A');assert.equal(changed.find(s=>s.id===b.id).title,a.title);
    result.duplicateNamesVerified=true;check('duplicate sheet names retain ID routing, touch explanations and correct positive edit targets');
    await choose('schedule','assemblies',true);assert.equal(await page.locator('[data-msched-kind]').inputValue(),'assemblies');
    check('first schedule activation synchronizes its native selector with the actual source');
    await choose('schedule','materialLegend');assert.equal(await page.locator('[data-msched-kind]').inputValue(),'assemblies');
    assert.equal((await state()).view.id,'schedule:assemblies');assert.ok((await page.locator('.ws-view-props').textContent()).includes('materialLegend'));
    await page.screenshot({path:path.join(out,'properties-source-csv-inactive.png')});
    await blocked('csv','keyboard');assert.equal((await state()).view.id,'schedule:assemblies');
    check('Properties CSV refuses an unopened displayed legend with a keyboard explanation and no download');
    await page.locator('[data-ws-file]').click();const fileMenu=page.getByRole('menu',{name:'File',exact:true});
    assert.equal(await fileMenu.locator('[data-ws-file-action="csv"]').getAttribute('aria-disabled'),'false');
    await csv('[role="menu"] [data-ws-file-action="csv"]','assemblies','source-actions-active-assemblies.csv');
    check('File CSV still exports the actual active assembly schedule while Properties displays the legend');
    await choose('schedule','materialLegend',true);assert.equal(await page.locator('[data-msched-kind]').inputValue(),'materialLegend');assert.equal(await props('csv').getAttribute('aria-disabled'),'false');
    await csv('.ws-view-props [data-ws-command="csv"]','materialLegend','source-actions-intended-legend.csv');
    assert.equal(downloads.length,2);assert.equal((await state()).view.id,'schedule:materialLegend');
    await page.screenshot({path:path.join(out,'properties-source-csv-active.png')});
    check('activating the intended legend enables Properties CSV with exact authoritative legend contents');
    return result;
  } catch(error) {
    await page.screenshot({path:path.join(out,'properties-source-failure.png')}).catch(()=>{});
    const diagnostic={...result,error:error.stack||String(error),state:await state().catch(()=>null),properties:await page.locator('.ws-view-props').textContent().catch(()=>null)};
    fs.writeFileSync(path.join(out,'source-actions-failure.json'),JSON.stringify(diagnostic,null,2)+'\n');console.log('F28C_SOURCE_FAILURE '+JSON.stringify(diagnostic));throw error;
  } finally {await ctx.close();}
}

// Optional narrow local regression: a fresh browser/context; never attach to the user's browser or replace a server.
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const out=path.resolve('.cc-test/f28-c-source-actions');fs.mkdirSync(out,{recursive:true});
  const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),checks:[],exceptions:[],console:[]};let browser,server;
  try{
    const {chromium}=await import(pathToFileURL(path.resolve(process.env.F28C_PLAYWRIGHT||'.cc-test/f28-c-browser-deps/node_modules/playwright/index.mjs')));
    let url=process.env.F28C_SOURCE_URL;
    if(!url){const{start}=await import('../../../devshell/serve.mjs');const port=Number(process.env.F28C_SOURCE_PORT||8051);server=await start({port,host:'127.0.0.1',offline:true});url=`http://127.0.0.1:${port}/`;}
    const actual=await(await fetch(new URL('/assets/apps/bimcraft/dev/workspace/workspace.js',url))).text();assert.equal(actual,fs.readFileSync('app/workspace/workspace.js','utf8'),'Existing preview must serve this exact workspace source');
    browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
    const settle=async p=>{await p.waitForFunction(()=>globalThis.bimcraftWorkspace?.snapshot().document&&!bimcraftWorkspace.snapshot().busy&&!bimcraftPlan.state.queue.length,null,{timeout:90000});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
    report.sourceActions=await verifySourceActions({out,settle,check:name=>{report.checks.push(name);console.log('PASS',name);},
      newContext:async options=>{const c=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,...options});c.on('page',p=>{p.on('pageerror',e=>report.exceptions.push(e.stack||e.message));p.on('console',m=>{if(['warning','error'].includes(m.type()))report.console.push({type:m.type(),text:m.text(),location:m.location()});});});return c;},
      openProject:async(p,file)=>{await p.goto(new URL('/?workspace=live&space=paper',url).href,{waitUntil:'networkidle'});await p.locator('[data-file]').setInputFiles(file);await settle(p);}});
    assert.equal(report.exceptions.length,0);report.status='PASS';
  }catch(e){report.status='FAIL';report.error=e.stack||String(e);process.exitCode=1;}
  finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log('F28C_SOURCE_REPORT '+JSON.stringify(report));await browser?.close();if(server)await new Promise(r=>server.close(r));}
}
