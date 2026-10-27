/* SPDX-License-Identifier: Apache-2.0 */
import fs from 'node:fs';
import os from 'node:os';
import { performance } from 'node:perf_hooks';
import { execFileSync } from 'node:child_process';
import { generate } from '../f03/fixtures.mjs';
import { openModel, writer } from '../f03/core.mjs';
import { readWalls } from '../../../app/model-walls.js';
import { referencePoint } from '../../../app/wall-dimensions.js';
import { wallTargetCandidates } from '../../../app/wall-targets.js';
import { snapPoint } from '../../../app/model-tools.js';
const results=[];
for(const size of ['small','medium','large']){
  const ed=await openModel(await generate(size)),walls=readWalls(writer(ed)),raw={existing:[],explicit:[]};
  const ctx={walls:walls.filter(w=>!w.bulge)};
  for(let i=-5;i<30;i++)for(const mode of ['existing','explicit']){
    const wall=walls[(i+walls.length)%walls.length],p=referencePoint({wall:wall.guid,reference:'coreExterior',station:.3728282828},walls);
    const start=performance.now();
    if(mode==='existing')snapPoint(p,ctx,{tol:120,align:true});else wallTargetCandidates(p,walls,'coreExterior',120);
    const duration=performance.now()-start;if(i>=0)raw[mode].push(duration);
  }
  const stats=Object.fromEntries(Object.entries(raw).map(([mode,values])=>{const sorted=[...values].sort((a,b)=>a-b);return[mode,{raw:values,n:values.length,p50Ms:sorted[14],p95Ms:sorted[28]}];}));
  results.push({fixture:'F03 '+size,wallCount:walls.length,...stats});ed.api.CloseModel(ed.mid);
}
fs.mkdirSync('.cc-test/f09',{recursive:true});
const report={head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),node:process.version,cpu:os.cpus()[0].model,platform:os.platform(),boundary:'Pure candidate-discovery CPU cost only; 30 samples after 5 warmups per existing F03 size. No GPU/browser/commit timing claim; acquisition radius not accuracy tolerance.',results};
fs.writeFileSync('.cc-test/f09/performance.json',JSON.stringify(report,null,2));console.log(JSON.stringify(results.map(({fixture,wallCount,existing,explicit})=>({fixture,wallCount,existingP95Ms:existing.p95Ms,explicitP95Ms:explicit.p95Ms}))));
