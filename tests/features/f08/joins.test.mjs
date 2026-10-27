/* SPDX-License-Identifier: Apache-2.0 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {model as open} from '../f04/fixture.mjs';
import {model,generate,inspect,A,B,fixture} from './fixture.mjs';
import {wallOutlines,legacyWallOutlines,readWalls,locationLine,storedShape,regenWalls} from '../../../app/model-walls.js';
import {readJoinRecord,writeJoinSettings,defaultJoinSettings,JOIN_PSET} from '../../../app/wall-join-records.js';
import {readAssemblies} from '../../../app/wall-assemblies.js';
import {readWallDimensions,resolveDimension} from '../../../app/wall-dimensions.js';
import {readOpenings} from '../../../app/model-openings.js';
import {changeWall,changeWalls,saveWallAssembly,op} from '../../../app/model-ops.js';
import {wallPlanGraphics,wallPlanEdges} from '../../../app/wall-plan-graphics.js';
import {planPdf} from '../../../app/model-pdf.js';
import {readMaterials,saveMaterial} from '../../../app/project-materials.js';
fs.mkdirSync(new URL('../../../fixtures/f08/',import.meta.url),{recursive:true});if(!fs.existsSync(fixture))fs.writeFileSync(fixture,await generate());
const dir='.cc-test/f08';fs.mkdirSync(dir,{recursive:true});
const near=(a,b,tol=.005)=>assert.ok(Math.abs(a-b)<tol,a+' != '+b);
const bytes=m=>m.w().api.file(m.w().mid).save({timeStamp:'2026-10-23T12:00:00'});
const ringArea=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0];},0)/2;
const canonical=out=>[...out].map(([k,p])=>[k,p.map(q=>q.map(x=>Math.round(x*1e7)/1e7))]).sort((a,b)=>a[0].localeCompare(b[0]));
const ray=(key,angle,t=209.55,assembly=A,extSide='left')=>({key,guid:key,a:[0,0],b:[4000*Math.cos(angle*Math.PI/180),4000*Math.sin(angle*Math.PI/180)],t,assembly,height:3000,z:0,extSide});
test('supported angle/core/orientation matrix is deterministic under order and regeneration',()=>{
 const matrix=[];
 for(const d of [30,45,60,90,120,135,150])for(const side of ['left','right'])for(const dissimilar of [false,true]){
  const ws=[ray('a',0,209.55,A,side),ray('b',d,dissimilar?155.575:209.55,dissimilar?B:A,side)],out=wallOutlines(ws);
  assert.deepEqual(out.diagnostics,[],JSON.stringify({d,side,dissimilar,issues:out.diagnostics}));
  assert.deepEqual(canonical(out),canonical(wallOutlines([...ws].reverse())));
  for(let i=0;i<5;i++)assert.deepEqual(canonical(wallOutlines(ws)),canonical(out));
  for(const p of out.values()){assert.ok(ringArea(p)>0);assert.ok(p.flat().every(Number.isFinite));}
  matrix.push({angle:d,side,dissimilar,walls:ws,polygons:[...out],before:[...legacyWallOutlines(ws)]});
 }
 fs.writeFileSync(dir+'/matrix.json',JSON.stringify(matrix));
});
test('true T and four-arm X have common core-first seams and no ordering dependence',()=>{
 const stem=ray('a',90,155.575,B),host={...ray('z',0),a:[-4000,0]};
 for(const ws of [[stem,host],[0,90,180,270].map((d,i)=>ray('w'+i,d,i%2?155.575:209.55,i%2?B:A))]){
  const out=wallOutlines(ws);assert.deepEqual(out.diagnostics,[]);assert.deepEqual(canonical(out),canonical(wallOutlines([...ws].reverse())));
  if(ws.length===2)assert.equal(out.get('z').joinPieces.length,2);
  fs.writeFileSync(dir+'/'+(ws.length===2?'T':'X')+'.json',JSON.stringify({walls:ws,outlines:[...out]}));
 }
});
test('endpoint matching uses 1 mm distinct from measurement precision',()=>{
 for(const delta of [.002,.5,.99]){
  const ws=[ray('a',0),{...ray('b',90),a:[delta,0],b:[delta,4000]}];
  const out=wallOutlines(ws);assert.deepEqual(out.diagnostics,[]);assert.deepEqual(canonical(out),canonical(wallOutlines(ws.reverse())));
 }
 const ws=[ray('a',0),{...ray('b',90),a:[2,2],b:[2,4002]}];assert.ok(wallOutlines(ws).diagnostics.some(d=>d.reason==='near-face-tee'));
});
test('unsupported angle, height, topology and degenerate inputs keep finite safe geometry and reasons',()=>{
 const cases=[[ray('a',0),ray('b',15)],[ray('a',0),{...ray('b',90),height:2000}],[{...ray('a',0),a:[-4000,0]},{...ray('b',90),a:[0,-4000]}],[ray('a',0),{...ray('b',90),b:[0,5]}]];
 for(const ws of cases){const out=wallOutlines(ws);assert.ok(out.diagnostics.length);for(const p of out.values())assert.ok(p.flat().every(Number.isFinite)&&ringArea(p)>0);}
 const out=wallOutlines([{...ray('bad',0),a:[NaN,0]}]);assert.equal(out.size,0);assert.equal(out.diagnostics[0].reason,'invalid-size');
});
test('curved components retain inherited envelope and bulge data',()=>{
 const ws=[{...ray('s',0),b:[4000,0]},{...ray('c',180),a:[4000,0],b:[0,0],bulge:1}];
 const out=wallOutlines(ws),old=legacyWallOutlines(ws);
 for(const key of old.keys())assert.deepEqual(out.get(key),old.get(key));assert.ok(out.diagnostics.some(d=>d.reason==='curved-legacy'));
});
test('fixture actual IFC profiles match the same plan envelopes at 0.005 mm',async()=>{
 const m=await model(),state=inspect(m);assert.deepEqual(state.diagnostics,[]);
 for(const wall of state.walls){
  const shape=storedShape(m.w(),wall.id),poly=state.outlines.find(([g])=>g===wall.guid)[1],L=wall.len,u=[(wall.b[0]-wall.a[0])/L,(wall.b[1]-wall.a[1])/L];
  const expected=poly.map(p=>[(p[0]-wall.a[0])*u[0]+(p[1]-wall.a[1])*u[1],-(p[0]-wall.a[0])*u[1]+(p[1]-wall.a[1])*u[0]]);
  assert.equal(shape.points.length,expected.length);for(let i=0;i<expected.length;i++)for(let j=0;j<2;j++)near(shape.points[i][j],expected[i][j]);near(shape.depth,3000);
 }
 fs.writeFileSync(dir+'/seed.ifc',m.ed.save());fs.writeFileSync(dir+'/seed.json',JSON.stringify(state));
});
test('allow/disallow and square caps affect both physical/drawing envelopes and undo/redo/reopen',async()=>{
 const m=await model(),wall=readWalls(m.w())[0],seed=canonical(wallOutlines(readWalls(m.w()).map(w=>({...w,key:w.guid}))));
 const settings=defaultJoinSettings();settings.a.allow=false;m.change(changeWall(wall.guid,{joinSettings:settings}));
 const changed=canonical(wallOutlines(readWalls(m.w()).map(w=>({...w,key:w.guid}))));assert.notDeepEqual(changed,seed);
 assert.equal(readJoinRecord(m.w(),wall.id).settings.a.allow,false);
 m.ed.undo();assert.deepEqual(canonical(wallOutlines(readWalls(m.w()).map(w=>({...w,key:w.guid})))),seed);
 m.ed.redo();assert.deepEqual(canonical(wallOutlines(readWalls(m.w()).map(w=>({...w,key:w.guid})))),changed);
 const re=await open(m.ed.save());assert.equal(readWalls(re.w())[0].joinSettings.a.allow,false);assert.deepEqual(canonical(wallOutlines(readWalls(re.w()).map(w=>({...w,key:w.guid})))),changed);
 settings.a={allow:true,cap:'square'};m.change(changeWall(wall.guid,{joinSettings:settings}));assert.deepEqual(canonical(wallOutlines(readWalls(m.w()).map(w=>({...w,key:w.guid})))),changed);
});
test('legacy metadata reads without writes and explicit edit migrates only the edited record',async()=>{
 const m=await model(),before=bytes(m),walls=readWalls(m.w());for(const wall of walls)assert.deepEqual(readJoinRecord(m.w(),wall.id).settings,defaultJoinSettings());assert.deepEqual(bytes(m),before);
 m.w().run(w=>{const {version,...legacy}=defaultJoinSettings();w.upsertPset(walls[0].id,JOIN_PSET,[['Settings','IFCTEXT',JSON.stringify(legacy)]]);});
 const old=bytes(m);assert.equal(readJoinRecord(m.w(),walls[0].id).settings.version,1);assert.deepEqual(bytes(m),old);
 m.change(changeWall(walls[0].guid,{joinSettings:defaultJoinSettings()}));assert.equal(JSON.parse(readJoinRecord(m.w(),walls[0].id).raw).version,1);m.ed.undo();assert.deepEqual(bytes(m),old);
});
test('unknown and corrupt end records refuse model writes atomically and preserve saved payloads',async()=>{
 const invalid=[{...defaultJoinSettings(),version:99},{...defaultJoinSettings(),version:null},{...defaultJoinSettings(),version:'1'},{...defaultJoinSettings(),version:1.5},{...defaultJoinSettings(),a:{allow:'false',cap:'envelope'}},{...defaultJoinSettings(),b:{allow:true,cap:'wrap'}},{...defaultJoinSettings(),extra:true},null];
 for(const payload of invalid){const m=await model(),wall=readWalls(m.w())[0];m.w().run(w=>w.upsertPset(wall.id,JOIN_PSET,[['Settings','IFCTEXT',JSON.stringify(payload)]]));const before=bytes(m);
  assert.ok(readWalls(m.w())[0].joinIssue);assert.throws(()=>m.change(changeWall(wall.guid,{height:2900})));assert.throws(()=>m.change(changeWall(wall.guid,{joinSettings:defaultJoinSettings()})));assert.deepEqual(bytes(m),before);const re=await open(m.ed.save());assert.deepEqual(bytes(re),before);
 }
});
test('missing payload and duplicate settings are not hidden by default records',async()=>{
 for(const kind of ['missing','duplicate-property','duplicate-set']){
  const m=await model(),wall=readWalls(m.w())[0];m.w().run(w=>{
   w.upsertPset(wall.id,JOIN_PSET,kind==='missing'?[['Other','IFCTEXT','x']]:[['Settings','IFCTEXT',JSON.stringify(defaultJoinSettings())]]);
   if(kind==='duplicate-set')w.relateDef(wall.id,w.pset(JOIN_PSET,[['Settings','IFCTEXT','{}']]));
   if(kind==='duplicate-property'){const def=w.defs(wall.id).map(d=>w.api.GetLine(w.mid,d.def,false)).find(p=>p.Name?.value===JOIN_PSET),line=w.touch(def.expressID);line.HasProperties.push(line.HasProperties[0]);w.write(line);}
  });
  assert.ok(readJoinRecord(m.w(),wall.id).issue);const before=bytes(m);assert.throws(()=>m.change(changeWall(wall.guid,{height:2900})));assert.deepEqual(bytes(m),before);
 }
});
test('finish cycles preserve core reference lines, identities, openings, cavity and zero-membrane semantics',async()=>{
 let m=await model();const original=await model(),base=inspect(m),ids=base.walls.map(w=>w.guid),type=base.types.find(t=>t.key===A.key),target=base.walls.find(w=>w.justification==='coreCenter'&&w.extSide==='right');
 const initial=locationLine(target),initialDims=readWallDimensions(m.w()).map(d=>resolveDimension(d,readWalls(m.w())).value),opening=readOpenings(m.w());
 for(let k=0;k<10;k++){
  const t=readAssemblies(m.w()).find(t=>t.key===A.key);m.change(saveWallAssembly({...t,layers:t.layers.map((l,i)=>({...l,t:l.t+(i===0?.254:0)}))}));
  const after=inspect(m),stable=s=>({walls:s.walls.map(w=>({...w,assembly:w.assembly&&(({psetId,...x})=>x)(w.assembly)})),types:s.types.map(({psetId,...x})=>x),materials:s.materials,dims:s.dims,openings:s.openings,shapes:s.shapes,outlines:s.outlines});m.ed.undo();m.ed.redo();assert.deepEqual(stable(inspect(m)),stable(after));m=await open(m.ed.save());
  assert.deepEqual(inspect(m).diagnostics,[]);assert.deepEqual(readWalls(m.w()).map(w=>w.guid),ids);const now=readWalls(m.w()).find(w=>w.guid===target.guid),line=locationLine(now);
  // Reference LINE stays fixed; corner reintersection may slide its endpoint along the line.
  near(line.a[1],initial.a[1]);near(line.b[1],initial.b[1]);assert.equal(readAssemblies(m.w()).find(t=>t.key===A.key).guid,type.guid);
  const dims=readWallDimensions(m.w()).map(d=>resolveDimension(d,readWalls(m.w())));assert.ok(dims.every(d=>d.status==='ok'));near(dims[0].value,initialDims[0]);
  const ops=readOpenings(m.w());assert.deepEqual(ops.map(o=>[o.guid,o.wallGuid,o.width,o.height,o.sill]),opening.map(o=>[o.guid,o.wallGuid,o.width,o.height,o.sill]));
 }
 const types=readAssemblies(m.w());assert.ok(types.every(t=>t.layers.some(l=>l.kind==='cavity'&&l.t>0&&l.ventilation==='ventilated')&&t.layers.some(l=>l.function==='membrane'&&l.t===0)));
 assert.deepEqual(inspect(original),base);fs.writeFileSync(dir+'/edited.ifc',m.ed.save());fs.writeFileSync(dir+'/edited.json',JSON.stringify(inspect(m)));
});
test('fine/medium/coarse pieces share physical envelope and layer areas conserve disjoint T parts',async()=>{
 const m=await model(),s=inspect(m),polys=s.scene.walls;
 for(const row of polys){const sum=row.layers.reduce((s,l)=>s+l.polys.reduce((s,p)=>s+Math.abs(ringArea(p)),0),0),physical=row.pieces.reduce((s,p)=>s+Math.abs(ringArea(p)),0);near(sum,physical,.05);assert.ok(row.layers.filter(l=>l.thickness===0).every(l=>l.polys.length===0));}
 fs.writeFileSync(dir+'/plan.pdf',planPdf(s.scene,{paper:'a3',units:'mm',title:'F08-A supported straight joins'}).bytes);
});
test('material-default edit never resizes layers or moves anchors',async()=>{
 const m=await model(),before=inspect(m),mat=readMaterials(m.w()).find(m=>m.id==='material-studs');
 m.change(op(w=>saveMaterial(w,{...mat,defaultThickness:333,color:'#235e73'})));const after=inspect(m);assert.deepEqual(after.walls,before.walls);assert.deepEqual(after.anchors,before.anchors);
});
test('unrelated regeneration is idempotent and unrelated isolated original is unchanged',async()=>{
 const m=await model(),before=bytes(m);const stats=m.w().run(w=>{for(const st of new Set(readWalls(w).map(w=>w.storey)))assert.equal(regenWalls(w,st).walls,0);});assert.deepEqual(bytes(m),before);
});

test('unknown join metadata leaves affected persistent references unresolved without a stale value',async()=>{
 const m=await model(),d=readWallDimensions(m.w())[0],wall=readWalls(m.w()).find(w=>w.guid===d.refs[0].wall);
 m.w().run(w=>w.upsertPset(wall.id,JOIN_PSET,[['Settings','IFCTEXT',JSON.stringify({...defaultJoinSettings(),version:99})]]));
 const original=bytes(m),resolved=resolveDimension(d,readWalls(m.w()));assert.notEqual(resolved.status,'ok');assert.ok(!Number.isFinite(resolved.value));assert.deepEqual(bytes(m),original);
});

test('retained X and T topology survives disallow, finish offsets, reallow, Undo Redo and reopen',async()=>{
 const m=await model(),initial=readWalls(m.w()),tee=initial[9],host=initial[8],x=initial[10];
 for(const wall of [tee,x]){const settings={...wall.joinSettings,a:{...wall.joinSettings.a,allow:false}};m.change(changeWall(wall.guid,{joinSettings:settings}));}
 const type=readAssemblies(m.w()).find(t=>t.key===A.key);m.change(saveWallAssembly({...type,layers:type.layers.map((l,i)=>({...l,t:l.t+(i===0?6.35:0)}))}));
 for(const guid of [tee.guid,x.guid]){const wall=readWalls(m.w()).find(w=>w.guid===guid);m.change(changeWall(guid,{joinSettings:{...wall.joinSettings,a:{...wall.joinSettings.a,allow:true}}}));}
 assert.deepEqual(inspect(m).diagnostics,[]);const state=readWalls(m.w());assert.equal(state.find(w=>w.guid===tee.guid).joinSettings.a.tee,host.guid);assert.ok(state.find(w=>w.guid===x.guid).joinSettings.a.node);
 const logical=()=>readWalls(m.w()).map(w=>[w.guid,w.joinSettings]);const after=logical();m.ed.undo();m.ed.redo();assert.deepEqual(logical(),after);
 const re=await open(m.ed.save());assert.deepEqual(readWalls(re.w()).map(w=>[w.guid,w.joinSettings]),after);assert.deepEqual(inspect(re).diagnostics,[]);
});
test('selection order does not alter final type assignment, core axes or physical seams',async()=>{
 const first=await model(),second=await model(),guids=readWalls(first.w()).slice(0,2).map(w=>w.guid);
 first.change(changeWalls(guids,{typeKey:B.key}));second.change(changeWalls([...guids].reverse(),{typeKey:B.key}));
 const geometry=m=>readWalls(m.w()).map(w=>({guid:w.guid,a:w.a,b:w.b,typeKey:w.typeKey,joinSettings:w.joinSettings}));assert.deepEqual(geometry(first),geometry(second));
 assert.deepEqual(canonical(wallOutlines(readWalls(first.w()).map(w=>({...w,key:w.guid})))),canonical(wallOutlines(readWalls(second.w()).map(w=>({...w,key:w.guid})))));
});
