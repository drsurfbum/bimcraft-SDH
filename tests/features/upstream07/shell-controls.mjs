/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const arg = k => process.argv[process.argv.indexOf(k) + 1];
const { chromium } = await import(pathToFileURL(path.resolve('.cc-test/shell-deps/node_modules/playwright/index.mjs')));
const fixture = path.resolve('fixtures/f04/layered-plans.ifc'), out = path.resolve('.cc-test/upstream07-shell'); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const report = { browser: browser.version(), node: process.version, controls: [], performance: 'Same fixture, viewport, explicit plan camera and 30 synchronous painter CPU samples. No GPU, large-model or interaction-latency claim. No regression threshold is adjudicated; performance findings remain open.' };
try {
  let i = 0, expected = null;
  for (const [name, root] of [['accepted',path.resolve(arg('--accepted'))],['release',path.resolve(arg('--release'))],['candidate',process.cwd()]]) {
    const { start } = await import(pathToFileURL(path.join(root,'devshell/serve.mjs'))), port = 8064 + i++;
    const server = await start({ port, host:'127.0.0.1', offline:true }), ctx = await browser.newContext({ viewport:{width:1440,height:1000}, acceptDownloads:true });
    const page = await ctx.newPage(), row = { name, errors:[], console:[], locales:[] };
    report.controls.push(row);
    page.on('pageerror', e => row.errors.push(e.message)); page.on('console', m => { if (['warning','error'].includes(m.type())) row.console.push({type:m.type(),text:m.text()}); });
    try {
      await page.goto(`http://127.0.0.1:${port}/?workspace=established&space=paper`,{waitUntil:'networkidle'});
      await page.locator('[data-file]').setInputFiles(fixture); await page.waitForFunction(() => globalThis.bimcraftLive?.editor);
      await page.locator('[data-model-toggle]').click(); await page.waitForFunction(() => globalThis.bimcraftPlan?.state.data?.walls.length && !bimcraftPlan.state.busy && !bimcraftPlan.state.reloading);
      await page.locator('[data-model-layout="plan"]').click();
      const raw = await page.evaluate(async () => { const e=bimcraftLive.editor,p='/assets/apps/bimcraft/dev/',{ModelWriter}=await import(p+'model-write.js'),{readWalls}=await import(p+'model-walls.js'); return readWalls(new ModelWriter(e.W,e.api,e.mid)).map(w=>({guid:w.guid,type:w.typeKey,a:w.a,b:w.b,height:w.height,t:w.t})); });
      if (!expected) expected=raw; else assert.deepEqual(raw,expected);
      row.wallCount=raw.length; assert.equal(raw.length,9);
      row.samples = await page.evaluate(() => { const v=bimcraftPlan.view;v.canvas.parentElement.style.width='900px';v.canvas.parentElement.style.height='600px';v.resize();v.cx=3500;v.cy=4000;v.scale=.05;const raw=[];for(let i=-5;i<30;i++){const t=performance.now();v.draw();if(i>=0)raw.push(performance.now()-t);}const s=[...raw].sort((a,b)=>a-b);return {raw,p50Ms:s[14],p95Ms:s[28],canvas:[v.w,v.h2],camera:[v.cx,v.cy,v.scale]}; });
      await page.screenshot({path:path.join(out,name+'-plan.png')});
      if (name !== 'accepted') {
        assert.equal(await page.locator('#cc-workspace').count(),1);
        assert.ok(await page.evaluate(() => typeof window.bimcraftWorkspace.engine.inspect === 'function'));
        for (const locale of ['fr','de','ar']) {
          await page.goto(`http://127.0.0.1:${port}/?lang=${locale}&space=paper`,{waitUntil:'networkidle'});
          const lang=JSON.parse(await page.locator('#cc-lang').textContent()); assert.equal(lang.locale,locale); assert.ok(lang.strings['model.units.m']);
          assert.equal((await page.locator('[data-model-units] option[value="m"]').textContent()).trim(),lang.strings['model.units.m']); row.locales.push(locale);
        }
      }
      assert.deepEqual(row.errors,[]); assert.ok(row.console.every(m=>(m.type==='warning'&&m.text==='Failed to create WebGPU Context Provider')||m.text.includes('/bootstrap-icons/current/bootstrap-icons.min.css')));
      row.status='PASS';
    } finally { await ctx.close(); await new Promise(r=>server.close(r)); }
  }
  report.status='PASS';
} catch(e) { report.status='FAIL'; report.error=e.stack; process.exitCode=1; }
finally { fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)); console.log(JSON.stringify(report)); await browser.close(); }
