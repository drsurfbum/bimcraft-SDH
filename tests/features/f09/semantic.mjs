/* SPDX-License-Identifier: Apache-2.0 */
// Real MCP initialization/discovery/calls, used unchanged by source and isolated packaged consumers.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readOpenings } from '../../../app/model-openings.js';
import { execFileSync } from 'node:child_process';
import { buildMirror } from '../../../devshell/test.mjs';
import { stdio, initialized, tool } from '../mcp01/client.mjs';
import { model } from '../f04/fixture.mjs';
import { readWalls } from '../../../app/model-walls.js';
import { referencePoint, WALL_REFERENCES } from '../../../app/wall-dimensions.js';
import { modelTools } from '../../../app/agents.js';
export async function workflow(call, wall, other, expected, check) {
  let state=await call('model_describe');
  const bind=()=>({documentId:state.documentId,expectedRevision:state.revision});
  for(const reference of WALL_REFERENCES){
    const r=await call('wall_reference_resolve',{...bind(),wall,reference,station:.3728282828});
    assert.deepEqual(r.p,expected[reference]);assert.equal(r.geometry,'analytic-wall-reference');assert.equal(r.persistent,false);assert.equal(r.units,'mm');assert.equal(r.frame,'storey-plan');assert.ok(state.levels.some(l=>l.guid===r.level));
  }
  assert.deepEqual(await call('model_describe'),state);check('six exact analytic references through real transport; no history or model changes');
  const args={...bind(),wall,reference:'coreExterior',station:.3728282828};
  for(const bad of [{documentId:'foreign-document'},{expectedRevision:state.revision+1},{station:-.01},{station:1.01},{reference:'physical-face'},{wall:'0F09W00000000000000001'},{unexpected:true}])await call('wall_reference_resolve',{...args,...bad},true);
  const {expectedRevision,...missing}=args;await call('wall_reference_resolve',missing,true);
  assert.deepEqual(await call('model_describe'),state);check('actual strict schema, missing binding, foreign host and stale revision refusals');
  const placementTarget=await call('wall_reference_resolve',args),type=(await call('walls_list')).walls.find(w=>w.guid===wall).type;
  const placed=await call('walls_add',{...bind(),level:placementTarget.level,type,locationLine:'center',exteriorSide:'left',height:2700.123456,points:[placementTarget.p,[placementTarget.p[0]+1200.123456,placementTarget.p[1]+900.123456]]});
  assert.equal(placed.walls.length,1);const made=placed.values.find(w=>w.guid===placed.walls[0]);for(let i=0;i<2;i++)assert.ok(Math.abs(made.a[i]-placementTarget.p[i])<.005);
  state=await call('model_describe');await call('undo',{...bind(),steps:1});state=await call('model_describe');
  assert.ok(!(await call('walls_list')).walls.some(w=>w.guid===placed.walls[0]));check('explicit raw-mm target drives existing custom-type wall placement and atomic Undo');
  // Refresh binding after the intentional placement/Undo cycle.
  Object.assign(args,bind());
  const before=(await call('walls_list')).walls.find(w=>w.guid===other);
  const target=await call('wall_reference_resolve',args),old=await call('wall_joins_get',{documentId:state.documentId,wall:other});
  const dx=target.p[0]-before.a[0],dy=target.p[1]-before.a[1];
  const changes={a:target.p,b:[before.b[0]+dx,before.b[1]+dy]};
  const r=await call('wall_change',{...bind(),guid:other,...changes});
  assert.equal(r.guid,other);for(let i=0;i<2;i++)assert.ok(Math.abs(r.a[i]-changes.a[i])<.005);
  state=await call('model_describe');await call('wall_reference_resolve',args,true);
  await call('undo',{...bind(),steps:1});state=await call('model_describe');
  const undone=await call('wall_joins_get',{documentId:state.documentId,wall:other});assert.deepEqual(undone.geometry,old.geometry);
  await call('redo',bind());state=await call('model_describe');
  const moved=await call('wall_joins_get',{documentId:state.documentId,wall:other});
  assert.ok(Math.abs(moved.geometry.a[0]-changes.a[0])<.005);assert.deepEqual(moved.record,old.record);
  check('resolve → existing wall_change → exact readback → Undo/Redo retains accepted joins and revision guards');
  return {state,wall:other,...changes};
}
export async function source() {
  buildMirror();
  const out=path.resolve(process.env.F09_MCP_OUT||'.cc-test/f09-source');fs.mkdirSync(out,{recursive:true});
  const file=path.join(out,'input.ifc');fs.copyFileSync('fixtures/f04/layered-plans.ifc',file);
  const m=await model(),walls=readWalls(m.w()),wall=walls[0],other=walls.findLast(w=>w.guid!==wall.guid&&!w.bulge&&!readOpenings(m.w()).some(o=>o.wallGuid===w.guid));
  const expected=Object.fromEntries(WALL_REFERENCES.map(reference=>[reference,referencePoint({wall:wall.guid,reference,station:.3728282828},walls)]));
  const server=path.resolve(process.env.F09_MCP_SERVER||'.cc-test/tools/mcp/server.mjs'),client=stdio(server,out),checks=[];
  const check=s=>{checks.push(s);console.log('PASS',s);};
  try {
    await initialized(client);const catalog=(await client.request('tools/list')).result.tools;
    for(const name of ['wall_reference_resolve','wall_joins_get','wall_join_end_set','wall_join_diagnostics','materials_list','assemblies_list','walls_edit'])assert.ok(catalog.some(t=>t.name===name),name);
    const actual=catalog.find(t=>t.name==='wall_reference_resolve'),definition=modelTools({ed:()=>null}).find(t=>t.name===actual.name);
    const {doc,...properties}=actual.inputSchema.properties;assert.ok(doc);
    assert.deepEqual({...actual.inputSchema,properties,required:actual.inputSchema.required.filter(k=>k!=='doc')},definition.inputSchema);
    fs.writeFileSync(path.join(out,'catalog.json'),JSON.stringify(actual,null,2));
    const handle=(await tool(client,'ifc_open',{path:file})).doc,foreign=(await tool(client,'ifc_open',{path:file})).doc;
    const call=(name,args={},fails=false)=>tool(client,name,{doc:handle,...args},fails);
    const result=await workflow(call,wall.guid,other.guid,expected,check);
    const untouched=await tool(client,'model_describe',{doc:foreign});
    await tool(client,'wall_reference_resolve',{doc:foreign,documentId:result.state.documentId,expectedRevision:untouched.revision,wall:wall.guid,reference:'coreCenter',station:.5},true);
    assert.deepEqual(await tool(client,'model_describe',{doc:foreign}),untouched);
    const saved=path.join(out,'saved.ifc');await call('ifc_save',{path:saved});
    const reopened=(await tool(client,'ifc_open',{path:saved})).doc,state=await tool(client,'model_describe',{doc:reopened});
    const read=await tool(client,'wall_reference_resolve',{doc:reopened,documentId:state.documentId,expectedRevision:state.revision,wall:other.guid,reference:'center',station:0});
    for(let i=0;i<2;i++)assert.ok(Math.abs(read.p[i]-result.a[i])<.005);
    check('foreign identical project remains unchanged; actual IFC save/reopen resolves precise moved reference');
    const readonly=stdio(server,out,'read');try{
      await initialized(readonly);const h=(await tool(readonly,'ifc_open',{path:file})).doc,s=await tool(readonly,'model_describe',{doc:h});
      await tool(readonly,'wall_reference_resolve',{doc:h,documentId:s.documentId,expectedRevision:s.revision,wall:wall.guid,reference:'interior',station:.5});
      await tool(readonly,'wall_change',{doc:h,documentId:s.documentId,expectedRevision:s.revision,guid:wall.guid,a:[1,2]},true);
    }finally{await readonly.close();}
    check('read-only permission admits resolution and refuses model mutation');
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'PASS',head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),transport:process.env.F09_MCP_SERVER?'isolated packaged stdio':'source stdio',checks},null,2));
  }finally{await client.close();}
}
if(process.argv[1]===fileURLToPath(import.meta.url))await source();
