/* SPDX-License-Identifier: Apache-2.0 */
import assert from 'node:assert/strict';
export const REQUIRED=['wall_joins_get','wall_join_end_set','wall_join_diagnostics'];
const binding=s=>({documentId:s.documentId,expectedRevision:s.revision});
const physical=r=>r.geometry.physical;
export async function semanticWorkflow(call,info,check,hooks={}) {
 let state=await call('model_describe');
 const get=wall=>call('wall_joins_get',{documentId:state.documentId,wall});
 const edit=async(wall,end,patch)=>{state=await call('model_describe');return call('wall_join_end_set',{...binding(state),wall,end,patch});};
 const first=await get(info.a);assert.equal(first.record.classification,'supported');assert.equal(first.ends.a.id,info.a+':a');
 assert.equal(first.units,'mm');assert.deepEqual((await call('wall_join_diagnostics',{documentId:state.documentId,storey:info.level})).diagnostics,[]);
 assert.deepEqual(await get(info.a),first);check('nonmutating semantic readback and complete-storey diagnostic scope');
 const tee=await get(info.tee);assert.ok(tee.ends.a.tee);
 await edit(info.tee,'b',{cap:'square'});const teeAfter=await get(info.tee);assert.deepEqual(teeAfter.ends.a,tee.ends.a);
 await edit(info.tee,'b',{cap:'envelope'});
 check('internal T host relation survives an edit to the other stable end');
 for(const end of ['a','b'])for(const allow of [false,true])for(const cap of ['square','envelope']){
  const wall=info[end];
  await edit(wall,end,{allow:!allow,cap:cap==='square'?'envelope':'square'});
  const before=await get(wall),r=await edit(wall,end,{allow,cap}),after=await get(wall),other=end==='a'?'b':'a';
  assert.equal(r.changed,true);assert.equal(r.completedSteps,1);assert.ok(r.affectedWalls.includes(wall));
  assert.deepEqual(after.ends[other],before.ends[other]);assert.equal(after.ends[end].allow,allow);assert.equal(after.ends[end].cap,cap);
  for(const key of ['node','tee'])assert.equal(after.ends[end][key],before.ends[end][key]);
  if(allow&&cap==='envelope')assert.notDeepEqual(physical(after),physical(before));
  for(let i=0;i<3;i++){
   state=await call('model_describe');await call('undo',{...binding(state),steps:1});assert.deepEqual(physical(await get(wall)),physical(before));
   state=await call('model_describe');await call('redo',binding(state));assert.deepEqual(physical(await get(wall)),physical(after));
  }
  const noop=await edit(wall,end,{allow,cap});assert.equal(noop.changed,false);assert.equal(noop.completedSteps,0);
 }
 check('both physically joined analytic ends × all allow/cap combinations; 24 real Undo/Redo cycles; genuine no-ops');
 state=await call('model_describe');const before=await get(info.a),invalidSnapshot=await hooks.protectedSnapshot?.();
 for(const patch of [{},{allow:'false'},{cap:'wrap'},{node:'injected'},{tee:info.b},{allow:false,other:1}])await call('wall_join_end_set',{...binding(state),wall:info.a,end:'a',patch},true);
 for(const extra of [{end:'c'},{documentId:'foreign-document'},{expectedRevision:state.revision-1},{expectedRevision:null},{expectedRevision:.5},{wall:'0F08M99999999999999999'}])await call('wall_join_end_set',{...binding(state),wall:info.a,end:'a',patch:{allow:false},...extra},true);
 for(const scope of [{},{walls:[info.a],storey:info.level},{walls:[info.a,info.a]}])await call('wall_join_diagnostics',{documentId:state.documentId,...scope},true);
 assert.deepEqual(await get(info.a),before);if(hooks.protectedSnapshot)assert.deepEqual(await hooks.protectedSnapshot(),invalidSnapshot);check('invalid patches, relation injection, duplicate scope, stale revisions and foreign IDs refuse without readback changes');
 // Keep a live Redo entry across both generic-write refusals, then prove ordinary replay still works.
 await edit(info.a,'a',{allow:false});state=await call('model_describe');await call('undo',{...binding(state),steps:1});state=await call('model_describe');const protectedBefore=await get(info.a);
 const protectedSnapshot=await hooks.protectedSnapshot?.();
 const payload=JSON.stringify({...protectedBefore.record.effective,a:{...protectedBefore.record.effective.a,allow:false}});
 for(const set of ['CadCraft_WallJoin','OrdinaryJoinAlias']){
  const r=await call('element_set',{...binding(state),guid:info.a,set,property:'Settings',value:payload},true);
  assert.match(JSON.stringify(r),/protected model record/);assert.deepEqual(await get(info.a),protectedBefore);if(hooks.protectedSnapshot)assert.deepEqual(await hooks.protectedSnapshot(),protectedSnapshot);
 }
 await call('redo',binding(state));assert.equal((await get(info.a)).ends.a.allow,false);
 state=await call('model_describe');await call('undo',{...binding(state),steps:1});assert.deepEqual(physical(await get(info.a)),physical(protectedBefore));
 check('specific protected-record refusals for real direct and correctly resolved alias properties; Redo and Undo remain usable');
 await edit(info.a,'a',{allow:true,cap:'envelope'});await edit(info.b,'b',{allow:true,cap:'envelope'});
 state=await call('model_describe');const walls=(await call('walls_list')).walls,readbacks=[];
 for(const wall of walls)readbacks.push(await get(wall.guid));
 return {state,walls,readbacks};
}
