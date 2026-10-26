/* SPDX-License-Identifier: Apache-2.0 */
// Existing F28-C on the approved upstream shell: six global units, both startup paths and real locale catalogs.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';
import {start} from '../../../devshell/serve.mjs';import {fixture} from './documentation-fixture.mjs';
import {model} from '../f05/fixture.mjs';import {saveSheet,readSheets} from '../../../app/views-model.js';
import {readLevels} from '../../../app/model-levels.js';import {readSectionLines} from '../../../app/res-sheets.js';
import {op} from '../../../app/model-ops.js';
import {ids} from '../../../app/ifc-util.js';
import {fmtLen,UNITS} from '../../../app/model-units.js';
const out=path.resolve('.cc-test/f28-c-alignment'),port=Number(process.env.F28_ALIGN_PORT||8058);fs.mkdirSync(out,{recursive:true});
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),checks:[],errors:[],console:[],limits:[]};let server,browser,page;
const check=name=>{report.checks.push(name);console.log('PASS',name);};
const settle=async p=>{await p.waitForFunction(()=>globalThis.bimcraftWorkspace?.snapshot().document&&!bimcraftWorkspace.snapshot().busy&&(!globalThis.bimcraftPlan||!bimcraftPlan.state.queue.length),null,{timeout:90000});await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
const records=p=>p.evaluate(async()=>{const e=bimcraftLive.editor,pre='/assets/apps/bimcraft/dev/',[{ModelWriter},{readWalls},{readAssemblies},{readMaterials},{readWallDimensions},{readSheets,readPlanViews,readCallouts},{readDrafting},{readSectionLines}]=await Promise.all(['model-write.js','model-walls.js','wall-assemblies.js','project-materials.js','wall-dimensions.js','views-model.js','drafting.js','res-sheets.js'].map(f=>import(pre+f))),w=new ModelWriter(e.W,e.api,e.mid);return{walls:readWalls(w),types:readAssemblies(w),materials:readMaterials(w),dimensions:readWallDimensions(w),sheets:readSheets(w),callouts:readCallouts(w),plans:[...readPlanViews(w)],rcps:[...readPlanViews(w,'rcp')],drafting:readDrafting(w),sections:readSectionLines(w)};});
async function source(p,group,kind,id,open=true){const d=p.locator(`[data-pb-group="${group}"]`);if(!await d.evaluate(d=>d.open))await d.locator('summary').click();const b=p.locator(`[data-pb-${kind}="${id}"]`);await b.click();if(open)await b.press('Enter');await settle(p);}
try{
 const {chromium}=await import(pathToFileURL(path.resolve(process.env.F28_ALIGN_PLAYWRIGHT||'.cc-test/f28-c-browser-deps/node_modules/playwright/index.mjs')));
 const m=await model(fs.readFileSync(fixture)),level=readLevels(m.w())[0],section=readSectionLines(m.w())[0];
 m.change(op(w=>{w.upsertPset(ids(w.api,w.mid,'IFCPROJECT')[0],'CadCraft_CalloutViews',[['orphan','IFCTEXT',JSON.stringify({name:'Orphaned view',parent:'plan:missing',crop:[0,0,1000,1000],scale:0})]]);return{};}));
 m.change(saveSheet({number:'AL-01',title:'Display-unit check',paper:'a3',views:[{kind:'plan',ref:level.guid,x:210,y:165,ratio:50}]}));
 const sheets=readSheets(m.w()),planSheet=sheets.find(s=>s.number==='AL-01'),other=sheets.find(s=>s.id!==planSheet.id),file=path.join(out,'units-and-locales.ifc');fs.writeFileSync(file,m.ed.save());
 server=await start({port,host:'127.0.0.1',offline:true});browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});report.browser=browser.version();
 const context=async()=>{const c=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});await c.addInitScript(()=>{if(location.protocol==='http:'&&location.hostname==='127.0.0.1'&&!localStorage.getItem('bimcraft.model.units'))localStorage.setItem('bimcraft.model.units','mm');});c.on('page',p=>{p.on('pageerror',e=>report.errors.push(e.stack||e.message));p.on('console',m=>{if(['warning','error'].includes(m.type()))report.console.push({type:m.type(),text:m.text()});});});return c;};
 const ctx=await context();page=await ctx.newPage();
 // Exercise the actual ENOENT fallback of the shared devshell in this isolated process. No model or boot catalog mock.
 const keepPath=process.env.PATH;const emptyPath=path.join(out,'without-php');fs.mkdirSync(emptyPath,{recursive:true});
 try{process.env.PATH=emptyPath;await page.goto(`http://127.0.0.1:${port}/?workspace=live&space=paper`,{waitUntil:'networkidle'});}finally{process.env.PATH=keepPath;}
 await page.locator('[data-file]').setInputFiles(file);await settle(page);await source(page,'plans','plan',level.guid);assert.ok(await page.evaluate(()=>!!globalThis.bimcraftPlan));const before=await records(page);const commandIds=await page.evaluate(()=>bimcraftWorkspace.commands().map(x=>x.id));
 assert.deepEqual(await page.locator('[data-model-units] option').evaluateAll(xs=>xs.map(x=>x.value)),UNITS);assert.equal(await page.locator('[data-model-units]').count(),1);check('PHP-free startup has one retained native control with all six display units');
 await page.evaluate(()=>{globalThis.alignmentUnits=document.querySelector('[data-model-units]');});
 await source(page,'sheets','sheet',planSheet.id);
 for(const unit of UNITS){
  await page.locator('[data-model-units]').selectOption(unit);await settle(page);
  assert.equal(await page.evaluate(()=>bimcraftPlan.state.units),unit);assert.equal(await page.evaluate(async()=> (await import('/assets/apps/bimcraft/dev/model-units.js')).getDisplayUnits()),unit);
  await page.waitForFunction(text=>document.querySelector('[data-ws-document-paper]')?.textContent.includes(text),fmtLen(6000,unit));
  assert.deepEqual(await records(page),before);assert.equal(await page.evaluate(()=>bimcraftWorkspace.snapshot().dirty),false);
  check(unit+': composed plan labels refresh while raw records and sheet source references remain unchanged');
 }
 await source(page,'plans','plan',level.guid);
 for(const unit of ['mm','ftdec','cm']){await page.locator('[data-model-units]').selectOption(unit);await settle(page);assert.equal(await page.getByText('Cut plane',{exact:true}).evaluate(el=>el.nextElementSibling.textContent),fmtLen(1200,unit));assert.deepEqual(await records(page),before);}
 check('Properties view lengths reformat on global unit changes without changing raw View Range');
 await source(page,'sections','section',section.guid);await page.locator('[data-model-units]').selectOption('m');await settle(page);assert.deepEqual(await records(page),before);check('projected drawing unit refresh retains the section source and authored records');
 await page.locator('[data-ws-fallback]').first().click();assert.ok(await page.locator('[data-model-units]').evaluate(e=>e===alignmentUnits&&!!e.closest('.bc-toolbar')));await page.locator('[data-model-units]').selectOption('cm');await page.locator('[data-ws-launch]').click();await settle(page);assert.equal(await page.locator('[data-model-units]').inputValue(),'cm');assert.ok(await page.locator('[data-model-units]').evaluate(e=>e===alignmentUnits));assert.deepEqual(await records(page),before);check('fallback restores the same upstream global unit control and live return retains it');
 await page.screenshot({path:path.join(out,'documentation-units.png')});await ctx.close();
 const allContext=await context();page=await allContext.newPage();await page.goto(`http://127.0.0.1:${port}/?workspace=toolbox&space=paper`,{waitUntil:'networkidle'});await page.locator('[data-file]').setInputFiles(file);await settle(page);
 await page.locator('[data-ws-view="plan:'+level.guid+'"]').click();await settle(page);await page.locator('[data-model-viewkind]').selectOption('rcp');await settle(page);assert.equal(await page.evaluate(()=>bimcraftWorkspace.snapshot().view.id),'rcp:'+level.guid);check('shared all-view tabs follow the actual native RCP source');
 assert.equal(await page.locator('[data-ws-view="callout:orphan"]').count(),0);assert.equal(await page.locator('[data-pb-comissing="orphan"]').count(),1);assert.equal(await page.locator('[data-pb-comissing="orphan"]').evaluate(el=>el.parentElement.querySelector('.bc-pb-tag').textContent),JSON.parse(await page.locator('#cc-lang').textContent()).strings['model.co.missingtag']);check('unresolvable callouts retain native Missing views diagnostics without advertising a drawable tab');
 await page.locator('[data-ws-view="schedule:assemblies"]').click();await settle(page);assert.equal(await page.evaluate(()=>bimcraftWorkspace.snapshot().view.id),'schedule:assemblies');assert.equal(await page.locator('[data-msched]').isVisible(),true);check('shared all-view tabs reach the actual documentation schedule');
 await page.locator('[data-ws-view="plan:'+level.guid+'"]').click();await settle(page);assert.equal(await page.evaluate(()=>bimcraftWorkspace.snapshot().view.id),'plan:'+level.guid);assert.equal(await page.locator('[data-ws-documentation]').isVisible(),false);assert.deepEqual(await records(page),before);check('shared all-view tabs return to the native plan without changing raw authored records');await allContext.close();
 if(process.env.F28_ALIGN_REQUIRE_PHP==='1'){
  execFileSync('php',['-v']);report.locales=[];
  for(const locale of ['es-MX','id','en-XA']){
   const c=await context();page=await c.newPage();await page.goto(`http://127.0.0.1:${port}/?workspace=live&space=paper&lang=${locale}`,{waitUntil:'networkidle'});
   assert.equal(await page.locator('html').getAttribute('lang'),locale);const boot=JSON.parse(await page.locator('#cc-lang').textContent());assert.equal(boot.locale,locale);
   assert.equal((await page.locator('[data-model-units] option[value="cm"]').textContent()).trim(),boot.strings['model.units.cm']);
   assert.ok(boot.strings['workspace.activateSource']&&!boot.strings['workspace.activateSource'].includes('workspace.activateSource'));
   await page.locator('[data-file]').setInputFiles(file);await settle(page);assert.deepEqual(await records(page),before);assert.deepEqual(await page.evaluate(()=>bimcraftWorkspace.commands().map(x=>x.id)),commandIds);
   await source(page,'sheets','sheet',other.id);await source(page,'sheets','sheet',planSheet.id,false);
   const button=page.locator('.ws-view-props [data-ws-command="editsheet"]');assert.equal(await button.getAttribute('aria-disabled'),'true');assert.equal(await button.getAttribute('data-ws-reason'),boot.strings['workspace.activateSource']);assert.equal(await page.evaluate(()=>bimcraftWorkspace.snapshot().view.id),'sheet:'+other.id);
   await source(page,'sheets','sheet',planSheet.id);assert.equal(await page.locator('.ws-view-props [data-ws-command="editsheet"]').getAttribute('aria-disabled'),'false');await page.locator('.ws-view-props [data-ws-command="editsheet"]').click();assert.equal(await page.locator('[data-sh-number]').inputValue(),'AL-01');await page.keyboard.press('Escape');assert.deepEqual(await records(page),before);
   report.locales.push({locale,unitLabel:boot.strings['model.units.cm'],sourceId:planSheet.id,rawRecordsUnchanged:true});check(locale+': real PHP catalog/fallback preserves command IDs, owner/source guard and raw authored records');await c.close();
  }
 }else report.limits.push('PHP-rendered locale checks not executed; set F28_ALIGN_REQUIRE_PHP=1 with PHP.');
 assert.equal(report.errors.length,0);check('no application exceptions');report.status='PASS';
}catch(e){report.status='FAIL';report.error=e.stack||String(e);process.exitCode=1;await page?.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});}
finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log('F28_ALIGNMENT_REPORT '+JSON.stringify(report));if(process.env.F28_EMIT_REVIEW_FRAMES==='1')for(const name of ['documentation-units.png','failure.png']){const file=path.join(out,name);if(fs.existsSync(file)){const b=fs.readFileSync(file).toString('base64'),n=Math.ceil(b.length/12000);for(let i=0;i<n;i++)console.log('F28ALIGN_FRAME '+name+' '+i+'/'+n+' '+b.slice(i*12000,(i+1)*12000));}}await browser?.close();if(server)await new Promise(r=>server.close(r));}
