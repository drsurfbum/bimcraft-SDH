/* SPDX-License-Identifier: Apache-2.0 */
// Test-only malformed records, written to local synthetic files, never exposed as semantic edit tools.
import fs from 'node:fs';
import path from 'node:path';
import { model } from '../f02/fixtures.mjs';
import { readAssemblyRecords } from '../../../app/wall-assemblies.js';
import { MATERIAL_PSET, readMaterials } from '../../../app/project-materials.js';
import { readWalls } from '../../../app/model-walls.js';
import { ids, val } from '../../../app/ifc-util.js';
export async function corruptFixtures(out) {
 const files=[];
 for(const kind of ['assembly-future','assembly-corrupt','assembly-core','assembly-material','materials-future','materials-corrupt','wall-location','wall-top']) {
  const m=await model(fs.readFileSync('fixtures/f04/layered-plans.ifc')),w=m.w();
  w.run(w=>{
   if(kind.startsWith('wall-')) {const wall=readWalls(w)[0];w.upsertPset(wall.id,'CadCraft_Wall',[[kind==='wall-location'?'Justification':'TopLevel','IFCIDENTIFIER',kind==='wall-location'?'future-anchor':'missing-top']]);}
   else if(kind.startsWith('materials'))w.upsertPset(ids(w.api,w.mid,'IFCPROJECT')[0],MATERIAL_PSET,[['Library','IFCTEXT',kind.endsWith('future')?JSON.stringify({version:99,materials:readMaterials(w)}):'{broken']]);
   else {
    const r=readAssemblyRecords(w)[0],ps=w.api.GetLine(w.mid,r.psetId,false),p=ps.HasProperties.map(h=>w.api.GetLine(w.mid,h.value,false)).find(p=>val(p.Name)==='Recipe');
    let record=JSON.parse(r.raw);
    if(kind==='assembly-future')record.version=99;
    if(kind==='assembly-core')record.layers=record.layers.map(l=>({...l,core:false}));
    if(kind==='assembly-material')record.layers[0].materialId='material-foreign';
    const q=w.touch(p.expressID);q.NominalValue=w.T('IFCTEXT',kind==='assembly-corrupt'?'{broken':JSON.stringify(record));w.write(q);
   }
   return {};
  });
  const file=path.join(out,kind+'.ifc');fs.writeFileSync(file,m.ed.save());files.push(file);
 }
 return files;
}
// Valid IFC sharing: an ordinary set aliases a property also owned by CadCraft_Wall.
export async function protectedAliasFixture(out) {
 const m=await model(fs.readFileSync('fixtures/f04/layered-plans.ifc')),w=m.w(),wall=readWalls(w)[0];
 w.run(w=>{const protectedSet=w.defNamed(wall.id,'CadCraft_Wall').line;
  const height=protectedSet.HasProperties.map(h=>w.api.GetLine(w.mid,h.value,false)).find(p=>val(p.Name)==='Height');
  if(!height)throw new Error('Required protected Height fixture property missing.');
  const id=w.upsertPset(wall.id,'OrdinaryAlias',[['Harmless','IFCLABEL','ok']]),set=w.touch(id);
  set.HasProperties.push(w.H(height.expressID));w.write(set);return{};
 });
 const file=path.join(out,'alias-source.ifc');fs.writeFileSync(file,m.ed.save());return{file,guid:wall.guid};
}
