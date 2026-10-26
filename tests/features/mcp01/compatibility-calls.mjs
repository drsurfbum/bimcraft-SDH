/* SPDX-License-Identifier: Apache-2.0 */
import assert from 'node:assert/strict';
// Same real MCP calls on live, source stdio and an isolated extracted package.
export async function compatibilityCalls(call,check) {
 let s=await call('model_describe'),before=(await call('walls_list')).walls,w=before.find(w=>w.type==='wall-f04-rainscreen');assert.ok(w);
 const bind=()=>({documentId:s.documentId,expectedRevision:s.revision});
 for(const args of [
  {guid:w.guid,set:'CadCraft_Wall',property:'Height',value:9999},
  {guid:w.guid,set:'CadCraft_WallType',property:'Recipe',value:'{}',type:true},
  {guid:w.guid,attribute:'Name',value:'foreign',...bind(),documentId:'wrong-document'},
  {guid:w.guid,attribute:'Name',value:'stale',...bind(),expectedRevision:s.revision+100},
 ])await call('element_set',args,true);
 await call('elements_delete',{...bind(),guids:[w.guid,'missing']},true);
 await call('elements_move',{...bind(),guids:[w.guid],by:[100,200]},true);
 await call('wall_change',{...bind(),guid:w.guid,type:'wall-unknown'},true);
 assert.deepEqual((await call('walls_list')).walls,before);
 await call('element_set',{...bind(),guid:w.guid,attribute:'Name',value:'Compatibility temporary name'});
 s=await call('model_describe');const undo=await call('undo',bind());assert.equal(undo.undone.length,1);s=await call('model_describe');
 // Authored type assignment through the retained upstream wall route. No static enum/fallback.
 await call('wall_change',{...bind(),guid:w.guid,type:w.type});s=await call('model_describe');await call('undo',bind());
 assert.deepEqual((await call('walls_list')).walls,before);
 check('0.7 generic property/protected/binding/invalid-batch refusals and authored wall_change use the shared engine');
 s=await call('model_describe');
 const opening=before.flatMap(w=>w.openings).find(o=>o.kind==='door');assert.ok(opening);
 await call('opening_change',{...bind(),guid:opening.guid,width:opening.width-1});s=await call('model_describe');
 assert.equal((await call('walls_list')).walls.flatMap(w=>w.openings).find(o=>o.guid===opening.guid).width,opening.width-1);
 await call('undo',bind());s=await call('model_describe');assert.deepEqual((await call('walls_list')).walls,before);
 const floor=(await call('floor_add',{...bind(),points:[[100000,100000],[102000,100000],[102000,102000],[100000,102000]]})).floor;assert.ok(floor);
 s=await call('model_describe');assert.equal((await call('elements_move',{...bind(),guids:[floor],by:[123.123456,456.123456,0]})).moved,1);
 s=await call('model_describe');await call('undo',bind());s=await call('model_describe');
 assert.equal((await call('elements_delete',{...bind(),guids:[floor]})).deleted,1);
 s=await call('model_describe');await call('undo',bind());s=await call('model_describe');await call('undo',bind());
 assert.deepEqual((await call('walls_list')).walls,before);assert.equal((await call('model_describe')).floorsByOutline,s.floorsByOutline-1);
 check('retained opening edits and ordinary product movement/deletion succeed through real calls and Undo restores the fixture');
}
