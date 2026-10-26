/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import {model,inspect} from './fixture.mjs';
import {readWalls,wallOutlines,regenWalls} from '../../../app/model-walls.js';
const base='82da107dfd760199bc943249590812978c1a6082',out='.cc-test/f08',dir=path.resolve(out+'/approved');fs.mkdirSync(dir,{recursive:true});
execFileSync('tar',['-xf','-','-C',dir],{input:execFileSync('git',['archive',base],{maxBuffer:128*1024*1024})});
const old=await import(pathToFileURL(path.join(dir,'app/model-walls.js'))),{model:openOld}=await import(pathToFileURL(path.join(dir,'tests/features/f04/fixture.mjs')));
const m=await model(),walls=readWalls(m.w()),rows=walls.map(w=>({...w,key:w.guid}));
const before=[...old.wallOutlines(rows)],after=[...wallOutlines(rows)];
fs.writeFileSync(out+'/audit-before.json',JSON.stringify({base,walls,polygons:before}));
fs.writeFileSync(out+'/audit-after.json',JSON.stringify({base,walls,polygons:after,diagnostics:wallOutlines(rows).diagnostics}));
const results={base,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),environment:{node:process.version,cpu:os.cpus()[0].model,platform:os.platform(),arch:os.arch()},warmups:5,n:30,boundaries:{outline:'wallOutlines on identical full wall rows; no IFC reads or rendering',regenerate:'regenWalls on same saved IFC including metadata reading, outline, shape comparison; no-op regeneration after warmup; excludes model open and rendering'},raw:{}};
const measure=fn=>{const raw=[];for(let i=-5;i<30;i++){const t=performance.now();fn();if(i>=0)raw.push(performance.now()-t);}const s=[...raw].sort((a,b)=>a-b);return {raw,p50:s[14],p95:s[28]};};
results.raw.outlineBefore=measure(()=>old.wallOutlines(rows));results.raw.outlineAfter=measure(()=>wallOutlines(rows));
const baseline=await openOld(m.ed.save()),st=readWalls(m.w())[0].storey;
results.raw.regenBefore=measure(()=>baseline.w().run(w=>old.regenWalls(w,st)));results.raw.regenAfter=measure(()=>m.w().run(w=>regenWalls(w,st)));
async function forced(open,regen){
 const raw=[],bytes=m.ed.save(),guids=walls.map(w=>w.guid);
 for(let i=-5;i<30;i++){
  const copy=await open(bytes),w=copy.w(),t=performance.now();
  w.run(w=>regen(w,st,guids));if(i>=0)raw.push(performance.now()-t);w.api.CloseModel(w.mid);
 }
 const s=[...raw].sort((a,b)=>a-b);return {raw,p50:s[14],p95:s[28]};
}
results.boundaries.forced='Fresh identical saved IFC per sample (open excluded); journal setup + all wall reads + join computation + forced IFC shape/quantity writes. 5 warmups/30 samples, no filtering.';
results.raw.forcedBefore=await forced(openOld,old.regenWalls);results.raw.forcedAfter=await forced(model,regenWalls);
fs.writeFileSync(out+'/performance.json',JSON.stringify(results,null,2));console.log('F08_PERFORMANCE '+JSON.stringify(results));
