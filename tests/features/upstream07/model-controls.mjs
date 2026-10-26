/* SPDX-License-Identifier: Apache-2.0 */
// Same bytes and workload in independent processes; no model payload leaves this job.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const arg=k=>process.argv.includes(k)?process.argv[process.argv.indexOf(k)+1]:undefined;
const fixture=path.resolve(arg('--fixture')||'.cc-test/f03/fixtures/medium.ifc');
if(process.argv.includes('--root')) {
 const root=path.resolve(arg('--root')), mod=f=>import(pathToFileURL(path.join(root,'app',f)));
 const [{init},W,{IfcEditor},{ModelWriter},{readWalls},{changeWall}]=await Promise.all(['i18n.js','ifc/api.js','ifc-edit.js','model-write.js','model-walls.js','model-ops.js'].map(mod));
 init({strings:JSON.parse(fs.readFileSync(path.join(root,'app/lang/en.json')))});
 const bytes=fs.readFileSync(fixture),api=new W.IfcAPI(),samples=[];
 let t=performance.now();await api.Init({manifold:false});let mid=api.OpenModel(bytes);const coldMs=performance.now()-t;api.CloseModel(mid);
 const timed=(workload,fn,i)=>{const before=process.memoryUsage(),t=performance.now(),value=fn(),ms=performance.now()-t,after=process.memoryUsage();if(i>=0)samples.push({workload,ms,rssBefore:before.rss,rssAfter:after.rss,heapAfter:after.heapUsed,arrayBuffersAfter:after.arrayBuffers});return value;};
 for(let i=-5;i<(process.argv.includes('--cold-only')?-5:30);i++) {
  mid=timed('warm-open',()=>api.OpenModel(bytes),i);const ed=new IfcEditor(W,{api,modelID:mid}),w=new ModelWriter(W,api,mid),wall=readWalls(w)[0];assert.ok(wall);
  const count=api.GetLineIDsWithType(mid,W.IFCWALL).size();
  timed('unchanged-read',()=>readWalls(w),i);
  timed('forced-height-regeneration',()=>ed.modelChange(changeWall(wall.guid,{height:wall.height+.123456})),i);
  assert.ok(Math.abs(readWalls(w)[0].height-wall.height-.123456)<.005);ed.undo();assert.equal(readWalls(w)[0].height,wall.height);ed.redo();assert.equal(api.GetLineIDsWithType(mid,W.IFCWALL).size(),count);
  api.CloseModel(mid);
 }
 console.log(JSON.stringify({coldMs,samples}));
} else {
 const output={environment:{node:process.version,cpu:os.cpus()[0].model,platform:os.platform(),arch:os.arch()},fixtureSha256:crypto.createHash('sha256').update(fs.readFileSync(fixture)).digest('hex'),limits:'Thirty process-cold samples; thirty warm samples after five warmups. Same fixture bytes and synchronous boundaries. Whole-process memory, no forced GC. No interactive, GPU, large-model or performance-issue closure claim.',controls:[]};
 for(const [name,root] of [['accepted',arg('--accepted')],['release',arg('--release')],['candidate',process.cwd()]]) {
  const row={name,cold:[],samples:[]};
  for(let i=0;i<30;i++) {const r=spawnSync(process.execPath,[process.argv[1],'--root',root,'--fixture',fixture,...(i?['--cold-only']:[])],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);const x=JSON.parse(r.stdout);row.cold.push(x.coldMs);if(i===0)row.samples=x.samples;}
  row.summary=Object.fromEntries(['process-cold-open',...new Set(row.samples.map(x=>x.workload))].map(k=>{const values=(k==='process-cold-open'?row.cold:row.samples.filter(x=>x.workload===k).map(x=>x.ms)).sort((a,b)=>a-b);return [k,{n:values.length,p50Ms:values[14],p95Ms:values[28]}];}));output.controls.push(row);console.log(name,JSON.stringify(row.summary));
 }
 fs.mkdirSync('.cc-test/upstream07',{recursive:true});fs.writeFileSync('.cc-test/upstream07/model-performance.json',JSON.stringify(output,null,2));
}
