/* SPDX-License-Identifier: Apache-2.0 */
// Same semantic calls against real stdio and HTTP/browser transports. No private model mutation.
import assert from 'node:assert/strict';
export const REQUIRED = ['materials_list','material_create','material_edit','assemblies_list','assembly_create','assembly_edit','assembly_duplicate','walls_edit','walls_add','walls_list','model_describe','redo'];
const near = (a,b) => assert.ok(Math.abs(a-b)<.005, `${a} != ${b}`);
const wallShape = walls => walls.map(({ id, ...w }) => w);
export async function workflow(call, check) {
  let state;
  const inspect = async () => (state = await call('model_describe', {}));
  const bind = () => ({ documentId: state.documentId, expectedRevision: state.revision });
  const edit = async (name, a) => { const r = await call(name, { ...bind(), ...a }); await inspect(); return r; };
  await inspect();
  const initial = await call('walls_list', {}), types = await call('assemblies_list', {});
  const source = types.assemblies.find(t=>t.key==='wall-f04-rainscreen'); assert.ok(source?.guid);
  assert.ok(state.types.walls.includes(source.key)); assert.equal(initial.units,'mm');
  check('discovery includes authored assemblies and exact instance values');
  await edit('assembly_duplicate', { sourceKey: source.key, sourceGuid: source.guid, key: 'wall-mcp01', name: 'MCP-01 independent rainscreen' });
  let copy = (await call('assemblies_list', {})).assemblies.find(t=>t.key==='wall-mcp01');
  assert.notEqual(copy.guid,source.guid); assert.deepEqual(copy.layers,source.layers);
  await call('undo', {}); await inspect(); assert.ok(!(await call('assemblies_list',{})).assemblies.some(t=>t.key===copy.key));
  await call('redo', {}); await inspect(); assert.equal((await call('assemblies_list',{})).assemblies.find(t=>t.key===copy.key).guid,copy.guid);
  check('duplicate has distinct stable identity through Undo/Redo');
  await edit('material_create', {id:'material-mcp01',name:'MCP-01 cladding',category:'Test',defaultThickness:19.123456,color:'#123456',fill:'diagonal',fillColor:'#abcdef',notes:'Synthetic acceptance material'});
  const layers = copy.layers.map((l,i)=>i===0?{...l,materialId:'material-mcp01',mat:'MCP-01 cladding',t:19.123456}:l);
  await edit('assembly_edit',{key:copy.key,typeGuid:copy.guid,changes:{layers}});
  copy=(await call('assemblies_list',{})).assemblies.find(t=>t.key===copy.key);
  assert.equal(copy.layers[0].t,19.123456);assert.ok(copy.layers.some(l=>l.t===0&&l.function==='membrane'));assert.ok(copy.layers.some(l=>l.kind==='cavity'&&l.ventilation==='ventilated'));
  await edit('assembly_create',{key:'wall-mcp01-unused',name:'MCP-01 unused definition',exterior:false,layers:[{mat:'MCP-01 cladding',materialId:'material-mcp01',kind:'material',t:100.123456,function:'structure',core:true}]});
  check('material and recipe create/edit preserve explicit layers, cavity ventilation and zero membranes');
  // Fixed independent geometry, away from the original house and from other new walls.
  const made=await edit('walls_add',{points:[[20000.000123,20000.000321],[25000.000123,20000.000321]],type:copy.key,height:2700.123456,baseOffset:.123456,locationLine:'coreCenter',exteriorSide:'right'});
  const newGuid=made.walls[0],newWall=(await call('walls_list',{})).walls.find(w=>w.guid===newGuid);
  near(newWall.reference.a[0],20000.000123);near(newWall.reference.a[1],20000.000321);near(newWall.height,2700.123456);assert.equal(newWall.exteriorSide,'right');
  const target=initial.walls.find(w=>w.type===source.key&&w.locationLine==='coreExterior');assert.ok(target);
  await edit('walls_edit',{walls:[target.guid],changes:{type:copy.key}});
  const assigned=(await call('walls_list',{})).walls.find(w=>w.guid===target.guid);assert.equal(assigned.type,copy.key);
  const beforeShared=(await call('walls_list',{})).walls;
  await edit('assembly_edit',{key:copy.key,typeGuid:copy.guid,changes:{layers:copy.layers.map((l,i)=>i===0?{...l,t:l.t+.012345}:l)}});
  const shared=(await call('walls_list',{})).walls;
  for(const before of beforeShared) {
    const after=shared.find(w=>w.guid===before.guid);
    near(after.length,before.length);assert.deepEqual(after.openings,before.openings);
    if(before.type===copy.key) {near(after.thickness,before.thickness+.012345);for(const end of ['a','b'])after.reference[end].forEach((v,i)=>near(v,before.reference[end][i]));}
    else assert.deepEqual(after,before);
  }
  assert.deepEqual((await call('assemblies_list',{})).assemblies.find(t=>t.key===source.key).layers,source.layers);
  check('assignment is instance-specific; shared edits keep core anchors, wall lengths and openings');
  const beforeDefault=(await call('walls_list',{})).walls;
  await edit('material_edit',{id:'material-mcp01',changes:{defaultThickness:222.123456,name:'MCP-01 renamed cladding'}});
  assert.deepEqual((await call('walls_list',{})).walls,beforeDefault);
  assert.equal((await call('materials_list',{})).materials.find(m=>m.id==='material-mcp01').defaultThickness,222.123456);
  await call('undo',{});await inspect();assert.equal((await call('materials_list',{})).materials.find(m=>m.id==='material-mcp01').defaultThickness,19.123456);
  await call('redo',{});await inspect();assert.equal((await call('materials_list',{})).materials.find(m=>m.id==='material-mcp01').defaultThickness,222.123456);
  assert.deepEqual((await call('walls_list',{})).walls,beforeDefault);
  check('material defaults never resize existing layers; exact defaults survive Undo/Redo');
  for(const [i,locationLine] of ['center','exterior','interior','coreCenter','coreExterior','coreInterior'].entries()) for(const [j,exteriorSide] of ['left','right'].entries()) {
    const x=30000+j*5000,y=30000+i*1000;
    const r=await edit('walls_add',{points:[[x,y],[x+3000,y]],type:copy.key,height:2600.012345,locationLine,exteriorSide});
    const w=(await call('walls_list',{})).walls.find(w=>w.guid===r.walls[0]);
    assert.equal(w.locationLine,locationLine);assert.equal(w.exteriorSide,exteriorSide);near(w.reference.a[0],x);near(w.reference.a[1],y);
  }
  await call('levels_add',{elevations:[6000]});await inspect();const top=state.levels.find(l=>l.elevation===6000);
  const placed=await edit('walls_add',{points:[[40000,40000],[44000,40000]],type:copy.key,topLevel:top.guid,baseOffset:12.123456,topOffset:-30.123456,locationLine:'coreExterior'});
  const wall=(await call('walls_list',{})).walls.find(w=>w.guid===placed.walls[0]);near(wall.height,6000-12.123456-30.123456);assert.equal(wall.topLevel,top.guid);
  await edit('walls_edit',{walls:[wall.guid],changes:{height:3100.012345,baseOffset:1.123456,locationLine:'coreInterior',exteriorSide:'right'}});
  const changed=(await call('walls_list',{})).walls.find(w=>w.guid===wall.guid);assert.equal(changed.topLevel,'');near(changed.height,3100.012345);
  check('all six location lines × both exterior sides and level/fixed instance heights');
  // Dispatcher-level failures must leave every material/type/wall intact, including valid-first invalid-second batches.
  const semantic=async()=>({walls:wallShape((await call('walls_list',{})).walls),materials:(await call('materials_list',{})).materials,types:(await call('assemblies_list',{})).assemblies});
  const before=await semantic(),stale={...bind(),expectedRevision:state.revision-1};
  for(const [name,args] of [
    ['walls_edit',{...bind(),walls:[newGuid,'foreign-wall-id'],changes:{height:2900}}],
    ['walls_edit',{...bind(),walls:[newGuid,newGuid],changes:{height:2900}}],
    ['walls_edit',{...stale,walls:[newGuid],changes:{height:2900}}],
    ['walls_edit',{...bind(),documentId:'foreign-document',walls:[newGuid],changes:{height:2900}}],
    ['walls_edit',{...bind(),walls:[newGuid],changes:{type:'wall-missing'}}],
    ['walls_edit',{...bind(),walls:[newGuid],changes:{topLevel:'foreign-level'}}],
    ['walls_edit',{...bind(),walls:[newGuid],changes:{height:2900,topLevel:top.guid}}],
    ['walls_add',{...bind(),points:[[0,0],[100,0]],type:'wall-missing'}],
    ['walls_add',{points:[[0,0],[100,0]],type:copy.key}],
    ['material_edit',{id:'material-mcp01',changes:{defaultThickness:4}}],
    ['walls_add',{...bind(),points:[[0,0],[100,0],[100,0]],type:copy.key}],
    ['walls_add',{...bind(),points:[[0,0],[100,0]],type:copy.key,locationLine:'bogus'}],
    ['assembly_edit',{...bind(),key:copy.key,typeGuid:source.guid,changes:{name:'Wrong ID'}}],
    ['assembly_edit',{...bind(),key:copy.key,typeGuid:copy.guid,changes:{layers:layers.map(l=>({...l,core:false}))}}],
    ['assembly_edit',{...bind(),key:copy.key,typeGuid:copy.guid,changes:{layers:layers.map((l,i)=>i===0?{...l,materialId:'material-missing'}:l)}}],
    ['assembly_edit',{...bind(),key:copy.key,typeGuid:copy.guid,changes:{layers:layers.map((l,i)=>i===0?{...l,t:0}:l)}}],
    ['assembly_edit',{...bind(),key:copy.key,typeGuid:copy.guid,changes:{layers:layers.map((l,i)=>i===0?{...l,materialId:null}:l)}}],
    ['material_edit',{...bind(),id:'material-missing',changes:{name:'Missing'}}],
    ['material_edit',{...bind(),id:'material-mcp01',changes:{defaultThickness:-1}}],
    ['material_edit',{...bind(),id:'material-mcp01',changes:{rawMetadata:'escape'}}],
    ['assembly_duplicate',{...bind(),sourceKey:copy.key,sourceGuid:copy.guid,key:copy.key,name:'Colliding identity'}],
  ]) { await call(name,args,true);assert.deepEqual(await semantic(),before); }
  check('21 invalid/stale/foreign/schema/core/material failures leave no partial semantic edits');
  const materials=(await call('materials_list',{})).materials,assemblies=(await call('assemblies_list',{})).assemblies;
  return {walls:(await call('walls_list',{})).walls,materials,assemblies,initialWalls:initial.walls,documentId:state.documentId,revision:state.revision};
}
